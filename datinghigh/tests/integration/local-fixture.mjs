import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
export const origin='http://localhost:8787',password='Local live verification 42!';
export function container(){return execFileSync('docker',['ps','--filter','name=workerd-datinghigh-local-ApiContainer','--format','{{.ID}} {{.Names}}'],{encoding:'utf8',windowsHide:true}).split('\n').find(l=>l.trim()&&!l.includes('-proxy'))?.split(' ')[0];}
export function code(id){const log=execFileSync('docker',['logs',container()],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});const found=[...log.matchAll(new RegExp(`Challenge=${id} .*?Code=([0-9]{6})`,'g'))];assert.ok(found.length,'Dedicated local verification log exists');return found.at(-1)[1];}
export async function api(path,method='GET',body,access){
 const r=await fetch(`${origin}/api/v1${path}`,{method,headers:{'Content-Type':'application/json','X-DatingHigh-Client':'android',...(access?{Authorization:`Bearer ${access}`}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
 const text=await r.text();return {status:r.status,body:text?JSON.parse(text):undefined,headers:r.headers};
}
export async function register(label){const email=`live-${label}-${Date.now()}@example.com`;const requested=await api('/email-registrations','POST',{email,clientPlatform:'android'});assert.equal(requested.status,202,requested.body?.code);const m=requested.body;
 const result=await api('/accounts','POST',{challengeId:m.challengeId,flowToken:m.flowToken,code:code(m.challengeId),password,clientPlatform:'android'});assert.equal(result.status,201);return {email,...result.body};}
export async function waitReady(){const deadline=Date.now()+120000;while(Date.now()<deadline){try{if((await fetch(`${origin}/health/ready`,{signal:AbortSignal.timeout(45000)})).status===200)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw new Error('Local platform did not become ready');}
