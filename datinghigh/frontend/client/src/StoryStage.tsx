import React,{useEffect,useRef,useState} from 'react';
import {Animated,AppState,Image,Pressable,Text,View,useWindowDimensions} from 'react-native';
import {StoryPortrait,type StagePortrait} from './StoryPortrait';
import {cameraFrame,portraitFrame,hotspotFrame,type ScenePresentation} from './story-stage-geometry';

const fallback={id:'wide',scale:1,focus:{x:.5,y:.5},portrait:{x:.5,headY:.08,height:.9},foreground:false,tint:'#7488b0',tintOpacity:.08};
/** 固定第一人稱：底圖／雨光／對方／前景／熱區，HUD 在舞台之外保留安全高度。 */
export function StoryStage({presentation,cameraId,hotspotIds,background,foreground,partner,safeToSwap,onInspect,height}:{presentation?:ScenePresentation;cameraId?:string;hotspotIds:string[];background?:string;foreground?:string;partner?:StagePortrait;safeToSwap:boolean;onInspect:(id:string)=>void;height?:number}){
 const window=useWindowDimensions(),[size,setSize]=useState({width:960,height:420});
 const [motion,setMotion]=useState(true);
 const camera=presentation?.cameras.find(c=>c.id===cameraId)??fallback,frame=cameraFrame(size.width,size.height,camera);
 const anchors=partner?.anchors??{head:{x:.5,y:.08},feet:{x:.5,y:.96}},person=portraitFrame(size.width,size.height,camera.portrait,anchors);
 const glow=useRef(new Animated.Value(.25)).current;
 useEffect(()=>{
  if(!motion)return;
  const animation=Animated.loop(Animated.sequence([Animated.timing(glow,{toValue:.55,duration:4200,useNativeDriver:true}),Animated.timing(glow,{toValue:.25,duration:5100,useNativeDriver:true})]));
  if(AppState.currentState==null||AppState.currentState==='active')animation.start();const subscription=AppState.addEventListener('change',state=>{if(state==='active')animation.start();else animation.stop();});
  return()=>{animation.stop();subscription.remove();};
 },[glow,motion]);
 return <View testID={`scene-camera-${camera.id}`} onLayout={e=>{const {width,height}=e.nativeEvent.layout;if(width>0&&height>0)setSize({width,height});}} style={{width:'100%',height:height??Math.max(160,Math.min(window.height*.43,480)),overflow:'hidden',backgroundColor:'#291e31'}}>
  {background&&<Image source={{uri:background}} resizeMode="stretch" testID="scene-background" style={{position:'absolute',...frame}}/>}
  {motion&&<Animated.View pointerEvents="none" testID="scene-atmosphere" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',opacity:glow}}>
   {[.12,.29,.47,.68,.86].map((x,i)=><View key={x} style={{position:'absolute',left:`${x*100}%`,top:`${8+i*7}%`,width:1,height:'32%',backgroundColor:'#b8c8ed',opacity:.2,transform:[{rotate:'12deg'}]}}/>)}
  </Animated.View>}
  {partner?.source&&<View testID="scene-partner" style={{position:'absolute',...person}}><StoryPortrait portrait={partner} safeToSwap={safeToSwap}/></View>}
  {!camera.foreground&&partner?.source&&<View pointerEvents="none" testID="scene-contact-shadow" style={{position:'absolute',left:size.width*camera.portrait.x-person.width*.15,top:person.top+anchors.feet.y*person.height-3,width:person.width*.3,height:8,borderRadius:100,backgroundColor:'#251727',opacity:.35}}/>}
  {camera.foreground&&presentation&&<View pointerEvents="none" testID="scene-foreground" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%'}}>{foreground?<Image source={{uri:foreground}} resizeMode="stretch" testID="scene-foreground-art" style={{position:'absolute',...frame}}/>:presentation.foreground.map(f=><View key={f.id} style={{position:'absolute',left:`${f.x*100}%`,top:`${f.y*100}%`,width:`${f.width*100}%`,height:`${f.height*100}%`,backgroundColor:f.color,borderTopWidth:f.id==='table-top'?2:0,borderColor:'#a97c64'}}/>)}</View>}
  <View pointerEvents="none" testID="scene-light" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',backgroundColor:camera.tint,opacity:camera.tintOpacity}}/>
  {presentation?.hotspots.filter(h=>hotspotIds.includes(h.id)).map(h=>{const position=hotspotFrame(size.width,size.height,frame,h);return position&&<Pressable key={h.id} accessibilityRole="button" accessibilityLabel={`場景物件：${h.label}`} onPress={()=>onInspect(h.definitionId)} style={{position:'absolute',...position,borderRadius:22,borderWidth:1,borderColor:'#f7d6ae',backgroundColor:'rgba(43,25,40,.82)',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:20,color:'#ffe3b5'}}>✧</Text></Pressable>;})}
  <Pressable accessibilityRole="button" accessibilityLabel={motion?'關閉場景微動':'開啟場景微動'} onPress={()=>setMotion(value=>!value)} style={{position:'absolute',right:8,bottom:8,paddingHorizontal:10,paddingVertical:6,borderRadius:12,backgroundColor:'rgba(32,15,44,.85)'}}><Text style={{color:'#ffe3ed',fontSize:12}}>{motion?'關閉場景微動':'開啟場景微動'}</Text></Pressable>
 </View>;
}
