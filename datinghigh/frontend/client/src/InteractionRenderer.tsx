import React from 'react';
import {Text,View} from 'react-native';
import {StoryChoiceButton,colors,s} from './ui';
import type {StoryDefinition} from './story';

export function InteractionSubmission({state}:{state?:'sending'|'committed'|'unknown'}){
 return state?<View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:'rgba(255,210,122,.14)',borderWidth:1,borderColor:'rgba(255,210,122,.4)'}}><Text style={s.subtleText}>{({sending:'送出中，尚未確認。',committed:'已送出，正在同步。',unknown:'送出結果不明，請重新同步。'})[state]}</Text></View>:null;
}
/** 共用互動 renderer；定義與玩家本次執行狀態各自獨立。 */
export function InteractionRenderer({definition,myChoice,partnerHasSubmitted,submissionState,disabled,submit}:{definition:StoryDefinition;myChoice?:string|null;partnerHasSubmitted?:boolean;submissionState?:'sending'|'committed'|'unknown';disabled:boolean;submit:(id:string)=>void}){
 const isCoop=definition.moduleType==='cooperative-choice';
 return <View style={{gap:10,padding:16,borderRadius:18,backgroundColor:'rgba(28,12,42,.95)',borderWidth:1.5,borderColor:isCoop?'rgba(255,210,122,.52)':'rgba(255,122,162,.42)',boxShadow:'0 16px 36px rgba(0,0,0,.45)'}}>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}>
   <View style={{paddingHorizontal:10,paddingVertical:3,borderRadius:999,backgroundColor:isCoop?'rgba(255,210,122,.16)':'rgba(255,122,162,.16)',borderWidth:1,borderColor:isCoop?'rgba(255,210,122,.45)':'rgba(255,122,162,.45)'}}>
    <Text style={{fontSize:11,fontWeight:'800',color:isCoop?colors.gold:'#ffd9e6'}}>{isCoop?'✦ 雙人共鳴抉擇':'🔍 場景線索調查'}</Text>
   </View>
   <Text style={[s.heading,{fontSize:18,lineHeight:24,textAlign:'left',flex:1}]}>{definition.title}</Text>
  </View>
  <Text style={[s.body,{color:'#f5e8f5'}]}>{definition.prompt}</Text>
  <InteractionSubmission state={submissionState}/>
  {partnerHasSubmitted&&!myChoice&&isCoop&&<View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:'rgba(123,224,184,.12)',borderWidth:1,borderColor:'rgba(123,224,184,.42)'}}><Text style={s.subtleText}>對方已提交，等待你的選擇。</Text></View>}
  {myChoice&&isCoop&&<View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:'rgba(123,224,184,.12)',borderWidth:1,borderColor:'rgba(123,224,184,.42)'}}><Text style={s.subtleText}>你的選擇：{definition.options.find(o=>o.id===myChoice)?.label}。等待另一方選擇；可以返回探索或聊天。</Text></View>}
  <View style={{gap:8}}>
   {definition.options.map(option=><StoryChoiceButton key={option.id} label={option.label} accentColor={myChoice===option.id?colors.gold:isCoop?colors.gold:colors.rose} disabled={disabled||!!myChoice&&isCoop} onPress={()=>submit(option.id)}/>)}
  </View>
 </View>;
}
