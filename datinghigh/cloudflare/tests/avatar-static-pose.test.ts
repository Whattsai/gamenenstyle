import {expect,it} from 'vitest';
import {validateStaticPosePackage} from '../src/avatar-static-pose';

export function staticFixture(){
 const assets=['stand','sit','read','hold'].map((id,i)=>({id,sha256:String(i+1).repeat(64),mimeType:'image/png',width:1774,height:887,byteSize:100}));
 return {schemaVersion:'static-poses.v1',sourceImageSha256:'a'.repeat(64),assets,poses:assets.map(a=>({id:a.id,frames:Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map((e,i)=>[e,{assetId:a.id,region:{x:i*340,y:0,width:340,height:887}}]))}))};
}
it('SEF-UT-536 static: every pose/emotion is complete and bounded before a package can be published',()=>{
 expect(validateStaticPosePackage(staticFixture()).poses).toHaveLength(4);
 for(const damage of ['missing-pose','missing-emotion','foreign-asset','bad-region','duplicate','unused-asset','duplicate-hash','same-frame']){
  const p:any=staticFixture();
  if(damage==='missing-pose')p.poses.pop();
  if(damage==='missing-emotion')delete p.poses[3].frames.concerned;
  if(damage==='foreign-asset')p.poses[3].frames.concerned.assetId='unknown';
  if(damage==='bad-region')p.poses[3].frames.concerned.region.x=1770;
  if(damage==='duplicate')p.assets[3].id='read';
  if(damage==='unused-asset')p.assets.push({...p.assets[0],id:'unused'});
  if(damage==='duplicate-hash')p.assets[3].sha256=p.assets[0].sha256;
  if(damage==='same-frame')p.poses[3].frames.concerned=p.poses[3].frames.neutral;
  expect(()=>validateStaticPosePackage(p),damage).toThrow();
 }
});
