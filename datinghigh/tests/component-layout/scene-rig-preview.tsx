import React,{useRef,useState} from 'react';
import {Image,Platform,Pressable,ScrollView,Text,View} from 'react-native';
import {ActorMotionRenderer,type ActorRigView} from '../../frontend/client/src/ActorMotionRenderer';
import {rigReviewCatalog} from './rig-review-catalog';
const expressions=['neutral','smile','surprised','thoughtful','concerned']as const,poses=['stand','sit','read','hold']as const;
const poseLabels={stand:'站立',sit:'坐姿',read:'閱讀',hold:'持書'},emotionLabels={neutral:'自然',smile:'微笑',surprised:'驚訝',thoughtful:'思考',concerned:'擔心'};
const origin=Platform.OS==='web'?'':'http://127.0.0.1:8092';
type Entry=typeof rigReviewCatalog[number];
export function reviewRig(entry:Entry,emotion:typeof expressions[number],selectedPose:typeof poses[number]='stand'):ActorRigView{
  const sheet=entry.sheets[poses.indexOf(selectedPose)],w=470*sheet.frames[0].width/sheet.frames[0].height;
  const fixes=entry.sheets.flatMap(s=>'corrections' in s?s.corrections:[]),expressionFixes='corrections' in sheet?sheet.corrections:[];
  return {version:'actor-rig.v1',identityVersion:`${entry.id}-review`,assets:[...entry.sheets,...fixes].map(s=>({id:s.id,url:`${origin}/__rig-review/${s.hash}.png`,width:s.width,height:s.height})),joints:[{id:'root',parentId:null,position:{x:.5,y:1}}],
   layers:[{id:'body',jointId:'root',assetId:sheet.id,region:sheet.frames[0],position:{x:(300-w)/600,y:.04},size:{width:w/300,height:.94},depth:1}],
   poses:poses.map(id=>({id,overrides:[]})),
   expressions:expressions.map((id,i)=>{const fix=expressionFixes.find(f=>f.expression===id);return {id,overrides:[{layerId:'body',assetId:fix?.id??sheet.id,region:fix?.region??sheet.frames[i]}]};}),propAnchors:[{id:'right-hand',jointId:'root',position:{x:.6,y:.5}}]};
}
const buttonStyle={padding:10,backgroundColor:'#392a42',borderRadius:6},white={color:'#fff1e7'};
/** 本機品質審查。素材仍未接正式角色 ready／採用入口。 */
export function SceneRigPreview(){
 const [selected,setSelected]=useState<string>(()=>{const id=Platform.OS==='web'&&typeof location!=='undefined'?new URLSearchParams(location.search).get('character'):null;return rigReviewCatalog.some(e=>e.id===id)?id!:'female-01';}),[pose,setPose]=useState<typeof poses[number]>(()=>Platform.OS==='web'&&typeof location!=='undefined'?poses.find(p=>p===new URLSearchParams(location.search).get('pose'))??'stand':'stand'),[emotion,setEmotion]=useState<typeof expressions[number]>(()=>Platform.OS==='web'&&typeof location!=='undefined'?expressions.find(e=>e===new URLSearchParams(location.search).get('expression'))??'neutral':'neutral'),[turn,setTurn]=useState(false);
 const single=Platform.OS==='web'&&typeof location!=='undefined'&&new URLSearchParams(location.search).has('single');
 const [overview,setOverview]=useState(!single&&Platform.OS==='web'&&typeof location!=='undefined'&&new URLSearchParams(location.search).has('all'));
 const [loadedOriginal,setLoadedOriginal]=useState(''),[loadedRig,setLoadedRig]=useState(''),[loadError,setLoadError]=useState('');
 const selectedRef=useRef(selected);selectedRef.current=selected;
 const loadedLayers=useRef(new Map<string,Set<string>>());
 const entry=rigReviewCatalog.find(c=>c.id===selected)!,rig=reviewRig(entry,emotion,pose);
 return <ScrollView removeClippedSubviews={false} style={{flex:1,backgroundColor:'#201b2a'}} contentContainerStyle={{padding:18,paddingTop:38,gap:12}}>
  <Text style={{fontSize:22,fontWeight:'700',...white}}>{single?`${selected} 頭頸修正審查`:'角色 Rig 整批品質審查'}</Text>
  <Text style={{color:'#d7c8d5'}}>{single?`本次只確認 ${selected}。五官與頭頸完整繪製，不再分開貼眼眉與嘴部；確認後再逐一處理其他角色。`:'16 款免費角色 · 4 種姿態 · 5 種表情。整批頭頸品質未通過，目前逐款調整。'}</Text>
  {!single&&Platform.OS==='web'&&<Pressable accessibilityRole="button" accessibilityLabel="batch-overview" onPress={()=>setOverview(v=>!v)} style={buttonStyle}><Text style={white}>{overview?'切回單款細看':'開啟整批總覽'}</Text></Pressable>}
  {!single&&<View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{rigReviewCatalog.map(c=><Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`select-${c.id}`} onPress={()=>{if(selected!==c.id){setLoadedOriginal('');setLoadedRig('');setLoadError('');loadedLayers.current.clear();}setSelected(c.id);setPose('stand');setEmotion('neutral');setTurn(false);setOverview(false);}} style={{...buttonStyle,backgroundColor:selected===c.id?'#a9678b':'#392a42'}}><Text style={white}>{c.id==='ai'?'AI 首輪':c.id}</Text></Pressable>)}</View>}
  {overview?<View testID="rig-batch" style={{gap:12}}>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{poses.map(id=><Pressable key={id} accessibilityRole="button" accessibilityLabel={`pose-${id}`} onPress={()=>setPose(id)} style={{...buttonStyle,backgroundColor:pose===id?'#a9678b':'#392a42'}}><Text style={white}>{poseLabels[id]}</Text></Pressable>)}{expressions.map(id=><Pressable key={id} accessibilityRole="button" accessibilityLabel={`expression-${id}`} onPress={()=>setEmotion(id)} style={{...buttonStyle,backgroundColor:emotion===id?'#a9678b':'#392a42'}}><Text style={white}>{emotionLabels[id]}</Text></Pressable>)}</View>
   <Text style={{color:'#d6c5d0'}}>全體同步：{poseLabels[pose]}／{emotionLabels[emotion]}。每格左為原圖，右為 Rig；點上方角色可放大細看。</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{rigReviewCatalog.map(c=><View key={c.id} style={{width:338,padding:8,gap:6,borderWidth:1,borderColor:'#73596c',borderRadius:8}}>
    <Text style={{fontWeight:'700',...white}}>{c.id==='ai'?'AI 首輪':c.id}</Text>
    <View style={{flexDirection:'row',gap:12,backgroundColor:'#443d49'}}>
     {c.source&&<View style={{width:120,height:300,overflow:'hidden'}}><Image source={{uri:origin+c.source}} resizeMode="contain" style={{position:'absolute',left:-52.5,width:225,height:300}}/></View>}
     <ActorMotionRenderer rig={reviewRig(c,emotion,pose)} pose={pose} expression={emotion} gesture="idle" width={180} height={300} ambientMotion={false}/>
    </View>
   </View>)}</View>
  </View>:<View key={selected} testID="rig-detail" style={{padding:12,borderWidth:1,borderColor:'#73596c',borderRadius:12,gap:10,backgroundColor:'#201b2a'}}>
   <Text style={{fontSize:18,fontWeight:'700',...white}}>{selected} · {poseLabels[pose]} · {emotionLabels[emotion]}</Text>
   <Text accessibilityLabel={`${loadError===selected?'review-error':loadedRig===selected&&(!entry.source||loadedOriginal===selected)?'review-ready':'review-loading'}-${selected}`} style={{color:'#d6c5d0',fontSize:12}}>{loadError===selected?'素材載入失敗，請重新整理。':loadedRig===selected&&(!entry.source||loadedOriginal===selected)?'素材載入完成':'素材載入中…'}</Text>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{poses.map(id=><Pressable key={id} accessibilityRole="button" accessibilityLabel={`pose-${id}`} onPress={()=>setPose(id)} style={{...buttonStyle,backgroundColor:pose===id?'#a9678b':'#392a42'}}><Text style={white}>{poseLabels[id]}</Text></Pressable>)}</View>
   <View style={{flexDirection:'row',flexWrap:'wrap',gap:6}}>{expressions.map(id=><Pressable key={id} accessibilityRole="button" accessibilityLabel={`expression-${id}`} onPress={()=>setEmotion(id)} style={{...buttonStyle,backgroundColor:emotion===id?'#a9678b':'#392a42'}}><Text style={white}>{emotionLabels[id]}</Text></Pressable>)}</View>
   <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:18}}>
    {entry.source&&<View style={{alignItems:'center',gap:6}}><Text style={{color:'#d6c5d0'}}>原角色對照</Text><View style={{width:Platform.OS==='web'?260:125,height:Platform.OS==='web'?500:300,overflow:'hidden',backgroundColor:'#443d49'}}><Image key={entry.source} source={{uri:`${origin}/__rig-original/${entry.source.split('/').pop()}`}} onLoad={()=>{if(selectedRef.current===selected)setLoadedOriginal(selected);}} onError={event=>{if(selectedRef.current===selected){setLoadError(selected);console.warn('Controlled Rig original image error',selected,event.nativeEvent.error);}}} resizeMode="contain" style={{position:'absolute',left:Platform.OS==='web'?-57.5:-50,width:Platform.OS==='web'?375:225,height:Platform.OS==='web'?500:300}}/></View></View>}
    <View style={{alignItems:'center',gap:6}}><Text style={{color:'#d6c5d0'}}>{'mode' in entry&&entry.mode==='complete-frames'?'完整姿態／表情審查':'Rig 分層預覽'}</Text><View style={{backgroundColor:'#443d49',borderRadius:8}}><ActorMotionRenderer key={selected} rig={rig} pose={pose} expression={emotion} gesture={turn?'turn':'idle'} width={Platform.OS==='web'?300:180} height={Platform.OS==='web'?500:300} ambientMotion={false} onAssetLoad={(id,layer)=>{if(id!==`${selectedRef.current}-review`)return;const seen=loadedLayers.current.get(id)??new Set<string>();seen.add(layer);loadedLayers.current.set(id,seen);if(seen.has('body')&&('mode' in entry&&entry.mode==='complete-frames'||seen.has('face')))setLoadedRig(selectedRef.current);}} onAssetError={id=>{if(id===`${selectedRef.current}-review`)setLoadError(selectedRef.current);}}/></View></View>
   </View>
   {!('mode' in entry&&entry.mode==='complete-frames')&&<Pressable accessibilityRole="button" accessibilityLabel="rig-turn" onPress={()=>setTurn(v=>!v)} style={buttonStyle}><Text style={white}>轉頭／還原</Text></Pressable>}
   {single&&<View testID="neck-zoom" style={{alignItems:'center',gap:6}}><Text style={{color:'#ffe6d3',fontWeight:'700'}}>五官／頭頸放大檢查</Text><View style={{width:340,height:340,overflow:'hidden',backgroundColor:'#443d49'}}><View style={{position:'absolute',left:-130,top:-45}}><ActorMotionRenderer rig={rig} pose={pose} expression={emotion} gesture="idle" width={600} height={1000} ambientMotion={false}/></View></View></View>}
   <Text style={{color:'#d6c5d0',fontSize:12}}>請核對五官、身份、頭頸接點、衣裝、坐姿與手部。{'mode' in entry&&entry.mode==='complete-frames'?`${selected} 此版為完整圖格品質審查，尚非分層動作成品。`:''}本頁為本機素材審查；未標記正式 ready，也不代表 V3 劇情或 Gate B 通過。</Text>
  </View>}
 </ScrollView>;
}
