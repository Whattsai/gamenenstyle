# MatchingSessions 實作與驗證紀錄

日期：2026-11-06。文件包為 [MVP](../requirements/MVP-001-LoveGameDatingApp.md)、[SPEC](../specs/SPEC-001-MatchingSessions.md)、[BDD](../bdd/SPEC-001-MatchingSessions-BDD.md)、[TDD](../tdd/SPEC-001-MatchingSessions-TDD.md)、[RiskAudit](../specs/SPEC-001-MatchingSessions-RiskAudit.md)。本輪MatchingSessions本地責任已逐項覆核173/173（100%）；完整原規劃173/174（99.4%），未覆核的後續Story退出E2E不改記通過。

## 責任與邊界

已接上真候選、雙向計分、九個受保護API、原子投影／邀請／單場輪次、登入分流與共用 Web／Android UI。房間沒有假對話、劇情、名片或真人照公開。StoryDialogueAndExit 的產品退出入口及 `MS-ET-017` 完整跨 SPEC Web／Android E2E 保留未驗；本模組只驗內部原子 ended 邊界。iOS依D-052暫緩，無障礙專項依D-051不列目前MVP範圍；staging／production未部署。

## Red → Green 證據

1. 純計分測試先因缺 `MatchingInput`／`MatchingScore` 失敗；實作後驗動態權重、對稱性、臺灣生日、22縣市與最後一次四捨五入。
2. 真 D1 測試先因缺0004失敗；後以真 SQL 注入接受UPDATE零列、第二筆participant UNIQUE衝突、投影UPSERT零列及DELETE零列。DELETE失敗補驗曾重現舊條件殘留，已改成分別核對「就緒時投影完全一致／失格時完全無列」，證明來源也回滾。
3. 九 API 登入防護先回404／400，接線後回401。數字／未知／重複鍵先回通用碼，再依失敗測試對齊 INVALID_MATCH_REQUEST。輪次查詢撤銷競態曾錯回空200，已加 Session 二次查核。
4. 共用UI先因缺畫面失敗；後補入不明寫入、等待方向、永久婉拒確認、兩種安全失效原因及分流。撤銷Session時舊候選仍呈現的失敗測試已修正；私人畫面立即隱藏。
5. 初始未完成Profile缺帳號入口的元件測試先失敗，補入保護未儲存編輯的「你的帳號」。最終稽核另重現登入恢復重試同時導向start與account，已修正非帳號頁一律走start；不再短暫繞過配對分流。
6. 非UUID遊戲輪次ID曾回通用INVALID_REQUEST，失敗HTTP測試證明與本模組契約不同；補入game-rounds錯誤投影，統一INVALID_MATCH_REQUEST。

## 本輪執行範圍

- Worker：真正 Miniflare D1／R2、固定 SQL、並行、FK／UNIQUE／rollback；HTTP fixture不替代此證據。
- HTTP：WebApplicationFactory＋真正 Application／獨立 Miniflare D1，至少3帳號；另有真 default local Worker／Linux Container／D1 的3帳號流程。真平台只用本輪新建的合成測試帳號，配額用盡時重用同批帳號，憑證與碼只在RAM，最後登出。
- Web：Chrome headless，trace／影片／截圖關閉；受控真 Application／D1，加上指定網路／到期故障。此類故障不冒充雲端或實際72小時等待。
- Android：明確指定 DatingHighQA31／emulator-5556／ADB5038，真 development app／SecureStore／Application／Miniflare D1；XML僅在RAM，不保存影片／trace／XML。
- 舊化身採用故障測試原以「兩條SQL」定位注入，加入原子投影後改成依當次 adopt 計畫定位；完整回歸結果另外記錄，不把測試定位修正當產品變更證據。

## 深度稽核結果與追溯

完整174個TDD ID、75個BDD（含兩個Outline全部Examples）及14個MS-AC逐一核對，原始斷言、文件行號、實作行號、測試行號及覆核理由保存在 [matching-sessions-traceability.json](matching-sessions-traceability.json)。[稽核工具](../../tools/audit-matching-traceability.mjs)明列逐案覆核對照，檢查唯一ID、至少兩層BDD追溯、14AC及錨點；不執行測試，也不因檔名／Trait存在自動批准。`node tools/audit-matching-traceability.mjs --write`可重建目前追溯，寫入前要求原三組及使用者修正card組Android通過紀錄。

