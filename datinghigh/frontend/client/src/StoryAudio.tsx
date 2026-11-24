import React,{useEffect,useRef,useState} from 'react';
import {AppState,Platform,Text,View} from 'react-native';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {PrimaryButton,s} from './ui';

/** 只在本人點擊後播放原創環境音，背景與離場立即暫停。 */
export function StoryAudio({url,cueUrl,cueId,musicUrl,mix}:{url:string;cueUrl?:string;cueId?:string;musicUrl?:string;mix?:{ambienceGain:number;musicGain:number}}){
 const player=useAudioPlayer(url),cue=useAudioPlayer(cueUrl??null),music=useAudioPlayer(musicUrl??null),status=useAudioPlayerStatus(player),musicStatus=useAudioPlayerStatus(music),[enabled,setEnabled]=useState(false),[volume,setVolume]=useState(.3),[error,setError]=useState(false),lastCue=useRef(cueId),active=useRef(false);
 const gain=(value:number|undefined,fallback:number)=>Number.isFinite(value)?Math.max(0,Math.min(1,value!)):fallback;
 const rainTarget=volume*gain(mix?.ambienceGain,1),musicTarget=volume*gain(mix?.musicGain,0),gainTimer=useRef<ReturnType<typeof setInterval>|null>(null),lastGain=useRef<{volume:number;player:typeof player;music:typeof music}|null>(null);
 const seenCues=useRef(new Set(cueId?[cueId]:[])),cueGeneration=useRef(0);
 const currentCue=useRef(cue);currentCue.current=cue;
 const stop=()=>{active.current=false;cueGeneration.current++;if(gainTimer.current){clearInterval(gainTimer.current);gainTimer.current=null;}player.pause();currentCue.current.pause();music.pause();};
 const failed=()=>{stop();setEnabled(false);setError(true);};
 useEffect(()=>{
  cue.volume=volume;if(gainTimer.current)clearInterval(gainTimer.current);
  const previous=lastGain.current;lastGain.current={volume,player,music};
  if(!previous||previous.volume!==volume||previous.player!==player||previous.music!==music){player.volume=rainTarget;music.volume=musicTarget;return;}
  const rainStart=player.volume,musicStart=music.volume;let step=0;
  gainTimer.current=setInterval(()=>{const fraction=Math.min(1,++step/12);player.volume=rainStart+(rainTarget-rainStart)*fraction;music.volume=musicStart+(musicTarget-musicStart)*fraction;if(fraction===1&&gainTimer.current){clearInterval(gainTimer.current);gainTimer.current=null;}},30);
  return()=>{if(gainTimer.current){clearInterval(gainTimer.current);gainTimer.current=null;}};
 },[volume,rainTarget,musicTarget,player,music,cue]);
 useEffect(()=>{
  player.loop=true;music.loop=true;const suspend=()=>{stop();setEnabled(false);};
  const subscription=AppState.addEventListener('change',state=>{if(state!=='active')suspend();});
  // Some browsers keep a visible document active when its window loses focus.
  if(Platform.OS==='web')window.addEventListener('blur',suspend);
  return()=>{stop();subscription.remove();if(Platform.OS==='web')window.removeEventListener('blur',suspend);};
 },[player,music]);
 // 換事件音檔只清理舊 cue；不能把使用者已開啟的環境音與播放意圖一起清除。
 useEffect(()=>()=>{cueGeneration.current++;cue.pause();},[cue]);
 useEffect(()=>{if(status.error)failed();},[status.error]);
 useEffect(()=>{if(musicUrl&&musicStatus.error)failed();},[musicUrl,musicStatus.error]);
 useEffect(()=>{
  const changed=lastCue.current!==cueId;lastCue.current=cueId;const generation=++cueGeneration.current;
  const fresh=!!cueId&&!seenCues.current.has(cueId)&&seenCues.current.size<4096;if(cueId)seenCues.current.add(cueId);
  if(changed&&fresh&&enabled&&active.current&&cueUrl)void cue.seekTo(0).then(()=>{if(active.current&&generation===cueGeneration.current)cue.play();}).catch(()=>{if(active.current&&generation===cueGeneration.current)failed();});
 },[cueId,cueUrl,enabled,cue]);
 return <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:6}}>
  <PrimaryButton label={enabled?'靜音場景聲音':'開啟場景聲音'} secondary compact onPress={()=>{if(enabled){stop();setEnabled(false);}else try{player.volume=rainTarget;music.volume=musicTarget;player.play();if(musicUrl)music.play();active.current=true;setEnabled(true);setError(false);}catch{failed();}}}/>
  {enabled&&<><PrimaryButton label="降低音量" secondary compact disabled={volume<=.1} onPress={()=>setVolume(v=>Math.max(.1,Number((v-.1).toFixed(1))))}/><Text style={[s.footer,{minWidth:34}]}>{Math.round(volume*100)}%</Text><PrimaryButton label="提高音量" secondary compact disabled={volume>=1} onPress={()=>setVolume(v=>Math.min(1,Number((v+.1).toFixed(1))))}/></>}
  {(error||status.error)&&<Text style={s.subtleText}>聲音暫時無法播放，仍可繼續故事。</Text>}
 </View>;
}
