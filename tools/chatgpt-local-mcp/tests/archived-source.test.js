import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { loadConfig } from '../src/config.js';
import { ArchivedSourceService } from '../src/archived-source.js';
import { ProjectService } from '../src/core.js';
import { PythonTestRunner } from '../src/python-tests.js';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');

function pdfFixture(mediaBox = '0 0 612 792') {
  const parts = [Buffer.from('%PDF-1.5\n')], offsets = [0];
  const add = (id, body) => { offsets[id] = Buffer.concat(parts).length; parts.push(Buffer.from(`${id} 0 obj\n`), body, Buffer.from('\nendobj\n')); };
  const stream = text => {
    const compressed = deflateSync(Buffer.from(`BT /F1 18 Tf 72 700 Td (${text}) Tj ET`));
    return Buffer.concat([Buffer.from(`<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`), compressed, Buffer.from('\nendstream')]);
  };
  add(1, Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'));
  add(2, Buffer.from('<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>'));
  add(3, Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [${mediaBox}] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>`));
  add(4, Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [${mediaBox}] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>`));
  add(5, Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'));
  add(6, stream('Page One Element 12345'));
  add(7, stream('Page Two Element 67890'));
  const xref = Buffer.concat(parts).length;
  parts.push(Buffer.from(`xref\n0 8\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
  return Buffer.concat(parts);
}

function objectStreamFixture() {
  const parts = [Buffer.from('%PDF-1.5\n')], offsets = {};
  const add = (id, body) => { offsets[id] = Buffer.concat(parts).length; parts.push(Buffer.from(`${id} 0 obj\n`), body, Buffer.from('\nendobj\n')); };
  add(1, Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'));
  add(4, Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'));
  const content = deflateSync(Buffer.from('BT /F1 18 Tf 72 700 Td (Object Stream Element 54321) Tj ET'));
  add(5, Buffer.concat([Buffer.from(`<< /Length ${content.length} /Filter /FlateDecode >>\nstream\n`), content, Buffer.from('\nendstream')]));
  const pages = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  const page = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>';
  const header = `2 0 3 ${Buffer.byteLength(pages) + 1} `;
  const compressedObjects = deflateSync(Buffer.from(`${header}${pages}\n${page}`));
  add(7, Buffer.concat([Buffer.from(`<< /Type /ObjStm /N 2 /First ${Buffer.byteLength(header)} /Length ${compressedObjects.length} /Filter /FlateDecode >>\nstream\n`), compressedObjects, Buffer.from('\nendstream')]));
  offsets[6] = Buffer.concat(parts).length;
  const entry = (type, field, generation) => { const b = Buffer.alloc(7); b[0] = type; b.writeUInt32BE(field, 1); b.writeUInt16BE(generation, 5); return b; };
  const xref = Buffer.concat([entry(0, 0, 65535), entry(1, offsets[1], 0), entry(2, 7, 0), entry(2, 7, 1),
    entry(1, offsets[4], 0), entry(1, offsets[5], 0), entry(1, offsets[6], 0), entry(1, offsets[7], 0)]);
  const compressedXref = deflateSync(xref);
  add(6, Buffer.concat([Buffer.from(`<< /Type /XRef /Size 8 /Root 1 0 R /W [1 4 2] /Length ${compressedXref.length} /Filter /FlateDecode >>\nstream\n`), compressedXref, Buffer.from('\nendstream')]));
  parts.push(Buffer.from(`startxref\n${offsets[6]}\n%%EOF\n`));
  return Buffer.concat(parts);
}

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mcp-inspection-'));
  const actual = loadConfig();
  const config = { repos: { main: { root } }, toolRoot: join(root, 'tools', 'chatgpt-local-mcp'),
    sourceArchive: { alias: 'main', relativeRoot: 'brickhigh/artifacts/sources', allowedDomains: ['www.lego.com'], allowedPorts: [443] },
    pdfInspection: actual.pdfInspection };
  const service = { state: join(root, 'runtime'), requireSession: async id => assert.equal(id, 'session') };
  await mkdir(service.state);
  const inspector = new ArchivedSourceService(config, service);
  const archive = async (sourceId, bytes, overrides = {}) => {
    const folder = join(root, 'brickhigh/artifacts/sources', sourceId);
    await mkdir(folder, { recursive: true });
    const manifest = { sourceUri: 'https://www.lego.com/official.pdf', observedAt: '2026-10-09T00:00:00Z', httpStatus: 200,
      contentType: 'application/pdf', byteLength: bytes.length, sha256: sha(bytes), storagePath: `brickhigh/artifacts/sources/${sourceId}/source.bin`, ...overrides };
    await writeFile(join(folder, 'source.bin'), bytes);
    await writeFile(join(folder, 'manifest.json'), JSON.stringify(manifest));
    return manifest;
  };
  return { root, inspector, archive };
}

test('archived PDF inspection, Flate text, exact pages, rendering, and provenance', async () => {
  const f = await fixture();
  try {
    const manifest = await f.archive('official', pdfFixture());
    const inspected = await f.inspector.inspect('session', 'official');
    assert.equal(inspected.detectedType, 'pdf'); assert.equal(inspected.pageCount, 2);
    assert.equal(inspected.hasExtractableText, true); assert.equal(inspected.sha256, manifest.sha256);
    assert.match(inspected.parser.version, /^\d/);
    const extracted = await f.inspector.extract('session', 'official', 2, 2, 1000);
    assert.equal(extracted.sourceSha256, manifest.sha256);
    assert.deepEqual(extracted.pages.map(x => x.page), [2]);
    assert.match(extracted.pages[0].text, /Page Two Element 67890/);
    assert.doesNotMatch(extracted.pages[0].text, /Page One/);
    assert.equal(extracted.provenance.outputSha256, sha(await readFile(join(f.root, 'runtime', extracted.provenance.outputPath))));
    assert.equal(extracted.provenance.sourceSha256, manifest.sha256);
    const rendered = await f.inspector.render('session', 'official', [2], 72);
    assert.equal(rendered.sourceSha256, manifest.sha256);
    assert.equal(rendered.pages[0].page, 2);
    const png = Buffer.from(rendered.pages[0].imageBase64, 'base64');
    assert.deepEqual([...png.subarray(0, 8)], [137,80,78,71,13,10,26,10]);
    assert.equal(rendered.pages[0].provenance.outputSha256, sha(png));
    assert.equal(rendered.pages[0].provenance.sourceSha256, manifest.sha256);
    assert.equal(JSON.parse(await readFile(join(f.root, 'runtime', rendered.pages[0].provenance.outputPath, '..', 'provenance.json'), 'utf8')).operation, 'pdf-page-render');
    const range = await f.inspector.readRange('session', 'official', 0, 8);
    assert.equal(range.sourceSha256, manifest.sha256);
    assert.equal(range.data, '%PDF-1.5');
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('native parser resolves PDF object streams and compressed xref streams', async () => {
  const f = await fixture();
  try {
    await f.archive('object-stream', objectStreamFixture());
    const inspected = await f.inspector.inspect('session', 'object-stream');
    assert.equal(inspected.pageCount, 1);
    const extracted = await f.inspector.extract('session', 'object-stream', 1, 1, 1000);
    assert.match(extracted.pages[0].text, /Object Stream Element 54321/);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('archived PDF operations fail closed on malformed input, paths, ranges, and bounds', async () => {
  const f = await fixture();
  try {
    await f.archive('valid', pdfFixture());
    await f.archive('giant', pdfFixture('0 0 2000 2000'));
    await f.archive('broken', Buffer.from('%PDF-1.5\nnot a real PDF'));
    await f.archive('not-pdf', Buffer.from('not a PDF'));
    await assert.rejects(f.inspector.inspect('session', '../valid'), /SOURCE_ID_INVALID|PATH_TRAVERSAL/);
    await assert.rejects(f.inspector.inspect('session', 'unknown'), /SOURCE_NOT_FOUND/);
    await assert.rejects(f.inspector.inspect('session', 'broken'), /PDF_PARSE_FAILED/);
    await assert.rejects(f.inspector.extract('session', 'not-pdf', 1, 1, 100), /SOURCE_NOT_PDF/);
    await assert.rejects(f.inspector.extract('session', 'valid', 1, 2, 3), /PDF_TEXT_TOO_LARGE/);
    await assert.rejects(f.inspector.extract('session', 'valid', 3, 3, 100), /PDF_PAGE_RANGE_INVALID/);
    await assert.rejects(f.inspector.render('session', 'valid', [3], 72), /PDF_PAGE_RANGE_INVALID/);
    await assert.rejects(f.inspector.render('session', 'valid', [1,2,1], 72), /PDF_PAGE_LIMIT/);
    await assert.rejects(f.inspector.render('session', 'valid', [1], 181), /PDF_DPI_LIMIT/);
    await assert.rejects(f.inspector.render('session', 'giant', [1], 180), /PDF_PIXEL_LIMIT/);
    await assert.rejects(f.inspector.readRange('session', 'valid', 0, 1048577), /SOURCE_RANGE_INVALID/);
    await writeFile(join(f.root, 'brickhigh/artifacts/sources/valid/source.bin'), Buffer.from('tampered'));
    await assert.rejects(f.inspector.inspect('session', 'valid'), /SOURCE_INTEGRITY_FAILURE/);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test('workspace text chunks reach 128 KiB with nextOffset, EOF, SHA fence, and line range', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mcp-text-'));
  try {
    const content = `${'line data\n'.repeat(23000)}`;
    await writeFile(join(root, 'large.md'), content);
    const service = new ProjectService({ projectId: 'text-test', runtimeRoot: join(root, 'runtime'), repos: { main: { root, requiredInstructions: [] } }, toolRoot: join(root, 'tools/chatgpt-local-mcp'), tasks: [] });
    const first = await service.readChunk('main', 'large.md', 0, 131072);
    assert.equal(first.nextOffset, 131072); assert.equal(first.eof, false);
    const second = await service.readChunk('main', 'large.md', first.nextOffset, 131072, undefined, first.sha256);
    assert.equal(second.eof, true); assert.equal(second.nextOffset, Buffer.byteLength(content));
    await assert.rejects(service.readChunk('main', 'large.md', 0, 131072, undefined, '0'.repeat(64)), /SHA_CONFLICT/);
    const range = await service.readRange('main', 'large.md', 100, 102, undefined, first.sha256);
    assert.match(range.text, /100: line data/); assert.equal(range.endLine, 102);
    await assert.rejects(service.readRange('main', '../large.md', 1, 2, undefined, first.sha256), /PATH_TRAVERSAL/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('pytest selector runs one allowlisted file/function and rejects traversal and injection', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mcp-pytest-'));
  try {
    for (const path of ['brickhigh/tools/catalog/tests/unit', 'brickhigh/tools/acceptance/tests']) await mkdir(join(root, path), { recursive: true });
    await writeFile(join(root, 'brickhigh/tools/catalog/tests/unit/test_sample.py'), 'def test_selected():\n    assert True\n\ndef test_other():\n    assert True\n');
    const actual = loadConfig();
    const config = { repos: { main: { root } }, toolRoot: join(root, 'tools/chatgpt-local-mcp'), pythonTests: { ...actual.pythonTests, timeoutSeconds: 30 } };
    const state = join(root, 'runtime'); await mkdir(join(state, 'jobs'), { recursive: true }); await mkdir(join(state, 'logs'));
    const service = new ProjectService({...config,runtimeRoot:state,projectId:'runtime'});
    await service.init();service.requireSession=async()=>{};
    const runner = new PythonTestRunner(config, service);
    const started = await runner.start('session', 'catalog', 'tools/catalog/tests/unit/test_sample.py', 'test_selected');
    let job;
    for (let i = 0; i < 100; i++) { try { job = JSON.parse(await readFile(join(state, 'jobs', `${started.id}.json`), 'utf8')); } catch {} if (job?.status !== 'running' && job) break; await new Promise(resolve => setTimeout(resolve, 100)); }
    assert.equal(job.status, 'succeeded'); assert.match(await readFile(job.logPath, 'utf8'), /1 passed/);
    await assert.rejects(runner.start('session', 'catalog', '../outside.py'), /PATH_TRAVERSAL|PYTEST_PATH_BLOCKED/);
    await assert.rejects(runner.start('session', 'catalog', 'tools/acceptance/tests/test_other.py'), /PYTEST_PATH_BLOCKED/);
    await assert.rejects(runner.start('session', 'catalog', 'tools/catalog/tests/unit/test_sample.py', 'test_selected;echo pwned'), /PYTEST_SELECTOR_INVALID/);
  // Windows supervisor 完成狀態落盤後，工作目錄可能仍被短暫持有。
  } finally { await rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
});

test('MCP render tool returns direct ImageContent with source provenance', async () => {
  const base = await mkdtemp(join(tmpdir(), 'mcp-pdf-protocol-'));
  const project = join(base, 'project'), tool = join(project, 'tools/chatgpt-local-mcp');
  let client;
  try {
    await mkdir(join(tool, 'config'), { recursive: true });
    await writeFile(join(project, 'AGENTS.md'), '# PDF protocol fixture\n');
    assert.equal(spawnSync('git', ['init'], { cwd: project, encoding: 'utf8' }).status, 0);
    const actual = loadConfig();
    await mkdir(join(project, 'brickhigh/tools/catalog/tests'), { recursive: true });
    await mkdir(join(project, 'brickhigh/tools/acceptance/tests'), { recursive: true });
    const config = { schemaVersion: 1, projectId: 'pdf-protocol', projectRoot: '../..', runtimeRoot: join(base, 'runtime'),
      identity: [{ path: 'AGENTS.md', contains: 'PDF protocol fixture' }], repos: [{ alias: 'main', path: '.', requiredInstructions: ['AGENTS.md'] }],
      skills: { root: '.', selected: [] }, tasks: [], dotnet: { enabled: false, executable: '', targets: [] },
      modules: { web: { enabled: false, allowedOrigins: [] }, android: { enabled: false, adbExecutable: '' }, offlineMedia: { enabled: false, transcriberExecutable: '', args: [] } },
      sourceArchive: { enabled: true, alias: 'main', relativeRoot: 'brickhigh/artifacts/sources', allowedDomains: ['www.lego.com'], allowedPorts: [443], maxBytes: 100000000, timeoutSeconds: 30 },
      pdfInspection: actual.pdfInspection, pythonTests: { ...actual.pythonTests, timeoutSeconds: 30 }, plugin: { name: 'pdf-protocol' } };
    const sourceId = 'pdf-protocol-fixture';
    const bytes = pdfFixture(), sourceFolder = join(project, 'brickhigh/artifacts/sources', sourceId);
    await mkdir(sourceFolder, { recursive: true });
    await writeFile(join(sourceFolder, 'source.bin'), bytes);
    await writeFile(join(sourceFolder, 'manifest.json'), JSON.stringify({ sourceUri: 'https://www.lego.com/fixture.pdf', observedAt: '2026-10-09T00:00:00Z', httpStatus: 200,
      contentType: 'application/pdf', byteLength: bytes.length, sha256: sha(bytes), storagePath: `brickhigh/artifacts/sources/${sourceId}/source.bin` }));
    const configPath = join(tool, 'config/project.json'); await writeFile(configPath, JSON.stringify(config));
    const transport = new StdioClientTransport({ command: process.execPath, args: [join(process.cwd(), 'src/index.js')], cwd: process.cwd(), env: { ...process.env, PROJECT_MCP_CONFIG: configPath }, stderr: 'pipe' });
    client = new Client({ name: 'pdf-protocol-test', version: '1.0.0' }, { capabilities: {} });
    await client.connect(transport);
    const tools = (await client.listTools()).tools.map(x => x.name);
    for (const name of ['inspect_archived_source', 'extract_archived_pdf_text', 'render_archived_pdf_pages', 'read_archived_source_range', 'read_workspace_text_range', 'start_python_test_job']) assert.ok(tools.includes(name), name);
    const opened = JSON.parse((await client.callTool({ name: 'begin_workspace_session', arguments: { aliases: ['main'], task_summary: 'PDF protocol test' } })).content[0].text);
    await client.callTool({ name: 'read_workspace_text', arguments: { alias: 'main', path: 'AGENTS.md', session_id: opened.id } });
    const response = await client.callTool({ name: 'render_archived_pdf_pages', arguments: { session_id: opened.id, source_id: sourceId, pages: [1], dpi: 72 } });
    assert.notEqual(response.isError, true, response.content[0]?.text);
    assert.equal(response.content[1].type, 'image'); assert.equal(response.content[1].mimeType, 'image/png');
    const metadata = JSON.parse(response.content[0].text);
    assert.equal(metadata.sourceSha256, sha(bytes)); assert.equal(metadata.pages[0].page, 1);
    assert.equal(metadata.pages[0].provenance.outputSha256, sha(Buffer.from(response.content[1].data, 'base64')));
    const injection = await client.callTool({ name: 'start_python_test_job', arguments: { session_id: opened.id, suite: 'catalog', executable: 'cmd.exe', args: ['/c', 'echo bad'] } });
    assert.equal(injection.isError, true);
  } finally { await client?.close(); await rm(base, { recursive: true, force: true }); }
});
