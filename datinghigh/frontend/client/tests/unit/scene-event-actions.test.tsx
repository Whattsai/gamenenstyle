// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
import {SceneEventActions} from '../../src/SceneEventActions';
afterEach(cleanup);
const snapshot:any={world:{objects:[],flags:{}},phase:'playing',storySessionId:'session',myTrack:{role:'inviter',nodeId:'i02',areaId:'entrance',revision:2},sharedRevision:3,areas:[{id:'entrance',title:'門口'},{id:'counter',title:'櫃檯'}],knownClues:[{id:'paper',text:'27／海邊的……'}],cooperation:[],availableEvents:[{bindingId:'narrative:rain:inspect-slip',trackScope:'inviter',moduleType:'inspect-object',main:true,revision:null,needsSharedRevision:false,actions:[{actionId:'flip',label:'翻看取書單背面',params:{objectId:'paper'}}]}]};
it('shows only caller actions and clues; button sends the authored action once and disabled state prevents submission',()=>{
 const submit=vi.fn();const view=render(<SceneEventActions experience={snapshot} disabled={false} onSubmit={submit}/>);expect(screen.getByText('門口')).toBeTruthy();expect(screen.getByText('27／海邊的……')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'翻看取書單背面'}));expect(submit).toHaveBeenCalledTimes(1);expect(submit.mock.calls[0][0].bindingId).toBe('narrative:rain:inspect-slip');
 view.rerender(<SceneEventActions experience={snapshot} disabled onSubmit={submit}/>);fireEvent.click(screen.getByRole('button',{name:'翻看取書單背面'}));expect(submit).toHaveBeenCalledTimes(1);
});
it('completed chapter removes all old actions and keeps the caller ending text without another completion button',()=>{
 render(<SceneEventActions experience={{...snapshot,phase:'completed',chapterStatus:'completed'}} disabled={false} onSubmit={vi.fn()}/>);expect(screen.queryByRole('button',{name:'翻看取書單背面'})).toBeNull();expect(screen.queryByRole('button',{name:'完成劇情'})).toBeNull();
});
it('marks the shop clerk as NPC and never turns an option into a partner chat message',()=>{
 render(<SceneEventActions experience={{...snapshot,availableEvents:[{...snapshot.availableEvents[0],moduleType:'talk-to-npc',lines:[{speaker:'店員・NPC',text:'我翻一下預訂簿。'}]}]}} disabled={false} onSubmit={vi.fn()}/>);expect(screen.getByText('店員・NPC')).toBeTruthy();expect(screen.getByText('我翻一下預訂簿。')).toBeTruthy();expect(screen.queryByText('對方已傳送')).toBeNull();
});
