import { redact } from './core.js';

const last = values => values.at(-1);
const normalizeOutput = value => redact(value).replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '').split(/\r?\n/).map(line => line.replace(/^\[[^\]]+\]\s+\[[^\]]+\]\s*/, '')).join('\n');

function countsFromLine(value) {
  const counts = { total: 0, passed: 0, failed: 0, skipped: 0 };
  for (const match of value.matchAll(/(\d+)\s+(passed|failed|skipped|todo|flaky)\b/gi)) {
    const count = Number(match[1]);
    if (match[2].toLowerCase() === 'passed') counts.passed += count;
    else if (match[2].toLowerCase() === 'failed') counts.failed += count;
    else counts.skipped += count;
  }
  const total = /\((\d+)\)\s*$/.exec(value);
  counts.total = total ? Number(total[1]) : counts.passed + counts.failed + counts.skipped;
  return counts;
}

export function parseProjectTestSummary(output) {
  const text = normalizeOutput(output);
  const tapTests = last([...text.matchAll(/^# tests\s+(\d+)\s*$/gim)]);
  if (tapTests) {
    const number = label => Number(last([...text.matchAll(new RegExp(`^# ${label}\\s+(\\d+)\\s*$`, 'gim'))])?.[1] ?? 0);
    return { total: Number(tapTests[1]), passed: number('pass'), failed: number('fail'), skipped: number('skipped') };
  }

  const nodeTests = last([...text.matchAll(/^ℹ\s+tests\s+(\d+)\s*$/gim)]);
  if (nodeTests) {
    const number = label => Number(last([...text.matchAll(new RegExp(`^ℹ\\s+${label}\\s+(\\d+)\\s*$`, 'gim'))])?.[1] ?? 0);
    return { total: Number(nodeTests[1]), passed: number('pass'), failed: number('fail'), skipped: number('skipped') + number('cancelled') + number('todo') };
  }

  const dotnet = last([...text.matchAll(/(?:Failed|Passed)!?\s*-\s*Failed:\s*(\d+),\s*Passed:\s*(\d+),\s*Skipped:\s*(\d+),\s*Total:\s*(\d+)/gim)]);
  if (dotnet) return { total: Number(dotnet[4]), passed: Number(dotnet[2]), failed: Number(dotnet[1]), skipped: Number(dotnet[3]) };

  const vitest = last([...text.matchAll(/^\s*Tests\s+(.+)$/gim)]);
  if (vitest) return countsFromLine(vitest[1]);

  const jest = last([...text.matchAll(/^\s*Tests:\s*(.+)$/gim)]);
  if (jest) return countsFromLine(jest[1]);

  const playwright = last([...text.matchAll(/^\s*(?:(?:\d+)\s+(?:passed|failed|skipped|flaky)(?:,\s*)?)+(?:\s+\([^)]+\))?\s*$/gim)]);
  if (playwright) return countsFromLine(playwright[0]);
  return null;
}

export function parseProjectDiagnostics(output, limit = 20) {
  const lines = normalizeOutput(output).split(/\r?\n/);
  const result = [], seen = new Set();
  const add = item => {
    const key = `${item.type}:${item.message}`.toLowerCase();
    if (seen.has(key) || result.length >= limit) return;
    seen.add(key);
    result.push(item);
  };

  for (let index = 0; index < lines.length; index++) {
    const text = lines[index].trim();
    if (!text) continue;
    const code = /\b(error\s+)?(CS\d{4}|RZ\d{4,5}|MSB\d{4}|NU\d{4})\b/i.exec(text);
    if (code) {
      add({ type: code[2].startsWith('CS') ? 'compiler_error' : code[2].startsWith('RZ') ? 'razor_error' : code[2].startsWith('MSB') ? 'msbuild_error' : 'restore_error', code: code[2].toUpperCase(), message: text.slice(0, 700) });
      continue;
    }
    if (/^not ok\s+\d+\b/i.test(text) || /^✖\s+/.test(text)) {
      add({ type: 'test_failure', message: text.slice(0, 700), context: lines.slice(index + 1, index + 4).map(line => line.trim().slice(0, 300)).filter(Boolean).join('\n') });
      continue;
    }
    if (/^\s*FAIL\s{2,}|^\s*FAILED\s{2,}|\bError:\s|Unhandled exception|AssertionError|Test run failed/i.test(text)) {
      add({ type: /AssertionError|test run failed|^\s*FAIL/i.test(text) ? 'test_failure' : 'runtime_error', message: text.slice(0, 700), context: lines.slice(index + 1, index + 3).map(line => line.trim().slice(0, 300)).filter(Boolean).join('\n') });
    }
  }
  const summary = parseProjectTestSummary(lines.join('\n'));
  if (summary?.failed > 0) add({ type: 'test_failure', message: `${summary.failed} of ${summary.total} tests failed` });
  return result;
}
