# SD-007-實玩GateB與Local清理結案交付 — 分項實作設計

**功能／工作包 ID**：`SD-007-實玩GateB與Local清理結案交付`  
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[V4 作者原稿 JSON](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)  
**文件包／AI／模型／批次**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`／AI：`Antigravity`／模型：`Gemini 4 Carbon (High)`／批次：`final`  
**設計版本／契約版本／優先級**：`1.0.0`／`SD-contract-v2`／高（P1）  
**執行狀態／驗收狀態／最後更新**：`Planned`（未開發）／`Incomplete`（待核准後實測驗收）／2026-11-26  
**執行／整合／驗收責任**：SD-007 清理與結案執行者＋使用者本人（唯一有權簽認 `RB4-T-295` Gate B）／開發主責人最終全案稽核  
**來源與程式碼基準、核准設計快照**：見 [SD 總覽（../00-overview.md）](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

只計本文件「實現檢查清單／Todo」中的唯一葉節點；摘要、里程碑及引用不再計數。設計與實作驗證分開，設計完成不勾選產品完成。

| 指標 | 完成／總數 | 進度條與百分比 | 依據 |
|---|---|---|---|
| 設計完成度（D） | 4 / 4 | `[████████████████████] 100.0%` | 本包 `SD-007-D01`～`D04` 已完成完整設計與桌面一致性稽核 |
| 本包 BDD 設計涵蓋率 | 4 / 4 | `[████████████████████] 100.0%` | 本包涉及之全部唯一 BDD Scenario 均已完整分解至產品符號與步驟（跨包完整性見 [追溯矩陣](../02-traceability.md)） |
| 本包 TDD 設計涵蓋率 | 16 / 16 | `[████████████████████] 100.0%` | 本包主責驗證之 16 項唯一 TDD 已 100% 映射至具體步驟、測試檔與命令 |
| 實作驗證完成度（I） | 0 / 5 | `[░░░░░░░░░░░░░░░░░░░░] 0.0%` | 本包 `SD-007-I01`～`I05` 設計階段未開發，待人工核准 `final` 後實作驗收 |

### 分層／分組進度追蹤

| 唯一分組／層 | D 完成／總數 | I 完成／總數 | 進行中／待開始 | 執行狀態 | 驗收狀態／證據 |
|---|---|---|---|---|---|
| 設計葉節點（D） | 4 / 4 | 0 / 0 | 0 / 0 | `Ready for review` | 桌面設計稽核通過（待使用者核准 `final` `1.0.0`） |
| 實作與驗證葉節點（I；主責 TDD：Unit 9／Integration 4／API 0／E2E 3） | 0 / 0 | 0 / 5 | 0 / 5 | `Planned` | `Incomplete`；證據待回填至 `Verification.md` |

### 當前 Sprint 狀態

| 當前階段／Todo ID／步驟 ID | Red–Green–Refactor 子階段 | 負責者 | 開始／預計完成及依據 | 下一步 ID／最後更新 |
|---|---|---|---|---|
| 設計決策交付待審／尚未啟動 `SD-007-I01`（`SD-007-S01`） | 不適用（設計階段不啟動產品開發） | SD-007 執行者 | 待使用者明確核准 `final` `1.0.0` 且滿足首步前置後啟動（無硬性預設期限） | 核准且前置滿足後執行 `SD-007-S01`／2026-11-26 |

### 里程碑

僅引用 Todo ID，不建立第二套可計數 checkbox。

| 里程碑 | 必要葉節點／前置 SD | 驗收與整合條件 | 狀態／證據 |
|---|---|---|---|
| `SD-007-M0`：分項設計與步驟稽核就緒 | `SD-007-D01`～`D04` | 檔案路徑 100% 對齊真實 repo、單一寫入無衝突、每步具案例與命令 | 設計已完成（`Awaiting approval`） |
| `SD-007-M1`：本包全部實作與驗證葉節點達成 | `SD-007-I01`～`I05`（依賴前置見步驟表） | 本包全部 `SD-007-V01`～`SD-007-V05` 實測通過且既有回歸全綠 | `Incomplete` |
| `SD-007-M2`：跨包 Gate A／Gate B 與最終深度稽核結案 | 配合 `SD-006` 與 `SD-007-I01`～`I05` | 全案 337/337 TDD 驗證完成、本人 Gate B 通過並同步 `Verification.md` | `Incomplete` |

### 關鍵指標

| 指標 | 已確認目標與來源 | 當前值 | 實際驗證／證據或限制 |
|---|---|---|---|
| 本包主責 TDD 設計涵蓋與實測通過數 | 設計涵蓋 16/16；實測通過目標 16/16（`SPEC`／`TDD`） | 設計涵蓋 `100.0%`；實測 `0 / 16` | 設計階段未執行程式修改或測試代簽 |
| 架構與資料邊界遵守度 | 21 表、0 新欄、0 Trigger、0 新公開 API、原稿逐 scalar 不變、單一檔案寫入責任 | 設計 `100%` 符合 | 見下方「檔案改動設計」與 [02-traceability.md](../02-traceability.md) |

### 每日進度記錄

依專案 `AGENTS.md` 基本規範，禁止記錄每日／批次歷史進度流水帳；此處僅就地保留當前有效狀態。

| 日期 | 完成 Todo／有效證據 | 阻斷／剩餘 | 下一步／責任 |
|---|---|---|---|
| 2026-11-26 | 完成 `SD-007` 分項設計 `1.0.0`（`D`: 4/4，涵蓋 8 個檔案項目與 5 個有序步驟） | 實作 `I`: 0/5；等待使用者明確核准 `final` `1.0.0` | 取得核准並滿足前置後由 `/carefully-done` 依序執行 `SD-007-S01` |

## 功能概述

負責實作針對真實 21 張 D1 資料表與雙 R2 Bucket 的具名 Local 清理引擎（`tools/rain-bookshop-v4-cleanup-policy.mjs` 與 `tools/local.mjs` 新增 `scene-v4-cleanup-preview` / `scene-v4-cleanup-apply`）並在隔離 Miniflare 環境完成驗證（`S01`）；彙整技術 Gate A 證據提交**使用者本人親自試玩並明確核准精確 V4 SHA**（`S02`，硬性人工關卡 `RB4-T-295`，未核准前嚴禁對 default local 執行清理或刪檔）；於本人核准後對已知 default local 停寫、備份、依真實 FK 子至父順序清除舊版 V1/V2/V3 與具名 V4 驗收測試 Round（含測試對 `match_invitations` 解除永久排除）、按 `RetainedKeys` 差集清理 R2 無引用舊物件、核驗 9 張保護表與私人 `FILES` R2 指紋 100% 不變並移除無用舊 V3 檔案（`S03`）；接著執行雙端全新配對 `CleanReplay` 驗收（`S04`），最後完成全案 15 AC / 58 BDD / **337/337 TDD** 逐項深度稽核與 `Verification.md`、來源規格及 `overview/` 同步交付（`S05`）。

## 功能需求與來源追溯

| MVP／SPEC 項目 | BDD Scenario | TDD 測試項 | 系統設計 ID／本包 Todo／步驟 ID | 驗收條件 | 跨包共同成果與整合責任 |
|---|---|---|---|---|---|
| `SPEC-001-RainBookshopV4` `RB4-AC-013` | `RB4-BDD-052` GateB | `RB4-T-295` | SYS-010／SD-007-I02／SD-007-S02 | Then 只有明確核准精確版本才可清理；And 拒絕或未確認保留V3及舊場次；And 自動測試不能代簽 | 本包獨立完成並於 `SD-007-S05` 深度稽核覆核 |
| `SPEC-001-RainBookshopV4` `RB4-AC-013` | `RB4-BDD-053` CleanupScope | `RB4-T-296`、`RB4-T-297`、`RB4-T-298`、`RB4-T-299`、`RB4-T-334` | SYS-010／SD-007-I01／SD-007-S01 | Then 不明環境／未授權／無備份拒清理；And 精確Round/Session/Invitation/claim/event/catalog及R2引用清單；And 保護帳號、個資、化身與其他故事或資產；And 混有非驗收遊玩資料或未知引用的輪次拒清並列衝突 | 本包獨立完成並於 `SD-007-S05` 深度稽核覆核 |
| `SPEC-001-RainBookshopV4` `RB4-AC-013` | `RB4-BDD-054` CleanupAtomicity | `RB4-T-300`、`RB4-T-301`、`RB4-T-302`、`RB4-T-303` | SYS-010／SD-007-I01／SD-007-S01 | Then FK依賴及保護指紋正確、無孤兒；And 測試pair排除與占用不殘留；And R2只刪無剩餘引用、故障可補償且不假成功；And 共用 R2 SHA 有剩餘引用不可刪；保護指紋及失敗補償可核證 | 本包獨立完成並於 `SD-007-S05` 深度稽核覆核 |
| `SPEC-001-RainBookshopV4` `RB4-AC-014` | `RB4-BDD-055` CleanReplay | `RB4-T-304`、`RB4-T-305`、`RB4-T-306`、`RB4-T-307`、`RB4-T-308`、`RB4-T-309` | SYS-010／SD-007-I04／SD-007-S04 | Then 舊版不可選、無舊SHA或歷史恢復；And V4完整可玩、配對/聊天/退出維持；And 所有Gate證據齊全才可結案與進下一SPEC | 本包獨立完成並於 `SD-007-S05` 深度稽核覆核 |

### BDD 行為與產品實作分解

| BDD Scenario／條件或 Examples | 角色／Given | When／操作 | Then／And／But 各結果與副作用 | 實際產品 F-ID／符號／核心分支 | 必要 S／I／V／跨包成果 |
|---|---|---|---|---|---|
| `RB4-BDD-052` GateB（@alternative-path @critical @manual） | Given Gate A已完成且有精確版本SHA | When 使用者實際遊玩並確認或拒絕 | Then 只有明確核准精確版本才可清理；And 拒絕或未確認保留V3及舊場次；And 自動測試不能代簽 | `F-06`：【硬性人工關卡】彙整 Gate A 證據並停止等待使用者本人親自實玩核准精確 V4 SHA（Gate B） | `SD-007-S02`／`SD-007-I02`／`SD-007-V02`（跨包鏈：SD-007） |
| `RB4-BDD-053` CleanupScope（@error-handling @critical） | Given Gate B已核准且已知local停寫 | When 預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境 | Then 不明環境／未授權／無備份拒清理；And 精確Round/Session/Invitation/claim/event/catalog及R2引用清單；And 保護帳號、個資、化身與其他故事或資產；And 混有非驗收遊玩資料或未知引用的輪次拒清並列衝突 | `F-01`、`F-02`、`F-03`、`F-04`：實作具名 Local 清理引擎並在隔離 Miniflare 驗證真實 21 表 FK、混合輪阻斷與保護指紋 | `SD-007-S01`／`SD-007-I01`／`SD-007-V01`（跨包鏈：SD-007） |
| `RB4-BDD-054` CleanupAtomicity（@error-handling @critical） | Given 已確認清理範圍與備份 | When 故障注入D1交易或R2清理並重試 | Then FK依賴及保護指紋正確、無孤兒；And 測試pair排除與占用不殘留；And R2只刪無剩餘引用、故障可補償且不假成功；And 共用 R2 SHA 有剩餘引用不可刪；保護指紋及失敗補償可核證 | `F-01`、`F-02`、`F-03`、`F-04`：實作具名 Local 清理引擎並在隔離 Miniflare 驗證真實 21 表 FK、混合輪阻斷與保護指紋 | `SD-007-S01`／`SD-007-I01`／`SD-007-V01`（跨包鏈：SD-007） |
| `RB4-BDD-055` CleanReplay（@happy-path @critical @frontend） | Given 清理完成且正式索引只剩V4 | When 新配對、進場、結局、聊天、重玩與退出 | Then 舊版不可選、無舊SHA或歷史恢復；And V4完整可玩、配對/聊天/退出維持；And 所有Gate證據齊全才可結案與進下一SPEC | `F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收）：於清理後 Default Local 執行 Web 與 Android 雙平台全新配對 `CleanReplay` 回歸驗收 | `SD-007-S04`／`SD-007-I04`／`SD-007-V04`（跨包鏈：SD-007） |

