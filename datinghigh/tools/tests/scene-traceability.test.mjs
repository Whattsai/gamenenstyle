import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditSceneTraceability,auditDevelopmentDocuments} from '../audit-story-traceability.mjs';

test('development documents keep one current progress section and reject old logs or false checks',()=>{
 const valid={tdd:'## 現行進度\n- [ ] **SEF-UT-001**\n## 規劃交接紀錄',bdd:'## 現行進度',verification:'| SEF-UT-001 | partial | evidence |'};
 assert.equal(auditDevelopmentDocuments(valid),true);
 assert.throws(()=>auditDevelopmentDocuments({...valid,tdd:valid.tdd+'\n## 2026-11-25 稽核紀錄'}),/禁止新增歷史流水帳/);
 assert.throws(()=>auditDevelopmentDocuments({...valid,bdd:valid.bdd+'\n## 現行進度'}),/必須只有一個現行進度/);
 assert.throws(()=>auditDevelopmentDocuments({...valid,tdd:valid.tdd.replace('[ ]','[x]')}),/勾選與核證不一致/);
});

test('current SceneEventFramework development documents satisfy the no-log policy',()=>{
 const read=relative=>readFileSync(new URL('../../docs/alldonejobs/'+relative,import.meta.url),'utf8');
 const input={tdd:read('tdd/SPEC-001-SceneEventFramework-TDD.md'),bdd:read('bdd/SPEC-001-SceneEventFramework-BDD.md'),spec:read('specs/SPEC-001-SceneEventFramework.md'),verification:read('verification/SPEC-001-SceneEventFramework-Verification.md')};
 assert.equal(auditDevelopmentDocuments(input),true);
 const report=auditSceneTraceability({...input,readSource:relative=>readFileSync(new URL('../../'+relative,import.meta.url),'utf8')});
 assert.equal(report.indexed,749);assert.equal(report.verified,749);assert.equal(report.complete,true);
});

test('a verified evidence link must resolve to an existing source line when the audit reads repository files',()=>{
 const input={tdd:'- [ ] **SEF-UT-001** `Example`',bdd:'',spec:'',expected:{UT:1},verification:'| SEF-UT-001 | verified | [實作](../../backend/src/Policy.cs:2)；[測試](../../backend/tests/PolicyTests.cs:3) |'};
 const files={'backend/src/Policy.cs':'first\nsecond','backend/tests/PolicyTests.cs':'one\ntwo\nthree'};
 assert.equal(auditSceneTraceability({...input,readSource:name=>files[name]}).verified,1);
 assert.throws(()=>auditSceneTraceability({...input,readSource:()=>undefined}),/Unresolved evidence line: SEF-UT-001/);
 assert.throws(()=>auditSceneTraceability({...input,readSource:name=>name.includes('tests')?'short':files[name]}),/Unresolved evidence line: SEF-UT-001/);
});

test('scene audit cannot inherit historical approvals or approve incomplete, duplicate or stale reviews',()=>{
 const source={tdd:'- [x] **SEF-UT-001** `Example`\n  - **驗證**：原 receipt 不重寫\n',bdd:'### SEF-BDD-001：例子\n',spec:'| SEF-AC-001 | 例子 |',verification:'歷史 SEF-UT-001 通過',expected:{UT:1,BDD:1,AC:1}};
 assert.throws(()=>auditSceneTraceability(source),/Missing review/);
 const row='| SEF-UT-001 | partial | SEF-BDD-001 | 待原 receipt 全斷言核證 |';
 const review={...source,verification:[row,'| SEF-BDD-001 | pending | 待逐項核證 |','| SEF-AC-001 | pending | 待逐項核證 |'].join('\n')};
 const result=auditSceneTraceability(review);assert.equal(result.indexed,3);assert.equal(result.verified,0);assert.equal(result.complete,false);
 assert.throws(()=>auditSceneTraceability({...review,verification:review.verification+'\n'+row}),/Duplicate review/);
 assert.throws(()=>auditSceneTraceability({...review,verification:review.verification.replace('partial','verified')}),/Missing implementation and test evidence/);
 assert.throws(()=>auditSceneTraceability({...review,tdd:source.tdd.replace('001','002')}),/Unknown review/);
});

test('V3 acceptance marks are indexed independently and cannot inherit an old AC approval',()=>{
 const input={tdd:'',bdd:'',spec:'| SEF-AC-001 | old |\n| `V3-AC-01` | new Rig |',expected:{AC:1,V3AC:1},verification:'| SEF-AC-001 | gate | original human gate |\n| V3-AC-01 | pending | no V3 proof |'};
 const result=auditSceneTraceability(input);assert.equal(result.indexed,2);assert.equal(result.counts.V3AC.pending,1);assert.equal(result.complete,false);
 assert.throws(()=>auditSceneTraceability({...input,verification:input.verification.split('\n')[0]}),/Missing review: V3-AC-01/);
});
