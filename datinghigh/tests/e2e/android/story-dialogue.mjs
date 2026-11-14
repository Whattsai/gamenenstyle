import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn,spawnSync} from 'node:child_process';
import {chromium,request as apiRequest} from '@playwright/test';
import {createFixture,deepLink,waitText,waitAny} from './fixture.mjs';
import {invoke,nodes,visible,tap,fill,reopen,memorySample} from './support.mjs';
import {routeBackend} from '../web/backend.ts';

assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Explicit QA device is required');
assert.equal(invoke('shell','getprop','ro.boot.qemu.avd_name').trim(),'DatingHighQA31');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const memorySamples=[];
const sceneFramework=process.env.DATINGHIGH_E2E_SCENE_FRAMEWORK==='1';
const approvedArt=process.env.DATINGHIGH_STORY_NATIVE_ART==='approved';
const recordedGemini=process.env.DATINGHIGH_STORY_NATIVE_ART==='approved-gemini';
if(process.env.DATINGHIGH_STORY_NATIVE_ART)assert.ok(['approved','approved-gemini'].includes(process.env.DATINGHIGH_STORY_NATIVE_ART));
if(recordedGemini)assert.ok(process.env.DATINGHIGH_E2E_STORY_APPROVED_PACK,'Explicit approved generated pack required');
function captureFrame(name){if(sceneFramework)name='scene-framework-'+name;const adb=process.env.LOCALAPPDATA+'/Android/Sdk/platform-tools/adb.exe',result=spawnSync(adb,['-P',process.env.DATINGHIGH_ADB_PORT,'-s',process.env.DATINGHIGH_ANDROID_DEVICE,'exec-out','screencap','-p'],{windowsHide:true,encoding:null,maxBuffer:8*1024*1024,timeout:45000});assert.equal(result.status,0);fs.writeFileSync(`.local/evidence/${name}.png`,result.stdout);}
function keyboardTop(all){const root=all[0]?.bounds?.match(/-?\d+/g)?.map(Number);if(!root||root.length!==4)return null;const state=invoke('shell','dumpsys','input_method');if(!/mInputShown=true/.test(state))return null;const windows=invoke('shell','dumpsys','window'),imeLine=windows.split(/\r?\n/).find(line=>line.includes('ITYPE_IME')&&line.includes('mInsetsHint=Insets')),inset=imeLine?.match(/bottom=(\d+)/),size=invoke('shell','wm','size').match(/(\d+)x(\d+)/);if(!inset||!size)return null;return Number(size[2])-Number(inset[1]);}
async function focusNativeInput(label){for(let i=0;i<12;i++){const input=nodes().find(n=>n.class==='android.widget.EditText'&&n['content-desc']===label&&visible(n));if(input){const[l,t,r,b]=input.bounds.match(/-?\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round((t+b)/2)));await sleep(700);return;}await sleep(250);}throw Object.assign(new Error('Native text input is unreachable'),{control:label});}
async function reveal(label,direction='down'){
 for(let i=0;i<18;i++){
  if(i===8)direction=direction==='down'?'up':'down';
  const all=nodes();if(all.some(n=>visible(n)&&(n.text===label||n['content-desc']===label)))return;
  const scrolls=all.filter(n=>n.scrollable==='true'&&visible(n)),box=/reply|Message committed|chapter complete/.test(label)?scrolls.at(-1):scrolls[0];assert.ok(box,'Story owns a native scroll container');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),hi=String(Math.round(t+(b-t)*.23)),lo=String(Math.round(t+(b-t)*.78));
  invoke('shell','input','swipe',x,direction==='down'?lo:hi,x,direction==='down'?hi:lo,'400');await sleep(250);
 }throw Object.assign(new Error('Story native control is unreachable'),{control:label});
}
let staticServer;try{const r=await fetch('http://localhost:8081');assert.ok((await r.text()).includes('心動迴路'),'Existing Web host belongs to DatingHigh');}catch(error){if(error.cause?.code!=='ECONNREFUSED')throw error;staticServer=spawn(process.execPath,['tools/serve-web.mjs'],{windowsHide:true,stdio:'ignore'});}
const fixture=await createFixture({matchingProfile:true,storyProfile:true,avatarProfile:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const checks=[];checks.push=(...items)=>{console.log(items.join(', '));return Array.prototype.push.apply(checks,items);};let succeeded=false;
let serial=900000;const id=()=>`019a281e-0000-7000-8000-${String(++serial).padStart(12,'0')}`;
async function post(page,path,body){return page.evaluate(async({path,body})=>{const r=await fetch('/api/v1'+path,{method:'POST',headers:{'Content-Type':'application/json','X-DatingHigh-Client':'web'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};},{path,body});}
async function choose(page,label){
 const skip=page.getByRole('button',{name:'略過本段演出',exact:true});if(await skip.count())await skip.click();const reveal=page.getByRole('button',{name:'顯示完整句',exact:true});if(await reveal.count())await reveal.click();
 await page.getByRole('button',{name:label,exact:true}).click();await page.getByRole('button',{name:label,exact:true}).waitFor({state:'detached'});
}
try{
 const branches=process.env.DATINGHIGH_STORY_NATIVE_BRANCH?[process.env.DATINGHIGH_STORY_NATIVE_BRANCH]:['together','different'];
 for(const branch of branches){
  assert.ok(['together','different'].includes(branch));console.log(`Native story: ${branch}`);await fixture.reset();const seeded=await fixture.send({op:'matching-seed'});if(!approvedArt)for(const player of recordedGemini?[1]:[0,1])await fixture.send({op:'story-avatar-pack',player});
  const context=await browser.newContext({viewport:{width:1200,height:900},recordVideo:undefined});const page=await context.newPage();
  await routeBackend(page,fixture.backend);await page.route('**/story-content/**',async route=>{const response=await route.fetch({url:fixture.backend.url+new URL(route.request().url()).pathname});await route.fulfill({response});});
  await page.goto('http://localhost:8081/login');await page.getByLabel('Email',{exact:true}).filter({visible:true}).fill('matching-1@example.test');await page.getByLabel('密碼',{exact:true}).filter({visible:true}).fill('A real D1 integration password');await page.getByRole('button',{name:'登入',exact:true}).click();await page.waitForURL(/\/matching$/);
  await reopen(8084,{hideDevTools:true});await sleep(2500);await deepLink('login');const landing=await waitAny(['使用 Email 登入','歡迎回來']);if(landing==='使用 Email 登入')await tap('使用 Email 登入');await waitText('歡迎回來');await fill('Email','matching-0@example.test');await fill('密碼','A real D1 integration password');await tap('登入');await waitText('探索心動');
  assert.equal((await post(page,'/match-invitations',{candidateId:seeded.players[0].candidateId,clientRequestId:id()})).status,201);
  await deepLink('invitations');await reveal('接受 測試旅人1');await tap('接受 測試旅人1');await waitText('雨聲書店');await waitText('即時連線已同步');
  await page.goto('http://localhost:8081/start');await page.waitForURL(/\/game-round\//);await page.getByText('即時連線已同步',{exact:true}).waitFor();const round=new URL(page.url()).pathname.split('/').at(-1);
  const all=nodes();assert.equal(all.filter(n=>/的遊戲立繪$/.test(n['content-desc']??'')).length,1);assert.ok(!all.some(n=>n.text==='選擇今晚的故事'));checks.push(`${branch}:native-n1-one-authorized-fixture-portrait`);
  if(sceneFramework){
   await fixture.send({op:'story-avatar-readiness',player:0,ready:false});invoke('shell','input','keyevent','3');await sleep(700);await deepLink('game-round/'+round);await waitText('化身表情尚未就緒');
   const blocked=nodes();assert.ok(!blocked.some(n=>n['content-desc']==='你的訊息'||/的遊戲立繪$/.test(n['content-desc']??'')));captureFrame(`story-native-${branch}-own-avatar-blocked`);
   await tap('前往個人檔案');await fixture.send({op:'story-avatar-readiness',player:0,ready:true});await deepLink('game-round/'+round);await waitText('雨聲書店');await waitText('即時連線已同步');checks.push(`${branch}:native-own-current-avatar-readiness-block-and-profile-return`);
  }
  if(approvedArt){const pack=await page.evaluate(async round=>{const r=await fetch(`/api/v1/game-rounds/${round}/partner-avatar`,{headers:{'X-DatingHigh-Client':'web'}});return r.json();},round);assert.equal(pack.avatarAssetId,'male-01');assert.equal(Object.keys(pack.expressions).length,5);for(const value of Object.values(pack.expressions))assert.equal(value.width,1086);await sleep(1500);captureFrame(`story-native-approved-${branch}-entry`);checks.push(`${branch}:approved-builtin-pack-and-native-entry`);}
  if(recordedGemini){
   const pack=await page.evaluate(async()=>{const h={'X-DatingHigh-Client':'web'},profile=await(await fetch('/api/v1/me/dating-profile',{headers:h})).json();return(await fetch(`/api/v1/me/avatar/assets/${profile.selectedAvatarRef}/expressions`,{headers:h})).json();});
   assert.equal(Object.keys(pack.expressions).length,5);for(const image of Object.values(pack.expressions)){assert.equal(image.width,896);assert.ok(image.byteSize>200000);}
   let loaded=false;for(let n=0;n<30;n++){const requests=await fixture.send({op:'request-stats'});loaded=['neutral','smile','surprised','thoughtful','concerned'].every(e=>requests.some(r=>r.path===`/api/v1/game-rounds/${round}/partner-avatar/${pack.avatarVersion}/${e}`&&r.status===200));if(loaded)break;await sleep(500);}assert.ok(loaded,'Native fetched all five authorized lossless generated expressions');await sleep(1500);captureFrame(`story-native-approved-gemini-${branch}-entry`);checks.push(`${branch}:approved-gemini-lossless-pack-and-native-entry`);
  }
  memorySamples.push(memorySample(`${branch}:entry`));await tap('關閉場景微動');await waitText('開啟場景微動');await waitText('雨聲書店');await tap('開啟場景微動');checks.push(`${branch}:native-motion-fallback-preserves-scene`);
  await tap('結束本輪互動');await waitText('確定結束本輪互動？',15000);await tap('繼續這段相遇');checks.push(`${branch}:native-initial-cancel-exit`);
  await reveal('開啟場景聲音','up');await tap('開啟場景聲音');await waitText('靜音場景聲音');await tap('提高音量');await waitText('40%');await tap('靜音場景聲音');checks.push(`${branch}:native-audio-gesture-volume-and-mute`);
  await tap('展開聊天室');captureFrame('story-native-before-keyboard');await focusNativeInput('你的訊息');let keyboard=null;for(let n=0;n<40;n++){const all=nodes(),top=keyboardTop(all);if(top!==null){keyboard={all,top};break;}await sleep(250);}assert.ok(keyboard,'Android IME is visible with native chat focused');
  const belowIme=label=>keyboard.all.find(n=>(n.text===label||n['content-desc']===label)&&visible(n)&&Number(n.bounds.match(/\d+/g)?.[3])<=keyboard.top);
  const portrait=keyboard.all.find(n=>/的遊戲立繪$/.test(n['content-desc']??'')&&visible(n)),input=keyboard.all.find(n=>n['content-desc']==='你的訊息'&&visible(n));
  assert.ok(portrait&&Number(portrait.bounds.match(/\d+/g)?.[3])<=keyboard.top,'Story character stays above the open IME');assert.ok(input&&Number(input.bounds.match(/\d+/g)?.[3])<=keyboard.top,'Chat input stays above the open IME');assert.ok(belowIme('結束本輪互動'),'Story exit remains reachable above the IME');assert.ok(belowIme('傳送訊息'),'Chat send remains reachable above the IME');captureFrame('story-native-keyboard-open');memorySamples.push(memorySample(`${branch}:keyboard-open`));checks.push(`${branch}:native-ime-keeps-portrait-input-send-and-exit-visible`);invoke('shell','input','keyevent','111');await sleep(500);
  await reveal('溫暖型');await tap('溫暖型');await page.getByText('我喜歡有人認真推薦一本書的感覺，你呢？',{exact:true}).waitFor();
  await page.getByLabel('你的訊息').fill('A real Web reply for Android');await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await reveal('A real Web reply for Android');await waitText('A real Web reply for Android');checks.push(`${branch}:native-web-bidirectional-messages`);
  const datingAdb=process.env.LOCALAPPDATA+'/Android/Sdk/platform-tools/adb.exe';const capture=spawnSync(datingAdb,['-P',process.env.DATINGHIGH_ADB_PORT,'-s',process.env.DATINGHIGH_ANDROID_DEVICE,'exec-out','screencap','-p'],{windowsHide:true,encoding:null,maxBuffer:8*1024*1024,timeout:45000});if(capture.status===0)fs.writeFileSync('.local/evidence/'+(sceneFramework?'scene-framework-':'')+'story-native-technical-chat.png',capture.stdout);
  await reveal('翻看手寫書籤','up');await tap('翻看手寫書籤');await reveal('翻到書籤背面');await tap('翻到書籤背面');await waitText('你的探索');checks.push(`${branch}:native-personal-inspection`);
  invoke('shell','input','keyevent','3');await page.getByLabel('你的訊息').fill('Message committed while Android was in background');await page.getByRole('button',{name:'傳送訊息',exact:true}).click();await page.getByText('Message committed while Android was in background',{exact:true}).first().waitFor();await deepLink('game-round/'+round);await reveal('即時連線已同步','up');await waitText('即時連線已同步');await reveal('Message committed while Android was in background');await waitText('Message committed while Android was in background');checks.push(`${branch}:native-foreground-cursor-recovery`);
  await choose(page,'走近那張推薦卡');await choose(page,'一起看看書架');await choose(page,branch==='together'?'追尋書籤的提示':'留在桌邊，繼續聊天');if(branch==='together')await choose(page,'把便條放回，帶著心意回桌邊');await choose(page,'為今晚選一個閱讀方向');
  await page.getByRole('button',{name:'溫暖的日常',exact:true}).click();await page.getByText(/等待另一方選擇；可以返回探索或聊天/).waitFor();
  if(sceneFramework)await waitText('對方已提交，等待你的選擇。');
  if(sceneFramework)await fixture.send({op:'story-command-delay',milliseconds:10000});
  await reveal(branch==='together'?'溫暖的日常':'未知的冒險','up');await tap(branch==='together'?'溫暖的日常':'未知的冒險');
  if(sceneFramework){await waitText('送出中，尚未確認。');const sending=nodes();assert.ok(sending.some(n=>(n.text==='溫暖的日常'||n.text==='未知的冒險'||n['content-desc']==='溫暖的日常'||n['content-desc']==='未知的冒險')&&n.enabled==='false'),'Native choices stay disabled before a real commit');await fixture.send({op:'story-command-delay',milliseconds:0});checks.push(branch+':native-cooperative-unconfirmed-sending-and-disabled-choices');}
  const ending=branch==='together'?'同一頁的微光':'並肩的兩頁';await page.getByText(ending,{exact:true}).waitFor();await reveal(ending,'up');await waitText(ending);checks.push(`${branch}:native-real-cooperative-ending`);
  if(approvedArt)captureFrame(`story-native-approved-${branch}-ending`);
  if(recordedGemini)captureFrame(`story-native-approved-gemini-${branch}-ending`);memorySamples.push(memorySample(`${branch}:ending`));
  await reveal('你的訊息');await fill('你的訊息','Android chapter complete, chat stays open',false);await reveal('傳送訊息');await tap('傳送訊息');await page.getByText('Android chapter complete, chat stays open',{exact:true}).waitFor();
  assert.ok(!nodes().some(n=>/開始第二場|下一個獨立劇本/.test(n.text??n['content-desc']??'')));checks.push(`${branch}:native-completed-chat-no-second-episode`);
  if(sceneFramework){
   await reveal('你的訊息');const draft='Native draft across episodes';await fill('你的訊息',draft,false);
   await reveal('一起開始下一場','up');await tap('一起開始下一場');await waitText('撤回下一場同意');
   assert.equal((await fixture.send({op:'scene-state'})).sessions.length,1);
   await tap('撤回下一場同意');await waitText('一起開始下一場');await tap('一起開始下一場');await waitText('撤回下一場同意');
   const began=Date.now();await page.getByRole('button',{name:'一起開始下一場',exact:true}).click();await waitText('雨聲落在書頁上');await page.getByText('雨聲落在書頁上',{exact:true}).waitFor();
   const state=await fixture.send({op:'scene-state'});assert.deepEqual(state.sessions.map(s=>[s.episode_seq,s.chapter_status]),[[1,'completed'],[2,'playing']]);assert.equal(state.visits.length,2);
   await reveal('你的訊息');assert.ok(nodes().some(n=>n.class==='android.widget.EditText'&&n['content-desc']==='你的訊息'&&n.text===draft),'Same round preserves the native chat draft');
   await page.getByText('Android chapter complete, chat stays open',{exact:true}).waitFor();checks.push(branch+':native-next-consent-withdrawal-one-new-episode-draft-and-chat');memorySamples.push({...memorySample(branch+':episode-two'),synchronizationAndAutomationWaitMs:Date.now()-began});captureFrame('second-episode-native');
  }
  await reveal('結束本輪互動','up');await sleep(1500);await tap('結束本輪互動');await waitText('確定結束本輪互動？');await waitText('繼續這段相遇');await tap('繼續這段相遇');assert.equal((await fixture.send({op:'matching-state'})).rounds[0].status,'active');checks.push(`${branch}:native-cancel-exit-no-write`);
  await page.getByRole('button',{name:'結束本輪互動',exact:true}).click();await page.getByRole('button',{name:'確認結束',exact:true}).click();await page.getByText('本輪互動已結束',{exact:true}).waitFor();await waitText('本輪互動已結束');assert.ok(!nodes().some(n=>n['content-desc']==='你的訊息'));checks.push(`${branch}:web-end-clears-native-private-ui`);
  await deepLink('game-round/'+round);await waitText('本輪互動已結束');const state=await fixture.send({op:'matching-state'});assert.equal(state.participants.length,0);checks.push(`${branch}:ended-native-reopen-denies-private-history`);
  await context.close();
 }
 succeeded=true;
}catch(error){const ui=nodes();captureFrame('story-native-failure');console.error(JSON.stringify({status:'failed',control:error.control,reason:error.name,ui:error.ui,packages:[...new Set(ui.map(n=>n.package))],scrolls:ui.filter(n=>n.scrollable==='true').map(n=>({bounds:n.bounds,visible:visible(n)})),inputNodes:ui.filter(n=>n.class==='android.widget.EditText').map(n=>({label:n['content-desc'],bounds:n.bounds,focused:n.focused,clickable:n.clickable,enabled:n.enabled})),imeNodes:ui.filter(n=>/inputmethod|keyboard/i.test(n.package??'')).map(n=>({package:n.package,bounds:n.bounds,visible:visible(n)})),controls:ui.filter(n=>['結束本輪互動','確定結束本輪互動？','確認結束','繼續這段相遇','傳送訊息','雨聲書店','A real Web reply for Android'].some(label=>label===n.text||label===n['content-desc'])).map(n=>({label:n.text||n['content-desc'],bounds:n.bounds,enabled:n.enabled,clickable:n.clickable})),checks,labels:['即時連線已同步','重新連線中；狀態尚未確認','送出中','目前無法確認送出結果，請重新同步。','目前無法確認狀態，請重新同步。','場景狀態已更新，請重新同步後再操作。'].filter(t=>ui.some(n=>n.text===t)),requests:(await fixture.send({op:'request-stats'})).slice(-15)}));throw error;}
finally{await browser.close();await fixture.close();if(staticServer?.exitCode===null)spawnSync('taskkill.exe',['/PID',String(staticServer.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});}
if(succeeded){const pss=memorySamples.map(x=>x.pssKiB).filter(Number.isFinite);const evidence={status:'passed',framework:sceneFramework?'scene-event.v1':'legacy-story',executedAt:new Date().toISOString(),platform:'Android↔Web',environment:'workspace-owned DatingHighQA31 emulator-5556 ADB5038; actual application, Room DO, D1 and R2; '+(recordedGemini?'replayed user-approved real Gemini full-body art with lossless WebP; zero provider calls':approvedArt?'user-approved builtin full-body WebP; no Gemini provider':'controlled Skia geometric avatar provider'),checks,memorySamples,sampledPeakPssKiB:pss.length?Math.max(...pss):null,memoryMeasurement:'discrete Android PSS and system-memory samples; sampled peak, not continuous peak or physical low-end-device/release-build benchmark',gateB:'pending-user-playthrough'};fs.writeFileSync(`.local/evidence/${sceneFramework?'scene-framework-':''}story-android-2.5d-${recordedGemini?'approved-gemini':approvedArt?'approved-art':'technical'}-${process.env.DATINGHIGH_STORY_NATIVE_BRANCH??'both'}.json`,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));}
