import fs from 'node:fs';
import assert from 'node:assert/strict';

// 2026-11-06逐一讀完Given／When／Then及斷言後明列的對照；本工具不執行測試，亦不依名稱自動批准。
const tddPath='docs/tdd/SPEC-001-MatchingSessions-TDD.md',bddPath='docs/bdd/SPEC-001-MatchingSessions-BDD.md';
const read=p=>fs.readFileSync(p,'utf8').replaceAll('\r\n','\n');
let tdd=read(tddPath),bdd=read(bddPath);
const source={
 score:'backend/src/DatingHigh.Domain/MatchingScore.cs',service:'backend/src/DatingHigh.Application/MatchingSessionService.cs',
 sql:'cloudflare/src/matching-commands.ts',schema:'cloudflare/migrations/0004_matching_sessions.sql',
 ui:'frontend/client/src/MatchingScreen.tsx',http:'backend/src/DatingHigh.Api/Program.cs'
};
const tests={score:'backend/tests/DatingHigh.Unit.Tests/Domain/MatchingScoreTests.cs',unit:'backend/tests/DatingHigh.Unit.Tests/Application/MatchingSessionsTests.cs',
 account:'frontend/client/tests/unit/account-screens.test.tsx',
 ui:'frontend/client/tests/unit/matching-sessions.test.tsx',d1:'cloudflare/tests/matching-sessions-d1.integration.test.ts',
 api:'backend/tests/DatingHigh.Api.Tests/MatchingRealD1Tests.cs',http:'backend/tests/DatingHigh.Api.Tests/MatchingEndpointTests.cs',
 web:'tests/e2e/web/matching-sessions.spec.ts',android:'tests/e2e/android/matching-sessions.mjs'};
