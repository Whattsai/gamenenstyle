import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:https';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LegoReplacementPartsCapture } from '../src/lego-replacement-parts.js';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const endpoint = '/api/graphql/CustomerServiceReplacementPartsSetPiecesSearch';

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'mcp-lego-replacement-'));
  const key = await readFile(join(fixtures, 'localhost.key'));
  const cert = await readFile(join(fixtures, 'localhost.crt'));
  const state = { status: 200, body: Buffer.from('{"data":{"setId":"10334","piece":{"elementId":"6488969","description":"BRICK 4X4, W/ SOUND, NO. 2","designId":"12345"}}}'),
    method: 'POST', redirect: false, received: [], pageRequests: 0, bootstrap: '', uiDescription: 'BRICK 4X4, W/ SOUND, NO. 2', uiExtra: '' };
  const server = createServer({ key, cert }, async (req, res) => {
    if (req.url.startsWith('/en-us/service/replacement-parts/missing/10334/pieces')) {
      state.pageRequests++;
      const action = state.method === 'POST' ? `fetch('${endpoint}',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':'private-token'},body:JSON.stringify({operationName:'CustomerServiceReplacementPartsSetPiecesSearch',variables:{setId:'10334',search:'6488969'},query:'query CustomerServiceReplacementPartsSetPiecesSearch { search }'})})`
        : state.method === 'NEXT' ? `fetch('/_next/data/build-LIVE/en-us/service/replacement-parts/missing/10334/pieces.json?locale=en-us&setId=10334&search=6488969')`
          : state.method === 'CLIENT' ? '' : `fetch('${endpoint}?setId=10334&search=6488969')`;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'set-cookie': 'session=private-cookie; Secure; HttpOnly; Path=/' });
      res.end(`<html><body><input placeholder="Type the piece number"><button aria-label="Search button" onclick="history.pushState({},'', '?search='+document.querySelector('input').value);document.getElementById('results').textContent='1 result ${state.uiDescription} 6488969 ${state.uiExtra}';${action}">Search</button><div id="results"></div>${state.bootstrap}</body></html>`);
      return;
    }
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    state.received.push({ url: req.url, method: req.method, body: Buffer.concat(chunks), headers: req.headers });
    if (req.url.startsWith(endpoint) || req.url.startsWith('/_next/data/')) {
      if (state.redirect) { res.writeHead(307, { location: '/not-allowlisted' }); res.end(); return; }
      res.writeHead(state.status, { 'content-type': 'application/json' }); res.end(state.body); return;
    }
    res.writeHead(404); res.end('not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `https://localhost:${server.address().port}`;
  const config = { repos: { main: { root } }, toolRoot: join(root, 'tools/chatgpt-local-mcp'), runtimeRoot: join(root, 'runtime'),
    sourceArchive: { alias: 'main', relativeRoot: 'brickhigh/artifacts/sources', allowedDomains: ['www.lego.com'],
      allowedPorts: [443], maxBytes: 100_000_000, timeoutSeconds: 5 },
    httpExchange: { requestMaxBytes: 1048576 }, legoReplacementParts: { origin: 'https://www.lego.com',
      endpointPath: endpoint, pagePathPattern: '/en-us/service/replacement-parts/missing/{setId}/pieces',
      methods: ['GET','POST'] } };
  const service = { requireSession: async (id, alias) => { assert.equal(id, 'session'); assert.equal(alias, 'main'); } };
  const capture = new LegoReplacementPartsCapture(config, service, { testOnlyOrigin: origin,
    testOnlyHeadless: true, testOnlyIgnoreHTTPSErrors: true });
  return { root, server, state, capture, origin, close: async () => {
    await capture.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  } };
}

