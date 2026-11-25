import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, copyFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadConfig } from '../src/config.js';
import { ProjectService, redact, redactValue, stringifyRedacted } from '../src/core.js';

const template = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(template, '..', '..');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const git = (cwd, ...args) => {
  const result = spawnSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.test', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};

// 建立獨立暫存專案：root repository 加上一個巢狀 repository，不觸碰真實專案或真實 runtime。
async function fixture() {
  const base = await mkdtemp(join(tmpdir(), 'git-json-mcp-')), project = join(base, 'quartz'), tool = join(project, 'tools', 'chatgpt-local-mcp');
  await mkdir(join(tool, 'config'), { recursive: true });
  await mkdir(join(project, '.agents', 'skills', 'demo'), { recursive: true });
  await writeFile(join(project, 'AGENTS.md'), '# Quartz project\n');
  await writeFile(join(project, '.agents', 'skills', 'demo', 'SKILL.md'), '---\nname: demo\ndescription: Demonstrate the Quartz workflow.\n---\n\nDemo.\n');
  await mkdir(join(project, 'src'), { recursive: true });
  await writeFile(join(project, 'src', 'tracked.md'), 'tracked\n');
  git(project, 'init', '-b', 'main');
  git(project, 'add', '-A');
  git(project, 'commit', '-m', 'root');
  const nested = join(project, 'services', 'inner');
  await mkdir(nested, { recursive: true });
  await writeFile(join(nested, 'inner.md'), 'inner\n');
  git(nested, 'init', '-b', 'trunk');
  git(nested, 'add', '-A');
  git(nested, 'commit', '-m', 'inner');
  const config = { schemaVersion: 1, projectId: 'quartz-local', projectRoot: '../..', runtimeRoot: join(base, 'runtime'), identity: [{ path: 'AGENTS.md', contains: 'Quartz project' }], repos: [{ alias: 'main', path: '.', requiredInstructions: ['AGENTS.md'] }], skills: { root: '.agents/skills', selected: [{ name: 'demo', requiredTools: ['get_active_workspace_session', 'inspect_git_changes', 'read_workspace_text_chunk'] }] }, tasks: [], dotnet: { enabled: false, executable: '', targets: [] }, modules: { web: { enabled: false, allowedOrigins: [] }, android: { enabled: false, adbExecutable: '' }, offlineMedia: { enabled: false, transcriberExecutable: '', args: [] } }, plugin: { name: 'quartz-local' } };
  const configPath = join(tool, 'config', 'project.json');
  await writeFile(configPath, JSON.stringify(config, null, 2));
  return { base, project, nested, configPath, loaded: loadConfig(configPath) };
}
async function connect(configPath) {
  const transport = new StdioClientTransport({ command: process.execPath, args: [join(template, 'src', 'index.js')], cwd: template, env: { ...process.env, PROJECT_MCP_CONFIG: configPath }, stderr: 'pipe' });
  const client = new Client({ name: 'git-json-test', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  return client;
}
const call = async (client, name, args) => {
  const result = await client.callTool({ name, arguments: args });
  assert.notEqual(result.isError, true, JSON.stringify(result));
  return JSON.parse(result.content[0].text);
};

test('逐值遮罩保留有效 JSON，仍遮罩敏感值與敏感欄位', () => {
  // 這些片段原本會因 key="value" 規則吃掉跳脫字元而讓整段 JSON 失效。
  const source = [
    '"test:email:code": "node --test local-email-log.test.mjs"',
    'if(p.AccountId!=round.Text("account_low_id")||p.Role!=(p.AccountId=="initiator_account_id"?"inviter":"acceptor"))throw new Exception();',
    'if(p.Key=="not"){Visit(p.Value,depth+1);return;}\r\n\ttab\\back\\"quote',
    'password=hunter2-secret',
    'contact person@example.test',
  ].join('\n');
  const output = stringifyRedacted({ path: 'a.cs', text: source, nested: [{ text: source }], access_token: 'abc-123', count: 3, ok: true, none: null });
  // 重現舊缺陷：對整段已序列化 JSON 套 redact 會產生無法解析的輸出。
  assert.throws(() => JSON.parse(redact(JSON.stringify({ text: source }))), SyntaxError);
  const parsed = JSON.parse(output);
  assert.equal(parsed.access_token, '[REDACTED]');
  assert.equal(parsed.count, 3);
  assert.equal(parsed.none, null);
  assert.equal(parsed.ok, true);
  assert.doesNotMatch(output, /hunter2-secret|person@example\.test/);
  assert.match(parsed.text, /Visit\(p\.Value,depth\+1\)/);
  assert.match(parsed.text, /tab\\back\\"quote/);
  assert.deepEqual(redactValue(parsed), parsed);
  assert.equal(stringifyRedacted(undefined), undefined);
  assert.equal(redact('token=abcdefgh'), 'token=[REDACTED]');
});

test('有 active session 時 get_active_workspace_session 仍可經 MCP 回傳可用的 session ID，其他機密仍遮罩', async () => {
  const f = await fixture();
  let client;
  try {
    client = await connect(f.configPath);
    const begun = await call(client, 'begin_workspace_session', { aliases: ['main'], task_summary: 'token=secret-value email person@example.test' });
    const active = await call(client, 'get_active_workspace_session', {});
    assert.equal(active.state, 'active');
    assert.equal(active.sessionId, begun.id);
    assert.doesNotMatch(JSON.stringify(active), /secret-value|person@example\.test/);
    // 非 UUID 的 sessionId 欄位與其他識別欄位仍遮罩。
    assert.equal(redactValue({ sessionId: 'not-a-uuid', accountId: begun.id, user_id: 'u1' }).sessionId, '[REDACTED]');
    assert.equal(redactValue({ accountId: begun.id }).accountId, '[REDACTED]');
    const released = await call(client, 'resolve_workspace_session', { expected_session_id: active.sessionId, action: 'release' });
    assert.equal(released.previousSessionId, begun.id);
    assert.equal((await call(client, 'get_active_workspace_session', {})).state, 'none');
  } finally { await client?.close(); await rm(f.base, { recursive: true, force: true }); }
});

test('read_workspace_text_chunk 經 MCP 回傳可解析 JSON，內容與 SHA 完整且仍遮罩機密', async () => {
  const f = await fixture();
  let client;
  try {
    const risky = `{\n  "scripts": {\n    "test:email:code": "node --test tests/local-email-log.test.mjs"\n  }\n}\n`;
    const code = 'class P{bool X(){return p.AccountId!=round.Text("account_low_id")||p.Key=="not";}}\nvar token = "plain-secret-value";\n';
    await writeFile(join(f.project, 'package.json'), risky);
    await writeFile(join(f.project, 'src', 'Risky.cs'), code);
    client = await connect(f.configPath);
    for (const [path, content] of [['package.json', risky], ['src/Risky.cs', code]]) {
      const chunk = await call(client, 'read_workspace_text_chunk', { alias: 'main', path, offset: 0, max_bytes: 131072 });
      assert.equal(chunk.eof, true);
      assert.equal(chunk.sha256, sha256(Buffer.from(content)));
      assert.doesNotMatch(chunk.text, /plain-secret-value/);
    }
    const pkg = await call(client, 'read_workspace_text_chunk', { alias: 'main', path: 'package.json' });
    assert.match(pkg.text, /tests\/local-email-log\.test\.mjs/);
    // 結構化回應也要保持可解析。
    const small = await call(client, 'read_workspace_text', { alias: 'main', path: 'src/Risky.cs' });
    assert.equal(small.sha256, sha256(Buffer.from(code)));
  } finally { await client?.close(); await rm(f.base, { recursive: true, force: true }); }
});

test('datinghigh 三個指定檔案經 MCP chunk 讀取後可解析且 SHA 吻合', { skip: !existsSync(join(repoRoot, 'datinghigh', 'package.json')) }, async () => {
  const f = await fixture();
  let client;
  try {
    // 只在暫存專案內複製唯讀原始檔，避免連線真實 runtime；不修改 DatingHigh 程式。
    const files = ['datinghigh/package.json', 'datinghigh/backend/src/DatingHigh.Application/SceneEventFrameworkService.cs', 'datinghigh/backend/src/DatingHigh.Domain/SceneEventTrackPolicy.cs'];
    client = await connect(f.configPath);
    for (const file of files) {
      const source = join(repoRoot, ...file.split('/'));
      if (!existsSync(source)) continue;
      await mkdir(dirname(join(f.project, ...file.split('/'))), { recursive: true });
      await copyFile(source, join(f.project, ...file.split('/')));
      const bytes = await readFile(source);
      const chunk = await call(client, 'read_workspace_text_chunk', { alias: 'main', path: file, offset: 0, max_bytes: 131072 });
      assert.equal(chunk.sha256, sha256(bytes), file);
      assert.equal(chunk.eof, true, file);
      assert.ok(chunk.text.length > 100, file);
    }
  } finally { await client?.close(); await rm(f.base, { recursive: true, force: true }); }
});

test('inspect_git_changes 的 head 與 repository-status 涵蓋 root 與巢狀 repository', async () => {
  const f = await fixture();
  try {
    const service = new ProjectService(f.loaded);
    await service.init();
    const rootHead = git(f.project, 'rev-parse', 'HEAD'), innerHead = git(f.nested, 'rev-parse', 'HEAD');
    const head = await service.git('main', 'head');
    assert.deepEqual(head.repositories.map(item => [item.path, item.head, item.branch, item.nested]), [['.', rootHead, 'main', false], ['services/inner', innerHead, 'trunk', true]]);
    assert.match(head.repositories[0].head, /^[0-9a-f]{40}$/);
    assert.equal('entries' in head.repositories[0], false);

    await writeFile(join(f.project, 'src', 'tracked.md'), 'changed\n');
    await writeFile(join(f.project, 'src', 'new file.md'), 'new\n');
    await writeFile(join(f.nested, 'inner.md'), 'inner changed\n');
    git(f.nested, 'add', 'inner.md');
    const all = await service.git('main', 'repository-status');
    const root = all.repositories.find(item => item.path === '.'), inner = all.repositories.find(item => item.path === 'services/inner');
    assert.equal(root.clean, false);
    assert.ok(root.entries.some(item => item.status === ' M' && item.path === 'src/tracked.md'));
    assert.ok(root.entries.some(item => item.status === '??' && item.path === 'src/new file.md'));
    assert.deepEqual(inner.counts, { staged: 1, unstaged: 0, untracked: 0, conflicted: 0, total: 1 });
    assert.equal(inner.entries[0].status, 'M ');

    // 指定路徑只回傳受影響鏈：巢狀路徑含 root 與巢狀 repo，root 路徑只含 root。
    const nestedOnly = await service.git('main', 'repository-status', ['services/inner/inner.md']);
    assert.deepEqual(nestedOnly.repositories.map(item => item.path), ['.', 'services/inner']);
    assert.equal(nestedOnly.scope, 'affected-paths');
    assert.deepEqual((await service.git('main', 'head', ['src/tracked.md'])).repositories.map(item => item.path), ['.']);
    assert.deepEqual((await service.git('main', 'head', ['services/inner'])).repositories.map(item => item.path), ['.', 'services/inner']);
  } finally { await rm(f.base, { recursive: true, force: true }); }
});

test('Git 狀態處理未提交的初始 repository、detached HEAD 與輸出上限', async () => {
  const f = await fixture();
  try {
    const service = new ProjectService(f.loaded);
    await service.init();
    const empty = join(f.project, 'fresh');
    await mkdir(empty);
    git(empty, 'init', '-b', 'main');
    const unborn = (await service.git('main', 'head')).repositories.find(item => item.path === 'fresh');
    assert.equal(unborn.head, null);
    assert.equal(unborn.unborn, true);
    git(f.nested, 'checkout', '--detach');
    const detached = (await service.git('main', 'head')).repositories.find(item => item.path === 'services/inner');
    assert.equal(detached.detached, true);
    assert.equal(detached.branch, null);
    for (let index = 0; index < 160; index++) await writeFile(join(f.project, 'src', `bulk-${index}.md`), 'x\n');
    const bulk = (await service.git('main', 'repository-status')).repositories[0];
    assert.ok(bulk.counts.untracked >= 160);
    assert.equal(bulk.entries.length, 150);
    assert.equal(bulk.truncated, true);
  } finally { await rm(f.base, { recursive: true, force: true }); }
});

test('Git 查詢維持路徑限制、拒絕未知操作並不改變 Write Lease', async () => {
  const f = await fixture();
  let client;
  try {
    const service = new ProjectService(f.loaded);
    await service.init();
    await assert.rejects(service.git('main', 'log'), /INVALID_GIT_OPERATION/);
    await assert.rejects(service.git('main', 'checkout'), /INVALID_GIT_OPERATION/);
    await assert.rejects(service.git('main', 'head', ['../outside']), /PATH_TRAVERSAL/);
    await assert.rejects(service.git('main', 'head', ['.git/config']), /SENSITIVE_PATH/);
    await assert.rejects(service.git('main', 'repository-status', ['.env']), /SENSITIVE_PATH/);
    await assert.rejects(service.git('main', 'repository-status', ['tools/chatgpt-local-mcp/config/project.json']), /SERVER_PATH_BLOCKED/);
    await assert.rejects(service.git('main', 'diff-cached'), /PATHS_REQUIRED/);
    const session = await service.begin(['main'], 'lease check');
    const before = await readFile(service.leasePath(), 'utf8');
    for (const operation of ['head', 'repository-status', 'status']) await service.git('main', operation);
    assert.equal(await readFile(service.leasePath(), 'utf8'), before);
    assert.equal((await service.getActive()).sessionId, session.id);
    await assert.rejects(service.begin(['main']), /WRITE_LEASE_REQUIRES_RESOLUTION/);
    await service.end(session.id);
    // 透過 MCP schema 也不能傳入未列舉的操作。
    client = await connect(f.configPath);
    const rejected = await client.callTool({ name: 'inspect_git_changes', arguments: { alias: 'main', operation: 'log' } });
    assert.equal(rejected.isError, true);
    const head = await call(client, 'inspect_git_changes', { alias: 'main', operation: 'head' });
    assert.equal(head.repositories[0].head, git(f.project, 'rev-parse', 'HEAD'));
  } finally { await client?.close(); await rm(f.base, { recursive: true, force: true }); }
});

test('diff-check 也檢查未追蹤新檔，且 diff-cached 檢視已暫存內容', async () => {
  const f = await fixture();
  try {
    const service = new ProjectService(f.loaded);
    await service.init();
    await writeFile(join(f.project, 'src', 'untracked-bad.md'), 'trailing   \nok\n');
    await writeFile(join(f.project, 'src', 'untracked-good.md'), 'clean\n');
    // 敏感檔名不會被檢查或洩漏，只計入略過。
    await writeFile(join(f.project, 'src', 'secret-token.md'), 'x  \n');
    const bad = await service.git('main', 'diff-check', ['src']);
    assert.equal(bad.exitCode, 2);
    assert.match(bad.stdout, /untracked-bad\.md:1: trailing whitespace/);
    assert.doesNotMatch(bad.stdout, /untracked-good|secret-token/);
    assert.deepEqual([...bad.untracked.files].sort(), ['src/untracked-bad.md', 'src/untracked-good.md']);
    assert.equal(bad.untracked.skipped, 1);
    const good = await service.git('main', 'diff-check', ['src/untracked-good.md']);
    assert.equal(good.exitCode, 0);
    assert.equal(good.untracked.checked, 1);

    await writeFile(join(f.project, 'src', 'tracked.md'), 'staged  \n');
    git(f.project, 'add', 'src/tracked.md');
    assert.equal((await service.git('main', 'diff', ['src/tracked.md'])).stdout, '');
    assert.match((await service.git('main', 'diff-cached', ['src/tracked.md'])).stdout, /\+staged/);
    const cachedCheck = await service.git('main', 'diff-check-cached', ['src/tracked.md']);
    assert.equal(cachedCheck.exitCode, 2);
    assert.match(cachedCheck.stdout, /trailing whitespace/);
  } finally { await rm(f.base, { recursive: true, force: true }); }
});
