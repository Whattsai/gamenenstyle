import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';
import {beforeAll,beforeEach,afterAll,it,expect,vi} from 'vitest';
import {cleanup,dispatch,type PlatformEnv} from '../src/platform';
import {executeCommand} from '../src/commands';
vi.setConfig({testTimeout:20000});

let mf:Miniflare,env:PlatformEnv;
const now=1800000000000;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+3600000};
const headers={
 'X-DatingHigh-Media-Account-Id':auth.accountId,'X-DatingHigh-Media-Session-Id':auth.sessionId,
 'X-DatingHigh-Media-Cv':'1','X-DatingHigh-Media-Expires-At':String(auth.accessExpiresAt)
};
const call=(command:string,payload:Record<string,unknown>,time=now)=>dispatch(new Request(`http://platform.internal/v1/commands/avatar.attempt.${command}`,{
 method:'POST',body:JSON.stringify({...auth,...(command==='select'?{proposedAssetId:payload.attemptId}:{}),...payload})
}),env,time);
const begin=(request=100,attemptId:string|null=null,count=0)=>call('begin',{
 proposedAttemptId:id(50+request),attemptId,styleId:'warm',clientRequestId:id(request),expectedProducedCount:count
});
const publish=(attempt:string,request:number,etag:string,bytes=new Uint8Array([1,2,3]))=>dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${attempt}`,{
 method:'PUT',headers:{...headers,'Content-Type':'image/jpeg','X-DatingHigh-Avatar-Request-Id':id(request),'If-Match':etag},body:bytes
}),env,now);

beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'avatar-attempts'},r2Buckets:{FILES:'avatar-attempts'}}));
 env={DB:await mf.getD1Database('DB') as unknown as D1Database,FILES:await mf.getR2Bucket('FILES') as unknown as R2Bucket,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0001_foundation.sql'};
 for(const name of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql']){
  const sql=readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8');
  await env.DB.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>env.DB.prepare(s)));
 }
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 await env.DB.batch(['DELETE FROM user_media_assets','DELETE FROM user_profiles','DELETE FROM auth_sessions','DELETE FROM auth_accounts'].map(s=>env.DB.prepare(s)));
 const list=await env.FILES.list();if(list.objects.length)await env.FILES.delete(list.objects.map(o=>o.key));
 await env.DB.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(auth.accountId,'anonymous@example.test',now,now,now).run();
 await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(auth.sessionId,auth.accountId,now,now+2592000000,now+604800000).run();
 await executeCommand(env.DB,'profile.ensure',{...auth,profileId:id(3)},now);
 await env.DB.prepare("UPDATE user_profiles SET gender='diverse'").run();
 for(const assetId of [id(10),id(11)]){
  await executeCommand(env.DB,'profile.photo.reserve',{...auth,assetId,objectKey:`private/${auth.accountId}/photos/${assetId}`,mimeType:'image/jpeg'},now);
  await executeCommand(env.DB,'profile.photo.ready',{...auth,assetId},now);
 }
});

it('AP-IT-068: separate Worker calls only acquire one account-wide R2 generation lease',async()=>{
 const responses=await Promise.all([begin(100),begin(101)]);
 expect(responses.map(r=>r.status).sort()).toEqual([200,409]);
 const lease=await responses.find(r=>r.status===200)!.json() as any;
 expect(lease.sourceAssetIds).toEqual([id(10),id(11)]);
 expect(lease.producedCount).toBe(0);expect(lease.lease).toBeTruthy();
 expect((await begin(102,lease.attemptId,0)).status).toBe(409);
});

it('bounded failed request history still allows adopting a valid candidate after request abuse',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const key=`private/${auth.accountId}/avatar/temp/${first.attemptId}/manifest`;
 const object=await env.FILES.get(key);const state=await object!.json() as any;
 state.failedRequestIds=Array.from({length:64},(_,n)=>id(1000+n));
 await env.FILES.put(key,JSON.stringify(state),{httpMetadata:{contentType:'application/json'},customMetadata:{expiresAt:String(state.expiresAt)}});
 expect((await begin(200,first.attemptId,1)).status).toBe(429);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
});

it('a completed first request cannot become a new charged round when replayed after adoption',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
 expect((await call('begin',{proposedAttemptId:id(999),attemptId:null,styleId:'warm',clientRequestId:id(100),expectedProducedCount:0})).status).toBe(409);
 expect((await begin(101)).status).toBe(200);
});

it('deleting a locked source ends the invalid round so a replacement can start without reusing deleted photos',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 await executeCommand(env.DB,'profile.photo.delete-compact',{...auth,assetId:id(10),expectedRevision:1},now);
 expect((await begin(101,first.attemptId,1)).status).toBe(409);
 expect((await(await call('status',{})).json() as any).attempt).toBeNull();
 await executeCommand(env.DB,'profile.photo.reserve',{...auth,assetId:id(12),objectKey:`private/${auth.accountId}/photos/${id(12)}`,mimeType:'image/jpeg'},now);
 await executeCommand(env.DB,'profile.photo.ready',{...auth,assetId:id(12)},now);
 const replacement=await begin(102);expect(replacement.status).toBe(200);
 const lease=await replacement.json() as any;expect(lease.attemptId).not.toBe(first.attemptId);expect(lease.sourceAssetIds).not.toContain(id(10));
});

it('server-only lease cleanup survives access expiry, while expired credentials still cannot read or adopt',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const next=await(await call('begin',{proposedAttemptId:id(151),attemptId:first.attemptId,styleId:'warm',clientRequestId:id(101),expectedProducedCount:1,accessExpiresAt:now+5})).json() as any;
 const failed=await call('fail',{attemptId:first.attemptId,clientRequestId:id(101),lease:next.lease,uncertain:true,accessExpiresAt:now+5},now+10);
 expect(failed.status).toBe(200);
 expect((await(await call('status',{})).json() as any).attempt.status).toBe('uncertain');
 const expiredHeaders={...headers,'X-DatingHigh-Media-Expires-At':String(now+5)};
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers:expiredHeaders}),env,now+10)).status).toBe(401);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1,accessExpiresAt:now+5},now+10)).status).toBe(401);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
});

it('revoking a family does not strand its failed lease or authorize new reads; a fresh own family can adopt earlier work',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const next=await(await begin(101,first.attemptId,1)).json() as any;
 await env.DB.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,auth.sessionId).run();
 expect((await call('fail',{attemptId:first.attemptId,clientRequestId:id(101),lease:next.lease,uncertain:true})).status).toBe(200);
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers}),env,now)).status).toBe(401);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(401);
 await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(8),auth.accountId,now,now+2592000000,now+604800000).run();
 expect((await call('select',{sessionId:id(8),attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
});

it('a second valid account cannot read or adopt another account candidate or formal avatar',async()=>{
 const other={accountId:id(30),sessionId:id(31),cv:1,accessExpiresAt:now+7200000};
 await env.DB.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(other.accountId,'other-fixture@example.test',now,now,now).run();
 await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(other.sessionId,other.accountId,now,now+2592000000,now+604800000).run();
 await executeCommand(env.DB,'profile.ensure',{...other,profileId:id(32)},now);
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const foreignHeaders={...headers,'X-DatingHigh-Media-Account-Id':other.accountId,'X-DatingHigh-Media-Session-Id':other.sessionId};
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers:foreignHeaders}),env,now)).status).toBe(404);
 expect((await call('select',{...other,attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(404);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
 expect((await executeCommand(env.DB,'profile.avatar.generated',{...other,assetId:first.attemptId,expectedRevision:1},now)).rows).toHaveLength(0);
 expect((await dispatch(new Request(`http://platform.internal/v1/media/assets/${first.attemptId}`,{headers:foreignHeaders}),env,now)).status).toBe(404);
 expect((await executeCommand(env.DB,'profile.read',other,now)).rows[0]).toMatchObject({revision:1,selected_avatar_ref:null});
});

