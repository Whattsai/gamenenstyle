// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import {PanResponder,View} from 'react-native';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
import {SceneWorldObjects,isInsideDropZone} from '../../src/SceneWorldObjects';
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.useRealTimers();});
const paper:any={id:'paper',label:'濕紙單',rendererId:'paper',state:'on-floor',holderRole:null,areaId:'entrance',x:.3,y:.4};
it('world object is visible and inspectable without committing; held objects do not remain as ghost copies',()=>{
 const inspect=vi.fn(),drop=vi.fn();const view=render(<SceneWorldObjects objects={[paper]} areaId="entrance" actorRole="inviter" frame={{left:0,top:0,width:800,height:450}} onInspect={inspect} onDrop={drop}/>);
 fireEvent.click(screen.getByLabelText('場景物件：濕紙單'));expect(inspect).toHaveBeenCalledWith('paper');expect(drop).not.toHaveBeenCalled();
 view.rerender(<SceneWorldObjects objects={[{...paper,holderRole:'acceptor'}]} areaId="entrance" actorRole="inviter" frame={{left:0,top:0,width:800,height:450}} onInspect={inspect} onDrop={drop}/>);expect(screen.queryByLabelText('場景物件：濕紙單')).toBeNull();
 view.rerender(<SceneWorldObjects objects={[{...paper,holderRole:'inviter'}]} areaId="counter" actorRole="inviter" frame={{left:0,top:0,width:800,height:450}} onInspect={inspect} onDrop={drop}/>);expect(screen.getByLabelText('你拿著：濕紙單')).toBeTruthy();
});
it('a drag only commits within the measured drop slot; outside drops remain previews',()=>{
 expect(isInsideDropZone({x:30,y:40},{x:20,y:20,width:80,height:60})).toBe(true);expect(isInsideDropZone({x:10,y:40},{x:20,y:20,width:80,height:60})).toBe(false);expect(isInsideDropZone({x:30,y:40},undefined)).toBe(false);
});
it('a released drag retains its actual drop point while native layout measurement waits asynchronously',()=>{
 vi.useFakeTimers();let responder:any;const original=PanResponder.create;
 vi.spyOn(PanResponder,'create').mockImplementation(config=>{responder=config;return original(config);});
 const drop=vi.fn();render(<SceneWorldObjects objects={[paper]} areaId="entrance" actorRole="inviter" frame={{left:0,top:0,width:800,height:450}} onInspect={vi.fn()} onDrop={drop} showSlot/>);
 vi.spyOn(screen.getByTestId('scene-drop-slot'),'getBoundingClientRect').mockReturnValue({x:20,y:30,left:20,top:30,right:120,bottom:120,width:100,height:90,toJSON(){}});
 const gesture={moveX:60,moveY:70};
 act(()=>{responder.onPanResponderRelease({},gesture);gesture.moveX=0;gesture.moveY=0;vi.runOnlyPendingTimers();});
 expect(drop).toHaveBeenCalledExactlyOnceWith('paper');
});
it('touching an object keeps its drag gesture out of the surrounding scene panning handler',()=>{
 const pan=vi.fn();render(<View onTouchStart={pan} onTouchMove={pan}><SceneWorldObjects objects={[paper]} areaId="entrance" actorRole="inviter" frame={{left:0,top:0,width:800,height:450}} onInspect={vi.fn()} onDrop={vi.fn()}/></View>);
 const object=screen.getByLabelText('場景物件：濕紙單'),touch={identifier:1,target:object,force:1,clientX:40,clientY:50,pageX:40,pageY:50};
 fireEvent.touchStart(object,{touches:[touch],changedTouches:[touch]});fireEvent.touchMove(object,{touches:[touch],changedTouches:[touch]});fireEvent.touchEnd(object,{touches:[],changedTouches:[touch]});
 expect(pan).not.toHaveBeenCalled();
});
