import React,{useEffect,useRef,useState} from 'react';
import {Animated,Pressable,ScrollView,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {PrimaryButton,StoryChoiceButton,colors,s} from './ui';
import type {StoryNode} from './story';
import type {StagePortrait} from './StoryPortrait';
import {StoryStage} from './StoryStage';
import type {ScenePresentation} from './story-stage-geometry';

/** 節點／敘事 renderer 與劇本分離；選項只在伺服器確認後推進。 */
export function ADVStage({node,storySessionId,interactionsEnabled=true,partner,disabled,choose,scene,onInspect,children,stageHeight,narrativeStyle,narrativeContentStyle}:{node:StoryNode;storySessionId?:string;interactionsEnabled?:boolean;partner?:StagePortrait;disabled:boolean;choose:(id:string)=>void;scene?:{presentation?:ScenePresentation;background?:string;foreground?:string};onInspect?:(id:string)=>void;children?:React.ReactNode;stageHeight?:number;narrativeStyle?:StyleProp<ViewStyle>;narrativeContentStyle?:StyleProp<ViewStyle>}){
 const [line,setLine]=useState(0),[letters,setLetters]=useState(0);const opacity=useRef(new Animated.Value(0)).current,narrative=useRef<React.ComponentRef<typeof ScrollView>|null>(null),skipping=useRef(false);
 useEffect(()=>{skipping.current=false;setLine(0);setLetters(0);narrative.current?.scrollTo({y:0,animated:false});opacity.setValue(0);const animation=Animated.timing(opacity,{toValue:1,duration:350,useNativeDriver:true});animation.start();return()=>animation.stop();},[storySessionId,node.id,opacity]);
 const current=node.lines[Math.min(line,node.lines.length-1)],text=[...(current?.text??'')];
 useEffect(()=>{if(skipping.current){skipping.current=false;setLetters(text.length);return;}setLetters(0);const timer=setInterval(()=>setLetters(n=>{if(n>=text.length){clearInterval(timer);return n;}return n+1;}),18);return()=>clearInterval(timer);},[storySessionId,node.id,line,current?.text]);
 const complete=letters>=text.length,last=line>=node.lines.length-1;
 const speaker=current?.speaker??'旁白',isNarrator=speaker==='旁白';
 const isCompactStage=stageHeight!=null&&stageHeight<340;
 const advanceDialog=()=>{if(!complete){setLetters(text.length);return;}if(!last)setLine(n=>n+1);};
 return <View style={{flex:1,minHeight:0,width:'100%',position:'relative',overflow:'hidden'}}>
  <Animated.View style={isCompactStage?{opacity,position:'relative',width:'100%'}:{opacity,position:'absolute',left:0,right:0,top:0,bottom:0}}>
   <StoryStage presentation={scene?.presentation} background={scene?.background} foreground={scene?.foreground} cameraId={node.presentation?.cameraId} hotspotIds={interactionsEnabled?(node.presentation?.hotspotIds??[]):[]} partner={partner} safeToSwap={complete} onInspect={id=>onInspect?.(id)} height={stageHeight}/>
  </Animated.View>
  <ScrollView ref={narrative} testID="story-narrative" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={[isCompactStage?{flex:1,minHeight:0,width:'100%',backgroundColor:'rgba(16,7,26,.92)'}:{position:'absolute',left:0,right:0,bottom:0,maxHeight:'50%',zIndex:6,width:'100%',backgroundColor:'transparent'},narrativeStyle]} contentContainerStyle={[{flexGrow:1,justifyContent:'flex-end',width:'100%',maxWidth:980,alignSelf:'center',gap:8,paddingHorizontal:14,paddingTop:16,paddingBottom:10},narrativeContentStyle]} keyboardShouldPersistTaps="handled">
  {node.ending&&<View style={{alignSelf:'center',flexDirection:'row',gap:node.visual==='two-pages'?16:0,alignItems:'center',paddingHorizontal:12,paddingVertical:6,borderRadius:16,backgroundColor:'rgba(24,10,36,.76)',borderWidth:1,borderColor:'rgba(255,210,122,.42)'}}>
   {['#ffb6c9','#a8c8ef'].map((color,index)=><View key={color} style={{width:36,height:44,backgroundColor:'#f1dfc4',borderRadius:5,borderLeftWidth:4,borderColor:'#b99f83',transform:[{rotate:`${node.visual==='two-pages'?(index===0?-8:8):0}deg`}],marginLeft:node.visual==='together'&&index===1?-22:0}}><View style={{width:7,height:24,backgroundColor:color,marginLeft:14,borderBottomLeftRadius:4,borderBottomRightRadius:4}}/></View>)}
  </View>}
  {complete&&last&&node.choices.length>0&&<View style={{gap:6}}>
   {node.choices.map(choice=><StoryChoiceButton key={choice.id} label={choice.label} disabled={disabled} onPress={()=>choose(choice.id)}/>)}
  </View>}
  <View style={{position:'relative',paddingHorizontal:18,paddingTop:18,paddingBottom:10,borderRadius:20,gap:6,minHeight:82,backgroundColor:node.visual==='note'?'rgba(62,38,42,.84)':'rgba(24,10,38,.78)',borderWidth:1,borderColor:'rgba(255,218,235,.32)',boxShadow:'0 12px 36px rgba(0,0,0,.52)'}}>
   <View style={{position:'absolute',left:16,right:16,top:-13,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:8}}>
    <View style={{paddingHorizontal:14,paddingVertical:3,borderRadius:999,backgroundColor:isNarrator?'rgba(52,22,68,.96)':colors.rose,borderWidth:1,borderColor:isNarrator?'rgba(255,210,122,.58)':'#ffd9e6',boxShadow:'0 4px 12px rgba(0,0,0,.35)'}}>
     <Text style={{fontSize:12,fontWeight:'800',letterSpacing:.6,color:isNarrator?colors.gold:colors.ink}}>{speaker}</Text>
    </View>
    <View style={{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:10,paddingVertical:3,borderRadius:999,backgroundColor:'rgba(20,8,32,.88)',borderWidth:1,borderColor:'rgba(255,210,122,.34)'}}>
     <Text style={{fontSize:11,fontWeight:'700',color:colors.gold}}>{node.title}</Text>
     {partner&&<><Text style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>·</Text><Text style={{fontSize:11,fontWeight:'700',color:'#ffd6e6'}}>{partner.name}</Text></>}
    </View>
   </View>
   <Pressable accessibilityRole="button" accessibilityLabel="對話框，點擊繼續" onPress={advanceDialog} style={({pressed})=>({minHeight:26,justifyContent:'center',opacity:pressed?.88:1})}>
    <Text style={[s.body,{fontSize:15,lineHeight:23,color:'#fff7fa',fontWeight:'500'}]}>{text.slice(0,letters).join('')}</Text>
   </Pressable>
   <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
    <Pressable onPress={advanceDialog} style={({pressed})=>({flex:1,flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:26,gap:8,opacity:pressed?.88:1})}>
     <View style={{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'}}>
      <Text style={{fontSize:11,color:'rgba(255,255,255,.48)'}}>{node.lines.length>1?`${Math.min(line+1,node.lines.length)} / ${node.lines.length}`:''}</Text>
      {node.ending&&complete&&last&&<Text style={[s.subtleText,{fontSize:11}]}>本章已完成，仍可繼續自由聊天。</Text>}
     </View>
     <Text style={{fontSize:13,fontWeight:'800',color:complete?colors.gold:colors.rose}}>{!complete?'▍':!last?'▼':'✦'}</Text>
    </Pressable>
    {(!last||!complete)&&<PrimaryButton label="略過" compact secondary onPress={()=>{skipping.current=true;setLine(node.lines.length-1);setLetters(10000);}}/>}
   </View>
  </View>
  {children}
  </ScrollView>
 </View>;
}
