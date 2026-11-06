import {test,expect,type Page,type APIRequestContext,type Route} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {startBackend,stopBackend,control,routeBackend,type Backend,avatarFixturePassword} from './backend';

test.setTimeout(90000);test.use({actionTimeout:10000});
let backend:Backend,management:APIRequestContext,players:{candidateId:string}[];
test.beforeAll(async({playwright})=>{management=await playwright.request.newContext();backend=await startBackend({DATINGHIGH_E2E_MATCHING_PROFILE:'1'});});
test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();});
test.beforeEach(async({request})=>{await control(backend,request,{op:'reset'});players=(await control(backend,request,{op:'matching-seed'})).players;});
test.afterEach(async({page},info)=>{if(info.status!==info.expectedStatus)console.info(JSON.stringify({path:new URL(page.url()).pathname,visibleButtons:await page.getByRole('button').filter({visible:true}).allTextContents()}));});
async function login(page:Page,n:number,destination=/\/matching$/){
 await routeBackend(page,backend);await page.goto('/login');
 await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(`matching-${n}@example.test`);
 await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(avatarFixturePassword);
 await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).toHaveURL(destination);
}
async function select(page:Page,name:string){
 const searched=page.waitForResponse(r=>r.url().endsWith('/match-candidates/search')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).filter({visible:true}).click();await searched;
 await expect(page.getByRole('button',{name:'重新整理配對狀態',exact:true})).toBeEnabled();
 await expect(page.getByText(/^測試旅人[012]$/).filter({visible:true}).first()).toBeVisible();
 for(let n=0;n<3;n++){
  const current=await page.getByText(/^測試旅人[012]$/).filter({visible:true}).first().textContent();
  if(current===name)return;
  await expect(page.getByRole('button',{name:'下一位',exact:true})).toBeEnabled();
  const previous=await page.getByText(/^測試旅人[012]$/).filter({visible:true}).first().textContent();
  await page.getByRole('button',{name:'下一位',exact:true}).click();
  await expect(page.getByText(previous!,{exact:true}).filter({visible:true})).toHaveCount(0);
  await expect(page.getByText(/^測試旅人[012]$/).filter({visible:true}).first()).toBeVisible();
 }
 await expect(page.getByText(name,{exact:true}).filter({visible:true})).toBeVisible();
}
for(const format of ['built-in','data-url'])test(`${format} avatar keeps the same bounded portrait frame when switching candidate and page on mobile and desktop`,async({page,request})=>{
 await control(backend,request,{op:'matching-more'});await page.setViewportSize({width:360,height:800});await login(page,0);
 let portraitRoutingFailed=false;
 const portraitRequests=new Set<Promise<void>>();let portraitRoute:((route:Route)=>Promise<void>)|undefined;
 if(format==='data-url'){
  // 只替換UI圖像傳輸格式，使用既有無個資插畫；不是Gemini或SQL驗收證據。
  const data='data:image/jpeg;base64,'+readFileSync('frontend/client/assets/avatars/female-08.jpg').toString('base64');
  portraitRoute=async route=>{
   if(route.request().method()!=='GET')return route.fallback();
   const request=(async()=>{try{
     const response=await route.fetch({url:backend.url+new URL(route.request().url()).pathname});if(!response.ok())return route.fulfill({response});
     const body=await response.json();body.persona={...body.persona,selectedAvatarType:'generated',selectedAvatarRef:'019a281e-0000-7000-8000-000000000777',avatarDataUrl:data};await route.fulfill({response,json:body});
    }catch{portraitRoutingFailed=true;await route.abort('failed').catch(()=>{});}
   })();portraitRequests.add(request);try{await request;}finally{portraitRequests.delete(request);}
  };
  await page.route('**/api/v1/match-candidates/*',portraitRoute);
  await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).click();await expect(page.getByText('1 / 20',{exact:true})).toBeVisible();
 }
 const check=async()=>{
  const image=page.getByRole('img',{name:/的遊戲化身$/}).filter({visible:true});await expect(image).toHaveCount(1);
  await expect.poll(()=>image.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const box=await image.boundingBox();expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(100);expect(box!.width).toBeLessThanOrEqual(420);
  expect(box!.height/box!.width).toBeCloseTo(4/3,2);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
 };
 for(const width of [360,1200]){
  await page.setViewportSize({width,height:800});await check();
  if(format==='built-in'&&width===360){await page.getByRole('img',{name:/的遊戲化身$/}).filter({visible:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'.local/evidence/matching-built-in-fixed.png'});}
  for(let n=0;n<3;n++){
   const previous=await page.getByRole('img',{name:/的遊戲化身$/}).filter({visible:true}).getAttribute('alt');
   await page.getByRole('button',{name:'下一位',exact:true}).click();await expect(page.getByText(`${n+2} / 20`,{exact:true})).toBeVisible();
   await expect(page.getByRole('img',{name:previous!,exact:true})).toHaveCount(0);await check();
  }
  await page.getByRole('button',{name:'下一頁',exact:true}).click();await expect(page.getByText('1 / 3',{exact:true})).toBeVisible();await check();
  await page.getByRole('button',{name:'下一位',exact:true}).click();await expect(page.getByText('2 / 3',{exact:true})).toBeVisible();await check();
  await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).click();await expect(page.getByText('1 / 20',{exact:true})).toBeVisible();
 }
 await check();
 if(portraitRoute){await page.unroute('**/api/v1/match-candidates/*',portraitRoute);await Promise.all([...portraitRequests]);}
 expect(portraitRoutingFailed).toBe(false);
});
test('invitation cards keep bounded built-in portraits for both senders at mobile and desktop widths',async({page,request})=>{
 for(const n of [1,2]){
  const signed=await request.post(backend.url+'/api/v1/sessions',{headers:{'X-DatingHigh-Client':'android'},data:{email:`matching-${n}@example.test`,password:avatarFixturePassword,clientPlatform:'android'}});expect(signed.status()).toBe(201);
  const tokens=(await signed.json()).tokens;
  const sent=await request.post(backend.url+'/api/v1/match-invitations',{headers:{'X-DatingHigh-Client':'android',Authorization:'Bearer '+tokens.accessToken},data:{candidateId:players[0].candidateId,clientRequestId:`019a281e-0000-7000-8000-00000000000${n}`}});expect(sent.status()).toBe(201);
 }
 await login(page,0);await page.getByRole('button',{name:'邀請',exact:true}).click();
 for(const width of [360,1200]){
  await page.setViewportSize({width,height:800});const portraits=page.getByRole('img',{name:/的遊戲化身$/}).filter({visible:true});await expect(portraits).toHaveCount(2);
  for(const portrait of await portraits.all()){
   await expect.poll(()=>portrait.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);const box=await portrait.boundingBox();
   expect(box!.width).toBeGreaterThan(100);expect(box!.width).toBeLessThanOrEqual(420);expect(box!.height/box!.width).toBeCloseTo(4/3,2);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
});
test('an ended real D1 room leaves the old page on foreground and cannot trap a reload',async({browser,page,request})=>{
 const other=await browser.newContext();try{
  const b=await other.newPage();await login(page,0);await login(b,1);await select(page,'測試旅人1');await page.getByRole('button',{name:'想認識',exact:true}).click();
  await b.getByRole('button',{name:'邀請',exact:true}).click();await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b).toHaveURL(/\/game-round\/[0-9a-f-]+$/);
  const room=b.url().split('/').at(-1)!;await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).click();await expect(page).toHaveURL(new RegExp('/game-round/'+room+'$'));
  await control(backend,request,{op:'matching-end',roundId:room});expect((await control(backend,request,{op:'matching-state'})).participants).toHaveLength(0);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(page).toHaveURL(/\/matching$/);
  await page.goto('/game-round/'+room);await expect(page).toHaveURL(/\/matching$/);await expect(page.getByText('測試旅人2',{exact:true}).filter({visible:true})).toBeVisible();
 }finally{await other.close();}
});
test('MS-ET-001/003/005/007/008/009/011/013/019 true two-party accept, third-party invalidation and restored same room',async({browser,page,request})=>{
 const other=await browser.newContext(),third=await browser.newContext();
 try{
  const b=await other.newPage(),c=await third.newPage();await login(page,0);await login(b,1);await login(c,2);
  await select(c,'測試旅人0');await c.getByRole('button',{name:'想認識',exact:true}).click();await select(c,'測試旅人0');await expect(c.getByRole('button',{name:'等待回覆',exact:true})).toBeDisabled();
  await select(page,'測試旅人1');await page.getByRole('button',{name:'想認識',exact:true}).dblclick();await select(page,'測試旅人1');await expect(page.getByRole('button',{name:'等待回覆',exact:true})).toBeDisabled();
  expect((await control(backend,request,{op:'matching-state'})).rounds).toHaveLength(0);
  await b.getByRole('button',{name:'邀請',exact:true}).click();await expect(b.getByRole('button',{name:'接受 測試旅人0',exact:true})).toBeVisible();
  await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b.getByText('專屬雙人房間',{exact:true})).toBeVisible();
  const room=b.url().split('/').at(-1);await page.reload();await expect(page).toHaveURL(new RegExp('/game-round/'+room+'$'));
  await expect(page.getByText('房間編號：'+room,{exact:true})).toBeVisible();expect(await page.getByRole('button',{name:'傳送訊息'}).count()).toBe(0);
  await c.getByRole('button',{name:'邀請',exact:true}).click();await expect(c.getByText('對方目前無法配對，這次邀請已失效',{exact:true})).toBeVisible();
  await c.getByRole('button',{name:'探索',exact:true}).click();await expect(c.getByText('目前沒有可配對的對象',{exact:true})).toBeVisible();
  const state=await control(backend,request,{op:'matching-state'});expect(state.rounds).toHaveLength(1);expect(state.participants).toHaveLength(2);expect(state.invitations.filter((i:any)=>i.status==='accepted')).toHaveLength(1);
  await page.setViewportSize({width:360,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.getByRole('button',{name:'配對入口',exact:true}).click();await expect(page).toHaveURL(new RegExp('/game-round/'+room+'$'));
  const replacement=await browser.newContext();try{
   const restored=await replacement.newPage();await login(restored,0,new RegExp('/game-round/'+room+'$'));
   await expect(restored.getByText('房間編號：'+room,{exact:true})).toBeVisible();
  }finally{await replacement.close();}
 }finally{await other.close();await third.close();}
});
test('MS-ET-004/016 permanent decline requires confirmation; cancelling dialog preserves pending',async({browser,page,request})=>{
 const other=await browser.newContext();try{
  const b=await other.newPage();await login(page,0);await login(b,1);await select(page,'測試旅人1');await page.getByRole('button',{name:'想認識',exact:true}).click();
  await b.getByRole('button',{name:'邀請',exact:true}).click();await b.getByRole('button',{name:'婉拒 測試旅人0',exact:true}).click();
  await expect(b.getByText('婉拒後你們將無法再次互相配對',{exact:true})).toBeVisible();await b.getByRole('button',{name:'保留邀請',exact:true}).click();
  expect((await control(backend,request,{op:'matching-state'})).invitations[0].status).toBe('pending');
  await b.getByRole('button',{name:'婉拒 測試旅人0',exact:true}).click();await b.getByRole('button',{name:'確認永久婉拒',exact:true}).click();
  await expect(b.getByText('已婉拒，彼此不再配對',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).click();await expect(page.getByText('測試旅人2',{exact:true})).toBeVisible();
  expect((await control(backend,request,{op:'matching-state'})).invitations[0].status).toBe('declined');
 }finally{await other.close();}
});
test('incoming exploration card can decline directly without visiting the invitation list',async({browser,page,request})=>{
 const other=await browser.newContext();try{
  const b=await other.newPage();await login(page,0);await login(b,1);await select(page,'測試旅人1');await page.getByRole('button',{name:'想認識',exact:true}).click();
  await select(b,'測試旅人0');await expect(b.getByRole('button',{name:'接受邀請',exact:true})).toBeVisible();
  await b.getByRole('button',{name:'婉拒邀請',exact:true}).click();await expect(b.getByText('婉拒後你們將無法再次互相配對',{exact:true})).toBeVisible();
  await b.getByRole('button',{name:'保留邀請',exact:true}).click();expect((await control(backend,request,{op:'matching-state'})).invitations[0].status).toBe('pending');
  await b.getByRole('button',{name:'婉拒邀請',exact:true}).click();await b.getByRole('button',{name:'確認永久婉拒',exact:true}).click();
  await expect(b.getByText('測試旅人2',{exact:true})).toBeVisible();expect((await control(backend,request,{op:'matching-state'})).invitations[0].status).toBe('declined');
 }finally{await other.close();}
});
test('MS-ET-005/006 cancelled and expired invitations remain nonpermanent, accept is unavailable at expiry',async({browser,page,request})=>{
 const other=await browser.newContext();try{
  const b=await other.newPage();await login(page,0);await login(b,1);await select(page,'測試旅人1');await page.getByRole('button',{name:'想認識',exact:true}).click();
  await page.getByRole('button',{name:'邀請',exact:true}).click();await page.getByRole('button',{name:'取消邀請 測試旅人1',exact:true}).click();
  await expect(page.getByText('已取消，未來仍可再次相遇',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'探索',exact:true}).click();await expect(page).toHaveURL(/\/matching$/);await expect(page.getByText('探索心動',{exact:true}).filter({visible:true})).toBeVisible();await select(page,'測試旅人1');
  const created=page.waitForResponse(r=>r.url().endsWith('/match-invitations')&&r.request().method()==='POST');await page.getByRole('button',{name:'想認識',exact:true}).click();expect((await created).status()).toBe(201);
  await control(backend,request,{op:'matching-expire'});await b.getByRole('button',{name:'邀請',exact:true}).click();
  await expect(b.getByText('已逾期，未來仍可再次相遇',{exact:true})).toBeVisible();await expect(b.getByRole('button',{name:'接受 測試旅人0',exact:true})).toHaveCount(0);
  expect((await control(backend,request,{op:'matching-state'})).rounds).toHaveLength(0);
 }finally{await other.close();}
});
test('MS-ET-011/012 unknown write does not auto-replay; readback restores committed pending',async({page,request})=>{
 await login(page,0);await select(page,'測試旅人1');let writes=0;
 await page.route('**/api/v1/match-invitations',async route=>{
  if(route.request().method()!=='POST'){await route.fallback();return;}
  writes++;await route.fetch({url:backend.url+'/api/v1/match-invitations'});await route.abort('failed');
 });
 await page.getByRole('button',{name:'想認識',exact:true}).click();await expect(page.getByText('狀態不明，請重新整理；不會自動重送邀請',{exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'想認識',exact:true})).toBeDisabled();expect(writes).toBe(1);
 await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).click();await select(page,'測試旅人1');await expect(page.getByRole('button',{name:'等待回覆',exact:true})).toBeDisabled();
 expect(writes).toBe(1);expect((await control(backend,request,{op:'matching-state'})).invitations).toHaveLength(1);
});
test('MS-ET-013 ordered IDs page first, only four personas prefetch, and next page uses real stored candidates',async({page,request})=>{
 await control(backend,request,{op:'matching-more'});const personas:string[]=[];page.on('request',r=>{if(r.method()==='GET'&&/\/match-candidates\/[0-9a-f-]+$/.test(new URL(r.url()).pathname))personas.push(r.url());});
 const first=page.waitForResponse(r=>r.url().endsWith('/match-candidates/search'));await login(page,0);const firstBody=await(await first).json();
 expect(firstBody.items).toHaveLength(20);expect(firstBody.nextOffset).toBe(20);await expect(page.getByText('1 / 20',{exact:true})).toBeVisible();
 await expect.poll(()=>personas.length).toBe(4);
 const next=page.waitForResponse(r=>r.url().endsWith('/match-candidates/search'));await page.getByRole('button',{name:'下一頁',exact:true}).click();const secondBody=await(await next).json();
 expect(secondBody.items).toHaveLength(3);expect(secondBody.nextOffset).toBeNull();expect(secondBody.items.every((p:any)=>!firstBody.items.some((q:any)=>p.candidateId===q.candidateId))).toBe(true);
 await expect(page.getByText('1 / 3',{exact:true})).toBeVisible();await expect(page.getByText(/^分頁旅人\d+$/).filter({visible:true}).first()).toBeVisible();
});
test('MS-ET-002/015/018 profile incomplete and unknown status are explicit; ready empty search has no placeholder people',async({page,request})=>{
 await control(backend,request,{op:'matching-profile',player:0,mode:'orientation-empty'});await login(page,0,/\/profile$/);
 await expect(page.getByLabel('暱稱',{exact:true})).toHaveValue('測試旅人0');await page.goto('/matching');
 await expect(page.getByText('請先完成個人資料',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'完成個人資料',exact:true})).toBeVisible();expect(await page.getByText(/^測試旅人[12]$/).count()).toBe(0);
 await control(backend,request,{op:'matching-profile',player:0,mode:'ready'});
 for(let n=0;n<2;n++)await control(backend,request,{op:'fault-response',path:'/api/v1/game-rounds',mode:'unavailable'});
 await page.goto('/start');await expect(page.getByText('目前無法確認配對狀態，請重試',{exact:true})).toBeVisible();await page.getByRole('button',{name:'重試配對狀態',exact:true}).click();await expect(page).toHaveURL(/\/matching$/);
 for(const player of [1,2])await control(backend,request,{op:'matching-profile',player,mode:'male-only'});
 await page.getByRole('button',{name:'重新整理配對狀態',exact:true}).click();await expect(page.getByText('目前沒有可配對的對象',{exact:true})).toBeVisible();
});
test('MS-BDD-066/067 existing invitation remains actionable after orientation removal',async({browser,page,request})=>{
 const other=await browser.newContext();try{
  const b=await other.newPage();await login(page,0);await login(b,1);await select(page,'測試旅人1');
  const created=page.waitForResponse(r=>r.url().endsWith('/match-invitations')&&r.request().method()==='POST');await page.getByRole('button',{name:'想認識',exact:true}).click();expect((await created).status()).toBe(201);
  await control(backend,request,{op:'matching-profile',player:1,mode:'orientation-empty'});
  await b.getByRole('button',{name:'邀請',exact:true}).click();await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b.getByText('專屬雙人房間',{exact:true})).toBeVisible();
  expect((await control(backend,request,{op:'matching-state'})).invitations[0].status).toBe('accepted');
 }finally{await other.close();}
});
