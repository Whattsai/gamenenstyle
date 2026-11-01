import{it,expect,vi,afterEach}from'vitest';import{dispatch,type PlatformEnv}from'../src/platform';
const env={APP_ENV:'local',EmailDeliveryMode:'Log',DB:{prepare:vi.fn()},FILES:{}} as unknown as PlatformEnv;
const request=(body:object={})=>new Request('http://platform.internal/v1/commands/external.google-jwks',{method:'POST',body:JSON.stringify(body)});
afterEach(()=>vi.unstubAllGlobals());
it('PF-UT-024 internal Google keys use one fixed HTTPS GET without forwarding credentials',async()=>{
 const keys={keys:[{kty:'RSA',kid:'controlled-public-key',n:'AQAB',e:'AQAB'}]},fetcher=vi.fn(async()=>Response.json(keys));vi.stubGlobal('fetch',fetcher);const result=await dispatch(request(),env);expect(result.status).toBe(200);expect(await result.json()).toEqual(keys);expect(fetcher).toHaveBeenCalledOnce();const[url,options]=fetcher.mock.calls[0] as unknown as [string,RequestInit];expect(url).toBe('https://www.googleapis.com/oauth2/v3/certs');expect(options.method).toBe('GET');expect(options.redirect).toBe('manual');expect(new Headers(options.headers).get('Authorization')).toBeNull();expect(new Headers(options.headers).get('Cookie')).toBeNull();expect(options.signal).toBeInstanceOf(AbortSignal);
});
it('PF-UT-024 callers cannot select a Google key source or attach credentials',async()=>{
 const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);for(const body of [{url:'https://untrusted.example/keys'},{credential:'controlled-proof'}])expect((await dispatch(request(body),env)).status).toBe(400);expect(fetcher).not.toHaveBeenCalled();
});
it.each(['redirect','unavailable','invalid-json','empty-keys','oversized'])('PF-UT-024 Google key source %s fails closed as a dependency error',async mode=>{
 vi.stubGlobal('fetch',vi.fn(async()=>mode==='redirect'?new Response(null,{status:302,headers:{Location:'https://untrusted.example/keys'}}):mode==='unavailable'?new Response(null,{status:503}):mode==='invalid-json'?new Response('not JSON'):mode==='empty-keys'?Response.json({keys:[]}):new Response('x'.repeat(65537))));const response=await dispatch(request(),env);expect(response.status).toBe(503);expect((await response.json() as any).code).toBe('DEPENDENCY_UNAVAILABLE');
});
