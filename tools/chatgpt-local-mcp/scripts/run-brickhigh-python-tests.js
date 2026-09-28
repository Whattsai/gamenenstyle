#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const result = spawnSync('python.exe', ['-m', 'pytest', '-q'], {
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
