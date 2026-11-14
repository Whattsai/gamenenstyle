// @vitest-environment jsdom
import React from 'react';
import {expect,it,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,act} from '@testing-library/react';
const state=vi.hoisted(()=>({width:1024,roundId:'round',request:vi.fn(),send:vi.fn(),router:{replace:vi.fn(),push:vi.fn()},experience:{},status:(s:string)=>{},sync:()=>Promise.resolve(),avatarUpdate:(_hint:string)=>Promise.resolve()}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),useWindowDimensions:()=>({width:state.width,height:900,scale:1,fontScale:1})}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-router',()=>({useRouter:()=>state.router,useLocalSearchParams:()=>({roundId:state.roundId}),useFocusEffect:(effect:()=>void)=>React.useEffect(effect,[effect])}));
vi.mock('expo-crypto',()=>({getRandomValues:(bytes:Uint8Array<ArrayBuffer>)=>crypto.getRandomValues(bytes)}));
vi.mock('../../src/StoryAudio',()=>({StoryAudio:()=>null}));
vi.mock('../../src/avatar-assets',()=>({avatarAssets:{}}));
vi.mock('../../src/session',()=>({api:{origin:'http://localhost',platform:'web',account:{accountId:'me'},sessionId:'session',request:state.request},useSession:()=>({ready:true})}));
vi.mock('../../src/RealtimeRoomClient',()=>({RealtimeRoomClient:class{constructor(_h:unknown,_r:string,c:any){state.sync=c.sync;state.status=c.status;state.avatarUpdate=c.avatarUpdated;}start(){state.status('connected');}stop(){}synchronize(){return state.sync();}send(...args:unknown[]){return state.send(...args);}presence(){}}}));
import {ApiFailure} from '../../src/api';
import {StoryExperienceScreen} from '../../src/StoryExperienceScreen';
import scenes from '../../../../contracts/story-scenes.json';
const avatarProjection=(version:string)=>({avatarAssetId:'019a281e-0000-7000-8000-000000000022',avatarVersion:version,expressionSpecVersion:'v1',avatarAssetSpecVersion:'full-body.v1',framing:'full_body',pose:'standing',stageAnchors:{head:{x:.5,y:.08},feet:{x:.5,y:.96}},expressions:Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map(e=>[e,{url:`/api/v1/game-rounds/round/partner-avatar/${version}/${e}`,sha256:'a'.repeat(64),mimeType:'image/webp',width:768,height:1024,byteSize:3}]))});
const persona={nickname:'對方旅人',selectedAvatarType:'builtin',selectedAvatarRef:'female-01'};
beforeEach(()=>{
 vi.clearAllMocks();state.roundId='round';state.experience={phase:'playing',roundId:'round',episodeSeq:1,eventSeq:1,storySessionId:'story',progressRevision:1,chapterStatus:'playing',title:'雨聲書店',currentNode:{id:'entry',title:'雨聲落在書頁上',lines:[{speaker:'旁白',text:'窗外的雨，落在書頁上。'}],choices:[{id:'next',label:'走近推薦卡',next:'icebreak'}],objects:[]},objects:[],assets:[],suggestions:[{id:'warm',label:'溫暖型',text:'你好，很高興遇見你。'}]};
 state.request.mockImplementation(async(path:string)=>{if(path.endsWith('/partner-avatar'))throw new ApiFailure('AVATAR_PACK_NOT_READY',409);return path.endsWith('/experience')?state.experience:path.endsWith('/events/query')?{events:[],cursor:1,hasMore:false}:path==='/me/dating-profile'?{nickname:'本人旅人',selectedAvatarType:'builtin',selectedAvatarRef:'male-01'}:{roundId:'round',persona};});state.send.mockResolvedValue({eventSeq:2});
});
afterEach(cleanup);
it('own unready avatar blocks direct entry and clears an already displayed scene with a profile return',async()=>{
 render(<StoryExperienceScreen/>);await screen.findByText('雨聲書店');fireEvent.change(await screen.findByLabelText('你的訊息'),{target:{value:'私人草稿'}});
 const request=state.request.getMockImplementation()!;state.request.mockImplementation((path:string,...args:unknown[])=>path.endsWith('/experience')?Promise.reject(new ApiFailure('OWN_AVATAR_PACK_NOT_READY',409)):request(path,...args));
 await act(async()=>{await state.sync().catch(()=>{});});
 await screen.findByText('目前採用的化身表情尚未準備好，請先到個人檔案選用已就緒的化身。');expect(screen.queryByText('雨聲書店')).toBeNull();expect(screen.queryByLabelText('你的訊息')).toBeNull();expect(state.send).not.toHaveBeenCalled();
 fireEvent.click(screen.getByLabelText('前往個人檔案'));expect(state.router.replace).toHaveBeenCalledWith('/profile');
});
it('a cursor newer than the snapshot forces an authoritative reread before finishing recovery',async()=>{
 const request=state.request.getMockImplementation()!;let advanced=false;state.request.mockImplementation(async(path:string,method:string,body:any)=>{
  if(path.endsWith('/events/query')&&body?.afterSeq!==undefined){if(!advanced){advanced=true;state.experience={...state.experience as any,eventSeq:2,progressRevision:2,currentNode:{...(state.experience as any).currentNode,id:'shelves',title:'游標已前進的劇情',choices:[]}};return{events:[{eventSeq:2,type:'story.node_changed',payload:{nodeId:'shelves'}}],cursor:2,hasMore:false};}return{events:[],cursor:2,hasMore:false};}
  return request(path,method,body);
 });render(<StoryExperienceScreen/>);await screen.findByText('游標已前進的劇情');expect(state.request.mock.calls.filter(c=>c[0].endsWith('/experience')).length).toBeGreaterThanOrEqual(2);expect(state.send).not.toHaveBeenCalled();
});
it('completed players can agree or withdraw for the actual completed episode without ending chat',async()=>{
 state.experience={...state.experience as any,phase:'completed',chapterStatus:'completed',episodeSeq:3,myAgreedNext:false,partnerAgreedNext:true,currentNode:{...(state.experience as any).currentNode,choices:[],ending:true}};
 render(<StoryExperienceScreen/>);fireEvent.change(await screen.findByLabelText('你的訊息'),{target:{value:'下一章也保留的聊天草稿'}});fireEvent.click(await screen.findByLabelText('一起開始下一場'));
 await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(1));expect(state.send.mock.calls[0][0]).toBe('story.next.requested');expect(state.send.mock.calls[0][2]).toEqual({completedEpisodeSeq:3,agree:true});
 const request=state.request.getMockImplementation()!;state.request.mockImplementation((path:string,...args:unknown[])=>path.endsWith('/events/query')?Promise.resolve({events:[{eventSeq:2,type:'story.next.requested',actorAccountId:'me',clientRequestId:state.send.mock.calls[0][1],payload:{completedEpisodeSeq:3,agree:true}}],cursor:2,hasMore:false}):request(path,...args));
 state.experience={...state.experience as any,myAgreedNext:true,eventSeq:2};await act(async()=>state.sync());fireEvent.click(await screen.findByLabelText('撤回下一場同意'));
 await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(2));expect(state.send.mock.calls[1][2]).toEqual({completedEpisodeSeq:3,agree:false});expect(screen.getByLabelText('你的訊息')).toBeTruthy();
 expect((screen.getByLabelText('你的訊息')as HTMLTextAreaElement).value).toBe('下一章也保留的聊天草稿');
});
it('the next category selection keeps round chat and submits categoryId in the current episode',async()=>{
 state.experience={phase:'pending_category_selection',roundId:'round',episodeSeq:2,eventSeq:8,partnerHasVoted:true,offers:[{categoryId:'romance-category',rank:1,title:'浪漫',summary:'一起讀書',reason:'共同探索'},{categoryId:'mystery-category',rank:2,title:'懸疑',summary:'一起解開線索',reason:'共同探索'}]};
 render(<StoryExperienceScreen/>);await screen.findByText('選擇下一場的主題');expect(screen.getByLabelText('你的訊息')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('選擇 懸疑'));await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(1));expect(state.send.mock.calls[0][2]).toEqual({episodeSeq:2,categoryId:'mystery-category'});
});
it('a qualified free event previews without a write and submits its binding instead of a node transition',async()=>{
 const definition={id:'scene:bookshop:shelf',bindingId:'scene:bookshop:shelf',version:'v1',title:'書架線索',moduleType:'inspect-object',prompt:'看看夾在書頁裡的字',options:[{id:'turn',label:'展開紙頁'}]};
 state.experience={...state.experience as any,objects:[definition],events:[{bindingId:definition.bindingId,eventInstanceId:'event-one',eventSeq:2,revision:1,status:'active',definition}]};
 render(<StoryExperienceScreen/>);fireEvent.click(await screen.findByLabelText('書架線索'));expect(state.send).not.toHaveBeenCalled();fireEvent.click(await screen.findByLabelText('展開紙頁'));
 await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(1));expect(state.send.mock.calls[0][0]).toBe('story.event.submit');expect(state.send.mock.calls[0][2]).toEqual({storySessionId:'story',bindingId:definition.bindingId,actionId:'turn',expectedRevision:1});
});
it('cooperation shows the committed partner status without exposing their selected option',async()=>{
 state.experience={...state.experience as any,interaction:{definition:{id:'reading-path',title:'閱讀方向',moduleType:'cooperative-choice',prompt:'一起選擇',options:[{id:'warm',label:'溫暖的日常'},{id:'adventure',label:'未知的冒險'}]},partnerHasSubmitted:true,status:'active'}};
 render(<StoryExperienceScreen/>);await screen.findByText('對方已提交，等待你的選擇。');expect(screen.queryByText(/對方的選擇/)).toBeNull();expect(state.send).not.toHaveBeenCalled();
});
it('a pending cooperative answer shows an unconfirmed sending status and prevents duplicate choices',async()=>{
 state.experience={...state.experience as any,interaction:{definition:{id:'reading-path',title:'閱讀方向',moduleType:'cooperative-choice',prompt:'一起選擇',options:[{id:'warm',label:'溫暖的日常'},{id:'adventure',label:'未知的冒險'}]},status:'active'}};
 state.send.mockImplementation(()=>new Promise(()=>{}));render(<StoryExperienceScreen/>);fireEvent.click(await screen.findByLabelText('溫暖的日常'));
 await screen.findByText('送出中，尚未確認。');expect(screen.queryByText(/你的選擇：/)).toBeNull();expect((screen.getByLabelText('未知的冒險')as HTMLButtonElement).disabled).toBe(true);fireEvent.click(screen.getByLabelText('溫暖的日常'));expect(state.send).toHaveBeenCalledTimes(1);
});
it('SEF-UT-218/219/220: a new session resets narrative and open object while keeping round chat draft',async()=>{
 const node={...(state.experience as any).currentNode,lines:[{speaker:'旁白',text:'第一場開場。'},{speaker:'旁白',text:'第一場第二句。'}]};
 const definition={id:'bookmark',title:'書籤',moduleType:'inspect-object',prompt:'舊場物件',options:[{id:'turn',label:'翻面'}]};
 state.experience={...state.experience as any,currentNode:node,objects:[definition]};render(<StoryExperienceScreen/>);
 fireEvent.change(await screen.findByLabelText('你的訊息'),{target:{value:'聊天草稿保留'}});
 fireEvent.click(screen.getByLabelText('顯示完整句'));fireEvent.click(await screen.findByLabelText('下一句'));
 fireEvent.click(screen.getByLabelText('書籤'));await screen.findByText('舊場物件');
 state.experience={...state.experience as any,storySessionId:'story-two',episodeSeq:2,currentNode:{...node,lines:[{speaker:'旁白',text:'第二場開場。'},{speaker:'旁白',text:'第二場第二句。'}]}};
 await act(async()=>state.sync());
 expect(screen.queryByText('舊場物件')).toBeNull();fireEvent.click(screen.getByLabelText('顯示完整句'));
 expect(await screen.findByText('第二場開場。')).toBeTruthy();expect(screen.queryByText('第二場第二句。')).toBeNull();
 expect((screen.getByLabelText('你的訊息') as HTMLTextAreaElement).value).toBe('聊天草稿保留');expect(state.send).not.toHaveBeenCalled();
});

