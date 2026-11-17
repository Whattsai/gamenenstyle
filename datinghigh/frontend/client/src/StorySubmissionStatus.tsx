import React from 'react';
import {Text,View} from 'react-native';
import {s} from './ui';

export function StorySubmissionStatus({state}:{state?:'sending'|'committed'|'unknown'}){
 return state?<View style={{paddingHorizontal:10,paddingVertical:6,borderRadius:10,backgroundColor:'rgba(255,210,122,.14)',borderWidth:1,borderColor:'rgba(255,210,122,.4)'}}><Text style={s.subtleText}>{({sending:'送出中，尚未確認。',committed:'已送出，正在同步。',unknown:'送出結果不明，請重新同步。'})[state]}</Text></View>:null;
}