## 用戶故事

作為產品擁有者與真實試玩驗收者，我想要先親自遊玩確認 V4 的節奏、情感與視覺完全滿意並簽認該版本 SHA 後，才安全清掉本地開發過程留下的舊版故事與測試配對紀錄（同時百分百保留我的帳號、個人檔案、照片與化身），並確認乾淨環境從頭配對遊玩一切正常後正式結案。

## 畫面操作／系統處理流程

1. 隔離驗證清理引擎（`S01`）：實作 `createV4CleanupPlan` 與 `applyV4CleanupPlan`，在隔離 Miniflare D1/R2 驗證 9 張保護表指紋、12 張業務／內容表 FK 子至父刪除順序、非測試混合輪阻斷（`RB4-T-334`）與 R2 `RetainedKeys` 共用素材保護（不觸碰真實 default local）。
2. **使用者本人實玩 Gate B 硬性關卡（`S02`）**：啟動本地平台供使用者親自遊玩並呈現精確 V4 narrative/scene SHA-256，**必須停止等待使用者本人明確回覆核准該精確 SHA**（`RB4-T-295`），絕不以自動化測試代簽。
3. 具名 Default Local 清理與舊 V3 退場（`S03`）：取得本人 Gate B 核准後，確認 `8787` 停寫 → 建立全新 SQLite 備份 → 執行 `scene-v4-cleanup-preview` 與 `scene-v4-cleanup-apply` → 核驗 9 張保護表與私人 `FILES` R2 指紋不變且 `PRAGMA foreign_key_check` 為空 → 具名刪除工作區僅舊版使用之 V3 契約／腳本／無引用素材。
4. 雙端 `CleanReplay`（`S04`）與全案 337/337 深度稽核結案（`S05`）：於清理後環境跑通 Web 與 Android 全新配對→V4 完場→聊天→重玩→安全退出（確認舊版不可選），完成全量深度稽核、文件就地同步與 `git diff --check`。

### 畫面、元件與互動分解（適用時）

| 畫面／區域／角色／BDD | 實際頁面、元件、handler／F-ID | 布局、內容、素材與操作／手勢 | 狀態、導覽、禁用／錯誤／重試 | API／事件、權威狀態與平台差異 | 必要 S／I／V、可重現操作與視覺驗收 |
|---|---|---|---|---|---|
| `RB4-BDD-055` CleanReplay（雙角色視角） | `F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收）（對應步驟 `SD-007-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 新配對、進場、結局、聊天、重玩與退出，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-007-S04`／`SD-007-I04`／`SD-007-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |

## 技術規範與實作設計

### 架構、DDD 與責任

