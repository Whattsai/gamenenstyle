import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {register,api,waitReady,password} from './local-fixture.mjs';

function existingFixtureEmails(){
 // 只能經既有default local wrapper讀固定無秘密view，整份結果只在RAM；不讀其他專案／remote。
 const output=execFileSync(process.execPath,['tools/local.mjs','query','--view','accounts'],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
 const start=output.indexOf('[\n');assert.ok(start>=0,'Local wrapper returned structured non-secret view');
 const rows=JSON.parse(output.slice(start)).flatMap(result=>result.results??[]);
 return [0,1,2].map(n=>{
  const allowed=new RegExp(`^live-matching-${n}-[0-9]+@example\\.com$`);
  const matches=rows.filter(r=>allowed.test(r.email_normalized)&&r.status==='active').sort((a,b)=>b.email_normalized.localeCompare(a.email_normalized));
  assert.ok(matches.length,'This run has an existing synthetic matching fixture');return matches[0].email_normalized;
 });
}

// 真 local Worker／Linux Container／D1，憑證與驗證碼僅在記憶體，不寫證據或日誌。
test('MatchingSessions live: three actual accounts, safe ranking, explicit consent and persistent exclusive room',async()=>{
 await waitReady();const people=[];
 const fields=JSON.parse(readFileSync(new URL('../../contracts/profile-fields.json',import.meta.url),'utf8'));
 const req=(person,path,method='GET',body)=>api(path,method,body,person.tokens.accessToken);
 const existing=process.env.DATINGHIGH_MATCHING_LIVE_REUSE==='1'?existingFixtureEmails():null;
 try{
 for(let n=0;n<3;n++){
  const login=existing?await api('/sessions','POST',{email:existing[n],password,clientPlatform:'android'}):null;
  if(login)assert.equal(login.status,201,'Only this module synthetic fixture can be reused');
  const person=existing?{email:existing[n],...login.body}:await register('matching-'+n);people.push(person);
  const own=await req(person,'/me/dating-profile');assert.equal(own.status,200);
  const payload=Object.fromEntries(fields.filter(f=>f.type!=='photos').map(f=>[f.key,own.body[f.key]]));
  const saved=await req(person,'/me/dating-profile','PUT',{...payload,cardVisibility:{},expectedRevision:own.body.revision,nickname:`實測旅人${n}`,birthDate:'1990-01-01',gender:'diverse',romanticOrientation:['diverse'],interestTagIds:['coffee'],weekendPreference:'explore'});assert.equal(saved.status,200,saved.body?.code);
  assert.equal((await req(person,'/me/avatar/selection','PUT',{type:'builtin',builtinAvatarId:'male-01',expectedRevision:saved.body.revision})).status,200);
 }
  const searches=await Promise.all(people.map(p=>req(p,'/match-candidates/search','POST',{offset:0,limit:20})));
  for(const search of searches){assert.equal(search.status,200);assert.ok(search.headers.get('cache-control')?.includes('no-store'));}
  const candidates=[];
  for(let n=0;n<3;n++){
   const targetName=`實測旅人${(n+1)%3}`;let found;
   for(const item of searches[n].body.items){const card=await req(people[n],'/match-candidates/'+item.candidateId);assert.equal(card.status,200);for(const forbidden of ['birthDate','romanticOrientation','occupation','email','objectKey','preferredAgeMin'])assert.ok(!JSON.stringify(card.body).includes(forbidden));if(card.body.persona.nickname===targetName)found=card.body;}
   assert.ok(found,'Actual other player is discoverable');candidates.push(found.candidateId);
  }
  function matchingRequestId(){const bytes=randomBytes(16);let time=Date.now();for(let i=5;i>=0;i--){bytes[i]=time%256;time=Math.floor(time/256);}bytes[6]=(bytes[6]&15)|112;bytes[8]=(bytes[8]&63)|128;const hex=bytes.toString('hex');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
  const prior=await req(people[2],'/match-invitations','POST',{candidateId:candidates[2],clientRequestId:matchingRequestId()});assert.equal(prior.status,201);
  const invite=await req(people[0],'/match-invitations','POST',{candidateId:candidates[0],clientRequestId:matchingRequestId()});assert.equal(invite.status,201);
  assert.equal((await req(people[0],'/game-rounds')).body.items.length,0);
  const accept=await req(people[1],`/match-invitations/${invite.body.invitationId}/accept`,'POST',{});assert.equal(accept.status,200);
  for(const p of people.slice(0,2)){
   const rounds=await req(p,'/game-rounds');assert.equal(rounds.status,200);assert.equal(rounds.body.items.length,1);assert.equal(rounds.body.items[0].roundId,accept.body.roundId);
  }
  assert.equal((await req(people[2],'/game-rounds/'+accept.body.roundId)).status,403);
  const third=await req(people[2],'/match-invitations');assert.equal(third.status,200);assert.equal(third.body.outgoing.find(i=>i.invitationId===prior.body.invitationId).invalidatedReason,'other_round_started');
 }finally{
  for(const person of people)assert.equal((await req(person,'/session','DELETE',{refreshToken:person.tokens.refreshToken})).status,204);
 }
});
