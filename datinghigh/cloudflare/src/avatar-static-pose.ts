import {staticHash,validateStaticPoseData,type StaticPoseData} from '../../contracts/static-avatar';
export type StaticPosePackage=StaticPoseData&{sourceImageSha256:string};
/** 正式包以來源 SHA 綁定；儲存位置及讀取授權由呼叫者處理。 */
export function validateStaticPosePackage(value:unknown):StaticPosePackage{
 const p=value as StaticPosePackage;
 if(!p||Object.keys(p).length!==4||!staticHash(p.sourceImageSha256))throw new Error('INVALID_STATIC_AVATAR_PACKAGE');
 const {sourceImageSha256,...data}=p;validateStaticPoseData(data);return p;
}
export async function staticPackageVersion(p:StaticPosePackage){
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(p)))),v=>v.toString(16).padStart(2,'0')).join('');
}
const identity=(s:string)=>{if(!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s))throw new Error('INVALID_STATIC_AVATAR_OWNER');return s;};
export function staticPosePrefix(owner:string,asset:string,source:string){
 if(!staticHash(source))throw new Error('INVALID_STATIC_AVATAR_SOURCE');
 return `private/${identity(owner)}/avatar/${identity(asset)}/static-poses/v1/${source}/`;
}
export async function readReadyStaticPosePackage(bucket:R2Bucket,owner:string,asset:string,source:string):Promise<StaticPosePackage|undefined>{
 const object=await bucket.get(staticPosePrefix(owner,asset,source)+'manifest.json');if(!object)return;
 if(object.size>32768||object.httpMetadata?.contentType!=='application/json')throw new Error('AVATAR_PACK_UNAVAILABLE');
 const p=validateStaticPosePackage(await object.json());if(p.sourceImageSha256!==source)throw new Error('AVATAR_PACK_UNAVAILABLE');return p;
}
/** 私人套組完成後才發布；條件寫入防止兩端覆寫，重試只允許同包。呼叫者另驗採用／Session。 */
export async function publishStaticPosePackage(bucket:R2Bucket,owner:string,asset:string,source:string,value:unknown,orphanAfter?:number){
 const p=validateStaticPosePackage(value),prefix=staticPosePrefix(owner,asset,source);
 if(p.sourceImageSha256!==source)throw new Error('INVALID_STATIC_AVATAR_SOURCE');
 const serialized=JSON.stringify(p),existing=await readReadyStaticPosePackage(bucket,owner,asset,source);
 if(existing){if(JSON.stringify(existing)!==serialized)throw new Error('AVATAR_PACK_IMMUTABLE');}
 for(const a of p.assets){
  const object=await bucket.get(prefix+a.sha256+'.png');
  if(!object||object.size!==a.byteSize||object.httpMetadata?.contentType!==a.mimeType)throw new Error('AVATAR_PACK_UNAVAILABLE');
  const bytes=await object.arrayBuffer(),view=new DataView(bytes);
  const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
  if(sha!==a.sha256||bytes.byteLength<33||view.getUint32(0)!==0x89504e47||view.getUint32(4)!==0x0d0a1a0a||view.getUint32(12)!==0x49484452||view.getUint32(16)!==a.width||view.getUint32(20)!==a.height||view.getUint8(25)!==6)throw new Error('AVATAR_PACK_UNAVAILABLE');
 }
 if(existing)return existing;
 const written=await bucket.put(prefix+'manifest.json',serialized,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},...(orphanAfter?{customMetadata:{orphanAfter:String(orphanAfter)}}:{})});
 if(!written){const ready=await readReadyStaticPosePackage(bucket,owner,asset,source);if(JSON.stringify(ready)!==serialized)throw new Error('AVATAR_PACK_IMMUTABLE');return ready;}
 return p;
}
