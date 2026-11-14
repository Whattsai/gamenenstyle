import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import {ready} from '../src/platform';
// @ts-expect-error Shared Node ESM tool policy is exercised directly by the real D1 integration.
import {oldGamePurgeStatements} from '../../tools/story-content-policy.mjs';
import {readStoryContent,serveStoryAsset} from '../src/story-content';
import { executeCommand,planCommand } from '../src/commands';
import {readAuthorizedSceneEventContent} from '../src/scene-event-read';
// @ts-expect-error 共用本地內容建構器，實際讀寫真 R2。
import {buildSceneEventBundle} from '../../tools/scene-event-content-policy.mjs';

let mf:Miniflare, db:D1Database;
const now=Date.UTC(2026,10,8);
const id=(n:number)=>`019a281e-0000-7000-8000-${n.toString().padStart(12,'0')}`;
const auth=(n=1)=>({accountId:id(n),sessionId:id(n+100),cv:1,accessExpiresAt:now+600000});
const rows=async(sql:string,...values:unknown[])=>(await db.prepare(sql).bind(...values).all()).results as any[];
const run=(command:string,p:any)=>executeCommand(db,command,p,now);
it('SEF content read: selected immutable layers recheck authorization after R2 and deny outsiders before IO',async()=>{
 await catalog(1);await accept();
 const source=JSON.parse(readFileSync(new URL('../../contracts/story-scenes.json',import.meta.url),'utf8')).stories[0];
 const options={sceneCatalogId:id(4001),narrativeCatalogId:id(301),sceneId:'rain-bookshop',sceneVersion:'v1',narrativeId:'rain-bookshop-lost-note',narrativeVersion:'v1',capabilities:['bookshop'],eligibleCategoryCodes:['romance'],categories:[{categoryId:id(4003),code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading'],recommendationPriority:1}]};
 const bundle=buildSceneEventBundle(source,new URL('../../',import.meta.url),options);const bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;
 for(const object of bundle.objects)await bucket.put(object.key,object.bytes);
 await db.prepare("UPDATE content_story_catalog SET story_id=?,version=?,manifest_key=?,manifest_sha256=?,status='retired' WHERE catalog_id=?").bind(bundle.narrative.id,bundle.narrative.version,bundle.narrative.key,bundle.narrative.sha256,id(301)).run();
 const input={...auth(),roundId:id(502),catalogId:id(301)};
 expect((await readAuthorizedSceneEventContent(input,{DB:db,STORY_CONTENT:bucket},now)).content.scene.sceneId).toBe('rain-bookshop');
 let reads=0;const inaccessible={get:async()=>{reads++;return null;}}as unknown as R2Bucket;
 await expect(readAuthorizedSceneEventContent({...input,...auth(3)},{DB:db,STORY_CONTENT:inaccessible},now)).rejects.toThrow();expect(reads).toBe(0);
 const revoke={get:async(key:string)=>{const object=await bucket.get(key);await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,id(101)).run();return object;}}as unknown as R2Bucket;
 await expect(readAuthorizedSceneEventContent(input,{DB:db,STORY_CONTENT:revoke},now)).rejects.toThrow();
});
async function catalog(n:number,tags=['reading'],priority=n){
 await db.prepare('INSERT INTO content_story_catalog VALUES(?,?,?,?,?,?,?,\'published\',?)').bind(id(300+n),`fixture-${n}`,'v1',JSON.stringify(tags),priority,`story-content/stories/fixture-${n}/v1/manifest.json`,'a'.repeat(64),now).run();
}
async function accept(seed=500){
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,?,?,?,NULL)").bind(id(seed),id(1),id(2),id(1),id(seed+1),now,now+259200000,now).run();
 return run('match.invite.resolve',{...auth(2),invitationId:id(seed),action:'accept',roundId:id(seed+2),participantLowId:id(seed+3),participantHighId:id(seed+4)});
}
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'story-isolated'},r2Buckets:['STORY_CONTENT']}));
 db=await mf.getD1Database('DB') as unknown as D1Database;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0006').sort())
  await db.batch(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 await db.batch(['game_interaction_instances','game_round_events','game_story_sessions','game_active_round_claims','game_rounds','match_invitations','content_story_catalog','match_conditions','user_profiles','auth_sessions','auth_accounts'].map(t=>db.prepare(`DELETE FROM ${t}`)));
 for(const n of [1,2,3]){
  await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`story${n}@example.invalid`,now,now,now).run();
  await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(n+100),id(n),now,now+2592000000,now+604800000).run();
  await run('profile.ensure',{...auth(n),profileId:id(n+200)});
  await db.prepare("UPDATE user_profiles SET nickname=?,birth_date='1990-01-01',selected_avatar_type='builtin',selected_avatar_ref='male-01',interests_json=? WHERE account_id=?").bind(`玩家${n}`,JSON.stringify({interestTagIds:['reading'],topicTagIds:[],valueTagIds:[]}),id(n)).run();
 }
});
it('SD-IT-009/010: 0005 adds exactly four tables, renames claims, keeps declared column counts and no triggers',async()=>{
 expect(await rows("SELECT name FROM sqlite_master WHERE type='table' AND name='game_round_participants'")).toEqual([]);
 for(const [table,count] of Object.entries({game_rounds:9,game_active_round_claims:4,content_story_catalog:9,game_story_sessions:9,game_round_events:8,game_interaction_instances:10}))expect(await rows(`PRAGMA table_info(${table})`)).toHaveLength(count);
 expect(await rows("SELECT name FROM sqlite_master WHERE type='trigger'")).toEqual([]);
});
it('SD-IT-001: N1 accept atomically freezes catalog, initializes episode one and event, no votes',async()=>{
 await catalog(1);await accept();
 expect(await rows('SELECT story_offer_catalog_ids_json,last_event_seq FROM game_rounds')).toEqual([{story_offer_catalog_ids_json:JSON.stringify([id(301)]),last_event_seq:1}]);
 expect(await rows('SELECT episode_seq,current_node_id,chapter_status FROM game_story_sessions')).toEqual([{episode_seq:1,current_node_id:'entry',chapter_status:'playing'}]);
 expect(await rows('SELECT kind FROM game_round_events')).toEqual([{kind:'story.selected'}]);
 expect(await rows('SELECT * FROM game_active_round_claims')).toHaveLength(2);
});
it('SD-IT-015: N0 accept fails without changing invitation, Round or claims',async()=>{
 await expect(accept()).rejects.toThrow();
 expect(await rows('SELECT status FROM match_invitations')).toEqual([{status:'pending'}]);
 expect(await rows('SELECT * FROM game_rounds')).toEqual([]);
 expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);
});
it.each([0,1,2,3,4])('SD-IT-003/004/012/017/039/040: %i additional catalogs use stable in-transaction interests and top three',async(extra)=>{
 await catalog(1,['coffee'],0);for(let n=2;n<=extra+1;n++)await catalog(n,['reading'],n);
 const plan=planCommand('match.invite.resolve',{...auth(2),invitationId:id(500),action:'accept',roundId:id(502),participantLowId:id(503),participantHighId:id(504)},now);
 // 模擬計畫建立後才變更興趣／退休；SQL 在 commit 時直接重算權威排名。
 if(extra>1)await db.prepare("UPDATE content_story_catalog SET status='retired' WHERE catalog_id=?").bind(id(302)).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,?,?,?,NULL)").bind(id(500),id(1),id(2),id(1),id(501),now,now+86400000,now).run();
 await db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)));
 const selected=JSON.parse((await rows('SELECT story_offer_catalog_ids_json FROM game_rounds'))[0].story_offer_catalog_ids_json);
 const expected=Array.from({length:extra},(_,i)=>i+2).filter(n=>!(extra>1&&n===2)).map(n=>id(300+n));expected.push(id(301));expect(selected).toEqual(expected.slice(0,3));
});
it('SD-IT-011/014: candidates and pinned retired version remain unchanged after profile and catalog changes',async()=>{
 await catalog(1);await accept();const before=await rows('SELECT * FROM game_rounds');
 await db.prepare("UPDATE user_profiles SET interests_json='{}'").run();await db.prepare("UPDATE content_story_catalog SET status='retired'").run();await catalog(2);
 expect(await rows('SELECT * FROM game_rounds')).toEqual(before);
 const snapshot=await run('story.snapshot',{...auth(),roundId:id(502)});expect(snapshot.rows.some((r:any)=>r.record_type==='catalog'&&r.catalog_id===id(301)&&r.status==='retired')).toBe(true);
});
it.each(['round','low-claim','high-claim','story','event','sequence'])('SD-IT-038: zero-row %s rolls back accepted, Round, both claims and all initialization',async(step)=>{
 await catalog(1);await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,?,?,?,NULL)").bind(id(500),id(1),id(2),id(1),id(501),now,now+86400000,now).run();
 const plan=planCommand('match.invite.resolve',{...auth(2),invitationId:id(500),action:'accept',roundId:id(502),participantLowId:id(503),participantHighId:id(504)},now);
 const index=plan.findIndex(p=>step==='round'?p.sql.startsWith('INSERT INTO game_rounds'):step==='low-claim'?p.sql.startsWith('INSERT INTO game_active_round_claims')&&p.sql.includes('account_low_id'):step==='high-claim'?p.sql.startsWith('INSERT INTO game_active_round_claims')&&p.sql.includes('account_high_id'):step==='story'?p.sql.startsWith('INSERT INTO game_story_sessions'):step==='event'?p.sql.startsWith('INSERT INTO game_round_events'):p.sql.startsWith('UPDATE game_rounds SET last_event_seq'));
 expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=step==='round'?plan[index].sql.replace('FROM match_invitations WHERE','FROM match_invitations WHERE 0 AND'):plan[index].sql.replace('WHERE ','WHERE 0 AND ');
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect(await rows('SELECT status FROM match_invitations')).toEqual([{status:'pending'}]);
 for(const table of ['game_rounds','game_active_round_claims','game_story_sessions','game_round_events'])expect(await rows(`SELECT * FROM ${table}`)).toEqual([]);
});
it('SD-IT-016: unique published version and FK constraints reject invalid catalog and duplicate claims',async()=>{
 await catalog(1);await expect(db.prepare("INSERT INTO content_story_catalog SELECT ?,story_id,'v2',interest_tag_ids_json,1,'other-manifest',manifest_sha256,'published',published_at FROM content_story_catalog").bind(id(399)).run()).rejects.toThrow();
 await accept();await expect(db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(999),id(1),id(502),now).run()).rejects.toThrow();expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
});
const vote=(who:number,n:number,req:number)=>run('story.selection.vote',{...auth(who),roundId:id(502),clientRequestId:id(req),episodeSeq:1,catalogId:id(300+n),eventId:id(req+10000),storySessionId:id(req+20000),selectedEventId:id(req+30000)});
it('SD-IT-002/005/006/013/042: last committed vote wins, original inviter breaks ties, replay never overwrites',async()=>{
 await catalog(1);await catalog(2);await accept();
 expect(await rows('SELECT * FROM game_story_sessions')).toEqual([]);
 await vote(1,1,601);await vote(1,2,602);await vote(1,1,601);
 expect(await rows('SELECT * FROM game_round_events')).toHaveLength(2);
 await vote(2,1,603);
 expect(await rows('SELECT catalog_id,episode_seq FROM game_story_sessions')).toEqual([{catalog_id:id(302),episode_seq:1}]);
 await expect(vote(1,1,604)).rejects.toThrow();
 await expect(vote(1,2,601)).rejects.toThrow();
 expect(await rows("SELECT kind FROM game_round_events ORDER BY sequence")).toEqual([{kind:'story.vote.submitted'},{kind:'story.vote.submitted'},{kind:'story.vote.submitted'},{kind:'story.selected'}]);
});
it('SD-IT-028/044: pending events are projected on server, cursor advances over hidden vote',async()=>{
 await catalog(1);await catalog(2);await accept();await vote(1,1,601);
 const p={...auth(2),roundId:id(502),afterSeq:0,beforeSeq:null,limit:1};
 const result=await run('story.events.query',p);
 expect(JSON.stringify(result.rows)).not.toContain(id(301));
 expect(result.rows[0]).toMatchObject({sequence:1,kind:'story.vote_status'});
});
it('SD-IT-005/020/021/043/056: simultaneous same votes settle once, and every first-episode event has scoped identifiers',async()=>{
 await catalog(1);await catalog(2);await accept();await Promise.all([vote(1,2,605),vote(2,2,606)]);
 expect(await rows('SELECT catalog_id FROM game_story_sessions')).toEqual([{catalog_id:id(302)}]);const events=await rows('SELECT kind,payload_json,sequence FROM game_round_events ORDER BY sequence');expect(events.map(e=>e.sequence)).toEqual([1,2,3]);for(const e of events)expect(JSON.parse(e.payload_json).episodeSeq).toBe(1);expect(JSON.parse(events.at(-1)!.payload_json).storySessionId).toBeTruthy();
});
it('SD-IT-027/029: foreign candidate, non-first episode, actor forgery and N1 vote leave no events',async()=>{
 await catalog(1);await catalog(2);await accept();await expect(vote(1,3,601)).rejects.toThrow();
 const p={...auth(),roundId:id(502),clientRequestId:id(601),episodeSeq:2,catalogId:id(301),eventId:id(10601),storySessionId:id(20601),selectedEventId:id(30601)};
 await expect(run('story.selection.vote',p)).rejects.toThrow();await expect(run('story.selection.vote',{...p,episodeSeq:1,actor:id(2)})).rejects.toThrow();expect(await rows('SELECT * FROM game_round_events')).toEqual([]);
 await vote(1,1,602);await vote(2,1,603);await expect(vote(1,2,604)).rejects.toThrow();
});
const send=(who:number,text:string,request=701)=>run('story.message.send',{...auth(who),roundId:id(502),clientRequestId:id(request),eventId:id(request+10000),text});
it('SD-IT-018/019/024/030: chat is idempotent, rejects changed payload, outsider, revoked session and ended round',async()=>{
 await catalog(1);await accept();await send(1,'嗨😀');await send(1,'嗨😀');
 expect(await rows("SELECT * FROM game_round_events WHERE kind='message.committed'")).toHaveLength(1);
 await expect(send(1,'更改')).rejects.toThrow();await expect(send(3,'外人')).rejects.toThrow();
 await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(1)).run();
 await expect(send(1,'撤銷',702)).rejects.toThrow();
 await run('game.round.end',{...auth(2),roundId:id(502)});
 await expect(send(2,'結束',703)).rejects.toThrow();
 expect((await run('story.round.status',{...auth(2),roundId:id(502)})).rows).toEqual([{round_id:id(502),status:'ended'}]);
 await expect(run('story.events.query',{...auth(2),roundId:id(502),afterSeq:0,beforeSeq:null,limit:50})).rejects.toThrow();
});
it.each(['😀','😀'.repeat(500),'😀'.repeat(501),'a\u0000b','\t hi','<img src=x onerror=alert(1)>','\ud800'])('SD-IT-018/026: Unicode scalar and unsafe text boundary %#',async(text)=>{
 await catalog(1);await accept();if(text==='😀'||text==='😀'.repeat(500)){await send(1,text);expect((await rows("SELECT payload_json FROM game_round_events WHERE kind='message.committed'"))[0].payload_json).toBe(JSON.stringify({text}));}else{await expect(send(1,text)).rejects.toThrow();expect(await rows("SELECT * FROM game_round_events WHERE kind='message.committed'")).toEqual([]);}
});
it('SD-IT-007/019/030/031/033/045: concurrent chat keeps strict sequence, cursor receipt survives no notification, end releases exactly two claims',async()=>{
 await catalog(1);await accept();await Promise.all([send(1,'one',701),send(2,'two',702)]);await send(1,'one',701);
 expect((await rows('SELECT sequence FROM game_round_events ORDER BY sequence')).map(e=>e.sequence)).toEqual([1,2,3]);
 expect((await run('story.receipt',{...auth(),roundId:id(502),clientRequestId:id(701)})).rows[0]).toMatchObject({sequence:2,kind:'message.committed'});
 const before=(await run('story.events.query',{...auth(2),roundId:id(502),afterSeq:1,beforeSeq:null,limit:1})).rows;expect(before).toHaveLength(1);expect((await run('story.events.query',{...auth(2),roundId:id(502),afterSeq:2,beforeSeq:null,limit:1})).rows[0]).toMatchObject({sequence:3});
 await run('game.round.end',{...auth(),roundId:id(502)});expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);await expect(send(2,'late',703)).rejects.toThrow();expect(await rows('SELECT * FROM game_round_events')).toHaveLength(3);
});
it('SD-IT-050/051/057/058: sequential episodes coexist, duplicate episode and concurrent playing roll back',async()=>{
 await catalog(1);await catalog(2);await accept();await vote(1,1,601);await vote(2,1,602);
 const insert=(episode:number)=>db.prepare("INSERT INTO game_story_sessions VALUES(?,?,?,?,'next-entry','playing',1,?,?)").bind(id(900+episode),id(502),episode,id(302),now,now);
 await expect(db.batch([insert(2)])).rejects.toThrow();await db.prepare("UPDATE game_story_sessions SET chapter_status='completed'").run();
 await expect(db.batch([insert(1)])).rejects.toThrow();await db.batch([insert(2)]);
 expect(await rows('SELECT episode_seq,chapter_status,current_node_id FROM game_story_sessions ORDER BY episode_seq')).toEqual([{episode_seq:1,chapter_status:'completed',current_node_id:'entry'},{episode_seq:2,chapter_status:'playing',current_node_id:'next-entry'}]);
 expect(await rows("SELECT * FROM game_story_sessions WHERE chapter_status='playing'")).toHaveLength(1);
});
const action=(seed=800,extra={})=>({...auth(),roundId:id(502),clientRequestId:id(seed),eventId:id(seed+10000),nodeEventId:id(seed+20000),completionEventId:id(seed+30000),storySessionId:id(502),episodeSeq:1,expectedRevision:1,nodeId:'entry',nextNodeId:'icebreak',completed:false,kind:'story.choice.committed',payload:JSON.stringify({nodeId:'icebreak'}),requestPayload:JSON.stringify({nodeId:'entry',choiceId:'enter'}),interaction:null,...extra});
it('SEF-IT-069: chapter completion atomically cancels unfinished interactions and leaves chat active',async()=>{
 await catalog(1);await accept();
 await db.prepare("INSERT INTO game_interaction_instances VALUES(?,?,'entry','bookmark','v1','active','{}',1,?,NULL)").bind(id(910),id(502),now).run();
 const p=action(800,{completed:true,nextNodeId:'ending'});await run('story.action.commit',p);
 expect(await rows('SELECT status,completed_at,revision FROM game_interaction_instances')).toEqual([{status:'cancelled',completed_at:now,revision:2}]);
 expect(await rows('SELECT status FROM game_rounds')).toEqual([{status:'active'}]);await send(2,'收尾後聊天',706);
 await run('story.action.commit',p);expect(await rows("SELECT kind FROM game_round_events WHERE kind='chapter.completed'")).toHaveLength(1);
 await expect(run('story.action.commit',action(801))).rejects.toThrow();
});

