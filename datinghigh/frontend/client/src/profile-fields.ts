export type Gender='male'|'female'|'diverse';
export type CardVisibility=Record<string,boolean>;
export type ProfileField={key:string;label:string;type:'text'|'date'|'choice'|'multi'|'number'|'photos';order:number;storage:string;editor:string;shareable:boolean;defaultVisible?:boolean;cardKey:string;cardLabel?:string;maxLength?:number;limit?:number;options?:string;required?:boolean};
export const visibleOnCard=(field:ProfileField,settings:Record<string,boolean>)=>field.shareable&&(field.required||(settings[field.cardKey]??field.defaultVisible??false));
export function profilePayload(profile:Record<string,any>,fields:ProfileField[]){
 const values=Object.fromEntries(fields.filter(f=>f.type!=='photos').map(field=>{
  let value=profile[field.key]??(field.type==='multi'?[]:field.key==='sharedInterestWeight'?50:field.key==='nickname'||field.key==='bio'?'':null);
  if(Array.isArray(value))value=[...value].sort();
  if(['nickname','bio','occupation'].includes(field.key)&&typeof value==='string')value=value.trim()||(field.key==='occupation'?null:'');
  return [field.key,value];
 }));
 values.cardVisibility=Object.fromEntries(fields.filter(f=>f.shareable).map(f=>[f.cardKey,visibleOnCard(f,profile.cardVisibility??{})]));
 return values;
}
export const formSnapshot=(profile:Record<string,any>,fields:ProfileField[])=>JSON.stringify(profilePayload(profile,fields));
