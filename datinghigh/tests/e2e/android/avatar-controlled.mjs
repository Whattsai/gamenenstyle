import assert from 'node:assert/strict';import fs from 'node:fs';
import {createFixture,openScreen,login,waitText,doubleTap} from './fixture.mjs';
import {invoke,nodes,visible,tap,wait} from './support.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Select the project QA emulator explicitly');
assert.ok(['DatingHighQA','DatingHighQA31'].includes(invoke('shell','getprop','ro.boot.qemu.avd_name').trim()));
const cases=process.env.DATINGHIGH_AVATAR_NATIVE_CASE?[process.env.DATINGHIGH_AVATAR_NATIVE_CASE]:['busy','unavailable','no-image','rate-limited','uncertain','duplicate','expired'];
assert.ok(cases.every(value=>['busy','unavailable','no-image','rate-limited','uncertain','duplicate','expired'].includes(value)));
async function reveal(label,direction='down'){
 for(let n=0;n<32;n++){
  const all=nodes();if(all.some(node=>visible(node)&&(node['content-desc']===label||node.text===label)))return;
  const box=all.find(node=>node.scrollable==='true'&&visible(node));assert.ok(box,'Visible native scroll container');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),high=String(Math.round(t+(b-t)*.2)),low=String(Math.round(t+(b-t)*.8));
  invoke('shell','input','swipe',x,direction==='down'?low:high,x,direction==='down'?high:low,'550');await sleep(450);
 }throw Object.assign(new Error('Native control not reachable'),{control:label});
}
const fixture=await createFixture({avatarProfile:true});const results=[];let succeeded=false;
try{
 for(const mode of cases){
  console.log(`Native controlled case starting: ${mode}`);await fixture.reset('local');await openScreen('login');await login('A real D1 integration password');
  assert.equal((await fixture.send({op:'avatar-seed-photos'})).count,2);await fixture.send({op:'avatar-revision'});
  await tap('個人資料與遊戲化身');await wait('暱稱');await tap('選擇化身');await reveal('AI 客製化');await tap('AI 客製化');
  await reveal('開始產生第1張');await tap('開始產生第1張');await waitText('已產 1/4 張');console.log(`Native controlled first candidate: ${mode}`);
  await reveal('產生下一張');
  if(mode==='busy'){await fixture.send({op:'avatar-mode',mode:'slow'});await doubleTap('產生下一張');}
  else await tap('產生下一張');
  await waitText('已產 2/4 張');await reveal('比較候選 2','up');await tap('比較候選 2');assert.equal((await wait('比較候選 2')).selected,'true');
  let state=await fixture.send({op:'avatar-state'});assert.equal(state.providerCalls,2);assert.equal(state.profiles[0].selected_avatar_ref,'female-07');
  if(mode==='busy'){
   const starts=await fixture.send({op:'request-starts'});assert.equal(starts.filter(item=>item.path==='/api/v1/me/avatar/generations'&&item.method==='POST').length,2);
   await reveal('採用這張');await tap('採用這張');await tap('取消');await reveal('比較候選 2','up');assert.equal((await wait('比較候選 2')).selected,'true');
  }else if(mode==='expired'){
   await reveal('採用這張');await tap('採用這張');await wait('確認採用');
   await fixture.advance(1800000);await fixture.advance(1800000);await fixture.advance(1000);
   await tap('確認採用');await waitText('本輪候選已過期，請重新開始');
   assert.ok(!nodes().some(node=>visible(node)&&node['content-desc']==='確認採用'));await reveal('採用這張');assert.equal((await wait('採用這張')).enabled,'false');
   await reveal('開始新的一輪');await wait('開始新的一輪');
   const starts=await fixture.send({op:'request-starts'});assert.equal(starts.filter(item=>item.path==='/api/v1/me/avatar/selection'&&item.method==='PUT').length,0);
  }else{
   await fixture.send({op:'avatar-mode',mode});await reveal('產生下一張');await tap('產生下一張');
   const notice={unavailable:'AI 服務目前無法使用，已產生的候選仍保留','no-image':'這次未取得有效插畫，既有候選不受影響','rate-limited':'操作過於頻繁，請稍後再試',uncertain:'生成結果與供應商用量尚未確認；不會自動重送，已產生的候選仍保留',duplicate:'這次插畫與已有候選相同，未新增張數；可主動再試，可能增加供應商成本'}[mode];
   await waitText(notice);await reveal('比較候選 1','up');await wait('比較候選 1');await reveal('比較候選 2');await wait('比較候選 2');
   assert.ok(!nodes().some(node=>node['content-desc']==='比較候選 3'));await reveal('採用這張');assert.equal((await wait('採用這張')).enabled,'true');
   if(mode==='uncertain'){await reveal('產生下一張');assert.equal((await wait('產生下一張')).enabled,'false');}
   await sleep(1500);state=await fixture.send({op:'avatar-state'});assert.equal(state.providerCalls,3);
  }
  state=await fixture.send({op:'avatar-state'});assert.equal(state.profiles[0].selected_avatar_ref,'female-07');assert.equal(state.assets.filter(asset=>asset.kind==='generated_avatar').length,0);
  results.push({mode,passed:true,providerCalls:state.providerCalls,currentAvatarPreserved:true,formalAssets:0});console.log(`Native controlled case passed: ${mode}`);
 }
 succeeded=true;
}catch(error){console.error(JSON.stringify({status:'failed',case:cases[results.length],control:error.control??null,error:error.name,message:/Native|Expected|Android/.test(error.message??'')?error.message:'assertion-or-fixture-failure'}));process.exitCode=1;}
finally{try{await fixture.close();}catch{process.exitCode=1;succeeded=false;console.error(JSON.stringify({cleanupIncomplete:true}));}}
if(succeeded){const result={status:'passed',executedAt:new Date().toISOString(),environment:'Android dedicated QA; isolated actual API/Application/Miniflare D1/R2',provider:'controlled fixture; no Gemini request',cases:results,scope:{accessibility:'excluded-D-051',ios:'deferred-D-052'}};fs.writeFileSync(`.local/evidence/avatar-native-controlled${process.env.DATINGHIGH_AVATAR_NATIVE_CASE?'-'+process.env.DATINGHIGH_AVATAR_NATIVE_CASE:''}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
