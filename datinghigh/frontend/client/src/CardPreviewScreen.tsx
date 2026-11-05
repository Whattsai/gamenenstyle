import React,{useCallback,useState} from 'react';
import {Image,Text,View,useWindowDimensions,type ImageSourcePropType} from 'react-native';
import {useFocusEffect,useRouter} from 'expo-router';
import {api,useSession} from './session';
import type {ProfileField} from './profile-fields';
import {SceneBackground,GlassPanel,PrimaryButton,SubtleBadge,InlineNotice,LoadingOverlay,s} from './ui';

// 僅渲染伺服器回傳的開放欄位；可供日後已授權的交換名片頁共用。
export function CardDisplay({card,fields,groups,photoSource}:{card:Record<string,any>;fields:ProfileField[];groups:Record<string,{id:string;label:string}[]>;photoSource:(id:string)=>ImageSourcePropType}){
 const {width}=useWindowDimensions();
 return <View style={{width:'100%',maxWidth:1120,flexDirection:width>=820?'row':'column',flexWrap:'wrap',gap:16}}>
  {fields.filter(f=>f.shareable&&Object.hasOwn(card,f.cardKey)&&card[f.cardKey]!=null).sort((a,b)=>a.order-b.order).map(field=>{
   const value=card[field.cardKey],options=groups[field.options??field.key]??[];
   const label=(v:string)=>options.find(o=>o.id===v)?.label??v;
   return <GlassPanel key={field.key} style={{maxWidth:width>=820?'48%':'100%'}}>
    <Text style={s.label}>{field.cardLabel??field.label}</Text>
    {field.type==='photos'?(value as {assetId:string}[]).map((photo,index)=><Image key={photo.assetId} accessibilityLabel={`名片照片 ${index+1}`} source={photoSource(photo.assetId)} resizeMode="contain" style={{width:'100%',aspectRatio:3/4}}/>):
     <Text style={s.body}>{Array.isArray(value)?value.map(label).join('、'):label(String(value))}</Text>}
   </GlassPanel>;
  })}
 </View>;
}
export function CardPreviewScreen(){
 const router=useRouter(),session=useSession();
 const [data,setData]=useState<{accountId:string;card:Record<string,any>;fields:ProfileField[];groups:Record<string,any>}|null>(null),[error,setError]=useState('');
 const account=api.account?.accountId;
 useFocusEffect(useCallback(()=>{
  let alive=true;setData(null);setError('');
  if(!session.ready)return;
  if(!account){router.replace('/login');return;}
  Promise.all([api.request('/me/card-preview'),api.request('/profile-catalog')]).then(([card,catalog])=>{
   if(alive&&api.account?.accountId===account)setData({accountId:account,card,fields:catalog.fields,groups:catalog.groups});
  }).catch(()=>{if(alive)setError('無法讀取最新名片，請返回後再試');});
  return()=>{alive=false;setData(null);};
 },[session.ready,account,router]));
 return <SceneBackground header={<View style={{padding:12}}><PrimaryButton label="返回" compact secondary onPress={()=>router.canGoBack()?router.back():router.replace('/account')}/></View>}>
  <SubtleBadge text="這是你自己的預覽，尚未授權其他玩家查看；未來須在有效互動中由雙方同意。"/>
  <InlineNotice text={error}/>{data&&data.accountId===account&&session.ready?<CardDisplay {...data} photoSource={id=>({uri:`${api.origin}/api/v1/me/media/${id}`,headers:api.platform==='web'?undefined:{Authorization:`Bearer ${api.access}`},cache:'reload'})}/>:!error&&<LoadingOverlay/>}
 </SceneBackground>;
}
