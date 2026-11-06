import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createFixture,deepLink,waitAny,waitText,doubleTap} from './fixture.mjs';
import {invoke,nodes,visible,tap,fill,wait,reopen} from './support.mjs';

// 真 Android UI／SecureStore／Application／獨立 Miniflare D1；XML 僅在 RAM，禁止影片／trace。
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Explicit QA device is required');
assert.ok(['DatingHighQA','DatingHighQA31'].includes(invoke('shell','getprop','ro.boot.qemu.avd_name').trim()));
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function reveal(label,direction='down'){
 for(let attempt=0;attempt<20;attempt++){
  const all=nodes();if(all.some(n=>visible(n)&&(n.text===label||n['content-desc']===label)))return;
  const box=all.find(n=>n.scrollable==='true'&&visible(n));assert.ok(box,'Own native scroll container exists');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),hi=String(Math.round(t+(b-t)*.22)),lo=String(Math.round(t+(b-t)*.78));
  invoke('shell','input','swipe',x,direction==='down'?lo:hi,x,direction==='down'?hi:lo,'500');await sleep(400);
 }throw Object.assign(new Error('Native matching control is unreachable'),{control:label});
}
const fixture=await createFixture({matchingProfile:true});const checks=[];
const group=process.env.DATINGHIGH_MATCHING_NATIVE_GROUP??'all';assert.ok(['all','basic','extended','routing','card','layout'].includes(group));
let success=false;
async function request(path,method='GET',body,access){
 const response=await fixture.request.fetch(fixture.backend.url+'/api/v1'+path,{method,headers:{'X-DatingHigh-Client':'android',...(access?{Authorization:'Bearer '+access}:{})},...(body===undefined?{}:{data:body})});
 const value=response.status()===204?undefined:await response.json();return {status:response.status(),body:value};
}
async function actor(n){const login=await request('/sessions','POST',{email:`matching-${n}@example.test`,password:'A real D1 integration password',clientPlatform:'android'});assert.equal(login.status,201);return login.body.tokens.accessToken;}
async function login(expected='探索心動'){
 await reopen(8084);await waitAny(['使用 Email 登入','歡迎回來','探索心動','個人資料','專屬雙人房間']);
 await deepLink('login');await wait('Email');await fill('Email','matching-0@example.test');await fill('密碼','A real D1 integration password');await tap('登入');await waitText(expected);
}
async function select(name){
 await reveal('下一位');
 for(let n=0;n<2;n++){
  if(nodes().some(x=>x.text===name||x['content-desc']===name))return;
  assert.equal((await wait('下一位')).enabled,'true');await tap('下一位');await sleep(1000);
 }
 assert.ok(nodes().some(x=>x.text===name||x['content-desc']===name),'Requested real candidate is displayed');
}
try{
 let seeded,state;
 if(group==='all'||group==='layout'){
 console.log('Native matching: free portrait bounds and ended-room recovery');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});await login();
 const portrait=()=>nodes().find(n=>/^測試旅人[12]的遊戲化身$/.test(n['content-desc']??''));
 async function checkPortrait(label){
  await reveal(label,'up');
  for(let attempt=0;attempt<16;attempt++){
   const all=nodes(),node=all.find(n=>n['content-desc']===label),scroll=all.find(n=>n.scrollable==='true'&&visible(n));assert.ok(node&&scroll);
   const box=node.bounds.match(/-?\d+/g).map(Number),area=scroll.bounds.match(/-?\d+/g).map(Number);
   if(box[1]>area[1]+12&&box[3]<area[3]-12){assert.ok(Math.abs((box[3]-box[1])/(box[2]-box[0])-4/3)<.025,'Native portrait retains 3:4 inside the visible scroll area');return;}
   const x=String(Math.round((area[0]+area[2])/2)),middle=Math.round((area[1]+area[3])/2),step=Math.round((area[3]-area[1])*.15);
   invoke('shell','input','swipe',x,String(middle),x,String(box[1]<=area[1]+12?middle+step:middle-step),'400');await sleep(350);
  }
  assert.fail('The whole native portrait must fit inside the visible scroll area');
 }
 await reveal('下一位');let first=portrait();assert.ok(first);await checkPortrait(first['content-desc']);
 await reveal('下一位');await tap('下一位');await waitText('2 / 2');
 const deadline=Date.now()+30000;let second;
 while(Date.now()<deadline){second=portrait();if(second&&second['content-desc']!==first['content-desc'])break;await sleep(400);}
 assert.ok(second&&second['content-desc']!==first['content-desc']);await checkPortrait(second['content-desc']);checks.push('free-avatar-first-and-second-bounded-portrait');
 const sender=await actor(1);const sent=await request('/match-invitations','POST',{candidateId:seeded.players[0].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123462'},sender);assert.equal(sent.status,201);
 await deepLink('invitations');await reveal('接受 測試旅人1');await tap('接受 測試旅人1');await waitText('專屬雙人房間');
 state=await fixture.send({op:'matching-state'});const roundId=state.rounds[0].round_id;
 await fixture.send({op:'matching-end',roundId});await reveal('重新整理房間');await tap('重新整理房間');await waitText('探索心動');checks.push('ended-room-refresh-returns-to-matching');
 await deepLink('game-round/'+roundId);await waitText('探索心動');await waitText('測試旅人2');checks.push('ended-room-deep-link-does-not-trap');
 }
 if(group==='all'||group==='card'){
 console.log('Native matching: decline directly from an incoming exploration card');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});const sender=await actor(1);
 const sent=await request('/match-invitations','POST',{candidateId:seeded.players[0].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123461'},sender);assert.equal(sent.status,201);
 await login();await select('測試旅人1');await reveal('婉拒邀請');await tap('婉拒邀請');await reveal('保留邀請');await tap('保留邀請');
 state=await fixture.send({op:'matching-state'});assert.equal(state.invitations[0].status,'pending');checks.push('incoming-card-cancel-preserves-pending');
 await reveal('婉拒邀請');await tap('婉拒邀請');await reveal('確認永久婉拒');await tap('確認永久婉拒');await waitText('測試旅人2');
 state=await fixture.send({op:'matching-state'});assert.equal(state.invitations[0].status,'declined');assert.equal(state.rounds.length,0);checks.push('incoming-card-confirmed-permanent-decline');
 }
 if(group==='all'||group==='basic'){
 console.log('Native matching: explicit consent and restore');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});await login();
 await select('測試旅人1');await reveal('想認識');await tap('想認識');await select('測試旅人1');await wait('等待回覆');assert.equal((await wait('等待回覆')).enabled,'false');
 state=await fixture.send({op:'matching-state'});assert.equal(state.invitations.length,1);assert.equal(state.rounds.length,0);checks.push('pending-and-direction');
 const b=await actor(1);const inviteId=state.invitations[0].invitation_id;
 const accepted=await request(`/match-invitations/${inviteId}/accept`,'POST',{},b);assert.equal(accepted.status,200);
 await reveal('重新整理配對狀態','up');await tap('重新整理配對狀態');await waitText('專屬雙人房間');await reveal('房間編號：'+accepted.body.roundId);checks.push('same-persistent-room');
 await reopen(8084);await waitText('專屬雙人房間');await reveal('房間編號：'+accepted.body.roundId);checks.push('cold-restore');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});const incoming=await actor(1);
 const sent=await request('/match-invitations','POST',{candidateId:seeded.players[0].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123456'},incoming);assert.equal(sent.status,201);
 await login();await reveal('邀請','up');await tap('邀請');await reveal('婉拒 測試旅人1');await tap('婉拒 測試旅人1');await reveal('婉拒後你們將無法再次互相配對','up');await tap('保留邀請');
 state=await fixture.send({op:'matching-state'});assert.equal(state.invitations[0].status,'pending');checks.push('decline-dialog-cancel');
 await reveal('婉拒 測試旅人1');await tap('婉拒 測試旅人1');await reveal('確認永久婉拒','up');await tap('確認永久婉拒');await waitText('已婉拒，彼此不再配對');
 state=await fixture.send({op:'matching-state'});assert.equal(state.invitations[0].status,'declined');assert.equal(state.rounds.length,0);checks.push('confirmed-permanent-decline');
 }
 if(group==='all'||group==='extended'){
 console.log('Native matching: cancel and expiration');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});await login();await select('測試旅人1');await reveal('想認識');await tap('想認識');await reveal('邀請','up');await tap('邀請');
 await reveal('取消邀請 測試旅人1');await tap('取消邀請 測試旅人1');await reveal('已取消，未來仍可再次相遇');await waitText('已取消，未來仍可再次相遇');checks.push('cancel-nonpermanent');
 const renewer=await actor(1);assert.equal((await request('/match-invitations','POST',{candidateId:seeded.players[0].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123457'},renewer)).status,201);
 await fixture.send({op:'matching-expire'});await reveal('重新整理配對狀態','up');await tap('重新整理配對狀態');await reveal('已逾期，未來仍可再次相遇');await waitText('已逾期，未來仍可再次相遇');assert.ok(!nodes().some(n=>n['content-desc']==='接受 測試旅人1'));checks.push('expired-no-accept');
 console.log('Native matching: hard eligibility invalidation');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});const invalidating=await actor(1);
 assert.equal((await request('/match-invitations','POST',{candidateId:seeded.players[0].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123458'},invalidating)).status,201);
 await login();await fixture.send({op:'matching-profile',player:1,mode:'hard-loss'});await reveal('邀請','up');await tap('邀請');await reveal('配對條件已變更，請重新搜尋');await waitText('配對條件已變更，請重新搜尋');checks.push('eligibility-reason');
 console.log('Native matching: other game invalidation and empty state');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});await login();await select('測試旅人1');await reveal('想認識');await tap('想認識');await select('測試旅人1');await wait('等待回覆');
 const first=await actor(1),second=await actor(2);const external=await request('/match-invitations','POST',{candidateId:seeded.players[1].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123459'},second);assert.equal(external.status,201);
 assert.equal((await request(`/match-invitations/${external.body.invitationId}/accept`,'POST',{},first)).status,200);
 await reveal('邀請','up');await tap('邀請');await reveal('對方目前無法配對，這次邀請已失效');await waitText('對方目前無法配對，這次邀請已失效');checks.push('other-round-reason');
 await reveal('探索','up');await tap('探索');await waitText('目前沒有可配對的對象');checks.push('real-empty-state');
 console.log('Native matching: uncertain mutation and double tap');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});await login();await select('測試旅人1');await reveal('想認識');
 await fixture.send({op:'fault-response',path:'/api/v1/match-invitations',mode:'drop'});await doubleTap('想認識');await reveal('狀態不明，請重新整理；不會自動重送邀請','up');await waitText('狀態不明，請重新整理；不會自動重送邀請');await reveal('想認識');assert.equal((await wait('想認識')).enabled,'false');
 const starts=await fixture.send({op:'request-starts'});assert.equal(starts.filter(r=>r.path==='/api/v1/match-invitations'&&r.method==='POST').length,1);
 await reveal('重新整理配對狀態','up');await tap('重新整理配對狀態');await select('測試旅人1');await wait('等待回覆');state=await fixture.send({op:'matching-state'});assert.equal(state.invitations.length,1);checks.push('unknown-readback-no-replay','double-tap-single-write');
 console.log('Native matching: real pagination');
 await fixture.reset();await fixture.send({op:'matching-seed'});await fixture.send({op:'matching-more'});await login();await reveal('下一頁');await tap('下一頁');await reveal('1 / 3');await waitText('1 / 3');checks.push('real-pagination');
 }
 if(group==='all'||group==='routing'){
 console.log('Native matching: login routing, unavailable state and old invitation');
 await fixture.reset();seeded=await fixture.send({op:'matching-seed'});await fixture.send({op:'matching-profile',player:0,mode:'orientation-empty'});await login('個人資料');
 await deepLink('matching');await waitText('請先完成個人資料');await wait('完成個人資料');assert.ok(!nodes().some(n=>n.text==='測試旅人1'));checks.push('unready-login-and-guidance');
 await fixture.send({op:'matching-profile',player:0,mode:'ready'});await fixture.send({op:'matching-rounds-mode',unavailable:true});
 await deepLink('start');await waitText('目前無法確認配對狀態，請重試');await fixture.send({op:'matching-rounds-mode',unavailable:false});await tap('重試配對狀態');await waitText('探索心動');checks.push('unknown-login-safe-retry');
 const oldSender=await actor(1);const old=await request('/match-invitations','POST',{candidateId:seeded.players[0].candidateId,clientRequestId:'019a281e-0000-7000-8000-000000123460'},oldSender);assert.equal(old.status,201);
 await fixture.send({op:'matching-profile',player:0,mode:'orientation-empty'});await reveal('邀請','up');await tap('邀請');await reveal('接受 測試旅人1');await tap('接受 測試旅人1');await waitText('專屬雙人房間');await reveal('遊戲進行中，結束後才能重新配對');checks.push('incoming-old-pending-accepted','single-game-guidance');
 await reveal('你的帳號');await tap('你的帳號');await reveal('登出');await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');await fill('Email','matching-0@example.test');await fill('密碼','A real D1 integration password');await tap('登入');await waitText('專屬雙人房間');checks.push('new-family-restores-same-game');
 }
 success=true;
}catch(error){console.error(JSON.stringify({status:'failed',error:error.name,control:error.control??null,reason:error.name==='AssertionError'?'assertion-failed':/Native|Expected|Android/.test(error.message??'')?error.message:'fixture-or-api-failure',completed:checks}));process.exitCode=1;}
finally{try{await fixture.close();}catch{success=false;process.exitCode=1;}}
if(success){const evidence={status:'passed',group,executedAt:new Date().toISOString(),platform:'Android',environment:'dedicated QA31; actual API/Application/Miniflare D1',checks,scope:{ios:'deferred-D-052',accessibility:'excluded-D-051',storyExit:'downstream-not-verified'}};fs.writeFileSync(`.local/evidence/matching-android${group==='all'?'':'-'+group}.json`,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));}
