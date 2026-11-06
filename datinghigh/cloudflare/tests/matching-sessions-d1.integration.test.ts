import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { executeCommand, planCommand } from '../src/commands';
import { dispatch } from '../src/platform';
// @ts-expect-error 本地維運的純JS固定SQL契約由Node與真D1共同驗證。
import { localGameEndStatements } from '../../tools/local-game-policy.mjs';

let mf:Miniflare, db:D1Database, files:R2Bucket;
const now=Date.UTC(2026,10,6,0);
const id=(n:number)=>`019a281e-0000-7000-8000-${n.toString().padStart(12,'0')}`;
const owner=(n:number)=>({accountId:id(n),sessionId:id(n+100),cv:1,accessExpiresAt:now+600000});
const profile=(n:number,extra={})=>({...owner(n),expectedRevision:1,nickname:`玩家${n}`,bio:'喜歡咖啡',occupation:null,
 birthDate:'1990-01-01',regionCode:'TW-TPE',gender:'diverse',romanticOrientation:['male','female','diverse'],cardVisibility:{},
 traitTagIds:['warm'],interestTagIds:['coffee'],topicTagIds:[],valueTagIds:[],weekendPreference:'explore',sleepSchedule:null,
 conversationStyle:null,expectedInteractionFrequency:null,relationshipMode:null,preferredAgeMin:null,preferredAgeMax:null,
 preferredRegionCodes:[],sharedInterestWeight:50,...extra});
const run=(command:string,p:any,time=now)=>executeCommand(db,command,p,time);
const rows=async(sql:string,...values:unknown[])=>(await db.prepare(sql).bind(...values).all()).results as any[];
async function person(n:number){
 await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(n),`p${n}@example.invalid`,now,now,now).run();
 await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(id(n+100),id(n),now,now+2592000000,now+604800000).run();
 await run('profile.ensure',{...owner(n),profileId:id(n+200)});
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(n))).toHaveLength(0);
 await run('profile.update',profile(n));
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(n))).toHaveLength(0);
 await run('profile.avatar.builtin',{...owner(n),expectedRevision:2,avatarId:'male-01'});
}
const invite=(a:number,b:number,request=a*10+b)=>run('match.invite.create',{...owner(a),candidateId:id(b+200),clientRequestId:id(request+1000),invitationId:id(request+2000)});
const resolve=(who:number,invitationId:string,action='accept',seed=5000)=>run('match.invite.resolve',{
 ...owner(who),invitationId,action,roundId:id(seed),participantLowId:id(seed+1),participantHighId:id(seed+2)});

beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'matching-test'},r2Buckets:{FILES:'matching-test-files'}}));
 db=await mf.getD1Database('DB') as unknown as D1Database;
 files=await mf.getR2Bucket('FILES') as unknown as R2Bucket;
 for(const name of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql'])
  await db.batch(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
});
beforeEach(async()=>{
 const objects=await files.list();if(objects.objects.length)await files.delete(objects.objects.map(o=>o.key));
 await db.batch(['game_round_participants','game_rounds','match_invitations','match_conditions','user_media_assets','user_profiles','auth_sessions','auth_accounts'].map(t=>db.prepare(`DELETE FROM ${t}`)));
 for(const n of [1,2,3])await person(n);
});

it('MS-IT-046: generated avatar reads only the authorized formal asset and rechecks session after R2',async()=>{
 const asset=id(9000),key=`private/${id(2)}/avatar/${asset}`;
 await db.prepare("INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,status,created_at) VALUES(?,?,'generated_avatar',?,'image/jpeg','ready',?)").bind(asset,id(2),key,now).run();
 await files.put(key,new Uint8Array([1,2,3]));
 await run('profile.avatar.generated',{...owner(2),expectedRevision:3,assetId:asset});
 const env={DB:db,FILES:files,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0004_matching_sessions.sql'};
 const request=()=>new Request('http://platform.internal/v1/commands/match.candidate.persona.read',{method:'POST',body:JSON.stringify({...owner(1),candidateId:id(202)})});
 const first=await dispatch(request(),env,now);expect(first.status).toBe(200);
 const body=await first.json() as any;expect(body.rows[0].avatar_data_url).toBe('data:image/jpeg;base64,AQID');expect(JSON.stringify(body)).not.toContain(key);
 const changedFiles=new Proxy(files,{get(target,property){if(property==='get')return async(objectKey:string)=>{const object=await target.get(objectKey);await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(1)).run();return object;};const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;}});
 const revoked=await dispatch(request(),{...env,FILES:changedFiles},now);expect(revoked.status).toBe(409);expect(await revoked.text()).not.toContain('AQID');
});

