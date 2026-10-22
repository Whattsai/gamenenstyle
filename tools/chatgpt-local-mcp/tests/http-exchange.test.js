import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:https';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { HttpExchangeArchive } from '../src/http-exchange.js';
import { loadConfig } from '../src/config.js';
import { allToolNames } from '../src/capabilities.js';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const headers = { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Locale': 'en-US' };
const fixedLegoHeaders = { origin: 'https://www.lego.com',
  referer: 'https://www.lego.com/en-us/pick-and-build/pick-a-brick',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' };
const body = '{\n  "operationName": "PickABrickQuery", "query": "query PickABrickQuery { searchElements { total } }", "note": "é"\n}\n';

async function setup(handler, overrides = {}) {
  const root = await mkdtemp(join(tmpdir(), 'mcp-exchange-'));
  const key = await readFile(join(fixtures, 'localhost.key')), cert = await readFile(join(fixtures, 'localhost.crt'));
  const server = createServer({ key, cert }, handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const archive = { enabled: true, alias: 'main', relativeRoot: 'brickhigh/artifacts/sources',
    allowedDomains: ['localhost', '127.0.0.1'], allowedPorts: [port], maxBytes: overrides.maxBytes ?? 100_000_000, timeoutSeconds: overrides.timeoutSeconds ?? 5 };
  const exchange = { enabled: true, allowedTargets: ['/graphql','/plain','/http-400','/http-403','/http-429','/http-500','/redirect-good','/redirect-bad-host','/redirect-private','/redirect-get','/timeout','/large','/loop'].flatMap(path =>
    ['localhost','127.0.0.1'].map(domain => ({ domain, path }))),
    allowedRequestHeaders: { 'content-type': ['application/json'], accept: ['application/json'], 'x-locale': ['en-US'] },
    fixedHeadersByTarget: overrides.fixedHeadersByTarget ?? [],
    requiredRequestHeaders: ['content-type','accept'], requestMaxBytes: 1048576, maxRedirects: 3 };
  const config = { repos: { main: { root } }, toolRoot: join(root, 'tools/chatgpt-local-mcp'), sourceArchive: archive, httpExchange: exchange };
  const service = { requireSession: async (id, alias, instructions) => {
    assert.equal(id, 'session'); assert.equal(alias, 'main'); assert.equal(typeof instructions, 'boolean');
  } };
  const client = new HttpExchangeArchive(config, service, { tlsCa: cert, testOnlyAllowPrivateHosts: ['localhost'],
    resolveAll: async host => host === 'localhost' ? [{ address: '127.0.0.1', family: 4 }] : [] });
  return { root, server, port, config, client, cert,
    url: path => `https://localhost:${port}${path}`,
    close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); } };
}

test('fixed LEGO headers are injected only for their target and recorded per sent hop', async () => {
  const received = [];
  const f = await setup(async (req, res) => {
    for await (const _chunk of req) {};
    received.push({ path: req.url, headers: req.headers });
    if (req.url === '/graphql') { res.writeHead(307, { location: '/plain' }); res.end(); return; }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}');
  }, { fixedHeadersByTarget: [{ domain: 'localhost', path: '/graphql', headers: fixedLegoHeaders }] });
  try {
    const result = await f.client.archive('session', 'fixed-headers', f.url('/graphql'), 'POST', body, headers);
    assert.equal(received.length, 2);
    for (const [name, value] of Object.entries(fixedLegoHeaders)) {
      assert.equal(received[0].headers[name], value);
      assert.equal(received[1].headers[name], undefined);
      assert.equal(result.manifest.requestHeaders[name], value);
      assert.equal(result.manifest.sentRequests[0].headers[name], value);
      assert.equal(result.manifest.sentRequests[1].headers[name], undefined);
    }
    assert.equal(result.manifest.sentRequests[0].url, f.url('/graphql'));
    assert.equal(result.manifest.sentRequests[1].url, f.url('/plain'));
    assert.equal(result.manifest.sentRequests[1].headers['x-locale'], 'en-US');
    assert.equal(result.manifest.sentRequests[1].headers['content-length'], String(Buffer.byteLength(body)));
    assert.deepEqual((await f.client.inspect('session', 'fixed-headers')).manifest.sentRequests, result.manifest.sentRequests);
    const plain = await f.client.archive('session', 'plain-headers', f.url('/plain'), 'POST', body, headers);
    for (const name of Object.keys(fixedLegoHeaders)) assert.equal(plain.manifest.requestHeaders[name], undefined);
    for (const [name, value] of [['Origin', 'https://evil.example'], ['Referer', 'https://evil.example/'], ['User-Agent', 'arbitrary'],
      ['Authorization', 'Bearer secret'], ['Cookie', 'secret=1']])
      await assert.rejects(f.client.archive('session', `forbidden-${name.toLowerCase()}`, f.url('/graphql'), 'POST', body, { ...headers, [name]: value }), /HTTP_EXCHANGE_HEADER_NOT_ALLOWED/);
    assert.equal(received.length, 3);
  } finally { await f.close(); }
});

