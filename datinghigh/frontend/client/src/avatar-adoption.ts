export const expressionIds=['neutral','smile','surprised','thoughtful','concerned'] as const;
export type AvatarExpression=typeof expressionIds[number];
export type AvatarAdoptionProgress={assetId:string;attemptId:string;index:number;clientRequestId:string;status:'building'|'ready'|'committed'|'cancelled';completed:AvatarExpression[];currentExpression:AvatarExpression|null;uncertain:boolean;expiresAt:number};
type Http={request:(path:string,method:string,body?:Record<string,unknown>)=>Promise<any>};
type Selection={attemptId:string;index:number;expectedRevision:number};
export function parseAvatarAdoption(value:any):AvatarAdoptionProgress{
 if(!value||typeof value.assetId!=='string'||typeof value.attemptId!=='string'||typeof value.clientRequestId!=='string'||!Number.isSafeInteger(value.index)||value.index<1||value.index>4||!['building','ready','committed','cancelled'].includes(value.status)||!Array.isArray(value.completed)||value.completed.some((e:any)=>!expressionIds.includes(e))||new Set(value.completed).size!==value.completed.length||typeof value.uncertain!=='boolean'||!Number.isSafeInteger(value.expiresAt))throw new Error('INVALID_AVATAR_ADOPTION_RESPONSE');
 return value;
}
/** 只由本人前景操作啟動；每張 await，失敗立即交回 UI，離開後不排程下一張。 */
export async function produceAvatarExpressions(http:Http,selection:Selection,active:()=>boolean,progress:(value:AvatarAdoptionProgress)=>void,newId:()=>string,resume?:AvatarAdoptionProgress,retryUncertain=false){
 if(!active())return;
 let current:AvatarAdoptionProgress;
 if(resume){const result=await http.request('/me/avatar/expressions','GET');current=parseAvatarAdoption(result.adoption);
  if(!current||current.attemptId!==selection.attemptId||current.index!==selection.index||current.clientRequestId!==resume.clientRequestId)throw new Error('AVATAR_ADOPTION_NOT_FOUND');
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
 if(!active())return;
 if(current.status!=='ready'||expressionIds.some(e=>!current.completed.includes(e)))throw new Error('AVATAR_PACK_NOT_READY');
 return await http.request('/me/avatar/selection','PUT',{type:'generated',...selection});
}
