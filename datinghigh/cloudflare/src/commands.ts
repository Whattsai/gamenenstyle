import { z } from 'zod';

// 僅容器 outbound handler 可達；所有值都由固定 prepared statement 綁定。
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const hash=z.string().regex(/^[0-9a-f]{64}$/);
const text=z.string().min(1).max(1024);
const platform=z.enum(['web','ios','android']);
const integer=z.number().int().nonnegative();
const auth={accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:integer};
const pair={sessionId:id,tokenId:id,tokenHash:hash,clientPlatform:platform,absoluteExpiresAt:integer,idleExpiresAt:integer};
const proof={challengeId:id,generation:integer,codeMac:hash,flowTokenHash:hash};
const schemas={
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

export function planCommand(command:string,payload:unknown,now:number):Statement[]{
 const p=parseCommand(command,payload);
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

export async function executeCommand(db:D1Database,command:string,payload:unknown,now=Date.now()){
 const plans=planCommand(command,payload,now);
 const results=await db.batch(plans.map(p=>db.prepare(p.sql).bind(...p.values)));
 return {rows:results.flatMap(r=>r.results??[]),changes:results.map(r=>r.meta.changes)};
}
