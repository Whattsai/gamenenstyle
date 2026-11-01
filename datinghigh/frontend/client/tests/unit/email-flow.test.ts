import {it,expect} from 'vitest';
import {FlowStore,type EmailFlow} from '../../src/flow';
const valid:EmailFlow={challengeId:'019a281e-0000-7000-8000-000000000001',flowToken:'a'.repeat(43),purpose:'register_email',emailMasked:'r***@example.com',expiresAt:'2026-10-29T00:10:00Z',absoluteExpiresAt:'2026-10-29T00:30:00Z',resendAfter:'2026-10-29T00:01:00Z'};
it('PF-UT-090 PF-UT-104 invalid, expired and untrusted email flow metadata is cleared',async()=>{
 let value:string|null=null;const store=new FlowStore({get:async()=>value,set:async(_,v)=>{value=v;},remove:async()=>{value=null;}},()=>Date.parse('2026-10-29T00:00:00Z'));
 for(const change of [{absoluteExpiresAt:'invalid'},{absoluteExpiresAt:'2026-10-28T00:00:00Z'},{challengeId:'../x'},{flowToken:'short'},{purpose:'google'},{expiresAt:42},{resendAfter:'invalid'}]){
  value=JSON.stringify({...valid,...change});expect(await store.read()).toBeNull();expect(value).toBeNull();
 }
 await store.save({...valid,password:'must not persist',code:'000001'} as EmailFlow);expect(value).not.toContain('must not persist');expect(JSON.parse(value!)).not.toHaveProperty('code');expect(await store.read()).toEqual(valid);
});
