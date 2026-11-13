import {expect,it,vi} from 'vitest';
import {mergeRoundEvents,detectExitIntent,validStoryMessage} from '../../src/story';
import {RealtimeRoomClient} from '../../src/RealtimeRoomClient';

it('SD-UT-018/050: cursor replay deduplicates by committed event sequence and preserves episode payload',()=>{
 const a={eventSeq:1,type:'story.selected',payload:{episodeSeq:1,storySessionId:'first'}};
 const b={eventSeq:2,type:'story.selected',payload:{episodeSeq:2,storySessionId:'second'}};
 expect(mergeRoundEvents([b],[a,b]).map(e=>e.payload.storySessionId)).toEqual(['first','second']);
});
it('SD-UT-027/036: exit intent is only a local hint and messages use Unicode scalar bounds',()=>{
 expect(detectExitIntent('先到這邊，謝謝你')).toBe(true);expect(detectExitIntent('我喜歡這本書')).toBe(false);
 expect(validStoryMessage('😀'.repeat(500))).toBe(true);expect(validStoryMessage('😀'.repeat(501))).toBe(false);expect(validStoryMessage('<script>bad</script>')).toBe(false);
});
it('SD-UT-009/018: disconnected mutations fail as uncertain without allocating or sending a replacement request',async()=>{
 const http={origin:'http://localhost',request:vi.fn()};const sync=vi.fn();
 const room=new RealtimeRoomClient(http,'room',{sync,status:vi.fn(),presence:vi.fn()});
 await expect(room.send('message.send','original',{text:'你好'})).rejects.toMatchObject({uncertain:true});expect(http.request).not.toHaveBeenCalled();room.stop();
});
