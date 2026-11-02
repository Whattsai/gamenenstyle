import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProjectDiagnostics, parseProjectTestSummary } from '../src/project-job-results.js';
import { redact } from '../src/core.js';

test('project test jobs summarize Node TAP, Vitest, Playwright, and .NET output', () => {
  assert.deepEqual(parseProjectTestSummary('[2026-11-02T00:00:00.000Z] [stdout] # tests 12\n[2026-11-02T00:00:00.000Z] [stdout] # pass 10\n[2026-11-02T00:00:00.000Z] [stdout] # fail 1\n[2026-11-02T00:00:00.000Z] [stdout] # skipped 1'), { total: 12, passed: 10, failed: 1, skipped: 1 });
  assert.deepEqual(parseProjectTestSummary('Tests  2 failed | 5 passed (7)'), { total: 7, passed: 5, failed: 2, skipped: 0 });
  assert.deepEqual(parseProjectTestSummary('  1 failed, 4 passed, 1 skipped (9.2s)'), { total: 6, passed: 4, failed: 1, skipped: 1 });
  assert.deepEqual(parseProjectTestSummary('Failed!  - Failed: 1, Passed: 6, Skipped: 2, Total: 9'), { total: 9, passed: 6, failed: 1, skipped: 2 });
  assert.deepEqual(parseProjectTestSummary('ℹ tests 21\nℹ pass 21\nℹ fail 0\nℹ skipped 0\nℹ todo 0'), { total: 21, passed: 21, failed: 0, skipped: 0 });
  assert.deepEqual(parseProjectTestSummary('\u001b[2mTests\u001b[22m \u001b[1m\u001b[32m58 passed\u001b[39m\u001b[90m (58)\u001b[39m'), { total: 58, passed: 58, failed: 0, skipped: 0 });
  assert.equal(parseProjectTestSummary('worker starting'), null);
});

test('passing Node spec output is not reported as a test diagnostic', () => {
  const output = '✔ accepts a password field after validation (1.2ms)\nℹ tests 1\nℹ pass 1\nℹ fail 0';
  assert.deepEqual(parseProjectDiagnostics(output), []);
});

test('project diagnostics keep compiler and test failures useful while redacting private values', () => {
  const diagnostics = parseProjectDiagnostics([
    'DatingHigh.Domain.cs(8,4): error CS1001: Identifier expected',
    'not ok 1 - rejects account for private.person@example.test',
    '  error: expected password=do-not-log'
  ].join('\n'));
  assert.equal(diagnostics[0].type, 'compiler_error');
  assert.equal(diagnostics[0].code, 'CS1001');
  assert.equal(diagnostics[1].type, 'test_failure');
  assert.doesNotMatch(JSON.stringify(diagnostics), /private\.person@example\.test|do-not-log/);
});

test('redaction protects DatingHigh credentials, cookies, and email addresses', () => {
  const safe = redact('{"access_token":"secret-value","email":"person@example.test","Cookie":"session=private","emailCode":"923417","code=184206"} EMAIL_CODE_HMAC_KEY=private-hmac AccessToken=private-token Bearer private-bearer-value');
  assert.doesNotMatch(safe, /secret-value|person@example\.test|private|private-bearer-value|923417|184206/);
  assert.match(safe, /REDACTED/);
});
