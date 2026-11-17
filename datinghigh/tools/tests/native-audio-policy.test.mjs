import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseNativeAudioPlayback} from '../native-audio-policy.mjs';

test('native audio evidence joins player events to this app UID and keeps only normalized playback fields',()=>{
 const dump=`Players:
 ID:12 -- u/pid:12345/77 -- state:started
 ID:18 -- u/pid:98765/78 -- state:started
Events:
11-17 00:00:00:100 new player piid:11 uid/pid:12345/77 attr:private/path
11-17 00:00:00:200 player piid:11 state:started DeviceId:0
11-17 00:00:00:300 player piid:11 state:paused DeviceId:0
11-17 00:00:00:400 player piid:18 state:started DeviceId:0
11-17 00:00:00:500 player piid:12345 state:started DeviceId:0`;
 const result=parseNativeAudioPlayback(dump,12345);
 assert.deepEqual(result.activeStartedPlayerIds,[12]);
 assert.deepEqual(result.events.map(event=>[event.playerId,event.state]),[[12,'started'],[11,'started'],[11,'paused']]);
 assert.equal(result.events[1].at,'11-17 00:00:00:200');assert.doesNotMatch(JSON.stringify(result),/private|attr|98765/);
});

test('unattributed native events cannot count as this app playback and invalid UIDs are rejected',()=>{
 assert.deepEqual(parseNativeAudioPlayback('11-17 00:00:00:200 player piid:11 state:started',12345),{activeStartedPlayerIds:[],events:[]});
 assert.throws(()=>parseNativeAudioPlayback('',0),/Invalid native audio UID/);
});
