import{test}from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import{execFileSync}from'node:child_process';
import{root}from'../../tools/local-policy.mjs';

test('avatar reset local wrapper previews exact persisted D1/R2 while refusing apply before full development readiness',{timeout:120000},()=>{
 const name=`avatar-reset-cli-${process.pid}`,parent=path.resolve(root,'.local/instances'),directory=path.resolve(parent,name),planFile=path.resolve(root,'.local/avatar-reset',name+'.json');
 assert.equal(path.dirname(directory),parent);assert.ok(!fs.existsSync(directory));assert.ok(!fs.existsSync(planFile));fs.mkdirSync(directory,{recursive:true});
 const owner='019a281e-0000-7000-8000-000000000001',asset='019a281e-0000-7000-8000-000000000021',now=Date.now(),file=path.join(directory,'fixture.sql');
 const run=(command,...args)=>execFileSync(process.execPath,['tools/local.mjs',command,'--instance',name,...args],{cwd:root,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
 try{
  fs.writeFileSync(path.join(directory,'wrangler.jsonc'),JSON.stringify({name:'datinghigh-local-reset-cli',compatibility_date:'2026-10-24',vars:{APP_ENV:'local'},d1_databases:[{binding:'DB',database_name:'datinghigh-local',database_id:'local-foundation'}],r2_buckets:[{binding:'FILES',bucket_name:'datinghigh-local-private'}]}));
  const migrations=['0001_foundation.sql','0002_avatar_preferences.sql','0003_profile_gender_card_visibility.sql','0004_matching_sessions.sql','0005_story_dialogue_exit.sql'].map(n=>fs.readFileSync(path.join(root,'cloudflare/migrations',n),'utf8')).join('\n');
  fs.writeFileSync(file,migrations+`\nCREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT);INSERT INTO d1_migrations(name)VALUES('0005_story_dialogue_exit.sql');INSERT INTO auth_accounts VALUES('${owner}','reset-cli@example.test',${now},NULL,'active',1,${now},${now});INSERT INTO user_profiles(profile_id,account_id,selected_avatar_type,selected_avatar_ref,created_at,updated_at)VALUES('019a281e-0000-7000-8000-000000000010','${owner}','generated','${asset}',${now},${now});INSERT INTO user_media_assets VALUES('${asset}','${owner}','generated_avatar','private/${owner}/avatar/${asset}','image/jpeg',NULL,'ready',${now},NULL);`);run('execute','--file',file);
  const image=path.join(directory,'fixture-avatar.bin');fs.writeFileSync(image,new Uint8Array([1,2,3]));
  execFileSync(process.execPath,[path.join(root,'cloudflare/node_modules/wrangler/bin/wrangler.js'),'r2','object','put',`datinghigh-local-private/private/${owner}/avatar/${asset}`,'--local','--config',path.join(directory,'wrangler.jsonc'),'--file',image],{cwd:directory,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
  run('avatar-reset-preview','--name',name,'--accounts',owner);const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));assert.equal(plan.profiles.length,1);assert.equal(plan.objects.length,1);assert.equal(plan.objects[0].key,`private/${owner}/avatar/${asset}`);assert.equal(plan.status,'preview');
  assert.throws(()=>run('avatar-reset-apply','--name',name),error=>String(error.stderr).includes('AVATAR_RESET_NOT_READY'));
  assert.throws(()=>run('avatar-reset-preview','--name',name,'--accounts',owner));assert.equal(JSON.parse(fs.readFileSync(planFile,'utf8')).fingerprint,plan.fingerprint);
 }finally{
  const resolved=fs.realpathSync(directory);assert.equal(path.dirname(resolved).toLowerCase(),fs.realpathSync(parent).toLowerCase());assert.equal(path.basename(resolved),name);fs.rmSync(resolved,{recursive:true,force:true});
  assert.equal(path.dirname(planFile),path.resolve(root,'.local/avatar-reset'));if(fs.existsSync(planFile))fs.unlinkSync(planFile);
 }
});
