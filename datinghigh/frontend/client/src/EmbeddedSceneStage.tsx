import React from 'react';
import {SceneBook,type PublishedBook} from './SceneBook';
import {Image,Pressable,Text,View} from 'react-native';
import {ActorMotionRenderer,type ActorRigView} from './ActorMotionRenderer';
import {cameraFrame,type Camera} from './story-stage-geometry';
import {embeddedFrame,hitEmbeddedAtLocalPoint,visibleEmbeddedObjects,resolvePublishedNpcRig,canPresentPublishedStage,type SceneStageSnapshot} from './scene-stage';
import type {TrackSnapshot} from './scene-event-track';
import {containsSceneHitMask} from '../../../contracts/scene-hit-mask';

function localPoint(event:{nativeEvent:unknown;currentTarget:unknown}){
 const n=event.nativeEvent as {locationX?:number;locationY?:number;clientX?:number;clientY?:number};
 if(Number.isFinite(n.locationX)&&Number.isFinite(n.locationY))return{x:n.locationX!,y:n.locationY!};
 const target=event.currentTarget as {getBoundingClientRect?:()=>{left:number;top:number}};
 const rect=target?.getBoundingClientRect?.();return rect&&Number.isFinite(n.clientX)&&Number.isFinite(n.clientY)?{x:n.clientX!-rect.left,y:n.clientY!-rect.top}:null;
}