| 層級 | 完整規劃ID覆核 | 範圍 |
|---|---:|---|
| Unit | 60/60 | 純計分、用例與元件；規劃明定的SQL斷言以更強真D1證據補驗 |
| Integration | 64/64 | 真Miniflare／R2；另有真Application與D1串接 |
| API | 31/31 | 九個端點、成功與安全拒絕／嚴格輸入／原子故障 |
| E2E | 18/19 | Web與Android各別驗證，MS-ET-017保留未驗 |
| BDD | 75/75 | 本份業務斷言；前端UX18/18 |

BDD-012／021／071與MS-AC-010的結束行為只驗本份固定內部ended命令、兩人釋放及永久pair，不含下一份Story的產品退出。原清單MS-ET-017仍為`[ ]`，因此完整比例99.4%，本輪責任範圍100%。沒有因iOS暫緩、無障礙排除或未部署雲端而將它們改記通過。

主要實作為 [純計分](../../backend/src/DatingHigh.Domain/MatchingScore.cs)、[Application用例](../../backend/src/DatingHigh.Application/MatchingSessionService.cs)、[固定SQL及投影](../../cloudflare/src/matching-commands.ts)、[四表migration](../../cloudflare/migrations/0004_matching_sessions.sql)、[共用畫面](../../frontend/client/src/MatchingScreen.tsx)。MVP／SPEC／BDD／TDD／RiskAudit及overview影響矩陣所有受影響文件均已同步；沒有新增產品外部服務或秘密設定。

## 可重跑命令與本輪結果

以下「通過數」是runner測試執行數，不等同上方完整規劃ID數。

| 命令／套件 | 本輪結果 |
|---|---|
| `npm run check:foundation` | exit0；tools24、.NET Unit269／Integration31／API173、Worker161、client170及雙方typecheck通過；其Foundation歷史報告仍accepted=false／scopedAccepted=true，不冒充整個MVP或雲端驗收 |
| `dotnet test backend/tests/DatingHigh.Api.Tests/DatingHigh.Api.Tests.csproj --no-restore` | 最後完整176/176通過，含真Application／D1及UUID錯誤契約補強 |
| `npm --prefix frontend/client test`／`run typecheck` | 最後171通過、typecheck通過；新增恢復分流失敗案例修正後通過 |
| `npm --prefix frontend/client run export:web`、`npm run build:e2e-host` | Web匯出／host建置成功，0警告／0錯誤（host） |
| `npm run test:web -- matching-sessions.spec.ts account-ownership.spec.ts profile-card-settings.spec.ts avatar-preferences.spec.ts --reporter=list` | 19/19通過；配對7、帳號4、個資名片2、原化身6；最終版本配對7/7亦再次通過 |
| 認證回歸：`foundation.spec.ts forms-matrix.spec.ts delivery-integration.spec.ts google-recovery.spec.ts restore-recovery.spec.ts reset-unknown.spec.ts refresh-lost.spec.ts pending-navigation.spec.ts deadlines.spec.ts logout-condition.spec.ts retry-matrix.spec.ts`（排除既定無障礙專項） | 69個不同案例最終皆有通過證據。首輪68/69，唯一失敗是deadline測試的Loading文字命中隱藏舊畫面；改成可見文字後，`deadlines.spec.ts`完整3/3重跑通過（46.6／33.8／34.1秒），未改期限或重送規則 |
| `node --test --test-concurrency=1 tests/integration/foundation-live.test.mjs tests/integration/matching-sessions-live.test.mjs` | 實際default local Foundation3/3通過；當次Matching註冊因已達共用配額回429，不計通過 |
| `DATINGHIGH_MATCHING_LIVE_REUSE=1 node --test tests/integration/matching-sessions-live.test.mjs` | 真Worker／Linux Container／D1配對1/1通過（32.3秒）；只經原wrapper固定無秘密view在RAM選取本輪`live-matching-[012]-時間@example.com`帳號，真登入／寫Profile／配對／登出，不清限流、不偽造provider |
| `DATINGHIGH_ANDROID_DEVICE=emulator-5556`、`DATINGHIGH_ADB_PORT=5038`、`DATINGHIGH_MATCHING_NATIVE_GROUP=basic / extended / routing`，逐組執行`node tests/e2e/android/matching-sessions.mjs` | 三組全部通過，basic5／extended8／routing5項功能檢查；不是18個不同測試ID |
| `dotnet test ...DatingHigh.Unit.Tests.csproj --filter FullyQualifiedName~Matching --collect:"XPlat Code Coverage" --results-directory .local/evidence/matching-coverage` | 33執行通過；Cobertura按來源行去重：MatchingScore55/55＝100%，MatchingSessionService107/108＝99.1%行覆蓋；不宣稱全專案／全部分支100% |

