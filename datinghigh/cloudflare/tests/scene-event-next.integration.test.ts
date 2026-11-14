import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,beforeEach,expect,it} from 'vitest';
// @ts-expect-error 共用固定內容建構與 prepared 發布政策。
import {buildSceneEventBundle} from '../../tools/scene-event-content-policy.mjs';
// @ts-expect-error 共用固定內容建構與 prepared 發布政策。
import {publishSceneEventBundles,planSceneEventPublication} from '../../tools/scene-event-publish-policy.mjs';
import {executeFrameworkNext,executeFrameworkVote,executeFrameworkAcceptance,executeFrameworkEnd,readFrameworkSnapshot,loadFrameworkCatalog,planFrameworkNext,planFrameworkActivation,planFrameworkAction} from '../src/scene-event-commands';
import {readAuthorizedSceneEventContent} from '../src/scene-event-read';
import {planStoryCommand} from '../src/story-commands';
let mf:Miniflare,db:D1Database,bucket:R2Bucket;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,now=Date.UTC(2026,10,13);
const source=JSON.parse(readFileSync(new URL('../../contracts/story-scenes.json',import.meta.url),'utf8')).stories[0];
const rows=async(sql:string,...values:unknown[])=>(await db.prepare(sql).bind(...values).all()).results as any[];
const statements=(sql:string)=>sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s));
const auth=(actor=1)=>({accountId:id(actor),sessionId:id(100+actor),cv:1,accessExpiresAt:now+600000,roundId:id(500)});
const command=(actor=1,request=600,agree=true)=>({...auth(actor),clientRequestId:id(request),eventId:id(request+1000),offersEventId:id(request+2000),storySessionId:id(request+3000),sceneVisitId:id(request+4000),categoryEventId:id(request+5000),sceneEventId:id(request+6000),narrativeEventId:id(request+7000),completedEpisodeSeq:1,agree});
const next=(actor=1,request=600,agree=true)=>executeFrameworkNext({DB:db,STORY_CONTENT:bucket},command(actor,request,agree),now,{random:()=>.25});
const vote=(actor:number,request:number,category=4003)=>{const{completedEpisodeSeq,agree,offersEventId,...p}=command(actor,request);return executeFrameworkVote({DB:db,STORY_CONTENT:bucket},{...p,episodeSeq:2,categoryId:id(category)},now,{random:()=>.25});};
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-next'},r2Buckets:['STORY_CONTENT']}));db=await mf.getD1Database('DB')as unknown as D1Database;bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0006').sort())await db.batch(statements(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8')));
 await db.batch(statements(readFileSync(new URL('../migrations/0006_scene_event_framework.sql',import.meta.url),'utf8')));
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 const objects=await bucket.list();for(const object of objects.objects)await bucket.delete(object.key);
 for(const table of ['game_event_instances','game_interaction_instances','game_scene_visits','game_round_events','game_story_sessions','game_active_round_claims','game_rounds','match_invitations','content_scene_category_links','content_story_catalog','content_scene_catalog','content_story_categories','user_profiles','auth_sessions','auth_accounts'])await db.prepare('DELETE FROM '+table).run();
 for(const n of [1,2,3]){
  await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`next-${n}@example.invalid`,now,now,now).run();
  await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(100+n),id(n),now,now+2592000000,now+604800000).run();
  await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,interests_json,created_at,updated_at) VALUES(?,?,?,?,?,?)").bind(id(200+n),id(n),'測試玩家',JSON.stringify({interestTagIds:['reading']}),now,now).run();
 }
 await seedContent(1);await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(400),id(1),id(2),id(1),id(401),now,now+86400000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,2,?)").bind(id(500),id(400),id(1),id(2),now,JSON.stringify([id(4003)])).run();
 await db.prepare("INSERT INTO game_story_sessions VALUES(?,?,1,?,'ending-together','completed',2,?,?,?)").bind(id(501),id(500),id(4002),now,now,id(4003)).run();
 await db.prepare("INSERT INTO game_scene_visits VALUES(?,?,1,?,?,?)").bind(id(502),id(501),id(4001),now,now).run();
 for(const n of [1,2])await db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(510+n),id(n),id(500),now).run();
 for(const [seq,kind]of [[1,'story.narrative.selected'],[2,'chapter.completed']]as const)await db.prepare('INSERT INTO game_round_events VALUES(?,?,?,NULL,NULL,?,?,?)').bind(id(520+seq),id(500),seq,kind,JSON.stringify({episodeSeq:1,storySessionId:id(501)}),now).run();
});
async function seedContent(count:number,version='v1'){
 const categories=Array.from({length:count},(_,n)=>({categoryId:id(4003+n),code:['romance','mystery','travel'][n],version:'v1',title:['浪漫','懸疑','旅程'][n],interestTagIds:[['reading','puzzle','travel'][n]],recommendationPriority:n+1}));
 const contentSource=structuredClone(source);for(const definition of contentSource.interactions)definition.version=version;
 const bundle=buildSceneEventBundle(contentSource,new URL('../../',import.meta.url),{sceneCatalogId:id(version==='v1'?4001:4101),narrativeCatalogId:id(version==='v1'?4002:4102),sceneId:'rain-bookshop',sceneVersion:version,narrativeId:'rain-bookshop-lost-note',narrativeVersion:version,poolVersion:version,capabilities:['bookshop'],eligibleCategoryCodes:categories.map(c=>c.code),categories});
 await publishSceneEventBundles(db,bucket,[bundle],{now});
}
/** 只在本檔私有 Miniflare 安裝可重現的選擇 fixture；不改正式來源、不提供或冒用人工 Gate。 */
async function seedSelectionFixture(retireMystery=true){
 const categories=[{categoryId:id(4003),code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading'],recommendationPriority:1},{categoryId:id(4004),code:'mystery',version:'v1',title:'懸疑',interestTagIds:['puzzle'],recommendationPriority:2}];
 const base={sceneCatalogId:id(4101),sceneId:'rain-bookshop',sceneVersion:'v2',narrativeVersion:'v1',capabilities:['bookshop'],categories,eligibleCategoryCodes:['romance']};
 const make=(extra:any)=>buildSceneEventBundle(source,new URL('../../',import.meta.url),{...base,...extra});
 const bundles=[make({narrativeCatalogId:id(4102),narrativeId:'rain-bookshop-lost-note',narrativeVersion:'v2'}),make({narrativeCatalogId:id(4302),narrativeId:'z-independent',sequenceGroupId:'fixture-series',sequenceOrder:1}),make({narrativeCatalogId:id(4402),narrativeId:'zz-locked',sequenceGroupId:'fixture-series',sequenceOrder:2,prerequisites:['z-independent']}),make({narrativeCatalogId:id(4502),narrativeId:'a-mystery',eligibleCategoryCodes:['mystery']}),make({sceneCatalogId:id(4601),sceneId:'z-unplayed-scene',sceneVersion:'v1',narrativeCatalogId:id(4602),narrativeId:'fixture-new-scene',categories:[categories[0]]})];
 for(const bundle of bundles)for(const object of bundle.objects)await bucket.put(object.key,object.bytes);
 await commit(planSceneEventPublication(bundles,now));if(retireMystery)await db.prepare("UPDATE content_story_categories SET status='retired' WHERE code='mystery'").run();return{base};
}

it('only both real consents create one next session, scene visit and pinned selection without fake votes',async()=>{
 await next();expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(1);
 await next(2,601);expect(await rows('SELECT episode_seq,chapter_status FROM game_story_sessions ORDER BY episode_seq')).toEqual([{episode_seq:1,chapter_status:'completed'},{episode_seq:2,chapter_status:'playing'}]);
 expect(await rows("SELECT * FROM game_round_events WHERE kind='story.episode.offers.frozen'")).toHaveLength(1);
 expect(await rows("SELECT * FROM game_round_events WHERE kind='story.category.vote.submitted'")).toEqual([]);expect(await rows('SELECT * FROM game_scene_visits')).toHaveLength(2);
 await next(2,601);expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(2);await expect(next(2,601,false)).rejects.toThrow();
 expect((await rows('SELECT story_offer_category_ids_json FROM game_rounds'))[0].story_offer_category_ids_json).toBe(JSON.stringify([id(4003)]));
});

it('withdrawal is scoped to the completed episode and a stale consent cannot open a third session',async()=>{
 await next();await next(1,601,false);await next(2,602);expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(1);
 await next(1,603,true);expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(2);await expect(next(1,604,false)).rejects.toThrow();
});

it('simultaneous consents serialize to exactly one episode and gap-free event sequence',async()=>{
 const original=await rows('SELECT story_offer_category_ids_json FROM game_rounds');
 await Promise.all([next(1,600),next(2,601)]);expect(await rows('SELECT * FROM game_story_sessions WHERE episode_seq=2')).toHaveLength(1);
 const events=await rows('SELECT sequence FROM game_round_events ORDER BY sequence');expect(events.map(e=>e.sequence)).toEqual(events.map((_,n)=>n+1));expect((await rows('SELECT last_event_seq FROM game_rounds'))[0].last_event_seq).toBe(events.length);
 expect(await rows('SELECT story_offer_category_ids_json FROM game_rounds')).toEqual(original);
});

it('outsider and revoked session fail before content IO, ended rounds cannot accept consent',async()=>{
 let reads=0;const inaccessible={get:async()=>{reads++;return null;}}as unknown as R2Bucket;
 await expect(executeFrameworkNext({DB:db,STORY_CONTENT:inaccessible},command(3),now)).rejects.toThrow();expect(reads).toBe(0);
 await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(1)).run();await expect(next()).rejects.toThrow();
 await db.prepare("UPDATE game_rounds SET status='ended',ended_at=?").bind(now).run();await expect(next(2)).rejects.toThrow();
});

it('a committed receipt is restored without rereading failed R2 or rerolling',async()=>{
 await next();await next(2,601);let reads=0;
 await executeFrameworkNext({DB:db,STORY_CONTENT:{get:async()=>{reads++;throw Error('R2 unavailable');}}as unknown as R2Bucket},command(2,601),now,{random:()=>{throw Error('Must not reroll');}});
 expect(reads).toBe(0);expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(2);
});

it('a zero-row next scene visit rolls back the second consent, frozen offers and session',async()=>{
 await next();const catalog=await loadFrameworkCatalog({DB:db,STORY_CONTENT:bucket});const plan=planFrameworkNext(command(2,601),catalog,now,{sceneDraw:.25,narrativeDraw:.25});
 const index=plan.findIndex(s=>s.sql.includes('INSERT INTO game_scene_visits'));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE s.round_id=i.round_id','WHERE 0 AND s.round_id=i.round_id');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();
 expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(1);expect(await rows("SELECT * FROM game_round_events WHERE actor_account_id=?",id(2))).toEqual([]);expect(await rows('SELECT last_event_seq FROM game_rounds')).toEqual([{last_event_seq:3}]);
});

it('freezes new offers from the latest persisted interests while preserving the original round offers',async()=>{
 await seedContent(3,'v2');await next();
 await db.prepare('UPDATE user_profiles SET interests_json=?').bind(JSON.stringify({interestTagIds:['travel']})).run();await next(2,601);
 const events=await rows("SELECT payload_json FROM game_round_events WHERE kind='story.episode.offers.frozen'");
 expect(JSON.parse(events[0].payload_json)).toEqual({episodeSeq:2,categoryIds:[id(4005),id(4003),id(4004)]});
 expect(await rows('SELECT episode_seq FROM game_story_sessions')).toEqual([{episode_seq:1}]);
 await db.prepare('UPDATE user_profiles SET interests_json=?').bind(JSON.stringify({interestTagIds:['puzzle']})).run();await next(2,601);
 expect(await rows("SELECT payload_json FROM game_round_events WHERE kind='story.episode.offers.frozen'")).toEqual(events);
 expect((await rows('SELECT story_offer_category_ids_json FROM game_rounds'))[0].story_offer_category_ids_json).toBe(JSON.stringify([id(4003)]));
});

it('no playable content rolls back the final consent and does not create an empty episode',async()=>{
 await next();await db.prepare("UPDATE content_story_catalog SET status='retired'").run();
 await expect(next(2,601)).rejects.toThrow('NO_PLAYABLE_STORY');
 expect(await rows('SELECT episode_seq FROM game_story_sessions')).toEqual([{episode_seq:1}]);
 expect(await rows("SELECT * FROM game_round_events WHERE actor_account_id=?",id(2))).toEqual([]);
 expect(await rows("SELECT * FROM game_round_events WHERE kind='story.episode.offers.frozen'")).toEqual([]);
});

it('two real latest votes select the original inviter category and never expose the other pending vote',async()=>{
 await seedContent(3,'v2');await next();await next(2,601);await vote(1,610,4004);
 const snapshot=await readFrameworkSnapshot(db,auth(2),now);const pending=snapshot.rows.filter((r:any)=>r.record_type==='vote');
 expect(pending).toHaveLength(1);expect(JSON.parse((pending[0] as any).payload_json)).toEqual({episodeSeq:2});
 await vote(1,611,4005);await vote(2,612,4003);
 expect((await rows("SELECT payload_json FROM game_round_events WHERE kind='story.category.vote.submitted' ORDER BY sequence")).map(e=>JSON.parse(e.payload_json).categoryId)).toEqual([id(4004),id(4005),id(4003)]);
 expect(await rows('SELECT episode_seq,selected_category_id FROM game_story_sessions WHERE episode_seq=2')).toEqual([{episode_seq:2,selected_category_id:id(4005)}]);
 await vote(2,612,4003);await expect(vote(2,612,4004)).rejects.toThrow();await expect(vote(1,613,4003)).rejects.toThrow();
 expect(await rows('SELECT * FROM game_scene_visits')).toHaveLength(2);
});

it('votes must target the current frozen episode and concurrent ballots commit one selection',async()=>{
 await seedContent(3,'v2');await next();await next(2,601);await expect(vote(1,610,4999)).rejects.toThrow();
 const{completedEpisodeSeq,agree,offersEventId,...p}=command(1,611);await expect(executeFrameworkVote({DB:db,STORY_CONTENT:bucket},{...p,episodeSeq:1,categoryId:id(4003)},now)).rejects.toThrow();
 await Promise.all([vote(1,612,4004),vote(2,613,4004)]);
 expect(await rows('SELECT * FROM game_story_sessions WHERE episode_seq=2')).toHaveLength(1);
 expect(await rows("SELECT * FROM game_round_events WHERE kind='story.category.selected' AND json_extract(payload_json,'$.episodeSeq')=2")).toHaveLength(1);
});

const eventNow=now+60000;
const commit=async(plan:{sql:string;values:unknown[]}[])=>db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)));
const binding='narrative:rain-bookshop-lost-note:reading-path';
const activation=(storySessionId:string)=>({...auth(),storySessionId,episodeSeq:2,nodeId:'entry',expectedRevision:1,activationEventId:id(802),instances:[{instanceId:id(800),bindingId:binding,eventId:'reading-path',eventVersion:'v1',repeatGroup:'reading-path',repeatScope:'playthrough',status:'active',stateJson:JSON.stringify({answers:{}}),eventSequenceId:id(801)}]});
const action=(storySessionId:string,actor=1,revision=2,completed=false)=>({...auth(actor),clientRequestId:id(820+actor),eventId:id(830+actor),nodeEventId:id(840+actor),completionEventId:id(850+actor),storySessionId,episodeSeq:2,expectedRevision:revision,nodeId:'entry',nextNodeId:completed?'ending-together':'entry',completed,kind:'interaction.updated',payload:JSON.stringify({result:completed?'resolved':'pending_one'}),requestPayload:JSON.stringify({action:'warm',actor,revision}),instance:{instanceId:id(800),bindingId:binding,eventVersion:'v1',expectedRevision:revision-1,status:completed?'completed':'active',stateJson:JSON.stringify({answers:completed?{[id(1)]:'warm',[id(2)]:'warm'}:{[id(1)]:'warm'}})}});