it('SEF-UT-227/228/229: completed phase keeps ending and chat and removes side interaction controls',async()=>{
 state.experience={...state.experience as any,phase:'completed',chapterStatus:'completed',scenePresentation:scenes.stories[0].scenePresentation,currentNode:{...(state.experience as any).currentNode,id:'ending',ending:true,title:'本次收尾',choices:[],presentation:{cameraId:'table-medium',expression:'neutral',hotspotIds:['bookmark']}},objects:[{id:'bookmark',title:'不能再探索的書籤'}]};
 render(<StoryExperienceScreen/>);await screen.findByText('本次收尾');expect(screen.getByLabelText('你的訊息')).toBeTruthy();
 expect(screen.queryByLabelText('不能再探索的書籤')).toBeNull();expect(state.send).not.toHaveBeenCalled();
 expect(screen.queryByLabelText('場景物件：翻看手寫書籤')).toBeNull();expect(screen.queryByLabelText('完成劇情')).toBeNull();
});

it('SEF-UT-218: actions use the server episode number instead of the first episode',async()=>{
 state.experience={...state.experience as any,storySessionId:'story-two',episodeSeq:2};render(<StoryExperienceScreen/>);
 fireEvent.click(await screen.findByLabelText('顯示完整句'));fireEvent.click(await screen.findByLabelText('走近推薦卡'));
 await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(1));expect(state.send.mock.calls[0][2].episodeSeq).toBe(2);expect(state.send.mock.calls[0][2].storySessionId).toBe('story-two');
});
it('SEF-UT-220: an old episode ACK cannot restore pending controls after the next session starts',async()=>{
 let acknowledge:(value:unknown)=>void=()=>{};state.send.mockImplementation(()=>new Promise(resolve=>{acknowledge=resolve;}));
 render(<StoryExperienceScreen/>);fireEvent.click(await screen.findByLabelText('顯示完整句'));fireEvent.click(await screen.findByLabelText('走近推薦卡'));
 await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(1));
 state.experience={...state.experience as any,storySessionId:'story-two',episodeSeq:2,eventSeq:4};await act(async()=>state.sync());
 await act(async()=>{acknowledge({eventSeq:2});});
 const input=screen.getByLabelText('你的訊息');fireEvent.change(input,{target:{value:'新場仍可聊天'}});
 expect((screen.getByLabelText('傳送訊息') as HTMLButtonElement).disabled).toBe(false);
});
it('SEF-UT-220: a late recovery failure from the old episode cannot overwrite the new scene notice',async()=>{
 let rejectRecovery:(error:unknown)=>void=()=>{};
 state.send.mockRejectedValueOnce(new ApiFailure('UNKNOWN_COMMIT',0,undefined,0,true)).mockImplementationOnce(()=>new Promise((_resolve,reject)=>{rejectRecovery=reject;}));
 render(<StoryExperienceScreen/>);fireEvent.click(await screen.findByLabelText('顯示完整句'));fireEvent.click(await screen.findByLabelText('走近推薦卡'));
 fireEvent.click(await screen.findByLabelText('以原編號查回結果'));await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(2));
 state.experience={...state.experience as any,storySessionId:'story-two',episodeSeq:2,eventSeq:4};await act(async()=>state.sync());
 await act(async()=>{rejectRecovery(new ApiFailure('DEPENDENCY_UNAVAILABLE',503));});
 expect(screen.queryByText('目前無法確認送出結果，請重新同步。')).toBeNull();
});
it('SD-UT-071/072: inspecting a scene object and returning preserve the node without submitting until the player explicitly chooses',async()=>{
 const definition={id:'bookmark',title:'書籤特寫',moduleType:'inspect-object',prompt:'書籤背面留有一行字。',options:[{id:'turn',label:'翻到書籤背面'}]};
 state.experience={...state.experience as any,scenePresentation:scenes.stories[0].scenePresentation,objects:[definition],currentNode:{...(state.experience as any).currentNode,presentation:{cameraId:'table-medium',hotspotIds:['bookmark'],expression:'thoughtful'}}};
 render(<StoryExperienceScreen/>);fireEvent.click(await screen.findByLabelText('場景物件：翻看手寫書籤'));await screen.findByText(definition.prompt);
 expect(state.send).not.toHaveBeenCalled();fireEvent.click(screen.getByLabelText('返回場景'));expect(screen.queryByText(definition.prompt)).toBeNull();expect(screen.getByTestId('scene-camera-table-medium')).toBeTruthy();expect(state.send).not.toHaveBeenCalled();
 fireEvent.click(screen.getByLabelText('場景物件：翻看手寫書籤'));fireEvent.click(await screen.findByLabelText('翻到書籤背面'));await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(1));
 expect(state.send.mock.calls[0][0]).toBe('interaction.submit');expect(state.send.mock.calls[0][2]).toEqual({storySessionId:'story',episodeSeq:1,nodeId:'entry',expectedRevision:1,choiceId:'turn',definitionId:'bookmark'});
});
it('SD-UT-007/032: N1 renders real scene and labeled narrator without story selection',async()=>{
 render(<StoryExperienceScreen/>);await screen.findByText('雨聲書店');await screen.findByText('對方旅人');expect(screen.queryByText('選擇今晚的故事')).toBeNull();expect(screen.queryByText('夏樹')).toBeNull();
});
it('SD-UT-016/029: cancelling permanent exit confirmation never calls end',async()=>{
 render(<StoryExperienceScreen/>);fireEvent.click(await screen.findByLabelText('結束本輪互動'));await screen.findByText(/永久無法再次配對/);fireEvent.click(screen.getByLabelText('繼續這段相遇'));
 expect(state.request.mock.calls.some(([p])=>p.endsWith('/end'))).toBe(false);
});
it('SD-UT-027/028: exit language prompts only the author and can return to editing',async()=>{
 render(<StoryExperienceScreen/>);const input=await screen.findByLabelText('你的訊息');fireEvent.change(input,{target:{value:'先到這邊'}});fireEvent.click(screen.getByLabelText('傳送訊息'));
 await screen.findByText('是否想結束這段互動？');expect(state.send).not.toHaveBeenCalled();fireEvent.click(screen.getByLabelText('返回編輯'));expect((screen.getByLabelText('你的訊息') as HTMLTextAreaElement).value).toBe('先到這邊');
});
it('SD-UT-069: the chat drawer can close and reopen without restarting the scene or losing the draft',async()=>{
 render(<StoryExperienceScreen/>);const input=await screen.findByLabelText('你的訊息');
 fireEvent.change(input,{target:{value:'這是一段尚未送出的話'}});
 fireEvent.click(screen.getByLabelText('收起聊天室'));
 expect(screen.queryByLabelText('你的訊息')).toBeNull();expect(screen.getByText('雨聲落在書頁上')).toBeTruthy();
 const calls=state.request.mock.calls.length;
 fireEvent.click(screen.getByLabelText('展開聊天室'));
 expect((await screen.findByLabelText('你的訊息') as HTMLTextAreaElement).value).toBe('這是一段尚未送出的話');
 expect(state.request.mock.calls).toHaveLength(calls);expect(state.send).not.toHaveBeenCalled();
});
it('SD-UT-017: ended snapshot contains no old message controls or private portraits',async()=>{
 state.experience={roundId:'round',phase:'ended'};render(<StoryExperienceScreen/>);await screen.findByText('本輪互動已結束');expect(screen.queryByLabelText('你的訊息')).toBeNull();expect(screen.queryByText('對方旅人')).toBeNull();
});

