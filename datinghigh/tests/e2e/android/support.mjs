import {execFileSync} from 'node:child_process';import path from 'node:path';import assert from 'node:assert/strict';
const adb=path.join(process.env.ANDROID_HOME??path.join(process.env.LOCALAPPDATA,'Android/Sdk'),'platform-tools/adb.exe');export const device=process.env.DATINGHIGH_ANDROID_DEVICE??'emulator-5554';
export const invoke=(...args)=>{try{return execFileSync(adb,[...(process.env.DATINGHIGH_ADB_PORT?['-P',process.env.DATINGHIGH_ADB_PORT]:[]),'-s',device,...args],{encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe'],timeout:45000});}catch(e){throw new Error(`Android command failed (${args[0]}): ${e.code??'nonzero exit'}`);}};
// XML 只從 PTY 讀入記憶體，驗證碼／密碼不寫 UI dump、影片、log 或 screenshot。
export function nodes(){for(let attempt=0;attempt<3;attempt++){const xml=invoke('shell','-tt','uiautomator','dump','--compressed','/dev/tty');const parsed=[...xml.matchAll(/<node\b[^>]*>/g)].map(m=>Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],a[2].replaceAll('&amp;','&').replaceAll('&quot;','"')])));if(parsed.length)return parsed;}return [];}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export function dismissSystemSave(all){if(!all.some(n=>n.text==='Save password to Google Password Manager?'))return false;const later=all.find(n=>n.text==='Not now');if(later){const [x1,y1,x2,y2]=later.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));}else invoke('shell','input','keyevent','4');return true;}
export async function wait(label,timeout=120000,clickable=false){const deadline=Date.now()+timeout;while(Date.now()<deadline){const all=nodes();if(dismissSystemSave(all))continue;const n=all.find(n=>(n['content-desc']===label||n.text===label)&&n.bounds!=='[0,0][0,0]'&&(!clickable||n.clickable==='true'));if(n)return n;await sleep(500);}throw Object.assign(new Error('Expected native control did not appear before deadline'),{control:label});}
export async function tap(label){const n=await wait(label,120000,true);const [x1,y1,x2,y2]=n.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));await sleep(500);}
export async function fill(label,value){
 const attempts=label==='Email'?3:1;
 for(let attempt=0;attempt<attempts;attempt++){
  let n;for(let i=0;i<5&&!n;i++){const all=nodes();if(dismissSystemSave(all))continue;n=all.find(n=>n['content-desc']===label&&n.class==='android.widget.EditText');if(!n)await sleep(500);}assert.ok(n,`Input exists: ${label}`);
  const [x1,y1,x2,y2]=n.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));await sleep(400);invoke('shell','input','keycombination','113','29');invoke('shell','input','keyevent','67');invoke('shell','input','text',value.replaceAll(' ','%s'));await sleep(300);invoke('shell','input','keyevent','4');await sleep(300);
  if(label!=='Email')return;const deadline=Date.now()+10000;while(Date.now()<deadline){if(nodes().some(n=>n.class==='android.widget.EditText'&&n.text===value))return;await sleep(500);}
 }
 assert.fail('Native Email input matches test value after bounded input attempts');
}
export async function reopen(port=8082){invoke('reverse',`tcp:${port}`,`tcp:${port}`);invoke('shell','am','force-stop','com.datinghigh.app');invoke('shell','am','start','-a','android.intent.action.VIEW','-d',`datinghigh://expo-development-client/?url=${encodeURIComponent('http://localhost:'+port)}`);}
