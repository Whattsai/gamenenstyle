import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.js';
import { allToolNames } from '../src/capabilities.js';
import { classifyUnityAttempt } from '../src/unity.js';

test('Frozen正式builder沿用既有start_project_job，固定Unity入口且不連到F-Catalog',()=>{
  const config=loadConfig();
  const task=config.tasks.find(x=>x.id==='brickhigh-unity-validation-content-build');
  assert.ok(task);
  assert.equal(task.args[task.args.indexOf('-executeMethod')+1],'BrickHigh.Editor.ValidationContentBuild.BuildValidationContent');
  assert.ok(task.unity&&task.args.includes('-batchmode'));
  assert.doesNotMatch(JSON.stringify(task),/BuildInteractiveFixture|readyAsset|InternalUI/);
  assert.ok(config.tasks.find(x=>x.id==='brickhigh-validation-content-verify'));
  assert.ok(allToolNames(config).has('start_project_job'));
  assert.ok(!allToolNames(config).has('build_validation_content'));
});

test('正式Frozen來源Pending回報品質阻擋，不誤分類成Unity啟動故障',()=>{
  assert.equal(classifyUnityAttempt({log:'FrozenSourceQualityBlocked',exitCode:1}),'unity-source-quality-blocked');
});

test('Frozen建置入口會執行preflight、真Player與finalize並恢復原設定',async()=>{
  const text=await readFile(new URL('../../../brickhigh/game/Assets/BrickHigh/Editor/ValidationContentBuild.cs',import.meta.url),'utf8');
  for(const pattern of [/RunPython\(project, "prepare"/,/BuildPipeline.BuildPlayer/,/WaitForExit\(240000\)/,/RunPython\(project, "finalize"/,/finally/,/FileMode.CreateNew/])assert.match(text,pattern);
  assert.doesNotMatch(text,/Guid.NewGuid\(\).ToString\(\).*snapshot|F-Catalog|quality-review/);
});
