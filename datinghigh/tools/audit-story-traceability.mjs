import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Read-only: the verification document owns reviews. A checked planning item or
// a runner/test-name match must never grant an approval, including old v1 evidence.
export function auditSceneTraceability({tdd,bdd,spec,verification,readSource,expected={UT:366,IT:129,API:53,ET:77,BDD:121,AC:24}}){
 const sources=[...tdd.matchAll(/^- \[[ x]\] \*\*(SEF-(UT|IT|API|ET)-\d{3})\*\*/gm)].map(m=>m[1]);
 sources.push(...[...bdd.matchAll(/^#{2,4} (SEF-BDD-\d{3})：/gm)].map(m=>m[1]));
 sources.push(...[...spec.matchAll(/^\| (SEF-AC-\d{3}) \|/gm)].map(m=>m[1]));
 if(new Set(sources).size!==sources.length)throw Error('Duplicate planning ID');
 for(const [layer,count]of Object.entries(expected))if(sources.filter(id=>id.startsWith(`SEF-${layer}-`)).length!==count)throw Error('Unexpected planning count: '+layer);
 const reviews=new Map();
 for(const match of verification.matchAll(/^\| (SEF-(?:UT|IT|API|ET|BDD|AC)-\d{3}) \| (verified|partial|pending|gate) \|([^\n]*)/gm)){
  const[id,status,detail]=match.slice(1);if(reviews.has(id))throw Error('Duplicate review: '+id);if(!sources.includes(id))throw Error('Unknown review: '+id);
  if(status==='verified'&&(!/\]\(\.\.\/\.\.\/(?:backend\/src|cloudflare\/src|frontend\/client\/src|tools)\/[^)]+:\d+\)/.test(detail)||!/\]\(\.\.\/\.\.\/(?:backend\/tests|cloudflare\/tests|frontend\/client\/tests|tests|tools\/tests)\/[^)]+:\d+\)/.test(detail)))throw Error('Missing implementation and test evidence: '+id);
  if(status==='verified'&&readSource)for(const link of detail.matchAll(/\]\(\.\.\/\.\.\/([^):]+):(\d+)\)/g)){
   let source;try{source=readSource(link[1]);}catch{}
   const line=Number(link[2]);if(typeof source!=='string'||line<1||line>source.trimEnd().split(/\r?\n/).length)throw Error('Unresolved evidence line: '+id);
  }
  reviews.set(id,status);
 }
 for(const id of sources)if(!reviews.has(id))throw Error('Missing review: '+id);
 const counts=Object.fromEntries(Object.keys(expected).map(layer=>{const ids=sources.filter(id=>id.startsWith(`SEF-${layer}-`));return[layer,{total:ids.length,verified:ids.filter(id=>reviews.get(id)==='verified').length,partial:ids.filter(id=>reviews.get(id)==='partial').length,pending:ids.filter(id=>reviews.get(id)==='pending').length,gate:ids.filter(id=>reviews.get(id)==='gate').length}];}));
 return{indexed:reviews.size,verified:[...reviews.values()].filter(v=>v==='verified').length,complete:[...reviews.values()].every(v=>v==='verified'),counts};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=fileURLToPath(new URL('../',import.meta.url)),read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const report=auditSceneTraceability({tdd:read('docs/tdd/SPEC-001-SceneEventFramework-TDD.md'),bdd:read('docs/bdd/SPEC-001-SceneEventFramework-BDD.md'),spec:read('docs/specs/SPEC-001-SceneEventFramework.md'),verification:read('docs/verification/SPEC-001-SceneEventFramework-Verification.md'),readSource:read});
 console.log(JSON.stringify(report,null,2));
}
