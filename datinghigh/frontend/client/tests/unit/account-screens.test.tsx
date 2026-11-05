// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
import {ApiFailure} from '../../src/api';import {messageFor,validateForm} from '../../src/forms';
const state=vi.hoisted(()=>({router:{push:vi.fn(),replace:vi.fn()},session:{ready:true,notice:'',noticeTrace:'',setNotice:vi.fn()},api:{account:undefined as any,sessionId:undefined as string|undefined,pendingRevoke:false,serverNow:1800000000000,platform:'web',request:vi.fn(),restore:vi.fn(),confirmExternalLogin:vi.fn(),accept:vi.fn(),forget:vi.fn(),logout:vi.fn(),retryLogout:vi.fn(),onChange:vi.fn()},flows:{read:vi.fn(),save:vi.fn(),clear:vi.fn()}}));
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
vi.mock('expo-router',async()=>({useRouter:()=>state.router,useLocalSearchParams:()=>({}),useFocusEffect:(effect:()=>void|(()=>void))=>React.useEffect(effect,[effect])}));
vi.mock('../../src/session',()=>({api:state.api,flows:state.flows,useSession:()=>state.session}));
vi.mock('../../src/GoogleButton',()=>({default:({onCredential,disabled}:any)=><button disabled={disabled} onClick={()=>onCredential('controlled-memory-proof')}>受控 Google SDK</button>}));
import {Screen} from '../../src/Screen';
const owner={accountId:'owner',email:'owner@example.com',emailVerified:true,hasLocalPassword:true,linkedProviders:[]};
const flow={challengeId:'019a281e-0000-7000-8000-000000000001',flowToken:'a'.repeat(43),purpose:'register_email',emailMasked:'o***@example.com',expiresAt:new Date(1800000600000).toISOString(),absoluteExpiresAt:new Date(1800001800000).toISOString(),resendAfter:new Date(1800000060000).toISOString()};
const fill=(label:string,value:string)=>fireEvent.change(screen.getByLabelText(label),{target:{value}});
beforeEach(()=>{vi.clearAllMocks();state.api.confirmExternalLogin.mockImplementation(()=>state.api.request('/session'));state.api.account=undefined;state.api.sessionId=undefined;state.api.pendingRevoke=false;state.api.serverNow=1800000000000;state.session.ready=true;state.session.notice='';state.session.noticeTrace='';state.flows.read.mockResolvedValue(null);state.flows.clear.mockResolvedValue(undefined);state.api.request.mockResolvedValue({});state.api.accept.mockResolvedValue(undefined);state.api.forget.mockResolvedValue(undefined);});
afterEach(cleanup);
it('PF-BDD-075 a changed Google linking session asks the user to retry the operation',()=>{expect(messageFor('GOOGLE_SESSION_CHANGED')).toBe('登入狀態已變更，請重新操作');});
it('PF-BDD-027 password validation uses the specified message both locally and from the server',()=>{const expected='密碼須為 12 至 128 個字元，且不可包含控制字元';expect(messageFor('INVALID_PASSWORD')).toBe(expected);expect(validateForm('account/password',{currentPassword:'old',password:'short',confirm:'short'})).toBe(expected);});
it('PF-UT-083 entry waits for server restore and routes only a verified owner to the account',()=>{
 state.session.ready=false;const view=render(<Screen screen=""/>);expect(screen.queryByRole('button',{name:'使用 Email 註冊'})).toBeNull();expect(screen.getByText('連線中，請稍候…')).toBeTruthy();expect(state.router.replace).not.toHaveBeenCalled();
 state.session.ready=true;state.api.account=owner;view.rerender(<Screen screen=""/>);expect(state.router.replace).toHaveBeenCalledWith('/account');
});
it('PF-BDD-085 failed account recovery offers an explicit retry and return to login',async()=>{
 state.session.notice='NETWORK_ERROR';state.api.restore.mockImplementation(async()=>{state.api.account=owner;});render(<Screen screen=""/>);expect(screen.getByText('網路連線中斷，請檢查連線後重試')).toBeTruthy();expect(screen.getByRole('button',{name:'返回登入'})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'重試'}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/account'));expect(state.api.restore).toHaveBeenCalledOnce();
});
it('PF-BDD-085 repeated recovery failure retains retry, presents trace and never invents an account',async()=>{
 state.session.notice='DEPENDENCY_UNAVAILABLE';state.session.noticeTrace='safe-trace';state.api.restore.mockRejectedValueOnce(new ApiFailure('DEPENDENCY_UNAVAILABLE',503,'retry-trace'));render(<Screen screen=""/>);expect(screen.getByText(/服務暫時無法使用.*safe-trace/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'重試'}));await screen.findByText(/服務暫時無法使用.*retry-trace/);expect(screen.getByRole('button',{name:'重試'})).toBeTruthy();expect(state.api.account).toBeUndefined();expect(state.router.replace).not.toHaveBeenCalled();const back=screen.getByRole('button',{name:'返回登入'});await waitFor(()=>expect(back.getAttribute('aria-disabled')).not.toBe('true'));fireEvent.click(back);await waitFor(()=>expect(state.router.push).toHaveBeenCalledWith('/login'));
});
it('PF-BDD-085 retry with no remaining credential routes to login instead of claiming service failure',async()=>{
 state.session.notice='NETWORK_ERROR';state.api.restore.mockRejectedValueOnce(new ApiFailure('ACCESS_TOKEN_MISSING',401));render(<Screen screen=""/>);fireEvent.click(screen.getByRole('button',{name:'重試'}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/login'));expect(state.session.setNotice).toHaveBeenCalledWith('REFRESH_INVALID');expect(state.api.account).toBeUndefined();
});
it('PF-BDD-090 unconfirmed server logout presents the specified retry message once',()=>{
 state.api.pendingRevoke=true;state.session.notice='LOGOUT_PENDING';render(<Screen screen="login"/>);expect(screen.getAllByText('尚未完成伺服器登出，請重試')).toHaveLength(1);expect(screen.getByRole('button',{name:'重試登出'})).toBeTruthy();
});
it.each(['verify-email','reset-password'])('PF-BDD-091 missing %s flow offers only the specified recovery action',async route=>{
 state.flows.read.mockResolvedValue(null);render(<Screen screen={route}/>);await screen.findByText('驗證流程已失效，請重新申請');expect(screen.getByRole('button',{name:'重新申請'})).toBeTruthy();expect(screen.queryByRole('button',{name:route==='verify-email'?'驗證並建立帳號':'重設密碼'})).toBeNull();
});
it.each([['account',{...owner,hasLocalPassword:null}],['account/connections',{...owner,linkedProviders:null}],['account/password',{...owner,emailVerified:null}]])('PF-BDD-091 incomplete %s data never invents account status',async(route,account)=>{
 state.api.account=account;render(<Screen screen={route as string}/>);expect(screen.getByText('帳號資料暫時無法確認，請重試')).toBeTruthy();expect(screen.queryByText('Email 已驗證')).toBeNull();expect(screen.queryByText('尚未連結 Google')).toBeNull();expect(screen.queryByRole('button',{name:'透過 Email 設定密碼'})).toBeNull();expect(screen.queryByRole('button',{name:'解除 Google 連結'})).toBeNull();expect(screen.getByRole('button',{name:'重試'})).toBeTruthy();
});
it('PF-BDD-091 incomplete account retry accepts only a complete verified account',async()=>{
 state.api.account={...owner,hasLocalPassword:null};state.api.request.mockResolvedValueOnce({...owner,linkedProviders:null}).mockResolvedValueOnce(owner);const view=render(<Screen screen="account"/>);fireEvent.click(screen.getByRole('button',{name:'重試'}));await screen.findByText('服務暫時無法使用，請稍後再試');expect(state.api.onChange).not.toHaveBeenCalled();expect(screen.queryByText('Email 已驗證')).toBeNull();await waitFor(()=>expect(screen.getByRole('button',{name:'重試'}).getAttribute('aria-disabled')).not.toBe('true'));fireEvent.click(screen.getByRole('button',{name:'重試'}));await waitFor(()=>expect(state.api.onChange).toHaveBeenCalledOnce());view.rerender(<Screen screen="account"/>);expect(screen.getByText('Email 已驗證')).toBeTruthy();expect(screen.getByText('尚未連結 Google')).toBeTruthy();
});
it('PF-UT-085 PF-UT-087 login prevents duplicate writes and does not navigate before confirmed success',async()=>{
 let resolve!:(v:any)=>void;state.api.request.mockReturnValue(new Promise(r=>{resolve=r;}));render(<Screen screen="login"/>);fill('Email','owner@example.com');fill('密碼','A valid component password');
 const button=screen.getByRole('button',{name:'登入'});fireEvent.click(button);fireEvent.click(button);expect(state.api.request).toHaveBeenCalledOnce();expect(state.router.replace).not.toHaveBeenCalled();expect(state.api.accept).not.toHaveBeenCalled();
 await act(async()=>resolve({account:owner,session:{sessionId:'s'}}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/account'));expect(state.api.accept).toHaveBeenCalledOnce();
});
it('PF-UT-087 request and reset success choose the correct recovery route without accepting a session',async()=>{
 for(const [route,target] of [['register','/verify-email'],['forgot-password','/reset-password']]){
  state.api.request.mockResolvedValue(flow);render(<Screen screen={route}/>);fill('Email','owner@example.com');fireEvent.click(screen.getByRole('button',{name:'寄送驗證碼'}));await waitFor(()=>expect(state.router.push).toHaveBeenCalledWith(target));expect(state.api.accept).not.toHaveBeenCalled();cleanup();vi.clearAllMocks();
 }
});
it('PF-UT-088 verification keeps leading zeros, masks the address and sends no confirmation password',async()=>{
 state.flows.read.mockResolvedValue(flow);render(<Screen screen="verify-email"/>);await screen.findByLabelText('六位數驗證碼');fill('六位數驗證碼','000001');fill('密碼','A valid component password');fill('確認密碼','A valid component password');
 expect((screen.getByLabelText('六位數驗證碼') as HTMLInputElement).value).toBe('000001');expect(screen.getByText(/o\*\*\*@example.com/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'驗證並建立帳號'}));
 await waitFor(()=>expect(state.api.request).toHaveBeenCalled());const payload=state.api.request.mock.calls[0][2];expect(payload.code).toBe('000001');expect(payload).not.toHaveProperty('confirm');expect(state.flows.clear).toHaveBeenCalledOnce();
});
it('PF-UT-089 resend uses server clock and respects a 429 retry deadline',async()=>{
 state.flows.read.mockResolvedValue({...flow,resendAfter:new Date(state.api.serverNow+1000).toISOString()});const view=render(<Screen screen="verify-email"/>);await screen.findByLabelText('六位數驗證碼');
 expect((await screen.findByRole('button',{name:/請稍候再重寄/})).getAttribute('aria-disabled')).toBe('true');state.api.serverNow+=2000;
 await act(async()=>{await new Promise(r=>setTimeout(r,1100));});state.api.request.mockRejectedValueOnce(new ApiFailure('RATE_LIMITED',429,undefined,60));fireEvent.click(screen.getByRole('button',{name:'重新寄送驗證碼'}));await screen.findByText('操作過於頻繁，請稍後再試');expect((await screen.findByRole('button',{name:/請稍候再重寄/})).getAttribute('aria-disabled')).toBe('true');view.unmount();
});
it('PF-UT-093 an unknown Google login performs one read-only confirmation and never replays the proof',async()=>{
 state.api.request.mockRejectedValueOnce(new ApiFailure('NETWORK_ERROR',0,undefined,0,true)).mockResolvedValueOnce({account:owner,session:{sessionId:'verified'}});render(<Screen screen="login"/>);fireEvent.click(screen.getByRole('button',{name:'受控 Google SDK'}));
 await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/account'));expect(state.api.request.mock.calls.map(c=>[c[0],c[1]??'GET'])).toEqual([['/sessions/external/google','POST'],['/session','GET']]);expect(state.api.account).toEqual(owner);
});
it('PF-UT-095 link preserves the current session, unlink clears it, and Google-only users are guided to Email',async()=>{
 state.api.account=owner;state.api.sessionId='same-family';state.api.request.mockResolvedValueOnce({provider:'google',linked:true}).mockResolvedValueOnce({...owner,linkedProviders:['google']});render(<Screen screen="account/connections"/>);fireEvent.click(screen.getByRole('button',{name:'受控 Google SDK'}));await screen.findAllByText('Google 已連結');expect(state.api.forget).not.toHaveBeenCalled();expect(state.api.sessionId).toBe('same-family');cleanup();
 state.api.account={...owner,linkedProviders:['google']};render(<Screen screen="account/connections"/>);fill('目前密碼','A valid component password');fireEvent.click(screen.getByRole('button',{name:'解除 Google 連結'}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/login'));expect(state.api.forget).toHaveBeenCalledOnce();expect(state.session.setNotice).toHaveBeenCalledWith('IDENTITY_UNLINKED');cleanup();
 state.api.account={...owner,hasLocalPassword:false,linkedProviders:['google']};render(<Screen screen="account/connections"/>);expect(screen.queryByRole('button',{name:'解除 Google 連結'})).toBeNull();expect(screen.getByText(/請先透過 Email 設定密碼/)).toBeTruthy();
});
it('PF-UT-100 renders sanitized service errors with trace ID and keeps password fields out of storage',async()=>{
 state.api.request.mockRejectedValue(new ApiFailure('DEPENDENCY_UNAVAILABLE',503,'safe-trace'));render(<Screen screen="login"/>);fill('Email','owner@example.com');fill('密碼','A valid component password');fireEvent.click(screen.getByRole('button',{name:'登入'}));await screen.findByText(/服務暫時無法使用.*safe-trace/);expect(state.flows.save).not.toHaveBeenCalled();expect(state.api.accept).not.toHaveBeenCalled();
});
it.each([
 ['EXTERNAL_EMAIL_MISMATCH','Google Email 必須與目前帳號相同'],
 ['EXTERNAL_IDENTITY_IN_USE','此 Google 登入已被使用，無法連結'],
])('PF-BDD-081 link conflict %s keeps the existing identity state',async(code,message)=>{
 state.api.account=owner;state.api.sessionId='same-family';state.api.request.mockRejectedValueOnce(new ApiFailure(code,409));render(<Screen screen="account/connections"/>);fireEvent.click(screen.getByRole('button',{name:'受控 Google SDK'}));await screen.findByText(message);expect(screen.getByText('尚未連結 Google')).toBeTruthy();expect(state.api.forget).not.toHaveBeenCalled();expect(state.router.replace).not.toHaveBeenCalled();
});
it('PF-BDD-081 last-login-method conflict does not erase the current Google connection',async()=>{
 state.api.account={...owner,linkedProviders:['google']};state.api.request.mockRejectedValueOnce(new ApiFailure('LAST_LOGIN_METHOD',409));render(<Screen screen="account/connections"/>);fill('目前密碼','A valid component password');fireEvent.click(screen.getByRole('button',{name:'解除 Google 連結'}));await screen.findByText('請先保留至少一種登入方式');expect(screen.getByText('Google 已連結')).toBeTruthy();expect(state.api.forget).not.toHaveBeenCalled();expect(state.router.replace).not.toHaveBeenCalled();
});
it.each(['change','link','unlink','logout'] as const)('PF-BDD-083 pending %s cannot be submitted twice and recovers after failure',async operation=>{
 let reject!:(error:Error)=>void;const pending=new Promise((_resolve,fail)=>{reject=fail;});state.api.account={...owner,linkedProviders:operation==='unlink'?['google']:[]};state.api.sessionId='same-family';if(operation==='logout')state.api.logout.mockReturnValue(pending);else state.api.request.mockReturnValue(pending);
 render(<Screen screen={operation==='change'?'account/password':operation==='logout'?'account':'account/connections'}/>);if(operation==='change'){fill('目前密碼','A valid component password');fill('新密碼','A new valid component password');fill('確認密碼','A new valid component password');}if(operation==='unlink')fill('目前密碼','A valid component password');
 const label=operation==='change'?'更新密碼':operation==='link'?'受控 Google SDK':operation==='unlink'?'解除 Google 連結':'登出';const button=screen.getByRole('button',{name:label});fireEvent.click(button);fireEvent.click(button);expect(operation==='logout'?state.api.logout:state.api.request).toHaveBeenCalledOnce();expect(screen.getByText('連線中，請稍候…')).toBeTruthy();expect(state.router.replace).not.toHaveBeenCalled();
 await act(async()=>reject(new ApiFailure('DEPENDENCY_UNAVAILABLE',503)));await screen.findByText('服務暫時無法使用，請稍後再試');expect(screen.getByRole('button',{name:label}).getAttribute('aria-disabled')).not.toBe('true');expect(state.router.replace).not.toHaveBeenCalled();
});
it.each([200,201])('PF-UT-087 a confirmed Google %i accepts the returned session before navigating',async status=>{
 state.api.request.mockResolvedValue({account:owner,session:{sessionId:'confirmed'},status});render(<Screen screen="login"/>);fireEvent.click(screen.getByRole('button',{name:'受控 Google SDK'}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/account'));expect(state.api.accept).toHaveBeenCalledOnce();expect(state.api.accept.mock.invocationCallOrder[0]).toBeLessThan(state.router.replace.mock.invocationCallOrder[0]);
});
it.each([
 ['EXTERNAL_CREDENTIAL_INVALID','Google 登入驗證失敗，請重新登入 Google'],
 ['EXTERNAL_EMAIL_UNTRUSTED','此 Google 帳號的 Email 未通過網域信任檢查，請改用 Email 驗證碼註冊或先以密碼登入'],
])('PF-BDD-074 Google login failure %s shows its correction without creating a session',async(code,message)=>{
 state.api.request.mockRejectedValueOnce(new ApiFailure(code,401));render(<Screen screen="login"/>);fireEvent.click(screen.getByRole('button',{name:'受控 Google SDK'}));await screen.findByText(message);expect(state.api.accept).not.toHaveBeenCalled();expect(state.router.replace).not.toHaveBeenCalled();
});
it('PF-UT-087 PF-UT-088 reset confirmation keeps code text and clears credentials only after confirmed success',async()=>{
 state.flows.read.mockResolvedValue({...flow,purpose:'reset_password'});render(<Screen screen="reset-password"/>);await screen.findByLabelText('六位數驗證碼');fill('六位數驗證碼','000001');fill('新密碼','A valid component password');fill('確認密碼','A valid component password');fireEvent.click(screen.getByRole('button',{name:'重設密碼'}));
 await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/login'));expect(state.api.request).toHaveBeenCalledWith('/password-resets','POST',{challengeId:flow.challengeId,flowToken:flow.flowToken,code:'000001',newPassword:'A valid component password'});expect(state.api.accept).not.toHaveBeenCalled();expect(state.api.forget).toHaveBeenCalledOnce();
});
it('PF-UT-093 unknown link response confirms identities without replaying the Google credential',async()=>{
 state.api.account=owner;state.api.sessionId='same-family';state.api.request.mockRejectedValueOnce(new ApiFailure('NETWORK_ERROR',0,undefined,0,true)).mockResolvedValueOnce({account:owner,session:{sessionId:'same-family'}}).mockResolvedValueOnce({identities:[{provider:'google'}]});render(<Screen screen="account/connections"/>);fireEvent.click(screen.getByRole('button',{name:'受控 Google SDK'}));await screen.findAllByText('Google 已連結');expect(state.api.request.mock.calls.map(c=>c[0])).toEqual(['/me/identities/google','/session','/me/identities']);expect(state.api.forget).not.toHaveBeenCalled();
});
it('PF-UT-100 unavailable flow storage does not leave sender recovery as an unhandled failure',async()=>{
 const failure=new ApiFailure('EMAIL_DELIVERY_FAILED',503);failure.recovery=flow;state.api.request.mockRejectedValue(failure);state.flows.save.mockRejectedValueOnce(new Error('storage unavailable'));render(<Screen screen="register"/>);fill('Email','owner@example.com');fireEvent.click(screen.getByRole('button',{name:'寄送驗證碼'}));await screen.findByText(/無法保存驗證流程/);expect(state.router.push).not.toHaveBeenCalled();
});
it('PF-UT-019 PF-UT-089 reset resend keeps generic delivery wording for every accepted 202',async()=>{
 state.flows.read.mockResolvedValue({...flow,purpose:'reset_password',resendAfter:new Date(state.api.serverNow-1000).toISOString()});state.api.request.mockResolvedValue({...flow,resendAfter:new Date(state.api.serverNow+60000).toISOString()});render(<Screen screen="reset-password"/>);await screen.findByLabelText('六位數驗證碼');fireEvent.click(screen.getByRole('button',{name:'重新寄送驗證碼'}));await screen.findByText('若此 Email 可處理，將收到新的驗證碼，請使用最新的驗證碼');expect(screen.queryByText('已重新寄送驗證碼，請使用最新的驗證碼')).toBeNull();
});
it('PF-UT-090 PF-UT-104 an open verification screen erases its flow and secrets at absolute expiry',async()=>{
 state.flows.read.mockResolvedValue(flow);render(<Screen screen="verify-email"/>);await screen.findByLabelText('六位數驗證碼');fill('六位數驗證碼','000001');fill('密碼','A valid component password');state.api.serverNow=Date.parse(flow.absoluteExpiresAt);await waitFor(()=>expect(state.flows.clear).toHaveBeenCalledOnce(),{timeout:2500});expect(screen.queryByLabelText('六位數驗證碼')).toBeNull();expect(screen.queryByLabelText('密碼')).toBeNull();expect(screen.getByText('驗證流程已失效，請重新申請')).toBeTruthy();
});
it.each([true,false])('PF-UT-096 logout confirmed=%s distinguishes a completed revoke from a changed Cookie family',async confirmed=>{
 state.api.account=owner;state.api.logout.mockResolvedValueOnce(confirmed);render(<Screen screen="account"/>);fireEvent.click(screen.getByRole('button',{name:'登出'}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith(confirmed?'/':'/login'));expect(state.session.setNotice).toHaveBeenCalledWith(confirmed?'LOGGED_OUT':'SESSION_CHANGED');
});
it('PF-UT-096 confirmed logout recovery shows completion and returns to the entry screen',async()=>{
 state.api.pendingRevoke=true;state.api.retryLogout.mockResolvedValueOnce(true);render(<Screen screen="login"/>);fireEvent.click(screen.getByRole('button',{name:'重試登出'}));await waitFor(()=>expect(state.router.replace).toHaveBeenCalledWith('/'));expect(state.session.setNotice).toHaveBeenCalledWith('LOGGED_OUT');
});
