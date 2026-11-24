// @vitest-environment jsdom
import React from 'react';
import {afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web'),Image:({source,accessibilityLabel,onLoad,onError,style}:any)=><img src={source?.uri} aria-label={accessibilityLabel} onLoad={onLoad} onError={onError} style={style}/> }));
import {StoryPortrait} from '../../src/StoryPortrait';
import catalog from '../../../../contracts/builtin-static-poses.json';
afterEach(cleanup);
const portrait=(version:string)=>({name:'另一位旅人',version,source:{uri:`https://private.test/${version}/neutral`}});
it('static adopted art waits for a sentence boundary, stays selected during the next line and clears on authorization removal',()=>{
 const p=catalog.packs['female-01'];
 const value={...portrait('a'),staticAvatar:{package:{schemaVersion:p.schemaVersion,packageVersion:'c'.repeat(64),assets:p.assets.map(a=>({...a,url:'/'+a.sha256+'.png'})),poses:p.poses},origin:'http://localhost'}} as any;
 const view=render(<StoryPortrait portrait={value} safeToSwap={false}/>);
 expect(screen.queryByTestId('actor-identity-'+ 'c'.repeat(64))).toBeNull();
 view.rerender(<StoryPortrait portrait={value} safeToSwap/>);
 expect(screen.getByTestId('actor-identity-'+ 'c'.repeat(64))).toBeTruthy();
 view.rerender(<StoryPortrait portrait={{...value,expression:'smile'}} safeToSwap={false}/>);
 expect(screen.getByTestId('actor-identity-'+ 'c'.repeat(64))).toBeTruthy();
 view.rerender(<StoryPortrait safeToSwap={false}/>);
 expect(screen.queryByTestId('actor-identity-'+ 'c'.repeat(64))).toBeNull();
});
it('SD-UT-066: a decoded new avatar waits for the current sentence to finish and does not reset narration',()=>{
 const a=portrait('a'),b=portrait('b');const view=render(<StoryPortrait portrait={a} safeToSwap={false}/>);
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/a/');
 view.rerender(<StoryPortrait portrait={b} safeToSwap={false}/>);fireEvent.load(screen.getByLabelText('正在載入新角色'));
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/a/');
 view.rerender(<StoryPortrait portrait={b} safeToSwap/>);
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/b/');
});
it('new failed or stale decodes keep the previous avatar; removing authority clears all portrait images',()=>{
 const view=render(<StoryPortrait portrait={portrait('a')} safeToSwap/>);
 view.rerender(<StoryPortrait portrait={portrait('b')} safeToSwap/>);const stale=screen.getByLabelText('正在載入新角色');
 view.rerender(<StoryPortrait portrait={portrait('c')} safeToSwap/>);fireEvent.load(stale);fireEvent.error(screen.getByLabelText('正在載入新角色'));
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/a/');
 view.rerender(<StoryPortrait safeToSwap/>);expect(screen.queryAllByRole('img')).toHaveLength(0);
});
it('same asset version across dialogue renders does not create a new preload',()=>{
 const view=render(<StoryPortrait portrait={portrait('a')} safeToSwap/>);
 for(let n=0;n<5;n++)view.rerender(<StoryPortrait portrait={portrait('a')} safeToSwap={n%2===0}/>);
 expect(screen.queryByLabelText('正在載入新角色')).toBeNull();expect(screen.getAllByRole('img')).toHaveLength(1);
});
it('SD-UT-066: all five new expressions decode before an atomic pack swap, then scripted expressions reuse that pack',()=>{
 const sources=(v:string)=>Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map(e=>[e,{uri:`https://private.test/${v}/${e}`}])) as any;
 const view=render(<StoryPortrait portrait={portrait('a')} safeToSwap/>);
 const b={...portrait('b'),sources:sources('b'),expression:'smile' as const};
 view.rerender(<StoryPortrait portrait={b} safeToSwap/>);
 for(const e of ['neutral','smile','surprised','thoughtful'])fireEvent.load(screen.getByLabelText(`正在載入新角色・${e}`));
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/a/');
 fireEvent.load(screen.getByLabelText('正在載入新角色・concerned'));
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/b/smile');
 view.rerender(<StoryPortrait portrait={{...b,expression:'thoughtful'}} safeToSwap/>);
 expect(screen.getByLabelText('另一位旅人的遊戲立繪').getAttribute('src')).toContain('/b/thoughtful');expect(screen.queryByLabelText('正在載入新角色・neutral')).toBeNull();
});