it('MS-IT-064: actual photo reorder increases Profile revision but leaves every matching condition byte unchanged',async()=>{
 const before=await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1));
 for(const assetId of [id(9100),id(9101)]){
  await run('profile.photo.reserve',{...owner(1),assetId,objectKey:`private/${id(1)}/photos/${assetId}`,mimeType:'image/jpeg'});await run('profile.photo.ready',{...owner(1),assetId});
 }
 expect((await run('profile.photo.reorder',{...owner(1),expectedRevision:3,assetIds:[id(9101),id(9100)]},now+1)).changes[0]).toBe(1);
 expect((await rows('SELECT revision FROM user_profiles WHERE account_id=?',id(1)))[0].revision).toBe(4);
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1))).toEqual(before);
 expect((await run('match.candidate.search',owner(2))).rows.some((r:any)=>r.profile_id===id(201))).toBe(true);
});
afterAll(async()=>{await mf?.dispose();});

it.each(['success','zero-update','zero-release','one-participant'])('local wrapper game end: %s preserves history and atomically releases exactly the selected pair',async(mode)=>{
 const ab=(await invite(1,2)).rows[0] as any;await resolve(2,ab.invitation_id);
 if(mode==='one-participant')await db.prepare('DELETE FROM game_round_participants WHERE account_id=?').bind(id(1)).run();
 const before=await rows('SELECT * FROM game_round_participants ORDER BY participant_id');
 const plan=localGameEndStatements(id(5000),now+1) as string[];
 if(mode==='zero-update'||mode==='zero-release'){
  const index=plan.findIndex(s=>s.startsWith(mode==='zero-update'?'UPDATE game_rounds':'DELETE FROM game_round_participants'));
  expect(index).toBeGreaterThanOrEqual(0);plan[index]=plan[index].replace('WHERE ','WHERE 0 AND ');
 }
 if(mode!=='success'){
  await expect(db.batch(plan.map(s=>db.prepare(s)))).rejects.toThrow();
  expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('active');expect(await rows('SELECT * FROM game_round_participants ORDER BY participant_id')).toEqual(before);return;
 }
 await db.batch(plan.map(s=>db.prepare(s)));
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(0);expect(await rows('SELECT status,ended_at FROM game_rounds')).toEqual([{status:'ended',ended_at:now+1}]);
 expect((await invite(2,1,90)).rows).toHaveLength(0);expect((await invite(3,1,91)).rows.at(-1)).toMatchObject({status:'pending'});
 await db.batch(localGameEndStatements(id(5000),now+2).map((s:string)=>db.prepare(s)));expect((await rows('SELECT ended_at FROM game_rounds'))[0].ended_at).toBe(now+1);
});

it('MS-IT-001/057: only ready profiles have unique conditions; no source revision or trigger',async()=>{
 expect(await rows('SELECT account_id FROM match_conditions ORDER BY account_id')).toEqual([1,2,3].map(n=>({account_id:id(n)})));
 expect((await rows('PRAGMA table_info(match_conditions)')).map(r=>r.name)).not.toContain('source_profile_revision');
 expect(await rows("SELECT name FROM sqlite_master WHERE type='trigger'")).toEqual([]);
 await run('profile.update',profile(1,{expectedRevision:3,romanticOrientation:[]}));
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1))).toHaveLength(0);
 expect(await rows('SELECT * FROM user_profiles WHERE account_id=?',id(1))).toHaveLength(1);
});

