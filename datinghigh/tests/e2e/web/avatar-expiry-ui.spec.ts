import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {register,prepareBuiltinGender,returnFromProfile} from './support';

test.setTimeout(90000);
// 只注入短效候選讀取，驗證真瀏覽器的到期UI；不是Gemini／R2整合證據。
test('AP Web expiry UI: an already-open adoption dialog closes and cannot submit an expired candidate',async({page})=>{
 await page.clock.install();
 await register(page,`ap-expiry-ui-${Date.now()}@example.com`);
 const base='http://localhost:8787/api/v1',headers={'X-DatingHigh-Client':'web',Origin:'http://localhost:8081'};
 const own=await prepareBuiltinGender(page);
 expect((await page.request.put(`${base}/me/avatar/selection`,{headers,data:{type:'builtin',builtinAvatarId:'male-03',expectedRevision:own.revision}})).status()).toBe(200);
 const photoIds:string[]=[];
 for(const file of ['female-01.jpg','female-02.jpg']){
  const response=await page.request.post(`${base}/me/photos`,{headers:{...headers,'Content-Type':'image/jpeg'},data:readFileSync(path.resolve('frontend/client/assets/avatars',file))});
  expect(response.status()).toBe(201);photoIds.push((await response.json()).assetId);
 }
 const fixtureAttempt='019a281e-0000-7000-8000-000000099999';
 await page.route('**/api/v1/me/dating-profile',async route=>{
  const response=await route.fetch(),profile=await response.json();
  const serverTime=Date.parse(response.headers()['date']);expect(Number.isFinite(serverTime)).toBe(true);
  await route.fulfill({response,json:{...profile,avatarAttempt:{attemptId:fixtureAttempt,producedCount:1,status:'open',expiresAt:serverTime+10000}}});
 });
 await page.route(`**/api/v1/me/avatar/candidates/${fixtureAttempt}/1`,route=>route.fulfill({status:200,contentType:'image/jpeg',body:readFileSync(path.resolve('frontend/client/assets/avatars/female-01.jpg'))}));
 let mutations=0;page.on('request',request=>{if(request.method()!=='GET'&&/\/me\/avatar\/(?:generations|selection)$/.test(new URL(request.url()).pathname))mutations++;});
 await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();
 await page.getByRole('button',{name:'選擇化身',exact:true}).click();
 await expect(page.getByText('目前選用 · male-03',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'AI 客製化'}).click();
 await page.getByRole('button',{name:'採用這張',exact:true}).click();
 await expect(page.getByRole('button',{name:'確認採用',exact:true})).toBeVisible();
 await page.clock.fastForward(15000);
 await expect(page.getByRole('button',{name:'確認採用',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'採用這張',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'產生下一張',exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'開始新的一輪',exact:true})).toBeVisible();
 await expect(page.getByText('本輪候選已過期，請重新開始',{exact:true})).toBeVisible();
 expect(mutations).toBe(0);
 const actual=await(await page.request.get(`${base}/me/dating-profile`,{headers})).json();
 expect(actual.selectedAvatarRef).toBe('male-03');expect(actual.generatedAvatars).toHaveLength(0);expect(actual.avatarAttempt).toBeNull();
 await page.unroute('**/api/v1/me/dating-profile');
 for(const asset of photoIds)expect((await page.request.delete(`${base}/me/photos/${asset}`,{headers,data:{}})).status()).toBe(204);
 await page.reload();await expect(page.getByLabel('暱稱',{exact:true})).toBeVisible();await page.getByRole('button',{name:'選擇化身',exact:true}).click();
 await expect(page.getByRole('button',{name:'採用這張',exact:true})).toHaveCount(0);
 await expect(page.getByText('目前選用 · male-03',{exact:true})).toBeVisible();
 await returnFromProfile(page);await page.getByRole('button',{name:'登出',exact:true}).click();
});

