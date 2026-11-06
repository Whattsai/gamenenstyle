import { z } from 'zod';
import type { Statement } from './commands';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const auth={accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative()};
export const matchingSchemas={
 'match.candidate.search':z.strictObject({...auth}),
 'match.candidate.persona.read':z.strictObject({...auth,candidateId:id}),
 'match.invite.create':z.strictObject({...auth,candidateId:id,clientRequestId:id,invitationId:id}),
 'match.invite.list':z.strictObject({...auth}),
 'match.invite.resolve':z.strictObject({...auth,invitationId:id,action:z.enum(['accept','decline','cancel']),roundId:id,participantLowId:id,participantHighId:id}),
 'game.round.list':z.strictObject({...auth}),
 'game.round.get':z.strictObject({...auth,roundId:id}),
 'game.round.end':z.strictObject({...auth,roundId:id})
} as const;
const stmt=(sql:string,...values:unknown[]):Statement=>({sql,values});
const session=`SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.session_id=? AND s.account_id=? AND s.credential_version=? AND a.credential_version=s.credential_version AND a.status='active' AND s.revoked_at IS NULL AND s.absolute_expires_at>? AND s.idle_expires_at>? AND ?>?`;
const authorized=(p:any,now:number)=>[p.sessionId,p.accountId,p.cv,now,now,p.accessExpiresAt,now];
const taiwanDate=(now:number)=>new Date(now+28800000).toISOString().slice(0,10);
/** 硬性安全資格，不含性別／性向；舊 pending 接受沿用發起時性向判定。 */
function hard(alias:string){return `length(trim(${alias}.nickname)) BETWEEN 2 AND 12
 AND ${alias}.birth_date IS NOT NULL AND date(${alias}.birth_date,'+18 years','floor')<=?
 AND EXISTS(SELECT 1 FROM auth_accounts a WHERE a.account_id=${alias}.account_id AND a.status='active')
 AND ((${alias}.selected_avatar_type='builtin' AND ${alias}.selected_avatar_ref IN ('male-01','male-02','male-03','male-04','male-05','male-06','male-07','male-08','female-01','female-02','female-03','female-04','female-05','female-06','female-07','female-08')
 AND (${alias}.gender IS NULL OR ${alias}.gender='diverse' OR ${alias}.selected_avatar_ref LIKE ${alias}.gender||'-%'))
 OR (${alias}.selected_avatar_type='generated' AND EXISTS(SELECT 1 FROM user_media_assets m WHERE m.asset_id=${alias}.selected_avatar_ref AND m.account_id=${alias}.account_id AND m.kind='generated_avatar' AND m.status='ready' AND m.deleted_at IS NULL)))`;}
function ready(alias:string){return `${hard(alias)} AND ${alias}.gender IN ('male','female','diverse') AND json_array_length(${alias}.romantic_orientation_json)>0`;}
const excluded=(low:string,high:string)=>`(EXISTS(SELECT 1 FROM match_invitations d WHERE d.account_low_id=${low} AND d.account_high_id=${high} AND d.status='declined') OR EXISTS(SELECT 1 FROM game_rounds e WHERE e.account_low_id=${low} AND e.account_high_id=${high} AND e.status='ended'))`;
const available=(account:string)=>`NOT EXISTS(SELECT 1 FROM game_round_participants gp WHERE gp.account_id=${account})`;
// CASE 的錯誤分支在真 SQLite 內造成 statement 失敗，D1 batch 必須回滾；不新增 marker／trigger。
const guard=(condition:string,...values:unknown[])=>stmt(`SELECT CASE WHEN ${condition} THEN 1 ELSE json('MATCH_STATE_CONFLICT') END AS __matching_guard`,...values);