/** 分區背景、物件本體與角色使用同一鏡頭座標；檢視意圖不形成任何權威提交。 */
export function EmbeddedSceneStage({books,selectedObject,allowBookPreview,stage,areaId,world,camera,width,height,asset,onInspect,disabled,shotId,actorRigs={},onMediaUnavailable}:{books?:PublishedBook[];selectedObject?:string|null;allowBookPreview?:boolean;stage:SceneStageSnapshot;areaId:string;world:TrackSnapshot['world'];camera:Pick<Camera,'id'|'scale'|'focus'>;width:number;height:number;asset:(id:string)=>string|undefined;onInspect:(id:string)=>void;disabled:boolean;shotId?:string;actorRigs?:Record<string,ActorRigView>;onMediaUnavailable?:()=>void}){
 const [failedAsset,setFailedAsset]=React.useState<{stage:SceneStageSnapshot;shotId:string}|null>(null);
 const selectedShotId=shotId??stage.currentShotId;
 const onMediaError=()=>{setFailedAsset({stage,shotId:selectedShotId});onMediaUnavailable?.();};
 const shot=stage.shots.find(s=>s.id===selectedShotId),visual=stage.areaVisuals.find(v=>v.areaId===(shot?.areaId??areaId));
 const frame=cameraFrame(width,height,camera),items=visibleEmbeddedObjects(stage,world.objects,shot?.areaId??areaId);
 const openBook=books?.find(b=>b.objectId===selectedObject),visibleItems=items.filter(item=>item.objectId!==openBook?.objectId);
 const background=visual&&asset(visual.backgroundAsset);
 const publicNpcRigs=Object.fromEntries(stage.npcs.map(npc=>[npc.id,resolvePublishedNpcRig(npc,asset,shot?.actors.find(a=>a.actorId===npc.id)?.pose)]));
 const rigFor=(id:string)=>Object.hasOwn(publicNpcRigs,id)?publicNpcRigs[id]:actorRigs[id];
 const assetsReady=canPresentPublishedStage(stage,selectedShotId,world.objects,asset,actorRigs);
 if(!shot||!visual||!background||!assetsReady||failedAsset?.stage===stage&&failedAsset.shotId===selectedShotId)return <Text>場景素材尚未就緒，請重新同步。</Text>;
 const layers:React.ReactNode[]=[];
 for(const layer of visual.layers)layers.push(<Image key={`layer:${layer.id}`} testID={`area-layer-${layer.id}`} onError={onMediaError} pointerEvents="none" source={{uri:asset(layer.assetId)}} resizeMode="stretch" style={{position:'absolute',...embeddedFrame(frame,layer),zIndex:layer.depth}}/>);
 for(const item of visibleItems){const box=embeddedFrame(frame,item);layers.push(<Pressable key={item.id} testID={`embedded-${item.id}`} accessibilityRole="button" accessibilityLabel={`場景物件：${world.objects.find(o=>o.id===item.objectId)?.label??item.objectId}`} disabled={disabled&&!(allowBookPreview&&books?.some(book=>book.objectId===item.objectId))} onPress={event=>{
  const point=localPoint(event);if(!point)return;
  const found=hitEmbeddedAtLocalPoint(visibleItems,frame,item,point,{width,height});
  if(found)onInspect(found.objectId);
 }} style={{position:'absolute',...box,zIndex:item.depth,backgroundColor:'transparent'}}><Image pointerEvents="none" onError={onMediaError} source={{uri:asset(item.assetId)}} resizeMode="stretch" style={{width:'100%',height:'100%'}}/></Pressable>);}
 for(const actor of shot.actors){
  const rig=rigFor(actor.actorId);
  if(!rig){layers.push(<Text key={`missing:${actor.actorId}`} style={{position:'absolute',top:20,left:20,color:'#fff4ed',zIndex:101}}>角色動作素材尚未就緒</Text>);continue;}
  const h=frame.height*actor.height,w=h*.75;
  const prop=actor.propObjectId?world.objects.find(o=>o.id===actor.propObjectId):undefined,propSource=prop?.assetId&&asset(prop.assetId);
  const style={position:'absolute' as const,left:frame.left+actor.position.x*frame.width-w/2,top:frame.top+actor.position.y*frame.height-h,width:w,height:h,zIndex:actor.depth};
  const art=<ActorMotionRenderer rig={rig} pose={actor.pose} expression={actor.expression} gesture={actor.gesture} width={w} height={h} prop={propSource?{anchorId:'right-hand',source:propSource}:undefined} ambientMotion={false} onAssetError={onMediaError}/>;
  const npc=stage.npcs.find(n=>n.id===actor.actorId),mask=npc?.hitMasks?.find(m=>m.pose===actor.pose&&m.expression===actor.expression)?.mask,body=rig.layers.find(l=>l.id==='body');
  if(npc&&mask&&body)layers.push(<Pressable key={`actor:${actor.actorId}`} accessibilityRole="button" accessibilityLabel={`場景人物：${npc.label??'店員'}・NPC`} disabled={disabled} style={style} onPress={event=>{const p=localPoint(event);if(p&&containsSceneHitMask(mask,{x:(p.x/w-body.position.x)/body.size.width,y:(p.y/h-body.position.y)/body.size.height}))onInspect(npc.id);}}>{art}</Pressable>);
  else layers.push(<View key={`actor:${actor.actorId}`} pointerEvents="none" style={style}>{art}</View>);
 }
 return <View testID={`area-stage-${visual.areaId}`} style={{width,height,position:'relative',overflow:'hidden',backgroundColor:'#201b2a'}}>
  <Image pointerEvents="none" testID="area-background" onError={onMediaError} source={{uri:background}} resizeMode="stretch" style={{position:'absolute',...frame}}/>
  {layers}
  {(()=>{const book=books?.find(b=>b.objectId===selectedObject),item=items.find(i=>i.objectId===selectedObject);return book&&item?<SceneBook key={`${book.id}:${book.objectId}`} book={book} coverSource={asset(item.assetId)} onMediaError={onMediaError} frame={embeddedFrame(frame,item)} viewport={{width,height}} onClose={()=>onInspect('')}/>:null;})()}
  {visual.foregroundAsset&&<Image pointerEvents="none" testID="area-foreground" onError={onMediaError} source={{uri:asset(visual.foregroundAsset)}} resizeMode="stretch" style={{position:'absolute',...frame,zIndex:100}}/>}
 </View>;
}
