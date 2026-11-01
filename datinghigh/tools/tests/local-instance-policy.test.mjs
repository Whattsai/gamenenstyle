import {test} from 'node:test';import assert from 'node:assert/strict';import {resolveInstance,parseLocalArgs,invocation,backupPath,restoreTarget,withPausedControl} from '../local-policy.mjs';
test('PF-UT-070 instances resolve independently of cwd',()=>{
 const a=resolveInstance('default');assert.match(a.cwd,/datinghigh[\\/]cloudflare$/);assert.equal(a.state,`${a.cwd}/.wrangler/state`);
 assert.throws(()=>resolveInstance('../../other'));assert.throws(()=>resolveInstance('production'));
});
test('PF-UT-071 reject remote flags, arbitrary configs and unsafe aliases',()=>{
 for(const argv of [['--remote'],['--config','evil'],['--view','accounts;delete'],['--instance','../x'],['--remote=true'],['--file','a','--file','b']])assert.throws(()=>parseLocalArgs('query',argv));
 assert.deepEqual(parseLocalArgs('query',['--view','accounts']),{instance:'default',view:'accounts'});
});
test('PF-UT-072 migrate/query/export use one fixed cwd and explicit local binding',()=>{
 const instance=resolveInstance('default');for(const cmd of ['migrate','query','backup']){const i=invocation(cmd,instance,{view:'accounts',output:'safe.sql'});assert.equal(i.cwd,instance.cwd);assert.ok(i.args.includes('--local'));assert.ok(i.args.includes('DB'));}
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
