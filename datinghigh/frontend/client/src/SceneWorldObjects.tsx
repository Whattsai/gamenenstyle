import React,{useRef} from 'react';
import {Animated,PanResponder,Pressable,Text,View} from 'react-native';
import type {ActorRole,SceneWorldObject} from './scene-event-track';
type Rect={x:number;y:number;width:number;height:number};
export const isInsideDropZone=(point:{x:number;y:number},slot:Rect|undefined)=>!!slot&&point.x>=slot.x&&point.x<=slot.x+slot.width&&point.y>=slot.y&&point.y<=slot.y+slot.height;

/** 正式受控物件圖形：紙單、書袋、書本、封套與標籤由共用向量形狀組成，不冒充角色動作圖。 */
export function ObjectArt({object}:{object:SceneWorldObject}){
 const color=object.color??'#e8d9bb',kind=object.rendererId;
 if(kind==='bag')return <View style={{width:64,height:76,alignItems:'center'}}><View style={{width:32,height:26,borderWidth:5,borderColor:'#c3a179',borderRadius:14,marginBottom:-6}}/><View style={{width:62,height:54,backgroundColor:color,borderRadius:8,borderWidth:2,borderColor:'#9c7856',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 12px rgba(0,0,0,.3)'}}><Text style={{color:'#59422d',fontWeight:'800',fontSize:19}}>27</Text></View></View>;
 if(kind==='book')return <View style={{width:52,height:72,backgroundColor:color,borderRadius:4,borderLeftWidth:7,borderColor:'#d3bd9d',borderRightWidth:2,boxShadow:'4px 6px 10px rgba(0,0,0,.35)',padding:5,justifyContent:'center'}}><View style={{height:2,backgroundColor:'#e7d9b6',marginBottom:5}}/><Text numberOfLines={3} style={{color:'#fff3d8',fontSize:10,fontWeight:'800',textAlign:'center'}}>{object.label.match(/《([^》]+)》/)?.[1]??object.label.split('・')[0]}</Text><View style={{height:2,backgroundColor:'#e7d9b6',marginTop:5}}/></View>;
 if(kind==='sleeve')return <View style={{width:70,height:57,borderRadius:3,backgroundColor:color,borderWidth:2,borderColor:'#355d45',boxShadow:'0 4px 10px rgba(0,0,0,.3)'}}><View style={{width:46,height:37,borderWidth:1,borderColor:'#c2d5bc',transform:[{rotate:'7deg'}],alignSelf:'center',marginTop:7}}/></View>;
 if(kind==='tag')return <View style={{width:49,height:61,borderRadius:7,backgroundColor:color,borderWidth:1,borderColor:'#ad8a5f',alignItems:'center',paddingTop:5,transform:[{rotate:'-9deg'}],boxShadow:'0 4px 10px rgba(0,0,0,.3)'}}><View style={{width:7,height:7,borderRadius:5,backgroundColor:'#795f46'}}/><Text style={{fontSize:24,fontWeight:'800',color:'#60452e',marginTop:5}}>27</Text></View>;
 return <View style={{width:66,height:75,backgroundColor:color,borderRadius:3,borderWidth:1,borderColor:'#b5a28c',padding:7,transform:[{rotate:'-5deg'}],boxShadow:'0 5px 10px rgba(0,0,0,.3)'}}><Text style={{fontSize:17,fontWeight:'800',color:'#604d45'}}>27</Text>{[36,41,29].map((width,i)=><View key={i} style={{width,height:2,backgroundColor:'#8b8179',opacity:.35,marginTop:7}}/>)}</View>;
}
function DraggableObject({object,left,top,held,preview,selected,disabled,onInspect,onDrop,slot}:{object:SceneWorldObject;left:number;top:number;held:boolean;preview:boolean;selected:boolean;disabled:boolean;onInspect:(id:string)=>void;onDrop:(id:string)=>void;slot:React.RefObject<React.ComponentRef<typeof View>|null>}){
 const drag=useRef(new Animated.ValueXY()).current,dragging=useRef(false),latest=useRef({onDrop,disabled});latest.current={onDrop,disabled};
 const responder=useRef(PanResponder.create({onMoveShouldSetPanResponder:(_,g)=>!latest.current.disabled&&(Math.abs(g.dx)+Math.abs(g.dy)>10),onPanResponderGrant:()=>{dragging.current=true;},onPanResponderMove:(_,g)=>drag.setValue({x:g.dx,y:g.dy}),onPanResponderRelease:(_,g)=>{
  // PanResponder 會在 release callback 返回後重設同一個 gesture 物件；先保存落點，再等原生量測。
  const point={x:g.moveX,y:g.moveY};
  slot.current?.measureInWindow((x,y,width,height)=>{if(!latest.current.disabled&&isInsideDropZone(point,{x,y,width,height}))latest.current.onDrop(object.id);});
  Animated.spring(drag,{toValue:{x:0,y:0},useNativeDriver:false}).start();setTimeout(()=>{dragging.current=false;},0);
 },onPanResponderTerminate:()=>{dragging.current=false;drag.setValue({x:0,y:0});}})).current;
 return <Animated.View {...responder.panHandlers} onTouchStart={event=>event.stopPropagation()} onTouchMove={event=>event.stopPropagation()} onTouchEnd={event=>event.stopPropagation()} style={{position:'absolute',left,top,transform:drag.getTranslateTransform(),zIndex:held||preview?12:8}}>
  <Pressable accessibilityRole="button" accessibilityLabel={`${preview?'候選預覽':held?'你拿著':'場景物件'}：${object.label}`} disabled={disabled} onPress={()=>{if(!dragging.current)onInspect(object.id);}} style={({pressed})=>({alignItems:'center',padding:6,borderRadius:12,borderWidth:1.5,borderColor:selected?'#ffd27a':'rgba(255,218,170,.55)',backgroundColor:pressed?'rgba(255,210,122,.3)':'rgba(19,10,27,.26)'})}>
   <ObjectArt object={object}/><Text numberOfLines={2} style={{color:'#fff5df',fontSize:10,fontWeight:'700',maxWidth:96,textAlign:'center',backgroundColor:'rgba(18,8,26,.82)',borderRadius:5,paddingHorizontal:4,paddingVertical:2,marginTop:4}}>{preview?'候選預覽：':held?'拿著：':''}{object.label}</Text>
  </Pressable>
 </Animated.View>;
}
export function SceneWorldObjects({objects,areaId,actorRole,frame,onInspect,onDrop,selectedObject,disabled=false,showSlot=false}:{objects:SceneWorldObject[];areaId:string;actorRole:ActorRole;frame:{left:number;top:number;width:number;height:number};onInspect:(id:string)=>void;onDrop:(id:string)=>void;selectedObject?:string|null;disabled?:boolean;showSlot?:boolean}){
 const slot=useRef<React.ComponentRef<typeof View>|null>(null);let inventory=0;
 return <View pointerEvents="box-none" style={{position:'absolute',left:0,right:0,top:0,bottom:0}} testID="scene-world-objects">
  {showSlot&&<View ref={slot} testID="scene-drop-slot" accessibilityLabel="櫃檯放置區" style={{position:'absolute',left:frame.left+frame.width*.7,top:frame.top+frame.height*.38,width:100,height:90,borderWidth:2,borderStyle:'dashed',borderColor:'#ffd27a',backgroundColor:'rgba(255,210,122,.12)',borderRadius:12,alignItems:'center',justifyContent:'center',zIndex:7}}><Text style={{fontSize:11,color:'#ffe7b5'}}>放在這裡</Text></View>}
  {objects.filter(o=>o.holderRole===actorRole||!o.holderRole&&(o.areaId===areaId||o.id===selectedObject&&!!o.previewPlacement)).map(o=>{const held=o.holderRole===actorRole,preview=!held&&o.areaId!==areaId&&o.id===selectedObject&&!!o.previewPlacement,index=held||preview?inventory++:0;return <DraggableObject key={o.id} object={o} held={held} preview={preview} selected={selectedObject===o.id} disabled={disabled} left={held||preview?18+index*92:frame.left+frame.width*o.x-36} top={held||preview?128:frame.top+frame.height*o.y-38} slot={slot} onInspect={onInspect} onDrop={onDrop}/>;})}
 </View>;
}
