import { z } from 'zod';
import type { Statement } from './commands';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const auth={accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative()};
const member={...auth,roundId:id};
const mutation={...member,clientRequestId:id,eventId:id};
const scalar=z.string().refine(s=>!/[\p{Cc}\p{Cs}]/u.test(s)&&!/<[^>]+>/.test(s)).transform(s=>s.trim()).refine(s=>[...s].length>=1&&[...s].length<=500);
export const storySchemas={
 'story.round.status':z.strictObject(member),
 'story.authorize':z.strictObject(member),
 'story.receipt':z.strictObject({...member,clientRequestId:id}),
 'story.events.query':z.strictObject({...member,afterSeq:z.number().int().nonnegative().nullable(),beforeSeq:z.number().int().positive().nullable(),limit:z.number().int().min(1).max(100)}).refine(p=>(p.afterSeq===null)!==(p.beforeSeq===null)),
 'story.message.send':z.strictObject({...mutation,text:scalar}),

} as const;
const stmt=(sql:string,...values:unknown[]):Statement=>({sql,values});
const session=`SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.session_id=? AND s.account_id=? AND s.credential_version=? AND a.credential_version=s.credential_version AND a.status='active' AND s.revoked_at IS NULL AND s.absolute_expires_at>? AND s.idle_expires_at>? AND ?>?`;
const authArgs=(p:any,now:number)=>[p.sessionId,p.accountId,p.cv,now,now,p.accessExpiresAt,now];
const guard=(condition:string,...values:unknown[])=>stmt(`SELECT CASE WHEN ${condition} THEN 1 ELSE json('EVENT_STATE_CONFLICT') END AS __story_guard`,...values);
const round=`SELECT 1 FROM game_rounds r WHERE r.round_id=? AND ? IN(r.account_low_id,r.account_high_id) AND r.status='active' AND (SELECT COUNT(*) FROM game_active_round_claims c WHERE c.round_id=r.round_id AND c.account_id IN(r.account_low_id,r.account_high_id))=2 AND (SELECT COUNT(*) FROM game_active_round_claims c WHERE c.round_id=r.round_id)=2 AND EXISTS(${session})`;
const args=(p:any,now:number)=>[p.roundId,p.accountId,...authArgs(p,now)];
const receipt=`SELECT 1 FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`;
const receiptArgs=(p:any)=>[p.roundId,p.accountId,p.clientRequestId];
const advance=(p:any):Statement[]=>[
 stmt(`UPDATE game_rounds SET last_event_seq=(SELECT MAX(sequence) FROM game_round_events WHERE round_id=?) WHERE round_id=? AND last_event_seq IN ((SELECT MAX(sequence) FROM game_round_events WHERE round_id=?),(SELECT MAX(sequence)-1 FROM game_round_events WHERE round_id=?))`,p.roundId,p.roundId,p.roundId,p.roundId),
 guard(`EXISTS(SELECT 1 FROM game_rounds r WHERE r.round_id=? AND r.last_event_seq=(SELECT MAX(sequence) FROM game_round_events e WHERE e.round_id=r.round_id))`,p.roundId)
];
function append(p:any,now:number,kind:string,payload:string):Statement[]{
 return [stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,?,?,?,json(?),? FROM game_rounds r WHERE r.round_id=? AND NOT EXISTS(${receipt})`,p.eventId,p.accountId,p.clientRequestId,kind,payload,now,p.roundId,...receiptArgs(p)),
 guard(`changes()=1 OR EXISTS(${receipt} AND kind=? AND payload_json=json(?))`,...receiptArgs(p),kind,payload),...advance(p)];
}
export function planStoryCommand(command:string,p:any,now:number,options:{allowPendingRoundChat?:boolean}={}):Statement[]{
 if(command==='story.round.status')return [stmt(`SELECT r.round_id,r.status FROM game_rounds r WHERE r.round_id=? AND ? IN(r.account_low_id,r.account_high_id) AND EXISTS(${session})`,p.roundId,p.accountId,...authArgs(p,now))];
 const start=guard(`EXISTS(${round})`,...args(p,now));
 if(command==='story.authorize')return [start];
 if(command==='story.receipt')return [start,stmt(`SELECT sequence,kind,json_extract(payload_json,'$.requestPayload') AS request_payload FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p))];
 if(command==='story.events.query')return [start,stmt(`SELECT e.sequence,e.actor_account_id,e.client_request_id,e.created_at,
 CASE WHEN e.kind='story.track.updated' AND e.actor_account_id<>? THEN 'room.snapshot_hint' WHEN e.kind IN('story.vote.submitted','story.category.vote.submitted') AND e.actor_account_id<>? AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=e.round_id AND s.episode_seq=json_extract(e.payload_json,'$.episodeSeq')) THEN 'story.vote_status' ELSE e.kind END AS kind,
 CASE WHEN e.kind='story.track.updated' AND e.actor_account_id<>? THEN json_object('episodeSeq',json_extract(e.payload_json,'$.episodeSeq'),'storySessionId',json_extract(e.payload_json,'$.storySessionId')) WHEN e.kind IN('story.vote.submitted','story.category.vote.submitted') AND e.actor_account_id<>? AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=e.round_id AND s.episode_seq=json_extract(e.payload_json,'$.episodeSeq')) THEN json_object('episodeSeq',json_extract(e.payload_json,'$.episodeSeq'),'partnerHasVoted',json('true'))
 ELSE json_remove(e.payload_json,'$.requestPayload','$.contentPins') END AS payload_json
 FROM game_round_events e WHERE e.round_id=? AND (? IS NULL OR e.sequence>?) AND (? IS NULL OR e.sequence<?) ORDER BY CASE WHEN ? IS NULL THEN e.sequence END DESC, e.sequence ASC LIMIT ?`,p.accountId,p.accountId,p.accountId,p.accountId,p.roundId,p.afterSeq,p.afterSeq,p.beforeSeq,p.beforeSeq,p.afterSeq,p.limit)];
 if(command==='story.message.send')return [start,...append(p,now,'message.committed',JSON.stringify({text:p.text})),stmt(`SELECT sequence,kind FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p))];
 throw new Error('UNKNOWN_COMMAND');
}
