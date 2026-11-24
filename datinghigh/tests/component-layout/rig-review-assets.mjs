import path from 'node:path';
import {readFileSync} from 'node:fs';
/** 已正式採用的免費成品只有 public 一份；虛構 AI 審查素材仍是本機白名單。 */
export function rigReviewAssets(root,catalog){
 const formal=JSON.parse(readFileSync(path.join(root,'contracts/builtin-static-poses.json'),'utf8'));
 return catalog.flatMap(entry=>entry.sheets.flatMap(sheet=>[sheet,...sheet.corrections??[]]).map(asset=>{
  const approved=formal.packs[entry.id]?.assets.find(a=>a.sha256===asset.hash);
  return {hash:asset.hash,file:approved?path.join(root,'frontend/client/public/avatars/static-poses.v1',entry.id,asset.hash+'.png'):path.join(root,'.local/rig-pilot',asset.file)};
 }));
}
