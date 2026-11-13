import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateStory,buildStoryBundle,validateStoryUpgradeTarget,oldGamePurgeStatements} from '../story-content-policy.mjs';
const source=JSON.parse(fs.readFileSync(new URL('../../contracts/story-scenes.json',import.meta.url),'utf8')).stories[0];
const withPresentation=()=>{const story=structuredClone(source);story.scenePresentation={version:'2.5d.v1',backgroundAsset:story.backgroundAsset,cameras:[{id:'wide',scale:1,focus:{x:.5,y:.5},portrait:{x:.5,headY:.08,height:.9},foreground:false,tint:'#8899bb',tintOpacity:.1}],hotspots:[{id:'bookmark',definitionId:'bookmark',label:'翻看手寫書籤',x:.7,y:.8}],foreground:[{id:'desk',x:0,y:.75,width:1,height:.25,color:'#513531'}]};for(const node of story.nodes)node.presentation={cameraId:'wide',expression:'neutral',hotspotIds:['bookmark']};return story;};

test('SD-UT-073/079: presentation references stay inside the versioned story and fixed nonverbal expressions',()=>{
 assert.doesNotThrow(()=>validateStory(withPresentation()));
 for(const mutate of [s=>s.nodes[0].presentation.cameraId='missing',s=>s.nodes[0].presentation.expression='real-emotion',s=>s.scenePresentation.cameras[0].portrait.height=99,s=>s.scenePresentation.hotspots[0].definitionId='reading-path',s=>s.scenePresentation.backgroundAsset='private/user',s=>s.scenePresentation.foreground[0].color='url(https://other.test)',s=>s.nodes[0].presentation.hotspotIds=['missing'],s=>s.scenePresentation.cameras[0].script='alert(1)']){const story=withPresentation();mutate(story);assert.throws(()=>validateStory(story));}
});
test('SD-UT-075: audio cues can only reference bounded public WAV assets in the same manifest',()=>{
 const story=structuredClone(source);story.audioCues={pageTurn:'rain',transition:'rain'};assert.doesNotThrow(()=>validateStory(story));
 for(const mutate of [s=>s.audioCues.pageTurn='private/account/photo',s=>s.audioCues.transition='rain-bookshop',s=>s.audioCues.script='play()']){const bad=structuredClone(story);mutate(bad);assert.throws(()=>validateStory(bad));}
});
test('registered foreground accepts only an image from the same bounded content manifest',()=>{
 const story=withPresentation();story.scenePresentation.foregroundAsset=story.backgroundAsset;assert.doesNotThrow(()=>validateStory(story));
 for(const id of ['rain','private/user','https://other.test/table.png']){story.scenePresentation.foregroundAsset=id;assert.throws(()=>validateStory(story));}
});
test('SD-UT-019/030: version bundle validates graph, content hash and original assets',()=>{
 const bundle=buildStoryBundle(source,new URL('../../',import.meta.url));assert.equal(bundle.manifest.storyId,'scene-01');assert.equal(bundle.assets.length,source.assets.length);assert.match(bundle.sha256,/^[0-9a-f]{64}$/);
});
for(const mutation of ['missing','loop','private','tag','hash','ending','entry'])test(`SD-IT-034/035 content rejects ${mutation} before publication`,()=>{
 const story=structuredClone(source);
 if(mutation==='entry'){story.entry='other-start';story.nodes[0].id='other-start';}
 if(mutation==='missing')story.nodes[0].choices[0].next='missing';
 if(mutation==='loop')story.nodes[0].choices[0].next='entry';
 if(mutation==='private')story.assets[0].key='private/photos/member';
 if(mutation==='tag')story.interestTagIds=['invented_tag'];
 if(mutation==='hash')story.assets[0].sha256='f'.repeat(64);
 if(mutation==='ending')story.nodes=story.nodes.filter(n=>!n.ending);
 assert.throws(()=>buildStoryBundle(story,new URL('../../',import.meta.url)));
});
test('SD-UT-042: purge policy only accepts known local DatingHigh instance and only three old game tables',()=>{
 const config={name:'datinghigh-local',vars:{APP_ENV:'local'},d1_databases:[{binding:'DB',database_name:'datinghigh-local',database_id:'local-foundation'}]};
 assert.doesNotThrow(()=>validateStoryUpgradeTarget(config));
 for(const env of ['production','staging','unknown'])assert.throws(()=>validateStoryUpgradeTarget({...config,vars:{APP_ENV:env}}));
 assert.throws(()=>validateStoryUpgradeTarget({...config,d1_databases:[{binding:'DB',database_name:'another-project'}]}));
 const sql=oldGamePurgeStatements().join(';');assert.doesNotMatch(sql,/DELETE FROM (auth_|user_)/);assert.match(sql,/game_round_participants/);
});
