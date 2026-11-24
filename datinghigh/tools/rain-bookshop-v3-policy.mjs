/** 首場 V3 的正式內容基線；技術驗證不代表素材或人工 Gate B 核准。
 * 通用 runtime 仍逐一驗 DSL、素材引用及可達性；此處另外防止以可玩的縮減版
 * 或重新雜湊的測試劇本取代已確認的首場範圍。修改基線時須一併覆核 SPEC §3.8。
 */
export const v3FirstStory='rain-bookshop-before-rain-stops';
/** 本地入口只接受既有首場或取代它的首場；其他故事仍須另外具備人工 Gate B。 */
export function validateFirstStoryAuthoring(index){
 if(index?.schemaVersion!=='scene-event.authoring.v2'||!Array.isArray(index.stories)||index.stories.length!==1||!['contracts/rain-bookshop-last-order.json','contracts/rain-bookshop-before-rain-stops.json'].includes(index.stories[0]?.sourceFile))throw Error('FIRST_STORY_GATE_REQUIRED');
}
export function validateRainBookshopV3(bundle){
 const s=bundle.scene.manifest,n=bundle.narrative.manifest;
 const refuse=()=>{throw Error('INVALID_STORY_CONTENT');};
 if(n.narrativeId!==v3FirstStory||n.version!=='v1'||s.sceneId!=='rain-bookshop'||s.version!=='v3')refuse();
 const areas=['street-view','entrance','shelves','reading-corner','counter','window','safe-storage'];
 if(areas.some(id=>!s.stage?.areaVisuals.some(a=>a.areaId===id))||new Set(s.stage?.areaVisuals.map(a=>a.backgroundAsset)).size!==7)refuse();
 if(s.books?.length!==4||new Set(s.books.map(b=>b.category)).size!==4||s.books.some(b=>b.pages.length<2))refuse();
 if(!s.npcs?.some(npc=>npc.appearance?.format==='static-npc.v1'&&npc.appearance.poses.length>=2&&npc.hitMasks?.length===10&&npc.dialogueOptions.includes('browse')))refuse();
 if(n.tracks.inviter.entry!=='iv3-01'||n.tracks.acceptor.entry!=='av3-01')refuse();
 const endings=['ev3-01-more-talk','ev3-02-book-recommendation','ev3-03-gentle-distance','safety-exit'];
 if(JSON.stringify(n.endings.map(e=>e.id))!==JSON.stringify(endings)||new Set(n.endings.flatMap(e=>e.presentationSteps.filter(p=>p.type==='shot').map(p=>p.shotId))).size!==4||n.safetyExit?.endingId!=='safety-exit')refuse();
 const bindings=[...n.eventBindings,...n.sharedEventBindings];
 for(const id of ['iv3-enter','av3-enter','av3-resonance','iv3-greeting','av3-response','iv3-understand','sv3-weather','sv3-help','av3-share-list','iv3-pick','iv3-box','av3-pick-box','av3-store','sv3-final-wish'])if(!bindings.some(b=>b.bindingId===id))refuse();
 // 鎖定完整 scene／narrative／pool，包含原創書文、私有線索、意願分支、
 // 世界狀態與演出；不可只替換台詞或刪除必經救書／安全步驟。
 if(bundle.scene.sha256!=='aab0bac5c13b69728e66e50af4c2614d3d26bc39cc15a51ac75c7cd17d54ba33'||bundle.narrative.sha256!=='74b4d9cf41ef5ff869698f309bd6603956b058d2fc58c6130218d23b3026b873'||bundle.pool.sha256!=='0e74f5f0b33f6d175c123705e2635d938e57590e4e3470eacf10d7b98e68868a')refuse();
}
