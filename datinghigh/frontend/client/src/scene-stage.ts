import type {PresentationStep,SceneWorldObject} from './scene-event-track';
import {canRenderActorRig,type ActorRigView} from './actor-rig-policy';
import {validateStaticNpcAppearance,type StaticNpcAppearance} from '../../../contracts/npc-static';
import {staticExpressions} from '../../../contracts/static-avatar';
import {validateSceneHitMask,type SceneHitMask} from '../../../contracts/scene-hit-mask';
export type StagePoint={x:number;y:number};
export type StageSize={width:number;height:number};
export type StageFrame=StageSize&{left:number;top:number};
export type HitShape={type:'rect';x:number;y:number;width:number;height:number}|{type:'polygon';points:StagePoint[]};
export type EmbeddedInteractable={id:string;areaId:string;objectId:string;state:string;assetId:string;depth:number;anchor:StagePoint;size:StageSize;hitShape:HitShape;interactionPreset:'inspect'|'book'|'npc'|'pick'|'place'};
export type StageActorCue={actorId:string;pose:'stand'|'sit'|'read'|'hold';expression:'neutral'|'smile'|'surprised'|'thoughtful'|'concerned';gesture:'idle'|'blink'|'tear'|'turn'|'hold'|'smile';position:StagePoint;height:number;depth:number;propObjectId?:string};
export type StageShot={id:string;areaId:string;cameraId:string;actors:StageActorCue[];audioCueIds:string[]};
export type AreaVisual={areaId:string;backgroundAsset:string;defaultShotId:string;foregroundAsset?:string;weatherRegion?:{anchor:StagePoint;size:StageSize};layers:{id:string;assetId:string;depth:number;anchor:StagePoint;size:StageSize}[]};
export type NpcAppearance=StaticNpcAppearance|{poses:{id:StageActorCue['pose'];assetId:string}[];expressions:{id:StageActorCue['expression'];assetId:string}[];faceAnchor:StagePoint;faceSize:StageSize;propAnchors?:{id:'right-hand';position:StagePoint}[]};
export type SceneStageSnapshot={version:'scene-stage.v1';currentShotId:string;weather?:{intensity:'steady'|'heavy'|'easing'|'stopped'}|null;shots:StageShot[];areaVisuals:AreaVisual[];embeddedInteractables:EmbeddedInteractable[];npcs:{id:string;label?:string;appearance:NpcAppearance;hitMasks?:{pose:StageActorCue['pose'];expression:StageActorCue['expression'];mask:SceneHitMask}[]}[]};

/** 物件圖層與命中測試共用 top-left／size 及背景 cover 矩陣；不做放大點擊區。 */
export function embeddedFrame(frame:StageFrame,item:Pick<EmbeddedInteractable,'anchor'|'size'>):StageFrame{
 return {left:frame.left+item.anchor.x*frame.width,top:frame.top+item.anchor.y*frame.height,width:item.size.width*frame.width,height:item.size.height*frame.height};
}
function contains(shape:HitShape,p:StagePoint){
 if(shape.type==='rect')return p.x>=shape.x&&p.x<=shape.x+shape.width&&p.y>=shape.y&&p.y<=shape.y+shape.height;
 let inside=false;for(let i=0,j=shape.points.length-1;i<shape.points.length;j=i++){
  const a=shape.points[i],b=shape.points[j];
  if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }return inside;
}
/** 候選只來自當前授權快照；可見且在 viewport 的最上層本體才命中。 */
export function hitEmbeddedObject(items:EmbeddedInteractable[],frame:StageFrame,p:StagePoint,viewport:StageSize):EmbeddedInteractable|null{
 if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.y<0||p.x>=viewport.width||p.y>=viewport.height)return null;
 return [...items].sort((a,b)=>b.depth-a.depth).find(item=>{
  const box=embeddedFrame(frame,item);if(box.width<=0||box.height<=0)return false;
  return contains(item.hitShape,{x:(p.x-box.left)/box.width,y:(p.y-box.top)/box.height});
 })??null;
}

/** 上層透明 Pressable 的矩形仍可能收到點擊；將相對座標還原成全場景位置後，按實際命中本體挑選最上層合法物件。 */
export function hitEmbeddedAtLocalPoint(items:EmbeddedInteractable[],frame:StageFrame,pressedItem:EmbeddedInteractable,local:StagePoint,viewport:StageSize):EmbeddedInteractable|null{
 const box=embeddedFrame(frame,pressedItem);
 return hitEmbeddedObject(items,frame,{x:box.left+local.x,y:box.top+local.y},viewport);
}

