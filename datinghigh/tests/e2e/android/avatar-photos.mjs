import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {api,code,waitReady} from '../../integration/local-fixture.mjs';
import {nodes,invoke,tap,fill,wait,visible,reopen} from './support.mjs';

// 真原生picker／本人API／D1／R2；只使用虛構插畫作格式fixture，完全不呼叫Gemini。
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Select the own QA device explicitly');
const avd=invoke('shell','getprop','ro.boot.qemu.avd_name').trim();assert.ok(['DatingHighQA','DatingHighQA31'].includes(avd));
const sdk=invoke('shell','getprop','ro.build.version.sdk').trim();
invoke('shell','input','keyevent','224');invoke('shell','wm','dismiss-keyguard');invoke('shell','svc','power','stayon','true');
const directory='/sdcard/Pictures/DatingHighQA';const names=['qa-photo-01.jpg','qa-photo-02.jpg','qa-photo-03.jpg'];
invoke('shell','mkdir','-p',directory);
for(let n=0;n<names.length;n++){
 const remote=`${directory}/${names[n]}`;invoke('push',path.resolve(`frontend/client/assets/avatars/${n===1?'female-04':n===2?'male-03':'male-01'}.jpg`),remote);
 invoke('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d',`file://${remote}`);
}
async function reveal(label,direction='down'){
 for(let tries=0;tries<25;tries++){
  const all=nodes();if(all.some(n=>visible(n)&&(n['content-desc']===label||n.text===label)))return;
  const box=all.find(n=>n.scrollable==='true'&&visible(n));assert.ok(box,'Visible native ScrollView');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),high=String(Math.round(t+(b-t)*.2)),low=String(Math.round(t+(b-t)*.8));
  invoke('shell','input','swipe',x,direction==='down'?low:high,x,direction==='down'?high:low,'600');await sleep(600);
 }throw new Error(`Native control not reachable: ${label}`);
}
async function chooseFixture(){
 const deadline=Date.now()+30000;
 while(Date.now()<deadline){
  const all=nodes();
  // DocumentsUI通常直接提供檔名；只從本次明確準備的圖片選擇。
  let target=all.find(n=>visible(n)&&names.some(name=>(n.text??'').includes(name)||(n['content-desc']??'').includes(name)));
  if(!target){
   // 系統PhotoPicker的日期縮圖不提供檔名；本專用QA相簿只有這三張虛構fixture。
   target=all.find(n=>visible(n)&&/Photo taken|照片拍攝|照片，|Image,/.test(n['content-desc']??'')&&/providers.media|photopicker|documentsui/.test(n.package??''));
  }
  if(target){const [l,t,r,b]=target.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round((t+b)/2)));await sleep(500);return;}
  await sleep(500);
 }
 throw new Error('The system picker did not expose one of the prepared fictional photos');
}
let account,result;
try{
 await waitReady();const email=`np${Date.now().toString(36)}@e.test`,password=`Native${randomUUID().replaceAll('-','').slice(0,16)}`;
 const requested=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(requested.status,202);
 const m=requested.body,registered=await api('/accounts','POST',{challengeId:m.challengeId,flowToken:m.flowToken,code:code(m.challengeId),password,clientPlatform:'android'});assert.equal(registered.status,201);account={email,password,...registered.body};
 await reopen();const deadline=Date.now()+120000;let all;
 do{all=nodes();if(all.some(n=>visible(n)&&['登出','使用 Email 登入','Email'].includes(n['content-desc'])))break;await sleep(500);}while(Date.now()<deadline);
 const has=label=>all.some(n=>visible(n)&&n['content-desc']===label);
 if(has('登出')){await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');}
 else if(has('使用 Email 登入'))await tap('使用 Email 登入');
 await fill('Email',email);await fill('密碼',password);await tap('登入');await tap('個人資料與遊戲化身');await wait('暱稱');await tap('選擇化身');await tap('AI 客製化');
 console.log('Native photo page ready');
 for(let n=1;n<=3;n++){
  await reveal('新增個人照片');await tap('新增個人照片');await chooseFixture();await wait('照片已壓縮並安全儲存');await reveal(`個人照片 ${n}`,'up');await wait(`個人照片 ${n}`);console.log(`Native photo ${n} uploaded`);
 }
 await reveal('照片 3 往前移');await tap('照片 3 往前移');await wait('照片順序已更新');console.log('Native photos reordered');
 await reveal('刪除照片 2');await tap('刪除照片 2');await wait('確定刪除這張照片？');await tap('取消');await reveal('個人照片 3');await wait('個人照片 3');
 for(let remaining=3;remaining>0;remaining--){await reveal('刪除照片 1','up');await tap('刪除照片 1');await tap('確認刪除');await wait('照片已刪除');console.log(`Native photo deleted; ${remaining-1} remain`);}
 await wait('尚未上傳照片；仍可直接選擇免費化身。');await tap('關閉');await reveal('返回','up');await tap('返回');await reveal('登出');await tap('登出');await wait('使用 Email 登入');
 await waitReady();const logged=await api('/sessions','POST',{email,password,clientPlatform:'android'});assert.equal(logged.status,201);
 try{const saved=await api('/me/photos','GET',undefined,logged.body.tokens.accessToken);assert.equal(saved.status,200);assert.equal(saved.body.photos.length,0);}finally{await api('/session','DELETE',{refreshToken:logged.body.tokens.refreshToken},logged.body.tokens.accessToken);}
 result={status:'passed',executedAt:new Date().toISOString(),environment:`Android API${sdk} x86_64 local emulator`,checks:['native-system-picker-upload-three','native-photo-reorder','delete-cancel-preserves-photo','delete-confirm-all','post-login-empty-photo-list'],limitations:['synthetic image format fixtures; no likeness claim','TalkBack not exercised','AI not exercised']};
}catch(error){
 console.error(JSON.stringify({status:'failed',control:error.control??null,message:account?error.message?.replaceAll(account.email,'[test-account]'):error.message}));process.exitCode=1;
 // 僅清理本程序明確建立的測試帳號；失敗仍保留，不把補償當測試通過。
 if(account)try{await waitReady();const logged=await api('/sessions','POST',{email:account.email,password:account.password,clientPlatform:'android'});if(logged.status===201){const own=await api('/me/photos','GET',undefined,logged.body.tokens.accessToken);for(const photo of own.body?.photos??[])await api(`/me/photos/${photo.assetId}`,'DELETE',{},logged.body.tokens.accessToken);await api('/session','DELETE',{refreshToken:logged.body.tokens.refreshToken},logged.body.tokens.accessToken);}}catch{console.error(JSON.stringify({cleanupIncomplete:true}));}
}
finally{
 let cleanupComplete=true;
 for(const name of names){try{const remote=`${directory}/${name}`;invoke('shell','rm','-f',remote);invoke('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d',`file://${remote}`);}catch{cleanupComplete=false;}}
 if(!cleanupComplete){process.exitCode=1;console.error(JSON.stringify({status:'failed',cleanupIncomplete:true,functionalChecksPassed:!!result}));}
 else if(result){fs.writeFileSync('.local/evidence/avatar-native-photos.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
}
