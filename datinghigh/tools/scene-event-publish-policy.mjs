import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const stmt=(sql,...values)=>({sql,values});
const guard=(condition,...values)=>stmt(`SELECT CASE WHEN ${condition} THEN 1 ELSE json('CONTENT_PUBLICATION_CONFLICT') END AS __publication_guard`,...values);
const invalid=()=>{throw new Error('INVALID_STORY_CONTENT');};
const stable=value=>typeof value==='string'&&/^[a-z][a-z0-9-]{0,63}$/.test(value);
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
const edition=value=>typeof value==='string'&&/^v[1-9][0-9]{0,7}$/.test(value);
const tags=new Set(['handcraft','art','reading','hiking','camping','travel','coffee','cooking','foodie','film','anime','drama','puzzle','psychology']);
let validator;
async function runtimeValidator(validationRoot){
 // 編譯固定、受版控的 Worker validator；不讀取或執行編輯者提供的程式碼，也不產生中間檔。
 validator??=(async()=>{const base=validationRoot??fileURLToPath(new URL('../',import.meta.url));const{build}=createRequire(path.join(base,'cloudflare/package.json'))('esbuild');const output=await build({entryPoints:[path.join(base,'cloudflare/src/scene-event-content.ts')],bundle:true,write:false,format:'esm',platform:'neutral'});return import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));})();
 return validator;
}