test('allowlisted HTTPS POST archives exact request/response bytes and immutable manifest', async () => {
  let received;
  const f = await setup(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    received = { method: req.method, body: Buffer.concat(chunks), headers: req.headers };
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(Buffer.from('{"data":{"searchElements":{"count":0,"total":0,"results":[]}}}\n'));
  });
  try {
    const result = await f.client.archive('session', 'lego-10334-pab', f.url('/graphql'), 'POST', body, headers);
    assert.equal(result.reused, false);
    assert.equal(received.method, 'POST'); assert.deepEqual(received.body, Buffer.from(body, 'utf8'));
    assert.equal(received.headers['content-type'], 'application/json'); assert.equal(received.headers.accept, 'application/json');
    assert.equal(received.headers['x-locale'], 'en-US');
    assert.deepEqual(await readFile(result.requestPath), Buffer.from(body));
    const responseBytes = await readFile(result.responsePath);
    assert.equal(responseBytes.toString(), '{"data":{"searchElements":{"count":0,"total":0,"results":[]}}}\n');
    assert.equal(result.requestSha256, sha(Buffer.from(body))); assert.equal(result.responseSha256, sha(responseBytes));
    const manifest = result.manifest;
    assert.equal(manifest.schemaVersion, 1); assert.equal(manifest.sourceId, 'lego-10334-pab');
    assert.equal(manifest.method, 'POST'); assert.equal(manifest.requestedUrl, f.url('/graphql')); assert.equal(manifest.finalUrl, f.url('/graphql'));
    assert.equal(manifest.httpStatus, 200); assert.equal(manifest.contentType, 'application/json');
    assert.equal(manifest.requestByteLength, Buffer.byteLength(body)); assert.equal(manifest.responseByteLength, responseBytes.length);
    assert.equal(manifest.requestHeaders['content-length'], String(Buffer.byteLength(body)));
    assert.deepEqual(manifest.redirectChain, []); assert.equal('effectiveAt' in manifest, false);
    assert.match(manifest.observedAt, /^\d{4}-\d\d-\d\dT.*Z$/);
    assert.equal(manifest.paths.request, 'brickhigh/artifacts/sources/lego-10334-pab/request.bin');
    assert.equal(manifest.paths.response, 'brickhigh/artifacts/sources/lego-10334-pab/response.bin');
    assert.equal(manifest.archiveRelativePaths.request, 'lego-10334-pab/request.bin');
    const inspected = await f.client.inspect('session', 'lego-10334-pab');
    assert.equal(inspected.requestPath, result.requestPath); assert.equal(inspected.responsePath, result.responsePath);
    assert.equal((await f.client.readRange('session', 'lego-10334-pab', 'request', 0, 16)).requestSha256, result.requestSha256);
    assert.equal((await f.client.archive('session', 'lego-10334-pab', f.url('/graphql'), 'POST', body, headers)).reused, true);
    const getFolder = join(f.root, 'brickhigh/artifacts/sources/get-source'); await mkdir(getFolder, { recursive: true });
    await writeFile(join(getFolder, 'source.bin'), Buffer.from('GET source'));
    await writeFile(join(getFolder, 'manifest.json'), '{}');
    await assert.rejects(f.client.archive('session', 'get-source', f.url('/graphql'), 'POST', body, headers), /HTTP_EXCHANGE_SOURCE_CONFLICT/);
    assert.equal((await readFile(join(getFolder, 'source.bin'))).toString(), 'GET source');
  } finally { await f.close(); }
});

