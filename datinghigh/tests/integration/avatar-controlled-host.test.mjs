import {test} from 'node:test';import assert from 'node:assert/strict';
import {request} from '@playwright/test';
import {startBackend,stopBackend,control} from '../e2e/web/backend.ts';

// 真HTTP／Application／Miniflare D1與R2；明選的供應商替身只供故障驗證，不呼叫Gemini。
test('Controlled native avatar host keeps earlier real R2 candidates through provider failures and request replay',async()=>{
 const backend=await startBackend({DATINGHIGH_E2E_AVATAR_PROFILE:'1'});const http=await request.newContext();let serial=100;
 const id=()=>`019a281e-0000-7000-8000-${String(serial++).padStart(12,'0')}`;
 const results=[];
 try{
  for(const priorCount of [1,2])for(const [mode,status,code] of [['unavailable',503,'IMAGE_PROVIDER_UNAVAILABLE'],['no-image',503,'IMAGE_PROVIDER_NO_IMAGE'],['rate-limited',429,'RATE_LIMITED'],['uncertain',503,'IMAGE_PROVIDER_UNCERTAIN'],['duplicate',409,'AVATAR_DUPLICATE_IMAGE']]){
   await control(backend,http,{op:'reset',accountKind:'local'});
   const login=await http.post(backend.url+'/api/v1/sessions',{headers:{'X-DatingHigh-Client':'android'},data:{email:'owner@example.com',password:'A real D1 integration password',clientPlatform:'android'}});assert.equal(login.status(),201);
   const credentials=await login.json(),headers={'X-DatingHigh-Client':'android',Authorization:`Bearer ${credentials.tokens.accessToken}`};
   assert.equal((await control(backend,http,{op:'avatar-seed-photos'})).count,2);
   assert.equal((await http.put(backend.url+'/api/v1/me/avatar/selection',{headers,data:{type:'builtin',builtinAvatarId:'male-03',expectedRevision:1}})).status(),200);
   let attemptId;
   for(let index=0;index<priorCount;index++){
    const response=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:{styleId:'warm',clientRequestId:id(),expectedProducedCount:index,...(attemptId?{attemptId}:{})}});assert.equal(response.status(),200);
    const value=await response.json();assert.equal(value.producedCount,index+1);attemptId=value.attemptId;
   }
   await control(backend,http,{op:'avatar-mode',mode});const failedId=id();
   const payload={styleId:'warm',attemptId,clientRequestId:failedId,expectedProducedCount:priorCount};
   const failed=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:payload});assert.equal(failed.status(),status);assert.equal((await failed.json()).code,code);
   const read=await http.get(backend.url+'/api/v1/me/dating-profile',{headers});assert.equal(read.status(),200);const profile=await read.json();
   assert.equal(profile.selectedAvatarRef,'male-03');assert.equal(profile.generatedAvatars.length,0);assert.equal(profile.avatarAttempt.producedCount,priorCount);assert.equal(profile.avatarAttempt.status,mode==='uncertain'?'uncertain':'open');
   for(const index of Array.from({length:priorCount},(_,n)=>n+1)){const image=await http.get(`${backend.url}/api/v1/me/avatar/candidates/${attemptId}/${index}`,{headers});assert.equal(image.status(),200);assert.ok((await image.body()).length>0);}
   assert.equal((await http.get(`${backend.url}/api/v1/me/avatar/candidates/${attemptId}/${priorCount+1}`,{headers})).status(),404);
   const replay=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:payload});assert.equal(replay.status(),409);
   const state=await control(backend,http,{op:'avatar-state'});assert.equal(state.providerCalls,priorCount+1);assert.equal(state.assets.filter(asset=>asset.kind==='generated_avatar').length,0);
   const retry=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:{...payload,clientRequestId:id()}});assert.equal(retry.status(),mode==='uncertain'?409:200);
   const after=await control(backend,http,{op:'avatar-state'});assert.equal(after.providerCalls,mode==='uncertain'?priorCount+1:priorCount+2);
   assert.equal((await http.delete(backend.url+'/api/v1/session',{headers,data:{refreshToken:credentials.tokens.refreshToken}})).status(),204);
   results.push({mode,status,priorCandidates:priorCount,providerCalls:after.providerCalls});
  }
  console.log(JSON.stringify({scope:'controlled provider; real HTTP/Application/D1/R2',checks:results}));
 }finally{await stopBackend(backend,http);await http.dispose();}
});

