import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {register,api,waitReady} from './local-fixture.mjs';

const id=()=>{const b=randomBytes(16);let time=Date.now();for(let i=5;i>=0;i--){b[i]=time%256;time=Math.floor(time/256);}b[6]=(b[6]&15)|112;b[8]=(b[8]&63)|128;const h=b.toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function connection(person,roundId){
 const deviceId=id(),ticket=await api(`/game-rounds/${roundId}/realtime-ticket`,'POST',{deviceId},person.tokens.accessToken);assert.equal(ticket.status,200,ticket.body?.code);
 const ws=new WebSocket(`ws://localhost:8787/api/v1/game-rounds/${roundId}/ws`,['datinghigh.v1',`ticket.${ticket.body.ticket}`,`device.${deviceId}`]);const frames=[];
 ws.onmessage=event=>{try{frames.push(JSON.parse(event.data));}catch{}};
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Live WebSocket handshake timeout')),45000);ws.onopen=()=>{clearTimeout(timeout);resolve();};ws.onerror=()=>{clearTimeout(timeout);reject(new Error('Live WebSocket handshake failed'));};});
 async function wait(type,requestId){const end=Date.now()+45000;while(Date.now()<end){const frame=frames.find(f=>f.type===type&&(!requestId||f.clientRequestId===requestId));if(frame)return frame;const failure=frames.find(f=>f.type==='command.error'&&f.clientRequestId===requestId);if(failure)throw new Error(`Live command rejected: ${failure.payload?.code}`);await sleep(50);}throw new Error('Live frame timeout');}
 return {ws,wait,async send(type,payload,request=id()){ws.send(JSON.stringify({version:1,type,roundId,clientRequestId:request,payload}));return wait('command.ack',request);}};
}
test('Story live: actual Worker/Container/Room DO/D1/R2, pinned first story, bidirectional idempotent chat and safe end',{timeout:240000},async()=>{
 await waitReady();const people=[],sockets=[];const suffix=String(Date.now()).slice(-4),names=[`雨聲甲${suffix}`,`雨聲乙${suffix}`];
 const req=(person,path,method='GET',body)=>api(path,method,body,person.tokens.accessToken);
 const fields=JSON.parse(readFileSync(new URL('../../contracts/profile-fields.json',import.meta.url),'utf8'));
 const metrics={environment:'default local Worker/Linux Container/Room DO/D1/separate R2',checks:[],eventCreatedToPeerReadMilliseconds:0,ackToPeerReadMilliseconds:0};
 try{
  for(let n=0;n<2;n++){
   const person=await register(`story-${n}`,randomBytes(24).toString('base64'));people.push(person);
   const own=await req(person,'/me/dating-profile');assert.equal(own.status,200);const form=Object.fromEntries(fields.filter(f=>f.type!=='photos').map(f=>[f.key,own.body[f.key]]));
   const saved=await req(person,'/me/dating-profile','PUT',{...form,expectedRevision:own.body.revision,cardVisibility:{},nickname:names[n],birthDate:'1990-01-01',gender:'diverse',romanticOrientation:['diverse'],interestTagIds:['reading']});assert.equal(saved.status,200,saved.body?.code);
   assert.equal((await req(person,'/me/avatar/selection','PUT',{type:'builtin',builtinAvatarId:`male-0${n+1}`,expectedRevision:saved.body.revision})).status,200);
  }
  let candidate,offset=0;
  for(let page=0;page<10&&!candidate;page++){
   const search=await req(people[0],'/match-candidates/search','POST',{offset,limit:20});assert.equal(search.status,200);
   for(const item of search.body.items){const card=await req(people[0],'/match-candidates/'+item.candidateId);if(card.body?.persona?.nickname===names[1]){candidate=item.candidateId;break;}}
   if(search.body.nextOffset===null)break;offset=search.body.nextOffset;
  }assert.ok(candidate,'Fresh real partner is recommended across bounded pages');
  const invite=await req(people[0],'/match-invitations','POST',{candidateId:candidate,clientRequestId:id()});assert.equal(invite.status,201);
  const accepted=await req(people[1],`/match-invitations/${invite.body.invitationId}/accept`,'POST',{});assert.equal(accepted.status,200,accepted.body?.code);const round=accepted.body.roundId;
  const experience=await req(people[0],`/game-rounds/${round}/experience`);assert.equal(experience.status,200,experience.body?.code);assert.equal(experience.body.storyId,'scene-01');assert.equal(experience.body.episodeSeq,1);assert.equal(experience.body.phase,'playing');
  for(const asset of experience.body.assets){const response=await fetch('http://localhost:8787'+asset.url);assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,asset.byteLength);}metrics.checks.push('pinned-scene-and-real-separate-r2-assets');
  for(const person of people)sockets.push(await connection(person,round));const request=id();const ack=await sockets[0].send('message.send',{text:'Live committed first message'},request);const ackAt=Date.now();await sockets[0].send('message.send',{text:'Live committed first message'},request);await sockets[1].wait('room.snapshot_hint');
  const history=await req(people[1],`/game-rounds/${round}/events/query`,'POST',{afterSeq:0,limit:100});assert.equal(history.status,200);const messages=history.body.events.filter(e=>e.type==='message.committed');assert.equal(messages.length,1);assert.equal(messages[0].eventSeq,ack.eventSeq);metrics.eventCreatedToPeerReadMilliseconds=Date.now()-messages[0].createdAt;metrics.ackToPeerReadMilliseconds=Date.now()-ackAt;metrics.checks.push('true-websocket-commit-ack-replay-and-peer-cursor');
  await sockets[1].send('message.send',{choiceId:'warm'});const reply=await req(people[0],`/game-rounds/${round}/events/query`,'POST',{afterSeq:ack.eventSeq,limit:100});assert.ok(reply.body.events.some(e=>e.type==='message.committed'&&e.actorAccountId===people[1].account.accountId));metrics.checks.push('second-real-actor-and-pinned-suggestion');
  await sockets[0].send('interaction.submit',{storySessionId:experience.body.storySessionId,episodeSeq:1,nodeId:experience.body.currentNode.id,expectedRevision:experience.body.progressRevision,definitionId:'bookmark',choiceId:'back'});const explored=await req(people[0],`/game-rounds/${round}/experience`);assert.equal(explored.body.progressRevision,experience.body.progressRevision+1);metrics.checks.push('active-interaction-committed-before-atomic-end');
  const ended=await req(people[0],`/game-rounds/${round}/end`,'POST',{});assert.equal(ended.status,200);await sockets[1].wait('room.ended');assert.equal((await req(people[1],`/game-rounds/${round}/events/query`,'POST',{afterSeq:0,limit:100})).status,409);assert.equal((await req(people[1],`/game-rounds/${round}/experience`)).body.phase,'ended');metrics.checks.push('room-ended-and-private-history-denied');
 }finally{for(const s of sockets)s.ws.close();for(const person of people)await req(person,'/session','DELETE',{refreshToken:person.tokens.refreshToken});}
 writeFileSync('.local/evidence/story-live.json',JSON.stringify({status:'passed',executedAt:new Date().toISOString(),...metrics},null,2)+'\n');
});
