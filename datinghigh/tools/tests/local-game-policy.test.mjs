import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseLocalArgs,resolveInstance,invocation} from '../local-policy.mjs';
import {localGameEndStatements} from '../local-game-policy.mjs';
const id='019a281e-0000-7000-8000-000000009999';
test('local game maintenance requires one exact UUIDv7 and never accepts remote or arbitrary SQL',()=>{
 assert.deepEqual(parseLocalArgs('game-end',['--round-id',id]),{instance:'default','round-id':id});
 for(const args of [[],['--round-id',"x';DELETE FROM auth_accounts"],['--round-id',id,'--remote','true'],['--round-id',id,'--instance','production'],['--round-id',id,'--round-id',id]])assert.throws(()=>parseLocalArgs('game-end',args));
 const call=invocation('game-end',resolveInstance(),{'round-id':id,now:1800000000000});
 assert.ok(call.args.includes('--local'));assert.ok(!call.args.includes('--remote'));assert.equal(call.cwd,resolveInstance().cwd);
 assert.equal(call.args[call.args.indexOf('--command')+1],localGameEndStatements(id,1800000000000).join(';\n'));
});
test('local game list exposes only active room metadata, not authentication or media',()=>{
 const call=invocation('query',resolveInstance(),{view:'games'});const sql=call.args[call.args.indexOf('--command')+1];
 assert.match(sql,/game_rounds/);assert.match(sql,/status='active'/);assert.doesNotMatch(sql,/auth_sessions|token|password|user_media_assets/);
});
