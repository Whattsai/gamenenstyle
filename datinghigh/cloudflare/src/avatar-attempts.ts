import {z} from 'zod';
import {executeCommand} from './commands';
import type {PlatformEnv} from './platform';

export class AvatarError extends Error{constructor(public code:string,public status=409){super(code);}}
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const authSchema=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().positive()});
type Auth=z.infer<typeof authSchema>;
const beginSchema=authSchema.extend({proposedAttemptId:id,attemptId:id.nullable(),clientRequestId:id,styleId:z.enum(['warm','moon','sakura','forest']),expectedProducedCount:z.number().int().min(0).max(4)});
const resultSchema=z.strictObject({clientRequestId:id,index:z.number().int().min(1).max(4),digest:z.string()});
const manifestSchema=z.strictObject({
 attemptId:id,styleId:z.string(),expiresAt:z.number().int(),sourceAssetIds:z.array(id).min(2).max(5),
 status:z.enum(['open','generating','uncertain','adopting','closed']),producedCount:z.number().int().min(0).max(4),
 operationId:id.nullable(),results:z.array(resultSchema).max(4),failedRequestIds:z.array(id).max(64),selectedIndex:z.number().int().min(1).max(4).nullable(),selectedAssetId:id.nullable().optional()
});
type Manifest=z.infer<typeof manifestSchema>;
const prefix=(auth:Auth)=>`private/${auth.accountId}/avatar/temp/`;
const manifestKey=(auth:Auth,attempt:string)=>prefix(auth)+attempt+'/manifest';
const candidateKey=(auth:Auth,attempt:string,index:number)=>prefix(auth)+attempt+'/'+index;
async function authorize(env:PlatformEnv,auth:Auth,now:number){
 if((await executeCommand(env.DB,'session.validate',auth,now)).rows.length!==1)throw new AvatarError('SESSION_REVOKED',401);
}
async function load(env:PlatformEnv,auth:Auth,attempt:string,now:number){
 const object=await env.FILES.get(manifestKey(auth,attempt));
 if(!object)throw new AvatarError('AVATAR_CANDIDATE_NOT_FOUND',404);
 const parsed=manifestSchema.safeParse(await object.json());
 if(!parsed.success||parsed.data.attemptId!==attempt)throw new AvatarError('STORAGE_UNAVAILABLE',503);
 if(parsed.data.expiresAt<=now)throw new AvatarError('AVATAR_CANDIDATE_EXPIRED',410);
 return {state:parsed.data,etag:object.etag};
}
async function sourcesReady(env:PlatformEnv,auth:Auth,sources:string[]){
 const row=await env.DB.prepare("SELECT COUNT(*) AS total FROM user_media_assets WHERE account_id=? AND kind='personal_photo' AND status='ready' AND deleted_at IS NULL AND asset_id IN(SELECT value FROM json_each(?))").bind(auth.accountId,JSON.stringify(sources)).first<{total:number}>();
 if(row?.total!==sources.length)throw new AvatarError('AVATAR_SOURCE_CHANGED');
}
async function cas(env:PlatformEnv,auth:Auth,state:Manifest,etag:string){
 const object=await env.FILES.put(manifestKey(auth,state.attemptId),JSON.stringify(state),{
  onlyIf:{etagMatches:etag},httpMetadata:{contentType:'application/json'},customMetadata:{expiresAt:String(state.expiresAt)}
 });
 if(!object)throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
 return object.etag;
}
async function ensureRoundSources(env:PlatformEnv,auth:Auth,current:{state:Manifest;etag:string}){
 try{await sourcesReady(env,auth,current.state.sourceAssetIds);}
 catch(error){
  if(error instanceof AvatarError&&error.code==='AVATAR_SOURCE_CHANGED'){
   // 刪除的來源使本輪失效；關閉後可明確重開，不以舊照片生成或採用，也不困住使用者一小時。
   const operation=current.state.operationId;
   if(operation&&!current.state.results.some(r=>r.clientRequestId===operation)&&!current.state.failedRequestIds.includes(operation)&&current.state.failedRequestIds.length<64)current.state.failedRequestIds.push(operation);
   current.state.status='closed';current.state.selectedIndex=null;current.state.operationId=null;
   await cas(env,auth,current.state,current.etag);
  }
  throw error;
 }
}
const dto=(state:Manifest,index:number)=>({attemptId:state.attemptId,index,producedCount:state.producedCount,maxCandidates:4,expiresAt:state.expiresAt});

