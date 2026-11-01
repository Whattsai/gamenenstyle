import React,{useEffect,useRef,useState} from 'react';
import {Text,View,Pressable,Platform} from 'react-native';
import {GoogleOneTapSignIn,GoogleSignInButton} from 'react-native-nitro-google-signin';
import {OperationGate} from './forms';
export interface GoogleButtonProps {disabled:boolean;sessionId?:string;onCredential:(credential:string)=>Promise<void>;onNotice:(code:string)=>void;onBusy:(busy:boolean)=>void}
export default function GoogleButton(props:GoogleButtonProps){
 const [gate]=useState(()=>new OperationGate());
 const [sdkPending,setSdkPending]=useState(false);const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);gate.cancel();},[gate]);
 const latest=useRef(props);latest.current=props;
 const previousSession=useRef(props.sessionId);
 useEffect(()=>{
  if(previousSession.current!==props.sessionId&&gate.pending&&!gate.http&&gate.cancel()){
   if(timer.current)clearTimeout(timer.current);setSdkPending(false);latest.current.onBusy(false);latest.current.onNotice('GOOGLE_SESSION_CHANGED');
  }
  previousSession.current=props.sessionId;
 },[props.sessionId,gate]);
 const client=process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
 if(!client||Platform.OS==='ios'&&!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)return <Text style={{color:'#dfcddd',textAlign:'center'}}>Google 登入暫時無法使用，請稍後再試</Text>;
 async function start(){
  if(gate.pending||props.disabled)return;
  const sequence=gate.begin(props.sessionId);props.onBusy(true);setSdkPending(true);
  timer.current=setTimeout(cancel,45000);
  try{
   GoogleOneTapSignIn.configure({webClientId:client!,iosClientId:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,offlineAccess:false,autoSelectOnSignIn:false});
   const response=await GoogleOneTapSignIn.presentExplicitSignIn();
   if(!gate.current(sequence,latest.current.sessionId))return;
   if(response.type!=='success'||!response.data){props.onNotice('GOOGLE_CANCELLED');return;}
   if(timer.current)clearTimeout(timer.current);setSdkPending(false);gate.http=true;await props.onCredential(response.data.idToken);
  }catch{if(gate.current(sequence,latest.current.sessionId))props.onNotice('EXTERNAL_CREDENTIAL_INVALID');}
  finally{if(gate.finish(sequence)){if(timer.current)clearTimeout(timer.current);setSdkPending(false);props.onBusy(false);}}
 }
 function cancel(){if(gate.cancel()){if(timer.current)clearTimeout(timer.current);setSdkPending(false);latest.current.onBusy(false);latest.current.onNotice('GOOGLE_CANCELLED');}}
 return <View style={{alignItems:'center',gap:12}}><GoogleSignInButton signInBehavior="none" onPress={start} disabled={props.disabled} colorScheme="light" size="wide"/>{sdkPending&&<Pressable accessibilityRole="button" onPress={cancel}><Text style={{color:'#ffd27a'}}>取消 Google 登入</Text></Pressable>}</View>;
}
