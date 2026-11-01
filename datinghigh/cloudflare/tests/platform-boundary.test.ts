import {it,expect,vi} from 'vitest';
import {route,trustedHeaders} from '../src/router';
const localWeb='http://localhost:8081';
it.each(['exception','plain-error'])('PF-UT-069 PF-API-048 Worker %s failures remain readable by the configured Web origin',async kind=>{
 const handler=vi.fn(async()=>{if(kind==='exception')throw new Error('container disconnected');return new Response('internal startup detail',{status:500});});const response=await route(new Request('http://localhost:8787/api/v1/sessions/external/google',{method:'POST',headers:{Origin:localWeb,'Content-Type':'application/json','X-DatingHigh-Client':'web'},body:'{}'}),'local',handler,vi.fn(),localWeb);expect(response.status).toBe(503);expect(response.headers.get('Access-Control-Allow-Origin')).toBe(localWeb);expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');expect(response.headers.get('Vary')).toContain('Origin');expect((await response.json() as any).traceId).toBeTruthy();
});
it('PF-UT-069 PF-API-048 trusted preflight is answered without starting an unavailable container',async()=>{
 const handler=vi.fn(async()=>{throw new Error('unavailable');});const response=await route(new Request('http://localhost:8787/api/v1/session',{method:'OPTIONS',headers:{Origin:localWeb,'Access-Control-Request-Method':'DELETE','Access-Control-Request-Headers':'content-type,x-datinghigh-client'}}),'local',handler,vi.fn(),localWeb);expect(response.status).toBe(204);expect(handler).not.toHaveBeenCalled();expect(response.headers.get('Access-Control-Allow-Origin')).toBe(localWeb);expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-DatingHigh-Client');
});
it.each([{origin:'https://untrusted.example',method:'POST',headers:'content-type'},{origin:localWeb,method:'TRACE',headers:'content-type'},{origin:localWeb,method:'POST',headers:'x-datinghigh-expected-session'}])('PF-API-048 preflight never grants unconfigured origins, methods or headers: %j',async value=>{
 const handler=vi.fn();const response=await route(new Request('http://localhost:8787/api/v1/session',{method:'OPTIONS',headers:{Origin:value.origin,'Access-Control-Request-Method':value.method,'Access-Control-Request-Headers':value.headers}}),'local',handler,vi.fn(),localWeb);expect(response.status).toBe(403);expect(handler).not.toHaveBeenCalled();expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
});
it('PF-API-048 Worker errors never expose credentialed CORS to an untrusted or absent origin',async()=>{
 for(const origin of [undefined,'https://untrusted.example']){const headers:Record<string,string>=origin?{Origin:origin}:{};const response=await route(new Request('http://localhost:8787/api/v1/session',{headers}),'local',async()=>{throw new Error('unavailable');},vi.fn(),localWeb);expect(response.status).toBe(503);expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();}
});
it('PF-UT-068 strips all spoofed internal context and rejects public internal commands',async()=>{
 const request=new Request('https://example.com/api/v1/me',{headers:{'X-DatingHigh-Internal-User':'victim','X-DatingHigh-Internal-Client-Ip':'evil','CF-Connecting-IP':'::ffff:192.0.2.1','X-Forwarded-For':'evil'}});
 const headers=trustedHeaders(request,'staging');expect(headers.has('X-DatingHigh-Internal-User')).toBe(false);expect(headers.get('X-DatingHigh-Internal-Client-Ip')).toBe('192.0.2.1');
 const container=vi.fn(),assets=vi.fn();expect((await route(new Request('https://example.com/internal/commands'), 'local',container,assets)).status).toBe(404);expect(container).not.toHaveBeenCalled();
});
it('PF-UT-069 PF-API-051 sanitizes startup exceptions and non-problem container responses',async()=>{
 for(const callback of [async()=>{throw new Error('Startup timeout secret /path/db');},async()=>new Response('Failed to start container: internal secret', {status:500})]){
  const result=await route(new Request('https://example.com/health/live'),'local',callback,vi.fn());
  expect([503,504]).toContain(result.status);const body=await result.json() as any;expect(body.traceId).toBeTruthy();expect(JSON.stringify(body)).not.toContain('secret');
 }
});
it('PF-BDD-092 a startup timeout returns the exact safe 504 contract',async()=>{
 const result=await route(new Request('https://example.com/health/live'),'local',async()=>{throw new Error('startup timeout controlled-private-detail');},vi.fn());expect(result.status).toBe(504);const body=await result.json() as {code:string,traceId:string};expect(body.code).toBe('STARTUP_TIMEOUT');expect(body.traceId).toBeTruthy();expect(JSON.stringify(body)).not.toContain('controlled-private-detail');
});
