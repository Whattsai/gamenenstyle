import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
import {dispatch,type PlatformEnv} from '../src/platform';
import {executeCommand} from '../src/commands';
let mf:Miniflare,env:PlatformEnv;
const now=1800000000000,id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+3600000};
const call=(command:string,body:Record<string,unknown>={})=>dispatch(new Request(`http://platform.internal/v1/commands/${command}`,{method:'POST',body:JSON.stringify({...auth,...body})}),env,now);
const headers={'X-DatingHigh-Media-Account-Id':auth.accountId,'X-DatingHigh-Media-Session-Id':auth.sessionId,'X-DatingHigh-Media-Cv':'1','X-DatingHigh-Media-Expires-At':String(auth.accessExpiresAt)};
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'adoption-d1'},r2Buckets:{FILES:'adoption-d1'}}));
 env={DB:await mf.getD1Database('DB') as unknown as D1Database,FILES:await mf.getR2Bucket('FILES') as unknown as R2Bucket,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0005_story_dialogue_exit.sql'};
 for(const name of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql','0005_story_dialogue_exit.sql'])await env.DB.batch(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>env.DB.prepare(s)));
});
beforeEach(async()=>{
 await env.DB.batch(['DELETE FROM match_conditions','DELETE FROM user_media_assets','DELETE FROM user_profiles','DELETE FROM auth_sessions','DELETE FROM auth_accounts'].map(s=>env.DB.prepare(s)));
 const list=await env.FILES.list();if(list.objects.length)await env.FILES.delete(list.objects.map(o=>o.key));
 await env.DB.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(auth.accountId,'adoption-fixture@example.test',now,now,now).run();
 await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(auth.sessionId,auth.accountId,now,now+2592000000,now+604800000).run();
 await executeCommand(env.DB,'profile.ensure',{...auth,profileId:id(3)},now);await env.DB.prepare("UPDATE user_profiles SET gender='diverse'").run();
 for(const n of [10,11]){await executeCommand(env.DB,'profile.photo.reserve',{...auth,assetId:id(n),objectKey:`private/${auth.accountId}/photos/${id(n)}`,mimeType:'image/jpeg'},now);await executeCommand(env.DB,'profile.photo.ready',{...auth,assetId:id(n)},now);}
});
afterAll(async()=>{await mf?.dispose();});
async function candidate(){
 const response=await call('avatar.attempt.begin',{proposedAttemptId:id(50),attemptId:null,styleId:'warm',clientRequestId:id(100),expectedProducedCount:0});expect(response.status).toBe(200);const lease=await response.json() as any;
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${id(50)}`,{method:'PUT',headers:{...headers,'Content-Type':'image/jpeg','X-DatingHigh-Avatar-Request-Id':id(100),'If-Match':lease.lease},body:new Uint8Array([1,2,3])}),env,now)).status).toBe(200);
}
it('SD-IT-067: candidate adoption cannot bypass the ready five-expression pack',async()=>{
 await candidate();const selected=await call('avatar.attempt.select',{attemptId:id(50),index:1,proposedAssetId:id(60),expectedRevision:1});
 expect(selected.status).toBe(409);expect((await selected.json() as any).code).toBe('AVATAR_PACK_NOT_READY');
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:1,selected_avatar_ref:null});
});
it('SD-IT-069: foreground begin locks free selection and generation on another request, preserving the old profile',async()=>{
 await candidate();const begin=await call('avatar.attempt.expression.begin',{attemptId:id(50),index:1,proposedAssetId:id(60),clientRequestId:id(101),expectedRevision:1,generatorModel:'test-only',promptVersion:'test-only'});
 expect(begin.status).toBe(200);
 expect((await call('profile.avatar.builtin',{avatarId:'male-01',expectedRevision:1})).status).toBe(409);
 expect((await call('avatar.attempt.begin',{proposedAttemptId:id(51),attemptId:id(50),styleId:'warm',clientRequestId:id(102),expectedProducedCount:1})).status).toBe(409);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:1,selected_avatar_ref:null});
});
it('SD-IT-068/073: cancel fences a late D1 adoption while preserving the current avatar and non-avatar profile fields',async()=>{
 await candidate();
 expect((await call('avatar.attempt.expression.begin',{attemptId:id(50),index:1,proposedAssetId:id(60),clientRequestId:id(101),expectedRevision:1,generatorModel:'test-only',promptVersion:'test-only'})).status).toBe(200);
 await executeCommand(env.DB,'profile.avatar.reserve',{...auth,assetId:id(60),expectedRevision:1,sourceAssetIds:[id(10),id(11)]},now);
 const before=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as any;
 expect((await call('avatar.attempt.expression.cancel',{workflowId:id(101)})).status).toBe(200);
 const after=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as any;
 expect(after).toMatchObject({...before,revision:2,updated_at:after.updated_at});expect(after.updated_at).toBeGreaterThanOrEqual(before.updated_at);
 const late=await executeCommand(env.DB,'profile.avatar.adopt',{...auth,assetId:id(60),expectedRevision:1,sourceAssetIds:[id(10),id(11)]},now);
 expect(late.changes[0]).toBe(0);expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:2,selected_avatar_ref:null});
 expect((await call('profile.avatar.builtin',{avatarId:'male-01',expectedRevision:2})).status).toBe(200);
});
