import type {StoryExperience} from './story';
export type ActorRole='inviter'|'acceptor';
export type PresentationStep={type:'shot';shotId:string;durationMs:number}|{type:'camera';cameraId:string;durationMs:number}|{type:'audio';cueId:string}|{type:'expression';role:ActorRole;expression:'neutral'|'smile'|'surprised'|'thoughtful'|'concerned'}|{type:'character';role:ActorRole;areaId:string;x:number;visible:boolean;durationMs:number}|{type:'object';objectId:string;fromAreaId:string;toAreaId:string;motion:'flip'|'slide'|'gust'|'place'|'highlight';durationMs:number}|{type:'pause';durationMs:number};
export type SceneEventAction={actionId:string;label:string;params:Record<string,string>;targetObjectId?:string;dropSlotId?:string};
export type AvailableSceneEvent={bindingId:string;moduleType:'move-area'|'inspect-object'|'manipulate-object'|'talk-to-npc'|'cooperative-action'|'cooperative-choice';main:boolean;trackScope:ActorRole|'shared';revision:number|null;needsSharedRevision:boolean;actions:SceneEventAction[];lines?:{speaker:string;text:string}[]};
export type SceneWorldObject={id:string;label:string;state:string;areaId:string;holderRole:ActorRole|null;rendererId?:'paper'|'bag'|'book'|'sleeve'|'tag'|'slot'|'window';assetId?:string;color?:string;previewPlacement?:{slotId:string;areaId:string;hint:string};x:number;y:number};
export type TrackExperienceFields={schemaVersion:'scene-event.v2';books?:import('./SceneBook').PublishedBook[];stage?:import('./scene-stage').SceneStageSnapshot;myTrack:{role:ActorRole;nodeId:string;areaId:string;revision:number};sharedRevision:number;areas:{id:string;title:string}[];world:{objects:SceneWorldObject[];flags:Record<string,string>};knownClues:{id:string;text:string}[];availableEvents:AvailableSceneEvent[];cooperation:{bindingId:string;mySubmitted:boolean;partnerHasSubmitted:boolean}[];partnerPresence:{inSameArea:boolean};presentationCue?:{eventSeq:number;steps:PresentationStep[]};endingPresentationSteps?:PresentationStep[]};
export type TrackSnapshot=StoryExperience&TrackExperienceFields;
export const isTrackExperience=(value:StoryExperience|null|undefined):value is TrackSnapshot=>value?.schemaVersion==='scene-event.v2'&&!!value.myTrack;
const canonical=(params:Record<string,string>)=>JSON.stringify(Object.entries(params).sort(([a],[b])=>a.localeCompare(b)));
/** 只使用已授權快照的動作；預覽、動畫與角色本地狀態都不能指定 Server 效果。 */
export function trackActionPayload(snapshot:Pick<TrackSnapshot,'phase'|'storySessionId'|'myTrack'|'sharedRevision'>,event:AvailableSceneEvent,action:SceneEventAction){
 if(snapshot.phase!=='playing'||!snapshot.storySessionId||!snapshot.myTrack||!Number.isSafeInteger(snapshot.myTrack.revision)||snapshot.myTrack.revision<1||!event.actions.some(a=>a.actionId===action.actionId&&canonical(a.params)===canonical(action.params)))throw new Error('INVALID_SCENE_ACTION');
 return {storySessionId:snapshot.storySessionId,bindingId:event.bindingId,actionId:action.actionId,params:{...action.params},expectedTrackRevision:snapshot.myTrack.revision,...(event.needsSharedRevision?{expectedSharedRevision:snapshot.sharedRevision}:{}),...(event.revision==null?{}:{expectedEventRevision:event.revision})};
}
/** 初次載入只建立游標；背景期間的 Cue 被視為已觀察，恢復不重播已提交的演出。 */
export class SceneCueFence{
 private session?:string;private sequence=0;private suspended=false;
 suspend(){this.suspended=true;}
 reset(){this.session=undefined;this.sequence=0;this.suspended=false;}
 accept(session:string,eventSeq:number,cue:{eventSeq:number;steps:PresentationStep[]}|undefined,focused:boolean):PresentationStep[]{
  if(this.session!==session||this.suspended){this.sequence=this.session===session?Math.max(this.sequence,eventSeq):eventSeq;this.session=session;this.suspended=false;return [];}
  const unseen=cue&&cue.eventSeq>this.sequence&&cue.eventSeq<=eventSeq;this.sequence=Math.max(this.sequence,eventSeq);
  return focused&&unseen?cue.steps:[];
 }
}
