import {it,expect,vi} from 'vitest';
import {produceAvatarExpressions,confirmStaticAvatarAdoption,expressionIds,type AvatarAdoptionProgress} from '../../src/avatar-adoption';
import catalog from '../../../../contracts/builtin-static-poses.json';
const base:AvatarAdoptionProgress={assetId:'asset',attemptId:'attempt',index:1,clientRequestId:'workflow',status:'building',completed:[],currentExpression:null,uncertain:false,expiresAt:9999999999999};
const readyStatic=()=>{const p=catalog.packs['female-01'];return {schemaVersion:p.schemaVersion,packageVersion:'c'.repeat(64),assets:p.assets.map(a=>({...a,url:`/api/v1/me/avatar/expressions/workflow/poses/${a.id}`})),poses:p.poses};};
it('static build resumes missing poses but never adopts until the person reviews the exact complete package',async()=>{
 const completedPoses=['stand','sit'],current:any={...base,staticRequired:true,completed:[...expressionIds],completedPoses};const steps:string[]=[];
 const request=vi.fn(async(path:string,_method:string,body:any)=>{
  if(path==='/me/avatar/expressions')return {adoption:current};
  if(path.endsWith('/next')){steps.push(body.expression);completedPoses.push(body.expression.slice(5));return {...current,status:completedPoses.length===4?'ready':'building',...(completedPoses.length===4?{staticPosePackage:readyStatic()}:{} )};}
  throw new Error('unexpected adoption before review');
 });
 expect(await produceAvatarExpressions({request},{attemptId:'attempt',index:1,expectedRevision:1},()=>true,vi.fn(),()=>String(steps.length),current)).toBeUndefined();
 expect(steps).toEqual(['pose-read','pose-hold']);expect(request.mock.calls.some(c=>c[0].endsWith('/selection'))).toBe(false);
});
it('saved AI pose confirmation commits through its pinned review without re-selecting with an obsolete revision',async()=>{
 const p:any={...base,savedSource:true,status:'ready',staticRequired:true,completed:[...expressionIds],completedPoses:['stand','sit','read','hold'],staticPosePackage:readyStatic()};
 const request=vi.fn(async()=>({status:'committed',revision:2}));await confirmStaticAvatarAdoption({request},{attemptId:'attempt',index:1,expectedRevision:1},p,()=>true);
 expect(request).toHaveBeenCalledTimes(1);
});
it('explicit static adoption reviews the pinned version then commits; leaving foreground prevents the commit',async()=>{
 const p:any={...base,status:'ready',staticRequired:true,completed:[...expressionIds],completedPoses:['stand','sit','read','hold'],staticPosePackage:readyStatic()};
 let active=true;const request=vi.fn(async()=>{active=false;return p;});
 await confirmStaticAvatarAdoption({request},{attemptId:'attempt',index:1,expectedRevision:1},p,()=>active);
 expect(request).toHaveBeenCalledExactlyOnceWith('/me/avatar/expressions/review','POST',{workflowId:'workflow',packageVersion:'c'.repeat(64)});
 active=true;const committed=vi.fn(async(_path:string,_method:string,_body?:unknown)=>({revision:2}));await confirmStaticAvatarAdoption({request:committed},{attemptId:'attempt',index:1,expectedRevision:1},p,()=>active);
 expect(committed.mock.calls.map(c=>c[0])).toEqual(['/me/avatar/expressions/review','/me/avatar/selection']);
});
it('B1 runs one awaited expression at a time and publishes the selection only after all five are confirmed ready',async()=>{
 const calls:string[]=[],steps:string[]=[];let resolve:(v:any)=>void=()=>{};
 const request=vi.fn(async(path:string,_method:string,body:any)=>{
  calls.push(path);
  if(path.endsWith('/begin'))return {...base};
  if(path.endsWith('/next')){steps.push(body.expression);if(steps.length===1)return await new Promise(r=>resolve=r);return {...base,status:steps.length===5?'ready':'building',completed:[...steps]};}
  return {revision:2};
 });
 const running=produceAvatarExpressions({request},{attemptId:'attempt',index:1,expectedRevision:1},()=>true,vi.fn(),()=>`request-${calls.length}`);
 await vi.waitFor(()=>expect(steps).toEqual(['neutral']));expect(calls.some(p=>p.endsWith('/selection'))).toBe(false);
 resolve({...base,completed:['neutral']});await running;
 expect(steps).toEqual(expressionIds);expect(calls.at(-1)).toBe('/me/avatar/selection');
});
it('B1 resumes only missing expressions and never recreates two completed images',async()=>{
 const progress={...base,completed:['neutral','smile'] as AvatarAdoptionProgress['completed']};
 const calls:string[]=[];const request=vi.fn(async(path:string,_method:string,body:any)=>{
  if(path==='/me/avatar/expressions')return {adoption:progress};
  if(path.endsWith('/next')){calls.push(body.expression);progress.completed.push(body.expression);return {...progress,status:progress.completed.length===5?'ready':'building'};}
  return {revision:2};
 });
 await produceAvatarExpressions({request},{attemptId:'attempt',index:1,expectedRevision:1},()=>true,vi.fn(),()=>String(calls.length),base);
 expect(calls).toEqual(['surprised','thoughtful','concerned']);
 expect(request.mock.calls[0]).toEqual(['/me/avatar/expressions','GET']);
});
it('leaving the foreground stops new expression calls and never changes the selected avatar',async()=>{
 let active=true;const request=vi.fn(async(path:string)=>{if(path.endsWith('/begin'))return {...base};active=false;return {...base,completed:['neutral']};});
 await produceAvatarExpressions({request},{attemptId:'attempt',index:1,expectedRevision:1},()=>active,vi.fn(),()=>String(request.mock.calls.length));
 expect(request.mock.calls.map(c=>c[0])).toEqual(['/me/avatar/expressions/begin','/me/avatar/expressions/next']);
});
it('uncertain state or a failed step stops without automatic provider retry or final selection',async()=>{
 const request=vi.fn(async(path:string)=>{if(path.endsWith('/begin'))return {...base};throw new Error('provider result unknown');});
 await expect(produceAvatarExpressions({request},{attemptId:'attempt',index:1,expectedRevision:1},()=>true,vi.fn(),()=>String(request.mock.calls.length))).rejects.toThrow();
 expect(request.mock.calls).toHaveLength(2);
 const status=vi.fn(async()=>({adoption:{...base,uncertain:true}}));
 await expect(produceAvatarExpressions({request:status},{attemptId:'attempt',index:1,expectedRevision:1},()=>true,vi.fn(),()=>'',base)).rejects.toThrow();expect(status).toHaveBeenCalledTimes(1);
});
