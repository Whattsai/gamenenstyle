# SD-006-跨系統整合雙平台E2E與技術GateA驗收 — 分項實作設計

**功能／工作包 ID**：`SD-006-跨系統整合雙平台E2E與技術GateA驗收`
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[V4 作者原稿 JSON](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)
**文件包／AI／模型／批次**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`／AI：`Antigravity`／模型：`Gemini 4 Carbon (High)`／批次：`final`
**設計版本／契約版本／優先級**：`1.0.0`／`SD-contract-v2`／高（P1）
**執行狀態／驗收狀態／最後更新**：`Planned`（已核准可開工，未開發）／`Incomplete`（待實測驗收）／2026-11-26
**執行／整合／驗收責任**：SD-006 跨系統與雙平台驗收執行者／通過 Gate A（前段 321 項 TDD）後移交 SD-007 進入使用者本人實玩 Gate B
**來源與程式碼基準、核准設計快照**：見 [SD 總覽（../00-overview.md）](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

只計本文件「實現檢查清單／Todo」中的唯一葉節點；摘要、里程碑及引用不再計數。設計與實作驗證分開，設計完成不勾選產品完成。

| 指標 | 完成／總數 | 進度條與百分比 | 依據 |
|---|---|---|---|
| 設計完成度（D） | 4 / 4 | `[████████████████████] 100.0%` | 本包 `SD-006-D01`～`D04` 已完成完整設計、通過桌面稽核並獲使用者明確核准 |
| 本包 BDD 設計涵蓋率 | 41 / 41 | `[████████████████████] 100.0%` | 本包涉及之全部唯一 BDD Scenario 均已完整分解至產品符號與步驟（跨包完整性見 [追溯矩陣](../02-traceability.md)） |
| 本包 TDD 設計涵蓋率 | 86 / 86 | `[████████████████████] 100.0%` | 本包主責驗證之 86 項唯一 TDD 已 100% 映射至具體步驟、測試檔與命令 |
| 實作驗證完成度（I） | 0 / 6 | `[░░░░░░░░░░░░░░░░░░░░] 0.0%` | 本包 `SD-006-I01`～`I06` 尚未開發，已處於 `Ready for carefully-done` 待開工實測 |

### 分層／分組進度追蹤

| 唯一分組／層 | D 完成／總數 | I 完成／總數 | 進行中／待開始 | 執行狀態 | 驗收狀態／證據 |
|---|---|---|---|---|---|
| 設計葉節點（D） | 4 / 4 | 0 / 0 | 0 / 0 | `Accepted` | 桌面設計稽核通過，使用者已明確核准 `final` `1.0.0`（`Ready for carefully-done`） |
| 實作與驗證葉節點（I；主責 TDD：Unit 0／Integration 4／API 0／E2E 82） | 0 / 0 | 0 / 6 | 0 / 6 | `Planned` | `Incomplete`；證據待回填至 `Verification.md` |

### 當前 Sprint 狀態

| 當前階段／Todo ID／步驟 ID | Red–Green–Refactor 子階段 | 負責者 | 開始／預計完成及依據 | 下一步 ID／最後更新 |
|---|---|---|---|---|
| 設計已核准可開工（`Ready for carefully-done`）／尚未啟動 `SD-006-I01`（`SD-006-S01`） | 不適用（尚未啟動產品開發） | SD-006 執行者 | 待啟動 `/carefully-done` 且滿足首步前置後執行（無硬性預設期限） | 啟動 `/carefully-done` 且前置滿足後執行 `SD-006-S01`／2026-11-26 |

### 里程碑

僅引用 Todo ID，不建立第二套可計數 checkbox。

| 里程碑 | 必要葉節點／前置 SD | 驗收與整合條件 | 狀態／證據 |
|---|---|---|---|
| `SD-006-M0`：分項設計與步驟稽核就緒並獲核准 | `SD-006-D01`～`D04` | 檔案路徑 100% 對齊真實 repo、單一寫入無衝突、每步具案例與命令並獲使用者核准 | 已完成並獲核准（`Ready for carefully-done`） |
| `SD-006-M1`：本包全部實作與驗證葉節點達成 | `SD-006-I01`～`I06`（依賴前置見步驟表） | 本包全部 `SD-006-V01`～`SD-006-V06` 實測通過且既有回歸全綠 | `Incomplete` |
| `SD-006-M2`：跨包 Gate A／Gate B 與最終深度稽核結案 | 配合 `SD-006` 與 `SD-007-I01`～`I05` | 全案 337/337 TDD 驗證完成、本人 Gate B 通過並同步 `Verification.md` | `Incomplete` |

### 關鍵指標

| 指標 | 已確認目標與來源 | 當前值 | 實際驗證／證據或限制 |
|---|---|---|---|
| 本包主責 TDD 設計涵蓋與實測通過數 | 設計涵蓋 86/86；實測通過目標 86/86（`SPEC`／`TDD`） | 設計涵蓋 `100.0%`；實測 `0 / 86` | 尚未執行程式修改或測試代簽 |
| 架構與資料邊界遵守度 | 21 表、0 新欄、0 Trigger、0 新公開 API、原稿逐 scalar 不變、單一檔案寫入責任 | 設計 `100%` 符合 | 見下方「檔案改動設計」與 [02-traceability.md](../02-traceability.md) |

### 每日進度記錄

依專案 `AGENTS.md` 基本規範，禁止記錄每日／批次歷史進度流水帳；此處僅就地保留當前有效狀態。

| 日期 | 完成 Todo／有效證據 | 阻斷／剩餘 | 下一步／責任 |
|---|---|---|---|
| 2026-11-26 | 完成 `SD-006` 分項設計 `1.0.0`（`D`: 4/4，涵蓋 8 個檔案項目與 6 個有序步驟）並獲使用者明確核准轉為 `Ready for carefully-done` | 實作 `I`: 0/6；無設計阻斷（尚未開始開發） | 由 `/carefully-done` 滿足前置後依序執行 `SD-006-S01` |

## 功能概述

負責修復 `tools/test-android.ps1` 搬移前路徑限制並擴充 V4 雙端測試入口，完成真本地 Worker + `.NET 10` + D1 + R2 + DO 跨系統 Live 整合測試，於隔離驗證同一精確 V4 bundle SHA 通過時切換 `contracts/scene-event-content.json` 首場索引（保留 V3 檔案與已釘選場次可讀至 Gate B），依序執行正式 Web（Playwright）與真實 Android（ADB 實機／模擬器）雙真人獨立 Session 全場景 E2E、重複閒置／斷線自動恢復（`RB4-T-324` 雙端獨立證據）、80 素材解碼／遮罩／尺寸、靜態四姿態化身零重產及記憶體與延遲基線量測，最終透過 `tools/rain-bookshop-v4-gate-a-audit.mjs` 完成技術 **Gate A 前段 321 項唯一 TDD** 總檢核（絕不代簽本人 Gate B `RB4-T-295` 或後段 15 項清理案例）。

## 功能需求與來源追溯

| MVP／SPEC 項目 | BDD Scenario | TDD 測試項 | 系統設計 ID／本包 Todo／步驟 ID | 驗收條件 | 跨包共同成果與整合責任 |
|---|---|---|---|---|---|
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-001` EnterStore | `RB4-T-004`、`RB4-T-005` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then I與A分別到合法下一節點；And 另一方未操作前其Track不變；And 原場景融圖、門鈴與原文依角色呈現 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-002` NavigateAreas | `RB4-T-009`、`RB4-T-010` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 鏡位與Area依合法鄰接更新；And 暖金點只示本人合法未探索或新事件；And 不顯示平鋪移動按鈕海或漂浮星號 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-003` DiscoverObjects | `RB4-T-014`、`RB4-T-015` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 首次只提示一次；And 長按只短暫顯示合法物件輪廓；And 掃視、取消或重連不提交主線 | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-004` GestureFence | `RB4-T-019`、`RB4-T-020` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 一次合法意圖最多一次提交；And 無效命中或取消不提交且物件復位；And 409重新同步、未知結果只同ID查receipt | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-005` BookCatalog | `RB4-T-024`、`RB4-T-025` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 16經典和4盲書ID、區域、素材符合原稿；And 全文、卡片、字條、書籤與共鳴原文逐書相等；And 合法預覽合回原位且不推進 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-006` BlindBook | `RB4-T-030`、`RB4-T-031` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 揭封前只有合法包裝三標籤；And 有效揭封後才投影該書內容；And 取消／重送不誤選、不揭另一方私密書；And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-007` InterestBadge | `RB4-T-037`、`RB4-T-038` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 推薦貼紙只依本人已儲存興趣；And raw DTO不含對方興趣或未揭封內容；And 越權讀取拒絕且不快取私人資料 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-008` Resonance | `RB4-T-042`、`RB4-T-043` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 只提交該書合法選項；And 原文內心獨白對本人呈現；And 他人看不到未分享共鳴且預覽不等於選擇 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-009` VinylSync | `RB4-T-048`、`RB4-T-049` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 共享曲目以權威版本同步；And 淡換及原文提示正確、不強制他方開聲音；And 背景停止播放器、回前景不自動播放 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-010` AmbientExplore | `RB4-T-053`、`RB4-T-054` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 所有原文及合法區域可用；And 小黑板布丁伏筆保留；And 探索不阻塞對方、非必經主線 | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-011` FogWindow | `RB4-T-058`、`RB4-T-059` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 擦霧純呈現不誤提交；And 符號由明確操作建立共享版本；And 離窗後／替換／轉場只依已確認生命週期投影 | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-012` FogWitness | `RB4-T-064`、`RB4-T-065` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 前3種不計印章；And 只接受對方在窗區對目前版本的合法見證；And 成立事實保留到小票；替換／轉場／完成清可見符號；And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-013` SameDifferentBook | `RB4-T-070`、`RB4-T-071` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 以已提交ID比對；And I走iv4-04-same或diff及原文；And 他人未提交時不揭露、不代選 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-014` TissueDistance | `RB4-T-076`、`RB4-T-077` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 距離與原文cue依實際手勢；And A收不收面紙不等於是否聊天；And 錯區或重送不提交額外行為 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-015` GiveSpaceReverse | `RB4-T-082`、`RB4-T-083` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then I退開且A有獨立主動權；And 聊書與音樂進各自原節點；And A保持安靜走respect/quiet、無假聊天 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-016` DeclineApproach | `RB4-T-088`、`RB4-T-089` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 依草稿對應route與原文；And 拒絕不出現假聊天及不強制撮合；And 安靜軌道仍能合法達導演 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-005` | `RB4-BDD-017` QuestionCard | `RB4-T-094`、`RB4-T-095` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 同場重連不重抽；And 第一份答案只本人可見；And 雙方提交後同時揭曉同頻／反差、到warm節點；And HTTP／WS／事件回放不得泄漏未揭曉答案 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-005` | `RB4-BDD-019` ChatSuggestions | `RB4-T-105`、`RB4-T-106` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 各情境3句原文及合法篩選；And 未點不發送、點擊由真人送出；And 聊天仍可用且不冒充NPC或對方 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-006` | `RB4-BDD-020` ClerkPersona | `RB4-T-111`、`RB4-T-112` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 角色分眾原文與表情正確；And 阿澄赴入口防洪切電，不站原地觀望；And S/A×warm/quiet原文匹配且不代發真人訊息 | 跨包共同成果：SD-002 + SD-003 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-007` | `RB4-BDD-022` StormPresentation | `RB4-T-122`、`RB4-T-123` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；And 原合法鏡位與權威世界一致；And 重連還原當前狀態不重播舊cue或假提交 | 跨包共同成果：SD-002 + SD-003 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-026` RescueSteps | `RB4-T-145`、`RB4-T-146` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 權威狀態依角色與步驟轉移；And 只有合法完整上架計1本；And 原文成功回饋、無危險入口操作 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-027` ReverseClues | `RB4-T-151`、`RB4-T-152` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 反轉線索只合法分享才揭露；And 第3本下層、第4本完整鎖扣才增加計數；And 兩組原文toast及合法結果完整；And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-028` WrongRescue | `RB4-T-157`、`RB4-T-158` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 錯書／槽／扣原文回饋；And 不增加rescuedCount、不接受不合法持物或轉移；And UI復位，合法後續仍可完成；And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-029` QuickCallouts | `RB4-T-163`、`RB4-T-164` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 只顯示本人合法原文；And 明確點擊才發舞台泡泡；And 不寫假真人聊天、不洩未分享答案 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-030` WaterStages | `RB4-T-169`、`RB4-T-170` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 各水位階段及原文播報正確；And 過期cue不重播、畫面ceil秒數一致；And client改時鐘不影響D1 deadline；And 各門檻來自釘選內容，發布時驗證數字文案一致 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-031` PauseIdle | `RB4-T-175`、`RB4-T-176` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 未達15秒不暫緩、達門檻暫緩；And ping不更新有效活動；And 保存剩餘時間且原稿暫緩提示正確；And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-032` PauseReconnect | `RB4-T-182`、`RB4-T-183`、`RB4-T-324` | SYS-009／SD-006-I03,SD-006-I04,SD-006-I05／SD-006-S03,SD-006-S04,SD-006-S05 | Then 自動恢復且不要求確認按鈕；And 保存剩餘時間、無次數上限、不補扣暫緩秒；And 重連／冷啟動不重設90秒；And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與；And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-034` GradeS | `RB4-T-193`、`RB4-T-194` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 立即S不等歸零；And 播放原文及布丁演出；And 走書籤／最終意願而非屋簷 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-035` GradeA | `RB4-T-199`、`RB4-T-200` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then A結算且停止救書；And 原文退至高處、拿鐵及毛巾；And 走書籤／最終意願 | 跨包共同成果：SD-002 + SD-003 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-036` GradeB | `RB4-T-205`、`RB4-T-206` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then B直接ev4-04-eaves-shelter；And 停止救書且不可再進危險區或提交；And 屋簷原文與專用鏡位，不走書籤或wish | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-038` Bookmark | `RB4-T-217`、`RB4-T-218` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 沿用草稿原句與本人短語；And 未合法公開前對方看不到；And 留書結局可原位翻對方已授權書籤；And 未授權 note 不得由素材、歷史事件或通知取得 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-040` WishMatrix | `RB4-T-228`、`RB4-T-229` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 兩人keep-talking才ev4-01；And 無quiet且至少一share-books才ev4-02；And 任一quiet即ev4-03；第一份未揭露 | 跨包共同成果：SD-002 + SD-003 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-041` EndingArt | `RB4-T-234`、`RB4-T-235` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 四結局各自正式鏡位與素材；And S/A對應致謝與書籤，B專屬屋簷；And 重連不退回結局前，不出現規格文字 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-042` ReceiptTitle | `RB4-T-240`、`RB4-T-241` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then S_fast >=30000、其餘S_normal；And A/B稱號原文符合草稿；And 書、黑膠、救援統計及阿澄附註只來自已提交事實；And 稱號門檻隨釘選版本設定；小票不含自由輸入 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-044` ReceiptBadges | `RB4-T-251`、`RB4-T-252` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 各印章只對應原稿條件；And 不成立不顯示、重送不重複；And 小票無真實姓名、Email、照片、私密Profile或未授權內容；And 印章依當前符號實際呈現見證而非背景讀取或自我見證 | 跨包共同成果：SD-002 + SD-003 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-045` NaturalCompletion | `RB4-T-258`、`RB4-T-259` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 不額外要求完成按鈕或支線；And 聊天仍可用；雙方同意才建新場；And 新場釘選合法版本、舊投影與cue清除 | 跨包共同成果：SD-002 + SD-003 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-046` SafeExit | `RB4-T-265`、`RB4-T-266` | SYS-009／SD-006-I03,SD-006-I04／SD-006-S03,SD-006-S04 | Then 退出不受倒數或素材故障阻塞；And 解除占用、終止權限且pair排除；And 無後續訊息／操作／私有圖或舊cue；And 退出與救書競態的敗方不再寫入 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-048` AssetReadiness | `RB4-T-275`、`RB4-T-277`、`RB4-T-278` | SYS-009／SD-006-I02,SD-006-I05／SD-006-S02,SD-006-S05 | Then fail closed，不以placeholder冒充；And 保留可用聊天/退出及重讀、現有錯誤碼；And 恢復原版且不重抽、不呼叫Gemini；And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材 | 跨包共同成果：SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-049` AvatarReuse | `RB4-T-282`、`RB4-T-283`、`RB4-T-284` | SYS-009／SD-006-I02,SD-006-I05／SD-006-S02,SD-006-S05 | Then 保持已核准身份／外觀、資產共用；And 切換或重連不重產；And 失權清圖；真provider證據與回放分開；And 必要真 provider 質量及成本證據不可由回放代簽 | 跨包共同成果：SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-050` PlatformPerformance | `RB4-T-288`、`RB4-T-289`、`RB4-T-290` | SYS-009／SD-006-I02,SD-006-I05／SD-006-S02,SD-006-S05 | Then 記錄載入／操作延遲／記憶體／動畫對V3基線；And 離開與失權清資源且有界快取；And 無實測不得標Gate A通過；And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證 | 跨包共同成果：SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-051` GateA | `RB4-T-294`、`RB4-T-337` | SYS-009／SD-006-I02,SD-006-I06／SD-006-S02,SD-006-S06 | Then 真D1/R2/DO與HTTP/WS有精確證據；And Web/Android及素材/內容/權限/效能逐項核對；And 未驗或失敗不得以局部測試通過代簽；And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽 | 跨包共同成果：SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |

