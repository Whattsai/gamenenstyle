/** local wrapper 已解析的已知 instance 設定才可清舊遊戲。 */
export function validateStoryUpgradeTarget(config){
 if(config?.vars?.APP_ENV!=='local'||!/^datinghigh-local(?:-[a-z0-9-]+)?$/.test(config.name)||config.d1_databases?.length!==1||config.d1_databases[0].binding!=='DB'||config.d1_databases[0].database_name!=='datinghigh-local'||config.d1_databases[0].database_id!=='local-foundation')throw new Error('STORY_UPGRADE_TARGET_FORBIDDEN');
}
export function oldGamePurgeStatements(){return [
 'DELETE FROM game_round_participants',
 "SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_round_participants) THEN 1 ELSE json('PURGE_CLAIMS_FAILED') END",
 'DELETE FROM game_rounds',
 "SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_rounds) THEN 1 ELSE json('PURGE_ROUNDS_FAILED') END",
 'DELETE FROM match_invitations',
 "SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM match_invitations) THEN 1 ELSE json('PURGE_INVITATIONS_FAILED') END"
];}
