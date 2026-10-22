import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { safeEnvironment } from '../src/core.js';
import { loadConfig } from '../src/config.js';

test('MCP Python parent and nested CLI retain UTF-8 without caller environment injection',()=>{
  const env=safeEnvironment();
  assert.equal(env.PYTHONUTF8,'1');
  assert.equal(env.PYTHONIOENCODING,'utf-8');
  const code="import subprocess,sys; print(sys.flags.utf8_mode); subprocess.run([sys.executable,'-c',\"print('中文🧱')\"],check=True)";
  const r=spawnSync(loadConfig().pythonTests.executable,['-c',code],{env,encoding:'utf8',shell:false,windowsHide:true});
  assert.equal(r.status,0,r.stderr);
  assert.match(r.stdout,/中文🧱/);
  assert.match(r.stdout,/1/);
});
