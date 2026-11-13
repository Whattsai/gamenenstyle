import {z} from 'zod';
import catalog from '../../contracts/builtin-avatar-packs.json';
import {expressionIds} from './avatar-expression-manifest';

const hash=z.string().regex(/^[0-9a-f]{64}$/),id=z.string().regex(/^(male|female)-0[1-8]$/);
const image=z.strictObject({url:z.string(),sha256:hash,mimeType:z.literal('image/webp'),width:z.number().int().min(600).max(4096),height:z.number().int().min(800).max(5462),byteSize:z.number().int().positive().max(2000000)});
const point=z.strictObject({x:z.number().min(0).max(1),y:z.number().min(0).max(1)});
const pack=z.strictObject({avatarAssetId:id,avatarVersion:hash,expressionSpecVersion:z.literal('v1'),avatarAssetSpecVersion:z.literal('full-body.v1'),framing:z.literal('full_body'),pose:z.literal('standing'),stageAnchors:z.strictObject({head:point,feet:point}),expressions:z.strictObject({neutral:image,smile:image,surprised:image,thoughtful:image,concerned:image})});
const parsed=z.strictObject({version:z.literal(1),packs:z.record(id,pack)}).parse(catalog);
export type BuiltinAvatarPack=z.infer<typeof pack>;
/** 只使用版控且已人工確認的正式套組；缺素材不改用舊半身圖。 */
export function builtinAvatarPack(id:string):BuiltinAvatarPack|undefined{
 const value=parsed.packs[id];if(!value)return;
 const neutral=value.expressions.neutral;
 if(value.avatarAssetId!==id||value.stageAnchors.head.y>=value.stageAnchors.feet.y||expressionIds.some(e=>{const i=value.expressions[e];return i.url!==`/avatars/full-body.v1/${id}/${i.sha256}.webp`||i.width!==neutral.width||i.height!==neutral.height||Math.abs(i.width/i.height-.75)>.015;}))throw new Error('INVALID_BUILTIN_AVATAR_PACK');
 return value;
}
