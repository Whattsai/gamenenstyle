// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
vi.mock('react-native',async()=>{
 const web=await vi.importActual<typeof import('react-native')>('react-native-web');
 const react=await vi.importActual<typeof import('react')>('react');
 // RN Web draws Images using a CSS wrapper; render an <img> to exercise native Image onError boundaries in jsdom.
 return {...web,Image:({source,onError,onLoad,testID,...props}:any)=>react.createElement('img',{...props,src:source?.uri,'data-testid':testID,onError,onLoad})};
});
import {EmbeddedSceneStage} from '../../src/EmbeddedSceneStage';
import {canPresentPublishedStage} from '../../src/scene-stage';
import type {ActorRigView} from '../../src/ActorMotionRenderer';
afterEach(cleanup);
const stage:any={version:'scene-stage.v1',currentShotId:'wide',shots:[{id:'wide',areaId:'shelves',cameraId:'wide',actors:[],audioCueIds:[]}],areaVisuals:[{areaId:'shelves',defaultShotId:'wide',backgroundAsset:'shelves-bg',layers:[]}],embeddedInteractables:[{id:'book-on-shelf',areaId:'shelves',objectId:'book',state:'at-shelf',assetId:'cover',depth:2,anchor:{x:.4,y:.2},size:{width:.1,height:.2},hitShape:{type:'rect',x:0,y:0,width:1,height:1},interactionPreset:'book'}],npcs:[]};
const world:any={objects:[{id:'book',label:'書',areaId:'shelves',state:'at-shelf',holderRole:null,x:.4,y:.2}],flags:{}};
const camera:any={id:'wide',scale:1,focus:{x:.5,y:.5}};
it('SEF-UT-520: physical book art has no floating star/card and preview never invokes a mutation',()=>{
 const inspect=vi.fn();render(<EmbeddedSceneStage stage={stage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>);
 expect(screen.getByTestId('embedded-book-on-shelf')).toBeTruthy();expect(screen.queryByText('✧')).toBeNull();
 // RN Web 按鈕事件由本體接收；此層只發出檢視意圖，不能直接提交故事。
 expect(inspect).not.toHaveBeenCalled();
});
it('SEF-UT-526: authoritative relocation removes the old shelf sprite immediately and does not retain cached placement',()=>{
 const view=render(<EmbeddedSceneStage stage={stage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.getByTestId('embedded-book-on-shelf')).toBeTruthy();
 view.rerender(<EmbeddedSceneStage stage={stage} areaId="shelves" world={{...world,objects:[{...world.objects[0],state:'in-box',areaId:'safe-storage'}]}} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
});
it('Web MouseEvent client coordinates open the physical book without inventing native locationX',()=>{
 const inspect=vi.fn();render(<EmbeddedSceneStage stage={stage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>);
 const book=screen.getByTestId('embedded-book-on-shelf');book.getBoundingClientRect=()=>({left:400,top:112.5,width:100,height:112.5,right:500,bottom:225,x:400,y:112.5,toJSON:()=>({})});
 fireEvent.click(book,{clientX:450,clientY:160});expect(inspect).toHaveBeenCalledWith('book');
});
it('read-only completed preview permits only declared books while ordinary scene objects stay disabled',()=>{
 const inspect=vi.fn();render(<EmbeddedSceneStage books={[{id:'original',objectId:'book',title:'原創',category:'人生',summary:'摘要',pages:['一','二']}]} allowBookPreview stage={stage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled/>);
 expect(screen.getByTestId('embedded-book-on-shelf').getAttribute('disabled')).toBeNull();
});
it('opening a physical book removes its shelf sprite locally and closing restores the same location',()=>{
 const props={books:[{id:'original',objectId:'book',title:'原創',category:'人生',summary:'摘要',pages:['一','二']}],stage,areaId:'shelves',world,camera,width:1000,height:562.5,asset:(id:string)=>'/'+id+'.png',onInspect:vi.fn(),disabled:false};
 const view=render(<EmbeddedSceneStage {...props}/>),left=screen.getByTestId('embedded-book-on-shelf').style.left;
 view.rerender(<EmbeddedSceneStage {...props} selectedObject="book"/>);expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();expect(screen.getByTestId('scene-open-book')).toBeTruthy();
 view.rerender(<EmbeddedSceneStage {...props} selectedObject={null}/>);expect(screen.getByTestId('embedded-book-on-shelf').style.left).toBe(left);expect(world.objects).toHaveLength(1);
});
const clerk={actorId:'clerk',pose:'read' as const,expression:'thoughtful' as const,gesture:'idle' as const,position:{x:.5,y:.6},height:.4,depth:3};
const rig:ActorRigView={
 version:'actor-rig.v1',identityVersion:'reviewed-clerk',
 assets:[{id:'body-atlas',url:'/clerk.png',width:100,height:100}],
 joints:[{id:'root',parentId:null,position:{x:.5,y:1}}],
 layers:[{id:'body',jointId:'root',assetId:'body-atlas',region:{x:0,y:0,width:100,height:100},position:{x:0,y:0},size:{width:1,height:1},depth:1}],
 poses:[{id:'stand',overrides:[]},{id:'read',overrides:[]}],
 expressions:[{id:'neutral',overrides:[]},{id:'smile',overrides:[]},{id:'surprised',overrides:[]},{id:'thoughtful',overrides:[]},{id:'concerned',overrides:[]}],
 propAnchors:[{id:'right-hand',jointId:'root',position:{x:.7,y:.5}}],
};
const npcStage={...stage,shots:[{...stage.shots[0],actors:[clerk]}]};
it('SEF-UT-506: a required NPC without a resolved Rig must not leave an interactive but incomplete shot',()=>{
 const inspect=vi.fn();
 render(<EmbeddedSceneStage stage={npcStage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('area-stage-shelves')).toBeNull();
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
 expect(inspect).not.toHaveBeenCalled();
});
it('SEF-UT-536: invalid NPC pose or required held-prop image must fail the whole shot closed',()=>{
 const inspect=vi.fn(),view=render(<EmbeddedSceneStage stage={npcStage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} actorRigs={{clerk:{...rig,poses:rig.poses.filter(p=>p.id!=='read')}}} onInspect={inspect} disabled={false}/>);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('area-stage-shelves')).toBeNull();
 view.rerender(<EmbeddedSceneStage stage={{...npcStage,shots:[{...npcStage.shots[0],actors:[{...clerk,propObjectId:'missing-book'}]}]}} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} actorRigs={{clerk:rig}} onInspect={inspect} disabled={false}/>);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
 expect(inspect).not.toHaveBeenCalled();
});
it('SEF-UT-535: a complete pinned NPC Rig enables the exact requested scene without rebuilding art',()=>{
 render(<EmbeddedSceneStage stage={npcStage} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} actorRigs={{clerk:rig}} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.getByTestId('area-stage-shelves')).toBeTruthy();
 expect(screen.getByTestId('actor-identity-reviewed-clerk')).toBeTruthy();
 expect(screen.getByTestId('embedded-book-on-shelf')).toBeTruthy();
});
const publishedNpcStage={...npcStage,npcs:[{
 id:'clerk',appearance:{
  poses:[{id:'stand',assetId:'clerk-standing'},{id:'read',assetId:'clerk-reading'}],
  expressions:['neutral','smile','surprised','thoughtful','concerned'].map(id=>({id,assetId:'clerk-'+id})),
  faceAnchor:{x:.4,y:.11},faceSize:{width:.25,height:.27},
  propAnchors:[{id:'right-hand',position:{x:.65,y:.5}}],
 }
}]};
it('SEF-UT-502 partial: published NPC layer references render exact pose and facial image without a private player Rig',()=>{
 const inspect=vi.fn();
 const view=render(<EmbeddedSceneStage stage={publishedNpcStage as any} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>);
 expect(screen.getByTestId('area-stage-shelves')).toBeTruthy();
 expect(screen.getByTestId('actor-identity-npc-clerk')).toBeTruthy();
 expect(screen.getByTestId('actor-layer-body').querySelector('img')?.getAttribute('src')).toContain('clerk-reading');
 expect(screen.getByTestId('actor-layer-face').querySelector('img')?.getAttribute('src')).toContain('clerk-thoughtful');
 expect(inspect).not.toHaveBeenCalled();
 const another={...publishedNpcStage,shots:[{...publishedNpcStage.shots[0],actors:[{...clerk,pose:'stand',expression:'smile'}]}]};
 view.rerender(<EmbeddedSceneStage stage={another as any} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>);
 expect(screen.getByTestId('actor-layer-body').querySelector('img')?.getAttribute('src')).toContain('clerk-standing');
 expect(screen.getByTestId('actor-layer-face').querySelector('img')?.getAttribute('src')).toContain('clerk-smile');
});
it('a clerk body opens only on its opaque mask and never submits a dialogue itself',()=>{
 const inspect=vi.fn(),mask={width:4,height:4,rows:['0','6','6','0']};
 const interactive={...publishedNpcStage,npcs:publishedNpcStage.npcs.map((n:any)=>({...n,label:'店員',hitMasks:['stand','read'].flatMap(pose=>['neutral','smile','surprised','thoughtful','concerned'].map(expression=>({pose,expression,mask})))}))};
 render(<EmbeddedSceneStage stage={interactive as any} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>);
 const person=screen.getByRole('button',{name:'場景人物：店員・NPC'}),w=562.5*.4*.75,h=562.5*.4;
 person.getBoundingClientRect=()=>({left:0,top:0,width:w,height:h,right:w,bottom:h,x:0,y:0,toJSON:()=>({})});
 fireEvent.click(person,{clientX:1,clientY:1});expect(inspect).not.toHaveBeenCalled();fireEvent.click(person,{clientX:w*.5,clientY:h*.5});expect(inspect).toHaveBeenCalledOnce();expect(inspect).toHaveBeenCalledWith('clerk');
});
it('SEF-UT-506 / SEF-UT-541 partial: the published preflight is authoritative even when a private Rig tries to override an NPC',()=>{
 const all=(id:string)=>'/'+id+'.png',missing=(id:string)=>id==='clerk-concerned'?undefined:all(id);
 expect(canPresentPublishedStage(publishedNpcStage as any,'wide',world.objects,all)).toBe(true);
 expect(canPresentPublishedStage(publishedNpcStage as any,'wide',world.objects,missing,{clerk:rig})).toBe(false);
 expect(canPresentPublishedStage(publishedNpcStage as any,'unknown-shot',world.objects,all,{clerk:rig})).toBe(false);
 expect(canPresentPublishedStage(publishedNpcStage as any,'wide',[{...world.objects[0],state:'in-box'}],all)).toBe(true);
});
it('SEF-UT-527 partial: image decoding failures notify the parent and hide unsafe scene controls',()=>{
 const unavailable=vi.fn(),inspect=vi.fn();
 render(<EmbeddedSceneStage stage={publishedNpcStage as any} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} onMediaUnavailable={unavailable} disabled={false}/>);
 fireEvent.error(screen.getByTestId('area-background'));
 expect(unavailable).toHaveBeenCalledTimes(1);
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
 expect(inspect).not.toHaveBeenCalled();
});
it('SEF-UT-506 / SEF-UT-535: a missing unselected NPC expression image rejects the entire published scene, not just its current pose',()=>{
 const missing=vi.fn((id:string)=>id==='clerk-concerned'?undefined:'/'+id+'.png');
 render(<EmbeddedSceneStage stage={publishedNpcStage as any} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={missing} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
});
it('SEF-UT-537: an NPC prop can only appear with a declared valid right-hand anchor and authoritative object asset',()=>{
 const carrying={...publishedNpcStage,shots:[{...publishedNpcStage.shots[0],actors:[{...clerk,propObjectId:'book'}]}]};
 const nextWorld={...world,objects:[{...world.objects[0],assetId:'book-art'}]};
 const view=render(<EmbeddedSceneStage stage={carrying as any} areaId="shelves" world={nextWorld} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.getByTestId('actor-prop-right-hand')).toBeTruthy();
 const withoutHand={...carrying,npcs:[{...carrying.npcs[0],appearance:{...carrying.npcs[0].appearance,propAnchors:[]}}]};
 view.rerender(<EmbeddedSceneStage stage={withoutHand as any} areaId="shelves" world={nextWorld} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('actor-prop-right-hand')).toBeNull();
});
it('SEF-UT-537 partial: a corrupted held book image aborts the whole published shot and notifies the host',()=>{
 const carrying={...publishedNpcStage,shots:[{...publishedNpcStage.shots[0],actors:[{...clerk,propObjectId:'book'}]}]};
 const publishedWorld={...world,objects:[{...world.objects[0],assetId:'book-art'}]};
 const unavailable=vi.fn();
 render(<EmbeddedSceneStage stage={carrying as any} areaId="shelves" world={publishedWorld} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={vi.fn()} disabled={false} onMediaUnavailable={unavailable}/>);
 expect(screen.getByTestId('actor-prop-right-hand')).toBeTruthy();
 fireEvent.error(screen.getByTestId('actor-prop-right-hand'));
 expect(unavailable).toHaveBeenCalledTimes(1);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
});
it('SEF-UT-527: an image decode failure disables all object interactions until an authoritative scene refresh',()=>{
 const inspect=vi.fn(),renderStage=(next:any)=><EmbeddedSceneStage stage={next} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={inspect} disabled={false}/>;
 const view=render(renderStage(stage));
 expect(screen.getByTestId('embedded-book-on-shelf')).toBeTruthy();
 fireEvent.error(screen.getByTestId('area-background'));
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
 view.rerender(renderStage({...stage}));
 expect(screen.getByTestId('embedded-book-on-shelf')).toBeTruthy();
 expect(inspect).not.toHaveBeenCalled();
});
it('SEF-UT-536: a corrupted NPC face must hide the whole stage, not just show a placeholder head',()=>{
 render(<EmbeddedSceneStage stage={publishedNpcStage as any} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={id=>'/'+id+'.png'} onInspect={vi.fn()} disabled={false}/>);
 const face=screen.getByTestId('actor-layer-face').querySelector('img');
 expect(face).toBeTruthy();
 fireEvent.error(face!);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();
 expect(screen.queryByTestId('area-stage-shelves')).toBeNull();
});
it('SEF-UT-527: missing shot/area art fails visibly instead of returning a text-only story success',()=>{
 render(<EmbeddedSceneStage stage={{...stage,shots:[]}} areaId="shelves" world={world} camera={camera} width={1000} height={562.5} asset={()=>undefined} onInspect={vi.fn()} disabled={false}/>);
 expect(screen.getByText('場景素材尚未就緒，請重新同步。')).toBeTruthy();expect(screen.queryByTestId('embedded-book-on-shelf')).toBeNull();
});
