import {staticPoses,staticHash,validateStaticPoseData,type StaticPose} from '../../../contracts/static-avatar';
import type {StaticAvatarProjection} from './static-avatar';
export const expressionIds=['neutral','smile','surprised','thoughtful','concerned'] as const;
export type AvatarExpression=typeof expressionIds[number];
export type AvatarAdoptionProgress={assetId:string;attemptId:string;index:number;clientRequestId:string;status:'building'|'ready'|'committed'|'cancelled';completed:AvatarExpression[];currentExpression:AvatarExpression|null;uncertain:boolean;expiresAt:number;savedSource?:boolean;staticRequired?:boolean;completedPoses?:StaticPose[];currentPose?:StaticPose|null;staticPosePackage?:StaticAvatarProjection;staticReviewed?:boolean};
type Http={request:(path:string,method:string,body?:Record<string,unknown>)=>Promise<any>};
type Selection={expectedRevision:number}&({attemptId:string;index:number;assetId?:never}|{assetId:string;attemptId?:never;index?:never});
export function parseAvatarAdoption(value:any):AvatarAdoptionProgress{
 if(!value||typeof value.assetId!=='string'||typeof value.attemptId!=='string'||typeof value.clientRequestId!=='string'||!Number.isSafeInteger(value.index)||value.index<1||value.index>4||!['building','ready','committed','cancelled'].includes(value.status)||!Array.isArray(value.completed)||value.completed.some((e:any)=>!expressionIds.includes(e))||new Set(value.completed).size!==value.completed.length||typeof value.uncertain!=='boolean'||!Number.isSafeInteger(value.expiresAt))throw new Error('INVALID_AVATAR_ADOPTION_RESPONSE');
 if(value.staticRequired!==undefined&&typeof value.staticRequired!=='boolean')throw new Error('INVALID_AVATAR_ADOPTION_RESPONSE');
 if(value.staticRequired){
  if(!Array.isArray(value.completedPoses)||value.completedPoses.some((p:any)=>!staticPoses.includes(p))||new Set(value.completedPoses).size!==value.completedPoses.length)throw new Error('INVALID_AVATAR_ADOPTION_RESPONSE');
  if(value.staticPosePackage){const p=value.staticPosePackage;if(!staticHash(p.packageVersion)||!Array.isArray(p.assets))throw new Error('INVALID_AVATAR_ADOPTION_RESPONSE');
   const assets=p.assets.map((a:any)=>{const {url,...safe}=a;if(url!==`/api/v1/me/avatar/expressions/${value.clientRequestId}/poses/${a.id}`||!staticPoses.includes(a.id))throw new Error('INVALID_AVATAR_ADOPTION_RESPONSE');return safe;});
   validateStaticPoseData({schemaVersion:p.schemaVersion,assets,poses:p.poses});
  }
 }
 return value;
}
/** 只由本人前景操作啟動；每張 await，失敗立即交回 UI，離開後不排程下一張。 */
export async function produceAvatarExpressions(http:Http,selection:Selection,active:()=>boolean,progress:(value:AvatarAdoptionProgress)=>void,newId:()=>string,resume?:AvatarAdoptionProgress,retryUncertain=false){
 if(!active())return;
 let current:AvatarAdoptionProgress;
 if(resume){const result=await http.request('/me/avatar/expressions','GET');current=parseAvatarAdoption(result.adoption);
  if(!current||(selection.assetId?(!current.savedSource||current.assetId!==selection.assetId):(current.attemptId!==selection.attemptId||current.index!==selection.index))||current.clientRequestId!==resume.clientRequestId)throw new Error('AVATAR_ADOPTION_NOT_FOUND');
 }else current=parseAvatarAdoption(await http.request('/me/avatar/expressions/begin','POST',{...selection,clientRequestId:newId()}));
 if(!active())return;progress(current);
 if(current.uncertain&&!retryUncertain)throw new Error('AVATAR_EXPRESSION_UNCERTAIN');
 for(const expression of expressionIds){
  if(current.completed.includes(expression))continue;
  if(!active())return;
  progress({...current,currentExpression:expression});
  current=parseAvatarAdoption(await http.request('/me/avatar/expressions/next','POST',{workflowId:current.clientRequestId,expression,clientRequestId:newId(),...(retryUncertain?{retryUncertain:true}:{})}));
  retryUncertain=false;if(!active())return;progress(current);
 }
 if(current.staticRequired){
  for(const pose of staticPoses){
   if(current.completedPoses?.includes(pose))continue;if(!active())return;progress({...current,currentPose:pose});
   current=parseAvatarAdoption(await http.request('/me/avatar/expressions/next','POST',{workflowId:current.clientRequestId,expression:`pose-${pose}`,clientRequestId:newId(),...(retryUncertain?{retryUncertain:true}:{})}));
   retryUncertain=false;if(!active())return;progress(current);
  }
  if(current.status!=='ready'||!current.staticPosePackage)throw new Error('AVATAR_PACK_NOT_READY');
  return; // 完整成品先留在檢視畫面，另一次本人確認才採用。
 }
 if(!active())return;
 if(current.status!=='ready'||expressionIds.some(e=>!current.completed.includes(e)))throw new Error('AVATAR_PACK_NOT_READY');
 return await http.request('/me/avatar/selection','PUT',{type:'generated',...selection});
}

/** 本人檢視後明確確認；離開前景不自動提交選角，未知結果仍由原流程查回。 */
export async function confirmStaticAvatarAdoption(http:Http,selection:Selection,current:AvatarAdoptionProgress,active:()=>boolean){
 if(!active())return;
 const p=parseAvatarAdoption(current);if(!p.staticRequired||p.status!=='ready'||!p.staticPosePackage)throw new Error('AVATAR_PACK_NOT_READY');
 const reviewed=await http.request('/me/avatar/expressions/review','POST',{workflowId:p.clientRequestId,packageVersion:p.staticPosePackage.packageVersion});
 if(p.savedSource)return reviewed;
 if(!active())return;return http.request('/me/avatar/selection','PUT',{type:'generated',...selection});
}
