import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import { executeCommand, parseCommand } from '../src/commands';

let mf: Miniflare;
let db: D1Database;
const now = 1800000000000;
const id = (n: number) => `019a281e-0000-7000-8000-${n.toString().padStart(12, '0')}`;
const accountId = id(1);
const sessionId = id(2);
const owner = { accountId, sessionId, cv: 1, accessExpiresAt: now + 600000 };
const reserve = (n: number, overrides: Record<string, unknown> = {}) =>
  executeCommand(db, 'profile.photo.reserve', {
    ...owner, assetId: id(n), objectKey: `private/${accountId}/photos/${id(n)}`,
    mimeType: 'image/jpeg', ...overrides
  }, now);
const rows = async (sql: string) => (await db.prepare(sql).all()).results as Record<string, unknown>[];

beforeAll(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: '2026-10-24', d1Databases: { DB: 'avatar-preferences-test' }
  }));
  db = await mf.getD1Database('DB') as unknown as D1Database;
  for (const migration of ['0001_foundation.sql', '0002_avatar_preferences.sql']) {
    const sql = readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8');
    await db.batch(sql.split(';').map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
  }
});

beforeEach(async () => {
  await db.batch([
    'DELETE FROM user_media_assets', 'DELETE FROM user_profiles',
    'DELETE FROM auth_sessions', 'DELETE FROM auth_accounts'
  ].map(sql => db.prepare(sql)));
  await db.prepare(`INSERT INTO auth_accounts
    (account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at)
    VALUES (?, 'user@example.com', ?, 'active', 1, ?, ?)`).bind(accountId, now, now, now).run();
  await db.prepare(`INSERT INTO auth_sessions
    (session_id,account_id,client_platform,credential_version,current_generation,created_at,absolute_expires_at,idle_expires_at)
    VALUES (?,?,'web',1,0,?,?,?)`)
    .bind(sessionId, accountId, now, now + 2592000000, now + 604800000).run();
});

afterAll(async () => { await mf?.dispose(); });

it('adoption cancellation fences late reservations, survives an expired family and cannot delete ready media',async()=>{
 await executeCommand(db,'profile.ensure',{...owner,profileId:id(790)},now);
 for(const n of [791,792]){await reserve(n);await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(n)},now);}
 const adoption={...owner,assetId:id(793),expectedRevision:1,sourceAssetIds:[id(791),id(792)]};
 expect((await executeCommand(db,'profile.avatar.reserve',adoption,now)).rows).toHaveLength(1);
 expect((await executeCommand(db,'profile.avatar.list',owner,now)).rows).toHaveLength(0);
 await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,sessionId).run();
 expect((await executeCommand(db,'profile.avatar.cancel-adoption',{...owner,assetId:id(793)},now)).rows).toHaveLength(1);
 const fresh={...owner,sessionId:id(799)};
 await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(fresh.sessionId,accountId,now,now+2592000000,now+604800000).run();
 expect((await executeCommand(db,'profile.avatar.reserve',{...adoption,...fresh},now)).rows).toHaveLength(0);
 expect((await executeCommand(db,'profile.avatar.adopt',{...adoption,...fresh},now)).changes).toEqual([0,0]);
 const valid={...adoption,...fresh,assetId:id(794)};await executeCommand(db,'profile.avatar.reserve',valid,now);
 expect((await executeCommand(db,'profile.avatar.adopt',valid,now)).changes).toEqual([1,1]);
 expect((await executeCommand(db,'profile.avatar.cancel-adoption',{...owner,assetId:id(794)},now)).rows).toHaveLength(0);
 expect((await executeCommand(db,'profile.avatar.cancel-adoption',{...fresh,accountId:id(900),assetId:id(794)},now)).rows).toHaveLength(0);
 expect((await rows(`SELECT status,account_id FROM user_media_assets WHERE asset_id='${id(794)}'`))[0]).toEqual({status:'ready',account_id:accountId});
 // 補償即使先於reserve到達，也先留下不可復活的tombstone，阻止較晚寫入。
 await executeCommand(db,'profile.avatar.cancel-adoption',{...fresh,assetId:id(795)},now);
 expect((await executeCommand(db,'profile.avatar.reserve',{...valid,assetId:id(795),expectedRevision:2},now)).rows).toHaveLength(0);
 expect((await rows('SELECT selected_avatar_ref,revision FROM user_profiles'))[0]).toEqual({selected_avatar_ref:id(794),revision:2});
});

