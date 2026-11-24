import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import {afterAll,beforeAll,beforeEach,expect,it} from 'vitest';
import {createHash} from 'node:crypto';
import {loadFrameworkCatalog} from '../src/scene-event-commands';
// @ts-expect-error 固定本地發布政策由真 Miniflare D1／R2 驗證。
import {buildTrackFixture} from '../../tests/support/scene-event-content-fixture.mjs';
// @ts-expect-error Node 本地工具，使用實際 prepared statement 與 R2。
import {publishSceneEventBundles,planSceneEventPublication} from '../../tools/scene-event-publish-policy.mjs';
// @ts-expect-error 與正式發布使用相同的資料建構器。
import {buildSceneEventTrackBundle} from '../../tools/scene-event-content-policy.mjs';

let mf:Miniflare,db:D1Database,bucket:R2Bucket;
const source=JSON.parse(readFileSync(new URL('../../contracts/rain-bookshop-last-order.json',import.meta.url),'utf8'));
const options={sceneCatalogId:'019a281e-0000-7000-8000-000000004001',narrativeCatalogId:'019a281e-0000-7000-8000-000000004002',sceneId:'rain-bookshop',sceneVersion:'v1',narrativeId:'rain-bookshop-last-order',narrativeVersion:'v1',capabilities:['bookshop'],eligibleCategoryCodes:['romance'],categories:[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading'],recommendationPriority:1}]};
const build=()=>buildTrackFixture(new URL('../../',import.meta.url),options);
const rows=async(sql:string)=>(await db.prepare(sql).all()).results;
const statements=(sql:string)=>sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s));
beforeAll(async()=>{
 mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'scene-publication'},r2Buckets:['STORY_CONTENT']}));db=await mf.getD1Database('DB')as unknown as D1Database;bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;
 for(const name of readdirSync(new URL('../migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')&&n<'0008').sort())await db.batch(statements(readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8')));
});
afterAll(async()=>{await mf?.dispose();});
beforeEach(async()=>{
 await db.batch(['DELETE FROM content_scene_category_links','DELETE FROM content_story_catalog','DELETE FROM content_scene_catalog','DELETE FROM content_story_categories'].map(s=>db.prepare(s)));
 const page=await bucket.list();for(const object of page.objects)await bucket.delete(object.key);
});

it('publish verifies real R2 before atomically exposing category, scene, links and narrative; replay is immutable',async()=>{
 const bundle=build();await publishSceneEventBundles(db,bucket,[bundle]);
 expect(await rows("SELECT code,status FROM content_story_categories")).toEqual([{code:'romance',status:'published'}]);
 expect(await rows("SELECT scene_id,status FROM content_scene_catalog")).toEqual([{scene_id:'rain-bookshop',status:'published'}]);
 expect(await rows('SELECT * FROM content_scene_category_links')).toHaveLength(1);
 expect(await rows('SELECT story_id,scene_catalog_id,status FROM content_story_catalog')).toEqual([{story_id:'rain-bookshop-last-order',scene_catalog_id:options.sceneCatalogId,status:'published'}]);
 const before=await rows('SELECT * FROM content_story_catalog');await publishSceneEventBundles(db,bucket,[bundle]);expect(await rows('SELECT * FROM content_story_catalog')).toEqual(before);
 const events=await bucket.list({prefix:'story-content/events/'});expect(events.objects).toHaveLength(6);expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
});

