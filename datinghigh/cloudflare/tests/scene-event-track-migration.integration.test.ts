import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,expect,it} from 'vitest';
let mf:Miniflare,db:D1Database;
const id=(n:number)=>`019a281e-0000-7000-8000-${n.toString().padStart(12,'0')}`;
const run=(sql:string)=>db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
const all=async(sql:string)=>(await db.prepare(sql).all()).results as any[];
const migration=()=>readFileSync(new URL('../migrations/0007_scene_event_tracks.sql',import.meta.url),'utf8');
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-track-migration'}}));db=await mf.getD1Database('DB')as unknown as D1Database;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0007').sort())await run(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8'));
});
afterAll(async()=>{await mf?.dispose();});
it('SEF-IT-128: refuses non-empty old sessions; protects identities and applies the final schema after explicit cleanup',async()=>{
 for(const n of [1,2])await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`track-${n}@example.invalid`,1,1,1).run();
 await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,created_at,updated_at)VALUES(?,?,?,?,?)").bind(id(3),id(1),'保留',1,1).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(4),id(1),id(2),id(1),id(5),1,100,1,1).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(6),id(4),id(1),id(2),1,JSON.stringify([id(7)])).run();
 const accounts=await all('SELECT * FROM auth_accounts'),profiles=await all('SELECT * FROM user_profiles');
 await expect(run(migration())).rejects.toThrow();expect((await all('PRAGMA table_info(game_story_sessions)')).map(c=>c.name)).toContain('current_node_id');
 await db.prepare('DELETE FROM game_rounds').run();await run(migration());
 expect(await all('SELECT * FROM auth_accounts')).toEqual(accounts);expect(await all('SELECT * FROM user_profiles')).toEqual(profiles);
 expect(await all("SELECT name FROM sqlite_master WHERE type='table' AND name='game_interaction_instances'")).toEqual([]);
 const columns=(await all('PRAGMA table_info(game_story_sessions)')).map(c=>c.name);expect(columns).not.toContain('current_node_id');expect(columns).not.toContain('progress_revision');expect(columns).toContain('shared_revision');expect(columns).toContain('world_state_json');
 expect(await all('PRAGMA table_info(game_story_participant_progress)')).toHaveLength(7);
 expect(await all('PRAGMA table_info(game_event_instances)')).toHaveLength(12);expect(await all('PRAGMA foreign_key_check')).toEqual([]);
 expect(await all("SELECT name FROM sqlite_master WHERE type='trigger'")).toEqual([]);
});
it('participant role, FK, revision and JSON constraints are enforced by real D1',async()=>{
 await expect(db.prepare('INSERT INTO game_story_participant_progress VALUES(?,?,?,?,?,?,?)').bind(id(10),id(1),'inviter','entry','entrance',1,1).run()).rejects.toThrow();
 await db.prepare("INSERT INTO content_story_catalog(catalog_id,story_id,version,interest_tag_ids_json,recommendation_priority,manifest_key,manifest_sha256,status)VALUES(?,'test-story','v2','[]',1,'test',?,'draft')").bind(id(11),'a'.repeat(64)).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(6),id(4),id(1),id(2),1,JSON.stringify([id(7)])).run();
 await db.prepare("INSERT INTO game_story_sessions(story_session_id,round_id,episode_seq,catalog_id,chapter_status,shared_revision,created_at,updated_at,world_state_json)VALUES(?,?,1,?,'playing',1,1,1,'{}')").bind(id(12),id(6),id(11)).run();
 await db.prepare('INSERT INTO game_story_participant_progress VALUES(?,?,?,?,?,?,?)').bind(id(12),id(1),'inviter','i-entry','entrance',1,1).run();
 for(const values of [[id(12),id(2),'inviter','a-entry','shelves',1,1],[id(12),id(2),'shared','a-entry','shelves',1,1],[id(12),id(2),'acceptor','a-entry','shelves',0,1]])await expect(db.prepare('INSERT INTO game_story_participant_progress VALUES(?,?,?,?,?,?,?)').bind(...values).run()).rejects.toThrow();
 for(const world of ['[]','null','"value"','x'.repeat(16385)])await expect(db.prepare('UPDATE game_story_sessions SET world_state_json=?').bind(world).run()).rejects.toThrow();
 expect(await all('SELECT * FROM game_story_participant_progress')).toHaveLength(1);
});