it('event activation and completion use revision CAS, close visits and atomically preserve round chat',async()=>{
 await next();await next(2,601);const sid=(await rows('SELECT story_session_id FROM game_story_sessions WHERE episode_seq=2'))[0].story_session_id;
 await commit(planFrameworkActivation(activation(sid),eventNow));await commit(planFrameworkActivation(activation(sid),eventNow));
 expect(await rows('SELECT revision,status FROM game_event_instances')).toEqual([{revision:1,status:'active'}]);
 await commit(planFrameworkAction(action(sid),eventNow));expect(await rows('SELECT revision,status FROM game_event_instances')).toEqual([{revision:2,status:'active'}]);
 await expect(commit(planFrameworkAction(action(sid,2,2,true),eventNow))).rejects.toThrow();
 await commit(planFrameworkAction(action(sid,2,3,true),eventNow));await commit(planFrameworkAction(action(sid,2,3,true),eventNow));
 expect(await rows('SELECT chapter_status FROM game_story_sessions WHERE episode_seq=2')).toEqual([{chapter_status:'completed'}]);
 expect(await rows('SELECT status,revision FROM game_event_instances')).toEqual([{status:'completed',revision:3}]);
 expect((await rows('SELECT left_at FROM game_scene_visits WHERE story_session_id=?',sid))[0].left_at).toBe(eventNow);
 expect(await rows("SELECT * FROM game_round_events WHERE kind='chapter.completed' AND json_extract(payload_json,'$.episodeSeq')=2")).toHaveLength(1);
 expect(await rows('SELECT status FROM game_rounds')).toEqual([{status:'active'}]);
});

