import {test,expect,type Page,type APIRequestContext} from '@playwright/test';
import {startBackend,stopBackend,control,routeBackend,type Backend,avatarFixturePassword} from './backend';

test.setTimeout(180000);test.use({actionTimeout:15000});
let backend:Backend,management:APIRequestContext,players:{candidateId:string}[];let serial=800000;
const recordedApprovedArt=!!process.env.DATINGHIGH_E2E_STORY_APPROVED_PACK;
const requestId=()=>`019a281e-0000-7000-8000-${String(++serial).padStart(12,'0')}`;
test.beforeAll(async({playwright})=>{management=await playwright.request.newContext();backend=await startBackend({DATINGHIGH_E2E_MATCHING_PROFILE:'1',DATINGHIGH_E2E_STORY_PROFILE:'1',DATINGHIGH_E2E_AVATAR_PROFILE:'1'});});
test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();});
test.beforeEach(async({request})=>{await control(backend,request,{op:'reset'});players=(await control(backend,request,{op:'matching-seed'})).players;for(const player of [0,1])await control(backend,request,{op:'story-avatar-pack',player});});
async function setup(page:Page){
 await routeBackend(page,backend);await page.route('**/story-content/**',async route=>{const response=await route.fetch({url:backend.url+new URL(route.request().url()).pathname});await route.fulfill({response});});
}
async function login(page:Page,n:number,afterLogin:RegExp=/\/matching$/){await setup(page);await page.goto('/login');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill(`matching-${n}@example.test`);await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill(avatarFixturePassword);await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).toHaveURL(afterLogin);}
async function post(page:Page,path:string,body:Record<string,unknown>){return page.evaluate(async({path,body})=>{const r=await fetch('/api/v1'+path,{method:'POST',headers:{'Content-Type':'application/json','X-DatingHigh-Client':'web'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};},{path,body});}
async function pair(a:Page,b:Page){
 await login(a,0);await login(b,1);const sent=await post(a,'/match-invitations',{candidateId:players[1].candidateId,clientRequestId:requestId()});expect(sent.status).toBe(201);
 await b.goto('/invitations');await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b).toHaveURL(/\/game-round\//);await a.goto('/start');await expect(a).toHaveURL(/\/game-round\//);
 for(const page of [a,b]){await expect(page.getByText('雨聲書店',{exact:true})).toBeVisible();await expect(page.getByText('即時連線已同步',{exact:true})).toBeVisible({timeout:60000});const portraits=page.getByRole('img',{name:/的遊戲立繪$/});await expect(portraits).toHaveCount(1);for(const portrait of await portraits.all())await expect.poll(()=>portrait.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);const drawer=page.getByRole('button',{name:'展開聊天室',exact:true});if(await drawer.count())await drawer.click();}
 if(recordedApprovedArt){const images=a.locator('img[src*="/partner-avatar/"]');await expect(images).toHaveCount(5);for(const image of await images.all())await expect.poll(()=>image.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(896);await a.screenshot({path:'.local/evidence/story-web-approved-gemini-entry.png'});}
 return new URL(a.url()).pathname.split('/').at(-1)!;
}
async function choose(page:Page,label:string){
 const skip=page.getByRole('button',{name:'略過本段演出',exact:true});if(await skip.count())await skip.click();
 const reveal=page.getByRole('button',{name:'顯示完整句',exact:true});if(await reveal.count())await reveal.click();
 await page.getByRole('button',{name:label,exact:true}).click();
 await expect(page.getByRole('button',{name:label,exact:true})).toHaveCount(0);
}
for(const branch of ['together','different'])test(`scene01 real Web↔Web: ${branch} ending, truthful asynchronous cooperation and safe exit`,async({page,browser,request})=>{
 const context=await browser.newContext();const b=await context.newPage();try{
  await page.setViewportSize({width:1200,height:900});await b.setViewportSize({width:390,height:850});const round=await pair(page,b);
  await expect(page.getByText('選擇今晚的故事',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'觀察型',exact:true}).click();await expect(b.getByText('你也注意到那張藏在書裡的卡片了嗎？',{exact:true})).toBeVisible();
  await b.getByLabel('你的訊息',{exact:true}).fill('A real reply from the second player');await b.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(page.getByText('A real reply from the second player',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'翻看手寫書籤',exact:true}).click();await page.getByRole('button',{name:'翻到書籤背面',exact:true}).click();await expect(page.getByText('你的探索',{exact:true})).toBeVisible();
  await page.screenshot({path:`.local/evidence/story-web-${branch}-intro.png`});
  await choose(page,'走近那張推薦卡');await choose(page,'一起看看書架');await choose(page,branch==='together'?'追尋書籤的提示':'留在桌邊，繼續聊天');if(branch==='together')await choose(page,'把便條放回，帶著心意回桌邊');await choose(page,'為今晚選一個閱讀方向');
  await page.getByRole('button',{name:'溫暖的日常',exact:true}).click();await expect(page.getByText(/等待另一方選擇；可以返回探索或聊天/)).toBeVisible();
  await page.getByRole('button',{name:'返回場景探索',exact:true}).click();await expect(page.getByRole('button',{name:'打開合作卡',exact:true})).toBeVisible();
  await page.getByLabel('你的訊息',{exact:true}).fill('We can still talk while waiting');await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(b.getByText('We can still talk while waiting',{exact:true})).toBeVisible();
  await b.getByRole('button',{name:branch==='together'?'溫暖的日常':'未知的冒險',exact:true}).click();
  const ending=branch==='together'?'同一頁的微光':'並肩的兩頁';for(const client of [page,b]){await expect(client.getByText(ending,{exact:true})).toBeVisible();await expect(client.getByRole('button',{name:/下一個獨立劇本|開始第二場/})).toHaveCount(0);}
  await page.getByLabel('你的訊息',{exact:true}).fill('The chapter is complete and chat remains open');await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(b.getByText('The chapter is complete and chat remains open',{exact:true})).toBeVisible();
  await b.reload();await expect(b.getByText(ending,{exact:true})).toBeVisible();await b.getByRole('button',{name:'展開聊天室',exact:true}).click();await expect(b.getByText('The chapter is complete and chat remains open',{exact:true})).toBeVisible();await expect(b.getByText('即時連線已同步',{exact:true})).toBeVisible({timeout:30000});
  await page.getByLabel('你的訊息',{exact:true}).fill('先到這邊');await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(page.getByText('是否想結束這段互動？',{exact:true})).toBeVisible();await expect(b.getByText('是否想結束這段互動？',{exact:true})).toHaveCount(0);await page.getByRole('button',{name:'返回編輯',exact:true}).click();
  await page.getByRole('button',{name:'結束本輪互動',exact:true}).click();await expect(page.getByText(/永久無法再次配對/)).toBeVisible();await page.getByRole('button',{name:'繼續這段相遇',exact:true}).click();await expect(page.getByText('確定結束本輪互動？',{exact:true})).toHaveCount(0);await expect(page.getByLabel('你的訊息')).toBeVisible();
  await page.screenshot({path:`.local/evidence/story-web-${recordedApprovedArt?'approved-gemini-':''}${branch}-ending.png`});
  await page.getByRole('button',{name:'結束本輪互動',exact:true}).click();await page.getByRole('button',{name:'確認結束',exact:true}).click();for(const client of [page,b]){await expect(client.getByText('本輪互動已結束',{exact:true})).toBeVisible();await expect(client.getByLabel('你的訊息')).toHaveCount(0);}
  await b.reload();await expect(b.getByText('本輪互動已結束',{exact:true})).toBeVisible();
  const denied=await post(page,`/game-rounds/${round}/events/query`,{afterSeq:0,limit:50});expect(denied.status).toBe(409);
  const excluded=await post(page,'/match-invitations',{candidateId:players[1].candidateId,clientRequestId:requestId()});expect(excluded.status).toBe(409);
 }finally{await context.close();}
});

test(recordedApprovedArt?'2.5D approved Gemini art replay: POV, private R2, WS replacement and bounded chat':'2.5D technical fixture: partner-only POV, real R2 pack, WS replacement, stable images and bounded chat',async({page,browser,request})=>{
 // Skia 透明幾何 fixture 只驗傳輸、授權及布局，不是原畫／Gemini 視覺品質驗收。
 const context=await browser.newContext();const b=await context.newPage();try{
  await page.setViewportSize({width:1200,height:900});await b.setViewportSize({width:390,height:850});const round=await pair(page,b);
  await expect(page.getByTestId('scene-camera-entry-wide')).toBeVisible();await expect(b.getByTestId('scene-camera-entry-wide')).toBeVisible();
  for(const client of [page,b]){expect(await client.evaluate(()=>document.documentElement.scrollHeight<=window.innerHeight+1)).toBe(true);await expect(client.getByRole('button',{name:'結束本輪互動',exact:true})).toBeInViewport();}
  for(const client of [page,b]){await client.getByRole('button',{name:'關閉場景微動',exact:true}).click();await expect(client.getByTestId('scene-atmosphere')).toHaveCount(0);await expect(client.getByTestId('scene-camera-entry-wide')).toBeVisible();await expect(client.getByLabel('你的訊息',{exact:true})).toBeVisible();await client.getByRole('button',{name:'開啟場景微動',exact:true}).click();await expect(client.getByTestId('scene-atmosphere')).toBeVisible();}
  await page.screenshot({path:'.local/evidence/story-visual-technical-desktop.png'});await b.screenshot({path:'.local/evidence/story-visual-technical-mobile.png'});
  const before=await b.getByRole('img',{name:/的遊戲立繪$/}).getAttribute('src');let reads=0;
  b.on('request',r=>{if(r.method()==='GET'&&r.url().endsWith(`/game-rounds/${round}/partner-avatar`))reads++;});
  await control(backend,request,{op:'story-avatar-pack',player:0});
  await expect.poll(()=>b.getByRole('img',{name:/的遊戲立繪$/}).getAttribute('src')).not.toBe(before);expect(reads).toBe(1);
  const mediaRequests:string[]=[];b.on('request',r=>{if(/\/partner-avatar\/[a-f0-9]{64}\//.test(r.url()))mediaRequests.push(r.url());});
  await b.getByRole('button',{name:'收起聊天室',exact:true}).click();await choose(b,'走近那張推薦卡');await expect(b.getByTestId('scene-camera-table-medium')).toBeVisible();
  await b.getByRole('button',{name:'展開聊天室',exact:true}).click();expect(reads).toBe(1);expect(mediaRequests).toHaveLength(0);
 }finally{await context.close();}
});

test('real commit with lost ACK recovers original ID exactly once after reconnect',async({page,browser})=>{
 await page.addInitScript(()=>{const Original=window.WebSocket;class Captured extends Original{constructor(url:string|URL,protocols?:string|string[]){super(url,protocols);(window as any).__storySocket=this;}send(data:string|ArrayBufferLike|Blob|ArrayBufferView){super.send(data);if(typeof data==='string'){const frame=JSON.parse(data);if(frame.type==='message.send')(window as any).__originalRequest=frame.clientRequestId;}}}window.WebSocket=Captured;});
 const other=await browser.newContext();const b=await other.newPage();try{
  const round=await pair(page,b);let failCursor=true;await page.route('**/api/v1/game-rounds/*/events/query',async route=>{if(failCursor)await route.fulfill({status:503,contentType:'application/problem+json',body:JSON.stringify({code:'DEPENDENCY_UNAVAILABLE',status:503})});else await route.fallback();});
  // 標準 socket 的 ACK 只在本測試丟棄；真 Application／D1 仍正常提交。
  await page.evaluate(()=>{const ws=(window as any).__storySocket as WebSocket;const handler=ws.onmessage;ws.onmessage=function(event){const frame=JSON.parse(String(event.data));if(frame.type==='command.ack'){ws.close();return;}handler?.call(ws,event);};});
  await page.getByLabel('你的訊息').fill('One committed message whose ACK was lost');await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(b.getByText('One committed message whose ACK was lost',{exact:true})).toBeVisible();
  await expect(page.getByText('送出結果不明，請重新同步',{exact:true})).toBeVisible({timeout:15000});failCursor=false;await expect(page.getByText('即時連線已同步',{exact:true})).toBeVisible({timeout:30000});
  const recover=page.getByRole('button',{name:'以原編號查回結果',exact:true});if(await recover.count())await recover.click();await expect(page.getByText('送出結果不明，請重新同步',{exact:true})).toHaveCount(0);
  const original=await page.evaluate(()=>(window as any).__originalRequest);const result=await post(b,`/game-rounds/${round}/events/query`,{afterSeq:0,limit:100});expect(result.status).toBe(200);expect(result.body.events.filter((e:any)=>e.clientRequestId===original)).toHaveLength(1);
 }finally{await other.close();}
});

test('real network loss keeps the draft disabled until the same room reconnects',async({page,browser})=>{
 await page.addInitScript(()=>{const Original=window.WebSocket;class Captured extends Original{constructor(url:string|URL,protocols?:string|string[]){super(url,protocols);(window as any).__storySocket=this;}}window.WebSocket=Captured;});
 const other=await browser.newContext();const b=await other.newPage();try{
  const round=await pair(page,b);const draft='Offline kept draft and resumed once';await page.getByLabel('你的訊息',{exact:true}).fill(draft);
  await page.context().setOffline(true);await page.evaluate(()=>((window as any).__storySocket as WebSocket).close());await expect(page.getByText('重新連線中；狀態尚未確認',{exact:true})).toBeVisible({timeout:15000});
  await expect(page.getByRole('button',{name:'傳送訊息',exact:true})).toBeDisabled();await expect(page.getByText('雨聲書店',{exact:true})).toBeVisible();
  await page.context().setOffline(false);await expect(page.getByText('即時連線已同步',{exact:true})).toBeVisible({timeout:30000});
  await expect(page.getByLabel('你的訊息',{exact:true})).toHaveValue(draft);await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(b.getByText(draft,{exact:true})).toBeVisible();
  const result=await post(b,`/game-rounds/${round}/events/query`,{afterSeq:0,limit:100});expect(result.status).toBe(200);expect(result.body.events.filter((e:any)=>e.type==='message.committed'&&e.payload.text===draft)).toHaveLength(1);
 }finally{await other.close();}
});

test('a second mobile device can resume the room after the account family moves',async({page,browser})=>{
 const secondDevice=await browser.newContext({viewport:{width:390,height:850}});const c=await secondDevice.newPage();const other=await browser.newContext();const b=await other.newPage();try{
  const round=await pair(page,b);await login(c,0,/game-round\//);
  await expect(c.getByText('雨聲書店',{exact:true})).toBeVisible();await expect(c.getByText('即時連線已同步',{exact:true})).toBeVisible({timeout:30000});await c.getByRole('button',{name:'展開聊天室',exact:true}).click();
  await page.reload();await expect(page).toHaveURL(/\/login$/, {timeout:30000});await expect(c.getByRole('img',{name:/的遊戲立繪$/})).toHaveCount(1);
  const message='Room continued on the second device';await c.getByLabel('你的訊息',{exact:true}).fill(message);await c.getByRole('button',{name:'傳送訊息',exact:true}).click();await expect(b.getByText(message,{exact:true})).toBeVisible();
 }finally{await secondDevice.close();await other.close();}
});

test('approved art: all sixteen full-body selections decode and the partner receives five authorized expressions',async({page,browser})=>{
 const context=await browser.newContext();const b=await context.newPage();try{
  await page.setViewportSize({width:1200,height:950});await b.setViewportSize({width:390,height:850});const round=await pair(page,b);
  const selected=await b.evaluate(async()=>{const h={'X-DatingHigh-Client':'web','Content-Type':'application/json'},p=await(await fetch('/api/v1/me/dating-profile',{headers:h})).json();return(await fetch('/api/v1/me/avatar/selection',{method:'PUT',headers:h,body:JSON.stringify({type:'builtin',builtinAvatarId:'male-02',expectedRevision:p.revision})})).status;});expect(selected).toBe(200);
  const previous=await b.getByRole('img',{name:/的遊戲立繪$/}).getAttribute('src');
  await page.goto('/profile');await page.getByRole('button',{name:'選擇化身',exact:true}).click();
  await expect(page.getByRole('button',{name:/選用 (male|female)-0[1-8]/})).toHaveCount(16);
  for(const gender of ['male','female'])for(let n=1;n<=8;n++){
   const image=page.getByRole('img',{name:`${gender}-0${n}`,exact:true});
   await expect.poll(()=>image.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(1086);
   expect(await image.getAttribute('src')).toContain('.webp');
  }
  await page.screenshot({path:'.local/evidence/approved-full-body-selection-web.png'});
  await page.getByRole('button',{name:'選用 female-08',exact:true}).click();await expect(page.getByText('遊戲化身已更新',{exact:true})).toBeVisible();
  await expect.poll(()=>b.getByRole('img',{name:/的遊戲立繪$/}).getAttribute('src')).not.toBe(previous);
  const images=b.locator('img[src*="/partner-avatar/"]');
  await expect(images).toHaveCount(5);for(const image of await images.all())await expect.poll(()=>image.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(1086);
  const metadata=await b.evaluate(async id=>{const r=await fetch(`/api/v1/game-rounds/${id}/partner-avatar`,{headers:{'X-DatingHigh-Client':'web'}});return r.json();},round);
  expect(metadata.avatarAssetId).toBe('female-08');expect(Object.keys(metadata.expressions)).toHaveLength(5);
  await b.screenshot({path:'.local/evidence/approved-full-body-partner-mobile.png'});
  await b.getByRole('button',{name:'收起聊天室',exact:true}).click();await expect(b.getByTestId('scene-foreground-art')).toHaveCount(0);
  await expect.poll(()=>b.getByTestId('scene-camera-entry-wide').evaluate(e=>{const parent=e.getBoundingClientRect(),background=e.querySelector('[data-testid="scene-background"]')!.getBoundingClientRect();return background.height>=parent.height-1&&background.width>=parent.width-1;})).toBe(true);
  await b.screenshot({path:'.local/evidence/approved-full-body-partner-mobile-wide.png'});
  await choose(b,'走近那張推薦卡');await expect(b.getByTestId('scene-camera-table-medium')).toBeVisible();
  const foreground=b.getByTestId('scene-foreground-art');await expect(foreground).toBeVisible();await foreground.locator('img').evaluate(e=>(e as HTMLImageElement).decode());
  for(const key of ['left','top','width','height'])expect(await foreground.evaluate((e,k)=>getComputedStyle(e).getPropertyValue(k),key)).toBe(await b.getByTestId('scene-background').evaluate((e,k)=>getComputedStyle(e).getPropertyValue(k),key));
  await b.screenshot({path:'.local/evidence/approved-full-body-partner-mobile-medium.png'});
  await page.goto('/start');await expect(page.getByTestId('scene-camera-table-medium')).toBeVisible();await expect(page.getByText('即時連線已同步',{exact:true})).toBeVisible();await expect.poll(()=>page.getByRole('img',{name:/的遊戲立繪$/}).evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBe(1086);await page.getByTestId('scene-foreground-art').locator('img').evaluate(e=>(e as HTMLImageElement).decode());await page.screenshot({path:'.local/evidence/approved-full-body-partner-desktop-medium.png'});
 }finally{await context.close();}
});
