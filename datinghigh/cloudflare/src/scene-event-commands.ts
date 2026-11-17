import {z} from 'zod';
import {executeCommand,type Statement} from './commands';
import {readPinnedSceneEventContent} from './scene-event-content';
import {matchingSchemas,planMatchingCommand} from './matching-commands';
import {assertFrameworkMember,SceneEventFrameworkError} from './scene-event-authorization';
import {storySchemas,planStoryCommand} from './story-commands';
export {SceneEventFrameworkError} from './scene-event-authorization';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const nextSchema=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative(),roundId:id,clientRequestId:id,eventId:id,offersEventId:id,storySessionId:id,sceneVisitId:id,categoryEventId:id,sceneEventId:id,narrativeEventId:id,completedEpisodeSeq:z.number().int().min(1).max(2147483646),agree:z.boolean()});
type Next=z.infer<typeof nextSchema>;
const memberSchema=nextSchema.pick({accountId:true,sessionId:true,cv:true,accessExpiresAt:true,roundId:true});
type Member=z.infer<typeof memberSchema>;
type Receipt=Member&{clientRequestId:string};
const voteSchema=nextSchema.omit({completedEpisodeSeq:true,agree:true,offersEventId:true}).extend({episodeSeq:z.number().int().min(1).max(2147483647),categoryId:id});
type Env={DB:D1Database;STORY_CONTENT?:R2Bucket};
export interface VerifiedFrameworkCatalog {catalogId:string;catalogSha256:string;sceneCatalogId:string;sceneSha256:string;sceneId:string;narrativeId:string;eligibleCategoryCodes:string[];sceneCategoryCodes:string[];pins:unknown[];initialWorld?:unknown;entries?:{inviter:{nodeId:string;areaId:string};acceptor:{nodeId:string;areaId:string}};}

/** 只載入 published 組合，並把 D1 索引與 R2 四層依賴逐一核對；不讀玩家 Profile。 */
export async function loadFrameworkCatalog(env:Env):Promise<VerifiedFrameworkCatalog[]>{
 const records=(await env.DB.prepare(`SELECT c.*,s.scene_id,s.version AS scene_version,s.manifest_key AS scene_manifest_key,s.manifest_sha256 AS scene_manifest_sha256 FROM content_story_catalog c JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE c.status='published' AND s.status='published' ORDER BY c.story_id,c.catalog_id LIMIT 201`).all()).results as any[];
 if(records.length>200||records.length&&!env.STORY_CONTENT)throw new SceneEventFrameworkError('DEPENDENCY_UNAVAILABLE',503);
 const result:VerifiedFrameworkCatalog[]=[];
 for(const c of records){
  const content=await readPinnedSceneEventContent(env.STORY_CONTENT!,{id:c.story_id,version:c.version,key:c.manifest_key,sha256:c.manifest_sha256});
  if(content.scene.sceneId!==c.scene_id||content.scene.version!==c.scene_version||content.narrative.scene!.key!==c.scene_manifest_key||content.narrative.scene!.sha256!==c.scene_manifest_sha256||content.narrative.sequenceGroupId!==c.sequence_group_id||content.narrative.sequenceOrder!==c.sequence_order||JSON.stringify(content.narrative.prerequisites)!==JSON.stringify(JSON.parse(c.prerequisites_json)))throw new SceneEventFrameworkError('DEPENDENCY_UNAVAILABLE',503);
  result.push({catalogId:c.catalog_id,catalogSha256:c.manifest_sha256,sceneCatalogId:c.scene_catalog_id,sceneSha256:c.scene_manifest_sha256,sceneId:c.scene_id,narrativeId:c.story_id,eligibleCategoryCodes:content.narrative.eligibleCategoryCodes,sceneCategoryCodes:content.scene.categoryCodes,pins:content.pins,...(content.narrative.schemaVersion==='scene-event.v2'?{initialWorld:{objects:Object.fromEntries(content.scene.sceneObjects.map((o:any)=>[o.id,o.initialState])),flags:Object.fromEntries(content.scene.sharedFlags.map((f:any)=>[f.id,f.initialValue]))},entries:Object.fromEntries((['inviter','acceptor'] as const).map(role=>{const track=content.narrative.tracks[role],node=track.nodes.find((n:any)=>n.id===track.entry);return[role,{nodeId:node!.id,areaId:node!.areaId}];})) as NonNullable<VerifiedFrameworkCatalog['entries']>}: {})});
 }
 return result;
}

