import {test} from 'node:test';import assert from 'node:assert/strict';
import {visible} from '../../tests/e2e/android/support.mjs';
test('native QA refuses inverted or clipped offscreen bounds instead of tapping reflected coordinates',()=>{
 assert.equal(visible({bounds:'[129,687][951,397]'}),false);
 for(const bounds of ['[0,0][0,0]','[10,-100][300,-20]','[300,50][10,100]',undefined])assert.equal(visible({bounds}),false);
 assert.equal(visible({bounds:'[129,687][951,900]'}),true);
 assert.equal(visible({bounds:'[86,259][634,264]'}),false);
 assert.equal(visible({bounds:'[86,1550][634,1700]'},{width:720,height:1516}),false);
 assert.equal(visible({bounds:'[86,1315][634,1402]'},{width:720,height:1516}),true);
});
