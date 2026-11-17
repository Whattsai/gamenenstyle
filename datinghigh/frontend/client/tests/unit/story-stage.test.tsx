// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),useWindowDimensions:()=>({width:window.innerWidth,height:window.innerHeight,scale:1,fontScale:1})}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
import {StoryStage} from '../../src/StoryStage';
import {ADVStage} from '../../src/ADVStage';
import source from '../../../../contracts/rain-bookshop-last-order.json';
import type {ScenePresentation} from '../../src/story-stage-geometry';
import {Animated} from 'react-native';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
const scene={...source.scene.scenePresentation,hotspots:[{id:'paper',definitionId:'pickup-slip-27',label:'濕紙單',x:.45,y:.42}]} as ScenePresentation;
it('a player can stop decorative motion on a slow device while the same camera and interactive scene remain available',()=>{
 const inspect=vi.fn();render(<StoryStage presentation={scene} cameraId="shelves" hotspotIds={['paper']} safeToSwap onInspect={inspect}/>);
 fireEvent.click(screen.getByLabelText('關閉場景微動'));expect(screen.getByLabelText('開啟場景微動')).toBeTruthy();
 expect(screen.queryByTestId('scene-atmosphere')).toBeNull();expect(screen.getByTestId('scene-camera-shelves')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('場景物件：濕紙單'));expect(inspect).toHaveBeenCalledExactlyOnceWith('pickup-slip-27');
 fireEvent.click(screen.getByLabelText('開啟場景微動'));expect(screen.getByTestId('scene-atmosphere')).toBeTruthy();
});
it('registered raster foreground uses the same camera transform as the background and stays above the partner',()=>{
 render(<StoryStage presentation={scene} cameraId="shelves" hotspotIds={[]} background="https://content.test/background" foreground="https://content.test/table" safeToSwap onInspect={vi.fn()}/>);
 const background=screen.getByTestId('scene-background'),foreground=screen.getByTestId('scene-foreground-art');
 for(const name of ['left','top','width','height'])expect((foreground as HTMLElement).style[name as 'left']).toBe((background as HTMLElement).style[name as 'left']);
 expect(background.compareDocumentPosition(foreground)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
it('SD-UT-071/072: visible scene hotspot opens local inspection; the stage does not submit a choice',()=>{
 const inspect=vi.fn();render(<StoryStage presentation={scene} cameraId="shelves" hotspotIds={['paper']} background="https://content.test/background" safeToSwap onInspect={inspect}/>);
 fireEvent.click(screen.getByLabelText('場景物件：濕紙單'));expect(inspect).toHaveBeenCalledExactlyOnceWith('pickup-slip-27');
 expect(screen.getByTestId('scene-foreground')).toBeTruthy();expect(screen.queryByText('已提交')).toBeNull();
});
it('SD-UT-073/078: the two authoritative ending cameras differ in distance, lighting and foreground; a resize keeps narration outside the scene',()=>{
 const view=render(<StoryStage presentation={scene} cameraId="shelves" hotspotIds={[]} safeToSwap onInspect={vi.fn()}/>);
 expect(screen.getByTestId('scene-camera-shelves')).toBeTruthy();expect(screen.getByTestId('scene-foreground')).toBeTruthy();
 view.rerender(<StoryStage presentation={scene} cameraId="entrance" hotspotIds={[]} safeToSwap onInspect={vi.fn()}/>);
 expect(screen.getByTestId('scene-camera-entrance')).toBeTruthy();expect(screen.queryByTestId('scene-foreground')).toBeNull();expect(screen.queryByText('旁白')).toBeNull();
});
it('narrow portrait viewports expose horizontal pan controls and keep the partner anchored to the scene floor',()=>{
 const originalWidth=window.innerWidth;Object.defineProperty(window,'innerWidth',{configurable:true,value:390});
 try{
  render(<StoryStage presentation={scene} cameraId="shelves" hotspotIds={['paper']} background="https://content.test/background" foreground="https://content.test/table" partner={{name:'對方',source:{uri:'data:image/png;base64,Ag=='}}} height={490} safeToSwap onInspect={vi.fn()}/>);
  const background=screen.getByTestId('scene-background') as HTMLElement,foreground=screen.getByTestId('scene-foreground-art') as HTMLElement,partner=screen.getByTestId('scene-partner') as HTMLElement;
  const centerLeft=parseFloat(background.style.left),relativePartnerOffset=parseFloat(partner.style.left)-centerLeft;
  fireEvent.click(screen.getByLabelText('環視左側場景'));
  expect(parseFloat(background.style.left)).toBeGreaterThan(centerLeft);
  expect(foreground.style.left).toBe(background.style.left);
  expect(parseFloat(partner.style.left)-parseFloat(background.style.left)).toBeCloseTo(relativePartnerOffset,2);
  fireEvent.click(screen.getByLabelText('環視右側場景'));
  expect(parseFloat(background.style.left)).toBeLessThan(centerLeft);
  expect(foreground.style.left).toBe(background.style.left);
  expect(parseFloat(partner.style.left)-parseFloat(background.style.left)).toBeCloseTo(relativePartnerOffset,2);
  fireEvent.click(screen.getByLabelText('重設場景視角'));
  expect(parseFloat(background.style.left)).toBeCloseTo(centerLeft,1);
 }finally{Object.defineProperty(window,'innerWidth',{configurable:true,value:originalWidth});}
});
it('SEF ambient and story motion are independent; stopping rain keeps authoritative objects and a necessary gust visible',()=>{
 // RN Web 的 test driver 會立即結束動畫；固定保留演出中狀態，驗證兩個開關互不影響。
 vi.spyOn(Animated,'timing').mockReturnValue({start:()=>{},stop:()=>{},reset:()=>{}} as any);
 render(<StoryStage presentation={scene} cameraId="shelves" hotspotIds={[]} safeToSwap onInspect={vi.fn()} track={{actorRole:'inviter',areaId:'counter',world:{objects:[{id:'tag',label:'27號標籤',areaId:'counter',holderRole:null,state:'on-counter',rendererId:'tag',x:.5,y:.4}],flags:{}},steps:[{type:'object',objectId:'tag',fromAreaId:'counter',toAreaId:'window',motion:'gust',durationMs:900}],onDrop:vi.fn()}}/>);
 expect(screen.getByTestId('scene-story-motion')).toBeTruthy();fireEvent.click(screen.getByLabelText('關閉場景微動'));expect(screen.queryByTestId('scene-atmosphere')).toBeNull();expect(screen.getByTestId('scene-story-motion')).toBeTruthy();
});
it('SEF shared area uses both authorized full-body portraits and hiding the partner leaves no ghost image',()=>{
 const own={name:'你',source:{uri:'data:image/png;base64,AQ=='}},partner={name:'對方',source:{uri:'data:image/png;base64,Ag=='}};
 const view=render(<StoryStage presentation={scene} hotspotIds={[]} safeToSwap partner={partner} onInspect={vi.fn()} track={{actorRole:'inviter',areaId:'counter',world:{objects:[],flags:{}},own,onDrop:vi.fn()}}/>);expect(screen.getByTestId('scene-own-avatar')).toBeTruthy();expect(screen.getByTestId('scene-partner')).toBeTruthy();
 view.rerender(<StoryStage presentation={scene} hotspotIds={[]} safeToSwap onInspect={vi.fn()} track={{actorRole:'inviter',areaId:'counter',world:{objects:[],flags:{}},own,onDrop:vi.fn()}}/>);expect(screen.queryByTestId('scene-partner')).toBeNull();
});
it('cancelling a finite cue restores the base camera immediately, even if the next node uses the same base camera',()=>{
 const track={actorRole:'inviter' as const,areaId:'counter',world:{objects:[],flags:{}},steps:[] as import('../../src/scene-event-track').PresentationStep[],onDrop:vi.fn()};
 const props={presentation:scene,cameraId:'shelves',hotspotIds:[],safeToSwap:true,onInspect:vi.fn(),track};
 const view=render(<StoryStage {...props}/>);
 view.rerender(<StoryStage {...props} track={{...track,steps:[{type:'camera',cameraId:'counter',durationMs:3000}]}}/>);expect(screen.getByTestId('scene-camera-counter')).toBeTruthy();
 view.rerender(<StoryStage {...props}/>);expect(screen.queryByTestId('scene-camera-counter')).toBeNull();expect(screen.getByTestId('scene-camera-shelves')).toBeTruthy();
});
it('a new story session with the same entry camera resets local panning while preserving the ambient preference',()=>{
 const node={...source.narrative.tracks.inviter.nodes[0],objects:[],choices:[],visual:'bookshop'} as import('../../src/story').StoryNode;
 const props={node,storySessionId:'first',disabled:false,stageHeight:680,scene:{presentation:scene,background:'data:image/png;base64,AQ=='}};
 const view=render(<ADVStage {...props}/>);const base=parseFloat(screen.getByTestId('scene-background').style.left);
 fireEvent.click(screen.getByLabelText('關閉場景微動'));fireEvent.click(screen.getByLabelText('環視左側場景'));expect(parseFloat(screen.getByTestId('scene-background').style.left)).not.toBeCloseTo(base,1);
 view.rerender(<ADVStage {...props} storySessionId="second"/>);expect(parseFloat(screen.getByTestId('scene-background').style.left)).toBeCloseTo(base,1);expect(screen.getByLabelText('開啟場景微動')).toBeTruthy();
});
