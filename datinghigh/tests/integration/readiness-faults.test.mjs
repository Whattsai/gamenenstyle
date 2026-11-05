import{test}from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{spawn,spawnSync}from'node:child_process';
import{root,resolveInstance}from'../../tools/local-policy.mjs';import{validateDeployment}from'../../tools/foundation-policy.mjs';
const origin='http://localhost:8787';
function cli(args){const r=spawnSync(process.execPath,[`${root}/tools/local.mjs`,...args],{cwd:root,encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(r.status,0,`Isolated local ${args[0]} succeeds`);return r.stdout;}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function controlFile(name){return `${root}/.local/control-${name}.json`;}
async function signal(name,action){let failure;for(let attempt=0;attempt<3;attempt++){if(action==='shutdown'&&!fs.existsSync(controlFile(name)))return;try{const c=JSON.parse(fs.readFileSync(controlFile(name),'utf8'));const r=await fetch(`http://127.0.0.1:${c.port}/${action}`,{method:'POST',headers:{Authorization:`Bearer ${c.token}`,Connection:'close'},signal:AbortSignal.timeout(45000)});assert.equal(r.status,200,`Local control ${action}`);return;}catch(error){failure=error;if(error instanceof assert.AssertionError)throw error;await delay(250);}}throw failure;}
async function waitFor(pathname,status,timeout=150000){const end=Date.now()+timeout;while(Date.now()<end){try{const r=await fetch(`${origin}${pathname}`,{signal:AbortSignal.timeout(45000)});if(r.status===status)return r;}catch{}await delay(250);}throw new Error(`Isolated ${pathname} did not return ${status}`);}

test('PF-IT-034 actual isolated Worker and .NET container reject resource, schema, secret, origin and sender faults',{timeout:1500000},async()=>{
 const name=`fault-ready-${Date.now()}`,fixture=resolveInstance(name,true);assert.ok(fixture.cwd.startsWith(path.join(root,'.local','instances')+path.sep));
 const sqlFile=`${root}/.local/${name}.sql`;fs.writeFileSync(sqlFile,['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql'].map(file=>fs.readFileSync(`${root}/cloudflare/migrations/${file}`,'utf8')).join('\n')+"\nCREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT); INSERT INTO d1_migrations(name) VALUES('0001_foundation.sql'),('0002_avatar_preferences.sql'),('0003_profile_gender_card_visibility.sql');\n");
 cli(['restore','--file',sqlFile,'--target',name]);cli(['probe','--instance',name]);const baseline=JSON.parse(fs.readFileSync(fixture.config,'utf8'));
 // This test wrapper accepts only its generated fault-* instance, fixed local binding, and fixed test SQL/probe file.
 function wrangler(args){assert.match(name,/^fault-ready-[0-9]+$/);assert.ok(!args.some(a=>a==='--remote'));const r=spawnSync(process.execPath,[`${root}/cloudflare/node_modules/wrangler/bin/wrangler.js`,...args,'--config',fixture.config,'--local'],{cwd:fixture.cwd,encoding:'utf8',windowsHide:true,timeout:120000});assert.equal(r.status,0,'Isolated local fixture mutation succeeds');}
 function sql(statement){fs.writeFileSync(sqlFile,statement);wrangler(['d1','execute','DB','--file',sqlFile,'--yes']);}
 function probe(value){const file=`${root}/.local/${name}-probe.txt`;fs.writeFileSync(file,value);wrangler(['r2','object','put',`${baseline.r2_buckets[0].bucket_name}/_system/foundation/probe.txt`,'--file',file]);}
 const log=fs.openSync(`${root}/.local/evidence/${name}.log`,'a');let child,originalPaused=false,secrets;const results=[];
 try{
  originalPaused=true;await signal('default','pause');
  child=spawn(process.execPath,[`${root}/tools/local.mjs`,'dev','--instance',name],{cwd:root,windowsHide:true,stdio:['ignore',log,log]});
  const end=Date.now()+30000;while(!fs.existsSync(controlFile(name))&&Date.now()<end)await delay(100);assert.ok(fs.existsSync(controlFile(name)),'Isolated loopback control exists');
  await waitFor('/health/ready',200);secrets=fs.readFileSync(`${fixture.cwd}/.dev.vars`,'utf8');
  const c=JSON.parse(fs.readFileSync(controlFile(name),'utf8'));assert.equal((await fetch(`http://127.0.0.1:${c.port}/pause`,{method:'POST'})).status,403);
  const cases=[
   {name:'missing-d1',edit:c=>{c.d1_databases=[];}},
   {name:'missing-r2',edit:c=>{c.r2_buckets=[];}},
   {name:'different-d1',edit:c=>{c.d1_databases[0].database_id='isolated-empty-database';}},
   {name:'different-r2',edit:c=>{c.r2_buckets[0].bucket_name='isolated-empty-private-bucket';}},
   {name:'missing-migration',edit:c=>{c.vars.EXPECTED_MIGRATION='missing.sql';}},
   {name:'renamed-column',before:()=>sql('ALTER TABLE auth_accounts RENAME COLUMN password_hash TO password_blob;'),after:()=>sql('ALTER TABLE auth_accounts RENAME COLUMN password_blob TO password_hash;')},
   {name:'nonunique-family-index',before:()=>sql('DROP INDEX idx_auth_sessions_active_account; CREATE INDEX idx_auth_sessions_active_account ON auth_sessions(account_id) WHERE revoked_at IS NULL;'),after:()=>sql('DROP INDEX idx_auth_sessions_active_account; CREATE UNIQUE INDEX idx_auth_sessions_active_account ON auth_sessions(account_id) WHERE revoked_at IS NULL;')},
   {name:'wrong-probe-content',before:()=>probe('wrong-probe-content'),after:()=>probe('datinghigh-foundation-v1')},
   ...['ACCESS_TOKEN_SECRET','EMAIL_CODE_HMAC_KEY','RATE_LIMIT_HMAC_KEY'].map(key=>({name:`invalid-${key.toLowerCase()}`,key})),
   {name:'nonloopback-local-origin',edit:c=>{c.vars.WEB_ORIGIN='https://untrusted.example';}},
   {name:'unsupported-environment',edit:c=>{c.vars.APP_ENV='qa';}},
   {name:'cloud-log-mode',edit:c=>{c.vars.APP_ENV='staging';c.vars.WEB_ORIGIN='https://staging.example';c.vars.EmailDeliveryMode='Log';}},
   {name:'cloud-missing-email-sender',edit:c=>{c.vars.APP_ENV='staging';c.vars.WEB_ORIGIN='https://staging.example';c.vars.EmailDeliveryMode='Cloudflare';}},
  ];
  for(const variant of cases){
   await signal(name,'pause');const config=structuredClone(baseline);variant.edit?.(config);variant.before?.();fs.writeFileSync(fixture.config,JSON.stringify(config,null,2));
   fs.writeFileSync(`${fixture.cwd}/.dev.vars`,variant.key?secrets.replace(new RegExp(`^${variant.key}=.+$`,'m'),`${variant.key}=invalid`):secrets);
   await signal(name,'resume');await waitFor('/health/live',200);
   const r=await waitFor('/health/ready',503,30000);const text=await r.text(),body=JSON.parse(text);assert.equal(body.code,'DEPENDENCY_UNAVAILABLE');assert.ok(body.traceId);assert.match(r.headers.get('Content-Type'),/application\/problem\+json/);
   for(const value of ['provider-private','password_hash','.wrangler','sqlite',...secrets.split('\n').map(s=>s.split('=').slice(1).join('=')).filter(Boolean)])assert.equal(text.includes(value),false,'Readiness error is sanitized');
   results.push({fault:variant.name,live:200,ready:503});fs.writeFileSync(`${root}/.local/evidence/readiness-faults-progress.json`,JSON.stringify({status:'partial',instance:name,results},null,2));console.log(`Verified isolated fault: ${variant.name}`);
   await signal(name,'pause');fs.writeFileSync(fixture.config,JSON.stringify(baseline,null,2));fs.writeFileSync(`${fixture.cwd}/.dev.vars`,secrets);variant.after?.();
  }
  await signal(name,'resume');await waitFor('/health/ready',200);
  const config=JSON.parse(fs.readFileSync(`${root}/cloudflare/wrangler.staging.jsonc`,'utf8')),target=JSON.parse(fs.readFileSync(`${root}/cloudflare/deployment-targets.json`,'utf8')).staging;
  config.send_email=[{name:'EMAIL'}];config.vars.EMAIL_FROM='verified@test.invalid';validateDeployment(config,target);
  for(const mutate of [c=>c.account_id='wrong-account',c=>c.d1_databases[0].database_id='wrong-database',c=>c.r2_buckets[0].bucket_name='wrong-bucket',c=>c.compatibility_date='2020-01-01',c=>c.vars.WEB_ORIGIN='https://wrong.example']){const wrong=structuredClone(config);mutate(wrong);assert.throws(()=>validateDeployment(wrong,target));}
  fs.writeFileSync(`${root}/.local/evidence/readiness-faults.json`,JSON.stringify({status:'passed',environment:'isolated-local-worker-container',executedAt:new Date().toISOString(),results,preflight:'wrong-targets-rejected',restoredReady:200},null,2));
 }finally{
  if(fs.existsSync(controlFile(name))){try{await signal(name,'shutdown');}catch{}}
  if(child){const exited=new Promise(resolve=>child.once('exit',resolve));if(child.exitCode===null)await Promise.race([exited,delay(15000)]);if(child.exitCode===null)spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});}
  fs.closeSync(log);if(originalPaused){await signal('default','resume');await waitFor('/health/ready',200);}
 }
});
