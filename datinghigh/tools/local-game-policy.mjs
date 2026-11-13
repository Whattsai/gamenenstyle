// 本地操作專用；不打包到Api／Worker，不接受任意SQL、owner或遠端旗標。
export function localGameEndStatements(roundId,now=Date.now()){
 if(typeof roundId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(roundId)||!Number.isSafeInteger(now)||now<0)throw new Error('A valid UUIDv7 round-id and timestamp are required');
 const round=`round_id='${roundId}'`;
 const guard=condition=>`SELECT CASE WHEN ${condition} THEN 1 ELSE json('INVALID_LOCAL_GAME_STATE') END AS local_game_guard`;
 return [
  guard(`EXISTS(SELECT 1 FROM game_rounds r WHERE r.${round} AND ((r.status='active' AND (SELECT COUNT(*) FROM game_active_round_claims gp WHERE gp.round_id=r.round_id)=2 AND (SELECT COUNT(*) FROM game_active_round_claims gp WHERE gp.round_id=r.round_id AND gp.account_id IN(r.account_low_id,r.account_high_id))=2) OR (r.status='ended' AND NOT EXISTS(SELECT 1 FROM game_active_round_claims gp WHERE gp.round_id=r.round_id))))`),
  `UPDATE game_rounds SET status='ended',ended_at=${now} WHERE ${round} AND status='active'`,
  guard(`EXISTS(SELECT 1 FROM game_rounds WHERE ${round} AND status='ended' AND ended_at IS NOT NULL)`),
  `UPDATE game_interaction_instances SET status='cancelled',completed_at=${now} WHERE status='active' AND story_session_id IN(SELECT story_session_id FROM game_story_sessions WHERE ${round}) AND EXISTS(SELECT 1 FROM game_rounds WHERE ${round} AND status='ended')`,
  guard(`NOT EXISTS(SELECT 1 FROM game_interaction_instances i JOIN game_story_sessions s ON s.story_session_id=i.story_session_id WHERE s.${round} AND i.status='active')`),
  `DELETE FROM game_active_round_claims WHERE ${round} AND EXISTS(SELECT 1 FROM game_rounds WHERE ${round} AND status='ended')`,
  guard(`NOT EXISTS(SELECT 1 FROM game_active_round_claims WHERE ${round})`),
  `SELECT round_id,status,ended_at,(SELECT COUNT(*) FROM game_active_round_claims gp WHERE gp.round_id=r.round_id) AS active_participants FROM game_rounds r WHERE r.${round}`
 ];
}
