import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Read-only: the verification document owns reviews. A checked planning item or
// a runner/test-name match must never grant an approval, including old v1 evidence.
export function auditSceneTraceability({tdd,bdd,spec,verification,readSource,expected={UT:359,IT:126,API:53,ET:72,BDD:118,AC:21,V3AC:0}}){
 const sources=[...tdd.matchAll(/^- \[[ x]\] \*\*(SEF-(UT|IT|API|ET)-\d{3})\*\*/gm)].map(m=>m[1]);
 sources.push(...[...bdd.matchAll(/^#{2,4} (SEF-BDD-\d{3})：/gm)].map(m=>m[1]));
 sources.push(...[...spec.matchAll(/^\| (SEF-AC-\d{3}) \|/gm)].map(m=>m[1]));
 sources.push(...[...spec.matchAll(/^\| `(V3-AC-\d{2})` \|/gm)].map(m=>m[1]));
 const prefix=layer=>layer==='V3AC'?'V3-AC-':`SEF-${layer}-`;
 if(new Set(sources).size!==sources.length)throw Error('Duplicate planning ID');
 for(const [layer,count]of Object.entries(expected))if(sources.filter(id=>id.startsWith(prefix(layer))).length!==count)throw Error('Unexpected planning count: '+layer);
 const reviews=new Map();
 for(const match of verification.matchAll(/^\| ((?:SEF-(?:UT|IT|API|ET|BDD|AC)-\d{3})|(?:V3-AC-\d{2})) \| (verified|partial|pending|gate) \|([^\n]*)/gm)){
  const[id,status,detail]=match.slice(1);if(reviews.has(id))throw Error('Duplicate review: '+id);if(!sources.includes(id))throw Error('Unknown review: '+id);
  if(status==='verified'&&(!/\]\(\.\.\/\.\.\/(?:\.\.\/)?(?:backend\/src|cloudflare\/src|frontend\/client\/src|tools)\/[^)]+:\d+\)/.test(detail)||!/\]\(\.\.\/\.\.\/(?:\.\.\/)?(?:backend\/tests|cloudflare\/tests|frontend\/client\/tests|tests|tools\/tests)\/[^)]+:\d+\)/.test(detail)))throw Error('Missing implementation and test evidence: '+id);
  if(status==='verified'&&readSource)for(const link of detail.matchAll(/\]\(\.\.\/\.\.\/(?:\.\.\/)?([^):]+):(\d+)\)/g)){
   let source;try{source=readSource(link[1]);}catch{}
   const line=Number(link[2]);if(typeof source!=='string'||line<1||line>source.trimEnd().split(/\r?\n/).length)throw Error('Unresolved evidence line: '+id);
  }
  reviews.set(id,status);
 }
 for(const id of sources)if(!reviews.has(id))throw Error('Missing review: '+id);
 const counts=Object.fromEntries(Object.keys(expected).map(layer=>{const ids=sources.filter(id=>id.startsWith(prefix(layer)));return[layer,{total:ids.length,verified:ids.filter(id=>reviews.get(id)==='verified').length,partial:ids.filter(id=>reviews.get(id)==='partial').length,pending:ids.filter(id=>reviews.get(id)==='pending').length,gate:ids.filter(id=>reviews.get(id)==='gate').length}];}));
 return{indexed:reviews.size,verified:[...reviews.values()].filter(v=>v==='verified').length,complete:[...reviews.values()].every(v=>v==='verified'),counts};
}
// 現行開發清單只保留一份進度及交接；歷史證據應在 Verification。
export function auditDevelopmentDocuments({tdd,bdd,verification}){
 for(const [name,doc] of Object.entries({tdd,bdd})){
  const headings=doc.split(/\r?\n/).filter(line=>/^#{1,6}\s/.test(line));
  if(headings.filter(line=>/^## 現行進度\s*$/.test(line)).length!==1)throw Error(name+': 必須只有一個現行進度');
  if(headings.filter(line=>/^## 規劃交接紀錄\s*$/.test(line)).length!==(name==='tdd'?1:0))throw Error(name+': 交接章節數量不符');
  if(headings.some(line=>/每日進度|進度流水帳|歷史進度|歷史交接|執行流水帳|歷史稽核|舊交接|(?:20\d{2}[-/]\d{1,2}[-/]\d{1,2}).*(?:進度|交接|稽核|驗證紀錄)/.test(line)))throw Error(name+': 禁止新增歷史流水帳章節');
 }
 const reviews=new Map([...verification.matchAll(/^\| (SEF-(?:UT|IT|API|ET)-\d{3}) \| (verified|partial|pending|gate) \|/gm)].map(m=>[m[1],m[2]]));
 for(const m of tdd.matchAll(/^- \[([ x])\] \*\*(SEF-(?:UT|IT|API|ET)-\d{3})\*\*/gm)){
  if(!reviews.has(m[2])||(m[1]==='x')!==(reviews.get(m[2])==='verified'))throw Error('TDD 勾選與核證不一致：'+m[2]);
 }
 return true;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../',import.meta.url)),read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const report=auditSceneTraceability({tdd:read('docs/alldonejobs/tdd/SPEC-001-SceneEventFramework-TDD.md'),bdd:read('docs/alldonejobs/bdd/SPEC-001-SceneEventFramework-BDD.md'),spec:read('docs/alldonejobs/specs/SPEC-001-SceneEventFramework.md'),verification:read('docs/alldonejobs/verification/SPEC-001-SceneEventFramework-Verification.md'),readSource:read});
 auditDevelopmentDocuments({tdd:read('docs/alldonejobs/tdd/SPEC-001-SceneEventFramework-TDD.md'),bdd:read('docs/alldonejobs/bdd/SPEC-001-SceneEventFramework-BDD.md'),verification:read('docs/alldonejobs/verification/SPEC-001-SceneEventFramework-Verification.md')});
 console.log(JSON.stringify(report,null,2));
}
