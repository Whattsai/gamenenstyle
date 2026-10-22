import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

// 固定工作目錄與固定驗證命令；不接受外部命令、參數或變更Published head。
const toolRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await readFile(join(toolRoot,'config/project.json'),'utf8'));
const project=resolve(toolRoot,config.projectRoot,'brickhigh');
const root=join(project,'artifacts/validation-content');
const candidates=[];
for(const entry of await readdir(root,{withFileTypes:true})){
  if(!entry.isDirectory()||!/^\d{8}T\d{6}-[a-f0-9]{8}$/.test(entry.name))continue;
  candidates.push(entry.name);
}
if(!candidates.length)throw new Error('VALIDATION_CONTENT_NOT_PASSED: no sealed Frozen validation build; inspect preflight.json and Pending reviews.');
const selected=candidates.sort().at(-1);
const preflight=JSON.parse(await readFile(join(root,selected,'preflight.json'),'utf8'));
if(preflight.status!=='Prepared'){
  console.error(JSON.stringify({status:'Blocked',reason:'VALIDATION_CONTENT_BLOCKED',output:`artifacts/validation-content/${selected}`,blockedItems:preflight.items?.length??0}));
  process.exitCode=3;
}else{
  const child=spawn(config.pythonTests.executable,['-m','tools.catalog.validation_content','verify','--output',`artifacts/validation-content/${selected}`],{cwd:project,stdio:'inherit',windowsHide:true,shell:false});
  child.once('error',error=>{console.error(error.message);process.exitCode=4;});
  child.once('exit',code=>{process.exitCode=code??4;});
}
