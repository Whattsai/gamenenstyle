type Point={x:number;y:number};
type Region={x:number;y:number;width:number;height:number};
type Override={layerId:string;assetId?:string;region?:Region;rotation?:number;position?:Point;visible?:boolean};
export type ActorRigView={
 version:'actor-rig.v1';identityVersion:string;
 assets:{id:string;url:string;width:number;height:number;headers?:Record<string,string>}[];
 joints:{id:string;parentId:string|null;position:Point}[];
 layers:{id:string;jointId:string;assetId:string;region:Region;position:Point;size:{width:number;height:number};depth:number}[];
 poses:{id:'stand'|'sit'|'read'|'hold';overrides:Override[]}[];
 expressions:{id:'neutral'|'smile'|'surprised'|'thoughtful'|'concerned';overrides:Override[]}[];
 propAnchors:{id:string;jointId:string;position:Point}[];
};

/** 純資料校驗：Web、Android 與前置提交 Gate 共用，不載入 React Native 或任一圖片。 */
const requiredExpressions=['neutral','smile','surprised','thoughtful','concerned'] as const;
const validNumbers=(...values:number[])=>values.every(Number.isFinite);
const uniqueIds=<T extends {id:string}>(items:T[])=>new Set(items.map(x=>x.id)).size===items.length;

/** 先驗整個不可變 Rig：尚未選到的表情／姿勢損壞，也不可讓角色以 neutral 假就緒。 */
export function canRenderActorRig(
 rig:ActorRigView,
 pose:ActorRigView['poses'][number]['id'],
 expression:ActorRigView['expressions'][number]['id'],
 propAnchorId?:string,
):boolean{
 if(!rig||rig.version!=='actor-rig.v1'||!rig.identityVersion?.trim()
    ||!rig.assets?.length||!rig.joints?.length||!rig.layers?.length||!rig.poses?.length
    ||rig.expressions?.length!==requiredExpressions.length||!Array.isArray(rig.propAnchors))return false;
 if(!uniqueIds(rig.assets)||!uniqueIds(rig.joints)||!uniqueIds(rig.layers)
    ||!uniqueIds(rig.poses)||!uniqueIds(rig.expressions)||!uniqueIds(rig.propAnchors)
    ||requiredExpressions.some(id=>!rig.expressions.some(e=>e.id===id))
    ||!rig.poses.some(p=>p.id===pose)||!rig.expressions.some(e=>e.id===expression))return false;
 const assetById=new Map(rig.assets.map(a=>[a.id,a]));
 const joints=new Map(rig.joints.map(j=>[j.id,j]));
 if(rig.assets.some(a=>!a.id||!a.url||!validNumbers(a.width,a.height)||a.width<=0||a.height<=0)
    ||rig.joints.filter(j=>j.parentId===null).length!==1
    ||rig.joints.some(j=>!validNumbers(j.position.x,j.position.y)||j.parentId!==null&&!joints.has(j.parentId)))return false;
 // Parent graph must be acyclic; a rooted but cyclic skeleton would never be a valid puppet.
 for(const joint of rig.joints){
  const seen=new Set<string>();let cursor:typeof joint|undefined=joint;
  while(cursor){if(seen.has(cursor.id))return false;seen.add(cursor.id);cursor=cursor.parentId===null?undefined:joints.get(cursor.parentId);}
 }
 if(rig.layers.some(l=>!l.id||!joints.has(l.jointId)||!validNumbers(l.position.x,l.position.y,l.size.width,l.size.height,l.depth)
    ||l.size.width<=0||l.size.height<=0))return false;
 if(rig.propAnchors.some(a=>!a.id||!joints.has(a.jointId)||!validNumbers(a.position.x,a.position.y))
    ||propAnchorId&&!rig.propAnchors.some(a=>a.id===propAnchorId))return false;
 const validOverride=(items:ActorRigView['poses'][number]['overrides'])=>
  new Set(items.map(o=>o.layerId)).size===items.length
  &&items.every(o=>rig.layers.some(l=>l.id===o.layerId)
    &&(!o.assetId||assetById.has(o.assetId))
    &&(!o.position||validNumbers(o.position.x,o.position.y))
    &&(o.rotation===undefined||Number.isFinite(o.rotation)));
 if(rig.poses.some(p=>!validOverride(p.overrides))
    ||rig.expressions.some(e=>!validOverride(e.overrides)))return false;
 // A newly selected pose can reveal an invalid, previously unselected facial atlas region.
 for(const p of rig.poses)for(const e of rig.expressions)for(const layer of rig.layers){
  const resolved={...layer,...p.overrides.find(o=>o.layerId===layer.id),...e.overrides.find(o=>o.layerId===layer.id)};
  const asset=assetById.get(resolved.assetId),r=resolved.region;
  if(!asset||!r||!validNumbers(r.x,r.y,r.width,r.height)||r.x<0||r.y<0
     ||r.width<=0||r.height<=0||r.x+r.width>asset.width||r.y+r.height>asset.height)return false;
 }
 return true;
}
