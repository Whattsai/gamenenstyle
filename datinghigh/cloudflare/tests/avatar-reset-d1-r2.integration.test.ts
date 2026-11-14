import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import{readFileSync,readdirSync}from'node:fs';
import{createHash}from'node:crypto';
import{beforeAll,beforeEach,afterAll,it,expect}from'vitest';
// @ts-expect-error 本機 wrapper 與隔離真 D1／R2 共用的受控重置規則。
import{createAvatarResetPlan,applyAvatarResetPlan,validateAvatarResetTarget}from'../../tools/avatar-reset-policy.mjs';
let mf:Miniflare,db:D1Database,files:R2Bucket;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,owner=id(1),photo=id(20),avatar=id(21),now=1800000000000;
const config={name:'datinghigh-local-reset-fixture',vars:{APP_ENV:'local'},d1_databases:[{binding:'DB',database_name:'datinghigh-local',database_id:'local-foundation'}],r2_buckets:[{binding:'FILES',bucket_name:'datinghigh-local-private'}]};
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'reset-fixture'},r2Buckets:{FILES:'reset-fixture'}}));db=await mf.getD1Database('DB')as unknown as D1Database;files=await mf.getR2Bucket('FILES')as unknown as R2Bucket;for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0006').sort())await db.batch(readFileSync(new URL(`../migrations/${name}`,import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));});
beforeEach(async()=>{for(const table of ['game_active_round_claims','game_rounds','match_invitations','match_conditions','user_media_assets','user_profiles','auth_accounts'])await db.prepare(`DELETE FROM ${table}`).run();const list=await files.list();if(list.objects.length)await files.delete(list.objects.map(x=>x.key));await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(owner,'reset-fixture@example.test',now,now,now).run();await db.prepare("INSERT INTO user_profiles(profile_id,account_id,nickname,selected_avatar_type,selected_avatar_ref,created_at,updated_at)VALUES(?,?,'必須保留','generated',?,?,?)").bind(id(10),owner,avatar,now,now).run();for(const [asset,kind,order]of [[photo,'personal_photo',0],[avatar,'generated_avatar',null]]as const){const key=`private/${owner}/${kind==='personal_photo'?'photos':'avatar'}/${asset}`;await db.prepare("INSERT INTO user_media_assets VALUES(?,?,?,?, 'image/jpeg',?,'ready',?,NULL)").bind(asset,owner,kind,key,order,now).run();await files.put(key,new Uint8Array([1,2,3]));}await files.put(`private/${owner}/avatar/temp/active`,id(30));await files.put(`private/${owner}/avatar/temp/${id(30)}/manifest`,JSON.stringify({status:'open',expiresAt:now+60000}));});
afterAll(async()=>{await mf?.dispose();});
it('SD-UT-083/IT-094: target validation refuses production, unknown DB/bucket and active B1 before creating a cleanup plan',async()=>{
 for(const c of [{...config,vars:{APP_ENV:'production'}},{...config,d1_databases:[{binding:'DB',database_name:'other',database_id:'other'}]},{...config,r2_buckets:[{binding:'FILES',bucket_name:'other-private'}]}])expect(()=>validateAvatarResetTarget(c)).toThrow();
 await files.put(`private/${owner}/avatar/temp/adoption`,JSON.stringify({status:'building',expiresAt:now+60000}));await expect(createAvatarResetPlan(db,files,config,[owner],now)).rejects.toThrow('AVATAR_RESET_BUSY');
 expect((await db.prepare('SELECT selected_avatar_ref FROM user_profiles').first()as any).selected_avatar_ref).toBe(avatar);
 await files.delete(`private/${owner}/avatar/temp/adoption`);
 await db.prepare("INSERT INTO auth_accounts VALUES(?,?,?,NULL,'active',1,?,?)").bind(id(2),'other-reset@example.test',now,now,now).run();
 await db.prepare("INSERT INTO match_invitations VALUES(?,?,?,?,?,'accepted',NULL,?,?,?,?)").bind(id(40),owner,id(2),owner,id(41),now,now+60000,now,now).run();
 await db.prepare("INSERT INTO game_rounds VALUES(?,?,?,?,'active',?,NULL,0,?)").bind(id(42),id(40),owner,id(2),now,JSON.stringify([id(90)])).run();
 await expect(createAvatarResetPlan(db,files,config,[owner],now)).rejects.toThrow('AVATAR_RESET_BUSY');
});
it('SD-IT-095/096: D1 rollback, cross-service failure and same-plan retry preserve auth, unrelated profile and photos without adding tables',async()=>{
 const plan=await createAvatarResetPlan(db,files,config,[owner],now);expect(plan.objects).toHaveLength(3);expect(plan.objects.some((o:any)=>o.key.includes('/photos/'))).toBe(false);
 const tables=(await db.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all()).results;
 const art=()=>{
  const catalog=JSON.parse(readFileSync(new URL('../../contracts/builtin-avatar-packs.json',import.meta.url),'utf8'));
  return Object.values(catalog.packs).flatMap((pack:any)=>Object.values(pack.expressions).map((expression:any)=>createHash('sha256').update(readFileSync(new URL('../../frontend/client/public'+expression.url,import.meta.url))).digest('hex')));
 };const originalArt=art();
 await expect(applyAvatarResetPlan(db,files,plan,{newExperienceReady:false,now})).rejects.toThrow('AVATAR_RESET_NOT_READY');
 await db.prepare('UPDATE user_profiles SET revision=revision+1 WHERE account_id=?').bind(owner).run();await expect(applyAvatarResetPlan(db,files,plan,{newExperienceReady:true,now})).rejects.toThrow();
 expect((await db.prepare("SELECT count(*)n FROM user_media_assets WHERE kind='generated_avatar'").first()as any).n).toBe(1);
 await db.prepare('UPDATE user_profiles SET revision=revision-1 WHERE account_id=?').bind(owner).run();
 await db.prepare('UPDATE user_media_assets SET object_key=? WHERE asset_id=?').bind(`private/${owner}/avatar/${id(99)}`,avatar).run();
 await expect(applyAvatarResetPlan(db,files,plan,{newExperienceReady:true,now})).rejects.toThrow();expect((await db.prepare('SELECT revision,selected_avatar_ref FROM user_profiles').first()as any)).toEqual({revision:1,selected_avatar_ref:avatar});
 await db.prepare('UPDATE user_media_assets SET object_key=? WHERE asset_id=?').bind(`private/${owner}/avatar/${avatar}`,avatar).run();let fail=true;
 const faulty=new Proxy(files,{get(target,key){if(key==='delete')return async(k:string)=>{if(fail){fail=false;throw Error('controlled R2 fault');}return target.delete(k);};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 await expect(applyAvatarResetPlan(db,faulty,plan,{newExperienceReady:true,now})).rejects.toThrow('AVATAR_RESET_R2_PENDING');
 expect((await db.prepare('SELECT selected_avatar_ref FROM user_profiles').first()as any).selected_avatar_ref).toBeNull();const revision=(await db.prepare('SELECT revision FROM user_profiles').first()as any).revision;
 await applyAvatarResetPlan(db,files,plan,{newExperienceReady:true,now});await applyAvatarResetPlan(db,files,plan,{newExperienceReady:true,now});
 expect((await db.prepare('SELECT revision,nickname FROM user_profiles').first()as any)).toEqual({revision,nickname:'必須保留'});expect((await db.prepare('SELECT count(*)n FROM auth_accounts').first()as any).n).toBe(1);
 expect((await db.prepare('SELECT asset_id FROM user_media_assets').all()).results).toEqual([{asset_id:photo}]);expect(new Uint8Array(await(await files.get(`private/${owner}/photos/${photo}`))!.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));expect((await files.list({prefix:`private/${owner}/avatar/`})).objects).toHaveLength(0);
 expect(art()).toEqual(originalArt);expect((await db.prepare("SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name").all()).results).toEqual(tables);
});
