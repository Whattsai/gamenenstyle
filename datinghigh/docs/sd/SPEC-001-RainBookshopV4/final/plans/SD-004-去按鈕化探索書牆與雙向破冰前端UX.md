# SD-004-去按鈕化探索書牆與雙向破冰前端UX — 分項實作設計

**功能／工作包 ID**：`SD-004-去按鈕化探索書牆與雙向破冰前端UX`  
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[V4 作者原稿 JSON](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)  
**文件包／AI／模型／批次**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`／AI：`Antigravity`／模型：`Gemini 4 Carbon (High)`／批次：`final`  
**設計版本／契約版本／優先級**：`1.0.0`／`SD-contract-v2`／高（P1）  
**執行狀態／驗收狀態／最後更新**：`Planned`（未開發）／`Incomplete`（待核准後實測驗收）／2026-11-26  
**執行／整合／驗收責任**：SD-004 前端前半與共用型別執行者／由 SD-005 頂層組裝並由 SD-006 執行 Web + Android 雙端 E2E 驗收  
**來源與程式碼基準、核准設計快照**：見 [SD 總覽（../00-overview.md）](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

只計本文件「實現檢查清單／Todo」中的唯一葉節點；摘要、里程碑及引用不再計數。設計與實作驗證分開，設計完成不勾選產品完成。

| 指標 | 完成／總數 | 進度條與百分比 | 依據 |
|---|---|---|---|
| 設計完成度（D） | 4 / 4 | `[████████████████████] 100.0%` | 本包 `SD-004-D01`～`D04` 已完成完整設計與桌面一致性稽核 |
| 本包 BDD 設計涵蓋率 | 20 / 20 | `[████████████████████] 100.0%` | 本包涉及之全部唯一 BDD Scenario 均已完整分解至產品符號與步驟（跨包完整性見 [追溯矩陣](../02-traceability.md)） |
| 本包 TDD 設計涵蓋率 | 26 / 26 | `[████████████████████] 100.0%` | 本包主責驗證之 26 項唯一 TDD 已 100% 映射至具體步驟、測試檔與命令 |
| 實作驗證完成度（I） | 0 / 5 | `[░░░░░░░░░░░░░░░░░░░░] 0.0%` | 本包 `SD-004-I01`～`I05` 設計階段未開發，待人工核准 `final` 後實作驗收 |

### 分層／分組進度追蹤

| 唯一分組／層 | D 完成／總數 | I 完成／總數 | 進行中／待開始 | 執行狀態 | 驗收狀態／證據 |
|---|---|---|---|---|---|
| 設計葉節點（D） | 4 / 4 | 0 / 0 | 0 / 0 | `Ready for review` | 桌面設計稽核通過（待使用者核准 `final` `1.0.0`） |
| 實作與驗證葉節點（I；主責 TDD：Unit 26／Integration 0／API 0／E2E 0） | 0 / 0 | 0 / 5 | 0 / 5 | `Planned` | `Incomplete`；證據待回填至 `Verification.md` |

### 當前 Sprint 狀態

| 當前階段／Todo ID／步驟 ID | Red–Green–Refactor 子階段 | 負責者 | 開始／預計完成及依據 | 下一步 ID／最後更新 |
|---|---|---|---|---|
| 設計決策交付待審／尚未啟動 `SD-004-I01`（`SD-004-S01`） | 不適用（設計階段不啟動產品開發） | SD-004 執行者 | 待使用者明確核准 `final` `1.0.0` 且滿足首步前置後啟動（無硬性預設期限） | 核准且前置滿足後執行 `SD-004-S01`／2026-11-26 |

### 里程碑

僅引用 Todo ID，不建立第二套可計數 checkbox。

| 里程碑 | 必要葉節點／前置 SD | 驗收與整合條件 | 狀態／證據 |
|---|---|---|---|
| `SD-004-M0`：分項設計與步驟稽核就緒 | `SD-004-D01`～`D04` | 檔案路徑 100% 對齊真實 repo、單一寫入無衝突、每步具案例與命令 | 設計已完成（`Awaiting approval`） |
| `SD-004-M1`：本包全部實作與驗證葉節點達成 | `SD-004-I01`～`I05`（依賴前置見步驟表） | 本包全部 `SD-004-V01`～`SD-004-V05` 實測通過且既有回歸全綠 | `Incomplete` |
| `SD-004-M2`：跨包 Gate A／Gate B 與最終深度稽核結案 | 配合 `SD-006` 與 `SD-007-I01`～`I05` | 全案 337/337 TDD 驗證完成、本人 Gate B 通過並同步 `Verification.md` | `Incomplete` |

### 關鍵指標

| 指標 | 已確認目標與來源 | 當前值 | 實際驗證／證據或限制 |
|---|---|---|---|
| 本包主責 TDD 設計涵蓋與實測通過數 | 設計涵蓋 26/26；實測通過目標 26/26（`SPEC`／`TDD`） | 設計涵蓋 `100.0%`；實測 `0 / 26` | 設計階段未執行程式修改或測試代簽 |
| 架構與資料邊界遵守度 | 21 表、0 新欄、0 Trigger、0 新公開 API、原稿逐 scalar 不變、單一檔案寫入責任 | 設計 `100%` 符合 | 見下方「檔案改動設計」與 [02-traceability.md](../02-traceability.md) |

### 每日進度記錄

依專案 `AGENTS.md` 基本規範，禁止記錄每日／批次歷史進度流水帳；此處僅就地保留當前有效狀態。

| 日期 | 完成 Todo／有效證據 | 阻斷／剩餘 | 下一步／責任 |
|---|---|---|---|
| 2026-11-26 | 完成 `SD-004` 分項設計 `1.0.0`（`D`: 4/4，涵蓋 10 個檔案項目與 5 個有序步驟） | 實作 `I`: 0/5；等待使用者明確核准 `final` `1.0.0` | 取得核准並滿足前置後由 `/carefully-done` 依序執行 `SD-004-S01` |

## 功能概述

負責在真實平面目錄 `frontend/client/src/` 下實作 `scene-event.v3` 完整共用前端型別與手勢幾何（`scene-event-track.ts`、`scene-stage.ts`），以及 V4 前半探索與雙向破冰全部共用 React Native 元件（Web 與 Android 共用）：去按鈕化入店（門把／傘桶）、左右鄰接導引與可收合手繪小地圖（`BookshopMinimapOverlay.tsx` 帶本人暖金微光點）、首次入區 1 次柔和邊緣呼吸光與長按空白掃視輪廓（移除漂浮星號）、5 區橫滑書牆特寫與牛皮紙盲書虛線撕封（`ShelfCloseupDrawer.tsx`）、本人柔和興趣貼紙與 20 書試讀／推薦卡／末頁便條／3 共鳴（`SceneBook.tsx`）、空間感官彩蛋與起霧雨窗擦霧／4 符號／前景實際渲染見證（`AmbientInteractableModal.tsx`）、閱讀角面紙近遠拖放（`SceneWorldObjects.tsx`）及同異書破冰／留白反向主動／獨處退讓／雨天提問卡作答與揭曉（`SceneEventActions.tsx`）。本包不修改 `StoryExperienceScreen.tsx`（由 `SD-005` 唯一寫入組裝），達成零寫入衝突。

## 功能需求與來源追溯

| MVP／SPEC 項目 | BDD Scenario | TDD 測試項 | 系統設計 ID／本包 Todo／步驟 ID | 驗收條件 | 跨包共同成果與整合責任 |
|---|---|---|---|---|---|
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-001` EnterStore | `RB4-T-003` | SYS-008／SD-004-I02／SD-004-S02 | Then I與A分別到合法下一節點；And 另一方未操作前其Track不變；And 原場景融圖、門鈴與原文依角色呈現 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-002` NavigateAreas | `RB4-T-008` | SYS-008／SD-004-I02／SD-004-S02 | Then 鏡位與Area依合法鄰接更新；And 暖金點只示本人合法未探索或新事件；And 不顯示平鋪移動按鈕海或漂浮星號 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-003` DiscoverObjects | `RB4-T-011`、`RB4-T-012`、`RB4-T-013` | SYS-008／SD-004-I02／SD-004-S02 | Then 首次只提示一次；And 長按只短暫顯示合法物件輪廓；And 掃視、取消或重連不提交主線 | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-001` | `RB4-BDD-004` GestureFence | `RB4-T-016`、`RB4-T-017`、`RB4-T-018` | SYS-008／SD-004-I01／SD-004-S01 | Then 一次合法意圖最多一次提交；And 無效命中或取消不提交且物件復位；And 409重新同步、未知結果只同ID查receipt | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-005` BookCatalog | `RB4-T-023` | SYS-008／SD-004-I03／SD-004-S03 | Then 16經典和4盲書ID、區域、素材符合原稿；And 全文、卡片、字條、書籤與共鳴原文逐書相等；And 合法預覽合回原位且不推進 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-006` BlindBook | `RB4-T-028` | SYS-008／SD-004-I03／SD-004-S03 | Then 揭封前只有合法包裝三標籤；And 有效揭封後才投影該書內容；And 取消／重送不誤選、不揭另一方私密書；And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-007` InterestBadge | `RB4-T-034` | SYS-008／SD-004-I03／SD-004-S03 | Then 推薦貼紙只依本人已儲存興趣；And raw DTO不含對方興趣或未揭封內容；And 越權讀取拒絕且不快取私人資料 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-002` | `RB4-BDD-008` Resonance | `RB4-T-041` | SYS-008／SD-004-I03／SD-004-S03 | Then 只提交該書合法選項；And 原文內心獨白對本人呈現；And 他人看不到未分享共鳴且預覽不等於選擇 | 跨包共同成果：SD-002 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-009` VinylSync | `RB4-T-046` | SYS-008／SD-004-I04／SD-004-S04 | Then 共享曲目以權威版本同步；And 淡換及原文提示正確、不強制他方開聲音；And 背景停止播放器、回前景不自動播放 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-010` AmbientExplore | `RB4-T-050`、`RB4-T-051`、`RB4-T-052` | SYS-008／SD-004-I04／SD-004-S04 | Then 所有原文及合法區域可用；And 小黑板布丁伏筆保留；And 探索不阻塞對方、非必經主線 | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-011` FogWindow | `RB4-T-055`、`RB4-T-056`、`RB4-T-057` | SYS-008／SD-004-I04／SD-004-S04 | Then 擦霧純呈現不誤提交；And 符號由明確操作建立共享版本；And 離窗後／替換／轉場只依已確認生命週期投影 | 跨包共同成果：SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-003` | `RB4-BDD-012` FogWitness | `RB4-T-062` | SYS-008／SD-004-I04／SD-004-S04 | Then 前3種不計印章；And 只接受對方在窗區對目前版本的合法見證；And 成立事實保留到小票；替換／轉場／完成清可見符號；And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-013` SameDifferentBook | `RB4-T-068` | SYS-008／SD-004-I05／SD-004-S05 | Then 以已提交ID比對；And I走iv4-04-same或diff及原文；And 他人未提交時不揭露、不代選 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-014` TissueDistance | `RB4-T-074` | SYS-008／SD-004-I05／SD-004-S05 | Then 距離與原文cue依實際手勢；And A收不收面紙不等於是否聊天；And 錯區或重送不提交額外行為 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-015` GiveSpaceReverse | `RB4-T-080` | SYS-008／SD-004-I05／SD-004-S05 | Then I退開且A有獨立主動權；And 聊書與音樂進各自原節點；And A保持安靜走respect/quiet、無假聊天 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-004` | `RB4-BDD-016` DeclineApproach | `RB4-T-086` | SYS-008／SD-004-I05／SD-004-S05 | Then 依草稿對應route與原文；And 拒絕不出現假聊天及不強制撮合；And 安靜軌道仍能合法達導演 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-005` | `RB4-BDD-017` QuestionCard | `RB4-T-092` | SYS-008／SD-004-I05／SD-004-S05 | Then 同場重連不重抽；And 第一份答案只本人可見；And 雙方提交後同時揭曉同頻／反差、到warm節點；And HTTP／WS／事件回放不得泄漏未揭曉答案 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-005` | `RB4-BDD-018` QuestionCardGuard | `RB4-T-098` | SYS-008／SD-004-I05／SD-004-S05 | Then 拒非法操作且不變更revision；And 同ID同payload回原receipt、改payload409；And quiet路不被問答阻塞 | 跨包共同成果：SD-002 + SD-003 + SD-004；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-005` | `RB4-BDD-019` ChatSuggestions | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-005／SD-006） | 跨包產品支撐：SD-004-I01／SD-004-S01 | Then 各情境3句原文及合法篩選；And 未點不發送、點擊由真人送出；And 聊天仍可用且不冒充NPC或對方 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-006` | `RB4-BDD-020` ClerkPersona | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-006） | 跨包產品支撐：SD-004-I01／SD-004-S01 | Then 角色分眾原文與表情正確；And 阿澄赴入口防洪切電，不站原地觀望；And S/A×warm/quiet原文匹配且不代發真人訊息 | 跨包共同成果：SD-002 + SD-003 + SD-004 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |

### BDD 行為與產品實作分解

| BDD Scenario／條件或 Examples | 角色／Given | When／操作 | Then／And／But 各結果與副作用 | 實際產品 F-ID／符號／核心分支 | 必要 S／I／V／跨包成果 |
|---|---|---|---|---|---|
| `RB4-BDD-001` EnterStore（@happy-path @critical @frontend） | Given 兩位玩家各自釘選V4且尚未入店 | When I點門把且A點傘桶 | Then I與A分別到合法下一節點；And 另一方未操作前其Track不變；And 原場景融圖、門鈴與原文依角色呈現 | `F-03`、`F-06`、`F-10`：實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視 | `SD-004-S02`／`SD-004-I02`／`SD-004-V02`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-002` NavigateAreas（@happy-path @critical @frontend） | Given 本人可探索目前區域 | When 左右導航及小地圖選合法相鄰區 | Then 鏡位與Area依合法鄰接更新；And 暖金點只示本人合法未探索或新事件；And 不顯示平鋪移動按鈕海或漂浮星號 | `F-03`、`F-06`、`F-10`：實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視 | `SD-004-S02`／`SD-004-I02`／`SD-004-V02`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-003` DiscoverObjects（@boundary @critical @frontend） | Given 本場首次進區、其後再次進同區 | When 先觀看呼吸光再長按空白與放開 | Then 首次只提示一次；And 長按只短暫顯示合法物件輪廓；And 掃視、取消或重連不提交主線 | `F-03`、`F-06`、`F-10`：實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視 | `SD-004-S02`／`SD-004-I02`／`SD-004-V02`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-004` GestureFence（@error-handling @critical @frontend） | Given 鏡頭縮放、手勢衝突或請求pending | When 快速連點、滑動、拖出、取消或送舊revision | Then 一次合法意圖最多一次提交；And 無效命中或取消不提交且物件復位；And 409重新同步、未知結果只同ID查receipt | `F-01`、`F-02`、`F-10`：擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何 | `SD-004-S01`／`SD-004-I01`／`SD-004-V01`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-005` BookCatalog（@happy-path @critical @frontend） | Given 20本書正式目錄可用 | When 逐一在5區開書並翻至末頁 | Then 16經典和4盲書ID、區域、素材符合原稿；And 全文、卡片、字條、書籤與共鳴原文逐書相等；And 合法預覽合回原位且不推進 | `F-04`、`F-08`、`F-10`：實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-006` BlindBook（@happy-path @critical @frontend） | Given 4盲書尚未揭封 | When 滑動各封條、取消、成功揭封後重連 | Then 揭封前只有合法包裝三標籤；And 有效揭封後才投影該書內容；And 取消／重送不誤選、不揭另一方私密書；And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文 | `F-04`、`F-08`、`F-10`：實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-007` InterestBadge（@error-handling @critical @frontend） | Given 雙方有不同未公開興趣 | When 以本人身份讀書架或竄改owner | Then 推薦貼紙只依本人已儲存興趣；And raw DTO不含對方興趣或未揭封內容；And 越權讀取拒絕且不快取私人資料 | `F-04`、`F-08`、`F-10`：實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-008` Resonance（@happy-path @critical @frontend） | Given A選定草稿任一本書 | When 逐一選該書三項共鳴之一 | Then 只提交該書合法選項；And 原文內心獨白對本人呈現；And 他人看不到未分享共鳴且預覽不等於選擇 | `F-04`、`F-08`、`F-10`：實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`（跨包鏈：SD-002→SD-004→SD-006） |
| `RB4-BDD-009` VinylSync（@happy-path @critical @frontend） | Given 兩方均在本場且各自音效偏好不同 | When 合法切換3曲並重連 | Then 共享曲目以權威版本同步；And 淡換及原文提示正確、不強制他方開聲音；And 背景停止播放器、回前景不自動播放 | `F-05`、`F-06`、`F-10`：實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-010` AmbientExplore（@alternative-path @critical @frontend） | Given 玩家等待對方主線操作 | When 查看小黑板、5則留言及阿澄3話題 | Then 所有原文及合法區域可用；And 小黑板布丁伏筆保留；And 探索不阻塞對方、非必經主線 | `F-05`、`F-06`、`F-10`：實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-011` FogWindow（@happy-path @critical @frontend） | Given 窗區可見雨勢 | When 擦霧查看3階段雨勢並留下4種合法符號 | Then 擦霧純呈現不誤提交；And 符號由明確操作建立共享版本；And 離窗後／替換／轉場只依已確認生命週期投影 | `F-05`、`F-06`、`F-10`：實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`（跨包鏈：SD-004→SD-006） |
| `RB4-BDD-012` FogWitness（@boundary @critical @frontend） | Given 窗區符號存在且對方尚未見證 | When 背景讀取、同作者見證、舊符號見證及對方實際呈現 | Then 前3種不計印章；And 只接受對方在窗區對目前版本的合法見證；And 成立事實保留到小票；替換／轉場／完成清可見符號；And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤 | `F-05`、`F-06`、`F-10`：實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-013` SameDifferentBook（@happy-path @critical @frontend） | Given 兩人各自完成正式選書 | When 測同一本與不同一本兩路 | Then 以已提交ID比對；And I走iv4-04-same或diff及原文；And 他人未提交時不揭露、不代選 | `F-07`、`F-09`、`F-10`：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-014` TissueDistance（@happy-path @critical @frontend） | Given I可接近閱讀角 | When 拖面紙到近／遠合法位置後A各選收下／不用 | Then 距離與原文cue依實際手勢；And A收不收面紙不等於是否聊天；And 錯區或重送不提交額外行為 | `F-07`、`F-09`、`F-10`：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-015` GiveSpaceReverse（@alternative-path @critical @frontend） | Given I選扶書籤留白 | When A各選主動聊書／音樂／保持安靜 | Then I退開且A有獨立主動權；And 聊書與音樂進各自原節點；And A保持安靜走respect/quiet、無假聊天 | `F-07`、`F-09`、`F-10`：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-016` DeclineApproach（@alternative-path @critical @frontend） | Given I選面紙或借書接近 | When A選open-up／books-only／decline | Then 依草稿對應route與原文；And 拒絕不出現假聊天及不強制撮合；And 安靜軌道仍能合法達導演 | `F-07`、`F-09`、`F-10`：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-017` QuestionCard（@happy-path @critical @frontend） | Given 雙方已進warm-track | When 依場次種子從4題釘選1題並各自回答 | Then 同場重連不重抽；And 第一份答案只本人可見；And 雙方提交後同時揭曉同頻／反差、到warm節點；And HTTP／WS／事件回放不得泄漏未揭曉答案 | `F-07`、`F-09`、`F-10`：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`（跨包鏈：SD-002→SD-003→SD-004→SD-006） |
| `RB4-BDD-018` QuestionCardGuard（@error-handling @critical） | Given 安靜軌道或他方未回答 | When 竄改題ID、他方答案、重送或提前查揭曉 | Then 拒非法操作且不變更revision；And 同ID同payload回原receipt、改payload409；And quiet路不被問答阻塞 | `F-07`、`F-09`、`F-10`：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`（跨包鏈：SD-002→SD-003→SD-004） |
| `RB4-BDD-019` ChatSuggestions（@happy-path @critical @frontend） | Given 劇情依8個適用情境進展 | When 逐情境打開聊天、點一則或自由聊天 | Then 各情境3句原文及合法篩選；And 未點不發送、點擊由真人送出；And 聊天仍可用且不冒充NPC或對方 | `F-01`、`F-02`、`F-10`：擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何 | `SD-004-S01`／`SD-004-I01`／`SD-004-V01`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-020` ClerkPersona（@happy-path @critical @frontend） | Given I熟客與A避雨生客各自入店 | When 各試3種招呼及4組危機後致謝 | Then 角色分眾原文與表情正確；And 阿澄赴入口防洪切電，不站原地觀望；And S/A×warm/quiet原文匹配且不代發真人訊息 | `F-01`、`F-02`、`F-10`：擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何 | `SD-004-S01`／`SD-004-I01`／`SD-004-V01`（跨包鏈：SD-002→SD-003→SD-006） |

