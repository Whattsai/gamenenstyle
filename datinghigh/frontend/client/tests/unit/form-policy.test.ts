import {it,expect} from 'vitest';
import {validateForm,messageFor,maskEmail,OperationGate} from '../../src/forms';
it('PF-UT-085 invalid forms and password confirmation fail before network',()=>{
 expect(validateForm('register',{email:'x'})).toContain('Email');
 for(const email of ['a@b@c.com','a@例.jp','K@example.com','a@K.com','a..b@example.com',`${'a'.repeat(65)}@example.com`])expect(validateForm('register',{email})).toContain('Email');
 expect(validateForm('register',{email:' A.B+tag@Example.com '})).toBeNull();
 expect(validateForm('verify-email',{code:'000001',password:'a long password',confirm:'other'})).toBe('兩次密碼輸入不一致');
 expect(validateForm('verify-email',{code:'000001',password:'a long password',confirm:'a long password'})).toBeNull();
 for(const password of ['valid-password\uD800','valid-password\uDC00','valid-password\u0085'])expect(validateForm('verify-email',{code:'000001',password,confirm:password})).toContain('密碼');
});
it('PF-UT-086 uses explicit conflict and generic login messages',()=>{
 expect(messageFor('INVALID_CREDENTIALS')).toBe('Email 或密碼不正確');
 expect(messageFor('EMAIL_ALREADY_REGISTERED')).toContain('原有方式');
 expect(maskEmail('a.b@example.com')).toBe('a***@example.com');
});
it('PF-UT-091 cancelled and stale SDK results never reach HTTP',()=>{
 const gate=new OperationGate();const seq=gate.begin('session-a');expect(gate.current(seq,'session-a')).toBe(true);
 gate.cancel();expect(gate.current(seq,'session-a')).toBe(false);
 const next=gate.begin('session-b');expect(gate.current(next,'session-a')).toBe(false);
});
it('PF-UT-092 HTTP pending prevents duplicate SDK operations and account switches',()=>{
 const gate=new OperationGate();gate.begin('a');gate.http=true;
 expect(()=>gate.begin('b')).toThrow();expect(gate.cancel()).toBe(false);
});