it('a failed visit closure rolls back completion, event state, revision and all receipt events',async()=>{
 await next();await next(2,601);const sid=(await rows('SELECT story_session_id FROM game_story_sessions WHERE episode_seq=2'))[0].story_session_id;
 await commit(planFrameworkActivation(activation(sid),eventNow));const p=action(sid,1,2,true),plan=planFrameworkAction(p,eventNow);
 const index=plan.findIndex(s=>s.sql.startsWith('UPDATE game_scene_visits'));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE ','WHERE 0 AND ');
 await expect(commit(plan)).rejects.toThrow();expect(await rows('SELECT chapter_status,progress_revision FROM game_story_sessions WHERE episode_seq=2')).toEqual([{chapter_status:'playing',progress_revision:2}]);
 expect(await rows('SELECT status,revision FROM game_event_instances')).toEqual([{status:'active',revision:1}]);
 expect(await rows('SELECT * FROM game_round_events WHERE client_request_id=?',p.clientRequestId)).toEqual([]);
});

async function pendingInvitation(){
 for(const table of ['game_event_instances','game_interaction_instances','game_scene_visits','game_round_events','game_story_sessions','game_active_round_claims','game_rounds'])await db.prepare('DELETE FROM '+table).run();
 await db.prepare("UPDATE match_invitations SET status='pending',responded_at=NULL").run();await db.prepare("UPDATE user_profiles SET birth_date='1990-01-01',gender='diverse',selected_avatar_type='builtin',selected_avatar_ref='male-01'").run();
 const{roundId,...p}=auth(2);return{...p,invitationId:id(400),action:'accept',roundId:id(900),participantLowId:id(901),participantHighId:id(902)};
}
it('accepting a real invitation freezes categories and initializes the sole playable scene atomically',async()=>{
 const p=await pendingInvitation();await executeFrameworkAcceptance({DB:db,STORY_CONTENT:bucket},p,now,{random:()=>.25});
 expect(await rows('SELECT status,story_offer_category_ids_json,last_event_seq FROM game_rounds')).toEqual([{status:'active',story_offer_category_ids_json:JSON.stringify([id(4003)]),last_event_seq:3}]);
 expect(await rows('SELECT * FROM game_active_round_claims')).toHaveLength(2);expect(await rows('SELECT * FROM game_scene_visits')).toHaveLength(1);
 expect(await rows('SELECT selected_category_id,episode_seq FROM game_story_sessions')).toEqual([{selected_category_id:id(4003),episode_seq:1}]);
 await executeFrameworkAcceptance({DB:db,STORY_CONTENT:{get:async()=>{throw Error('must recover before R2');}}as unknown as R2Bucket},p,now);expect(await rows('SELECT * FROM game_story_sessions')).toHaveLength(1);
});
it('an unreadable or unplayable publication cannot accept an invitation or take either claim',async()=>{
 const p=await pendingInvitation();await expect(executeFrameworkAcceptance({DB:db,STORY_CONTENT:{get:async()=>null}as unknown as R2Bucket},p,now)).rejects.toThrow();
 expect(await rows('SELECT status FROM match_invitations')).toEqual([{status:'pending'}]);expect(await rows('SELECT * FROM game_rounds')).toEqual([]);
 await db.prepare("UPDATE content_story_catalog SET status='retired'").run();await expect(executeFrameworkAcceptance({DB:db,STORY_CONTENT:bucket},p,now)).rejects.toThrow('NO_PLAYABLE_STORY');
 expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);
});
it('a rejected random event decision advances the recovery cursor once without revealing the hidden binding',async()=>{
 await next();await next(2,601);const sid=(await rows('SELECT story_session_id FROM game_story_sessions WHERE episode_seq=2'))[0].story_session_id,p=activation(sid);p.instances[0].status='cancelled';
 const before=(await rows('SELECT last_event_seq FROM game_rounds'))[0].last_event_seq;await commit(planFrameworkActivation(p,eventNow));await commit(planFrameworkActivation(p,eventNow));
 expect(await rows('SELECT last_event_seq FROM game_rounds')).toEqual([{last_event_seq:before+1}]);
 expect(await rows('SELECT status,revision FROM game_event_instances')).toEqual([{status:'cancelled',revision:1}]);
 const events=await rows('SELECT kind,payload_json FROM game_round_events WHERE sequence>?',before);expect(events).toHaveLength(1);expect(JSON.stringify(events)).not.toContain(binding);
});
it('private content reports an outsider as 403 before IO so the client can clear the private projection',async()=>{
 let reads=0;await expect(readAuthorizedSceneEventContent({...auth(3),catalogId:id(4002)},{DB:db,STORY_CONTENT:{get:async()=>{reads++;return null;}}as unknown as R2Bucket},now)).rejects.toMatchObject({code:'RESOURCE_FORBIDDEN',status:403});expect(reads).toBe(0);
});
it('revocation while reading pinned R2 returns 401 instead of a stale revision conflict',async()=>{
 let revoked=false;const delayed=new Proxy(bucket,{get(target,key){if(key==='get')return async(object:string)=>{const value=await target.get(object);if(!revoked){revoked=true;await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(1)).run();}return value;};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 await expect(readAuthorizedSceneEventContent({...auth(),catalogId:id(4002)},{DB:db,STORY_CONTENT:delayed},now)).rejects.toMatchObject({code:'SESSION_REVOKED',status:401});
});
it('the first pending category ballot still permits real round chat without inventing a session',async()=>{
 await seedContent(3,'v2');const p=await pendingInvitation();await executeFrameworkAcceptance({DB:db,STORY_CONTENT:bucket},p,now,{random:()=>.25});
 expect(await rows('SELECT * FROM game_story_sessions')).toEqual([]);
 const message={...auth(),roundId:p.roundId,clientRequestId:id(980),eventId:id(981),text:'We can chat while choosing a category'};
 const plan=()=>planStoryCommand('story.message.send',message,now,{allowPendingRoundChat:true});await commit(plan());await commit(plan());
 expect(await rows("SELECT payload_json FROM game_round_events WHERE kind='message.committed'")).toEqual([{payload_json:JSON.stringify({text:message.text})}]);
 expect(await rows('SELECT * FROM game_story_sessions')).toEqual([]);
});
it('an R2 read failure after family revocation still returns the private projection clearing status',async()=>{
 const revoked={get:async()=>{await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(1)).run();return null;}}as unknown as R2Bucket;
 await expect(readAuthorizedSceneEventContent({...auth(),catalogId:id(4002)},{DB:db,STORY_CONTENT:revoked},now)).rejects.toMatchObject({code:'SESSION_REVOKED',status:401});
});
it('chapter completion racing a real round end leaves no active event, open visit or late write',async()=>{
 await next();await next(2,601);const sid=(await rows('SELECT story_session_id FROM game_story_sessions WHERE episode_seq=2'))[0].story_session_id;await commit(planFrameworkActivation(activation(sid),eventNow));
 const results=await Promise.allSettled([commit(planFrameworkAction(action(sid,1,2,true),eventNow)),executeFrameworkEnd(db,auth(2),eventNow)]);expect(results[1].status).toBe('fulfilled');
 expect(await rows('SELECT status FROM game_rounds')).toEqual([{status:'ended'}]);expect(await rows('SELECT * FROM game_active_round_claims')).toEqual([]);expect(await rows("SELECT * FROM game_event_instances WHERE status='active'")).toEqual([]);expect(await rows('SELECT * FROM game_scene_visits WHERE left_at IS NULL')).toEqual([]);
 const before=await rows('SELECT sequence,kind,payload_json FROM game_round_events ORDER BY sequence');expect(before.map(e=>e.sequence)).toEqual(before.map((_,n)=>n+1));expect(before.filter(e=>e.kind==='chapter.completed'&&JSON.parse(e.payload_json).episodeSeq===2).length).toBeLessThanOrEqual(1);
 await expect(commit(planFrameworkAction(action(sid,1,2,true),eventNow))).rejects.toThrow();expect(await rows('SELECT sequence,kind,payload_json FROM game_round_events ORDER BY sequence')).toEqual(before);
});
it('all new runtime relations enforce real D1 foreign keys, unique visit/binding, status and JSON checks',async()=>{
 const insertEvent=(values:unknown[])=>db.prepare('INSERT INTO game_event_instances VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(...values).run();
 const valid=[id(990),id(501),'scene:rain-bookshop:bookmark','bookmark','v1','bookmark','active','{}',1,now,null];
 for(const [column,value]of [[1,id(9999)],[6,'invalid'],[7,'[]'],[7,'not-json'],[8,0],[10,now]]as const){const values=[...valid];values[column]=value;await expect(insertEvent(values)).rejects.toThrow();}
 await insertEvent(valid);await expect(insertEvent([id(991),...valid.slice(1)])).rejects.toThrow();
 for(const values of [[id(992),id(501),1,id(4001),now,null],[id(992),id(501),2,id(4001),now,null],[id(992),id(9999),1,id(4001),now,null],[id(992),id(501),1,id(9999),now,null]])await expect(db.prepare('INSERT INTO game_scene_visits VALUES(?,?,?,?,?,?)').bind(...values).run()).rejects.toThrow();
 await expect(db.prepare('UPDATE content_story_catalog SET scene_catalog_id=?').bind(id(9999)).run()).rejects.toThrow();await expect(db.prepare('UPDATE game_story_sessions SET selected_category_id=?').bind(id(9999)).run()).rejects.toThrow();
 await expect(db.prepare('INSERT INTO content_scene_category_links VALUES(?,?)').bind(id(4001),id(4003)).run()).rejects.toThrow();
 await expect(db.prepare("INSERT INTO content_scene_catalog SELECT ?,scene_id,'v99',title,'test-distinct-key',manifest_sha256,status,published_at FROM content_scene_catalog WHERE scene_catalog_id=?").bind(id(993),id(4001)).run()).rejects.toThrow();
 await expect(db.prepare("UPDATE content_scene_catalog SET status='invalid'").run()).rejects.toThrow();await expect(db.prepare("UPDATE content_story_categories SET status='invalid'").run()).rejects.toThrow();
 expect(await rows('PRAGMA foreign_key_check')).toEqual([]);expect(await rows('SELECT * FROM game_event_instances')).toHaveLength(1);
});
it('retiring v1 for v2 keeps every in-flight layer pinned while only a new episode adopts v2',async()=>{
 await seedContent(1,'v2');const old=await readAuthorizedSceneEventContent({...auth(),catalogId:id(4002)},{DB:db,STORY_CONTENT:bucket},now);
 expect(old.content.pins.every(p=>p.version==='v1')).toBe(true);expect(await rows("SELECT status FROM content_story_catalog WHERE catalog_id=?",id(4002))).toEqual([{status:'retired'}]);
 await next();await next(2,601);expect(await rows('SELECT episode_seq,catalog_id FROM game_story_sessions ORDER BY episode_seq')).toEqual([{episode_seq:1,catalog_id:id(4002)},{episode_seq:2,catalog_id:id(4102)}]);
 const newer=await readAuthorizedSceneEventContent({...auth(),catalogId:id(4102)},{DB:db,STORY_CONTENT:bucket},now);expect(newer.content.pins.every(p=>p.version==='v2')).toBe(true);
 const selected=JSON.parse((await rows("SELECT payload_json FROM game_round_events WHERE kind='story.narrative.selected' AND json_extract(payload_json,'$.episodeSeq')=2"))[0].payload_json);expect(selected.contentPins).toEqual(newer.content.pins);
 expect((await readAuthorizedSceneEventContent({...auth(),catalogId:id(4002)},{DB:db,STORY_CONTENT:bucket},now)).content.pins).toEqual(old.content.pins);
});
it.each([false,true])('natural completion seals a retained legacy interaction atomically, injected failure=%s',async(fault)=>{
 await next();await next(2,601);const sid=(await rows('SELECT story_session_id FROM game_story_sessions WHERE episode_seq=2'))[0].story_session_id;await commit(planFrameworkActivation(activation(sid),eventNow));
 await db.prepare("INSERT INTO game_interaction_instances VALUES(?,?,'entry','legacy-side','v1','active','{}',1,?,NULL)").bind(id(995),sid,now).run();
 const p=action(sid,1,2,true),plan=planFrameworkAction(p,eventNow);
 if(fault){const index=plan.findIndex(s=>s.sql.startsWith('UPDATE game_interaction_instances'));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE ','WHERE 0 AND ');await expect(commit(plan)).rejects.toThrow();expect(await rows('SELECT chapter_status FROM game_story_sessions WHERE story_session_id=?',sid)).toEqual([{chapter_status:'playing'}]);expect(await rows('SELECT status FROM game_event_instances')).toEqual([{status:'active'}]);expect(await rows('SELECT status FROM game_interaction_instances')).toEqual([{status:'active'}]);expect(await rows('SELECT * FROM game_round_events WHERE client_request_id=?',p.clientRequestId)).toEqual([]);}
 else{await commit(plan);expect(await rows('SELECT status,revision FROM game_interaction_instances')).toEqual([{status:'cancelled',revision:2}]);expect(await rows('SELECT chapter_status FROM game_story_sessions WHERE story_session_id=?',sid)).toEqual([{chapter_status:'completed'}]);}
});
for(const dimension of ['scene','narrative']as const)it.each([0,.25,.5,.75])('real D1 '+dimension+' weighting is exactly 3:1 and excludes locked/other-category narratives at draw=%s',async(draw)=>{
 await seedSelectionFixture();await next();let position=0;const draws=dimension==='scene'?[draw,0]:[0,draw];await executeFrameworkNext({DB:db,STORY_CONTENT:bucket},command(2,601),now,{random:()=>draws[position++]});expect(position).toBe(2);
 const selected=(await rows('SELECT c.story_id,s.scene_id FROM game_story_sessions p JOIN content_story_catalog c ON c.catalog_id=p.catalog_id JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE p.episode_seq=2'))[0];
 expect(selected.scene_id).toBe(dimension==='scene'&&draw>0?'z-unplayed-scene':'rain-bookshop');expect(selected.story_id).toBe(dimension==='scene'&&draw>0?'fixture-new-scene':dimension==='narrative'&&draw>0?'z-independent':'rain-bookshop-lost-note');
});
it.each([[0,'rain-bookshop-lost-note'],[.25,'z-independent'],[.5,'zz-locked']]as const)('completed prior chapter unlocks mixed candidates without forcing the sequel at draw=%s',async(draw,expected)=>{
 await seedSelectionFixture();await db.prepare("INSERT INTO game_story_sessions VALUES(?,?,2,?,'ending-together','completed',2,?,?,?)").bind(id(7000),id(500),id(4302),now,now,id(4003)).run();await db.prepare('INSERT INTO game_scene_visits VALUES(?,?,1,?,?,?)').bind(id(7001),id(7000),id(4101),now,now).run();await db.prepare("INSERT INTO game_round_events VALUES(?,?,3,NULL,NULL,'chapter.completed',?,?)").bind(id(7002),id(500),JSON.stringify({episodeSeq:2,storySessionId:id(7000)}),now).run();await db.prepare('UPDATE game_rounds SET last_event_seq=3').run();
 const first={...command(),completedEpisodeSeq:2},second={...command(2,601),completedEpisodeSeq:2};await executeFrameworkNext({DB:db,STORY_CONTENT:bucket},first,now);let position=0;await executeFrameworkNext({DB:db,STORY_CONTENT:bucket},second,now,{random:()=>[0,draw][position++]});expect(await rows('SELECT story_id FROM content_story_catalog WHERE catalog_id=(SELECT catalog_id FROM game_story_sessions WHERE episode_seq=3)')).toEqual([{story_id:expected}]);
});
it('the same scene selected through mystery cannot pick any romance-only narrative',async()=>{
 await seedSelectionFixture();await db.prepare("UPDATE content_story_categories SET status=CASE code WHEN 'mystery' THEN 'published' ELSE 'retired' END").run();await next();await next(2,601);
 expect(await rows('SELECT p.selected_category_id,c.story_id,s.scene_id FROM game_story_sessions p JOIN content_story_catalog c ON c.catalog_id=p.catalog_id JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE p.episode_seq=2')).toEqual([{selected_category_id:id(4004),story_id:'a-mystery',scene_id:'rain-bookshop'}]);
});
it('a new real pair resets selection history while the previous pair cannot read the new round',async()=>{
 await seedSelectionFixture();await executeFrameworkEnd(db,auth(),now);await db.prepare("UPDATE user_profiles SET birth_date='1990-01-01',gender='diverse',selected_avatar_type='builtin',selected_avatar_ref='male-01'").run();await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'pending',NULL,?,?,?,NULL)").bind(id(6400),id(1),id(3),id(1),id(6401),now,now+86400000,now).run();
 const{roundId,...member}=auth(3);let position=0;await executeFrameworkAcceptance({DB:db,STORY_CONTENT:bucket},{...member,invitationId:id(6400),action:'accept',roundId:id(6500),participantLowId:id(6501),participantHighId:id(6502)},now,{random:()=>[.25,0][position++]});
 expect(await rows('SELECT c.story_id,s.scene_id FROM game_story_sessions p JOIN content_story_catalog c ON c.catalog_id=p.catalog_id JOIN content_scene_catalog s ON s.scene_catalog_id=c.scene_catalog_id WHERE p.round_id=?',id(6500))).toEqual([{story_id:'rain-bookshop-lost-note',scene_id:'rain-bookshop'}]);
 await expect(readFrameworkSnapshot(db,{...auth(2),roundId:id(6500)},now)).rejects.toMatchObject({code:'RESOURCE_FORBIDDEN',status:403});
});
it.each([[4004,0,'a-mystery'],[4004,.75,'shared-combo'],[4003,.25,'shared-combo']]as const)('mixed real R2 narratives respect selected category %s at draw=%s',async(category,draw,expected)=>{
 const{base}=await seedSelectionFixture(false),shared=buildSceneEventBundle(source,new URL('../../',import.meta.url),{...base,narrativeCatalogId:id(4702),narrativeId:'shared-combo',eligibleCategoryCodes:['romance','mystery']});for(const object of shared.objects)await bucket.put(object.key,object.bytes);await commit(planSceneEventPublication([shared],now));
 await next();await next(2,601);await vote(1,610,category);const{completedEpisodeSeq,agree,offersEventId,...p}=command(2,612);let position=0;await executeFrameworkVote({DB:db,STORY_CONTENT:bucket},{...p,episodeSeq:2,categoryId:id(category)},now,{random:()=>[0,draw][position++]});
 expect(await rows('SELECT p.selected_category_id,c.story_id FROM game_story_sessions p JOIN content_story_catalog c ON c.catalog_id=p.catalog_id WHERE p.episode_seq=2')).toEqual([{selected_category_id:id(category),story_id:expected}]);expect(await rows('SELECT * FROM game_scene_visits')).toHaveLength(2);
});
