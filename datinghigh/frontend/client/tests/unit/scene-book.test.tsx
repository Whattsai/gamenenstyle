// @vitest-environment jsdom
import React from 'react';
import {it,expect,vi,afterEach} from 'vitest';
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
import {SceneBook} from '../../src/SceneBook';
afterEach(cleanup);
const book={id:'original',objectId:'book',title:'雨後的信',category:'愛情',summary:'一封遲到的信。',pages:['第一頁：窗邊的雨停了。','第二頁：她把信留給明天。']};
it('book pages are local previews, closing returns to the original object without sending story actions',async()=>{
 const close=vi.fn(),view=render(<SceneBook book={book} frame={{left:80,top:30,width:40,height:70}} viewport={{width:500,height:350}} onClose={close}/>);
 expect(screen.getByText(book.pages[0])).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'下一頁'}));expect(screen.getByText(book.pages[1])).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'合上《雨後的信》'}));await waitFor(()=>expect(close).toHaveBeenCalledOnce());
 view.rerender(<SceneBook key="new-book" book={{...book,id:'other',title:'別本書'}} frame={{left:80,top:30,width:40,height:70}} viewport={{width:500,height:350}} onClose={close}/>);
 expect(screen.getByText(book.pages[0])).toBeTruthy();expect(view.container.querySelector('[data-testid="scene-open-book"]')).toBeTruthy();
});
