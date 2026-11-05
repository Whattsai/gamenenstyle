import {z} from 'zod';

const checkpointKey='_system/avatar-preferences/cleanup.json';
const stateSchema=z.strictObject({
 version:z.literal(1),photoCursor:z.string().max(36),r2Cursor:z.string().max(4096).optional(),
 pending:z.array(z.strictObject({key:z.string().max(256),expiresAt:z.string().max(24).optional(),orphanAfter:z.string().max(24).optional()})).max(100)
});
/** 私人媒體分段清理進度只存R2系統metadata；不建D1 job表，不存照片／憑證。 */
export async function cleanupMedia(env:{DB:D1Database;FILES:R2Bucket},now:number,started:number,budget:number){
 const previous=await env.FILES.get(checkpointKey);
 const state=previous?stateSchema.parse(await previous.json()):stateSchema.parse({version:1,photoCursor:'',pending:[]});
 let backlog=false;
 await env.DB.prepare("UPDATE user_media_assets SET status='deleted',deleted_at=? WHERE asset_id IN (SELECT asset_id FROM user_media_assets WHERE status='pending' AND created_at<=? LIMIT 1000)").bind(now,now-1800000).run();
 // Foundation、照片、候選各保留處理時間，舊tombstone不會每輪霸占開頭。
 while(Date.now()-started<budget*2/3){
  const batch=await env.DB.prepare("SELECT asset_id,account_id,object_key,kind FROM user_media_assets WHERE status='deleted' AND asset_id>? ORDER BY asset_id LIMIT 100").bind(state.photoCursor).all<{asset_id:string;account_id:string;object_key:string;kind:string}>();
  if(!batch.results.length){state.photoCursor='';break;}
  let complete=true;
  for(const item of batch.results){
   if(Date.now()-started>=budget*2/3){complete=false;backlog=true;break;}
   if(item.kind==='personal_photo'&&item.object_key===`private/${item.account_id}/photos/${item.asset_id}`)
    await env.FILES.delete(item.object_key);
   state.photoCursor=item.asset_id;
  }
  if(complete&&batch.results.length<100){state.photoCursor='';break;}
  if(!complete)break;
 }
 while(Date.now()-started<budget){
  if(!state.pending.length){
   const objects=await env.FILES.list({prefix:'private/',limit:100,include:['customMetadata'],...(state.r2Cursor?{cursor:state.r2Cursor}:{})});
   state.pending=objects.objects.map(object=>({key:object.key,...(object.customMetadata?.expiresAt?{expiresAt:object.customMetadata.expiresAt}:{}),...(object.customMetadata?.orphanAfter?{orphanAfter:object.customMetadata.orphanAfter}:{})}));
   state.r2Cursor=objects.truncated?objects.cursor:undefined;
   if(!state.pending.length)break;
  }
  while(state.pending.length&&Date.now()-started<budget){
   const object=state.pending[0];
   const temp=/^private\/[0-9a-f-]{36}\/avatar\/temp\/[0-9a-f-]{36}\/(manifest|[1-4])$/.test(object.key);
   const expiry=Number(object.expiresAt);
   if(temp&&expiry>0&&expiry<=now)await env.FILES.delete(object.key);
   const formal=/^private\/([0-9a-f-]{36})\/avatar\/([0-9a-f-]{36})$/.exec(object.key);
   const orphanAfter=Number(object.orphanAfter);
   if(formal&&orphanAfter>0&&orphanAfter<=now){
    const saved=await env.DB.prepare("SELECT asset_id FROM user_media_assets WHERE asset_id=? AND account_id=? AND kind='generated_avatar' AND status='ready' AND object_key=?").bind(formal[2],formal[1],object.key).first();
    if(!saved)await env.FILES.delete(object.key);
   }
   // 中途預算耗盡會保留尚未處理的頁面內容，下次不跳過亦不重掃第一頁。
   state.pending.shift();
  }
  if(state.pending.length){backlog=true;break;}
  if(!state.r2Cursor)break;
 }
 if(state.photoCursor||state.pending.length||state.r2Cursor)backlog=true;
 const saved=await env.FILES.put(checkpointKey,JSON.stringify(state),{onlyIf:previous?{etagMatches:previous.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 if(!saved)throw new Error('Media cleanup checkpoint changed; resume next scheduled run');
 return {backlog};
}
