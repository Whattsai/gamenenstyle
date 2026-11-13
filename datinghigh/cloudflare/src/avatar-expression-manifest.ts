import {z} from 'zod';

/** 固定順序同時決定前景請求、產圖語意與劇本可用 ID；不可依玩家任意增刪。 */
export const expressionIds=['neutral','smile','surprised','thoughtful','concerned'] as const;
export type AvatarExpression=typeof expressionIds[number];
export const expressionSpecVersion='v1';
export const avatarAssetSpecVersion='full-body.v1';
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const sha=z.string().regex(/^[0-9a-f]{64}$/);
const point=z.strictObject({x:z.number().finite().min(0).max(1),y:z.number().finite().min(0).max(1)});
const image=z.strictObject({objectKey:z.string().max(256),sha256:sha,mimeType:z.literal('image/webp'),
 width:z.number().int().min(600).max(4096),height:z.number().int().min(800).max(5462),byteSize:z.number().int().positive().max(2000000),
 alphaMode:z.literal('straight'),framing:z.literal('full_body'),pose:z.literal('standing')});
const schema=z.strictObject({manifestSchemaVersion:z.literal(1),ownerAccountId:id,avatarAssetId:id,
 expressionSpecVersion:z.literal(expressionSpecVersion),avatarAssetSpecVersion:z.literal(avatarAssetSpecVersion),
 sourceImageSha256:sha,sourceAssetRef:id,status:z.literal('ready'),framing:z.literal('full_body'),pose:z.literal('standing'),
 stageAnchors:z.strictObject({head:point,feet:point}),masterAsset:image,
 expressions:z.strictObject({neutral:image,smile:image,surprised:image,thoughtful:image,concerned:image}),
 generatorModel:z.string().min(1).max(128),promptVersion:z.string().min(1).max(128),verifiedAt:z.number().int().positive()});
export type AvatarExpressionManifest=z.infer<typeof schema>;
export const avatarExpressionPrefix=(owner:string,asset:string)=>`private/${id.parse(owner)}/avatar/${id.parse(asset)}/expressions/${expressionSpecVersion}/${avatarAssetSpecVersion}/`;
export const avatarExpressionManifestKey=(owner:string,asset:string)=>avatarExpressionPrefix(owner,asset)+'manifest.json';

/** 結構、來源與版本的必要條件；像素／身份及人工畫質證據仍由產製與 Gate B 驗證。 */
export function validateAvatarExpressionManifest(value:unknown,owner:string,asset:string):AvatarExpressionManifest{
 const m=schema.parse(value),prefix=avatarExpressionPrefix(owner,asset),neutral=m.expressions.neutral;
 if(m.ownerAccountId!==owner||m.avatarAssetId!==asset||m.stageAnchors.head.y>=m.stageAnchors.feet.y||
  m.stageAnchors.head.y>.25||m.stageAnchors.feet.y<.85||
  JSON.stringify(m.masterAsset)!==JSON.stringify(neutral))throw new Error('INVALID_AVATAR_MANIFEST');
 for(const expression of expressionIds){const a=m.expressions[expression];
  if(a.objectKey!==prefix+expression+'.webp'||a.width!==neutral.width||a.height!==neutral.height||Math.abs(a.width/a.height-.75)>.015)
   throw new Error('INVALID_AVATAR_MANIFEST');
 }
 return m;
}