const stmt=(sql:string,...values:unknown[]):Statement=>({sql,values});
const guard=(condition:string,...values:unknown[])=>stmt(`SELECT CASE WHEN ${condition} THEN 1 ELSE json('EVENT_STATE_CONFLICT') END AS __scene_guard`,...values);
const session=`SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.session_id=? AND s.account_id=? AND s.credential_version=? AND a.credential_version=s.credential_version AND a.status='active' AND s.revoked_at IS NULL AND s.absolute_expires_at>? AND s.idle_expires_at>? AND ?>?`;
const active=`EXISTS(SELECT 1 FROM game_rounds r WHERE r.round_id=? AND ? IN(r.account_low_id,r.account_high_id) AND r.status='active' AND (SELECT COUNT(*) FROM game_active_round_claims q WHERE q.round_id=r.round_id)=2 AND (SELECT COUNT(*) FROM game_active_round_claims q WHERE q.round_id=r.round_id AND q.account_id IN(r.account_low_id,r.account_high_id))=2 AND EXISTS(${session}))`;
const authArgs=(p:Member,now:number)=>[p.roundId,p.accountId,p.sessionId,p.accountId,p.cv,now,now,p.accessExpiresAt,now];
const receipt=`SELECT 1 FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`;
const receiptArgs=(p:Receipt)=>[p.roundId,p.accountId,p.clientRequestId];
const payload=(p:Next)=>JSON.stringify({episodeSeq:p.completedEpisodeSeq,completedEpisodeSeq:p.completedEpisodeSeq,agree:p.agree});
const replay=`EXISTS(${receipt} AND kind='story.next.requested' AND payload_json=json(?))`;
const sync=(p:Pick<Next,'roundId'>,gate='1',values:unknown[]=[])=>[
 stmt(`UPDATE game_rounds SET last_event_seq=COALESCE((SELECT MAX(sequence) FROM game_round_events WHERE round_id=?),0) WHERE round_id=? AND (${gate})`,p.roundId,p.roundId,...values),
 guard(`NOT(${gate}) OR EXISTS(SELECT 1 FROM game_rounds WHERE round_id=? AND last_event_seq=COALESCE((SELECT MAX(sequence) FROM game_round_events WHERE round_id=?),0))`,...values,p.roundId,p.roundId)
];

// 一個 statement 的所有內容／Profile／完成事實皆由相同 D1 提交讀取。RNG 只注入數值，SQL 不呼叫外部服務。
function selectionFor(roundSource=`SELECT r.*,m.initiator_account_id FROM game_rounds r JOIN match_invitations m ON m.invitation_id=r.invitation_id JOIN i ON i.round_id=r.round_id`){return `i AS(SELECT ? AS round_id,? AS catalog_json,? AS scene_draw,? AS narrative_draw,? AS episode),
 rr AS(${roundSource}),
 completed AS(SELECT DISTINCT c.story_id FROM game_story_sessions s JOIN game_rounds h ON h.round_id=s.round_id JOIN content_story_catalog c ON c.catalog_id=s.catalog_id,rr WHERE s.chapter_status='completed' AND h.account_low_id=rr.account_low_id AND h.account_high_id=rr.account_high_id),
 visited AS(SELECT DISTINCT c.scene_id FROM game_scene_visits v JOIN game_story_sessions s ON s.story_session_id=v.story_session_id JOIN game_rounds h ON h.round_id=s.round_id JOIN content_scene_catalog c ON c.scene_catalog_id=v.scene_catalog_id,rr WHERE s.chapter_status='completed' AND h.account_low_id=rr.account_low_id AND h.account_high_id=rr.account_high_id),
 eligible AS(SELECT c.*,s.scene_id,j.value AS verified FROM i,json_each(i.catalog_json) j JOIN content_story_catalog c ON c.catalog_id=json_extract(j.value,'$.catalogId') JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE c.status='published' AND s.status='published' AND c.manifest_sha256=json_extract(j.value,'$.catalogSha256') AND s.manifest_sha256=json_extract(j.value,'$.sceneSha256') AND c.scene_catalog_id=json_extract(j.value,'$.sceneCatalogId')
 AND NOT EXISTS(SELECT 1 FROM json_each(c.prerequisites_json) p WHERE p.value NOT IN(SELECT story_id FROM completed))
 AND ((c.sequence_group_id IS NULL AND c.sequence_order IS NULL) OR c.sequence_order=1 OR (c.sequence_order>1 AND EXISTS(SELECT 1 FROM content_story_catalog prior JOIN completed done ON done.story_id=prior.story_id WHERE prior.sequence_group_id=c.sequence_group_id AND prior.sequence_order=c.sequence_order-1)))),
 ranked AS(SELECT cat.category_id,cat.code,cat.recommendation_priority,
 (SELECT COUNT(*) FROM json_each(cat.interest_tag_ids_json) t WHERE t.value IN(SELECT value FROM json_each(a.interests_json,'$.interestTagIds')) AND t.value IN(SELECT value FROM json_each(b.interests_json,'$.interestTagIds'))) AS shared,
 MIN((SELECT COUNT(*) FROM json_each(cat.interest_tag_ids_json) t WHERE t.value IN(SELECT value FROM json_each(a.interests_json,'$.interestTagIds'))),(SELECT COUNT(*) FROM json_each(cat.interest_tag_ids_json) t WHERE t.value IN(SELECT value FROM json_each(b.interests_json,'$.interestTagIds')))) AS balanced,
 (SELECT COUNT(*) FROM json_each(cat.interest_tag_ids_json) t WHERE t.value IN(SELECT value FROM json_each(a.interests_json,'$.interestTagIds')))+(SELECT COUNT(*) FROM json_each(cat.interest_tag_ids_json) t WHERE t.value IN(SELECT value FROM json_each(b.interests_json,'$.interestTagIds'))) AS total
 FROM content_story_categories cat,rr JOIN user_profiles a ON a.account_id=rr.account_low_id JOIN user_profiles b ON b.account_id=rr.account_high_id WHERE cat.status='published' AND EXISTS(SELECT 1 FROM eligible e JOIN content_scene_category_links link ON link.scene_catalog_id=e.scene_catalog_id AND link.category_id=cat.category_id WHERE cat.code IN(SELECT value FROM json_each(e.verified,'$.eligibleCategoryCodes')) AND cat.code IN(SELECT value FROM json_each(e.verified,'$.sceneCategoryCodes')))),
 new_offers AS(SELECT json_group_array(category_id) AS ids FROM(SELECT category_id FROM ranked ORDER BY shared DESC,balanced DESC,total DESC,recommendation_priority,code LIMIT 3)),
 frozen AS(SELECT CASE WHEN i.episode=1 THEN rr.story_offer_category_ids_json ELSE COALESCE((SELECT json_extract(e.payload_json,'$.categoryIds') FROM game_round_events e WHERE e.round_id=rr.round_id AND e.kind='story.episode.offers.frozen' AND json_extract(e.payload_json,'$.episodeSeq')=i.episode ORDER BY sequence DESC LIMIT 1),'[]') END AS ids FROM rr,i),
 ballots AS(SELECT e.actor_account_id,json_extract(e.payload_json,'$.categoryId') AS category_id FROM game_round_events e,rr,i WHERE e.round_id=rr.round_id AND e.kind='story.category.vote.submitted' AND json_extract(e.payload_json,'$.episodeSeq')=i.episode AND e.actor_account_id IN(rr.account_low_id,rr.account_high_id) AND e.sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=e.round_id AND v.kind=e.kind AND v.actor_account_id=e.actor_account_id AND json_extract(v.payload_json,'$.episodeSeq')=i.episode)),
 decision AS(SELECT cat.category_id,cat.code FROM content_story_categories cat,rr,frozen WHERE cat.category_id=CASE WHEN json_array_length(frozen.ids)=1 THEN json_extract(frozen.ids,'$[0]') WHEN (SELECT COUNT(*) FROM ballots)=2 THEN (SELECT category_id FROM ballots WHERE actor_account_id=rr.initiator_account_id) END),
 selected_eligible AS(SELECT e.* FROM eligible e,decision d WHERE d.code IN(SELECT value FROM json_each(e.verified,'$.eligibleCategoryCodes')) AND d.code IN(SELECT value FROM json_each(e.verified,'$.sceneCategoryCodes')) AND EXISTS(SELECT 1 FROM content_scene_category_links l JOIN content_story_categories c ON c.category_id=l.category_id WHERE l.scene_catalog_id=e.scene_catalog_id AND c.code=d.code)),
 scene_pool AS(SELECT DISTINCT scene_catalog_id,scene_id,CASE WHEN scene_id IN(SELECT scene_id FROM visited) THEN 1 ELSE 3 END AS weight FROM selected_eligible),
 scene_weights AS(SELECT *,SUM(weight)OVER(ORDER BY scene_id,scene_catalog_id) AS running,SUM(weight)OVER() AS total FROM scene_pool),
 selected_scene AS(SELECT scene_catalog_id FROM scene_weights,i WHERE running>i.scene_draw*total ORDER BY running LIMIT 1),
 narrative_pool AS(SELECT e.*,CASE WHEN e.story_id IN(SELECT story_id FROM completed) THEN 1 ELSE 3 END AS weight FROM selected_eligible e WHERE e.scene_catalog_id=(SELECT scene_catalog_id FROM selected_scene)),
 narrative_weights AS(SELECT *,SUM(weight)OVER(ORDER BY story_id,catalog_id) AS running,SUM(weight)OVER() AS total FROM narrative_pool),
 chosen AS(SELECT n.* FROM narrative_weights n,i WHERE n.running>i.narrative_draw*n.total ORDER BY n.running LIMIT 1)`;}