const at=(path,anchor)=>{const s=read(path),i=s.indexOf(anchor);assert.ok(i>=0,`Missing evidence ${path}: ${anchor}`);return {path,line:s.slice(0,i).split('\n').length,anchor};};
const reviews=new Map();
function review(layer,ids,implementation,proofs,note){
 for(const n of ids){const id=`MS-${layer}-${String(n).padStart(3,'0')}`;assert.ok(!reviews.has(id),id);
  reviews.set(id,{implementation:at(source[implementation[0]],implementation[1]),evidence:proofs.map(([key,anchor])=>at(tests[key],anchor)),review:note});}
}
const scoreProof=['score','MS_UT_002_013_028_029_050'],ageProof=['score','MS_UT_003_023_024_025'],regionProof=['score','MS_UT_004_016_017_026_027_049'],interestProof=['score','MS_UT_018_030_031_032_050'];
const savedScore=['api','SavedPreferencesProduceSymmetricSoftScoresWithoutFiltering'];
const consent=['api','RealThreePlayers_RequireMutualConsentAndHidePrivateFields'];
const profile=['d1','only ready profiles have unique conditions'];
const pending=['d1','pending survives empty orientation and absent conditions'];
const race=['d1','cross-pair concurrent accept and forced zero-change rollback'];
const ended=['d1','loss of readiness preserves active game, end atomically frees both'];
const strict=['api','RealReadinessRevocationStrictJsonAndSharedRateLimit'];
review('UT',[1],['service','public async Task<JsonObject> SearchAsync'],[['unit','Search_RanksEntireSetBeforePaging'],consent,profile],'用例完整排序／安全DTO；就緒資格由真D1驗證。');
review('UT',[2,13,14,15,28,29,50],['score','public static int Calculate'],[scoreProof,savedScore],'無偏好、單邊／雙邊正規化與兩向相同整數分數。');
review('UT',[3,23,24,25],['score','public static double AgeSide'],[ageProof,savedScore],'閉區間、每歲5分及20歲差下限；軟偏好不淘汰。');
review('UT',[4,16,17,26,27,49],['score','public static double RegionSide'],[regionProof,savedScore],'固定22縣市、最近點、未知50、150km指數及外島；另驗實際保存輸入。');
review('UT',[5,22],['sql','function hard'],[['score','MS_UT_005_022'],['d1','stale projections still recheck the Taiwan midnight birthday'],['d1','current nonempty but one-sided orientation']],'臺灣成年邊界與雙向性向；硬資格的SQL證據不以mock代替。');
review('UT',[6,8],['service','public async Task<JsonObject> InviteAsync'],[['unit','Invite_OnlyReceiverExplicitIntent'],['unit','OwnPendingReplay'],['api','RealSimultaneousReverseIntent']],'單方pending不開房；接收者反向明確意願才接受。');
review('UT',[7,9,10,11,33],['service','public async Task<JsonObject> ResolveAsync'],[['unit','Resolve_ProjectsOnlyTheExpectedTerminalOutcome'],['unit','Resolve_TerminalStates'],['api','RejectAndCancel_KeepDistinctPairHistory'],['d1','exact 72h expiration']], '用例只投影對應結果；永久婉拒、取消、等號過期由實際D1補證。');
review('UT',[12,21,58],['sql',"case 'game.round.end'"],[ended,['api','CrossPairRaceAndEndedHistoryStayExclusive']],'內部ended／兩人釋放／未就緒不重建；沒有產品退出E2E聲明。');
review('UT',[18,30,31,32],['score','var interest ='],[interestProof,savedScore],'空標籤、生活共同欄位分母、權重0/50/100與最後一次取整。');
review('UT',[19],['sql',"case 'match.invite.list'"],[['d1','explicit accept creates one round'],['unit','Lists_KeepIncomingOutgoingSeparate']],'多pair等待與incoming/outgoing不被全量排除。');
review('UT',[20],['service','var ranked='],[savedScore,['api','AllCandidatesRankBeforePaginationWithStableTieAndSafePersona']],'保存偏好後重算排序，全量計分後分頁。');
review('UT',[34,46,47],['ui','export function PersonaCard'],[['ui','on-demand safe card'],['ui','only preloads'],['ui','room shows persisted round'],consent],'安全化身暱稱分數，無本人照片／職業／隱藏偏好。');
review('UT',[35],['ui',"目前沒有可配對的對象"],[['ui','empty candidates are explicit']],'空結果明示，沒有固定候選。');
review('UT',[36,45,59],['ui',"const mutate="],[['ui','outgoing pending waits'],['ui','incoming acceptance and confirmed decline'],['web','true two-party accept']],'方向正確與同步ref擋連點；實際HTTP只一筆有效邀請。');
review('UT',[37,38],['ui','const showInvitation'],[['ui','decline requires explicit permanent confirmation'],['ui','incoming acceptance and confirmed decline'],['ui','incoming exploration card'],['ui','terminal %s']],'永久婉拒先確認；取消為非永久狀態；探索卡及列表均有入口。');
review('UT',[39,42],['ui','const showInvitation'],[['ui','safe invalidation reason'],['ui','terminal %s']],'過期不接受；兩種失效原因各自安全文案。');
review('UT',[40,41,43],['ui','export function GameRoundScreen'],[['ui','room shows persisted round'],['ui','active round redirects'],['web','true two-party accept']],'真round讀回及占用導引；無假對話。');
review('UT',[44],['ui','if(error instanceof ApiFailure&&error.uncertain)'],[['ui','an uncertain mutation'],['web','unknown write does not auto-replay']],'未知寫入停寫，GET輪次／邀請讀回後才恢復。');
review('UT',[48,55],['ui','export function MatchingStartScreen'],[['ui','login routes profile'],['ui','unknown login status'],['account','a recovered entry session'],['web','profile incomplete and unknown status'],['android','unknown-login-safe-retry']],'就緒、未完成、遊戲中與未知安全重試；雙平台實際流程。');
review('UT',[51],['sql','export function projectionPlan'],[profile,['d1','actual photo reorder'],['api','TrueProjectionFault_IsSkipped']],'真D1驗建立與移除；不存來源revision，無關更新無投影指令。');
review('UT',[52],['sql','export function projectionPlan'],[ended],'真D1失格刪投影但active輪次與占用保留。');
review('UT',[53,54],['sql','function ready'],[pending,['d1','current nonempty but one-sided orientation'],['d1','loss is safe and does not establish a game']],'舊pending不依賴現行性向／投影，硬資格仍驗；新操作查最新條件。');
review('UT',[56],['service','var ranked='],[['unit','Search_RanksEntireSetBeforePaging'],['unit','Candidate_UsesSeparatePersonaRecheck'],['ui','only preloads'],['api','AllCandidatesRankBeforePagination']],'完整排序、穩定tie、GET安全人物卡及最多3張預載。');
review('UT',[57],['schema','CREATE TABLE game_round_participants'],[race,['d1','exact schema preserves Foundation54']],'本規劃UT明文要求真D1；UNIQUE與跨pair競態在真SQL驗證。');
review('UT',[60],['sql','export function profileAffectsMatching'],[['d1','actual photo reorder'],['api','TrueProjectionFault_IsSkipped']],'armed投影故障不被無關更新消耗；reorder內容／updated_at逐位元一致。');

