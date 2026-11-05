import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Text,View} from 'react-native';
import {useRouter,useLocalSearchParams,useFocusEffect} from 'expo-router';
import {ApiFailure,type Account} from './api';
import {api,flows,useSession} from './session';
import type {EmailFlow} from './flow';
import {maskEmail,messageFor,validateForm} from './forms';
import GoogleButton from './GoogleButton';
import {usePendingBackGuard} from './pending-back-guard';
import {SceneBackground,GlassPanel,PrimaryButton,FormField,SubtleBadge,InlineNotice,LoadingOverlay,s} from './ui';

const titles:Record<string,string>={'':'心動迴路',register:'讓相遇開始',login:'歡迎回來','verify-email':'確認你的 Email','forgot-password':'找回你的帳號','reset-password':'設定新密碼',account:'你的帳號','account/password':'更新密碼','account/connections':'登入方式'};
const features:[string,string][]=[['虛擬化身','16 款免費角色與 AI 客製'],['每日配對','雙向契合度興趣推薦'],['互動闖關','破冰問答與默契小遊戲'],['雙向解鎖','雙方同意才交換真人名片']];

function isCompleteAccount(value:unknown):value is Account{
 if(!value||typeof value!=='object')return false;
 const account=value as Partial<Account>;
 return typeof account.accountId==='string'&&account.accountId.length>0&&typeof account.email==='string'&&account.email.length>0&&account.emailVerified===true&&typeof account.hasLocalPassword==='boolean'&&Array.isArray(account.linkedProviders)&&account.linkedProviders.every(provider=>typeof provider==='string');
}