it.each([2,3])('safe ordered %i-offer cards hide story assets and lock a pending vote',async(count)=>{
 state.experience={phase:'pending_story_selection',roundId:'round',episodeSeq:1,eventSeq:0,partnerHasVoted:true,offers:Array.from({length:count},(_,i)=>({catalogId:'catalog-'+i,rank:i+1,title:'故事'+i,summary:'安全摘要'+i,reason:'共同閱讀'}))};
 let finish:(v:unknown)=>void=()=>{};state.send.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));render(<StoryExperienceScreen/>);await screen.findByText('選擇今晚的故事');expect(screen.getByText('對方已選好，等待你的選擇。')).toBeTruthy();expect(screen.queryByLabelText('你的訊息')).toBeNull();
 const buttons=Array.from({length:count},(_,i)=>screen.getByLabelText('選擇 故事'+i));fireEvent.click(buttons[0]);fireEvent.click(buttons[0]);expect(state.send).toHaveBeenCalledTimes(1);expect(state.send.mock.calls[0][2]).toEqual({episodeSeq:1,catalogId:'catalog-0'});finish({eventSeq:1});
});
it('unknown commit preserves payload and explicitly reuses the original request ID',async()=>{
 state.send.mockRejectedValueOnce(new ApiFailure('UNKNOWN_COMMIT',0,undefined,0,true)).mockResolvedValue({eventSeq:2});render(<StoryExperienceScreen/>);fireEvent.change(await screen.findByLabelText('你的訊息'),{target:{value:'原本的訊息'}});fireEvent.click(screen.getByLabelText('傳送訊息'));await screen.findByLabelText('以原編號查回結果');expect(screen.getByText('送出結果不明，請重新同步')).toBeTruthy();fireEvent.click(screen.getByLabelText('以原編號查回結果'));await waitFor(()=>expect(state.send).toHaveBeenCalledTimes(2));expect(state.send.mock.calls[1]).toEqual(state.send.mock.calls[0]);
});
it('cooperative waiting can return to exploration without inventing a partner choice',async()=>{
 state.experience={...state.experience as object,interaction:{myChoice:'warm',status:'active',definition:{id:'path',title:'一起選擇',moduleType:'cooperative-choice',options:[{id:'warm',label:'溫暖'},{id:'adventure',label:'冒險'}]}}};render(<StoryExperienceScreen/>);await screen.findByText(/等待另一方選擇；可以返回探索或聊天/);fireEvent.click(screen.getByLabelText('返回場景探索'));expect(screen.getByText('等待另一方選擇；你的合作選擇已保存。')).toBeTruthy();expect(screen.getByLabelText('你的訊息')).toBeTruthy();expect(state.send).not.toHaveBeenCalled();
});
it('SD-IT-075: avatar notifications read one latest projection without resetting the story or posting a mutation',async()=>{
 render(<StoryExperienceScreen/>);await screen.findByText('對方旅人');
 const before=state.request.mock.calls.filter(([path])=>path.endsWith('/partner-avatar')).length;
 const storyReads=state.request.mock.calls.filter(([path])=>path.endsWith('/experience')).length;
 expect(typeof state.avatarUpdate).toBe('function');await state.avatarUpdate('a'.repeat(64));
 expect(state.request.mock.calls.filter(([path])=>path.endsWith('/partner-avatar'))).toHaveLength(before+1);
 expect(state.request.mock.calls.filter(([path])=>path.endsWith('/experience'))).toHaveLength(storyReads+1);
 expect(screen.getByText('雨聲落在書頁上')).toBeTruthy();expect(state.send).not.toHaveBeenCalled();
});

