import path from 'node:path';import fs from 'node:fs/promises';import {existsSync} from 'node:fs';import {spawn} from 'node:child_process';import {randomBytes,createHash} from 'node:crypto';import {createServer} from 'node:http';
import {root,resolveInstance,parseLocalArgs,invocation,backupPath,restoreTarget,withPausedControl} from './local-policy.mjs';
import {watchWslEgress} from './wsl-egress.mjs';
import {waitLocalReady,shutdownLocal} from './restart-local.mjs';
import {validateStoryUpgradeTarget,oldGamePurgeStatements} from './story-content-policy.mjs';
import {buildSceneEventTrackBundle} from './scene-event-content-policy.mjs';
import {publishSceneEventBundles,validateFormalSceneEventBundles} from './scene-event-publish-policy.mjs';
import {validateFirstStoryAuthoring} from './rain-bookshop-v3-policy.mjs';
import {applySceneEventUpgrade,validateSceneEventTarget,sceneEventMigration} from './scene-event-local-policy.mjs';
import {createAvatarResetPlan,applyAvatarResetPlan,validateAvatarResetTarget,avatarResetDevelopmentReady} from './avatar-reset-policy.mjs';
import {createRequire} from 'node:module';
import net from 'node:net';
const cli=path.join(root,process.env.DATINGHIGH_LINUX_TOOLCHAIN==='1'?'.local/toolchain/platform/node_modules/wrangler/bin/wrangler.js':'cloudflare/node_modules/wrangler/bin/wrangler.js');
const command=process.argv[2],opts=parseLocalArgs(command,process.argv.slice(3)),instance=resolveInstance(opts.instance);
if(command==='dev'&&process.platform==='win32'){
 const linuxPath=value=>value.replace(/^([A-Za-z]):/,(_,drive)=>`/mnt/${drive.toLowerCase()}`).replaceAll('\\','/');
 const linuxRoot=linuxPath(root),node=`${linuxRoot}/.local/toolchain/node-linux/bin/node`;
 if(!existsSync(path.join(root,'.local/toolchain/node-linux/bin/node'))||!existsSync(path.join(root,'.local/toolchain/platform/node_modules/wrangler/bin/wrangler.js')))throw new Error('Run npm run setup:wsl first');
 const child=spawn('wsl.exe',['-d','Ubuntu','--cd',linuxRoot,'--','/usr/bin/env','DATINGHIGH_LINUX_TOOLCHAIN=1',`PATH=${linuxRoot}/.local/toolchain/node-linux/bin:/usr/local/bin:/usr/bin:/bin:/mnt/c/Program Files/Docker/Docker/resources/bin`,node,`${linuxRoot}/tools/local.mjs`,'dev',...process.argv.slice(3)],{stdio:'inherit',windowsHide:true});
 child.on('exit',code=>process.exit(code??1));await new Promise(()=>{});
}
function run(args,cwd=instance.cwd,capture=false){return new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,[cli,...args],{cwd,windowsHide:true,stdio:capture?['ignore','pipe','pipe']:'inherit'});let out='',err='';
 if(capture){child.stdout.on('data',d=>out+=d);child.stderr.on('data',d=>err+=d);}
 child.on('error',reject);child.on('exit',code=>code===0?resolve(out):reject(new Error(`Wrangler exited ${code}${capture?`: ${err}`:''}`)));
});}
async function invoke(cmd,target=instance,extra=opts){const i=invocation(cmd,target,extra);return run(i.args,i.cwd);}
async function initializeSecrets(){
 const target=path.join(instance.cwd,'.dev.vars');const previous=existsSync(target)?await fs.readFile(target,'utf8'):'';
 const missing=['ACCESS_TOKEN_SECRET','EMAIL_CODE_HMAC_KEY','RATE_LIMIT_HMAC_KEY','ROUND_TICKET_HMAC_KEY'].filter(name=>!new RegExp(`^${name}=`, 'm').test(previous));
 if(missing.length)await fs.appendFile(target,(previous&&!previous.endsWith('\n')?'\n':'')+missing.map(name=>`${name}=${randomBytes(32).toString('base64')}`).join('\n')+'\n');
}
const controlFile=path.join(root,'.local',`control-${instance.name}.json`);
async function withPausedWrites(action){
 let control;
 try{control=JSON.parse(await fs.readFile(controlFile,'utf8'));}catch{}
 async function signal(op){const response=await fetch(`http://127.0.0.1:${control.port}/${op}`,{method:'POST',headers:{Authorization:`Bearer ${control.token}`}});if(!response.ok)throw new Error('Cannot pause local writes');}
 return withPausedControl(control,action,signal,async error=>{
  if(error?.cause?.code!=='ECONNREFUSED')return false;
  // 只有固定本機入口也確定無 listener，才可移除本專案殘留的 supervisor metadata。
  const stopped=await new Promise((resolve,reject)=>{const socket=net.createConnection({host:'127.0.0.1',port:8787});socket.once('connect',()=>{socket.destroy();resolve(false);});socket.once('error',failure=>failure.code==='ECONNREFUSED'?resolve(true):reject(failure));socket.setTimeout(2000,()=>{socket.destroy();resolve(false);});});
  if(!stopped)return false;await fs.rm(controlFile,{force:true});return true;
 });
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
}else if(command==='dev-stop'){
 const control=JSON.parse(await fs.readFile(controlFile,'utf8'));
 const noListener=()=>new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port:8787});socket.once('connect',()=>{socket.destroy();resolve(false);});socket.once('error',error=>{socket.destroy();resolve(error.code==='ECONNREFUSED');});socket.setTimeout(1000,()=>{socket.destroy();resolve(false);});});
 await shutdownLocal(control,{isStopped:async()=>!existsSync(controlFile)&&await noListener()});console.log('DatingHigh local platform stopped');
}else if(command==='story-upgrade'){
 const config=JSON.parse(await fs.readFile(instance.config,'utf8'));validateStoryUpgradeTarget(config);
 const done=await run(['d1','execute','DB','--local','--config',instance.config,'--command',"SELECT name FROM d1_migrations WHERE name='0005_story_dialogue_exit.sql'",'--json'],instance.cwd,true);
 if(done.includes('0005_story_dialogue_exit.sql')){console.log('Story schema already upgraded');}
 else await withPausedWrites(async()=>{
  const output=backupPath(`story-upgrade-${Date.now()}`);await fs.mkdir(path.dirname(output),{recursive:true});await invoke('backup',instance,{output});
  const sql=["SELECT CASE WHEN EXISTS(SELECT 1 FROM d1_migrations WHERE name='0004_matching_sessions.sql') THEN 1 ELSE json('UNKNOWN_BASELINE') END",...oldGamePurgeStatements(),await fs.readFile(path.join(root,'cloudflare/migrations/0005_story_dialogue_exit.sql'),'utf8'),"INSERT INTO d1_migrations(name) VALUES('0005_story_dialogue_exit.sql')"].join(';\n');
  const file=path.join(root,'.local',`story-upgrade-${instance.name}.sql`);await fs.writeFile(file,sql);await invoke('execute',instance,{file});console.log('Local Story schema upgraded; accounts and profiles retained');
 });
}else if(command==='scene-status'){
 const config=JSON.parse(await fs.readFile(instance.config,'utf8')),target=validateSceneEventTarget(config);
 const {getPlatformProxy}=createRequire(path.join(root,'cloudflare/package.json'))('wrangler');
 const proxy=await getPlatformProxy({configPath:instance.config,envFiles:[],persist:{path:path.join(instance.state,'v3')},remoteBindings:false});
 try{const migrations=(await proxy.env.DB.prepare('SELECT name FROM d1_migrations ORDER BY id').all()).results;const counts={};for(const table of ['auth_accounts','user_profiles','user_media_assets','match_conditions','match_invitations','game_rounds','game_story_sessions','game_round_events','game_scene_visits','game_event_instances','content_story_catalog'])if(await proxy.env.DB.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").bind(table).first())counts[table]=(await proxy.env.DB.prepare('SELECT COUNT(*) AS total FROM '+table).first()).total;
 const activeGenerated=(await proxy.env.DB.prepare("SELECT p.account_id,p.selected_avatar_ref FROM user_profiles p WHERE p.selected_avatar_type='generated' AND EXISTS(SELECT 1 FROM game_rounds r WHERE r.status='active' AND (r.account_low_id=p.account_id OR r.account_high_id=p.account_id))").all()).results;
 let withStaticPoseManifest=0,withSavedMaster=0,withCandidateIndex=0;for(const p of activeGenerated){if(!/^[0-9a-f-]{36}$/.test(p.account_id)||!/^[0-9a-f-]{36}$/.test(p.selected_avatar_ref))throw new Error('INVALID_LOCAL_AVATAR_REFERENCE');const master=await proxy.env.FILES.head(`private/${p.account_id}/avatar/${p.selected_avatar_ref}`);if(master)withSavedMaster++;if(Number.isInteger(Number(master?.customMetadata?.candidateIndex))&&Number(master.customMetadata.candidateIndex)>=1&&Number(master.customMetadata.candidateIndex)<=4)withCandidateIndex++;const prefix=`private/${p.account_id}/avatar/${p.selected_avatar_ref}/static-poses/v1/`;let cursor,found=false;do{const page=await proxy.env.FILES.list({prefix,limit:1000,...(cursor?{cursor}:{})});found ||= page.objects.some(o=>/^[0-9a-f]{64}\/manifest\.json$/.test(o.key.slice(prefix.length)));cursor=page.truncated?page.cursor:undefined;}while(cursor&&!found);if(found)withStaticPoseManifest++;}
 console.log(JSON.stringify({instance:instance.name,target,state:instance.state,buckets:config.r2_buckets.map(b=>({binding:b.binding,name:b.bucket_name})),migrations,counts,activeGeneratedAvatars:{selected:activeGenerated.length,withStaticPoseManifest,withSavedMaster,withCandidateIndex}}));}finally{await proxy.dispose();}
}else if(command==='scene-upgrade'||command==='scene-publish'){
 const config=JSON.parse(await fs.readFile(instance.config,'utf8'));validateSceneEventTarget(config);
 const directory=path.join(root,'.local','scene-event-publish',instance.name);await fs.mkdir(directory,{recursive:true});const lease=await fs.open(path.join(directory,'publisher.lock'),'wx');
 try{await withPausedWrites(async()=>{
   const definitions=JSON.parse(await fs.readFile(path.join(root,'contracts/scene-event-content.json'),'utf8'));
   validateFirstStoryAuthoring(definitions);
   const bundles=[];for(const definition of definitions.stories){const source=JSON.parse(await fs.readFile(path.join(root,definition.sourceFile),'utf8'));bundles.push(buildSceneEventTrackBundle(source,root,definition));}
   await validateFormalSceneEventBundles(bundles,root);
  if(command==='scene-upgrade'){
   const output=backupPath(`scene-${Date.now()}-${randomBytes(3).toString('hex')}`);await fs.mkdir(path.dirname(output),{recursive:true});const reserve=await fs.open(output,'wx');await reserve.close();const temporary=output+'.'+randomBytes(8).toString('hex')+'.tmp';
   try{await invoke('backup',instance,{output:temporary});await fs.rename(temporary,output);}catch(error){await fs.rm(temporary,{force:true});await fs.rm(output,{force:true});throw error;}
  }
  const{getPlatformProxy}=createRequire(path.join(root,'cloudflare/package.json'))('wrangler');
  const proxy=await getPlatformProxy({configPath:instance.config,envFiles:[],persist:{path:path.join(instance.state,'v3')},remoteBindings:false});
  try{
   const privateFingerprint=async()=>{const rows=[];let cursor;do{const page=await proxy.env.FILES.list({limit:1000,...(cursor?{cursor}:{})});rows.push(...page.objects.map(o=>[o.key,o.etag,o.size]));cursor=page.truncated?page.cursor:undefined;}while(cursor);rows.sort(([a],[b])=>a.localeCompare(b));return{count:rows.length,sha256:createHash('sha256').update(JSON.stringify(rows)).digest('hex')};};
   const privateBefore=await privateFingerprint();
   const upgrade=command==='scene-upgrade'?await applySceneEventUpgrade(proxy.env.DB,config):null;
   if(!await proxy.env.DB.prepare('SELECT 1 FROM d1_migrations WHERE name=?').bind(sceneEventMigration).first())throw new Error('Run the local scene-upgrade wrapper first');
   const published=await publishSceneEventBundles(proxy.env.DB,proxy.env.STORY_CONTENT,bundles,{validationRoot:root});
   const privateAfter=await privateFingerprint();if(JSON.stringify(privateBefore)!==JSON.stringify(privateAfter))throw new Error('PRIVATE_MEDIA_CHANGED');
   config.vars.EXPECTED_MIGRATION=sceneEventMigration;await fs.writeFile(instance.config,JSON.stringify(config,null,2)+'\n');
   console.log(JSON.stringify({instance:instance.name,migration:sceneEventMigration,upgrade,published,privateMedia:{retainedObjects:privateBefore.count,unchanged:true},contentPins:bundles.map(b=>({narrativeId:b.narrative.id,version:b.narrative.version,sha256:b.narrative.sha256,sceneSha256:b.scene.sha256}))}));
  }finally{await proxy.dispose();}
 });}finally{await lease.close();await fs.rm(path.join(directory,'publisher.lock'));}
}else if(command==='migrate'||command==='query'||command==='execute'||command==='game-end'){
 if(command==='execute'&&!opts.file)throw new Error('--file is required');
 if(command==='query')await invoke(command);else {
  const resumeRequired=command==='game-end'&&existsSync(controlFile);
  await withPausedWrites(()=>invoke(command));
  if(resumeRequired)await waitLocalReady();
 }
}else if(command==='seed'){
 // 種子只有無登入能力的 disabled Account，沒有固定雲端密碼。
 const target=path.join(root,'.local','seed.sql');await fs.mkdir(path.dirname(target),{recursive:true});
 await fs.writeFile(target,"INSERT OR IGNORE INTO auth_accounts VALUES('019a281e-0000-7000-8000-000000000001','seed@local.invalid',1800000000000,NULL,'disabled',1,1800000000000,1800000000000);\n");
 await withPausedWrites(()=>invoke('execute',instance,{file:target}));
}else if(command==='avatar-reset-preview'||command==='avatar-reset-apply'){
 const config=JSON.parse(await fs.readFile(instance.config,'utf8')),target=validateAvatarResetTarget(config);
 const directory=path.join(root,'.local','avatar-reset'),file=path.join(directory,opts.name+'.json');await fs.mkdir(directory,{recursive:true});
 const readJson=async relative=>{try{return JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));}catch{return null;}};
 const developmentReady=avatarResetDevelopmentReady(await readJson('contracts/builtin-avatar-packs.json'),await readJson('docs/verification/story-dialogue-exit-traceability.json'));
 if(command==='avatar-reset-apply'&&!developmentReady)throw new Error('AVATAR_RESET_NOT_READY: full sixteen packs and reviewed pre-reset technical cases required');
 const {getPlatformProxy}=createRequire(path.join(root,'cloudflare/package.json'))('wrangler');
 await withPausedWrites(async()=>{
  if(command==='avatar-reset-apply'){const noListener=await new Promise(resolve=>{const socket=net.createConnection({host:'127.0.0.1',port:8787});socket.once('connect',()=>{socket.destroy();resolve(false);});socket.once('error',error=>resolve(error.code==='ECONNREFUSED'));socket.setTimeout(2000,()=>{socket.destroy();resolve(false);});});if(!noListener)throw new Error('AVATAR_RESET_WRITER_STILL_RUNNING');}
  const proxy=await getPlatformProxy({configPath:instance.config,envFiles:[],persist:{path:path.join(instance.state,'v3')},remoteBindings:false});
  const save=async plan=>{const temporary=file+'.tmp-'+process.pid;await fs.writeFile(temporary,JSON.stringify(plan,null,2)+'\n');await fs.rename(temporary,file);};
  try{
   const {DB,FILES}=proxy.env;
   if(!await DB.prepare("SELECT name FROM d1_migrations WHERE name='0005_story_dialogue_exit.sql'").first())throw new Error('AVATAR_RESET_BASELINE_INVALID');
   if(command==='avatar-reset-preview'){
    if(existsSync(file))throw new Error('Cleanup plan name already exists; choose a new name');
    const plan=await createAvatarResetPlan(DB,FILES,config,opts.accounts.split(','));plan.instance=instance.name;await save(plan);
    console.log(JSON.stringify({plan:file,developmentReady,profiles:plan.profiles.length,generatedAssets:plan.profiles.reduce((n,p)=>n+p.assets.length,0),objects:plan.objects.length,status:'preview-only'}));
   }else{
    const plan=JSON.parse(await fs.readFile(file,'utf8'));if(plan.instance!==instance.name||JSON.stringify(plan.target)!==JSON.stringify(target))throw new Error('AVATAR_RESET_TARGET_CONFLICT');
    if(!plan.backup){const backup=backupPath('avatar-reset-'+Date.now());await fs.mkdir(path.dirname(backup),{recursive:true});await invoke('backup',instance,{output:backup});plan.backup=backup;await save(plan);}
    console.log(JSON.stringify(await applyAvatarResetPlan(DB,FILES,plan,{newExperienceReady:developmentReady,save})));
   }
  }finally{await proxy.dispose();}
 });
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
 config.name=`datinghigh-local-${opts.target}`;config.main=source('cloudflare/src/index.ts');config.$schema=source('cloudflare/node_modules/wrangler/config-schema.json');config.d1_databases[0].migrations_dir=source('cloudflare/migrations');config.assets.directory=source('frontend/client/dist');config.containers[0].image=source('backend/Dockerfile');config.containers[0].image_build_context=source('.');
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

