// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
import {SceneStoryMotion} from '../../src/SceneStoryMotion';
import {Animated} from 'react-native';
const frame={left:0,top:0,width:800,height:450};
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});
it('an off-screen object cue remains a visible local close-up on a narrow stage without modifying its world coordinates',()=>{
 vi.spyOn(Animated,'timing').mockReturnValue({start:()=>{},stop:()=>{},reset:()=>{}} as any);
 const object={id:'paper',label:'紙單',rendererId:'paper' as const,x:.1,y:.43,areaId:'entrance',state:'wet',holderRole:null};
 render(<SceneStoryMotion viewport={{width:360,height:740}} frame={{left:-1000,top:0,width:2000,height:740}} objects={[object]} steps={[{type:'object',objectId:'paper',fromAreaId:'entrance',toAreaId:'entrance',motion:'flip',durationMs:900}]} onStep={vi.fn()} onFinish={vi.fn()}/>);
 const sprite=screen.getByTestId('scene-story-motion').firstElementChild as HTMLElement;
 expect(parseFloat(sprite.style.left)).toBeGreaterThanOrEqual(96);expect(parseFloat(sprite.style.left)+176).toBeLessThanOrEqual(360);expect(parseFloat(sprite.style.top)).toBeGreaterThanOrEqual(200);expect(parseFloat(sprite.style.top)+76).toBeLessThanOrEqual(370);
 expect(object).toMatchObject({x:.1,y:.43,state:'wet',areaId:'entrance'});
});
it('SEF-UT-520 partial: published V3 book movement uses the pinned physical image instead of the legacy vector book',()=>{
 vi.spyOn(Animated,'timing').mockReturnValue({start:()=>{},stop:()=>{},reset:()=>{}} as any);
 const book={id:'rain-book',label:'原創故事書',assetId:'cover-id',x:.2,y:.43,areaId:'shelves',state:'held',holderRole:null};
 render(<SceneStoryMotion viewport={{width:800,height:450}} frame={frame} objects={[book]} asset={id=>id==='cover-id'?'/published-cover.png':undefined} steps={[{type:'object',objectId:'rain-book',fromAreaId:'shelves',toAreaId:'safe-storage',motion:'slide',durationMs:200}]} onStep={vi.fn()} onFinish={vi.fn()}/>);
 expect(screen.getByTestId('scene-motion-image').querySelector('img')?.getAttribute('src')).toContain('published-cover.png');
 expect(screen.queryByText('原創故事書')).toBeNull();
});
it('SEF-UT-521 partial: V3 does not silently substitute an unrelated vector book when the referenced source is missing',()=>{
 vi.spyOn(Animated,'timing').mockReturnValue({start:()=>{},stop:()=>{},reset:()=>{}} as any);
 const book={id:'rain-book',label:'原創故事書',assetId:'missing-cover',x:.2,y:.43,areaId:'shelves',state:'held',holderRole:null};
 render(<SceneStoryMotion viewport={{width:800,height:450}} frame={frame} objects={[book]} asset={()=>undefined} steps={[{type:'object',objectId:'rain-book',fromAreaId:'shelves',toAreaId:'safe-storage',motion:'slide',durationMs:200}]} onStep={vi.fn()} onFinish={vi.fn()}/>);
 expect(screen.queryByTestId('scene-motion-image')).toBeNull();
 expect(screen.getByText('場景演出素材尚未就緒')).toBeTruthy();
});
it('plays bounded committed steps in order and finishes once without making a new story operation',()=>{
 vi.useFakeTimers();const step=vi.fn(),finish=vi.fn();
 render(<SceneStoryMotion frame={frame} objects={[]} steps={[{type:'pause',durationMs:100},{type:'expression',role:'acceptor',expression:'concerned'},{type:'character',role:'inviter',areaId:'counter',x:.34,visible:true,durationMs:200}]} onStep={step} onFinish={finish}/>);
 expect(step.mock.calls.map(([s])=>s.type)).toEqual(['pause']);act(()=>vi.advanceTimersByTime(301));
 expect(step.mock.calls.map(([s])=>s.type)).toEqual(['pause','expression','character']);expect(finish).toHaveBeenCalledTimes(1);expect(screen.queryByTestId('scene-story-motion')).toBeNull();
 act(()=>vi.advanceTimersByTime(5000));expect(finish).toHaveBeenCalledTimes(1);
});
it.each(['skip','blur'])('a real %s cancels the remaining cue and restores the stage once; focus cannot restart it',mode=>{
 vi.useFakeTimers();const step=vi.fn(),finish=vi.fn();
 render(<SceneStoryMotion frame={frame} objects={[]} steps={[{type:'pause',durationMs:500},{type:'expression',role:'inviter',expression:'smile'}]} onStep={step} onFinish={finish}/>);
 if(mode==='skip')fireEvent.click(screen.getByLabelText('略過演出'));else fireEvent(window,new Event('blur'));
 fireEvent(window,new Event('focus'));act(()=>vi.advanceTimersByTime(5000));expect(step).toHaveBeenCalledTimes(1);expect(finish).toHaveBeenCalledTimes(1);expect(screen.queryByTestId('scene-story-motion')).toBeNull();
});
it('replacing the episode unmounts a pending cue without emitting its old completion or later character effects',()=>{
 vi.useFakeTimers();const step=vi.fn(),finish=vi.fn();const view=render(<SceneStoryMotion frame={frame} objects={[]} steps={[{type:'pause',durationMs:500},{type:'expression',role:'inviter',expression:'smile'}]} onStep={step} onFinish={finish}/>);
 view.unmount();act(()=>vi.advanceTimersByTime(5000));expect(step).toHaveBeenCalledTimes(1);expect(finish).not.toHaveBeenCalled();
});
