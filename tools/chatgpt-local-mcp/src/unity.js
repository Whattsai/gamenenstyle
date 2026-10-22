import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, rename, rm, stat, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { redact, safeEnvironment } from './core.js';

const pause = ms => new Promise(done => setTimeout(done, ms));
const readJson = async path => { try { return JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } };
const atomic = async (path, value) => { const temp = `${path}.${randomUUID()}.tmp`; await writeFile(temp, JSON.stringify(value, null, 2)); await rename(temp, path); };
const keyFor = project => createHash('sha256').update(resolve(project).toLowerCase()).digest('hex').slice(0, 24);
const upmError = text => /Could not connect to IPC stream|Failed to start the Unity Package Manager local server process|(?:UPM|Package Manager)(?: local)? server process.{0,100}(?:failed|failure|could not start)|(?:failed|failure).{0,100}(?:UPM|Package Manager)(?: local)? server process/i.test(text);
const compileError = text => /(?:error CS\d{4}:|Compilation failed|Scripts have compiler errors|The project you are opening contains compilation errors|Assembly .* failed to compile)/i.test(text);
const testFailure = text => /(?:<test-run\b[^>]*\bresult="Failed"|\bTests? failed\b|\bFailed tests?:\s*[1-9]|\bTest Run Failed\b)/i.test(text);
const runnerReached = text => /(?:Test Runner|Running tests|Test run started|<test-run\b|Test run finished)/i.test(text);

export function parseUnityTestSummary(xml) {
  if (!xml) return null;
  try {
    const run = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' }).parse(xml)['test-run'];
    if (!run || typeof run !== 'object') return null;
    const counts = { total: Number(run.total), passed: Number(run.passed), failed: Number(run.failed), skipped: Number(run.skipped) };
    return Object.values(counts).every(value => Number.isInteger(value) && value >= 0) ? counts : null;
  } catch { return null; }
}

export function ownedProcessTree(snapshot, known, rootPid, since = 0) {
  const byPid = new Map(snapshot.map(p => [Number(p.pid), p]));
  const owned = new Map();
  const root = byPid.get(rootPid);
  if (root && Date.parse(root.created) >= since - 2000) owned.set(rootPid, root);
  for (const prior of known) {
    const live = byPid.get(Number(prior.pid));
    if (live && live.created === prior.created && live.executable === prior.executable) owned.set(Number(live.pid), live);
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const process of snapshot) {
      if (owned.has(Number(process.pid))) continue;
      const parent = owned.get(Number(process.parentPid));
      if (parent && Date.parse(process.created) >= Date.parse(parent.created) - 2000) {
        owned.set(Number(process.pid), process); changed = true;
      }
    }
  }
  return [...owned.values()];
}

export function classifyUnityAttempt({ log, resultXml = '', exitCode, timedOut = false, cancelled = false, requiresTestRunner = false }) {
  if (cancelled) return 'cancelled';
  if (timedOut) return 'timeout';
  if (upmError(log)) return 'unity-upm-startup-failure';
  if (compileError(log)) return 'unity-compile-failure';
  if (/FrozenSourceQualityBlocked/.test(log)) return 'unity-source-quality-blocked';
  if ((parseUnityTestSummary(resultXml)?.failed ?? 0) > 0 || /<test-run\b[^>]*\bresult="Failed(?:\([^"]+\))?"/.test(resultXml) || testFailure(log)) return 'unity-test-failure';
  if (requiresTestRunner && exitCode === 0 && (parseUnityTestSummary(resultXml)?.total ?? 0) === 0 && (runnerReached(log) || resultXml)) return 'unity-zero-tests';
  if (exitCode === 0) return requiresTestRunner && !runnerReached(log) && !resultXml ? 'unity-startup-failure' : 'success';
  return runnerReached(log) ? 'unity-test-failure' : 'unity-startup-failure';
}

