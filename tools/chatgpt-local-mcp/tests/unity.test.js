import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { UnityRunner, ownedProcessTree, classifyUnityAttempt } from '../src/unity.js';
import { safeEnvironment } from '../src/core.js';

const script = `
const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const get = flag => args[args.indexOf(flag) + 1];
const project = get('-projectPath');
const countPath = path.join(project, 'count.txt');
const count = (fs.existsSync(countPath) ? Number(fs.readFileSync(countPath, 'utf8')) : 0) + 1;
fs.writeFileSync(countPath, String(count));
const mode = fs.readFileSync(path.join(project, 'mode.txt'), 'utf8');
const finish = () => {
  if (mode === 'three-upm' || (mode === 'retry-upm' && count === 1)) {
    fs.writeFileSync(get('-logFile'), 'Could not connect to IPC stream "Upm-123" after 30.0 seconds\\nFailed to start the Unity Package Manager local server process');
    process.exit(1);
  }
  if (mode === 'test-fail') {
    fs.writeFileSync(get('-logFile'), 'Test Runner\\nTest Run Failed');
    fs.writeFileSync(get('-testResults'), '<test-run result="Failed" />');
    process.exit(1);
  }
  fs.writeFileSync(get('-logFile'), 'Test Runner\\nTest run finished');
  fs.writeFileSync(get('-testResults'), '<test-run result="Passed" />');
  process.exit(0);
};
if (mode === 'slow') setTimeout(finish, 2000); else finish();
`;

async function fixture(mode) {
  const state = await mkdtemp(join(tmpdir(), 'unity-mcp-'));
  const project = join(state, 'project');
  await mkdir(join(state, 'logs')); await mkdir(join(state, 'artifacts')); await mkdir(project);
  const entry = join(state, 'fake-unity.cjs');
  const upm = join(state, 'UnityPackageManager.exe');
  await writeFile(entry, script); await writeFile(upm, 'fake'); await writeFile(join(project, 'mode.txt'), mode);
  const originalResults = join(state, 'results.xml');
  const task = { executable: process.execPath, resolvedCwd: state,
    args: [entry, '-batchmode', '-projectPath', project, '-runTests', '-testPlatform', 'EditMode', '-testResults', originalResults, '-logFile', '-'],
    unity: { projectPath: project, upmExecutable: upm, resultsPath: originalResults, timeoutSeconds: 30 } };
  const born = new Date(Date.now() - 10000).toISOString();
  const adapter = { snapshot: async () => [{ pid: process.pid, parentPid: 0, created: born, executable: process.execPath }], killExact: async () => { throw new Error('unexpected kill'); } };
  const runner = new UnityRunner({ state }, adapter, { pollMs: 10, backoffMs: 10 });
  const run = async () => {
    const job = { id: randomUUID(), status: 'running' };
    await runner.run('session', task, job, join(state, `${job.id}.json`));
    return job;
  };
  return { state, project, runner, run, originalResults, cleanup: () => rm(state, { recursive: true, force: true }) };
}

test('UPM IPC timeout retries with a fresh process and then succeeds', async () => {
  const f = await fixture('retry-upm');
  try {
    const job = await f.run();
    assert.equal(job.status, 'succeeded');
    assert.deepEqual(job.attempts.map(a => a.failureType), ['unity-upm-startup-failure', 'success']);
    assert.notEqual(job.attempts[0].logPath, job.attempts[1].logPath);
    assert.match(await readFile(job.attempts[0].logPath, 'utf8'), /IPC stream/);
    assert.match(await readFile(f.originalResults, 'utf8'), /result="Passed"/);
    assert.equal(await readFile(join(f.project, 'count.txt'), 'utf8'), '2');
  } finally { await f.cleanup(); }
});

test('three UPM failures retain each attempt and classify startup, not tests', async () => {
  const f = await fixture('three-upm');
  try {
    const job = await f.run();
    assert.equal(job.status, 'failed');
    assert.equal(job.failureType, 'unity-upm-startup-failure');
    assert.equal(job.attempts.length, 3);
    assert.equal(job.lastLogPath, job.attempts[2].logPath);
    assert.equal(await readFile(join(f.project, 'count.txt'), 'utf8'), '3');
  } finally { await f.cleanup(); }
});

test('real test failure never triggers UPM retry', async () => {
  const f = await fixture('test-fail');
  try {
    const job = await f.run();
    assert.equal(job.failureType, 'unity-test-failure');
    assert.equal(job.attempts.length, 1);
    assert.equal(job.attempts[0].testRunnerReached, true);
  } finally { await f.cleanup(); }
});

test('cleanup only kills MCP-owned processes and preserves an interactive Editor', async () => {
  const state = await mkdtemp(join(tmpdir(), 'unity-ownership-'));
  const snapshot = [
    { pid: 11, parentPid: 0, created: '2026-01-01T00:00:00Z', executable: 'Unity.exe' },
    { pid: 22, parentPid: 0, created: '2026-01-01T00:00:10Z', executable: 'Unity.com' },
    { pid: 23, parentPid: 22, created: '2026-01-01T00:00:11Z', executable: 'UnityPackageManager.exe' },
  ];
  const killed = [];
  const adapter = { snapshot: async () => snapshot, killExact: async p => { killed.push(p.pid); snapshot.splice(snapshot.findIndex(x => x.pid === p.pid), 1); return true; } };
  try {
    const runner = new UnityRunner({ state }, adapter);
    await runner.cleanup({ project: state, jobId: randomUUID(), rootPid: 22, started: '2026-01-01T00:00:10Z', processes: [], path: join(state, 'owned.json') });
    assert.deepEqual(killed.sort(), [22, 23]);
    assert.deepEqual(snapshot.map(p => p.pid), [11]);
    assert.deepEqual(ownedProcessTree(snapshot, [{ pid: 22, created: '2025-01-01T00:00:00Z', executable: 'Unity.com' }], 999, 0), []);
  } finally { await rm(state, { recursive: true, force: true }); }
});

test('project level lock rejects concurrent Unity jobs and permits the next one', async () => {
  const f = await fixture('slow');
  try {
    const first = f.run();
    await new Promise(resolve => setTimeout(resolve, 150));
    await assert.rejects(f.run(), /UNITY_PROJECT_BUSY/);
    assert.equal((await first).status, 'succeeded');
    assert.equal((await f.run()).status, 'succeeded');
  } finally { await f.cleanup(); }
});

test('classification separates compilation and timeout from UPM and test failure', () => {
  assert.equal(classifyUnityAttempt({ log: 'error CS1002: ; expected', exitCode: 1 }), 'unity-compile-failure');
  assert.equal(classifyUnityAttempt({ log: 'Could not connect to IPC stream', exitCode: 1, timedOut: true }), 'timeout');
  assert.equal(classifyUnityAttempt({ log: '', exitCode: 0, requiresTestRunner: true }), 'unity-startup-failure');
});

test('Windows ProgramData is preserved for the UPM server configuration path', () => {
  if (process.platform === 'win32') assert.equal(safeEnvironment().ProgramData, process.env.ProgramData);
});