it('SEF-IT-069: zero-row unfinished cancellation rolls back chapter, revision and completion events',async()=>{
 await catalog(1);await accept();
 await db.prepare("INSERT INTO game_interaction_instances VALUES(?,?,'entry','bookmark','v1','active','{}',1,?,NULL)").bind(id(910),id(502),now).run();
 const plan=planCommand('story.action.commit',action(800,{completed:true,nextNodeId:'ending'}),now);
 const index=plan.findIndex(s=>s.sql.startsWith('UPDATE game_interaction_instances SET status=\'cancelled\''));expect(index).toBeGreaterThanOrEqual(0);
 plan[index].sql=plan[index].sql.replace('WHERE ','WHERE 0 AND ');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();
 expect(await rows('SELECT chapter_status,progress_revision FROM game_story_sessions')).toEqual([{chapter_status:'playing',progress_revision:1}]);
 expect(await rows('SELECT status FROM game_interaction_instances')).toEqual([{status:'active'}]);expect(await rows('SELECT * FROM game_round_events')).toHaveLength(1);
});
it.each(['node','completion'])('SD-IT-023/054: a zero-row %s event cannot leave partially advanced story state',async(kind)=>{
 await catalog(1);await accept();const p=action(800,{completed:kind==='completion',nextNodeId:kind==='completion'?'ending':'icebreak'});const plan=planCommand('story.action.commit',p,now);
 const index=plan.findIndex(s=>s.sql.startsWith('INSERT INTO game_round_events')&&s.sql.includes(kind==='node'?"'story.node_changed'":"'chapter.completed'"));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE r.round_id=?','WHERE 0 AND r.round_id=?');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect(await rows('SELECT current_node_id,progress_revision FROM game_story_sessions')).toEqual([{current_node_id:'entry',progress_revision:1}]);expect(await rows('SELECT * FROM game_round_events')).toHaveLength(1);
});
it('SD-IT-023/054: foreign session, node, revision or claim state rejects before interaction or event write',async()=>{
 await catalog(1);await accept();
 for(const change of [{storySessionId:id(999)},{nodeId:'foreign-node'},{expectedRevision:2},{episodeSeq:2}])await expect(run('story.action.commit',action(800,change))).rejects.toThrow();
 await db.prepare('DELETE FROM game_active_round_claims WHERE account_id=?').bind(id(2)).run();await expect(run('story.action.commit',action())).rejects.toThrow();expect(await rows('SELECT * FROM game_interaction_instances')).toEqual([]);expect(await rows('SELECT * FROM game_round_events')).toHaveLength(1);
});

