import assert from 'node:assert/strict';import fs from 'node:fs';
import {createFixture,openScreen,login,waitText} from './fixture.mjs';
import {invoke,nodes,visible,tap,wait,fill} from './support.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE);assert.ok(['DatingHighQA','DatingHighQA31'].includes(invoke('shell','getprop','ro.boot.qemu.avd_name').trim()));
async function reveal(label,direction='down'){for(let n=0;n<32;n++){const all=nodes();if(all.some(v=>visible(v)&&(v.text===label||v['content-desc']===label)))return;const scroll=all.find(v=>v.scrollable==='true'&&visible(v));assert.ok(scroll);const [l,t,r,b]=scroll.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),hi=String(Math.round(t+(b-t)*.2)),lo=String(Math.round(t+(b-t)*.8));invoke('shell','input','swipe',x,direction==='up'?hi:lo,x,direction==='up'?lo:hi,'550');await sleep(400);}throw Object.assign(new Error('Native privacy control not reachable'),{control:label});}
const fixture=await createFixture({avatarProfile:true});let passed=false;
try{
 await fixture.reset('local');await openScreen('login');await login('A real D1 integration password');await fixture.send({op:'avatar-seed-photos'});
 const original=await fixture.send({op:'avatar-state'}),asset=original.assets.find(v=>v.kind==='personal_photo'&&v.status==='ready').asset_id;
 const email='privacy-second@example.test',password='A real D1 integration password',headers={'X-DatingHigh-Client':'android'};
 const issued=await fixture.request.post(fixture.backend.url+'/api/v1/email-registrations',{headers,data:{email,clientPlatform:'android'}});assert.equal(issued.status(),202);const challenge=await issued.json();
 const created=await fixture.request.post(fixture.backend.url+'/api/v1/accounts',{headers,data:{challengeId:challenge.challengeId,flowToken:challenge.flowToken,code:'000001',password,clientPlatform:'android'}});assert.equal(created.status(),201);const credentials=await created.json(),ownHeaders={...headers,Authorization:`Bearer ${credentials.tokens.accessToken}`};
 const read=async id=>fixture.request.get(`${fixture.backend.url}/api/v1/me/media/${id}`,{headers:ownHeaders});
 const known=await read(asset),unknown=await read('019a281e-0000-7000-8000-000000999999');assert.equal(known.status(),404);assert.equal(unknown.status(),404);
 const {traceId:a,...first}=await known.json(),{traceId:b,...second}=await unknown.json();assert.ok(a&&b);assert.deepEqual(first,second);assert.equal(first.code,'PHOTO_NOT_FOUND');assert.ok(!/private\/|objectKey|https?:/.test(JSON.stringify(first)));
 assert.equal((await fixture.request.get(`${fixture.backend.url}/api/v1/users/019a281e-0000-7000-8000-000000999999/card`,{headers:ownHeaders})).status(),404);
 console.log('Native privacy actual Bearer denied both known foreign and unknown media IDs');
 await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');await fill('Email',email);await fill('密碼',password);await tap('登入');await wait(email);await tap('個人資料與遊戲化身');await wait('暱稱');await tap('選擇化身');await tap('AI 客製化');await waitText('尚未上傳照片；仍可直接選擇免費化身。');
 assert.ok(!nodes().some(v=>visible(v)&&(/個人照片 [1-5]|查看對方|交換名片/.test(v['content-desc']??''))));
 const after=await fixture.send({op:'avatar-state'});assert.equal(after.providerCalls,0);assert.equal(after.assets.filter(v=>v.kind==='personal_photo'&&v.status==='ready').length,2);
 passed=true;
}catch(error){console.error(JSON.stringify({status:'failed',error:error.name,control:error.control??null,message:/Native|Expected|Android/.test(error.message??'')?error.message:'assertion-or-fixture-failure'}));process.exitCode=1;}
finally{try{await fixture.close();}catch{passed=false;process.exitCode=1;}}
if(passed){const result={status:'passed',executedAt:new Date().toISOString(),environment:'Android dedicated QA; actual API/Application/Miniflare D1/R2',checks:['valid-second-account-bearer','known-foreign-and-unknown-media-both-404','no-storage-key-or-url','no-public-card-route','actual-native-second-account-has-no-photo-or-opponent-entry','first-owner-two-photos-preserved'],providerCalls:0,scope:{accessibility:'excluded-D-051',ios:'deferred-D-052'}};fs.writeFileSync('.local/evidence/avatar-native-privacy.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
