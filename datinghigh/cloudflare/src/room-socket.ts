import { DurableObject } from 'cloudflare:workers';
import { z } from 'zod';
import {parseStrictJson} from './strict-json';
import {trustedHeaders} from './router';
import {mintRealtimeTicket,verifyRealtimeTicket,authorized,type RoomEnv,type Attachment} from './realtime-ticket';
export {mintRealtimeTicket,verifyRealtimeTicket} from './realtime-ticket';
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const failure=(code:string,status=403)=>Response.json({code,status},{status,headers:{'Cache-Control':'no-store'}});
/** 每房獨立 Hibernation DO；持久狀態只保存已消費 nonce 的 hash，無權杖或聊天權威。 */
export class GameRoomSocket extends DurableObject<RoomEnv>{
 async fetch(request:Request):Promise<Response>{
  const url=new URL(request.url);
  if(url.pathname==='/internal/notify'){
   const input=z.union([z.strictObject({roundId:id,ended:z.boolean()}),z.strictObject({roundId:id,ended:z.literal(false),type:z.literal('avatar.updated'),revisionHint:z.string().regex(/^[0-9a-f]{64}$/)})]).parse(await request.json());
   if('type' in input)await this.broadcast(input.roundId,'avatar.updated',{revisionHint:input.revisionHint});
   else await this.broadcast(input.roundId,input.ended?'room.ended':'room.snapshot_hint',{},input.ended);
   return Response.json({notified:true});
  }
  const roundId=url.pathname.match(/^\/api\/v1\/game-rounds\/([0-9a-f-]+)\/ws$/)?.[1];
  if(!roundId||url.search||request.method!=='GET'||request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return failure('INVALID_STORY_REQUEST',400);
  try{
   const protocols=(request.headers.get('Sec-WebSocket-Protocol')??'').split(',').map(v=>v.trim());
   if(protocols.length!==3||protocols[0]!=='datinghigh.v1'||!protocols[1].startsWith('ticket.')||!protocols[2].startsWith('device.'))return failure('INVALID_TICKET');
   const ticket=await verifyRealtimeTicket(protocols[1].slice(7),this.env);
   if(ticket.roundId!==roundId||protocols[2].slice(7)!==ticket.deviceId)return failure('INVALID_TICKET');
   const origin=request.headers.get('Origin');if(ticket.clientPlatform==='web'?origin!==this.env.WEB_ORIGIN:origin!==null&&origin!==url.origin)return failure('ORIGIN_FORBIDDEN');
   try{await authorized(this.env,ticket);}catch{return failure('SESSION_REVOKED',401);}
   if(this.ctx.getWebSockets().length>=8)return failure('ROOM_CONNECTION_LIMIT',429);
   const nonce=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ticket.nonce))),n=>n.toString(16).padStart(2,'0')).join('');
   const consumed=await this.ctx.storage.transaction(async txn=>{if(await txn.get(`nonce:${nonce}`))return false;await txn.put(`nonce:${nonce}`,ticket.expiresAt);return true;});
   if(!consumed)return failure('INVALID_TICKET');await this.ctx.storage.setAlarm(Date.now()+31000);
   const pair=new WebSocketPair();const [client,server]=Object.values(pair);this.ctx.acceptWebSocket(server,[roundId]);
   server.serializeAttachment({auth:{accountId:ticket.accountId,sessionId:ticket.sessionId,cv:ticket.cv,accessExpiresAt:ticket.accessExpiresAt},roundId,deviceId:ticket.deviceId,clientPlatform:ticket.clientPlatform,expiresAt:ticket.accessExpiresAt,window:Date.now(),frames:0} satisfies Attachment);
   server.send(JSON.stringify({version:1,type:'room.snapshot_hint',roundId,payload:{}}));
   return new Response(null,{status:101,webSocket:client,headers:{'Sec-WebSocket-Protocol':'datinghigh.v1'}});
  }catch{return failure('INVALID_TICKET');}
 }
 private send(ws:WebSocket,value:unknown){
  // Worker WebSocket 的 bufferedAmount 在不同 runtime 可省略；有界 frame 與每人額度仍固定驗證。
  if((ws as WebSocket&{bufferedAmount?:number}).bufferedAmount!>262144){ws.close(1013,'Slow consumer');return;}
  try{ws.send(JSON.stringify(value));}catch{ws.close(1011,'Reconnect');}
 }
 private async broadcast(roundId:string,type:string,payload:unknown,ended=false){
  for(const ws of this.ctx.getWebSockets(roundId)){
   const a=ws.deserializeAttachment() as Attachment;
   try{if(a.expiresAt<=Date.now())throw new Error('Expired');await authorized(this.env,a,ended);this.send(ws,{version:1,type,roundId,payload});if(ended)ws.close(1000,'Round ended');}
   catch{ws.close(1008,'Reauthorize');}
  }
 }
 async webSocketMessage(ws:WebSocket,message:string|ArrayBuffer){
  const a=ws.deserializeAttachment() as Attachment;let requestId:string|undefined;
  try{
   if(typeof message!=='string'||new TextEncoder().encode(message).length>8192){ws.close(1009,'Frame too large');return;}
   if(a.expiresAt<=Date.now()){ws.close(1008,'Reauthorize');return;}
   const now=Date.now();if(now-a.window>=1000){a.window=now;a.frames=0;}if(++a.frames>12){ws.close(1008,'Rate limit');return;}ws.serializeAttachment(a);
   await authorized(this.env,a);
   const frame=z.strictObject({version:z.literal(1),type:z.enum(['presence.ping','story.vote.submit','story.next.requested','story.event.submit','message.send']),roundId:id,clientRequestId:id.optional(),payload:z.record(z.string(),z.unknown())}).parse(parseStrictJson(message));
   if(frame.roundId!==a.roundId)throw new Error('INVALID_STORY_REQUEST');requestId=frame.clientRequestId;
   if(frame.type==='presence.ping'){
    const p=z.strictObject({typing:z.boolean()}).parse(frame.payload);await this.broadcast(a.roundId,'player.presence',{actorAccountId:a.auth.accountId,typing:p.typing,ttlMs:5000});return;
   }
   if(!requestId)throw new Error('INVALID_STORY_REQUEST');if(!this.env.API)throw new Error('DEPENDENCY_UNAVAILABLE');
   const request=new Request('http://api.internal/internal/round-command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({auth:a.auth,roundId:a.roundId,type:frame.type,clientRequestId:requestId,payload:frame.payload}),signal:AbortSignal.timeout(45000)});
   const headers=trustedHeaders(request,this.env.APP_ENV);headers.set('X-DatingHigh-Internal-Round-Transport','websocket');
   const response=await this.env.API.get(this.env.API.idFromName('api-v1')).fetch(new Request(request,{headers}));const result=await response.json() as Record<string,unknown>;
   if(response.ok){this.send(ws,{version:1,type:'command.ack',roundId:a.roundId,clientRequestId:requestId,eventSeq:result.eventSeq,payload:{committed:true}});await this.broadcast(a.roundId,'room.snapshot_hint',{});}
   else{this.send(ws,{version:1,type:'command.error',roundId:a.roundId,clientRequestId:requestId,payload:{code:result.code,status:response.status,uncertain:response.status>=500}});if(response.status===401||response.status===403)ws.close(1008,'Reauthorize');}
  }catch(e){
   // 不記錄 frame、ticket、payload 或例外文字。
   try{await authorized(this.env,a);}catch{ws.close(1008,'Reauthorize');return;}
   const invalid=e instanceof z.ZodError||e instanceof SyntaxError||e instanceof Error&&e.message==='INVALID_STORY_REQUEST';
   this.send(ws,{version:1,type:'command.error',roundId:a.roundId,clientRequestId:requestId,payload:{code:invalid?'INVALID_STORY_REQUEST':'DEPENDENCY_UNAVAILABLE',status:invalid?400:503,uncertain:!invalid}});
  }
 }
 async webSocketClose(ws:WebSocket,code:number){try{ws.close(code===1005?1000:code);}catch{/* 已關閉。 */}}
 async webSocketError(ws:WebSocket){try{ws.close(1011,'Reconnect');}catch{/* 已關閉。 */}}
 async alarm(){const entries=await this.ctx.storage.list<number>({prefix:'nonce:'});const expired=[...entries].filter(([,until])=>until<=Date.now()).map(([k])=>k);if(expired.length)await this.ctx.storage.delete(expired);if(entries.size>expired.length)await this.ctx.storage.setAlarm(Date.now()+31000);}
}
