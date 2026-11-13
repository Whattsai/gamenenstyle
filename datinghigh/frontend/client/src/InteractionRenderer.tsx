import React from 'react';
import {Text,View} from 'react-native';
import {PrimaryButton,s} from './ui';
import type {StoryDefinition} from './story';

/** 共用互動 renderer；定義與玩家本次執行狀態各自獨立。 */
export function InteractionRenderer({definition,myChoice,disabled,submit}:{definition:StoryDefinition;myChoice?:string|null;disabled:boolean;submit:(id:string)=>void}){
 return <View style={{gap:12,padding:16,borderRadius:18,backgroundColor:'rgba(47,24,60,.96)',borderWidth:1,borderColor:'rgba(255,210,122,.4)'}}>
  <Text style={[s.heading,{fontSize:19}]}>{definition.title}</Text><Text style={s.body}>{definition.prompt}</Text>
  {myChoice&&definition.moduleType==='cooperative-choice'&&<Text style={s.subtleText}>你的選擇：{definition.options.find(o=>o.id===myChoice)?.label}。等待另一方選擇；可以返回探索或聊天。</Text>}
  {definition.options.map(option=><PrimaryButton key={option.id} label={option.label} secondary active={myChoice===option.id} disabled={disabled||!!myChoice&&definition.moduleType==='cooperative-choice'} onPress={()=>submit(option.id)}/>)}
 </View>;
}
