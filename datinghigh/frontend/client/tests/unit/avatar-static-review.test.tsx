// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),Image:({source,onLoad,onError,testID}:any)=><img src={source.uri} onLoad={onLoad} onError={onError} data-testid={testID}/>}));
vi.mock('react-native-safe-area-context',async()=>({SafeAreaView:(await vi.importActual<typeof import('react-native')>('react-native-web')).View}));
import {AvatarStaticReview} from '../../src/AvatarStaticReview';
import catalog from '../../../../contracts/builtin-static-poses.json';
afterEach(cleanup);
it('static review blocks adoption after a visible image fails, and explicit reload remounts that failed image before unlocking',()=>{
 const p=catalog.packs['female-01'],version='a'.repeat(64),pack:any={...p,packageVersion:version,assets:p.assets.map(a=>({...a,url:`/${a.id}.png`}))},confirm=vi.fn();
 const view=render(<AvatarStaticReview package={pack} origin="http://localhost" busy={false} onConfirm={confirm}/>);
 const button=screen.getByRole('button',{name:'確認採用完整靜態化身'});
 expect(button.getAttribute('aria-disabled')).toBe('true');
 for(const a of p.assets)fireEvent.load(screen.getByTestId(`static-preload-review:${version}:0-${a.id}`));
 expect(button.getAttribute('aria-disabled')).not.toBe('true');
 const image=view.container.querySelector('[data-testid="actor-layer-body"] img')!;fireEvent.error(image);
 fireEvent.click(button);expect(confirm).not.toHaveBeenCalled();expect(button.getAttribute('aria-disabled')).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'重新載入成品檢視'}));
 expect(view.container.querySelector('[data-testid="actor-layer-body"] img')).not.toBe(image);
 expect(button.getAttribute('aria-disabled')).toBe('true');
 for(const a of p.assets)fireEvent.load(screen.getByTestId(`static-preload-review:${version}:1-${a.id}`));
 fireEvent.click(button);expect(confirm).toHaveBeenCalledOnce();
});
