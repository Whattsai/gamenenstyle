import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Image,Keyboard,KeyboardAvoidingView,Modal,Platform,ScrollView,Text,TextInput,View,useWindowDimensions,type ImageSourcePropType} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useLocalSearchParams,useRouter} from 'expo-router';
import {api,useSession} from './session';
import {ApiFailure} from './api';
import {matchingRequestId,type CandidatePersona} from './matching';
import {PrimaryButton,InlineNotice,LoadingOverlay,colors,s} from './ui';
import {ADVStage} from './ADVStage';
import {StorySubmissionStatus} from './StorySubmissionStatus';
import {StoryAudio} from './StoryAudio';
import {RealtimeRoomClient,type RoomConnection} from './RealtimeRoomClient';
import {detectExitIntent,mergeRoundEvents,validStoryMessage,type StoryExperience,type RoundEvent} from './story';
import {parseStoryAvatar,type StoryAvatarProjection} from './story-avatar';
import {StaticAvatarPreload} from './StaticAvatarPreload';
import {staticStageActors} from './static-avatar';
import {SceneEventActions} from './SceneEventActions';
import {canPresentPublishedStage} from './scene-stage';
import {isTrackExperience,trackActionPayload,SceneCueFence,type AvailableSceneEvent,type SceneEventAction,type PresentationStep} from './scene-event-track';

