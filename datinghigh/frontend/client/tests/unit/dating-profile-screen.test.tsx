// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor,act} from '@testing-library/react';
const state=vi.hoisted(()=>({now:1800000000000,focused:true,request:vi.fn(),uploadPhoto:vi.fn(),pick:vi.fn(),router:{push:vi.fn(),replace:vi.fn(),back:vi.fn(),canGoBack:()=>false},navigation:{addListener:()=>()=>{},dispatch:vi.fn()}}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-router',()=>({useRouter:()=>state.router,useNavigation:()=>state.navigation,useFocusEffect:(effect:()=>void)=>React.useEffect(()=>state.focused?effect():undefined,[effect,state.focused])}));
vi.mock('expo-image-picker',()=>({launchImageLibraryAsync:state.pick,UIImagePickerPreferredAssetRepresentationMode:{Compatible:'compatible'}}));
vi.mock('expo-crypto',()=>({getRandomValues:(bytes:Uint8Array<ArrayBuffer>)=>crypto.getRandomValues(bytes)}));
vi.mock('expo-file-system',()=>({Paths:{cache:{uri:'file:///app/cache/'}},File:class{exists=false;delete(){}}}));
vi.mock('../../src/session',()=>({useSession:()=>({ready:true}),api:{account:{accountId:'owner'},platform:'web',origin:'',get serverNow(){return state.now;},request:state.request,uploadPhoto:state.uploadPhoto}}));
vi.mock('../../src/avatar-assets',()=>({avatarAssets:{}}));
import {DatingProfileScreen} from '../../src/DatingProfileScreen';
import definitions from '../../../../contracts/profile-fields.json';
import {CardDisplay,CardPreviewScreen} from '../../src/CardPreviewScreen';
import type {ProfileField} from '../../src/profile-fields';
import {ApiFailure} from '../../src/api';
vi.setConfig({testTimeout:20000});
afterEach(()=>{cleanup();state.focused=true;vi.useRealTimers();state.now=1800000000000;vi.clearAllMocks();});
const openAvatars=async()=>{fireEvent.click(await screen.findByLabelText('選擇化身'));};
const openAi=async()=>{await openAvatars();fireEvent.click(await screen.findByLabelText('AI 客製化'));};

it.each([true,false])('an open adoption expires without a selection request even when the deadline timer ran=%s',async(timerRan)=>{
 vi.useFakeTimers();setup([{assetId:'photo-1'},{assetId:'photo-2'}]);const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{const value=await base(path,...args);return path==='/me/dating-profile'?{...value,avatarAttempt:{attemptId:'expiring',producedCount:1,status:'open',expiresAt:state.now+1000}}:value;});
 await act(async()=>{render(<DatingProfileScreen/>);});
 fireEvent.click(screen.getByLabelText('選擇化身'));fireEvent.click(screen.getByLabelText('AI 客製化'));fireEvent.click(screen.getByLabelText('採用這張'));
 expect(screen.getByLabelText('確認採用')).toBeTruthy();
 state.now+=1005;
 if(timerRan)await act(async()=>{await vi.advanceTimersByTimeAsync(1005);});
 else await act(async()=>{fireEvent.click(screen.getByLabelText('確認採用'));});
 expect(screen.getByLabelText('採用這張').getAttribute('aria-disabled')).toBe('true');
 expect(screen.queryByLabelText('確認採用')).toBeNull();expect(screen.getByLabelText('開始新的一輪')).toBeTruthy();
 expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/generations'||path==='/me/avatar/selection')).toBe(false);
});
it('a saved inactive catalog choice keeps its meaning and code while another field is edited',async()=>{
 setup();const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{
  if(path==='/profile-catalog')return {fields:definitions,groups:{interestTagIds:[{id:'puzzle',label:'解謎',active:false}]}};
  const value=await base(path,...args);return path==='/me/dating-profile'?{...value,interestTagIds:['puzzle']}:value;
 });
 render(<DatingProfileScreen/>);const retired=await screen.findByRole('checkbox',{name:'解謎（已停用）',checked:true});expect(retired.getAttribute('aria-disabled')).not.toBe('true');
 fireEvent.change(screen.getByLabelText('一句自我介紹'),{target:{value:'只修改自介'}});fireEvent.click(screen.getByLabelText('儲存'));await screen.findByText('個人資料已儲存');
 const saved=state.request.mock.calls.find(([path,method])=>path==='/me/dating-profile'&&method==='PUT')!;expect(saved[2].interestTagIds).toEqual(['puzzle']);expect(saved[2].bio).toBe('只修改自介');
});
it('an inactive unselected choice is visibly retired and cannot be newly selected',async()=>{
 setup();const base=state.request.getMockImplementation()!;state.request.mockImplementation(async(path:string,...args:unknown[])=>path==='/profile-catalog'?{fields:definitions,groups:{interestTagIds:[{id:'puzzle',label:'解謎',active:false}]}}:base(path,...args));
 render(<DatingProfileScreen/>);const retired=await screen.findByRole('checkbox',{name:'解謎（已停用）',checked:false});expect(retired.getAttribute('aria-disabled')).toBe('true');
 fireEvent.click(retired);expect(screen.getByRole('checkbox',{name:'解謎（已停用）',checked:false})).toBeTruthy();
 expect(state.request.mock.calls.some(([path,method])=>path==='/me/dating-profile'&&method==='PUT')).toBe(false);
});
it('an underage birthday gets a specific explanation without submitting a profile mutation',async()=>{
 setup();render(<DatingProfileScreen/>);fireEvent.change(await screen.findByLabelText('生日'),{target:{value:'2015-01-01'}});
 fireEvent.click(screen.getByLabelText('儲存'));await screen.findByText('需年滿 18 歲才能完成個人資料，請確認生日');
 expect(state.request.mock.calls.some(([path,method])=>path==='/me/dating-profile'&&method==='PUT')).toBe(false);
});
it.each([
 ['生日','2026-02-30','生日請填寫有效日期（YYYY-MM-DD），且不可晚於今天'],
 ['生日','2099-01-01','生日請填寫有效日期（YYYY-MM-DD），且不可晚於今天'],
 ['偏好最小年齡','25','年齡偏好的最小與最大值請一起填寫，或一起留空'],
 ['偏好最大年齡','35','年齡偏好的最小與最大值請一起填寫，或一起留空'],
])('invalid profile field %s has an actionable explanation: %s',async(label,value,notice)=>{
 setup();render(<DatingProfileScreen/>);fireEvent.change(await screen.findByLabelText(label),{target:{value}});
 fireEvent.click(screen.getByLabelText('儲存'));await screen.findByText(notice);
 expect(state.request.mock.calls.some(([path,method])=>path==='/me/dating-profile'&&method==='PUT')).toBe(false);
});
it('duplicate generated output preserves both candidates and explains an explicit retry cost',async()=>{
 setup([{assetId:'one'},{assetId:'two'}]);const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{
  if(path==='/me/avatar/generations')throw new ApiFailure('AVATAR_DUPLICATE_IMAGE',409);
  const value=await base(path,...args);return path==='/me/dating-profile'?{...value,avatarAttempt:{attemptId:'round',producedCount:2,status:'open',expiresAt:1800003600000}}:value;
 });
 render(<DatingProfileScreen/>);await openAi();fireEvent.click(screen.getByLabelText('產生下一張'));
 await screen.findByText('這次插畫與已有候選相同，未新增張數；可主動再試，可能增加供應商成本');
 expect(screen.getByLabelText('比較候選 1')).toBeTruthy();expect(screen.getByLabelText('比較候選 2')).toBeTruthy();
 expect(state.request.mock.calls.filter(([path])=>path==='/me/avatar/generations')).toHaveLength(1);
});
it('clean preview opens the separate page without a save request',async()=>{
 setup();render(<DatingProfileScreen/>);fireEvent.click(await screen.findByLabelText('預覽同意後的名片'));
 expect(state.router.push).toHaveBeenCalledWith('/card-preview');
 expect(state.request.mock.calls.some(([,method])=>method==='PUT')).toBe(false);
});
function setup(photos:unknown[]=[]){
 let saved:Record<string,any>={};
 state.request.mockImplementation(async(path:string,method?:string,payload?:Record<string,any>)=>{
  if(path==='/me/dating-profile'&&method==='PUT'){saved={...payload,revision:(saved.revision??1)+1};return {revision:saved.revision};}
  if(path==='/profile-catalog')return {version:'v1',fields:definitions,groups:{}};
  if(path==='/avatar-catalog')return {avatars:[]};
  return {revision:1,nickname:'星河',bio:'',occupation:null,birthDate:'1995-01-01',traitTagIds:[],interestTagIds:[],topicTagIds:[],valueTagIds:[],preferredRegionCodes:[],sharedInterestWeight:50,personalPhotos:photos,gender:null,romanticOrientation:[],cardVisibility:{},...saved};
 });
}
it('Web assistive state tracks the selected candidate and checked profile tag',async()=>{
 setup([{assetId:'one'},{assetId:'two'}]);const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>path==='/profile-catalog'?{fields:definitions,groups:{traitTagIds:[{id:'warm',label:'溫暖',active:true}]}}:path==='/me/dating-profile'?{...await base(path,...args),avatarAttempt:{attemptId:'existing',producedCount:2,status:'open',expiresAt:1800003600000}}:base(path,...args));
 render(<DatingProfileScreen/>);await openAi();
 expect(screen.getByRole('button',{name:'比較候選 1',pressed:true})).toBeTruthy();fireEvent.click(screen.getByLabelText('比較候選 2'));
 expect(screen.getByRole('button',{name:'比較候選 2',pressed:true})).toBeTruthy();expect(screen.getByRole('button',{name:'比較候選 1',pressed:false})).toBeTruthy();
 fireEvent.click(screen.getByLabelText('關閉'));fireEvent.click(screen.getByLabelText('溫暖'));expect(screen.getByRole('checkbox',{name:'溫暖',checked:true})).toBeTruthy();
});
it('a recovered in-flight round with zero completed images cannot offer adoption',async()=>{
 setup([{assetId:'photo-1'},{assetId:'photo-2'}]);const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{const value=await base(path,...args);return path==='/me/dating-profile'?{...value,avatarAttempt:{attemptId:'pending',producedCount:0,status:'generating',expiresAt:1800003600000}}:value;});
 render(<DatingProfileScreen/>);await openAi();
 expect(screen.queryByLabelText('採用這張')).toBeNull();expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/generations')).toBe(false);
});
it('a saved formal avatar can be selected again without generating or adopting a new candidate',async()=>{
 setup();const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{const value=await base(path,...args);return path==='/me/dating-profile'?{...value,generatedAvatars:[{assetId:'saved',mimeType:'image/jpeg',createdAt:1}]}:value;});
 render(<DatingProfileScreen/>);await openAvatars();fireEvent.click(await screen.findByLabelText('選用已保存化身 1'));
 await waitFor(()=>expect(state.request).toHaveBeenCalledWith('/me/avatar/selection','PUT',{type:'generated',assetId:'saved',expectedRevision:1}));
 expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/generations')).toBe(false);
});
it('refreshing photo metadata cannot give an old unsaved form the newer remote revision',async()=>{
 setup();const base=state.request.getMockImplementation()!;let reads=0;
 state.request.mockImplementation(async(path:string,method?:string,...args:unknown[])=>{
  if(path==='/me/dating-profile'&&method==='PUT')return {revision:3};
  const value=await base(path,method,...args);
  if(path==='/me/dating-profile'&&++reads>1)return {...value,revision:2,nickname:'遠端更新',bio:'遠端文字'};
  return value;
 });
 state.pick.mockResolvedValue({canceled:false,assets:[{uri:'blob:qa',file:new Blob([new Uint8Array([1])],{type:'image/jpeg'}),mimeType:'image/jpeg',fileSize:1}]});state.uploadPhoto.mockResolvedValue({assetId:'uploaded'});
 render(<DatingProfileScreen/>);fireEvent.change(await screen.findByLabelText('一句自我介紹'),{target:{value:'我的草稿'}});
 await openAi();fireEvent.click(screen.getByLabelText('新增個人照片'));await screen.findByText('照片已壓縮並安全儲存');
 fireEvent.click(screen.getByLabelText('關閉'));fireEvent.click(screen.getByLabelText('儲存'));
 expect(state.request.mock.calls.some(([path,method])=>path==='/me/dating-profile'&&method==='PUT')).toBe(false);
 expect((screen.getByLabelText('一句自我介紹') as HTMLInputElement).value).toBe('我的草稿');
 expect(screen.getAllByText('請先重新整理已保存資料，再決定要修改的內容').length).toBeGreaterThan(0);
});
it('an expired round can be cleared without automatically sending another paid request',async()=>{
 setup([{assetId:'photo-1'},{assetId:'photo-2'}]);const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{const value=await base(path,...args);return path==='/me/dating-profile'?{...value,avatarAttempt:{attemptId:'expired',producedCount:1,status:'open',expiresAt:1799999999000}}:value;});
 render(<DatingProfileScreen/>);await openAi();
 expect(screen.getByText('重新嘗試可能增加第三方供應商成本；本 MVP 目前免費，不扣款。')).toBeTruthy();fireEvent.click(screen.getByLabelText('開始新的一輪'));expect(screen.getByLabelText('開始產生第1張')).toBeTruthy();
 expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/generations')).toBe(false);
});
it('AP-BDD-057 selecting and cancelling a photo shows purpose notice without uploading',async()=>{
 setup();state.pick.mockResolvedValue({canceled:true});render(<DatingProfileScreen/>);
 await openAi();
 await screen.findByText('請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱');
 expect(screen.getByText('照片會在你主動使用 AI 時提供第三方生成服務；初期不向其他玩家公開。')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('新增個人照片'));
 await waitFor(()=>expect(state.pick).toHaveBeenCalledOnce());expect(state.uploadPhoto).not.toHaveBeenCalled();
});
it('AP-BDD-061 entering AI page never sends photos and shows third-party disclosure',async()=>{
 setup();render(<DatingProfileScreen/>);
 await openAi();
 expect(screen.getByText('產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家')).toBeTruthy();
 expect(screen.getByText(/至少需要 2 張已保存的個人照片/)).toBeTruthy();
 expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/generations')).toBe(false);
});
it('AP-BDD-065 invalid profile remains editable and never saves',async()=>{
 setup();render(<DatingProfileScreen/>);
 const nickname=await screen.findByLabelText('暱稱');fireEvent.change(nickname,{target:{value:'短'}});
 fireEvent.click(screen.getByLabelText('儲存'));
 await screen.findByText('暱稱須為 2 至 12 個字');
 expect(state.request.mock.calls.some(([,method])=>method==='PUT')).toBe(false);
});

