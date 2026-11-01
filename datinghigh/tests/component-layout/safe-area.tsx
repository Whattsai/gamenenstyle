import React from'react';import{View}from'react-native-web';
export function SafeAreaView({children,style}:any){const q=new URLSearchParams(location.search);const active=q.get('insets')==='yes';const top=active?(q.get('platform')==='ios'?44:24):0,bottom=active?34:0;return <View testID="safe-area" style={[style,{paddingTop:top,paddingBottom:bottom}]}>{children}</View>;}
