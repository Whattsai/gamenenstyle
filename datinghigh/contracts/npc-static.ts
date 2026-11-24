import {staticPoses,staticExpressions,type StaticPose,type StaticExpression,type StaticRegion} from './static-avatar';
/** NPC僅宣告實際已製作的姿態；每種表情都是同一張完整人物圖格。 */
export type StaticNpcAppearance={format:'static-npc.v1';poses:{id:StaticPose;assetId:string;width:number;height:number;frames:Record<StaticExpression,StaticRegion>}[];propAnchors?:never};
export function validateStaticNpcAppearance(value:unknown):StaticNpcAppearance{
 const p=value as StaticNpcAppearance,fail=():never=>{throw Error('INVALID_STATIC_NPC');};
 const keys=(o:any,names:string[])=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===names.length&&names.every(k=>Object.hasOwn(o,k));
 if(!keys(p,['format','poses'])||p.format!=='static-npc.v1'||!Array.isArray(p.poses)||p.poses.length<1||p.poses.length>4)fail();
 const seen=new Set<string>(),frames=new Set<string>(),dimensions=new Map<string,string>();
 for(const pose of p.poses){
  if(!keys(pose,['id','assetId','width','height','frames'])||!staticPoses.includes(pose.id)||seen.has(pose.id)||typeof pose.assetId!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(pose.assetId)||![pose.width,pose.height].every(n=>Number.isSafeInteger(n)&&n>0&&n<=8192)||!keys(pose.frames,[...staticExpressions]))fail();
  seen.add(pose.id);const size=JSON.stringify([pose.width,pose.height]);if(dimensions.has(pose.assetId)&&dimensions.get(pose.assetId)!==size)fail();dimensions.set(pose.assetId,size);
  for(const e of staticExpressions){const r=pose.frames[e];if(!keys(r,['x','y','width','height'])||![r.x,r.y,r.width,r.height].every(Number.isFinite)||r.x<0||r.y<0||r.width<=0||r.height<=0||r.x+r.width>pose.width||r.y+r.height>pose.height)fail();
   const key=JSON.stringify([pose.assetId,r]);if(frames.has(key))fail();frames.add(key);
  }
 }
 return p;
}