it('AP-IT-067: successful candidates accumulate one by one, replay is idempotent and fifth fails',async()=>{
 let attempt:string|null=null;
 for(let i=0;i<4;i++){
  const response=await begin(100+i,attempt,i);expect(response.status).toBe(200);
  const lease=await response.json() as any;attempt=lease.attemptId;
  const result=await publish(attempt!,100+i,lease.lease,new Uint8Array([i+1,2,3]));expect(result.status).toBe(200);
  const body=await result.json() as any;expect(body.index).toBe(i+1);expect(body.producedCount).toBe(i+1);
  const replay=await begin(100+i,attempt,i);expect(replay.status).toBe(200);
  expect((await replay.json() as any).completed).toBe(true);
 }
 expect((await begin(105,attempt,4)).status).toBe(409);
 const photo=await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${attempt}/2`,{headers}),env,now);
 expect(photo.status).toBe(200);expect(new Uint8Array(await photo.arrayBuffer())).toEqual(new Uint8Array([2,2,3]));
});

it('continuation rejects a forged attempt, valid-but-changed style and non-contiguous count without changing prior work',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const profile=JSON.stringify((await executeCommand(env.DB,'profile.read',auth,now)).rows);
 expect((await begin(101,id(998),1)).status).toBe(404);
 const changed=await call('begin',{proposedAttemptId:id(999),attemptId:first.attemptId,styleId:'moon',clientRequestId:id(102),expectedProducedCount:1});expect(changed.status).toBe(400);expect((await changed.json() as any).code).toBe('INVALID_AVATAR_SELECTION');
 for(const count of [0,2,3])expect((await begin(103+count,first.attemptId,count)).status).toBe(409);
 expect((await(await call('status',{})).json() as any).attempt).toMatchObject({status:'open',producedCount:1});
 expect(JSON.stringify((await executeCommand(env.DB,'profile.read',auth,now)).rows)).toBe(profile);
 expect((await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar'").all()).results).toHaveLength(0);
 const readable=await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers}),env,now);expect(readable.status).toBe(200);expect(new Uint8Array(await readable.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));
 expect((await begin(110,first.attemptId,1)).status).toBe(200);
});

it('AP-IT-053: only completed owner indices one and two read; invalid indices, missing and foreign attempts never discover another owner key',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease,new Uint8Array([1,2,3]));
 const second=await(await begin(101,first.attemptId,1)).json() as any;await publish(first.attemptId,101,second.lease,new Uint8Array([4,5,6]));
 const read=(attempt:string,index:number,requestHeaders=headers,environment=env)=>dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${attempt}/${index}`,{headers:requestHeaders}),environment,now);
 for(const [index,bytes] of [[1,[1,2,3]],[2,[4,5,6]]] as const){
  const response=await read(first.attemptId,index);expect(response.status).toBe(200);expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(bytes));
  expect(response.headers.get('Cache-Control')).toBe('no-store');expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
 }
 for(const index of [0,3,4,5])expect([400,404]).toContain((await read(first.attemptId,index)).status);
 expect((await read(id(999),1)).status).toBe(404);
 const other={accountId:id(30),sessionId:id(31)};
 await env.DB.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(other.accountId,'index-boundary@example.test',now,now,now).run();
 await env.DB.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(other.sessionId,other.accountId,now,now+2592000000,now+604800000).run();
 const lookedUp:string[]=[];
 const checked={...env,FILES:new Proxy(env.FILES,{get(target,property){
  if(property==='get')return async(key:string,options?:R2GetOptions)=>{lookedUp.push(key);return target.get(key,options);};
  const member=Reflect.get(target,property);return typeof member==='function'?member.bind(target):member;
 }})};
 const otherHeaders={...headers,'X-DatingHigh-Media-Account-Id':other.accountId,'X-DatingHigh-Media-Session-Id':other.sessionId};
 expect((await read(first.attemptId,1,otherHeaders,checked)).status).toBe(404);
 expect(lookedUp.length).toBeGreaterThan(0);expect(lookedUp.every(key=>key.startsWith(`private/${other.accountId}/`))).toBe(true);
 expect((await(await call('status',{})).json() as any).attempt).toMatchObject({producedCount:2,status:'open'});
 expect((await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar'").all()).results).toHaveLength(0);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:1,selected_avatar_ref:null});
});

