import {it,expect} from 'vitest';
import {resolvePublishedNpcRig,canPresentPublishedStage} from '../../src/scene-stage';
const appearance:any={format:'static-npc.v1',poses:['stand','hold'].map((id,n)=>({id,assetId:'clerk-'+id,width:1000,height:800,frames:Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map((e,i)=>[e,{x:i*200,y:0,width:200,height:800}]))}))};
it('static NPC uses the selected complete pose/expression frame and rejects missing art without accepting a private override',()=>{
 const npc:any={id:'clerk',appearance};
 const rig=resolvePublishedNpcRig(npc,id=>'/published/'+id,'hold')!;
 expect(rig.layers).toHaveLength(1);expect(rig.layers[0].id).toBe('body');expect(rig.assets[0].url).toBe('/published/clerk-hold');
 expect(rig.expressions.find(e=>e.id==='concerned')!.overrides[0].region).toEqual({x:800,y:0,width:200,height:800});
 expect(resolvePublishedNpcRig(npc,()=>undefined,'hold')).toBeNull();
 const stage:any={npcs:[npc],shots:[{id:'shot',areaId:'entry',actors:[{actorId:'clerk',pose:'hold',expression:'smile'}]}],areaVisuals:[{areaId:'entry',backgroundAsset:'bg',layers:[]}],embeddedInteractables:[]};
 expect(canPresentPublishedStage(stage,'shot',[],id=>id==='clerk-hold'?undefined:'/public/'+id,{clerk:rig})).toBe(false);
});
