// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
import {ApiFailure} from '../../src/api';
const state=vi.hoisted(()=>({focused:true,request:vi.fn(),router:{push:vi.fn(),replace:vi.fn()},params:{roundId:'round'},account:{accountId:'owner'} as {accountId:string}|undefined}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-router',()=>({useRouter:()=>state.router,useLocalSearchParams:()=>state.params,useFocusEffect:(effect:()=>void)=>React.useEffect(()=>state.focused?effect():undefined,[effect,state.focused])}));
vi.mock('expo-crypto',()=>({getRandomValues:(bytes:Uint8Array<ArrayBuffer>)=>crypto.getRandomValues(bytes)}));
vi.mock('../../src/session',()=>({useSession:()=>({ready:true}),api:{get account(){return state.account;},sessionId:'session',request:state.request,serverNow:Date.now()}}));
vi.mock('../../src/pending-back-guard',()=>({usePendingBackGuard:()=>{}}));
vi.mock('../../src/avatar-assets',()=>({avatarAssets:{}}));
import {MatchingScreen,MatchingStartScreen,GameRoundScreen} from '../../src/MatchingScreen';
const persona={nickname:'星河旅人',bio:'喜歡咖啡',traitTagIds:['warm'],interestTagIds:['coffee'],selectedAvatarType:'builtin',selectedAvatarRef:'male-01'};
let invites:any;
beforeEach(()=>{
 vi.clearAllMocks();state.focused=true;state.account={accountId:'owner'};invites={incoming:[],outgoing:[]};
 state.request.mockImplementation(async(path:string)=>{
  if(path==='/game-rounds')return {items:[]};if(path==='/me/dating-profile')return {profileReady:true};
  if(path==='/match-invitations')return invites;
  if(path==='/match-candidates/search')return {items:[{candidateId:'candidate',score:75}],nextOffset:null};
  if(path==='/match-candidates/candidate')return {candidateId:'candidate',score:75,persona};
  throw new Error('Unexpected test request');
 });
});
afterEach(cleanup);
it.each([[false,[],'/profile'],[true,[],'/matching'],[false,[{roundId:'round'}],'/game-round/round']])('MS-UT-055 login routes profile=%s, rounds=%j',async(profileReady,items,destination)=>{
 state.request.mockImplementation(async(path:string)=>path==='/game-rounds'?{items}:{profileReady});render(<MatchingStartScreen/>);
 await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith(destination));
});
it('MS-UT-055 unknown login status offers retry without assuming readiness',async()=>{
 state.request.mockRejectedValue(new ApiFailure('DEPENDENCY_UNAVAILABLE',503));render(<MatchingStartScreen/>);
 await screen.findByText('目前無法確認配對狀態，請重試');expect(state.router.replace).not.toHaveBeenCalled();
});
it('MS-UT-034/035/046/056 on-demand safe card and empty state use server data',async()=>{
 render(<MatchingScreen/>);await screen.findByText('星河旅人');await screen.findByText('契合度 75');
 expect(state.request.mock.calls.some(([p])=>p==='/match-candidates/candidate')).toBe(true);
 expect(screen.queryByText('工程師')).toBeNull();
});
it('MS-UT-036/045/059 outgoing pending waits and cannot submit another invitation',async()=>{
 state.request.mockImplementation(async(path:string)=>path==='/game-rounds'?{items:[]}:path==='/match-candidates/search'?{items:[{candidateId:'candidate',score:75,invitationState:'outgoing',invitationId:'invite'}],nextOffset:null}:{candidateId:'candidate',score:75,persona,invitationState:'outgoing',invitationId:'invite'});
 render(<MatchingScreen/>);const waiting=await screen.findByLabelText('等待回覆');expect(waiting.getAttribute('aria-disabled')).toBe('true');
 fireEvent.click(waiting);expect(state.request.mock.calls.some(([p,m])=>p==='/match-invitations'&&m==='POST')).toBe(false);
});
it('incoming exploration card offers a permanent decline with confirmation; cancel sends nothing',async()=>{
 const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(p:string,...args:unknown[])=>p==='/match-candidates/candidate'?{candidateId:'candidate',score:75,persona,invitationState:'incoming',invitationId:'invite'}:base(p,...args));
 render(<MatchingScreen/>);await screen.findByLabelText('接受邀請');fireEvent.click(await screen.findByLabelText('婉拒邀請'));
 await screen.findByText('婉拒後你們將無法再次互相配對');fireEvent.click(screen.getByLabelText('保留邀請'));
 expect(state.request.mock.calls.some(([p,m])=>p.endsWith('/decline')&&m==='POST')).toBe(false);
 fireEvent.click(screen.getByLabelText('婉拒邀請'));fireEvent.click(await screen.findByLabelText('確認永久婉拒'));
 await waitFor(()=>expect(state.request.mock.calls.filter(([p,m])=>m==='POST'&&p.endsWith('/decline'))).toEqual([['/match-invitations/invite/decline','POST',{}]]));
});
it('MS-UT-037/038 decline requires explicit permanent confirmation; cancel dialog writes nothing',async()=>{
 invites={incoming:[{invitationId:'invite',status:'pending',direction:'incoming',persona,expiresAt:Date.now()+60000}],outgoing:[]};
 render(<MatchingScreen invitations/>);fireEvent.click(await screen.findByLabelText('婉拒 星河旅人'));
 await screen.findByText('婉拒後你們將無法再次互相配對');fireEvent.click(screen.getByLabelText('保留邀請'));
 expect(state.request.mock.calls.some(([p,m])=>p.endsWith('/decline')&&m==='POST')).toBe(false);
});
it.each([['other_round_started','對方目前無法配對，這次邀請已失效'],['eligibility_changed','配對條件已變更，請重新搜尋']])('MS-UT-039/042 safe invalidation reason %s',async(reason,text)=>{
 invites={incoming:[{invitationId:'invite',status:'invalidated',invalidatedReason:reason,direction:'incoming',persona}],outgoing:[]};
 render(<MatchingScreen invitations/>);await screen.findByText(text);expect(screen.queryByLabelText('接受 星河旅人')).toBeNull();
});
it('MS-UT-044 an uncertain mutation disables further writes until readback',async()=>{
 const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(p:string,m?:string,...rest:unknown[])=>{if(p==='/match-invitations'&&m==='POST')throw new ApiFailure('NETWORK_ERROR',0,undefined,0,true);return base(p,m,...rest);});
 render(<MatchingScreen/>);fireEvent.click(await screen.findByLabelText('想認識'));
 await screen.findByText('狀態不明，請重新整理；不會自動重送邀請');
 expect(screen.getByLabelText('想認識').getAttribute('aria-disabled')).toBe('true');
 expect(state.request.mock.calls.filter(([p,m])=>p==='/match-invitations'&&m==='POST')).toHaveLength(1);
});
it('MS-UT-040/047 room shows persisted round and safe persona without fake messages',async()=>{
 state.request.mockResolvedValue({roundId:'round',status:'active',persona});render(<GameRoundScreen/>);
 await screen.findByText('專屬雙人房間');await screen.findByText('星河旅人');await screen.findByText('房間編號：round');
 await screen.findByText('遊戲進行中，結束後才能重新配對');
 expect(screen.queryByText('傳送訊息')).toBeNull();
});
it('a room that became unavailable returns through the verified matching router instead of trapping the player',async()=>{
 state.request.mockRejectedValue(new ApiFailure('RESOURCE_FORBIDDEN',403));render(<GameRoundScreen/>);
 await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/start'));expect(screen.queryByText('雙方已確認，遊戲進行中')).toBeNull();
});
it('an unavailable room dependency keeps retry feedback without assuming the game ended',async()=>{
 state.request.mockRejectedValue(new ApiFailure('DEPENDENCY_UNAVAILABLE',503));render(<GameRoundScreen/>);
 await screen.findByText('目前無法確認配對狀態，請重試');expect(state.router.replace).not.toHaveBeenCalled();
});
it('returning from another screen clears the previous candidate while current eligibility is rechecked',async()=>{
 const view=render(<MatchingScreen/>);await screen.findByText('星河旅人');
 state.focused=false;view.rerender(<MatchingScreen/>);
 state.request.mockReturnValue(new Promise(()=>{}));state.focused=true;view.rerender(<MatchingScreen/>);
 expect(screen.queryByText('星河旅人')).toBeNull();expect(screen.queryByLabelText('想認識')).toBeNull();
});
it('a revoked session immediately hides previously loaded candidate data',async()=>{
 const view=render(<MatchingScreen/>);await screen.findByText('星河旅人');
 state.account=undefined;view.rerender(<MatchingScreen/>);expect(screen.queryByText('星河旅人')).toBeNull();
});
it('MS-UT-020/048/056 only preloads the current and next three personas; skipping sends no invitation',async()=>{
 const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(p:string,...args:unknown[])=>p==='/match-candidates/search'?{items:Array.from({length:8},(_,i)=>({candidateId:'c'+i,score:80-i})),nextOffset:20}:p.startsWith('/match-candidates/c')?{candidateId:p.split('/').at(-1),score:80,persona}:base(p,...args));
 render(<MatchingScreen/>);await screen.findByText('星河旅人');
 expect(state.request.mock.calls.filter(([p])=>p.startsWith('/match-candidates/c'))).toHaveLength(4);
 fireEvent.click(screen.getByLabelText('下一位'));await screen.findByText('2 / 8');
 expect(state.request.mock.calls.some(([p,m])=>p==='/match-invitations'&&m==='POST')).toBe(false);
 expect(state.request.mock.calls.filter(([p])=>p.startsWith('/match-candidates/c'))).toHaveLength(5);
});
it('MS-UT-035 empty candidates are explicit without a local invented card',async()=>{
 const base=state.request.getMockImplementation()!;state.request.mockImplementation(async(p:string,...args:unknown[])=>p==='/match-candidates/search'?{items:[],nextOffset:null}:base(p,...args));
 render(<MatchingScreen/>);await screen.findByText('目前沒有可配對的對象');expect(screen.queryByText('星河旅人')).toBeNull();expect(screen.queryByLabelText('想認識')).toBeNull();
});
it('MS-UT-037/043/059 incoming acceptance and confirmed decline send only the selected invitation action',async()=>{
 invites={incoming:[{invitationId:'invite',status:'pending',direction:'incoming',persona,expiresAt:Date.now()+60000}],outgoing:[]};
 const base=state.request.getMockImplementation()!;state.request.mockImplementation(async(p:string,m?:string,...args:unknown[])=>m==='POST'?{status:'declined'}:base(p,m,...args));
 render(<MatchingScreen invitations/>);await screen.findByLabelText('接受 星河旅人');fireEvent.click(screen.getByLabelText('婉拒 星河旅人'));
 fireEvent.click(await screen.findByLabelText('確認永久婉拒'));await waitFor(()=>expect(state.request.mock.calls.filter(([p,m])=>m==='POST')).toEqual([['/match-invitations/invite/decline','POST',{}]]));
});
it.each([['cancelled','已取消，未來仍可再次相遇'],['expired','已逾期，未來仍可再次相遇']])('MS-UT-041/043 terminal %s has no active reply action',async(status,message)=>{
 invites={incoming:[{invitationId:'invite',status,direction:'incoming',persona,expiresAt:Date.now()-1}],outgoing:[]};render(<MatchingScreen invitations/>);
 await screen.findByText(message);expect(screen.queryByLabelText('接受 星河旅人')).toBeNull();
});
it('MS-UT-040 active round redirects before any candidate search',async()=>{
 const base=state.request.getMockImplementation()!;state.request.mockImplementation(async(p:string,...args:unknown[])=>p==='/game-rounds'?{items:[{roundId:'persisted'}]}:base(p,...args));
 render(<MatchingScreen/>);await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/game-round/persisted'));
 expect(state.request.mock.calls.some(([p])=>p==='/match-candidates/search')).toBe(false);
});