function collect(bundles){
 if(!Array.isArray(bundles)||bundles.length<1||bundles.length>200)invalid();
 const categories=new Map(),scenes=new Map(),narratives=new Map(),objects=new Map(),links=new Map();
 function consistent(map,key,value){if(map.has(key)&&JSON.stringify(map.get(key))!==JSON.stringify(value))invalid();map.set(key,value);}
 for(const bundle of bundles){
  for(const category of bundle.categories){
   if(!uuid(category.categoryId)||!stable(category.code)||!edition(category.version)||typeof category.title!=='string'||!category.title.trim()||category.title.length>80||!Number.isSafeInteger(category.recommendationPriority)||!Array.isArray(category.interestTagIds)||category.interestTagIds.length>32||new Set(category.interestTagIds).size!==category.interestTagIds.length||category.interestTagIds.some(t=>!tags.has(t)))invalid();
   consistent(categories,category.categoryId,category);
  }
  const scene=bundle.sceneIndex,narrative=bundle.narrativeIndex;
  if(!uuid(scene.sceneCatalogId)||scene.sceneId!==bundle.scene.id||scene.sceneId!==bundle.scene.manifest.sceneId||scene.version!==bundle.scene.version||scene.version!==bundle.scene.manifest.version||scene.title!==bundle.scene.manifest.title||typeof scene.title!=='string'||!scene.title.trim()||scene.title.length>4000||!uuid(narrative.catalogId)||narrative.storyId!==bundle.narrative.id||narrative.storyId!==bundle.narrative.manifest.narrativeId||narrative.version!==bundle.narrative.version||narrative.version!==bundle.narrative.manifest.version||narrative.sequenceGroupId!==bundle.narrative.manifest.sequenceGroupId||narrative.sequenceOrder!==bundle.narrative.manifest.sequenceOrder||JSON.stringify(narrative.prerequisites)!==JSON.stringify(bundle.narrative.manifest.prerequisites))invalid();
  if(JSON.stringify([...bundle.scene.manifest.categoryCodes].sort())!==JSON.stringify(bundle.categories.map(c=>c.code).sort()))invalid();
  consistent(scenes,bundle.sceneIndex.sceneCatalogId,bundle.sceneIndex);consistent(narratives,bundle.narrativeIndex.catalogId,bundle.narrativeIndex);
  if(bundle.sceneIndex.manifestKey!==bundle.scene.key||bundle.sceneIndex.manifestSha256!==bundle.scene.sha256||bundle.narrativeIndex.manifestKey!==bundle.narrative.key||bundle.narrativeIndex.manifestSha256!==bundle.narrative.sha256||bundle.narrativeIndex.sceneCatalogId!==bundle.sceneIndex.sceneCatalogId)invalid();
  for(const category of bundle.categories){if(!bundle.scene.manifest.categoryCodes.includes(category.code))invalid();links.set(bundle.sceneIndex.sceneCatalogId+'@'+category.categoryId,{sceneCatalogId:bundle.sceneIndex.sceneCatalogId,categoryId:category.categoryId});}
  for(const object of [...bundle.assets,...bundle.objects]){
   const isAsset=/^story-content\/assets\/[0-9a-f]{64}$/.test(object.key);
   if(!isAsset&&!/^story-content\/(scenes|narratives|events|pools)\/[a-z][a-z0-9-]{0,63}\/v[1-9][0-9]{0,7}\/manifest\.json$/.test(object.key)||!object.bytes||object.bytes.length>(isAsset?8388608:524288)||sha(object.bytes)!==object.sha256)invalid();
   if(isAsset&&object.key!=='story-content/assets/'+object.sha256)invalid();
   if(!isAsset&&JSON.stringify(object.manifest)!==Buffer.from(object.bytes).toString('utf8'))invalid();
   const previous=objects.get(object.key);if(previous&&previous.sha256!==object.sha256)throw new Error('IMMUTABLE_CONTENT_CONFLICT');objects.set(object.key,object);
  }
 }
 if(new Set([...categories.values()].map(c=>c.code)).size!==categories.size||new Set([...scenes.values()].map(s=>s.sceneId)).size!==scenes.size||new Set([...narratives.values()].map(n=>n.storyId)).size!==narratives.size)invalid();
 for(const category of categories.values())if(!bundles.some(b=>b.narrative.manifest.eligibleCategoryCodes.includes(category.code)))invalid();
 const narrativeIds=new Set([...narratives.values()].map(n=>n.storyId));
 for(const n of narratives.values()){
  if((n.sequenceGroupId===null)!==(n.sequenceOrder===null)||n.sequenceOrder!==null&&(!Number.isSafeInteger(n.sequenceOrder)||n.sequenceOrder<1))invalid();
  if(!Array.isArray(n.prerequisites)||n.prerequisites.length>64||new Set(n.prerequisites).size!==n.prerequisites.length||n.prerequisites.includes(n.storyId))invalid();
 }
 const visiting=new Set(),visited=new Set(),byId=new Map([...narratives.values()].map(n=>[n.storyId,n]));
 function visit(id){if(visiting.has(id))invalid();if(visited.has(id))return;visiting.add(id);for(const dependency of byId.get(id)?.prerequisites??[])if(narrativeIds.has(dependency))visit(dependency);visiting.delete(id);visited.add(id);}for(const id of narrativeIds)visit(id);
 return {categories:[...categories.values()],scenes:[...scenes.values()],narratives:[...narratives.values()],objects:[...objects.values()],links:[...links.values()]};
}
function validateDependencies(baseline,incoming){
 const map=new Map();for(const row of baseline)if(row.status!=='draft'&&!map.has(row.story_id))map.set(row.story_id,{storyId:row.story_id,sequenceGroupId:row.sequence_group_id,sequenceOrder:row.sequence_order,prerequisites:JSON.parse(row.prerequisites_json)});
 for(const narrative of incoming)map.set(narrative.storyId,narrative);if(map.size>2000)invalid();
 const positions=new Map();for(const narrative of map.values())if(narrative.sequenceGroupId!==null){const key=narrative.sequenceGroupId+'@'+narrative.sequenceOrder;if(positions.has(key)&&positions.get(key)!==narrative.storyId)invalid();positions.set(key,narrative.storyId);}
 const edges=new Map();for(const narrative of map.values()){
  const dependencies=[...narrative.prerequisites];if(narrative.sequenceOrder>1){const prior=positions.get(narrative.sequenceGroupId+'@'+(narrative.sequenceOrder-1));if(!prior)invalid();dependencies.push(prior);}
  if(dependencies.some(id=>!map.has(id)))invalid();edges.set(narrative.storyId,dependencies);
 }
 const visiting=new Set(),visited=new Set();function visit(id){if(visiting.has(id))invalid();if(visited.has(id))return;visiting.add(id);for(const dependency of edges.get(id)??[])visit(dependency);visiting.delete(id);visited.add(id);}for(const id of map.keys())visit(id);
}