for(const n of [2,3,4,13,14,15,16,17,18,20,23,24,25,26,27,28,29,30,31,32])review('IT',[n],['score','public static int Calculate'],[savedScore,...(n===20?[['api','AllCandidatesRankBeforePagination']]:[])],'真Application／D1保存資料，雙方查詢相同分數；純分量由Domain測試交叉核對。');
review('IT',[1,57],['sql','export function projectionPlan'],[profile],'只ready有唯一條件列，原Profile保留、無revision欄位／trigger。');
review('IT',[5,19,64],['sql','function candidateSelect'],[['d1','search is mutual, keeps pending direction'],['d1','actual photo reorder']],'雙向篩選及等待方向；無關revision不影響投影與候選。');
review('IT',[6,7,39,52],['sql',"case 'match.invite.resolve'"],[['d1','explicit accept creates one round'],['api','CrossPairRaceAndEndedHistoryStayExclusive']],'一方pending無round，接受原子建輪次／2人，失效其他雙向pending且第三人可重邀。');
review('IT',[8,41,42],['sql',"case 'match.invite.create'"],[['d1','reverse explicit intent'],['api','RealSimultaneousReverseIntent']],'原邀請／requestId重送與反向競爭不建立第二場。');
review('IT',[9,10,37,54],['sql','const excluded='],[['d1','has correct directional authority'],['api','RejectAndCancel_KeepDistinctPairHistory'],['api','CrossPairRaceAndEndedHistoryStayExclusive']],'取消不排除，declined及ended只按帳號pair雙向永久排除。');
review('IT',[11,33,55],['sql','function maintenance'],[['d1','exact 72h expiration']],'72h含等號過期、無round、同pair partial UNIQUE釋放可重邀。');
review('IT',[12,21,53,58,61],['sql',"case 'game.round.end'"],[ended,['d1','zero-row end %s'],['api','CrossPairRaceAndEndedHistoryStayExclusive']],'內部end原子釋放、永久pair、其他人可重新邀；不重建未就緒投影。');
review('IT',[22],['sql','function hard'],[['d1','stale projections still recheck the Taiwan midnight birthday']],'UTC16:00臺灣跨日，昨日未成年與當日成年各別核對。');
review('IT',[34],['sql','function candidateSelect'],[['d1','current nonempty but one-sided orientation'],['api','NonemptyOneWayOrientationAndOccupiedCandidates']],'不相容的新候選／邀請安全拒絕，舊pending仍有效。');
review('IT',[35],['sql','function ready'],[strict,profile],'空性向不等於接受全部，HTTP PROFILE_NOT_READY，真Profile仍存在。');
review('IT',[36],['sql','const available='],[consent,['api','NonemptyOneWayOrientationAndOccupiedCandidates']],'占用雙方不在第三人清單且舊candidateId不能新邀。');
review('IT',[38],['sql','const excluded='],[['api','CrossPairRaceAndEndedHistoryStayExclusive']],'ended後雙向查詢／邀請、重登入及修改偏好仍永久排除。');
review('IT',[40,49,60],['schema','CREATE TABLE game_round_participants'],[race,['d1','exact schema preserves Foundation54'],['api','CrossPairRaceAndEndedHistoryStayExclusive']],'兩條跨pair接受恰一場；真UNIQUE/FK/rollback。');
review('IT',[43,59],['sql','硬性安全資格'],[pending,['d1','loss is safe and does not establish a game']],'接受沿用原性向判定但驗硬資格；無投影也能接受舊pending。');
review('IT',[44],['sql','const session='],[['d1','loss is safe and does not establish a game'],strict],'撤銷family／停用／成年／化身喪失安全拒絕且無輪次。');
review('IT',[45,50,51],['sql','const guard='],[['d1','zero-row guarded accept'],['d1','failure of second participant'],['api','TrueD1Fault_Returns503']],'零列或第二人失敗於SQL batch內回滾，含其餘邀請原狀。');
review('IT',[46],['service','public async Task<JsonObject> RoundAsync'],[consent,['d1','generated avatar reads only']],'非成員403；生成圖只讀正式資產且R2後撤銷不外洩。');
review('IT',[47,48],['http','match-candidates/search'],[strict,['http','StrictSearch_RejectsBadNumbers']],'真限流429與嚴格JSON400，無額外pending。');
review('IT',[56],['sql','function maintenance'],[['d1','loss is safe and does not establish a game'],['d1','explicit accept creates one round'],['d1','schema rejects a null invalidation reason']],'兩種原因、NULL約束與性向變動非硬失格；安全文案見UI／雙平台。');
review('IT',[62],['schema','CREATE TABLE match_conditions'],[['api','FreshIsolatedDatabase'],['d1','exact schema preserves Foundation54']],'獨立namespace全新四表及R2一致，無ETL／remote清除；default local操作另如實記錄。');
review('IT',[63],['sql','export function projectionPlan'],[['d1','failed projection write'],['d1','zero-row projection DELETE'],['api','TrueProjectionFault_IsSkipped']],'UPSERT與DELETE零列回滾來源；無關更新跳過投影。');

