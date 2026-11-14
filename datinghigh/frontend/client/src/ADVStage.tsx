import React,{useEffect,useRef,useState} from 'react';
import {Animated,ScrollView,Text,View} from 'react-native';
import {PrimaryButton,s} from './ui';
import type {StoryNode} from './story';
import type {StagePortrait} from './StoryPortrait';
import {StoryStage} from './StoryStage';
import type {ScenePresentation} from './story-stage-geometry';

/** 節點／敘事 renderer 與劇本分離；選項只在伺服器確認後推進。 */
export function ADVStage({node,storySessionId,interactionsEnabled=true,partner,disabled,choose,scene,onInspect,children,stageHeight}:{node:StoryNode;storySessionId?:string;interactionsEnabled?:boolean;partner?:StagePortrait;disabled:boolean;choose:(id:string)=>void;scene?:{presentation?:ScenePresentation;background?:string;foreground?:string};onInspect?:(id:string)=>void;children?:React.ReactNode;stageHeight?:number}){
 const [line,setLine]=useState(0),[letters,setLetters]=useState(0);const opacity=useRef(new Animated.Value(0)).current,narrative=useRef<React.ComponentRef<typeof ScrollView>|null>(null);
 useEffect(()=>{setLine(0);setLetters(0);narrative.current?.scrollTo({y:0,animated:false});opacity.setValue(0);const animation=Animated.timing(opacity,{toValue:1,duration:350,useNativeDriver:true});animation.start();return()=>animation.stop();},[storySessionId,node.id,opacity]);
 const current=node.lines[Math.min(line,node.lines.length-1)],text=[...(current?.text??'')];
 useEffect(()=>{setLetters(0);const timer=setInterval(()=>setLetters(n=>{if(n>=text.length){clearInterval(timer);return n;}return n+1;}),18);return()=>clearInterval(timer);},[storySessionId,node.id,line,current?.text]);
 const complete=letters>=text.length,last=line>=node.lines.length-1;
 return <View style={{gap:8,flex:1,minHeight:0}}>
  <Text style={[s.eyebrow,{letterSpacing:1}]}>{node.title}</Text>
  <Animated.View style={{opacity}}><StoryStage presentation={scene?.presentation} background={scene?.background} foreground={scene?.foreground} cameraId={node.presentation?.cameraId} hotspotIds={interactionsEnabled?(node.presentation?.hotspotIds??[]):[]} partner={partner} safeToSwap={complete} onInspect={id=>onInspect?.(id)} height={stageHeight}/></Animated.View>
  <ScrollView ref={narrative} testID="story-narrative" style={{flex:1,minHeight:0}} contentContainerStyle={{gap:10,paddingBottom:12}} keyboardShouldPersistTaps="handled">
  {partner&&<Text style={s.label}>{partner.name}</Text>}
  {node.ending&&<View style={{alignSelf:'center',flexDirection:'row',gap:node.visual==='two-pages'?20:0,alignItems:'center',padding:14,borderRadius:18,backgroundColor:'rgba(255,223,188,.16)'}}>
   {['#ffb6c9','#a8c8ef'].map((color,index)=><View key={color} style={{width:56,height:68,backgroundColor:'#f1dfc4',borderRadius:5,borderLeftWidth:4,borderColor:'#b99f83',transform:[{rotate:`${node.visual==='two-pages'?(index===0?-8:8):0}deg`}],marginLeft:node.visual==='together'&&index===1?-36:0}}><View style={{width:10,height:42,backgroundColor:color,marginLeft:22,borderBottomLeftRadius:5,borderBottomRightRadius:5}}/></View>)}
  </View>}
  <View style={{padding:18,borderRadius:18,gap:12,minHeight:150,backgroundColor:node.visual==='note'?'rgba(73,49,49,.96)':'rgba(32,15,44,.93)',borderWidth:1,borderColor:'rgba(255,218,235,.4)'}}>
   <Text style={s.label}>{current?.speaker??'旁白'}</Text><Text style={[s.body,{fontSize:16,lineHeight:27,minHeight:56}]}>{text.slice(0,letters).join('')}</Text>
   <View style={{flexDirection:'row',gap:8,justifyContent:'flex-end'}}>
    {!complete&&<PrimaryButton label="顯示完整句" compact secondary onPress={()=>setLetters(text.length)}/>}
    {complete&&!last&&<PrimaryButton label="下一句" compact onPress={()=>setLine(n=>n+1)}/>}
    {!last&&<PrimaryButton label="略過本段演出" compact secondary onPress={()=>{setLine(node.lines.length-1);setLetters(10000);}}/>}
   </View>
   {complete&&last&&node.choices.map(choice=><PrimaryButton key={choice.id} label={choice.label} disabled={disabled} onPress={()=>choose(choice.id)}/>)}
   {node.ending&&complete&&last&&<Text style={s.subtleText}>本章已完成，仍可繼續自由聊天。</Text>}
  </View>
  {children}
  </ScrollView>
 </View>;
}
