import { createHash, randomUUID } from 'node:crypto';
import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { lstat, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import ipaddr from 'ipaddr.js';
import { safePath } from './core.js';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceIdPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
const secretHeader = /(?:authorization|cookie|proxy|token|secret|password|passwd|api.?key|credential|signature|session|bearer)/i;
const secretQuery = /(?:token|secret|password|passwd|api.?key|credential|auth|signature|access.?key)/i;
const fail = (code, detail) => { throw new Error(detail ? `${code}: ${detail}` : code); };
const code = name => `HTTP_EXCHANGE_${name}`;
const normalizedIp = value => ipaddr.process(value).toString();

function isPublicAddress(value) {
  try {
    const address = ipaddr.process(value);
    if (address.range() !== 'unicast') return false;
    if (address.kind() === 'ipv6' && (!address.match(ipaddr.parse('2000::'), 3) ||
      address.match(ipaddr.parse('2002::'), 16) || address.match(ipaddr.parse('2001::'), 32))) return false;
    return true;
  }
  catch { return false; }
}

function mapNetworkError(error) {
  if (String(error.message).startsWith('HTTP_EXCHANGE_')) return error;
  if (['CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'ERR_TLS_CERT_ALTNAME_INVALID', 'ERR_TLS_CERT_SIGNATURE_ALGORITHM_UNSUPPORTED'].includes(error.code) ||
    String(error.code ?? '').startsWith('ERR_TLS_')) return new Error(code('TLS_INVALID'));
  if (['ETIMEDOUT', 'ESOCKETTIMEDOUT'].includes(error.code)) return new Error(code('TIMEOUT'));
  return new Error(code('NETWORK_ERROR'));
}

export class HttpExchangeArchive {
  constructor(config, service, options = {}) {
    this.config = config; this.service = service;
    this.resolveAll = options.resolveAll ?? (host => dnsLookup(host, { all: true, verbatim: true }));
    this.tlsCa = options.tlsCa;
    // Only direct test construction can allow a local HTTPS fixture. MCP never passes this option.
    this.testOnlyAllowPrivateHosts = new Set(options.testOnlyAllowPrivateHosts ?? []);
  }
  settings() {
    const archive = this.config.sourceArchive, exchange = this.config.httpExchange;
    return { allowedTargets: exchange.allowedTargets, allowedRequestHeaders: exchange.allowedRequestHeaders,
      fixedHeadersByTarget: exchange.fixedHeadersByTarget ?? [],
      requestMaxBytes: exchange.requestMaxBytes, responseMaxBytes: archive.maxBytes, timeoutSeconds: archive.timeoutSeconds,
      allowedPorts: archive.allowedPorts, maxRedirects: exchange.maxRedirects };
  }
  headersForTarget(url, callerHeaders, byteLength) {
    const profile = (this.config.httpExchange.fixedHeadersByTarget ?? []).find(item =>
      item.domain === url.hostname.toLowerCase() && item.path === url.pathname);
    return { ...callerHeaders, ...(profile?.headers ?? {}), 'content-length': String(byteLength) };
  }
  validateUrl(value) {
    if (typeof value !== 'string' || value.length > 4096) fail(code('MALFORMED_REQUEST'));
    let url;
    try { url = new URL(value); } catch { fail(code('MALFORMED_REQUEST')); }
    if (url.protocol !== 'https:' || url.username || url.password || url.hash ||
      [...url.searchParams.keys()].some(key => secretQuery.test(key))) fail(code('MALFORMED_REQUEST'));
    const archive = this.config.sourceArchive, hostname = url.hostname.toLowerCase();
    if (!archive.allowedDomains.includes(hostname)) fail(code('DOMAIN_NOT_ALLOWED'));
    if (!archive.allowedPorts.includes(Number(url.port || 443))) fail(code('PORT_NOT_ALLOWED'));
    if (!this.config.httpExchange.allowedTargets.some(target => target.domain === hostname && target.path === url.pathname)) fail(code('TARGET_NOT_ALLOWED'));
    return url;
  }
  validateHeaders(raw) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw) || Object.keys(raw).length > 8) fail(code('MALFORMED_REQUEST'));
    const allowed = this.config.httpExchange.allowedRequestHeaders, result = {};
    for (const [name, value] of Object.entries(raw)) {
      const key = name.toLowerCase();
      if (!/^[a-z0-9-]{1,64}$/i.test(name) || secretHeader.test(name) || Object.hasOwn(result, key) ||
        !Object.hasOwn(allowed, key) || typeof value !== 'string' || !allowed[key].includes(value) || /[\r\n\0]/.test(value)) fail(code('HEADER_NOT_ALLOWED'));
      result[key] = value;
    }
    for (const required of this.config.httpExchange.requiredRequestHeaders) if (!Object.hasOwn(result, required)) fail(code('HEADER_NOT_ALLOWED'));
    return result;
  }
  async resolve(url, deadline) {
    const host = url.hostname.toLowerCase();
    if (Date.now() >= deadline) fail(code('TIMEOUT'));
    if (!this.testOnlyAllowPrivateHosts.has(host) && (isIP(host) || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal'))) fail(code('ADDRESS_BLOCKED'));
    let addresses;
    try {
      if (isIP(host)) addresses = [{ address: host, family: isIP(host) }];
      else {
        let timer;
        try { addresses = await Promise.race([this.resolveAll(host), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(code('TIMEOUT'))), Math.max(1, deadline - Date.now())); })]); }
        finally { clearTimeout(timer); }
      }
    } catch (error) { throw mapNetworkError(error); }
    if (!Array.isArray(addresses) || !addresses.length || addresses.some(item => !item || !isIP(item.address) || item.family !== isIP(item.address))) fail(code('DNS_INVALID'));
    if (!this.testOnlyAllowPrivateHosts.has(host) && addresses.some(item => !isPublicAddress(item.address))) fail(code('ADDRESS_BLOCKED'));
    return addresses.find(item => item.family === 4) ?? addresses[0];
  }
  async oneRequest(url, address, body, headers, deadline) {
    return new Promise((resolve, reject) => {
      let settled = false, length = 0;
      let timer;
      const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); if (error) reject(error); else resolve(value); };
      const sentHeaders = { ...headers, 'content-length': String(body.length) };
      const options = { method: 'POST', agent: false, maxHeaderSize: 16384, headers: sentHeaders,
        lookup: (_host, lookupOptions, callback) => lookupOptions.all
          ? callback(null, [{ address: address.address, family: address.family }])
          : callback(null, address.address, address.family),
        servername: url.hostname, rejectUnauthorized: true, ...(this.tlsCa ? { ca: this.tlsCa } : {}) };
      let req;
      try { req = httpsRequest(url, options, response => {
        const remote = response.socket.remoteAddress;
        let matches = false;
        try { matches = Boolean(remote) && normalizedIp(remote) === normalizedIp(address.address); } catch {}
        if (!matches) {
          finish(new Error(code('ADDRESS_BLOCKED'))); response.destroy(); return;
        }
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400) {
          const location = response.headers.location;
          finish(null, { status, location: typeof location === 'string' ? location : null }); response.destroy(); return;
        }
        if (Number(response.headers['content-length']) > this.config.sourceArchive.maxBytes) {
          finish(new Error(code('RESPONSE_TOO_LARGE'))); response.destroy(); return;
        }
        const chunks = [];
        response.on('data', chunk => {
          length += chunk.length;
          if (length > this.config.sourceArchive.maxBytes) { finish(new Error(code('RESPONSE_TOO_LARGE'))); response.destroy(); req.destroy(); return; }
          chunks.push(chunk);
        });
        response.once('end', () => finish(null, { status, contentType: String(response.headers['content-type'] ?? ''), body: Buffer.concat(chunks) }));
        response.once('error', error => finish(mapNetworkError(error)));
        response.once('aborted', () => finish(new Error(code('NETWORK_ERROR'))));
      }); } catch (error) { finish(mapNetworkError(error)); return; }
      timer = setTimeout(() => req.destroy(new Error(code('TIMEOUT'))), Math.max(1, deadline - Date.now()));
      req.once('error', error => finish(mapNetworkError(error)));
      try { req.end(body); } catch (error) { finish(mapNetworkError(error)); }
    });
  }
  async fetch(sourceUri, body, headers) {
    const deadline = Date.now() + this.config.sourceArchive.timeoutSeconds * 1000;
    let url = this.validateUrl(sourceUri);
    const redirectChain = [], sentRequests = [], visited = new Set();
    for (;;) {
      if (visited.has(url.href)) fail(code('REDIRECT_REJECTED'));
      visited.add(url.href);
      const address = await this.resolve(url, deadline);
      const sentHeaders = this.headersForTarget(url, headers, body.length);
      sentRequests.push({ url: url.href, headers: sentHeaders });
      const result = await this.oneRequest(url, address, body, sentHeaders, deadline);
      if (result.status < 300 || result.status >= 400) return { ...result, finalUrl: url.href, redirectChain, sentRequests };
      if (![307, 308].includes(result.status) || !result.location || redirectChain.length >= this.config.httpExchange.maxRedirects) fail(code('REDIRECT_REJECTED'));
      let next;
      try { next = new URL(result.location, url); this.validateUrl(next.href); await this.resolve(next, deadline); }
      catch (error) { if (String(error.message).startsWith(code('TIMEOUT'))) throw error; fail(code('REDIRECT_REJECTED'), String(error.message).split(':')[0]); }
      redirectChain.push({ status: result.status, fromUrl: url.href, toUrl: next.href });
      url = next;
    }
  }
  async paths(sourceId) {
    if (!sourceIdPattern.test(sourceId)) fail(code('MALFORMED_REQUEST'));
    const archive = this.config.sourceArchive, root = this.config.repos[archive.alias].root;
    const prefix = `${archive.relativeRoot}/${sourceId}`;
    return { root, prefix,
      folder: await safePath(root, prefix, this.config.toolRoot),
      request: await safePath(root, `${prefix}/request.bin`, this.config.toolRoot),
      response: await safePath(root, `${prefix}/response.bin`, this.config.toolRoot),
      manifest: await safePath(root, `${prefix}/exchange-manifest.json`, this.config.toolRoot) };
  }
  async inspect(sessionId, sourceId) {
    await this.service.requireSession(sessionId, this.config.sourceArchive.alias, false);
    const paths = await this.paths(sourceId);
    let manifest, requestBytes, responseBytes;
    try {
      if ((await stat(paths.manifest.absolute)).size > 16384 || (await stat(paths.request.absolute)).size > this.config.httpExchange.requestMaxBytes ||
        (await stat(paths.response.absolute)).size > this.config.sourceArchive.maxBytes) fail(code('INTEGRITY_FAILURE'));
      manifest = JSON.parse(await readFile(paths.manifest.absolute, 'utf8'));
      requestBytes = await readFile(paths.request.absolute); responseBytes = await readFile(paths.response.absolute);
    } catch (error) { if (error.code === 'ENOENT') fail(code('SOURCE_NOT_FOUND')); if (error instanceof SyntaxError) fail(code('INTEGRITY_FAILURE')); throw error; }
    if (manifest.schemaVersion !== 1 || manifest.sourceId !== sourceId || manifest.method !== 'POST' ||
      manifest.paths?.request !== paths.request.relative || manifest.paths?.response !== paths.response.relative ||
      manifest.paths?.manifest !== paths.manifest.relative ||
      manifest.archiveRelativePaths?.request !== `${sourceId}/request.bin` ||
      manifest.archiveRelativePaths?.response !== `${sourceId}/response.bin` ||
      manifest.archiveRelativePaths?.manifest !== `${sourceId}/exchange-manifest.json` ||
      manifest.requestByteLength !== requestBytes.length ||
      manifest.responseByteLength !== responseBytes.length || manifest.requestSha256 !== sha(requestBytes) || manifest.responseSha256 !== sha(responseBytes)) fail(code('INTEGRITY_FAILURE'));
    try {
      const requested = this.validateUrl(manifest.requestedUrl), final = this.validateUrl(manifest.finalUrl);
      if (!Number.isFinite(Date.parse(manifest.observedAt)) || !/Z$/.test(manifest.observedAt) ||
        (manifest.effectiveAt !== undefined && (!Number.isFinite(Date.parse(manifest.effectiveAt)) || !/Z$/.test(manifest.effectiveAt))) ||
        !Number.isInteger(manifest.httpStatus) || manifest.httpStatus < 200 || manifest.httpStatus >= 600 ||
        (manifest.httpStatus >= 300 && manifest.httpStatus < 400) ||
        (manifest.ok !== undefined && manifest.ok !== (manifest.httpStatus < 300)) ||
        typeof manifest.contentType !== 'string' || !Array.isArray(manifest.redirectChain) ||
        manifest.redirectChain.length > this.config.httpExchange.maxRedirects ||
        manifest.requestHeaders?.['content-length'] !== String(requestBytes.length)) fail(code('INTEGRITY_FAILURE'));
      const sentRequests = manifest.sentRequests ?? [{ url: requested.href, headers: manifest.requestHeaders }];
      if (sentRequests.length !== manifest.redirectChain.length + 1 ||
        JSON.stringify(sentRequests[0].headers) !== JSON.stringify(manifest.requestHeaders)) fail(code('INTEGRITY_FAILURE'));
      const storedHeaders = { ...sentRequests[0].headers };
      delete storedHeaders['content-length'];
      for (const key of Object.keys(this.headersForTarget(requested, {}, requestBytes.length))) delete storedHeaders[key];
      const callerHeaders = this.validateHeaders(storedHeaders);
      let previous = requested.href;
      for (let i = 0; i < sentRequests.length; i++) {
        const sent = sentRequests[i];
        if (sent.url !== previous || JSON.stringify(sent.headers) !== JSON.stringify(this.headersForTarget(this.validateUrl(previous), callerHeaders, requestBytes.length))) fail(code('INTEGRITY_FAILURE'));
        if (i === manifest.redirectChain.length) break;
        const step = manifest.redirectChain[i];
        if (![307,308].includes(step.status) || step.fromUrl !== previous) fail(code('INTEGRITY_FAILURE'));
        previous = this.validateUrl(step.toUrl).href;
      }
      if (previous !== final.href) fail(code('INTEGRITY_FAILURE'));
      if (new TextDecoder('utf-8', { fatal: true }).decode(requestBytes).length === 0 && requestBytes.length > 0) fail(code('INTEGRITY_FAILURE'));
    } catch { fail(code('INTEGRITY_FAILURE')); }
    return { sourceId, outcome: 'http_response', httpStatus: manifest.httpStatus, ok: manifest.httpStatus < 300,
      manifest, requestPath: paths.request.absolute, responsePath: paths.response.absolute,
      manifestPath: paths.manifest.absolute, responseContentType: manifest.contentType,
      requestBytes: manifest.requestByteLength, responseBytes: manifest.responseByteLength,
      requestSha256: manifest.requestSha256, responseSha256: manifest.responseSha256 };
  }
  async readRange(sessionId, sourceId, part, offset, maxBytes) {
    if (!['request', 'response'].includes(part) || !Number.isSafeInteger(offset) || offset < 0 ||
      !Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 1048576) fail(code('MALFORMED_REQUEST'));
    const inspected = await this.inspect(sessionId, sourceId);
    const bytes = await readFile(part === 'request' ? inspected.requestPath : inspected.responsePath);
    if (sha(bytes) !== (part === 'request' ? inspected.requestSha256 : inspected.responseSha256)) fail(code('INTEGRITY_FAILURE'));
    if (offset > bytes.length) fail(code('MALFORMED_REQUEST'));
    const data = bytes.subarray(offset, Math.min(bytes.length, offset + maxBytes));
    let utf8 = null;
    try { const value = new TextDecoder('utf-8', { fatal: true }).decode(data); if (!/[\x00-\x08\x0e-\x1f]/.test(value)) utf8 = value; } catch {}
    return { sourceId, part, requestSha256: inspected.requestSha256, responseSha256: inspected.responseSha256,
      offset, nextOffset: offset + data.length, eof: offset + data.length === bytes.length, byteLength: data.length,
      encoding: utf8 === null ? 'base64' : 'utf-8', data: utf8 === null ? data.toString('base64') : utf8 };
  }
  async archive(sessionId, sourceId, sourceUri, method, requestBody, requestHeaders, effectiveAt) {
    await this.service.requireSession(sessionId, this.config.sourceArchive.alias, true);
    if (method !== 'POST') fail(code('METHOD_NOT_ALLOWED'));
    if (!sourceIdPattern.test(sourceId) || typeof requestBody !== 'string' ||
      (effectiveAt !== undefined && (typeof effectiveAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(effectiveAt) || !Number.isFinite(Date.parse(effectiveAt))))) fail(code('MALFORMED_REQUEST'));
    const body = Buffer.from(requestBody, 'utf8');
    if (body.length > this.config.httpExchange.requestMaxBytes) fail(code('REQUEST_TOO_LARGE'));
    if (new TextDecoder('utf-8', { fatal: true }).decode(body) !== requestBody) fail(code('MALFORMED_REQUEST'));
    const headers = this.validateHeaders(requestHeaders);
    const result = await this.fetch(sourceUri, body, headers);
    const paths = await this.paths(sourceId);
    const manifest = { schemaVersion: 1, sourceId, method: 'POST', requestedUrl: sourceUri, finalUrl: result.finalUrl,
      observedAt: new Date().toISOString(), ...(effectiveAt === undefined ? {} : { effectiveAt }),
      httpStatus: result.status, ok: result.status < 300, contentType: result.contentType,
      requestByteLength: body.length, responseByteLength: result.body.length,
      requestSha256: sha(body), responseSha256: sha(result.body), requestHeaders: result.sentRequests[0].headers,
      sentRequests: result.sentRequests,
      redirectChain: result.redirectChain, paths: { request: paths.request.relative, response: paths.response.relative, manifest: paths.manifest.relative },
      archiveRelativePaths: { request: `${sourceId}/request.bin`, response: `${sourceId}/response.bin`, manifest: `${sourceId}/exchange-manifest.json` } };
    const archiveRoot = await safePath(paths.root, this.config.sourceArchive.relativeRoot, this.config.toolRoot);
    await mkdir(archiveRoot.absolute, { recursive: true });
    await safePath(paths.root, this.config.sourceArchive.relativeRoot, this.config.toolRoot);
    const stage = join(archiveRoot.absolute, `.exchange-stage-${randomUUID()}`);
    await mkdir(stage);
    try {
      await writeFile(join(stage, 'request.bin'), body, { flag: 'wx' });
      await writeFile(join(stage, 'response.bin'), result.body, { flag: 'wx' });
      await writeFile(join(stage, 'exchange-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
      const existing = await lstat(paths.folder.absolute).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
      let created = false;
      if (!existing) {
        try { await safePath(paths.root, this.config.sourceArchive.relativeRoot, this.config.toolRoot); await rename(stage, paths.folder.absolute); created = true; }
        catch (error) { if (!(await lstat(paths.folder.absolute).catch(() => null))) throw error; }
      }
      const saved = await this.inspect(sessionId, sourceId).catch(error => {
        if (String(error.message).includes('SOURCE_NOT_FOUND') || String(error.message).includes('INTEGRITY_FAILURE')) fail(code('SOURCE_CONFLICT'));
        throw error;
      });
      const old = saved.manifest;
      const same = ['sourceId','method','requestedUrl','finalUrl','effectiveAt','httpStatus','contentType','requestByteLength','responseByteLength','requestSha256','responseSha256'].every(key => old[key] === manifest[key]) &&
        JSON.stringify(old.requestHeaders) === JSON.stringify(manifest.requestHeaders) &&
        JSON.stringify(old.sentRequests) === JSON.stringify(manifest.sentRequests) && JSON.stringify(old.redirectChain) === JSON.stringify(manifest.redirectChain);
      if (!same) fail(code('SOURCE_CONFLICT'));
      return { sourceId, outcome: 'http_response', httpStatus: old.httpStatus, ok: old.httpStatus < 300,
        reused: !created, manifest: old, requestPath: saved.requestPath, responsePath: saved.responsePath,
        manifestPath: paths.manifest.absolute, responseContentType: old.contentType,
        requestBytes: old.requestByteLength, responseBytes: old.responseByteLength,
        requestSha256: old.requestSha256, responseSha256: old.responseSha256 };
    } finally { await rm(stage, { recursive: true, force: true }); }
  }
}