// 單張即採用／三張回選第二張／正式資產重選都走同一真HTTP、D1、R2鏈。
test('Controlled adoption creates only the selected real image and reselects saved media without provider calls',async()=>{
 const backend=await startBackend({DATINGHIGH_E2E_AVATAR_PROFILE:'1'});const http=await request.newContext();let serial=700;
 const id=()=>`019a281e-0000-7000-8000-${String(serial++).padStart(12,'0')}`;
 try{
  for(const total of [1,3]){
   await control(backend,http,{op:'reset',accountKind:'local'});
   const login=await http.post(backend.url+'/api/v1/sessions',{headers:{'X-DatingHigh-Client':'android'},data:{email:'owner@example.com',password:'A real D1 integration password',clientPlatform:'android'}});assert.equal(login.status(),201);
   const credentials=await login.json(),headers={'X-DatingHigh-Client':'android',Authorization:`Bearer ${credentials.tokens.accessToken}`};
   await control(backend,http,{op:'avatar-seed-photos'});await control(backend,http,{op:'avatar-revision'});
   let attemptId;const images=[];
   for(let n=0;n<total;n++){
    const response=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:{styleId:'warm',clientRequestId:id(),expectedProducedCount:n,...(attemptId?{attemptId}:{})}});assert.equal(response.status(),200);
    const value=await response.json();attemptId=value.attemptId;assert.equal(value.index,n+1);assert.equal(value.producedCount,n+1);assert.equal(value.maxCandidates,4);
    const image=await http.get(`${backend.url}/api/v1/me/avatar/candidates/${attemptId}/${n+1}`,{headers});assert.equal(image.status(),200);images.push(await image.body());
    const state=await control(backend,http,{op:'avatar-state'});assert.equal(state.providerCalls,n+1);assert.equal(state.profiles[0].selected_avatar_ref,'female-07');assert.equal(state.assets.filter(a=>a.kind==='generated_avatar').length,0);
   }
   const index=total===1?1:2,payload={type:'generated',attemptId,index,expectedRevision:2};
   const adoption=await http.put(backend.url+'/api/v1/me/avatar/selection',{headers,data:payload});assert.equal(adoption.status(),200);const receipt=await adoption.json();assert.equal(receipt.revision,3);
   const replay=await http.put(backend.url+'/api/v1/me/avatar/selection',{headers,data:payload});assert.equal(replay.status(),200);assert.deepEqual(await replay.json(),receipt);
   const state=await control(backend,http,{op:'avatar-state'});assert.equal(state.providerCalls,total);const formal=state.assets.filter(a=>a.kind==='generated_avatar');assert.equal(formal.length,1);assert.equal(formal[0].status,'ready');assert.equal(state.profiles[0].revision,3);
   const saved=await http.get(backend.url+'/api/v1/me/dating-profile',{headers});const profile=await saved.json();assert.equal(profile.generatedAvatars.length,1);assert.equal(profile.selectedAvatarRef,formal[0].asset_id);assert.equal(profile.avatarAttempt,null);
   const asset=await http.get(`${backend.url}/api/v1/me/media/${formal[0].asset_id}`,{headers});assert.equal(asset.status(),200);assert.deepEqual(await asset.body(),images[index-1]);
   assert.equal((await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:{styleId:'warm',attemptId,clientRequestId:id(),expectedProducedCount:total}})).status(),409);
   assert.equal((await http.put(backend.url+'/api/v1/me/avatar/selection',{headers,data:{type:'builtin',builtinAvatarId:'male-03',expectedRevision:3}})).status(),200);
   assert.equal((await http.put(backend.url+'/api/v1/me/avatar/selection',{headers,data:{type:'generated',assetId:formal[0].asset_id,expectedRevision:4}})).status(),200);
   const after=await control(backend,http,{op:'avatar-state'});assert.equal(after.providerCalls,total);assert.equal(after.assets.filter(a=>a.kind==='generated_avatar').length,1);assert.equal(after.profiles[0].revision,5);assert.equal(after.profiles[0].selected_avatar_ref,formal[0].asset_id);
   assert.equal((await http.delete(backend.url+'/api/v1/session',{headers,data:{refreshToken:credentials.tokens.refreshToken}})).status(),204);
  }
 }finally{await stopBackend(backend,http);await http.dispose();}
});

