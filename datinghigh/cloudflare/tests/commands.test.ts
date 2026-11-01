import { describe, it, expect } from 'vitest';
import { parseCommand, planCommand } from '../src/commands';
describe('fixed command boundary',()=>{
 it('PF-UT-067 rejects arbitrary SQL and extra privilege fields',()=>{
  expect(()=>parseCommand('sql.execute',{sql:'DROP TABLE auth_accounts'})).toThrow();
  expect(()=>parseCommand('session.revoke',{sessionId:'a',owner:'other'})).toThrow();
  expect(()=>parseCommand('session.revoke',{sessionId:'not-v7'})).toThrow();
 });
 it('PF-UT-056 rejects caller quotas and unsupported subject policy pairs',()=>{
  expect(()=>planCommand('rate-limit.consume',{entries:[{policyKey:'madeup',subjectType:'email',subjectHash:'0'.repeat(64),bucketId:'019a281e-0000-7000-8000-000000000001'}]},Date.now())).toThrow();
  expect(()=>parseCommand('rate-limit.consume',{entries:[],limit:10000})).toThrow();
 });
});
