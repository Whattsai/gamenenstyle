import { z } from 'zod';
import profileFields from '../../contracts/profile-fields.json';
import { matchingSchemas, planMatchingCommand, projectionPlan, profileAffectsMatching } from './matching-commands';
const gender=z.enum(['male','female','diverse']);
const shareable=new Set(profileFields.filter(f=>f.shareable).map(f=>f.cardKey));
const visibility=z.record(z.string(),z.boolean()).refine(v=>Object.keys(v).every(k=>shareable.has(k)));

// 僅容器 outbound handler 可達；所有值都由固定 prepared statement 綁定。
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const hash=z.string().regex(/^[0-9a-f]{64}$/);
const text=z.string().min(1).max(1024);
const platform=z.enum(['web','ios','android']);
const integer=z.number().int().nonnegative();
const auth={accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:integer};
const pair={sessionId:id,tokenId:id,tokenHash:hash,clientPlatform:platform,absoluteExpiresAt:integer,idleExpiresAt:integer};
const proof={challengeId:id,generation:integer,codeMac:hash,flowTokenHash:hash};
// 個人資料的內部命令只接受明確的固定欄位；對外 JSON/目錄語意仍須在 .NET 驗證。
const tag=z.string().regex(/^[a-z][a-z0-9_]{0,31}$/);
const uniqueTags=(limit:number)=>z.array(tag).max(limit).refine(items=>new Set(items).size===items.length);
const age=z.number().int().min(18).max(120).nullable();
const choice=tag.nullable();
// .NET Domain 按 Unicode scalar 計數；JS .length 會把 Emoji 算兩個 UTF-16 code units。
const scalarText=(min:number,max:number)=>z.string().refine(s=>{
 const count=[...s].length;
 return count>=min && count<=max && !/[\p{Cc}\p{Cs}]/u.test(s);
});
const profileUpdate=z.strictObject({
 ...auth,expectedRevision:z.number().int().positive(),
 gender:gender.nullable(),romanticOrientation:z.array(gender).max(3).refine(v=>new Set(v).size===v.length),cardVisibility:visibility,
 nickname:scalarText(2,12).transform(s=>s.trim()).pipe(scalarText(2,12)),
 bio:scalarText(0,40),
 occupation:scalarText(1,60).transform(s=>s.trim()).pipe(scalarText(1,60)).nullable(),
 birthDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
 regionCode:z.string().regex(/^TW-[A-Z]{2,4}$/).nullable(),
 traitTagIds:uniqueTags(5),
 interestTagIds:uniqueTags(12),
 topicTagIds:uniqueTags(8),
 valueTagIds:uniqueTags(8),
 weekendPreference:choice,sleepSchedule:choice,conversationStyle:choice,
 expectedInteractionFrequency:choice,relationshipMode:choice,
 preferredAgeMin:age,preferredAgeMax:age,
 preferredRegionCodes:z.array(z.string().regex(/^TW-[A-Z]{2,4}$/)).max(10).refine(items=>new Set(items).size===items.length),
 sharedInterestWeight:z.number().int().min(0).max(100)
}).refine(p=>(p.preferredAgeMin===null)===(p.preferredAgeMax===null) &&
 (p.preferredAgeMin===null||(p.preferredAgeMax!==null&&p.preferredAgeMin<=p.preferredAgeMax)));
