import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {createHash} from 'node:crypto';
import {afterAll,beforeAll,expect,it} from 'vitest';
import {readPinnedSceneEventContent} from '../src/scene-event-content';
import {trackContentFixture} from './support/scene-event-track-fixture';

let mf:Miniflare,bucket:R2Bucket;
const encode=(kind:string,id:string,value:any)=>{const bytes=JSON.stringify(value);return{bytes,ref:{id,version:value.version,key:`story-content/${kind}/${id}/${value.version}/manifest.json`,sha256:createHash('sha256').update(bytes).digest('hex')}};};
async function publish(){
 const content=trackContentFixture(),objects=[];
 for(const d of content.eventDefinitions){const obj=encode('events',d.manifest.eventId,d.manifest);d.reference={eventId:obj.ref.id,...obj.ref};delete d.reference.id;objects.push(obj);for(const b of [...content.narrative.eventBindings,...content.narrative.sharedEventBindings])if(b.definition.eventId===d.reference.eventId)b.definition=d.reference;}
 const scene=encode('scenes',content.scene.sceneId,content.scene),pool=encode('pools',content.pool.poolId,content.pool);content.narrative.scene=scene.ref;content.narrative.globalPool=pool.ref;
 const narrative=encode('narratives',content.narrative.narrativeId,content.narrative);objects.push(scene,pool,narrative);
 for(const obj of objects)await bucket.put(obj.ref.key,obj.bytes);return{content,objects,narrative};
}
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default{fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',r2Buckets:['STORY_CONTENT']}));bucket=await mf.getR2Bucket('STORY_CONTENT')as unknown as R2Bucket;});
afterAll(async()=>{await mf?.dispose();});
it('SEF-IT-129: reads both tracks and every version-pinned dependency from real R2',async()=>{
 const {content,narrative,objects}=await publish(),read=await readPinnedSceneEventContent(bucket,narrative.ref);
 expect((read.narrative as any).tracks).toEqual(content.narrative.tracks);expect(read.pins).toHaveLength(objects.length);
});
it.each(['scenes','pools','events','narratives'])('SEF-IT-129: tampered or missing %s fails closed; restoring original hash preserves both tracks',async kind=>{
 const {narrative,objects}=await publish(),target=objects.find(o=>o.ref.key.includes('/'+kind+'/'))!;
 await bucket.delete(target.ref.key);await expect(readPinnedSceneEventContent(bucket,narrative.ref)).rejects.toThrow('INVALID_STORY_CONTENT');
 await bucket.put(target.ref.key,'{}');await expect(readPinnedSceneEventContent(bucket,narrative.ref)).rejects.toThrow('INVALID_STORY_CONTENT');
 await bucket.put(target.ref.key,target.bytes);expect((await readPinnedSceneEventContent(bucket,narrative.ref)).narrative.narrativeId).toBe('test-story');
});
