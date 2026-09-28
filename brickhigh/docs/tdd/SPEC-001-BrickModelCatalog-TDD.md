# SPEC-001-BrickModelCatalog TDD 測試清單

> **來源**：[BDD 場景文件](../bdd/SPEC-001-BrickModelCatalog-BDD.md)
> **規格**：[SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md)
> **需求**：[MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
> **生成日期**：2026-09-09
> **狀態**：2026-09-28 `$mighty-pm $well-done` 階段式續作中；Gate 1 的20件內部 Player 外觀方向已由使用者確認並授權進入 Gate 2。Gate 2 固定同20件補 Ready 品質契約，目前 0/20 Ready；正式逐項計數為 TDD 79/233（33.9%；74 UT、2 IT、2 CT、1 ET）、BDD 5/56（8.9%）、UX 1/20（5.0%）、SPEC 完整驗收條款 2/36（5.6%）。本次階段確認不等同正式 `visualBaselineId`，合格 Preview 與全量 Release 尚未完成。

### 2026-09-28 階段式 Gate 1 → Gate 2 續作紀錄

使用者已實際確認20件內部 Player 的外觀方向並回覆可繼續，因此 **Gate 1 階段完成**；此決策只授權繼續品質開發，不將 F-Catalog、`Unknown` 生產狀態或未 Ready revision 提升為正式視覺基準。`ET-020`／`SC-054` 仍需未來綁定真實 Ready revision 的 `visualBaselineId`、版本 digest、核准日期及缺陷回歸流程，故正式 TDD／BDD／SPEC 計數不因本次確認增加。

Gate 2 固定原8件加新增12件共20件，不再擴增模型數量。第一個 Red-Green 切片針對 SPEC §4.3 的碰撞／插接空腔缺口：`tools/catalog/metadata_quality.py` 新增 fail-closed `collisionProxy` 驗證，要求 schema／coordinate profile／evidence、合法 box 或 convexHull 簡化形狀；需要 connectors 的模型還必須具可追溯且 `Pass` 的 cavity/pairing evidence，無接點模型則須說明無空腔檢查原因。`tools/catalog/tests/unit/test_metadata_quality.py` 與 `test_quality_report.py` 已補對應正反 fixture，`tools/acceptance/audit_internal_model_set.py` 亦新增 `gate2Issues`／`gate2Ready`，避免 `mechanicalPass` 被誤解成 Ready。

MCP 現已提供固定 Python runner；Gate 2 collision／metadata 契約的 catalog 回歸 **159/159 passed**，完整 Python 回歸 **195/195 passed**。`SC-008` 的版本化 connector profile 配對、必要接點與插接空腔已完成 Red-Green：.NET core **140/140 passed**，`.NET Standard 2.1` 相容建置 0 warning／0 error；先前 Unity Package Manager IPC 阻塞已解除，最終 EditMode 確實進入 Test Runner 並 exit 0。`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs` 亦已由真正 PlayMode assembly 執行 `RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract`，使用 glTFast 匯入真實 3001／3298／3005 GLB，核對 3001 尺寸、3298 非對稱性、3005 stud 與 3001 八個 cavity probes，非 0-test 且 exit 0。依本文件單元層定義，`UT-022～024` 已具完整隔離規則證據而升格完成；`IT-004` 仍保持部分符合，因 SC-007 的 mesh／normal／winding 全矩陣、SC-008 的完整代表配對矩陣及 SC-029 的 texture／preview 資產預算實證尚未閉環。Gate 2 可視化狀態頁為 `artifacts/acceptance/pm-20260928-interactive-20-a/gate2-readiness-review.html`，目前仍為 **0/20 Ready**：原8件主要缺完整 metadata／collision／Active 生產證據及來源貨號交叉核對；新增12件主要缺獨立 reference dimensions、必要 connectors／collision 及 Active 生產證據。下一步維持固定20件，補齊逐件 reference dimensions、connectors／collisionProxy、來源與 Active 生產證據，並完成 `IT-004` 剩餘矩陣；不自行填造模型尺寸、接點或生產狀態。

### 2026-09-27 Mighty PM 續作紀錄（完成契約 v1）

本次使用者以 `$mighty-pm $well-done` 明確重新啟動 `SPEC-001` 開發，取代上方歷史階段停止指示；70/233、5/56、1/20、2/36仍是本輪開始前的逐項稽核基線，不因啟動而增加。交接狀態為 `Ready for well-done`，五份文件可讀且既有風險方案已確認。起始工作樹乾淨。其他 SPEC、正式人物／庫存／房屋／賽車玩法不在本輪範圍。

使用者已實際檢視 `C:/bh-qa-wd/20260926-c/BrickHighLauncher.exe` 的八件內部預覽，回覆「方向可接受，繼續逐件驗證」。此回覆確認目前模型外觀、材質、光照與繁中畫面的**方向**，授權繼續逐資產檢查；八件仍為 F-Catalog 探索樣本。尚未形成綁定正式 Ready 資產版本、RuntimeBuild、六視圖與逐件審核的 `visualBaselineId`，故 ET-020／SC-054 仍待正式驗收。

| ID | 來源與交付／完成條件 | 負責人與寫入範圍 | 依賴／狀態 | 驗證與風險處置 |
|---|---|---|---|---|
| P0 | Phase 1；核對交接、36 AC、56 BDD、233 TDD 與工作樹 | 主代理；本文件與整合文件 | 無／完成 | 交接狀態與五份文件核對，逐項引用既有矩陣；本輪重新驗證另列 |
| P1 | 模型來源與品質證據路徑；確認合格 Ready Preview／全量缺口 | source_model，GPT-6-Astra medium；主代理整合 | P0／來源盤點完成 | 原八件仍是 F-Catalog；新增官方 Rebrickable CDN 12 份 CSV 候選來源及 SHA manifest，`parts` 64,675 列、`inventory_parts` 1,558,301 列；CSV 不證明生產 Active，完整 Ready／指定硬體仍缺 |
| P2-M | 使用者補充優先目標：增加實體積木模型數量並逐件驗證 | source_model，GPT-6-Astra medium；`artifacts/models/pm-20260927-expansion-v1/`；主代理 Player 整合 | P1／20 件內部驗證完成、Ready 仍有缺口 | 新 12 件及原 8 件共 20 件，Khronos 0 error／0 warning；Player 20/20 載入與操作、382 張畫面，逐件稽核 `machine-audit.json` 無機械驗證錯誤；仍 `Unknown`／非 Ready |
| P2-C | Phase 2 目錄品質、Ready／發布門檻的可測實作 | catalog_quality，GPT-6-Luna max；`tools/catalog/**` | P0／寫入完成、全回歸與稽核中 | 報告逐 bytes 驗證；聚焦 44 passed，合成 Ready 正例仍 `fixture-content`、V=0、releaseAllowed=false；全 Python 由主代理執行 |
| P2-U | Phase 2–3 既有預覽 UI 的可測缺口 | ui_ux，GPT-6-Luna max；`Presentation/**` 與 `CatalogPreviewViewTests.cs` | P0／整合驗證完成、UX 稽核中 | 缺字警示、錯誤畫面／鍵盤離開／查詢映射；焦點矩陣聚焦 21/21，全 EditMode 163/163；UT-105 仍部分符合 |
| P2-S | Phase 2 存檔備份、遷移與明確還原人工 fixture | 主代理 `tools/acceptance/save_fixture_recovery.py`、`verify_save_fixture_recovery.py`及其測試；save_policy，GPT-6-Luna max，專屬 C# 政策／測試 | P0／整合驗證完成、契約稽核中 | 真 SQLite/WAL、故障／選擇矩陣14項通過；獨立 CLI 四種選擇報告於 `artifacts/acceptance/pm-20260927-save/`；完整 .NET 131/131、相容性建置 0 警告錯誤、Unity 163/163 |
| P3 | Phase 2–3 封裝、離線 Player、效能與正式來源驗收 | 主代理；安裝／驗收工具 | 20 件內部包重驗完成、正式門檻待補 | `pm-20260928-player20-build.log` 成功；全新隔離安裝 `C:/bh-qa-wd/20260928-20-a`、launcher exit 0、382 張真實 Player 圖及 20/20 操作探針 success 見 `artifacts/acceptance/pm-20260928-interactive-20-a/run.json`；仍為 F-Catalog，指定硬體與全量資產待補 |
| P4 | Phase 4–5；逐項深度稽核、缺漏回寫、補實作與重驗直到符合 | 主代理整合，可再派不重疊工作 | P1–P3／進行中 | 基線 36 AC／56 SC／233 TDD 已逐項核對；本輪目錄、UX、存檔增量分別唯讀稽核，主代理整合重算；缺正式來源／硬體者保留未完成 |
| P5 | Phase 6；完成契約逐項驗收與最終交付 | 主代理；TDD／BDD／overview | P4／待開始 | 僅可驗證項目標為完成；未驗收保留精確缺口與下一步 |

### 八件內部樣本逐件證據（2026-09-27）

對 `artifacts/acceptance/wd-20260926-interactive-c/PlayerEvidence/frames/` 的八件、共 48 張六方向 Player PNG 逐張目視核對；模型均有對應輪廓，斜磚左右斜面方向不同、torso 正面印刷及側孔、透明件前後／底面結構、axle 十字端面均可辨。這只是在現有顯示大小下排除明顯空白或缺件，不能取代來源參考圖逐像素／尺寸／材質對照。八件 `model.glb` 重新以 `node tools/catalog/validate_glb.cjs` 驗證，報告各有 `modelSha256`／`modelByteLength`，皆為 0 error／0 warning，保存於 `artifacts/acceptance/pm-20260927-eight-glb/<樣本>/khronos-report.json`。這證明現有 GLB bytes 可通過結構驗證，尚不證明接點、物理、來源授權及正式 Ready。

| 樣本來源 | Player front／bottom 畫面 | 本輪目視與下一個逐件門檻 |
|---|---|---|
| 普通磚 `3001.dat` | `frame00058`／`frame00063` | 四顆正面可見 stud、底部三個管位；待接點座標、碰撞與來源顏色比對 |
| 薄板 `3020.dat` | `frame00134`／`frame00139` | 薄板高度與底部管位可見；待板高 reference 與上下配對測試 |
| 透明磚 `3001.dat` 色47 | `frame00001`／`frame00006` | 透明正背面與底部結構可見；待色47材質與遮擋、缺材質反例 |
| 印刷 torso `973p06.dat` | `frame00020`／`frame00025` | 正面衣紋、頸部與底部輪廓可見；待印刷來源比對及頭／臂／腰錨點 |
| Technic pin `2780.dat` | `frame00115`／`frame00120` | 中央環與軸向空隙可見；待接收孔配對、插入深度與自由度 |
| Technic axle `3705.dat` | `frame00077`／`frame00082` | 軸外形可見；待十字截面／方向、接收件與非法 profile 反例 |
| DUPLO `3437.dat` | `frame00096`／`frame00101` | 正面雙 stud 與底部腔體可見；待 DUPLO 接點尺度及跨系列拒絕 |
| 非對稱斜磚 `3298.dat` | `frame00039`／`frame00044` | 正面斜面與底部管位可見；待非鏡像方向、面法向／繞序及碰撞 |

來源模型資料夾仍缺逐件 `metadata.json`、獨立尺寸 reference、canonical profile、connectors、collisionProxy、characterAttachments 與 attribution；安裝版 DB 的 `readyAsset=false` 保持不變。舊 Player 報告 `visualApproved=false` 不覆寫；使用者本輪只批准視覺方向。

使用者補充無本機 CSV，並明確要求工作目的包含持續增加建模數量。主代理已直接從 Rebrickable 官方 CDN 取得 12 份 bulk CSV，`artifacts/sources/rebrickable-20260927/download-manifest.json` 保存來源 URL、欄位、列數、byteLength 與 SHA-256；`model-candidate-crosswalk.json` 對新增批次 12 個 part_num 全部精確匹配 `parts.csv.gz`，另列套裝年份與顏色作候選旁證。`4085c` 最新套裝年份為 2019，特別保留停產待查；任何套裝年份或 CSV 行都不自動給 `Active`。新批次仍需外觀、尺寸、接點、來源授權和生產狀態逐件確認。

### 新增十二件逐件幾何證據（2026-09-27）

批次索引 `artifacts/models/pm-20260927-expansion-v1/handoff-manifest.json` 記錄每件來源、GLB／metadata／verification／CSV 對照 SHA-256；逐件重新核對 12/12 檔案及 hash 無誤。每件都有來源依賴與署名、`model.glb`、`conversion.json`、`metadata.json`、`khronos-report.json`、`verification.json`、六方向 PNG 與 preview。Blender 轉換及 Khronos 結果為 12/12 成功、0 error／0 warning，共 72 張六視圖及 12 張 preview；已逐件目視 preview，其中 `6060` 再看六視圖確認完整拱形、兩個 stud 與底部腔體。這些證據只支持可辨識幾何；`readyAsset=false`、`productionStatus=Unknown` 保持不變。

| 零件／顏色資料夾 | 可辨識的幾何 | 下一個逐件門檻 |
|---|---|---|
| `3700-colour7` | Technic 側孔磚 | 孔徑、軸／pin 配對、接點及碰撞 |
| `4032a-colour4` | 圓板與中央十字孔 | 孔形、四 stud 與上下插接尺寸 |
| `3069b-colour14` | 平面 1×2 tile | 厚度、底部腔體與來源顏色 |
| `4085c-colour7` | 1×1 直立夾件 | 來源生產狀態先確認；夾口配對與彈性空間 |
| `30374-colour4` | 細長圓 bar | 直徑、長度、夾件相容及碰撞 |
| `14417-colour7` | 側向球頭板 | 球徑、球心座標與球窩配對 |
| `14418-colour7` | 側向球窩板 | 開口／腔體及球頭旋轉自由度 |
| `11211-colour4` | 側向雙 stud 磚 | 側向接點、垂直方向與底部結構 |
| `2456-colour14` | 2×6 普通磚 | 12 stud 位置、底部管位及接點矩陣 |
| `6060-colour4` | 曲線拱件 | 獨立尺寸、拱內碰撞空間與兩端支撐 |
| `3005-colour14` | 1×1 普通磚 | 單 stud／底部空腔及上下配對 |
| `6141-colour4` | 1×1 圓板 | 圓形接點、厚度及底部管位 |

上述各件的 `metadata.json` 明列獨立尺寸、接點／碰撞、來源顏色與 Unity Runtime 驗證待補；CSV 精確貨號對照不證明所選 LDraw 顏色等同 Rebrickable 顏色，也不證明仍在生產。

### 二十件內部 Player 與非外觀逐件稽核（2026-09-28）

使用者補充本階段只親自確認**外觀品質**，其餘驗證由主代理負責；第二批增量建模已停止，範圍固定為原 8 件加新增 12 件。全新 Win64 安裝包 `artifacts/acceptance/toolchain-20260928T051404-cd46ec63/Package/` 經原生安裝器裝於 `C:/bh-qa-wd/20260928-20-a`，`BrickHighLauncher.exe` 啟動成功。`artifacts/acceptance/pm-20260928-interactive-20-a/run.json` 記錄安裝與 launcher exit 0；`PlayerEvidence/result.json` 為 success=true、20/20 載入、各件六方向與 12 步旋轉縮放重設、382 張 PNG，含鍵盤、空搜尋與直式重排。Player 於 Intel Iris Xe／Direct3D11／Linear 色彩空間執行，這不是 SPEC 指定效能設備。

`python -m tools.acceptance.audit_internal_model_set` 依包內 `SourceEvidence/<index>.json` 與 Runtime SQLite 對 20 件逐一核對：來源依賴及授權標頭 hash、GLB 與 conversion／包內來源證據 hash、非空 mesh／三角形／材質、重新執行 Khronos 0 error／0 warning、六方向 Player PNG、操作與 runtime 貨號／`Unknown`／非 Ready。新增 12 件來源六視圖 hash 也核對。結果 `artifacts/acceptance/pm-20260928-interactive-20-a/machine-audit.json` 為 **20/20 mechanicalPass**；封裝 `package-integrity.json` 為 222/222 package 檔、216/216 安裝 Player 檔 hash 相符。`manual-visual-review.html` 提供每件七張實際 Player 畫面，外觀結果由使用者填判，報告保留 `visualApproved=false`。

此處的 mechanicalPass 不等於 Ready。主代理依 `inspect_metadata` 確認原 8 件缺模型品質 metadata；新增 12 件皆缺獨立 reference dimensions 與必要 connectors；20 件皆無已驗證的 collisionProxy 與生產 Active 證據，包內 coverage 為 C=20、A=0、U=20、G=20、V=0，`scope_reviewed=false`。這些是主代理後續要補的非外觀門檻，不轉交使用者視覺判定，也不把人工外觀回覆當作它們的通過證據。

### 本輪整合測試與驗收證據

- `dotnet test tools/tests/BrickHigh.Core.Tests.csproj --nologo --verbosity quiet`：Gate 2 最新完整重跑 **140 passed**；`dotnet build tools/tests/BrickHigh.Core.Compatibility.csproj --nologo --verbosity quiet`：0 warning、0 error。
- Unity：先前 SC-008 增量的 UPM IPC 啟動逾時已解除。最終 `brickhigh-unity-editmode-test`（job `e2aafda9-1ab9-4873-ac09-dce955ead5ed`）確實進入 Test Runner、exit 0；真實 `brickhigh-unity-playmode-test`（job `644ee8de-b5b9-46b3-b760-f3b206e9faba`）亦為非 0-test、exit 0，執行 `CoordinateAndConnectorTests.cs::RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract` 並實際以 glTFast 載入 3001／3298／3005 GLB。前輪完整 EditMode 基線 `pm-20260927-unity-final.xml` 的 **163/163** 仍保留作既有回歸證據。
- Python Gate 2 聚焦 catalog 回歸為 **159/159 passed**；完整 `brickhigh-python-test` 最新重跑為 **195/195 passed**。其中既有真 SQLite F-Save 備份、遷移與還原 14 項仍保留；四種無選擇／取消／注入失敗／明確確認的 CLI 原始報告在 `artifacts/acceptance/pm-20260927-save/`。
- 新 Win64 20 件內部包 `artifacts/acceptance/toolchain-20260928T051404-cd46ec63/` 建置成功；`artifacts/acceptance/pm-20260928-interactive-20-a/run.json` 記錄全新隔離安裝、launcher exit 0、Player 操作探針 success 與 382 張真實畫面。這仍為 F-Catalog，`readyAsset=false`／`visualApproved=false`。
- `git diff --check` 無空白錯誤，只有工作樹既有 LF／CRLF 轉換提示。

### 本輪 Phase 4–5 逐項稽核與進度重算

以 2026-09-27 原 233 項逐項矩陣為基線，重新核對本輪改動所涉及的目錄、錯誤結果、存檔、UI 與 Player 項目；未改動項保留既有逐項證據及缺口。前段嚴格升格六項：`UT-011`、`UT-058`、`UT-060`、`CT-009`、`CT-011`、`ET-017`；本次 Gate 2 再依單元層原始完成條件與 Unity 實證升格 `UT-022`、`UT-023`、`UT-024`。結果為 **79/233（33.9%）**，其中 79 符合、122 部分符合、32 未符合；分類為 74 UT、2 IT、2 CT、1 ET。`IT-004` 因完整真實資產矩陣仍缺而保持部分符合；Gate 2 readiness 仍是 0/20。BDD 仍 **5/56（8.9%）**，UX **1/20（5.0%）**，SPEC 完整驗收條款 **2/36（5.6%）**。報告型品質門檻有本機合成正例，但沒有真實 Ready 模型；不能因此提升 SC-004、SC-054 或正式 Preview／Release。使用者接受方向不能替代 ET-020 所需 `visualBaselineId`。

開發與稽核的剩餘主路徑：取得具完整範圍與生產狀態的來源資料 → 為各來源變體建立可追溯模型、reference dimensions、接點／碰撞及外觀／授權覆核 → 逐件 Ready 與正式六視圖基準 → Frozen staging／RuntimeBuild → 合格 Preview／全量 Release → 指定 GTX 1660／i5-10400／16GB／SSD 與故障情境重驗。現有主機為 Intel Iris Xe／i5-13500H／約24GB，僅有本機替代證據。缺少的來源與硬體不以 F-Catalog 或本機 FPS 推定。

關鍵路徑：交接核對 → 可驗證品質與預覽／存檔實作 → 真實 Player／安裝與來源、硬體驗收 → 全項稽核／返工 → PM 接受。共享 Unity 專案、文件與執行環境由主代理排程。主要風險為缺全量來源、逐資產外觀核准、指定效能基準機；觸發時由主代理保留原門檻、記錄本機替代證據和恢復條件，不偽稱達標。

## 🎯 開發進度總覽

### 2026-09-27 續作前全項稽核基線

本次已逐項核對36個AC、56個BDD場景與233個TDD項目；稽核完成不等於缺漏修復完成。下列數值是本輪續作前基線，後續實作與驗證完成後逐項重算。使用者已回覆視覺方向可接受並要求繼續逐件驗證。

TDD 70/233（30.0%；68 UT、2 IT、0 CT、0 ET）；BDD 5/56（8.9%）；UX 1/20（5.0%）；SPEC 完整驗收條款 2/36（5.6%）。這是驗收項目完成率，不是整個MVP或模型資產的完成率。233項中70項已符合、128項部分符合、35項未符合；部分符合不給半分。每列的實作、斷言位置、缺漏、優先級及補測名稱見本文件末尾「2026-09-27 逐項證據矩陣」。

相對9/26舊50/233，補記22項既有成果、撤回UT-060及UT-095，共淨增20項，沒有新增功能。UT-060僅證明結果互斥，任意message仍可直傳；UT-095已驗共享／取消，但失敗載入後的完整handle回收證據不足。

稽核採用9/26既有最後回歸：Python 173/173、Unity EditMode 129/129，皆0失敗／0略過；本次只讀斷言與結果檔，沒有把它們描述為9/27重新執行。Player版本`20260926T025815-ef8f8371`的154張畫面及成功結果只作其實際範圍證據。SC-037空搜尋→清除→恢復清單可完整核對，因此UX由0/20調整為1/20；不代表模型外觀已核准。

目前高優先缺口：真正Ready品質報告與Unity驗證／發布封裝、接點／碰撞與候選用途、存檔一致備份／還原、完整引用及失敗／取消矩陣。中優先驗收工作：逐變體外觀／字型故障與核准流程、固定profile效能及記憶體量測。原需求門檻不變；全量來源與指定設備未取得，仍保留未驗收。

下列9/26及更早段落是當時紀錄，舊百分比與「尚未全項稽核」不作目前總覽。使用方式與分層統計已按本次矩陣重算。

### 2026-09-26 階段交付與使用者要求停止（歷史紀錄）

使用者明確要求「完成階段成果後停下，告訴我可以實際視覺驗收的部分再繼續」。本輪在下列驗證收尾後停止，不再啟動下一階段；待使用者視覺驗收回饋後續作。這是使用者指定的階段界線，不是100%驗收或外部阻斷結論。

- 可直接人工操作：`C:/bh-qa-wd/20260926-c/BrickHighLauncher.exe`，版本`20260926T025815-ef8f8371`。正常啟動無自動驗收環境變數，因此持續顯示、不自動退出。
- 本次可視覺驗收：8個LDraw幾何樣本（含透明件／人物印刷組件）、材質與光照、繁中字型、搜尋／清除與清單、滑鼠旋轉縮放重設、鍵盤Tab／Shift+Tab／方向鍵／Enter、720×960直式重排。樣本不等於完整未停產模型庫；逐件品質及使用者外觀核准尚未完成。
- 真正Player證據：`artifacts/acceptance/wd-20260926-interactive-c/run.json`、`PlayerEvidence/result.json`與154張PNG；安裝0、launcher0、success=true。已檢視橫式`frame00000.png`與直式`frame00153.png`；所有畫面都保留內部測試提示，visualApproved=false。
- 最終Python：`python -m pytest -q --junitxml=artifacts/test-results/wd-20260926-stage-final.xml`，173 passed／0 failed／0 skipped（103.76秒）。最終Unity EditMode：`wd-20260926-ui-verified.xml`，129 passed／0 failed／0 skipped（38.03秒）；之後僅擴大內部Player驗收按鍵腳本並成功重建／安裝，不再修改UI產品邏輯。
- 額外品質修復：`validate_glb.cjs`及`glb.py::verify_validator_report`綁定模型SHA-256／長度、固定validator版本並拒絕不完整／警告報告；`wd-20260926-validator-binding-red.xml`缺modelSha256 → green 21 passed。`building.py::_snapshot_fence`在準備後及交易提交前核對Frozen版本，`wd-20260926-snapshot-race-red.xml`2 failed → green 28 passed。原始LDraw依賴及LDConfig一起存入不可變revision manifest，`wd-20260926-build-source-archive-red.xml`缺來源bytes → green 11 passed；重試同樣重驗原始封存。
- 文件包沿原交接：`docs/requirements/MVP-001-V1Version.md`、`docs/specs/SPEC-001-BrickModelCatalog.md`、本TDD、對應BDD及既有RiskAudit；本輪更新TDD／BDD與`overview/README.md`。完成度仍49/168 UT＋1/29 IT＋0/14 CT＋0/22 ET＝50/233（21.46%）；BDD 3/56，UX 0/20完整驗收，尚未宣稱Phase 4全項稽核完成。

### 2026-09-25 well-done 續作與追溯（歷史紀錄）

本輪沿 Ready 交接與既有五份文件，保留前輪未提交實作；僅開發 SPEC-001。按 checklist ID 計算完成度，不以測試 cases 代替。本節是新增項目及修復核對，不是 Phase 4 全233項深度稽核結案。

| 項目 | 實作／測試證據（相對brickhigh） | 結論 |
|---|---|---|
| UT-001～003／SC-001 | `tools/catalog/importing.py:210`；`tools/catalog/tests/unit/test_sc_001.py:39`、`:56`、`:79`；`tests/integration/test_source_import.py` | 單元層完成：hash／日期／系列展開、附件排除、缺頁及缺系列G；非真實全量來源 |
| IT-001／SC-001～003 | `tools/catalog/resolving.py:77`、`cli.py`、`schema.sql`；`tests/integration/test_catalog_resolve.py:178`及同檔三態／故障矩陣、`test_source_import.py`、`test_sc_001.py`～`test_sc_003.py`（tests相對tools/catalog） | 真CLI→檔案→SQLite矩陣完成：跨來源候選、外觀ID、映射衝突、基準日三態、變體獨立、FK／integrity及回滾；受控離線fixture |
| import CLI／來源封存 | `tools/catalog/cli.py`、`importing.py`；`wd-20260925-import-red-v2.xml`、`wd-20260925-import-storage-red.xml` → `wd-20260925-import-green.xml` 12 passed | 補入口、工作鍵冪等、相對storage key與全新DB；憑證URI仍拒絕 |
| resolve CLI／不可變證據 | `resolving.py:59`、`:77`；`wd-20260925-resolve-red.xml` 12 failed → `wd-20260925-resolve-green.xml` 16 passed；`wd-20260925-resolve-integrity-red.xml` 4 failed → `wd-20260925-resolve-integrity-green.xml` 45 passed | 附件hash、日期、歸屬、分類、別名、CAS、回滾；相反證據保留Unknown；過時重試拒絕，附件與evidence禁止改寫 |
| 封存重試／新觀測 | `importing.py:182`；`wd-20260925-import-provenance-red.xml` 4 failed → `wd-20260925-import-provenance-green.xml` 11 passed | 重試核對封存bytes，新觀測日期保留獨立附件，schemaVersion拒絕bool／float |
| validate報告 | `cli.py:83`；`wd-20260925-cli-gates-red.xml` 2 failed → `wd-20260925-cli-gates-green.xml` 10 passed；`wd-20260925-retired-red.xml` 1 failed → `wd-20260925-retired-green.xml` 32 passed | V不採信布林Ready，Retired也須有效證據；未解除品質、RuntimeBuild及全量門檻 |
| UT-101／105／139 部分UX修復 | `game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs::FormatDetails`；`Tests/EditMode/Unit/CatalogPreviewViewTests.cs:69`（相對Assets/BrickHigh） | `wd-20260925-unity.xml` 124 passed／1 failed；來源狀態移至第二行後`wd-20260925-unity-green.xml` 125 passed |
| UT-097 虛擬清單修復 | 同view的`UpdateRows`及測試`RenderState_TallViewport_VirtualRowsCoverEveryVisiblePosition` | `wd-20260925-ui-rows-red.xml`確認第11列空白；改依高度配置列池與實際偏移選列後`wd-20260925-ui-final.xml` 126 passed／0 failed／0 skipped |
| build CLI／真實逐件模型工作 | `tools/catalog/building.py`、`tests/integration/test_catalog_build.py`（tests相對tools/catalog） | 固定工具與來源hash、Frozen計畫、不可變模型產物、同鍵重試；缺來源／逾時僅使該件Failed。實際Blender與Khronos Validator整合，成功停在Validating，未選件或發布 |
| metadata可計算品質 | `tools/catalog/metadata_quality.py`、`tests/unit/test_metadata_quality.py` | 公尺bounds及參考尺寸容差、接點位置／正交基底、空接點理由、輪徑／軸向及未知質量檢查；`wd-20260925-build-metadata-green.xml` 19 passed。尚非完整接合／碰撞／輪組原型驗收 |
| 工作租約錯誤清理 | `tools/catalog/jobs.py::release_on_error`、`building.py`及上述build測試、`tests/integration/test_catalog_jobs.py` | 封存損壞的重用失敗原留Running租約；`wd-20260925-lease-red.xml` 1 failed → `wd-20260925-lease-final.xml` 16 passed。修復後可立即重試，舊worker不可清除接手者租約 |
| 逐模型六視圖／來源署名 | `tools/catalog/render_views.py`、`building.py`、`tests/integration/test_six_views.py`及build測試 | `wd-20260925-sixviews-red.xml` 1 failed → green 1 passed；`wd-20260925-build-views-red.xml` 1 failed → green 9 passed。實際GLB、固定CPU渲染、六面PNG及preview、模型hash／工具／相機／光照報告與attribution一起封存；未自動核准外觀 |
| Frozen涵蓋缺口保護 | `tools/catalog/schema.sql`、`tests/integration/test_snapshot_repository.py` | `wd-20260925-frozen-gaps-red.xml` 4 failed → green 50 passed（含來源／resolve回歸）。禁止凍結後新增、刪除、解決或從Draft搬入coverage gap；後繼Draft可修正且原快照不變 |

以上XML位於`artifacts/test-results/`。`wd-20260925-it001-final.xml`來源／CLI核對組50 passed，無失敗／略過。另補非法enum形別exit 2：`wd-20260925-resolve-input-red.xml` 3 failed → `wd-20260925-resolve-input-green.xml` 3 passed。原正常fixture含token URI及把壞JSON當工作鍵衝突的錯誤前置已修正，另保留獨立拒絕案例；未放寬安全／JSON驗證。

建置及metadata首輪完整Python回歸`wd-20260925-python-build-final.xml`為152 passed；後續另補租約與六視圖測試。六視圖目視證據：`artifacts/acceptance/six-views-2192d37bc45d403084f85165042e7f72/preview.png`、`bottom.png`為實際紅色2×4磚，凸點與底部空腔可見；`six-views.json`保存來源模型hash與渲染設定。此為來源GLB渲染，不能取代Unity Player六視圖或使用者visualBaselineId核准。

六視圖與租約補強後完整回歸`wd-20260925-python-views-final.xml`為155 passed；Frozen gap新增四個反例另由上述50項組驗證。本輪新增的建置／metadata／六視圖／租約／Frozen gap證據屬對應SC-004／006／008／010／011／013／056的部分實作，未因此新增整項勾選。

2026-09-26接續前，包含Frozen gap反例的完整Python回歸`wd-20260925-python-catalog-final.xml`為159 passed／0 failed／0 skipped（121.52秒）。下一步補虛擬清單鍵盤事件鏈；整項完成度維持50/233，不以回歸cases增加勾選。

2026-09-26虛擬清單鍵盤修復：`Presentation/CatalogRowNavigation.cs`及`CatalogPreviewView.cs::MoveRow`（相對`game/Assets/BrickHigh/`）讓方向鍵移動資料焦點、完整顯示目標列，列池重用保留原VariantId而非悄悄改選另一件。`KeyboardMove_VirtualList_ReachesOffscreenRowsWithoutSelectingAnotherVariant`以實際uGUI方向事件走過50列、再回上一列，確認未自行載入模型；`wd-20260926-keyboard-red.xml`原第8列已超出viewport（350px > 307px），修復後`wd-20260926-keyboard-green.xml`完整Unity EditMode 127 passed／0 failed／0 skipped。UT-105仍待完整輸入鏈與Player驗證，不單因本反例修復勾選。

Tab／Shift+Tab新增固定控制順序、跳過不可用項目與清單單一Tab入口；預覽區停用Button方向鍵自動導覽，讓箭頭保留給鏡頭。`wd-20260926-tab-red.xml`重現預覽方向鍵把焦點移到ResetViewButton；其中Tab模擬也暴露EditMode測試輸入不受支援，後續`tab-focused`／`tab-dynamic`屬測試環境失敗，不列成功證據。最終EditMode改直接驗證同一`AdvanceKeyboardFocus`操作入口，真Input System按鍵佇列驗證移至`PreviewEntry/InternalPreviewAcceptance.cs`的實際Player。`wd-20260926-ui-final.xml`完整129 passed／0 failed／0 skipped；尚待新版Player安裝驗證。曾嘗試的全域EventSystem選取測試亦因EditMode未註冊而無效，已移除，沒有忽略錯誤log或把失敗算通過。

實際Player再現／修復：`artifacts/acceptance/wd-20260926-interactive-a/PlayerEvidence/result.json`在Tab成功後於`KeyboardRowFocus`失敗；離開未改動InputField仍觸發搜尋，清空即將操作的清單。`CatalogPreviewView.cs::SubmitSearch`保留上次提交條件，未改動的失焦不重查，明確搜尋按鈕仍強制查詢。重建`20260926T025425-875f28f0`後，隔離安裝至`C:/bh-qa-wd/20260926-b`成功，`artifacts/acceptance/wd-20260926-interactive-b/run.json`為installer=0、launcher=0；Player記錄`input-system-tab-reverse-and-list-navigation`、8件模型六視圖／旋轉縮放重設、搜尋清除與直式畫面共154張。已檢視`PlayerEvidence/frames/frame00153.png`，繁中及Unknown提示可讀。此為Input System自動按鍵事件，不是桌面HID錄影或使用者核准；readyAsset=false、visualApproved=false。

修復後完整Unity回歸`wd-20260926-ui-verified.xml`為129 passed／0 failed／0 skipped。再擴大Player按鍵提交驗證，build `20260926T025815-ef8f8371`安裝至`C:/bh-qa-wd/20260926-c`，`artifacts/acceptance/wd-20260926-interactive-c/run.json`安裝與launcher皆0、success=true；operation `input-system-tab-reverse-list-submit-orbit-reset`核對Enter載入完整選定變體、預覽方向鍵保持焦點且相機改變、Tab＋Enter重設回原相機位置。仍保留8件／154張Player畫面及F-Catalog限制。

新增勾選僅UT-001～003及IT-001，重算49/168 UT、1/29 IT、0/14 CT、0/22 ET，共50/233（21.46%）。既有46項沿歷史證據，不稱為全項重新稽核。BDD SC-001～003依受控fixture場景完成，3/56；UX仍0/20完整驗收。正式來源、逐資產品質、發行管線、完整UX／故障／效能／輪組矩陣及全項稽核尚未完成。

### Mighty PM 完成契約與執行紀錄（2026-09-23，v1）

本次授權為 `$mighty-pm $well-done` 接續本文件；規劃交接 Ready，五份文件包及既有決策沿用。範圍為本 SPEC 的 36 AC、56 BDD（20 UX）、233 TDD，以及必需的深度稽核、缺漏修復與重驗；其他 SPEC、人物／庫存／交易／房屋與正式賽車玩法排除。起始工作樹 `git status --short` 為空。根本缺口為內部探針尚未接成合格 Preview 與完整發行管線；不以 fixture、測試案例數或畫面概念圖取代正式驗收。

| ID | 來源／交付與驗收條件 | 負責人／寫入範圍 | 依賴 | 狀態／驗證 |
|---|---|---|---|---|
| P0 | well-done Phase 1；文件、決策、實際工作樹與現存證據核對 | 主代理；既有 MVP/SPEC/BDD/TDD/overview | 無 | verified；確認交接 Ready，文件鏈與現行程式已核對 |
| P1 | SPEC §3、4、8、13.1；真實來源、代表資產及全量缺口 | source_readiness（gpt-6-luna/high）；唯讀 | P0 基線 | verified（盤點）；本機 LDraw 幾何可讀，無全球在產涵蓋證據；資產合格與全量驗收仍未完成 |
| P2 | Phase 2/3；233 項 TDD 及 20 個 UX 的實作與證據 | 主代理與限定工作者；派工時明訂檔案 | P0，逐項依賴 P1 | active；工作重試、材質、UI 已進入修正整合，尚未逐項完成 |
| P3 | 原生封裝、安裝更新、離線 Player、畫面與效能 | 主代理；建置／啟動／驗收工具；catalog_jobs 限定 installer | P2 及合格資產 | active；鎖與受控啟動測試通過，安裝與 Player 整合中 |
| P4 | Phase 4/5；逐項 AC/BDD/TDD 深度稽核及有缺漏時修復重驗 | 指定稽核工作者、主代理整合；證據與已分配修復範圍 | P1–P3 | planned；每項要求文件／程式／測試路徑與行號，不抽樣 |
| P5 | Phase 6；完成契約逐項驗收與文件交付 | 主代理；最終文件與整合證據 | P4、全部必要關卡 | planned；僅 Verified 或允許的等價證據可結案 |

關鍵路徑：現況核對 → 可操作 UI／來源品質與封裝 → 真實 Player／安裝 → 畫面核准與正式效能／全量 → 全項稽核／修復 → PM 驗收。Unity 專案、共享 DTO／schema 與整合文件由主代理控制；工作者不得另派工作者，並行工作限不重疊寫入範圍。尚無成本數據，不聲稱金額節省；以少量獨立工作者及里程碑調整。

#### 2026-09-23 整合證據（進行中，尚非全案驗收）

- P2-C：`tools/catalog/jobs.py` 補工作租約、token fencing、checkpoint、來源重試與子程序 timeout。主代理審查補上長 Retry-After 不提早重試、最後失敗後當機不多呼叫一次的反例。`artifacts/test-results/pm-20260923-jobs-focused-final.xml` 為14 passed；完整下載與 CLI 不因局部 helper 完成而勾選。
- P2-A：透明材質由明確拒絕改為保留 LDraw alpha 與 GLB BLEND；真實透明磚與印刷人物 GLB validator 0 error/0 warning。工作者材料 Red/Green 僅留工具 stdout/exit（Green 8 passed），沒有持久化歷史 log，不重造。`artifacts/models/pm-20260923-transparent-color47`、`pm-20260923-printed-torso-973p06-color4` 保留 Unknown／qualityPassed=false／appearanceApproved=false，未提升為 Ready。
- P2-U：第一輪真 Unity 完整 EditMode `pm-20260923-ui-green.xml` 為114 passed/1 failed；失敗為釋放仍被 Camera 引用的 RenderTexture，已進入修復重驗。Coverage 新增測試真實編譯 Red 見 `pm-20260923-coverage-red.log`；窄窗幾何另補反例。測試通過案例數不直接計入233個清單ID。
- P3：固定 Preview／Release 身分、共用生命週期鎖、一次性 named-pipe 子程序 PID／版本授權與原生通知；政策7項通過（`pm-20260923-policy-green.trx`）、授權5項通過（`pm-20260923-launch-green.trx`）、真正兩程序競爭2項通過（`pm-20260923-launch-process-green.xml`）。Player 安裝指標核對先 Red，再4 passed/1 failed（越界例外未攔），修正後5 passed（`pm-20260923-startup-final.trx`）。尚非完整 IT-022／ET-016。
- 本地繁中字型採固定 Noto CJK Sans2.004 的 Traditional Chinese OTF，隨包 OFL 1.1 授權；待實際 Player 缺字與畫面驗證。原生 launcher 已完成自包含 win-x64 publish；尚待實際安裝包與 Player 啟動核對。

#### 2026-09-24 續作檢查點

- 使用者已明確回覆「尚無，請繼續開發」：目前沒有2026-09-08全量在產／停產證據或指定GTX1660／i5-10400基準機紀錄。兩項維持 Deferred；開發範圍與驗收條件未縮減。
- 三位工作者上輪由 runtime 回報用量限制而中斷，不視為已完成。續作時核對實際工作樹、log與產物後，以原工作者恢復 P3-I 安裝入口與 P2-A 證據結報；P2-U 已達成的 UI 修改停止寫入，改做 P2-Q 全233項開發缺口盤點。P2-Q不是最終Phase4稽核，不預先結案。
- P2-U 最終整合結果：`artifacts/test-results/pm-20260923-ui-integrated.xml` 為 **122 passed / 0 failed / 0 skipped**。涵蓋先前 RT 與窄窗失敗修復；不代表實際 Player 畫面或233項全通過。
- P2-A 斜面件根因是 ImportLDraw `_s`／`_c` 材質用途後綴。精確解析數字色碼並保留原材質名稱；未知名稱仍拒絕。`pm-20260923-asymmetric-green-final.xml` **16 passed / 0 failed / 0 skipped**，有兩輪持久化 Red。最終3298 GLB `pm-20260923-asymmetric-slope-3298-materials-v2` SHA-256 `ce1a16e98492945427e45bb5df4b7590b7b04a7f90f044de94843396e3a986e1`，Khronos 0 error/0 warning，仍非Ready。
- 主代理當前回歸：`pm-20260924-core.trx` **105 passed / 0 failed / 0 skipped**；`pm-20260924-catalog.xml` **64 passed / 0 failed / 0 skipped**；`pm-20260924-netstandard.log` netstandard2.1 build **0 warning / 0 error**。
- `ToolchainProbeBuild.BuildInteractiveFixture` 真實Unity建置成功，log `pm-20260924-interactive-build.log`、產物 `artifacts/acceptance/toolchain-20260923T165204-beeb922f/Package`。含8件真實GLB來源、離線中文字型及原生launcher，但使用人工F-Catalog固定讀取包，明確未Ready／未核准；下一步為隔離安裝、Player啟動及實際影像，不提升正式Preview完成度。

#### 2026-09-24 Player 與安裝整合續作

- 第一個8模型內部包已真正安裝至隔離根目錄 `C:/bh-qa-pm/20260924-a`，透過原生launcher授權啟動Player。`artifacts/acceptance/pm-20260924-interactive-a/run.json` 記錄 installExit=0、launcherExit=0；Player輸出154張真實畫面，含8件模型六視圖、旋轉／縮放／重設、搜尋清除及直式視窗。此為F-Catalog操作證據，不是正式Preview或視覺核准。
- 實際畫面檢查發現中文字型標題、Coverage及來源狀態被裁切，直式文字過小；已補三種視窗尺寸的真實Noto字型反例，`pm-20260924-ui-font-red.xml` 為3 failed。P2-U回到preview_ui限定Presentation修正；主代理執行Green與重建。P2-Q全233項缺口盤點改由source_readiness唯讀執行，僅寫 `pm-20260924-gap-inventory.json`，仍非Phase4結案稽核。
- P3-I新增原生安裝入口、卸載捷徑、更新回滾及舊索引相容；`pm-20260924-installer-uninstall-final-v2.txt` 為17 passed。封裝binary SHA-256 `7e581842ccc0768c326473f6a9171afd6c51d4506eb100c2d8a7e2b24e4a32b3`。執行中版本內卸載如留下自身exe，明確回報8；未以此宣稱完全移除。實際新Player包整合、原生GUI與ACL場景尚待驗證。
- P2-D由catalog_jobs接續開發端CLI的freeze／validate／publish／status，寫入限定CLI與專用測試；import／resolve／build及正式Unity內容管線仍未完成，不以helper或探針替代。

| 風險／驗證限制 | 負責人／觸發 | 處理與恢復條件 |
|---|---|---|
| 全量基準／來源狀態尚缺 | 主代理；無全球涵蓋與有效生產證據 | 調查並保存缺口，Unknown 保留；具完整實際來源與逐模型品質後才驗收 AC-017 |
| 畫面核准尚缺 | 主代理；尚無合格安裝包與 visualBaselineId | 先完成具體可審閱 Player／六視圖／操作證據，再請使用者核准；自動圖像檢查不等價 |
| 正式基準設備尚缺 | 主代理；本機僅探索環境 | 記錄本機結果；取得 SPEC 指定或另明確核准設備與固定 profile 後完成正式驗收 |
| 共用 Unity 編輯與測試環境競爭 | 主代理；任何 Unity 啟動／建置 | 主代理排程單一 Editor，工作者獨立測試需預約；不改使用者場景及正式 Profiles |

未完成驗證不能默認通過；無等價證據者保持 Deferred／Incomplete。此紀錄是完整流程基線，條件修復沿同一紀錄更新，不把階段性結果當作整份需求交付。

### 整體進度

```text
SPEC-001-BrickModelCatalog TDD 開發
目前工作：Gate 1 已確認；Gate 2 固定20件補 Ready 品質，SC-008 單元契約已 Green，Unity Test Runner 已恢復且真實 glTFast PlayMode 已 Green；IT-004 保持部分符合，現為 0/20 Ready
開始時間／最後稽核／負責人：2026-09-10／2026-09-28／Codex
進度條：[███████░░░░░░░░░░░░░] 33.9% (79/233)
```

### 分層進度追蹤

| 測試層級 | 進度 | 已符合 | 部分符合 | 未符合 | 狀態 |
|---|---|---|---|---|---|
| 單元測試 | 44.0% | 74/168 | 72 | 22 | SC-008 UT-022～024 隔離規則完成；真實資產完整矩陣由 IT-004 續追 |
| 集成測試 | 6.9% | 2/29 | 24 | 3 | IT-001、IT-013完整符合；IT-004 已有真 glTFast PlayMode 證據但仍部分符合 |
| 程式內API契約 | 14.3% | 2/14 | 12 | 0 | CT-009、CT-011 符合；其餘部分證據 |
| E2E／安裝／畫面／效能 | 4.5% | 1/22 | 14 | 7 | ET-017 F-Save harness 符合；正式 Player 尚未驗收 |
| 合計 | 33.9% | 79/233 | 122 | 32 | 154項尚未完整符合 |

一個原始checklist ID只計一次；參數化cases、assertions、文件追溯及部分實作不加分。四層百分比與總百分比四捨五入至小數一位。全項逐列判定見末尾矩陣；既有回歸全綠不等於233項全數通過。

### 當前 Sprint 狀態

| 項目 | 內容 |
|---|---|
| 當前階段 | Gate 2：固定20件模型補齊 Ready 品質契約，不擴增模型數量 |
| 當前工作 | Gate 1 已由使用者確認方向；Gate 2 collision fail-closed、connector profile 與 cavity 單元契約已完成，Unity runner 已恢復，真實 glTFast PlayMode 已補入 IT-004；接續固定20件逐件 Ready 證據與 IT-004 剩餘矩陣 |
| 已核對證據 | .NET core 140/140；Python 195/195（catalog 159/159）；.NET Standard build 0 warning／0 error；既有完整 Unity EditMode 163/163，Gate 2 最終 EditMode Test Runner exit 0、真實 PlayMode 非0測試 exit 0；20/20 Player 操作、382 張畫面、20/20 機械稽核；Gate 2 readiness 0/20 |
| 最後更新 | 2026-09-28 |
| 邊界 | 保留233個原始ID與名稱，不降低完整Preview／Release及實機驗收要求 |

### 里程碑

- [ ] M1：完成已核准的原生封裝相容原型與對應失敗測試。
- [ ] M2：完成領域／製作管線／真實 SQLite 測試。
- [ ] M3：完成程式內契約、座標與 Unity UX 測試。
- [ ] M4：完成真實安裝／離線／升級及畫面證據。
- [ ] M5：完成指定硬體效能、逐資產品質與全量發布門檻。
- [ ] M6：完成實作稽核與交付；不得因測試綠燈但實際模型缺件就勾選。

### 關鍵指標

| 指標 | 目標 | 目前 |
|---|---|---|
| TDD驗收 | 233/233有完整對應證據 | 79/233（33.9%），122部分／32未符合 |
| AC／BDD／TDD逐項現況核對 | 36／56／233全部過表 | 36／56／233已過表；不是全部通過 |
| 完整AC／BDD／UX | 36／56／20 | 2／5／1；詳SPEC及BDD矩陣 |
| 全量模型 | A>0、U=0、G=0、V=A及逐件品質 | 未取得完整來源分母與Ready品質閉環 |
| 原生畫面 | 合格Preview與核准基準 | 20模型內部Player可安裝操作，提供人工外觀檢視頁；尚未有正式逐件核准 |
| 效能 | 固定硬體／profile／場景實測 | 正式基準未驗收 |
| 程式碼覆蓋率 | 實際報告，不能替代驗收 | 未量測 |

### 每日進度記錄

2026-09-09：SDD 經使用者確認；生成46場景與179測試。未開始實作、未取得正式畫面截圖、未跑任何 Unity 測試。

2026-09-10：新增領域規則、開發端 SQLite repository、不可變內容儲存、Windows 實際路徑／hash 防護、C# 原生 SQLite 與固定 session 讀取、存檔相容檢查。加入 Unity 專案骨架及候選套件清單；完成 LDraw 3001 幾何轉換探針，不把測試顏色選擇視為已觀測實際變體。未修改既有 `blender/brickhigh.blend`。

2026-09-11～12：發現使用者已安裝可執行的 Unity 6000.3.18f1，授權解析成功。補上 manifest／runtime_files／bundle 引用核對、整組歷史模型 resolver、最新選取狀態與主執行緒 ModelLease；實際建立 Win64 Mono Player，普通磚可由本地 Addressables 顯示，SQLite 唯讀與缺 DLL／無圖形裝置反例已執行。沒有因此改成 Ready、發布 Preview、核准外觀或清除全量缺口。

### 原生探針與本輪新增證據（2026-09-11～12）

- 原生環境：`C:/Program Files/Unity/Hub/Editor/6000.3.18f1/Editor/Unity.exe`；實際解析既有 `game/Packages/packages-lock.json`。候選套件已通過普通磚探針，尚未通過透明／印刷／代表件全集與安裝驗收，不能凍結為完整發行工具鏈。
- `artifacts/test-results/manifest-red-20260911.trx`：8 個不完整索引反例在舊實作全部錯誤成功；新增 `Infrastructure/ReleaseFileIndex.cs` 後通過，另有歷史引用錯配測試。這些真實 SQLite fixture 的 bundle bytes 是測試用，不作 Unity 資產證據。
- `artifacts/test-results/lease-bounded-20260912.xml`：只執行 `BrickHigh.Tests.EditMode`，48 passed、0 failed、0 skipped。較早的 34／43 總數各含一個 Addressables 文件範例 `TestStub.RequiredTest`，本專案當時分別為 33／42，範例不計進度。
- `ModelLeasePolicyTests.cs` 的背景 Dispose 原先假設下一個 Test Runner tick 就完成，出現 47/48；改成最多 5 秒的主執行緒排程等待後 48/48。仍斷言引用已釋放及背景存取 Prefab 被拒絕，沒有忽略失敗或改成 skip。
- 首次 Player（`toolchain-20260911T125107-9267fea8`）雖有載入資料，直接 framebuffer 擷取實為黑圖；其舊報告的 `passed=true` 不可採信為畫面通過。原始失敗證據保留，未覆寫。
- 修正後 `artifacts/acceptance/toolchain-20260911T125714-066b6fbe/run-01/player.png` 為實際 Player Camera RenderRequest，已目視確認紅色 2×4 磚而非黑圖；報告為 3068 triangles、寬 0.031999998 m、URP glTF shader、17667 個紅色像素。只證明普通磚可渲染，不代表來源外觀／光照核准。
- 同 build 的 `matrix-1b3a5c9e544a4a648460bcda1ddd0565/`：正常 exit 0；無圖形裝置 exit 3；缺 SQLite DLL 的獨立測試複本 exit 3。DLL 只是從新複本移至 `sqlite3.dll.disabled`，可恢復；原 Player、正式 Profiles 與原 Blender 工作檔不變。
- `artifacts/acceptance/toolchain-20260912T001303-27d7c688/matrix-43a224f65077460b90eb7b88ba6334ae`：v3 直接 Addressables 與 ModelLease 的正常／無圖形／缺 DLL 三項通過，正常報告有共用及最後一次釋放證據；不等於受控 provider 驗收。
- 探針入口：`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs::Build`；執行檢核：`tools/acceptance/verify_toolchain_player.ps1 -PlayerDirectory <本次輸出>/Player`。新版檢核另要求取消／重新載入證據，舊報告不滿足新增要求，須用新版重建。探針 runtime 只在 `UNITY_EDITOR` 或 `BRICKHIGH_TOOLCHAIN_PROBE` 編譯，不提供玩家 CLI。
- glTFast 6.14.1 的實際匯入器翻 X；探針以 Y 軸 180° 純旋轉對齊專案翻 Z 契約，未二次翻轉 winding。完整非對稱、接點、人物錨點與碰撞整合仍未驗收。

本輪新增勾選 UT-094～096、115～117：`UnityRuntime/ModelLease.cs` → `Tests/EditMode/Unit/ModelLeasePolicyTests.cs`；`Application/SelectionRequestPolicy.cs` → `Tests/EditMode/Unit/SelectionRequestPolicyTests.cs`（相對 `game/Assets/BrickHigh/`）。UT-095／096 原先保留未完成，待下方 v5 真實取消／失敗 handle 釋放與背景取得證據補齊才勾選。IT-015、024 不因局部成功整項勾選。未建立新 HTTP API，resolver 為 Infrastructure 的 internal 邊界。

### 受控資產載入接續（2026-09-12）

- Red：`provider-red-20260912.log`、`provider-player-red-20260912.log` 均因缺少 `BrickAssetProvider` 產生 CS0246；不是跳過原生測試。
- Green：`provider-green-20260912.xml` 為 50 passed／0 failed／0 skipped；`provider-core-20260912.trx` 為純 C# 45 passed；`.NET Standard 2.1` build 為 0 warnings／0 errors。
- 實作：`UnityRuntime/BrickAssetProvider.cs` 先驗完整 snapshot／variant／revision 引用與 session，再使用固定本地 catalog 的私有 locator。bundle 依 `runtime_files` 核對實際 bytes，再把同一陣列交 `AssetBundle.LoadFromMemoryAsync`；所有 Unity 操作派回主執行緒。`ModelLease` 回報獨立引用釋放，provider Dispose 不銷毀已交出的租約。
- 原生 v4：`artifacts/acceptance/toolchain-20260912T003041-51e63fec/matrix-27b069f04cbe4540a7088f92c52fbd97/` 四項通過：正常圖形 exit 0、無圖形 exit 3、缺 DLL exit 3、同名同大小同 mtime bundle 竄改回 `FirstAcquire:AssetCorrupt`／exit 3。正常圖片已目視確認是紅色普通磚。F-Catalog／非 Ready 標記保留，沒有發布 Preview。
- 原生 v5：`artifacts/acceptance/toolchain-20260912T003537-7305169b/matrix-a56dcfc4163d4b538aa8f13693149eb1/` 四項全通過。正常流程預先取消零 IO／handle、真實 handle 配置後取消、背景重新取得、provider Dispose 後既有 lease 仍有效；共 3 次 bundle 讀取、4 份 handle 配置，最後 lease／bundle 皆 0。損壞反例確實讀取 1 次並配置 1 份 handle，回 AssetCorrupt 且 lease／bundle 皆 0。內部 `HandleAllocated` 觀察點只用於確定取消時序，沒有替換資產 bytes 或載入結果。
- 最終 EditMode 回歸：`provider-final-20260912.xml` 為 50 passed／0 failed／0 skipped。v5 新增生命週期斷言先對舊 v4 執行並失敗，未放寬斷言後再驗 v5 通過。
- 首次 v4 `matrix-db72e99071f44fa8908e319416851dfa` 的 hash 反例未通過：複本 bundle 路徑達 292 字元，Mono 先回 `CatalogOpen:AssetMissing`。測試複本移到新的短路徑後才驗到預期 hash 錯誤；長路徑安裝相容性仍未解決。故障注入只改新複本，備份可恢復，原 Player 與使用者資料未刪除。
- 目前仍缺：多 bundle／多包隔離、catalog 遠端初始化拒絕全集、重新解析與實際 Player 的並行替換矩陣、取消 UI、正式來源及安裝 UX。UT-156、IT-026／027、CT-006 保持未勾選；完整來源與品質門檻不由人工 F-Catalog 取代。

### 離線啟動設定防護（2026-09-13）

- 根因：Addressables 在指定 catalog 前仍先初始化 `aa/settings.json`；只驗 bundle 路徑無法阻止初始化時連線。新增 `Infrastructure/LocalAddressablesPolicy.cs` 與 13 個 `LocalAddressablesPolicyTests.cs` cases（追溯 UT-071），檢查固定 Win64／本機 catalog、停用更新、空額外初始化與 certificate handler、禁止遠端／越界／自訂 provider／hash 相依／序列化 payload。
- Red：新 C# 測試先因缺少政策類別編譯失敗。`tools/acceptance/verify_offline_bootstrap.py` 在短路徑的新人工 F-Catalog 複本注入回環 HTTP catalog，並同步測試 DB／manifest hash，避免以 hash 不符掩蓋政策缺口。舊 Player 的 `toolchain-20260912T004030-6f56e031/bootstrap-13bd7ed0/bootstrap-report.json` 記錄 1 次 `/catalog.bin` 請求、Addressables 例外與 `ProbeTimeout`；此為有效紅燈。較早 `bootstrap-98fd387a` 因測試端 SQLite connection 尚未關閉而回 StorageUnavailable，不能作為此政策的證據，已修正測試端關閉順序。
- Green：`toolchain-20260913T020817-cc74a123/bootstrap-3274468b/bootstrap-report.json` 為 passed，0 次 HTTP 請求、`FirstAcquire:AssetCorrupt`、exit 3，0 bundle 讀取／0 資產 handle。provider 在 Addressables 初始化前驗 settings 的實際 bytes 與政策，且持有不可寫換的檔案直到 catalog 初始化完成；建置探針也執行同一政策。
- 同 build 的 `matrix-bc8c87464cf7467cab4d8e9cc9ee2e42/` 正常／無圖形／缺 DLL／同大小竄改四項全通過；正常仍含預先取消、已配置 handle 後取消、背景重新取得及零殘留證據。
- 本輪回歸：`bootstrap-green-20260913.trx` 純 C# 58 passed；`bootstrap-green-20260913.xml` Unity 63 passed；`python-20260913.xml` Python 38 passed，全部 0 skipped；.NET Standard 2.1 build 0 warnings／0 errors。參數化 cases 不增加原始 233 checklist ID。
- 建置副作用修復：原本 setter 會把 `overrideDefaultApplicationIdentifier` 留為 1；`provider-identity-build-20260912.log` 的重建後已驗回 0，company／product 為原本 DefaultCompany／game。URP 自動產生的設定與明確化的預設值仍在 worktree，不包含正式 profile 修改。
- 此階段限制：當時 fixture 尚未移到 `StreamingAssets/Catalog/<packId>`，接續驗證見下節。多包隔離、全部 catalog 相依安全矩陣與乾淨離線安裝仍未完成。IT-012 僅增加遠端初始化反例證據，未勾選。Python 只在開發端做故障注入，Player 沒有新增 Python 相依。

### 包內布局接續（2026-09-13）

- Red：建置器把人工 DB／manifest／catalog／bundle 改放 `StreamingAssets/Catalog/<packId>`；`toolchain-20260913T021556-36a53a98/matrix-87da3c2391ae4beca9453452ca49b1ee` 正常情境回 `FirstAcquire:AssetCorrupt`，0 bundle 讀取／0 資產 handle，證明舊 provider 綁定頂層路徑而不支援規格布局。
- 實作：`BrickAssetProvider` 分開驗證 Player 固定 `StreamingAssets/aa` 啟動 settings／catalog 與選定包的私有 catalog。啟動檔案的實際 hash 必須等於包內索引且持續拒絕寫換；catalog 的固定 RuntimePath bundle 僅轉為該包的同一 storage key，驗證後將包內 bytes 交給 Unity，不載入頂層 bundle。其他外部路徑仍拒絕。
- Green：`toolchain-20260913T021909-c8fbff07` 的人工包為 `p25e70ae7`；`matrix-bb9f9b596da747f8894205c6b2892183` 四項全通過，包內 bundle 損壞即回 AssetCorrupt；正常圖片已目視確認普通紅磚。`bootstrap-e3828abd` 仍為 0 HTTP 請求／0 資產 handle，遠端設定被拒絕。`pack-final-20260913.xml` 為 Unity 63 passed／0 failed／0 skipped。
- 補強矩陣 `matrix-08917646b73744948487dfdb54e96930` 六項全通過：除上述四項外，移走獨立複本的頂層 bundle 仍正常渲染／取消／重新取得；移走頂層啟動 catalog 則回 `FirstAcquire:AssetMissing`，0 bundle 讀取／0 資產 handle。移走檔案分別保留為 `unused.bundle.backup`／`bootstrap.catalog.backup`，原 Player 不變。此反例證明正常顯示不依賴頂層 bundle，也不略過啟動 catalog 的驗證。
- 人工包短 ID 用於隔離既知 Mono 長路徑問題，這次 bundle 完整路徑 255 字元；不代表 292 字元案例已修復。建置後以已驗證範圍的 `AssetDatabase.MoveAsset` 將本次人工包及 meta 移回忽略版控的生成目錄，不留下可發行的假包；原使用者 Profiles 與 Blender 檔不變。
- 本節只完成內部單包布局證據：尚未完成正式建置／安裝器、多包併發、歷史資產全集、品質核准、UI 或深度稽核，整體仍為 30/233。

### 預覽控制層接續（2026-09-13 下午）

- 根因與邊界：既有 `BrickHighToolchainProbe.exe` 是自動驗收入口，未傳 `-probe-output` 時明確 `Quit(2)`，完成後也會退出；不是可雙擊操作的模型瀏覽器。這一行為不改稱崩潰，也不把新增控制層宣稱為已交付 uGUI。
- Red：`RetryRequestPolicyTests` 與 `CatalogPreviewPresenterTests` 分別先以 CS0246 確認缺少實作；新增釋放順序測試先以 CS1061 確認缺少 `ReleasingModel`。`preview-flow-red-20260913.log` 記錄原生探針缺 `CatalogPreviewController` 的 CS0103。新增驗收要求先跑舊 `toolchain-20260913T021909-c8fbff07/matrix-e111201c001640b187f986e1a35052f5`，因沒有 `previewFlowVerified` 被拒絕，沒有把舊成功報告當成新功能證據。
- 實作：`Application/CatalogPreviewPresenter.cs` 固定快照、Browse 用途與有界分頁，複製條件、處理空狀態、完整變體選取、固定繁中錯誤及診斷 ID；晚到查詢不蓋新頁，晚到模型只釋放。`RetryRequestPolicy.cs` 使用不透明請求識別阻擋重複重試，換件可立即取代舊重試。兩者不開網路、不寫玩家資料。
- `UnityRuntime/CatalogPreviewController.cs` 以既有本機 SQLite 與 `BrickAssetProvider` 串接搜尋／清除／下一頁／選取／重試，擁有 session、lease 與 instance；主執行緒先移除 instance 才釋放 lease，Dispose 後不通知舊 UI。此為可綁定 uGUI 的控制層，尚無正式畫面、字型、鏡頭操作或安裝入口。
- Unity 初次整合在 `preview-flow-green-20260913.log` 發現 `BrickHigh.Application` 遮蔽 `UnityEngine.Application`，已改成明確限定引擎類別；沒有更動引擎或公開讀取契約。`Domain` 僅新增測試 assembly 的 friend 存取以建立不可公開偽造的 DTO fixtures。
- Green：`preview-sqlite-core-20260913.trx` 為純 C# 81 passed；`preview-final-20260913.xml` 為 Unity 86 passed，全部 0 failed／0 skipped。`.NET Standard 2.1` build 為 0 warnings／0 errors。`ReadContractTests` 另以真實 SQLite 核對所有篩選相交、貨號精確優先於名稱部分匹配及有界下一頁；不是用 mock SQL 判搜尋通過。
- 原生控制層：`toolchain-20260913T082541-677a5ffd/matrix-3fa960cefa6945e589d85e56d128e4b4` 六項全通過。正常及無頂層 bundle 情境的 `previewFlowVerified=true`，實際完成 SQLite 無結果→清除→同快照模型選取→建立 3068 triangles instance→Dispose，controller 的 lease／bundle 歸零。原有正常／無圖形／缺 DLL／同大小 bundle 竄改／缺啟動 catalog 反例仍維持正確結果。`bootstrap-77c26b35` 遠端設定反例仍是 0 HTTP 請求、AssetCorrupt、exit 3。此為流程 harness，沒有 UI 操作錄影，不冒稱 UX 通過。
- 新增勾選：UT-097、098、100～102、109～114 對應 `CatalogPreviewPresenterTests.cs`（UT-100 另有 `ReadContractTests.cs`）；UT-118～120 對應 `RetryRequestPolicyTests.cs` 及 presenter 的晚到重試測試。這 14 項僅完成各自單元狀態規則，IT-016 與全部 UI／安裝 E2E 未勾選。UT-099、121、122 只有部分串接／生命週期證據，仍未完成整項。
- 初始化重試 Red：`toolchain-20260913T083035-31914a6a/matrix-810ccd46c83f4fda9e03176cb65a0c61/normal/player-report.json` 在真實 `FileShare.None` 暫時占用頂層啟動設定後，首次正確回 StorageUnavailable；解除占用再重試卻仍回 `PreviewRetryDidNotRecover:StorageUnavailable`。原因是 provider 沿用已失敗的初始化 Task，而非檔案仍被占用。
- 修復：`BrickAssetProvider.Cleanup` 僅於全部等待者與租約歸零、且初始化為暫時 StorageUnavailable 時清除失敗工作及其私有 handle；下一次明確重試重新讀取並驗證 bytes。永久內容錯誤不因此放行。探針在相同 controller／session 上解除檔案鎖後重試，另同時重複點擊，要求只有一次有效請求且能建立真實模型。
- 重試 Green：`toolchain-20260913T083340-2c8fe11c/matrix-3595e6639e5f42d6b881a574efb5343c` 六項全通過，正常與無頂層 bundle 報告具有 `previewFlowVerified=true`／`previewRetryVerified=true`；最終 EditMode `preview-retry-final-20260913.xml` 仍為 86 passed／0 failed／0 skipped。`bootstrap-278d4e55` 遠端設定仍以 0 HTTP 請求拒絕，不因重試機制放寬來源政策。故障檔只在本次新複本移至 backup／disabled，原 Player、Profiles、Blender 檔不變。
- 尚需補足：真正 uGUI 操作與可讀字型／窄視窗／鍵盤／鏡頭、啟動與查詢失敗的重試 UI、多模型與材質的真實操作驗收、instance／render texture 完整生命週期；原有來源品質、安裝更新、多包安全及效能門檻不變。重試只補真實啟動設定占用反例，尚非所有 Addressables 初始化故障／多等待者矩陣完成。

### 本輪驗證與追溯證據（2026-09-10）

以下命令工作目錄為 `brickhigh/`；`artifacts/` 保存本機可重建證據，不入版控。

| 命令／證據 | 實際結果 | 不可推論的範圍 |
|---|---|---|
| `python -m pytest -q --junitxml=artifacts/test-results/python-20260910.xml` | 38 passed，0 skipped | 不代表 Unity 資產載入或全量來源完成 |
| `dotnet test tools/tests/BrickHigh.Core.Tests.csproj --nologo --verbosity quiet --logger "trx;LogFileName=core-20260910.trx" --results-directory artifacts/test-results` | 33 passed，0 skipped | 非 Unity Test Runner／Player |
| `dotnet build tools/tests/BrickHigh.Core.Compatibility.csproj --nologo --verbosity quiet` | .NET Standard 2.1，0 warnings／0 errors | 不代表套件、shader 或 native Player 相容 |
| `node tools/catalog/validate_glb.cjs artifacts/models/3001-red-exploratory-v1/model.glb artifacts/models/3001-red-exploratory-v1/khronos-report.json` | Khronos 2.0.0-dev.3.10：0 errors／0 warnings／0 infos／0 hints | 未完成尺寸全集、接點、來源外觀、六視圖、Unity 及使用者核准；重跑需新的報告路徑 |
| `artifacts/models/3001-red-exploratory-v1/conversion.json` | Blender 5.2.1；3068 triangles；32 mm 寬；逐依賴作者／license／hash；`Unknown`、`qualityPassed=false` | 幾何探針，不是 Ready、Preview 安裝包或已確認未停產變體 |

探索 GLB SHA-256：`a4c11b4d5c56235d8f29d60f83949a0360ae92a17e2161c7998184246216bae9`。ImportLDraw 固定 commit：`c306fb777a4e0da85492f09d65daf458767a0aa1`。匯入器未支援的 FABRIC 色表訊息保存在轉換報告；本探針只使用 BASIC 材質，透明／特殊材質仍明確拒絕，不默默變成不透明塑膠。

| 已勾選 ID | 實作 | 測試證據 |
|---|---|---|
| UT-004～006 | `tools/catalog/policies.py::ProductionStatusPolicy` | `tools/catalog/tests/unit/test_sc_002.py` |
| UT-007～009 | `tools/catalog/policies.py::VariantIdentityPolicy` | `tools/catalog/tests/unit/test_sc_003.py` |
| UT-019～020 | `game/Assets/BrickHigh/Domain/Geometry.cs` | `Tests/EditMode/Unit/CoordinatePolicyTests.cs`（以下 Tests 均相對 `game/Assets/BrickHigh/`） |
| UT-046 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs` | `Tests/EditMode/Integration/NativeSqliteTests.cs`；實際 bundled DLL、唯讀且無 sidecar |
| UT-060、082 | `Domain/CatalogResult.cs`、`Domain/CatalogInputPolicy.cs`（Domain 相對 `game/Assets/BrickHigh/`） | `Tests/EditMode/Unit/CatalogInputPolicyTests.cs` |
| UT-070～072 | `tools/catalog/content.py` | `tools/catalog/tests/unit/test_sc_024.py`；另有 C# Windows 保留名稱反例 |
| UT-073～074、148 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs`、`Domain/SaveContracts.cs` | `Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs`；只讀政策，未實作正式存檔資料表 |
| UT-079～081 | `tools/catalog/policies.py::CatalogCoveragePolicy` | `tools/catalog/tests/unit/test_sc_027.py` |
| UT-085～087 | `game/Assets/BrickHigh/Domain/Geometry.cs` | `Tests/EditMode/Unit/MetadataValidationPolicyTests.cs` |
| UT-155 | `Domain/CatalogInputPolicy.cs`、`Infrastructure/BrickCatalog.cs`（Infrastructure 相對 `game/Assets/BrickHigh/`） | `Tests/EditMode/Unit/CatalogInputPolicyTests.cs`、`Tests/EditMode/Integration/ReadContractTests.cs`；scalar／cursor 邊界與實際字面 SQL 查詢 |

部分整合證據：`tools/catalog/tests/integration/test_snapshot_repository.py`（CAS、凍結／Ready 不可變、故障 rollback）；`tools/acceptance/tests/integration/test_it_026.py`／`test_it_027.py`（真實 Windows junction 及同大小／mtime 內容替換）；`Tests/EditMode/Integration/ReadContractTests.cs`（101 筆分頁、session／包身分、literal LIKE）；`tools/catalog/tests/integration/test_blender_conversion.py`（真實 Blender＋官方 LDraw 幾何）。上述尚未涵蓋各 ID 的完整 Player／工作／更新矩陣，不能勾選整個 IT／CT。

### 鏡頭與輸入接續（2026-09-13 晚間）

- 技能與範圍：依 `tdd-development` 先測試，並使用 `bdd-frontend-ux-implementation` 核對 SPEC §7／BDD SC-035。現有 15 項畫面 AC 均有 BDD 追溯，本次沒有新增產品功能或重編 233 項；SC-035 的完整控制鏈仍未驗收。
- Red：7 個 `PreviewOrbitPolicyTests` cases 先因缺少類別而 CS0246（終端執行紀錄）。`orbit-unity-red.log` 同樣記錄缺少 `PreviewCameraController`；原生新版腳本對舊 build `toolchain-20260913T083340-2c8fe11c/matrix-aa4f9a21b44247a9970761aeec0fdf3b` 拒絕缺少鏡頭證據的舊成功報告。
- 實作：`Application/PreviewOrbitPolicy.cs` 以公尺外接球、垂直 FOV 與長寬比計算取景／裁切面；角度、縮放及非有限值都有界。`UnityRuntime/PreviewCameraController.cs` 只移動借用 Camera，不改模型 transform；綁定所屬 EventSystem，uGUI InputField 選取當幀就阻擋拖曳／縮放／快捷鍵，結束舊拖曳。只有選取預覽區域時才處理方向鍵／PageUp／PageDown／Home；其他控制仍保留自己的鍵盤導覽責任。
- 測試修正而非宣稱產品故障：`orbit-unity-green.xml` 初次 98/99，`orbit-focus-diagnostic.xml` 定位 EditMode 未自動註冊 `EventSystem.current`。原測試多次動作後的重設可能掩蓋焦點錯誤，故補成每次動作都斷言不變；controller 改為明確注入畫面 EventSystem，不再依賴全域註冊時序。未放寬焦點／晚到拖曳斷言。
- Green：`orbit-policy-green/` 的 TRX 為 7 passed；`orbit-core-final.trx` 純 C# 88 passed；`orbit-unity-green2.xml` Unity 99 passed，皆 0 failed／0 skipped。`dotnet build tools/tests/BrickHigh.Core.Compatibility.csproj --nologo --verbosity quiet` 為 0 warnings／0 errors。
- 原生：`orbit-player-build.log` 建置 exit 0；`toolchain-20260913T131217-e7110a88/matrix-e03da487a6eb42c19bafac96043d0e46` 六項全通過。正常及無頂層 bundle 的 `previewCameraVerified=true`，真實 SQLite／provider 載入 3068 triangles 模型後，驗證旋轉、縮放、重設、文字焦點、鍵盤鏡頭輸入、直式 bounds 取景、Unbind 及模型 transform 不變。原有暫時占用重試／取消／零殘留矩陣仍通過。
- 畫面：正常案例新增 `camera-reset.png`、`camera-orbit-zoom.png`、`camera-portrait.png`（480×960），已目視確認是同一紅色 2×4 磚、不同視角及完整直式取景。圖像來自真實 Player Camera RenderRequest；事件由 harness 派送，沒有宣稱桌面 HID 錄影、完整 uGUI 或畫面風格核准。燈光／材質仍未核准，不能用這三張取代逐資產六視圖。
- 離線防護回歸：同 build 的 `bootstrap-7148b9a8/bootstrap-report.json` 為 passed，0 次 HTTP 請求、`FirstAcquire:AssetCorrupt`、exit 3；由 `python tools/acceptance/verify_offline_bootstrap.py --player-directory <本次Player>` 重跑。原生矩陣則使用 `./tools/acceptance/verify_toolchain_player.ps1 -PlayerDirectory <本次Player>`，皆為開發端驗收工具。
- 新增勾選 UT-103／104：`PreviewOrbitPolicyTests.cs` 與 `PreviewCameraControllerTests.cs`（相對 `game/Assets/BrickHigh/Tests/EditMode/Unit/`），加上述真實 Player 證據。UT-105、SC-035、IT-016、ET-002 仍缺完整搜尋／篩選／清單／按鈕鍵盤控制鏈與窄視窗 UI 重排；UT-121／122 仍缺完整畫面自有 render texture 生命週期，不勾選。
- 邊界：沒有改 Player 的缺參數退出行為，探針仍不是可雙擊瀏覽器。沒有修改原 Blender、正式 Profiles 或留下 ProjectSettings／Addressables 設定差異；故障僅作用於新人工複本，移走的檔案仍有備份。未進行 Phase 4 全項深度稽核，19.74% 是 checklist 完成比例，不是正式模型完成率。

### 接續實作所需條件與未完成範圍

- 先前 Unity 安裝條件已解除，未重試提權或代為啟用授權；使用者安裝的 Editor 已能執行。剩餘關卡是合格代表資產、可操作 Preview、原生啟動器、乾淨 Windows 安裝與真正離線驗收。
- `packages-lock.json` 已存在並經 Editor 解析；普通磚 Player 探針通過不代表全部材質／平台及安裝相依驗證完成。
- 開發 CLI／完整來源 adapter、工作恢復、涵蓋審查實證、全部分類／接點／品質閉環仍未完成。repository 的合成驗證報告僅供交易測試；目前不得拿人工旗標或 fixture 發布真實內容。
- 精確模型 resolver、ModelLease 與最新選取已有實作；完整受控 Addressables provider、uGUI／鏡頭／輸入、啟動器與離線安裝更新、備份還原 harness、完整 manifest／bundle 封裝及其故障矩陣仍需實作與實機驗證。
- 全部 BDD 場景驗收仍為 0/56、UX 0/20；無 Player 六視圖、`visualBaselineId` 或指定 GTX 1660 基準報告。Phase 3／Phase 4 尚未完成，沒有 100% 深度稽核結論。

## 測試資料、位置與層級約定

所有位置相對 `brickhigh/`；已建立項目以本輪證據表為準，其餘仍是預計位置。Unity 測試須使用與鎖定 Editor 相容的 Unity Test Framework；Domain 不引用 UnityEngine。製作工具的 Python 測試採受控來源與真實 SQLite。單元層只能隔離規則、狀態機與判定器，不能由假 render report 推論真實畫面已正確。

- 單元：開發端 `tools/catalog/tests/unit/`；遊戲 `game/Assets/BrickHigh/Tests/EditMode/Unit/`。
- 集成：Python 管線、Unity EditMode／PlayMode／Player，依下表列出實際執行層。
- API：保留模板 API 章節，但依已確認的單機需求改為 C# 程式內契約。HTTP／Controller／WebApplicationFactory／SpecFlow 不適用，不建立假端點。
- E2E：`tools/acceptance/tests/` 驅動實際安裝版與人工驗收步驟；硬體故障或視覺核對可用可重跑的人工程序，必須保存證據，不能因此略過。
- F-Catalog／F-Geometry／F-Save／F-Performance 與正式 Release-Catalog 的用途依 BDD Background。生產測試不得使用私人正式存檔做故障注入。
- 文案以 BDD 實際字串斷言；外部服務錯誤只在工具端，Player 不可回退到網路下載。
- 所有公開契約均在 CT 層列出；新增方法必須追到場景與測試。尚未定義的額外公開方法不是可宣稱已覆蓋的實作。

### 基線回歸與新增案例的執行約束

原179項測試定義、名稱與編碼保留。BDD「基線與補強的合併適用規則」同樣約束原測試的setup與斷言；SPEC第13節是已確認契約，不可沿舊前置要求Frozen驗證先Published、允許降版覆寫或將Preview算正式全量。新增54項是30個獨立規則測試加已同意的24個真實集成／契約／E2E案例；參數化正反資料不另灌水計數。SC-050／ET-017只驗收恢復harness及政策，正式玩家還原UI留後續SPEC。

## 1️⃣ 單元測試（Unit Tests）

每組3項分別驗證 BDD 的 Then／And。真實像素、安裝與物理效果必須另通過 IT／ET；此處測試其輸入驗證、狀態或報告判定規則，不能把 mock 畫面當成果。

### 1.1 SC-001 保存跨來源基準及涵蓋證據

**位置**：`tools/catalog/tests/unit/test_sc_001.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-001、AC-004，BDD SC-001。
**共同前置**：具完整分頁／hash 的跨系列來源與基準日 2026-09-08，另有一個缺頁來源。
**共同動作**：維護者匯入並核對候選集合；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-001** `CatalogCoveragePolicy_CompleteArtifact_KeepsEvidence` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：完整來源保留 artifact、hash、observedAt 與有效日期。
- [x] **UT-002** `CatalogCoveragePolicy_ExpandedFamilies_KeepsCoverage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：System、Technic、DUPLO、人物組件及其他系列均列入涵蓋表，套裝展開與附件排除有理由。
- [x] **UT-003** `CatalogCoveragePolicy_MissingPage_ReportsGap` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺頁來源產生未解決 G，不宣稱來源完整。

### 1.2 SC-002 逐變體判定生產三態

**位置**：`tools/catalog/tests/unit/test_sc_002.py`
**目標／來源**：隔離 `ProductionStatusPolicy` 規則；AC-002，BDD SC-002。
**共同前置**：候選分別有有效生產、停產、缺貨、舊現貨、日期不明及衝突證據。
**共同動作**：維護者計算基準日生產狀態；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-004** `ProductionStatusPolicy_DatedEvidence_ClassifiesStatus` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：有效生產且無衝突判為 Active，有效停產判為 Retired。
- [x] **UT-005** `ProductionStatusPolicy_AmbiguousEvidence_RemainsUnknown` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺貨、舊現貨、日期不明與衝突均保持 Unknown。
- [x] **UT-006** `ProductionStatusPolicy_RetiredColor_PreservesOtherVariant` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：某顏色停產不改變另一有效 Active 變體。

### 1.3 SC-003 保留實際外觀變體及穩定識別

**位置**：`tools/catalog/tests/unit/test_sc_003.py`
**目標／來源**：隔離 `VariantIdentityPolicy` 規則；AC-003，BDD SC-003。
**共同前置**：同幾何有兩顏色與兩印刷來源，另有同來源 ID 的矛盾映射。
**共同動作**：維護者建立零件、變體與來源別名；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-007** `VariantIdentityPolicy_RealAppearance_CreatesVariant` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只建立有證據的實際組合，不做所有顏色笛卡兒積。
- [x] **UT-008** `VariantIdentityPolicy_PrintedKey_PreservesIdentity` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：印刷／材質納入 VariantKey，內部 ID 永不重新分配。
- [x] **UT-009** `VariantIdentityPolicy_ConflictingAlias_IsolatesMapping` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：矛盾外部 ID 隔離為衝突，不能直接合併。

### 1.4 SC-004 凍結分母與狀態生命週期

**位置**：`tools/catalog/tests/unit/test_sc_004.py`
**目標／來源**：隔離 `SnapshotLifecycle` 規則；AC-004、AC-009、AC-010，BDD SC-004。
**共同前置**：Draft 有已記錄的候選、證據、分類與規則。
**共同動作**：維護者 freeze 後建模，再嘗試修正判定；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-010** `SnapshotLifecycle_FrozenScope_RejectsMutation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Frozen 不允許改分母／證據／分類，修正須新 Draft。
- [x] **UT-011** `SnapshotLifecycle_RevisionFlow_RequiresValidation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：建模依 Pending、Building、Validating、Ready 流轉，失敗成 Failed。
- [x] **UT-012** `SnapshotLifecycle_PublishedContent_IsImmutable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Frozen 可更新所選 revision 並遞增 version，Published 不可改。

### 1.5 SC-005 全量發布與逐項完成證據

**位置**：`tools/catalog/tests/unit/test_sc_005.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-009、AC-017，BDD SC-005。
**共同前置**：實際來源範圍已審查且 A>0、U=0、G=0、V=A，沒有分類／品質／映射缺口。
**共同動作**：維護者要求正式發布；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-013** `CatalogCoveragePolicy_CompleteCounts_PassesGate` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：C=A+R+U 且 Ready 變體逐一與已確認分母對應。
- [ ] **UT-014** `CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：報告列出所有實際變體的來源與品質證據，不混入 fixtures。
- [ ] **UT-015** `CatalogCoveragePolicy_SingleFailedGate_PreservesHead` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：僅全部門檻通過可切換 Published，單一門檻失敗維持舊 head。

### 1.6 SC-006 驗證真實 GLB 與 Unity 產物

**位置**：`tools/catalog/tests/unit/test_sc_006.py`
**目標／來源**：隔離 `ModelValidationService` 規則；AC-005、AC-007、AC-025，BDD SC-006。
**共同前置**：代表普通磚、薄板、透明件、印刷人物、Technic 及 DUPLO 的來源已具備。
**共同動作**：轉換並檢驗各模型及 RuntimeBuild；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-016** `ModelValidationService_SelfContainedGltf_AcceptsReport` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：GLB 自含 mesh／buffer／紋理且 Validator 無 error，warning 有處理記錄。
- [ ] **UT-017** `ModelValidationService_PlaceholderOrMissingMaterial_RejectsReport` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：空 mesh、占位方塊、缺紋理、遺失印刷或粉紅 shader 均驗證失敗。
- [ ] **UT-018** `ModelValidationService_PlayerValidation_RequiresEveryBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Player 實際載入全部交付 RuntimeBuild 的結果逐一留存。

### 1.7 SC-007 保持來源尺寸與非對稱方向

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs`
**目標／來源**：隔離 `CoordinatePolicy` 規則；AC-006、AC-024，BDD SC-007。
**共同前置**：非對稱模型含 LDraw 點 (20,-24,10)、方向、切線、接點及尺寸。
**共同動作**：轉成 canonical 再匯入 Unity；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-019** `CoordinatePolicy_LDrawPoint_ConvertsMeters` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：canonical 點為 (0.008,0.0096,-0.004) 公尺，GLB root scale 為 1。
- [x] **UT-020** `CoordinatePolicy_CanonicalBasis_ConvertsRotation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Unity 目標點為 (0.008,0.0096,0.004)，旋轉以 M R M^-1 轉換。
- [ ] **UT-021** `CoordinatePolicy_AlreadyConvertedMesh_AvoidsSecondMirror` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：網格／法向／切線手性／面繞序／metadata 一致，匯入器既有轉換不重複鏡像。

### 1.8 SC-008 接點配對與碰撞空腔

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`
**目標／來源**：隔離 `ConnectorCompatibility` 規則；AC-008、AC-014，BDD SC-008。
**共同前置**：有 stud/tube、pin/hole、axle、clip/bar、ball/socket 及不同系列反例。
**共同動作**：驗證配對與插入後的碰撞；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-022** `ConnectorCompatibility_MatchingProfiles_AllowsPair` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：合法 profile 對及自由度可核對，不由同名 family 推定相容。
- [x] **UT-023** `ConnectorCompatibility_InsertionCavity_RemainsOpen` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：插接空腔不被整體包圍盒封死，插入 fixture 可成立。
- [x] **UT-024** `ConnectorCompatibility_RequiredConnector_RejectsMissing` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：需要接合的零件缺接點時不 Ready；無接點裝飾件可附理由。

### 1.9 SC-009 人物與建屋候選資料可供後續使用

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/UsageClassificationTests.cs`
**目標／來源**：隔離 `UsageClassification` 規則；AC-012、AC-014，BDD SC-009。
**共同前置**：已分類零件涵蓋基本人物六部位與同一建造系統。
**共同動作**：產生人物及建材候選投影；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-025** `UsageClassification_BasicSlots_RequiresSixCandidates` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：頭、身體、手、腳、頭飾、手上裝備各至少一個相容 Basic 候選。
- [ ] **UT-026** `UsageClassification_BuildingRoles_RequiresCompatibleSet` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：floor、wall、roof、opening 候選均可在同系統接合。
- [ ] **UT-027** `UsageClassification_MissingClassification_BlocksReadiness` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺部位、用途或分類時報告缺口，不發放積木或宣稱房屋完成。

### 1.10 SC-010 每個外觀版本保留品質與來源記錄

**位置**：`tools/catalog/tests/unit/test_sc_010.py`
**目標／來源**：隔離 `RevisionManifestPolicy` 規則；AC-007，BDD SC-010。
**共同前置**：同幾何有不同顏色及印刷 revision。
**共同動作**：維護者彙整輸出 manifest；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-028** `RevisionManifestPolicy_VariantViews_RequiresSixDirections` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每變體有六視圖與對照來源，不能只用同幾何一張圖代替。
- [ ] **UT-029** `RevisionManifestPolicy_Attribution_RequiresProvenance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：原始／輸出 hash、作者／授權、製作工具與來源版本完整。
- [ ] **UT-030** `RevisionManifestPolicy_RuntimeManifest_KeepsBuildIdentity` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：RuntimeBuild 另留 Editor、套件鎖定、coordinateProfile 與驗證 digest。

### 1.11 SC-011 新增貨號及冪等重建

**位置**：`tools/catalog/tests/unit/test_sc_011.py`
**目標／來源**：隔離 `RevisionBuildPolicy` 規則；AC-010，BDD SC-011。
**共同前置**：已有 Published，另有基準日後推出的新貨號及同工作鍵重試。
**共同動作**：建立較新基準的後繼快照並重跑工作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-031** `RevisionBuildPolicy_NewPart_RequiresLaterBaseline` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：新貨號進入較新基準快照，舊快照不變。
- [x] **UT-032** `RevisionBuildPolicy_SameJobKey_EnforcesIdempotency` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：同鍵同輸入重用成功結果，同鍵不同輸入回衝突 exit 5。
- [ ] **UT-033** `RevisionBuildPolicy_ChangedSource_CreatesRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：修改模型／metadata／製作工具產生新 source revision，不重用舊內容。

### 1.12 SC-012 更新後仍能讀取舊模型引用

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelReferenceResolverTests.cs`
**目標／來源**：隔離 `ModelReferenceResolver` 規則；AC-011、AC-023，BDD SC-012。
**共同前置**：存檔 fixture 引用舊 snapshot／variant／revision，新目錄已停產該變體。
**共同動作**：以精確引用解析資產並查詢新取得清單；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-034** `ModelReferenceResolver_ExactReference_PreservesRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊引用取得對應的相容 RuntimeBuild，不自動改成最新 revision。
- [ ] **UT-035** `ModelReferenceResolver_HistoricalProjection_RemainsFrozen` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊名稱／分類從凍結投影取得，不 join 最新可變資料。
- [ ] **UT-036** `ModelReferenceResolver_RetiredVariant_ExcludesNewAcquisition` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：停產變體不進入新取得清單，舊引用仍可載入。

### 1.13 SC-013 來源缺件時補建而不以占位品交付

**位置**：`tools/catalog/tests/unit/test_sc_013.py`
**目標／來源**：隔離 `ModelBuildPolicy` 規則；AC-005、AC-007、AC-018，BDD SC-013。
**共同前置**：LDraw 缺子模型、TEXMAP 或曲面支援。
**共同動作**：維護者嘗試自建／補建並重新驗證；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-037** `ModelBuildPolicy_UnsupportedSource_RecordsFailure` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未支援來源先列 Failed 與原因，不當作完成。
- [ ] **UT-038** `ModelBuildPolicy_CustomModel_KeepsEvidence` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：補建保留尺寸／外觀來源及新 revision。
- [ ] **UT-039** `ModelBuildPolicy_RepairedModel_RequiresFullValidation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只有補件後同一品質門檻全部通過才可 Ready。

### 1.14 SC-014 引擎升版重建執行期資產

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RuntimeBuildPolicyTests.cs`
**目標／來源**：隔離 `RuntimeBuildPolicy` 規則；AC-011、AC-025，BDD SC-014。
**共同前置**：source revision 未變但 Editor／URP／套件鎖定或平台改變。
**共同動作**：重新製作 RuntimeBuild 映射；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-040** `RuntimeBuildPolicy_EngineChange_PreservesSourceRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：source revision 保留，RuntimeBuild 身分隨建置輸入改變。
- [ ] **UT-041** `RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每個受支援舊引用映射到當前可載入產物。
- [ ] **UT-042** `RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不以保留舊 bundle 檔案當作相容驗證成功。

### 1.15 SC-015 單一 session 的共用查詢契約

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/BrickCatalogTests.cs`
**目標／來源**：隔離 `BrickCatalog` 規則；AC-015、AC-019，BDD SC-015。
**共同前置**：完整已發布的本地 pack 含名稱、用途、接點與覆蓋資料。
**共同動作**：呼叫 OpenAsync、QueryAsync、GetVariantAsync、GetProfilesAsync、GetCoverageAsync；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-043** `BrickCatalog_SessionQueries_KeepSnapshot` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：全部回應固定 pack／snapshot／schema 並用 Success 或 Failure 擇一。
- [ ] **UT-044** `BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：詳情包含所選來源 revision、用途／錨點／車輛 metadata，規則與覆蓋值均來自同快照。
- [ ] **UT-045** `BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只經本地資料與程式內方法取得，不啟動 HTTP 或變動擁有權。

### 1.16 SC-016 唯讀安裝與本機資料分離

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalStoragePolicyTests.cs`
**目標／來源**：隔離 `LocalStoragePolicy` 規則；AC-022、AC-025，BDD SC-016。
**共同前置**：一般使用者安裝於唯讀目錄且有獨立 Profiles 與 Diagnostics。
**共同動作**：啟動、查詢並寫入診斷紀錄；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-046** `LocalStoragePolicy_ReadOnlyCatalog_AvoidsSidecars` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：catalog.db 以唯讀開啟且不產生安裝目錄 WAL／SHM。
- [ ] **UT-047** `LocalStoragePolicy_WritableData_UsesUserRoot` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：可變資料只寫使用者可寫位置，不寫來源工具工作區。
- [ ] **UT-048** `LocalStoragePolicy_DiagnosticRecord_RedactsSecrets` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：診斷不含金鑰／完整存檔且不自動上傳。

### 1.17 SC-017 離線升級成功及解除安裝保留資料

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallUpdatePolicyTests.cs`
**目標／來源**：隔離 `InstallUpdatePolicy` 規則；AC-022、AC-023，BDD SC-017。
**共同前置**：遊戲已退出，舊 profile fixture 與版本 A 安裝完整。
**共同動作**：以完整包安裝 B，重新啟動後預設解除安裝；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-049** `InstallUpdatePolicy_ValidatedStaging_SwitchesVersion` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：B 完整 staged 且 hash 通過才切換啟動版本。
- [x] **UT-050** `InstallUpdatePolicy_Uninstall_PreservesProfile` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：安裝器與解除安裝不修改或刪除原 profile fixture。
- [ ] **UT-051** `InstallUpdatePolicy_Restart_OpensNewSessionOffline` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：重開依新 session 映射舊模型，無額外登入或下載。

### 1.18 SC-018 一致備份與失敗交易恢復

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveTransactionPolicyTests.cs`
**目標／來源**：隔離 `SaveTransactionPolicy` 規則；AC-022、AC-023，BDD SC-018。
**共同前置**：人工存檔 fixture 的 DB 與不可變組裝檔已有一致引用。
**共同動作**：執行一致備份及帶故障注入的 migration／引用更新；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-052** `SaveTransactionPolicy_CompletedBackup_PrecedesMigration` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：backup 完成後才開始 migration，備份可獨立讀回。
- [ ] **UT-053** `SaveTransactionPolicy_FailedMigration_RollsBack` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：交易失敗時 rollback，保留原 schema／資料與最後完整備份。
- [ ] **UT-054** `SaveTransactionPolicy_FileBeforeReference_AvoidsPartialState` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：組裝新檔先完整寫入再切 DB 引用，不引用不存在或半寫檔。

### 1.19 SC-019 缺漏或損毀安裝包不假裝成功

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogStartupTests.cs`
**目標／來源**：隔離 `CatalogStartup` 規則；AC-018、AC-019、AC-021、AC-025，BDD SC-019。
**共同前置**：必要 manifest／DB／bundle 分別缺失或 hash 不符。
**共同動作**：啟動或載入對應模型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-055** `CatalogStartup_MissingFiles_ReturnTypedErrors` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺目錄回 CatalogNotInstalled，缺模型回 AssetMissing，hash 錯誤回 AssetCorrupt。
- [ ] **UT-056** `CatalogStartup_MissingModel_UsesRepairMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：模型缺失文案為「此模型檔案不完整，請使用完整安裝包修復。」並提供診斷 ID。
- [ ] **UT-057** `CatalogStartup_FailedLoad_PreservesUserData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不下載替代資產、不顯示占位成功、不刪除既有存檔。

### 1.20 SC-020 非法查詢與不存在變體有明確結果

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VariantQueryValidatorTests.cs`
**目標／來源**：隔離 `VariantQueryValidator` 規則；AC-015、AC-019，BDD SC-020。
**共同前置**：含非法 enum、無效 UUID、未知有效 UUID 或跨條件 cursor 的查詢。
**共同動作**：呼叫共用查詢契約；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-058** `VariantQueryValidator_InvalidFilter_ReturnsInvalidQuery` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：非法查詢回 InvalidQuery，找不到的有效 ID 回 VariantNotFound。
- [x] **UT-059** `VariantQueryValidator_ForeignCursor_ReturnsInvalidCursor` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：跨條件或快照 cursor 回 InvalidCursor，不重設到第一頁。
- [x] **UT-060** `VariantQueryValidator_FailureEnvelope_ExcludesSuccess` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：錯誤與正常值不並存，錯誤中不出現 SQL 或堆疊。

### 1.21 SC-021 來源中斷與限流保留進度

**位置**：`tools/catalog/tests/unit/test_sc_021.py`
**目標／來源**：隔離 `SourceRetryPolicy` 規則；AC-001、AC-018，BDD SC-021。
**共同前置**：來源遇到 timeout、429 含 Retry-After 或服務中斷。
**共同動作**：製作工具依保存工作重試；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-061** `SourceRetryPolicy_RateLimitedSource_RespectsRetryLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：遵守 Retry-After 並最多自動重試 3 次，超限保留待恢復。
- [x] **UT-062** `SourceRetryPolicy_InterruptedImport_PreservesCandidates` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗不清空成功候選或把缺資料判成停產。
- [x] **UT-063** `SourceRetryPolicy_CredentialFailure_RedactsOutput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：來源憑證不寫 URL／日誌，工具失敗 exit 4。

### 1.22 SC-022 建模工作當機與重複工作鍵

**位置**：`tools/catalog/tests/unit/test_sc_022.py`
**目標／來源**：隔離 `CatalogJobPolicy` 規則；AC-010、AC-018，BDD SC-022。
**共同前置**：單項超過 10 分鐘、worker 當機或重跑已有成功輸入。
**共同動作**：工具處理失敗並恢復工作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-064** `CatalogJobPolicy_WorkerTimeout_FailsOnlyItem` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：當機／timeout 項目為 Failed，不影響其他獨立項目。
- [x] **UT-065** `CatalogJobPolicy_CompletedInput_ReusesResult` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：已完成且 input hash 相同的項目不重複製作。
- [x] **UT-066** `CatalogJobPolicy_JobConflict_ReturnsExitFive` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：過期租約可恢復，同工作鍵不同輸入回 exit 5，status 提供工作原因。

### 1.23 SC-023 發布及安裝切換失敗保留舊版本

**位置**：`tools/catalog/tests/unit/test_sc_023.py`
**目標／來源**：隔離 `AtomicPublishPolicy` 規則；AC-009、AC-018、AC-023，BDD SC-023。
**共同前置**：staging、檔案搬入、DB commit 或安裝驗證可注入空間不足與中斷。
**共同動作**：執行發布或離線更新；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-067** `AtomicPublishPolicy_IncompleteStaging_PreservesHead` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：檔案或 hash 失敗不得切 head／可啟動版本。
- [ ] **UT-068** `AtomicPublishPolicy_FailedCommit_RetainsContent` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：DB 失敗回滾且不自動刪除可能仍需使用的內容。
- [ ] **UT-069** `AtomicPublishPolicy_InterruptedUpdate_KeepsPreviousVersion` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：原版本與原存檔保持可回復，提示「更新未完成，已保留原版本與存檔。」。

### 1.24 SC-024 拒絕越界內容與不應隨包的工具

**位置**：`tools/catalog/tests/unit/test_sc_024.py`
**目標／來源**：隔離 `ContentPathPolicy` 規則；AC-019、AC-025，BDD SC-024。
**共同前置**：manifest 含 ../、絕對路徑、外部 GLB URI 或遠端 Addressables；另有含憑證的 draft。
**共同動作**：執行來源匯入與 Player 打包檢查；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-070** `ContentPathPolicy_TraversalPath_RejectsEscape` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：任意外部路徑與越界壓縮成員拒絕，不在目標範圍外寫入。
- [x] **UT-071** `ContentPathPolicy_RemoteAddress_RejectsBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Player 只解析本地 address key，遠端 catalog／自動查更新使建置失敗。
- [x] **UT-072** `ContentPathPolicy_DeveloperArtifacts_ExcludedFromPlayer` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：draft、來源 adapter、維護 CLI 及來源金鑰不進入安裝包。

### 1.25 SC-025 未知存檔版本與缺舊映射保留原檔

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs`
**目標／來源**：隔離 `SaveCompatibilityChecker` 規則；AC-011、AC-023，BDD SC-025。
**共同前置**：SaveHeader 比 reader 新、assetContract 不符或 requiredModels 缺映射。
**共同動作**：呼叫 ISaveCompatibilityChecker.Check；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-073** `SaveCompatibilityChecker_NewerSchema_RejectsWithoutWrite` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未知 schema 回 UnsupportedSchema，不覆寫存檔。
- [x] **UT-074** `SaveCompatibilityChecker_MissingRevision_DoesNotSubstitute` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺映射／不相容內容回 IncompatibleContent，不改用最新模型。
- [ ] **UT-075** `SaveCompatibilityChecker_IncompatibleSave_ReportsPreservation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：文案為「此存檔與目前版本不相容，原存檔已保留。」並列可定位診斷。

### 1.26 SC-026 原生相依或寫入權限失敗可定位

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/NativeDependencyPolicyTests.cs`
**目標／來源**：隔離 `NativeDependencyPolicy` 規則；AC-018、AC-021、AC-025，BDD SC-026。
**共同前置**：乾淨 Player 缺 SQLite DLL 或使用者資料目錄不可寫。
**共同動作**：嘗試啟動與必要資料操作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-076** `NativeDependencyPolicy_MissingNativeLibrary_ReportsRepair` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺相依顯示「必要執行檔不完整，請使用完整安裝包修復。」。
- [ ] **UT-077** `NativeDependencyPolicy_ReadOnlyUserRoot_ReturnsStorageUnavailable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不可寫回 StorageUnavailable 與「無法寫入本機資料，請檢查權限與可用空間。」。
- [ ] **UT-078** `NativeDependencyPolicy_DependencyFailure_PreservesProfiles` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不嘗試安裝線上工具、不清空既有 profile，記錄去敏診斷。

### 1.27 SC-027 空目錄與單一未解決項目不能全量發布

**位置**：`tools/catalog/tests/unit/test_sc_027.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-004、AC-009、AC-017，BDD SC-027。
**共同前置**：分別使用 A=0、U=1、G=1、V=A-1 或未分類一筆的資料。
**共同動作**：計算覆蓋率並要求發布；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-079** `CatalogCoveragePolicy_ZeroActive_AvoidsFalseComplete` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：A=0 顯示「尚無已確認基準」，不除以零或顯示 100%。
- [x] **UT-080** `CatalogCoveragePolicy_SingleGap_BlocksPublish` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：任一未知、缺口、缺 revision 或分類缺漏均阻止正式發布。
- [x] **UT-081** `CatalogCoveragePolicy_CompleteKnownSet_RequiresScopeReview` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：V/A=100% 但無涵蓋審查仍不是全量完成。

### 1.28 SC-028 分頁邊界與固定排序

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VariantPagingPolicyTests.cs`
**目標／來源**：隔離 `VariantPagingPolicy` 規則；AC-015、AC-019，BDD SC-028。
**共同前置**：同快照有 101 筆不同 variantId，篩選條件保持相同。
**共同動作**：以預設及邊界 Limit 逐頁查詢；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-082** `VariantPagingPolicy_LimitBounds_EnforcesOneToHundred` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：預設每頁 50，Limit=1 與 100 合法，0／負數／101 為 InvalidQuery。
- [x] **UT-083** `VariantPagingPolicy_StableCursor_CoversAllRows` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：固定 variantId 排序，遍歷 101 筆無重複或遺漏。
- [x] **UT-084** `VariantPagingPolicy_LastPage_HasNoCursor` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：末頁 nextCursor 為 null，空結果 items 為空集合。

### 1.29 SC-029 尺寸、接點與資產預算門檻

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs`
**目標／來源**：隔離 `MetadataValidationPolicy` 規則；AC-006、AC-008、AC-020、AC-024，BDD SC-029。
**共同前置**：資料分別在尺寸容差／接點誤差／大小上限及其相鄰兩側，另有 NaN、Infinity、負尺寸。
**共同動作**：驗證 metadata 及輸出預算；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-085** `MetadataValidationPolicy_ToleranceBoundary_UsesInclusiveLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：尺寸誤差 ≤ max(0.1 mm,0.5%×參考尺寸)，接點誤差 ≤0.05 mm 才通過。
- [x] **UT-086** `MetadataValidationPolicy_NonFiniteMetadata_RejectsInput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：非有限數值、非正尺寸或非正 world scale 失敗，法向與切線須正規化。
- [x] **UT-087** `MetadataValidationPolicy_AssetBudget_EnforcesEachLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：GLB ≤20 MiB、紋理每邊 ≤2048、預覽 ≤256 KiB；來源壓縮大小不冒充 runtime 記憶體。

### 1.30 SC-030 同時發布及歷史內容一致性

**位置**：`tools/catalog/tests/unit/test_sc_030.py`
**目標／來源**：隔離 `PublishConcurrencyPolicy` 規則；AC-009、AC-010、AC-018，BDD SC-030。
**共同前置**：兩個工作以相同 expected-head-version 要求發布。
**共同動作**：同時嘗試 CAS 交易並讀取結果；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-088** `PublishConcurrencyPolicy_SameHeadVersion_AllowsOneWinner` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只有一個工作成功切 head，另一個回版本衝突。
- [ ] **UT-089** `PublishConcurrencyPolicy_LosingPublisher_CannotOverwrite` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗工作不能覆寫成功結果或刪除已發布資產。
- [ ] **UT-090** `PublishConcurrencyPolicy_ExistingSession_RemainsStable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊 session 的投影與精確 revision 不跟著 head 改動。

### 1.31 SC-031 特殊款不能透過直接查詢取得權益

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/AcquisitionEligibilityTests.cs`
**目標／來源**：隔離 `AcquisitionEligibility` 規則；AC-013、AC-014、AC-015，BDD SC-031。
**共同前置**：模型庫含 Basic、Advanced、Special 與外觀可用但不可建造的件。
**共同動作**：以 CharacterCreation、InitialBucket 及 Browse 查詢；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-091** `AcquisitionEligibility_AcquisitionPurpose_ExcludesSpecial` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：人物建立與桶查詢均排除 Special，前者檢查 creationEligible，後者檢查 bucketEligible／BuildSystem。
- [ ] **UT-092** `AcquisitionEligibility_BrowseRead_DoesNotGrantItem` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Browse 或精確載入可讀模型資料但不增加庫存／人物資格。
- [ ] **UT-093** `AcquisitionEligibility_SpecialSources_RemainRestricted` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Special 的來源保持聯名／成就／活動，不因分類改動自動發放。

### 1.32 SC-032 資產引用生命週期與主執行緒

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs`
**目標／來源**：隔離 `ModelLeasePolicy` 規則；AC-026，BDD SC-032。
**共同前置**：兩個使用者共用 mesh／材質，載入可能成功、失敗或取消。
**共同動作**：AcquireAsync 後以不同順序 Dispose，包括重複 Dispose；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-094** `ModelLeasePolicy_DoubleDispose_ReleasesOnce` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每份 lease 只釋放自己的 reference，重複 Dispose 安全。
- [ ] **UT-095** `ModelLeasePolicy_SharedActiveHandle_RemainsAlive` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：取消／失敗後已建立而未使用的 handle 均釋放，不提前釋放另一份仍使用資產。
- [x] **UT-096** `ModelLeasePolicy_UnityOperation_RequiresMainThread` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Unity 物件建立／操作／銷毀只在主執行緒，背景僅處理資料與 IO。

### 1.33 SC-033 斷網安裝後首次進入模型預覽

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-016、AC-021、AC-025，BDD SC-033。
**共同前置**：乾淨 Windows x64 無 Editor／SDK／Blender／Python／資料庫服務且已斷網。
**共同動作**：安裝完整包並首次啟動 CatalogPreviewScene；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-097** `CatalogPreviewPresenter_OfflineStartup_ShowsPreview` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：顯示「模型預覽」與可用的搜尋、篩選、模型資訊，不要求登入。
- [x] **UT-098** `CatalogPreviewPresenter_PendingLoad_ShowsLoading` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：載入時顯示「正在載入本機模型…」，未完成前不假報可操作成功。
- [ ] **UT-099** `CatalogPreviewPresenter_BundledAssets_AvoidsRemoteDependency` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：實際 3D 模型由包內 SQLite／Addressables 取得，不依賴開發快取或下載。

### 1.34 SC-034 搜尋篩選與切換外觀

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-015、AC-016，BDD SC-034。
**共同前置**：已載入同快照的多系列、多款式及不同印刷變體。
**共同動作**：輸入貨號／名稱並依系列、款式、部位篩選後選取變體；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-100** `CatalogPreviewPresenter_CombinedFilters_SelectsMatchingRows` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：貨號精確匹配優先，名稱可部分匹配，所有篩選共同作用。
- [x] **UT-101** `CatalogPreviewPresenter_SelectedItem_ShowsFrozenDetails` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：清單與詳情使用同快照，展示所選名稱、版本及尺寸。
- [x] **UT-102** `CatalogPreviewPresenter_AppearanceSelection_ChangesModel` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：切換顏色或印刷時 3D 外觀與 variantId 一致，不只改文字。

### 1.35 SC-035 旋轉縮放與鍵盤操作不互相干擾

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs`
**目標／來源**：隔離 `PreviewCameraController` 規則；AC-016，BDD SC-035。
**共同前置**：模型預覽可操作且搜尋欄可取得焦點。
**共同動作**：拖曳、滾輪、重設視角並使用鍵盤搜尋／篩選／選取／重試／重設；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-103** `PreviewCameraController_CameraInput_UpdatesView` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：拖曳旋轉、滾輪縮放及重設可觀察真實 3D 模型。
- [x] **UT-104** `PreviewCameraController_TextFocus_BlocksCameraInput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：文字輸入焦點阻止模型旋轉與遊戲快捷鍵被同步觸發。
- [ ] **UT-105** `PreviewCameraController_KeyboardNavigation_ReachesControls` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：所有規定的清單／按鈕操作可用鍵盤完成，窄視窗上下排列而不遮住必要控制。

### 1.36 SC-036 玩具材質、印刷與透明外觀核對

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/MaterialPreviewPolicyTests.cs`
**目標／來源**：隔離 `MaterialPreviewPolicy` 規則；AC-005、AC-007、AC-025，BDD SC-036。
**共同前置**：實際來源包含塑膠、橡膠、透明與印刷且已有六視圖。
**共同動作**：在封裝 Player 用固定光照觀察各變體；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-106** `MaterialPreviewPolicy_MaterialAssignment_PreservesAppearance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：塑膠／橡膠／透明材質有可辨差異，印刷位置與來源相符。
- [ ] **UT-107** `MaterialPreviewPolicy_LightingPreset_PreservesReadability` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：反射與柔光不以過曝遮住接縫、倒角或缺材質。
- [ ] **UT-108** `MaterialPreviewPolicy_PlayerEvidence_RequiredForAcceptance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每個變體有 Player 畫面證據與版本資料，純 PNG 或 Editor 畫面不能取代。

### 1.37 SC-037 搜尋空狀態可以清除條件恢復

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-015、AC-016，BDD SC-037。
**共同前置**：目錄可用但目前篩選不符合任何變體。
**共同動作**：搜尋完成後再按清除條件；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-109** `CatalogPreviewPresenter_NoMatches_ShowsEmptyMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：空狀態顯示「找不到符合條件的模型。」而不假造模型。
- [x] **UT-110** `CatalogPreviewPresenter_EmptyState_KeepsClearAction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保留可操作的「清除條件」入口。
- [x] **UT-111** `CatalogPreviewPresenter_ClearFilters_RestoresResults` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：清除後重查當前快照並回復有效清單，不變更目錄資料。

### 1.38 SC-038 模型錯誤不阻止選擇其他可用模型

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-016、AC-018、AC-025，BDD SC-038。
**共同前置**：一個模型損毀且另一個可正常載入。
**共同動作**：選取損毀模型後改選正常模型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-112** `CatalogPreviewPresenter_CorruptModel_ShowsRepairGuidance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗顯示「此模型檔案不完整，請使用完整安裝包修復。」及診斷 ID。
- [x] **UT-113** `CatalogPreviewPresenter_FailureView_DoesNotFakeSuccess` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不以占位圖示宣稱成功，也不暴露堆疊／來源金鑰。
- [x] **UT-114** `CatalogPreviewPresenter_OtherModel_RemainsSelectable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：其他可用模型仍可選取並正確呈現，既有存檔不變。

### 1.39 SC-039 快速換件僅呈現最新選擇

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs`
**目標／來源**：隔離 `SelectionRequestPolicy` 規則；AC-016、AC-026，BDD SC-039。
**共同前置**：A 載入慢、B 載入快。
**共同動作**：先選 A 隨即選 B，並令 A 最後才完成；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-115** `SelectionRequestPolicy_LateResult_DoesNotOverrideSelection` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：最後畫面僅呈現 B，A 不覆蓋 B 的模型或詳情。
- [x] **UT-116** `SelectionRequestPolicy_DiscardedResult_ReleasesHandle` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：A 可取消或丟棄結果，但其多餘 handle 必須釋放。
- [x] **UT-117** `SelectionRequestPolicy_RequestVersion_KeepsLoadingAccurate` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：快速反覆切換後 loading 狀態對應目前請求，不被舊結果關閉或卡住。

### 1.40 SC-040 重試等待期間防止重複啟動

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs`
**目標／來源**：隔離 `RetryRequestPolicy` 規則；AC-016、AC-026，BDD SC-040。
**共同前置**：可重試的暫時載入失敗已顯示「載入失敗，請重試。」。
**共同動作**：使用者連續按重試而第一次仍處理中；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-118** `RetryRequestPolicy_PendingRetry_DisablesButton` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：按鈕顯示「重試中…」且同一請求未完成前禁用。
- [x] **UT-119** `RetryRequestPolicy_DuplicateRetry_StartsOneRequest` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：相同重試只啟動一次，未取消正常模型切換能力。
- [x] **UT-120** `RetryRequestPolicy_RetryCompletion_RestoresAction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：完成或再失敗後恢復操作；不可重試的缺檔錯誤改指向完整包修復。

### 1.41 SC-041 離開預覽釋放資源並可再進入

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewLifecycleTests.cs`
**目標／來源**：隔離 `PreviewLifecycle` 規則；AC-016、AC-026，BDD SC-041。
**共同前置**：預覽持有 lease、instance、render texture 及待完成載入。
**共同動作**：離開場景，待舊請求完成後重新進入；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-121** `PreviewLifecycle_ExitScene_ReleasesOwnedResources` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：離開時釋放 session、lease、instance 與臨時 render texture。
- [ ] **UT-122** `PreviewLifecycle_LateCompletion_IgnoresDestroyedView` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未完成請求返回後不碰已銷毀 UI 且釋放未使用 handle。
- [ ] **UT-123** `PreviewLifecycle_ReenterScene_OpensFreshSession` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：重新進入可開新 session，共用仍被使用的 mesh／材質保持有效。

### 1.42 SC-042 圖形裝置不支援時回報啟動失敗

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/GraphicsCapabilityPolicyTests.cs`
**目標／來源**：隔離 `GraphicsCapabilityPolicy` 規則；AC-016、AC-021，BDD SC-042。
**共同前置**：圖形裝置不支援指定的原生 3D 執行條件。
**共同動作**：啟動安裝版預覽；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-124** `GraphicsCapabilityPolicy_UnsupportedGraphics_ProvidesMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：玩家可取得「目前圖形裝置不支援本遊戲，請檢查顯示驅動與系統需求。」。
- [ ] **UT-125** `GraphicsCapabilityPolicy_MissingDevice_FailsVisualAcceptance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不把只能顯示 PNG 或未建立 3D 裝置的結果標成通過。
- [ ] **UT-126** `GraphicsCapabilityPolicy_GraphicsFailure_PreservesData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保留診斷與原存檔，不強制連線修復。

### 1.43 SC-043 本地查詢與單件冷載入時間

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PerformanceGateTests.cs`
**目標／來源**：隔離 `PerformanceGate` 規則；AC-020，BDD SC-043。
**共同前置**：SSD 基準機及 max(100000,A) 筆 metadata 與可載入模型。
**共同動作**：暖機後查詢 1000 次，另測單模型冷載入；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-127** `PerformanceGate_QuerySamples_ApplySeparateP95Limits` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：50 筆分頁查詢 P95 ≤100 ms、詳情 P95 ≤50 ms，資產載入不混計。
- [ ] **UT-128** `PerformanceGate_ColdModel_UsesThreeSecondLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：單模型冷載入至第一個正確畫面 ≤3 秒且顯示載入狀態。
- [ ] **UT-129** `PerformanceGate_BenchmarkRecord_RequiresEnvironment` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：紀錄 CPU／GPU／驅動／套件／manifest 與 cold 定義，不以主執行緒同步查詢。

### 1.44 SC-044 2026 片畫面與實際 Player 流暢度

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/FramePerformanceGateTests.cs`
**目標／來源**：隔離 `FramePerformanceGate` 規則；AC-020、AC-025，BDD SC-044。
**共同前置**：固定 manifest 含至少 2026 可見積木、8 類幾何、印刷與透明件，指定 1080p Medium 基準機。
**共同動作**：用非 Development Standalone 關閉 VSync／幀率上限，暖機30秒後量測60秒且操作 UI；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-130** `FramePerformanceGate_SceneManifest_RequiresRepresentativeBricks` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：場景量與幾何組合達門檻，不能用同款低面數方塊替代。
- [ ] **UT-131** `FramePerformanceGate_FrameSamples_EnforcesBothLimits` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：平均 ≥60 FPS 且 P95 frame time ≤20 ms，載入段單獨統計。
- [ ] **UT-132** `FramePerformanceGate_PlayerRun_RequiresMatchedEnvironment` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保存原始 frame 資料、畫面證據與環境；Editor／另一硬體結果不得冒充基準機通過。

### 1.45 SC-045 多輪切換的記憶體與快取上限

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ResourceCachePolicyTests.cs`
**目標／來源**：隔離 `ResourceCachePolicy` 規則；AC-020、AC-026，BDD SC-045。
**共同前置**：固定20模型含共用資產且有可回收與仍使用項目。
**共同動作**：切換5輪並離開預覽，量測 handles／mesh／texture 與記憶體；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-133** `ResourceCachePolicy_UnusedCache_EnforcesBudget` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：無使用引用的快取以 LRU 控制估計 ≤256 MiB。
- [ ] **UT-134** `ResourceCachePolicy_ActiveAssets_AvoidsEviction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：仍使用資產獨立統計且不被快取清除。
- [ ] **UT-135** `ResourceCachePolicy_RepeatedCycles_DetectsLeak` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：釋放後物件與 handles 回到允許快取範圍，不每輪持續累積。

### 1.46 SC-046 輪組尺度與有限接觸原型

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VehicleMetadataPolicyTests.cs`
**目標／來源**：隔離 `VehicleMetadataPolicy` 規則；AC-008、AC-024，BDD SC-046。
**共同前置**：不同輪徑／軸距 fixture 有局部輪軸、碰撞體與質量來源標記。
**共同動作**：以統一世界倍率建立有限輪組坡道／路肩接觸原型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-136** `VehicleMetadataPolicy_WorldScale_KeepsWheelGeometryAligned` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：模型、輪半徑、錨點及碰撞同倍率且 profile 可追溯。
- [ ] **UT-137** `VehicleMetadataPolicy_UnknownMass_PreservesEvidenceState` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：massKg 的 Measured／Estimated／Unknown 不混同，未知不冒充已核實性能。
- [ ] **UT-138** `VehicleMetadataPolicy_ContactFixture_DoesNotClaimRaceComplete` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：主要車身剛體與簡化碰撞的接觸結果留存，不宣稱完成車輛性能演算法或三賽道。

### 1.47 SC-047 隔離技術預覽與正式全量交付

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewPackagePolicyTests.cs`
**目標／來源**：隔離 `PreviewPackagePolicy` 的規則／狀態判定；AC-027、SC-047、GAP-001，SPEC §13.1。
**共同前置**：Frozen固定版本含已驗證代表資產、Unknown與Retired反例，正式全量尚有缺口。
**共同動作**：建置並安裝Preview，再以Release開啟該包及請求正式取得用途。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-019、CT-010、ET-015 驗證。

- [ ] **UT-139** `SelectPreview_MixedStatuses_ExcludesRetiredAndLabelsUnknown` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Preview僅含Ready且RuntimeBuild通過及使用條件可核對的非Retired代表件，Unknown顯示「生產狀態待查」；顯示「技術預覽・非完整模型庫」與完整C/A/R/U/G/V及子集合數。
- [ ] **UT-140** `OpenPackage_PreviewInRelease_ReturnsIncompatibleContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Release回IncompatibleContent及「此資產包僅供技術預覽，不能作為正式遊戲資料。」；包類型鎖在建置，不可改設定繞過。
- [ ] **UT-141** `AuthorizePreview_FormalPurpose_RejectsWithoutGrant` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Preview資料根獨立且只可Browse，不發道具、不寫正式進度、不匯入正式profile、不切正式head，畫面通過不提高全量完成度。

### 1.48 SC-048 先驗證Frozen候選再發布已驗證內容

**位置**：`tools/catalog/tests/unit/test_sc_048.py`
**目標／來源**：隔離 `ValidationPromotionPolicy` 的規則／狀態判定；AC-028、SC-048、GAP-002，SPEC §13.2。
**共同前置**：Frozen快照及固定選件、工具鏈、target摘要，另備變更後快照與上一版head。
**共同動作**：執行BuildValidationContent後嘗試發布及BuildCatalogContent。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-020、IT-021 驗證。

- [ ] **UT-142** `ValidateCandidate_FrozenSnapshot_LeavesHeadUnchanged` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：驗證只產生不可變staging與validation_builds證據，不需先Published也不切head；Preview可引用合格子集合。
- [ ] **UT-143** `PromoteCandidate_ChangedDigest_RejectsStaleReport` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：正式發布需全量門檻且snapshot/version/selection/toolchain/target與通過報告一致；任一變更拒絕舊報告。
- [ ] **UT-144** `CommitPublication_CasConflict_PreservesPreviousHead` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：發布以CAS提交已驗證build，失敗保留head；BuildCatalogContent只封裝Published的精確已驗證產物，再建Player與安裝包。

### 1.49 SC-049 更新與啟動共用互斥且身分穩定

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs`
**目標／來源**：隔離 `InstallLifecyclePolicy` 的規則／狀態判定；AC-029、SC-049、GAP-003，SPEC §13.3。
**共同前置**：既有Release人工profile與另一個Preview資料根；安裝器與啟動器競爭同一安裝路徑。
**共同動作**：在更新預檢至切換期間重啟遊戲，另測遊戲先持鎖及無寫入權限。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-022、ET-016 驗證。

- [x] **UT-145** `ResolveProfile_StableIdentity_PreservesRoot` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：CompanyName固定GameNenStyle；Release BrickHigh/com.gamenenstyle.brickhigh、Preview BrickHighPreview/com.gamenenstyle.brickhigh.preview，升級沿用各自資料根。
- [x] **UT-146** `AcquireLifecycle_CompetingOwners_AllowsOneOwner` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：以applicationId與canonical installRoot共用生命週期鎖，安裝器從預檢持至提交、啟動器持至Player退出，同一使用者同一安裝只允許一個Player。
- [x] **UT-147** `InstallUpdate_NoPermission_PreservesPackageAndProfile` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：競爭顯示「遊戲或更新程序正在執行，請關閉後再試。」並不切換內容；權限失敗保留舊包與profile，不強殺、不新建第二資料庫。

### 1.50 SC-050 降版及備份失敗不擅自回退進度

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveRecoveryPolicyTests.cs`
**目標／來源**：隔離 `SaveRecoveryPolicy` 的規則／狀態判定；AC-030、SC-050、GAP-004，SPEC §13.4。
**共同前置**：人工F-Save含升版前完整備份、新版schema與新增進度；不使用私人正式存檔。
**共同動作**：檢查降版相容性，注入備份中斷，再在驗收harness選擇取消或確認還原。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 CT-011、IT-023、ET-017 驗證。

- [x] **UT-148** `CheckSave_NewerSchema_BlocksWritableConnection` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Compatible或MigrationRequired以CompatibilityReport回報，未知schema回UnsupportedSchema且不開可寫連線，提示「此存檔版本較新，已保留目前進度。請使用相容版本開啟。」。
- [ ] **UT-149** `CommitBackup_InvalidTemporaryCopy_PreservesLastGood` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：備份先一致複製至暫存再驗證提交，失敗不覆蓋最後良好備份；migration交易失敗回滾，不改目前進度。
- [ ] **UT-150** `RestoreSave_NoConfirmation_PreservesCurrentProgress` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：提示「還原將回到所選備份的進度；目前資料會另行保留。」並列版本與時間；未確認、取消或失敗不替換目前資料，確認還原仍另存較新資料；正式玩家還原UI留後續SPEC。

### 1.51 SC-051 完整模型引用與包身分必須一致

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RuntimeReferencePolicyTests.cs`
**目標／來源**：隔離 `RuntimeReferencePolicy` 的規則／狀態判定；AC-031、SC-051、GAP-005，SPEC §13.5。
**共同前置**：真實SQLite具不同snapshot/variant/revision/target及manifest正反例。
**共同動作**：開啟包並解析正常、混搭、遺失歷史引用與未知schema。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-024、CT-012 驗證。

- [ ] **UT-151** `ResolveReference_MixedTuple_RejectsWrongOwner` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：runtime_models與runtime_builds以完整複合PK/FK/unique約束歸屬及target，每組ModelReference只解析唯一符合版本，不回退最新。
- [ ] **UT-152** `ValidateManifest_FieldMismatch_ReturnsIncompatibleContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：manifest與runtime_meta的pack/snapshot/schema/applicationId/packageKind/target逐項一致，錯配回IncompatibleContent，未知schema回UnsupportedSchema。
- [ ] **UT-153** `ResolveLegacy_MissingRevision_DoesNotUseLatest` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：損毀資料回AssetCorrupt，缺少必要歷史引用回IncompatibleContent；拒絕前不載入錯件或改動存檔。

### 1.52 SC-052 輸入邊界與取消順序具有精確契約

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs`
**目標／來源**：隔離 `CatalogInputPolicy` 的規則／狀態判定；AC-032、SC-052、GAP-006，SPEC §13.6。
**共同前置**：含中文、引號、百分號、底線的目錄，合法及null/disposed/跨包session與預先取消token。
**共同動作**：呼叫查詢、載入及相容性介面，參數化測試邊界與取消競態。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 CT-013、CT-014、IT-025 驗證。

- [ ] **UT-154** `ValidateInput_InvalidSessionOrDto_ReturnsInvalidQuery` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：未取消時null DTO/session、disposed/偽造/跨包session、非法enum/UUID或Limit不在1至100回InvalidQuery；空requiredModels仍驗header、重複引用去重且逐件查核。
- [x] **UT-155** `ValidateText_ScalarAndCursorBounds_ReturnsSpecifiedError` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：QueryText null/空代表不篩選，至多256 Unicode scalar且UTF16有效；Cursor null/空為首頁、至多4096 ASCII，錯誤/跨查詢回InvalidCursor；中文、引號、%及_為參數化字面搜尋。
- [ ] **UT-156** `CancelRequest_PreCancelledInvalidInput_ReturnsCancelled` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：預先取消優先回Cancelled且無IO/handle配置；中途取消釋放資源；InvalidQuery與InvalidCursor顯示第13.6節文案，取消不彈警報。

### 1.53 SC-053 實際檔案目標與新載入內容不可繞過驗證

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetIntegrityPolicyTests.cs`
**目標／來源**：隔離 `AssetIntegrityPolicy` 的規則／狀態判定；AC-033、SC-053、GAP-007，SPEC §13.7。
**共同前置**：允許根目錄、相似前綴目錄、越界junction與已驗證後同大小替換的bundle。
**共同動作**：解析資產最終路徑並在快取命中、新程序與hash後讀取競態下重新載入。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-026、IT-027 驗證。

- [ ] **UT-157** `ResolveAsset_ReparseOrPrefixEscape_RejectsTarget` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：最終解析路徑必須在指定包或暫存根內；拒絕reparse point越界，不只比對字串前綴，不讀取根外內容。
- [ ] **UT-158** `ValidateCache_ChangedFileIdentity_RequiresHash` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：驗證快取綁pack/expectedDigest/最終路徑/fileIdentity；新程序、替換或無可靠身分時不能沿用跨讀取判定，新load核對實際bytes。
- [ ] **UT-159** `LoadVerified_BytesChangedBeforeRead_RejectsUnverifiedContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：hash至loader間保護檔案不被寫換或傳入已驗證stream；損毀拒絕且不改玩家資料，既有記憶體lease可共用；不宣稱hash是簽章或DRM。

### 1.54 SC-054 真實畫面基準、繁中字型與原生失敗通知

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VisualAcceptancePolicyTests.cs`
**目標／來源**：隔離 `VisualAcceptancePolicy` 的規則／狀態判定；AC-034、SC-054、GAP-008，SPEC §13.8。
**共同前置**：可安裝Preview含代表模型、隨包繁中文字型與授權；另備缺字、缺材質及無3D裝置反例。
**共同動作**：提交固定六視圖與操作錄影請使用者核准，並驗證渲染回歸及啟動器通知。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 ET-018、ET-019、ET-020 驗證。

- [ ] **UT-160** `ApproveVisual_NoUserDecision_RemainsUnapproved` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：實際Player代表模型畫面核准後記錄visualBaselineId、光照/鏡頭/材質digest、版本、日期及意見，未核准不得自稱既定風格通過。
- [ ] **UT-161** `EvaluateVisual_VisibleDefect_FailsAcceptance` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：缺字、印刷缺失/鏡像、粉紅shader、過曝等可見缺陷不通過；跨GPU不要求像素全等，關鍵外觀改動重新核准，繁中字型及fallback斷網可用。
- [ ] **UT-162** `DescribeStartup_UnknownCause_UsesHonestNativeMessage` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：BrickHighLauncher.exe在無Unity圖形裝置時仍有Windows原生通知與診斷；未知原因用「遊戲未能完成啟動，請檢查安裝檔與顯示驅動。」；正常啟動無多餘console且必要相依隨包。

### 1.55 SC-055 不同硬體及品質設定不可冒充基準效能

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/BenchmarkEvidencePolicyTests.cs`
**目標／來源**：隔離 `BenchmarkEvidencePolicy` 的規則／狀態判定；AC-035、SC-055、GAP-009，SPEC §13.9。
**共同前置**：本機Iris Xe探索環境與SPEC基準機，固定BenchmarkProfile及改設定反例。
**共同動作**：執行實際Player冷啟動、首次模型載入、熱載入與2026片穩態量測。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 ET-021、ET-022 驗證。

- [ ] **UT-163** `EvaluateBenchmark_DifferentHardware_MarksExploratory` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Iris Xe結果只作探索，正式以GTX1660/i5-10400/16GiB/SSD或另行核准硬體驗收，不同硬體不標基準通過。
- [ ] **UT-164** `CompareBenchmark_ChangedProfile_RejectsMixedResults` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：profile記錄1920x1080/renderScale1/動態解析度關閉及已核准AA/陰影/光照/透明比例/相機/UI/套件digest；設定變更另建profile，未凍結不能算Medium驗收。
- [ ] **UT-165** `MeasureFirstFrame_PlaceholderVisible_DoesNotStopTimer` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Acquire至第一個正確mesh/材質/紋理畫面包含hash且≤3秒；冷暖與OS快取條件分列，2026片8類幾何關VSync上限暖30秒測60秒，平均≥60FPS且P95≤20ms，保留原始資料與畫面。

### 1.56 SC-056 輪組單位、未知質量與配對原型可核對

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/WheelMetadataPolicyTests.cs`
**目標／來源**：隔離 `WheelMetadataPolicy` 的規則／狀態判定；AC-036、SC-056、GAP-010，SPEC §13.10。
**共同前置**：至少兩種輪徑與兩種軸距，合法及非法輪胎/輪圈/軸配對，Measured/Estimated/Unknown質量資料。
**共同動作**：驗證metadata並在固定坡道/路肩與WorldScaleProfile建立靜態和動態原型。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-028、IT-029 驗證。

- [x] **UT-166** `ValidateWheelGeometry_InvalidDimensions_ExcludesCandidate` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：radiusMeters/widthMeters有限且>0、axleDirection為canonical局部正規化；必要尺寸未知不填0且不進輪組候選，但保留外觀資產。
- [x] **UT-167** `ValidateMass_UnknownEvidence_RequiresNullAndReason` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Measured/Estimated有有限正massKg與來源理由；Unknown為null且附原因，不帶入虛構重量或性能。
- [ ] **UT-168** `MatchWheelProfile_IncompatiblePair_RejectsAssembly` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：不相容配對拒絕；合法靜態軸心/模型/碰撞誤差符合§4.3，記錄scale/坡度/路肩高度/速度/物理設定及實際動態接觸與跳動，不宣稱完成MVP-002。

## 2️⃣ 集成測試（Integration Tests）

真實協作必須跨過本節列明的邊界，不只驗證 mock 呼叫次數。每個對應場景的三項結果均為本案例斷言，不可只挑 Happy Path。

### IT-001 SourceCatalog

**位置**：`tools/catalog/tests/integration/test_source_catalog.py`

- [x] **IT-001** `RunSourceCatalog_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-001、SC-002、SC-003。
  - 前置：真實 SQLite、受控來源檔、FK／unique 與日期資料，不使用真實來源服務作為離線測試前置。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-002 PublishGate

**位置**：`tools/catalog/tests/integration/test_publish_gate.py`

- [ ] **IT-002** `RunPublishGate_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-004、SC-005、SC-027。
  - 前置：真實 SQLite 與不可變內容庫，逐門檻缺一的完整正反例。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-003 ModelPipeline

**位置**：`tools/catalog/tests/integration/test_model_pipeline.py`

- [ ] **IT-003** `RunModelPipeline_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-006、SC-010、SC-013。
  - 前置：真實 Blender、已鎖定轉換器、glTF Validator 與代表資產，不能 mock 轉換器。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-004 CoordinateAndConnectors

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`

- [ ] **IT-004** `RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-007、SC-008、SC-029。
  - 前置：實際 glTFast 匯入 mesh、metadata、碰撞配對與非對稱 fixture。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-005 UsageProjection

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/UsageProjectionTests.cs`

- [ ] **IT-005** `RunUsageProjection_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-009、SC-031。
  - 前置：真實 catalog.db、六部位與同系統建材，含 Special／無分類反例。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-006 JobRecovery

**位置**：`tools/catalog/tests/integration/test_job_recovery.py`

- [ ] **IT-006** `RunJobRecovery_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-011、SC-022。
  - 前置：真實工作 DB、可受控終止的 Blender worker、可控制時鐘與租約。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-007 LegacyRuntime

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/LegacyRuntimeTests.cs`

- [ ] **IT-007** `RunLegacyRuntime_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-012、SC-014。
  - 前置：兩個來源快照、歷史投影與當前引擎重建的舊引用資產。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-008 ReadContract

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs`

- [ ] **IT-008** `RunReadContract_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-015、SC-028。
  - 前置：真實唯讀 SQLite、101 筆與多篩選組合，不 mock repository。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-009 NativeStorage

**位置**：`game/Assets/BrickHigh/Tests/Player/NativeStorageTests.cs`

- [ ] **IT-009** `RunNativeStorage_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-016、SC-026。
  - 前置：真實 Windows Player 原生 DLL、含中文與空格的路徑、唯讀安裝區與不可寫使用者區。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-010 InstallerSwitch

**位置**：`tools/acceptance/tests/test_installer_switch.py`

- [ ] **IT-010** `RunInstallerSwitch_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-017、SC-023。
  - 前置：隔離 Windows 測試機中的真實安裝包 A／B，逐階段故障注入，不操作個人正式存檔。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-011 SaveFixtures

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/SaveFixtureTests.cs`

- [ ] **IT-011** `RunSaveFixtures_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-018、SC-025。
  - 前置：真實 SQLite backup／transaction，人工 SaveHeader 與不可變檔案；不實作其他模組資料表。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-012 PackageValidation

**位置**：`tools/acceptance/tests/test_package_validation.py`

- [ ] **IT-012** `RunPackageValidation_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-019、SC-024。
  - 前置：實際安裝包清單與受控損毀版本，含越界、缺檔及遠端相依反例。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-013 ExternalRetry

**位置**：`tools/catalog/tests/integration/test_external_retry.py`

- [x] **IT-013** `RunExternalRetry_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-021。
  - 前置：本機受控來源 stub 回 429／timeout，注入 fake clock；不可冒充全量來源證據。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-014 ConcurrentPublish

**位置**：`tools/catalog/tests/integration/test_concurrent_publish.py`

- [ ] **IT-014** `RunConcurrentPublish_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-030。
  - 前置：兩個 SQLite connection／程序競爭同 head，核對獲勝者與交易回滾。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-015 AssetLifetime

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/AssetLifetimeTests.cs`

- [ ] **IT-015** `RunAssetLifetime_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-032、SC-039、SC-041。
  - 前置：真實 Addressables handles、共用 mesh／材質與可控制完成次序的載入邊界。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-016 PreviewInteractions

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/PreviewInteractionTests.cs`

- [ ] **IT-016** `RunPreviewInteractions_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-033、SC-034、SC-035、SC-037、SC-038、SC-040、SC-042。
  - 前置：uGUI／Input System 與實際場景；故障由測試 seam 注入，不能代替真實無圖形裝置 E2E。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-017 VisualVariants

**位置**：`game/Assets/BrickHigh/Tests/Player/VisualVariantTests.cs`

- [ ] **IT-017** `RunVisualVariants_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-036。
  - 前置：封裝 Player 的代表材質與逐變體畫面證據，固定相機／燈光並對照來源。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-018 PerformanceFixtures

**位置**：`game/Assets/BrickHigh/Tests/Player/PerformanceFixtureTests.cs`

- [ ] **IT-018** `RunPerformanceFixtures_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-043、SC-044、SC-045、SC-046。
  - 前置：實際 SQLite、代表場景、記憶體與輪組原型，紀錄硬體及原始量測；不能用假的 profiler 數據。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-019 BuildPreview

**位置**：`tools/catalog/tests/integration/test_it_019.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-019** `BuildPreview_IncompleteCatalog_LabelsNonRelease` — @critical
  - 目標／BDD：SC-047；AC-027；SPEC §13.1。
  - 前置：真實Frozen SQLite與可轉換的非Retired代表模型；另備缺使用條件、未Ready件。
  - 動作：實際BuildValidationContent及BuildPreviewPlayer；讀回包manifest與目錄。
  - 預期：只封裝合格子集；含packageKind/applicationId/sourceSnapshotStatus/sourceSelectionDigest/previewCompleteness，保留全量缺口與非完整標記，正式head不動。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-020 BuildValidation

**位置**：`tools/catalog/tests/integration/test_it_020.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-020** `BuildValidation_FrozenSnapshot_ProducesStagingOnly` — @critical
  - 目標／BDD：SC-048；AC-028；SPEC §13.2。
  - 前置：真實Frozen快照、上一版head及Unity批次驗證工具鏈。
  - 動作：未Published先執行BuildValidationContent；檢查DB紀錄及staging，再由合格子集建Preview。
  - 預期：能走完而不循環等待Published；validation_builds保存全部摘要與結果，正式head不變；失敗結果不能被發布引用。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-021 PromoteBuild

**位置**：`tools/catalog/tests/integration/test_it_021.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-021** `PromoteBuild_ChangedSourceDigest_RejectsPromotion` — @critical
  - 目標／BDD：SC-048；AC-028；SPEC §13.2。
  - 前置：已通過validation_build與真實DB；逐列改snapshot版本/選件/工具鏈/target及CAS競爭。
  - 動作：對每個變更呼叫catalog publish；另跑完全一致正例並BuildCatalogContent。
  - 預期：任何摘要不符或CAS失敗拒絕且head不變；正例先滿足全量fixture門檻才Published並精確封裝，不把fixture當實際來源完成。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-022 Update

**位置**：`tools/acceptance/tests/integration/test_it_022.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-022** `Update_GameRestartsDuringStaging_DefersSwitch` — @critical
  - 目標／BDD：SC-049；AC-029；SPEC §13.3。
  - 前置：真實兩個Windows程序、暫存安裝根、人工profile及同步barrier。
  - 動作：分別令遊戲先持鎖、安裝器先持鎖，再競爭啟動/更新；注入無權限與切換失敗。
  - 預期：僅一方持生命週期鎖；更新期間不啟Player，遊戲期間不切包，失敗用指定提示且舊包/profile hash不變；不強殺或建立第二DB。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-023 Backup

**位置**：`tools/acceptance/tests/integration/test_it_023.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-023** `Backup_IncompleteCopy_DoesNotReplaceLastGood` — @critical
  - 目標／BDD：SC-050；AC-030；SPEC §13.4。
  - 前置：真實SQLite含WAL資料與已驗證良好備份；故障注入在copy/validate/commit/migration階段。
  - 動作：以backup API或停寫關閉連線取得一致備份，逐階段中斷；另測成功遷移。
  - 預期：完整備份含已提交WAL資料；中斷不替換last-good，migration交易回滾；成功才原子提交新備份與可相容新資料。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-024 Resolve

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT024RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-024** `Resolve_MixedReferenceTuple_RejectsModel` — @critical
  - 目標／BDD：SC-051；AC-031；SPEC §13.5。
  - 前置：真實SQLite啟用FK，含合法新舊snapshot與交錯variant/revision/buildTarget。
  - 動作：嘗試插入違反複合FK/unique的列；對既存損毀fixture執行開啟檢核與ModelReference解析。
  - 預期：寫入約束拒絕混搭；讀取不選最新或另一target；合法舊引用仍精確載入，錯誤不改profile；具體錯誤碼按§13.5。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-025 AcquireAsync

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT025RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-025** `AcquireAsync_PreCancelled_AllocatesNoHandle` — @critical
  - 目標／BDD：SC-052；AC-032；SPEC §13.6。
  - 前置：真實資產adapter與可計數handle/IO；token已取消且另帶非法輸入。
  - 動作：預先取消呼叫AcquireAsync；在進行中載入與UI離開barrier再次取消。
  - 預期：預先取消優先Cancelled，零IO/零handle配置；中途取消釋放未使用handle/instance且不回寫已銷毀UI，不顯示警報。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-026 LoadAsset

**位置**：`tools/acceptance/tests/integration/test_it_026.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-026** `LoadAsset_ReparsePointEscape_RejectsAccess` — @critical
  - 目標／BDD：SC-053；AC-033；SPEC §13.7。
  - 前置：專用暫存包根與根外無敏感內容sentinel、相似前綴根及可測junction/symlink。
  - 動作：經包路徑解析器載入越界及合法檔案；若環境不能建立reparse測試則記阻斷，不skip通過。
  - 預期：越界或整包reparse拒絕政策成立，根外sentinel零讀取；合法資產可載入，profile不變；不只靠路徑字串前綴。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-027 LoadAsset

**位置**：`tools/acceptance/tests/integration/test_it_027.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-027** `LoadAsset_ReplacedSameSizeBundle_InvalidatesValidation` — @critical
  - 目標／BDD：SC-053；AC-033；SPEC §13.7。
  - 前置：合法bundle已hash，製作同大小且相同mtime但內容不同檔案；受控hash-to-load barrier。
  - 動作：於下次load前替換，另在hash後讀取前嘗試寫換；測新程序、缺可靠fileIdentity與存活lease。
  - 預期：新load驗實際bytes，替換不可用舊快取；使用鎖或verified stream避免讀未驗內容，錯誤拒絕不動profile；存活記憶體lease保持有效。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-028 ValidateWheel

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT028RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-028** `ValidateWheel_UnknownMass_DoesNotInventValue` — @critical
  - 目標／BDD：SC-056；AC-036；SPEC §13.10。
  - 前置：真實metadata匯入/序列化/查詢，Unknown/null與Measured/Estimated正反例；NaN/Infinity/0/負數尺寸。
  - 動作：跨製作與runtime契約讀寫輪組資料並檢查候選過濾。
  - 預期：Unknown保留null及reason、無預設重量/性能；Measured/Estimated有限正值且有來源理由；必要尺寸缺漏不進輪候選但不刪外觀，軸向/單位維持canonical。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-029 MatchWheel

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT029RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-029** `MatchWheel_IncompatibleAxle_RejectsAssembly` — @critical
  - 目標／BDD：SC-056；AC-036；SPEC §13.10。
  - 前置：Unity PlayMode真實兩種輪徑、兩種軸距與正反配對，固定scale/坡道/路肩/速度/物理設定。
  - 動作：建合法原型量靜態接點/碰撞，嘗試非法配對並跑有限動態接觸；與ET-014共用可追溯fixture。
  - 預期：合法幾何誤差符合§4.3、不相容拒絕且不產生裝配；保存實際接觸/跳動與畫面，檔案存在本身不算幾何通過，不宣稱正式賽車。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

## 3️⃣ API 契約測試（API Tests；非 HTTP）

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/BrickCatalogContractTests.cs`；`AcquireAsync`／Unity 資源釋放另在 `game/Assets/BrickHigh/Tests/PlayMode/AssetProviderContractTests.cs` 執行。

使用真實 adapter 與受控 DB／資產；不使用網路測試伺服器。下列9項涵蓋5個 IBrickCatalog 方法、資產載入、相容檢查與資源／結果契約。

- [ ] **CT-001** `OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-015、SC-019、SC-026。
  - 前置：已發布／缺目錄／缺相依／不支援 schema。
  - 動作：透過正式 C# 介面呼叫 `OpenAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：session 綁定 manifest，錯誤型別明確；取消不遺留連線。

- [ ] **CT-002** `QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-015、SC-020、SC-028、SC-031。
  - 前置：101筆、所有用途／篩選、Limit 邊界、跨快照 cursor。
  - 動作：透過正式 C# 介面呼叫 `QueryAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：排序及 cursor 無重漏，非法輸入拒絕且 Special 限制生效。

- [ ] **CT-003** `GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-012、SC-015、SC-020。
  - 前置：有效 variant、未知 UUID、錯誤 snapshot。
  - 動作：透過正式 C# 介面呼叫 `GetVariantAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：詳情使用凍結投影與正確 revision；不存在回 VariantNotFound。

- [ ] **CT-004** `GetProfilesAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-008、SC-015。
  - 前置：同名不同系列 profile 與多個快照。
  - 動作：透過正式 C# 介面呼叫 `GetProfilesAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：回該 session 的版本化完整配對規則，禁止混入最新規則。

- [ ] **CT-005** `GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-005、SC-015、SC-027。
  - 前置：空基準、完整已知分母、含G/U與完整審查資料。
  - 動作：透過正式 C# 介面呼叫 `GetCoverageAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：回一致的 C/A/R/U/G/V 及涵蓋審查，空基準不報100%。

- [ ] **CT-006** `AcquireAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-012、SC-019、SC-024、SC-032。
  - 前置：精確引用、缺檔、損毀、取消、任意路徑。
  - 動作：透過正式 C# 介面呼叫 `AcquireAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：只回正確本地資產 lease 或 typed error；零權益寫入。

- [ ] **CT-007** `Check_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-018、SC-025。
  - 前置：SaveHeader、模型引用清單、新 schema 與缺映射。
  - 動作：透過正式 C# 介面呼叫 `Check`，或以其 factory／Dispose 操作結果與資源。
  - 預期：相容報告對應完整 requiredModels，失敗不寫入或替換原資料。

- [ ] **CT-008** `Dispose_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-032、SC-041。
  - 前置：session／lease 有共用資產且重複釋放。
  - 動作：透過正式 C# 介面呼叫 `Dispose`，或以其 factory／Dispose 操作結果與資源。
  - 預期：每次資源所有權正確結束，不提前卸載共用資產或留掛起UI回呼。

- [x] **CT-009** `CatalogResult_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-019、SC-020、SC-025、SC-026。
  - 前置：全部已列錯誤碼與 Success 樣本。
  - 動作：透過正式 C# 介面呼叫 `CatalogResult`，或以其 factory／Dispose 操作結果與資源。
  - 預期：Success／Failure 互斥、retryable 與繁體中文文案一致且無敏感堆疊。

### CT-010 OpenRelease

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT010RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-010** `OpenRelease_PreviewPack_RejectsPackage` — @critical
  - 目標／BDD：SC-047；AC-027；SPEC §13.1。
  - 前置：Release runtime與真實Preview包、修改config偽裝Release反例。
  - 動作：呼叫OpenAsync及Preview session的CharacterCreation/InitialBucket用途；嘗試匯入Preview profile。
  - 預期：Release精確回IncompatibleContent且指定文案；Preview只Browse、不發放、不開正式profile；改設定無法更改建置身分。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-011 Downgrade

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [x] **CT-011** `Downgrade_NewSaveSchema_BlocksWrites` — @critical
  - 目標／BDD：SC-050；AC-030；SPEC §13.4。
  - 前置：相容、需migration、未知較新schema及bad-content的F-Save與可記錄連線模式的adapter。
  - 動作：呼叫相容性checker並嘗試舊版開啟；另測空requiredModels。
  - 預期：成功分Compatible/MigrationRequired；未知schema=UnsupportedSchema，bad-content=IncompatibleContent；不相容零可寫連線、不換空白存檔，空清單仍核header。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-012 OpenAsync

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT012RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-012** `OpenAsync_ManifestCatalogMismatch_RejectsPack` — @critical
  - 目標／BDD：SC-051；AC-031；SPEC §13.5。
  - 前置：有效manifest/runtime_meta，逐欄換pack/snapshot/schema/app/kind/target，另備損毀DB與缺歷史引用。
  - 動作：參數化呼叫OpenAsync與requiredModels相容檢核。
  - 預期：包身分/target錯配與缺歷史引用=IncompatibleContent、未知schema=UnsupportedSchema、損毀=AssetCorrupt；不開可用session或錯模型。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-013 QueryAsync

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT013RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-013** `QueryAsync_NullOrDisposedSession_ReturnsInvalidQuery` — @critical
  - 目標／BDD：SC-052；AC-032；SPEC §13.6。
  - 前置：合法以及null/disposed/偽造/跨包session，null query/ref/header/requiredModels、非法enum/UUID/Limit。
  - 動作：未取消下逐項呼叫相關公開介面；另測Limit1/100、空requiredModels及重複引用。
  - 預期：非法輸入精確InvalidQuery且在IO前拒絕；合法邊界可用，空requiredModels仍查header、重複引用去重但不漏任一必要版本。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-014 QueryAsync

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT014RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-014** `QueryAsync_OversizedOrLiteralWildcard_ValidatesAndBinds` — @critical
  - 目標／BDD：SC-052；AC-032；SPEC §13.6。
  - 前置：真實SQLite含中文、引號、%/_及相近非匹配文字；Unicode scalar255/256/257、代理對/孤立代理與Cursor4095/4096/4097反例。
  - 動作：執行QueryAsync；另測空/null文字、非ASCII/損毀/跨查詢Cursor。
  - 預期：QueryText以scalar計數，無效UTF16/超限=InvalidQuery；Cursor錯誤=InvalidCursor；null/空首頁/不篩選，特殊字元只字面匹配且使用參數綁定，不能擴大SQL或結果。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

## 4️⃣ E2E 測試（End-to-End Tests）

以下案例必須使用實際 Windows 安裝版；ET-008 另含真正製作管線，ET-009 的全量來源不可由 fixture 代替。ET-011～ET-014 要保留原始測量資料，不只保存「PASS」字樣。

### ET-001 OfflineInstall

**位置**：`tools/acceptance/tests/test_offline_install.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-001** `RunOfflineInstall_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-033。
  - 前置：乾淨 Windows、斷網、完整安裝包。
  - 動作：從安裝、啟動到第一個真實模型，並保留錄影／畫面、網路依賴檢查與安裝版本。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-002 BrowseAndCamera

**位置**：`tools/acceptance/tests/test_browse_and_camera.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-002** `RunBrowseAndCamera_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-034、SC-035、SC-037。
  - 前置：已安裝預覽與多變體包。
  - 動作：滑鼠及鍵盤完成搜尋、篩選、空結果、清除、換外觀、旋轉、縮放、重設與窄視窗操作。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-003 MaterialAcceptance

**位置**：`tools/acceptance/tests/test_material_acceptance.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-003** `RunMaterialAcceptance_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-036。
  - 前置：封裝 Player 的塑膠／橡膠／透明／印刷實際資產。
  - 動作：逐變體核對來源與六視圖、缺材質反例；保存檢查者、結論、問題清單與畫面版本。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-004 RapidSelection

**位置**：`tools/acceptance/tests/test_rapid_selection.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-004** `RunRapidSelection_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-038、SC-039、SC-040、SC-041。
  - 前置：真實場景與受控慢載入／可重試失敗。
  - 動作：快速換件、重試連點、退出重入及選擇其他模型，核對畫面與 handles，不能只以 presenter 單測驗收。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-005 StartupFailure

**位置**：`tools/acceptance/tests/test_startup_failure.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-005** `RunStartupFailure_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-019、SC-026、SC-042。
  - 前置：隔離機的缺 DLL／缺包／不支援圖形條件。
  - 動作：確認可理解的啟動失敗通知及原資料完整；不能把沒有 3D 畫面標示通過。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-006 InstallUpgradeUninstall

**位置**：`tools/acceptance/tests/test_install_upgrade_uninstall.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-006** `RunInstallUpgradeUninstall_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-016、SC-017。
  - 前置：一般使用者、唯讀安裝區、人工 profile fixture。
  - 動作：安裝 A→關閉→升級 B→啟動→預設解除安裝，全程核對 profile bytes／DB資料及本地寫入位置。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-007 FailedUpdateAndSave

**位置**：`tools/acceptance/tests/test_failed_update_and_save.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-007** `RunFailedUpdateAndSave_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-023、SC-025。
  - 前置：原版本及人工存檔、新包的空間不足／中斷／缺映射／未知schema。
  - 動作：逐例核對原存檔、可回復版本與具體訊息；不清空重建作為成功。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-008 SourceToPlayer

**位置**：`tools/acceptance/tests/test_source_to_player.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-008** `RunSourceToPlayer_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-006、SC-007、SC-010、SC-013。
  - 前置：受控來源與代表自建修補模型。
  - 動作：真實 Blender→GLB驗證→Unity→本地DB與bundle→安裝→離線選取旋轉；不能mock關鍵鏈，fixture包不冒充正式全量。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-009 FullCatalogRelease

**位置**：`tools/acceptance/tests/test_full_catalog_release.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-009** `RunFullCatalogRelease_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-005、SC-027。
  - 前置：已取得的實際全量來源、模型與涵蓋審查。
  - 動作：獨立重算 C/A/R/U/G/V、逐變體RuntimeBuild載入與證據；未取得來源時明確阻斷，不skip後算通過。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-010 LegacyModelUpgrade

**位置**：`tools/acceptance/tests/test_legacy_model_upgrade.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-010** `RunLegacyModelUpgrade_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-012、SC-014。
  - 前置：兩代實際包、保留來源revision與停產／分類差異。
  - 動作：新版載入舊精確引用，外觀／尺寸不被新模型替代，停產不影響既有引用且不新發放。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-011 QueryAndColdLoad

**位置**：`tools/acceptance/tests/test_query_and_cold_load.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-011** `RunQueryAndColdLoad_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-043。
  - 前置：SPEC §8.2 記錄的基準硬體與SSD。
  - 動作：執行1000次查詢及單件冷載入，分別提交P95、首幀時間與原始樣本。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-012 FrameBenchmark

**位置**：`tools/acceptance/tests/test_frame_benchmark.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-012** `RunFrameBenchmark_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-044。
  - 前置：規定基準硬體、非Development Standalone、固定2026片場景。
  - 動作：1080p Medium／關VSync，暖機30秒後60秒，平均60FPS與P95≤20ms並保存UI操作錄影。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-013 MemoryBenchmark

**位置**：`tools/acceptance/tests/test_memory_benchmark.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-013** `RunMemoryBenchmark_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-045。
  - 前置：固定20模型含共用資產。
  - 動作：換件5輪後核對LRU≤256MiB的未使用快取及實際存活物件，活躍資產分列。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-014 WheelGeometryPrototype

**位置**：`tools/acceptance/tests/test_wheel_geometry_prototype.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-014** `RunWheelGeometryPrototype_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-046。
  - 前置：不同輪徑／軸距、統一比例、短坡道與路緣。
  - 動作：保存輪軸／碰撞對齊與接觸結果，指出跳動／尺度問題；不宣稱已能正式賽車。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-015 AcceptPreview

**位置**：`tools/acceptance/tests/test_et_015.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-015** `AcceptPreview_VisibleAssets_DoesNotCompleteFullCatalog` — @critical
  - 目標／BDD：SC-047；AC-027；SPEC §13.1。
  - 前置：斷網乾淨Windows與Preview安裝包，代表普通磚/板/透明/印刷人物/Technic插銷軸/DUPLO及非對稱件。
  - 動作：安裝、旋轉、縮放、換件、查看Unknown件與全量計數；另裝Release相容fixture核對隔離。
  - 預期：可操作真實3D並可讀非完整及待查標籤；無正式發放或進度；截圖錄影與包版本留存，Preview通過不勾ET-009全量完成。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-016 Upgrade

**位置**：`tools/acceptance/tests/test_et_016.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-016** `Upgrade_StableProductIdentity_UsesExistingProfile` — @critical
  - 目標／BDD：SC-049；AC-029；SPEC §13.3。
  - 前置：兩代同產品安裝包及獨立Preview包，Release/Preview各有可辨識人工profile。
  - 動作：記錄Company/Product/applicationId/persistentDataPath後實際升級、重開並交叉檢查捷徑及資料根。
  - 預期：Release與Preview各自沿用原根與profile，不互讀；捷徑走啟動器且持鎖至Player退出，正常無console；安裝/升級不寫player.db。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-017 RestoreBackup

**位置**：`tools/acceptance/tests/test_et_017.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [x] **ET-017** `RestoreBackup_WithoutExplicitChoice_PreservesNewProgress` — @critical
  - 目標／BDD：SC-050；AC-030；SPEC §13.4。
  - 前置：隔離F-Save恢復驗收harness，備份版本/時間與新版進度可辨；不是正式玩家UI。
  - 動作：展示指定提示後依序無選擇、取消、注入還原失敗、明確確認還原。
  - 預期：前三者保留目前進度及last-good；確認後才切至指定備份且另存較新資料可恢復；保留提示/選擇/前後hash證據，正式UI待PlayerInventory。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-018 Preview

**位置**：`tools/acceptance/tests/test_et_018.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-018** `Preview_MissingChineseGlyph_FailsVisualCheck` — @critical
  - 目標／BDD：SC-054；AC-034；SPEC §13.8。
  - 前置：離線乾淨Windows、合法隨包字型/fallback及故意缺字反例。
  - 動作：用實際Player遍歷所有繁中UI/錯誤訊息/待查標籤，核對字型使用條件與出字畫面。
  - 預期：缺字方框、缺fallback或授權證據不通過；正例不依賴系統碰巧有字型或線上下載，保存畫面與字型版本。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-019 Startup

**位置**：`tools/acceptance/tests/test_et_019.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-019** `Startup_NoGraphicsDevice_ProvidesNativeNotice` — @critical
  - 目標／BDD：SC-054；AC-034；SPEC §13.8。
  - 前置：含原生BrickHighLauncher.exe的安裝包，無支援圖形裝置環境及Player缺失/崩潰故障fixture。
  - 動作：從捷徑啟動，在Unity UI建立前觀察Windows原生通知與診斷，再測正常斷網啟動。
  - 預期：確知不支援用SC-042文案、未知原因用§13.8通用文案，不編造原因；無3D仍可取得提示與診斷，profile保留，正常無console且離線相依齊備。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-020 Render

**位置**：`tools/acceptance/tests/test_et_020.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-020** `Render_GoldenReferenceMismatch_RequiresReview` — @critical
  - 目標／BDD：SC-054；AC-034；SPEC §13.8。
  - 前置：實際安裝Player代表模型六視圖、光照/鏡頭/材質版本及使用者核准紀錄；未核准與可見缺陷反例。
  - 動作：提交首批畫面核准，按visualBaselineId比對後續包並逐列注入印刷缺失/鏡像/粉紅shader/過曝與關鍵風格改動。
  - 預期：無核准不能凍結；缺陷失敗，關鍵改動需重新審閱；跨GPU不要求像素全等，保留操作錄影、版本digest、核准日期與意見。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-021 Benchmark

**位置**：`tools/acceptance/tests/test_et_021.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-021** `Benchmark_DifferentHardware_DoesNotClaimBaselinePass` — @critical
  - 目標／BDD：SC-055；AC-035；SPEC §13.9。
  - 前置：Iris Xe本機與指定基準機資料，實際2026片8類幾何場景。
  - 動作：用相同已凍結profile在可用硬體量測；欠缺指定設備時保留正式未驗收。
  - 預期：探索結果不得冒稱基準通過；只有指定或另核准硬體的真實Player且完整原始資料才能判平均≥60FPS/P95≤20ms，欠設備不skip後標pass。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-022 Benchmark

**位置**：`tools/acceptance/tests/test_et_022.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-022** `Benchmark_ChangedPreset_InvalidatesComparison` — @critical
  - 目標／BDD：SC-055；AC-035；SPEC §13.9。
  - 前置：已核准AA/陰影等profile與改renderScale/硬體/透明比例/相機的反例；實際Player。
  - 動作：冷啟動/首次Acquire/熱載入分段計時含hash；執行暖30秒測60秒與UI操作，另故意先顯示占位mesh。
  - 預期：任一profile變更不混入舊結果，未凍結只探索；首幀截止必須正確mesh/material/texture且≤3秒，OS快取條件揭露，存原始幀及操作證據。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

## BDD → TDD 逐項追溯

| BDD | SPEC AC | TDD IDs |
|---|---|---|
| SC-001 | AC-001、AC-004 | UT-001、UT-002、UT-003、IT-001 |
| SC-002 | AC-002 | UT-004、UT-005、UT-006、IT-001 |
| SC-003 | AC-003 | UT-007、UT-008、UT-009、IT-001 |
| SC-004 | AC-004、AC-009、AC-010 | UT-010、UT-011、UT-012、IT-002 |
| SC-005 | AC-009、AC-017 | UT-013、UT-014、UT-015、IT-002、CT-005、ET-009 |
| SC-006 | AC-005、AC-007、AC-025 | UT-016、UT-017、UT-018、IT-003、ET-008 |
| SC-007 | AC-006、AC-024 | UT-019、UT-020、UT-021、IT-004、ET-008 |
| SC-008 | AC-008、AC-014 | UT-022、UT-023、UT-024、IT-004、CT-004 |
| SC-009 | AC-012、AC-014 | UT-025、UT-026、UT-027、IT-005 |
| SC-010 | AC-007 | UT-028、UT-029、UT-030、IT-003、ET-008 |
| SC-011 | AC-010 | UT-031、UT-032、UT-033、IT-006 |
| SC-012 | AC-011、AC-023 | UT-034、UT-035、UT-036、IT-007、CT-003、CT-006、ET-010 |
| SC-013 | AC-005、AC-007、AC-018 | UT-037、UT-038、UT-039、IT-003、ET-008 |
| SC-014 | AC-011、AC-025 | UT-040、UT-041、UT-042、IT-007、ET-010 |
| SC-015 | AC-015、AC-019 | UT-043、UT-044、UT-045、IT-008、CT-001、CT-002、CT-003、CT-004、CT-005 |
| SC-016 | AC-022、AC-025 | UT-046、UT-047、UT-048、IT-009、ET-006 |
| SC-017 | AC-022、AC-023 | UT-049、UT-050、UT-051、IT-010、ET-006 |
| SC-018 | AC-022、AC-023 | UT-052、UT-053、UT-054、IT-011、CT-007 |
| SC-019 | AC-018、AC-019、AC-021、AC-025 | UT-055、UT-056、UT-057、IT-012、CT-001、CT-006、CT-009、ET-005 |
| SC-020 | AC-015、AC-019 | UT-058、UT-059、UT-060、CT-002、CT-003、CT-009 |
| SC-021 | AC-001、AC-018 | UT-061、UT-062、UT-063、IT-013 |
| SC-022 | AC-010、AC-018 | UT-064、UT-065、UT-066、IT-006 |
| SC-023 | AC-009、AC-018、AC-023 | UT-067、UT-068、UT-069、IT-010、ET-007 |
| SC-024 | AC-019、AC-025 | UT-070、UT-071、UT-072、IT-012、CT-006 |
| SC-025 | AC-011、AC-023 | UT-073、UT-074、UT-075、IT-011、CT-007、CT-009、ET-007 |
| SC-026 | AC-018、AC-021、AC-025 | UT-076、UT-077、UT-078、IT-009、CT-001、CT-009、ET-005 |
| SC-027 | AC-004、AC-009、AC-017 | UT-079、UT-080、UT-081、IT-002、CT-005、ET-009 |
| SC-028 | AC-015、AC-019 | UT-082、UT-083、UT-084、IT-008、CT-002 |
| SC-029 | AC-006、AC-008、AC-020、AC-024 | UT-085、UT-086、UT-087、IT-004 |
| SC-030 | AC-009、AC-010、AC-018 | UT-088、UT-089、UT-090、IT-014 |
| SC-031 | AC-013、AC-014、AC-015 | UT-091、UT-092、UT-093、IT-005、CT-002 |
| SC-032 | AC-026 | UT-094、UT-095、UT-096、IT-015、CT-006、CT-008 |
| SC-033 | AC-016、AC-021、AC-025 | UT-097、UT-098、UT-099、IT-016、ET-001 |
| SC-034 | AC-015、AC-016 | UT-100、UT-101、UT-102、IT-016、ET-002 |
| SC-035 | AC-016 | UT-103、UT-104、UT-105、IT-016、ET-002 |
| SC-036 | AC-005、AC-007、AC-025 | UT-106、UT-107、UT-108、IT-017、ET-003 |
| SC-037 | AC-015、AC-016 | UT-109、UT-110、UT-111、IT-016、ET-002 |
| SC-038 | AC-016、AC-018、AC-025 | UT-112、UT-113、UT-114、IT-016、ET-004 |
| SC-039 | AC-016、AC-026 | UT-115、UT-116、UT-117、IT-015、ET-004 |
| SC-040 | AC-016、AC-026 | UT-118、UT-119、UT-120、IT-016、ET-004 |
| SC-041 | AC-016、AC-026 | UT-121、UT-122、UT-123、IT-015、CT-008、ET-004 |
| SC-042 | AC-016、AC-021 | UT-124、UT-125、UT-126、IT-016、ET-005 |
| SC-043 | AC-020 | UT-127、UT-128、UT-129、IT-018、ET-011 |
| SC-044 | AC-020、AC-025 | UT-130、UT-131、UT-132、IT-018、ET-012 |
| SC-045 | AC-020、AC-026 | UT-133、UT-134、UT-135、IT-018、ET-013 |
| SC-046 | AC-008、AC-024 | UT-136、UT-137、UT-138、IT-018、ET-014 |

| SC-047 | AC-027 | UT-139、UT-140、UT-141、IT-019、CT-010、ET-015 |
| SC-048 | AC-028 | UT-142、UT-143、UT-144、IT-020、IT-021 |
| SC-049 | AC-029 | UT-145、UT-146、UT-147、IT-022、ET-016 |
| SC-050 | AC-030 | UT-148、UT-149、UT-150、CT-011、IT-023、ET-017 |
| SC-051 | AC-031 | UT-151、UT-152、UT-153、IT-024、CT-012 |
| SC-052 | AC-032 | UT-154、UT-155、UT-156、CT-013、CT-014、IT-025 |
| SC-053 | AC-033 | UT-157、UT-158、UT-159、IT-026、IT-027 |
| SC-054 | AC-034 | UT-160、UT-161、UT-162、ET-018、ET-019、ET-020 |
| SC-055 | AC-035 | UT-163、UT-164、UT-165、ET-021、ET-022 |
| SC-056 | AC-036 | UT-166、UT-167、UT-168、IT-028、IT-029 |
## 📝 測試清單使用說明

### Step 1：確認可開發條件

2026-09-28目前完成度為79/233（33.9%），以逐項證據矩陣為準。使用者已重新啟動開發，並指定固定20件先完成 Gate 2 逐件驗證；以下為本輪持續執行的流程。

先讀取[風險稽核報告](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md)及本文件末尾交接紀錄。原SDD、風險方案及補強SDD均已確認，BDD／TDD回寫完成；使用者本輪已啟動 well-done。不降低全量、離線或真實畫面門檻。

### Step 2：依 SPEC 的風險優先順序執行

1. 原生套件與安裝原型先做最小 Red-Green-Refactor；依已確認SPEC第13.1～13.2節建立隔離Preview，先可安裝、可離線操作再擴大資產量。
2. 領域／來源／版本／座標／材質，逐項單元→集成→程式內契約。
3. 原生 UX 與資源釋放、實際安裝版流程、升級與故障。
4. 固定硬體效能及全量來源／逐模型品質。不要等到全部模型做完才第一次驗證套件能否打包。
5. 完成後由實作稽核追溯；本輪不自行開啟下一份 SPEC。

### Step 3：Red-Green-Refactor 與證據

每次先建立會因缺少功能而失敗的測試，最小實作使其通過，再重構。每個 UT／IT／CT／ET ID 記錄命令、環境、結果與實作位置。既有模板的80%覆蓋率不是本 SPEC 已確認的完成替代門檻，不得用數字覆蓋率代替233項驗收與全量模型。

### 畫面驗收證據要求

ET-001～ET-005 與 ET-012 提交可操作安裝包識別、實際 Player 截圖／錄影及操作結果；包含正常、載入、無結果、錯誤、快速換件及重試。ET-003 另附逐變體外觀／印刷來源對照，ET-012 附 FPS／frame time 原始數據。證據產物保存於後續 `artifacts/acceptance/<buildId>/<caseId>/`，不可把設計圖、AI概念圖或 Editor 圖冒充安裝版畫面。

ET-015～ET-022 同樣保存實際操作證據；ET-017僅人工存檔恢復harness，不把它稱為完整遊戲UI。ET-020須取得使用者對真實Player的畫面核准；ET-021／022須揭露硬體與profile差異。

## 📝 稽核記錄

2026-09-10：Phase 2 本機回歸與進度核對完成；24 項單元 ID 有上述證據，其餘維持未勾選。不是 Phase 4 全項深度稽核，不能以此宣告 36 AC、56 BDD 或整份 SPEC 已驗收。

2026-09-09（規劃時點）：保留179基線測試，使用者已「全數同意 請繼續」風險方案並「確認」補強版SDD。10項缺漏已回寫SPEC §13／AC-027～036、BDD SC-047～056與54項TDD補強（30UT＋11IT＋5CT＋8ET）。合計168UT＋29IT＋14CT＋22ET＝233項，當時全部未執行；36/36 AC及56/56場景有文件追溯，非產品完成率。

文件驗證：已核對233個唯一且連續的測試ID、56個Given／When／Then場景及各至少3個UT、36個AC追溯、原179項測試ID／名稱保留、24個建議名稱全數追加、五份文件本機連結與Markdown空白。`git diff --check`通過（僅Git行尾轉換提示）；這些是文件檢查，不是Unity或遊戲測試。

## 規劃交接紀錄

**交接狀態**：Ready for well-done
**最後確認日期**：2026-09-09
**唯一開發目標／順序**：`SPEC-001-BrickModelCatalog`，MVP-001 第1順位；不得自行接續下一份SPEC。

### 文件包

| 類型 | 路徑 | 狀態 |
|---|---|---|
| MVP | [MVP-001-V1Version](../requirements/MVP-001-V1Version.md) | 已確認規劃基線；其餘模組尚未完成 |
| SPEC | [SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md) | 基線及第13節補強已確認，36個AC |
| BDD | [SPEC-001-BrickModelCatalog-BDD](../bdd/SPEC-001-BrickModelCatalog-BDD.md) | 56場景、20個@frontend，已生成並追溯 |
| TDD | [SPEC-001-BrickModelCatalog-TDD](SPEC-001-BrickModelCatalog-TDD.md) | 233項已補強；實作／執行0% |
| RiskAudit | [SPEC-001-BrickModelCatalog-RiskAudit](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md) | Q-001～003及補強SDD均已確認，10項缺漏已回寫 |

### 已確認風險

使用者先回覆「全數同意 請繼續」接受Q-001～003，再回覆「確認」接受具體SDD補強。以下接受的是處理方式與驗收門檻，不代表未取得的來源、軟體或硬體證據已存在。

| 風險 ID | 風險摘要 | 使用者決策 | 文件回寫位置 | 開發注意事項 |
|---|---|---|---|---|
| Q-001／GAP-001、002 | 首次畫面與全量發布互等 | 使用者接受：獨立Preview先行，不縮減全量需求 | SPEC §13.1～13.2；SC-047～048；IT-019～021、CT-010、ET-015 | Frozen先驗證，正式Release全量與CAS門檻仍在 |
| Q-002／GAP-008、009 | 外觀主觀與硬體不同 | 使用者接受：實際畫面先核准，探索與正式量測分開 | SPEC §13.8～13.9；SC-054～055；ET-018～022 | 尚無visualBaselineId或正式基準量測，不可假稱完成 |
| Q-003／GAP-003～007、010 | 更新、恢復、引用、輸入、資產與輪組缺口 | 已補回文件：依同意方案保留資料、精確拒絕及補測 | SPEC §13.3～13.7、13.10；SC-049～053、056及下表 | 本份只F-Save與有限輪組原型，無人物交易房屋或正式賽車 |
| RISK-001／002 | 全量來源與補模未取得 | 使用者接受：依Q-001分階段驗證，正式全量未完成不能結案 | SPEC §3.4、13.1；SC-001～006、013、027、047；ET-008、009、015 | Unknown不能當Active；無全球涵蓋證據不得稱全量 |
| RISK-003／004 | 接點及外觀識別 | 已補回文件：沿基線及Q-002／003加驗外觀與輪組 | SC-003、007～009、029、036、054、056；IT-004、005、017、029；ET-020 | 真實資產尺寸／材質核對，不能只有mock |
| RISK-005 | 來源使用條件未核實 | 使用者接受：Q-001規定逐資產可散布證據先於Preview納入 | SPEC §13.1；SC-010、013、047；IT-003、019 | 沒有來源／使用條件者不可散布，不推定商標授權 |
| RISK-006 | 全量包大小未知 | 使用者接受：全量仍需後續實測，不用子集合承諾大小 | SPEC §8.2、13.1；SC-029、043～045、047；ET-009、011～013 | 不刪必要歷史引用來縮包，超預算要記缺口 |
| RISK-007 | SDD確認 | 已補回文件：原SDD及第13節已明確確認 | 本紀錄、SPEC狀態與MVP階段紀錄 | 不再列為規劃阻斷 |
| RISK-008 | 原生套件相容未實測 | 使用者接受：Q-001原型優先驗證，未通過不能凍結發行工具鏈 | SPEC §2、13.2；SC-006、014、026、033、048；IT-020、ET-001、015 | 鎖定實際可用Editor、SQLite、glTFast、Addressables與URP版本後離線打包 |
| RISK-009／010／011 | 尺度、升級與效能 | 已補回文件：Q-002／003保留原門檻並增加具體驗收 | SPEC §13.3～13.4、13.9～13.10；SC-049、050、055、056 | 硬體不足不冒充正式通過，降版不覆蓋新進度 |

### 已補回缺漏

| 缺漏 ID | 缺漏來源 | 補入文件位置 | 補入項目 | 狀態 |
|---|---|---|---|---|
| GAP-001 | RiskAudit 第二節／AC-027 | SPEC §13.1；BDD SC-047；TDD UT-139、UT-140、UT-141、IT-019、CT-010、ET-015 | 隔離技術預覽與正式全量交付 | 已補回文件 |
| GAP-002 | RiskAudit 第二節／AC-028 | SPEC §13.2；BDD SC-048；TDD UT-142、UT-143、UT-144、IT-020、IT-021 | 先驗證Frozen候選再發布已驗證內容 | 已補回文件 |
| GAP-003 | RiskAudit 第二節／AC-029 | SPEC §13.3；BDD SC-049；TDD UT-145、UT-146、UT-147、IT-022、ET-016 | 更新與啟動共用互斥且身分穩定 | 已補回文件 |
| GAP-004 | RiskAudit 第二節／AC-030 | SPEC §13.4；BDD SC-050；TDD UT-148、UT-149、UT-150、CT-011、IT-023、ET-017 | 降版及備份失敗不擅自回退進度 | 已補回文件 |
| GAP-005 | RiskAudit 第二節／AC-031 | SPEC §13.5；BDD SC-051；TDD UT-151、UT-152、UT-153、IT-024、CT-012 | 完整模型引用與包身分必須一致 | 已補回文件 |
| GAP-006 | RiskAudit 第二節／AC-032 | SPEC §13.6；BDD SC-052；TDD UT-154、UT-155、UT-156、CT-013、CT-014、IT-025 | 輸入邊界與取消順序具有精確契約 | 已補回文件 |
| GAP-007 | RiskAudit 第二節／AC-033 | SPEC §13.7；BDD SC-053；TDD UT-157、UT-158、UT-159、IT-026、IT-027 | 實際檔案目標與新載入內容不可繞過驗證 | 已補回文件 |
| GAP-008 | RiskAudit 第二節／AC-034 | SPEC §13.8；BDD SC-054；TDD UT-160、UT-161、UT-162、ET-018、ET-019、ET-020 | 真實畫面基準、繁中字型與原生失敗通知 | 已補回文件 |
| GAP-009 | RiskAudit 第二節／AC-035 | SPEC §13.9；BDD SC-055；TDD UT-163、UT-164、UT-165、ET-021、ET-022 | 不同硬體及品質設定不可冒充基準效能 | 已補回文件 |
| GAP-010 | RiskAudit 第二節／AC-036 | SPEC §13.10；BDD SC-056；TDD UT-166、UT-167、UT-168、IT-028、IT-029 | 輪組單位、未知質量與配對原型可核對 | 已補回文件 |

共10項（高6、中4），新增10個BDD場景與54項TDD；原179項定義與編碼保留。原建議24個測試名稱全數落入各層，其餘30項確保每場景至少3個獨立單元測試。文件追溯36/36 AC、56/56場景；所有測試仍未執行。

### 實作注意事項

- 先用最小Red-Green-Refactor驗證原生相依、Frozen staging、離線安裝及隔離Preview。以真實代表模型交出可旋轉／縮放／換件的Player，先讓使用者驗收畫面；不等待全量模型齊備才首次封裝。
- Preview含普通磚、板、透明、印刷人物、Technic插銷／軸、DUPLO及非對稱代表，可重疊；逐件Ready及RuntimeBuild證據不可省略，未知生產狀態明示待查，已知停產排除。
- Preview及Release的包身分、資料根與安裝捷徑分開，僅透過原生啟動器進入，更新與啟動共用生命週期鎖。玩家不需Editor、Blender、Python、伺服器或網路。
- 233案例逐一留Red／Green／Refactor、命令與證據；unit綠燈不替代實際模型／Player。人工畫面驗收可以重跑程序留證，不可無聲skip。
- 正式人物、2026片發放、模擬訂單交易、建屋、玩家還原UI及完整MVP-002賽車留各自SPEC。本份F-Save只用人工測試資料，禁止故障注入使用者正式存檔。
- 若實作發現新契約變更或確實無法完成既定門檻，回報具體證據與缺口，不擅自換引擎、縮減來源、改硬體基準或新增線上服務。

### 不得進入開發的阻斷項

無（規劃層級）。所有必需決策與文件補強均已完成；本紀錄是交接，不是已開始實作。

### 不得宣告正式交付的開發驗收門檻

| 門檻 | 目前狀態／解除證據 |
|---|---|
| 全量未停產來源與逐資產使用／品質 | 未取得完整證據；需SPEC §3.4與ET-009實際通過，Preview不得代替 |
| 可安裝離線原生相依與工具鏈鎖版 | 尚無Unity專案或Player；需原型安裝、正常／故障及包依賴驗證 |
| 代表畫面核准及繁中可讀性 | 尚無實際畫面；ET-018～020提交Player六視圖／操作錄影並記錄使用者核准visualBaselineId |
| 固定Medium profile及正式硬體效能 | AA／陰影隨畫面核准鎖定；Iris Xe只探索，ET-021／022與原效能案例需正式證據 |
| 精確引用、更新／備份／降版與輪組 | 僅文件定義；依本233案例執行並由後續實作稽核逐項核對 |

下一步由使用者啟動 `well-done` 接手本文件包；perfect-plan於此停止，不建立下一份SPEC。


## 2026-09-27 逐項證據矩陣

本次全項靜態核對以既有通過報告與實際Player紀錄為執行證據，沒有新增產品程式、測試或重新執行產品回歸。路徑相對`brickhigh/`，行號為本次稽核時點。✅僅表示該TDD層級整項符合；⚠️及❌均維持未勾選。缺少實作時所列程式為最接近的現有邊界，所列測試為已檢查但不足的證據，不表示該需求已有測試。建議名稱只補強原ID，不增加233分母。

執行報告：`artifacts/test-results/wd-20260926-stage-final.xml:1`（173 passed）、`artifacts/test-results/wd-20260926-ui-verified.xml:2`（129 passed）；實際Player：`artifacts/acceptance/wd-20260926-interactive-c/PlayerEvidence/result.json:1`。較早原生探針僅作補充，不據其單獨提高完成狀態。

### UT 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| UT-001／SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 來源附件、hash與UTC觀測／有效日期均有回讀斷言。 | — |
| UT-002／SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:56`；`tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 五類系列、套裝／人物展開與排除理由逐項比對。 | — |
| UT-003／SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:79`；`tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 缺頁及缺系列各產生未解G，發布被拒絕。 | — |
| UT-004／SC-002 | ✅ 已符合 | `tools/catalog/policies.py:46`；`tools/catalog/resolving.py:77` | `tools/catalog/tests/unit/test_sc_002.py:15`；`tools/catalog/tests/integration/test_catalog_resolve.py:80` | 有效日期內Producing／Discontinued分成Active／Retired。 | — |
| UT-005／SC-002 | ✅ 已符合 | `tools/catalog/policies.py:46`；`tools/catalog/resolving.py:77` | `tools/catalog/tests/unit/test_sc_002.py:20`；`tools/catalog/tests/unit/test_sc_002.py:15`；`tools/catalog/tests/integration/test_catalog_resolve.py:80` | 缺貨、現貨、缺日期、相反與範圍外日期保持Unknown。 | — |
| UT-006／SC-002 | ✅ 已符合 | `tools/catalog/policies.py:46`；`tools/catalog/resolving.py:77` | `tools/catalog/tests/unit/test_sc_002.py:29`；`tools/catalog/tests/unit/test_sc_002.py:15`；`tools/catalog/tests/integration/test_catalog_resolve.py:80` | 兩個變體獨立分類；CLI回讀A=1、R=1。 | — |
| UT-007／SC-003 | ✅ 已符合 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 只保存觀測組合，重複去重且不生成笛卡兒積。 | — |
| UT-008／SC-003 | ✅ 已符合 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:16`；`tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 印刷與材質改變key，重試保留UUID。 | — |
| UT-009／SC-003 | ✅ 已符合 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:24`；`tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 矛盾alias拒絕合併並保留原候選／缺口。 | — |
| UT-010／SC-004 | ✅ 已符合 | `tools/catalog/repository.py:129`；`tools/catalog/schema.sql:26` | `tools/catalog/tests/integration/test_snapshot_repository.py:134` | 直接SQL改分母、證據、分類及G被trigger拒絕；後繼Draft可修正。 | — |
| UT-011／SC-004 | ✅ 符合 | `tools/catalog/repository.py:131`；`tools/catalog/quality.py:321`；`tools/catalog/quality.py:357` | `tools/catalog/tests/unit/test_quality_report.py:122`；`tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_snapshot_repository.py:123` | Pending／Building／Validating／Ready／Failed 轉移受控；布林報告遭拒，封存 bytes、人工附件與持久化品質摘要需重驗，隔離合成正例可 Ready；SC-004 整體仍受真實資產缺口限制。 | 本項完成；正式來源逐件審核另追 |
| UT-012／SC-004 | ✅ 已符合 | `tools/catalog/repository.py:129`；`tools/catalog/schema.sql:26` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_snapshot_repository.py:67` | Frozen選件遞增version，Published選件被拒絕。 | — |
| UT-013／SC-005 | ⚠️ 部分符合 | `tools/catalog/cli.py:94`；`tools/catalog/quality.py:344`；`tools/catalog/repository.py:187` | `tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | 已有隔離單件合成品質正例且假 Ready 不計 V；仍無真實完整來源分母、全 Active 逐件品質及 V=A 發布正例。 | 高；`CatalogCoveragePolicy_CompleteCounts_PassesGate_FullContractRegression` |
| UT-014／SC-005 | ⚠️ 部分符合 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_catalog_cli.py:81`；`tools/catalog/tests/integration/test_catalog_cli.py:196` | fixture被阻擋；尚無全量逐變體來源／品質報告。 | 高；`CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery_FullContractRegression` |
| UT-015／SC-005 | ⚠️ 部分符合 | `tools/catalog/cli.py:94`；`tools/catalog/quality.py:344`；`tools/catalog/repository.py:187` | `tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_catalog_cli.py:196` | 失敗閘門保留 head、合成 Ready 報告可通過驗證但 fixture-content 仍阻發布；缺全部門檻通過時成功切 head 的正式正例。 | 高；`CatalogCoveragePolicy_SingleFailedGate_PreservesHead_FullContractRegression` |
| UT-016／SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212` | 實際GLB與綁hash的validator已驗；尚缺各代表材質、紋理及警告處置矩陣。 | 高；`ModelValidationService_SelfContainedGltf_AcceptsReport_FullContractRegression` |
| UT-017／SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212` | 拒絕空／外部／非法GLB；無占位件、遺失印刷及粉紅shader完整反例。 | 高；`ModelValidationService_PlaceholderOrMissingMaterial_RejectsReport_FullContractRegression` |
| UT-018／SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `artifacts/acceptance/pm-20260928-interactive-20-a/machine-audit.json`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 20個內部樣本逐件 Player 載入與操作通過，尚非合格 Ready RuntimeBuild 的每件驗證。 | 高；`ModelValidationService_PlayerValidation_RequiresEveryBuild_FullContractRegression` |
| UT-019／SC-007 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | 指定LDraw點與rootScale=1均有精確斷言。 | — |
| UT-020／SC-007 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:18`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | Unity點與基底旋轉矩陣精確斷言。 | — |
| UT-021／SC-007 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | 點、切線手性、面序已有單測；真匯入mesh／法向／metadata整組一致未全驗。 | 高；`CoordinatePolicy_AlreadyConvertedMesh_AvoidsSecondMirror_FullContractRegression` |
| UT-022／SC-008 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | 版本化 profileId、雙向明確 compatibleProfileIds、跨系列拒絕與可核對自由度符合本 UT 的隔離規則；core 140/140、最終 Unity EditMode exit 0，並有真 glTFast PlayMode 代表件補強證據。公開 session profile 投影另由 CT-004 驗收，不阻擋本單元項完成。 | 本項完成；CT-004／IT-004 另追 |
| UT-023／SC-008 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | probe-radius 對簡化 AABB 的 fail-closed 插接空腔正反 fixture 已完整驗證：整體包圍盒封死拒絕、中央空腔通過；core 140/140 與 Unity EditMode Green。真實 PlayMode 又以 glTFast 匯入 3001 並跑八個 cavity probes 成功，UPM blocker 已解除。 | 本項完成；IT-004 全矩陣另追 |
| UT-024／SC-008 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58`；`tools/catalog/quality.py:153` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | 本 UT 的隔離規則已閉環：需要接合的零件缺 connector evidence 必須拒絕，無接點裝飾件只有具明確理由才可通過；core 140/140、catalog 159/159 與最終 Unity EditMode Green。逐件真實 Ready revision 的 connector／collision 完整性仍是 Gate 2 資產整合工作，不降低本單元規則完成度。 | 本項完成；逐件 Ready／IT-004 另追 |
| UT-025／SC-009 | ❌ 未符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 有分類欄位，但無六部位相容Basic候選驗證。 | 高；`UsageClassification_BasicSlots_RequiresSixCandidates_FullContractRegression` |
| UT-026／SC-009 | ❌ 未符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 尚無同系統floor/wall/roof/opening接合候選矩陣。 | 高；`UsageClassification_BuildingRoles_RequiresCompatibleSet_FullContractRegression` |
| UT-027／SC-009 | ⚠️ 部分符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 缺tier／reason會拒絕；部位、用途、錨點的完整資格缺口尚未驗。 | 高；`UsageClassification_MissingClassification_BlocksReadiness_FullContractRegression` |
| UT-028／SC-010 | ⚠️ 部分符合 | `tools/catalog/building.py:114`；`tools/catalog/render_views.py:15` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12` | 逐GLB產生六面及hash，尚缺每種外觀與來源對照的品質判定。 | 高；`RevisionManifestPolicy_VariantViews_RequiresSixDirections_FullContractRegression` |
| UT-029／SC-010 | ⚠️ 部分符合 | `tools/catalog/building.py:114`；`tools/catalog/render_views.py:15` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12` | 來源bytes、作者、授權、輸出與工具hash已封存；缺完整來源版本／使用條件正反例。 | 高；`RevisionManifestPolicy_Attribution_RequiresProvenance_FullContractRegression` |
| UT-030／SC-010 | ⚠️ 部分符合 | `tools/catalog/building.py:114`；`tools/catalog/render_views.py:15` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12` | 內部包有Editor／lock／profile；正式RuntimeBuild驗證digest產生與核對未完成。 | 高；`RevisionManifestPolicy_RuntimeManifest_KeepsBuildIdentity_FullContractRegression` |
| UT-031／SC-011 | ⚠️ 部分符合 | `tools/catalog/jobs.py:158`；`tools/catalog/building.py:167`；`tools/catalog/repository.py:105` | `tools/catalog/tests/integration/test_catalog_build.py:57`；`tools/catalog/tests/integration/test_catalog_cli.py:153`；`tools/catalog/tests/integration/test_catalog_build.py:113` | fork保留舊快照；缺新貨號上市日晚於基準時必須後繼基準的反例。 | 高；`RevisionBuildPolicy_NewPart_RequiresLaterBaseline_FullContractRegression` |
| UT-032／SC-011 | ✅ 已符合 | `tools/catalog/jobs.py:158`；`tools/catalog/building.py:167`；`tools/catalog/repository.py:105` | `tools/catalog/tests/integration/test_catalog_build.py:57`；`tools/catalog/tests/integration/test_catalog_cli.py:153`；`tools/catalog/tests/integration/test_catalog_build.py:113` | 同鍵同輸入重用，changed metadata／manifest回exit5且無重複結果。 | — |
| UT-033／SC-011 | ⚠️ 部分符合 | `tools/catalog/jobs.py:158`；`tools/catalog/building.py:167`；`tools/catalog/repository.py:105` | `tools/catalog/tests/integration/test_catalog_build.py:57`；`tools/catalog/tests/integration/test_catalog_cli.py:153`；`tools/catalog/tests/integration/test_catalog_build.py:113` | input digest含來源／metadata／工具；尚缺三類變更各產生新revision的正例。 | 高；`RevisionBuildPolicy_ChangedSource_CreatesRevision_FullContractRegression` |
| UT-034／SC-012 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 精確歷史引用能解析build；缺新目錄Retired條件下可載入的完整fixture。 | 高；`ModelReferenceResolver_ExactReference_PreservesRevision_FullContractRegression` |
| UT-035／SC-012 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 查詢用快照投影，未測新舊名稱／分類差異及不可變歷史回讀。 | 高；`ModelReferenceResolver_HistoricalProjection_RemainsFrozen_FullContractRegression` |
| UT-036／SC-012 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 讀取時有狀態過濾；未測正式新取得排除Retired且舊引用實際載入。 | 高；`ModelReferenceResolver_RetiredVariant_ExcludesNewAcquisition_FullContractRegression` |
| UT-037／SC-013 | ⚠️ 部分符合 | `tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 缺來源使單件Failed；TEXMAP／曲面／缺子模型各類原因矩陣仍不足。 | 高；`ModelBuildPolicy_UnsupportedSource_RecordsFailure_FullContractRegression` |
| UT-038／SC-013 | ❌ 未符合 | `tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 尚無人工補模與尺寸／外觀參照歸檔流程。 | 高；`ModelBuildPolicy_CustomModel_KeepsEvidence_FullContractRegression` |
| UT-039／SC-013 | ❌ 未符合 | `tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 尚無修補後通過全部品質並成為Ready的正例。 | 高；`ModelBuildPolicy_RepairedModel_RequiresFullValidation_FullContractRegression` |
| UT-040／SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | RuntimeBuild結構獨立；缺引擎／套件改版保留source revision的重建測試。 | 高；`RuntimeBuildPolicy_EngineChange_PreservesSourceRevision_FullContractRegression` |
| UT-041／SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 有精確resolver；未逐一重建所有受支援舊引用。 | 高；`RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild_FullContractRegression` |
| UT-042／SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | hash與映射檢核已做；缺舊bundle不能作新引擎相容證據的反例。 | 高；`RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility_FullContractRegression` |
| UT-043／SC-015 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` | 真SQLite讀取同session已測；全部回應身分與Release固定快照矩陣未全驗。 | 高；`BrickCatalog_SessionQueries_KeepSnapshot_FullContractRegression` |
| UT-044／SC-015 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` | 名稱／revision／profile／coverage有回讀，錨點與車輛完整投影未驗。 | 高；`BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData_FullContractRegression` |
| UT-045／SC-015 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` | 介面只有本地讀取；尚無所有方法零權益副作用與零HTTP的整組斷言。 | 高；`BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership_FullContractRegression` |
| UT-046／SC-016 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs:18`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:35` | 實際唯讀SQLite拒寫，DB bytes不變且無WAL／SHM。 | — |
| UT-047／SC-016 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs:18`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:35` | launcher診斷走獨立資料根；缺一般使用者唯讀安裝／所有可變資料寫入稽核。 | 高；`LocalStoragePolicy_WritableData_UsesUserRoot_FullContractRegression` |
| UT-048／SC-016 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs:18`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:35` | launcher只記有限欄位；缺所有診斷入口的金鑰／完整存檔／上傳反例。 | 高；`LocalStoragePolicy_DiagnosticRecord_RedactsSecrets_FullContractRegression` |
| UT-049／SC-017 | ✅ 已符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 真正InstallerCore完成staging/hash後才切pointer，壞包與切換故障保留舊值。 | — |
| UT-050／SC-017 | ✅ 已符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 安裝A/B及uninstall均比對人工profile bytes未變。 | — |
| UT-051／SC-017 | ⚠️ 部分符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 實際包可離線啟動；缺新版session重新映射舊模型的升級矩陣。 | 高；`InstallUpdatePolicy_Restart_OpensNewSessionOffline_FullContractRegression` |
| UT-052／SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 只有相容checker，未實作一致備份先於migration的流程。 | 高；`SaveTransactionPolicy_CompletedBackup_PrecedesMigration_FullContractRegression` |
| UT-053／SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 原生SQL rollback不等於存檔migration與last-good備份恢復。 | 高；`SaveTransactionPolicy_FailedMigration_RollsBack_FullContractRegression` |
| UT-054／SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 無組裝檔先寫後切DB引用的交易流程。 | 高；`SaveTransactionPolicy_FileBeforeReference_AvoidsPartialState_FullContractRegression` |
| UT-055／SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 已有開包typed error；manifest／DB／bundle缺失與hash各類仍未全驗。 | 高；`CatalogStartup_MissingFiles_ReturnTypedErrors_FullContractRegression` |
| UT-056／SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 顯示修復文案與DiagnosticId；尚缺由ID定位實際本機診斷紀錄。 | 高；`CatalogStartup_MissingModel_UsesRepairMessage_FullContractRegression` |
| UT-057／SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | provider不代換資產；缺失敗前後存檔bytes與全部載入錯誤矩陣。 | 高；`CatalogStartup_FailedLoad_PreservesUserData_FullContractRegression` |
| UT-058／SC-020 | ✅ 符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:99`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:235` | 真 SQLite session 中非法 Purpose／Tier／Slot／Limit 與空 UUID 精確回 InvalidQuery，未知有效 UUID 回 VariantNotFound；聚焦 .NET 測試 1/1 通過。 | 本項完成；SC-020 整體仍部分符合 |
| UT-059／SC-020 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:23` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:286` | 跨條件與另一session cursor明確InvalidCursor，不回首頁。 | — |
| UT-060／SC-020 | ✅ 符合 | `game/Assets/BrickHigh/Domain/CatalogResult.cs:23`；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogResultPolicyTests.cs:38`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:32` | Success／Failure 互斥，任意 SQL／stack message 無法進入玩家文案；僅准固定審核字串。 | 本項完成；SC-020 整體仍部分符合 |
| UT-061／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 429尊重Retry-After、至多三次重試、長等待及崩潰後預算持久化。 | — |
| UT-062／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:45`；`tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 同DB成功候選與完成page保留，失敗不改Active成Retired。 | — |
| UT-063／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:66`；`tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 憑證由header提供、不存URL／DB；外部失敗status exit4，CLI輸入錯誤另為2。 | — |
| UT-064／SC-022 | ✅ 已符合 | `tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | timeout／失聯worker標記單件Failed，另一件能完成。 | — |
| UT-065／SC-022 | ✅ 已符合 | `tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/unit/test_sc_022.py:27`；`tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | 同input hash完成項在重開DB及重試時不再執行。 | — |
| UT-066／SC-022 | ✅ 已符合 | `tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/unit/test_sc_022.py:49`；`tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | expired lease可接手，舊token失效，不同input衝突exit5且status保留原因。 | — |
| UT-067／SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | Installer hash失敗不切pointer；正式發布檔案staging整合仍缺。 | 高；`AtomicPublishPolicy_IncompleteStaging_PreservesHead_FullContractRegression` |
| UT-068／SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | DB trigger故障回滾且validation列保留，未驗真實內容檔保留。 | 高；`AtomicPublishPolicy_FailedCommit_RetainsContent_FullContractRegression` |
| UT-069／SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | 更新故障保留pointer/profile；指定文案與所有中斷／空間不足矩陣尚缺。 | 高；`AtomicPublishPolicy_InterruptedUpdate_KeepsPreviousVersion_FullContractRegression` |
| UT-070／SC-024 | ✅ 已符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ContentPathPolicyTests.cs:18`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 越界／絕對／ADS／保留名稱與壓縮成員反例在寫出前拒絕。 | — |
| UT-071／SC-024 | ✅ 已符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:22`；`tools/catalog/tests/unit/test_sc_024.py:17`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 遠端catalog、啟動更新及不可信provider設定在初始化前拒絕。 | — |
| UT-072／SC-024 | ✅ 已符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `tools/catalog/tests/unit/test_sc_024.py:25`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 打包key政策拒絕draft／tools／sources／secret，attribution可通過。 | — |
| UT-073／SC-025 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 未知新schema回UnsupportedSchema且零resolver呼叫；checker沒有寫入入口。 | — |
| UT-074／SC-025 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:53`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 完整引用缺失回IncompatibleContent，未替代revision。 | — |
| UT-075／SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 固定文案已實作；尚缺可定位本機診斷與不相容存檔保留整組測試。 | 高；`SaveCompatibilityChecker_IncompatibleSave_ReportsPreservation_FullContractRegression` |
| UT-076／SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | DLL例外有修復訊息，缺乾淨Player原生通知與診斷完整矩陣。 | 高；`NativeDependencyPolicy_MissingNativeLibrary_ReportsRepair_FullContractRegression` |
| UT-077／SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | StorageUnavailable文案存在，缺不可寫使用者資料根的精確回傳測試。 | 高；`NativeDependencyPolicy_ReadOnlyUserRoot_ReturnsStorageUnavailable_FullContractRegression` |
| UT-078／SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 離線通知不安裝工具；缺故障時profile與全部診斷去敏斷言。 | 高；`NativeDependencyPolicy_DependencyFailure_PreservesProfiles_FullContractRegression` |
| UT-079／SC-027 | ✅ 已符合 | `tools/catalog/policies.py:94` | `tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | A=0回null覆蓋率及尚無已確認基準，不能發布。 | — |
| UT-080／SC-027 | ✅ 已符合 | `tools/catalog/policies.py:94` | `tools/catalog/tests/unit/test_sc_027.py:19`；`tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | 逐一注入U／G／非Ready／分類／品質／來源缺口阻擋發布政策。 | — |
| UT-081／SC-027 | ✅ 已符合 | `tools/catalog/policies.py:94` | `tools/catalog/tests/unit/test_sc_027.py:28`；`tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | V/A=100%但scope未審查仍拒絕；有審查政策正例。 | — |
| UT-082／SC-028 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30` | 預設50，1／100可用，0／負數／101明確拒絕。 | — |
| UT-083／SC-028 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` | 真SQLite遍歷101筆，排序與去重數量精確斷言。 | — |
| UT-084／SC-028 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30` | 遍歷以末頁null結束；不匹配篩選回空集合。 | — |
| UT-085／SC-029 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | 尺寸及接點門檻含邊界與相鄰超限反例。 | — |
| UT-086／SC-029 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:18`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | 有限正值及單位向量規則有NaN／Infinity／零／負值反例。 | — |
| UT-087／SC-029 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:30`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | GLB、texture、preview各自超限反例；只判資產檔預算，不宣稱runtime記憶體。 | — |
| UT-088／SC-030 | ✅ 已符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | 兩個獨立SQLite連線競爭同head，恰一成功一衝突。 | — |
| UT-089／SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | 敗方不能再切head已驗；未驗已發布實體檔不刪除。 | 高；`PublishConcurrencyPolicy_LosingPublisher_CannotOverwrite_FullContractRegression` |
| UT-090／SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | session固定DB與snapshot，未在實際head切換時核對舊session。 | 高；`PublishConcurrencyPolicy_ExistingSession_RemainsStable_FullContractRegression` |
| UT-091／SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | SQL排除Special與eligible條件存在，Release所有用途正反例缺漏。 | 高；`AcquisitionEligibility_AcquisitionPurpose_ExcludesSpecial_FullContractRegression` |
| UT-092／SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | Browse／resolver不寫權益；尚缺正式庫存／人物資格零副作用fixture。 | 高；`AcquisitionEligibility_BrowseRead_DoesNotGrantItem_FullContractRegression` |
| UT-093／SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | resolve驗Special分類，未驗分類變更不發放的完整流程。 | 高；`AcquisitionEligibility_SpecialSources_RemainRestricted_FullContractRegression` |
| UT-094／SC-032 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:20`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 真Addressables reference重複Dispose一次，另一份lease仍有效。 | — |
| UT-095／SC-032 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 共享及取消有證據，失敗Acquire後所有已配置handle釋放的斷言仍不足。 | 高；`ModelLeasePolicy_SharedActiveHandle_RemainsAlive_FullContractRegression` |
| UT-096／SC-032 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:50`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 背景讀Prefab被拒絕，背景Dispose排回主執行緒且handle歸零。 | — |
| UT-097／SC-033 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:255`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:117`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:30`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 單元層標題／搜尋篩選控制及清單可用；不把UT當乾淨離線安裝驗收。 | — |
| UT-098／SC-033 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:44`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | pending顯示載入文案與null model，完成才解除loading。 | — |
| UT-099／SC-033 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 真內部Player已載入本地bundle；清除開發快取／乾淨斷網的完整條件未驗。 | 高；`CatalogPreviewPresenter_BundledAssets_AvoidsRemoteDependency_FullContractRegression` |
| UT-100／SC-034 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:60`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 真SQLite多條件共同篩選、貨號優先於部分名稱。 | — |
| UT-101／SC-034 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:139`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:80`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 固定snapshot詳細資料、名稱／revision／尺寸與Unknown標籤均有斷言。 | — |
| UT-102／SC-034 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:99`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 單元層换variant綁定新ModelReference／lease並釋放舊模型，不只改名稱。 | — |
| UT-103／SC-035 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:69`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:55`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:37`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:110`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:102`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:88`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:40`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57` | 真Camera拖曳／縮放／重設與窄比例取景斷言。 | — |
| UT-104／SC-035 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:25`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:64`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57` | 文字焦點阻止拖曳、滾輪及鍵盤鏡頭並終止原拖曳。 | — |
| UT-105／SC-035 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:26`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:27`；`artifacts/acceptance/pm-20260928-interactive-20-a/run.json` | Tab／Shift+Tab 全控制焦點、Dropdown 離開、Clear Submit、可用 NextPage／Retry 焦點、50列捲動及 Player 選取／旋轉／重設已驗；搜尋／選取／重試／翻頁鍵盤 Submit 到 controller 的完整操作矩陣尚未驗。 | 高；`PreviewCameraController_KeyboardNavigation_ReachesControls_FullContractRegression` |
| UT-106／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:123` | PBR透明／橡膠政策與樣本可見，未逐變體對照印刷來源。 | 高；`MaterialPreviewPolicy_MaterialAssignment_PreservesAppearance_FullContractRegression` |
| UT-107／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:123` | Player固定光照有圖，無過曝／缺材質遮蔽的品質正反判定。 | 高；`MaterialPreviewPolicy_LightingPreset_PreservesReadability_FullContractRegression` |
| UT-108／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`artifacts/acceptance/pm-20260928-interactive-20-a/machine-audit.json` | 20個內部樣本有包版本與Player畫面，尚非合格交付變體及Editor替代反例的驗收政策。 | 高；`MaterialPreviewPolicy_PlayerEvidence_RequiredForAcceptance_FullContractRegression` |
| UT-109／SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:116`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 空結果文案、空rows及null model明確斷言。 | — |
| UT-110／SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:166`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:127`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 空結果保留CanClear，uGUI清除按鈕可用。 | — |
| UT-111／SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:139`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 清除重置所有條件再查同snapshot，恢復清單。 | — |
| UT-112／SC-038 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 模型錯誤顯示固定修復文案及來源DiagnosticId，不允許重試缺檔。 | — |
| UT-113／SC-038 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:173`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 失敗及null成功結果都不顯示模型，presenter不直出secret stack。 | — |
| UT-114／SC-038 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:188`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 壞模型後仍可選另一件並清除舊錯誤；presenter無存檔寫入責任。 | — |
| UT-115／SC-039 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:16`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:208`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 慢A不能覆寫B模型／詳情，重試晚到亦受版本保護。 | — |
| UT-116／SC-039 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:32`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 丟棄／退出後晚到結果釋放一次，不能重新啟動已disposed policy。 | — |
| UT-117／SC-039 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:49`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:246`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 舊結果不關閉新loading，晚到搜尋不蓋新頁。 | — |
| UT-118／SC-040 | ✅ 已符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:166`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | pending重試禁用且顯示重試中。 | — |
| UT-119／SC-040 | ✅ 已符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:20`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:208`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | 重複重試不建立第二請求，換件取消舊重試仍可進行。 | — |
| UT-120／SC-040 | ✅ 已符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:36`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | 成功／可重試失敗恢復正確狀態，缺檔改指向修復。 | — |
| UT-121／SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | lease／instance釋放順序及RT重建各有測試，缺完整場景一次退出全資源核對。 | 高；`PreviewLifecycle_ExitScene_ReleasesOwnedResources_FullContractRegression` |
| UT-122／SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | disposed presenter忽略晚到結果；真銷毀uGUI後回呼矩陣未驗。 | 高；`PreviewLifecycle_LateCompletion_IgnoresDestroyedView_FullContractRegression` |
| UT-123／SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | RT重建有測試，缺重入新session並保留另一使用者mesh／material的整組斷言。 | 高；`PreviewLifecycle_ReenterScene_OpensFreshSession_FullContractRegression` |
| UT-124／SC-042 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 圖形不支援固定文案有政策測試；原生通知的實機矩陣另留ET。 | — |
| UT-125／SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 內部報告不自稱畫面核准；缺PNG／無3D的驗收判定反例。 | 高；`GraphicsCapabilityPolicy_MissingDevice_FailsVisualAcceptance_FullContractRegression` |
| UT-126／SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | launcher有本機診斷；未核對圖形故障時profile bytes與離線完整流程。 | 高；`GraphicsCapabilityPolicy_GraphicsFailure_PreservesData_FullContractRegression` |
| UT-127／SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無1000次查詢P95分項量測／門檻測試。 | 中；`PerformanceGate_QuerySamples_ApplySeparateP95Limits_FullContractRegression` |
| UT-128／SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無含hash至正確材質首幀的3秒判定。 | 中；`PerformanceGate_ColdModel_UsesThreeSecondLimit_FullContractRegression` |
| UT-129／SC-043 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | Player保存CPU／GPU／版本，缺完整驅動、cold定義及benchmark環境契約。 | 中；`PerformanceGate_BenchmarkRecord_RequiresEnvironment_FullContractRegression` |
| UT-130／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無2026片／8類幾何的固定效能場景。 | 中；`FramePerformanceGate_SceneManifest_RequiresRepresentativeBricks_FullContractRegression` |
| UT-131／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無穩態60秒原始frame資料及FPS／P95雙門檻。 | 中；`FramePerformanceGate_FrameSamples_EnforcesBothLimits_FullContractRegression` |
| UT-132／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 尚無基準硬體與固定profile效能驗收器。 | 中；`FramePerformanceGate_PlayerRun_RequiresMatchedEnvironment_FullContractRegression` |
| UT-133／SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | provider釋放閒置資產，但無256MiB LRU預算政策與測試。 | 中；`ResourceCachePolicy_UnusedCache_EnforcesBudget_FullContractRegression` |
| UT-134／SC-045 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 活躍lease保留已有證據，快取淘汰及活躍記憶體分列未驗。 | 中；`ResourceCachePolicy_ActiveAssets_AvoidsEviction_FullContractRegression` |
| UT-135／SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 未做20模型5輪物件／handles／記憶體趨勢核對。 | 中；`ResourceCachePolicy_RepeatedCycles_DetectsLeak_FullContractRegression` |
| UT-136／SC-046 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 無輪組模型／軸心／碰撞同倍率原型。 | 高；`VehicleMetadataPolicy_WorldScale_KeepsWheelGeometryAligned_FullContractRegression` |
| UT-137／SC-046 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 來源metadata保存mass狀態；runtime投影與有限原型仍未貫通。 | 高；`VehicleMetadataPolicy_UnknownMass_PreservesEvidenceState_FullContractRegression` |
| UT-138／SC-046 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 無主要車身剛體與坡道／路肩動態接觸紀錄。 | 高；`VehicleMetadataPolicy_ContactFixture_DoesNotClaimRaceComplete_FullContractRegression` |
| UT-139／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | Unknown及C/A/R/U/G/V顯示已驗，內部包非Ready合格子集合。 | 高；`SelectPreview_MixedStatuses_ExcludesRetiredAndLabelsUnknown_FullContractRegression` |
| UT-140／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | Release拒Preview文案與編譯身分已有局部證據；修改config繞過反例未全驗。 | 高；`OpenPackage_PreviewInRelease_ReturnsIncompatibleContent_FullContractRegression` |
| UT-141／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | 獨立資料根／Browse限制已做，正式profile匯入與head／權益不變整組未驗。 | 高；`AuthorizePreview_FormalPurpose_RejectsWithoutGrant_FullContractRegression` |
| UT-142／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | repository可記Frozen validation；缺真Unity BuildValidationContent及合格子集。 | 高；`ValidateCandidate_FrozenSnapshot_LeavesHeadUnchanged_FullContractRegression` |
| UT-143／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | version改變拒舊報告，selection／toolchain／target逐欄矩陣不齊。 | 高；`PromoteCandidate_ChangedDigest_RejectsStaleReport_FullContractRegression` |
| UT-144／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | CAS已驗，但BuildCatalogContent精確封裝Published產物尚缺。 | 高；`CommitPublication_CasConflict_PreservesPreviousHead_FullContractRegression` |
| UT-145／SC-049 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | Company／Product／applicationId及Release／Preview資料根明確固定並有斷言。 | — |
| UT-146／SC-049 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | canonical root鎖、雙程序兩種競爭順序及受控子程序授權已驗；launcher持鎖至退出。 | — |
| UT-147／SC-049 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64`；`tools/acceptance/tests/integration/test_install_update.py:118` | Busy固定訊息及permission／pointer失敗保留舊安裝與人工profile，無強殺或新DB路徑。 | — |
| UT-148／SC-050 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:14`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | Compatible／MigrationRequired區分寫入資格；新schema保留訊息且零resolver呼叫。 | — |
| UT-149／SC-050 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | 無WAL一致備份、last-good原子提交及migration故障恢復。 | 高；`CommitBackup_InvalidTemporaryCopy_PreservesLastGood_FullContractRegression` |
| UT-150／SC-050 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | 无版本／時間／取消／確認還原與保存較新進度的harness。 | 高；`RestoreSave_NoConfirmation_PreservesCurrentProgress_FullContractRegression` |
| UT-151／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 完整複合FK及resolver已做；錯variant／target／unique写入矩陣未全驗。 | 高；`ResolveReference_MixedTuple_RejectsWrongOwner_FullContractRegression` |
| UT-152／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | pack/schema/損毀已驗，snapshot/app/kind/target逐欄錯配矩陣未全驗。 | 高；`ValidateManifest_FieldMismatch_ReturnsIncompatibleContent_FullContractRegression` |
| UT-153／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 缺精確歷史映射回不相容，尚缺所有損毀資料與存檔不變反例。 | 高；`ResolveLegacy_MissingRevision_DoesNotUseLatest_FullContractRegression` |
| UT-154／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | null/disposed／跨owner／部分DTO及header有測試，全部公開方法與去重多引用矩陣不齊。 | 高；`ValidateInput_InvalidSessionOrDto_ReturnsInvalidQuery_FullContractRegression` |
| UT-155／SC-052 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:18`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | scalar／UTF16／ASCII界線與SQLite中文／引號／%/_字面搜尋、cursor綁定已驗。 | — |
| UT-156／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 預取消零handle／IO及取消釋放已有證據，全部async／取消不彈警報與晚到UI矩陣不齊。 | 高；`CancelRequest_PreCancelledInvalidInput_ReturnsCancelled_FullContractRegression` |
| UT-157／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python真junction及C#路徑政策已驗；Player最終目標／根外零讀取完整反例未驗。 | 高；`ResolveAsset_ReparseOrPrefixEscape_RejectsTarget_FullContractRegression` |
| UT-158／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | 實作每次讀實際bytes，Python同大小mtime反例已驗；新程序／多包／存活lease矩陣未全驗。 | 高；`ValidateCache_ChangedFileIdentity_RequiresHash_FullContractRegression` |
| UT-159／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | C#用verified bytes載bundle且鎖讀，缺真Player hash-to-load barrier競態及profile斷言。 | 高；`LoadVerified_BytesChangedBeforeRead_RejectsUnverifiedContent_FullContractRegression` |
| UT-160／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 報告明列visualApproved=false；缺核准登錄、baseline digest及改版重審政策。 | 中；`ApproveVisual_NoUserDecision_RemainsUnapproved_FullContractRegression` |
| UT-161／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:480`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:257`；`artifacts/test-results/pm-20260927-unity-integrated-r2.xml` | 缺字會有可見警示並可清除，隨包字型／shader已有檢查；印刷鏡像、過曝、粉紅 shader 等完整可見缺陷矩陣未驗。 | 中；`EvaluateVisual_VisibleDefect_FailsAcceptance_FullContractRegression` |
| UT-162／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | native launcher與誠實通用文案已做；無3D／崩潰原生通知的實機證據不齊。 | 中；`DescribeStartup_UnknownCause_UsesHonestNativeMessage_FullContractRegression` |
| UT-163／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 目前只保存探索環境，無基準資格判定及不同硬體反例測試。 | 中；`EvaluateBenchmark_DifferentHardware_MarksExploratory_FullContractRegression` |
| UT-164／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 無完整凍結BenchmarkProfile及變更失效比對器。 | 中；`CompareBenchmark_ChangedProfile_RejectsMixedResults_FullContractRegression` |
| UT-165／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 無首個正確畫面計時與2026片穩態資料，不能以總流程秒數代替。 | 中；`MeasureFirstFrame_PlaceholderVisible_DoesNotStopTimer_FullContractRegression` |
| UT-166／SC-056 | ✅ 已符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:31` | 來源metadata規則拒絕零／未知尺寸及非單位軸，wheelEligible=false但geometryIssues不增加；有限數值共用驗證已測。 | — |
| UT-167／SC-056 | ✅ 已符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | Unknown必須null與reason；Measured／Estimated共用有限正值及來源規則，缺理由／來源／Infinity反例已測。 | — |
| UT-168／SC-056 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 無輪胎／輪圈／軸配對與不同輪徑／軸距靜動態矩陣。 | 高；`MatchWheelProfile_IncompatiblePair_RejectsAssembly_FullContractRegression` |

### IT 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| IT-001／SC-001、SC-002、SC-003 | ✅ 已符合 | `tools/catalog/importing.py:210`；`tools/catalog/policies.py:46`；`tools/catalog/resolving.py:77`；`tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126`；`tools/catalog/tests/unit/test_sc_002.py:15`；`tools/catalog/tests/integration/test_catalog_resolve.py:80`；`tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 真正CLI、來源檔與SQLite涵蓋三場景，FK／hash／alias／日期及rollback反例齊備。 | — |
| IT-002／SC-004、SC-005、SC-027 | ⚠️ 部分符合 | `tools/catalog/repository.py:131`；`tools/catalog/quality.py:321`；`tools/catalog/cli.py:94`；`tools/catalog/policies.py:94` | `tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_snapshot_repository.py:123`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | 快照／CAS、拒絕發布與單件合成報告正例已驗；仍無真實完整 SQLite 全量發布矩陣或成功切 head 正例。 | 高；`RunPublishGate_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-003／SC-006、SC-010、SC-013 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11`；`tools/catalog/building.py:114`；`tools/catalog/render_views.py:15`；`tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 真Blender／validator／六視圖可跑，缺補模與所有代表件完整品質及RuntimeBuild。 | 高；`RunModelPipeline_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-004／SC-007、SC-008、SC-029 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15`；`game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58`；`game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；`tools/catalog/tests/integration/test_transparent_conversion.py:69`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | UPM blocker 已解除，真正 Unity PlayMode 非0測試已 Green：glTFast 實際匯入 3001／3298／3005，核對 3001 尺寸、3298 非對稱、3005 stud 與 3001 八個 cavity probes；最終 EditMode 亦進 Test Runner exit 0。仍缺 SC-007 的 mesh／normal／tangent／winding／metadata 全矩陣、SC-008 完整代表 profile 配對與 collider 組合，以及 SC-029 真實 texture／preview 預算與完整尺寸容差矩陣，因此保持部分符合。 | 高；`RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-005／SC-009、SC-031 | ⚠️ 部分符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192` | 分類及讀取過濾局部完成，缺六部位／同系統建材與Special用途完整矩陣。 | 高；`RunUsageProjection_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-006／SC-011、SC-022 | ⚠️ 部分符合 | `tools/catalog/jobs.py:158`；`tools/catalog/building.py:167`；`tools/catalog/repository.py:105`；`tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/integration/test_catalog_build.py:57`；`tools/catalog/tests/integration/test_catalog_cli.py:153`；`tools/catalog/tests/integration/test_catalog_build.py:113`；`tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | 真DB租約與Python worker timeout已驗；缺Published後新貨號與真Blender程序終止恢復。 | 高；`RunJobRecovery_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-007／SC-012、SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 精確resolver有測，尚無跨引擎重建舊模型的實際Player流程。 | 高；`RunLegacyRuntime_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-008／SC-015、SC-028 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30` | 101筆SQLite分頁已有測試，缺Release與完整錨點／車輛／版本化profile投影矩陣。 | 高；`RunReadContract_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-009／SC-016、SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs:18`；`tools/launcher/Program.cs:86`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:35`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 唯讀DB與本機原生探針已有證據，缺一般使用者ACL／不可寫使用者根完整Player矩陣。 | 高；`RunNativeStorage_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-010／SC-017、SC-023 | ⚠️ 部分符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175`；`tools/catalog/repository.py:190` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100`；`tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | 真InstallerCore故障与profile保留已驗；空間不足及舊模型相容更新未全驗。 | 高；`RunInstallerSwitch_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-011／SC-018、SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | checker與SQLite rollback各有單測，無一致備份／migration／組裝檔引用流程。 | 高；`RunSaveFixtures_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-012／SC-019、SC-024 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 包索引／遠端／越界局部反例已驗；完整安裝錯誤與存檔保留矩陣不齊。 | 高；`RunPackageValidation_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-013／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 真HTTP stub 429／timeout加fake clock、checkpoint／重試上限及候選不變斷言涵蓋SC-021。 | — |
| IT-014／SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | 真雙連線CAS已有證據，無head切換前後舊session／實體內容一致性驗證。 | 高；`RunConcurrentPublish_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-015／SC-032、SC-039、SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53`；`game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | lease與內部provider探針已驗；慢載入／退出重入的真場景共享資源矩陣不足。 | 高；`RunAssetLifetime_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-016／SC-033、SC-034、SC-035、SC-037、SC-038、SC-040、SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6`；`game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | uGUI與Player操作已有證據；鍵盤篩選／重試、損毀換件及圖形故障矩陣不齊。 | 高；`RunPreviewInteractions_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-017／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 20樣本畫面存在；缺逐變體來源外觀比對、橡膠差異及使用者核准紀錄。 | 高；`RunVisualVariants_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-018／SC-043、SC-044、SC-045、SC-046 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28`；`tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 無完整效能／記憶體／輪組原型與原始量測。 | 中；`RunPerformanceFixtures_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-019／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | 有內部F-Catalog建置，非Ready與使用條件通過的Frozen合格子集。 | 高；`BuildPreview_IncompleteCatalog_LabelsNonRelease_FullContractRegression` |
| IT-020／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | validation_builds資料表與helper存在，缺真正BuildValidationContent入口及Unity結果。 | 高；`BuildValidation_FrozenSnapshot_ProducesStagingOnly_FullContractRegression` |
| IT-021／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | 只驗選件版本改動及CAS；缺toolchain/target逐欄與正式精確封裝正例。 | 高；`PromoteBuild_ChangedSourceDigest_RejectsPromotion_FullContractRegression` |
| IT-022／SC-049 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | 真兩程序競爭及檔案鎖故障已有證據，缺原生訊息與真ACL故障完整驗收。 | 高；`Update_GameRestartsDuringStaging_DefersSwitch_FullContractRegression` |
| IT-023／SC-050 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | 沒有WAL一致備份及copy/validate/commit/migration故障注入流程。 | 高；`Backup_IncompleteCopy_DoesNotReplaceLastGood_FullContractRegression` |
| IT-024／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 真SQLite完整引用resolver已驗；複合FK／unique／target所有寫入反例不齊。 | 高；`Resolve_MixedReferenceTuple_RejectsModel_FullContractRegression` |
| IT-025／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 零IO預取消及內部provider取消有證據；真UI銷毀回呼／不彈警報矩陣不足。 | 高；`AcquireAsync_PreCancelled_AllocatesNoHandle_FullContractRegression` |
| IT-026／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python真junction拒絕不等於Player adapter根外零讀取及profile驗證。 | 高；`LoadAsset_ReparsePointEscape_RejectsAccess_FullContractRegression` |
| IT-027／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python同大小mtime／verified bytes已有測；缺真loader barrier／新程序／存活lease完整矩陣。 | 高；`LoadAsset_ReplacedSameSizeBundle_InvalidatesValidation_FullContractRegression` |
| IT-028／SC-056 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 來源metadata檢查已做，未貫通runtime匯入／序列化／候選過濾。 | 高；`ValidateWheel_UnknownMass_DoesNotInventValue_FullContractRegression` |
| IT-029／SC-056 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 沒有兩輪徑／兩軸距／非法配對的Unity靜態與動態原型。 | 高；`MatchWheel_IncompatibleAxle_RejectsAssembly_FullContractRegression` |

### CT 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| CT-001／SC-015、SC-019、SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | Open部分錯誤可追溯，缺已發布正例、缺DLL與取消連線完整矩陣。 | 高；`OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-002／SC-015、SC-020、SC-028、SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:23`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:32`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | 101筆分頁／字面查詢已驗，Release全部用途／Special／非法輸入仍缺。 | 高；`QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-003／SC-012、SC-015、SC-020 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:23` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:32`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236` | 正常詳情有測；未知UUID與錯快照／歷史投影差異完整矩陣不足。 | 高；`GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-004／SC-008、SC-015 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` | profile 配對本體已驗版本化ID、明確雙向相容與跨系列拒絕；公開 `GetProfilesAsync` 仍缺同名不同系列、多快照版本的真 session 投影矩陣，因此保持部分符合。 | 高；`GetProfilesAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-005／SC-005、SC-015、SC-027 | ⚠️ 部分符合 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`tools/catalog/policies.py:94` | `tools/catalog/tests/integration/test_catalog_cli.py:81`；`tools/catalog/tests/integration/test_catalog_cli.py:196`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | 只回讀U及單元count政策，缺API空基準／審查／完整分母整組。 | 高；`GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-006／SC-012、SC-019、SC-024、SC-032 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11`；`game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 真provider正常／取消已有證據；多包／全部故障／零權益寫入矩陣不足。 | 高；`AcquireAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-007／SC-018、SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 純checker測schema與missing單引用；缺真adapter完整requiredModels與存檔bytes。 | 高；`Check_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-008／SC-032、SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | session／lease可重複Dispose；真退出uGUI與共享資產矩陣不足。 | 高；`Dispose_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-009／SC-019、SC-020、SC-025、SC-026 | ✅ 符合 | `game/Assets/BrickHigh/Domain/CatalogResult.cs:7`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:67` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogResultPolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogResultPolicyTests.cs:33` | 全 11 錯誤碼、繁中文案、retryable、診斷 ID、Success／Failure 互斥及任意 message 去敏已參數化驗證；Unity 163/163。 | 本項完成；各 BDD 場景仍依各自端到端門檻計 |
| CT-010／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | Release拒Preview已測；InitialBucket、profile隔離及改config反例不齊。 | 高；`OpenRelease_PreviewPack_RejectsPackage_FullContractRegression` |
| CT-011／SC-050 | ✅ 符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9`；`game/Assets/BrickHigh/Application/SaveOpenCoordinator.cs:38` | `game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs:48`；`game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs:166` | 相容、需 migration、較新 schema、壞內容及空 requiredModels 矩陣已測；真 NativeSqlite F-Save 證明較新 schema 零可寫開啟且 bytes 不變，相容時可寫回讀。 | 本項完成；正式 Player 存檔流程仍待整合 |
| CT-012／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | pack/schema/腐壞有反例；全部身分逐欄及缺歷史引用矩陣不齊。 | 高；`OpenAsync_ManifestCatalogMismatch_RejectsPack_FullContractRegression` |
| CT-013／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 部分null/disposed/跨owner與header有測；全部方法及不同requiredModels去重仍缺。 | 高；`QueryAsync_NullOrDisposedSession_ReturnsInvalidQuery_FullContractRegression` |
| CT-014／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 字面查詢與界線單測已做，契約层255/256/257及4095/4096/4097全矩陣未驗。 | 高；`QueryAsync_OversizedOrLiteralWildcard_ValidatesAndBinds_FullContractRegression` |

### ET 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| ET-001／SC-033 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 內部包可安裝首次啟動；未在無開發工具的乾淨斷網Windows完整驗收。 | 高；`RunOfflineInstall_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-002／SC-034、SC-035、SC-037 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 真Player換件／空結果／鏡頭／鍵盤有證據；所有篩選／鍵盤重試／翻頁尚缺。 | 高；`RunBrowseAndCamera_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-003／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 有20樣本六方向Player圖；缺逐外觀來源比對及材質失敗反例與使用者核准。 | 高；`RunMaterialAcceptance_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-004／SC-038、SC-039、SC-040、SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8`；`game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | presenter與原生探針局部通過，未執行安裝版完整故障／快速切換／重入矩陣。 | 高；`RunRapidSelection_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-005／SC-019、SC-026、SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86`；`game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 原生啟動器存在，缺全部故障的原生通知與原profile保留證據。 | 高；`RunStartupFailure_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-006／SC-016、SC-017 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs:18`；`tools/launcher/Program.cs:86`；`tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:35`；`tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | InstallerCore升級及uninstall保留fixture，缺一般帳號／唯讀安裝與实际重啟完整矩陣。 | 高；`RunInstallUpgradeUninstall_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-007／SC-023、SC-025 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53`；`game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 更新回滾及schema政策部分已測，缺安裝版空間不足／缺舊映射逐例訊息。 | 高；`RunFailedUpdateAndSave_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-008／SC-006、SC-007、SC-010、SC-013 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11`；`game/Assets/BrickHigh/Domain/Geometry.cs:15`；`tools/catalog/building.py:114`；`tools/catalog/render_views.py:15`；`tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69`；`tools/catalog/tests/integration/test_six_views.py:12`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 真來源轉GLB／Player樣本已做，缺自建補件及完整品質鏈。 | 高；`RunSourceToPlayer_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-009／SC-005、SC-027 | ❌ 未符合 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190`；`tools/catalog/policies.py:94` | `tools/catalog/tests/integration/test_catalog_cli.py:81`；`tools/catalog/tests/integration/test_catalog_cli.py:196`；`tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | 尚無真實全量生產來源、Ready資產及正式發布報告。 | 高；`RunFullCatalogRelease_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-010／SC-012、SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 精確引用fixture能解析，沒有兩代引擎安裝包的舊外觀／尺寸驗收。 | 高；`RunLegacyModelUpgrade_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-011／SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無基準機1000次查詢P95與單件冷載首幀數據。 | 中；`RunQueryAndColdLoad_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-012／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無2026片8幾何固定場景的正式FPS／P95報告。 | 中；`RunFrameBenchmark_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-013／SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無20模型5輪切換與LRU／記憶體實測。 | 中；`RunMemoryBenchmark_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-014／SC-046 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 無輪組坡道／路緣實際Player原型。 | 高；`RunWheelGeometryPrototype_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-015／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`artifacts/acceptance/pm-20260928-interactive-20-a/run.json` | 內部20樣本可操作；缺合格Ready子集、全部代表類別及Release隔離完整驗收。 | 高；`AcceptPreview_VisibleAssets_DoesNotCompleteFullCatalog_FullContractRegression` |
| ET-016／SC-049 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | Preview持鎖啟動與Installer身份已有證據，缺兩代Release/Preview真包交叉升級矩陣。 | 高；`Upgrade_StableProductIdentity_UsesExistingProfile_FullContractRegression` |
| ET-017／SC-050 | ✅ 符合（F-Save harness） | `tools/acceptance/save_fixture_recovery.py:69`；`tools/acceptance/save_fixture_recovery.py:97`；`tools/acceptance/save_fixture_recovery.py:113` | `tools/acceptance/tests/integration/test_save_fixture_recovery.py`；`artifacts/acceptance/pm-20260927-save/` 四種 CLI 報告 | 真 SQLite／WAL 一致備份、失敗 rollback、最後良好備份及無選擇／取消／失敗／確認矩陣 14 項通過；確認前新進度保留，確認後先另存當前進度。正式玩家 UI 不屬本 harness。 | 本項完成；SC-050 正式 UI／schema 仍部分符合 |
| ET-018／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 隨包Noto與三尺寸可讀性已有證據，缺所有錯誤文案／缺glyph反例及乾淨離線機。 | 中；`Preview_MissingChineseGlyph_FailsVisualCheck_FullContractRegression` |
| ET-019／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 原生launcher有MessageBox與本機診斷，缺無3D／崩潰故障通知實機證據。 | 中；`Startup_NoGraphicsDevice_ProvidesNativeNotice_FullContractRegression` |
| ET-020／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `artifacts/acceptance/wd-20260926-interactive-c/PlayerEvidence/frames/`；`artifacts/acceptance/pm-20260928-interactive-20-a/manual-visual-review.html` | 使用者先前接受八件內部畫面方向；新20件安裝版畫面已交由使用者自行判斷外觀，主代理不代判。仍無綁定真實 Ready revision 的 `visualBaselineId`、正式核准及缺陷回歸流程，`visualApproved=false` 保持不變。 | 中；`Render_GoldenReferenceMismatch_RequiresReview_FullContractRegression` |
| ET-021／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 尚無固定2026片場景與指定或核准硬體的完整原始測量。 | 中；`Benchmark_DifferentHardware_DoesNotClaimBaselinePass_FullContractRegression` |
| ET-022／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 未凍結profile，無正確材質首幀及冷暖／穩態分段資料。 | 中；`Benchmark_ChangedPreset_InvalidatesComparison_FullContractRegression` |