test('HTTP 400 archives exact GraphQL errors and exposes them through inspection and range read', async () => {
  let errorBody = Buffer.from('{\n  "errors": [\n    { "message": "GraphQL validation failed" }\n  ]\n}\n');
  let received;
  const f = await setup(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    received = Buffer.concat(chunks);
    res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' }); res.end(errorBody);
  });
  try {
    const archived = await f.client.archive('session', 'graphql-400', f.url('/http-400'), 'POST', body, headers);
    assert.equal(archived.outcome, 'http_response'); assert.equal(archived.httpStatus, 400); assert.equal(archived.ok, false);
    assert.deepEqual(received, Buffer.from(body));
    assert.deepEqual(await readFile(archived.requestPath), received);
    assert.deepEqual(await readFile(archived.responsePath), errorBody);
    assert.equal(archived.requestSha256, sha(received)); assert.equal(archived.responseSha256, sha(errorBody));
    assert.equal(archived.requestBytes, received.length); assert.equal(archived.responseBytes, errorBody.length);
    assert.equal(archived.responseContentType, 'application/json; charset=utf-8');
    assert.equal(archived.manifest.httpStatus, 400); assert.equal(archived.manifest.ok, false);
    assert.equal(archived.manifest.requestSha256, archived.requestSha256);
    assert.equal(archived.manifest.responseSha256, archived.responseSha256);
    assert.equal(archived.manifest.paths.manifest, 'brickhigh/artifacts/sources/graphql-400/exchange-manifest.json');
    assert.deepEqual(JSON.parse(await readFile(archived.manifestPath, 'utf8')), archived.manifest);
    const inspected = await f.client.inspect('session', 'graphql-400');
    assert.equal(inspected.httpStatus, 400); assert.equal(inspected.ok, false);
    assert.equal(inspected.manifest.httpStatus, 400);
    const range = await f.client.readRange('session', 'graphql-400', 'response', 0, 1048576);
    assert.equal(range.encoding, 'utf-8'); assert.equal(range.data, errorBody.toString());
    assert.equal(range.responseSha256, archived.responseSha256); assert.equal(range.eof, true);
    assert.equal((await f.client.archive('session', 'graphql-400', f.url('/http-400'), 'POST', body, headers)).reused, true);
    errorBody = Buffer.from('{"errors":[{"message":"changed"}]}');
    await assert.rejects(f.client.archive('session', 'graphql-400', f.url('/http-400'), 'POST', body, headers), /HTTP_EXCHANGE_SOURCE_CONFLICT/);
    assert.equal((await readFile(archived.responsePath)).toString(), range.data);
  } finally { await f.close(); }
});

test('HTTP 403, 429, and 500 preserve response bytes as HTTP evidence', async () => {
  const f = await setup(async (req, res) => {
    for await (const _chunk of req) {};
    const status = Number(req.url.slice(-3));
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(Buffer.from(`{"status":${status},"message":"server response"}`));
  });
  try {
    for (const status of [403, 429, 500]) {
      const id = `http-${status}`;
      const archived = await f.client.archive('session', id, f.url(`/${id}`), 'POST', body, headers);
      const expected = Buffer.from(`{"status":${status},"message":"server response"}`);
      assert.equal(archived.outcome, 'http_response'); assert.equal(archived.httpStatus, status); assert.equal(archived.ok, false);
      assert.deepEqual(await readFile(archived.responsePath), expected);
      assert.equal(archived.responseSha256, sha(expected));
      assert.equal((await f.client.inspect('session', id)).manifest.httpStatus, status);
      assert.equal((await f.client.readRange('session', id, 'response', 0, 128)).data, expected.toString());
    }
  } finally { await f.close(); }
});

