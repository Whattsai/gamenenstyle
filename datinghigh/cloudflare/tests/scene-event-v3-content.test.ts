import {describe,expect,it} from 'vitest';
import {validateTrackContent} from '../src/scene-event-track-content';
import {trackContentFixture} from './support/scene-event-track-fixture';

/** 僅供引擎驗證的最小內容，並非新增正式主線或素材核准。 */
function safetyFixture(){
 const c=trackContentFixture();
 c.scene.sharedFlags=[{id:'water',values:['safe','danger'],initialValue:'safe',publicValues:['safe','danger']}];
 const condition={shared_flag_equals:{key:'water',value:'danger'}};
 c.narrative.safetyExit={endingId:'safety-exit',conditions:condition};
 c.narrative.endings.push({id:'safety-exit',title:'安全撤離',lines:[{speaker:'旁白',text:'離開危險區域。'}],conditions:condition,presentationSteps:[]});
 c.scene.sceneObjects.push({...structuredClone(c.scene.sceneObjects[0]),id:'danger-paper'});
 c.narrative.eventBindings[0].actions.push({...structuredClone(c.narrative.eventBindings[0].actions[0]),params:{objectId:'danger-paper'},worldEffects:[{type:'flag',flagId:'water',value:'danger'}]});
 return c;
}

