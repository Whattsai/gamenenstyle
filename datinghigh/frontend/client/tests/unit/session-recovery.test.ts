import {it,expect,vi} from 'vitest';
import {ApiClient,ApiFailure,type CredentialStore} from '../../src/api';
const store=():CredentialStore=>({get:vi.fn(async()=>null),set:vi.fn(async()=>{}),remove:vi.fn(async()=>{})});
const json=(data:unknown,status=200,session='s1')=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','X-DatingHigh-Session':session}});
it('PF-BDD-021 lost Web refresh first confirms a received Cookie without replaying rotation',async()=>{
 const calls:string[]=[];const fetcher=vi.fn(async(input:RequestInfo|URL)=>{const path=String(input);calls.push(path);if(path.endsWith('/session/refresh'))throw new Error('controlled lost response');return json({account:{accountId:'owner'},session:{sessionId:'s1'}});});const api=new ApiClient('','web',store(),fetcher as typeof fetch);api.sessionId='s1';await expect(api.refresh()).resolves.toBeUndefined();expect(calls).toEqual(['/api/v1/session/refresh','/api/v1/session']);expect(api.sessionId).toBe('s1');
});
it('PF-BDD-021 lost Web refresh retries the previous Cookie once only after missing Access confirmation',async()=>{
 const calls:string[]=[];let rotations=0;const fetcher=vi.fn(async(input:RequestInfo|URL)=>{const path=String(input);calls.push(path);if(path.endsWith('/session/refresh')){if(++rotations===1)throw new Error('controlled lost response');return json({account:{accountId:'owner'},session:{sessionId:'s1'}});}return json({code:'ACCESS_TOKEN_MISSING'},401);});const api=new ApiClient('','web',store(),fetcher as typeof fetch);api.sessionId='s1';await expect(api.refresh()).resolves.toBeUndefined();expect(calls).toEqual(['/api/v1/session/refresh','/api/v1/session','/api/v1/session/refresh']);expect(api.sessionId).toBe('s1');
});
it('PF-BDD-021 lost Web refresh never adopts a different Cookie family',async()=>{
 const calls:string[]=[];const fetcher=vi.fn(async(input:RequestInfo|URL)=>{const path=String(input);calls.push(path);if(path.endsWith('/session/refresh'))throw new Error('controlled lost response');return json({account:{accountId:'other'},session:{sessionId:'s2'}},200,'s2');});const api=new ApiClient('','web',store(),fetcher as typeof fetch);api.sessionId='s1';api.account={accountId:'old'} as any;await expect(api.refresh()).rejects.toMatchObject({code:'SESSION_CHANGED'});expect(calls).toEqual(['/api/v1/session/refresh','/api/v1/session']);expect(api.account).toBeUndefined();
});
it.each([['read-unavailable',503,'DEPENDENCY_UNAVAILABLE'],['revoked',401,'SESSION_REVOKED']])('PF-BDD-021 lost Web refresh with %s never blindly retries or retains owner',async(_kind,status,code)=>{
 const calls:string[]=[];const fetcher=vi.fn(async(input:RequestInfo|URL)=>{const path=String(input);calls.push(path);if(path.endsWith('/session/refresh'))throw new Error('controlled lost response');return json({code},status);});const api=new ApiClient('','web',store(),fetcher as typeof fetch);api.sessionId='s1';api.account={accountId:'old'} as any;await expect(api.refresh()).rejects.toMatchObject({code});expect(calls).toEqual(['/api/v1/session/refresh','/api/v1/session']);expect(api.account).toBeUndefined();
});
it('PF-BDD-054 a late native SecureStore successor cannot resurrect an account during logout',async()=>{
 let release!:()=>void,started!:()=>void;const entered=new Promise<void>(resolve=>{started=resolve;}),gate=new Promise<void>(resolve=>{release=resolve;});let refresh=JSON.stringify({refreshToken:'old-refresh',sessionId:'s1'}),marker:string|null=null;const storage:CredentialStore={get:vi.fn(async key=>key==='refresh'?refresh:marker),set:vi.fn(async(key,value)=>{if(key==='refresh'){started();await gate;refresh=value;}else marker=value;}),remove:vi.fn(async key=>{if(key==='refresh')refresh='';else marker=null;})};const calls:{path:string,body:any}[]=[];const fetcher=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{const path=String(input);calls.push({path,body:init?.body?JSON.parse(String(init.body)):null});if(path.endsWith('/refresh'))return json({account:{accountId:'owner'},session:{sessionId:'s1'},tokens:{accessToken:'new-access',refreshToken:'new-refresh'}});return new Response(null,{status:204});});const api=new ApiClient('','android',storage,fetcher as typeof fetch);api.sessionId='s1';api.access='old-access';api.account={accountId:'owner'} as any;const rotation=api.refresh().catch(error=>error);await entered;let completed=false;const logout=api.logout().then(result=>{completed=true;return result;});expect(api.account).toBeUndefined();await new Promise(resolve=>setTimeout(resolve,0));const completedBeforeWrite=completed;release();await logout;await rotation;expect(completedBeforeWrite).toBe(false);expect(api.account).toBeUndefined();expect(api.access).toBeUndefined();expect(api.sessionId).toBeUndefined();expect(refresh).toBe('');expect(calls.filter(c=>c.path.endsWith('/session')&&c.body?.refreshToken==='new-refresh')).toHaveLength(1);
});
it('PF-BDD-054 logout retains the old family when an overlapping SecureStore write fails',async()=>{
 let fail!:(error:Error)=>void,started!:()=>void;const entered=new Promise<void>(resolve=>{started=resolve;}),gate=new Promise<void>((_resolve,reject)=>{fail=reject;});let refresh=JSON.stringify({refreshToken:'old-refresh',sessionId:'s1'}),marker:string|null=null;const storage:CredentialStore={get:vi.fn(async key=>key==='refresh'?refresh:marker),set:vi.fn(async(key,value)=>{if(key==='refresh'){started();await gate;}else marker=value;}),remove:vi.fn(async key=>{if(key==='refresh')refresh='';else marker=null;})};const calls:{path:string,body:any}[]=[];const fetcher=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{const path=String(input);calls.push({path,body:init?.body?JSON.parse(String(init.body)):null});if(path.endsWith('/refresh'))return json({account:{accountId:'owner'},session:{sessionId:'s1'},tokens:{accessToken:'new-access',refreshToken:'new-refresh'}});return new Response(null,{status:204});});const api=new ApiClient('','android',storage,fetcher as typeof fetch);api.sessionId='s1';api.access='old-access';api.account={accountId:'owner'} as any;const rotation=api.refresh().catch(error=>error);await entered;const logout=api.logout();fail(new Error('controlled store failure'));await logout;expect((await rotation).code).toBe('SECURE_STORAGE_FAILED');expect(calls.filter(c=>c.path.endsWith('/session')&&c.body?.refreshToken==='old-refresh')).toHaveLength(1);expect(api.account).toBeUndefined();expect(refresh).toBe('');
});
it('PF-BDD-054 a stalled SecureStore write leaves a durable logout intent instead of infinite loading',async()=>{
 vi.useFakeTimers();try{let release!:()=>void,started!:()=>void;const entered=new Promise<void>(resolve=>{started=resolve;}),gate=new Promise<void>(resolve=>{release=resolve;});let refresh=JSON.stringify({refreshToken:'old-refresh',sessionId:'s1'}),marker:string|null=null;const storage:CredentialStore={get:vi.fn(async key=>key==='refresh'?refresh:marker),set:vi.fn(async(key,value)=>{if(key==='refresh'){started();await gate;refresh=value;}else marker=value;}),remove:vi.fn(async key=>{if(key==='refresh')refresh='';else marker=null;})};const fetcher=vi.fn(async(input:RequestInfo|URL)=>String(input).endsWith('/refresh')?json({account:{accountId:'owner'},session:{sessionId:'s1'},tokens:{accessToken:'new-access',refreshToken:'new-refresh'}}):new Response(null,{status:204}));const api=new ApiClient('','android',storage,fetcher as typeof fetch);api.sessionId='s1';api.access='old-access';api.account={accountId:'owner'} as any;const rotation=api.refresh().catch(error=>error);await entered;const logout=api.logout().catch(error=>error);await vi.advanceTimersByTimeAsync(30000);expect((await logout).code).toBe('LOGOUT_PENDING');expect(marker).not.toBeNull();expect(api.pendingRevoke).toBe(true);expect(api.account).toBeUndefined();release();await rotation;await expect(api.retryLogout()).resolves.toBe(true);expect(refresh).toBe('');expect(marker).toBeNull();expect(api.account).toBeUndefined();}finally{vi.useRealTimers();}
});
it('PF-BDD-054 an old native logout never revokes or removes a newer stored family',async()=>{
 let refresh=JSON.stringify({refreshToken:'new-family-refresh',sessionId:'new-family'});const storage:CredentialStore={get:vi.fn(async key=>key==='refresh'?refresh:null),set:vi.fn(async()=>{}),remove:vi.fn(async key=>{if(key==='refresh')refresh='';})};const fetcher=vi.fn(async()=>new Response(null,{status:204}));const api=new ApiClient('','android',storage,fetcher as typeof fetch);api.sessionId='old-family';api.access='old-access';api.account={accountId:'old'} as any;await expect(api.logout()).resolves.toBe(false);expect(fetcher).not.toHaveBeenCalled();expect(JSON.parse(refresh).sessionId).toBe('new-family');expect(api.account).toBeUndefined();
});
it('PF-BDD-054 a pending native logout retry preserves a newer stored family',async()=>{
 let refresh=JSON.stringify({refreshToken:'new-family-refresh',sessionId:'new-family'}),marker:string|null=JSON.stringify({refreshToken:'old-family-refresh',sessionId:'old-family'});const storage:CredentialStore={get:vi.fn(async key=>key==='refresh'?refresh:marker),set:vi.fn(async()=>{}),remove:vi.fn(async key=>{if(key==='refresh')refresh='';else marker=null;})};const fetcher=vi.fn(async()=>new Response(null,{status:204}));const api=new ApiClient('','android',storage,fetcher as typeof fetch);api.pendingRevoke=true;await expect(api.retryLogout()).resolves.toBe(false);expect(fetcher).not.toHaveBeenCalled();expect(JSON.parse(refresh).sessionId).toBe('new-family');expect(marker).toBeNull();expect(api.account).toBeUndefined();
});
it('PF-BDD-054 a new family stored while an old logout waits is preserved',async()=>{
 let release!:()=>void,started!:()=>void;const entered=new Promise<void>(resolve=>{started=resolve;}),gate=new Promise<void>(resolve=>{release=resolve;});let refresh=JSON.stringify({refreshToken:'old-family-refresh',sessionId:'old-family'}),marker:string|null=null;const storage:CredentialStore={get:vi.fn(async key=>key==='refresh'?refresh:marker),set:vi.fn(async(key,value)=>{if(key==='refresh'){started();await gate;refresh=value;}else marker=value;}),remove:vi.fn(async key=>{if(key==='refresh')refresh='';else marker=null;})};const fetcher=vi.fn(async()=>new Response(null,{status:204}));const api=new ApiClient('','android',storage,fetcher as typeof fetch);api.sessionId='old-family';api.access='old-access';api.account={accountId:'old'} as any;const accepting=api.accept({account:{accountId:'new'} as any,session:{sessionId:'new-family'},tokens:{accessToken:'new-access',refreshToken:'new-family-refresh'}}).catch(error=>error);await entered;const logout=api.logout();release();expect(await logout).toBe(false);await accepting;expect(fetcher).not.toHaveBeenCalled();expect(JSON.parse(refresh).sessionId).toBe('new-family');expect(marker).toBeNull();expect(api.account).toBeUndefined();
});
it('PF-BDD-084 server clock advances monotonically despite device wall-clock changes',async()=>{
 const wall=vi.spyOn(Date,'now').mockReturnValue(100000),monotonic=vi.spyOn(performance,'now').mockReturnValue(2000);try{const server=Date.parse('2026-10-31T00:00:00Z');const response=new Response('{}',{status:200,headers:{Date:new Date(server).toUTCString(),'Content-Type':'application/json'}});const api=new ApiClient('','web',store(),vi.fn(async()=>response));await api.request('/session');wall.mockReturnValue(9999999999999);monotonic.mockReturnValue(7000);expect(api.serverNow).toBe(server+5000);wall.mockReturnValue(1);monotonic.mockReturnValue(9000);expect(api.serverNow).toBe(server+7000);}finally{wall.mockRestore();monotonic.mockRestore();}
});
it('PF-UT-093 an uncertain Google confirmation cannot adopt a different established Web family',async()=>{
 const api=new ApiClient('','web',store(),vi.fn(async()=>json({account:{accountId:'new'},session:{sessionId:'new-family'}},200,'new-family')));api.sessionId='old-family';api.account={accountId:'old'} as any;await expect(api.confirmExternalLogin('old-family')).rejects.toMatchObject({code:'SESSION_CHANGED'});expect(api.account).toBeUndefined();
});
it('PF-UT-093 a stale foreground error body arriving after new login cannot clear the new session',async()=>{
 let finish!:(body:string)=>void;const response=json({code:'SESSION_REVOKED'},401,'old-family');response.text=vi.fn(()=>new Promise<string>(resolve=>{finish=resolve;}));const api=new ApiClient('','web',store(),vi.fn(async()=>response));api.sessionId='old-family';api.account={accountId:'old'} as any;const foreground=api.foreground();await vi.waitFor(()=>expect(response.text).toHaveBeenCalledOnce());await api.accept({session:{sessionId:'new-family'},account:{accountId:'new'} as any});finish(JSON.stringify({code:'SESSION_REVOKED'}));await expect(foreground).resolves.toBeUndefined();expect(api.sessionId).toBe('new-family');expect(api.account?.accountId).toBe('new');
});
it.each([200,401])('PF-UT-093 PF-UT-094 an old foreground %i cannot erase a newly confirmed login',async status=>{
 let finish!:(r:Response)=>void;const fetcher=vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve;}));const api=new ApiClient('','web',store(),fetcher);api.sessionId='old-family';api.account={accountId:'old'} as any;const foreground=api.foreground();await api.accept({session:{sessionId:'new-family'},account:{accountId:'new'} as any});finish(status===200?json({account:{accountId:'old'},session:{sessionId:'old-family'}},200,'old-family'):json({code:'SESSION_REVOKED'},401,'old-family'));await expect(foreground).resolves.toBeUndefined();expect(api.sessionId).toBe('new-family');expect(api.account?.accountId).toBe('new');expect(fetcher).toHaveBeenCalledOnce();
});
it('PF-UT-096 an already pending foreground read cannot restore private data during logout',async()=>{
 let read!:(r:Response)=>void,revoke!:(r:Response)=>void;const fetcher=vi.fn((_input:string,init?:RequestInit)=>new Promise<Response>(resolve=>{if(init?.method==='DELETE')revoke=resolve;else read=resolve;}));const api=new ApiClient('','web',store(),fetcher as typeof fetch);api.sessionId='s1';api.account={accountId:'owner'} as any;const foreground=api.foreground(),logout=api.logout();await vi.waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(2));read(json({account:{accountId:'owner'},session:{sessionId:'s1'}}));await foreground;expect(api.account).toBeUndefined();expect(api.pendingRevoke).toBe(true);revoke(new Response(null,{status:204}));await logout;
});
it('PF-UT-093 an unbound Google login can confirm the newly issued Web Cookie family without replaying the credential',async()=>{
 const owner={accountId:'owner'} as any;const fetcher=vi.fn(async(_input:string,init?:RequestInit)=>{if(init?.method==='POST')throw new TypeError('controlled lost response');return json({account:owner,session:{sessionId:'new-family'}},200,'new-family');});const api=new ApiClient('','web',store(),fetcher as typeof fetch);api.account=undefined;
 await expect(api.request('/sessions/external/google','POST',{credential:'controlled-memory-proof',clientPlatform:'web'})).rejects.toMatchObject({uncertain:true});const confirmed=await api.confirmExternalLogin();expect(confirmed.session.sessionId).toBe('new-family');expect(fetcher).toHaveBeenCalledTimes(2);expect(fetcher.mock.calls.map(c=>c[1]?.method)).toEqual(['POST','GET']);
});
it('PF-UT-093 a read of the unchanged family cannot claim that an uncertain Google login succeeded',async()=>{
 const fetcher=vi.fn(async()=>json({account:{accountId:'owner'},session:{sessionId:'old-family'}},200,'old-family'));const api=new ApiClient('','web',store(),fetcher);api.sessionId='old-family';await expect(api.confirmExternalLogin('old-family')).rejects.toMatchObject({uncertain:true});expect(fetcher).toHaveBeenCalledOnce();
});
it('PF-UT-093 Google confirmation preserves ordinary and native session-change defenses',async()=>{
 for(const platform of ['web','android'] as const){const fetcher=vi.fn(async()=>json({account:{accountId:'other'},session:{sessionId:'new-family'}},200,'new-family'));const api=new ApiClient('',platform,store(),fetcher);api.sessionId='old-family';api.account={accountId:'owner'} as any;await expect(platform==='web'?api.request('/session'):api.confirmExternalLogin('old-family')).rejects.toMatchObject({code:'SESSION_CHANGED'});expect(api.account).toBeUndefined();}
});
it('PF-UT-096 logout metadata storage failure still hides private state and retains revocation credentials only',async()=>{
 const s=store();const api=new ApiClient('','android',s);await api.accept({session:{sessionId:'s1'},account:{accountId:'a'} as any,tokens:{accessToken:'a',refreshToken:'r'}});
 s.set=vi.fn(async()=>{throw new Error('secure store unavailable')});await expect(api.logout()).rejects.toThrow();expect(api.pendingRevoke).toBe(true);expect(api.account).toBeUndefined();expect(api.access).toBeUndefined();
});
it('PF-UT-094 foreground verification refreshes the owner summary',async()=>{
 const owner={accountId:'a',linkedProviders:['google'],hasLocalPassword:true};const api=new ApiClient('','web',store(),vi.fn(async()=>json({account:owner,session:{sessionId:'s1'}})));api.sessionId='s1';await api.foreground();expect(api.account).toEqual(owner);
});
it.each(['web','android'] as const)('PF-UT-102 %s first request expires at exactly 45 seconds and later writes at exactly 30 seconds without replay',async platform=>{
 vi.useFakeTimers();let aborts=0;const f=vi.fn(async(_input:unknown,init?:RequestInit)=>new Promise<Response>((_r,reject)=>init?.signal?.addEventListener('abort',()=>{aborts++;reject(new Error('timeout'));})));
 const api=new ApiClient('',platform,store(),f as typeof fetch);
 try{const first=expect(api.request('/accounts','POST',{})).rejects.toMatchObject({code:'NETWORK_ERROR',uncertain:true});await vi.advanceTimersByTimeAsync(44999);expect(aborts).toBe(0);expect(f).toHaveBeenCalledTimes(1);await vi.advanceTimersByTimeAsync(1);expect(aborts).toBe(1);await first;
 const second=expect(api.request('/sessions','POST',{})).rejects.toMatchObject({code:'NETWORK_ERROR'});await vi.advanceTimersByTimeAsync(29999);expect(aborts).toBe(1);await vi.advanceTimersByTimeAsync(1);expect(aborts).toBe(2);await second;expect(f).toHaveBeenCalledTimes(2);}finally{vi.useRealTimers();}
});
it('browser fetch receives its required global receiver',async()=>{
 const fetcher=function(this:unknown){expect(this).toBe(globalThis);return Promise.resolve(json({ok:true}));};
 await new ApiClient('http://localhost','web',store(),fetcher).request('/me');
});
it('PF-UT-097 concurrent missing Access responses share one refresh',async()=>{
 let refreshed=false,rotations=0;const fetcher=vi.fn(async(input:string)=>{
  if(input.includes('/refresh')){rotations++;await new Promise(r=>setTimeout(r,10));refreshed=true;return json({session:{sessionId:'s1'},tokens:{}});}
  return refreshed?json({account:{accountId:'a'},session:{sessionId:'s1'}}):json({code:'ACCESS_TOKEN_MISSING'},401);
 });
 const api=new ApiClient('http://localhost','web',store(),fetcher as typeof fetch);
 await Promise.all([api.request('/session'),api.request('/session')]);expect(rotations).toBe(1);
});
it('PF-UT-098 only pre-handler missing/expired Access can replay a mutation once',async()=>{
 let writes=0;const f=vi.fn(async(input:string)=>{
  if(input.includes('/refresh'))return json({session:{sessionId:'s1'},tokens:{}});
  writes++;return writes===1?json({code:'ACCESS_TOKEN_EXPIRED'},401):json({ok:true});
 });const api=new ApiClient('http://localhost','web',store(),f as typeof fetch);
 await api.request('/me/password','PUT',{currentPassword:'secret',newPassword:'another'});expect(writes).toBe(2);
 const denied=vi.fn(async()=>json({code:'SESSION_REVOKED'},401));const other=new ApiClient('http://localhost','web',store(),denied);
 await expect(other.request('/me/password','PUT',{})).rejects.toBeInstanceOf(ApiFailure);expect(denied).toHaveBeenCalledTimes(1);
});
it('PF-UT-099 failed native secure-store successor write clears usable credentials',async()=>{
 const s=store();s.set=vi.fn(async()=>{throw new Error('storage unavailable')});
 const api=new ApiClient('http://localhost','android',s,vi.fn(async()=>json({session:{sessionId:'s1'},tokens:{accessToken:'a',refreshToken:'r'}})));
 await expect(api.accept({session:{sessionId:'s1'},tokens:{accessToken:'a',refreshToken:'r'}})).rejects.toThrow();expect(api.access).toBeUndefined();expect(s.remove).toHaveBeenCalled();
});
it('PF-UT-099 a second refresh conflict clears the stale owner and never tries a third refresh',async()=>{
 const s=store();const f=vi.fn(async()=>json({code:'REFRESH_RETRY'},409,'stale-family'));const api=new ApiClient('','web',s,f);
 api.sessionId='stale-family';api.account={accountId:'old-owner'} as any;
 await expect(api.refresh()).rejects.toMatchObject({code:'REFRESH_RETRY'});expect(f).toHaveBeenCalledTimes(2);expect(api.account).toBeUndefined();expect(api.sessionId).toBeUndefined();
});
it('storage erase failure still immediately clears private screen context',async()=>{
 const s=store();s.remove=vi.fn(async()=>{throw new Error('locked storage')});const api=new ApiClient('','android',s);api.access='old';api.sessionId='old';api.account={accountId:'a'} as any;const changed=vi.fn();api.onChange=changed;
 await api.forget();expect(api.account).toBeUndefined();expect(api.access).toBeUndefined();expect(changed).toHaveBeenCalledOnce();
});
it('an intentional successful login may replace this instance session',async()=>{
 const api=new ApiClient('','web',store(),vi.fn(async()=>json({session:{sessionId:'s2'},tokens:{}},201,'s2')));api.sessionId='s1';const result=await api.request('/sessions','POST',{email:'a@example.com'});await api.accept(result);expect(api.sessionId).toBe('s2');
});
it('PF-UT-101 network failures only retry read operations, never uncertain mutations',async()=>{
 const f=vi.fn(async()=>{throw new TypeError('offline')});const api=new ApiClient('http://localhost','web',store(),f);
 await expect(api.request('/me')).rejects.toThrow();expect(f).toHaveBeenCalledTimes(2);f.mockClear();
 await expect(api.request('/accounts','POST',{})).rejects.toThrow();expect(f).toHaveBeenCalledTimes(1);
});
it('PF-UT-051 failed logout saves revocation-only recovery before removing private state',async()=>{
 const s=store();const f=vi.fn(async()=>{throw new TypeError('offline')});const api=new ApiClient('http://localhost','android',s,f);
 await api.accept({session:{sessionId:'s1'},tokens:{accessToken:'a',refreshToken:'r'}});
 await expect(api.logout()).rejects.toThrow();expect(api.sessionId).toBeUndefined();expect(s.set).toHaveBeenCalledWith('pending-revoke',expect.any(String));
});
it('PF-UT-051 pending Web logout cannot revoke an unidentifiable newer family when its Access cookie expired',async()=>{
 const s=store();s.get=vi.fn(async key=>key==='pending-revoke'?JSON.stringify({sessionId:'old-family'}):null);
 const f=vi.fn(async(_input:unknown,init?:RequestInit)=>{expect(init?.method).toBe('DELETE');expect(JSON.parse(String(init?.body))).toEqual({sessionId:'old-family'});return json({code:'SESSION_CHANGED'},409);});const api=new ApiClient('','web',s,f);api.pendingRevoke=true;
 expect(await api.retryLogout()).toBe(false);expect(f).toHaveBeenCalledOnce();expect(api.pendingRevoke).toBe(false);expect(s.remove).toHaveBeenCalledWith('pending-revoke');
});
it('PF-UT-051 matching Web pending logout sends its family condition without refreshing',async()=>{
 const s=store();s.get=vi.fn(async key=>key==='pending-revoke'?JSON.stringify({sessionId:'old-family'}):null);const f=vi.fn(async(_input:unknown,init?:RequestInit)=>{expect(init?.method).toBe('DELETE');expect(JSON.parse(String(init?.body))).toEqual({sessionId:'old-family'});return new Response(null,{status:204});});const api=new ApiClient('','web',s,f);api.pendingRevoke=true;await api.retryLogout();expect(f).toHaveBeenCalledOnce();expect(api.pendingRevoke).toBe(false);
});
it('PF-UT-051 unknown conditioned logout retains its marker for another safe attempt',async()=>{
 const s=store();s.get=vi.fn(async key=>key==='pending-revoke'?JSON.stringify({sessionId:'old-family'}):null);const f=vi.fn(async()=>{throw new Error('offline');});const api=new ApiClient('','web',s,f);api.pendingRevoke=true;await expect(api.retryLogout()).rejects.toMatchObject({uncertain:true});expect(api.pendingRevoke).toBe(true);expect(s.remove).not.toHaveBeenCalled();
});
it.each(['ACCESS_TOKEN_MISSING','ACCESS_TOKEN_EXPIRED'])('PF-UT-098 a second %s after refresh clears private state without another rotation',async code=>{
 const s=store(),fetcher=vi.fn(async(input:string)=>input.endsWith('/refresh')?json({session:{sessionId:'s1'},account:{accountId:'old-owner'},tokens:{}}):json({code},401));const api=new ApiClient('','web',s,fetcher as typeof fetch);api.sessionId='s1';api.account={accountId:'old-owner'} as any;await expect(api.request('/me/password','PUT',{})).rejects.toMatchObject({code});expect(fetcher).toHaveBeenCalledTimes(3);expect(api.account).toBeUndefined();expect(api.sessionId).toBeUndefined();
});