對應 `SYS-010`、`SPEC §5`、`RQ-04` 與 `RA-08`。100% 對齊真實 `0001`～`0007` **21 張 D1 資料表**：
- **9 張受保護不變表**：`auth_accounts`、`auth_external_identities`、`auth_sessions`、`auth_refresh_tokens`、`auth_email_challenges`、`common_rate_limit_buckets`、`user_profiles`、`user_media_assets`、`match_conditions`（外加私人 R2 `FILES` bucket 全物件指紋）。
- **12 張受控清理／保留內容表**：依序處理 `game_event_instances` → `game_story_participant_progress` → `game_scene_visits` → `game_story_sessions` → `game_round_events` → `game_active_round_claims` → `game_rounds` → `match_invitations` → 舊版 `content_story_catalog` → 舊版 `content_scene_category_links` → 舊版 `content_scene_catalog`（保留仍被 V4 引用之 `content_story_categories` 與唯一 `published` 之 V4 `content_story_catalog`/`content_scene_catalog`）。

### 重要函式、核心邏輯與狀態

| 核心 ID／目標類別或函式 | 輸入／輸出與前後置條件 | 演算法／分支／偽碼 | 交易／併發／冪等／重試 | 錯誤語意／驗證 |
|---|---|---|---|---|
| `createV4CleanupPlan` & `applyV4CleanupPlan`（`tools/rain-bookshop-v4-cleanup-policy.mjs`） | 輸入：D1 `DB`、`STORY_CONTENT` R2、`FILES` R2、本地 `wrangler` 設定、具名測試 `roundIds` 清單與本人 Gate B 核准憑證 `{ approvedByUser: true, narrativeSha256, sceneSha256 }`；輸出：具名預覽計畫 JSON 與清理執行結果 | 1) 強制核驗 `APP_ENV === "local"` 且無 `remote: true`（違者拋 `V4_CLEANUP_TARGET_FORBIDDEN`）；2) 檢查混合輪：若非列入 `testRoundIds` 之 Round 引用舊版 Catalog 或存在未列入之 `active` Round，立即拋 `CLEANUP_MIXED_OR_UNPLANNED_REFERENCE`（`RB4-T-334`）；3) 計算 9 張保護表與私人 `FILES` 清理前 SHA-256 指紋；4) `apply` 時強制要求 `approvedByUser === true` 且 SHA 吻合當前 `published` V4；5) 單一 D1 `db.batch` 按子至父順序刪除並緊跟 `CASE ... json()` 空集與唯一 V4 `published` guard；6) 展開保留 V4 四層 manifest 與 79 項實體資產 SHA 為 `RetainedKeys`，僅刪除 `STORY_CONTENT` 中不在 `RetainedKeys` 內之舊物件（保護 18 項沿用素材！）；7) 重算保護指紋比對 100% 相等 | 支援計畫檔狀態持久化與 R2 刪除中斷冪等續跑；先備份再執行，絕不覆寫原備份 | 缺本人 Gate B 簽認拋 `GATE_B_USER_APPROVAL_REQUIRED`；保護資料差 1 bit 拋 `PROTECTED_DATA_CHANGED`；由 `SD-007-V01`,`V03` 驗證 |

### 契約、資料與平台

