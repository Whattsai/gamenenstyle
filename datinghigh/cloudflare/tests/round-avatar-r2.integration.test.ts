import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
import {dispatch,type PlatformEnv} from '../src/platform';
import {executeCommand} from '../src/commands';
import {expressionIds,avatarExpressionPrefix} from '../src/avatar-expression-manifest';
import {publishReadyAvatarPack} from '../src/avatar-expression-store';
import builtinCatalog from '../../contracts/builtin-avatar-packs.json';
import staticCatalog from '../../contracts/builtin-static-poses.json';
import {publishStaticPosePackage,readReadyStaticPosePackage,staticPosePrefix} from '../src/avatar-static-pose';
let mf:Miniflare,env:PlatformEnv;
const now=1800000000000,id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,round=id(50),asset=id(22);
const auth=(who=1)=>({accountId:id(who),sessionId:id(who+100),cv:1,accessExpiresAt:now+3600000});
const headers=(who=1)=>({'X-DatingHigh-Media-Account-Id':id(who),'X-DatingHigh-Media-Session-Id':id(who+100),'X-DatingHigh-Media-Cv':'1','X-DatingHigh-Media-Expires-At':String(now+3600000)});
const call=(who=1)=>dispatch(new Request('http://platform.internal/v1/commands/avatar.round.projection',{method:'POST',body:JSON.stringify({...auth(who),roundId:round})}),env,now);
const media=(version:string,who=1,expression='neutral',targetEnv=env)=>dispatch(new Request(`http://platform.internal/v1/avatar/rounds/${round}/${version}/${expression}`,{headers:headers(who)}),targetEnv,now);
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'round-avatars'},r2Buckets:{FILES:'round-avatars'}}));
 env={DB:await mf.getD1Database('DB') as unknown as D1Database,FILES:await mf.getR2Bucket('FILES') as unknown as R2Bucket,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0005_story_dialogue_exit.sql'};
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0006').sort())await env.DB.batch(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>env.DB.prepare(s)));
});
beforeEach(async()=>{
 for(const table of ['game_active_round_claims','game_rounds','match_invitations','content_story_catalog','user_media_assets','user_profiles','auth_sessions','auth_accounts'])await env.DB.prepare(`DELETE FROM ${table}`).run();
 const page=await env.FILES.list();if(page.objects.length)await env.FILES.delete(page.objects.map(o=>o.key));
 for(const n of [1,2,3]){
  await env.DB.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`avatar-fixture-${n}@example.test`,now,now,now).run();
  await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(n+100),id(n),now,now+2592000000,now+604800000).run();
  await executeCommand(env.DB,'profile.ensure',{...auth(n),profileId:id(n+200)},now);
 }
 await env.DB.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(40),id(1),id(2),id(1),id(41),now,now+259200000,now,now).run();
 await env.DB.prepare("INSERT INTO content_story_catalog VALUES(?, 'fixture-scene','v1','[]',1,'story-content/fixture','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','published',?)").bind(id(90),now).run();
 await env.DB.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(round,id(40),id(1),id(2),now,JSON.stringify([id(90)])).run();
 for(const n of [1,2])await env.DB.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(60+n),id(n),round,now).run();
 await env.DB.prepare("INSERT INTO user_media_assets VALUES(?,?,'generated_avatar',?,'image/jpeg',NULL,'ready',?,NULL)").bind(asset,id(2),`private/${id(2)}/avatar/${asset}`,now).run();
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='generated',selected_avatar_ref=? WHERE account_id=?").bind(asset,id(2)).run();
 const expressions:Record<string,any>={};
 for(const [n,e] of expressionIds.entries()){
  const bytes=new Uint8Array([1,2,n]),objectKey=avatarExpressionPrefix(id(2),asset)+e+'.webp';await env.FILES.put(objectKey,bytes,{httpMetadata:{contentType:'image/webp'}});
  const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
  expressions[e]={objectKey,sha256,mimeType:'image/webp',width:768,height:1024,byteSize:3,alphaMode:'straight',framing:'full_body',pose:'standing'};
 }
 await publishReadyAvatarPack(env.FILES,{manifestSchemaVersion:1,ownerAccountId:id(2),avatarAssetId:asset,expressionSpecVersion:'v1',avatarAssetSpecVersion:'full-body.v1',sourceImageSha256:'a'.repeat(64),sourceAssetRef:id(80),status:'ready',framing:'full_body',pose:'standing',stageAnchors:{head:{x:.5,y:.08},feet:{x:.5,y:.96}},masterAsset:expressions.neutral,expressions,generatorModel:'test-fixture',promptVersion:'test.v1',verifiedAt:now},id(2),asset);
});
afterAll(async()=>{await mf?.dispose();});
const current=(who=2,target=env)=>dispatch(new Request('http://platform.internal/v1/commands/avatar.current.readiness',{method:'POST',body:JSON.stringify(auth(who))}),target,now);
it('SEF-IT-149/150 static boundary: private immutable publication rejects incomplete uploads, concurrent writes converge and missing sheets block readiness',async()=>{
 // 正式虛構免費圖作儲存 fixture；不假稱已由真人 AI 首次採用流程生成。
 const p={...structuredClone(staticCatalog.packs['female-01']),sourceImageSha256:'a'.repeat(64)},prefix=staticPosePrefix(id(2),asset,p.sourceImageSha256);
 for(const a of p.assets.slice(0,3))await env.FILES.put(prefix+a.sha256+'.png',readFileSync(new URL(`../../frontend/client/public/avatars/static-poses.v1/female-01/${a.sha256}.png`,import.meta.url)),{httpMetadata:{contentType:'image/png'}});
 await expect(publishStaticPosePackage(env.FILES,id(2),asset,p.sourceImageSha256,p)).rejects.toThrow('AVATAR_PACK_UNAVAILABLE');
 expect(await readReadyStaticPosePackage(env.FILES,id(2),asset,p.sourceImageSha256)).toBeUndefined();
 const last=p.assets[3];await env.FILES.put(prefix+last.sha256+'.png',readFileSync(new URL(`../../frontend/client/public/avatars/static-poses.v1/female-01/${last.sha256}.png`,import.meta.url)),{httpMetadata:{contentType:'image/png'}});
 const published=await Promise.all([publishStaticPosePackage(env.FILES,id(2),asset,p.sourceImageSha256,p),publishStaticPosePackage(env.FILES,id(2),asset,p.sourceImageSha256,p)]);
 expect(published[0]).toEqual(published[1]);
 await expect(publishStaticPosePackage(env.FILES,id(2),asset,p.sourceImageSha256,{...p,poses:[...p.poses].reverse()})).rejects.toThrow('AVATAR_PACK_IMMUTABLE');
 const result=await(await call()).json()as any;expect(result.staticPosePackage.assets).toHaveLength(4);
 expect(JSON.stringify(result)).not.toContain('sourceImageSha256');expect(JSON.stringify(result)).not.toContain('private/');
 const image=await media(result.avatarVersion,1,'static-'+last.sha256);expect(image.status).toBe(200);expect(image.headers.get('Cache-Control')).toBe('no-store');
 expect((await media(result.avatarVersion,3,'static-'+last.sha256)).status).toBe(403);
 expect((await current()).status).toBe(200);
 await env.FILES.delete(prefix+last.sha256+'.png');
 expect((await current()).status).toBe(409);
 expect((await media(result.avatarVersion,1,'static-'+last.sha256)).status).toBe(503);
});
it('SEF static: builtin pose sheets use the existing authorized channel, immutable hashes and post-I/O membership checks',async()=>{
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='builtin',selected_avatar_ref='male-02' WHERE account_id=?").bind(id(2)).run();
 const p=await(await call()).json()as any;
 expect(p.staticPosePackage?.poses).toHaveLength(4);
 const image=p.staticPosePackage.assets.find((a:any)=>a.id==='hold-smile-correction');
 expect(image.url).toBe(`/api/v1/game-rounds/${round}/partner-avatar/${p.avatarVersion}/static-${image.sha256}`);
 const assets={fetch:async(request:Request)=>new Response(new Uint8Array(readFileSync(new URL('../..'+new URL(request.url).pathname.replace('/avatars/','/frontend/client/public/avatars/'),import.meta.url))),{headers:{'Content-Type':'image/png'}})} as Fetcher;
 const target={...env,ASSETS:assets};
 expect((await media(p.avatarVersion,1,`static-${image.sha256}`,target)).status).toBe(200);
 expect((await media(p.avatarVersion,3,`static-${image.sha256}`,target)).status).toBe(403);
 expect((await media(p.avatarVersion,1,`static-${'f'.repeat(64)}`,target)).status).toBe(409);
 const corrupt={...target,ASSETS:{fetch:async()=>new Response(new Uint8Array([1]),{headers:{'Content-Type':'image/png'}})} as unknown as Fetcher};
 expect((await media(p.avatarVersion,1,`static-${image.sha256}`,corrupt)).status).toBe(503);
 const ended={...target,ASSETS:{fetch:async(r:Request)=>{const response=await assets.fetch(r);await executeCommand(env.DB,'game.round.end',{...auth(),roundId:round},now);return response;}} as Fetcher};
 expect((await media(p.avatarVersion,1,`static-${image.sha256}`,ended)).status).toBe(403);
});
it('SEF two-avatar stage: same-round own pack uses current caller adoption and rechecks membership and version for binary reads',async()=>{
 const own=(who=2)=>dispatch(new Request('http://platform.internal/v1/commands/avatar.round.self-projection',{method:'POST',body:JSON.stringify({...auth(who),roundId:round})}),env,now);
 const response=await own();expect(response.status).toBe(200);const p=await response.json()as any;expect(p.avatarAssetId).toBe(asset);for(const e of expressionIds)expect(p.expressions[e].url).toBe(`/api/v1/game-rounds/${round}/my-avatar/${p.avatarVersion}/${e}`);
 const read=(who=2)=>dispatch(new Request(`http://platform.internal/v1/avatar/round-self/${round}/${p.avatarVersion}/neutral`,{headers:headers(who)}),env,now);
 expect((await read()).status).toBe(200);expect((await own(3)).status).toBe(403);expect((await read(3)).status).toBe(403);
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='builtin',selected_avatar_ref='male-01' WHERE account_id=?").bind(id(2)).run();expect((await read()).status).toBe(409);
 await executeCommand(env.DB,'game.round.end',{...auth(),roundId:round},now);expect((await own()).status).toBe(403);expect((await read()).status).toBe(403);
});
it('current own avatar requires the adopted complete pack; an unrelated pending asset cannot block a ready selection',async()=>{
 expect((await current()).status).toBe(200);
 await env.DB.prepare("INSERT INTO user_media_assets VALUES(?,?,'generated_avatar',?,'image/jpeg',NULL,'pending',?,NULL)").bind(id(23),id(2),`private/${id(2)}/avatar/${id(23)}`,now).run();
 expect((await current()).status).toBe(200);
 await env.FILES.delete(avatarExpressionPrefix(id(2),asset)+'concerned.webp');
 const missing=await current();expect(missing.status).toBe(409);expect(await missing.json()).toMatchObject({code:'OWN_AVATAR_PACK_NOT_READY'});
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='builtin',selected_avatar_ref='female-01' WHERE account_id=?").bind(id(2)).run();expect((await current()).status).toBe(200);
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='generated',selected_avatar_ref=? WHERE account_id=?").bind(id(23),id(2)).run();expect((await current()).status).toBe(409);
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='generated',selected_avatar_ref=? WHERE account_id=?").bind(asset,id(1)).run();expect((await current(1)).status).toBe(409);
});
it('own current readiness rechecks selection and session after private storage I/O',async()=>{
 let changed=false;const files=new Proxy(env.FILES,{get(target,key){if(key==='get')return async(name:string)=>{const result=await target.get(name);if(!changed){changed=true;await env.DB.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,id(102)).run();}return result;};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
 expect((await current(2,{...env,FILES:files})).status).toBe(401);
});
it('SD-IT-062/074: approved builtin five-expression art uses the same authorized round channel and verified static bytes',async()=>{
 const pack=builtinCatalog.packs['female-01'];
 await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='builtin',selected_avatar_ref='female-01' WHERE account_id=?").bind(id(2)).run();
 const assets={fetch:async(request:Request)=>{const file=new URL('../..'+new URL(request.url).pathname.replace('/avatars/','/frontend/client/public/avatars/'),import.meta.url);return new Response(new Uint8Array(readFileSync(file)),{headers:{'Content-Type':'image/webp'}});}} as Fetcher;
 const target={...env,ASSETS:assets};
 const response=await dispatch(new Request('http://platform.internal/v1/commands/avatar.round.projection',{method:'POST',body:JSON.stringify({...auth(),roundId:round})}),target,now);
 expect(response.status).toBe(200);const p=await response.json() as any;expect(p.avatarAssetId).toBe('female-01');expect(p.avatarVersion).toBe(pack.avatarVersion);
 const image=await media(p.avatarVersion,1,'neutral',target);expect(image.status).toBe(200);expect((await image.arrayBuffer()).byteLength).toBe(pack.expressions.neutral.byteSize);
 const wrong={...target,ASSETS:{fetch:async()=>new Response(new Uint8Array([1,2]),{headers:{'Content-Type':'image/webp'}})} as unknown as Fetcher};
 expect((await media(p.avatarVersion,1,'neutral',wrong)).status).toBe(503);
 await executeCommand(env.DB,'game.round.end',{...auth(),roundId:round},now);expect((await media(p.avatarVersion,1,'neutral',target)).status).toBe(403);
});
it('SD-IT-074: round projection exposes only the current partner ready pack, never owner keys, photos or candidate references',async()=>{
 const response=await call();expect(response.status).toBe(200);const projection=await response.json() as any;
 expect(projection.avatarAssetId).toBe(asset);expect(projection.avatarVersion).toMatch(/^[0-9a-f]{64}$/);
 expect(Object.keys(projection.expressions)).toEqual(expressionIds);
 const json=JSON.stringify(projection);for(const secret of ['private/','ownerAccountId','sourceImageSha256','sourceAssetRef','generatorModel',id(80)])expect(json).not.toContain(secret);
 expect((await call(3)).status).toBe(403);
 const image=await media(projection.avatarVersion);expect(image.status).toBe(200);expect(new Uint8Array(await image.arrayBuffer())).toEqual(new Uint8Array([1,2,0]));
 expect(image.headers.get('Cache-Control')).toBe('no-store');expect((await media(projection.avatarVersion,3)).status).toBe(403);
 expect((await media('f'.repeat(64))).status).toBe(409);expect((await media(projection.avatarVersion,1,'angry')).status).toBe(400);
});
it.each(['ended','revoked','reselected','missing-claim','third-claim'])('SD-IT-074: previously valid media is refused after %s',async(change)=>{
 const projection=await(await call()).json() as any;
 if(change==='ended')await executeCommand(env.DB,'game.round.end',{...auth(),roundId:round},now);
 if(change==='revoked')await env.DB.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,id(101)).run();
 if(change==='reselected')await env.DB.prepare("UPDATE user_profiles SET selected_avatar_type='builtin',selected_avatar_ref='male-01' WHERE account_id=?").bind(id(2)).run();
 if(change==='missing-claim')await env.DB.prepare('DELETE FROM game_active_round_claims WHERE account_id=?').bind(id(2)).run();
 if(change==='third-claim')await env.DB.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(99),id(3),round,now).run();
 expect((await media(projection.avatarVersion)).status).toBe(change==='revoked'?401:change==='reselected'?409:403);
});
it('SD-IT-074: ending while R2 is awaited prevents opening the stream',async()=>{
 const p=await(await call()).json() as any;let ended=false;
 const files=new Proxy(env.FILES,{get(target,key){if(key==='get')return async(name:string)=>{const result=await target.get(name);if(name.endsWith('/neutral.webp')&&!ended){ended=true;await executeCommand(env.DB,'game.round.end',{...auth(),roundId:round},now);}return result;};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
 expect((await media(p.avatarVersion,1,'neutral',{...env,FILES:files})).status).toBe(403);
});
it('SD-IT-074: owners can read saved ready packs but foreign, pending and photo assets cannot use this channel',async()=>{
 const projection=(who:number,target=asset)=>dispatch(new Request('http://platform.internal/v1/commands/avatar.expression.projection',{method:'POST',body:JSON.stringify({...auth(who),assetId:target})}),env,now);
 expect((await projection(1)).status).toBe(404);const response=await projection(2);expect(response.status).toBe(200);const p=await response.json() as any;
 const ownMedia=(who:number)=>dispatch(new Request(`http://platform.internal/v1/avatar/assets/${asset}/${p.avatarVersion}/smile`,{headers:headers(who)}),env,now);
 expect((await ownMedia(2)).status).toBe(200);expect((await ownMedia(1)).status).toBe(404);
 await env.FILES.put(avatarExpressionPrefix(id(2),asset)+'smile.webp',new Uint8Array([0,0,0]),{httpMetadata:{contentType:'image/webp'}});
 expect((await ownMedia(2)).status).toBe(503);
 await env.DB.prepare("UPDATE user_media_assets SET status='pending' WHERE asset_id=?").bind(asset).run();expect((await projection(2)).status).toBe(404);
 await env.DB.prepare("UPDATE user_media_assets SET kind='personal_photo',display_order=0,status='ready' WHERE asset_id=?").bind(asset).run();expect((await projection(2)).status).toBe(404);
});
it('SD-IT-075: only a committed selection notifies its active room with an opaque revision hint; failed replay and other accounts do not',async()=>{
 const notifications:any[]=[];
 env.GAME_ROOMS={idFromName:(name:string)=>name,get:(name:string)=>({fetch:async(request:Request)=>{notifications.push({room:name,body:await request.json()});return Response.json({notified:true});}})} as unknown as DurableObjectNamespace;
 try{
  await env.DB.prepare("UPDATE user_profiles SET gender='diverse' WHERE account_id=?").bind(id(1)).run();
  const select=(revision:number)=>dispatch(new Request('http://platform.internal/v1/commands/profile.avatar.builtin',{method:'POST',body:JSON.stringify({...auth(),avatarId:'male-01',expectedRevision:revision})}),env,now);
  expect((await select(1)).status).toBe(200);expect(notifications).toHaveLength(1);
  expect(notifications[0]).toMatchObject({room:round,body:{roundId:round,ended:false,type:'avatar.updated'}});
  expect(notifications[0].body.revisionHint).toMatch(/^[0-9a-f]{64}$/);
  expect(JSON.stringify(notifications)).not.toContain(id(1));expect(JSON.stringify(notifications)).not.toContain('male-01');
  await select(1);expect(notifications).toHaveLength(1);
  await select(2);expect(notifications).toHaveLength(2);expect(notifications[1].body.revisionHint).not.toBe(notifications[0].body.revisionHint);
 }finally{delete env.GAME_ROOMS;}
});
