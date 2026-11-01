import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';import{root}from'./local-policy.mjs';
// 僅使用本專案 wrapper 的已知 loopback control，不接受 remote、URL 或任意 instance。
export async function restartLocal(control,{fetcher=fetch,timeout=120000}={}){
 if(!control||!Number.isInteger(control.port)||control.port<1024||control.port>65535||typeof control.token!=='string'||! /^[a-f0-9]{64}$/.test(control.token)||Object.keys(control).some(key=>!['port','token'].includes(key)))throw new Error('Invalid local platform control');
 for(const operation of ['pause','resume']){const response=await fetcher(`http://127.0.0.1:${control.port}/${operation}`,{method:'POST',headers:{Authorization:`Bearer ${control.token}`,Connection:'close'},signal:AbortSignal.timeout(45000)});if(response.status!==200)throw new Error('Local platform control failed');}
 const end=Date.now()+timeout;do{try{const response=await fetcher('http://127.0.0.1:8787/health/ready',{signal:AbortSignal.timeout(45000)});if(response.status===200&&(await response.json()).status==='ready')return{ready:true};}catch{}if(Date.now()>=end)break;await new Promise(resolve=>setTimeout(resolve,500));}while(Date.now()<end);
 throw new Error('Local platform did not become ready');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==2)throw new Error('Local restart accepts no options');
 const control=JSON.parse(await fs.readFile(path.join(root,'.local/control-default.json'),'utf8'));await restartLocal(control);console.log('DatingHigh local platform restarted: ready');
}
