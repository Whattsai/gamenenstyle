import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { configureTunnelProfile } from '../scripts/configure-tunnel-profile.js';

const toolRoot=fileURLToPath(new URL('../',import.meta.url));
const envText=await readFile(join(toolRoot,'.env'),'utf8').catch(()=>'');
const binary=process.env.PROJECT_TUNNEL_CLIENT_PATH || envText.match(/^PROJECT_TUNNEL_CLIENT_PATH=["']?([^\r\n"']+)/m)?.[1];

// 使用真正的官方 binary 與 MCP server，只替換 control plane；不接觸正式 tunnel。
async function harness(shim){
  const dir=await mkdtemp(join(tmpdir(),'mcp-tunnel-init-'));
  const pending=[],waiting=new Map();let serial=0,polls=0,logs='',outage=false,outagePolls=0,healthURL;
  const http=createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json');
    if(req.url.includes('/poll')){
      polls++;
      if(outage){outagePolls++;res.statusCode=503;res.end('{}');return;}
      if(!pending.length)await new Promise(r=>setTimeout(r,20));
      res.end(JSON.stringify({commands:pending.splice(0,20)}));
    }else if(req.url.endsWith('/response')){
      let body='';for await(const chunk of req)body+=chunk;
      const value=JSON.parse(body);
      if(value.resp_type!=='jsonrpc_notify')waiting.get(value.request_id)?.(value);
      res.end('{}');
    }else res.end('{}');
  });
  http.listen(0,'127.0.0.1');await once(http,'listening');
  const config=join(dir,'brickhigh-local.yaml'),healthFile=join(dir,'health-url');
  const serverPath=resolve(toolRoot,'src/index.js');
  await writeFile(config,YAML.stringify({config_version:1,control_plane:{base_url:`http://127.0.0.1:${http.address().port}`,tunnel_id:'tunnel_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',api_key:'test-only-not-a-real-key'},health:{listen_addr:'127.0.0.1:0',url_file:healthFile},log:{level:'error',format:'json'},mcp:{commands:[{channel:'main',command:`node ${serverPath.replaceAll('\\','/')}`}],stdio_send_initialized_notification:false}}));
  if(shim)await configureTunnelProfile(config,'brickhigh-local',serverPath);
  const childEnv={...process.env,CONTROL_PLANE_API_KEY:'test-only-not-a-real-key'};
  delete childEnv.MCP_STDIO_SEND_INITIALIZED_NOTIFICATION;
  const child=spawn(binary,['run','--config',config],{cwd:toolRoot,windowsHide:true,env:childEnv});
  child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
  const stop=async()=>{
    if(child.exitCode===null){
      if(process.platform==='win32'){const kill=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true});await once(kill,'exit');}
      else child.kill('SIGTERM');
      await Promise.race([once(child,'exit'),new Promise(r=>setTimeout(r,1000))]);
    }
    http.closeAllConnections();await new Promise(r=>http.close(r));
    await rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:100});
  };
  try{
    const until=Date.now()+15000;let ready=false;
    while(child.exitCode===null&&Date.now()<until){
      try{
        healthURL=(await readFile(healthFile,'utf8')).trim();
        const health=await fetch(`${healthURL}/readyz`);
        ready=polls>0&&health.ok;
        if(ready)break;
      }catch{}
      await new Promise(r=>setTimeout(r,25));
    }
    assert.ok(ready,`tunnel 子程序沒有就緒: ${logs.slice(-3000)}`);
  }catch(error){await stop();throw error;}
  return {stop,async snapshot(){return await fetch(`${healthURL}/health/mcp`).then(r=>r.json());},async reconnectPolling(){
    const before=outagePolls;outage=true;
    const until=Date.now()+3000;
    while(outagePolls===before&&Date.now()<until)await new Promise(r=>setTimeout(r,25));
    outage=false;assert.ok(outagePolls>before,'必須確實經歷 polling 503');
  },async request(method,params){
    const id=String(++serial);
    return await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{waiting.delete(id);reject(Error(`request ${method} 逾時: ${logs.slice(-2000)}`));},15000);
      waiting.set(id,value=>{clearTimeout(timeout);waiting.delete(id);resolve(value);});
      pending.push({request_id:id,shard_token:'isolated-test',command_type:'jsonrpc',channel:'main',created_at:new Date().toISOString(),headers:{},response_timeout:'10s',jsonrpc:{jsonrpc:'2.0',...(method.startsWith('notifications/')?{}:{id}),method,...(params?{params}:{})}});
    });
  }};
}
const initialize={protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'isolated-reconnect-test',version:'1'}};
const reads=[
  ['get_active_workspace_session',{}],
  ['inspect_git_changes',{alias:'main',operation:'status'}],
  ['read_workspace_text_chunk',{alias:'main',path:'brickhigh/docs/tdd/SPEC-001-BrickModelCatalog-TDD.md',offset:0,max_bytes:131072}],
  ['read_workspace_text_chunk',{alias:'main',path:'brickhigh/GEMINI.md',offset:0,max_bytes:131072}],
];
function success(value){assert.ok(value.resp_json?.result,JSON.stringify(value));assert.equal(value.resp_json.error,undefined,JSON.stringify(value));assert.notEqual(value.resp_json.result.isError,true,JSON.stringify(value));}

