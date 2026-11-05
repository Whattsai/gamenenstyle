import {test} from 'node:test';import assert from 'node:assert/strict';
import {parseAvatarChecklist} from '../avatar-traceability-parser.mjs';
test('avatar traceability preserves full requirements across Windows and Unix line endings',()=>{
 const input=['# TDD','','- [ ] `AP-UT-001` **First**','  - **位置建議**：`tests/`','  - **來源**：`AP-BDD-001`','  - **前置／動作／預期**：先驗證，再保存；失敗不得寫入。','','- [x] `AP-IT-002` **Second**','  - **前置／操作**：真D1／R2','  - **預期斷言**：只有一筆成功。','','### 下一節','不可誤併入前一案例。',''].join('\n');
 const unix=parseAvatarChecklist(input),windows=parseAvatarChecklist(input.replaceAll('\n','\r\n'));
 assert.equal(windows.entries.length,2);assert.deepEqual(windows.entries.map(m=>m[0]),unix.entries.map(m=>m[0]));
 assert.match(windows.entries[0][0],/前置／動作／預期.*失敗不得寫入/);assert.match(windows.entries[1][0],/預期斷言.*只有一筆成功/);
 assert.doesNotMatch(windows.entries[1][0],/不可誤併/);assert.equal(windows.source.slice(0,windows.entries[1].index).split('\n').length,8);
});
