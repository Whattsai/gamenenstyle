import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {randomFillSync} from 'node:crypto';import {deflateSync} from 'node:zlib';
import {createFixture,openScreen,login,waitText} from './fixture.mjs';
import {invoke,nodes,visible,tap,wait,fill} from './support.mjs';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
assert.ok(process.env.DATINGHIGH_ANDROID_DEVICE,'Select the project QA emulator explicitly');
assert.ok(['DatingHighQA','DatingHighQA31'].includes(invoke('shell','getprop','ro.boot.qemu.avd_name').trim()));
const cases=process.env.DATINGHIGH_AVATAR_MANAGED_CASE?[process.env.DATINGHIGH_AVATAR_MANAGED_CASE]:['photos','profile'];assert.ok(cases.every(value=>['photos','profile'].includes(value)));
async function reveal(label,direction='down'){
 for(let attempt=0;attempt<32;attempt++){
  const all=nodes(),editable=['暱稱','工作／職業','生日','偏好最小年齡','偏好最大年齡'].includes(label);if(all.some(node=>visible(node)&&(editable?node.class==='android.widget.EditText'&&node['content-desc']===label:node['content-desc']===label||node.text===label)))return;
  const box=all.find(node=>node.scrollable==='true'&&visible(node));assert.ok(box,'Visible native scroll container');
  const [l,t,r,b]=box.bounds.match(/-?\d+/g).map(Number),x=String(Math.round((l+r)/2)),high=String(Math.round(t+(b-t)*.2)),low=String(Math.round(t+(b-t)*.8));
  invoke('shell','input','swipe',x,direction==='down'?low:high,x,direction==='down'?high:low,'550');await sleep(450);
 }throw Object.assign(new Error('Native control not reachable'),{control:label});
}
const directory='/sdcard/Pictures/DatingHighQA',bigName='qa-avatar-managed-oversize.png',smallName='qa-avatar-managed-valid.jpg';
const ownedNames=[bigName,smallName,'qa-photo-01.jpg','qa-photo-02.jpg','qa-photo-03.jpg'];
function cleanGallery(){
 const listed=invoke('shell','content','query','--uri','content://media/external/images/media','--projection','_id:_display_name:_data');
 for(const match of listed.matchAll(/\b_id=(\d+), _display_name=([^,]+), _data=([^\r\n]+)/g))if(ownedNames.includes(match[2])&&match[3].includes('/Pictures/DatingHighQA/')&&match[3].endsWith('/'+match[2]))invoke('shell','content','delete','--uri',`content://media/external/images/media/${match[1]}`);
 for(const name of ownedNames)invoke('shell','rm','-f',`${directory}/${name}`);
}
const bigPath=path.resolve('.local/evidence/qa-avatar-managed-oversize.png');
function largeSyntheticPicture(){
 const size=3072,stride=size*3+1,pixels=Buffer.alloc(stride*size);randomFillSync(pixels);for(let n=0;n<size;n++)pixels[n*stride]=0;
 const crc=bytes=>{let value=0xffffffff;for(const byte of bytes){value^=byte;for(let bit=0;bit<8;bit++)value=value>>>1^((value&1)?0xedb88320:0);}return(value^0xffffffff)>>>0;};
 const chunk=(name,data)=>{const type=Buffer.from(name),length=Buffer.alloc(4),sum=Buffer.alloc(4);length.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([length,type,data,sum]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=2;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels,{level:0})),chunk('IEND',Buffer.alloc(0))]);assert.ok(png.length>8*1024*1024);fs.writeFileSync(bigPath,png);
}
async function pick(kind){
 cleanGallery();invoke('shell','mkdir','-p',directory);const name=kind==='large'?bigName:smallName;
 invoke('push',kind==='large'?bigPath:path.resolve('frontend/client/assets/avatars/male-04.jpg'),`${directory}/${name}`);
 invoke('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d',`file://${directory}/${name}`);
 await reveal('新增個人照片');await tap('新增個人照片');const end=Date.now()+35000;
 while(Date.now()<end){const all=nodes();const target=all.find(node=>visible(node)&&((node.text??'').includes(name)||(node['content-desc']??'').includes(name)))??all.find(node=>visible(node)&&/Photo taken|照片拍攝|照片，|Image,/.test(node['content-desc']??'')&&/providers.media|photopicker|documentsui/.test(node.package??''));if(target){const [l,t,r,b]=target.bounds.match(/-?\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round((t+b)/2)));return;}await sleep(500);}
 throw new Error('Prepared synthetic image was not exposed by native picker');
}
async function setField(label,value){
 console.log(`Native input editing: ${label}`);await wait(label);const existing=nodes().find(n=>visible(n)&&n['content-desc']===label&&n.class==='android.widget.EditText');assert.ok(existing,`Native input is visible: ${label}`);const [l,t,r,b]=existing.bounds.match(/-?\d+/g).map(Number);
 invoke('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round((t+b)/2)));await sleep(400);invoke('shell','input','keyevent','123');invoke('shell','input','keyevent',...Array(Math.min((existing.text??'').length+2,128)).fill('67'));await sleep(350);
 for(let n=0;n<value.length;n+=4){invoke('shell','input','text',value.slice(n,n+4).replaceAll(' ','%s'));await sleep(150);}invoke('shell','input','keyevent','111');await sleep(500);
 const observed=nodes().find(n=>n['content-desc']===label&&n.class==='android.widget.EditText');assert.equal(observed?.text??'',value,`Native edited field matches requested value: ${label}`);
}

const fixture=await createFixture({avatarProfile:true});const results=[];let succeeded=false;
const state=()=>fixture.send({op:'avatar-state'});
const readyPhotos=value=>value.assets.filter(asset=>asset.kind==='personal_photo'&&asset.status==='ready').sort((a,b)=>a.display_order-b.display_order).map(asset=>asset.asset_id);
async function closeIfModal(){if(nodes().some(n=>visible(n)&&n['content-desc']==='關閉'))await tap('關閉');}
async function openPhotoModal(){if(!nodes().some(n=>visible(n)&&n['content-desc']==='關閉')){await reveal('選擇化身','up');await tap('選擇化身');}await tap('AI 客製化');}
async function profileTop(){await closeIfModal();await reveal('重新整理目前資料','up');}
async function preview(){await closeIfModal();await reveal('預覽同意後的名片','up');await tap('預覽同意後的名片');await waitText('這是你自己的預覽，尚未授權其他玩家查看');}
try{
 if(cases.includes('photos'))largeSyntheticPicture();
 for(const mode of cases){
  console.log(`Native managed case starting: ${mode}`);await fixture.reset('local');await openScreen('login');await login('A real D1 integration password');console.log('Native managed login completed');await fixture.send({op:'avatar-seed-photos'});await fixture.send({op:'avatar-revision'});
  await tap('個人資料與遊戲化身');await wait('暱稱');
  if(mode==='photos'){
   await openPhotoModal();console.log('Native photo manager opened');await pick('large');console.log('Native oversize image selected');await waitText('照片超過 8 MiB，請選擇較小的圖片');assert.equal(readyPhotos(await state()).length,2);console.log('Native oversize picker rejected without adding a photo');
   await pick('small');await waitText('照片已壓縮並安全儲存');let before=await state();const ids=readyPhotos(before);assert.equal(ids.length,3);
   console.log('Native valid retry saved three photos');await fixture.send({op:'avatar-revision'});await openPhotoModal();await reveal('照片 3 往前移');await tap('照片 3 往前移');await waitText('資料已在其他地方更新，請重新整理後再修改');assert.deepEqual(readyPhotos(await state()),ids);
   await profileTop();await tap('重新整理目前資料');await openPhotoModal();await reveal('照片 3 往前移');await tap('照片 3 往前移');await waitText('照片順序已更新');assert.deepEqual(readyPhotos(await state()),[ids[0],ids[2],ids[1]]);
   await openPhotoModal();await reveal('刪除照片 2');await tap('刪除照片 2');await tap('取消');assert.equal(readyPhotos(await state()).length,3);
   await tap('刪除照片 2');await tap('確認刪除');await waitText('照片已刪除');assert.equal(readyPhotos(await state()).length,2);console.log('Native stale revision, refreshed reorder and delete confirmation verified');
   await fixture.send({op:'avatar-seed-photos',count:2});await profileTop();await tap('重新整理目前資料');await openPhotoModal();await pick('small');await waitText('照片已壓縮並安全儲存');assert.equal(readyPhotos(await state()).length,5);
   await reveal('新增個人照片');assert.equal((await wait('新增個人照片')).enabled,'false');
   await openPhotoModal();await reveal('刪除照片 1');await tap('刪除照片 1');await tap('確認刪除');await waitText('照片已刪除');await pick('small');await waitText('照片已壓縮並安全儲存');assert.equal(readyPhotos(await state()).length,5);
   results.push({mode,passed:true,checks:['real-picker-oversize-rejection','valid-retry','stale-revision-no-overwrite','refreshed-reorder','delete-cancel-confirm','five-photo-limit-and-slot-reuse']});
  }else{
   await setField('暱稱','QaForm');await reveal('工作／職業');await setField('工作／職業','Engineer');await reveal('生日');await setField('生日','1995-01-01');await tap('儲存目前修改');await waitText('個人資料已儲存');
   console.log('Native profile saved adult occupation');await preview();console.log('Native own card opened');await reveal('Engineer');await wait('Engineer');await reveal('名片照片 1');await wait('名片照片 1');await reveal('名片照片 2');await wait('名片照片 2');
   await profileTop();await reveal('生日');await setField('生日','2015-01-01');const before=await state();console.log('Native underage input confirmed');await tap('儲存目前修改');await waitText('需年滿 18 歲才能完成個人資料，請確認生日');assert.equal((await state()).profiles[0].revision,before.profiles[0].revision);console.log('Native underage feedback verified');
   await setField('生日','1995-01-01');await reveal('偏好最小年齡');await setField('偏好最小年齡','25');await tap('儲存目前修改');await waitText('年齡偏好的最小與最大值請一起填寫，或一起留空');
   await reveal('偏好最大年齡');await setField('偏好最大年齡','20');await tap('儲存目前修改');await waitText('年齡偏好須為 18 至 120 歲，且最小不大於最大');
   await setField('偏好最大年齡','35');await tap('儲存目前修改');await waitText('個人資料已儲存');
   console.log('Native paired age validation verified');await profileTop();await reveal('解謎');await tap('解謎');await fixture.send({op:'avatar-retire-choice'});const revision=(await state()).profiles[0].revision;await tap('儲存目前修改');await waitText('請確認生日、文字長度、標籤與配對條件');assert.equal((await state()).profiles[0].revision,revision);
   await tap('解謎');await reveal('工作／職業','up');await setField('工作／職業','');await tap('儲存目前修改');await waitText('個人資料已儲存');assert.equal((await state()).profiles[0].occupation,null);
   await preview();assert.ok(!nodes().some(node=>visible(node)&&node.text==='Engineer'));await reveal('名片照片 1');await wait('名片照片 1');
   await profileTop();await reveal('返回帳號','up');await tap('返回帳號');await tap('登出');await wait('使用 Email 登入');await tap('使用 Email 登入');await login('A real D1 integration password');await tap('個人資料與遊戲化身');await wait('暱稱');
   assert.ok(nodes().some(node=>node['content-desc']==='暱稱'&&node.text==='QaForm'));await reveal('工作／職業');assert.ok(nodes().some(node=>node['content-desc']==='工作／職業'&&!node.text));await openPhotoModal();await reveal('個人照片 2');await wait('個人照片 2');
   results.push({mode,passed:true,checks:['adult-and-paired-age-errors','retired-choice-api-rejection','null-occupation','current-own-card-two-photos','actual-native-relogin-persistence']});
  }
  assert.equal((await state()).providerCalls,0);console.log(`Native managed case passed: ${mode}`);
 }
 succeeded=true;
}catch(error){try{const all=nodes();console.error(JSON.stringify({knownNotices:['個人資料已儲存','暱稱須為 2 至 12 個字','生日請填寫有效日期（YYYY-MM-DD），且不可晚於今天','需年滿 18 歲才能完成個人資料，請確認生日','請確認生日、文字長度、標籤與配對條件'].filter(t=>all.some(n=>n.text?.includes(t)||n['content-desc']?.includes(t)))}));}catch{}console.error(JSON.stringify({status:'failed',case:cases[results.length],control:error.control??null,error:error.name,message:/Native|Expected|Android|picker|Input exists/.test(error.message??'')?error.message:'assertion-or-fixture-failure'}));process.exitCode=1;}
finally{
 try{cleanGallery();if(fs.existsSync(bigPath))fs.unlinkSync(bigPath);}catch{process.exitCode=1;succeeded=false;console.error(JSON.stringify({galleryCleanupIncomplete:true}));}
 try{await fixture.close();}catch{process.exitCode=1;succeeded=false;console.error(JSON.stringify({fixtureCleanupIncomplete:true}));}
}
if(succeeded){const result={status:'passed',executedAt:new Date().toISOString(),environment:'Android dedicated QA; isolated actual API/Application/Miniflare D1/R2',providerCalls:0,cases:results,scope:{accessibility:'excluded-D-051',ios:'deferred-D-052'}};fs.writeFileSync(`.local/evidence/avatar-native-managed${process.env.DATINGHIGH_AVATAR_MANAGED_CASE?'-'+process.env.DATINGHIGH_AVATAR_MANAGED_CASE:''}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
