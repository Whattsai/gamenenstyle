import { z } from 'zod';
import type { Statement } from './commands';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const auth={accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative()};
const member={...auth,roundId:id};
const mutation={...member,clientRequestId:id,eventId:id};
const scalar=z.string().refine(s=>!/[\p{Cc}\p{Cs}]/u.test(s)&&!/<[^>]+>/.test(s)).transform(s=>s.trim()).refine(s=>[...s].length>=1&&[...s].length<=500);
export const storySchemas={
 'story.round.status':z.strictObject(member),
 'story.snapshot':z.strictObject(member),
 'story.authorize':z.strictObject(member),
 'story.receipt':z.strictObject({...member,clientRequestId:id}),
 'story.events.query':z.strictObject({...member,afterSeq:z.number().int().nonnegative().nullable(),beforeSeq:z.number().int().positive().nullable(),limit:z.number().int().min(1).max(100)}).refine(p=>(p.afterSeq===null)!==(p.beforeSeq===null)),
 'story.selection.vote':z.strictObject({...mutation,episodeSeq:z.literal(1),catalogId:id,storySessionId:id,selectedEventId:id}),
 'story.message.send':z.strictObject({...mutation,text:scalar}),
 // 僅內部 Application 可提供由釘選 manifest 求出的轉移，公開命令不接受 nextNode 或 state。
 'story.action.commit':z.strictObject({...mutation,nodeEventId:id,completionEventId:id,storySessionId:id,episodeSeq:z.literal(1),expectedRevision:z.number().int().positive(),nodeId:z.string().min(1).max(80),nextNodeId:z.string().min(1).max(80),completed:z.boolean(),kind:z.enum(['story.choice.committed','interaction.updated']),payload:z.string().max(16000).refine(s=>{try{return typeof JSON.parse(s)==='object';}catch{return false;}}),requestPayload:z.string().max(4000),interaction:z.strictObject({instanceId:id,definitionId:z.string().min(1).max(80),definitionVersion:z.string().min(1).max(32),expectedRevision:z.number().int().nonnegative(),status:z.enum(['active','completed']),stateJson:z.string().max(16000)}).nullable()})
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
export function planStoryCommand(command:string,p:any,now:number):Statement[]{
 if(command==='story.round.status')return [stmt(`SELECT r.round_id,r.status FROM game_rounds r WHERE r.round_id=? AND ? IN(r.account_low_id,r.account_high_id) AND EXISTS(${session})`,p.roundId,p.accountId,...authArgs(p,now))];
 const start=guard(`EXISTS(${round})`,...args(p,now));
 if(command==='story.authorize')return [start];
 if(command==='story.receipt')return [start,stmt(`SELECT sequence,kind,json_extract(payload_json,'$.requestPayload') AS request_payload FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p))];
 if(command==='story.snapshot')return [start,
  stmt(`SELECT 'round' AS record_type,r.round_id,r.last_event_seq,r.story_offer_catalog_ids_json,i.initiator_account_id FROM game_rounds r JOIN match_invitations i ON i.invitation_id=r.invitation_id WHERE r.round_id=?`,p.roundId),
  stmt(`SELECT 'catalog' AS record_type,c.* FROM content_story_catalog c WHERE c.catalog_id IN(SELECT value FROM game_rounds r,json_each(r.story_offer_catalog_ids_json) WHERE r.round_id=?)`,p.roundId),
  stmt(`SELECT 'story' AS record_type,s.* FROM game_story_sessions s WHERE s.round_id=? AND s.episode_seq=1`,p.roundId),
  stmt(`SELECT 'vote' AS record_type,actor_account_id,CASE WHEN actor_account_id=? OR EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=e.round_id AND s.episode_seq=json_extract(e.payload_json,'$.episodeSeq')) THEN payload_json ELSE json_object('episodeSeq',1) END AS payload_json FROM game_round_events e WHERE round_id=? AND kind='story.vote.submitted' AND json_extract(payload_json,'$.episodeSeq')=1 AND sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=e.round_id AND v.actor_account_id=e.actor_account_id AND v.kind=e.kind AND json_extract(v.payload_json,'$.episodeSeq')=1)`,p.accountId,p.roundId),
  stmt(`SELECT 'interaction' AS record_type,i.* FROM game_interaction_instances i JOIN game_story_sessions s ON s.story_session_id=i.story_session_id WHERE s.round_id=? AND s.episode_seq=1`,p.roundId)];
 if(command==='story.events.query')return [start,stmt(`SELECT e.sequence,e.actor_account_id,e.client_request_id,e.created_at,
 CASE WHEN e.kind='story.vote.submitted' AND e.actor_account_id<>? AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=e.round_id AND s.episode_seq=json_extract(e.payload_json,'$.episodeSeq')) THEN 'story.vote_status' ELSE e.kind END AS kind,
 CASE WHEN e.kind='story.vote.submitted' AND e.actor_account_id<>? AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=e.round_id AND s.episode_seq=json_extract(e.payload_json,'$.episodeSeq')) THEN json_object('episodeSeq',json_extract(e.payload_json,'$.episodeSeq'),'partnerHasVoted',json('true'))
 WHEN e.kind IN ('interaction.updated','story.choice.committed') THEN json_remove(e.payload_json,'$.requestPayload') ELSE e.payload_json END AS payload_json
 FROM game_round_events e WHERE e.round_id=? AND (? IS NULL OR e.sequence>?) AND (? IS NULL OR e.sequence<?) ORDER BY CASE WHEN ? IS NULL THEN e.sequence END DESC, e.sequence ASC LIMIT ?`,p.accountId,p.accountId,p.roundId,p.afterSeq,p.afterSeq,p.beforeSeq,p.beforeSeq,p.afterSeq,p.limit)];
 if(command==='story.selection.vote'){
  const payload=JSON.stringify({episodeSeq:1,catalogId:p.catalogId});
  return [start,guard(`EXISTS(${receipt}) OR (EXISTS(SELECT 1 FROM game_rounds WHERE round_id=? AND json_array_length(story_offer_catalog_ids_json)>1 AND ? IN(SELECT value FROM json_each(story_offer_catalog_ids_json))) AND NOT EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq=1))`,...receiptArgs(p),p.roundId,p.catalogId,p.roundId),
   ...append(p,now,'story.vote.submitted',payload),
   stmt(`INSERT INTO game_story_sessions SELECT ?,r.round_id,1,json_extract(e.payload_json,'$.catalogId'),'entry','playing',1,?,? FROM game_rounds r JOIN match_invitations i ON i.invitation_id=r.invitation_id JOIN game_round_events e ON e.round_id=r.round_id AND e.actor_account_id=i.initiator_account_id AND e.kind='story.vote.submitted' AND json_extract(e.payload_json,'$.episodeSeq')=1
 WHERE r.round_id=? AND e.sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=r.round_id AND v.actor_account_id=i.initiator_account_id AND v.kind='story.vote.submitted' AND json_extract(v.payload_json,'$.episodeSeq')=1)
 AND (SELECT COUNT(DISTINCT actor_account_id) FROM game_round_events v WHERE v.round_id=r.round_id AND v.kind='story.vote.submitted' AND json_extract(v.payload_json,'$.episodeSeq')=1 AND v.actor_account_id IN(r.account_low_id,r.account_high_id))=2
 AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=r.round_id AND s.episode_seq=1)`,p.storySessionId,now,now,p.roundId),
   guard(`(SELECT COUNT(DISTINCT actor_account_id) FROM game_round_events e JOIN game_rounds r ON r.round_id=e.round_id WHERE e.round_id=? AND e.kind='story.vote.submitted' AND json_extract(e.payload_json,'$.episodeSeq')=1 AND e.actor_account_id IN(r.account_low_id,r.account_high_id))<2 OR EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq=1)`,p.roundId,p.roundId),
   stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,NULL,NULL,'story.selected',json_object('episodeSeq',1,'catalogId',s.catalog_id,'storySessionId',s.story_session_id),? FROM game_rounds r JOIN game_story_sessions s ON s.round_id=r.round_id AND s.episode_seq=1 WHERE r.round_id=? AND NOT EXISTS(SELECT 1 FROM game_round_events e WHERE e.round_id=r.round_id AND e.kind='story.selected' AND json_extract(e.payload_json,'$.episodeSeq')=1)`,p.selectedEventId,now,p.roundId),
   guard(`NOT EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq=1) OR EXISTS(SELECT 1 FROM game_story_sessions s JOIN game_round_events e ON e.round_id=s.round_id AND e.kind='story.selected' AND json_extract(e.payload_json,'$.storySessionId')=s.story_session_id AND json_extract(e.payload_json,'$.catalogId')=s.catalog_id WHERE s.round_id=? AND s.episode_seq=1)`,p.roundId,p.roundId),...advance(p),
   stmt(`SELECT sequence,kind FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p))];
 }
 if(command==='story.message.send')return [start,guard(`EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq=1)`,p.roundId),...append(p,now,'message.committed',JSON.stringify({text:p.text})),stmt(`SELECT sequence,kind FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p))];
 if(command==='story.action.commit'){
  const payload=JSON.stringify({...JSON.parse(p.payload),requestPayload:p.requestPayload,episodeSeq:1,storySessionId:p.storySessionId});
  const replay=`EXISTS(${receipt} AND kind=? AND json_extract(payload_json,'$.requestPayload')=?)`;
  const replayArgs=[...receiptArgs(p),p.kind,p.requestPayload];
  const fresh=`NOT EXISTS(${receipt})`;
  const out=[start,guard(`${replay} OR (EXISTS(SELECT 1 FROM game_story_sessions WHERE story_session_id=? AND round_id=? AND episode_seq=1 AND chapter_status='playing' AND current_node_id=? AND progress_revision=?) AND ${fresh})`,...replayArgs,p.storySessionId,p.roundId,p.nodeId,p.expectedRevision,...receiptArgs(p))];
  if(p.interaction){
   const i=p.interaction;
   out.push(guard(`${replay} OR (COALESCE((SELECT revision FROM game_interaction_instances WHERE story_session_id=? AND node_id=? AND definition_id=?),0)=?)`,...replayArgs,p.storySessionId,p.nodeId,i.definitionId,i.expectedRevision));
   out.push(stmt(`INSERT INTO game_interaction_instances SELECT ?,?,?,?, ?,?,?,1,?,? WHERE ${fresh} ON CONFLICT(story_session_id,node_id,definition_id) DO UPDATE SET status=excluded.status,state_json=excluded.state_json,revision=game_interaction_instances.revision+1,completed_at=excluded.completed_at`,i.instanceId,p.storySessionId,p.nodeId,i.definitionId,i.definitionVersion,i.status,i.stateJson,now,i.status==='completed'?now:null,...receiptArgs(p)));
   out.push(guard(`changes()=1 OR ${replay}`,...replayArgs));
  }
  out.push(stmt(`UPDATE game_story_sessions SET current_node_id=?,chapter_status=?,progress_revision=progress_revision+1,updated_at=? WHERE story_session_id=? AND ${fresh}`,p.nextNodeId,p.completed?'completed':'playing',now,p.storySessionId,...receiptArgs(p)));
  out.push(guard(`changes()=1 OR ${replay}`,...replayArgs));
  out.push(stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,?,?,?,json(?),? FROM game_rounds r WHERE r.round_id=? AND ${fresh}`,p.eventId,p.accountId,p.clientRequestId,p.kind,payload,now,p.roundId,...receiptArgs(p)),guard(`changes()=1 OR ${replay}`,...replayArgs),...advance(p));
  if(p.nodeId!==p.nextNodeId)out.push(stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,NULL,NULL,'story.node_changed',json_object('episodeSeq',1,'storySessionId',?,'nodeId',?,'sourceEventId',?),? FROM game_rounds r WHERE r.round_id=? AND EXISTS(SELECT 1 FROM game_round_events e WHERE e.event_id=? AND e.round_id=r.round_id) AND NOT EXISTS(SELECT 1 FROM game_round_events e WHERE e.round_id=r.round_id AND e.kind='story.node_changed' AND json_extract(e.payload_json,'$.sourceEventId')=?)`,p.nodeEventId,p.storySessionId,p.nextNodeId,p.eventId,now,p.roundId,p.eventId,p.eventId),guard(`NOT EXISTS(SELECT 1 FROM game_round_events WHERE event_id=? AND round_id=?) OR EXISTS(SELECT 1 FROM game_round_events WHERE round_id=? AND kind='story.node_changed' AND json_extract(payload_json,'$.sourceEventId')=?)`,p.eventId,p.roundId,p.roundId,p.eventId),...advance(p));
  if(p.completed)out.push(stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,NULL,NULL,'chapter.completed',json_object('episodeSeq',1,'storySessionId',?,'nodeId',?),? FROM game_rounds r WHERE r.round_id=? AND EXISTS(SELECT 1 FROM game_round_events e WHERE e.event_id=? AND e.round_id=r.round_id) AND NOT EXISTS(SELECT 1 FROM game_round_events e WHERE e.round_id=r.round_id AND e.kind='chapter.completed' AND json_extract(e.payload_json,'$.storySessionId')=?)`,p.completionEventId,p.storySessionId,p.nextNodeId,now,p.roundId,p.eventId,p.storySessionId),guard(`NOT EXISTS(SELECT 1 FROM game_round_events WHERE event_id=? AND round_id=?) OR EXISTS(SELECT 1 FROM game_round_events WHERE round_id=? AND kind='chapter.completed' AND json_extract(payload_json,'$.storySessionId')=?)`,p.eventId,p.roundId,p.roundId,p.storySessionId),...advance(p));
  out.push(stmt(`SELECT sequence,kind FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p)));
  return out;
 }
 throw new Error('UNKNOWN_COMMAND');
}
