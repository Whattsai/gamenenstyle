import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {code,api,waitReady} from '../../integration/local-fixture.mjs';
import {nodes,invoke,tap,fill,wait,visible,reopen} from './support.mjs';
// 真本地 API + 本專案 QA emulator；XML 只存記憶體，無影片、trace、認證日誌。
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function previewSection(){
 if(nodes().some(n=>visible(n)&&n['content-desc']==='關閉'))await tap('關閉');
 await reveal('預覽同意後的名片','up');
}
async function openPreview(){
 // 讀取無副作用；快速捲動停止的第一次tap可能只取消momentum，須見實際內容才繼續。
 for(let attempt=0;attempt<3;attempt++){
  await tap('預覽同意後的名片');await sleep(800);
  if(nodes().some(n=>n.text?.startsWith('這是你自己的預覽，尚未授權其他玩家查看')))return;
 }
 throw new Error('Native card preview did not finish loading');
}
async function reveal(label,direction='down'){
 for(let n=0;n<28;n++){
  const all=nodes();
  if(all.some(x=>(x.text===label||x['content-desc']===label)&&visible(x)&&(!['一句自我介紹','工作／職業','生日'].includes(label)||x.class==='android.widget.EditText')))return;
  const container=all.find(x=>x.scrollable==='true'&&visible(x));assert.ok(container,'Visible native ScrollView');
  const [left,top,right,bottom]=container.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((left+right)/2));
  const low=String(Math.round(top+(bottom-top)*.8)),high=String(Math.round(top+(bottom-top)*.2));
  invoke('shell','input','swipe',x,direction==='down'?low:high,x,direction==='down'?high:low,'600');await sleep(600);
 }throw new Error(`Native control not reachable: ${label}`);
}
async function portraitFrame(label){
 await reveal(label);
 for(let n=0;n<8;n++){
  const all=nodes(),image=all.find(node=>node['content-desc']===label&&visible(node));
  if(image){const [l,t,r,b]=image.bounds.match(/-?\d+/g).map(Number);if(Math.abs((b-t)/(r-l)-4/3)<0.03)return {id:label,width:r-l,height:b-t};}
  const container=all.find(node=>node.scrollable==='true'&&visible(node));assert.ok(container);
  const [l,t,r,b]=container.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2));
  invoke('shell','input','swipe',x,String(Math.round(t+(b-t)*.65)),x,String(Math.round(t+(b-t)*.4)),'500');await sleep(500);
 }
 throw new Error(`Native portrait does not expose a complete 3:4 frame: ${label}`);
}
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Select the authorized Android QA device explicitly');
const avdName=invoke('shell','getprop','ro.boot.qemu.avd_name').trim();
assert.ok(['DatingHighQA','DatingHighQA31'].includes(avdName),'Use only a dedicated project QA emulator');
const nativeApi=invoke('shell','getprop','ro.build.version.sdk').trim();
invoke('shell','input','keyevent','224');invoke('shell','wm','dismiss-keyguard');invoke('shell','svc','power','stayon','true');
await waitReady();
// 短且唯一的測試Email便於完整核對UiAutomator單行輸入；不輸出或記錄憑證。
const email=`an${Date.now().toString(36)}@e.test`,password=`Native${randomUUID().replaceAll('-','').slice(0,16)}`;
const registration=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(registration.status,202);
const metadata=registration.body;
const registered=await api('/accounts','POST',{challengeId:metadata.challengeId,flowToken:metadata.flowToken,code:code(metadata.challengeId),password,clientPlatform:'android'});assert.equal(registered.status,201);
const account={email,...registered.body};console.log('Native fixture created');
try{
 // 從專用QA app冷啟動準備，避免前次失敗留下的捲動／鍵盤位置影響本次。
 await reopen();
 const deadline=Date.now()+120000;let resolved=false;
 while(Date.now()<deadline&&!resolved){resolved=nodes().some(n=>visible(n)&&['登出','使用 Email 登入','Email','重試登出'].includes(n['content-desc']));if(!resolved)await sleep(600);}
 assert.ok(resolved,'Own QA app cold start reaches an account or login entry');
 const all=nodes(),has=label=>all.some(n=>n['content-desc']===label&&visible(n));
 if(has('儲存')){await reveal('返回','up');await tap('返回');await reveal('登出');await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');}
 else if(has('登出')){await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');}
 else if(has('重試登出')){await tap('重試登出');await wait('使用 Email 登入');await tap('使用 Email 登入');}
 else if(has('使用 Email 登入'))await tap('使用 Email 登入');
 else assert.ok(all.some(n=>n.class==='android.widget.EditText'&&n['content-desc']==='Email'&&visible(n)),'Prepare the own QA client on its home or login screen');
 console.log('Native login form ready');
 await fill('Email',account.email);await fill('密碼',password);await tap('登入');console.log('Native login submitted');
 await tap('個人資料與遊戲化身');await wait('暱稱');
 await fill('暱稱','QaNative');console.log('Native nickname entered');await reveal('一句自我介紹');await fill('一句自我介紹','Walking');console.log('Native bio entered');await reveal('工作／職業');await fill('工作／職業','Engineer');console.log('Native occupation entered');
 await reveal('生日');await fill('生日','1995-01-01');console.log('Native birthday entered');await reveal('生理性別：多元');await tap('生理性別：多元');await reveal('戀愛性向：女');await tap('戀愛性向：女');
 await tap('儲存');await wait('個人資料已儲存');console.log('Native profile saved');
 await reveal('選擇化身','up');await tap('選擇化身');await tap('AI 客製化');await wait('尚未上傳照片；仍可直接選擇免費化身。');await tap('新增個人照片');
 // 系統照片挑選器取消不得觸發上傳。
 await sleep(1500);invoke('shell','input','keyevent','4');await sleep(700);
 await wait('尚未上傳照片；仍可直接選擇免費化身。');
 await reveal('請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱','up');
 assert.ok(!nodes().some(node=>node.text==='照片已壓縮並安全儲存'||node['content-desc']==='照片已壓縮並安全儲存'));
 console.log('Native picker cancelled without a false success');
 assert.equal((await api('/me/photos','GET',undefined,account.tokens.accessToken)).status,401,'New native login revokes registration family');
 await tap('免費化身');await reveal('選用 male-01');await tap('選用 male-01');
 await wait('遊戲化身已更新');console.log('Native builtin selected');
 const portrait=await wait('male-01');const [pl,pt,pr,pb]=portrait.bounds.match(/-?\d+/g).map(Number);
 assert.ok(Math.abs((pb-pt)/(pr-pl)-4/3)<0.03,'The whole 3:4 builtin portrait fits its native card without intrinsic asset height');console.log('Native builtin 3:4 frame verified');
 const frames=[];for(const group of ['male','female'])for(let index=1;index<=8;index++)frames.push(await portraitFrame(`${group}-0${index}`));
 assert.equal(frames.length,16);await reveal('選用 female-07','up');await tap('選用 female-07');await wait('遊戲化身已更新');
 assert.equal((await wait('選用 female-07')).selected,'true');console.log('Native all sixteen portraits and cross-group selection verified');
 await previewSection();await openPreview();await reveal('Engineer');await wait('Engineer');console.log('Native card preview verified');await tap('返回');
 await reveal('返回','up');await tap('返回');await reveal('登出');await tap('登出');await wait('使用 Email 登入');
 // UI長流程後先在同一驗證程序確認本地container連線；登入mutation仍只送一次。
 await waitReady();
 const relogged=await api('/sessions','POST',{email:account.email,password,clientPlatform:'android'});assert.equal(relogged.status,201);
 try{
  const saved=await api('/me/dating-profile','GET',undefined,relogged.body.tokens.accessToken);assert.equal(saved.status,200);
  assert.equal(saved.body.nickname,'QaNative');assert.equal(saved.body.occupation,'Engineer');assert.equal(saved.body.birthDate,'1995-01-01');assert.equal(saved.body.selectedAvatarRef,'female-07');assert.equal(saved.body.personalPhotos.length,0);assert.equal(saved.body.profileReady,true);
 }finally{await api('/session','DELETE',{refreshToken:relogged.body.tokens.refreshToken},relogged.body.tokens.accessToken);}
 const result={status:'passed',executedAt:new Date().toISOString(),environment:`Android API${nativeApi} x86_64 local emulator`,apkSha256:createHash('sha256').update(fs.readFileSync('frontend/client/android/app/build/outputs/apk/debug/app-debug.apk')).digest('hex'),checks:['native-login','profile-save','empty-photo-purpose','system-picker-cancel-without-false-success','all-sixteen-complete-portrait-frames','cross-group-builtin-selection','own-card-preview','logout','post-login-persisted-fields-and-avatar'],portraitFrames:frames,scope:{platform:'android',accessibility:'excluded-D-051',ios:'deferred-D-052'},limitations:['photo-upload-order-delete not exercised by this script','AI generation UI not exercised by this script']};
 fs.writeFileSync('.local/evidence/avatar-native-basic.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}catch(error){console.error(JSON.stringify({status:'failed',control:error.control??null,message:error.message?.replace(account.email,'[test-account]')}));process.exitCode=1;}
