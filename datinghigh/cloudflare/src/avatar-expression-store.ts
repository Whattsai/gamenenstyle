import {avatarExpressionManifestKey,expressionIds,validateAvatarExpressionManifest,type AvatarExpressionManifest} from './avatar-expression-manifest';

const unavailable=()=>new Error('AVATAR_PACK_UNAVAILABLE');
const digest=async(bytes:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
/** 內部儲存 primitive；呼叫者必須在 I/O 前後另驗有效 Session／本人或 active Round。 */
export async function readReadyAvatarPack(bucket:R2Bucket,owner:string,asset:string,expected?:{sourceImageSha256:string}):Promise<AvatarExpressionManifest>{
 const object=await bucket.get(avatarExpressionManifestKey(owner,asset));
 if(!object||object.size>16384||object.httpMetadata?.contentType!=='application/json')throw unavailable();
 let m:AvatarExpressionManifest;
 try{m=validateAvatarExpressionManifest(await object.json(),owner,asset);}catch{throw unavailable();}
 if(expected&&m.sourceImageSha256!==expected.sourceImageSha256)throw unavailable();
 return m;
}

/** 完成時才驗五個實際物件；已發佈版只允許冪等重讀，永不覆寫。沒有 R2／D1 跨服務原子性的宣稱。 */
export async function publishReadyAvatarPack(bucket:R2Bucket,value:unknown,owner:string,asset:string):Promise<AvatarExpressionManifest>{
 const m=validateAvatarExpressionManifest(value,owner,asset),serialized=JSON.stringify(m),key=avatarExpressionManifestKey(owner,asset);
 const existing=await bucket.get(key);
 if(existing){
  const ready=await readReadyAvatarPack(bucket,owner,asset);
  if(JSON.stringify(ready)!==serialized)throw new Error('AVATAR_PACK_IMMUTABLE');
  return ready;
 }
 for(const expression of expressionIds){const a=m.expressions[expression],object=await bucket.get(a.objectKey);
  if(!object||object.size!==a.byteSize||object.httpMetadata?.contentType!==a.mimeType||await digest(await object.arrayBuffer())!==a.sha256)throw unavailable();
 }
 const written=await bucket.put(key,serialized,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{orphanAfter:String(m.verifiedAt+7200000)}});
 if(!written){const ready=await readReadyAvatarPack(bucket,owner,asset);if(JSON.stringify(ready)!==serialized)throw new Error('AVATAR_PACK_IMMUTABLE');return ready;}
 return m;
}