it('schema rejects a null invalidation reason rather than accepting SQL NULL as a successful CHECK',async()=>{
 await invite(1,2);
 await expect(db.prepare("UPDATE match_invitations SET status='invalidated',invalidated_reason=NULL").run()).rejects.toThrow();
});
it('schema rejects an ended round without ended_at',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;await resolve(2,ab.invitation_id);
 await expect(db.prepare("UPDATE game_rounds SET status='ended',ended_at=NULL").run()).rejects.toThrow();
});
it('schema rejects out-of-range matching orientation values',async()=>{
 await expect(db.prepare("UPDATE match_conditions SET romantic_orientation_json='[\"unknown\"]'").run()).rejects.toThrow();
});

it('MS-IT-005/019/064: search is mutual, keeps pending direction, unrelated edits leave projection unchanged',async()=>{
 const before=await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1));
 await run('profile.update',profile(1,{expectedRevision:3,occupation:'工程師',cardVisibility:{occupation:false}}),now+1);
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1))).toEqual(before);
 expect((await run('match.candidate.search',owner(2))).rows.some((r:any)=>r.profile_id===id(201))).toBe(true);
 await invite(1,2);
 expect((await run('match.candidate.search',owner(1))).rows.find((r:any)=>r.profile_id===id(202))).toMatchObject({invitation_state:'outgoing'});
 expect((await run('match.candidate.search',owner(2))).rows.find((r:any)=>r.profile_id===id(201))).toMatchObject({invitation_state:'incoming'});
});

it('MS-IT-006/007/039/052: explicit accept creates one round, two participants, invalidates all other pending atomically',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;await invite(3,1);await invite(2,3);
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(0);
 const result=await resolve(2,ab.invitation_id);
 expect(result.rows.at(-1)).toMatchObject({status:'accepted',round_id:id(5000)});
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(2);
 expect(await rows("SELECT * FROM match_invitations WHERE status='invalidated' AND invalidated_reason='other_round_started'")).toHaveLength(2);
 expect((await run('match.candidate.search',owner(3))).rows.filter((r:any)=>!r.own_profile_id)).toHaveLength(0);
 expect((await run('game.round.list',owner(1))).rows).toHaveLength(1);
 expect((await run('game.round.get',{...owner(3),roundId:id(5000)})).rows).toHaveLength(0);
});

it('MS-IT-043/059: pending survives empty orientation and absent conditions; new invitations use latest conditions',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;
 await run('profile.update',profile(2,{expectedRevision:3,romanticOrientation:[]}));
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(2))).toHaveLength(0);
 expect((await run('match.invite.list',owner(2))).rows[0]).toMatchObject({status:'pending'});
 expect((await invite(3,2)).rows).toHaveLength(0);
 expect((await resolve(2,ab.invitation_id)).rows.at(-1)).toMatchObject({status:'accepted'});
});

it('MS-IT-049/050/051/060: cross-pair concurrent accept and forced zero-change rollback cannot leave partial rounds',async()=>{
 const ab=(await invite(1,2)).rows[0] as any,ac=(await invite(1,3)).rows[0] as any;
 const attempts=await Promise.allSettled([resolve(2,ab.invitation_id,'accept',5100),resolve(3,ac.invitation_id,'accept',5200)]);
 expect(attempts.filter(r=>r.status==='fulfilled'&&r.value.rows.some((x:any)=>x.status==='accepted'))).toHaveLength(1);
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(1);
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(2);
});

it('MS-IT-051: a zero-row guarded accept fails inside SQL and rolls back the entire batch',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;
 const plan=planCommand('match.invite.resolve',{...owner(2),invitationId:ab.invitation_id,action:'accept',roundId:id(5300),participantLowId:id(5301),participantHighId:id(5302)},now);
 const index=plan.findIndex(p=>p.sql.startsWith('UPDATE match_invitations SET status=\'accepted\''));
 expect(index).toBeGreaterThanOrEqual(0);
 plan[index]={sql:plan[index].sql.replace('WHERE ', 'WHERE 0 AND '),values:plan[index].values};
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(0);
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(0);
 expect((await rows('SELECT status FROM match_invitations'))[0].status).toBe('pending');
});

