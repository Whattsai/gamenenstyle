import{test}from'node:test';import assert from'node:assert/strict';import{watchWslEgress}from'../wsl-egress.mjs';
const listener=pid=>`LISTEN 0 4096 172.17.0.1:40001 0.0.0.0:* users:(("workerd",pid=${pid},fd=1))`;
function setup(run,read=async()=> ''){let tick,created=0,closed=0;const stop=watchWslEgress({pid:10,exitCode:null},{run,read,interval:fn=>{tick=fn;return 1;},clear:()=>{},createServer:()=>{created++;return{on(){return this;},listen(){},close(){closed++;}};}});return{stop,tick:()=>tick(),counts:()=>({created,closed})};}
test('PF-UT-075 a stopped relay watcher cannot bind a port after its pending scan finishes',async()=>{
 let finish;const pending=new Promise(resolve=>{finish=resolve;});const f=setup(()=>pending);const scan=f.tick();await Promise.resolve();f.stop();finish({stdout:listener(10)});await scan;assert.deepEqual(f.counts(),{created:0,closed:0});
});
test('PF-UT-075 repeated cleanup closes each owned relay once',async()=>{
 const f=setup(async()=>({stdout:listener(10)}));await f.tick();assert.equal(f.counts().created,1);f.stop();f.stop();assert.deepEqual(f.counts(),{created:1,closed:1});
});
test('PF-UT-068 loopback relays only expose workerd processes descended from this local runner',async()=>{
 const foreign=setup(async()=>({stdout:listener(999)}));await foreign.tick();assert.equal(foreign.counts().created,0);foreign.stop();
 const owned=setup(async()=>({stdout:listener(11)}),async name=>name.includes('/10/')?'11':'');await owned.tick();assert.equal(owned.counts().created,1);owned.stop();
});
