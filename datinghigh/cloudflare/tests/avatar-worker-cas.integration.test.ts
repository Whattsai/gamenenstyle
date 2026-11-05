import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {beforeAll,afterAll,it,expect} from 'vitest';

// 實際兩個Worker隔離執行環境共用Miniflare D1/R2，不在測試process直接呼叫dispatch。
let mf:Miniflare,one:Awaited<ReturnType<Miniflare['getWorker']>>,two:typeof one;
const now=1800000000000;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+7200000};
const headers={'X-DatingHigh-Media-Account-Id':auth.accountId,'X-DatingHigh-Media-Session-Id':auth.sessionId,'X-DatingHigh-Media-Cv':'1','X-DatingHigh-Media-Expires-At':String(auth.accessExpiresAt)};
beforeAll(async()=>{
 const bundled=await build({stdin:{contents:"import {dispatch} from './src/platform'; export default {async fetch(r,env){const response=await dispatch(r,env,Number(r.headers.get('X-Test-Now')??'1800000000000'));response.headers.set('X-Test-Worker',env.QA_INSTANCE);return response;}};",resolveDir:fileURLToPath(new URL('../',import.meta.url)),sourcefile:'qa-worker.ts',loader:'ts'},bundle:true,write:false,format:'esm',platform:'browser',target:'es2022'});
 const worker=(name:string)=>({name,modules:true as const,script:bundled.outputFiles[0].text,compatibilityDate:'2026-10-24',bindings:{APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0002_avatar_preferences.sql',QA_INSTANCE:name},d1Databases:{DB:'ap-shared-d1'},r2Buckets:{FILES:'ap-shared-r2'}});
 mf=new Miniflare(convertV4MiniflareOptions({workers:[worker('qa-one'),worker('qa-two')]}));
 one=await mf.getWorker('qa-one');two=await mf.getWorker('qa-two');
 const db=await mf.getD1Database('DB','qa-one');
 for(const migration of ['0001_foundation.sql','0002_avatar_preferences.sql'])await db.batch(readFileSync(new URL(`../migrations/${migration}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(auth.accountId,'worker-fixture@example.test',now,now,now).run();
 await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(auth.sessionId,auth.accountId,now,now+2592000000,now+604800000).run();
 for(const command of [ ['profile.ensure',{...auth,profileId:id(3)}],...([10,11].flatMap(n=>[['profile.photo.reserve',{...auth,assetId:id(n),objectKey:`private/${auth.accountId}/photos/${id(n)}`,mimeType:'image/jpeg'}],['profile.photo.ready',{...auth,assetId:id(n)}]]))] as [string,Record<string,unknown>][]){
  expect((await one.fetch(`http://platform.internal/v1/commands/${command[0]}`,{method:'POST',body:JSON.stringify(command[1])})).status).toBe(200);
 }
},60000);
afterAll(async()=>{await mf?.dispose();});
const begin=(worker:typeof one,n:number,attemptId:string|null=null,count=0,time=now)=>worker.fetch('http://platform.internal/v1/commands/avatar.attempt.begin',{method:'POST',headers:{'X-Test-Now':String(time)},body:JSON.stringify({...auth,proposedAttemptId:id(200+n),attemptId,styleId:'warm',clientRequestId:id(n),expectedProducedCount:count})});
const publish=(worker:typeof one,lease:any,n:number,index:number)=>worker.fetch(`http://platform.internal/v1/avatar/candidates/${lease.attemptId}`,{method:'PUT',headers:{...headers,'Content-Type':'image/jpeg','If-Match':lease.lease,'X-DatingHigh-Avatar-Request-Id':id(n)},body:new Uint8Array([index,2,3])});
it('AP-IT-068 two actual Worker instances share account lock, race fourth, replay and refuse fifth',async()=>{
 const first=await Promise.all([begin(one,100),begin(two,101)]);
 expect(first.map(r=>r.headers.get('X-Test-Worker'))).toEqual(['qa-one','qa-two']);expect(first.map(r=>r.status).sort()).toEqual([200,409]);
 const winning=first[0].status===200?100:101;let lease=await first.find(r=>r.status===200)!.json() as any;
 expect((await begin(two,winning,lease.attemptId,0)).status).toBe(409);
 expect((await begin(two,109,lease.attemptId,0,now+3600000)).status).toBe(410);
 expect((await publish(two,lease,winning,1)).status).toBe(200);const attempt=lease.attemptId;
 for(const [n,index] of [[102,2],[103,3]]){lease=await(await begin(one,n,attempt,index-1)).json();expect((await publish(two,lease,n,index)).status).toBe(200);}
 const fourth=await Promise.all([begin(one,104,attempt,3),begin(two,105,attempt,3)]);expect(fourth.map(r=>r.status).sort()).toEqual([200,409]);
 const request=fourth[0].status===200?104:105;lease=await fourth.find(r=>r.status===200)!.json();
 expect((await publish(two,lease,request,4)).status).toBe(200);
 const replay=await(await begin(one,request,attempt,3)).json() as any;expect(replay.completed).toBe(true);expect(replay.producedCount).toBe(4);
 expect((await begin(two,106,attempt,4)).status).toBe(409);
 const expiry=await begin(two,107,attempt,4,now+3600000);expect(expiry.status).toBe(410);
 const fresh=await begin(one,110,null,0,now+3600000);expect(fresh.status).toBe(200);
 expect((await fresh.json() as any).attemptId).not.toBe(attempt);
},60000);
