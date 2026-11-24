import {test,expect,type Page,type APIRequestContext} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {startBackend,stopBackend,control,routeBackend,type Backend,avatarFixturePassword} from './backend';
let backend:Backend,management:APIRequestContext,serial=960000;
const results:unknown[]=[];
test.setTimeout(600000);
test.use({actionTimeout:30000});
const requestId=()=>`019a281e-0000-7000-8000-${String(++serial).padStart(12,'0')}`;
test.beforeAll(async({playwright})=>{management=await playwright.request.newContext();backend=await startBackend({DATINGHIGH_E2E_MATCHING_PROFILE:'1',DATINGHIGH_E2E_STORY_PROFILE:'1',DATINGHIGH_E2E_AVATAR_PROFILE:'1',DATINGHIGH_E2E_SCENE_FRAMEWORK:'3'});});
test.afterAll(async()=>{if(backend)await stopBackend(backend,management);await management?.dispose();mkdirSync('.local/evidence',{recursive:true});writeFileSync('.local/evidence/scene-v3-web.json',JSON.stringify({environment:'Chrome / isolated real HTTP, D1, R2 and Room DO',scope:'technical playback; no human Gate B or Android acceptance',results},null,2)+'\n');});
async function login(page:Page,n:number){
 await routeBackend(page,backend);await page.route('**/story-content/**',async route=>{const response=await route.fetch({url:backend.url+new URL(route.request().url()).pathname,timeout:60000});await route.fulfill({response});});
 await page.goto('/login');await page.getByLabel('Email',{exact:true}).fill(`matching-${n}@example.test`);await page.getByLabel('密碼',{exact:true}).fill(avatarFixturePassword);await page.getByRole('button',{name:'登入',exact:true}).click();await expect(page).toHaveURL(/\/matching$/);
}
const snapshot=(page:Page)=>page.evaluate(async()=>{const id=location.pathname.split('/').at(-1);return(await fetch(`/api/v1/game-rounds/${id}/experience`,{headers:{'X-DatingHigh-Client':'web'}})).json();});
async function action(page:Page,binding:string,option?:string){
 await page.bringToFront();
 const result=await page.evaluate(async({binding,option,clientRequestId})=>{
  const id=location.pathname.split('/').at(-1),headers={'Content-Type':'application/json','X-DatingHigh-Client':'web'};
  const s=await(await fetch(`/api/v1/game-rounds/${id}/experience`,{headers})).json(),e=s.availableEvents.find((e:any)=>e.bindingId.endsWith(':'+binding));
  const a=e?.actions.find((a:any)=>!option||Object.values(a.params).includes(option));if(!a)return{status:0,binding};
  const r=await fetch(`/api/v1/game-rounds/${id}/story/event`,{method:'POST',headers,body:JSON.stringify({clientRequestId,storySessionId:s.storySessionId,bindingId:e.bindingId,actionId:a.actionId,params:a.params,expectedTrackRevision:s.myTrack.revision,...(e.needsSharedRevision?{expectedSharedRevision:s.sharedRevision}:{}),...(e.revision==null?{}:{expectedEventRevision:e.revision})})});return{status:r.status,binding};
 },{binding,option,clientRequestId:requestId()});expect(result).toEqual({status:200,binding});
}
async function inspectClerk(page:Page){
 await page.bringToFront();await page.reload();const person=page.getByRole('button',{name:'場景人物：店員・NPC',exact:true});await expect(person).toBeEnabled({timeout:60000});
 const s=await snapshot(page),shot=s.stage.shots.find((v:any)=>v.id===s.stage.currentShotId),actor=shot.actors.find((v:any)=>v.actorId==='clerk'),npc=s.stage.npcs.find((v:any)=>v.id==='clerk');
 const mask=npc.hitMasks.find((v:any)=>v.pose===actor.pose&&v.expression===actor.expression).mask,region=npc.appearance.poses.find((v:any)=>v.id===actor.pose).frames[actor.expression],ratio=region.width/region.height/.75;
 const box=(await person.boundingBox())!,hud=(await page.getByTestId('story-narrative').boundingBox())!;const candidates:{x:number;y:number;score:number}[]=[];
 for(let y=0;y<mask.height;y++)for(let x=0;x<mask.width;x++)if((parseInt(mask.rows[y],16)>>>(mask.width-1-x))&1){const point={x:box.width*((1-ratio)/2+(x+.5)/mask.width*ratio),y:box.height*(y+.5)/mask.height};if(box.y+point.y>100&&box.y+point.y<hud.y-6)candidates.push({...point,score:Math.abs((x+.5)/mask.width-.5)+Math.abs((y+.5)/mask.height-.24)});}
 expect(candidates.length).toBeGreaterThan(0);const p=candidates.sort((a,b)=>a.score-b.score)[0];await person.click({position:{x:p.x,y:p.y}});expect((await snapshot(page)).myTrack.revision).toBe(s.myTrack.revision);
 await page.getByRole('button',{name:'問店員：我可以先看看書嗎？',exact:true}).click();await expect.poll(async()=>(await snapshot(page)).myTrack.nodeId).toBe('iv3-clerk');await expect(page.getByText('慢慢看，這裡的書都可以先讀一小段。想安靜待著也沒關係。',{exact:true})).toBeVisible();
}
for(const ending of [
 {wish:'keep-talking',id:'ev3-01-more-talk',title:'雨停之前，再聊一會',image:'more-talk'},
 {wish:'share-books',id:'ev3-02-book-recommendation',title:'留下一本書的名字',image:'book-recommendation'},
 {wish:'quiet-rest',id:'ev3-03-gentle-distance',title:'剛剛好的距離',image:'gentle'},
])test(`formal V3: physical original book, optional refusal, shared rescue and persistent ${ending.id} in the production Screen`,async({browser,request})=>{
 console.log('V3 Web: resetting isolated room');await control(backend,request,{op:'reset'});const {players}=await control(backend,request,{op:'matching-seed'});const a=await browser.newPage(),b=await browser.newPage(),errors:string[]=[];
 for(const p of [a,b])p.on('pageerror',e=>errors.push(e.name));
 for(const p of [a,b])await p.addInitScript(()=>{const Original=window.Audio;(window as any).__v3Audio=[];window.Audio=new Proxy(Original,{construct(target,args){const player=Reflect.construct(target,args,target)as HTMLAudioElement;(window as any).__v3Audio.push(player);return player;}});});
 const audio=()=>a.evaluate(()=>(window as any).__v3Audio.map((p:HTMLAudioElement)=>({paused:p.paused,time:p.currentTime,volume:p.volume,error:!!p.error})));
 try{
  await login(a,0);await login(b,1);console.log('V3 Web: both players logged in');
  const status=await a.evaluate(async({candidateId,clientRequestId})=>(await fetch('/api/v1/match-invitations',{method:'POST',headers:{'Content-Type':'application/json','X-DatingHigh-Client':'web'},body:JSON.stringify({candidateId,clientRequestId})})).status,{candidateId:players[1].candidateId,clientRequestId:requestId()});expect(status).toBe(201);
  await b.goto('/invitations');await b.getByRole('button',{name:'接受 測試旅人0',exact:true}).click();await expect(b).toHaveURL(/\/game-round\//,{timeout:60000});await a.goto(new URL(b.url()).pathname);console.log('V3 Web: accepted real invitation');await a.bringToFront();
  await expect(a.getByRole('button',{name:'前往入口',exact:true})).toBeEnabled({timeout:60000});expect((await audio()).every((p:any)=>p.paused)).toBe(true);
  await a.getByRole('button',{name:'開啟場景聲音',exact:true}).click();await expect.poll(async()=>(await audio()).filter((p:any)=>!p.paused&&p.time>0).length).toBe(2);
  await a.getByRole('button',{name:'前往入口',exact:true}).click();await expect.poll(async()=>(await snapshot(a)).myTrack.areaId).toBe('entrance');await expect.poll(async()=>(await audio()).filter((p:any)=>!p.paused&&p.volume>0).length).toBeGreaterThanOrEqual(2);expect((await audio()).some((p:any)=>p.error)).toBe(false);
  await a.getByRole('button',{name:'靜音場景聲音',exact:true}).click();await expect.poll(async()=>(await audio()).every((p:any)=>p.paused)).toBe(true);await action(a,'iv3-browse');await action(a,'iv3-book','growth');
  await action(a,'iv3-walk','counter');await inspectClerk(a);await action(a,'iv3-walk','shelves');
  await action(b,'av3-enter');await action(b,'av3-browse');await b.bringToFront();await b.reload();await expect(b.getByTestId('area-stage-shelves')).toBeVisible({timeout:60000});
  console.log('V3 Web: opening original book');const before=await snapshot(b);expect(new Set(before.books.map((b:any)=>b.id)).size).toBe(4);await b.getByLabel('場景物件：《週日的第二碗湯》',{exact:true}).click();await expect(b.getByTestId('scene-open-book')).toBeVisible();await b.getByRole('button',{name:'下一頁',exact:true}).click();
  expect((await snapshot(b)).myTrack.revision).toBe(before.myTrack.revision);mkdirSync('.local/evidence',{recursive:true});await b.screenshot({path:'.local/evidence/scene-v3-original-book.png',timeout:15000,animations:'disabled'});
  await b.getByRole('button',{name:'合上《週日的第二碗湯》',exact:true}).click();await expect(b.getByTestId('scene-open-book')).toHaveCount(0);
  await action(b,'av3-book','family');await action(b,'av3-resonance','family-neutral');await action(b,'av3-walk','reading-corner');await action(b,'av3-sit');await action(b,'av3-read');
  await action(a,'iv3-walk','reading-corner');await a.bringToFront();await a.reload();await expect(a.getByRole('button',{name:'留意閱讀角的旅人',exact:true})).toBeEnabled({timeout:60000});await a.getByRole('button',{name:'留意閱讀角的旅人',exact:true}).click();await expect.poll(async()=>(await snapshot(a)).myTrack.nodeId).toBe('iv3-04');await action(a,'iv3-pause');await action(a,'iv3-approach');await action(a,'iv3-greeting','tissue');await action(b,'av3-see-greeting');await b.reload();
  await expect(b.getByRole('button',{name:'收下面紙（聊天仍由我決定）',exact:true})).toBeEnabled({timeout:60000});await b.getByRole('button',{name:'收下面紙（聊天仍由我決定）',exact:true}).click();await expect.poll(async()=>(await snapshot(b)).world.objects.find((o:any)=>o.id==='tissue')?.state).toBe('accepted');await expect(b.getByTestId('embedded-tissue-accepted')).toBeVisible();
  await action(b,'av3-response','decline');await action(a,'iv3-understand','respect');
  let mediaRecovery=false;
  if(ending.wish==='quiet-rest'){
   const storage=(await snapshot(b)).assets.find((asset:any)=>asset.id==='bg-safe-storage');let failOnce=true;
   await b.route('**'+storage.url,async route=>{if(failOnce){failOnce=false;await route.abort('failed');}else await route.fallback();});
  }
  console.log('V3 Web: starting shared rain and rescue');await action(a,'sv3-weather');await action(b,'sv3-weather');for(const [p,prefix]of [[a,'iv3'],[b,'av3']]as const){await action(p,prefix+'-walk','shelves');await action(p,prefix+'-walk','safe-storage');
   if(prefix==='av3'&&ending.wish==='quiet-rest'){
    await expect(b.getByText(/場景圖片載入失敗/)).toBeVisible({timeout:60000});const beforeReload=await snapshot(b);await b.getByRole('button',{name:'重新載入場景素材',exact:true}).click();await expect(b.getByRole('button',{name:'沿乾燥動線到收納區',exact:true})).toBeEnabled({timeout:60000});const restored=await snapshot(b);expect(restored.myTrack.revision).toBe(beforeReload.myTrack.revision);expect(restored.sharedRevision).toBe(beforeReload.sharedRevision);mediaRecovery=true;
   }
   await action(p,prefix+'-safety');}
  await action(a,'sv3-help');await action(b,'sv3-help');await action(b,'av3-list');expect((await snapshot(a)).knownClues.some((c:any)=>c.id==='private-list')).toBe(false);await action(b,'av3-share-list');await action(a,'iv3-walk','shelves');await action(a,'iv3-find','try-love');expect((await snapshot(a)).myTrack.nodeId).toBe('iv3-recheck');await action(a,'iv3-find','compare');await action(a,'iv3-pick');await action(a,'iv3-walk','safe-storage');await action(a,'iv3-box');await action(b,'av3-check');await action(b,'av3-pick-box');await action(b,'av3-store');
  for(const [p,prefix]of [[a,'iv3'],[b,'av3']]as const){await action(p,prefix+'-walk','counter');await action(p,prefix+'-walk','window');await action(p,prefix+'-coffee');await action(p,prefix+'-recommend','family');}
  console.log('V3 Web: submitting independent final wishes');await action(a,'sv3-final-wish','keep-talking');expect((await snapshot(b)).chapterStatus).toBe('playing');await b.bringToFront();await b.getByRole('button',{name:ending.wish==='keep-talking'?'想再聊聊':ending.wish==='share-books'?'聊書就好':'想獨處，安靜休息',exact:true}).click();await expect(b.getByText(ending.title,{exact:true})).toBeVisible({timeout:60000});
  const end=await snapshot(b);expect(end.endingId).toBe(ending.id);expect(end.stage.currentShotId).toBe('sh-'+ending.id);await expect(b.getByTestId('area-stage-window')).toBeVisible({timeout:60000});await expect(b.getByTestId('scene-weather-easing')).toBeVisible();
  const stageBox=(await b.getByTestId('area-stage-window').boundingBox())!;for(const actor of await b.locator('[data-testid^="actor-identity-"]').all()){const box=(await actor.boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(stageBox.y-1);expect(box.y+box.height).toBeLessThanOrEqual(stageBox.y+stageBox.height+1);}
  await b.screenshot({path:`.local/evidence/scene-v3-${ending.image}-ending.png`,timeout:15000,animations:'disabled'});
  const book=b.getByLabel('場景物件：推薦《週日的第二碗湯》',{exact:true}).last();await book.click();await expect(b.getByTestId('scene-open-book')).toBeVisible();await b.getByRole('button',{name:'下一頁',exact:true}).click();await b.getByRole('button',{name:'合上《週日的第二碗湯》',exact:true}).click();expect((await snapshot(b)).myTrack.revision).toBe(end.myTrack.revision);
  expect(errors).toEqual([]);results.push({endingId:end.endingId,bookPreviewChangedAuthority:false,originalAudioPlayed:true,tissueAcceptanceDidNotAcceptConversation:true,explicitMediaReloadPreservedAuthority:mediaRecovery,errors});
 }catch(error){mkdirSync('.local/evidence',{recursive:true});for(const [p,id]of [[a,'inviter'],[b,'acceptor']]as const)if(new URL(p.url()).pathname.startsWith('/game-round/')){await p.screenshot({path:`.local/evidence/scene-v3-failure-${id}.png`,timeout:15000,animations:'disabled'});writeFileSync(`.local/evidence/scene-v3-failure-${id}.txt`,(await p.locator('body').innerText()).slice(0,6000));}throw error;}finally{await a.close();await b.close();}
});
