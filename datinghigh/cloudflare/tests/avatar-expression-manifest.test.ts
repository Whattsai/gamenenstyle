import {it,expect} from 'vitest';
import {validateAvatarExpressionManifest,expressionIds} from '../src/avatar-expression-manifest';

const owner='019a281e-0000-7000-8000-000000000001',asset='019a281e-0000-7000-8000-000000000002';
const picture=(name:string)=>({objectKey:`private/${owner}/avatar/${asset}/expressions/v1/full-body.v1/${name}.webp`,sha256:'a'.repeat(64),mimeType:'image/webp',width:768,height:1024,byteSize:190000,alphaMode:'straight',framing:'full_body',pose:'standing'});
const manifest=()=>({manifestSchemaVersion:1,ownerAccountId:owner,avatarAssetId:asset,expressionSpecVersion:'v1',avatarAssetSpecVersion:'full-body.v1',sourceImageSha256:'b'.repeat(64),sourceAssetRef:'019a281e-0000-7000-8000-000000000003',status:'ready',framing:'full_body',pose:'standing',stageAnchors:{head:{x:.5,y:.08},feet:{x:.5,y:.96}},masterAsset:picture('neutral'),expressions:Object.fromEntries(['neutral','smile','surprised','thoughtful','concerned'].map(n=>[n,picture(n)])),generatorModel:'gemini-3.1-flash-image',promptVersion:'full-body.v1',verifiedAt:1800000000000});

it('SD-UT-059: ready requires the exact five fixed expressions, source identity, version and full-body geometry',()=>{
 expect(expressionIds).toEqual(['neutral','smile','surprised','thoughtful','concerned']);
 expect(validateAvatarExpressionManifest(manifest(),owner,asset).status).toBe('ready');
 for(const change of [
  (m:any)=>delete m.expressions.concerned,(m:any)=>m.expressions.angry=picture('angry'),
  (m:any)=>m.status='building',(m:any)=>m.avatarAssetSpecVersion='half-body.v1',
  (m:any)=>m.sourceImageSha256='',(m:any)=>m.expressions.smile.objectKey=picture('neutral').objectKey,
  (m:any)=>m.expressions.smile.width=200,(m:any)=>m.expressions.smile.alphaMode='opaque',
  (m:any)=>m.masterAsset.pose='sitting',(m:any)=>m.stageAnchors.feet.y=.01,
  (m:any)=>m.expressions.smile.height=1025,(m:any)=>m.ownerAccountId=asset,
  (m:any)=>m.expressions.smile.objectKey=`private/${asset}/avatar/${asset}/smile.webp`,
  (m:any)=>m.extra='untrusted'
 ]){const m=manifest();change(m);expect(()=>validateAvatarExpressionManifest(m,owner,asset)).toThrow();}
 expect(()=>validateAvatarExpressionManifest(manifest(),asset,owner)).toThrow();
});

it('SD-UT-060: a ready pack is read by exact asset and both versions; model changes do not request regeneration',()=>{
 const m=manifest();m.generatorModel='historical-model';
 const ready=validateAvatarExpressionManifest(m,owner,asset);
 expect(ready.masterAsset).toEqual(m.masterAsset);expect(ready.expressions).toEqual(m.expressions);
 expect(()=>validateAvatarExpressionManifest({...m,expressionSpecVersion:'v2'},owner,asset)).toThrow();
});
