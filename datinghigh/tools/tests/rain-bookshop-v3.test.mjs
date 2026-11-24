import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSceneEventTrackBundle} from '../scene-event-content-policy.mjs';
import {validateFormalSceneEventBundles} from '../scene-event-publish-policy.mjs';
import {validateFirstStoryAuthoring} from '../rain-bookshop-v3-policy.mjs';
const root=new URL('../../',import.meta.url);
test('the local authoring entry accepts the replacement first story and rejects extra or arbitrary sources',()=>{
 for(const sourceFile of ['contracts/rain-bookshop-last-order.json','contracts/rain-bookshop-before-rain-stops.json'])assert.doesNotThrow(()=>validateFirstStoryAuthoring({schemaVersion:'scene-event.authoring.v2',stories:[{sourceFile}]}));
 for(const stories of [[],[{sourceFile:'contracts/another-story.json'}],[{sourceFile:'../another-project/story.json'}],[{sourceFile:'contracts/rain-bookshop-before-rain-stops.json'},{sourceFile:'contracts/second.json'}]])assert.throws(()=>validateFirstStoryAuthoring({schemaVersion:'scene-event.authoring.v2',stories}),/FIRST_STORY_GATE_REQUIRED/);
});
test('greeting styles have separate shots and accepting tissue does not choose a conversation response',()=>{
 const c=JSON.parse(readFileSync(new URL('contracts/rain-bookshop-before-rain-stops.json',root),'utf8'));
 const binding=id=>c.narrative.eventBindings.find(b=>b.bindingId===id),greeting=binding('iv3-greeting');
 const shots=greeting.actions.map(a=>a.presentationSteps.find(p=>p.type==='shot')?.shotId);
 assert.equal(new Set(shots.filter(Boolean)).size,3);
 const tissue=binding('av3-tissue');assert.ok(tissue);assert.equal(tissue.requiredForEnding,false);
 assert.deepEqual(tissue.actions.map(a=>a.params.optionId),['accept-tissue','decline-tissue']);
 for(const a of tissue.actions){assert.equal(a.nextNode,undefined);assert.ok(a.worldEffects.every(e=>e.type==='object'&&e.objectId==='tissue'));}
 assert.ok(binding('av3-response').actions.some(a=>a.params.optionId==='decline'));
});
test('the public shelf cannot identify the private reservation answer before the acceptor shares it',()=>{
 const c=JSON.parse(readFileSync(new URL('contracts/rain-bookshop-before-rain-stops.json',root),'utf8'));
 assert.ok(c.scene.sceneObjects.every(o=>!o.label.includes('預留書')));
 assert.ok(!c.scene.sceneObjects.some(o=>o.id==='reserve-book'));
});
test('wrong comparison attempts preserve the book and leave the required confirmation unfinished',()=>{
 const c=JSON.parse(readFileSync(new URL('contracts/rain-bookshop-before-rain-stops.json',root),'utf8')),find=c.narrative.eventBindings.find(b=>b.bindingId==='iv3-find');
 const wrong=find.actions.filter(a=>a.params.optionId.startsWith('try-'));assert.equal(wrong.length,3);
 for(const a of wrong){assert.deepEqual(a.worldEffects,[]);assert.equal(a.nextNode,'iv3-recheck');assert.notEqual(a.stepId,find.requiredActions[0].stepId??find.requiredActions[0].actionId);}
 assert.ok(find.actions.some(a=>a.params.optionId==='compare'&&a.nextNode==='iv3-07'));assert.ok(c.narrative.tracks.inviter.nodes.some(n=>n.id==='iv3-recheck'));
});
export const options={sceneCatalogId:'019a281e-0000-7000-8000-000000005011',narrativeCatalogId:'019a281e-0000-7000-8000-000000005012',categories:[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading','coffee'],recommendationPriority:1}]};
test('V3 first story: original books, independent openings, three real coffee endings and safety fallback are publishable',async()=>{
 const c=JSON.parse(readFileSync(new URL('contracts/rain-bookshop-before-rain-stops.json',root),'utf8'));
 assert.equal(c.scene.version,'v3');assert.equal(c.narrative.narrativeId,'rain-bookshop-before-rain-stops');
 assert.equal(c.scene.books.length,4);assert.equal(c.scene.stage.areaVisuals.length,7);assert.equal(new Set(c.scene.stage.areaVisuals.map(v=>v.backgroundAsset)).size,7);
 assert.deepEqual(c.narrative.endings.map(e=>e.id),['ev3-01-more-talk','ev3-02-book-recommendation','ev3-03-gentle-distance','safety-exit']);
 assert.ok(c.scene.npcs[0].appearance.format==='static-npc.v1');assert.equal(c.scene.npcs[0].appearance.poses.length,2);
 assert.equal(c.narrative.tracks.inviter.entry,'iv3-01');assert.equal(c.narrative.tracks.acceptor.entry,'av3-01');
 assert.doesNotMatch(JSON.stringify(c),/第 27 號|取書單背面|order-tag-27/);
 await validateFormalSceneEventBundles([buildSceneEventTrackBundle(c,root,options)]);
});
test('rehashing a reduced V3 story cannot replace the formal content baseline',async()=>{
 for(const mutate of [c=>c.scene.books[0].pages[0]='替代試讀',c=>c.narrative.clues.find(v=>v.id==='private-list').role='shared',c=>c.narrative.endings[0].presentationSteps=[]]){
  const c=JSON.parse(readFileSync(new URL('contracts/rain-bookshop-before-rain-stops.json',root),'utf8'));mutate(c);
  await assert.rejects(()=>validateFormalSceneEventBundles([buildSceneEventTrackBundle(c,root,options)]),/INVALID_STORY_CONTENT/);
 }
});