it('AP-BDD-073 adopt cancellation preserves a completed candidate and never submits selection',async()=>{
 setup([{assetId:'photo-1'},{assetId:'photo-2'}]);
 const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>path==='/me/avatar/generations'?{
  attemptId:'attempt-1',index:1,producedCount:1,expiresAt:1800003600000
 }:base(path,...args));
 render(<DatingProfileScreen/>);
 await openAi();
 fireEvent.click(screen.getByLabelText('開始產生第1張'));
 fireEvent.click(await screen.findByLabelText('採用這張'));
 expect(screen.getByText(/未來正式付費上線後/)).toBeTruthy();
 fireEvent.click(screen.getByLabelText(/^取消$/));
 expect(screen.getByLabelText('比較候選 1')).toBeTruthy();
 expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/selection')).toBe(false);
 expect(state.request.mock.calls.filter(([path])=>path==='/me/avatar/generations')).toHaveLength(1);
},20000);

it('four incremental results remain comparable and selecting the first submits only that index',async()=>{
 setup([{assetId:'photo-1'},{assetId:'photo-2'}]);const base=state.request.getMockImplementation()!;let generated=0;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>path==='/me/avatar/generations'?{attemptId:'round',index:++generated,producedCount:generated,expiresAt:1800003600000}:base(path,...args));
 render(<DatingProfileScreen/>);await openAi();
 for(let index=1;index<=4;index++){
  fireEvent.click(screen.getByLabelText(index===1?'開始產生第1張':'產生下一張'));
  await screen.findByLabelText(`比較候選 ${index}`);
  if(index<4)await waitFor(()=>expect(screen.getByLabelText('產生下一張').getAttribute('aria-disabled')).not.toBe('true'));
 }
 expect(screen.getAllByLabelText(/比較候選/)).toHaveLength(4);
 expect(screen.getByLabelText('產生下一張').getAttribute('aria-disabled')).toBe('true');expect(generated).toBe(4);
 fireEvent.click(screen.getByLabelText('比較候選 1'));fireEvent.click(screen.getByLabelText('採用這張'));fireEvent.click(screen.getByLabelText('確認採用'));
 await waitFor(()=>expect(state.request).toHaveBeenCalledWith('/me/avatar/selection','PUT',{type:'generated',attemptId:'round',index:1,expectedRevision:1}));
 expect(generated).toBe(4);
});