Android三組忽略的本機證據為 `.local/evidence/matching-android-{basic,extended,routing}.json`；只存平台、時間、通過檢查名稱。首輪UTC時間為2026-11-05T19:34:34（routing）、19:38:29（basic）、19:45:19（extended）；最終版本routing又於23:47:20重跑通過（臺灣均11-06）。Web恢復另含全新Cookie context登入同帳號讀回同一round；Android驗cold restore及登出後新family恢復，未宣稱兩台實體手機。

原化身回歸曾因D-053舊按鈕名稱及未過濾隱藏舊Profile欄位逾時；已將測試前置對齊「我的名片」、目前可見欄位與登入後明確開帳號頁，再完整19/19重跑通過。舊測試的假設修正不是產品成功證據。UI測試仍關閉trace／影片，原生XML只在RAM。既有真Google／實際收信的驗收不擴推本模組；本輪Google回歸使用受控SDK/provider，不冒稱新真OAuth證據。

最後真平台配對測試的三帳號均於finally登出；另透過wrapper固定accounts／sessions view只在RAM交叉核對，發現首輪失敗遺留的一個合成family，已以真登入撤舊及正常DELETE session清理。最終6個本輪matching合成帳號的未撤銷family數為0；沒有清除其持久輪次或任何其他帳號。local wrapper重啟後ready=200，未進行remote操作。

## 非正式資料重建與操作紀錄

default local 於本輪先套用0004。後續真D1稽核重現 CHECK 接受 NULL 的缺口，補嚴 invalidated_reason、ended_at 及 canonical性向集合；這是尚未發布的四表建表基線，不新增ETL／額外欄位。重建前以原wrapper只讀匿名聚合，確認 conditions=3、invitations=2、rounds=1、participants=2，全部屬本輪合成帳號，關聯媒體=0、非fixture資料=0。

操作失誤亦保留：第一次備份名稱超過wrapper允許長度而被拒絕，但後續四表重建仍執行，**沒有成功的重建前配對測資備份**。實際guard先重新核對資料範圍，再只DROP／重建四表；其他八表與R2不在變更SQL中。清掉的是上述可重建合成配對紀錄，沒有清除既有帳號／個資／私人媒體。完成後已用短名稱補存當前schema備份於忽略的 `.local/backups/matching-review-20261106.sql`，不能將它當作重建前備份。重建後四表均為0、FK check為空；後續測資由真HTTP／隔離harness重新建立。

隔離Miniflare測試則每輪明確清理同namespace四表、測試來源與R2，來源與私有媒體範圍一致。沒有操作remote／SIT／production，沒有掃除其他專案或未指定資料。D1多句batch回滾行為依 [Cloudflare官方契約](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) 並以實際故障注入核對；零列UPDATE／DELETE仍由SQL guard額外封閉。

## RiskAudit 逐項對照

| 風險 | 實作／本地驗證重點 | 責任邊界 |
|---|---|---|
| RA-01／17 | participants.account_id UNIQUE；跨pair並行只一場，另一批無孤兒round／participant | 真Miniflare，非HTTP mock |
| RA-02 | accept零列、第二participant衝突、投影UPSERT／DELETE零列及end零列均在SQL內失敗回滾 | 不依提交後檢查假稱回滾 |
| RA-03 | 排除鍵只用排序accountId pair，declined／ended歷史不由Profile異動清除 | 不追查真人／跨新帳號身分 |
| RA-04 | 兩種受控原因、NULL CHECK與安全文案；不是declined | 不公開新對象或私人變更 |
| RA-05 | 專用受限 reader，候選GET再次授權；R2後重驗 | 不偽造RoundId，不解鎖原照／名片 |
| RA-06／16 | 新操作查當前conditions；舊pending即使無conditions仍可接受，硬資格另驗 | Session撤銷／account／成年／化身仍拒絕 |
| RA-07 | 22縣市固定版本、同代碼0、最近地區、外島／中性50 | 代表點，不是GPS／住址 |
| RA-08 | 空集合／無共同生活欄位0，選填面向正規化、最後一次round | 分數不當成功率 |
| RA-09 | 接受同批失效兩人所有incoming／outgoing，第三人不永久排除 | 端點只回安全enum |
| RA-10 | 72h含等號、冪等鍵／反向意願、partial UNIQUE釋放 | 時間由server決定 |
| RA-11 | 九端點成功／登入／嚴格JSON／所有權與no-store；真Application＋D1串接 | fixture僅供HTTP故障定位 |
| RA-12 | 本機1,002名候選，固定4條SQL、完整集合後排序分頁；本機耗時閾值驗證 | 未以本機結果宣稱雲端D1費用／SLA |
| RA-13 | 內部ended及兩人釋放原子邊界 | MS-ET-017仍待後續Story真退出UX |
| RA-14 | 永久婉拒提示，取消確認不送decline | Web／Android分別記錄 |
| RA-15 | 來源CAS與條件投影同batch；無關個資／照片排序不碰conditions | 無source_profile_revision |
| RA-18 | 全量排序後分頁，前端當張＋最多3張預載，GET安全persona | 不承諾跨頁快照 |
| RA-19 | 未就緒／空閒就緒／遊戲中分流，未知API保留重試 | 不以錯誤當ready |
| RA-20 | 指定local四表範圍guard與隔離D1／R2fresh重建 | 備份失誤如實記錄，未觸遠端 |

