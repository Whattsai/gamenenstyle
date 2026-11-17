import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateStoryUpgradeTarget,oldGamePurgeStatements} from '../story-content-policy.mjs';
test('SD-UT-042: purge policy only accepts known local DatingHigh instance and only three old game tables',()=>{
 const config={name:'datinghigh-local',vars:{APP_ENV:'local'},d1_databases:[{binding:'DB',database_name:'datinghigh-local',database_id:'local-foundation'}]};
 assert.doesNotThrow(()=>validateStoryUpgradeTarget(config));
 for(const env of ['production','staging','unknown'])assert.throws(()=>validateStoryUpgradeTarget({...config,vars:{APP_ENV:env}}));
 assert.throws(()=>validateStoryUpgradeTarget({...config,d1_databases:[{binding:'DB',database_name:'another-project'}]}));
 const sql=oldGamePurgeStatements().join(';');assert.doesNotMatch(sql,/DELETE FROM (auth_|user_)/);assert.match(sql,/game_round_participants/);
});
