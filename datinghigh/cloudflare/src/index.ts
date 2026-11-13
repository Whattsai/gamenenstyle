import { Container, getContainer } from '@cloudflare/containers';
import { cleanup, dispatch, type PlatformEnv } from './platform';
import { route } from './router';
import {serveStoryAsset} from './story-content';
export {GameRoomSocket} from './room-socket';
export {ContainerProxy} from '@cloudflare/containers';
interface Env extends PlatformEnv {
 API:DurableObjectNamespace<ApiContainer>;ASSETS:Fetcher;WEB_ORIGIN:string;ACCESS_TOKEN_ISSUER:string;ACCESS_TOKEN_AUDIENCE:string;ACCESS_TOKEN_SECRET:string;EMAIL_CODE_HMAC_KEY:string;RATE_LIMIT_HMAC_KEY:string;
 GOOGLE_WEB_CLIENT_ID?:string;GOOGLE_IOS_ALLOWED_CLIENTS?:string;GOOGLE_ANDROID_ALLOWED_CLIENTS?:string;
 GEMINI_API_KEY?:string;GEMINI_IMAGE_MODEL?:string;
}
export class ApiContainer extends Container<Env>{
 defaultPort=8080;sleepAfter='10m';enableInternet=true;
 envVars={APP_ENV:this.env.APP_ENV,WEB_ORIGIN:this.env.WEB_ORIGIN,ACCESS_TOKEN_ISSUER:this.env.ACCESS_TOKEN_ISSUER,ACCESS_TOKEN_AUDIENCE:this.env.ACCESS_TOKEN_AUDIENCE,ACCESS_TOKEN_SECRET:this.env.ACCESS_TOKEN_SECRET,EMAIL_CODE_HMAC_KEY:this.env.EMAIL_CODE_HMAC_KEY,RATE_LIMIT_HMAC_KEY:this.env.RATE_LIMIT_HMAC_KEY,EmailDeliveryMode:this.env.EmailDeliveryMode,GOOGLE_WEB_CLIENT_ID:this.env.GOOGLE_WEB_CLIENT_ID??'',GOOGLE_IOS_ALLOWED_CLIENTS:this.env.GOOGLE_IOS_ALLOWED_CLIENTS??'',GOOGLE_ANDROID_ALLOWED_CLIENTS:this.env.GOOGLE_ANDROID_ALLOWED_CLIENTS??'',GEMINI_API_KEY:this.env.GEMINI_API_KEY??'',GEMINI_IMAGE_MODEL:this.env.GEMINI_IMAGE_MODEL??'gemini-3.1-flash-image'};
}
// 必須呼叫 SDK inherited setter；static field 會遮蔽 setter，使 handler 未註冊。
ApiContainer.outboundByHost={'platform.internal':(r:Request,env:Env)=>dispatch(r,env)};
export default {
 async fetch(request:Request,env:Env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/story-content/'))return serveStoryAsset(request,env);
  const roundId=url.pathname.match(/^\/api\/v1\/game-rounds\/([0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/ws$/)?.[1];
  if(roundId&&request.headers.get('Upgrade')?.toLowerCase()==='websocket'){
   if(!env.GAME_ROOMS)return new Response(null,{status:503});
   return env.GAME_ROOMS.get(env.GAME_ROOMS.idFromName(roundId)).fetch(request);
  }
  return route(request,env.APP_ENV,r=>getContainer(env.API,'api-v1').fetch(r),r=>env.ASSETS.fetch(r),env.WEB_ORIGIN);
 },
 async scheduled(_event:ScheduledController,env:Env,ctx:ExecutionContext){ctx.waitUntil(cleanup(env).then(result=>{console.log(JSON.stringify({event:'cleanup',...result}));}).catch(()=>{console.error(JSON.stringify({event:'cleanup',backlog:true}));throw new Error('Cleanup failed; retry on next scheduled event');}));}
};