const selectionCte=selectionFor();

const both=`(SELECT COUNT(*) FROM game_round_events e JOIN game_rounds r ON r.round_id=e.round_id WHERE e.round_id=? AND e.kind='story.next.requested' AND json_extract(e.payload_json,'$.completedEpisodeSeq')=? AND e.actor_account_id IN(r.account_low_id,r.account_high_id) AND json_extract(e.payload_json,'$.agree')=1 AND e.sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=e.round_id AND v.kind=e.kind AND v.actor_account_id=e.actor_account_id AND json_extract(v.payload_json,'$.completedEpisodeSeq')=?))=2`;

type SelectionIds=Pick<Next,'roundId'|'storySessionId'|'sceneVisitId'|'categoryEventId'|'sceneEventId'|'narrativeEventId'>;
function initializeSelection(p:SelectionIds,context:unknown[],episode:number,now:number,ownOffer:string,ownArgs:unknown[]):Statement[]{
 const out=[
 stmt(`WITH ${selectionCte} INSERT INTO game_story_sessions(story_session_id,round_id,episode_seq,catalog_id,chapter_status,shared_revision,created_at,updated_at,selected_category_id,world_state_json) SELECT ?,rr.round_id,i.episode,n.catalog_id,'playing',1,?,?,d.category_id,json(json_extract(n.verified,'$.initialWorld')) FROM rr,i,chosen n,decision d WHERE ${ownOffer} AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=rr.round_id AND s.episode_seq=i.episode)`,...context,p.storySessionId,now,now,...ownArgs),
 guard(`NOT(${ownOffer}) OR EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq=?)`,...ownArgs,p.roundId,episode),
 stmt(`WITH ${selectionCte} INSERT INTO game_scene_visits SELECT ?,s.story_session_id,1,c.scene_catalog_id,?,NULL FROM game_story_sessions s JOIN content_story_catalog c ON c.catalog_id=s.catalog_id,i WHERE s.round_id=i.round_id AND s.episode_seq=i.episode AND s.story_session_id=? AND ${ownOffer} AND NOT EXISTS(SELECT 1 FROM game_scene_visits v WHERE v.story_session_id=s.story_session_id)`,...context,p.sceneVisitId,now,p.storySessionId,...ownArgs),
 guard(`NOT(${ownOffer}) OR EXISTS(SELECT 1 FROM game_scene_visits v JOIN game_story_sessions s ON s.story_session_id=v.story_session_id JOIN content_story_catalog c ON c.catalog_id=s.catalog_id WHERE s.round_id=? AND s.episode_seq=? AND v.scene_catalog_id=c.scene_catalog_id AND v.visit_seq=1)`,...ownArgs,p.roundId,episode)];
 for(const role of ['inviter','acceptor'] as const){
  const actor=role==='inviter'?'rr.initiator_account_id':"CASE WHEN rr.initiator_account_id=rr.account_low_id THEN rr.account_high_id ELSE rr.account_low_id END";
  out.push(stmt(`WITH ${selectionCte} INSERT INTO game_story_participant_progress SELECT s.story_session_id,${actor},'${role}',json_extract(n.verified,'$.entries.${role}.nodeId'),json_extract(n.verified,'$.entries.${role}.areaId'),1,? FROM rr,i,chosen n JOIN game_story_sessions s ON s.round_id=rr.round_id AND s.episode_seq=i.episode WHERE s.story_session_id=? AND ${ownOffer} AND NOT EXISTS(SELECT 1 FROM game_story_participant_progress q WHERE q.story_session_id=s.story_session_id AND q.role='${role}')`,...context,now,p.storySessionId,...ownArgs));
  out.push(guard(`NOT(${ownOffer}) OR EXISTS(SELECT 1 FROM game_story_participant_progress q JOIN game_story_sessions s ON s.story_session_id=q.story_session_id JOIN game_rounds r ON r.round_id=s.round_id JOIN match_invitations m ON m.invitation_id=r.invitation_id WHERE s.round_id=? AND s.episode_seq=? AND q.role='${role}' AND q.account_id=CASE WHEN '${role}'='inviter' THEN m.initiator_account_id WHEN m.initiator_account_id=r.account_low_id THEN r.account_high_id ELSE r.account_low_id END)`,...ownArgs,p.roundId,episode));
 }
 for(const [kind,eventId]of [['story.category.selected',p.categoryEventId],['story.scene.selected',p.sceneEventId],['story.narrative.selected',p.narrativeEventId]]){
  out.push(stmt(`WITH ${selectionCte} INSERT INTO game_round_events SELECT ?,rr.round_id,rr.last_event_seq+1,NULL,NULL,?,json_object('episodeSeq',i.episode,'storySessionId',s.story_session_id,'categoryId',s.selected_category_id,'sceneCatalogId',c.scene_catalog_id,'catalogId',s.catalog_id,'contentPins',json((SELECT json_extract(verified,'$.pins') FROM chosen))),? FROM rr,i JOIN game_story_sessions s ON s.round_id=rr.round_id AND s.episode_seq=i.episode JOIN content_story_catalog c ON c.catalog_id=s.catalog_id WHERE ${ownOffer} AND NOT EXISTS(SELECT 1 FROM game_round_events e WHERE e.round_id=rr.round_id AND e.kind=? AND json_extract(e.payload_json,'$.episodeSeq')=i.episode)`,...context,eventId,kind,now,...ownArgs,kind));
  out.push(guard(`NOT(${ownOffer}) OR EXISTS(SELECT 1 FROM game_round_events WHERE round_id=? AND kind=? AND json_extract(payload_json,'$.episodeSeq')=?)`,...ownArgs,p.roundId,kind,episode),...sync(p,ownOffer,ownArgs));
 }
 return out;
}

