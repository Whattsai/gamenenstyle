import React from 'react';
import {ScrollView,Text,View} from 'react-native';
import {PrimaryButton,colors,s} from './ui';
import type {AvailableSceneEvent,SceneEventAction,TrackSnapshot} from './scene-event-track';

/** 舞台內的場內移動、本人任務與真人合作；全部操作來自本人快照，不提供另一人的選項。 */
export function SceneEventActions({experience,disabled,onSubmit,selectedObject,onPreviewDrop}:{experience:TrackSnapshot;disabled:boolean;onSubmit:(event:AvailableSceneEvent,action:SceneEventAction)=>void;selectedObject?:string|null;onPreviewDrop?:(id:string)=>void}){
 if(experience.phase==='completed')return <Text style={s.subtleText}>這一章已收尾，你們可以繼續聊天。</Text>;
 const location=experience.areas.find(a=>a.id===experience.myTrack.areaId)?.title??'場景';
 const target=(a:SceneEventAction)=>a.targetObjectId??a.params.objectId??a.params.npcId;
 const events=experience.availableEvents.filter(e=>e.moduleType!=='move-area'&&(e.main||(['cooperative-choice','cooperative-action'].includes(e.moduleType)&&e.actions.some(a=>!target(a)))||selectedObject&&e.actions.some(a=>target(a)===selectedObject)));
 return <View testID="scene-event-actions" style={{gap:8,padding:12,borderRadius:18,backgroundColor:'rgba(22,12,33,.92)',borderWidth:1,borderColor:'rgba(255,210,122,.3)'}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap'}}><Text style={[s.label,{fontSize:13,color:colors.gold}]}>{location}</Text><Text style={[s.subtleText,{fontSize:11}]}>每個動作都由你親自完成</Text></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:6}}>{experience.areas.filter(a=>a.id!==experience.myTrack.areaId).map(area=>{
   const e=experience.availableEvents.find(e=>e.moduleType==='move-area'&&e.actions.some(a=>a.params.areaId===area.id)),action=e?.actions.find(a=>a.params.areaId===area.id);
   return <PrimaryButton key={area.id} label={`前往${area.title}`} compact secondary disabled={disabled||!e||!action} onPress={()=>e&&action&&onSubmit(e,action)}/>;
  })}</ScrollView>
  {events.map(event=><View key={event.bindingId} style={{gap:6}}>
   {event.lines?.map((line,i)=><View key={i}><Text style={[s.label,{fontSize:11,color:colors.gold}]}>{line.speaker}</Text><Text style={[s.body,{fontSize:13,lineHeight:19}]}>{line.text}</Text></View>)}
   {event.moduleType==='talk-to-npc'&&!event.lines&&<Text style={[s.label,{fontSize:12,color:colors.gold}]}>店員・NPC</Text>}
   <View style={{flexDirection:'row',gap:6,flexWrap:'wrap'}}>{event.actions.filter(a=>!selectedObject||!target(a)||target(a)===selectedObject).map((action,i)=><PrimaryButton key={`${action.actionId}:${i}`} label={action.label} compact secondary={!event.main} disabled={disabled} onPress={()=>onSubmit(event,action)}/>)}</View>
  </View>)}
  {experience.world.objects.filter(o=>o.id===selectedObject&&o.previewPlacement?.areaId===experience.myTrack.areaId).map(o=><View key={o.id}><Text style={[s.subtleText,{fontSize:11}]}>候選物件預覽，尚未拿取或放入訂單。</Text><PrimaryButton label="試放候選物件" compact secondary disabled={disabled} onPress={()=>onPreviewDrop?.(o.id)}/></View>)}
  {experience.cooperation.map(c=><Text key={c.bindingId} style={[s.subtleText,{fontSize:12}]}>{c.mySubmitted?'你的操作已保存；雙人合作事項還沒全部完成。':c.partnerHasSubmitted?'對方的操作已保存，現在等你親自完成。':'兩位玩家需要各自完成合作操作。'}</Text>)}
  {!events.length&&<Text style={[s.body,{fontSize:12}]}>看看場景物件，或等另一份線索送來；你也可以打開聊天室。</Text>}
  {experience.knownClues.length>0&&<View style={{gap:3,paddingTop:4,borderTopWidth:1,borderColor:'rgba(255,255,255,.12)'}}><Text style={[s.label,{fontSize:11}]}>你已知的線索</Text>{experience.knownClues.map(clue=><Text key={clue.id} style={[s.body,{fontSize:12,lineHeight:17}]}>{clue.text}</Text>)}</View>}
 </View>;
}
