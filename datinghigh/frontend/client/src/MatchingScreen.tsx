import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AppState,Image,Platform,Text,View} from 'react-native';
import {useFocusEffect,useLocalSearchParams,useRouter} from 'expo-router';
import {api,useSession} from './session';
import {ApiFailure} from './api';
import {avatarAssets} from './avatar-assets';
import {usePendingBackGuard} from './pending-back-guard';
import {GlassPanel,InlineNotice,LoadingOverlay,PrimaryButton,SceneBackground,s} from './ui';
import {matchingDestination,matchingError,matchingRequestId,invitationMessage,type Candidate,type CandidateSummary,type CandidatePersona,type Invitation,type GameRound} from './matching';

export function PersonaCard({persona,score}:{persona:CandidatePersona;score?:number}){
 const source=persona.selectedAvatarType==='builtin'&&persona.selectedAvatarRef?avatarAssets[persona.selectedAvatarRef]:persona.avatarDataUrl?{uri:persona.avatarDataUrl}:undefined;
 return <View style={{gap:12}}>
  {source&&<View style={{width:'100%',aspectRatio:3/4,borderRadius:18,overflow:'hidden'}}>
   <Image accessibilityLabel={`${persona.nickname}的遊戲化身`} source={source} resizeMode="contain" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%'}}/>
  </View>}
  <Text style={s.heading}>{persona.nickname}</Text><Text style={s.body}>{persona.bio}</Text>
  {score!==undefined&&<Text style={[s.label,{textAlign:'center',fontSize:18}]}>契合度 {score}</Text>}
 </View>;
}

export function MatchingStartScreen(){
 const router=useRouter(),session=useSession(),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const generation=useRef(0),pending=useRef(false);
 const load=useCallback(async()=>{
  if(pending.current)return;
  if(!api.account){router.replace('/login');return;}
  const run=++generation.current;pending.current=true;setBusy(true);setNotice('');
  try{
   const [profile,rounds]=await Promise.all([api.request('/me/dating-profile'),api.request('/game-rounds')]);
   if(run===generation.current)router.replace(matchingDestination(profile,rounds) as never);
  }catch(error){if(run===generation.current)setNotice(matchingError(error));}
  finally{if(run===generation.current){pending.current=false;setBusy(false);}}
 },[router]);
 useFocusEffect(useCallback(()=>{if(session.ready)void load();return()=>{generation.current++;pending.current=false;};},[session.ready,load]));
 return <SceneBackground><GlassPanel><Text style={s.heading}>準備你的相遇</Text>{busy&&<LoadingOverlay/>}<InlineNotice text={notice}/>{notice&&<PrimaryButton label="重試配對狀態" disabled={busy} onPress={()=>void load()}/>}<PrimaryButton label="你的帳號" secondary onPress={()=>router.push('/account')}/></GlassPanel></SceneBackground>;
}

