import {z} from 'zod';
import {avatarExpressionPrefix,expressionIds,expressionSpecVersion,avatarAssetSpecVersion,type AvatarExpression,type AvatarExpressionManifest} from './avatar-expression-manifest';
import {publishReadyAvatarPack,readReadyAvatarPack} from './avatar-expression-store';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const descriptor=z.strictObject({objectKey:z.string(),sha256:z.string().regex(/^[0-9a-f]{64}$/),mimeType:z.literal('image/webp'),width:z.number().int().min(600).max(4096),height:z.number().int().min(800).max(5462),byteSize:z.number().int().positive().max(2000000),alphaMode:z.literal('straight'),framing:z.literal('full_body'),pose:z.literal('standing')});
const stateSchema=z.strictObject({version:z.literal(1),ownerAccountId:id,assetId:id,attemptId:id,index:z.number().int().min(1).max(4),
 requestId:id,expectedRevision:z.number().int().positive(),sourceImageSha256:z.string().regex(/^[0-9a-f]{64}$/),expiresAt:z.number().int().positive(),
 status:z.enum(['building','ready','committed','cancelled']),completed:z.partialRecord(z.enum(expressionIds),descriptor),receipts:z.partialRecord(z.enum(expressionIds),id),verifiedAt:z.number().int().positive().optional(),
 inFlight:z.strictObject({expression:z.enum(expressionIds),requestId:id,until:z.number().int().positive()}).nullable(),
 failed:z.array(id).max(64),uncertain:z.boolean(),generatorModel:z.string().min(1).max(128),promptVersion:z.string().min(1).max(128)});
export type AvatarAdoption=z.infer<typeof stateSchema>;
export class AvatarAdoptionError extends Error{constructor(public code:string,public status=409){super(code);}}
const key=(owner:string)=>`private/${id.parse(owner)}/avatar/temp/adoption`;
function fail(code='AVATAR_ADOPTION_IN_PROGRESS',status=409):never{throw new AvatarAdoptionError(code,status);}
export const adoptionProgress=(state:AvatarAdoption)=>({assetId:state.assetId,attemptId:state.attemptId,index:state.index,clientRequestId:state.requestId,
 status:state.status,completed:expressionIds.filter(e=>!!state.completed[e]),currentExpression:state.inFlight?.expression??null,uncertain:state.uncertain,expiresAt:state.expiresAt});