function maintenance(p:any,now:number):Statement[]{
 return [stmt(`UPDATE match_invitations SET status='expired',invalidated_reason=NULL,updated_at=? WHERE status='pending' AND expires_at<=? AND ? IN(account_low_id,account_high_id) AND EXISTS(${session})`,now,now,p.accountId,...authorized(p,now)),
 stmt(`UPDATE match_invitations SET status='invalidated',invalidated_reason=CASE WHEN EXISTS(SELECT 1 FROM game_round_participants gp WHERE gp.account_id IN(match_invitations.account_low_id,match_invitations.account_high_id)) THEN 'other_round_started' ELSE 'eligibility_changed' END,updated_at=?
 WHERE status='pending' AND ? IN(account_low_id,account_high_id) AND EXISTS(${session}) AND
 (EXISTS(SELECT 1 FROM game_round_participants gp WHERE gp.account_id IN(match_invitations.account_low_id,match_invitations.account_high_id)) OR
 (SELECT COUNT(*) FROM user_profiles p WHERE p.account_id IN(match_invitations.account_low_id,match_invitations.account_high_id) AND ${hard('p')})<>2)`,now,p.accountId,...authorized(p,now),taiwanDate(now))];
}
function candidateSelect(p:any,now:number,persona:boolean):Statement{
 const fields=persona?`p.profile_id,p.nickname,p.bio,p.traits_json,p.interests_json,p.selected_avatar_type,p.selected_avatar_ref`:
 `p.profile_id,c.account_id,c.birth_date,c.gender,c.romantic_orientation_json,c.region_code,c.interests_json,c.preferences_json`;
 return stmt(`SELECT ${fields},CASE WHEN i.initiator_account_id=? THEN 'outgoing' WHEN i.invitation_id IS NOT NULL THEN 'incoming' ELSE NULL END AS invitation_state,i.invitation_id
 FROM match_conditions c JOIN user_profiles p ON p.account_id=c.account_id
 JOIN match_conditions own ON own.account_id=? JOIN user_profiles op ON op.account_id=own.account_id
 LEFT JOIN match_invitations i ON i.account_low_id=MIN(c.account_id,own.account_id) AND i.account_high_id=MAX(c.account_id,own.account_id) AND i.status='pending' AND i.expires_at>?
 WHERE c.account_id<>own.account_id AND ${ready('p')} AND ${ready('op')} AND EXISTS(${session})
 AND ${available('c.account_id')} AND ${available('own.account_id')}
 AND EXISTS(SELECT 1 FROM json_each(own.romantic_orientation_json) WHERE value=c.gender)
 AND EXISTS(SELECT 1 FROM json_each(c.romantic_orientation_json) WHERE value=own.gender)
 AND NOT ${excluded('MIN(c.account_id,own.account_id)','MAX(c.account_id,own.account_id)')}
 ${persona?'AND p.profile_id=?':''} ORDER BY p.profile_id`,p.accountId,p.accountId,now,taiwanDate(now),taiwanDate(now),...authorized(p,now),...(persona?[p.candidateId]:[]));
}

