import fs from 'node:fs';
import {createHash} from 'node:crypto';
const rate=16000,folder=new URL('../contracts/story-assets/',import.meta.url);let seed=821;
const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
/** 自製短 WAV；沒有外部錄音／人聲，固定 seed 可重建同一位元組。 */
function wave(seconds,sample){const n=Math.floor(rate*seconds),b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,sample(i/rate,i/n)))*32767),44+i*2);return b;}
const sounds=[['page-turn',wave(.28,(t,p)=>noise()*.2*Math.sin(Math.PI*p)**2*(.55+.45*Math.sin(t*110)))],['transition',wave(.65,(t,p)=>(Math.sin(t*2*Math.PI*440)+Math.sin(t*2*Math.PI*660))*.06*Math.sin(Math.PI*p)**2)]];
const metadata=sounds.map(([id,bytes])=>{const file=`contracts/story-assets/${id}-v1.wav`;fs.writeFileSync(new URL(`${id}-v1.wav`,folder),bytes);return{id,file,key:`story-content/assets/${createHash('sha256').update(bytes).digest('hex')}`,sha256:createHash('sha256').update(bytes).digest('hex'),byteLength:bytes.length,mimeType:'audio/wav'};});
const sourceFile=new URL('../contracts/rain-bookshop-last-order.json',import.meta.url),source=JSON.parse(fs.readFileSync(sourceFile,'utf8'));
for(const {file,...asset} of metadata){const index=source.scene.assets.findIndex(a=>a.id===asset.id);if(index<0)source.scene.assets.push(asset);else source.scene.assets[index]=asset;const mapping=source.assetSources.find(a=>a.id===asset.id);if(mapping)mapping.file=file;else source.assetSources.push({id:asset.id,file});}
// 門鈴與風聲保留正式原創 PCM 成品；不覆寫 immutable v2 位元組。
for(const id of ['doorbell','gust']){const mapping=source.assetSources.find(a=>a.id===id),asset=source.scene.assets.find(a=>a.id===id),bytes=fs.readFileSync(new URL('../'+mapping.file,import.meta.url));if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('IMMUTABLE_CONTENT_CONFLICT');}
fs.writeFileSync(sourceFile,JSON.stringify(source,null,2)+'\n');
const provenanceFile=new URL('provenance.json',folder),provenance=JSON.parse(fs.readFileSync(provenanceFile,'utf8'));provenance.cues={source:'Original deterministic synthesis; no external recording or voice',generator:'tools/story-audio-assets.mjs',seed:821,sampleRate:rate,assets:metadata.map(({id,sha256,byteLength})=>({id,sha256,byteLength}))};fs.writeFileSync(provenanceFile,JSON.stringify(provenance,null,2)+'\n');
