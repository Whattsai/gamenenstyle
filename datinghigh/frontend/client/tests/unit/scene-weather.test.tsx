// @vitest-environment jsdom
import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen} from '@testing-library/react';
import {Animated} from 'react-native';
import {SceneWeather} from '../../src/SceneWeather';
vi.mock('react-native',async()=>({...await vi.importActual<typeof import('react-native')>('react-native-web')}));
afterEach(cleanup);
it('public rain intensity changes visible drops inside the published window and can stop',()=>{
 const props={frame:{left:80,top:20,width:100,height:160},phase:new Animated.Value(0)};
 const view=render(<SceneWeather {...props} intensity="heavy"/>);expect(screen.getAllByTestId('scene-weather-drop')).toHaveLength(16);expect(getComputedStyle(screen.getByTestId('scene-weather-heavy')).overflowX).toBe('hidden');
 view.rerender(<SceneWeather {...props} intensity="easing"/>);expect(screen.getAllByTestId('scene-weather-drop')).toHaveLength(4);
 view.rerender(<SceneWeather {...props} intensity="stopped"/>);expect(screen.queryByTestId('scene-weather-drop')).toBeNull();
});
