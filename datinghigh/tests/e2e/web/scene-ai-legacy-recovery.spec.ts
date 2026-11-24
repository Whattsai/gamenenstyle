import {test,expect,type Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {startBackend,stopBackend,control,routeBackend,avatarFixturePassword} from './backend';
test.setTimeout(360000);
test('saved legacy AI: recover the exact V3 reading scene through four poses and explicit review without replacing the character or session',async({browser,request})=>{
 const backend=await startBackend({DATINGHIGH_E2E_MATCHING_PROFILE:'1',DATINGHIGH_E2E_STORY_PROFILE:'1',DATINGHIGH_E2E_AVATAR_PROFILE:'1',DATINGHIGH_E2E_SCENE_FRAMEWORK:'3'}),a=await browser.newPage(),b=await browser.newPage();let serial=981000;
 const headers={'Content-Type':'application/json','X-DatingHigh-Client':'web'},nextId=()=>`019a281e-0000-7000-8000-${String(++serial).padStart(12,'0')}`;
 const api=(page:Page,path:string,method='GET',body?:unknown)=>page.evaluate(async({path,method,body,headers})=>{const r=await fetch('/api/v1'+path,{method,headers,...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:await r.json()};},{path,method,body,headers});
 let roundPath='';const snapshot=(page:Page)=>api(page,roundPath+'/experience').then(r=>r.body);
 const action=async(page:Page,binding:string,option?:string)=>{const s=await snapshot(page),e=s.availableEvents.find((e:any)=>e.bindingId.endsWith(':'+binding)),v=e?.actions.find((v:any)=>!option||Object.values(v.params).includes(option));expect(v).toBeTruthy();expect((await api(page,roundPath+'/story/event','POST',{storySessionId:s.storySessionId,bindingId:e.bindingId,actionId:v.actionId,params:v.params,clientRequestId:nextId(),expectedTrackRevision:s.myTrack.revision,...(e.needsSharedRevision?{expectedSharedRevision:s.sharedRevision}:{}),...(e.revision==null?{}:{expectedEventRevision:e.revision})})).status).toBe(200);};
 const pack=async(page:Page,asset:string)=>(await api(page,`/me/avatar/assets/${asset}/expressions`)).body;
 const upgraded:string[]=[];
 async function upgrade(page:Page){
  const before=(await api(page,'/me/dating-profile')).body,old=await pack(page,before.selectedAvatarRef),steps:string[]=[];
  expect(old.staticPosePackage).toBeUndefined();await page.bringToFront();page.on('response',async r=>{if(new URL(r.url()).pathname.endsWith('/avatar/expressions/review')){const v=await r.json().catch(()=>({}));console.log(JSON.stringify({legacyReview:{http:r.status(),code:v.code,state:v.status,savedSource:v.savedSource}}));}});
  await page.getByRole('button',{name:'補齊目前角色的姿態',exact:true}).click();await expect(page).toHaveURL(/\/profile\?completeAvatarPoses=1/);
  const start=page.getByRole('button',{name:'補齊目前角色的姿態',exact:true});await expect(start).toBeVisible();
  page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/avatar/expressions/next'))steps.push(r.postDataJSON().expression);});
  await start.click();await expect(page.getByTestId('avatar-static-review')).toBeVisible({timeout:120000});
  expect(steps).toEqual(['pose-stand','pose-sit','pose-read','pose-hold']);
  const pending=(await api(page,'/me/dating-profile')).body;expect(pending.selectedAvatarRef).toBe(before.selectedAvatarRef);expect(pending.revision).toBe(before.revision);expect((await pack(page,before.selectedAvatarRef)).staticPosePackage).toBeUndefined();
  await expect(page.getByRole('button',{name:'確認採用完整靜態化身',exact:true})).toBeEnabled({timeout:60000});await page.getByRole('button',{name:'確認採用完整靜態化身',exact:true}).click();
  await expect(page.getByText('已採用完整靜態化身',{exact:true})).toBeVisible({timeout:60000});const after=(await api(page,'/me/dating-profile')).body,ready=await pack(page,after.selectedAvatarRef);
  expect(after.selectedAvatarRef).toBe(before.selectedAvatarRef);expect(after.generatedAvatars).toHaveLength(before.generatedAvatars.length);expect(ready.expressions).toEqual(old.expressions);expect(ready.staticPosePackage.poses).toHaveLength(4);upgraded.push(ready.staticPosePackage.packageVersion);
 }
 try{
  await control(backend,request,{op:'reset'});const {players}=await control(backend,request,{op:'matching-seed'});
  for(const [page,n]of [[a,0],[b,1]] as const){await routeBackend(page,backend);await page.route('**/story-content/**',async route=>{const r=await route.fetch({url:backend.url+new URL(route.request().url()).pathname,timeout:60000});await route.fulfill({response:r});});await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill(`matching-${n}@example.test`);await page.getByLabel('密碼',{exact:true}).fill(avatarFixturePassword);await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).toHaveURL(/\/matching$/);await control(backend,request,{op:'story-avatar-pack',player:n});}
  console.log('Legacy AI: seeded both saved five-expression characters');expect((await api(a,'/match-invitations','POST',{candidateId:players[1].candidateId,clientRequestId:nextId()})).status).toBe(201);
  await b.goto('/invitations');await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b).toHaveURL(/\/game-round\//,{timeout:60000});roundPath='/game-rounds/'+new URL(b.url()).pathname.split('/').at(-1);const screenPath=new URL(b.url()).pathname;await a.goto(screenPath);
  for(const [binding,option]of [['av3-enter'],['av3-browse'],['av3-book','family'],['av3-resonance','family-neutral'],['av3-walk','reading-corner'],['av3-sit']])await action(b,binding!,option);
  await b.bringToFront();await b.reload();await expect(b.getByText(/你的 AI 角色尚未具備四種姿態/)).toBeVisible({timeout:60000});const stuck=await snapshot(b);expect(stuck.currentNode.lines[0].text).toContain('你在角落坐下。讀到某一句話');
  console.log('Legacy AI: exact reading node blocked with actionable pose prompt');await upgrade(b);console.log('Legacy AI: A explicitly reviewed four new poses');await b.goto(screenPath);await expect(b.getByTestId('area-stage-reading-corner')).toBeVisible({timeout:60000});const restored=await snapshot(b);expect(restored.storySessionId).toBe(stuck.storySessionId);expect(restored.myTrack.revision).toBe(stuck.myTrack.revision);expect(restored.sharedRevision).toBe(stuck.sharedRevision);
  const read=b.getByRole('button',{name:'把這一頁讀完',exact:true});await expect(read).toBeEnabled();await read.click();await expect.poll(async()=>(await snapshot(b)).myTrack.nodeId).toBe('av3-06');
  for(const [binding,option]of [['iv3-enter'],['iv3-browse'],['iv3-book','growth'],['iv3-walk','reading-corner']])await action(a,binding!,option);
  await a.bringToFront();await a.reload();await expect(a.getByText(/你的 AI 角色尚未具備四種姿態/)).toBeVisible({timeout:60000});await upgrade(a);await b.bringToFront();await b.reload();await expect(b.getByTestId('area-stage-reading-corner')).toBeVisible({timeout:60000});
  mkdirSync('.local/evidence',{recursive:true});await b.screenshot({path:'.local/evidence/legacy-ai-v3-recovered.png',animations:'disabled'});writeFileSync('.local/evidence/legacy-ai-v3-recovery.json',JSON.stringify({status:'passed',executedAt:new Date().toISOString(),scope:'Chrome A and I legacy private AI, real .NET/D1/R2 and controlled virtual-image provider; not real Gemini identity quality or user Gate B',upgradedCharacters:upgraded.length,poseCallsPerCharacter:4,legacyFiveImagesPreserved:true,selectionPreserved:true,storySessionPreserved:true,progressChangedOnlyByExplicitRead:true},null,2)+'\n');
 }catch(error){for(const page of [a,b])if(new URL(page.url()).pathname.startsWith('/profile'))console.log(JSON.stringify({legacyVisibleMessages:(await page.locator('body').innerText()).split('\n').filter(v=>/服務|來源|更新|製作|採用|姿態|失敗/.test(v)).slice(-20)}));throw error;}finally{await a.close();await b.close();await stopBackend(backend,request);}
});
