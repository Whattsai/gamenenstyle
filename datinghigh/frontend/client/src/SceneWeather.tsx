import React from 'react';
import {Animated,View} from 'react-native';
import type {StageFrame} from './scene-stage';
/** 已發布的窗景／戶外區域才顯示雨層；強度只讀公開世界快照。 */
export function SceneWeather({intensity,frame,phase}:{intensity:'steady'|'heavy'|'easing'|'stopped';frame:StageFrame;phase:Animated.Value}){
 if(intensity==='stopped')return null;
 const count=intensity==='heavy'?16:intensity==='easing'?4:8;
 const opacity=intensity==='heavy'?.5:intensity==='easing'?.14:.28;
 return <View pointerEvents="none" testID={`scene-weather-${intensity}`} style={{position:'absolute',...frame,overflow:'hidden'}}>
  <Animated.View pointerEvents="none" style={{position:'absolute',left:0,right:0,top:-100,bottom:-100,transform:[{translateY:phase.interpolate({inputRange:[0,1],outputRange:[-70,130]})}]}}>
   {Array.from({length:count},(_,i)=><View testID="scene-weather-drop" key={i} style={{position:'absolute',left:`${(i+.5)*100/count}%`,top:`${4+(i%5)*11}%`,width:intensity==='heavy'?2:1,height:'34%',backgroundColor:'#c9d8f8',opacity,transform:[{rotate:'12deg'}]}}/>)}
  </Animated.View>
 </View>;
}
