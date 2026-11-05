import {cleanupMedia} from './media-cleanup';
import { z } from 'zod';
import { executeCommand, planCommand } from './commands';
import {parseStrictJson} from './strict-json';
import {avatarCommand,avatarMedia,AvatarError} from './avatar-attempts';
export interface PlatformEnv {
 DB:D1Database;FILES:R2Bucket;APP_ENV:string;EmailDeliveryMode:string;EXPECTED_MIGRATION:string;
 EMAIL?:{send(message:{to:string,from:string,subject:string,text:string}):Promise<{messageId:string}>};EMAIL_FROM?:string;
}
export const probeText='datinghigh-foundation-v1';
export const probeKey='_system/foundation/probe.txt';
export class PlatformError extends Error {constructor(public code:string,public status=400){super(code);}}
export const problem=(code:string,status=400)=>Response.json({type:`urn:datinghigh:problem:${code.toLowerCase().replaceAll('_','-')}`,title:status>=500?'服務暫時無法使用，請稍後再試':'請確認請求',status,code,traceId:crypto.randomUUID()},{status,headers:{'Content-Type':'application/problem+json','Cache-Control':'no-store'}});
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const auth={accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int()};
const privateInput=z.strictObject({...auth,purpose:z.literal('foundation-test'),objectId:id,content:z.string().max(12000).optional()});
export async function ready(env:PlatformEnv){
 if(!['local','staging','production'].includes(env.APP_ENV) || (env.APP_ENV==='local'?env.EmailDeliveryMode!=='Log':env.EmailDeliveryMode!=='Cloudflare'||!env.EMAIL||!env.EMAIL_FROM)) throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 const migration=await env.DB.prepare('SELECT name FROM d1_migrations WHERE name=?').bind(env.EXPECTED_MIGRATION).first();
 if(!migration) throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 const expected:Record<string,string>={
  auth_accounts:'account_id,email_normalized,email_verified_at,password_hash,status,credential_version,created_at,updated_at',
  auth_external_identities:'identity_id,account_id,provider,subject,created_at',
  auth_sessions:'session_id,account_id,client_platform,credential_version,current_generation,created_at,absolute_expires_at,idle_expires_at,revoked_at,revocation_reason',
  auth_refresh_tokens:'token_id,session_id,token_hash,generation,created_at,expires_at,consumed_at,replaced_by_token_id',
  auth_email_challenges:'challenge_id,purpose,email_normalized,client_platform,flow_token_hash,code_mac,generation,failed_attempts,account_id,bound_credential_version,state,created_at,expires_at,absolute_expires_at,resend_after,consumed_at',
  common_rate_limit_buckets:'bucket_id,policy_key,subject_type,subject_hash,window_start,attempt_count,expires_at',
 };
 if(env.EXPECTED_MIGRATION==='0002_avatar_preferences.sql'){
  expected.user_profiles='profile_id,account_id,nickname,bio,occupation,birth_date,region_code,traits_json,interests_json,preferences_json,selected_avatar_type,selected_avatar_ref,revision,created_at,updated_at';
  expected.user_media_assets='asset_id,account_id,kind,object_key,mime_type,display_order,status,created_at,deleted_at';
 }
 for(const [table,names] of Object.entries(expected)){
  const columns=await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  if(columns.results.map(column=>column.name).join(',')!==names || columns.results[0].pk!==1 || columns.results[0].notnull!==1) throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 }
 const index=await env.DB.prepare("SELECT sql FROM sqlite_master WHERE name='idx_auth_sessions_active_account'").first<{sql:string}>();
 if(!index?.sql.includes('CREATE UNIQUE INDEX')||!index.sql.includes('WHERE revoked_at IS NULL')) throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 const object=await env.FILES.get(probeKey);if(!object || await object.text()!==probeText) throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 return {status:'ready',probe:probeText};
}
export async function cleanup(env:Pick<PlatformEnv,'DB'> & Partial<Pick<PlatformEnv,'FILES'>>,now=Date.now(),budget=20000){
 const started=Date.now();let deleted=0;let backlog=false;
 const hasMedia=!!env.FILES&&!!await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_media_assets'").first();
 const authBudget=hasMedia?budget/3:budget;
 const plans=[
  ['DELETE FROM common_rate_limit_buckets WHERE bucket_id IN(SELECT bucket_id FROM common_rate_limit_buckets WHERE expires_at<=? LIMIT 1000)',now],
  // 每小時執行，提前一小時進入清理窗，確保絕對到期後至多 24 小時移除。
  ['DELETE FROM auth_email_challenges WHERE challenge_id IN(SELECT challenge_id FROM auth_email_challenges WHERE absolute_expires_at<=? LIMIT 1000)',now-82800000],
  // 一個 family 可能有超過 1000 個 tokens；先解開即將清理的 self-reference，再分批刪。
  ['UPDATE auth_refresh_tokens SET replaced_by_token_id=NULL WHERE token_id IN(SELECT t.token_id FROM auth_refresh_tokens t JOIN auth_sessions s ON s.session_id=t.session_id WHERE s.absolute_expires_at<=? AND t.replaced_by_token_id IS NOT NULL LIMIT 1000)',now-604800000],
  ['DELETE FROM auth_refresh_tokens WHERE token_id IN(SELECT t.token_id FROM auth_refresh_tokens t JOIN auth_sessions s ON s.session_id=t.session_id WHERE s.absolute_expires_at<=? AND NOT EXISTS(SELECT 1 FROM auth_refresh_tokens r WHERE r.replaced_by_token_id=t.token_id) LIMIT 1000)',now-604800000],
  ['DELETE FROM auth_sessions WHERE session_id IN(SELECT s.session_id FROM auth_sessions s WHERE s.absolute_expires_at<=? AND NOT EXISTS(SELECT 1 FROM auth_refresh_tokens t WHERE t.session_id=s.session_id) LIMIT 1000)',now-604800000],
 ] as const;
 for(const [sql,cutoff] of plans){
  let changes;
  do{
   if(Date.now()-started>=authBudget){backlog=true;break;}
   const result=await env.DB.prepare(sql).bind(cutoff).run();changes=result.meta.changes;deleted+=changes;
  }while(changes===1000);
 }
 // Foundation-only環境不建立業務清理metadata。
 if(hasMedia&&env.FILES){const media=await cleanupMedia({DB:env.DB,FILES:env.FILES},now,started,budget);backlog=backlog||media.backlog;}
 return {deleted,backlog};
}

