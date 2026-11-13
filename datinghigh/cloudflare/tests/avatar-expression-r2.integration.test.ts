import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {beforeAll,beforeEach,afterAll,it,expect,vi} from 'vitest';
import {readReadyAvatarPack,publishReadyAvatarPack} from '../src/avatar-expression-store';
import {avatarExpressionPrefix,avatarExpressionManifestKey,expressionIds} from '../src/avatar-expression-manifest';

let mf:Miniflare,bucket:R2Bucket;
const owner='019a281e-0000-7000-8000-000000000001',asset='019a281e-0000-7000-8000-000000000002';
const hash=async(bytes:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',Uint8Array.from(bytes).buffer)),n=>n.toString(16).padStart(2,'0')).join('');
async function seed(){
 const expressions:Record<string,any>={};
 for(const [index,name] of expressionIds.entries()){
  // 合成 binary fixture 只驗 R2 完整性；不是影像解碼或真人美術證據。
  const bytes=new Uint8Array([82,73,70,70,index]),objectKey=avatarExpressionPrefix(owner,asset)+name+'.webp';
  await bucket.put(objectKey,bytes,{httpMetadata:{contentType:'image/webp'}});
  expressions[name]={objectKey,sha256:await hash(bytes),mimeType:'image/webp',width:768,height:1024,byteSize:bytes.length,alphaMode:'straight',framing:'full_body',pose:'standing'};
 }
 return {manifestSchemaVersion:1,ownerAccountId:owner,avatarAssetId:asset,expressionSpecVersion:'v1',avatarAssetSpecVersion:'full-body.v1',
  sourceImageSha256:'a'.repeat(64),sourceAssetRef:'019a281e-0000-7000-8000-000000000003',status:'ready',framing:'full_body',pose:'standing',
  stageAnchors:{head:{x:.5,y:.08},feet:{x:.5,y:.96}},masterAsset:expressions.neutral,expressions,generatorModel:'test-provider',promptVersion:'test-only',verifiedAt:1800000000000};
}
beforeAll(async()=>{mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',compatibilityDate:'2026-10-24',r2Buckets:{FILES:'expression-packs'}}));bucket=await mf.getR2Bucket('FILES') as unknown as R2Bucket;});
beforeEach(async()=>{const list=await bucket.list();if(list.objects.length)await bucket.delete(list.objects.map(o=>o.key));});
afterAll(async()=>{await mf?.dispose();});

it('SD-IT-070: a missing, corrupted or wrong-MIME expression cannot publish a ready manifest',async()=>{
 for(const corrupt of ['missing','hash','mime'] as const){const m=await seed(),key=m.expressions.concerned.objectKey;
  if(corrupt==='missing')await bucket.delete(key);else await bucket.put(key,new Uint8Array([1]),{httpMetadata:{contentType:corrupt==='mime'?'image/jpeg':'image/webp'}});
  await expect(publishReadyAvatarPack(bucket,m,owner,asset)).rejects.toThrow();
  expect(await bucket.get(avatarExpressionManifestKey(owner,asset))).toBeNull();
 }
});
it('SD-IT-071: ready is immutable; rereading checks only the exact manifest and never HEADs five images',async()=>{
 const m=await seed();await publishReadyAvatarPack(bucket,m,owner,asset);
 const get=vi.fn(bucket.get.bind(bucket)),head=vi.fn(()=>{throw new Error('unexpected HEAD');});
 const read=await readReadyAvatarPack({get,head} as unknown as R2Bucket,owner,asset);
 expect(read.expressions).toEqual(m.expressions);expect(get).toHaveBeenCalledTimes(1);expect(head).not.toHaveBeenCalled();
 await publishReadyAvatarPack(bucket,m,owner,asset);
 await expect(publishReadyAvatarPack(bucket,{...m,promptVersion:'overwrite'},owner,asset)).rejects.toThrow();
 expect((await readReadyAvatarPack(bucket,owner,asset)).promptVersion).toBe('test-only');
});
it('SD-IT-070/074: another owner, wrong source and damaged manifests fail closed',async()=>{
 const m=await seed();await expect(publishReadyAvatarPack(bucket,m,asset,owner)).rejects.toThrow();
 await publishReadyAvatarPack(bucket,m,owner,asset);
 await expect(readReadyAvatarPack(bucket,asset,owner)).rejects.toThrow();
 await expect(readReadyAvatarPack(bucket,owner,asset,{sourceImageSha256:'f'.repeat(64)})).rejects.toThrow();
 await bucket.put(avatarExpressionManifestKey(owner,asset),'{"status":"ready"}');
 await expect(readReadyAvatarPack(bucket,owner,asset)).rejects.toThrow();
});
