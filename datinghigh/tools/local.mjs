import path from 'node:path';import fs from 'node:fs/promises';import {existsSync} from 'node:fs';import {spawn} from 'node:child_process';import {randomBytes,createHash} from 'node:crypto';import {createServer} from 'node:http';
import {root,resolveInstance,parseLocalArgs,invocation,backupPath,restoreTarget,withPausedControl} from './local-policy.mjs';
import {watchWslEgress} from './wsl-egress.mjs';
const cli=path.join(root,process.env.DATINGHIGH_LINUX_TOOLCHAIN==='1'?'.local/toolchain/platform/node_modules/wrangler/bin/wrangler.js':'cloudflare/node_modules/wrangler/bin/wrangler.js');
const command=process.argv[2],opts=parseLocalArgs(command,process.argv.slice(3)),instance=resolveInstance(opts.instance);
if(command==='dev'&&process.platform==='win32'){
 const linuxPath=value=>value.replace(/^([A-Za-z]):/,(_,drive)=>`/mnt/${drive.toLowerCase()}`).replaceAll('\\','/');
 const linuxRoot=linuxPath(root),node=`${linuxRoot}/.local/toolchain/node-linux/bin/node`;
 if(!existsSync(path.join(root,'.local/toolchain/node-linux/bin/node'))||!existsSync(path.join(root,'.local/toolchain/platform/node_modules/wrangler/bin/wrangler.js')))throw new Error('Run npm run setup:wsl first');
 const child=spawn('wsl.exe',['-d','Ubuntu','--cd',linuxRoot,'--','/usr/bin/env','DATINGHIGH_LINUX_TOOLCHAIN=1',`PATH=${linuxRoot}/.local/toolchain/node-linux/bin:/usr/bin:/bin`,node,`${linuxRoot}/tools/local.mjs`,'dev',...process.argv.slice(3)],{stdio:'inherit',windowsHide:true});
 child.on('exit',code=>process.exit(code??1));await new Promise(()=>{});
}
function run(args,cwd=instance.cwd,capture=false){return new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,[cli,...args],{cwd,windowsHide:true,stdio:capture?['ignore','pipe','pipe']:'inherit'});let out='',err='';
 if(capture){child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);}
 child.on('error',reject);child.on('exit',code=>code===0?resolve(out):reject(new Error(`Wrangler exited ${code}${capture?`: ${err}`:''}`)));
});}
async function invoke(cmd,target=instance,extra=opts){const i=invocation(cmd,target,extra);return run(i.args,i.cwd);}
async function initializeSecrets(){
 const target=path.join(instance.cwd,'.dev.vars');if(existsSync(target))return;
 const data=['ACCESS_TOKEN_SECRET','EMAIL_CODE_HMAC_KEY','RATE_LIMIT_HMAC_KEY'].map(name=>`${name}=${randomBytes(32).toString('base64')}`).join('\n');
 await fs.writeFile(target,`${data}\n`,{flag:'wx'});
}
const controlFile=path.join(root,'.local',`control-${instance.name}.json`);
async function withPausedWrites(action){
 let control;
 try{control=JSON.parse(await fs.readFile(controlFile,'utf8'));}catch{}
 async function signal(op){const response=await fetch(`http://127.0.0.1:${control.port}/${op}`,{method:'POST',headers:{Authorization:`Bearer ${control.token}`}});if(!response.ok)throw new Error('Cannot pause local writes');}
 return withPausedControl(control,action,signal);
}
if(command==='dev'){
 await initializeSecrets();await fs.mkdir(path.dirname(controlFile),{recursive:true});let child,stopRelay=()=>{};
 const start=()=>{if(child&&child.exitCode===null&&!child.killed)return;const i=invocation('dev',instance);child=spawn(process.execPath,[cli,...i.args],{cwd:i.cwd,windowsHide:true,stdio:'inherit'});child.on('error',e=>console.error(e.message));if(process.env.DATINGHIGH_LINUX_TOOLCHAIN==='1')stopRelay=watchWslEgress(child);};
 const stop=async()=>{stopRelay();if(!child||child.exitCode!==null)return;const target=child;await new Promise(resolve=>{
  target.once('exit',resolve);
  if(process.platform==='win32')spawn('taskkill',['/PID',String(target.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});else target.kill('SIGTERM');
 });};
 const token=randomBytes(32).toString('hex');
 const control=createServer(async(req,res)=>{
  if(req.method!=='POST'||req.headers.authorization!==`Bearer ${token}`){res.writeHead(403).end();return;}
  try{if(req.url==='/pause')await stop();else if(req.url==='/resume')start();else if(req.url==='/shutdown'){res.once('finish',()=>{void close();});res.end('ok');return;}else{res.writeHead(404).end();return;}res.end('ok');}catch{res.writeHead(500).end();}
 });
 await new Promise(resolve=>control.listen(0,'127.0.0.1',resolve));
 await fs.writeFile(controlFile,JSON.stringify({port:control.address().port,token}),{flag:'w'});start();
 const close=async()=>{await stop();control.close();await fs.rm(controlFile,{force:true});process.exit();};
 process.on('SIGINT',close);process.on('SIGTERM',close);
}else if(command==='migrate'||command==='query'||command==='execute'){
 if(command==='execute'&&!opts.file)throw new Error('--file is required');
 if(command==='query')await invoke(command);else await withPausedWrites(()=>invoke(command));
}else if(command==='seed'){
 // 種子只有無登入能力的 disabled Account，沒有固定雲端密碼。
 const target=path.join(root,'.local','seed.sql');await fs.mkdir(path.dirname(target),{recursive:true});
 await fs.writeFile(target,"INSERT OR IGNORE INTO auth_accounts VALUES('019a281e-0000-7000-8000-000000000001','seed@local.invalid',1800000000000,NULL,'disabled',1,1800000000000,1800000000000);\n");
 await withPausedWrites(()=>invoke('execute',instance,{file:target}));
}else if(command==='backup'){
 const output=backupPath(opts.name);await fs.mkdir(path.dirname(output),{recursive:true});
 // 先以 wx 預留名稱，避免並行備份覆寫；Wrangler 寫入新 temporary file，成功後 rename。
 const handle=await fs.open(output,'wx');await handle.close();const temporary=`${output}.${randomBytes(8).toString('hex')}.tmp`;
 try{await withPausedWrites(async()=>{await invoke('backup',instance,{output:temporary});await fs.rename(temporary,output);});console.log(`Backup: ${output}`);}
 catch(e){await fs.rm(temporary,{force:true});await fs.rm(output,{force:true});throw e;}
}else if(command==='restore'){
 const target=restoreTarget(opts.target);if(!opts.file)throw new Error('--file is required');
 const sql=await fs.readFile(path.resolve(opts.file),'utf8');if(!sql.includes('auth_accounts')||!sql.includes('auth_sessions'))throw new Error('Not a foundation export');
 await fs.mkdir(target.cwd,{recursive:true});
 const config=JSON.parse(await fs.readFile(path.join(root,'cloudflare/wrangler.jsonc'),'utf8'));
 const source=relative=>path.relative(target.cwd,path.join(root,relative)).replaceAll('\\','/');
 config.name=`datinghigh-local-${opts.target}`;config.main=source('cloudflare/src/index.ts');config.$schema=source('cloudflare/node_modules/wrangler/config-schema.json');config.d1_databases[0].migrations_dir=source('cloudflare/migrations');config.assets.directory=source('frontend/client/dist');config.containers[0].image=source('backend/Dockerfile');
 await fs.writeFile(target.config,JSON.stringify(config,null,2));await invoke('restore',target,{file:opts.file});
 // 驗證固定 view、FK 與原有自然 UNIQUE；不把 restore 寫入原 instance。
 await run(['d1','execute','DB','--config',target.config,'--local','--command','PRAGMA foreign_key_check; SELECT count(*) AS accounts FROM auth_accounts; SELECT count(*) AS sessions FROM auth_sessions;','--json'],target.cwd);
 console.log(`Restored new local instance: ${opts.target}`);
}else if(command==='probe'){
 const config=JSON.parse(await fs.readFile(instance.config,'utf8'));const bucket=config.r2_buckets.find(b=>b.binding==='FILES').bucket_name;const text='datinghigh-foundation-v1';const file=path.join(root,'.local','probe.txt');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,text);
 await run(['r2','object','put',`${bucket}/_system/foundation/probe.txt`,'--local','--config',instance.config,'--file',file]);
 const body=await run(['r2','object','get',`${bucket}/_system/foundation/probe.txt`,'--local','--config',instance.config,'--pipe'],instance.cwd,true);
 if(createHash('sha256').update(body).digest('hex')!==createHash('sha256').update(text).digest('hex'))throw new Error('R2 probe digest mismatch');console.log('R2 probe digest verified');
}

