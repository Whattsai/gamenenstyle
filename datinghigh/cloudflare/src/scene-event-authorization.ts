import {z} from 'zod';
import {executeCommand} from './commands';
const id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
export const frameworkMemberSchema=z.strictObject({accountId:id,sessionId:id,cv:z.number().int().positive(),accessExpiresAt:z.number().int().nonnegative(),roundId:id});
export class SceneEventFrameworkError extends Error{constructor(public code:string,public status=409){super(code);}}
/** 保留 active+Claims 的 SQL guard，並讓撤銷 family／第三人／ended 有可清理私有 UI 的精確回應。 */
export async function assertFrameworkMember(db:D1Database,value:unknown,now=Date.now(),allowEnded=false){
 const p=frameworkMemberSchema.strip().parse(value),{roundId,...auth}=p;
 if((await executeCommand(db,'session.validate',auth,now)).rows.length!==1)throw new SceneEventFrameworkError('SESSION_REVOKED',401);
 const round=(await executeCommand(db,'story.round.status',p,now)).rows[0]as{status:string}|undefined;
 if(!round)throw new SceneEventFrameworkError('RESOURCE_FORBIDDEN',403);
 if(round.status!=='active'){if(allowEnded)return;throw new SceneEventFrameworkError('ROUND_NOT_ACTIVE');}
 await executeCommand(db,'story.authorize',p,now);
}