- **契約與版本**：嚴格對齊 [01-system-design.md](../01-system-design.md#契約與資料設計) 定義之 `CNT-001`（`scene-event.v3`）、`CNT-002`（動作白名單＋書籤 `0..20` Unicode scalar）、`CNT-003`（actor-scoped 快照＋單人 `own_profile` 興趣）與 `CNT-004`（私有 `story.framework.system.reconcile`）。
- **資料庫與儲存限制**：維持 `0001`～`0007` **21 張表、0 新欄、0 SQL Trigger、0 新增公開 HTTP 路由**；維持 `world_state_json <= 16,384`、`state_json <= 16,384`、manifest `<= 512KiB`／`4MiB`、素材 `<= 8MiB`、可達狀態 `<= 50,000`。
- **平台與安全範圍**：目標平台為 **Web** 與 **Android**（依 `D-051`/`D-052` 排除 iOS 與無障礙專項）；嚴禁記錄或輸出任何密碼、驗證碼、Google/Session token、Cookie 或私人照片位元組；本地維運一律經 `tools/local.mjs` 操作已知 local instance，嚴禁 `--remote`。

### 共用與改動合理性

- 100% 沿用既有認證、配對、聊天、16 款內建全身與私人靜態四姿態化身系統（執行期 **0 次 Gemini 呼叫**）。
- 本包可寫檔案清單與其餘 6 份 SD 分項完全互斥（單一寫入者），避免並行覆寫衝突並最小化對既有 V3 回歸面之影響。

## 檔案改動設計

### F-01：`tools/rain-bookshop-v4-cleanup-policy.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`validateV4CleanupTarget`、`createV4CleanupPlan`、`applyV4CleanupPlan`
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-AC-013`,`014`、`RQ-04`、`RA-08`／`RB4-T-296`～`303`,`334`／`SD-007-D01`,`I01`,`I03`／`SD-007-S01`,`S03`
- 改動要點與必要核心邏輯：實作真實 21 張 D1 表保護指紋、混合輪阻斷、子至父 FK 原子批次刪除與 `STORY_CONTENT` R2 `RetainedKeys` 差集清理，不記錄任何密碼、token 或私人照片位元組
- 此檔案的責任與白話設計原因：將高風險資料清理封裝為純本地、具名預覽、指紋受控的可測試政策模組
- 輸入／輸出、介面及契約限制：Node ESM 政策模組
- 前置依賴：`SD-006-S06` Gate A 通過
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：`npm test && npm run test:worker`（`SD-007-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-02：`tools/local.mjs`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：新增 `scene-v4-cleanup-preview` 與 `scene-v4-cleanup-apply` 子命令（第 120–144 行 `avatar-reset` 區段旁）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-AC-013`／`SD-007-D01`,`D03`,`I01`,`I03`／`SD-007-S01`,`S03`
- 改動要點與必要核心邏輯：沿用 `withPausedWrites`、`noListener`（確認 `127.0.0.1:8787` 已停止寫入）與 `invoke("backup")` 預留新備份檔機制，串接 `createV4CleanupPlan` 與 `applyV4CleanupPlan`
- 此檔案的責任與白話設計原因：遵守 `AGENTS.md`「本地命令只能經 wrappers 指向已知 local instance；備份先暫停寫入」規範
- 輸入／輸出、介面及契約限制：本地受控 CLI 子命令
- 前置依賴：`F-01`
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：`npm test` 及 `SD-007-S03` 實機預覽／套用（`SD-007-V01`,`V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-03：`tools/tests/rain-bookshop-v4-cleanup-policy.test.mjs`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：清理目標防護、具名清單驗證、Gate B 未核准阻斷與 R2 `RetainedKeys` 差集單元測試
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-T-296`～`298`,`300`～`302`／`SD-007-I01`／`SD-007-S01`
- 改動要點與必要核心邏輯：測試拒絕 `remote: true`、拒絕非 `local` 環境、拒絕 `approvedByUser !== true`、保護 18 項 V4 共用素材 SHA 不被列入刪除清單
- 此檔案的責任與白話設計原因：在單元層鎖定所有安全護欄
- 輸入／輸出、介面及契約限制：Node `node:test` 測試套件
- 前置依賴：`F-01`、`F-02`
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：`npm test`（`SD-007-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-04：`cloudflare/tests/scene-event-v4-cleanup.integration.test.ts`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：真 Miniflare D1（真實 21 表）＋雙 R2 具名清理、混合輪阻斷（`RB4-T-334`）、保護指紋與冪等恢復整合測試
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-T-299`,`303`,`304`～`307`,`334`／`SD-007-I01`,`I04`／`SD-007-S01`,`S04`
- 改動要點與必要核心邏輯：於真 Miniflare 套用完整 `0001`～`0007` migrations 建立 21 張表，寫入帳號、個資、照片、AI 化身、配對條件、舊版 V2/V3 場次、具名測試 Round（含 `declined` 邀請）與非測試混合輪，實測 `RB4-T-334` 混合輪阻斷、合法清理後 `PRAGMA foreign_key_check` 為 0、9 張保護表與私人 R2 指紋 100% 不變、測試對解除永久排除可重新配對且僅 V4 可被抽選
- 此檔案的責任與白話設計原因：以真 SQLite FK 與 R2 證明 21 表清理拓樸零孤兒、零誤刪
- 輸入／輸出、介面及契約限制：Vitest Miniflare 整合測試
- 前置依賴：`F-01`
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：`npm run test:worker`（`SD-007-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-05：`contracts/rain-bookshop-last-order.json、contracts/rain-bookshop-before-rain-stops.json、tools/rain-bookshop-v3-policy.mjs、tools/tests/rain-bookshop-v3.test.mjs（及無 V4 或共用測試引用之舊專屬素材）`

- 改動類型：刪除（僅限 `SD-007-S02` 本人 Gate B 核准後於 `S03` 執行！）
- 目標類別／函式／區段與現況證據：舊版雨聲書店專屬契約、V3 鎖定腳本與無引用舊版專屬資產（調整 `scene-event-publish-policy.mjs` 移除舊 V3 import）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-AC-013`,`014`、`SPEC §5.4`／`SD-007-D03`,`I03`／`SD-007-S03`
- 改動要點與必要核心邏輯：於使用者本人簽認 Gate B 並完成 default local 清理後，依 `contracts/rain-bookshop-v4.json` 與全倉測試實際引用掃描，僅移除確認無任何剩餘引用之舊版雨聲書店專屬檔案（18 項 V4 沿用素材與通用引擎測試 fixture 100% 保留！）
- 此檔案的責任與白話設計原因：落實 `SPEC §5.4` 與 `AGENTS.md` 不保留無用舊版資產與廢棄程式碼之規定
- 輸入／輸出、介面及契約限制：受控檔案移除與引用清理
- 前置依賴：**硬性依賴 `SD-007-S02` 本人 Gate B 明確核准**
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一執行
- 驗證方式與預期結果：`npm test && npm run check:foundation && npm run test:worker && npm run test:server && npm run test:client`（`SD-007-V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-06：`docs/verification/SPEC-001-RainBookshopV4-Verification.md`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：唯一正式驗收證據紀錄檔
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-AC-012`～`015`／`RB4-T-295` 及全案 337 項證據彙整／`SD-007-D02`,`D04`,`I02`,`I05`／`SD-007-S02`,`S05`
- 改動要點與必要核心邏輯：依平台（Unit / Miniflare Integration / API / Live / Web / Android）詳實記錄實際執行命令、日期、精確 V4 SHA、本人 Gate B 確認依據、Local 備份與清理前後保護指紋及 `CleanReplay` 結果（未驗項絕不預填通過）
- 此檔案的責任與白話設計原因：遵守 `AGENTS.md`「驗證證據只放 Verification，禁止流水帳」規範
- 輸入／輸出、介面及契約限制：Markdown 驗證紀錄
- 前置依賴：`SD-007-S02`、`SD-007-S04`
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：`git diff --check` 與深度稽核（`SD-007-V02`,`V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-07：`docs/specs/SPEC-001-RainBookshopV4.md、docs/bdd/SPEC-001-RainBookshopV4-BDD.md、docs/tdd/SPEC-001-RainBookshopV4-TDD.md`

- 改動類型：修改（僅於實作驗收完成後就地回寫既有 checkbox 與唯一進度）
- 目標類別／函式／區段與現況證據：來源規格實現檢查清單、BDD 42 個 `@frontend` 與 58 場景 checkbox、TDD 337 個測試 checkbox
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`RB4-AC-014`,`015`／`SD-007-D04`,`I05`／`SD-007-S05`
- 改動要點與必要核心邏輯：於 `SD-007-S05` 逐項深度稽核確認每一項皆具備真實有效驗收證據後，就地勾選已驗證之既有 checkbox 並更新唯一進度數字（不改劇本需求語意、不寫每日歷史）
- 此檔案的責任與白話設計原因：完成 `carefully-done` / `spec-bdd-implementation-deep-audit` 來源可追溯閉環
- 輸入／輸出、介面及契約限制：就地狀態同步（設計階段絕不修改）
- 前置依賴：`SD-007-S04` 全數通過
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：深度稽核計數比對與 `git diff --check`（`SD-007-V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-08：`overview/01-architecture/04-module-map.md、overview/03-contracts/01-api-contracts.md、overview/03-contracts/02-data-contracts.md、overview/02-development-guidelines/03-ai-workflow-stages.md`

- 改動類型：修改（僅於實作完成後依 Overview 同步矩陣就地更新）
- 目標類別／函式／區段與現況證據：新增模組／元件索引、`scene-event.v3` DTO 與私有對帳命令說明、修復後之 Android 重跑說明
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-010`／`AGENTS.md Overview 同步矩陣`／`SD-007-D04`,`I05`／`SD-007-S05`
- 改動要點與必要核心邏輯：同步新增之 `SceneEventV4Policy`、5 個前端元件、`rain-bookshop-v4-policy`、`CNT-001`～`004` 契約及已修復之 `test-android.ps1` 說明（設計階段絕不提前把未實作方案寫入 `overview/`！）
- 此檔案的責任與白話設計原因：嚴格履行 `AGENTS.md` 完成前必查之 Overview 同步矩陣
- 輸入／輸出、介面及契約限制：架構與契約權威文件就地更新
- 前置依賴：`SD-007-S04` 通過
- 寫入責任、共用責任與可寫區段：`SD-007` 唯一寫入
- 驗證方式與預期結果：連結解析檢查與 `git diff --check`（`SD-007-V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）


## 有序實作與驗證步驟

### 步驟順序與起始關卡

| 步驟 ID／成果 | 唯一負責 I-ID／來源 | 前置步驟及所需結果／跨包契約 | F-ID／V-ID | 通過後可開始的下一步／條件 | 執行狀態／證據位置 |
|---|---|---|---|---|---|
| `SD-007-S01`／實作具名 Local 清理引擎並在隔離 Miniflare 驗證真實 21 表 FK、混合輪阻斷與保護指紋 | `SD-007-I01`（`RB4-T-296`,`RB4-T-297`,`RB4-T-298`,`RB4-T-300`…等 9 項 TDD） | `SD-006-S06` 技術 Gate A（前段 321 項）已通過 | `F-01`、`F-02`、`F-03`、`F-04`／`SD-007-V01` | `SD-007-S02`（注意：本步嚴禁對真實 default local 執行 `apply` 或刪除任何 V3 檔案！） | `Planned`；證據待回填 |
| `SD-007-S02`／【硬性人工關卡】彙整 Gate A 證據並停止等待使用者本人親自實玩核准精確 V4 SHA（Gate B） | `SD-007-I02`（`RB4-T-295`） | `SD-006-S06`（Gate A 321 項）與 `SD-007-S01`（隔離清理驗證）通過 | `F-06`／`SD-007-V02` | 僅在取得**使用者本人針對精確 V4 narrative/scene SHA-256 之明確核准**後，才可啟動 `SD-007-S03`！ | `Planned`；證據待回填 |
| `SD-007-S03`／執行已知 Default Local 停寫、備份、具名舊版與測試輪清理並移除無用舊 V3 檔案 | `SD-007-I03`（產品基礎前置成果） | **已取得 `SD-007-S02` 使用者本人對精確 V4 SHA 之明確 Gate B 核准** | `F-02`、`F-05`、`F-06`（及微調 `tools/scene-event-publish-policy.mjs` 移除舊 V3 分支引用）／`SD-007-V03` | `SD-007-S04` | `Planned`；證據待回填 |
| `SD-007-S04`／於清理後 Default Local 執行 Web 與 Android 雙平台全新配對 `CleanReplay` 回歸驗收 | `SD-007-I04`（`RB4-T-304`,`RB4-T-305`,`RB4-T-306`,`RB4-T-307`,`RB4-T-308`,`RB4-T-309`） | `SD-007-S03` 完成 | `F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收）／`SD-007-V04` | `SD-007-S05` | `Planned`；證據待回填 |
| `SD-007-S05`／執行全案 15 AC / 58 BDD / 337 TDD 深度稽核並同步 `Verification`、來源規格與 `overview/` 結案 | `SD-007-I05`（產品基礎前置成果） | `SD-007-S01`～`S04` 全部通過（全案 337 項 TDD 均已具備真實有效驗收證據） | `F-06`、`F-07`、`F-08`（及同步本 `final/` SD 進度）／`SD-007-V05` | 全案 `SPEC-001-RainBookshopV4` 100% 驗收交付結案（未獲新授權前不自動進入 `AffectionAndFeedback`） | `Planned`；證據待回填 |

### SD-007-S01：實作具名 Local 清理引擎並在隔離 Miniflare 驗證真實 21 表 FK、混合輪阻斷與保護指紋

**對應成果與責任**：唯一負責 `SD-007-I01`；對應 TDD：`RB4-T-296`、`RB4-T-297`、`RB4-T-298`、`RB4-T-300`、`RB4-T-301`、`RB4-T-302`、`RB4-T-299`、`RB4-T-303`、`RB4-T-334`；涉及檔案：`F-01`、`F-02`、`F-03`、`F-04`；驗證 ID：`SD-007-V01`；由 `SD-007` 執行者負責。  
**開始條件與前置證據**：`SD-006-S06` 技術 Gate A（前段 321 項）已通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `tools/scene-event-local-policy.mjs`、`tools/avatar-reset-policy.mjs`、`tools/local.mjs`、`cloudflare/migrations/0001`～`0007`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：新增 `F-01`、`F-03`、`F-04`，修改 `F-02`（新增 `scene-v4-cleanup-preview` / `apply` 入口）；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-01`、`F-02`、`F-03`、`F-04` 落實「實作具名 Local 清理引擎並在隔離 Miniflare 驗證真實 21 表 FK、混合輪阻斷與保護指紋」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：實作 `rain-bookshop-v4-cleanup-policy.mjs`：鎖定真實 9 張保護表（`auth_accounts`、`auth_external_identities`、`auth_sessions`、`auth_refresh_tokens`、`auth_email_challenges`、`common_rate_limit_buckets`、`user_profiles`、`user_media_assets`、`match_conditions`）與私人 `FILES` R2 指紋；實作非測試混合輪阻斷（`RB4-T-334`）、12 張業務／內容表子至父原子刪除（含具名測試對 `match_invitations` 刪除以解除永久排除）與 `STORY_CONTENT` R2 `RetainedKeys` 差集清理，於隔離 Miniflare D1/R2 全數驗證通過。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C01-1`／正常（`RB4-T-296`～`303` 隔離清理） | 於隔離 Miniflare 21 張表載入舊 V2/V3 場次、具名 V4 測試 Round（含 `declined` 邀請）與真實帳號照片化身，傳入模擬 Gate B 核准執行 `preview` -> `apply` | 舊場次、測試 Round、舊 Catalog 與無引用 R2 物件清零；9 張保護表與私人 `FILES` 指紋 100% 不變；18 項 V4 共用素材完整保留；`PRAGMA foreign_key_check` 為 0 列 | 中斷後重跑 `apply` 冪等完成不報錯 | `SD-007-V01`／`scene-event-v4-cleanup.integration.test.ts` + `rain-bookshop-v4-cleanup-policy.test.mjs` |
| `C01-2`／安全阻斷（`RB4-T-334` 混合輪、缺 Gate B、`remote: true`） | 注入非具名測試 Round 混合引用舊版 Catalog、或 `approvedByUser: false`、或設定含 `remote: true` | 分別拋出 `CLEANUP_MIXED_OR_UNPLANNED_REFERENCE`、`GATE_B_USER_APPROVAL_REQUIRED`、`V4_CLEANUP_TARGET_FORBIDDEN`，D1 與 R2 零變動 | 100% 阻擋誤刪非測試資料或遠端資料庫 | `SD-007-V01`／`scene-event-v4-cleanup.integration.test.ts` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `rain-bookshop-v4-cleanup-policy.test.mjs` 與 `scene-event-v4-cleanup.integration.test.ts` | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tools/tests/rain-bookshop-v4-cleanup-policy.test.mjs` | `rain-bookshop-v4-cleanup-policy.mjs` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-01`、`F-02` 並跑通單元與真 Miniflare 21 表清理整合測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `node --test tools/tests/rain-bookshop-v4-cleanup-policy.test.mjs && npm --prefix cloudflare test -- scene-event-v4-cleanup` | 含 `RB4-T-334` 在內之全部清理政策測試 100% 通過 | 待回填 |
| 3／Refactor 與回歸 | 執行 `npm test` 與 `npm run test:worker` 確認零回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm test && npm run test:worker` | 全部通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-01`、`F-02`、`F-03`、`F-04`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-007-S02`（注意：本步嚴禁對真實 default local 執行 `apply` 或刪除任何 V3 檔案！）。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-007-S02：【硬性人工關卡】彙整 Gate A 證據並停止等待使用者本人親自實玩核准精確 V4 SHA（Gate B）

**對應成果與責任**：唯一負責 `SD-007-I02`；對應 TDD：`RB4-T-295`；涉及檔案：`F-06`；驗證 ID：`SD-007-V02`；由 `SD-007` 執行者負責。  
**開始條件與前置證據**：`SD-006-S06`（Gate A 321 項）與 `SD-007-S01`（隔離清理驗證）通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `docs/verification/SPEC-001-RainBookshopV4-Verification.md`、`SPEC §5.1–5.2`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：更新 `F-06`（記錄 Gate A 321 項實測證據與待試玩之精確 V4 SHA-256）；**未獲本人回覆前嚴禁執行清理或勾選 `RB4-T-295`**；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-06` 落實「【硬性人工關卡】彙整 Gate A 證據並停止等待使用者本人親自實玩核准精確 V4 SHA（Gate B）」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：將 Gate A 實測摘要與本地試玩啟動方式寫入 `Verification.md` 並呈現予使用者，邀請使用者本人親自遊玩雨聲書店 V4 完整體驗並確認劇情節奏、美術素材、音效與四結局品質；收到本人明確簽認該精確 SHA 後，將核准日期、SHA 與原話依據記錄於 `Verification.md` 完成 `RB4-T-295`。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C02-1`／本人實玩核准（`RB4-T-295` `@manual`） | 使用者本人於本地環境親自試玩 V4 並明確回覆核准當前精確 `narrativeSha256` / `sceneSha256` | 於 `Verification.md` 如實記錄核准日期、精確 SHA 與可追溯對話依據，`RB4-T-295` 轉為 `Verified` | 絕不由自動化腳本或 AI 代簽 | `SD-007-V02`／`SPEC-001-RainBookshopV4-Verification.md` |
| `C02-2`／本人提出體驗調整或尚未回覆 | 使用者尚未回覆或要求調整演出細節 | 保持 `Blocked` / 等待狀態，**0 次執行 `scene-v4-cleanup-apply`**，既有 V3 內容完整保留 | 若涉及設計變更先走升版確認再重驗 Gate A | `SD-007-V02`／`SPEC-001-RainBookshopV4-Verification.md` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 不適用形式 Red（人工實玩驗收關卡）：執行 Gate A 稽核輸出精確 SHA 寫入 `Verification.md` 並呈現予使用者 | `C:\GitProjects\gamenenstyle\datinghigh` | `node tools/rain-bookshop-v4-gate-a-audit.mjs` | 確認 `gateAReady: true` 與精確 V4 SHA 後暫停等待使用者本人試玩回覆 | 待回填 |
| 2／Green | 取得使用者本人明確核准後，回填 `Verification.md` Gate B 核准紀錄 | `C:\GitProjects\gamenenstyle\datinghigh` | `git diff --check docs/verification/SPEC-001-RainBookshopV4-Verification.md` | 本人 Gate B 紀錄完整無誤，`RB4-T-295` 正式通過 | 待回填 |
| 3／Refactor 與回歸 | 不適用程式碼重構；核對核准之 SHA 與 `contracts/rain-bookshop-v4.json` 100% 一致 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm test` | SHA 一致，解鎖 `SD-007-S03` | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-06`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 僅在取得**使用者本人針對精確 V4 narrative/scene SHA-256 之明確核准**後，才可啟動 `SD-007-S03`！。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-007-S03：執行已知 Default Local 停寫、備份、具名舊版與測試輪清理並移除無用舊 V3 檔案

**對應成果與責任**：唯一負責 `SD-007-I03`；對應 TDD：跨步驟產品前置（由後續整合測試共同覆核）；涉及檔案：`F-02`、`F-05`、`F-06`（及微調 `tools/scene-event-publish-policy.mjs` 移除舊 V3 分支引用）；驗證 ID：`SD-007-V03`；由 `SD-007` 執行者負責。  
**開始條件與前置證據**：**已取得 `SD-007-S02` 使用者本人對精確 V4 SHA 之明確 Gate B 核准**。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `SPEC §5.3–5.4`、`tools/local.mjs`、`tools/rain-bookshop-v4-cleanup-policy.mjs`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：透過 `tools/local.mjs` 操作已知 default local（禁 `--remote`），移除 `F-05` 具名無用舊 V3 檔案並記錄備份與指紋證據至 `F-06`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-02`、`F-05`、`F-06`（及微調 `tools/scene-event-publish-policy.mjs` 移除舊 V3 分支引用） 落實「執行已知 Default Local 停寫、備份、具名舊版與測試輪清理並移除無用舊 V3 檔案」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：1) 執行 `npm run dev:platform:stop` 確保 `8787` 無 writer；2) 執行 `scene-v4-cleanup-preview` 檢視具名舊版 Catalog 與 V4 測試 Round 清單及 9 張保護表指紋；3) 執行 `scene-v4-cleanup-apply`（自動先備份至 `.local/backups/` 新檔，再原子清理 D1 與 R2 差集並核驗保護指紋不變）；4) 移除工作區僅舊版使用之 `contracts/rain-bookshop-last-order.json`、`contracts/rain-bookshop-before-rain-stops.json`、`tools/rain-bookshop-v3-policy.mjs`、`tools/tests/rain-bookshop-v3.test.mjs` 及無引用舊專屬素材（保留 18 項 V4 沿用素材與通用引擎測試）。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C03-1`／正常（Default Local 實機清理與退場） | 對已停寫之 default local 執行預覽、備份、套用清理與無用舊 V3 檔案移除 | 9 張保護表與私人 `FILES` R2 清理前後 SHA-256 指紋 100% 相等；`content_story_catalog` 唯一 `published` 為 V4 `rain-bookshop-before-rain-stops@v2`；全倉單元／整合測試全綠 | 備份檔完整建立於 `.local/backups/` | `SD-007-V03`／`SPEC-001-RainBookshopV4-Verification.md` |
| `C03-2`／保護檢查 | 執行 `PRAGMA foreign_key_check` 與檢查 18 項沿用素材存在性 | `foreign_key_check` 回傳 0 列；V4 所需 80 項素材引用 100% 完好無損 | 零孤兒紀錄、零誤刪共用素材 | `SD-007-V03`／`SPEC-001-RainBookshopV4-Verification.md` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 停止本地平台並執行具名預覽檢查待清清單與保護指紋 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run dev:platform:stop && node tools/local.mjs scene-v4-cleanup-preview --name v4-final-cleanup` | 產生具名預覽計畫並確認無非測試混合輪衝突 | 待回填 |
| 2／Green | 執行具名清理套用（含自動備份與保護指紋重驗）並移除具名舊 V3 專屬檔 | `C:\GitProjects\gamenenstyle\datinghigh` | `node tools/local.mjs scene-v4-cleanup-apply --name v4-final-cleanup` | 輸出 `status: "complete"` 且保護資料指紋 `unchanged: true` | 待回填 |
| 3／Refactor 與回歸 | 重跑全套單元與模組測試確認移除舊 V3 專屬檔後零壞引用 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm test && npm run check:foundation && npm run test:worker && npm run test:server && npm run test:client` | 全模組 100% 編譯與測試通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-02`、`F-05`、`F-06`（及微調 `tools/scene-event-publish-policy.mjs` 移除舊 V3 分支引用））內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-007-S04`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-007-S04：於清理後 Default Local 執行 Web 與 Android 雙平台全新配對 `CleanReplay` 回歸驗收

**對應成果與責任**：唯一負責 `SD-007-I04`；對應 TDD：`RB4-T-304`、`RB4-T-305`、`RB4-T-306`、`RB4-T-307`、`RB4-T-308`、`RB4-T-309`；涉及檔案：`F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收）；驗證 ID：`SD-007-V04`；由 `SD-007` 執行者負責。  
**開始條件與前置證據**：`SD-007-S03` 完成。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `SPEC §5.5`、`RB4-BDD-055`（`RB4-T-304`～`309`），以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：回填雙端 `CleanReplay` 實測結果至 `F-06`（`Verification.md`）；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收） 落實「於清理後 Default Local 執行 Web 與 Android 雙平台全新配對 `CleanReplay` 回歸驗收」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：重新建置匯出前端並啟動清理後的 default local 平台，分別在正式 Web 與真實 Android 上以保留之既有帳號從頭執行：全新搜尋配對→發送並接受邀請→自動進入唯一正式首場 V4→完整探索／破冰／暴雨救書／結局小票→自由聊天→雙方同意下一場重玩→確認安全退出，驗證舊版完全不可選且配對／聊天／退出全正常。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C04-1`／Web 乾淨重玩（`RB4-T-308`） | 清理後於 Web 雙視窗以保留帳號重新配對、完場、聊天、重玩與退出 | 配對邀請不再受先前測試輪殘留阻擋，100% 進入 V4 並順利完場與退出 | 舊版故事 0 次出現於候選或抽選池 | `SD-007-V04`／`scene-event-v4.spec.ts` (`CleanReplay`) |
| `C04-2`／Android 乾淨重玩（`RB4-T-309`） | 清理後於真實 Android 裝置／模擬器重新配對、完場、聊天與安全退出 | 原生手勢、音訊、結局小票與退出全流程 100% 通過 | Web 與 Android 各自具備清理後獨立證據 | `SD-007-V04`／`scene-event-v4.mjs` (`CleanReplay`) |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 匯出最新前端並啟動清理後本地平台執行健康檢查 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run export:web && npm run build:e2e-host` | 建置 0 錯誤，準備執行雙端乾淨重玩 | 待回填 |
| 2／Green | 序列執行 Web 與 Android `CleanReplay` 驗收套件 | `C:\GitProjects\gamenenstyle\datinghigh` | `npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts -g "CleanReplay" && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4 -Pattern "CleanReplay"` | `RB4-T-304`～`309` 全數實測通過 | 待回填 |
| 3／Refactor 與回歸 | 執行 `node tools/local.mjs scene-status` 核對資料庫狀態並正常停機 | `C:\GitProjects\gamenenstyle\datinghigh` | `node tools/local.mjs scene-status && npm run dev:platform:stop` | 狀態乾淨無異常 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收））內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-007-S05`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-007-S05：執行全案 15 AC / 58 BDD / 337 TDD 深度稽核並同步 `Verification`、來源規格與 `overview/` 結案

**對應成果與責任**：唯一負責 `SD-007-I05`；對應 TDD：跨步驟產品前置（由後續整合測試共同覆核）；涉及檔案：`F-06`、`F-07`、`F-08`（及同步本 `final/` SD 進度）；驗證 ID：`SD-007-V05`；由 `SD-007` 執行者負責。  
**開始條件與前置證據**：`SD-007-S01`～`S04` 全部通過（全案 337 項 TDD 均已具備真實有效驗收證據）。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `SPEC`、`BDD`、`TDD`、`Verification.md`、`AGENTS.md Overview 同步矩陣`、`overview/01`～`04`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：就地更新 `F-06`、`F-07`、`F-08` 與 `docs/sd/SPEC-001-RainBookshopV4/final/` 內對應 `I` 葉節點證據；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-06`、`F-07`、`F-08`（及同步本 `final/` SD 進度） 落實「執行全案 15 AC / 58 BDD / 337 TDD 深度稽核並同步 `Verification`、來源規格與 `overview/` 結案」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：依 `spec-bdd-implementation-deep-audit` 標準逐項比對 15 個 AC、58 個 BDD（含 42 個 `@frontend` Web+Android 雙端證據與 1 個 `@manual` Gate B）、337 個 TDD 與原稿 2,245 行完整性；若有缺漏退回原唯一寫入包修補重驗，確認 100% 達成後就地勾選來源 checkbox、更新唯一進度、依矩陣同步 `overview/01-architecture/04-module-map.md`、`03-contracts/01-api-contracts.md`、`02-data-contracts.md`、`02-development-guidelines/03-ai-workflow-stages.md`，並執行連結與 `git diff --check` 最終檢查。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-1`／全量深度稽核通過 | 逐項核對 15 AC、58 BDD、337 TDD、42 個 SD `I` 葉節點與 `Verification.md` 實測紀錄 | SPEC `15/15`、BDD `58/58`、TDD `337/337`、SD `I: 42/42` 100% 具備真實對應證據，無任何孤兒或代簽 | 禁止新增旁支進度報告 MD 或每日流水帳 | `SD-007-V05`／`SPEC-001-RainBookshopV4-Verification.md` |
| `C05-2`／文件與安全檢查 | 掃描 `overview/` 連結有效性、秘密字串掃描與 `git diff --check` | `git diff --check` 退出碼 `0`，所有相對連結存在，0 秘密外洩 | 完成前檢查清單 6 項全數勾選成立 | `SD-007-V05`／`git diff --check` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 執行全量測試矩陣與未勾選項盤點掃描 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run check:foundation && npm test && npm run test:worker && npm run test:server && npm run test:client` | 確認所有自動化測試最新狀態全綠 | 待回填 |
| 2／Green | 就地同步 `Verification.md`、來源 `SPEC`/`BDD`/`TDD` checkbox、`final/` 證據與受影響 `overview/` 文件 | `C:\GitProjects\gamenenstyle\datinghigh` | `git diff --check` | 0 空白／格式錯誤，全部權威文件進度與證據一致 | 待回填 |
| 3／Refactor 與回歸 | 執行 `git status --short` 最終交付盤點，確認無殘留臨時檔或秘密 | `C:\GitProjects\gamenenstyle\datinghigh` | `git status --short` | 工作樹乾淨受控，正式向使用者交付結案報告 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-06`、`F-07`、`F-08`（及同步本 `final/` SD 進度））內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 全案 `SPEC-001-RainBookshopV4` 100% 驗收交付結案（未獲新授權前不自動進入 `AffectionAndFeedback`）。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

## 測試計劃與實際驗證方式

| 驗證 ID／來源 Todo／步驟 ID | 層級／行為／平台 | 環境與前置資料／案例 ID | 工作目錄與實際命令或畫面操作 | 預期結果／斷言 | 實作／測試位置 | 實際結果、時間、log／畫面證據 | 驗收狀態／等價依據或恢復條件 |
|---|---|---|---|---|---|---|---|
| `SD-007-V01`／`SD-007-I01`／`SD-007-S01` | Unit＋Integration（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C01-1`、`C01-2`（共 9 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`node --test tools/tests/rain-bookshop-v4-cleanup-policy.test.mjs && npm --prefix cloudflare test -- scene-event-v4-cleanup` | 含 `RB4-T-334` 在內之全部清理政策測試 100% 通過 | `F-01`、`F-02`、`F-03`、`F-04` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-007-V02`／`SD-007-I02`／`SD-007-S02` | E2E（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C02-1`、`C02-2`（共 1 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`git diff --check docs/verification/SPEC-001-RainBookshopV4-Verification.md` | 本人 Gate B 紀錄完整無誤，`RB4-T-295` 正式通過 | `F-06` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-007-V03`／`SD-007-I03`／`SD-007-S03` | 單元／工具驗證（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C03-1`、`C03-2`（共 0 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`node tools/local.mjs scene-v4-cleanup-apply --name v4-final-cleanup` | 輸出 `status: "complete"` 且保護資料指紋 `unchanged: true` | `F-02`、`F-05`、`F-06`（及微調 `tools/scene-event-publish-policy.mjs` 移除舊 V3 分支引用） | 待回填（設計階段未執行） | `Incomplete` |
| `SD-007-V04`／`SD-007-I04`／`SD-007-S04` | Unit＋Integration＋E2E（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C04-1`、`C04-2`（共 6 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts -g "CleanReplay" && pwsh -NoProfile -File tools/test-android.ps1 -Suite scene-event-v4 -Pattern "CleanReplay"` | `RB4-T-304`～`309` 全數實測通過 | `F-06`（執行 `SD-006` 已建之雙端 E2E `CleanReplay` 驗收） | 待回填（設計階段未執行） | `Incomplete` |
| `SD-007-V05`／`SD-007-I05`／`SD-007-S05` | 單元／工具驗證（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C05-1`、`C05-2`（共 0 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`git diff --check` | 0 空白／格式錯誤，全部權威文件進度與證據一致 | `F-06`、`F-07`、`F-08`（及同步本 `final/` SD 進度） | 待回填（設計階段未執行） | `Incomplete` |

## 依賴關係與執行順序

| 任務／交付物 | 唯一執行／整合／驗收責任 | 前置／契約版本／開始條件 | 可寫範圍及排除 | 共享環境／隔離／互斥 | 安全並行或循序理由 | 完成及回傳條件 |
|---|---|---|---|---|---|---|
| `SD-007-實玩GateB與Local清理結案交付`（`SD-007-S01`～`SD-007-S05`） | SD-007 清理與結案執行者＋使用者本人（唯一有權簽認 `RB4-T-295` Gate B）／開發主責人最終全案稽核 | 使用者明確核准 `final` `1.0.0`；前置依賴：`SD-006-S06` 技術 Gate A（前段 321 項）已通過；契約 `SD-contract-v2`／`CNT-001`～`004` | 僅限本包 `F-01`～`F-08`；嚴禁跨包寫入他包檔案 | 單元與隔離 Miniflare 測試獨立運行；涉及 `127.0.0.1:8787` 或 Android ADB 之測試由 `SD-006`/`SD-007` 嚴格單一序列獨佔 | 依前置資料流與共享環境鎖定採嚴格有序關卡推進 | 本包 `I01`～`I05` 全數取得真實通過證據、無未提交髒檔且既有回歸全綠 |

全案關鍵依賴鏈：`SD-003-S01`（真 D1 時鐘探針）→ `SD-001` →（`SD-002` || `SD-004`）→ `SD-003-S02..S07` → `SD-005` → `SD-006`（Gate A 321 項）→ `SD-007-S02`（本人 Gate B）→ `SD-007-S03..S05`（具名清理、乾淨重玩、337/337 深度稽核與交付）。

## 風險、設計變更與人工確認紀錄

| ID／原設計版本 | 發現證據與為何不能照案實作 | 白話實務情境／功能影響 | 建議／替代與影響 SD／BDD／TDD | 負責者／觸發／成本時程 | 使用者決策／核准範圍／新版本 | 失效證據／重驗與恢復條件 |
|---|---|---|---|---|---|---|
| `FINAL-APPROVAL-GATE`／`1.0.0` | 依 `SD-contract-v2` 與 `design-decision` 規範，整合產出之 `final/` 未獲使用者明確確認前不得啟動產品開發 | 確保所有跨候選取捨（真實路徑修正、D1 `CASE ... json()` 回滾、21 表清理拓樸）符合使用者預期 | 審閱核准 `final` `1.0.0` 後轉為 `Ready for carefully-done`（影響 `SD-001`～`SD-007`） | 使用者本人／設計交付時觸發 | **待使用者明確確認（`Awaiting approval`）** | 取得明確核准後解除阻斷；後續若需改動已核准設計須先停工討論並遞增設計版本 |

已寫明的檔案、邏輯、介面、資料、依賴、契約或驗證方式若在實作期發現需變更，必須先停止本需求後續實作並向使用者報告確認，更新獲准設計後再續作；一般進度與證據回填不變更設計版本。

## 實現檢查清單／Todo

本區是本包 SD 進度的唯一計數來源。每個可勾選項都是葉節點，父分組只用標題。設計完成後只勾 D，I 要有有效實際驗收證據才可勾選。

### D：設計葉節點

- [x] **SD-007-D01** 完成真實 21 張 D1 表 FK 清理拓樸、9 張保護表指紋、混合輪阻斷與 R2 `RetainedKeys` 差集設計
  - 類型／唯一分組：D／清理引擎設計
  - 來源／責任／依賴：`RB4-AC-013`、`RQ-04`、`RA-08`；`SD-007` 負責
  - 完成條件／設計證據：`CORE-05`、`F-01`～`F-04` 與 `SD-007-S01` 已完整定義且修正全部真實表名（已通過全量一致性桌面稽核）
- [x] **SD-007-D02** 完成使用者本人實玩 Gate B（`RB4-T-295`）硬性簽認關卡與阻斷保護設計
  - 類型／唯一分組：D／人工 Gate B 設計
  - 來源／責任／依賴：`RB4-AC-012`,`013`、`RB4-BDD-052`；`SD-007`＋使用者本人負責
  - 完成條件／設計證據：`SD-007-S02` 硬性停止關卡與精確 SHA 簽認條件已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-007-D03** 完成 Default Local 停寫備份清理、舊 V3 無用檔案退場與雙端 `CleanReplay` 驗收設計
  - 類型／唯一分組：D／清理執行與重玩設計
  - 來源／責任／依賴：`RB4-AC-013`,`014`、`RB4-BDD-053`～`055`；`SD-007` 負責
  - 完成條件／設計證據：`F-02`,`F-05` 與 `SD-007-S03`/`S04` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-007-D04** 完成全案 15 AC / 58 BDD / 337 TDD 深度稽核與 `Verification`/來源/`overview` 同步交付設計
  - 類型／唯一分組：D／深度稽核與交付設計
  - 來源／責任／依賴：`RB4-AC-014`,`015`、`AGENTS.md`；`SD-007` 負責
  - 完成條件／設計證據：`F-06`～`F-08` 與 `SD-007-S05` 已完整定義（已通過全量一致性桌面稽核）

### I：實作驗證葉節點

- [ ] **SD-007-I01** 完成「實作具名 Local 清理引擎並在隔離 Miniflare 驗證真實 21 表 FK、混合輪阻斷與保護指紋」並取得實測驗收證據
  - 類型／唯一分組：I／Unit/Integration 實作驗證
  - 來源／責任／依賴：`RB4-T-296`、`RB4-T-297`、`RB4-T-298`、`RB4-T-300`、`RB4-T-301`、`RB4-T-302`…等 9 項唯一 TDD；`SD-007` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-007-S01`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-007-V01` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-007-I02** 完成「【硬性人工關卡】彙整 Gate A 證據並停止等待使用者本人親自實玩核准精確 V4 SHA（Gate B）」並取得實測驗收證據
  - 類型／唯一分組：I／E2E 實作驗證
  - 來源／責任／依賴：`RB4-T-295`；`SD-007` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-007-S02`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-007-V02` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-007-I03** 完成「執行已知 Default Local 停寫、備份、具名舊版與測試輪清理並移除無用舊 V3 檔案」並取得實測驗收證據
  - 類型／唯一分組：I／產品前置與驗證
  - 來源／責任／依賴：支撐下游跨包驗收；`SD-007` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-007-S03`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-007-V03` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-007-I04** 完成「於清理後 Default Local 執行 Web 與 Android 雙平台全新配對 `CleanReplay` 回歸驗收」並取得實測驗收證據
  - 類型／唯一分組：I／Unit/Integration/E2E 實作驗證
  - 來源／責任／依賴：`RB4-T-304`、`RB4-T-305`、`RB4-T-306`、`RB4-T-307`、`RB4-T-308`、`RB4-T-309`；`SD-007` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-007-S04`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-007-V04` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-007-I05** 完成「執行全案 15 AC / 58 BDD / 337 TDD 深度稽核並同步 `Verification`、來源規格與 `overview/` 結案」並取得實測驗收證據
  - 類型／唯一分組：I／產品前置與驗證
  - 來源／責任／依賴：支撐下游跨包驗收；`SD-007` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-007-S05`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-007-V05` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`

