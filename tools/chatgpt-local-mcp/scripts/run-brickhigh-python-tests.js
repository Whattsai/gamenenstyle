#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const suites = {
  all: ['-m', 'pytest', '-q'],
  catalog: ['-m', 'pytest', '-q', 'tools/catalog/tests'],
  acceptance: ['-m', 'pytest', '-q', 'tools/acceptance/tests'],
};
const suite = process.argv[2] ?? 'all';
if (process.argv.length > 3 || !Object.hasOwn(suites, suite)) {
  process.stderr.write('Unknown fixed Python test suite.\n');
  process.exit(2);
}
const result = spawnSync('python.exe', suites[suite], {
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
});

if (result.error) {
  process.stderr.write(`Unable to start the configured Python test runner: ${result.error.message}\n`);
  process.exitCode = 1;
} else if (result.signal) {
  process.stderr.write(`Python test runner terminated by ${result.signal}.\n`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