test('POST rejects methods, domains, ports, forbidden headers, large/malformed bodies, and private addresses', async () => {
  const f = await setup((_req, res) => res.end('{}'));
  try {
    const run = (id, url, method = 'POST', value = body, requestHeaders = headers, client = f.client) => client.archive('session', id, url, method, value, requestHeaders);
    await assert.rejects(run('bad-method', f.url('/graphql'), 'GET'), /HTTP_EXCHANGE_METHOD_NOT_ALLOWED/);
    await assert.rejects(run('bad-domain', `https:\/\/example.org:${f.port}/graphql`), /HTTP_EXCHANGE_DOMAIN_NOT_ALLOWED/);
    await assert.rejects(run('bad-port', `https:\/\/localhost:${f.port + 1}/graphql`), /HTTP_EXCHANGE_PORT_NOT_ALLOWED/);
    await assert.rejects(run('bad-target', f.url('/anything')), /HTTP_EXCHANGE_TARGET_NOT_ALLOWED/);
    for (const name of ['Authorization','Cookie','Proxy-Authorization','X-Api-Key','User-Agent'])
      await assert.rejects(run(`bad-header-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`, f.url('/graphql'), 'POST', body, { ...headers, [name]: 'secret' }), /HTTP_EXCHANGE_HEADER_NOT_ALLOWED/);
    await assert.rejects(run('too-large', f.url('/graphql'), 'POST', 'x'.repeat(1048577)), /HTTP_EXCHANGE_REQUEST_TOO_LARGE/);
    await assert.rejects(run('bad-utf8', f.url('/graphql'), 'POST', '\ud800'), /HTTP_EXCHANGE_MALFORMED_REQUEST/);
    await assert.rejects(run('bad-url', `http:\/\/localhost:${f.port}/graphql`), /HTTP_EXCHANGE_MALFORMED_REQUEST/);
    const production = new HttpExchangeArchive(f.config, { requireSession: async () => {} }, { tlsCa: f.cert });
    await assert.rejects(run('private-host', f.url('/graphql'), 'POST', body, headers, production), /HTTP_EXCHANGE_ADDRESS_BLOCKED/);
    await assert.rejects(run('metadata', `https:\/\/127.0.0.1:${f.port}/graphql`), /HTTP_EXCHANGE_ADDRESS_BLOCKED/);
    const rebindingConfig = { ...f.config, sourceArchive: { ...f.config.sourceArchive, allowedDomains: ['www.lego.com'], allowedPorts: [443] },
      httpExchange: { ...f.config.httpExchange, allowedTargets: [{ domain: 'www.lego.com', path: '/graphql' }] } };
    const rebinding = new HttpExchangeArchive(rebindingConfig, { requireSession: async () => {} },
      { resolveAll: async () => [{ address: '8.8.8.8', family: 4 }, { address: '169.254.169.254', family: 4 }] });
    await assert.rejects(rebinding.archive('session', 'mixed-dns', 'https://www.lego.com/graphql', 'POST', body, headers), /HTTP_EXCHANGE_ADDRESS_BLOCKED/);
  } finally { await f.close(); }
});

test('redirects revalidate every hop and preserve POST bytes only for 307/308', async () => {
  const requests = [];
  let port;
  const f = await setup(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    requests.push({ path: req.url, method: req.method, body: Buffer.concat(chunks) });
    if (req.url === '/redirect-good') { res.writeHead(307, { location: '/graphql' }); res.end(); return; }
    if (req.url === '/redirect-bad-host') { res.writeHead(307, { location: 'https://example.org/graphql' }); res.end(); return; }
    if (req.url === '/redirect-private') { res.writeHead(307, { location: `https://127.0.0.1:${port}/graphql` }); res.end(); return; }
    if (req.url === '/redirect-get') { res.writeHead(302, { location: '/graphql' }); res.end(); return; }
    if (req.url === '/loop') { res.writeHead(307, { location: '/loop' }); res.end(); return; }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}');
  });
  port = f.port;
  try {
    const good = await f.client.archive('session', 'redirect-good', f.url('/redirect-good'), 'POST', body, headers);
    assert.equal(good.manifest.redirectChain.length, 1); assert.equal(good.manifest.finalUrl, f.url('/graphql'));
    assert.deepEqual(requests.slice(0, 2).map(x => x.method), ['POST','POST']);
    assert.deepEqual(requests.slice(0, 2).map(x => x.body), [Buffer.from(body),Buffer.from(body)]);
    for (const path of ['/redirect-bad-host','/redirect-private','/redirect-get','/loop'])
      await assert.rejects(f.client.archive('session', path.slice(1), f.url(path), 'POST', body, headers), /HTTP_EXCHANGE_REDIRECT_REJECTED/);
  } finally { await f.close(); }
});