const defaultPreferences=JSON.stringify({
 weekendPreference:null,sleepSchedule:null,conversationStyle:null,
 expectedInteractionFrequency:null,relationshipMode:null,
 preferredAgeMin:null,preferredAgeMax:null,preferredRegionCodes:[],sharedInterestWeight:50
});
const schemas={
 ...matchingSchemas,
 'account.lookup-credentials':z.strictObject({email:text}),
 'identity.lookup':z.strictObject({provider:z.literal('google'),subject:text}),
 'email.challenge.get':z.strictObject({challengeId:id}),
 'email.challenge.create':z.strictObject({challengeId:id,purpose:z.enum(['register_email','reset_password']),email:text,clientPlatform:platform,flowTokenHash:hash,codeMac:hash.nullable(),accountId:id.nullable(),cv:integer.nullable()}),
 'email.challenge.resend':z.strictObject({...proof,newCodeMac:hash}),
 'email.challenge.fail-attempt':z.strictObject({...proof}),
 'account.register-email':z.strictObject({...proof,...pair,accountId:id,passwordHash:text}),
 'account.register-external':z.strictObject({...pair,accountId:id,identityId:id,provider:z.literal('google'),subject:text,email:text}),
 'session.create':z.strictObject({...pair,accountId:id,cv:integer}),
 'session.validate':z.strictObject({...auth}),
 'session.lookup-refresh':z.strictObject({tokenHash:hash}),
 'session.revoke':z.strictObject({sessionId:id,reason:z.enum(['logout','refresh_reuse'])}),
 'session.refresh':z.strictObject({...auth,expectedGeneration:integer,previousTokenId:id,tokenId:id,tokenHash:hash,idleExpiresAt:integer}),
 'account.change-password':z.strictObject({...auth,passwordHash:text}),
 'account.reset-password':z.strictObject({...proof,passwordHash:text}),
 'account.rehash':z.strictObject({...auth,oldHash:text,passwordHash:text}),
 'identity.external.link':z.strictObject({...auth,identityId:id,provider:z.literal('google'),subject:text,email:text}),
 'identity.external.unlink':z.strictObject({...auth,provider:z.literal('google')}),
 'identity.list':z.strictObject({...auth}),
 'profile.ensure':z.strictObject({...auth,profileId:id}),
 'profile.read':z.strictObject({...auth}),
 'profile.update':profileUpdate,
 'profile.avatar.builtin':z.strictObject({...auth,expectedRevision:z.number().int().positive(),
  avatarId:z.string().regex(/^(male|female)-0[1-8]$/)}),
 'profile.avatar.generated':z.strictObject({...auth,expectedRevision:z.number().int().positive(),
  assetId:id}),
 'profile.avatar.list':z.strictObject({...auth}),
 'profile.avatar.reserve':z.strictObject({...auth,expectedRevision:z.number().int().positive(),assetId:id,
  sourceAssetIds:z.array(id).min(2).max(5).refine(items=>new Set(items).size===items.length)}),
 'profile.avatar.cancel-adoption':z.strictObject({...auth,assetId:id}),
 'profile.avatar.adopt':z.strictObject({...auth,expectedRevision:z.number().int().positive(),assetId:id,
  sourceAssetIds:z.array(id).min(2).max(5).refine(items=>new Set(items).size===items.length)}),
 'profile.photo.reserve':z.strictObject({...auth,assetId:id,objectKey:z.string().min(1).max(160),mimeType:z.enum(['image/jpeg','image/png','image/webp'])}),
 'profile.photo.ready':z.strictObject({...auth,assetId:id}),
 'profile.photo.delete':z.strictObject({...auth,assetId:id}),
 'profile.photo.cancel-upload':z.strictObject({...auth,assetId:id}),
 'profile.photo.list':z.strictObject({...auth}),
 'profile.photo.reorder':z.strictObject({...auth,expectedRevision:z.number().int().positive(),
   assetIds:z.array(id).min(1).max(5).refine(items=>new Set(items).size===items.length)}),
 'profile.photo.delete-compact':z.strictObject({...auth,expectedRevision:z.number().int().positive(),assetId:id}),
 'rate-limit.consume':z.strictObject({entries:z.array(z.strictObject({bucketId:id,policyKey:text,subjectType:z.enum(['email','ip','account','session']),subjectHash:hash})).min(1).max(9)}),
} as const;
export type Command=keyof typeof schemas;
export function parseCommand(command:string,payload:unknown):Record<string,any>{
 if(!Object.hasOwn(schemas,command)) throw new Error('UNKNOWN_COMMAND');
 return schemas[command as Command].parse(payload);
}
export const RateLimitPolicies:Record<string,Record<string,[number,number]>>={
 'email_code_send.v1':{email:[3600000,5],ip:[3600000,30]},
 'email_code_verify.v1':{email:[900000,10]},
 'password_login.v1':{email:[900000,10],ip:[900000,60]},
 'external_credential.v1':{ip:[900000,30]},
 'credential_change.v1':{account:[900000,10]},
 'session_refresh.v1':{session:[60000,10],ip:[60000,120]},
 'avatar_generate.v1':{account:[3600000,8]},
 'matching_search.v1':{account:[60000,30]},
 'matching_invite.v1':{account:[3600000,10]},
};
export type Statement={sql:string,values:unknown[]};
const stmt=(sql:string,...values:unknown[]):Statement=>({sql,values});
const activeAccount=`SELECT 1 FROM auth_accounts a WHERE a.account_id=? AND a.status='active' AND a.credential_version=?`;
const activeSession=`SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.session_id=? AND s.account_id=? AND s.credential_version=? AND a.credential_version=s.credential_version AND a.status='active' AND s.revoked_at IS NULL AND s.absolute_expires_at>? AND s.idle_expires_at>? AND ?>?`;
function authorized(p:any,now:number){return [p.sessionId,p.accountId,p.cv,now,now,p.accessExpiresAt,now];}
const challenge=`SELECT 1 FROM auth_email_challenges c WHERE c.challenge_id=? AND c.purpose=? AND c.state='active' AND c.failed_attempts<5 AND c.generation=? AND c.code_mac=? AND c.flow_token_hash=? AND c.expires_at>? AND c.absolute_expires_at>?`;
function validChallenge(p:any,purpose:string,now:number){return [p.challengeId,purpose,p.generation,p.codeMac,p.flowTokenHash,now,now];}
function sessionInsert(p:any,now:number,cv:number,guard:string,guardValues:unknown[]){return stmt(`INSERT INTO auth_sessions(session_id,account_id,client_platform,credential_version,current_generation,created_at,absolute_expires_at,idle_expires_at) SELECT ?,?,?,?,0,?,?,? WHERE EXISTS(${guard})`,p.sessionId,p.accountId,p.clientPlatform,cv,now,p.absoluteExpiresAt,p.idleExpiresAt,...guardValues);}
function refreshInsert(p:any,now:number){return stmt(`INSERT INTO auth_refresh_tokens(token_id,session_id,token_hash,generation,created_at,expires_at) SELECT ?,?,?,0,?,? WHERE changes()=1 AND EXISTS(SELECT 1 FROM auth_sessions WHERE session_id=?)`,p.tokenId,p.sessionId,p.tokenHash,now,p.idleExpiresAt,p.sessionId);}

