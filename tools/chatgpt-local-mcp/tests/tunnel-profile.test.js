import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import YAML from 'yaml';
import { configureTunnelProfile } from '../scripts/configure-tunnel-profile.js';

async function fixture(fn){
  const dir=await mkdtemp(join(tmpdir(),'tunnel-profile-'));
  try{
    const file=join(dir,'quartz-local.yaml'),server=resolve(dir,'index.js');
    const profile={config_version:1,control_plane:{api_key:'env:CONTROL_PLANE_API_KEY',tunnel_id:'tunnel_test'},mcp:{commands:[{channel:'main',command:`node ${server.replaceAll('\\','/')}`}],max_concurrent_requests:10},health:{listen_addr:'127.0.0.1:18081'}};
    await writeFile(file,'# 保留既有註解\n'+YAML.stringify(profile));
    await fn({file,server,profile});
  }finally{await rm(dir,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
}

test('既有 profile 只增加官方通知設定、保留其他設定與註解，重跑不改 bytes',()=>fixture(async({file,server,profile})=>{
  assert.deepEqual(await configureTunnelProfile(file,'quartz-local',server),{changed:true});
  const text=await readFile(file,'utf8');assert.match(text,/# 保留既有註解/);
  const value=YAML.parse(text);assert.equal(value.mcp.stdio_send_initialized_notification,true);
  delete value.mcp.stdio_send_initialized_notification;assert.deepEqual(value,profile);
  assert.deepEqual(await configureTunnelProfile(file,'quartz-local',server),{changed:false});
  assert.equal(await readFile(file,'utf8'),text);
}));

test('拒絕其他專案 profile 與不相符 stdio target，不修改內容',()=>fixture(async({file,server})=>{
  const before=await readFile(file,'utf8');
  await assert.rejects(configureTunnelProfile(file,'another-local',server),/PROJECT_MISMATCH/);
  await assert.rejects(configureTunnelProfile(file,'quartz-local',`${server}.other`),/TARGET_MISMATCH/);
  assert.equal(await readFile(file,'utf8'),before);
}));

test('拒絕重複 YAML key、非 stdio 或多 channel profile，不修改內容',()=>fixture(async({file,server,profile})=>{
  for(const text of ['mcp: {}\nmcp: {}\n',YAML.stringify({...profile,mcp:{server_urls:[{url:'https://example.invalid'}]}}),YAML.stringify({...profile,mcp:{commands:[...profile.mcp.commands,...profile.mcp.commands]}})]){
    await writeFile(file,text);
    await assert.rejects(configureTunnelProfile(file,'quartz-local',server),/INVALID_YAML|TARGET_MISMATCH/);
    assert.equal(await readFile(file,'utf8'),text);
  }
}));

test('既有啟動腳本在 Init／Run 保存相容設定，Run 明確使用官方 flag',async()=>{
  const script=await readFile(new URL('../scripts/tunnel.ps1',import.meta.url),'utf8');
  assert.match(script,/configure-tunnel-profile\.js/);
  assert.match(script,/run --profile \$profile --mcp\.stdio-send-initialized-notification=true/);
});