### BDD 行為與產品實作分解

| BDD Scenario／條件或 Examples | 角色／Given | When／操作 | Then／And／But 各結果與副作用 | 實際產品 F-ID／符號／核心分支 | 必要 S／I／V／跨包成果 |
|---|---|---|---|---|---|
| `RB4-BDD-001` EnterStore（@happy-path @critical @frontend） | Given 兩位玩家各自釘選V4且尚未入店 | When I點門把且A點傘桶 | Then I與A分別到合法下一節點；And 另一方未操作前其Track不變；And 原場景融圖、門鈴與原文依角色呈現 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-002` NavigateAreas（@happy-path @critical @frontend） | Given 本人可探索目前區域 | When 左右導航及小地圖選合法相鄰區 | Then 鏡位與Area依合法鄰接更新；And 暖金點只示本人合法未探索或新事件；And 不顯示平鋪移動按鈕海或漂浮星號 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-003` DiscoverObjects（@boundary @critical @frontend） | Given 本場首次進區、其後再次進同區 | When 先觀看呼吸光再長按空白與放開 | Then 首次只提示一次；And 長按只短暫顯示合法物件輪廓；And 掃視、取消或重連不提交主線 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-004` GestureFence（@error-handling @critical @frontend） | Given 鏡頭縮放、手勢衝突或請求pending | When 快速連點、滑動、拖出、取消或送舊revision | Then 一次合法意圖最多一次提交；And 無效命中或取消不提交且物件復位；And 409重新同步、未知結果只同ID查receipt | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-005` BookCatalog（@happy-path @critical @frontend） | Given 20本書正式目錄可用 | When 逐一在5區開書並翻至末頁 | Then 16經典和4盲書ID、區域、素材符合原稿；And 全文、卡片、字條、書籤與共鳴原文逐書相等；And 合法預覽合回原位且不推進 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-006` BlindBook（@happy-path @critical @frontend） | Given 4盲書尚未揭封 | When 滑動各封條、取消、成功揭封後重連 | Then 揭封前只有合法包裝三標籤；And 有效揭封後才投影該書內容；And 取消／重送不誤選、不揭另一方私密書；And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-007` InterestBadge（@error-handling @critical @frontend） | Given 雙方有不同未公開興趣 | When 以本人身份讀書架或竄改owner | Then 推薦貼紙只依本人已儲存興趣；And raw DTO不含對方興趣或未揭封內容；And 越權讀取拒絕且不快取私人資料 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-008` Resonance（@happy-path @critical @frontend） | Given A選定草稿任一本書 | When 逐一選該書三項共鳴之一 | Then 只提交該書合法選項；And 原文內心獨白對本人呈現；And 他人看不到未分享共鳴且預覽不等於選擇 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-009` VinylSync（@happy-path @critical @frontend） | Given 兩方均在本場且各自音效偏好不同 | When 合法切換3曲並重連 | Then 共享曲目以權威版本同步；And 淡換及原文提示正確、不強制他方開聲音；And 背景停止播放器、回前景不自動播放 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-010` AmbientExplore（@alternative-path @critical @frontend） | Given 玩家等待對方主線操作 | When 查看小黑板、5則留言及阿澄3話題 | Then 所有原文及合法區域可用；And 小黑板布丁伏筆保留；And 探索不阻塞對方、非必經主線 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-011` FogWindow（@happy-path @critical @frontend） | Given 窗區可見雨勢 | When 擦霧查看3階段雨勢並留下4種合法符號 | Then 擦霧純呈現不誤提交；And 符號由明確操作建立共享版本；And 離窗後／替換／轉場只依已確認生命週期投影 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-012` FogWitness（@boundary @critical @frontend） | Given 窗區符號存在且對方尚未見證 | When 背景讀取、同作者見證、舊符號見證及對方實際呈現 | Then 前3種不計印章；And 只接受對方在窗區對目前版本的合法見證；And 成立事實保留到小票；替換／轉場／完成清可見符號；And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-013` SameDifferentBook（@happy-path @critical @frontend） | Given 兩人各自完成正式選書 | When 測同一本與不同一本兩路 | Then 以已提交ID比對；And I走iv4-04-same或diff及原文；And 他人未提交時不揭露、不代選 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-014` TissueDistance（@happy-path @critical @frontend） | Given I可接近閱讀角 | When 拖面紙到近／遠合法位置後A各選收下／不用 | Then 距離與原文cue依實際手勢；And A收不收面紙不等於是否聊天；And 錯區或重送不提交額外行為 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-015` GiveSpaceReverse（@alternative-path @critical @frontend） | Given I選扶書籤留白 | When A各選主動聊書／音樂／保持安靜 | Then I退開且A有獨立主動權；And 聊書與音樂進各自原節點；And A保持安靜走respect/quiet、無假聊天 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-016` DeclineApproach（@alternative-path @critical @frontend） | Given I選面紙或借書接近 | When A選open-up／books-only／decline | Then 依草稿對應route與原文；And 拒絕不出現假聊天及不強制撮合；And 安靜軌道仍能合法達導演 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-017` QuestionCard（@happy-path @critical @frontend） | Given 雙方已進warm-track | When 依場次種子從4題釘選1題並各自回答 | Then 同場重連不重抽；And 第一份答案只本人可見；And 雙方提交後同時揭曉同頻／反差、到warm節點；And HTTP／WS／事件回放不得泄漏未揭曉答案 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-019` ChatSuggestions（@happy-path @critical @frontend） | Given 劇情依8個適用情境進展 | When 逐情境打開聊天、點一則或自由聊天 | Then 各情境3句原文及合法篩選；And 未點不發送、點擊由真人送出；And 聊天仍可用且不冒充NPC或對方 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-020` ClerkPersona（@happy-path @critical @frontend） | Given I熟客與A避雨生客各自入店 | When 各試3種招呼及4組危機後致謝 | Then 角色分眾原文與表情正確；And 阿澄赴入口防洪切電，不站原地觀望；And S/A×warm/quiet原文匹配且不代發真人訊息 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-022` StormPresentation（@happy-path @critical @frontend） | Given 伺服器已提交導演事件 | When 兩端接cue或斷線重連 | Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；And 原合法鏡位與權威世界一致；And 重連還原當前狀態不重播舊cue或假提交 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-026` RescueSteps（@happy-path @critical @frontend） | Given 任一原題組第1或第2步 | When A分享線索、I跨合法區抽書上滑、A收書裝袋上架 | Then 權威狀態依角色與步驟轉移；And 只有合法完整上架計1本；And 原文成功回饋、無危險入口操作 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-027` ReverseClues（@happy-path @critical @frontend） | Given 已完成前兩本 | When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條 | Then 反轉線索只合法分享才揭露；And 第3本下層、第4本完整鎖扣才增加計數；And 兩組原文toast及合法結果完整；And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-028` WrongRescue（@error-handling @critical @frontend） | Given 救書進行中 | When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動 | Then 錯書／槽／扣原文回饋；And 不增加rescuedCount、不接受不合法持物或轉移；And UI復位，合法後續仍可完成；And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-029` QuickCallouts（@happy-path @critical @frontend） | Given 救書中雙方各有6句快捷 | When 逐句點選並嘗試偽造他方ID | Then 只顯示本人合法原文；And 明確點擊才發舞台泡泡；And 不寫假真人聊天、不洩未分享答案 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-030` WaterStages（@boundary @critical @frontend） | Given 90秒倒數已running | When 權威時間跨75/50/30/15秒及延遲重連 | Then 各水位階段及原文播報正確；And 過期cue不重播、畫面ceil秒數一致；And client改時鐘不影響D1 deadline；And 各門檻來自釘選內容，發布時驗證數字文案一致 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-031` PauseIdle（@boundary @critical @frontend） | Given running時一方合法操作停止 | When 測14999/15000ms閒置且仍有ping | Then 未達15秒不暫緩、達門檻暫緩；And ping不更新有效活動；And 保存剩餘時間且原稿暫緩提示正確；And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-032` PauseReconnect（@alternative-path @critical @frontend） | Given 一方斷線15秒已暫緩 | When 雙方恢復可操作、重複斷線多次 | Then 自動恢復且不要求確認按鈕；And 保存剩餘時間、無次數上限、不補扣暫緩秒；And 重連／冷啟動不重設90秒；And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與；And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-034` GradeS（@happy-path @critical @frontend） | Given 4本在期限內完成 | When 伺服器提交最後合法封箱 | Then 立即S不等歸零；And 播放原文及布丁演出；And 走書籤／最終意願而非屋簷 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-035` GradeA（@boundary @critical @frontend） | Given 到期已救2或3本 | When DO喚醒或合法讀取補償 | Then A結算且停止救書；And 原文退至高處、拿鐵及毛巾；And 走書籤／最終意願 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-036` GradeB（@boundary @critical @frontend） | Given 到期已救0或1本 | When 系統結算 | Then B直接ev4-04-eaves-shelter；And 停止救書且不可再進危險區或提交；And 屋簷原文與專用鏡位，不走書籤或wish | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-038` Bookmark（@happy-path @critical @frontend） | Given S/A已結算 | When 逐書三句書籤選一，選填0/20字並各自提交 | Then 沿用草稿原句與本人短語；And 未合法公開前對方看不到；And 留書結局可原位翻對方已授權書籤；And 未授權 note 不得由素材、歷史事件或通知取得 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-040` WishMatrix（@happy-path @critical @frontend） | Given S/A兩方書籤已完成 | When 覆核3×3共9種最終意願組合 | Then 兩人keep-talking才ev4-01；And 無quiet且至少一share-books才ev4-02；And 任一quiet即ev4-03；第一份未揭露 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-041` EndingArt（@happy-path @critical @frontend） | Given 四種結局各已合法提交 | When 看場景光色、距離、原文、互動並重連 | Then 四結局各自正式鏡位與素材；And S/A對應致謝與書籤，B專屬屋簷；And 重連不退回結局前，不出現規格文字 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-042` ReceiptTitle（@boundary @critical @frontend） | Given S/A/B權威完成 | When 以S剩29999／30000／30001ms及A/B測小票 | Then S_fast >=30000、其餘S_normal；And A/B稱號原文符合草稿；And 書、黑膠、救援統計及阿澄附註只來自已提交事實；And 稱號門檻隨釘選版本設定；小票不含自由輸入 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-044` ReceiptBadges（@happy-path @critical @frontend） | Given 四印章各有獨立成立或不成立事實 | When 測同書／換曲／對方見符號／quiet+S/A | Then 各印章只對應原稿條件；And 不成立不顯示、重送不重複；And 小票無真實姓名、Email、照片、私密Profile或未授權內容；And 印章依當前符號實際呈現見證而非背景讀取或自我見證 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-045` NaturalCompletion（@happy-path @critical @frontend） | Given 本場已結局、Round仍active | When 自然完成後聊天、單方同意／撤回再雙方同意下一場 | Then 不額外要求完成按鈕或支線；And 聊天仍可用；雙方同意才建新場；And 新場釘選合法版本、舊投影與cue清除 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-046` SafeExit（@error-handling @critical @frontend） | Given ready/running/paused/settled/completed任一階段 | When 一方確認退出並與救書或alarm競態 | Then 退出不受倒數或素材故障阻塞；And 解除占用、終止權限且pair排除；And 無後續訊息／操作／私有圖或舊cue；And 退出與救書競態的敗方不再寫入 | `F-03`、`F-06`：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-048` AssetReadiness（@error-handling @critical @frontend） | Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready | When 載入、恢復與點擊 | Then fail closed，不以placeholder冒充；And 保留可用聊天/退出及重讀、現有錯誤碼；And 恢復原版且不重抽、不呼叫Gemini；And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材 | `F-05`：實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs` | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`（跨包鏈：SD-003→SD-005→SD-006） |
| `RB4-BDD-049` AvatarReuse（@happy-path @critical @frontend） | Given 16免費角色及既有ready AI套組 | When 切換4姿態5表情、重連與失權 | Then 保持已核准身份／外觀、資產共用；And 切換或重連不重產；And 失權清圖；真provider證據與回放分開；And 必要真 provider 質量及成本證據不可由回放代簽 | `F-05`：實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs` | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`（跨包鏈：SD-005→SD-006） |
| `RB4-BDD-050` PlatformPerformance（@performance @critical @frontend） | Given 正式V4完整資產、Web與Android現有驗收裝置 | When 連續探索、翻書、倒數、背景與重連 | Then 記錄載入／操作延遲／記憶體／動畫對V3基線；And 離開與失權清資源且有界快取；And 無實測不得標Gate A通過；And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證 | `F-05`：實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs` | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`（跨包鏈：SD-005→SD-006） |
| `RB4-BDD-051` GateA（@happy-path @critical） | Given V4正式候選與真環境測試 | When 核對全部AC、兩題組、四結局及必要平台 | Then 真D1/R2/DO與HTTP/WS有精確證據；And Web/Android及素材/內容/權限/效能逐項核對；And 未驗或失敗不得以局部測試通過代簽；And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽 | `F-05`：實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs` | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`（跨包鏈：SD-005→SD-006） |

## 用戶故事

作為產品交付主責人與即將親自試玩驗收的使用者，我想要在進入本人 Gate B 試玩前，確認正式 V4 內容與全部 80 項素材已在真實本地平台、Web 瀏覽器與 Android 裝置上通過雙真人視角的全分支、隱私、斷線恢復與效能實測，以便確保交付試玩的是真正穩定完整的產品。

## 畫面操作／系統處理流程

本包嚴格採用**單一序列獨佔執行**（因共用本地 `127.0.0.1:8787` 平台、`.NET` E2eHost 與 Android ADB 通道，嚴禁並行搶埠）：
1. Runner 修復與基礎檢核（`S01`）：修復 `tools/test-android.ps1` 與擴充 `tools/test-scene-web.mjs`，跑通 `npm run check:foundation`。
2. 真本地橋接 Live 整合（`S02`）：執行 `tests/integration/rain-bookshop-v4-live.test.mjs` 驗證真 Worker + `.NET` + D1 + R2 + DO 全鏈路。
3. 正式首場索引啟用與 Web E2E（`S03`）：更新 `contracts/scene-event-content.json` 指向已驗 SHA 之 `contracts/rain-bookshop-v4.json` 並執行 `content:publish:local`、`export:web`、`build:e2e-host`，以雙獨立 BrowserContext 跑通全部 42 個 `@frontend` 場景 Web E2E（關閉影片／trace）。
4. 真實 Android E2E（`S04`）：在真實 Android 裝置／模擬器上跑通全部 42 個 `@frontend` 場景原生手勢與雙人協作 E2E（UI XML 僅在記憶體處理，缺環境如實記 `Deferred` 不代簽）。
5. 韌性、素材與效能基線（`S05`）及 Gate A 321 項總檢核（`S06`）：驗證雙端重複閒置恢復 `RB4-T-324`、80 素材與靜態化身零重產、記憶體／延遲對照 V3 基線，執行 `rain-bookshop-v4-gate-a-audit.mjs` 確認前段 321/321 證據齊全。

### 畫面、元件與互動分解（適用時）

| 畫面／區域／角色／BDD | 實際頁面、元件、handler／F-ID | 布局、內容、素材與操作／手勢 | 狀態、導覽、禁用／錯誤／重試 | API／事件、權威狀態與平台差異 | 必要 S／I／V、可重現操作與視覺驗收 |
|---|---|---|---|---|---|
| `RB4-BDD-001` EnterStore（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 I點門把且A點傘桶，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-002` NavigateAreas（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 左右導航及小地圖選合法相鄰區，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-003` DiscoverObjects（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 先觀看呼吸光再長按空白與放開，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-004` GestureFence（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 快速連點、滑動、拖出、取消或送舊revision，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-005` BookCatalog（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐一在5區開書並翻至末頁，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-006` BlindBook（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 滑動各封條、取消、成功揭封後重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-007` InterestBadge（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 以本人身份讀書架或竄改owner，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-008` Resonance（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐一選該書三項共鳴之一，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-009` VinylSync（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 合法切換3曲並重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-010` AmbientExplore（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 查看小黑板、5則留言及阿澄3話題，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-011` FogWindow（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 擦霧查看3階段雨勢並留下4種合法符號，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-012` FogWitness（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 背景讀取、同作者見證、舊符號見證及對方實際呈現，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-013` SameDifferentBook（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 測同一本與不同一本兩路，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-014` TissueDistance（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 拖面紙到近／遠合法位置後A各選收下／不用，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-015` GiveSpaceReverse（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 A各選主動聊書／音樂／保持安靜，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-016` DeclineApproach（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 A選open-up／books-only／decline，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-017` QuestionCard（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 依場次種子從4題釘選1題並各自回答，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-019` ChatSuggestions（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐情境打開聊天、點一則或自由聊天，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-020` ClerkPersona（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 各試3種招呼及4組危機後致謝，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-022` StormPresentation（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 兩端接cue或斷線重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-026` RescueSteps（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 A分享線索、I跨合法區抽書上滑、A收書裝袋上架，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-027` ReverseClues（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-028` WrongRescue（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-029` QuickCallouts（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐句點選並嘗試偽造他方ID，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-030` WaterStages（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 權威時間跨75/50/30/15秒及延遲重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-031` PauseIdle（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 測14999/15000ms閒置且仍有ping，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-032` PauseReconnect（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 雙方恢復可操作、重複斷線多次，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-034` GradeS（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 伺服器提交最後合法封箱，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-035` GradeA（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 DO喚醒或合法讀取補償，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-036` GradeB（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 系統結算，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-038` Bookmark（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐書三句書籤選一，選填0/20字並各自提交，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-040` WishMatrix（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 覆核3×3共9種最終意願組合，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-041` EndingArt（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 看場景光色、距離、原文、互動並重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-042` ReceiptTitle（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 以S剩29999／30000／30001ms及A/B測小票，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-044` ReceiptBadges（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 測同書／換曲／對方見符號／quiet+S/A，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-045` NaturalCompletion（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 自然完成後聊天、單方同意／撤回再雙方同意下一場，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-046` SafeExit（雙角色視角） | `F-03`、`F-06`（對應步驟 `SD-006-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 一方確認退出並與救書或alarm競態，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S03`／`SD-006-I03`／`SD-006-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-048` AssetReadiness（雙角色視角） | `F-05`（對應步驟 `SD-006-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 載入、恢復與點擊，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-049` AvatarReuse（雙角色視角） | `F-05`（對應步驟 `SD-006-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 切換4姿態5表情、重連與失權，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-050` PlatformPerformance（雙角色視角） | `F-05`（對應步驟 `SD-006-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 連續探索、翻書、倒數、背景與重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-006-S02`／`SD-006-I02`／`SD-006-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |

