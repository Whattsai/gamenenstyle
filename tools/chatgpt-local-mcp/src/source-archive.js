import { createHash } from 'node:crypto';
import { request } from 'node:https';
import { mkdir, open, readFile, lstat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { safePath } from './core.js';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceIdPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
const fail = code => { throw new Error(code); };

async function readIfPresent(path) {
  try { return await readFile(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function createOrCompare(path, bytes) {
  let handle;
  try {
    handle = await open(path, 'wx');
    await handle.writeFile(bytes);
    await handle.sync();
    return false;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existing = await readIfPresent(path);
    if (!existing || !existing.equals(bytes)) fail('SOURCE_STORAGE_CONFLICT');
    return true;
  } finally { await handle?.close(); }
}

function parseSourceUrl(value, archive) {
  let url;
  try { url = new URL(value); } catch { fail('SOURCE_URL_INVALID'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) fail('SOURCE_URL_INVALID');
  if (!archive.allowedDomains.includes(url.hostname.toLowerCase()) || !archive.allowedPorts.includes(Number(url.port || 443))) fail('SOURCE_DOMAIN_BLOCKED');
  if ([...url.searchParams.keys()].some(key => /(?:token|secret|password|passwd|api.?key|credential|auth|signature|access.?key)/i.test(key))) fail('SOURCE_URL_CREDENTIALS_BLOCKED');
  return url;
}

function download(url, archive, tlsOptions = {}) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    const req = request(url, { method: 'GET', maxHeaderSize: 16_384, ...tlsOptions }, response => {
      const status = response.statusCode;
      if (status < 200 || status >= 300) { response.resume(); reject(new Error(`SOURCE_HTTP_STATUS: ${status}`)); return; }
      response.on('data', chunk => {
        length += chunk.length;
        if (length > archive.maxBytes) { req.destroy(new Error('SOURCE_TOO_LARGE')); return; }
        chunks.push(chunk);
      });
      response.once('end', () => resolve({ status, contentType: String(response.headers['content-type'] ?? ''), bytes: Buffer.concat(chunks) }));
      response.once('error', reject);
    });
    const timer = setTimeout(() => req.destroy(new Error('SOURCE_TIMEOUT')), archive.timeoutSeconds * 1000);
    req.once('close', () => clearTimeout(timer));
    req.once('error', reject);
    req.end();
  });
}

export class SourceArchive {
  constructor(config, service, options = {}) { this.config = config; this.service = service; this.tlsOptions = options.tlsOptions ?? {}; }
  settings() {
    const { alias, relativeRoot, allowedDomains, allowedPorts, maxBytes, timeoutSeconds } = this.config.sourceArchive;
    return { alias, relativeRoot, allowedDomains, allowedPorts, maxBytes, timeoutSeconds, sourceIdPattern: sourceIdPattern.source };
  }
  async archive(sessionId, sourceId, sourceUri, effectiveAt) {
    const archive = this.config.sourceArchive;
    await this.service.requireSession(sessionId, archive.alias, true);
    if (!sourceIdPattern.test(sourceId)) fail('SOURCE_ID_INVALID');
    if (effectiveAt !== undefined && (typeof effectiveAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(effectiveAt) || !Number.isFinite(Date.parse(effectiveAt)))) fail('EFFECTIVE_AT_INVALID');
    const url = parseSourceUrl(sourceUri, archive);
    const root = this.config.repos[archive.alias].root;
    const folder = await safePath(root, `${archive.relativeRoot}/${sourceId}`, this.config.toolRoot);
    const content = await safePath(root, `${archive.relativeRoot}/${sourceId}/source.bin`, this.config.toolRoot);
    const manifestFile = await safePath(root, `${archive.relativeRoot}/${sourceId}/manifest.json`, this.config.toolRoot);
    const response = await download(url, archive, this.tlsOptions);
    await mkdir(folder.absolute, { recursive: true });
    // Recheck after creation: a pre-existing link or junction cannot redirect archive writes.
    for (const path of [folder.absolute, content.absolute, manifestFile.absolute]) {
      const info = await lstat(path).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
      if (info?.isSymbolicLink()) fail('SOURCE_SYMLINK_BLOCKED');
    }
    await safePath(root, `${archive.relativeRoot}/${sourceId}/source.bin`, this.config.toolRoot);
    const sha256 = digest(response.bytes);
    const oldContent = await readIfPresent(content.absolute);
    if (oldContent && digest(oldContent) !== sha256) fail('SOURCE_STORAGE_CONFLICT');
    const oldManifestBytes = await readIfPresent(manifestFile.absolute);
    if (oldManifestBytes) {
      const oldManifest = JSON.parse(oldManifestBytes.toString('utf8'));
      if (!oldContent || oldManifest.sha256 !== sha256 || oldManifest.sourceUri !== sourceUri || oldManifest.effectiveAt !== effectiveAt) fail('SOURCE_STORAGE_CONFLICT');
      return { reused: true, manifest: oldManifest, manifestPath: relative(root, manifestFile.absolute).replaceAll('\\', '/') };
    }
    await createOrCompare(content.absolute, response.bytes);
    const manifest = {
      sourceUri,
      observedAt: new Date().toISOString(),
      ...(effectiveAt === undefined ? {} : { effectiveAt }),
      httpStatus: response.status,
      contentType: response.contentType,
      byteLength: response.bytes.length,
      sha256,
      storagePath: relative(root, content.absolute).replaceAll('\\', '/'),
    };
    const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
    const reused = await createOrCompare(manifestFile.absolute, manifestBytes);
    return { reused, manifest, manifestPath: relative(root, manifestFile.absolute).replaceAll('\\', '/') };
  }
}
