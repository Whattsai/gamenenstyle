import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';
import {afterAll,beforeAll,expect,it} from 'vitest';
// @ts-expect-error 真 R2 使用與本地 Publisher 相同的 bundle 建構器。
import {buildTrackFixture} from '../../tests/support/scene-event-content-fixture.mjs';
import {readPinnedSceneEventContent} from '../src/scene-event-content';

let mf:Miniflare,bucket:R2Bucket;
const source=JSON.parse(readFileSync(new URL('../../contracts/rain-bookshop-last-order.json',import.meta.url),'utf8'));
const options={sceneCatalogId:'019a281e-0000-7000-8000-000000004001',narrativeCatalogId:'019a281e-0000-7000-8000-000000004002',sceneId:'rain-bookshop',sceneVersion:'v1',narrativeId:'rain-bookshop-last-order',narrativeVersion:'v1',capabilities:['bookshop'],eligibleCategoryCodes:['romance'],categories:[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading'],recommendationPriority:1}]};
const build=()=>buildTrackFixture(new URL('../../',import.meta.url),options);
const reference=(object:any)=>({id:object.id,version:object.version,key:object.key,sha256:object.sha256});
const put=async(bundle:any)=>{for(const object of bundle.objects)await bucket.put(object.key,object.bytes);};
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',r2Buckets:['STORY_CONTENT']}));bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;});
afterAll(async()=>{await mf?.dispose();});

it('SEF-IT-068 partial: all four immutable layers are read by pinned version and SHA from real R2',async()=>{
 const bundle=build();await put(bundle);const result=await readPinnedSceneEventContent(bucket,reference(bundle.narrative));
 expect(result.narrative.tracks).toEqual(source.narrative.tracks);expect(result.scene.scenePresentation).toEqual(source.scene.scenePresentation);
 expect(result.eventDefinitions).toHaveLength(6);expect(result.pins).toHaveLength(bundle.objects.length);
 const newer=buildTrackFixture(new URL('../../',import.meta.url),{...options,poolVersion:'v3'});await bucket.put(newer.pool.key,newer.pool.bytes);
 expect((await readPinnedSceneEventContent(bucket,reference(bundle.narrative))).pool.version).toBe('v2');
});

it.each(['scenes','pools','events','narratives'])('SEF-IT-068 partial: missing or corrupted %s fails closed and retry restores the same pinned bundle',async kind=>{
 const bundle=build();await put(bundle);const target=bundle.objects.find((o:any)=>o.kind===kind);
 await bucket.delete(target.key);await expect(readPinnedSceneEventContent(bucket,reference(bundle.narrative))).rejects.toThrow('INVALID_STORY_CONTENT');
 await bucket.put(target.key,'corrupt');await expect(readPinnedSceneEventContent(bucket,reference(bundle.narrative))).rejects.toThrow('INVALID_STORY_CONTENT');
 await bucket.put(target.key,target.bytes);expect((await readPinnedSceneEventContent(bucket,reference(bundle.narrative))).narrative.narrativeId).toBe(bundle.narrative.id);
});

it('content loader refuses private or arbitrary R2 paths before IO',async()=>{
 let reads=0;const fake={get:async()=>{reads++;return null;}}as unknown as R2Bucket;
 await expect(readPinnedSceneEventContent(fake,{id:'rain-bookshop',version:'v1',key:'private/account/photo',sha256:'a'.repeat(64)})).rejects.toThrow('INVALID_STORY_CONTENT');
 expect(reads).toBe(0);
});