it.each(['cancel-first','commit-first'])('real D1 batch keeps adoption commit and cancellation mutually exclusive: %s',async(order)=>{
 await executeCommand(db,'profile.ensure',{...owner,profileId:id(780)},now);
 for(const n of [781,782]){await reserve(n);await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(n)},now);}
 const adoption={...owner,assetId:id(783),expectedRevision:1,sourceAssetIds:[id(781),id(782)]};
 await executeCommand(db,'profile.avatar.reserve',adoption,now);
 const cancel=()=>executeCommand(db,'profile.avatar.cancel-adoption',{...owner,assetId:id(783)},now);
 const commit=()=>executeCommand(db,'profile.avatar.adopt',adoption,now);
 await Promise.all(order==='cancel-first'?[cancel(),commit()]:[commit(),cancel()]);
 const status=(await rows(`SELECT status FROM user_media_assets WHERE asset_id='${id(783)}'`))[0].status;
 const profile=(await rows('SELECT selected_avatar_ref,revision FROM user_profiles'))[0];
 expect(['ready','deleted']).toContain(status);
 expect(profile).toEqual(status==='ready'?{selected_avatar_ref:id(783),revision:2}:{selected_avatar_ref:null,revision:1});
});

it('upload compensation cannot tombstone a ready image after a lost success response',async()=>{
 await executeCommand(db,'profile.ensure',{...owner,profileId:id(700)},now);await reserve(701);
 await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(701)},now);
 expect((await executeCommand(db,'profile.photo.cancel-upload',{...owner,assetId:id(701)},now)).rows).toHaveLength(0);
 expect((await executeCommand(db,'profile.photo.list',owner,now)).rows).toHaveLength(1);
 await reserve(702);
 expect((await executeCommand(db,'profile.photo.cancel-upload',{...owner,assetId:id(702)},now)).rows).toHaveLength(1);
});

const profileFields = {
  nickname: '星河旅人', bio: '喜歡劇情與手作', occupation: '工程師',
  birthDate: '1995-08-12', regionCode: 'TW-TPE',
  traitTagIds: ['warm'], interestTagIds: ['puzzle'], topicTagIds: [],
  valueTagIds: ['creativity'],
  weekendPreference: 'explore', sleepSchedule: 'night_owl',
  conversationStyle: 'warm', expectedInteractionFrequency: 'weekly',
  relationshipMode: 'friends_first',
  preferredAgeMin: 25, preferredAgeMax: 35,
  preferredRegionCodes: ['TW-TPE'], sharedInterestWeight: 60
};

it('prepared profile commands persist tag sets in canonical ordinal order',async()=>{
 await executeCommand(db,'profile.ensure',{...owner,profileId:id(703)},now);
 await executeCommand(db,'profile.update',{...owner,expectedRevision:1,...profileFields,traitTagIds:['warm','calm'],preferredRegionCodes:['TW-TPE','TW-KHH']},now);
 const row=(await executeCommand(db,'profile.read',owner,now)).rows[0] as any;
 expect(JSON.parse(row.traits_json)).toEqual(['calm','warm']);
 expect(JSON.parse(row.preferences_json).preferredRegionCodes).toEqual(['TW-KHH','TW-TPE']);
});

it('saved avatar list contains only own ready generated assets and no storage keys',async()=>{
 for(const [n,status] of [[710,'ready'],[711,'deleted'],[712,'pending']] as const){
  await db.prepare("INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,status,created_at,deleted_at) VALUES(?,?,'generated_avatar',?,'image/jpeg',?,?,?)").bind(id(n),accountId,`private/${accountId}/avatar/${id(n)}`,status,now,status==='deleted'?now:null).run();
 }
 await reserve(713);await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(713)},now);
 const result=await executeCommand(db,'profile.avatar.list',owner,now);
 expect(result.rows).toEqual([{asset_id:id(710),mime_type:'image/jpeg',created_at:now}]);
 const foreign={...owner,accountId:id(99)};
 expect((await executeCommand(db,'profile.avatar.list',foreign,now)).rows).toHaveLength(0);
});