export function planFrameworkNext(value:unknown,catalog:VerifiedFrameworkCatalog[],now:number,random:{sceneDraw:number;narrativeDraw:number}):Statement[]{
 const p=nextSchema.parse(value);for(const draw of [random.sceneDraw,random.narrativeDraw])if(!Number.isFinite(draw)||draw<0||draw>=1)throw new SceneEventFrameworkError('INVALID_STORY_CONTENT',503);
 const json=JSON.stringify(catalog),body=payload(p),episode=p.completedEpisodeSeq+1;
 const context=[p.roundId,json,random.sceneDraw,random.narrativeDraw,episode];
 const replayArgs=[...receiptArgs(p),body];const ownOffer=`EXISTS(SELECT 1 FROM game_round_events WHERE event_id=? AND round_id=? AND kind='story.episode.offers.frozen' AND json_extract(payload_json,'$.episodeSeq')=? AND json_array_length(json_extract(payload_json,'$.categoryIds'))=1)`;
 const ownArgs=[p.offersEventId,p.roundId,episode];
 const out=[guard(active,...authArgs(p,now)),guard(`${replay} OR (NOT EXISTS(${receipt}) AND EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq=? AND chapter_status='completed') AND NOT EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=? AND episode_seq>?) AND NOT EXISTS(SELECT 1 FROM game_round_events WHERE round_id=? AND kind='story.episode.offers.frozen' AND json_extract(payload_json,'$.episodeSeq')>?))`,...replayArgs,...receiptArgs(p),p.roundId,p.completedEpisodeSeq,p.roundId,p.completedEpisodeSeq,p.roundId,p.completedEpisodeSeq),
 guard(`${replay} OR NOT EXISTS(SELECT 1 FROM content_story_catalog c JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE c.status='published' AND s.status='published' AND NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE json_extract(j.value,'$.catalogId')=c.catalog_id AND json_extract(j.value,'$.catalogSha256')=c.manifest_sha256 AND json_extract(j.value,'$.sceneCatalogId')=s.scene_catalog_id AND json_extract(j.value,'$.sceneSha256')=s.manifest_sha256))`,...replayArgs,json),
 stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,?,?,'story.next.requested',json(?),? FROM game_rounds r WHERE r.round_id=? AND NOT EXISTS(${receipt})`,p.eventId,p.accountId,p.clientRequestId,body,now,p.roundId,...receiptArgs(p)),guard(`changes()=1 OR ${replay}`,...replayArgs),...sync(p),
 stmt(`WITH ${selectionCte} SELECT CASE WHEN NOT(${both}) OR json_array_length((SELECT ids FROM new_offers))>0 THEN 1 ELSE json('NO_PLAYABLE_STORY') END AS __scene_guard`,...context,p.roundId,p.completedEpisodeSeq,p.completedEpisodeSeq),
 stmt(`WITH ${selectionCte} INSERT INTO game_round_events SELECT ?,rr.round_id,rr.last_event_seq+1,NULL,NULL,'story.episode.offers.frozen',json_object('episodeSeq',i.episode,'categoryIds',json((SELECT ids FROM new_offers))),? FROM rr,i WHERE ${both} AND NOT EXISTS(SELECT 1 FROM game_round_events e WHERE e.round_id=rr.round_id AND e.kind='story.episode.offers.frozen' AND json_extract(e.payload_json,'$.episodeSeq')=i.episode)`,...context,p.offersEventId,now,p.roundId,p.completedEpisodeSeq,p.completedEpisodeSeq),
 guard(`NOT(${both}) OR EXISTS(SELECT 1 FROM game_round_events WHERE round_id=? AND kind='story.episode.offers.frozen' AND json_extract(payload_json,'$.episodeSeq')=?)`,p.roundId,p.completedEpisodeSeq,p.completedEpisodeSeq,p.roundId,episode),...sync(p),
 ];out.push(...initializeSelection(p,context,episode,now,ownOffer,ownArgs));
 out.push(stmt(`SELECT sequence,kind FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p)));return out;
}

