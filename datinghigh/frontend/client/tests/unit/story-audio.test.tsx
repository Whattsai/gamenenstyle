// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
const state=vi.hoisted(()=>({players:new Map<string,any>(),background:(_state:string)=>{}}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),AppState:{addEventListener:(_e:string,cb:any)=>{state.background=cb;return{remove:vi.fn()};}}}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-audio',()=>({useAudioPlayer:(url:string)=>{if(!state.players.has(url))state.players.set(url,{play:vi.fn(),pause:vi.fn(),seekTo:vi.fn().mockResolvedValue(undefined),volume:0,loop:false});return state.players.get(url);},useAudioPlayerStatus:()=>({playing:false})}));
import {StoryAudio} from '../../src/StoryAudio';
afterEach(()=>{cleanup();state.players.clear();});
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