type Pending={id:string;type:string;payload:Record<string,unknown>;text?:string;state:'sending'|'unknown'|'committed'};
/** 真實雙人 StorySession、Round chat 與退出；狀態只接受授權 snapshot／事件。 */
export function StoryExperienceScreen(){
 const {roundId}=useLocalSearchParams<{roundId:string}>(),router=useRouter(),session=useSession(),{width,height}=useWindowDimensions();
 const [keyboard,setKeyboard]=useState(false);
 const [ownAvatarBlocked,setOwnAvatarBlocked]=useState(false);
 const [stageSpace,setStageSpace]=useState<number|undefined>();
 const [stageMediaUnavailable,setStageMediaUnavailable]=useState(false);
 const [mediaReload,setMediaReload]=useState(0);
 const [headerHeight,setHeaderHeight]=useState(0);
 useEffect(()=>{const show=Keyboard.addListener('keyboardDidShow',()=>setKeyboard(true)),hide=Keyboard.addListener('keyboardDidHide',()=>setKeyboard(false));return()=>{show.remove();hide.remove();};},[]);
 const [experience,setExperience]=useState<StoryExperience|null>(null),[events,setEvents]=useState<RoundEvent[]>([]),[partner,setPartner]=useState<CandidatePersona|null>(null),[chatOpen,setChatOpen]=useState(false);
 const [ownAvatar,setOwnAvatar]=useState<StoryAvatarProjection|null>(null);
 const [staticDecoded,setStaticDecoded]=useState<Record<string,boolean>>({});
 const [storySteps,setStorySteps]=useState<PresentationStep[]>([]),[cueSequence,setCueSequence]=useState(0);
 const cueFence=useRef(new SceneCueFence()),latestSnapshot=useRef<StoryExperience|null>(null);
 const [avatar,setAvatar]=useState<StoryAvatarProjection|null>(null),avatarRead=useRef<Promise<void>|undefined>(undefined);
 const avatarReadAgain=useRef(false);
 const [connection,setConnection]=useState<RoomConnection>('connecting'),[notice,setNotice]=useState(''),[text,setText]=useState(''),[pending,setPending]=useState<Pending|null>(null),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false),[intent,setIntent]=useState(false),[object,setObject]=useState<string|null>(null),[hasEarlier,setHasEarlier]=useState(false),[typing,setTyping]=useState(false);
 const live=useRef(false),generation=useRef(0),cursor=useRef(0),initialized=useRef(false),allEvents=useRef<RoundEvent[]>([]),room=useRef<RealtimeRoomClient|null>(null),gate=useRef(false),pendingRef=useRef<Pending|null>(null),typingTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),typingAt=useRef(0);
 const currentSession=api.sessionId;
 const stageSession=useRef<string|undefined>(undefined);
 const snapshotSequence=useRef(0);
 const clearPrivate=()=>{allEvents.current=[];setEvents([]);setPartner(null);setAvatar(null);setOwnAvatar(null);setStaticDecoded({});setStorySteps([]);latestSnapshot.current=null;cueFence.current.reset();setPending(null);pendingRef.current=null;setText('');setObject(null);setIntent(false);setConfirm(false);};
 const failure=useCallback((error:unknown)=>{
  if(error instanceof ApiFailure&&error.code==='OWN_AVATAR_PACK_NOT_READY'){generation.current++;live.current=false;clearPrivate();setExperience(null);room.current?.stop();setConnection('offline');setOwnAvatarBlocked(true);return;}
  if(error instanceof ApiFailure&&error.status===401){generation.current++;live.current=false;clearPrivate();setExperience(null);room.current?.stop();router.replace('/login');return;}
  if(error instanceof ApiFailure&&error.status===403){generation.current++;live.current=false;clearPrivate();setExperience(null);room.current?.stop();router.replace('/start');return;}
  if(error instanceof ApiFailure&&error.code==='INVALID_STORY_CONTENT'){setNotice('無法載入劇情內容，請重新同步後再試。');return;}
  setNotice(error instanceof ApiFailure&&error.status===409?'場景狀態已更新，請重新同步後再操作。':'目前無法確認狀態，請重新同步。');
 },[router]);
 const refreshAvatar=useCallback(async()=>{
  if(avatarRead.current){avatarReadAgain.current=true;return avatarRead.current;}const run=generation.current;
  const task=(async()=>{
   do{
    avatarReadAgain.current=false;
    const results=await Promise.allSettled(['partner-avatar','my-avatar'].map(async channel=>({channel,result:await api.request(`/game-rounds/${roundId}/${channel}`)})));
    for(const [resultIndex,result] of results.entries()){if(!live.current||run!==generation.current)return;
     if(result.status==='fulfilled'){try{const parsed=parseStoryAvatar(result.value.result,roundId,result.value.channel as 'partner-avatar'|'my-avatar');if(result.value.channel==='my-avatar')setOwnAvatar(parsed);else setAvatar(parsed);}catch{if(result.value.channel==='my-avatar')setOwnAvatar(null);else setAvatar(null);}}
     else{const error=result.reason;if(error instanceof ApiFailure&&(error.status===401||error.status===403||error.code==='OWN_AVATAR_PACK_NOT_READY')){failure(error);throw error;}if(resultIndex===1)setOwnAvatar(null);else setAvatar(null);}
    }
   }while(avatarReadAgain.current&&live.current&&run===generation.current);
  })();avatarRead.current=task;
  try{await task;}finally{if(avatarRead.current===task)avatarRead.current=undefined;}
 },[roundId,failure]);
 const sync=useCallback(async()=>{
  const run=generation.current;if(!live.current||!api.account)return;
  try{
   for(let attempt=0;attempt<5;attempt++){
   const snapshot=await api.request(`/game-rounds/${roundId}/experience`) as StoryExperience;
   if(!live.current||run!==generation.current)return;
   if(snapshot.phase==='ended'){generation.current++;live.current=false;clearPrivate();setExperience(snapshot);room.current?.stop();setConnection('offline');return;}
   if(snapshot.eventSeq<snapshotSequence.current)return;snapshotSequence.current=snapshot.eventSeq;
   if(stageSession.current!==snapshot.storySessionId){
    stageSession.current=snapshot.storySessionId;setObject(null);setStageSpace(undefined);setStageMediaUnavailable(false);
    if(pendingRef.current&&pendingRef.current.type!=='message.send'){
     pendingRef.current=null;setPending(null);gate.current=false;setBusy(false);
    }
   }
   if(snapshot.chapterStatus==='completed'){setObject(null);}
   if(isTrackExperience(snapshot)){
    const previous=latestSnapshot.current,newSession=previous?.storySessionId!==snapshot.storySessionId;
    const focused=(AppState.currentState==null||AppState.currentState==='active')&&(Platform.OS!=='web'||typeof document!=='undefined'&&document.visibilityState!=='hidden'&&document.hasFocus());
    let steps=cueFence.current.accept(snapshot.storySessionId!,snapshot.eventSeq,snapshot.presentationCue,focused);
    const nodeChanged=previous?.currentNode?.id!==snapshot.currentNode?.id,areaChanged=isTrackExperience(previous)&&previous.myTrack.areaId!==snapshot.myTrack.areaId,cueChanged=previous?.presentationCue?.eventSeq!==snapshot.presentationCue?.eventSeq;
    if(newSession||nodeChanged)setObject(null);
    if(newSession||nodeChanged||areaChanged||cueChanged)setStorySteps(steps);else if(steps.length)setStorySteps(steps);
    if(steps.length)setCueSequence(snapshot.presentationCue?.eventSeq??snapshot.eventSeq);
   }
   latestSnapshot.current=snapshot;
   setExperience(snapshot);
   if(!initialized.current){
    const [pair,history]=await Promise.all([api.request(`/game-rounds/${roundId}`),api.request(`/game-rounds/${roundId}/events/query`,'POST',{beforeSeq:snapshot.eventSeq+1,limit:50}),refreshAvatar()]);
    if(!live.current||run!==generation.current)return;setPartner(pair.persona);allEvents.current=mergeRoundEvents([],history.events);cursor.current=snapshot.eventSeq;setHasEarlier(history.hasMore);initialized.current=true;
   }
   let more=true;while(more&&live.current&&run===generation.current){
    const result=await api.request(`/game-rounds/${roundId}/events/query`,'POST',{afterSeq:cursor.current,limit:100});
    if(!live.current||run!==generation.current)return;allEvents.current=mergeRoundEvents(allEvents.current,result.events);cursor.current=Math.max(cursor.current,result.cursor);more=result.hasMore;
   }
   setEvents([...allEvents.current]);
   // R2 snapshot 與事件 query 之間可能有新提交；游標追上不代表舊 snapshot 已更新。
   if(cursor.current>snapshot.eventSeq)continue;
   if(pendingRef.current&&allEvents.current.some(e=>e.clientRequestId===pendingRef.current!.id&&e.actorAccountId===api.account?.accountId)){const sentMessage=pendingRef.current.type==='message.send';pendingRef.current=null;setPending(null);gate.current=false;setBusy(false);if(sentMessage)setText('');}
   setNotice('');return;
   }
   throw new ApiFailure('DEPENDENCY_UNAVAILABLE',503);
  }catch(error){if(live.current&&run===generation.current){failure(error);throw error;}}
 },[roundId,failure,refreshAvatar]);
 useFocusEffect(useCallback(()=>{
  if(!session.ready)return;if(!api.account){router.replace('/login');return;}
  live.current=true;generation.current++;setStageMediaUnavailable(false);cursor.current=0;snapshotSequence.current=0;initialized.current=false;allEvents.current=[];setExperience(null);setEvents([]);setStorySteps([]);setBusy(false);setOwnAvatarBlocked(false);
  const client=new RealtimeRoomClient(api,roundId,{sync,status:setConnection,avatarUpdated:async()=>{await sync();if(live.current)await refreshAvatar();},reconnected:refreshAvatar,presence:p=>{if(p.actorAccountId===api.account?.accountId)return;setTyping(p.typing===true);clearTimeout(typingTimer.current);typingTimer.current=setTimeout(()=>setTyping(false),Math.min(5000,p.ttlMs??5000));}},matchingRequestId());room.current=client;
  void sync().catch(()=>{});client.start();
  const foreground=()=>{if(!live.current)return;setTyping(false);client.start();void Promise.all([client.synchronize(),refreshAvatar()]).catch(()=>{});};
  const background=()=>{cueFence.current.suspend();setStorySteps([]);};
  const subscription=AppState.addEventListener('change',state=>{if(state==='active')foreground();else{background();client.stop();setConnection('offline');setTyping(false);}});
  if(Platform.OS==='web'){window.addEventListener('focus',foreground);window.addEventListener('blur',background);}
  return()=>{live.current=false;generation.current++;avatarRead.current=undefined;avatarReadAgain.current=false;client.stop();room.current=null;subscription.remove();clearTimeout(typingTimer.current);if(Platform.OS==='web'){window.removeEventListener('focus',foreground);window.removeEventListener('blur',background);}clearPrivate();gate.current=false;};
 },[session.ready,roundId,currentSession,sync,router,refreshAvatar]));
 const mutate=async(type:string,payload:Record<string,unknown>,messageText?:string)=>{
  if(gate.current||pendingRef.current||connection!=='connected')return;gate.current=true;setBusy(true);setNotice('');
  const run=generation.current,client=room.current!,stage=stageSession.current;
  const current=()=>live.current&&run===generation.current&&(type==='message.send'||stage===stageSession.current);
  const operation:Pending={id:matchingRequestId(),type,payload,text:messageText,state:'sending'};pendingRef.current=operation;setPending(operation);
  try{await client.send(type,operation.id,payload);if(!current()||pendingRef.current?.id!==operation.id)return;pendingRef.current={...operation,state:'committed'};setPending(pendingRef.current);await client.synchronize();}
  catch(error){if(!current()||pendingRef.current?.id!==operation.id)return;if(error instanceof ApiFailure&&(error.uncertain||error.status>=500)){pendingRef.current={...operation,state:'unknown'};setPending(pendingRef.current);setNotice('目前無法確認送出結果，請重新同步。');}else{pendingRef.current=null;setPending(null);if(error instanceof ApiFailure&&error.status===409&&error.code!=='OWN_AVATAR_PACK_NOT_READY'){try{await client.synchronize();if(current())setNotice('場景狀態已更新，請再次操作。');}catch(syncError){if(current())failure(syncError);}}else failure(error);}}
  finally{if(current()&&(!pendingRef.current||pendingRef.current.id===operation.id)){gate.current=false;setBusy(false);}}
 };
 const recover=async()=>{
  if(gate.current||!pendingRef.current||connection!=='connected')return;gate.current=true;setBusy(true);
  const run=generation.current,client=room.current!,original=pendingRef.current,stage=stageSession.current;
  const current=()=>live.current&&run===generation.current&&(original.type==='message.send'||stage===stageSession.current);
  try{await client.synchronize();if(!current()||pendingRef.current?.id!==original.id)return;await client.send(original.type,original.id,original.payload);if(current())await client.synchronize();}
  catch(error){if(current()){failure(error);setNotice('目前無法確認送出結果，請重新同步。');}}
  finally{if(current()){gate.current=false;setBusy(false);}}
 };
 const submitTrackAction=(event:AvailableSceneEvent,action:SceneEventAction)=>{if(!isTrackExperience(experience)||!stageAssetReady||!stageCameraReady||stageMediaUnavailable)return;void mutate('story.event.submit',trackActionPayload(experience,event,action));};
 const dropObject=(id:string)=>{if(!isTrackExperience(experience)||experience.phase!=='playing'||!stageAssetReady||!stageCameraReady||stageMediaUnavailable)return;for(const event of experience.availableEvents){const action=event.actions.find(a=>a.dropSlotId&&(a.targetObjectId??a.params.objectId)===id);if(action){submitTrackAction(event,action);return;}}setNotice(experience.world.objects.find(o=>o.id===id)?.previewPlacement?.hint??'這件物品目前不能放在這裡；先核對線索，再試一次。');setObject(null);};
 const send=(skipIntent=false)=>{if(!validStoryMessage(text)||pendingRef.current)return;if(!skipIntent&&detectExitIntent(text)){setIntent(true);return;}setIntent(false);void mutate('message.send',{text:text.trim()},text.trim());};
 const end=async()=>{
  if(gate.current)return;gate.current=true;setBusy(true);setNotice('');
  const run=generation.current;
  try{const result=await api.request(`/game-rounds/${roundId}/end`,'POST',{});if(live.current&&run===generation.current&&result.status==='ended'){generation.current++;live.current=false;clearPrivate();setExperience({roundId,phase:'ended'} as StoryExperience);room.current?.stop();}}
  catch(error){if(live.current&&run===generation.current)failure(error);}
  finally{if(live.current&&run===generation.current){gate.current=false;setBusy(false);}}
 };
 const earlier=async()=>{
  if(!allEvents.current.length||busy)return;const run=generation.current;setBusy(true);try{const result=await api.request(`/game-rounds/${roundId}/events/query`,'POST',{beforeSeq:allEvents.current[0].eventSeq,limit:50});if(live.current&&run===generation.current){allEvents.current=mergeRoundEvents(allEvents.current,result.events);setEvents([...allEvents.current]);setHasEarlier(result.hasMore);}}catch(error){if(live.current&&run===generation.current)failure(error);}finally{if(live.current&&run===generation.current)setBusy(false);}
 };
 const asset=(id?:string)=>{const value=experience?.assets?.find(a=>a.id===id);return value?new URL(value.url,api.origin||globalThis.location?.origin).toString():undefined;};
 const portrait=():ImageSourcePropType|undefined=>{
  if(avatar)return {uri:new URL(avatar.expressions.neutral.url,api.origin||globalThis.location?.origin).toString(),...(api.platform==='web'?{}:{headers:{Authorization:`Bearer ${api.access}`}})};
  return undefined;
 };
 const portraitSources=avatar?Object.fromEntries(Object.entries(avatar.expressions).map(([expression,image])=>[expression,{uri:new URL(image.url,api.origin||globalThis.location?.origin).toString(),...(api.platform==='web'?{}:{headers:{Authorization:`Bearer ${api.access}`}})}])) as import('./StoryPortrait').StagePortrait['sources']:undefined;
 if(!api.account)return <View style={s.scene}><Text style={s.body}>登入已失效，請重新登入。</Text></View>;
 if(ownAvatarBlocked)return <View style={[s.scene,{alignItems:'center',justifyContent:'center',padding:24}]}><View style={[s.panel,{gap:20}]}><Text style={s.heading}>化身表情尚未就緒</Text><Text style={s.body}>目前採用的化身表情尚未準備好，請先到個人檔案選用已就緒的化身。</Text><PrimaryButton label="前往個人檔案" onPress={()=>router.replace('/profile')}/></View></View>;
 if(experience?.phase==='ended')return <View style={[s.scene,{alignItems:'center',justifyContent:'center',padding:24}]}><View style={[s.panel,{gap:20}]}><Text style={s.heading}>本輪互動已結束</Text><Text style={s.body}>謝謝你為這次相遇留下時間。你們將不再互相配對。</Text><PrimaryButton label="回到配對" onPress={()=>router.replace('/start')}/></View></View>;
 const disabled=busy||!!pending||connection!=='connected';const background=asset(experience?.backgroundAsset),audio=asset(experience?.audioAsset);
 const track=isTrackExperience(experience)?experience:undefined;
 const requiredStageShots=track?.stage?[track.stage.currentShotId,...storySteps.filter((s):s is Extract<PresentationStep,{type:'shot'}>=>s.type==='shot').map(s=>s.shotId)]:[];
 const staticIdentity=(channel:string,p:StoryAvatarProjection|null)=>p?.staticPosePackage?`${channel}:${p.avatarVersion}:${p.staticPosePackage.packageVersion}`:'';
 const ownStaticId=staticIdentity('my-avatar',ownAvatar),partnerStaticId=staticIdentity('partner-avatar',avatar);
 const staticHeaders=api.platform==='web'?undefined:{Authorization:`Bearer ${api.access}`};
 const staticOrigin=api.origin||globalThis.location?.origin;
 const actorRigsForShot=(shotId:string)=>track?.stage?staticStageActors(track.stage,shotId,{
  [track.myTrack.role]:staticDecoded[ownStaticId]?ownAvatar?.staticPosePackage:undefined,
  [track.myTrack.role==='inviter'?'acceptor':'inviter']:staticDecoded[partnerStaticId]?avatar?.staticPosePackage:undefined,
 },staticOrigin,staticHeaders):{};
 const stageAssetReady=!track?.stage||requiredStageShots.every(id=>canPresentPublishedStage(track.stage!,id,track.world.objects,asset,actorRigsForShot(id)));
 const stageCameraReady=!track?.stage||requiredStageShots.every(id=>{const shot=track.stage!.shots.find(s=>s.id===id);return !!shot&&!!experience?.scenePresentation?.cameras.some(c=>c.id===shot.cameraId);});
 const requiredPlayerRoles=new Set(track?.stage?.shots.filter(shot=>requiredStageShots.includes(shot.id)).flatMap(shot=>shot.actors.map(actor=>actor.actorId))??[]);
 const ownPosesMissing=!!track&&requiredPlayerRoles.has(track.myTrack.role)&&!!ownAvatar&&!ownAvatar.staticPosePackage;
 const partnerPosesMissing=!!track&&requiredPlayerRoles.has(track.myTrack.role==='inviter'?'acceptor':'inviter')&&!!avatar&&!avatar.staticPosePackage;
 const storyActionsDisabled=disabled||!stageAssetReady||!stageCameraReady||stageMediaUnavailable;
 const mediaNotice=ownPosesMissing?'你的 AI 角色尚未具備四種姿態，需先補齊目前角色的姿態才能呈現這個場景；劇情進度已保留。':partnerPosesMissing?'另一位旅人的 AI 角色尚未具備四種姿態，請對方補齊後重新確認角色素材；劇情進度已保留。':stageMediaUnavailable?'場景圖片載入失敗；可重新載入場景素材，聊天室仍可使用。':track?.stage&&(!stageAssetReady||!stageCameraReady)?'正在載入場景素材；若畫面停留，可重新載入。':notice;
 const reloadStageMedia=()=>{
  if(disabled||!track?.stage)return;
  cueFence.current.suspend();setStorySteps([]);setStaticDecoded({});setStageMediaUnavailable(false);setMediaReload(value=>value+1);setNotice('');
  void Promise.all([room.current?.synchronize(),refreshAvatar()]).catch(()=>{});
 };
 const audioStep=storySteps.findLast(step=>step.type==='audio');
 const failStaticAvatar=(id:string)=>{setStaticDecoded(previous=>({...previous,[id]:false}));if(track?.stage)setStageMediaUnavailable(true);setNotice(track?.stage?'角色圖片載入失敗；請重新進入房間以重新載入。場景操作暫停，聊天室仍可使用。':'角色圖片載入失敗；已保留原有角色顯示，仍可繼續劇情與聊天。');};
 const staticPortrait=(p:StoryAvatarProjection|null,id:string)=>p?.staticPosePackage&&staticDecoded[id]?{package:p.staticPosePackage,origin:staticOrigin,headers:staticHeaders,onError:()=>failStaticAvatar(id)}:undefined;
 const ownPortrait=ownAvatar?{name:'你',version:ownAvatar.avatarVersion,staticAvatar:staticPortrait(ownAvatar,ownStaticId),source:{uri:new URL(ownAvatar.expressions.neutral.url,api.origin||globalThis.location?.origin).toString(),...(api.platform==='web'?{}:{headers:{Authorization:`Bearer ${api.access}`}})},sources:Object.fromEntries(Object.entries(ownAvatar.expressions).map(([expression,image])=>[expression,{uri:new URL(image.url,api.origin||globalThis.location?.origin).toString(),...(api.platform==='web'?{}:{headers:{Authorization:`Bearer ${api.access}`}})}])) as import('./StoryPortrait').StagePortrait['sources'],anchors:ownAvatar.stageAnchors,expression:experience?.currentNode?.presentation?.expression}:undefined;
 const isWide=width>=900;
 const mobileDrawerHeight=Math.max(keyboard?148:206,Math.round(height*(keyboard?.27:.29)));
 const floatingDrawerWidth=isWide?356:Math.min(368,Math.max(276,width-12));
 const isFullBleedStage=!!experience?.currentNode&&!keyboard;
 const computedStageHeight=keyboard?Math.max(64,Math.round(height*.20)):(stageSpace??height);
 return <View style={[s.scene,{backgroundColor:'#12071c'}]}>
  {[{id:ownStaticId,package:ownAvatar?.staticPosePackage},{id:partnerStaticId,package:avatar?.staticPosePackage}].map(p=>p.package&&<StaticAvatarPreload key={`${p.id}:${mediaReload}`} identity={p.id} package={p.package} origin={staticOrigin} headers={staticHeaders} onReady={id=>setStaticDecoded(previous=>({...previous,[id]:true}))} onError={()=>failStaticAvatar(p.id)}/>)}
  {background&&!experience?.currentNode&&<Image source={{uri:background}} resizeMode="cover" style={{position:'absolute',width:'100%',height:'100%'}}/>}
  <View pointerEvents="none" style={{position:'absolute',width:'100%',height:'100%',backgroundColor:'rgba(16,7,26,.72)'}}/>
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'} enabled={!isWide}><SafeAreaView style={{flex:1,position:'relative'}}>
   <View pointerEvents="box-none" onLayout={event=>setHeaderHeight(event.nativeEvent.layout.height)} style={isFullBleedStage?{position:'absolute',left:0,right:0,top:0,zIndex:12,paddingHorizontal:width<600?10:18,paddingTop:8,paddingBottom:6}:{width:'100%',paddingHorizontal:width<600?10:18,paddingVertical:6,backgroundColor:'rgba(16,7,26,.96)',borderBottomWidth:1,borderColor:'rgba(255,190,220,.18)'}}>
    <View pointerEvents="box-none" style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}>
     <View style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:12,paddingVertical:5,borderRadius:999,backgroundColor:'rgba(20,8,32,.76)',borderWidth:1,borderColor:'rgba(255,218,235,.26)',boxShadow:'0 4px 16px rgba(0,0,0,.35)'}}>
      <Text style={[s.heading,{fontSize:16,lineHeight:20,textAlign:'left'}]}>{experience?.title??'專屬雙人房間'}</Text>
      <View style={{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:8,paddingVertical:2,borderRadius:999,backgroundColor:'rgba(123,224,184,.12)',borderWidth:1,borderColor:'rgba(123,224,184,.38)'}}>
       <View style={{width:6,height:6,borderRadius:999,backgroundColor:connection==='connected'?colors.mint:colors.gold}}/>
       <Text style={[s.subtleText,{fontSize:11}]}>{({connecting:'連線中',syncing:'正在同步進度',connected:'即時連線已同步',offline:'重新連線中；狀態尚未確認'})[connection]}</Text>
      </View>
      {(connection!=='connected'||notice.includes('重新同步'))&&<PrimaryButton label="重新同步" compact secondary disabled={busy} onPress={()=>void room.current?.synchronize().catch(()=>{})}/>}
     </View>
     <View style={{flexDirection:'row',gap:6,alignItems:'center',flexWrap:'wrap',paddingHorizontal:6,paddingVertical:3,borderRadius:999,backgroundColor:'rgba(20,8,32,.76)',borderWidth:1,borderColor:'rgba(255,218,235,.22)'}}>
      {!chatOpen&&<PrimaryButton label="展開聊天室" compact secondary onPress={()=>setChatOpen(true)}/>}
      {audio&&<StoryAudio key={experience?.storySessionId} url={audio} musicUrl={asset(experience?.musicAsset)} mix={experience?.audioMix?{...experience.audioMix,ambienceGain:experience.audioMix.ambienceGain*(track?.stage?.weather?.intensity==='easing'?.35:track?.stage?.weather?.intensity==='stopped'?0:track?.stage?.weather?.intensity==='steady'?.65:1)}:undefined} cueUrl={asset(audioStep?.type==='audio'?experience?.audioCues?.[audioStep.cueId]:undefined)} cueId={`${experience?.storySessionId}:${cueSequence}`}/>}
      <PrimaryButton label="結束本輪互動" compact secondary disabled={busy} onPress={()=>setConfirm(true)}/>
     </View>
    </View>
   </View>
   <View style={{flex:1,minHeight:0,width:'100%'}}>
    <View style={{flex:1,minHeight:0,width:'100%',position:'relative'}}>
     <View pointerEvents="box-none" style={isFullBleedStage?{position:'absolute',top:headerHeight,left:0,right:0,zIndex:13}:undefined}><InlineNotice text={mediaNotice}/>{ownPosesMissing&&<PrimaryButton label="補齊目前角色的姿態" compact disabled={disabled} onPress={()=>router.push('/profile?completeAvatarPoses=1')}/>}{track?.stage&&(stageMediaUnavailable||!stageAssetReady||!stageCameraReady)&&<PrimaryButton label={ownPosesMissing||partnerPosesMissing?'重新確認角色素材':'重新載入場景素材'} compact secondary disabled={disabled} onPress={reloadStageMedia}/>}{pending?.type!=='message.send'&&<StorySubmissionStatus state={pending?.state}/>}{pending?.state==='unknown'&&<PrimaryButton label="以原編號查回結果" secondary disabled={busy||connection!=='connected'} onPress={()=>void recover()}/>}</View>{!experience&&<LoadingOverlay/>}
     <Modal visible={confirm} transparent animationType="fade" onRequestClose={()=>{if(!busy)setConfirm(false);}}><View style={{flex:1,backgroundColor:'rgba(15,6,24,.8)',alignItems:'center',justifyContent:'center',padding:20}}><View style={[s.panel,{width:'100%',maxWidth:480,gap:16}]}><Text style={s.heading}>確定結束本輪互動？</Text><Text style={s.body}>確認後，你們將永久無法再次配對，也無法回讀本輪對話與互動。</Text><PrimaryButton label="確認結束" disabled={busy} onPress={()=>void end()}/><PrimaryButton label="繼續這段相遇" secondary disabled={busy} onPress={()=>setConfirm(false)}/></View></View></Modal>

     {experience&&(experience.phase==='playing'||['completed','pending_category_selection'].includes(experience.phase))&&<View style={{flex:1,minHeight:0,width:'100%',position:'relative'}}>
      <View onLayout={event=>{const value=event.nativeEvent.layout.height;if(value>0)setStageSpace(value);}} style={{flex:1,minHeight:0,width:'100%'}}>
       {experience?.phase==='pending_category_selection'&&<ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{flex:1,minHeight:0,paddingHorizontal:14,paddingVertical:12,marginRight:chatOpen&&isWide&&experience.phase==='pending_category_selection'?floatingDrawerWidth+12:0,marginBottom:chatOpen&&!isWide&&experience.phase==='pending_category_selection'?mobileDrawerHeight+8:0}} contentContainerStyle={{alignItems:'center'}}><View style={[s.panel,{maxWidth:720,alignSelf:'center'}]}><Text style={s.heading}>選擇下一場的主題</Text><Text style={s.body}>雙方都選好才開始；選擇不同時，以原邀請方的選擇為主。</Text>{experience.offers?.map(offer=>{const choiceId=offer.categoryId;return <View key={choiceId} style={{gap:8,padding:14,borderWidth:1,borderColor:experience.myVote===choiceId?'#ff7aa2':'#73546f',borderRadius:16}}>{offer.previewUrl&&<Image source={{uri:new URL(offer.previewUrl,api.origin||globalThis.location?.origin).toString()}} resizeMode="cover" style={{width:'100%',height:120,borderRadius:12}}/>}<Text style={s.label}>{offer.rank} · {offer.title}</Text><Text style={s.body}>{offer.summary}</Text><Text style={s.subtleText}>{offer.reason}</Text><PrimaryButton label={`${experience.myVote===choiceId?'已選擇':'選擇'} ${offer.title}`} disabled={disabled} secondary={experience.myVote!==choiceId} onPress={()=>void mutate('story.vote.submit',{episodeSeq:experience.episodeSeq,categoryId:offer.categoryId})}/></View>;})}<Text style={s.body}>{experience.myVote?'等待另一方選擇；結算前可以改選。':experience.partnerHasVoted?'對方已選好，等待你的選擇。':'請選一個你想一起探索的故事。'}</Text></View></ScrollView>}
       {experience.currentNode&&<>
       <ADVStage interactionsEnabled={experience.chapterStatus!=='completed'} storySessionId={track?`${experience.storySessionId}:${track.myTrack.role}`:experience.storySessionId} track={track?{mediaReload,books:track.books,allowBookPreview:track.phase==='completed'&&!storyActionsDisabled,actorRole:track.myTrack.role,areaId:track.myTrack.areaId,stage:track.stage,asset,actorRigsForShot,world:track.phase==='completed'&&!track.stage?{objects:[],flags:{}}:track.world,steps:storySteps,own:track.partnerPresence.inSameArea?ownPortrait:undefined,onDrop:dropObject,selectedObject:object,disabled:storyActionsDisabled||track.phase==='completed',showSlot:track.availableEvents.some(e=>e.actions.some(a=>!!a.dropSlotId))||track.world.objects.some(o=>o.id===object&&o.previewPlacement?.areaId===track.myTrack.areaId),onStageMediaUnavailable:()=>{if(live.current){setStageMediaUnavailable(true);setNotice('場景圖片載入失敗；請重新進入房間以重新載入。場景操作暫停，聊天室仍可使用。');}}}:undefined} node={experience.currentNode} partner={track&&!track.partnerPresence.inSameArea?undefined:{name:partner?.nickname??'另一位旅人',version:avatar?.avatarVersion,staticAvatar:staticPortrait(avatar,partnerStaticId),source:portrait(),sources:portraitSources,expression:experience.currentNode.presentation?.expression,anchors:avatar?.stageAnchors}} scene={{presentation:experience.scenePresentation,background,foreground:asset(experience.scenePresentation?.foregroundAsset)}} onInspect={setObject} stageHeight={computedStageHeight} narrativeContentStyle={chatOpen?(isWide?{paddingRight:floatingDrawerWidth+20}:{paddingBottom:mobileDrawerHeight+12}):undefined} disabled={storyActionsDisabled} >
       {track&&<>{experience.selectionReason&&<Text style={[s.subtleText,{fontSize:11}]}>{experience.selectionReason}</Text>}<SceneEventActions experience={track} disabled={storyActionsDisabled} onSubmit={submitTrackAction} onPreviewDrop={dropObject} selectedObject={object}/>{object&&<PrimaryButton label="收起物件預覽" compact secondary onPress={()=>setObject(null)}/>}</>}
       {experience.phase==='completed'&&<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,paddingHorizontal:14,paddingVertical:8,borderRadius:16,backgroundColor:'rgba(28,12,40,.84)',borderWidth:1,borderColor:'rgba(255,210,122,.38)'}}><View style={{flex:1,minWidth:200}}><Text style={[s.label,{fontSize:13}]}>這一章已經收尾，下一段由你們一起決定。</Text><Text style={[s.body,{fontSize:12,lineHeight:18}]}>{experience.partnerAgreedNext?'對方已同意開始下一場。':'等待對方決定；你們仍可繼續聊天。'}</Text></View><PrimaryButton label={experience.myAgreedNext?'撤回下一場同意':'一起開始下一場'} compact secondary={experience.myAgreedNext} disabled={disabled} onPress={()=>void mutate('story.next.requested',{completedEpisodeSeq:experience.episodeSeq,agree:!experience.myAgreedNext})}/></View>}
       <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6,paddingHorizontal:4}}>
        <Text style={[s.footer,{fontSize:10,color:'rgba(255,255,255,.35)'}]}>房間編號：{roundId}</Text>
       </View>
       </ADVStage>
       </>}
      </View>

      {chatOpen&&<View testID="story-chat-drawer" style={{position:'absolute',right:isWide?12:6,bottom:isWide?12:6,zIndex:20,width:floatingDrawerWidth,height:isWide?Math.min(430,Math.max(280,Math.round(height*.50))):mobileDrawerHeight}}>
       <View style={[s.panel,{flex:1,minHeight:0,width:'100%',maxWidth:undefined,padding:10,gap:6,backgroundColor:'rgba(24,10,36,.95)',borderColor:'rgba(255,122,162,.42)',boxShadow:'0 18px 42px rgba(0,0,0,.55)'}]}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}>
         <View style={{flexDirection:'row',alignItems:'baseline',gap:8}}>
          <Text style={[s.heading,{fontSize:16,lineHeight:22,textAlign:'left'}]}>留一頁，給彼此</Text>
          <Text style={s.footer}>{[...text.trim()].length} / 500</Text>
         </View>
         <PrimaryButton label="收起聊天室" compact secondary onPress={()=>setChatOpen(false)}/>
        </View>
        <ScrollView testID="story-chat-history" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{flex:1,minHeight:36}} contentContainerStyle={{gap:6}} keyboardShouldPersistTaps="handled">
         <Text style={s.footer}>只有兩位玩家真正送出的話，才會出現在這裡。</Text>
         {hasEarlier&&<PrimaryButton label="載入較早對話" compact secondary disabled={busy} onPress={()=>void earlier()}/>}
         {events.filter(e=>e.type==='message.committed').map(e=><View key={e.eventSeq} style={{alignSelf:e.actorAccountId===api.account?.accountId?'flex-end':'flex-start',maxWidth:'92%',paddingHorizontal:12,paddingVertical:8,gap:2,borderRadius:14,backgroundColor:e.actorAccountId===api.account?.accountId?'rgba(255,122,162,.24)':'rgba(255,255,255,.09)',borderWidth:1,borderColor:e.actorAccountId===api.account?.accountId?'rgba(255,122,162,.45)':'rgba(255,255,255,.16)'}}><Text style={[s.label,{fontSize:12}]}>{e.actorAccountId===api.account?.accountId?'你':partner?.nickname??'對方'}</Text><Text style={s.body}>{e.payload.text}</Text><Text style={[s.footer,{textAlign:'right',fontSize:10}]}>已送出</Text></View>)}
         {pending?.text&&!events.some(e=>e.clientRequestId===pending.id)&&<View style={{paddingHorizontal:12,paddingVertical:8,borderRadius:14,backgroundColor:'rgba(255,122,162,.14)'}}><Text style={s.body}>{pending.text}</Text><Text style={s.footer}>{pending.state==='sending'?'送出中':pending.state==='committed'?'已送出':'送出結果不明，請重新同步'}</Text></View>}
         {typing&&<Text style={s.subtleText}>對方正在輸入…</Text>}
        </ScrollView>
        {!keyboard&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{experience.suggestions?.map(suggestion=><PrimaryButton key={suggestion.id} label={suggestion.label} compact secondary disabled={disabled} onPress={()=>void mutate('message.send',{choiceId:suggestion.id},suggestion.text)}/>)}</View>}
        <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
         <TextInput accessibilityLabel="你的訊息" multiline value={text} onChangeText={value=>{setText(value);if(Date.now()-typingAt.current>1500){room.current?.presence(value.length>0);typingAt.current=Date.now();}}} editable={!busy&&!pending} placeholder="從你想說的開始…" placeholderTextColor="#b6a0b7" style={[s.input,{flex:1,minHeight:38,maxHeight:68,paddingVertical:7,paddingHorizontal:12,fontSize:14}]}/>
         <PrimaryButton label="傳送訊息" compact disabled={disabled||!validStoryMessage(text)} onPress={()=>send()}/>
        </View>
        {intent&&<View style={{gap:6}}><Text style={s.label}>是否想結束這段互動？</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}><PrimaryButton label="繼續傳送" compact onPress={()=>send(true)}/><PrimaryButton label="返回編輯" compact secondary onPress={()=>setIntent(false)}/><PrimaryButton label="前往結束確認" compact secondary onPress={()=>{setIntent(false);setConfirm(true);}}/></View></View>}
       </View>
      </View>}
     </View>}
    </View>
   </View>
  </SafeAreaView></KeyboardAvoidingView>
 </View>;
}
