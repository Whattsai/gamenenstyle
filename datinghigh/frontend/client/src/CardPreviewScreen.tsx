import React,{useCallback,useState} from 'react';
import {Image,Platform,Text,View,useWindowDimensions,type ImageSourcePropType} from 'react-native';
import {useFocusEffect,useRouter} from 'expo-router';
import {api,useSession} from './session';
import {avatarAssets} from './avatar-assets';
import type {ProfileField} from './profile-fields';
import {colors,SceneBackground,GlassPanel,PrimaryButton,SubtleBadge,InlineNotice,LoadingOverlay,s} from './ui';

// 僅渲染伺服器回傳的開放欄位；鏡像個人資料頁排版，做成唯讀名片。
export function CardDisplay({card,fields,groups,photoSource}:{card:Record<string,any>;fields:ProfileField[];groups:Record<string,{id:string;label:string}[]>;photoSource:(id:string)=>ImageSourcePropType}){
 const {width}=useWindowDimensions(),isWide=width>=820;
 const avatarRef:string|undefined=card.selectedAvatarRef;
 const avatarType:string|undefined=card.selectedAvatarType;
 const hasAvatar=Boolean(avatarRef);
 const avatarImg=avatarType==='generated'&&avatarRef?{uri:`${api.origin}/api/v1/me/media/${avatarRef}`,headers:api.platform==='web'?undefined:{Authorization:`Bearer ${api.access}`},cache:'reload' as const}:avatarRef?(avatarAssets[avatarRef]??avatarAssets['male-01']):null;
 const regionLabel=card.regionCode?groups.regionCode?.find(o=>o.id===card.regionCode)?.label??card.regionCode:undefined;
 const selectedTraits:string[]=(card.traitTagIds??[]).map((id:string)=>groups.traitTagIds?.find(o=>o.id===id)?.label??id).filter(Boolean).slice(0,4);
 const visibleFields=fields.filter(f=>f.shareable&&Object.hasOwn(card,f.cardKey)&&card[f.cardKey]!=null).sort((a,b)=>a.order-b.order);
 const detailFields=visibleFields.filter(f=>f.key!=='nickname'&&f.key!=='bio');

 const avatarCardPanel=(card.nickname||card.bio||regionLabel||selectedTraits.length>0||hasAvatar)&&(
  <GlassPanel style={{width:isWide?340:'100%',maxWidth:isWide?340:'100%',alignItems:'center',gap:12}}>
   <View style={{width:isWide?'100%':184,aspectRatio:3/4,borderRadius:22,overflow:'hidden',borderWidth:2,borderStyle:hasAvatar?'solid':'dashed',borderColor:colors.rose,backgroundColor:hasAvatar?'rgba(0,0,0,.32)':'rgba(255,122,162,.08)',alignItems:'center',justifyContent:'center'}}>
    {hasAvatar&&avatarImg?<Image source={avatarImg} accessibilityLabel={avatarType==='generated'?'目前遊戲化身':`目前頭像 ${avatarRef}`} resizeMode="cover" style={{width:'100%',height:'100%'}}/>:<View style={{alignItems:'center',gap:8,padding:16}}>
     <View style={{width:52,height:52,borderRadius:999,backgroundColor:'rgba(255,122,162,.20)',borderWidth:1.5,borderColor:colors.rose,alignItems:'center',justifyContent:'center'}}>
      <Text style={{color:colors.rose,fontSize:26,fontWeight:'800',lineHeight:30}}>👤</Text>
     </View>
     <Text style={{color:'#fff7fa',fontSize:16,fontWeight:'700'}}>尚未設定化身</Text>
    </View>}
   </View>
   {!!card.nickname&&<Text accessibilityRole="header" style={[s.heading,{fontSize:22,marginTop:2}]}>{card.nickname}</Text>}
   {!!card.bio&&<Text style={[s.body,{textAlign:'center',color:colors.muted,fontSize:13}]}>{card.bio}</Text>}
   {(regionLabel||selectedTraits.length>0)&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6,justifyContent:'center'}}>
    {regionLabel&&<View style={{paddingHorizontal:10,paddingVertical:3,borderRadius:999,backgroundColor:'rgba(255,210,122,.16)',borderWidth:1,borderColor:colors.gold}}><Text style={{fontSize:11,color:colors.gold,fontWeight:'700'}}>{regionLabel}</Text></View>}
    {selectedTraits.map(t=><View key={t} style={{paddingHorizontal:10,paddingVertical:3,borderRadius:999,backgroundColor:'rgba(255,122,162,.16)',borderWidth:1,borderColor:colors.rose}}><Text style={{fontSize:11,color:'#ffd9e6',fontWeight:'700'}}>{t}</Text></View>)}
   </View>}
  </GlassPanel>
 );

 return <View style={{width:'100%',maxWidth:isWide?1120:480,flexDirection:isWide?'row':'column',alignItems:'flex-start',gap:22}}>
  {avatarCardPanel}
  <View style={{flex:1,width:'100%',gap:16}}>
   <GlassPanel style={{maxWidth:'100%',gap:14}}>
    <Text accessibilityRole="header" style={[s.heading,{fontSize:20,textAlign:'left'}]}>名片資料</Text>
    {detailFields.map(field=>{
     const key=field.key,value=card[field.cardKey],editor=field.editor??field.type;
     const options=groups[field.options??field.key]??[];
     const label=(v:string)=>options.find(o=>o.id===v)?.label??v;
     if(field.type==='photos'){
      const photoList=(value as {assetId:string}[]);
      return <View key={key} style={{gap:8}}>
       <Text style={s.label}>{field.cardLabel??field.label}</Text>
       <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{photoList.map((photo,index)=><View key={photo.assetId} style={{width:isWide?'31%':'48%',aspectRatio:3/4,borderRadius:12,overflow:'hidden',backgroundColor:'rgba(0,0,0,.28)',borderWidth:1,borderColor:colors.line}}>
        <Image source={photoSource(photo.assetId)} accessibilityLabel={`名片照片 ${index+1}`} resizeMode="cover" style={{width:'100%',height:'100%'}}/>
       </View>)}</View>
      </View>;
     }
     if(editor==='choice'||editor==='multi'){
      const items=Array.isArray(value)?value:[value];
      return <View key={key} style={{gap:8}}>
       <Text style={s.label}>{field.cardLabel??field.label}</Text>
       <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{items.map(item=><View key={String(item)} style={{paddingHorizontal:12,paddingVertical:7,borderRadius:999,borderWidth:1,borderColor:colors.rose,backgroundColor:'rgba(255,122,162,.14)'}}>
        <Text style={{fontSize:13,fontWeight:'700',color:'#fff7fa'}}>{label(String(item))}</Text>
       </View>)}</View>
      </View>;
     }
     return <View key={key} style={{gap:8}}>
      <Text style={s.label}>{field.cardLabel??field.label}</Text>
      <View style={[s.input,{justifyContent:'center',minHeight:46}]}>
       <Text style={{color:'#fff',fontSize:15}}>{String(value)}</Text>
      </View>
     </View>;
    })}
   </GlassPanel>
  </View>
 </View>;
}

