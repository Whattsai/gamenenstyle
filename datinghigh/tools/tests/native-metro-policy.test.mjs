import {test} from 'node:test';
import assert from 'node:assert/strict';
import {warmNativeMetro} from '../native-metro-policy.mjs';

test('native readiness waits for the Android bundle rather than only the Metro manifest',async()=>{
 const calls=[];let consumed=false;
 await warmNativeMetro(async url=>{calls.push(String(url));return calls.length===1?{ok:true,json:async()=>({launchAsset:{url:'http://localhost:8084/.expo/.virtual-metro-entry.bundle?platform=android&dev=true'}})}:{ok:true,arrayBuffer:async()=>{consumed=true;return new ArrayBuffer(1);}};});
 assert.equal(calls.length,2);assert.equal(consumed,true);assert.match(calls[1],/platform=android/);
});
test('native bundle warming refuses another service and an unsuccessful bundle',async()=>{
 let calls=0;
 await assert.rejects(()=>warmNativeMetro(async()=>{calls++;return {ok:true,json:async()=>({launchAsset:{url:'https://another.invalid/entry.bundle'}})};}),/NATIVE_METRO_MANIFEST_INVALID/);
 assert.equal(calls,1);
 await assert.rejects(()=>warmNativeMetro(async()=>++calls===2?{ok:true,json:async()=>({launchAsset:{url:'http://localhost:8084/entry.bundle?platform=android'}})}:{ok:false}),/NATIVE_METRO_BUNDLE_UNAVAILABLE/);
});
