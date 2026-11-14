import { Miniflare,convertV4MiniflareOptions } from 'miniflare';
import {fileURLToPath} from 'node:url';
import { build } from 'esbuild';
import { readFileSync,readdirSync,writeFileSync } from 'node:fs';
import { afterAll,beforeAll,expect,it } from 'vitest';

let mf:Miniflare,db:D1Database;
const id=(n:number)=>`019a281e-0000-7000-8000-${n.toString().padStart(12,'0')}`;
const auth={accountId:id(1),sessionId:id(101),cv:1,accessExpiresAt:Date.now()+600000};
beforeAll(async()=>{
 const result=await build({stdin:{contents:`export {GameRoomSocket} from './src/room-socket';import {mintRealtimeTicket} from './src/room-socket';export default {async fetch(r,env){const p=new URL(r.url).pathname;if(p==='/mint-other')return Response.json(await mintRealtimeTicket({...${JSON.stringify(auth)},accountId:'${id(3)}',sessionId:'${id(103)}',roundId:'${id(512)}',deviceId:'${id(700)}',clientPlatform:'web'},env));if(p==='/mint'||p==='/mint-native'||p==='/mint-expired')return Response.json(await mintRealtimeTicket({...${JSON.stringify(auth)},roundId:'${id(502)}',deviceId:'${id(700)}',clientPlatform:p==='/mint-native'?'android':'web'},env,p==='/mint-expired'?Date.now()-31000:Date.now()));return env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(p.split('/')[4]||'${id(502)}')).fetch(r);}}`,resolveDir:fileURLToPath(new URL('../',import.meta.url))},bundle:true,write:false,format:'esm',platform:'neutral',external:['cloudflare:workers'],conditions:['workerd','worker','browser']});
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:result.outputFiles[0].text,compatibilityDate:'2026-10-24',d1Databases:{DB:'ws-isolated'},durableObjects:{GAME_ROOMS:{className:'GameRoomSocket',useSQLite:true}},bindings:{ROUND_TICKET_HMAC_KEY:'isolated-test-only-secret-32-characters',WEB_ORIGIN:'http://localhost:8081',APP_ENV:'local'}}));
 db=await mf.getD1Database('DB') as unknown as D1Database;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0006').sort())await db.batch(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 const now=Date.now();for(const n of [1,2,3,4])await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`ws${n}@example.invalid`,now,now,now).run();
 await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'web',1,0,?,?,?,NULL,NULL)").bind(id(101),id(1),now,now+2592000000,now+604800000).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(500),id(1),id(2),id(1),id(501),now,now+86400000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(502),id(500),id(1),id(2),now,JSON.stringify([id(301)])).run();
 for(const n of [1,2])await db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(600+n),id(n),id(502),now).run();
 await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'web',1,0,?,?,?,NULL,NULL)").bind(id(103),id(3),now,now+2592000000,now+604800000).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(510),id(3),id(4),id(3),id(511),now,now+86400000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(512),id(510),id(3),id(4),now,JSON.stringify([id(301)])).run();for(const n of [3,4])await db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(600+n),id(n),id(512),now).run();

});
afterAll(async()=>{await mf?.dispose();});
const mint=async()=>(await(await mf.dispatchFetch('http://localhost/mint')).json()) as any;
const upgrade=(ticket:string,origin='http://localhost:8081',device=id(700))=>mf.dispatchFetch(`http://localhost/api/v1/game-rounds/${id(502)}/ws`,{headers:{Upgrade:'websocket',Origin:origin,'Sec-WebSocket-Protocol':`datinghigh.v1, ticket.${ticket}, device.${device}`}});
it('SD-API-009/033: real DO handshake validates origin/device, consumes ticket exactly once and retains no token protocol',async()=>{
 const ticket=await mint();expect(ticket.ticket).toBeTruthy();
 expect((await upgrade(ticket.ticket,'https://evil.invalid')).status).toBe(403);
 expect((await upgrade(ticket.ticket,'http://localhost:8081',id(701))).status).toBe(403);
 const response=await upgrade(ticket.ticket);expect(response.status).toBe(101);expect(response.headers.get('Sec-WebSocket-Protocol')).toBe('datinghigh.v1');
 response.webSocket!.accept();response.webSocket!.close();
 expect((await upgrade(ticket.ticket)).status).toBe(403);
});
it('native websocket validates the platform generated same-host Origin',async()=>{
 const ticket=await (await mf.dispatchFetch('http://localhost/mint-native')).json() as any;
 const response=await upgrade(ticket.ticket,'http://localhost');expect(response.status).toBe(101);response.webSocket!.accept();response.webSocket!.close();
});
const receive=(ws:NonNullable<Awaited<ReturnType<typeof upgrade>>['webSocket']>,type:string)=>new Promise<any>((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('WebSocket response timeout')),3000);ws.addEventListener('message',event=>{const frame=JSON.parse(String(event.data));if(frame.type===type){clearTimeout(timeout);resolve(frame);}});});
it('SD-API-033: tampered signature and cross-round path cannot consume a valid ticket',async()=>{
 const ticket=await mint();expect((await upgrade(ticket.ticket+'x')).status).toBe(403);
 expect((await mf.dispatchFetch(`http://localhost/api/v1/game-rounds/${id(503)}/ws`,{headers:{Upgrade:'websocket',Origin:'http://localhost:8081','Sec-WebSocket-Protocol':`datinghigh.v1, ticket.${ticket.ticket}, device.${id(700)}`}})).status).toBe(403);
 const response=await upgrade(ticket.ticket);expect(response.status).toBe(101);response.webSocket!.accept();response.webSocket!.close();
});
it('SD-API-004: forged fields fail without forwarding or persisting messages',async()=>{
 const response=await upgrade((await mint()).ticket),ws=response.webSocket!;ws.accept();const result=receive(ws,'command.error');
 ws.send(JSON.stringify({version:1,type:'message.send',roundId:id(502),clientRequestId:id(999),actorAccountId:id(2),payload:{text:'forged'}}));expect((await result).payload).toMatchObject({status:400,uncertain:false});
 expect((await db.prepare('SELECT * FROM game_round_events').all()).results).toEqual([]);ws.close();
});
it('SD-API-009: oversized frame closes the real socket without a database write',async()=>{
 const response=await upgrade((await mint()).ticket),ws=response.webSocket!;ws.accept();const closed=new Promise<number>(resolve=>ws.addEventListener('close',event=>resolve(event.code)));ws.send('x'.repeat(8193));expect(await closed).toBe(1009);
 expect((await db.prepare('SELECT * FROM game_round_events').all()).results).toEqual([]);
});
it('SD-API-030: revocation while connected closes the next frame and cannot write',async()=>{
 const response=await upgrade((await mint()).ticket),ws=response.webSocket!;ws.accept();const closed=new Promise<number>(resolve=>ws.addEventListener('close',event=>resolve(event.code)));
 await db.prepare('UPDATE auth_sessions SET revoked_at=?').bind(Date.now()).run();ws.send(JSON.stringify({version:1,type:'presence.ping',roundId:id(502),payload:{typing:true}}));expect(await closed).toBe(1008);
 expect((await db.prepare('SELECT * FROM game_round_events').all()).results).toEqual([]);await db.prepare('UPDATE auth_sessions SET revoked_at=NULL').run();
});
it('expired short ticket cannot upgrade',async()=>{const ticket=await(await mf.dispatchFetch('http://localhost/mint-expired')).json() as any;expect((await upgrade(ticket.ticket)).status).toBe(403);});
it('SD-IT-037: independent real room DOs isolate presence and reconnect after idle',async()=>{
 const a=(await upgrade((await mint()).ticket)).webSocket!;a.accept();const ticket=await(await mf.dispatchFetch('http://localhost/mint-other')).json() as any;
 const b=(await mf.dispatchFetch(`http://localhost/api/v1/game-rounds/${id(512)}/ws`,{headers:{Upgrade:'websocket',Origin:'http://localhost:8081','Sec-WebSocket-Protocol':`datinghigh.v1, ticket.${ticket.ticket}, device.${id(700)}`}})).webSocket!;b.accept();const leaked:any[]=[];b.addEventListener('message',event=>{const frame=JSON.parse(String(event.data));if(frame.type==='player.presence')leaked.push(frame);});
 const started=Date.now(),received=receive(a,'player.presence');a.send(JSON.stringify({version:1,type:'presence.ping',roundId:id(502),payload:{typing:true}}));expect((await received).roundId).toBe(id(502));const presenceMilliseconds=Date.now()-started;
 await new Promise(resolve=>setTimeout(resolve,200));expect(leaked).toEqual([]);a.close();b.close();const reconnect=Date.now(),again=await upgrade((await mint()).ticket);expect(again.status).toBe(101);again.webSocket!.accept();again.webSocket!.close();
 writeFileSync(fileURLToPath(new URL('../../.local/evidence/story-room-isolation.json',import.meta.url)),JSON.stringify({executedAt:new Date().toISOString(),status:'passed',environment:'isolated actual Miniflare Room DO/D1, no Container',rooms:2,presenceMilliseconds,reconnectMilliseconds:Date.now()-reconnect,cloudHibernation:'unverified',cloudContainerColdStart:'unverified'},null,2)+'\n');
});
it('missing internal API binding is an uncertain dependency failure, not a bad player request',async()=>{
 const response=await upgrade((await mint()).ticket),socket=response.webSocket!;socket.accept();const error=receive(socket,'command.error');socket.send(JSON.stringify({version:1,type:'message.send',roundId:id(502),clientRequestId:id(997),payload:{text:'valid request'}}));expect((await error).payload).toMatchObject({status:503,uncertain:true});socket.close();
});
it('SD-API-047: avatar update hints reach only authorized members of the same actual room',async()=>{
 const a=(await upgrade((await mint()).ticket)).webSocket!;a.accept();
 const other=await(await mf.dispatchFetch('http://localhost/mint-other')).json() as any;
 const b=(await mf.dispatchFetch(`http://localhost/api/v1/game-rounds/${id(512)}/ws`,{headers:{Upgrade:'websocket',Origin:'http://localhost:8081','Sec-WebSocket-Protocol':`datinghigh.v1, ticket.${other.ticket}, device.${id(700)}`}})).webSocket!;b.accept();
 const leaked:unknown[]=[];b.addEventListener('message',event=>{const frame=JSON.parse(String(event.data));if(frame.type==='avatar.updated')leaked.push(frame);});
 const namespace=await mf.getDurableObjectNamespace('GAME_ROOMS'),room=namespace.get(namespace.idFromName(id(502))),received=receive(a,'avatar.updated');
 const response=await room.fetch('http://room.internal/internal/notify',{method:'POST',body:JSON.stringify({roundId:id(502),ended:false,type:'avatar.updated',revisionHint:'a'.repeat(64)})});
 expect(response.status).toBe(200);const frame=await received;expect(frame.payload).toEqual({revisionHint:'a'.repeat(64)});
 expect(JSON.stringify(frame)).not.toContain('private/');await new Promise(resolve=>setTimeout(resolve,100));expect(leaked).toEqual([]);
 const receivedAfterEnd:unknown[]=[];a.addEventListener('message',event=>{const frame=JSON.parse(String(event.data));if(frame.type==='avatar.updated'&&frame.payload.revisionHint==='b'.repeat(64))receivedAfterEnd.push(frame);});
 try{
  await db.prepare("UPDATE game_rounds SET status='ended',ended_at=? WHERE round_id=?").bind(Date.now(),id(502)).run();
  await room.fetch('http://room.internal/internal/notify',{method:'POST',body:JSON.stringify({roundId:id(502),ended:false,type:'avatar.updated',revisionHint:'b'.repeat(64)})});
  await new Promise(resolve=>setTimeout(resolve,100));expect(receivedAfterEnd).toEqual([]);
 }finally{await db.prepare("UPDATE game_rounds SET status='active',ended_at=NULL WHERE round_id=?").bind(id(502)).run();a.close();b.close();}
});
it('SD-API-030: old family cannot upgrade using an already issued ticket',async()=>{
 const ticket=await mint();await db.prepare('UPDATE auth_sessions SET revoked_at=?').bind(Date.now()).run();
 expect((await upgrade(ticket.ticket)).status).toBe(401);
});
