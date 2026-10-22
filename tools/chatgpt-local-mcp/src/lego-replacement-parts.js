import { createHash, randomUUID } from 'node:crypto';
import { lookup as dnsLookup } from 'node:dns/promises';
import { lstat, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';
import ipaddr from 'ipaddr.js';
import { safePath } from './core.js';
import { ReplacementPartsEvidenceExtractor } from './replacement-parts-evidence.js';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = (name) => { throw new Error(`LEGO_REPLACEMENT_${name}`); };
const sourceIdPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
const setPattern = /^[0-9]{4,7}$/;
const elementPattern = /^[0-9]{6,8}$/;
const safeHeaderNames = new Set(['accept', 'content-type', 'origin', 'referer', 'user-agent', 'x-locale']);
const secretName = /(?:authorization|cookie|proxy|token|secret|password|passwd|api.?key|credential|signature|session|bearer)/i;

function publicIp(value) {
  try {
    const address = ipaddr.process(value);
    return address.range() === 'unicast' &&
      (address.kind() !== 'ipv6' || (address.match(ipaddr.parse('2000::'), 3) &&
        !address.match(ipaddr.parse('2002::'), 16) && !address.match(ipaddr.parse('2001::'), 32)));
  } catch { return false; }
}

export class LegoReplacementPartsCapture {
  constructor(config, service, options = {}) {
    this.config = config;
    this.service = service;
    this.origin = options.testOnlyOrigin ?? config.legoReplacementParts.origin;
    this.extractor = new ReplacementPartsEvidenceExtractor(this.origin);
    this.headless = options.testOnlyHeadless ?? false;
    this.ignoreHTTPSErrors = options.testOnlyIgnoreHTTPSErrors ?? false;
    this.testOnlyAllowPrivateHost = Boolean(options.testOnlyOrigin);
    this.resolveAll = options.resolveAll ?? (host => dnsLookup(host, { all: true, verbatim: true }));
    this.browser = null;
    this.context = null;
    this.page = null;
    this.browserSessionId = null;
    this.setId = null;
    this.pinnedAddress = null;
    this.pageHttpStatus = null;
    this.expiresAt = 0;
    this.expiryTimer = null;
    this.evidencePending = [];
    this.evidenceBytes = 0;
    this.evidenceFailure = null;
  }

  settings() {
    return { pagePattern: `${this.origin}${this.config.legoReplacementParts.pagePathPattern}`,
      supportedTransports: ['next-data', 'next-page', 'graphql'],
      nextDataPattern: `${this.origin}/_next/data/{dynamicBuildId}/en-us/service/replacement-parts/missing/{setId}/pieces.json?locale=en-us&setId={setId}&search={elementId}`,
      legacyGraphqlEndpoint: `${this.origin}${this.config.legoReplacementParts.endpointPath}`,
      methods: this.config.legoReplacementParts.methods,
      responseMaxBytes: this.config.sourceArchive.maxBytes,
      requestMaxBytes: this.config.httpExchange.requestMaxBytes,
      timeoutSeconds: this.config.sourceArchive.timeoutSeconds,
      browserSessionSeconds: 600, sensitiveHeadersArchived: false,
      clientSideFilteringSupported: true,
      captureFlow: 'Call capture once to open the visible page. After the user searches, call capture again with the same session_id, source_id, set_id, and element_id; the same page and prior official responses are inspected without another search or navigation.',
      harInboxPath: join(this.config.runtimeRoot, 'lego-replacement-har-inbox'),
      harImportMaxBytes: 150_000_000,
      harImportHint: 'In Chrome DevTools Network, clear existing requests, search the set Element once, export HAR with content, and save <har_file_id>.har in the private inbox. Do not put HAR files in the repository.' };
  }

  validateTarget(value) {
    return this.extractor.target(value).url;
  }

  isEvidenceTarget(value) {
    try { this.extractor.target(value); return true; } catch { return false; }
  }

  publicHeaders(headers, setId) {
    const result = {}, secrets = [];
    const pairs = Array.isArray(headers) ? headers.map(h => [h?.name, h?.value]) : Object.entries(headers ?? {});
    for (const [rawName, value] of pairs) {
      if (typeof rawName !== 'string' || typeof value !== 'string') continue;
      const name = rawName.toLowerCase();
      if (secretName.test(name)) { if (value) secrets.push(value); continue; }
      if (!safeHeaderNames.has(name) || value.length > 512 || /[\r\n\0]/.test(value)) continue;
      if (name === 'origin' && value !== this.origin) continue;
      if (name === 'referer') {
        try {
          const referer = new URL(value);
          if (referer.origin !== this.origin || !/^\/en-us\/service\/replacement-parts\/missing\/[0-9]{4,7}\/pieces$/.test(referer.pathname) ||
            !referer.pathname.includes(`/${setId}/`) || [...referer.searchParams.keys()].some(key => key !== 'search')) continue;
        } catch { continue; }
      }
      result[name] = value;
    }
    return { headers: result, secrets };
  }

  currentPageUrl() {
    if (!this.page || this.page.isClosed()) return null;
    try {
      const target = this.extractor.target(this.page.url());
      if (target.transport !== 'next-page' || target.routeSetId !== this.setId) return null;
      const search = target.url.searchParams.get('search');
      return `${this.origin}${target.url.pathname}${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    } catch { return null; }
  }

  async domSelection(setId, elementId) {
    const pageUrl = this.currentPageUrl();
    if (!pageUrl) return null;
    const url = new URL(pageUrl);
    if (url.searchParams.get('search') !== elementId || url.searchParams.getAll('search').length !== 1) return null;
    let visibleText, input;
    try {
      visibleText = await this.page.locator('body').innerText({ timeout: 2000 });
      input = await this.page.getByPlaceholder('Type the piece number').inputValue({ timeout: 2000 }).catch(() => null);
    } catch { return null; }
    if (visibleText.length > 200_000 || (input && input !== elementId) ||
      !/(?:^|\W)1\s+result(?:s)?(?:\W|$)/i.test(visibleText) ||
      [...visibleText.matchAll(new RegExp(`(?:^|\\D)${elementId}(?!\\d)`, 'g'))].length !== 1) return null;
    return { pageUrl, setId, elementId, resultCount: 1, visibleText };
  }

  async browserExchange(response) {
    const request = response.request();
    this.validateTarget(request.url());
    if (response.status() >= 300 && response.status() < 400 || response.url() !== request.url() ||
      request.redirectedFrom() || request.redirectedTo()) fail('REDIRECT_REJECTED');
    const remote = await response.serverAddr();
    if (!remote || (!this.testOnlyAllowPrivateHost &&
      ipaddr.process(remote.ipAddress).toString() !== ipaddr.process(this.pinnedAddress).toString())) fail('ADDRESS_BLOCKED');
    const requestBytes = request.postDataBuffer() ?? Buffer.alloc(0);
    if (requestBytes.length > this.config.httpExchange.requestMaxBytes) fail('REQUEST_TOO_LARGE');
    if (Number(response.headers()['content-length']) > this.config.sourceArchive.maxBytes) fail('RESPONSE_TOO_LARGE');
    let responseBytes;
    try { responseBytes = await response.body(); } catch { fail('NETWORK_ERROR'); }
    if (responseBytes.length > this.config.sourceArchive.maxBytes) fail('RESPONSE_TOO_LARGE');
    this.evidenceBytes += responseBytes.length;
    if (this.evidenceBytes > this.config.sourceArchive.maxBytes) fail('EVIDENCE_POOL_TOO_LARGE');
    const allHeaders = await request.allHeaders();
    const clean = this.publicHeaders(allHeaders, this.setId);
    const responseHeaders = await response.allHeaders();
    const setCookieValues = String(responseHeaders['set-cookie'] ?? '').split(/,(?=[^;,=]+=[^;,]+)/)
      .map(cookie => cookie.split(';', 1)[0]?.split('=', 2)[1]).filter(Boolean);
    if (clean.secrets.some(value => value.length >= 8 &&
      (requestBytes.includes(Buffer.from(value)) || responseBytes.includes(Buffer.from(value)))) ||
      setCookieValues.some(value => value.length >= 8 && responseBytes.includes(Buffer.from(value)))) fail('SENSITIVE_BODY');
    return { method: request.method(), requestUrl: request.url(), finalUrl: response.url(),
      status: response.status(), contentType: response.headers()['content-type'] ?? '', requestBytes,
      responseBytes, requestHeaders: clean.headers, credentialHeadersOmitted: clean.secrets.length > 0,
      captureMode: 'browser', requestBodyRepresentation: 'playwright_post_data_buffer',
      responseBodyRepresentation: 'playwright_response_body' };
  }

  async resolveHost() {
    const host = new URL(this.origin).hostname;
    if (!this.config.sourceArchive.allowedDomains.includes(host) && !this.testOnlyAllowPrivateHost) fail('DOMAIN_NOT_ALLOWED');
    if (!this.config.sourceArchive.allowedPorts.includes(Number(new URL(this.origin).port || 443)) && !this.testOnlyAllowPrivateHost) fail('PORT_NOT_ALLOWED');
    let addresses;
    try { addresses = await this.resolveAll(host); } catch { fail('NETWORK_ERROR'); }
    if (!Array.isArray(addresses) || !addresses.length || addresses.some(item =>
      !item || !ipaddr.isValid(item.address) || item.family !== (ipaddr.parse(item.address).kind() === 'ipv4' ? 4 : 6))) fail('DNS_INVALID');
    if (!this.testOnlyAllowPrivateHost && addresses.some(item => !publicIp(item.address))) fail('ADDRESS_BLOCKED');
    const selected = addresses.find(item => item.family === 4) ?? addresses[0];
    return selected.address;
  }

  async close() {
    const browser = this.browser;
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.browser = null; this.context = null; this.page = null;
    this.browserSessionId = null; this.setId = null; this.pinnedAddress = null; this.pageHttpStatus = null; this.expiresAt = 0;
    this.expiryTimer = null; this.evidencePending = []; this.evidenceBytes = 0; this.evidenceFailure = null;
    if (browser) await browser.close();
    return { closed: Boolean(browser) };
  }

  async closeForSession(sessionId) {
    if (this.browser && this.browserSessionId !== sessionId) fail('BROWSER_SESSION_CONFLICT');
    return this.close();
  }

  async open(sessionId, setId) {
    await this.service.requireSession(sessionId, this.config.sourceArchive.alias, true);
    if (!setPattern.test(setId)) fail('MALFORMED_REQUEST');
    if (this.browser && (this.browserSessionId !== sessionId || this.setId !== setId)) fail('BROWSER_SESSION_CONFLICT');
    if (this.browser && (Date.now() >= this.expiresAt || !this.page || this.page.isClosed())) await this.close();
    if (!this.browser) {
      const pinned = await this.resolveHost();
      const host = new URL(this.origin).hostname;
      const args = this.testOnlyAllowPrivateHost ? [] : [`--host-resolver-rules=MAP ${host} ${pinned}`];
      this.browser = await chromium.launch({ ...(this.testOnlyAllowPrivateHost ? {} : { channel: 'chrome' }),
        headless: this.headless, args });
      try {
        this.context = await this.browser.newContext({ locale: 'en-US', serviceWorkers: 'block',
          acceptDownloads: false, ignoreHTTPSErrors: this.ignoreHTTPSErrors });
        await this.context.route('**/*', route => {
          const request = route.request();
          let url;
          try { url = new URL(request.url()); } catch { return route.abort(); }
          if (url.origin !== this.origin || url.protocol !== 'https:' || url.username || url.password || url.hash) return route.abort();
          let prior = request.redirectedFrom();
          while (prior) {
            if (this.isEvidenceTarget(prior.url()) && !this.isEvidenceTarget(url.href)) return route.abort();
            prior = prior.redirectedFrom();
          }
          return route.continue();
        });
        this.page = await this.context.newPage();
        this.browserSessionId = sessionId; this.setId = setId; this.pinnedAddress = pinned;
        this.expiresAt = Date.now() + 600_000;
        this.expiryTimer = setTimeout(() => { this.close().catch(() => {}); }, 600_000);
        this.expiryTimer.unref?.();
        this.page.on('response', response => {
          if (!this.isEvidenceTarget(response.url())) return;
          if (this.evidencePending.length >= 64) { this.evidenceFailure = new Error('LEGO_REPLACEMENT_EVIDENCE_POOL_LIMIT'); return; }
          const pending = this.browserExchange(response).catch(error => {
            this.evidenceFailure = error; return null;
          });
          this.evidencePending.push(pending);
        });
        const pageUrl = `${this.origin}/en-us/service/replacement-parts/missing/${setId}/pieces`;
        try { const response = await this.page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: this.config.sourceArchive.timeoutSeconds * 1000 });
          this.pageHttpStatus = response?.status() ?? null; }
        catch { fail('BROWSER_NAVIGATION_FAILED'); }
      } catch (error) { await this.close(); throw error; }
    }
    return { browserOpen: true, pageUrl: this.currentPageUrl(), pageHttpStatus: this.pageHttpStatus,
      expiresAt: new Date(this.expiresAt).toISOString() };
  }

  async capture(sessionId, sourceId, setId, elementId) {
    if (!sourceIdPattern.test(sourceId) || !setPattern.test(setId) || !elementPattern.test(elementId)) fail('MALFORMED_REQUEST');
    const opened = await this.open(sessionId, setId);
    const correlation = await this.domSelection(setId, elementId);
    if (!correlation) return { ...opened, captured: false, interactionRequired: true, reason: 'BROWSER_INTERACTION_REQUIRED' };
    let waitTimer;
    let settled;
    try {
      settled = await Promise.race([
        Promise.all(this.evidencePending),
        new Promise((_, reject) => { waitTimer = setTimeout(() => reject(new Error('LEGO_REPLACEMENT_EVIDENCE_CAPTURE_TIMEOUT')),
          this.config.sourceArchive.timeoutSeconds * 1000); }),
      ]);
    } finally { clearTimeout(waitTimer); }
    if (this.evidenceFailure) throw this.evidenceFailure;
    const selected = this.extractor.select(settled.filter(Boolean), setId, elementId, correlation);
    const saved = await this.save(sessionId, sourceId, setId, elementId, { ...selected.exchange,
      metadata: selected.metadata, correlation });
    return { ...saved, pageUrl: correlation.pageUrl };
  }

  async importHar(sessionId, sourceId, setId, elementId, harFileId) {
    await this.service.requireSession(sessionId, this.config.sourceArchive.alias, true);
    if (!sourceIdPattern.test(sourceId) || !setPattern.test(setId) || !elementPattern.test(elementId) ||
      !sourceIdPattern.test(harFileId)) fail('MALFORMED_REQUEST');
    const inbox = join(this.config.runtimeRoot, 'lego-replacement-har-inbox');
    const inputPath = join(inbox, `${harFileId}.har`);
    let raw, payload;
    try {
      if (!(await lstat(inbox)).isDirectory() || !(await lstat(inputPath)).isFile() ||
        (await stat(inputPath)).size > 150_000_000) fail('HAR_INVALID');
      raw = await readFile(inputPath);
      payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
    } catch (error) {
      if (error.code === 'ENOENT') fail('HAR_NOT_FOUND');
      if (error instanceof SyntaxError || error instanceof TypeError) fail('HAR_INVALID');
      throw error;
    }
    const entries = payload?.log?.entries;
    if (!Array.isArray(entries) || entries.length > 1000) fail('HAR_INVALID');
    const exchanges = [];
    for (const entry of entries) {
      if (!entry?.request || typeof entry.request.url !== 'string') continue;
      let url;
      try { url = this.validateTarget(entry.request.url); } catch { continue; }
      const method = entry.request.method;
      if (!['GET','POST'].includes(method)) continue;
      let requestBytes;
      if (method === 'POST') {
        if (typeof entry.request.postData?.text !== 'string') continue;
        requestBytes = Buffer.from(entry.request.postData.text, 'utf8');
      } else requestBytes = Buffer.alloc(0);
      if (requestBytes.length > this.config.httpExchange.requestMaxBytes) fail('REQUEST_TOO_LARGE');
      try { this.extractor.scope({ method, requestUrl: url.href, requestBytes }, setId, elementId); } catch { continue; }
      const status = entry.response?.status;
      if (!Number.isInteger(status) || status < 200 || status >= 600) continue;
      if (status >= 300 && status < 400 || entry.response?.redirectURL) fail('REDIRECT_REJECTED');
      const content = entry.response?.content;
      if (!content || typeof content.text !== 'string') continue;
      let responseBytes;
      if (content.encoding === 'base64') {
        if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(content.text)) fail('HAR_INVALID');
        responseBytes = Buffer.from(content.text, 'base64');
      } else if (content.encoding === undefined || content.encoding === '') {
        responseBytes = Buffer.from(content.text, 'utf8');
      } else continue;
      if (responseBytes.length > this.config.sourceArchive.maxBytes) fail('RESPONSE_TOO_LARGE');
      const clean = this.publicHeaders(entry.request.headers, setId);
      const secretValues = [...clean.secrets];
      if (Array.isArray(entry.request.cookies)) for (const cookie of entry.request.cookies)
        if (typeof cookie?.value === 'string' && cookie.value) secretValues.push(cookie.value);
      if (secretValues.some(value => value.length >= 8 &&
        (requestBytes.includes(Buffer.from(value)) || responseBytes.includes(Buffer.from(value))))) fail('HAR_SENSITIVE_BODY');
      exchanges.push({ method, requestUrl: url.href, finalUrl: url.href, status,
        contentType: String(content.mimeType ?? ''), requestBytes, responseBytes,
        requestHeaders: clean.headers, credentialHeadersOmitted: secretValues.length > 0,
        captureMode: 'user_har_import', inputHarSha256: sha(raw),
        requestBodyRepresentation: method === 'POST' ? 'har_post_data_utf8_text' : 'har_empty_get',
        responseBodyRepresentation: content.encoding === 'base64' ? 'har_base64' : 'har_utf8_text' });
    }
    const selected = this.extractor.select(exchanges, setId, elementId);
    return this.save(sessionId, sourceId, setId, elementId, { ...selected.exchange, metadata: selected.metadata });
  }

  async paths(sourceId) {
    if (!sourceIdPattern.test(sourceId)) fail('MALFORMED_REQUEST');
    const archive = this.config.sourceArchive, root = this.config.repos[archive.alias].root;
    const prefix = `${archive.relativeRoot}/${sourceId}`;
    return { root, folder: await safePath(root, prefix, this.config.toolRoot),
      request: await safePath(root, `${prefix}/request.bin`, this.config.toolRoot),
      response: await safePath(root, `${prefix}/response.bin`, this.config.toolRoot),
      manifest: await safePath(root, `${prefix}/lego-replacement-manifest.json`, this.config.toolRoot) };
  }

  async save(sessionId, sourceId, setId, elementId, captured) {
    await this.service.requireSession(sessionId, this.config.sourceArchive.alias, true);
    if (/"(?:authorization|cookie|(?:access|refresh|csrf)[_-]?token|token|secret|password|api[_-]?key|credential|signature|session[_-]?id|user[_-]?id|analytics[_-]?id|visitor[_-]?id|tracking[_-]?id|device[_-]?id)"\s*:/i.test(captured.responseBytes.toString('utf8'))) fail('SENSITIVE_BODY');
    const paths = await this.paths(sourceId);
    const manifest = { schemaVersion: 2, sourceId, setId, elementId, extractedSetId: captured.metadata.setId,
      extractedElementId: captured.metadata.elementId, extractedDesignId: captured.metadata.designId,
      designId: captured.metadata.designId,
      reason: captured.metadata.designId === null ? 'OFFICIAL_DESIGN_ID_NOT_EXPOSED' : null,
      extractedDescription: captured.metadata.description, sourceTransport: captured.metadata.sourceTransport,
      ...(captured.correlation ? { correlation: { pageUrl: captured.correlation.pageUrl,
        setId, elementId, resultCount: 1, description: captured.metadata.description } } : {}),
      method: captured.method,
      requestedUrl: captured.requestUrl, finalUrl: captured.finalUrl, observedAt: new Date().toISOString(),
      captureMode: captured.captureMode, ...(captured.inputHarSha256 ? { inputHarSha256: captured.inputHarSha256 } : {}),
      requestBodyRepresentation: captured.requestBodyRepresentation,
      responseBodyRepresentation: captured.responseBodyRepresentation,
      httpStatus: captured.status, ok: captured.status >= 200 && captured.status < 300,
      contentType: captured.contentType, requestByteLength: captured.requestBytes.length,
      responseByteLength: captured.responseBytes.length, requestSha256: sha(captured.requestBytes),
      responseSha256: sha(captured.responseBytes), requestHeaders: captured.requestHeaders,
      credentialHeadersOmitted: captured.credentialHeadersOmitted,
      paths: { request: paths.request.relative, response: paths.response.relative, manifest: paths.manifest.relative } };
    const root = await safePath(paths.root, this.config.sourceArchive.relativeRoot, this.config.toolRoot);
    await mkdir(root.absolute, { recursive: true });
    await safePath(paths.root, this.config.sourceArchive.relativeRoot, this.config.toolRoot);
    const stage = join(root.absolute, `.lego-replacement-stage-${randomUUID()}`);
    await mkdir(stage);
    try {
      await writeFile(join(stage, 'request.bin'), captured.requestBytes, { flag: 'wx' });
      await writeFile(join(stage, 'response.bin'), captured.responseBytes, { flag: 'wx' });
      await writeFile(join(stage, 'lego-replacement-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
      let created = false;
      const existing = await lstat(paths.folder.absolute).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
      if (!existing) {
        try { await safePath(paths.root, this.config.sourceArchive.relativeRoot, this.config.toolRoot); await rename(stage, paths.folder.absolute); created = true; }
        catch (error) { if (!(await lstat(paths.folder.absolute).catch(() => null))) throw error; }
      }
      const saved = await this.inspect(sessionId, sourceId).catch(error => {
        if (/LEGO_REPLACEMENT_(SOURCE_NOT_FOUND|INTEGRITY_FAILURE)/.test(String(error.message))) fail('SOURCE_CONFLICT');
        throw error;
      });
      const old = saved.manifest;
      if (['sourceId','setId','elementId','extractedSetId','extractedElementId','extractedDesignId','designId','reason','extractedDescription','sourceTransport',
        'method','requestedUrl','finalUrl','httpStatus','contentType','captureMode','inputHarSha256',
        'requestBodyRepresentation','responseBodyRepresentation',
        'requestByteLength','responseByteLength','requestSha256','responseSha256'].some(key => old[key] !== manifest[key]) ||
        old.credentialHeadersOmitted !== manifest.credentialHeadersOmitted ||
        JSON.stringify(old.requestHeaders) !== JSON.stringify(manifest.requestHeaders) ||
        JSON.stringify(old.correlation) !== JSON.stringify(manifest.correlation)) fail('SOURCE_CONFLICT');
      return { sourceId, designId: old.designId, reason: old.reason ?? null, httpStatus: old.httpStatus, ok: old.ok, reused: !created, requestSha256: old.requestSha256,
        responseSha256: old.responseSha256, requestPath: paths.request.absolute, responsePath: paths.response.absolute,
        manifestPath: paths.manifest.absolute, manifest: old };
    } finally { await rm(stage, { recursive: true, force: true }); }
  }

  async inspect(sessionId, sourceId) {
    await this.service.requireSession(sessionId, this.config.sourceArchive.alias, false);
    const paths = await this.paths(sourceId);
    let manifest, requestBytes, responseBytes;
    try {
      if ((await stat(paths.manifest.absolute)).size > 16384 ||
        (await stat(paths.request.absolute)).size > this.config.httpExchange.requestMaxBytes ||
        (await stat(paths.response.absolute)).size > this.config.sourceArchive.maxBytes) fail('INTEGRITY_FAILURE');
      manifest = JSON.parse(await readFile(paths.manifest.absolute, 'utf8'));
      requestBytes = await readFile(paths.request.absolute);
      responseBytes = await readFile(paths.response.absolute);
    } catch (error) {
      if (error.code === 'ENOENT') fail('SOURCE_NOT_FOUND');
      if (error instanceof SyntaxError) fail('INTEGRITY_FAILURE');
      throw error;
    }
    try {
      this.validateTarget(manifest.requestedUrl);
      this.validateTarget(manifest.finalUrl);
      const extracted = this.extractor.extract({ method: manifest.method, requestUrl: manifest.requestedUrl,
        requestBytes, responseBytes, status: manifest.httpStatus }, manifest.setId, manifest.elementId, manifest.correlation);
      if (manifest.schemaVersion !== 2 || manifest.sourceId !== sourceId || !setPattern.test(manifest.setId) ||
        !elementPattern.test(manifest.elementId) || !extracted ||
        (manifest.correlation !== undefined && (!this.extractor.correlation(manifest.correlation, manifest.setId, manifest.elementId) ||
          manifest.correlation.description !== extracted.description)) ||
        (manifest.reason !== undefined && manifest.reason !== (extracted.designId === null ? 'OFFICIAL_DESIGN_ID_NOT_EXPOSED' : null)) ||
        manifest.extractedSetId !== extracted.setId || manifest.extractedElementId !== extracted.elementId ||
        manifest.extractedDesignId !== extracted.designId || manifest.designId !== extracted.designId ||
        manifest.extractedDescription !== extracted.description ||
        manifest.sourceTransport !== extracted.sourceTransport ||
        !['GET','POST'].includes(manifest.method) || manifest.requestedUrl !== manifest.finalUrl ||
        manifest.paths?.request !== paths.request.relative || manifest.paths?.response !== paths.response.relative ||
        manifest.paths?.manifest !== paths.manifest.relative ||
        manifest.requestByteLength !== requestBytes.length || manifest.responseByteLength !== responseBytes.length ||
        manifest.requestSha256 !== sha(requestBytes) || manifest.responseSha256 !== sha(responseBytes) ||
        !Number.isInteger(manifest.httpStatus) || manifest.httpStatus < 200 || manifest.httpStatus >= 600 ||
        manifest.ok !== (manifest.httpStatus < 300) || typeof manifest.contentType !== 'string' ||
        typeof manifest.credentialHeadersOmitted !== 'boolean' ||
        !['browser','user_har_import'].includes(manifest.captureMode) ||
        (manifest.captureMode === 'user_har_import' && !/^[a-f0-9]{64}$/.test(manifest.inputHarSha256 ?? '')) ||
        (manifest.captureMode === 'browser' && manifest.inputHarSha256 !== undefined) ||
        (manifest.captureMode === 'browser' && (manifest.requestBodyRepresentation !== 'playwright_post_data_buffer' ||
          manifest.responseBodyRepresentation !== 'playwright_response_body')) ||
        (manifest.captureMode === 'user_har_import' && (!['har_post_data_utf8_text','har_empty_get'].includes(manifest.requestBodyRepresentation) ||
          !['har_base64','har_utf8_text'].includes(manifest.responseBodyRepresentation))) ||
        !Number.isFinite(Date.parse(manifest.observedAt)) ||
        !/Z$/.test(manifest.observedAt) || !manifest.requestHeaders ||
        Object.entries(manifest.requestHeaders).some(([name,value]) => !safeHeaderNames.has(name) ||
          secretName.test(name) || typeof value !== 'string' || value.length > 512 || /[\r\n\0]/.test(value))) fail('INTEGRITY_FAILURE');
    } catch { fail('INTEGRITY_FAILURE'); }
    return { sourceId, designId: manifest.designId, reason: manifest.reason ?? null, httpStatus: manifest.httpStatus, ok: manifest.ok, requestSha256: manifest.requestSha256,
      responseSha256: manifest.responseSha256, requestPath: paths.request.absolute,
      responsePath: paths.response.absolute, manifestPath: paths.manifest.absolute, manifest };
  }

  async readRange(sessionId, sourceId, part, offset, maxBytes) {
    if (!['request','response'].includes(part) || !Number.isSafeInteger(offset) || offset < 0 ||
      !Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 1048576) fail('MALFORMED_REQUEST');
    const inspected = await this.inspect(sessionId, sourceId);
    const bytes = await readFile(part === 'request' ? inspected.requestPath : inspected.responsePath);
    if (offset > bytes.length) fail('MALFORMED_REQUEST');
    const data = bytes.subarray(offset, Math.min(bytes.length, offset + maxBytes));
    let utf8 = null;
    try { const value = new TextDecoder('utf-8', { fatal: true }).decode(data); if (!/[\x00-\x08\x0e-\x1f]/.test(value)) utf8 = value; } catch {}
    return { sourceId, part, requestSha256: inspected.requestSha256, responseSha256: inspected.responseSha256,
      offset, nextOffset: offset + data.length, eof: offset + data.length === bytes.length,
      encoding: utf8 === null ? 'base64' : 'utf-8', data: utf8 === null ? data.toString('base64') : utf8 };
  }
}
