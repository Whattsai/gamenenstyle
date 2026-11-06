import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { executeCommand } from '../src/commands';
import { cleanup, dispatch, type PlatformEnv } from '../src/platform';

let mf:Miniflare,db:D1Database,files:R2Bucket,env:PlatformEnv;
const now=1800000000000;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const a=id(1),aSession=id(2),b=id(3),bSession=id(4),photo=id(90);
const authA={accountId:a,sessionId:aSession,cv:1,accessExpiresAt:now+600000};
const authB={accountId:b,sessionId:bSession,cv:1,accessExpiresAt:now+600000};
const key=`private/${a}/photos/${photo}`;
const sample=new Uint8Array([0xff,0xd8,0xff,0xe0,0x11,0x22,0x33,0xff,0xd9]);
const headers=(auth:typeof authA=authA)=>({
 'X-DatingHigh-Media-Account-Id':auth.accountId,
 'X-DatingHigh-Media-Session-Id':auth.sessionId,
 'X-DatingHigh-Media-Cv':String(auth.cv),
 'X-DatingHigh-Media-Expires-At':String(auth.accessExpiresAt)
});
const call=(method:string,auth:typeof authA=authA,assetId=photo,hostname='platform.internal')=>
 dispatch(new Request(`http://${hostname}/v1/media/personal-photos/${assetId}`,{method,headers:headers(auth)}),env,now);

beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({
  modules:true,script:'export default {fetch(){return new Response("ok")}}',
  compatibilityDate:'2026-10-24',
  d1Databases:{DB:'private-photo-media-d1'},r2Buckets:{FILES:'private-photo-media-r2'}
 }));
 db=await mf.getD1Database('DB') as unknown as D1Database;
 files=await mf.getR2Bucket('FILES') as unknown as R2Bucket;
 for(const migration of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql']){
  const sql=readFileSync(new URL(`../migrations/${migration}`,import.meta.url),'utf8');
  await db.batch(sql.split(';').map(q=>q.trim()).filter(Boolean).map(q=>db.prepare(q)));
 }
 env={DB:db,FILES:files,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0001_foundation.sql'};
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 await db.batch(['DELETE FROM match_conditions','DELETE FROM user_media_assets','DELETE FROM user_profiles',
                 'DELETE FROM auth_sessions','DELETE FROM auth_accounts'].map(q=>db.prepare(q)));
 for(const [accountId,sessionId,email] of [[a,aSession,'a@example.test'],[b,bSession,'b@example.test']]){
  await db.prepare("INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) VALUES (?,?,?,'active',1,?,?)").bind(accountId,email,now,now,now).run();
  await db.prepare("INSERT INTO auth_sessions(session_id,account_id,client_platform,credential_version,current_generation,created_at,absolute_expires_at,idle_expires_at) VALUES (?,?,'web',1,0,?,?,?)").bind(sessionId,accountId,now,now+2592000000,now+604800000).run();
 }
 await files.delete(key);
 await executeCommand(db,'profile.ensure',{...authA,profileId:id(50)},now);
});
const reserve=async()=>{
 const result=await executeCommand(db,'profile.photo.reserve',{...authA,assetId:photo,objectKey:key,mimeType:'image/jpeg'},now);
 expect(result.rows).toHaveLength(1);
};
const ready=async()=>{
 const result=await executeCommand(db,'profile.photo.ready',{...authA,assetId:photo},now);
 expect(result.rows).toHaveLength(1);
};

it('AP-IT-PHOTO-MEDIA-001: verified own ready photo streams private R2 without URL or credentials',async()=>{
 await reserve();await ready();
 await files.put(key,sample,{httpMetadata:{contentType:'image/jpeg'}});
 const response=await call('GET');
 expect(response.status).toBe(200);
 expect(response.headers.get('Content-Type')).toBe('image/jpeg');
 expect(response.headers.get('Cache-Control')).toBe('no-store');
 expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
 expect(response.headers.get('Content-Length')).toBe(String(sample.length));
 expect(response.headers.get('X-DatingHigh-Media-Account-Id')).toBeNull();
 expect(new Uint8Array(await response.arrayBuffer())).toEqual(sample);
});

