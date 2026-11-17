import {listenSceneBrowserLifecycle} from '../../src/scene-browser-lifecycle';
import {expect,it} from 'vitest';
import {trackActionPayload,SceneCueFence} from '../../src/scene-event-track';

const snapshot={phase:'playing',storySessionId:'session',eventSeq:5,myTrack:{role:'inviter',nodeId:'i02',areaId:'entrance',revision:2},sharedRevision:3}as const;
const event={bindingId:'narrative:rain:inspect',moduleType:'inspect-object',main:true,trackScope:'inviter',revision:null,needsSharedRevision:false,actions:[{actionId:'flip',label:'翻面',params:{objectId:'paper'}}]}as any;
it('builds only pinned actor action params and the required CAS fields; preview does not invent actor or nextNode',()=>{
 expect(trackActionPayload(snapshot as any,event,event.actions[0])).toEqual({storySessionId:'session',bindingId:event.bindingId,actionId:'flip',params:{objectId:'paper'},expectedTrackRevision:2});
 expect(trackActionPayload(snapshot as any,{...event,needsSharedRevision:true,revision:4},event.actions[0])).toEqual({storySessionId:'session',bindingId:event.bindingId,actionId:'flip',params:{objectId:'paper'},expectedTrackRevision:2,expectedSharedRevision:3,expectedEventRevision:4});
 expect(()=>trackActionPayload({...snapshot,phase:'completed'} as any,event,event.actions[0])).toThrow();
 expect(()=>trackActionPayload(snapshot as any,event,{...event.actions[0],params:{objectId:'other'}})).toThrow();
});
it('authoritative cue plays once after a new commit; initial load, replay, background, restore or new episode never replay an old cue',()=>{
 const fence=new SceneCueFence(),cue={eventSeq:5,steps:[{type:'audio' as const,cueId:'fx-gust'}]};
 expect(fence.accept('session',5,cue,true)).toEqual([]);expect(fence.accept('session',6,{...cue,eventSeq:6},true)).toEqual(cue.steps);
 expect(fence.accept('session',6,{...cue,eventSeq:6},true)).toEqual([]);expect(fence.accept('session',7,{...cue,eventSeq:7},false)).toEqual([]);expect(fence.accept('session',7,{...cue,eventSeq:7},true)).toEqual([]);
 expect(fence.accept('next-session',1,{...cue,eventSeq:1},true)).toEqual([]);
});
it('resume skips the first newly observed snapshot after background and plays only a later foreground commit',()=>{
 const fence=new SceneCueFence(),cue={eventSeq:6,steps:[{type:'audio' as const,cueId:'fx-gust'}]};fence.accept('session',5,undefined,true);fence.suspend();
 expect(fence.accept('session',6,cue,true)).toEqual([]);expect(fence.accept('session',7,{...cue,eventSeq:7},true)).toEqual(cue.steps);
 fence.reset();expect(fence.accept('session',8,{...cue,eventSeq:8},true)).toEqual([]);
});

it('native window without DOM event methods never registers browser listeners',()=>{expect(()=>listenSceneBrowserLifecycle(()=>{},()=>{},{})()).not.toThrow();const events:string[]=[];const off=listenSceneBrowserLifecycle(()=>{},()=>{},{addEventListener:type=>events.push(type),removeEventListener:type=>events.push('remove:'+type)});expect(events).toEqual(['blur','focus']);off();expect(events).toEqual(['blur','focus','remove:blur','remove:focus']);});
