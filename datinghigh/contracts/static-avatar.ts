/** Web／Android／Worker 共用的靜態姿態資料；不含 owner、私人 key 或生圖操作。 */
export const staticPoses=['stand','sit','read','hold'] as const;
export const staticExpressions=['neutral','smile','surprised','thoughtful','concerned'] as const;
export type StaticPose=typeof staticPoses[number];
export type StaticExpression=typeof staticExpressions[number];
export type StaticRegion={x:number;y:number;width:number;height:number};
export type StaticPoseData={schemaVersion:'static-poses.v1';assets:{id:string;sha256:string;mimeType:'image/png';width:number;height:number;byteSize:number}[];poses:{id:StaticPose;frames:Record<StaticExpression,{assetId:string;region:StaticRegion}>}[]};
export const staticHash=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{64}$/.test(value);
const fail=():never=>{throw new Error('INVALID_STATIC_AVATAR_PACKAGE');};
const keys=(value:any,names:string[])=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===names.length&&names.every(n=>Object.hasOwn(value,n));
/** 全包驗證，未選中的姿態與表情亦必須完整；不接受多餘或無引用素材。 */
export function validateStaticPoseData(value:unknown):StaticPoseData{
 const p=value as StaticPoseData;
 if(!keys(p,['schemaVersion','assets','poses'])||p.schemaVersion!=='static-poses.v1'||!Array.isArray(p.assets)||p.assets.length<4||p.assets.length>8||!Array.isArray(p.poses)||p.poses.length!==4)fail();
 const assets=new Map<string,StaticPoseData['assets'][number]>(),hashes=new Set<string>();
 for(const a of p.assets){
  if(!keys(a,['id','sha256','mimeType','width','height','byteSize'])||!/^[a-z][a-z0-9-]{0,63}$/.test(a.id)||assets.has(a.id)||!staticHash(a.sha256)||a.mimeType!=='image/png'||![a.width,a.height,a.byteSize].every(n=>Number.isSafeInteger(n)&&n>0)||a.width>8192||a.height>8192||a.byteSize>20000000)fail();
  assets.set(a.id,a);
  if(hashes.has(a.sha256))fail();hashes.add(a.sha256);
 }
 const seen=new Set<string>(),used=new Set<string>(),frames=new Set<string>();
 for(const pose of p.poses){
  if(!keys(pose,['id','frames'])||!staticPoses.includes(pose.id)||seen.has(pose.id)||!keys(pose.frames,[...staticExpressions]))fail();seen.add(pose.id);
  for(const expression of staticExpressions){
   const f=pose.frames[expression],a=assets.get(f?.assetId),r=f?.region;
   if(!keys(f,['assetId','region'])||!a||!keys(r,['x','y','width','height'])||![r.x,r.y,r.width,r.height].every(Number.isFinite)||r.x<0||r.y<0||r.width<=0||r.height<=0||r.x+r.width>a.width||r.y+r.height>a.height)fail();
   used.add(f.assetId);
   const frameKey=JSON.stringify([a!.sha256,r.x,r.y,r.width,r.height]);if(frames.has(frameKey))fail();frames.add(frameKey);
  }
 }
 if(used.size!==assets.size)fail();
 return p;
}
