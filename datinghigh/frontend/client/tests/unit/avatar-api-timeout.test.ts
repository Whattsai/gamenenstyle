import{afterEach,it,expect,vi}from'vitest';
import{ApiClient,type ClientPlatform}from'../../src/api';
afterEach(()=>{vi.useRealTimers();});
const store={get:async()=>null,set:async()=>{},remove:async()=>{}};
it.each((['web','android'] as ClientPlatform[]).flatMap(platform=>['/me/avatar/generations','/me/avatar/expressions/next'].map(path=>({platform,path}))))('$platform $path waits for a bounded slow provider without aborting early or resending',async({platform,path})=>{
 vi.useFakeTimers();
 const fetcher=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  if(String(url).endsWith('/profile-catalog'))return new Response('{}');
  return await new Promise<Response>((resolve,reject)=>{const timer=setTimeout(()=>resolve(new Response('{"status":"building"}')),87000);init!.signal!.addEventListener('abort',()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));});});
 });
 const api=new ApiClient('http://client.test',platform,store,fetcher as typeof fetch);await api.request('/profile-catalog');
 let result:unknown,failure:unknown;const pending=api.request(path,'POST',{}).then(x=>result=x,e=>failure=e);
 await vi.advanceTimersByTimeAsync(87000);await pending;
 expect(failure).toBeUndefined();expect(result).toEqual({status:'building'});expect(fetcher).toHaveBeenCalledTimes(2);
});
it.each(['web','android'] as ClientPlatform[])('%s an expression beyond the image deadline becomes uncertain once without an automatic paid retry',async platform=>{
 vi.useFakeTimers();let writes=0;
 const fetcher=vi.fn(async(_url:RequestInfo|URL,init?:RequestInit)=>{writes++;return await new Promise<Response>((_resolve,reject)=>init!.signal!.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))));});
 const api=new ApiClient('http://client.test',platform,store,fetcher as typeof fetch);let failure:unknown;const pending=api.request('/me/avatar/expressions/next','POST',{}).catch(e=>failure=e);
 await vi.advanceTimersByTimeAsync(109999);expect(failure).toBeUndefined();
 await vi.advanceTimersByTimeAsync(1);await pending;expect(failure).toMatchObject({code:'NETWORK_ERROR',uncertain:true});expect(writes).toBe(1);
});