/** 固定 prepared SQL；R2 寫入與驗證完成前，不得執行此發布交易。 */
export function planSceneEventPublication(bundles,now=Date.now()){
 const data=collect(bundles),out=[];
 for(const c of data.categories){
  const tags=JSON.stringify(c.interestTagIds);
  out.push(guard(`NOT EXISTS(SELECT 1 FROM content_story_categories WHERE (category_id=? OR (code=? AND version=?)) AND (category_id<>? OR code<>? OR version<>? OR title<>? OR interest_tag_ids_json<>json(?) OR recommendation_priority<>? OR status='retired'))`,c.categoryId,c.code,c.version,c.categoryId,c.code,c.version,c.title,tags,c.recommendationPriority));
  out.push(stmt(`UPDATE content_story_categories SET status='retired' WHERE code=? AND version<>? AND status='published'`,c.code,c.version));
  out.push(stmt(`INSERT INTO content_story_categories SELECT ?,?,?,?,?,?,'published',? WHERE NOT EXISTS(SELECT 1 FROM content_story_categories WHERE category_id=?)`,c.categoryId,c.code,c.version,c.title,tags,c.recommendationPriority,now,c.categoryId));
  out.push(stmt(`UPDATE content_story_categories SET status='published',published_at=COALESCE(published_at,?) WHERE category_id=? AND status='draft'`,now,c.categoryId));
  out.push(guard(`EXISTS(SELECT 1 FROM content_story_categories WHERE category_id=? AND code=? AND version=? AND status='published')`,c.categoryId,c.code,c.version));
 }
 for(const s of data.scenes){
  out.push(guard(`NOT EXISTS(SELECT 1 FROM content_scene_catalog WHERE (scene_catalog_id=? OR (scene_id=? AND version=?)) AND (scene_catalog_id<>? OR scene_id<>? OR version<>? OR title<>? OR manifest_key<>? OR manifest_sha256<>? OR status='retired'))`,s.sceneCatalogId,s.sceneId,s.version,s.sceneCatalogId,s.sceneId,s.version,s.title,s.manifestKey,s.manifestSha256));
  out.push(stmt(`UPDATE content_scene_catalog SET status='retired' WHERE scene_id=? AND version<>? AND status='published'`,s.sceneId,s.version));
  out.push(stmt(`INSERT INTO content_scene_catalog SELECT ?,?,?,?,?,?,'published',? WHERE NOT EXISTS(SELECT 1 FROM content_scene_catalog WHERE scene_catalog_id=?)`,s.sceneCatalogId,s.sceneId,s.version,s.title,s.manifestKey,s.manifestSha256,now,s.sceneCatalogId));
  out.push(stmt(`UPDATE content_scene_catalog SET status='published',published_at=COALESCE(published_at,?) WHERE scene_catalog_id=? AND status='draft'`,now,s.sceneCatalogId));
  out.push(guard(`EXISTS(SELECT 1 FROM content_scene_catalog WHERE scene_catalog_id=? AND manifest_sha256=? AND status='published')`,s.sceneCatalogId,s.manifestSha256));
 }
 for(const link of data.links){
  out.push(stmt(`INSERT INTO content_scene_category_links SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM content_scene_category_links WHERE scene_catalog_id=? AND category_id=?)`,link.sceneCatalogId,link.categoryId,link.sceneCatalogId,link.categoryId));
  out.push(guard(`EXISTS(SELECT 1 FROM content_scene_category_links WHERE scene_catalog_id=? AND category_id=?)`,link.sceneCatalogId,link.categoryId));
 }
 for(const n of data.narratives){
  const tags=JSON.stringify(n.interestTagIds),prerequisites=JSON.stringify(n.prerequisites);
  out.push(guard(`NOT EXISTS(SELECT 1 FROM content_story_catalog WHERE (catalog_id=? OR (story_id=? AND version=?)) AND (catalog_id<>? OR story_id<>? OR version<>? OR manifest_key<>? OR manifest_sha256<>? OR scene_catalog_id IS NOT ? OR sequence_group_id IS NOT ? OR sequence_order IS NOT ? OR prerequisites_json<>json(?) OR interest_tag_ids_json<>json(?) OR recommendation_priority<>? OR status='retired'))`,n.catalogId,n.storyId,n.version,n.catalogId,n.storyId,n.version,n.manifestKey,n.manifestSha256,n.sceneCatalogId,n.sequenceGroupId,n.sequenceOrder,prerequisites,tags,n.recommendationPriority));
  // 前置主線可已退休；只驗存在及有序定義，解鎖仍由遊玩時同 pair 的完成事實決定。
  out.push(guard(`NOT EXISTS(SELECT 1 FROM json_each(?) p WHERE NOT EXISTS(SELECT 1 FROM content_story_catalog c WHERE c.story_id=p.value) AND p.value NOT IN(SELECT value FROM json_each(?)))`,prerequisites,JSON.stringify(data.narratives.map(c=>c.storyId))));
  out.push(stmt(`UPDATE content_story_catalog SET status='retired' WHERE story_id=? AND version<>? AND status='published'`,n.storyId,n.version));
  out.push(stmt(`INSERT INTO content_story_catalog(catalog_id,story_id,version,interest_tag_ids_json,recommendation_priority,manifest_key,manifest_sha256,status,published_at,scene_catalog_id,sequence_group_id,sequence_order,prerequisites_json) SELECT ?,?,?,?,?,?,?,'published',?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM content_story_catalog WHERE catalog_id=?)`,n.catalogId,n.storyId,n.version,tags,n.recommendationPriority,n.manifestKey,n.manifestSha256,now,n.sceneCatalogId,n.sequenceGroupId,n.sequenceOrder,prerequisites,n.catalogId));
  out.push(stmt(`UPDATE content_story_catalog SET status='published',published_at=COALESCE(published_at,?) WHERE catalog_id=? AND status='draft'`,now,n.catalogId));
  out.push(guard(`EXISTS(SELECT 1 FROM content_story_catalog WHERE catalog_id=? AND scene_catalog_id=? AND manifest_sha256=? AND status='published')`,n.catalogId,n.sceneCatalogId,n.manifestSha256));
 }
 return out;
}

