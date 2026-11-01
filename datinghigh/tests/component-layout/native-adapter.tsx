import React from'react';import{View}from'react-native-web';export * from'react-native-web';
export const Platform={OS:new URLSearchParams(location.search).get('platform')??'android'};
// Unit boundary: the OS supplies keyboard-resized viewport and insets; layout and scrolling use real DOM/RN Web.
export const KeyboardAvoidingView=({children,style,behavior}:any)=><View style={style} testID="keyboard-avoiding" dataSet={{behavior}}>{children}</View>;
