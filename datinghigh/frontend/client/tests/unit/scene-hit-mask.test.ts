import {expect,it} from 'vitest';
import {containsSceneHitMask,validateSceneHitMask} from '../../../../contracts/scene-hit-mask';
it('only opaque cells of a published mask hit, including the high bit and the right edge',()=>{
 const mask={width:32,height:4,rows:['80000001','00000000','00018000','00000001']};expect(()=>validateSceneHitMask(mask)).not.toThrow();
 expect(containsSceneHitMask(mask,{x:0,y:0})).toBe(true);expect(containsSceneHitMask(mask,{x:.999,y:0})).toBe(true);expect(containsSceneHitMask(mask,{x:.5,y:0})).toBe(false);expect(containsSceneHitMask(mask,{x:1,y:.9})).toBe(false);
 for(const m of [{...mask,rows:['00000000']},{...mask,width:33},{...mask,rows:['ffffffff','ffffffff','ffffffff','<script>']},{...mask,script:'true'}])expect(()=>validateSceneHitMask(m)).toThrow('INVALID_SCENE_HIT_MASK');
});
