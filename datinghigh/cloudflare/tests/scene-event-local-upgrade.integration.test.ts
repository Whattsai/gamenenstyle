import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';
import {afterAll,beforeAll,expect,it} from 'vitest';
// @ts-expect-error 只有已識別 local wrapper 可呼叫的固定政策。
import {planSceneEventUpgrade,applySceneEventUpgrade,validateSceneEventTarget} from '../../tools/scene-event-local-policy.mjs';
let mf:Miniflare,db:D1Database;
const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,now=Date.UTC(2026,10,13);
const rows=async(sql:string)=>(await db.prepare(sql).all()).results;
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-upgrade'}}));db=await mf.getD1Database('DB')as unknown as D1Database;
 for(const name of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql','0005_story_dialogue_exit.sql'])await db.batch(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare("INSERT INTO d1_migrations(name)VALUES('0005_story_dialogue_exit.sql')").run();
 for(const n of [1,2])await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`upgrade-${n}@example.invalid`,now,now,now).run();
 await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,created_at,updated_at)VALUES(?,?,'保留資料',?,?)").bind(id(3),id(1),now,now).run();
 await db.prepare("INSERT INTO user_media_assets VALUES(?,?,'personal_photo','private/retained','image/jpeg',0,'ready',?,NULL)").bind(id(4),id(1),now).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(5),id(1),id(2),id(1),id(6),now,now+10000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(7),id(5),id(1),id(2),now,JSON.stringify([id(8)])).run();
});
afterAll(async()=>{await mf?.dispose();});
it('local upgrade rejects remote/unknown targets and rolls back every purge on a zero-row operation',async()=>{
 for(const mutate of [(c:any)=>c.vars.APP_ENV='production',(c:any)=>c.d1_databases[0].database_id='cloud-id',(c:any)=>c.r2_buckets[1].bucket_name='private-unknown']){const c=structuredClone(config);mutate(c);expect(()=>validateSceneEventTarget(c)).toThrow();}
 const plans=planSceneEventUpgrade(config),index=plans.findIndex((s:any)=>s.sql==='DELETE FROM game_rounds');plans[index].sql+=' WHERE 0';
 await expect(db.batch(plans.map((s:any)=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect(await rows('SELECT * FROM game_rounds')).toHaveLength(1);expect(await rows("SELECT * FROM sqlite_master WHERE name='content_scene_catalog'")).toEqual([]);
});
it('only old game data is rebuilt and a replay never deletes newly created framework data',async()=>{
 const accounts=await rows('SELECT * FROM auth_accounts'),profiles=await rows('SELECT * FROM user_profiles'),photos=await rows('SELECT * FROM user_media_assets');
 await applySceneEventUpgrade(db,config);expect(await rows('SELECT * FROM game_rounds')).toEqual([]);expect(await rows('SELECT * FROM match_invitations')).toEqual([]);
 expect(await rows('SELECT * FROM auth_accounts')).toEqual(accounts);expect(await rows('SELECT * FROM user_profiles')).toEqual(profiles);expect(await rows('SELECT * FROM user_media_assets')).toEqual(photos);
 await db.prepare("INSERT INTO content_story_categories VALUES(?,'romance','v1','浪漫','[]',1,'draft',NULL)").bind(id(20)).run();await applySceneEventUpgrade(db,config);expect(await rows('SELECT * FROM content_story_categories')).toHaveLength(1);
});
