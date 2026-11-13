import {createHash} from 'node:crypto';

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const fail=code=>{throw new Error(code);};
const hash=value=>createHash('sha256').update(typeof value==='string'?value:ArrayBuffer.isView(value)?Buffer.from(value.buffer,value.byteOffset,value.byteLength):JSON.stringify(value)).digest('hex');
export function validateAvatarResetTarget(config){
 if(config?.vars?.APP_ENV!=='local'||!/^datinghigh-local(?:-[a-z0-9-]+)?$/.test(config.name)||config.d1_databases?.length!==1||config.d1_databases[0].binding!=='DB'||config.d1_databases[0].database_name!=='datinghigh-local'||config.d1_databases[0].database_id!=='local-foundation'||config.r2_buckets?.filter(b=>b.binding==='FILES').length!==1||config.r2_buckets.find(b=>b.binding==='FILES').bucket_name!=='datinghigh-local-private'||[...config.d1_databases,...config.r2_buckets].some(b=>b.remote===true))fail('AVATAR_RESET_TARGET_FORBIDDEN');
 return {environment:'local',worker:config.name,databaseId:'local-foundation',bucket:'datinghigh-local-private'};
}
const owners=accounts=>{if(!Array.isArray(accounts)||accounts.length<1||accounts.length>1000||accounts.some(a=>typeof a!=='string'||!uuid.test(a))||new Set(accounts).size!==accounts.length)fail('AVATAR_RESET_ACCOUNTS_INVALID');return [...accounts].sort();};
export const validateAvatarResetAccounts=owners;
export function avatarResetDevelopmentReady(catalog,trace){
 const expected=['male','female'].flatMap(g=>Array.from({length:8},(_,n)=>`${g}-0${n+1}`));
 // 061的完整斷言包含reset後結果，不可把該結果作為首次reset的前置條件。
 const beforeReset=Array.from({length:31},(_,n)=>n+51).filter(n=>n!==61).map(n=>`SD-UT-${String(n).padStart(3,'0')}`);
 return catalog?.version===1&&expected.every(id=>catalog.packs?.[id]?.avatarAssetId===id&&Object.keys(catalog.packs[id].expressions??{}).length===5)&&beforeReset.every(id=>trace?.cases?.some(c=>c.id===id&&c.status==='verified'));
}
const avatarPrefix=owner=>`private/${owner}/avatar/`;
function exactAvatarKey(owner,key){
 if(!key.startsWith(avatarPrefix(owner)))return false;const suffix=key.slice(avatarPrefix(owner).length),parts=suffix.split('/');
 if(parts.length===1)return uuid.test(suffix);
 if(parts[0]==='temp')return parts.length===2&&['active','adoption'].includes(parts[1])||parts.length===3&&uuid.test(parts[1])&&['manifest','1','2','3','4'].includes(parts[2]);
 return parts.length===5&&uuid.test(parts[0])&&parts[1]==='expressions'&&/^v[1-9]\d*$/.test(parts[2])&&/^full-body\.v[1-9]\d*$/.test(parts[3])&&/^(?:manifest\.json|(?:neutral|smile|surprised|thoughtful|concerned)\.webp)$/.test(parts[4]);
}
async function list(bucket,prefix){const result=[];let cursor;do{const page=await bucket.list({prefix,cursor,limit:1000});result.push(...page.objects);cursor=page.truncated?page.cursor:undefined;}while(cursor);return result.sort((a,b)=>a.key.localeCompare(b.key));}
async function idle(db,bucket,owner,now){
 const active=await db.prepare("SELECT 1 FROM game_rounds WHERE status='active' AND (account_low_id=? OR account_high_id=?) UNION ALL SELECT 1 FROM game_active_round_claims WHERE account_id=? LIMIT 1").bind(owner,owner,owner).first();if(active)fail('AVATAR_RESET_BUSY');
 for(const o of await list(bucket,avatarPrefix(owner)+'temp/'))if(o.key.endsWith('/adoption')||o.key.endsWith('/manifest')){
  const object=await bucket.get(o.key);if(!object)continue;let state;try{state=await object.json();}catch{fail('AVATAR_RESET_STATE_INVALID');}
  if(!Number.isFinite(state.expiresAt)||typeof state.status!=='string')fail('AVATAR_RESET_STATE_INVALID');
  if(state.expiresAt>now&&['building','ready','generating','adopting'].includes(state.status))fail('AVATAR_RESET_BUSY');
 }
}
async function protectedState(db,bucket,owner){
 const profile=await db.prepare('SELECT * FROM user_profiles WHERE account_id=?').bind(owner).first();if(!profile)fail('AVATAR_RESET_ACCOUNT_NOT_FOUND');
 const {selected_avatar_type,selected_avatar_ref,revision,updated_at,...kept}=profile;
 const account=await db.prepare('SELECT * FROM auth_accounts WHERE account_id=?').bind(owner).first();if(!account)fail('AVATAR_RESET_ACCOUNT_NOT_FOUND');
 const photos=(await db.prepare("SELECT * FROM user_media_assets WHERE account_id=? AND kind='personal_photo' ORDER BY asset_id").bind(owner).all()).results;
 const objects=[];for(const photo of photos){if(photo.object_key!==`private/${owner}/photos/${photo.asset_id}`)fail('AVATAR_RESET_PHOTO_INVALID');const object=await bucket.get(photo.object_key);objects.push([photo.object_key,object?hash(new Uint8Array(await object.arrayBuffer())):null]);}
 return hash({profile:kept,account,photos,objects});
}
/** 只列舉精確 owner／key 與 checksum；不記錄照片、密碼、token、Cookie 或 auth row。 */
export async function createAvatarResetPlan(db,bucket,config,accounts,now=Date.now()){
 const target=validateAvatarResetTarget(config),profiles=[],objects=[];
 for(const owner of owners(accounts)){
  await idle(db,bucket,owner,now);const profile=await db.prepare('SELECT profile_id,revision,selected_avatar_type,selected_avatar_ref FROM user_profiles WHERE account_id=?').bind(owner).first();if(!profile)fail('AVATAR_RESET_ACCOUNT_NOT_FOUND');
  const assets=(await db.prepare("SELECT asset_id,object_key FROM user_media_assets WHERE account_id=? AND kind='generated_avatar' ORDER BY asset_id").bind(owner).all()).results;
  if(assets.some(a=>!uuid.test(a.asset_id)||a.object_key!==avatarPrefix(owner)+a.asset_id))fail('AVATAR_RESET_ASSET_INVALID');
  profiles.push({owner,...profile,assets,protectedHash:await protectedState(db,bucket,owner),applied:false});
  for(const object of await list(bucket,avatarPrefix(owner))){if(!exactAvatarKey(owner,object.key))fail('AVATAR_RESET_KEY_INVALID');objects.push({owner,key:object.key,etag:object.etag,size:object.size,deleted:false});}
 }
 const plan={version:1,target,createdAt:now,profiles,objects,status:'preview',errors:[]};plan.fingerprint=hash({target,profiles:profiles.map(({applied,...p})=>p),objects:objects.map(({deleted,...o})=>o)});return plan;
}
function validatePlan(plan){
 if(plan?.version!==1||!Array.isArray(plan.profiles)||!Array.isArray(plan.objects))fail('AVATAR_RESET_PLAN_INVALID');owners(plan.profiles.map(p=>p.owner));
 const expected=hash({target:plan.target,profiles:plan.profiles.map(({applied,...p})=>p),objects:plan.objects.map(({deleted,...o})=>o)});
 if(expected!==plan.fingerprint||plan.objects.some(o=>!plan.profiles.some(p=>p.owner===o.owner)||!exactAvatarKey(o.owner,o.key)))fail('AVATAR_RESET_PLAN_INVALID');
}
/** 呼叫者必須暫停該 local instance 全部 writer，先備份，完成新功能後才可 apply。 */
export async function applyAvatarResetPlan(db,bucket,plan,{newExperienceReady=false,now=Date.now(),save=async()=>{}}={}){
 if(!newExperienceReady)fail('AVATAR_RESET_NOT_READY');validatePlan(plan);plan.errors=[];
 for(const p of plan.profiles){
  await idle(db,bucket,p.owner,now);if(await protectedState(db,bucket,p.owner)!==p.protectedHash)fail('AVATAR_RESET_PROTECTED_CHANGED');
  const current=await db.prepare('SELECT revision,selected_avatar_type,selected_avatar_ref FROM user_profiles WHERE account_id=?').bind(p.owner).first();
  const remaining=(await db.prepare("SELECT asset_id FROM user_media_assets WHERE account_id=? AND kind='generated_avatar'").bind(p.owner).all()).results;
  const already=current?.revision===p.revision+1&&current.selected_avatar_type===null&&current.selected_avatar_ref===null&&remaining.length===0;
  if(p.applied&&!already)fail('AVATAR_RESET_RESUME_CONFLICT');
  if(!already){
   const statements=[db.prepare("UPDATE user_profiles SET selected_avatar_type=NULL,selected_avatar_ref=NULL,revision=revision+1,updated_at=? WHERE account_id=? AND profile_id=? AND revision=? AND selected_avatar_type IS ? AND selected_avatar_ref IS ? AND NOT EXISTS(SELECT 1 FROM game_rounds WHERE status='active' AND (account_low_id=? OR account_high_id=?)) AND NOT EXISTS(SELECT 1 FROM game_active_round_claims WHERE account_id=?)").bind(now,p.owner,p.profile_id,p.revision,p.selected_avatar_type,p.selected_avatar_ref,p.owner,p.owner,p.owner),db.prepare("SELECT CASE WHEN changes()=1 THEN 1 ELSE json('AVATAR_RESET_PROFILE_CONFLICT') END"),db.prepare('DELETE FROM match_conditions WHERE account_id=?').bind(p.owner)];
   for(const asset of p.assets)statements.push(db.prepare("DELETE FROM user_media_assets WHERE account_id=? AND asset_id=? AND kind='generated_avatar' AND object_key=?").bind(p.owner,asset.asset_id,asset.object_key),db.prepare("SELECT CASE WHEN changes()=1 THEN 1 ELSE json('AVATAR_RESET_ASSET_CONFLICT') END"));
   statements.push(db.prepare("SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM user_media_assets WHERE account_id=? AND kind='generated_avatar') THEN 1 ELSE json('AVATAR_RESET_UNPLANNED_ASSET') END").bind(p.owner));
   await db.batch(statements);
  }
  p.applied=true;plan.status='d1-applied';await save(plan);
 }
 for(const item of plan.objects){
  const object=await bucket.head(item.key);
  if(item.deleted){if(object)fail('AVATAR_RESET_OBJECT_RECREATED');continue;}
  if(object&&(object.etag!==item.etag||object.size!==item.size))fail('AVATAR_RESET_OBJECT_CHANGED');
  try{if(object)await bucket.delete(item.key);item.deleted=true;await save(plan);}catch{plan.errors.push({key:item.key,code:'R2_DELETE_FAILED'});await save(plan);}
 }
 if(plan.errors.length){plan.status='r2-pending';await save(plan);fail('AVATAR_RESET_R2_PENDING');}
 for(const p of plan.profiles){await idle(db,bucket,p.owner,now);if((await list(bucket,avatarPrefix(p.owner))).length)fail('AVATAR_RESET_UNPLANNED_OBJECT');if(await protectedState(db,bucket,p.owner)!==p.protectedHash)fail('AVATAR_RESET_PROTECTED_CHANGED');const current=await db.prepare('SELECT revision,selected_avatar_type,selected_avatar_ref FROM user_profiles WHERE account_id=?').bind(p.owner).first();if(current?.revision!==p.revision+1||current.selected_avatar_type!==null||current.selected_avatar_ref!==null||await db.prepare("SELECT 1 FROM user_media_assets WHERE account_id=? AND kind='generated_avatar' LIMIT 1").bind(p.owner).first())fail('AVATAR_RESET_RESUME_CONFLICT');}
 plan.status='complete';await save(plan);return {profiles:plan.profiles.length,generatedAssets:plan.profiles.reduce((n,p)=>n+p.assets.length,0),objects:plan.objects.length,status:plan.status};
}
