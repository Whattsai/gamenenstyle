import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root} from '../../tools/local-policy.mjs';
import {localGameEndStatements} from '../../tools/local-game-policy.mjs';

// 真Wrangler CLI／Miniflare D1；只在本測試建立的全新named local instance執行。
test('local game CLI ends one room, preserves history, and a failed release rolls back the whole real CLI batch',()=>{
 const name=`game-end-cli-${process.pid}`,parent=path.resolve(root,'.local','instances'),directory=path.resolve(parent,name);
 assert.equal(path.dirname(directory),parent);assert.ok(!fs.existsSync(directory));fs.mkdirSync(directory,{recursive:true});
 const id=n=>`019a281e-0000-7000-8000-${String(n).padStart(12,'0')}`,now=Date.now();
 const run=(command,...args)=>execFileSync(process.execPath,['tools/local.mjs',command,'--instance',name,...args],{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
 const json=output=>JSON.parse(output.slice(output.indexOf('[\n'))).flatMap(r=>r.results??[]);
 const file=path.join(directory,'fixture.sql'),execute=sql=>{fs.writeFileSync(file,sql);return run('execute','--file',file);};
 const pair=(from,round)=>`INSERT INTO match_invitations(invitation_id,account_low_id,account_high_id,initiator_account_id,client_request_id,status,created_at,expires_at,updated_at) VALUES('${id(round+10)}','${id(from)}','${id(from+1)}','${id(from)}','${id(round+20)}','accepted',${now},${now+60000},${now});
 INSERT INTO game_rounds(round_id,invitation_id,account_low_id,account_high_id,status,started_at) VALUES('${id(round)}','${id(round+10)}','${id(from)}','${id(from+1)}','active',${now});
 INSERT INTO game_round_participants VALUES('${id(round+30)}','${id(from)}','${id(round)}',${now}),('${id(round+31)}','${id(from+1)}','${id(round)}',${now});`;
 try{
  fs.writeFileSync(path.join(directory,'wrangler.jsonc'),JSON.stringify({name:'datinghigh-game-end-cli-fixture',compatibility_date:'2026-10-24',d1_databases:[{binding:'DB',database_name:'datinghigh-game-end-cli-fixture',database_id:'00000000-0000-4000-8000-000000000991'}]}));
  const migrations=['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql'].map(n=>fs.readFileSync(path.join(root,'cloudflare','migrations',n),'utf8')).join('\n');
  let seed='';for(let n=1;n<=4;n++)seed+=`INSERT INTO auth_accounts(account_id,email_normalized,email_verified_at,status,credential_version,created_at,updated_at) VALUES('${id(n)}','local-game-${n}@example.invalid',${now},'active',1,${now},${now});
  INSERT INTO user_profiles(profile_id,account_id,nickname,created_at,updated_at) VALUES('${id(100+n)}','${id(n)}','測試玩家${n}',${now},${now});\n`;
  execute(migrations+'\n'+seed+pair(1,500)+pair(3,600));
  assert.equal(json(run('query','--view','games')).length,2);
  assert.throws(()=>run('game-end','--round-id',id(99999)));assert.equal(json(run('query','--view','games')).length,2);
  const ended=json(run('game-end','--round-id',id(500))).find(r=>r.round_id===id(500));assert.equal(ended.status,'ended');assert.equal(ended.active_participants,0);
  const replay=json(run('game-end','--round-id',id(500))).find(r=>r.round_id===id(500));assert.equal(replay.ended_at,ended.ended_at);
  const faulty=localGameEndStatements(id(600),Date.now()).map(sql=>sql.startsWith('DELETE FROM game_round_participants')?sql.replace('WHERE ','WHERE 0 AND '):sql);
  assert.throws(()=>execute(faulty.join(';\n')));
  const remaining=json(run('query','--view','games'));assert.equal(remaining.length,1);assert.equal(remaining[0].round_id,id(600));assert.equal(remaining[0].participants,2);
  run('game-end','--round-id',id(600));assert.equal(json(run('query','--view','games')).length,0);assert.equal(json(run('query','--view','accounts')).length,4);
 }finally{
  const resolved=fs.realpathSync(directory);assert.equal(path.dirname(resolved).toLowerCase(),fs.realpathSync(parent).toLowerCase());assert.equal(path.basename(resolved),name);
  fs.rmSync(resolved,{recursive:true,force:true});
 }
});
