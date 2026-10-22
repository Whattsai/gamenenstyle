import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.js';
import { allToolNames } from '../src/capabilities.js';

test('正式來源匯入只有固定task，原MCP tools與保護不變',async()=>{
  const config=loadConfig();
  const task=config.tasks.find(x=>x.id==='brickhigh-gate3-source-onboard');
  assert.ok(task);
  assert.equal(task.timeoutSeconds,900);
  assert.equal(task.alias,'main');
  assert.equal(task.args.length,1);
  assert.match(task.args[0],/onboard-brickhigh-sources\.js$/);
  const code=await readFile(new URL('../scripts/onboard-brickhigh-sources.js',import.meta.url),'utf8');
  assert.match(code,/tools.catalog.source_onboarding/);
  assert.match(code,/process.argv.length/);
  assert.match(code,/shell:false/);
  assert.ok(!allToolNames(config).has('source_onboarding'));
  const core=await readFile(new URL('../src/core.js',import.meta.url),'utf8');
  assert.match(core,/SERVER_PATH_BLOCKED/);
});
