import {test} from 'node:test';import assert from 'node:assert/strict';import {resolveInstance,parseLocalArgs,invocation,backupPath,restoreTarget,withPausedControl} from '../local-policy.mjs';import {shutdownLocal} from '../restart-local.mjs';
test('PF-UT-070 instances resolve independently of cwd',()=>{
 const a=resolveInstance('default');assert.match(a.cwd,/datinghigh[\\/]cloudflare$/);assert.equal(a.state,`${a.cwd}/.wrangler/state`);
 assert.throws(()=>resolveInstance('../../other'));assert.throws(()=>resolveInstance('production'));
});
test('PF-UT-071 reject remote flags, arbitrary configs and unsafe aliases',()=>{
 for(const argv of [['--remote'],['--config','evil'],['--view','accounts;delete'],['--instance','../x'],['--remote=true'],['--file','a','--file','b']])assert.throws(()=>parseLocalArgs('query',argv));
 assert.deepEqual(parseLocalArgs('query',['--view','accounts']),{instance:'default',view:'accounts'});
 assert.deepEqual(parseLocalArgs('query',['--view','avatar-reset-targets']),{instance:'default',view:'avatar-reset-targets'});
 assert.throws(()=>parseLocalArgs('query',['--view','avatar-reset-targets;delete']));
 assert.deepEqual(parseLocalArgs('dev-stop',[]),{instance:'default'});assert.throws(()=>parseLocalArgs('dev-stop',['--remote']));
});
test('PF-UT-075 local platform stop requires fixed loopback control and waits for the listener to close',async()=>{
 const control={port:9123,token:'a'.repeat(64)},calls=[];let probes=0;
 const result=await shutdownLocal(control,{fetcher:async(url,options)=>{calls.push([url,options.method,options.headers.Authorization]);return{status:200};},isStopped:async()=>++probes===2,sleep:async()=>{}});
 assert.deepEqual(result,{stopped:true});assert.deepEqual(calls,[[`http://127.0.0.1:9123/shutdown`,'POST',`Bearer ${control.token}`]]);
 await assert.rejects(shutdownLocal({...control,port:80},{fetcher:async()=>({status:200})}),/Invalid local platform control/);
 await assert.rejects(shutdownLocal(control,{fetcher:async()=>({status:403}),isStopped:async()=>true}),/Local platform shutdown failed/);
});
test('PF-UT-072 migrate/query/export use one fixed cwd and explicit local binding',()=>{
 const instance=resolveInstance('default');for(const cmd of ['migrate','query','backup']){const i=invocation(cmd,instance,{view:'accounts',output:'safe.sql'});assert.equal(i.cwd,instance.cwd);assert.ok(i.args.includes('--local'));assert.ok(i.args.includes('DB'));}
 const targets=invocation('query',instance,{view:'avatar-reset-targets'});assert.equal(targets.cwd,instance.cwd);assert.ok(targets.args.includes('--local'));assert.ok(targets.args.includes('DB'));assert.ok(targets.args.some(arg=>arg.includes("kind='generated_avatar'")));assert.ok(targets.args.some(arg=>arg.includes('active_round_count')));assert.ok(!targets.args.some(arg=>arg.includes('email_normalized')));
});
test('PF-UT-073 unsafe backup names cannot escape ignored directory',()=>{for(const name of ['../a','a.sql','a b','x;del',''])assert.throws(()=>backupPath(name));assert.match(backupPath('before-migration'),/\.local[\\/]backups[\\/]before-migration\.sql$/);});
test('PF-UT-074 restore only permits an empty bounded local instance',()=>{
 for(const name of ['default','staging','production','../other'])assert.throws(()=>restoreTarget(name,()=>false));assert.throws(()=>restoreTarget('existing',()=>true));assert.match(restoreTarget('new-copy',()=>false).cwd,/\.local[\\/]instances[\\/]new-copy$/);
});
test('PF-UT-075 export waits for paused writes and resumes after success or failure',async()=>{
 const calls=[];let resumePause;const ready=new Promise(r=>{resumePause=r;});const job=withPausedControl(true,async()=>{calls.push('export');return 'snapshot';},async action=>{calls.push(action);if(action==='pause')await ready;});
 assert.deepEqual(calls,['pause']);resumePause();assert.equal(await job,'snapshot');assert.deepEqual(calls,['pause','export','resume']);
 calls.length=0;await assert.rejects(withPausedControl(true,async()=>{calls.push('export');throw new Error('controlled export failure');},async action=>{calls.push(action);}));assert.deepEqual(calls,['pause','export','resume']);
});
test('stale control recovery requires proof that no local writer is listening and never retries an executed action',async()=>{
 let calls=0,resumed=0;const signal=async operation=>{if(operation==='pause')throw Object.assign(new Error('offline'),{code:'ECONNREFUSED'});resumed++;};
 await assert.rejects(withPausedControl(true,async()=>{calls++;},signal));assert.equal(calls,0);
 await withPausedControl(true,async()=>{calls++;},signal,async()=>true);assert.equal(calls,1);assert.equal(resumed,0);
 await assert.rejects(withPausedControl(true,async()=>{calls++;},signal,async()=>false));assert.equal(calls,1);
});
