import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {api,code,waitReady} from '../../integration/local-fixture.mjs';
import {nodes,invoke,tap,fill,wait,visible,reopen} from './support.mjs';

// 真Gemini明確opt-in；來源只由本機讀入RAM並經本人API壓縮，不複製到相簿或報告。
assert.equal(process.env.DATINGHIGH_GEMINI_LIVE,'1','Enable only the authorized real Gemini QA run');
const files=[process.env.DATINGHIGH_AVATAR_SOURCE_1,process.env.DATINGHIGH_AVATAR_SOURCE_2];assert.ok(files.every(p=>p&&fs.existsSync(p)),'Two authorized source photos must be available');
const candidateCount=Number(process.env.DATINGHIGH_NATIVE_CANDIDATES??1);assert.ok([1,4].includes(candidateCount),'Choose one or four explicitly requested candidates');
const selectedIndex=candidateCount===4?2:1,candidateFrames=[];
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Select the dedicated project QA device explicitly');
const avd=invoke('shell','getprop','ro.boot.qemu.avd_name').trim();assert.ok(['DatingHighQA','DatingHighQA31'].includes(avd));
const sdk=invoke('shell','getprop','ro.build.version.sdk').trim(),sleep=ms=>new Promise(r=>setTimeout(r,ms));
invoke('shell','input','keyevent','224');invoke('shell','wm','dismiss-keyguard');invoke('shell','svc','power','stayon','true');
async function reveal(label,direction='down'){
 for(let n=0;n<40;n++){
  const all=nodes();if(all.some(x=>visible(x)&&(x.text===label||x['content-desc']===label)))return;
  const box=all.find(x=>x.scrollable==='true'&&visible(x));assert.ok(box,'Visible native ScrollView');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),high=String(Math.round(t+(b-t)*.2)),low=String(Math.round(t+(b-t)*.8));
  invoke('shell','input','swipe',x,direction==='down'?low:high,x,direction==='down'?high:low,'600');await sleep(600);
 }throw new Error(`Native control not reachable: ${label}`);
}
async function verifyFrame(index){
 const label=`AI 候選 ${index}`;await reveal(label);
 for(let tries=0;tries<8;tries++){
  const all=nodes(),image=all.find(n=>n['content-desc']===label&&visible(n)),box=all.find(n=>n.scrollable==='true'&&visible(n));assert.ok(image&&box);
  const [l,t,r,b]=image.bounds.match(/-?\d+/g).map(Number),[,top,,bottom]=box.bounds.match(/-?\d+/g).map(Number);
  if(t>top+2&&b<bottom-2){assert.ok(Math.abs((b-t)/(r-l)-4/3)<0.04,'The complete native candidate frame stays 3:4');candidateFrames.push({index,width:r-l,height:b-t});return;}
  const x=String(Math.round((l+r)/2)),middle=Math.round((top+bottom)/2),distance=Math.round((bottom-top)*.2);
  invoke('shell','input','swipe',x,String(middle),x,String(middle+(t<=top+2?distance:-distance)),'600');await sleep(600);
 }throw new Error('Cannot inspect a complete native candidate frame');
}
let account,verifiedTokens,passed=false;
async function cleanupSources(tokens){
 const list=await api('/me/photos','GET',undefined,tokens.accessToken);assert.equal(list.status,200);
 for(const photo of list.body.photos)assert.equal((await api(`/me/photos/${photo.assetId}`,'DELETE',{},tokens.accessToken)).status,204);
 await api('/session','DELETE',{refreshToken:tokens.refreshToken},tokens.accessToken);
}
try{
 await waitReady();const email=`ng${Date.now().toString(36)}@e.test`,password=`Native${randomUUID().replaceAll('-','').slice(0,16)}`;
 const requested=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(requested.status,202);const m=requested.body;
 const created=await api('/accounts','POST',{challengeId:m.challengeId,flowToken:m.flowToken,code:code(m.challengeId),password,clientPlatform:'android'});assert.equal(created.status,201);account={email,password,...created.body};
 for(const file of files){const mime=path.extname(file).toLowerCase()==='.png'?'image/png':'image/jpeg';const response=await fetch('http://localhost:8787/api/v1/me/photos',{method:'POST',headers:{'Content-Type':mime,'X-DatingHigh-Client':'android',Authorization:`Bearer ${account.tokens.accessToken}`},body:fs.readFileSync(file),signal:AbortSignal.timeout(45000)});assert.equal(response.status,201);await response.arrayBuffer();}
 console.log('Two authorized ready source photos prepared');
 await reopen();const deadline=Date.now()+120000;let all;
 do{all=nodes();if(all.some(n=>visible(n)&&['登出','使用 Email 登入','Email'].includes(n['content-desc'])))break;await sleep(500);}while(Date.now()<deadline);
 const has=label=>all.some(n=>visible(n)&&n['content-desc']===label);
 if(has('登出')){await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');}else if(has('使用 Email 登入'))await tap('使用 Email 登入');
 await fill('Email',email);await fill('密碼',password);await tap('登入');await tap('個人資料與遊戲化身');await wait('暱稱');
 await tap('選擇化身');await reveal('AI 客製化');await tap('AI 客製化');
 const disclosure='產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家';await reveal(disclosure);await wait(disclosure);
 for(const label of ['已選 · 暖陽系','月光文青系','櫻語甜心系','森語帥氣系']){await reveal(label);assert.equal((await wait(label)).enabled,'true');}
 console.log('Native third-party disclosure verified before generation');
 await reveal('開始產生第1張');await tap('開始產生第1張');
 const during=nodes(),pending=during.find(n=>n['content-desc']==='開始產生第1張'&&visible(n));if(pending)assert.equal(pending.enabled,'false','An in-flight generation cannot be tapped again');
 await wait('新候選已完成，可採用這張或繼續產生',120000);console.log('Native real Gemini candidate completed');
 for(let n=2;n<=candidateCount;n++){
  await reveal('產生下一張');await tap('產生下一張');await wait('新候選已完成，可採用這張或繼續產生',120000);
  await reveal(`比較候選 ${n}`);await wait(`比較候選 ${n}`);console.log(`Native real Gemini candidate ${n} completed`);
 }
 if(candidateCount===4){await reveal('產生下一張');assert.equal((await wait('產生下一張')).enabled,'false','A fifth native generation is disabled');}
 for(let n=1;n<=candidateCount;n++)await verifyFrame(n);
 await reveal(`比較候選 ${selectedIndex}`);await tap(`比較候選 ${selectedIndex}`);assert.equal((await wait(`比較候選 ${selectedIndex}`)).selected,'true','The chosen native candidate is marked selected');
 console.log('Native candidate preview reached');await reveal('採用這張');await tap('採用這張');await wait('確認採用這張化身');console.log('Native adoption confirmation reached');
 assert.ok(nodes().some(n=>n.text?.includes('未來正式付費上線後')&&n.text.includes('本 MVP 目前免費')),'Adoption describes future fees and current free MVP');
 await tap('取消');await reveal(`比較候選 ${selectedIndex}`);assert.equal((await wait(`比較候選 ${selectedIndex}`)).selected,'true');console.log('Native adoption cancelled without losing the candidate');
 await reveal('採用這張');await tap('採用這張');await tap('確認採用');await wait('已採用選中的遊戲化身');await tap('免費化身');await wait('目前遊戲化身');
 console.log('Native explicit adoption completed');
 await tap('關閉');await reveal('返回帳號','up');await tap('返回帳號');await reveal('登出');await tap('登出');await wait('使用 Email 登入');await waitReady();
 const logged=await api('/sessions','POST',{email,password,clientPlatform:'android'});assert.equal(logged.status,201);verifiedTokens=logged.body.tokens;
 const profile=await api('/me/dating-profile','GET',undefined,verifiedTokens.accessToken);assert.equal(profile.status,200);assert.equal(profile.body.selectedAvatarType,'generated');assert.equal(profile.body.generatedAvatars.length,1);assert.equal(profile.body.selectedAvatarRef,profile.body.generatedAvatars[0].assetId);assert.equal(profile.body.personalPhotos.length,2);assert.equal(profile.body.avatarAttempt,null);
 const image=await fetch(`http://localhost:8787/api/v1/me/media/${profile.body.selectedAvatarRef}`,{headers:{'X-DatingHigh-Client':'android',Authorization:`Bearer ${verifiedTokens.accessToken}`},signal:AbortSignal.timeout(45000)});assert.equal(image.status,200);const bytes=Buffer.from(await image.arrayBuffer());assert.ok(bytes.length>0&&bytes.length<=2000000);
 const result={status:'passed',executedAt:new Date().toISOString(),environment:`Android API${sdk} x86_64 local emulator`,generatedCount:candidateCount,selectedCandidateIndex:selectedIndex,candidateFrames,checks:['authorized-ready-sources','native-disclosure','native-explicit-incremental-generation','native-selected-candidate-state','native-cancel-preserves-candidate','native-adopt-confirmation','native-current-avatar','post-login-private-formal-media',...(candidateCount===4?['native-four-comparable-candidates','native-fifth-disabled','native-return-to-second-candidate']:[])],formalImageSha256:createHash('sha256').update(bytes).digest('hex'),limitations:['source upload UI covered separately with fictional format fixtures','TalkBack not exercised',...(candidateCount===1?['four-candidate native UI not exercised']:[])]};
 await cleanupSources(verifiedTokens);verifiedTokens=undefined;passed=true;fs.writeFileSync(`.local/evidence/avatar-native-gemini${candidateCount===4?'-four':''}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}catch(error){console.error(JSON.stringify({status:'failed',control:error.control??null,message:account?error.message?.replaceAll(account.email,'[test-account]'):error.message}));process.exitCode=1;}
finally{if(!passed&&account)try{if(!verifiedTokens){await waitReady();const logged=await api('/sessions','POST',{email:account.email,password:account.password,clientPlatform:'android'});if(logged.status===201)verifiedTokens=logged.body.tokens;}if(verifiedTokens)await cleanupSources(verifiedTokens);}catch{console.error(JSON.stringify({cleanupIncomplete:true}));}}
