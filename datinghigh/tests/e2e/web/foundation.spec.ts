import {test,expect} from '@playwright/test';
test.setTimeout(90000);
import fs from 'node:fs';
import {register,password,localCode} from './support';

test('PF-E2E-002 PF-UT-084 PF-UT-116 Web prototype visuals, small viewport, accessible labels and keyboard focus',async({page})=>{
 await page.route('https://accounts.google.com/gsi/client',route=>route.abort('failed'));
 await page.setViewportSize({width:360,height:640});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 // Entry waits for a cold 45-second session read and may perform one 30-second read retry.
 await expect(page.getByRole('button',{name:'使用 Email 註冊'})).toBeVisible({timeout:85000});await expect(page.getByText('Google 登入暫時無法使用，請稍後再試')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
 await page.getByRole('button',{name:'使用 Email 登入'}).click();await page.getByLabel('Email',{exact:true}).filter({visible:true}).focus();
 expect(await page.getByLabel('Email',{exact:true}).filter({visible:true}).evaluate(el=>getComputedStyle(el).outlineWidth)).toBe('3px');
 await page.keyboard.press('Tab');await expect(page.getByLabel('密碼',{exact:true}).filter({visible:true})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.getByLabel('Email',{exact:true}).filter({visible:true})).toBeFocused();
 await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('invalid');await page.keyboard.press('Enter');await expect(page.getByText('請輸入有效的 Email',{exact:true}).filter({visible:true})).toBeVisible();
 await page.goto('/');await expect(page.getByRole('button',{name:'使用 Email 註冊'})).toBeVisible();await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise<void>(resolve=>{img.onload=()=>resolve();img.onerror=()=>resolve();}))));fs.mkdirSync('.local/evidence',{recursive:true});await page.screenshot({path:'.local/evidence/web-entry.png',fullPage:true});
});
test('PF-UT-117 reduced motion preserves explicit loading and error feedback',async({page})=>{
 for(const reducedMotion of ['reduce','no-preference'] as const){
  await page.emulateMedia({reducedMotion});let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/v1/session',async route=>{await pending;await route.fulfill({status:401,contentType:'application/problem+json',headers:{'Access-Control-Allow-Origin':'http://localhost:8081','Access-Control-Allow-Credentials':'true'},body:JSON.stringify({code:'SESSION_REVOKED'})});});
  await page.goto('/login');await expect(page.getByText('連線中，請稍候…')).toBeVisible();
  if(reducedMotion==='reduce')expect(await page.locator('body').evaluate(el=>[...el.querySelectorAll('*')].filter(node=>getComputedStyle(node).animationName!=='none').length)).toBe(0);
  release();await expect(page.getByLabel('Email',{exact:true}).filter({visible:true})).toBeVisible();await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page.getByText('請輸入有效的 Email',{exact:true}).filter({visible:true})).toBeVisible();await page.unroute('**/api/v1/session');
 }
});
test('PF-E2E-003 local registration creates one account and HttpOnly Strict cookie pair',async({page,context})=>{
 const email=`web-${Date.now()}@example.com`;const {result}=await register(page,email);const body=await result.json();
 expect(body.tokens.accessToken).toBeUndefined();expect(body.tokens.refreshToken).toBeUndefined();expect(result.headers()['x-datinghigh-session']).toBe(body.session.sessionId);
 const cookies=await context.cookies('http://localhost:8787');expect(cookies.filter(c=>c.name.startsWith('datinghigh_'))).toHaveLength(2);
 for(const c of cookies){expect(c.httpOnly).toBe(true);expect(c.sameSite).toBe('Strict');expect(c.path).toBe('/');}
 expect(await page.evaluate(()=>document.cookie)).not.toContain('datinghigh_');
 await page.getByRole('button',{name:'登出',exact:true}).click();await expect(page.getByText('已登出',{exact:true}).filter({visible:true})).toBeVisible();await expect(page.getByRole('button',{name:'使用 Email 登入',exact:true})).toBeVisible();
 await page.goto('/register');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);const duplicate=page.waitForResponse(r=>r.url().endsWith('/api/v1/email-registrations')&&r.request().method()==='POST');await page.getByRole('button',{name:'寄送驗證碼',exact:true}).click();expect((await duplicate).status()).toBe(409);
 await expect(page.getByText('此 Email 已註冊，請先使用原有方式登入，再連結 Google',{exact:true}).filter({visible:true})).toBeVisible();
});
test('PF-E2E-003 real localhost registration, login, refresh and logout retain one account',async({page,context})=>{
 const email=`chain-${Date.now()}@example.com`;const {result}=await register(page,email);const account=(await result.json()).account.accountId;
 await page.getByRole('button',{name:'登出',exact:true}).click();await expect(page.getByText('已登出',{exact:true}).filter({visible:true})).toBeVisible();await page.getByRole('button',{name:'使用 Email 登入',exact:true}).click();
 await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(password);const login=page.waitForResponse(r=>r.url().endsWith('/api/v1/sessions')&&r.request().method()==='POST');await page.getByRole('button',{name:'登入',exact:true}).click();const signedIn=await login;expect(signedIn.status()).toBe(201);expect((await signedIn.json()).account.accountId).toBe(account);
 await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();await context.clearCookies({name:'datinghigh_access_dev'});const refreshed=page.waitForResponse(r=>r.url().endsWith('/api/v1/session/refresh')&&r.request().method()==='POST');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));const rotation=await refreshed;expect(rotation.status()).toBe(200);expect((await rotation.json()).account.accountId).toBe(account);await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();
 const revoked=page.waitForResponse(r=>r.url().endsWith('/api/v1/session')&&r.request().method()==='DELETE');await page.getByRole('button',{name:'登出',exact:true}).click();expect((await revoked).status()).toBe(204);await expect(page.getByText('已登出',{exact:true}).filter({visible:true})).toBeVisible();expect((await context.cookies('http://localhost:8787')).filter(c=>c.name.startsWith('datinghigh_'))).toHaveLength(0);
});
test('PF-E2E-010 changing a password rejects old session and permits only the new password',async({page})=>{
 const email=`change-${Date.now()}@example.com`;await register(page,email);await page.getByRole('button',{name:'修改密碼',exact:true}).click();
 await page.getByLabel('目前密碼',{exact:true}).filter({visible:true}).fill(password);await page.getByLabel('新密碼',{exact:true}).filter({visible:true}).fill('A different password 43!');await page.getByLabel('確認密碼',{exact:true}).filter({visible:true}).fill('A different password 43!');
 await page.getByRole('button',{name:'更新密碼',exact:true}).click();await expect(page.getByText('密碼已更新，所有裝置都需要重新登入',{exact:true}).filter({visible:true})).toBeVisible();
 await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(password);await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page.getByText('Email 或密碼不正確',{exact:true}).filter({visible:true})).toBeVisible();
 await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill('A different password 43!');await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();
});
test('PF-E2E-008 local password reset consumes the code and returns to login',async({page})=>{
 const email=`reset-${Date.now()}@example.com`;await register(page,email);await page.getByRole('button',{name:'登出',exact:true}).click();await page.getByRole('button',{name:'使用 Email 登入',exact:true}).click();await page.getByRole('button',{name:'忘記密碼',exact:true}).click();
 await expect(page.getByRole('heading',{name:'找回你的帳號'})).toBeVisible();await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);const requested=page.waitForResponse(r=>r.url().endsWith('/password-reset-requests')&&r.request().method()==='POST');await page.getByRole('button',{name:'寄送驗證碼',exact:true}).click();const metadata=await (await requested).json();
 await expect(page.getByText(/若此 Email 可處理，將收到驗證碼/)).toBeVisible();await page.getByLabel('六位數驗證碼',{exact:true}).filter({visible:true}).fill(localCode(metadata.challengeId));
 await page.getByLabel('新密碼',{exact:true}).filter({visible:true}).fill('Reset with Email code 44!');await page.getByLabel('確認密碼',{exact:true}).filter({visible:true}).fill('Reset with Email code 44!');await page.getByRole('button',{name:'重設密碼',exact:true}).click();await expect(page.getByText('密碼已重設，請使用新密碼重新登入',{exact:true}).filter({visible:true})).toBeVisible();
 await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill('Reset with Email code 44!');await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();
});
test('PF-E2E-014 another device login invalidates the old family on foreground',async({page,browser})=>{
 const email=`single-${Date.now()}@example.com`;const {result}=await register(page,email);const original=(await result.json()).account.accountId;
 const other=await browser.newContext();const otherPage=await other.newPage();await otherPage.goto('http://localhost:8081/login');await otherPage.getByLabel('Email',{exact:true}).filter({visible:true}).fill(email);await otherPage.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(password);
 const signedIn=otherPage.waitForResponse(r=>r.url().endsWith('/api/v1/sessions')&&r.request().method()==='POST');await otherPage.getByRole('button',{name:'登入',exact:true}).click();expect((await (await signedIn).json()).account.accountId).toBe(original);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page.getByText(email,{exact:true}).filter({visible:true})).toHaveCount(0);await expect(page.getByText('帳號已在其他裝置登入，請重新登入',{exact:true}).filter({visible:true})).toBeVisible();await other.close();
});




