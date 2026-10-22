import { randomUUID } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { safePath } from './core.js';

const fail = code => { throw new Error(code); };
const namePattern = /^(?:Test[A-Za-z0-9_]+::)?test_[A-Za-z0-9_]+$/;

export class PythonTestRunner {
  constructor(config, service) { this.config = config; this.service = service; }
  async start(sessionId, suite, testPath, testName) {
    const settings = this.config.pythonTests;
    await this.service.requireSession(sessionId, settings.alias, true);
    if (!['catalog', 'acceptance', 'all'].includes(suite)) fail('PYTEST_SUITE_INVALID');
    if (testName !== undefined && (!testPath || !namePattern.test(testName))) fail('PYTEST_SELECTOR_INVALID');
    const repo = this.config.repos[settings.alias];
    const cwd = resolve(repo.root, settings.cwd);
    const roots = suite === 'all' ? Object.values(settings.roots) : [settings.roots[suite]];
    let target;
    if (testPath !== undefined) {
      const checked = await safePath(repo.root, `${settings.cwd}/${testPath}`, this.config.toolRoot);
      const relativeToCwd = relative(cwd, checked.absolute).replaceAll('\\', '/');
      if (!roots.some(root => relativeToCwd.startsWith(`${root}/`)) || !/(?:^|\/)test_[A-Za-z0-9_]+\.py$/.test(relativeToCwd)) fail('PYTEST_PATH_BLOCKED');
      if (!(await stat(checked.absolute)).isFile()) fail('PYTEST_PATH_BLOCKED');
      target = relativeToCwd;
    }
    const args = ['-m', 'pytest', '-q', ...(target ? [`${target}${testName ? `::${testName}` : ''}`] : roots)];
    const id = randomUUID(), logPath = join(this.service.state, 'logs', `${id}.txt`), recordPath = join(this.service.state, 'jobs', `${id}.json`);
    const job = { id, taskId: 'python-selector', kind: 'test', alias: settings.alias, status: 'running',
      suite, testPath: target ?? null, testName: testName ?? null, started: new Date().toISOString(), logPath };
    return this.service.launchJob(sessionId, {executable:settings.executable,args,resolvedCwd:cwd,timeoutSeconds:settings.timeoutSeconds}, job, recordPath);
  }
}