it('AP-IT-PHOTO-MEDIA-002: guessed photo ID, other account, revoked session and direct public host never read R2',async()=>{
 await reserve();await ready();
 await files.put(key,sample,{httpMetadata:{contentType:'image/jpeg'}});
 expect((await call('GET',authB)).status).toBe(404);
 expect((await call('GET',authA,id(91))).status).toBe(404);
 expect((await call('GET',authA,photo,'example.test')).status).toBe(404);
 await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,aSession).run();
 expect((await call('GET')).status).toBe(401);
 expect(await (await files.get(key))?.arrayBuffer()).toBeDefined();
});

it('AP-IT-PHOTO-MEDIA-003: R2 deletion requires D1 tombstone; pending/ready must not be purged or streamed',async()=>{
 await reserve();
 await files.put(key,sample,{httpMetadata:{contentType:'image/jpeg'}});
 expect((await call('GET')).status).toBe(404);
 expect((await call('DELETE')).status).toBe(409);
 expect(await files.get(key)).not.toBeNull();
 await ready();
 expect((await call('DELETE')).status).toBe(409);
 expect((await call('GET')).status).toBe(200);
 await executeCommand(db,'profile.photo.delete-compact',{...authA,assetId:photo,expectedRevision:1},now);
 expect((await call('GET')).status).toBe(404);
 expect((await call('DELETE',authB)).status).toBe(404);
 expect((await call('DELETE')).status).toBe(204);
 expect(await files.get(key)).toBeNull();
});

it('AP-IT-PHOTO-MEDIA-004: corrupted R2 size or mismatched MIME fails closed',async()=>{
 await reserve();await ready();
 await files.put(key,new Uint8Array(200001),{httpMetadata:{contentType:'image/jpeg'}});
 expect((await call('GET')).status).toBe(503);
 await files.put(key,sample,{httpMetadata:{contentType:'image/png'}});
 expect((await call('GET')).status).toBe(503);
 expect((await call('DELETE')).status).toBe(409);
});

const upload=async(bytes:Uint8Array=sample,auth=authA,mime='image/jpeg')=>dispatch(
 new Request(`http://platform.internal/v1/media/personal-photos/${photo}`,{
  method:'PUT',headers:{...headers(auth),'Content-Type':mime},body:new Uint8Array(bytes)
 }),env,now);

it('AP-IT-PHOTO-UPLOAD-001: only pending owner may create compressed R2 once; ready transition follows storage',async()=>{
 await reserve();
 expect((await upload()).status).toBe(201);
 expect((await files.get(key))?.httpMetadata?.contentType).toBe('image/jpeg');
 expect((await call('GET')).status).toBe(200);
 expect((await upload(new Uint8Array([1,2,3]))).status).toBe(409);
 expect(new Uint8Array(await (await files.get(key))!.arrayBuffer())).toEqual(sample);
});

it('AP-IT-PHOTO-UPLOAD-002: guessed ID, foreign account, size and MIME mismatch cannot persist bytes',async()=>{
 expect((await upload()).status).toBe(404);
 await reserve();
 expect((await upload(sample,authB)).status).toBe(404);
 expect((await upload(new Uint8Array(200001))).status).toBe(413);
 expect((await upload(new Uint8Array())).status).toBe(400);
 expect((await upload(sample,authA,'image/png')).status).toBe(400);
 expect(await files.get(key)).toBeNull();
 await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,aSession).run();
 expect((await upload()).status).toBe(401);
 expect(await files.get(key)).toBeNull();
});