function planCoreCommand(command:string,payload:unknown,now:number):Statement[]{
 const p=parseCommand(command,payload);
 if(Object.hasOwn(matchingSchemas,command))return planMatchingCommand(command,p,now);
 switch(command){
 case 'account.lookup-credentials':return [stmt(`SELECT * FROM auth_accounts WHERE email_normalized=?`,p.email)];
 case 'identity.lookup':return [stmt(`SELECT a.* FROM auth_accounts a JOIN auth_external_identities i ON i.account_id=a.account_id WHERE i.provider=? AND i.subject=?`,p.provider,p.subject)];
 case 'email.challenge.get':return [stmt(`SELECT * FROM auth_email_challenges WHERE challenge_id=?`,p.challengeId)];
 case 'email.challenge.create':return [stmt(`INSERT INTO auth_email_challenges(challenge_id,purpose,email_normalized,client_platform,flow_token_hash,code_mac,generation,failed_attempts,account_id,bound_credential_version,state,created_at,expires_at,absolute_expires_at,resend_after) VALUES(?,?,?,?,?,?,0,0,?,?,'active',?,?,?,?) RETURNING *`,p.challengeId,p.purpose,p.email,p.clientPlatform,p.flowTokenHash,p.codeMac,p.accountId,p.cv,now,now+600000,now+1800000,now+60000)];
 case 'email.challenge.resend':return [stmt(`UPDATE auth_email_challenges SET generation=generation+1,code_mac=?,expires_at=MIN(?,absolute_expires_at),resend_after=? WHERE challenge_id=? AND generation=? AND flow_token_hash=? AND state='active' AND failed_attempts<5 AND absolute_expires_at>? AND resend_after<=? RETURNING *`,p.newCodeMac,now+600000,now+60000,p.challengeId,p.generation,p.flowTokenHash,now,now)];
 case 'email.challenge.fail-attempt':return [stmt(`UPDATE auth_email_challenges SET failed_attempts=MIN(failed_attempts+1,5),state=CASE WHEN failed_attempts>=4 THEN 'locked' ELSE state END WHERE challenge_id=? AND generation=? AND flow_token_hash=? AND state='active' AND expires_at>? AND absolute_expires_at>? RETURNING failed_attempts`,p.challengeId,p.generation,p.flowTokenHash,now,now)];
 case 'account.register-email':{
  const guard=challenge, args=validChallenge(p,'register_email',now);
  return [stmt(`INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,password_hash,status,credential_version,created_at,updated_at) SELECT ?,c.email_normalized,?,?,'active',1,?,? FROM auth_email_challenges c WHERE c.challenge_id=? AND EXISTS(${guard})`,p.accountId,now,p.passwordHash,now,now,p.challengeId,...args),
   sessionInsert(p,now,1,`${activeAccount} AND EXISTS(${guard})`,[p.accountId,1,...args]),refreshInsert(p,now),
   stmt(`UPDATE auth_email_challenges SET state='consumed',consumed_at=? WHERE challenge_id=? AND EXISTS(${guard}) AND EXISTS(SELECT 1 FROM auth_refresh_tokens WHERE token_id=?)`,now,p.challengeId,...args,p.tokenId)];
 }
 case 'account.register-external':return [stmt(`INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) VALUES(?,?,?,'active',1,?,?)`,p.accountId,p.email,now,now,now),stmt(`INSERT INTO auth_external_identities VALUES(?,?,?,?,?)`,p.identityId,p.accountId,p.provider,p.subject,now),sessionInsert(p,now,1,activeAccount,[p.accountId,1]),refreshInsert(p,now)];
 case 'session.create':return [stmt(`UPDATE auth_sessions SET revoked_at=?,revocation_reason='replaced_by_login' WHERE account_id=? AND revoked_at IS NULL AND EXISTS(${activeAccount})`,now,p.accountId,p.accountId,p.cv),sessionInsert(p,now,p.cv,activeAccount,[p.accountId,p.cv]),refreshInsert(p,now)];
 case 'session.validate':return [stmt(`SELECT a.*,s.session_id,s.client_platform,s.current_generation,s.absolute_expires_at,s.idle_expires_at FROM auth_sessions s JOIN auth_accounts a ON a.account_id=s.account_id WHERE s.session_id=? AND EXISTS(${activeSession})`,p.sessionId,...authorized(p,now))];
 case 'session.lookup-refresh':return [stmt(`SELECT t.*,s.account_id,s.client_platform,s.credential_version,s.current_generation,s.absolute_expires_at,s.idle_expires_at,s.revoked_at,a.status,a.credential_version AS account_cv FROM auth_refresh_tokens t JOIN auth_sessions s ON s.session_id=t.session_id JOIN auth_accounts a ON a.account_id=s.account_id WHERE t.token_hash=?`,p.tokenHash)];
 case 'session.revoke':return [stmt(`UPDATE auth_sessions SET revoked_at=?,revocation_reason=? WHERE session_id=? AND revoked_at IS NULL`,now,p.reason,p.sessionId)];
 case 'session.refresh':{
  const g=p.expectedGeneration;
  return [stmt(`UPDATE auth_sessions SET current_generation=current_generation+1,idle_expires_at=MIN(?,absolute_expires_at) WHERE session_id=? AND current_generation=? AND EXISTS(${activeSession}) AND EXISTS(SELECT 1 FROM auth_refresh_tokens WHERE token_id=? AND session_id=? AND generation=? AND consumed_at IS NULL AND expires_at>?)`,p.idleExpiresAt,p.sessionId,g,...authorized(p,now),p.previousTokenId,p.sessionId,g,now),
   stmt(`INSERT INTO auth_refresh_tokens(token_id,session_id,token_hash,generation,created_at,expires_at) SELECT ?,?,?,?, ?,MIN(?,s.absolute_expires_at) FROM auth_sessions s WHERE changes()=1 AND s.session_id=? AND s.current_generation=? AND EXISTS(${activeSession}) AND EXISTS(SELECT 1 FROM auth_refresh_tokens WHERE token_id=? AND session_id=s.session_id AND generation=? AND consumed_at IS NULL)`,p.tokenId,p.sessionId,p.tokenHash,g+1,now,p.idleExpiresAt,p.sessionId,g+1,...authorized(p,now),p.previousTokenId,g),
   stmt(`UPDATE auth_refresh_tokens SET consumed_at=?,replaced_by_token_id=? WHERE changes()=1 AND token_id=? AND consumed_at IS NULL AND EXISTS(SELECT 1 FROM auth_refresh_tokens WHERE token_id=?)`,now,p.tokenId,p.previousTokenId,p.tokenId)];
 }
 case 'account.change-password':return [stmt(`UPDATE auth_accounts SET password_hash=?,credential_version=credential_version+1,updated_at=? WHERE account_id=? AND credential_version=? AND EXISTS(${activeSession}) RETURNING account_id`,p.passwordHash,now,p.accountId,p.cv,...authorized(p,now))];
 case 'account.rehash':return [stmt(`UPDATE auth_accounts SET password_hash=? WHERE account_id=? AND credential_version=? AND password_hash=? AND EXISTS(${activeSession}) RETURNING account_id`,p.passwordHash,p.accountId,p.cv,p.oldHash,...authorized(p,now))];
 case 'account.reset-password':{
  const args=validChallenge(p,'reset_password',now);
  return [stmt(`UPDATE auth_accounts SET password_hash=?,credential_version=credential_version+1,updated_at=? WHERE status='active' AND EXISTS(SELECT 1 FROM auth_email_challenges c WHERE c.challenge_id=? AND c.account_id=auth_accounts.account_id AND c.bound_credential_version=auth_accounts.credential_version AND EXISTS(${challenge})) RETURNING account_id`,p.passwordHash,now,p.challengeId,...args),
   stmt(`UPDATE auth_email_challenges SET state='consumed',consumed_at=? WHERE challenge_id=? AND changes()=1 AND EXISTS(${challenge}) AND EXISTS(SELECT 1 FROM auth_accounts a WHERE a.account_id=auth_email_challenges.account_id AND a.credential_version=auth_email_challenges.bound_credential_version+1 AND a.password_hash=? AND a.updated_at=?)`,now,p.challengeId,...args,p.passwordHash,now)];
 }
 case 'identity.external.link':return [stmt(`INSERT INTO auth_external_identities(identity_id,account_id,provider,subject,created_at) SELECT ?,?,?,?,? WHERE EXISTS(${activeSession}) AND EXISTS(SELECT 1 FROM auth_accounts WHERE account_id=? AND email_normalized=?) ON CONFLICT(account_id,provider) DO UPDATE SET subject=auth_external_identities.subject WHERE auth_external_identities.subject=excluded.subject RETURNING identity_id`,p.identityId,p.accountId,p.provider,p.subject,now,...authorized(p,now),p.accountId,p.email)];
 case 'identity.external.unlink':return [stmt(`UPDATE auth_accounts SET credential_version=credential_version+1,updated_at=? WHERE account_id=? AND credential_version=? AND password_hash IS NOT NULL AND EXISTS(${activeSession}) AND EXISTS(SELECT 1 FROM auth_external_identities WHERE account_id=? AND provider=?) RETURNING account_id`,now,p.accountId,p.cv,...authorized(p,now),p.accountId,p.provider),stmt(`DELETE FROM auth_external_identities WHERE account_id=? AND provider=? AND changes()=1 AND EXISTS(SELECT 1 FROM auth_accounts WHERE account_id=? AND credential_version=? AND updated_at=?)`,p.accountId,p.provider,p.accountId,p.cv+1,now)];
 case 'identity.list':return [stmt(`SELECT i.provider,i.created_at FROM auth_external_identities i WHERE i.account_id=? AND EXISTS(${activeSession})`,p.accountId,...authorized(p,now))];
 case 'profile.ensure':return [stmt(`INSERT INTO user_profiles(profile_id,account_id,preferences_json,created_at,updated_at)
   SELECT ?,?,?,?,? WHERE EXISTS(${activeSession}) AND NOT EXISTS
   (SELECT 1 FROM user_profiles WHERE account_id=?) RETURNING profile_id,revision`,
   p.profileId,p.accountId,defaultPreferences,now,now,...authorized(p,now),p.accountId)];
 case 'profile.read':return [stmt(`SELECT profile_id,nickname,bio,occupation,birth_date,region_code,gender,romantic_orientation_json,card_visibility_json,
   traits_json,interests_json,preferences_json,selected_avatar_type,selected_avatar_ref,
   revision,created_at,updated_at,EXISTS(SELECT 1 FROM user_media_assets m WHERE m.asset_id=user_profiles.selected_avatar_ref
    AND m.account_id=user_profiles.account_id AND m.kind='generated_avatar' AND m.status='ready' AND m.deleted_at IS NULL) AS selected_avatar_ready
   FROM user_profiles WHERE account_id=? AND EXISTS(${activeSession})`,
   p.accountId,...authorized(p,now))];
 case 'profile.update':{
   const canonical=(value:unknown)=>[...(value as string[])].sort();
   const interests=JSON.stringify({interestTagIds:canonical(p.interestTagIds),topicTagIds:canonical(p.topicTagIds),valueTagIds:canonical(p.valueTagIds)});
   const prefs=JSON.stringify({weekendPreference:p.weekendPreference,sleepSchedule:p.sleepSchedule,
     conversationStyle:p.conversationStyle,expectedInteractionFrequency:p.expectedInteractionFrequency,
     relationshipMode:p.relationshipMode,preferredAgeMin:p.preferredAgeMin,preferredAgeMax:p.preferredAgeMax,
     preferredRegionCodes:canonical(p.preferredRegionCodes),sharedInterestWeight:p.sharedInterestWeight});
   return [stmt(`UPDATE user_profiles SET nickname=?,bio=?,occupation=?,birth_date=?,region_code=?,
       traits_json=?,interests_json=?,preferences_json=?,gender=?,romantic_orientation_json=?,card_visibility_json=?,
       selected_avatar_type=CASE WHEN selected_avatar_type='builtin' AND NOT (?='diverse' OR (?='male' AND selected_avatar_ref LIKE 'male-%') OR (?='female' AND selected_avatar_ref LIKE 'female-%')) THEN NULL WHEN selected_avatar_type='builtin' AND ? IS NULL THEN NULL ELSE selected_avatar_type END,
       selected_avatar_ref=CASE WHEN selected_avatar_type='builtin' AND NOT (?='diverse' OR (?='male' AND selected_avatar_ref LIKE 'male-%') OR (?='female' AND selected_avatar_ref LIKE 'female-%')) THEN NULL WHEN selected_avatar_type='builtin' AND ? IS NULL THEN NULL ELSE selected_avatar_ref END,
       revision=revision+1,updated_at=?
       WHERE account_id=? AND revision=? AND EXISTS(${activeSession}) RETURNING profile_id,revision`,
      p.nickname,p.bio,p.occupation,p.birthDate,p.regionCode,JSON.stringify(canonical(p.traitTagIds)),
      interests,prefs,p.gender,JSON.stringify(canonical(p.romanticOrientation)),JSON.stringify(p.cardVisibility),
      p.gender,p.gender,p.gender,p.gender,p.gender,p.gender,p.gender,p.gender,now,p.accountId,p.expectedRevision,...authorized(p,now))];
 }
 case 'profile.avatar.list':return [stmt(`SELECT asset_id,mime_type,created_at FROM user_media_assets
   WHERE account_id=? AND kind='generated_avatar' AND status='ready' AND deleted_at IS NULL
    AND EXISTS(${activeSession}) ORDER BY created_at DESC,asset_id`,p.accountId,...authorized(p,now))];
 case 'profile.avatar.builtin':return [stmt(`UPDATE user_profiles
   SET selected_avatar_type='builtin',selected_avatar_ref=?,revision=revision+1,updated_at=?
   WHERE account_id=? AND revision=? AND EXISTS(${activeSession})
   AND (gender='diverse' OR (gender='male' AND ? LIKE 'male-%') OR (gender='female' AND ? LIKE 'female-%'))
   RETURNING profile_id,revision,selected_avatar_type,selected_avatar_ref`,
   p.avatarId,now,p.accountId,p.expectedRevision,...authorized(p,now),p.avatarId,p.avatarId)];
 case 'profile.avatar.generated':return [stmt(`UPDATE user_profiles
   SET selected_avatar_type='generated',selected_avatar_ref=?,revision=revision+1,updated_at=?
   WHERE account_id=? AND revision=? AND EXISTS(${activeSession})
     AND EXISTS(SELECT 1 FROM user_media_assets WHERE asset_id=? AND account_id=?
       AND kind='generated_avatar' AND status='ready' AND deleted_at IS NULL)
   RETURNING profile_id,revision,selected_avatar_type,selected_avatar_ref`,
   p.assetId,now,p.accountId,p.expectedRevision,...authorized(p,now),p.assetId,p.accountId)];
 case 'profile.avatar.reserve':{
  const sources=JSON.stringify(p.sourceAssetIds);
  return [stmt(`INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,display_order,status,created_at)
    SELECT ?,?,'generated_avatar',?,'image/jpeg',NULL,'pending',?
    WHERE EXISTS(${activeSession})
     AND EXISTS(SELECT 1 FROM user_profiles WHERE account_id=? AND revision=?)
     AND (SELECT COUNT(*) FROM user_media_assets WHERE account_id=? AND kind='personal_photo' AND status='ready' AND deleted_at IS NULL
       AND asset_id IN(SELECT value FROM json_each(?)))=?
    ON CONFLICT(asset_id) DO NOTHING RETURNING asset_id`,p.assetId,p.accountId,`private/${p.accountId}/avatar/${p.assetId}`,now,
    ...authorized(p,now),p.accountId,p.expectedRevision,p.accountId,sources,p.sourceAssetIds.length)];
 }
 case 'profile.avatar.cancel-adoption':
  // 僅Worker已驗證的採用流程補償使用；pending條件讓已提交圖不可被失敗者刪除，亦能在原Session到期後清理。
  return [stmt(`INSERT INTO user_media_assets(asset_id,account_id,kind,object_key,mime_type,display_order,status,created_at,deleted_at)
    VALUES(?,?,'generated_avatar',?,'image/jpeg',NULL,'deleted',?,?)
    ON CONFLICT(asset_id) DO UPDATE SET status='deleted',deleted_at=excluded.deleted_at
     WHERE user_media_assets.account_id=excluded.account_id AND user_media_assets.kind='generated_avatar'
      AND user_media_assets.object_key=excluded.object_key AND user_media_assets.status='pending'
    RETURNING asset_id`,p.assetId,p.accountId,`private/${p.accountId}/avatar/${p.assetId}`,now,now)];
 case 'profile.avatar.adopt':{
  const sources=JSON.stringify(p.sourceAssetIds);
  return [stmt(`UPDATE user_media_assets SET status='ready'
    WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='pending' AND deleted_at IS NULL
     AND object_key=? AND EXISTS(${activeSession})
     AND EXISTS(SELECT 1 FROM user_profiles WHERE account_id=? AND revision=?)
     AND (SELECT COUNT(*) FROM user_media_assets WHERE account_id=? AND kind='personal_photo' AND status='ready' AND deleted_at IS NULL
       AND asset_id IN(SELECT value FROM json_each(?)))=?
    RETURNING asset_id`,p.assetId,p.accountId,`private/${p.accountId}/avatar/${p.assetId}`,
    ...authorized(p,now),p.accountId,p.expectedRevision,p.accountId,sources,p.sourceAssetIds.length),
   stmt(`UPDATE user_profiles SET selected_avatar_type='generated',selected_avatar_ref=?,revision=revision+1,updated_at=?
    WHERE account_id=? AND revision=? AND changes()=1
     AND EXISTS(SELECT 1 FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='ready')
    RETURNING revision`,p.assetId,now,p.accountId,p.expectedRevision,p.assetId,p.accountId)];
 }
 case 'profile.photo.reserve':{
  // R2 名稱只能由 server 依登入者、照片 ID 推導，不能接受任意路徑。
  if(p.objectKey!==`private/${p.accountId}/photos/${p.assetId}`)throw new Error('INVALID_OBJECT_KEY');
  return [stmt(`INSERT INTO user_media_assets
    (asset_id,account_id,kind,object_key,mime_type,display_order,status,created_at)
    SELECT ?,?,'personal_photo',?,?,COALESCE((
      SELECT MAX(display_order)+1 FROM user_media_assets
      WHERE account_id=? AND kind='personal_photo' AND status IN ('pending','ready') AND deleted_at IS NULL
    ),0),'pending',?
    WHERE EXISTS(${activeSession})
      AND (SELECT COUNT(*) FROM user_media_assets WHERE account_id=? AND kind='personal_photo'
           AND status IN ('pending','ready') AND deleted_at IS NULL)<5
    RETURNING asset_id`,
    p.assetId,p.accountId,p.objectKey,p.mimeType,p.accountId,now,...authorized(p,now),p.accountId)];
 }
 case 'profile.photo.ready':return [stmt(`UPDATE user_media_assets SET status='ready',
   display_order=COALESCE((SELECT MAX(display_order)+1 FROM user_media_assets m
     WHERE m.account_id=? AND m.kind='personal_photo' AND m.status='ready' AND m.deleted_at IS NULL),0)
   WHERE asset_id=? AND account_id=? AND kind='personal_photo' AND status='pending'
    AND deleted_at IS NULL AND EXISTS(${activeSession}) RETURNING asset_id`,
   p.accountId,p.assetId,p.accountId,...authorized(p,now))];
 case 'profile.photo.cancel-upload':return [stmt(`UPDATE user_media_assets SET status='deleted',deleted_at=?
   WHERE asset_id=? AND account_id=? AND kind='personal_photo' AND status='pending'
    AND deleted_at IS NULL AND EXISTS(${activeSession}) RETURNING asset_id`,
   now,p.assetId,p.accountId,...authorized(p,now))];
 case 'profile.photo.delete':return [stmt(`UPDATE user_media_assets SET status='deleted',deleted_at=?
   WHERE asset_id=? AND account_id=? AND kind='personal_photo' AND status IN ('pending','ready')
    AND deleted_at IS NULL AND EXISTS(${activeSession}) RETURNING asset_id`,
   now,p.assetId,p.accountId,...authorized(p,now))];
 case 'profile.photo.list':return [stmt(`SELECT asset_id,mime_type,display_order,created_at
   FROM user_media_assets WHERE account_id=? AND kind='personal_photo' AND status='ready'
    AND deleted_at IS NULL AND EXISTS(${activeSession}) ORDER BY display_order`,
   p.accountId,...authorized(p,now))];
 case 'profile.photo.reorder':{
   // 一次驗證本人當前全部 ready 照片，CAS revision 後才在同一 D1 batch 正規化序號。
   // 不接受部分清單、pending／他人照片、無變動排序或過期 revision；失敗保持零更新。
   const ids=JSON.stringify(p.assetIds);
   const activePhotos=`account_id=? AND kind='personal_photo' AND status='ready' AND deleted_at IS NULL`;
   return [stmt(`UPDATE user_profiles SET revision=revision+1,updated_at=?
     WHERE account_id=? AND revision=? AND EXISTS(${activeSession})
       AND (SELECT COUNT(*) FROM user_media_assets WHERE ${activePhotos})=json_array_length(?)
       AND (SELECT COUNT(*) FROM user_media_assets WHERE ${activePhotos}
         AND asset_id IN (SELECT value FROM json_each(?)))=json_array_length(?)
       AND EXISTS(SELECT 1 FROM user_media_assets m
         WHERE m.account_id=? AND m.kind='personal_photo' AND m.status='ready' AND m.deleted_at IS NULL
           AND m.display_order!=(SELECT CAST(j.key AS INTEGER) FROM json_each(?) j WHERE j.value=m.asset_id))
     RETURNING profile_id,revision`,
     now,p.accountId,p.expectedRevision,...authorized(p,now),
     p.accountId,ids,p.accountId,ids,ids,p.accountId,ids),
     stmt(`UPDATE user_media_assets
       SET display_order=(SELECT CAST(j.key AS INTEGER) FROM json_each(?) j WHERE j.value=user_media_assets.asset_id)
       WHERE account_id=? AND kind='personal_photo' AND status='ready' AND deleted_at IS NULL
         AND changes()=1 RETURNING asset_id,display_order`,ids,p.accountId)];
 }
 case 'profile.photo.delete-compact':{
  // 正式刪照與目前排序共用同一個 revision CAS；D1 batch 內順序執行並回報逐句變更列數。
  // 保留原 profile.photo.delete 作上傳失敗時 pending 補償，不使其具備不受控重排權限。
  return [stmt(`UPDATE user_profiles SET revision=revision+1,updated_at=?
     WHERE account_id=? AND revision=? AND EXISTS(${activeSession})
       AND EXISTS(SELECT 1 FROM user_media_assets
         WHERE asset_id=? AND account_id=? AND kind='personal_photo'
         AND status IN ('pending','ready') AND deleted_at IS NULL)
     RETURNING profile_id,revision`,
     now,p.accountId,p.expectedRevision,...authorized(p,now),p.assetId,p.accountId),
    stmt(`UPDATE user_media_assets SET status='deleted',deleted_at=?
      WHERE asset_id=? AND account_id=? AND kind='personal_photo'
        AND status IN ('pending','ready') AND deleted_at IS NULL AND changes()=1
      RETURNING asset_id`,now,p.assetId,p.accountId),
    stmt(`WITH numbered AS MATERIALIZED (
      SELECT asset_id,ROW_NUMBER() OVER (ORDER BY display_order,asset_id)-1 AS compact_order
      FROM user_media_assets WHERE account_id=? AND kind='personal_photo'
        AND status='ready' AND deleted_at IS NULL)
      UPDATE user_media_assets SET display_order=(
        SELECT compact_order FROM numbered WHERE numbered.asset_id=user_media_assets.asset_id)
      WHERE account_id=? AND kind='personal_photo' AND status='ready'
        AND deleted_at IS NULL AND changes()=1
      RETURNING asset_id,display_order`,p.accountId,p.accountId)];
 }
 case 'rate-limit.consume':{
  const seen=new Set(); return p.entries.flatMap((e:any)=>{
   const policy=RateLimitPolicies[e.policyKey]?.[e.subjectType];if(!policy) throw new Error('INVALID_POLICY');
   const [window,limit]=policy,start=Math.floor(now/window)*window,key=`${e.policyKey}|${e.subjectType}|${e.subjectHash}|${start}`;
   if(seen.has(key)) return [];seen.add(key);
   return [stmt(`INSERT INTO common_rate_limit_buckets VALUES(?,?,?,?,?,1,?) ON CONFLICT(policy_key,subject_type,subject_hash,window_start) DO UPDATE SET attempt_count=MIN(attempt_count+1,?) RETURNING bucket_id,attempt_count,expires_at`,e.bucketId,e.policyKey,e.subjectType,e.subjectHash,start,start+window,limit+1)];
  });
 }
 default:throw new Error('UNKNOWN_COMMAND');
 }
}

