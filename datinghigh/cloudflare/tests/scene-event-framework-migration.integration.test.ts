import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,expect,it} from 'vitest';
import {ready,probeText} from '../src/platform';

let mf:Miniflare,db:D1Database;
const migration=new URL('../migrations/0006_scene_event_framework.sql',import.meta.url);
const id=(n:number)=>`019a281e-0000-7000-8000-${n.toString().padStart(12,'0')}`;
const now=Date.UTC(2026,10,13);
const batch=(text:string)=>db.batch(text.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
const rows=async(sql:string)=>(await db.prepare(sql).all()).results as any[];
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-event-schema'}}));
 db=await mf.getD1Database('DB') as unknown as D1Database;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0006').sort())await batch(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8'));
});
afterAll(async()=>{await mf?.dispose();});

it('SEF-IT-067: migration rejects old live story offers atomically and preserves account/profile data',async()=>{
 for(const n of [1,2])await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`schema-${n}@example.invalid`,now,now,now).run();
 await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,created_at,updated_at) VALUES(?,?,?,?,?)").bind(id(3),id(1),'保留資料',now,now).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(4),id(1),id(2),id(1),id(5),now,now+86400000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(6),id(4),id(1),id(2),now,JSON.stringify([id(7)])).run();
 const accounts=await rows('SELECT * FROM auth_accounts'),profiles=await rows('SELECT * FROM user_profiles');
 await expect(batch(readFileSync(migration,'utf8'))).rejects.toThrow();
 expect(await rows("SELECT name FROM sqlite_master WHERE name='content_story_categories'")).toEqual([]);
 expect(await rows('SELECT * FROM auth_accounts')).toEqual(accounts);expect(await rows('SELECT * FROM user_profiles')).toEqual(profiles);
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(1);
 // 僅刪除本測試自己建立的隔離 fixture，沒有接觸任何本地玩家環境。
 await db.prepare('DELETE FROM game_rounds').run();await batch(readFileSync(migration,'utf8'));
 expect(await rows('SELECT * FROM auth_accounts')).toEqual(accounts);expect(await rows('SELECT * FROM user_profiles')).toEqual(profiles);
});

it('SEF-IT-052/067: exactly five tables, constrained JSON/FK/versions and zero triggers',async()=>{
 const expected={content_story_categories:8,content_scene_catalog:8,content_scene_category_links:2,game_scene_visits:6,game_event_instances:11};
 for(const [table,count] of Object.entries(expected))expect(await rows(`PRAGMA table_info(${table})`)).toHaveLength(count);
 expect(await rows("SELECT name FROM sqlite_master WHERE type='trigger'")).toEqual([]);
 expect(await rows("SELECT name FROM sqlite_master WHERE type='table' AND name='content_event_catalog'")).toEqual([]);
 expect((await rows('PRAGMA table_info(game_rounds)')).map(c=>c.name)).toContain('story_offer_category_ids_json');
 expect((await rows('PRAGMA table_info(content_story_catalog)')).map(c=>c.name).slice(-4)).toEqual(['scene_catalog_id','sequence_group_id','sequence_order','prerequisites_json']);
 await db.prepare("INSERT INTO content_story_categories VALUES(?, 'romance','v1','浪漫','[\"reading\"]',1,'published',?)").bind(id(10),now).run();
 await expect(db.prepare("INSERT INTO content_story_categories VALUES(?, 'romance','v2','浪漫','[]',1,'published',?)").bind(id(11),now).run()).rejects.toThrow();
 await expect(db.prepare("INSERT INTO content_scene_category_links VALUES(?,?)").bind(id(12),id(10)).run()).rejects.toThrow();
 await expect(db.prepare("INSERT INTO content_story_categories VALUES(?, 'mystery','v1','懸疑','{}',1,'draft',NULL)").bind(id(13)).run()).rejects.toThrow();
 expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
});
it('readiness requires the complete framework schema, indices and content/realtime dependencies',async()=>{
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare("INSERT INTO d1_migrations(name)VALUES('0006_scene_event_framework.sql')").run();
 const env={DB:db,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0006_scene_event_framework.sql',FILES:{get:async()=>({text:async()=>probeText})},STORY_CONTENT:{},GAME_ROOMS:{},ROUND_TICKET_HMAC_KEY:'isolated-ready-key-32-characters-only'}as any;
 await expect(ready(env)).rejects.toThrow();
 await batch(readFileSync(new URL('../migrations/0007_scene_event_tracks.sql',import.meta.url),'utf8'));await db.prepare("INSERT INTO d1_migrations(name)VALUES('0007_scene_event_tracks.sql')").run();env.EXPECTED_MIGRATION='0007_scene_event_tracks.sql';
 expect(await ready(env)).toEqual({status:'ready',probe:probeText});
 await expect(ready({...env,STORY_CONTENT:undefined})).rejects.toThrow();
 await db.prepare('DROP INDEX idx_game_event_repeat').run();await expect(ready(env)).rejects.toThrow();
});
