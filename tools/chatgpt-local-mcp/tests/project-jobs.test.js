import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProjectService } from '../src/core.js';

async function fixture(source, timeoutSeconds=10) {
  const root=await mkdtemp(join(tmpdir(),'player-job-'));
  const config={runtimeRoot:root,projectId:'job-test',tasks:[{id:'probe',kind:'test',alias:'main',executable:process.execPath,args:['-e',source],resolvedCwd:root,timeoutSeconds}]};
  const service=new ProjectService(config);await service.init();
  service.requireSession=async()=>({id:'session'});
  const job=await service.startJob('session','probe');
  return {root,config,service,id:job.id};
}
async function until(service,id,predicate,timeout=10000){
  const deadline=Date.now()+timeout;
  while(Date.now()<deadline){const job=await service.getJob(id);if(predicate(job))return job;await new Promise(r=>setTimeout(r,40));}
  assert.fail(`Job ${id} did not reach expected state: ${JSON.stringify(await service.getJob(id))}`);
}
const done=job=>job.status!=='running';
async function cleanup(f){await f.service.cancelJob(f.id);await new Promise(r=>setTimeout(r,100));await rm(f.root,{recursive:true,force:true,maxRetries:10,retryDelay:100});}

test('stdout/stderr and progress persist while running; a new service can query and cancel',async()=>{
  const f=await fixture(`console.log('@@JOB '+JSON.stringify({stage:'load_model',timeoutSeconds:8,captureCount:7}));console.error('live diagnostic');setInterval(()=>{},1000)`);
  try{
    const live=await until(f.service,f.id,j=>j.stage==='load_model');
    assert.equal(live.status,'running');assert.equal(live.progress.captureCount,7);
    const disk=await readFile(live.logPath,'utf8');assert.match(disk,/live diagnostic/);assert.match(disk,/\[stderr\]/);
    assert.ok(live.lastActivityAt);assert.ok(live.lastHeartbeatAt);assert.ok(live.stageStartedAt);
    const reconnect=new ProjectService(f.config);await reconnect.init();
    assert.equal((await reconnect.getJob(f.id)).stage,'load_model');
    assert.match((await reconnect.jobLogTail(f.id)).logTail,/live diagnostic/);
    assert.equal((await reconnect.cancelJob(f.id)).status,'cancelled');
    const terminal=await reconnect.getJob(f.id);assert.equal(terminal.failureType,'cancelled');
    assert.equal((await reconnect.cancelJob(f.id)).status,'cancelled');
  }finally{await cleanup(f);}
});

test('cancellation terminates grandchildren and preserves cancelled after reconnect',async()=>{
  const f=await fixture(`const {spawn}=require('node:child_process');const c=spawn(process.execPath,['-e',"setInterval(()=>{},1000)"],{stdio:'inherit'});console.log('grandchild='+c.pid);setInterval(()=>{},1000)`);
  try{
    const job=await until(f.service,f.id,j=>/grandchild=\d+/.test(j.logTail));
    const pid=Number(/grandchild=(\d+)/.exec(job.logTail)[1]);
    const result=await new ProjectService(f.config).cancelJob(f.id);
    assert.equal(result.status,'cancelled');assert.equal(result.failedStage,'starting');
    assert.throws(()=>process.kill(pid,0));
    await new Promise(r=>setTimeout(r,350));assert.equal((await f.service.getJob(f.id)).status,'cancelled');
  }finally{await cleanup(f);}
});

test('phase deadline and overall timeout report the stuck stage',async()=>{
  for(const phase of [true,false]){
    const f=await fixture(`console.log('@@JOB '+JSON.stringify({stage:'screenshot',${phase?'timeoutSeconds:0.3':''}}));setInterval(()=>{},1000)`,phase?8:1);
    try{const job=await until(f.service,f.id,done);assert.equal(job.status,'timed_out');assert.equal(job.failureType,'timeout');assert.equal(job.failedStage,'screenshot');assert.match(job.error,/screenshot/);}finally{await cleanup(f);}
  }
});

test('spawn error and nonzero exit keep explicit reasons',async()=>{
  const f=await fixture(`console.error('bad fixture');process.exit(9)`);
  try{const job=await until(f.service,f.id,done);assert.equal(job.status,'failed');assert.equal(job.exitCode,9);assert.match(job.error,/code 9/);assert.match(job.logTail,/bad fixture/);}finally{await cleanup(f);}
  const g=await fixture(`setInterval(()=>{},1000)`);
  try{
    await until(g.service,g.id,j=>!!j.pid);await g.service.cancelJob(g.id);
    g.config.tasks[0].executable=join(g.root,'missing.exe');
    const next=await g.service.startJob('session','probe');g.id=next.id;
    const job=await until(g.service,g.id,done);assert.equal(job.status,'failed');assert.equal(job.failureType,'environment_missing');assert.match(job.error,/ENOENT/);
  }finally{await cleanup(g);}
});

test('large logs stay queryable and do not kill a healthy job; legacy txt tail remains supported',async()=>{
  const f=await fixture(`process.stdout.write('x'.repeat(2100000));console.log('\\nfinished');`);
  try{
    const job=await until(f.service,f.id,done);assert.equal(job.status,'succeeded');assert.match(job.logTail,/finished/);
    assert.ok(JSON.stringify(job).length<24000);
    const tail=await f.service.jobLogTail(f.id,1000);assert.ok(JSON.stringify(tail).length<24000);
    const recordPath=join(f.service.state,'jobs',f.id+'.json');
    await writeFile(recordPath,JSON.stringify({id:f.id,status:'failed',started:job.started}));
    assert.match((await f.service.jobLogTail(f.id)).logTail,/finished/);
  }finally{await cleanup(f);}
});
