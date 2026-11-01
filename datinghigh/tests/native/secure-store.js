import * as real from'expo-secure-store';export * from'expo-secure-store';
import{mode}from'./clock';
const origin=process.env.EXPO_PUBLIC_NATIVE_FAULT_ORIGIN;
async function report(operation,key,value,persisted){const fields=value?Object.keys(JSON.parse(value)):[];await fetch(`${origin}/_test/native-metrics`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation,key,fields,persisted})});}
export async function getItemAsync(key,options){return real.getItemAsync(key,options);}
export async function setItemAsync(key,value,options){if(key==='datinghigh.refresh'){const settings=await mode();if(settings.denyWrites){await report('set',key,value,false);throw new Error('Controlled SecureStore write failure');}if(settings.delayWritesMs>0){await report('begin',key,value,false);await new Promise(resolve=>setTimeout(resolve,settings.delayWritesMs));}}await real.setItemAsync(key,value,options);await report('set',key,value,true);}
export async function deleteItemAsync(key,options){await real.deleteItemAsync(key,options);await report('remove',key,undefined,true);}