export function planMatchingCommand(command:string,p:any,now:number):Statement[]{
 const date=taiwanDate(now),authArgs=authorized(p,now);
 switch(command){
 case 'match.candidate.search':return [...maintenance(p,now),candidateSelect(p,now,false),stmt(`SELECT c.*,p.profile_id AS own_profile_id FROM match_conditions c JOIN user_profiles p ON p.account_id=c.account_id WHERE c.account_id=? AND ${ready('p')} AND ${available('c.account_id')} AND EXISTS(${session})`,p.accountId,date,...authArgs)];
 case 'match.candidate.persona.read':return [...maintenance(p,now),candidateSelect(p,now,true)];
 case 'match.invite.list':return [...maintenance(p,now),stmt(`SELECT i.*,r.round_id,p.profile_id AS candidate_id,p.nickname,p.bio,p.traits_json,p.interests_json,p.selected_avatar_type,p.selected_avatar_ref FROM match_invitations i
 JOIN user_profiles p ON p.account_id=CASE WHEN i.account_low_id=? THEN i.account_high_id ELSE i.account_low_id END
 LEFT JOIN game_rounds r ON r.invitation_id=i.invitation_id WHERE ? IN(i.account_low_id,i.account_high_id) AND EXISTS(${session}) ORDER BY i.created_at DESC,i.invitation_id DESC`,p.accountId,p.accountId,...authArgs)];
 case 'match.invite.create':{
  const eligible=candidateSelect(p,now,true);
  return [...maintenance(p,now),stmt(`INSERT INTO match_invitations(invitation_id,account_low_id,account_high_id,initiator_account_id,client_request_id,status,created_at,expires_at,updated_at)
 SELECT ?,MIN(p.account_id,?),MAX(p.account_id,?),?,?,'pending',?,?,? FROM user_profiles p
 WHERE p.profile_id=? AND p.profile_id IN(SELECT profile_id FROM (${eligible.sql}))
 AND NOT EXISTS(SELECT 1 FROM match_invitations i WHERE i.account_low_id=MIN(p.account_id,?) AND i.account_high_id=MAX(p.account_id,?) AND i.status='pending')
 AND NOT EXISTS(SELECT 1 FROM match_invitations i WHERE i.initiator_account_id=? AND i.client_request_id=?)`,p.invitationId,p.accountId,p.accountId,p.accountId,p.clientRequestId,now,now+259200000,now,p.candidateId,...eligible.values,p.accountId,p.accountId,p.accountId,p.clientRequestId),
 stmt(`SELECT i.*,r.round_id FROM match_invitations i JOIN user_profiles p ON p.profile_id=? AND p.account_id<>?
 LEFT JOIN game_rounds r ON r.invitation_id=i.invitation_id
 WHERE i.account_low_id=MIN(p.account_id,?) AND i.account_high_id=MAX(p.account_id,?) AND EXISTS(${session}) AND
 ((i.initiator_account_id=? AND i.client_request_id=?) OR (i.status='pending' AND i.expires_at>? AND NOT EXISTS(SELECT 1 FROM match_invitations k WHERE k.initiator_account_id=? AND k.client_request_id=?)))
 ORDER BY CASE WHEN i.initiator_account_id=? AND i.client_request_id=? THEN 0 ELSE 1 END LIMIT 1`,p.candidateId,p.accountId,p.accountId,p.accountId,...authArgs,p.accountId,p.clientRequestId,now,p.accountId,p.clientRequestId,p.accountId,p.clientRequestId)];
 }
 case 'match.invite.resolve':{
  const member=`invitation_id=? AND ? IN(account_low_id,account_high_id) AND EXISTS(${session})`;
  if(p.action!=='accept')return [...maintenance(p,now),stmt(`UPDATE match_invitations SET status=?,invalidated_reason=NULL,updated_at=?,responded_at=? WHERE ${member} AND status='pending' AND expires_at>? AND ${p.action==='cancel'?'initiator_account_id=?':'initiator_account_id<>?'} RETURNING *`,p.action==='cancel'?'cancelled':'declined',now,now,p.invitationId,p.accountId,...authArgs,now,p.accountId),
   stmt(`SELECT i.*,r.round_id FROM match_invitations i LEFT JOIN game_rounds r ON r.invitation_id=i.invitation_id WHERE i.invitation_id=? AND ? IN(i.account_low_id,i.account_high_id) AND EXISTS(${session}) AND ${p.action==='cancel'?'i.initiator_account_id=?':'i.initiator_account_id<>?'}`,p.invitationId,p.accountId,...authArgs,p.accountId)];
  return [...maintenance(p,now),stmt(`UPDATE match_invitations SET status='accepted',invalidated_reason=NULL,updated_at=?,responded_at=? WHERE ${member} AND initiator_account_id<>? AND status='pending' AND expires_at>?
 AND ${available('account_low_id')} AND ${available('account_high_id')} AND NOT ${excluded('match_invitations.account_low_id','match_invitations.account_high_id')}
 AND (SELECT COUNT(*) FROM user_profiles p WHERE p.account_id IN(match_invitations.account_low_id,match_invitations.account_high_id) AND ${hard('p')})=2`,now,now,p.invitationId,p.accountId,...authArgs,p.accountId,now,date),
  guard(`changes()=1 OR NOT EXISTS(SELECT 1 FROM match_invitations WHERE invitation_id=? AND status='pending' AND initiator_account_id<>? AND ? IN(account_low_id,account_high_id) AND EXISTS(${session}))`,p.invitationId,p.accountId,p.accountId,...authArgs),
  stmt(`INSERT INTO game_rounds(round_id,invitation_id,account_low_id,account_high_id,status,started_at) SELECT ?,invitation_id,account_low_id,account_high_id,'active',? FROM match_invitations WHERE invitation_id=? AND changes()=1 AND status='accepted' AND NOT EXISTS(SELECT 1 FROM game_rounds WHERE invitation_id=?)`,p.roundId,now,p.invitationId,p.invitationId),
  stmt(`INSERT INTO game_round_participants(participant_id,account_id,round_id,created_at) SELECT ?,account_low_id,round_id,? FROM game_rounds WHERE round_id=? AND changes()=1`,p.participantLowId,now,p.roundId),
  stmt(`INSERT INTO game_round_participants(participant_id,account_id,round_id,created_at) SELECT ?,account_high_id,round_id,? FROM game_rounds WHERE round_id=? AND changes()=1`,p.participantHighId,now,p.roundId),
  guard(`NOT EXISTS(SELECT 1 FROM match_invitations i WHERE i.invitation_id=? AND i.status='accepted' AND ((SELECT COUNT(*) FROM game_rounds r WHERE r.invitation_id=i.invitation_id)<>1 OR (SELECT COUNT(*) FROM game_round_participants gp JOIN game_rounds r ON r.round_id=gp.round_id WHERE r.invitation_id=i.invitation_id AND gp.account_id IN(i.account_low_id,i.account_high_id))<>2))`,p.invitationId),
  stmt(`UPDATE match_invitations SET status='invalidated',invalidated_reason='other_round_started',updated_at=? WHERE status='pending' AND invitation_id<>? AND EXISTS(SELECT 1 FROM game_rounds r WHERE r.invitation_id=? AND r.status='active' AND (match_invitations.account_low_id IN(r.account_low_id,r.account_high_id) OR match_invitations.account_high_id IN(r.account_low_id,r.account_high_id)))`,now,p.invitationId,p.invitationId),
  stmt(`SELECT i.*,r.round_id FROM match_invitations i LEFT JOIN game_rounds r ON r.invitation_id=i.invitation_id WHERE i.invitation_id=? AND i.initiator_account_id<>? AND ? IN(i.account_low_id,i.account_high_id) AND EXISTS(${session})`,p.invitationId,p.accountId,p.accountId,...authArgs)];
 }
 case 'game.round.list':case 'game.round.get':return [stmt(`SELECT r.round_id,r.invitation_id,r.status,r.started_at,p.profile_id AS candidate_id,p.nickname,p.bio,p.traits_json,p.interests_json,p.selected_avatar_type,p.selected_avatar_ref
 FROM game_rounds r JOIN game_round_participants gp ON gp.round_id=r.round_id AND gp.account_id=?
 JOIN user_profiles p ON p.account_id=CASE WHEN r.account_low_id=? THEN r.account_high_id ELSE r.account_low_id END
 WHERE r.status='active' AND (SELECT COUNT(*) FROM game_round_participants q WHERE q.round_id=r.round_id AND q.account_id IN(r.account_low_id,r.account_high_id))=2 AND EXISTS(${session}) ${command==='game.round.get'?'AND r.round_id=?':''}`,p.accountId,p.accountId,...authArgs,...(command==='game.round.get'?[p.roundId]:[]))];
 case 'game.round.end':return [stmt(`UPDATE game_rounds SET status='ended',ended_at=? WHERE round_id=? AND status='active' AND ? IN(account_low_id,account_high_id) AND EXISTS(${session}) AND (SELECT COUNT(*) FROM game_round_participants gp WHERE gp.round_id=game_rounds.round_id AND gp.account_id IN(game_rounds.account_low_id,game_rounds.account_high_id))=2 RETURNING round_id`,now,p.roundId,p.accountId,...authArgs),
  guard(`changes()=1 OR EXISTS(SELECT 1 FROM game_rounds WHERE round_id=? AND status='ended' AND ? IN(account_low_id,account_high_id) AND EXISTS(${session}))`,p.roundId,p.accountId,...authArgs),
  stmt(`DELETE FROM game_round_participants WHERE round_id=? AND EXISTS(SELECT 1 FROM game_rounds r WHERE r.round_id=? AND r.status='ended' AND ? IN(r.account_low_id,r.account_high_id) AND EXISTS(${session}))`,p.roundId,p.roundId,p.accountId,...authArgs),
  guard(`NOT EXISTS(SELECT 1 FROM game_round_participants gp JOIN game_rounds r ON r.round_id=gp.round_id WHERE r.round_id=? AND r.status='ended')`,p.roundId)];
 default:throw new Error('UNKNOWN_COMMAND');
 }
}

