import{spawn,type ChildProcess}from'node:child_process';import path from'node:path';import{fileURLToPath}from'node:url';import type{APIRequestContext,Page}from'@playwright/test';
const root=fileURLToPath(new URL('../../../',import.meta.url));
export async function startBackend(environment:Record<string,string>={}){
 const child=spawn('dotnet',[path.join(root,'backend/tests/DatingHigh.E2eHost/bin/Debug/net10.0/DatingHigh.E2eHost.dll')],{cwd:root,env:{...process.env,...environment},windowsHide:true,stdio:['ignore','pipe','pipe']});
 let output='',startupError='';const ready=await new Promise<{url:string,key:string}>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Isolated API test host did not start')),90000);child.stdout!.on('data',data=>{output+=String(data);let end;while((end=output.indexOf('\n'))>=0){const line=output.slice(0,end).trim();output=output.slice(end+1);if(line.startsWith('{"url":')){clearTimeout(timer);resolve(JSON.parse(line));}}});child.stderr!.on('data',data=>{if(startupError.length<2000)startupError+=String(data);});child.once('exit',()=>{clearTimeout(timer);reject(new Error('Isolated API test host exited: '+(startupError.match(/[^\n]*Exception[^\n]*/)?.[0]??'startup failure')));});});
 return{...ready,child};
}
export type Backend=Awaited<ReturnType<typeof startBackend>>;
export async function control(backend:Backend,request:APIRequestContext,data:Record<string,unknown>){const response=await request.post(`${backend.url}/_test/control`,{headers:{'X-DatingHigh-Test-Control':backend.key},data,timeout:45000});if(response.status()!==200)throw new Error('Isolated API test control failed');return response.json();}
export async function stopBackend(backend:Backend,request:APIRequestContext){await control(backend,request,{op:'shutdown'});await new Promise<void>(resolve=>{if(backend.child.exitCode!==null){resolve();return;}backend.child.once('exit',()=>resolve());});}
export async function routeBackend(page:Page,backend:Backend){
 await page.addInitScript(()=>{let offset=0;const now=performance.now.bind(performance);Object.defineProperty(performance,'now',{configurable:true,value:()=>now()+offset});(window as any).__testAdvance=(milliseconds:number)=>{offset+=milliseconds;};});
 await page.route('**/api/v1/**',async route=>{const original=new URL(route.request().url());try{const response=await route.fetch({url:backend.url+original.pathname+original.search,headers:await route.request().allHeaders(),timeout:50000});await route.fulfill({response});}catch{await route.abort('failed').catch(()=>{});}});
}
export async function advance(backend:Backend,request:APIRequestContext,page:Page,milliseconds:number){await page.evaluate(value=>(window as any).__testAdvance(value),milliseconds);await control(backend,request,{op:'advance',milliseconds});}

export const avatarFixturePassword='A real D1 integration password';
