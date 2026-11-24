import {expressionIds,type AvatarExpression} from './avatar-adoption';
import {parseStaticAvatar,type StaticAvatarProjection} from './static-avatar';
export type StoryAvatarProjection={avatarAssetId:string;avatarVersion:string;expressionSpecVersion:'v1';avatarAssetSpecVersion:'full-body.v1';framing:'full_body';pose:'standing';stageAnchors:{head:{x:number;y:number};feet:{x:number;y:number}};expressions:Record<AvatarExpression,{url:string;sha256:string;mimeType:'image/webp';width:number;height:number;byteSize:number}>;staticPosePackage?:StaticAvatarProjection};
/** 私人投影只接受本輪版本 URL；來源／R2 key 不成為 client 的輸入。 */
export function parseStoryAvatar(value:any,roundId:string,channel:'partner-avatar'|'my-avatar'='partner-avatar'):StoryAvatarProjection{
 const fail=()=>{throw new Error('INVALID_AVATAR_PROJECTION');};
 if(!value||typeof value.avatarAssetId!=='string'||typeof value.avatarVersion!=='string'||!/^[0-9a-f]{64}$/.test(value.avatarVersion)||value.expressionSpecVersion!=='v1'||value.avatarAssetSpecVersion!=='full-body.v1'||value.framing!=='full_body'||value.pose!=='standing'||!value.expressions||Object.keys(value.expressions).length!==5)fail();
 for(const e of expressionIds){const image=value.expressions[e];if(!image||image.url!==`/api/v1/game-rounds/${roundId}/${channel}/${value.avatarVersion}/${e}`||!Number.isInteger(image.width)||image.width<600||!Number.isInteger(image.height)||image.height<800||Math.abs(image.width/image.height-.75)>.015||image.mimeType!=='image/webp'||typeof image.sha256!=='string'||!/^[0-9a-f]{64}$/.test(image.sha256)||!Number.isInteger(image.byteSize)||image.byteSize<1||image.byteSize>2000000)fail();}
 for(const key of ['head','feet']){const p=value.stageAnchors?.[key];if(!p||!Number.isFinite(p.x)||p.x<0||p.x>1||!Number.isFinite(p.y)||p.y<0||p.y>1)fail();}
 if(value.stageAnchors.head.y>=value.stageAnchors.feet.y)fail();
 if(value.staticPosePackage!==undefined)return {...value,staticPosePackage:parseStaticAvatar(value.staticPosePackage,roundId,channel,value.avatarVersion)};
 return value;
}