it('SD-UT-065: a newly unavailable adopted pack immediately removes the old private portrait',async()=>{
 let ready=true;
 const original=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>path.endsWith('/partner-avatar')?(ready?avatarProjection('a'.repeat(64)):Promise.reject(new ApiFailure('AVATAR_PACK_NOT_READY',409))):original(path,...args));
 render(<StoryExperienceScreen/>);await screen.findByLabelText('對方旅人的遊戲立繪');ready=false;
 await state.avatarUpdate('b'.repeat(64));
 await waitFor(()=>expect(screen.queryByLabelText('對方旅人的遊戲立繪')).toBeNull());
});

it('SD-UT-065: an avatar response arriving after ended cannot reopen private presentation',async()=>{
 const original=state.request.getMockImplementation()!;let resolve:(value:unknown)=>void=()=>{};
 render(<StoryExperienceScreen/>);await screen.findByText('對方旅人');
 state.request.mockImplementation(async(path:string,...args:unknown[])=>path.endsWith('/partner-avatar')?new Promise(r=>{resolve=r;}):original(path,...args));
 const read=state.avatarUpdate('a'.repeat(64));await waitFor(()=>expect(state.request.mock.calls.filter(([path])=>path.endsWith('/partner-avatar'))).toHaveLength(2));state.experience={phase:'ended',roundId:'round'};await state.sync();
 resolve(avatarProjection('a'.repeat(64)));await read;
 await screen.findByText('本輪互動已結束');expect(screen.queryByLabelText('對方旅人的遊戲立繪')).toBeNull();
 expect(state.request.mock.calls.filter(([path])=>path.endsWith('/partner-avatar'))).toHaveLength(2);
});
it('SD-UT-065: revoked authority invalidates in-flight avatars and removes private story content before navigation completes',async()=>{
 const original=state.request.getMockImplementation()!;let finish:(value:unknown)=>void=()=>{};let revoked=false;
 render(<StoryExperienceScreen/>);await screen.findByText('對方旅人');
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{if(path.endsWith('/partner-avatar'))return new Promise(r=>finish=r);if(path.endsWith('/experience')&&revoked)throw new ApiFailure('SESSION_REVOKED',401);return original(path,...args);});
 const read=state.avatarUpdate('c'.repeat(64));await waitFor(()=>expect(state.request.mock.calls.filter(([path])=>path.endsWith('/partner-avatar'))).toHaveLength(2));revoked=true;await expect(state.sync()).rejects.toMatchObject({status:401});finish(avatarProjection('c'.repeat(64)));await read;
 await waitFor(()=>expect(screen.queryByLabelText('對方旅人的遊戲立繪')).toBeNull());expect(screen.queryByText('雨聲落在書頁上')).toBeNull();expect(state.router.replace).toHaveBeenCalledWith('/login');
});
it('SD-IT-076: another avatar hint during an in-flight read schedules one latest read rather than losing the change',async()=>{
 render(<StoryExperienceScreen/>);await screen.findByText('對方旅人');let finish:(v:unknown)=>void=()=>{};let reads=0;const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{if(path.endsWith('/partner-avatar')){reads++;if(reads===1)return new Promise(resolve=>finish=resolve);return avatarProjection('b'.repeat(64));}return base(path,...args);});
 const first=state.avatarUpdate('a'.repeat(64));await waitFor(()=>expect(reads).toBe(1));const second=state.avatarUpdate('b'.repeat(64));finish(avatarProjection('a'.repeat(64)));
 await Promise.all([first,second]);expect(reads).toBe(2);expect(state.send).not.toHaveBeenCalled();
});

it('a late message ACK from the previous room cannot restore its private text in the next room',async()=>{
 let finish:(v:unknown)=>void=()=>{};state.send.mockImplementation(()=>new Promise(r=>finish=r));
 const view=render(<StoryExperienceScreen/>);fireEvent.change(await screen.findByLabelText('你的訊息'),{target:{value:'previous-room-private-message'}});fireEvent.click(screen.getByLabelText('傳送訊息'));expect(state.send).toHaveBeenCalledTimes(1);
 state.roundId='next-room';state.experience={...state.experience as object,roundId:'next-room'};view.rerender(<StoryExperienceScreen/>);
 await waitFor(()=>expect(state.request.mock.calls.some(([path])=>path==='/game-rounds/next-room/events/query')).toBe(true));
 expect(screen.queryByText('previous-room-private-message')).toBeNull();
 await act(async()=>{finish({eventSeq:2});await Promise.resolve();});
 expect(screen.queryByText('previous-room-private-message')).toBeNull();
 expect((screen.getByLabelText('你的訊息') as HTMLTextAreaElement).disabled).toBe(false);
});