## 技術規範與實作設計

### 架構、DDD 與責任

對應 `SYS-009`。遵循 `AGENTS.md` 必守規則：（1）UI 測試關閉影片／trace，Android 原生 UI XML 僅在記憶體處理不落盤；（2）不輸出任何密碼、token 或 Cookie；（3）Web 證據不能擴推冒充 Android 證據；（4）Gate A 精確分母為前段 **321 項唯一 TDD**（`RB4-T-001`～`294`、`310`～`333`、`335`～`337`），排除 `RB4-T-295`（Gate B）與 `RB4-T-296`～`309`,`334`（Gate B 後清理與乾淨重玩），消除分母死鎖循環。

### 重要函式、核心邏輯與狀態

| 核心 ID／目標類別或函式 | 輸入／輸出與前後置條件 | 演算法／分支／偽碼 | 交易／併發／冪等／重試 | 錯誤語意／驗證 |
|---|---|---|---|---|
| `auditRainBookshopV4GateA`（`tools/rain-bookshop-v4-gate-a-audit.mjs`） | 輸入：`contracts/rain-bookshop-v4.json`、`rain-bookshop-v4-rights.json`、各層測試執行報告與平台證據摘要；輸出：`{ gateAReady: boolean, verifiedIds: string[], missingOrDeferred: string[], contentSha256: string }` | 逐一核對前段 320 個技術測試 ID 已取得真實執行通過證據、80 項資產位元組與解碼通過、16 經典與音訊權利清冊完整、Web 與 Android 42 個 `@frontend` 場景雙端證據齊備後，才將第 321 項總檢 `RB4-T-337` 與 `gateAReady` 判為 `true` | 純唯讀稽核，絕不自動修改來源 checkbox 或代簽 `RB4-T-295` | 任一平台未跑或任一 ID 為 `Deferred`/`Incomplete` 時，`gateAReady` 嚴格回傳 `false` 並列精確缺項；由 `SD-006-V06` 驗證 |

