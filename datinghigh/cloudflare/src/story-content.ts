import {z} from 'zod';
import {executeCommand} from './commands';
import {parseStrictJson} from './strict-json';

export interface StoryContentEnv {DB:D1Database;STORY_CONTENT?:R2Bucket;}
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const schema=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative(),roundId:id,catalogId:id});
const digest=async(bytes:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
/** 僅由已授權凍結候選讀取 immutable manifest；R2 等待前後重驗。 */
export async function readStoryContent(input:unknown,env:StoryContentEnv,now=Date.now()){
 const started=Date.now();const p=schema.parse(input);const {catalogId,...member}=p;
 await executeCommand(env.DB,'story.authorize',member,now);
 const catalog=await env.DB.prepare(`SELECT c.manifest_key,c.manifest_sha256 FROM content_story_catalog c JOIN game_rounds r ON r.round_id=? WHERE c.catalog_id=? AND c.status IN ('published','retired') AND (c.catalog_id IN(SELECT value FROM json_each(r.story_offer_catalog_ids_json)) OR EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=r.round_id AND s.episode_seq=1 AND s.catalog_id=c.catalog_id))`).bind(p.roundId,catalogId).first<{manifest_key:string;manifest_sha256:string}>();
 if(!catalog||!/^story-content\/stories\/scene-\d{2,4}\/v[1-9]\d*\/manifest\.json$/.test(catalog.manifest_key)||!env.STORY_CONTENT)throw new Error('INVALID_STORY_CONTENT');
 const object=await env.STORY_CONTENT.get(catalog.manifest_key);if(!object||object.size>524288)throw new Error('INVALID_STORY_CONTENT');
 const bytes=await object.arrayBuffer();if(await digest(bytes)!==catalog.manifest_sha256)throw new Error('INVALID_STORY_CONTENT');
 const manifest=parseStrictJson(new TextDecoder('utf-8',{fatal:true}).decode(bytes));await executeCommand(env.DB,'story.authorize',member,now+Math.max(0,Date.now()-started));return {manifest};
}
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
