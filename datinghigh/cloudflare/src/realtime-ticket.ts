import {z} from 'zod';
import {executeCommand} from './commands';
import {parseStrictJson} from './strict-json';
export interface RoomEnv {
 DB:D1Database;GAME_ROOMS?:DurableObjectNamespace;API?:DurableObjectNamespace;
 ROUND_TICKET_HMAC_KEY?:string;WEB_ORIGIN:string;APP_ENV:string;
}
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const authSchema=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative()});
const ticketInput=authSchema.extend({roundId:id,deviceId:id,clientPlatform:z.enum(['web','android','ios'])});
const ticketSchema=ticketInput.extend({version:z.literal(1),nonce:z.string().uuid(),expiresAt:z.number().int().positive()});
type Ticket=z.infer<typeof ticketSchema>;
export type Attachment={auth:z.infer<typeof authSchema>;roundId:string;deviceId:string;clientPlatform:string;expiresAt:number;window:number;frames:number};
const failure=(code:string,status=403)=>Response.json({code,status},{status,headers:{'Cache-Control':'no-store'}});
const b64=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const un64=(s:string)=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function key(env:RoomEnv){if(!env.ROUND_TICKET_HMAC_KEY||env.ROUND_TICKET_HMAC_KEY.length<32)throw new Error('REALTIME_UNAVAILABLE');return crypto.subtle.importKey('raw',new TextEncoder().encode(env.ROUND_TICKET_HMAC_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function authorized(env:RoomEnv,p:z.infer<typeof ticketInput>|Attachment,ended=false,now=Date.now()){
 const source='auth' in p?p.auth:p;const auth=authSchema.parse(Object.fromEntries(Object.keys(authSchema.shape).map(k=>[k,(source as any)[k]])));
 const result=await executeCommand(env.DB,ended?'story.round.status':'story.authorize',{...auth,roundId:p.roundId},now);
 if(ended&&!result.rows.length)throw new Error('SESSION_REVOKED');return result;
}
export async function mintRealtimeTicket(input:unknown,env:RoomEnv,now=Date.now()){
 const p=ticketInput.parse(input);await authorized(env,p,false,now);
 const ticket:Ticket={...p,version:1,nonce:crypto.randomUUID(),expiresAt:Math.min(now+30000,p.accessExpiresAt)};
 const data=b64(new TextEncoder().encode(JSON.stringify(ticket)));const signature=await crypto.subtle.sign('HMAC',await key(env),new TextEncoder().encode(data));
 return {ticket:`${data}.${b64(new Uint8Array(signature))}`,expiresAt:ticket.expiresAt,protocol:'datinghigh.v1'};
}
export async function verifyRealtimeTicket(token:string,env:RoomEnv,now=Date.now()):Promise<Ticket>{
 if(token.length>2048)throw new Error('INVALID_TICKET');const parts=token.split('.');if(parts.length!==2)throw new Error('INVALID_TICKET');
 if(!await crypto.subtle.verify('HMAC',await key(env),un64(parts[1]),new TextEncoder().encode(parts[0])))throw new Error('INVALID_TICKET');
 const ticket=ticketSchema.parse(parseStrictJson(new TextDecoder('utf-8',{fatal:true}).decode(un64(parts[0]))));
 if(ticket.expiresAt<=now||ticket.expiresAt>now+30000||ticket.accessExpiresAt<=now)throw new Error('INVALID_TICKET');return ticket;
}
