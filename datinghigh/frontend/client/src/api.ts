export interface CredentialStore {get(key:string):Promise<string|null>;set(key:string,value:string):Promise<void>;remove(key:string):Promise<void>}
export type ClientPlatform='web'|'ios'|'android';
export class ApiFailure extends Error{
 recovery?:Record<string,unknown>;
 constructor(public code:string,public status=0,public traceId?:string,public retryAfter=0,public uncertain=false){super(code);}
}
export interface SessionResponse {account?:Account;session:{sessionId:string};tokens?:{accessToken?:string;refreshToken?:string};[key:string]:unknown}
export interface Account {accountId:string;email:string;emailVerified:boolean;hasLocalPassword:boolean;linkedProviders:string[];createdAt:string}

// 無全域持久 token；一個 client 執行個體只進行一次 refresh。
export class ApiClient {
 access?:string;sessionId?:string;account?:Account;pendingRevoke=false;
 private refreshing?:Promise<void>;private readonly credentialWrites=new Set<Promise<void>>();private cold=true;
 private pendingMarker?:{sessionId?:string;refreshToken?:string};
 private serverAnchor=Date.now();private monotonicAnchor=performance.now();
 onChange:()=>void=()=>{};
 constructor(public origin:string,public platform:ClientPlatform,private store:CredentialStore,private fetcher:typeof fetch=fetch){}
 get serverNow(){return this.serverAnchor+performance.now()-this.monotonicAnchor;}
 private async raw(path:string,method='GET',body?:Record<string,unknown>|Blob){
  const requestedSession=this.sessionId,requestedPendingRevoke=this.pendingRevoke;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),path==='/me/avatar/generations'?110000:this.cold?45000:30000);this.cold=false;
  try{
   const headers:Record<string,string>={'X-DatingHigh-Client':this.platform};
   const photo=path==='/me/photos'&&method==='POST'&&body instanceof Blob;
   if(method!=='GET')headers['Content-Type']=photo?body.type:'application/json';
   if(this.platform!=='web'&&this.access)headers.Authorization=`Bearer ${this.access}`;
   const response=await this.fetcher.call(globalThis,`${this.origin}/api/v1${path}`,{method,headers,credentials:this.platform==='web'?'include':'omit',body:photo?body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
   const intentionalLogin=method==='POST'&&['/accounts','/sessions','/sessions/external/google'].includes(path)&&response.ok;
   if(requestedPendingRevoke!==this.pendingRevoke||requestedSession!==this.sessionId&&!intentionalLogin)throw new ApiFailure('REQUEST_SUPERSEDED');
   const date=Date.parse(response.headers.get('Date')??'');if(Number.isFinite(date)){this.serverAnchor=date;this.monotonicAnchor=performance.now();}
   const sid=response.headers.get('X-DatingHigh-Session');
   if(sid&&this.sessionId&&sid!==this.sessionId&&!intentionalLogin){await this.forget();throw new ApiFailure('SESSION_CHANGED',401);}
   const text=await response.text();if(requestedPendingRevoke!==this.pendingRevoke||requestedSession!==this.sessionId&&!intentionalLogin)throw new ApiFailure('REQUEST_SUPERSEDED');let data:any;
   try{data=text?JSON.parse(text):undefined;}catch{throw new ApiFailure('SERVICE_UNAVAILABLE',503);}
   if(!response.ok){const e=new ApiFailure(data?.code??'SERVICE_UNAVAILABLE',response.status,data?.traceId,Number(response.headers.get('Retry-After'))||0);if(e.code==='EMAIL_DELIVERY_FAILED'&&response.status===503)e.recovery=data?.recovery;if(['SESSION_REVOKED','ACCESS_TOKEN_INVALID','REFRESH_TOKEN_REUSE'].includes(e.code)){await this.forget();}throw e;}
   return data;
  }catch(e){if(e instanceof ApiFailure)throw e;throw new ApiFailure('NETWORK_ERROR',0,undefined,0,method!=='GET');}
  finally{clearTimeout(timeout);}
 }
 async request(path:string,method='GET',body?:Record<string,unknown>|Blob):Promise<any>{
  if(this.pendingRevoke&&method!=='GET')throw new ApiFailure('LOGOUT_PENDING',401);
  let refreshed=false,readRetried=false;
  for(;;){
   try{return await this.raw(path,method,body);}
   catch(e){
    if(!(e instanceof ApiFailure))throw e;
    if(e.code==='REQUEST_SUPERSEDED')throw e;
    if(!refreshed&&['ACCESS_TOKEN_MISSING','ACCESS_TOKEN_EXPIRED'].includes(e.code)&&path!=='/session/refresh'){
     refreshed=true;await this.refresh();continue;
    }
    if(method==='GET'&&!readRetried&&(e.status===0||e.status>=500)){readRetried=true;continue;}
    if(refreshed&&e.status===401&&['ACCESS_TOKEN_MISSING','ACCESS_TOKEN_EXPIRED'].includes(e.code))await this.forget();
    throw e;
   }
  }
 }
 async uploadPhoto(photo:Blob){
  if(photo.size>8*1024*1024)throw new ApiFailure('IMAGE_TOO_LARGE',413);
  if(!photo.size||!['image/jpeg','image/png','image/webp'].includes(photo.type))throw new ApiFailure('INVALID_IMAGE',400);
  return this.request('/me/photos','POST',photo);
 }
 async confirmExternalLogin(previousSessionId?:string){
  if(this.pendingRevoke)throw new ApiFailure('LOGOUT_PENDING',401);
  // 結果不明的登入只讀重驗；已有 family 時仍遵守 header 比對，不能採用其他分頁的新登入。
  const current=await this.request('/session');
  if(!current?.account?.accountId||!current?.session?.sessionId||previousSessionId&&current.session.sessionId===previousSessionId)throw new ApiFailure('NETWORK_ERROR',0,undefined,0,true);
  return current;
 }
 async accept(result:SessionResponse){
  if(this.pendingRevoke)throw new ApiFailure('REQUEST_SUPERSEDED');
  if(this.platform!=='web'){
   if(!result.tokens?.refreshToken||!result.tokens.accessToken)throw new ApiFailure('INVALID_SESSION',401);
   let write:Promise<void>|undefined;try{write=this.store.set('refresh',JSON.stringify({refreshToken:result.tokens.refreshToken,sessionId:result.session.sessionId}));this.credentialWrites.add(write);await write;}
   catch{if(!this.pendingRevoke)await this.forget();throw new ApiFailure('SECURE_STORAGE_FAILED',401);}
   finally{if(write)this.credentialWrites.delete(write);}
   if(this.pendingRevoke)throw new ApiFailure('REQUEST_SUPERSEDED');
   this.access=result.tokens.accessToken;
  }
  this.sessionId=result.session.sessionId;this.account=result.account;this.onChange();
 }
 async forget(){this.access=undefined;this.sessionId=undefined;this.account=undefined;this.onChange();try{await this.store.remove('refresh');}catch{/* 安全儲存不可用時也必須立即清除私人畫面。 */}}
 private async rotate(){
  if(this.pendingRevoke)throw new ApiFailure('LOGOUT_PENDING',401);
  let refreshToken:string|undefined;
  if(this.platform!=='web'){
   const saved=await this.store.get('refresh');
   try{refreshToken=saved?JSON.parse(saved).refreshToken:undefined;}catch{await this.forget();}
   if(!refreshToken)throw new ApiFailure('ACCESS_TOKEN_MISSING',401);
  }
  const payload=()=>({clientPlatform:this.platform,...(this.platform==='web'?{}:{refreshToken})});
  let result;
  try{result=await this.raw('/session/refresh','POST',payload());}
  catch(e){
   if(this.platform==='web'&&e instanceof ApiFailure&&e.code==='NETWORK_ERROR'&&e.uncertain){
    try{
     let confirmed:SessionResponse|undefined;
     try{confirmed=await this.raw('/session');}
     catch(check){if(check instanceof ApiFailure&&['ACCESS_TOKEN_MISSING','ACCESS_TOKEN_EXPIRED'].includes(check.code))result=await this.raw('/session/refresh','POST',payload());else throw check;}
     if(confirmed){if(!confirmed.session?.sessionId||!confirmed.account?.accountId||this.sessionId&&confirmed.session.sessionId!==this.sessionId)throw new ApiFailure('SESSION_CHANGED',401);await this.accept(confirmed);return;}
    }catch(recoveryError){await this.forget();throw recoveryError;}
   }else if(e instanceof ApiFailure&&e.code==='REFRESH_RETRY'){
    if(this.platform!=='web'){const saved=await this.store.get('refresh');refreshToken=saved?JSON.parse(saved).refreshToken:undefined;}
    try{result=await this.raw('/session/refresh','POST',payload());}catch(retryError){await this.forget();throw retryError;}
   }else{await this.forget();throw e;}
  }
  await this.accept(result);
 }
 async refresh(){
  if(!this.refreshing)this.refreshing=this.rotate().finally(()=>{this.refreshing=undefined;});
  return this.refreshing;
 }
 async restore(){
  const pending=await this.store.get('pending-revoke');
  if(pending){this.pendingRevoke=true;return await this.retryLogout()?'logged-out':'session-changed';}
  try{
   if(this.platform!=='web')await this.refresh();
   const requestedSession=this.sessionId,result=await this.request('/session');if(this.pendingRevoke||requestedSession!==this.sessionId)return;this.sessionId=result.session.sessionId;this.account=result.account;this.onChange();
  }catch(e){if(e instanceof ApiFailure&&e.code==='REQUEST_SUPERSEDED')return;await this.forget();throw e;}
 }
 async foreground(){
  if(this.pendingRevoke)return;
  const requestedSession=this.sessionId;
  if(requestedSession){try{const current=await this.request('/session');if(this.pendingRevoke||requestedSession!==this.sessionId)return;this.account=current.account;this.onChange();}catch(e){if(this.pendingRevoke||this.sessionId&&requestedSession!==this.sessionId||e instanceof ApiFailure&&e.code==='REQUEST_SUPERSEDED')return;if(e instanceof ApiFailure&&e.status===401)await this.forget();throw e;}}
 }
 private async waitForCredentialWrites(){
  if(!this.credentialWrites.size)return;let timer:ReturnType<typeof setTimeout>|undefined;
  try{await Promise.race([Promise.allSettled([...this.credentialWrites]),new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>reject(new ApiFailure('LOGOUT_PENDING')),30000);})]);}finally{if(timer)clearTimeout(timer);}
 }
 private async preserveNewerNativeFamily(){await this.store.remove('pending-revoke');this.pendingRevoke=false;this.pendingMarker=undefined;this.access=undefined;this.sessionId=undefined;this.account=undefined;this.onChange();return false;}
 async logout(){
  this.pendingRevoke=true;
  // 私人畫面立刻隱藏，尚未確認撤銷時仍保留原 refresh 供重試。
  this.account=undefined;this.onChange();
  try{
   const saved=this.platform==='web'?null:await this.store.get('refresh');
   const prior=saved?JSON.parse(saved):undefined;if(this.platform!=='web'&&this.sessionId&&prior?.sessionId&&prior.sessionId!==this.sessionId)return await this.preserveNewerNativeFamily();let marker={sessionId:this.sessionId??prior?.sessionId,refreshToken:prior?.refreshToken};this.pendingMarker=marker;
   await this.store.set('pending-revoke',JSON.stringify(marker));
   await this.waitForCredentialWrites();
   if(this.platform!=='web'){const latest=await this.store.get('refresh');const current=latest?JSON.parse(latest):undefined;if(current?.sessionId&&marker.sessionId&&current.sessionId!==marker.sessionId)return await this.preserveNewerNativeFamily();if(current?.sessionId===marker.sessionId&&current?.refreshToken&&current.refreshToken!==marker.refreshToken){marker={...marker,refreshToken:current.refreshToken};this.pendingMarker=marker;await this.store.set('pending-revoke',JSON.stringify(marker));}}
   return await this.revokeLogout(marker);}
  catch(e){this.access=undefined;this.sessionId=undefined;this.account=undefined;this.onChange();throw e;}
 }
 async retryLogout(){
  const saved=await this.store.get('pending-revoke');const marker=this.pendingMarker??(saved?JSON.parse(saved):undefined);if(!marker){if(this.pendingRevoke)throw new ApiFailure('LOGOUT_PENDING',401);return true;}
  await this.waitForCredentialWrites();
  if(this.platform!=='web'){const stored=await this.store.get('refresh'),current=stored?JSON.parse(stored):undefined;if(current?.sessionId&&marker.sessionId&&current.sessionId!==marker.sessionId)return await this.preserveNewerNativeFamily();}
  return await this.revokeLogout(marker);
 }
 private async revokeLogout(marker:{sessionId?:string;refreshToken?:string}){
  if(this.platform==='web'&&!marker.sessionId)throw new ApiFailure('LOGOUT_PENDING',401);
  let confirmed=true;
  try{await this.raw('/session','DELETE',this.platform==='web'?{sessionId:marker.sessionId}:{refreshToken:marker.refreshToken});}
  catch(e){if(!(this.platform==='web'&&e instanceof ApiFailure&&e.status===409&&e.code==='SESSION_CHANGED'))throw e;confirmed=false;}
  await this.store.remove('pending-revoke');this.pendingRevoke=false;this.pendingMarker=undefined;await this.forget();
  return confirmed;
 }
}
