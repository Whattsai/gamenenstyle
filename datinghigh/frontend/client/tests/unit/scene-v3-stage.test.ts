import {expect,it} from 'vitest';
import {embeddedFrame,hitEmbeddedObject,hitEmbeddedAtLocalPoint} from '../../src/scene-stage';
const object:any={id:'book-spine',objectId:'book',areaId:'shelves',state:'at-shelf',assetId:'cover',depth:4,anchor:{x:.4,y:.2},size:{width:.06,height:.2},hitShape:{type:'rect',x:0,y:0,width:1,height:1},interactionPreset:'book'};
it('SEF-UT-529: cover, zoom and pan share the image transform and exact physical hit shape',()=>{
 for(const frame of [{left:-500,top:-20,width:1800,height:1012.5},{left:0,top:-10,width:960,height:540}]){
  const rect=embeddedFrame(frame,object),x=rect.left+rect.width*.5,y=rect.top+rect.height*.5;
  expect(hitEmbeddedObject([object],frame,{x,y},{width:960,height:900})?.objectId).toBe('book');
  expect(hitEmbeddedObject([object],frame,{x:rect.left-1,y},{width:960,height:900})).toBeNull();
 }
});
it('SEF-UT-530: hidden, removed and outside-viewport objects have no hit target; the top physical layer wins',()=>{
 const frame={left:0,top:0,width:1000,height:600},point={x:430,y:180};
 expect(hitEmbeddedObject([],frame,point,{width:960,height:600})).toBeNull();
 expect(hitEmbeddedObject([object],frame,point,{width:300,height:600})).toBeNull();
 const upper={...object,id:'upper',objectId:'upper-book',depth:5};
 expect(hitEmbeddedObject([object,upper],frame,point,{width:960,height:600})?.objectId).toBe('upper-book');
});
it('SEF-UT-530: a transparent upper polygon does not swallow the lower physical object press',()=>{
 const frame={left:0,top:0,width:1000,height:600};
 const lower={...object,depth:3};
 const upper={...object,id:'upper-occluder',objectId:'upper-book',depth:5,hitShape:{type:'polygon',points:[{x:.5,y:0},{x:1,y:0},{x:1,y:1}]}};
 const viewport={width:1000,height:600};
 // 手指碰到上層 Pressable 的矩形，但沒有命中上層多邊形，應穿透到下層書脊。
 expect(hitEmbeddedAtLocalPoint([lower,upper],frame,upper,{x:5,y:60},viewport)?.id).toBe('book-spine');
 expect(hitEmbeddedAtLocalPoint([lower,upper],frame,upper,{x:55,y:10},viewport)?.id).toBe('upper-occluder');
});
it('SEF-UT-531: polygon hit tests reject the bounding-box corners and accept only the visible outline',()=>{
 const triangle={...object,hitShape:{type:'polygon',points:[{x:0,y:0},{x:1,y:0},{x:.5,y:1}]}},frame={left:0,top:0,width:1000,height:600};
 expect(hitEmbeddedObject([triangle],frame,{x:401,y:239},{width:960,height:600})).toBeNull();
 expect(hitEmbeddedObject([triangle],frame,{x:430,y:180},{width:960,height:600})?.id).toBe('book-spine');
});
