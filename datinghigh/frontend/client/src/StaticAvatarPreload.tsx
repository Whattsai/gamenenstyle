import React,{useEffect,useRef} from 'react';
import {Image,View} from 'react-native';
import type {StaticAvatarProjection} from './static-avatar';
type Props={identity:string;package:StaticAvatarProjection;origin:string;headers?:Record<string,string>;onReady:(identity:string)=>void;onError:()=>void};
function PackageImages({identity,package:p,origin,headers,onReady,onError}:Props){
 const loaded=useRef(new Set<string>()),failed=useRef(false),complete=useRef(false),active=useRef(true);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 return <View pointerEvents="none" style={{position:'absolute',width:1,height:1,opacity:0,overflow:'hidden'}}>
  {p.assets.map(a=><Image key={a.id} testID={`static-preload-${identity}-${a.id}`} source={{uri:new URL(a.url,origin).toString(),...(headers?{headers}:{})}} style={{width:1,height:1}} onLoad={()=>{
   if(!active.current||failed.current||complete.current)return;loaded.current.add(a.id);
   if(loaded.current.size===p.assets.length){complete.current=true;onReady(identity);}
  }} onError={()=>{if(!active.current||failed.current)return;failed.current=true;onError();}}/>)}
 </View>;
}
/** 同版全部圖像解碼後才放行；失敗或已卸載的舊包不能解除新包的防線。 */
export function StaticAvatarPreload(props:Props){return <PackageImages key={props.identity} {...props}/>;}
