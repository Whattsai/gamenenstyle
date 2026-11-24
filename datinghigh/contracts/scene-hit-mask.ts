export type SceneHitMask={width:number;height:number;rows:string[]};
/** 發布素材的低解析不透明命中遮罩；不接受腳本、圖片網址或擴大的矩形。 */
export function validateSceneHitMask(input:unknown):asserts input is SceneHitMask{
 const m=input as SceneHitMask;
 if(!m||typeof m!=='object'||Object.keys(m).sort().join(',')!=='height,rows,width'||!Number.isInteger(m.width)||m.width<4||m.width>32||m.width%4||!Number.isInteger(m.height)||m.height<4||m.height>128||!Array.isArray(m.rows)||m.rows.length!==m.height||m.rows.some(row=>typeof row!=='string'||row.length!==m.width/4||!/^[0-9a-f]+$/.test(row))||!m.rows.some(row=>/[1-9a-f]/.test(row)))throw Error('INVALID_SCENE_HIT_MASK');
}
export function containsSceneHitMask(mask:SceneHitMask,point:{x:number;y:number}){
 if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.y<0||point.x>=1||point.y>=1)return false;
 const x=Math.floor(point.x*mask.width),y=Math.floor(point.y*mask.height);
 return !!((parseInt(mask.rows[y],16)>>>(mask.width-1-x))&1);
}