it('AP-D1-PROFILE-UNICODE-001: scalar limits match .NET for emoji and reject unpaired surrogates', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(501) }, now);
  const emoji = '🌟';
  const updated = await executeCommand(db, 'profile.update', {
    ...owner, expectedRevision: 1, ...profileFields,
    nickname: emoji.repeat(7), bio: emoji.repeat(25), occupation: emoji.repeat(31)
  }, now);
  expect(updated.rows).toHaveLength(1);
  const row = (await executeCommand(db, 'profile.read', owner, now)).rows[0] as any;
  expect(row.nickname).toBe(emoji.repeat(7));
  expect(row.bio).toBe(emoji.repeat(25));
  expect(row.occupation).toBe(emoji.repeat(31));
  for (const invalid of [
    { nickname: emoji.repeat(13) }, { bio: emoji.repeat(41) },
    { occupation: emoji.repeat(61) }, { nickname: 'A\uD800B' },
    { bio: 'ok\u0001' }, { occupation: 'ok\u0001' }
  ]) {
    await expect(executeCommand(db, 'profile.update', {
      ...owner, expectedRevision: 2, ...profileFields, ...invalid
    }, now)).rejects.toThrow();
  }
  expect(((await executeCommand(db, 'profile.read', owner, now)).rows[0] as any).revision).toBe(2);
});

it('AP-D1-PROFILE-001: create default profile once with current valid family', async () => {
  expect((await executeCommand(db, 'profile.read', owner, now)).rows).toHaveLength(0);
  expect((await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(101) }, now)).rows).toHaveLength(1);
  expect((await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(102) }, now)).rows).toHaveLength(0);
  const item = (await executeCommand(db, 'profile.read', owner, now)).rows[0] as any;
  expect(item.profile_id).toBe(id(101));
  expect(item.revision).toBe(1);
  expect(item.interests_json).toBe('{"interestTagIds":[],"topicTagIds":[],"valueTagIds":[]}');
  expect(JSON.parse(item.preferences_json)).toEqual({
    weekendPreference: null, sleepSchedule: null, conversationStyle: null,
    expectedInteractionFrequency: null, relationshipMode: null,
    preferredAgeMin: null, preferredAgeMax: null,
    preferredRegionCodes: [], sharedInterestWeight: 50
  });
  expect(await rows('SELECT profile_id FROM user_profiles')).toHaveLength(1);
});

it('AP-D1-PROFILE-002: full profile fields round-trip exactly with optimistic revision guard', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(102) }, now);
  const update = await executeCommand(db, 'profile.update', { ...owner, expectedRevision: 1, ...profileFields }, now);
  expect(update.rows).toHaveLength(1);
  expect((update.rows[0] as any).revision).toBe(2);
  const item = (await executeCommand(db, 'profile.read', owner, now)).rows[0] as any;
  expect(item.nickname).toBe(profileFields.nickname);
  expect(item.occupation).toBe(profileFields.occupation);
  expect(item.birth_date).toBe(profileFields.birthDate);
  expect(JSON.parse(item.traits_json)).toEqual(profileFields.traitTagIds);
  expect(JSON.parse(item.interests_json)).toEqual({
    interestTagIds: profileFields.interestTagIds,
    topicTagIds: profileFields.topicTagIds,
    valueTagIds: profileFields.valueTagIds
  });
  const prefs = JSON.parse(item.preferences_json);
  expect(Object.keys(prefs)).toHaveLength(9);
  expect(prefs.preferredRegionCodes).toEqual(profileFields.preferredRegionCodes);
  expect(prefs.sharedInterestWeight).toBe(60);
  const committed=await rows('SELECT * FROM user_profiles ORDER BY account_id');
  expect((await executeCommand(db, 'profile.update', { ...owner, expectedRevision: 1, ...profileFields, nickname:'stale tab',occupation:'old job' }, now)).rows).toHaveLength(0);
  expect(await rows('SELECT * FROM user_profiles ORDER BY account_id')).toEqual(committed);
  expect(((await executeCommand(db, 'profile.read', owner, now)).rows[0] as any).revision).toBe(2);
});

it('AP-D1-PROFILE-003: malformed or unrecognized fields and revoked sessions cannot mutate', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(103) }, now);
  await expect(executeCommand(db, 'profile.update', {
    ...owner, expectedRevision: 1, ...profileFields,
    authEmail: 'leak@example.com'
  }, now)).rejects.toThrow();
  await expect(executeCommand(db, 'profile.update', {
    ...owner, expectedRevision: 1, ...profileFields,
    preferredAgeMin: 42, preferredAgeMax: 20
  }, now)).rejects.toThrow();
  await expect(executeCommand(db, 'profile.update', {
    ...owner, expectedRevision: 1, ...profileFields, topicTagIds: ['a','a']
  }, now)).rejects.toThrow();
  await expect(executeCommand(db, 'profile.update', {
    ...owner, expectedRevision: 1, ...profileFields, preferredRegionCodes: ['warm']
  }, now)).rejects.toThrow();
  await expect(executeCommand(db, 'profile.update', {
    ...owner, expectedRevision: 1, ...profileFields, regionCode: 'free-form-location'
  }, now)).rejects.toThrow();
  await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,sessionId).run();
  expect((await executeCommand(db, 'profile.update', { ...owner, expectedRevision: 1, ...profileFields }, now)).rows).toHaveLength(0);
  expect((await executeCommand(db, 'profile.read', owner, now)).rows).toHaveLength(0);
  expect((await rows('SELECT revision FROM user_profiles'))[0].revision).toBe(1);
});

