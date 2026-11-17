import {listenSceneBrowserLifecycle} from './scene-browser-lifecycle';
import React,{useEffect,useRef,useState} from 'react';
import {Animated,AppState,Platform,Pressable,Text,View} from 'react-native';
import {ObjectArt} from './SceneWorldObjects';
import type {PresentationStep,SceneWorldObject} from './scene-event-track';

/** 已提交 Cue 的有限本地演出；略過與失焦都只停止呈現，不送任何故事完成命令。 */
export function SceneStoryMotion({steps,objects,frame,viewport,onStep,onFinish}:{steps:PresentationStep[];objects:SceneWorldObject[];frame:{left:number;top:number;width:number;height:number};viewport?:{width:number;height:number};onStep:(step:PresentationStep)=>void;onFinish:()=>void}){
 const [current,setCurrent]=useState<PresentationStep>(),[playing,setPlaying]=useState(false),progress=useRef(new Animated.Value(0)).current;
 const callbacks=useRef({onStep,onFinish});callbacks.current={onStep,onFinish};const cancel=useRef<()=>void>(()=>{});
 useEffect(()=>{
  let stopped=false,index=0,timer:ReturnType<typeof setTimeout>|undefined,animation:Animated.CompositeAnimation|undefined;
  const finish=()=>{if(stopped)return;stopped=true;clearTimeout(timer);animation?.stop();setCurrent(undefined);setPlaying(false);callbacks.current.onFinish();};cancel.current=finish;
  const next=()=>{if(stopped)return;if(index>=steps.length){finish();return;}const step=steps[index++];setCurrent(step);setPlaying(true);callbacks.current.onStep(step);progress.setValue(0);
   const duration='durationMs'in step?step.durationMs:0;
   if(step.type==='object'){animation=Animated.timing(progress,{toValue:1,duration:Math.max(1,duration),useNativeDriver:true});animation.start(({finished})=>{if(finished)next();});}
   else timer=setTimeout(next,duration);
  };
  next();const app=AppState.addEventListener('change',state=>{if(state!=='active')finish();});
  const visibility=()=>{if(typeof document!=='undefined'&&document.visibilityState==='hidden')finish();};const blur=()=>finish();
  if(Platform.OS==='web'&&typeof document!=='undefined')document.addEventListener('visibilitychange',visibility);const stopBrowser=listenSceneBrowserLifecycle(blur);
  return()=>{stopped=true;clearTimeout(timer);animation?.stop();app.remove();if(Platform.OS==='web'&&typeof document!=='undefined')document.removeEventListener('visibilitychange',visibility);stopBrowser();};
 },[steps,progress]);
 if(!playing)return null;const object=current?.type==='object'?objects.find(o=>o.id===current.objectId):undefined;
 const motion=current?.type==='object'?current.motion:undefined;
 const rawLeft=object?frame.left+frame.width*object.x-30:0,rawTop=object?frame.top+frame.height*object.y-35:0;
 // A finite local close-up stays visible even when the authoritative object is outside a narrow camera crop.
 const minX=viewport?Math.min(96,Math.max(0,viewport.width/2-33)):0,minY=viewport?Math.min(200,viewport.height*.3):0;
 const left=viewport?Math.max(minX,Math.min(Math.max(minX,viewport.width-176),rawLeft)):rawLeft,top=viewport?Math.max(minY,Math.min(Math.max(minY,viewport.height*.5-80),rawTop)):rawTop;
 return <View pointerEvents="box-none" testID="scene-story-motion" style={{position:'absolute',left:0,right:0,top:0,bottom:0,zIndex:14}}>
  {object&&<Animated.View pointerEvents="none" style={{position:'absolute',left,top,transform:motion==='flip'?[{perspective:500},{rotateY:progress.interpolate({inputRange:[0,1],outputRange:['0deg','180deg']})}]:[{translateX:progress.interpolate({inputRange:[0,1],outputRange:motion==='gust'?[-90,110]:[-35,0]})},{translateY:progress.interpolate({inputRange:[0,.5,1],outputRange:motion==='gust'?[0,-90,-45]:[-20,-30,0]})},{rotate:progress.interpolate({inputRange:[0,1],outputRange:motion==='gust'?['-20deg','35deg']:['-8deg','0deg']})}]}}><ObjectArt object={object}/></Animated.View>}
  <Pressable accessibilityRole="button" accessibilityLabel="略過演出" onPress={()=>cancel.current()} style={{position:'absolute',right:14,top:100,padding:9,borderRadius:16,backgroundColor:'rgba(20,8,32,.85)'}}><Text style={{fontSize:11,color:'#ffe0b5'}}>略過演出</Text></Pressable>
 </View>;
}
