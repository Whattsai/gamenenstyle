import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
import {dispatch,type PlatformEnv} from '../src/platform';
import {executeCommand} from '../src/commands';
import catalog from '../../contracts/builtin-avatar-packs.json';
import poses from '../../contracts/builtin-static-poses.json';
import {cleanupMedia} from '../src/media-cleanup';
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
async function legacySaved(keepAttempt=false){
 await candidate();const workflow=id(301),asset=id(60);
 expect((await call('avatar.attempt.expression.begin',{attemptId:id(50),index:1,proposedAssetId:asset,clientRequestId:workflow,expectedRevision:1,generatorModel:'fixture',promptVersion:'fixture'})).status).toBe(200);
 for(const [n,expression]of ['neutral','smile','surprised','thoughtful','concerned'].entries()){
  const request=id(310+n),response=await call('avatar.attempt.expression.next',{workflowId:workflow,expression,clientRequestId:request}),lease=await response.json() as any;
  const a=catalog.packs['female-01'].expressions[expression as 'neutral'],bytes=new Uint8Array(readFileSync(new URL('../../frontend/client/public'+a.url,import.meta.url)));
  expect((await dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/${expression}`,{method:'PUT',headers:{...headers,'Content-Type':'image/webp','X-DatingHigh-Avatar-Request-Id':request,'If-Match':lease.lease},body:bytes}),env,now)).status).toBe(200);
 }
 expect((await call('avatar.attempt.select',{attemptId:id(50),index:1,proposedAssetId:asset,expectedRevision:1})).status).toBe(200);
 if(!keepAttempt)await env.FILES.delete([`private/${auth.accountId}/avatar/temp/${id(50)}/manifest`,`private/${auth.accountId}/avatar/temp/${id(50)}/1`]);
 return asset;
}
it('reading the old closed candidate cannot finish a saved-avatar pose upgrade before owner review',async()=>{
 const asset=await legacySaved(true),before=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as any;
 expect((await call('avatar.attempt.expression.begin',{assetId:asset,proposedAssetId:id(61),clientRequestId:id(480),expectedRevision:before.revision,generatorModel:'fixture',promptVersion:'fixture',staticRequired:true})).status).toBe(200);
 const status=await call('avatar.attempt.status');expect(status.status).toBe(200);expect(await status.json()).toMatchObject({attempt:null});
 expect(await(await call('avatar.attempt.expression.status')).json()).toMatchObject({adoption:{savedSource:true,status:'building'}});
});
it('legacy saved AI upgrades only four poses from its saved Master, keeps five images and selection, and publishes only after explicit review',async()=>{
 const asset=await legacySaved(),workflow=id(400),before=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as any;
 const prefix=`private/${auth.accountId}/avatar/${asset}/`,original=await env.FILES.get(prefix+'expressions/v1/full-body.v1/manifest.json'),originalText=await original!.text();
 const begun=await call('avatar.attempt.expression.begin',{assetId:asset,proposedAssetId:id(61),clientRequestId:workflow,expectedRevision:before.revision,generatorModel:'fixture',promptVersion:'fixture',staticRequired:true});expect(begun.status).toBe(200);
 expect(await begun.json()).toMatchObject({assetId:asset,savedSource:true,completed:['neutral','smile','surprised','thoughtful','concerned'],completedPoses:[]});
 let progress:any;
 for(const [n,pose]of ['stand','sit','read','hold'].entries()){
  const request=id(410+n),response=await call('avatar.attempt.expression.next',{workflowId:workflow,expression:'pose-'+pose,clientRequestId:request});expect(response.status).toBe(200);const lease=await response.json() as any;expect(lease).toMatchObject({savedSource:true,assetId:asset});
  const a=poses.packs['female-01'].assets.find(a=>a.id===pose)!,bytes=new Uint8Array(readFileSync(new URL(`../../frontend/client/public/avatars/static-poses.v1/female-01/${a.sha256}.png`,import.meta.url)));
  const published=await dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/pose-${pose}`,{method:'PUT',headers:{...headers,'Content-Type':'image/png','X-DatingHigh-Avatar-Request-Id':request,'If-Match':lease.lease},body:bytes}),env,now);expect(published.status).toBe(200);progress=await published.json();
 }
 expect(progress.status).toBe('ready');expect((await env.FILES.list({prefix:prefix+'static-poses/'})).objects).toHaveLength(0);
 expect((await env.FILES.get(prefix+'expressions/v1/full-body.v1/manifest.json'))&&await(await env.FILES.get(prefix+'expressions/v1/full-body.v1/manifest.json'))!.text()).toBe(originalText);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:before.revision,selected_avatar_ref:asset});
 expect((await call('profile.avatar.generated',{assetId:asset,expectedRevision:before.revision})).status).toBe(409);
 expect((await call('avatar.attempt.expression.review',{workflowId:workflow,packageVersion:progress.staticPosePackage.packageVersion})).status).toBe(200);
 expect((await call('avatar.attempt.expression.review',{workflowId:workflow,packageVersion:progress.staticPosePackage.packageVersion})).status).toBe(200);
 expect((await env.FILES.list({prefix:`private/${auth.accountId}/avatar/temp/pose-sheets/${workflow}/`})).objects).toHaveLength(0);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:before.revision+1,selected_avatar_ref:asset});
});
it.each([false,true])('saved AI cancellation preserves legacy selection and can release a stale profile fence, changed=%s',async changed=>{
 const asset=await legacySaved(),workflow=id(450),before=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as any;
 expect((await call('avatar.attempt.expression.begin',{assetId:asset,proposedAssetId:id(61),clientRequestId:workflow,expectedRevision:before.revision,generatorModel:'fixture',promptVersion:'fixture',staticRequired:true})).status).toBe(200);
 if(changed)await env.DB.prepare('UPDATE user_profiles SET revision=revision+1 WHERE account_id=?').bind(auth.accountId).run();
 const cancelled=await call('avatar.attempt.expression.cancel',{workflowId:workflow});expect(cancelled.status).toBe(200);expect(await cancelled.json()).toMatchObject({cancelled:true});
 expect((await env.FILES.list({prefix:`private/${auth.accountId}/avatar/${asset}/static-poses/`})).objects).toHaveLength(0);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:before.revision+1,selected_avatar_ref:asset});
});
it('saved pose temporary GC retains active preview references and removes expired abandoned sheets without touching the saved Master',async()=>{
 const asset=await legacySaved(),workflow=id(470),before=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as any;
 await call('avatar.attempt.expression.begin',{assetId:asset,proposedAssetId:id(61),clientRequestId:workflow,expectedRevision:before.revision,generatorModel:'fixture',promptVersion:'fixture',staticRequired:true});
 const request=id(471),lease=await(await call('avatar.attempt.expression.next',{workflowId:workflow,expression:'pose-stand',clientRequestId:request})).json() as any;
 const a=poses.packs['female-01'].assets.find(a=>a.id==='stand')!,bytes=new Uint8Array(readFileSync(new URL(`../../frontend/client/public/avatars/static-poses.v1/female-01/${a.sha256}.png`,import.meta.url)));
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/pose-stand`,{method:'PUT',headers:{...headers,'Content-Type':'image/png','X-DatingHigh-Avatar-Request-Id':request,'If-Match':lease.lease},body:bytes}),env,now)).status).toBe(200);
 const active=`private/${auth.accountId}/avatar/temp/pose-sheets/${workflow}/stand.png`,stored=await env.FILES.get(active);
 await env.FILES.put(active,await stored!.arrayBuffer(),{httpMetadata:{contentType:'image/png'},customMetadata:{...stored!.customMetadata,orphanAfter:String(now-1)}});
 const orphan=`private/${auth.accountId}/avatar/temp/pose-sheets/${id(499)}/read.png`;await env.FILES.put(orphan,new Uint8Array([1]),{customMetadata:{orphanAfter:String(now-1)}});
 await cleanupMedia(env,now,Date.now(),10000);expect(await env.FILES.head(active)).toBeTruthy();expect(await env.FILES.head(orphan)).toBeNull();
 await cleanupMedia(env,now+90000001,Date.now(),10000);expect(await env.FILES.head(active)).toBeNull();expect(await env.FILES.head(`private/${auth.accountId}/avatar/${asset}`)).toBeTruthy();
});
it('SEF static real D1: review fences adoption, preview rechecks ownership, cleanup removes only expired unreferenced pose files',async()=>{
 await candidate();const workflow=id(101),asset=id(60);
 expect((await call('avatar.attempt.expression.begin',{attemptId:id(50),index:1,proposedAssetId:asset,clientRequestId:workflow,expectedRevision:1,generatorModel:'fixture',promptVersion:'fixture',staticRequired:true})).status).toBe(200);
 let progress:any;
 for(const [n,expression]of ['neutral','smile','surprised','thoughtful','concerned','pose-stand','pose-sit','pose-read','pose-hold'].entries()){
  const request=id(110+n),step=await call('avatar.attempt.expression.next',{workflowId:workflow,expression,clientRequestId:request});expect(step.status).toBe(200);const lease=await step.json()as any;
  let bytes:Uint8Array;const pose=expression.startsWith('pose-')?expression.slice(5):undefined;
  if(pose){const a=poses.packs['female-01'].assets.find(a=>a.id===pose)!;bytes=new Uint8Array(readFileSync(new URL(`../../frontend/client/public/avatars/static-poses.v1/female-01/${a.sha256}.png`,import.meta.url)));}
  else {const a=catalog.packs['female-01'].expressions[expression as 'neutral'];bytes=new Uint8Array(readFileSync(new URL('../../frontend/client/public'+a.url,import.meta.url)));}
  const response=await dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/${expression}`,{method:'PUT',headers:{...headers,'Content-Type':pose?'image/png':'image/webp','X-DatingHigh-Avatar-Request-Id':request,'If-Match':lease.lease},body:Uint8Array.from(bytes).buffer}),env,now);
  expect(response.status).toBe(200);progress=await response.json();
 }
 const select=()=>call('avatar.attempt.select',{attemptId:id(50),index:1,proposedAssetId:asset,expectedRevision:1});
 expect((await select()).status).toBe(409);expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:1,selected_avatar_ref:null});
 const preview=()=>dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/pose-read`,{headers}),env,now);
 expect((await preview()).status).toBe(200);
 await env.DB.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(80),'another-fixture@example.test',now,now,now).run();
 await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(81),id(80),now,now+2592000000,now+604800000).run();
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/pose-read`,{headers:{...headers,'X-DatingHigh-Media-Account-Id':id(80),'X-DatingHigh-Media-Session-Id':id(81)}}),env,now)).status).toBe(404);
 let revokedDuringRead=false;
 const revokingFiles=new Proxy(env.FILES,{get(target,key){if(key==='get')return async(name:string)=>{const object=await target.get(name);if(!revokedDuringRead&&name.includes('/static-poses/')&&name.endsWith('.png')){revokedDuringRead=true;await env.DB.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,auth.sessionId).run();}return object;};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/expressions/${workflow}/pose-read`,{headers}),{...env,FILES:revokingFiles},now)).status).toBe(401);expect(revokedDuringRead).toBe(true);
 await env.DB.prepare('UPDATE auth_sessions SET revoked_at=NULL WHERE session_id=?').bind(auth.sessionId).run();
 expect((await call('avatar.attempt.expression.review',{workflowId:workflow,packageVersion:'f'.repeat(64)})).status).toBe(409);
 expect((await call('avatar.attempt.expression.review',{workflowId:workflow,packageVersion:progress.staticPosePackage.packageVersion})).status).toBe(200);
 expect((await select()).status).toBe(200);
 const saved=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0]as any;expect(saved.selected_avatar_ref).toBe(asset);
 const source=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array([1,2,3]))),n=>n.toString(16).padStart(2,'0')).join('');
 const protectedKey=`private/${auth.accountId}/avatar/${asset}/static-poses/v1/${source}/${progress.staticPosePackage.assets[0].sha256}.png`;
 const orphanKey=`private/${auth.accountId}/avatar/${id(77)}/static-poses/v1/${source}/${'e'.repeat(64)}.png`;
 await env.FILES.put(orphanKey,new Uint8Array([1]),{customMetadata:{orphanAfter:String(now-1)}});
 await cleanupMedia(env,now+7200001,Date.now(),10000);
 expect(await env.FILES.head(protectedKey)).toBeTruthy();expect(await env.FILES.head(orphanKey)).toBeNull();
 await env.DB.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,auth.sessionId).run();
 expect((await preview()).status).toBe(401);
});
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
