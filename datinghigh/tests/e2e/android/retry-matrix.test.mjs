import{describe,test,before,after,beforeEach,afterEach}from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{recordNativeResult,createFixture,openScreen,login,tap,fill,wait,invoke}from'./fixture.mjs';import{root}from'../../../scripts/local-policy.mjs';
const original='A real D1 integration password',next='A native retry matrix password';
describe('Android request retry boundaries with actual API and D1',{timeout:6000000},()=>{let f;const results=[];const persist=()=>fs.writeFileSync(`${root}/.local/evidence/native-retry-matrix.json`,JSON.stringify({platform:'android',executedAt:new Date().toISOString(),results},null,2));before(async()=>{f=await createFixture();});after(async()=>{await f?.close();persist();});beforeEach(async()=>{await f.reset('local');});afterEach(async t=>{results.push(await recordNativeResult(t,f));persist();});
async function signIn(){await openScreen('login');await login(original);}
async function passwordForm(){await signIn();await tap('修改密碼');await fill('目前密碼',original);await fill('新密碼',next);await fill('確認密碼',next);}
const stats=()=>f.send({op:'request-stats'}),fault=(path,mode)=>f.send({op:'fault-response',path:'/api/v1/'+path,mode});
// Stopwatch starts when the host receives the request; the client's exact timer starts before transport.
// Allow bounded emulator/bridge transit while still detecting a materially early abort; exact client timing is covered by fake-clock unit tests.
async function deadline(path,expected){const end=Date.now()+90000;while(Date.now()<end){const item=(await f.send({op:'request-terminations'})).find(r=>r.path==='/api/v1/'+path);if(item){assert.ok(item.elapsedMilliseconds>=expected-5000,`Native server observed abort after ${Math.round(item.elapsedMilliseconds)}ms`);assert.ok(item.elapsedMilliseconds<expected+10000,'Native abort stays within the bounded deadline');return;}await new Promise(r=>setTimeout(r,250));}throw new Error('Native timeout did not cancel its actual HTTP request');}
test('PF-E2E-013 PF-E2E-015 native first cold refresh aborts at 45 seconds without another attempt',{timeout:600000},async()=>{
 await signIn();const before=(await stats()).length;await fault('session/refresh','hang-before');await import('./support.mjs').then(m=>m.reopen(8084));await deadline('session/refresh',45000);await wait('歡迎回來');assert.equal((await stats()).slice(before).filter(r=>r.path==='/api/v1/session/refresh').length,1);
});
test('PF-E2E-013 native warm foreground read aborts at 30 seconds and retries only once',{timeout:600000},async()=>{
 await signIn();const before=(await stats()).length;await fault('session','hang-before');invoke('shell','input','keyevent','3');invoke('shell','am','start','-n','com.datinghigh.app/.MainActivity');await deadline('session',30000);await wait('owner@example.com');const end=Date.now()+15000;while((await stats()).slice(before).filter(r=>r.path==='/api/v1/session').length<2&&Date.now()<end)await new Promise(r=>setTimeout(r,250));assert.equal((await stats()).slice(before).filter(r=>r.path==='/api/v1/session').length,2);
});
test('PF-E2E-013 native warm mutation aborts at 30 seconds without handler execution or replay',{timeout:600000},async()=>{
 await passwordForm();const before=(await stats()).length;await fault('me/password','hang-before');await tap('更新密碼');await deadline('me/password',30000);await wait('操作結果尚未確認，請先嘗試使用新密碼登入');const all=(await stats()).slice(before).filter(r=>r.path==='/api/v1/me/password');assert.equal(all.length,1);assert.equal(all[0].stage,'before-handler');assert.equal((await f.send({op:'account-state'})).accounts[0].credential_version,1);
});
for(const mode of ['access-missing','access-expired'])for(const conflicts of [0,1])test(`PF-E2E-016 native ${mode}/${conflicts} conflict performs one actual password update`,{timeout:600000},async()=>{
 await passwordForm();const before=(await stats()).length;await fault('me/password',mode);if(conflicts)await fault('session/refresh','refresh-conflict');await tap('更新密碼');await wait('歡迎回來');const all=(await stats()).slice(before);assert.equal(all.filter(r=>r.path==='/api/v1/me/password').length,2);assert.equal(all.filter(r=>r.path==='/api/v1/me/password'&&r.stage==='api'&&r.status===204).length,1);assert.equal(all.filter(r=>r.path==='/api/v1/session/refresh').length,1+conflicts);assert.equal((await f.send({op:'account-state'})).accounts[0].credential_version,2);
});
for(const mode of ['access-invalid','session-revoked','refresh-reuse'])test(`PF-E2E-016 native ${mode} cannot refresh or execute a business update`,{timeout:600000},async()=>{
 await passwordForm();const before=(await stats()).length;await fault('me/password',mode);await tap('更新密碼');await wait('歡迎回來');const all=(await stats()).slice(before);assert.equal(all.filter(r=>r.path==='/api/v1/me/password').length,1);assert.equal(all.filter(r=>r.path==='/api/v1/session/refresh').length,0);assert.equal((await f.send({op:'account-state'})).accounts[0].credential_version,1);
});
for(const mode of ['access-missing','access-expired'])test(`PF-E2E-016 native second ${mode} clears private state without another replay`,{timeout:600000},async()=>{
 await passwordForm();const before=(await stats()).length;await fault('me/password',mode);await fault('me/password',mode);await tap('更新密碼');await wait('歡迎回來');const all=(await stats()).slice(before);assert.equal(all.filter(r=>r.path==='/api/v1/me/password').length,2);assert.equal(all.filter(r=>r.path==='/api/v1/session/refresh').length,1);assert.equal(all.filter(r=>r.path==='/api/v1/me/password'&&r.stage==='api').length,0);
});
test('PF-E2E-016 native second refresh conflict clears login without executing a mutation',{timeout:600000},async()=>{
 await passwordForm();const before=(await stats()).length;await fault('me/password','access-expired');await fault('session/refresh','refresh-conflict');await fault('session/refresh','refresh-conflict');await tap('更新密碼');await wait('歡迎回來');const all=(await stats()).slice(before);assert.equal(all.filter(r=>r.path==='/api/v1/session/refresh').length,2);assert.equal(all.filter(r=>r.path==='/api/v1/me/password').length,1);
});
for(const mode of ['server-error','unavailable','gateway-timeout'])test(`PF-E2E-013 native foreground ${mode} reads retry once and preserve the owner`,{timeout:600000},async()=>{
 await signIn();const before=(await stats()).length;await fault('session',mode);await fault('session',mode);invoke('shell','input','keyevent','3');invoke('shell','am','start','-n','com.datinghigh.app/.MainActivity');await wait('服務暫時無法使用，請稍後再試');await wait('owner@example.com');assert.equal((await stats()).slice(before).filter(r=>r.path==='/api/v1/session').length,2);
});
test('PF-E2E-016 native business 401 cannot refresh or replay the password update',{timeout:600000},async()=>{
 await passwordForm();await fill('目前密碼','A wrong business password');const before=(await stats()).length;await tap('更新密碼');await wait('目前密碼不正確');const all=(await stats()).slice(before);assert.equal(all.filter(r=>r.path==='/api/v1/me/password').length,1);assert.equal(all.filter(r=>r.path==='/api/v1/session/refresh').length,0);
});
test('PF-E2E-013 PF-E2E-016 native committed update with a lost response is never replayed',{timeout:600000},async()=>{
 await passwordForm();const before=(await stats()).length;await fault('me/password','drop');await tap('更新密碼');await wait('操作結果尚未確認，請先嘗試使用新密碼登入');const all=(await stats()).slice(before);assert.equal(all.filter(r=>r.path==='/api/v1/me/password').length,1);assert.equal(all.filter(r=>r.path==='/api/v1/me/password'&&r.status===204).length,1);assert.equal((await f.send({op:'account-state'})).accounts[0].credential_version,2);
});
});