function secureRandom(){const bytes=crypto.getRandomValues(new Uint32Array(2));return((bytes[0]&0x1fffff)*4294967296+bytes[1])/9007199254740992;}
async function batch(db:D1Database,plans:Statement[]){
 const result=await db.batch(plans.map(s=>db.prepare(s.sql).bind(...s.values)));
 return{rows:result.flatMap(r=>r.results??[]).filter(r=>typeof r==='object'&&r!==null&&!Object.hasOwn(r,'__scene_guard')),changes:result.map(r=>r.meta.changes)};
}
async function authorizedBatch(db:D1Database,value:unknown,now:number,plans:Statement[]){
 const started=Date.now(),current=()=>now+Math.max(0,Date.now()-started);await assertFrameworkMember(db,value,current());
 try{return await batch(db,plans);}catch(error){await assertFrameworkMember(db,value,current());throw error;}
}
export async function executeFrameworkMessage(db:D1Database,value:unknown,now=Date.now()){
 const p=storySchemas['story.message.send'].parse(value);
 return authorizedBatch(db,p,now,planStoryCommand('story.message.send',p,now,{allowPendingRoundChat:true}));
}
export async function executeFrameworkEnd(db:D1Database,value:unknown,now=Date.now()){
 const p=matchingSchemas['game.round.end'].parse(value);
 return batch(db,planMatchingCommand('game.round.end',p,now,{end:[
  stmt(`UPDATE game_event_instances SET status='cancelled',revision=revision+1,completed_at=? WHERE status='active' AND story_session_id IN(SELECT story_session_id FROM game_story_sessions WHERE round_id=?)`,now,p.roundId),
  guard(`NOT EXISTS(SELECT 1 FROM game_event_instances e JOIN game_story_sessions s ON s.story_session_id=e.story_session_id WHERE s.round_id=? AND e.status='active')`,p.roundId),
  stmt(`UPDATE game_scene_visits SET left_at=? WHERE left_at IS NULL AND story_session_id IN(SELECT story_session_id FROM game_story_sessions WHERE round_id=?)`,now,p.roundId),
  guard(`NOT EXISTS(SELECT 1 FROM game_scene_visits v JOIN game_story_sessions s ON s.story_session_id=v.story_session_id WHERE s.round_id=? AND v.left_at IS NULL)`,p.roundId)
 ]}));
}
export function planFrameworkAcceptance(value:unknown,catalog:VerifiedFrameworkCatalog[],now:number,random:{sceneDraw:number;narrativeDraw:number}):Statement[]{
 const p=matchingSchemas['match.invite.resolve'].parse(value);if(p.action!=='accept')return planMatchingCommand('match.invite.resolve',p,now);
 if(!catalog.length)throw new SceneEventFrameworkError('NO_PLAYABLE_STORY');for(const draw of Object.values(random))if(!Number.isFinite(draw)||draw<0||draw>=1)throw new SceneEventFrameworkError('INVALID_STORY_CONTENT',503);
 const context=[p.roundId,JSON.stringify(catalog),random.sceneDraw,random.narrativeDraw,1],offersContext=[...context,p.invitationId];
 const offersCte=selectionFor(`SELECT i.round_id,m.account_low_id,m.account_high_id,m.initiator_account_id,'[]' AS story_offer_category_ids_json FROM match_invitations m,i WHERE m.invitation_id=?`);
 const own=`EXISTS(SELECT 1 FROM game_rounds WHERE round_id=? AND json_array_length(story_offer_category_ids_json)=1)`,ownArgs=[p.roundId];
 const ids={roundId:p.roundId,storySessionId:p.roundId,sceneVisitId:p.roundId,categoryEventId:p.roundId,sceneEventId:p.participantLowId,narrativeEventId:p.participantHighId};
 return planMatchingCommand('match.invite.resolve',p,now,{accept:{
  before:[stmt(`WITH ${offersCte} SELECT CASE WHEN json_array_length((SELECT ids FROM new_offers))>0 THEN 1 ELSE json('NO_PLAYABLE_STORY') END AS __scene_guard`,...offersContext),
   guard(`NOT EXISTS(SELECT 1 FROM content_story_catalog c JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE c.status='published' AND s.status='published' AND NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE json_extract(j.value,'$.catalogId')=c.catalog_id AND json_extract(j.value,'$.catalogSha256')=c.manifest_sha256 AND json_extract(j.value,'$.sceneCatalogId')=s.scene_catalog_id AND json_extract(j.value,'$.sceneSha256')=s.manifest_sha256))`,JSON.stringify(catalog))],
  offersSql:`WITH ${offersCte} SELECT ids FROM new_offers`,offersValues:offersContext,
  initialize:initializeSelection(ids,context,1,now,own,ownArgs)
 }});
}
export async function executeFrameworkAcceptance(env:Env,value:unknown,now=Date.now(),options:{random?:()=>number}={}){
 const started=Date.now(),p=matchingSchemas['match.invite.resolve'].parse(value);if(p.action!=='accept')return executeCommand(env.DB,'match.invite.resolve',p,now);
 const current=()=>now+Math.max(0,Date.now()-started),auth={accountId:p.accountId,sessionId:p.sessionId,cv:p.cv,accessExpiresAt:p.accessExpiresAt};
 if(!(await executeCommand(env.DB,'session.validate',auth,current())).rows.length)throw new SceneEventFrameworkError('SESSION_REVOKED',401);
 const previous=async()=>env.DB.prepare(`SELECT i.*,r.round_id FROM match_invitations i LEFT JOIN game_rounds r ON r.invitation_id=i.invitation_id WHERE i.invitation_id=? AND i.initiator_account_id<>? AND ? IN(i.account_low_id,i.account_high_id)`).bind(p.invitationId,p.accountId,p.accountId).first<any>();
 const initial=await previous();if(!initial)throw new SceneEventFrameworkError('RESOURCE_FORBIDDEN',403);if(initial.status==='accepted')return{rows:[initial],changes:[]};if(initial.status!=='pending'||initial.expires_at<=current())throw new SceneEventFrameworkError('MATCH_STATE_CONFLICT');
 const catalog=await loadFrameworkCatalog(env),random=options.random??secureRandom;
 try{return await batch(env.DB,planFrameworkAcceptance(p,catalog,current(),{sceneDraw:random(),narrativeDraw:random()}));}
 catch(error){if(!(await executeCommand(env.DB,'session.validate',auth,current())).rows.length)throw new SceneEventFrameworkError('SESSION_REVOKED',401);const restored=await previous();if(restored?.status==='accepted')return{rows:[restored],changes:[]};throw error;}
}
export function planFrameworkVote(value:unknown,catalog:VerifiedFrameworkCatalog[],now:number,random:{sceneDraw:number;narrativeDraw:number}):Statement[]{
 const p=voteSchema.parse(value);for(const draw of Object.values(random))if(!Number.isFinite(draw)||draw<0||draw>=1)throw new SceneEventFrameworkError('INVALID_STORY_CONTENT',503);
 const context=[p.roundId,JSON.stringify(catalog),random.sceneDraw,random.narrativeDraw,p.episodeSeq],body=JSON.stringify({episodeSeq:p.episodeSeq,categoryId:p.categoryId});
 const replay=`EXISTS(${receipt} AND kind='story.category.vote.submitted' AND payload_json=json(?))`,replayArgs=[...receiptArgs(p),body];
 const own=`EXISTS(SELECT 1 FROM game_round_events WHERE event_id=? AND round_id=? AND kind='story.category.vote.submitted') AND EXISTS(SELECT 1 FROM decision)`,ownArgs=[p.eventId,p.roundId];
 const plans=[guard(active,...authArgs(p,now)),
  stmt(`WITH ${selectionCte} SELECT CASE WHEN ${replay} OR (NOT EXISTS(${receipt}) AND i.episode=MAX(COALESCE((SELECT MAX(episode_seq) FROM game_story_sessions WHERE round_id=i.round_id),1),COALESCE((SELECT MAX(json_extract(payload_json,'$.episodeSeq')) FROM game_round_events WHERE round_id=i.round_id AND kind='story.episode.offers.frozen'),1)) AND NOT EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=i.round_id AND episode_seq=i.episode) AND json_array_length(frozen.ids)>1 AND ? IN(SELECT value FROM json_each(frozen.ids))) THEN 1 ELSE json('EVENT_STATE_CONFLICT') END AS __scene_guard FROM i,frozen`,...context,...replayArgs,...receiptArgs(p),p.categoryId),
  stmt(`INSERT INTO game_round_events SELECT ?,r.round_id,r.last_event_seq+1,?,?,'story.category.vote.submitted',json(?),? FROM game_rounds r WHERE r.round_id=? AND NOT EXISTS(${receipt})`,p.eventId,p.accountId,p.clientRequestId,body,now,p.roundId,...receiptArgs(p)),guard(`changes()=1 OR ${replay}`,...replayArgs),...sync(p)];
 // chosen 的存在是獨立 guard；最後一票不能只提交票卻留下不可恢復的空決議。
 plans.push(stmt(`WITH ${selectionCte} SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM decision) OR EXISTS(SELECT 1 FROM chosen) THEN 1 ELSE json('NO_PLAYABLE_STORY') END AS __scene_guard`,...context));
 // 共用初始化裡的 gate 是相關子查詢，必須有自己的 CTE（guard 並非 INSERT 的延續）。
 const initialize=initializeSelection(p,context,p.episodeSeq,now,own,ownArgs).map(s=>!s.sql.startsWith('WITH')&&s.sql.includes('FROM decision')?{...s,sql:`WITH ${selectionCte} ${s.sql}`,values:[...context,...s.values]}:s);
 plans.push(...initialize,stmt(`SELECT sequence,kind FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`,...receiptArgs(p)));return plans;
}

