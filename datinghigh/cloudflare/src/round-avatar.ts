import {z} from 'zod';
import {executeCommand} from './commands';
import {readReadyAvatarPack} from './avatar-expression-store';
import {expressionIds,type AvatarExpressionManifest} from './avatar-expression-manifest';
import type {PlatformEnv} from './platform';
import {builtinAvatarPack,type BuiltinAvatarPack} from './builtin-avatar';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const hash=z.string().regex(/^[0-9a-f]{64}$/);
const authSchema=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().positive()});
type Auth=z.infer<typeof authSchema>;
type Target={kind:'round';roundId:string}|{kind:'owner';assetId:string}|{kind:'current'};
type Context={owner:string;assetId:string;fingerprint:string;builtinId?:string};
export class AvatarReadError extends Error{constructor(public code:string,public status=403){super(code);}}
async function authorize(env:PlatformEnv,auth:Auth,now:number){if((await executeCommand(env.DB,'session.validate',auth,now)).rows.length!==1)throw new AvatarReadError('SESSION_REVOKED',401);}
async function context(env:PlatformEnv,auth:Auth,target:Target,now:number):Promise<Context>{
 await authorize(env,auth,now);
 if(target.kind==='current'){
  const profile=await env.DB.prepare('SELECT selected_avatar_type,selected_avatar_ref FROM user_profiles WHERE account_id=?').bind(auth.accountId).first<{selected_avatar_type:string;selected_avatar_ref:string}>();
  if(profile?.selected_avatar_type==='builtin'&&builtinAvatarPack(profile.selected_avatar_ref))return {owner:auth.accountId,assetId:profile.selected_avatar_ref,builtinId:profile.selected_avatar_ref,fingerprint:auth.accountId+'/builtin/'+profile.selected_avatar_ref};
  if(profile?.selected_avatar_type!=='generated')throw new AvatarReadError('OWN_AVATAR_PACK_NOT_READY',409);
  const asset=await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='ready' AND deleted_at IS NULL AND object_key=?").bind(profile.selected_avatar_ref,auth.accountId,`private/${auth.accountId}/avatar/${profile.selected_avatar_ref}`).first();
  if(!asset)throw new AvatarReadError('OWN_AVATAR_PACK_NOT_READY',409);
  return {owner:auth.accountId,assetId:profile.selected_avatar_ref,fingerprint:auth.accountId+'/generated/'+profile.selected_avatar_ref};
 }
 if(target.kind==='owner'){
  const asset=await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='ready' AND deleted_at IS NULL AND object_key=?").bind(target.assetId,auth.accountId,`private/${auth.accountId}/avatar/${target.assetId}`).first();
  if(!asset)throw new AvatarReadError('AVATAR_NOT_FOUND',404);
  return {owner:auth.accountId,assetId:target.assetId,fingerprint:auth.accountId+'/'+target.assetId};
 }
 const rows=(await executeCommand(env.DB,'game.round.get',{...auth,roundId:target.roundId},now)).rows as {candidate_id:string;selected_avatar_type:string;selected_avatar_ref:string}[];
 if(rows.length!==1)throw new AvatarReadError('RESOURCE_FORBIDDEN',403);
 const partner=rows[0];
 if(partner.selected_avatar_type==='builtin')return {owner:'',assetId:partner.selected_avatar_ref,builtinId:partner.selected_avatar_ref,fingerprint:partner.candidate_id+'/builtin/'+partner.selected_avatar_ref};
 if(partner.selected_avatar_type!=='generated')throw new AvatarReadError('AVATAR_PACK_NOT_READY',409);
 const source=await env.DB.prepare("SELECT p.account_id FROM user_profiles p JOIN user_media_assets m ON m.account_id=p.account_id AND m.asset_id=p.selected_avatar_ref WHERE p.profile_id=? AND p.selected_avatar_type='generated' AND p.selected_avatar_ref=? AND m.kind='generated_avatar' AND m.status='ready' AND m.deleted_at IS NULL AND m.object_key='private/'||p.account_id||'/avatar/'||m.asset_id").bind(partner.candidate_id,partner.selected_avatar_ref).first<{account_id:string}>();
 if(!source)throw new AvatarReadError('AVATAR_PACK_NOT_READY',409);
 return {owner:source.account_id,assetId:partner.selected_avatar_ref,fingerprint:partner.candidate_id+'/'+source.account_id+'/'+partner.selected_avatar_ref};
}
const digest=async(bytes:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
async function version(m:AvatarExpressionManifest|BuiltinAvatarPack){return digest(new TextEncoder().encode(JSON.stringify([m.avatarAssetId,m.expressionSpecVersion,m.avatarAssetSpecVersion,...expressionIds.map(e=>m.expressions[e].sha256)])).buffer);}
async function load(env:PlatformEnv,auth:Auth,target:Target,time:()=>number){
 const source=await context(env,auth,target,time());
 let manifest:AvatarExpressionManifest|BuiltinAvatarPack;
 if(source.builtinId){const builtin=builtinAvatarPack(source.builtinId);if(!builtin)throw new AvatarReadError('AVATAR_PACK_NOT_READY',409);if(await version(builtin)!==builtin.avatarVersion)throw new AvatarReadError('AVATAR_PACK_UNAVAILABLE',503);manifest=builtin;}
 else try{manifest=await readReadyAvatarPack(env.FILES,source.owner,source.assetId);}catch{throw new AvatarReadError('AVATAR_PACK_UNAVAILABLE',503);}
 return {source,manifest,avatarVersion:await version(manifest)};
}
function targetInput(command:string,input:unknown){
 const own=(p:Auth)=>authSchema.parse({accountId:p.accountId,sessionId:p.sessionId,cv:p.cv,accessExpiresAt:p.accessExpiresAt});
 if(command==='avatar.round.projection'){const p=authSchema.extend({roundId:id}).parse(input);return {auth:own(p),target:{kind:'round',roundId:p.roundId} as Target};}
 if(command==='avatar.expression.projection'){const p=authSchema.extend({assetId:id}).parse(input);return {auth:own(p),target:{kind:'owner',assetId:p.assetId} as Target};}
 throw new AvatarReadError('INVALID_REQUEST',400);
}
/** 只投影已正式採用的版本／授權 URL；私人 owner、source、objectKey、provider metadata 留在 Worker。 */
export async function avatarProjection(command:string,input:unknown,env:PlatformEnv,now:number){
 const {auth,target}=targetInput(command,input),started=Date.now(),time=()=>now+Math.max(0,Date.now()-started);
 const {source,manifest,avatarVersion}=await load(env,auth,target,time);
 const checked=await context(env,auth,target,time());if(checked.fingerprint!==source.fingerprint)throw new AvatarReadError('AVATAR_VERSION_CONFLICT',409);
 const prefix=target.kind==='round'?`/api/v1/game-rounds/${target.roundId}/partner-avatar`:`/api/v1/me/avatar/assets/${source.assetId}/expressions`;
 const expressions=Object.fromEntries(expressionIds.map(e=>{const image=manifest.expressions[e];return [e,{url:`${prefix}/${avatarVersion}/${e}`,sha256:image.sha256,mimeType:image.mimeType,width:image.width,height:image.height,byteSize:image.byteSize}];}));
 return {avatarAssetId:manifest.avatarAssetId,avatarVersion,expressionSpecVersion:manifest.expressionSpecVersion,avatarAssetSpecVersion:manifest.avatarAssetSpecVersion,framing:manifest.framing,pose:manifest.pose,stageAnchors:manifest.stageAnchors,expressions};
}
/** 遊戲入口只驗本人當下採用者；不讀取另一組 pending 化身，也不回傳私人素材 metadata。 */
export async function currentAvatarReadiness(input:unknown,env:PlatformEnv,now:number){
 const auth=authSchema.parse(input),started=Date.now(),time=()=>now+Math.max(0,Date.now()-started),target:Target={kind:'current'};
 const source=await context(env,auth,target,time());
 try{
  if(!source.builtinId){
   let manifest:AvatarExpressionManifest;
   try{manifest=await readReadyAvatarPack(env.FILES,source.owner,source.assetId);}catch{throw new AvatarReadError('OWN_AVATAR_PACK_NOT_READY',409);}
   // 發佈時已驗 SHA；入口以五個不可變物件的存在、大小與 MIME 確認完整性，不下載整組圖片。
   for(const expression of expressionIds){const image=manifest.expressions[expression],object=await env.FILES.head(image.objectKey);if(!object||object.size!==image.byteSize||object.httpMetadata?.contentType!==image.mimeType)throw new AvatarReadError('OWN_AVATAR_PACK_NOT_READY',409);}
  }
 }finally{
  const checked=await context(env,auth,target,time());if(checked.fingerprint!==source.fingerprint)throw new AvatarReadError('OWN_AVATAR_PACK_NOT_READY',409);
 }
 return {ready:true};
}
/** 每個 binary read 都重新驗目前選用與同輪權限；SHA 不等於授權，舊 URL 不能跨 ended／撤銷／切角。 */
export async function avatarReadMedia(request:Request,env:PlatformEnv,now:number){
 const url=new URL(request.url),parts=url.pathname.split('/');
 if(request.method!=='GET'||url.search||parts.length!==7)throw new AvatarReadError('NOT_FOUND',404);
 const target:Target=parts[3]==='rounds'?{kind:'round',roundId:id.parse(parts[4])}:parts[3]==='assets'?{kind:'owner',assetId:id.parse(parts[4])}:(()=>{throw new AvatarReadError('NOT_FOUND',404);})();
 const expected=hash.parse(parts[5]),expression=z.enum(expressionIds).parse(parts[6]);
 const auth=authSchema.parse({accountId:request.headers.get('X-DatingHigh-Media-Account-Id'),sessionId:request.headers.get('X-DatingHigh-Media-Session-Id'),cv:Number(request.headers.get('X-DatingHigh-Media-Cv')),accessExpiresAt:Number(request.headers.get('X-DatingHigh-Media-Expires-At'))});
 const started=Date.now(),time=()=>now+Math.max(0,Date.now()-started),{source,manifest,avatarVersion}=await load(env,auth,target,time);
 if(avatarVersion!==expected)throw new AvatarReadError('AVATAR_VERSION_CONFLICT',409);
 const image=manifest.expressions[expression];let bytes:ArrayBuffer;
 if('objectKey' in image){const object=await env.FILES.get(image.objectKey);if(!object||object.size!==image.byteSize||object.httpMetadata?.contentType!==image.mimeType)throw new AvatarReadError('AVATAR_PACK_UNAVAILABLE',503);bytes=await object.arrayBuffer();}
 else {if(!env.ASSETS)throw new AvatarReadError('AVATAR_PACK_UNAVAILABLE',503);const response=await env.ASSETS.fetch(new Request('https://datinghigh-assets.internal'+image.url));if(!response.ok||response.headers.get('Content-Type')?.split(';')[0]!==image.mimeType)throw new AvatarReadError('AVATAR_PACK_UNAVAILABLE',503);bytes=await response.arrayBuffer();}
 if(bytes.byteLength!==image.byteSize||await digest(bytes)!==image.sha256)throw new AvatarReadError('AVATAR_PACK_UNAVAILABLE',503);
 const checked=await context(env,auth,target,time());if(checked.fingerprint!==source.fingerprint)throw new AvatarReadError('AVATAR_VERSION_CONFLICT',409);
 return new Response(bytes,{headers:{'Content-Type':image.mimeType,'Content-Length':String(bytes.byteLength),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
}