test('response bounds, timeout, TLS, network, and source collision have stable errors', async () => {
  let responseBody = Buffer.from('{}');
  const f = await setup(async (req, res) => {
    for await (const _chunk of req) {};
    if (req.url === '/timeout') return;
    if (req.url === '/large') { res.writeHead(400, { 'content-type': 'application/json' }); res.end(Buffer.alloc(2048)); return; }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(responseBody);
  }, { maxBytes: 1024, timeoutSeconds: 1 });
  try {
    await assert.rejects(f.client.archive('session', 'large', f.url('/large'), 'POST', body, headers), /HTTP_EXCHANGE_RESPONSE_TOO_LARGE/);
    await assert.rejects(f.client.archive('session', 'timeout', f.url('/timeout'), 'POST', body, headers), /HTTP_EXCHANGE_TIMEOUT/);
    await assert.rejects(f.client.inspect('session', 'timeout'), /HTTP_EXCHANGE_SOURCE_NOT_FOUND/);
    await assert.rejects(f.client.inspect('session', 'large'), /HTTP_EXCHANGE_SOURCE_NOT_FOUND/);
    const noTrust = new HttpExchangeArchive(f.config, { requireSession: async () => {} }, { testOnlyAllowPrivateHosts: ['localhost'],
      resolveAll: async () => [{ address: '127.0.0.1', family: 4 }] });
    await assert.rejects(noTrust.archive('session', 'tls', f.url('/graphql'), 'POST', body, headers), /HTTP_EXCHANGE_TLS_INVALID/);
    await assert.rejects(f.client.inspect('session', 'tls'), /HTTP_EXCHANGE_SOURCE_NOT_FOUND/);
    const first = await f.client.archive('session', 'collision', f.url('/graphql'), 'POST', body, headers);
    responseBody = Buffer.from('{"changed":true}');
    await assert.rejects(f.client.archive('session', 'collision', f.url('/graphql'), 'POST', body, headers), /HTTP_EXCHANGE_SOURCE_CONFLICT/);
    assert.deepEqual(await readFile(first.responsePath), Buffer.from('{}'));
    await writeFile(first.requestPath, Buffer.from('tampered'));
    await assert.rejects(f.client.inspect('session', 'collision'), /HTTP_EXCHANGE_INTEGRITY_FAILURE/);
    const failedDns = new HttpExchangeArchive(f.config, { requireSession: async () => {} }, { testOnlyAllowPrivateHosts: ['localhost'],
      resolveAll: async () => { const error = new Error('DNS failed'); error.code = 'ENOTFOUND'; throw error; } });
    await assert.rejects(failedDns.archive('session', 'network', f.url('/graphql'), 'POST', body, headers), /HTTP_EXCHANGE_NETWORK_ERROR/);
    await assert.rejects(f.client.inspect('session', 'network'), /HTTP_EXCHANGE_SOURCE_NOT_FOUND/);
  } finally { await f.close(); }
});