it('AP-IT-069: uncertain provider call never unlocks automatic retry and preserves earlier candidate',async()=>{
 const first=await (await begin()).json() as any;
 expect((await publish(first.attemptId,100,first.lease)).status).toBe(200);
 const second=await (await begin(101,first.attemptId,1)).json() as any;
 expect((await publish(first.attemptId,101,second.lease,new Uint8Array([4,5,6]))).status).toBe(200);
 const third=await (await begin(102,first.attemptId,2)).json() as any;
 expect((await call('fail',{attemptId:first.attemptId,clientRequestId:id(102),lease:third.lease,uncertain:true})).status).toBe(200);
 expect((await begin(102,first.attemptId,2)).status).toBe(409);
 expect((await begin(103,first.attemptId,2)).status).toBe(409);
 expect((await(await call('status',{})).json() as any).attempt.producedCount).toBe(2);
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers}),env,now)).status).toBe(200);
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/2`,{headers}),env,now)).status).toBe(200);
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/3`,{headers}),env,now)).status).toBe(404);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
});

it('AP-IT-064: 59:59 readable, exactly 60:00 and 60:01 cannot read or adopt even before GC',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const refreshed={...headers,'X-DatingHigh-Media-Expires-At':String(now+7200000)};
 const read=(offset:number)=>dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers:refreshed}),env,now+offset);
 expect((await read(3599000)).status).toBe(200);
 for(const offset of [3600000,3601000]){
  expect((await read(offset)).status).toBe(410);
  const selection=await dispatch(new Request('http://platform.internal/v1/commands/avatar.attempt.select',{method:'POST',body:JSON.stringify({...auth,accessExpiresAt:now+7200000,attemptId:first.attemptId,proposedAssetId:first.attemptId,index:1,expectedRevision:1})}),env,now+offset);
  expect(selection.status).toBe(410);
 }
 expect((await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar'").all()).results).toHaveLength(0);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:1,selected_avatar_ref:null});
 expect(await env.FILES.get(`private/${auth.accountId}/avatar/temp/${first.attemptId}/1`)).not.toBeNull();
});

