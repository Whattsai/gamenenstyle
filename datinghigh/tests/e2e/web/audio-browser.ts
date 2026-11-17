import {spawn,spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,realpathSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

/** Playwright normally forces focus per page. A separate owned default context
 * with noDefaults exercises actual browser lifecycle and HTMLMediaElement state. */
export async function startAudioBrowser(){
 const root=fileURLToPath(new URL('../../../',import.meta.url)),profiles=path.join(root,'.local','audio-browsers');mkdirSync(profiles,{recursive:true});
 const profile=mkdtempSync(path.join(profiles,'chrome-'));
 const executable=[process.env.PROGRAMFILES,process.env['PROGRAMFILES(X86)'],process.env.LOCALAPPDATA].filter(Boolean).map(base=>path.join(base!,'Google','Chrome','Application','chrome.exe')).find(existsSync);
 if(!executable)throw Error('Installed Chrome is required for the audio lifecycle test');
 const child=spawn(executable,[`--user-data-dir=${profile}`,'--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--disable-sync','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-features=CalculateNativeWinOcclusion','--new-window','about:blank'],{windowsHide:false,stdio:'ignore'});
 let browser:Awaited<ReturnType<typeof chromium.connectOverCDP>>|undefined;
 const close=async()=>{
  if(browser){const session=await browser.newBrowserCDPSession().catch(()=>null);if(session)await session.send('Browser.close').catch(()=>{});await browser.close().catch(()=>{});}
  if(child.exitCode===null){await Promise.race([new Promise(resolve=>child.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,3000))]);if(child.exitCode===null)spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});}
  const target=realpathSync(profile),boundary=realpathSync(profiles)+path.sep;if(!target.startsWith(boundary))throw Error('Audio browser profile escaped its owned workspace');
  rmSync(target,{recursive:true,force:true,maxRetries:5,retryDelay:200});
 };
 try{
  const portFile=path.join(profile,'DevToolsActivePort'),deadline=Date.now()+30000;while(!existsSync(portFile)){if(child.exitCode!==null||Date.now()>deadline)throw Error('Owned audio Chrome did not start');await new Promise(resolve=>setTimeout(resolve,100));}
  const port=Number(readFileSync(portFile,'utf8').split(/\r?\n/)[0]);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid owned Chrome loopback port');
  browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`,{noDefaults:true});const context=browser.contexts()[0],page=context.pages()[0]??await context.newPage();
  const session=await context.newCDPSession(page),window=await session.send('Browser.getWindowForTarget');
  await session.send('Browser.setWindowBounds',{windowId:window.windowId,bounds:{windowState:'normal'}});await session.send('Browser.setWindowBounds',{windowId:window.windowId,bounds:{left:30,top:30,width:1200,height:900}});await session.detach();await page.bringToFront();
  return{page,context,close};
 }catch(error){await close();throw error;}
}
