import {build} from 'esbuild';
// @ts-expect-error 共用本地發布政策。
import {buildStoryBundle} from '../../tools/story-content-policy.mjs';
// @ts-expect-error 共用分層內容與固定 prepared Publisher。
import {buildSceneEventBundle} from '../../tools/scene-event-content-policy.mjs';
// @ts-expect-error 共用分層內容與固定 prepared Publisher。
import {publishSceneEventBundles} from '../../tools/scene-event-publish-policy.mjs';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';import {createInterface} from 'node:readline';
import {dispatch,ready,probeKey,probeText} from '../../cloudflare/src/platform';
// Test-only private stdin/stdout IPC. No listening socket, persisted DB or application endpoint.
async function main(){
 const root=process.argv[2];
 const compiled=await build({stdin:{contents:`import {DurableObject} from 'cloudflare:workers';import {GameRoomSocket} from './src/room-socket';import {serveStoryAsset} from './src/story-content';export {GameRoomSocket};
 export class TestApiGateway extends DurableObject {async fetch(r){const u=new URL(r.url);if(u.pathname==='/_configure'){await this.ctx.storage.put('origin',await r.json());return new Response('ok');}const cfg=await this.ctx.storage.get('origin');if(!cfg)return new Response(null,{status:503});const headers=new Headers(r.headers);headers.set('X-DatingHigh-Test-Control',cfg.key);return fetch(new Request(cfg.origin+'/_test/round-command',{method:r.method,headers,body:r.body,redirect:'manual'}));}}
 export default {async fetch(r,env){const u=new URL(r.url);const round=u.pathname.match(/^\\/api\\/v1\\/game-rounds\\/([0-9a-f-]+)\\/ws$/)?.[1];if(round)return env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(round)).fetch(r);if(u.pathname.startsWith('/story-content/'))return serveStoryAsset(r,env);return new Response(null,{status:404});}};`,resolveDir:root+'/cloudflare',loader:'ts'},bundle:true,write:false,format:'esm',platform:'neutral',external:['cloudflare:workers'],conditions:['workerd','worker','browser']});
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-10-24',d1Databases:{DB:'isolated-application-test'},r2Buckets:{FILES:'isolated-application-files',STORY_CONTENT:'isolated-story-content'},durableObjects:{GAME_ROOMS:{className:'GameRoomSocket',useSQLite:true},API:{className:'TestApiGateway',useSQLite:true}},bindings:{ROUND_TICKET_HMAC_KEY:'isolated-test-only-realtime-secret-32-bytes',WEB_ORIGIN:'http://localhost:8081',APP_ENV:'local'}}));
 const db=await mf.getD1Database('DB') as unknown as D1Database;const files=await mf.getR2Bucket('FILES') as unknown as R2Bucket;
 const storyContent=await mf.getR2Bucket('STORY_CONTENT') as unknown as R2Bucket;const rooms=await mf.getDurableObjectNamespace('GAME_ROOMS');const gateway=await mf.getDurableObjectNamespace('API');
 for(const name of ['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql','0005_story_dialogue_exit.sql']){
  const sql=readFileSync(`${root}/cloudflare/migrations/${name}`,'utf8');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 }
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare('INSERT INTO d1_migrations(name) VALUES(?)').bind('0005_story_dialogue_exit.sql').run();await files.put(probeKey,probeText);
 const story=JSON.parse(readFileSync(root+'/contracts/story-scenes.json','utf8')).stories[0];const bundle=buildStoryBundle(story,root);
 await storyContent.put(bundle.key,bundle.bytes,{httpMetadata:{contentType:'application/json'}});
 for(const asset of bundle.assets)await storyContent.put(asset.key,asset.bytes,{httpMetadata:{contentType:asset.mimeType}});
 await db.prepare("INSERT INTO content_story_catalog VALUES(?,?,?,?,?,?,?,'published',?)").bind(story.catalogId,story.storyId,story.version,JSON.stringify(story.interestTagIds),story.recommendationPriority,bundle.key,bundle.sha256,Date.now()).run();
 let matchingFault:string|null=null;
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
 const assets={fetch:async(request:Request)=>{const url=new URL(request.url);if(url.search||!/^\/avatars\/full-body\.v1\/(?:male|female)-0[1-8]\/[0-9a-f]{64}\.webp$/.test(url.pathname))return new Response(null,{status:404});try{return new Response(new Uint8Array(readFileSync(root+'/frontend/client/public'+url.pathname)),{headers:{'Content-Type':'image/webp'}});}catch{return new Response(null,{status:404});}}} as unknown as Fetcher;
 const env={DB:faultDb,FILES:files,STORY_CONTENT:storyContent,ASSETS:assets,GAME_ROOMS:rooms as unknown as DurableObjectNamespace,ROUND_TICKET_HMAC_KEY:'isolated-test-only-realtime-secret-32-bytes',WEB_ORIGIN:'http://localhost:8081',APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0005_story_dialogue_exit.sql'};
 let socketOrigin:string|null=null;
 let providerMode='success',providerCalls=0,templatesValid=true,mailCode='000001';
 const cloud={...env,APP_ENV:'staging',EmailDeliveryMode:'Cloudflare',EMAIL_FROM:'verified@test.invalid',EMAIL:{async send(message:{from:string,to:string,subject:string,text:string}){
  providerCalls++;templatesValid=templatesValid&&message.from==='verified@test.invalid'&&message.to==='owner@example.com'&&['心動迴路：驗證 Email','心動迴路：重設密碼'].includes(message.subject)&&message.text===`您的驗證碼為 ${mailCode}。有效期限 10 分鐘。若非本人操作，請忽略此信。`;
  if(providerMode==='timeout')await new Promise(resolve=>setTimeout(resolve,11000));if(providerMode!=='success')throw new Error('provider-private');return{messageId:'controlled-provider-message'};
 }}};
 process.stdout.write('{"ready":true}\n');
 try{for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
  try{const {command,payload,now}=JSON.parse(line);let result;
   if(command==='$test-realtime-origin'){const origin=new URL(payload.origin);if(!['127.0.0.1','localhost'].includes(origin.hostname))throw new Error('Invalid test origin');await gateway.get(gateway.idFromName('api-v1')).fetch(new Request('http://test/_configure',{method:'POST',body:JSON.stringify({origin:origin.origin,key:payload.key})}));socketOrigin=(await mf.ready).origin;result={origin:socketOrigin};}
   else if(command==='$test-arm-matching-fault'){if(!['accept-second-participant','profile-projection-zero','accept-zero'].includes(payload.mode))throw new Error('Invalid matching fault');matchingFault=payload.mode;result={armed:true};}
   else if(command==='$test-matching-fault-state')result={armed:matchingFault!==null};
   else if(command==='$test-provider'){providerMode=payload.mode;if(payload.reset!==false){providerCalls=0;templatesValid=true;}result={configured:true};}
   else if(command==='$test-provider-stats')result={calls:providerCalls,templatesValid};
   else if(command==='$test-framework-enable'){
    const sql=readFileSync(root+'/cloudflare/migrations/0006_scene_event_framework.sql','utf8');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
    await db.prepare('DELETE FROM content_story_catalog').run();
    const definition=JSON.parse(readFileSync(root+'/contracts/scene-event-content.json','utf8')).stories[0];const layered=buildSceneEventBundle(story,root,definition);
    await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});env.EXPECTED_MIGRATION='0006_scene_event_framework.sql';result={enabled:true};
   }
   else if(command==='$test-framework-linear'){
    if(env.EXPECTED_MIGRATION!=='0006_scene_event_framework.sql')throw new Error('Framework required');const definition=JSON.parse(readFileSync(root+'/contracts/scene-event-content.json','utf8')).stories[0];
    const entry=structuredClone(story.nodes[0]),ending=structuredClone(story.nodes.find(n=>n.ending));entry.objects=[];entry.choices=[{id:'finish',label:'完成這段閱讀',next:'ending-only'}];delete entry.interactionId;entry.presentation.hotspotIds=[];ending.id='ending-only';ending.objects=[];ending.choices=[];delete ending.interactionId;ending.presentation.hotspotIds=[];
    const linear={...story,nodes:[entry,ending],interactions:[],scenePresentation:{...story.scenePresentation,hotspots:[]}};
    const layered=buildSceneEventBundle(linear,root,{...definition,sceneCatalogId:'019a281e-0000-7000-8000-000000006301',narrativeCatalogId:'019a281e-0000-7000-8000-000000006302',sceneVersion:'v50',narrativeVersion:'v50',poolVersion:'v50',bindingSources:{},bindingOverrides:{}});await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});result={configured:true};
   }
   else if(command==='$test-framework-events'){
    if(env.EXPECTED_MIGRATION!=='0006_scene_event_framework.sql'||![0,1].includes(payload.probability))throw new Error('Invalid isolated event fixture');
    const definition=JSON.parse(readFileSync(root+'/contracts/scene-event-content.json','utf8')).stories[0],version=`v${40+payload.probability}`;
    const layered=buildSceneEventBundle(story,root,{...definition,sceneCatalogId:`019a281e-0000-7000-8000-${String(6201+payload.probability*10).padStart(12,'0')}`,narrativeCatalogId:`019a281e-0000-7000-8000-${String(6202+payload.probability*10).padStart(12,'0')}`,sceneVersion:version,narrativeVersion:version,poolVersion:version,bindingOverrides:{...definition.bindingOverrides,bookmark:{...definition.bindingOverrides.bookmark,visibility:'hidden',selectionMode:'weighted_random',probability:payload.probability,triggerConditions:{choice_committed:'enter'}}},globalBindings:[{bindingId:'global-note',eventId:'bookmark',narrativeRole:'side',visibility:'hidden',requiredCapabilities:['bookshop'],repeatScope:'round',repeatGroup:'global-note',triggerConditions:{event_completed:'scene:rain-bookshop:bookmark'}}]});
    await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});result={configured:true};
   }
   else if(command==='$test-framework-categories'){
    if(env.EXPECTED_MIGRATION!=='0006_scene_event_framework.sql'||![2,3].includes(payload.count))throw new Error('Invalid isolated category count');
    const definition=JSON.parse(readFileSync(root+'/contracts/scene-event-content.json','utf8')).stories[0],version=`v${payload.count}0`;
    const categories=[definition.categories[0],...Array.from({length:payload.count-1},(_,n)=>({categoryId:`019a281e-0000-7000-8000-${String(4204+n).padStart(12,'0')}`,code:['mystery','travel'][n],version:'v1',title:['懸疑','旅程'][n],interestTagIds:['coffee'],recommendationPriority:n+2}))];
    const layered=buildSceneEventBundle(story,root,{...definition,sceneCatalogId:`019a281e-0000-7000-8000-${String(6000+payload.count).padStart(12,'0')}`,narrativeCatalogId:`019a281e-0000-7000-8000-${String(6100+payload.count).padStart(12,'0')}`,sceneVersion:version,narrativeVersion:version,categories,eligibleCategoryCodes:categories.map(c=>c.code)});
    await publishSceneEventBundles(db,storyContent,[layered],{now,validationRoot:root});result={categories:categories.map(c=>({categoryId:c.categoryId,title:c.title}))};
   }
   else if(command==='$test-story-catalogs'){
    if(![2,3].includes(payload.count))throw new Error('Invalid isolated catalog count');const catalogs=[story.catalogId];
    for(let n=2;n<=payload.count;n++){const fixture=structuredClone(story);fixture.storyId=`scene-${90+n}`;fixture.catalogId=`019a281e-0000-7000-8000-${String(900+n).padStart(12,'0')}`;fixture.title=`隔離完整內容 fixture ${n}`;const built=buildStoryBundle(fixture,root);await storyContent.put(built.key,built.bytes,{httpMetadata:{contentType:'application/json'}});await db.prepare("INSERT INTO content_story_catalog VALUES(?,?,?,?,?,?,?,'published',?)").bind(fixture.catalogId,fixture.storyId,fixture.version,JSON.stringify(fixture.interestTagIds),n,built.key,built.sha256,now).run();catalogs.push(fixture.catalogId);}
    result={catalogs};
   }
   else if(command==='$test-sql')result={rows:(await db.prepare(payload.sql).bind(...payload.values).all()).results};
   else if(command==='$test-r2-list'){const page=await files.list({prefix:'private/',limit:1000});result={keys:page.objects.map(object=>object.key),truncated:page.truncated};}
   else if(command==='$test-media'){
    const path=payload.path??`/v1/media/personal-photos/${payload.assetId}`;
    if(!/^\/v1\/(?:media\/(?:personal-photos|assets)\/[0-9a-f-]+|avatar\/candidates\/[0-9a-f-]+(?:\/[1-4])?|avatar\/expressions\/[0-9a-f-]+\/(?:neutral|smile|surprised|thoughtful|concerned)|avatar\/(?:assets|rounds)\/[0-9a-f-]+\/[0-9a-f]{64}\/(?:neutral|smile|surprised|thoughtful|concerned))$/.test(path))throw new Error('Invalid private test media path');
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
  }catch{process.stdout.write('{"error":"DEPENDENCY_UNAVAILABLE"}\n');}
 }}finally{await mf.dispose();}
}
main().catch(()=>{process.stderr.write('Isolated platform test runner failed\n');process.exitCode=1;});