it('AP-D1-AVATAR-001: builtin choice requires stable catalog ID and optimistic revision', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(151) }, now);
  await expect(executeCommand(db, 'profile.avatar.builtin', {
    ...owner, expectedRevision: 1, avatarId: 'male-09'
  }, now)).rejects.toThrow();
  const choices = await Promise.all([
    executeCommand(db, 'profile.avatar.builtin', { ...owner, expectedRevision: 1, avatarId: 'male-01' }, now),
    executeCommand(db, 'profile.avatar.builtin', { ...owner, expectedRevision: 1, avatarId: 'female-08' }, now)
  ]);
  expect(choices.filter(v => v.rows.length === 1)).toHaveLength(1);
  expect(choices.filter(v => v.rows.length === 0)).toHaveLength(1);
  const profile = (await executeCommand(db, 'profile.read', owner, now)).rows[0] as any;
  expect(profile.revision).toBe(2);
  expect(profile.selected_avatar_type).toBe('builtin');
  expect(['male-01','female-08']).toContain(profile.selected_avatar_ref);
});

it('AP-D1-AVATAR-002: generated choice is only own ready undeleted asset at same CAS commit', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(151) }, now);
  await db.prepare('INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)')
    .bind(id(201),'other-avatar@example.com',now,'active',now,now).run();
  for (const [n,account,status,deleted] of [
    [201, id(201), 'ready', null],
    [202, accountId, 'pending', null],
    [203, accountId, 'ready', null],
    [204, accountId, 'deleted', now + 1]
  ] as const) {
    await db.prepare('INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,status,created_at,deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id(n),account,'generated_avatar',`private/${account}/generated/${id(n)}`,'image/png',status,now,deleted).run();
  }
  for (const invalid of [201,202,204]) {
    const rejected = await executeCommand(db, 'profile.avatar.generated', {
      ...owner, expectedRevision: 1, assetId: id(invalid)
    }, now);
    expect(rejected.rows).toHaveLength(0);
  }
  const valid = await executeCommand(db,'profile.avatar.generated',{
    ...owner, expectedRevision:1, assetId:id(203)
  },now);
  expect(valid.rows).toHaveLength(1);
  const result=(await executeCommand(db, 'profile.read', owner, now)).rows[0] as any;
  expect(result.selected_avatar_type).toBe('generated');
  expect(result.selected_avatar_ref).toBe(id(203));
  expect(result.revision).toBe(2);
  expect((await executeCommand(db,'profile.avatar.generated',{
    ...owner,expectedRevision:1,assetId:id(203)
  },now)).rows).toHaveLength(0);
});

