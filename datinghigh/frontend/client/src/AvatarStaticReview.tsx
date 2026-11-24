import React,{useState} from 'react';
import {Text,View} from 'react-native';
import {ActorMotionRenderer} from './ActorMotionRenderer';
import {StaticAvatarPreload} from './StaticAvatarPreload';
import {staticAvatarRig,type StaticAvatarProjection} from './static-avatar';
import {staticPoses,staticExpressions,type StaticPose,type StaticExpression} from '../../../contracts/static-avatar';
import {PrimaryButton,s} from './ui';
const poses:Record<StaticPose,string>={stand:'站立',sit:'坐姿',read:'閱讀',hold:'持書'},expressions:Record<StaticExpression,string>={neutral:'自然',smile:'微笑',surprised:'驚訝',thoughtful:'思考',concerned:'擔心'};
/** 私人成品只在本人前景檢視；完整解碼後提供明確採用，不自動代替本人核准外觀。 */
export function AvatarStaticReview({package:p,origin,headers,busy,onConfirm}:{package:StaticAvatarProjection;origin:string;headers?:Record<string,string>;busy:boolean;onConfirm:()=>void}){
 const [pose,setPose]=useState<StaticPose>('stand'),[expression,setExpression]=useState<StaticExpression>('neutral'),[decoded,setDecoded]=useState(false),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 return <View testID="avatar-static-review" style={{gap:10}}>
  <StaticAvatarPreload identity={`review:${p.packageVersion}:${retry}`} package={p} origin={origin} headers={headers} onReady={()=>setDecoded(true)} onError={()=>{setFailed(true);setDecoded(false);}}/>
  <Text style={s.body}>請核對四種姿態與五種表情的臉部、衣裝和手部。確認滿意後才會替換目前化身。</Text>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{staticPoses.map(id=><PrimaryButton key={id} compact secondary={pose!==id} label={`檢視${poses[id]}`} onPress={()=>setPose(id)}/>)}</View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:5}}>{staticExpressions.map(id=><PrimaryButton key={id} compact secondary={expression!==id} label={`檢視${expressions[id]}`} onPress={()=>setExpression(id)}/>)}</View>
  <View style={{alignItems:'center',backgroundColor:'#403844',borderRadius:12}}><ActorMotionRenderer key={`${p.packageVersion}:${retry}`} rig={staticAvatarRig(p,pose,expression,origin,headers)} pose={pose} expression={expression} gesture="idle" width={260} height={340} ambientMotion={false} onAssetError={()=>{setFailed(true);setDecoded(false);}}/></View>
  {failed?<><Text style={s.body}>成品圖片載入失敗，尚未採用。</Text><PrimaryButton label="重新載入成品檢視" secondary onPress={()=>{setFailed(false);setDecoded(false);setRetry(n=>n+1);}}/></>:!decoded&&<Text style={s.body}>正在載入完整成品…</Text>}
  <PrimaryButton label="確認採用完整靜態化身" disabled={busy||!decoded||failed} onPress={onConfirm}/>
 </View>;
}
