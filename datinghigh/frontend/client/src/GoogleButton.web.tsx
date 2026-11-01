import React,{useEffect,useRef,useState} from 'react';
import {OperationGate} from './forms';
import type {GoogleButtonProps} from './GoogleButton';
declare global{interface Window{google?:{accounts:{id:{initialize:(options:any)=>void;renderButton:(element:HTMLElement,options:any)=>void}}}}}
let loader:Promise<void>|undefined,initializedApi:unknown,initializedClient:string|undefined;
// GIS 是頁面共用 client；state 只關聯本機按鈕操作，不存 proof、不建立 server challenge。
const callbacks=new Map<string,(credential:string)=>Promise<void>>();
function load(){return loader??=new Promise((resolve,reject)=>{
 if(window.google){resolve();return;}
 const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>resolve();script.onerror=reject;document.head.appendChild(script);
});}
function initialize(client:string){
 const sdk=window.google!.accounts.id;if(sdk===initializedApi&&client===initializedClient)return;
 sdk.initialize({client_id:client,ux_mode:'popup',auto_select:false,callback:({credential,state}:{credential:string;state?:string})=>{
  if(state)void callbacks.get(state)?.(credential);
 }});initializedApi=sdk;initializedClient=client;
}
export default function GoogleButton(props:GoogleButtonProps){
 const target=useRef<HTMLDivElement>(null),latest=useRef(props);latest.current=props;
 const redraw=useRef<()=>void>(()=>{}),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),priorSession=useRef(props.sessionId);
 const [gate]=useState(()=>new OperationGate()),[sdkPending,setSdkPending]=useState(false),[available,setAvailable]=useState(true);
 function cancel(code='GOOGLE_CANCELLED'){
  if(gate.cancel()){if(timer.current)clearTimeout(timer.current);setSdkPending(false);latest.current.onBusy(false);latest.current.onNotice(code);redraw.current();}
 }
 useEffect(()=>{
  const client=process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;if(!client){setAvailable(false);return;}
  let mounted=true,sequence=0,buttonState:string|undefined;
  load().then(()=>{
   if(!mounted||!target.current)return;initialize(client);
   function renderButton(){
    if(!mounted||!target.current)return;if(buttonState)callbacks.delete(buttonState);
    buttonState=crypto.randomUUID();
    callbacks.set(buttonState,async credential=>{
     if(!mounted||gate.http||!gate.current(sequence,latest.current.sessionId))return;
     const operation=sequence;if(timer.current)clearTimeout(timer.current);setSdkPending(false);gate.http=true;
     try{await latest.current.onCredential(credential);}catch{if(mounted)latest.current.onNotice('EXTERNAL_CREDENTIAL_INVALID');}
     finally{if(gate.finish(operation)&&mounted){latest.current.onBusy(false);renderButton();}}
    });
    target.current.replaceChildren();
    window.google!.accounts.id.renderButton(target.current,{type:'standard',theme:'outline',size:'large',text:'continue_with',locale:'zh_TW',width:280,state:buttonState,click_listener:()=>{
     if(latest.current.disabled||gate.pending)return;
     sequence=gate.begin(latest.current.sessionId);setSdkPending(true);latest.current.onBusy(true);timer.current=setTimeout(()=>cancel(),45000);
    }});
   }
   redraw.current=renderButton;renderButton();
  }).catch(()=>{if(mounted)setAvailable(false);});
  return()=>{mounted=false;if(timer.current)clearTimeout(timer.current);if(buttonState)callbacks.delete(buttonState);redraw.current=()=>{};gate.cancel();};
 },[gate]);
 useEffect(()=>{if(priorSession.current!==props.sessionId&&gate.pending&&!gate.http)cancel('GOOGLE_SESSION_CHANGED');priorSession.current=props.sessionId;},[props.sessionId,gate]);
 if(!available)return <p style={{color:'#dfcddd',textAlign:'center'}}>Google 登入暫時無法使用，請稍後再試</p>;
 return <div style={{display:'flex',alignItems:'center',flexDirection:'column',gap:12}}>
  <div ref={target} style={{pointerEvents:props.disabled?'none':'auto',opacity:props.disabled?.55:1}} aria-disabled={props.disabled}/>
  {sdkPending&&<button type="button" onClick={()=>cancel()}>取消 Google 登入</button>}
 </div>;
}
