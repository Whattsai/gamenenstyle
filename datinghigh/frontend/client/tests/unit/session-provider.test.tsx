// @vitest-environment jsdom
import React from 'react';import {it,vi,expect,afterEach} from 'vitest';import{render,waitFor,cleanup}from'@testing-library/react';
const state=vi.hoisted(()=>({replace:vi.fn(),restore:vi.fn(),platform:'android'}));
vi.mock('react-native',()=>({Platform:{OS:'android'},AppState:{addEventListener:()=>({remove:vi.fn()})}}));
vi.mock('expo-router',()=>({useRouter:()=>({replace:state.replace})}));
vi.mock('../../src/storage',()=>({storage:{}}));vi.mock('../../src/flow',()=>({FlowStore:class{}}));
vi.mock('../../src/api',async()=>{const real=await vi.importActual<typeof import('../../src/api')>('../../src/api');return{...real,ApiClient:class{get platform(){return state.platform;}restore=state.restore;foreground=vi.fn();onChange=vi.fn();}};});
import{ApiFailure}from'../../src/api';import{SessionProvider,useSession}from'../../src/session';
afterEach(()=>{cleanup();vi.clearAllMocks();state.platform='android';});
it.each([['logged-out','/','LOGGED_OUT'],['session-changed','/login','SESSION_CHANGED']])('PF-UT-096 cold logout recovery %s displays the matching outcome',async(outcome,path,notice)=>{
 state.restore.mockResolvedValueOnce(outcome);function Notice(){return <span>{useSession().notice}</span>;}const view=render(<SessionProvider><Notice/></SessionProvider>);await waitFor(()=>expect(state.replace).toHaveBeenCalledWith(path));await waitFor(()=>expect(view.getByText(notice)).toBeTruthy());
});
it('PF-UT-097 cold native restore of a replaced family routes to login',async()=>{
 state.restore.mockRejectedValueOnce(new ApiFailure('REFRESH_REVOKED',401));render(<SessionProvider><span>content</span></SessionProvider>);await waitFor(()=>expect(state.replace).toHaveBeenCalledWith('/login'));
});
it('PF-BDD-085 cold server failure retains its safe trace for the recovery screen',async()=>{
 state.restore.mockRejectedValueOnce(new ApiFailure('DEPENDENCY_UNAVAILABLE',503,'safe-trace'));function Notice(){const session=useSession();return <span>{session.notice}:{session.noticeTrace}</span>;}const view=render(<SessionProvider><Notice/></SessionProvider>);await waitFor(()=>expect(view.getByText('DEPENDENCY_UNAVAILABLE:safe-trace')).toBeTruthy());
});
it('PF-UT-083 a first launch without credentials retains the entry screen',async()=>{
 state.restore.mockRejectedValueOnce(new ApiFailure('ACCESS_TOKEN_MISSING',401));render(<SessionProvider><span>content</span></SessionProvider>);await waitFor(()=>expect(state.restore).toHaveBeenCalled());expect(state.replace).not.toHaveBeenCalled();
});
it('PF-UT-097 invalid stored native Refresh routes to login',async()=>{
 state.restore.mockRejectedValueOnce(new ApiFailure('REFRESH_INVALID',401));render(<SessionProvider><span>content</span></SessionProvider>);await waitFor(()=>expect(state.replace).toHaveBeenCalledWith('/login'));
});
it('PF-UT-097 a lost cold native Refresh response routes to login',async()=>{
 state.restore.mockRejectedValueOnce(new ApiFailure('NETWORK_ERROR',0));render(<SessionProvider><span>content</span></SessionProvider>);await waitFor(()=>expect(state.replace).toHaveBeenCalledWith('/login'));
});
it('PF-UT-083 an anonymous Web launch retains the entry screen',async()=>{
 state.platform='web';state.restore.mockRejectedValueOnce(new ApiFailure('REFRESH_INVALID',401));render(<SessionProvider><span>content</span></SessionProvider>);await waitFor(()=>expect(state.restore).toHaveBeenCalled());expect(state.replace).not.toHaveBeenCalled();
});
