import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, cp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { loadConfig } from '../src/config.js';
import { ProjectService, safePath } from '../src/core.js';
import { OptionalModules } from '../src/modules.js';
import { allToolNames, toolNames } from '../src/capabilities.js';
import { DotnetService, buildVstestFilter, parseLogErrors, parseTrxDirectory, summarizeJob } from '../src/dotnet.js';
import { build, validate } from '../scripts/plugin.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const template=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function fixture(){
  const base=await mkdtemp(join(tmpdir(),'quartz-mcp-')),project=join(base,'quartz'),tool=join(project,'tools','chatgpt-local-mcp');
  await mkdir(project,{recursive:true});
  await cp(template,tool,{recursive:true,filter:path=>!path.includes('node_modules')&&!path.includes('plugin-build')});
  await mkdir(join(project,'.agents','skills','demo','references'),{recursive:true});
  await writeFile(join(project,'AGENTS.md'),'# Quartz project\n');
  await writeFile(join(project,'.agents','skills','demo','SKILL.md'),'---\nname: demo\ndescription: Demonstrate the Quartz workflow.\n---\n\nRead [guide](references/guide.md).\n');
  await writeFile(join(project,'.agents','skills','demo','references','guide.md'),'Quartz guide\n');
  const git=spawnSync('git',['init'],{cwd:project,encoding:'utf8'});assert.equal(git.status,0,git.stderr);
  const config={schemaVersion:1,projectId:'quartz-local',projectRoot:'../..',runtimeRoot:join(base,'runtime'),identity:[{path:'AGENTS.md',contains:'Quartz project'}],repos:[{alias:'main',path:'.',requiredInstructions:['AGENTS.md']}],skills:{root:'.agents/skills',selected:[{name:'demo',requiredTools:['get_active_workspace_session','resolve_workspace_session','begin_workspace_session','read_workspace_text','apply_workspace_patch','list_project_tasks','start_project_job']}]},tasks:[{id:'build-demo',purpose:'Build the Quartz demo.',kind:'build',alias:'main',executable:process.execPath,args:['-e',"console.log('Quartz build passed')"],cwd:'.'}],dotnet:{enabled:false,executable:'',targets:[]},modules:{web:{enabled:false,allowedOrigins:[]},android:{enabled:false,adbExecutable:''},offlineMedia:{enabled:false,transcriberExecutable:'',args:[]}},plugin:{name:'quartz-local'}};
  const configPath=join(tool,'config','project.json');await writeFile(configPath,JSON.stringify(config,null,2));
  return {base,project,tool,config,configPath,loaded:loadConfig(configPath)};
}
test('copied template uses the target project, enforces gates, and isolates state',async()=>{
  const f=await fixture();try{
    assert.equal(f.loaded.projectId,'quartz-local');assert.ok(!toolNames(f.loaded).has('web_browser_action'));assert.ok(!toolNames(f.loaded).has('android_device_action'));assert.ok(!toolNames(f.loaded).has('transcribe_local_media'));
    const service=new ProjectService(f.loaded);await service.init();
    assert.deepEqual(service.listTasks(),{tasks:[{taskId:'build-demo',purpose:'Build the Quartz demo.',kind:'build',alias:'main'}]});
    assert.doesNotMatch(JSON.stringify(service.listTasks()),/console\.log|executable|args/);
    const session=await service.begin(['main']);
    await assert.rejects(service.patch({sessionId:session.id,alias:'main',path:'note.md',expectedSha256:null,createContent:'hello'}),/AGENT_INSTRUCTIONS_NOT_READ/);
    await service.read('main','AGENTS.md',session.id);
    await assert.rejects(service.read('main','tools/chatgpt-local-mcp/config/project.json',session.id),/SERVER_PATH_BLOCKED/);
    const created=await service.patch({sessionId:session.id,alias:'main',path:'note.md',expectedSha256:null,createContent:'hello'});
    await assert.rejects(service.patch({sessionId:session.id,alias:'main',path:'note.md',expectedSha256:created.sha256,changes:[{search:'hello',replace:'goodbye'}]}),/SHA_CONFLICT/);
    const prior=await service.read('main','note.md',session.id);await writeFile(join(f.project,'note.md'),'external change');
    await assert.rejects(service.patch({sessionId:session.id,alias:'main',path:'note.md',expectedSha256:prior.sha256,changes:[{search:'hello',replace:'goodbye'}]}),/SHA_CONFLICT/);
    await service.read('main','note.md',session.id);const current=await service.read('main','note.md',session.id);
    await service.patch({sessionId:session.id,alias:'main',path:'note.md',expectedSha256:current.sha256,changes:[{search:'external change',replace:'safe change'}]});
    await assert.rejects(safePath(f.project,'../escape.md'),/PATH_TRAVERSAL/);
    await assert.rejects(safePath(f.project,'.env'),/SENSITIVE_PATH/);
    const job=await service.startJob(session.id,'build-demo');let finished;for(let i=0;i<30;i++){finished=await service.getJob(job.id);if(finished.status!=='running')break;await new Promise(r=>setTimeout(r,100));}
    assert.equal(finished.status,'succeeded');assert.match(finished.logTail,/Quartz build passed/);
    assert.equal((await service.end(session.id)).changes.main.changedSinceStart,true);
    assert.ok(service.state.startsWith(f.config.runtimeRoot));
  }finally{await rm(f.base,{recursive:true,force:true});}
});
test('invalid identity, missing tools, and independent plugin bundle fail closed',async()=>{
  const f=await fixture();try{
    const bad={...f.config,identity:[{path:'AGENTS.md',contains:'Other project'}]};await writeFile(f.configPath,JSON.stringify(bad));assert.throws(()=>loadConfig(f.configPath),/identity mismatch/);
    await writeFile(f.configPath,JSON.stringify(f.config));
    await mkdir(join(f.project,'.agents','skills','demo','node_modules','ignored'),{recursive:true});
    await mkdir(join(f.project,'.agents','skills','demo','coverage'),{recursive:true});
    await writeFile(join(f.project,'.agents','skills','demo','node_modules','ignored','package.js'),'ignored');
    await writeFile(join(f.project,'.agents','skills','demo','coverage','coverage.json'),'ignored');
    await writeFile(join(f.project,'.agents','skills','demo','.env'),'SECRET=ignored');
    await writeFile(join(f.project,'.agents','skills','demo','.env.example'),'SAFE=');
    await writeFile(join(f.project,'.agents','skills','demo','debug.log'),'ignored');
    f.loaded.skills.selected[0].requiredTools.push('missing_project_tool');
    await assert.rejects(build(f.loaded,'plugin_asdk_app_QUARTZ',join(f.config.runtimeRoot,'quartz-local','plugin-build','bad')), /unavailable tools/);
    f.loaded.skills.selected[0].requiredTools.pop();
    const output=join(f.config.runtimeRoot,'quartz-local','plugin-build','quartz-bundle');const result=await build(f.loaded,'plugin_asdk_app_QUARTZ',output);
    assert.equal(result.skillCount,1);assert.deepEqual(await validate(f.loaded,output),{plugin:'quartz-local',skillCount:1,valid:true});
    assert.match(await readFile(join(output,'skills','demo','references','guide.md'),'utf8'),/Quartz guide/);
    assert.equal(existsSync(join(output,'skills','demo','node_modules')),false);
    assert.equal(existsSync(join(output,'skills','demo','coverage')),false);
    assert.equal(existsSync(join(output,'skills','demo','.env')),false);
    assert.equal(existsSync(join(output,'skills','demo','debug.log')),false);
    assert.equal(existsSync(join(output,'skills','demo','.env.example')),true);
    assert.equal((await readFile(join(output,'.app.json'),'utf8')).includes('cedar-local'),false);
    await assert.rejects(build(f.loaded,'plugin_asdk_app_QUARTZ',output),/already exists/);
  }finally{await rm(f.base,{recursive:true,force:true});}
});
test('template supports masked session recovery with a new ID and cleared reads',async()=>{
  const f=await fixture();try{
    const service=new ProjectService(f.loaded);await service.init();assert.deepEqual(await service.getActive(),{state:'none',availableActions:[]});
    const opened=await service.begin(['main'],'Original task');await service.read('main','AGENTS.md',opened.id);
    const summary=await service.getActive();assert.equal(summary.state,'active');assert.equal(summary.taskSummary,'Original task');assert.equal(summary.requiredInstructions.completed,1);assert.equal('baseline' in summary,false);assert.equal('reads' in summary,false);
    await assert.rejects(service.resolveSession(randomUUID(),'release'),/SESSION_STATE_CHANGED/);
    const resumed=await service.resolveSession(opened.id,'resume');assert.notEqual(resumed.session.id,opened.id);await assert.rejects(service.requireSession(opened.id),/SESSION_INVALID/);await assert.rejects(service.requireSession(resumed.session.id,'main',true),/AGENT_INSTRUCTIONS_NOT_READ/);
    await service.resolveSession(resumed.session.id,'release');assert.deepEqual(await service.getActive(),{state:'none',availableActions:[]});
  }finally{await rm(f.base,{recursive:true,force:true});}
});
test('large instruction must be completely read; stdio advertises only enabled tools',async()=>{
  const f=await fixture();let client;try{
    await writeFile(join(f.project,'AGENTS.md'),`# Quartz project\n${'Instruction line.\n'.repeat(900)}`);
    const service=new ProjectService(f.loaded);await service.init();const session=await service.begin(['main']);
    await assert.rejects(service.read('main','AGENTS.md',session.id),/TEXT_TOO_LARGE/);
    const first=await service.readChunk('main','AGENTS.md',0,2048,session.id);
    await assert.rejects(service.patch({sessionId:session.id,alias:'main',path:'incomplete.md',expectedSha256:null,createContent:'bad'}),/AGENT_INSTRUCTIONS_NOT_READ/);
    let next=first;while(!next.eof)next=await service.readChunk('main','AGENTS.md',next.nextOffset,2048,session.id,first.sha256);
    await service.patch({sessionId:session.id,alias:'main',path:'complete.md',expectedSha256:null,createContent:'good'});await service.end(session.id);
    const transport=new StdioClientTransport({command:process.execPath,args:[join(template,'src','index.js')],cwd:template,env:{...process.env,PROJECT_MCP_CONFIG:f.configPath},stderr:'pipe'});
    client=new Client({name:'quartz-test',version:'1.0.0'},{capabilities:{}});await client.connect(transport);
    const tools=await client.listTools(),names=tools.tools.map(x=>x.name);assert.ok(names.includes('start_project_job'));assert.ok(names.includes('read_workspace_text_chunk'));assert.ok(!names.includes('web_browser_action'));assert.ok(!names.includes('android_device_action'));assert.ok(!names.includes('transcribe_local_media'));
    const overview=await client.callTool({name:'get_workspace_overview',arguments:{aliases:['main']}});assert.notEqual(overview.isError,true);
  }finally{await client?.close();await rm(f.base,{recursive:true,force:true});}
});
test('copy helper preserves existing files and refuses conflicting target content',async()=>{
  const base=await mkdtemp(join(tmpdir(),'quartz-copy-')),target=join(base,'quartz-target');
  try{
    await mkdir(target);assert.equal(spawnSync('git',['init'],{cwd:target,encoding:'utf8'}).status,0);
    const sourceScript=resolve(template,'..','..','scripts','copy-template.ps1');
    const installedScript=resolve(template,'..','..','.agents','skills','chatgpt-local-mcp-bootstrap','scripts','copy-template.ps1');
    const script=existsSync(sourceScript)?sourceScript:installedScript;
    const run=()=>spawnSync('powershell.exe',['-NoProfile','-File',script,'-TargetRepo',target],{encoding:'utf8'});
    const first=run();assert.equal(first.status,0,first.stderr);
    assert.equal((await readFile(join(target,'tools','chatgpt-local-mcp','package.json'),'utf8')).includes('@project/chatgpt-local-mcp'),true);
    assert.match(await readFile(join(target,'tools','chatgpt-local-mcp','.gitignore'),'utf8'),/\.env/);
    assert.match(await readFile(join(target,'tools','chatgpt-local-mcp','.env.example'),'utf8'),/PROJECT_TUNNEL_ID/);
    assert.equal((await readFile(join(target,'.agents','skills','chatgpt-local-mcp-bootstrap','SKILL.md'),'utf8')).includes('name: chatgpt-local-mcp-bootstrap'),true);
    await writeFile(join(target,'tools','chatgpt-local-mcp','package.json'),'conflict');
    const second=run();assert.notEqual(second.status,0);assert.match(second.stderr,/Existing file differs/);
    assert.equal(await readFile(join(target,'tools','chatgpt-local-mcp','package.json'),'utf8'),'conflict');
  }finally{await rm(base,{recursive:true,force:true});}
});
test('enabled modules register separately and offline media stays local',async()=>{
  const f=await fixture();let client,webServer,media;try{
    webServer=createServer((request,response)=>{response.setHeader('content-type','text/html');response.end('<body><button id="go" onclick="document.getElementById(\'value\').textContent=\'After\'">Go</button><p id="value">Before</p></body>');});
    await new Promise(resolve=>webServer.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${webServer.address().port}`;
    f.config.modules.web={enabled:true,allowedOrigins:[origin]};
    f.config.modules.android={enabled:true,adbExecutable:process.execPath};
    f.config.modules.offlineMedia={enabled:true,transcriberExecutable:process.execPath,args:['-e',"const fs=require('fs');fs.writeFileSync(process.argv[2],fs.readFileSync(process.argv[1],'utf8'))",'{input}','{output}']};
    await writeFile(f.configPath,JSON.stringify(f.config));const config=loadConfig(f.configPath),service=new ProjectService(config);await service.init();
    await writeFile(join(f.project,'sample.wav'),'Local transcript');const session=await service.begin(['main']);await service.read('main','AGENTS.md',session.id);
    media=new OptionalModules(config,service);const result=await media.transcribe(session.id,'main','sample.wav');assert.equal(result.text,'Local transcript');
    await assert.rejects(media.web(session.id,'main','navigate','https://outside.example/'),/WEB_ORIGIN_BLOCKED/);
    await assert.rejects(media.android(session.id,'main','foreground','bad serial'),/ANDROID_SERIAL_REQUIRED/);
    assert.match((await media.web(session.id,'main','navigate',origin)).snapshot,/Before/);
    assert.match((await media.web(session.id,'main','click',undefined,'#go')).snapshot,/After/);
    const shot=await media.web(session.id,'main','screenshot');assert.ok((await media.artifact(shot.artifactId)).length>100);
    const transport=new StdioClientTransport({command:process.execPath,args:[join(template,'src','index.js')],cwd:template,env:{...process.env,PROJECT_MCP_CONFIG:f.configPath},stderr:'pipe'});
    client=new Client({name:'quartz-module-test',version:'1.0.0'},{capabilities:{}});await client.connect(transport);
    const names=(await client.listTools()).tools.map(x=>x.name);for(const name of ['web_browser_action','read_web_artifact','close_web_browser','android_device_action','read_android_artifact','transcribe_local_media'])assert.ok(names.includes(name),name);
    await service.end(session.id);
  }finally{await client?.close();await media?.closeWeb();await new Promise(resolve=>webServer?.close(resolve)??resolve());await rm(f.base,{recursive:true,force:true});}
});
test('project IDs keep leases and Plugin mappings separate',async()=>{
  const f=await fixture();try{
    const first=new ProjectService(f.loaded);await first.init();const a=await first.begin(['main']);
    const secondConfig={...f.config,projectId:'quartz-second',plugin:{name:'quartz-second'}};await writeFile(f.configPath,JSON.stringify(secondConfig));const secondLoaded=loadConfig(f.configPath),second=new ProjectService(secondLoaded);await second.init();const b=await second.begin(['main']);
    assert.notEqual(first.state,second.state);assert.notEqual(a.id,b.id);
    const output=join(secondLoaded.runtimeRoot,'quartz-second','plugin-build','second');await build(secondLoaded,'plugin_asdk_app_SECOND',output);assert.equal((await validate(secondLoaded,output)).plugin,'quartz-second');
    await first.end(a.id);await second.end(b.id);
  }finally{await rm(f.base,{recursive:true,force:true});}
});
test('Desktop installer preserves another project marketplace entry',async()=>{
  const f=await fixture();try{
    await writeFile(join(f.project,'package.json'),JSON.stringify({name:'quartz',scripts:{build:'node --version',test:'node --version'}}));
    await writeFile(f.configPath,JSON.stringify({...f.config,tasks:[]}));
    const npmCli=resolve(dirname(process.execPath),'node_modules','npm','bin','npm-cli.js');const install=spawnSync(process.execPath,[npmCli,'ci','--ignore-scripts'],{cwd:f.tool,encoding:'utf8'});assert.equal(install.status,0,install.stderr);
    const bundle=join(f.config.runtimeRoot,'quartz-local','plugin-build','desktop');await build(f.loaded,'plugin_asdk_app_QUARTZ',bundle);
    const home=join(f.base,'desktop-home');await mkdir(join(home,'.agents','plugins'),{recursive:true});await mkdir(join(home,'.codex','plugins','cedar-local'),{recursive:true});await writeFile(join(home,'.codex','plugins','cedar-local','sentinel.txt'),'keep Cedar');
    await writeFile(join(home,'.agents','plugins','marketplace.json'),JSON.stringify({name:'personal',interface:{displayName:'Personal'},plugins:[{name:'cedar-local',source:{source:'local',path:'./.codex/plugins/cedar-local'}}]}));
    const script=join(f.tool,'scripts','install-desktop-plugin.ps1');const installed=spawnSync('powershell.exe',['-NoProfile','-File',script,'-Bundle',bundle],{cwd:f.tool,encoding:'utf8',env:{...process.env,USERPROFILE:home}});
    assert.equal(installed.status,0,installed.stderr);
    assert.deepEqual(JSON.parse(await readFile(f.configPath,'utf8')).tasks.map(task=>task.id),['quartz-build','quartz-test']);
    const marketplace=JSON.parse((await readFile(join(home,'.agents','plugins','marketplace.json'),'utf8')).replace(/^\uFEFF/,''));assert.deepEqual(marketplace.plugins.map(x=>x.name).sort(),['cedar-local','quartz-local']);
    assert.equal((await readFile(join(home,'.codex','plugins','quartz-local','.app.json'),'utf8')).includes('plugin_asdk_app_QUARTZ'),true);
    assert.equal(await readFile(join(home,'.codex','plugins','cedar-local','sentinel.txt'),'utf8'),'keep Cedar');
  }finally{await rm(f.base,{recursive:true,force:true});}
});
test('optional dotnet config validates allowlisted projects and advertises diagnostics only when enabled',async()=>{
  const f=await fixture();let client;try{
    await writeFile(join(f.project,'Demo.Tests.csproj'),'<Project Sdk="Microsoft.NET.Sdk"></Project>');
    f.config.dotnet={enabled:true,executable:process.execPath,targets:[{id:'demo-tests',alias:'main',relativeProjectPath:'Demo.Tests.csproj',allowedActions:['build','test','restore'],filterProfile:'xunit',defaultTimeoutSeconds:{build:30,test:60,restore:30}}]};
    await writeFile(f.configPath,JSON.stringify(f.config));const loaded=loadConfig(f.configPath);
    for(const name of ['start_dotnet_job','start_dependency_restore','get_job','get_job_summary','search_job_log','get_job_errors','get_job_log_tail','cancel_job'])assert.ok(allToolNames(loaded).has(name));
    assert.equal(buildVstestFilter({type:'fully-qualified-name',operator:'contains',value:'Demo.Tests|Injected'}),'FullyQualifiedName~Demo.Tests\\|Injected');
    const transport=new StdioClientTransport({command:process.execPath,args:[join(template,'src','index.js')],cwd:template,env:{...process.env,PROJECT_MCP_CONFIG:f.configPath},stderr:'pipe'});client=new Client({name:'quartz-dotnet-test',version:'1.0.0'},{capabilities:{}});await client.connect(transport);
    const tools=(await client.listTools()).tools;for(const name of ['get_active_workspace_session','resolve_workspace_session','list_project_tasks','start_dotnet_job','get_job','get_job_summary','get_job_errors','search_job_log']){const tool=tools.find(item=>item.name===name);assert.ok(tool,name);assert.ok(tool.outputSchema,`${name} output schema`);}
    const listed=(await client.callTool({name:'list_project_tasks',arguments:{}})).structuredContent;assert.deepEqual(listed.tasks,[{taskId:'build-demo',purpose:'Build the Quartz demo.',kind:'build',alias:'main'}]);assert.equal(tools.find(item=>item.name==='list_project_tasks').annotations.readOnlyHint,true);
    const summaryTool=tools.find(item=>item.name==='get_job_summary');assert.match(summaryTool.description,/poll/i);assert.deepEqual(Object.keys(summaryTool.outputSchema.properties).sort(),['durationMs','exitCode','failureType','filterSummary','status','testSummary']);
  }finally{await client?.close();await rm(f.base,{recursive:true,force:true});}
});
test('template parses multi-project TRX and structured .NET errors',async()=>{
  const root=await mkdtemp(join(tmpdir(),'quartz-trx-'));try{
    const make=(project,outcome)=>`<TestRun><Results><UnitTestResult testId="1" testName="Case" outcome="${outcome}" duration="00:00:00.100"><Output>${outcome==='Failed'?'<ErrorInfo><Message>boom</Message><StackTrace>at Demo.Case()</StackTrace></ErrorInfo>':''}</Output></UnitTestResult></Results><TestDefinitions><UnitTest id="1"><TestMethod codeBase="C:\\bin\\${project}.dll" className="Demo" name="Case" /></UnitTest></TestDefinitions><ResultSummary><Counters total="1" passed="${outcome==='Passed'?1:0}" failed="${outcome==='Failed'?1:0}" notExecuted="0" /></ResultSummary></TestRun>`;
    await writeFile(join(root,'one.trx'),make('One.Tests','Passed'));await writeFile(join(root,'two.trx'),make('Two.Tests','Failed'));const parsed=await parseTrxDirectory(root);assert.deepEqual({total:parsed.summary.total,passed:parsed.summary.passed,failed:parsed.summary.failed},{total:2,passed:1,failed:1});assert.equal(parsed.failedTests[0].project,'Two.Tests');
    const errors=parseLogErrors('A.cs(2,4): error CS0246: Missing [A.csproj]\nView.razor(3,1): error RZ10012: Bad [Web.csproj]\nerror NU1301: offline\nUnhandled exception. System.Exception: boom');assert.deepEqual(errors.map(x=>x.type),['compiler_error','razor_error','restore_error','runtime_exception']);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('successful filtered .NET run with zero tests reports no_tests_matched and the filter',async()=>{
  const f=await fixture();try{
    await writeFile(join(f.project,'Demo.Tests.csproj'),'<Project />');
    f.config.dotnet={enabled:true,executable:process.execPath,targets:[{id:'demo-tests',alias:'main',relativeProjectPath:'Demo.Tests.csproj',allowedActions:['test']}]};
    await writeFile(f.configPath,JSON.stringify(f.config));
    const loaded=loadConfig(f.configPath),service=new ProjectService(loaded);await service.init();
    const dotnet=new DotnetService(loaded,service);await dotnet.init();
    const filter={type:'name',operator:'equals',value:'NoSuchTest'};
    const started=await dotnet.start(loaded.dotnet.targets[0],'test',['-e','process.exit(0)','--'],30,filter);
    let job;for(let i=0;i<50;i++){job=await dotnet.read(started.id);if(job.status!=='running')break;await new Promise(resolve=>setTimeout(resolve,100));}
    assert.equal(job.status,'failed');assert.equal(job.exitCode,0);assert.equal(job.testSummary.total,0);
    assert.equal(job.failureType,'no_tests_matched');
    assert.deepEqual((await dotnet.summary(started.id)).filterSummary,filter);
    assert.equal((await dotnet.summary(started.id)).failureType,'no_tests_matched');
  }finally{await rm(f.base,{recursive:true,force:true});}
});
test('template job summary is lightweight, bounded, redacted, and optionally records terminal validation',async()=>{
  const f=await fixture();let client;try{
    await writeFile(join(f.project,'Demo.Tests.csproj'),'<Project Sdk="Microsoft.NET.Sdk"></Project>');
    f.config.dotnet={enabled:true,executable:process.execPath,targets:[{id:'demo-tests',alias:'main',relativeProjectPath:'Demo.Tests.csproj',allowedActions:['build','test','restore'],filterProfile:'xunit',defaultTimeoutSeconds:{build:30,test:60,restore:30}}]};
    await writeFile(f.configPath,JSON.stringify(f.config));const loaded=loadConfig(f.configPath),service=new ProjectService(loaded);await service.init();const dotnet=new DotnetService(loaded,service);await dotnet.init();
    const id=randomUUID(),logPath=join(service.state,'logs',`${id}.log`),diagnosticsPath=join(service.state,'diagnostics',`${id}.json`),job={id,target:'demo-tests',action:'test',kind:'dotnet-test',alias:'main',command:'node',args:[],status:'failed',createdAt:'2026-09-23T00:00:00.000Z',startedAt:'2026-09-23T00:00:01.000Z',completedAt:'2026-09-23T00:00:03.500Z',durationMs:2500,exitCode:1,timeoutSeconds:60,failureType:'test_failure',summary:'metadata-warning '.repeat(1250),logPath,diagnosticsPath,testSummary:{total:3,passed:1,failed:1,skipped:1,durationMs:300,projects:[{project:'Demo.Tests',total:3,passed:1,failed:1,skipped:1,durationMs:300}]}};
    await writeFile(join(service.state,'jobs',`${id}.json`),JSON.stringify(job));await writeFile(logPath,`${'warning fixture\n'.repeat(2000)}Password=supersecret\nlast line`);await writeFile(diagnosticsPath,'{"errors":[],"failedTests":[]}');
    const detailed=await dotnet.get(id);assert.ok(detailed.logTail.length<=4096);assert.ok(JSON.stringify(detailed,null,2).length<24000);assert.doesNotMatch(detailed.logTail,/supersecret/);
    assert.deepEqual(await dotnet.summary(id),{status:'failed',exitCode:1,durationMs:2500,failureType:'test_failure',testSummary:{total:3,passed:1,failed:1,skipped:1}});
    assert.equal(summarizeJob({...job,status:'running',completedAt:undefined,durationMs:undefined,exitCode:undefined,failureType:null},Date.parse('2026-09-23T00:00:05.000Z')).durationMs,4000);
    const transport=new StdioClientTransport({command:process.execPath,args:[join(template,'src','index.js')],cwd:template,env:{...process.env,PROJECT_MCP_CONFIG:f.configPath},stderr:'pipe'});client=new Client({name:'quartz-summary-test',version:'1.0.0'},{capabilities:{}});await client.connect(transport);
    const parse=result=>JSON.parse(result.content[0].text),opened=parse(await client.callTool({name:'begin_workspace_session',arguments:{aliases:['main']}}));
    const pure=parse(await client.callTool({name:'get_job_summary',arguments:{job_id:id}}));assert.deepEqual(Object.keys(pure).sort(),['durationMs','exitCode','failureType','status','testSummary']);
    await client.callTool({name:'get_job_summary',arguments:{job_id:id,session_id:opened.id}});const ended=parse(await client.callTool({name:'end_workspace_session',arguments:{session_id:opened.id,incomplete_items:[]}}));assert.equal(ended.validations.length,1);assert.equal(ended.validations[0].jobId,id);
  }finally{await client?.close();await rm(f.base,{recursive:true,force:true});}
});
test('multi-root skills configuration bundles and validates skills across multiple directories',async()=>{
  const f=await fixture();try{
    const secondSkillsRoot=join(f.project,'extra-skills');
    await mkdir(join(secondSkillsRoot,'extra-skill','references'),{recursive:true});
    await writeFile(join(secondSkillsRoot,'extra-skill','SKILL.md'),'---\nname: extra-skill\ndescription: Extra skill in second root.\n---\n\nRead [extra](references/extra.md).\n');
    await writeFile(join(secondSkillsRoot,'extra-skill','references','extra.md'),'Extra guide\n');
    f.config.skills={
      roots: ['.agents/skills', 'extra-skills'],
      selected: [
        { name: 'demo', requiredTools: ['get_active_workspace_session','begin_workspace_session','read_workspace_text','apply_workspace_patch','start_project_job'] },
        { name: 'extra-skill', requiredTools: ['get_active_workspace_session','begin_workspace_session','read_workspace_text'] }
      ]
    };
    await writeFile(f.configPath,JSON.stringify(f.config,null,2));
    const loaded=loadConfig(f.configPath);
    assert.equal(loaded.skillsRoots.length,2);
    const output=join(f.config.runtimeRoot,'quartz-local','plugin-build','multi-root-bundle');
    const result=await build(loaded,'plugin_asdk_app_QUARTZ',output);
    assert.equal(result.skillCount,2);
    assert.deepEqual(await validate(loaded,output),{plugin:'quartz-local',skillCount:2,valid:true});
    assert.match(await readFile(join(output,'skills','extra-skill','references','extra.md'),'utf8'),/Extra guide/);
  }finally{await rm(f.base,{recursive:true,force:true});}
});

test('configured job survives actual MCP disconnect, live queries and cancellation after reconnect',async()=>{
  const f=await fixture();let client,id;
  const parse=r=>{assert.notEqual(r.isError,true,JSON.stringify(r));return JSON.parse(r.content[0].text);};
  const connect=async()=>{
    const c=new Client({name:'reconnect-test',version:'1.0'});
    await c.connect(new StdioClientTransport({command:process.execPath,args:[join(template,'src','index.js')],cwd:template,env:{...process.env,PROJECT_MCP_CONFIG:f.configPath},stderr:'pipe'}));return c;
  };
  try{
    await writeFile(join(f.project,'Demo.Tests.csproj'),'<Project />');
    f.config.dotnet={enabled:true,executable:process.execPath,targets:[{id:'demo-tests',alias:'main',relativeProjectPath:'Demo.Tests.csproj',allowedActions:['test']}]};
    f.config.tasks[0].args=['-e',`console.log('@@JOB '+JSON.stringify({stage:'load_model',timeoutSeconds:20}));console.error('live stderr');setInterval(()=>{},1000)`];
    await writeFile(f.configPath,JSON.stringify(f.config));
    client=await connect();
    const session=parse(await client.callTool({name:'begin_workspace_session',arguments:{aliases:['main']}}));
    parse(await client.callTool({name:'read_workspace_text',arguments:{alias:'main',path:'AGENTS.md',session_id:session.id}}));
    id=parse(await client.callTool({name:'start_project_job',arguments:{session_id:session.id,task_id:'build-demo'}})).id;
    await client.close();client=await connect();
    let live;
    for(let i=0;i<50;i++){
      live=parse(await client.callTool({name:'get_project_job',arguments:{job_id:id}}));
      if(live.stage==='load_model')break;await new Promise(r=>setTimeout(r,50));
    }
    assert.equal(live.status,'running');assert.equal(live.stage,'load_model');assert.ok(live.lastActivityAt);
    const tail=parse(await client.callTool({name:'get_job_log_tail',arguments:{job_id:id,lines:10}}));assert.match(tail.logTail,/live stderr/);
    const cancelled=parse(await client.callTool({name:'cancel_project_job',arguments:{job_id:id}}));assert.equal(cancelled.status,'cancelled');
    await client.close();client=await connect();
    assert.equal(parse(await client.callTool({name:'get_project_job',arguments:{job_id:id}})).status,'cancelled');
  }finally{
    if(id&&client)await client.callTool({name:'cancel_project_job',arguments:{job_id:id}}).catch(()=>{});
    await client?.close();await new Promise(r=>setTimeout(r,200));await rm(f.base,{recursive:true,force:true,maxRetries:10,retryDelay:100});
  }
});
