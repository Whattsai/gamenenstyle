import type {TrackBinding,TrackContent} from './scene-event-track-content';
type Role='inviter'|'acceptor';
const roles:Role[]=['inviter','acceptor'];
const key=(b:TrackBinding)=>`${b.scope}:${b.sourceId}:${b.bindingId}`;
const invalid=(reason='graph'):never=>{throw Error('INVALID_STORY_CONTENT',{cause:reason});};
type Fact={actionId:string;optionId?:string};
type Instance={status:'active'|'completed'|'cancelled';sub:Partial<Record<Role,Record<string,Fact>>>};
type State={progress:Record<Role,{node:string;area:string}>;entered:Record<Role,string[]>;objects:Record<string,string>;flags:Record<string,string>;instances:Record<string,Instance>};

/** 有界狀態圖：保留角色／選項／世界的相關事實，逐一核對可達分支都有收尾路徑。
 * 可選無效果觀察不進圖；相同狀態的回訪合併，因此不把 unlock 當 entered，也不把 not 當 true。
 */
export function validateTrackReachability(c:TrackContent,all:TrackBinding[]){
 const n=c.narrative,s=c.scene,referenced=new Set<string>(),groupCount=new Map<string,number>();
 const scan=(v:any)=>{if(!v||typeof v!=='object')return;for(const [op,a]of Object.entries(v)as[string,any][]){if(op==='shared_event_completed')referenced.add(a);if(op==='track_event_completed'||op==='track_choice_committed')referenced.add(a.bindingKey);scan(a);}};
 scan(n);scan(s.sceneEventBindings);scan(c.pool);
 for(const b of all){const group=b.trackScope+':'+b.repeatGroup;groupCount.set(group,(groupCount.get(group)??0)+1);}
 const bindings=all.filter(b=>c.eventDefinitions.find(d=>d.reference.key===b.definition.key)!.manifest.moduleType==='move-area'||b.requiredForEnding||referenced.has(key(b))||b.startEffects.length||b.completionEffects.length||b.actions.some(a=>a.nextNode||a.worldEffects.length)||b.transitions.inviterNextNode||b.transitions.acceptorNextNode||(groupCount.get(b.trackScope+':'+b.repeatGroup)??0)>1);
 const byKey=new Map(all.map(b=>[key(b),b]));
 const initial:State={progress:Object.fromEntries(roles.map(r=>{const t=n.tracks[r],node=t.nodes.find(v=>v.id===t.entry)!;return[r,{node:node.id,area:node.areaId}];}))as State['progress'],entered:{inviter:[n.tracks.inviter.entry],acceptor:[n.tracks.acceptor.entry]},objects:Object.fromEntries(s.sceneObjects.map(o=>[o.id,o.initialState])),flags:Object.fromEntries(s.sharedFlags.map(f=>[f.id,f.initialValue])),instances:{}};
 const objectState=(st:State,id:string)=>s.sceneObjects.find(o=>o.id===id)!.states.find(v=>v.id===st.objects[id])!;
 function test(st:State,v:any):boolean{const [op,a]=Object.entries(v)[0]as[string,any];
  if(op==='all')return a.every((v:any)=>test(st,v));if(op==='any')return a.some((v:any)=>test(st,v));if(op==='not')return !test(st,a);
  if(op==='actor_area_is')return st.progress[a.role as Role].area===a.areaId;
  if(op==='track_node_entered')return st.entered[a.role as Role].includes(a.nodeId);
  if(op==='track_event_completed')return st.instances[a.bindingKey]?.status==='completed';
  if(op==='shared_event_completed')return st.instances[a]?.status==='completed';
  if(op==='track_choice_committed')return Object.values(st.instances[a.bindingKey]?.sub[a.role as Role]??{}).some(f=>f.actionId===a.actionId&&f.optionId===a.optionId);
  if(op==='world_object_state')return st.objects[a.objectId]===a.state;
  if(op==='shared_flag_equals')return st.flags[a.key]===a.value;
  // 已完成主線是該內容的外部解鎖事實，只有宣告的先決主線可依賴。
  if(op==='narrative_completed')return n.prerequisites.includes(a);
  return false;
 }
 function effects(st:State,list:TrackBinding['completionEffects'],actor?:Role):boolean{for(const e of list){if(e.type==='flag')st.flags[e.flagId]=e.value;else{const prior=objectState(st,e.objectId);if(st.objects[e.objectId]!==e.from||actor&&prior.holder&&prior.holder!==actor)return false;st.objects[e.objectId]=e.to;}}return true;}
 const requiredGroups=new Set(bindings.filter(b=>b.requiredForEnding).map(b=>b.trackScope+':'+b.repeatGroup));
 const eligible=(st:State,b:TrackBinding)=>(b.requiredForEnding||!requiredGroups.has(b.trackScope+':'+b.repeatGroup))&&!Object.entries(st.instances).some(([k])=>byKey.get(k)?.trackScope===b.trackScope&&byKey.get(k)?.repeatGroup===b.repeatGroup)&&test(st,b.triggerConditions);
 const enter=(st:State,r:Role,id:string)=>{st.progress[r].node=id;if(!st.entered[r].includes(id)){st.entered[r].push(id);st.entered[r].sort();}};
 const signature=(st:State)=>JSON.stringify([st.progress.inviter,st.progress.acceptor,st.entered.inviter,st.entered.acceptor,Object.values(st.objects),Object.values(st.flags),bindings.map(b=>{const i=st.instances[key(b)];return i?[i.status,...roles.map(r=>Object.entries(i.sub[r]??{}).sort(([a],[b])=>a<b?-1:a>b?1:0))]:null;})]);
 const states:State[]=[initial],indices=new Map([[signature(initial),0]]),reverse:number[][]=[[]],ends:number[]=[],seenEndings=new Set<string>(),seenNodes={inviter:new Set<string>(),acceptor:new Set<string>()};
 function connect(next:State,from:number){const value=signature(next);let index=indices.get(value);if(index===undefined){if(states.length>=50000)invalid('state-limit');index=states.length;indices.set(value,index);states.push(next);reverse.push([]);}reverse[index].push(from);}
 for(let cursor=0;cursor<states.length;cursor++){
  const st=states[cursor];for(const r of roles)for(const id of st.entered[r])seenNodes[r].add(id);
  if(n.endingRequires.every(k=>st.instances[k]?.status==='completed')){const matches=n.endings.filter(e=>test(st,e.conditions));if(matches.length!==1)invalid();ends.push(cursor);seenEndings.add(matches[0].id);continue;}
  for(const b of bindings){const k=key(b),prior=st.instances[k];if(prior?.status==='completed'||prior?.status==='cancelled'||!prior&&!eligible(st,b))continue;
   if(!prior&&b.selectionMode==='weighted_random'&&b.probability<1){const next=structuredClone(st);next.instances[k]={status:'cancelled',sub:{}};connect(next,cursor);if(b.probability===0)continue;}
   for(const a of b.actions){const r=a.role,step=a.stepId??a.actionId;if(b.completionMode!=='repeatable'&&prior?.sub[r]?.[step])continue;
    const next=structuredClone(st);if(!prior&&!effects(next,b.startEffects))continue;if(!test(next,a.conditions))continue;
    const me=next.progress[r];
    if(b.definition&&byKey.has(k)){
     const module=c.eventDefinitions.find(d=>d.reference.key===b.definition.key)!.manifest.moduleType;
     if(module==='move-area'){if(!s.areas.find(area=>area.id===me.area)!.adjacent.includes(a.params.areaId))continue;me.area=a.params.areaId;}
     if(module==='inspect-object'||module==='manipulate-object'){
      const obj=objectState(next,a.params.objectId);if(obj.holder?obj.holder!==r:obj.areaId!==me.area)continue;
      if(module==='manipulate-object'&&(a.actionId==='pick'&&obj.holder!==null||a.actionId==='place'&&(obj.holder!==r||!s.slots.some(slot=>slot.id===a.params.targetSlotId&&slot.areaId===me.area&&slot.acceptedObjects.includes(a.params.objectId)))))continue;
     }
     if(module==='talk-to-npc'&&!s.npcs.some(npc=>npc.id===a.params.npcId&&npc.areaId===me.area&&npc.dialogueOptions.includes(a.params.dialogueOptionId)))continue;
    }
    if(!effects(next,a.worldEffects,r))continue;if(a.nextNode)enter(next,r,a.nextNode);
    const instance:Instance=next.instances[k]??{status:'active',sub:{}};instance.sub[r]??={};instance.sub[r]![step]={actionId:a.actionId,...(a.params.optionId?{optionId:a.params.optionId}:{})};next.instances[k]=instance;
    if(b.completionMode!=='repeatable'&&b.requiredActions.every(req=>instance.sub[req.role]?.[req.stepId??req.actionId]?.actionId===req.actionId)){
     instance.status='completed';if(!effects(next,b.completionEffects))continue;
     for(const role of roles){const target=b.transitions[role==='inviter'?'inviterNextNode':'acceptorNextNode'];if(target)enter(next,role,target);}
    }
    if(b.completionMode==='repeatable'&&!referenced.has(k)&&(groupCount.get(b.trackScope+':'+b.repeatGroup)??0)===1)delete next.instances[k];
    connect(next,cursor);
   }
  }
 }
 // 由所有自然結尾反向走訪，任何可達狀態都必須仍能收尾；任意錯分支不能永久封死。
 const reachesEnd=new Set(ends),queue=[...ends];for(let i=0;i<queue.length;i++)for(const parent of reverse[queue[i]])if(!reachesEnd.has(parent)){reachesEnd.add(parent);queue.push(parent);}
 if(reachesEnd.size!==states.length||n.endings.some(e=>!seenEndings.has(e.id))||roles.some(r=>n.tracks[r].nodes.some(node=>!seenNodes[r].has(node.id))))invalid(JSON.stringify({states:states.length,ends:ends.length,reachesEnd:reachesEnd.size,unseen:roles.flatMap(r=>n.tracks[r].nodes.filter(node=>!seenNodes[r].has(node.id)).map(n=>n.id))}));
}
