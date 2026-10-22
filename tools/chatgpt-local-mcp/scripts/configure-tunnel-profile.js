import { lstat, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';

// 僅調整本專案 stdio profile 的官方握手相容選項，不建立 MCP 或 Write Lease。
export async function configureTunnelProfile(profilePath,projectId,serverPath){
  if(basename(profilePath)!==`${projectId}.yaml`)throw Error('TUNNEL_PROFILE_PROJECT_MISMATCH');
  const info=await lstat(profilePath);
  if(!info.isFile()||info.isSymbolicLink())throw Error('TUNNEL_PROFILE_NOT_REGULAR_FILE');
  const original=await readFile(profilePath,'utf8'),document=YAML.parseDocument(original,{uniqueKeys:true});
  if(document.errors.length)throw Error('TUNNEL_PROFILE_INVALID_YAML');
  const commands=document.getIn(['mcp','commands'])?.toJSON();
  const expected=`node ${resolve(serverPath).replaceAll('\\','/')}`;
  if(!Array.isArray(commands)||commands.length!==1||commands[0].channel!=='main'||commands[0].command!==expected)throw Error('TUNNEL_PROFILE_STDIO_TARGET_MISMATCH');
  if(document.getIn(['mcp','stdio_send_initialized_notification'])===true)return {changed:false};
  document.setIn(['mcp','stdio_send_initialized_notification'],true);
  const temporary=`${profilePath}.${randomUUID()}.tmp`;
  try{
    await writeFile(temporary,document.toString(),{encoding:'utf8',flag:'wx',mode:info.mode & 0o777});
    if(await readFile(profilePath,'utf8')!==original)throw Error('TUNNEL_PROFILE_CHANGED');
    await rename(temporary,profilePath);
  }finally{await rm(temporary,{force:true});}
  return {changed:true};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [profilePath,projectId,serverPath]=process.argv.slice(2);
  try{
    if(!profilePath||!projectId||!serverPath)throw Error('TUNNEL_PROFILE_ARGUMENTS_REQUIRED');
    const result=await configureTunnelProfile(profilePath,projectId,serverPath);
    console.log(JSON.stringify({stdioInitializedNotification:true,...result}));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
