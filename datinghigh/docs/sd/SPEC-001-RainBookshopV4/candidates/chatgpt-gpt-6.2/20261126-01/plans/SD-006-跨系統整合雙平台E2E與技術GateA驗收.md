# SD-006-跨系統整合雙平台E2E與技術GateA驗收 — 分項實作設計

**功能／工作包 ID**：`SD-006-跨系統整合雙平台E2E與技術GateA驗收`
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[作者草案 JSON](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)
**文件包／AI／模型／批次**：`docs/sd/SPEC-001-RainBookshopV4/final`／ChatGPT GPT-6.2／20261126
**設計版本／契約版本／優先級**：`0.2.0-draft`／`SD-contract-v2`／高（跨層真環境整合與技術 Gate A 守門人）
**執行狀態／驗收狀態／最後更新**：`Planned`／`Incomplete`；設計 Draft／2026-11-26
**執行／整合／驗收責任**：唯一執行與跨包技術 Gate A 驗收整合責任：`SD-006` 執行者；Gate B 人工簽認、Local 清理與最終權威文件回寫責任：[SD-007](SD-007-實玩GateB與Local清理結案交付.md)
**來源與程式碼基準、核准設計快照**：見 [SD 總覽 — 來源、程式與設計基準](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

| 指標 | 完成／總數 | 狀態 |
|---|---:|---|
| 設計 D | 0 / 4 | Draft；須全量逐項稽核後才勾選 |
| 本分項主要 TDD 結構映射 | 89 / 89 | 不是完整設計涵蓋或產品驗證 |
| 本分項行為責任清冊 | 42 項 BDD 關聯 | 跨包責任不得重複計入來源總數 |
| 實作驗證 I | 0 / 6 | 0.0%；尚未開發 |

### 分層／分組進度追蹤

本分項 D、I 以「實現檢查清單／Todo」唯一葉節點計算；S 細步不新增分母。設計核准與產品驗收分離。

### 當前 Sprint 狀態

Draft，無執行中 I、無實作證據；以 [總覽](../00-overview.md) 與 [設計決策](../03-design-decision.md) 的 final 核准關卡為準。

### 里程碑

完成本包細步、群組整合關卡、必要跨包驗證後才能勾選 I；未取得證據不得提前勾選。最終產品驗收見 SD-006、SD-007。

### 關鍵指標

主要 TDD 89 項；D 4、I 6；既有產品證據 0。BDD 完整設計涵蓋尚待逐條確認，不以映射數替代。

### 每日進度記錄

不適用。依 AGENTS.md 僅就地維護有效設計及唯一進度；證據只放 Verification。

## 功能概述

本分項承擔 `SD-001`～`SD-005` 合併後的跨系統真實環境整合、Web 與 Android 雙平台雙真人視角 E2E 驗收、效能與資源基線量測、靜態化身與權利證據核對，以及**技術 Gate A** 總守門責任：
1. **解決 Android 腳本歷史路徑限制（`RA-11` / `AGENTS.md`）**：檢視並修正 `tools/test-android.ps1` 內殘留的目錄搬移前路徑引用，對齊現行 `datinghigh/` 工作區結構，恢復 APK 建置／安裝／ADB 驅動的可重跑能力。
2. **真本地平台 Live Bridge 整合**：透過 `npm run build:e2e-host` 與本地 `8787` 平台執行跨 `.NET 10` Container Host＋Workerd 真 D1/R2/DO 的雙人配對、V4 開局釘選、全程互動與效能基線檢核，同時確認 `npm run check:foundation` 零回歸。
3. **Web 與 Android 雙端獨立全場景 E2E（零 fixture 代簽）**：在 `tests/e2e/web/scene-event-v4.spec.ts` 與 `tests/e2e/android/scene-event-v4.mjs` 完整實作並執行雙真人視角之全部 `@frontend` 場景（入店、導覽小地圖、呼吸光長按、手勢護欄、5 區 20 書、盲書撕封、興趣貼紙、共鳴、黑膠、彩蛋、擦霧與前景見證、同異書、近遠面紙、留白反向主動、婉拒、提問卡、8×3 聊天建議、阿澄人設、暴雨過場、Ready Gate、兩題組救書、反轉鎖扣、錯抽復位、快捷泡泡、水位階段、15s 暫緩與反覆斷線／閒置前景重入恢復、S/A/B 結算、書籤、3×3 意願、四結局、小票稱號與印章、自然完成重玩、安全退出、缺素材保護、靜態化身重用與效能實測；並一併寫好 `CleanReplay` 測試案例供 `SD-007` 清理後呼叫）。
4. **Gate A 自動檢核器**：實作 `tools/rain-bookshop-v4-gate-a-audit.mjs`，逐一核對真 D1/R2/DO、HTTP/WS、Web、Android、80 素材解碼、16 經典與音樂／封面權利、必要真供應商靜態路徑證據與效能紀錄，缺任一項嚴格阻斷 Gate A 通過。

- **條件式跨包缺陷修補規則（P1/P6）**：若在真環境整合或雙端 E2E 實測中發現 `SD-001`～`SD-005` 既有核准設計範圍內的實作瑕疵，必須先確認無其他寫入者運行，移交回原唯一檔案負責包（或由主責人在原檔案責任記錄下修補）並重跑該包對應單元／整合測試與本包受影響 E2E；若涉及變更已記載設計或契約，立即停止並走人工設計變更確認。

## 功能需求與來源追溯

| MVP／SPEC 項目 | BDD Scenario | TDD 測試項（本包唯一負責之 89 項：3U + 2I + 84E） | 系統設計 ID／本包 Todo／步驟 ID | 驗收條件 | 跨包共同成果與整合責任 |
|---|---|---|---|---|---|
| `RB4-AC-012`、`RA-11`、`12` | `RB4-BDD-050`、`051` | Unit：`RB4-T-291`～`293`（3 項）；Integration：`RB4-T-288`、`294`（2 項）；E2E：`RB4-T-289`、`290`、`337`（3 項） | `SYS-009`／`D01`、`D04`、`I01`、`I02`、`I06`／`S01`、`S02`、`S06` | Gate A 檢核器阻斷局部代簽；真本地 Live 與雙端效能對照 V3 基線有實測數據；80 素材與 16 經典／音訊／封面權利及必要真供應商證據齊備 | 驗證 `SD-001`～`SD-005` 全體成果；證據由 `SD-007` 彙入 `Verification.md` 供本人 Gate B 審閱 |
| `RB4-AC-001`～`006` | 前半 19 個 `@frontend` Scenario（`BDD-001`～`017`、`019`、`020`） | Web E2E 19 項（`004`,`009`,`014`,`019`,`024`,`030`,`037`,`042`,`048`,`053`,`058`,`064`,`070`,`076`,`082`,`088`,`094`,`105`,`111`）＋Android E2E 19 項（`005`,`010`,`015`,`020`,`025`,`031`,`038`,`043`,`049`,`054`,`059`,`065`,`071`,`077`,`083`,`089`,`095`,`106`,`112`）＝38 項 | `SYS-009`／`D02`、`D03`、`I03`、`I05`／`S03`、`S05` | 兩真人正式畫面與權威狀態在 Web 與 Android 獨立實測相符，零 fixture 代簽 | 整合驗收 `SD-001`～`SD-005` 前半成果 |
| `RB4-AC-007`～`012`、`RQ-01`、`RA-01` | 後半與平台 22 個 Gate A 內 `@frontend` Scenario（`BDD-022`,`023`,`026`～`032`,`034`～`036`,`038`,`040`～`042`,`044`～`046`,`048`,`049`；`050` 已計入首列） | Web E2E 21 項（`122`,`129`,`145`,`151`,`157`,`163`,`169`,`175`,`182`,`193`,`199`,`205`,`217`,`228`,`234`,`240`,`251`,`258`,`265`,`277`,`283`）＋Android E2E 21 項（`123`,`130`,`146`,`152`,`158`,`164`,`170`,`176`,`183`,`194`,`200`,`206`,`218`,`229`,`235`,`241`,`252`,`259`,`266`,`278`,`284`）＋雙端補強 `RB4-T-324`（1 項）＝43 項（加上首列 `289`,`290`,`337` 共 84 項 E2E！） | `SYS-009`／`D02`、`D03`、`I04`、`I05`、`I06`／`S04`、`S05`、`S06` | 風暴、雙向救書、反覆閒置／斷線前景重入自動恢復無死鎖、四結局、書籤、小票、安全退出與化身重用在 Web 與 Android 皆獨立通過 | 整合驗收 `SD-001`～`SD-005` 後半成果；同時備妥 `CleanReplay`（`308`,`309`）腳本供 `SD-007` 清理後執行 |

### BDD 行為與產品實作分解

| BDD Scenario／條件或 Examples | 角色／Given | When／操作 | Then／And／But 各結果與副作用 | 實際產品 F-ID／符號／核心分支 | 必要 S／I／V／跨包成果 |
|---|---|---|---|---|---|
| `RB4-BDD-051` GateA & `RB4-BDD-050` PlatformPerformance | 跨系統驗收執行者／正式 V4 全資產與真本地平台＋Web＋Android 裝置 | 執行真 D1/R2/DO、HTTP/WS、雙端全部 `@frontend` 場景、效能採集與權利核對 | 任一缺項或失敗嚴禁簽認 Gate A；Web 與 Android 載入／延遲／記憶體對 V3 基線完整記錄且離開清資源 | `F-01` `test-android.ps1`、`F-02` `test-scene-web.mjs`、`F-03` `auditRainBookshopV4GateA`、`F-04` `rain-bookshop-v4-live.mjs`（驗證 `SD-001`～`SD-005` 產品實作） | `SD-006-S01`、`S02`、`S06`／`I01`、`I02`、`I06`／`V-001`、`V-002`、`V-006` |
| 前半 19 個＋後半 22 個 `@frontend` Scenario（共 41 個 Gate A 前 UI 場景＋`055` 腳本預備） | 兩名真實測試帳號於正式 Web 雙瀏覽器視窗及 Android 應用程式 | 在真實畫面上執行點擊、長按、橫滑、右滑撕封、擦霧、拖面紙、上滑傳書、裝袋鎖扣、斷線重入、翻對方書與退出 | Web（`F-05`）與 Android（`F-06`）各自獨立驗證畫面文字、素材呈現與 D1 權威狀態一致，不開啟錄影／trace，原生 UI XML 不落盤 | `F-05` `scene-event-v4.spec.ts`、`F-06` `scene-event-v4.mjs`（驗證 `SD-004`、`SD-005` 實際產品元件與 `SD-001`～`003` 後端） | `SD-006-S03`～`S05`／`I03`～`I05`／`V-003`～`V-005` |

## 用戶故事

- 作為**即將親自試玩驗收 Gate B 的產品負責人（使用者）**，我想要在進入人工試玩前，技術團隊已在真實 D1/R2/DO、正式 Web 與真實 Android 環境逐條跑通全部 42 個畫面場景、雙題組、四結局、斷線恢復與效能基線且無任何假通過，以便我能安心進行高品質的實玩審核。

## 畫面操作／系統處理流程

1. **序列環境控制（`AGENTS.md` 必守規則）**：本地 `8787` 平台、`test:live`、Web E2E、故障／重啟測試與 Android E2E **嚴格單一序列依序執行**，禁止多個依賴 `8787` 的腳本同時爭搶埠號或資料庫。
2. **安全與隱私測試約束**：Playwright 設定強制 `video: 'off'`、`trace: 'off'`；Android `uiautomator dump /dev/tty` 輸出直接由 Node 透過 stdout 串流於記憶體解析，禁止在磁碟留存原生畫面 XML 檔或輸出任何測試帳號 token／驗證碼。

### 畫面、元件與互動分解（適用時）

本包為純跨系統驗證、測試執行器修復與 Gate A 稽核包，不直接新增產品前端元件（產品畫面已於 `SD-004`、`SD-005` 完成）；本包 `F-05`（Web）與 `F-06`（Android）逐一對 `SD-004`、`SD-005` 所有畫面元件執行真實指標／觸控手勢與視覺狀態驗證。

## 技術規範與實作設計

### 架構、DDD 與責任

- 所屬層級：根目錄跨系統整合與平台驗收層（`tests/integration/`、`tests/e2e/web/`、`tests/e2e/android/`、`tools/`），符合 `overview/02-development-guidelines/02-file-placement.md`。

### 重要函式、核心邏輯與狀態

| 核心 ID／目標類別或函式 | 輸入／輸出與前後置條件 | 演算法／分支／偽碼 | 交易／併發／冪等／重試 | 錯誤語意／驗證 |
|---|---|---|---|---|
| `C06-1`：`auditRainBookshopV4GateA`（`F-03`） | 輸入測試執行報告、80 素材與 16 經典權利清單、Web/Android 效能紀錄、靜態化身驗證紀錄；輸出 `{ gateAReady: boolean, missingItems: string[] }` | 逐項檢查：1. Gate A 範圍內 Unit／Integration／API 全綠（排除 T295～309、334）；2. Web 41 場景＋`324`＋效能實測通過；3. Android 41 場景＋`324`＋效能實測通過（若缺裝置則明確列於 `missingItems` 且 `gateAReady = false`）；4. 80 素材解碼與 16 經典／音訊／封面權利核實無缺；5. 靜態化身重用與必要供應商證據齊備。 | 純唯讀檢核函式。 | 缺任何一項必回 `gateAReady: false`，嚴禁以部分測試通過代簽（`RB4-T-291`～`293`、`337`）。 |
| `C06-2`：`tools/test-android.ps1` 工作區路徑修正（`F-01`） | PowerShell 啟動參數與 ADB 裝置狀態 | 以 `$PSScriptRoot` 推導 `datinghigh/` 根目錄（修正搬移前殘留之舊相對路徑），檢查 `adb devices`、APK 與本地平台連線；若無可用 Android 裝置／模擬器，立即回傳非零退出碼與明確環境缺項說明（絕不假裝通過）。 | 單次序列執行。 | 解決 `AGENTS.md` 明載之 Android 重跑路徑限制。 |

### 契約、資料與平台

- 測試建立的所有驗收用配對帳號與 Round 均帶有明確可識別之本地驗收標記或記錄於本地驗收清單，方便 Gate B 後由 `SD-007` 依 `RQ-04` 具名完整清理。

### 共用與改動合理性

- 在本包 `F-05` 與 `F-06` 內一併建置好 `--grep CleanReplay`（對應 `RB4-T-308` Web 與 `RB4-T-309` Android）測試案例，讓 `SD-007` 在完成 Local 清理後可直接執行該選擇器驗收，保持 E2E 檔案由 `SD-006` 100% 唯一寫入。

### Runner 實際入口與 Gate A 依賴校正

| 責任 | 現有入口與新增設計 | 實際驗證指令／限制 |
|---|---|---|
| F01 Android | tools/test-android.ps1 現行 -Suite allowlist 不含 v4；新增唯一 v4-gate-a suite 映射 tests/e2e/android/scene-event-v4.mjs，將 Pattern 實際傳入測試選擇器；保留既有 suite 路徑及 AdbPort。 | pwsh -File tools/test-android.ps1 -Suite v4-gate-a；指定 -Pattern RB4-T-xxx，必須證明選出且執行該 ID，零測試視為失敗。 |
| F02 Web | tools/test-scene-web.mjs 現行只轉 Playwright scene-event-framework.spec.ts。新增明確 --suite v4-gate-a/v4-act1-act2 dispatch 到 scene-event-v4.spec.ts、使用既有 config 與真 host，舊預設保持。解析 suite 後再轉發 --grep；未知 suite fail closed。 | node tools/test-scene-web.mjs --suite v4-gate-a --grep RB4-T-xxx；前半用 v4-act1-act2。不可讓 --suite 穿透到不支援此參數的 Playwright。 |
| F03/F07 | gate-a-audit 為本包新增 evidence validator；--strict 讀實際測試結果、平台、原稿與正式 SHA 及權利清冊，不接受空測試、fixture 假證據、未實拍畫面或 stale SHA。 | node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs；node tools/rain-bookshop-v4-gate-a-audit.mjs --strict。 |
| F04 | 真 local live 用已完成 SD001 隔離候選索引與 SD002/003/004/005 產品；不得為了測試先啟用 default local 正式索引。 | node tests/integration/rain-bookshop-v4-live.mjs；現有 test:live/check:foundation 不算 V4 特定通過。 |

S02 先產真 Live 基礎及可用 runner，T294 若含 Gate A 全平台條件，必須延至 S06 總核對才完整勾選（S02 只回填已測子證據）；S03/S04 Web 與 S05 Android 各 41 個場景，T324 雙平台同一 source ID 兩份證據才可勾選；T337 S06 總 Gate A。不得要求 S02 先有 S05/S06 的結果。Gate A 321 唯一 ID（包括 84 E2E），Gate B T295 與 Gate B 後 15 唯一 ID 不提前勾。Gate A 完成且釘選 scene/narrative SHA 一致後，才由 SD001 F13 現有 scene-publish guard 啟用 default local 正式索引，將實際結果與 SHA 交給 SD007；技術 Gate A 不等於本人 Gate B。

## 檔案改動設計

### F-01：`tools/test-android.ps1` 與 `F-02`：`tools/test-scene-web.mjs`

- 改動類型：修改兩檔
- 目標類別／函式／區段與現況證據：修正 `tools/test-android.ps1` 搬移前路徑引用並支援執行 `tests/e2e/android/scene-event-v4.mjs`；擴充 `tools/test-scene-web.mjs` 支援執行 `tests/e2e/web/scene-event-v4.spec.ts` 與輸出效能摘要（保留既有 V3/基礎模式）。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-012`、`RA-11`／`RB4-BDD-050`、`051`／`RB4-T-289`、`290`、`337`／`SD-006-D01`、`I02`、`I05`／`S02`、`S05`
- 改動要點與必要核心邏輯：以動態工作區根路徑取代舊路徑，強制關閉影片／trace，確保原生 XML 僅在記憶體處理。
- 此檔案的責任與白話設計原因：恢復並打通 Web 與 Android 正式驗收 runner 的一鍵可重跑能力。
- 輸入／輸出、介面及契約限制：僅指向已知 local instance，禁止觸碰其他專案程序。
- 前置依賴：`SD-005` 完成前端組裝。
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入；`SD-007` 唯讀呼叫執行 `CleanReplay`。
- 驗證方式與預期結果：Web 與 Android runner 實際啟動並跑通測試。
- 實際證據回填位置：`V-002`、`V-005`、`V-006`（待回填）。

### F-03：`tools/rain-bookshop-v4-gate-a-audit.mjs` 與 `F-07`：`tools/tests/rain-bookshop-v4-gate-a.test.mjs`

- 改動類型：新增兩檔
- 目標類別／函式／區段與現況證據：新增 Gate A 證據完整性與權利總檢核模組及其單元測試。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-012`、`RA-11`、`12`／`RB4-BDD-051`／`RB4-T-291`～`293`、`337`／`SD-006-D04`、`I01`、`I06`／`S01`、`S06`
- 改動要點與必要核心邏輯：實作 `C06-1`，驗證真 D1/R2/DO、HTTP/WS、Web、Android、80 素材、16 經典與音樂權利、效能與靜態化身證據缺一不可。
- 此檔案的責任與白話設計原因：以程式化規則杜絕「跑過部分測試就宣告 Gate A 完成」的人為疏漏。
- 輸入／輸出、介面及契約限制：唯讀檢核，不改寫任何來源文件。
- 前置依賴：無。
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入。
- 驗證方式與預期結果：`node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs` 通過。
- 實際證據回填位置：`V-001`、`V-006`（待回填）。

### F-04：`tests/integration/rain-bookshop-v4-live.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：新增針對真實運行中本地平台（`.NET` Host + Workerd D1/R2/DO）之跨系統 Live 整合與效能／資源基線驗證腳本。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-012`／`RB4-BDD-050`、`051`／`RB4-T-288`、`294`／`SD-006-D01`、`I02`／`S02`
- 改動要點與必要核心邏輯：在真實 live bridge 驗證 V4 發布、雙真人配對開局、兩題組與四結局端到端權威鏈路及有界資源基線。
- 此檔案的責任與白話設計原因：補齊模組隔離測試與瀏覽器 UI 測試之間的真實跨進程橋接證據。
- 輸入／輸出、介面及契約限制：僅連本地 `127.0.0.1:8787`。
- 前置依賴：`SD-001`～`SD-005` 完成。
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入。
- 驗證方式與預期結果：本地平台啟動下執行 `node tests/integration/rain-bookshop-v4-live.mjs` 通過。
- 實際證據回填位置：`V-002`（待回填）。

### F-05：`tests/e2e/web/scene-event-v4.spec.ts`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：新增正式 Web 雙瀏覽器視角 V4 完整 E2E 測試套件（涵蓋 41 項 Gate A 前場景＋`RB4-T-289` 效能＋`RB4-T-324` Web 段＋`RB4-T-337` Web 段，以及預置供 `SD-007` 清理後執行之 `RB4-T-308` `CleanReplay`）。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／全部 42 個 `@frontend` BDD 之 Web 驗證／`SD-006-D02`、`I03`、`I04`／`S03`、`S04`
- 改動要點與必要核心邏輯：透過兩個隔離 BrowserContext 登入兩名真實測試玩家，針對匯出之正式 Web 應用程式執行真實滑鼠／指標點擊、長按、橫滑、右滑撕封、擦霧、拖面紙、上滑傳書、鎖扣、重複閒置／斷線重入與結局小票驗證，並採集載入時間、互動延遲與 JS Heap 對照 V3 基線。
- 此檔案的責任與白話設計原因：在正式匯出的 Web 產物上驗證雙人同步互動與全部視覺／手勢細節。
- 輸入／輸出、介面及契約限制：強制關閉 `video` 與 `trace`，不記錄 token。
- 前置依賴：`SD-005` `export:web` 通過。
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入。
- 驗證方式與預期結果：`node tools/test-scene-web.mjs --suite v4` 全數通過。
- 實際證據回填位置：`V-003`、`V-004`（待回填）。

### F-06：`tests/e2e/android/scene-event-v4.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：新增正式 Android 真機／模擬器雙視角 V4 完整 E2E 測試腳本（涵蓋 41 項 Gate A 前場景＋`RB4-T-290` 效能＋`RB4-T-324` Android 段＋`RB4-T-337` Android 段，以及預置供 `SD-007` 清理後執行之 `RB4-T-309` `CleanReplay`）。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／全部 42 個 `@frontend` BDD 之 Android 驗證／`SD-006-D03`、`I05`、`I06`／`S05`、`S06`
- 改動要點與必要核心邏輯：透過 ADB `input tap`／`input swipe`（長按、橫滑、右滑撕封、擦霧、拖放、上滑傳書）、`am start`／背景切換（驗停播與前景重入自動恢復）及記憶體內 UI 階層解析與 `dumpsys meminfo`/`gfxinfo` 對照 V3 基線完成全場景實測。
- 此檔案的責任與白話設計原因：獨立取得 Android 原生平台手勢、音訊背景保護與記憶體實測證據，絕不拿 Web 結果冒充 Android。
- 輸入／輸出、介面及契約限制：UI XML 只在 Node Buffer/String 記憶體處理，嚴禁寫入磁碟檔案。
- 前置依賴：`F-01` 路徑修正完成與可用 Android 測試裝置／模擬器。
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入。
- 驗證方式與預期結果：`pwsh -File tools/test-android.ps1 -Suite v4` 全數通過。
- 實際證據回填位置：`V-005`、`V-006`（待回填）。

### Gate A 唯一範圍與發布責任校正（DEC-11/12）

技術 Gate A 的必要來源為 321 個唯一 ID（001～294、310～333、335～337）。T295 本人 Gate B、T296～309 與 T334 清理／乾淨重玩後段不得做 Gate A 的前置；後段隔離測試可預先執行但不代簽實際清理。Gate A 的檢核器按精確 ID、真證據、來源斷言和平台分別校驗，不只計報告數。T324 Web/Android 各自完成才算該唯一 ID；T337 是技術總驗，先驗其餘 320 項必要案例與證據後執行總核對，避免自我依賴。T294 同樣不得要求 T337 已通過才能執行。隔離環境驗證正式內容的精確 SHA 後，Gate A 通過才啟用已知 local 正式索引，使用 SD-001 既有發布工具與同一 SHA；舊 V3 pin 保留至 Gate B。無 remote/production 授權。`CleanReplay` 腳本由本包預建但實測歸 SD-007，不提前勾 T308/309。

## 有序實作與驗證步驟

### 步驟順序與起始關卡

| 步驟 ID／成果 | 唯一負責 I-ID／來源 | 前置步驟及所需結果／跨包契約 | F-ID／V-ID | 通過後可開始的下一步／條件 | 執行狀態／證據位置 |
|---|---|---|---|---|---|
| `SD-006-S01`：Gate A 證據與權利完整性自動檢核器單元實作 | `SD-006-I01`／`RB4-BDD-051`、`RB4-T-291`～`293` | `SD-001`～`SD-005` 全部完成並停止寫入 | `F-03`、`F-07`／`V-001` | `SD-006-S02`（`RB4-T-291`～`293` 全綠） | `Planned`；待回填 |
| `SD-006-S02`：修復 Web／Android Runner、執行基礎回歸 `check:foundation` 與真本地 Live 整合驗證 | `SD-006-I02`／`RB4-BDD-050`、`051`、`RB4-T-288`、`294` | `SD-006-S01` 通過；本地 `8787` 無衝突程序 | `F-01`、`F-02`、`F-04`／`V-002` | `SD-006-S03`（`check:foundation`、`test:live` 與 V4 Live 全綠） | `Planned`；待回填 |
| `SD-006-S03`：正式 Web 前半 19 個探索與雙向破冰場景真畫面 E2E 實測 | `SD-006-I03`／前半 19 項 Web E2E | `SD-006-S02` 通過；已執行 `export:web` 與 `build:e2e-host` | `F-05`／`V-003` | `SD-006-S04`（19 項 Web 前半 E2E 全綠） | `Planned`；待回填 |
| `SD-006-S04`：正式 Web 後半 22 個救書、重複閒置恢復、四結局、小票與效能基線 E2E 實測 | `SD-006-I04`／後半 22 項 Web E2E＋`RB4-T-324` Web 段 | `SD-006-S03` 通過 | `F-05`／`V-004` | `SD-006-S05`（Web 全 41 場景＋效能基線通過） | `Planned`；待回填 |
| `SD-006-S05`：Android 真機／模擬器全 41 場景、背景停播、重複閒置恢復與記憶體基線 E2E 實測 | `SD-006-I05`／41 項 Android E2E＋`RB4-T-290`＋`RB4-T-324` Android 段 | `SD-006-S04` 通過（與 Web 嚴格序列互斥使用 `8787`）；ADB 裝置就緒 | `F-01`、`F-06`／`V-005` | `SD-006-S06`（Android 全套 E2E 獨立通過） | `Planned`；待回填 |
| `SD-006-S06`：80 素材／16 經典權利／靜態化身證據總核對與技術 Gate A 簽認移交 | `SD-006-I06`／`RB4-BDD-051`、`RB4-T-337` | `SD-006-S05` 通過 | `F-03`、`F-05`、`F-06`／`V-006` | 本包全部完成，移交 `SD-007` 彙整 Gate A 報告並請使用者實玩 Gate B | `Planned`；待回填 |

### SD-006-S01：Gate A 證據與權利完整性自動檢核器單元實作

**對應成果與責任**：唯一負責 `SD-006-I01`；來源 `RB4-AC-012`、`RB4-BDD-051`、`RB4-T-291`～`293`；檔案 `F-03`、`F-07`；驗證 `V-001`。
**開始條件與前置證據**：`SD-001`～`SD-005` 已完成各自驗證並停止寫入。
**必讀工作範圍**：`tools/audit-story-traceability.mjs`、`SPEC-001-RainBookshopV4.md` §4（`RB4-AC-012`）、`RiskAudit` `G16`。
**可寫檔案／符號及禁止改動**：新增 `F-03`、`F-07`。
**產品改動與 BDD／畫面關聯**：純稽核檢核工具，確保 `RB4-BDD-051` 要求的真 D1/R2/DO、HTTP/WS、Web、Android、素材、權利與效能證據齊全才放行 Gate A。
**具體行為與核心邏輯**：輸入完整證據結構時回 `gateAReady: true`；缺任一平台（如缺 Android）、缺任一經典權利、缺效能數據或含 `partial`/`Deferred` 項目時必回 `gateAReady: false` 並列精確缺項。
**允許自行決定的局部細節**：報告結構欄位排序。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-S01-1`／`RB4-T-291`～`293` Gate A 守門檢核 | 完整證據集 vs 缺 Android 證據、缺 1 本書權利、缺效能數據或僅局部 Unit 通過之證據集 | 僅全齊時通過；任何局部通過或缺失均被攔截並列出缺項 | 絕不允許以局部測試代簽 | `V-001`／`tools/tests/rain-bookshop-v4-gate-a.test.mjs` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增 `rain-bookshop-v4-gate-a.test.mjs` | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs` | 因 `F-03` 未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-03` `auditRainBookshopV4GateA` | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs` | `RB4-T-291`～`293` 全通過 | 待回填 |
| 3／必要 Refactor 與回歸 | 跑根目錄工具測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm test` | 100% 通過，完成 `SD-006-I01` | 待回填 |

**本步通過條件**：`RB4-T-291`～`293` 通過。
**必須停止的情況與回報內容**：前置、必要測試環境、實際檔案／契約與設計不符，或驗收斷言不成立且需改設計時停止；不降低規格。
**可在本步修正的範圍**：`F-03`、`F-07`。
**下一步與起始條件**：`SD-006-S02`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：無外部副作用。

### SD-006-S02：修復 Web／Android Runner、執行基礎回歸 `check:foundation` 與真本地 Live 整合驗證

**對應成果與責任**：唯一負責 `SD-006-I02`；來源 `RB4-AC-012`、`RA-11`、`RB4-BDD-050`、`051`、`RB4-T-288`、`294`；檔案 `F-01`、`F-02`、`F-04`；驗證 `V-002`。
**開始條件與前置證據**：`SD-006-S01` 通過。
**必讀工作範圍**：`tools/test-android.ps1`、`tools/test-scene-web.mjs`、`AGENTS.md` 工作流命令與重跑限制。
**可寫檔案／符號及禁止改動**：`F-01`、`F-02`、`F-04`；嚴禁修改其他專案程序或使用 `--remote`。
**產品改動與 BDD／畫面關聯**：修復 runner 路徑，執行基礎平台回歸與 V4 真本地 Live 橋接整合測試（驗 `SD-001`～`SD-005` 整合無誤）。
**具體行為與核心邏輯**：依序執行 `npm run check:foundation`、`npm run test:live` 與 `node tests/integration/rain-bookshop-v4-live.mjs`。
**允許自行決定的局部細節**：CLI 選擇器旗標名稱。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-S02-1`／`RB4-T-288`、`294` 真 Live 整合與基礎回歸 | 啟動本地 E2E host 與 Wrangler 本地實例（`8787`） | `check:foundation`、`test:live` 與 `rain-bookshop-v4-live.mjs` 全部退出碼 `0`，雙題組與四結局端到端狀態正確 | 序列執行不搶埠 | `V-002`／`tests/integration/rain-bookshop-v4-live.mjs` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／準備與實作 | 修改 `F-01`、`F-02` 並建立 `F-04` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run build:e2e-host` | 建置成功 | 待回填 |
| 2／序列整合驗證 | 依序執行基礎回歸與真 Live 測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run check:foundation && npm run test:live && node tests/integration/rain-bookshop-v4-live.mjs` | 全部通過，完成 `SD-006-I02` | 待回填 |

**本步通過條件**：基礎回歸與 V4 Live 整合 100% 通過。
**必須停止的情況與回報內容**：若跨系統整合發現契約不一致，依 P5 停止並回到對應負責包修正重驗。
**可在本步修正的範圍**：`F-01`、`F-02`、`F-04`。
**下一步與起始條件**：`SD-006-S03`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：若有殘留本地 `8787` 背景程序，使用 `npm run dev:platform:restart` 受控清理。

### SD-006-S03：正式 Web 前半 19 個探索與雙向破冰場景真畫面 E2E 實測

**對應成果與責任**：唯一負責 `SD-006-I03`；來源前半 19 項 Web E2E（`RB4-T-004`、`009`、`014`、`019`、`024`、`030`、`037`、`042`、`048`、`053`、`058`、`064`、`070`、`076`、`082`、`088`、`094`、`105`、`111`）；檔案 `F-05`；驗證 `V-003`。
**開始條件與前置證據**：`SD-006-S02` 通過。
**必讀工作範圍**：`tests/e2e/web/scene-event-v3.spec.ts`、`SPEC-001-RainBookshopV4-BDD.md` 前半 19 個 `@frontend` Scenario。
**可寫檔案／符號及禁止改動**：`F-05`（關閉 `video` 與 `trace`）。
**產品改動與 BDD／畫面關聯**：純 Web 真畫面 E2E 驗收，逐一驗證 `SD-004` 與 `SD-005` 實作之前半所有手勢與雙人視角隔離。
**具體行為與核心邏輯**：匯出最新 Web bundle 後，以雙瀏覽器視角逐條跑完前半 19 個場景並核對 DOM 可見文案、素材載入與 D1 權威狀態。
**允許自行決定的局部細節**：Playwright helper 函式封裝。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-S03-1`／前半 19 項 Web 真畫面 E2E | 真本地平台＋正式 `export:web` 產物＋兩名真實測試玩家 | 19/19 項 Web E2E 全部通過，20 書翻閱、盲書撕封、擦霧見證、面紙遠近、留白反向主動與問答揭曉全相符 | 零錄影／trace 檔案殘留 | `V-003`／`tests/e2e/web/scene-event-v4.spec.ts` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／建置與撰寫 | 匯出 Web bundle 並於 `F-05` 撰寫前半 19 項 Web E2E | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run export:web && npm run build:e2e-host` | 匯出與建置成功 | 待回填 |
| 2／執行驗收 | 啟動本地平台執行 Web 前半套件 | `C:\GitProjects\gamenenstyle\datinghigh` | `node tools/test-scene-web.mjs --suite v4-act1-act2` | 19/19 項 Web E2E 全綠，完成 `SD-006-I03` | 待回填 |

**本步通過條件**：19 項前半 Web E2E 全數通過。
**必須停止的情況與回報內容**：若發現畫面與 BDD 不符，回到 `SD-004`/`SD-005` 修正並重匯出 `export:web` 重驗，嚴禁放寬斷言。
**可在本步修正的範圍**：`F-05` 測試選擇器與等待條件。
**下一步與起始條件**：`SD-006-S04`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：確認無殘留 Chromium 程序。

### SD-006-S04：正式 Web 後半 22 個救書、重複閒置恢復、四結局、小票與效能基線 E2E 實測

**對應成果與責任**：唯一負責 `SD-006-I04`；來源後半 22 項 Web E2E（`122`,`129`,`145`,`151`,`157`,`163`,`169`,`175`,`182`,`193`,`199`,`205`,`217`,`228`,`234`,`240`,`251`,`258`,`265`,`277`,`283`,`289`）＋`RB4-T-324` Web 段（並一併寫入 `RB4-T-308` `CleanReplay` 案例供 `SD-007` 清理後執行）；檔案 `F-05`；驗證 `V-004`。
**開始條件與前置證據**：`SD-006-S03` 通過。
**必讀工作範圍**：`SPEC-001-RainBookshopV4-BDD.md` 後半與平台 `@frontend` Scenario。
**可寫檔案／符號及禁止改動**：`F-05`。
**產品改動與 BDD／畫面關聯**：驗證正式 Web 上風暴過場、雙向救書、多次閒置／斷線前景重入自動恢復無死鎖、S/A/B 結算、書籤、3×3 意願、四結局、結局 2 翻對方書、借閱小票、自然完成、安全退出、缺素材保護、靜態化身重用與效能基線（對照 V3）。
**具體行為與核心邏輯**：採集初始載入耗時、翻書／手勢反應延遲、動畫幀率與離開／失權後記憶體釋放數值並寫入測試報告供 Gate A 稽核。
**允許自行決定的局部細節**：無。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-S04-1`／後半 22 項 Web E2E＋`RB4-T-324` Web 段 | 真本地平台＋雙視窗正式 Web | 全部後半案例與反覆閒置／斷線恢復通過（首次恢復不計救書分、無重置 90s）；載入／延遲／記憶體對 V3 基線完整記錄 | `CleanReplay` 測試區塊亦撰寫完畢待 `SD-007` 呼叫 | `V-004`／`tests/e2e/web/scene-event-v4.spec.ts` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／撰寫與執行 | 補齊 `F-05` 後半與效能案例並執行全套 Gate A Web E2E | `C:\GitProjects\gamenenstyle\datinghigh` | `node tools/test-scene-web.mjs --suite v4-gate-a` | 全部 41 場景 Web E2E＋`RB4-T-289`＋`RB4-T-324`(Web) 全數通過 | 待回填 |
| 2／回歸確認 | 執行既有基礎 Web 測試確認無退化 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:web` | 全數通過，完成 `SD-006-I04` | 待回填 |

**本步通過條件**：Web 端 Gate A 全部案例與既有 `test:web` 100% 通過。
**必須停止的情況與回報內容**：若效能或資源未釋放，回到 `SD-005` 修正快取並重驗。
**可在本步修正的範圍**：`F-05`。
**下一步與起始條件**：`SD-006-S05`（確保 Web 測試完全結束釋放 `8787` 後再啟動 Android）。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：無殘留瀏覽器程序。

### SD-006-S05：Android 真機／模擬器全 41 場景、背景停播、重複閒置恢復與記憶體基線 E2E 實測

**對應成果與責任**：唯一負責 `SD-006-I05`；來源全部 41 項 Gate A 內 Android E2E＋`RB4-T-290` 效能＋`RB4-T-324` Android 段（並寫入 `RB4-T-309` `CleanReplay` 供 `SD-007` 清理後執行）；檔案 `F-01`、`F-06`；驗證 `V-005`。
**開始條件與前置證據**：`SD-006-S04` 通過；`adb devices` 確認可用 Android 驗收裝置／模擬器連線正常且 APK 已同步最新前端程式碼。
**必讀工作範圍**：`tests/e2e/android/scene-event-v3-book.mjs`、`tools/test-android.ps1`、`AGENTS.md` 原生 XML 記憶體處理規範。
**可寫檔案／符號及禁止改動**：`F-01`、`F-06`；嚴禁將原生 UI dump XML 寫入硬碟檔案。
**產品改動與 BDD／畫面關聯**：在真實 Android 環境獨立驗證全部 41 個 `@frontend` 場景、退背景音訊停播、前景重入自動解除暫緩（`RB4-T-324` Android 段）與 `dumpsys` 記憶體／幀率對 V3 基線。
**具體行為與核心邏輯**：透過 ADB 驅動雙參與者互動並於記憶體比對 UI 節點文字與後端權威狀態。
**允許自行決定的局部細節**：ADB 手勢座標換算輔助。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-S05-1`／Android 全 41 場景＋`RB4-T-290`＋`RB4-T-324` Android 段 | 真本地平台＋Android APK＋ADB 裝置 | 全部 Android 案例獨立通過；反覆閒置／回前景無死鎖；載入／延遲／記憶體對 V3 基線完整記錄；磁碟零 `.xml` 殘留 | 若無可用 Android 裝置／模擬器，嚴格依 P7 標記 `Deferred` 並停止 Gate A 簽認，絕不以 Web 結果冒充通過 | `V-005`／`tests/e2e/android/scene-event-v4.mjs` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／環境查核與撰寫 | 檢查 `adb devices` 並完成 `F-06` 腳本 | `C:\GitProjects\gamenenstyle\datinghigh` | `adb devices` | 至少 1 台 `device` 就緒（若無則記錄恢復條件並停在 `Deferred`） | 待回填 |
| 2／執行驗收 | 透過修復後之 `test-android.ps1` 執行 V4 Gate A Android 套件 | `C:\GitProjects\gamenenstyle\datinghigh` | `pwsh -File tools/test-android.ps1 -Suite v4-gate-a` | 全部 Android 案例退出碼 `0`，完成 `SD-006-I05` | 待回填 |

**本步通過條件**：Android Gate A 全部案例真實執行通過且無磁碟 XML 殘留。
**必須停止的情況與回報內容**：缺少 Android 執行環境或 APK 建置工具鏈時，如實標記 `Deferred`、列出所需環境與恢復步驟並通知使用者，**禁止宣稱 Gate A 已完成**。
**可在本步修正的範圍**：`F-01`、`F-06`。
**下一步與起始條件**：`SD-006-S06`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：確認 ADB reverse / 平台埠正常。

### SD-006-S06：80 素材／16 經典權利／靜態化身證據總核對與技術 Gate A 簽認移交

**對應成果與責任**：唯一負責 `SD-006-I06`；來源 `RB4-AC-012`、`RB4-BDD-049`、`051`、`RB4-T-337`；檔案 `F-03`；驗證 `V-006`。
**開始條件與前置證據**：`SD-006-S01`～`S05` 及 `SD-001`～`SD-005` 全部通過。
**必讀工作範圍**：`F-03`、`docs/alldonejobs/verification/SPEC-001-SceneEventFramework-Verification.md`（查核既有靜態化身真供應商證據範圍）。
**可寫檔案／符號及禁止改動**：不修改產品檔；執行 `F-03` 產出結構化 Gate A 核驗結果供 `SD-007` 寫入 `Verification.md`。
**產品改動與 BDD／畫面關聯**：純最終技術 Gate A 總核對（驗證 `RB4-T-337`）。
**具體行為與核心邏輯**：執行 `node tools/rain-bookshop-v4-gate-a-audit.mjs` 逐一核對：Unit(166/175 Gate A 前項)、Integration(53/57 Gate A 前項)、API(18/18)、Web E2E、Android E2E、80 素材解碼、16 經典與音樂／封面權利、必要真供應商靜態路徑證據與雙端效能數據全部齊備。
**允許自行決定的局部細節**：無。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-S06-1`／`RB4-T-337` Gate A 總證據核驗 | `SD-001`～`SD-006` 全部實際執行結果與權利／素材／效能證據 | `gateAReady === true`、`missingItems.length === 0`，輸出精確 V4 Scene SHA256 與 Narrative SHA256 | 缺任何一項真環境證據或真供應商必要證據不代簽 | `V-006`／`tools/rain-bookshop-v4-gate-a-audit.mjs` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／執行 Gate A 總稽核 | 執行 `F-03` 彙驗全部實際證據與精確 SHA | `C:\GitProjects\gamenenstyle\datinghigh` | `node tools/rain-bookshop-v4-gate-a-audit.mjs --strict` | 輸出 `gateAReady: true` 與精確版本 SHA | 待回填 |

**本步通過條件**：`RB4-T-337` 完整通過，本包 89/89 項 TDD 全數具備真實證據，且本包寫入完全停止。
**必須停止的情況與回報內容**：任何缺項保留 `Deferred`/`Incomplete` 並如實回報使用者，不得硬闖 Gate B 或清理步驟。
**可在本步修正的範圍**：無（缺項回原步驟補實測）。
**下一步與起始條件**：將完整 Gate A 證據與精確 V4 SHA 移交 [SD-007](SD-007-實玩GateB與Local清理結案交付.md) 寫入 `Verification.md` 並請使用者進行實玩 Gate B。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：唯讀稽核，可隨時重跑確認。

### 細步執行清冊（依 DEC-14 重建順序）

上方 S01～Sxx 區塊保留完整核心設計、具體 fixture、命令及群組整合關卡；有下列細步的群組先依表逐步完成產品行為，再執行原群組回歸/整合，**不重複實作或計數**。細步為獨立 S-ID、引用原唯一 I；所有必要細步與原群組驗收成立才可勾選該 I。跨包產品位置是唯讀依賴，真正寫入只依本包 F。未完全查明精確符號或分支的細步不得直接開工，須先完成全量設計稽核。

| 群組關卡 | 有序細步（先執行，後群組整合） | 唯一 I | 狀態 |
|---|---|---|---|
| SD-006-S01 | SD-006-S151 | SD-006-I01 | Planned |
| SD-006-S02 | SD-006-S250 → SD-006-S251 | SD-006-I02 | Planned |
| SD-006-S03 | SD-006-S301 → SD-006-S302 → SD-006-S303 → SD-006-S304 → SD-006-S305 → SD-006-S306 → SD-006-S307 → SD-006-S308 → SD-006-S309 → SD-006-S310 → SD-006-S311 → SD-006-S312 → SD-006-S313 → SD-006-S314 → SD-006-S315 → SD-006-S316 → SD-006-S317 → SD-006-S319 → SD-006-S320 | SD-006-I03 | Planned |
| SD-006-S04 | SD-006-S422 → SD-006-S423 → SD-006-S426 → SD-006-S427 → SD-006-S428 → SD-006-S429 → SD-006-S430 → SD-006-S431 → SD-006-S432 → SD-006-S434 → SD-006-S435 → SD-006-S436 → SD-006-S438 → SD-006-S440 → SD-006-S441 → SD-006-S442 → SD-006-S444 → SD-006-S445 → SD-006-S446 → SD-006-S448 → SD-006-S449 → SD-006-S450 | SD-006-I04 | Planned |
| SD-006-S05 | SD-006-S501 → SD-006-S502 → SD-006-S503 → SD-006-S504 → SD-006-S505 → SD-006-S506 → SD-006-S507 → SD-006-S508 → SD-006-S509 → SD-006-S510 → SD-006-S511 → SD-006-S512 → SD-006-S513 → SD-006-S514 → SD-006-S515 → SD-006-S516 → SD-006-S517 → SD-006-S519 → SD-006-S520 → SD-006-S522 → SD-006-S523 → SD-006-S526 → SD-006-S527 → SD-006-S528 → SD-006-S529 → SD-006-S530 → SD-006-S531 → SD-006-S532 → SD-006-S534 → SD-006-S535 → SD-006-S536 → SD-006-S538 → SD-006-S540 → SD-006-S541 → SD-006-S542 → SD-006-S544 → SD-006-S545 → SD-006-S546 → SD-006-S548 → SD-006-S549 → SD-006-S550 | SD-006-I05 | Planned |
| SD-006-S06 | SD-006-S651 | SD-006-I06 | Planned |

#### SD-006-S151：GateA

**唯一 I／原群組／F-V**：SD-006-I01／SD-006-S01／`F-03`、`F-07`／`V-001`。**來源**：RB4-BDD-051；RB4-T-291、RB4-T-292、RB4-T-293。

**可觀察成果與行為**：`RB4-BDD-051` GateA (`RB4-AC-012`；@happy-path @critical)；Given V4正式候選與真環境測試 / When 核對全部AC、兩題組、四結局及必要平台 / Then 真D1/R2/DO與HTTP/WS有精確證據 / And Web/Android及素材/內容/權限/效能逐項核對 / And 未驗或失敗不得以局部測試通過代簽 / And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-gate-a-audit.mjs` (`auditRainBookshopV4GateA`)、全系統 `SD-001`～`SD-005` 正式產物。跨平台總驗收關卡（涵蓋 Web 與 Android 全量 `@frontend` 實測證據核對、80 素材與 16 經典／音訊權利核對、真 D1/R2/DO 證據核對）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-291`：真D1/R2/DO與HTTP/WS有精確證據。；測試位置 `tools/tests/rain-bookshop-v4-gate-a.test.mjs`。
- `RB4-T-292`：Web/Android及素材/內容/權限/效能逐項核對。；測試位置 `tools/tests/rain-bookshop-v4-gate-a.test.mjs`。
- `RB4-T-293`：未驗或失敗不得以局部測試通過代簽。；測試位置 `tools/tests/rain-bookshop-v4-gate-a.test.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S01 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S250：PlatformPerformance

**唯一 I／原群組／F-V**：SD-006-I02／SD-006-S02／`F-01`、`F-02`、`F-04`／`V-002`。**來源**：RB4-BDD-050；RB4-T-288。

**可觀察成果與行為**：`RB4-BDD-050` PlatformPerformance (`RB4-AC-012`；@performance @critical @frontend)；Given 正式V4完整資產、Web與Android現有驗收裝置 / When 連續探索、翻書、倒數、背景與重連 / Then 記錄載入／操作延遲／記憶體／動畫對V3基線 / And 離開與失權清資源且有界快取 / And 無實測不得標Gate A通過 / And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-288`：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。；測試位置 `tests/integration/rain-bookshop-v4-live.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S251：GateA

**唯一 I／原群組／F-V**：SD-006-I02／SD-006-S02／`F-01`、`F-02`、`F-04`／`V-002`。**來源**：RB4-BDD-051；RB4-T-294。

**可觀察成果與行為**：`RB4-BDD-051` GateA (`RB4-AC-012`；@happy-path @critical)；Given V4正式候選與真環境測試 / When 核對全部AC、兩題組、四結局及必要平台 / Then 真D1/R2/DO與HTTP/WS有精確證據 / And Web/Android及素材/內容/權限/效能逐項核對 / And 未驗或失敗不得以局部測試通過代簽 / And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-gate-a-audit.mjs` (`auditRainBookshopV4GateA`)、全系統 `SD-001`～`SD-005` 正式產物。跨平台總驗收關卡（涵蓋 Web 與 Android 全量 `@frontend` 實測證據核對、80 素材與 16 經典／音訊權利核對、真 D1/R2/DO 證據核對）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-294`：真D1/R2/DO與HTTP/WS有精確證據；Web/Android及素材/內容/權限/效能逐項核對；未驗或失敗不得以局部測試通過代簽；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。；測試位置 `tests/integration/rain-bookshop-v4-live.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S301：EnterStore

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-001；RB4-T-004。

**可觀察成果與行為**：`RB4-BDD-001` EnterStore (`RB4-AC-001`；@happy-path @critical @frontend)；Given 兩位玩家各自釘選V4且尚未入店 / When I點門把且A點傘桶 / Then I與A分別到合法下一節點 / And 另一方未操作前其Track不變 / And 原場景融圖、門鈴與原文依角色呈現。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-004`：I與A分別到合法下一節點；另一方未操作前其Track不變；原場景融圖、門鈴與原文依角色呈現；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S302：NavigateAreas

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-002；RB4-T-009。

**可觀察成果與行為**：`RB4-BDD-002` NavigateAreas (`RB4-AC-001`；@happy-path @critical @frontend)；Given 本人可探索目前區域 / When 左右導航及小地圖選合法相鄰區 / Then 鏡位與Area依合法鄰接更新 / And 暖金點只示本人合法未探索或新事件 / And 不顯示平鋪移動按鈕海或漂浮星號。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-009`：鏡位與Area依合法鄰接更新；暖金點只示本人合法未探索或新事件；不顯示平鋪移動按鈕海或漂浮星號；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S303：DiscoverObjects

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-003；RB4-T-014。

**可觀察成果與行為**：`RB4-BDD-003` DiscoverObjects (`RB4-AC-001`；@boundary @critical @frontend)；Given 本場首次進區、其後再次進同區 / When 先觀看呼吸光再長按空白與放開 / Then 首次只提示一次 / And 長按只短暫顯示合法物件輪廓 / And 掃視、取消或重連不提交主線。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-014`：首次只提示一次；長按只短暫顯示合法物件輪廓；掃視、取消或重連不提交主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S304：GestureFence

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-004；RB4-T-019。

**可觀察成果與行為**：`RB4-BDD-004` GestureFence (`RB4-AC-001`；@error-handling @critical @frontend)；Given 鏡頭縮放、手勢衝突或請求pending / When 快速連點、滑動、拖出、取消或送舊revision / Then 一次合法意圖最多一次提交 / And 無效命中或取消不提交且物件復位 / And 409重新同步、未知結果只同ID查receipt。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-019`：一次合法意圖最多一次提交；無效命中或取消不提交且物件復位；409重新同步、未知結果只同ID查receipt；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S305：BookCatalog

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-005；RB4-T-024。

**可觀察成果與行為**：`RB4-BDD-005` BookCatalog (`RB4-AC-002`；@happy-path @critical @frontend)；Given 20本書正式目錄可用 / When 逐一在5區開書並翻至末頁 / Then 16經典和4盲書ID、區域、素材符合原稿 / And 全文、卡片、字條、書籤與共鳴原文逐書相等 / And 合法預覽合回原位且不推進。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-024`：16經典和4盲書ID、區域、素材符合原稿；全文、卡片、字條、書籤與共鳴原文逐書相等；合法預覽合回原位且不推進；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S306：BlindBook

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-006；RB4-T-030。

**可觀察成果與行為**：`RB4-BDD-006` BlindBook (`RB4-AC-002`；@happy-path @critical @frontend)；Given 4盲書尚未揭封 / When 滑動各封條、取消、成功揭封後重連 / Then 揭封前只有合法包裝三標籤 / And 有效揭封後才投影該書內容 / And 取消／重送不誤選、不揭另一方私密書 / And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-030`：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S307：InterestBadge

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-007；RB4-T-037。

**可觀察成果與行為**：`RB4-BDD-007` InterestBadge (`RB4-AC-002`；@error-handling @critical @frontend)；Given 雙方有不同未公開興趣 / When 以本人身份讀書架或竄改owner / Then 推薦貼紙只依本人已儲存興趣 / And raw DTO不含對方興趣或未揭封內容 / And 越權讀取拒絕且不快取私人資料。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-037`：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S308：Resonance

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-008；RB4-T-042。

**可觀察成果與行為**：`RB4-BDD-008` Resonance (`RB4-AC-002`；@happy-path @critical @frontend)；Given A選定草稿任一本書 / When 逐一選該書三項共鳴之一 / Then 只提交該書合法選項 / And 原文內心獨白對本人呈現 / And 他人看不到未分享共鳴且預覽不等於選擇。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-042`：只提交該書合法選項；原文內心獨白對本人呈現；他人看不到未分享共鳴且預覽不等於選擇；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S309：VinylSync

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-009；RB4-T-048。

**可觀察成果與行為**：`RB4-BDD-009` VinylSync (`RB4-AC-003`；@happy-path @critical @frontend)；Given 兩方均在本場且各自音效偏好不同 / When 合法切換3曲並重連 / Then 共享曲目以權威版本同步 / And 淡換及原文提示正確、不強制他方開聲音 / And 背景停止播放器、回前景不自動播放。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-048`：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S310：AmbientExplore

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-010；RB4-T-053。

**可觀察成果與行為**：`RB4-BDD-010` AmbientExplore (`RB4-AC-003`；@alternative-path @critical @frontend)；Given 玩家等待對方主線操作 / When 查看小黑板、5則留言及阿澄3話題 / Then 所有原文及合法區域可用 / And 小黑板布丁伏筆保留 / And 探索不阻塞對方、非必經主線。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-053`：所有原文及合法區域可用；小黑板布丁伏筆保留；探索不阻塞對方、非必經主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S311：FogWindow

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-011；RB4-T-058。

**可觀察成果與行為**：`RB4-BDD-011` FogWindow (`RB4-AC-003`；@happy-path @critical @frontend)；Given 窗區可見雨勢 / When 擦霧查看3階段雨勢並留下4種合法符號 / Then 擦霧純呈現不誤提交 / And 符號由明確操作建立共享版本 / And 離窗後／替換／轉場只依已確認生命週期投影。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-058`：擦霧純呈現不誤提交；符號由明確操作建立共享版本；離窗後／替換／轉場只依已確認生命週期投影；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S312：FogWitness

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-012；RB4-T-064。

**可觀察成果與行為**：`RB4-BDD-012` FogWitness (`RB4-AC-003`；@boundary @critical @frontend)；Given 窗區符號存在且對方尚未見證 / When 背景讀取、同作者見證、舊符號見證及對方實際呈現 / Then 前3種不計印章 / And 只接受對方在窗區對目前版本的合法見證 / And 成立事實保留到小票；替換／轉場／完成清可見符號 / And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-064`：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S313：SameDifferentBook

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-013；RB4-T-070。

**可觀察成果與行為**：`RB4-BDD-013` SameDifferentBook (`RB4-AC-004`；@happy-path @critical @frontend)；Given 兩人各自完成正式選書 / When 測同一本與不同一本兩路 / Then 以已提交ID比對 / And I走iv4-04-same或diff及原文 / And 他人未提交時不揭露、不代選。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-070`：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S314：TissueDistance

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-014；RB4-T-076。

**可觀察成果與行為**：`RB4-BDD-014` TissueDistance (`RB4-AC-004`；@happy-path @critical @frontend)；Given I可接近閱讀角 / When 拖面紙到近／遠合法位置後A各選收下／不用 / Then 距離與原文cue依實際手勢 / And A收不收面紙不等於是否聊天 / And 錯區或重送不提交額外行為。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-076`：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S315：GiveSpaceReverse

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-015；RB4-T-082。

**可觀察成果與行為**：`RB4-BDD-015` GiveSpaceReverse (`RB4-AC-004`；@alternative-path @critical @frontend)；Given I選扶書籤留白 / When A各選主動聊書／音樂／保持安靜 / Then I退開且A有獨立主動權 / And 聊書與音樂進各自原節點 / And A保持安靜走respect/quiet、無假聊天。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-082`：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S316：DeclineApproach

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-016；RB4-T-088。

**可觀察成果與行為**：`RB4-BDD-016` DeclineApproach (`RB4-AC-004`；@alternative-path @critical @frontend)；Given I選面紙或借書接近 / When A選open-up／books-only／decline / Then 依草稿對應route與原文 / And 拒絕不出現假聊天及不強制撮合 / And 安靜軌道仍能合法達導演。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-088`：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S317：QuestionCard

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-017；RB4-T-094。

**可觀察成果與行為**：`RB4-BDD-017` QuestionCard (`RB4-AC-005`；@happy-path @critical @frontend)；Given 雙方已進warm-track / When 依場次種子從4題釘選1題並各自回答 / Then 同場重連不重抽 / And 第一份答案只本人可見 / And 雙方提交後同時揭曉同頻／反差、到warm節點 / And HTTP／WS／事件回放不得泄漏未揭曉答案。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-094`：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S319：ChatSuggestions

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-019；RB4-T-105。

**可觀察成果與行為**：`RB4-BDD-019` ChatSuggestions (`RB4-AC-005`；@happy-path @critical @frontend)；Given 劇情依8個適用情境進展 / When 逐情境打開聊天、點一則或自由聊天 / Then 各情境3句原文及合法篩選 / And 未點不發送、點擊由真人送出 / And 聊天仍可用且不冒充NPC或對方。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-105`：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S320：ClerkPersona

**唯一 I／原群組／F-V**：SD-006-I03／SD-006-S03／`F-05`／`V-003`。**來源**：RB4-BDD-020；RB4-T-111。

**可觀察成果與行為**：`RB4-BDD-020` ClerkPersona (`RB4-AC-006`；@happy-path @critical @frontend)；Given I熟客與A避雨生客各自入店 / When 各試3種招呼及4組危機後致謝 / Then 角色分眾原文與表情正確 / And 阿澄赴入口防洪切電，不站原地觀望 / And S/A×warm/quiet原文匹配且不代發真人訊息。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-111`：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S422：StormPresentation

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-022；RB4-T-122。

**可觀察成果與行為**：`RB4-BDD-022` StormPresentation (`RB4-AC-007`；@happy-path @critical @frontend)；Given 伺服器已提交導演事件 / When 兩端接cue或斷線重連 / Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞 / And 原合法鏡位與權威世界一致 / And 重連還原當前狀態不重播舊cue或假提交。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-122`：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S423：ReadyGate

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-023；RB4-T-129。

**可觀察成果與行為**：`RB4-BDD-023` ReadyGate (`RB4-AC-008`；@happy-path @critical @frontend)；Given 救書ready且一方尚未接手電筒 / When 單方先ready後雙方並行ready / Then 單方等待不扣秒 / And 雙ready原子建立唯一deadline與題組 / And 雙端同一權威倒數並顯示原文等待提示。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-129`：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S426：RescueSteps

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-026；RB4-T-145。

**可觀察成果與行為**：`RB4-BDD-026` RescueSteps (`RB4-AC-008`；@happy-path @critical @frontend)；Given 任一原題組第1或第2步 / When A分享線索、I跨合法區抽書上滑、A收書裝袋上架 / Then 權威狀態依角色與步驟轉移 / And 只有合法完整上架計1本 / And 原文成功回饋、無危險入口操作。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-145`：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S427：ReverseClues

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-027；RB4-T-151。

**可觀察成果與行為**：`RB4-BDD-027` ReverseClues (`RB4-AC-008`；@happy-path @critical @frontend)；Given 已完成前兩本 / When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條 / Then 反轉線索只合法分享才揭露 / And 第3本下層、第4本完整鎖扣才增加計數 / And 兩組原文toast及合法結果完整 / And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-151`：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S428：WrongRescue

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-028；RB4-T-157。

**可觀察成果與行為**：`RB4-BDD-028` WrongRescue (`RB4-AC-008`；@error-handling @critical @frontend)；Given 救書進行中 / When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動 / Then 錯書／槽／扣原文回饋 / And 不增加rescuedCount、不接受不合法持物或轉移 / And UI復位，合法後續仍可完成 / And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-157`：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S429：QuickCallouts

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-029；RB4-T-163。

**可觀察成果與行為**：`RB4-BDD-029` QuickCallouts (`RB4-AC-008`；@happy-path @critical @frontend)；Given 救書中雙方各有6句快捷 / When 逐句點選並嘗試偽造他方ID / Then 只顯示本人合法原文 / And 明確點擊才發舞台泡泡 / And 不寫假真人聊天、不洩未分享答案。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-163`：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S430：WaterStages

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-030；RB4-T-169。

**可觀察成果與行為**：`RB4-BDD-030` WaterStages (`RB4-AC-008`；@boundary @critical @frontend)；Given 90秒倒數已running / When 權威時間跨75/50/30/15秒及延遲重連 / Then 各水位階段及原文播報正確 / And 過期cue不重播、畫面ceil秒數一致 / And client改時鐘不影響D1 deadline / And 各門檻來自釘選內容，發布時驗證數字文案一致。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-169`：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S431：PauseIdle

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-031；RB4-T-175。

**可觀察成果與行為**：`RB4-BDD-031` PauseIdle (`RB4-AC-008`；@boundary @critical @frontend)；Given running時一方合法操作停止 / When 測14999/15000ms閒置且仍有ping / Then 未達15秒不暫緩、達門檻暫緩 / And ping不更新有效活動 / And 保存剩餘時間且原稿暫緩提示正確 / And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-175`：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S432：PauseReconnect

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-032；RB4-T-182、RB4-T-324。

**可觀察成果與行為**：`RB4-BDD-032` PauseReconnect (`RB4-AC-008`；@alternative-path @critical @frontend)；Given 一方斷線15秒已暫緩 / When 雙方恢復可操作、重複斷線多次 / Then 自動恢復且不要求確認按鈕 / And 保存剩餘時間、無次數上限、不補扣暫緩秒 / And 重連／冷啟動不重設90秒 / And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與 / And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-182`：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。
- `RB4-T-324`：兩真人前景實際重入、多次閒置／斷線自動恢復、原操作不重複；兩平台獨立證據；首次恢復操作不計成果且兩平台分別留證，沒有重置時長或卡死。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`; `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S434：GradeS

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-034；RB4-T-193。

**可觀察成果與行為**：`RB4-BDD-034` GradeS (`RB4-AC-009`；@happy-path @critical @frontend)；Given 4本在期限內完成 / When 伺服器提交最後合法封箱 / Then 立即S不等歸零 / And 播放原文及布丁演出 / And 走書籤／最終意願而非屋簷。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-193`：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S435：GradeA

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-035；RB4-T-199。

**可觀察成果與行為**：`RB4-BDD-035` GradeA (`RB4-AC-009`；@boundary @critical @frontend)；Given 到期已救2或3本 / When DO喚醒或合法讀取補償 / Then A結算且停止救書 / And 原文退至高處、拿鐵及毛巾 / And 走書籤／最終意願。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-199`：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S436：GradeB

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-036；RB4-T-205。

**可觀察成果與行為**：`RB4-BDD-036` GradeB (`RB4-AC-009`；@boundary @critical @frontend)；Given 到期已救0或1本 / When 系統結算 / Then B直接ev4-04-eaves-shelter / And 停止救書且不可再進危險區或提交 / And 屋簷原文與專用鏡位，不走書籤或wish。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-205`：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S438：Bookmark

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-038；RB4-T-217。

**可觀察成果與行為**：`RB4-BDD-038` Bookmark (`RB4-AC-010`；@happy-path @critical @frontend)；Given S/A已結算 / When 逐書三句書籤選一，選填0/20字並各自提交 / Then 沿用草稿原句與本人短語 / And 未合法公開前對方看不到 / And 留書結局可原位翻對方已授權書籤 / And 未授權 note 不得由素材、歷史事件或通知取得。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-217`：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S440：WishMatrix

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-040；RB4-T-228。

**可觀察成果與行為**：`RB4-BDD-040` WishMatrix (`RB4-AC-010`；@happy-path @critical @frontend)；Given S/A兩方書籤已完成 / When 覆核3×3共9種最終意願組合 / Then 兩人keep-talking才ev4-01 / And 無quiet且至少一share-books才ev4-02 / And 任一quiet即ev4-03；第一份未揭露。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-228`：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S441：EndingArt

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-041；RB4-T-234。

**可觀察成果與行為**：`RB4-BDD-041` EndingArt (`RB4-AC-010`；@happy-path @critical @frontend)；Given 四種結局各已合法提交 / When 看場景光色、距離、原文、互動並重連 / Then 四結局各自正式鏡位與素材 / And S/A對應致謝與書籤，B專屬屋簷 / And 重連不退回結局前，不出現規格文字。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-234`：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S442：ReceiptTitle

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-042；RB4-T-240。

**可觀察成果與行為**：`RB4-BDD-042` ReceiptTitle (`RB4-AC-011`；@boundary @critical @frontend)；Given S/A/B權威完成 / When 以S剩29999／30000／30001ms及A/B測小票 / Then S_fast >=30000、其餘S_normal / And A/B稱號原文符合草稿 / And 書、黑膠、救援統計及阿澄附註只來自已提交事實 / And 稱號門檻隨釘選版本設定；小票不含自由輸入。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-240`：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S444：ReceiptBadges

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-044；RB4-T-251。

**可觀察成果與行為**：`RB4-BDD-044` ReceiptBadges (`RB4-AC-011`；@happy-path @critical @frontend)；Given 四印章各有獨立成立或不成立事實 / When 測同書／換曲／對方見符號／quiet+S/A / Then 各印章只對應原稿條件 / And 不成立不顯示、重送不重複 / And 小票無真實姓名、Email、照片、私密Profile或未授權內容 / And 印章依當前符號實際呈現見證而非背景讀取或自我見證。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-251`：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S445：NaturalCompletion

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-045；RB4-T-258。

**可觀察成果與行為**：`RB4-BDD-045` NaturalCompletion (`RB4-AC-011`；@happy-path @critical @frontend)；Given 本場已結局、Round仍active / When 自然完成後聊天、單方同意／撤回再雙方同意下一場 / Then 不額外要求完成按鈕或支線 / And 聊天仍可用；雙方同意才建新場 / And 新場釘選合法版本、舊投影與cue清除。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-258`：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S446：SafeExit

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-046；RB4-T-265。

**可觀察成果與行為**：`RB4-BDD-046` SafeExit (`RB4-AC-011`；@error-handling @critical @frontend)；Given ready/running/paused/settled/completed任一階段 / When 一方確認退出並與救書或alarm競態 / Then 退出不受倒數或素材故障阻塞 / And 解除占用、終止權限且pair排除 / And 無後續訊息／操作／私有圖或舊cue / And 退出與救書競態的敗方不再寫入。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-265`：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S448：AssetReadiness

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-048；RB4-T-277。

**可觀察成果與行為**：`RB4-BDD-048` AssetReadiness (`RB4-AC-012`；@error-handling @critical @frontend)；Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready / When 載入、恢復與點擊 / Then fail closed，不以placeholder冒充 / And 保留可用聊天/退出及重讀、現有錯誤碼 / And 恢復原版且不重抽、不呼叫Gemini / And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-277`：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S449：AvatarReuse

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-049；RB4-T-283。

**可觀察成果與行為**：`RB4-BDD-049` AvatarReuse (`RB4-AC-012`；@happy-path @critical @frontend)；Given 16免費角色及既有ready AI套組 / When 切換4姿態5表情、重連與失權 / Then 保持已核准身份／外觀、資產共用 / And 切換或重連不重產 / And 失權清圖；真provider證據與回放分開 / And 必要真 provider 質量及成本證據不可由回放代簽。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-283`：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S450：PlatformPerformance

**唯一 I／原群組／F-V**：SD-006-I04／SD-006-S04／`F-05`／`V-004`。**來源**：RB4-BDD-050；RB4-T-289。

**可觀察成果與行為**：`RB4-BDD-050` PlatformPerformance (`RB4-AC-012`；@performance @critical @frontend)；Given 正式V4完整資產、Web與Android現有驗收裝置 / When 連續探索、翻書、倒數、背景與重連 / Then 記錄載入／操作延遲／記憶體／動畫對V3基線 / And 離開與失權清資源且有界快取 / And 無實測不得標Gate A通過 / And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-289`：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S501：EnterStore

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-001；RB4-T-005。

**可觀察成果與行為**：`RB4-BDD-001` EnterStore (`RB4-AC-001`；@happy-path @critical @frontend)；Given 兩位玩家各自釘選V4且尚未入店 / When I點門把且A點傘桶 / Then I與A分別到合法下一節點 / And 另一方未操作前其Track不變 / And 原場景融圖、門鈴與原文依角色呈現。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-005`：I與A分別到合法下一節點；另一方未操作前其Track不變；原場景融圖、門鈴與原文依角色呈現；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S502：NavigateAreas

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-002；RB4-T-010。

**可觀察成果與行為**：`RB4-BDD-002` NavigateAreas (`RB4-AC-001`；@happy-path @critical @frontend)；Given 本人可探索目前區域 / When 左右導航及小地圖選合法相鄰區 / Then 鏡位與Area依合法鄰接更新 / And 暖金點只示本人合法未探索或新事件 / And 不顯示平鋪移動按鈕海或漂浮星號。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-010`：鏡位與Area依合法鄰接更新；暖金點只示本人合法未探索或新事件；不顯示平鋪移動按鈕海或漂浮星號；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S503：DiscoverObjects

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-003；RB4-T-015。

**可觀察成果與行為**：`RB4-BDD-003` DiscoverObjects (`RB4-AC-001`；@boundary @critical @frontend)；Given 本場首次進區、其後再次進同區 / When 先觀看呼吸光再長按空白與放開 / Then 首次只提示一次 / And 長按只短暫顯示合法物件輪廓 / And 掃視、取消或重連不提交主線。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-015`：首次只提示一次；長按只短暫顯示合法物件輪廓；掃視、取消或重連不提交主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S504：GestureFence

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-004；RB4-T-020。

**可觀察成果與行為**：`RB4-BDD-004` GestureFence (`RB4-AC-001`；@error-handling @critical @frontend)；Given 鏡頭縮放、手勢衝突或請求pending / When 快速連點、滑動、拖出、取消或送舊revision / Then 一次合法意圖最多一次提交 / And 無效命中或取消不提交且物件復位 / And 409重新同步、未知結果只同ID查receipt。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`), `Application/SceneEventStageProjection.cs` (`ProjectV3Stage`), `frontend/client/src/BookshopMinimapOverlay.tsx`, `EmbeddedSceneStage.tsx` (`useGestureFence`, `useAreaBreathingOnce`), `SceneEventActions.tsx`, `StoryExperienceScreen.tsx`。`StoryExperienceScreen` + `EmbeddedSceneStage` + `BookshopMinimapOverlay`：門把／傘桶點擊、左右邊緣導覽、可收合手繪小地圖（暖金微光點）、首次入區 1 次呼吸光、長按空白 380ms 輪廓、手勢衝突互斥與 pending 單次鎖（Web & Android 共用座標與 hitMask）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-020`：一次合法意圖最多一次提交；無效命中或取消不提交且物件復位；409重新同步、未知結果只同ID查receipt；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S505：BookCatalog

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-005；RB4-T-025。

**可觀察成果與行為**：`RB4-BDD-005` BookCatalog (`RB4-AC-002`；@happy-path @critical @frontend)；Given 20本書正式目錄可用 / When 逐一在5區開書並翻至末頁 / Then 16經典和4盲書ID、區域、素材符合原稿 / And 全文、卡片、字條、書籤與共鳴原文逐書相等 / And 合法預覽合回原位且不推進。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-025`：16經典和4盲書ID、區域、素材符合原稿；全文、卡片、字條、書籤與共鳴原文逐書相等；合法預覽合回原位且不推進；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S506：BlindBook

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-006；RB4-T-031。

**可觀察成果與行為**：`RB4-BDD-006` BlindBook (`RB4-AC-002`；@happy-path @critical @frontend)；Given 4盲書尚未揭封 / When 滑動各封條、取消、成功揭封後重連 / Then 揭封前只有合法包裝三標籤 / And 有效揭封後才投影該書內容 / And 取消／重送不誤選、不揭另一方私密書 / And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-031`：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S507：InterestBadge

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-007；RB4-T-038。

**可觀察成果與行為**：`RB4-BDD-007` InterestBadge (`RB4-AC-002`；@error-handling @critical @frontend)；Given 雙方有不同未公開興趣 / When 以本人身份讀書架或竄改owner / Then 推薦貼紙只依本人已儲存興趣 / And raw DTO不含對方興趣或未揭封內容 / And 越權讀取拒絕且不快取私人資料。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-038`：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S508：Resonance

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-008；RB4-T-043。

**可觀察成果與行為**：`RB4-BDD-008` Resonance (`RB4-AC-002`；@happy-path @critical @frontend)；Given A選定草稿任一本書 / When 逐一選該書三項共鳴之一 / Then 只提交該書合法選項 / And 原文內心獨白對本人呈現 / And 他人看不到未分享共鳴且預覽不等於選擇。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-policy.mjs` (`compileRainBookshopV4Bundle`), `Application/SceneBookProjection.cs` (`ProjectV3Books`), `cloudflare/src/scene-event-read.ts`, `frontend/client/src/ShelfCloseupDrawer.tsx`, `SceneWorldObjects.tsx`, `SceneBook.tsx`。`ShelfCloseupDrawer` + `SceneBook` + `SceneWorldObjects`：5 區 `prop-display-shadow-v4` 融圖、主書牆 `bg-shelves-closeup-v4` 橫滑特寫、盲書 `>=65%` 右滑撕封（未滿彈回）、推薦卡／3–4 頁／末頁字條／本人興趣貼紙／3 選 1 共鳴、合書零誤提交（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-043`：只提交該書合法選項；原文內心獨白對本人呈現；他人看不到未分享共鳴且預覽不等於選擇；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S509：VinylSync

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-009；RB4-T-049。

**可觀察成果與行為**：`RB4-BDD-009` VinylSync (`RB4-AC-003`；@happy-path @critical @frontend)；Given 兩方均在本場且各自音效偏好不同 / When 合法切換3曲並重連 / Then 共享曲目以權威版本同步 / And 淡換及原文提示正確、不強制他方開聲音 / And 背景停止播放器、回前景不自動播放。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-049`：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S510：AmbientExplore

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-010；RB4-T-054。

**可觀察成果與行為**：`RB4-BDD-010` AmbientExplore (`RB4-AC-003`；@alternative-path @critical @frontend)；Given 玩家等待對方主線操作 / When 查看小黑板、5則留言及阿澄3話題 / Then 所有原文及合法區域可用 / And 小黑板布丁伏筆保留 / And 探索不阻塞對方、非必經主線。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-054`：所有原文及合法區域可用；小黑板布丁伏筆保留；探索不阻塞對方、非必經主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S511：FogWindow

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-011；RB4-T-059。

**可觀察成果與行為**：`RB4-BDD-011` FogWindow (`RB4-AC-003`；@happy-path @critical @frontend)；Given 窗區可見雨勢 / When 擦霧查看3階段雨勢並留下4種合法符號 / Then 擦霧純呈現不誤提交 / And 符號由明確操作建立共享版本 / And 離窗後／替換／轉場只依已確認生命週期投影。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-059`：擦霧純呈現不誤提交；符號由明確操作建立共享版本；離窗後／替換／轉場只依已確認生命週期投影；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S512：FogWitness

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-012；RB4-T-065。

**可觀察成果與行為**：`RB4-BDD-012` FogWitness (`RB4-AC-003`；@boundary @critical @frontend)；Given 窗區符號存在且對方尚未見證 / When 背景讀取、同作者見證、舊符號見證及對方實際呈現 / Then 前3種不計印章 / And 只接受對方在窗區對目前版本的合法見證 / And 成立事實保留到小票；替換／轉場／完成清可見符號 / And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-065`：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S513：SameDifferentBook

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-013；RB4-T-071。

**可觀察成果與行為**：`RB4-BDD-013` SameDifferentBook (`RB4-AC-004`；@happy-path @critical @frontend)；Given 兩人各自完成正式選書 / When 測同一本與不同一本兩路 / Then 以已提交ID比對 / And I走iv4-04-same或diff及原文 / And 他人未提交時不揭露、不代選。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-071`：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S514：TissueDistance

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-014；RB4-T-077。

**可觀察成果與行為**：`RB4-BDD-014` TissueDistance (`RB4-AC-004`；@happy-path @critical @frontend)；Given I可接近閱讀角 / When 拖面紙到近／遠合法位置後A各選收下／不用 / Then 距離與原文cue依實際手勢 / And A收不收面紙不等於是否聊天 / And 錯區或重送不提交額外行為。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-077`：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S515：GiveSpaceReverse

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-015；RB4-T-083。

**可觀察成果與行為**：`RB4-BDD-015` GiveSpaceReverse (`RB4-AC-004`；@alternative-path @critical @frontend)；Given I選扶書籤留白 / When A各選主動聊書／音樂／保持安靜 / Then I退開且A有獨立主動權 / And 聊書與音樂進各自原節點 / And A保持安靜走respect/quiet、無假聊天。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-083`：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S516：DeclineApproach

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-016；RB4-T-089。

**可觀察成果與行為**：`RB4-BDD-016` DeclineApproach (`RB4-AC-004`；@alternative-path @critical @frontend)；Given I選面紙或借書接近 / When A選open-up／books-only／decline / Then 依草稿對應route與原文 / And 拒絕不出現假聊天及不強制撮合 / And 安靜軌道仍能合法達導演。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-089`：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S517：QuestionCard

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-017；RB4-T-095。

**可觀察成果與行為**：`RB4-BDD-017` QuestionCard (`RB4-AC-005`；@happy-path @critical @frontend)；Given 雙方已進warm-track / When 依場次種子從4題釘選1題並各自回答 / Then 同場重連不重抽 / And 第一份答案只本人可見 / And 雙方提交後同時揭曉同頻／反差、到warm節點 / And HTTP／WS／事件回放不得泄漏未揭曉答案。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-095`：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S519：ChatSuggestions

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-019；RB4-T-106。

**可觀察成果與行為**：`RB4-BDD-019` ChatSuggestions (`RB4-AC-005`；@happy-path @critical @frontend)；Given 劇情依8個適用情境進展 / When 逐情境打開聊天、點一則或自由聊天 / Then 各情境3句原文及合法篩選 / And 未點不發送、點擊由真人送出 / And 聊天仍可用且不冒充NPC或對方。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateIcebreakAndQuestionCard`, `SelectDynamicChatSuggestions`), `Domain/SceneEventTrackPolicy.cs` (`InterpolateBoundedTokens`), `Application/SceneEventFrameworkService.cs`, `frontend/client/src/EmbeddedSceneStage.tsx`, `AmbientInteractableModal.tsx`, `SceneEventActions.tsx`。`EmbeddedSceneStage` + `AmbientInteractableModal` + `SceneEventActions`：同／異書鏡位、面紙近／遠雙熱區拖放（出界彈回）、A 獨立收受面紙、扶書籤留白與 A 反向主動、婉拒零假聊天、提問卡蓋牌等待與同步翻牌、8×3 聊天建議點擊填草稿（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-106`：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S520：ClerkPersona

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-020；RB4-T-112。

**可觀察成果與行為**：`RB4-BDD-020` ClerkPersona (`RB4-AC-006`；@happy-path @critical @frontend)；Given I熟客與A避雨生客各自入店 / When 各試3種招呼及4組危機後致謝 / Then 角色分眾原文與表情正確 / And 阿澄赴入口防洪切電，不站原地觀望 / And S/A×warm/quiet原文匹配且不代發真人訊息。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluatePersonalAndAmbient`, `ResolveClerkAftermath`), `Application/SceneAudioProjection.cs` (`ProjectV3Audio`), `frontend/client/src/AmbientInteractableModal.tsx` (`useForegroundDoodleWitness`), `StoryAudio.tsx`。`AmbientInteractableModal` + `StoryAudio`：黑膠 3 曲轉盤淡換（背景停播不自動恢復、不強開對方聲音）、特調小黑板、5 則留言冊、阿澄 3 話題與分眾致謝、雨窗純本地擦霧看 3 階段街景＋點留 4 符號＋前景 `window` 實際渲染回報見證（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-112`：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S522：StormPresentation

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-022；RB4-T-123。

**可觀察成果與行為**：`RB4-BDD-022` StormPresentation (`RB4-AC-007`；@happy-path @critical @frontend)；Given 伺服器已提交導演事件 / When 兩端接cue或斷線重連 / Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞 / And 原合法鏡位與權威世界一致 / And 重連還原當前狀態不重播舊cue或假提交。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-123`：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S523：ReadyGate

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-023；RB4-T-130。

**可觀察成果與行為**：`RB4-BDD-023` ReadyGate (`RB4-AC-008`；@happy-path @critical @frontend)；Given 救書ready且一方尚未接手電筒 / When 單方先ready後雙方並行ready / Then 單方等待不扣秒 / And 雙ready原子建立唯一deadline與題組 / And 雙端同一權威倒數並顯示原文等待提示。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-130`：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S526：RescueSteps

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-026；RB4-T-146。

**可觀察成果與行為**：`RB4-BDD-026` RescueSteps (`RB4-AC-008`；@happy-path @critical @frontend)；Given 任一原題組第1或第2步 / When A分享線索、I跨合法區抽書上滑、A收書裝袋上架 / Then 權威狀態依角色與步驟轉移 / And 只有合法完整上架計1本 / And 原文成功回饋、無危險入口操作。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-146`：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S527：ReverseClues

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-027；RB4-T-152。

**可觀察成果與行為**：`RB4-BDD-027` ReverseClues (`RB4-AC-008`；@happy-path @critical @frontend)；Given 已完成前兩本 / When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條 / Then 反轉線索只合法分享才揭露 / And 第3本下層、第4本完整鎖扣才增加計數 / And 兩組原文toast及合法結果完整 / And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-152`：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S528：WrongRescue

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-028；RB4-T-158。

**可觀察成果與行為**：`RB4-BDD-028` WrongRescue (`RB4-AC-008`；@error-handling @critical @frontend)；Given 救書進行中 / When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動 / Then 錯書／槽／扣原文回饋 / And 不增加rescuedCount、不接受不合法持物或轉移 / And UI復位，合法後續仍可完成 / And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-158`：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S529：QuickCallouts

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-029；RB4-T-164。

**可觀察成果與行為**：`RB4-BDD-029` QuickCallouts (`RB4-AC-008`；@happy-path @critical @frontend)；Given 救書中雙方各有6句快捷 / When 逐句點選並嘗試偽造他方ID / Then 只顯示本人合法原文 / And 明確點擊才發舞台泡泡 / And 不寫假真人聊天、不洩未分享答案。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-164`：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S530：WaterStages

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-030；RB4-T-170。

**可觀察成果與行為**：`RB4-BDD-030` WaterStages (`RB4-AC-008`；@boundary @critical @frontend)；Given 90秒倒數已running / When 權威時間跨75/50/30/15秒及延遲重連 / Then 各水位階段及原文播報正確 / And 過期cue不重播、畫面ceil秒數一致 / And client改時鐘不影響D1 deadline / And 各門檻來自釘選內容，發布時驗證數字文案一致。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-170`：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S531：PauseIdle

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-031；RB4-T-176。

**可觀察成果與行為**：`RB4-BDD-031` PauseIdle (`RB4-AC-008`；@boundary @critical @frontend)；Given running時一方合法操作停止 / When 測14999/15000ms閒置且仍有ping / Then 未達15秒不暫緩、達門檻暫緩 / And ping不更新有效活動 / And 保存剩餘時間且原稿暫緩提示正確 / And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-176`：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S532：PauseReconnect

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-032；RB4-T-183、RB4-T-324。

**可觀察成果與行為**：`RB4-BDD-032` PauseReconnect (`RB4-AC-008`；@alternative-path @critical @frontend)；Given 一方斷線15秒已暫緩 / When 雙方恢復可操作、重複斷線多次 / Then 自動恢復且不要求確認按鈕 / And 保存剩餘時間、無次數上限、不補扣暫緩秒 / And 重連／冷啟動不重設90秒 / And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與 / And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-183`：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。
- `RB4-T-324`：兩真人前景實際重入、多次閒置／斷線自動恢復、原操作不重複；兩平台獨立證據；首次恢復操作不計成果且兩平台分別留證，沒有重置時長或卡死。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`; `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S534：GradeS

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-034；RB4-T-194。

**可觀察成果與行為**：`RB4-BDD-034` GradeS (`RB4-AC-009`；@happy-path @critical @frontend)；Given 4本在期限內完成 / When 伺服器提交最後合法封箱 / Then 立即S不等歸零 / And 播放原文及布丁演出 / And 走書籤／最終意願而非屋簷。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-194`：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S535：GradeA

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-035；RB4-T-200。

**可觀察成果與行為**：`RB4-BDD-035` GradeA (`RB4-AC-009`；@boundary @critical @frontend)；Given 到期已救2或3本 / When DO喚醒或合法讀取補償 / Then A結算且停止救書 / And 原文退至高處、拿鐵及毛巾 / And 走書籤／最終意願。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-200`：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S536：GradeB

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-036；RB4-T-206。

**可觀察成果與行為**：`RB4-BDD-036` GradeB (`RB4-AC-009`；@boundary @critical @frontend)；Given 到期已救0或1本 / When 系統結算 / Then B直接ev4-04-eaves-shelter / And 停止救書且不可再進危險區或提交 / And 屋簷原文與專用鏡位，不走書籤或wish。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-206`：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S538：Bookmark

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-038；RB4-T-218。

**可觀察成果與行為**：`RB4-BDD-038` Bookmark (`RB4-AC-010`；@happy-path @critical @frontend)；Given S/A已結算 / When 逐書三句書籤選一，選填0/20字並各自提交 / Then 沿用草稿原句與本人短語 / And 未合法公開前對方看不到 / And 留書結局可原位翻對方已授權書籤 / And 未授權 note 不得由素材、歷史事件或通知取得。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-218`：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S540：WishMatrix

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-040；RB4-T-229。

**可觀察成果與行為**：`RB4-BDD-040` WishMatrix (`RB4-AC-010`；@happy-path @critical @frontend)；Given S/A兩方書籤已完成 / When 覆核3×3共9種最終意願組合 / Then 兩人keep-talking才ev4-01 / And 無quiet且至少一share-books才ev4-02 / And 任一quiet即ev4-03；第一份未揭露。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-229`：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S541：EndingArt

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-041；RB4-T-235。

**可觀察成果與行為**：`RB4-BDD-041` EndingArt (`RB4-AC-010`；@happy-path @critical @frontend)；Given 四種結局各已合法提交 / When 看場景光色、距離、原文、互動並重連 / Then 四結局各自正式鏡位與素材 / And S/A對應致謝與書籤，B專屬屋簷 / And 重連不退回結局前，不出現規格文字。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-235`：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S542：ReceiptTitle

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-042；RB4-T-241。

**可觀察成果與行為**：`RB4-BDD-042` ReceiptTitle (`RB4-AC-011`；@boundary @critical @frontend)；Given S/A/B權威完成 / When 以S剩29999／30000／30001ms及A/B測小票 / Then S_fast >=30000、其餘S_normal / And A/B稱號原文符合草稿 / And 書、黑膠、救援統計及阿澄附註只來自已提交事實 / And 稱號門檻隨釘選版本設定；小票不含自由輸入。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-241`：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S544：ReceiptBadges

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-044；RB4-T-252。

**可觀察成果與行為**：`RB4-BDD-044` ReceiptBadges (`RB4-AC-011`；@happy-path @critical @frontend)；Given 四印章各有獨立成立或不成立事實 / When 測同書／換曲／對方見符號／quiet+S/A / Then 各印章只對應原稿條件 / And 不成立不顯示、重送不重複 / And 小票無真實姓名、Email、照片、私密Profile或未授權內容 / And 印章依當前符號實際呈現見證而非背景讀取或自我見證。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-252`：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S545：NaturalCompletion

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-045；RB4-T-259。

**可觀察成果與行為**：`RB4-BDD-045` NaturalCompletion (`RB4-AC-011`；@happy-path @critical @frontend)；Given 本場已結局、Round仍active / When 自然完成後聊天、單方同意／撤回再雙方同意下一場 / Then 不額外要求完成按鈕或支線 / And 聊天仍可用；雙方同意才建新場 / And 新場釘選合法版本、舊投影與cue清除。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-259`：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S546：SafeExit

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-046；RB4-T-266。

**可觀察成果與行為**：`RB4-BDD-046` SafeExit (`RB4-AC-011`；@error-handling @critical @frontend)；Given ready/running/paused/settled/completed任一階段 / When 一方確認退出並與救書或alarm競態 / Then 退出不受倒數或素材故障阻塞 / And 解除占用、終止權限且pair排除 / And 無後續訊息／操作／私有圖或舊cue / And 退出與救書競態的敗方不再寫入。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-266`：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S548：AssetReadiness

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-048；RB4-T-278。

**可觀察成果與行為**：`RB4-BDD-048` AssetReadiness (`RB4-AC-012`；@error-handling @critical @frontend)；Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready / When 載入、恢復與點擊 / Then fail closed，不以placeholder冒充 / And 保留可用聊天/退出及重讀、現有錯誤碼 / And 恢復原版且不重抽、不呼叫Gemini / And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-278`：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S549：AvatarReuse

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-049；RB4-T-284。

**可觀察成果與行為**：`RB4-BDD-049` AvatarReuse (`RB4-AC-012`；@happy-path @critical @frontend)；Given 16免費角色及既有ready AI套組 / When 切換4姿態5表情、重連與失權 / Then 保持已核准身份／外觀、資產共用 / And 切換或重連不重產 / And 失權清圖；真provider證據與回放分開 / And 必要真 provider 質量及成本證據不可由回放代簽。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-284`：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S550：PlatformPerformance

**唯一 I／原群組／F-V**：SD-006-I05／SD-006-S05／`F-01`、`F-06`／`V-005`。**來源**：RB4-BDD-050；RB4-T-290。

**可觀察成果與行為**：`RB4-BDD-050` PlatformPerformance (`RB4-AC-012`；@performance @critical @frontend)；Given 正式V4完整資產、Web與Android現有驗收裝置 / When 連續探索、翻書、倒數、背景與重連 / Then 記錄載入／操作延遲／記憶體／動畫對V3基線 / And 離開與失權清資源且有界快取 / And 無實測不得標Gate A通過 / And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-290`：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；兩真人正式畫面及權威狀態相符，無fixture代簽。。；測試位置 `tests/e2e/android/scene-event-v4.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S05 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-006-S651：GateA

**唯一 I／原群組／F-V**：SD-006-I06／SD-006-S06／`F-03`、`F-05`、`F-06`／`V-006`。**來源**：RB4-BDD-051；RB4-T-337。

**可觀察成果與行為**：`RB4-BDD-051` GateA (`RB4-AC-012`；@happy-path @critical)；Given V4正式候選與真環境測試 / When 核對全部AC、兩題組、四結局及必要平台 / Then 真D1/R2/DO與HTTP/WS有精確證據 / And Web/Android及素材/內容/權限/效能逐項核對 / And 未驗或失敗不得以局部測試通過代簽 / And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽。

**產品檔案、核心邏輯與 UX**：`tools/rain-bookshop-v4-gate-a-audit.mjs` (`auditRainBookshopV4GateA`)、全系統 `SD-001`～`SD-005` 正式產物。跨平台總驗收關卡（涵蓋 Web 與 Android 全量 `@frontend` 實測證據核對、80 素材與 16 經典／音訊權利核對、真 D1/R2/DO 證據核對）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；依群組指定平台 runner、獨立 session；每個案例實際從畫面操作，對照權威狀態。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-337`：真Web/Android正式素材、可重跑路徑、必要供應商品質/成本、逐書與音樂權利核對均有證據；缺項不代簽；Web與Android獨立證據、逐資產與權利核對、效能與品質俱全才可Gate A；缺項不代簽。；測試位置 `tests/e2e/web/scene-event-v4.spec.ts`; `tests/e2e/android/scene-event-v4.mjs`; `tools/rain-bookshop-v4-gate-a-audit.mjs`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-006-S06 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。


## 測試計劃與實際驗證方式

| 驗證 ID／來源 Todo／步驟 ID | 層級／行為／平台 | 環境與前置資料／案例 ID | 工作目錄與實際命令或畫面操作 | 預期結果／斷言 | 實作／測試位置 | 實際結果、時間、log／畫面證據 | 驗收狀態／等價依據或恢復條件 |
|---|---|---|---|---|---|---|---|
| `V-001`／`SD-006-I01`／`S01` | Unit／Gate A 自動檢核規則／Node | `RB4-T-291`～`293` | `C:\GitProjects\gamenenstyle\datinghigh`<br>`node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs` | 缺任一平台／權利／效能必阻斷 | `F-03`／`F-07` | 待回填 | `Incomplete` |
| `V-002`／`SD-006-I02`／`S02` | Integration／基礎回歸與真本地 Live 整合／Local 8787 | 真 `.NET` Host + Workerd／`RB4-T-288`、`294` | `C:\GitProjects\gamenenstyle\datinghigh`<br>`npm run check:foundation && npm run test:live && node tests/integration/rain-bookshop-v4-live.mjs` | 全部退出碼 `0`，零基礎回歸 | `F-01`、`F-02`、`F-04` | 待回填 | `Incomplete` |
| `V-003`／`SD-006-I03`／`S03` | E2E／正式 Web 前半 19 場景／Playwright Web | 正式 `export:web` 雙視窗／19 項前半 Web E2E | `C:\GitProjects\gamenenstyle\datinghigh`<br>`node tools/test-scene-web.mjs --suite v4-act1-act2` | 19/19 通過，禁錄影／trace | `SD-004`/`005` 產品元件／`F-05` | 待回填 | `Incomplete` |
| `V-004`／`SD-006-I04`／`S04` | E2E／正式 Web 後半 22 場景＋重複閒置＋效能／Playwright Web | 同上／22 項後半 Web E2E＋`RB4-T-324`(Web) | `C:\GitProjects\gamenenstyle\datinghigh`<br>`node tools/test-scene-web.mjs --suite v4-gate-a` | 全數通過並產出對 V3 效能基線紀錄 | `SD-004`/`005` 產品元件／`F-05` | 待回填 | `Incomplete` |
| `V-005`／`SD-006-I05`／`S05` | E2E／Android 全 41 場景＋背景停播＋重複閒置＋記憶體／Android ADB | 真機或模擬器 APK／41 項 Android E2E＋`RB4-T-290`＋`RB4-T-324`(Android) | `C:\GitProjects\gamenenstyle\datinghigh`<br>`pwsh -File tools/test-android.ps1 -Suite v4-gate-a` | 全數獨立通過，XML 僅記憶體處理；缺裝置記 `Deferred` | `F-01`、`SD-004`/`005`／`F-06` | 待回填 | `Incomplete` |
| `V-006`／`SD-006-I06`／`S06` | Gate A Audit／80 素材＋16 經典權利＋雙端證據總核對／All | `RB4-T-337` | `C:\GitProjects\gamenenstyle\datinghigh`<br>`node tools/rain-bookshop-v4-gate-a-audit.mjs --strict` | `gateAReady: true`，輸出精確 V4 SHA | `F-03` | 待回填 | `Incomplete` |

## 依賴關係與執行順序

| 任務／交付物 | 唯一執行／整合／驗收責任 | 前置／契約版本／開始條件 | 可寫範圍及排除 | 共享環境／隔離／互斥 | 安全並行或循序理由 | 完成及回傳條件 |
|---|---|---|---|---|---|---|
| `SD-006` 跨系統整合、雙端 E2E 與技術 Gate A | `SD-006` 執行者／移交 `SD-007` | `SD-001`～`SD-005` 全部完成並停止寫入 | 僅限本包 `F-01`～`F-07` | 獨佔本地 `8787` 平台與 Android ADB，各子步驟嚴格單一序列執行 | 整合驗收必須在全系統產物齊備且環境無並行干擾下執行 | 回傳 `F-01`～`F-07`、89/89 項 TDD 實測證據、效能對照數據與精確 V4 SHA |

## 風險、設計變更與人工確認紀錄

| ID／原設計版本 | 發現證據與為何不能照案實作 | 白話實務情境／功能影響 | 建議／替代與影響 SD／BDD／TDD | 負責者／觸發／成本時程 | 使用者決策／核准範圍／新版本 | 失效證據／重驗與恢復條件 |
|---|---|---|---|---|---|---|
| `RA-11`、`RA-12`／`v0.2.0-draft` | `tools/test-android.ps1` 存在目錄搬移前路徑引用；Android 裝置或真供應商憑證於執行當下可能未掛載 | 若直接重跑舊腳本會失敗；若以 Web 代簽 Android 違反工作區鐵律 | `S02` 先修 `test-android.ps1` 路徑；缺外部裝置／憑證時嚴格保持 `Deferred` 並通知使用者 | `SD-006` 執行者／`S02`、`S05`、`S06` | 上游 `RA-Q4=A` 已確認；等待本 SD 包 `v0.2.0-draft` 核准 | 外部環境恢復後重跑 `S05`/`S06` 才可解除 `Deferred` |

## 實現檢查清單／Todo

### D：設計葉節點

- [ ] **SD-006-D01** 完成 `tools/test-android.ps1` 路徑引用修復、序列 `8787` 互斥控制與真本地 Live 整合驗證設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-012`、`RA-11`、`AGENTS.md`／`SD-006`／依賴 `SD-005-D04`
  - 完成條件／設計證據：已明定於 `C06-2`、`F-01`、`F-02`、`F-04` 及步驟 `S02`
- [ ] **SD-006-D02** 完成正式 Web 雙真人視角全部 42 個 `@frontend` 場景（含重複閒置恢復與 `CleanReplay` 預置）及效能基線 E2E 設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-001`～`012`、`014`、42 個 `@frontend` BDD／`SD-006`／依賴 `SD-006-D01`
  - 完成條件／設計證據：已明定於 `F-05` 及步驟 `S03`、`S04`
- [ ] **SD-006-D03** 完成 Android 真機／模擬器全部 42 個 `@frontend` 場景、背景停播、記憶體內 XML 解析與效能基線 E2E 設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-001`～`012`、`014`、`RA-11`／`SD-006`／依賴 `SD-006-D01`
  - 完成條件／設計證據：已明定於 `F-06` 及步驟 `S05`
- [ ] **SD-006-D04** 完成 Gate A 全項證據、80 素材、16 經典與音樂權利及靜態化身供應商證據自動守門設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-012`、`RA-11`、`RA-12`、`RB4-BDD-049`、`051`／`SD-006`／依賴 `SD-006-D02`、`D03`
  - 完成條件／設計證據：已明定於 `C06-1`、`F-03`、`F-07` 及步驟 `S01`、`S06`

### I：實作驗證葉節點

- [ ] **SD-006-I01** 實作並驗證 Gate A 證據與權利完整性自動檢核器（3 項 Unit：`RB4-T-291`～`293`）
  - 類型／唯一分組：I／Unit（Gate A 證據與權利完整性自動檢核器）
  - 來源／責任／依賴：`RB4-BDD-051`、`RB4-T-291`～`293`／`SD-006` 執行者／依賴 `SD-001`～`SD-005`
  - 全部必要步驟／指定整合驗證：`SD-006-S01`；並須完成 SD-006-S151
  - 驗收條件／驗證 ID：`V-001` 3 項單元測試全通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I02** 修復 Web／Android Runner 並通過 `check:foundation`、`test:live` 與 V4 真本地 Live 整合（2 項 Integration：`RB4-T-288`、`294`）
  - 類型／唯一分組：I／Integration（真本地 Live Bridge、雙版本發布與基線回歸）
  - 來源／責任／依賴：`RB4-BDD-050`、`051`、`RB4-T-288`、`294`／`SD-006` 執行者／依賴 `SD-006-I01`
  - 全部必要步驟／指定整合驗證：`SD-006-S02`；並須完成 SD-006-S250、SD-006-S251
  - 驗收條件／驗證 ID：`V-002` 全部命令退出碼 `0`
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I03** 實作並通過正式 Web 前半 19 個探索與雙向破冰場景真畫面 E2E（19 項 Web E2E）
  - 類型／唯一分組：I／E2E — Web（正式 Web 雙真人視角 41 場景＋重複閒置恢復＋效能實測）
  - 來源／責任／依賴：見 `S03` 19 項 Web E2E／`SD-006` 執行者／依賴 `SD-006-I02`
  - 全部必要步驟／指定整合驗證：`SD-006-S03`；並須完成 SD-006-S301、SD-006-S302、SD-006-S303、SD-006-S304、SD-006-S305、SD-006-S306、SD-006-S307、SD-006-S308、SD-006-S309、SD-006-S310、SD-006-S311、SD-006-S312、SD-006-S313、SD-006-S314、SD-006-S315、SD-006-S316、SD-006-S317、SD-006-S319、SD-006-S320
  - 驗收條件／驗證 ID：`V-003` 19/19 項真實雙視窗通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I04** 實作並通過正式 Web 後半 22 個救書、重複閒置恢復、四結局、小票與效能基線 E2E（22 項 Web E2E＋`RB4-T-324` Web 段）
  - 類型／唯一分組：I／E2E — Web（正式 Web 雙真人視角 41 場景＋重複閒置恢復＋效能實測）
  - 來源／責任／依賴：見 `S04` 後半 Web E2E／`SD-006` 執行者／依賴 `SD-006-I03`
  - 全部必要步驟／指定整合驗證：`SD-006-S04`；並須完成 SD-006-S422、SD-006-S423、SD-006-S426、SD-006-S427、SD-006-S428、SD-006-S429、SD-006-S430、SD-006-S431、SD-006-S432、SD-006-S434、SD-006-S435、SD-006-S436、SD-006-S438、SD-006-S440、SD-006-S441、SD-006-S442、SD-006-S444、SD-006-S445、SD-006-S446、SD-006-S448、SD-006-S449、SD-006-S450
  - 驗收條件／驗證 ID：`V-004` 全數通過並具備效能對照數據
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I05** 實作並通過 Android 真機／模擬器全 41 場景、背景停播、重複閒置恢復與記憶體基線 E2E（41 項 Android E2E＋`RB4-T-290`＋`RB4-T-324` Android 段）
  - 類型／唯一分組：I／E2E — Android + Gate A（Android 真機／模擬器 41 場景＋重複閒置恢復＋效能＋Gate A 總驗）
  - 來源／責任／依賴：見 `S05` 全部 Android E2E／`SD-006` 執行者／依賴 `SD-006-I04`
  - 全部必要步驟／指定整合驗證：`SD-006-S05`；並須完成 SD-006-S501、SD-006-S502、SD-006-S503、SD-006-S504、SD-006-S505、SD-006-S506、SD-006-S507、SD-006-S508、SD-006-S509、SD-006-S510、SD-006-S511、SD-006-S512、SD-006-S513、SD-006-S514、SD-006-S515、SD-006-S516、SD-006-S517、SD-006-S519、SD-006-S520、SD-006-S522、SD-006-S523、SD-006-S526、SD-006-S527、SD-006-S528、SD-006-S529、SD-006-S530、SD-006-S531、SD-006-S532、SD-006-S534、SD-006-S535、SD-006-S536、SD-006-S538、SD-006-S540、SD-006-S541、SD-006-S542、SD-006-S544、SD-006-S545、SD-006-S546、SD-006-S548、SD-006-S549、SD-006-S550
  - 驗收條件／驗證 ID：`V-005` 全數獨立通過（缺裝置時嚴格記 `Deferred` 不勾選）
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I06** 完成 80 素材／16 經典權利／靜態化身證據總核對並通過技術 Gate A（`RB4-T-337`）
  - 類型／唯一分組：I／E2E — Android + Gate A（Android 真機／模擬器 41 場景＋重複閒置恢復＋效能＋Gate A 總驗）
  - 來源／責任／依賴：`RB4-BDD-051`、`RB4-T-337`／`SD-006` 執行者／依賴 `SD-006-I01`～`I05`
  - 全部必要步驟／指定整合驗證：`SD-006-S06`；並須完成 SD-006-S651
  - 驗收條件／驗證 ID：`V-006` 輸出 `gateAReady: true` 與精確 V4 SHA
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`

## 檢查點與續作交接

**目前狀態**：Draft／Planned／Incomplete，所有 I 未開工。來源與候選保留；final 版本 `0.2.0-draft` 未核准。

**責任與共享資源**：以本文件 F 責任、系統設計、總覽的順序為準；無產品寫入、無資料副作用、無進行中的產品 runner。

**恢復條件**：完整設計稽核與使用者核准精確 final 版本後，核對來源與程式基準，依細步執行。發現設計漂移、權利不明、平台或 guard 不足即停止；保留已證實成果，僅重驗受影響範圍。

## 相關文檔

- [SD 總覽](../00-overview.md)
- [系統設計](../01-system-design.md)
- [追溯矩陣](../02-traceability.md)
- 前置與後續分項：[SD-001](SD-001-V4內容契約與作者草案編譯器.md)～[SD-005](SD-005-暴雨救書協作與四結局借閱小票前端UX.md) → **本包 SD-006** → [SD-007](SD-007-實玩GateB與Local清理結案交付.md)
- 工作流規範：[03-ai-workflow-stages](../../../../../overview/02-development-guidelines/03-ai-workflow-stages.md)

## 生成者、最後更新與狀態

ChatGPT GPT-6.2／2026-11-26／`0.2.0-draft`。基於兩候選及 DEC-01～14 的整合草案。產品未開發，禁止進 carefully-done。
