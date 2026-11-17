import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildSceneEventTrackBundle} from '../../tools/scene-event-content-policy.mjs';
/** 隔離測試直接由 v2 內容建立變體；不處理舊狀態，也不冒用人工 Gate。 */
export function buildTrackFixture(root,options={}){
 const directory=root instanceof URL?fileURLToPath(root):root;
 let source=JSON.parse(readFileSync(path.join(directory,'contracts/rain-bookshop-last-order.json'),'utf8'));
 const rename=(from,to)=>{if(to&&from!==to){const files=source.assetSources.map(a=>a.file);source=JSON.parse(JSON.stringify(source).replaceAll(from,to));source.assetSources.forEach((a,i)=>a.file=files[i]);}};
 rename(source.narrative.narrativeId,options.narrativeId);rename(source.scene.sceneId,options.sceneId);
 source.scene.version=options.sceneVersion??source.scene.version;source.pool.version=options.poolVersion??source.pool.version;source.narrative.version=options.narrativeVersion??source.narrative.version;
 const categories=options.categories??[{categoryId:'019a281e-0000-7000-8000-000000004003',code:'romance',version:'v1',title:'浪漫',interestTagIds:['reading'],recommendationPriority:1}];
 source.scene.categoryCodes=categories.map(c=>c.code);source.narrative.eligibleCategoryCodes=options.eligibleCategoryCodes??categories.map(c=>c.code);
 source.narrative.sequenceGroupId=options.sequenceGroupId??null;source.narrative.sequenceOrder=options.sequenceOrder??null;source.narrative.prerequisites=options.prerequisites??[];
 options.mutate?.(source);
 return buildSceneEventTrackBundle(source,root,{...options,categories,sceneCatalogId:options.sceneCatalogId??'019a281e-0000-7000-8000-000000005001',narrativeCatalogId:options.narrativeCatalogId??'019a281e-0000-7000-8000-000000005002'});
}
