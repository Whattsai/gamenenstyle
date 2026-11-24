import {staticHash,staticExpressions,validateStaticPoseData,type StaticPoseData,type StaticPose,type StaticExpression} from '../../../contracts/static-avatar';
import type {ActorRigView} from './actor-rig-policy';
import type {SceneStageSnapshot} from './scene-stage';
export type StaticAvatarProjection=Omit<StaticPoseData,'assets'>&{packageVersion:string;assets:(StaticPoseData['assets'][number]&{url:string})[]};
/** 只接受同輪、同用途、同版的既有媒體通道；整包失效時不得退回假站姿。 */
export function parseStaticAvatar(value:unknown,roundId:string,channel:'partner-avatar'|'my-avatar',avatarVersion:string):StaticAvatarProjection{
 const p=value as StaticAvatarProjection,fail=():never=>{throw new Error('INVALID_STATIC_AVATAR_PROJECTION');};
 if(!p||Object.keys(p).length!==4||!staticHash(p.packageVersion)||!Array.isArray(p.assets))fail();
 const assets=p.assets.map(a=>{const {url,...safe}=a;if(typeof url!=='string'||url!==`/api/v1/game-rounds/${roundId}/${channel}/${avatarVersion}/static-${a.sha256}`)fail();return safe;});
 validateStaticPoseData({schemaVersion:p.schemaVersion,assets,poses:p.poses});return p;
}
/** 完整圖格不拆五官；選中的姿態／表情一次切換，不會疊上其他姿態的臉。 */
export function staticAvatarRig(p:StaticAvatarProjection,pose:StaticPose,expression:StaticExpression,origin:string,headers?:Record<string,string>):ActorRigView{
 const selectedPose=p.poses.find(v=>v.id===pose),frame=selectedPose?.frames[expression];if(!selectedPose||!frame)throw new Error('INVALID_STATIC_AVATAR_PROJECTION');
 const ratio=frame.region.width/frame.region.height;
 return {version:'actor-rig.v1',identityVersion:p.packageVersion,
  assets:p.assets.map(a=>({id:a.id,url:new URL(a.url,origin).toString(),width:a.width,height:a.height,...(headers?{headers}:{})})),
  joints:[{id:'root',parentId:null,position:{x:.5,y:1}}],
  layers:[{id:'body',jointId:'root',assetId:frame.assetId,region:frame.region,position:{x:(1-ratio/.75)/2,y:0},size:{width:ratio/.75,height:1},depth:1}],
  poses:[{id:pose,overrides:[]}],expressions:staticExpressions.map(id=>({id,overrides:[{layerId:'body',assetId:selectedPose.frames[id].assetId,region:selectedPose.frames[id].region}]})),propAnchors:[]};
}
/** 只替當前授權 Shot 的玩家建投影；NPC 仍由已發布公用素材處理。 */
export function staticStageActors(stage:SceneStageSnapshot,shotId:string,players:Record<string,StaticAvatarProjection|undefined>,origin:string,headers?:Record<string,string>){
 const rigs:Record<string,ActorRigView>={};
 for(const actor of stage.shots.find(s=>s.id===shotId)?.actors??[]){
  if(!['inviter','acceptor'].includes(actor.actorId))continue;
  const p=players[actor.actorId];if(p)rigs[actor.actorId]=staticAvatarRig(p,actor.pose,actor.expression,origin,headers);
 }
 return rigs;
}