async function load(bucket:R2Bucket,owner:string){
 const object=await bucket.get(key(owner));if(!object)return null;
 try{const state=stateSchema.parse(await object.json());if(state.ownerAccountId!==owner)throw new Error();return {state,etag:object.etag};}
 catch{throw new AvatarAdoptionError('AVATAR_PACK_UNAVAILABLE',503);}
}
async function save(bucket:R2Bucket,state:AvatarAdoption,etag?:string){
 const object=await bucket.put(key(state.ownerAccountId),JSON.stringify(state),{onlyIf:etag?{etagMatches:etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 if(!object)fail();return object.etag;
}
const imageReceipt=z.strictObject({version:z.literal(1),ownerAccountId:id,assetId:id,workflowId:id,requestId:id,expression:z.enum(expressionIds),image:descriptor,publishedAt:z.number().int().positive()});
/** 單張物件與進度是兩次 R2 寫入；只依驗證過的同一 lease 收據補齊，不取得新 provider lease。 */
async function recoverStoredExpression(bucket:R2Bucket,current:{state:AvatarAdoption;etag:string}){
 const {state}=current,flight=state.inFlight;if(state.status!=='building'||!flight)return;
 const objectKey=avatarExpressionPrefix(state.ownerAccountId,state.assetId)+flight.expression+'.webp';
 const object=await bucket.get(objectKey);if(!object)return;
 let receipt:z.infer<typeof imageReceipt>;
 try{const text=object.customMetadata?.avatarExpressionReceipt;if(!text||text.length>4096)return;receipt=imageReceipt.parse(JSON.parse(text));}catch{return;}
 if(receipt.ownerAccountId!==state.ownerAccountId||receipt.assetId!==state.assetId||receipt.workflowId!==state.requestId||receipt.requestId!==flight.requestId||receipt.expression!==flight.expression||receipt.image.objectKey!==objectKey||receipt.publishedAt>flight.until||receipt.publishedAt<flight.until-120000||receipt.publishedAt>=state.expiresAt||object.size!==receipt.image.byteSize||object.httpMetadata?.contentType!==receipt.image.mimeType||await digest(object)!==receipt.image.sha256)return;
 const neutral=state.completed.neutral;
 if(Math.abs(receipt.image.width/receipt.image.height-.75)>.015||neutral&&(neutral.width!==receipt.image.width||neutral.height!==receipt.image.height))return;
 state.completed[flight.expression]=receipt.image;state.receipts[flight.expression]=flight.requestId;state.inFlight=null;state.uncertain=false;
 if(expressionIds.every(e=>!!state.completed[e]))state.verifiedAt=receipt.publishedAt;
 try{current.etag=await save(bucket,state,current.etag);}catch(error){
  const actual=await load(bucket,state.ownerAccountId);
  if(!actual||actual.state.requestId!==state.requestId||actual.state.receipts[flight.expression]!==flight.requestId)throw error;
  current.state=actual.state;current.etag=actual.etag;
 }
 await finalize(bucket,current);
}
/** 跨 Worker 的本人前景鎖。呼叫者先驗 Session、候選來源與 profile revision；每次發布後仍須重驗。 */
export async function beginAvatarAdoption(bucket:R2Bucket,input:Omit<AvatarAdoption,'version'|'status'|'completed'|'receipts'|'verifiedAt'|'inFlight'|'failed'|'uncertain'>,now:number){
 const state=stateSchema.parse({...input,version:1,status:'building',completed:{},receipts:{},inFlight:null,failed:[],uncertain:false});
 if(state.expiresAt<=now)fail('AVATAR_CANDIDATE_EXPIRED',410);
 const previous=await load(bucket,state.ownerAccountId);
 if(previous&&previous.state.status==='cancelled'&&previous.state.expiresAt>now&&previous.state.attemptId===state.attemptId&&previous.state.index===state.index&&previous.state.sourceImageSha256===state.sourceImageSha256){
  const resumed={...previous.state,requestId:state.requestId,expectedRevision:state.expectedRevision,status:previous.state.verifiedAt?'ready' as const:'building' as const,inFlight:null,uncertain:false};
  await save(bucket,resumed,previous.etag);return adoptionProgress(resumed);
 }
 if(previous&&['building','ready'].includes(previous.state.status)&&previous.state.expiresAt>now){
  const p=previous.state;
  if(p.requestId!==state.requestId||p.attemptId!==state.attemptId||p.index!==state.index||p.sourceImageSha256!==state.sourceImageSha256||p.expectedRevision!==state.expectedRevision)fail();
  return adoptionProgress(p);
 }
 await save(bucket,state,previous?.etag);return adoptionProgress(state);
}
export async function avatarAdoptionStatus(bucket:R2Bucket,owner:string,now:number){const current=await load(bucket,owner);if(!current||current.state.expiresAt<=now||!['building','ready'].includes(current.state.status))return null;await recoverStoredExpression(bucket,current);await finalize(bucket,current);return adoptionProgress(current.state);}
export async function avatarAdoptionContext(bucket:R2Bucket,owner:string,workflow:string){const current=await load(bucket,owner);if(!current||current.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);return current.state;}
export async function assertAvatarSelectionUnlocked(bucket:R2Bucket,owner:string,now:number){
 const current=await load(bucket,owner);
 if(current&&['building','ready'].includes(current.state.status)&&current.state.expiresAt>now)fail();
}
/** 已成功的項目先回 receipt；未知結果不自動重呼供應商，人工重試須明確接受額外用量。 */
export async function acquireAvatarExpression(bucket:R2Bucket,owner:string,workflow:string,expression:AvatarExpression,requestId:string,now:number,retryUncertain=false){
 id.parse(workflow);id.parse(requestId);z.enum(expressionIds).parse(expression);
 const current=await load(bucket,owner);if(!current||current.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 await recoverStoredExpression(bucket,current);
 const {state}=current;if(state.expiresAt<=now)fail('AVATAR_CANDIDATE_EXPIRED',410);if(state.status==='cancelled')fail('AVATAR_ADOPTION_CANCELLED');
 if(state.completed[expression]){await finalize(bucket,current);return {completed:true,progress:adoptionProgress(state)};}
 if(state.status!=='building')fail();
 const missing=expressionIds.find(e=>!state.completed[e]);if(expression!==missing)fail('AVATAR_EXPRESSION_ORDER');
 if(state.failed.includes(requestId))fail('AVATAR_REQUEST_FAILED');
 if(state.inFlight){if(state.inFlight.until>now)fail();if(!retryUncertain)fail('AVATAR_EXPRESSION_UNCERTAIN');state.failed.push(state.inFlight.requestId);}
 if(state.uncertain&&!retryUncertain)fail('AVATAR_EXPRESSION_UNCERTAIN');
 if(state.failed.length>=64)fail('RATE_LIMITED',429);
 state.inFlight={expression,requestId,until:now+120000};state.uncertain=false;
 const lease=await save(bucket,state,current.etag);
 return {completed:false,lease,assetId:state.assetId,attemptId:state.attemptId,index:state.index,sourceImageSha256:state.sourceImageSha256,progress:adoptionProgress(state)};
}
export async function failAvatarExpression(bucket:R2Bucket,owner:string,workflow:string,requestId:string,lease:string,uncertain:boolean){
 const current=await load(bucket,owner);if(!current||current.etag!==lease||current.state.requestId!==workflow||current.state.inFlight?.requestId!==requestId)fail();
 const expression=current.state.inFlight.expression;await recoverStoredExpression(bucket,current);
 if(current.state.receipts[expression]===requestId)return adoptionProgress(current.state);
 current.state.failed.push(requestId);current.state.inFlight=null;current.state.uncertain=uncertain;
 await save(bucket,current.state,current.etag);return adoptionProgress(current.state);
}
/** 供應商回覆由 .NET 安全解碼、alpha／尺寸檢查及重新編碼後才進此內部 binary 通道。 */
export async function publishAvatarExpression(bucket:R2Bucket,owner:string,workflow:string,expression:AvatarExpression,requestId:string,lease:string,
 bytes:Uint8Array,dimensions:{width:number;height:number},now:number){
 const current=await load(bucket,owner);
 const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',Uint8Array.from(bytes).buffer)),n=>n.toString(16).padStart(2,'0')).join('');
 if(current&&current.state.requestId===workflow&&current.state.status!=='cancelled'&&current.state.receipts[expression]===requestId&&current.state.completed[expression]?.sha256===sha){await finalize(bucket,current);return adoptionProgress(current.state);}
 if(!current||current.etag!==lease||current.state.requestId!==workflow||current.state.status!=='building'||current.state.inFlight?.requestId!==requestId||current.state.inFlight.expression!==expression)fail();
 const {state}=current;if(state.expiresAt<=now||state.inFlight!.until<=now)fail('AVATAR_CANDIDATE_EXPIRED',410);
 const objectKey=avatarExpressionPrefix(owner,state.assetId)+expression+'.webp';
 const image=descriptor.parse({objectKey,sha256:sha,mimeType:'image/webp',...dimensions,byteSize:bytes.length,alphaMode:'straight',framing:'full_body',pose:'standing'});
 if(Math.abs(image.width/image.height-.75)>.015)fail('INVALID_IMAGE',400);
 const first=state.completed.neutral;if(first&&(first.width!==image.width||first.height!==image.height))fail('AVATAR_EXPRESSION_MISMATCH');
 const receipt=imageReceipt.parse({version:1,ownerAccountId:owner,assetId:state.assetId,workflowId:workflow,requestId,expression,image,publishedAt:now});
 const stored=await bucket.put(objectKey,bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'image/webp'},customMetadata:{avatarExpressionReceipt:JSON.stringify(receipt),orphanAfter:String(state.expiresAt+3600000)}});
 if(!stored){const existing=await bucket.get(objectKey);if(!existing||existing.size!==bytes.length||await digest(existing)!==sha)fail('AVATAR_EXPRESSION_MISMATCH');}
 state.completed[expression]=image;state.receipts[expression]=requestId;state.inFlight=null;
 if(expressionIds.every(e=>!!state.completed[e]))state.verifiedAt=now;
 // 先保存單張 receipt；若後續 ready 的回應遺失，續做只會重用，不重生已完成圖。
 current.etag=await save(bucket,state,current.etag);await finalize(bucket,current);
 return adoptionProgress(state);
}
async function finalize(bucket:R2Bucket,current:{state:AvatarAdoption;etag:string}){
 const {state}=current,owner=state.ownerAccountId;
 if(state.status==='building'&&state.verifiedAt&&expressionIds.every(e=>!!state.completed[e])){
  const manifest:AvatarExpressionManifest={manifestSchemaVersion:1,ownerAccountId:owner,avatarAssetId:state.assetId,expressionSpecVersion,avatarAssetSpecVersion,
   sourceImageSha256:state.sourceImageSha256,sourceAssetRef:state.attemptId,status:'ready',framing:'full_body',pose:'standing',
   stageAnchors:{head:{x:.5,y:.08},feet:{x:.5,y:.96}},masterAsset:state.completed.neutral!,expressions:state.completed as AvatarExpressionManifest['expressions'],
   generatorModel:state.generatorModel,promptVersion:state.promptVersion,verifiedAt:state.verifiedAt};
  await publishReadyAvatarPack(bucket,manifest,owner,state.assetId);state.status='ready';current.etag=await save(bucket,state,current.etag);
 }
}
async function digest(object:R2ObjectBody){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await object.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');}
export async function cancelAvatarAdoption(bucket:R2Bucket,owner:string,workflow:string,now:number){
 const current=await load(bucket,owner);if(!current||current.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 if(current.state.inFlight&&current.state.inFlight.until>now)fail();
 current.state.status='cancelled';current.state.inFlight=null;await save(bucket,current.state,current.etag);
 return {cancelled:true};
}
/** R2 ready 仍不是已選；D1 採用時以相同 workflow／來源／revision 再驗，成功後才釋放鎖。 */
export async function readyAvatarAdoption(bucket:R2Bucket,owner:string,workflow:string,now:number){
 const current=await load(bucket,owner);if(!current||current.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 if(current.state.expiresAt<=now)fail('AVATAR_CANDIDATE_EXPIRED',410);
 await finalize(bucket,current);
 if(!['ready','committed'].includes(current.state.status))fail('AVATAR_PACK_NOT_READY');
 const manifest=await readReadyAvatarPack(bucket,owner,current.state.assetId,{sourceImageSha256:current.state.sourceImageSha256});
 return {state:current.state,manifest};
}
export async function completeAvatarAdoption(bucket:R2Bucket,owner:string,workflow:string){
 const current=await load(bucket,owner);if(!current||current.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 if(current.state.status==='committed')return;
 if(current.state.status!=='ready')fail('AVATAR_PACK_NOT_READY');
 current.state.status='committed';await save(bucket,current.state,current.etag);
}