## 用戶故事

作為剛進入雨聲書店的玩家，我想要直接點擊門把或傘桶入店、用左右導引或小地圖逛 5 個書區、橫滑書櫃抽出感興趣的經典或親手撕開牛皮紙盲書、擦開起霧玻璃看雨並自然選擇是否遞面紙或安靜看書，以便享受沉浸且不被按鈕海打斷的相遇前半場。

## 畫面操作／系統處理流程

1. 入店與空間導覽（`RB4-BDD-001`～`004`）：`EmbeddedSceneStage` 依當前 `areaId` 渲染背景與嵌入式物件，首次進入新區域顯示 1 次柔和輪廓呼吸光；長按空白 `>= 380ms` 短暫浮現合法互動物件輪廓，放開即收；`BookshopMinimapOverlay` 提供左右鄰接箭頭與右上角可收合手繪小地圖（暖金點僅亮於 `minimap.highlightedAreas`）。
2. 橫滑書牆與盲書撕封（`RB4-BDD-005`～`008`）：點擊書櫃／書台開啟 `ShelfCloseupDrawer`，水平滑動瀏覽立體書脊（含本人柔和興趣貼紙）；點擊未撕盲書顯示牛皮紙封套，沿虛線滑動 `>= 65%` 送出 `unseal-blind-book`（未達門檻放開彈回不送出）；展開 `SceneBook` 本地翻閱封面、阿澄推薦卡、3–4 頁原文與末頁便條，點擊確定選書與 3 共鳴才送出權威命令。
3. 空間彩蛋與雙向破冰（`RB4-BDD-009`～`020`）：點擊黑膠、小黑板、留言冊、阿澄或雨窗開啟 `AmbientInteractableModal`（擦霧純本地遮罩，選留符號送出命令；同伴在 `window` 前景實際渲染出對方符號時觸發一次 `witness-fog-symbol`）；閱讀角透過 `SceneWorldObjects` 拖放面紙至近／遠放置槽，透過 `SceneEventActions` 完成借書、留白反向主動、獨處退讓與雨天提問卡作答／同時揭曉。