it('SD-IT-025: an illicit third claim cannot grant outsider reads or authorize either player writes',async()=>{
 await catalog(1);await accept();
 await db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(999),id(3),id(502),now).run();
 expect((await run('game.round.get',{...auth(3),roundId:id(502)})).rows).toEqual([]);
 await expect(run('story.authorize',{...auth(1),roundId:id(502)})).rejects.toThrow();
 await expect(run('game.round.end',{...auth(1),roundId:id(502)})).rejects.toThrow();
 expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('active');
});

it('SD-IT-034/035/050: separate real R2 enforces pinned hashes, public path whitelist and authorization after content IO',async()=>{
 await catalog(1);await accept();const bucket=await mf.getR2Bucket('STORY_CONTENT') as unknown as R2Bucket;
 const bytes=new TextEncoder().encode('{"title":"pinned"}');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
 const key='story-content/stories/scene-01/v1/manifest.json';await bucket.put(key,bytes);
 await db.prepare('UPDATE content_story_catalog SET manifest_key=?,manifest_sha256=?,status=\'retired\'').bind(key,hash).run();
 const p={...auth(),roundId:id(502),catalogId:id(301)},env={DB:db,STORY_CONTENT:bucket};
 expect((await readStoryContent(p,env,now)).manifest).toEqual({title:'pinned'});
 await bucket.put(key,'tampered');await expect(readStoryContent(p,env,now)).rejects.toThrow('INVALID_STORY_CONTENT');await bucket.put(key,bytes);
 await expect(readStoryContent(p,{DB:db,STORY_CONTENT:{get:async(k:string)=>{const object=await bucket.get(k);await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,id(101)).run();return object;}} as any},now)).rejects.toThrow();
 await bucket.put('story-content/assets/'+hash,bytes,{httpMetadata:{contentType:'image/png'}});
 expect((await serveStoryAsset(new Request('http://localhost/story-content/assets/'+hash),env)).status).toBe(200);
 await bucket.put('story-content/assets/'+hash,'tampered',{httpMetadata:{contentType:'image/png'}});
 expect((await serveStoryAsset(new Request('http://localhost/story-content/assets/'+hash),env)).status).toBe(404);
 for(const path of ['/story-content/private/member','/story-content/assets/'+hash+'?key=private','/story-content/stories/scene-01/v1/manifest.json'])expect((await serveStoryAsset(new Request('http://localhost'+path),env)).status).toBe(404);
});