it('AP-IT-064: unproduced, expired, stale lease, duplicate image and deleted source cannot publish or read',async()=>{
 const first=await (await begin()).json() as any;
 expect((await publish(first.attemptId,100,'stale')).status).toBe(409);
 expect((await publish(first.attemptId,100,first.lease)).status).toBe(200);
 const second=await (await begin(101,first.attemptId,1)).json() as any;
 expect((await publish(first.attemptId,101,second.lease)).status).toBe(409);
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/2`,{headers}),env,now)).status).toBe(404);
 expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers}),env,now+3600001)).status).toBe(401);
 await executeCommand(env.DB,'profile.photo.delete-compact',{...auth,assetId:id(10),expectedRevision:1},now);
 const next=await begin(102,first.attemptId,1);expect([400,409]).toContain(next.status);
});

it('AP-IT-063: adoption closes the round and saves only one permanent avatar with profile CAS',async()=>{
 const first=await (await begin()).json() as any;
 await publish(first.attemptId,100,first.lease);
 const second=await (await begin(101,first.attemptId,1)).json() as any;
 await publish(first.attemptId,101,second.lease,new Uint8Array([4,5,6]));
 const selected=await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1});
 expect(selected.status).toBe(200);
 expect((await selected.json() as any).revision).toBe(2);
 const rows=await env.DB.prepare("SELECT asset_id,status FROM user_media_assets WHERE kind='generated_avatar'").all();
 expect(rows.results).toEqual([{asset_id:first.attemptId,status:'ready'}]);
 expect((await env.DB.prepare('SELECT selected_avatar_ref FROM user_profiles').first())?.selected_avatar_ref).toBe(first.attemptId);
 expect((await begin(102,first.attemptId,2)).status).toBe(409);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
 expect((await call('select',{attemptId:first.attemptId,index:2,expectedRevision:1})).status).toBe(409);
 const image=await dispatch(new Request(`http://platform.internal/v1/media/assets/${first.attemptId}`,{headers}),env,now);
 expect(image.status).toBe(200);expect(new Uint8Array(await image.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));
 await cleanup(env,now+7200001);
 expect(await env.FILES.get(`private/${auth.accountId}/avatar/${first.attemptId}`)).not.toBeNull();
 for(const index of [1,2])expect(await env.FILES.get(`private/${auth.accountId}/avatar/temp/${first.attemptId}/${index}`)).toBeNull();
});

