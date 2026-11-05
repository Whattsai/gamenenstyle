import {expect,it,vi} from 'vitest';
import {ApiClient,type CredentialStore} from '../../src/api';
const store:CredentialStore={get:async()=>null,set:async()=>{},remove:async()=>{}};
it('AP-API-040 photo binary transport preserves native authorization and original JSON routes',async()=>{
 const fetcher=vi.fn(async(_input:RequestInfo|URL,_options?:RequestInit)=>new Response('{"assetId":"saved"}',{status:201}));
 const api=new ApiClient('https://api.example','android',store,fetcher as typeof fetch);api.access='memory-only-test';
 const photo=new Blob([new Uint8Array([1,2,3])],{type:'image/png'});
 await api.uploadPhoto(photo);
 const options=fetcher.mock.calls[0][1] as RequestInit;
 expect(options.body).toBe(photo);expect(options.headers).toMatchObject({'Content-Type':'image/png',Authorization:'Bearer memory-only-test'});
 await api.request('/me/dating-profile','PUT',{nickname:'星河'});
 expect((fetcher.mock.calls[1][1] as RequestInit).headers).toMatchObject({'Content-Type':'application/json'});
});
it('AP-BDD-059 oversize, invalid image type and unknown upload result never replay mutation',async()=>{
 const fetcher=vi.fn(async()=>{throw new TypeError('offline');});
 const api=new ApiClient('','web',store,fetcher as typeof fetch);
 await expect(api.uploadPhoto(new Blob([new Uint8Array(8*1024*1024+1)],{type:'image/jpeg'}))).rejects.toMatchObject({code:'IMAGE_TOO_LARGE'});
 await expect(api.uploadPhoto(new Blob(['x'],{type:'text/plain'}))).rejects.toMatchObject({code:'INVALID_IMAGE'});
 expect(fetcher).not.toHaveBeenCalled();
 await expect(api.uploadPhoto(new Blob([new Uint8Array([1])],{type:'image/jpeg'}))).rejects.toMatchObject({uncertain:true});
 expect(fetcher).toHaveBeenCalledTimes(1);
});
