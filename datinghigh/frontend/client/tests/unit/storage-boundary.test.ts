// @vitest-environment jsdom
import {it,expect,vi} from 'vitest';
const state=vi.hoisted(()=>({platform:{OS:'web'},set:vi.fn(async()=>{}),get:vi.fn(),remove:vi.fn()}));
vi.mock('react-native',()=>({Platform:state.platform}));
vi.mock('expo-secure-store',()=>({setItemAsync:state.set,getItemAsync:state.get,deleteItemAsync:state.remove,WHEN_UNLOCKED_THIS_DEVICE_ONLY:'device-only'}));
import {storage} from '../../src/storage';
it('PF-UT-103 Web and native storage reject passwords, codes, provider proof, Access and unknown metadata fields',async()=>{
 for(const platform of ['web','ios','android']){
  state.platform.OS=platform;for(const key of ['password','code','google-credential','access'])await expect(storage.set(key,'nonsecret-unit-marker')).rejects.toThrow();
  await expect(storage.set('email-flow',JSON.stringify({password:'nonsecret-unit-marker'}))).rejects.toThrow();
 }
 state.platform.OS='web';await expect(storage.set('refresh','nonsecret-unit-marker')).rejects.toThrow();expect(sessionStorage.getItem('datinghigh.password')).toBeNull();
 state.platform.OS='android';const value=JSON.stringify({refreshToken:'r'.repeat(43),sessionId:'019a281e-0000-7000-8000-000000000001'});await storage.set('refresh',value);expect(state.set).toHaveBeenCalledWith('datinghigh.refresh',value,{keychainAccessible:'device-only'});
});
it('PF-E2E-017 JWT-shaped Google or Access credentials cannot be hidden in allowed storage fields',async()=>{
 const proof='eyJhbGciOiJSUzI1NiJ9.'+'a'.repeat(300)+'.'+'b'.repeat(300),sessionId='019a281e-0000-7000-8000-000000000001';const flow={challengeId:sessionId,flowToken:'a'.repeat(43),purpose:'register_email',emailMasked:'o***@example.com',expiresAt:'2026-10-31T00:10:00Z',absoluteExpiresAt:'2026-10-31T00:30:00Z',resendAfter:'2026-10-31T00:01:00Z'};
 state.set.mockClear();for(const platform of ['web','android','ios']){state.platform.OS=platform;for(const field of ['flowToken','emailMasked','challengeId'])await expect(storage.set('email-flow',JSON.stringify({...flow,[field]:proof}))).rejects.toThrow();for(const key of ['refresh','pending-revoke'])await expect(storage.set(key,JSON.stringify({sessionId,refreshToken:proof}))).rejects.toThrow();}expect(state.set).not.toHaveBeenCalled();
});