/**
 * 私有照片 R2 的受控串流與實體清理。只能經 Container outbound 的內部主機到達；
 * 使用目前有效的 Session 與 D1 照片狀態鑑權，絕不信任外部給的 objectKey。
 * PUT 只接受 .NET 共用 decoder 已壓縮的結果；外網不能呼叫此 bridge。
 */
async function privatePhotoMedia(request:Request,env:PlatformEnv,now:number):Promise<Response>{
 const started=Date.now();const currentTime=()=>now+Math.max(0,Date.now()-started);
 const url=new URL(request.url);
 const match=/^\/v1\/media\/(personal-photos|assets)\/([0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(url.pathname);
 if(!match || url.search || !['GET','PUT','DELETE'].includes(request.method))
  throw new PlatformError('NOT_FOUND',404);
 const input=z.strictObject({...auth}).safeParse({
  accountId:request.headers.get('X-DatingHigh-Media-Account-Id'),
  sessionId:request.headers.get('X-DatingHigh-Media-Session-Id'),
  cv:Number(request.headers.get('X-DatingHigh-Media-Cv')),
  accessExpiresAt:Number(request.headers.get('X-DatingHigh-Media-Expires-At'))
 });
 if(!input.success)throw new PlatformError('INVALID_REQUEST');
 const valid=await executeCommand(env.DB,'session.validate',input.data,now);
 if(valid.rows.length!==1)throw new PlatformError('SESSION_REVOKED',401);
 if(match[1]==='assets'&&request.method!=='GET')throw new PlatformError('NOT_FOUND',404);
 const assetId=match[2];
 const media=await env.DB.prepare(
  "SELECT object_key,mime_type,status,deleted_at,kind FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind IN ('personal_photo','generated_avatar')"
 ).bind(assetId,input.data.accountId).first<{
  object_key:string;mime_type:string;status:string;deleted_at:number|null;kind:string;
 }>();
 if(!media||match[1]==='personal-photos'&&media.kind!=='personal_photo')throw new PlatformError('NOT_FOUND',404);
 const key=media.kind==='generated_avatar'?`private/${input.data.accountId}/avatar/${assetId}`:`private/${input.data.accountId}/photos/${assetId}`;
 if(media.object_key!==key || !['image/jpeg','image/png','image/webp'].includes(media.mime_type))
  throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 if(request.method==='PUT'){
  if(media.status!=='pending'||media.deleted_at!==null)throw new PlatformError('PHOTO_NOT_PENDING',409);
  if(request.headers.get('Content-Type')!==media.mime_type)throw new PlatformError('INVALID_IMAGE');
  const bytes=await boundedMediaBytes(request,200000);
  let created=false;
  try{
   const stored=await env.FILES.put(key,bytes,{
    onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:media.mime_type}
   });
   if(!stored)throw new PlatformError('PHOTO_UPLOAD_IN_PROGRESS',409);
   created=true;
   const published=await executeCommand(env.DB,'profile.photo.ready',{...input.data,assetId},currentTime());
   if(published.rows.length!==1)throw new PlatformError('PHOTO_NOT_PENDING',409);
   return new Response(null,{status:201,headers:{'Cache-Control':'no-store'}});
  }catch(error){
   // 落盤後只允許 pending -> ready；清理可在 Session 撤銷後完成，不能因失效 JWT 留下私人 bytes。
   if(created || !(error instanceof PlatformError && error.code==='PHOTO_UPLOAD_IN_PROGRESS')){
    await env.DB.prepare("UPDATE user_media_assets SET status='deleted',deleted_at=? WHERE asset_id=? AND account_id=? AND kind='personal_photo' AND status='pending' AND object_key=?").bind(now,assetId,input.data.accountId,key).run();
    // 寫入回覆可能遺失；只在已 tombstone 時刪，不誤刪競爭者已提交的 ready 圖。
    const tombstone=await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND status='deleted' AND object_key=?").bind(assetId,input.data.accountId,key).first();
    if(tombstone)await env.FILES.delete(key);
   }
   throw error;
  }
 }
 if(request.method==='DELETE'){
  // 已完成 D1 軟刪才可真正刪 R2；禁止繞過 D1 刪除 ready 或 pending 原件。
  if(media.status!=='deleted'||media.deleted_at===null)
   throw new PlatformError('PHOTO_NOT_DELETED',409);
  await env.FILES.delete(key);
  return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
 }
 if(media.status!=='ready'||media.deleted_at!==null)throw new PlatformError('NOT_FOUND',404);
 const file=await env.FILES.get(key);
 if(!file)throw new PlatformError('NOT_FOUND',404);
 if(file.size<1 || file.size>(media.kind==='personal_photo'?200000:2000000) || file.httpMetadata?.contentType!==media.mime_type)
  throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
 // 再次檢查資產與 Session，避免等待 R2 期間被撤銷／刪除而開啟新串流。
 const final=await env.DB.prepare(
  "SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind IN ('personal_photo','generated_avatar') AND status='ready' AND deleted_at IS NULL AND object_key=?"
 ).bind(assetId,input.data.accountId,key).first();
 const active=await executeCommand(env.DB,'session.validate',input.data,currentTime());
 if(!final||active.rows.length!==1)throw new PlatformError('NOT_FOUND',404);
 return new Response(file.body,{status:200,headers:{
  'Content-Type':media.mime_type,
  'Content-Length':String(file.size),
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'"
 }});
}

/** 不相信 Content-Length；串流每段皆計數，超限立即取消讀取。 */
async function boundedMediaBytes(request:Request,limit:number):Promise<Uint8Array>{
 const advertised=request.headers.get('Content-Length');
 if(advertised!==null && (!/^\d+$/.test(advertised)||Number(advertised)>limit))
  throw new PlatformError('IMAGE_TOO_LARGE',413);
 const reader=request.body?.getReader();
 if(!reader)throw new PlatformError('INVALID_IMAGE');
 const chunks:Uint8Array[]=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;
   if(size>limit){await reader.cancel();throw new PlatformError('IMAGE_TOO_LARGE',413);}
   chunks.push(value);
  }
 }finally{reader.releaseLock();}
 if(!size)throw new PlatformError('INVALID_IMAGE');
 const result=new Uint8Array(size);let offset=0;
 for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}
 return result;
}

