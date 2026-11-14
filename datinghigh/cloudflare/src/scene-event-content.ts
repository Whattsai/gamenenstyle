import {z} from 'zod';
import {parseStrictJson} from './strict-json';

const local=z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),version=z.string().regex(/^v[1-9][0-9]{0,7}$/);
const hash=z.string().regex(/^[0-9a-f]{64}$/),text=z.string().min(1).max(4000);
const expression=z.enum(['neutral','smile','surprised','thoughtful','concerned']);
const unique=<T extends z.ZodType>(schema:T,max:number)=>z.array(schema).max(max).refine(a=>new Set(a).size===a.length);
const reference=z.strictObject({id:local,version,key:z.string().max(240),sha256:hash});
export type SceneEventContentReference=z.infer<typeof reference>;
const eventReference=z.strictObject({eventId:local,version,key:z.string().max(240),sha256:hash});
const presentationEffects=z.strictObject({cameraId:local.optional(),expressionId:expression.optional(),audioCueId:z.string().max(64).optional(),hotspotVisibility:z.record(local,z.boolean()).optional()});
const binding=z.strictObject({scope:z.enum(['narrative','scene','global']),sourceId:local,bindingId:local,definition:eventReference,narrativeRole:z.enum(['main','side']),visibility:z.enum(['visible','hidden']),selectionMode:z.enum(['fixed','weighted_random']),probability:z.number().min(0).max(1),repeatScope:z.enum(['playthrough','round']),repeatGroup:local,requiredCapabilities:unique(local,32),triggerConditions:z.record(z.string(),z.unknown()),requiredForEnding:z.boolean(),presentationEffects:presentationEffects.optional(),outcomeTransitions:z.strictObject({same:local,different:local}).optional()});
const choice=z.strictObject({id:local,label:text,next:local});
const node=z.strictObject({id:local,title:text,lines:z.array(z.strictObject({speaker:z.enum(['旁白','店員・NPC']),text})).min(1).max(200),choices:z.array(choice).max(32),visual:z.string().max(80),objects:unique(local,24),presentation:z.strictObject({cameraId:local,expression,hotspotIds:unique(local,24)}).optional(),interactionId:local.optional(),ending:z.boolean().optional()});
const narrativeSchema=z.strictObject({schemaVersion:z.literal('scene-event.v1'),narrativeId:local,version,title:text,summary:text,scene:reference,globalPool:reference,eligibleCategoryCodes:unique(local,64).refine(a=>a.length>0),sequenceGroupId:local.nullable(),sequenceOrder:z.number().int().positive().nullable(),prerequisites:unique(local,64),entry:z.literal('entry'),nodes:z.array(node).min(2).max(2000),suggestions:z.array(z.strictObject({id:local,label:text,text})).length(3),eventBindings:z.array(binding).max(256)});
const point=z.strictObject({x:z.number().min(0).max(1),y:z.number().min(0).max(1)});
const scenePresentation=z.strictObject({version:z.literal('2.5d.v1'),backgroundAsset:local,foregroundAsset:local.optional(),cameras:z.array(z.strictObject({id:local,scale:z.number().min(1).max(2),focus:point,portrait:z.strictObject({x:z.number().min(.3).max(.7),headY:z.number().min(.04).max(.2),height:z.number().min(.7).max(2.2)}),foreground:z.boolean(),tint:z.string().regex(/^#[0-9a-f]{6}$/i),tintOpacity:z.number().min(0).max(.35)})).min(1).max(12),hotspots:z.array(z.strictObject({id:local,definitionId:local,label:text,x:z.number().min(0).max(1),y:z.number().min(0).max(1)})).max(24),foreground:z.array(z.strictObject({id:local,x:z.number().min(0).max(1),y:z.number().min(0).max(1),width:z.number().positive().max(1),height:z.number().positive().max(1),color:z.string().regex(/^#[0-9a-f]{6}$/i)})).max(24)});
const asset=z.strictObject({id:local,key:z.string().regex(/^story-content\/assets\/[0-9a-f]{64}$/),sha256:hash,mimeType:z.enum(['image/png','image/jpeg','image/webp','audio/wav']),byteLength:z.number().int().min(1).max(8388608)}).refine(a=>a.key===`story-content/assets/${a.sha256}`);
const sceneSchema=z.strictObject({schemaVersion:z.literal('scene-event.v1'),sceneId:local,version,title:text,time:text,place:text,event:text,locale:z.literal('zh-TW'),categoryCodes:unique(local,64).refine(a=>a.length>0),sceneCapabilities:unique(local,32),backgroundAsset:local,audioAsset:local,assets:z.array(asset).max(128),scenePresentation:scenePresentation.optional(),audioCues:z.record(z.string().regex(/^[a-z][a-zA-Z0-9-]{0,63}$/),local).optional(),sceneEventBindings:z.array(binding).max(128)});
const poolSchema=z.strictObject({schemaVersion:z.literal('scene-event.v1'),poolId:local,version,eventBindings:z.array(binding).max(128)});
const definitionSchema=z.strictObject({schemaVersion:z.literal('scene-event.v1'),id:local,eventId:local,version,moduleType:z.enum(['inspect-object','cooperative-choice']),title:text,prompt:text,options:z.array(z.strictObject({id:local,label:text,result:text.optional()})).min(2).max(32)});
function fail():never{throw new Error('INVALID_STORY_CONTENT');}
const digest=async(bytes:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');

/** 只讀明確釘選的公開內容命名空間。呼叫端仍須在 R2 等待前後重驗 Round／Session 授權。 */
export async function readPinnedSceneEventContent(bucket:R2Bucket,input:unknown){
 try{
  const pins:SceneEventContentReference[]=[],cache=new Map<string,{sha256:string;body:unknown}>();let total=0;
  async function read(refInput:unknown,kind:string):Promise<any>{
   const ref=reference.parse(refInput);if(ref.key!==`story-content/${kind}/${ref.id}/${ref.version}/manifest.json`)fail();
   const existing=cache.get(ref.key);if(existing){if(existing.sha256!==ref.sha256)fail();return existing.body;}
   if(cache.size>=259)fail();const stored=await bucket.get(ref.key);if(!stored||stored.size>524288)fail();
   const bytes=await stored.arrayBuffer();total+=bytes.byteLength;if(total>4194304||await digest(bytes)!==ref.sha256)fail();
   const body=parseStrictJson(new TextDecoder('utf-8',{fatal:true}).decode(bytes),24);cache.set(ref.key,{sha256:ref.sha256,body});pins.push(ref);return body;
  }
  const root=reference.parse(input),narrative=narrativeSchema.parse(await read(root,'narratives'));
  if(narrative.narrativeId!==root.id||narrative.version!==root.version)fail();
  const scene=sceneSchema.parse(await read(narrative.scene,'scenes')),pool=poolSchema.parse(await read(narrative.globalPool,'pools'));
  if(scene.sceneId!==narrative.scene.id||scene.version!==narrative.scene.version||pool.poolId!==narrative.globalPool.id||pool.version!==narrative.globalPool.version)fail();
  if(narrative.eligibleCategoryCodes.some(code=>!scene.categoryCodes.includes(code)))fail();
  const bindings=[...narrative.eventBindings,...scene.sceneEventBindings,...pool.eventBindings];if(bindings.length>256)fail();
  const key=(b:z.infer<typeof binding>)=>`${b.scope}:${b.sourceId}:${b.bindingId}`,keys=new Set(bindings.map(key));if(keys.size!==bindings.length)fail();
  const eventDefinitions:{reference:z.infer<typeof eventReference>;manifest:z.infer<typeof definitionSchema>}[]=[];
  for(const [items,scope,sourceId]of [[narrative.eventBindings,'narrative',narrative.narrativeId],[scene.sceneEventBindings,'scene',scene.sceneId],[pool.eventBindings,'global',pool.poolId]]as const){
   for(const b of items){
    if(b.scope!==scope||b.sourceId!==sourceId||b.requiredForEnding&&b.narrativeRole!=='main'||scope!=='narrative'&&b.narrativeRole==='main'||b.requiredForEnding&&b.selectionMode==='weighted_random'&&b.probability<1||b.requiredCapabilities.some(c=>!scene.sceneCapabilities.includes(c)))fail();
    const ref={id:b.definition.eventId,version:b.definition.version,key:b.definition.key,sha256:b.definition.sha256};
    const definition=definitionSchema.parse(await read(ref,'events'));
    if(definition.id!==ref.id||definition.eventId!==ref.id||definition.version!==ref.version||new Set(definition.options.map(o=>o.id)).size!==definition.options.length)fail();
    if(!eventDefinitions.some(d=>d.reference.key===ref.key))eventDefinitions.push({reference:b.definition,manifest:definition});
    const effect=b.presentationEffects,p=scene.scenePresentation;
    if(effect&&(effect.cameraId&&!p?.cameras.some(c=>c.id===effect.cameraId)||effect.audioCueId&&!Object.hasOwn(scene.audioCues??{},effect.audioCueId)||Object.keys(effect.hotspotVisibility??{}).some(id=>!p?.hotspots.some(h=>h.id===id))))fail();
   }
  }
  const nodes=new Map(narrative.nodes.map(n=>[n.id,n]));if(nodes.size!==narrative.nodes.length)fail();
  const cameras=scene.scenePresentation?.cameras??[],hotspots=scene.scenePresentation?.hotspots??[];
  for(const list of [cameras,hotspots,scene.scenePresentation?.foreground??[],scene.assets])if(new Set(list.map(v=>v.id)).size!==list.length)fail();
  const image=(id:string|undefined)=>scene.assets.some(a=>a.id===id&&a.mimeType.startsWith('image/'));
  if(!image(scene.backgroundAsset)||!scene.assets.some(a=>a.id===scene.audioAsset&&a.mimeType==='audio/wav')||scene.scenePresentation&&(!image(scene.scenePresentation.backgroundAsset)||scene.scenePresentation.foregroundAsset&&!image(scene.scenePresentation.foregroundAsset)))fail();
  for(const cue of Object.values(scene.audioCues??{}))if(!scene.assets.some(a=>a.id===cue&&a.mimeType==='audio/wav'))fail();
  for(const h of hotspots)if(!eventDefinitions.some(d=>d.manifest.id===h.definitionId&&d.manifest.moduleType==='inspect-object'))fail();
  for(const n of nodes.values()){
   if(new Set(n.choices.map(c=>c.id)).size!==n.choices.length||n.lines.some(l=>!l.text.trim()))fail();
   if(n.presentation&&(!cameras.some(c=>c.id===n.presentation!.cameraId)||n.presentation.hotspotIds.some(id=>!hotspots.some(h=>h.id===id&&n.objects.includes(h.definitionId)))))fail();
   for(const object of n.objects)if(!eventDefinitions.some(d=>d.manifest.id===object&&d.manifest.moduleType==='inspect-object'))fail();
  }
  const choiceIds=new Set(narrative.nodes.flatMap(n=>n.choices.map(c=>c.id))),dependencies=new Map<string,string[]>();
  for(const b of bindings){
   let count=0;const edges:string[]=[];
   function rule(value:any,depth:number){
    if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==1||++count>64||depth>8)fail();
    const [operator,argument]=Object.entries(value)[0];
    if(operator==='all'||operator==='any'){if(!Array.isArray(argument)||!argument.length||argument.length>32)fail();for(const child of argument)rule(child,depth+1);return;}
    if(operator==='not'){rule(argument,depth+1);return;}
    const identifier=(v:unknown)=>typeof v==='string'&&/^[a-z][a-z0-9:.-]{0,159}$/.test(v);
    if(operator==='flag_equals'){const flag=argument as any;if(!flag||Object.keys(flag).length!==2||!identifier(flag.key)||!identifier(flag.value))fail();return;}
    if(!identifier(argument))fail();const id=argument as string;
    if(operator==='node_entered'){if(!nodes.has(id))fail();}else if(operator==='choice_committed'){if(!choiceIds.has(id))fail();}else if(operator==='event_completed'){if(!keys.has(id))fail();edges.push(id);}else if(operator!=='narrative_completed')fail();
   }
   rule(b.triggerConditions,0);dependencies.set(key(b),edges);
  }
  const active=new Set<string>(),visited=new Set<string>();
  function visitBinding(id:string){if(active.has(id))fail();if(visited.has(id))return;active.add(id);for(const edge of dependencies.get(id)??[])visitBinding(edge);active.delete(id);visited.add(id);}for(const id of keys)visitBinding(id);
  const path=new Set<string>(),reachable=new Set<string>();
  function visitNode(id:string){if(path.has(id))fail();const n=nodes.get(id);if(!n)fail();if(reachable.has(id))return;path.add(id);const next=n.choices.map(c=>c.next);
   if(n.interactionId){
    const candidates=narrative.eventBindings.filter(b=>b.bindingId===n.interactionId&&b.outcomeTransitions);if(candidates.length!==1)fail();const gate=candidates[0];
    const definition=eventDefinitions.find(d=>d.reference.eventId===gate.definition.eventId&&d.reference.version===gate.definition.version);if(definition?.manifest.moduleType!=='cooperative-choice'||n.choices.length===0&&gate.selectionMode==='weighted_random'&&gate.probability<1)fail();
    next.push(gate.outcomeTransitions!.same,gate.outcomeTransitions!.different);
   }
   if(n.ending?next.length!==0:next.length===0)fail();for(const target of next)visitNode(target);path.delete(id);reachable.add(id);
  }
  visitNode(narrative.entry);if(reachable.size!==nodes.size||!narrative.nodes.some(n=>n.ending))fail();
  return {narrative,scene,pool,eventDefinitions,pins};
 }catch{throw new Error('INVALID_STORY_CONTENT');}
}
