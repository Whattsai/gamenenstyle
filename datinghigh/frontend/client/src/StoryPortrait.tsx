import React,{useEffect,useRef,useState} from 'react';
import {Image,Pressable,Text,View,type ImageSourcePropType} from 'react-native';

export type Expression='neutral'|'smile'|'surprised'|'thoughtful'|'concerned';
const expressions:Expression[]=['neutral','smile','surprised','thoughtful','concerned'];
export type StagePortrait={name:string;version?:string;source?:ImageSourcePropType;sources?:Record<Expression,ImageSourcePropType>;expression?:Expression;anchors?:{head:{x:number;y:number};feet:{x:number;y:number}}};
const identity=(p?:StagePortrait)=>p?.version??(typeof p?.source==='number'?String(p.source):p?.source&&'uri' in p.source?p.source.uri??'':p?.name??'');
/** 新角色先解碼並等句尾；同版重繪不重新預載，授權移除立即清除私人畫面。 */
export function StoryPortrait({portrait,safeToSwap}:{portrait?:StagePortrait;safeToSwap:boolean}){
 const key=identity(portrait),wanted=useRef(key),[shown,setShown]=useState(portrait),[queued,setQueued]=useState<{key:string;portrait:StagePortrait}|undefined>(),[ready,setReady]=useState<string[]>([]),[failed,setFailed]=useState(false);
 const decodedPack=useRef<string|undefined>(undefined);
 useEffect(()=>{
  wanted.current=key;
  if(!portrait?.source){decodedPack.current=undefined;setShown(undefined);setQueued(undefined);setReady([]);setFailed(false);return;}
  if(identity(shown)!==key||portrait.sources&&decodedPack.current!==key){setQueued({key,portrait});setReady([]);setFailed(false);}
 },[key,!!portrait]);
 useEffect(()=>{if(queued&&ready.length===(queued.portrait.sources?5:1)&&queued.key===key&&safeToSwap){decodedPack.current=key;setShown(queued.portrait);setQueued(undefined);setReady([]);}},[ready,queued,safeToSwap,key]);
 if(!portrait?.source)return null;
 const packs=shown?.source?[{key:identity(shown),portrait:shown}]:[];
 if(queued&&!packs.some(p=>p.key===queued.key))packs.push(queued);
 return <View style={{position:'absolute',left:0,top:0,width:'100%',height:'100%'}}>
  {packs.flatMap(pack=>(pack.portrait.sources?expressions.map(expression=>({expression,source:pack.portrait.sources![expression]})):[{expression:'single',source:pack.portrait.source!}]).map(p=>{
   const visible=pack.key===identity(shown)&&(p.expression==='single'||p.expression===(decodedPack.current===pack.key?portrait.expression??'neutral':'neutral')),loading=queued?.key===pack.key;
   return <Image key={`${pack.key}/${p.expression}`} source={p.source} resizeMode="contain" accessibilityLabel={visible?`${pack.portrait.name}的遊戲立繪`:loading?(p.expression==='single'?'正在載入新角色':`正在載入新角色・${p.expression}`):undefined} onLoad={()=>{if(loading&&wanted.current===pack.key)setReady(values=>values.includes(p.expression)?values:[...values,p.expression]);}} onError={()=>{if(loading&&wanted.current===pack.key){setQueued(undefined);setReady([]);setFailed(true);}}} style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',opacity:visible?1:0}}/>;
  }))}
  {failed&&<Pressable accessibilityRole="button" accessibilityLabel="重新載入角色" onPress={()=>{setQueued({key,portrait});setReady([]);setFailed(false);}} style={{position:'absolute',bottom:0,alignSelf:'center',padding:10,backgroundColor:'#34223c'}}><Text style={{color:'#fbe7ec'}}>重新載入角色</Text></Pressable>}
 </View>;
}
