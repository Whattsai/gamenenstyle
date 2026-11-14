import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Image,Keyboard,KeyboardAvoidingView,Modal,Platform,ScrollView,Text,TextInput,View,useWindowDimensions,type ImageSourcePropType} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect,useLocalSearchParams,useRouter} from 'expo-router';
import {api,useSession} from './session';
import {ApiFailure} from './api';
import {matchingRequestId,type CandidatePersona} from './matching';
import {PrimaryButton,InlineNotice,LoadingOverlay,s} from './ui';
import {ADVStage} from './ADVStage';
import {InteractionRenderer,InteractionSubmission} from './InteractionRenderer';
import {StoryAudio} from './StoryAudio';
import {RealtimeRoomClient,type RoomConnection} from './RealtimeRoomClient';
import {detectExitIntent,mergeRoundEvents,validStoryMessage,type StoryExperience,type RoundEvent} from './story';
import {parseStoryAvatar,type StoryAvatarProjection} from './story-avatar';
import {eventPresentation} from './story-event-presentation';

type Pending={id:string;type:string;payload:Record<string,unknown>;text?:string;state:'sending'|'unknown'|'committed'};
/** 真實雙人 StorySession、Round chat 與退出；狀態只接受授權 snapshot／事件。 */
export function StoryExperienceScreen(){
 const {roundId}=useLocalSearchParams<{roundId:string}>(),router=useRouter(),session=useSession(),{width,height}=useWindowDimensions();
 const [keyboard,setKeyboard]=useState(false);
 const [ownAvatarBlocked,setOwnAvatarBlocked]=useState(false);
 const [stageSpace,setStageSpace]=useState<number|undefined>();
 useEffect(()=>{const show=Keyboard.addListener('keyboardDidShow',()=>setKeyboard(true)),hide=Keyboard.addListener('keyboardDidHide',()=>setKeyboard(false));return()=>{show.remove();hide.remove();};},[]);
 const [experience,setExperience]=useState<StoryExperience|null>(null),[events,setEvents]=useState<RoundEvent[]>([]),[partner,setPartner]=useState<CandidatePersona|null>(null),[chatOpen,setChatOpen]=useState(width>=900);
 const [avatar,setAvatar]=useState<StoryAvatarProjection|null>(null),avatarRead=useRef<Promise<void>|undefined>(undefined);
 const avatarReadAgain=useRef(false);
 const [connection,setConnection]=useState<RoomConnection>('connecting'),[notice,setNotice]=useState(''),[text,setText]=useState(''),[pending,setPending]=useState<Pending|null>(null),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false),[intent,setIntent]=useState(false),[interactionOpen,setInteractionOpen]=useState(true),[object,setObject]=useState<string|null>(null),[hasEarlier,setHasEarlier]=useState(false),[typing,setTyping]=useState(false);
 const live=useRef(false),generation=useRef(0),cursor=useRef(0),initialized=useRef(false),allEvents=useRef<RoundEvent[]>([]),room=useRef<RealtimeRoomClient|null>(null),gate=useRef(false),pendingRef=useRef<Pending|null>(null),typingTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),typingAt=useRef(0);
 const currentSession=api.sessionId;
 const stageSession=useRef<string|undefined>(undefined);
 const snapshotSequence=useRef(0);
 const clearPrivate=()=>{allEvents.current=[];setEvents([]);setPartner(null);setAvatar(null);setPending(null);pendingRef.current=null;setText('');setObject(null);setIntent(false);setConfirm(false);};
 const failure=useCallback((error:unknown)=>{
  if(error instanceof ApiFailure&&error.code==='OWN_AVATAR_PACK_NOT_READY'){generation.current++;live.current=false;clearPrivate();setExperience(null);room.current?.stop();setConnection('offline');setOwnAvatarBlocked(true);return;}
  if(error instanceof ApiFailure&&error.status===401){generation.current++;live.current=false;clearPrivate();setExperience(null);room.current?.stop();router.replace('/login');return;}
  if(error instanceof ApiFailure&&error.status===403){generation.current++;live.current=false;clearPrivate();setExperience(null);room.current?.stop();router.replace('/start');return;}
  setNotice(error instanceof ApiFailure&&error.status===409?'場景狀態已更新，請重新同步後再操作。':'目前無法確認狀態，請重新同步。');
 },[router]);
 const refreshAvatar=useCallback(async()=>{
  if(avatarRead.current){avatarReadAgain.current=true;return avatarRead.current;}const run=generation.current;
  const task=(async()=>{
   do{
    avatarReadAgain.current=false;
    try{const result=await api.request(`/game-rounds/${roundId}/partner-avatar`);if(live.current&&run===generation.current)setAvatar(parseStoryAvatar(result,roundId));}
    catch(error){if(error instanceof ApiFailure&&error.code==='AVATAR_PACK_NOT_READY'&&error.status===409){if(live.current&&run===generation.current)setAvatar(null);}else{if(live.current&&run===generation.current)failure(error);throw error;}}
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
    stageSession.current=snapshot.storySessionId;setObject(null);setInteractionOpen(true);setStageSpace(undefined);
    if(pendingRef.current&&pendingRef.current.type!=='message.send'){
     pendingRef.current=null;setPending(null);gate.current=false;setBusy(false);
    }
   }
   if(snapshot.chapterStatus==='completed'){setObject(null);setInteractionOpen(false);}
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
  live.current=true;generation.current++;cursor.current=0;snapshotSequence.current=0;initialized.current=false;allEvents.current=[];setExperience(null);setEvents([]);setBusy(false);setOwnAvatarBlocked(false);
  const client=new RealtimeRoomClient(api,roundId,{sync,status:setConnection,avatarUpdated:async()=>{await sync();if(live.current)await refreshAvatar();},reconnected:refreshAvatar,presence:p=>{if(p.actorAccountId===api.account?.accountId)return;setTyping(p.typing===true);clearTimeout(typingTimer.current);typingTimer.current=setTimeout(()=>setTyping(false),Math.min(5000,p.ttlMs??5000));}},matchingRequestId());room.current=client;
  void sync().catch(()=>{});client.start();
  const foreground=()=>{if(!live.current)return;setTyping(false);client.start();void Promise.all([client.synchronize(),refreshAvatar()]).catch(()=>{});};
  const subscription=AppState.addEventListener('change',state=>{if(state==='active')foreground();else{client.stop();setConnection('offline');setTyping(false);}});
  if(Platform.OS==='web')window.addEventListener('focus',foreground);
  return()=>{live.current=false;generation.current++;avatarRead.current=undefined;avatarReadAgain.current=false;client.stop();room.current=null;subscription.remove();clearTimeout(typingTimer.current);if(Platform.OS==='web')window.removeEventListener('focus',foreground);clearPrivate();gate.current=false;};
 },[session.ready,roundId,currentSession,sync,router,refreshAvatar]));
 const mutate=async(type:string,payload:Record<string,unknown>,messageText?:string)=>{
  if(gate.current||pendingRef.current||connection!=='connected')return;gate.current=true;setBusy(true);setNotice('');
  const run=generation.current,client=room.current!,stage=stageSession.current;
  const current=()=>live.current&&run===generation.current&&(type==='message.send'||stage===stageSession.current);
  const operation:Pending={id:matchingRequestId(),type,payload,text:messageText,state:'sending'};pendingRef.current=operation;setPending(operation);
  try{await client.send(type,operation.id,payload);if(!current())return;pendingRef.current={...operation,state:'committed'};setPending(pendingRef.current);await client.synchronize();if(current()&&type==='interaction.submit')setObject(null);}
  catch(error){if(!current())return;if(error instanceof ApiFailure&&(error.uncertain||error.status>=500)){pendingRef.current={...operation,state:'unknown'};setPending(pendingRef.current);setNotice('目前無法確認送出結果，請重新同步。');}else{pendingRef.current=null;setPending(null);failure(error);}}
  finally{if(current()){gate.current=false;setBusy(false);}}
 };
 const recover=async()=>{
  if(gate.current||!pendingRef.current||connection!=='connected')return;gate.current=true;setBusy(true);
  const run=generation.current,client=room.current!,original=pendingRef.current,stage=stageSession.current;
  const current=()=>live.current&&run===generation.current&&(original.type==='message.send'||stage===stageSession.current);
  try{await client.synchronize();if(!current()||pendingRef.current?.id!==original.id)return;await client.send(original.type,original.id,original.payload);if(current())await client.synchronize();}
  catch(error){if(current()){failure(error);setNotice('目前無法確認送出結果，請重新同步。');}}
  finally{if(current()){gate.current=false;setBusy(false);}}
 };
 const storyAction=(type:string,choiceId:string,definitionId?:string)=>{
  if(!experience?.currentNode||experience.chapterStatus==='completed')return;
  const definition=experience.objects?.find(d=>d.id===definitionId)??experience.events?.find(e=>e.status==='active'&&e.definition.id===definitionId)?.definition??(experience.interaction&&experience.interaction.definition.id===definitionId?experience.interaction.definition:undefined);
  if(type==='interaction.submit'&&definition?.bindingId){void mutate('story.event.submit',{storySessionId:experience.storySessionId,bindingId:definition.bindingId,actionId:choiceId,expectedRevision:experience.progressRevision});return;}
  void mutate(type,{storySessionId:experience.storySessionId,episodeSeq:experience.episodeSeq,nodeId:experience.currentNode.id,expectedRevision:experience.progressRevision,choiceId,...(definitionId?{definitionId}:{})});
 };
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
 const objectDefinition=experience?.chapterStatus==='completed'?undefined:(experience?.objects?.find(o=>o.id===object)??experience?.events?.find(e=>e.status==='active'&&!e.main&&e.definition.id===object)?.definition);
 const performance=experience?eventPresentation(experience,objectDefinition?.bindingId):undefined;
 const openEventSheet=!!objectDefinition||!!experience?.interaction&&interactionOpen;
 const eventSubmission=(definition:import('./story').StoryDefinition)=>pending?.payload.storySessionId===experience?.storySessionId&&(pending?.type==='interaction.submit'&&pending.payload.definitionId===definition.id||pending?.type==='story.event.submit'&&pending.payload.bindingId===definition.bindingId)?pending?.state:undefined;
 return <View style={s.scene}>
  {background&&<Image source={{uri:background}} resizeMode="cover" style={{position:'absolute',width:'100%',height:'100%'}}/>}
  <View pointerEvents="none" style={{position:'absolute',width:'100%',height:'100%',backgroundColor:'rgba(23,10,34,.42)'}}/>
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'} enabled={width<900}><SafeAreaView style={{flex:1}}><View style={{width:'100%',maxWidth:1188,alignSelf:'center',paddingHorizontal:width<600?12:24,paddingTop:8,paddingBottom:8,backgroundColor:'rgba(23,10,34,.92)'}}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}><View><Text style={s.eyebrow}>HEARTLINK · 兩個人的故事</Text><Text style={s.heading}>{experience?.title??'專屬雙人房間'}</Text></View><PrimaryButton label="結束本輪互動" compact secondary disabled={busy} onPress={()=>setConfirm(true)}/></View></View><View style={{flex:1,minHeight:0,alignItems:'center',padding:width<600?8:16,gap:8}}>
   <View style={{flex:1,minHeight:0,width:'100%',maxWidth:1140,gap:8}}>

    <View style={{flexDirection:'row',gap:10,alignItems:'center',flexWrap:'wrap'}}><Text style={s.subtleText}>{({connecting:'連線中',syncing:'正在同步進度',connected:'即時連線已同步',offline:'重新連線中；狀態尚未確認'})[connection]}</Text><PrimaryButton label="重新同步" compact secondary disabled={busy} onPress={()=>void room.current?.synchronize().catch(()=>{})}/>{!chatOpen&&<PrimaryButton label="展開聊天室" compact secondary onPress={()=>setChatOpen(true)}/>}{audio&&<StoryAudio key={experience?.storySessionId} url={audio} cueUrl={asset(performance?.cue?.assetId??experience?.audioCues?.[experience?.currentNode?.ending?'transition':'pageTurn'])} cueId={performance?.cue?.key??`${experience?.storySessionId}:${experience?.currentNode?.id}`}/>}</View>
    <InlineNotice text={notice}/>{pending?.type!=='message.send'&&!openEventSheet&&<InteractionSubmission state={pending?.state}/>}{pending?.state==='unknown'&&<PrimaryButton label="以原編號查回結果" secondary disabled={busy||connection!=='connected'} onPress={()=>void recover()}/>}{!experience&&<LoadingOverlay/>}
    <Modal visible={confirm} transparent animationType="fade" onRequestClose={()=>{if(!busy)setConfirm(false);}}><View style={{flex:1,backgroundColor:'rgba(15,6,24,.8)',alignItems:'center',justifyContent:'center',padding:20}}><View style={[s.panel,{width:'100%',maxWidth:480,gap:16}]}><Text style={s.heading}>確定結束本輪互動？</Text><Text style={s.body}>確認後，你們將永久無法再次配對，也無法回讀本輪對話與互動。</Text><PrimaryButton label="確認結束" disabled={busy} onPress={()=>void end()}/><PrimaryButton label="繼續這段相遇" secondary disabled={busy} onPress={()=>setConfirm(false)}/></View></View></Modal>

    {experience&&['playing','completed','pending_story_selection','pending_category_selection'].includes(experience.phase)&&<View style={{flex:1,minHeight:0,flexDirection:width>=900?'row':'column',alignItems:'stretch',gap:8}}>
     <View onLayout={event=>{const value=event.nativeEvent.layout.height;if(value>0)setStageSpace(value);}} style={{flex:1,minHeight:0,width:width>=900?undefined:'100%',gap:8}}>
      {experience.selectionReason&&<Text style={s.subtleText}>{experience.selectionReason}</Text>}
      {(experience?.phase==='pending_story_selection'||experience?.phase==='pending_category_selection')&&<ScrollView style={{flex:1,minHeight:0}} contentContainerStyle={{alignItems:'center'}}><View style={[s.panel,{maxWidth:720,alignSelf:'center'}]}><Text style={s.heading}>{experience.phase==='pending_category_selection'?'選擇下一場的主題':'選擇今晚的故事'}</Text><Text style={s.body}>雙方都選好才開始；選擇不同時，以原邀請方的選擇為主。</Text>{experience.offers?.map(offer=>{const choiceId=offer.categoryId??offer.catalogId;return <View key={choiceId} style={{gap:8,padding:14,borderWidth:1,borderColor:experience.myVote===choiceId?'#ff7aa2':'#73546f',borderRadius:16}}>{offer.previewUrl&&<Image source={{uri:new URL(offer.previewUrl,api.origin||globalThis.location?.origin).toString()}} resizeMode="cover" style={{width:'100%',height:120,borderRadius:12}}/>}<Text style={s.label}>{offer.rank} · {offer.title}</Text><Text style={s.body}>{offer.summary}</Text><Text style={s.subtleText}>{offer.reason}</Text><PrimaryButton label={`${experience.myVote===choiceId?'已選擇':'選擇'} ${offer.title}`} disabled={disabled} secondary={experience.myVote!==choiceId} onPress={()=>void mutate('story.vote.submit',{episodeSeq:experience.episodeSeq,...(offer.categoryId?{categoryId:offer.categoryId}:{catalogId:offer.catalogId})})}/></View>;})}<Text style={s.body}>{experience.myVote?'等待另一方選擇；結算前可以改選。':experience.partnerHasVoted?'對方已選好，等待你的選擇。':'請選一個你想一起探索的故事。'}</Text></View></ScrollView>}
      {experience.currentNode&&<>
      <ADVStage interactionsEnabled={experience.chapterStatus!=='completed'} storySessionId={experience.storySessionId} node={performance?.node??experience.currentNode} partner={{name:partner?.nickname??'另一位旅人',version:avatar?.avatarVersion,source:portrait(),sources:portraitSources,expression:performance?.node?.presentation?.expression,anchors:avatar?.stageAnchors}} scene={{presentation:experience.scenePresentation,background,foreground:asset(experience.scenePresentation?.foregroundAsset)}} onInspect={setObject} stageHeight={Math.max(64,Math.min(stageSpace?stageSpace*.62:height*.3,440))} disabled={disabled} choose={id=>storyAction('story.choice.submit',id)}>
      {experience.chapterStatus!=='completed'&&<><View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{[...(experience.objects??[]),...(experience.events?.filter(e=>e.status==='active'&&!e.main&&e.definition.moduleType==='cooperative-choice').map(e=>e.definition)??[])].map(definition=><PrimaryButton key={definition.id} label={definition.title} secondary compact disabled={busy} onPress={()=>setObject(object===definition.id?null:definition.id)}/>)}{experience.interaction&&!interactionOpen&&<PrimaryButton label="打開合作卡" secondary compact onPress={()=>setInteractionOpen(true)}/>}</View>
      <Modal visible={!!experience.interaction&&interactionOpen} transparent animationType="fade" onRequestClose={()=>setInteractionOpen(false)}><View style={{flex:1,backgroundColor:'rgba(15,6,24,.82)',alignItems:'center',justifyContent:'center',padding:20}}><View testID="story-cooperation-sheet" style={[s.panel,{width:'100%',maxWidth:540,maxHeight:'80%'}]}><ScrollView keyboardShouldPersistTaps="handled">{experience.interaction&&<InteractionRenderer definition={experience.interaction.definition} submissionState={eventSubmission(experience.interaction.definition)} myChoice={experience.interaction.myChoice} partnerHasSubmitted={experience.interaction.partnerHasSubmitted} disabled={disabled} submit={id=>storyAction('interaction.submit',id,experience.interaction!.definition.id)}/>}</ScrollView><PrimaryButton label="返回場景探索" secondary onPress={()=>setInteractionOpen(false)}/></View></View></Modal>
      {experience.interaction?.myChoice&&!interactionOpen&&<Text style={s.subtleText}>等待另一方選擇；你的合作選擇已保存。</Text>}</>}
      {events.filter(e=>e.type==='interaction.updated'&&e.actorAccountId===api.account?.accountId&&e.payload.result&&!['pending_one','resolved'].includes(e.payload.result)).slice(-1).map(e=><View key={e.eventSeq} style={{padding:14,borderRadius:14,backgroundColor:'rgba(45,24,50,.94)'}}><Text style={s.label}>你的探索</Text><Text style={s.body}>{e.payload.result}</Text></View>)}
      {experience.phase==='completed'&&<View style={{gap:10,padding:12}}><Text style={s.label}>這一章已經收尾，下一段由你們一起決定。</Text><Text style={s.body}>{experience.partnerAgreedNext?'對方已同意開始下一場。':'等待對方決定；你們仍可繼續聊天。'}</Text><PrimaryButton label={experience.myAgreedNext?'撤回下一場同意':'一起開始下一場'} secondary={experience.myAgreedNext} disabled={disabled} onPress={()=>void mutate('story.next.requested',{completedEpisodeSeq:experience.episodeSeq,agree:!experience.myAgreedNext})}/></View>}
      <Text style={s.footer}>房間編號：{roundId}</Text>
      </ADVStage>
      <Modal visible={!!objectDefinition} transparent animationType="fade" onRequestClose={()=>setObject(null)}><View style={{flex:1,backgroundColor:'rgba(15,6,24,.82)',alignItems:'center',justifyContent:'center',padding:20}}><View style={[s.panel,{width:'100%',maxWidth:540,maxHeight:'80%'}]}><ScrollView keyboardShouldPersistTaps="handled">{objectDefinition&&<InteractionRenderer definition={objectDefinition} submissionState={eventSubmission(objectDefinition)} myChoice={experience.events?.find(e=>e.bindingId===objectDefinition.bindingId)?.myChoice} partnerHasSubmitted={experience.events?.find(e=>e.bindingId===objectDefinition.bindingId)?.partnerHasSubmitted} disabled={disabled} submit={id=>storyAction('interaction.submit',id,objectDefinition.id)}/>}</ScrollView><PrimaryButton label="返回場景" secondary onPress={()=>setObject(null)}/></View></View></Modal>
      </>}

     </View>

     {chatOpen&&experience.phase!=='pending_story_selection'&&<View testID="story-chat-drawer" style={{width:width>=900?360:'100%',height:width>=900?'100%':Math.max(keyboard?150:220,height*(keyboard ? .32 : .38)),flexShrink:0}}><View style={[s.panel,{flex:1,minHeight:0,width:'100%',maxWidth:undefined,padding:10,gap:6}]}>
      <PrimaryButton label="收起聊天室" compact secondary onPress={()=>setChatOpen(false)}/>
      <Text style={[s.heading,{fontSize:18}]}>留一頁，給彼此</Text>
      <ScrollView testID="story-chat-history" style={{flex:1,minHeight:40}} contentContainerStyle={{gap:8}} keyboardShouldPersistTaps="handled"><Text style={s.footer}>只有兩位玩家真正送出的話，才會出現在這裡。</Text>
      {hasEarlier&&<PrimaryButton label="載入較早對話" compact secondary disabled={busy} onPress={()=>void earlier()}/>}
      {events.filter(e=>e.type==='message.committed').map(e=><View key={e.eventSeq} style={{alignSelf:e.actorAccountId===api.account?.accountId?'flex-end':'flex-start',maxWidth:'96%',padding:12,gap:4,borderRadius:14,backgroundColor:e.actorAccountId===api.account?.accountId?'rgba(255,122,162,.2)':'rgba(255,255,255,.08)'}}><Text style={s.label}>{e.actorAccountId===api.account?.accountId?'你':partner?.nickname??'對方'}</Text><Text style={s.body}>{e.payload.text}</Text><Text style={s.footer}>已送出</Text></View>)}
      {pending?.text&&!events.some(e=>e.clientRequestId===pending.id)&&<View style={{padding:12,borderRadius:14,backgroundColor:'rgba(255,122,162,.12)'}}><Text style={s.body}>{pending.text}</Text><Text style={s.footer}>{pending.state==='sending'?'送出中':pending.state==='committed'?'已送出':'送出結果不明，請重新同步'}</Text></View>}
      {typing&&<Text style={s.subtleText}>對方正在輸入…</Text>}
      </ScrollView>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{experience.suggestions?.map(suggestion=><PrimaryButton key={suggestion.id} label={suggestion.label} compact secondary disabled={disabled} onPress={()=>void mutate('message.send',{choiceId:suggestion.id},suggestion.text)}/>)}</View>
      <TextInput accessibilityLabel="你的訊息" multiline value={text} onChangeText={value=>{setText(value);if(Date.now()-typingAt.current>1500){room.current?.presence(value.length>0);typingAt.current=Date.now();}}} editable={!busy&&!pending} placeholder="從你想說的開始…" placeholderTextColor="#b6a0b7" style={[s.input,{minHeight:44,maxHeight:84}]}/>
      <Text style={s.footer}>{[...text.trim()].length} / 500</Text><PrimaryButton label="傳送訊息" disabled={disabled||!validStoryMessage(text)} onPress={()=>send()}/>
      {intent&&<View style={{gap:10}}><Text style={s.label}>是否想結束這段互動？</Text><PrimaryButton label="繼續傳送" onPress={()=>send(true)}/><PrimaryButton label="返回編輯" secondary onPress={()=>setIntent(false)}/><PrimaryButton label="前往結束確認" secondary onPress={()=>{setIntent(false);setConfirm(true);}}/></View>}
     </View></View>}
    </View>}
   </View>
  </View></SafeAreaView></KeyboardAvoidingView>
 </View>;
}
