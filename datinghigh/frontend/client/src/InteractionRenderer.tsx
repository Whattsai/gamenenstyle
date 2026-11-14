import React from 'react';
import {Text,View} from 'react-native';
import {PrimaryButton,s} from './ui';
import type {StoryDefinition} from './story';

export function InteractionSubmission({state}:{state?:'sending'|'committed'|'unknown'}){
 return state?<Text style={s.subtleText}>{({sending:'送出中，尚未確認。',committed:'已送出，正在同步。',unknown:'送出結果不明，請重新同步。'})[state]}</Text>:null;
}
/** 共用互動 renderer；定義與玩家本次執行狀態各自獨立。 */
export function InteractionRenderer({definition,myChoice,partnerHasSubmitted,submissionState,disabled,submit}:{definition:StoryDefinition;myChoice?:string|null;partnerHasSubmitted?:boolean;submissionState?:'sending'|'committed'|'unknown';disabled:boolean;submit:(id:string)=>void}){
 return <View style={{gap:12,padding:16,borderRadius:18,backgroundColor:'rgba(47,24,60,.96)',borderWidth:1,borderColor:'rgba(255,210,122,.4)'}}>
  <Text style={[s.heading,{fontSize:19}]}>{definition.title}</Text><Text style={s.body}>{definition.prompt}</Text>
  <InteractionSubmission state={submissionState}/>
  {partnerHasSubmitted&&!myChoice&&definition.moduleType==='cooperative-choice'&&<Text style={s.subtleText}>對方已提交，等待你的選擇。</Text>}
  {myChoice&&definition.moduleType==='cooperative-choice'&&<Text style={s.subtleText}>你的選擇：{definition.options.find(o=>o.id===myChoice)?.label}。等待另一方選擇；可以返回探索或聊天。</Text>}
  {definition.options.map(option=><PrimaryButton key={option.id} label={option.label} secondary active={myChoice===option.id} disabled={disabled||!!myChoice&&definition.moduleType==='cooperative-choice'} onPress={()=>submit(option.id)}/>)}
 </View>;
}
