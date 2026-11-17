import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildTrackFixture} from '../../tests/support/scene-event-content-fixture.mjs';
import {validateSceneEventBundles} from '../scene-event-publish-policy.mjs';
const root=new URL('../../',import.meta.url);
const valid=async options=>{const b=buildTrackFixture(root,options);await validateSceneEventBundles([b]);return b;};

test('malformed presentation containers retain the safe content error instead of failing inside local diagnostics',async()=>{
 const bundle=buildTrackFixture(root);bundle.narrative.manifest.eventBindings={};
 bundle.narrative.bytes=Buffer.from(JSON.stringify(bundle.narrative.manifest));bundle.narrative.sha256=createHash('sha256').update(bundle.narrative.bytes).digest('hex');bundle.narrativeIndex.manifestSha256=bundle.narrative.sha256;
 await assert.rejects(()=>validateSceneEventBundles([bundle]),error=>{assert.equal(error.message,'INVALID_STORY_CONTENT');return true;});
});

test('invalid event presentation identifies a missing camera, expression or audio reference without reflecting private input',async()=>{
 for(const [step,diagnostic]of [
  [{type:'camera',cameraId:'missing-camera',durationMs:100},'camera missing-camera'],
  [{type:'expression',role:'inviter',expression:'unknown-expression'},'expression unknown-expression'],
  [{type:'audio',cueId:'unpublished-audio'},'audio unpublished-audio'],
  [{type:'expression',role:'inviter',expression:'private/path?token=fixture'},'expression'],
 ]){
  const bundle=buildTrackFixture(root,{mutate(content){content.narrative.eventBindings[0].actions[0].presentationSteps=[step];}});
  await assert.rejects(()=>validateSceneEventBundles([bundle]),error=>{
   assert.equal(error.message,`INVALID_STORY_CONTENT: invalid presentation ${diagnostic}`);
   assert.doesNotMatch(error.message,/private\/|token=|story-content\//);return true;
  });
 }
});

test('unsupported publication module reports a public module ID but never reflects arbitrary input',async()=>{
 for(const moduleType of ['execute-script','private/path?token=fixture']){
  const bundle=buildTrackFixture(root,{mutate(content){content.eventDefinitions[0].manifest.moduleType=moduleType;}});
  await assert.rejects(()=>validateSceneEventBundles([bundle]),error=>{
   assert.equal(error.message,moduleType==='execute-script'?'INVALID_STORY_CONTENT: unsupported module execute-script':'INVALID_STORY_CONTENT');
   assert.doesNotMatch(error.message,/private\/|token=|story-content\//);return true;
  });
 }
});

test('missing publication dependency identifies only its public kind, ID and version, without leaking raw keys',async()=>{
 const bundle=buildTrackFixture(root),missing=bundle.events[0];bundle.objects=bundle.objects.filter(o=>o.key!==missing.key);
 await assert.rejects(()=>validateSceneEventBundles([bundle]),error=>{
  assert.equal(error.message,`INVALID_STORY_CONTENT: missing events ${missing.id}@${missing.version}`);
  assert.doesNotMatch(error.message,/story-content\/|private\/|file:|[A-Z]:\\/);return true;
 });
});
test('omitting a declared scene asset or changing its MIME cannot publish an incomplete scene',async()=>{
 for(const change of ['missing','mime']){
  const bundle=buildTrackFixture(root),asset=bundle.assets[0];
  if(change==='missing'){bundle.assets=bundle.assets.filter(a=>a.key!==asset.key);bundle.objects=bundle.objects.filter(a=>a.key!==asset.key);}else asset.mimeType='audio/wav';
  await assert.rejects(()=>validateSceneEventBundles([bundle]),/INVALID_STORY_CONTENT/);
 }
});
test('v2 has independent tracks, shared bindings and two endings; immutable layers do not copy private assets',async()=>{
 const b=await valid();assert.equal(b.narrative.manifest.tracks.inviter.nodes.length,8);assert.equal(b.narrative.manifest.tracks.acceptor.nodes.length,8);assert.equal(b.narrative.manifest.sharedEventBindings.length,3);assert.equal(b.narrative.manifest.endings.length,2);assert.equal(b.narrative.manifest.assets,undefined);
 const same=buildTrackFixture(root);for(const object of b.objects){assert.equal(object.sha256,createHash('sha256').update(object.bytes).digest('hex'));assert.equal(object.sha256,same.objects.find(o=>o.key===object.key).sha256);assert.doesNotMatch(object.bytes.toString(),/"file":|private\/|avatarVersion/);}
 assert.equal(b.narrative.manifest.scene.sha256,b.scene.sha256);assert.equal(b.narrative.manifest.globalPool.sha256,b.pool.sha256);assert.equal(b.events.length,6);
});
for(const kind of ['category','module','camera','expression','bounds','hotspot','asset','script','color','audio','foreground','blank-line','dsl','dependency','role','random-required'])test('publication independently rejects '+kind,async()=>{
 await assert.rejects(valid({mutate(c){const n=c.narrative,b=n.eventBindings[0],p=c.scene.scenePresentation;
 if(kind==='category')n.eligibleCategoryCodes=['missing'];if(kind==='module')c.eventDefinitions[0].manifest.moduleType='execute-script';if(kind==='camera')n.tracks.inviter.nodes[0].presentation.cameraId='missing';if(kind==='expression')n.tracks.inviter.nodes[0].presentation.expression='real-emotion';if(kind==='bounds')p.cameras[0].portrait.height=99;if(kind==='hotspot')n.tracks.inviter.nodes[0].presentation.hotspotIds=['missing'];if(kind==='asset')p.backgroundAsset='private/user';if(kind==='script')p.cameras[0].script='alert(1)';if(kind==='color')p.cameras[0].tint='url(https://other.test)';if(kind==='audio')c.scene.audioCues['fx-gust']='private/photo';if(kind==='foreground')p.foregroundAsset=c.scene.audioAsset;if(kind==='blank-line')n.tracks.inviter.nodes[0].lines[0].text='   ';if(kind==='dsl')b.triggerConditions={script:'true'};if(kind==='dependency')b.triggerConditions={shared_event_completed:'narrative:missing:missing'};if(kind==='role')b.trackScope='shared';if(kind==='random-required')b.probability=.5;
 }}),/INVALID_STORY_CONTENT/);
});
