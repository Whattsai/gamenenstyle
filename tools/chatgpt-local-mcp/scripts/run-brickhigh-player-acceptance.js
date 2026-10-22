#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { loadConfig } from '../src/config.js';

const config = loadConfig();
const project = join(config.projectRoot, 'brickhigh');
const builds = join(project, 'artifacts', 'acceptance');
const installer = join(project, 'artifacts', 'toolchain', 'installer-pm-20260924-final', 'BrickHighInstaller.exe');
const script = join(project, 'tools', 'acceptance', 'run_interactive_fixture.py');
const candidates = readdirSync(builds, { withFileTypes: true })
  .filter(item => item.isDirectory() && /^toolchain-\d{8}T\d{6}-[a-f0-9]+$/.test(item.name))
  .map(item => join(builds, item.name, 'Package'))
  .filter(path => existsSync(join(path, 'package-index.json')))
  .sort((a, b) => b.localeCompare(a));
const packagePath = candidates.find(path => {
  try {
    const index = JSON.parse(readFileSync(join(path, 'package-index.json'), 'utf8'));
    return index.purpose === 'F-Catalog'
      && index.applicationId === 'com.gamenenstyle.brickhigh.preview'
      && index.packageKind === 'Preview'
      && index.playerKey === 'Player/BrickHighPreview.exe';
  } catch { return false; }
});
if (!packagePath || !existsSync(installer)) {
  process.stderr.write('No allowlisted internal F-Catalog package or installer is available.\n');
  process.exit(2);
}
const runId = randomUUID();
const outputRoot = resolve(config.runtimeRoot, basename(config.runtimeRoot) === config.projectId ? '' : config.projectId, 'player-acceptance', runId);
const args = ['-u', script, '--package', packagePath, '--installer', installer,
  '--install-root', join(outputRoot, 'installed'), '--output', join(outputRoot, 'evidence')];
process.stdout.write(`Internal F-Catalog package: ${packagePath}\nEvidence: ${join(outputRoot, 'evidence')}\n`);
const child = spawn('python.exe', args, { cwd: project, shell: false, windowsHide: true, stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUNBUFFERED: '1' } });
child.once('error', error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
child.once('close', (code, signal) => { process.exitCode = signal ? 1 : (code ?? 1); });