/** 本地 wrapper 專用：先 create-only 寫入全部公開內容並讀回驗證，再原子發布 D1。 */
export async function publishSceneEventBundles(db,bucket,bundles,{firstStoryGate,validationRoot,now=Date.now()}={}){
 const data=collect(bundles);
 const{readPinnedSceneEventContent}=await runtimeValidator(validationRoot),objects=new Map(data.objects.map(o=>[o.key,o]));
 const staged={get:async key=>{const object=objects.get(key);return object?{size:object.bytes.length,arrayBuffer:async()=>Uint8Array.from(object.bytes).buffer}:null;}};
 for(const bundle of bundles)try{await readPinnedSceneEventContent(staged,{id:bundle.narrative.id,version:bundle.narrative.version,key:bundle.narrative.key,sha256:bundle.narrative.sha256});}catch{throw new Error('INVALID_STORY_CONTENT');}
 const baselineFields=['catalog_id','story_id','version','manifest_sha256','scene_catalog_id','status','sequence_group_id','sequence_order','prerequisites_json'];
 const baseline=(await db.prepare(`SELECT ${baselineFields.join(',')} FROM content_story_catalog WHERE scene_catalog_id IS NOT NULL ORDER BY CASE status WHEN 'published' THEN 0 WHEN 'retired' THEN 1 ELSE 2 END,published_at DESC,catalog_id DESC`).all()).results;
 validateDependencies(baseline,data.narratives);const existing=baseline.filter(n=>n.status==='published');
 const allIds=new Set([...existing.map(n=>n.story_id),...data.narratives.map(n=>n.storyId)]);
 if([...allIds].some(id=>id!=='rain-bookshop-lost-note')){
  const first=[...existing.map(n=>({id:n.story_id,version:n.version,sha256:n.manifest_sha256})),...bundles.map(b=>({id:b.narrative.id,version:b.narrative.version,sha256:b.narrative.sha256}))];
  if(firstStoryGate?.approvedByUser!==true||firstStoryGate.narrativeId!=='rain-bookshop-lost-note'||!first.some(n=>n.id===firstStoryGate.narrativeId&&n.version===firstStoryGate.version&&n.sha256===firstStoryGate.sha256))throw new Error('FIRST_STORY_GATE_REQUIRED');
 }
 const changed=baselineFields.map(field=>`c.${field} IS NOT json_extract(j.value,'$.${field}')`).join(' OR ');
 const plan=[guard(`(SELECT COUNT(*) FROM content_story_catalog WHERE scene_catalog_id IS NOT NULL)=? AND NOT EXISTS(SELECT 1 FROM content_story_catalog c WHERE c.scene_catalog_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE json_extract(j.value,'$.catalog_id')=c.catalog_id AND NOT(${changed})))`,baseline.length,JSON.stringify(baseline)),...planSceneEventPublication(bundles,now)];
 for(const object of data.objects){
  const previous=await bucket.get(object.key);
  if(previous){if(previous.size!==object.bytes.length||sha(Buffer.from(await previous.arrayBuffer()))!==object.sha256)throw new Error('IMMUTABLE_CONTENT_CONFLICT');}
  else await bucket.put(object.key,object.bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:object.mimeType??'application/json'}});
  const verified=await bucket.get(object.key);if(!verified||verified.size!==object.bytes.length||sha(Buffer.from(await verified.arrayBuffer()))!==object.sha256)throw new Error('IMMUTABLE_CONTENT_CONFLICT');
 }
 await db.batch(plan.map(s=>db.prepare(s.sql).bind(...s.values)));
 return {categories:data.categories.length,scenes:data.scenes.length,narratives:data.narratives.length,objects:data.objects.length};
}
