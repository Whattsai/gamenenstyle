import {createHash} from 'node:crypto';
import {buildStoryBundle,validateStory} from './story-content-policy.mjs';

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

function presentation(effects,scene){
 if(effects===undefined)return;
 only(effects,['cameraId','expressionId','audioCueId','hotspotVisibility']);
 if(effects.cameraId!==undefined&&!scene.scenePresentation?.cameras.some(c=>c.id===effects.cameraId))fail();
 if(effects.expressionId!==undefined&&!['neutral','smile','surprised','thoughtful','concerned'].includes(effects.expressionId))fail();
 if(effects.audioCueId!==undefined&&!Object.hasOwn(scene.audioCues??{},effects.audioCueId))fail();
 if(effects.hotspotVisibility!==undefined){
  only(effects.hotspotVisibility,(scene.scenePresentation?.hotspots??[]).map(h=>h.id));
  if(Object.values(effects.hotspotVisibility).some(v=>typeof v!=='boolean'))fail();
 }
}

function validateConditions(condition,context){
 let count=0;const dependencies=[];
 const bounded=value=>{if(typeof value!=='string'||!(/^[a-z][a-z0-9:.-]{0,159}$/).test(value))fail();return value;};
 function visit(node,depth){
  only(node,['all','any','not','node_entered','choice_committed','event_completed','flag_equals','narrative_completed']);
  if(++count>64||depth>8||Object.keys(node).length!==1)fail();
  const [key,value]=Object.entries(node)[0];
  if(key==='all'||key==='any'){if(!Array.isArray(value)||value.length<1||value.length>32)fail();for(const child of value)visit(child,depth+1);return;}
  if(key==='not'){visit(value,depth+1);return;}
  if(key==='flag_equals'){only(value,['key','value']);if(Object.keys(value).length!==2)fail();bounded(value.key);bounded(value.value);return;}
  bounded(value);
  if(key==='node_entered'&&!context.nodes.has(value)||key==='choice_committed'&&!context.choices.has(value)||key==='event_completed'&&!context.bindings.has(value)||key==='narrative_completed'&&!context.narratives.has(value))fail();
  if(key==='event_completed')dependencies.push(value);
 }
 visit(condition,0);return dependencies;
}

