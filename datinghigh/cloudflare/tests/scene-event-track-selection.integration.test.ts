import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,beforeEach,expect,it} from 'vitest';
// @ts-expect-error 受控 Publisher 與正式內容共用同一建構器。
import {buildSceneEventTrackBundle} from '../../tools/scene-event-content-policy.mjs';
// @ts-expect-error 固定 prepared SQL 發布器。
import {publishSceneEventBundles} from '../../tools/scene-event-publish-policy.mjs';
import {executeFrameworkAcceptance,readFrameworkSnapshot,loadFrameworkCatalog,planFrameworkAcceptance} from '../src/scene-event-commands';

let mf:Miniflare,db:D1Database,bucket:R2Bucket;
const now=Date.UTC(2026,10,16),id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const rows=async(sql:string,...values:unknown[])=>(await db.prepare(sql).bind(...values).all()).results as any[];
const auth=(actor=1)=>({accountId:id(actor),sessionId:id(100+actor),cv:1,accessExpiresAt:now+600000,roundId:id(500)});
const acceptance=()=>{const p=auth(1);return{...p,invitationId:id(450),action:'accept',participantLowId:id(511),participantHighId:id(512)};};
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-track-selection'},r2Buckets:['STORY_CONTENT']}));db=await mf.getD1Database('DB')as unknown as D1Database;bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0008').sort())await db.batch(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 const content=JSON.parse(readFileSync(new URL('../../contracts/rain-bookshop-last-order.json',import.meta.url),'utf8'));
 const bundle=buildSceneEventTrackBundle(content,new URL('../../',import.meta.url),{sceneCatalogId:id(5001),narrativeCatalogId:id(5002),categories:[{categoryId:id(4003),code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading','coffee'],recommendationPriority:1}]});
 await publishSceneEventBundles(db,bucket,[bundle],{now});
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 for(const table of ['game_event_instances','game_story_participant_progress','game_scene_visits','game_round_events','game_story_sessions','game_active_round_claims','game_rounds','match_invitations','user_profiles','auth_sessions','auth_accounts'])await db.prepare('DELETE FROM '+table).run();
 for(const n of [1,2]){await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`track-select-${n}@example.invalid`,now,now,now).run();await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(100+n),id(n),now,now+2592000000,now+604800000).run();await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,birth_date,gender,selected_avatar_type,selected_avatar_ref,interests_json,created_at,updated_at)VALUES(?,?,?,'1990-01-01','diverse','builtin','male-01',?,?,?)").bind(id(200+n),id(n),'玩家',JSON.stringify({interestTagIds:['reading']}),now,now).run();}
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,?,?,?,NULL)").bind(id(450),id(1),id(2),id(2),id(451),now,now+86400000,now).run();
});
it('SEF-IT-081: acceptance atomically creates the session, two original-role entries, world and one visit',async()=>{
 await executeFrameworkAcceptance({DB:db,STORY_CONTENT:bucket},acceptance(),now,{random:()=>.25});
 expect(await rows('SELECT account_id,role,current_node_id,current_area_id,revision FROM game_story_participant_progress ORDER BY role')).toEqual([{account_id:id(1),role:'acceptor',current_node_id:'a01',current_area_id:'shelves',revision:1},{account_id:id(2),role:'inviter',current_node_id:'i01',current_area_id:'entrance',revision:1}]);
 expect(await rows('SELECT * FROM game_scene_visits')).toHaveLength(1);const story=(await rows('SELECT * FROM game_story_sessions'))[0];expect(story.shared_revision).toBe(1);expect(JSON.parse(story.world_state_json).objects['order-tag-27']).toBe('on-bag');
 const snapshot=await readFrameworkSnapshot(db,auth(1),now);expect(snapshot.rows.filter((r:any)=>r.record_type==='participant_progress')).toHaveLength(2);
 const unreadable={get:async()=>{throw Error('must not reread R2');}}as unknown as R2Bucket;await executeFrameworkAcceptance({DB:db,STORY_CONTENT:unreadable},acceptance(),now);expect(await rows('SELECT * FROM game_story_participant_progress')).toHaveLength(2);
});
it('SEF-IT-081/124: failure of either progress insert rolls back invitation, session, claims, visit and selection events',async()=>{
 const catalog=await loadFrameworkCatalog({DB:db,STORY_CONTENT:bucket});
 for(const targetRole of ['inviter','acceptor']){
  const plan=planFrameworkAcceptance(acceptance(),catalog,now,{sceneDraw:.25,narrativeDraw:.25});let replaced=false;
  const statements=plan.map(s=>{let sql=s.sql;if(sql.includes('INSERT INTO game_story_participant_progress')&&sql.includes("'"+targetRole+"'")){sql=sql.replace(' WHERE s.story_session_id=?',' WHERE 0 AND s.story_session_id=?');replaced=true;}return db.prepare(sql).bind(...s.values);});expect(replaced).toBe(true);await expect(db.batch(statements)).rejects.toThrow();
  for(const table of ['game_story_sessions','game_story_participant_progress','game_scene_visits','game_rounds','game_round_events','game_active_round_claims'])expect(await rows('SELECT * FROM '+table)).toEqual([]);
  expect((await rows('SELECT status FROM match_invitations'))[0].status).toBe('pending');
 }
});
