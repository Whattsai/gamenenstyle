import {it,expect,vi} from 'vitest';
import {produceAvatarExpressions,expressionIds,type AvatarAdoptionProgress} from '../../src/avatar-adoption';
const base:AvatarAdoptionProgress={assetId:'asset',attemptId:'attempt',index:1,clientRequestId:'workflow',status:'building',completed:[],currentExpression:null,uncertain:false,expiresAt:9999999999999};
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