it('AP-IT-PHOTO-UPLOAD-003: R2 put failure tombstones pending reservation without deleting other ready photos',async()=>{
 await reserve();
 const failedEnv={...env,FILES:new Proxy(files,{get(target,property){
  if(property==='put')return async()=>{throw new Error('controlled storage unavailable');};
  const member=Reflect.get(target,property);return typeof member==='function'?member.bind(target):member;
 }})};
 const response=await dispatch(new Request(`http://platform.internal/v1/media/personal-photos/${photo}`,{
  method:'PUT',headers:{...headers(),'Content-Type':'image/jpeg'},body:sample
 }),failedEnv,now);
 expect(response.status).toBe(503);
 expect((await db.prepare('SELECT status FROM user_media_assets WHERE asset_id=?').bind(photo).first())?.status).toBe('deleted');
 expect(await files.get(key)).toBeNull();
});

it('AP-IT-048: four ready plus one pending already exhaust quota before housekeeping and leave no readable sixth object',async()=>{
 const existing:string[]=[];
 for(let n=0;n<5;n++){
  const asset=id(500+n),objectKey=`private/${a}/photos/${asset}`;existing.push(objectKey);
  expect((await executeCommand(db,'profile.photo.reserve',{...authA,assetId:asset,objectKey,mimeType:'image/jpeg'},now)).rows).toHaveLength(1);
  await files.put(objectKey,sample,{httpMetadata:{contentType:'image/jpeg'}});
  if(n<4)expect((await executeCommand(db,'profile.photo.ready',{...authA,assetId:asset},now)).rows).toHaveLength(1);
 }
 const before=(await db.prepare('SELECT * FROM user_media_assets ORDER BY asset_id').all()).results;
 const sixth=id(505),objectKey=`private/${a}/photos/${sixth}`;
 expect((await executeCommand(db,'profile.photo.reserve',{...authA,assetId:sixth,objectKey,mimeType:'image/jpeg'},now)).rows).toHaveLength(0);
 expect((await db.prepare('SELECT * FROM user_media_assets ORDER BY asset_id').all()).results).toEqual(before);
 const denied=await dispatch(new Request(`http://platform.internal/v1/media/personal-photos/${sixth}`,{method:'PUT',headers:{...headers(),'Content-Type':'image/jpeg'},body:sample}),env,now);
 expect(denied.status).toBe(404);expect(await files.get(objectKey)).toBeNull();
 expect((await executeCommand(db,'profile.photo.list',authA,now)).rows).toHaveLength(4);
 expect((await db.prepare("SELECT asset_id FROM user_media_assets WHERE status='pending'").all()).results).toHaveLength(1);
 for(const retained of existing)expect(await files.get(retained)).not.toBeNull();await files.delete(existing);
});

it('AP-IT-PHOTO-GC-001: bounded housekeeping tombstones stale pending and removes only tombstoned R2 objects',async()=>{
 await reserve();await files.put(key,sample,{httpMetadata:{contentType:'image/jpeg'}});
 // Stale pending may no longer publish; current ready assets must survive cleanup.
 await db.prepare('UPDATE user_media_assets SET created_at=? WHERE asset_id=?').bind(now-3600001,photo).run();
 const survivor=id(92),survivorKey=`private/${a}/photos/${survivor}`;
 await executeCommand(db,'profile.photo.reserve',{...authA,assetId:survivor,objectKey:survivorKey,mimeType:'image/jpeg'},now);
 await files.put(survivorKey,sample,{httpMetadata:{contentType:'image/jpeg'}});
 await executeCommand(db,'profile.photo.ready',{...authA,assetId:survivor},now);
 await cleanup(env,now);
 expect((await db.prepare('SELECT status FROM user_media_assets WHERE asset_id=?').bind(photo).first())?.status).toBe('deleted');
 expect(await files.get(key)).toBeNull();
 expect(await files.get(survivorKey)).not.toBeNull();
 expect((await upload()).status).toBe(409);
 await files.delete(survivorKey);
});

