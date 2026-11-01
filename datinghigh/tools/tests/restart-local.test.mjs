import{test}from'node:test';import assert from'node:assert/strict';import{restartLocal}from'../restart-local.mjs';
test('PF-UT-068 local restart rejects malformed control before contacting any server',async()=>{
 for(const control of [{port:80,token:'a'.repeat(64)},{port:8787,token:'bad'},{port:99999,token:'a'.repeat(64)}]){let called=false;await assert.rejects(restartLocal(control,{fetcher:async()=>{called=true;}}));assert.equal(called,false);}
});
test('PF-UT-075 local restart resumes the owned service and waits for genuine readiness',async()=>{
 const calls=[];const report=await restartLocal({port:12345,token:'a'.repeat(64)},{fetcher:async(url,options)=>{calls.push(new URL(url).pathname);if(url.endsWith('/health/ready'))return new Response(JSON.stringify({status:'ready'}),{status:200});assert.equal(options.headers.Authorization,'Bearer '+'a'.repeat(64));return new Response(null,{status:200});}});assert.deepEqual(calls,['/pause','/resume','/health/ready']);assert.equal(report.ready,true);
});
test('PF-UT-075 local restart does not report success for a failed resume or fake readiness',async()=>{
 for(const failure of ['resume','health'])await assert.rejects(restartLocal({port:12345,token:'a'.repeat(64)},{timeout:0,fetcher:async url=>url.endsWith('/'+failure)?new Response('{}',{status:503}):url.endsWith('/health/ready')?new Response('{"status":"alive"}',{status:200}):new Response(null,{status:200})}));
});
