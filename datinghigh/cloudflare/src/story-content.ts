
export interface StoryContentEnv {DB:D1Database;STORY_CONTENT?:R2Bucket;}
const digest=async(bytes:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
/** 獨立 bucket 只供應內容定址公開故事素材；不接受任意 R2 key。 */
export async function serveStoryAsset(request:Request,env:StoryContentEnv):Promise<Response>{
 const url=new URL(request.url);const hash=url.pathname.match(/^\/story-content\/assets\/([0-9a-f]{64})$/)?.[1];
 const fail=()=>new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});
 if(!hash||url.search||!['GET','HEAD'].includes(request.method)||!env.STORY_CONTENT)return fail();
 const object=await env.STORY_CONTENT.get(`story-content/assets/${hash}`);if(!object||object.size>8388608||!['image/png','image/jpeg','image/webp','audio/wav'].includes(object.httpMetadata?.contentType??''))return fail();
 const bytes=await object.arrayBuffer();if(await digest(bytes)!==hash)return fail();
 const headers={'Content-Type':object.httpMetadata!.contentType!,'Cache-Control':'public, max-age=31536000, immutable',ETag:`"${hash}"`,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'",'Access-Control-Allow-Origin':'*'};
 return new Response(request.method==='HEAD'?null:bytes,{headers});
}
