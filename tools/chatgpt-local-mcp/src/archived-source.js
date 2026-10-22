import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { lstat, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { safePath, safeEnvironment } from './core.js';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const idPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;
const fail = code => { throw new Error(code); };
const engine = 'Poppler';
function detectType(bytes) {
  if (bytes.subarray(0, 8).toString('ascii').startsWith('%PDF-')) return 'pdf';
  if (bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) return 'zip';
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (bytes.subarray(0, 3).equals(Buffer.from([255,216,255]))) return 'jpeg';
  if (bytes.subarray(0, 2).equals(Buffer.from([31,139]))) return 'gzip';
  try {
    const sample = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, Math.min(bytes.length, 4096)));
    const trimmed = sample.trimStart();
    if (/^[{[]/.test(trimmed)) return 'json';
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) return 'xml-or-html';
    if (sample.includes(',') && /\r?\n/.test(sample)) return 'csv';
    if (!/[\x00-\x08\x0e-\x1f]/.test(sample)) return 'text';
  } catch {}
  return 'unknown';
}

function run(executable, args, timeoutMs = 60000, maxOutput = 2_000_000, input = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { shell: false, windowsHide: true, env: safeEnvironment() });
    const out = [], err = [];
    let outLength = 0, errLength = 0, timedOut = false, oversized = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeoutMs);
    child.stdout.on('data', chunk => { outLength += chunk.length; if (outLength > maxOutput) { oversized = true; child.kill(); } else out.push(chunk); });
    child.stderr.on('data', chunk => { errLength += chunk.length; if (errLength > 16384) child.kill(); else err.push(chunk); });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => {
      clearTimeout(timer);
      if (timedOut) reject(new Error('PDF_OPERATION_TIMEOUT'));
      else if (oversized) reject(new Error('PDF_OUTPUT_TOO_LARGE'));
      else if (code !== 0) reject(new Error('PDF_PARSE_FAILED'));
      else resolve({ stdout: Buffer.concat(out), stderr: Buffer.concat(err) });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input ?? undefined);
  });
}

