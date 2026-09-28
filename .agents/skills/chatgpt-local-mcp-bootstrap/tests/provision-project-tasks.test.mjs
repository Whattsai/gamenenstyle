import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const script = resolve('assets/chatgpt-local-mcp/scripts/provision-project-tasks.mjs');
const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'mcp-provision-'));
  mkdirSync(join(root, '.git'));
  mkdirSync(join(root, 'tools', 'chatgpt-local-mcp', 'config'), { recursive: true });
  mkdirSync(join(root, 'apps', 'web'), { recursive: true });
  writeFileSync(join(root, 'apps', 'web', 'package.json'), JSON.stringify({ scripts: { build: 'next build', test: 'vitest run', 'test:e2e': 'playwright test', deploy: 'wrangler deploy' } }));
  writeFileSync(join(root, 'apps', 'web', 'package-lock.json'), '{}');
  const path = join(root, 'tools', 'chatgpt-local-mcp', 'config', 'project.json');
  const config = { schemaVersion: 1, projectRoot: '../..', repos: [{ alias: 'main', path: '.' }], tasks: [] };
  writeFileSync(path, JSON.stringify(config));
  return { root, path };
};
const run = root => spawnSync(process.execPath, [script, '--target-repo', root], { encoding: 'utf8' });

test('generic template contains no project specific fixed tasks', () => {
  const template = JSON.parse(readFileSync(resolve('assets/chatgpt-local-mcp/config/project.json'), 'utf8'));
  assert.deepEqual(template.tasks, []);
});

test('discovers fixed npm test/build/e2e and restore tasks; repeated provisioning is stable', () => {
  const f = fixture();
  try {
    const first = run(f.root);
    assert.equal(first.status, 0, first.stderr);
    const config = JSON.parse(readFileSync(f.path, 'utf8'));
    assert.deepEqual(config.tasks.map(task => task.id), ['apps-web-restore', 'apps-web-build', 'apps-web-test', 'apps-web-test-e2e']);
    for (const task of config.tasks) {
      assert.equal(task.executable, process.execPath);
      assert.match(task.args[0], /npm-cli\.js$/);
      assert.equal(task.alias, 'main');
      assert.equal(task.cwd, 'apps/web');
    }
    assert.ok(!config.tasks.some(task => task.args.includes('deploy')));
    assert.equal(run(f.root).status, 0);
    assert.deepEqual(JSON.parse(readFileSync(f.path, 'utf8')).tasks, config.tasks);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('preserves existing fixed tasks and provisions a new package without replacing them', () => {
  const f = fixture();
  try {
    const config = JSON.parse(readFileSync(f.path, 'utf8'));
    config.tasks.push({ id: 'custom-check', kind: 'test', alias: 'main', cwd: '.', executable: process.execPath, args: ['--version'] });
    writeFileSync(f.path, JSON.stringify(config));
    assert.equal(run(f.root).status, 0);
    const tasks = JSON.parse(readFileSync(f.path, 'utf8')).tasks;
    assert.deepEqual(tasks[0], config.tasks[0]);
    assert.ok(tasks.some(task => task.id === 'apps-web-build'));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('preserves an existing npm runner with fixed extra arguments and adds its canonical ID', () => {
  const f = fixture();
  try {
    const config = JSON.parse(readFileSync(f.path, 'utf8'));
    const npmCli = join(resolve(process.execPath, '..'), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    config.tasks.push({ id: 'custom-test', kind: 'test', alias: 'main', cwd: 'apps/web', executable: process.execPath, args: [npmCli, 'test', '--', '--runInBand'] });
    writeFileSync(f.path, JSON.stringify(config));
    assert.equal(run(f.root).status, 0);
    const tasks = JSON.parse(readFileSync(f.path, 'utf8')).tasks;
    assert.deepEqual(tasks.filter(task => task.args[1] === 'test').map(task => task.id), ['custom-test', 'apps-web-test']);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('legacy short task ID does not suppress package canonical test task', () => {
  const f = fixture();
  try {
    writeFileSync(join(f.root, 'apps', 'web', 'package.json'), JSON.stringify({ name: 'client-proposal-web-backend', scripts: { test: 'vitest run' } }));
    const config = JSON.parse(readFileSync(f.path, 'utf8'));
    const npmCli = join(resolve(process.execPath, '..'), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    config.tasks.push({ id: 'client-backend-test', kind: 'test', alias: 'main', cwd: 'apps/web', executable: process.execPath, args: [npmCli, 'test'] });
    writeFileSync(f.path, JSON.stringify(config));
    assert.equal(run(f.root).status, 0);
    const tasks = JSON.parse(readFileSync(f.path, 'utf8')).tasks;
    assert.ok(tasks.some(task => task.id === 'client-backend-test'));
    assert.ok(tasks.some(task => task.id === 'client-proposal-web-backend-test'));
    assert.equal(run(f.root).status, 0);
    assert.equal(JSON.parse(readFileSync(f.path, 'utf8')).tasks.length, tasks.length);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('canonical task ID with conflicting command fails closed', () => {
  const f = fixture();
  try {
    const config = JSON.parse(readFileSync(f.path, 'utf8'));
    config.tasks.push({ id: 'apps-web-test', kind: 'test', alias: 'main', cwd: 'apps/web', executable: process.execPath, args: ['--version'] });
    writeFileSync(f.path, JSON.stringify(config));
    const result = run(f.root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /既有 task ID 與盤點結果衝突/);
    assert.deepEqual(JSON.parse(readFileSync(f.path, 'utf8')).tasks, config.tasks);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('discovers .NET project target when the repo contains one', () => {
  const f = fixture();
  try {
    mkdirSync(join(f.root, 'backend'));
    writeFileSync(join(f.root, 'backend', 'Backend.Tests.csproj'), '<Project><PropertyGroup><IsTestProject>true</IsTestProject></PropertyGroup></Project>');
    const result = run(f.root);
    assert.equal(result.status, 0, result.stderr);
    const config = JSON.parse(readFileSync(f.path, 'utf8'));
    assert.equal(config.dotnet.enabled, true);
    assert.deepEqual(config.dotnet.targets[0].allowedActions, ['build', 'test', 'restore']);
    assert.equal(config.dotnet.targets[0].relativeProjectPath, 'backend/Backend.Tests.csproj');
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
