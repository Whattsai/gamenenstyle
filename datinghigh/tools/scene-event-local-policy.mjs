import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateStoryUpgradeTarget} from './story-content-policy.mjs';

export const sceneEventMigration='0007_scene_event_tracks.sql';
export function validateSceneEventTarget(config){
 validateStoryUpgradeTarget(config);
 const buckets=config.r2_buckets??[];
 if(config.vars.EmailDeliveryMode!=='Log'||config.d1_databases.some(d=>d.remote===true)||buckets.some(b=>b.remote===true)||!buckets.some(b=>b.binding==='FILES'&&/^datinghigh-local(?:-[a-z0-9-]+)?-private$/.test(b.bucket_name))||!buckets.some(b=>b.binding==='STORY_CONTENT'&&/^datinghigh-local(?:-[a-z0-9-]+)?-story-content$/.test(b.bucket_name)))throw new Error('SCENE_FRAMEWORK_TARGET_FORBIDDEN');
 return {name:config.name,databaseId:config.d1_databases[0].database_id};
}
const stmt=(sql,...values)=>({sql,values});
const guard=(condition,...values)=>stmt(`SELECT CASE WHEN ${condition} THEN 1 ELSE json('SCENE_FRAMEWORK_UPGRADE_CONFLICT') END`,...values);
export function planSceneEventUpgrade(config,baseline='0006'){
 validateSceneEventTarget(config);
 if(!['0005','0006'].includes(baseline))throw new Error('UNKNOWN_SCENE_BASELINE');
 const out=[guard(`EXISTS(SELECT 1 FROM d1_migrations WHERE name=?) AND NOT EXISTS(SELECT 1 FROM d1_migrations WHERE name=?)`,baseline==='0006'?'0006_scene_event_framework.sql':'0005_story_dialogue_exit.sql',sceneEventMigration)];
 const tables=[...(baseline==='0006'?['game_event_instances','game_scene_visits']:[]),'game_interaction_instances','game_round_events','game_story_sessions','game_active_round_claims','game_rounds','match_invitations',...(baseline==='0006'?['content_scene_category_links']:[]),'content_story_catalog',...(baseline==='0006'?['content_scene_catalog','content_story_categories']:[])];
 for(const table of tables)out.push(stmt(`DELETE FROM ${table}`),guard(`NOT EXISTS(SELECT 1 FROM ${table})`));
 for(const name of [...(baseline==='0005'?['0006_scene_event_framework.sql']:[]),sceneEventMigration]){
  const sql=readFileSync(new URL('../cloudflare/migrations/'+name,import.meta.url),'utf8');
  out.push(...sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>stmt(s)),stmt('INSERT INTO d1_migrations(name)VALUES(?)',name));
 }return out;
}
const protectedTables={auth_accounts:'account_id',auth_external_identities:'identity_id',auth_sessions:'session_id',auth_refresh_tokens:'token_id',auth_email_challenges:'challenge_id',common_rate_limit_buckets:'bucket_id',user_profiles:'profile_id',user_media_assets:'asset_id',match_conditions:'condition_id'};
async function fingerprint(db){
 const hashes={};for(const [table,key]of Object.entries(protectedTables)){const rows=(await db.prepare(`SELECT * FROM ${table} ORDER BY ${key}`).all()).results;hashes[table]={count:rows.length,sha256:createHash('sha256').update(JSON.stringify(rows)).digest('hex')};}return hashes;
}
/** 呼叫端先暫停已識別 instance 的 writer 並備份；只有固定遊戲表進入同一個原子 batch。 */
export async function applySceneEventUpgrade(db,config){
 validateSceneEventTarget(config);
 if(await db.prepare('SELECT 1 FROM d1_migrations WHERE name=?').bind(sceneEventMigration).first())return{alreadyApplied:true};
 const baseline=await db.prepare("SELECT 1 FROM d1_migrations WHERE name='0006_scene_event_framework.sql'").first()?'0006':'0005';
 const before=await fingerprint(db);await db.batch(planSceneEventUpgrade(config,baseline).map(s=>db.prepare(s.sql).bind(...s.values)));
 if(JSON.stringify(before)!==JSON.stringify(await fingerprint(db)))throw new Error('PROTECTED_DATA_CHANGED');
 return{alreadyApplied:false,retainedAccounts:before.auth_accounts.count,retainedProfiles:before.user_profiles.count,retainedMedia:before.user_media_assets.count};
}
