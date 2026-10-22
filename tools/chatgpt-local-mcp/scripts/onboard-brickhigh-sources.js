import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 固定任務：只讀固定來源計畫，正式操作仍由原Job／租約／instruction gates授權。
if(process.argv.length!==2)throw new Error('固定來源匯入任務不接受外部參數。');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(await readFile(join(root,'config/project.json'),'utf8'));
const child=spawn(config.pythonTests.executable,['-m','tools.catalog.source_onboarding'],{
  cwd:resolve(root,config.projectRoot,'brickhigh'),stdio:'inherit',shell:false,windowsHide:true,
  env:{...process.env,PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'},
});
child.once('error',error=>{console.error(error.message);process.exitCode=4;});
child.once('exit',code=>{process.exitCode=code??4;});