it('partial R2 write or immutable conflict never exposes any D1 catalog',async()=>{
 const bundle=build();let calls=0;
 const broken=new Proxy(bucket,{get(target,key){if(key==='put')return async(...args:any[])=>{if(++calls===2)throw Error('controlled R2 failure');return(target.put as any)(...args);};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 await expect(publishSceneEventBundles(db,broken,[bundle])).rejects.toThrow();expect(await rows('SELECT * FROM content_story_categories')).toEqual([]);
 await bucket.put(bundle.scene.key,'wrong immutable bytes');await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow('IMMUTABLE_CONTENT_CONFLICT');
 expect(await rows('SELECT * FROM content_scene_catalog')).toEqual([]);expect(await rows('SELECT * FROM content_story_catalog')).toEqual([]);
});
it('a missing declared asset or inconsistent MIME is rejected before any real R2 or D1 publication',async()=>{
 for(const mode of ['missing','mime']){
  const bundle=build(),asset=bundle.assets[0];
  if(mode==='missing'){bundle.assets=bundle.assets.filter((a:any)=>a.key!==asset.key);bundle.objects=bundle.objects.filter((a:any)=>a.key!==asset.key);}else asset.mimeType='audio/wav';
  await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow('INVALID_STORY_CONTENT');
  expect((await bucket.list()).objects).toHaveLength(0);
  for(const table of ['content_story_catalog','content_scene_catalog','content_story_categories','content_scene_category_links'])expect(await rows('SELECT * FROM '+table)).toHaveLength(0);
 }
});
it('immutable bytes with conflicting existing R2 MIME cannot expose a broken published scene',async()=>{
 const bundle=build(),asset=bundle.assets[0];await bucket.put(asset.key,asset.bytes,{httpMetadata:{contentType:'audio/wav'}});
 await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow('IMMUTABLE_CONTENT_CONFLICT');
 expect(await rows('SELECT * FROM content_story_catalog')).toHaveLength(0);expect(await rows('SELECT * FROM content_scene_catalog')).toHaveLength(0);
});

it('zero-row scene creation rolls back all D1 publication records',async()=>{
 const bundle=build();const plan=planSceneEventPublication([bundle],Date.now());
 const index=plan.findIndex((s:any)=>s.sql.startsWith('INSERT INTO content_scene_catalog'));expect(index).toBeGreaterThanOrEqual(0);
 plan[index].sql=plan[index].sql.replace('WHERE NOT EXISTS','WHERE 0 AND NOT EXISTS');
 await expect(db.batch(plan.map((s:any)=>db.prepare(s.sql).bind(...s.values)))).rejects.toThrow();
 for(const table of ['content_story_categories','content_scene_catalog','content_scene_category_links','content_story_catalog'])expect(await rows('SELECT * FROM '+table)).toEqual([]);
});
it('publisher independently rejects a rehashed unsafe DSL before writing R2 or any D1 index',async()=>{
 const bundle=build();bundle.narrative.manifest.eventBindings[0].triggerConditions={script:'true'};
 bundle.narrative.bytes=Buffer.from(JSON.stringify(bundle.narrative.manifest));bundle.narrative.sha256=createHash('sha256').update(bundle.narrative.bytes).digest('hex');bundle.narrativeIndex.manifestSha256=bundle.narrative.sha256;
 await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow('INVALID_STORY_CONTENT');
 expect((await bucket.list()).objects).toEqual([]);expect(await rows('SELECT * FROM content_story_catalog')).toEqual([]);
});
it('publisher refuses a rehashed random cooperative gate that could permanently block the only route',async()=>{
 const bundle=build(),binding=bundle.narrative.manifest.sharedEventBindings.find((b:any)=>b.bindingId==='counter-meet');binding.requiredForEnding=false;binding.selectionMode='weighted_random';binding.probability=.5;
 bundle.narrative.bytes=Buffer.from(JSON.stringify(bundle.narrative.manifest));bundle.narrative.sha256=createHash('sha256').update(bundle.narrative.bytes).digest('hex');bundle.narrativeIndex.manifestSha256=bundle.narrative.sha256;
 await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow('INVALID_STORY_CONTENT');expect((await bucket.list()).objects).toEqual([]);expect(await rows('SELECT * FROM content_story_catalog')).toEqual([]);
});
it('a narrative node references its binding ID while reusing the unchanged cooperative definition',async()=>{
 const bundle=build(),binding=bundle.narrative.manifest.sharedEventBindings.find((b:any)=>b.bindingId==='counter-meet');binding.bindingId='meeting-route';
 bundle.narrative.manifest=JSON.parse(JSON.stringify(bundle.narrative.manifest).replaceAll(':counter-meet',':meeting-route'));
 bundle.narrative.bytes=Buffer.from(JSON.stringify(bundle.narrative.manifest));bundle.narrative.sha256=createHash('sha256').update(bundle.narrative.bytes).digest('hex');bundle.narrativeIndex.manifestSha256=bundle.narrative.sha256;
 await expect(publishSceneEventBundles(db,bucket,[bundle])).resolves.toMatchObject({narratives:1});expect(await rows("SELECT status FROM content_story_catalog")).toEqual([{status:'published'}]);
});
it('an ordered chapter cannot be published without the previous stable narrative',async()=>{
 const bundle=buildTrackFixture(new URL('../../',import.meta.url),{...options,sequenceGroupId:'bookshop-sequence',sequenceOrder:2});
 await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow('INVALID_STORY_CONTENT');expect(await rows('SELECT * FROM content_story_catalog')).toEqual([]);expect((await bucket.list()).objects).toEqual([]);
});

it('first-story gate rejects a second formal narrative before any R2 or D1 operation',async()=>{
 const first=build(),second=buildTrackFixture(new URL('../../',import.meta.url),{...options,narrativeId:'another-fixture',narrativeCatalogId:'019a281e-0000-7000-8000-000000004004'});
 await expect(publishSceneEventBundles(db,bucket,[first,second])).rejects.toThrow('FIRST_STORY_GATE_REQUIRED');
 expect((await bucket.list()).objects).toEqual([]);expect(await rows('SELECT * FROM content_story_catalog')).toEqual([]);
});

it('V3 first story retires only the old selection index and keeps its immutable pinned bytes',async()=>{
 const old=build();await publishSceneEventBundles(db,bucket,[old]);
 const content=JSON.parse(readFileSync(new URL('../../contracts/rain-bookshop-before-rain-stops.json',import.meta.url),'utf8'));
 const next=buildSceneEventTrackBundle(content,new URL('../../',import.meta.url),{...options,sceneCatalogId:'019a281e-0000-7000-8000-000000005011',narrativeCatalogId:'019a281e-0000-7000-8000-000000005012'});
 await publishSceneEventBundles(db,bucket,[next]);
 expect(await rows('SELECT story_id,status FROM content_story_catalog ORDER BY story_id')).toEqual([{story_id:'rain-bookshop-before-rain-stops',status:'published'},{story_id:'rain-bookshop-last-order',status:'retired'}]);
 expect(await (await bucket.get(old.narrative.key))!.text()).toBe(old.narrative.bytes.toString());
 expect((await loadFrameworkCatalog({DB:db,STORY_CONTENT:bucket})).map(c=>c.narrativeId)).toEqual(['rain-bookshop-before-rain-stops']);
 expect(await rows('PRAGMA foreign_key_check')).toEqual([]);
},60000);

it('the old first-story approval cannot authorize any remaining story',async()=>{
 const first=build();await publishSceneEventBundles(db,bucket,[first]);
 const next=buildTrackFixture(new URL('../../',import.meta.url),{...options,narrativeId:'another-fixture',narrativeCatalogId:'019a281e-0000-7000-8000-000000004004'});
 const before=await rows('SELECT * FROM content_story_catalog'),objects=(await bucket.list()).objects;
 await expect(publishSceneEventBundles(db,bucket,[next],{firstStoryGate:{approvedByUser:true,narrativeId:first.narrative.id,version:first.narrative.version,sha256:first.narrative.sha256}})).rejects.toThrow('FIRST_STORY_GATE_REQUIRED');
 expect(await rows('SELECT * FROM content_story_catalog')).toEqual(before);expect((await bucket.list()).objects).toEqual(objects);
});

it.each(['camera','expression','audio'])('invalid %s presentation reports its public reference and retains the published real D1/R2 version',async kind=>{
 const first=build();await publishSceneEventBundles(db,bucket,[first]);
 const tables=['content_story_catalog','content_scene_catalog','content_story_categories','content_scene_category_links'];
 const before=await Promise.all(tables.map(table=>rows('SELECT * FROM '+table))),objects=(await bucket.list()).objects;
 const next=buildTrackFixture(new URL('../../',import.meta.url),{...options,narrativeVersion:'v3',narrativeCatalogId:'019a281e-0000-7000-8000-000000004005',mutate(content:any){
  content.narrative.eventBindings[0].actions[0].presentationSteps=[kind==='camera'?{type:'camera',cameraId:'missing-camera',durationMs:100}:kind==='expression'?{type:'expression',role:'inviter',expression:'unknown-expression'}:{type:'audio',cueId:'unpublished-audio'}];
 }});
 await expect(publishSceneEventBundles(db,bucket,[next])).rejects.toThrow('INVALID_STORY_CONTENT: invalid presentation '+kind);
 expect(await Promise.all(tables.map(table=>rows('SELECT * FROM '+table)))).toEqual(before);expect((await bucket.list()).objects).toEqual(objects);
});

it.each(['content_scene_catalog','content_story_categories'])('a retired %s reference refuses republication without changing any existing catalog or R2 object',async table=>{
 const bundle=build();await publishSceneEventBundles(db,bucket,[bundle]);await db.prepare('UPDATE '+table+" SET status='retired'").run();
 const tables=['content_story_categories','content_scene_catalog','content_scene_category_links','content_story_catalog'];const before=await Promise.all(tables.map(table=>rows('SELECT * FROM '+table)));const objects=(await bucket.list()).objects;
 await expect(publishSceneEventBundles(db,bucket,[bundle])).rejects.toThrow();expect(await Promise.all(tables.map(table=>rows('SELECT * FROM '+table)))).toEqual(before);expect((await bucket.list()).objects).toEqual(objects);
});
