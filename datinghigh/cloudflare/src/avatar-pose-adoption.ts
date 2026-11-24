import {z} from 'zod';
import {staticPoses,staticExpressions,type StaticPose} from '../../contracts/static-avatar';
import {avatarExpressionPrefix} from './avatar-expression-manifest';
import {publishStaticPosePackage,staticPackageVersion,staticPosePrefix,validateStaticPosePackage,type StaticPosePackage} from './avatar-static-pose';
import {loadAvatarAdoption,saveAvatarAdoption,finalizeAvatarAdoption,adoptionProgress,AvatarAdoptionError,type AvatarAdoption} from './avatar-adoption';
import {poseBuildSteps,isPoseStep,poseSheetSchema,type PoseBuildStep} from './avatar-pose-contract';
export {poseBuildSteps,isPoseStep} from './avatar-pose-contract';
const sha=z.string().regex(/^[0-9a-f]{64}$/),id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
type Current={state:AvatarAdoption;etag:string};
const fail=(code='AVATAR_ADOPTION_IN_PROGRESS',status=409):never=>{throw new AvatarAdoptionError(code,status);};
const digest=async(b:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),v=>v.toString(16).padStart(2,'0')).join('');
const poseObjectKey=(s:AvatarAdoption,pose:StaticPose)=>s.savedSource?`private/${s.ownerAccountId}/avatar/temp/pose-sheets/${s.requestId}/${pose}.png`:avatarExpressionPrefix(s.ownerAccountId,s.assetId)+`pose-${pose}.png`;
function safePoseTemp(s:AvatarAdoption,pose:StaticPose){const key=s.poseSheets?.[pose]?.objectKey;if(!key||!key.startsWith(`private/${s.ownerAccountId}/avatar/temp/pose-sheets/`)||!new RegExp(`/[0-9a-f-]{36}/${pose}\\.png$`).test(key))fail('AVATAR_PACK_UNAVAILABLE',503);return key!;}
export function posePngDimensions(bytes:Uint8Array){
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(bytes.length<33||v.getUint32(0)!==0x89504e47||v.getUint32(4)!==0x0d0a1a0a||v.getUint32(12)!==0x49484452||v.getUint8(25)!==6)fail('INVALID_IMAGE',400);
 const width=v.getUint32(16),height=v.getUint32(20);
 if(width<1000||width>8192||height<600||height>8192||bytes.length>20000000)fail('INVALID_IMAGE',400);
 return {width,height};
}
function posePackage(s:AvatarAdoption):StaticPosePackage{
 return {schemaVersion:'static-poses.v1',sourceImageSha256:s.sourceImageSha256,
  assets:staticPoses.map(p=>{const a=s.poseSheets![p]!;return {id:p,sha256:a.sha256,mimeType:a.mimeType,width:a.width,height:a.height,byteSize:a.byteSize};}),
  poses:staticPoses.map(p=>({id:p,frames:Object.fromEntries(staticExpressions.map((e,i)=>[e,{assetId:p,region:s.poseSheets![p]!.frames[i]}])) as StaticPosePackage['poses'][number]['frames']}))};
}
export function poseProgress(s:AvatarAdoption):{staticRequired?:boolean;completedPoses?:StaticPose[];currentPose?:string|null;staticPosePackage?:{schemaVersion:string;packageVersion:string;assets:(StaticPosePackage["assets"][number]&{url:string})[];poses:StaticPosePackage["poses"]};staticReviewed?:boolean}{
 if(!s.staticRequired)return {};
 const data=s.staticVersion?posePackage(s):undefined;
 return {staticRequired:true,completedPoses:staticPoses.filter(p=>s.poseSheets?.[p]),currentPose:s.inFlight&&isPoseStep(s.inFlight.expression)?s.inFlight.expression.slice(5):null,
  ...(data?{staticPosePackage:{schemaVersion:data.schemaVersion,packageVersion:s.staticVersion!,assets:data.assets.map(a=>({...a,url:`/api/v1/me/avatar/expressions/${s.requestId}/poses/${a.id}`})),poses:data.poses},staticReviewed:s.reviewedStaticVersion===s.staticVersion}:{})};
}
const receiptSchema=z.strictObject({ownerAccountId:id,assetId:id,workflowId:id,sourceImageSha256:sha,pose:z.enum(staticPoses),image:poseSheetSchema,publishedAt:z.number().int().positive()});
export async function recoverAvatarPose(bucket:R2Bucket,c:Current){
 const s=c.state,f=s.inFlight;if(!f||!isPoseStep(f.expression))return;
 const pose=f.expression.slice(5) as StaticPose,key=poseObjectKey(s,pose),object=await bucket.get(key);if(!object)return;
 let r:z.infer<typeof receiptSchema>;try{r=receiptSchema.parse(JSON.parse(object.customMetadata?.avatarPoseReceipt??''));}catch{return;}
 if(r.ownerAccountId!==s.ownerAccountId||r.assetId!==s.assetId||r.workflowId!==s.requestId||r.sourceImageSha256!==s.sourceImageSha256||r.pose!==pose||r.image.requestId!==f.requestId||r.image.objectKey!==key||r.publishedAt>=s.expiresAt||r.publishedAt>f.until||r.publishedAt<f.until-120000||object.size!==r.image.byteSize||object.httpMetadata?.contentType!=='image/png'||await digest(await object.arrayBuffer())!==r.image.sha256)return;
 s.poseSheets??={};s.poseSheets[pose]=r.image;s.inFlight=null;s.uncertain=false;c.etag=await saveAvatarAdoption(bucket,s,c.etag);await finalizeAvatarAdoption(bucket,c);
}
export async function acquireAvatarPose(bucket:R2Bucket,owner:string,workflow:string,step:PoseBuildStep,requestId:string,now:number,retry=false){
 const c=await loadAvatarAdoption(bucket,owner);if(!c||c.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 await recoverAvatarPose(bucket,c!);const s=c!.state,pose=step.slice(5) as StaticPose;
 if(!s.staticRequired||s.status==='cancelled'||s.expiresAt<=now)fail('AVATAR_CANDIDATE_EXPIRED',410);
 if(s.poseSheets?.[pose]){await finalizeAvatarAdoption(bucket,c!);return {completed:true,progress:adoptionProgress(s)};}
 if(s.status!=='building'||Object.keys(s.completed).length!==5||staticPoses.find(p=>!s.poseSheets?.[p])!==pose)fail('AVATAR_EXPRESSION_ORDER');
 if(s.failed.includes(requestId)||s.failed.length>=64)fail('AVATAR_REQUEST_FAILED');
 if(s.inFlight){if(s.inFlight.until>now)fail();if(!retry)fail('AVATAR_EXPRESSION_UNCERTAIN');s.failed.push(s.inFlight.requestId);}
 if(s.uncertain&&!retry)fail('AVATAR_EXPRESSION_UNCERTAIN');
 s.inFlight={expression:step,requestId,until:now+120000};s.uncertain=false;
 const lease=await saveAvatarAdoption(bucket,s,c!.etag);
 return {completed:false,lease,assetId:s.assetId,attemptId:s.attemptId,index:s.index,sourceImageSha256:s.sourceImageSha256,progress:adoptionProgress(s)};
}
export async function publishAvatarPose(bucket:R2Bucket,owner:string,workflow:string,pose:StaticPose,requestId:string,lease:string,bytes:Uint8Array,now:number){
 const c=await loadAvatarAdoption(bucket,owner);if(!c||c.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 const s=c!.state,hash=await digest(Uint8Array.from(bytes).buffer),previous=s.poseSheets?.[pose];
 if(s.status!=='cancelled'&&previous?.requestId===requestId&&previous.sha256===hash){await finalizeAvatarAdoption(bucket,c!);return adoptionProgress(s);}
 if(!s.staticRequired||c!.etag!==lease||s.status!=='building'||s.inFlight?.expression!==`pose-${pose}`||s.inFlight.requestId!==requestId)fail();
 if(Object.values(s.poseSheets??{}).some(a=>a.sha256===hash))fail('AVATAR_EXPRESSION_MISMATCH');
 if(s.expiresAt<=now||s.inFlight!.until<=now)fail('AVATAR_CANDIDATE_EXPIRED',410);
 const {width,height}=posePngDimensions(bytes),key=poseObjectKey(s,pose);
 const image=poseSheetSchema.parse({objectKey:key,sha256:hash,mimeType:'image/png',width,height,byteSize:bytes.length,requestId,frames:staticExpressions.map((_,i)=>({x:Math.floor(i*width/5),y:0,width:Math.floor((i+1)*width/5)-Math.floor(i*width/5),height}))});
 const receipt=receiptSchema.parse({ownerAccountId:owner,assetId:s.assetId,workflowId:workflow,sourceImageSha256:s.sourceImageSha256,pose,image,publishedAt:now});
 const written=await bucket.put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'image/png'},customMetadata:{avatarPoseReceipt:JSON.stringify(receipt),orphanAfter:String(s.expiresAt+3600000)}});
 if(!written){const existing=await bucket.get(key);if(!existing||await digest(await existing.arrayBuffer())!==hash)fail('AVATAR_EXPRESSION_MISMATCH');}
 s.poseSheets??={};s.poseSheets[pose]=image;s.inFlight=null;s.uncertain=false;
 c!.etag=await saveAvatarAdoption(bucket,s,c!.etag);await finalizeAvatarAdoption(bucket,c!);return adoptionProgress(s);
}
export async function finalizeAvatarPoses(bucket:R2Bucket,s:AvatarAdoption,publishSaved=false){
 if(!s.staticRequired)return true;if(staticPoses.some(p=>!s.poseSheets?.[p]))return false;
 const p=posePackage(s),prefix=staticPosePrefix(s.ownerAccountId,s.assetId,s.sourceImageSha256);
 validateStaticPosePackage(p);
 if(s.savedSource&&!s.reviewedStaticVersion&&!publishSaved){
  for(const pose of staticPoses){const a=s.poseSheets![pose]!,object=await bucket.get(safePoseTemp(s,pose));if(!object||object.size!==a.byteSize||object.httpMetadata?.contentType!=='image/png')fail('AVATAR_PACK_UNAVAILABLE',503);const bytes=new Uint8Array(await object!.arrayBuffer()),size=posePngDimensions(bytes);if(await digest(Uint8Array.from(bytes).buffer)!==a.sha256||size.width!==a.width||size.height!==a.height)fail('AVATAR_PACK_UNAVAILABLE',503);}
  s.staticVersion=await staticPackageVersion(p);return true;
 }
 for(const pose of staticPoses){const a=s.poseSheets![pose]!,canonical=prefix+a.sha256+'.png';let object=await bucket.get(canonical);if(!object){object=await bucket.get(a.objectKey);if(!object)fail('AVATAR_PACK_UNAVAILABLE',503);await bucket.put(canonical,await object!.arrayBuffer(),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'image/png'},customMetadata:{orphanAfter:String(s.expiresAt+3600000)}});}}
 await publishStaticPosePackage(bucket,s.ownerAccountId,s.assetId,s.sourceImageSha256,p,s.expiresAt+3600000);s.staticVersion=await staticPackageVersion(p);return true;
}
export async function cleanAvatarPoseTemps(bucket:R2Bucket,s:AvatarAdoption){if(s.savedSource&&!s.reviewedStaticVersion)return;if(s.staticRequired&&s.staticVersion)await bucket.delete(s.savedSource?staticPoses.map(p=>safePoseTemp(s,p)):staticPoses.map(p=>avatarExpressionPrefix(s.ownerAccountId,s.assetId)+`pose-${p}.png`));}
export async function reviewAvatarPoses(bucket:R2Bucket,owner:string,workflow:string,version:string,now:number){
 const c=await loadAvatarAdoption(bucket,owner);if(!c||c.state.requestId!==workflow)fail('AVATAR_ADOPTION_NOT_FOUND',404);
 const s=c!.state;if(s.status!=='ready'||s.expiresAt<=now||s.staticVersion!==version)fail('AVATAR_PACK_NOT_READY');
 await finalizeAvatarPoses(bucket,s,true);s.reviewedStaticVersion=version;await saveAvatarAdoption(bucket,s,c!.etag);return adoptionProgress(s);
}
export async function readAvatarPosePreview(bucket:R2Bucket,s:AvatarAdoption,pose:StaticPose){
 const a=s.poseSheets?.[pose];if(!s.staticVersion||!a||s.status==='cancelled')fail('AVATAR_PACK_NOT_READY');
 const object=await bucket.get(s.savedSource&&!s.reviewedStaticVersion?safePoseTemp(s,pose):staticPosePrefix(s.ownerAccountId,s.assetId,s.sourceImageSha256)+a!.sha256+'.png');
 if(!object||object.size!==a!.byteSize||object.httpMetadata?.contentType!=='image/png')fail('AVATAR_PACK_UNAVAILABLE',503);
 const bytes=await object!.arrayBuffer();if(await digest(bytes)!==a!.sha256)fail('AVATAR_PACK_UNAVAILABLE',503);return bytes;
}
