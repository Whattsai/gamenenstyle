// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),useWindowDimensions:()=>({width:window.innerWidth,height:window.innerHeight,scale:1,fontScale:1})}));
import {StoryStage} from '../../src/StoryStage';
import source from '../../../../contracts/story-scenes.json';
import type {ScenePresentation} from '../../src/story-stage-geometry';
afterEach(cleanup);
const scene=source.stories[0].scenePresentation as ScenePresentation;
it('a player can stop decorative motion on a slow device while the same camera and interactive scene remain available',()=>{
 const inspect=vi.fn();render(<StoryStage presentation={scene} cameraId="table-medium" hotspotIds={['bookmark']} safeToSwap onInspect={inspect}/>);
 fireEvent.click(screen.getByLabelText('關閉場景微動'));expect(screen.getByLabelText('開啟場景微動')).toBeTruthy();
 expect(screen.queryByTestId('scene-atmosphere')).toBeNull();expect(screen.getByTestId('scene-camera-table-medium')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('場景物件：翻看手寫書籤'));expect(inspect).toHaveBeenCalledExactlyOnceWith('bookmark');
 fireEvent.click(screen.getByLabelText('開啟場景微動'));expect(screen.getByTestId('scene-atmosphere')).toBeTruthy();
});
it('registered raster foreground uses the same camera transform as the background and stays above the partner',()=>{
 render(<StoryStage presentation={scene} cameraId="table-medium" hotspotIds={[]} background="https://content.test/background" foreground="https://content.test/table" safeToSwap onInspect={vi.fn()}/>);
 const background=screen.getByTestId('scene-background'),foreground=screen.getByTestId('scene-foreground-art');
 for(const name of ['left','top','width','height'])expect((foreground as HTMLElement).style[name as 'left']).toBe((background as HTMLElement).style[name as 'left']);
 expect(background.compareDocumentPosition(foreground)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
it('SD-UT-071/072: visible scene hotspot opens local inspection; the stage does not submit a choice',()=>{
 const inspect=vi.fn();render(<StoryStage presentation={scene} cameraId="table-medium" hotspotIds={['bookmark']} background="https://content.test/background" safeToSwap onInspect={inspect}/>);
 fireEvent.click(screen.getByLabelText('場景物件：翻看手寫書籤'));expect(inspect).toHaveBeenCalledExactlyOnceWith('bookmark');
 expect(screen.getByTestId('scene-foreground')).toBeTruthy();expect(screen.queryByText('已提交')).toBeNull();
});
it('SD-UT-073/078: the two authoritative ending cameras differ in distance, lighting and foreground; a resize keeps narration outside the scene',()=>{
 const view=render(<StoryStage presentation={scene} cameraId="together-warm" hotspotIds={[]} safeToSwap onInspect={vi.fn()}/>);
 expect(screen.getByTestId('scene-camera-together-warm')).toBeTruthy();expect(screen.getByTestId('scene-foreground')).toBeTruthy();
 view.rerender(<StoryStage presentation={scene} cameraId="two-pages-blue" hotspotIds={[]} safeToSwap onInspect={vi.fn()}/>);
 expect(screen.getByTestId('scene-camera-two-pages-blue')).toBeTruthy();expect(screen.queryByTestId('scene-foreground')).toBeNull();expect(screen.queryByText('旁白')).toBeNull();
});
it('narrow portrait viewports expose horizontal pan controls and keep the partner anchored to the scene floor',()=>{
 const originalWidth=window.innerWidth;Object.defineProperty(window,'innerWidth',{configurable:true,value:390});
 try{
  render(<StoryStage presentation={scene} cameraId="table-medium" hotspotIds={['bookmark']} background="https://content.test/background" foreground="https://content.test/table" partner={{name:'對方',source:{uri:'data:image/png;base64,Ag=='}}} height={490} safeToSwap onInspect={vi.fn()}/>);
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
