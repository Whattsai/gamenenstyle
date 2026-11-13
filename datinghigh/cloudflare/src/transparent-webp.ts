/** RFC 9649 靜態透明 VP8X／VP8L ingress；像素安全解碼仍由 .NET Skia 負責。 */
export function transparentWebpDimensions(bytes:Uint8Array){
 const invalid=()=>{throw new Error('INVALID_TRANSPARENT_WEBP');};
 if(bytes.length<26||bytes.length>2000000)invalid();
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),text=(offset:number)=>String.fromCharCode(...bytes.subarray(offset,offset+4));
 if(text(0)!=='RIFF'||text(8)!=='WEBP'||view.getUint32(4,true)!==bytes.length-8)invalid();
 const lossless=(offset:number,length:number)=>{
  if(length<5||offset+length>bytes.length||bytes[offset]!==0x2f)invalid();const bits=view.getUint32(offset+1,true);
  if((bits>>>29)!==0||(bits&0x10000000)===0)invalid();return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};
 };
 const bounded=(width:number,height:number)=>{if(width<600||height<800||width>4096||height>5462||Math.abs(width/height-.75)>.015)invalid();return {width,height};};
 if(text(12)==='VP8L'){const length=view.getUint32(16,true);if(20+length+(length%2)!==bytes.length)invalid();const image=lossless(20,length);return bounded(image.width,image.height);}
 if(bytes.length<30||text(12)!=='VP8X'||view.getUint32(16,true)!==10||![16,48].includes(bytes[20])||bytes[21]||bytes[22]||bytes[23])invalid();
 const width=1+bytes[24]+256*bytes[25]+65536*bytes[26],height=1+bytes[27]+256*bytes[28]+65536*bytes[29];bounded(width,height);
 let alpha=false,image=false,profile=false;
 for(let offset=30;offset<bytes.length;){
  if(offset+8>bytes.length)invalid();const kind=text(offset),length=view.getUint32(offset+4,true);const end=offset+8+length+(length%2);
  if(end>bytes.length||['ANIM','ANMF','EXIF','XMP '].includes(kind))invalid();
  if(kind==='ALPH'){if(alpha||image||length<1)invalid();alpha=true;}
  else if(kind==='VP8 '){if(image||!alpha||length<1)invalid();image=true;}
  else if(kind==='VP8L'){if(image||alpha)invalid();const frame=lossless(offset+8,length);if(frame.width!==width||frame.height!==height)invalid();alpha=true;image=true;}
  else if(kind==='ICCP'){if(profile||alpha||image||length<1||length>4096||(bytes[20]&32)===0)invalid();profile=true;}
  else invalid();
  offset=end;
 }
 if(!alpha||!image||profile!==!!(bytes[20]&32))invalid();return {width,height};
}
