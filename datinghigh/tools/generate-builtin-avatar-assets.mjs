import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'contracts/builtin-avatar-packs.json'),'utf8'));
const ids=['male','female'].flatMap(g=>Array.from({length:8},(_,n)=>`${g}-0${n+1}`));
const imports=[],entries=[];
for(const [index,id] of ids.entries()){
 const neutral=catalog.packs[id]?.expressions?.neutral;
 if(!neutral||neutral.url!==`/avatars/full-body.v1/${id}/${neutral.sha256}.webp`||createHash('sha256').update(fs.readFileSync(path.join(root,'frontend/client/public',neutral.url))).digest('hex')!==neutral.sha256)throw Error(`INVALID_BUILTIN_MASTER: ${id}`);
 imports.push(`import avatar${index} from '../public${neutral.url}';`);
 entries.push(` '${id}':avatar${index}`);
}
fs.writeFileSync(path.join(root,'frontend/client/src/avatar-assets.ts'),`// 由 tools/generate-builtin-avatar-assets.mjs 依正式套組產生；Web／原生共用同一份圖片。\nimport type {ImageSourcePropType} from 'react-native';\n${imports.join('\n')}\nexport const avatarAssets:Record<string,ImageSourcePropType>={\n${entries.join(',\n')}\n};\n`);
console.log(JSON.stringify({status:'full-body-selection-generated',avatars:ids.length}));
