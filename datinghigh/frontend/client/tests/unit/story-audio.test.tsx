// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {act,render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
const state=vi.hoisted(()=>({players:new Map<string,any>(),background:(_state:string)=>{}}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),AppState:{addEventListener:(_e:string,cb:any)=>{state.background=cb;return{remove:vi.fn()};}}}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-audio',()=>({useAudioPlayer:(url:string)=>{if(!state.players.has(url))state.players.set(url,{play:vi.fn(),pause:vi.fn(),seekTo:vi.fn().mockResolvedValue(undefined),volume:0,loop:false});return state.players.get(url);},useAudioPlayerStatus:()=>({playing:false})}));
import {StoryAudio} from '../../src/StoryAudio';
afterEach(()=>{cleanup();state.players.clear();vi.useRealTimers();});
it('original indoor music and rain share one user gesture, fade by area and both stop in background',async()=>{
 vi.useFakeTimers();const view=render(<StoryAudio url="rain" musicUrl="music" mix={{ambienceGain:1,musicGain:0}}/>);expect(state.players.has('music')).toBe(true);
 const rain=state.players.get('rain'),music=state.players.get('music');expect(music.play).not.toHaveBeenCalled();fireEvent.click(screen.getByLabelText('開啟場景聲音'));expect(rain.play).toHaveBeenCalledOnce();expect(music.play).toHaveBeenCalledOnce();expect(music.volume).toBe(0);
 view.rerender(<StoryAudio url="rain" musicUrl="music" mix={{ambienceGain:.3,musicGain:.6}}/>);await act(async()=>{await vi.advanceTimersByTimeAsync(500);});expect(rain.volume).toBeCloseTo(.09);expect(music.volume).toBeCloseTo(.18);expect(music.play).toHaveBeenCalledOnce();
 act(()=>state.background('background'));expect(rain.pause).toHaveBeenCalled();expect(music.pause).toHaveBeenCalled();expect(screen.getByLabelText('開啟場景聲音')).toBeTruthy();
});
it('SD-UT-075/076: audio requires a gesture, changes volume, plays local node cues and stops in background',async()=>{
 const view=render(<StoryAudio url="rain" cueUrl="page" cueId="entry"/>),rain=state.players.get('rain'),page=state.players.get('page');
 expect(rain.play).not.toHaveBeenCalled();expect(page.play).not.toHaveBeenCalled();
 fireEvent.click(screen.getByLabelText('開啟場景聲音'));expect(rain.play).toHaveBeenCalledTimes(1);
 fireEvent.click(screen.getByLabelText('提高音量'));expect(rain.volume).toBeCloseTo(.4);expect(page.volume).toBeCloseTo(.4);
 view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="icebreak"/>);await waitFor(()=>expect(page.play).toHaveBeenCalledTimes(1));
 state.background('background');expect(rain.pause).toHaveBeenCalled();expect(page.pause).toHaveBeenCalled();
 await screen.findByLabelText('開啟場景聲音');view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="shelves"/>);expect(page.play).toHaveBeenCalledTimes(1);
});
it('SD-UT-076: rejected audio remains muted with a usable retry and does not affect story state',async()=>{
 render(<StoryAudio url="rain"/>);state.players.get('rain').play.mockImplementation(()=>{throw Error('platform rejected audio');});
 fireEvent.click(screen.getByLabelText('開啟場景聲音'));await screen.findByText('聲音暫時無法播放，仍可繼續故事。');expect(screen.getByLabelText('開啟場景聲音')).toBeTruthy();
});
it('an event sequence plays at most once and restoring the base cue cannot replay old sound',async()=>{
 const view=render(<StoryAudio url="rain" cueUrl="page" cueId="story:entry"/>),page=state.players.get('page');fireEvent.click(screen.getByLabelText('開啟場景聲音'));
 view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="story:event:8"/>);await waitFor(()=>expect(page.play).toHaveBeenCalledTimes(1));
 view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="story:entry"/>);view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="story:event:8"/>);
 await Promise.resolve();expect(page.play).toHaveBeenCalledTimes(1);
});
it('loading a different event sound keeps explicitly enabled ambience playing and starts the new cue once',async()=>{
 const view=render(<StoryAudio url="rain" cueId="entry"/>),rain=state.players.get('rain');fireEvent.click(screen.getByLabelText('開啟場景聲音'));
 view.rerender(<StoryAudio url="rain" cueUrl="doorbell" cueId="event:1"/>);await waitFor(()=>expect(state.players.get('doorbell').play).toHaveBeenCalledTimes(1));
 expect(rain.pause).not.toHaveBeenCalled();expect(screen.getByLabelText('靜音場景聲音')).toBeTruthy();
 view.rerender(<StoryAudio url="rain" cueUrl="paper" cueId="event:2"/>);await waitFor(()=>expect(state.players.get('paper').play).toHaveBeenCalledTimes(1));
 expect(state.players.get('doorbell').pause).toHaveBeenCalled();expect(rain.pause).not.toHaveBeenCalled();
});
it('a late seek failure from an older cue cannot mute the current successfully playing cue',async()=>{
 const view=render(<StoryAudio url="rain" cueUrl="page" cueId="entry"/>),rain=state.players.get('rain'),page=state.players.get('page');let rejectOld:(error:Error)=>void=()=>{};
 fireEvent.click(screen.getByLabelText('開啟場景聲音'));page.seekTo.mockImplementationOnce(()=>new Promise((_resolve,reject)=>{rejectOld=reject;}));
 view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="event:1"/>);await waitFor(()=>expect(page.seekTo).toHaveBeenCalledTimes(1));
 view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="event:2"/>);await waitFor(()=>expect(page.play).toHaveBeenCalledTimes(1));
 await act(async()=>{rejectOld(Error('Old seek failed after the next cue'));await Promise.resolve();});
 expect(screen.getByLabelText('靜音場景聲音')).toBeTruthy();expect(screen.queryByText('聲音暫時無法播放，仍可繼續故事。')).toBeNull();expect(rain.pause).not.toHaveBeenCalled();
});

it('a real web blur pauses ambient and pending cues; focus never resumes and unmount removes the listener',async()=>{
 const view=render(<StoryAudio url="rain" cueUrl="page" cueId="entry"/>),rain=state.players.get('rain'),page=state.players.get('page');let completeSeek:()=>void=()=>{};
 fireEvent.click(screen.getByLabelText('開啟場景聲音'));page.seekTo.mockImplementationOnce(()=>new Promise<void>(resolve=>{completeSeek=resolve;}));view.rerender(<StoryAudio url="rain" cueUrl="page" cueId="event:1"/>);await waitFor(()=>expect(page.seekTo).toHaveBeenCalledTimes(1));
 fireEvent(window,new Event('blur'));expect(rain.pause).toHaveBeenCalled();expect(page.pause).toHaveBeenCalled();expect(screen.getByLabelText('開啟場景聲音')).toBeTruthy();
 await act(async()=>{completeSeek();await Promise.resolve();});expect(page.play).not.toHaveBeenCalled();fireEvent(window,new Event('focus'));expect(rain.play).toHaveBeenCalledTimes(1);expect(screen.getByLabelText('開啟場景聲音')).toBeTruthy();
 view.unmount();rain.pause.mockClear();page.pause.mockClear();fireEvent(window,new Event('blur'));expect(rain.pause).not.toHaveBeenCalled();expect(page.pause).not.toHaveBeenCalled();
});
