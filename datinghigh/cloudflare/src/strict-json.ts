// 先保留每一個屬性的資訊，避免 JSON.parse 靜默覆蓋重複權限欄位。
export function parseStrictJson(text:string):unknown{
 let index=0;const whitespace=()=>{while(/[\x20\t\r\n]/.test(text[index]??'!'))index++;};
 const fail=():never=>{throw new SyntaxError('INVALID_JSON');};
 function string():string{
  const start=index++;let escaped=false;
  while(index<text.length){const c=text[index++];if(!escaped&&c==='"')return JSON.parse(text.slice(start,index));if(!escaped&&c==='\\')escaped=true;else escaped=false;}return fail();
 }
 function value(depth:number):unknown{
  whitespace();if(depth>8)return fail();const c=text[index];
  if(c==='"')return string();
  if(c==='{'){
   index++;whitespace();const result:Record<string,unknown>=Object.create(null),keys=new Set<string>();if(text[index]==='}'){index++;return result;}
   for(;;){whitespace();if(text[index]!=='"')return fail();const key=string();if(keys.has(key))return fail();keys.add(key);whitespace();if(text[index++]!==':')return fail();result[key]=value(depth+1);whitespace();const next=text[index++];if(next==='}')return result;if(next!==',')return fail();}
  }
  if(c==='['){index++;whitespace();const result:unknown[]=[];if(text[index]===']'){index++;return result;}for(;;){result.push(value(depth+1));whitespace();const next=text[index++];if(next===']')return result;if(next!==',')return fail();}}
  const token=text.slice(index).match(/^(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/)?.[0];if(!token)return fail();index+=token.length;return JSON.parse(token);
 }
 const result=value(0);whitespace();if(index!==text.length)return fail();return result;
}

