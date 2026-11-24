import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createFixture,openScreen,waitText,waitAny} from './fixture.mjs';
import {invoke,nodes,visible,tap,fill,wait,reopen,memorySample} from './support.mjs';
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Select the project QA emulator explicitly');
assert.equal(invoke('shell','getprop','ro.boot.qemu.avd_name').trim(),'DatingHighQA31');
async function reveal(label){
 for(const direction of ['down','up'])for(let n=0;n<14;n++){
  const all=nodes();if(all.some(x=>visible(x)&&(x['content-desc']===label||x.text===label)))return;
  const box=all.find(x=>x.scrollable==='true'&&visible(x));assert.ok(box,'Visible profile scroll container');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),high=String(Math.round(t+(b-t)*.25)),low=String(Math.round(t+(b-t)*.75));
  invoke('shell','input','swipe',x,direction==='down'?low:high,x,direction==='down'?high:low,'400');
 }
 throw Object.assign(new Error('Native control not reachable'),{control:label});
}
const fixture=await createFixture({avatarProfile:true});let passed=false;
async function profile(){if(await waitAny(['暱稱','個人資料與遊戲化身'])!=='暱稱')await tap('個人資料與遊戲化身');await wait('暱稱');}
try{
 await fixture.reset('local');await openScreen('login');await fill('Email','owner@example.com');await fill('密碼','A real D1 integration password');await tap('登入');await profile();console.log('Native static owner signed in');
 await fixture.send({op:'avatar-seed-photos'});await fixture.send({op:'avatar-revision'});await reopen(8084,{hideDevTools:true});await profile();await tap('選擇化身');console.log('Native static candidate screen opened');
 await reveal('AI 客製化');await tap('AI 客製化');await reveal('開始產生第1張');await tap('開始產生第1張');await waitText('已產 1/4 張');
 await reveal('採用這張');await tap('採用這張');await tap('確認採用');await waitText('請核對四種姿態與五種表情',180000);console.log('Native static review opened');
 assert.equal((await fixture.send({op:'avatar-state'})).profiles[0].selected_avatar_ref,'female-07');
 for(const pose of ['站立','坐姿','閱讀','持書']){await reveal('檢視'+pose);await tap('檢視'+pose);}
 for(const expression of ['自然','微笑','驚訝','思考','擔心']){await reveal('檢視'+expression);await tap('檢視'+expression);}
 await reveal('確認採用完整靜態化身');assert.equal((await wait('確認採用完整靜態化身')).enabled,'true');
 await tap('確認採用完整靜態化身');await waitText('已採用完整靜態化身');
 const state=await fixture.send({op:'avatar-state'}),ref=state.profiles[0].selected_avatar_ref;assert.equal(state.profiles[0].selected_avatar_type,'generated');
 await reopen(8084,{hideDevTools:true});await profile();
 const restored=await fixture.send({op:'avatar-state'});assert.equal(restored.profiles[0].selected_avatar_ref,ref);assert.equal(restored.providerCalls,1);
 const starts=await fixture.send({op:'request-starts'}),count=(method,path)=>starts.filter(x=>x.method===method&&x.path===path).length;
 assert.equal(count('POST','/api/v1/me/avatar/expressions/next'),9);assert.equal(count('POST','/api/v1/me/avatar/expressions/review'),1);
 const previews=starts.filter(x=>x.method==='GET'&&/^\/api\/v1\/me\/avatar\/expressions\/[^/]+\/poses\/(stand|sit|read|hold)$/.test(x.path));assert.ok(new Set(previews.map(x=>x.path.split('/').at(-1))).size===4);
 fs.mkdirSync('.local/evidence',{recursive:true});fs.writeFileSync('.local/evidence/ai-static-adoption-android.json',JSON.stringify({executedAt:new Date().toISOString(),status:'passed',device:'DatingHighQA31',adbPort:process.env.DATINGHIGH_ADB_PORT,scope:'development app, real .NET/Miniflare D1/R2 with controlled fictional provider; not live Gemini identity or release performance',steps:9,posePreviews:4,explicitReview:1,reopenRegeneration:0,memory:memorySample('after-reopen')},null,2));
 passed=true;console.log('Native static adoption and reopen passed');
}finally{await fixture.close();if(!passed)console.log('Native static adoption did not pass; no source-photo or UI XML artifact was saved');}
