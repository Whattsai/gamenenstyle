import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {request} from '@playwright/test';
import {createFixture,deepLink,waitText} from './fixture.mjs';
import {invoke,nodes,visible,tap,fill,reopen,memorySample} from './support.mjs';
import {parseNativeAudioPlayback} from '../../../tools/native-audio-policy.mjs';
assert.equal(process.env.DATINGHIGH_ANDROID_DEVICE,'emulator-5556');assert.equal(process.env.DATINGHIGH_ADB_PORT,'5038');
assert.equal(invoke('shell','getprop','ro.boot.qemu.avd_name').trim(),'DatingHighQA31');
process.env.DATINGHIGH_E2E_SCENE_FRAMEWORK='3';
const fixture=await createFixture({matchingProfile:true,storyProfile:true,avatarProfile:true}),peer=await request.newContext();
let inStory=false,passed=false,ambientStopped=false;
const fullStory=process.env.DATINGHIGH_V3_NATIVE_FULL==='1';let serial=962000,explicitMediaReloads=0;
const endingKey=process.env.DATINGHIGH_V3_NATIVE_ENDING??'gentle';
const ending={gentle:{label:'想獨處，安靜休息',id:'ev3-03-gentle-distance',title:'剛剛好的距離'},'more-talk':{label:'想再聊聊',id:'ev3-01-more-talk',title:'雨停之前，再聊一會'},'book-recommendation':{label:'聊書就好',id:'ev3-02-book-recommendation',title:'留下一本書的名字'}}[endingKey];
assert.ok(ending,'Choose a published V3 ending');
const nativeAudio=[];
async function verifyNativeAudio(){
 const uid=Number(invoke('shell','cmd','package','list','packages','-U','com.datinghigh.app').match(/uid:(\d+)/)?.[1]);
 const read=()=>parseNativeAudioPlayback(invoke('shell','dumpsys','audio'),uid);
 const wait=async(phase,predicate)=>{const deadline=Date.now()+30000;while(Date.now()<deadline){const sample=read();if(predicate(sample)){nativeAudio.push({phase,capturedAtUtc:new Date().toISOString(),...sample});return;}await sleep(300);}throw Error('Native V3 audio state did not settle: '+phase);};
 const saved=await fixture.send({op:'scene-state'});await wait('before-user-enable',s=>s.activeStartedPlayerIds.length===0);
 await tap('開啟場景聲音');await storyText('靜音場景聲音');await wait('rain-and-original-music-started',s=>s.activeStartedPlayerIds.length===2);
 await tap('靜音場景聲音');await storyText('開啟場景聲音');await wait('explicitly-muted',s=>s.activeStartedPlayerIds.length===0);
 const after=await fixture.send({op:'scene-state'});assert.deepEqual(after.progress,saved.progress);assert.deepEqual(after.sessions,saved.sessions);assert.deepEqual(after.roundEventCounts,saved.roundEventCounts);
 console.log('Native V3: two actual audio players start only after user enable and stop on mute');
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function area(expected){const end=Date.now()+45000;while(Date.now()<end){const state=await fixture.send({op:'scene-state'});if(state.progress.some(p=>p.role==='acceptor'&&p.current_area_id===expected))return;await sleep(300);}throw Error('Native area did not commit: '+expected);}
async function reveal(label){
 let horizontalAttempts=0;
 for(let i=0;i<24;i++){
  const all=nodes();if(all.some(n=>visible(n)&&(n.text===label||n['content-desc']===label)))return;
  const scrolls=all.filter(n=>n.scrollable==='true'&&visible(n)),bounds=n=>n.bounds.match(/-?\d+/g).map(Number);
  const movement=label.startsWith('前往')&&scrolls.find(n=>n.class==='android.widget.HorizontalScrollView'&&all.some(child=>{
   if(!visible(child)||!(child.text||child['content-desc']||'').startsWith('前往'))return false;
   const[l,t,r,b]=bounds(n),[x,y,x2,y2]=bounds(child);return x>=l&&x2<=r&&y>=t&&y2<=b;
  }));
  if(movement){const[l,t,r,b]=bounds(movement),y=String(Math.round((t+b)/2)),left=String(Math.round(l+(r-l)*.15)),right=String(Math.round(l+(r-l)*.85)),forward=horizontalAttempts++%12<6;invoke('shell','input','swipe',forward?right:left,y,forward?left:right,y,'350');}
  else{const box=scrolls.filter(n=>n.class==='android.widget.ScrollView').sort((a,b)=>(bounds(b)[3]-bounds(b)[1])-(bounds(a)[3]-bounds(a)[1]))[0];assert.ok(box,'Native scene has its own vertical scroll container');const[l,t,r,b]=bounds(box),x=String(Math.round((l+r)/2)),high=String(Math.round(t+(b-t)*.2)),low=String(Math.round(t+(b-t)*.8));invoke('shell','input','swipe',x,i%16<8?low:high,x,i%16<8?high:low,'350');}
  await sleep(250);
 }
 throw Error('Native scene control is not visible: '+label);
}
async function stopAmbient(){if(ambientStopped)return;assert.match(invoke('shell','wm','size'),/720x1600/);invoke('shell','input','tap','100','262');await sleep(600);await waitText('開啟場景微動',15000);ambientStopped=true;}
async function storyText(text,timeout=60000){try{await waitText(text,timeout);}catch(error){if(ambientStopped||error.message!=='Android UI dump could not reach idle state')throw error;await stopAmbient();await waitText(text,timeout);}}
function capture(name){assert.ok(inStory);const result=spawnSync(process.env.LOCALAPPDATA+'/Android/Sdk/platform-tools/adb.exe',['-P','5038','-s','emulator-5556','exec-out','screencap','-p'],{windowsHide:true,encoding:null,timeout:45000,maxBuffer:8*1024*1024});assert.equal(result.status,0);fs.writeFileSync(`.local/evidence/scene-v3-book-android-${name}.png`,result.stdout);}
async function endingStageReady(){
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){const all=nodes();if(all.some(n=>n['content-desc']?.startsWith('場景物件：')&&n['content-desc'].includes('《')&&n.enabled==='true'))return;await sleep(400);}
 throw Error('Native completed ending must render its authorized physical books, not only ending text');
}
async function nativeAction(label){
 const before=(await fixture.send({op:'scene-state'})).progress.find(p=>p.role==='acceptor').revision;
 await reveal(label);let all=nodes();const blocked=all.find(n=>n.text===label||n['content-desc']===label)?.enabled==='false';
 if(blocked&&all.some(n=>n['content-desc']==='重新載入場景素材'&&n.enabled==='true'&&visible(n))){
  capture('before-media-reload');console.log(JSON.stringify({nativeMediaReloadReason:all.some(n=>(n.text??n['content-desc']??'').includes('場景圖片載入失敗'))?'image-error':'stage-not-ready'}));
  const saved=await fixture.send({op:'scene-state'});await tap('重新載入場景素材');explicitMediaReloads++;console.log('Native V3: explicit media reload');const loaded=Date.now()+60000;let ready=false;
  while(Date.now()<loaded){all=nodes();if(all.some(n=>(n.text===label||n['content-desc']===label)&&n.enabled==='true'&&visible(n))){ready=true;break;}await sleep(400);}
  assert.ok(ready,'Reloaded native stage becomes usable');const restored=await fixture.send({op:'scene-state'});assert.deepEqual(restored.progress,saved.progress);assert.deepEqual(restored.sessions,saved.sessions);assert.deepEqual(restored.roundEventCounts,saved.roundEventCounts);
 }
 await tap(label);const end=Date.now()+45000;
 while(Date.now()<end){if((await fixture.send({op:'scene-state'})).progress.find(p=>p.role==='acceptor').revision>before)return;await sleep(300);}throw Error('Native V3 action did not commit: '+label);
}
async function openEmailLogin(){
 const end=Date.now()+120000;await deepLink('login');
 while(Date.now()<end){
  const all=nodes();if(all.some(n=>n.class==='android.widget.EditText'&&n['content-desc']==='Email'&&visible(n)))return;
  const button=all.find(n=>n.clickable==='true'&&visible(n)&&(n.text==='使用 Email 登入'||n['content-desc']==='使用 Email 登入'));
  if(button){const[l,t,r,b]=button.bounds.match(/-?\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round((t+b)/2)));}
  await sleep(400);
 }
 throw Error('Native V3 Email form did not settle');
}
try{
 await fixture.reset();const {players}=await fixture.send({op:'matching-seed'});
 const login=await peer.post(fixture.backend.url+'/api/v1/sessions',{headers:{'X-DatingHigh-Client':'android'},data:{email:'matching-0@example.test',password:'A real D1 integration password',clientPlatform:'android'}});assert.equal(login.status(),201);
 // 隔離夥伴帳號的憑證僅留在本程序 RAM，不輸出或寫入證據。
 const credentials=await login.json(),headers={Authorization:'Bearer '+credentials.tokens.accessToken,'X-DatingHigh-Client':'android'};
 const ensurePeerSession=async()=>{
  const expiry=JSON.parse(Buffer.from(credentials.tokens.accessToken.split('.')[1],'base64url')).exp;
  if(expiry*1000>Date.now()+90000)return;
  const response=await peer.post(fixture.backend.url+'/api/v1/session/refresh',{headers:{'X-DatingHigh-Client':'android'},data:{clientPlatform:'android',refreshToken:credentials.tokens.refreshToken}});assert.equal(response.status(),200);
  credentials.tokens=(await response.json()).tokens;headers.Authorization='Bearer '+credentials.tokens.accessToken;
 };
 const invite=await peer.post(fixture.backend.url+'/api/v1/match-invitations',{headers,data:{candidateId:players[1].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000961001'}});assert.equal(invite.status(),201);
 await reopen(8084,{hideDevTools:true});await openEmailLogin();console.log('Native V3: Email form ready');await fill('Email','matching-1@example.test');await fill('密碼','A real D1 integration password');await tap('登入');await waitText('探索心動');
 await deepLink('invitations');await reveal('接受 測試旅人0');await tap('接受 測試旅人0');await storyText('雨聲書店・雨停之前');inStory=true;await storyText('即時連線已同步');
 await stopAmbient();console.log('Native V3 room and explicit motion toggle ready');
 await reveal('前往入口');await tap('前往入口');await area('entrance');await reveal('前往書架');await tap('前往書架');await area('shelves');await storyText('哪一類故事容易');
 const before=await fixture.send({op:'scene-state'});capture('shelves');console.log('Native V3 shelf ready');
 // 書的下半部在敘事HUD後方；實際點擊畫面可見的上半部，不穿透遮擋層。
 const spine=nodes().find(n=>visible(n)&&n['content-desc']==='場景物件：《留給明天的信》');assert.ok(spine);const[l,t,r,b]=spine.bounds.match(/-?\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round(t+(b-t)*.2)));
 await sleep(800);capture('after-book-tap');await storyText('心動迴路原創試讀');await tap('下一頁');await storyText('信的最後一行');capture('open');
 const during=await fixture.send({op:'scene-state'});assert.deepEqual(during.progress,before.progress);assert.deepEqual(during.sessions,before.sessions);assert.deepEqual(during.roundEventCounts,before.roundEventCounts);
 await tap('合上《留給明天的信》');await storyText('哪一類故事容易');capture('returned');
 if(fullStory){
  await ensurePeerSession();const rounds=await(await peer.get(fixture.backend.url+'/api/v1/game-rounds',{headers})).json();assert.equal(rounds.items.length,1);const roundId=rounds.items[0].roundId;
  if(endingKey==='book-recommendation')await verifyNativeAudio();
  const peerSnapshot=async()=>{await ensurePeerSession();const response=await peer.get(`${fixture.backend.url}/api/v1/game-rounds/${roundId}/experience`,{headers});assert.equal(response.status(),200);return response.json();};
  const peerAction=async(binding,option)=>{const s=await peerSnapshot(),e=s.availableEvents.find(e=>e.bindingId.endsWith(':'+binding)),a=e?.actions.find(a=>!option||Object.values(a.params).includes(option));assert.ok(a,'Peer has a real authorized action: '+binding);const response=await peer.post(`${fixture.backend.url}/api/v1/game-rounds/${roundId}/story/event`,{headers,data:{clientRequestId:`019a281e-0000-7000-8000-${String(++serial).padStart(12,'0')}`,storySessionId:s.storySessionId,bindingId:e.bindingId,actionId:a.actionId,params:a.params,expectedTrackRevision:s.myTrack.revision,...(e.needsSharedRevision?{expectedSharedRevision:s.sharedRevision}:{}),...(e.revision==null?{}:{expectedEventRevision:e.revision})}});assert.equal(response.status(),200,'Peer authorized action committed: '+binding);};
  console.log('Native V3: independent reading and chosen greeting');
  await nativeAction('選擇親情友情：《週日的第二碗湯》');await nativeAction('單純被這段話觸動了');await nativeAction('前往閱讀角');await nativeAction('到閱讀角坐下試讀');await nativeAction('把這一頁讀完');
  for(const [binding,option]of [['iv3-enter'],['iv3-browse'],['iv3-book','growth'],['iv3-walk','reading-corner'],['iv3-notice'],['iv3-pause'],['iv3-approach'],['iv3-greeting','tissue']])await peerAction(binding,option);
  await nativeAction('聽聽對方說了什麼');await nativeAction('「謝謝你……」接過面紙');await nativeAction('「謝謝，我想自己安靜看會兒書。」');await peerAction('iv3-understand','respect');capture('decline-after-tissue');
  console.log('Native V3: shared safe rescue');await peerAction('sv3-weather');await nativeAction('注意雨勢，先避開入口');
  for(const [binding,option]of [['iv3-walk','shelves'],['iv3-walk','safe-storage'],['iv3-safety']])await peerAction(binding,option);
  await nativeAction('前往書架');await nativeAction('前往內側倉庫');await nativeAction('快步跟上，前往後面的倉庫');await peerAction('sv3-help');await nativeAction('我願意在倉庫幫忙');await nativeAction('接過讀書會清單');assert.ok(!(await peerSnapshot()).knownClues.some(c=>c.id==='private-list'));await nativeAction('抬頭跟對方說：「找到了，是綠色封面的《把燈留給自己》」');
  for(const [binding,option]of [['iv3-walk','shelves'],['iv3-find','try-love'],['iv3-find','compare'],['iv3-pick'],['iv3-walk','safe-storage'],['iv3-box']])await peerAction(binding,option);
  await nativeAction('清點確認箱內的書籍數量');await nativeAction('抱起清點好的收納箱');await nativeAction('將收納箱穩穩放上高架');capture('stored-safely');
  for(const [binding,option]of [['iv3-walk','counter'],['iv3-walk','window'],['iv3-coffee'],['iv3-recommend','growth']])await peerAction(binding,option);
  await nativeAction('前往櫃檯');await nativeAction('前往窗邊');await nativeAction('到窗邊歇一會');await nativeAction('分享手上的《週日的第二碗湯》');await peerAction('sv3-final-wish','keep-talking');assert.equal((await peerSnapshot()).chapterStatus,'playing');await nativeAction(ending.label);await storyText(ending.title);await endingStageReady();capture(`${endingKey}-ending`);
  assert.equal((await peerSnapshot()).endingId,ending.id);const final=await fixture.send({op:'scene-state'});assert.ok(final.sessions.every(s=>s.chapter_status==='completed'));assert.ok(!final.roundEventCounts.some(e=>e.kind==='message.committed'));console.log(`Native V3: ${endingKey} ending committed without automatic chat`);
 }
 fs.writeFileSync(`.local/evidence/scene-v3-${fullStory?(endingKey==='gentle'?'full':endingKey):'book'}-android.json`,JSON.stringify({status:'passed',device:'DatingHighQA31',scope:fullStory?'real native A and authorized HTTP peer I: original book, tissue acceptance with refusal, safe rescue and chosen ending; not dual native devices, real hardware or user Gate B':'real native V3 independent entry, original physical book, page turn and return; not full ending or user Gate B',...(fullStory?{endingId:ending.id}:{}),bookPreviewChangedAuthority:false,explicitMediaReloads,nativeAudio,audioScope:'Android playback state only; no audible hardware, full cue or background matrix',memory:memorySample(fullStory?`after-${endingKey}-ending`:'after-original-book')},null,2)+'\n');passed=true;console.log('Native V3 original book preview and return passed');
}catch(error){
 try{const stats=await fixture.send({op:'request-stats'}),state=await fixture.send({op:'scene-state'});console.log(JSON.stringify({nativeV3Requests:stats.slice(-40).map(r=>({method:r.method,status:r.status,path:r.path.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/g,':id'),stage:r.stage})),nativeV3State:{sessions:state.sessions.map(s=>({episode:s.episode_seq,status:s.chapter_status})),progress:state.progress.map(p=>({role:p.role,node:p.current_node_id,area:p.current_area_id,revision:p.revision}))}}));}catch{}
 try{const all=nodes(),known=['使用 Email 登入','歡迎回來','探索心動','接受 測試旅人0','即時連線已同步','無法載入劇情內容，請重新同步後再試。','目前無法確認狀態，請重新同步。','角色素材尚未就緒'];console.log(JSON.stringify({nativeV3KnownControls:known.filter(label=>all.some(n=>n.text?.includes(label)||n['content-desc']?.includes(label)))}));}catch{}
 if(inStory)try{const all=nodes();if(all.some(n=>n['content-desc']==='雨聲書店・雨停之前'||n.text==='雨聲書店・雨停之前')&&!all.some(n=>n.class==='android.widget.EditText'&&['Email','密碼'].includes(n['content-desc']))){capture('failure');console.log(JSON.stringify({nativeV3Failure:{scrolls:all.filter(n=>n.scrollable==='true'&&visible(n)).map(n=>({class:n.class,bounds:n.bounds})),movement:all.filter(n=>n['content-desc']?.startsWith('前往')).map(n=>({label:n['content-desc'],bounds:n.bounds,visible:visible(n)}))}}));}}catch{}
 throw error;
}finally{await peer.dispose();await fixture.close();if(!passed)console.log('Native V3 run did not pass; no credentials or UI XML were saved');}
