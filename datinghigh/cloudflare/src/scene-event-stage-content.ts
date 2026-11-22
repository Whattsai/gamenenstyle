import {z} from 'zod';
import type {TrackContent} from './scene-event-track-content';

const id=z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const unit=z.number().min(0).max(1);
const point=z.strictObject({x:unit,y:unit});
const size=z.strictObject({width:z.number().positive().max(1),height:z.number().positive().max(1)});
const expression=z.enum(['neutral','smile','surprised','thoughtful','concerned']);
export const actorPose=z.enum(['stand','sit','read','hold']);
export const actorCue=z.strictObject({actorId:id,pose:actorPose,expression,gesture:z.enum(['idle','blink','tear','turn','hold','smile']),position:point,height:z.number().positive().max(2),depth:z.number().int().min(0).max(100),propObjectId:id.optional()});
export const hitShape=z.discriminatedUnion('type',[
 z.strictObject({type:z.literal('rect'),x:unit,y:unit,width:z.number().positive().max(1),height:z.number().positive().max(1)}).refine(r=>r.x+r.width<=1&&r.y+r.height<=1),
 z.strictObject({type:z.literal('polygon'),points:z.array(point).min(3).max(16)}).refine(p=>Math.abs(p.points.reduce((sum,a,i)=>{const b=p.points[(i+1)%p.points.length];return sum+a.x*b.y-b.x*a.y;},0))>1e-8),
]);
const layer=z.strictObject({id,assetId:id,depth:z.number().int().min(0).max(100),anchor:point,size});
/** 舞台資料只包含已發布素材與有限演出；私人 Rig、條件及玩家答案不在其中。 */
export const sceneStageSchema=z.strictObject({
 version:z.literal('scene-stage.v1'),
 areaVisuals:z.array(z.strictObject({areaId:id,backgroundAsset:id,defaultShotId:id,foregroundAsset:id.optional(),layers:z.array(layer).max(32)})).min(1).max(32),
 shots:z.array(z.strictObject({id,areaId:id,cameraId:id,actors:z.array(actorCue).max(18),audioCueIds:z.array(id).max(8)})).min(1).max(128),
 embeddedInteractables:z.array(z.strictObject({id,areaId:id,objectId:id,state:id,assetId:id,depth:z.number().int().min(0).max(100),anchor:point,size,hitShape,interactionPreset:z.enum(['inspect','book','npc','pick','place'])})).max(256),
});

