import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,beforeEach,expect,it} from 'vitest';
import {ready} from '../src/platform';
import {serveStoryAsset} from '../src/story-content';
import {executeCommand} from '../src/commands';
import {executeFrameworkAcceptance,executeFrameworkEnd} from '../src/scene-event-commands';
import {readAuthorizedSceneEventContent} from '../src/scene-event-read';
// @ts-expect-error 真 D1／R2 的測試用 v2 變體建構。
import {buildTrackFixture} from '../../tests/support/scene-event-content-fixture.mjs';
// @ts-expect-error 正式本地 Publisher。
import {publishSceneEventBundles} from '../../tools/scene-event-publish-policy.mjs';
// @ts-expect-error 歷史 migration 的固定清理政策，非執行引擎。
import {oldGamePurgeStatements} from '../../tools/story-content-policy.mjs';
let mf:Miniflare,db:D1Database,bucket:R2Bucket;
const now=Date.UTC(2026,10,16),id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const auth=(n=1)=>({accountId:id(n),sessionId:id(n+100),cv:1,accessExpiresAt:now+600000});
const rows=async(sql:string,...values:unknown[])=>(await db.prepare(sql).bind(...values).all()).results as any[];
const run=(command:string,p:any)=>command==='game.round.end'?executeFrameworkEnd(db,p,now+60000):executeCommand(db,command,p,now+60000);
const catalog=()=>buildTrackFixture(new URL('../../',import.meta.url));
async function accept(){await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,?,?,?,NULL)").bind(id(500),id(1),id(2),id(1),id(501),now,now+259200000,now).run();return executeFrameworkAcceptance({DB:db,STORY_CONTENT:bucket},{...auth(2),invitationId:id(500),action:'accept',roundId:id(502),participantLowId:id(503),participantHighId:id(504)},now);}
const send=(who:number,text:string,request=701)=>run('story.message.send',{...auth(who),roundId:id(502),clientRequestId:id(request),eventId:id(request+10000),text});
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'story-v2'},r2Buckets:['STORY_CONTENT']}));db=await mf.getD1Database('DB')as unknown as D1Database;bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0008').sort())await db.batch(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));await publishSceneEventBundles(db,bucket,[catalog()],{now});});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 for(const t of ['game_event_instances','game_story_participant_progress','game_scene_visits','game_round_events','game_story_sessions','game_active_round_claims','game_rounds','match_invitations','match_conditions','user_profiles','auth_sessions','auth_accounts'])await db.prepare('DELETE FROM '+t).run();
 for(const n of [1,2,3]){await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`story-v2-${n}@example.invalid`,now,now,now).run();await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(n+100),id(n),now,now+2592000000,now+604800000).run();await run('profile.ensure',{...auth(n),profileId:id(n+200)});await db.prepare("UPDATE user_profiles SET nickname=?,birth_date='1990-01-01',gender='diverse',selected_avatar_type='builtin',selected_avatar_ref='male-01' WHERE account_id=?").bind(`玩家${n}`,id(n)).run();}
});
it('0007 has one engine, two participant rows, fixed schema, FK and no SQL triggers',async()=>{
 await accept();for(const [table,count]of Object.entries({game_rounds:9,game_active_round_claims:4,content_story_catalog:13,game_story_sessions:10,game_story_participant_progress:7,game_round_events:8,game_event_instances:12}))expect(await rows(`PRAGMA table_info(${table})`)).toHaveLength(count);
 expect(await rows('SELECT * FROM game_story_participant_progress')).toHaveLength(2);expect(await rows("SELECT name FROM sqlite_master WHERE type='trigger' OR name='game_interaction_instances'")).toEqual([]);expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
 for(const command of ['story.selection.vote','story.action.commit','story.content.read'])await expect(run(command,{...auth(),roundId:id(502)})).rejects.toThrow();
});
it('selected immutable layers recheck authorization after R2 and deny outsiders before IO',async()=>{
 await accept();const input={...auth(),roundId:id(502),catalogId:catalog().narrativeIndex.catalogId};expect((await readAuthorizedSceneEventContent(input,{DB:db,STORY_CONTENT:bucket},now)).content.scene.sceneId).toBe('rain-bookshop');let reads=0;
 await expect(readAuthorizedSceneEventContent({...input,...auth(3)},{DB:db,STORY_CONTENT:{get:async()=>{reads++;return null;}}as unknown as R2Bucket},now)).rejects.toMatchObject({status:403});expect(reads).toBe(0);
 const revoked={get:async(key:string)=>{const object=await bucket.get(key);await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,id(101)).run();return object;}}as unknown as R2Bucket;await expect(readAuthorizedSceneEventContent(input,{DB:db,STORY_CONTENT:revoked},now)).rejects.toMatchObject({status:401});
});
it('chat is idempotent and rejects changed payload, outsider, revoked family and ended room',async()=>{
 await accept();await send(1,'嗨😀');await send(1,'嗨😀');expect(await rows("SELECT * FROM game_round_events WHERE kind='message.committed'")).toHaveLength(1);await expect(send(1,'changed')).rejects.toThrow();await expect(send(3,'outsider')).rejects.toThrow();await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(1)).run();await expect(send(1,'revoked',702)).rejects.toThrow();await run('game.round.end',{...auth(2),roundId:id(502)});await expect(send(2,'late',703)).rejects.toThrow();expect((await run('story.round.status',{...auth(2),roundId:id(502)})).rows).toEqual([{round_id:id(502),status:'ended'}]);await expect(run('story.events.query',{...auth(2),roundId:id(502),afterSeq:0,beforeSeq:null,limit:50})).rejects.toThrow();
});
it.each(['😀','😀'.repeat(500),'😀'.repeat(501),'a\u0000b','\t hi','<img src=x onerror=alert(1)>','\ud800'])('Unicode scalar, length and unsafe text boundary %#',async(text)=>{
 await accept();if(text==='😀'||text==='😀'.repeat(500)){await send(1,text);expect((await rows("SELECT payload_json FROM game_round_events WHERE kind='message.committed'"))[0].payload_json).toBe(JSON.stringify({text}));}else{await expect(send(1,text)).rejects.toThrow();expect(await rows("SELECT * FROM game_round_events WHERE kind='message.committed'")).toEqual([]);}
});
it('concurrent chat has strict sequence and bounded cursor recovery independent of notifications',async()=>{
 await accept();await Promise.all([send(1,'one',701),send(2,'two',702)]);await send(1,'one',701);const all=await rows('SELECT sequence FROM game_round_events ORDER BY sequence');expect(all.map(e=>e.sequence)).toEqual([1,2,3,4,5]);expect((await run('story.receipt',{...auth(),roundId:id(502),clientRequestId:id(701)})).rows[0]).toMatchObject({kind:'message.committed'});
 expect((await run('story.events.query',{...auth(2),roundId:id(502),afterSeq:3,beforeSeq:null,limit:1})).rows).toHaveLength(1);expect((await run('story.events.query',{...auth(2),roundId:id(502),afterSeq:4,beforeSeq:null,limit:1})).rows[0]).toMatchObject({sequence:5});await run('game.round.end',{...auth(),roundId:id(502)});expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);await expect(send(2,'late',703)).rejects.toThrow();expect(await rows('SELECT * FROM game_round_events')).toHaveLength(5);
});
it('an illicit third claim never authorizes outsider reads or either player mutations',async()=>{
 await accept();await db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(999),id(3),id(502),now).run();expect((await run('game.round.get',{...auth(3),roundId:id(502)})).rows).toEqual([]);await expect(run('story.authorize',{...auth(),roundId:id(502)})).rejects.toThrow();await expect(run('game.round.end',{...auth(),roundId:id(502)})).rejects.toThrow();expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('active');
});
it('public assets use only content-addressed paths, SHA, MIME, size, GET/HEAD and immutable headers',async()=>{
 const asset=catalog().assets[0],env={DB:db,STORY_CONTENT:bucket};const url='http://localhost/'+asset.key;const response=await serveStoryAsset(new Request(url),env);expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toContain('immutable');expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');expect((await serveStoryAsset(new Request(url,{method:'HEAD'}),env)).status).toBe(200);
 for(const path of ['/story-content/private/member','/'+asset.key+'?key=private','/story-content/narratives/rain-bookshop-last-order/v2/manifest.json'])expect((await serveStoryAsset(new Request('http://localhost'+path),env)).status).toBe(404);expect((await serveStoryAsset(new Request(url,{method:'POST'}),env)).status).toBe(404);
 await bucket.put(asset.key,'tampered',{httpMetadata:{contentType:asset.mimeType}});try{expect((await serveStoryAsset(new Request(url),env)).status).toBe(404);}finally{await bucket.put(asset.key,asset.bytes,{httpMetadata:{contentType:asset.mimeType}});}
});
it('simultaneous end and message serialize and never append after ended',async()=>{
 await accept();const results=await Promise.allSettled([send(1,'racing',701),run('game.round.end',{...auth(2),roundId:id(502)})]);expect(results[1].status).toBe('fulfilled');expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('ended');const count=(await rows('SELECT * FROM game_round_events')).length;await expect(send(1,'late',702)).rejects.toThrow();expect(await rows('SELECT * FROM game_round_events')).toHaveLength(count);expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);
});
it.each([false,true])('end seals all active scoped events and visits in the claims transaction, injected failure=%s',async(fault)=>{
 await accept();await db.prepare("INSERT INTO game_event_instances VALUES(?,?,'scene:rain-bookshop:side','inspect','v2','side','active','{}',1,?,NULL,'inviter')").bind(id(910),id(502),now).run();
 if(fault){const broken=new Proxy(db,{get(target,key){if(key==='prepare')return(sql:string)=>target.prepare(sql.startsWith("UPDATE game_event_instances SET status='cancelled'")?sql.replace('WHERE ','WHERE 0 AND '):sql);const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});await expect(executeFrameworkEnd(broken,{...auth(),roundId:id(502)},now+60000)).rejects.toThrow();expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('active');expect(await rows('SELECT * FROM game_active_round_claims')).toHaveLength(2);expect((await rows('SELECT status FROM game_event_instances'))[0].status).toBe('active');}
 else{await run('game.round.end',{...auth(),roundId:id(502)});expect(await rows('SELECT status,completed_at FROM game_event_instances')).toEqual([{status:'cancelled',completed_at:now+60000}]);expect(await rows('SELECT * FROM game_scene_visits WHERE left_at IS NULL')).toEqual([]);expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);}
});
it('readiness accepts final 0007 and rejects a weakened published unique index',async()=>{
 await db.prepare('CREATE TABLE IF NOT EXISTS d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare("INSERT INTO d1_migrations(name) SELECT '0007_scene_event_tracks.sql' WHERE NOT EXISTS(SELECT 1 FROM d1_migrations)").run();const env={DB:db,EXPECTED_MIGRATION:'0007_scene_event_tracks.sql',FILES:{get:async()=>({text:async()=> 'datinghigh-foundation-v1'})},STORY_CONTENT:bucket,GAME_ROOMS:{},ROUND_TICKET_HMAC_KEY:'isolated-only-32-characters-realtime',APP_ENV:'local',EmailDeliveryMode:'Log'}as any;
 await ready(env);await db.prepare('DROP INDEX idx_content_story_published').run();await db.prepare("CREATE INDEX idx_content_story_published ON content_story_catalog(story_id) WHERE status='published'").run();try{await expect(ready(env)).rejects.toThrow();}finally{await db.prepare('DROP INDEX idx_content_story_published').run();await db.prepare("CREATE UNIQUE INDEX idx_content_story_published ON content_story_catalog(story_id) WHERE status='published'").run();}
});

it('SD-IT-047/048/049: controlled old game purge is transactional and preserves all account/profile data',async()=>{
 const isolated=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'old-game-upgrade'}}));
 try{const old=await isolated.getD1Database('DB');const statements=(text:string)=>text.split(';').map(s=>s.trim()).filter(Boolean).map(s=>old.prepare(s));
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0005').sort())await old.batch(statements(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8')));
 for(const n of [1,2]){await old.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`upgrade${n}@example.invalid`,now,now,now).run();await old.prepare('INSERT INTO user_profiles(profile_id,account_id,nickname,created_at,updated_at) VALUES(?,?,?,?,?)').bind(id(200+n),id(n),'preserved',now,now).run();}
 await old.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(500),id(1),id(2),id(1),id(501),now,now+86400000,now,now).run();
 await old.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL)").bind(id(502),id(500),id(1),id(2),now).run();for(const n of [1,2])await old.prepare('INSERT INTO game_round_participants VALUES(?,?,?,?)').bind(id(600+n),id(n),id(502),now).run();
 const accounts=(await old.prepare('SELECT * FROM auth_accounts ORDER BY account_id').all()).results,profiles=(await old.prepare('SELECT * FROM user_profiles ORDER BY account_id').all()).results;
 const migration=readFileSync(new URL('../migrations/0005_story_dialogue_exit.sql',import.meta.url),'utf8');
 await expect(old.batch(statements(migration))).rejects.toThrow();expect((await old.prepare('PRAGMA table_info(game_rounds)').all()).results).toHaveLength(7);
 const broken=oldGamePurgeStatements().map((sql:string)=>sql.startsWith('DELETE FROM game_rounds')?sql+' WHERE 0':sql).join(';');await expect(old.batch(statements(broken+';'+migration))).rejects.toThrow();
 expect((await old.prepare('SELECT * FROM game_round_participants').all()).results).toHaveLength(2);expect((await old.prepare('SELECT * FROM game_rounds').all()).results).toHaveLength(1);
 await old.batch(statements(oldGamePurgeStatements().join(';')+';'+migration));
 expect((await old.prepare('SELECT * FROM auth_accounts ORDER BY account_id').all()).results).toEqual(accounts);expect((await old.prepare('SELECT * FROM user_profiles ORDER BY account_id').all()).results).toEqual(profiles);
 expect((await old.prepare('PRAGMA table_info(game_rounds)').all()).results).toHaveLength(9);expect((await old.prepare('SELECT * FROM game_active_round_claims').all()).results).toEqual([]);expect((await old.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
 }finally{await isolated.dispose();}
});