/** 只修復已提交的採用receipt；不新增正式圖、不變更profile、不呼叫provider。 */
async function closeCommittedAdoption(env:PlatformEnv,auth:Auth,current:{state:Manifest;etag:string},now:number){
 if(current.state.status!=='adopting')return;
 const asset=current.state.selectedAssetId??current.state.attemptId;
 const saved=await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='ready'").bind(asset,auth.accountId).first();
 if(!saved)return;
 current.state.status='closed';
 try{current.etag=await cas(env,auth,current.state,current.etag);}catch(error){
  const actual=await load(env,auth,current.state.attemptId,now);
  if(actual.state.status!=='closed'||(actual.state.selectedAssetId??actual.state.attemptId)!==asset)throw error;
 }
}

/** 只有 Container 的固定內部命令能取得 lease；公開 API 永不回傳 ETag 或 source key。 */
export async function avatarCommand(command:string,payload:unknown,env:PlatformEnv,now:number):Promise<unknown>{
 const started=Date.now(),currentTime=()=>now+Math.max(0,Date.now()-started);
 if(command==='avatar.attempt.status'){
  const auth=authSchema.parse(payload);await authorize(env,auth,now);
  const pointer=await env.FILES.get(prefix(auth)+'active');if(!pointer)return {attempt:null};
  const active=z.strictObject({attemptId:id,expiresAt:z.number().int()}).parse(await pointer.json());
  if(active.expiresAt<=now)return {attempt:null};
  const current=await load(env,auth,active.attemptId,now);await closeCommittedAdoption(env,auth,current,now);const {state}=current;
  if(state.status==='closed')return {attempt:null};
  return {attempt:{attemptId:state.attemptId,styleId:state.styleId,status:state.status,producedCount:state.producedCount,maxCandidates:4,expiresAt:state.expiresAt}};
 }
 if(command==='avatar.attempt.begin'){
  const input=beginSchema.parse(payload);const auth=authSchema.parse(Object.fromEntries(Object.keys(authSchema.shape).map(k=>[k,(input as Record<string,unknown>)[k]])));
  await authorize(env,auth,now);
  let attempt=input.attemptId;
  if(!attempt){
   const activeKey=prefix(auth)+'active';let active=await env.FILES.get(activeKey);
   let replace=false;
   if(active){
    const pointer=z.strictObject({attemptId:id,expiresAt:z.number().int()}).parse(await active.json());
    if(pointer.expiresAt<=now)replace=true;
    else{
     const current=await load(env,auth,pointer.attemptId,now);
     await closeCommittedAdoption(env,auth,current,now);
     if(current.state.status==='closed'){
      if(current.state.results.some(r=>r.clientRequestId===input.clientRequestId)||current.state.failedRequestIds.includes(input.clientRequestId)||current.state.operationId===input.clientRequestId)
       throw new AvatarError('AVATAR_ATTEMPT_CLOSED');
      replace=true;
     }
     else if(current.state.results.some(r=>r.clientRequestId===input.clientRequestId)||current.state.operationId===input.clientRequestId)
      attempt=pointer.attemptId;
     else throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
    }
   }
   if(!attempt){
    if(input.expectedProducedCount!==0)throw new AvatarError('AVATAR_LIMIT_REACHED');
    const photos=(await executeCommand(env.DB,'profile.photo.list',auth,now)).rows;
    if(photos.length<2||photos.length>5)throw new AvatarError('AVATAR_PHOTOS_REQUIRED',400);
    attempt=input.proposedAttemptId;
    const pointer=await env.FILES.put(activeKey,JSON.stringify({attemptId:attempt,expiresAt:now+3600000}),{
     onlyIf:active&&replace?{etagMatches:active.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}
    });
    if(!pointer)throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
    const state:Manifest={attemptId:attempt,styleId:input.styleId,expiresAt:now+3600000,
    sourceAssetIds:photos.map(p=>id.parse((p as {asset_id:string}).asset_id)),status:'open',producedCount:0,operationId:null,results:[],failedRequestIds:[],selectedIndex:null,selectedAssetId:null};
    const created=await env.FILES.put(manifestKey(auth,attempt),JSON.stringify(state),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{expiresAt:String(state.expiresAt)}});
    if(!created)throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
   }
  }
  const current=await load(env,auth,attempt,now);const state=current.state;
  await closeCommittedAdoption(env,auth,current,now);
  if(state.status==='closed'||state.status==='adopting')throw new AvatarError('AVATAR_ATTEMPT_CLOSED');
  if(state.styleId!==input.styleId)throw new AvatarError('INVALID_AVATAR_SELECTION',400);
  const completed=state.results.find(r=>r.clientRequestId===input.clientRequestId);
  if(completed){
   if(input.expectedProducedCount!==completed.index-1)throw new AvatarError('INVALID_AVATAR_SELECTION',400);
   return {...dto(state,completed.index),completed:true};
  }
  if(state.status!=='open')throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
  if(state.failedRequestIds.includes(input.clientRequestId))throw new AvatarError('AVATAR_REQUEST_FAILED');
  if(state.producedCount>=4||state.producedCount!==input.expectedProducedCount)throw new AvatarError('AVATAR_LIMIT_REACHED');
  // 保留本輪全部失敗request去重，不能寫出超過schema界線的manifest而使既有候選失去可採用性。
  if(state.failedRequestIds.length>=64)throw new AvatarError('RATE_LIMITED',429);
  await ensureRoundSources(env,auth,current);
  state.status='generating';state.operationId=input.clientRequestId;
  const lease=await cas(env,auth,state,current.etag);
  return {...dto(state,state.producedCount+1),completed:false,sourceAssetIds:state.sourceAssetIds,lease};
 }
 if(command==='avatar.attempt.fail'){
  const input=authSchema.extend({attemptId:id,clientRequestId:id,lease:z.string().max(128),uncertain:z.boolean()}).parse(payload);
  const auth=authSchema.parse({accountId:input.accountId,sessionId:input.sessionId,cv:input.cv,accessExpiresAt:input.accessExpiresAt});
  // 只允許容器持有的server lease做失敗補償；不讀新照片、不產圖、不更新profile或正式asset。
  // 本操作開始時已驗Session，原access到期／family撤銷後仍須清理自己的in-flight，避免鎖住既有候選。
  const current=await load(env,auth,input.attemptId,now);
  if(current.etag!==input.lease||current.state.operationId!==input.clientRequestId||current.state.status!=='generating')
   throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
  await ensureRoundSources(env,auth,current);
  current.state.status=input.uncertain?'uncertain':'open';current.state.failedRequestIds.push(input.clientRequestId);
  await cas(env,auth,current.state,current.etag);return {acknowledged:true};
 }
 if(command==='avatar.attempt.select'){
  const input=authSchema.extend({attemptId:id,proposedAssetId:id,index:z.number().int().min(1).max(4),expectedRevision:z.number().int().positive()}).parse(payload);
  const auth=authSchema.parse({accountId:input.accountId,sessionId:input.sessionId,cv:input.cv,accessExpiresAt:input.accessExpiresAt});
  await authorize(env,auth,now);
  let current=await load(env,auth,input.attemptId,now);const state=current.state;
  const profile=async()=>((await executeCommand(env.DB,'profile.read',auth,now)).rows[0] as {selected_avatar_ref:string;revision:number}|undefined);
  if(state.status==='closed'){
   const row=await profile();
   const savedAsset=state.selectedAssetId??input.attemptId;
   if(state.selectedIndex===input.index&&row?.selected_avatar_ref===savedAsset)
    return {revision:row.revision,assetId:savedAsset};
   throw new AvatarError('AVATAR_ATTEMPT_CLOSED');
  }
  if(state.status==='generating'||state.status==='adopting'&&state.selectedIndex!==input.index)
   throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
  if(input.index>state.producedCount)throw new AvatarError('AVATAR_CANDIDATE_NOT_FOUND',404);
  await ensureRoundSources(env,auth,current);
  if(state.status!=='adopting'){
   state.status='adopting';state.selectedIndex=input.index;state.selectedAssetId=input.proposedAssetId;
   current.etag=await cas(env,auth,state,current.etag);
  }
  const assetId=state.selectedAssetId??input.attemptId;
  const key=`private/${auth.accountId}/avatar/${assetId}`;
  const adoption={...auth,assetId,expectedRevision:input.expectedRevision,sourceAssetIds:state.sourceAssetIds};
  try{
   let selected=await profile();
   if(selected?.selected_avatar_ref!==assetId){
    const reserved=await executeCommand(env.DB,'profile.avatar.reserve',adoption,currentTime());
    if(!reserved.rows.length){
     await authorize(env,auth,currentTime());
     const pending=await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='pending' AND deleted_at IS NULL").bind(assetId,auth.accountId).first();
     if(!pending)throw new AvatarError('PROFILE_VERSION_CONFLICT');
    }
    await authorize(env,auth,currentTime());
    const candidate=await env.FILES.get(candidateKey(auth,input.attemptId,input.index));
    if(!candidate||candidate.size<1||candidate.size>2000000||candidate.httpMetadata?.contentType!=='image/jpeg')throw new AvatarError('STORAGE_UNAVAILABLE',503);
    const stored=await env.FILES.put(key,candidate.body,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'image/jpeg'},customMetadata:{candidateIndex:String(input.index),orphanAfter:String(state.expiresAt+3600000)}});
    if(!stored){
     const existing=await env.FILES.head(key);
     if(existing?.customMetadata?.candidateIndex!==String(input.index))throw new AvatarError('STORAGE_UNAVAILABLE',503);
    }
    if(state.expiresAt<=currentTime())throw new AvatarError('AVATAR_CANDIDATE_EXPIRED',410);
    const result=await executeCommand(env.DB,'profile.avatar.adopt',adoption,currentTime());
    selected=await profile();
    if(selected?.selected_avatar_ref!==assetId){
     await authorize(env,auth,now);
     if(result.changes[0]===0)throw new AvatarError('PROFILE_VERSION_CONFLICT');
     throw new AvatarError('STORAGE_UNAVAILABLE',503);
    }
   }
   state.status='closed';
   // 若重送者已完成相同關閉，回同一份已提交的 receipt。
   try{await cas(env,auth,state,current.etag);}catch(error){
    const actual=await load(env,auth,input.attemptId,now);
    if(actual.state.status!=='closed'||actual.state.selectedIndex!==input.index)throw error;
   }
   return {revision:selected.revision,assetId};
  }catch(error){
   // D1 提交回覆不明時先讀正式資產；不可刪掉已提交、仍被使用的化身。
   // 先以D1原子pending→deleted封住尚未提交的並行者；ready不受補償影響。
   await executeCommand(env.DB,'profile.avatar.cancel-adoption',{...auth,assetId},currentTime());
   const saved=await env.DB.prepare("SELECT status FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar'").bind(assetId,auth.accountId).first<{status:string}>();
   if(saved?.status==='deleted'){
    await env.FILES.delete(key);state.status='open';state.selectedIndex=null;state.selectedAssetId=null;
    await cas(env,auth,state,current.etag).catch(()=>{});
   }else if(saved?.status==='ready'){
    // 提交回覆／manifest關閉回覆遺失：只讀已提交圖，不能刪除或重複寫入。
    const latest=await load(env,auth,input.attemptId,currentTime());
    if((latest.state.selectedAssetId??input.attemptId)===assetId&&latest.state.selectedIndex===input.index){
     latest.state.status='closed';
     await cas(env,auth,latest.state,latest.etag).catch(()=>{});
     const row=await profile();if(row?.selected_avatar_ref===assetId)return {revision:row.revision,assetId};
    }
   }
   throw error;
  }
 }
 throw new AvatarError('INVALID_REQUEST',400);
}