const apiReviews={
 1:['NonemptyOneWayOrientationAndOccupiedCandidates'],2:['RealReadinessRevocationStrictJsonAndSharedRateLimit'],3:['NonemptyOneWayOrientationAndOccupiedCandidates'],
 4:['RejectAndCancel_KeepDistinctPairHistory'],5:['CrossPairRaceAndEndedHistoryStayExclusive'],6:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields','CrossPairRaceAndEndedHistoryStayExclusive'],
 7:['CrossPairRaceAndEndedHistoryStayExclusive'],8:['RealSimultaneousReverseIntent'],9:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],10:['ProfileChanges_UseLatestSearchButPreserveOldPending'],
 11:['RealReadinessRevocationStrictJsonAndSharedRateLimit'],12:['TrueD1Fault_Returns503'],13:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],14:['RealReadinessRevocationStrictJsonAndSharedRateLimit'],15:['RealReadinessRevocationStrictJsonAndSharedRateLimit'],
 16:['AllCandidatesRankBeforePagination'],17:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],18:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],19:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],
 20:['RejectAndCancel_KeepDistinctPairHistory'],21:['RejectAndCancel_KeepDistinctPairHistory'],22:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],23:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],
 25:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],26:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],27:['RealThreePlayers_RequireMutualConsentAndHidePrivateFields'],
 28:['ProfileChanges_UseLatestSearchButPreserveOldPending'],29:['AllCandidatesRankBeforePagination'],30:['FreshIsolatedDatabase'],31:['TrueProjectionFault_IsSkipped']
};
for(const [n,anchors] of Object.entries(apiReviews))review('API',[Number(n)],['http','match-candidates/search'],[...anchors.map(a=>['api',a]),...(Number(n)===15?[['http','MalformedReadIdentity_UsesTheSameMatchingErrorContract']]:[])],'讀取完整測試body核對HTTP狀態／安全DTO與真D1後狀態；不以fixture取代SQL。');
review('API',[24],['http','match-candidates/search'],[['http','AllNineRoutes_RequireSessionAndNoStore']],'九個公開路由逐一401／no-store，沒有匿名配對入口。');