export function MatchingScreen({invitations=false}:{invitations?:boolean}){
 const router=useRouter(),session=useSession();
 const [items,setItems]=useState<CandidateSummary[]>([]),[index,setIndex]=useState(0),[nextOffset,setNextOffset]=useState<number|null>(null),[card,setCard]=useState<Candidate|null>(null);
 const [lists,setLists]=useState<{incoming:Invitation[];outgoing:Invitation[]}>({incoming:[],outgoing:[]});
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[cardBusy,setCardBusy]=useState(false),[uncertain,setUncertain]=useState(false),[loaded,setLoaded]=useState(false),[decline,setDecline]=useState<{invitationId:string}|null>(null),[tick,setTick]=useState(0);
 const gate=useRef(false),generation=useRef(0),cache=useRef(new Map<string,Promise<Candidate>>()),active=useRef(false);
 usePendingBackGuard(gate,busy);
 const currentSession=api.sessionId;
 const load=useCallback(async(offset=0)=>{
  if(gate.current)return;
  if(!api.account){router.replace('/login');return;}
  gate.current=true;const run=++generation.current;setBusy(true);setCard(null);setLoaded(false);setNotice('');setDecline(null);cache.current.clear();
  try{
   // 不明寫入先以 GET 回查持久輪次與邀請，再進行無副作用的搜尋。
   const [rounds,invites]=await Promise.all([api.request('/game-rounds'),api.request('/match-invitations')]);
   if(!active.current||run!==generation.current)return;
   if(rounds.items.length){router.replace(('/game-round/'+rounds.items[0].roundId) as never);return;}
   setLists(invites);setUncertain(false);
   if(!invitations){const result=await api.request('/match-candidates/search','POST',{offset,limit:20});if(!active.current||run!==generation.current)return;setItems(result.items);setIndex(0);setNextOffset(result.nextOffset);}
   setLoaded(true);
  }catch(error){if(active.current&&run===generation.current)setNotice(matchingError(error));}
  finally{if(active.current&&run===generation.current){gate.current=false;setBusy(false);}}
 },[invitations,router,currentSession]);
 useFocusEffect(useCallback(()=>{active.current=true;if(session.ready)void load();const subscription=AppState.addEventListener('change',state=>{if(state==='active')void load();});return()=>{active.current=false;generation.current++;gate.current=false;cache.current.clear();subscription.remove();};},[session.ready,load]));
 useEffect(()=>{if(!invitations)return;const timer=setInterval(()=>setTick(t=>t+1),1000);return()=>clearInterval(timer);},[invitations]);
 useEffect(()=>{
  if(invitations||!loaded||!items[index])return;
  let alive=true;const run=generation.current;setCard(null);setCardBusy(true);setDecline(null);
  const fetchCard=(item:CandidateSummary)=>{
   if(!cache.current.has(item.candidateId))cache.current.set(item.candidateId,api.request('/match-candidates/'+item.candidateId));
   return cache.current.get(item.candidateId)!;
  };
  fetchCard(items[index]).then(value=>{if(alive&&active.current&&run===generation.current)setCard(value);}).catch(error=>{if(alive&&active.current&&run===generation.current)setNotice(matchingError(error));}).finally(()=>{if(alive)setCardBusy(false);});
  // 只預載接下來三張，不將所有 persona 隨搜尋傳輸。
  for(const item of items.slice(index+1,index+4))void fetchCard(item).catch(()=>{});
  return()=>{alive=false;};
 },[invitations,items,index,loaded]);
 const mutate=async(path:string,body:Record<string,unknown>={})=>{
  if(gate.current||uncertain)return;gate.current=true;setBusy(true);setNotice('');setDecline(null);const run=generation.current;
  try{
   const result=await api.request(path,'POST',body);
   if(!active.current||run!==generation.current)return;
   if(result.status==='accepted'&&result.roundId){router.replace(('/game-round/'+result.roundId) as never);return;}
   gate.current=false;await load();
  }catch(error){if(active.current&&run===generation.current){setNotice(matchingError(error));if(error instanceof ApiFailure&&error.uncertain)setUncertain(true);}}
  finally{if(active.current&&run===generation.current){gate.current=false;setBusy(false);}}
 };
 const disabled=busy||uncertain;
 const declineConfirmation=decline&&<GlassPanel><Text style={s.label}>婉拒後你們將無法再次互相配對</Text><PrimaryButton label="確認永久婉拒" disabled={disabled} onPress={()=>void mutate(`/match-invitations/${decline.invitationId}/decline`)}/><PrimaryButton label="保留邀請" secondary onPress={()=>setDecline(null)}/></GlassPanel>;
 const showInvitation=(item:Invitation)=>{
  const pending=item.status==='pending'&&item.expiresAt>api.serverNow;
  return <GlassPanel key={item.invitationId}><PersonaCard persona={item.persona}/><Text style={s.body}>{item.status==='pending'&&!pending?'已逾期，請重新整理':invitationMessage(item)}</Text>
   {pending&&<Text style={s.subtleText}>有效至 {new Date(item.expiresAt).toLocaleString()}</Text>}
   {pending&&item.direction==='incoming'&&<><PrimaryButton label={`接受 ${item.persona.nickname}`} disabled={disabled} onPress={()=>void mutate(`/match-invitations/${item.invitationId}/accept`)}/><PrimaryButton label={`婉拒 ${item.persona.nickname}`} disabled={disabled} secondary onPress={()=>setDecline(item)}/></>}
   {pending&&item.direction==='outgoing'&&<PrimaryButton label={`取消邀請 ${item.persona.nickname}`} disabled={disabled} secondary onPress={()=>void mutate(`/match-invitations/${item.invitationId}/cancel`)}/>}
   {item.status==='accepted'&&item.roundId&&<PrimaryButton label="進入目前遊戲" onPress={()=>router.push(('/game-round/'+item.roundId) as never)}/>}
  </GlassPanel>;
 };
 if(!api.account)return <SceneBackground><GlassPanel><InlineNotice text="登入已失效，請重新登入"/><PrimaryButton label="返回登入" onPress={()=>router.replace('/login')}/></GlassPanel></SceneBackground>;
 return <SceneBackground><View style={{width:'100%',maxWidth:460,gap:16}}>
  <GlassPanel><Text style={s.eyebrow}>HEARTLINK · 相遇從雙方的意願開始</Text><Text style={s.heading}>{invitations?'你的邀請':'探索心動'}</Text>
   <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>{[['探索','/matching'],['邀請','/invitations'],['你的帳號','/account'],['個人資料','/profile']].map(([label,path])=><PrimaryButton key={path} label={label} compact secondary disabled={busy} onPress={()=>router.push(path as never)}/>)}</View>
   <InlineNotice text={notice}/>{busy&&<LoadingOverlay/>}<PrimaryButton label="重新整理配對狀態" secondary disabled={busy} onPress={()=>void load()}/>
   {notice==='請先完成個人資料'&&<PrimaryButton label="完成個人資料" onPress={()=>router.push('/profile')}/>}
   {!invitations&&<Text style={s.subtleText}>契合度依興趣、生活及選填偏好計算，地區為概略地理契合。</Text>}
  </GlassPanel>
  {invitations&&declineConfirmation}
  {invitations&&loaded&&<><Text style={s.heading}>收到的邀請</Text>{lists.incoming.length?lists.incoming.map(showInvitation):<Text style={s.body}>目前沒有收到邀請</Text>}<Text style={s.heading}>送出的邀請</Text>{lists.outgoing.length?lists.outgoing.map(showInvitation):<Text style={s.body}>目前沒有送出邀請</Text>}</>}
  {!invitations&&loaded&&<GlassPanel>
   {!items.length?<Text style={s.body}>目前沒有可配對的對象</Text>:<>
    {cardBusy&&<LoadingOverlay/>}{card&&<><PersonaCard persona={card.persona} score={card.score}/>
     <PrimaryButton label={card.invitationState==='outgoing'?'等待回覆':card.invitationState==='incoming'?'接受邀請':'想認識'} disabled={disabled||card.invitationState==='outgoing'} onPress={()=>void mutate(card.invitationState==='incoming'?`/match-invitations/${card.invitationId}/accept`:'/match-invitations',card.invitationState==='incoming'?{}:{candidateId:card.candidateId,clientRequestId:matchingRequestId()})}/>
     {card.invitationState==='incoming'&&card.invitationId&&<PrimaryButton label="婉拒邀請" secondary disabled={disabled} onPress={()=>setDecline({invitationId:card.invitationId!})}/>}
     {declineConfirmation}
    </>}
    <View style={{flexDirection:'row',justifyContent:'space-between',gap:8}}><PrimaryButton label="上一位" secondary disabled={busy||index===0} onPress={()=>setIndex(i=>i-1)}/><Text style={s.body}>{index+1} / {items.length}</Text><PrimaryButton label="下一位" secondary disabled={busy||index>=items.length-1} onPress={()=>setIndex(i=>i+1)}/></View>
   </>}
   {nextOffset!==null&&<PrimaryButton label="下一頁" secondary disabled={busy} onPress={()=>void load(nextOffset)}/>}
  </GlassPanel>}
 </View></SceneBackground>;
}

