import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:https';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SourceArchive } from '../src/source-archive.js';
import { redact } from '../src/core.js';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

test('local HTTPS source archives raw bytes and rejects nonallowlisted or conflicting sources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'source-archive-'));
  const key = await readFile(join(fixtureDir, 'localhost.key'));
  const cert = await readFile(join(fixtureDir, 'localhost.crt'));
  let payload = Buffer.from([0, 255, 1, 2, 10]);
  const server = createServer({ key, cert }, (request, response) => {
    if (request.url === '/redirect') { response.writeHead(302, { location: 'https://example.org/' }); response.end(); return; }
    response.writeHead(200, { 'content-type': 'application/octet-stream' }); response.end(payload);
  });
  try {
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    const config = { repos: { main: { root } }, toolRoot: join(root, 'tools', 'chatgpt-local-mcp'), sourceArchive: {
      alias: 'main', relativeRoot: 'brickhigh/artifacts/sources', allowedDomains: ['localhost'], allowedPorts: [port], maxBytes: 100, timeoutSeconds: 5,
    } };
    const service = { requireSession: async (id, alias, instructions) => {
      assert.equal(id, 'session'); assert.equal(alias, 'main'); assert.equal(instructions, true);
    } };
    const archive = new SourceArchive(config, service, { tlsOptions: { ca: cert } });
    const url = `https://localhost:${port}/source`;
    const first = await archive.archive('session', 'gate2-source', url, '2026-10-01T00:00:00Z');
    assert.equal(first.reused, false);
    assert.equal(first.manifest.sourceUri, url);
    assert.equal(first.manifest.effectiveAt, '2026-10-01T00:00:00Z');
    assert.equal(first.manifest.httpStatus, 200);
    assert.equal(first.manifest.contentType, 'application/octet-stream');
    assert.equal(first.manifest.byteLength, payload.length);
    assert.equal(first.manifest.sha256, createHash('sha256').update(payload).digest('hex'));
    assert.match(first.manifest.observedAt, /^\d{4}-\d\d-\d\dT.*Z$/);
    assert.deepEqual(await readFile(join(root, first.manifest.storagePath)), payload);
    assert.equal((await archive.archive('session', 'gate2-source', url, '2026-10-01T00:00:00Z')).reused, true);
    payload = Buffer.from('different bytes');
    await assert.rejects(archive.archive('session', 'gate2-source', url, '2026-10-01T00:00:00Z'), /SOURCE_STORAGE_CONFLICT/);
    assert.deepEqual(await readFile(join(root, first.manifest.storagePath)), Buffer.from([0, 255, 1, 2, 10]));
    await assert.rejects(archive.archive('session', 'outside', `https://example.org:${port}/source`), /SOURCE_DOMAIN_BLOCKED/);
    await assert.rejects(archive.archive('session', 'insecure', `http://localhost:${port}/source`), /SOURCE_URL_INVALID/);
    await assert.rejects(archive.archive('session', 'userinfo', `https://user:pass@localhost:${port}/source`), /SOURCE_URL_INVALID/);
    await assert.rejects(archive.archive('session', 'redirect', `https://localhost:${port}/redirect`), /SOURCE_HTTP_STATUS: 302/);
    assert.doesNotMatch(redact(`https://localhost:${port}/source?case=secret-value`), /secret-value/);
    const noEffective = await archive.archive('session', 'without-effective-date', url);
    assert.equal('effectiveAt' in noEffective.manifest, false);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test('100 MB archive limit accepts bytes below the limit and rejects bytes above it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'source-archive-limit-'));
  const key = await readFile(join(fixtureDir, 'localhost.key'));
  const cert = await readFile(join(fixtureDir, 'localhost.crt'));
  const limit = 100_000_000;
  const chunk = Buffer.alloc(1024 * 1024, 0x42);
  const server = createServer({ key, cert }, async (request, response) => {
    response.on('error', () => {});
    response.writeHead(200, { 'content-type': 'application/octet-stream' });
    let remaining = request.url === '/below' ? limit - 1 : limit + 1;
    while (remaining > 0 && !response.destroyed) {
      const bytes = chunk.subarray(0, Math.min(remaining, chunk.length));
      remaining -= bytes.length;
      if (!response.write(bytes)) {
        await new Promise(resolve => {
          const done = () => { response.off('drain', done); response.off('close', done); resolve(); };
          response.once('drain', done);
          response.once('close', done);
        });
      }
    }
    if (!response.destroyed) response.end();
  });
  try {
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;
    const config = { repos: { main: { root } }, toolRoot: join(root, 'tools', 'chatgpt-local-mcp'), sourceArchive: {
      alias: 'main', relativeRoot: 'brickhigh/artifacts/sources', allowedDomains: ['localhost'], allowedPorts: [port], maxBytes: limit, timeoutSeconds: 30,
    } };
    const archive = new SourceArchive(config, { requireSession: async () => {} }, { tlsOptions: { ca: cert } });
    assert.equal(archive.settings().maxBytes, limit);
    const below = await archive.archive('session', 'below-limit', `https://localhost:${port}/below`);
    assert.equal(below.manifest.byteLength, limit - 1);
    assert.equal((await stat(join(root, below.manifest.storagePath))).size, limit - 1);
    await assert.rejects(archive.archive('session', 'above-limit', `https://localhost:${port}/above`), /SOURCE_TOO_LARGE/);
    await assert.rejects(stat(join(root, 'brickhigh/artifacts/sources/above-limit/source.bin')), { code: 'ENOENT' });
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});
