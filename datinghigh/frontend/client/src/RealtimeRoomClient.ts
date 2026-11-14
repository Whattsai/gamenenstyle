import {ApiFailure} from './api';

export type RoomConnection='connecting'|'syncing'|'connected'|'offline';
type Http={origin:string;request:(path:string,method?:string,body?:Record<string,unknown>)=>Promise<any>};
type Pending={resolve:(value:{clientRequestId:string;eventSeq:number})=>void;reject:(e:ApiFailure)=>void;timer:ReturnType<typeof setTimeout>};
/** 標準 WebSocket JSON，無平台 SDK。斷線只重新授權與補漏，不重送業務寫入。 */
export class RealtimeRoomClient{
 private socket?:WebSocket;private stopped=true;private generation=0;private attempt=0;private timer?:ReturnType<typeof setTimeout>;private syncing?:Promise<void>;private syncAgain=false;
 private pending=new Map<string,Pending>();
 private avatarHints=new Set<string>();
 private openedBefore=false;
 constructor(private http:Http,private roundId:string,private callbacks:{sync:()=>Promise<void>;status:(state:RoomConnection)=>void;presence:(payload:Record<string,any>)=>void;avatarUpdated?:(revisionHint:string)=>Promise<void>;reconnected?:()=>Promise<void>},private deviceId?:string,private createSocket:(url:string,protocols:string[])=>WebSocket=(url,protocols)=>new WebSocket(url,protocols)){}
 async synchronize(){
  if(this.syncing){this.syncAgain=true;return this.syncing;}
  this.syncing=(async()=>{do{this.syncAgain=false;await this.callbacks.sync();}while(this.syncAgain&&!this.stopped);})();
  try{await this.syncing;}finally{this.syncing=undefined;}
 }
 start(){if(!this.stopped)return;this.stopped=false;void this.connect(++this.generation);}
 private retry(generation:number){if(this.stopped||generation!==this.generation)return;this.callbacks.status('offline');const delay=Math.min(30000,500*2**Math.min(this.attempt++,6))*(.75+Math.random()*.5);this.timer=setTimeout(()=>void this.connect(generation),delay);}
 private async connect(generation:number){
  if(this.stopped||generation!==this.generation)return;this.callbacks.status(this.openedBefore?'offline':'connecting');
  try{
   if(!this.deviceId)throw new ApiFailure('INVALID_STORY_REQUEST',400);
   const ticket=await this.http.request(`/game-rounds/${this.roundId}/realtime-ticket`,'POST',{deviceId:this.deviceId});
   if(this.stopped||generation!==this.generation)return;
   const origin=ticket.socketOrigin??this.http.origin;const target=new URL(`/api/v1/game-rounds/${this.roundId}/ws`,origin||globalThis.location?.origin);target.protocol=target.protocol==='https:'?'wss:':'ws:';
   const ws=this.createSocket(target.toString(),['datinghigh.v1',`ticket.${ticket.ticket}`,`device.${this.deviceId}`]);this.socket=ws;
   ws.onopen=()=>{if(this.stopped||generation!==this.generation){ws.close();return;}this.callbacks.status('syncing');const reconnect=this.openedBefore;this.openedBefore=true;void this.synchronize().then(()=>reconnect?this.callbacks.reconnected?.():undefined).then(()=>{if(!this.stopped&&generation===this.generation&&ws.readyState===1){this.attempt=0;this.callbacks.status('connected');}}).catch(()=>ws.close());};
   ws.onmessage=event=>{
    if(this.stopped||generation!==this.generation)return;
    try{
     if(typeof event.data!=='string'||event.data.length>16384)return;const frame=JSON.parse(event.data);
     if(frame.version!==1||frame.roundId!==this.roundId)return;
     if(frame.type==='command.ack'){
      const pending=this.pending.get(frame.clientRequestId);if(pending&&Number.isSafeInteger(frame.eventSeq)){clearTimeout(pending.timer);this.pending.delete(frame.clientRequestId);pending.resolve({clientRequestId:frame.clientRequestId,eventSeq:frame.eventSeq});}
     }else if(frame.type==='command.error'){
      const pending=this.pending.get(frame.clientRequestId);if(pending){clearTimeout(pending.timer);this.pending.delete(frame.clientRequestId);pending.reject(new ApiFailure(frame.payload?.code??'DEPENDENCY_UNAVAILABLE',frame.payload?.status??503,undefined,0,frame.payload?.uncertain!==false));}
     }else if(frame.type==='avatar.updated'){
      const hint=frame.payload?.revisionHint;if(typeof hint!=='string'||!/^[0-9a-f]{64}$/.test(hint)||Object.keys(frame.payload).length!==1||this.avatarHints.has(hint))return;
      this.avatarHints.add(hint);if(this.avatarHints.size>64)this.avatarHints.delete(this.avatarHints.values().next().value!);
      void Promise.resolve().then(()=>{if(this.stopped||generation!==this.generation){this.avatarHints.delete(hint);return;}return this.callbacks.avatarUpdated?this.callbacks.avatarUpdated(hint):this.synchronize();}).catch(()=>{this.avatarHints.delete(hint);ws.close();});
     }else if(frame.type==='player.presence')this.callbacks.presence(frame.payload);
     else if(['room.snapshot_hint','room.ended','story.selected','story.node_changed','interaction.updated','message.committed'].includes(frame.type))void this.synchronize().catch(()=>ws.close());
    }catch{/* 未知／損壞 frame 不成為 UI 事實。 */}
   };
   ws.onerror=()=>{try{ws.close();}catch{/* 斷線回呼負責重連。 */}};
   ws.onclose=()=>{if(this.socket===ws)this.socket=undefined;this.rejectPending();this.retry(generation);};
  }catch{this.retry(generation);}
 }
 send(type:string,clientRequestId:string,payload:Record<string,unknown>):Promise<{clientRequestId:string;eventSeq:number}>{
  const ws=this.socket;if(this.stopped||!ws||ws.readyState!==1)return Promise.reject(new ApiFailure('REALTIME_DISCONNECTED',0,undefined,0,true));
  if(this.pending.has(clientRequestId))return Promise.reject(new ApiFailure('REQUEST_IN_PROGRESS',409));
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{this.pending.delete(clientRequestId);reject(new ApiFailure('UNKNOWN_COMMIT',0,undefined,0,true));},45000);this.pending.set(clientRequestId,{resolve,reject,timer});
   try{ws.send(JSON.stringify({version:1,type,roundId:this.roundId,clientRequestId,payload}));}catch{clearTimeout(timer);this.pending.delete(clientRequestId);reject(new ApiFailure('UNKNOWN_COMMIT',0,undefined,0,true));}
  });
 }
 presence(typing:boolean){if(this.socket?.readyState===1)this.socket.send(JSON.stringify({version:1,type:'presence.ping',roundId:this.roundId,payload:{typing}}));}
 private rejectPending(){for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new ApiFailure('UNKNOWN_COMMIT',0,undefined,0,true));}this.pending.clear();}
 stop(){this.stopped=true;this.generation++;clearTimeout(this.timer);const ws=this.socket;this.socket=undefined;if(ws){ws.onclose=null;ws.close();}this.rejectPending();}
}
