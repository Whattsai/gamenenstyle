import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.js';
import { allToolNames } from '../src/capabilities.js';

test('品質提交沿用固定task，不增加MCP tools或外部參數',async()=>{
  const config=loadConfig();
  const task=config.tasks.find(t=>t.id==='brickhigh-gate3-quality-submit');
  assert.ok(task);
  assert.equal(task.alias,'main');
  assert.equal(task.timeoutSeconds,600);
  assert.equal(task.args.length,1);
  assert.match(task.args[0],/submit-brickhigh-quality-reviews\.js$/);
  assert.ok(allToolNames(config).has('start_project_job'));
  assert.ok(!allToolNames(config).has('submit_quality_reviews'));
  const text=await readFile(new URL('../scripts/submit-brickhigh-quality-reviews.js',import.meta.url),'utf8');
  assert.match(text,/tools.catalog.quality_submission/);
  assert.match(text,/shell:false/);
  assert.match(text,/process.argv.length/);
  assert.doesNotMatch(text,/UPDATE.*model_revisions|fixture.*false|BuildInteractiveFixture/);
});