it('MS-IT-063: failed projection write rolls back profile rather than committing stale matching data',async()=>{
 const before=await rows('SELECT * FROM user_profiles WHERE account_id=?',id(1));
 const plan=planCommand('profile.update',profile(1,{expectedRevision:3,regionCode:'TW-KHH'}),now+1);
 const index=plan.findIndex(p=>p.sql.includes('INSERT INTO match_conditions'));
 expect(index).toBeGreaterThanOrEqual(0);
 plan[index]={sql:plan[index].sql.replace('SELECT ', 'SELECT ').replace('WHERE ', 'WHERE 0 AND '),values:plan[index].values};
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect(await rows('SELECT * FROM user_profiles WHERE account_id=?',id(1))).toEqual(before);
});

it('MS-IT-063: zero-row projection DELETE rolls back readiness loss instead of retaining obsolete conditions',async()=>{
 const before=await rows('SELECT * FROM user_profiles WHERE account_id=?',id(1));
 const plan=planCommand('profile.update',profile(1,{expectedRevision:3,romanticOrientation:[]}),now+1);
 const index=plan.findIndex(p=>p.sql.startsWith('DELETE FROM match_conditions'));
 plan[index]={sql:plan[index].sql.replace('WHERE ', 'WHERE 0 AND '),values:plan[index].values};
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect(await rows('SELECT * FROM user_profiles WHERE account_id=?',id(1))).toEqual(before);
});

it.each(['decline','cancel'])('MS-IT-009/010/037/054: %s has correct directional authority and permanent pair semantics',async(action)=>{
 const ab=(await invite(1,2)).rows[0] as any;
 const who=action==='decline'?2:1;
 expect((await resolve(action==='decline'?1:2,ab.invitation_id,action)).rows).toHaveLength(0);
 await resolve(who,ab.invitation_id,action);
 for(const n of [1,2]){
  const candidates=(await run('match.candidate.search',owner(n))).rows.filter((r:any)=>!r.own_profile_id) as any[];
  expect(candidates.some(r=>r.profile_id===id(n===1?202:201))).toBe(action==='cancel');
 }
 expect((await invite(2,1,99)).rows.length>0).toBe(action==='cancel');
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(0);
});

it('MS-IT-011/033/042/055: exact 72h expiration frees unique pair without accepting expired invitation',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;
 const time=now+259200000;
 const fresh={...owner(2),accessExpiresAt:time+600000};
 const result=await run('match.invite.resolve',{...fresh,invitationId:ab.invitation_id,action:'accept',roundId:id(6000),participantLowId:id(6001),participantHighId:id(6002)},time);
 expect(result.rows.at(-1)).toMatchObject({status:'expired'});
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(0);
 const next=await run('match.invite.create',{...owner(1),accessExpiresAt:time+600000,candidateId:id(202),clientRequestId:id(7000),invitationId:id(7001)},time);
 expect(next.rows.at(-1)).toMatchObject({status:'pending'});
 expect(await rows("SELECT * FROM match_invitations WHERE status='pending'")).toHaveLength(1);
});

it('MS-IT-008/041: reverse explicit intent returns existing pending, receiver accepts; request replay creates no second round',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;
 expect((await invite(2,1)).rows[0]).toMatchObject({invitation_id:ab.invitation_id,initiator_account_id:id(1)});
 await resolve(2,ab.invitation_id);
 expect((await resolve(2,ab.invitation_id,'accept',7100)).rows.at(-1)).toMatchObject({round_id:id(5000)});
 expect((await invite(1,2)).rows[0]).toMatchObject({round_id:id(5000)});
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(1);
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(2);
});

it('MS-IT-012/053/058/061: loss of readiness preserves active game, end atomically frees both and does not recreate conditions',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;await resolve(2,ab.invitation_id);
 await run('profile.update',profile(1,{expectedRevision:3,gender:null,romanticOrientation:[]}));
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1))).toHaveLength(0);
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(2);
 await run('game.round.end',{...owner(2),roundId:id(5000)});
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(0);
 expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('ended');
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(1))).toHaveLength(0);
 expect((await invite(2,1,88)).rows).toHaveLength(0);
 expect((await invite(3,2,89)).rows.at(-1)).toMatchObject({status:'pending'});
});

