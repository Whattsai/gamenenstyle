import {listenSceneBrowserLifecycle} from './scene-browser-lifecycle';
import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Animated,AppState,Image,Platform,Pressable,Text,View,useWindowDimensions} from 'react-native';
import {StoryPortrait,type StagePortrait} from './StoryPortrait';
import {SceneWorldObjects} from './SceneWorldObjects';
import {SceneStoryMotion} from './SceneStoryMotion';
import type {ActorRole,PresentationStep,TrackSnapshot} from './scene-event-track';
export type TrackStagePresentation={actorRole:ActorRole;areaId:string;world:TrackSnapshot['world'];own?:StagePortrait;steps?:PresentationStep[];onDrop:(objectId:string)=>void;selectedObject?:string|null;disabled?:boolean;showSlot?:boolean};

import {cameraFrame,portraitFrame,hotspotFrame,type ScenePresentation} from './story-stage-geometry';

const fallback={id:'wide',scale:1,focus:{x:.5,y:.5},portrait:{x:.5,headY:.08,height:.9},foreground:false,tint:'#7488b0',tintOpacity:.08};
const primaryRain=[.08,.19,.31,.44,.57,.71,.83,.93];
const secondaryRain=[.14,.26,.39,.52,.65,.78,.89];
/** 固定第一人稱：底圖／雨光／對方／前景／熱區，HUD 在舞台之外保留安全高度。 */
export function StoryStage({presentation,cameraId,hotspotIds,background,foreground,partner,safeToSwap,onInspect,height,track,storySessionId}:{presentation?:ScenePresentation;cameraId?:string;hotspotIds:string[];background?:string;foreground?:string;partner?:StagePortrait;safeToSwap:boolean;onInspect:(id:string)=>void;height?:number;track?:TrackStagePresentation;storySessionId?:string}){
 const viewport=useWindowDimensions(),winW=viewport.width||960,winH=viewport.height||768;
 const resolvedHeight=height??Math.max(160,Math.min(winH*.62,680)),isFullScreen=resolvedHeight>=winH*.85;
 const stageMaxWidth=Math.round(resolvedHeight*16/9);
 const targetWidth=Math.max(320,Math.min(winW,stageMaxWidth)),targetHeight=resolvedHeight;
 const [size,setSize]=useState(()=>({width:targetWidth,height:targetHeight}));
 useEffect(()=>{setSize({width:targetWidth,height:targetHeight});},[targetWidth,targetHeight]);
 const [motion,setMotion]=useState(true),[pan,setPan]=useState(0),dragStart=useRef<{x:number;pan:number}|null>(null);
 useEffect(()=>{setPan(0);},[cameraId,storySessionId]);
 const [eventCamera,setEventCamera]=useState<string>(),[eventExpressions,setEventExpressions]=useState<Partial<Record<ActorRole,StagePortrait['expression']>>>({});
 const [movingObject,setMovingObject]=useState<string>();
 const rawCamera=presentation?.cameras.find(c=>c.id===(eventCamera??cameraId))??fallback,isLandscapeStage=size.width>=size.height*1.25;
 const scale=isLandscapeStage?1:1+(rawCamera.scale-1)*.15,focusY=isLandscapeStage?.5:.5+(rawCamera.focus.y-.5)*.2;
 const minHeadY=isFullScreen?(isLandscapeStage?.09:.15):.09;
 const portrait={x:rawCamera.portrait.x,headY:Math.max(minHeadY,rawCamera.portrait.headY),height:rawCamera.portrait.height>1?1+(rawCamera.portrait.height-1)*.32:Math.min(isFullScreen?.82:.9,rawCamera.portrait.height)};
 const baseFrame=cameraFrame(size.width,size.height,{scale,focus:{x:rawCamera.focus.x,y:focusY}});
 const camera={...rawCamera,scale,focus:{x:Math.max(0,Math.min(1,rawCamera.focus.x+pan)),y:focusY},portrait};
 const frame=cameraFrame(size.width,size.height,camera),canPan=frame.width>size.width+48,panOffsetX=frame.left-baseFrame.left;
 const anchors=partner?.anchors??{head:{x:.5,y:.08},feet:{x:.5,y:.96}},basePerson=portraitFrame(size.width,size.height,camera.portrait,anchors),person={...basePerson,left:basePerson.left+panOffsetX};
 const glow=useRef(new Animated.Value(.25)).current,rain=useRef(new Animated.Value(0)).current;
 useEffect(()=>{
  if(!motion)return;
  const shimmer=Animated.loop(Animated.sequence([Animated.timing(glow,{toValue:.55,duration:4200,useNativeDriver:true}),Animated.timing(glow,{toValue:.25,duration:5100,useNativeDriver:true})]));
  const falling=Animated.loop(Animated.timing(rain,{toValue:1,duration:2800,useNativeDriver:Platform.OS!=='web'}));
  const start=()=>{shimmer.reset();falling.reset();shimmer.start();falling.start();},stop=()=>{shimmer.stop();falling.stop();};
  if(AppState.currentState==null||AppState.currentState==='active')start();const subscription=AppState.addEventListener('change',state=>{if(state==='active')start();else stop();});
  const visible=()=>{if(document.visibilityState==='hidden')stop();else start();};if(Platform.OS==='web'&&typeof document!=='undefined')document.addEventListener('visibilitychange',visible);const stopBrowser=listenSceneBrowserLifecycle(stop,start);
  return()=>{stop();subscription.remove();if(Platform.OS==='web'&&typeof document!=='undefined')document.removeEventListener('visibilitychange',visible);stopBrowser();};
 },[glow,rain,motion]);
 const ownFrame=track?.own?portraitFrame(size.width,size.height,{...camera.portrait,x:track.actorRole==='inviter' ? .34 : .66},track.own.anchors??anchors):undefined;
 const rolesMotion=useRef({inviter:{x:new Animated.Value(.34),opacity:new Animated.Value(1)},acceptor:{x:new Animated.Value(.66),opacity:new Animated.Value(1)}}).current;
 const resetCharacters=()=>{for(const role of ['inviter','acceptor'] as const){rolesMotion[role].x.stopAnimation();rolesMotion[role].opacity.stopAnimation();rolesMotion[role].x.setValue(role==='inviter' ? .34 : .66);rolesMotion[role].opacity.setValue(1);}};
 useLayoutEffect(()=>{setEventCamera(undefined);setEventExpressions({});setMovingObject(undefined);resetCharacters();},[cameraId,storySessionId,track?.actorRole,track?.steps]);
 const characterTransform=(role:ActorRole)=>({opacity:rolesMotion[role].opacity,transform:[{translateX:rolesMotion[role].x.interpolate({inputRange:[0,1],outputRange:[-(role==='inviter' ? .34 : .66)*size.width,(1-(role==='inviter' ? .34 : .66))*size.width]})}]});
 const sharedPartner=track?.own?{...person,left:size.width*(track.actorRole==='inviter' ? .66 : .34)-person.width*.5+panOffsetX}:person;
 const partnerRole=track?.actorRole==='inviter'?'acceptor':'inviter';
 const controlsPosition=isFullScreen?{top:isLandscapeStage?58:112}:{bottom:10};
 return <View style={{width:'100%',height:resolvedHeight,backgroundColor:'#14081e',overflow:'hidden',position:'relative'}}>
  {background&&<Image source={{uri:background}} resizeMode="cover" blurRadius={14} style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',opacity:.45}}/>}
  <View testID={`scene-camera-${rawCamera.id}`} onLayout={e=>{const {width,height}=e.nativeEvent.layout;if(width>0&&height>0)setSize({width,height});}} onTouchStart={e=>{if(!canPan)return;dragStart.current={x:e.nativeEvent.pageX,pan};}} onTouchMove={e=>{if(!canPan||!dragStart.current)return;const delta=(dragStart.current.x-e.nativeEvent.pageX)/Math.max(180,frame.width-size.width);setPan(Math.max(-rawCamera.focus.x,Math.min(1-rawCamera.focus.x,dragStart.current.pan+delta)));}} onTouchEnd={()=>{dragStart.current=null;}} style={{width:'100%',maxWidth:stageMaxWidth,height:'100%',alignSelf:'center',overflow:'hidden',position:'relative',backgroundColor:'#291e31'}}>
   {background&&<Image source={{uri:background}} resizeMode="stretch" testID="scene-background" style={{position:'absolute',...frame}}/>}
   {motion&&<Animated.View pointerEvents="none" testID="scene-atmosphere" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',opacity:glow}}>
    <Animated.View pointerEvents="none" testID="scene-rain-displacement" style={{position:'absolute',left:0,right:0,top:-110,bottom:-110,transform:[{translateY:rain.interpolate({inputRange:[0,1],outputRange:[-70,130]})},{translateX:rain.interpolate({inputRange:[0,1],outputRange:[0,-16]})}]}}>{primaryRain.map((x,i)=><View key={`r1-${x}`} style={{position:'absolute',left:`${x*100}%`,top:`${4+(i%5)*11}%`,width:1.5,height:'34%',backgroundColor:'#c9d8f8',opacity:.24,transform:[{rotate:'12deg'}]}}/>)}
    {secondaryRain.map((x,i)=><View key={`r2-${x}`} style={{position:'absolute',left:`${x*100}%`,top:`${18+(i%4)*14}%`,width:1,height:'24%',backgroundColor:'#ffd27a',opacity:.14,transform:[{rotate:'12deg'}]}}/>)}
   </Animated.View></Animated.View>}
   {ownFrame&&track?.own?.source&&<Animated.View testID="scene-own-avatar" style={{position:'absolute',...ownFrame,...characterTransform(track.actorRole)}}><StoryPortrait portrait={{...track.own,expression:eventExpressions[track.actorRole]??track.own.expression}} safeToSwap={safeToSwap}/></Animated.View>}
   {partner?.source&&<Animated.View testID="scene-partner" style={{position:'absolute',...sharedPartner,...(track?characterTransform(partnerRole):{})}}><StoryPortrait portrait={track?{...partner,expression:eventExpressions[partnerRole]??partner.expression}:partner} safeToSwap={safeToSwap}/></Animated.View>}
   {!camera.foreground&&partner?.source&&<View pointerEvents="none" testID="scene-contact-shadow" style={{position:'absolute',left:size.width*camera.portrait.x-person.width*.15+panOffsetX,top:person.top+anchors.feet.y*person.height-3,width:person.width*.3,height:8,borderRadius:100,backgroundColor:'#251727',opacity:.35}}/>}
   {camera.foreground&&presentation&&<View pointerEvents="none" testID="scene-foreground" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%'}}>{foreground?<Image source={{uri:foreground}} resizeMode="stretch" testID="scene-foreground-art" style={{position:'absolute',...frame}}/>:presentation.foreground.map(f=><View key={f.id} style={{position:'absolute',left:`${f.x*100}%`,top:`${f.y*100}%`,width:`${f.width*100}%`,height:`${f.height*100}%`,backgroundColor:f.color,borderTopWidth:f.id==='table-top'?2:0,borderColor:'#a97c64'}}/>)}</View>}
   {track&&<SceneWorldObjects objects={track.world.objects.filter(o=>o.id!==movingObject)} areaId={track.areaId} actorRole={track.actorRole} frame={frame} disabled={track.disabled} selectedObject={track.selectedObject} showSlot={track.showSlot} onInspect={onInspect} onDrop={track.onDrop}/>}
   {track?.steps&&track.steps.length>0&&<SceneStoryMotion viewport={size} steps={track.steps} objects={track.world.objects} frame={frame} onStep={step=>{if(step.type==='character'){const motion=rolesMotion[step.role];Animated.parallel([Animated.timing(motion.x,{toValue:step.x,duration:step.durationMs,useNativeDriver:true}),Animated.timing(motion.opacity,{toValue:step.visible?1:0,duration:step.durationMs,useNativeDriver:true})]).start();}if(step.type==='camera')setEventCamera(step.cameraId);if(step.type==='expression')setEventExpressions(current=>({...current,[step.role]:step.expression}));if(step.type==='object')setMovingObject(step.objectId);}} onFinish={()=>{setMovingObject(undefined);setEventCamera(undefined);setEventExpressions({});resetCharacters();}}/>}
   <View pointerEvents="none" testID="scene-light" style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',backgroundColor:camera.tint,opacity:camera.tintOpacity}}/>
   <View pointerEvents="none" style={{position:'absolute',left:0,top:0,width:'100%',height:isFullScreen?68:38,backgroundColor:'rgba(14,6,22,.34)'}}/>
   <View pointerEvents="none" style={{position:'absolute',left:0,bottom:0,width:'100%',height:isFullScreen?150:44,backgroundColor:'rgba(14,6,22,.36)'}}/>
   {presentation?.hotspots.filter(h=>hotspotIds.includes(h.id)).map(h=>{const rawPos=hotspotFrame(size.width,size.height,frame,h),position=rawPos&&isFullScreen?{...rawPos,top:Math.min(rawPos.top,size.height-(isLandscapeStage?220:230))}:rawPos;return position&&<Pressable key={h.id} accessibilityRole="button" accessibilityLabel={`場景物件：${h.label}`} onPress={()=>onInspect(h.definitionId)} style={({pressed})=>({position:'absolute',...position,borderRadius:999,borderWidth:1.5,borderColor:'#ffd27a',backgroundColor:pressed?'rgba(255,122,162,.42)':'rgba(32,14,44,.86)',alignItems:'center',justifyContent:'center',boxShadow:'0 0 16px rgba(255,210,122,.45)'})}><Text style={{fontSize:20,color:'#ffe3b5',fontWeight:'800'}}>✧</Text></Pressable>;})}
   <Pressable accessibilityRole="button" accessibilityLabel={motion?'關閉場景微動':'開啟場景微動'} onPress={()=>setMotion(value=>!value)} style={{position:'absolute',left:12,...controlsPosition,paddingHorizontal:11,paddingVertical:5,borderRadius:999,borderWidth:1,borderColor:'rgba(255,218,235,.32)',backgroundColor:'rgba(20,8,32,.82)'}}><Text style={{color:'#ffe3ed',fontSize:11,fontWeight:'700'}}>{motion?'關閉場景微動':'開啟場景微動'}</Text></Pressable>
   {canPan&&<View style={{position:'absolute',right:10,...controlsPosition,flexDirection:'row',alignItems:'center',gap:2,paddingHorizontal:6,paddingVertical:3,borderRadius:999,borderWidth:1,borderColor:'rgba(255,210,122,.42)',backgroundColor:'rgba(20,8,32,.84)'}}>
    <Pressable accessibilityRole="button" accessibilityLabel="環視左側場景" onPress={()=>setPan(-rawCamera.focus.x)} style={{paddingHorizontal:6,paddingVertical:2,borderRadius:999,backgroundColor:camera.focus.x<.25?'rgba(255,122,162,.35)':'transparent'}}><Text style={{color:'#ffe3ed',fontSize:11,fontWeight:'700'}}>◀ 左景</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="重設場景視角" onPress={()=>setPan(0)} style={{paddingHorizontal:6,paddingVertical:2,borderRadius:999,backgroundColor:Math.abs(pan)<.08?'rgba(255,122,162,.35)':'transparent'}}><Text style={{color:'#ffd27a',fontSize:11,fontWeight:'700'}}>全景</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="環視右側場景" onPress={()=>setPan(1-rawCamera.focus.x)} style={{paddingHorizontal:6,paddingVertical:2,borderRadius:999,backgroundColor:camera.focus.x>.75?'rgba(255,122,162,.35)':'transparent'}}><Text style={{color:'#ffe3ed',fontSize:11,fontWeight:'700'}}>右景 ▶</Text></Pressable>
   </View>}
  </View>
 </View>;
}