export async function dispatch(request:Request,env:PlatformEnv,now=Date.now()):Promise<Response>{
 try{
  const url=new URL(request.url);if(url.hostname!=='platform.internal')return problem('NOT_FOUND',404);
  if(url.pathname.startsWith('/v1/avatar/candidates/'))return await avatarMedia(request,env,now);
  if(url.pathname.startsWith('/v1/media/'))return await privatePhotoMedia(request,env,now);
  if(request.method!=='POST'||!url.pathname.startsWith('/v1/commands/'))return problem('NOT_FOUND',404);
  const raw=await request.text();if(new TextEncoder().encode(raw).length>16384)return problem('REQUEST_TOO_LARGE',413);
  const command=url.pathname.slice('/v1/commands/'.length),p=parseStrictJson(raw) as Record<string,unknown>;
  if(command.startsWith('avatar.attempt.'))return Response.json(await avatarCommand(command,p,env,now),{headers:{'Cache-Control':'no-store'}});
  if(command==='platform.ready'){z.strictObject({}).parse(p);return Response.json(await ready(env));}
  if(command==='external.google-jwks'){
   z.strictObject({}).parse(p);
   const response=await fetch('https://www.googleapis.com/oauth2/v3/certs',{method:'GET',redirect:'manual',headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
   const text=await response.text();if(new TextEncoder().encode(text).length>65536)throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
   let document;try{document=JSON.parse(text);}catch{throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);}
   if(!document||!Array.isArray(document.keys)||document.keys.length===0||document.keys.length>32)throw new PlatformError('DEPENDENCY_UNAVAILABLE',503);
   return Response.json(document,{headers:{'Cache-Control':'no-store'}});
  }
  if(command==='email.code.send'){
   const input=z.strictObject({challengeId:id,generation:z.number().int().nonnegative(),code:z.string().regex(/^[0-9]{6}$/)}).parse(p);
   if(env.APP_ENV==='local'||env.EmailDeliveryMode!=='Cloudflare'||!env.EMAIL||!env.EMAIL_FROM)throw new PlatformError('EMAIL_DELIVERY_FAILED',503);
   const c=await env.DB.prepare("SELECT * FROM auth_email_challenges WHERE challenge_id=? AND generation=? AND state='active' AND expires_at>? AND absolute_expires_at>?").bind(input.challengeId,input.generation,now,now).first<{purpose:string,email_normalized:string}>();
   if(!c || !['register_email','reset_password'].includes(c.purpose))throw new PlatformError('EMAIL_DELIVERY_FAILED',503);
   const result=await env.EMAIL.send({from:env.EMAIL_FROM,to:c.email_normalized,subject:c.purpose==='register_email'?'心動迴路：驗證 Email':'心動迴路：重設密碼',text:`您的驗證碼為 ${input.code}。有效期限 10 分鐘。若非本人操作，請忽略此信。`});
   return Response.json({messageId:result.messageId});
  }
  if(command.startsWith('object.private.')){
   if(!['object.private.put','object.private.get','object.private.delete'].includes(command))return problem('UNKNOWN_COMMAND');
   const input=privateInput.parse(p);const checked=await executeCommand(env.DB,'session.validate',Object.fromEntries(Object.keys(auth).map(k=>[k,p[k]])),now);
   if(!checked.rows.length)throw new PlatformError('SESSION_REVOKED',401);
   const key=`private/${input.accountId}/${input.purpose}/${input.objectId}`;
   if(command.endsWith('.put')){if(input.content===undefined||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input.content))throw new PlatformError('INVALID_REQUEST');const bytes=Uint8Array.from(atob(input.content),c=>c.charCodeAt(0));if(bytes.length>8192)throw new PlatformError('REQUEST_TOO_LARGE',413);await env.FILES.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});return Response.json({objectId:input.objectId,byteLength:bytes.length});}
   if(input.content!==undefined)throw new PlatformError('INVALID_REQUEST');
   if(command.endsWith('.delete')){await env.FILES.delete(key);return Response.json({deleted:true});}
   const object=await env.FILES.get(key);if(!object)throw new PlatformError('NOT_FOUND',404);
   const bytes=new Uint8Array(await object.arrayBuffer());return Response.json({content:btoa(String.fromCharCode(...bytes))});
  }
  const result=await executeCommand(env.DB,command,p,now);return Response.json(result);
 }catch(e){
  if(e instanceof PlatformError||e instanceof AvatarError)return problem(e.code,e.status);
  if(e instanceof z.ZodError||e instanceof SyntaxError||e instanceof Error&&['UNKNOWN_COMMAND','INVALID_POLICY'].includes(e.message))return problem('INVALID_REQUEST');
  if(e instanceof Error && /UNIQUE constraint failed/.test(e.message))return problem(e.message.includes('email_normalized')?'EMAIL_ALREADY_REGISTERED':e.message.includes('auth_refresh_tokens.session_id')?'REFRESH_RETRY':e.message.includes('auth_sessions.account_id')?'CREDENTIAL_CHANGED':'EXTERNAL_IDENTITY_IN_USE',409);
  return problem('DEPENDENCY_UNAVAILABLE',503);
 }
}
