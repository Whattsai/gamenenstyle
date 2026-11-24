// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
vi.mock('react-native',async()=>{
 const web=await vi.importActual<typeof import('react-native')>('react-native-web');
 return {...web,Image:({source,onLoad,onError,testID}:any)=><img src={source.uri} onLoad={onLoad} onError={onError} data-testid={testID}/>};
});
import {StaticAvatarPreload} from '../../src/StaticAvatarPreload';
afterEach(cleanup);
const packageOf=(id:string)=>({schemaVersion:'static-poses.v1',packageVersion:id,assets:['stand','sit','read','hold'].map(id=>({id,url:`/${id}.png`,sha256:'a'.repeat(64),mimeType:'image/png',width:1774,height:887,byteSize:100})),poses:[]}) as any;
it('SEF-UT-536 static: every sheet must decode, errors remain failed and a previous package cannot unlock its replacement',()=>{
 const ready=vi.fn(),error=vi.fn(),view=render(<StaticAvatarPreload identity="own:a" package={packageOf('a')} origin="http://localhost" onReady={ready} onError={error}/>);
 fireEvent.load(screen.getByTestId('static-preload-own:a-stand'));fireEvent.load(screen.getByTestId('static-preload-own:a-sit'));fireEvent.load(screen.getByTestId('static-preload-own:a-read'));
 expect(ready).not.toHaveBeenCalled();
 fireEvent.error(screen.getByTestId('static-preload-own:a-hold'));fireEvent.load(screen.getByTestId('static-preload-own:a-hold'));
 expect(error).toHaveBeenCalledOnce();expect(ready).not.toHaveBeenCalled();
 view.rerender(<StaticAvatarPreload identity="own:b" package={packageOf('b')} origin="http://localhost" onReady={ready} onError={error}/>);
 for(const id of ['stand','sit','read','hold'])fireEvent.load(screen.getByTestId('static-preload-own:b-'+id));
 expect(ready).toHaveBeenCalledExactlyOnceWith('own:b');
});
