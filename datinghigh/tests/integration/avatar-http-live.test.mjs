import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {register,password,api,waitReady} from './local-fixture.mjs';

// 只對本專案已知default local做本人HTTP；憑證／Cookie／verification code只在RAM。
test('Avatar photo transport: true local Bearer/Cookie, binary limit, CSRF and private R2',async()=>{
 await waitReady();const owner=await register('avatar-transport');let native=owner.tokens,cookie;
 const base='http://localhost:8787/api/v1';
 const request=(url,method='GET',body,extra={})=>fetch(url,{method,headers:cookie?{'X-DatingHigh-Client':'web',Origin:'http://localhost:8081',Cookie:cookie,...extra}:{'X-DatingHigh-Client':'android',Authorization:`Bearer ${native.accessToken}`,...extra},body,signal:AbortSignal.timeout(45000)});
 async function json(response,status,code){assert.equal(response.status,status);assert.match(response.headers.get('Cache-Control')??'',/no-store/);const dto=await response.json();if(code){assert.equal(dto.code,code);assert.equal(dto.status,status);assert.equal(response.headers.get('Content-Type')?.split(';')[0],'application/problem+json');}return dto;}
 const image=fs.readFileSync('frontend/client/assets/avatars/male-01.jpg');assert.ok(image.length>16384&&image.length<=8*1024*1024);
 try{
  await json(await request(base+'/me/photos','POST',new Uint8Array(8*1024*1024+1),{'Content-Type':'image/jpeg'}),413,'IMAGE_TOO_LARGE');
  await json(await request(base+'/me/dating-profile','PUT',JSON.stringify({oversize:'x'.repeat(16385)}),{'Content-Type':'application/json'}),413,'REQUEST_TOO_LARGE');
  assert.equal((await json(await request(base+'/me/photos'),200)).photos.length,0);
  const signed=await fetch(base+'/sessions',{method:'POST',headers:{'X-DatingHigh-Client':'web',Origin:'http://localhost:8081','Content-Type':'application/json'},body:JSON.stringify({email:owner.email,password,clientPlatform:'web'}),signal:AbortSignal.timeout(45000)});assert.equal(signed.status,201);await signed.arrayBuffer();cookie=signed.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');assert.ok(cookie);native=undefined;
  await json(await request(base+'/me/photos','POST',image,{'Content-Type':'image/jpeg',Origin:'https://attacker.invalid'}),403,'ORIGIN_FORBIDDEN');
  assert.equal((await json(await request(base+'/me/photos'),200)).photos.length,0);
  const saved=await json(await request(base+'/me/photos','POST',image,{'Content-Type':'image/jpeg'}),201);assert.deepEqual(Object.keys(saved).sort(),['assetId','createdAt','displayOrder','mimeType']);assert.equal(saved.mimeType,'image/jpeg');
  const media=await request(base+'/me/media/'+saved.assetId);assert.equal(media.status,200);assert.match(media.headers.get('Cache-Control')??'',/no-store/);assert.equal(media.headers.get('X-Content-Type-Options'),'nosniff');const bytes=new Uint8Array(await media.arrayBuffer());assert.ok(bytes.length>0&&bytes.length<=200000);
  const catalog=await json(await request(base+'/profile-catalog'),200);assert.equal(catalog.version,'2026-11-05.v2');
  const readProfile=()=>request(base+'/me/dating-profile').then(r=>json(r,200));
  const own=await readProfile();assert.equal(own.gender,null);assert.deepEqual(own.romanticOrientation,[]);assert.deepEqual(own.cardVisibility,{});
  const form=Object.fromEntries(catalog.fields.filter(field=>field.type!=='photos').map(field=>[field.key,own[field.key]]));
  Object.assign(form,{nickname:'本地驗證',birthDate:'1995-01-01',gender:'female',romanticOrientation:['male'],cardVisibility:{nickname:false,occupation:false,personalPhotos:false}});
  const putProfile=revision=>request(base+'/me/dating-profile','PUT',JSON.stringify({...form,expectedRevision:revision}),{'Content-Type':'application/json'});
  const receipt=await json(await putProfile(own.revision),200),updated=await readProfile();
  assert.equal(updated.gender,'female');assert.deepEqual(updated.romanticOrientation,['male']);assert.deepEqual(updated.cardVisibility,form.cardVisibility);assert.equal(updated.profileReady,false);
  const card=await json(await request(base+'/me/card-preview'),200);
  for(const key of ['nickname','occupation','personalPhotos','gender','romanticOrientation','birthDate','preferredAgeMin'])assert.equal(Object.hasOwn(card,key),false);
  assert.equal(typeof card.ageBand,'string');
  const choose=(avatar,revision)=>request(base+'/me/avatar/selection','PUT',JSON.stringify({type:'builtin',builtinAvatarId:avatar,expectedRevision:revision}),{'Content-Type':'application/json'});
  await json(await choose('male-01',receipt.revision),400,'INVALID_AVATAR_SELECTION');
  const selected=await json(await choose('female-01',receipt.revision),200);assert.equal((await readProfile()).profileReady,true);
  form.gender='male';await json(await putProfile(selected.revision),200);
  const changed=await readProfile();assert.equal(changed.gender,'male');assert.equal(changed.selectedAvatarType,null);assert.equal(changed.selectedAvatarRef,null);assert.equal(changed.profileReady,false);
  form.nickname='不應寫入';await json(await putProfile(receipt.revision),409,'PROFILE_VERSION_CONFLICT');
  assert.deepEqual(await readProfile(),changed);
  const publicCommand=await fetch('http://localhost:8787/v1/commands/storage.object.put',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(45000)});assert.equal(publicCommand.status,404);await publicCommand.arrayBuffer();
  const result={status:'passed',executedAt:new Date().toISOString(),environment:'default local Worker/Linux Container/D1/private R2',checks:['native-bearer-8MiB-rejected','global-16KiB-json-retained','web-cookie-real-login','forged-origin-no-upload','binary-over16KiB-uploaded','safe-201-metadata','private-compressed-R2-read','public-command-rejected','profile-gender-visibility-roundtrip','closed-card-fields-absent','wrong-gender-builtin-rejected','gender-change-clears-builtin','stale-profile-has-no-partial-write'],limitations:['fictional image format fixture','HTTP platform modes do not prove native UI or iOS']};
  const removed=await request(base+'/me/photos/'+saved.assetId,'DELETE','{}',{'Content-Type':'application/json'});assert.equal(removed.status,204);await removed.arrayBuffer();await json(await request(base+'/me/media/'+saved.assetId),404,'PHOTO_NOT_FOUND');assert.equal((await json(await request(base+'/me/photos'),200)).photos.length,0);
  const loggedOut=await request(base+'/session','DELETE','{}',{'Content-Type':'application/json'});assert.equal(loggedOut.status,204);await loggedOut.arrayBuffer();cookie=undefined;fs.writeFileSync('.local/evidence/avatar-http-live.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{
  if(cookie){try{const r=await request(base+'/me/photos');if(r.status===200)for(const photo of (await r.json()).photos){const removed=await request(base+'/me/photos/'+photo.assetId,'DELETE','{}',{'Content-Type':'application/json'});await removed.arrayBuffer();}const loggedOut=await request(base+'/session','DELETE','{}',{'Content-Type':'application/json'});await loggedOut.arrayBuffer();}catch{throw new Error('Own live transport fixture cleanup was not confirmed');}}
  else if(native)await api('/session','DELETE',{refreshToken:native.refreshToken},native.accessToken);
 }
});
