import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {randomBytes} from 'node:crypto';
import {root} from '../../tools/local-policy.mjs';import {api,register,password,code,waitReady} from './local-fixture.mjs';
// 只更換本工作區 local secrets；finally 恢復原值。不要與其他 live / native 測試並行。
test('PF-IT-030 actual container key replacement invalidates Access and old code while preserving refresh families',{timeout:240000},async()=>{
 await waitReady();const original=await register('key-rotation');const email=`key-code-${Date.now()}@example.com`;
 const pending=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(pending.status,202);const oldCode=code(pending.body.challengeId);
 const file=`${root}/cloudflare/.dev.vars`,saved=fs.readFileSync(file,'utf8');const names=['ACCESS_TOKEN_SECRET','EMAIL_CODE_HMAC_KEY','RATE_LIMIT_HMAC_KEY'];
 assert.ok(names.every(name=>new RegExp(`^${name}=.+$`,'m').test(saved)),'All local secrets already exist');
 const control=JSON.parse(fs.readFileSync(`${root}/.local/control-default.json`,'utf8'));
 async function signal(action){const r=await fetch(`http://127.0.0.1:${control.port}/${action}`,{method:'POST',headers:{Authorization:`Bearer ${control.token}`},signal:AbortSignal.timeout(45000)});assert.equal(r.status,200);}
 async function replace(contents){await signal('pause');try{fs.writeFileSync(file,contents);}finally{await signal('resume');}await waitReady();}
 let rotated=false;
 try{
  let next=saved;for(const name of names)next=next.replace(new RegExp(`^${name}=.+$`,'m'),`${name}=${randomBytes(32).toString('base64')}`);rotated=true;await replace(next);
  const invalid=await api('/me','GET',undefined,original.tokens.accessToken);assert.equal(invalid.status,401);assert.equal(invalid.body.code,'ACCESS_TOKEN_INVALID');
  const refreshed=await api('/session/refresh','POST',{clientPlatform:'android',refreshToken:original.tokens.refreshToken});assert.equal(refreshed.status,200);assert.equal(refreshed.body.session.sessionId,original.session.sessionId);assert.equal((await api('/me','GET',undefined,refreshed.body.tokens.accessToken)).status,200);
  const rejected=await api('/accounts','POST',{challengeId:pending.body.challengeId,flowToken:pending.body.flowToken,code:oldCode,password,clientPlatform:'android'});assert.equal(rejected.status,400);assert.equal(rejected.body.code,'INVALID_OR_EXPIRED_CODE');
  const requested=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(requested.status,202);
  const m=requested.body;const created=await api('/accounts','POST',{challengeId:m.challengeId,flowToken:m.flowToken,code:code(m.challengeId),password,clientPlatform:'android'});assert.equal(created.status,201);
  for(const session of [refreshed.body,created.body])assert.equal((await api('/session','DELETE',{refreshToken:session.tokens.refreshToken},session.tokens.accessToken)).status,204);
 }finally{if(rotated)await replace(saved);}
 assert.equal(fs.readFileSync(file,'utf8'),saved);
 fs.writeFileSync(`${root}/.local/evidence/key-rotation.json`,JSON.stringify({status:'passed',environment:'local',executedAt:new Date().toISOString(),checks:['old-access-invalid','refresh-family-preserved','new-access-valid','old-email-code-invalid','new-code-valid','original-local-secrets-restored']},null,2));
});
