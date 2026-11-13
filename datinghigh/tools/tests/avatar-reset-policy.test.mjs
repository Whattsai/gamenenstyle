import{test}from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{avatarResetDevelopmentReady}from'../avatar-reset-policy.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../../contracts/builtin-avatar-packs.json',import.meta.url),'utf8'));
test('reset readiness requires pre-reset technical evidence without depending on the reset result or later Gate B',()=>{
 const cases=Array.from({length:36},(_,n)=>({id:`SD-UT-${String(51+n).padStart(3,'0')}`,status:n===10||n>=31?'partial':'verified'}));
 // 061的完整斷言包含實際reset，082及086包含後續Gate B；不能拿結果反過來阻止第一次reset。
 assert.equal(avatarResetDevelopmentReady(catalog,{cases}),true);
 for(const missing of ['SD-UT-051','SD-UT-055','SD-UT-063','SD-UT-080','SD-UT-081'])assert.equal(avatarResetDevelopmentReady(catalog,{cases:cases.map(c=>c.id===missing?{...c,status:'partial'}:c)}),false);
 assert.equal(avatarResetDevelopmentReady({...catalog,packs:{...catalog.packs,'female-08':undefined}},{cases}),false);
 assert.equal(avatarResetDevelopmentReady(catalog,{}),false);
});