### 契約、資料與平台

- **契約與版本**：嚴格對齊 [01-system-design.md](../01-system-design.md#契約與資料設計) 定義之 `CNT-001`（`scene-event.v3`）、`CNT-002`（動作白名單＋書籤 `0..20` Unicode scalar）、`CNT-003`（actor-scoped 快照＋單人 `own_profile` 興趣）與 `CNT-004`（私有 `story.framework.system.reconcile`）。
- **資料庫與儲存限制**：維持 `0001`～`0007` **21 張表、0 新欄、0 SQL Trigger、0 新增公開 HTTP 路由**；維持 `world_state_json <= 16,384`、`state_json <= 16,384`、manifest `<= 512KiB`／`4MiB`、素材 `<= 8MiB`、可達狀態 `<= 50,000`。
- **平台與安全範圍**：目標平台為 **Web** 與 **Android**（依 `D-051`/`D-052` 排除 iOS 與無障礙專項）；嚴禁記錄或輸出任何密碼、驗證碼、Google/Session token、Cookie 或私人照片位元組；本地維運一律經 `tools/local.mjs` 操作已知 local instance，嚴禁 `--remote`。

### 共用與改動合理性

- 100% 沿用既有認證、配對、聊天、16 款內建全身與私人靜態四姿態化身系統（執行期 **0 次 Gemini 呼叫**）。
- 本包可寫檔案清單與其餘 6 份 SD 分項完全互斥（單一寫入者），避免並行覆寫衝突並最小化對既有 V3 回歸面之影響。

## 檔案改動設計

### F-01：`tools/test-android.ps1`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：Suite 白名單與腳本路徑解析（第 1–14 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-012`、`RA-11`／`RB4-T-337`／`SD-006-D01`,`I01`／`SD-006-S01`
- 改動要點與必要核心邏輯：於 `$Suite` 白名單加入 `scene-event-v4`，檢查並修正搬移前殘留相對路徑引用，確保在 `C:\GitProjects\gamenenstyle\datinghigh` 下可穩定重跑既有與新增 `scene-event-v4.mjs` 套件
- 此檔案的責任與白話設計原因：解除 `AGENTS.md` 所載 Android 腳本重跑路徑限制
- 輸入／輸出、介面及契約限制：PowerShell 測試啟動器（保留 `SetThreadExecutionState` 防睡眠與結束還原）
- 前置依賴：`SD-001`～`SD-005` 全數完成
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4`（`SD-006-V01`,`V04`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-02：`tools/test-scene-web.mjs`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：Playwright 目標規格檔參數（第 1–4 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-012`／`SD-006-D01`,`I01`／`SD-006-S01`
- 改動要點與必要核心邏輯：支援傳入或預設涵蓋 `scene-event-framework.spec.ts` 與新增之 `scene-event-v4.spec.ts`，維持關閉 video/trace 設定
- 此檔案的責任與白話設計原因：讓 `npm run test:scene:web` 可執行 V4 正式 Web 驗收與框架回歸
- 輸入／輸出、介面及契約限制：Node CLI wrapper
- 前置依賴：`SD-005-S05`
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`npm run test:scene:web`（`SD-006-V01`,`V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-03：`contracts/scene-event-content.json`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：正式首場故事索引 `stories[0]`（第 1–23 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-011`,`012`、`SPEC §5.1`／`SD-006-D02`,`I03`／`SD-006-S03`
- 改動要點與必要核心邏輯：於前段單元／整合與 Live 驗證同一精確 V4 bundle SHA 通過後，將 `stories[0]` 更新為指向 `contracts/rain-bookshop-v4.json` 與新 V4 UUIDv7 `sceneCatalogId` / `narrativeCatalogId`（經 `npm run content:publish:local` 發布至 local D1/R2，舊 V3 Catalog 自動轉 `retired` 但舊釘選場次與舊檔案完整保留至 Gate B）
- 此檔案的責任與白話設計原因：嚴格遵守 `SPEC §5.1` 發版時序並單一寫入首場索引
- 輸入／輸出、介面及契約限制：`scene-event.authoring.v2` JSON 索引檔
- 前置依賴：`SD-006-S02` 通過
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`npm test && npm run content:publish:local`（`SD-006-V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-04：`tools/rain-bookshop-v4-gate-a-audit.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`auditRainBookshopV4GateA` 技術 Gate A 321 項總檢核器
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-012`、`RA-11`/`12`／`RB4-T-337`／`SD-006-D04`,`I06`／`SD-006-S06`
- 改動要點與必要核心邏輯：核驗前段 320 個測試 ID 執行結果、80 素材解碼／尺寸／SHA、16 經典與音樂權利證據、Web 與 Android 雙端獨立證據及效能對照紀錄，輸出結構化 Gate A 總檢報告（不含秘密，不代簽 `RB4-T-295`）
- 此檔案的責任與白話設計原因：以機器稽核守住進入本人實玩 Gate B 的全部技術門檻
- 輸入／輸出、介面及契約限制：Node 檢核模組與 CLI
- 前置依賴：`SD-006-S05`
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs`（`SD-006-V06`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-05：`tests/integration/rain-bookshop-v4-live.test.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：真本地平台橋接（Worker + .NET + D1 + R2 + DO）跨系統整合測試
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-007`～`012`／涵蓋 `BDD-048`～`051` Integration TDD／`SD-006-I02`／`SD-006-S02`
- 改動要點與必要核心邏輯：啟動受控本地平台實例，以兩名真實註冊且具 ready 靜態四姿態化身之測試帳號配對入房，透過真實 HTTP 與 WS 驗證 V4 釘選、盲書／提問卡私密隔離、主動暴雨、DO Alarm 結算、80 素材供應、斷線重連與安全退出
- 此檔案的責任與白話設計原因：在無瀏覽器 mock 的真實跨進程橋接層驗證全系統整合
- 輸入／輸出、介面及契約限制：Node `node:test` Live 整合測試
- 前置依賴：`SD-006-S01`
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`node --test tests/integration/rain-bookshop-v4-live.test.mjs`（`SD-006-V02`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-06：`tests/e2e/web/scene-event-v4.spec.ts`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：正式 Web 雙真人獨立 BrowserContext 全場景 Playwright E2E 測試套件
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-001`～`012`／涵蓋全部 Gate A Web E2E TDD（含 `RB4-T-324` Web 端）／`SD-006-I03`,`I05`／`SD-006-S03`,`S05`
- 改動要點與必要核心邏輯：在真實匯出之 Web 前端與本地平台上，以兩個獨立 BrowserContext（Inviter 與 Acceptor）完整執行入店、小地圖暖金點、長按掃視、橫滑書牆、撕盲書、本人興趣貼紙、黑膠同步、背景停播、擦霧與前景見證、近遠面紙、留白反向主動、獨處退讓、提問卡、8×3 建議、暴雨 7 步、雙題組手勢救書、鎖扣錯序重試、重複閒置／斷線自動恢復、S/A/B 與四結局、結局 2 翻書、借閱小票 `X/4`、雙同意重玩、失權清理與安全退出，並量測載入與記憶體基線
- 此檔案的責任與白話設計原因：取得正式 Web 平台 100% 真實玩家畫面與手勢驗收證據
- 輸入／輸出、介面及契約限制：Playwright E2E 測試（video: off, trace: off）
- 前置依賴：`F-02`、`F-03`
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`npm run test:scene:web`（`SD-006-V03`,`V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-07：`tests/e2e/android/scene-event-v4.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：真實 Android 裝置／模擬器雙真人視角全場景 E2E 測試套件
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-AC-001`～`012`／涵蓋全部 Gate A Android E2E TDD（含 `RB4-T-324` Android 端）／`SD-006-I04`,`I05`／`SD-006-S04`,`S05`
- 改動要點與必要核心邏輯：透過 ADB 真實觸控／滑動（tap / swipe / long-press）與夥伴客戶端協作，於 Android 原生畫面獨立驗證全部 42 個 `@frontend` 場景、App 退背景音訊即停、重複閒置斷線自動恢復、四結局與小票，UI XML 僅在記憶體解析不寫檔
- 此檔案的責任與白話設計原因：取得真實 Android 原生平台獨立證據，不以 Web 結果擴推代簽
- 輸入／輸出、介面及契約限制：Node Android E2E 腳本（由 `tools/test-android.ps1 -Suite scene-event-v4` 啟動）
- 前置依賴：`F-01`、`SD-006-S03` 完成並釋放埠衝突
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`npm run build:e2e-host && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4`（`SD-006-V04`,`V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-08：`tools/tests/rain-bookshop-v4-gate-a.test.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：技術 Gate A 321 項檢核器正反例與缺證據阻斷測試
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-009`／`RB4-T-337`／`SD-006-I06`／`SD-006-S06`
- 改動要點與必要核心邏輯：測試當 320 項全通過且素材／權利齊備時 `gateAReady === true`，以及缺少任一 Android 證據、缺權利紀錄或 SHA 不符時強制回傳 `gateAReady === false`
- 此檔案的責任與白話設計原因：確保 Gate A 稽核器本身具備嚴格防假通過能力
- 輸入／輸出、介面及契約限制：Node `node:test` 測試套件
- 前置依賴：`F-04`
- 寫入責任、共用責任與可寫區段：`SD-006` 唯一寫入
- 驗證方式與預期結果：`npm test`（`SD-006-V06`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）


## 有序實作與驗證步驟

### 步驟順序與起始關卡

| 步驟 ID／成果 | 唯一負責 I-ID／來源 | 前置步驟及所需結果／跨包契約 | F-ID／V-ID | 通過後可開始的下一步／條件 | 執行狀態／證據位置 |
|---|---|---|---|---|---|
| `SD-006-S01`／修復 `tools/test-android.ps1` 路徑引用、擴充 `tools/test-scene-web.mjs` 並執行基礎回歸檢核 | `SD-006-I01`（產品基礎前置成果） | `SD-001`～`SD-005` 全部 `I` 葉節點測試通過且無並行寫入程序 | `F-01`、`F-02`／`SD-006-V01` | `SD-006-S02` | `Planned`；證據待回填 |
| `SD-006-S02`／實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs` | `SD-006-I02`（`RB4-T-275`,`RB4-T-282`,`RB4-T-288`,`RB4-T-294`） | `SD-006-S01` 通過，且無其他佔用本地測試埠之程序 | `F-05`／`SD-006-V02` | `SD-006-S03` | `Planned`；證據待回填 |
| `SD-006-S03`／切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E | `SD-006-I03`（`RB4-T-004`,`RB4-T-009`,`RB4-T-014`,`RB4-T-019`…等 37 項 TDD） | `SD-006-S02` 通過（同一精確 V4 bundle SHA 已通過隔離與 Live 驗證） | `F-03`、`F-06`／`SD-006-V03` | `SD-006-S04` | `Planned`；證據待回填 |
| `SD-006-S04`／執行真實 Android 裝置／模擬器雙真人視角全場景原生手勢 E2E 驗收 | `SD-006-I04`（`RB4-T-005`,`RB4-T-010`,`RB4-T-015`,`RB4-T-020`…等 37 項 TDD） | `SD-006-S03` 通過，且已備妥可用 Android 測試裝置／模擬器與最新 Dev Client APK（與 Web E2E 序列錯開執行） | `F-07`／`SD-006-V04` | `SD-006-S05`（若當前環境無可用 Android 裝置／ADB，依契約立即停止並如實記 `Deferred`，嚴禁以 Web 證據冒充通過！） | `Planned`；證據待回填 |
| `SD-006-S05`／完成雙平台重複閒置／斷線自動恢復（`RB4-T-324`）、80 素材解碼與記憶體／延遲基線量測 | `SD-006-I05`（`RB4-T-277`,`RB4-T-278`,`RB4-T-283`,`RB4-T-284`…等 7 項 TDD） | `SD-006-S03` 與 `SD-006-S04` 通過 | `F-06`、`F-07`／`SD-006-V05` | `SD-006-S06` | `Planned`；證據待回填 |
| `SD-006-S06`／實作並通過 `rain-bookshop-v4-gate-a-audit.mjs` 前段 321 項唯一 TDD 技術 Gate A 總檢核 | `SD-006-I06`（`RB4-T-337`） | `SD-006-S05` 通過 | `F-04`、`F-08`／`SD-006-V06` | 技術 Gate A 正式通過，移交精確 V4 SHA 與完整證據予 `SD-007`（準備清理隔離測試並提交使用者本人實玩 Gate B） | `Planned`；證據待回填 |

### SD-006-S01：修復 `tools/test-android.ps1` 路徑引用、擴充 `tools/test-scene-web.mjs` 並執行基礎回歸檢核

**對應成果與責任**：唯一負責 `SD-006-I01`；對應 TDD：跨步驟產品前置（由後續整合測試共同覆核）；涉及檔案：`F-01`、`F-02`；驗證 ID：`SD-006-V01`；由 `SD-006` 執行者負責。
**開始條件與前置證據**：`SD-001`～`SD-005` 全部 `I` 葉節點測試通過且無並行寫入程序。
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `tools/test-android.ps1`、`tools/test-scene-web.mjs`、`overview/02-development-guidelines/03-ai-workflow-stages.md`，以及 [01-system-design.md](../01-system-design.md)。
**可寫檔案／符號及禁止改動**：修改 `F-01`、`F-02`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。
**產品改動與 BDD／畫面關聯**：透過 `F-01`、`F-02` 落實「修復 `tools/test-android.ps1` 路徑引用、擴充 `tools/test-scene-web.mjs` 並執行基礎回歸檢核」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。
**具體行為與核心邏輯**：於 `test-android.ps1` 加入 `scene-event-v4` 並修正搬移前殘留路徑；更新 `test-scene-web.mjs` 支援執行 V4 Web E2E；先跑 `npm run check:foundation` 確認全倉基礎契約健康。
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C01-1`／正常 | 檢驗 `test-android.ps1` 參數解析與執行 `npm run check:foundation` | 腳本正確定位 `tests/e2e/android/scene-event-v4.mjs`，基礎整體驗證 0 錯誤 | 不影響既有 Android 與 Web suite 執行 | `SD-006-V01`／`tools/test-android.ps1` + `check.mjs` |
| `C01-2`／錯誤參數攔截 | 傳入未知 `-Suite unknown-suite` 至 `test-android.ps1` | 立即拋出 `Unknown Android suite` 非零退出碼 | 白名單防護保持有效 | `SD-006-V01`／`tools/test-android.ps1` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 檢查 `pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4` | `C:\GitProjects\gamenenstyle\datinghigh` | `pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4` | 因 `scene-event-v4` 尚未列入白名單而拋 `Unknown Android suite` | 待回填 |
| 2／Green | 修改 `F-01`、`F-02` 支援 `scene-event-v4` 並修正路徑 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run check:foundation` | 基礎檢查通過且啟動器準備就緒 | 待回填 |
| 3／Refactor 與回歸 | 執行 `npm test` 確認工具測試全綠 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm test` | 全部通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。
**可在本步修正的範圍**：本步可寫檔案（`F-01`、`F-02`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。
**下一步與起始條件**：通過後進入 `SD-006-S02`。
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-006-S02：實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs`

**對應成果與責任**：唯一負責 `SD-006-I02`；對應 TDD：`RB4-T-275`、`RB4-T-282`、`RB4-T-288`、`RB4-T-294`；涉及檔案：`F-05`；驗證 ID：`SD-006-V02`；由 `SD-006` 執行者負責。
**開始條件與前置證據**：`SD-006-S01` 通過，且無其他佔用本地測試埠之程序。
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `tests/integration/story-dialogue-live.test.mjs`、`tests/integration/foundation-live.test.mjs`，以及 [01-system-design.md](../01-system-design.md)。
**可寫檔案／符號及禁止改動**：新增 `F-05`（`tests/integration/rain-bookshop-v4-live.test.mjs`）；嚴禁跨包修改非本包負責之檔案或竄改上游規格。
**產品改動與 BDD／畫面關聯**：透過 `F-05` 落實「實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs`」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。
**具體行為與核心邏輯**：在真實本地 Worker + `.NET` + D1 + R2 + DO 橋接環境發布候選 V4 bundle，建立兩名真實測試玩家完成配對、入店、撕盲書、霧窗見證、提問卡、主動暴雨、DO Alarm 到期結算、書籤小票、80 素材 HTTP 讀取與安全退出，同時跑既有 `npm run test:live` 與 `npm run test:story:live` 回歸。
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C02-1`／正常（跨系統全鏈路） | 雙真實 Session 經 HTTP + WS 跑完 V4 探索→暴雨→救書→結算→小票與 `/story-content/assets/:sha` 讀取 | 全鏈路 `200`/`101` 正常同步，80 素材皆可帶 `immutable` 標頭讀回且 SHA 相符 | 既有 `foundation-live` 與 `story-dialogue-live` 保持通過 | `SD-006-V02`／`tests/integration/rain-bookshop-v4-live.test.mjs` |
| `C02-2`／跨系統故障與權限復原 | 模擬中途 WS 斷開重連、撤銷一方 Session 後讀取體驗與私人頭像 | 重連透過 `events/query` + `/experience` 無損補齊；撤銷方立即獲 `401` 阻擋 | 零跨帳號資料外洩 | `SD-006-V02`／`tests/integration/rain-bookshop-v4-live.test.mjs` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `rain-bookshop-v4-live.test.mjs` 並執行跨系統斷言 | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tests/integration/rain-bookshop-v4-live.test.mjs` | 驗證所有跨系統端點與靜態姿態前置並修正任何橋接配置缺口 | 待回填 |
| 2／Green | 跑通完整 `rain-bookshop-v4-live.test.mjs` | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tests/integration/rain-bookshop-v4-live.test.mjs` | V4 Live 整合測試全數通過 | 待回填 |
| 3／Refactor 與回歸 | 序列執行既有 Live 橋接回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:live && npm run test:story:live` | 既有 Live 回歸 100% 全綠 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。
**可在本步修正的範圍**：本步可寫檔案（`F-05`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。
**下一步與起始條件**：通過後進入 `SD-006-S03`。
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-006-S03：切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E

**對應成果與責任**：唯一負責 `SD-006-I03`；對應 TDD：`RB4-T-004`、`RB4-T-009`、`RB4-T-014`、`RB4-T-019`、`RB4-T-024`、`RB4-T-030`、`RB4-T-037`、`RB4-T-042`、`RB4-T-048`、`RB4-T-053`、`RB4-T-058`、`RB4-T-064`、`RB4-T-070`、`RB4-T-076`、`RB4-T-082`、`RB4-T-088`、`RB4-T-094`、`RB4-T-105`、`RB4-T-111`、`RB4-T-122`、`RB4-T-145`、`RB4-T-151`、`RB4-T-157`、`RB4-T-163`、`RB4-T-169`、`RB4-T-175`、`RB4-T-182`、`RB4-T-193`、`RB4-T-199`、`RB4-T-205`、`RB4-T-217`、`RB4-T-228`、`RB4-T-234`、`RB4-T-240`、`RB4-T-251`、`RB4-T-258`、`RB4-T-265`；涉及檔案：`F-03`、`F-06`；驗證 ID：`SD-006-V03`；由 `SD-006` 執行者負責。
**開始條件與前置證據**：`SD-006-S02` 通過（同一精確 V4 bundle SHA 已通過隔離與 Live 驗證）。
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `contracts/scene-event-content.json`、`tests/e2e/web/scene-event-v3.spec.ts`、`tests/playwright.config.ts`，以及 [01-system-design.md](../01-system-design.md)。
**可寫檔案／符號及禁止改動**：修改 `F-03`，新增 `F-06`（`tests/e2e/web/scene-event-v4.spec.ts`）；嚴禁跨包修改非本包負責之檔案或竄改上游規格。
**產品改動與 BDD／畫面關聯**：透過 `F-03`、`F-06` 落實「切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。
**具體行為與核心邏輯**：更新 `contracts/scene-event-content.json` 首場索引指向 `contracts/rain-bookshop-v4.json`（保留 `contracts/rain-bookshop-before-rain-stops.json` 檔案至 Gate B），執行 `content:publish:local`、`export:web`、`build:e2e-host`，啟動本地平台後以 Playwright 雙獨立 BrowserContext 完整驗證全部 42 個 `@frontend` 場景之 Web 端案例。
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C03-1`／正常（全部 Web E2E `_Web_MatchesPlayerExperience`） | 雙瀏覽器視窗模擬 Inviter 與 Acceptor 完整執行探索、20 書／盲書、彩蛋／霧窗見證、同異書破冰、留白反向主動、獨處、提問卡、8×3 建議、暴雨、雙題組手勢救書、S/A/B 四結局、結局 2 翻書、小票 `X/4` 與雙同意下一場 | 全部 Web E2E 斷言 100% 通過，新配對自動進入 V4 `rain-bookshop-before-rain-stops@v2` | 關閉 video/trace，無秘密輸出至終端或報告 | `SD-006-V03`／`tests/e2e/web/scene-event-v4.spec.ts` |
| `C03-2`／Web 邊界與安全退出 | 驗證撕封中途取消、鎖扣錯序重置、Web 視窗 blur 音訊即停、401/退出立即清空私有畫面 | 畫面與網路請求完全符合規格，無殘留私密文字 | 既有 `scene-event-framework.spec.ts` 回歸通過 | `SD-006-V03`／`tests/e2e/web/scene-event-v4.spec.ts` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 更新 `F-03`、撰寫 `scene-event-v4.spec.ts` 並執行預檢 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run export:web && npm run build:e2e-host` | 確認靜態前端與 E2eHost 建置成功準備啟動實測 | 待回填 |
| 2／Green | 發布本地 V4 索引並在平台運行下執行 `scene-event-v4.spec.ts` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run content:publish:local && npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts` | 全部 V4 Web E2E 案例 100% 通過 | 待回填 |
| 3／Refactor 與回歸 | 執行 `npm run test:scene:web` 涵蓋框架回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:scene:web` | V4 與通用框架 Web E2E 全綠 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。
**可在本步修正的範圍**：本步可寫檔案（`F-03`、`F-06`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。
**下一步與起始條件**：通過後進入 `SD-006-S04`。
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-006-S04：執行真實 Android 裝置／模擬器雙真人視角全場景原生手勢 E2E 驗收

**對應成果與責任**：唯一負責 `SD-006-I04`；對應 TDD：`RB4-T-005`、`RB4-T-010`、`RB4-T-015`、`RB4-T-020`、`RB4-T-025`、`RB4-T-031`、`RB4-T-038`、`RB4-T-043`、`RB4-T-049`、`RB4-T-054`、`RB4-T-059`、`RB4-T-065`、`RB4-T-071`、`RB4-T-077`、`RB4-T-083`、`RB4-T-089`、`RB4-T-095`、`RB4-T-106`、`RB4-T-112`、`RB4-T-123`、`RB4-T-146`、`RB4-T-152`、`RB4-T-158`、`RB4-T-164`、`RB4-T-170`、`RB4-T-176`、`RB4-T-183`、`RB4-T-194`、`RB4-T-200`、`RB4-T-206`、`RB4-T-218`、`RB4-T-229`、`RB4-T-235`、`RB4-T-241`、`RB4-T-252`、`RB4-T-259`、`RB4-T-266`；涉及檔案：`F-07`；驗證 ID：`SD-006-V04`；由 `SD-006` 執行者負責。
**開始條件與前置證據**：`SD-006-S03` 通過，且已備妥可用 Android 測試裝置／模擬器與最新 Dev Client APK（與 Web E2E 序列錯開執行）。
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `tools/test-android.ps1`、`tools/build-android.ps1`、`AGENTS.md`（原生 UI XML 記憶體處理規則），以及 [01-system-design.md](../01-system-design.md)。
**可寫檔案／符號及禁止改動**：新增 `F-07`（`tests/e2e/android/scene-event-v4.mjs`）；嚴禁跨包修改非本包負責之檔案或竄改上游規格。
**產品改動與 BDD／畫面關聯**：透過 `F-07` 落實「執行真實 Android 裝置／模擬器雙真人視角全場景原生手勢 E2E 驗收」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。
**具體行為與核心邏輯**：透過 ADB 在真實 Android 畫面執行點門把／傘桶、小地圖收合、長按掃視、橫滑書牆、滑動撕開盲書、擦霧與見證、拖放面紙、提問卡、上滑傳書、裝袋、三態鎖扣、App 退背景音訊停播、四結局、結局 2 翻書、借閱小票與安全退出，全程將 `uiautomator dump` XML 僅於記憶體解析不落地檔案。
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C04-1`／正常（全部 Android E2E `_Android_MatchesPlayerExperience`） | Android 實機／模擬器登入玩家帳號與夥伴客戶端真實互動跑完 V4 全部 `@frontend` 場景 | 全部 Android E2E 案例獨立通過，觸控與滑動座標跟鏡頭縮放一致 | 工作區無任何殘留 `.xml` UI dump 或螢幕錄影檔 | `SD-006-V04`／`tests/e2e/android/scene-event-v4.mjs` |
| `C04-2`／Android 生命週期與復原 | 救書進行中按 Home 鍵退背景再返回 App、模擬網路中斷重連與結束互動 | 退背景音訊即停、返回後自動同步恢復權威倒數與持物狀態 | 既有 `test:scene:android` 回歸不壞 | `SD-006-V04`／`tests/e2e/android/scene-event-v4.mjs` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `tests/e2e/android/scene-event-v4.mjs` 並檢查 ADB 裝置連線 | `C:\GitProjects\gamenenstyle\datinghigh` | `adb devices` | 確認線上存在 `device` 狀態之 Android 測試目標（無裝置則停止回報） | 待回填 |
| 2／Green | 執行 V4 Android 全場景 E2E 套件 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run build:e2e-host && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4` | 全部 V4 Android E2E 案例 100% 實測通過 | 待回填 |
| 3／Refactor 與回歸 | 序列執行 `npm run test:scene:android` 確認框架原生回歸通過 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:scene:android` | Android 框架與 V4 套件皆通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。
**可在本步修正的範圍**：本步可寫檔案（`F-07`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。
**下一步與起始條件**：通過後進入 `SD-006-S05`（若當前環境無可用 Android 裝置／ADB，依契約立即停止並如實記 `Deferred`，嚴禁以 Web 證據冒充通過！）。
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-006-S05：完成雙平台重複閒置／斷線自動恢復（`RB4-T-324`）、80 素材解碼與記憶體／延遲基線量測

**對應成果與責任**：唯一負責 `SD-006-I05`；對應 TDD：`RB4-T-277`、`RB4-T-278`、`RB4-T-283`、`RB4-T-284`、`RB4-T-289`、`RB4-T-290`、`RB4-T-324`；涉及檔案：`F-06`、`F-07`；驗證 ID：`SD-006-V05`；由 `SD-006` 執行者負責。
**開始條件與前置證據**：`SD-006-S03` 與 `SD-006-S04` 通過。
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `RiskAudit G03 (RB4-T-324), RA-11`、`SPEC §3.5, §3.9`，以及 [01-system-design.md](../01-system-design.md)。
**可寫檔案／符號及禁止改動**：擴充／確認 `F-06`、`F-07` 內之重複閒置與效能基線測試區段；嚴禁跨包修改非本包負責之檔案或竄改上游規格。
**產品改動與 BDD／畫面關聯**：透過 `F-06`、`F-07` 落實「完成雙平台重複閒置／斷線自動恢復（`RB4-T-324`）、80 素材解碼與記憶體／延遲基線量測」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。
**具體行為與核心邏輯**：分別在 Web 與 Android 實測單場連續多次（`>= 3` 次）15 秒閒置／斷線暫緩並由前景重入自動恢復至完場（零死鎖、原操作不重複計數），實測全部 80 項素材解碼無誤、切換姿態與重連期間 **0 次呼叫 Gemini API**，並量測首屏載入、區域切換延遲與連續重連記憶體變化對照 V3 基線無退化。
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-1`／雙端重複暫緩自動恢復（`RB4-T-324`） | 於 Web 與 Android 各執行單方閒置 15s→重操作恢復→同伴斷線 15s→重連前景恢復→雙人皆閒置 15s→雙人重操作恢復 | 兩平台皆無死鎖自動恢復倒數並順利完成救書結算，兩平台各自產出獨立通過證據 | 雙平台皆通過才計 `RB4-T-324` 完成 | `SD-006-V05`／`scene-event-v4.spec.ts` + `scene-event-v4.mjs` |
| `C05-2`／零重產與效能基線（`RB4-BDD-050`,`051`） | 監控場內鏡位切換、四姿態五表情呈現與連續 5 次斷線重連之外部請求與 heap 使用量 | Gemini 請求次數嚴格為 `0`；80 素材零破圖／零壞音檔；記憶體穩定有界無持續洩漏 | 真實量測數據寫入驗證報告備查 | `SD-006-V05`／`scene-event-v4.spec.ts` + `scene-event-v4.mjs` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 執行雙端 `Resume_RepeatedIdle` 與效能基線專項選擇器 | `C:\GitProjects\gamenenstyle\datinghigh` | `npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts -g "Resume_RepeatedIdle|PerformanceBaseline"` | 逐項核驗嚴格斷言門檻 | 待回填 |
| 2／Green | 分別跑通 Web 與 Android 之 `RB4-T-324` 與素材／效能專項 | `C:\GitProjects\gamenenstyle\datinghigh` | `npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts -g "Resume_RepeatedIdle|PerformanceBaseline" && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4 -Pattern "Resume_RepeatedIdle|PerformanceBaseline"` | Web 與 Android 雙端獨立證據皆通過 | 待回填 |
| 3／Refactor 與回歸 | 確認本地測試程序乾淨收尾無殘留鎖定 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run dev:platform:stop` | 本地平台受控正常停止 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。
**可在本步修正的範圍**：本步可寫檔案（`F-06`、`F-07`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。
**下一步與起始條件**：通過後進入 `SD-006-S06`。
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-006-S06：實作並通過 `rain-bookshop-v4-gate-a-audit.mjs` 前段 321 項唯一 TDD 技術 Gate A 總檢核

**對應成果與責任**：唯一負責 `SD-006-I06`；對應 TDD：`RB4-T-337`；涉及檔案：`F-04`、`F-08`；驗證 ID：`SD-006-V06`；由 `SD-006` 執行者負責。
**開始條件與前置證據**：`SD-006-S05` 通過。
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `docs/tdd/SPEC-001-RainBookshopV4-TDD.md`、`RiskAudit G16 (RB4-T-337)`，以及 [01-system-design.md](../01-system-design.md)。
**可寫檔案／符號及禁止改動**：新增 `F-04`、`F-08`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。
**產品改動與 BDD／畫面關聯**：透過 `F-04`、`F-08` 落實「實作並通過 `rain-bookshop-v4-gate-a-audit.mjs` 前段 321 項唯一 TDD 技術 Gate A 總檢核」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。
**具體行為與核心邏輯**：實作 `auditRainBookshopV4GateA` 逐 ID 核對前段 **321 項唯一 TDD**（`RB4-T-001`～`294` 共 294 項、`RB4-T-310`～`333` 共 24 項、`RB4-T-335`～`337` 共 3 項，其中 `337` 在前 320 項、80 素材、16 經典與音訊權利、修復後 Android runner 證據皆齊備時成立），確認 `gateAReady === true` 並鎖定候選供本人試玩之精確 manifest SHA-256。
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C06-1`／正常（`RB4-T-337` 總檢通過） | 傳入真實已完成之前 320 項測試證據、80 素材與 `rain-bookshop-v4-rights.json` | `gateAReady: true`，`verifiedCount === 321`，明確列出待本人簽認之 `RB4-T-295` 與待 Gate B 後執行之 15 項 ID | 零分母循環、零代簽本人 Gate B | `SD-006-V06`／`tools/tests/rain-bookshop-v4-gate-a.test.mjs` |
| `C06-2`／防假通過阻斷 | 移除任一 Android E2E 證據或將任一經典權利標為 `pending` | `gateAReady: false` 並精確回報缺失項目 ID | 缺證據絕不放行進入 Gate B | `SD-006-V06`／`tools/tests/rain-bookshop-v4-gate-a.test.mjs` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `rain-bookshop-v4-gate-a.test.mjs` 撰寫正反例斷言 | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs` | `rain-bookshop-v4-gate-a-audit.mjs` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-04` 並跑通測試與實際 Gate A 總檢 | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs && node tools/rain-bookshop-v4-gate-a-audit.mjs` | 輸出 `gateAReady: true`（321/321 前段技術案例齊備） | 待回填 |
| 3／Refactor 與回歸 | 執行 `npm test` 確認全倉工具測試通過 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm test` | 本包 6 個 `I` 全數完成，正式移交 `SD-007` | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。
**可在本步修正的範圍**：本步可寫檔案（`F-04`、`F-08`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。
**下一步與起始條件**：通過後進入 技術 Gate A 正式通過，移交精確 V4 SHA 與完整證據予 `SD-007`（準備清理隔離測試並提交使用者本人實玩 Gate B）。
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

## 測試計劃與實際驗證方式

| 驗證 ID／來源 Todo／步驟 ID | 層級／行為／平台 | 環境與前置資料／案例 ID | 工作目錄與實際命令或畫面操作 | 預期結果／斷言 | 實作／測試位置 | 實際結果、時間、log／畫面證據 | 驗收狀態／等價依據或恢復條件 |
|---|---|---|---|---|---|---|---|
| `SD-006-V01`／`SD-006-I01`／`SD-006-S01` | 單元／工具驗證（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C01-1`、`C01-2`（共 0 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm run check:foundation` | 基礎檢查通過且啟動器準備就緒 | `F-01`、`F-02` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-006-V02`／`SD-006-I02`／`SD-006-S02` | Integration（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C02-1`、`C02-2`（共 4 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`node --test tests/integration/rain-bookshop-v4-live.test.mjs` | V4 Live 整合測試全數通過 | `F-05` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-006-V03`／`SD-006-I03`／`SD-006-S03` | E2E（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C03-1`、`C03-2`（共 37 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm run content:publish:local && npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts` | 全部 V4 Web E2E 案例 100% 通過 | `F-03`、`F-06` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-006-V04`／`SD-006-I04`／`SD-006-S04` | E2E（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C04-1`、`C04-2`（共 37 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm run build:e2e-host && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4` | 全部 V4 Android E2E 案例 100% 實測通過 | `F-07` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-006-V05`／`SD-006-I05`／`SD-006-S05` | E2E（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C05-1`、`C05-2`（共 7 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts -g "Resume_RepeatedIdle|PerformanceBaseline" && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4 -Pattern "Resume_RepeatedIdle|PerformanceBaseline"` | Web 與 Android 雙端獨立證據皆通過 | `F-06`、`F-07` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-006-V06`／`SD-006-I06`／`SD-006-S06` | E2E（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C06-1`、`C06-2`（共 1 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`node --test tools/tests/rain-bookshop-v4-gate-a.test.mjs && node tools/rain-bookshop-v4-gate-a-audit.mjs` | 輸出 `gateAReady: true`（321/321 前段技術案例齊備） | `F-04`、`F-08` | 待回填（設計階段未執行） | `Incomplete` |

## 依賴關係與執行順序

| 任務／交付物 | 唯一執行／整合／驗收責任 | 前置／契約版本／開始條件 | 可寫範圍及排除 | 共享環境／隔離／互斥 | 安全並行或循序理由 | 完成及回傳條件 |
|---|---|---|---|---|---|---|
| `SD-006-跨系統整合雙平台E2E與技術GateA驗收`（`SD-006-S01`～`SD-006-S06`） | SD-006 跨系統與雙平台驗收執行者／通過 Gate A（前段 321 項 TDD）後移交 SD-007 進入使用者本人實玩 Gate B | 使用者明確核准 `final` `1.0.0`；前置依賴：`SD-001`～`SD-005` 全部 `I` 葉節點測試通過且無並行寫入程序；契約 `SD-contract-v2`／`CNT-001`～`004` | 僅限本包 `F-01`～`F-08`；嚴禁跨包寫入他包檔案 | 單元與隔離 Miniflare 測試獨立運行；涉及 `127.0.0.1:8787` 或 Android ADB 之測試由 `SD-006`/`SD-007` 嚴格單一序列獨佔 | 依前置資料流與共享環境鎖定採嚴格有序關卡推進 | 本包 `I01`～`I06` 全數取得真實通過證據、無未提交髒檔且既有回歸全綠 |

全案關鍵依賴鏈：`SD-003-S01`（真 D1 時鐘探針）→ `SD-001` →（`SD-002` || `SD-004`）→ `SD-003-S02..S07` → `SD-005` → `SD-006`（Gate A 321 項）→ `SD-007-S02`（本人 Gate B）→ `SD-007-S03..S05`（具名清理、乾淨重玩、337/337 深度稽核與交付）。

## 風險、設計變更與人工確認紀錄

| ID／原設計版本 | 發現證據與為何不能照案實作 | 白話實務情境／功能影響 | 建議／替代與影響 SD／BDD／TDD | 負責者／觸發／成本時程 | 使用者決策／核准範圍／新版本 | 失效證據／重驗與恢復條件 |
|---|---|---|---|---|---|---|
| `FINAL-APPROVAL-GATE`／`1.0.0` | 依 `SD-contract-v2` 與 `design-decision` 規範，整合產出之 `final/` 未獲使用者明確確認前不得啟動產品開發 | 確保所有跨候選取捨（真實路徑修正、D1 `CASE ... json()` 回滾、21 表清理拓樸）符合使用者預期 | 審閱核准 `final` `1.0.0` 後轉為 `Ready for carefully-done`（影響 `SD-001`～`SD-007`） | 使用者本人／設計交付時觸發 | **已獲使用者明確核准（`2026-11-26`，基準 commit `22c2da535a8da6e1a916bfa3e3dd6f7f57b87f00`；轉為 `Ready for carefully-done`）** | 核准關卡已解除；後續若需改動已核准設計須先停工討論並遞增設計版本 |

已寫明的檔案、邏輯、介面、資料、依賴、契約或驗證方式若在實作期發現需變更，必須先停止本需求後續實作並向使用者報告確認，更新獲准設計後再續作；一般進度與證據回填不變更設計版本。

## 實現檢查清單／Todo

本區是本包 SD 進度的唯一計數來源。每個可勾選項都是葉節點，父分組只用標題。設計完成後只勾 D，I 要有有效實際驗收證據才可勾選。

### D：設計葉節點

- [x] **SD-006-D01** 完成 `tools/test-android.ps1` 路徑修復與 Web/Android V4 E2E 序列執行入口設計
  - 類型／唯一分組：D／測試基礎設施設計
  - 來源／責任／依賴：`RB4-AC-012`、`RA-11`；`SD-006` 負責
  - 完成條件／設計證據：`F-01`,`F-02` 與 `SD-006-S01` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-006-D02** 完成真本地 Live 跨系統整合、正式首場索引啟用與正式 Web 雙真人視角 E2E 設計
  - 類型／唯一分組：D／Live 與 Web E2E 設計
  - 來源／責任／依賴：`RB4-AC-001`～`012`；`SD-006` 負責
  - 完成條件／設計證據：`F-03`,`F-05`,`F-06` 與 `SD-006-S02`/`S03` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-006-D03** 完成真實 Android 原生手勢 E2E、雙端重複閒置恢復（`RB4-T-324`）與素材／效能基線驗證設計
  - 類型／唯一分組：D／Android 與韌性效能設計
  - 來源／責任／依賴：`RB4-AC-001`～`012`、`RA-01`/`11`；`SD-006` 負責
  - 完成條件／設計證據：`F-06`,`F-07` 與 `SD-006-S04`/`S05` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-006-D04** 完成前段 321 項唯一 TDD 技術 Gate A 無循環總檢核設計（保留 `RB4-T-295` 予本人 Gate B）
  - 類型／唯一分組：D／Gate A 總檢設計
  - 來源／責任／依賴：`RB4-AC-012`、`RB4-T-337`；`SD-006` 負責
  - 完成條件／設計證據：`F-04`,`F-08` 與 `SD-006-S06` 已完整定義（已通過全量一致性桌面稽核）

### I：實作驗證葉節點

- [ ] **SD-006-I01** 完成「修復 `tools/test-android.ps1` 路徑引用、擴充 `tools/test-scene-web.mjs` 並執行基礎回歸檢核」並取得實測驗收證據
  - 類型／唯一分組：I／產品前置與驗證
  - 來源／責任／依賴：支撐下游跨包驗收；`SD-006` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-006-S01`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-006-V01` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-006-I02** 完成「實作並通過真本地橋接跨系統整合測試 `rain-bookshop-v4-live.test.mjs`」並取得實測驗收證據
  - 類型／唯一分組：I／Integration 實作驗證
  - 來源／責任／依賴：`RB4-T-275`、`RB4-T-282`、`RB4-T-288`、`RB4-T-294`；`SD-006` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-006-S02`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-006-V02` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-006-I03** 完成「切換 `contracts/scene-event-content.json` 首場索引並通過正式 Web 雙真人視角全場景 Playwright E2E」並取得實測驗收證據
  - 類型／唯一分組：I／E2E 實作驗證
  - 來源／責任／依賴：`RB4-T-004`、`RB4-T-009`、`RB4-T-014`、`RB4-T-019`、`RB4-T-024`、`RB4-T-030`…等 37 項唯一 TDD；`SD-006` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-006-S03`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-006-V03` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-006-I04** 完成「執行真實 Android 裝置／模擬器雙真人視角全場景原生手勢 E2E 驗收」並取得實測驗收證據
  - 類型／唯一分組：I／E2E 實作驗證
  - 來源／責任／依賴：`RB4-T-005`、`RB4-T-010`、`RB4-T-015`、`RB4-T-020`、`RB4-T-025`、`RB4-T-031`…等 37 項唯一 TDD；`SD-006` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-006-S04`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-006-V04` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-006-I05** 完成「完成雙平台重複閒置／斷線自動恢復（`RB4-T-324`）、80 素材解碼與記憶體／延遲基線量測」並取得實測驗收證據
  - 類型／唯一分組：I／E2E 實作驗證
  - 來源／責任／依賴：`RB4-T-277`、`RB4-T-278`、`RB4-T-283`、`RB4-T-284`、`RB4-T-289`、`RB4-T-290`、`RB4-T-324`；`SD-006` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-006-S05`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-006-V05` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-006-I06** 完成「實作並通過 `rain-bookshop-v4-gate-a-audit.mjs` 前段 321 項唯一 TDD 技術 Gate A 總檢核」並取得實測驗收證據
  - 類型／唯一分組：I／E2E 實作驗證
  - 來源／責任／依賴：`RB4-T-337`；`SD-006` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-006-S06`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-006-V06` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`

## 檢查點與續作交接

| 日期／任務／執行者 | 已完成並驗收／證據 | 尚未驗收／停止原因 | 寫入責任與共享資源現況 | 所需決策／恢復條件與查核 | 續作對象、實際啟動結果／下一步 |
|---|---|---|---|---|---|
| 2026-11-26／`/design-decision` 核准鎖定 `SD-006`／`Antigravity (Gemini 4 Carbon (High))` | 設計葉節點 `D`: 4/4 完成、通過桌面稽核並獲使用者明確核准（`Ready for carefully-done`） | 實作葉節點 `I`: 0/6 未開始；依使用者指示更新至可開工狀態，尚未啟動實作 | 產品程式碼、測試、DB 與設定 **0 修改**；無運行中背景伺服器或鎖定資源 | 設計核准已完成；無設計阻斷 | 待執行 `/carefully-done` 核對基準快照並按全案步驟順序執行 |

**鎖定文件包／版本／核准依據**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/plans/SD-006-跨系統整合雙平台E2E與技術GateA驗收.md`／版本 `1.0.0`／使用者已於 `2026-11-26` 明確核准（基準 commit `22c2da535a8da6e1a916bfa3e3dd6f7f57b87f00`，最新檔案快照見 `../00-overview.md`）。
**目前 I-ID／步驟 ID／子階段／已發生副作用**：尚未開始（待進入 `SD-006-I01`／`SD-006-S01`）；已發生產品副作用：**無**。
**需重驗成果與不受影響成果**：無失效既有成果；既有 `SceneEventFramework` 基線保持完好。
**關鍵依賴鏈／下個里程碑／用時與重試策略**：下個里程碑為啟動 `/carefully-done` 完成 `SD-006-M1`；實作時單一測試失敗先於本步允許範圍定位修復，涉及設計或環境阻斷立即停止回報，不盲目無限重試。
**責任移交前停止寫入的證據**：未對任何產品或測試檔案進行寫入（可由 `git status --short` 核實）。

## 相關文檔

- [SD 總覽](../00-overview.md)
- [系統設計](../01-system-design.md)
- [追溯矩陣](../02-traceability.md)
- [設計決策](../03-design-decision.md)
- 上游規格：[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[V4 作者草案](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)、[Verification](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)

## 生成者、最後更新與狀態

**生成者／AI／模型／批次**：`Antigravity`／`Gemini 4 Carbon (High)`／批次 `final`
**最後更新／設計版本**：2026-11-26／`1.0.0`（契約 `SD-contract-v2`）
**執行狀態／驗收狀態／剩餘事項**：`Planned`（`Ready for carefully-done`）／`Incomplete`／設計已獲使用者核准，待執行 `/carefully-done` 依序實作 `SD-006-I01`～`I06`
