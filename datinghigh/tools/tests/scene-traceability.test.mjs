import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditSceneTraceability} from '../audit-story-traceability.mjs';

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
