import React from 'react';
import {ActivityIndicator,Image,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,View,type TextInputProps,type ScrollViewProps,type LayoutChangeEvent,type StyleProp,type ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import cafeBackground from '../assets/bg-cafe.jpg';

// 對齊 prototype.v2 的戀愛視覺小說色票系統
export const colors={rose:'#ff7aa2',roseDeep:'#ff4f86',gold:'#ffd27a',mint:'#7be0b8',sky:'#8cc9ff',ink:'#2a1730',plum:'#3a1a48',panel:'rgba(38,18,50,.84)',line:'rgba(255,255,255,.18)',muted:'#cbb5cb'};

export function SceneBackground({children,scrollRef,header,scrollProps}:{children:React.ReactNode;scrollRef?:React.Ref<React.ComponentRef<typeof ScrollView>>;header?:React.ReactNode;scrollProps?:ScrollViewProps}){
 return <View style={s.scene}>
  <Image source={cafeBackground} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]} resizeMode="cover" accessibilityIgnoresInvertColors/>
  <View pointerEvents="none" style={[StyleSheet.absoluteFill,{backgroundColor:'rgba(24,10,34,.78)'}]}/>
  <SafeAreaView style={{flex:1}}>{header}<KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView {...scrollProps} ref={scrollRef} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>
 </View>;
}

export function GlassPanel({children,onLayout,style}:{children:React.ReactNode;onLayout?:(event:LayoutChangeEvent)=>void;style?:StyleProp<ViewStyle>}){
 return <View onLayout={onLayout} style={[s.panel,style]}>{children}</View>;
}

export function PrimaryButton({label,onPress,disabled=false,secondary=false,compact=false,active=false,accentColor}:{label:string;onPress:()=>void;disabled?:boolean;secondary?:boolean;compact?:boolean;active?:boolean;accentColor?:string}){
 return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled,selected:active||undefined}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,compact&&s.compact,active&&s.activeTab,accentColor&&{borderColor:accentColor,backgroundColor:active?accentColor:'rgba(255,255,255,.06)'},disabled&&{opacity:.45},pressed&&{opacity:.78}]}>
  <Text style={[s.buttonText,secondary&&!active&&{color:'#fff7fa'},compact&&{fontSize:13,lineHeight:18}]}>{label}</Text>
 </Pressable>;
}

export function FormField({label,rightText,...props}:TextInputProps&{label:string;rightText?:string}){
 return <View style={{gap:6}}>
  <View style={s.labelRow}><Text style={s.label}>{label}</Text>{!!rightText&&<Text style={s.counter}>{rightText}</Text>}</View>
  <TextInput accessibilityLabel={label} placeholderTextColor="#9c82a0" autoCapitalize="none" style={s.input} {...props}/>
 </View>;
}

export function SubtleBadge({text}:{text:string}){
 return text?<View style={s.subtleBadge}><Text style={s.subtleText}>{text}</Text></View>:null;
}

export function InlineNotice({text}:{text:string}){
 return text?<View accessibilityLiveRegion="polite" style={s.notice}><Text style={s.noticeText}>{text}</Text></View>:null;
}

export function LoadingOverlay(){
 return <View style={{alignItems:'center',gap:8,paddingVertical:6}} accessibilityLiveRegion="polite"><ActivityIndicator color={colors.rose}/><Text style={s.body}>連線中，請稍候…</Text></View>;
}

// 頭像右下角專用的人物小頭示意編輯圖示（純幾何繪製，不依賴做作 Emoji）
export function PersonEditIcon(){
 return <View pointerEvents="none" style={s.personBadge}>
  <View style={s.personHead}/>
  <View style={s.personShoulders}/>
 </View>;
}

export const s=StyleSheet.create({
 scene:{flex:1,overflow:'hidden',backgroundColor:'#1a0d23'},
 scroll:{flexGrow:1,paddingHorizontal:14,paddingVertical:18,justifyContent:'flex-start',alignItems:'center'},
 panel:{width:'100%',maxWidth:460,backgroundColor:colors.panel,borderColor:colors.line,borderWidth:1,borderRadius:24,padding:20,gap:14,boxShadow:'0 20px 50px rgba(0,0,0,.35)'},
 eyebrow:{color:colors.gold,letterSpacing:2.4,fontSize:11,fontWeight:'700',textAlign:'center'},
 heading:{color:'#fff7fa',fontSize:24,lineHeight:32,fontWeight:'800',textAlign:'center'},
 body:{color:'#e8d8e8',fontSize:14,lineHeight:21},
 labelRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline'},
 label:{color:'#ffd9e6',fontSize:14,fontWeight:'700'},
 counter:{color:'rgba(255,255,255,.6)',fontSize:12},
 input:{color:'#fff',fontSize:15,paddingHorizontal:16,paddingVertical:11,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,.26)',backgroundColor:'rgba(0,0,0,.28)',minHeight:50},
 button:{backgroundColor:colors.rose,borderRadius:999,minHeight:50,justifyContent:'center',paddingHorizontal:18,paddingVertical:12},
 buttonText:{fontWeight:'700',color:colors.ink,fontSize:15,textAlign:'center'},
 secondary:{backgroundColor:'rgba(255,255,255,.08)',borderWidth:1,borderColor:'rgba(255,255,255,.24)'},
 compact:{minHeight:36,paddingHorizontal:10,paddingVertical:6,borderRadius:999,borderWidth:0},
 activeTab:{backgroundColor:colors.rose,borderColor:colors.rose},
 subtleBadge:{paddingHorizontal:12,paddingVertical:8,borderRadius:12,backgroundColor:'rgba(123,224,184,.10)',borderWidth:1,borderColor:'rgba(123,224,184,.42)'},
 subtleText:{color:'#c8f5e0',fontSize:12,lineHeight:18},
 focus:{outlineColor:colors.gold,outlineWidth:3,outlineOffset:3},
 notice:{paddingHorizontal:14,paddingVertical:10,borderRadius:12,backgroundColor:'rgba(255,210,122,.14)',borderWidth:1,borderColor:'rgba(255,210,122,.45)'},
 noticeText:{color:'#ffe4b5',fontSize:13,lineHeight:19},
 footer:{fontSize:12,color:colors.muted,textAlign:'center',lineHeight:18},
 personBadge:{position:'absolute',right:10,bottom:10,width:38,height:38,borderRadius:999,backgroundColor:colors.rose,borderWidth:2,borderColor:'#2a1730',alignItems:'center',justifyContent:'center',gap:2,boxShadow:'0 4px 12px rgba(0,0,0,.45)'},
 personHead:{width:10,height:10,borderRadius:999,backgroundColor:colors.ink},
 personShoulders:{width:18,height:8,borderTopLeftRadius:9,borderTopRightRadius:9,borderBottomLeftRadius:3,borderBottomRightRadius:3,backgroundColor:colors.ink}
});
