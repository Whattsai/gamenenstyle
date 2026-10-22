import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, rename, rm, lstat, realpath, readdir, copyFile, stat, open } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';
import { UnityRunner } from './unity.js';

const sha = value => createHash('sha256').update(value).digest('hex');
const inside = (root, candidate) => { const rel = relative(root, candidate); return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)); };
const fail = (code, message) => { throw new Error(`${code}: ${message}`); };
const blockedSegments = new Set(['.git','.vs','.ssh','.gnupg','credentials','secrets','node_modules','bin','obj']);
const textExt = new Set(['.md','.txt','.json','.jsonc','.yaml','.yml','.js','.mjs','.cjs','.ts','.tsx','.jsx','.css','.html','.xml','.cs','.csproj','.sln','.sql','.py','.ps1','.sh','.feature','.toml','.ini','.config','.gitignore']);
const sensitive = name => /^\.env(?:\.|$)/i.test(name) || /(?:^|[-_.])(secret|password|credential|private[-_]?key)(?:[-_.]|$)/i.test(name) || /\.(?:pem|pfx|p12|key)$/i.test(name);
export function redact(value) { return String(value).replace(/(https:\/\/[^\s"'?#]+)\?[^\s"'#]*/gi,'$1?[REDACTED_QUERY]').replace(/(?:sk|sess|rk|pk)-[A-Za-z0-9_-]{16,}/g,'[REDACTED_KEY]').replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]{16,}/gi,'$1[REDACTED]').replace(/((?:Password|Pwd|AccountKey|SharedAccessSignature)\s*[=:]\s*)[^;\s'\"]+/gi,'$1[REDACTED]').replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,'[REDACTED_PRIVATE_KEY]'); }
export function safeEnvironment(){const names=['PATH','Path','SystemRoot','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOME','LOCALAPPDATA','APPDATA','ProgramData','ProgramFiles','ProgramFiles(x86)','DOTNET_ROOT','JAVA_HOME','ANDROID_HOME','ANDROID_SDK_ROOT'];const env={};for(const name of names)if(process.env[name])env[name]=process.env[name];env.PYTHONUTF8='1';env.PYTHONIOENCODING='utf-8';return env;}
function assertText(path) { if (!textExt.has(extname(path).toLowerCase()) && !textExt.has(basename(path).toLowerCase())) fail('TEXT_TYPE_BLOCKED','unsupported text file'); }
// 來源例外只供讀取，不加入共用的可寫副檔名集合；涵蓋 parts/s 與 p/8、p/48。
const isLDrawSource = path => /^brickhigh\/artifacts\/sources\/ldraw-release\/ldraw\/(?:parts|p)\/[a-z0-9_./-]+\.dat$/i.test(path);
function assertReadableText(path) { if (!isLDrawSource(path)) assertText(path); }
function assertMutableSource(path) { if (isLDrawSource(path)) fail('READ_ONLY_SOURCE','LDraw source files are read-only'); }
function validateLDrawText(path, bytes) {
  if (!isLDrawSource(path)) return;
  let content;
  try { content = new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
  catch { fail('TEXT_TYPE_BLOCKED','LDraw source must be UTF-8 plain text'); }
  // 完整檔案先驗文字性質，不能藉分段只讀取二進位檔開頭的 ASCII。
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(content)
      || content.split(/\r?\n/).some(line => line.trim() && !/^[ \t]*[0-5](?:[ \t]|$)/.test(line)))
    fail('TEXT_TYPE_BLOCKED','LDraw source must contain plain-text LDraw lines');
}
function normalize(path) {
  if (typeof path !== 'string' || !path || path.includes('\0') || isAbsolute(path) || /^[A-Za-z]:/.test(path)) fail('PATH_NOT_RELATIVE','use a relative path');
  const parts = path.replaceAll('\\','/').split('/');
  if (parts.some(x => !x || x === '.' || x === '..')) fail('PATH_TRAVERSAL','invalid path segment');
  if (parts.some(x => blockedSegments.has(x.toLowerCase())) || sensitive(parts.at(-1))) fail('SENSITIVE_PATH','path blocked');
  return parts.join('/');
}
export async function safePath(root, path, protectedRoot) {
  const normalized = normalize(path);
  const absolute = resolve(root, normalized);
  if (!inside(root, absolute)) fail('PATH_OUTSIDE_ROOT','path outside repo');
  if(protectedRoot&&inside(protectedRoot,absolute))fail('SERVER_PATH_BLOCKED','MCP server policy files are not accessible through workspace tools');
  let current = root;
  for (const part of normalized.split('/')) {
    current = join(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) fail('SYMLINK_BLOCKED','symlink or junction path'); }
    catch (error) { if (error.code === 'ENOENT') break; throw error; }
  }
  let parent = absolute;
  while (!existsSync(parent)) parent = resolve(parent, '..');
  if (!inside(await realpath(root), await realpath(parent))) fail('SYMLINK_ESCAPE','path escapes repo');
  return { relative: normalized, absolute };
}
async function atomicJson(path, value) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value,null,2)}\n`);
  await rename(temporary,path);
}
async function json(path) { try { return JSON.parse(await readFile(path,'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
async function command(executable,args,cwd,timeout=30_000) {
  return new Promise((resolveResult,reject) => {
    const child=spawn(executable,args,{cwd,windowsHide:true,shell:false,env:safeEnvironment()});
    let stdout='',stderr='';
    const timer=setTimeout(()=>child.kill(),timeout);
    child.stdout.on('data',chunk=>{ stdout+=chunk; if(stdout.length>4_000_000) child.kill(); });
    child.stderr.on('data',chunk=>{ stderr+=chunk; if(stderr.length>4_000_000) child.kill(); });
    child.on('error',error=>{ clearTimeout(timer); reject(error); });
    child.on('close',code=>{ clearTimeout(timer); resolveResult({exitCode:code,stdout:redact(stdout),stderr:redact(stderr)}); });
  });
}

export class ProjectService {
  constructor(config) { this.config=config; this.state=basename(config.runtimeRoot)===config.projectId?config.runtimeRoot:join(config.runtimeRoot,config.projectId); this.children=new Map(); this.unity=new UnityRunner(this); }
  async init() { for (const dir of ['sessions','jobs','logs','trash','artifacts']) await mkdir(join(this.state,dir),{recursive:true}); }
  repo(alias) { const repo=this.config.repos[alias]; if(!repo) fail('UNKNOWN_ALIAS',alias); return repo; }
  sessionPath(id) { if(!/^[0-9a-f-]{36}$/.test(id)) fail('INVALID_SESSION_ID','bad session ID'); return join(this.state,'sessions',`${id}.json`); }
  async status(alias) { const repo=this.repo(alias); return command('git',['-C',repo.root,'status','--porcelain=v1','--untracked-files=all'],repo.root); }
  leasePath(){return join(this.state,'sessions','lease.json');}
  lockPath(){return join(this.state,'sessions','.workspace-session.lock');}
  normalizeSession(raw){const id=raw.id,createdAt=raw.createdAt??raw.created??new Date().toISOString(),leaseExpiresAt=raw.leaseExpiresAt??raw.expires??createdAt;return{...raw,id,status:['completed','abandoned'].includes(raw.status)?raw.status:'active',taskSummary:raw.taskSummary??'',createdAt,lastActivityAt:raw.lastActivityAt??createdAt,leaseExpiresAt,reads:raw.reads??{},partialReads:raw.partialReads??{},validations:raw.validations??raw.validationResults??[],recoveryLineage:raw.recoveryLineage??{rootSessionId:id,action:'begin',generation:0}};}
  async withSessionLock(action){const token=randomUUID(),lock=this.lockPath(),owner=join(lock,'owner.json'),deadline=Date.now()+10000;for(;;){try{await mkdir(lock);await atomicJson(owner,{pid:process.pid,token,acquiredAt:new Date().toISOString()});break;}catch(error){if(error.code!=='EEXIST')throw error;const held=await json(owner);let alive=false;if(held?.pid){try{process.kill(held.pid,0);alive=true;}catch(e){alive=e.code==='EPERM';}}if(held?.pid&&!alive)await rm(lock,{recursive:true,force:true});else if(!held?.pid){try{if(Date.now()-(await stat(lock)).mtimeMs>30000)await rm(lock,{recursive:true,force:true});}catch{}}if(Date.now()>=deadline)fail('SESSION_LOCK_TIMEOUT','timed out waiting for session lock');await new Promise(resolve=>setTimeout(resolve,20));}}try{return await action();}finally{if((await json(owner))?.token===token)await rm(lock,{recursive:true,force:true});}}
  async activeUnsafe(){const pointer=await json(this.leasePath());if(!pointer)return null;const id=pointer.sessionId??pointer.id;if(!id)return null;const stored=await json(this.sessionPath(id));return stored?this.normalizeSession(stored):(pointer.aliases?this.normalizeSession(pointer):null);}
  async writePointer(id){await atomicJson(this.leasePath(),{version:1,sessionId:id});}
  async createSession(aliases,taskSummary='',lineage){const selected=[...new Set(aliases)];if(!selected.length)fail('EMPTY_SCOPE','select a repo');const baseline={},requiredInstructions={};for(const alias of selected){const repo=this.repo(alias),result=await this.status(alias);if(result.exitCode!==0)fail('GIT_STATUS_FAILED',result.stderr);baseline[alias]=result.stdout;requiredInstructions[alias]=repo.requiredInstructions;}const id=randomUUID(),now=new Date();return{id,aliases:selected,status:'active',taskSummary,baseline,requiredInstructions,reads:{},partialReads:{},validations:[],createdAt:now.toISOString(),lastActivityAt:now.toISOString(),leaseExpiresAt:new Date(now.getTime()+90*60_000).toISOString(),recoveryLineage:lineage??{rootSessionId:id,action:'begin',generation:0}};}
  async begin(aliases,taskSummary=''){return this.withSessionLock(async()=>{const active=await this.activeUnsafe();if(active)fail('WRITE_LEASE_REQUIRES_RESOLUTION',`query and resolve session ${active.id} before begin`);const session=await this.createSession(aliases,taskSummary);await atomicJson(this.sessionPath(session.id),session);await this.writePointer(session.id);return session;});}
  async authorizeUnsafe(id,alias,instructions=false){const raw=await json(this.sessionPath(id)),session=raw?this.normalizeSession(raw):null,active=await this.activeUnsafe();if(!session||active?.id!==id||session.status!=='active')fail('SESSION_INVALID','session is not the active lease holder');if(Date.parse(session.leaseExpiresAt)<=Date.now())fail('SESSION_EXPIRED','resolve with resume, replace, or release');if(alias&&!session.aliases.includes(alias))fail('ALIAS_OUTSIDE_SESSION',alias);if(instructions){const missing=[];for(const path of session.requiredInstructions[alias]){const recorded=session.reads[alias]?.[path];if(!recorded){missing.push(path);continue;}const target=await safePath(this.repo(alias).root,path,this.config.toolRoot);if(sha(await readFile(target.absolute))!==recorded)missing.push(path);}if(missing.length)fail('AGENT_INSTRUCTIONS_NOT_READ',missing.join(', '));}const now=new Date();session.lastActivityAt=now.toISOString();session.leaseExpiresAt=new Date(now.getTime()+90*60_000).toISOString();await atomicJson(this.sessionPath(id),session);return session;}
  async requireSession(id,alias,instructions=false){return this.withSessionLock(()=>this.authorizeUnsafe(id,alias,instructions));}
  async updateSession(id,alias,instructions,mutate){return this.withSessionLock(async()=>{const session=await this.authorizeUnsafe(id,alias,instructions);await mutate(session);await atomicJson(this.sessionPath(id),session);return session;});}
  async saveSession(session){await this.withSessionLock(()=>atomicJson(this.sessionPath(session.id),session));}
  async recordValidation(id,result){await this.updateSession(id,result.alias,false,session=>session.validations.push(result));}
  async getActive(){const session=await this.activeUnsafe();if(!session)return{state:'none',availableActions:[]};let completed=0,total=0;const byAlias={},repoChanges={};for(const alias of session.aliases){const required=session.requiredInstructions[alias]??[];const done=required.filter(path=>session.reads[alias]?.[path]).length;byAlias[alias]={completed:done,total:required.length};completed+=done;total+=required.length;const current=await this.status(alias);repoChanges[alias]={changedFiles:current.stdout.split(/\r?\n/).filter(Boolean).length};}const byStatus={};for(const item of session.validations)byStatus[item.status]=(byStatus[item.status]??0)+1;return{state:Date.parse(session.leaseExpiresAt)<=Date.now()?'expired':'active',sessionId:session.id,taskSummary:session.taskSummary,aliases:session.aliases,createdAt:session.createdAt,lastActivityAt:session.lastActivityAt,leaseExpiresAt:session.leaseExpiresAt,requiredInstructions:{completed,total,byAlias},validationStats:{total:session.validations.length,byStatus},repoChanges,availableActions:['resume','replace','release']};}
  async resolveSession(expectedId,action,aliases,taskSummary){return this.withSessionLock(async()=>{const current=await this.activeUnsafe();if(!current||current.id!==expectedId)fail('SESSION_STATE_CHANGED','active session changed; query again');const endedAt=new Date().toISOString();if(action==='release'){Object.assign(current,{status:'abandoned',endedAt,endReason:'released'});await atomicJson(this.sessionPath(current.id),current);await rm(this.leasePath(),{force:true});return{action,previousSessionId:current.id,released:true};}let session;if(action==='resume'){const id=randomUUID(),now=new Date();session={...current,id,status:'active',createdAt:now.toISOString(),lastActivityAt:now.toISOString(),leaseExpiresAt:new Date(now.getTime()+90*60_000).toISOString(),requiredInstructions:Object.fromEntries(current.aliases.map(alias=>[alias,this.repo(alias).requiredInstructions])),reads:{},partialReads:{},recoveryLineage:{rootSessionId:current.recoveryLineage.rootSessionId,previousSessionId:current.id,action:'resume',generation:current.recoveryLineage.generation+1}};delete session.endedAt;delete session.endReason;delete session.incompleteItems;delete session.replacementSessionId;}else if(action==='replace'){if(!aliases?.length||!taskSummary?.trim())fail('REPLACEMENT_DETAILS_REQUIRED','replace needs aliases and task summary');session=await this.createSession(aliases,taskSummary.trim(),{rootSessionId:current.recoveryLineage.rootSessionId,previousSessionId:current.id,action:'replace',generation:current.recoveryLineage.generation+1});}else fail('INVALID_RESOLUTION_ACTION',action);Object.assign(current,{status:'abandoned',endedAt,endReason:action==='resume'?'resumed':'replaced',replacementSessionId:session.id});await atomicJson(this.sessionPath(current.id),current);await atomicJson(this.sessionPath(session.id),session);await this.writePointer(session.id);return{action,previousSessionId:current.id,session};});}
  async end(id,incompleteItems=[]){return this.withSessionLock(async()=>{const session=await this.authorizeUnsafe(id),changes={};for(const alias of session.aliases){const now=await this.status(alias);changes[alias]={changedSinceStart:now.stdout!==session.baseline[alias],status:now.stdout};}Object.assign(session,{status:'completed',endedAt:new Date().toISOString(),endReason:'completed',incompleteItems});await atomicJson(this.sessionPath(id),session);await rm(this.leasePath(),{force:true});return{sessionId:id,changes,validations:session.validations,incompleteItems};});}
  async overview(aliases) { const result={}; for(const alias of aliases){const repo=this.repo(alias);result[alias]={root:repo.root,status:await this.status(alias)};} return result; }
  async list(alias,glob='**/*',limit=200) {
    const repo=this.repo(alias); if(glob.includes('..') || isAbsolute(glob)) fail('INVALID_GLOB','glob must stay in repo');
    const files=await fg(glob,{cwd:repo.root,onlyFiles:true,followSymbolicLinks:false,dot:true,ignore:['**/.git/**','**/node_modules/**']});
    const safe=[]; for(const file of files.sort()){ try{await safePath(repo.root,file,this.config.toolRoot);safe.push(file);}catch{} if(safe.length>=limit)break;} return safe;
  }
  async search(alias,query,limit=100) {
    const repo=this.repo(alias); const files=await this.list(alias,'**/*',5000); const hits=[];
    for(const file of files){try{assertText(file);const data=await readFile((await safePath(repo.root,file,this.config.toolRoot)).absolute,'utf8');for(const [i,line] of data.split(/\r?\n/).entries()){if(line.includes(query))hits.push({path:file,line:i+1,text:redact(line.slice(0,500))});if(hits.length>=limit)return hits;}}catch{}}
    return hits;
  }
  async read(alias,path,sessionId) {
    const repo=this.repo(alias); const target=await safePath(repo.root,path,this.config.toolRoot); assertReadableText(target.relative);
    const bytes=await readFile(target.absolute); if(bytes.length>8192) fail('TEXT_TOO_LARGE','use read_workspace_text_chunk');
    validateLDrawText(target.relative,bytes);
    const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes); const hash=sha(bytes);
    if(JSON.stringify(redact(text)).length>16000)fail('RESULT_TOO_LARGE','use read_workspace_text_chunk');
    if(sessionId)await this.updateSession(sessionId,alias,false,session=>{session.reads[alias]??={};session.reads[alias][target.relative]=hash;delete session.partialReads?.[alias]?.[target.relative];});
    return {path:target.relative,sha256:hash,size:bytes.length,text:redact(text)};
  }
  async readChunk(alias,path,offset,maxBytes,sessionId,expectedSha256){
    const repo=this.repo(alias),target=await safePath(repo.root,path,this.config.toolRoot);assertReadableText(target.relative);
    const bytes=await readFile(target.absolute);if(bytes.length>1024*1024)fail('TEXT_TOO_LARGE','file exceeds limit');
    validateLDrawText(target.relative,bytes);
    const hash=sha(bytes);if(expectedSha256&&expectedSha256!==hash)fail('SHA_CONFLICT','file changed between chunks');
    if(offset<0||offset>bytes.length||maxBytes<4||maxBytes>131072)fail('INVALID_CHUNK','invalid offset or size');
    let end=Math.min(bytes.length,offset+maxBytes),text=bytes.length===0?'':undefined;
    while(end>offset){try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(offset,end));break;}catch{end--;}}
    if(text===undefined)fail('INVALID_CHUNK','UTF-8 boundary or binary file');
    if(JSON.stringify(redact(text)).length>280000)fail('RESULT_TOO_LARGE','use smaller max_bytes');
    if(sessionId)await this.updateSession(sessionId,alias,false,session=>{session.partialReads??={};session.partialReads[alias]??={};const prior=session.partialReads[alias][target.relative];
      if(offset!==0&&(!prior||prior.sha256!==hash||prior.nextOffset!==offset))fail('CHUNK_SEQUENCE_CONFLICT','restart at offset 0');
      if(end===bytes.length){session.reads[alias]??={};session.reads[alias][target.relative]=hash;delete session.partialReads[alias][target.relative];}
      else {session.partialReads[alias][target.relative]={sha256:hash,nextOffset:end};delete session.reads[alias]?.[target.relative];}
    });
    return {path:target.relative,sha256:hash,offset,nextOffset:end,eof:end===bytes.length,text:redact(text)};
  }
  async readRange(alias,path,startLine,endLine,sessionId,expectedSha256){
    const repo=this.repo(alias),target=await safePath(repo.root,path,this.config.toolRoot);assertReadableText(target.relative);
    if(!Number.isInteger(startLine)||!Number.isInteger(endLine)||startLine<1||endLine<startLine||endLine-startLine>=2000)fail('INVALID_LINE_RANGE','invalid line bounds');
    const bytes=await readFile(target.absolute);if(bytes.length>1024*1024)fail('TEXT_TOO_LARGE','file exceeds limit');
    validateLDrawText(target.relative,bytes);
    const hash=sha(bytes);if(hash!==expectedSha256)fail('SHA_CONFLICT','file changed');
    const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes),lines=content.split(/\r?\n/);
    if(startLine>lines.length)fail('INVALID_LINE_RANGE','start line past EOF');
    const selected=lines.slice(startLine-1,endLine),output=redact(selected.map((line,index)=>`${startLine+index}: ${line}`).join('\n'));
    if(Buffer.byteLength(output)>131072)fail('RESULT_TOO_LARGE','narrow line range');
    if(sessionId){await this.requireSession(sessionId,alias,false);if(startLine===1&&endLine>=lines.length)await this.updateSession(sessionId,alias,false,session=>{session.reads[alias]??={};session.reads[alias][target.relative]=hash;});}
    return {path:target.relative,sha256:hash,startLine,endLine:Math.min(endLine,lines.length),totalLines:lines.length,eof:endLine>=lines.length,text:output};
  }
  async patch({sessionId,alias,path,expectedSha256,createContent,changes}) {
    const session=await this.requireSession(sessionId,alias,true);const repo=this.repo(alias);const target=await safePath(repo.root,path,this.config.toolRoot);assertMutableSource(target.relative);assertText(path);
    const old=existsSync(target.absolute)?await readFile(target.absolute,'utf8'):null;const current=old===null?null:sha(old);
    if(current!==expectedSha256 || (old!==null && session.reads[alias]?.[target.relative]!==current)) fail('SHA_CONFLICT','target changed or was not read in this session');
    if(old===null && typeof createContent!=='string') fail('CREATE_CONTENT_REQUIRED','new file needs content');
    if(old!==null && (!Array.isArray(changes) || changes.length===0)) fail('CHANGES_REQUIRED','existing file needs exact changes');
    let output=old??createContent;
    for(const change of changes??[]){if(!change.search || output.split(change.search).length!==2) fail('PATCH_NOT_UNIQUE','search must match exactly once');output=output.replace(change.search,change.replace);}
    if(Buffer.byteLength(output)>1024*1024) fail('TEXT_TOO_LARGE','patch exceeds limit');
    await mkdir(resolve(target.absolute,'..'),{recursive:true});await writeFile(target.absolute,output,{flag:old===null?'wx':'w'});
    return {path:target.relative,previousSha256:current,sha256:sha(output)};
  }
  async move(sessionId,alias,from,to,expectedSha256) {
    const session=await this.requireSession(sessionId,alias,true),repo=this.repo(alias);const source=await safePath(repo.root,from,this.config.toolRoot),dest=await safePath(repo.root,to,this.config.toolRoot);
    assertMutableSource(source.relative);assertMutableSource(dest.relative);
    const bytes=await readFile(source.absolute);if(sha(bytes)!==expectedSha256||session.reads[alias]?.[source.relative]!==expectedSha256) fail('SHA_CONFLICT','source changed');
    if(existsSync(dest.absolute)) fail('DESTINATION_EXISTS','destination exists');await mkdir(resolve(dest.absolute,'..'),{recursive:true});await rename(source.absolute,dest.absolute);return {from:source.relative,to:dest.relative};
  }
  async trash(sessionId,alias,path,expectedSha256) {
    const session=await this.requireSession(sessionId,alias,true),repo=this.repo(alias),target=await safePath(repo.root,path,this.config.toolRoot);
    assertMutableSource(target.relative);
    const bytes=await readFile(target.absolute);if(sha(bytes)!==expectedSha256||session.reads[alias]?.[target.relative]!==expectedSha256) fail('SHA_CONFLICT','source changed');
    const recoveryId=randomUUID();await copyFile(target.absolute,join(this.state,'trash',recoveryId));await rm(target.absolute);return {path:target.relative,recoveryId};
  }
  async git(alias,operation,paths=[]) {
    const repo=this.repo(alias);if(!['status','diff','diff-check'].includes(operation))fail('INVALID_GIT_OPERATION',operation);
    const safe=[];for(const path of paths)safe.push((await safePath(repo.root,path,this.config.toolRoot)).relative);
    if(operation!=='status'&&!safe.length)fail('PATHS_REQUIRED','diff needs explicit paths');
    const args=['-C',repo.root,...(operation==='status'?['status','--short']:['diff',...(operation==='diff-check'?['--check']:[]),'--',...safe])];return command('git',args,repo.root);
  }
  listTasks() { return {tasks:this.config.tasks.map(task=>({taskId:task.id,purpose:task.purpose??`Configured ${task.kind} task`,kind:task.kind,alias:task.alias}))}; }
  async startJob(sessionId,taskId) {
    const task=this.config.tasks.find(x=>x.id===taskId);if(!task)fail('UNKNOWN_TASK',taskId);
    const session=await this.requireSession(sessionId,task.alias,true);const id=randomUUID(),logPath=join(this.state,'logs',`${id}.txt`),recordPath=join(this.state,'jobs',`${id}.json`);
    const job={id,taskId,kind:task.kind,alias:task.alias,status:'running',started:new Date().toISOString()};await atomicJson(recordPath,job);
    if(task.unity){
      void (async()=>{
        try { await this.unity.run(sessionId,task,job,recordPath); }
        catch(error){job.status='failed';job.failureType=error.message.startsWith('UNITY_PROJECT_BUSY')?'unity-project-busy':error.message.startsWith('UNITY_PREFLIGHT_MISSING')?'unity-preflight-failure':'unity-infrastructure-failure';job.error=redact(error.message);}
        finally{job.completed=new Date().toISOString();await atomicJson(recordPath,job);await this.recordValidation(sessionId,{jobId:id,taskId,alias:task.alias,status:job.status,failureType:job.failureType??null}).catch(()=>{});}
      })();
      return job;
    }
    return this.launchJob(sessionId,task,job,recordPath);
  }
  async launchJob(sessionId,task,job,recordPath=join(this.state,'jobs',`${job.id}.json`)){
    const id=job.id,logPath=job.logPath??join(this.state,'logs',`${id}.txt`);
    Object.assign(job,{runner:'project-worker-v1',sessionId,startedAt:job.started,logPath,cancelPath:join(this.state,'jobs',`${id}.cancel`),timeoutSeconds:task.timeoutSeconds??1800,lastActivityAt:job.started,lastHeartbeatAt:job.started,stage:'queued',exitCode:null});
    const launchPath=join(this.state,'jobs',`${id}.launch.json`);
    await writeFile(logPath,'');
    await atomicJson(launchPath,{executable:task.executable,args:task.args,cwd:task.resolvedCwd,env:safeEnvironment()});
    await atomicJson(recordPath,job);
    const supervisorLog=await open(logPath,'a');
    const worker=spawn(process.execPath,[fileURLToPath(new URL('./project-job-worker.js',import.meta.url)),recordPath,launchPath],{cwd:task.resolvedCwd,shell:false,windowsHide:true,detached:true,stdio:['ignore',supervisorLog.fd,supervisorLog.fd]});
    await supervisorLog.close();
    worker.once('error',async error=>{Object.assign(job,{status:'failed',failureType:'infrastructure_error',error:redact(error.message),completedAt:new Date().toISOString()});await atomicJson(recordPath,job);});
    worker.unref();
    return job;
  }
  async getJob(id) {
    if(!/^[0-9a-f-]{36}$/.test(id))fail('INVALID_JOB_ID','invalid job ID');
    const job=await json(join(this.state,'jobs',`${id}.json`));if(!job)fail('JOB_NOT_FOUND',id);
    if(job.runner==='project-worker-v1'&&job.status==='running'&&Date.now()-Date.parse(job.lastHeartbeatAt)>15000){
      let alive=false;try{process.kill(job.workerPid,0);alive=true;}catch{}
      if(!alive)Object.assign(job,{status:'orphaned',failureType:'infrastructure_error',error:`Supervisor stopped at ${job.stage}; process cleanup cannot be confirmed`});
    }
    const tail=await this.jobLogTail(id,30,3000,job);
    return {...job,durationMs:job.durationMs??Math.max(0,Date.parse(job.completedAt??job.completed??new Date().toISOString())-Date.parse(job.startedAt??job.started)),logTail:tail.logTail};
  }
  async jobLogTail(id,lines=200,maxChars=7000,record){
    if(!/^[0-9a-f-]{36}$/.test(id))fail('INVALID_JOB_ID','invalid job ID');
    const job=record??await json(join(this.state,'jobs',`${id}.json`));if(!job)fail('JOB_NOT_FOUND',id);
    const path=job.logPath??join(this.state,'logs',`${id}.txt`);
    // 只讀尾端，不隨完整 log 大小增加記憶體或回應尺寸。
    const {open}=await import('node:fs/promises');let log='';
    try{const handle=await open(path,'r');try{const size=(await handle.stat()).size,buffer=Buffer.alloc(Math.min(size,32768));await handle.read(buffer,0,buffer.length,Math.max(0,size-buffer.length));log=buffer.toString('utf8');}finally{await handle.close();}}catch(error){if(error.code!=='ENOENT')throw error;}
    let selected=redact(log).split(/\r?\n/).slice(-lines).join('\n').slice(-maxChars);
    while(JSON.stringify(selected).length>18000)selected=selected.slice(Math.ceil(selected.length/4));
    return {jobId:id,linesReturned:selected?selected.split('\n').length:0,logTail:selected};
  }
  async cancelJob(id){
    const job=await this.getJob(id);
    if(job.status!=='running')return job;
    if(job.runner==='project-worker-v1'){
      await writeFile(job.cancelPath,new Date().toISOString());
      const deadline=Date.now()+10000;
      while(Date.now()<deadline){const current=await this.getJob(id);if(current.status!=='running')return current;await new Promise(resolve=>setTimeout(resolve,100));}
      return {...await this.getJob(id),cancellationPending:true};
    }
    this.unity.cancel(id);return this.getJob(id);
  }
}
