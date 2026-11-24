// @vitest-environment jsdom
import React from 'react';
import {expect,it,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
import catalog from '../../../../contracts/builtin-static-poses.json';
const state=vi.hoisted(()=>({request:vi.fn(),send:vi.fn(),sync:()=>Promise.resolve(),avatarUpdate:()=>Promise.resolve(),router:{replace:vi.fn(),push:vi.fn()}}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),useWindowDimensions:()=>({width:1000,height:800}),Image:({source,onLoad,onError,testID,style}:any)=><img src={source?.uri} onLoad={onLoad} onError={onError} data-testid={testID} style={style}/> }));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-router',()=>({useRouter:()=>state.router,useLocalSearchParams:()=>({roundId:'round'}),useFocusEffect:(f:()=>void)=>React.useEffect(f,[f])}));
vi.mock('expo-crypto',()=>({getRandomValues:(b:Uint8Array<ArrayBuffer>)=>crypto.getRandomValues(b)}));
vi.mock('../../src/StoryAudio',()=>({StoryAudio:()=>null}));
vi.mock('../../src/session',()=>({api:{origin:'http://localhost',platform:'web',account:{accountId:'me'},sessionId:'session',request:state.request},useSession:()=>({ready:true})}));
vi.mock('../../src/RealtimeRoomClient',()=>({RealtimeRoomClient:class{constructor(_a:unknown,_r:string,c:any){state.sync=c.sync;state.avatarUpdate=c.avatarUpdated;this.c=c;}c:any;start(){this.c.status('connected');}stop(){}synchronize(){return state.sync();}send(...args:any[]){return state.send(...args);}presence(){}}}));
import {StoryExperienceScreen} from '../../src/StoryExperienceScreen';
import {ApiFailure} from '../../src/api';
afterEach(cleanup);
it('an existing AI avatar without pose sheets shows a usable upgrade path instead of an endless scene loading message',async()=>{
 state.send.mockClear();const own=avatar('my-avatar','female-01');delete (own as any).staticPosePackage;
 state.request.mockImplementation(async(path:string)=>path.endsWith('/experience')?stageExperience():path.endsWith('/my-avatar')?own:path.endsWith('/partner-avatar')?avatar('partner-avatar','male-01'):path.endsWith('/events/query')?{events:[],cursor:1,hasMore:false}:{persona:{nickname:'對方'}});
 render(<StoryExperienceScreen/>);for(const image of await screen.findAllByTestId(/^static-preload-/))fireEvent.load(image);
 expect(await screen.findByText(/你的 AI 角色尚未具備四種姿態/)).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'補齊目前角色的姿態'}));expect(state.router.push).toHaveBeenCalledWith('/profile?completeAvatarPoses=1');expect(state.send).not.toHaveBeenCalled();
});
const avatar=(channel:string,id:'female-01'|'male-01')=>{
 const version=(channel==='my-avatar'?'a':'b').repeat(64),p=catalog.packs[id];
 return {avatarAssetId:id,avatarVersion:version,expressionSpecVersion:'v1',avatarAssetSpecVersion:'full-body.v1',framing:'full_body',pose:'standing',stageAnchors:{head:{x:.5,y:.08},feet:{x:.5,y:.96}},expressions:Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map(e=>[e,{url:`/api/v1/game-rounds/round/${channel}/${version}/${e}`,sha256:'a'.repeat(64),mimeType:'image/webp',width:768,height:1024,byteSize:3}])),staticPosePackage:{schemaVersion:p.schemaVersion,packageVersion:(channel==='my-avatar'?'c':'d').repeat(64),assets:p.assets.map(a=>({...a,url:`/api/v1/game-rounds/round/${channel}/${version}/static-${a.sha256}`})),poses:p.poses}};
};
function stageExperience():any{return {phase:'playing',schemaVersion:'scene-event.v2',storySessionId:'story',eventSeq:1,chapterStatus:'playing',title:'正式角色接線',currentNode:{id:'i01',title:'閱讀角',lines:[{speaker:'旁白',text:'雨聲'}],choices:[],objects:[],presentation:{cameraId:'wide'}},myTrack:{role:'inviter',areaId:'reading',revision:1},sharedRevision:1,areas:[{id:'reading',title:'閱讀角'}],partnerPresence:{inSameArea:true},world:{objects:[],flags:{}},knownClues:[],cooperation:[],availableEvents:[{bindingId:'narrative:read:next',main:true,moduleType:'inspect-object',trackScope:'inviter',revision:null,needsSharedRevision:false,actions:[{actionId:'next',label:'繼續閱讀',params:{}}]}],suggestions:[],assets:[{id:'bg',url:'/bg.png'}],scenePresentation:{cameras:[{id:'wide',scale:1,focus:{x:.5,y:.5},portrait:{x:.5,headY:.1,height:.8},tint:'#000',tintOpacity:0}],hotspots:[],foreground:[]},stage:{version:'scene-stage.v1',currentShotId:'read',shots:[{id:'read',areaId:'reading',cameraId:'wide',actors:['inviter','acceptor'].map(actorId=>({actorId,pose:'read',expression:'smile',gesture:'idle',position:{x:actorId==='inviter'?.3:.7,y:.9},height:.8,depth:3})),audioCueIds:[]}],areaVisuals:[{areaId:'reading',backgroundAsset:'bg',defaultShotId:'read',layers:[]}],embeddedInteractables:[],npcs:[]}};}
it('SEF static player integration: decode all sheets before interaction, map both roles and clear stale private art on refresh failure',async()=>{
 let rejectPartner=false;
 const exp:any=stageExperience();
 state.request.mockImplementation(async(path:string)=>{
  if(path.endsWith('/experience'))return exp;
  if(path.endsWith('/my-avatar'))return avatar('my-avatar','female-01');
  if(path.endsWith('/partner-avatar')){if(rejectPartner)throw new ApiFailure('AVATAR_PACK_UNAVAILABLE',503);return avatar('partner-avatar','male-01');}
  if(path.endsWith('/events/query'))return {events:[],cursor:1,hasMore:false};
  return {persona:{nickname:'對方'}};
 });
 render(<StoryExperienceScreen/>);
 const action=await screen.findByLabelText('繼續閱讀');expect(action.getAttribute('aria-disabled')).toBe('true');
 const preloads=await screen.findAllByTestId(/^static-preload-/);expect(preloads).toHaveLength(8);
 for(const image of preloads.slice(0,7))fireEvent.load(image);expect(action.getAttribute('aria-disabled')).toBe('true');
 fireEvent.load(preloads[7]);await waitFor(()=>expect(action.getAttribute('aria-disabled')).not.toBe('true'));
 expect(screen.getAllByTestId('actor-layer-body')).toHaveLength(2);
 expect(screen.getByTestId('actor-identity-'+ 'c'.repeat(64))).toBeTruthy();expect(screen.getByTestId('actor-identity-'+ 'd'.repeat(64))).toBeTruthy();
 rejectPartner=true;await act(async()=>state.avatarUpdate());
 await waitFor(()=>expect(screen.queryByTestId('actor-identity-'+ 'd'.repeat(64))).toBeNull());
 expect(screen.getByLabelText('繼續閱讀').getAttribute('aria-disabled')).toBe('true');expect(state.send).not.toHaveBeenCalled();
});

