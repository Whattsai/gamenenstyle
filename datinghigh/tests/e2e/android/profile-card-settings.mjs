import assert from 'node:assert/strict';
import {avatarFixturePassword} from '../web/backend.ts';
import {createFixture,openScreen,login,waitText} from './fixture.mjs';
import {invoke,nodes,visible,tap,wait,fill} from './support.mjs';
assert.equal(process.env.DATINGHIGH_ANDROID_DEVICE,'emulator-5578');
assert.equal(invoke('shell','getprop','ro.boot.qemu.avd_name').trim(),'DatingHighQA31');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const phase=process.env.DATINGHIGH_PROFILE_NATIVE_PHASE??'all';assert.ok(['all','catalog','flows'].includes(phase));
async function reveal(label,direction='down'){
 for(let i=0;i<28;i++){
  const all=nodes();if(all.some(n=>visible(n)&&(n['content-desc']===label||n.text===label)))return;
  const box=all.find(n=>n.scrollable==='true'&&visible(n));assert.ok(box,'Native scroll area');
  const[l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2));
  invoke('shell','input','swipe',x,String(Math.round(t+(b-t)*(direction==='down'?.8:.25))),x,String(Math.round(t+(b-t)*(direction==='down'?.25:.8))),'450');await sleep(250);
 }throw new Error('Native control unavailable: '+label);
}
invoke('shell','input','keyevent','224');invoke('shell','wm','dismiss-keyguard');invoke('shell','svc','power','stayon','true');
async function dismissIme(){
 const shown=()=>/mInputShown=true|isInputViewShown=true/.test(invoke('shell','dumpsys','input_method'));
 if(shown()){invoke('shell','input','keyevent','4');await sleep(500);}
}
async function openAvatars(){
 await dismissIme();
 for(let i=0;i<3;i++){
  if(nodes().some(n=>visible(n)&&(n.text==='選擇遊戲化身'||n['content-desc']==='選擇遊戲化身'||n['content-desc']==='關閉')))return;
  await reveal('選擇化身','up');await tap('選擇化身');await sleep(400);
 }
 await wait('選擇遊戲化身');
}
async function waitFieldValue(label,expected){
 const end=Date.now()+30000;let field;
 while(Date.now()<end){field=nodes().find(n=>n['content-desc']===label&&n.class==='android.widget.EditText');if(field?.text===expected)return;await sleep(300);}
 throw Object.assign(new Error('Native draft field did not retain its expected value'),{field:label,found:!!field,length:field?.text?.length});
}
async function pullToConfirm(){
 for(let i=0;i<4;i++){
  const all=nodes();if(all.some(n=>visible(n)&&n['content-desc']==='捨棄修改'))return;
  const box=all.find(n=>n.scrollable==='true'&&visible(n));assert.ok(box,'Native profile scroll area');
  const[l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2));
  invoke('shell','input','swipe',x,String(Math.round(t+30)),x,String(Math.round(t+330)),'800');await sleep(700);
 }
 await wait('捨棄修改');
}
const f=await createFixture({avatarProfile:true});
try{
 await f.reset('local');await openScreen('login');await login(avatarFixturePassword);await f.send({op:'avatar-seed-photos'});await tap('個人資料與遊戲化身');await wait('暱稱');console.log('Native profile loaded');
 assert.ok(!nodes().some(n=>visible(n)&&n['content-desc']==='儲存'));
 await fill('暱稱','StarRiver');await reveal('生日');await fill('生日','1995-01-01');await reveal('戀愛性向：女');await tap('戀愛性向：女');await dismissIme();console.log('Native profile draft entered');
 if(phase!=='flows')for(const[label,prefix,count]of[['男','male',8],['女','female',8],['多元','female',16]]){
  await reveal('暱稱','up');await reveal('生理性別：'+label);await tap('生理性別：'+label);await tap('儲存');await waitText('個人資料已儲存');console.log('Native saved gender: '+label);await openAvatars();console.log('Native avatar selector opened');
  const ids=new Set();
  for(let i=0;i<5;i++){
   const all=nodes();for(const n of all){const match=n['content-desc']?.match(/^選用 ((?:male|female)-0[1-8])$/);if(match)ids.add(match[1]);}
   if(ids.size===count)break;
   const box=all.find(n=>n.scrollable==='true'&&visible(n));if(!box)break;
   const[l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2));invoke('shell','input','swipe',x,String(Math.round(t+(b-t)*.8)),x,String(Math.round(t+(b-t)*.25)),'400');await sleep(200);
  }
  assert.equal(ids.size,count);if(count===8)assert.ok([...ids].every(id=>id.startsWith(prefix+'-')));
  await reveal('選用 '+prefix+'-01','up');await tap('選用 '+prefix+'-01');await waitText('遊戲化身已更新');await tap('關閉');await wait('選擇化身');console.log('Native gender catalog verified: '+count);
 }
 if(phase==='flows'){await tap('儲存');await waitText('個人資料已儲存');}
 if(phase!=='catalog'){
 await reveal('暱稱','up');await fill('一句自我介紹','draft');await tap('返回');await tap('取消');
 await reveal('暱稱','up');await reveal('一句自我介紹');await waitFieldValue('一句自我介紹','draft');console.log('Native back cancellation retained draft');
 await pullToConfirm();await tap('取消');await reveal('暱稱','up');await reveal('一句自我介紹');await waitFieldValue('一句自我介紹','draft');
 await pullToConfirm();await tap('捨棄修改');await waitText('已更新目前資料');console.log('Native pull confirmation verified');
 await reveal('開放暱稱');await tap('開放暱稱');await reveal('開放個人照片');await tap('開放個人照片');await reveal('預覽同意後的名片','up');await tap('預覽同意後的名片');await waitText('這是你自己的預覽');await waitText('30–34 歲');
 assert.ok(!nodes().some(n=>visible(n)&&n.text==='StarRiver'));assert.ok(!nodes().some(n=>visible(n)&&/名片照片/.test(n['content-desc']??'')));
 assert.ok(!nodes().some(n=>visible(n)&&n.class==='android.widget.Switch'));const previewRequests=await f.send({op:'request-starts'});assert.equal(previewRequests.filter(r=>r.path.startsWith('/api/v1/me/media/')).length,0);await tap('返回');
 await reveal('暱稱','up');await fill('一句自我介紹','back-draft');invoke('shell','input','keyevent','4');await wait('捨棄修改');await tap('取消');
 await tap('返回');await tap('捨棄修改');await wait('登出');await tap('登出');await waitText('已登出');await tap('使用 Email 登入');await login(avatarFixturePassword);await tap('個人資料與遊戲化身');await wait('暱稱');
 const state=await f.send({op:'avatar-state'});const settings=JSON.parse(state.profiles[0].card_visibility_json);assert.equal(settings.nickname,false);assert.equal(settings.personalPhotos,false);console.log('Native standalone card, back and persisted privacy verified');
 }
}finally{await f.close();}
