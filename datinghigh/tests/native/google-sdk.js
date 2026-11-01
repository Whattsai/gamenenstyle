import React from'react';import{Pressable,Text}from'react-native';
// Explicit development-test-only SDK boundary. The real controller, Screen, API and D1 still execute.
// No real Google credential is generated or persisted; real SDK acceptance is recorded separately.
export const GoogleOneTapSignIn={configure(){},async presentExplicitSignIn(){return{type:'success',data:{idToken:'controlled-memory-proof'}};}};
export function GoogleSignInButton({onPress,disabled}){return React.createElement(Pressable,{accessibilityRole:'button',accessibilityLabel:'受控 Google SDK',onPress,disabled,style:{minHeight:44,padding:12}},React.createElement(Text,{style:{color:'#fff'}},'受控 Google SDK'));}
