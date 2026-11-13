import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const fail=()=>{throw new Error('INVALID_STORY_CONTENT');};
const tags=new Set(['handcraft','art','reading','hiking','camping','travel','coffee','cooking','foodie','film','anime','drama','puzzle','psychology']);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const only=(o,keys)=>{if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).length!==keys.length||Object.keys(o).some(k=>!keys.includes(k)))fail();};
const number=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)fail();};
const localId=id=>{if(typeof id!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(id))fail();};
/** 無腳本的 2.5D v1：只允許同版內容資產、數值鏡位及前景。 */
function validatePresentation(story){
 if(story.audioCues){only(story.audioCues,['pageTurn','transition']);for(const id of Object.values(story.audioCues))if(!story.assets.some(a=>a.id===id&&a.mimeType==='audio/wav'))fail();}
 const p=story.scenePresentation;if(!p){if(story.nodes.some(n=>n.presentation))fail();return;}
 only(p,['version','backgroundAsset',...(p.foregroundAsset===undefined?[]:['foregroundAsset']),'cameras','hotspots','foreground']);if(p.version!=='2.5d.v1'||!story.assets.some(a=>a.id===p.backgroundAsset&&a.mimeType.startsWith('image/')))fail();
 if(p.foregroundAsset!==undefined&&!story.assets.some(a=>a.id===p.foregroundAsset&&a.mimeType.startsWith('image/')))fail();
 for(const [list,max] of [[p.cameras,12],[p.hotspots,24],[p.foreground,24]])if(!Array.isArray(list)||list.length>max||new Set(list.map(x=>x.id)).size!==list.length)fail();
 if(!p.cameras.length)fail();
 for(const c of p.cameras){only(c,['id','scale','focus','portrait','foreground','tint','tintOpacity']);localId(c.id);number(c.scale,1,2);only(c.focus,['x','y']);number(c.focus.x,0,1);number(c.focus.y,0,1);only(c.portrait,['x','headY','height']);number(c.portrait.x,.3,.7);number(c.portrait.headY,.04,.2);number(c.portrait.height,.7,2.2);if(typeof c.foreground!=='boolean'||!/^#[0-9a-f]{6}$/i.test(c.tint))fail();number(c.tintOpacity,0,.35);}
 for(const h of p.hotspots){only(h,['id','definitionId','label','x','y']);localId(h.id);if(!story.interactions.some(d=>d.id===h.definitionId&&d.moduleType==='inspect-object')||typeof h.label!=='string'||h.label.length<1||h.label.length>60)fail();number(h.x,0,1);number(h.y,0,1);}
 for(const f of p.foreground){only(f,['id','x','y','width','height','color']);localId(f.id);for(const k of ['x','y','width','height'])number(f[k],0,1);if(f.x+f.width>1.001||f.y+f.height>1.001||f.width===0||f.height===0||!/^#[0-9a-f]{6}$/i.test(f.color))fail();}
 for(const n of story.nodes){const v=n.presentation;only(v,['cameraId','expression','hotspotIds']);if(!p.cameras.some(c=>c.id===v.cameraId)||!['neutral','smile','surprised','thoughtful','concerned'].includes(v.expression)||!Array.isArray(v.hotspotIds)||new Set(v.hotspotIds).size!==v.hotspotIds.length||v.hotspotIds.some(id=>!p.hotspots.some(h=>h.id===id&&(n.objects??[]).includes(h.definitionId))))fail();}
}
/** 發布前檢查完整有向無環圖、兩結局、固定模組與公開資產白名單。 */
export function validateStory(story){
 if(!story||story.entry!=='entry'||!/^scene-\d{2,4}$/.test(story.storyId)||!/^v[1-9]\d*$/.test(story.version)||story.locale!=='zh-TW'||!story.title||!story.time||!story.place||!story.event||!Array.isArray(story.interestTagIds)||story.interestTagIds.some(t=>!tags.has(t)))fail();
 if(!Array.isArray(story.nodes)||story.nodes.length<4||story.nodes.length>2000||story.nodes.filter(n=>n.ending).length<2)fail();
 const nodes=new Map(story.nodes.map(n=>[n.id,n])),definitions=new Map(story.interactions.map(d=>[d.id,d]));
 if(nodes.size!==story.nodes.length||definitions.size!==story.interactions.length||story.suggestions.length!==3)fail();
 for(const d of definitions.values())if(!['inspect-object','cooperative-choice'].includes(d.moduleType)||d.options.length<2||new Set(d.options.map(o=>o.id)).size!==d.options.length)fail();
 const visited=new Set(),stack=new Set();
 const visit=id=>{
  if(stack.has(id)||!nodes.has(id))fail();if(visited.has(id))return;stack.add(id);const n=nodes.get(id),next=n.choices.map(c=>c.next);
  if(new Set(n.choices.map(c=>c.id)).size!==n.choices.length||!n.lines.length||n.lines.some(l=>!['旁白','店員・NPC'].includes(l.speaker)||!l.text))fail();
  for(const object of n.objects??[])if(definitions.get(object)?.moduleType!=='inspect-object')fail();
  if(n.interactionId){const d=definitions.get(n.interactionId);if(d?.moduleType!=='cooperative-choice')fail();next.push(d.sameNext,d.differentNext);}
  if(n.ending?next.length>0:next.length===0)fail();for(const target of next)visit(target);stack.delete(id);visited.add(id);
 };visit(story.entry);if(visited.size!==nodes.size)fail();
 for(const a of story.assets)if(!/^story-content\/assets\/[0-9a-f]{64}$/.test(a.key)||a.key!==`story-content/assets/${a.sha256}`||!['image/png','image/jpeg','image/webp','audio/wav'].includes(a.mimeType)||a.byteLength<1||a.byteLength>8*1024*1024)fail();
 if(!story.assets.some(a=>a.id===story.backgroundAsset)||!story.assets.some(a=>a.id===story.audioAsset))fail();
 validatePresentation(story);
 return story;
}
/** 原檔僅供本地工具讀取，發布 JSON 不含 repository 檔案路徑。 */
export function buildStoryBundle(story,root){
 validateStory(story);const directory=path.resolve(root instanceof URL?fileURLToPath(root):root);
 const assets=story.assets.map(a=>{
  const file=path.resolve(directory,a.file);if(!file.startsWith(path.join(directory,'contracts','story-assets')+path.sep))fail();
  const bytes=fs.readFileSync(file);if(sha(bytes)!==a.sha256||bytes.length!==a.byteLength)fail();return {...a,bytes};
 });
 const manifest=structuredClone(story);manifest.assets=manifest.assets.map(({file,...a})=>a);
 const bytes=Buffer.from(JSON.stringify(manifest));return {manifest,bytes,sha256:sha(bytes),key:`story-content/stories/${story.storyId}/${story.version}/manifest.json`,assets};
}
/** local wrapper 已解析的已知 instance 設定才可清舊遊戲。 */
export function validateStoryUpgradeTarget(config){
 if(config?.vars?.APP_ENV!=='local'||!/^datinghigh-local(?:-[a-z0-9-]+)?$/.test(config.name)||config.d1_databases?.length!==1||config.d1_databases[0].binding!=='DB'||config.d1_databases[0].database_name!=='datinghigh-local'||config.d1_databases[0].database_id!=='local-foundation')throw new Error('STORY_UPGRADE_TARGET_FORBIDDEN');
}
export function oldGamePurgeStatements(){return [
 'DELETE FROM game_round_participants',
 "SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_round_participants) THEN 1 ELSE json('PURGE_CLAIMS_FAILED') END",
 'DELETE FROM game_rounds',
 "SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM game_rounds) THEN 1 ELSE json('PURGE_ROUNDS_FAILED') END",
 'DELETE FROM match_invitations',
 "SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM match_invitations) THEN 1 ELSE json('PURGE_INVITATIONS_FAILED') END"
];}
