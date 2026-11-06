import {fileURLToPath} from 'node:url';import path from 'node:path';import {existsSync} from 'node:fs';
import {localGameEndStatements} from './local-game-policy.mjs';
export const root=fileURLToPath(new URL('../',import.meta.url)).replace(/[\\/]$/,'');
export const safeName=name=>typeof name==='string'&&/^[a-z0-9][a-z0-9-]{0,31}$/.test(name)&&!['production','staging','remote'].includes(name);
export function resolveInstance(name='default',allowNew=false){
 if(!safeName(name))throw new Error('Invalid local instance name');
 const cwd=name==='default'?path.join(root,'cloudflare'):path.join(root,'.local','instances',name);
 if(name!=='default'&&!allowNew&&!existsSync(path.join(cwd,'wrangler.jsonc')))throw new Error('Unknown local instance');
 return {name,cwd,config:path.join(cwd,'wrangler.jsonc'),state:`${cwd}/.wrangler/state`};
}
export function parseLocalArgs(command,args){
 const supported={dev:[],migrate:[],seed:[],query:['view'],execute:['file'],backup:['name'],restore:['file','target'],probe:[],'game-end':['round-id']};
 if(!Object.hasOwn(supported,command))throw new Error('Unknown local command');const result={instance:'default'},seen=new Set();
 for(let i=0;i<args.length;i+=2){const flag=args[i];if(!flag?.startsWith('--'))throw new Error('Expected option');const key=flag.slice(2),value=args[i+1];
  if(!['instance',...supported[command]].includes(key)||!value||value.startsWith('--')||seen.has(key))throw new Error('Unsupported/duplicate local option');seen.add(key);result[key]=value;
 }
 if(!safeName(result.instance))throw new Error('Invalid instance');
 if(command==='query'&&!['accounts','sessions','games'].includes(result.view))throw new Error('Only fixed non-secret views are allowed');
 if(command==='game-end')localGameEndStatements(result['round-id'],0);
 if(command==='restore'&&(!safeName(result.target)||result.target==='default'))throw new Error('Restore requires a new named local instance');
 return result;
}
const views={accounts:'SELECT account_id,email_normalized,email_verified_at,status,credential_version FROM auth_accounts ORDER BY created_at,account_id',sessions:'SELECT session_id,account_id,current_generation,absolute_expires_at,idle_expires_at,revoked_at FROM auth_sessions ORDER BY created_at,session_id',games:"SELECT r.round_id,r.status,r.started_at,lo.nickname AS player_low,hi.nickname AS player_high,(SELECT COUNT(*) FROM game_round_participants gp WHERE gp.round_id=r.round_id) AS participants FROM game_rounds r JOIN user_profiles lo ON lo.account_id=r.account_low_id JOIN user_profiles hi ON hi.account_id=r.account_high_id WHERE r.status='active' ORDER BY r.started_at,r.round_id"};
export function invocation(command,instance,options={}){
 const common=['--config',instance.config,'--local'];let args;
 if(command==='migrate')args=['d1','migrations','apply','DB',...common];
 else if(command==='query')args=['d1','execute','DB',...common,'--command',views[options.view],'--json'];
 else if(command==='game-end')args=['d1','execute','DB',...common,'--command',localGameEndStatements(options['round-id'],options.now??Date.now()).join(';\n'),'--json'];
 else if(command==='execute'||command==='restore')args=['d1','execute','DB',...common,'--file',path.resolve(options.file),'--yes'];
 else if(command==='backup')args=['d1','export','DB',...common,'--output',options.output];
 else if(command==='dev')args=['dev','--config',instance.config,'--ip','127.0.0.1','--port','8787'];
 else throw new Error('Unsupported invocation');return {cwd:instance.cwd,args};
}
export function backupPath(name){if(!safeName(name))throw new Error('Invalid backup name');return path.join(root,'.local','backups',`${name}.sql`);}
export function restoreTarget(name,exists=existsSync){
 if(name==='default')throw new Error('Restore requires a new named local instance');const instance=resolveInstance(name,true);
 if(exists(instance.cwd))throw new Error('Restore target already exists');return instance;
}
export async function withPausedControl(control,action,signal){
 if(control)await signal('pause');try{return await action();}finally{if(control)await signal('resume');}
}