/** 從唯一正式首條內容建構分層 immutable 物件；不發布、不產圖、不複製任何資產。 */
export function buildSceneEventBundle(story,root,options){
 const legacy=buildStoryBundle(story,root),source=legacy.manifest;
 const sceneId=id(options.sceneId),sceneVersion=version(options.sceneVersion),narrativeId=id(options.narrativeId),narrativeVersion=version(options.narrativeVersion);
 const sceneCatalogId=uuid(options.sceneCatalogId),narrativeCatalogId=uuid(options.narrativeCatalogId);
 const capabilities=list(options.capabilities,32).map(id);
 const categories=list(options.categories,64).map(category=>{
  only(category,['categoryId','code','version','title','interestTagIds','recommendationPriority']);uuid(category.categoryId);id(category.code);version(category.version);
  if(typeof category.title!=='string'||!category.title.trim()||category.title.length>80||!Number.isSafeInteger(category.recommendationPriority))fail();
  const interestTagIds=list(category.interestTagIds,32).map(id);
  // 使用現有 Story Publisher 的興趣白名單，避免 Category 與 Profile 目錄脫節。
  validateStory({...story,interestTagIds});
  return structuredClone(category);
 });
 if(!categories.length||new Set(categories.map(c=>c.code)).size!==categories.length||new Set(categories.map(c=>c.categoryId)).size!==categories.length)fail();
 const eligibleCategoryCodes=list(options.eligibleCategoryCodes,64).map(id);
 if(!eligibleCategoryCodes.length||eligibleCategoryCodes.some(code=>!categories.some(c=>c.code===code)))fail();
 const sequenceGroupId=options.sequenceGroupId??null,sequenceOrder=options.sequenceOrder??null,prerequisites=list(options.prerequisites??[],64).map(id);
 if((sequenceGroupId===null)!==(sequenceOrder===null)||sequenceGroupId!==null&&(!id(sequenceGroupId)||!Number.isSafeInteger(sequenceOrder)||sequenceOrder<1)||prerequisites.includes(narrativeId))fail();
 const sceneBody={schemaVersion:'scene-event.v1',sceneId,version:sceneVersion,title:options.sceneTitle??source.title,time:source.time,place:source.place,event:source.event,locale:source.locale,categoryCodes:categories.map(c=>c.code),sceneCapabilities:capabilities,backgroundAsset:source.backgroundAsset,audioAsset:source.audioAsset,assets:structuredClone(source.assets),scenePresentation:structuredClone(source.scenePresentation),audioCues:structuredClone(source.audioCues)};
 const events=source.interactions.map(definition=>{
  const {sameNext,differentNext,...body}=structuredClone(definition);id(body.id);version(body.version);
  return object('events',body.id,body.version,{schemaVersion:'scene-event.v1',...body,eventId:body.id});
 });
 const definitions=new Map(events.map(event=>[event.id,event]));
 const nodeIds=new Set(source.nodes.map(n=>n.id)),choiceIds=new Set(source.nodes.flatMap(n=>n.choices.map(c=>c.id)));
 const overrides=options.bindingOverrides??{};only(overrides,source.interactions.map(d=>d.id));
 function binding(scope,sourceId,bindingId,eventId,fields,triggerConditions){
  id(bindingId);const definition=definitions.get(eventId);if(!definition)fail();
  only(fields,['narrativeRole','visibility','selectionMode','probability','repeatScope','repeatGroup','requiredCapabilities','triggerConditions','requiredForEnding','presentationEffects']);
  const result={scope,sourceId,bindingId,definition:eventReference(definition),narrativeRole:scope==='narrative'&&definition.manifest.moduleType==='cooperative-choice'?'main':'side',visibility:'visible',selectionMode:'fixed',probability:1,repeatScope:'playthrough',repeatGroup:eventId,requiredCapabilities:[],triggerConditions,requiredForEnding:scope==='narrative'&&definition.manifest.moduleType==='cooperative-choice',...structuredClone(fields)};
  if(!['main','side'].includes(result.narrativeRole)||!['visible','hidden'].includes(result.visibility)||!['fixed','weighted_random'].includes(result.selectionMode)||!['playthrough','round'].includes(result.repeatScope)||typeof result.probability!=='number'||!Number.isFinite(result.probability)||result.probability<0||result.probability>1||typeof result.requiredForEnding!=='boolean'||result.requiredForEnding&&result.narrativeRole!=='main')fail();
  if(scope!=='narrative'&&result.narrativeRole==='main')fail();
  if(result.requiredForEnding&&result.selectionMode==='weighted_random'&&result.probability<1)fail();
  id(result.repeatGroup);list(result.requiredCapabilities,32).map(id);if(result.requiredCapabilities.some(c=>!capabilities.includes(c)))fail();presentation(result.presentationEffects,sceneBody);
  return result;
 }
 const bindingSources=options.bindingSources??{};only(bindingSources,source.interactions.map(d=>d.id));
 const migratedBindings=source.interactions.map(definition=>{
  const nodes=source.nodes.filter(n=>n.interactionId===definition.id||(n.objects??[]).includes(definition.id));if(!nodes.length)fail();
  const scope=bindingSources[definition.id]??'narrative';if(!['narrative','scene','global'].includes(scope)||scope!=='narrative'&&definition.moduleType==='cooperative-choice')fail();
  const result=binding(scope,scope==='narrative'?narrativeId:scope==='scene'?sceneId:'global',definition.id,definition.id,overrides[definition.id]??{},{any:nodes.map(n=>({node_entered:n.id}))});
  if(definition.moduleType==='cooperative-choice')result.outcomeTransitions={same:definition.sameNext,different:definition.differentNext};return result;
 });
 function poolBindings(items,scope,sourceId){
  if(!Array.isArray(items)||items.length>128)fail();return items.map(item=>{
   const {bindingId,eventId,...fields}=item;return binding(scope,sourceId,bindingId,eventId,fields,{node_entered:source.entry});
  });
 }
 const narrativeBindings=migratedBindings.filter(b=>b.scope==='narrative');
 const sceneBindings=[...migratedBindings.filter(b=>b.scope==='scene'),...poolBindings(options.sceneBindings??[],'scene',sceneId)],globalBindings=[...migratedBindings.filter(b=>b.scope==='global'),...poolBindings(options.globalBindings??[],'global','global')];
 const bindings=[...narrativeBindings,...sceneBindings,...globalBindings];if(bindings.length>256)fail();
 for(const node of source.nodes)if(node.interactionId&&node.choices.length===0){const gate=narrativeBindings.find(b=>b.bindingId===node.interactionId);if(!gate||gate.selectionMode==='weighted_random'&&gate.probability<1)fail();}
 const key=b=>`${b.scope}:${b.sourceId}:${b.bindingId}`,keys=new Set(bindings.map(key));if(keys.size!==bindings.length)fail();
 const context={nodes:nodeIds,choices:choiceIds,bindings:keys,narratives:new Set([narrativeId,...(options.knownNarrativeIds??[]).map(id)])};
 const dependencies=new Map(bindings.map(b=>[key(b),validateConditions(b.triggerConditions,context)]));
 const visiting=new Set(),visited=new Set();function visit(current){if(visiting.has(current))fail();if(visited.has(current))return;visiting.add(current);for(const dependency of dependencies.get(current))visit(dependency);visiting.delete(current);visited.add(current);}for(const current of keys)visit(current);
 sceneBody.sceneEventBindings=sceneBindings;
 const scene=object('scenes',sceneId,sceneVersion,sceneBody);
 const pool=object('pools','global',version(options.poolVersion??'v1'),{schemaVersion:'scene-event.v1',poolId:'global',version:options.poolVersion??'v1',eventBindings:globalBindings});
 const narrative=object('narratives',narrativeId,narrativeVersion,{schemaVersion:'scene-event.v1',narrativeId,version:narrativeVersion,title:source.title,summary:source.summary,scene:reference(scene),globalPool:reference(pool),eligibleCategoryCodes,sequenceGroupId,sequenceOrder,prerequisites,entry:source.entry,nodes:structuredClone(source.nodes),suggestions:structuredClone(source.suggestions),eventBindings:narrativeBindings});
 return {categories,scene,narrative,pool,events,assets:legacy.assets,objects:[scene,pool,...events,narrative],sceneIndex:{sceneCatalogId,sceneId,version:sceneVersion,title:sceneBody.title,manifestKey:scene.key,manifestSha256:scene.sha256},narrativeIndex:{catalogId:narrativeCatalogId,storyId:narrativeId,version:narrativeVersion,sceneCatalogId,manifestKey:narrative.key,manifestSha256:narrative.sha256,interestTagIds:source.interestTagIds,recommendationPriority:source.recommendationPriority,sequenceGroupId,sequenceOrder,prerequisites}};
}