### 畫面、元件與互動分解（適用時）

| 畫面／區域／角色／BDD | 實際頁面、元件、handler／F-ID | 布局、內容、素材與操作／手勢 | 狀態、導覽、禁用／錯誤／重試 | API／事件、權威狀態與平台差異 | 必要 S／I／V、可重現操作與視覺驗收 |
|---|---|---|---|---|---|
| `RB4-BDD-001` EnterStore（雙角色視角） | `F-03`、`F-06`、`F-10`（對應步驟 `SD-004-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 I點門把且A點傘桶，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S02`／`SD-004-I02`／`SD-004-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-002` NavigateAreas（雙角色視角） | `F-03`、`F-06`、`F-10`（對應步驟 `SD-004-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 左右導航及小地圖選合法相鄰區，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S02`／`SD-004-I02`／`SD-004-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-003` DiscoverObjects（雙角色視角） | `F-03`、`F-06`、`F-10`（對應步驟 `SD-004-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 先觀看呼吸光再長按空白與放開，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S02`／`SD-004-I02`／`SD-004-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-004` GestureFence（雙角色視角） | `F-01`、`F-02`、`F-10`（對應步驟 `SD-004-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 快速連點、滑動、拖出、取消或送舊revision，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S01`／`SD-004-I01`／`SD-004-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-005` BookCatalog（雙角色視角） | `F-04`、`F-08`、`F-10`（對應步驟 `SD-004-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐一在5區開書並翻至末頁，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-006` BlindBook（雙角色視角） | `F-04`、`F-08`、`F-10`（對應步驟 `SD-004-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 滑動各封條、取消、成功揭封後重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-007` InterestBadge（雙角色視角） | `F-04`、`F-08`、`F-10`（對應步驟 `SD-004-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 以本人身份讀書架或竄改owner，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-008` Resonance（雙角色視角） | `F-04`、`F-08`、`F-10`（對應步驟 `SD-004-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐一選該書三項共鳴之一，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S03`／`SD-004-I03`／`SD-004-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-009` VinylSync（雙角色視角） | `F-05`、`F-06`、`F-10`（對應步驟 `SD-004-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 合法切換3曲並重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-010` AmbientExplore（雙角色視角） | `F-05`、`F-06`、`F-10`（對應步驟 `SD-004-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 查看小黑板、5則留言及阿澄3話題，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-011` FogWindow（雙角色視角） | `F-05`、`F-06`、`F-10`（對應步驟 `SD-004-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 擦霧查看3階段雨勢並留下4種合法符號，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-012` FogWitness（雙角色視角） | `F-05`、`F-06`、`F-10`（對應步驟 `SD-004-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 背景讀取、同作者見證、舊符號見證及對方實際呈現，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S04`／`SD-004-I04`／`SD-004-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-013` SameDifferentBook（雙角色視角） | `F-07`、`F-09`、`F-10`（對應步驟 `SD-004-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 測同一本與不同一本兩路，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-014` TissueDistance（雙角色視角） | `F-07`、`F-09`、`F-10`（對應步驟 `SD-004-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 拖面紙到近／遠合法位置後A各選收下／不用，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-015` GiveSpaceReverse（雙角色視角） | `F-07`、`F-09`、`F-10`（對應步驟 `SD-004-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 A各選主動聊書／音樂／保持安靜，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-016` DeclineApproach（雙角色視角） | `F-07`、`F-09`、`F-10`（對應步驟 `SD-004-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 A選open-up／books-only／decline，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-017` QuestionCard（雙角色視角） | `F-07`、`F-09`、`F-10`（對應步驟 `SD-004-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 依場次種子從4題釘選1題並各自回答，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S05`／`SD-004-I05`／`SD-004-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-019` ChatSuggestions（雙角色視角） | `F-01`、`F-02`、`F-10`（對應步驟 `SD-004-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐情境打開聊天、點一則或自由聊天，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S01`／`SD-004-I01`／`SD-004-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-020` ClerkPersona（雙角色視角） | `F-01`、`F-02`、`F-10`（對應步驟 `SD-004-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 各試3種招呼及4組危機後致謝，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-004-S01`／`SD-004-I01`／`SD-004-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |

## 技術規範與實作設計

### 架構、DDD 與責任

對應 `SYS-008` 前半與契約 `CNT-002`、`CNT-003`。所有檔案嚴格遵循專案既有平面結構放置於 `frontend/client/src/*.ts(x)`，單元測試放置於 `frontend/client/tests/unit/scene-v4-half1.test.tsx`。本包定義並匯出完整 V4 TypeScript 介面與元件 Props，供 `SD-005` 在 `StoryStage.tsx`、`ADVStage.tsx` 與 `StoryExperienceScreen.tsx` 唯讀引用組裝。

### 重要函式、核心邏輯與狀態

| 核心 ID／目標類別或函式 | 輸入／輸出與前後置條件 | 演算法／分支／偽碼 | 交易／併發／冪等／重試 | 錯誤語意／驗證 |
|---|---|---|---|---|
| ` classifyStageGesture`（`frontend/client/src/scene-stage.ts`） | 輸入：指標／觸控起點、位移 `(dx, dy)`、經過毫秒、目標區域與是否多指；輸出：`tap | long-press | horizontal-pan | unseal-swipe | drag | cancel` | 短點 `< 220ms && hypot < 8px`；長按掃視 `>= 380ms && hypot < 10px`；橫滑 `|dx| > 14px && |dx| > 1.5*|dy|`；撕封沿封條軸跨越 `>= 65%` 寬度；多指、離開邊界或 `disabled` 立即回 `cancel` | 純客戶端互動分類，任何 `cancel` 或預覽均 0 網路請求 | 忙碌中 `busy` 或素材未就緒時全面鎖定提交，防止連點重送；由 `SD-004-V01` 驗證 |
| `ShelfCloseupDrawer` & `SceneBook` V4 狀態機 | 輸入：本人可見 `books[]`（盲書未撕無書名全文）、本人貼紙標記、結局 `partnerBookmark?`、`onSubmitAction`；輸出：原位展開／翻頁／撕封提交 | 本地 `page` 翻頁與橫滑偏移不送 API；撕封滑軌未過 65% 放手以 `Animated.spring` 回彈；移除舊寫死「心動迴路原創試讀」改讀 `uiCopy`；僅當 `partnerBookmark` 存在（結局 2）時渲染牛皮書籤插頁 | 重連或收到新快照時依已揭封狀態平滑切換真書封，不丟失當前閱讀位置 | 未揭封盲書 DOM/樹中 0 真書名字串；由 `SD-004-V03` 驗證 |
| `AmbientInteractableModal` 霧窗擦霧與前景見證觸發器 | 輸入：`ambientState.fogSymbol`、本人 `areaId`、視窗前景焦點 `focused`、`onWitness`；輸出：擦霧視覺與受控見證呼叫 | 手指擦拭僅更新本地透明度格網觀測 3 階段雨勢；當 `areaId === "window" && focused && fogSymbol?.active && fogSymbol.authorRole !== myRole` 且符號圖片實際 `onLoad` 渲染完成後，對同一 `symbolRevision` 至多觸發一次 `onWitness(symbolRevision)` | 本地 `witnessedRevisions` Set 防重送，伺服器端再以 CAS 冪等把關 | 背景分頁、失焦或本人畫的符號絕不觸發見證；由 `SD-004-V04` 驗證 |

### 契約、資料與平台

- **契約與版本**：嚴格對齊 [01-system-design.md](../01-system-design.md#契約與資料設計) 定義之 `CNT-001`（`scene-event.v3`）、`CNT-002`（動作白名單＋書籤 `0..20` Unicode scalar）、`CNT-003`（actor-scoped 快照＋單人 `own_profile` 興趣）與 `CNT-004`（私有 `story.framework.system.reconcile`）。
- **資料庫與儲存限制**：維持 `0001`～`0007` **21 張表、0 新欄、0 SQL Trigger、0 新增公開 HTTP 路由**；維持 `world_state_json <= 16,384`、`state_json <= 16,384`、manifest `<= 512KiB`／`4MiB`、素材 `<= 8MiB`、可達狀態 `<= 50,000`。
- **平台與安全範圍**：目標平台為 **Web** 與 **Android**（依 `D-051`/`D-052` 排除 iOS 與無障礙專項）；嚴禁記錄或輸出任何密碼、驗證碼、Google/Session token、Cookie 或私人照片位元組；本地維運一律經 `tools/local.mjs` 操作已知 local instance，嚴禁 `--remote`。

### 共用與改動合理性

- 100% 沿用既有認證、配對、聊天、16 款內建全身與私人靜態四姿態化身系統（執行期 **0 次 Gemini 呼叫**）。
- 本包可寫檔案清單與其餘 6 份 SD 分項完全互斥（單一寫入者），避免並行覆寫衝突並最小化對既有 V3 回歸面之影響。

## 檔案改動設計

### F-01：`frontend/client/src/scene-event-track.ts`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`isTrackExperience`、`TrackExperienceFields` 及 V4 新增完整型別（第 1–26 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`,`CNT-002`,`CNT-003`／`RB4-AC-001`～`011`／`SD-004-D01`,`I01`／`SD-004-S01`
- 改動要點與必要核心邏輯：擴充 `isTrackExperience` 同時認列 `scene-event.v2` 與 `scene-event.v3`；完整定義前後半共用型別：`MinimapProjection`、`V4BookProjection`（含盲書封套、興趣貼紙、`partnerBookmark`）、`AmbientStateProjection`、`QuestionCardProjection`、`TimedRescueProjection`、`EndingSummaryProjection`、`MemoryReceiptProjection`、`UiCopyProjection` 與 `submit-bookmark` 0–20 scalar payload 驗證
- 此檔案的責任與白話設計原因：在單一型別入口鎖定 `SD-004` 與 `SD-005` 共用的完整 `CNT-003` 契約，避免跨包雙寫
- 輸入／輸出、介面及契約限制：匯出 TypeScript 型別、`trackActionPayload` 與 `SceneCueFence`
- 前置依賴：`SD-001-S07` 完成
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入（`SD-005` 唯讀引用）
- 驗證方式與預期結果：`npm --prefix frontend/client run typecheck && npm run test:client`（`SD-004-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-02：`frontend/client/src/scene-stage.ts`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：新增 `classifyStageGesture`、V4 8 區幾何與輪廓掃視計算（第 1–105 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`／`RB4-BDD-001`～`004`／`SD-004-D01`,`I01`／`SD-004-S01`
- 改動要點與必要核心邏輯：實作短點／長按／橫滑／撕封／拖放互斥分類純函式、首次入區呼吸光追蹤器（以 `storySessionId:role:areaId` 為鍵每區僅 1 次）及 `eaves-corridor` 等 8 區鏡頭對齊計算
- 此檔案的責任與白話設計原因：讓 Web 滑鼠與 Android 觸控共用同一套可純單元測試的幾何與手勢護欄
- 輸入／輸出、介面及契約限制：輸入座標與手勢事件數據；輸出手勢分類與舞台矩形
- 前置依賴：`F-01`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-03：`frontend/client/src/BookshopMinimapOverlay.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`BookshopMinimapOverlay` 元件（左右極簡鄰接導引＋右上可收合手繪小地圖）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`／`RB4-BDD-002`／`SD-004-D01`,`I02`／`SD-004-S02`
- 改動要點與必要核心邏輯：渲染畫面左右邊緣半透明鄰接區導引膠囊與可展開／收合手繪書店小地圖；僅對本人 `minimap.highlightedAreas` 顯示柔和暖金微光點，不渲染舊式平鋪按鈕列
- 此檔案的責任與白話設計原因：實現去按鈕化空間導覽與自然探索動線
- 輸入／輸出、介面及契約限制：Props：`minimap`、`currentAreaId`、`disabled`、`onNavigate(areaId)`
- 前置依賴：`F-01`、`F-02`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V02`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-04：`frontend/client/src/ShelfCloseupDrawer.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`ShelfCloseupDrawer` 元件（5 區橫滑書牆特寫＋盲書虛線撕封＋本人興趣貼紙）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`,`002`／`RB4-BDD-005`～`007`／`SD-004-D02`,`I03`／`SD-004-S03`
- 改動要點與必要核心邏輯：以 `bg-shelves-closeup-v4` 為基底呈現當前區域書籍立體書脊支援橫滑檢視、顯示本人柔和興趣貼紙；點擊盲書呈現 `prop-blind-kraft-v4` 與 3 標籤並支援沿虛線滑動 `>=65%` 撕封（中途放開回彈取消）
- 此檔案的責任與白話設計原因：承載 20 本書原位探索與牛皮紙盲書儀式感手勢
- 輸入／輸出、介面及契約限制：Props：`areaId`、`books`、`asset`、`disabled`、`onOpenBook`、`onUnsealBlindBook`、`onClose`
- 前置依賴：`F-01`、`F-02`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-05：`frontend/client/src/AmbientInteractableModal.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`AmbientInteractableModal` 元件（黑膠 3 曲、小黑板、留言冊、阿澄閒聊、起霧雨窗擦霧與前景見證）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-003`,`006`／`RB4-BDD-009`～`012`,`020`／`SD-004-D03`,`I04`／`SD-004-S04`
- 改動要點與必要核心邏輯：提供黑膠唱片機 3 曲切換、今日特調小黑板、5 則訪客留言冊翻頁、阿澄 3 話題對話，以及起霧雨窗本地擦霧觀測 3 階段雨勢、4 種符號選留與同伴窗區前景實際渲染完成後之 `onWitness` 觸發
- 此檔案的責任與白話設計原因：集中管理 5 項非阻塞空間感官彩蛋，隨時可關閉回舞台
- 輸入／輸出、介面及契約限制：Props：`activeTarget`、`ambientState`、`myRole`、`focused`、`asset`、`disabled`、`onAction`、`onClose`
- 前置依賴：`F-01`、`F-02`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V04`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-06：`frontend/client/src/EmbeddedSceneStage.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`EmbeddedSceneStage`（第 18–54 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`～`003`／`RB4-BDD-001`,`003`,`004`,`012`／`SD-004-D01`,`D03`,`I02`,`I04`／`SD-004-S02`,`S04`
- 改動要點與必要核心邏輯：整合 V4 首次入區 1 次柔和邊緣呼吸光、長按空白處浮現可互動物件輪廓（放開即收，無漂浮星號）、門把／傘桶／書牆／彩蛋原位點擊分派，以及窗區玻璃上當前共享符號的前景渲染與見證回呼
- 此檔案的責任與白話設計原因：在既有統一鏡頭座標與 `hitMask` 舞台上實現原位互動與前景見證
- 輸入／輸出、介面及契約限制：向後相容既有 `v2` props 並新增 V4 呼吸光／掃視／見證可選 props
- 前置依賴：`F-02`～`F-05`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V02`,`V04`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-07：`frontend/client/src/SceneWorldObjects.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`DraggableObject`、`SceneWorldObjects`（第 16–36 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-004`／`RB4-BDD-014`／`SD-004-D04`,`I05`／`SD-004-S05`
- 改動要點與必要核心邏輯：擴充支援閱讀角面紙雙放置區（`near` 近處桌面／`far` 遠處桌角）拖放落點判定與預覽提示，未落入目標槽平滑彈回原位不誤送
- 此檔案的責任與白話設計原因：重用既有 `PanResponder` + `measureInWindow` 架構實現有距離感溫度的遞面紙互動
- 輸入／輸出、介面及契約限制：擴充 `slots` 支援多目標槽 ID 回傳 `onDrop(objectId, slotId)`
- 前置依賴：`F-01`、`F-02`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-08：`frontend/client/src/SceneBook.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`SceneBook`（第 4–26 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-002`,`010`／`RB4-BDD-005`,`008`,`039`／`SD-004-D02`,`I03`／`SD-004-S03`
- 改動要點與必要核心邏輯：在 `v3` 模式下移除寫死之「心動迴路原創試讀」，依書籍資料呈現 16 經典／已撕盲書之阿澄推薦卡、3–4 頁原文、末頁匿名讀者字條、選書與 3 項共鳴按鈕，以及結局 2 專屬 `partnerBookmark` 牛皮書籤插頁；純翻頁與合書 0 網路提交
- 此檔案的責任與白話設計原因：忠實呈現原稿書籍全部文字細節並支援結局 2 桌上翻書儀式
- 輸入／輸出、介面及契約限制：擴充 `PublishedBook` 相容 `V4BookProjection` 與共鳴選取回呼
- 前置依賴：`F-01`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-09：`frontend/client/src/SceneEventActions.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`SceneEventActions`（第 7–28 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`,`004`,`005`／`RB4-BDD-002`,`013`～`018`／`SD-004-D04`,`I05`／`SD-004-S05`
- 改動要點與必要核心邏輯：當 `schemaVersion === "scene-event.v3"` 時隱藏第 14–17 行舊式水平區域移動按鈕列（改由 `BookshopMinimapOverlay` 導覽），呈現閱讀角同異書破冰選項、輕扶書籤留白、Acceptor 反向主動搭話、獨處溫柔退讓與雨天提問卡 4 題私密提交／等待／同時揭曉面板
- 此檔案的責任與白話設計原因：消除舊版按鈕海，同時清晰承載雙向破冰與提問卡互動
- 輸入／輸出、介面及契約限制：維持既有 `SceneEventActions` 介面並渲染 `questionCard` 子區塊
- 前置依賴：`F-01`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-10：`frontend/client/tests/unit/scene-v4-half1.test.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：V4 前半探索、手勢護欄、書牆盲書、霧窗見證與雙向破冰前端單元測試套件
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／涵蓋本包全部前端 Unit TDD／`SD-004-I01`～`I05`／`SD-004-S01`～`S05`
- 改動要點與必要核心邏輯：使用 Vitest + Testing Library 測試手勢互斥分類、小地圖暖金點、首次呼吸光不重複、長按掃視放開即收、盲書撕封中途取消不送出、本人興趣貼紙、翻書不誤送、霧窗前景見證條件、近遠面紙與提問卡雙盲 UI
- 此檔案的責任與白話設計原因：在組裝與雙端 E2E 前，100% 鎖定前半所有互動元件與副作用護欄
- 輸入／輸出、介面及契約限制：Vitest 元件測試套件
- 前置依賴：`F-01`～`F-09`
- 寫入責任、共用責任與可寫區段：`SD-004` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-004-V01`～`V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）


## 有序實作與驗證步驟

### 步驟順序與起始關卡

| 步驟 ID／成果 | 唯一負責 I-ID／來源 | 前置步驟及所需結果／跨包契約 | F-ID／V-ID | 通過後可開始的下一步／條件 | 執行狀態／證據位置 |
|---|---|---|---|---|---|
| `SD-004-S01`／擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何 | `SD-004-I01`（`RB4-T-016`,`RB4-T-017`,`RB4-T-018`） | `SD-001-S07` 完成（可與 `SD-002`、`SD-003` 安全並行） | `F-01`、`F-02`、`F-10`／`SD-004-V01` | `SD-004-S02` | `Planned`；證據待回填 |
| `SD-004-S02`／實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視 | `SD-004-I02`（`RB4-T-003`,`RB4-T-008`,`RB4-T-011`,`RB4-T-012`,`RB4-T-013`） | `SD-004-S01` 通過 | `F-03`、`F-06`、`F-10`／`SD-004-V02` | `SD-004-S03` | `Planned`；證據待回填 |
| `SD-004-S03`／實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀 | `SD-004-I03`（`RB4-T-023`,`RB4-T-028`,`RB4-T-034`,`RB4-T-041`） | `SD-004-S02` 通過 | `F-04`、`F-08`、`F-10`／`SD-004-V03` | `SD-004-S04` | `Planned`；證據待回填 |
| `SD-004-S04`／實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證 | `SD-004-I04`（`RB4-T-046`,`RB4-T-050`,`RB4-T-051`,`RB4-T-052`…等 8 項 TDD） | `SD-004-S03` 通過 | `F-05`、`F-06`、`F-10`／`SD-004-V04` | `SD-004-S05` | `Planned`；證據待回填 |
| `SD-004-S05`／擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI | `SD-004-I05`（`RB4-T-068`,`RB4-T-074`,`RB4-T-080`,`RB4-T-086`,`RB4-T-092`,`RB4-T-098`） | `SD-004-S04` 通過 | `F-07`、`F-09`、`F-10`／`SD-004-V05` | 移交前半全部元件與 `scene-event-track.ts` 型別予 `SD-005` 進行後半與頂層組裝 | `Planned`；證據待回填 |

### SD-004-S01：擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何

**對應成果與責任**：唯一負責 `SD-004-I01`；對應 TDD：`RB4-T-016`、`RB4-T-017`、`RB4-T-018`；涉及檔案：`F-01`、`F-02`、`F-10`；驗證 ID：`SD-004-V01`；由 `SD-004` 執行者負責。  
**開始條件與前置證據**：`SD-001-S07` 完成（可與 `SD-002`、`SD-003` 安全並行）。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/scene-event-track.ts`、`scene-stage.ts`、`contracts/rain-bookshop-v4.json`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：修改 `F-01`、`F-02`，新增 `F-10`；禁止修改 `StoryExperienceScreen.tsx`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-01`、`F-02`、`F-10` 落實「擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：更新 `isTrackExperience` 支援 `scene-event.v3`，定義全套 V4 快照型別與書籤 `0..20` scalar 前端預檢；於 `scene-stage.ts` 實作 `classifyStageGesture`（短點、長按掃視、橫滑、65% 撕封、拖放與多指／越界取消）及每區首次呼吸光記憶輔助器。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C01-1`／正常（`RB4-BDD-004`） | 分別輸入 150ms 短點、400ms 靜止長按、水平 `dx=40, dy=5` 橫滑與跨越 70% 撕封軌跡 | 精確回傳 `tap`、`long-press`、`horizontal-pan`、`unseal-swipe` | `v2` 與 `v3` 快照皆通過 `isTrackExperience` 判定 | `SD-004-V01`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |
| `C01-2`／護欄邊界（取消與忙碌鎖定） | 撕封滑至 60% 放手、雙指觸控、`disabled=true` 時連點兩次 | 一律回傳 `cancel` 且 0 次觸發提交回呼 | 徹底阻擋誤觸與連點重送 | `SD-004-V01`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `scene-v4-half1.test.tsx` 撰寫 `v3` 型別與手勢互斥斷言 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 因 `v3` 未被 `isTrackExperience` 接受且無 `classifyStageGesture` 而失敗 | 待回填 |
| 2／Green | 實作 `F-01`、`F-02` 型別與手勢幾何分類器 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 手勢與型別單元測試通過 | 待回填 |
| 3／Refactor 與回歸 | 執行前端 TypeScript 檢查與既有 `scene-event-track.test.ts` 回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run typecheck && npm --prefix frontend/client test -- scene-event-track` | 0 型別錯誤且既有測試通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-01`、`F-02`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-004-S02`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-004-S02：實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視

**對應成果與責任**：唯一負責 `SD-004-I02`；對應 TDD：`RB4-T-003`、`RB4-T-008`、`RB4-T-011`、`RB4-T-012`、`RB4-T-013`；涉及檔案：`F-03`、`F-06`、`F-10`；驗證 ID：`SD-004-V02`；由 `SD-004` 執行者負責。  
**開始條件與前置證據**：`SD-004-S01` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/EmbeddedSceneStage.tsx`、`contracts/scene-hit-mask.ts`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：新增 `F-03`，修改 `F-06`、`F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-03`、`F-06`、`F-10` 落實「實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：實作左右鄰接導引與右上收合手繪小地圖（僅本人合法 `highlightedAreas` 亮暖金點）；於 `EmbeddedSceneStage` 實作門把／傘桶原位命中、首次入區 1 次邊緣呼吸光與長按空白短暫顯示可互動物件輪廓（無任何 `✧` 漂浮星號）。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C02-1`／正常（`RB4-BDD-001`～`003`） | 渲染 `street-view` 點門把／傘桶，進入 `entrance` 檢查首次呼吸光、展開小地圖點擊 `shelves`、長按空白 400ms 後放開 | 命中正確 `objectId`、首次呼吸光只播 1 次（重渲染不重播）、暖金點僅亮合法區、長按浮現輪廓且放開即消失 | 畫面中 0 個舊式漂浮星號或移動按鈕海 | `SD-004-V02`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |
| `C02-2`／錯誤與邊界 | 點擊透明背景非物件遮罩像素、或點擊小地圖中非鄰接／禁用區域 | 不觸發 `onInspect` 或 `onNavigate` | 嚴格遵守多邊形遮罩與合法鄰接限制 | `SD-004-V02`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增小地圖暖金點、首次呼吸光與長按掃視元件測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | `BookshopMinimapOverlay` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-03` 與擴充 `F-06` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 入店、小地圖與掃視測試通過 | 待回填 |
| 3／Refactor 與回歸 | 重跑既有 `embedded-scene-stage.test.tsx` 確認 V3 相容 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- embedded-scene-stage` | 既有舞台測試全綠 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-03`、`F-06`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-004-S03`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-004-S03：實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀

**對應成果與責任**：唯一負責 `SD-004-I03`；對應 TDD：`RB4-T-023`、`RB4-T-028`、`RB4-T-034`、`RB4-T-041`；涉及檔案：`F-04`、`F-08`、`F-10`；驗證 ID：`SD-004-V03`；由 `SD-004` 執行者負責。  
**開始條件與前置證據**：`SD-004-S02` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/SceneBook.tsx`、`docs/requirements/rain-bookshop-v4-draft.json`（`scene.books`、`uiCopy`），以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：新增 `F-04`，修改 `F-08`、`F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-04`、`F-08`、`F-10` 落實「實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：實作橫滑書牆特寫與本人柔和興趣貼紙渲染；實作牛皮紙盲書 3 標籤展示與虛線滑動撕封（`>=65%` 送出，不足回彈取消）；擴充 `SceneBook` 移除寫死「心動迴路原創試讀」，完整呈現推薦卡、3–4 頁原文、末頁讀者字條、3 共鳴按鈕與結局 2 `partnerBookmark` 牛皮書籤頁。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C03-1`／正常（`RB4-BDD-005`～`008`,`039`） | 橫滑書牆檢視本人興趣貼紙、滑動盲書封條 75% 撕封、開書翻至末頁查看便條、測試結局 2 `partnerBookmark` 顯示 | 撕封觸發 `onUnsealBlindBook`、書頁原文與推薦卡／便條完整顯示、純翻頁與合書 0 次觸發提交、結局 2 正確顯示牛皮書籤 | 無殘留「心動迴路原創試讀」寫死字串 | `SD-004-V03`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |
| `C03-2`／取消與私密保護 | 渲染未撕盲書並滑動 40% 放手；渲染結局 1/3（無 `partnerBookmark`）開書 | 未撕盲書僅見 3 標籤、放手回彈 0 次送出；結局 1/3 無對方書籤頁 | 徹底防止誤選與未授權書籤顯示 | `SD-004-V03`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增書牆橫滑、盲書撕封取消與 `SceneBook` V4 欄位測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | `ShelfCloseupDrawer` 與 V4 書頁欄位尚未實作而失敗 | 待回填 |
| 2／Green | 實作 `F-04` 與修改 `F-08` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 書牆、盲書與試讀測試全數通過 | 待回填 |
| 3／Refactor 與回歸 | 重跑既有 `scene-book.test.tsx` 確認 V3 翻書動畫無回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-book` | 既有書籍測試通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-04`、`F-08`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-004-S04`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-004-S04：實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證

**對應成果與責任**：唯一負責 `SD-004-I04`；對應 TDD：`RB4-T-046`、`RB4-T-050`、`RB4-T-051`、`RB4-T-052`、`RB4-T-055`、`RB4-T-056`、`RB4-T-057`、`RB4-T-062`；涉及檔案：`F-05`、`F-06`、`F-10`；驗證 ID：`SD-004-V04`；由 `SD-004` 執行者負責。  
**開始條件與前置證據**：`SD-004-S03` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `docs/requirements/rain-bookshop-v4-draft.json`（`ambientInteractables`、`npcs`）、`RiskAudit RA-06`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：新增 `F-05`，修改 `F-06`、`F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-05`、`F-06`、`F-10` 落實「實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：實作黑膠 3 曲選播面板、今日雨天特調小黑板、閱讀角 5 則訪客留言冊、阿澄 3 話題閒聊，以及起霧雨窗擦霧（純本地視覺觀測 3 階段雨勢，0 網路請求）、4 符號明確選留按鈕，與同伴在 `window` 前景焦點下符號圖層實際渲染完成後觸發一次 `witness-fog-symbol(symbolRevision)`。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C04-1`／正常（`RB4-BDD-009`～`012`,`020`） | 擦霧檢視雨勢、選擇留下符號、切換為同伴視角在 `window` 且 `focused=true` 觸發符號圖片 `onLoad` | 純擦霧 0 次送出 API；留符號送出 1 次；同伴前景渲染觸發 1 次 `witness-fog-symbol` 且重複渲染同版本不再重送 | 小黑板、留言冊 5 則與阿澄 3 話題原文完整且隨時可關 | `SD-004-V04`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |
| `C04-2`／防偽護欄（`RA-06`） | 設 `focused=false`（背景分頁）、`areaId="counter"` 或 `authorRole === myRole` 渲染霧窗 | 0 次觸發 `onWitness` | 背景與本人絕不誤送見證 | `SD-004-V04`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增 5 項彩蛋與霧窗擦霧／前景見證防偽測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | `AmbientInteractableModal` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-05` 並串接 `F-06` 窗區符號渲染回呼 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 全部空間彩蛋與見證測試通過 | 待回填 |
| 3／Refactor 與回歸 | 執行 `npm --prefix frontend/client run typecheck` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run typecheck` | 0 型別錯誤 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-05`、`F-06`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-004-S05`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-004-S05：擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI

**對應成果與責任**：唯一負責 `SD-004-I05`；對應 TDD：`RB4-T-068`、`RB4-T-074`、`RB4-T-080`、`RB4-T-086`、`RB4-T-092`、`RB4-T-098`；涉及檔案：`F-07`、`F-09`、`F-10`；驗證 ID：`SD-004-V05`；由 `SD-004` 執行者負責。  
**開始條件與前置證據**：`SD-004-S04` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/SceneWorldObjects.tsx`、`SceneEventActions.tsx`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：修改 `F-07`、`F-09`、`F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-07`、`F-09`、`F-10` 落實「擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：擴充 `SceneWorldObjects` 支援面紙拖放至近處／遠處雙目標槽與槽外放手彈回；修改 `SceneEventActions` 在 `v3` 下隱藏舊移動按鈕列，渲染同異書破冰、留白後 Acceptor 主動按鈕、獨處溫柔退讓提示，以及雨天提問卡題目、私密作答、等待同伴與雙答案同時揭曉卡片。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-1`／正常（`RB4-BDD-013`～`018`） | 拖放面紙落入 `near` 與 `far` 槽；測試 I 留白後 A 顯示主動搭話；測試提問卡單方已答與雙方揭曉兩種快照 | 精準回傳對應 `slotId`；`v3` 無舊移動按鈕列；單方已答顯示等待文案，雙方完成同時顯示兩人答案與默契／反差評語 | 劇情選項絕不混入聊天訊息區 | `SD-004-V05`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |
| `C05-2`／取消邊界 | 拖放面紙落於放置槽外空白處或於已送出等待中重按提問卡選項 | 面紙彈回原位 0 次提交；已送出選項 `disabled` 防重送 | 互動狀態乾淨穩定 | `SD-004-V05`／`frontend/client/tests/unit/scene-v4-half1.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增近遠面紙拖放、去移動按鈕海與提問卡 UI 測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 多放置槽與提問卡面板尚未實作而失敗 | 待回填 |
| 2／Green | 修改 `F-07`、`F-09` 完成破冰與提問卡互動 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half1` | 前半全部單元測試 100% 通過 | 待回填 |
| 3／Refactor 與回歸 | 執行全套前端單元測試與型別檢查確認零回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run typecheck && npm run test:client` | 本包 5 個 `I` 與既有前端單元測試全綠 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-07`、`F-09`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 移交前半全部元件與 `scene-event-track.ts` 型別予 `SD-005` 進行後半與頂層組裝。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

## 測試計劃與實際驗證方式

| 驗證 ID／來源 Todo／步驟 ID | 層級／行為／平台 | 環境與前置資料／案例 ID | 工作目錄與實際命令或畫面操作 | 預期結果／斷言 | 實作／測試位置 | 實際結果、時間、log／畫面證據 | 驗收狀態／等價依據或恢復條件 |
|---|---|---|---|---|---|---|---|
| `SD-004-V01`／`SD-004-I01`／`SD-004-S01` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C01-1`、`C01-2`（共 3 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half1` | 手勢與型別單元測試通過 | `F-01`、`F-02`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-004-V02`／`SD-004-I02`／`SD-004-S02` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C02-1`、`C02-2`（共 5 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half1` | 入店、小地圖與掃視測試通過 | `F-03`、`F-06`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-004-V03`／`SD-004-I03`／`SD-004-S03` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C03-1`、`C03-2`（共 4 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half1` | 書牆、盲書與試讀測試全數通過 | `F-04`、`F-08`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-004-V04`／`SD-004-I04`／`SD-004-S04` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C04-1`、`C04-2`（共 8 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half1` | 全部空間彩蛋與見證測試通過 | `F-05`、`F-06`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-004-V05`／`SD-004-I05`／`SD-004-S05` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C05-1`、`C05-2`（共 6 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half1` | 前半全部單元測試 100% 通過 | `F-07`、`F-09`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |

## 依賴關係與執行順序

| 任務／交付物 | 唯一執行／整合／驗收責任 | 前置／契約版本／開始條件 | 可寫範圍及排除 | 共享環境／隔離／互斥 | 安全並行或循序理由 | 完成及回傳條件 |
|---|---|---|---|---|---|---|
| `SD-004-去按鈕化探索書牆與雙向破冰前端UX`（`SD-004-S01`～`SD-004-S05`） | SD-004 前端前半與共用型別執行者／由 SD-005 頂層組裝並由 SD-006 執行 Web + Android 雙端 E2E 驗收 | 使用者明確核准 `final` `1.0.0`；前置依賴：`SD-001-S07` 完成（可與 `SD-002`、`SD-003` 安全並行）；契約 `SD-contract-v2`／`CNT-001`～`004` | 僅限本包 `F-01`～`F-10`；嚴禁跨包寫入他包檔案 | 單元與隔離 Miniflare 測試獨立運行；涉及 `127.0.0.1:8787` 或 Android ADB 之測試由 `SD-006`/`SD-007` 嚴格單一序列獨佔 | 在 `SD-001` 完成後，`SD-002`（.NET）與 `SD-004`（前端前半）寫入檔案與測試工具鏈 100% 互斥，可安全並行或循序執行 | 本包 `I01`～`I05` 全數取得真實通過證據、無未提交髒檔且既有回歸全綠 |

全案關鍵依賴鏈：`SD-003-S01`（真 D1 時鐘探針）→ `SD-001` →（`SD-002` || `SD-004`）→ `SD-003-S02..S07` → `SD-005` → `SD-006`（Gate A 321 項）→ `SD-007-S02`（本人 Gate B）→ `SD-007-S03..S05`（具名清理、乾淨重玩、337/337 深度稽核與交付）。

## 風險、設計變更與人工確認紀錄

| ID／原設計版本 | 發現證據與為何不能照案實作 | 白話實務情境／功能影響 | 建議／替代與影響 SD／BDD／TDD | 負責者／觸發／成本時程 | 使用者決策／核准範圍／新版本 | 失效證據／重驗與恢復條件 |
|---|---|---|---|---|---|---|
| `FINAL-APPROVAL-GATE`／`1.0.0` | 依 `SD-contract-v2` 與 `design-decision` 規範，整合產出之 `final/` 未獲使用者明確確認前不得啟動產品開發 | 確保所有跨候選取捨（真實路徑修正、D1 `CASE ... json()` 回滾、21 表清理拓樸）符合使用者預期 | 審閱核准 `final` `1.0.0` 後轉為 `Ready for carefully-done`（影響 `SD-001`～`SD-007`） | 使用者本人／設計交付時觸發 | **待使用者明確確認（`Awaiting approval`）** | 取得明確核准後解除阻斷；後續若需改動已核准設計須先停工討論並遞增設計版本 |

已寫明的檔案、邏輯、介面、資料、依賴、契約或驗證方式若在實作期發現需變更，必須先停止本需求後續實作並向使用者報告確認，更新獲准設計後再續作；一般進度與證據回填不變更設計版本。

## 實現檢查清單／Todo

本區是本包 SD 進度的唯一計數來源。每個可勾選項都是葉節點，父分組只用標題。設計完成後只勾 D，I 要有有效實際驗收證據才可勾選。

### D：設計葉節點

- [x] **SD-004-D01** 完成 `scene-event.v3` 共用前端型別、手勢互斥幾何、去按鈕化小地圖與呼吸光掃視設計
  - 類型／唯一分組：D／導覽與手勢設計
  - 來源／責任／依賴：`RB4-AC-001`、`RB4-BDD-001`～`004`；`SD-004` 負責
  - 完成條件／設計證據：`F-01`～`F-03`,`F-06` 與 `SD-004-S01`/`S02` 已完整定義且使用真實平面路徑（已通過全量一致性桌面稽核）
- [x] **SD-004-D02** 完成 5 區橫滑書牆特寫、牛皮紙盲書滑動撕封、本人興趣貼紙與 `SceneBook` 原文書頁設計
  - 類型／唯一分組：D／書牆與盲書 UX 設計
  - 來源／責任／依賴：`RB4-AC-002`,`010`、`RB4-BDD-005`～`008`；`SD-004` 負責
  - 完成條件／設計證據：`F-04`,`F-08` 與 `SD-004-S03` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-004-D03** 完成黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景實際渲染見證設計
  - 類型／唯一分組：D／空間彩蛋 UX 設計
  - 來源／責任／依賴：`RB4-AC-003`,`006`、`RB4-BDD-009`～`012`,`020`、`RA-06`；`SD-004` 負責
  - 完成條件／設計證據：`F-05`,`F-06` 與 `SD-004-S04` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-004-D04** 完成閱讀角近遠面紙拖放、同異書破冰、留白反向主動、獨處退讓與雨天提問卡雙盲 UI 設計
  - 類型／唯一分組：D／破冰與問答 UX 設計
  - 來源／責任／依賴：`RB4-AC-004`,`005`、`RB4-BDD-013`～`018`；`SD-004` 負責
  - 完成條件／設計證據：`F-07`,`F-09` 與 `SD-004-S05` 已完整定義（已通過全量一致性桌面稽核）

### I：實作驗證葉節點

- [ ] **SD-004-I01** 完成「擴充 `scene-event-track.ts` 與 `scene-stage.ts` 定義 `scene-event.v3` 完整型別與手勢互斥幾何」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-016`、`RB4-T-017`、`RB4-T-018`；`SD-004` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-004-S01`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-004-V01` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-004-I02** 完成「實作 `BookshopMinimapOverlay.tsx` 與 `EmbeddedSceneStage.tsx` 去按鈕化入店、小地圖暖金點與呼吸光掃視」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-003`、`RB4-T-008`、`RB4-T-011`、`RB4-T-012`、`RB4-T-013`；`SD-004` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-004-S02`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-004-V02` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-004-I03** 完成「實作 `ShelfCloseupDrawer.tsx` 與擴充 `SceneBook.tsx` 支援橫滑書牆、盲書撕封、興趣貼紙與 20 書試讀」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-023`、`RB4-T-028`、`RB4-T-034`、`RB4-T-041`；`SD-004` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-004-S03`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-004-V03` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-004-I04** 完成「實作 `AmbientInteractableModal.tsx` 黑膠／小黑板／留言冊／阿澄閒聊與起霧雨窗擦霧及前景見證」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-046`、`RB4-T-050`、`RB4-T-051`、`RB4-T-052`、`RB4-T-055`、`RB4-T-056`、`RB4-T-057`、`RB4-T-062`；`SD-004` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-004-S04`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-004-V04` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-004-I05** 完成「擴充 `SceneWorldObjects.tsx` 與 `SceneEventActions.tsx` 完成近遠面紙拖放、雙向破冰與雨天提問卡 UI」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-068`、`RB4-T-074`、`RB4-T-080`、`RB4-T-086`、`RB4-T-092`、`RB4-T-098`；`SD-004` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-004-S05`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-004-V05` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`

## 檢查點與續作交接

| 日期／任務／執行者 | 已完成並驗收／證據 | 尚未驗收／停止原因 | 寫入責任與共享資源現況 | 所需決策／恢復條件與查核 | 續作對象、實際啟動結果／下一步 |
|---|---|---|---|---|---|
| 2026-11-26／`/design-decision` 建立 `SD-004`／`Antigravity (Gemini 4 Carbon (High))` | 設計葉節點 `D`: 4/4 完成並通過桌面稽核 | 實作葉節點 `I`: 0/5 未開始；依規範停於 `Awaiting approval` 等待人工核准 | 產品程式碼、測試、DB 與設定 **0 修改**；無運行中背景伺服器或鎖定資源 | 使用者明確核准 `SPEC-001-RainBookshopV4/final` 設計版本 `1.0.0` | 核准後交由 `/carefully-done` 核對基準快照並按全案步驟順序執行 |

**鎖定文件包／版本／核准依據**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/plans/SD-004-去按鈕化探索書牆與雙向破冰前端UX.md`／版本 `1.0.0`／待使用者明確核准（快照見 `../00-overview.md`）。  
**目前 I-ID／步驟 ID／子階段／已發生副作用**：尚未開始（待進入 `SD-004-I01`／`SD-004-S01`）；已發生產品副作用：**無**。  
**需重驗成果與不受影響成果**：無失效既有成果；既有 `SceneEventFramework` 基線保持完好。  
**關鍵依賴鏈／下個里程碑／用時與重試策略**：下個里程碑為取得使用者核准進入實作；實作時單一測試失敗先於本步允許範圍定位修復，涉及設計或環境阻斷立即停止回報，不盲目無限重試。  
**責任移交前停止寫入的證據**：本設計階段未對任何產品檔案進行寫入（可由 `git status --short` 核實）。

## 相關文檔

- [SD 總覽](../00-overview.md)
- [系統設計](../01-system-design.md)
- [追溯矩陣](../02-traceability.md)
- [設計決策](../03-design-decision.md)
- 上游規格：[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[V4 作者草案](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)、[Verification](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)

## 生成者、最後更新與狀態

**生成者／AI／模型／批次**：`Antigravity`／`Gemini 4 Carbon (High)`／批次 `final`  
**最後更新／設計版本**：2026-11-26／`1.0.0`（契約 `SD-contract-v2`）  
**執行狀態／驗收狀態／剩餘事項**：`Planned`／`Incomplete`／等待使用者明確核准 `final` `1.0.0` 後由 `/carefully-done` 執行 `SD-004-I01`～`I05`
