import{useEffect,useRef,type RefObject}from'react';
import{BackHandler,Platform}from'react-native';

// Keep an in-flight transaction on screen when Android's system back would close the activity.
export function usePendingBackGuard(pending:RefObject<boolean>,busy:boolean){
 const busyRef=useRef(busy);busyRef.current=busy;
 useEffect(()=>{
  if(Platform.OS!=='android')return;
  const subscription=BackHandler.addEventListener('hardwareBackPress',()=>pending.current||busyRef.current);
  return()=>subscription.remove();
 },[pending]);
}