it('an uncertain third result retains two valid candidates and never automatically calls the provider again',async()=>{
 setup([{assetId:'photo-1'},{assetId:'photo-2'}]);const base=state.request.getMockImplementation()!;let generated=0;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{
  if(path==='/me/avatar/generations'){
   generated++;if(generated===3)throw new ApiFailure('IMAGE_PROVIDER_UNCERTAIN',503);
   return {attemptId:'round',index:generated,producedCount:generated,expiresAt:1800003600000};
  }
  const value=await base(path,...args);return path==='/me/dating-profile'&&generated===3?{...value,avatarAttempt:{attemptId:'round',producedCount:2,status:'uncertain',expiresAt:1800003600000}}:value;
 });
 render(<DatingProfileScreen/>);await openAi();
 fireEvent.click(screen.getByLabelText('開始產生第1張'));await screen.findByLabelText('比較候選 1');
 fireEvent.click(screen.getByLabelText('產生下一張'));await screen.findByLabelText('比較候選 2');
 fireEvent.click(screen.getByLabelText('產生下一張'));await screen.findByText(/生成結果與供應商用量尚未確認/);
 expect(screen.getByText('重新嘗試可能增加第三方供應商成本；本 MVP 目前免費，不扣款。')).toBeTruthy();
 expect(screen.getAllByLabelText(/比較候選/)).toHaveLength(2);expect(generated).toBe(3);
 expect(screen.getByLabelText('產生下一張').getAttribute('aria-disabled')).toBe('true');
 expect(screen.getByLabelText('採用這張').getAttribute('aria-disabled')).not.toBe('true');
});

