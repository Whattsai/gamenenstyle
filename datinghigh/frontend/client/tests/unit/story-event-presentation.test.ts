import {expect,it} from 'vitest';
import scenes from '../../../../contracts/story-scenes.json';
import type {StoryExperience} from '../../src/story';
import {eventPresentation} from '../../src/story-event-presentation';
const snapshot=()=>({phase:'playing',roundId:'round',storySessionId:'story',episodeSeq:1,eventSeq:9,chapterStatus:'playing',currentNode:{...scenes.stories[0].nodes[0],presentation:{cameraId:'table-medium',expression:'neutral',hotspotIds:['bookmark']}},scenePresentation:scenes.stories[0].scenePresentation,audioCues:scenes.stories[0].audioCues,events:[{bindingId:'scene:rain:note',eventInstanceId:'instance',eventSeq:8,revision:1,main:true,status:'active',definition:{id:'note',version:'v1',moduleType:'inspect-object',title:'書頁',prompt:'看一看',options:[]},presentationEffects:{cameraId:'note-close',expressionId:'thoughtful',audioCueId:'pageTurn',hotspotVisibility:{bookmark:false}}}]} as StoryExperience);
it('active committed effects overlay the pinned base and restore it on cancellation or completion without mutation',()=>{
 const source=snapshot(),before=structuredClone(source),result=eventPresentation(source);
 expect(result.node?.presentation).toEqual({cameraId:'note-close',expression:'thoughtful',hotspotIds:[]});expect(result.cue).toEqual({key:'story:event:8',assetId:'page-turn'});expect(source).toEqual(before);
 source.events![0].status='cancelled';expect(eventPresentation(source).node).toEqual(source.currentNode);expect(eventPresentation(source).cue).toBeUndefined();
 source.events![0].status='active';source.chapterStatus='completed';expect(eventPresentation(source).node).toEqual(source.currentNode);
});
it('unknown presentation references cannot create a camera, sound URL or hidden hotspot',()=>{
 const source=snapshot();source.events![0].presentationEffects={cameraId:'unpublished',audioCueId:'https://private.invalid',hotspotVisibility:{secret:true}};
 const result=eventPresentation(source);expect(result.node?.presentation).toEqual(source.currentNode!.presentation);expect(result.cue).toBeUndefined();
});

it('free event previews use only an already active binding and closing restores the base without writing',()=>{const source=snapshot();source.events![0].main=false;expect(eventPresentation(source).node).toEqual(source.currentNode);expect(eventPresentation(source,source.events![0].bindingId).node?.presentation?.cameraId).toBe('note-close');expect(eventPresentation(source).node).toEqual(source.currentNode);});
