const origin=process.env.EXPO_PUBLIC_NATIVE_FAULT_ORIGIN;let offset=0;const realNow=performance.now.bind(performance);
// Test profile only: the production client still reads the normal OS monotonic clock.
Object.defineProperty(performance,'now',{configurable:true,value:()=>realNow()+offset});
let pending;
export function mode(){return pending??=(async()=>{const current=await(await fetch(`${origin}/_test/native-mode`,{cache:'no-store'})).json();if(Number.isSafeInteger(current.clockAdvance)&&current.clockAdvance>offset){offset=current.clockAdvance;await fetch(`${origin}/_test/native-clock`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({milliseconds:offset})});}return current;})().finally(()=>{pending=undefined;});}
setInterval(()=>{void mode().catch(()=>{});},1000);