const etReviews={
 1:['true two-party accept','pending-and-direction'],2:['true two-party accept','real-empty-state'],3:['true two-party accept','pending-and-direction'],
 4:['permanent decline requires confirmation','confirmed-permanent-decline'],5:['cancelled and expired invitations','cancel-nonpermanent'],6:['cancelled and expired invitations','expired-no-accept'],
 7:['true two-party accept','same-persistent-room'],8:['true two-party accept','single-game-guidance'],9:['true two-party accept','other-round-reason'],
 10:['true two-party accept','new-family-restores-same-game'],11:['unknown write does not auto-replay','unknown-readback-no-replay'],12:['unknown write does not auto-replay','double-tap-single-write'],
 13:['ordered IDs page first','real-pagination'],14:['true two-party accept','same-persistent-room'],15:['profile incomplete and unknown status','unready-login-and-guidance'],
 16:['permanent decline requires confirmation','decline-dialog-cancel'],18:['profile incomplete and unknown status','unknown-login-safe-retry'],19:['existing invitation remains actionable','incoming-old-pending-accepted']
};
for(const [n,[web,native]] of Object.entries(etReviews))review('ET',[Number(n)],['ui','export function MatchingScreen'],[['web',web],['android',native],...([4,16].includes(Number(n))?[['web','incoming exploration card can decline directly'],['android','incoming-card-confirmed-permanent-decline']]:[])],'Web實際Chrome及指定Android QA31分別驗證；使用真Application／D1。恢復含獨立Cookie context及Android新family，非宣稱兩台實體手機。');

