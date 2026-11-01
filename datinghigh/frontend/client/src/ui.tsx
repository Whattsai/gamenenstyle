import React from 'react';
import {ActivityIndicator,Image,KeyboardAvoidingView,Platform,Pressable,ScrollView,StyleSheet,Text,TextInput,View,type TextInputProps} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import cafeBackground from '../assets/bg-cafe.jpg';
export const colors={rose:'#ff7aa2',roseDeep:'#ff4f86',gold:'#ffd27a',ink:'#2a1730',plum:'#3a1a48'};
export function SceneBackground({children}:{children:React.ReactNode}){return <View style={s.scene}>
 <Image source={cafeBackground} style={[StyleSheet.absoluteFill,{width:'100%',height:'100%'}]} resizeMode="cover" accessibilityIgnoresInvertColors/>
 <View style={[StyleSheet.absoluteFill,{backgroundColor:'rgba(24,10,33,.80)'}]}/>
 <SafeAreaView style={{flex:1}}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">{children}</ScrollView></KeyboardAvoidingView></SafeAreaView>
 </View>;}
export function GlassPanel({children}:{children:React.ReactNode}){return <View style={s.panel}>{children}</View>;}
export function PrimaryButton({label,onPress,disabled=false,secondary=false}:{label:string;onPress:()=>void;disabled?:boolean;secondary?:boolean}){return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,disabled&&{opacity:.5},pressed&&{opacity:.75}]}><Text style={[s.buttonText,secondary&&{color:'#fff'}]}>{label}</Text></Pressable>;}
export function FormField({label,...props}:TextInputProps&{label:string}){return <View style={{gap:8}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#ac93af" autoCapitalize="none" style={s.input} {...props}/></View>;}
export function InlineNotice({text}:{text:string}){return text?<View accessibilityLiveRegion="polite" style={s.notice}><Text style={s.noticeText}>{text}</Text></View>:null;}
export function LoadingOverlay(){return <View style={{alignItems:'center',gap:8}} accessibilityLiveRegion="polite"><ActivityIndicator color={colors.rose}/><Text style={s.body}>連線中，請稍候…</Text></View>;}
export const s=StyleSheet.create({
 scene:{flex:1,overflow:'hidden',backgroundColor:colors.ink},scroll:{flexGrow:1,paddingHorizontal:20,paddingVertical:36,justifyContent:'center',alignItems:'center'},
 panel:{width:'100%',maxWidth:460,backgroundColor:'rgba(42,23,48,.88)',borderColor:'rgba(255,255,255,.19)',borderWidth:1,borderRadius:28,padding:28,gap:20,boxShadow:'0 20px 70px rgba(0,0,0,.30)'},
 eyebrow:{color:colors.gold,letterSpacing:3,fontSize:12,textAlign:'center'},heading:{color:'#fff7fa',fontSize:30,lineHeight:40,fontWeight:'700',textAlign:'center'},body:{color:'#dfcddd',fontSize:15,lineHeight:24},label:{color:'#f1deee',fontSize:14,fontWeight:'600'},
 input:{color:'#fff',fontSize:16,padding:14,borderRadius:12,borderWidth:1,borderColor:'#876487',backgroundColor:'rgba(255,255,255,.05)',minHeight:50},
 button:{backgroundColor:colors.rose,borderRadius:14,minHeight:50,justifyContent:'center',paddingHorizontal:16,paddingVertical:13},buttonText:{fontWeight:'700',color:colors.ink,fontSize:16,textAlign:'center'},secondary:{backgroundColor:'transparent',borderWidth:1,borderColor:'#997499'},focus:{outlineColor:colors.gold,outlineWidth:3,outlineOffset:3},
 notice:{padding:14,borderRadius:12,backgroundColor:'rgba(255,210,122,.1)',borderWidth:1,borderColor:'#94754d'},noticeText:{color:'#ffe1ab',fontSize:14,lineHeight:23},footer:{fontSize:12,color:'#bea2be',textAlign:'center',lineHeight:20}
});
