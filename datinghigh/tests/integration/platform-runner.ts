import {build} from 'esbuild';
// @ts-expect-error 共用本地發布政策。
import {buildTrackFixture} from '../support/scene-event-content-fixture.mjs';
// @ts-expect-error 共用分層內容與固定 prepared Publisher。
import {buildSceneEventTrackBundle} from '../../tools/scene-event-content-policy.mjs';
// @ts-expect-error 共用分層內容與固定 prepared Publisher。
import {publishSceneEventBundles,validateSceneEventBundles,planSceneEventPublication} from '../../tools/scene-event-publish-policy.mjs';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';import {createInterface} from 'node:readline';
import {dispatch,ready,probeKey,probeText} from '../../cloudflare/src/platform';
// Test-only private stdin/stdout IPC. No listening socket, persisted DB or application endpoint.
let startupPhase='compile';
async function main(){
 const root=process.argv[2];
 const compiled=await build({stdin:{contents:`import {DurableObject} from 'cloudflare:workers';import {GameRoomSocket} from './src/room-socket';import {serveStoryAsset} from './src/story-content';export {GameRoomSocket};
 export class TestApiGateway extends DurableObject {async fetch(r){const u=new URL(r.url);if(u.pathname==='/_configure'){await this.ctx.storage.put('origin',await r.json());return new Response('ok');}const cfg=await this.ctx.storage.get('origin');if(!cfg)return new Response(null,{status:503});const headers=new Headers(r.headers);headers.set('X-DatingHigh-Test-Control',cfg.key);return fetch(new Request(cfg.origin+'/_test/round-command',{method:r.method,headers,body:r.body,redirect:'manual'}));}}
 export default {async fetch(r,env){const u=new URL(r.url);const round=u.pathname.match(/^\\/api\\/v1\\/game-rounds\\/([0-9a-f-]+)\\/ws$/)?.[1];if(round)return env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(round)).fetch(r);if(u.pathname.startsWith('/story-content/'))return serveStoryAsset(r,env);return new Response(null,{status:404});}};`,resolveDir:root+'/cloudflare',loader:'ts'},bundle:true,write:false,format:'esm',platform:'neutral',external:['cloudflare:workers'],conditions:['workerd','worker','browser']});
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-10-24',d1Databases:{DB:'isolated-application-test'},r2Buckets:{FILES:'isolated-application-files',STORY_CONTENT:'isolated-story-content'},durableObjects:{GAME_ROOMS:{className:'GameRoomSocket',useSQLite:true},API:{className:'TestApiGateway',useSQLite:true}},bindings:{ROUND_TICKET_HMAC_KEY:'isolated-test-only-realtime-secret-32-bytes',WEB_ORIGIN:'http://localhost:8081',APP_ENV:'local'}}));
 try{
 startupPhase='bindings';const db=await mf.getD1Database('DB') as unknown as D1Database;const files=await mf.getR2Bucket('FILES') as unknown as R2Bucket;
 const storyContent=await mf.getR2Bucket('STORY_CONTENT') as unknown as R2Bucket;const rooms=await mf.getDurableObjectNamespace('GAME_ROOMS');const gateway=await mf.getDurableObjectNamespace('API');
 startupPhase='migrations';for(const name of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql','0005_story_dialogue_exit.sql','0006_scene_event_framework.sql','0007_scene_event_tracks.sql']){
  const sql=readFileSync(`${root}/cloudflare/migrations/${name}`,'utf8');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 }
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare('INSERT INTO d1_migrations(name) VALUES(?)').bind('0007_scene_event_tracks.sql').run();await files.put(probeKey,probeText);
 const storyV3=process.argv[3]==='story-v3';
 const content=JSON.parse(readFileSync(root+'/contracts/'+(storyV3?'rain-bookshop-before-rain-stops':'rain-bookshop-last-order')+'.json','utf8'));
 const definition=JSON.parse(readFileSync(root+'/contracts/scene-event-content.json','utf8')).stories[0];
 if(storyV3){definition.sceneCatalogId='019a281e-0000-7000-8000-000000005011';definition.narrativeCatalogId='019a281e-0000-7000-8000-000000005012';}
 else{definition.sceneCatalogId='019a281e-0000-7000-8000-000000005001';definition.narrativeCatalogId='019a281e-0000-7000-8000-000000005002';}
 startupPhase='publication';await publishSceneEventBundles(db,storyContent,[buildSceneEventTrackBundle(content,root,definition)],{validationRoot:root});
 let matchingFault:string|null=null;const savedStoryContent=new Map<string,{bytes:ArrayBuffer;httpMetadata:R2HTTPMetadata}>();
 const faultDb=new Proxy(db,{get(target,property){
  if(property==='prepare')return(sql:string)=>{
   const second=matchingFault==='accept-second-participant'&&sql.startsWith('INSERT INTO game_active_round_claims')&&sql.includes('account_high_id');
   const projection=matchingFault==='profile-projection-zero'&&sql.startsWith('INSERT INTO match_conditions');
   const accept=matchingFault==='accept-zero'&&sql.startsWith("UPDATE match_invitations SET status='accepted'");
   if(second){matchingFault=null;sql=sql.replace('SELECT ?,account_high_id','SELECT CASE WHEN ? IS NOT NULL THEN NULL ELSE NULL END,account_high_id');}
   if(projection||accept){matchingFault=null;sql=sql.replace('WHERE ','WHERE 0 AND ');}
   return target.prepare(sql);
  };
  const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value;
 }});
 // 與正式 ASSETS 同責任；只讀本專案已產製的固定角色／hash 路徑，不接受任意檔案。
 const assets={fetch:async(request:Request)=>{const url=new URL(request.url);if(url.search||!/^\/avatars\/(?:full-body\.v1\/(?:male|female)-0[1-8]\/[0-9a-f]{64}\.webp|static-poses\.v1\/(?:male|female)-0[1-8]\/[0-9a-f]{64}\.png)$/.test(url.pathname))return new Response(null,{status:404});try{return new Response(new Uint8Array(readFileSync(root+'/frontend/client/public'+url.pathname)),{headers:{'Content-Type':url.pathname.endsWith('.png')?'image/png':'image/webp'}});}catch{return new Response(null,{status:404});}}} as unknown as Fetcher;
 const env={DB:faultDb,FILES:files,STORY_CONTENT:storyContent,ASSETS:assets,GAME_ROOMS:rooms as unknown as DurableObjectNamespace,ROUND_TICKET_HMAC_KEY:'isolated-test-only-realtime-secret-32-bytes',WEB_ORIGIN:'http://localhost:8081',APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0007_scene_event_tracks.sql'};
 let socketOrigin:string|null=null;
 let providerMode='success',providerCalls=0,templatesValid=true,mailCode='000001';
 const cloud={...env,APP_ENV:'staging',EmailDeliveryMode:'Cloudflare',EMAIL_FROM:'verified@test.invalid',EMAIL:{async send(message:{from:string,to:string,subject:string,text:string}){
  providerCalls++;templatesValid=templatesValid&&message.from==='verified@test.invalid'&&message.to==='owner@example.com'&&['心動迴路：驗證 Email','心動迴路：重設密碼'].includes(message.subject)&&message.text===`您的驗證碼為 ${mailCode}。有效期限 10 分鐘。若非本人操作，請忽略此信。`;
  if(providerMode==='timeout')await new Promise(resolve=>setTimeout(resolve,11000));if(providerMode!=='success')throw new Error('provider-private');return{messageId:'controlled-provider-message'};
 }}};
 startupPhase='ready';process.stdout.write('{"ready":true}\n');
 for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
  try{const {command,payload,now}=JSON.parse(line);let result;
   if(command==='$test-realtime-origin'){const origin=new URL(payload.origin);if(!['127.0.0.1','localhost'].includes(origin.hostname))throw new Error('Invalid test origin');await gateway.get(gateway.idFromName('api-v1')).fetch(new Request('http://test/_configure',{method:'POST',body:JSON.stringify({origin:origin.origin,key:payload.key})}));socketOrigin=(await mf.ready).origin;result={origin:socketOrigin};}
   else if(command==='$test-arm-matching-fault'){if(!['accept-second-participant','profile-projection-zero','accept-zero'].includes(payload.mode))throw new Error('Invalid matching fault');matchingFault=payload.mode;result={armed:true};}
   else if(command==='$test-matching-fault-state')result={armed:matchingFault!==null};
   else if(command==='$test-provider'){providerMode=payload.mode;if(payload.reset!==false){providerCalls=0;templatesValid=true;}result={configured:true};}
   else if(command==='$test-provider-stats')result={calls:providerCalls,templatesValid};
   else if(command==='$test-content-mode'){
    if(!['normal','missing','corrupt'].includes(payload.mode))throw new Error('Invalid isolated content fault');
    if(payload.mode==='normal'){for(const[key,object]of savedStoryContent)await storyContent.put(key,object.bytes,{httpMetadata:object.httpMetadata});savedStoryContent.clear();}
    else{if(savedStoryContent.size)throw new Error('Restore isolated content first');const catalogs=(await db.prepare("SELECT manifest_key FROM content_story_catalog WHERE status='published'").all()).results as {manifest_key:string}[];
     for(const c of catalogs){const object=await storyContent.get(c.manifest_key);if(!object)throw new Error('Missing isolated original content');savedStoryContent.set(c.manifest_key,{bytes:await object.arrayBuffer(),httpMetadata:object.httpMetadata??{}});if(payload.mode==='missing')await storyContent.delete(c.manifest_key);else await storyContent.put(c.manifest_key,new Uint8Array([0]),{httpMetadata:object.httpMetadata});}
    }result={mode:payload.mode};
   }
   else if(command==='$test-tracks-enable'||command==='$test-framework-enable')result={enabled:true};
   else if(command==='$test-framework-reset-content'){
    if(await db.prepare('SELECT 1 FROM game_rounds LIMIT 1').first())throw new Error('Test content reset requires an empty game fixture');
    await db.batch(['content_scene_category_links','content_story_catalog','content_scene_catalog','content_story_categories'].map(table=>db.prepare('DELETE FROM '+table)));
    await publishSceneEventBundles(db,storyContent,[buildSceneEventTrackBundle(content,root,definition)],{now,validationRoot:root});result={restored:true};
   }
   else if(command==='$test-framework-categories'||command==='$test-story-catalogs'){
    if(![2,3].includes(payload.count))throw new Error('Invalid isolated category count');
    const categories=[definition.categories[0],...Array.from({length:payload.count-1},(_,n)=>({categoryId:`019a281e-0000-7000-8000-${String(4204+n).padStart(12,'0')}`,code:['mystery','travel'][n],version:'v1',title:['懸疑','旅程'][n],interestTagIds:['puzzle'],recommendationPriority:n+2}))];
    const layered=buildTrackFixture(root,{...definition,sceneCatalogId:`019a281e-0000-7000-8000-${String(6000+payload.count).padStart(12,'0')}`,narrativeCatalogId:`019a281e-0000-7000-8000-${String(6100+payload.count).padStart(12,'0')}`,sceneVersion:`v${payload.count}0`,narrativeVersion:`v${payload.count}0`,categories});
    await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});result={categories:categories.map(c=>({categoryId:c.categoryId,title:c.title})),catalogs:categories.map(c=>c.categoryId)};
   }
   else if(command==='$test-framework-events'){
    if(![0,1].includes(payload.probability))throw new Error('Invalid isolated probability');
    const layered=buildTrackFixture(root,{...definition,sceneCatalogId:`019a281e-0000-7000-8000-${String(6201+payload.probability*10).padStart(12,'0')}`,narrativeCatalogId:`019a281e-0000-7000-8000-${String(6202+payload.probability*10).padStart(12,'0')}`,sceneVersion:`v${40+payload.probability}`,narrativeVersion:`v${40+payload.probability}`,poolVersion:`v${40+payload.probability}`,mutate(c){
     const original=structuredClone(c.narrative.eventBindings[0]);delete original.actions[0].nextNode;
     const scene={...original,scope:'scene',sourceId:c.scene.sceneId,bindingId:'hidden-note',narrativeRole:'side',requiredForEnding:false,visibility:'hidden',selectionMode:'weighted_random',probability:payload.probability,repeatGroup:'hidden-note',triggerConditions:{track_event_completed:{role:'inviter',bindingKey:'narrative:'+c.narrative.narrativeId+':arrive-inviter'}}};c.scene.sceneEventBindings.push(scene);
     const global={...structuredClone(scene),scope:'global',sourceId:c.pool.poolId,bindingId:'global-note',selectionMode:'fixed',probability:1,repeatGroup:'global-note',repeatScope:'round',triggerConditions:{track_event_completed:{role:'inviter',bindingKey:'scene:'+c.scene.sceneId+':hidden-note'}}};c.pool.eventBindings.push(global);
    }});await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});result={configured:true};
   }
   else if(command==='$test-framework-branches'){
    if(!['main','side'].includes(payload.purpose)||await db.prepare('SELECT 1 FROM game_rounds LIMIT 1').first())throw new Error('Invalid isolated branch fixture');
    const layered=buildTrackFixture(root,{...definition,narrativeId:'fixture-'+payload.purpose+'-story',sceneCatalogId:'019a281e-0000-7000-8000-000000007001',narrativeCatalogId:'019a281e-0000-7000-8000-000000008001',sceneVersion:'v80',narrativeVersion:'v80',mutate(c){
     const n=c.narrative,nodes=n.tracks.inviter.nodes,fork=nodes.find(node=>node.id==='i02');fork.id='i-left';nodes.push({...structuredClone(fork),id:'i-right'});
     c.scene.sceneObjects.push({...structuredClone(c.scene.sceneObjects.find(o=>o.id==='pickup-slip-27')),id:'other-paper'});
     const entry=n.eventBindings.find(b=>b.bindingId==='arrive-inviter');entry.narrativeRole=payload.purpose;entry.requiredForEnding=payload.purpose==='main';if(payload.purpose==='side')n.endingRequires=n.endingRequires.filter(key=>!key.endsWith(':arrive-inviter'));entry.actions[0].nextNode='i-left';entry.actions.push({...structuredClone(entry.actions[0]),params:{objectId:'other-paper'},targetObjectId:'other-paper',nextNode:'i-right'});
     n.eventBindings.find(b=>b.bindingId==='inspect-slip').triggerConditions={any:[...(payload.purpose==='side'?['i01']:[]),'i-left','i-right'].map(nodeId=>({track_node_entered:{role:'inviter',nodeId}}))};
    }});
    // Isolated engine fixtures use the strict validator and prepared publication batch, never a fabricated user Gate.
    await validateSceneEventBundles([layered],root);for(const object of layered.objects)await storyContent.put(object.key,object.bytes,{httpMetadata:{contentType:object.mimeType??'application/json'}});
    await db.batch([db.prepare("UPDATE content_story_catalog SET status='retired' WHERE status='published'"),...planSceneEventPublication([layered],now).map(s=>db.prepare(s.sql).bind(...s.values))]);
    result={configured:true,definition:layered.narrative.manifest.eventBindings.find(b=>b.bindingId==='arrive-inviter').definition};
   }
   else if(command==='$test-framework-linear'){
    const layered=buildTrackFixture(root,{...definition,sceneCatalogId:'019a281e-0000-7000-8000-000000006301',narrativeCatalogId:'019a281e-0000-7000-8000-000000006302',sceneVersion:'v50',narrativeVersion:'v50',poolVersion:'v50',mutate(c){
     for(const role of ['inviter','acceptor'])c.narrative.tracks[role].nodes=c.narrative.tracks[role].nodes.slice(0,1);
     c.narrative.eventBindings=[];c.narrative.clues=[];const b=c.narrative.sharedEventBindings[2];b.triggerConditions={all:['inviter','acceptor'].map(role=>({track_node_entered:{role,nodeId:c.narrative.tracks[role].entry}}))};b.actions=b.actions.filter(a=>a.params.optionId==='rest_chat');for(const a of b.actions)a.conditions=b.triggerConditions;b.startPresentationSteps=[];c.narrative.sharedEventBindings=[b];c.narrative.endingRequires=['narrative:'+c.narrative.narrativeId+':final-exchange'];c.narrative.endings=[{id:'ending-only',title:'簡單的相遇',lines:[{speaker:'旁白',text:'先聊聊今天吧。'}],conditions:{shared_event_completed:c.narrative.endingRequires[0]},presentationSteps:[]}];
    }});await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});result={configured:true};
   }
   else if(command==='$test-sql')result={rows:(await db.prepare(payload.sql).bind(...payload.values).all()).results};
   else if(command==='$test-r2-list'){const page=await files.list({prefix:'private/',limit:1000});result={keys:page.objects.map(object=>object.key),truncated:page.truncated};}
   else if(command==='$test-media'){
    const path=payload.path??`/v1/media/personal-photos/${payload.assetId}`;
    if(!/^\/v1\/(?:media\/(?:personal-photos|assets)\/[0-9a-f-]+|avatar\/candidates\/[0-9a-f-]+(?:\/[1-4])?|avatar\/expressions\/[0-9a-f-]+\/(?:neutral|smile|surprised|thoughtful|concerned|pose-(?:stand|sit|read|hold))|avatar\/(?:assets|rounds|round-self)\/[0-9a-f-]+\/[0-9a-f]{64}\/(?:neutral|smile|surprised|thoughtful|concerned|static-[0-9a-f]{64}))$/.test(path))throw new Error('Invalid private test media path');
    const response=await dispatch(new Request(`http://platform.internal${path}`,{
     method:payload.method,headers:payload.headers,
     ...(payload.content===null?{}:{body:Buffer.from(payload.content,'base64')})
    }),env,now);
    result={status:response.status,mime:response.headers.get('Content-Type'),content:Buffer.from(await response.arrayBuffer()).toString('base64')};
   }
   else if(command==='email.code.send'){
    mailCode=String(payload.code);
    const response=await dispatch(new Request('http://platform.internal/v1/commands/email.code.send',{method:'POST',body:JSON.stringify(payload)}),cloud,now);
    const body=await response.json();if(!response.ok){process.stdout.write(JSON.stringify({error:body})+'\n');continue;}result=body;
   }
   else if(command==='platform.ready')result=await ready(env);
   else {const response=await dispatch(new Request(`http://platform.internal/v1/commands/${command}`,{method:'POST',body:JSON.stringify(payload)}),env,now);const body=await response.json();if(!response.ok){process.stdout.write(JSON.stringify({error:body})+'\n');continue;}result=body;if(command==='round.realtime.ticket'&&socketOrigin){const origin=new URL(socketOrigin);if(payload.clientPlatform!=='web')origin.hostname='10.0.2.2';result={...result as object,socketOrigin:origin.origin};}}
   process.stdout.write(JSON.stringify({result})+'\n');
  }catch(error){const code=error instanceof Error&&['INVALID_STORY_CONTENT','CONTENT_PUBLICATION_CONFLICT','FIRST_STORY_GATE_REQUIRED','IMMUTABLE_CONTENT_CONFLICT'].includes(error.message)?error.message:'DEPENDENCY_UNAVAILABLE';process.stdout.write(JSON.stringify({error:{code,status:503}})+'\n');}
 }}finally{await mf.dispose();}
}
main().catch(error=>{
 const publicCodes=['INVALID_STORY_CONTENT','FIRST_STORY_GATE_REQUIRED','IMMUTABLE_CONTENT_CONFLICT'];
 const frames=error instanceof Error?error.stack?.split('\n').slice(1,5).map(line=>/\bat ([A-Za-z0-9_.$]+)/.exec(line)?.[1]??'unknown'):[];
 const detail=error instanceof TypeError?error.message.replace(/https?:\/\/\S+|[A-Za-z]:[\\/]\S+/g,'[local-endpoint]').slice(0,180):undefined;
 process.stderr.write(JSON.stringify({failure:'isolated-platform-runner',phase:startupPhase,code:error instanceof Error&&publicCodes.includes(error.message)?error.message:'DEPENDENCY_UNAVAILABLE',type:error instanceof Error?error.name:'unknown',detail,frames})+'\n');process.exitCode=1;
});
