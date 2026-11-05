import React,{useCallback,useEffect,useRef,useState} from 'react';
import {BackHandler,Image,Modal,Platform,RefreshControl,Switch,Pressable,ScrollView,Text,TextInput,useWindowDimensions,View} from 'react-native';
import {useFocusEffect,useRouter,useNavigation} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import {File,Paths} from 'expo-file-system';
import {api,useSession} from './session';
import {ApiFailure} from './api';
import {avatarAssets} from './avatar-assets';
import {colors,SceneBackground,GlassPanel,PrimaryButton,FormField,SubtleBadge,InlineNotice,LoadingOverlay,PersonEditIcon,s} from './ui';
import type {ProfileField,Gender,CardVisibility} from './profile-fields';
import {formSnapshot,profilePayload,visibleOnCard} from './profile-fields';
import {usePendingBackGuard} from './pending-back-guard';

type Photo={assetId:string;mimeType:string;displayOrder:number};
type Option={id:string;label:string;category?:string;active:boolean};
type Avatar={id:string;group:string};
type Profile=Record<string,any>&{revision:number;personalPhotos:Photo[];gender:Gender|null;romanticOrientation:Gender[];cardVisibility:CardVisibility};
type Attempt={attemptId:string;producedCount:number;expiresAt:number;status?:string;styleId?:string};
type ModalTab='free'|'ai';

const styles:[string,string,string][]=[['warm','暖陽系','#ff9a62'],['moon','月光文青系','#8cc9ff'],['sakura','櫻語甜心系','#ff7aa2'],['forest','森語帥氣系','#7be0b8']];
const purpose='請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱';
const disclosure='產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家';
const touchY=(event:any)=>event.nativeEvent.touches?.[0]?.pageY??event.nativeEvent.changedTouches?.[0]?.pageY??event.nativeEvent.pageY;
const pressedState=(selected:boolean)=>Platform.OS==='web'?{'aria-pressed':selected}:{};

function birthdayIssue(value:string|null|undefined,now:number){
 if(!value)return;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return '生日請填寫有效日期（YYYY-MM-DD），且不可晚於今天';
 const [year,month,day]=value.split('-').map(Number),birth=new Date(value+'T00:00:00Z');
 const today=new Date(now+8*60*60*1000),todayText=today.toISOString().slice(0,10);
 if(year<1||!Number.isFinite(birth.getTime())||birth.getUTCFullYear()!==year||birth.getUTCMonth()+1!==month||birth.getUTCDate()!==day||value>todayText)return '生日請填寫有效日期（YYYY-MM-DD），且不可晚於今天';
 const currentYear=today.getUTCFullYear(),leap=currentYear%4===0&&(currentYear%100!==0||currentYear%400===0);
 const anniversaryDay=month===2&&day===29&&!leap?28:day;
 let age=currentYear-year;if(today.getUTCMonth()+1<month||today.getUTCMonth()+1===month&&today.getUTCDate()<anniversaryDay)age--;
 if(age<18)return '需年滿 18 歲才能完成個人資料，請確認生日';
}

