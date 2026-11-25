# SD-006-跨系統整合雙平台E2E與技術GateA驗收 — 分項實作設計

**功能／工作包 ID**：`SD-006-跨系統整合雙平台E2E與技術GateA驗收`  
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../../../requirements/MVP-001-LoveGameDatingApp.md)、[作者草案 JSON](../../../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)  
**文件包／AI／模型／批次**：`docs/sd/SPEC-001-RainBookshopV4/candidates/antigravity-model-unprovided/20261125-2312-01`／AI：`Antigravity`／模型：`未提供`／批次：`20261125-2312-01`  
**設計版本／契約版本／優先級**：`1.0.0`／`SD-contract-v2`／高（跨層真環境整合與技術 Gate A 守門人）  
**執行狀態／驗收狀態／最後更新**：`Planned`／`Incomplete`（設計階段已完成，產品尚未開發）／2026-11-25  
**執行／整合／驗收責任**：唯一執行與跨包技術 Gate A 驗收整合責任：`SD-006` 執行者；Gate B 人工簽認、Local 清理與最終權威文件回寫責任：[SD-007](SD-007-實玩GateB與Local清理結案交付.md)  
**來源與程式碼基準、核准設計快照**：見 [SD 總覽 — 來源、程式與設計基準](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

只計本文件「實現檢查清單／Todo」中的唯一葉節點；摘要、里程碑及引用不再計數。設計與實作驗證分開，設計完成不勾選產品完成。

| 指標 | 完成／總數 | 進度條與百分比 | 依據 |
|---|---|---|---|
| 設計完成度（D） | 4 / 4 | `[████████████████████] 100.0%` | 本包 `SD-006-D01`～`SD-006-D04` 已完成跨系統整合、Android 路徑修復、雙端 E2E 與 Gate A 稽核設計 |
| 本包 BDD 設計涵蓋率 | 43 / 43 | `[████████████████████] 100.0%` | 涵蓋全部 42 個 `@frontend` Scenario 之雙平台真畫面 E2E 腳本與 Gate A 驗收（`055` 腳本於本包備妥，清理後執行歸 `SD-007`）＋`RB4-BDD-051` GateA |
| 本包 TDD 設計涵蓋率 | 89 / 89 | `[████████████████████] 100.0%` | 本包唯一負責執行驗證之 89 項 TDD（Unit 3 + Live Integration 2 + Web/Android E2E 84）已全數映射 |
| 實作驗證完成度（I） | 0 / 6 | `[░░░░░░░░░░░░░░░░░░░░] 0.0%` | 本包 `SD-006-I01`～`SD-006-I06` 待 `SD-001`～`SD-005` 全部通過後於真實環境執行驗證 |

### 分層／分組進度追蹤

| 唯一分組／層 | D 完成／總數 | I 完成／總數 | 進行中／待開始 | 執行狀態 | 驗收狀態／證據 |
|---|---|---|---|---|---|
| 設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核） | 4 / 4 | 0 / 0 | 0 / 0 | `Accepted`（桌面設計稽核通過） | 設計完成，等待人工核准 |
| Unit（Gate A 證據與權利完整性自動檢核器） | 0 / 0 | 0 / 1 | 0 / 1 | `Planned` | `Incomplete`（待回填） |
| Integration（真本地 Live Bridge、雙版本發布與基線回歸） | 0 / 0 | 0 / 1 | 0 / 1 | `Planned` | `Incomplete`（待回填） |
| E2E — Web（正式 Web 雙真人視角 41 場景＋重複閒置恢復＋效能實測） | 0 / 0 | 0 / 2 | 0 / 2 | `Planned` | `Incomplete`（待回填） |
| E2E — Android + Gate A（Android 真機／模擬器 41 場景＋重複閒置恢復＋效能＋Gate A 總驗） | 0 / 0 | 0 / 2 | 0 / 2 | `Planned` | `Incomplete`（待回填；缺 Android 裝置環境時嚴格記 `Deferred` 不代簽） |

### 當前 Sprint 狀態

| 當前階段／Todo ID／步驟 ID | Red–Green–Refactor 子階段 | 負責者 | 開始／預計完成及依據 | 下一步 ID／最後更新 |
|---|---|---|---|---|
| 設計交付待審／無執行中 I／待 `SD-001`～`SD-005` 全數完成後啟動 `SD-006-S01` | 不適用（設計階段不開發） | Antigravity／待指派執行者 | 依賴 `SD-001`～`SD-005` 全部完成並通過各自單元／模組整合測試 | `SD-006-S01`／2026-11-25 |

### 里程碑

僅引用 Todo ID，不建立第二套可計數 checkbox。

| 里程碑 | 必要葉節點／前置 SD | 驗收與整合條件 | 狀態／證據 |
|---|---|---|---|
| M6-1：雙端 E2E 與 Gate A 設計就緒 | `SD-006-D01`～`SD-006-D04` | 修復 Android 路徑引用策略、雙端 84 項 E2E 與 Gate A 檢核清單定案 | 設計完成（待人工核准） |
| M6-2：Gate A 檢核器、Runner 修復與真 Live 整合通過 | `SD-006-I01`、`SD-006-I02`（前置 `SD-001`～`SD-005`） | `check:foundation`、`test:live` 與 V4 Live 整合在本地 `8787` 序列通過 | `Incomplete` |
| M6-3：Web 與 Android 雙端真畫面 E2E 及技術 Gate A 達標 | `SD-006-I03`～`SD-006-I06` | 89/89 項 TDD 全數取得真實證據（零 mock／零局部代簽），移交 `SD-007` 進入本人實玩 Gate B | `Incomplete` |

### 關鍵指標

| 指標 | 已確認目標與來源 | 當前值 | 實際驗證／證據或限制 |
|---|---|---|---|
| Web 與 Android `@frontend` 真畫面獨立通過數 | Web 41/41 + Android 41/41 + `RB4-T-324` + `RB4-T-337` = 84/84 E2E（Gate A 範圍） | 0 / 84（0%） | 本地 Web 證據絕不可外推替代 Android；UI 測試禁錄影／trace，原生 XML 只在記憶體處理 |
| 載入、操作延遲與記憶體基線對照 | 於現有 Web 與 Android 驗收環境實測對照 V3 基線，離開與失權清資源（`RB4-BDD-050`） | 尚未實測 | 無實測數據時 `Gate A` 強制維持未通過（`Incomplete`/`Deferred`） |

### 每日進度記錄

依工作區 `AGENTS.md` 規範，禁止維護每日／批次歷史進度流水帳；本表僅就地保留當前設計基準狀態。

| 日期 | 完成 Todo／有效證據 | 阻斷／剩餘 | 下一步／責任 |
|---|---|---|---|
| 2026-11-25 | 完成 `SD-006-D01`～`SD-006-D04` 設計與桌面稽核；實作 Todo `0/6` | 等待使用者核准本包 `v1.0.0` 及 `SD-001`～`SD-005` 完成 | 啟動 `SD-006-S01`／`SD-006` 執行者 |

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
| `C06-1`：`auditRainBookshopV4GateA`（`F-03`） | 輸入測試執行報告、80 素材與 16 經典權利清單、Web/Android 效能紀錄、靜態化身驗證紀錄；輸出 `{ gateAReady: boolean, missingItems: string[] }` | 逐項檢查：1. Unit/Integration/API 全綠；2. Web 41 場景＋`324`＋效能實測通過；3. Android 41 場景＋`324`＋效能實測通過（若缺裝置則明確列於 `missingItems` 且 `gateAReady = false`）；4. 80 素材解碼與 16 經典／音訊／封面權利核實無缺；5. 靜態化身重用與必要供應商證據齊備。 | 純唯讀檢核函式。 | 缺任何一項必回 `gateAReady: false`，嚴禁以部分測試通過代簽（`RB4-T-291`～`293`、`337`）。 |
| `C06-2`：`tools/test-android.ps1` 工作區路徑修正（`F-01`） | PowerShell 啟動參數與 ADB 裝置狀態 | 以 `$PSScriptRoot` 推導 `datinghigh/` 根目錄（修正搬移前殘留之舊相對路徑），檢查 `adb devices`、APK 與本地平台連線；若無可用 Android 裝置／模擬器，立即回傳非零退出碼與明確環境缺項說明（絕不假裝通過）。 | 單次序列執行。 | 解決 `AGENTS.md` 明載之 Android 重跑路徑限制。 |

### 契約、資料與平台

- 測試建立的所有驗收用配對帳號與 Round 均帶有明確可識別之本地驗收標記或記錄於本地驗收清單，方便 Gate B 後由 `SD-007` 依 `RQ-04` 具名完整清理。

### 共用與改動合理性

- 在本包 `F-05` 與 `F-06` 內一併建置好 `--grep CleanReplay`（對應 `RB4-T-308` Web 與 `RB4-T-309` Android）測試案例，讓 `SD-007` 在完成 Local 清理後可直接執行該選擇器驗收，保持 E2E 檔案由 `SD-006` 100% 唯一寫入。

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
**必須停止的情況與回報內容**：無。  
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
| `RA-11`、`RA-12`／`v1.0.0` | `tools/test-android.ps1` 存在目錄搬移前路徑引用；Android 裝置或真供應商憑證於執行當下可能未掛載 | 若直接重跑舊腳本會失敗；若以 Web 代簽 Android 違反工作區鐵律 | `S02` 先修 `test-android.ps1` 路徑；缺外部裝置／憑證時嚴格保持 `Deferred` 並通知使用者 | `SD-006` 執行者／`S02`、`S05`、`S06` | 上游 `RA-Q4=A` 已確認；等待本 SD 包 `v1.0.0` 核准 | 外部環境恢復後重跑 `S05`/`S06` 才可解除 `Deferred` |

## 實現檢查清單／Todo

### D：設計葉節點

- [x] **SD-006-D01** 完成 `tools/test-android.ps1` 路徑引用修復、序列 `8787` 互斥控制與真本地 Live 整合驗證設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-012`、`RA-11`、`AGENTS.md`／`SD-006`／依賴 `SD-005-D04`
  - 完成條件／設計證據：已明定於 `C06-2`、`F-01`、`F-02`、`F-04` 及步驟 `S02`
- [x] **SD-006-D02** 完成正式 Web 雙真人視角全部 42 個 `@frontend` 場景（含重複閒置恢復與 `CleanReplay` 預置）及效能基線 E2E 設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-001`～`012`、`014`、42 個 `@frontend` BDD／`SD-006`／依賴 `SD-006-D01`
  - 完成條件／設計證據：已明定於 `F-05` 及步驟 `S03`、`S04`
- [x] **SD-006-D03** 完成 Android 真機／模擬器全部 42 個 `@frontend` 場景、背景停播、記憶體內 XML 解析與效能基線 E2E 設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-001`～`012`、`014`、`RA-11`／`SD-006`／依賴 `SD-006-D01`
  - 完成條件／設計證據：已明定於 `F-06` 及步驟 `S05`
- [x] **SD-006-D04** 完成 Gate A 全項證據、80 素材、16 經典與音樂權利及靜態化身供應商證據自動守門設計
  - 類型／唯一分組：D／設計（Android 重跑修復、Live 整合、Web E2E、Android E2E、效能與 Gate A 檢核）
  - 來源／責任／依賴：`RB4-AC-012`、`RA-11`、`RA-12`、`RB4-BDD-049`、`051`／`SD-006`／依賴 `SD-006-D02`、`D03`
  - 完成條件／設計證據：已明定於 `C06-1`、`F-03`、`F-07` 及步驟 `S01`、`S06`

### I：實作驗證葉節點

- [ ] **SD-006-I01** 實作並驗證 Gate A 證據與權利完整性自動檢核器（3 項 Unit：`RB4-T-291`～`293`）
  - 類型／唯一分組：I／Unit（Gate A 證據與權利完整性自動檢核器）
  - 來源／責任／依賴：`RB4-BDD-051`、`RB4-T-291`～`293`／`SD-006` 執行者／依賴 `SD-001`～`SD-005`
  - 全部必要步驟／指定整合驗證：`SD-006-S01`
  - 驗收條件／驗證 ID：`V-001` 3 項單元測試全通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I02** 修復 Web／Android Runner 並通過 `check:foundation`、`test:live` 與 V4 真本地 Live 整合（2 項 Integration：`RB4-T-288`、`294`）
  - 類型／唯一分組：I／Integration（真本地 Live Bridge、雙版本發布與基線回歸）
  - 來源／責任／依賴：`RB4-BDD-050`、`051`、`RB4-T-288`、`294`／`SD-006` 執行者／依賴 `SD-006-I01`
  - 全部必要步驟／指定整合驗證：`SD-006-S02`
  - 驗收條件／驗證 ID：`V-002` 全部命令退出碼 `0`
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I03** 實作並通過正式 Web 前半 19 個探索與雙向破冰場景真畫面 E2E（19 項 Web E2E）
  - 類型／唯一分組：I／E2E — Web（正式 Web 雙真人視角 41 場景＋重複閒置恢復＋效能實測）
  - 來源／責任／依賴：見 `S03` 19 項 Web E2E／`SD-006` 執行者／依賴 `SD-006-I02`
  - 全部必要步驟／指定整合驗證：`SD-006-S03`
  - 驗收條件／驗證 ID：`V-003` 19/19 項真實雙視窗通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I04** 實作並通過正式 Web 後半 22 個救書、重複閒置恢復、四結局、小票與效能基線 E2E（22 項 Web E2E＋`RB4-T-324` Web 段）
  - 類型／唯一分組：I／E2E — Web（正式 Web 雙真人視角 41 場景＋重複閒置恢復＋效能實測）
  - 來源／責任／依賴：見 `S04` 後半 Web E2E／`SD-006` 執行者／依賴 `SD-006-I03`
  - 全部必要步驟／指定整合驗證：`SD-006-S04`
  - 驗收條件／驗證 ID：`V-004` 全數通過並具備效能對照數據
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I05** 實作並通過 Android 真機／模擬器全 41 場景、背景停播、重複閒置恢復與記憶體基線 E2E（41 項 Android E2E＋`RB4-T-290`＋`RB4-T-324` Android 段）
  - 類型／唯一分組：I／E2E — Android + Gate A（Android 真機／模擬器 41 場景＋重複閒置恢復＋效能＋Gate A 總驗）
  - 來源／責任／依賴：見 `S05` 全部 Android E2E／`SD-006` 執行者／依賴 `SD-006-I04`
  - 全部必要步驟／指定整合驗證：`SD-006-S05`
  - 驗收條件／驗證 ID：`V-005` 全數獨立通過（缺裝置時嚴格記 `Deferred` 不勾選）
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-006-I06** 完成 80 素材／16 經典權利／靜態化身證據總核對並通過技術 Gate A（`RB4-T-337`）
  - 類型／唯一分組：I／E2E — Android + Gate A（Android 真機／模擬器 41 場景＋重複閒置恢復＋效能＋Gate A 總驗）
  - 來源／責任／依賴：`RB4-BDD-051`、`RB4-T-337`／`SD-006` 執行者／依賴 `SD-006-I01`～`I05`
  - 全部必要步驟／指定整合驗證：`SD-006-S06`
  - 驗收條件／驗證 ID：`V-006` 輸出 `gateAReady: true` 與精確 V4 SHA
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`

## 檢查點與續作交接

| 日期／任務／執行者 | 已完成並驗收／證據 | 尚未驗收／停止原因 | 寫入責任與共享資源現況 | 所需決策／恢復條件與查核 | 續作對象、實際啟動結果／下一步 |
|---|---|---|---|---|---|
| 2026-11-25／`SD-006` 設計交付／Antigravity | `SD-006-D01`～`D04` 設計完成 | `SD-006-I01`～`I06` 未開始；等待核准及 `SD-001`～`SD-005` 完成 | 未寫入任何檔案；`F-01`～`F-07` 鎖定歸本包唯一寫入 | 核准 `v1.0.0` 且 `SD-001`～`SD-005` 全部通過後啟動 | 待 `carefully-done` 階段啟動 `SD-006-S01` |

**鎖定文件包／版本／核准依據**：`docs/sd/SPEC-001-RainBookshopV4/candidates/antigravity-model-unprovided/20261125-2312-01`／`1.0.0`／待使用者確認  
**目前 I-ID／步驟 ID／子階段／已發生副作用**：尚未進入實作（無副作用）  
**需重驗成果與不受影響成果**：無  
**關鍵依賴鏈／下個里程碑／用時與重試策略**：`SD-001`～`SD-005` → `SD-006`（M6-3 Gate A）→ `SD-007`（本人 Gate B 與清理）  
**責任移交前停止寫入的證據**：不適用

## 相關文檔

- [SD 總覽](../00-overview.md)
- [系統設計](../01-system-design.md)
- [追溯矩陣](../02-traceability.md)
- 前置與後續分項：[SD-001](SD-001-V4內容契約與作者草案編譯器.md)～[SD-005](SD-005-暴雨救書協作與四結局借閱小票前端UX.md) → **本包 SD-006** → [SD-007](SD-007-實玩GateB與Local清理結案交付.md)
- 工作流規範：[03-ai-workflow-stages](../../../../../../../overview/02-development-guidelines/03-ai-workflow-stages.md)

## 生成者、最後更新與狀態

**生成者／AI／模型／批次**：Antigravity／模型：未提供／`20261125-2312-01`  
**最後更新／設計版本**：2026-11-25／`1.0.0`  
**執行狀態／驗收狀態／剩餘事項**：`Planned`／`Incomplete`／等待人工核准及 `SD-001`～`SD-005` 完成後執行 `SD-006-S01`～`SD-006-S06`
