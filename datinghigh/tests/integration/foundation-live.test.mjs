import {test} from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {origin,password,container,api,register} from './local-fixture.mjs';
// 真本機 Worker → Docker .NET → outbound binding → D1/R2；憑證只存記憶體。
test('PF-IT-025 actual Worker rejects internal commands and spoofed identities while serving legal SPA routes',async()=>{
 for(const path of ['/internal/commands','/v1/commands/account.lookup-credentials','/api/v1/unknown']){const r=await fetch(`${origin}${path}`);assert.equal(r.status,404);assert.match(r.headers.get('Content-Type'),/json/);}
 const denied=await fetch(`${origin}/api/v1/me`,{headers:{'X-DatingHigh-Client':'android','X-DatingHigh-Internal-User':'victim','X-DatingHigh-Internal-Account-Id':'victim','X-DatingHigh-Internal-Client-Ip':'untrusted'}});assert.equal(denied.status,401);
 const spa=await fetch(`${origin}/account/password`);assert.equal(spa.status,200);assert.match(spa.headers.get('Content-Type'),/html/);assert.equal((await fetch(`${origin}/health/live`)).status,200);
});
test('PF-IT-024 PF-IT-032 native contract, private ownership and .NET storage probe use actual outbound bridge',async()=>{
 assert.equal((await fetch(`${origin}/health/ready`)).status,200);const a=await register('a'),b=await register('b');
 assert.equal(a.tokens.tokenType,'Bearer');assert.ok(a.tokens.accessToken);assert.ok(a.tokens.refreshToken);assert.equal((await api('/me','GET',undefined,a.tokens.accessToken)).body.accountId,a.account.accountId);
 const probe=execFileSync('docker',['exec',container(),'dotnet','/app/tools/DatingHigh.PlatformProbe.dll','probe'],{encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe']});assert.equal(JSON.parse(probe).status,'passed');
 const owned=execFileSync('docker',['exec','-i',container(),'dotnet','/app/tools/DatingHigh.PlatformProbe.dll','private-test'],{input:JSON.stringify({accessTokenA:a.tokens.accessToken,accessTokenB:b.tokens.accessToken}),encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe']});assert.equal(JSON.parse(owned).status,'passed');
 for(const x of [a,b])assert.equal((await api('/session','DELETE',{refreshToken:x.tokens.refreshToken},x.tokens.accessToken)).status,204);
});
test('PF-IT-011 PF-IT-012 PF-API-016 PF-API-017 refresh grace, older conflict, replay and replaced-device logout preserve latest family',async()=>{
 const a=await register('rotation');const refresh=t=>api('/session/refresh','POST',{clientPlatform:'android',refreshToken:t});const original=a.tokens.refreshToken;
 const next=await refresh(original);assert.equal(next.status,200);assert.notEqual(next.body.tokens.refreshToken,original);assert.equal(next.body.session.sessionId,a.session.sessionId);
 const grace=await refresh(original);assert.equal(grace.status,200);assert.notEqual(grace.body.tokens.refreshToken,next.body.tokens.refreshToken);
 const stale=await refresh(original);assert.equal(stale.status,409);assert.equal(stale.body.code,'REFRESH_RETRY');
 const newer=await api('/sessions','POST',{email:a.email,password,clientPlatform:'android'});assert.equal(newer.status,201);
 assert.equal((await api('/me','GET',undefined,a.tokens.accessToken)).status,401);
 assert.equal((await api('/session','DELETE',{refreshToken:original},a.tokens.accessToken)).status,204);assert.equal((await api('/me','GET',undefined,newer.body.tokens.accessToken)).status,200);
 await new Promise(r=>setTimeout(r,31000));const reused=await refresh(original);assert.equal(reused.status,401);assert.equal(reused.body.code,'REFRESH_TOKEN_REUSE');
 assert.equal((await api('/me','GET',undefined,newer.body.tokens.accessToken)).status,200);
 const restored=await refresh(newer.body.tokens.refreshToken);assert.equal(restored.status,200);assert.equal(restored.body.account.accountId,a.account.accountId);
 assert.equal((await api('/session','DELETE',{refreshToken:restored.body.tokens.refreshToken},restored.body.tokens.accessToken)).status,204);assert.equal((await api('/me','GET',undefined,restored.body.tokens.accessToken)).status,401);
});
