// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach,beforeEach} from 'vitest';
import {render,screen,fireEvent,cleanup,act} from '@testing-library/react';
const sdk=vi.hoisted(()=>({platform:'android',configure:vi.fn(),present:vi.fn()}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),Platform:{get OS(){return sdk.platform;}}}));
vi.mock('react-native-nitro-google-signin',()=>({GoogleOneTapSignIn:{configure:sdk.configure,presentExplicitSignIn:sdk.present},GoogleSignInButton:({onPress,disabled}:any)=><button disabled={disabled} onClick={onPress}>Google native SDK</button>}));
import GoogleButton from '../../src/GoogleButton';
import {messageFor} from '../../src/forms';
beforeEach(()=>{vi.clearAllMocks();sdk.platform='android';vi.stubEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID','controlled-web-client');vi.stubEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',undefined);});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllEnvs();});
it('PF-UT-084 iOS without its configured client is explicitly unavailable',()=>{
 sdk.platform='ios';render(<GoogleButton disabled={false} onCredential={vi.fn()} onBusy={vi.fn()} onNotice={vi.fn()}/>);
 expect(screen.queryByRole('button',{name:'Google native SDK'})).toBeNull();expect(screen.getByText('Google 登入暫時無法使用，請稍後再試')).toBeTruthy();expect(sdk.configure).not.toHaveBeenCalled();
});
it('PF-UT-091 PF-UT-092 a session change cancels a pending native SDK operation and ignores its late result',async()=>{
 let finish!:(value:any)=>void;sdk.present.mockReturnValue(new Promise(resolve=>{finish=resolve;}));const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};
 const view=render(<GoogleButton {...props} sessionId="old-family"/>);fireEvent.click(screen.getByRole('button',{name:'Google native SDK'}));expect(props.onBusy).toHaveBeenLastCalledWith(true);
 view.rerender(<GoogleButton {...props} sessionId="new-family"/>);expect(props.onBusy).toHaveBeenLastCalledWith(false);expect(props.onNotice).toHaveBeenLastCalledWith('GOOGLE_SESSION_CHANGED');
 await act(async()=>finish({type:'success',data:{idToken:'late-memory-proof'}}));expect(props.onCredential).not.toHaveBeenCalled();
});
it('PF-UT-091 PF-UT-092 explicit native cancellation discards a late SDK proof and releases the page',async()=>{
 let finish!:(value:any)=>void;sdk.present.mockReturnValue(new Promise(resolve=>{finish=resolve;}));const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Google native SDK'}));fireEvent.click(screen.getByRole('button',{name:'取消 Google 登入'}));expect(props.onBusy).toHaveBeenLastCalledWith(false);expect(props.onNotice).toHaveBeenLastCalledWith('GOOGLE_CANCELLED');await act(async()=>finish({type:'success',data:{idToken:'late-cancelled-memory-proof'}}));expect(props.onCredential).not.toHaveBeenCalled();
});
it('PF-UT-091 native SDK requests expire after 45 seconds and cannot apply a later result',async()=>{
 vi.useFakeTimers();let finish!:(value:any)=>void;sdk.present.mockReturnValue(new Promise(resolve=>{finish=resolve;}));const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Google native SDK'}));await act(async()=>vi.advanceTimersByTime(45000));expect(props.onNotice).toHaveBeenLastCalledWith('GOOGLE_CANCELLED');expect(props.onBusy).toHaveBeenLastCalledWith(false);await act(async()=>finish({type:'success',data:{idToken:'late-expired-memory-proof'}}));expect(props.onCredential).not.toHaveBeenCalled();
});
it('PF-UT-091 PF-UT-093 duplicate native taps produce one proof exchange and HTTP pending cannot be cancelled',async()=>{
 let finishSdk!:(value:any)=>void,finishHttp!:()=>void;sdk.present.mockReturnValue(new Promise(resolve=>{finishSdk=resolve;}));const props={disabled:false,onCredential:vi.fn(()=>new Promise<void>(resolve=>{finishHttp=resolve;})),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props} sessionId="same-family"/>);const button=screen.getByRole('button',{name:'Google native SDK'});fireEvent.click(button);fireEvent.click(button);expect(sdk.present).toHaveBeenCalledOnce();await act(async()=>finishSdk({type:'success',data:{idToken:'controlled-memory-proof'}}));expect(props.onCredential).toHaveBeenCalledOnce();expect(screen.queryByRole('button',{name:'取消 Google 登入'})).toBeNull();fireEvent.click(button);expect(sdk.present).toHaveBeenCalledOnce();await act(async()=>finishHttp());expect(props.onBusy).toHaveBeenLastCalledWith(false);expect(props.onNotice).not.toHaveBeenCalled();
});
it.each(['cancelled','rejected','unmounted'])('PF-UT-091 native SDK %s cannot create a platform login',async mode=>{
 let finish!:(value:any)=>void,reject!:(reason:Error)=>void;sdk.present.mockReturnValue(new Promise((resolve,fail)=>{finish=resolve;reject=fail;}));const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};const view=render(<GoogleButton {...props}/>);fireEvent.click(screen.getByRole('button',{name:'Google native SDK'}));if(mode==='unmounted')view.unmount();await act(async()=>{if(mode==='rejected')reject(new Error('Controlled SDK failure'));else finish(mode==='cancelled'?{type:'cancelled'}:{type:'success',data:{idToken:'late-unmounted-memory-proof'}});});expect(props.onCredential).not.toHaveBeenCalled();if(mode!=='unmounted')expect(props.onNotice).toHaveBeenLastCalledWith(mode==='cancelled'?'GOOGLE_CANCELLED':'EXTERNAL_PROVIDER_UNAVAILABLE');
});

