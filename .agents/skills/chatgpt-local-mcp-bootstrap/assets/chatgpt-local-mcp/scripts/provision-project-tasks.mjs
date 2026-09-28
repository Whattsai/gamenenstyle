import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const args = process.argv.slice(2);
const option = name => {
  const index = args.indexOf(name);
  if (index < 0) return null;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} 需要值`);
  return args[index + 1];
};
const values = name => args.flatMap((arg, index) => arg === name ? [args[index + 1]] : []);
const targetRepo = option('--target-repo');
if (!targetRepo || !isAbsolute(targetRepo)) throw new Error('請以 --target-repo 指定絕對 Git root');
const root = realpathSync(targetRepo);
if (!existsSync(join(root, '.git'))) throw new Error('目標必須是 Git root');
const configPath = join(root, 'tools', 'chatgpt-local-mcp', 'config', 'project.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (!Array.isArray(config.repos) || !Array.isArray(config.tasks)) throw new Error('project.json 缺少 repos 或 tasks');
const inside = (parent, path) => { const rel = relative(parent, path); return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)); };
const ignored = new Set(['.git', 'node_modules', '.next', '.open-next', '.output', 'dist', 'out', 'coverage', '.wrangler', '.turbo']);
const packagePaths = values('--package').length ? values('--package') : (config.taskDiscovery?.packagePaths ?? []);
if (!Array.isArray(packagePaths) || packagePaths.some(path => typeof path !== 'string')) throw new Error('taskDiscovery.packagePaths 必須是路徑陣列');
const packages = [];
const scan = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);
    if (entry.isFile() && entry.name === 'package.json' && !inside(join(root, 'tools', 'chatgpt-local-mcp'), path)) packages.push(path);
    if (entry.isDirectory() && !ignored.has(entry.name) && !inside(join(root, 'tools', 'chatgpt-local-mcp'), path)) scan(path);
  }
};
if (packagePaths.length) {
  for (const item of packagePaths) {
    const path = resolve(root, item, 'package.json');
    if (!inside(root, path) || !existsSync(path) || !inside(root, realpathSync(path))) throw new Error(`package.json 不在目標 repo：${item}`);
    packages.push(path);
  }
} else scan(root);
packages.sort((a, b) => a.localeCompare(b));
const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
if (packages.length && !existsSync(npmCli)) throw new Error(`找不到 npm CLI JS：${npmCli}`);
const repoRoots = config.repos.map(repo => ({ alias: repo.alias, root: realpathSync(resolve(root, repo.path)) }));
const owner = path => repoRoots.filter(repo => inside(repo.root, path)).sort((a, b) => b.root.length - a.root.length)[0];
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const usedIds = new Set(config.tasks.map(task => task.id));
const added = [];
const add = task => {
  let id = task.id;
  const prior = config.tasks.find(item => item.id === id);
  if (prior && prior.alias === task.alias && prior.cwd.replaceAll('\\', '/') === task.cwd) {
    const sameExecutable = prior.executable.toLowerCase() === task.executable.toLowerCase();
    const sameArgs = prior.args.length === task.args.length && task.args.every((arg, index) => prior.args[index] === arg);
    const fixedExtraArgs = task.args[0] === npmCli && task.args[1] !== 'ci' && prior.args.length > task.args.length && task.args.every((arg, index) => prior.args[index] === arg);
    if (prior.kind === task.kind && sameExecutable && (sameArgs || fixedExtraArgs)) return;
    throw new Error(`既有 task ID 與盤點結果衝突：${id}`);
  }
  if (prior) {
    const suffix = slug(task.cwd).slice(-24);
    id = `${id.slice(0, 63 - suffix.length - 1)}-${suffix}`;
  }
  if (usedIds.has(id)) throw new Error(`task ID 衝突：${id}`);
  task.id = id;
  usedIds.add(id);
  config.tasks.push(task);
  added.push(id);
};
const eligible = name => name === 'build' || name === 'test' || name === 'lint' || name === 'check' || name === 'typecheck' || /^test:(?!.*(?:watch|update|debug))[a-z0-9:_-]+$/i.test(name);
for (const packagePath of packages) {
  const directory = dirname(packagePath);
  const repo = owner(directory);
  if (!repo) continue;
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
  const cwd = relative(repo.root, directory).replaceAll('\\', '/') || '.';
  const prefix = slug(pkg.name || relative(root, directory)) || 'package';
  const base = { alias: repo.alias, cwd, executable: process.execPath };
  if (existsSync(join(directory, 'package-lock.json'))) add({ id: `${prefix}-restore`.slice(0, 63), kind: 'restore', ...base, args: [npmCli, 'ci'] });
  for (const name of Object.keys(pkg.scripts || {}).filter(eligible).sort((a, b) => {
    const order = ['build', 'test', 'lint', 'check', 'typecheck'];
    return (order.indexOf(a) < 0 ? 9 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 9 : order.indexOf(b)) || a.localeCompare(b);
  })) {
    const kind = name === 'build' ? 'build' : 'test';
    const runArgs = name === 'test' ? ['test'] : ['run', name];
    add({ id: `${prefix}-${slug(name)}`.slice(0, 63), kind, ...base, args: [npmCli, ...runArgs] });
  }
}
const dotnetFiles = [];
const findDotnet = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !ignored.has(entry.name) && !inside(join(root, 'tools', 'chatgpt-local-mcp'), path)) findDotnet(path);
    if (entry.isFile() && /\.(?:sln|slnx|csproj|fsproj|vbproj)$/i.test(entry.name)) dotnetFiles.push(path);
  }
};
findDotnet(root);
const dotnetAdded = [];
if (dotnetFiles.length) {
  const where = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', ['dotnet'], { encoding: 'utf8' });
  const executable = where.status === 0 ? where.stdout.split(/\r?\n/).find(path => path && existsSync(path)) : null;
  if (!executable) throw new Error('發現 .NET project，但找不到 dotnet executable');
  config.dotnet ??= { enabled: false, executable: '', targets: [] };
  config.dotnet.enabled = true;
  config.dotnet.executable = realpathSync(executable);
  config.dotnet.targets ??= [];
  const targets = new Set(config.dotnet.targets.map(target => `${target.alias}:${target.relativeProjectPath}`));
  for (const path of dotnetFiles.sort()) {
    const repo = owner(path);
    if (!repo) continue;
    const relativeProjectPath = relative(repo.root, path).replaceAll('\\', '/');
    if (targets.has(`${repo.alias}:${relativeProjectPath}`)) continue;
    const content = /\.(?:csproj|fsproj|vbproj)$/i.test(path) ? readFileSync(path, 'utf8') : '';
    const isTest = /<IsTestProject>\s*true\s*<\/IsTestProject>|Microsoft\.NET\.Test\.Sdk/i.test(content) || /(?:^|[\\/])[^\\/]*tests?\.(?:csproj|fsproj|vbproj)$/i.test(path);
    const id = slug(relativeProjectPath.replace(/\.(?:slnx?|csproj|fsproj|vbproj)$/i, '')).slice(0, 63);
    config.dotnet.targets.push({ id, alias: repo.alias, relativeProjectPath, allowedActions: isTest || /\.slnx?$/i.test(path) ? ['build', 'test', 'restore'] : ['build', 'restore'] });
    dotnetAdded.push(id);
  }
}
if (added.length || dotnetAdded.length) writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ packages: packages.map(path => relative(root, dirname(path)).replaceAll('\\', '/')), addedTasks: added, dotnetTargets: dotnetAdded, totalTasks: config.tasks.length })}\n`);
