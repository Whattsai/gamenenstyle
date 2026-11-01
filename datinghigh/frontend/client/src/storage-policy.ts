const id=/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const opaque=/^[A-Za-z0-9_-]{43}$/;
export function validateStoredValue(platform:string,key:string,value:string){
 const deny=()=>{throw new Error('Disallowed credential storage');};
 if(!['email-flow','pending-revoke','refresh'].includes(key)||platform==='web'&&key==='refresh'||value.length>4096)deny();
 let data:Record<string,unknown>;try{data=JSON.parse(value);}catch{return deny();}
 if(!data||typeof data!=='object'||Array.isArray(data))deny();
 const allowed=key==='email-flow'?['challengeId','flowToken','expiresAt','absoluteExpiresAt','resendAfter','emailMasked','purpose','deliveryFailed']:key==='refresh'?['refreshToken','sessionId']:platform==='web'?['sessionId']:['sessionId','refreshToken'];
 if(Object.keys(data).some(k=>!allowed.includes(k)))deny();
 if(key==='email-flow'){
  if(typeof data.challengeId!=='string'||!id.test(data.challengeId)||typeof data.flowToken!=='string'||!opaque.test(data.flowToken)||!['register_email','reset_password'].includes(data.purpose as string)||typeof data.emailMasked!=='string'||data.emailMasked.length>254||data.deliveryFailed!==undefined&&typeof data.deliveryFailed!=='boolean')deny();
  if(['expiresAt','absoluteExpiresAt','resendAfter'].some(k=>typeof data[k]!=='string'||!Number.isFinite(Date.parse(data[k] as string))))deny();
 }else{
  if(key==='refresh'&&(data.refreshToken===undefined||data.sessionId===undefined))deny();
  if(data.refreshToken!==undefined&&(typeof data.refreshToken!=='string'||!opaque.test(data.refreshToken)))deny();
  if(data.sessionId!==undefined&&(typeof data.sessionId!=='string'||!id.test(data.sessionId)))deny();
 }
}
