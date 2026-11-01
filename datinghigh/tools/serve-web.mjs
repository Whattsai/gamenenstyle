import {createServer} from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {root} from './local-policy.mjs';
const directory=path.join(root,'frontend/client/dist');
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'};
createServer(async(request,response)=>{
 try{
  if(request.method!=='GET'&&request.method!=='HEAD'){response.writeHead(405).end();return;}
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname),file=path.resolve(directory,`.${pathname}`);
  if(!file.startsWith(directory+path.sep)&&file!==directory){response.writeHead(403).end();return;}
  let body,extension=path.extname(file);
  try{body=await fs.readFile(file);}catch{if(extension){response.writeHead(404).end();return;}body=await fs.readFile(path.join(directory,'index.html'));extension='.html';}
  response.writeHead(200,{'Content-Type':types[extension]??'application/octet-stream','Cache-Control':'no-store'});response.end(request.method==='HEAD'?undefined:body);
 }catch{response.writeHead(400).end();}
}).listen(8081,'127.0.0.1',()=>console.log('Expo SPA: http://localhost:8081'));
