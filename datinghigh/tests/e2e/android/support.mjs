import {execFileSync} from 'node:child_process';import path from 'node:path';import assert from 'node:assert/strict';
const adb=path.join(process.env.ANDROID_HOME??path.join(process.env.LOCALAPPDATA,'Android/Sdk'),'platform-tools/adb.exe');export const device=process.env.DATINGHIGH_ANDROID_DEVICE??'emulator-5554';
export const invoke=(...args)=>{try{return execFileSync(adb,[...(process.env.DATINGHIGH_ADB_PORT?['-P',process.env.DATINGHIGH_ADB_PORT]:[]),'-s',device,...args],{encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe'],timeout:45000});}catch(e){throw new Error(`Android command failed (${args[0]}/${args[1]??''}): ${e.status??e.code??'nonzero exit'}`);}};
// XML 只從 PTY 讀入記憶體，驗證碼／密碼不寫 UI dump、影片、log 或 screenshot。
let screenBounds;
export function decodeXmlAttribute(value){
 return value.replace(/&(amp|quot|apos|lt|gt|#(?:[0-9]+|x[0-9a-fA-F]+));/g,(entity,name)=>{
  const named={amp:'&',quot:'"',apos:"'",lt:'<',gt:'>'};if(Object.hasOwn(named,name))return named[name];
  const point=name.startsWith('#x')?parseInt(name.slice(2),16):Number(name.slice(1));
  return Number.isInteger(point)&&point>0&&point<=0x10ffff&&(point<0xd800||point>0xdfff)?String.fromCodePoint(point):entity;
 });
}
export function nodes(){let failure;for(let attempt=0;attempt<3;attempt++){try{const xml=invoke('shell','-tt','uiautomator','dump','--compressed','/dev/tty');const parsed=[...xml.matchAll(/<node\b[^>]*>/g)].map(m=>Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],decodeXmlAttribute(a[2])])));if(parsed.length){const root=parsed[0].bounds?.match(/-?\d+/g)?.map(Number);if(root?.length===4&&root[0]===0&&root[1]===0&&root[2]>0&&root[3]>0)screenBounds={width:root[2],height:root[3]};return parsed;}}catch(error){failure=error;}}if(failure)throw failure;return [];}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// UiAutomator會回傳捲出畫面的倒置bounds；不能取絕對座標誤點另一個控制項。
export function visible(node,viewport=screenBounds){const b=node.bounds?.match(/-?\d+/g)?.map(Number);return !!b&&b.length===4&&b[0]>=0&&b[1]>=0&&b[2]-b[0]>=12&&b[3]-b[1]>=12&&(!viewport||(b[0]+b[2])/2<viewport.width&&(b[1]+b[3])/2<viewport.height);}
export function dismissSystemSave(all){if(!all.some(n=>n.text==='Save password to Google Password Manager?'))return false;const later=all.find(n=>n.text==='Not now');if(later){const [x1,y1,x2,y2]=later.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));}else invoke('shell','input','keyevent','4');return true;}
export async function wait(label,timeout=120000,clickable=false){const deadline=Date.now()+timeout;while(Date.now()<deadline){const all=nodes();if(dismissSystemSave(all))continue;const n=all.find(n=>(n['content-desc']===label||n.text===label)&&visible(n)&&(!clickable||n.clickable==='true'));if(n)return n;await sleep(500);}throw Object.assign(new Error('Expected native control did not appear before deadline'),{control:label});}
export async function tap(label){const n=await wait(label,120000,true);const [x1,y1,x2,y2]=n.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));await sleep(500);}
export async function fill(label,value,verifyExactEmail=true){
 const attempts=label==='Email'&&verifyExactEmail?3:1;
 for(let attempt=0;attempt<attempts;attempt++){
  let n;for(let i=0;i<5&&!n;i++){const all=nodes();if(dismissSystemSave(all))continue;n=all.find(n=>n['content-desc']===label&&n.class==='android.widget.EditText'&&visible(n));if(!n)await sleep(500);}assert.ok(n,`Input exists: ${label}`);
  const [x1,y1,x2,y2]=n.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));await sleep(400);invoke('shell','input','keycombination','113','29');invoke('shell','input','keyevent','67');await sleep(350);const pieces=label==='Email'?value.split(/(@)/):[value];for(const piece of pieces){for(let start=0;start<piece.length;start+=4){invoke('shell','input','text',piece.slice(start,start+4).replaceAll(' ','%s'));await sleep(150);}if(piece==='@')await sleep(500);}await sleep(300);
  // API36 predictive-back可能把Back交給頁面而未收合IME；Escape只收鍵盤，不導航。
  invoke('shell','input','keyevent','111');await sleep(500);
  if(label!=='Email'||!verifyExactEmail)return;const deadline=Date.now()+10000;while(Date.now()<deadline){if(nodes().some(n=>n.class==='android.widget.EditText'&&n.text===value))return;await sleep(500);}
 }
 assert.fail('Native Email input matches test value after bounded input attempts');
}
export async function reopen(port=8082){invoke('reverse',`tcp:${port}`,`tcp:${port}`);invoke('shell','am','force-stop','com.datinghigh.app');invoke('shell','am','start','-a','android.intent.action.VIEW','-d',`datinghigh://expo-development-client/?url=${encodeURIComponent('http://localhost:'+port)}`);}
