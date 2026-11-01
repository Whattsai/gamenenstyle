import {problem} from './platform';
const corsMethods=['GET','POST','PUT','DELETE','OPTIONS'];
const corsHeaders=['content-type','x-datinghigh-client','authorization'];
function permittedOrigin(request:Request,origin?:string){try{const configured=new URL(origin??'');return ['http:','https:'].includes(configured.protocol)&&configured.origin===origin&&request.headers.get('Origin')===origin;}catch{return false;}}
function withCors(response:Response,request:Request,origin?:string){
 if(!permittedOrigin(request,origin))return response;
 const headers=new Headers(response.headers);headers.set('Access-Control-Allow-Origin',origin!);headers.set('Access-Control-Allow-Credentials','true');headers.set('Access-Control-Expose-Headers','X-DatingHigh-Session, Retry-After, Date');headers.set('Vary','Origin');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
export function trustedHeaders(request:Request,environment:string){
 const headers=new Headers(request.headers);
 for(const key of [...headers.keys()])if(key.toLowerCase().startsWith('x-datinghigh-internal-'))headers.delete(key);
 headers.set('X-DatingHigh-Internal-Request-Id',crypto.randomUUID());
 headers.set('X-DatingHigh-Internal-Environment',environment);
 const ip=environment==='local'?'127.0.0.1':request.headers.get('CF-Connecting-IP');
 // CF-Connecting-IP 是 Cloudflare 管理的 ingress 標頭；外部 X-Forwarded-For 不採用。
 if(ip)headers.set('X-DatingHigh-Internal-Client-Ip',ip.toLowerCase().replace(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/,'$1'));
 return headers;
}
export async function route(request:Request,environment:string,container:(r:Request)=>Promise<Response>,assets:(r:Request)=>Promise<Response>,webOrigin?:string){
 const path=new URL(request.url).pathname;
 if(path==='/internal'||path.startsWith('/internal/')||path.startsWith('/v1/commands/'))return withCors(problem('NOT_FOUND',404),request,webOrigin);
 if(path==='/api'||path.startsWith('/api/')||path==='/health'||path.startsWith('/health/')){
  if(request.method==='OPTIONS'&&request.headers.has('Origin')){
   const method=request.headers.get('Access-Control-Request-Method'),headers=(request.headers.get('Access-Control-Request-Headers')??'').split(',').map(h=>h.trim().toLowerCase()).filter(Boolean);
   if(!permittedOrigin(request,webOrigin)||!method||!corsMethods.includes(method)||headers.some(h=>!corsHeaders.includes(h)))return problem('ORIGIN_FORBIDDEN',403);
   return withCors(new Response(null,{status:204,headers:{'Access-Control-Allow-Methods':corsMethods.join(', '),'Access-Control-Allow-Headers':'Content-Type, X-DatingHigh-Client, Authorization','Cache-Control':'no-store'}}),request,webOrigin);
  }
  try{
   const response=await container(new Request(request,{headers:trustedHeaders(request,environment)}));
   if(response.status>=500&&!response.headers.get('Content-Type')?.startsWith('application/problem+json'))return withCors(problem('DEPENDENCY_UNAVAILABLE',503),request,webOrigin);
   return response;
  }
  catch(e){return withCors(problem(e instanceof Error&&/timeout/i.test(e.message)?'STARTUP_TIMEOUT':'DEPENDENCY_UNAVAILABLE',e instanceof Error&&/timeout/i.test(e.message)?504:503),request,webOrigin);}
 }
 return assets(request);
}