it('AP-IT-054/063: simultaneous different choices at one revision preserve exactly one readable formal image',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const next=await(await begin(101,first.attemptId,1)).json() as any;await publish(first.attemptId,101,next.lease,new Uint8Array([4,5,6]));
 const selected=await Promise.all([call('select',{attemptId:first.attemptId,proposedAssetId:id(990),index:1,expectedRevision:1}),call('select',{attemptId:first.attemptId,proposedAssetId:id(991),index:2,expectedRevision:1})]);
 expect(selected.map(r=>r.status).sort()).toEqual([200,409]);const index=selected[0].status===200?1:2;
 const receipt=await selected.find(r=>r.status===200)!.json() as any;expect(receipt.revision).toBe(2);
 expect((await env.DB.prepare("SELECT asset_id,status FROM user_media_assets WHERE kind='generated_avatar'").all()).results).toEqual([{asset_id:receipt.assetId,status:'ready'}]);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({revision:2,selected_avatar_ref:receipt.assetId});
 const formal=await dispatch(new Request(`http://platform.internal/v1/media/assets/${receipt.assetId}`,{headers}),env,now);expect(formal.status).toBe(200);
 expect(new Uint8Array(await formal.arrayBuffer())).toEqual(new Uint8Array(index===1?[1,2,3]:[4,5,6]));
 expect(await env.FILES.head(`private/${auth.accountId}/avatar/${index===1?id(991):id(990)}`)).toBeNull();
 expect((await begin(102,first.attemptId,2)).status).toBe(409);
});

it('AP-IT-035: byte-identical output adds no index, preserves candidate and permits only an explicit fresh request',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const before=JSON.stringify((await executeCommand(env.DB,'profile.read',auth,now)).rows);
 const next=await(await begin(101,first.attemptId,1)).json() as any;const duplicate=await publish(first.attemptId,101,next.lease);
 expect(duplicate.status).toBe(409);expect((await duplicate.json() as any).code).toBe('AVATAR_DUPLICATE_IMAGE');
 expect((await(await call('status',{})).json() as any).attempt).toMatchObject({producedCount:1,status:'open'});
 expect((await begin(101,first.attemptId,1)).status).toBe(409);
 expect(await env.FILES.head(`private/${auth.accountId}/avatar/temp/${first.attemptId}/2`)).toBeNull();
 expect(new Uint8Array(await(await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers}),env,now)).arrayBuffer())).toEqual(new Uint8Array([1,2,3]));
 expect((await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar'").all()).results).toHaveLength(0);
 expect(JSON.stringify((await executeCommand(env.DB,'profile.read',auth,now)).rows)).toBe(before);
 const retry=await(await begin(102,first.attemptId,1)).json() as any;expect((await publish(first.attemptId,102,retry.lease,new Uint8Array([4,5,6]))).status).toBe(200);
 expect((await(await call('status',{})).json() as any).attempt.producedCount).toBe(2);
});

