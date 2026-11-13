import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const catalog=JSON.parse(fs.readFileSync(new URL('../../contracts/builtin-avatar-packs.json',import.meta.url),'utf8'));
// 測試共用正式虛構角色，不另存來源照或測試圖片副本。
export function builtinAvatarPath(id){
 const image=catalog.packs[id]?.expressions.neutral;
 if(!image||image.url!==`/avatars/full-body.v1/${id}/${image.sha256}.webp`)throw new Error('Unknown builtin avatar');
 return fileURLToPath(new URL('../../frontend/client/public'+image.url,import.meta.url));
}