it('AP-D1-SCHEMA-001: schema adds exactly two tables, 24 columns, no SQL trigger', async () => {
  const tables = await rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'user_%' ORDER BY name`);
  expect(tables.map(t => t.name)).toEqual(['user_media_assets', 'user_profiles']);
  expect((await rows('PRAGMA table_info(user_profiles)'))).toHaveLength(15);
  expect((await rows('PRAGMA table_info(user_media_assets)'))).toHaveLength(9);
  expect(await rows(`SELECT name FROM sqlite_master WHERE type='trigger'`)).toHaveLength(0);
});

it('AP-IT-057: two concurrent fifth/sixth uploads reserve only one slot', async () => {
  for (let n = 10; n < 14; n++) expect((await reserve(n)).rows).toHaveLength(1);
  const outcomes = await Promise.all([reserve(14), reserve(15)]);
  expect(outcomes.filter(r => r.rows.length === 1)).toHaveLength(1);
  expect(outcomes.filter(r => r.rows.length === 0)).toHaveLength(1);
  expect(await rows(`SELECT asset_id FROM user_media_assets WHERE status IN ('pending','ready')`)).toHaveLength(5);
});

it('AP-IT-058: pending counts and zero RETURNING row must not become success', async () => {
  for (let n = 20; n < 25; n++) expect((await reserve(n)).rows).toHaveLength(1);
  const denied = await reserve(25);
  expect(denied.rows).toHaveLength(0);
  expect(denied.changes.at(-1)).toBe(0);
  const one = await rows('SELECT COUNT(*) AS n FROM user_media_assets WHERE status IN (\'pending\',\'ready\')');
  expect(one[0].n).toBe(5);
});

it('AP-IT-059: fixed commands reject identity mutation, stale owner and deleted revival', async () => {
  await reserve(30);
  await expect(executeCommand(db, 'profile.photo.ready', {
    ...owner, assetId: id(30), ownerId: id(99)
  }, now)).rejects.toThrow();
  expect((await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(30) }, now)).rows).toHaveLength(1);
  expect((await executeCommand(db, 'profile.photo.delete', { ...owner, assetId: id(30) }, now)).rows).toHaveLength(1);
  expect((await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(30) }, now)).rows).toHaveLength(0);
  expect((await rows(`SELECT status,deleted_at,object_key FROM user_media_assets WHERE asset_id='${id(30)}'`))[0].status).toBe('deleted');
  expect(() => parseCommand('profile.photo.reserve', {
    ...owner, assetId: id(40), objectKey: 'public/attack', mimeType: 'image/jpeg', kind: 'generated_avatar'
  })).toThrow();
});

it('AP-IT-059: every media command rejects caller-supplied identity and lifecycle update fields without changing profile or assets',async()=>{
 await executeCommand(db,'profile.ensure',{...owner,profileId:id(810)},now);
 for(const n of [811,812]){await reserve(n);await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(n)},now);}
 const assetId=id(813),sources=[id(811),id(812)];
 await executeCommand(db,'profile.avatar.reserve',{...owner,assetId,expectedRevision:1,sourceAssetIds:sources},now);
 // 每個入口的合法輸入列在這裡；更新欄位限SQL內固定的status/order/deleted_at，身分與路徑由server推導。
 const contracts:Record<string,Record<string,unknown>>={
  'profile.avatar.builtin':{...owner,expectedRevision:1,avatarId:'male-03'},
  'profile.avatar.generated':{...owner,expectedRevision:1,assetId},
  'profile.avatar.list':{...owner},
  'profile.avatar.reserve':{...owner,expectedRevision:1,assetId,sourceAssetIds:sources},
  'profile.avatar.adopt':{...owner,expectedRevision:1,assetId,sourceAssetIds:sources},
  'profile.avatar.cancel-adoption':{...owner,assetId},
  'profile.photo.reserve':{...owner,assetId:id(814),objectKey:`private/${accountId}/photos/${id(814)}`,mimeType:'image/jpeg'},
  'profile.photo.ready':{...owner,assetId:id(811)},
  'profile.photo.delete':{...owner,assetId:id(811)},
  'profile.photo.cancel-upload':{...owner,assetId:id(811)},
  'profile.photo.list':{...owner},
  'profile.photo.reorder':{...owner,expectedRevision:1,assetIds:[id(812),id(811)]},
  'profile.photo.delete-compact':{...owner,expectedRevision:1,assetId:id(811)}
 };
 const snapshot=async()=>({profiles:await rows('SELECT * FROM user_profiles ORDER BY account_id'),assets:await rows('SELECT * FROM user_media_assets ORDER BY asset_id')});
 const before=await snapshot();
 for(const [command,payload] of Object.entries(contracts)){
  expect(()=>parseCommand(command,payload)).not.toThrow();
  for(const [field,value] of Object.entries({ownerId:id(899),account_id:id(899),kind:'generated_avatar',object_key:'public/attack',status:'pending',deleted_at:null,display_order:99})){
   await expect(executeCommand(db,command,{...payload,[field]:value},now),`${command}: ${field}`).rejects.toThrow();
  }
  if(!Object.hasOwn(payload,'objectKey'))await expect(executeCommand(db,command,{...payload,objectKey:'public/attack'},now)).rejects.toThrow();
  expect(await snapshot()).toEqual(before);
 }
 for(const objectKey of ['public/attack',`private/${id(899)}/photos/${id(814)}`,`private/${accountId}/avatar/${id(814)}`]){
  await expect(executeCommand(db,'profile.photo.reserve',{...contracts['profile.photo.reserve'],objectKey},now)).rejects.toThrow('INVALID_OBJECT_KEY');
 }
 expect(await snapshot()).toEqual(before);expect(await rows("SELECT name FROM sqlite_master WHERE type='trigger'")).toHaveLength(0);
});

it('AP-IT-059: ready cannot return to pending, deleted cannot revive, and valid foreign identities cannot change asset ownership or kind',async()=>{
 await executeCommand(db,'profile.ensure',{...owner,profileId:id(820)},now);
 for(const n of [821,822,823]){await reserve(n);await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(n)},now);}
 await executeCommand(db,'profile.photo.delete',{...owner,assetId:id(823)},now);
 for(const n of [824,825])await executeCommand(db,'profile.avatar.reserve',{...owner,assetId:id(n),expectedRevision:1,sourceAssetIds:[id(821),id(822)]},now);
 await executeCommand(db,'profile.avatar.cancel-adoption',{...owner,assetId:id(824)},now);
 await executeCommand(db,'profile.avatar.adopt',{...owner,assetId:id(825),expectedRevision:1,sourceAssetIds:[id(821),id(822)]},now);
 const other={...owner,accountId:id(830),sessionId:id(831)};
 await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(other.accountId,'media-matrix@example.test',now,now,now).run();
 await db.prepare("INSERT INTO auth_sessions VALUES(?,?,'android',1,0,?,?,?,NULL,NULL)").bind(other.sessionId,other.accountId,now,now+2592000000,now+604800000).run();
 await executeCommand(db,'profile.ensure',{...other,profileId:id(832)},now);
 const snapshot=async()=>({profiles:await rows('SELECT * FROM user_profiles ORDER BY account_id'),assets:await rows('SELECT * FROM user_media_assets ORDER BY asset_id')});
 const before=await snapshot();
 for(const caller of [owner,other,{...other,sessionId:owner.sessionId}]){
  for(const n of [823,824,825]){
   const input={...caller,assetId:id(n),expectedRevision:caller===owner?2:1,sourceAssetIds:[id(821),id(822)]};
   for(const command of ['profile.photo.ready','profile.photo.cancel-upload','profile.avatar.cancel-adoption'])
    expect((await executeCommand(db,command,{...caller,assetId:id(n)},now)).rows).toHaveLength(0);
   expect((await executeCommand(db,'profile.avatar.reserve',input,now)).rows).toHaveLength(0);
   expect((await executeCommand(db,'profile.avatar.adopt',input,now)).changes).toEqual([0,0]);
  }
  if(caller!==owner)for(const command of ['profile.photo.ready','profile.photo.delete','profile.photo.cancel-upload'])
   expect((await executeCommand(db,command,{...caller,assetId:id(821)},now)).rows).toHaveLength(0);
  if(caller!==owner){
   expect((await executeCommand(db,'profile.avatar.generated',{...caller,assetId:id(825),expectedRevision:1},now)).rows).toHaveLength(0);
   expect((await executeCommand(db,'profile.photo.delete-compact',{...caller,assetId:id(821),expectedRevision:1},now)).changes).toEqual([0,0,0]);
   expect((await executeCommand(db,'profile.photo.reorder',{...caller,assetIds:[id(822),id(821)],expectedRevision:1},now)).changes).toEqual([0,0]);
   await expect(executeCommand(db,'profile.photo.reserve',{...caller,assetId:id(821),objectKey:`private/${accountId}/photos/${id(821)}`,mimeType:'image/jpeg'},now)).rejects.toThrow('INVALID_OBJECT_KEY');
  }
  expect(await snapshot()).toEqual(before);
 }
 await expect(reserve(821)).rejects.toThrow();await expect(reserve(823)).rejects.toThrow();
 expect(await snapshot()).toEqual(before);expect(await rows("SELECT name FROM sqlite_master WHERE type='trigger'")).toHaveLength(0);
});

it('AP-D1-SECURITY-001: expired or revoked session cannot reserve or read photo metadata', async () => {
  await reserve(50);
  const selected = await executeCommand(db, 'profile.photo.list', owner, now);
  expect(selected.rows).toHaveLength(0); // pending not exposed
  await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(50) }, now);
  expect((await executeCommand(db, 'profile.photo.list', owner, now)).rows).toHaveLength(1);
  await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now, sessionId).run();
  expect((await reserve(51)).rows).toHaveLength(0);
  expect((await executeCommand(db, 'profile.photo.list', owner, now)).rows).toHaveLength(0);
});

it('AP-D1-PHOTO-REORDER-001: exact own ready set receives dense order and profile CAS', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(301) }, now);
  for (const n of [301, 302, 303]) {
    expect((await reserve(n)).rows).toHaveLength(1);
    expect((await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(n) }, now)).rows).toHaveLength(1);
  }
  const foreign=id(998);
  await db.prepare("INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) VALUES (?,?,?,'active',1,?,?)").bind(foreign,'reorder-unrelated@example.test',now,now,now).run();
  await db.prepare("INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,display_order,status,created_at) VALUES (?,?,'personal_photo',?,'image/jpeg',0,'ready',?)").bind(id(999),foreign,`private/${foreign}/photos/${id(999)}`,now).run();
  const allBefore=await rows('SELECT asset_id,account_id,kind,object_key,mime_type,status,created_at FROM user_media_assets ORDER BY asset_id');
  const foreignBefore=(await db.prepare('SELECT * FROM user_media_assets WHERE account_id=?').bind(foreign).all()).results;
  const changed = await executeCommand(db, 'profile.photo.reorder', {
    ...owner, expectedRevision: 1, assetIds: [id(303), id(301), id(302)]
  }, now);
  expect(changed.rows).toHaveLength(4);
  expect(await rows('SELECT asset_id,account_id,kind,object_key,mime_type,status,created_at FROM user_media_assets ORDER BY asset_id')).toEqual(allBefore);
  expect((await db.prepare('SELECT * FROM user_media_assets WHERE account_id=?').bind(foreign).all()).results).toEqual(foreignBefore);
  expect(changed.changes).toEqual([1, 3]);
  const ordered = (await executeCommand(db, 'profile.photo.list', owner, now)).rows as any[];
  expect(ordered.map(r => [r.asset_id, r.display_order])).toEqual([
    [id(303), 0], [id(301), 1], [id(302), 2]
  ]);
  expect(((await executeCommand(db, 'profile.read', owner, now)).rows[0] as any).revision).toBe(2);
  expect((await executeCommand(db, 'profile.photo.reorder', {
    ...owner, expectedRevision: 2, assetIds: [id(303), id(301), id(302)]
  }, now)).rows).toHaveLength(0); // 同順序不可回傳假更新
  expect(((await executeCommand(db, 'profile.read', owner, now)).rows[0] as any).revision).toBe(2);
});

it('AP-D1-PHOTO-REORDER-002: missing, duplicate, pending, foreign and revoked are rejected without partial writes', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(311) }, now);
  for (const n of [311, 312, 313]) await reserve(n);
  for (const n of [311, 312]) await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(n) }, now);
  const otherAccount = id(999);
  await db.prepare(`INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at)
    VALUES (?,'other-owner@example.test',?,'active',1,?,?)`).bind(otherAccount,now,now,now).run();
  await db.prepare(`INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,display_order,status,created_at)
    VALUES (?,?,'personal_photo',?,'image/jpeg',0,'ready',?)`)
    .bind(id(900),otherAccount,`private/${otherAccount}/photos/${id(900)}`,now).run();
  await expect(executeCommand(db, 'profile.photo.reorder', {
    ...owner, expectedRevision: 1, assetIds: [id(311), id(311)]
  }, now)).rejects.toThrow();
  for (const invalid of [[id(311)], [id(312), id(313)], [id(312), id(900)]]) {
    const rejected = await executeCommand(db, 'profile.photo.reorder', {
      ...owner, expectedRevision: 1, assetIds: invalid
    }, now);
    expect(rejected.rows).toHaveLength(0);
    expect(rejected.changes).toEqual([0, 0]);
  }
  expect((await executeCommand(db, 'profile.photo.reorder', {
    ...owner, expectedRevision: 999, assetIds: [id(312), id(311)]
  }, now)).rows).toHaveLength(0);
  await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now, sessionId).run();
  expect((await executeCommand(db, 'profile.photo.reorder', {
    ...owner, expectedRevision: 1, assetIds: [id(312), id(311)]
  }, now)).rows).toHaveLength(0);
  expect(((await rows('SELECT revision FROM user_profiles'))[0] as any).revision).toBe(1);
  expect((await rows(`SELECT asset_id,display_order FROM user_media_assets WHERE account_id='${accountId}' AND status='ready' ORDER BY display_order`))
    .map(r => r.display_order)).toEqual([0, 1]);
});

it('AP-D1-PHOTO-REORDER-003: concurrent reorder with same revision has one winner', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(321) }, now);
  for (const n of [321, 322, 323]) {
    await reserve(n);
    await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(n) }, now);
  }
  const attempts = await Promise.all([
    executeCommand(db, 'profile.photo.reorder', { ...owner, expectedRevision: 1, assetIds: [id(322), id(323), id(321)] }, now),
    executeCommand(db, 'profile.photo.reorder', { ...owner, expectedRevision: 1, assetIds: [id(323), id(321), id(322)] }, now)
  ]);
  expect(attempts.filter(a => a.changes[0] === 1)).toHaveLength(1);
  expect(attempts.filter(a => a.changes[0] === 0)).toHaveLength(1);
  const ordered = (await executeCommand(db, 'profile.photo.list', owner, now)).rows as any[];
  expect(ordered.map(r => r.display_order)).toEqual([0, 1, 2]);
  expect([id(322), id(323)]).toContain(ordered[0].asset_id);
  expect(((await executeCommand(db, 'profile.read', owner, now)).rows[0] as any).revision).toBe(2);
});

it('AP-D1-PHOTO-DELETE-001: owner deletion with revision compacts ready ordering atomically', async () => {
  await executeCommand(db, 'profile.ensure', { ...owner, profileId: id(341) }, now);
  for (const n of [341, 342, 343]) {
    await reserve(n);
    await executeCommand(db, 'profile.photo.ready', { ...owner, assetId: id(n) }, now);
  }
  const reordered=await executeCommand(db, 'profile.photo.reorder', {
    ...owner,expectedRevision:1,assetIds:[id(343),id(341),id(342)]
  },now);
  expect(reordered.changes).toEqual([1,3]);
  const deleted=await executeCommand(db, 'profile.photo.delete-compact', {
    ...owner,expectedRevision:2,assetId:id(341)
  },now);
  expect(deleted.changes[0]).toBe(1);
  expect(deleted.changes[1]).toBe(1);
  const ordered=(await executeCommand(db, 'profile.photo.list',owner,now)).rows as any[];
  expect(ordered.map(r=>[r.asset_id,r.display_order])).toEqual([[id(343),0],[id(342),1]]);
  expect(((await executeCommand(db, 'profile.read',owner,now)).rows[0] as any).revision).toBe(3);
  expect((await rows(`SELECT status,deleted_at FROM user_media_assets WHERE asset_id='${id(341)}'`))[0].status).toBe('deleted');
  expect((await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(341)},now)).rows).toHaveLength(0);
  const noOp=await executeCommand(db,'profile.photo.delete-compact',{...owner,expectedRevision:3,assetId:id(341)},now);
  expect(noOp.changes[0]).toBe(0);
  expect(((await executeCommand(db,'profile.read',owner,now)).rows[0] as any).revision).toBe(3);
});

it('AP-D1-PHOTO-READY-001: pending upload completed after reorder appends at current ready tail without duplicate order', async () => {
  await executeCommand(db,'profile.ensure',{...owner,profileId:id(361)},now);
  for (const n of [361,362,363]) await reserve(n);
  for (const n of [361,363]) await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(n)},now);
  const before = await executeCommand(db,'profile.photo.reorder',{
    ...owner,expectedRevision:1,assetIds:[id(363),id(361)]
  },now);
  expect(before.changes).toEqual([1,2]);
  expect((await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(362)},now)).rows).toHaveLength(1);
  const listed=(await executeCommand(db,'profile.photo.list',owner,now)).rows as any[];
  expect(listed.map(r=>[r.asset_id,r.display_order])).toEqual([
    [id(363),0],[id(361),1],[id(362),2]
  ]);
  expect(new Set(listed.map(r=>r.display_order)).size).toBe(listed.length);
});

it('AP-D1-PHOTO-DELETE-002: revoked session, stale revision and unknown ID do not delete photos', async () => {
  await executeCommand(db,'profile.ensure',{...owner,profileId:id(351)},now);
  await reserve(351);
  await executeCommand(db,'profile.photo.ready',{...owner,assetId:id(351)},now);
  for (const invalid of [{...owner,expectedRevision:3,assetId:id(351)},
                        {...owner,expectedRevision:1,assetId:id(352)}]) {
    const res=await executeCommand(db,'profile.photo.delete-compact',invalid,now);
    expect(res.changes[0]).toBe(0);
  }
  await db.prepare('UPDATE auth_sessions SET revoked_at=? WHERE session_id=?').bind(now,sessionId).run();
  expect((await executeCommand(db,'profile.photo.delete-compact',{
    ...owner,expectedRevision:1,assetId:id(351)
  },now)).changes[0]).toBe(0);
  expect((await rows(`SELECT status FROM user_media_assets WHERE asset_id='${id(351)}'`))[0].status).toBe('ready');
  expect((await rows('SELECT revision FROM user_profiles'))[0].revision).toBe(1);
});