export class ArchivedSourceService {
  constructor(config, service) { this.config = config; this.service = service; this.versionPromise = null; }
  async version(executable) {
    const result = await run(executable, ['-v'], 10000, 16384);
    const match = result.stderr.toString('utf8').match(/version\s+([\w.\-]+)/i);
    if (!match) fail('PDF_ENGINE_VERSION_UNKNOWN');
    return match[1];
  }
  async source(sessionId, sourceId) {
    const archive = this.config.sourceArchive;
    await this.service.requireSession(sessionId, archive.alias, false);
    if (!idPattern.test(sourceId)) fail('SOURCE_ID_INVALID');
    const repoRoot = this.config.repos[archive.alias].root;
    const base = `${archive.relativeRoot}/${sourceId}`;
    const manifestPath = await safePath(repoRoot, `${base}/manifest.json`, this.config.toolRoot);
    const sourcePath = await safePath(repoRoot, `${base}/source.bin`, this.config.toolRoot);
    let manifestBytes, bytes;
    try {
      if ((await stat(manifestPath.absolute)).size > 16384 || (await stat(sourcePath.absolute)).size > archive.maxBytes) fail('SOURCE_STORAGE_INVALID');
      manifestBytes = await readFile(manifestPath.absolute); bytes = await readFile(sourcePath.absolute);
    }
    catch (error) { if (error.code === 'ENOENT') fail('SOURCE_NOT_FOUND'); throw error; }
    if (!(await lstat(manifestPath.absolute)).isFile() || !(await lstat(sourcePath.absolute)).isFile()) fail('SOURCE_STORAGE_INVALID');
    let manifest;
    try { manifest = JSON.parse(manifestBytes.toString('utf8')); } catch { fail('SOURCE_MANIFEST_INVALID'); }
    let uri;
    try { uri = new URL(manifest.sourceUri); } catch { fail('SOURCE_MANIFEST_INVALID'); }
    if (uri.protocol !== 'https:' || uri.username || uri.password || uri.hash ||
      !archive.allowedDomains.includes(uri.hostname.toLowerCase()) || !archive.allowedPorts.includes(Number(uri.port || 443)) ||
      manifest.storagePath !== sourcePath.relative || !Number.isFinite(Date.parse(manifest.observedAt)) ||
      !Number.isInteger(manifest.httpStatus) || manifest.httpStatus < 200 || manifest.httpStatus >= 300 || typeof manifest.contentType !== 'string' ||
      !/^[a-f0-9]{64}$/.test(manifest.sha256 ?? '') || manifest.byteLength !== bytes.length || sha(bytes) !== manifest.sha256) fail('SOURCE_INTEGRITY_FAILURE');
    return { sourceId, manifest, bytes, path: sourcePath.absolute };
  }
  async pdf(sessionId, sourceId) {
    const source = await this.source(sessionId, sourceId);
    if (detectType(source.bytes) !== 'pdf') fail('SOURCE_NOT_PDF');
    const config = this.config.pdfInspection;
    if (!config?.enabled) fail('PDF_INSPECTION_DISABLED');
    const info = (await run(config.pdfinfo, ['-'], 60000, 2_000_000, source.bytes)).stdout.toString('utf8');
    const match = info.match(/^Pages:\s*(\d+)\s*$/m);
    if (!match || Number(match[1]) < 1) fail('PDF_PARSE_FAILED');
    return { ...source, pageCount: Number(match[1]), version: await this.version(config.pdfinfo) };
  }
  async inspect(sessionId, sourceId) {
    const source = await this.source(sessionId, sourceId);
    const detectedType = detectType(source.bytes);
    const base = { sourceId, sourceUri: source.manifest.sourceUri, contentType: source.manifest.contentType,
      byteLength: source.manifest.byteLength, sha256: source.manifest.sha256, storagePath: source.manifest.storagePath, detectedType };
    if (detectedType !== 'pdf') return { ...base, pageCount: null, hasExtractableText: null, parser: null };
    const pdf = await this.pdf(sessionId, sourceId);
    const samplePages = [...new Set([1, Math.ceil(pdf.pageCount / 2), pdf.pageCount])];
    let hasExtractableText = false;
    for (const page of samplePages) {
      const text = await this.pageText(pdf, page);
      if (text.trim()) { hasExtractableText = true; break; }
    }
    return { ...base, pageCount: pdf.pageCount, hasExtractableText, textDetectionScope: 'sampled', textSamplePages: samplePages,
      parser: { engine, version: pdf.version } };
  }
  async pageText(pdf, page) {
    const result = await run(this.config.pdfInspection.pdftotext,
      ['-f', String(page), '-l', String(page), '-enc', 'UTF-8', '-layout', '-', '-'], 60000, 2_000_000, pdf.bytes);
    return new TextDecoder('utf-8', { fatal: true }).decode(result.stdout).replace(/\f+$/, '');
  }
  async artifact(sessionId, source, operation, parameters, name, bytes, toolVersion) {
    const folder = join(this.service.state, 'artifacts', 'source-derived', sessionId, source.sourceId, randomUUID());
    await mkdir(folder, { recursive: true });
    const outputPath = join(folder, name);
    await writeFile(outputPath, bytes, { flag: 'wx' });
    const provenance = { sourceId: source.sourceId, sourceSha256: source.manifest.sha256, sourceUri: source.manifest.sourceUri,
      operation, parameters, engine, version: toolVersion, createdAt: new Date().toISOString(), outputSha256: sha(bytes),
      outputPath: relative(this.service.state, outputPath).replaceAll('\\', '/') };
    await writeFile(join(folder, 'provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`, { flag: 'wx' });
    return provenance;
  }
  async extract(sessionId, sourceId, startPage, endPage, maxChars) {
    const pdf = await this.pdf(sessionId, sourceId);
    if (!Number.isInteger(startPage) || !Number.isInteger(endPage) || startPage < 1 || endPage < startPage || endPage > pdf.pageCount || endPage - startPage >= 10) fail('PDF_PAGE_RANGE_INVALID');
    if (!Number.isInteger(maxChars) || maxChars < 1 || maxChars > 16000) fail('PDF_MAX_CHARS_INVALID');
    const pages = [];
    let length = 0;
    for (let page = startPage; page <= endPage; page++) {
      const text = await this.pageText(pdf, page);
      length += text.length;
      if (length > maxChars) fail(`PDF_TEXT_TOO_LARGE: ${length} chars through page ${page}; request fewer pages or raise max_chars`);
      pages.push({ page, text });
    }
    const output = Buffer.from(JSON.stringify(pages));
    const provenance = await this.artifact(sessionId, pdf, 'pdf-native-text-extraction', { startPage, endPage, maxChars }, 'pages.json', output, pdf.version);
    return { sourceId, sourceSha256: pdf.manifest.sha256, sourceUri: pdf.manifest.sourceUri,
      parser: { engine, version: pdf.version }, pages, truncated: false, provenance };
  }
  async pageSize(pdf, page) {
    const info = (await run(this.config.pdfInspection.pdfinfo, ['-f', String(page), '-l', String(page), '-'], 60000, 2_000_000, pdf.bytes)).stdout.toString('utf8');
    const match = info.match(new RegExp(`^Page\\s+${page}\\s+size:\\s*([\\d.]+)\\s+x\\s+([\\d.]+)\\s+pts`, 'm'));
    if (!match) fail('PDF_PAGE_SIZE_UNKNOWN');
    return { width: Number(match[1]), height: Number(match[2]) };
  }
  async render(sessionId, sourceId, pages, dpi) {
    const pdf = await this.pdf(sessionId, sourceId);
    if (!Array.isArray(pages) || pages.length < 1 || pages.length > 3 || new Set(pages).size !== pages.length) fail('PDF_PAGE_LIMIT');
    if (!Number.isInteger(dpi) || dpi < 50 || dpi > 180) fail('PDF_DPI_LIMIT');
    const rendered = [];
    for (const page of pages) {
      if (!Number.isInteger(page) || page < 1 || page > pdf.pageCount) fail('PDF_PAGE_RANGE_INVALID');
      const size = await this.pageSize(pdf, page);
      const width = Math.ceil(size.width * dpi / 72), height = Math.ceil(size.height * dpi / 72);
      if (width * height > 8_000_000) fail('PDF_PIXEL_LIMIT');
      const folder = join(this.service.state, 'artifacts', 'source-derived', sessionId, pdf.sourceId, randomUUID());
      await mkdir(folder, { recursive: true });
      const prefix = join(folder, 'render');
      await run(this.config.pdfInspection.pdftoppm,
        ['-f', String(page), '-l', String(page), '-r', String(dpi), '-singlefile', '-png', '-', prefix], 90000, 2_000_000, pdf.bytes);
      const imageBytes = await readFile(`${prefix}.png`);
      if (imageBytes.length > 8_000_000) fail('PDF_IMAGE_TOO_LARGE');
      const provenance = { sourceId: pdf.sourceId, sourceSha256: pdf.manifest.sha256, sourceUri: pdf.manifest.sourceUri,
        operation: 'pdf-page-render', parameters: { pages: [page], dpi }, engine, version: pdf.version,
        createdAt: new Date().toISOString(), outputSha256: sha(imageBytes), outputPath: relative(this.service.state, `${prefix}.png`).replaceAll('\\', '/') };
      await writeFile(join(folder, 'provenance.json'), `${JSON.stringify(provenance, null, 2)}\n`, { flag: 'wx' });
      rendered.push({ page, width, height, mimeType: 'image/png', provenance, imageBase64: imageBytes.toString('base64') });
    }
    return { sourceId, sourceSha256: pdf.manifest.sha256, renderer: { engine, version: pdf.version }, pages: rendered };
  }
  async readRange(sessionId, sourceId, offset, maxBytes) {
    const source = await this.source(sessionId, sourceId);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > source.bytes.length || !Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 1048576) fail('SOURCE_RANGE_INVALID');
    const data = source.bytes.subarray(offset, Math.min(source.bytes.length, offset + maxBytes));
    let utf8 = null;
    try { const decoded = new TextDecoder('utf-8', { fatal: true }).decode(data); if (!/[\x00-\x08\x0e-\x1f]/.test(decoded)) utf8 = decoded; } catch {}
    return { sourceId, sourceSha256: source.manifest.sha256, offset, nextOffset: offset + data.length,
      eof: offset + data.length === source.bytes.length, byteLength: data.length, encoding: utf8 === null ? 'base64' : 'utf-8',
      data: utf8 === null ? data.toString('base64') : utf8 };
  }
}
