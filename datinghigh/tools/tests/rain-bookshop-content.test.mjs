import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {buildSceneEventTrackBundle} from '../scene-event-content-policy.mjs';
import {validateFormalSceneEventBundles} from '../scene-event-publish-policy.mjs';
const root=new URL('../../',import.meta.url),require=createRequire(new URL('../../cloudflare/package.json',import.meta.url));
const source=()=>JSON.parse(readFileSync(new URL('contracts/rain-bookshop-last-order.json',root),'utf8'));
const options={sceneCatalogId:'019a281e-0000-7000-8000-000000005001',narrativeCatalogId:'019a281e-0000-7000-8000-000000005002',categories:[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading','coffee'],recommendationPriority:1}]};
test('SEF-UT-366: publisher rejects a rehashed formal story missing approved dialogue or required performance, even when the generic graph stays valid',async()=>{
 for(const mutate of [c=>c.narrative.tracks.inviter.nodes[0].lines.shift(),c=>c.narrative.sharedEventBindings[1].lines.pop(),c=>c.narrative.endings[0].presentationSteps=[]]){
  const c=source();mutate(c);await assert.rejects(()=>validateFormalSceneEventBundles([buildSceneEventTrackBundle(c,root,options)]),/INVALID_STORY_CONTENT/);
 }
});
const module=async()=>{const {build}=require('esbuild');const result=await build({entryPoints:[new URL('../../cloudflare/src/scene-event-track-content.ts',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')],bundle:true,write:false,platform:'neutral',format:'esm'});const m=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));return {validateTrackContent:c=>{try{return m.validateTrackContent(c);}catch{throw new Error('INVALID_STORY_CONTENT');}}};};
test('SEF-UT-366: formal rain bookshop has sixteen participant nodes, three real shared events, four areas and two endings',async()=>{
 const c=source(),{validateTrackContent}=await module();assert.doesNotThrow(()=>validateTrackContent(c));
 assert.deepEqual(c.scene.areas.map(a=>a.id),['entrance','shelves','counter','window']);
 assert.deepEqual(c.narrative.tracks.inviter.nodes.map(n=>n.id),Array.from({length:8},(_,i)=>'i0'+(i+1)));
 assert.deepEqual(c.narrative.tracks.acceptor.nodes.map(n=>n.id),Array.from({length:8},(_,i)=>'a0'+(i+1)));
 assert.deepEqual(c.narrative.sharedEventBindings.map(b=>b.bindingId),['counter-meet','wind-rescue','final-exchange']);
 assert.deepEqual(c.narrative.endings.map(e=>e.id),['e01','e02']);
 const rescue=c.narrative.sharedEventBindings[1];assert.equal(rescue.transitions.inviterNextNode,undefined);assert.equal(rescue.transitions.acceptorNextNode,'a08');
 assert.ok(rescue.actions.filter(a=>a.stepId==='retrieve-tag'||a.stepId==='place-tag').every(a=>a.role==='acceptor'));
 assert.equal(c.narrative.endings[0].conditions.all[1].all.filter(c=>c.track_choice_committed?.optionId==='look_back').length,2);
});
test('SEF-UT-366: removing required nodes, bindings, legal states or cue references rejects publication',async()=>{
 const {validateTrackContent}=await module();for(const change of [c=>c.narrative.tracks.inviter.nodes.splice(3,1),c=>c.narrative.sharedEventBindings.splice(1,1),c=>c.scene.sceneObjects.find(o=>o.id==='order-tag-27').states.splice(1,1),c=>delete c.scene.audioCues['fx-gust']]){const c=source();change(c);assert.throws(()=>validateTrackContent(c),/INVALID_STORY_CONTENT/);}
});
test('v2 publisher builds independent immutable layers and hashes the actual approved assets without copying files',()=>{
 const bundle=buildSceneEventTrackBundle(source(),root,{sceneCatalogId:'019a281e-0000-7000-8000-000000005001',narrativeCatalogId:'019a281e-0000-7000-8000-000000005002',categories:[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading','coffee'],recommendationPriority:1}]});
 assert.equal(bundle.narrative.manifest.scene.sha256,bundle.scene.sha256);assert.equal(bundle.narrative.manifest.globalPool.sha256,bundle.pool.sha256);
 assert.equal(bundle.narrative.manifest.nodes,undefined);assert.equal(bundle.narrative.manifest.tracks.inviter.entry,'i01');assert.equal(bundle.assets.length,source().scene.assets.length);
 for(const b of [...bundle.narrative.manifest.eventBindings,...bundle.narrative.manifest.sharedEventBindings,...bundle.scene.manifest.sceneEventBindings])assert.equal(bundle.events.find(e=>e.id===b.definition.eventId).sha256,b.definition.sha256);
 assert.doesNotMatch(bundle.narrative.bytes.toString(),/assetSources|"file"|private\//);
 const invalid=source();invalid.assetSources[0].file='../another-project/image.png';assert.throws(()=>buildSceneEventTrackBundle(invalid,root,{}));
});

test('publisher accepts a bounded optional observation loop whose entered-node history unlocks the required route',async()=>{
 const c=source(),n=c.narrative,entry=n.eventBindings.find(b=>b.bindingId==='arrive-inviter'),entered=nodeId=>({track_node_entered:{role:'inviter',nodeId}});
 for(const id of ['i-loop-first','i-loop-second'])n.tracks.inviter.nodes.push({...structuredClone(n.tracks.inviter.nodes[0]),id});
 c.scene.sharedFlags.push({id:'loop-once',values:['no','yes'],initialValue:'no',publicValues:[]});
 const loop={...structuredClone(entry),bindingId:'loop-observation',repeatGroup:'loop-observation',narrativeRole:'side',requiredForEnding:false,completionMode:'repeatable',actions:[]};
 for(const [objectId,conditions,nextNode]of [['loop-paper-first',{shared_flag_equals:{key:'loop-once',value:'no'}},'i-loop-first'],['loop-paper-second',entered('i-loop-first'),'i-loop-second'],['loop-paper-return',entered('i-loop-second'),'i01']]){
  const obj={...structuredClone(c.scene.sceneObjects[0]),id:objectId};delete obj.previewPlacement;c.scene.sceneObjects.push(obj);
  loop.actions.push({...structuredClone(entry.actions[0]),params:{objectId},targetObjectId:objectId,conditions,nextNode,presentationSteps:[],worldEffects:objectId==='loop-paper-first'?[{type:'flag',flagId:'loop-once',value:'yes'}]:[]});
 }
 n.eventBindings.push(loop);entry.triggerConditions=entered('i-loop-first');
 const {validateTrackContent}=await module();assert.doesNotThrow(()=>validateTrackContent(c));
});