it('AP-IT-063: revision conflict during adoption preserves prior avatar and leaves candidates selectable',async()=>{
 const first=await (await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 await executeCommand(env.DB,'profile.avatar.builtin',{...auth,avatarId:'female-01',expectedRevision:1},now);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(409);
 expect((await env.DB.prepare('SELECT selected_avatar_ref FROM user_profiles').first())?.selected_avatar_ref).toBe('female-01');
 expect((await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar' AND status='ready'").all()).results).toHaveLength(0);
 expect((await call('select',{attemptId:first.attemptId,proposedAssetId:id(999),index:1,expectedRevision:2})).status).toBe(200);
});

it('AP-IT-063: an overlapping adoption cannot commit a formal image removed by failure compensation',async()=>{
 await executeCommand(env.DB,'profile.avatar.builtin',{...auth,avatarId:'female-01',expectedRevision:1},now);
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 let enterFirst!:()=>void,enterSecond!:()=>void,releaseFirst!:()=>void,releaseSecond!:()=>void;
 const firstEntered=new Promise<void>(r=>enterFirst=r),secondEntered=new Promise<void>(r=>enterSecond=r);
 const firstGate=new Promise<void>(r=>releaseFirst=r),secondGate=new Promise<void>(r=>releaseSecond=r);let writes=0;
 const failingDb=new Proxy(env.DB,{get(target,key){
  if(key==='batch')return async(statements:D1PreparedStatement[])=>{
   if(statements.length!==2)return target.batch(statements); // select中的adopt才是兩條SQL；驗Session／profile讀取不暫停。
   writes++;if(writes===1){enterFirst();await firstGate;throw new Error('Controlled pre-commit adoption failure');}
   if(writes===2){enterSecond();await secondGate;}
   return target.batch(statements);
  };
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});
 const select=()=>dispatch(new Request('http://platform.internal/v1/commands/avatar.attempt.select',{method:'POST',body:JSON.stringify({...auth,attemptId:first.attemptId,proposedAssetId:first.attemptId,index:1,expectedRevision:2})}),{...env,DB:failingDb},now);
 const pendingFirst=select();await firstEntered;const pendingSecond=select();
 try{
  // 完全依同步gate，不靠睡眠猜排程：讓失敗補償發生在第二筆D1提交前。
  await Promise.race([secondEntered,pendingSecond]);releaseFirst();expect((await pendingFirst).status).toBe(503);releaseSecond();const secondResult=await pendingSecond;
  const current=(await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as {selected_avatar_ref:string};
  const generated=(await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar' AND status='ready'").all()).results;
  expect({avatar:current.selected_avatar_ref,ready:generated.length,formalExists:!!await env.FILES.head(`private/${auth.accountId}/avatar/${first.attemptId}`)}).toEqual({avatar:'female-01',ready:0,formalExists:false});
  expect((await env.DB.prepare('SELECT status FROM user_media_assets WHERE asset_id=?').bind(first.attemptId).first())?.status).toBe('deleted');
  expect(secondResult.status).toBe(409);
  expect((await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers}),env,now)).status).toBe(200);
  expect((await call('select',{attemptId:first.attemptId,proposedAssetId:id(999),index:1,expectedRevision:2})).status).toBe(200);
  const image=await dispatch(new Request(`http://platform.internal/v1/media/assets/${id(999)}`,{headers}),env,now);expect(image.status).toBe(200);expect(new Uint8Array(await image.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));
 }finally{releaseFirst();releaseSecond();await Promise.allSettled([pendingFirst,pendingSecond]);}
});

it('a lost D1 adoption acknowledgement recovers the receipt without deleting ready media or increasing revision twice',async()=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 let lost=false;
 const droppingDb=new Proxy(env.DB,{get(target,key){
  if(key==='batch')return async(statements:D1PreparedStatement[])=>{const result=await target.batch(statements);if(statements.length===2&&!lost){lost=true;throw new Error('Controlled lost commit acknowledgement');}return result;};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});
 const selected=await dispatch(new Request('http://platform.internal/v1/commands/avatar.attempt.select',{method:'POST',body:JSON.stringify({...auth,attemptId:first.attemptId,proposedAssetId:id(998),index:1,expectedRevision:1})}),{...env,DB:droppingDb},now);
 expect(selected.status).toBe(200);expect(await selected.json()).toEqual({revision:2,assetId:id(998)});expect(lost).toBe(true);
 const replay=await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1});expect(replay.status).toBe(200);expect(await replay.json()).toEqual({revision:2,assetId:id(998)});
 expect((await env.DB.prepare("SELECT status FROM user_media_assets WHERE asset_id=?").bind(id(998)).first())?.status).toBe('ready');
 const image=await dispatch(new Request(`http://platform.internal/v1/media/assets/${id(998)}`,{headers}),env,now);expect(image.status).toBe(200);expect(new Uint8Array(await image.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));
 expect((await begin(101,first.attemptId,1)).status).toBe(409);
});

it.each(['status','begin'])('a committed avatar with failed manifest closure is reconciled by %s without another generation',async(recovery)=>{
 const first=await(await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const failingFiles=new Proxy(env.FILES,{get(target,key){
  if(key==='put')return async(name:string,value:any,options:any)=>{if(name.endsWith('/manifest')&&typeof value==='string'&&JSON.parse(value).status==='closed')throw new Error('Controlled manifest storage outage');return target.put(name,value,options);};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }});
 const selected=await dispatch(new Request('http://platform.internal/v1/commands/avatar.attempt.select',{method:'POST',body:JSON.stringify({...auth,attemptId:first.attemptId,proposedAssetId:id(997),index:1,expectedRevision:1})}),{...env,FILES:failingFiles},now);
 expect(selected.status).toBe(200);expect(await selected.json()).toEqual({revision:2,assetId:id(997)});
 const key=`private/${auth.accountId}/avatar/temp/${first.attemptId}/manifest`;
 expect((await(await env.FILES.get(key))!.json() as any).status).toBe('adopting');
 if(recovery==='status')expect(await(await call('status',{})).json()).toEqual({attempt:null});
 else expect((await begin(100)).status).toBe(409);
 expect((await(await env.FILES.get(key))!.json() as any).status).toBe('closed');
 const next=await begin(101);expect(next.status).toBe(200);expect((await next.json() as any).attemptId).not.toBe(first.attemptId);
 expect((await executeCommand(env.DB,'profile.read',auth,now)).rows[0]).toMatchObject({selected_avatar_ref:id(997),revision:2});
});

it('AP-IT-069: read-only status recovers initial response loss without scheduling another provider call',async()=>{
 const first=await (await begin()).json() as any;
 const status=await call('status',{});expect(status.status).toBe(200);
 const body=await status.json() as any;
 expect(body.attempt.attemptId).toBe(first.attemptId);expect(body.attempt.status).toBe('generating');
 expect(body.attempt).not.toHaveProperty('lease');expect(body.attempt).not.toHaveProperty('sourceAssetIds');
 await publish(first.attemptId,100,first.lease);
 expect((await (await call('status',{})).json() as any).attempt.producedCount).toBe(1);
});

it('AP-IT-064/GC: refreshed session still gets 410 at candidate expiry; GC preserves selected permanent avatar',async()=>{
 const first=await (await begin()).json() as any;await publish(first.attemptId,100,first.lease);
 const refreshed={...headers,'X-DatingHigh-Media-Expires-At':String(now+7200000)};
 const expired=await dispatch(new Request(`http://platform.internal/v1/avatar/candidates/${first.attemptId}/1`,{headers:refreshed}),env,now+3600001);
 expect(expired.status).toBe(410);
 expect((await call('select',{attemptId:first.attemptId,index:1,expectedRevision:1})).status).toBe(200);
 expect((await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE kind='generated_avatar' AND status='ready'").all()).results).toEqual([{asset_id:first.attemptId}]);
 expect((await begin(101,first.attemptId,1)).status).toBe(409);
 await cleanup(env,now+7200001);
 const prefix=`private/${auth.accountId}/avatar/`;
 expect(await env.FILES.get(prefix+first.attemptId)).not.toBeNull();
 expect(await env.FILES.get(prefix+'temp/'+first.attemptId+'/manifest')).toBeNull();
 expect(await env.FILES.get(prefix+'temp/'+first.attemptId+'/1')).toBeNull();
});