export class WindowsProcessAdapter {
  async snapshot() {
    const script = '$ErrorActionPreference="Stop"; @(Get-CimInstance Win32_Process | Select-Object @{n="pid";e={$_.ProcessId}},@{n="parentPid";e={$_.ParentProcessId}},@{n="created";e={$_.CreationDate.ToString("o")}},@{n="executable";e={$_.ExecutablePath}},@{n="name";e={$_.Name}}) | ConvertTo-Json -Compress -Depth 3';
    const output = await new Promise((done, fail) => {
      const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, shell: false });
      let data = '', errors = '';
      child.stdout.on('data', chunk => data += chunk);
      child.stderr.on('data', chunk => errors += chunk);
      child.once('error', fail);
      child.once('close', code => code === 0 ? done(data) : fail(new Error(`PROCESS_SNAPSHOT_FAILED: ${errors}`)));
    });
    return JSON.parse(output || '[]');
  }
  async killExact(identity) {
    const current = (await this.snapshot()).find(p => Number(p.pid) === Number(identity.pid));
    if (!current || current.created !== identity.created || current.executable !== identity.executable) return false;
    try { process.kill(Number(identity.pid), 'SIGKILL'); return true; }
    catch (error) { if (error.code === 'ESRCH') return false; throw error; }
  }
}