test('官方 tunnel：重現缺少 initialized 通知時的 -32002，完整握手後恢復',{skip:!binary,timeout:45000},async()=>{
  const h=await harness(false);try{
    success(await h.request('initialize',initialize));
    const blocked=await h.request('tools/call',{name:reads[0][0],arguments:{}});
    assert.equal(blocked.resp_json.error.code,-32002);
    assert.equal(blocked.resp_json.error.data.error_type,'mcp_initialization_required');
    await h.request('notifications/initialized');
    success(await h.request('tools/call',{name:reads[0][0],arguments:{}}));
  }finally{await h.stop();}
});

test('官方 tunnel：相容通知、多輪重新初始化、連續及並行讀取、實體重連',{skip:!binary,timeout:90000},async()=>{
  for(let connection=0;connection<2;connection++){
    const h=await harness(true);try{
      const before=await h.request('tools/list');assert.equal(before.resp_json.error.code,-32002);
      const invalid=await h.request('initialize',{protocolVersion:'2025-11-25'});
      assert.ok(invalid.resp_json.error);
      assert.equal((await h.request('tools/list')).resp_json.error.code,-32002);
      for(let round=0;round<4;round++){
        success(await h.request('initialize',initialize));
        const initialized=await h.snapshot();
        // 刻意不送 initialized：必須由官方相容選項在釋放初始化鎖前補送。
        for(const [name,args] of reads)success(await h.request('tools/call',{name,arguments:args}));
        const batch=await Promise.all(reads.map(([name,args])=>h.request('tools/call',{name,arguments:args})));
        batch.forEach(success);
        await h.request('notifications/initialized');
        success(await h.request('tools/list'));
        await h.reconnectPolling();
        success(await h.request('tools/call',{name:reads[0][0],arguments:{}}));
        const reconnected=await h.snapshot();
        assert.ok(['initialized','discovered'].includes(reconnected.state));
        assert.equal(reconnected.details.initialize.ok,true);
        assert.equal(reconnected.details.child_generation,initialized.details.child_generation);
        assert.equal(reconnected.details.initialize_epoch,initialized.details.initialize_epoch);
        // 模擬不同邏輯連線同時送入新握手及工具，不能在重設與通知之間留下空窗。
        const interleaved=await Promise.all([
          h.request('initialize',initialize),
          ...reads.map(([name,args])=>h.request('tools/call',{name,arguments:args})),
        ]);
        interleaved.forEach(success);
      }
    }finally{await h.stop();}
  }
});