export function validateStageReferences(c:TrackContent){
 const stage=c.scene.stage;
 const reject=(path:string,reference:string):never=>{throw new Error('INVALID_STORY_CONTENT',{cause:{path,reference}});};
 const hasShot=(id:string,path:string)=>{if(!stage?.shots.some(s=>s.id===id))reject(path,id);};
 // 未宣告舞台時亦不能接受新 Cue，避免發布後靜默忽略。
 const steps=(list:any[],path:string)=>{for(const [index,step]of list.entries())if(step.type==='shot')hasShot(step.shotId,`${path}/${index}/shotId`);};
 for(const r of ['inviter','acceptor']as const)for(const node of c.narrative.tracks[r].nodes){
  if(stage&&!node.presentation.shotId)reject(`tracks/${r}/${node.id}/presentation/shotId`,'missing');
  if(node.presentation.shotId){hasShot(node.presentation.shotId,`tracks/${r}/${node.id}`);if(stage!.shots.find(s=>s.id===node.presentation.shotId)!.areaId!==node.areaId)reject(`tracks/${r}/${node.id}/areaId`,node.areaId);}
  if(stage&&node.lines.some(l=>l.speaker==='店員・NPC')&&!stage.shots.find(s=>s.id===node.presentation.shotId)?.actors.some(a=>!['inviter','acceptor'].includes(a.actorId)))reject(`tracks/${r}/${node.id}/lines`,'missing-npc-actor');
 }
 for(const e of c.narrative.endings){
  if(stage&&!e.presentationSteps.some(p=>p.type==='shot'))reject(`endings/${e.id}/presentationSteps`,'missing-shot');
  steps(e.presentationSteps,`endings/${e.id}`);
 }
 for(const b of [...c.narrative.eventBindings,...c.narrative.sharedEventBindings,...c.scene.sceneEventBindings,...c.pool.eventBindings]){
  steps(b.startPresentationSteps,`${b.bindingId}/startPresentationSteps`);
  for(const a of b.actions)steps(a.presentationSteps,`${b.bindingId}/${a.role}/${a.actionId}`);
 }
 if(!stage)return;
 const unique=(items:string[],path:string)=>{if(new Set(items).size!==items.length)reject(path,'duplicate-id');};
 const image=(assetId:string,path:string)=>{if(!c.scene.assets.some(a=>a.id===assetId&&a.mimeType.startsWith('image/')))reject(path,assetId);};
 unique(stage.areaVisuals.map(v=>v.areaId),'areaVisuals');unique(stage.shots.map(s=>s.id),'shots');unique(stage.embeddedInteractables.map(s=>s.id),'embeddedInteractables');
 for(const area of c.scene.areas)if(!stage.areaVisuals.some(v=>v.areaId===area.id))reject('areaVisuals',area.id);
 for(const v of stage.areaVisuals){
  if(!c.scene.areas.some(a=>a.id===v.areaId))reject('areaVisuals',v.areaId);
  if(!stage.shots.some(s=>s.id===v.defaultShotId&&s.areaId===v.areaId))reject('areaVisuals/'+v.areaId+'/defaultShotId',v.defaultShotId);
  image(v.backgroundAsset,`areaVisuals/${v.areaId}/backgroundAsset`);if(v.foregroundAsset)image(v.foregroundAsset,`areaVisuals/${v.areaId}/foregroundAsset`);
  unique(v.layers.map(l=>l.id),`areaVisuals/${v.areaId}/layers`);for(const l of v.layers)image(l.assetId,`areaVisuals/${v.areaId}/${l.id}`);
 }
 for(const shot of stage.shots){
  if(!stage.areaVisuals.some(v=>v.areaId===shot.areaId))reject(`shots/${shot.id}/areaId`,shot.areaId);
  if(!c.scene.scenePresentation.cameras.some(v=>v.id===shot.cameraId))reject(`shots/${shot.id}/cameraId`,shot.cameraId);
  unique(shot.actors.map(a=>a.actorId),`shots/${shot.id}/actors`);
  for(const cue of shot.audioCueIds)if(!Object.hasOwn(c.scene.audioCues,cue))reject(`shots/${shot.id}/audioCueIds`,cue);
  for(const actor of shot.actors){
   if(!['inviter','acceptor'].includes(actor.actorId)){
    const appearance=c.scene.npcs.find(n=>n.id===actor.actorId)?.appearance??reject(`shots/${shot.id}/actors`,actor.actorId);
    // Validate all face and pose variants, including expressions not selected in the current Shot.
    for(const pose of appearance.poses)image(pose.assetId,`shots/${shot.id}/actors/${actor.actorId}/poses/${pose.id}`);
    for(const face of appearance.expressions)image(face.assetId,`shots/${shot.id}/actors/${actor.actorId}/expressions/${face.id}`);
    if(!appearance.poses.some(p=>p.id===actor.pose))reject(`shots/${shot.id}/actors/${actor.actorId}/pose`,actor.pose);
    if(!appearance.expressions.some(e=>e.id===actor.expression))reject(`shots/${shot.id}/actors/${actor.actorId}/expression`,actor.expression);
    if(actor.propObjectId&&!appearance.propAnchors?.some(a=>a.id==='right-hand'))reject(`shots/${shot.id}/actors/${actor.actorId}/propAnchors`,'right-hand');
   }
   if(actor.propObjectId){
    const propAsset=c.scene.sceneObjects.find(o=>o.id===actor.propObjectId)?.assetId;
    if(!propAsset)reject(`shots/${shot.id}/actors/${actor.actorId}/propObjectId`,actor.propObjectId);
    image(propAsset!,`shots/${shot.id}/actors/${actor.actorId}/propObjectId`);
   }
  }
 }
 for(const h of stage.embeddedInteractables){
  image(h.assetId,`embeddedInteractables/${h.id}/assetId`);
  const obj=c.scene.sceneObjects.find(o=>o.id===h.objectId),state=obj?.states.find(s=>s.id===h.state);
  if(!state||state.areaId!==h.areaId)reject(`embeddedInteractables/${h.id}/objectId`,h.objectId);
 }
}

/** 不以五筆重複 neutral 冒充五種表情；姿態 ID 亦不得重複或默默取第一筆。 */
export const npcAppearanceSchema=z.strictObject({
 poses:z.array(z.strictObject({id:actorPose,assetId:id})).min(1).max(4).refine(v=>new Set(v.map(p=>p.id)).size===v.length),
 expressions:z.array(z.strictObject({id:expression,assetId:id})).length(5).refine(v=>new Set(v.map(e=>e.id)).size===5),
 faceAnchor:point,faceSize:size,
 propAnchors:z.array(z.strictObject({id:z.literal('right-hand'),position:point})).max(1).optional(),
});
