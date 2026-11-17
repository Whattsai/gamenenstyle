import {describe,expect,it} from 'vitest';
import {validateTrackContent} from '../src/scene-event-track-content';
import {trackContentFixture} from './support/scene-event-track-fixture';

describe('scene-event.v2 publisher contract',()=>{
 it('SEF-UT-363: accepts independent entries, shared split, unilateral unlock and a common ending',()=>{
  expect(()=>validateTrackContent(trackContentFixture())).not.toThrow();
 });
 it.each(['entry','target','role','area','object','slot','module','params','cue','asset','condition','depth','random-required'])('SEF-UT-365: refuses invalid %s before publishing',kind=>{
  const c=trackContentFixture(),b=c.narrative.eventBindings[0];
  if(kind==='entry')c.narrative.tracks.acceptor.entry='missing';
  if(kind==='target')b.actions[0].nextNode='missing';
  if(kind==='role')b.actions[0].role='shared';
  if(kind==='area')c.narrative.tracks.inviter.nodes[0].areaId='missing';
  if(kind==='object')b.actions[0].params.objectId='missing';
  if(kind==='slot')b.actions[0].params.targetSlotId='missing';
  if(kind==='module')c.eventDefinitions[0].manifest.moduleType='execute-script';
  if(kind==='params')b.actions[0].params.script='anything';
  if(kind==='cue')b.actions[0].presentationSteps=[{type:'audio',cueId:'missing'}];
  if(kind==='asset')c.scene.assets[0].sha256='b'.repeat(64);
  if(kind==='condition')b.triggerConditions={script:'true'};
  if(kind==='depth'){let rule:any={actor_area_is:{role:'inviter',areaId:'entrance'}};for(let i=0;i<10;i++)rule={not:rule};b.triggerConditions=rule;}
  if(kind==='random-required'){b.selectionMode='weighted_random';b.probability=0.5;}
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('SEF-UT-364: rejects required cross-track mutual waits and unreachable endings',()=>{
  const c=trackContentFixture();
  c.narrative.eventBindings[0].triggerConditions={track_event_completed:{role:'acceptor',bindingKey:'narrative:test-story:accept'}};
  c.narrative.eventBindings[1].triggerConditions={track_event_completed:{role:'inviter',bindingKey:'narrative:test-story:inspect'}};
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('validates both branches of any, role-qualified references and AST bounds',()=>{
  for(const rule of [
   {any:[{actor_area_is:{role:'inviter',areaId:'entrance'}},{world_object_state:{objectId:'missing',state:'dry'}}]},
   {track_event_completed:{role:'acceptor',bindingKey:'narrative:test-story:inspect'}},
   {all:[]}, {shared_event_completed:'narrative:test-story:inspect'},
  ]){const c=trackContentFixture();c.narrative.eventBindings[0].triggerConditions=rule;expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');}
 });
 it('unlock is permission only and cannot fabricate an entered node or make a dead route publishable',()=>{
  const c=trackContentFixture(),b=c.narrative.eventBindings[0];delete b.actions[0].nextNode;b.transitions.unlockNodes={inviter:['i-done']};
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('rejects contradictory predicates and a reachable choice that permanently strands a required route',()=>{
  const c=trackContentFixture(),b=c.narrative.eventBindings[0];b.actions[0].conditions={all:[{actor_area_is:{role:'inviter',areaId:'entrance'}},{not:{actor_area_is:{role:'inviter',areaId:'entrance'}}}]};
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
  const d=trackContentFixture(),a=d.narrative.eventBindings[0].actions[0];d.scene.sharedFlags=[{id:'route',values:['open','closed'],initialValue:'open',publicValues:[]}];
  a.conditions={shared_flag_equals:{key:'route',value:'open'}};
  const trap=structuredClone(d.narrative.eventBindings[0]);trap.bindingId='trap';trap.repeatGroup='trap';trap.requiredForEnding=false;trap.narrativeRole='side';delete trap.actions[0].nextNode;trap.actions[0].worldEffects=[{type:'flag',flagId:'route',value:'closed'}];d.narrative.eventBindings.push(trap);
  expect(()=>validateTrackContent(d)).toThrow('INVALID_STORY_CONTENT');
 });
 it('an any branch with a real entry remains reachable despite an optional cyclic dependency',()=>{
  const c=trackContentFixture();c.narrative.eventBindings[0].triggerConditions={any:[{track_node_entered:{role:'inviter',nodeId:'i-start'}},{track_event_completed:{role:'acceptor',bindingKey:'narrative:test-story:accept'}}]};
  c.narrative.eventBindings[1].triggerConditions={track_event_completed:{role:'inviter',bindingKey:'narrative:test-story:inspect'}};
  expect(()=>validateTrackContent(c)).not.toThrow();
 });
 it('one global pool may contain another scene capability, while its unsafe DSL is still rejected',()=>{
  const c=trackContentFixture(),b=structuredClone(c.narrative.eventBindings[0]);b.scope='global';b.sourceId='global';b.bindingId='coral';b.repeatGroup='coral';b.narrativeRole='side';b.requiredForEnding=false;b.requiredCapabilities=['aquarium'];b.actions[0].params.objectId='coral';b.actions[0].conditions={actor_area_is:{role:'inviter',areaId:'underwater'}};delete b.actions[0].nextNode;c.pool.eventBindings.push(b);
  expect(()=>validateTrackContent(c)).not.toThrow();b.triggerConditions={script:'true'};expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('a required main reserves its semantic group; an optional global random alias cannot strand its route',()=>{
  const c=trackContentFixture(),alias=structuredClone(c.narrative.eventBindings[0]);alias.scope='global';alias.sourceId='global';alias.bindingId='optional-alias';alias.narrativeRole='side';alias.requiredForEnding=false;alias.selectionMode='weighted_random';alias.probability=.5;delete alias.actions[0].nextNode;c.pool.eventBindings.push(alias);
  expect(()=>validateTrackContent(c)).not.toThrow();
 });
 it('two authored personal branches can rejoin the same required route; stranding either reachable branch refuses publication',()=>{
  const c=trackContentFixture(),first=c.narrative.eventBindings[0],nodes=c.narrative.tracks.inviter.nodes;
  for(const id of ['i-left','i-right'])nodes.push({...structuredClone(nodes[1]),id});
  c.scene.sceneObjects.push({...structuredClone(c.scene.sceneObjects[0]),id:'other-paper'});
  first.actions[0].nextNode='i-left';first.actions.push({...structuredClone(first.actions[0]),params:{objectId:'other-paper'},nextNode:'i-right'});
  const join=structuredClone(first);join.bindingId='rejoin';join.repeatGroup='rejoin';join.triggerConditions={any:['i-left','i-right'].map(nodeId=>({track_node_entered:{role:'inviter',nodeId}}))};join.actions=[{...structuredClone(first.actions[0]),nextNode:'i-done'}];c.narrative.eventBindings.push(join);
  c.narrative.sharedEventBindings[0].triggerConditions.all.push({track_event_completed:{role:'inviter',bindingKey:'narrative:test-story:rejoin'}});c.narrative.endingRequires.push('narrative:test-story:rejoin');
  expect(()=>validateTrackContent(c)).not.toThrow();join.triggerConditions.any.pop();expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
});
