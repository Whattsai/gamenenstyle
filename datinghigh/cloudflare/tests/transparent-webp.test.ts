import {it,expect} from 'vitest';
import {transparentWebpDimensions} from '../src/transparent-webp';
function fixture(){const b=new Uint8Array(52),d=new DataView(b.buffer),t=new TextEncoder();b.set(t.encode('RIFF'));d.setUint32(4,44,true);b.set(t.encode('WEBPVP8X'),8);d.setUint32(16,10,true);b[20]=16;b[24]=255;b[25]=2;b[27]=255;b[28]=3;b.set(t.encode('ALPH'),30);d.setUint32(34,2,true);b.set(t.encode('VP8 '),40);d.setUint32(44,4,true);return b;}
it('transparent sprite ingress checks RIFF size, canvas, alpha, static frame and bounded chunks',()=>{
 expect(transparentWebpDimensions(fixture())).toEqual({width:768,height:1024});
 for(const mutate of [(b:Uint8Array)=>b[20]=0,(b:Uint8Array)=>b[20]=18,(b:Uint8Array)=>b[24]=0,(b:Uint8Array)=>b[4]=1,(b:Uint8Array)=>b[34]=255]){const b=fixture();mutate(b);expect(()=>transparentWebpDimensions(b)).toThrow();}
 expect(()=>transparentWebpDimensions(new Uint8Array([1,2,3]))).toThrow();
});
function lossless(extended=false){
 const size=extended?44:26,b=new Uint8Array(size),v=new DataView(b.buffer),t=new TextEncoder();b.set(t.encode('RIFF'));v.setUint32(4,size-8,true);b.set(t.encode('WEBP'),8);
 let offset=12;if(extended){b.set(t.encode('VP8X'),12);v.setUint32(16,10,true);b[20]=16;b[24]=255;b[25]=2;b[27]=255;b[28]=3;offset=30;}
 b.set(t.encode('VP8L'),offset);v.setUint32(offset+4,6,true);b[offset+8]=0x2f;v.setUint32(offset+9,(767|(1023<<14)|0x10000000)>>>0,true);return b;
}
it('lossless sprites use embedded VP8L alpha with matching canvas; malformed or opaque headers still fail closed',()=>{
 for(const extended of [false,true]){
  expect(transparentWebpDimensions(lossless(extended))).toEqual({width:768,height:1024});
  for(const change of [(b:Uint8Array)=>b[b.length-6]=0,(b:Uint8Array)=>b[b.length-2]&=0xef,(b:Uint8Array)=>b[b.length-2]|=0x20]){const b=lossless(extended);change(b);expect(()=>transparentWebpDimensions(b)).toThrow();}
 }
 const mismatch=lossless(true);mismatch[24]=254;expect(()=>transparentWebpDimensions(mismatch)).toThrow();
});