export function Screen({screen}:{screen:string}){
 const router=useRouter(),session=useSession();
 const params=useLocalSearchParams<{notice?:string}>();
 const [fields,setFields]=useState({email:'',password:'',confirm:'',currentPassword:'',code:''});
 const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[recoveryRequested,setRecoveryRequested]=useState(false),[flow,setFlow]=useState<EmailFlow|null>(null),[seconds,setSeconds]=useState(0),[retryUntil,setRetryUntil]=useState(0);
 const pending=useRef(false);const mounted=useRef(true);
 usePendingBackGuard(pending,busy);
 const change=(key:keyof typeof fields)=>(value:string)=>setFields(f=>({...f,[key]:value}));
 const navigate=(path:string)=>{if(!pending.current&&!busy)router.push(path as never);};
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useFocusEffect(useCallback(()=>{
  if(!session.ready)return;
  if(screen.startsWith('account')&&!api.account){router.replace('/login');return;}
  if(screen===''&&api.account){router.replace('/account');return;}
  if(['verify-email','reset-password'].includes(screen)){
   flows.read().then(f=>{if(mounted.current)setFlow(f);});
  }
 },[screen,session.ready,api.account]));
 useFocusEffect(useCallback(()=>()=>setFields(f=>({...f,password:'',confirm:'',currentPassword:'',code:''})),[]));
 useEffect(()=>{
  const update=()=>{const now=api.serverNow;setSeconds(Math.max(0,Math.ceil((Math.max(flow?Date.parse(flow.resendAfter):0,retryUntil)-now)/1000)));if(flow&&Date.parse(flow.absoluteExpiresAt)<=now){setFlow(null);setFields(f=>({...f,password:'',confirm:'',currentPassword:'',code:''}));void flows.clear().catch(()=>setNotice('無法保存驗證流程，請重新申請驗證碼'));}};
  update();const timer=setInterval(update,1000);return()=>clearInterval(timer);
 },[flow,retryUntil]);
 const effectiveNotice=notice||params.notice||(session.notice&&!(api.pendingRevoke&&session.notice==='LOGOUT_PENDING')?`${messageFor(session.notice)}${session.noticeTrace?`（追蹤編號 ${session.noticeTrace}）`:''}`:'');
 const canRetryRecovery=recoveryRequested||['NETWORK_ERROR','DEPENDENCY_UNAVAILABLE','SERVICE_UNAVAILABLE'].includes(session.notice);
 const account=isCompleteAccount(api.account)?api.account:undefined;const accountReady=!!account;
 const run=async(action:()=>Promise<void>)=>{
  if(pending.current)return;pending.current=true;setBusy(true);setNotice('');session.setNotice('');
  try{await action();}
  catch(e){
   const error=e instanceof ApiFailure?e:new ApiFailure('SERVICE_UNAVAILABLE',503);
   if(error.code==='REQUEST_SUPERSEDED')return;
   if(error.code==='EMAIL_DELIVERY_FAILED'&&error.recovery&&(screen==='register'||screen==='verify-email')){
    const metadata={...flow,...error.recovery,emailMasked:flow?.emailMasked??maskEmail(fields.email.trim()),purpose:'register_email',deliveryFailed:true} as EmailFlow;
    try{await flows.save(metadata);setFlow(await flows.read());if(screen==='register')router.push('/verify-email');}
    catch{setFlow(null);if(mounted.current)setNotice('無法保存驗證流程，請重新申請驗證碼');return;}
   }
   if(error.retryAfter)setRetryUntil(api.serverNow+error.retryAfter*1000);
   if(mounted.current)setNotice(error.uncertain?(screen==='reset-password'||screen==='account/password'?'操作結果尚未確認，請先嘗試使用新密碼登入':'操作結果尚未確認，請重新登入後查看'):`${messageFor(error.code)}${error.traceId&&error.status>=500?`（追蹤編號 ${error.traceId}）`:''}`);
  }finally{pending.current=false;if(mounted.current)setBusy(false);}
 };
 async function submit(){
  const invalid=validateForm(screen,fields);if(invalid){setNotice(invalid);return;}
  await run(async()=>{
   if(screen==='register'||screen==='forgot-password'){
    const purpose=screen==='register'?'register_email':'reset_password';
    const result=await api.request(screen==='register'?'/email-registrations':'/password-reset-requests','POST',{email:fields.email,clientPlatform:api.platform});
    await flows.save({...result,emailMasked:maskEmail(fields.email.trim()),purpose});
    router.push(screen==='register'?'/verify-email':'/reset-password');
   }else if(screen==='verify-email'||screen==='reset-password'){
    if(!flow){setNotice('驗證流程已失效，請重新申請');return;}
    const request={challengeId:flow.challengeId,flowToken:flow.flowToken,code:fields.code};
    const result=await api.request(screen==='verify-email'?'/accounts':'/password-resets','POST',screen==='verify-email'?{...request,password:fields.password,clientPlatform:api.platform}:{...request,newPassword:fields.password});
    await flows.clear();setFields(f=>({...f,password:'',confirm:'',code:''}));
    if(screen==='verify-email'){await api.accept(result);session.setNotice('EMAIL_VERIFIED');router.replace('/account');}
    else{session.setNotice('PASSWORD_RESET');await api.forget();router.replace('/login');}
   }else if(screen==='login'){
    const result=await api.request('/sessions','POST',{email:fields.email,password:fields.password,clientPlatform:api.platform});
    await api.accept(result);setFields(f=>({...f,password:''}));router.replace('/account');
   }else if(screen==='account/password'){
    await api.request('/me/password','PUT',{currentPassword:fields.currentPassword,newPassword:fields.password});session.setNotice('PASSWORD_CHANGED');await api.forget();router.replace('/login');
   }
  });
 }
 const google=async(credential:string)=>{
  await run(async()=>{
   const linking=screen==='account/connections',previousSessionId=api.sessionId;
   try{
    const result=await api.request(linking?'/me/identities/google':'/sessions/external/google','POST',{credential,clientPlatform:api.platform});
    if(linking){const account=await api.request('/me');api.account=account;api.onChange();setNotice('Google 已連結');}
    else{await api.accept(result);router.replace('/account');}
   }catch(e){
    if(e instanceof ApiFailure&&e.uncertain){
     try{const current=linking?await api.request('/session'):await api.confirmExternalLogin(previousSessionId);if(linking){const identities=await api.request('/me/identities');if(identities.identities.some((i:{provider:string})=>i.provider==='google')){api.account=current.account;api.onChange();setNotice('Google 已連結');return;}}
      else{api.sessionId=current.session.sessionId;api.account=current.account;api.onChange();router.replace('/account');return;}}
     catch{}
    }throw e;
   }
  });
 };
 const resend=()=>run(async()=>{
  if(!flow)return;
  const result=await api.request(`/email-challenges/${flow.challengeId}/resend`,'POST',{flowToken:flow.flowToken});
  const next={...flow,...result,deliveryFailed:false};await flows.save(next);setFlow(next);setNotice(flow.purpose==='reset_password'?'若此 Email 可處理，將收到新的驗證碼，請使用最新的驗證碼':'已重新寄送驗證碼，請使用最新的驗證碼');setFields(f=>({...f,code:''}));
 });
 const field=(key:keyof typeof fields,label:string,password=false,placeholder?:string)=><FormField key={key} label={label} value={fields[key]} placeholder={placeholder} onChangeText={change(key)} secureTextEntry={password} editable={!busy} autoComplete="off" textContentType="none" importantForAutofill="no" keyboardType={key==='email'?'email-address':key==='code'?'number-pad':'default'} maxLength={key==='code'?6:undefined} onSubmitEditing={submit} returnKeyType="done"/>;
 const action=(label:string,path:string,secondary=true)=><PrimaryButton key={path} label={label} onPress={()=>navigate(path)} disabled={busy} secondary={secondary}/>;
 const googleButton=<GoogleButton disabled={busy} sessionId={api.sessionId} onCredential={google} onNotice={code=>setNotice(messageFor(code))} onBusy={setBusy}/>;
 const verification=['verify-email','reset-password'].includes(screen);
 return <SceneBackground><View style={{width:'100%',maxWidth:460,gap:18}}>
  <GlassPanel>
   <Text style={s.eyebrow}>HEARTLINK · AVATAR LOVE SIM</Text>
   <Text accessibilityRole="header" style={[s.heading,screen===''&&{fontSize:38,lineHeight:46}]}>{titles[screen]}</Text>
   {!session.ready?<LoadingOverlay/>:<>
    <InlineNotice text={effectiveNotice}/>
    {canRetryRecovery&&!(screen.startsWith('account')&&api.account&&!accountReady)&&<><PrimaryButton label="重試" disabled={busy} onPress={()=>{setRecoveryRequested(true);void run(async()=>{try{const outcome=await api.restore();setRecoveryRequested(false);if(outcome==='logged-out'){session.setNotice('LOGGED_OUT');router.replace('/');}else if(outcome==='session-changed'){session.setNotice('SESSION_CHANGED');router.replace('/login');}else router.replace(api.account?'/account':'/login');}catch(error){if(error instanceof ApiFailure&&error.code==='ACCESS_TOKEN_MISSING'){setRecoveryRequested(false);session.setNotice('REFRESH_INVALID');router.replace('/login');return;}throw error;}});}} secondary/>{screen!=='login'&&action('返回登入','/login')}</>}
    {screen.startsWith('account')&&api.account&&!accountReady&&<><InlineNotice text="帳號資料暫時無法確認，請重試"/><PrimaryButton label="重試" disabled={busy} onPress={()=>void run(async()=>{const account=await api.request('/me');if(!isCompleteAccount(account))throw new ApiFailure('SERVICE_UNAVAILABLE',503);api.account=account;api.onChange();})} secondary/></>}
    {screen===''&&<>
     <Text style={[s.body,{textAlign:'center'}]}>先用虛擬化身遇見彼此的心，再一起走向真實世界的約會。</Text>
     <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{features.map(([title,desc])=><View key={title} style={{width:'48%',padding:11,borderRadius:14,backgroundColor:'rgba(255,255,255,.05)',borderWidth:1,borderColor:'rgba(255,255,255,.10)',gap:2}}><Text style={s.label}>{title}</Text><Text style={s.subtleText}>{desc}</Text></View>)}</View>
     {action('使用 Email 註冊','/register',false)}{action('使用 Email 登入','/login')}{googleButton}
    </>}
    {['register','login','forgot-password'].includes(screen)&&<>
     {field('email','Email')}{screen==='login'&&field('password','密碼',true)}
     <PrimaryButton label={screen==='login'?'登入':'寄送驗證碼'} disabled={busy||seconds>0} onPress={submit}/>
     {screen==='login'&&<>{action('忘記密碼','/forgot-password')}{googleButton}{action('建立帳號','/register')}</>}
     {screen==='register'&&action('前往登入','/login')}
    </>}
    {verification&&(flow&&flow.purpose===(screen==='verify-email'?'register_email':'reset_password')?<>
     <SubtleBadge text={`${screen==='reset-password'?'若此 Email 可處理，將收到驗證碼':flow.deliveryFailed?'驗證碼暫時無法寄送，請稍後重試':'驗證碼已寄出，請查看信箱'} · ${flow.emailMasked} · 有效至 ${new Date(flow.expiresAt).toLocaleTimeString()}`}/>
     {field('code','六位數驗證碼')}{field('password',screen==='reset-password'?'新密碼':'密碼',true,'12–128 個字元')}{field('confirm','確認密碼',true,'再次輸入密碼')}
     <PrimaryButton label={screen==='reset-password'?'重設密碼':'驗證並建立帳號'} disabled={busy||seconds>0&&retryUntil>api.serverNow} onPress={submit}/>
     <PrimaryButton label={seconds>0?`請稍候再重寄驗證碼（${seconds} 秒）`:'重新寄送驗證碼'} disabled={busy||seconds>0} onPress={resend} secondary/>
     {action('重新申請驗證碼',screen==='reset-password'?'/forgot-password':'/register')}
    </>:<><InlineNotice text="驗證流程已失效，請重新申請"/>{action('重新申請',screen==='reset-password'?'/forgot-password':'/register',false)}</>)}
    {screen==='account'&&accountReady&&<>
     <View style={{padding:14,borderRadius:16,backgroundColor:'rgba(255,255,255,.05)',borderWidth:1,borderColor:'rgba(255,255,255,.10)',gap:8}}>
      <Text style={[s.label,{fontSize:16}]}>{account!.email}</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}><SubtleBadge text="Email 已驗證"/><SubtleBadge text={account!.linkedProviders.includes('google')?'Google 已連結':'尚未連結 Google'}/></View>
     </View>
     {action('個人資料與遊戲化身','/profile',false)}
     {action(account!.hasLocalPassword?'修改密碼':'透過 Email 設定密碼',account!.hasLocalPassword?'/account/password':'/forgot-password')}
     {action('管理登入方式','/account/connections')}
     <PrimaryButton label="登出" onPress={()=>run(async()=>{const confirmed=await api.logout();session.setNotice(confirmed?'LOGGED_OUT':'SESSION_CHANGED');router.replace(confirmed?'/':'/login');})} disabled={busy} secondary/>
    </>}
    {screen==='account/password'&&accountReady&&(account!.hasLocalPassword?<>
     {field('currentPassword','目前密碼',true)}{field('password','新密碼',true,'12–128 個字元')}{field('confirm','確認密碼',true)}
     <PrimaryButton label="更新密碼" onPress={submit} disabled={busy}/>
    </>:<><InlineNotice text="請先透過 Email 設定密碼"/>{action('寄送重設驗證碼','/forgot-password',false)}</>)}
    {screen==='account/connections'&&accountReady&&<>
     <SubtleBadge text={account!.linkedProviders.includes('google')?'Google 已連結':'尚未連結 Google'}/>
     {account!.linkedProviders.includes('google')?(account!.hasLocalPassword?<>
      {field('currentPassword','目前密碼',true)}<PrimaryButton label="解除 Google 連結" disabled={busy||!fields.currentPassword} onPress={()=>run(async()=>{await api.request('/me/identities/google','DELETE',{currentPassword:fields.currentPassword});session.setNotice('IDENTITY_UNLINKED');await api.forget();router.replace('/login');})} secondary/>
     </>:<><InlineNotice text="請先透過 Email 設定密碼，再管理登入方式。"/>{action('透過 Email 設定密碼','/forgot-password',false)}</>):googleButton}
    </>}
    {api.pendingRevoke&&<><InlineNotice text="尚未完成伺服器登出，請重試"/><PrimaryButton label="重試登出" onPress={()=>run(async()=>{const confirmed=await api.retryLogout();session.setNotice(confirmed?'LOGGED_OUT':'SESSION_CHANGED');router.replace(confirmed?'/':'/login');})} disabled={busy}/></>}
    {busy&&<LoadingOverlay/>}
    {screen!==''&&action(screen.startsWith('account/')?'返回帳號':'返回開始畫面',screen.startsWith('account/')?'/account':'/')}
   </>}
  </GlassPanel>
 </View></SceneBackground>;
}
