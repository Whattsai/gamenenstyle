import {test,expect,type Page} from '@playwright/test';import {register,password} from './support';import fs from'node:fs';
test.setTimeout(90000);
let network:unknown[]=[];const runs:unknown[]=[];
function observe(page:Page,label:string){page.on('request',r=>{if(r.url().includes('/api/v1/'))network.push({page:label,method:r.method(),path:new URL(r.url()).pathname,event:'request'});});page.on('response',async r=>{if(!r.url().includes('/api/v1/'))return;const record:{page:string,path:string,status:number,code?:string}={page:label,path:new URL(r.url()).pathname,status:r.status()};network.push(record);if(r.status()>=400)try{record.code=(await r.json()).code;}catch{}});}
test.beforeEach(async({page,context})=>{network=[];observe(page,'initial');let n=0;context.on('page',p=>observe(p,`same-context-${++n}`));});
test.afterEach(async({},info)=>{runs.push({test:info.title,status:info.status,network});fs.writeFileSync('.local/evidence/multi-tab-network.json',JSON.stringify(runs,null,2));});
const api='http://localhost:8787/api/v1';
const cors={'Access-Control-Allow-Origin':'http://localhost:8081','Access-Control-Allow-Credentials':'true'};
test.beforeEach(async({request})=>{await expect.poll(async()=>(await request.get('http://localhost:8787/health/ready')).status(),{timeout:90000}).toBe(200);});
test('PF-E2E-014 real Cookie tabs share one family, single-flight expired reads, retry an injected 409 with latest Cookie and sync logout',async({page,context})=>{
 const email=`tabs-${Date.now()}@example.com`;await register(page,email);const other=await context.newPage();await other.goto('/account');await expect(other.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();
 let faulting=true,expiredReads=0,rotations=0,releaseExpired!:()=>void;const expiredBatch=new Promise<void>(resolve=>{releaseExpired=resolve;});
 page.on('request',r=>{if(r.url()===`${api}/session/refresh`&&r.method()==='POST'){rotations++;faulting=false;}});
 await page.route('**/api/v1/session',async route=>{
  if(faulting&&route.request().method()==='GET'){expiredReads++;if(expiredReads>=2)releaseExpired();await expiredBatch;await route.fulfill({status:401,headers:cors,contentType:'application/problem+json',body:JSON.stringify({code:'ACCESS_TOKEN_EXPIRED'})});}else await route.continue();
 });
 const retriedRead=page.waitForResponse(r=>r.url()===`${api}/session`&&r.status()===200);
 await page.evaluate(()=>{window.dispatchEvent(new Event('focus'));window.dispatchEvent(new Event('pageshow'));});
 await retriedRead;await expect.poll(()=>rotations).toBe(1);await expect.poll(()=>expiredReads).toBeGreaterThanOrEqual(2);await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();await page.unroute('**/api/v1/session');
 let attempts=0;const otherRefreshed=other.waitForResponse(r=>r.url()===`${api}/session/refresh`&&r.status()===200);
 await page.route('**/api/v1/session/refresh',async route=>{
  if(route.request().method()!=='POST'){await route.continue();return;}
  attempts++;if(attempts===1){await otherRefreshed;await route.fulfill({status:409,headers:cors,contentType:'application/problem+json',body:JSON.stringify({code:'REFRESH_RETRY'})});}else await route.continue();
 });
 await context.clearCookies({name:'datinghigh_access_dev'});
 await Promise.all([page.evaluate(()=>window.dispatchEvent(new Event('focus'))),other.evaluate(()=>window.dispatchEvent(new Event('focus')))]);
 await expect.poll(()=>attempts,{timeout:20000}).toBe(2);await expect(page.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();await expect(other.getByText(email,{exact:true}).filter({visible:true})).toBeVisible();await page.unroute('**/api/v1/session/refresh');
 expect((await context.request.post(`${api}/session/refresh`,{headers:{Origin:'https://untrusted.example','X-DatingHigh-Client':'web'},data:{clientPlatform:'web'}})).status()).toBe(403);
 await other.getByRole('button',{name:'登出',exact:true}).click();await expect(other.getByText('已登出',{exact:true}).filter({visible:true})).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect(page.getByText(email,{exact:true}).filter({visible:true})).toHaveCount(0);await expect(page.getByLabel('Email',{exact:true}).filter({visible:true})).toBeVisible();await other.close();
});
test('PF-E2E-014 an account switch in the same Cookie context clears the stale tab without revoking the new owner',async({page,context,browser})=>{
 const original=`tab-owner-${Date.now()}@example.com`,replacement=`tab-new-${Date.now()}@example.com`;await register(page,original);
 const isolated=await browser.newContext();const setup=await isolated.newPage();await register(setup,replacement);await setup.getByRole('button',{name:'登出',exact:true}).click();await expect(setup.getByText('已登出',{exact:true}).filter({visible:true})).toBeVisible();await isolated.close();
 const other=await context.newPage();await other.goto('/login');await other.getByLabel('Email',{exact:true}).filter({visible:true}).fill(replacement);await other.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(password);await other.getByRole('button',{name:'登入',exact:true}).click();await expect(other.getByText(replacement,{exact:true}).filter({visible:true})).toBeVisible();
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await expect(page.getByText(original,{exact:true}).filter({visible:true})).toHaveCount(0);await expect(page.getByLabel('Email',{exact:true}).filter({visible:true})).toBeVisible();
 const current=await context.request.get(`${api}/session`,{headers:{Origin:'http://localhost:8081','X-DatingHigh-Client':'web'}});expect(current.status()).toBe(200);expect((await current.json()).account.email).toBe(replacement);await other.close();
});
