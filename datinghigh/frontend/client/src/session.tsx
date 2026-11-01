import React,{createContext,useContext,useEffect,useState} from 'react';
import {Platform,AppState} from 'react-native';
import {useRouter} from 'expo-router';
import {ApiClient,ApiFailure} from './api';
import {storage} from './storage';
import {FlowStore} from './flow';
import {defaultApiOrigin} from './api-origin';
const origin=process.env.EXPO_PUBLIC_API_ORIGIN??defaultApiOrigin(Platform.OS);
export const api=new ApiClient(origin,Platform.OS==='ios'?'ios':Platform.OS==='android'?'android':'web',storage);
export const flows=new FlowStore(storage,()=>api.serverNow);
const SessionContext=createContext({api,ready:false,notice:'',noticeTrace:'',setNotice:(_value:string)=>{}});
export const useSession=()=>useContext(SessionContext);
export function SessionProvider({children}:{children:React.ReactNode}){
 const router=useRouter();
 const [,render]=useState(0),[ready,setReady]=useState(false),[notice,setNoticeValue]=useState(''),[noticeTrace,setNoticeTrace]=useState('');
 const setNotice=(value:string)=>{setNoticeValue(value);setNoticeTrace('');};
 useEffect(()=>{
  api.onChange=()=>render(x=>x+1);
  const failed=(e:unknown,restoring=false)=>{if(e instanceof ApiFailure){if(e.code==='ACCESS_TOKEN_MISSING'||(e.code==='REFRESH_INVALID'&&api.platform==='web'))return;setNotice(e.code);if(e.status>=500&&e.traceId)setNoticeTrace(e.traceId);if(e.code!=='LOGOUT_PENDING'&&(e.status===401||(restoring&&api.platform!=='web')))router.replace('/login');}else{setNotice('NETWORK_ERROR');if(restoring&&api.platform!=='web')router.replace('/login');}};
  api.restore().then(outcome=>{if(outcome==='logged-out'){setNotice('LOGGED_OUT');router.replace('/');}else if(outcome==='session-changed'){setNotice('SESSION_CHANGED');router.replace('/login');}}).catch(e=>failed(e,true)).finally(()=>setReady(true));
  const foreground=()=>{api.foreground().catch(failed);};
  const subscription=AppState.addEventListener('change',state=>{if(state==='active')foreground();});
  if(Platform.OS==='web'){window.addEventListener('focus',foreground);window.addEventListener('pageshow',foreground);document.addEventListener('visibilitychange',foreground);}
  return()=>{subscription.remove();api.onChange=()=>{};if(Platform.OS==='web'){window.removeEventListener('focus',foreground);window.removeEventListener('pageshow',foreground);document.removeEventListener('visibilitychange',foreground);}};
 },[]);
 return <SessionContext.Provider value={{api,ready,notice,noticeTrace,setNotice}}>{children}</SessionContext.Provider>;
}