export function GameRoundScreen(){
 const router=useRouter(),session=useSession(),{roundId}=useLocalSearchParams<{roundId:string}>();
 const [round,setRound]=useState<GameRound|null>(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const generation=useRef(0),pending=useRef(false);
 const load=useCallback(async()=>{
  if(pending.current)return;if(!api.account){router.replace('/login');return;}
  pending.current=true;const run=++generation.current;setBusy(true);setRound(null);setNotice('');
  try{const result=await api.request('/game-rounds/'+roundId);if(run===generation.current)setRound(result);}
  catch(error){if(run===generation.current){
   // ended或非目前可進入的房間先回共用分流，重新核對Profile／實際active輪次。
   if(error instanceof ApiFailure&&error.status===403)router.replace('/start');
   else setNotice(matchingError(error));
  }}
  finally{if(run===generation.current){pending.current=false;setBusy(false);}}
 },[roundId,router,api.sessionId]);
 useFocusEffect(useCallback(()=>{
  if(session.ready)void load();const foreground=()=>{void load();};
  const sub=AppState.addEventListener('change',state=>{if(state==='active')foreground();});
  if(Platform.OS==='web')window.addEventListener('focus',foreground);
  return()=>{generation.current++;pending.current=false;sub.remove();if(Platform.OS==='web')window.removeEventListener('focus',foreground);};
 },[session.ready,load]));
 if(!api.account)return <SceneBackground><GlassPanel><InlineNotice text="登入已失效，請重新登入"/><PrimaryButton label="返回登入" onPress={()=>router.replace('/login')}/></GlassPanel></SceneBackground>;
 return <SceneBackground><GlassPanel><Text style={s.heading}>專屬雙人房間</Text>{busy&&<LoadingOverlay/>}<InlineNotice text={notice}/>{round&&<><PersonaCard persona={round.persona}/><Text style={s.label}>雙方已確認，遊戲進行中</Text><Text style={s.body}>遊戲進行中，結束後才能重新配對</Text><Text style={s.subtleText}>房間編號：{round.roundId}</Text></>}<PrimaryButton label="重新整理房間" secondary disabled={busy} onPress={()=>void load()}/><PrimaryButton label="你的帳號" secondary onPress={()=>router.push('/account')}/><PrimaryButton label="配對入口" secondary onPress={()=>router.push('/start')}/></GlassPanel></SceneBackground>;
}
