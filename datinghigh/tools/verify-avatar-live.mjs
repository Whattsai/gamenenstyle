import fs from 'node:fs';
import assert from 'node:assert/strict';
import {register,api,waitReady} from '../tests/integration/local-fixture.mjs';

// 只限已知 localhost 平台。來源路徑從 stdin 取得，圖片／密碼／tokens 永不輸出或寫報告。
const input=JSON.parse(fs.readFileSync(0,'utf8'));
assert.equal(input.photoPaths?.length,2,'Two authorized source photos are required');
const candidateCount=input.candidateCount??4;assert.ok(Number.isInteger(candidateCount)&&candidateCount>=1&&candidateCount<=4);
await waitReady();
const account=await register('avatar-preferences');const access=account.tokens.accessToken;
const summary={environment:'local',transport:'native HTTP (not Android UI)',sources:2,uploads:0,generated:[],adopted:0,quotaVerified:false,deleted:0};
async function own(path,method='GET',body){const result=await api(path,method,body,access);return result;}
async function upload(path){
 if(!fs.existsSync(path))throw new Error('Authorized source photo is unavailable; update local input path');
 const bytes=fs.readFileSync(path);assert.ok(bytes.length<=8*1024*1024,'Authorized input exceeds 8 MiB');
 const mime=path.toLowerCase().endsWith('.png')?'image/png':'image/jpeg';
 const response=await fetch('http://localhost:8787/api/v1/me/photos',{method:'POST',headers:{'X-DatingHigh-Client':'android',Authorization:`Bearer ${access}`,'Content-Type':mime},body:bytes});
 const data=await response.json();return {status:response.status,body:data};
}
try{
 let current=await own('/me/dating-profile');assert.equal(current.status,200);
 for(const path of input.photoPaths){
  const result=await upload(path);assert.equal(result.status,201,result.body.code??'Photo upload failed');summary.uploads++;
  const image=await fetch(`http://localhost:8787/api/v1/me/media/${result.body.assetId}`,{headers:{'X-DatingHigh-Client':'android',Authorization:`Bearer ${access}`}});
  assert.equal(image.status,200);assert.equal(image.headers.get('cache-control'),'no-store');assert.equal(image.headers.get('x-content-type-options'),'nosniff');
  assert.ok((await image.arrayBuffer()).byteLength<=200000,'Source compression exceeded target');
 }
 const form={expectedRevision:1,nickname:'本地驗收',bio:'僅供本地功能驗證',occupation:'',birthDate:'1995-01-01',regionCode:'TW-TPE',traitTagIds:['warm'],interestTagIds:['handcraft','hiking'],topicTagIds:['creative_chat'],valueTagIds:['creativity'],weekendPreference:'explore',sleepSchedule:'night_owl',conversationStyle:'warm',expectedInteractionFrequency:'weekly',relationshipMode:'friends_first',preferredAgeMin:25,preferredAgeMax:35,preferredRegionCodes:['TW-TPE'],sharedInterestWeight:60};
 const save=await own('/me/dating-profile','PUT',form);assert.equal(save.status,200);let revision=save.body.revision;
 const free=await own('/me/avatar/selection','PUT',{type:'builtin',builtinAvatarId:'female-05',expectedRevision:revision});assert.equal(free.status,200);revision=free.body.revision;
 let attempt;
 if(input.exerciseGemini===true){
  for(let index=0;index<candidateCount;index++){
   const requestId=uuid7();const payload={styleId:'warm',clientRequestId:requestId,expectedProducedCount:index,...(attempt?{attemptId:attempt}:{})};
   const started=Date.now(),result=await own('/me/avatar/generations','POST',payload);
   assert.equal(result.status,200,result.body.code??'Provider generation failed');attempt=result.body.attemptId;
   assert.equal(result.body.index,index+1);assert.equal(result.body.producedCount,index+1);
   summary.generated.push({index:index+1,durationMs:Date.now()-started});
   const replay=await own('/me/avatar/generations','POST',payload);assert.equal(replay.status,200);assert.equal(replay.body.index,index+1);
   console.log(JSON.stringify({event:'candidate-verified',index:index+1,durationMs:summary.generated.at(-1).durationMs}));
  }
  if(candidateCount===4){const forbidden=await own('/me/avatar/generations','POST',{styleId:'warm',clientRequestId:uuid7(),expectedProducedCount:3,attemptId:attempt});assert.equal(forbidden.status,409);}
  const selected=await own('/me/avatar/selection','PUT',{type:'generated',attemptId:attempt,index:Math.min(2,candidateCount),expectedRevision:revision});assert.equal(selected.status,200);summary.adopted=1;
  const permanent=await fetch(`http://localhost:8787/api/v1/me/media/${selected.body.assetId}`,{headers:{'X-DatingHigh-Client':'android',Authorization:`Bearer ${access}`}});assert.equal(permanent.status,200);
  current=await own('/me/dating-profile');assert.equal(current.body.profileReady,true);
  const closed=await own('/me/avatar/generations','POST',{styleId:'warm',clientRequestId:uuid7(),expectedProducedCount:3,attemptId:attempt});assert.equal(closed.status,409);
 }
 for(let n=0;n<2;n++)assert.equal((await upload(input.photoPaths[n])).status,201);
 const final=await Promise.all([upload(input.photoPaths[0]),upload(input.photoPaths[1])]);
 assert.deepEqual(final.map(r=>r.status).sort(),[201,409]);summary.quotaVerified=true;
 const list=await own('/me/photos');assert.equal(list.body.photos.length,5);
 for(const photo of list.body.photos){assert.equal((await own(`/me/photos/${photo.assetId}`,'DELETE',{})).status,204);summary.deleted++;}
 assert.equal((await own('/me/photos')).body.photos.length,0);
 const preview=await own('/me/card-preview');assert.equal(preview.status,200);assert.equal(preview.body.birthDate,undefined);assert.equal(preview.body.preferredAgeMin,undefined);
 console.log(JSON.stringify({status:'passed',...summary}));
}finally{
 // 即使中途失敗，嘗試只清理本測試帳號的照片，再透過正式 API 撤銷自己的 family。
 try{const photos=await own('/me/photos');for(const photo of photos.body.photos??[])await own(`/me/photos/${photo.assetId}`,'DELETE',{});}catch{}
 await own('/session','DELETE',{refreshToken:account.tokens.refreshToken});
}
function uuid7(){const bytes=crypto.getRandomValues(new Uint8Array(16));let time=Date.now();for(let n=5;n>=0;n--){bytes[n]=time%256;time=Math.floor(time/256);}bytes[6]=(bytes[6]&15)|112;bytes[8]=(bytes[8]&63)|128;const h=Buffer.from(bytes).toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
