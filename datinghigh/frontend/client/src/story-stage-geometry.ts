type Point={x:number;y:number};
export type Camera={id:string;scale:number;focus:Point;portrait:{x:number;headY:number;height:number};foreground:boolean;tint:string;tintOpacity:number};
export type ScenePresentation={version:'2.5d.v1';backgroundAsset:string;foregroundAsset?:string;cameras:Camera[];hotspots:{id:string;definitionId:string;label:string;x:number;y:number}[];foreground:{id:string;x:number;y:number;width:number;height:number;color:string}[]};
export type NodePresentation={cameraId:string;expression:'neutral'|'smile'|'surprised'|'thoughtful'|'concerned';hotspotIds:string[]};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
/** 場景物件與熱區共用同一 cover／鏡頭矩陣，與角色本地取景分離。 */
export function cameraFrame(width:number,height:number,camera:Pick<Camera,'scale'|'focus'>){
 const w=Math.max(width,height*16/9)*camera.scale,h=w*9/16;
 return {left:clamp(width/2-camera.focus.x*w,width-w,0),top:clamp(height/2-camera.focus.y*h,height-h,0),width:w,height:h};
}
export function portraitFrame(width:number,height:number,camera:Camera['portrait'],anchors:{head:Point;feet:Point}){
 const h=height*camera.height,w=h*3/4;
 return {left:width*camera.x-anchors.head.x*w,top:height*camera.headY-anchors.head.y*h,width:w,height:h};
}
export function hotspotFrame(width:number,height:number,frame:ReturnType<typeof cameraFrame>,spot:Point){
 const x=frame.left+spot.x*frame.width,y=frame.top+spot.y*frame.height;
 return x<22||x>width-22||y<22||y>height-22?null:{left:x-22,top:y-22,width:44,height:44};
}
