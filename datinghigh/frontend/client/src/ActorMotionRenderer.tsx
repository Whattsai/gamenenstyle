import React,{useEffect,useRef,useState} from 'react';
import {Animated,AppState,Image,Platform,Text,View} from 'react-native';
import {listenSceneBrowserLifecycle} from './scene-browser-lifecycle';

import {canRenderActorRig,type ActorRigView} from './actor-rig-policy';
export {canRenderActorRig} from './actor-rig-policy';
export type {ActorRigView} from './actor-rig-policy';

/** 同一個 atlas 的有限圖層，變換只影響呈現；這個模組沒有 API 或生圖入口。 */
export function ActorMotionRenderer({rig,pose,expression,gesture,width,height,prop,ambientMotion=true,onAssetLoad,onAssetError}:{rig:ActorRigView;pose:ActorRigView['poses'][number]['id'];expression:ActorRigView['expressions'][number]['id'];gesture:'idle'|'blink'|'tear'|'turn'|'hold'|'smile';width:number;height:number;prop?:{anchorId:string;source:string};ambientMotion?:boolean;onAssetLoad?:(identityVersion:string,layerId:string)=>void;onAssetError?:(identityVersion:string,layerId:string)=>void}){
 const breath=useRef(new Animated.Value(0)).current;
 const [active,setActive]=useState(AppState.currentState==null||AppState.currentState==='active');
 useEffect(()=>{const subscription=AppState.addEventListener('change',state=>setActive(state==='active'));const unlisten=listenSceneBrowserLifecycle(()=>setActive(false),()=>setActive(true));return()=>{subscription.remove();unlisten();};},[]);
 useEffect(()=>{if(!active||!ambientMotion)return;const loop=Animated.loop(Animated.sequence([Animated.timing(breath,{toValue:1,duration:2200,useNativeDriver:Platform.OS!=='web'}),Animated.timing(breath,{toValue:0,duration:2500,useNativeDriver:Platform.OS!=='web'})]));loop.start();return()=>{loop.stop();breath.setValue(0);};},[active,ambientMotion,breath,rig.identityVersion]);
 const p=rig.poses.find(p=>p.id===pose),e=rig.expressions.find(e=>e.id===expression),anchor=prop&&rig.propAnchors.find(a=>a.id===prop.anchorId);
 const layers=rig.layers.map(layer=>({...layer,...p?.overrides.find(o=>o.layerId===layer.id),...e?.overrides.find(o=>o.layerId===layer.id)}));
 const invalid=!canRenderActorRig(rig,pose,expression,prop?.anchorId);
 if(invalid)return <Text>角色動作素材尚未就緒</Text>;
 return <View testID={`actor-identity-${rig.identityVersion}`} style={{width,height,position:'relative'}}>
  {[...layers].sort((a,b)=>a.depth-b.depth).filter(l=>l.visible!==false).map(layer=>{
   const asset=rig.assets.find(a=>a.id===layer.assetId)!,r=layer.region,w=layer.size.width*width,h=layer.size.height*height,joint=rig.joints.find(j=>j.id===layer.jointId)!;
   return <Animated.View key={layer.id} testID={`actor-layer-${layer.id}`} pointerEvents="none" style={{position:'absolute',left:layer.position.x*width,top:layer.position.y*height,width:w,height:h,overflow:'hidden',transformOrigin:[(joint.position.x-layer.position.x)*width,(joint.position.y-layer.position.y)*height,0],transform:[{rotate:`${layer.rotation??(gesture==='turn'&&layer.jointId==='head'?5:0)}deg`},{translateY:breath.interpolate({inputRange:[0,1],outputRange:[0,-height*.002]})}]}}>
    <Image key={`${rig.identityVersion}:${asset.url}`} source={{uri:asset.url,...(asset.headers?{headers:asset.headers}:{})}} onLoad={()=>onAssetLoad?.(rig.identityVersion,layer.id)} onError={()=>onAssetError?.(rig.identityVersion,layer.id)} resizeMode="stretch" style={{position:'absolute',left:-r.x*w/r.width,top:-r.y*h/r.height,width:asset.width*w/r.width,height:asset.height*h/r.height}}/>
   </Animated.View>;
  })}
  {prop&&anchor&&<Image testID={`actor-prop-${anchor.id}`} source={{uri:prop.source}} onLoad={()=>onAssetLoad?.(rig.identityVersion,`prop-${anchor.id}`)} onError={()=>onAssetError?.(rig.identityVersion,`prop-${anchor.id}`)} resizeMode="contain" style={{position:'absolute',left:anchor.position.x*width,top:anchor.position.y*height,width:width*.18,height:height*.16}}/>}
 </View>;
}