export async function executeFrameworkVote(env:Env,value:unknown,now=Date.now(),options:{random?:()=>number}={}){
 const started=Date.now(),p=voteSchema.parse(value),member=memberSchema.parse(Object.fromEntries(Object.keys(memberSchema.shape).map(k=>[k,(p as any)[k]]))),body=JSON.stringify({episodeSeq:p.episodeSeq,categoryId:p.categoryId});
 const current=()=>now+Math.max(0,Date.now()-started);await assertFrameworkMember(env.DB,member,current());
 const previous=async()=>{const row=await env.DB.prepare(`SELECT sequence,kind,payload_json FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`).bind(...receiptArgs(p)).first<any>();if(!row)return null;if(row.kind!=='story.category.vote.submitted'||row.payload_json!==body)throw new SceneEventFrameworkError('EVENT_STATE_CONFLICT');return{rows:[{sequence:row.sequence,kind:row.kind}],changes:[]};};
 const old=await previous();if(old)return old;const catalog=await loadFrameworkCatalog(env).finally(()=>assertFrameworkMember(env.DB,member,current())),random=options.random??secureRandom;
 try{return await batch(env.DB,planFrameworkVote(p,catalog,current(),{sceneDraw:random(),narrativeDraw:random()}));}
 catch(error){await assertFrameworkMember(env.DB,member,current());const restored=await previous();if(restored)return restored;throw error;}
}