## 檢查點與續作交接

| 日期／任務／執行者 | 已完成並驗收／證據 | 尚未驗收／停止原因 | 寫入責任與共享資源現況 | 所需決策／恢復條件與查核 | 續作對象、實際啟動結果／下一步 |
|---|---|---|---|---|---|
| 2026-11-26／`/design-decision` 建立 `SD-007`／`Antigravity (Gemini 4 Carbon (High))` | 設計葉節點 `D`: 4/4 完成並通過桌面稽核 | 實作葉節點 `I`: 0/5 未開始；依規範停於 `Awaiting approval` 等待人工核准 | 產品程式碼、測試、DB 與設定 **0 修改**；無運行中背景伺服器或鎖定資源 | 使用者明確核准 `SPEC-001-RainBookshopV4/final` 設計版本 `1.0.0` | 核准後交由 `/carefully-done` 核對基準快照並按全案步驟順序執行 |

**鎖定文件包／版本／核准依據**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/plans/SD-007-實玩GateB與Local清理結案交付.md`／版本 `1.0.0`／待使用者明確核准（快照見 `../00-overview.md`）。  
**目前 I-ID／步驟 ID／子階段／已發生副作用**：尚未開始（待進入 `SD-007-I01`／`SD-007-S01`）；已發生產品副作用：**無**。  
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
**執行狀態／驗收狀態／剩餘事項**：`Planned`／`Incomplete`／等待使用者明確核准 `final` `1.0.0` 後由 `/carefully-done` 執行 `SD-007-I01`～`I05`
