import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {expect,it} from 'vitest';
// @ts-expect-error 受控 local wrapper 的固定 SQL 政策，驗證真 D1 交易。
import {applySceneEventUpgrade,planSceneEventUpgrade} from '../../tools/scene-event-local-policy.mjs';
const config={name:'datinghigh-local',vars:{APP_ENV:'local',EmailDeliveryMode:'Log'},d1_databases:[{binding:'DB',database_name:'datinghigh-local',database_id:'local-foundation'}],r2_buckets:[{binding:'FILES',bucket_name:'datinghigh-local-private'},{binding:'STORY_CONTENT',bucket_name:'datinghigh-local-story-content'}]};
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
for(const baseline of ['0005','0006'])it(`SEF-IT-128/129: ${baseline} clean rebuild retains protected data, rolls back failure and replay retains new play`,async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'track-upgrade-'+baseline}}));
 try{const db=await mf.getD1Database('DB')as unknown as D1Database;
 const names=readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n.slice(0,4)<=baseline).sort();
 for(const name of names)await db.batch(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT NOT NULL UNIQUE)').run();for(const name of names)await db.prepare('INSERT INTO d1_migrations(name)VALUES(?)').bind(name).run();
 const rows=async(sql:string)=>(await db.prepare(sql).all()).results;
 for(const n of [1,2]){await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,1,1)").bind(id(n),`upgrade-${n}@example.invalid`,1).run();await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,created_at,updated_at)VALUES(?,?,?,1,1)").bind(id(n+10),id(n),'保留資料').run();}
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,1,100,1,1)").bind(id(30),id(1),id(2),id(1),id(31)).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',1,NULL,0,?)").bind(id(40),id(30),id(1),id(2),JSON.stringify([id(60)])).run();
 const accounts=await rows('SELECT * FROM auth_accounts'),profiles=await rows('SELECT * FROM user_profiles');
 const plan=planSceneEventUpgrade(config,baseline);const fault=plan.map((s:any)=>db.prepare(s.sql.startsWith('CREATE TABLE game_story_participant_progress')?s.sql.replace('revision INTEGER NOT NULL','revision INTEGER NOT NULL BROKEN'):s.sql).bind(...s.values));
 // 明確在最後加失敗，必須連清理和 DDL 都 rollback。
 await expect(db.batch([...fault,db.prepare("SELECT json('controlled upgrade failure')")])).rejects.toThrow();
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(1);expect(await rows("SELECT name FROM sqlite_master WHERE name='game_story_participant_progress'")).toEqual([]);
 expect(await applySceneEventUpgrade(db,config)).toMatchObject({alreadyApplied:false,retainedAccounts:2,retainedProfiles:2});
 expect(await rows('SELECT * FROM auth_accounts')).toEqual(accounts);expect(await rows('SELECT * FROM user_profiles')).toEqual(profiles);expect(await rows('SELECT * FROM game_rounds')).toEqual([]);
 expect(await rows("SELECT name FROM sqlite_master WHERE name='game_interaction_instances'")).toEqual([]);expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,1,100,1,NULL)").bind(id(50),id(1),id(2),id(1),id(51)).run();
 await expect(applySceneEventUpgrade(db,config)).resolves.toMatchObject({alreadyApplied:true});expect(await rows('SELECT * FROM match_invitations')).toHaveLength(1);
 for(const bad of [{...config,name:'production'},{...config,vars:{...config.vars,APP_ENV:'production'}},{...config,d1_databases:[{...config.d1_databases[0],remote:true}]}])await expect(applySceneEventUpgrade(db,bad)).rejects.toThrow();
 }finally{await mf.dispose();}
},30000);
