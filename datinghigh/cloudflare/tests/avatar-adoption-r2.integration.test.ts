import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
import {beginAvatarAdoption,avatarAdoptionStatus,acquireAvatarExpression,publishAvatarExpression,assertAvatarSelectionUnlocked,failAvatarExpression,cancelAvatarAdoption,readyAvatarAdoption} from '../src/avatar-adoption';
import {expressionIds,avatarExpressionManifestKey} from '../src/avatar-expression-manifest';
let mf:Miniflare,bucket:R2Bucket;
const id=(n:number)=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,now=1800000000000,owner=id(1),workflow=id(4);
const input=()=>({ownerAccountId:owner,assetId:id(2),attemptId:id(3),index:1,requestId:workflow,expectedRevision:1,sourceImageSha256:'a'.repeat(64),expiresAt:now+3600000,generatorModel:'test-provider',promptVersion:'full-body-test.v1'});
const acquire=(expression:typeof expressionIds[number],request=10,retryUncertain=false,time=now)=>acquireAvatarExpression(bucket,owner,workflow,expression,id(request),time,retryUncertain);
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',r2Buckets:{FILES:'adoption-packs'}}));bucket=await mf.getR2Bucket('FILES') as unknown as R2Bucket;});
beforeEach(async()=>{const list=await bucket.list();if(list.objects.length)await bucket.delete(list.objects.map(o=>o.key));});
afterAll(async()=>{await mf?.dispose();});
it('SD-IT-066/069: one account-wide foreground adoption lock wins across clients and blocks switching',async()=>{
 const responses=await Promise.allSettled([beginAvatarAdoption(bucket,input(),now),beginAvatarAdoption(bucket,{...input(),assetId:id(20),requestId:id(40)},now)]);
 expect(responses.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 await expect(assertAvatarSelectionUnlocked(bucket,owner,now)).rejects.toMatchObject({code:'AVATAR_ADOPTION_IN_PROGRESS'});
 expect(await avatarAdoptionStatus(bucket,id(99),now)).toBeNull();
});
it('SD-IT-067: only five sequential confirmed expressions can become ready; an image replay returns the same receipt',async()=>{
 await beginAvatarAdoption(bucket,input(),now);
 await expect(readyAvatarAdoption(bucket,owner,workflow,now)).rejects.toMatchObject({code:'AVATAR_PACK_NOT_READY'});
 await expect(acquire('smile')).rejects.toMatchObject({code:'AVATAR_EXPRESSION_ORDER'});
 for(const [n,e] of expressionIds.entries()){
  const step=await acquire(e,10+n);expect(step.completed).toBe(false);
  await expect(acquire(e,30+n)).rejects.toMatchObject({code:'AVATAR_ADOPTION_IN_PROGRESS'});
  const bytes=new Uint8Array([1,2,n]);
  const progress=await publishAvatarExpression(bucket,owner,workflow,e,id(10+n),step.lease!,bytes,{width:768,height:1024},now);
  expect(progress.completed).toHaveLength(n+1);
  const replay=await acquire(e,10+n);expect(replay.completed).toBe(true);
  // Binary ACK 可能遺失；相同 lease／requestId／bytes 的重送只回已確認 receipt。
  expect(await publishAvatarExpression(bucket,owner,workflow,e,id(10+n),step.lease!,bytes,{width:768,height:1024},now)).toEqual(progress);
 }
 const ready=await readyAvatarAdoption(bucket,owner,workflow,now);expect(ready.state.status).toBe('ready');
 expect(await bucket.get(avatarExpressionManifestKey(owner,id(2)))).toBeTruthy();
});
it('SD-IT-068: uncertain provider calls require explicit retry; earlier confirmed expressions are reused',async()=>{
 await beginAvatarAdoption(bucket,input(),now);const step=await acquire('neutral');
 await failAvatarExpression(bucket,owner,workflow,id(10),step.lease!,true);
 await expect(acquire('neutral',11)).rejects.toMatchObject({code:'AVATAR_EXPRESSION_UNCERTAIN'});
 const retry=await acquire('neutral',11,true);expect(retry.completed).toBe(false);
 await publishAvatarExpression(bucket,owner,workflow,'neutral',id(11),retry.lease!,new Uint8Array([1]),{width:768,height:1024},now);
 expect((await acquire('neutral',12)).completed).toBe(true);
});
it('cancel or expiry releases the foreground lock and late provider bytes cannot publish',async()=>{
 await beginAvatarAdoption(bucket,input(),now);const step=await acquire('neutral');
 await expect(cancelAvatarAdoption(bucket,owner,workflow,now)).rejects.toThrow();
 await cancelAvatarAdoption(bucket,owner,workflow,now+120001);
 await expect(assertAvatarSelectionUnlocked(bucket,owner,now+120001)).resolves.toBeUndefined();
 await expect(publishAvatarExpression(bucket,owner,workflow,'neutral',id(10),step.lease!,new Uint8Array([1]),{width:768,height:1024},now+120001)).rejects.toThrow();
});
it('resuming the same cancelled candidate reuses successful images and the reserved asset ID at the new profile revision',async()=>{
 await beginAvatarAdoption(bucket,input(),now);const step=await acquire('neutral');
 await publishAvatarExpression(bucket,owner,workflow,'neutral',id(10),step.lease!,new Uint8Array([1]),{width:768,height:1024},now);
 await cancelAvatarAdoption(bucket,owner,workflow,now);
 const resumed=await beginAvatarAdoption(bucket,{...input(),assetId:id(99),requestId:id(44),expectedRevision:2},now);
 expect(resumed.assetId).toBe(id(2));expect(resumed.completed).toEqual(['neutral']);
 expect((await acquireAvatarExpression(bucket,owner,id(44),'neutral',id(12),now)).completed).toBe(true);
});
it.each(['status','failure-cleanup'])('SD-IT-068/073: stored expression with a lost state write recovers through %s without another provider lease',async(recovery)=>{
 await beginAvatarAdoption(bucket,input(),now);const step=await acquire('neutral');let dropped=false;
 const faulty=new Proxy(bucket,{get(target,key){
  if(key==='put')return async(name:string,value:any,options:any)=>{
   if(!dropped&&name.endsWith('/temp/adoption')&&typeof value==='string'&&JSON.parse(value).completed.neutral){dropped=true;throw new Error('controlled receipt storage failure');}
   return target.put(name,value,options);
  };
  const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;
 }});
 await expect(publishAvatarExpression(faulty,owner,workflow,'neutral',id(10),step.lease!,new Uint8Array([1,2,3]),{width:768,height:1024},now)).rejects.toThrow();
 expect(dropped).toBe(true);
 if(recovery==='failure-cleanup')await failAvatarExpression(bucket,owner,workflow,id(10),step.lease!,true);
 const recovered=await avatarAdoptionStatus(bucket,owner,now+1);
 expect(recovered?.completed).toEqual(['neutral']);expect(recovered?.uncertain).toBe(false);
 expect((await acquire('neutral',11)).completed).toBe(true);
 expect((await acquire('smile',12)).completed).toBe(false);
});
