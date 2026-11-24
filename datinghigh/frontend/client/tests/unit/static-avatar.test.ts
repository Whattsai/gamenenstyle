import {expect,it} from 'vitest';
import {parseStaticAvatar,staticAvatarRig} from '../../src/static-avatar';
const round='019a281e-0000-7000-8000-000000000050',version='a'.repeat(64);
function projection(){
 const assets=['stand','sit','read','hold'].map((id,i)=>({id,sha256:String(i+1).repeat(64),url:`/api/v1/game-rounds/${round}/my-avatar/${version}/static-${String(i+1).repeat(64)}`,mimeType:'image/png',width:1774,height:887,byteSize:100}));
 return {schemaVersion:'static-poses.v1',packageVersion:'b'.repeat(64),assets,poses:assets.map(a=>({id:a.id,frames:Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map((e,i)=>[e,{assetId:a.id,region:{x:i*340,y:0,width:340,height:887}}]))}))};
}
it('SEF-UT-541 static: arbitrary URLs, wrong channel and broken unselected frames fail closed',()=>{
 const value=projection();expect(parseStaticAvatar(value,round,'my-avatar',version)).toBeTruthy();
 for(const damage of ['url','channel','missing','region']){
  const p:any=projection();
  if(damage==='url')p.assets[0].url='https://foreign.example/image.png';
  if(damage==='channel')p.assets[0].url=p.assets[0].url.replace('my-avatar','partner-avatar');
  if(damage==='missing')delete p.poses[3].frames.concerned;
  if(damage==='region')p.poses[3].frames.concerned.region.x=1770;
  expect(()=>parseStaticAvatar(p,round,'my-avatar',version),damage).toThrow();
 }
});
it('SEF-UT-535 static: all twenty states resolve the exact approved complete frame with auth headers',()=>{
 const p=parseStaticAvatar(projection(),round,'my-avatar',version);
 for(const pose of p.poses)for(const expression of ['neutral','smile','surprised','thoughtful','concerned']as const){
  const rig=staticAvatarRig(p,pose.id,expression,'http://localhost:8787',{Authorization:'Bearer fixture'});
  expect(rig.assets.find(a=>a.id===pose.id)?.headers).toEqual({Authorization:'Bearer fixture'});
  expect(rig.layers[0].assetId).toBe(pose.id);
  expect(rig.layers[0].region).toEqual(pose.frames[expression].region);
  expect(rig.layers).toHaveLength(1);
 }
});