const projectionCommands=new Set(['profile.update','profile.avatar.builtin','profile.avatar.generated','profile.avatar.adopt']);
export function planCommand(command:string,payload:unknown,now:number):Statement[]{
 const core=planCoreCommand(command,payload,now);
 return projectionCommands.has(command)?[...core,...projectionPlan(parseCommand(command,payload),now)]:core;
}
export async function executeCommand(db:D1Database,command:string,payload:unknown,now=Date.now()){
 const p=parseCommand(command,payload);
 const core=planCoreCommand(command,p,now);
 let sync=projectionCommands.has(command);
 if(sync&&command==='profile.update'){
  // 只讀本人來源並以原有 revision CAS 保護差異判斷；不接受外部傳入舊 snapshot。
  const previous=await db.prepare('SELECT * FROM user_profiles WHERE account_id=? AND revision=?').bind(p.accountId,p.expectedRevision).first();
  sync=profileAffectsMatching(command,p,previous);
 }
 const plans=sync?[...core,...projectionPlan(p,now)]:core;
 const results=await db.batch(plans.map(p=>db.prepare(p.sql).bind(...p.values)));
 const visible=sync?results.slice(0,core.length):results;
 return {rows:visible.flatMap(r=>r.results??[]).filter(r=>r!==null&&typeof r==='object'&&!Object.hasOwn(r,'__matching_guard')),changes:visible.map(r=>r.meta.changes)};
}
