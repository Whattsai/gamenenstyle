import fs from 'node:fs';import{execFileSync}from'node:child_process';import{tap,nodes,invoke}from'./fixture.mjs';import{root}from'../../../scripts/local-policy.mjs';
// Only a fixed query is written; the Google email stays in memory and is never logged.
export function verifiedEmail(){
 const sql=`SELECT a.email_normalized AS email FROM auth_accounts a JOIN auth_external_identities i ON i.account_id=a.account_id AND i.provider='google' AND i.created_at=a.created_at WHERE a.password_hash IS NULL AND EXISTS (SELECT 1 FROM auth_sessions w WHERE w.account_id=a.account_id AND w.client_platform='web' AND w.created_at=a.created_at) AND EXISTS (SELECT 1 FROM auth_sessions n WHERE n.account_id=a.account_id AND n.client_platform='android' AND n.created_at>a.created_at);\n`;
 const file=`${root}/.local/real-google-email-query.sql`;fs.writeFileSync(file,sql);try{const out=execFileSync(process.execPath,[`${root}/scripts/local.mjs`,'execute','--file',file],{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe'],timeout:90000});const start=out.lastIndexOf('\n[');if(start<0)throw new Error();const result=JSON.parse(out.slice(start+1)),rows=result[0]?.results;if(!Array.isArray(rows)||rows.length!==1||typeof rows[0].email!=='string')throw new Error();return rows[0].email;}catch{throw new Error('Cannot identify one verified local Google account for the isolated test');}
}
export function clients(){const web=fs.readFileSync(`${root}/apps/client/.env.local`,'utf8').match(/^EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID\s*=\s*["']?([^"'\s]+)["']?\s*$/m)?.[1],android=fs.readFileSync(`${root}/cloudflare/.dev.vars`,'utf8').match(/^GOOGLE_ANDROID_ALLOWED_CLIENTS\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim();if(!web||!android||!web.endsWith('.apps.googleusercontent.com'))throw new Error('Real Google public clients are not configured');return{web,android};}
export async function automaticGoogle(email,target){
 await tap('Sign in with Google');let selected=false,confirmed=false,last=[],prior='';
 const history=[],start=Date.now(),end=start+120000,normalized=email.toLowerCase();
 const matches=n=>[n.text,n['content-desc']].some(value=>value?.toLowerCase().includes(normalized));
 const exact=n=>[n.text,n['content-desc']].some(value=>value?.toLowerCase()===normalized);
 const proceed=n=>[n.text,n['content-desc']].some(value=>value&&/^(Continue(?: as\b|$)|繼續)/.test(value));
 while(Date.now()<end){
  const all=nodes();last=all;
  const phase={packages:[...new Set(all.map(n=>n.package))],accountVisible:all.some(matches),continueVisible:all.some(proceed),cancelled:all.some(n=>n.text==='已取消 Google 登入')};
  const signature=JSON.stringify(phase);if(signature!==prior&&history.length<30){history.push({elapsedMs:Date.now()-start,...phase});prior=signature;}
  if(all.some(n=>n.text===target||n['content-desc']===target))return;
  let item;
  if(!selected){
   const candidates=all.filter(n=>n.package==='com.google.android.gms'&&matches(n)&&n.bounds!=='[0,0][0,0]');
   item=candidates.find(exact)??candidates.find(n=>n.clickable==='true')??candidates[0];
   if(item){
    selected=true;
    if(process.env.DATINGHIGH_GOOGLE_DIAGNOSTICS==='1')fs.writeFileSync(`${root}/.local/evidence/google-selection-metadata.json`,JSON.stringify({chosenIndex:all.indexOf(item),nodes:all.map((n,index)=>({index,package:n.package,id:n['resource-id'],class:n.class,bounds:n.bounds,clickable:n.clickable,accountMatch:matches(n),exactAccount:exact(n),continueControl:proceed(n)}))},null,2));
   }
  }
  if(!item&&selected&&!confirmed){item=all.find(n=>n.package==='com.google.android.gms'&&proceed(n));if(item)confirmed=true;}
  if(item){const[x1,y1,x2,y2]=item.bounds.match(/\d+/g).map(Number);invoke('shell','input','tap',String(Math.round((x1+x2)/2)),String(Math.round((y1+y2)/2)));await new Promise(r=>setTimeout(r,1500));}
  else await new Promise(r=>setTimeout(r,500));
 }
 throw Object.assign(new Error('Real Google account selection did not complete'),{ui:{selected,confirmed,history,packages:[...new Set(last.map(n=>n.package))],controls:last.filter(n=>n.clickable==='true').map(n=>({id:n['resource-id'],class:n.class})),cancelled:last.some(n=>n.text==='已取消 Google 登入')}});
}
