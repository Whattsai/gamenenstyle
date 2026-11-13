import {z} from 'zod';
import {executeCommand} from './commands';
import type {PlatformEnv} from './platform';
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const auth=z.object({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().positive()});
/** 只在 D1 已提交選用後呼叫；提示不是權威，失敗不逆轉提交，重連按當前狀態校正。 */
export async function notifyAvatarSelection(env:PlatformEnv,input:unknown,now:number){
 if(!env.GAME_ROOMS)return;
 try{
  const user=auth.parse(input),rooms=(await executeCommand(env.DB,'game.round.list',user,now)).rows as {round_id:string}[];
  if(!rooms.length)return;
  const profile=await env.DB.prepare('SELECT revision,selected_avatar_type,selected_avatar_ref FROM user_profiles WHERE account_id=?').bind(user.accountId).first<{revision:number;selected_avatar_type:string;selected_avatar_ref:string}>();
  if(!profile?.selected_avatar_ref)return;
  for(const {round_id:roundId} of rooms){
   const bytes=new TextEncoder().encode(JSON.stringify([roundId,user.accountId,profile.revision,profile.selected_avatar_type,profile.selected_avatar_ref]));
   const revisionHint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
   await env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(roundId)).fetch(new Request('http://room.internal/internal/notify',{method:'POST',body:JSON.stringify({roundId,ended:false,type:'avatar.updated',revisionHint}),signal:AbortSignal.timeout(3000)}));
  }
 }catch{/* 已提交成功；不記錄私人身份／素材，客戶端重連或回前景只讀補正。 */}
}