/** 與來源同一 batch 同步；無關個資由 executeCommand 的 CAS 前讀差異判斷省略整段。 */
export function projectionPlan(p:any,now:number):Statement[]{
 const date=taiwanDate(now),revision=p.expectedRevision+1;
 const current=`p.account_id=? AND p.revision=? AND EXISTS(${session})`;
 const args=[p.accountId,revision,...authorized(p,now)];
 return [stmt(`DELETE FROM match_conditions WHERE account_id=? AND EXISTS(SELECT 1 FROM user_profiles p WHERE ${current} AND NOT COALESCE((${ready('p')}),0))`,p.accountId,...args,date),
 stmt(`INSERT INTO match_conditions(condition_id,account_id,gender,romantic_orientation_json,birth_date,region_code,interests_json,preferences_json,created_at,updated_at)
 SELECT p.profile_id,p.account_id,p.gender,p.romantic_orientation_json,p.birth_date,p.region_code,p.interests_json,p.preferences_json,?,? FROM user_profiles p WHERE ${current} AND ${ready('p')}
 ON CONFLICT(account_id) DO UPDATE SET gender=excluded.gender,romantic_orientation_json=excluded.romantic_orientation_json,birth_date=excluded.birth_date,region_code=excluded.region_code,interests_json=excluded.interests_json,preferences_json=excluded.preferences_json,updated_at=excluded.updated_at
 WHERE match_conditions.gender IS NOT excluded.gender OR match_conditions.romantic_orientation_json IS NOT excluded.romantic_orientation_json OR match_conditions.birth_date IS NOT excluded.birth_date OR match_conditions.region_code IS NOT excluded.region_code OR match_conditions.interests_json IS NOT excluded.interests_json OR match_conditions.preferences_json IS NOT excluded.preferences_json`,now,now,...args,date),
 guard(`NOT EXISTS(SELECT 1 FROM user_profiles p WHERE ${current} AND NOT (CASE WHEN COALESCE((${ready('p')}),0) THEN EXISTS(SELECT 1 FROM match_conditions c WHERE c.account_id=p.account_id AND c.gender IS p.gender AND c.romantic_orientation_json IS p.romantic_orientation_json AND c.birth_date IS p.birth_date AND c.region_code IS p.region_code AND c.interests_json IS p.interests_json AND c.preferences_json IS p.preferences_json) ELSE NOT EXISTS(SELECT 1 FROM match_conditions c WHERE c.account_id=p.account_id) END))`,...args,date)];
}

export function profileAffectsMatching(command:string,p:any,previous:any):boolean{
 if(command!=='profile.update')return true;
 if(!previous)return true;
 const canonical=(v:unknown)=>JSON.stringify([...(v as string[])].sort());
 if(previous.nickname!==p.nickname || previous.birth_date!==p.birthDate || previous.region_code!==p.regionCode || previous.gender!==p.gender || previous.romantic_orientation_json!==canonical(p.romanticOrientation))return true;
 const interests=JSON.stringify({interestTagIds:[...p.interestTagIds].sort(),topicTagIds:[...p.topicTagIds].sort(),valueTagIds:[...p.valueTagIds].sort()});
 const prefs=JSON.stringify({weekendPreference:p.weekendPreference,sleepSchedule:p.sleepSchedule,conversationStyle:p.conversationStyle,expectedInteractionFrequency:p.expectedInteractionFrequency,relationshipMode:p.relationshipMode,preferredAgeMin:p.preferredAgeMin,preferredAgeMax:p.preferredAgeMax,preferredRegionCodes:[...p.preferredRegionCodes].sort(),sharedInterestWeight:p.sharedInterestWeight});
 return previous.interests_json!==interests || previous.preferences_json!==prefs;
}
