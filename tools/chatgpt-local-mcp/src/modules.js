import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { safePath, redact, safeEnvironment } from './core.js';

function fail(code,message){throw new Error(`${code}: ${message}`);}
function run(executable,args,cwd,timeout=120_000){return new Promise((resolve,reject)=>{const child=spawn(executable,args,{cwd,shell:false,windowsHide:true,env:safeEnvironment()});let out='';const timer=setTimeout(()=>child.kill(),timeout);child.stdout.on('data',x=>out+=x);child.stderr.on('data',x=>out+=x);child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve({exitCode:code,output:redact(out.slice(-24000))});});});}

export class OptionalModules {
  constructor(config,service){this.config=config;this.service=service;this.browser=null;this.page=null;}
  async web(sessionId,alias,action,url,selector){
    await this.service.requireSession(sessionId,alias,true);
    if(!this.config.modules.web.enabled)fail('MODULE_DISABLED','web');
    if(action==='navigate'){
      const target=new URL(url);if(!this.config.modules.web.allowedOrigins.includes(target.origin))fail('WEB_ORIGIN_BLOCKED',target.origin);
      if(!this.browser){const {chromium}=await import('@playwright/test');this.browser=await chromium.launch({headless:true});this.page=await this.browser.newPage();await this.page.route('**/*',route=>{try{return this.config.modules.web.allowedOrigins.includes(new URL(route.request().url()).origin)?route.continue():route.abort();}catch{return route.abort();}});}
      await this.page.goto(url);return {url:this.page.url(),snapshot:(await this.page.locator('body').innerText()).slice(0,24000)};
    }
    if(!this.page)fail('BROWSER_NOT_OPEN','navigate first');
    if(action==='snapshot')return {url:this.page.url(),snapshot:(await this.page.locator('body').innerText()).slice(0,24000)};
    if(action==='click'){if(!selector||selector.length>300)fail('SELECTOR_REQUIRED','selector required');await this.page.locator(selector).click();return {url:this.page.url(),snapshot:(await this.page.locator('body').innerText()).slice(0,24000)};}
    if(action==='screenshot'){const id=randomUUID();await this.page.screenshot({path:join(this.service.state,'artifacts',`${id}.png`)});return {artifactId:id};}
    fail('INVALID_WEB_ACTION',action);
  }
  async artifact(id){if(!/^[0-9a-f-]{36}$/.test(id))fail('INVALID_ARTIFACT_ID',id);const bytes=await readFile(join(this.service.state,'artifacts',`${id}.png`));if(bytes.length>10*1024*1024)fail('ARTIFACT_TOO_LARGE','screenshot exceeds limit');return bytes.toString('base64');}
  async closeWeb(){if(this.browser)await this.browser.close();this.browser=null;this.page=null;return {closed:true};}
  async android(sessionId,alias,action,serial,x,y){
    await this.service.requireSession(sessionId,alias,true);const executable=this.config.modules.android.adbExecutable;
    if(!this.config.modules.android.enabled)fail('MODULE_DISABLED','android');
    if(action==='devices')return run(executable,['devices','-l'],this.config.toolRoot);
    if(!serial||!/^[A-Za-z0-9._:-]{3,100}$/.test(serial))fail('ANDROID_SERIAL_REQUIRED','explicit device serial required');
    const prefix=['-s',serial];
    if(action==='foreground')return run(executable,[...prefix,'shell','dumpsys','window'],this.config.toolRoot);
    if(action==='tap'){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>10000||y>10000)fail('INVALID_COORDINATES','tap coordinates invalid');return run(executable,[...prefix,'shell','input','tap',String(x),String(y)],this.config.toolRoot);}
    if(action==='screenshot'){const id=randomUUID();const output=join(this.service.state,'artifacts',`${id}.png`);
      await new Promise((resolve,reject)=>{const child=spawn(executable,[...prefix,'exec-out','screencap','-p'],{cwd:this.config.toolRoot,shell:false,windowsHide:true,env:safeEnvironment()});const chunks=[];child.stdout.on('data',x=>chunks.push(x));child.on('error',reject);child.on('close',async code=>{if(code!==0)return reject(new Error('ADB screenshot failed'));await writeFile(output,Buffer.concat(chunks));resolve();});});return {artifactId:id};}
    fail('INVALID_ANDROID_ACTION',action);
  }
  async transcribe(sessionId,alias,path){
    await this.service.requireSession(sessionId,alias,true);const module=this.config.modules.offlineMedia;
    if(!module.enabled)fail('MODULE_DISABLED','offlineMedia');
    if(!/\.(?:mp3|wav|m4a|mp4|mov|mkv|webm)$/i.test(path))fail('MEDIA_TYPE_BLOCKED','unsupported media');
    const source=await safePath(this.service.repo(alias).root,path,this.config.toolRoot);const id=randomUUID();const output=join(this.service.state,'artifacts',`${id}.txt`);
    const args=module.args.map(x=>x.replaceAll('{input}',source.absolute).replaceAll('{output}',output));
    if(!module.args.some(x=>x.includes('{input}'))||!module.args.some(x=>x.includes('{output}')))fail('MEDIA_ARGS_INVALID','input/output placeholders required');
    const result=await run(module.transcriberExecutable,args,this.config.toolRoot,600_000);if(result.exitCode!==0)fail('TRANSCRIPTION_FAILED',result.output);return {artifactId:id,text:redact((await readFile(output,'utf8')).slice(0,24000))};
  }
}
