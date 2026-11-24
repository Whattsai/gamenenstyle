import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateStaticPoseData} from '../../contracts/static-avatar.ts';
const root=fileURLToPath(new URL('../../',import.meta.url)),hash=b=>createHash('sha256').update(b).digest('hex');
test('SEF-ET-105 static integrity: all sixteen approved identities retain twenty complete frames and the male-02 correction',()=>{
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'contracts/builtin-static-poses.json')));
 const old=JSON.parse(fs.readFileSync(path.join(root,'contracts/builtin-avatar-packs.json')));
 assert.deepEqual(Object.keys(catalog.packs).sort(),Object.keys(old.packs).sort());
 const allFiles=new Set();
 for(const [id,p]of Object.entries(catalog.packs)){
  const {sourceImageSha256,...data}=p;validateStaticPoseData(data);
  assert.equal(p.sourceImageSha256,old.packs[id].expressions.neutral.sha256);
  assert.equal(p.poses.length,4);
  for(const a of p.assets){
   const file=`/avatars/static-poses.v1/${id}/${a.sha256}.png`,bytes=fs.readFileSync(path.join(root,'frontend/client/public',file));
   assert.equal(hash(bytes),a.sha256);assert.equal(bytes.length,a.byteSize);
   assert.equal(bytes.readUInt32BE(16),a.width);assert.equal(bytes.readUInt32BE(20),a.height);
   allFiles.add(file);
  }
  for(const pose of p.poses)assert.equal(Object.keys(pose.frames).length,5);
 }
 const correction=catalog.packs['male-02'].poses.find(p=>p.id==='hold').frames.smile;
 assert.equal(catalog.packs['male-02'].assets.find(a=>a.id===correction.assetId).sha256,'ea70e9284cf364d339464f874594e450fa9bf2cdb7f5119a1f1652a2bded3736');
 assert.equal(allFiles.size,65);
});