it('leaving and reopening an unadopted round restores safe references without selection or automatic generation',async()=>{
 setup([{assetId:'one'},{assetId:'two'}]);const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{const value=await base(path,...args);return path==='/me/dating-profile'?{...value,selectedAvatarType:'builtin',selectedAvatarRef:'male-03',avatarAttempt:{attemptId:'retained-round',producedCount:2,status:'open',expiresAt:1800003600000}}:value;});
 const first=render(<DatingProfileScreen/>);await openAi();expect(screen.getByLabelText('比較候選 1')).toBeTruthy();expect(screen.getByLabelText('比較候選 2')).toBeTruthy();
 first.unmount();await act(async()=>{await Promise.resolve();});
 render(<DatingProfileScreen/>);await openAi();expect(screen.getByLabelText('比較候選 1')).toBeTruthy();expect(screen.getByLabelText('比較候選 2')).toBeTruthy();expect(state.request.mock.calls.filter(([path])=>path==='/me/dating-profile')).toHaveLength(2);
 expect(state.request.mock.calls.some(([,method])=>method==='PUT'||method==='POST')).toBe(false);expect(state.request.mock.calls.some(([path])=>path==='/me/avatar/generations')).toBe(false);
});

it('save is hidden until a semantic change, and restoring values hides it again',async()=>{
 setup();render(<DatingProfileScreen/>);const bio=await screen.findByLabelText('一句自我介紹');
 expect(screen.queryByLabelText('儲存')).toBeNull();
 fireEvent.change(bio,{target:{value:'改過'}});expect(screen.getByLabelText('儲存')).toBeTruthy();
 fireEvent.change(bio,{target:{value:'  '}});expect(screen.queryByLabelText('儲存')).toBeNull();
 fireEvent.click(screen.getByLabelText('開放生理性別'));expect(screen.getByLabelText('儲存')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('開放生理性別'));expect(screen.queryByLabelText('儲存')).toBeNull();
});
it('back confirms dirty changes; cancellation preserves the draft and discard uses the account fallback',async()=>{
 setup();render(<DatingProfileScreen/>);fireEvent.change(await screen.findByLabelText('一句自我介紹'),{target:{value:'草稿'}});
 fireEvent.click(screen.getByLabelText('返回'));await screen.findByText('捨棄未儲存的修改？');fireEvent.click(screen.getByLabelText('取消'));
 expect(state.router.replace).not.toHaveBeenCalled();expect((screen.getByLabelText('一句自我介紹') as HTMLInputElement).value).toBe('草稿');
 fireEvent.click(screen.getByLabelText('返回'));fireEvent.click(screen.getByLabelText('捨棄修改'));expect(state.router.replace).toHaveBeenCalledWith('/account');
});
it.each([null,'conflict','uncertain','read-failure'])('preview saves a changed draft and only navigates after a successful reread: %s',async failure=>{
 setup();const base=state.request.getMockImplementation()!;let saved=false;
 state.request.mockImplementation(async(path:string,method?:string,...args:unknown[])=>{
  if(method==='PUT'&&path==='/me/dating-profile'){
   if(failure==='conflict')throw new ApiFailure('PROFILE_VERSION_CONFLICT',409);
   if(failure==='uncertain')throw new ApiFailure('UNKNOWN_RESULT',0,undefined,0,true);
   saved=true;
  }
  if(saved&&failure==='read-failure'&&path==='/me/dating-profile'&&!method)throw new ApiFailure('DEPENDENCY_UNAVAILABLE',503);
  return base(path,method,...args);
 });
 render(<DatingProfileScreen/>);fireEvent.change(await screen.findByLabelText('一句自我介紹'),{target:{value:'先儲存'}});
 fireEvent.click(screen.getByLabelText('預覽同意後的名片'));
 await waitFor(()=>expect(state.request.mock.calls.filter(([p,m])=>p==='/me/dating-profile'&&m==='PUT')).toHaveLength(1));
 await waitFor(()=>expect(screen.queryByLabelText('連線中，請稍候…')).toBeNull());
 if(!failure)await waitFor(()=>expect(state.router.push).toHaveBeenCalledWith('/card-preview'));
 else expect(state.router.push).not.toHaveBeenCalled();
});
it.each(['male','female','diverse'])('free avatar choices follow saved gender %s and are withheld after unsaved gender changes',async gender=>{
 setup();const base=state.request.getMockImplementation()!;
 state.request.mockImplementation(async(path:string,...args:unknown[])=>{
  const result=await base(path,...args);
  if(path==='/avatar-catalog')return {avatars:['male','female'].flatMap(group=>Array.from({length:8},(_,i)=>({id:`${group}-0${i+1}`,group})))};
  if(path==='/profile-catalog')return {...result,groups:{gender:['male','female','diverse'].map(id=>({id,label:id,active:true}))}};
  return path==='/me/dating-profile'?{...result,gender}:result;
 });
 render(<DatingProfileScreen/>);await openAvatars();expect(screen.getAllByLabelText(/^選用 (male|female)-/)).toHaveLength(gender==='diverse'?16:8);
 fireEvent.click(screen.getByLabelText('關閉'));fireEvent.click(screen.getByLabelText('生理性別：'+(gender==='male'?'female':'male')));await openAvatars();
 expect(screen.queryAllByLabelText(/^選用 (male|female)-/)).toHaveLength(0);expect(screen.getByText('請先儲存生理性別，再選擇免費化身')).toBeTruthy();
});