describe('V3 safety publisher',()=>{
 it('reachability keeps consumed alternative groups even when the completed branch has no world effect',()=>{
  const c=trackContentFixture(),base=c.narrative.eventBindings[0];
  for(const id of ['optional-blocker','optional-key']){const b=structuredClone(base);b.bindingId=id;b.repeatGroup='one-opportunity';b.narrativeRole='side';b.requiredForEnding=false;delete b.actions[0].nextNode;c.narrative.eventBindings.push(b);}
  base.triggerConditions={all:[base.triggerConditions,{track_event_completed:{role:'inviter',bindingKey:'narrative:test-story:optional-key'}}]};
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('SEF-UT-547: accepts danger exit before ordinary required cooperation and preserves the normal route',()=>{
  expect(()=>validateTrackContent(safetyFixture())).not.toThrow();
 });
 it.each(['missing-ending','different-predicate','unreachable-safety'])('refuses %s without mutating old content',kind=>{
  const c=safetyFixture(),original=JSON.stringify(c);
  if(kind==='missing-ending')c.narrative.safetyExit.endingId='absent';
  if(kind==='different-predicate')c.narrative.safetyExit.conditions={shared_flag_equals:{key:'water',value:'safe'}};
  if(kind==='unreachable-safety')c.narrative.eventBindings[0].actions.pop();
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
  expect(()=>validateTrackContent(trackContentFixture())).not.toThrow();
  expect(original).toContain('safety-exit');
 });
});

function stageFixture(){
 const c=trackContentFixture();
 c.scene.stage={version:'scene-stage.v1',areaVisuals:[{areaId:'entrance',backgroundAsset:'background',defaultShotId:'entry-shot',layers:[]}],
  shots:[{id:'entry-shot',areaId:'entrance',cameraId:'wide',actors:[],audioCueIds:['rain']}],
  embeddedInteractables:[{id:'paper-hit',areaId:'entrance',objectId:'paper',state:'dry',assetId:'background',depth:2,anchor:{x:.5,y:.5},size:{width:.1,height:.15},hitShape:{type:'rect',x:0,y:0,width:1,height:1},interactionPreset:'inspect'}]};
 for(const r of ['inviter','acceptor'])for(const node of c.narrative.tracks[r].nodes)node.presentation.shotId='entry-shot';
 c.narrative.endings[0].presentationSteps=[{type:'shot',shotId:'entry-shot',durationMs:200}];
 return c;
}
/** NPC 的五表情不可只滿足陣列長度；每個語意必須存在且不可重複。 */
function npcStageFixture(){
 const c=stageFixture();
 c.scene.npcs.push({
  id:'clerk',label:'店員',areaId:'entrance',dialogueOptions:[],
  appearance:{
   poses:[{id:'stand',assetId:'background'},{id:'read',assetId:'background'}],
   expressions:['neutral','smile','surprised','thoughtful','concerned'].map(id=>({id,assetId:'background'})),
   faceAnchor:{x:.5,y:.2},faceSize:{width:.25,height:.25},
  },
 });
 c.scene.stage.shots[0].actors.push({actorId:'clerk',pose:'stand',expression:'neutral',gesture:'idle',position:{x:.5,y:.7},height:.5,depth:3});
 return c;
}
function staticNpcFixture(){
 const c=npcStageFixture(),frames=Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map((e,i)=>[e,{x:i*200,y:0,width:200,height:800}]));
 c.scene.npcs[0].appearance={format:'static-npc.v1',poses:[{id:'stand',assetId:'background',width:1000,height:800,frames}]};
 return c;
}
describe('published static NPC frames',()=>{
 it('an interactive NPC requires every pose/expression opaque mask; malformed or omitted cells cannot publish',()=>{
  const c=staticNpcFixture(),npc=c.scene.npcs[0];npc.dialogueOptions=['browse'];npc.hitMasks=['neutral','smile','surprised','thoughtful','concerned'].map(expression=>({pose:'stand',expression,mask:{width:4,height:4,rows:['6','f','f','6']}}));
  expect(()=>validateTrackContent(c)).not.toThrow();const good=structuredClone(c);
  npc.hitMasks.pop();expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');good.scene.npcs[0].hitMasks[0].mask.rows=['0','0','0','0'];expect(()=>validateTrackContent(good)).toThrow('INVALID_STORY_CONTENT');
 });
 it('SEF-UT-502 static: accepts one complete body per expression without a detached face layer',()=>expect(()=>validateTrackContent(staticNpcFixture())).not.toThrow());
 it.each(['missing-expression','duplicate-frame','outside-sheet','missing-asset','missing-pose'])('SEF-UT-505 static: refuses %s before publishing',kind=>{
  const c=staticNpcFixture(),pose=c.scene.npcs[0].appearance.poses[0];
  if(kind==='missing-expression')delete pose.frames.concerned;
  if(kind==='duplicate-frame')pose.frames.concerned=pose.frames.neutral;
  if(kind==='outside-sheet')pose.frames.concerned.width=201;
  if(kind==='missing-asset')pose.assetId='unknown-npc';
  if(kind==='missing-pose')pose.id='sit';
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
});
describe('public stage weather',()=>{
 it('music is an actual audio asset and area gains are bounded data',()=>{
  const c=stageFixture();c.scene.musicAsset='rain';c.scene.areas[0].audioMix={ambienceGain:.3,musicGain:.6};expect(()=>validateTrackContent(c)).not.toThrow();
  c.scene.musicAsset='background';expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');c.scene.musicAsset='rain';c.scene.areas[0].audioMix.musicGain=1.1;expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('actor visibility may depend on a public world flag but never on a private value',()=>{
  const c=staticNpcFixture();c.scene.sharedFlags=[{id:'rain',values:['steady','secret'],initialValue:'steady',publicValues:['steady']}];c.scene.stage.shots[0].actors[0].whenFlagEquals={key:'rain',value:'steady'};
  expect(()=>validateTrackContent(c)).not.toThrow();c.scene.stage.shots[0].actors[0].whenFlagEquals.value='secret';expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('projects only declared public flag values into weather levels',()=>{
  const c=stageFixture();c.scene.sharedFlags=[{id:'rain',values:['light','heavy'],initialValue:'light',publicValues:['light','heavy']}];
  c.scene.stage.weather={flagId:'rain',levels:[{value:'light',intensity:'easing'},{value:'heavy',intensity:'heavy'}]};
  c.scene.stage.areaVisuals[0].weatherRegion={anchor:{x:.1,y:.1},size:{width:.3,height:.5}};
  expect(()=>validateTrackContent(c)).not.toThrow();
  c.scene.sharedFlags[0].publicValues=['light'];expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
});
describe('V3 NPC appearance completeness',()=>{
 it('SEF-UT-502: a stage with all five distinct semantic expressions and a valid NPC pose is accepted',()=>{
  expect(()=>validateTrackContent(npcStageFixture())).not.toThrow();
 });
 it('SEF-UT-505: a duplicated NPC expression cannot masquerade as the missing fifth semantic expression',()=>{
  const c=npcStageFixture();
  c.scene.npcs[0].appearance.expressions[4].id='neutral';
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it.each(['unselected-expression','unselected-pose'])('SEF-UT-505: publisher refuses missing %s artwork before a later Shot uses it',kind=>{
  const c=npcStageFixture(),npc=c.scene.npcs[0].appearance;
  if(kind==='unselected-expression')npc.expressions[4].assetId='unpublished-face';
  if(kind==='unselected-pose')npc.poses[1].assetId='unpublished-pose';
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('SEF-UT-505: a published prop Shot needs its own real NPC hand anchor and public prop art',()=>{
  const c=npcStageFixture(),actor=c.scene.stage.shots[0].actors[0];
  actor.propObjectId='paper';
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
  c.scene.npcs[0].appearance.propAnchors=[{id:'right-hand',position:{x:.65,y:.5}}];
  expect(()=>validateTrackContent(c)).not.toThrow();
  c.scene.npcs[0].appearance.propAnchors=[{id:'right-hand',position:{x:.65,y:.5}},{id:'right-hand',position:{x:.3,y:.7}}];
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('SEF-UT-505: duplicated NPC pose IDs cannot silently select the first appearance',()=>{
  const c=npcStageFixture();
  c.scene.npcs[0].appearance.poses[1].id='stand';
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
});
describe('V3 multi-area stage publisher',()=>{
 it('SEF-UT-502: accepts complete per-node shots and physical object hit shapes',()=>expect(()=>validateTrackContent(stageFixture())).not.toThrow());
 it.each(['node-shot','ending-shot','shot-area','layer-asset','hit-object','hit-state','hit-bounds','zero-area-polygon','npc-without-actor','unknown-preset','duplicate-area','unknown-audio'])('SEF-UT-505 / SEF-UT-548: refuses incomplete %s',kind=>{
  const c=stageFixture(),stage=c.scene.stage;
  if(kind==='node-shot')delete c.narrative.tracks.acceptor.nodes[1].presentation.shotId;
  if(kind==='ending-shot')c.narrative.endings[0].presentationSteps=[];
  if(kind==='shot-area')stage.shots[0].areaId='absent';
  if(kind==='layer-asset')stage.areaVisuals[0].layers=[{id:'table',assetId:'absent',depth:5,anchor:{x:.5,y:.5},size:{width:.5,height:.5}}];
  if(kind==='hit-object')stage.embeddedInteractables[0].objectId='absent';
  if(kind==='hit-state')stage.embeddedInteractables[0].state='absent';
  if(kind==='hit-bounds')stage.embeddedInteractables[0].hitShape.width=2;
  if(kind==='zero-area-polygon')stage.embeddedInteractables[0].hitShape={type:'polygon',points:[{x:0,y:0},{x:.5,y:.5},{x:1,y:1}]};
  if(kind==='npc-without-actor')c.narrative.tracks.inviter.nodes[0].lines=[{speaker:'店員・NPC',text:'歡迎。'}];
  if(kind==='unknown-preset')stage.embeddedInteractables[0].interactionPreset='execute-code';
  if(kind==='duplicate-area')stage.areaVisuals.push(structuredClone(stage.areaVisuals[0]));
  if(kind==='unknown-audio')stage.shots[0].audioCueIds=['absent'];
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
 it('SEF-UT-548: validates every ending dependency, including an optional branch',()=>{
  const c=stageFixture();c.narrative.endings[0].presentationSteps.push({type:'shot',shotId:'absent',durationMs:200});
  expect(()=>validateTrackContent(c)).toThrow('INVALID_STORY_CONTENT');
 });
});
