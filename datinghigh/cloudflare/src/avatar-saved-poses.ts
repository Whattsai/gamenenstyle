import {executeCommand} from './commands';
import {AvatarAdoptionError,beginAvatarAdoption,type AvatarAdoption} from './avatar-adoption';
import {readReadyAvatarPack} from './avatar-expression-store';
import {readReadyStaticPosePackage} from './avatar-static-pose';
import type {PlatformEnv} from './platform';
type Auth={accountId:string;sessionId:string;cv:number;accessExpiresAt:number};
const fail=(code='AVATAR_SOURCE_CHANGED',status=409):never=>{throw new AvatarAdoptionError(code,status);};
/** 保存角色補姿態只讀同一本人的永久 Master，不依賴已過期候選或真人來源照片。 */
export async function assertSavedAvatarSource(env:PlatformEnv,auth:Auth,build:Pick<AvatarAdoption,'assetId'|'expectedRevision'|'sourceImageSha256'>,now:number){
 const row=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as {revision:number;selected_avatar_type:string;selected_avatar_ref:string}|undefined;
 if(row?.revision!==build.expectedRevision)fail('PROFILE_VERSION_CONFLICT');
 if(row!.selected_avatar_type!=='generated'||row!.selected_avatar_ref!==build.assetId)fail();
 const saved=await env.DB.prepare("SELECT object_key FROM user_media_assets WHERE account_id=? AND asset_id=? AND kind='generated_avatar' AND status='ready' AND deleted_at IS NULL").bind(auth.accountId,build.assetId).first<{object_key:string}>();
 if(saved?.object_key!==`private/${auth.accountId}/avatar/${build.assetId}`)fail('AVATAR_PACK_NOT_READY');
 return readReadyAvatarPack(env.FILES,auth.accountId,build.assetId,{sourceImageSha256:build.sourceImageSha256});
}
export async function beginSavedAvatarPoses(env:PlatformEnv,auth:Auth,input:{assetId:string;clientRequestId:string;expectedRevision:number;generatorModel:string;promptVersion:string},now:number){
 const manifest=await readReadyAvatarPack(env.FILES,auth.accountId,input.assetId);
 await assertSavedAvatarSource(env,auth,{...input,sourceImageSha256:manifest.sourceImageSha256},now);
 if(await readReadyStaticPosePackage(env.FILES,auth.accountId,input.assetId,manifest.sourceImageSha256))fail('AVATAR_STATIC_ALREADY_READY');
 const master=await env.FILES.get(`private/${auth.accountId}/avatar/${input.assetId}`);
 const index=Number(master?.customMetadata?.candidateIndex);
 if(!master||master.size<1||master.size>2000000||master.httpMetadata?.contentType!=='image/jpeg'||!Number.isInteger(index)||index<1||index>4)fail('AVATAR_PACK_UNAVAILABLE',503);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await master!.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');
 if(hash!==manifest.sourceImageSha256)fail();
 return beginAvatarAdoption(env.FILES,{ownerAccountId:auth.accountId,assetId:input.assetId,attemptId:manifest.sourceAssetRef,index,requestId:input.clientRequestId,expectedRevision:input.expectedRevision,sourceImageSha256:manifest.sourceImageSha256,expiresAt:now+86400000,generatorModel:input.generatorModel,promptVersion:input.promptVersion,staticRequired:true,savedSource:true},now,{completed:manifest.expressions,verifiedAt:manifest.verifiedAt});
}