it('GC resumes tombstone cursor between bounded runs instead of repeating the first deleted rows forever',async()=>{
 const keys:string[]=[];
 for(const n of [990,991,992,993]){
  const asset=id(n),objectKey=`private/${a}/photos/${asset}`;keys.push(objectKey);
  await db.prepare("INSERT INTO user_media_assets VALUES(?,?,'personal_photo',?,'image/jpeg',0,'deleted',?,?)").bind(asset,a,objectKey,now,now).run();
  await files.put(objectKey,sample);
 }
 let elapsed=0;const clock=vi.spyOn(Date,'now').mockImplementation(()=>elapsed);
 const bounded={...env,FILES:new Proxy(files,{get(target,property){
  if(property==='delete')return async(key:string)=>{elapsed+=5;return target.delete(key);};
  const member=Reflect.get(target,property);return typeof member==='function'?member.bind(target):member;
 }})};
 try{for(let n=0;n<3;n++){elapsed=0;await cleanup(bounded,now,8);}}
 finally{clock.mockRestore();}
 for(const objectKey of keys)expect(await files.get(objectKey)).toBeNull();
 expect((await db.prepare("SELECT asset_id FROM user_media_assets WHERE status='deleted'").all()).results).toHaveLength(4);
});

it('GC drains a multi-page photo, candidate and formal-orphan backlog across bounded scheduled runs without deleting live media',async()=>{
 const checkpoint='_system/avatar-preferences/cleanup.json';await files.delete(checkpoint);
 const removed:string[]=[],retained:string[]=[];const statements:D1PreparedStatement[]=[];
 for(let n=0;n<225;n++){
  const asset=id(10000+n),objectKey=`private/${a}/photos/${asset}`;removed.push(objectKey);
  statements.push(db.prepare("INSERT INTO user_media_assets VALUES(?,?,'personal_photo',?,'image/jpeg',0,'deleted',?,?)").bind(asset,a,objectKey,now-3600000,now-1800000));
  await files.put(objectKey,sample);
  const candidate=`private/${a}/avatar/temp/${id(20000+n)}/1`;removed.push(candidate);
  await files.put(candidate,sample,{customMetadata:{expiresAt:String(now-1)}});
  const orphan=`private/${a}/avatar/${id(30000+n)}`;removed.push(orphan);
  await files.put(orphan,sample,{customMetadata:{orphanAfter:String(now-1)}});
 }
 const livePhoto=id(40000),liveFormal=id(40001);
 for(const [asset,kind,objectKey] of [[livePhoto,'personal_photo',`private/${a}/photos/${livePhoto}`],[liveFormal,'generated_avatar',`private/${a}/avatar/${liveFormal}`]]){
  retained.push(objectKey);
  statements.push(db.prepare("INSERT INTO user_media_assets VALUES(?,?,?,?, 'image/jpeg',?,'ready',?,NULL)").bind(asset,a,kind,objectKey,kind==='personal_photo'?0:null,now));
  await files.put(objectKey,sample,{customMetadata:{orphanAfter:String(now-1)}});
 }
 const futureTemp=`private/${a}/avatar/temp/${id(40002)}/1`,futureOrphan=`private/${a}/avatar/${id(40003)}`;
 retained.push(futureTemp,futureOrphan);
 await files.put(futureTemp,sample,{customMetadata:{expiresAt:String(now+60000)}});
 await files.put(futureOrphan,sample,{customMetadata:{orphanAfter:String(now+60000)}});
 for(let offset=0;offset<statements.length;offset+=75)await db.batch(statements.slice(offset,offset+75));
 let elapsed=0,rounds=0;const clock=vi.spyOn(Date,'now').mockImplementation(()=>elapsed);
 const bounded={...env,FILES:new Proxy(files,{get(target,property){
  if(property==='delete')return async(key:string)=>{elapsed++;return target.delete(key);};
  if(property==='list')return async(options:R2ListOptions)=>{elapsed+=3;return target.list(options);};
  const member=Reflect.get(target,property);return typeof member==='function'?member.bind(target):member;
 }})};
 try{
  let remaining=removed.length;
  while(remaining&&rounds<40){
   elapsed=0;const result=await cleanup(bounded,now,60);rounds++;
   expect(elapsed).toBeLessThanOrEqual(63);
   const page=await files.list({prefix:`private/${a}/`,limit:1000});
   expect(page.truncated).toBe(false);remaining=page.objects.filter(object=>removed.includes(object.key)).length;
   if(rounds===1){expect(result.backlog).toBe(true);expect(remaining).toBeGreaterThan(0);expect(remaining).toBeLessThan(removed.length);}
   const state=await(await files.get(checkpoint))!.json<{pending:unknown[]}>();expect(state.pending.length).toBeLessThanOrEqual(100);
   for(const objectKey of retained)expect(page.objects.some(object=>object.key===objectKey)).toBe(true);
  }
  expect(rounds).toBeGreaterThan(1);expect(remaining).toBe(0);
  expect((await db.prepare("SELECT asset_id FROM user_media_assets WHERE status='deleted'").all()).results).toHaveLength(225);
  expect((await db.prepare("SELECT asset_id FROM user_media_assets WHERE status='ready'").all()).results).toHaveLength(2);
  for(const objectKey of retained)expect(new Uint8Array(await(await files.get(objectKey))!.arrayBuffer())).toEqual(sample);
 }finally{clock.mockRestore();await files.delete([...removed,...retained,checkpoint]);}
},600000);