const latestEpisode=`SELECT MAX(COALESCE((SELECT MAX(episode_seq) FROM game_story_sessions WHERE round_id=?),1),COALESCE((SELECT MAX(json_extract(payload_json,'$.episodeSeq')) FROM game_round_events WHERE round_id=? AND kind='story.episode.offers.frozen'),1))`;
/** 只回目前場次；未決議票遮蔽另一位真人的 categoryId，完成後保留舞台與聊天。 */
export async function readFrameworkSnapshot(db:D1Database,value:unknown,now=Date.now()){
 const p=memberSchema.parse(value),episode=latestEpisode,args=[p.roundId,p.roundId];
 return authorizedBatch(db,p,now,[guard(active,...authArgs(p,now)),
  stmt(`SELECT 'round' AS record_type,'scene-event.v2' AS framework,r.round_id,r.account_low_id,r.account_high_id,r.last_event_seq,r.story_offer_category_ids_json,m.initiator_account_id,(${episode}) AS episode_seq FROM game_rounds r JOIN match_invitations m ON m.invitation_id=r.invitation_id WHERE r.round_id=?`,...args,p.roundId),
  stmt(`SELECT 'offers' AS record_type,CASE WHEN (${episode})=1 THEN r.story_offer_category_ids_json ELSE (SELECT json_extract(payload_json,'$.categoryIds') FROM game_round_events WHERE round_id=r.round_id AND kind='story.episode.offers.frozen' AND json_extract(payload_json,'$.episodeSeq')=(${episode})) END AS category_ids_json FROM game_rounds r WHERE r.round_id=?`,...args,...args,p.roundId),
  stmt(`SELECT 'category' AS record_type,category_id,code,title FROM content_story_categories WHERE category_id IN(SELECT value FROM game_rounds r,json_each(r.story_offer_category_ids_json) WHERE r.round_id=?) OR category_id IN(SELECT value FROM game_round_events e,json_each(e.payload_json,'$.categoryIds') WHERE e.round_id=? AND e.kind='story.episode.offers.frozen' AND json_extract(e.payload_json,'$.episodeSeq')=(${episode}))`,p.roundId,p.roundId,...args),
  stmt(`SELECT 'story' AS record_type,s.*,cat.code AS selected_category_code FROM game_story_sessions s JOIN content_story_categories cat ON cat.category_id=s.selected_category_id WHERE s.round_id=? AND s.episode_seq=(${episode})`,p.roundId,...args),
  stmt(`SELECT 'vote' AS record_type,e.actor_account_id,CASE WHEN e.actor_account_id=? OR EXISTS(SELECT 1 FROM game_story_sessions WHERE round_id=e.round_id AND episode_seq=json_extract(e.payload_json,'$.episodeSeq')) THEN e.payload_json ELSE json_object('episodeSeq',json_extract(e.payload_json,'$.episodeSeq')) END AS payload_json FROM game_round_events e WHERE e.round_id=? AND e.kind='story.category.vote.submitted' AND json_extract(e.payload_json,'$.episodeSeq')=(${episode}) AND e.sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=e.round_id AND v.kind=e.kind AND v.actor_account_id=e.actor_account_id AND json_extract(v.payload_json,'$.episodeSeq')=json_extract(e.payload_json,'$.episodeSeq'))`,p.accountId,p.roundId,...args),
  stmt(`SELECT 'consent' AS record_type,e.actor_account_id,e.payload_json FROM game_round_events e WHERE e.round_id=? AND e.kind='story.next.requested' AND json_extract(e.payload_json,'$.completedEpisodeSeq')=(${episode}) AND e.sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=e.round_id AND v.kind=e.kind AND v.actor_account_id=e.actor_account_id AND json_extract(v.payload_json,'$.completedEpisodeSeq')=json_extract(e.payload_json,'$.completedEpisodeSeq'))`,p.roundId,...args),
  stmt(`SELECT 'participant_progress' AS record_type,q.* FROM game_story_participant_progress q JOIN game_story_sessions s ON s.story_session_id=q.story_session_id WHERE s.round_id=? AND s.episode_seq=(${episode})`,p.roundId,...args),
  stmt(`SELECT 'cue_event' AS record_type,e.sequence,e.payload_json FROM game_round_events e WHERE e.round_id=? AND json_extract(e.payload_json,'$.episodeSeq')=(${episode}) AND e.kind='story.track.updated' AND (e.actor_account_id=? OR json_extract(e.payload_json,'$.trackScope')='shared') ORDER BY e.sequence DESC LIMIT 1`,p.roundId,...args,p.accountId),
  stmt(`SELECT 'event_instance' AS record_type,e.*,(SELECT MAX(sequence) FROM game_round_events h WHERE h.round_id=s.round_id AND h.kind='story.event.started' AND json_extract(h.payload_json,'$.eventInstanceId')=e.event_instance_id) AS event_seq FROM game_event_instances e JOIN game_story_sessions s ON s.story_session_id=e.story_session_id WHERE s.round_id=? AND s.episode_seq=(${episode})`,p.roundId,...args),
  stmt(`SELECT DISTINCT 'event_history' AS record_type,s.round_id,e.story_session_id,e.binding_id,e.repeat_group,e.track_scope,e.status FROM game_event_instances e JOIN game_story_sessions s ON s.story_session_id=e.story_session_id WHERE s.round_id=? AND e.status IN('active','completed')`,p.roundId),
  stmt(`SELECT DISTINCT 'completed_narrative' AS record_type,c.story_id FROM game_story_sessions s JOIN content_story_catalog c ON c.catalog_id=s.catalog_id JOIN game_rounds h ON h.round_id=s.round_id JOIN game_rounds r ON r.account_low_id=h.account_low_id AND r.account_high_id=h.account_high_id WHERE r.round_id=? AND s.chapter_status='completed'`,p.roundId),guard(active,...authArgs(p,now))]);
}
/** 私有固定命令：receipt 先於 R2／RNG 恢復，未知結果也先查 receipt，不重新抽選。 */
export async function executeFrameworkNext(env:Env,value:unknown,now=Date.now(),options:{random?:()=>number}={}){
 const started=Date.now(),p=nextSchema.parse(value),{accountId,sessionId,cv,accessExpiresAt,roundId}=p,member={accountId,sessionId,cv,accessExpiresAt,roundId};
 const current=()=>now+Math.max(0,Date.now()-started);await assertFrameworkMember(env.DB,member,current());
 async function previous(){const row=await env.DB.prepare(`SELECT sequence,kind,payload_json FROM game_round_events WHERE round_id=? AND actor_account_id=? AND client_request_id=?`).bind(...receiptArgs(p)).first<any>();if(!row)return null;if(row.kind!=='story.next.requested'||row.payload_json!==payload(p))throw new SceneEventFrameworkError('EVENT_STATE_CONFLICT');return{rows:[{sequence:row.sequence,kind:row.kind}],changes:[]};}
 const existing=await previous();if(existing)return existing;
 const catalog=await loadFrameworkCatalog(env).finally(()=>assertFrameworkMember(env.DB,member,current())),random=options.random??secureRandom;
 const plan=planFrameworkNext(p,catalog,current(),{sceneDraw:random(),narrativeDraw:random()});
 try{const result=await env.DB.batch(plan.map(s=>env.DB.prepare(s.sql).bind(...s.values)));return{rows:result.flatMap(r=>r.results??[]).filter(r=>typeof r==='object'&&r!==null&&!Object.hasOwn(r,'__scene_guard')),changes:result.map(r=>r.meta.changes)};}
 catch(error){await assertFrameworkMember(env.DB,member,current());const restored=await previous();if(restored)return restored;
  const offered=await env.DB.prepare(`WITH ${selectionCte} SELECT ids FROM new_offers`).bind(p.roundId,JSON.stringify(catalog),0,0,p.completedEpisodeSeq+1).first<{ids:string}>();
  if(offered?.ids==='[]')throw new SceneEventFrameworkError('NO_PLAYABLE_STORY');throw error;
 }
}
