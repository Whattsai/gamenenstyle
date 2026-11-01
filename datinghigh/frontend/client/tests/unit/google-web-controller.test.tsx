// @vitest-environment jsdom
import React from 'react';import {it,expect,vi,afterEach} from 'vitest';import {render,screen,fireEvent,waitFor,cleanup,act} from '@testing-library/react';
import GoogleButton from '../../src/GoogleButton.web';
afterEach(()=>{cleanup();delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;delete window.google;});
it('PF-UT-084 missing Google configuration leaves an explicit unavailable notice without a credential request',async()=>{
 delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;const request=vi.fn();render(<GoogleButton disabled={false} onCredential={request} onBusy={vi.fn()} onNotice={vi.fn()}/>);await screen.findByText('Google 登入暫時無法使用，請稍後再試');expect(request).not.toHaveBeenCalled();
});
it('PF-UT-091 PF-UT-092 cancelled SDK proof cannot become a newer operation, and duplicate callbacks cannot start another HTTP mutation',async()=>{
 process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID='controlled-public-client';let callback!:(response:any)=>Promise<void>;let buttonState:string|undefined;
 window.google={accounts:{id:{initialize:options=>{callback=options.callback;},renderButton:(element,options)=>{element.replaceChildren();buttonState=options.state;const button=document.createElement('button');button.textContent='Controlled SDK';button.onclick=options.click_listener;element.appendChild(button);}}}};
 let finish!:()=>void;const submitted=vi.fn(()=>new Promise<void>(r=>{finish=r;}));render(<GoogleButton disabled={false} onCredential={submitted} onBusy={vi.fn()} onNotice={vi.fn()}/>);await screen.findByRole('button',{name:'Controlled SDK'});
 fireEvent.click(screen.getByRole('button',{name:'Controlled SDK'}));const oldState=buttonState;fireEvent.click(await screen.findByRole('button',{name:'取消 Google 登入'}));fireEvent.click(screen.getByRole('button',{name:'Controlled SDK'}));const currentState=buttonState;
 await act(async()=>{void callback({credential:'controlled-old-memory-proof',state:oldState});});expect(submitted).not.toHaveBeenCalled();
 await act(async()=>{void callback({credential:'controlled-current-memory-proof',state:currentState});void callback({credential:'controlled-duplicate-memory-proof',state:currentState});});expect(submitted).toHaveBeenCalledTimes(1);expect(screen.queryByRole('button',{name:'取消 Google 登入'})).toBeNull();await act(async()=>finish());await waitFor(()=>expect(buttonState).not.toBe(currentState));
});
it('PF-BDD-075 Web SDK cancels a pending link when the session changes',async()=>{
 process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID='controlled-public-client';let callback!:(response:any)=>Promise<void>,buttonState:string|undefined;window.google={accounts:{id:{initialize:options=>{callback=options.callback;},renderButton:(element,options)=>{element.replaceChildren();buttonState=options.state;const button=document.createElement('button');button.textContent='Controlled SDK';button.onclick=options.click_listener;element.appendChild(button);}}}};const props={disabled:false,onCredential:vi.fn(async()=>{}),onBusy:vi.fn(),onNotice:vi.fn()};const view=render(<GoogleButton {...props} sessionId="old-family"/>);await screen.findByRole('button',{name:'Controlled SDK'});fireEvent.click(screen.getByRole('button',{name:'Controlled SDK'}));const oldState=buttonState;view.rerender(<GoogleButton {...props} sessionId="new-family"/>);expect(props.onNotice).toHaveBeenLastCalledWith('GOOGLE_SESSION_CHANGED');await act(async()=>callback({credential:'controlled-late-proof',state:oldState}));expect(props.onCredential).not.toHaveBeenCalled();
});
