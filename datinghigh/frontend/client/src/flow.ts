import type {CredentialStore} from './api';
export interface EmailFlow {challengeId:string;flowToken:string;expiresAt:string;absoluteExpiresAt:string;resendAfter:string;emailMasked:string;purpose:'register_email'|'reset_password';deliveryFailed?:boolean}
export class FlowStore{
 constructor(private storage:CredentialStore,private now:()=>number){}
 async read():Promise<EmailFlow|null>{
  const raw=await this.storage.get('email-flow');if(!raw)return null;
  try{
   const f=JSON.parse(raw);
   const times=['expiresAt','absoluteExpiresAt','resendAfter'].map(k=>typeof f?.[k]==='string'?Date.parse(f[k]):NaN);
   if(!f||typeof f!=='object'||! /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(f.challengeId)||!/^[-_A-Za-z0-9]{43}$/.test(f.flowToken)||!['register_email','reset_password'].includes(f.purpose)||typeof f.emailMasked!=='string'||f.emailMasked.length>254||times.some(t=>!Number.isFinite(t))||times[1]<=this.now()||times[0]>times[1]||times[2]>times[1]){await this.clear();return null;}
   const {challengeId,flowToken,expiresAt,absoluteExpiresAt,resendAfter,emailMasked,purpose}=f;return {challengeId,flowToken,expiresAt,absoluteExpiresAt,resendAfter,emailMasked,purpose,...(f.deliveryFailed===true?{deliveryFailed:true}:{})};
  }catch{await this.clear();return null;}
 }
 async save(flow:EmailFlow){const {challengeId,flowToken,expiresAt,absoluteExpiresAt,resendAfter,emailMasked,purpose,deliveryFailed}=flow;await this.storage.set('email-flow',JSON.stringify({challengeId,flowToken,expiresAt,absoluteExpiresAt,resendAfter,emailMasked,purpose,...(deliveryFailed===true?{deliveryFailed:true}:{})}));}
 async clear(){await this.storage.remove('email-flow');}
}