## 2026-11-06 使用者驗收後修正：婉拒入口與本地結束

先前婉拒後端與邀請列表已存在，但探索卡incoming只有接受，屬入口缺漏。本輪補上探索卡的「婉拒邀請」，就近顯示相同永久確認；保留邀請不送decline，切換候選會清除舊確認。元件先驗缺按鈕失敗，再通過取消與確認兩條真行為；Web8/8配對及Android card組2項檢查均通過。Android時間2026-11-06T00:23:58Z，沒有保存UI XML／trace／影片。

正式產品目前仍無退出UI。本輪新增`npm run game:list:local`與`npm run game:end:local -- --round-id UUID`，僅經既有wrapper對已知local instance執行固定SQL。新工具不讀token或私人照片；暫停該instance寫入，同一batch確認兩人占用、ended與釋放，恢復後等待ready。未知UUID房間、零更新／零釋放或錯誤人數均拒絕或整批回滾。原邀請及ended歷史保留，所以原pair永久不再配；不是同pair重置工具。

新增的[政策測試](../../tools/tests/local-game-policy.test.mjs)、[真CLI測試](../../tests/integration/local-game-maintenance.test.mjs)與Worker真D1四個故障／成功案例通過。實際Wrangler CLI在自行新建named instance證明回滾、未知房間安全失敗、兩人釋放、其他房間保留、冪等及帳號不刪；目錄最後經realpath核對後只清理自身測資。default只執行game list唯讀驗證，**未自動結束使用者現存房間**。

本修正結果：tools26、Worker165、client172、兩方typecheck、Web配對8、Android card組與實際CLI測試均通過。沒有改API／DTO／DB schema／環境秘密，依overview矩陣更新模組地圖、檔案放置、工作流及本地部署操作；其餘分層／相依／產品runtime契約不變。追溯JSON的`userReviewRevision`另列2/2；不混入原174 ID，更不將本地結束當成MS-ET-017完整產品退出通過。

## 2026-11-06 免費化身跑版與結束後停留房間

使用者確認Web按下一位到第二張免費化身會跑版，AI圖不會。真Web量測先重現比例約4.993而非4/3；原因為內建Image帶原始尺寸，height未明訂而覆蓋aspectRatio。產品只在MatchingScreen.tsx改為獨立3:4容器、Image絕對填滿且contain，原圖／AI／資料不變。

另重現本地已無active房間但舊頁仍停留：元件403測試及真D1結束後Web回焦測試先失敗，再補前端403轉/start重驗、Web focus重讀。503仍保留重試；沒有改動結束SQL或開放產品退出端點。測試host的matching-end只在既有受控E2E模式、驗控制key後調用原內部end契約。

驗證：client完整174及typecheck通過；Web共12個不同案例最終通過，其中10項於完整批次通過，內建／data URL兩個版面案例修正測試收尾後補跑2/2通過。量測360與1200寬、前後人物及分頁、兩位邀請者；data URL僅用既有無個資插畫驗傳輸格式，不是新AI provider驗收。已目視核對忽略的matching-built-in-fixed.png。Android layout組於2026-11-06T02:50:41Z通過第一／第二張免費化身完整可視邊界3:4、結束刷新返回探索、ended深連結不困住房間三項檢查；XML僅RAM。

測試收尾曾因移除全部路由而破壞受控登入前置，已改成只移除圖像格式替換路由並等待其請求。測試錯誤處理亦避免輸出請求標頭；曾出現的臨時host憑證已隨該host關閉失效，未另存憑證檔案。這是測試框架修正，不列成產品行為證據。

本次只有MatchingScreen.tsx為產品變更；其餘為元件測試、Web／Android E2E及受控HostMain，另同步此紀錄、runtime概覽與原追溯行號。API／DTO／schema／套件／秘密均無變更；MS-ET-017仍不改記通過。
