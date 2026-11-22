// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
import {ActorMotionRenderer,canRenderActorRig,type ActorRigView} from '../../src/ActorMotionRenderer';
afterEach(cleanup);
const rig:ActorRigView={version:'actor-rig.v1',identityVersion:'approved-source-v1',assets:[{id:'atlas',url:'/atlas.png',width:1200,height:1200}],joints:[{id:'root',parentId:null,position:{x:.5,y:1}},{id:'head',parentId:'root',position:{x:.5,y:.15}}],layers:[{id:'body',jointId:'root',assetId:'atlas',region:{x:0,y:0,width:300,height:400},position:{x:0,y:0},size:{width:1,height:1},depth:1},{id:'face',jointId:'head',assetId:'atlas',region:{x:0,y:400,width:300,height:300},position:{x:.3,y:0},size:{width:.4,height:.3},depth:2}],poses:['stand','sit','read','hold'].map((id,i)=>({id:id as any,overrides:[{layerId:'body',region:{x:i*300,y:0,width:300,height:400}}]})),expressions:['neutral','smile','surprised','thoughtful','concerned'].map((id,i)=>({id:id as any,overrides:[{layerId:'face',region:{x:(i%4)*300,y:400+Math.floor(i/4)*300,width:300,height:300}}]})),propAnchors:[{id:'right-hand',jointId:'root',position:{x:.6,y:.5}}]};
it('SEF-UT-536 partial: missing or duplicate fifth emotion cannot masquerade as a ready neutral Rig',()=>{
 const missing={...rig,expressions:rig.expressions.filter(e=>e.id!=='concerned')};
 expect(canRenderActorRig(missing,'stand','neutral')).toBe(false);
 const duplicate={...rig,expressions:rig.expressions.map(e=>e.id==='concerned'?{...e,id:'smile' as const}:e)};
 expect(canRenderActorRig(duplicate,'stand','neutral')).toBe(false);
 const view=render(<ActorMotionRenderer rig={missing} pose="stand" expression="neutral" gesture="idle" width={300} height={400}/>);
 expect(screen.queryByTestId('actor-layer-body')).toBeNull();
 view.rerender(<ActorMotionRenderer rig={duplicate} pose="stand" expression="neutral" gesture="idle" width={300} height={400}/>);
 expect(screen.queryByTestId('actor-layer-body')).toBeNull();
});
it('SEF-UT-536 partial: a broken unselected pose or facial region must block the whole Rig before play',()=>{
 const invalidPose={...rig,poses:rig.poses.map(p=>p.id==='sit'?{...p,overrides:[{layerId:'body',region:{x:1150,y:0,width:300,height:400}}]}:p)};
 expect(canRenderActorRig(invalidPose,'stand','neutral')).toBe(false);
 const invalidFace={...rig,expressions:rig.expressions.map(e=>e.id==='concerned'?{...e,overrides:[{layerId:'face',assetId:'missing-asset'}]}:e)};
 expect(canRenderActorRig(invalidFace,'stand','neutral')).toBe(false);
 const invalidOverride={...rig,poses:rig.poses.map(p=>p.id==='sit'?{...p,overrides:[{layerId:'unknown-layer'}]}:p)};
 expect(canRenderActorRig(invalidOverride,'stand','neutral')).toBe(false);
});
it('SEF-UT-536 partial: cyclic or orphan Rig skeleton joints are refused rather than rendering a fractured puppet',()=>{
 const cycle={...rig,joints:rig.joints.map(j=>j.id==='root'?{...j,parentId:'head'}:j)};
 expect(canRenderActorRig(cycle,'stand','neutral')).toBe(false);
 const orphan={...rig,joints:rig.joints.map(j=>j.id==='head'?{...j,parentId:'missing'}:j)};
 expect(canRenderActorRig(orphan,'stand','neutral')).toBe(false);
});
it('SEF-UT-535: five semantic expressions change only the facial atlas region and preserve the pinned identity',()=>{
 const view=render(<ActorMotionRenderer rig={rig} pose="stand" expression="neutral" gesture="idle" width={300} height={400}/>);
 const body=screen.getByTestId('actor-layer-body').innerHTML;
 for(const emotion of ['neutral','smile','surprised','thoughtful','concerned']as const){
  view.rerender(<ActorMotionRenderer rig={rig} pose="stand" expression={emotion} gesture="idle" width={300} height={400}/>);
  expect(screen.getByTestId('actor-layer-face')).toBeTruthy();expect(screen.getByTestId('actor-identity-approved-source-v1')).toBeTruthy();
  expect(screen.getByTestId('actor-layer-body').innerHTML).toBe(body);
 }
});
it('SEF-UT-536: unknown pose or incomplete facial layer fails closed without a standing-image substitute',()=>{
 render(<ActorMotionRenderer rig={{...rig,poses:rig.poses.filter(p=>p.id!=='sit')}} pose="sit" expression="neutral" gesture="idle" width={300} height={400}/>);
 expect(screen.queryByTestId('actor-layer-body')).toBeNull();expect(screen.getByText('角色動作素材尚未就緒')).toBeTruthy();
});
it('SEF-UT-537: pose changes reuse atlas assets; held prop attaches only to a declared hand anchor',()=>{
 const view=render(<ActorMotionRenderer rig={rig} pose="read" expression="thoughtful" gesture="hold" width={300} height={400} prop={{anchorId:'right-hand',source:'/book.png'}}/>);
 expect(screen.getByTestId('actor-prop-right-hand')).toBeTruthy();
 view.rerender(<ActorMotionRenderer rig={rig} pose="hold" expression="smile" gesture="hold" width={300} height={400} prop={{anchorId:'unknown',source:'/book.png'}}/>);
 expect(screen.queryByTestId('actor-layer-body')).toBeNull();
});
it('changing identity replaces the native image view instead of retaining the previous bitmap',()=>{
 const view=render(<ActorMotionRenderer rig={rig} pose="stand" expression="neutral" gesture="idle" width={300} height={400} ambientMotion={false}/>);
 const previous=screen.getByTestId('actor-layer-body').querySelector('img')!;
 view.rerender(<ActorMotionRenderer rig={{...rig,identityVersion:'another-identity',assets:[{...rig.assets[0],url:'/different-atlas.png'}]}} pose="stand" expression="neutral" gesture="idle" width={300} height={400} ambientMotion={false}/>);
 expect(previous.isConnected).toBe(false);
});