it('legacy V2 keeps story and chat usable when an optional partner static sheet fails to decode',async()=>{
 const exp=stageExperience();delete exp.stage;
 state.request.mockImplementation(async(path:string)=>{
  if(path.endsWith('/experience'))return exp;
  if(path.endsWith('/my-avatar'))return avatar('my-avatar','female-01');
  if(path.endsWith('/partner-avatar'))return avatar('partner-avatar','male-01');
  if(path.endsWith('/events/query'))return {events:[],cursor:1,hasMore:false};
  return {persona:{nickname:'對方'}};
 });
 render(<StoryExperienceScreen/>);
 const action=await screen.findByLabelText('繼續閱讀');expect(action.getAttribute('aria-disabled')).not.toBe('true');
 const images=await screen.findAllByTestId(/^static-preload-partner-avatar/);fireEvent.error(images[0]);
 await waitFor(()=>expect(screen.getByLabelText('繼續閱讀').getAttribute('aria-disabled')).not.toBe('true'));
});
it('a stage image failure remains explained after synchronization and explicit reload re-decodes before restoring actions without submitting',async()=>{
 let sequence=1;state.send.mockClear();state.request.mockImplementation(async(path:string)=>{
  if(path.endsWith('/experience'))return {...stageExperience(),eventSeq:sequence};
  if(path.endsWith('/my-avatar'))return avatar('my-avatar','female-01');
  if(path.endsWith('/partner-avatar'))return avatar('partner-avatar','male-01');
  if(path.endsWith('/events/query'))return {events:[],cursor:sequence,hasMore:false};
  return {persona:{nickname:'對方'}};
 });
 render(<StoryExperienceScreen/>);const old=await screen.findAllByTestId(/^static-preload-/);for(const image of old)fireEvent.load(image);
 await waitFor(()=>expect(screen.getByLabelText('繼續閱讀').getAttribute('aria-disabled')).not.toBe('true'));
 fireEvent.click(screen.getByLabelText('關閉場景微動'));
 fireEvent.error(screen.getByTestId('area-background'));sequence=2;await act(async()=>state.sync());
 expect(screen.getByText(/場景圖片載入失敗/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'重新載入場景素材'}));
 const reloaded=await screen.findAllByTestId(/^static-preload-/);expect(reloaded[0]).not.toBe(old[0]);expect(screen.getByLabelText('繼續閱讀').getAttribute('aria-disabled')).toBe('true');
 for(const image of reloaded)fireEvent.load(image);await waitFor(()=>expect(screen.getByLabelText('繼續閱讀').getAttribute('aria-disabled')).not.toBe('true'));
 expect(screen.getByLabelText('開啟場景微動')).toBeTruthy();
 expect(state.send).not.toHaveBeenCalled();expect(state.request.mock.calls.every(([path])=>!String(path).includes('/avatar/expressions/'))).toBe(true);
});