it.each([
 ['PLAY_SERVICES_NOT_AVAILABLE','GOOGLE_PLAY_SERVICES_UNAVAILABLE','Google Play 服務無法使用或需要更新，請先在 Google Play 更新後再試'],
 ['ONE_TAP_START_FAILED','GOOGLE_SIGN_IN_START_FAILED','無法開啟 Google 登入，請更新 Google Play 服務並確認裝置已登入 Google 帳號後再試'],
 ['DEVELOPER_ERROR','GOOGLE_SIGN_IN_CONFIGURATION_ERROR','Google 登入設定異常，請稍後再試或使用 Email 登入'],
])('native SDK %s gives an actionable device/configuration notice without exchanging a proof',async(code,notice,text)=>{
 sdk.present.mockRejectedValue(Object.assign(new Error('private-sdk-detail'),{code}));
 const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props}/>);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Google native SDK'})));
 expect(props.onNotice).toHaveBeenCalledExactlyOnceWith(notice);expect(messageFor(notice)).toBe(text);
 expect(props.onCredential).not.toHaveBeenCalled();expect(props.onBusy).toHaveBeenLastCalledWith(false);expect(sdk.present).toHaveBeenCalledOnce();
});

it('a device without an available Google credential is explained rather than reported as a user cancellation',async()=>{
 sdk.present.mockResolvedValue({type:'noSavedCredentialFound',data:null});
 const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props}/>);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Google native SDK'})));
 expect(props.onNotice).toHaveBeenCalledExactlyOnceWith('GOOGLE_ACCOUNT_REQUIRED');
 expect(messageFor('GOOGLE_ACCOUNT_REQUIRED')).toBe('這台裝置沒有可用的 Google 登入資訊，請先登入 Google 帳號後再試');
 expect(props.onCredential).not.toHaveBeenCalled();expect(sdk.present).toHaveBeenCalledOnce();
});

it('an unknown native SDK failure does not accuse the user of submitting invalid credentials or expose private details',async()=>{
 sdk.present.mockRejectedValue(Object.assign(new Error('private-sdk-detail'),{code:'untrusted-native-code',userInfo:{private:'do-not-expose'}}));
 const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props}/>);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Google native SDK'})));
 expect(props.onNotice).toHaveBeenCalledExactlyOnceWith('EXTERNAL_PROVIDER_UNAVAILABLE');expect(props.onCredential).not.toHaveBeenCalled();expect(sdk.present).toHaveBeenCalledOnce();
});

it('a failure after a successful SDK proof keeps the credential-exchange failure distinct from a device startup failure',async()=>{
 sdk.present.mockResolvedValue({type:'success',data:{idToken:'controlled-memory-proof'}});
 const props={disabled:false,onCredential:vi.fn(async()=>{throw Object.assign(new Error('rejected-proof'),{code:'PLAY_SERVICES_NOT_AVAILABLE'});}),onBusy:vi.fn(),onNotice:vi.fn()};render(<GoogleButton {...props}/>);
 await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Google native SDK'})));
 expect(props.onNotice).toHaveBeenCalledExactlyOnceWith('EXTERNAL_CREDENTIAL_INVALID');expect(props.onCredential).toHaveBeenCalledOnce();expect(sdk.present).toHaveBeenCalledOnce();
});
