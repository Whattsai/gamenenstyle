import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p));
const hash=b=>createHash('sha256').update(b).digest('hex');

test('all 16 approved builtin avatars ship five immutable transparent expressions and select the new full-body neutral',()=>{
 const ids=['male','female'].flatMap(g=>Array.from({length:8},(_,n)=>`${g}-0${n+1}`));
 const catalog=json('contracts/builtin-avatar-packs.json');
 assert.deepEqual(Object.keys(catalog.packs).sort(),[...ids].sort());
 const selection=read('frontend/client/src/avatar-assets.ts').toString();
 for(const id of ids){
  const pack=catalog.packs[id];
  assert.equal(pack.avatarAssetId,id);
  const expressions=['neutral','smile','surprised','thoughtful','concerned'];
  assert.deepEqual(Object.keys(pack.expressions).sort(),[...expressions].sort());
  const hashes=[];
  for(const expression of expressions){
   const image=pack.expressions[expression];
   assert.equal(image.url,`/avatars/full-body.v1/${id}/${image.sha256}.webp`);
   const bytes=read(`frontend/client/public${image.url}`);
   assert.equal(image.mimeType,'image/webp');assert.equal(bytes.length,image.byteSize);assert.ok(bytes.length<=200000);
   assert.equal(hash(bytes),image.sha256);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.equal(image.width*4,image.height*3);assert.ok(image.width>=600&&image.height>=800);
   assert.equal(image.width,pack.expressions.neutral.width);assert.equal(image.height,pack.expressions.neutral.height);
   hashes.push(image.sha256);
  }
  assert.equal(pack.avatarVersion,hash(JSON.stringify([id,'v1','full-body.v1',...hashes])));
  assert.ok(selection.includes(`../public${pack.expressions.neutral.url}`),`${id} selects its canonical neutral`);
 }
});