test('Controlled host rejects insufficient photos and starts a fresh explicit round after expiry without reviving old candidates',async()=>{
 const backend=await startBackend({DATINGHIGH_E2E_AVATAR_PROFILE:'1'});const http=await request.newContext();let serial=900;
 const id=()=>`019a281e-0000-7000-8000-${String(serial++).padStart(12,'0')}`;
 const login=async()=>{const response=await http.post(backend.url+'/api/v1/sessions',{headers:{'X-DatingHigh-Client':'android'},data:{email:'owner@example.com',password:'A real D1 integration password',clientPlatform:'android'}});assert.equal(response.status(),201);const data=await response.json();return {'X-DatingHigh-Client':'android',Authorization:`Bearer ${data.tokens.accessToken}`};};
 try{
  for(const count of [0,1]){
   await control(backend,http,{op:'reset',accountKind:'local'});const headers=await login();if(count)await control(backend,http,{op:'avatar-seed-photos',count});
   await http.get(backend.url+'/api/v1/me/dating-profile',{headers});assert.equal((await http.put(backend.url+'/api/v1/me/avatar/selection',{headers,data:{type:'builtin',builtinAvatarId:'male-03',expectedRevision:1}})).status(),200);
   const before=await control(backend,http,{op:'avatar-state'}),failed=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:{styleId:'warm',clientRequestId:id(),expectedProducedCount:0}});
   assert.equal(failed.status(),400);assert.equal((await failed.json()).code,'AVATAR_PHOTOS_REQUIRED');assert.deepEqual(await control(backend,http,{op:'avatar-state'}),before);
  }
  await control(backend,http,{op:'reset',accountKind:'local'});let headers=await login();await control(backend,http,{op:'avatar-seed-photos'});await control(backend,http,{op:'avatar-revision'});
  const payload={styleId:'warm',clientRequestId:id(),expectedProducedCount:0};const firstResponse=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:payload});assert.equal(firstResponse.status(),200);const first=await firstResponse.json();
  assert.equal((await http.get(`${backend.url}/api/v1/me/avatar/candidates/${first.attemptId}/1`,{headers})).status(),200);
  for(const milliseconds of [1800000,1800000,1])await control(backend,http,{op:'advance',milliseconds});headers=await login();
  assert.equal((await http.get(`${backend.url}/api/v1/me/avatar/candidates/${first.attemptId}/1`,{headers})).status(),410);
  const old=await control(backend,http,{op:'avatar-state'});assert.equal(old.providerCalls,1);assert.equal(old.assets.filter(a=>a.kind==='generated_avatar').length,0);assert.equal(old.profiles[0].selected_avatar_ref,'female-07');
  const secondResponse=await http.post(backend.url+'/api/v1/me/avatar/generations',{headers,data:{...payload,clientRequestId:id()}});assert.equal(secondResponse.status(),200);const second=await secondResponse.json();assert.notEqual(first.attemptId,second.attemptId);assert.equal(second.producedCount,1);assert.equal(second.index,1);assert.ok(second.expiresAt>first.expiresAt);
  const after=await control(backend,http,{op:'avatar-state'});assert.equal(after.providerCalls,2);assert.equal(after.assets.filter(a=>a.kind==='generated_avatar').length,0);assert.equal(after.profiles[0].selected_avatar_ref,'female-07');
  assert.equal((await http.get(`${backend.url}/api/v1/me/avatar/candidates/${first.attemptId}/1`,{headers})).status(),410);
  assert.equal((await http.get(`${backend.url}/api/v1/me/avatar/candidates/${second.attemptId}/1`,{headers})).status(),200);
 }finally{await stopBackend(backend,http);await http.dispose();}
});