const adoptNotice='確定採用後本輪將結束，未採用圖片不會永久保存；未來正式付費上線後，重新生成將依當時方案付費；本 MVP 目前免費';
function uuid7(){const bytes=Crypto.getRandomValues(new Uint8Array(16));let time=Date.now();for(let i=5;i>=0;i--){bytes[i]=time%256;time=Math.floor(time/256);}bytes[6]=(bytes[6]&15)|112;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
function message(error:unknown){
 const code=error instanceof ApiFailure?error.code:'';
 const texts:Record<string,string>={AVATAR_DUPLICATE_IMAGE:'這次插畫與已有候選相同，未新增張數；可主動再試，可能增加供應商成本',INVALID_AVATAR_SELECTION:'這個化身目前無法選用，請重新整理後再選擇',INVALID_PROFILE:'請確認生日、文字長度、標籤與配對條件',IMAGE_TOO_LARGE:'照片超過 8 MiB，請選擇較小的圖片',INVALID_IMAGE:'圖片格式不支援或已損壞，請重新選圖',COMPRESSED_IMAGE_TOO_LARGE:'無法在保留畫質的情況下壓縮這張照片，請換一張',PHOTO_LIMIT_REACHED:'最多可保存 5 張個人照片',PROFILE_VERSION_CONFLICT:'資料已在其他地方更新，請重新整理後再修改',AVATAR_GENERATION_IN_PROGRESS:'本輪仍有操作進行中，請保留目前候選並稍後查看',AVATAR_CANDIDATE_EXPIRED:'本輪候選已過期，請重新開始',AVATAR_LIMIT_REACHED:'本輪最多 4 張，請從已有候選中選擇',IMAGE_PROVIDER_UNCERTAIN:'生成結果與供應商用量尚未確認；不會自動重送，已產生的候選仍保留',IMAGE_PROVIDER_UNAVAILABLE:'AI 服務目前無法使用，已產生的候選仍保留',IMAGE_PROVIDER_NO_IMAGE:'這次未取得有效插畫，既有候選不受影響',RATE_LIMITED:'操作過於頻繁，請稍後再試',SESSION_REVOKED:'登入已失效，請重新登入',PHOTO_NOT_FOUND:'照片已不存在，請重新整理',AVATAR_SOURCE_CHANGED:'來源照片已變更，本輪已結束；請重新開始',AVATAR_ATTEMPT_CLOSED:'本輪已結束，請重新整理',AVATAR_PHOTOS_REQUIRED:'至少需要 2 張已保存的個人照片'};
 if(error instanceof ApiFailure&&error.uncertain)return '操作結果尚未確認，請先重新整理查看；不會自動重送';
 return texts[code]??'服務暫時無法使用，請稍後重新整理';
}

export function DatingProfileScreen(){
 const router=useRouter(),navigation=useNavigation(),session=useSession(),{width}=useWindowDimensions(),isWide=width>=820;
 const [profile,setProfile]=useState<Profile|null>(null),[groups,setGroups]=useState<Record<string,Option[]>>({}),[avatars,setAvatars]=useState<Avatar[]>([]),[definitions,setDefinitions]=useState<ProfileField[]>([]);
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[style,setStyle]=useState('warm');
 const [loadedAccount,setLoadedAccount]=useState<string|undefined>(undefined),[avatarModal,setAvatarModal]=useState(false),[modalTab,setModalTab]=useState<ModalTab>('free');
 const [attempt,setAttempt]=useState<Attempt|null>(null),[selected,setSelected]=useState(1),[confirm,setConfirm]=useState<{kind:'delete'|'adopt'|'discard';id?:string}|null>(null);
 const [,setExpiryTick]=useState(0);
 useEffect(()=>{
  if(!attempt)return;let timer:ReturnType<typeof setTimeout>;
  const check=()=>{
   if(!alive.current)return;
   const remaining=attempt.expiresAt-api.serverNow;
   if(remaining>0){timer=setTimeout(check,remaining+5);return;}
   setExpiryTick(value=>value+1);setConfirm(current=>current?.kind==='adopt'?null:current);
   setNotice('本輪候選已過期，請重新開始');
  };
  timer=setTimeout(check,Math.max(0,attempt.expiresAt-api.serverNow)+5);
  return()=>clearTimeout(timer);
 },[attempt?.attemptId,attempt?.expiresAt]);
 const pending=useRef(false),generationRequest=useRef<string|undefined>(undefined),alive=useRef(true);
 const owner=useRef<string|undefined>(undefined);
 const scroll=useRef<React.ComponentRef<typeof ScrollView>>(null);
 usePendingBackGuard(pending,busy);
 const refresh=useCallback(async(preserveDraft=false)=>{
  const accountId=api.account?.accountId;
  const [current,catalog,avatarCatalog]=await Promise.all([api.request('/me/dating-profile'),api.request('/profile-catalog'),api.request('/avatar-catalog')]);
  if(!alive.current||accountId!==api.account?.accountId)throw new ApiFailure('SESSION_REVOKED',401);
  {

   const snapshot=formSnapshot(current,catalog.fields),fresh={...current,_savedForm:snapshot,draftConflict:false};
   setProfile(previous=>{
    if(!preserveDraft||!previous)return fresh;
    const baseline=previous._savedForm??formSnapshot(previous,catalog.fields),draft=formSnapshot(previous,catalog.fields);
    if(draft===baseline||draft===snapshot)return fresh;
    const conflict=current.revision!==previous.revision&&snapshot!==baseline;
    return {...fresh,cardVisibility:previous.cardVisibility,...Object.fromEntries(catalog.fields.filter((f:ProfileField)=>f.type!=='photos').map((f:ProfileField)=>[f.key,previous[f.key]])),revision:conflict?previous.revision:current.revision,_savedForm:conflict?baseline:snapshot,draftConflict:conflict||previous.draftConflict};
   });
   setDefinitions(catalog.fields);setGroups(catalog.groups);setAvatars(avatarCatalog.avatars);setLoadedAccount(accountId);if(!current.avatarAttemptUnavailable)setAttempt(current.avatarAttempt??null);if(current.avatarAttempt?.styleId)setStyle(current.avatarAttempt.styleId);
  }
 },[]);
 useFocusEffect(useCallback(()=>{
  alive.current=true;if(!session.ready)return;
  if(owner.current!==api.account?.accountId){owner.current=api.account?.accountId;setAttempt(null);setProfile(null);setLoadedAccount(undefined);setAvatarModal(false);setModalTab('free');}
  if(!api.account){setProfile(null);setAttempt(null);router.replace('/login');return;}
  refresh(true).catch(error=>{if(alive.current)setNotice(message(error));});
  return()=>{alive.current=false;};
 },[session.ready,api.account,refresh,router]));
 const run=async(action:()=>Promise<void>)=>{
  if(pending.current)return;pending.current=true;setBusy(true);setNotice('');
  try{await action();return true;}catch(error){if(alive.current)setNotice(message(error));return false;}
  finally{pending.current=false;if(alive.current)setBusy(false);}
 };
 const update=(key:string,value:unknown)=>setProfile(p=>p?{...p,[key]:value}:p);
 const source=(path:string)=>({uri:`${api.origin}/api/v1${path}`,headers:api.platform==='web'?undefined:{Authorization:`Bearer ${api.access}`},cache:'reload' as const});
 async function save(){
  if(!profile)return;
  if(profile.draftConflict){setNotice('請先重新整理已保存資料，再決定要修改的內容');return;}
  if([...profile.nickname.trim()].length<2||[...profile.nickname.trim()].length>12){setNotice('暱稱須為 2 至 12 個字');return;}
  if([...String(profile.bio??'')].length>40||[...String(profile.occupation??'')].length>60){setNotice('自我介紹最多 40 個字，工作／職業最多 60 個字');return;}
  const birthProblem=birthdayIssue(profile.birthDate,api.serverNow);if(birthProblem){setNotice(birthProblem);return;}
  const min=profile.preferredAgeMin??null,max=profile.preferredAgeMax??null;
  if((min===null)!==(max===null)){setNotice('年齡偏好的最小與最大值請一起填寫，或一起留空');return;}
  if(min!==null&&(!Number.isInteger(min)||!Number.isInteger(max)||min<18||max>120||min>max)){setNotice('年齡偏好須為 18 至 120 歲，且最小不大於最大');return;}
  return await run(async()=>{
   const payload=profilePayload(profile,definitions);
   await api.request('/me/dating-profile','PUT',{...payload,expectedRevision:profile.revision});

   await refresh();setNotice('個人資料已儲存');
  });
 }
 async function pick(){
  await run(async()=>{
   const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:false,quality:1,preferredAssetRepresentationMode:ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible});
   if(result.canceled)return;
   const photo=result.assets[0];
   try{
    if((photo.fileSize??0)>8*1024*1024)throw new ApiFailure('IMAGE_TOO_LARGE',413);
    const blob=photo.file??await (await fetch(photo.uri)).blob();
    const mime=photo.mimeType??blob.type;
    await api.uploadPhoto(blob.type===mime?blob:new Blob([blob],{type:mime}));
   }finally{
    if(Platform.OS!=='web'&&photo.uri.startsWith(Paths.cache.uri.replace(/\/?$/,'/'))){
     try{const file=new File(photo.uri);if(file.exists)file.delete();}catch{/* OS 仍持有檔案時交由應用 cache 清理。 */}
    }
   }
   await refresh(true);setNotice('照片已壓縮並安全儲存');
  });
 }
 async function reorder(index:number,direction:number){
  if(!profile)return;const ids=profile.personalPhotos.map(p=>p.assetId);[ids[index],ids[index+direction]]=[ids[index+direction],ids[index]];
  await run(async()=>{await api.request('/me/photos/order','PUT',{expectedRevision:profile.revision,assetIds:ids});await refresh(true);setNotice('照片順序已更新');});
 }
 async function generate(){
  await run(async()=>{
   generationRequest.current=uuid7();
   try{
    const result=await api.request('/me/avatar/generations','POST',{styleId:style,clientRequestId:generationRequest.current,expectedProducedCount:attempt?.producedCount??0,...(attempt?{attemptId:attempt.attemptId}:{})});
    setAttempt({...result,status:'open'});setSelected(result.index);setNotice('新候選已完成，可採用這張或繼續產生');
   }catch(error){try{await refresh(true);}catch{/* 只讀查詢失敗仍保留前一張，不重送生成。 */}throw error;}
  });
 }
 async function selectBuiltin(id:string){if(!profile)return;await run(async()=>{await api.request('/me/avatar/selection','PUT',{type:'builtin',builtinAvatarId:id,expectedRevision:profile.revision});await refresh(true);setNotice('遊戲化身已更新');});}
 async function selectSaved(assetId:string){if(!profile)return;await run(async()=>{await api.request('/me/avatar/selection','PUT',{type:'generated',assetId,expectedRevision:profile.revision});await refresh(true);setNotice('已重新選用保存的化身');});}
 async function confirmAction(){
  if(!confirm||!profile)return;const action=confirm;setConfirm(null);
  if(action.kind==='discard'){const next=discardAction.current;discardAction.current=null;next?.();return;}
  if(action.kind==='adopt'&&(!attempt||attempt.expiresAt<=api.serverNow)){
   setExpiryTick(value=>value+1);setNotice('本輪候選已過期，請重新開始');return;
  }
  await run(async()=>{
   if(action.kind==='delete'){await api.request(`/me/photos/${action.id}`,'DELETE',{});setNotice('照片已刪除');}
   else if(attempt){await api.request('/me/avatar/selection','PUT',{type:'generated',attemptId:attempt.attemptId,index:selected,expectedRevision:profile.revision});setAttempt(null);setNotice('已採用選中的遊戲化身');}
   await refresh(true);
  });
 }
 const chips=(field:ProfileField,cardBox=false)=>{
  const key=field.key,label=field.label,multiple=(field.editor??field.type)==='multi',limit=field.limit??1;
  const values=groups[field.options??key]??[],chosenList:string[]=multiple?(profile?.[key]??[]):[];
  return <View key={key} style={[cardBox?{flex:1,minWidth:'46%',padding:12,borderRadius:16,backgroundColor:'rgba(255,255,255,.04)',borderWidth:1,borderColor:'rgba(255,255,255,.10)',gap:8}:{gap:8}]}>
   <View style={s.labelRow}>
    <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
     <Text style={[s.label,cardBox&&{fontSize:12,color:colors.muted}]}>{label}</Text>
     {field.required&&<Text style={{color:colors.rose,fontSize:11,fontWeight:'700'}}>（必填）</Text>}
    </View>
    <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
     {multiple&&<Text style={s.counter}>{chosenList.length}/{limit}</Text>}
     {field.shareable&&!field.required&&<Switch accessibilityLabel={`開放${field.cardLabel??field.label}`} disabled={busy} value={visibleOnCard(field,profile?.cardVisibility??{})} onValueChange={value=>update('cardVisibility',{...profile?.cardVisibility,[field.cardKey]:value})}/>}
    </View>
   </View>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{values.map(option=>{
    const chosen=multiple?chosenList.includes(option.id):profile?.[key]===option.id;
    const disabled=busy||!option.active&&!chosen,optionLabel=option.label+(option.active?'':'（已停用）');
    return <Pressable key={option.id} disabled={disabled} accessibilityRole="checkbox" aria-checked={chosen} aria-disabled={disabled} accessibilityLabel={key==='gender'||key==='romanticOrientation'?`${label}：${optionLabel}`:optionLabel} accessibilityState={{checked:chosen,disabled}} onPress={()=>{
     if(multiple){const current:string[]=profile?.[key]??[];if(!chosen&&current.length>=limit){setNotice(`最多選擇 ${limit} 項`);return;}update(key,chosen?current.filter(id=>id!==option.id):[...current,option.id]);}
     else update(key,chosen?null:option.id);
    }} style={{paddingHorizontal:12,paddingVertical:7,borderRadius:999,borderWidth:1,borderColor:chosen?colors.rose:'rgba(255,255,255,.22)',backgroundColor:chosen?colors.rose:'rgba(255,255,255,.06)'}}><Text style={{fontSize:13,fontWeight:chosen?'800':'500',color:chosen?colors.ink:'#f0e4f0'}}>{optionLabel}</Text></Pressable>;
   })}</View>
  </View>;
 };
 const dirty=!!profile&&formSnapshot(profile,definitions)!==profile._savedForm;
 const discardAction=useRef<(()=>void)|null>(null),allowExit=useRef(false);
 const requestDiscard=(action:()=>void)=>{if(pending.current)return;if(dirty){discardAction.current=action;setConfirm({kind:'discard'});}else action();};
 const back=()=>requestDiscard(()=>{allowExit.current=true;if(router.canGoBack())router.back();else router.replace('/account');});
 useEffect(()=>(navigation as any).addListener('beforeRemove',(event:any)=>{
  if(!alive.current||allowExit.current)return;
  if(pending.current){event.preventDefault();return;}
  if(dirty){event.preventDefault();requestDiscard(()=>{allowExit.current=true;navigation.dispatch(event.data.action);});}
 }),[navigation,dirty]);
 useEffect(()=>{if(Platform.OS!=='android')return;const handler=BackHandler.addEventListener('hardwareBackPress',()=>{
  if(!alive.current)return false;if(pending.current)return true;if(avatarModal){setAvatarModal(false);return true;}back();return true;
 });return()=>handler.remove();},[dirty,avatarModal]);
 const pullStart=useRef<number|null>(null),scrollTop=useRef(true);
 const reload=()=>requestDiscard(()=>{void run(async()=>{await refresh();setNotice('已更新目前資料');});});
 const renderField=(field:ProfileField)=>{
  const key=field.key,editor=field.editor??field.type;
  if(editor==='choice'||editor==='multi')return chips(field);
  if(editor==='photos')return null;
  return <View key={key} style={{gap:8}}>
   <View style={s.labelRow}>
    <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
     <Text style={s.label}>{field.label}</Text>
     {field.required&&<Text style={{color:colors.rose,fontSize:11,fontWeight:'700'}}>（必填）</Text>}
    </View>
    {field.shareable&&!field.required&&<Switch accessibilityLabel={`開放${field.cardLabel??field.label}`} disabled={busy} value={visibleOnCard(field,profile?.cardVisibility??{})} onValueChange={value=>update('cardVisibility',{...profile?.cardVisibility,[field.cardKey]:value})}/>}
   </View>
   <TextInput accessibilityLabel={field.label} placeholder={field.type==='date'?'YYYY-MM-DD':undefined} placeholderTextColor="#9c82a0" autoCapitalize="none" editable={!busy} keyboardType={field.type==='number'?'number-pad':'default'} value={String(profile?.[key]??'')} onChangeText={text=>update(key,field.type==='number'?(text?Number(text):key==='sharedInterestWeight'?50:null):text||(key==='nickname'||key==='bio'?'':null))} style={s.input}/>
  </View>;
 };
 if(!session.ready||!api.account)return <SceneBackground><GlassPanel><LoadingOverlay/></GlassPanel></SceneBackground>;
 const visibleProfile=loadedAccount===api.account.accountId?profile:null;
 const weight=Math.min(100,Math.max(0,Number(profile?.sharedInterestWeight??50)||0));
 const hasAvatar=Boolean(profile?.selectedAvatarRef);
 const avatarImg=profile?.selectedAvatarType==='generated'&&profile?.selectedAvatarRef?source(`/me/media/${profile.selectedAvatarRef}`):profile?.selectedAvatarRef?(avatarAssets[profile.selectedAvatarRef]??avatarAssets['male-01']):null;
 const selectedTraits:string[]=(profile?.traitTagIds??[]).map((id:string)=>groups.traitTagIds?.find(o=>o.id===id)?.label).filter(Boolean).slice(0,4);
 const regionLabel=groups.regionCode?.find(o=>o.id===profile?.regionCode)?.label;

 // 整合「人物頭像（無頭像 +創建 / 有頭像右下角人物小頭編輯icon）」與「名片預覽」的頭像框面板
 const avatarCardPanel=profile&&<GlassPanel style={{width:isWide?340:'100%',maxWidth:isWide?340:'100%',alignItems:'center',gap:12}}>
  <Pressable accessibilityRole="button" accessibilityLabel="選擇化身" disabled={busy} onPress={()=>setAvatarModal(true)} style={({pressed})=>[{width:isWide?'100%':184,aspectRatio:3/4,borderRadius:22,overflow:'hidden',borderWidth:2,borderStyle:hasAvatar?'solid':'dashed',borderColor:colors.rose,backgroundColor:hasAvatar?'rgba(0,0,0,.32)':'rgba(255,122,162,.08)',alignItems:'center',justifyContent:'center'},pressed&&{opacity:.82}]}>
   {hasAvatar&&avatarImg?<>
    <Image source={avatarImg} accessibilityLabel={profile.selectedAvatarType==='generated'?'目前遊戲化身':`目前頭像 ${profile.selectedAvatarRef}`} resizeMode="cover" style={{width:'100%',height:'100%'}}/>
    <PersonEditIcon/>
   </>:<View style={{alignItems:'center',gap:8,padding:16}}>
    <View style={{width:52,height:52,borderRadius:999,backgroundColor:'rgba(255,122,162,.20)',borderWidth:1.5,borderColor:colors.rose,alignItems:'center',justifyContent:'center'}}>
     <Text style={{color:colors.rose,fontSize:26,fontWeight:'800',lineHeight:30}}>+</Text>
    </View>
    <Text style={{color:'#fff7fa',fontSize:18,fontWeight:'800'}}>+ 創建</Text>
    <Text style={{color:colors.muted,fontSize:12,textAlign:'center'}}>點擊選擇免費或 AI 化身</Text>
   </View>}
  </Pressable>
  <Text style={[s.heading,{fontSize:22,marginTop:2}]}>{profile.nickname?.trim()||'你的化身'}</Text>
  <Text style={[s.body,{textAlign:'center',color:colors.muted,fontSize:13}]}>{profile.bio?.trim()||'填寫自我介紹與偏好，打造專屬名片'}</Text>
  {(regionLabel||selectedTraits.length>0)&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,justifyContent:'center'}}>
   {regionLabel&&<View style={{paddingHorizontal:10,paddingVertical:3,borderRadius:999,backgroundColor:'rgba(255,210,122,.16)',borderWidth:1,borderColor:colors.gold}}><Text style={{fontSize:11,color:colors.gold,fontWeight:'700'}}>{regionLabel}</Text></View>}
   {selectedTraits.map(t=><View key={t} style={{paddingHorizontal:10,paddingVertical:3,borderRadius:999,backgroundColor:'rgba(255,122,162,.16)',borderWidth:1,borderColor:colors.rose}}><Text style={{fontSize:11,color:'#ffd9e6',fontWeight:'700'}}>{t}</Text></View>)}
  </View>}
 </GlassPanel>;

 return <SceneBackground scrollRef={scroll} scrollProps={{
  style:Platform.OS==='web'?({overscrollBehaviorY:'contain'} as any):undefined,
  refreshControl:Platform.OS==='web'?undefined:<RefreshControl refreshing={busy} onRefresh={reload} tintColor={colors.rose}/>,
  scrollEventThrottle:16,onScroll:event=>{scrollTop.current=event.nativeEvent.contentOffset.y<=0;},
  onTouchStart:event=>{pullStart.current=Platform.OS==='web'&&!isWide&&scrollTop.current?touchY(event):null;},
  onTouchCancel:()=>{pullStart.current=null;},
  onTouchEnd:event=>{const start=pullStart.current;pullStart.current=null;if(start!==null&&touchY(event)-start>=70)reload();}
 }} header={<View style={{alignItems:'center',paddingLeft:12,paddingRight:Platform.OS==='web'?12:52,paddingVertical:8,backgroundColor:'rgba(26,12,36,.92)',borderBottomWidth:1,borderColor:colors.line}}><View style={{width:'100%',maxWidth:isWide?1120:480,gap:8}}>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:6}}>
   <PrimaryButton label="返回" compact secondary disabled={busy} onPress={back}/>
   {dirty&&<PrimaryButton label="儲存" compact disabled={busy||!profile} onPress={save}/>}
  </View>
  <InlineNotice text={avatarModal?'':notice}/>{profile?.draftConflict&&<InlineNotice text="其他地方已有更新；目前草稿保留。重新整理會載入已保存資料。"/>}
 </View></View>}><View style={{width:'100%',maxWidth:isWide?1120:480,flexDirection:isWide?'row':'column',alignItems:'flex-start',gap:22}}>
  {busy&&<LoadingOverlay/>}
  {!visibleProfile||!profile?<GlassPanel><LoadingOverlay/></GlassPanel>:<>
   {avatarCardPanel}
   <View style={{flex:1,width:'100%',gap:16}}>
    <GlassPanel style={{maxWidth:'100%',gap:14}}>
     <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}>
      <Text accessibilityRole="header" style={[s.heading,{fontSize:20,textAlign:'left'}]}>個人資料</Text>
      <PrimaryButton label="我的名片" compact disabled={busy} onPress={async()=>{if(dirty&&!await save())return;router.push('/card-preview');}}/>
     </View>
     <Text style={{color:colors.muted,fontSize:12,lineHeight:18}}>
      💡 提示：開啟欄位開關，在雙方同意交換名片時將開放該資訊給對方查看。
     </Text>
     {definitions.find(f=>f.type==='photos')&&(()=>{
      const photosField=definitions.find(f=>f.type==='photos')!;
      return <View style={{gap:8,paddingBottom:12,borderBottomWidth:1,borderColor:'rgba(255,255,255,.10)'}}>
       <View style={s.labelRow}>
        <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
         <Text style={s.label}>{photosField.label}</Text>
         {photosField.required&&<Text style={{color:colors.rose,fontSize:11,fontWeight:'700'}}>（必填）</Text>}
        </View>
        {photosField.shareable&&!photosField.required&&<Switch accessibilityLabel={`開放${photosField.cardLabel??photosField.label}`} disabled={busy} value={visibleOnCard(photosField,profile?.cardVisibility??{})} onValueChange={value=>update('cardVisibility',{...profile?.cardVisibility,[photosField.cardKey]:value})}/>}
       </View>
       <PrimaryButton label="管理個人照片" secondary disabled={busy} onPress={()=>{setAvatarModal(true);setModalTab('ai');}}/>
      </View>;
     })()}
     {definitions.slice().sort((a,b)=>a.order-b.order).filter(f=>f.type!=='photos').map(renderField)}
    </GlassPanel>
   </View>
  </>}
  <Modal visible={avatarModal||!!confirm} transparent animationType="fade" onRequestClose={()=>{if(pending.current)return;if(confirm)setConfirm(null);else setAvatarModal(false);}}>
   <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(14,6,22,.88)',padding:isWide?24:10}}>
    {confirm?<GlassPanel style={{maxWidth:440}}>
     <Text accessibilityRole="header" style={s.heading}>{confirm.kind==='discard'?'捨棄未儲存的修改？':confirm.kind==='delete'?'確定刪除這張照片？':'確認採用這張化身'}</Text>
     <Text style={s.body}>{confirm.kind==='discard'?'繼續將捨棄目前修改，並載入已保存資料。':confirm.kind==='delete'?'刪除後，後續的名片讀取與 AI 生成將無法再使用這張照片。':adoptNotice}</Text>
     <PrimaryButton label="取消" secondary onPress={()=>setConfirm(null)}/>
     <PrimaryButton label={confirm.kind==='discard'?'捨棄修改':confirm.kind==='delete'?'確認刪除':'確認採用'} onPress={confirmAction}/>
    </GlassPanel>:profile&&<GlassPanel style={{maxWidth:isWide?780:480,width:'100%',maxHeight:'94%',padding:isWide?22:14,gap:12}}>
     <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
      <Text accessibilityRole="header" style={[s.heading,{fontSize:20,textAlign:'left'}]}>選擇遊戲化身</Text>
      <PrimaryButton label="關閉" compact secondary onPress={()=>setAvatarModal(false)}/>
     </View>
     <InlineNotice text={notice}/>
     <View style={{flexDirection:'row',gap:6,padding:4,borderRadius:999,backgroundColor:'rgba(0,0,0,.38)',borderWidth:1,borderColor:colors.line}}>
      <View style={{flex:1}}><PrimaryButton label="免費化身" compact secondary={modalTab!=='free'} active={modalTab==='free'} onPress={()=>setModalTab('free')}/></View>
      <View style={{flex:1}}><PrimaryButton label="AI 客製化" compact secondary={modalTab!=='ai'} active={modalTab==='ai'} onPress={()=>setModalTab('ai')}/></View>
     </View>
     <ScrollView contentContainerStyle={{gap:14,paddingBottom:8}} keyboardShouldPersistTaps="handled">
      {modalTab==='free'?<>
       {(!profile.gender||JSON.parse(profile._savedForm??'{}').gender!==profile.gender)&&<InlineNotice text="請先儲存生理性別，再選擇免費化身"/>}
       {profile.selectedAvatarType==='generated'&&profile.selectedAvatarRef&&<View style={{gap:8}}><Text style={s.label}>目前選用的 AI 化身</Text><Image source={source(`/me/media/${profile.selectedAvatarRef}`)} accessibilityLabel="目前遊戲化身" resizeMode="contain" style={{width:'100%',aspectRatio:3/4,maxHeight:260,borderRadius:16}}/></View>}
       {!!profile.generatedAvatars?.length&&<View style={{gap:8}}><Text style={s.label}>已保存的 AI 化身</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{profile.generatedAvatars.map((avatar:{assetId:string},index:number)=><Pressable key={avatar.assetId} accessibilityRole="button" accessibilityLabel={`選用已保存化身 ${index+1}`} {...pressedState(profile.selectedAvatarType==='generated'&&profile.selectedAvatarRef===avatar.assetId)} accessibilityState={{selected:profile.selectedAvatarType==='generated'&&profile.selectedAvatarRef===avatar.assetId,disabled:busy}} disabled={busy} onPress={()=>selectSaved(avatar.assetId)} style={{width:'23%',borderWidth:2,borderColor:profile.selectedAvatarRef===avatar.assetId?colors.rose:colors.line,borderRadius:14,overflow:'hidden'}}><Image source={source(`/me/media/${avatar.assetId}`)} accessibilityLabel={`已保存的 AI 化身 ${index+1}`} resizeMode="contain" style={{width:'100%',aspectRatio:3/4}}/></Pressable>)}</View></View>}
       {['male','female'].filter(group=>profile.gender&&JSON.parse(profile._savedForm??'{}').gender===profile.gender&&(profile.gender==='diverse'||profile.gender===group)).map(group=><View key={group} style={{gap:8}}><Text style={s.label}>{group==='male'?'男性風格':'女性風格'}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{avatars.filter(a=>a.group===group&&profile.gender&&JSON.parse(profile._savedForm??'{}').gender===profile.gender&&(profile.gender==='diverse'||profile.gender===group)).map(avatar=><Pressable key={avatar.id} accessibilityRole="button" accessibilityLabel={`選用 ${avatar.id}`} {...pressedState(profile.selectedAvatarRef===avatar.id)} accessibilityState={{selected:profile.selectedAvatarType==='builtin'&&profile.selectedAvatarRef===avatar.id,disabled:busy}} disabled={busy} onPress={()=>selectBuiltin(avatar.id)} style={{width:'23%',borderWidth:2,borderColor:profile.selectedAvatarRef===avatar.id?colors.rose:colors.line,borderRadius:14,overflow:'hidden',backgroundColor:'rgba(255,255,255,.06)'}}><Image source={avatarAssets[avatar.id]} accessibilityLabel={avatar.id} resizeMode="contain" style={{width:'100%',height:Platform.OS==='web'?'auto':undefined,aspectRatio:3/4}}/>{profile.selectedAvatarRef===avatar.id&&<Text style={{position:'absolute',left:0,right:0,bottom:0,fontSize:10,textAlign:'center',paddingVertical:3,color:colors.gold,fontWeight:'800',backgroundColor:'rgba(20,8,28,.82)'}}>目前選用 · {avatar.id}</Text>}</Pressable>)}</View></View>)}
      </>:<View style={{gap:14}}>
       <View style={{gap:10,padding:14,borderRadius:18,backgroundColor:'rgba(255,255,255,.04)',borderWidth:1,borderColor:colors.line}}>
        <View style={s.labelRow}><Text accessibilityRole="header" style={s.label}>個人照片</Text><Text style={s.counter}>已保存 {profile.personalPhotos.length}/5 張 · 單張上限 8 MiB</Text></View>
        {!profile.personalPhotos.length&&<SubtleBadge text="尚未上傳照片；仍可直接選擇免費化身。"/>}
        {!!profile.personalPhotos.length&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{profile.personalPhotos.map((photo,index)=><View key={photo.assetId} style={{width:isWide?'31%':'48%',gap:8,padding:10,borderRadius:14,backgroundColor:'rgba(0,0,0,.26)',borderWidth:1,borderColor:colors.line}}>
         <Image source={source(`/me/media/${photo.assetId}`)} accessibilityLabel={`個人照片 ${index+1}`} resizeMode="contain" style={{width:'100%',aspectRatio:3/4,maxHeight:180,borderRadius:10}}/>
         <View style={{flexDirection:'row',flexWrap:'wrap',gap:4,justifyContent:'center'}}>
          <PrimaryButton label={`照片 ${index+1} 往前移`} compact disabled={busy||index===0} secondary onPress={()=>reorder(index,-1)}/>
          <PrimaryButton label={`照片 ${index+1} 往後移`} compact disabled={busy||index===profile.personalPhotos.length-1} secondary onPress={()=>reorder(index,1)}/>
          <PrimaryButton label={`刪除照片 ${index+1}`} compact disabled={busy} secondary onPress={()=>setConfirm({kind:'delete',id:photo.assetId})}/>
         </View>
        </View>)}</View>}
        <PrimaryButton label="新增個人照片" secondary={profile.personalPhotos.length>=2} disabled={busy||profile.personalPhotos.length>=5} onPress={pick}/>
        <Text style={s.footer}>{purpose}</Text>
        <Text style={s.footer}>照片會在你主動使用 AI 時提供第三方生成服務；初期不向其他玩家公開。</Text>
       </View>
       <View style={{gap:12,padding:14,borderRadius:18,backgroundColor:'rgba(255,255,255,.04)',borderWidth:1,borderColor:colors.line}}>
        {!attempt&&<View style={{gap:8}}><Text style={s.label}>選擇 AI 畫風</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{styles.map(([id,label,accent])=><View key={id} style={{width:'48%'}}><PrimaryButton label={`${style===id?'已選 · ':''}${label}`} compact secondary={style!==id} active={style===id} accentColor={accent} onPress={()=>setStyle(id)} disabled={busy}/></View>)}</View></View>}
        {profile.personalPhotos.length<2?<SubtleBadge text="至少需要 2 張已保存的個人照片，請先新增照片。"/>:<>
         {attempt&&<><SubtleBadge text={`已產 ${attempt.producedCount}/4 張 · 候選於 ${new Date(attempt.expiresAt).toLocaleTimeString('zh-TW')} 到期`}/><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{Array.from({length:attempt.producedCount},(_,n)=>n+1).map(index=><Pressable key={index} accessibilityRole="button" accessibilityLabel={`比較候選 ${index}`} {...pressedState(index===selected)} accessibilityState={{selected:index===selected}} onPress={()=>setSelected(index)} style={{width:'46%',borderColor:index===selected?colors.rose:colors.line,borderWidth:2,borderRadius:12,overflow:'hidden'}}><Image source={source(`/me/avatar/candidates/${attempt.attemptId}/${index}`)} accessibilityLabel={`AI 候選 ${index}`} resizeMode="contain" style={{width:'100%',aspectRatio:3/4}}/></Pressable>)}</View>{attempt.producedCount>0&&<PrimaryButton label="採用這張" disabled={busy||attempt.expiresAt<=api.serverNow} onPress={()=>setConfirm({kind:'adopt'})}/>}</>}
         {attempt?.status==='uncertain'&&<SubtleBadge text="上次供應商用量未能確認，本輪不會再送出生成；仍可採用已有候選。"/>}
         <PrimaryButton label={attempt?.producedCount?'產生下一張':'開始產生第1張'} disabled={busy||!!attempt&&(attempt.producedCount>=4||attempt.expiresAt<=api.serverNow||!!attempt.status&&attempt.status!=='open')} onPress={generate}/>
         {attempt&&attempt.expiresAt<=api.serverNow&&<PrimaryButton label="開始新的一輪" disabled={busy} secondary onPress={()=>{setAttempt(null);setSelected(1);setNotice('過期候選已結束；選好風格後再按開始產生');}}/>}
        </>}
        <View style={{gap:4,paddingTop:4,borderTopWidth:1,borderColor:'rgba(255,255,255,.1)'}}>
         <Text style={s.footer}>{disclosure}</Text>
         <Text style={s.footer}>重新嘗試可能增加第三方供應商成本；本 MVP 目前免費，不扣款。</Text>
        </View>
       </View>
      </View>}
     </ScrollView>
    </GlassPanel>}
   </View>
  </Modal>
 </View></SceneBackground>;
}
