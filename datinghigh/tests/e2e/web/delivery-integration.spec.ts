import {openAccountAfterLogin} from './support';
import{test,expect,type APIRequestContext}from'@playwright/test';import{startBackend,stopBackend,control,routeBackend,advance,type Backend}from'./backend';
test.setTimeout(150000);let backend:Backend,management:APIRequestContext;
test.beforeAll(async({playwright})=>{management=await playwright.request.newContext();backend=await startBackend();});test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();});
for(const purpose of ['register','reset'] as const)for(const mode of ['success','failure','timeout'] as const){
 test(`PF-E2E-022 ${purpose} ${mode}: browser through real API, Worker and D1 retains challenge and safely completes after resend`,async({page,request})=>{
  await control(backend,request,{op:'reset',seed:purpose==='reset'});await control(backend,request,{op:'provider',mode});await routeBackend(page,backend);
  await page.goto(purpose==='register'?'/register':'/forgot-password');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('owner@example.com');
  const response=page.waitForResponse(r=>r.url().endsWith(purpose==='register'?'/email-registrations':'/password-reset-requests')&&r.request().method()==='POST');await page.getByRole('button',{name:'寄送驗證碼',exact:true}).click();
  if(mode==='timeout'){await expect.poll(async()=>(await control(backend,request,{op:'mail-progress'})).calls).toBe(1);await advance(backend,request,page,10000);}
  const first=await response;expect(first.status()).toBe(purpose==='register'&&mode!=='success'?503:202);const payload=await first.json(),metadata=payload.recovery??payload;
  await expect(page.getByLabel('六位數驗證碼',{exact:true}).filter({visible:true})).toBeVisible();if(purpose==='register'&&mode!=='success')await expect(page.getByText(/驗證碼暫時無法寄送，請稍後重試/).filter({visible:true}).first()).toBeVisible();
  if(purpose==='reset')await expect(page.getByText(/若此 Email 可處理，將收到驗證碼/).filter({visible:true})).toBeVisible();
  const original=await control(backend,request,{op:'challenge',id:metadata.challengeId,failures:2});await advance(backend,request,page,60000);
  const resent=page.waitForResponse(r=>r.url().includes(`/email-challenges/${metadata.challengeId}/resend`)&&r.request().method()==='POST');await page.getByRole('button',{name:'重新寄送驗證碼',exact:true}).filter({visible:true}).click();
  if(mode==='timeout'){await expect.poll(async()=>(await control(backend,request,{op:'mail-progress'})).calls).toBe(2);await advance(backend,request,page,10000);}
  expect((await resent).status()).toBe(purpose==='register'&&mode!=='success'?503:202);let row=await control(backend,request,{op:'challenge',id:metadata.challengeId});expect(row.generation).toBe(1);expect(row.failed_attempts).toBe(2);expect(row.absolute_expires_at).toBe(original.absolute_expires_at);
  await control(backend,request,{op:'provider',mode:'success'});await advance(backend,request,page,60000);await page.getByRole('button',{name:'重新寄送驗證碼',exact:true}).filter({visible:true}).click();await expect(page.getByText(/請使用最新的驗證碼/).filter({visible:true})).toBeVisible();
  row=await control(backend,request,{op:'challenge',id:metadata.challengeId});expect(row.generation).toBe(2);expect(row.failed_attempts).toBe(2);expect(row.absolute_expires_at).toBe(original.absolute_expires_at);
  await page.getByLabel('六位數驗證碼',{exact:true}).filter({visible:true}).fill('000001');await page.getByLabel(purpose==='register'?'密碼':'新密碼',{exact:true}).filter({visible:true}).fill('A recovered integration password');await page.getByLabel('確認密碼',{exact:true}).filter({visible:true}).fill('A recovered integration password');
  await page.getByRole('button',{name:purpose==='register'?'驗證並建立帳號':'重設密碼',exact:true}).click();await expect(page.getByText('驗證碼錯誤或已失效，請重新確認',{exact:true}).filter({visible:true})).toBeVisible();
  await page.getByLabel('六位數驗證碼',{exact:true}).filter({visible:true}).fill('000003');await page.getByRole('button',{name:purpose==='register'?'驗證並建立帳號':'重設密碼',exact:true}).click();
  if(purpose==='register'){await openAccountAfterLogin(page);await expect(page.getByText('owner@example.com',{exact:true}).filter({visible:true})).toBeVisible();}else await expect(page.getByText('密碼已重設，請使用新密碼重新登入',{exact:true}).filter({visible:true})).toBeVisible();
  expect((await control(backend,request,{op:'provider-stats'})).templatesValid).toBe(true);
 });
}
