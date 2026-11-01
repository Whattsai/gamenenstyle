import {test,expect} from '@playwright/test';
test('PF-E2E-022 sender 503 retains the original flow, shows failure and permits a later generation resend',async({page})=>{
 const now=Date.now(),id='019a281e-0000-7000-8000-000000000999';const metadata={challengeId:id,flowToken:'a'.repeat(43),expiresAt:new Date(now+600000).toISOString(),absoluteExpiresAt:new Date(now+1800000).toISOString(),resendAfter:new Date(now-1000).toISOString()};let sends=0;
 // 明定 sender 故障的受控 HTTP 回應；此案例不代表真寄送或收信。
 const cors={'Access-Control-Allow-Origin':'http://localhost:8081','Access-Control-Allow-Credentials':'true'};
 await page.route('**/api/v1/email-registrations',route=>{if(route.request().method()!=='POST')return route.continue();sends++;return route.fulfill({status:503,headers:cors,contentType:'application/problem+json',body:JSON.stringify({status:503,code:'EMAIL_DELIVERY_FAILED',traceId:'safe-trace',recovery:metadata})});});
 await page.route(`**/api/v1/email-challenges/${id}/resend`,route=>route.request().method()!=='POST'?route.continue():route.fulfill({status:202,headers:cors,contentType:'application/json',body:JSON.stringify({...metadata,resendAfter:new Date(Date.now()+60000).toISOString()})}));
 await page.goto('/register');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('recovery@example.com');await page.getByRole('button',{name:'寄送驗證碼',exact:true}).click();
 await expect(page.getByRole('heading',{name:'確認你的 Email'})).toBeVisible();await expect(page.getByText(/驗證碼暫時無法寄送，請稍後重試/).filter({visible:true})).toBeVisible();
 await expect(page.getByText(/驗證碼已寄出，請查看信箱/).filter({visible:true})).toHaveCount(0);await page.getByRole('button',{name:'重新寄送驗證碼',exact:true}).click();await expect(page.getByText('已重新寄送驗證碼，請使用最新的驗證碼',{exact:true})).toBeVisible();expect(sends).toBe(1);
 const saved=await page.evaluate(()=>sessionStorage.getItem('datinghigh.email-flow'));expect(saved).not.toContain('"code"');expect(saved).not.toContain('password');
});
test('PF-E2E-012 PF-E2E-013 malformed and expired flows recover, and uncertain writes are not replayed',async({page})=>{
 await page.goto('/verify-email');await expect(page.getByText('驗證流程已失效，請重新申請',{exact:true})).toBeVisible({timeout:40000});await expect(page.getByRole('button',{name:'驗證並建立帳號'})).toHaveCount(0);await page.getByRole('button',{name:'重新申請',exact:true}).click();await expect(page.getByRole('heading',{name:'讓相遇開始'})).toBeVisible();
 let writes=0;await page.route('**/api/v1/sessions',async route=>{if(route.request().method()!=='POST')return route.continue();writes++;await route.abort('failed');});
 await page.goto('/login');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('unconfirmed@example.com');await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill('A valid test password');await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page.getByText('操作結果尚未確認，請重新登入後查看',{exact:true})).toBeVisible();expect(writes).toBe(1);
});
