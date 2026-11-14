import type {StoryExperience} from './story';

/** 只合成已提交 active Event 的有限覆寫；主線節點與人物版本仍由原投影擁有。 */
export function eventPresentation(experience:StoryExperience,previewBindingId?:string){
 const base=experience.currentNode;
 if(experience.chapterStatus==='completed'||!base?.presentation)return{node:base,cue:undefined};
 const event=experience.events?.filter(e=>e.status==='active'&&(e.main||e.bindingId===previewBindingId)&&e.presentationEffects&&Number.isSafeInteger(e.eventSeq)&&e.eventSeq>0).sort((a,b)=>Number(!!b.main)-Number(!!a.main)||b.eventSeq-a.eventSeq)[0];
 if(!event)return{node:base,cue:undefined};
 const effect=event.presentationEffects!,presentation={...base.presentation,hotspotIds:[...base.presentation.hotspotIds]};
 if(experience.scenePresentation?.cameras.some(c=>c.id===effect.cameraId))presentation.cameraId=effect.cameraId!;
 if(effect.expressionId&&['neutral','smile','surprised','thoughtful','concerned'].includes(effect.expressionId))presentation.expression=effect.expressionId;
 for(const [id,visible]of Object.entries(effect.hotspotVisibility??{})){
  if(!experience.scenePresentation?.hotspots.some(h=>h.id===id))continue;
  presentation.hotspotIds=presentation.hotspotIds.filter(h=>h!==id);if(visible)presentation.hotspotIds.push(id);
 }
 const assetId=effect.audioCueId?(experience.audioCues as Record<string,string>|undefined)?.[effect.audioCueId]:undefined;
 return{node:{...base,presentation},cue:assetId?{key:`${experience.storySessionId}:event:${event.eventSeq}`,assetId}:undefined};
}