async function searchInSamePage(f, sourceId) {
  if (!f.capture.page) {
    const first = await f.capture.capture('session', sourceId, '10334', '6488969');
    assert.equal(first.reason, 'BROWSER_INTERACTION_REQUIRED');
  }
  await f.capture.page.getByPlaceholder('Type the piece number').fill('6488969');
  const nextResponse = f.state.method === 'CLIENT' ? null : f.capture.page.waitForResponse(response =>
    response.url().includes('/api/graphql/') || response.url().includes('/_next/data/'), { timeout: 5000 });
  await f.capture.page.getByRole('button', { name: 'Search button' }).click();
  if (nextResponse) await nextResponse;
  return f.capture.capture('session', sourceId, '10334', '6488969');
}

function bootstrapPiece(designId) {
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    query: { setId: '10334' }, props: { pageProps: { setId: '10334', pieces: [{
      elementId: '6488969', description: 'BRICK 4X4, W/ SOUND, NO. 2',
      ...(designId === undefined ? {} : { designId }),
    }] } },
  })}</script>`;
}

test('two_call_browser_session_reuses_same_page and client_side_filter_without_new_request_can_complete_capture', async () => {
  const f = await setup();
  try {
    f.state.method = 'CLIENT';
    f.state.bootstrap = bootstrapPiece();
    f.state.uiExtra = 'Design ID 99999';
    const first = await f.capture.capture('session', 'client-filter', '10334', '6488969');
    assert.equal(first.interactionRequired, true);
    assert.equal(first.reason, 'BROWSER_INTERACTION_REQUIRED');
    assert.equal(first.pageUrl, `${f.origin}/en-us/service/replacement-parts/missing/10334/pieces`);
    const samePage = f.capture.page;
    const originalRequests = f.state.received.length;
    assert.equal(f.state.pageRequests, 1);
    await samePage.getByPlaceholder('Type the piece number').fill('6488969');
    await samePage.getByRole('button', { name: 'Search button' }).click();
    assert.equal(samePage.url(), `${f.origin}/en-us/service/replacement-parts/missing/10334/pieces?search=6488969`);
    assert.equal(f.state.received.length, originalRequests);
    const second = await f.capture.capture('session', 'client-filter', '10334', '6488969');
    assert.equal(f.capture.page, samePage);
    assert.equal(f.state.pageRequests, 1);
    assert.equal(f.state.received.length, originalRequests);
    assert.equal(second.pageUrl, samePage.url());
    assert.equal(second.manifest.sourceTransport, 'next-page');
    assert.equal(second.manifest.requestedUrl, first.pageUrl);
    assert.equal(second.manifest.extractedDescription, 'BRICK 4X4, W/ SOUND, NO. 2');
    assert.equal(second.designId, null);
    assert.equal(second.reason, 'OFFICIAL_DESIGN_ID_NOT_EXPOSED');
    assert.equal(second.manifest.correlation.pageUrl, samePage.url());
    assert.equal(second.manifest.requestSha256, hash(Buffer.alloc(0)));
    assert.equal(second.responseSha256, hash(await readFile(second.responsePath)));
    assert.match((await readFile(second.responsePath, 'utf8')), /__NEXT_DATA__/);
    assert.doesNotMatch(await readFile(second.manifestPath, 'utf8'), /session=private-cookie|Design ID 99999/);
    const inspected = await f.capture.inspect('session', 'client-filter');
    assert.equal(inspected.reason, 'OFFICIAL_DESIGN_ID_NOT_EXPOSED');
  } finally { await f.close(); }
});

test('initial_next_bootstrap supplies official Design ID and DOM only correlates the selected piece', async () => {
  const f = await setup();
  try {
    f.state.method = 'CLIENT';
    f.state.bootstrap = bootstrapPiece('12345');
    const saved = await searchInSamePage(f, 'bootstrap-design');
    assert.equal(saved.designId, '12345');
    assert.equal(saved.reason, null);
    assert.equal(saved.manifest.sourceTransport, 'next-page');
    assert.equal(f.state.received.length, 0);
  } finally { await f.close(); }
});

test('DOM description mismatch cannot promote official bootstrap and conflicting session evidence fails closed', async () => {
  const f = await setup();
  try {
    f.state.method = 'CLIENT';
    f.state.bootstrap = bootstrapPiece();
    f.state.uiDescription = 'A DIFFERENT PART';
    await assert.rejects(searchInSamePage(f, 'wrong-visible-piece'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
    await f.capture.close();
    f.state.method = 'POST';
    f.state.uiDescription = 'BRICK 4X4, W/ SOUND, NO. 2';
    f.state.bootstrap = bootstrapPiece();
    await assert.rejects(searchInSamePage(f, 'conflicting-pool'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_AMBIGUOUS/);
  } finally { await f.close(); }
});

test('browser session ownership, expiry cleanup, and immutable source collision remain enforced', async () => {
  const f = await setup();
  try {
    f.state.method = 'CLIENT';
    f.state.bootstrap = bootstrapPiece();
    const first = await f.capture.capture('session', 'owned-browser', '10334', '6488969');
    assert.equal(first.interactionRequired, true);
    const samePage = f.capture.page;
    f.capture.service.requireSession = async () => {};
    await assert.rejects(f.capture.open('other', '10334'), /LEGO_REPLACEMENT_BROWSER_SESSION_CONFLICT/);
    assert.equal(f.capture.page, samePage);
    await assert.rejects(f.capture.open('session', '99999'), /LEGO_REPLACEMENT_BROWSER_SESSION_CONFLICT/);
    await samePage.getByPlaceholder('Type the piece number').fill('6488969');
    await samePage.getByRole('button', { name: 'Search button' }).click();
    const archived = await f.capture.capture('session', 'owned-browser', '10334', '6488969');
    assert.equal(archived.designId, null);
    await f.capture.close();
    f.state.bootstrap = bootstrapPiece('12345');
    await assert.rejects(searchInSamePage(f, 'owned-browser'), /LEGO_REPLACEMENT_SOURCE_CONFLICT/);
    f.capture.expiresAt = Date.now() - 1;
    const priorPage = f.capture.page;
    const reopened = await f.capture.open('session', '10334');
    assert.notEqual(f.capture.page, priorPage);
    assert.equal(reopened.pageUrl, first.pageUrl);
    assert.equal(await f.capture.closeForSession('session').then(x => x.closed), true);
  } finally { await f.close(); }
});

test('Flight bootstrap records are parsed only as official payload, never from visible DOM', async () => {
  const f = await setup();
  try {
    const correlation = { pageUrl: `${f.origin}/en-us/service/replacement-parts/missing/10334/pieces?search=6488969`,
      setId: '10334', elementId: '6488969', resultCount: 1,
      visibleText: '1 result BRICK 4X4, W/ SOUND, NO. 2 6488969' };
    const body = Buffer.from(`0:${JSON.stringify({ setId: '10334', pieces: [{
      elementId: '6488969', description: 'BRICK 4X4, W/ SOUND, NO. 2', designId: '12345',
    }] })}\n`);
    const exchange = { method: 'GET', requestUrl: `${f.origin}/en-us/service/replacement-parts/missing/10334/pieces`,
      requestBytes: Buffer.alloc(0), status: 200, responseBytes: body };
    assert.equal(f.capture.extractor.select([exchange], '10334', '6488969', correlation).metadata.designId, '12345');
    assert.throws(() => f.capture.extractor.select([exchange], '10334', '6488969'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
  } finally { await f.close(); }
});

test('browser capture archives exact scoped POST and response without publishing cookie or token', async () => {
  const f = await setup();
  try {
    const archived = await searchInSamePage(f, 'lego-replacement-10334-6488969');
    const received = f.state.received.at(-1);
    assert.equal(received.method, 'POST'); assert.equal(received.url, endpoint);
    assert.equal(received.headers.cookie, 'session=private-cookie');
    assert.equal(received.headers['x-csrf-token'], 'private-token');
    assert.deepEqual(await readFile(archived.requestPath), received.body);
    assert.deepEqual(await readFile(archived.responsePath), f.state.body);
    assert.equal(archived.requestSha256, hash(received.body));
    assert.equal(archived.responseSha256, hash(f.state.body));
    assert.equal(archived.httpStatus, 200); assert.equal(archived.ok, true);
    assert.equal(archived.manifest.setId, '10334'); assert.equal(archived.manifest.elementId, '6488969');
    assert.equal(archived.manifest.finalUrl, `${f.origin}${endpoint}`);
    assert.equal(archived.manifest.contentType, 'application/json');
    assert.match(archived.manifest.observedAt, /^\d{4}-\d\d-\d\dT.*Z$/);
    assert.equal(archived.manifest.credentialHeadersOmitted, true);
    assert.equal(archived.manifest.requestBodyRepresentation, 'playwright_post_data_buffer');
    assert.equal(archived.manifest.responseBodyRepresentation, 'playwright_response_body');
    const manifestText = await readFile(archived.manifestPath, 'utf8');
    assert.doesNotMatch(manifestText, /private-cookie|private-token|"cookie"|x-csrf-token/);
    const inspected = await f.capture.inspect('session', 'lego-replacement-10334-6488969');
    assert.equal(inspected.responseSha256, archived.responseSha256);
    const range = await f.capture.readRange('session', 'lego-replacement-10334-6488969', 'response', 0, 256);
    assert.equal(range.encoding, 'utf-8'); assert.equal(range.data, f.state.body.toString()); assert.equal(range.eof, true);
    f.state.body = Buffer.from('{"data":{"setId":"10334","piece":{"elementId":"6488969","description":"BRICK 4X4, W/ SOUND, NO. 2","designId":"changed"}}}');
    await assert.rejects(searchInSamePage(f, 'lego-replacement-10334-6488969'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_AMBIGUOUS/);
    assert.equal((await readFile(archived.responsePath)).toString(), range.data);
  } finally { await f.close(); }
});

test('non-2xx without metadata is rejected and response bound stays at 100 MB', async () => {
  const f = await setup();
  try {
    assert.equal(f.capture.settings().responseMaxBytes, 100_000_000);
    for (const status of [400, 403, 429, 500]) {
      f.state.status = status; f.state.body = Buffer.from(`{"errors":[{"message":"HTTP ${status}"}]}`);
      const id = `lego-http-${status}`;
      await assert.rejects(searchInSamePage(f, id), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
    }
    f.state.method = 'GET';
    await f.capture.close();
    await assert.rejects(searchInSamePage(f, 'lego-get'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
  } finally { await f.close(); }
});

test('capture refuses other targets, unsafe redirects, invalid scope, and tampered bytes', async () => {
  const f = await setup();
  try {
    assert.throws(() => f.capture.validateTarget(`${f.origin}/api/graphql/PickABrickQuery`), /LEGO_REPLACEMENT_TARGET_NOT_ALLOWED/);
    assert.throws(() => f.capture.validateTarget('https://example.org/api/graphql/CustomerServiceReplacementPartsSetPiecesSearch'), /LEGO_REPLACEMENT_TARGET_NOT_ALLOWED/);
    assert.throws(() => f.capture.validateTarget(`${f.origin}${endpoint}?token=secret`), /LEGO_REPLACEMENT_TARGET_NOT_ALLOWED/);
    await assert.rejects(f.capture.capture('session', 'bad-scope', '10334', '123'), /LEGO_REPLACEMENT_MALFORMED_REQUEST/);
    f.state.redirect = true;
    await assert.rejects(searchInSamePage(f, 'redirected'), /LEGO_REPLACEMENT_REDIRECT_REJECTED/);
    await assert.rejects(f.capture.inspect('session', 'redirected'), /LEGO_REPLACEMENT_SOURCE_NOT_FOUND/);
    f.state.redirect = false;
    await f.capture.close();
    const archived = await searchInSamePage(f, 'tamper-check');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(archived.responsePath, 'tampered');
    await assert.rejects(f.capture.inspect('session', 'tamper-check'), /LEGO_REPLACEMENT_INTEGRITY_FAILURE/);
  } finally { await f.close(); }
});

test('private Chrome HAR imports only the exact scoped exchange and omits credentials', async () => {
  const f = await setup();
  try {
    const request = JSON.stringify({ operationName: 'CustomerServiceReplacementPartsSetPiecesSearch',
      variables: { setId: '10334', search: '6488969' }, query: 'query CustomerServiceReplacementPartsSetPiecesSearch { search }' });
    const response = Buffer.from('{"data":{"setId":"10334","piece":{"elementId":"6488969","description":"BRICK 4X4, W/ SOUND, NO. 2","designId":"12345"}}}');
    const entry = { request: { method: 'POST', url: `${f.origin}${endpoint}`,
      headers: [{ name: 'Content-Type', value: 'application/json' },
        { name: 'Cookie', value: 'session=private-cookie' }, { name: 'X-CSRF-Token', value: 'private-token' }],
      cookies: [{ name: 'session', value: 'private-cookie' }], postData: { text: request } },
      response: { status: 200, redirectURL: '', content: { mimeType: 'application/json', encoding: 'base64', text: response.toString('base64') } } };
    const inbox = join(f.capture.config.runtimeRoot, 'lego-replacement-har-inbox');
    await mkdir(inbox, { recursive: true });
    const path = join(inbox, 'chrome-10334.har');
    const rawHar = Buffer.from(JSON.stringify({ log: { entries: [entry] } }));
    await writeFile(path, rawHar);
    const archived = await f.capture.importHar('session', 'har-10334-6488969', '10334', '6488969', 'chrome-10334');
    assert.equal(archived.manifest.captureMode, 'user_har_import');
    assert.equal(archived.manifest.requestBodyRepresentation, 'har_post_data_utf8_text');
    assert.equal(archived.manifest.responseBodyRepresentation, 'har_base64');
    assert.equal(archived.manifest.inputHarSha256, hash(rawHar));
    assert.equal(archived.requestSha256, hash(Buffer.from(request)));
    assert.equal(archived.responseSha256, hash(response));
    assert.deepEqual(await readFile(archived.requestPath), Buffer.from(request));
    assert.deepEqual(await readFile(archived.responsePath), response);
    assert.equal(archived.manifest.credentialHeadersOmitted, true);
    assert.doesNotMatch(await readFile(archived.manifestPath, 'utf8'), /private-cookie|private-token|"cookie"|x-csrf-token/);
    assert.equal((await f.capture.readRange('session', 'har-10334-6488969', 'response', 0, 1024)).data, response.toString());
    await assert.rejects(f.capture.importHar('session', 'bad-id', '10334', '6488969', '../bad'), /LEGO_REPLACEMENT_MALFORMED_REQUEST/);
    await writeFile(path, JSON.stringify({ log: { entries: [{ ...entry, request: { ...entry.request, url: `${f.origin}/api/graphql/Other` } }] } }));
    await assert.rejects(f.capture.importHar('session', 'wrong-target', '10334', '6488969', 'chrome-10334'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
    await writeFile(path, JSON.stringify({ log: { entries: [entry, { ...entry, response: { ...entry.response, content: { ...entry.response.content, text: Buffer.from(response.toString().replace('12345','54321')).toString('base64') } } }] } }));
    await assert.rejects(f.capture.importHar('session', 'ambiguous', '10334', '6488969', 'chrome-10334'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_AMBIGUOUS/);
    await writeFile(path, JSON.stringify({ log: { entries: [{ ...entry, response: { ...entry.response, status: 307, redirectURL: 'https://127.0.0.1/private' } }] } }));
    await assert.rejects(f.capture.importHar('session', 'bad-redirect', '10334', '6488969', 'chrome-10334'), /LEGO_REPLACEMENT_REDIRECT_REJECTED/);
    await writeFile(path, JSON.stringify({ log: { entries: [{ ...entry, response: { ...entry.response, content: {} } }] } }));
    await assert.rejects(f.capture.importHar('session', 'no-body', '10334', '6488969', 'chrome-10334'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
    await writeFile(path, JSON.stringify({ log: { entries: [entry] } }));
    f.capture.config.sourceArchive.maxBytes = 8;
    await assert.rejects(f.capture.importHar('session', 'over-bound', '10334', '6488969', 'chrome-10334'), /LEGO_REPLACEMENT_RESPONSE_TOO_LARGE/);
    await assert.rejects(f.capture.inspect('session', 'over-bound'), /LEGO_REPLACEMENT_SOURCE_NOT_FOUND/);
  } finally { await f.close(); }
});

test('sanitized real HAR shape is recognized but query echo is not official piece metadata', async () => {
  const f = await setup();
  try {
    const inbox = join(f.capture.config.runtimeRoot, 'lego-replacement-har-inbox');
    await mkdir(inbox, { recursive: true });
    await writeFile(join(inbox, 'real-shape.har'), await readFile(join(fixtures, 'lego-10334-6488969-sanitized.har.json')));
    const production = new LegoReplacementPartsCapture(f.capture.config, f.capture.service);
    assert.equal(production.extractor.target('https://www.lego.com/_next/data/O8QbqEm4mK_6tvobEDqek/en-us/service/replacement-parts/missing/10334/pieces.json?locale=en-us&setId=10334&search=6488969').transport, 'next-data');
    await assert.rejects(production.importHar('session', 'real-shape', '10334', '6488969', 'real-shape'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
    await assert.rejects(production.inspect('session', 'real-shape'), /LEGO_REPLACEMENT_SOURCE_NOT_FOUND/);
  } finally { await f.close(); }
});

test('Next data accepts dynamic build IDs only with matching response set, Element and part metadata', async () => {
  const f = await setup();
  try {
    const inbox = join(f.capture.config.runtimeRoot, 'lego-replacement-har-inbox');
    await mkdir(inbox, { recursive: true });
    const path = join(inbox, 'next-data.har');
    const make = (buildId, querySet, search, dataSet, dataElement, description, designId) => ({
      log: { entries: [{ request: { method: 'GET',
        url: `${f.origin}/_next/data/${buildId}/en-us/service/replacement-parts/missing/10334/pieces.json?locale=en-us&setId=${querySet}&search=${search}`,
        headers: [{ name: 'Cookie', value: 'session=private-cookie' }] },
        response: { status: 200, redirectURL: '', content: { mimeType: 'application/json', text: JSON.stringify({
          query: { setId: querySet }, props: { pageProps: { setId: dataSet, pieces: [{ elementId: dataElement,
            description, ...(designId === undefined ? {} : { designId }) }] } } }) } } }] } });
    for (const [build, design] of [['build_A-123', undefined], ['build_B-456', '98765']]) {
      await writeFile(path, JSON.stringify(make(build, '10334', '6488969', '10334', '6488969', 'BRICK 4X4, W/ SOUND, NO. 2', design)));
      const saved = await f.capture.importHar('session', `next-${build.toLowerCase().replaceAll('_','-')}`, '10334', '6488969', 'next-data');
      assert.equal(saved.manifest.sourceTransport, 'next-data');
      assert.equal(saved.manifest.extractedDesignId, design ?? null);
      assert.equal(saved.manifest.extractedDescription, 'BRICK 4X4, W/ SOUND, NO. 2');
      assert.equal(saved.manifest.requestByteLength, 0);
      assert.equal(saved.responseSha256, hash(await readFile(saved.responsePath)));
      assert.doesNotMatch(await readFile(saved.manifestPath, 'utf8'), /private-cookie|session=/);
    }
    for (const [label, args] of [
      ['query-set', ['build_C-789', '99999', '6488969', '10334', '6488969', 'BRICK', undefined]],
      ['query-element', ['build_C-789', '10334', '1111111', '10334', '6488969', 'BRICK', undefined]],
      ['response-set', ['build_C-789', '10334', '6488969', '99999', '6488969', 'BRICK', undefined]],
      ['response-element', ['build_C-789', '10334', '6488969', '10334', '1111111', 'BRICK', undefined]],
      ['no-description', ['build_C-789', '10334', '6488969', '10334', '6488969', '', undefined]],
    ]) {
      await writeFile(path, JSON.stringify(make(...args)));
      await assert.rejects(f.capture.importHar('session', `bad-${label}`, '10334', '6488969', 'next-data'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
    }
    await writeFile(path, JSON.stringify(make('build_C-789', '10334', '6488969', '10334', '6488969', 'BRICK', null)));
    const noDesign = await f.capture.importHar('session', 'null-design', '10334', '6488969', 'next-data');
    assert.equal(noDesign.manifest.extractedDesignId, null);
  } finally { await f.close(); }
});

test('HTML Next data __NEXT_DATA__ piece is parsed, while URL-only and unsafe targets are rejected', async () => {
  const f = await setup();
  try {
    const extractor = f.capture.extractor;
    const url = `${f.origin}/_next/data/build-ABC/en-us/service/replacement-parts/missing/10334/pieces.json?locale=en-us&setId=10334&search=6488969`;
    const payload = { query: { setId: '10334', search: '6488969' }, props: { pageProps: { setId: '10334',
      pieces: [{ elementId: '6488969', description: 'BRICK 4X4, W/ SOUND, NO. 2' }] } } };
    const exchange = { method: 'GET', requestUrl: url, requestBytes: Buffer.alloc(0), status: 200,
      responseBytes: Buffer.from(`<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script>`) };
    assert.equal(extractor.select([exchange], '10334', '6488969').metadata.designId, null);
    for (const bad of [url.replace('build-ABC','x'), url.replace(f.origin,'https://example.org'),
      url.replace('search=6488969','search=6488969&session=private')])
      assert.throws(() => extractor.target(bad), /LEGO_REPLACEMENT_TARGET_NOT_ALLOWED/);
    assert.equal(extractor.extract({ ...exchange, responseBytes: Buffer.from('<p>6488969 BRICK 4X4</p>') }, '10334', '6488969'), null);
    assert.throws(() => extractor.select([{ ...exchange, responseBytes: Buffer.from('bad') }], '10334', '6488969'), /LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND/);
  } finally { await f.close(); }
});

test('live Next data capture and HAR import use the same evidence extractor', async () => {
  const f = await setup();
  try {
    f.state.method = 'NEXT';
    f.state.body = Buffer.from(JSON.stringify({ query: { setId: '10334' }, props: { pageProps: { setId: '10334',
      pieces: [{ elementId: '6488969', description: 'BRICK 4X4, W/ SOUND, NO. 2' }] } } }));
    const live = await searchInSamePage(f, 'live-next');
    assert.equal(live.manifest.sourceTransport, 'next-data');
    assert.equal(live.designId, null);
    const received = f.state.received.at(-1);
    const inbox = join(f.capture.config.runtimeRoot, 'lego-replacement-har-inbox');
    await mkdir(inbox, { recursive: true });
    await writeFile(join(inbox, 'live-next.har'), JSON.stringify({ log: { entries: [{
      request: { method: received.method, url: `${f.origin}${received.url}`, headers: [] },
      response: { status: 200, redirectURL: '', content: { mimeType: 'application/json', text: f.state.body.toString() } },
    }] } }));
    const imported = await f.capture.importHar('session', 'imported-next', '10334', '6488969', 'live-next');
    assert.deepEqual([imported.manifest.extractedSetId, imported.manifest.extractedElementId, imported.designId],
      [live.manifest.extractedSetId, live.manifest.extractedElementId, live.designId]);
    assert.equal(imported.responseSha256, live.responseSha256);
  } finally { await f.close(); }
});
