import {expect,it} from 'vitest';
import {cameraFrame,portraitFrame,hotspotFrame} from '../../src/story-stage-geometry';

it.each([[390,320],[1200,650],[320,180]])('SD-UT-067/068: %ix%i keeps the head safe and uses one undistorted master at all three distances',(width,height)=>{
 const anchors={head:{x:.5,y:.08},feet:{x:.5,y:.96}};
 const distances=[.9,1.35,2.1].map(size=>portraitFrame(width,height,{x:.52,headY:.09,height:size},anchors));
 for(const p of distances){expect(p.width/p.height).toBeCloseTo(.75);expect(p.top+anchors.head.y*p.height).toBeCloseTo(height*.09);expect(p.left+anchors.head.x*p.width).toBeCloseTo(width*.52);}
 expect(distances[0].top+anchors.feet.y*distances[0].height).toBeLessThan(height);
 expect(distances[2].height).toBeGreaterThan(distances[1].height);
});

it('SD-UT-071: hotspot coordinates follow exactly the background cover and camera transform; offscreen objects use the separate exploration entrance',()=>{
 const stage={width:390,height:320},frame=cameraFrame(stage.width,stage.height,{scale:1.4,focus:{x:.68,y:.55}});
 const spot=hotspotFrame(stage.width,stage.height,frame,{x:.68,y:.55});
 expect(spot).not.toBeNull();expect(spot!.left+22).toBeCloseTo(frame.left+frame.width*.68);expect(spot!.top+22).toBeCloseTo(frame.top+frame.height*.55);
 expect(hotspotFrame(stage.width,stage.height,frame,{x:0,y:0})).toBeNull();
 expect(frame.left).toBeLessThanOrEqual(0);expect(frame.top).toBeLessThanOrEqual(0);expect(frame.left+frame.width).toBeGreaterThanOrEqual(stage.width);
});
