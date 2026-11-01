import {execFile} from 'node:child_process';import {promisify} from 'node:util';import fs from 'node:fs/promises';import net from 'node:net';
const exec=promisify(execFile);
// workerd 在 WSL/Docker Desktop 可能誤綁 native docker0；僅為本次子程序加 loopback relay。
// 上游：https://github.com/cloudflare/workers-sdk/issues/15257
export function watchWslEgress(child,{run=exec,read=fs.readFile,createServer=net.createServer,interval=setInterval,clear=clearInterval}={}){
 const relays=new Map();let scanning=false,stopped=false;
 async function descendants(pid,result=new Set()){
  result.add(Number(pid));try{const children=(await read(`/proc/${pid}/task/${pid}/children`,'utf8')).trim().split(/\s+/).filter(Boolean);for(const child of children)await descendants(child,result);}catch{}return result;
 }
 const timer=interval(async()=>{
  if(stopped||scanning||child.exitCode!==null)return;scanning=true;
  try{
   const owned=await descendants(child.pid),{stdout}=await run('ss',['-ltnp']);if(stopped)return;const active=new Set();
   for(const line of stdout.split('\n')){
    const match=line.match(/\b(172\.17\.0\.1):(\d+)\s+.*"workerd",pid=(\d+)/);
    if(!match||!owned.has(Number(match[3])))continue;const port=Number(match[2]);active.add(port);if(relays.has(port))continue;
    const server=createServer(client=>{
     const upstream=net.connect({host:match[1],port});client.pipe(upstream).pipe(client);client.on('error',()=>upstream.destroy());upstream.on('error',()=>client.destroy());
    });server.on('error',()=>{relays.delete(port);});server.listen(port,'127.0.0.1');relays.set(port,server);
   }
   for(const [port,server] of relays)if(!active.has(port)){server.close();relays.delete(port);}
  }finally{scanning=false;}
 },1000);
 return ()=>{stopped=true;clear(timer);for(const server of relays.values())server.close();relays.clear();};
}
