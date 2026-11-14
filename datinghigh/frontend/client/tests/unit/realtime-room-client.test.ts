import {afterEach,expect,it,vi} from 'vitest';
import {RealtimeRoomClient} from '../../src/RealtimeRoomClient';
class Socket{readyState=1;onopen:any;onmessage:any;onclose:any;onerror:any;sent:string[]=[];send(s:string){this.sent.push(s);}close(){this.readyState=3;this.onclose?.();}frame(value:unknown){this.onmessage?.({data:JSON.stringify(value)});}}
const setup=()=>{const sockets:Socket[]=[],request=vi.fn().mockResolvedValue({ticket:'opaque-short-ticket'}),sync=vi.fn().mockResolvedValue(undefined),status=vi.fn(),presence=vi.fn(),avatarUpdated=vi.fn().mockResolvedValue(undefined),create=vi.fn(()=>{const ws=new Socket();sockets.push(ws);return ws as unknown as WebSocket;});const client=new RealtimeRoomClient({origin:'https://game.example',request},'round',{sync,status,presence,avatarUpdated},'device',create);return{client,sockets,request,sync,status,presence,avatarUpdated,create};};
const flush=async()=>{for(let n=0;n<8;n++)await Promise.resolve();};afterEach(()=>vi.useRealTimers());
it('standard socket uses no token URL and waits for authorized cursor sync before connected',async()=>{
 const t=setup();t.client.start();await flush();expect(t.create).toHaveBeenCalledWith('wss://game.example/api/v1/game-rounds/round/ws',['datinghigh.v1','ticket.opaque-short-ticket','device.device']);expect(t.status).not.toHaveBeenCalledWith('connected');t.sockets[0].onopen();await flush();expect(t.sync).toHaveBeenCalled();expect(t.status).toHaveBeenLastCalledWith('connected');t.client.stop();
});
it('disconnect rejects an unacknowledged write as unknown and reconnect never resends it',async()=>{
 vi.useFakeTimers();const t=setup();t.client.start();await flush();t.sockets[0].onopen();await flush();const pending=t.client.send('message.send','original-id',{text:'one real message'});const failed=expect(pending).rejects.toMatchObject({uncertain:true});t.sockets[0].close();await failed;await vi.advanceTimersByTimeAsync(1000);await flush();expect(t.sockets).toHaveLength(2);expect(t.sockets[1].sent).toEqual([]);t.client.stop();
});
it('recovery stays explicitly offline while a new ticket is pending and cannot imply synchronized state',async()=>{
 vi.useFakeTimers();const t=setup();t.client.start();await flush();t.sockets[0].onopen();await flush();
 t.request.mockImplementation(()=>new Promise(()=>{}));t.sockets[0].close();await vi.advanceTimersByTimeAsync(1000);await flush();expect(t.status).toHaveBeenLastCalledWith('offline');t.client.stop();
});
it('only matching round ACK resolves the pending original request; explicit replay keeps the same ID',async()=>{
 const t=setup();t.client.start();await flush();const ws=t.sockets[0];let resolved=false;const pending=t.client.send('message.send','original-id',{text:'hello'}).then(r=>{resolved=true;return r;});ws.frame({version:1,type:'command.ack',roundId:'other',clientRequestId:'original-id',eventSeq:3});await flush();expect(resolved).toBe(false);ws.frame({version:1,type:'command.ack',roundId:'round',clientRequestId:'original-id',eventSeq:3});expect(await pending).toEqual({clientRequestId:'original-id',eventSeq:3});const retry=t.client.send('message.send','original-id',{text:'hello'});ws.frame({version:1,type:'command.ack',roundId:'round',clientRequestId:'original-id',eventSeq:3});await retry;expect(ws.sent.map(s=>JSON.parse(s).clientRequestId)).toEqual(['original-id','original-id']);t.client.stop();
});
it('45 second missing ACK is unknown, not committed or automatically resubmitted',async()=>{
 vi.useFakeTimers();const t=setup();t.client.start();await flush();const pending=t.client.send('message.send','original-id',{text:'hello'});const failure=expect(pending).rejects.toMatchObject({code:'UNKNOWN_COMMIT',uncertain:true});await vi.advanceTimersByTimeAsync(45000);await failure;expect(t.sockets[0].sent).toHaveLength(1);t.client.stop();
});
it('SD-UT-065: same-round avatar revision hints deduplicate across reconnects and never start polling',async()=>{
 vi.useFakeTimers();const t=setup();t.client.start();await flush();const frame={version:1,type:'avatar.updated',roundId:'round',payload:{revisionHint:'a'.repeat(64)}};
 const first=t.sockets[0];first.frame({...frame,roundId:'foreign'});first.frame({...frame,payload:{revisionHint:'invalid'}});expect(t.avatarUpdated).not.toHaveBeenCalled();
 first.frame(frame);first.frame(frame);await flush();expect(t.avatarUpdated).toHaveBeenCalledTimes(1);
 first.close();await vi.advanceTimersByTimeAsync(1000);await flush();t.sockets[1].frame(frame);await flush();expect(t.avatarUpdated).toHaveBeenCalledTimes(1);
 t.sockets[1].frame({...frame,payload:{revisionHint:'b'.repeat(64)}});await flush();expect(t.avatarUpdated).toHaveBeenCalledTimes(2);
 const requests=t.request.mock.calls.length;await vi.advanceTimersByTimeAsync(60000);expect(t.request).toHaveBeenCalledTimes(requests);t.client.stop();
});
