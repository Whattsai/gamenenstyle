import {z} from 'zod';
export const poseBuildSteps=['pose-stand','pose-sit','pose-read','pose-hold'] as const;
export type PoseBuildStep=typeof poseBuildSteps[number];
export const isPoseStep=(s:string):s is PoseBuildStep=>poseBuildSteps.includes(s as PoseBuildStep);
const sha=z.string().regex(/^[0-9a-f]{64}$/),id=z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
const region=z.strictObject({x:z.number().nonnegative(),y:z.number().nonnegative(),width:z.number().positive(),height:z.number().positive()});
export const poseSheetSchema=z.strictObject({objectKey:z.string(),sha256:sha,mimeType:z.literal('image/png'),width:z.number().int().min(1000).max(8192),height:z.number().int().min(600).max(8192),byteSize:z.number().int().positive().max(20000000),frames:z.array(region).length(5),requestId:id});
