import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {readFileSync} from 'node:fs';import {createInterface} from 'node:readline';
import {dispatch,ready,probeKey,probeText} from '../../cloudflare/src/platform';
// Test-only private stdin/stdout IPC. No listening socket, persisted DB or application endpoint.
async function main(){
 const root=process.argv[2];const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-10-24',d1Databases:{DB:'isolated-application-test'},r2Buckets:{FILES:'isolated-application-files'}}));
 const db=await mf.getD1Database('DB') as unknown as D1Database;const files=await mf.getR2Bucket('FILES') as unknown as R2Bucket;
 const sql=readFileSync(`${root}/cloudflare/migrations/0001_foundation.sql`,'utf8');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)').run();await db.prepare('INSERT INTO d1_migrations(name) VALUES(?)').bind('0001_foundation.sql').run();await files.put(probeKey,probeText);
 const env={DB:db,FILES:files,APP_ENV:'local',EmailDeliveryMode:'Log',EXPECTED_MIGRATION:'0001_foundation.sql'};
 let providerMode='success',providerCalls=0,templatesValid=true,mailCode='000001';
 const cloud={...env,APP_ENV:'staging',EmailDeliveryMode:'Cloudflare',EMAIL_FROM:'verified@test.invalid',EMAIL:{async send(message:{from:string,to:string,subject:string,text:string}){
  providerCalls++;templatesValid=templatesValid&&message.from==='verified@test.invalid'&&message.to==='owner@example.com'&&['心動迴路：驗證 Email','心動迴路：重設密碼'].includes(message.subject)&&message.text===`您的驗證碼為 ${mailCode}。有效期限 10 分鐘。若非本人操作，請忽略此信。`;
  if(providerMode==='timeout')await new Promise(resolve=>setTimeout(resolve,11000));if(providerMode!=='success')throw new Error('provider-private');return{messageId:'controlled-provider-message'};
 }}};
 process.stdout.write('{"ready":true}\n');
 try{for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
  try{const {command,payload,now}=JSON.parse(line);let result;
   if(command==='$test-provider'){providerMode=payload.mode;if(payload.reset!==false){providerCalls=0;templatesValid=true;}result={configured:true};}
   else if(command==='$test-provider-stats')result={calls:providerCalls,templatesValid};
   else if(command==='$test-sql')result={rows:(await db.prepare(payload.sql).bind(...payload.values).all()).results};
   else if(command==='email.code.send'){
    mailCode=String(payload.code);
    const response=await dispatch(new Request('http://platform.internal/v1/commands/email.code.send',{method:'POST',body:JSON.stringify(payload)}),cloud,now);
    const body=await response.json();if(!response.ok){process.stdout.write(JSON.stringify({error:body})+'\n');continue;}result=body;
   }
   else if(command==='platform.ready')result=await ready(env);
   else {const response=await dispatch(new Request(`http://platform.internal/v1/commands/${command}`,{method:'POST',body:JSON.stringify(payload)}),env,now);const body=await response.json();if(!response.ok){process.stdout.write(JSON.stringify({error:body})+'\n');continue;}result=body;}
   process.stdout.write(JSON.stringify({result})+'\n');
  }catch{process.stdout.write('{"error":"DEPENDENCY_UNAVAILABLE"}\n');}
 }}finally{await mf.dispose();}
}
main().catch(()=>{process.stderr.write('Isolated platform test runner failed\n');process.exitCode=1;});