it.each(['session','account','avatar','birthday'])('MS-IT-043/044/056: %s loss is safe and does not establish a game',async(kind)=>{
 const ab=(await invite(1,2)).rows[0] as any;
 if(kind==='session')await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE account_id=?').bind(now,id(2)).run();
 if(kind==='account')await db.prepare("UPDATE auth_accounts SET status='disabled' WHERE account_id=?").bind(id(1)).run();
 if(kind==='avatar')await db.prepare('UPDATE user_profiles SET selected_avatar_type=NULL,selected_avatar_ref=NULL WHERE account_id=?').bind(id(1)).run();
 if(kind==='birthday')await db.prepare("UPDATE user_profiles SET birth_date='2010-01-01' WHERE account_id=?").bind(id(1)).run();
 const result=await resolve(2,ab.invitation_id);
 if(kind==='session')expect(result.rows).toHaveLength(0);
 else expect(result.rows.at(-1)).toMatchObject({status:'invalidated',invalidated_reason:'eligibility_changed'});
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(0);
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(0);
});

it('MS-IT-050: failure of second participant rolls back accepted invitation, first participant and round',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;
 await invite(3,1);await invite(2,3);const original=await rows('SELECT * FROM match_invitations ORDER BY invitation_id');
 const plan=planCommand('match.invite.resolve',{...owner(2),invitationId:ab.invitation_id,action:'accept',roundId:id(7200),participantLowId:id(7201),participantHighId:id(7201)},now);
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect(await rows('SELECT * FROM game_rounds')).toHaveLength(0);
 expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(0);
 expect(await rows('SELECT * FROM match_invitations ORDER BY invitation_id')).toEqual(original);
});

it.each(['update','release'])('MS-IT-053: zero-row end %s rolls back status and both participant claims',async(stage)=>{
 const ab=(await invite(1,2)).rows[0] as any;await resolve(2,ab.invitation_id);
 const plan=planCommand('game.round.end',{...owner(1),roundId:id(5000)},now+1);
 const index=plan.findIndex(p=>p.sql.startsWith(stage==='update'?'UPDATE game_rounds':'DELETE FROM game_round_participants'));
 plan[index]={sql:plan[index].sql.replace('WHERE ','WHERE 0 AND '),values:plan[index].values};
 await expect(db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)))).rejects.toThrow();
 expect((await rows('SELECT status FROM game_rounds'))[0].status).toBe('active');expect(await rows('SELECT * FROM game_round_participants')).toHaveLength(2);
});

it('MS-IT-034: current nonempty but one-sided orientation filters new candidates while prior pending remains valid',async()=>{
 const ab=(await invite(1,2)).rows[0] as any;
 await run('profile.update',profile(2,{expectedRevision:3,romanticOrientation:['male']}));
 expect(await rows('SELECT * FROM match_conditions WHERE account_id=?',id(2))).toHaveLength(1);
 for(const who of [1,3]){
  expect((await run('match.candidate.search',owner(who))).rows.some((r:any)=>r.profile_id===id(202))).toBe(false);
  if(who===3)expect((await invite(3,2)).rows).toHaveLength(0);
 }
 expect((await resolve(2,ab.invitation_id)).rows.at(-1)).toMatchObject({status:'accepted'});
});

it('MS-IT-022: stale projections still recheck the Taiwan midnight birthday before discovery',async()=>{
 const boundary=Date.UTC(2026,10,6,16);
 for(const [n,birth] of [[2,'2008-11-07'],[3,'2008-11-08']] as const){
  await db.prepare('UPDATE user_profiles SET birth_date=? WHERE account_id=?').bind(birth,id(n)).run();
  await db.prepare('UPDATE match_conditions SET birth_date=? WHERE account_id=?').bind(birth,id(n)).run();
 }
 const user={...owner(1),accessExpiresAt:boundary+600000};
 expect((await run('match.candidate.search',user,boundary-1)).rows.filter((r:any)=>!r.own_profile_id)).toHaveLength(0);
 const after=(await run('match.candidate.search',user,boundary)).rows.filter((r:any)=>!r.own_profile_id) as any[];
 expect(after.map(r=>r.profile_id)).toEqual([id(202)]);
});