/** 單張候選 binary 串流；R2 CAS 是跨 Worker 唯一提交權，沒有 D1 Job／背景重送。 */
export async function avatarMedia(request:Request,env:PlatformEnv,now:number):Promise<Response>{
 const started=Date.now(),currentTime=()=>now+Math.max(0,Date.now()-started);
 const url=new URL(request.url);const parts=url.pathname.split('/');
 const attempt=id.parse(parts[4]);
 if(url.search||parts.length>6)throw new AvatarError('NOT_FOUND',404);
 const auth=authSchema.parse({
  accountId:request.headers.get('X-DatingHigh-Media-Account-Id'),sessionId:request.headers.get('X-DatingHigh-Media-Session-Id'),
  cv:Number(request.headers.get('X-DatingHigh-Media-Cv')),accessExpiresAt:Number(request.headers.get('X-DatingHigh-Media-Expires-At'))
 });
 await authorize(env,auth,currentTime());const current=await load(env,auth,attempt,currentTime());const state=current.state;
 if(request.method==='GET'&&parts.length===6){
  const index=Number(parts[5]);
  if(!Number.isInteger(index)||index<1||index>state.producedCount||state.status==='closed')throw new AvatarError('AVATAR_CANDIDATE_NOT_FOUND',404);
  const image=await env.FILES.get(candidateKey(auth,attempt,index));
  if(!image||image.size<1||image.size>2000000||image.httpMetadata?.contentType!=='image/jpeg')throw new AvatarError('STORAGE_UNAVAILABLE',503);
  await authorize(env,auth,currentTime());
  if((await load(env,auth,attempt,currentTime())).state.status==='closed')throw new AvatarError('AVATAR_ATTEMPT_CLOSED');
  return new Response(image.body,{headers:{'Content-Type':'image/jpeg','Content-Length':String(image.size),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(request.method!=='PUT'||parts.length!==5)throw new AvatarError('NOT_FOUND',404);
 const requestId=id.parse(request.headers.get('X-DatingHigh-Avatar-Request-Id'));
 if(state.status!=='generating'||state.operationId!==requestId||current.etag!==request.headers.get('If-Match'))
  throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
 if(request.headers.get('Content-Type')!=='image/jpeg')throw new AvatarError('INVALID_IMAGE',400);
 const reader=request.body?.getReader();if(!reader)throw new AvatarError('INVALID_IMAGE',400);
 const chunks:Uint8Array[]=[];let length=0;
 try{
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;
   if(length>2000000){await reader.cancel();throw new AvatarError('IMAGE_TOO_LARGE',413);}chunks.push(value);}
 }finally{reader.releaseLock();}
 if(!length)throw new AvatarError('INVALID_IMAGE',400);
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
 if(state.results.some(r=>r.digest===digest)){
  state.status='open';state.failedRequestIds.push(requestId);await cas(env,auth,state,current.etag);
  throw new AvatarError('AVATAR_DUPLICATE_IMAGE');
 }
 await authorize(env,auth,currentTime());await ensureRoundSources(env,auth,current);
 if(state.expiresAt<=currentTime())throw new AvatarError('AVATAR_CANDIDATE_EXPIRED',410);
 const index=state.producedCount+1,key=candidateKey(auth,attempt,index);
 const stored=await env.FILES.put(key,bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'image/jpeg'},customMetadata:{expiresAt:String(state.expiresAt)}});
 if(!stored)throw new AvatarError('AVATAR_GENERATION_IN_PROGRESS');
 try{
  await authorize(env,auth,currentTime());await ensureRoundSources(env,auth,current);
  if(state.expiresAt<=currentTime())throw new AvatarError('AVATAR_CANDIDATE_EXPIRED',410);
  state.status='open';state.operationId=null;state.producedCount=index;state.results.push({clientRequestId:requestId,index,digest});
  await cas(env,auth,state,current.etag);
 }catch(error){
  // CAS 回覆遺失可能已提交；不能把合法候選當孤兒刪掉。
  const confirmed=await load(env,auth,attempt,currentTime()).catch(()=>null);
  if(confirmed?.state.results.some(r=>r.clientRequestId===requestId&&r.digest===digest))
   return Response.json(dto(confirmed.state,index),{headers:{'Cache-Control':'no-store'}});
  if(confirmed)await env.FILES.delete(key);
  throw error;
 }
 return Response.json(dto(state,index),{headers:{'Cache-Control':'no-store'}});
}
