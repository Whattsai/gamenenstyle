import {createHash} from 'node:crypto';
import {readFileSync,realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const fail=()=>{throw new Error('INVALID_STORY_CONTENT');};
const id=value=>{if(typeof value!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(value))fail();return value;};
const version=value=>{if(typeof value!=='string'||!/^v[1-9][0-9]{0,7}$/.test(value))fail();return value;};
const uuid=value=>{if(typeof value!=='string'||!(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/).test(value))fail();return value;};
const list=(value,max)=>{if(!Array.isArray(value)||value.length>max||new Set(value).size!==value.length)fail();return value;};
const only=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!keys.includes(key)))fail();};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function object(kind,stableId,edition,manifest){
 const bytes=Buffer.from(JSON.stringify(manifest));if(bytes.length>524288)fail();
 return {kind,id:stableId,version:edition,key:`story-content/${kind}/${stableId}/${edition}/manifest.json`,sha256:hash(bytes),manifest,bytes};
}
const reference=o=>({id:o.id,version:o.version,key:o.key,sha256:o.sha256});
const eventReference=o=>({eventId:o.id,version:o.version,key:o.key,sha256:o.sha256});

/** 直接建構雙 Track 的正式內容；沒有單線轉換器、網路或 runtime 資料副本。發布仍須經共用嚴格 reader。 */
export function buildSceneEventTrackBundle(source,root,options){
 const base=realpathSync(root instanceof URL?fileURLToPath(root):root),content=structuredClone(source);
 const sceneCatalogId=uuid(options.sceneCatalogId),narrativeCatalogId=uuid(options.narrativeCatalogId);
 const categories=structuredClone(options.categories);if(!Array.isArray(categories)||!categories.length)fail();
 const assets=content.scene.assets.map(asset=>{
  const mapping=content.assetSources?.filter(a=>a.id===asset.id);if(mapping?.length!==1||!/^contracts\/story-assets\/[a-z0-9-]+\.(png|jpg|jpeg|webp|wav)$/.test(mapping[0].file))fail();
  const file=realpathSync(path.resolve(base,mapping[0].file)),relative=path.relative(base,file);if(relative.startsWith('..')||path.isAbsolute(relative))fail();
  const bytes=readFileSync(file);if(bytes.length!==asset.byteLength||hash(bytes)!==asset.sha256||asset.key!==`story-content/assets/${asset.sha256}`)fail();
  return {...asset,bytes};
 });
 const events=content.eventDefinitions.map(d=>object('events',id(d.manifest.eventId),version(d.manifest.version),d.manifest));
 const bindings=[...content.narrative.eventBindings,...content.narrative.sharedEventBindings,...content.scene.sceneEventBindings,...content.pool.eventBindings];
 for(const b of bindings){const definition=events.find(d=>d.id===b.definition.eventId&&d.version===b.definition.version);if(!definition)fail();b.definition=eventReference(definition);}
 const scene=object('scenes',id(content.scene.sceneId),version(content.scene.version),content.scene);
 const pool=object('pools',id(content.pool.poolId),version(content.pool.version),content.pool);
 content.narrative.scene=reference(scene);content.narrative.globalPool=reference(pool);
 const narrative=object('narratives',id(content.narrative.narrativeId),version(content.narrative.version),content.narrative);
 const n=content.narrative;
 return {categories,scene,narrative,pool,events,assets,objects:[scene,pool,...events,narrative],sceneIndex:{sceneCatalogId,sceneId:scene.id,version:scene.version,title:scene.manifest.title,manifestKey:scene.key,manifestSha256:scene.sha256},narrativeIndex:{catalogId:narrativeCatalogId,storyId:narrative.id,version:narrative.version,sceneCatalogId,manifestKey:narrative.key,manifestSha256:narrative.sha256,interestTagIds:options.interestTagIds??[...new Set(categories.flatMap(c=>c.interestTagIds))],recommendationPriority:options.recommendationPriority??1,sequenceGroupId:n.sequenceGroupId,sequenceOrder:n.sequenceOrder,prerequisites:n.prerequisites}};
}