test('connection refusal has no archived HTTP response', async () => {
  const f = await setup((_req, res) => res.end('{}'));
  try {
    await new Promise((resolve, reject) => f.server.close(error => error ? reject(error) : resolve()));
    await assert.rejects(f.client.archive('session', 'connect-failed', f.url('/graphql'), 'POST', body, headers), /HTTP_EXCHANGE_NETWORK_ERROR/);
    await assert.rejects(f.client.inspect('session', 'connect-failed'), /HTTP_EXCHANGE_SOURCE_NOT_FOUND/);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('100 MB response configuration accepts payload past old 20 MB cap and rejects over 100 MB', async () => {
  const payload = Buffer.alloc(20_000_001, 0x41);
  const f = await setup(async (req, res) => {
    for await (const _chunk of req) {};
    if (req.url === '/large') { res.writeHead(200, { 'content-length': '100000001' }); res.end('x'); return; }
    res.writeHead(200, { 'content-type': 'application/octet-stream' }); res.end(payload);
  });
  try {
    assert.equal(f.client.settings().responseMaxBytes, 100_000_000);
    const accepted = await f.client.archive('session', 'over-old-cap', f.url('/graphql'), 'POST', body, headers);
    assert.equal(accepted.manifest.responseByteLength, 20_000_001);
    await assert.rejects(f.client.archive('session', 'over-new-cap', f.url('/large'), 'POST', body, headers), /HTTP_EXCHANGE_RESPONSE_TOO_LARGE/);
  } finally { await f.close(); }
});

test('archived raw paths feed BrickHigh set-scoped mapper without copying request or response', async () => {
  const response = Buffer.from('{"data":{"searchElements":{"results":[],"count":0,"total":0}}}');
  const f = await setup(async (req, res) => { for await (const _chunk of req) {}; res.writeHead(200, { 'content-type': 'application/json' }); res.end(response); });
  try {
    const scopedBody = JSON.stringify({ operationName: 'PickABrickQuery', variables: { input: {
      availability: ['AVAILABLE','OUT_OF_STOCK'], appearsIn: '10334',
      perPage: 400, query: '', page: 1,
    } }, query: 'query PickABrickQuery($input: ElementQueryInput!) { searchElements(input: $input) { results { id designId } total count } }' });
    const exchange = await f.client.archive('session', 'mapper-fixture', f.url('/graphql'), 'POST', scopedBody, headers);
    const pinned = join(f.root, 'pinned'); await mkdir(pinned);
    await writeFile(join(pinned, 'elements.csv.gz'), gzipSync(Buffer.from('element_id,part_num,color_id,design_id\n')));
    const script = "import json,sys; from pathlib import Path; from tools.catalog.lego_pick_a_brick import map_pick_a_brick_set_response; x=map_pick_a_brick_set_response(Path(sys.argv[1]),Path(sys.argv[2]),Path(sys.argv[3]),'10334-1'); print(json.dumps({'requestSha256':x.request_sha256,'responseSha256':x.response_sha256,'total':x.mapping.total}))";
    const brickhigh = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'brickhigh');
    const mapped = spawnSync('python.exe', ['-c', script, exchange.requestPath, exchange.responsePath, pinned], { cwd: brickhigh, encoding: 'utf8', windowsHide: true, shell: false });
    assert.equal(mapped.status, 0, mapped.stderr);
    assert.deepEqual(JSON.parse(mapped.stdout.trim()), { requestSha256: exchange.requestSha256, responseSha256: exchange.responseSha256, total: 0 });
  } finally { await f.close(); }
});

test('MCP advertises exchange schema and tools are callable after connection', async () => {
  const base = await mkdtemp(join(tmpdir(), 'mcp-exchange-protocol-'));
  const project = join(base, 'project'), tool = join(project, 'tools/chatgpt-local-mcp');
  let client;
  try {
    await mkdir(join(tool, 'config'), { recursive: true });
    await writeFile(join(project, 'AGENTS.md'), '# exchange protocol fixture\n');
    assert.equal(spawnSync('git', ['init'], { cwd: project, encoding: 'utf8' }).status, 0);
    const config = { schemaVersion: 1, projectId: 'exchange-protocol', projectRoot: '../..', runtimeRoot: join(base, 'runtime'),
      identity: [{ path: 'AGENTS.md', contains: 'exchange protocol fixture' }], repos: [{ alias: 'main', path: '.', requiredInstructions: ['AGENTS.md'] }],
      skills: { root: '.', selected: [] }, tasks: [], dotnet: { enabled: false, executable: '', targets: [] },
      modules: { web: { enabled: false, allowedOrigins: [] }, android: { enabled: false, adbExecutable: '' }, offlineMedia: { enabled: false, transcriberExecutable: '', args: [] } },
      sourceArchive: { enabled: true, alias: 'main', relativeRoot: 'brickhigh/artifacts/sources', allowedDomains: ['www.lego.com'], allowedPorts: [443], maxBytes: 100000000, timeoutSeconds: 30 },
      httpExchange: { enabled: true, allowedTargets: [{ domain: 'www.lego.com', path: '/api/graphql/PickABrickQuery' }],
        allowedRequestHeaders: { 'content-type': ['application/json'], accept: ['application/json'] },
        fixedHeadersByTarget: [{ domain: 'www.lego.com', path: '/api/graphql/PickABrickQuery', headers: fixedLegoHeaders }],
        requiredRequestHeaders: ['content-type','accept'], requestMaxBytes: 1048576, maxRedirects: 3 },
      legoReplacementParts: { enabled: true, origin: 'https://www.lego.com',
        endpointPath: '/api/graphql/CustomerServiceReplacementPartsSetPiecesSearch',
        nextDataPathPattern: '/_next/data/{buildId}/en-us/service/replacement-parts/missing/{setId}/pieces.json',
        pagePathPattern: '/en-us/service/replacement-parts/missing/{setId}/pieces', methods: ['GET','POST'] },
      plugin: { name: 'exchange-protocol' } };
    const configPath = join(tool, 'config/project.json'); await writeFile(configPath, JSON.stringify(config));
    assert.ok(allToolNames(loadConfig(configPath)).has('archive_external_http_exchange'));
    await writeFile(configPath, JSON.stringify({ ...config, httpExchange: { ...config.httpExchange, allowedRequestHeaders: { authorization: ['secret'] } } }));
    assert.throws(() => loadConfig(configPath), /HTTP exchange headers invalid/);
    await writeFile(configPath, JSON.stringify({ ...config, httpExchange: { ...config.httpExchange,
      fixedHeadersByTarget: [{ domain: 'www.lego.com', path: '/api/graphql/PickABrickQuery', headers: { ...fixedLegoHeaders, origin: 'https://evil.example' } }] } }));
    assert.throws(() => loadConfig(configPath), /HTTP exchange fixed target headers invalid/);
    await writeFile(configPath, JSON.stringify({ ...config, legoReplacementParts: { ...config.legoReplacementParts,
      endpointPath: '/api/graphql/Other' } }));
    assert.throws(() => loadConfig(configPath), /LEGO replacement parts allowlist invalid/);
    await writeFile(configPath, JSON.stringify(config));
    const transport = new StdioClientTransport({ command: process.execPath, args: [join(process.cwd(), 'src/index.js')], cwd: process.cwd(), env: { ...process.env, PROJECT_MCP_CONFIG: configPath }, stderr: 'pipe' });
    client = new Client({ name: 'exchange-protocol-test', version: '1.0.0' }, { capabilities: {} }); await client.connect(transport);
    const tools = (await client.listTools()).tools;
    for (const name of ['get_http_exchange_config','archive_external_http_exchange','inspect_archived_http_exchange','read_archived_http_exchange_range']) assert.ok(tools.some(x => x.name === name), name);
    for (const name of ['get_lego_replacement_parts_config','capture_lego_replacement_parts_metadata','import_lego_replacement_parts_har','close_lego_replacement_parts_browser',
      'inspect_archived_lego_replacement_parts','read_archived_lego_replacement_parts_range']) assert.ok(tools.some(x => x.name === name), name);
    const legoSchema = tools.find(x => x.name === 'capture_lego_replacement_parts_metadata').inputSchema;
    assert.deepEqual([...legoSchema.required].sort(), ['session_id','source_id','set_id','element_id'].sort());
    assert.equal('source_uri' in legoSchema.properties, false);
    assert.equal('request_headers' in legoSchema.properties, false);
    const harSchema = tools.find(x => x.name === 'import_lego_replacement_parts_har').inputSchema;
    assert.deepEqual([...harSchema.required].sort(), ['session_id','source_id','set_id','element_id','har_file_id'].sort());
    assert.equal('file_path' in harSchema.properties, false);
    const legoConfig = JSON.parse((await client.callTool({ name: 'get_lego_replacement_parts_config', arguments: {} })).content[0].text);
    assert.equal(legoConfig.legacyGraphqlEndpoint, 'https://www.lego.com/api/graphql/CustomerServiceReplacementPartsSetPiecesSearch');
    assert.deepEqual(legoConfig.supportedTransports, ['next-data','next-page','graphql']);
    assert.equal(legoConfig.responseMaxBytes, 100000000);
    const schema = tools.find(x => x.name === 'archive_external_http_exchange').inputSchema;
    for (const name of ['session_id','source_id','source_uri','method','request_body','request_headers']) assert.ok(schema.required.includes(name), name);
    const configured = await client.callTool({ name: 'get_http_exchange_config', arguments: {} });
    const settings = JSON.parse(configured.content[0].text);
    assert.equal(settings.responseMaxBytes, 100000000);
    assert.deepEqual(settings.fixedHeadersByTarget[0].headers, fixedLegoHeaders);
    const opened = JSON.parse((await client.callTool({ name: 'begin_workspace_session', arguments: { aliases: ['main'], task_summary: 'exchange tool test' } })).content[0].text);
    await client.callTool({ name: 'read_workspace_text', arguments: { alias: 'main', path: 'AGENTS.md', session_id: opened.id } });
    const rejected = await client.callTool({ name: 'archive_external_http_exchange', arguments: { session_id: opened.id, source_id: 'invalid-method', source_uri: 'https://www.lego.com/api/graphql/PickABrickQuery', method: 'DELETE', request_body: '{}', request_headers: { 'content-type': 'application/json', accept: 'application/json' } } });
    assert.equal(rejected.isError, true); assert.match(rejected.content[0].text, /HTTP_EXCHANGE_METHOD_NOT_ALLOWED/);
  } finally { await client?.close(); await rm(base, { recursive: true, force: true }); }
});
