// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,cleanup,fireEvent} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
import {ADVStage} from '../../src/ADVStage';
import type {StoryNode} from '../../src/story';
afterEach(cleanup);
const node:StoryNode={id:'entry',title:'雨落書店',visual:'evening',lines:[{speaker:'旁白',text:'你推開門。'},{speaker:'店員・NPC',text:'歡迎光臨。'}],choices:[{id:'enter',label:'走近書架',next:'shelves'}]};
it('SD-UT-051: the scene uses the local first-person view and displays only the authorized partner',()=>{
 render(<ADVStage node={node} partner={{name:'對方',source:{uri:'data:image/png;base64,Ag=='}}} disabled={false} choose={vi.fn()}/>);
 expect(screen.queryByLabelText('本人的遊戲立繪')).toBeNull();
 expect(screen.getByLabelText('對方的遊戲立繪')).toBeTruthy();
 expect(screen.queryByText('本人')).toBeNull();
});
it('SD-UT-074: skipping local performance exposes choices without submitting server progress',async()=>{
 const choose=vi.fn();render(<ADVStage node={node} disabled={false} choose={choose}/>);
 fireEvent.click(screen.getByLabelText('對話框，點擊繼續'));
 expect(await screen.findByText('你推開門。')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('略過'));
 expect(await screen.findByText('歡迎光臨。')).toBeTruthy();
 await screen.findByLabelText('走近書架');expect(choose).not.toHaveBeenCalled();
 fireEvent.click(screen.getByLabelText('走近書架'));expect(choose).toHaveBeenCalledWith('enter');
});