for(const [status,code,notice] of [
 [503,'IMAGE_PROVIDER_UNAVAILABLE','AI 服務目前無法使用，已產生的候選仍保留'],
 [503,'IMAGE_PROVIDER_UNCERTAIN','生成結果與供應商用量尚未確認；不會自動重送，已產生的候選仍保留'],
 [429,'RATE_LIMITED','操作過於頻繁，請稍後再試'],
 [409,'AVATAR_DUPLICATE_IMAGE','這次插畫與已有候選相同，未新增張數；可主動再試，可能增加供應商成本'],
 [410,'AVATAR_CANDIDATE_EXPIRED','本輪候選已過期，請重新開始']
] as const)test(`AP Web controlled error UI: ${status} ${code} preserves the current avatar and never retries automatically`,async({page})=>{
 // 故障只在HTTP回應層注入；真SQL／R2／provider故障另有獨立整合證據，不混為真生成。
 await page.clock.install();await register(page,`ap-error-ui-${code.toLowerCase()}-${Date.now()}@example.com`);
 const base='http://localhost:8787/api/v1',headers={'X-DatingHigh-Client':'web',Origin:'http://localhost:8081'};
 const own=await prepareBuiltinGender(page);
 expect((await page.request.put(`${base}/me/avatar/selection`,{headers,data:{type:'builtin',builtinAvatarId:'male-03',expectedRevision:own.revision}})).status()).toBe(200);
 const photoIds:string[]=[];
 for(const file of ['female-01.jpg','female-02.jpg']){
  const response=await page.request.post(`${base}/me/photos`,{headers:{...headers,'Content-Type':'image/jpeg'},data:readFileSync(path.resolve('frontend/client/assets/avatars',file))});
  expect(response.status()).toBe(201);photoIds.push((await response.json()).assetId);
 }
 const fixtureAttempt='019a281e-0000-7000-8000-000000099998';let failed=false,calls=0,selections=0;
 await page.route('**/api/v1/me/dating-profile',async route=>{
  const response=await route.fetch(),profile=await response.json(),serverTime=Date.parse(response.headers()['date']);
  await route.fulfill({response,json:{...profile,avatarAttempt:failed&&status===410?null:{attemptId:fixtureAttempt,producedCount:2,status:failed&&code==='IMAGE_PROVIDER_UNCERTAIN'?'uncertain':'open',expiresAt:serverTime+3600000}}});
 });
 await page.route(`**/api/v1/me/avatar/candidates/${fixtureAttempt}/*`,route=>route.fulfill({status:200,contentType:'image/jpeg',body:readFileSync(path.resolve('frontend/client/assets/avatars',route.request().url().endsWith('/2')?'female-02.jpg':'female-01.jpg'))}));
 await page.route('**/api/v1/me/avatar/generations',async route=>{
  calls++;const payload=route.request().postDataJSON();expect(payload.attemptId).toBe(fixtureAttempt);expect(payload.expectedProducedCount).toBe(2);
  failed=true;await route.fulfill({status,contentType:'application/problem+json',headers:{'Cache-Control':'no-store'},json:{status,code,title:code,traceId:'controlled-ui-fault'}});
 });
 page.on('request',request=>{if(request.method()==='PUT'&&new URL(request.url()).pathname.endsWith('/me/avatar/selection'))selections++;});
 try{
  await page.getByRole('button',{name:'個人資料與遊戲化身'}).click();await page.getByRole('button',{name:'選擇化身',exact:true}).click();await page.getByRole('button',{name:'AI 客製化'}).click();
  await expect(page.getByRole('button',{name:'比較候選 1',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'比較候選 2',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'產生下一張',exact:true}).click();await expect(page.getByText(notice,{exact:true})).toBeVisible();
  await page.clock.fastForward(20000);expect(calls).toBe(1);expect(selections).toBe(0);
  await expect(page.getByText('目前選用 · male-03',{exact:true})).toBeVisible();
  if(status===410){
   await expect(page.getByRole('button',{name:'採用這張',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'比較候選 1',exact:true})).toHaveCount(0);
   await expect(page.getByRole('button',{name:'開始產生第1張',exact:true})).toBeEnabled();
  }else{
   await expect(page.getByRole('button',{name:/比較候選 [12]$/})).toHaveCount(2);
   await expect(page.getByRole('button',{name:'比較候選 3',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'採用這張',exact:true})).toBeEnabled();
   if(code==='IMAGE_PROVIDER_UNCERTAIN')await expect(page.getByRole('button',{name:'產生下一張',exact:true})).toBeDisabled();
  }
  await expect(page.getByText('重新嘗試可能增加第三方供應商成本；本 MVP 目前免費，不扣款。',{exact:true})).toBeVisible();
  const actual=await(await page.request.get(`${base}/me/dating-profile`,{headers})).json();expect(actual.selectedAvatarRef).toBe('male-03');expect(actual.generatedAvatars).toHaveLength(0);expect(actual.avatarAttempt).toBeNull();
 }finally{
  await page.unroute('**/api/v1/me/dating-profile');await page.unroute('**/api/v1/me/avatar/generations');
  for(const asset of photoIds)expect((await page.request.delete(`${base}/me/photos/${asset}`,{headers,data:{}})).status()).toBe(204);
  expect((await page.request.delete(`${base}/session`,{headers,data:{}})).status()).toBe(204);
 }
});
