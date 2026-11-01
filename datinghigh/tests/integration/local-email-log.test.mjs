import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {api,container,password,register,waitReady} from './local-fixture.mjs';

// Read only the known local container. Raw codes stay in memory; reports contain no log lines or credentials.
function loggedCode(challengeId,purpose,generation){
 const target=container();assert.ok(target,'Known local container must be running');
 const logs=execFileSync('docker',['logs',target],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
 const lines=logs.split('\n');const index=lines.findLastIndex(line=>line.includes(`Challenge=${challengeId} `)&&line.includes(`Purpose=${purpose} `)&&line.includes(`Generation=${generation} `));
 assert.ok(index>0,'Matching local challenge generation must be logged');
 assert.ok(lines.slice(Math.max(0,index-2),index).some(line=>line.includes('LocalEmailVerification')),'Code must use the dedicated local category');
 const match=lines[index].match(/Code=([0-9]{6})(?:\s|$)/);assert.ok(match,'Local log must contain a six-digit code');return match[1];
}
function metadataOnly(body){assert.ok(!['code','password','passwordHash','accessToken','refreshToken'].some(key=>Object.hasOwn(body,key)),'Challenge response must contain metadata without codes or credentials');}

test('PF-IT-032 PF-UT-105 actual local log supports registration, reset and both resend generations',{timeout:180000},async()=>{
 await waitReady();const owner=await register('email-log');
 assert.ok(owner.account.emailVerified,'Initial code read from log creates a verified account');
 const recovery=await api('/password-reset-requests','POST',{email:owner.email,clientPlatform:'android'});assert.equal(recovery.status,202);metadataOnly(recovery.body);loggedCode(recovery.body.challengeId,'reset_password',0);
 const email=`local-log-resend-${Date.now()}@example.com`;
 const registration=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(registration.status,202);metadataOnly(registration.body);loggedCode(registration.body.challengeId,'register_email',0);
 for(const flow of [recovery.body,registration.body]){
  const early=await api(`/email-challenges/${flow.challengeId}/resend`,'POST',{flowToken:flow.flowToken});assert.equal(early.status,429);
 }
 await new Promise(resolve=>setTimeout(resolve,61000));
 for(const [flow,purpose] of [[recovery.body,'reset_password'],[registration.body,'register_email']]){
  const resend=await api(`/email-challenges/${flow.challengeId}/resend`,'POST',{flowToken:flow.flowToken});assert.equal(resend.status,202);metadataOnly(resend.body);loggedCode(flow.challengeId,purpose,1);
 }
 const created=await api('/accounts','POST',{challengeId:registration.body.challengeId,flowToken:registration.body.flowToken,code:loggedCode(registration.body.challengeId,'register_email',1),password,clientPlatform:'android'});assert.equal(created.status,201);
 const newPassword='Local email log reset password 43!';
 const reset=await api('/password-resets','POST',{challengeId:recovery.body.challengeId,flowToken:recovery.body.flowToken,code:loggedCode(recovery.body.challengeId,'reset_password',1),newPassword});assert.equal(reset.status,204);
 assert.equal((await api('/me','GET',undefined,owner.tokens.accessToken)).status,401);
 assert.equal((await api('/sessions','POST',{email:owner.email,password,clientPlatform:'android'})).status,401);
 const login=await api('/sessions','POST',{email:owner.email,password:newPassword,clientPlatform:'android'});assert.equal(login.status,201);assert.ok(login.body.account.accountId===owner.account.accountId,'Reset must preserve owner');
 for(const session of [created.body,login.body])assert.equal((await api('/session','DELETE',{refreshToken:session.tokens.refreshToken},session.tokens.accessToken)).status,204);
});