export function CardPreviewScreen(){
 const router=useRouter(),session=useSession(),{width}=useWindowDimensions(),isWide=width>=820;
 const [data,setData]=useState<{accountId:string;card:Record<string,any>;fields:ProfileField[];groups:Record<string,any>}|null>(null),[error,setError]=useState('');
 const account=api.account?.accountId;
 useFocusEffect(useCallback(()=>{
  let alive=true;setData(null);setError('');
  if(!session.ready)return;
  if(!account){router.replace('/login');return;}
  Promise.all([api.request('/me/card-preview'),api.request('/profile-catalog')]).then(([card,catalog])=>{
   if(alive&&api.account?.accountId===account){
    setData({accountId:account,card,fields:catalog.fields,groups:catalog.groups});
   }
  }).catch(()=>{if(alive)setError('無法讀取最新名片，請返回後再試');});
  return()=>{alive=false;setData(null);};
 },[session.ready,account,router]));
 return <SceneBackground header={<View style={{alignItems:'center',paddingLeft:12,paddingRight:Platform.OS==='web'?12:52,paddingVertical:8,backgroundColor:'rgba(26,12,36,.92)',borderBottomWidth:1,borderColor:colors.line}}><View style={{width:'100%',maxWidth:isWide?1120:480,gap:8}}>
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:6}}>
   <PrimaryButton label="返回" compact secondary onPress={()=>router.canGoBack()?router.back():router.replace('/account')}/>
   <Text style={[s.label,{fontSize:15,color:'#fff'}]}>我的名片</Text>
   <View style={{width:54}}/>
  </View>
  <SubtleBadge text="這是你自己的預覽，尚未授權其他玩家查看；未來須在有效互動中由雙方同意。"/>
  <InlineNotice text={error}/>
 </View></View>}>
  {data&&data.accountId===account&&session.ready?<CardDisplay {...data} photoSource={id=>({uri:`${api.origin}/api/v1/me/media/${id}`,headers:api.platform==='web'?undefined:{Authorization:`Bearer ${api.access}`},cache:'reload'})}/>:!error&&<LoadingOverlay/>}
 </SceneBackground>;
}
