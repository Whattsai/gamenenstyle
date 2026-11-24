import {test,expect,type Page,type APIRequestContext} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {startBackend,stopBackend,control,routeBackend,type Backend,avatarFixturePassword} from './backend';
let backend:Backend,management:APIRequestContext;
test.setTimeout(240000);
test.beforeAll(async({playwright})=>{management=await playwright.request.newContext();backend=await startBackend({DATINGHIGH_E2E_MATCHING_PROFILE:'1',DATINGHIGH_E2E_STORY_PROFILE:'1',DATINGHIGH_E2E_AVATAR_PROFILE:'1',DATINGHIGH_E2E_SCENE_FRAMEWORK:'2'});});
test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();});
async function login(page:Page,n:number){
 await routeBackend(page,backend);
 await page.route('**/story-content/**',async route=>{const response=await route.fetch({url:backend.url+new URL(route.request().url()).pathname});await route.fulfill({response});});
 await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill(`matching-${n}@example.test`);await page.getByLabel('密碼',{exact:true}).fill(avatarFixturePassword);await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).toHaveURL(/\/matching$/);
}
test('static package: real authorized PNG reads decode in the production Screen and feed the reusable Stage',async({browser,request})=>{
 await control(backend,request,{op:'reset'});const {players}=await control(backend,request,{op:'matching-seed'});
 const a=await browser.newPage(),b=await browser.newPage(),errors:string[]=[],providerCalls:string[]=[];
 b.on('pageerror',error=>errors.push(error.name));b.on('request',r=>{if(/gemini|generations|expressions\/next/.test(r.url()))providerCalls.push('unexpected-generation');});
 try{
  await login(a,0);await login(b,1);
  // 只有舞台配置是 fixture；登入、配對、API／媒體、D1、R2、DO 及正式 Screen 都使用實作。
  await b.route('**/api/v1/game-rounds/*/experience',async route=>{
   const response=await route.fetch({url:backend.url+new URL(route.request().url()).pathname});const s=await response.json();
   if(s.myTrack){const areaId=s.myTrack.areaId;s.stage={version:'scene-stage.v1',currentShotId:'static-boundary-fixture',shots:[{id:'static-boundary-fixture',areaId,cameraId:s.scenePresentation.cameras[0].id,actors:[{actorId:s.myTrack.role,pose:'read',expression:'smile',gesture:'idle',position:{x:.5,y:.9},height:.85,depth:3}],audioCueIds:[]}],areaVisuals:[{areaId,backgroundAsset:s.backgroundAsset,defaultShotId:'static-boundary-fixture',layers:[]}],embeddedInteractables:[],npcs:[]};}
   await route.fulfill({response,json:s});
  });
  const invited=await a.evaluate(async candidateId=>{const r=await fetch('/api/v1/match-invitations',{method:'POST',headers:{'Content-Type':'application/json','X-DatingHigh-Client':'web'},body:JSON.stringify({candidateId,clientRequestId:'019a281e-0000-7000-8000-000000980001'})});return r.status;},players[1].candidateId);
  expect(invited).toBe(201);await b.goto('/invitations');await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b).toHaveURL(/\/game-round\//,{timeout:30000});
  await expect(b.getByText('即時連線已同步',{exact:true})).toBeVisible({timeout:60000});
  const projections=await b.evaluate(async()=>{const id=location.pathname.split('/').at(-1);return Promise.all(['my-avatar','partner-avatar'].map(async channel=>(await fetch(`/api/v1/game-rounds/${id}/${channel}`,{headers:{'X-DatingHigh-Client':'web'}})).json()));});
  const total=projections.reduce((n,p)=>n+p.staticPosePackage.assets.length,0);
  for(const p of projections)for(const image of p.staticPosePackage.assets){
   const read=await b.evaluate(async url=>{const r=await fetch(url,{headers:{'X-DatingHigh-Client':'web'}});return {status:r.status,mime:r.headers.get('Content-Type'),bytes:(await r.arrayBuffer()).byteLength};},image.url);
   expect(read).toEqual({status:200,mime:'image/png',bytes:image.byteSize});
  }
  await expect(b.getByTestId(/^static-preload-/)).toHaveCount(total);
  await expect.poll(()=>b.getByTestId(/^static-preload-/).locator('img').evaluateAll(images=>images.length>0&&images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)),{timeout:60000}).toBe(true);
  const identity=projections[0].staticPosePackage.packageVersion;
  await expect(b.getByTestId(`actor-identity-${identity}`)).toBeVisible();
  await expect.poll(()=>b.getByTestId('actor-layer-body').locator('img').evaluate(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)).toBe(true);
  expect(errors).toEqual([]);expect(providerCalls).toEqual([]);
  await b.screenshot({path:'.local/evidence/static-avatar-authorized-stage.png'});
  await b.unroute('**/api/v1/game-rounds/*/experience');await b.reload();await a.goto('/start');await expect(a).toHaveURL(/\/game-round\//);
  const action=async(page:Page,label:string)=>{await page.bringToFront();const button=page.getByRole('button',{name:label,exact:true});await expect(button).toBeEnabled({timeout:60000});await button.click();await expect(button).toHaveCount(0,{timeout:60000});};
  for(const label of ['看看書架邊的布袋','檢查袋外的編號','拿起第 27 號布袋','前往櫃檯','把布袋放在櫃檯'])await action(b,label);
  for(const label of ['查看門口的取書單','翻看取書單背面','拿起取書單','前往櫃檯','把紙單放在櫃檯'])await action(a,label);
  await b.bringToFront();
  for(const role of ['scene-own-avatar','scene-partner']){
   await expect(b.getByTestId(role).getByTestId('static-story-portrait')).toBeVisible({timeout:30000});
   await expect.poll(()=>b.getByTestId(role).locator('img').evaluateAll(images=>images.length===1&&images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  }
  expect(providerCalls).toEqual([]);await b.screenshot({path:'.local/evidence/static-avatar-published-v2.png'});
  mkdirSync('.local/evidence',{recursive:true});writeFileSync('.local/evidence/static-avatar-web.json',JSON.stringify({executedAt:new Date().toISOString(),status:'passed',scope:'Chrome production Screen, fixture V3 Stage boundary plus real published V2 two-player counter; real D1/R2/DO/API and static media; not full V3 or user Gate B',decodedSheets:total,visibleIdentity:identity,publishedV2StaticActors:2,providerCalls:0},null,2));
 }finally{await a.close();await b.close();}
});