export class UnityRunner {
  constructor(service, adapter = new WindowsProcessAdapter(), options = {}) {
    this.service = service; this.adapter = adapter;
    this.pollMs = options.pollMs ?? 2000;
    this.backoffMs = options.backoffMs ?? 3000;
    this.cancelled = new Set();
    this.active = new Map();
  }
  directory() { return join(this.service.state, 'unity'); }
  paths(project) { const key = keyFor(project); return { key, lock: join(this.directory(), `${key}.lock`), journal: join(this.directory(), `${key}.owned.json`) }; }
  async init() { await mkdir(this.directory(), { recursive: true }); }
  async acquire(project, jobId) {
    await this.init();
    const paths = this.paths(project), ownerPath = join(paths.lock, 'owner.json');
    const self = (await this.adapter.snapshot()).find(p => Number(p.pid) === process.pid);
    if (!self) throw new Error('UNITY_PROCESS_IDENTITY_UNAVAILABLE: cannot safely acquire project lock');
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await mkdir(paths.lock);
        const owner = { pid: process.pid, runnerCreated: self.created, token: randomUUID(), jobId, project, started: new Date().toISOString() };
        await atomic(ownerPath, owner);
        return { ...paths, owner, ownerPath };
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        const owner = await readJson(ownerPath);
        if (owner?.pid) {
          const live = (await this.adapter.snapshot()).find(p => Number(p.pid) === Number(owner.pid));
          if (live && live.created === owner.runnerCreated) throw new Error(`UNITY_PROJECT_BUSY: ${project} is held by MCP job ${owner.jobId}`);
        } else if (Date.now() - (await stat(paths.lock)).mtimeMs < 30_000) {
          throw new Error(`UNITY_PROJECT_BUSY: ${project} lock is being acquired`);
        }
        await rm(paths.lock, { recursive: true, force: true });
      }
    }
    throw new Error(`UNITY_PROJECT_BUSY: ${project}`);
  }
  async release(lock) {
    if ((await readJson(lock.ownerPath))?.token === lock.owner.token) await rm(lock.lock, { recursive: true, force: true });
  }
  async collect(journal) {
    const snapshot = await this.adapter.snapshot();
    const owned = ownedProcessTree(snapshot, journal.processes ?? [], journal.rootPid, Date.parse(journal.started));
    journal.processes = [...new Map([...(journal.processes ?? []), ...owned].map(p => [`${p.pid}:${p.created}`, p])).values()];
    await atomic(journal.path, { ...journal, path: undefined });
    return owned;
  }
  async cleanup(journal) {
    const owned = await this.collect(journal);
    for (const process of owned.reverse()) await this.adapter.killExact(process);
    await pause(500);
    const remaining = await this.collect(journal);
    if (remaining.length) throw new Error(`UNITY_PROCESS_CLEANUP_FAILED: ${remaining.map(p => p.pid).join(', ')}`);
  }
  async cleanupOrphans(project, lock) {
    const stale = await readJson(lock.journal);
    if (!stale || stale.project !== project || stale.jobId === lock.owner.jobId) return;
    await this.cleanup({ ...stale, path: lock.journal });
    await rm(lock.journal, { force: true });
  }
  async run(sessionId, task, job, recordPath) {
    const project = task.unity.projectPath;
    const editor = task.executable;
    const upm = task.unity.upmExecutable;
    if (!existsSync(editor) || !existsSync(upm)) throw new Error(`UNITY_PREFLIGHT_MISSING: editor=${editor}, upm=${upm}`);
    const lock = await this.acquire(project, job.id);
    try {
      await this.cleanupOrphans(project, lock);
      if (task.unity.resultsPath) await rm(task.unity.resultsPath, { force: true });
      const attempts = [];
      for (let number = 1; number <= 3; number++) {
        if (this.cancelled.has(job.id)) break;
        const logPath = join(this.service.state, 'logs', `${job.id}-attempt-${number}.log`);
        const resultPath = task.unity.resultsPath ? join(this.service.state, 'artifacts', `${job.id}-attempt-${number}.xml`) : null;
        const args = task.args.map((arg, index, all) => all[index - 1] === '-testResults' && resultPath ? resultPath : arg);
        const logIndex = args.indexOf('-logFile');
        if (logIndex >= 0) args[logIndex + 1] = logPath;
        else args.push('-logFile', logPath);
        job.logPath = logPath;
        job.currentAttempt = number;
        await atomic(recordPath, job);
        const attempt = await this.attempt(task, job, number, args, logPath, resultPath, lock);
        attempts.push(attempt);
        Object.assign(job, { attempts, lastLogPath: logPath, logPath, failureType: attempt.failureType, exitCode: attempt.exitCode, testSummary: attempt.testSummary });
        await atomic(recordPath, job);
        if (attempt.failureType !== 'unity-upm-startup-failure' || number === 3 || this.cancelled.has(job.id)) break;
        await pause(this.backoffMs * number);
      }
      const final = attempts.at(-1);
      if (final?.resultPath && existsSync(final.resultPath)) {
        await mkdir(dirname(task.unity.resultsPath), { recursive: true });
        await copyFile(final.resultPath, task.unity.resultsPath);
      }
      const outcome = this.cancelled.has(job.id) ? 'cancelled' : final?.failureType ?? 'cancelled';
      job.status = outcome === 'success' ? 'succeeded' : outcome === 'cancelled' ? 'cancelled' : outcome === 'timeout' ? 'timed_out' : 'failed';
      job.failureType = outcome === 'success' ? null : outcome;
    } finally {
      await this.release(lock);
      this.cancelled.delete(job.id);
    }
  }
  async attempt(task, job, number, args, logPath, resultPath, lock) {
    const started = Date.now();
    const child = spawn(task.executable, args, { cwd: task.resolvedCwd, shell: false, windowsHide: true, env: safeEnvironment() });
    this.active.set(job.id, child);
    let exitCode = null, spawnError = null, exited = false, timedOut = false, consoleOutput = '';
    for (const stream of [child.stdout, child.stderr]) stream?.on('data', chunk => { consoleOutput = (consoleOutput + chunk).slice(-2_000_000); });
    const closed = new Promise(done => {
      child.once('error', error => { spawnError = error; exited = true; done(); });
      child.once('close', code => { exitCode = code; exited = true; done(); });
    });
    const journal = { project: task.unity.projectPath, jobId: job.id, rootPid: child.pid, started: new Date(started).toISOString(), processes: [], path: lock.journal };
    await atomic(lock.journal, { ...journal, path: undefined });
    let cleaned = false;
    try {
      const deadline = started + task.unity.timeoutSeconds * 1000;
      while (!exited) {
        await this.collect(journal);
        const log = `${await readFile(logPath, 'utf8').catch(() => '')}\n${consoleOutput}`;
        if (upmError(log) || this.cancelled.has(job.id) || Date.now() >= deadline) {
          timedOut = Date.now() >= deadline;
          await this.cleanup(journal);
          if (!exited) child.kill();
          break;
        }
        await Promise.race([closed, pause(this.pollMs)]);
      }
      await Promise.race([closed, pause(5000)]);
      await this.cleanup(journal);
      cleaned = true;
    } finally {
      this.active.delete(job.id);
      if (cleaned) await rm(lock.journal, { force: true });
    }
    const fileLog = await readFile(logPath, 'utf8').catch(() => '');
    const log = `${fileLog}\n${consoleOutput}`;
    if (consoleOutput) await writeFile(logPath, log);
    const resultXml = resultPath ? await readFile(resultPath, 'utf8').catch(() => '') : '';
    const testSummary = resultPath ? parseUnityTestSummary(resultXml) : null;
    const failureType = spawnError ? 'unity-startup-failure' : classifyUnityAttempt({ log, resultXml, exitCode, timedOut, cancelled: this.cancelled.has(job.id), requiresTestRunner: !!resultPath });
    return { number, failureType, exitCode, durationMs: Date.now() - started, logPath, resultPath, testRunnerReached: runnerReached(log) || !!resultXml, testSummary, ...(spawnError ? { error: redact(spawnError.message) } : {}) };
  }
  cancel(id) { this.cancelled.add(id); this.active.get(id)?.kill(); }
}
