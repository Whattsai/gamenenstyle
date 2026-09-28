#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { loadConfig } from '../src/config.js';
import { allToolNames } from '../src/capabilities.js';

const projectRuntimeDir = config => basename(config.runtimeRoot) === config.projectId ? config.runtimeRoot : join(config.runtimeRoot, config.projectId);
const sha=x=>createHash('sha256').update(x).digest('hex');
const within=(root,path)=>{const rel=relative(root,path);return rel===''||(rel!=='..'&&!rel.startsWith(`..${sep}`));};
const excludedSkillDirectories=new Set(['.git','node_modules','.next','.open-next','coverage','test-results','playwright-report']);
function includeSkillSource(root,path){
  const rel=relative(root,path);if(!rel)return true;
  const parts=rel.split(/[\\/]/);if(parts.some(part=>excludedSkillDirectories.has(part)))return false;
  const name=parts.at(-1);if(name==='.env'||(name.startsWith('.env.')&&name!=='.env.example')||/\.log(?:\.\d+)?$/i.test(name)||name==='.DS_Store'||name==='Thumbs.db')return false;
  return true;
}
const contract=(projectId,required)=>`\n<!-- PROJECT-MCP-CONTRACT:BEGIN -->\n## Local MCP contract\n\n- Use the ${projectId} MCP tools for local workspace operations. Before every begin, call get_active_workspace_session. If it reports active or expired, show the masked summary and ask the user to choose resume, replace, or release; do not call resolve_workspace_session before that confirmation. New work must pass task_summary to begin_workspace_session.\n- After begin or recovery, read every requiredInstructions file using the same session_id. Resume issues a new ID and clears prior reads, so reread them. MCP restarts and conversation changes do not release the lease.\n- Read an existing file with that session_id and pass its SHA to guarded patch, move, or trash. Only configured task IDs may run; Git tools are read-only.\n- Preserve the skill's own approval and confirmation points. Never provide secrets to tool arguments.\n- Required MCP tools for this skill: ${required.join(', ') || '(none)'}.\n<!-- PROJECT-MCP-CONTRACT:END -->\n`;
const option=(args,name)=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
async function walk(root,filter=()=>true){const files=[];async function visit(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(!filter(path))continue;if(entry.isSymbolicLink())throw new Error(`Symlink in skill: ${path}`);if(entry.isDirectory())await visit(path);else if(entry.isFile())files.push(path);}}await visit(root);return files.sort();}
async function skillSource(config,skill){
  const roots=config.skillsRoots??(config.skillsRoot?[config.skillsRoot]:[]);
  const baseRoot=roots.find(r=>existsSync(join(r,skill.name,'SKILL.md')));
  if(!baseRoot)throw new Error(`Skill not found in any root: ${skill.name}`);
  const root=join(baseRoot,skill.name);const source=await realpath(root);if(!within(baseRoot,source))throw new Error(`Skill outside root: ${skill.name}`);
  const markdown=await readFile(join(root,'SKILL.md'),'utf8');const match=markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);if(!match)throw new Error(`${skill.name} missing frontmatter`);
  const meta=YAML.parse(match[1]);if(meta.name!==skill.name||!meta.description)throw new Error(`${skill.name} invalid name/description`);
  for(const link of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const path=link[1].split('#')[0];if(!path||/^(?:https?:|mailto:|skill:)/i.test(path)||path.startsWith('docs/')||path.startsWith('.agents/'))continue;const target=resolve(root,path);if(!within(root,target)||!existsSync(target))throw new Error(`${skill.name} broken local resource: ${path}`);}
  return {root,markdown,frontmatter:match[0]};
}
export async function build(config,appId,output){
  if(!/^plugin_asdk_app_[A-Za-z0-9_-]+$/.test(appId))throw new Error('Use the plugin_asdk_app_... technical ID');
  const tools=allToolNames(config),selected=config.skills.selected;if(!selected.length)throw new Error('Select at least one target skill');
  for(const skill of selected){const missing=skill.requiredTools.filter(x=>!tools.has(x));if(missing.length)throw new Error(`${skill.name} requires unavailable tools: ${missing.join(', ')}`);await skillSource(config,skill);}
  const pluginRoot=resolve(output);const allowed=join(projectRuntimeDir(config),'plugin-build');if(!within(allowed,pluginRoot)||pluginRoot===allowed)throw new Error('Output must be a project runtime plugin-build child');
  if(existsSync(pluginRoot))throw new Error(`Bundle already exists: ${pluginRoot}; choose a new output directory`);
  await mkdir(join(pluginRoot,'.codex-plugin'),{recursive:true});await mkdir(join(pluginRoot,'skills'),{recursive:true});
  const lock=[];
  for(const skill of selected){const source=await skillSource(config,skill),destination=join(pluginRoot,'skills',skill.name);const filter=path=>includeSkillSource(source.root,path);await cp(source.root,destination,{recursive:true,filter});
    const files=[];for(const path of await walk(source.root,filter)){const rel=relative(source.root,path).replaceAll('\\','/'),bytes=await readFile(path);files.push({path:rel,sha256:sha(bytes),bytes:bytes.length});}
    const body=source.markdown.slice(source.frontmatter.length);await writeFile(join(destination,'SKILL.md'),`${source.frontmatter}${contract(config.projectId,skill.requiredTools)}${body}`);lock.push({name:skill.name,files});
  }
  const now=new Date(),pad=n=>String(n).padStart(2,'0'),stamp=`${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const manifest={name:config.plugin.name,version:`0.1.0+codex.${stamp}`,description:`Private ${config.projectId} local MCP workflows`,skills:'./skills/',apps:'./.app.json',interface:{displayName:config.plugin.name,shortDescription:`Local ${config.projectId} workspace`,developerName:'Project team',category:'Productivity',capabilities:['Interactive','Read','Write']}};
  await writeFile(join(pluginRoot,'.codex-plugin','plugin.json'),`${JSON.stringify(manifest,null,2)}\n`);
  await writeFile(join(pluginRoot,'.app.json'),`${JSON.stringify({apps:{[config.plugin.name]:{id:appId}}},null,2)}\n`);
  await writeFile(join(pluginRoot,'skills-lock.json'),`${JSON.stringify({schemaVersion:1,projectId:config.projectId,skills:lock},null,2)}\n`);
  const entries=[];for(const path of await walk(pluginRoot))entries.push(`${relative(pluginRoot,path)}:${sha(await readFile(path))}`);
  await writeFile(join(pluginRoot,'bundle-manifest.json'),`${JSON.stringify({schemaVersion:1,projectId:config.projectId,skillCount:selected.length,bundleSha256:sha(entries.join('\n'))},null,2)}\n`);
  return {output:pluginRoot,skillCount:selected.length};
}
export async function validate(config,root){
  const pluginRoot=resolve(root),manifest=JSON.parse(await readFile(join(pluginRoot,'.codex-plugin','plugin.json'),'utf8')),app=JSON.parse(await readFile(join(pluginRoot,'.app.json'),'utf8')),lock=JSON.parse(await readFile(join(pluginRoot,'skills-lock.json'),'utf8')),bundle=JSON.parse(await readFile(join(pluginRoot,'bundle-manifest.json'),'utf8'));
  if(manifest.name!==config.plugin.name||manifest.skills!=='./skills/'||manifest.apps!=='./.app.json')throw new Error('Plugin manifest mismatch');
  if(!/^plugin_asdk_app_[A-Za-z0-9_-]+$/.test(app.apps?.[config.plugin.name]?.id??''))throw new Error('App mapping mismatch');
  const expected=config.skills.selected.map(x=>x.name).sort(),actual=(await readdir(join(pluginRoot,'skills'),{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort();if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Skill selection mismatch');
  if(JSON.stringify(lock.skills.map(x=>x.name).sort())!==JSON.stringify(expected))throw new Error('Skill lock mismatch');
  for(const skill of config.skills.selected){const missing=skill.requiredTools.filter(x=>!allToolNames(config).has(x));if(missing.length)throw new Error(`${skill.name} requires unavailable tools: ${missing.join(', ')}`);}
  const roots=config.skillsRoots??(config.skillsRoot?[config.skillsRoot]:[]);
  for(const entry of lock.skills){const skill=config.skills.selected.find(x=>x.name===entry.name);if(!skill)throw new Error(`Unexpected skill: ${entry.name}`);const markdown=await readFile(join(pluginRoot,'skills',entry.name,'SKILL.md'),'utf8');if(!markdown.includes('PROJECT-MCP-CONTRACT:BEGIN'))throw new Error(`Missing execution contract: ${entry.name}`);
    const baseRoot=roots.find(r=>existsSync(join(r,entry.name,'SKILL.md')))??config.skillsRoot;
    for(const file of entry.files){const source=join(baseRoot,entry.name,file.path);if(sha(await readFile(source))!==file.sha256)throw new Error(`Skill changed since build: ${entry.name}/${file.path}`);if(file.path!=='SKILL.md'&&sha(await readFile(join(pluginRoot,'skills',entry.name,file.path)))!==file.sha256)throw new Error(`Bundle resource mismatch: ${entry.name}/${file.path}`);}
    const bundled=await walk(join(pluginRoot,'skills',entry.name));if(bundled.length!==entry.files.length)throw new Error(`Bundle file count mismatch: ${entry.name}`);
  }
  const entries=[];for(const path of await walk(pluginRoot)){if(path===join(pluginRoot,'bundle-manifest.json'))continue;entries.push(`${relative(pluginRoot,path)}:${sha(await readFile(path))}`);}if(bundle.projectId!==config.projectId||bundle.skillCount!==actual.length||bundle.bundleSha256!==sha(entries.join('\n')))throw new Error('Bundle hash mismatch');
  return {plugin:manifest.name,skillCount:actual.length,valid:true};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),mode=args[0],config=loadConfig();
  try{if(mode==='build'){const appId=option(args,'--app-id')??process.env.PROJECT_CHATGPT_APP_ID;const output=option(args,'--output')??join(projectRuntimeDir(config),'plugin-build',`${config.plugin.name}-${Date.now()}`);console.log(JSON.stringify(await build(config,appId,output),null,2));}
  else if(mode==='validate'){if(!args[1])throw new Error('Usage: plugin:validate -- <bundle-path>');console.log(JSON.stringify(await validate(config,args[1]),null,2));}
  else throw new Error('Usage: plugin.js build|validate');}catch(error){console.error(error.message);process.exitCode=1;}
}
