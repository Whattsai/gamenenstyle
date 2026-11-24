import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,beforeEach,expect,it} from 'vitest';
import {executeTrackAction,planTrackAction,executeTrackActivation,planTrackActivation} from '../src/scene-event-track-commands';

let mf:Miniflare,db:D1Database;
const now=Date.UTC(2026,10,16),id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`;
const rows=async(sql:string,...values:unknown[])=>(await db.prepare(sql).bind(...values).all()).results as any[];
const world=JSON.stringify({objects:{tag:'window'},flags:{}});
const auth=(actor:number)=>({accountId:id(actor),sessionId:id(100+actor),cv:1,accessExpiresAt:now+600000,roundId:id(500)});
function command(actor=2,request=600):any{
 const role=actor===2?'inviter':'acceptor';
 return {...auth(actor),clientRequestId:id(request),eventId:id(request+1000),stateEventId:id(request+2000),completionEventId:id(request+3000),storySessionId:id(501),episodeSeq:1,actorRole:role,expectedTrackRevision:1,expectedSharedRevision:1,sharedChanged:true,worldStateJson:world,completed:false,endingId:null,requestPayload:JSON.stringify({bindingId:'narrative:test:rescue',actionId:'submit',params:{optionId:role==='inviter'?'hold':'retrieve'}}),presentationSteps:[],progressUpdates:[{accountId:id(actor),role,expectedRevision:1,nodeId:role==='inviter'?'i01':'a01',areaId:'counter'}],instance:{instanceId:id(550),bindingId:'narrative:test:rescue',eventId:'cooperate',eventVersion:'v2',repeatGroup:'rescue',trackScope:'shared',expectedRevision:null,status:'active',stateJson:JSON.stringify({submissions:{[role]:{submit:{actionId:'submit',params:{optionId:role==='inviter'?'hold':'retrieve'},nodeId:role==='inviter'?'i01':'a01'}}}})}};
}
function activation(scope='inviter'):any{return{...auth(2),eventId:id(900),storySessionId:id(501),episodeSeq:1,expectedSharedRevision:1,progressRevisions:[{accountId:id(2),role:'inviter',revision:1},{accountId:id(1),role:'acceptor',revision:1}],instances:[{instanceId:id(901),bindingId:'scene:test:hidden',eventId:'inspect',eventVersion:'v2',repeatGroup:'optional-note',repeatScope:'playthrough',trackScope:scope,status:'cancelled'}]};}
async function facts(){const result:any={};for(const table of ['game_story_sessions','game_story_participant_progress','game_event_instances','game_round_events','game_rounds','game_scene_visits'])result[table]=await rows('SELECT * FROM '+table);return result;}
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-track-transaction'}}));db=await mf.getD1Database('DB')as unknown as D1Database;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0008').sort())await db.batch(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 for(const table of ['game_event_instances','game_story_participant_progress','game_scene_visits','game_round_events','game_story_sessions','game_active_round_claims','game_rounds','match_invitations','content_story_catalog','auth_sessions','auth_accounts'])await db.prepare('DELETE FROM '+table).run();
 for(const n of [1,2,3]){await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`track-sql-${n}@example.invalid`,now,now,now).run();await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(100+n),id(n),now,now+2592000000,now+604800000).run();}
 await db.prepare("INSERT INTO content_story_catalog(catalog_id,story_id,version,interest_tag_ids_json,recommendation_priority,manifest_key,manifest_sha256,status)VALUES(?,'test','v2','[]',1,'test',?,'published')").bind(id(400),'a'.repeat(64)).run();
 // 原邀請人是排序較大的帳號，角色不能由大小、裝置或上線先後推算。
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(450),id(1),id(2),id(2),id(451),now,now+86400000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(500),id(450),id(1),id(2),now,JSON.stringify([id(400)])).run();
 await db.prepare("INSERT INTO game_story_sessions(story_session_id,round_id,episode_seq,catalog_id,chapter_status,shared_revision,created_at,updated_at,world_state_json)VALUES(?,?,1,?,'playing',1,?,?,?)").bind(id(501),id(500),id(400),now,now,world).run();
 for(const actor of [1,2]){await db.prepare('INSERT INTO game_active_round_claims VALUES(?,?,?,?)').bind(id(510+actor),id(actor),id(500),now).run();await db.prepare('INSERT INTO game_story_participant_progress VALUES(?,?,?,?,?,?,?)').bind(id(501),id(actor),actor===2?'inviter':'acceptor',actor===2?'i01':'a01','counter',1,now).run();}
});
it('SEF-IT-123: stale second submission keeps the first real answer, receipt, both tracks and world unchanged',async()=>{
 const first=command();await executeTrackAction(db,first,now);const before=await facts();const second=command(1,601);second.instance.expectedRevision=1;
 await expect(executeTrackAction(db,second,now)).rejects.toThrow();expect(await facts()).toEqual(before);
 const saved=JSON.parse(before.game_event_instances[0].state_json);expect(saved.submissions.inviter.submit.params.optionId).toBe('hold');expect(saved.submissions.acceptor).toBeUndefined();expect(before.game_event_instances[0].status).toBe('active');
});
it('an observed partner area is guarded in the real batch without changing that partner progress',async()=>{
 const p=command();p.areaGuards=[{accountId:id(1),role:'acceptor',revision:1,areaId:'counter'}];
 const peer=await rows('SELECT * FROM game_story_participant_progress WHERE account_id=?',id(1));
 await executeTrackAction(db,p,now);expect(await rows('SELECT * FROM game_story_participant_progress WHERE account_id=?',id(1))).toEqual(peer);
});
it('a partner moving after area observation rejects every submitted fact and receipt',async()=>{
 const p=command();p.areaGuards=[{accountId:id(1),role:'acceptor',revision:1,areaId:'counter'}];
 await db.prepare("UPDATE game_story_participant_progress SET current_area_id='shelves',revision=revision+1 WHERE account_id=?").bind(id(1)).run();
 const before=await facts();await expect(executeTrackAction(db,p,now)).rejects.toThrow();expect(await facts()).toEqual(before);
});
it('a personal action can guard a world read without advancing shared revision, including exact receipt replay',async()=>{
 const p=command();p.sharedChanged=false;p.expectedSharedRevision=null;p.observedSharedRevision=1;p.instance.trackScope='inviter';
 await executeTrackAction(db,p,now);expect((await rows('SELECT shared_revision FROM game_story_sessions'))[0].shared_revision).toBe(1);
 await db.prepare('UPDATE game_story_sessions SET shared_revision=2').run();const saved=await facts();await executeTrackAction(db,p,now);expect(await facts()).toEqual(saved);
});
it('a changed world rejects a personal response evaluated against the old rain state without writing its receipt',async()=>{
 const p=command();p.sharedChanged=false;p.expectedSharedRevision=null;p.observedSharedRevision=1;p.instance.trackScope='inviter';
 await db.prepare('UPDATE game_story_sessions SET shared_revision=2').run();const before=await facts();await expect(executeTrackAction(db,p,now)).rejects.toThrow();expect(await facts()).toEqual(before);
});
it('SEF-IT-124: zero-row failures in event, progress, world or receipt roll back every fact in the same real D1 batch',async()=>{
 await executeTrackAction(db,command(),now);const before=await facts();
 for(const target of ['game_event_instances','game_story_participant_progress','game_story_sessions','game_round_events']){
  const second=command(1,601);second.expectedSharedRevision=2;second.instance.expectedRevision=1;second.instance.status='completed';second.instance.stateJson=JSON.stringify({submissions:{...JSON.parse(command().instance.stateJson).submissions,...JSON.parse(second.instance.stateJson).submissions}});
  const plans=planTrackAction(second,now);let replaced=false;
  const statements=plans.map(s=>{let sql=s.sql;if(!replaced&&new RegExp('^(UPDATE|INSERT INTO) '+target+'\\b').test(sql)){sql=sql.replace(/ WHERE /,' WHERE 0 AND ');replaced=true;}return db.prepare(sql).bind(...s.values);});expect(replaced).toBe(true);
  await expect(db.batch(statements)).rejects.toThrow();expect(await facts()).toEqual(before);
 }
});
it('SEF-IT-125: same actor on two devices has one CAS winner and one conflict, without duplicate tag or sequence',async()=>{
 const results=await Promise.allSettled([executeTrackAction(db,command(2,600),now),executeTrackAction(db,command(2,601),now)]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1);
 expect(await rows('SELECT * FROM game_event_instances')).toHaveLength(1);const events=await rows('SELECT sequence FROM game_round_events ORDER BY sequence');expect(events.map(e=>e.sequence)).toEqual(events.map((_,i)=>i+1));
});
it('two authorized personal tracks racing one shared bag have one owner, one receipt and unchanged losing progress',async()=>{
 // Generic optional object competition; formal RB-08 still permits only A to retrieve its tag.
 await db.prepare("UPDATE game_story_sessions SET world_state_json=?").bind(JSON.stringify({objects:{bag:'at-shelves'},flags:{}})).run();
 await db.prepare("UPDATE game_story_participant_progress SET current_area_id='shelves'").run();
 const commands=[command(2,620),command(1,621)];
 for(const p of commands){
  const role=p.actorRole,params={objectId:'bag'},action={actionId:'pick',params,nodeId:role==='inviter'?'i01':'a01'};
  p.worldStateJson=JSON.stringify({objects:{bag:'held-'+role},flags:{}});p.progressUpdates[0].areaId='shelves';
  p.instance={...p.instance,instanceId:id(role==='inviter'?570:571),bindingId:'scene:test:pick-'+role,eventId:'manipulate',repeatGroup:'pick-'+role,trackScope:role,status:'completed',stateJson:JSON.stringify({submissions:{[role]:{pick:action}}})};
  p.requestPayload=JSON.stringify({bindingId:p.instance.bindingId,actionId:'pick',params});
 }
 const results=await Promise.allSettled(commands.map(p=>executeTrackAction(db,p,now)));
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(results.filter(r=>r.status==='rejected')).toHaveLength(1);
 const winner=results.findIndex(r=>r.status==='fulfilled'),saved=await facts(),owner=commands[winner].actorRole;
 expect(JSON.parse(saved.game_story_sessions[0].world_state_json).objects).toEqual({bag:'held-'+owner});
 expect(saved.game_story_sessions[0].shared_revision).toBe(2);expect(saved.game_event_instances).toHaveLength(1);
 expect(saved.game_round_events.filter((r:any)=>r.kind==='story.track.updated')).toHaveLength(1);
 expect(saved.game_story_participant_progress.map((p:any)=>[p.role,p.revision]).sort()).toEqual([['acceptor',owner==='acceptor'?2:1],['inviter',owner==='inviter'?2:1]]);
 expect((await executeTrackAction(db,commands[winner],now)).rows).toEqual((results[winner]as PromiseFulfilledResult<any>).value.rows);
 await expect(executeTrackAction(db,commands[1-winner],now)).rejects.toThrow();expect(await facts()).toEqual(saved);
});
it('SEF-IT-126: spoofing the original role, another actor progress or partner submission is rejected atomically',async()=>{
 for(const change of [(p:any)=>p.actorRole='acceptor',(p:any)=>p.progressUpdates[0].accountId=id(1),(p:any)=>p.instance.stateJson=JSON.stringify({submissions:{acceptor:{submit:{actionId:'submit',params:{optionId:'retrieve'}}},inviter:{submit:{actionId:'submit',params:{optionId:'hold'}}}}})]){
  const before=await facts(),p=command();change(p);await expect(executeTrackAction(db,p,now)).rejects.toThrow();expect(await facts()).toEqual(before);
 }
});
it('replays restore the original receipt; changed payload, outsider, revoked session and ended room cannot mutate',async()=>{
 const p=command(),first=await executeTrackAction(db,p,now),before=await facts();expect((await executeTrackAction(db,p,now)).rows).toEqual(first.rows);expect(await facts()).toEqual(before);
 expect((await executeTrackAction(db,{...p,stateEventId:id(9999)},now)).rows).toEqual(first.rows);expect(await facts()).toEqual(before);
 await expect(executeTrackAction(db,{...p,requestPayload:'{}'},now)).rejects.toThrow();await expect(executeTrackAction(db,command(3,605),now)).rejects.toThrow();expect(await facts()).toEqual(before);
 await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(2)).run();await expect(executeTrackAction(db,p,now)).rejects.toThrow();
 await db.prepare("UPDATE game_rounds SET status='ended',ended_at=?").bind(now).run();await expect(executeTrackAction(db,command(1,606),now)).rejects.toThrow();
});
it('random decisions persist a negative result once, keep both tracks, hide the binding and roll back zero-row writes',async()=>{
 const p=activation();
 const original=await facts(),plan=planTrackActivation(p,now);const index=plan.findIndex(s=>s.sql.startsWith('INSERT INTO game_event_instances'));expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace('WHERE ','WHERE 0 AND ');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect(await facts()).toEqual(original);
 await executeTrackActivation(db,p,now);const saved=await facts();expect(saved.game_event_instances[0]).toMatchObject({status:'cancelled',revision:1,track_scope:'inviter'});expect(saved.game_story_participant_progress).toEqual(original.game_story_participant_progress);expect(saved.game_story_sessions).toEqual(original.game_story_sessions);
 expect(saved.game_round_events).toHaveLength(1);expect(JSON.stringify(saved.game_round_events)).not.toContain('scene:test:hidden');await executeTrackActivation(db,p,now);expect(await facts()).toEqual(saved);
 await expect(executeTrackActivation(db,{...p,eventId:id(902),expectedSharedRevision:1},now)).rejects.toThrow();expect(await facts()).toEqual(saved);
});
it.each(['inviter','shared'])('a %s random decision changes shared revision only for a shared event, never world or progress',async scope=>{
 const before=await facts();await executeTrackActivation(db,activation(scope),now);const saved=await facts();
 expect(saved.game_story_sessions[0].shared_revision).toBe(scope==='shared'?2:1);expect(saved.game_story_sessions[0].world_state_json).toBe(before.game_story_sessions[0].world_state_json);expect(saved.game_story_participant_progress).toEqual(before.game_story_participant_progress);
});
it('a zero-row random-decision round cursor update rolls back its instance and safe hint together',async()=>{
 const before=await facts(),plan=planTrackActivation(activation(),now);const index=plan.findIndex(s=>s.sql.startsWith('UPDATE game_rounds'));
 expect(index).toBeGreaterThanOrEqual(0);plan[index].sql=plan[index].sql.replace(/ WHERE round_id=\?$/,' WHERE 0 AND round_id=?');
 await expect(db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();expect(await facts()).toEqual(before);
});
it('a persisted negative semantic group blocks random and fixed aliases but does not consume the other role group',async()=>{
 const p=activation();await executeTrackActivation(db,p,now);const before=await facts(),revision=before.game_story_sessions[0].shared_revision;
 const alias={...p,eventId:id(902),expectedSharedRevision:revision,instances:[{...p.instances[0],instanceId:id(903),bindingId:'global:global:negative-alias'}]};
 await expect(executeTrackActivation(db,alias,now)).rejects.toThrow();expect(await facts()).toEqual(before);
 const fixed=command(2,700);fixed.expectedSharedRevision=revision;fixed.instance={...fixed.instance,instanceId:id(904),bindingId:'global:global:fixed-alias',repeatGroup:'optional-note',trackScope:'inviter',status:'completed'};
 await expect(executeTrackAction(db,fixed,now)).rejects.toThrow();expect(await facts()).toEqual(before);
 const partner={...p,...auth(1),eventId:id(905),expectedSharedRevision:revision,instances:[{...p.instances[0],instanceId:id(906),bindingId:'global:global:partner-note',trackScope:'acceptor'}]};
 await executeTrackActivation(db,partner,now);const saved=await facts();expect(saved.game_event_instances).toHaveLength(2);expect(saved.game_story_participant_progress).toEqual(before.game_story_participant_progress);expect(saved.game_story_sessions).toEqual(before.game_story_sessions);
});
it('round repeat scope rejects a completed group from an older episode; playthrough scope permits a fresh instance',async()=>{
 await db.prepare("UPDATE game_story_sessions SET chapter_status='completed' WHERE story_session_id=?").bind(id(501)).run();
 await db.prepare("INSERT INTO game_event_instances VALUES(?,?,?,'cooperate','v2','rescue','completed',?,1,?,?,'shared')").bind(id(550),id(501),'narrative:test:rescue',command().instance.stateJson,now,now).run();
 await db.prepare("INSERT INTO game_story_sessions(story_session_id,round_id,episode_seq,catalog_id,chapter_status,shared_revision,created_at,updated_at,world_state_json)VALUES(?,?,2,?,'playing',1,?,?,?)").bind(id(502),id(500),id(400),now,now,world).run();
 for(const actor of [1,2])await db.prepare('INSERT INTO game_story_participant_progress VALUES(?,?,?,?,?,?,?)').bind(id(502),id(actor),actor===2?'inviter':'acceptor',actor===2?'i01':'a01','counter',1,now).run();
 const p=command();p.storySessionId=id(502);p.episodeSeq=2;p.instance.instanceId=id(551);p.instance.repeatScope='round';
 const before=await facts();await expect(executeTrackAction(db,p,now)).rejects.toThrow();expect(await facts()).toEqual(before);
 p.instance.repeatScope='playthrough';await executeTrackAction(db,p,now);expect(await rows('SELECT story_session_id FROM game_event_instances ORDER BY story_session_id')).toEqual([{story_session_id:id(501)},{story_session_id:id(502)}]);
 expect(await rows('SELECT * FROM game_story_participant_progress WHERE story_session_id=? AND account_id=?',id(502),id(1))).toMatchObject([{revision:1}]);
});

it('repeatable observations persist bounded entered-node history atomically with progress and original receipts',async()=>{
 const first=command();first.sharedChanged=false;first.expectedSharedRevision=null;first.instance.trackScope='inviter';first.instance.stateJson=JSON.stringify({submissions:JSON.parse(first.instance.stateJson).submissions,enteredNodeIndexes:{inviter:[0,1]}});
 await executeTrackAction(db,first,now);
 const second=structuredClone(first);second.clientRequestId=id(690);second.eventId=id(1690);second.stateEventId=id(2690);second.completionEventId=id(3690);second.expectedTrackRevision=2;second.progressUpdates[0].expectedRevision=2;second.progressUpdates[0].nodeId='i03';second.instance.expectedRevision=1;second.instance.stateJson=JSON.stringify({submissions:JSON.parse(first.instance.stateJson).submissions,enteredNodeIndexes:{inviter:[0,1,2]}});
 await executeTrackAction(db,second,now);const saved=await facts();expect(JSON.parse(saved.game_event_instances[0].state_json).enteredNodeIndexes).toEqual({inviter:[0,1,2]});expect(saved.game_story_participant_progress.find((p:any)=>p.role==='inviter').revision).toBe(3);expect(saved.game_story_participant_progress.find((p:any)=>p.role==='acceptor').revision).toBe(1);
 await executeTrackAction(db,first,now);expect(await facts()).toEqual(saved);
 const third=structuredClone(second);third.clientRequestId=id(691);third.eventId=id(1691);third.expectedTrackRevision=3;third.progressUpdates[0].expectedRevision=3;third.instance.expectedRevision=2;third.instance.stateJson=JSON.stringify({submissions:JSON.parse(first.instance.stateJson).submissions,enteredNodeIndexes:{inviter:[0,1,2,3]}});
 let replaced=false;const statements=planTrackAction(third,now).map(s=>{let sql=s.sql;if(!replaced&&sql.startsWith('INSERT INTO game_round_events')){sql=sql.replace(/ WHERE /,' WHERE 0 AND ');replaced=true;}return db.prepare(sql).bind(...s.values);});expect(replaced).toBe(true);await expect(db.batch(statements)).rejects.toThrow();expect(await facts()).toEqual(saved);
});
it('entered-node history cannot be erased, exceed the immutable node bound or change the unadvanced partner',async()=>{
 const first=command();first.instance.stateJson=JSON.stringify({submissions:JSON.parse(first.instance.stateJson).submissions,enteredNodeIndexes:{inviter:[0,1]}});await executeTrackAction(db,first,now);const saved=await facts();
 for(const history of [{inviter:[0]},{inviter:[0,1],acceptor:[256]},{inviter:[0,1,2],acceptor:[0]}]){
  const next=command(1,692);next.expectedSharedRevision=2;next.instance.expectedRevision=1;next.instance.stateJson=JSON.stringify({submissions:{...JSON.parse(first.instance.stateJson).submissions,...JSON.parse(next.instance.stateJson).submissions},enteredNodeIndexes:history});
  await expect(executeTrackAction(db,next,now)).rejects.toThrow();expect(await facts()).toEqual(saved);
 }
});

it('SEF-IT-151: a unilateral safety completion atomically cancels cooperation, closes the visit and preserves active room and chat',async()=>{
 await db.prepare("INSERT OR IGNORE INTO content_scene_catalog VALUES(?,'safety-scene','v1','安全區','safety-scene',?,'published',?)").bind(id(420),'a'.repeat(64),now).run();
 await db.prepare('INSERT INTO game_scene_visits VALUES(?,?,1,?,?,NULL)').bind(id(421),id(501),id(420),now).run();
 await executeTrackAction(db,command(),now);
 const safety=command(1,800);safety.expectedSharedRevision=2;safety.completed=true;safety.endingId='safety-exit';
 safety.worldStateJson=JSON.stringify({objects:{tag:'window'},flags:{water:'danger'}});
 safety.instance={...safety.instance,instanceId:id(801),bindingId:'narrative:test:safety',repeatGroup:'safety',trackScope:'acceptor',expectedRevision:null,status:'completed',stateJson:JSON.stringify({submissions:JSON.parse(safety.instance.stateJson).submissions,endingId:'safety-exit'})};
 const before=await facts();
 // 完成通知零列也必須撤銷整份安全結算，不能留下半 completed。
 const plans=planTrackAction(safety,now);let injected=false;
 await expect(db.batch(plans.map(s=>{let sql=s.sql;if(!injected&&sql.startsWith('INSERT INTO game_round_events')&&s.values.includes('chapter.completed')){sql=sql.replace(' WHERE ',' WHERE 0 AND ');injected=true;}return db.prepare(sql).bind(...s.values);}))).rejects.toThrow();
 expect(injected).toBe(true);expect(await facts()).toEqual(before);
 const receipt=await executeTrackAction(db,safety,now),saved=await facts();
 expect(saved.game_story_sessions[0]).toMatchObject({chapter_status:'completed',shared_revision:3});
 expect(saved.game_rounds[0].status).toBe('active');expect(await rows('SELECT * FROM game_active_round_claims')).toHaveLength(2);
 expect(saved.game_event_instances.find((i:any)=>i.track_scope==='shared').status).toBe('cancelled');
 expect(saved.game_scene_visits[0].left_at).toBe(now);
 expect(saved.game_round_events.filter((e:any)=>e.kind==='chapter.completed')).toHaveLength(1);
 expect(saved.game_story_participant_progress.find((p:any)=>p.role==='inviter')).toEqual(before.game_story_participant_progress.find((p:any)=>p.role==='inviter'));
 expect((await executeTrackAction(db,safety,now)).rows).toEqual(receipt.rows);expect(await facts()).toEqual(saved);
 await expect(executeTrackAction(db,command(2,802),now)).rejects.toThrow();expect(await facts()).toEqual(saved);
});
