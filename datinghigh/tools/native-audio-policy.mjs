/** QA31 dumpsys 只保留本 App 的 player/state/time，不輸出 URI、attributes 或系統原文。 */
export function parseNativeAudioPlayback(output,uid){
 if(!Number.isSafeInteger(uid)||uid<=0||uid>2147483647)throw Error('Invalid native audio UID');
 const lines=output.split(/\r?\n/),belongs=new RegExp(`\\b(?:uid/pid|u/pid|uid):\\s*${uid}(?:/|\\b)`);
 const playerId=line=>line.match(/\b(?:piid|ID):\s*(\d+)/)?.[1];
 const owned=new Set(lines.filter(line=>belongs.test(line)).map(playerId).filter(Boolean));
 const events=[],active=new Set();
 for(const line of lines){
  const id=playerId(line),state=line.match(/\bstate:\s*(started|paused|stopped|released)\b/)?.[1];
  if(!owned.has(id)||!state)continue;
  const at=line.match(/^\s*(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}:\d{3})/)?.[1];
  events.push({playerId:Number(id),state,...(at?{at}:{})});
  if(!at&&belongs.test(line)&&state==='started')active.add(Number(id));
 }
 return{activeStartedPlayerIds:[...active].sort((a,b)=>a-b),events};
}
