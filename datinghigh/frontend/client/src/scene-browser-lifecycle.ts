type BrowserEvents={addEventListener?:(type:'blur'|'focus',callback:()=>void)=>void;removeEventListener?:(type:'blur'|'focus',callback:()=>void)=>void};
/** React Native 可能提供 window 全域；只有完整的瀏覽器事件介面才註冊 DOM 生命週期。 */
export function listenSceneBrowserLifecycle(blur:()=>void,focus:()=>void=()=>{},surface:BrowserEvents|undefined=typeof window==='undefined'?undefined:window){
 if(typeof surface?.addEventListener!=='function'||typeof surface?.removeEventListener!=='function')return()=>{};
 surface.addEventListener('blur',blur);surface.addEventListener('focus',focus);
 return()=>{surface.removeEventListener!('blur',blur);surface.removeEventListener!('focus',focus);};
}