it('read-only card uses only returned shareable fields and never resolves closed photos',()=>{
 const photo=vi.fn(()=>({uri:'safe'}));
 render(<CardDisplay card={{bio:'可見文字'}} fields={definitions as ProfileField[]} groups={{}} photoSource={photo}/>);
 expect(screen.getByText('可見文字')).toBeTruthy();expect(screen.queryByRole('switch')).toBeNull();expect(photo).not.toHaveBeenCalled();
 expect(screen.queryByText('暱稱')).toBeNull();
});
it('a supported added field renders in a card only when the server returns it',()=>{
 const field={key:'futureField',cardKey:'futureField',label:'新增欄位',type:'text',order:99,editor:'text',storage:'future_field',shareable:true} as ProfileField;
 render(<CardDisplay card={{futureField:'新資料'}} fields={[...definitions as ProfileField[],field]} groups={{}} photoSource={()=>({uri:'safe'})}/>);
 expect(screen.getByText('新增欄位')).toBeTruthy();expect(screen.getByText('新資料')).toBeTruthy();
});

it('a supported field editor in the common definition drives the editing control independently of its stored text type',async()=>{
 setup();const base=state.request.getMockImplementation()!;
 const extra={key:'extraField',cardKey:'extraField',label:'額外欄位',type:'text',editor:'choice',storage:'extra_field',shareable:true,order:100};
 state.request.mockImplementation(async(path:string,...args:unknown[])=>path==='/profile-catalog'?{fields:[...definitions,extra],groups:{extraField:[{id:'extra_one',label:'額外選項',active:true}]}}:base(path,...args));
 render(<DatingProfileScreen/>);const option=await screen.findByRole('checkbox',{name:'額外選項',checked:false});fireEvent.click(option);
 expect(screen.getByRole('checkbox',{name:'額外選項',checked:true})).toBeTruthy();expect(screen.getByRole('switch',{name:'開放額外欄位',checked:false})).toBeTruthy();
});
it('a cached card clears its previous fields on blur and waits for a fresh read on reentry',async()=>{
 let reads=0;let finish!:((value:unknown)=>void);
 state.request.mockImplementation(async(path:string)=>path==='/profile-catalog'?{fields:definitions,groups:{}}:++reads===1?{bio:'舊資料'}:new Promise(resolve=>{finish=resolve;}));
 const view=render(<CardPreviewScreen/>);await screen.findByText('舊資料');
 state.focused=false;view.rerender(<CardPreviewScreen/>);expect(screen.queryByText('舊資料')).toBeNull();
 state.focused=true;view.rerender(<CardPreviewScreen/>);expect(screen.queryByText('舊資料')).toBeNull();
 await act(async()=>{finish({bio:'新資料'});});await screen.findByText('新資料');expect(reads).toBe(2);
});