it('AP-IT-PHOTO-UPLOAD-004: simultaneous writes never replace the winning ready photo',async()=>{
 await reserve();
 const [one,two]=await Promise.all([upload(sample),upload(new Uint8Array([9,8,7]))]);
 expect([one.status,two.status].sort()).toEqual([201,409]);
 const actual=new Uint8Array(await (await files.get(key))!.arrayBuffer());
 expect(actual).toEqual(one.status===201?sample:new Uint8Array([9,8,7]));
 expect((await call('GET')).status).toBe(200);
});

it('AP-IT-PHOTO-UPLOAD-005: session revocation during R2 put tombstones and purges instead of publishing',async()=>{
 await reserve();
 const raceEnv={...env,FILES:new Proxy(files,{get(target,property){
  if(property==='put')return async(...args:Parameters<R2Bucket['put']>)=>{
   const result=await target.put(...args);
   await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,aSession).run();
   return result;
  };
  const member=Reflect.get(target,property);return typeof member==='function'?member.bind(target):member;
 }})};
 const response=await dispatch(new Request(`http://platform.internal/v1/media/personal-photos/${photo}`,{
  method:'PUT',headers:{...headers(),'Content-Type':'image/jpeg'},body:sample
 }),raceEnv,now);
 expect(response.status).toBe(409);
 expect((await db.prepare('SELECT status FROM user_media_assets WHERE asset_id=?').bind(photo).first())?.status).toBe('deleted');
 expect(await files.get(key)).toBeNull();
});

it('AP-IT-PHOTO-MEDIA-005: deleting asset while waiting for R2 prevents opening a new stream',async()=>{
 await reserve();await ready();await files.put(key,sample,{httpMetadata:{contentType:'image/jpeg'}});
 const raceEnv={...env,FILES:new Proxy(files,{get(target,property){
  if(property==='get')return async(objectKey:string)=>{
   const result=await target.get(objectKey);
   await executeCommand(db,'profile.photo.delete-compact',{...authA,assetId:photo,expectedRevision:1},now);
   return result;
  };
  const member=Reflect.get(target,property);return typeof member==='function'?member.bind(target):member;
 }})};
 const response=await dispatch(new Request(`http://platform.internal/v1/media/personal-photos/${photo}`,{
  method:'GET',headers:headers()
 }),raceEnv,now);
 expect(response.status).toBe(404);
});
