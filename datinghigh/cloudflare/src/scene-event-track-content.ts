import {sceneStageSchema,npcAppearanceSchema,npcHitMasks,validateStageReferences} from './scene-event-stage-content';
import {validateTrackReachability} from './scene-event-track-graph';
import {z} from 'zod';
import {asset,scenePresentation} from './scene-event-presentation-schema';

const id=z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),version=z.string().regex(/^v[1-9][0-9]{0,7}$/);
const text=z.string().trim().min(1).max(4000),role=z.enum(['inviter','acceptor']);
const key=z.string().regex(/^(narrative|scene|global):[a-z][a-z0-9-]{0,63}:[a-z][a-z0-9-]{0,63}$/);
const unique=<T extends z.ZodType>(item:T,max=256)=>z.array(item).max(max).refine(a=>new Set(a).size===a.length);
const rule=z.record(z.string(),z.unknown());
const line=z.strictObject({speaker:z.enum(['旁白','店員・NPC']),text});
const reference=z.strictObject({id,version,key:z.string().max(240),sha256:z.string().regex(/^[0-9a-f]{64}$/)});
const eventReference=reference.omit({id:true}).extend({eventId:id});
const effect=z.discriminatedUnion('type',[
 z.strictObject({type:z.literal('object'),objectId:id,from:id,to:id,actionId:id}),
 z.strictObject({type:z.literal('flag'),flagId:id,value:id}),
]);
export const trackPresentationStepSchema=z.discriminatedUnion('type',[
 z.strictObject({type:z.literal('shot'),shotId:id,durationMs:z.number().int().min(0).max(3000)}),
 z.strictObject({type:z.literal('camera'),cameraId:id,durationMs:z.number().int().min(0).max(3000)}),
 z.strictObject({type:z.literal('audio'),cueId:id}),
 z.strictObject({type:z.literal('expression'),role,expression:z.enum(['neutral','smile','surprised','thoughtful','concerned'])}),
 z.strictObject({type:z.literal('character'),role,areaId:id,x:z.number().min(0).max(1),visible:z.boolean(),durationMs:z.number().int().min(0).max(3000)}),
 z.strictObject({type:z.literal('object'),objectId:id,fromAreaId:id,toAreaId:id,motion:z.enum(['flip','slide','gust','place','highlight']),durationMs:z.number().int().min(0).max(3000)}),
 z.strictObject({type:z.literal('pause'),durationMs:z.number().int().min(0).max(2000)}),
]);
const action=z.strictObject({role,actionId:id,stepId:id.optional(),targetObjectId:id.optional(),dropSlotId:id.optional(),label:text,params:z.record(z.string(),z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/)),conditions:rule,nextNode:id.optional(),worldEffects:z.array(effect).max(16),presentationSteps:z.array(trackPresentationStepSchema).max(24)});
const binding=z.strictObject({scope:z.enum(['narrative','scene','global']),sourceId:id,bindingId:id,trackScope:z.enum(['inviter','acceptor','shared']),definition:eventReference,lines:z.array(line).min(1).max(24).optional(),startPresentationSteps:z.array(trackPresentationStepSchema).max(24).default([]),narrativeRole:z.enum(['main','side']),visibility:z.enum(['visible','hidden']),selectionMode:z.enum(['fixed','weighted_random']),probability:z.number().min(0).max(1),repeatScope:z.enum(['playthrough','round']),repeatGroup:id,requiredCapabilities:unique(id,32),requiredForEnding:z.boolean(),triggerConditions:rule,requiredActions:z.array(z.strictObject({role,actionId:id,stepId:id.optional()})).min(1).max(32),actions:z.array(action).min(1).max(64),startEffects:z.array(effect).max(16).default([]),completionEffects:z.array(effect).max(16),completionMode:z.enum(['all-actions','repeatable']).default('all-actions'),transitions:z.strictObject({inviterNextNode:id.optional(),acceptorNextNode:id.optional(),unlockNodes:z.strictObject({inviter:unique(id,64).optional(),acceptor:unique(id,64).optional()})})});
const node=z.strictObject({id,title:text,areaId:id,lines:z.array(line).min(1).max(24),presentation:z.strictObject({cameraId:id,shotId:id.optional(),expression:z.enum(['neutral','smile','surprised','thoughtful','concerned']),hotspotIds:unique(id,24)})});
const track=z.strictObject({entry:id,nodes:z.array(node).min(1).max(256)});
export const trackNarrativeSchema=z.strictObject({schemaVersion:z.literal('scene-event.v2'),narrativeId:id,version,title:text,summary:text,clues:z.array(z.strictObject({id,role:z.enum(['inviter','acceptor','shared']),text,conditions:rule})).max(64).default([]),scene:reference.optional(),globalPool:reference.optional(),eligibleCategoryCodes:unique(id,64).refine(a=>a.length>0),sequenceGroupId:id.nullable(),sequenceOrder:z.number().int().positive().nullable(),prerequisites:unique(id,64),tracks:z.strictObject({inviter:track,acceptor:track}),eventBindings:z.array(binding).max(256),sharedEventBindings:z.array(binding).max(128),endingRequires:unique(key,256),safetyExit:z.strictObject({endingId:id,conditions:rule}).optional(),endings:z.array(z.strictObject({id,title:text,lines:z.array(line).min(1).max(24),conditions:rule,presentationSteps:z.array(trackPresentationStepSchema).max(24)})).min(1).max(16),suggestions:z.array(z.strictObject({id,label:text,text})).length(3)});
export const trackSceneSchema=z.strictObject({schemaVersion:z.literal('scene-event.v2'),sceneId:id,version,title:text,time:text,place:text,event:text,locale:z.literal('zh-TW'),categoryCodes:unique(id,64).refine(a=>a.length>0),sceneCapabilities:unique(id,32),backgroundAsset:id,audioAsset:id,musicAsset:id.optional(),assets:z.array(asset).min(1).max(128),scenePresentation,stage:sceneStageSchema.optional(),audioCues:z.record(id,id),areas:z.array(z.strictObject({id,title:text,cameraId:id,audioMix:z.strictObject({ambienceGain:z.number().min(0).max(1),musicGain:z.number().min(0).max(1)}).optional(),adjacent:unique(id,32)})).min(1).max(32),books:z.array(z.strictObject({id,objectId:id,copies:unique(id,16).optional(),title:text,category:text,summary:text,pages:z.array(text).min(2).max(12)})).max(64).default([]),sceneObjects:z.array(z.strictObject({id,label:text,initialState:id,states:z.array(z.strictObject({id,areaId:id,holder:role.nullable()})).min(1).max(32),transitions:z.array(z.strictObject({from:id,to:id,actionId:id})).max(64),assetId:id.optional(),rendererId:z.enum(['paper','bag','book','sleeve','tag','slot','window']).optional(),color:z.string().regex(/^#[0-9a-f]{6}$/i).optional(),visibility:z.enum(['public','inviter','acceptor']).default('public'),previewPlacement:z.strictObject({slotId:id,areaId:id,hint:text,roles:unique(role,2).refine(v=>v.length>0)}).optional(),x:z.number().min(0).max(1),y:z.number().min(0).max(1)})).max(64),slots:z.array(z.strictObject({id,areaId:id,acceptedObjects:unique(id,64)})).max(32),npcs:z.array(z.strictObject({id,label:text,areaId:id,dialogueOptions:unique(id,64),appearance:npcAppearanceSchema.optional(),hitMasks:npcHitMasks.optional()})).max(16),sharedFlags:z.array(z.strictObject({id,values:unique(id,32),initialValue:id,publicValues:unique(id,32)})).max(64),sceneEventBindings:z.array(binding).max(128)});
export const trackPoolSchema=z.strictObject({schemaVersion:z.literal('scene-event.v2'),poolId:id,version,eventBindings:z.array(binding).max(128)});
const modules={
 'move-area':['enter'],'inspect-object':['inspect','flip'],'manipulate-object':['pick','place'],
 'talk-to-npc':['choose'],'cooperative-action':['submit'],'cooperative-choice':['submit'],
} as const;
export const trackDefinitionSchema=z.strictObject({schemaVersion:z.literal('scene-event.v2'),eventId:id,version,moduleType:z.enum(['move-area','inspect-object','manipulate-object','talk-to-npc','cooperative-action','cooperative-choice']),title:text,actions:unique(id,16).refine(a=>a.length>0)});
export type TrackBinding=z.infer<typeof binding>;
export type TrackAction=z.infer<typeof action>;
export type TrackContent={scene:z.infer<typeof trackSceneSchema>;narrative:z.infer<typeof trackNarrativeSchema>;pool:z.infer<typeof trackPoolSchema>;eventDefinitions:{reference:z.infer<typeof eventReference>;manifest:z.infer<typeof trackDefinitionSchema>}[];pins:unknown[]};
const roles=['inviter','acceptor'] as const;
// 僅快取已嚴格解析的公開 immutable 內容；每次 R2 讀取仍獨立核對位元組 SHA。
const verifiedGraphs=new Set<string>();
export const trackBindingKey=(b:Pick<TrackBinding,'scope'|'sourceId'|'bindingId'>)=>`${b.scope}:${b.sourceId}:${b.bindingId}`;
function fail():never{throw new Error('INVALID_STORY_CONTENT');}
function map<T extends {id:string}>(items:T[]):Map<string,T>{const result=new Map(items.map(i=>[i.id,i]));if(result.size!==items.length)fail();return result;}

/** 內容驗證只讀 immutable 事實；同一檢查供受控 Publisher 與 R2 reader 使用。 */
export function validateTrackContent(input:unknown):TrackContent{
 try{
  const raw=input as any,c:TrackContent={scene:trackSceneSchema.parse(raw.scene),narrative:trackNarrativeSchema.parse(raw.narrative),pool:trackPoolSchema.parse(raw.pool),eventDefinitions:z.array(z.strictObject({reference:eventReference,manifest:trackDefinitionSchema})).max(256).parse(raw.eventDefinitions),pins:raw.pins??[]};
  const s=c.scene,n=c.narrative,areas=map(s.areas),objects=map(s.sceneObjects),slots=map(s.slots),npcs=map(s.npcs),flags=map(s.sharedFlags),assets=map(s.assets),cameras=map(s.scenePresentation.cameras),hotspots=map(s.scenePresentation.hotspots);
  if(n.eligibleCategoryCodes.some(code=>!s.categoryCodes.includes(code))||(n.sequenceGroupId===null)!==(n.sequenceOrder===null)||n.prerequisites.includes(n.narrativeId))fail();
  const image=(name:string)=>assets.get(name)?.mimeType.startsWith('image/');
  if(!image(s.backgroundAsset)||!image(s.scenePresentation.backgroundAsset)||s.scenePresentation.foregroundAsset&&!image(s.scenePresentation.foregroundAsset)||assets.get(s.audioAsset)?.mimeType!=='audio/wav')fail();
  if(s.musicAsset&&assets.get(s.musicAsset)?.mimeType!=='audio/wav')fail();
  for(const cue of Object.values(s.audioCues))if(assets.get(cue)?.mimeType!=='audio/wav')fail();
  for(const a of areas.values())if(!cameras.has(a.cameraId)||a.adjacent.some(target=>!areas.has(target)||target===a.id))fail();
  for(const o of objects.values()){
   const states=map(o.states);if(!states.has(o.initialState)||(!o.assetId&&!o.rendererId||!!o.assetId&&!!o.rendererId||o.assetId&&!image(o.assetId))||o.states.some(state=>!areas.has(state.areaId)))fail();
   if(o.previewPlacement&&!slots.get(o.previewPlacement.slotId)||o.previewPlacement&&slots.get(o.previewPlacement.slotId)!.areaId!==o.previewPlacement.areaId)fail();
   for(const t of o.transitions)if(!states.has(t.from)||!states.has(t.to)||t.from===t.to)fail();
  }
  map(s.books);const bookObjects=s.books.flatMap(b=>[b.objectId,...(b.copies??[])]);if(new Set(bookObjects).size!==bookObjects.length||s.books.some(b=>[b.objectId,...(b.copies??[])].some(id=>!objects.get(id)?.assetId||objects.get(id)?.assetId!==objects.get(b.objectId)?.assetId)))fail();
  for(const slot of slots.values())if(!areas.has(slot.areaId)||slot.acceptedObjects.some(o=>!objects.has(o)))fail();
  for(const npc of npcs.values())if(!areas.has(npc.areaId))fail();
  for(const flag of flags.values())if(!flag.values.includes(flag.initialValue)||flag.publicValues.some(v=>!flag.values.includes(v)))fail();
  const nodes={inviter:map(n.tracks.inviter.nodes),acceptor:map(n.tracks.acceptor.nodes)};
  for(const r of roles){if(!nodes[r].has(n.tracks[r].entry))fail();for(const node of nodes[r].values())if(!areas.has(node.areaId)||!cameras.has(node.presentation.cameraId)||node.presentation.hotspotIds.some(h=>!hotspots.has(h)))fail();}
  const bindings=[...n.eventBindings,...n.sharedEventBindings,...s.sceneEventBindings,...c.pool.eventBindings];
  if(bindings.length>256)fail();const byKey=new Map(bindings.map(b=>[trackBindingKey(b),b]));if(byKey.size!==bindings.length)fail();
  const definitions=new Map(c.eventDefinitions.map(d=>[d.reference.key,d]));if(definitions.size!==c.eventDefinitions.length)fail();
  for(const d of definitions.values())if(d.reference.eventId!==d.manifest.eventId||d.reference.version!==d.manifest.version||d.reference.key!==`story-content/events/${d.manifest.eventId}/${d.manifest.version}/manifest.json`||d.manifest.actions.some(a=>!(modules[d.manifest.moduleType] as readonly string[]).includes(a)))fail();
  function effects(items:z.infer<typeof effect>[]){for(const e of items){if(e.type==='flag'){if(!flags.get(e.flagId)?.values.includes(e.value))fail();}else if(!objects.get(e.objectId)?.transitions.some(t=>t.from===e.from&&t.to===e.to&&t.actionId===e.actionId))fail();}}
  function steps(items:z.infer<typeof trackPresentationStepSchema>[]){for(const p of items){if(p.type==='camera'&&!cameras.has(p.cameraId)||p.type==='audio'&&!Object.hasOwn(s.audioCues,p.cueId)||p.type==='character'&&!areas.has(p.areaId)||p.type==='object'&&(!objects.has(p.objectId)||!areas.has(p.fromAreaId)||!areas.has(p.toAreaId)))fail();}}
  const dependencies=new Map<string,Set<string>>();
  function condition(value:Record<string,unknown>,deps:Set<string>,contextual=true){let count=0;
   function visit(v:any,depth:number){
    if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==1||++count>64||depth>8)fail();const [op,a]=Object.entries(v)[0] as [string,any];
    if(op==='all'||op==='any'){if(!Array.isArray(a)||!a.length||a.length>32)fail();for(const child of a)visit(child,depth+1);return;}
    if(op==='not'){visit(a,depth+1);return;}
    const exact=(keys:string[])=>{if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).length!==keys.length||keys.some(k=>!Object.hasOwn(a,k)))fail();};
    if(op==='track_node_entered'){exact(['role','nodeId']);if(!roles.includes(a.role)||!id.safeParse(a.nodeId).success||contextual&&!nodes[a.role as typeof roles[number]].has(a.nodeId))fail();}
    else if(op==='track_event_completed'){exact(['role','bindingKey']);const b=byKey.get(a.bindingKey);if(!roles.includes(a.role)||!key.safeParse(a.bindingKey).success||contextual&&(!b||b.trackScope!==a.role))fail();deps.add(a.bindingKey);}
    else if(op==='track_choice_committed'){exact(['role','bindingKey','actionId','optionId']);const b=byKey.get(a.bindingKey);if(!roles.includes(a.role)||!key.safeParse(a.bindingKey).success||!id.safeParse(a.actionId).success||typeof a.optionId!=='string'||!(/^[a-z][a-z0-9_-]{0,63}$/).test(a.optionId)||contextual&&(!b||!b.actions.some(action=>action.role===a.role&&action.actionId===a.actionId&&action.params.optionId===a.optionId)))fail();deps.add(a.bindingKey);}
    else if(op==='shared_event_completed'){const b=byKey.get(a);if(!key.safeParse(a).success||contextual&&(!b||b.trackScope!=='shared'))fail();deps.add(a);}
    else if(op==='world_object_state'){exact(['objectId','state']);if(!id.safeParse(a.objectId).success||!id.safeParse(a.state).success||contextual&&!objects.get(a.objectId)?.states.some(state=>state.id===a.state))fail();}
    else if(op==='actor_area_is'){exact(['role','areaId']);if(!roles.includes(a.role)||!id.safeParse(a.areaId).success||contextual&&!areas.has(a.areaId))fail();}
    else if(op==='shared_flag_equals'){exact(['key','value']);if(!id.safeParse(a.key).success||!id.safeParse(a.value).success||contextual&&!flags.get(a.key)?.values.includes(a.value))fail();}
    else if(op==='narrative_completed'){if(!id.safeParse(a).success)fail();}
    else fail();
   }visit(value,0);
  }
  for(const [list,scope,sourceId] of [[n.eventBindings,'narrative',n.narrativeId],[n.sharedEventBindings,'narrative',n.narrativeId],[s.sceneEventBindings,'scene',s.sceneId],[c.pool.eventBindings,'global',c.pool.poolId]] as const)for(const b of list){
   const k=trackBindingKey(b),d=definitions.get(b.definition.key),deps=new Set<string>(),qualified=b.requiredCapabilities.every(capability=>s.sceneCapabilities.includes(capability));
   if(b.scope!==scope||b.sourceId!==sourceId||!d||JSON.stringify(d.reference)!==JSON.stringify(b.definition)||!qualified&&scope!=='global'||b.requiredForEnding&&(b.narrativeRole!=='main'||b.probability<1||b.completionMode==='repeatable')||scope!=='narrative'&&b.narrativeRole==='main')fail();
   if(list===n.sharedEventBindings&&b.trackScope!=='shared'||list===n.eventBindings&&b.trackScope==='shared')fail();
   condition(b.triggerConditions,deps,qualified);if(qualified){effects(b.startEffects);effects(b.completionEffects);steps(b.startPresentationSteps);}
   const signatures=new Set<string>();for(const a of b.actions){
    if(b.trackScope!=='shared'&&a.role!==b.trackScope||!d.manifest.actions.includes(a.actionId))fail();
    const sig=JSON.stringify([a.role,a.actionId,Object.entries(a.params).sort()]);if(signatures.has(sig))fail();signatures.add(sig);
    const fields=Object.keys(a.params).sort(),expected=d.manifest.moduleType==='move-area'?['areaId']:d.manifest.moduleType==='inspect-object'?['objectId']:d.manifest.moduleType==='manipulate-object'?(a.actionId==='place'?['objectId','targetSlotId']:['objectId']):d.manifest.moduleType==='talk-to-npc'?['dialogueOptionId','npcId']:['optionId'];
    if(JSON.stringify(fields)!==JSON.stringify(expected))fail();
    if(qualified&&(a.params.objectId&&!objects.has(a.params.objectId)||a.params.areaId&&!areas.has(a.params.areaId)||a.params.targetSlotId&&!slots.get(a.params.targetSlotId)?.acceptedObjects.includes(a.params.objectId)||a.params.npcId&&!npcs.get(a.params.npcId)?.dialogueOptions.includes(a.params.dialogueOptionId)||a.nextNode&&!nodes[a.role].has(a.nextNode)))fail();
    if(qualified&&a.params.objectId&&objects.get(a.params.objectId)?.visibility!=='public'&&objects.get(a.params.objectId)?.visibility!==a.role)fail();
    if(qualified&&(a.targetObjectId&&!objects.has(a.targetObjectId)||a.dropSlotId&&(!a.targetObjectId||!slots.get(a.dropSlotId)?.acceptedObjects.includes(a.targetObjectId))))fail();
    condition(a.conditions,deps,qualified);if(qualified){effects(a.worldEffects);steps(a.presentationSteps);}
   }
   for(const required of b.requiredActions)if(!b.actions.some(a=>a.role===required.role&&a.actionId===required.actionId&&(a.stepId??a.actionId)===(required.stepId??required.actionId)))fail();
   if(new Set(b.requiredActions.map(r=>r.role+':'+(r.stepId??r.actionId))).size!==b.requiredActions.length)fail();
   if(qualified)for(const r of roles){const target=b.transitions[r==='inviter'?'inviterNextNode':'acceptorNextNode'];if(target&&(!nodes[r].has(target)||b.trackScope!==r&&(!b.requiredActions.some(a=>a.role===r)||b.trackScope!=='shared')))fail();for(const target of b.transitions.unlockNodes[r]??[])if(!nodes[r].has(target))fail();}
   dependencies.set(k,deps);
  }
  if(n.endingRequires.some(k=>!byKey.get(k)?.requiredForEnding)||bindings.some(b=>b.requiredForEnding&&!n.endingRequires.includes(trackBindingKey(b))))fail();
  for(const clue of n.clues)condition(clue.conditions,new Set());
  for(const ending of n.endings){condition(ending.conditions,new Set());steps(ending.presentationSteps);}
  if(new Set(n.endings.map(e=>e.id)).size!==n.endings.length)fail();
  if(n.safetyExit){condition(n.safetyExit.conditions,new Set());const ending=n.endings.find(e=>e.id===n.safetyExit!.endingId);if(!ending||JSON.stringify(ending.conditions)!==JSON.stringify(n.safetyExit.conditions))fail();}
  validateStageReferences(c);
  const graphKey=JSON.stringify([n,s,c.pool,c.eventDefinitions]);
  if(!verifiedGraphs.has(graphKey)){validateTrackReachability(c,bindings.filter(b=>b.requiredCapabilities.every(capability=>s.sceneCapabilities.includes(capability))));if(verifiedGraphs.size>=16)verifiedGraphs.delete(verifiedGraphs.values().next().value!);verifiedGraphs.add(graphKey);}
  return c;
 }catch{fail();}
}

