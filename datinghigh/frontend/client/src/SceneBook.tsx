import React,{useEffect,useRef,useState} from 'react';
import {Animated,Image,Pressable,ScrollView,Text,View} from 'react-native';
import type {StageFrame,StageSize} from './scene-stage';
export type PublishedBook={id:string;objectId:string;title:string;category:string;summary:string;pages:string[]};
/** 同舞台中的書本展開；只保留本地頁碼，選書／分享另走已授權事件。 */
export function SceneBook({book,coverSource,frame,viewport,onClose,onMediaError}:{book:PublishedBook;coverSource?:string;frame:StageFrame;viewport:StageSize;onClose:()=>void;onMediaError?:()=>void}){
 const [page,setPage]=useState(0),width=Math.min(650,viewport.width-24),height=Math.min(400,viewport.height-20);
 const left=Math.max(12,Math.min(viewport.width-width-12,frame.left+frame.width/2-width/2)),top=Math.max(10,Math.min(viewport.height-height-10,frame.top+frame.height/2-height/2));
 const open=useRef(new Animated.Value(0)).current,turn=useRef(new Animated.Value(1)).current;
 const [closing,setClosing]=useState(false);
 useEffect(()=>{const animation=Animated.timing(open,{toValue:1,duration:220,useNativeDriver:false});animation.start();return()=>{animation.stop();turn.stopAnimation();};},[open,turn]);
 const close=()=>{if(closing)return;setClosing(true);Animated.timing(open,{toValue:0,duration:180,useNativeDriver:false}).start(({finished})=>{if(finished)onClose();});};
 const flip=(delta:number)=>{setPage(n=>n+delta);turn.setValue(0);Animated.timing(turn,{toValue:1,duration:180,useNativeDriver:false}).start();};
 const button=(label:string,action:()=>void,disabled=false)=><Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled||closing} onPress={action} style={{padding:9,opacity:disabled||closing?.4:1,borderWidth:1,borderColor:'#8b6c4c',borderRadius:5}}><Text style={{color:'#523d32',fontSize:12}}>{label}</Text></Pressable>;
 return <Animated.View testID="scene-open-book" onTouchStart={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} style={{position:'absolute',left,top,width,height,zIndex:120,transform:[{translateX:open.interpolate({inputRange:[0,1],outputRange:[frame.left+frame.width/2-left-width/2,0]})},{translateY:open.interpolate({inputRange:[0,1],outputRange:[frame.top+frame.height/2-top-height/2,0]})},{scaleX:open.interpolate({inputRange:[0,1],outputRange:[frame.width/width,1]})},{scaleY:open.interpolate({inputRange:[0,1],outputRange:[frame.height/height,1]})}],backgroundColor:'#f5e9ce',borderRadius:7,borderWidth:2,borderColor:'#72513d',padding:14,gap:9,boxShadow:'0 8px 30px rgba(0,0,0,.5)'}}>
  <View style={{flex:1,flexDirection:'row',borderWidth:1,borderColor:'#c9b68f',borderRadius:3,backgroundColor:'#fff6dd'}}>
   <View style={{width:'34%',padding:12,gap:8,borderRightWidth:5,borderColor:'#c4ac80',backgroundColor:'#eee1bf'}}>
    {coverSource&&<Image pointerEvents="none" source={{uri:coverSource}} onError={onMediaError} resizeMode="contain" style={{height:'48%',width:'100%'}}/>}
    <Text style={{fontSize:13,fontWeight:'700',color:'#503b30'}}>《{book.title}》</Text><Text style={{fontSize:10,color:'#76634d'}}>{book.category} · 心動迴路原創試讀</Text>
    <ScrollView style={{flex:1}}><Text style={{color:'#6e5b45',fontSize:11,lineHeight:17}}>{book.summary}</Text></ScrollView>
   </View>
   <Animated.View style={{flex:1,padding:16,transform:[{perspective:900},{rotateY:turn.interpolate({inputRange:[0,1],outputRange:['-16deg','0deg']})}]}}><ScrollView style={{flex:1}}><Text style={{color:'#3d3028',fontSize:15,lineHeight:25}}>{book.pages[page]}</Text></ScrollView><Text style={{textAlign:'center',fontSize:11,color:'#8c7854',paddingTop:8}}>{page+1}</Text></Animated.View>
  </View>
  <View style={{flexDirection:'row',gap:8,alignItems:'center',flexWrap:'wrap'}}>{button('上一頁',()=>flip(-1),page===0)}<Text style={{color:'#6e5b45'}}>{page+1} / {book.pages.length}</Text>{button('下一頁',()=>flip(1),page===book.pages.length-1)}{button(`合上《${book.title}》`,close)}</View>
 </Animated.View>;
}