/** 從已授權 Shot 的 NPC 透明素材組合輕量可重用 Rig，不呼叫 Gemini，也不引用玩家私人資產。 */
export function resolvePublishedNpcRig(npc:SceneStageSnapshot['npcs'][number],asset:(id:string)=>string|undefined,pose:StageActorCue['pose']='stand'):ActorRigView|null{
 const a=npc.appearance,expressions=['neutral','smile','surprised','thoughtful','concerned'];
 if(npc.hitMasks){try{if(!npc.hitMasks.length||npc.hitMasks.length>20||new Set(npc.hitMasks.map(m=>m.pose+':'+m.expression)).size!==npc.hitMasks.length)return null;for(const m of npc.hitMasks){if(!a.poses.some(p=>p.id===m.pose)||!expressions.includes(m.expression))return null;validateSceneHitMask(m.mask);}for(const p of a.poses)for(const e of expressions)if(!npc.hitMasks.some(m=>m.pose===p.id&&m.expression===e))return null;}catch{return null;}}
 if(a&&'format' in a){
  try{validateStaticNpcAppearance(a);}catch{return null;}
  if(a.poses.some(p=>!asset(p.assetId)))return null;
  const selected=a.poses.find(p=>p.id===pose);if(!selected)return null;
  const region=selected.frames.neutral,ratio=region.width/region.height;
  return {version:'actor-rig.v1',identityVersion:`npc-${npc.id}:${pose}:${selected.assetId}`,assets:[{id:selected.assetId,url:asset(selected.assetId)!,width:selected.width,height:selected.height}],joints:[{id:'root',parentId:null,position:{x:.5,y:1}}],
   layers:[{id:'body',jointId:'root',assetId:selected.assetId,region,position:{x:(1-ratio/.75)/2,y:0},size:{width:ratio/.75,height:1},depth:1}],poses:[{id:pose,overrides:[]}],expressions:staticExpressions.map(id=>({id,overrides:[{layerId:'body',region:selected.frames[id]}]})),propAnchors:[]};
 }
 if(!a||a.poses.length===0||a.poses.length>4||new Set(a.poses.map(p=>p.id)).size!==a.poses.length
   ||a.expressions.length!==5||new Set(a.expressions.map(e=>e.id)).size!==5
   ||expressions.some(id=>!a.expressions.some(e=>e.id===id)))return null;
 if(![a.faceAnchor.x,a.faceAnchor.y,a.faceSize.width,a.faceSize.height].every(Number.isFinite)
    ||a.faceAnchor.x<0||a.faceAnchor.y<0||a.faceSize.width<=0||a.faceSize.height<=0
    ||a.faceAnchor.x+a.faceSize.width>1||a.faceAnchor.y+a.faceSize.height>1)return null;
 if(a.propAnchors&&(a.propAnchors.length>1||a.propAnchors.some(v=>v.id!=='right-hand'||!Number.isFinite(v.position.x)||!Number.isFinite(v.position.y)
    ||v.position.x<0||v.position.x>1||v.position.y<0||v.position.y>1)))return null;
 const definitions=[...a.poses.map(v=>({id:'body-'+v.id,assetId:v.assetId})),...a.expressions.map(v=>({id:'face-'+v.id,assetId:v.assetId}))];
 const assets=definitions.map(v=>({id:v.id,url:asset(v.assetId),width:1,height:1}));
 if(assets.some(v=>!v.url))return null;
 const region={x:0,y:0,width:1,height:1};
 return {
  version:'actor-rig.v1',identityVersion:'npc-'+npc.id,
  assets:assets as ActorRigView['assets'],
  joints:[{id:'root',parentId:null,position:{x:.5,y:1}},{id:'head',parentId:'root',position:a.faceAnchor}],
  layers:[{id:'body',jointId:'root',assetId:'body-'+a.poses[0].id,region,position:{x:0,y:0},size:{width:1,height:1},depth:1},
   {id:'face',jointId:'head',assetId:'face-neutral',region,position:a.faceAnchor,size:a.faceSize,depth:2}],
  poses:a.poses.map(p=>({id:p.id,overrides:[{layerId:'body',assetId:'body-'+p.id}]})),
  expressions:a.expressions.map(e=>({id:e.id,overrides:[{layerId:'face',assetId:'face-'+e.id}]})),
  propAnchors:(a.propAnchors??[]).map(p=>({id:p.id,jointId:'root',position:p.position})),
 };
}

/** 已授權 V3 Shot 的可互動前置條件：正式素材與角色都需具備，不以靜態文字或佔位圖假裝成功。 */
export function canPresentPublishedStage(stage:SceneStageSnapshot,shotId:string,world:SceneWorldObject[],asset:(id:string)=>string|undefined,actorRigs:Record<string,ActorRigView>={}):boolean{
 const shot=stage.shots.find(s=>s.id===shotId),visual=stage.areaVisuals.find(v=>v.areaId===shot?.areaId);
 if(!shot||!visual||!asset(visual.backgroundAsset)||visual.foregroundAsset&&!asset(visual.foregroundAsset)
   ||visual.layers.some(l=>!asset(l.assetId))||visibleEmbeddedObjects(stage,world,shot.areaId).some(i=>!asset(i.assetId)))return false;
 const published=Object.fromEntries(stage.npcs.map(n=>[n.id,resolvePublishedNpcRig(n,asset,shot.actors.find(a=>a.actorId===n.id)?.pose)]));
 return shot.actors.every(actor=>{
  // Published NPC is always resolved from public pinned content; private rig overrides cannot impersonate it.
  const rig=Object.hasOwn(published,actor.actorId)?published[actor.actorId]:actorRigs[actor.actorId];
  if(!rig)return false;
  if(!canRenderActorRig(rig,actor.pose,actor.expression,actor.propObjectId?'right-hand':undefined))return false;
  if(actor.propObjectId){
   const prop=world.find(o=>o.id===actor.propObjectId);
   return !!(prop?.assetId&&asset(prop.assetId)&&rig.propAnchors.some(a=>a.id==='right-hand'));
  }
  return true;
 });
}

/** 已提交的世界狀態決定物件位置；decoded 圖片快取不能把已移走的書放回架上。 */
export function visibleEmbeddedObjects(stage:SceneStageSnapshot,world:SceneWorldObject[],areaId:string){
 return stage.embeddedInteractables.filter(item=>item.areaId===areaId&&world.some(o=>o.id===item.objectId&&o.areaId===areaId&&o.state===item.state&&o.holderRole===null));
}
export function cueShot(stage:SceneStageSnapshot,steps:PresentationStep[]){
 const id=steps.filter(s=>s.type==='shot').at(-1)?.shotId??stage.currentShotId;
 return stage.shots.find(s=>s.id===id);
}
