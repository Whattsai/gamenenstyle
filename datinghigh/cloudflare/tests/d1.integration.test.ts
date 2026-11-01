import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, beforeEach, it, expect } from 'vitest';
import { executeCommand, planCommand,RateLimitPolicies } from '../src/commands';
import {dispatch,cleanup,ready,probeText,probeKey,type PlatformEnv} from '../src/platform';
let mf:Miniflare,db:D1Database,files:R2Bucket,env:PlatformEnv;
const now=1800000000000;
const id=(n:number)=>`019a281e-0000-7000-8000-${n.toString().padStart(12,'0')}`;
const hash=(n:number)=>n.toString(16).padStart(64,'0');
const pair=(n:number)=>({accountId:id(1),sessionId:id(n),tokenId:id(n+1),tokenHash:hash(n),clientPlatform:'web',absoluteExpiresAt:now+2592000000,idleExpiresAt:now+604800000});
const cmd=(name:string,p:any,t=now)=>executeCommand(db,name,p,t);
const rows=async(sql:string)=> (await db.prepare(sql).all()).results as any[];
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'foundation-test'},r2Buckets:{FILES:'foundation-test-files'}}));
 db=await mf.getD1Database('DB') as unknown as D1Database;
 const migration=readFileSync(new URL('../migrations/0001_foundation.sql',import.meta.url),'utf8');
 await db.batch(migration.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare('INSERT INTO d1_migrations(name) VALUES(?)').bind('0001_foundation.sql').run();
 files=await mf.getR2Bucket('FILES') as unknown as R2Bucket;await files.put(probeKey,probeText);
 env={DB:db,FILES:files,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0001_foundation.sql'};
});
it('PF-IT-016 family validation is strict at expiry and rejects every old credential version',async()=>{
 await account();const p={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};expect((await cmd('session.validate',p)).rows).toHaveLength(1);
 expect((await cmd('session.validate',p,now+604800000)).rows).toHaveLength(0);
 await db.prepare('UPDATE auth_accounts SET credential_version=2 WHERE account_id=?').bind(id(1)).run();expect((await cmd('session.validate',p)).rows).toHaveLength(0);
});
it('PF-IT-012 revocation and replacement never authorize or revoke a different newer family',async()=>{
 await account();await cmd('session.create',{...pair(10),cv:1});await cmd('session.revoke',{sessionId:id(2),reason:'logout'});
 expect((await rows(`SELECT revoked_at FROM auth_sessions WHERE session_id='${id(10)}'`))[0].revoked_at).toBeNull();
 const r=await cmd('session.refresh',{accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000,expectedGeneration:0,previousTokenId:id(3),tokenId:id(20),tokenHash:hash(20),idleExpiresAt:now+604800000});expect(r.changes.every(n=>n===0)).toBe(true);
});
it('PF-IT-013 a password mutation prevents stale session creation and refresh at commit',async()=>{
 await account();const p={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};await cmd('account.change-password',{...p,passwordHash:'changed-password'});
 expect((await cmd('session.create',{...pair(10),cv:1})).changes.every(n=>n===0)).toBe(true);
 expect((await cmd('session.validate',p)).rows).toHaveLength(0);expect((await rows('SELECT credential_version FROM auth_accounts'))[0].credential_version).toBe(2);
});
it('PF-IT-023 private R2 namespaces derive owner and deny path/owner injection or revoked sessions',async()=>{
 await account();await cmd('account.register-external',{...pair(10),accountId:id(11),identityId:id(12),provider:'google',subject:'Other',email:'b@gmail.com'});
 const input={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000,purpose:'foundation-test',objectId:id(90)};
 const call=(command:string,p:unknown)=>dispatch(new Request(`http://platform.internal/v1/commands/${command}`,{method:'POST',body:JSON.stringify(p)}),env);
 expect((await call('object.private.put',{...input,content:btoa('private-A')})).status).toBe(200);
 const other={...input,accountId:id(11),sessionId:id(10)};expect((await call('object.private.get',other)).status).toBe(404);
 expect((await call('object.private.put',{...other,owner:id(1),content:btoa('attack')})).status).toBe(400);
 expect((await call('object.private.get',{...input,purpose:'../_system'})).status).toBe(400);
 const read=await call('object.private.get',input);expect(await read.json()).toEqual({content:btoa('private-A')});
 await cmd('session.revoke',{sessionId:id(2),reason:'logout'});expect((await call('object.private.delete',input)).status).toBe(401);
});
it.each(['d1','r2'])('PF-IT-034 PF-BDD-041 %s readiness failure returns a sanitized dependency error',async dependency=>{
 const failing={...env,...(dependency==='d1'?{DB:{prepare(){throw new Error('controlled D1 failure');}} as unknown as D1Database}:{FILES:{async get(){throw new Error('controlled R2 failure');}} as unknown as R2Bucket})};const response=await dispatch(new Request('http://platform.internal/v1/commands/platform.ready',{method:'POST',body:'{}'}),failing,now);expect(response.status).toBe(503);const result=await response.json() as {code:string;traceId:string};expect(result.code).toBe('DEPENDENCY_UNAVAILABLE');expect(result.traceId).toBeTruthy();expect(JSON.stringify(result)).not.toContain('controlled');
});
it('PF-IT-034 ready requires actual migration, schema, probe and environment sender without sending mail',async()=>{
 expect((await ready(env)).status).toBe('ready');await expect(ready({...env,APP_ENV:'staging',EmailDeliveryMode:'Log'})).rejects.toThrow();
 await expect(ready({...env,EXPECTED_MIGRATION:'missing.sql'})).rejects.toThrow();await files.put(probeKey,'wrong');await expect(ready(env)).rejects.toThrow();await files.put(probeKey,probeText);
});
it('PF-IT-034 a renamed column cannot pass readiness merely by preserving the column count',async()=>{
 await db.prepare('ALTER TABLE auth_accounts RENAME COLUMN password_hash TO password_blob').run();
 try{await expect(ready(env)).rejects.toThrow();}finally{await db.prepare('ALTER TABLE auth_accounts RENAME COLUMN password_blob TO password_hash').run();}
});
it('PF-IT-034 a non-unique replacement of the active-family index fails readiness',async()=>{
 await db.prepare('DROP INDEX idx_auth_sessions_active_account').run();await db.prepare('CREATE INDEX idx_auth_sessions_active_account ON auth_sessions(account_id) WHERE revoked_at IS NULL').run();
 try{await expect(ready(env)).rejects.toThrow();}finally{await db.prepare('DROP INDEX idx_auth_sessions_active_account').run();await db.prepare('CREATE UNIQUE INDEX idx_auth_sessions_active_account ON auth_sessions(account_id) WHERE revoked_at IS NULL').run();}
});
it('PF-IT-033 fixed email handler rejects arbitrary templates, stale generations and inactive challenges',async()=>{
 await challenge();const delivered:any[]=[];const sending={...env,APP_ENV:'staging',EmailDeliveryMode:'Cloudflare',EMAIL_FROM:'verified@example.com',EMAIL:{send:async(message:any)=>{delivered.push(message);return {messageId:'controlled-sender'};}}};
 const call=(payload:unknown)=>dispatch(new Request('http://platform.internal/v1/commands/email.code.send',{method:'POST',body:JSON.stringify(payload)}),sending);
 const payload={challengeId:id(50),generation:0,code:'000001'};
 expect((await call({...payload,to:'other@example.com',html:'unapproved'})).status).toBe(400);expect(delivered).toHaveLength(0);
 expect((await call({...payload,generation:1})).status).toBe(503);expect(delivered).toHaveLength(0);
 expect((await call(payload)).status).toBe(200);expect(delivered).toHaveLength(1);expect(delivered[0].to).toBe('b@example.com');expect(delivered[0].from).toBe('verified@example.com');expect(delivered[0].subject).toBe('心動迴路：驗證 Email');expect(delivered[0].html).toBeUndefined();
 await db.prepare("UPDATE auth_email_challenges SET state='consumed' WHERE challenge_id=?").bind(id(50)).run();expect((await call(payload)).status).toBe(503);expect(delivered).toHaveLength(1);
});
it('PF-IT-031 scheduled cleanup drains more than 1000 expired rows and retains active buckets',async()=>{
 await db.prepare(`WITH RECURSIVE n(x) AS(SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<1005) INSERT INTO common_rate_limit_buckets SELECT printf('019a281e-0000-7000-8000-%012d',x),'email_code_send.v1','email',printf('%064x',x),${now-3600000},1,${now-1} FROM n`).run();
 await cmd('rate-limit.consume',{entries:[{bucketId:id(2000),policyKey:'password_login.v1',subjectType:'email',subjectHash:hash(2000)}]});
 const result=await cleanup(env,now);expect(result.deleted).toBe(1005);expect(result.backlog).toBe(false);expect(await rows('SELECT * FROM common_rate_limit_buckets')).toHaveLength(1);
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 await db.batch(['UPDATE auth_refresh_tokens SET replaced_by_token_id=NULL','DELETE FROM auth_refresh_tokens','DELETE FROM auth_email_challenges','DELETE FROM auth_sessions','DELETE FROM auth_external_identities','DELETE FROM auth_accounts','DELETE FROM common_rate_limit_buckets'].map(s=>db.prepare(s)));
});
async function account(){await cmd('account.register-external',{...pair(2),identityId:id(4),provider:'google',subject:'SubjectA',email:'a@gmail.com'});}
it('PF-IT-022 six tables have 54 columns, named UUID primary keys and natural uniqueness',async()=>{
 const tables=await rows("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'auth_%' OR name LIKE 'common_%')");
 expect(tables).toHaveLength(6); let columns=0;
 for(const t of tables){const info=await rows(`PRAGMA table_info(${t.name})`);columns+=info.length;expect(info[0].pk).toBe(1);expect(info[0].notnull).toBe(1);}
 expect(columns).toBe(54);
 await account(); await expect(cmd('account.register-external',{...pair(20),accountId:id(21),identityId:id(24),provider:'google',subject:'OtherSubject',email:'a@gmail.com'})).rejects.toThrow();
 expect(await rows('SELECT * FROM auth_accounts')).toHaveLength(1);
});
it('PF-IT-009 session replacement is atomic, last commit wins and cv is unchanged',async()=>{
 await account(); await cmd('session.create',{...pair(10),cv:1});await cmd('session.create',{...pair(20),cv:1});
 const sessions=await rows('SELECT * FROM auth_sessions');expect(sessions.filter(s=>s.revoked_at===null).map(s=>s.session_id)).toEqual([id(20)]);
 expect((await rows('SELECT credential_version FROM auth_accounts'))[0].credential_version).toBe(1);
 const denied=await cmd('session.create',{...pair(30),cv:2});expect(denied.changes.every(n=>n===0)).toBe(true);
 const plan=planCommand('session.create',{...pair(40),cv:1},now);plan[2].sql='INSERT INTO nonexistent VALUES(1)';
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect((await rows('SELECT * FROM auth_sessions WHERE revoked_at IS NULL'))[0].session_id).toBe(id(20));
});
it('PF-UT-109 PF-UT-110 a zero-row session insert cannot act on a pre-existing candidate family',async()=>{
 await account();const stale={...pair(2),cv:99,tokenId:id(99),tokenHash:hash(99)};
 const result=await cmd('session.create',stale);expect(result.changes).toEqual([0,0,0]);expect(await rows('SELECT * FROM auth_refresh_tokens')).toHaveLength(1);
});
it('PF-IT-003 Google registration conflicts roll back every dependent row',async()=>{
 await account(); await expect(cmd('account.register-external',{...pair(10),accountId:id(20),identityId:id(21),provider:'google',subject:'SubjectA',email:'b@gmail.com'})).rejects.toThrow();
 expect(await rows('SELECT * FROM auth_accounts')).toHaveLength(1); expect(await rows('SELECT * FROM auth_sessions')).toHaveLength(1);
});
it.each(['same-email','same-subject'])('PF-IT-003 PF-BDD-048 simultaneous Google %s registration commits exactly one complete owner',async conflict=>{
 const first={...pair(10),accountId:id(11),identityId:id(12),provider:'google',subject:'subject-A',email:'first@gmail.com'};
 const second={...pair(20),accountId:id(21),identityId:id(22),provider:'google',subject:conflict==='same-subject'?'subject-A':'subject-B',email:conflict==='same-email'?'first@gmail.com':'second@gmail.com'};
 const results=await Promise.allSettled([cmd('account.register-external',first),cmd('account.register-external',second)]);expect(results.filter(result=>result.status==='fulfilled')).toHaveLength(1);expect(results.filter(result=>result.status==='rejected')).toHaveLength(1);
 const accounts=await rows('SELECT account_id FROM auth_accounts'),identities=await rows('SELECT account_id FROM auth_external_identities'),sessions=await rows('SELECT account_id FROM auth_sessions'),tokens=await rows('SELECT session_id FROM auth_refresh_tokens');expect(accounts).toHaveLength(1);expect(identities).toHaveLength(1);expect(sessions).toHaveLength(1);expect(tokens).toHaveLength(1);expect(identities[0].account_id).toBe(accounts[0].account_id);expect(sessions[0].account_id).toBe(accounts[0].account_id);
});
it.each([['same-email','EMAIL_ALREADY_REGISTERED'],['same-subject','EXTERNAL_IDENTITY_IN_USE']])('PF-IT-003 PF-BDD-048 Google %s unique conflicts produce the correct private bridge 409',async(conflict,expected)=>{
 const first={...pair(10),accountId:id(11),identityId:id(12),provider:'google',subject:'subject-A',email:'first@gmail.com'};
 const second={...pair(20),accountId:id(21),identityId:id(22),provider:'google',subject:conflict==='same-subject'?'subject-A':'subject-B',email:conflict==='same-email'?'first@gmail.com':'second@gmail.com'};
 const send=(body:unknown)=>dispatch(new Request('http://platform.internal/v1/commands/account.register-external',{method:'POST',body:JSON.stringify(body)}),env,now);expect((await send(first)).status).toBe(200);const response=await send(second);expect(response.status).toBe(409);expect((await response.json() as {code:string}).code).toBe(expected);for(const table of ['auth_accounts','auth_external_identities','auth_sessions','auth_refresh_tokens'])expect(await rows(`SELECT * FROM ${table}`)).toHaveLength(1);
});
it('PF-IT-003 PF-BDD-048 every Google registration batch SQL fault rolls back account, identity, family and refresh',async()=>{
 const registration={...pair(10),accountId:id(11),identityId:id(12),provider:'google',subject:'subject-A',email:'first@gmail.com'};
 for(let index=0;index<=4;index++){const plan=planCommand('account.register-external',registration,now);plan.splice(index,0,{sql:'INSERT INTO no_such_table VALUES(1)',values:[]});await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();for(const table of ['auth_accounts','auth_external_identities','auth_sessions','auth_refresh_tokens'])expect(await rows(`SELECT * FROM ${table}`)).toHaveLength(0);}
});
async function challenge(purpose='register_email',n=50){return cmd('email.challenge.create',{challengeId:id(n),purpose,email:'b@example.com',clientPlatform:'web',flowTokenHash:hash(n),codeMac:hash(99),accountId:purpose==='reset_password'?id(1):null,cv:purpose==='reset_password'?1:null});}
const proof=(n=50)=>({challengeId:id(n),generation:0,codeMac:hash(99),flowTokenHash:hash(n)});
it('PF-IT-002 PF-BDD-048 concurrent independent Email challenges cannot create duplicate accounts or consume the losing challenge',async()=>{
 await challenge('register_email',50);await challenge('register_email',60);
 const first={...proof(50),...pair(10),accountId:id(11),passwordHash:'first-test-hash'},second={...proof(60),...pair(20),accountId:id(21),passwordHash:'second-test-hash'};
 const results=await Promise.allSettled([cmd('account.register-email',first),cmd('account.register-email',second)]);expect(results.filter(result=>result.status==='fulfilled')).toHaveLength(1);expect(results.filter(result=>result.status==='rejected')).toHaveLength(1);
 for(const table of ['auth_accounts','auth_sessions','auth_refresh_tokens'])expect(await rows(`SELECT * FROM ${table}`)).toHaveLength(1);const challenges=await rows('SELECT state FROM auth_email_challenges');expect(challenges.map(row=>row.state).sort()).toEqual(['active','consumed']);
});
it('PF-IT-002 PF-IT-010 every dependent registration and rotation SQL fault rolls back actual D1 state',async()=>{
 await challenge();const registration={...proof(),...pair(10),accountId:id(10),passwordHash:'test-hash'};
 for(let index=0;index<4;index++){
  const plan=planCommand('account.register-email',registration,now);plan.splice(index,0,{sql:'INSERT INTO no_such_table VALUES(1)',values:[]});
  await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();expect(await rows('SELECT * FROM auth_accounts')).toHaveLength(0);expect(await rows('SELECT * FROM auth_sessions')).toHaveLength(0);expect(await rows('SELECT * FROM auth_refresh_tokens')).toHaveLength(0);expect((await rows('SELECT state FROM auth_email_challenges'))[0].state).toBe('active');
 }
 await account();const rotation={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000,expectedGeneration:0,previousTokenId:id(3),tokenId:id(20),tokenHash:hash(20),idleExpiresAt:now+604800000};
 for(let index=0;index<3;index++){
  const plan=planCommand('session.refresh',rotation,now);plan.splice(index,0,{sql:'INSERT INTO no_such_table VALUES(1)',values:[]});await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
  expect((await rows('SELECT current_generation FROM auth_sessions'))[0].current_generation).toBe(0);const tokens=await rows('SELECT * FROM auth_refresh_tokens');expect(tokens).toHaveLength(1);expect(tokens[0].consumed_at).toBeNull();expect(tokens[0].replaced_by_token_id).toBeNull();
 }
});
it('PF-IT-017 PF-IT-020 PF-IT-021 all nine static quotas saturate independently and reset at the exact window boundary',async()=>{
 let n=100;for(const [policyKey,subjects] of Object.entries(RateLimitPolicies))for(const [subjectType,[window,limit]] of Object.entries(subjects)){
  const entry={bucketId:id(n++),policyKey,subjectType,subjectHash:hash(n)};
  for(let i=0;i<limit;i++){const r=await cmd('rate-limit.consume',{entries:[entry]});expect((r.rows[0] as {attempt_count:number}).attempt_count).toBe(i+1);}
  for(let i=0;i<2;i++)expect(((await cmd('rate-limit.consume',{entries:[entry]})).rows[0] as {attempt_count:number}).attempt_count).toBe(limit+1);
  expect(((await cmd('rate-limit.consume',{entries:[{...entry,bucketId:id(n++)}]},Math.floor(now/window)*window+window)).rows[0] as {attempt_count:number}).attempt_count).toBe(1);
 }
 const before=(await rows('SELECT * FROM common_rate_limit_buckets')).length;await expect(cmd('rate-limit.consume',{entries:[{bucketId:id(900),policyKey:'unknown',subjectType:'ip',subjectHash:hash(1)}]})).rejects.toThrow();expect(await rows('SELECT * FROM common_rate_limit_buckets')).toHaveLength(before);
},30000);
it('PF-IT-031 PF-UT-081 retention cleans more than 1000 linked refresh records in FK order and removes expired email challenges within 24 hours',async()=>{
 await account();await challenge();await db.prepare('UPDATE auth_email_challenges SET created_at=?,expires_at=?,absolute_expires_at=?').bind(now-90000000,now-89000000,now-82800000).run();
 await db.prepare('UPDATE auth_sessions SET created_at=?,idle_expires_at=?,absolute_expires_at=?').bind(now-3000000000,now-700000000,now-604800000+1).run();
 await db.prepare(`WITH RECURSIVE n(x) AS(SELECT 10 UNION ALL SELECT x+1 FROM n WHERE x<1014) INSERT INTO auth_refresh_tokens(token_id,session_id,token_hash,generation,created_at,expires_at) SELECT printf('019a281e-0000-7000-8000-%012d',x),'${id(2)}',printf('%064x',x),x,${now-604800000},${now-1} FROM n`).run();
 await db.prepare(`UPDATE auth_refresh_tokens SET replaced_by_token_id=printf('019a281e-0000-7000-8000-%012d',generation+1) WHERE generation>=10 AND generation<1014`).run();
 await cleanup(env,now);expect(await rows('SELECT * FROM auth_refresh_tokens')).toHaveLength(1006);expect(await rows('SELECT * FROM auth_sessions')).toHaveLength(1);expect(await rows('SELECT * FROM auth_email_challenges')).toHaveLength(0);
 const result=await cleanup(env,now+1);expect(result.backlog).toBe(false);expect(await rows('SELECT * FROM auth_refresh_tokens')).toHaveLength(0);expect(await rows('SELECT * FROM auth_sessions')).toHaveLength(0);
 expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toHaveLength(0);
});
it('PF-IT-014 PF-IT-015 PF-UT-114 equivalent rehash is conditional and stale authorization never unlinks or overwrites credentials',async()=>{
 await account();await db.prepare('UPDATE auth_accounts SET password_hash=?').bind('old').run();const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};
 expect((await cmd('account.rehash',{...auth,oldHash:'old',passwordHash:'upgraded'})).changes).toEqual([1]);expect((await rows('SELECT credential_version FROM auth_accounts'))[0].credential_version).toBe(1);
 expect((await cmd('account.rehash',{...auth,oldHash:'old',passwordHash:'stale'})).changes).toEqual([0]);expect((await rows('SELECT password_hash FROM auth_accounts'))[0].password_hash).toBe('upgraded');
 expect((await cmd('identity.external.unlink',{...auth,accessExpiresAt:now,provider:'google'})).changes.every(n=>n===0)).toBe(true);expect(await rows('SELECT * FROM auth_external_identities')).toHaveLength(1);
 expect((await cmd('identity.external.unlink',{...auth,provider:'google'})).changes).toEqual([1,1]);expect((await rows('SELECT credential_version FROM auth_accounts'))[0].credential_version).toBe(2);expect(await rows('SELECT * FROM auth_external_identities')).toHaveLength(0);
});
it('PF-IT-002 registration zero rows and SQL faults never consume an uncompleted challenge',async()=>{
 await challenge(); const p={...proof(),...pair(10),accountId:id(10),passwordHash:'test-hash'};
 expect((await cmd('account.register-email',{...p,codeMac:hash(100)})).changes.every(n=>n===0)).toBe(true);
 const plan=planCommand('account.register-email',p,now);plan[2].sql='INSERT INTO nonexistent VALUES(1)';
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect(await rows('SELECT * FROM auth_accounts')).toHaveLength(0);expect((await rows('SELECT state FROM auth_email_challenges'))[0].state).toBe('active');
 await cmd('account.register-email',p);expect((await rows('SELECT state FROM auth_email_challenges'))[0].state).toBe('consumed');
 expect((await cmd('account.register-email',{...p,...pair(20),accountId:id(20)})).changes.every(n=>n===0)).toBe(true);
});
it('PF-IT-006 independent concurrent wrong-code counters lock at five',async()=>{
 await challenge();await Promise.all(Array.from({length:7},()=>cmd('email.challenge.fail-attempt',proof())));
 const c=(await rows('SELECT * FROM auth_email_challenges'))[0]; expect(c.failed_attempts).toBe(5);expect(c.state).toBe('locked');
});
it('PF-IT-005 resend CAS has a strict cooldown, preserves attempts and absolute expiry',async()=>{
 await challenge();await cmd('email.challenge.fail-attempt',proof());
 const payload={...proof(),newCodeMac:hash(100)};
 expect((await cmd('email.challenge.resend',payload,now+59999)).changes).toEqual([0]);
 await Promise.all([cmd('email.challenge.resend',payload,now+60000),cmd('email.challenge.resend',payload,now+60000)]);
 const c=(await rows('SELECT * FROM auth_email_challenges'))[0];expect(c.generation).toBe(1);expect(c.failed_attempts).toBe(1);expect(c.absolute_expires_at).toBe(now+1800000);
});
it('PF-IT-008 reset only mutates its bound account and consumes exactly once',async()=>{
 await account(); await cmd('account.register-external',{...pair(10),accountId:id(11),identityId:id(12),provider:'google',subject:'B',email:'b@gmail.com'});
 await challenge('reset_password');await challenge('reset_password',51);
 await db.prepare('UPDATE auth_email_challenges SET account_id=? WHERE challenge_id=?').bind(id(11),id(51)).run();
 await cmd('account.reset-password',{...proof(),passwordHash:'new-hash'});
 const accounts=await rows('SELECT * FROM auth_accounts ORDER BY account_id');expect(accounts[0].credential_version).toBe(2);expect(accounts[1].credential_version).toBe(1);
 expect((await cmd('account.reset-password',{...proof(),passwordHash:'other-hash'})).changes.every(n=>n===0)).toBe(true);
 expect((await rows('SELECT * FROM auth_external_identities'))).toHaveLength(2);
});
it('PF-IT-008 another reset with the same hash and millisecond must not consume a stale challenge',async()=>{
 await account();await challenge('reset_password',50);await challenge('reset_password',51);
 await cmd('account.reset-password',{...proof(50),passwordHash:'same-hash'});
 const stale=await cmd('account.reset-password',{...proof(51),passwordHash:'same-hash'});
 expect(stale.changes).toEqual([0,0]);expect((await rows(`SELECT state FROM auth_email_challenges WHERE challenge_id='${id(51)}'`))[0].state).toBe('active');
});
it('PF-IT-010 refresh creates one successor and stale rotation cannot move the head',async()=>{
 await account();const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};
 const p={...auth,expectedGeneration:0,previousTokenId:id(3),tokenId:id(10),tokenHash:hash(10),idleExpiresAt:now+604800000};
 await cmd('session.refresh',p);
 const result=await cmd('session.refresh',{...p,tokenId:id(11),tokenHash:hash(11)});expect(result.changes.every(n=>n===0)).toBe(true);
 expect(await rows('SELECT * FROM auth_refresh_tokens')).toHaveLength(2);expect((await rows('SELECT * FROM auth_sessions'))[0].current_generation).toBe(1);
 const token=(await rows(`SELECT * FROM auth_refresh_tokens WHERE token_id='${id(3)}'`))[0];expect(token.replaced_by_token_id).toBe(id(10));expect(token.consumed_at).toBe(now);
});
it('PF-IT-019 PF-UT-060 rate limit counters share natural buckets and saturate without refunds',async()=>{
 const e={bucketId:id(10),policyKey:'email_code_send.v1',subjectType:'email',subjectHash:hash(1)};
 await Promise.all(Array.from({length:12},(_,i)=>cmd('rate-limit.consume',{entries:[{...e,bucketId:id(10+i)}]})));
 const buckets=await rows('SELECT * FROM common_rate_limit_buckets');expect(buckets).toHaveLength(1);expect(buckets[0].attempt_count).toBe(6);
 await cmd('rate-limit.consume',{entries:[{...e,bucketId:id(50)}]},now+3600000);expect(await rows('SELECT * FROM common_rate_limit_buckets')).toHaveLength(2);
});
it('PF-UT-065 PF-UT-066 PF-IT-022 schema rejects orphan foreign keys and duplicate natural identities without forbidden tables',async()=>{
 const own=await rows("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name<>'d1_migrations' AND name<>'_cf_METADATA'");expect(own.map(t=>t.name).sort()).toEqual(['auth_accounts','auth_external_identities','auth_sessions','auth_refresh_tokens','auth_email_challenges','common_rate_limit_buckets'].sort());
 const index=(await rows("SELECT sql FROM sqlite_master WHERE name='idx_auth_sessions_active_account'"))[0].sql;expect(index).toContain('UNIQUE');expect(index).toContain('WHERE revoked_at IS NULL');
 await expect(db.prepare('INSERT INTO auth_external_identities VALUES(?,?,?,?,?)').bind(id(8),id(999),'google','orphan',now).run()).rejects.toThrow();await account();
 await expect(db.prepare('INSERT INTO auth_external_identities VALUES(?,?,?,?,?)').bind(id(8),id(1),'google','another-subject',now).run()).rejects.toThrow();
 await expect(db.prepare('INSERT INTO auth_refresh_tokens(token_id,session_id,token_hash,generation,created_at,expires_at) VALUES(?,?,?,?,?,?)').bind(id(8),id(2),hash(999),0,now,now+60000).run()).rejects.toThrow();
 await challenge();await expect(cmd('email.challenge.create',{challengeId:id(51),purpose:'register_email',email:'different@example.com',clientPlatform:'web',flowTokenHash:hash(50),codeMac:hash(99),accountId:null,cv:null})).rejects.toThrow();expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toHaveLength(0);
});
it('PF-UT-111 PF-IT-001 Email and Google completion race preserves one normalized owner and independent plus/dot addresses',async()=>{
 await challenge();const email={...proof(),...pair(10),accountId:id(11),passwordHash:'local-hash'};const external={...pair(20),accountId:id(21),identityId:id(22),provider:'google',subject:'new-subject',email:'b@example.com'};
 const results=await Promise.allSettled([cmd('account.register-email',email),cmd('account.register-external',external)]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(await rows('SELECT * FROM auth_accounts')).toHaveLength(1);expect(await rows('SELECT * FROM auth_sessions')).toHaveLength(1);expect(await rows('SELECT * FROM auth_refresh_tokens')).toHaveLength(1);
 for(const [n,address] of [[30,'b+tag@example.com'],[40,'b.dot@example.com']] as const)await cmd('account.register-external',{...pair(n),accountId:id(n+1),identityId:id(n+2),provider:'google',subject:`Subject-${n}`,email:address});expect(await rows('SELECT * FROM auth_accounts')).toHaveLength(3);
});
it('PF-UT-112 PF-UT-113 PF-IT-004 final authorization, challenge binding and cv govern every sensitive mutation',async()=>{
 await account();await challenge();const registration={...proof(),...pair(10),accountId:id(11),passwordHash:'hash'};
 for(const p of [{...registration,flowTokenHash:hash(999)},{...registration,codeMac:hash(999)},{...registration,generation:1}])expect((await cmd('account.register-email',p)).changes.every(n=>n===0)).toBe(true);
 expect((await cmd('account.register-email',registration,now+600000)).changes.every(n=>n===0)).toBe(true);
 const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};
 await cmd('account.change-password',{...auth,passwordHash:'changed'});expect((await rows('SELECT credential_version FROM auth_accounts'))[0].credential_version).toBe(2);
 expect((await cmd('identity.external.link',{...auth,identityId:id(90),provider:'google',subject:'new',email:'a@gmail.com'})).changes).toEqual([0]);expect((await cmd('account.rehash',{...auth,oldHash:'changed',passwordHash:'must-not-overwrite'})).changes).toEqual([0]);expect((await rows('SELECT password_hash FROM auth_accounts'))[0].password_hash).toBe('changed');
});
it('PF-IT-014 link is idempotent and preserves cv and current family',async()=>{
 await account();const p={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000,identityId:id(8),provider:'google',subject:'SubjectA',email:'a@gmail.com'};
 await cmd('identity.external.link',p);await cmd('identity.external.link',{...p,identityId:id(9)});
 expect(await rows('SELECT * FROM auth_external_identities')).toHaveLength(1);expect((await rows('SELECT credential_version FROM auth_accounts'))[0].credential_version).toBe(1);
 await cmd('session.revoke',{sessionId:id(2),reason:'logout'});
 expect((await cmd('identity.external.link',{...p,identityId:id(10)})).changes).toEqual([0]);
});
it('PF-IT-015 stale unlink never deletes an identity after a different cv mutation in the same millisecond',async()=>{
 await account();await db.prepare('UPDATE auth_accounts SET password_hash=? WHERE account_id=?').bind('existing-hash',id(1)).run();
 const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};
 await cmd('account.change-password',{...auth,passwordHash:'different-hash'});
 const stale=await cmd('identity.external.unlink',{...auth,provider:'google'});
 expect(stale.changes.every(n=>n===0)).toBe(true);expect(await rows('SELECT * FROM auth_external_identities')).toHaveLength(1);
});
it('PF-IT-010 invalid previous token cannot advance the family without creating a successor',async()=>{
 await account();const auth={accountId:id(1),sessionId:id(2),cv:1,accessExpiresAt:now+600000};
 const result=await cmd('session.refresh',{...auth,expectedGeneration:0,previousTokenId:id(999),tokenId:id(10),tokenHash:hash(10),idleExpiresAt:now+604800000});
 expect(result.changes.every(n=>n===0)).toBe(true);expect((await rows('SELECT current_generation FROM auth_sessions'))[0].current_generation).toBe(0);
});