it('MS-IT-049/060/062: exact schema preserves Foundation54 + Avatar27 and enforces real FK and UNIQUE',async()=>{
 for(const [table,count] of [['match_conditions',10],['match_invitations',11],['game_rounds',7],['game_round_participants',4]] as const){
  const columns=await rows(`PRAGMA table_info(${table})`);expect(columns).toHaveLength(count);expect(columns[0]).toMatchObject({pk:1,notnull:1,type:'TEXT'});
 }
 let columns=0;for(const table of ['auth_accounts','auth_external_identities','auth_sessions','auth_refresh_tokens','auth_email_challenges','common_rate_limit_buckets'])columns+=(await rows(`PRAGMA table_info(${table})`)).length;expect(columns).toBe(54);
 expect((await rows('PRAGMA table_info(user_profiles)')).length+(await rows('PRAGMA table_info(user_media_assets)')).length).toBe(27);
 await expect(db.prepare('INSERT INTO match_conditions SELECT ?,account_id,gender,romantic_orientation_json,birth_date,region_code,interests_json,preferences_json,created_at,updated_at FROM match_conditions WHERE account_id=?').bind(id(9200),id(1)).run()).rejects.toThrow();
 await expect(db.prepare('INSERT INTO game_round_participants VALUES(?,?,?,?)').bind(id(9201),id(9999),id(9998),now).run()).rejects.toThrow();
 const ab=(await invite(1,2)).rows[0] as any;await resolve(2,ab.invitation_id);
 await expect(db.prepare('INSERT INTO game_round_participants VALUES(?,?,?,?)').bind(id(9202),id(1),id(5000),now).run()).rejects.toThrow();
 expect(await rows('PRAGMA foreign_key_check')).toHaveLength(0);
 expect(await rows("SELECT * FROM sqlite_master WHERE type='trigger'")).toHaveLength(0);
});

it('MS-RA-12: 1000 additional ready candidates use a bounded fixed query plan before Application ranking',async()=>{
 const cte=`WITH RECURSIVE fixture(n) AS (SELECT 10000 UNION ALL SELECT n+1 FROM fixture WHERE n<10999)`;
 await db.prepare(`${cte} INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) SELECT '019a281e-0000-7000-8000-'||printf('%012d',n),'load-'||n||'@example.invalid',?,'active',1,?,? FROM fixture`).bind(now,now,now).run();
 await db.prepare(`${cte} INSERT INTO user_profiles(profile_id,account_id,nickname,birth_date,gender,romantic_orientation_json,selected_avatar_type,selected_avatar_ref,created_at,updated_at) SELECT '019a281e-0000-7000-8000-'||printf('%012d',n+20000),'019a281e-0000-7000-8000-'||printf('%012d',n),'壓力旅人','1990-01-01','diverse','["diverse"]','builtin','male-01',?,? FROM fixture`).bind(now,now).run();
 await db.prepare(`INSERT INTO match_conditions SELECT profile_id,account_id,gender,romantic_orientation_json,birth_date,region_code,interests_json,preferences_json,created_at,updated_at FROM user_profiles WHERE nickname='壓力旅人'`).run();
 const plan=planCommand('match.candidate.search',owner(1),now);
 expect(plan).toHaveLength(4);
 const started=performance.now();const result=await db.batch(plan.map(p=>db.prepare(p.sql).bind(...p.values)));const elapsed=performance.now()-started;
 expect(result[2].results).toHaveLength(1002);expect(result[3].results).toHaveLength(1);
 expect(elapsed).toBeLessThan(10000);
 // 只輸出非秘密成本摘要，不能把本機結果推論成雲端D1帳單或SLA。
 console.info(JSON.stringify({fixtureCandidates:1002,statements:plan.length,elapsedMs:Math.round(elapsed),rowsRead:result.reduce((n,r)=>n+(r.meta.rows_read??0),0)}));
});