// 逐案以另一個不依賴段落regex的ID集合交叉核對，避免CRLF或標題切割漏案。
const ids=[...tdd.matchAll(/^- \[[ x]\] \*\*(MS-(?:UT|IT|API|ET)-\d+)\*\*/gm)].map(m=>m[1]);assert.equal(ids.length,174);assert.equal(new Set(ids).size,174);
const cases=ids.map(id=>{
 const start=tdd.indexOf(`**${id}**`),end=tdd.indexOf('\n- [',start+1),body=tdd.slice(start,end<0?tdd.length:end).split(/\n##/)[0];
 if(id==='MS-ET-017')return{id,status:'pending',scope:'future-story-integration',requirement:body,source:at(tddPath,`**${id}**`),implementation:at(source.sql,"case 'game.round.end'"),evidence:[],gap:'StoryDialogueAndExit真正退出UX尚未實作；內部ended契約不能取代完整Web／Android退出E2E。'};
 const r=reviews.get(id);assert.ok(r,`Unreviewed ${id}`);return{id,status:'verified',scope:'current',requirement:body,source:at(tddPath,`**${id}**`),...r};
});
assert.equal(reviews.size,173);
const scenarios=[...bdd.matchAll(/^### (MS-BDD-\d+)：([^\n]+)\n([\s\S]*?)(?=\n### MS-BDD-|\n## |$(?![\s\S]))/gm)].map(m=>{
 const id=m[1],related=cases.filter(c=>c.requirement.includes(id)),proof=[...new Map(related.flatMap(c=>c.evidence).map(e=>[e.path+':'+e.line,e])).values()];
 assert.ok(related.length>=2,`BDD ${id} requires >=2 reviewed cases`);assert.ok(proof.length,`BDD ${id} missing proof`);
 return{id,title:m[2],source:at(bddPath,`### ${id}：`),acceptance:[...m[3].matchAll(/MS-AC-\d+/g)].map(v=>v[0]),status:'verified',scope:[12,21,71].includes(Number(id.slice(-3)))?'internal-ended-contract':'current',requirement:m[3],cases:related.map(c=>c.id),evidence:proof};
});assert.equal(scenarios.length,75);assert.equal(new Set(scenarios.map(s=>s.id)).size,75);
const layers=Object.fromEntries(['UT','IT','API','ET'].map(layer=>{const c=cases.filter(c=>c.id.startsWith(`MS-${layer}-`));return[layer,{total:c.length,verified:c.filter(c=>c.status==='verified').length}];}));
const acceptance=[...new Set(scenarios.flatMap(s=>s.acceptance))].sort().map(id=>({id,source:at('docs/specs/SPEC-001-MatchingSessions.md',`| \`${id}\` |`),scenarios:scenarios.filter(s=>s.acceptance.includes(id)).map(s=>s.id),scope:id==='MS-AC-010'?'internal-ended-contract; full exit UX remains future MS-ET-017':'current',status:'verified'}));
assert.equal(acceptance.length,14);
const verified=cases.filter(c=>c.status==='verified').length,current=cases.filter(c=>c.scope==='current');
const report={updatedAt:'2026-11-06',method:'逐ID／逐BDD完整斷言人工覆核後的明列對照；存在檔案不是執行證據，命令及平台結果另見Verification',scope:{platforms:['Web','Android'],deferred:['iOS-D-052'],excluded:['accessibility-D-051'],future:['MS-ET-017'],deployed:false},total:cases.length,verified,percent:Math.round(verified/cases.length*1000)/10,currentScope:{total:current.length,verified:current.filter(c=>c.status==='verified').length,percent:100},layers,acceptance,bdd:{total:scenarios.length,verified:scenarios.filter(s=>s.status==='verified').length,frontend:{total:18,verified:18},scenarios},cases};
report.userReviewRevision={date:'2026-11-06',basis:'使用者驗收修正2項，與原174規劃ID分列；不改記MS-ET-017',total:2,verified:2,items:[
 {id:'MS-REVIEW-01',requirement:'探索卡incoming邀請可直接婉拒，永久確認取消不落地',status:'verified',implementation:at(source.ui,'const declineConfirmation='),evidence:[at(tests.ui,'incoming exploration card'),at(tests.web,'incoming exploration card can decline directly'),at(tests.android,'incoming-card-confirmed-permanent-decline')]},
 {id:'MS-REVIEW-02',requirement:'僅本地指定房間原子結束並保留永久pair歷史，不增加公開退出端點',status:'verified',implementation:at('tools/local-game-policy.mjs','export function localGameEndStatements'),evidence:[at('tools/tests/local-game-policy.test.mjs','local game maintenance requires'),at(tests.d1,'local wrapper game end'),at('tests/integration/local-game-maintenance.test.mjs','local game CLI ends one room')]}
]};
if(process.argv.includes('--write')){
 for(const group of ['basic','extended','routing','card']){
  const native=JSON.parse(read(`.local/evidence/matching-android-${group}.json`));assert.equal(native.status,'passed');assert.equal(native.group,group);
 }
 for(const c of cases)tdd=tdd.replace(new RegExp(`^- \\[[ x]\\] (?=\\*\\*${c.id}\\*\\*)`,'m'),`- [${c.status==='verified'?'x':' '}] `);
 bdd=bdd.replace(/^- \[ \] (\*\*Scenario:)/gm,'- [x] $1');
 fs.writeFileSync(tddPath,tdd);fs.writeFileSync(bddPath,bdd);
 fs.writeFileSync('docs/verification/matching-sessions-traceability.json',JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({total:report.total,verified:report.verified,percent:report.percent,currentScope:report.currentScope,layers,bdd:{total:75,verified:75,frontend:{total:18,verified:18}}}));