it('SD-IT-052/053/059/060/061: future episode fixture uses scoped event votes and leaves first offers immutable',async()=>{
 await catalog(1);await catalog(2);await accept();await vote(1,1,601);await vote(2,1,602);
 const first=(await rows('SELECT story_offer_catalog_ids_json FROM game_rounds'))[0].story_offer_catalog_ids_json;
 await db.prepare("UPDATE game_story_sessions SET chapter_status='completed'").run();
 const append=async(seq:number,kind:string,actor:number|null,payload:any)=>db.prepare('INSERT INTO game_round_events VALUES(?,?,?,?,?,?,?,?)').bind(id(800+seq),id(502),seq,actor===null?null:id(actor),actor===null?null:id(900+seq),kind,JSON.stringify(payload),now).run();
 // 僅隔離資料模型 fixture，無第二場公開啟動命令。
 await append(4,'story.episode.offers.frozen',null,{episodeSeq:2,catalogIds:[id(302)]});await append(5,'story.vote.submitted',1,{episodeSeq:2,catalogId:id(302)});await append(6,'story.vote.submitted',2,{episodeSeq:2,catalogId:id(301)});await db.prepare('UPDATE game_rounds SET last_event_seq=6').run();
 const second=await rows("SELECT actor_account_id,payload_json FROM game_round_events e WHERE round_id=? AND kind='story.vote.submitted' AND json_extract(payload_json,'$.episodeSeq')=2 AND sequence=(SELECT MAX(v.sequence) FROM game_round_events v WHERE v.round_id=e.round_id AND v.kind=e.kind AND v.actor_account_id=e.actor_account_id AND json_extract(v.payload_json,'$.episodeSeq')=2)",id(502));
 expect(second).toHaveLength(2);expect(JSON.parse(second.find(r=>r.actor_account_id===id(1)).payload_json).catalogId).toBe(id(302));
 await vote(1,1,601);await expect(vote(1,2,601)).rejects.toThrow();expect((await rows("SELECT * FROM game_round_events WHERE json_extract(payload_json,'$.episodeSeq')=2 AND kind='story.vote.submitted'"))).toHaveLength(2);
 await db.prepare("INSERT INTO game_story_sessions VALUES(?,?,2,?,'entry','playing',1,?,?)").bind(id(750),id(502),id(302),now,now).run();
 await append(7,'story.selected',null,{episodeSeq:2,storySessionId:id(750),catalogId:id(302)});await db.prepare('UPDATE game_rounds SET last_event_seq=7').run();
 expect((await rows('SELECT story_offer_catalog_ids_json FROM game_rounds'))[0].story_offer_catalog_ids_json).toBe(first);
 expect((await rows("SELECT json_extract(payload_json,'$.episodeSeq') AS episode FROM game_round_events WHERE kind='story.selected' ORDER BY sequence")).map(r=>r.episode)).toEqual([1,2]);
 expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
});
it('SD-IT-030/031: simultaneous end and message are linearizable and never append after ended',async()=>{
 await catalog(1);await accept();const results=await Promise.allSettled([run('game.round.end',{...auth(),roundId:id(502)}),send(2,'racing the end',704)]);
 expect(results[0].status).toBe('fulfilled');expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('ended');expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);
 const committed=results[1].status==='fulfilled';expect(await rows("SELECT * FROM game_round_events WHERE kind='message.committed'")).toHaveLength(committed?1:0);
 await expect(send(2,'after ended',705)).rejects.toThrow();
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

it('readiness rejects a nonunique replacement of the published partial index',async()=>{
 await db.prepare('CREATE TABLE IF NOT EXISTS d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare("INSERT INTO d1_migrations(name) SELECT '0005_story_dialogue_exit.sql' WHERE NOT EXISTS(SELECT 1 FROM d1_migrations)").run();
 const env={DB:db,EXPECTED_MIGRATION:'0005_story_dialogue_exit.sql',FILES:{get:async()=>({text:async()=> 'datinghigh-foundation-v1'})},STORY_CONTENT:{},GAME_ROOMS:{},ROUND_TICKET_HMAC_KEY:'isolated-only-32-characters-realtime',APP_ENV:'local',EmailDeliveryMode:'Log'} as any;
 await ready(env);await db.prepare('DROP INDEX idx_content_story_published').run();await db.prepare("CREATE INDEX idx_content_story_published ON content_story_catalog(story_id) WHERE status='published'").run();
 try{await expect(ready(env)).rejects.toThrow();}finally{await db.prepare('DROP INDEX idx_content_story_published').run();await db.prepare("CREATE UNIQUE INDEX idx_content_story_published ON content_story_catalog(story_id) WHERE status='published'").run();}
});

it('SD-IT-023/054: a zero-row interaction insert rolls back the session revision and actor event',async()=>{
 await catalog(1);await accept();const p=action(810,{nextNodeId:'entry',kind:'interaction.updated',interaction:{instanceId:id(910),definitionId:'bookmark',definitionVersion:'v1',expectedRevision:0,status:'active',stateJson:JSON.stringify({[id(1)]:'back'})}});
 const plan=planCommand('story.action.commit',p,now);const index=plan.findIndex(s=>s.sql.startsWith('INSERT INTO game_interaction_instances'));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE NOT EXISTS','WHERE 0 AND NOT EXISTS');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect(await rows('SELECT progress_revision FROM game_story_sessions')).toEqual([{progress_revision:1}]);expect(await rows('SELECT * FROM game_round_events')).toHaveLength(1);expect(await rows('SELECT * FROM game_interaction_instances')).toEqual([]);
});

// 未來場次的隔離保留合約：只在測試組裝 SQL，不導出正式 API／Application 啟動用例。
function futureFreezeFixture(seed:number,expectedSeq:number){return [
 db.prepare(`SELECT CASE WHEN EXISTS(SELECT 1 FROM game_rounds r WHERE r.round_id=? AND r.status='active' AND r.last_event_seq=? AND (SELECT COUNT(*) FROM game_active_round_claims c WHERE c.round_id=r.round_id)=2 AND (SELECT COUNT(*) FROM game_active_round_claims c WHERE c.round_id=r.round_id AND c.account_id IN(r.account_low_id,r.account_high_id))=2 AND (SELECT MAX(episode_seq) FROM game_story_sessions s WHERE s.round_id=r.round_id)=1 AND NOT EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=r.round_id AND s.chapter_status='playing') AND NOT EXISTS(SELECT 1 FROM game_round_events e WHERE e.round_id=r.round_id AND e.kind='story.episode.offers.frozen' AND json_extract(e.payload_json,'$.episodeSeq')=2)) THEN 1 ELSE json('FUTURE_FIXTURE_CONFLICT') END`).bind(id(502),expectedSeq),
 db.prepare('UPDATE game_rounds SET last_event_seq=last_event_seq+1 WHERE round_id=? AND last_event_seq=?').bind(id(502),expectedSeq),
 db.prepare("INSERT INTO game_round_events SELECT ?,round_id,last_event_seq,NULL,NULL,'story.episode.offers.frozen',?,? FROM game_rounds WHERE round_id=?").bind(id(seed),JSON.stringify({episodeSeq:2,catalogIds:[id(301)]}),now,id(502))
];}
it('SD-IT-055/059/061: future fixture freeze CAS permits one winner only after completion and fails closed on ended or missing claims',async()=>{
 await catalog(1);await accept();const initial=(await rows('SELECT story_offer_catalog_ids_json FROM game_rounds'))[0];
 await expect(db.batch(futureFreezeFixture(900,1))).rejects.toThrow();expect(await rows("SELECT * FROM game_round_events WHERE kind='story.episode.offers.frozen'")).toEqual([]);
 await db.prepare("UPDATE game_story_sessions SET chapter_status='completed'").run();const attempts=await Promise.allSettled([db.batch(futureFreezeFixture(901,1)),db.batch(futureFreezeFixture(902,1))]);expect(attempts.filter(a=>a.status==='fulfilled')).toHaveLength(1);
 expect(await rows("SELECT * FROM game_round_events WHERE kind='story.episode.offers.frozen'")).toHaveLength(1);expect((await rows('SELECT story_offer_catalog_ids_json FROM game_rounds'))[0]).toEqual(initial);
 await db.prepare('DELETE FROM game_round_events WHERE sequence=2').run();await db.prepare('UPDATE game_rounds SET last_event_seq=1').run();await db.prepare('DELETE FROM game_active_round_claims WHERE account_id=?').bind(id(2)).run();await expect(db.batch(futureFreezeFixture(903,1))).rejects.toThrow();
 await db.prepare("UPDATE game_rounds SET status='ended',ended_at=?").bind(now).run();await expect(db.batch(futureFreezeFixture(904,1))).rejects.toThrow();expect(await rows("SELECT * FROM game_round_events WHERE kind='story.episode.offers.frozen'")).toEqual([]);
});

it.each(['session','selected'])('SD-IT-020/043: zero-row %s during second vote rolls back the new vote and resolution',async(step)=>{
 await catalog(1);await catalog(2);await accept();await vote(1,1,601);
 const p={...auth(2),roundId:id(502),clientRequestId:id(602),episodeSeq:1,catalogId:id(301),eventId:id(10602),storySessionId:id(20602),selectedEventId:id(30602)};const plan=planCommand('story.selection.vote',p,now);
 const index=plan.findIndex(s=>step==='session'?s.sql.startsWith('INSERT INTO game_story_sessions'):s.sql.startsWith('INSERT INTO game_round_events')&&s.sql.includes("'story.selected'"));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE r.round_id=?','WHERE 0 AND r.round_id=?');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect(await rows('SELECT * FROM game_story_sessions')).toEqual([]);expect(await rows('SELECT * FROM game_round_events')).toHaveLength(1);expect((await rows('SELECT last_event_seq FROM game_rounds'))[0].last_event_seq).toBe(1);
});

it('SD-IT-043: simultaneous votes and end can only commit a resolution before end',async()=>{
 await catalog(1);await catalog(2);await accept();await Promise.allSettled([vote(1,1,611),vote(2,2,612),run('game.round.end',{...auth(),roundId:id(502)})]);
 expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('ended');expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);await expect(vote(1,2,613)).rejects.toThrow();
 const events=await rows('SELECT sequence FROM game_round_events ORDER BY sequence');expect(events.map(e=>e.sequence)).toEqual(events.map((_,i)=>i+1));expect((await rows('SELECT last_event_seq FROM game_rounds'))[0].last_event_seq).toBe(events.length);expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(events.length===3?1:0);
});
it('SD-IT-023/054: interaction uniqueness and FK apply to the session, not a redundant round or story',async()=>{
 await catalog(1);await accept();const insert=(n:number,sessionId:string)=>db.prepare("INSERT INTO game_interaction_instances VALUES(?,?,'entry','bookmark','v1','active','{}',1,?,NULL)").bind(id(n),sessionId,now);
 await insert(920,id(502)).run();await expect(insert(921,id(502)).run()).rejects.toThrow();await expect(insert(922,id(999)).run()).rejects.toThrow();expect(await rows('SELECT * FROM game_interaction_instances')).toHaveLength(1);expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
});

it('SD-IT-007: end cancels active personal/cooperative interaction instances in the same transaction',async()=>{
 await catalog(1);await accept();await run('story.action.commit',action(810,{nextNodeId:'entry',kind:'interaction.updated',interaction:{instanceId:id(910),definitionId:'bookmark',definitionVersion:'v1',expectedRevision:0,status:'active',stateJson:JSON.stringify({[id(1)]:'back'})}}));
 await run('game.round.end',{...auth(),roundId:id(502)});expect(await rows('SELECT status,completed_at FROM game_interaction_instances')).toEqual([{status:'cancelled',completed_at:now}]);expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);
});

it('SD-IT-007/030: zero-row end cancellation rolls back ended status and both claim releases',async()=>{
 await catalog(1);await accept();await run('story.action.commit',action(810,{nextNodeId:'entry',kind:'interaction.updated',interaction:{instanceId:id(910),definitionId:'bookmark',definitionVersion:'v1',expectedRevision:0,status:'active',stateJson:'{}'}}));
 const plan=planCommand('game.round.end',{...auth(),roundId:id(502)},now);const index=plan.findIndex(s=>s.sql.startsWith('UPDATE game_interaction_instances'));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE ','WHERE 0 AND ');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('active');expect(await rows('SELECT * FROM game_active_round_claims')).toHaveLength(2);expect((await rows('SELECT status FROM game_interaction_instances'))[0].status).toBe('active');
});
