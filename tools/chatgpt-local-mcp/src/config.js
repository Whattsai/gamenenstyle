import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOOL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CONFIG_PATH = join(TOOL_ROOT, 'config', 'project.json');
const blockedNames = new Set(['REPLACE_WITH_UNIQUE_PROJECT_ID', 'REPLACE_WITH_UNIQUE_PLUGIN_NAME']);
const namePattern = /^[a-z][a-z0-9-]{2,63}$/;
const aliasPattern = /^[a-z][a-z0-9-]{1,63}$/;
const safeRelative = value => typeof value === 'string' && value.length > 0 && !isAbsolute(value) && !/^[A-Za-z]:/.test(value) && !value.split(/[\\/]/).some(x => !x || x === '..');
const within = (root, candidate) => { const rel = relative(root, candidate); return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)); };
const fail = message => { throw new Error(`INVALID_PROJECT_CONFIG: ${message}`); };

export function loadConfig(path = CONFIG_PATH) {
  let raw;
  try { raw = JSON.parse(readFileSync(path, 'utf8')); } catch (error) { fail(`cannot read ${path}: ${error.message}`); }
  const toolRoot = resolve(dirname(path), '..');
  if (raw.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (!namePattern.test(raw.projectId ?? '') || blockedNames.has(raw.projectId)) fail('unique projectId required');
  if (typeof raw.projectRoot !== 'string' || isAbsolute(raw.projectRoot) || /^[A-Za-z]:/.test(raw.projectRoot)) fail('projectRoot must be relative');
  const projectRoot = realpathSync(resolve(toolRoot, raw.projectRoot));
  if (!within(projectRoot, toolRoot) || resolve(projectRoot, 'tools', 'chatgpt-local-mcp') !== toolRoot) fail('tool root must be <project>/tools/chatgpt-local-mcp');
  if (!isAbsolute(raw.runtimeRoot ?? '') || String(raw.runtimeRoot).includes('REPLACE_')) fail('absolute project runtimeRoot required');
  const runtimeRoot = resolve(raw.runtimeRoot);
  if (within(projectRoot, runtimeRoot) || within(runtimeRoot, projectRoot)) fail('runtimeRoot must be separate from projectRoot');
  let existingRuntimeParent=runtimeRoot;
  while(!existsSync(existingRuntimeParent))existingRuntimeParent=dirname(existingRuntimeParent);
  if(within(projectRoot,realpathSync(existingRuntimeParent)))fail('runtimeRoot resolves inside projectRoot');
  if (!Array.isArray(raw.identity) || raw.identity.length === 0) fail('identity checks required');
  for (const item of raw.identity) {
    if (!safeRelative(item.path) || !item.contains || String(item.contains).includes('REPLACE_')) fail('invalid identity check');
    const candidate = resolve(projectRoot, item.path);
    if (!within(projectRoot, candidate) || !within(projectRoot, realpathSync(candidate)) || !readFileSync(candidate, 'utf8').includes(item.contains)) fail(`project identity mismatch: ${item.path}`);
  }
  if (!Array.isArray(raw.repos) || raw.repos.length === 0) fail('repos required');
  const aliases = new Set();
  const repos = {};
  for (const repo of raw.repos) {
    if (!aliasPattern.test(repo.alias ?? '') || aliases.has(repo.alias) || !safeRelative(repo.path)) fail('invalid or duplicate repo alias');
    aliases.add(repo.alias);
    const root = realpathSync(resolve(projectRoot, repo.path));
    if (!within(projectRoot, root) || !statSync(root).isDirectory() || !existsSync(join(root, '.git'))) fail(`repo path or Git root invalid: ${repo.alias}`);
    if (!Array.isArray(repo.requiredInstructions) || repo.requiredInstructions.length === 0) fail(`requiredInstructions missing: ${repo.alias}`);
    for (const instruction of repo.requiredInstructions) {
      if (!safeRelative(instruction) || !within(root, resolve(root, instruction)) || !within(root, realpathSync(resolve(root, instruction))) || !statSync(resolve(root, instruction)).isFile()) fail(`required instruction missing: ${instruction}`);
    }
    repos[repo.alias] = { root, requiredInstructions: repo.requiredInstructions };
  }
  const rawRoots = Array.isArray(raw.skills?.roots)
    ? raw.skills.roots
    : (typeof raw.skills?.root === 'string' ? [raw.skills.root] : null);
  if (!raw.skills || !rawRoots || rawRoots.length === 0 || rawRoots.some(r => !safeRelative(r)) || !Array.isArray(raw.skills.selected)) fail('skills config required');
  const skillsRoots = rawRoots.map(r => {
    const candidate = realpathSync(resolve(projectRoot, r));
    if (!within(projectRoot, candidate)) fail('skills root outside project');
    return candidate;
  });
  const skillsRoot = skillsRoots[0];
  const skillNames = new Set();
  for (const skill of raw.skills.selected) {
    if (!namePattern.test(skill.name ?? '') || skill.name === 'chatgpt-local-mcp-bootstrap' || skillNames.has(skill.name) || !Array.isArray(skill.requiredTools)) fail('invalid selected skill');
    skillNames.add(skill.name);
    const foundRoot = skillsRoots.find(r => existsSync(join(r, skill.name, 'SKILL.md')));
    if (!foundRoot) fail(`skill missing: ${skill.name}`);
  }
  if (!Array.isArray(raw.tasks)) fail('tasks must be an array');
  const taskIds = new Set();
  for (const task of raw.tasks) {
    if (!namePattern.test(task.id ?? '') || taskIds.has(task.id) || !['build','test','restore','skill'].includes(task.kind) || !repos[task.alias]) fail('invalid task');
    taskIds.add(task.id);
    if(task.timeoutSeconds!==undefined&&(!Number.isInteger(task.timeoutSeconds)||task.timeoutSeconds<1||task.timeoutSeconds>7200))fail(`task timeout invalid: ${task.id}`);
    if (task.purpose !== undefined && (typeof task.purpose !== 'string' || !task.purpose.trim() || task.purpose.length > 300)) fail(`task purpose invalid: ${task.id}`);
    if (!isAbsolute(task.executable ?? '') || !existsSync(task.executable) || /\.(?:cmd|bat|ps1|sh)$/i.test(task.executable) || /^(?:cmd|powershell|pwsh|bash|sh|wsl)\.exe$/i.test(basename(task.executable))) fail(`task executable invalid: ${task.id}`);
    if (!Array.isArray(task.args) || task.args.some(x => typeof x !== 'string' || /(?:password|secret|token|api.?key)=/i.test(x))) fail(`task args invalid: ${task.id}`);
    if (!safeRelative(task.cwd)) fail(`task cwd invalid: ${task.id}`);
    const cwd = realpathSync(resolve(repos[task.alias].root, task.cwd));
    if (!within(repos[task.alias].root, cwd)) fail(`task cwd outside repo: ${task.id}`);
    task.resolvedCwd = cwd;
    if (task.unity !== undefined) {
      const unity = task.unity;
      if (!unity || !isAbsolute(unity.projectPath ?? '') || !within(projectRoot, resolve(unity.projectPath)) || !existsSync(unity.projectPath)) fail(`Unity project invalid: ${task.id}`);
      if (!isAbsolute(unity.upmExecutable ?? '') || !existsSync(unity.upmExecutable)) fail(`Unity Package Manager executable missing: ${task.id}`);
      if (!Number.isInteger(unity.timeoutSeconds) || unity.timeoutSeconds < 30 || unity.timeoutSeconds > 7200) fail(`Unity timeout invalid: ${task.id}`);
      if (!task.args.includes('-projectPath') || task.args[task.args.indexOf('-projectPath') + 1] !== unity.projectPath) fail(`Unity project argument mismatch: ${task.id}`);
      if (unity.resultsPath !== undefined && (task.args[task.args.indexOf('-testResults') + 1] !== unity.resultsPath || !isAbsolute(unity.resultsPath))) fail(`Unity results argument mismatch: ${task.id}`);
      if (unity.assemblyName !== undefined && (!/^[A-Za-z][A-Za-z0-9.]+$/.test(unity.assemblyName) || task.args[task.args.indexOf('-assemblyNames') + 1] !== unity.assemblyName)) fail(`Unity assembly argument mismatch: ${task.id}`);
      if (!task.args.includes('-batchmode')) fail(`Unity batchmode required: ${task.id}`);
    }
  }
  if (!raw.dotnet || typeof raw.dotnet.enabled !== 'boolean' || !Array.isArray(raw.dotnet.targets)) fail('dotnet settings required');
  if (raw.dotnet.enabled) {
    if (!isAbsolute(raw.dotnet.executable ?? '') || !existsSync(raw.dotnet.executable) || /\.(?:cmd|bat|ps1|sh)$/i.test(raw.dotnet.executable) || /^(?:cmd|powershell|pwsh|bash|sh|wsl)\.exe$/i.test(basename(raw.dotnet.executable))) fail('dotnet executable invalid');
    if (raw.dotnet.targets.length === 0) fail('at least one dotnet target required');
    const targetIds = new Set();
    for (const target of raw.dotnet.targets) {
      if (!namePattern.test(target.id ?? '') || targetIds.has(target.id) || !repos[target.alias] || !safeRelative(target.relativeProjectPath)) fail('invalid dotnet target');
      targetIds.add(target.id);
      if (!Array.isArray(target.allowedActions) || target.allowedActions.length === 0 || target.allowedActions.some(action => !['build','test','restore'].includes(action))) fail(`invalid dotnet actions: ${target.id}`);
      if (target.filterProfile !== undefined && target.filterProfile !== 'xunit') fail(`invalid dotnet filter profile: ${target.id}`);
      const candidate = realpathSync(resolve(repos[target.alias].root,target.relativeProjectPath));
      if (!within(repos[target.alias].root,candidate) || !statSync(candidate).isFile() || !/\.(?:sln|slnx|csproj|fsproj|vbproj)$/i.test(candidate)) fail(`dotnet target missing or outside repo: ${target.id}`);
      for (const action of ['build','test','restore']) { const seconds=target.defaultTimeoutSeconds?.[action]; if (seconds !== undefined && (!Number.isInteger(seconds) || seconds < 1 || seconds > 7200)) fail(`invalid dotnet timeout: ${target.id}/${action}`); }
    }
  }
  if (!raw.modules || !raw.modules.web || !raw.modules.android || !raw.modules.offlineMedia) fail('module settings required');
  for (const key of ['web','android','offlineMedia']) if (typeof raw.modules[key].enabled !== 'boolean') fail(`module enabled flag required: ${key}`);
  if (raw.modules.web.enabled && (!Array.isArray(raw.modules.web.allowedOrigins) || raw.modules.web.allowedOrigins.length === 0 || raw.modules.web.allowedOrigins.some(x => !/^https?:\/\/[^/]+$/.test(x)))) fail('web allowedOrigins required');
  if (raw.modules.android.enabled && (!isAbsolute(raw.modules.android.adbExecutable ?? '') || !existsSync(raw.modules.android.adbExecutable))) fail('Android adbExecutable required');
  if (raw.modules.offlineMedia.enabled && (!isAbsolute(raw.modules.offlineMedia.transcriberExecutable ?? '') || !existsSync(raw.modules.offlineMedia.transcriberExecutable) || !Array.isArray(raw.modules.offlineMedia.args))) fail('offline transcriber required');
  if (raw.sourceArchive?.enabled) {
    const archive = raw.sourceArchive;
    if (!repos[archive.alias] || !safeRelative(archive.relativeRoot) || !within(repos[archive.alias].root, resolve(repos[archive.alias].root, archive.relativeRoot))) fail('sourceArchive root invalid');
    if (!Array.isArray(archive.allowedDomains) || !archive.allowedDomains.length || archive.allowedDomains.some(domain => typeof domain !== 'string' || !/^[a-z0-9.-]+$/.test(domain) || domain.startsWith('.') || domain.endsWith('.') || domain.includes('..'))) fail('sourceArchive domains invalid');
    if (!Array.isArray(archive.allowedPorts) || !archive.allowedPorts.length || archive.allowedPorts.some(port => !Number.isInteger(port) || port < 1 || port > 65535)) fail('sourceArchive ports invalid');
    if (!Number.isInteger(archive.maxBytes) || archive.maxBytes < 1 || archive.maxBytes > 100_000_000 || !Number.isInteger(archive.timeoutSeconds) || archive.timeoutSeconds < 1 || archive.timeoutSeconds > 120) fail('sourceArchive bounds invalid');
  }
  if (raw.httpExchange?.enabled) {
    const exchange = raw.httpExchange, archive = raw.sourceArchive;
    if (!archive?.enabled || !Array.isArray(exchange.allowedTargets) || !exchange.allowedTargets.length || exchange.allowedTargets.length > 16 ||
      exchange.allowedTargets.some(target => !target || typeof target !== 'object' || !archive.allowedDomains.includes(target.domain) ||
        typeof target.path !== 'string' || !/^\/[A-Za-z0-9_./-]+$/.test(target.path) || target.path.includes('..'))) fail('HTTP exchange targets invalid');
    const allowed = exchange.allowedRequestHeaders;
    if (!allowed || typeof allowed !== 'object' || Array.isArray(allowed) || !Object.keys(allowed).length || Object.keys(allowed).length > 8 ||
      Object.entries(allowed).some(([name, values]) => !/^[a-z0-9-]{1,64}$/.test(name) || /(?:authorization|cookie|proxy|token|secret|password|passwd|api.?key|credential|signature|session|bearer)/i.test(name) ||
        ['origin','referer','user-agent'].includes(name) ||
        !Array.isArray(values) || !values.length || values.length > 8 || values.some(value => typeof value !== 'string' || !value || value.length > 256 || /[\r\n\0]/.test(value)))) fail('HTTP exchange headers invalid');
    const fixed = exchange.fixedHeadersByTarget ?? [];
    if (!Array.isArray(fixed) || fixed.length > 1 || fixed.some(profile =>
      !profile || profile.domain !== 'www.lego.com' || profile.path !== '/api/graphql/PickABrickQuery' ||
      !exchange.allowedTargets.some(target => target.domain === profile.domain && target.path === profile.path) ||
      !profile.headers || Object.keys(profile.headers).sort().join(',') !== 'origin,referer,user-agent' ||
      profile.headers.origin !== 'https://www.lego.com' ||
      !['https://www.lego.com/en-us/pick-and-build/pick-a-brick', 'https://www.lego.com/en-us/pick-and-build/pick-a-brick/'].includes(profile.headers.referer) ||
      typeof profile.headers['user-agent'] !== 'string' || profile.headers['user-agent'].length > 256 ||
      !/^Mozilla\/5\.0 .+ AppleWebKit\/[0-9.]+ .+ Chrome\/[0-9.]+ Safari\/[0-9.]+$/.test(profile.headers['user-agent']) ||
      /[\r\n\0]/.test(profile.headers['user-agent']))) fail('HTTP exchange fixed target headers invalid');
    if (!Array.isArray(exchange.requiredRequestHeaders) || exchange.requiredRequestHeaders.some(name => !Object.hasOwn(allowed, name))) fail('HTTP exchange required headers invalid');
    if (!Number.isInteger(exchange.requestMaxBytes) || exchange.requestMaxBytes < 1 || exchange.requestMaxBytes > 1048576 ||
      !Number.isInteger(exchange.maxRedirects) || exchange.maxRedirects < 0 || exchange.maxRedirects > 5) fail('HTTP exchange bounds invalid');
  }
  if (raw.legoReplacementParts?.enabled) {
    const lego = raw.legoReplacementParts;
    if (!raw.sourceArchive?.enabled || !raw.httpExchange?.enabled ||
      !raw.sourceArchive.allowedDomains.includes('www.lego.com') || !raw.sourceArchive.allowedPorts.includes(443) ||
      lego.origin !== 'https://www.lego.com' ||
      lego.endpointPath !== '/api/graphql/CustomerServiceReplacementPartsSetPiecesSearch' ||
      lego.nextDataPathPattern !== '/_next/data/{buildId}/en-us/service/replacement-parts/missing/{setId}/pieces.json' ||
      lego.pagePathPattern !== '/en-us/service/replacement-parts/missing/{setId}/pieces' ||
      !Array.isArray(lego.methods) || lego.methods.join(',') !== 'GET,POST') fail('LEGO replacement parts allowlist invalid');
  }
  if (raw.pdfInspection?.enabled) {
    if (!raw.sourceArchive?.enabled) fail('PDF inspection requires source archive');
    for (const key of ['pdfinfo','pdftotext','pdftoppm']) {
      const file = raw.pdfInspection[key];
      if (!isAbsolute(file ?? '') || !existsSync(file) || !statSync(file).isFile() || !file.toLowerCase().endsWith(`${key}.exe`)) fail(`PDF executable invalid: ${key}`);
    }
  }
  if (raw.pythonTests?.enabled) {
    const python = raw.pythonTests;
    if (!repos[python.alias] || !isAbsolute(python.executable ?? '') || (!existsSync(python.executable) && !/[\\/]WindowsApps[\\/]python\.exe$/i.test(python.executable)) || !/python(?:3)?\.exe$/i.test(python.executable)) fail('Python test executable invalid');
    if (!safeRelative(python.cwd) || !within(repos[python.alias].root, resolve(repos[python.alias].root, python.cwd)) || !statSync(resolve(repos[python.alias].root, python.cwd)).isDirectory()) fail('Python test cwd invalid');
    for (const key of ['catalog','acceptance']) {
      const root = python.roots?.[key];
      if (!safeRelative(root) || !within(resolve(repos[python.alias].root, python.cwd), resolve(repos[python.alias].root, python.cwd, root)) || !statSync(resolve(repos[python.alias].root, python.cwd, root)).isDirectory()) fail(`Python test root invalid: ${key}`);
    }
    if (!Number.isInteger(python.timeoutSeconds) || python.timeoutSeconds < 1 || python.timeoutSeconds > 7200) fail('Python test timeout invalid');
  }
  if (!namePattern.test(raw.plugin?.name ?? '') || blockedNames.has(raw.plugin.name)) fail('unique plugin name required');
  return { ...raw, toolRoot, projectRoot, runtimeRoot, repos, skillsRoot, skillsRoots };
}
