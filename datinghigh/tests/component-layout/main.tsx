import React from'react';import{createRoot}from'react-dom/client';import{Text,View}from'react-native-web';
import{SceneBackground,GlassPanel,PrimaryButton,FormField,InlineNotice,s}from'../../frontend/client/src/ui';
const q=new URLSearchParams(location.search),long=q.get('error')==='long';
createRoot(document.getElementById('root')!).render(<SceneBackground><GlassPanel><Text style={s.heading}>帳號表單</Text><InlineNotice text={long?'服務暫時無法使用，請稍後再試。'.repeat(16):''}/><FormField label="Email"/><FormField label="密碼" secureTextEntry/><FormField label="確認密碼" secureTextEntry/><PrimaryButton label="主要操作" onPress={()=>{document.documentElement.dataset.submitted='yes';}}/><PrimaryButton label="返回" secondary onPress={()=>{}}/></GlassPanel></SceneBackground>);
