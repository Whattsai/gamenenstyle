import {z} from 'zod';
import {assertFrameworkMember} from './scene-event-authorization';
import {readPinnedSceneEventContent} from './scene-event-content';

const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const input=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative(),roundId:id,catalogId:id});
/** 內部用例讀取已選主線的全部固定依賴；不授予未選內容或已退出的歷史讀取權。 */
export async function readAuthorizedSceneEventContent(value:unknown,env:{DB:D1Database;STORY_CONTENT?:R2Bucket},now=Date.now()){
 const started=Date.now(),p=input.parse(value),{catalogId,...member}=p;
 await assertFrameworkMember(env.DB,member,now);
 const catalog=await env.DB.prepare(`SELECT c.story_id,c.version,c.manifest_key,c.manifest_sha256 FROM content_story_catalog c WHERE c.catalog_id=? AND c.status IN('published','retired') AND EXISTS(SELECT 1 FROM game_story_sessions s WHERE s.round_id=? AND s.catalog_id=c.catalog_id)`).bind(catalogId,p.roundId).first<{story_id:string;version:string;manifest_key:string;manifest_sha256:string}>();
 if(!catalog||!env.STORY_CONTENT)throw new Error('INVALID_STORY_CONTENT');
 try{
  const content=await readPinnedSceneEventContent(env.STORY_CONTENT,{id:catalog.story_id,version:catalog.version,key:catalog.manifest_key,sha256:catalog.manifest_sha256});
  return {content};
 }finally{await assertFrameworkMember(env.DB,member,now+Math.max(0,Date.now()-started));}
}
