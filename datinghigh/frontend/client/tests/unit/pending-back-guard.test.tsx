// @vitest-environment jsdom
import React from'react';import{afterEach,expect,it,vi}from'vitest';import{cleanup,renderHook}from'@testing-library/react';
const native=vi.hoisted(()=>({platform:'android',add:vi.fn(),remove:vi.fn()}));
vi.mock('react-native',()=>({Platform:{get OS(){return native.platform;}},BackHandler:{addEventListener:native.add}}));
import{usePendingBackGuard}from'../../src/pending-back-guard';
afterEach(()=>{cleanup();vi.clearAllMocks();native.platform='android';});
it('PF-UT-085 PF-UT-102 Android back is blocked immediately for an in-flight operation and restored afterward',()=>{
 native.add.mockReturnValue({remove:native.remove});const pending={current:false};const view=renderHook(({busy})=>usePendingBackGuard(pending,busy),{initialProps:{busy:false}});expect(native.add).toHaveBeenCalledOnce();const [event,handler]=native.add.mock.calls[0];expect(event).toBe('hardwareBackPress');expect(handler()).toBe(false);pending.current=true;expect(handler()).toBe(true);pending.current=false;view.rerender({busy:true});expect(handler()).toBe(true);view.rerender({busy:false});expect(handler()).toBe(false);view.unmount();expect(native.remove).toHaveBeenCalledOnce();
});
it('PF-UT-085 iOS does not install an Android hardware-back listener',()=>{
 native.platform='ios';renderHook(()=>usePendingBackGuard({current:true},true));expect(native.add).not.toHaveBeenCalled();
});
