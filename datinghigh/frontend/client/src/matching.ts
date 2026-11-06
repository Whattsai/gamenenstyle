import * as Crypto from 'expo-crypto';
import {ApiFailure} from './api';

export type CandidatePersona={nickname:string;bio:string;traitTagIds:string[];interestTagIds:string[];selectedAvatarType:'builtin'|'generated'|null;selectedAvatarRef:string|null;avatarDataUrl?:string|null};
export type CandidateSummary={candidateId:string;score:number;invitationState?:'incoming'|'outgoing'|null;invitationId?:string|null};
export type Candidate=CandidateSummary&{persona:CandidatePersona};
export type Invitation={invitationId:string;candidateId:string;status:'pending'|'accepted'|'declined'|'cancelled'|'expired'|'invalidated';direction:'incoming'|'outgoing';invalidatedReason?:'other_round_started'|'eligibility_changed'|null;expiresAt:number;roundId?:string|null;persona:CandidatePersona};
export type GameRound={roundId:string;status:'active';persona:CandidatePersona};
export function matchingDestination(profile:{profileReady:boolean},rounds:{items:GameRound[]}):string{
 if(!profile||typeof profile.profileReady!=='boolean'||!Array.isArray(rounds?.items)||rounds.items.length>1)throw new ApiFailure('DEPENDENCY_UNAVAILABLE',503);
 if(rounds.items.length){if(!rounds.items[0].roundId)throw new ApiFailure('DEPENDENCY_UNAVAILABLE',503);return '/game-round/'+rounds.items[0].roundId;}
 return profile.profileReady?'/matching':'/profile';
}
export function invitationMessage(item:Invitation){
 if(item.status==='invalidated')return item.invalidatedReason==='other_round_started'?'對方目前無法配對，這次邀請已失效':'配對條件已變更，請重新搜尋';
 return {pending:item.direction==='incoming'?'邀請你一起認識彼此':'等待回覆',accepted:'已接受',declined:'已婉拒，彼此不再配對',cancelled:'已取消，未來仍可再次相遇',expired:'已逾期，未來仍可再次相遇'}[item.status];
}
export function matchingError(error:unknown){
 if(error instanceof ApiFailure){
  if(error.uncertain)return '狀態不明，請重新整理；不會自動重送邀請';
  if(error.status===401)return '登入已失效，請重新登入';
  if(error.code==='PROFILE_NOT_READY')return '請先完成個人資料';
  if(error.code==='GAME_IN_PROGRESS')return '遊戲進行中，結束後才能重新配對';
  if(error.status===410)return '邀請已逾期，請重新整理';
  if(error.status===403||error.status===409)return '目前無法配對，請重新搜尋';
  if(error.status===429)return `操作過於頻繁，請於 ${Math.max(1,error.retryAfter)} 秒後再試`;
 }
 return '目前無法確認配對狀態，請重試';
}
export function matchingRequestId(){
 const bytes=Crypto.getRandomValues(new Uint8Array(16));let time=Date.now();
 for(let i=5;i>=0;i--){bytes[i]=time%256;time=Math.floor(time/256);}
 bytes[6]=(bytes[6]&15)|112;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
