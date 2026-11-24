import {z} from 'zod';
import {trackNarrativeSchema,trackSceneSchema,trackPoolSchema,trackDefinitionSchema,validateTrackContent} from './scene-event-track-content';
import {parseStrictJson} from './strict-json';
export {trackDefinitionSchema,trackPresentationStepSchema} from './scene-event-track-content';


const local=z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),version=z.string().regex(/^v[1-9][0-9]{0,7}$/);
const hash=z.string().regex(/^[0-9a-f]{64}$/);
const reference=z.strictObject({id:local,version,key:z.string().max(240),sha256:hash});
export type SceneEventContentReference=z.infer<typeof reference>;
function fail():never{throw new Error('INVALID_STORY_CONTENT');}
const digest=async(bytes:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');

/** 只讀明確釘選的公開內容命名空間。呼叫端仍須在 R2 等待前後重驗 Round／Session 授權。 */
export async function readPinnedSceneEventContent(bucket:R2Bucket,input:unknown):Promise<{narrative:ReturnType<typeof trackNarrativeSchema.parse>;scene:ReturnType<typeof trackSceneSchema.parse>;pool:ReturnType<typeof trackPoolSchema.parse>;eventDefinitions:ReturnType<typeof validateTrackContent>['eventDefinitions'];pins:SceneEventContentReference[]}>{
 try{
  const pins:SceneEventContentReference[]=[],cache=new Map<string,{sha256:string;body:unknown}>();let total=0;
  async function read(refInput:unknown,kind:string):Promise<any>{
   const ref=reference.parse(refInput);if(ref.key!==`story-content/${kind}/${ref.id}/${ref.version}/manifest.json`)fail();
   const existing=cache.get(ref.key);if(existing){if(existing.sha256!==ref.sha256)fail();return existing.body;}
   if(cache.size>=259)fail();const stored=await bucket.get(ref.key);if(!stored||stored.size>524288)fail();
   const bytes=await stored.arrayBuffer();total+=bytes.byteLength;if(total>4194304||await digest(bytes)!==ref.sha256)fail();
   const body=parseStrictJson(new TextDecoder('utf-8',{fatal:true}).decode(bytes),24);cache.set(ref.key,{sha256:ref.sha256,body});pins.push(ref);return body;
  }
  const root=reference.parse(input),raw=await read(root,'narratives');
  if(raw?.schemaVersion!=='scene-event.v2')fail();
  {
   const narrative=trackNarrativeSchema.parse(raw);
   if(narrative.narrativeId!==root.id||narrative.version!==root.version||!narrative.scene||!narrative.globalPool)fail();
   const scene=trackSceneSchema.parse(await read(narrative.scene,'scenes')),pool=trackPoolSchema.parse(await read(narrative.globalPool,'pools'));
   if(scene.sceneId!==narrative.scene.id||scene.version!==narrative.scene.version||pool.poolId!==narrative.globalPool.id||pool.version!==narrative.globalPool.version)fail();
   const definitions=new Map();
   for(const b of [...narrative.eventBindings,...narrative.sharedEventBindings,...scene.sceneEventBindings,...pool.eventBindings]){
    const ref=b.definition,manifest=trackDefinitionSchema.parse(await read({id:ref.eventId,version:ref.version,key:ref.key,sha256:ref.sha256},'events'));
    if(manifest.eventId!==ref.eventId||manifest.version!==ref.version)fail();
    definitions.set(ref.key,{reference:ref,manifest});
   }
   const verified=validateTrackContent({narrative,scene,pool,eventDefinitions:[...definitions.values()],pins});
   // 冷啟動的完整有限狀態圖可能佔用較久的同步 CPU。交還一次事件迴圈，
   // 讓 binding transport 處理已關閉的連線，再由呼叫端重驗成員並讀寫 D1；
   // 不重試已送出的資料變更，也不延長任何授權期限。
   await new Promise<void>(resolve=>setTimeout(resolve,0));
   return {...verified,pins};
  }
 }catch{throw new Error('INVALID_STORY_CONTENT');}
}
