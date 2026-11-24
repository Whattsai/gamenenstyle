import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
import {beginAvatarAdoption,avatarAdoptionStatus,acquireAvatarExpression,publishAvatarExpression,readyAvatarAdoption,failAvatarExpression,cancelAvatarAdoption} from '../src/avatar-adoption';
import {publishAvatarPose,reviewAvatarPoses} from '../src/avatar-pose-adoption';
import {expressionIds} from '../src/avatar-expression-manifest';
import catalog from '../../contracts/builtin-static-poses.json';
let mf:Miniflare,bucket:R2Bucket;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,now=1800000000000,owner=id(1),workflow=id(4);
const input=()=>({ownerAccountId:owner,assetId:id(2),attemptId:id(3),index:1,requestId:workflow,expectedRevision:1,sourceImageSha256:'a'.repeat(64),expiresAt:now+3600000,generatorModel:'fixture',promptVersion:'static.v1',staticRequired:true});
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',r2Buckets:{FILES:'static-adoption'}}));bucket=await mf.getR2Bucket('FILES') as unknown as R2Bucket;});
beforeEach(async()=>{const p=await bucket.list();if(p.objects.length)await bucket.delete(p.objects.map(o=>o.key));});
afterAll(async()=>{await mf?.dispose();});
async function expressions(){await beginAvatarAdoption(bucket,input(),now);for(const [n,e]of expressionIds.entries()){const lease=await acquireAvatarExpression(bucket,owner,workflow,e,id(10+n),now);await publishAvatarExpression(bucket,owner,workflow,e,id(10+n),lease.lease!,new Uint8Array([1,2,n]),{width:768,height:1024},now);}}
const bytes=(pose:string)=>{const a=catalog.packs['female-01'].assets.find(a=>a.id===pose)!;return new Uint8Array(readFileSync(new URL(`../../frontend/client/public/avatars/static-poses.v1/female-01/${a.sha256}.png`,import.meta.url)));};
it('cancelling after a lost progress reply first recovers the stored sheet so resuming never regenerates it',async()=>{
 await expressions();const lease=await acquireAvatarExpression(bucket,owner,workflow,'pose-stand',id(30),now);let dropped=false;
 const faulty=new Proxy(bucket,{get(target,key){if(key==='put')return async(name:string,value:any,options:any)=>{if(!dropped&&name.endsWith('/temp/adoption')&&typeof value==='string'&&JSON.parse(value).poseSheets?.stand){dropped=true;throw new Error('controlled progress failure');}return target.put(name,value,options);};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 await expect(publishAvatarPose(faulty,owner,workflow,'stand',id(30),lease.lease!,bytes('stand'),now)).rejects.toThrow();
 await cancelAvatarAdoption(bucket,owner,workflow,now+120001);
 const resumed=await beginAvatarAdoption(bucket,{...input(),requestId:id(5)},now+120001);
 expect(resumed.completedPoses).toEqual(['stand']);
 expect((await acquireAvatarExpression(bucket,owner,id(5),'pose-stand',id(31),now+120001)).completed).toBe(true);
});
it('a lost temporary-sheet cleanup is retried from ready status without retaining duplicate PNGs or generating again',async()=>{
 await expressions();let rejected=false;
 const faulty=new Proxy(bucket,{get(target,key){if(key==='delete')return async(names:string|string[])=>{if(!rejected&&Array.isArray(names)&&names.some(n=>n.endsWith('/pose-stand.png'))){rejected=true;throw new Error('controlled cleanup failure');}return target.delete(names);};const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 for(const [n,pose]of ['stand','sit','read','hold'].entries()){
  const lease=await acquireAvatarExpression(faulty,owner,workflow,`pose-${pose}` as any,id(30+n),now),write=publishAvatarPose(faulty,owner,workflow,pose as any,id(30+n),lease.lease!,bytes(pose),now);
  if(pose==='hold')await expect(write).rejects.toThrow('controlled cleanup failure');else await write;
 }
 expect((await avatarAdoptionStatus(faulty,owner,now))?.status).toBe('ready');
 expect((await bucket.list()).objects.filter(o=>/\/pose-(stand|sit|read|hold)\.png$/.test(o.key))).toHaveLength(0);
 expect((await acquireAvatarExpression(bucket,owner,workflow,'pose-hold',id(60),now)).completed).toBe(true);
});
it('static cancel/resume preserves completed poses, rejects a late callback and never turns five expressions into ready',async()=>{
 await expressions();const stand=await acquireAvatarExpression(bucket,owner,workflow,'pose-stand',id(30),now);
 await publishAvatarPose(bucket,owner,workflow,'stand',id(30),stand.lease!,bytes('stand'),now);
 const sit=await acquireAvatarExpression(bucket,owner,workflow,'pose-sit',id(31),now);
 await expect(cancelAvatarAdoption(bucket,owner,workflow,now)).rejects.toThrow();
 await failAvatarExpression(bucket,owner,workflow,id(31),sit.lease!,true);
 await expect(acquireAvatarExpression(bucket,owner,workflow,'pose-sit',id(32),now)).rejects.toThrow('AVATAR_EXPRESSION_UNCERTAIN');
 await cancelAvatarAdoption(bucket,owner,workflow,now);
 const next=id(5),progress=await beginAvatarAdoption(bucket,{...input(),requestId:next},now);
 expect(progress.status).toBe('building');expect(progress.completed).toHaveLength(5);expect(progress.completedPoses).toEqual(['stand']);
 await expect(publishAvatarPose(bucket,owner,workflow,'sit',id(31),sit.lease!,bytes('sit'),now)).rejects.toThrow();
 expect((await acquireAvatarExpression(bucket,owner,next,'pose-stand',id(33),now)).completed).toBe(true);
 const retry=await acquireAvatarExpression(bucket,owner,next,'pose-sit',id(34),now);
 await publishAvatarPose(bucket,owner,next,'sit',id(34),retry.lease!,bytes('sit'),now);
 expect((await avatarAdoptionStatus(bucket,owner,now))?.completedPoses).toEqual(['stand','sit']);
 await expect(acquireAvatarExpression(bucket,owner,next,'pose-read',id(35),now+3600001)).rejects.toThrow('AVATAR_CANDIDATE_EXPIRED');
});
it('SEF-IT-149 static: five expressions cannot adopt; one pose lease wins, all four sheets plus exact user review are required',async()=>{
 await expressions();expect((await avatarAdoptionStatus(bucket,owner,now))?.status).toBe('building');
 await expect(readyAvatarAdoption(bucket,owner,workflow,now)).rejects.toThrow();
 for(const [n,pose]of ['stand','sit','read','hold'].entries()){
  const step=`pose-${pose}` as any,request=id(30+n),lease=await acquireAvatarExpression(bucket,owner,workflow,step,request,now);
  await expect(acquireAvatarExpression(bucket,owner,workflow,step,id(70+n),now)).rejects.toThrow();
  await publishAvatarPose(bucket,owner,workflow,pose as any,request,lease.lease!,bytes(pose),now);
  expect((await acquireAvatarExpression(bucket,owner,workflow,step,id(80+n),now)).completed).toBe(true);
 }
 const p:any=await avatarAdoptionStatus(bucket,owner,now);expect(p.status).toBe('ready');expect(p.completedPoses).toHaveLength(4);
 expect(JSON.stringify(p)).not.toMatch(/objectKey|sourceImageSha256|ownerAccountId/);
 await expect(readyAvatarAdoption(bucket,owner,workflow,now)).rejects.toThrow();
 await expect(reviewAvatarPoses(bucket,owner,workflow,'f'.repeat(64),now)).rejects.toThrow();
 await reviewAvatarPoses(bucket,owner,workflow,p.staticPosePackage.packageVersion,now);
 expect((await readyAvatarAdoption(bucket,owner,workflow,now)).state.status).toBe('ready');
});
it('SEF-IT-150 static: stored pose survives a lost progress write and retry never obtains a second provider lease',async()=>{
 await expressions();const lease=await acquireAvatarExpression(bucket,owner,workflow,'pose-stand' as any,id(30),now);let dropped=false;
 const faulty=new Proxy(bucket,{get(target,key){if(key==='put')return async(name:string,value:any,options:any)=>{if(!dropped&&name.endsWith('/temp/adoption')&&typeof value==='string'&&JSON.parse(value).poseSheets?.stand){dropped=true;throw new Error('controlled progress write failure');}return target.put(name,value,options);};const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
 await expect(publishAvatarPose(faulty,owner,workflow,'stand',id(30),lease.lease!,bytes('stand'),now)).rejects.toThrow();
 await failAvatarExpression(bucket,owner,workflow,id(30),lease.lease!,true);
 expect((await avatarAdoptionStatus(bucket,owner,now))?.completedPoses).toEqual(['stand']);
 expect((await acquireAvatarExpression(bucket,owner,workflow,'pose-stand' as any,id(31),now)).completed).toBe(true);
});
it('a second pose cannot reuse the same PNG and a corrupt published sheet cannot pass review',async()=>{
 await expressions();let lease=await acquireAvatarExpression(bucket,owner,workflow,'pose-stand' as any,id(30),now);
 await publishAvatarPose(bucket,owner,workflow,'stand',id(30),lease.lease!,bytes('stand'),now);
 lease=await acquireAvatarExpression(bucket,owner,workflow,'pose-sit' as any,id(31),now);
 await expect(publishAvatarPose(bucket,owner,workflow,'sit',id(31),lease.lease!,bytes('stand'),now)).rejects.toThrow();
 expect((await avatarAdoptionStatus(bucket,owner,now))?.completedPoses).toEqual(['stand']);
 await publishAvatarPose(bucket,owner,workflow,'sit',id(31),lease.lease!,bytes('sit'),now);
 for(const [n,pose]of ['read','hold'].entries()){const step=await acquireAvatarExpression(bucket,owner,workflow,`pose-${pose}` as any,id(32+n),now);await publishAvatarPose(bucket,owner,workflow,pose as any,id(32+n),step.lease!,bytes(pose),now);}
 const p:any=await avatarAdoptionStatus(bucket,owner,now),asset=p.staticPosePackage.assets[0];
 const corrupt=bytes('stand');corrupt[corrupt.length-1]^=1;
 await bucket.put(`private/${owner}/avatar/${id(2)}/static-poses/v1/${'a'.repeat(64)}/${asset.sha256}.png`,corrupt,{httpMetadata:{contentType:'image/png'}});
 await expect(reviewAvatarPoses(bucket,owner,workflow,p.staticPosePackage.packageVersion,now)).rejects.toThrow();
});
