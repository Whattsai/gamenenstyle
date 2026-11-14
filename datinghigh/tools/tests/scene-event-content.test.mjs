import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildSceneEventBundle} from '../scene-event-content-policy.mjs';
const root=new URL('../../',import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL('../../contracts/story-scenes.json',import.meta.url),'utf8')).stories[0];
const settings=()=>({sceneCatalogId:'019a281e-0000-7000-8000-000000004001',narrativeCatalogId:'019a281e-0000-7000-8000-000000004002',sceneId:'rain-bookshop',sceneVersion:'v1',narrativeId:'rain-bookshop-lost-note',narrativeVersion:'v1',capabilities:['bookshop'],eligibleCategoryCodes:['romance'],categories:[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading'],recommendationPriority:1}]});

test('SEF content split preserves the entire approved scene, nodes and two endings without copying assets',()=>{
 const bundle=buildSceneEventBundle(source,root,settings());
 assert.deepEqual(bundle.scene.manifest.scenePresentation,source.scenePresentation);
 assert.deepEqual(bundle.scene.manifest.audioCues,source.audioCues);
 assert.deepEqual(bundle.narrative.manifest.nodes,source.nodes);
 assert.equal(bundle.narrative.manifest.nodes.filter(n=>n.ending).length,2);
 assert.equal(bundle.narrative.manifest.scenePresentation,undefined);assert.equal(bundle.narrative.manifest.assets,undefined);
 assert.equal(bundle.assets.length,source.assets.length);
 assert.deepEqual(bundle.narrative.manifest.eligibleCategoryCodes,['romance']);
 const cooperative=bundle.events.find(e=>e.manifest.moduleType==='cooperative-choice');
 assert.equal(cooperative.manifest.sameNext,undefined);
 assert.ok(bundle.narrative.manifest.eventBindings.find(b=>b.definition.eventId===cooperative.id).outcomeTransitions.same);
});

test('every immutable layer carries matching bytes, version, key and SHA including the global pool',()=>{
 const a=buildSceneEventBundle(source,root,settings()),b=buildSceneEventBundle(source,root,settings());
 assert.equal(a.objects.length,source.interactions.length+3);
 for(const object of a.objects){assert.equal(object.sha256,createHash('sha256').update(object.bytes).digest('hex'));assert.ok(object.key.endsWith('/'+object.version+'/manifest.json'));assert.equal(object.sha256,b.objects.find(o=>o.key===object.key).sha256);assert.doesNotMatch(object.bytes.toString(),/"file":|private\/|Gemini|avatarVersion/);}
 assert.equal(a.narrative.manifest.scene.sha256,a.scene.sha256);assert.equal(a.narrative.manifest.globalPool.sha256,a.pool.sha256);
 for(const binding of a.narrative.manifest.eventBindings)assert.ok(a.events.some(e=>e.key===binding.definition.key&&e.sha256===binding.definition.sha256));
});

test('publisher refuses mismatched categories, unsupported modules and invalid presentation references',()=>{
 for(const mutate of [s=>s.eligibleCategoryCodes=['mystery'],s=>s.bindingOverrides={bookmark:{presentationEffects:{cameraId:'missing'}}},s=>s.bindingOverrides={bookmark:{presentationEffects:{expressionId:'angry'}}},s=>s.bindingOverrides={bookmark:{presentationEffects:{url:'https://invalid.test'}}},s=>s.bindingOverrides={bookmark:{presentationEffects:{hotspotVisibility:{missing:true}}}}]){const options=settings();mutate(options);assert.throws(()=>buildSceneEventBundle(source,root,options),/INVALID_STORY_CONTENT/);}
 const invalid=structuredClone(source);invalid.interactions[0].moduleType='not-implemented';assert.throws(()=>buildSceneEventBundle(invalid,root,settings()),/INVALID_STORY_CONTENT/);
});

test('publisher rejects scripts, missing binding dependencies and dependency cycles before producing an index',()=>{
 for(const triggerConditions of [{script:'true'},{event_completed:'narrative:rain-bookshop-lost-note:missing'},{all:[]}, {all:[{node_entered:'missing'},{script:'ignored'}]}]){
  assert.throws(()=>buildSceneEventBundle(source,root,{...settings(),bindingOverrides:{bookmark:{triggerConditions}}}),/INVALID_STORY_CONTENT/);
 }
 const prefix='narrative:rain-bookshop-lost-note:';
 assert.throws(()=>buildSceneEventBundle(source,root,{...settings(),bindingOverrides:{bookmark:{triggerConditions:{event_completed:prefix+'reading-path'}},'reading-path':{triggerConditions:{event_completed:prefix+'bookmark'}}}}),/INVALID_STORY_CONTENT/);
});
test('the existing object can belong to the scene while the cooperative gate remains narrative-owned',()=>{
 const bundle=buildSceneEventBundle(source,root,{...settings(),bindingSources:{bookmark:'scene'}});
 assert.deepEqual(bundle.narrative.manifest.eventBindings.map(b=>b.bindingId),['reading-path']);
 assert.equal(bundle.scene.manifest.sceneEventBindings[0].bindingId,'bookmark');assert.equal(bundle.scene.manifest.sceneEventBindings[0].scope,'scene');
 assert.deepEqual(bundle.narrative.manifest.nodes,source.nodes);
 assert.throws(()=>buildSceneEventBundle(source,root,{...settings(),bindingSources:{'reading-path':'scene'}}),/INVALID_STORY_CONTENT/);
});
test('a scene or global binding cannot declare itself a required narrative main event',()=>{
 for(const scope of ['scene','global'])assert.throws(()=>buildSceneEventBundle(source,root,{...settings(),bindingSources:{bookmark:scope},bindingOverrides:{bookmark:{narrativeRole:'main',requiredForEnding:true}}}),/INVALID_STORY_CONTENT/);
});
test('a required ending event or the only cooperative gate cannot be randomly cancelled forever',()=>{
 for(const requiredForEnding of [true,false])assert.throws(()=>buildSceneEventBundle(source,root,{...settings(),bindingOverrides:{'reading-path':{requiredForEnding,selectionMode:'weighted_random',probability:.5}}}),/INVALID_STORY_CONTENT/);
 assert.doesNotThrow(()=>buildSceneEventBundle(source,root,{...settings(),bindingOverrides:{'reading-path':{visibility:'hidden',selectionMode:'weighted_random',probability:1}}}));
});
