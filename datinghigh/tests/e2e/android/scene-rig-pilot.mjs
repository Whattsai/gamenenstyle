import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {invoke,nodes,visible,memorySample,reopen} from './support.mjs';
assert.equal(process.env.DATINGHIGH_ANDROID_DEVICE,'emulator-5556');assert.equal(process.env.DATINGHIGH_ADB_PORT,'5038');
assert.equal(invoke('shell','getprop','ro.boot.qemu.avd_name').trim(),'DatingHighQA31');
const root='.local/rig-pilot/android-batch';fs.mkdirSync(root,{recursive:true});
const adb=path.join(process.env.LOCALAPPDATA,'Android/Sdk/platform-tools/adb.exe'),results=[],memory=[];
const sourceFiles=['tests/component-layout/scene-rig-preview.tsx','tests/component-layout/rig-review-catalog.ts','tests/component-layout/server.mjs','frontend/client/src/ActorMotionRenderer.tsx','frontend/client/src/actor-rig-policy.ts','frontend/client/src/scene-browser-lifecycle.ts','frontend/client/metro.config.js','tests/native/rig-entry.tsx'];
const catalogSource=fs.readFileSync('tests/component-layout/rig-review-catalog.ts','utf8');
const catalog=JSON.parse(catalogSource.slice(catalogSource.indexOf('['),catalogSource.lastIndexOf(']')+1));
sourceFiles.push(...catalog.flatMap(e=>(e.sheets??[e]).flatMap(a=>[a,...a.corrections??[]]).map(a=>'.local/rig-pilot/'+a.file)));
const sourceFingerprint=()=>createHash('sha256').update(sourceFiles.map(p=>fs.readFileSync(p)).join('\n')).digest('hex');
const frozenFingerprint=sourceFingerprint();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function control(label,direction){
 for(let i=0;i<8;i++){
  const n=nodes().find(n=>n['content-desc']===label&&n.clickable==='true'&&visible(n));if(n)return n;
  invoke('shell','input','swipe','360',direction==='up'?'450':'1350','360',direction==='up'?'1350':'450','350');
 }assert.fail(`Controlled Rig button is visible: ${label}`);
}
function press(n){const [x1,y1,x2,y2]=n.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));}
function title(id,pose,emotion){const text=`${id} · ${pose} · ${emotion}`;assert.ok(nodes().some(n=>n.text===text),`Native Rig state: ${text}`);}
async function decoded(id){const deadline=Date.now()+45000;while(Date.now()<deadline){const all=nodes();assert.ok(!all.some(n=>n['content-desc']===`review-error-${id}`),`Native images decoded for ${id}`);if(all.some(n=>n['content-desc']===`review-ready-${id}`&&visible(n)))return;await sleep(500);}assert.fail(`Native original, body and face load events: ${id}`);}
function capture(id,mode){
 assert.ok(nodes().some(n=>n['content-desc']?.startsWith('pose-')),'only capture controlled Rig fixture');
 const png=execFileSync(adb,['-P','5038','-s','emulator-5556','exec-out','screencap','-p'],{windowsHide:true,encoding:null,timeout:45000,maxBuffer:8*1024*1024});fs.writeFileSync(`${root}/${id}-${mode}.png`,png);
}
invoke('reverse','tcp:8092','tcp:8092');
await reopen(8086,{hideDevTools:true});await sleep(2500);
const ids=[...['female','male'].flatMap(g=>Array.from({length:8},(_,i)=>`${g}-0${i+1}`)),'ai'];
for(const id of ids){
 press(await control(`select-${id}`,'up'));await sleep(700);
 await decoded(id);
 await control('pose-stand','down');const controls=nodes();
 const find=label=>{const n=controls.find(n=>n['content-desc']===label&&n.clickable==='true'&&visible(n));assert.ok(n,label);return n;};
 const poseControls=Object.fromEntries(['stand','sit','read','hold'].map(p=>[p,find('pose-'+p)]));
 const emotionControls=Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map(e=>[e,find('expression-'+e)]));
 // Controls remain fixed inside this selected detail; no source/HMR changes during this runner.
 for(const [pose,label] of [['stand','站立'],['sit','坐姿'],['read','閱讀'],['hold','持書']]){press(poseControls[pose]);await sleep(250);title(id,label,'自然');}
 for(const [emotion,label] of [['neutral','自然'],['smile','微笑'],['surprised','驚訝'],['thoughtful','思考'],['concerned','擔心']]){press(emotionControls[emotion]);await sleep(250);title(id,'持書',label);}
 press(poseControls.read);await sleep(250);capture(id,'concerned');press(emotionControls.neutral);await sleep(250);capture(id,'read');
 results.push({id,poses:4,expressions:5,nativeStateVerified:true,originalAndRequiredLayersDecoded:true});
 if(['female-01','female-08','male-08','ai'].includes(id))memory.push(memorySample(id));
 console.log(`${id}: four native poses and five facial states passed`);
}
invoke('shell','input','keyevent','3');invoke('shell','am','start','-n','com.datinghigh.app/.MainActivity');await sleep(500);title('ai','閱讀','自然');
assert.equal(sourceFingerprint(),frozenFingerprint,'native batch source stayed frozen');
fs.writeFileSync('.local/rig-pilot/android-batch-result.json',JSON.stringify({scope:'QA31 development component batch; not production readiness, provider generation, release performance, low-memory or story Gate B',executedAt:new Date().toISOString(),sourceFingerprint:frozenFingerprint,status:'passed',results,memory},null,2));
console.log('Android batch: 17 characters, four poses, five expressions and Home resume passed. Human batch quality pending.');
