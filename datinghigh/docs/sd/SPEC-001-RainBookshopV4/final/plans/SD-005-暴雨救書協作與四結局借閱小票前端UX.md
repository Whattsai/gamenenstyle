# SD-005-暴雨救書協作與四結局借閱小票前端UX — 分項實作設計

**功能／工作包 ID**：`SD-005-暴雨救書協作與四結局借閱小票前端UX`  
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[V4 作者原稿 JSON](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)  
**文件包／AI／模型／批次**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/`／AI：`Antigravity`／模型：`Gemini 4 Carbon (High)`／批次：`final`  
**設計版本／契約版本／優先級**：`1.0.0`／`SD-contract-v2`／高（P1）  
**執行狀態／驗收狀態／最後更新**：`Planned`（未開發）／`Incomplete`（待核准後實測驗收）／2026-11-26  
**執行／整合／驗收責任**：SD-005 前端後半與頂層組裝執行者／跨系統雙端 E2E 驗收由 SD-006（Gate A）與 SD-007（Gate B / CleanReplay）負責  
**來源與程式碼基準、核准設計快照**：見 [SD 總覽（../00-overview.md）](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

只計本文件「實現檢查清單／Todo」中的唯一葉節點；摘要、里程碑及引用不再計數。設計與實作驗證分開，設計完成不勾選產品完成。

| 指標 | 完成／總數 | 進度條與百分比 | 依據 |
|---|---|---|---|
| 設計完成度（D） | 4 / 4 | `[████████████████████] 100.0%` | 本包 `SD-005-D01`～`D04` 已完成完整設計與桌面一致性稽核 |
| 本包 BDD 設計涵蓋率 | 32 / 32 | `[████████████████████] 100.0%` | 本包涉及之全部唯一 BDD Scenario 均已完整分解至產品符號與步驟（跨包完整性見 [追溯矩陣](../02-traceability.md)） |
| 本包 TDD 設計涵蓋率 | 30 / 30 | `[████████████████████] 100.0%` | 本包主責驗證之 30 項唯一 TDD 已 100% 映射至具體步驟、測試檔與命令 |
| 實作驗證完成度（I） | 0 / 5 | `[░░░░░░░░░░░░░░░░░░░░] 0.0%` | 本包 `SD-005-I01`～`I05` 設計階段未開發，待人工核准 `final` 後實作驗收 |

### 分層／分組進度追蹤

| 唯一分組／層 | D 完成／總數 | I 完成／總數 | 進行中／待開始 | 執行狀態 | 驗收狀態／證據 |
|---|---|---|---|---|---|
| 設計葉節點（D） | 4 / 4 | 0 / 0 | 0 / 0 | `Ready for review` | 桌面設計稽核通過（待使用者核准 `final` `1.0.0`） |
| 實作與驗證葉節點（I；主責 TDD：Unit 30／Integration 0／API 0／E2E 0） | 0 / 0 | 0 / 5 | 0 / 5 | `Planned` | `Incomplete`；證據待回填至 `Verification.md` |

### 當前 Sprint 狀態

| 當前階段／Todo ID／步驟 ID | Red–Green–Refactor 子階段 | 負責者 | 開始／預計完成及依據 | 下一步 ID／最後更新 |
|---|---|---|---|---|
| 設計決策交付待審／尚未啟動 `SD-005-I01`（`SD-005-S01`） | 不適用（設計階段不啟動產品開發） | SD-005 執行者 | 待使用者明確核准 `final` `1.0.0` 且滿足首步前置後啟動（無硬性預設期限） | 核准且前置滿足後執行 `SD-005-S01`／2026-11-26 |

### 里程碑

僅引用 Todo ID，不建立第二套可計數 checkbox。

| 里程碑 | 必要葉節點／前置 SD | 驗收與整合條件 | 狀態／證據 |
|---|---|---|---|
| `SD-005-M0`：分項設計與步驟稽核就緒 | `SD-005-D01`～`D04` | 檔案路徑 100% 對齊真實 repo、單一寫入無衝突、每步具案例與命令 | 設計已完成（`Awaiting approval`） |
| `SD-005-M1`：本包全部實作與驗證葉節點達成 | `SD-005-I01`～`I05`（依賴前置見步驟表） | 本包全部 `SD-005-V01`～`SD-005-V05` 實測通過且既有回歸全綠 | `Incomplete` |
| `SD-005-M2`：跨包 Gate A／Gate B 與最終深度稽核結案 | 配合 `SD-006` 與 `SD-007-I01`～`I05` | 全案 337/337 TDD 驗證完成、本人 Gate B 通過並同步 `Verification.md` | `Incomplete` |

### 關鍵指標

| 指標 | 已確認目標與來源 | 當前值 | 實際驗證／證據或限制 |
|---|---|---|---|
| 本包主責 TDD 設計涵蓋與實測通過數 | 設計涵蓋 30/30；實測通過目標 30/30（`SPEC`／`TDD`） | 設計涵蓋 `100.0%`；實測 `0 / 30` | 設計階段未執行程式修改或測試代簽 |
| 架構與資料邊界遵守度 | 21 表、0 新欄、0 Trigger、0 新公開 API、原稿逐 scalar 不變、單一檔案寫入責任 | 設計 `100%` 符合 | 見下方「檔案改動設計」與 [02-traceability.md](../02-traceability.md) |

### 每日進度記錄

依專案 `AGENTS.md` 基本規範，禁止記錄每日／批次歷史進度流水帳；此處僅就地保留當前有效狀態。

| 日期 | 完成 Todo／有效證據 | 阻斷／剩餘 | 下一步／責任 |
|---|---|---|---|
| 2026-11-26 | 完成 `SD-005` 分項設計 `1.0.0`（`D`: 4/4，涵蓋 10 個檔案項目與 5 個有序步驟） | 實作 `I`: 0/5；等待使用者明確核准 `final` `1.0.0` | 取得核准並滿足前置後由 `/carefully-done` 依序執行 `SD-005-S01` |

## 功能概述

負責在真實平面目錄 `frontend/client/src/` 下實作 V4 後半暴雨危機、可配置 90 秒雙向手勢救書協作、15 秒暫緩橫幅、四結局、夾書籤儀式與《今日借閱小票》記憶卡元件（`TimedRescueOverlay.tsx`、`BookmarkAndEndingPanel.tsx`），擴充天氣／演出／音訊／連線與舞台框架（`SceneWeather.tsx`、`SceneStoryMotion.tsx`、`StoryAudio.tsx`、`StoryStage.tsx`、`ADVStage.tsx`、`RealtimeRoomClient.ts`），並於 `StoryExperienceScreen.tsx` 唯一寫入完成前半（`SD-004`）與後半全場面頂層組裝、8×3 動態聊天建議、暫緩重入自動恢復、401/403/退出立即清理全數私有記憶、有界媒體快取與 `export:web` 靜態建置驗證。

## 功能需求與來源追溯

| MVP／SPEC 項目 | BDD Scenario | TDD 測試項 | 系統設計 ID／本包 Todo／步驟 ID | 驗收條件 | 跨包共同成果與整合責任 |
|---|---|---|---|---|---|
| `SPEC-001-RainBookshopV4` `RB4-AC-005` | `RB4-BDD-019` ChatSuggestions | `RB4-T-103` | SYS-008／SD-005-I05／SD-005-S05 | Then 各情境3句原文及合法篩選；And 未點不發送、點擊由真人送出；And 聊天仍可用且不冒充NPC或對方 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-007` | `RB4-BDD-021` DirectorTrigger | `RB4-T-115` | SYS-008／SD-005-I01／SD-005-S01 | Then 滿足雙條件才觸發且warm必先完成提問卡；And 同場只建立一次director事件及ready；And 未完成彩蛋不阻塞、非按鈕觸發 | 跨包共同成果：SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-007` | `RB4-BDD-022` StormPresentation | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-006） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；And 原合法鏡位與權威世界一致；And 重連還原當前狀態不重播舊cue或假提交 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-023` ReadyGate | `RB4-T-126` | SYS-008／SD-005-I02／SD-005-S02 | Then 單方等待不扣秒；And 雙ready原子建立唯一deadline與題組；And 雙端同一權威倒數並顯示原文等待提示 | 跨包共同成果：SD-001 + SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-024` DurationConfig | （本包提供產品實作支撐；主計測試於 SD-001／SD-002） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 總時長來自釘選durationSeconds不硬編碼；And 舊場次90秒、新場次120秒且不熱改deadline；And 無效整數、門檻越界、溢位或缺設定拒發；And 發布前驗數值文案及全部時間門檻，暫緩中的舊版仍依原時長恢復 | 跨包共同成果：SD-001 + SD-002 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-025` RescueSetPin | （本包提供產品實作支撐；主計測試於 SD-001／SD-002／SD-003） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 只釘選原兩組之一；And 每步書ID與區域、線索文字符合草稿；And 重連／重送不重抽且不向未授權方回完整解答；And set A 第1、3本保留在 shelves 兩個不同位置；四書台不等於四不同 Area，不更改原稿 | 跨包共同成果：SD-001 + SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-026` RescueSteps | `RB4-T-143` | SYS-008／SD-005-I02／SD-005-S02 | Then 權威狀態依角色與步驟轉移；And 只有合法完整上架計1本；And 原文成功回饋、無危險入口操作 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-027` ReverseClues | `RB4-T-149` | SYS-008／SD-005-I02／SD-005-S02 | Then 反轉線索只合法分享才揭露；And 第3本下層、第4本完整鎖扣才增加計數；And 兩組原文toast及合法結果完整；And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-028` WrongRescue | `RB4-T-155` | SYS-008／SD-005-I02／SD-005-S02 | Then 錯書／槽／扣原文回饋；And 不增加rescuedCount、不接受不合法持物或轉移；And UI復位，合法後續仍可完成；And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-029` QuickCallouts | `RB4-T-161` | SYS-008／SD-005-I02／SD-005-S02 | Then 只顯示本人合法原文；And 明確點擊才發舞台泡泡；And 不寫假真人聊天、不洩未分享答案 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-030` WaterStages | `RB4-T-167` | SYS-008／SD-005-I02／SD-005-S02 | Then 各水位階段及原文播報正確；And 過期cue不重播、畫面ceil秒數一致；And client改時鐘不影響D1 deadline；And 各門檻來自釘選內容，發布時驗證數字文案一致 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-031` PauseIdle | `RB4-T-173` | SYS-008／SD-005-I02／SD-005-S02 | Then 未達15秒不暫緩、達門檻暫緩；And ping不更新有效活動；And 保存剩餘時間且原稿暫緩提示正確；And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-032` PauseReconnect | `RB4-T-179` | SYS-008／SD-005-I02／SD-005-S02 | Then 自動恢復且不要求確認按鈕；And 保存剩餘時間、無次數上限、不補扣暫緩秒；And 重連／冷啟動不重設90秒；And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與；And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-008` | `RB4-BDD-033` DeadlineRace | （本包提供產品實作支撐；主計測試於 SD-002／SD-003） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 嚴格早於deadline完成才S；And 等於或晚於deadline拒操作，先按現有已救數結算；And 真D1原子交易只有一結果、同receipt不重複；And 最後毫秒、退出及 timeout 的跨Worker競態均以真 D1 guard／CAS 證明，敗方無副作用 | 跨包共同成果：SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-034` GradeS | `RB4-T-191` | SYS-008／SD-005-I02／SD-005-S02 | Then 立即S不等歸零；And 播放原文及布丁演出；And 走書籤／最終意願而非屋簷 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-035` GradeA | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-006） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then A結算且停止救書；And 原文退至高處、拿鐵及毛巾；And 走書籤／最終意願 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-036` GradeB | `RB4-T-203` | SYS-008／SD-005-I02／SD-005-S02 | Then B直接ev4-04-eaves-shelter；And 停止救書且不可再進危險區或提交；And 屋簷原文與專用鏡位，不走書籤或wish | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-009` | `RB4-BDD-037` AlarmRecovery | （本包提供產品實作支撐；主計測試於 SD-002／SD-003） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 最早到期不被新nonce覆蓋；And 舊session/generation無副作用，合法結果一次提交；And 故障保留權威狀態、503後重試恢復；And 系統 NULL actor 的冪等依固定 operation identity／phase／revision，不依賴 NULL UNIQUE；And 多分頁、權杖刷新／撤銷、失焦及 nonce GC 不覆蓋最早應處理時刻 | 跨包共同成果：SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-038` Bookmark | `RB4-T-214` | SYS-008／SD-005-I03／SD-005-S03 | Then 沿用草稿原句與本人短語；And 未合法公開前對方看不到；And 留書結局可原位翻對方已授權書籤；And 未授權 note 不得由素材、歷史事件或通知取得 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-039` BookmarkValidation | `RB4-T-221` | SYS-008／SD-005-I03／SD-005-S03 | Then 非法輸入400且無寫入；And 0與20合法及emoji scalar一致；And 其他params仍為嚴格ID，禁止任意文字 | 跨包共同成果：SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-040` WishMatrix | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-006） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 兩人keep-talking才ev4-01；And 無quiet且至少一share-books才ev4-02；And 任一quiet即ev4-03；第一份未揭露 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-010` | `RB4-BDD-041` EndingArt | `RB4-T-232` | SYS-008／SD-005-I03／SD-005-S03 | Then 四結局各自正式鏡位與素材；And S/A對應致謝與書籤，B專屬屋簷；And 重連不退回結局前，不出現規格文字 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-042` ReceiptTitle | `RB4-T-238` | SYS-008／SD-005-I03／SD-005-S03 | Then S_fast >=30000、其餘S_normal；And A/B稱號原文符合草稿；And 書、黑膠、救援統計及阿澄附註只來自已提交事實；And 稱號門檻隨釘選版本設定；小票不含自由輸入 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-043` ReceiptCollection | （本包提供產品實作支撐；主計測試於 SD-002／SD-003） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 當前V4同版已完成不同結局含本場；And 其他Round/pair/版本或未完成不計；And 重播不重複累計且0..4有界 | 跨包共同成果：SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-044` ReceiptBadges | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-006） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 各印章只對應原稿條件；And 不成立不顯示、重送不重複；And 小票無真實姓名、Email、照片、私密Profile或未授權內容；And 印章依當前符號實際呈現見證而非背景讀取或自我見證 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-045` NaturalCompletion | （本包提供產品實作支撐；主計測試於 SD-002／SD-003／SD-006） | 跨包產品支撐：SD-005-I01／SD-005-S01 | Then 不額外要求完成按鈕或支線；And 聊天仍可用；雙方同意才建新場；And 新場釘選合法版本、舊投影與cue清除 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-011` | `RB4-BDD-046` SafeExit | `RB4-T-262` | SYS-008／SD-005-I05／SD-005-S05 | Then 退出不受倒數或素材故障阻塞；And 解除占用、終止權限且pair排除；And 無後續訊息／操作／私有圖或舊cue；And 退出與救書競態的敗方不再寫入 | 跨包共同成果：SD-002 + SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-047` StrictTransport | `RB4-T-269` | SYS-008／SD-005-I05／SD-005-S05 | Then 兩transport同規則與receipt；And 400/401/403/409/503依既有契約，無狀態異動；And 拒公開system reconcile、raw manifest與私人key；And raw R2、HTTP、WS 與歷史事件均遵守角色與版本授權，不返回未揭封書或未公開答案／note | 跨包共同成果：SD-002 + SD-003 + SD-005；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-048` AssetReadiness | `RB4-T-272`、`RB4-T-273`、`RB4-T-274` | SYS-008／SD-005-I04／SD-005-S04 | Then fail closed，不以placeholder冒充；And 保留可用聊天/退出及重讀、現有錯誤碼；And 恢復原版且不重抽、不呼叫Gemini；And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材 | 跨包共同成果：SD-003 + SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-049` AvatarReuse | `RB4-T-279`、`RB4-T-280`、`RB4-T-281` | SYS-008／SD-005-I04／SD-005-S04 | Then 保持已核准身份／外觀、資產共用；And 切換或重連不重產；And 失權清圖；真provider證據與回放分開；And 必要真 provider 質量及成本證據不可由回放代簽 | 跨包共同成果：SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-050` PlatformPerformance | `RB4-T-285`、`RB4-T-286`、`RB4-T-287` | SYS-008／SD-005-I01／SD-005-S01 | Then 記錄載入／操作延遲／記憶體／動畫對V3基線；And 離開與失權清資源且有界快取；And 無實測不得標Gate A通過；And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證 | 跨包共同成果：SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |
| `SPEC-001-RainBookshopV4` `RB4-AC-012` | `RB4-BDD-051` GateA | `RB4-T-291`、`RB4-T-292`、`RB4-T-293` | SYS-008／SD-005-I05／SD-005-S05 | Then 真D1/R2/DO與HTTP/WS有精確證據；And Web/Android及素材/內容/權限/效能逐項核對；And 未驗或失敗不得以局部測試通過代簽；And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽 | 跨包共同成果：SD-005 + SD-006；最終雙端／全鏈路整合驗收由 `SD-006` 負責 |

### BDD 行為與產品實作分解

| BDD Scenario／條件或 Examples | 角色／Given | When／操作 | Then／And／But 各結果與副作用 | 實際產品 F-ID／符號／核心分支 | 必要 S／I／V／跨包成果 |
|---|---|---|---|---|---|
| `RB4-BDD-019` ChatSuggestions（@happy-path @critical @frontend） | Given 劇情依8個適用情境進展 | When 逐情境打開聊天、點一則或自由聊天 | Then 各情境3句原文及合法篩選；And 未點不發送、點擊由真人送出；And 聊天仍可用且不冒充NPC或對方 | `F-09`、`F-10`：完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證 | `SD-005-S05`／`SD-005-I05`／`SD-005-V05`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-021` DirectorTrigger（@happy-path @critical） | Given I/A尚未全部達原稿warm/respect與warm/quiet | When 兩方並行提交最後節奏點 | Then 滿足雙條件才觸發且warm必先完成提問卡；And 同場只建立一次director事件及ready；And 未完成彩蛋不阻塞、非按鈕觸發 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003→SD-005） |
| `RB4-BDD-022` StormPresentation（@happy-path @critical @frontend） | Given 伺服器已提交導演事件 | When 兩端接cue或斷線重連 | Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；And 原合法鏡位與權威世界一致；And 重連還原當前狀態不重播舊cue或假提交 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-023` ReadyGate（@happy-path @critical @frontend） | Given 救書ready且一方尚未接手電筒 | When 單方先ready後雙方並行ready | Then 單方等待不扣秒；And 雙ready原子建立唯一deadline與題組；And 雙端同一權威倒數並顯示原文等待提示 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-001→SD-002→SD-003→SD-005） |
| `RB4-BDD-024` DurationConfig（@boundary @critical） | Given 90秒正式內容與另一合法120秒測試版本 | When 發布新配置並讓新舊場次各自ready | Then 總時長來自釘選durationSeconds不硬編碼；And 舊場次90秒、新場次120秒且不熱改deadline；And 無效整數、門檻越界、溢位或缺設定拒發；And 發布前驗數值文案及全部時間門檻，暫緩中的舊版仍依原時長恢復 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-001→SD-002） |
| `RB4-BDD-025` RescueSetPin（@happy-path @critical） | Given 場次尚未抽題組 | When 種子抽選兩組各4步並重連 | Then 只釘選原兩組之一；And 每步書ID與區域、線索文字符合草稿；And 重連／重送不重抽且不向未授權方回完整解答；And set A 第1、3本保留在 shelves 兩個不同位置；四書台不等於四不同 Area，不更改原稿 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-001→SD-002→SD-003） |
| `RB4-BDD-026` RescueSteps（@happy-path @critical @frontend） | Given 任一原題組第1或第2步 | When A分享線索、I跨合法區抽書上滑、A收書裝袋上架 | Then 權威狀態依角色與步驟轉移；And 只有合法完整上架計1本；And 原文成功回饋、無危險入口操作 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-027` ReverseClues（@happy-path @critical @frontend） | Given 已完成前兩本 | When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條 | Then 反轉線索只合法分享才揭露；And 第3本下層、第4本完整鎖扣才增加計數；And 兩組原文toast及合法結果完整；And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-028` WrongRescue（@error-handling @critical @frontend） | Given 救書進行中 | When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動 | Then 錯書／槽／扣原文回饋；And 不增加rescuedCount、不接受不合法持物或轉移；And UI復位，合法後續仍可完成；And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-029` QuickCallouts（@happy-path @critical @frontend） | Given 救書中雙方各有6句快捷 | When 逐句點選並嘗試偽造他方ID | Then 只顯示本人合法原文；And 明確點擊才發舞台泡泡；And 不寫假真人聊天、不洩未分享答案 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-030` WaterStages（@boundary @critical @frontend） | Given 90秒倒數已running | When 權威時間跨75/50/30/15秒及延遲重連 | Then 各水位階段及原文播報正確；And 過期cue不重播、畫面ceil秒數一致；And client改時鐘不影響D1 deadline；And 各門檻來自釘選內容，發布時驗證數字文案一致 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-031` PauseIdle（@boundary @critical @frontend） | Given running時一方合法操作停止 | When 測14999/15000ms閒置且仍有ping | Then 未達15秒不暫緩、達門檻暫緩；And ping不更新有效活動；And 保存剩餘時間且原稿暫緩提示正確；And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-032` PauseReconnect（@alternative-path @critical @frontend） | Given 一方斷線15秒已暫緩 | When 雙方恢復可操作、重複斷線多次 | Then 自動恢復且不要求確認按鈕；And 保存剩餘時間、無次數上限、不補扣暫緩秒；And 重連／冷啟動不重設90秒；And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與；And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-033` DeadlineRace（@boundary @critical） | Given 最後一本只差合法封箱 | When 在deadline-1、deadline、deadline+1ms與timeout競態提交 | Then 嚴格早於deadline完成才S；And 等於或晚於deadline拒操作，先按現有已救數結算；And 真D1原子交易只有一結果、同receipt不重複；And 最後毫秒、退出及 timeout 的跨Worker競態均以真 D1 guard／CAS 證明，敗方無副作用 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003） |
| `RB4-BDD-034` GradeS（@happy-path @critical @frontend） | Given 4本在期限內完成 | When 伺服器提交最後合法封箱 | Then 立即S不等歸零；And 播放原文及布丁演出；And 走書籤／最終意願而非屋簷 | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-035` GradeA（@boundary @critical @frontend） | Given 到期已救2或3本 | When DO喚醒或合法讀取補償 | Then A結算且停止救書；And 原文退至高處、拿鐵及毛巾；And 走書籤／最終意願 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-036` GradeB（@boundary @critical @frontend） | Given 到期已救0或1本 | When 系統結算 | Then B直接ev4-04-eaves-shelter；And 停止救書且不可再進危險區或提交；And 屋簷原文與專用鏡位，不走書籤或wish | `F-01`、`F-10`：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-037` AlarmRecovery（@error-handling @critical） | Given nonce清理、deadline、idle alarm競爭或DO重啟 | When 模擬重複alarm、通知遺失、D1/R2故障及GET補償 | Then 最早到期不被新nonce覆蓋；And 舊session/generation無副作用，合法結果一次提交；And 故障保留權威狀態、503後重試恢復；And 系統 NULL actor 的冪等依固定 operation identity／phase／revision，不依賴 NULL UNIQUE；And 多分頁、權杖刷新／撤銷、失焦及 nonce GC 不覆蓋最早應處理時刻 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003） |
| `RB4-BDD-038` Bookmark（@happy-path @critical @frontend） | Given S/A已結算 | When 逐書三句書籤選一，選填0/20字並各自提交 | Then 沿用草稿原句與本人短語；And 未合法公開前對方看不到；And 留書結局可原位翻對方已授權書籤；And 未授權 note 不得由素材、歷史事件或通知取得 | `F-02`、`F-10`：實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-039` BookmarkValidation（@error-handling @critical） | Given 書籤操作可用 | When 送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note | Then 非法輸入400且無寫入；And 0與20合法及emoji scalar一致；And 其他params仍為嚴格ID，禁止任意文字 | `F-02`、`F-10`：實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`（跨包鏈：SD-002→SD-003→SD-005） |
| `RB4-BDD-040` WishMatrix（@happy-path @critical @frontend） | Given S/A兩方書籤已完成 | When 覆核3×3共9種最終意願組合 | Then 兩人keep-talking才ev4-01；And 無quiet且至少一share-books才ev4-02；And 任一quiet即ev4-03；第一份未揭露 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-041` EndingArt（@happy-path @critical @frontend） | Given 四種結局各已合法提交 | When 看場景光色、距離、原文、互動並重連 | Then 四結局各自正式鏡位與素材；And S/A對應致謝與書籤，B專屬屋簷；And 重連不退回結局前，不出現規格文字 | `F-02`、`F-10`：實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-042` ReceiptTitle（@boundary @critical @frontend） | Given S/A/B權威完成 | When 以S剩29999／30000／30001ms及A/B測小票 | Then S_fast >=30000、其餘S_normal；And A/B稱號原文符合草稿；And 書、黑膠、救援統計及阿澄附註只來自已提交事實；And 稱號門檻隨釘選版本設定；小票不含自由輸入 | `F-02`、`F-10`：實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-043` ReceiptCollection（@boundary @critical） | Given 同Round含重複V4結局、其他pair、其他Round、V3與未完成 | When 完成本場並生成X/4 | Then 當前V4同版已完成不同結局含本場；And 其他Round/pair/版本或未完成不計；And 重播不重複累計且0..4有界 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003） |
| `RB4-BDD-044` ReceiptBadges（@happy-path @critical @frontend） | Given 四印章各有獨立成立或不成立事實 | When 測同書／換曲／對方見符號／quiet+S/A | Then 各印章只對應原稿條件；And 不成立不顯示、重送不重複；And 小票無真實姓名、Email、照片、私密Profile或未授權內容；And 印章依當前符號實際呈現見證而非背景讀取或自我見證 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-045` NaturalCompletion（@happy-path @critical @frontend） | Given 本場已結局、Round仍active | When 自然完成後聊天、單方同意／撤回再雙方同意下一場 | Then 不額外要求完成按鈕或支線；And 聊天仍可用；雙方同意才建新場；And 新場釘選合法版本、舊投影與cue清除 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-002→SD-003→SD-006） |
| `RB4-BDD-046` SafeExit（@error-handling @critical @frontend） | Given ready/running/paused/settled/completed任一階段 | When 一方確認退出並與救書或alarm競態 | Then 退出不受倒數或素材故障阻塞；And 解除占用、終止權限且pair排除；And 無後續訊息／操作／私有圖或舊cue；And 退出與救書競態的敗方不再寫入 | `F-09`、`F-10`：完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證 | `SD-005-S05`／`SD-005-I05`／`SD-005-V05`（跨包鏈：SD-002→SD-003→SD-005→SD-006） |
| `RB4-BDD-047` StrictTransport（@error-handling @critical） | Given 有效及失效帳號、HTTP/WS相同操作 | When 送正確payload、偽造role/time、錯revision、重複ID與失權 | Then 兩transport同規則與receipt；And 400/401/403/409/503依既有契約，無狀態異動；And 拒公開system reconcile、raw manifest與私人key；And raw R2、HTTP、WS 與歷史事件均遵守角色與版本授權，不返回未揭封書或未公開答案／note | `F-09`、`F-10`：完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證 | `SD-005-S05`／`SD-005-I05`／`SD-005-V05`（跨包鏈：SD-002→SD-003→SD-005） |
| `RB4-BDD-048` AssetReadiness（@error-handling @critical @frontend） | Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready | When 載入、恢復與點擊 | Then fail closed，不以placeholder冒充；And 保留可用聊天/退出及重讀、現有錯誤碼；And 恢復原版且不重抽、不呼叫Gemini；And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材 | `F-06`、`F-07`、`F-08`、`F-10`：擴充 `StoryStage.tsx`、`ADVStage.tsx` 與 `RealtimeRoomClient.ts` 完成舞台覆疊互斥與重連對時 | `SD-005-S04`／`SD-005-I04`／`SD-005-V04`（跨包鏈：SD-003→SD-005→SD-006） |
| `RB4-BDD-049` AvatarReuse（@happy-path @critical @frontend） | Given 16免費角色及既有ready AI套組 | When 切換4姿態5表情、重連與失權 | Then 保持已核准身份／外觀、資產共用；And 切換或重連不重產；And 失權清圖；真provider證據與回放分開；And 必要真 provider 質量及成本證據不可由回放代簽 | `F-06`、`F-07`、`F-08`、`F-10`：擴充 `StoryStage.tsx`、`ADVStage.tsx` 與 `RealtimeRoomClient.ts` 完成舞台覆疊互斥與重連對時 | `SD-005-S04`／`SD-005-I04`／`SD-005-V04`（跨包鏈：SD-005→SD-006） |
| `RB4-BDD-050` PlatformPerformance（@performance @critical @frontend） | Given 正式V4完整資產、Web與Android現有驗收裝置 | When 連續探索、翻書、倒數、背景與重連 | Then 記錄載入／操作延遲／記憶體／動畫對V3基線；And 離開與失權清資源且有界快取；And 無實測不得標Gate A通過；And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證 | `F-03`、`F-04`、`F-05`、`F-10`：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`（跨包鏈：SD-005→SD-006） |
| `RB4-BDD-051` GateA（@happy-path @critical） | Given V4正式候選與真環境測試 | When 核對全部AC、兩題組、四結局及必要平台 | Then 真D1/R2/DO與HTTP/WS有精確證據；And Web/Android及素材/內容/權限/效能逐項核對；And 未驗或失敗不得以局部測試通過代簽；And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽 | `F-09`、`F-10`：完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證 | `SD-005-S05`／`SD-005-I05`／`SD-005-V05`（跨包鏈：SD-005→SD-006） |

## 用戶故事

作為經歷暴雨停電的雙人玩家，我想要接過手電筒後與同伴透過直覺的上滑傳書、拖袋入櫃與三態鎖扣合作搶救絕版書，在收尾時夾入專屬書籤、獲得無個資的《今日借閱小票》並自由決定續聊、推薦書或溫柔留白，以便擁有深刻且安心的共同結局記憶。

## 畫面操作／系統處理流程

1. 主動暴雨與音訊反應（`RB4-BDD-021`,`022`,`050`）：收到導演 cue 時，`SceneWeather` 與 `SceneStoryMotion` 播放 7 步閃電、斷電微光、門縫進水與阿澄防洪託付，`StoryAudio` 自動切停黑膠曲目保留雨聲（退背景或失焦立即停播且回前景不自播）。
2. 雙向救書與 15 秒暫緩（`RB4-BDD-023`～`037`）：`TimedRescueOverlay` 呈現手電筒雙 Ready、基於 `performance.now()` 單調差值之倒數秒數 `ceil(remainingMs/1000)`、4 階段水位線與播報、暈開清單判讀與分享、跨區抽書上滑傳遞（`>=65%` 上滑）、防潮袋裝櫃、第 3 本墊底提示、第 4 本左扣→右扣→封箱三態點擊（錯序燈號歸零保留已救數）、雙人各 6 句快捷呼喊泡泡，以及 15 秒斷線／閒置暫緩橫幅（斷線／閒置方回前景操作即無按鈕自動繼續）。
3. 書籤、四結局、小票與頂層生命週期（`RB4-BDD-038`～`051`）：`BookmarkAndEndingPanel` 呈現阿澄 `S/A × 聊開/慢熟` 致謝、S/A 書籤 3 句＋`0–20` scalar 純文字輸入、3 種最終意願選擇、四結局專屬舞台氛圍與無個資《今日借閱小票》（含 `X/4` 與 4 印章）；`StoryExperienceScreen` 動態切換 8×3 聊天建議，並在 401/403/退出或換場時立即清空全數私有狀態。

### 畫面、元件與互動分解（適用時）

| 畫面／區域／角色／BDD | 實際頁面、元件、handler／F-ID | 布局、內容、素材與操作／手勢 | 狀態、導覽、禁用／錯誤／重試 | API／事件、權威狀態與平台差異 | 必要 S／I／V、可重現操作與視覺驗收 |
|---|---|---|---|---|---|
| `RB4-BDD-019` ChatSuggestions（雙角色視角） | `F-09`、`F-10`（對應步驟 `SD-005-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐情境打開聊天、點一則或自由聊天，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S05`／`SD-005-I05`／`SD-005-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-022` StormPresentation（雙角色視角） | `F-03`、`F-04`、`F-05`、`F-10`（對應步驟 `SD-005-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 兩端接cue或斷線重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-023` ReadyGate（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 單方先ready後雙方並行ready，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-026` RescueSteps（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 A分享線索、I跨合法區抽書上滑、A收書裝袋上架，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-027` ReverseClues（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-028` WrongRescue（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-029` QuickCallouts（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐句點選並嘗試偽造他方ID，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-030` WaterStages（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 權威時間跨75/50/30/15秒及延遲重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-031` PauseIdle（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 測14999/15000ms閒置且仍有ping，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-032` PauseReconnect（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 雙方恢復可操作、重複斷線多次，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-034` GradeS（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 伺服器提交最後合法封箱，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-035` GradeA（雙角色視角） | `F-03`、`F-04`、`F-05`、`F-10`（對應步驟 `SD-005-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 DO喚醒或合法讀取補償，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-036` GradeB（雙角色視角） | `F-01`、`F-10`（對應步驟 `SD-005-S02`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 系統結算，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S02`／`SD-005-I02`／`SD-005-V02`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-038` Bookmark（雙角色視角） | `F-02`、`F-10`（對應步驟 `SD-005-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 逐書三句書籤選一，選填0/20字並各自提交，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-040` WishMatrix（雙角色視角） | `F-03`、`F-04`、`F-05`、`F-10`（對應步驟 `SD-005-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 覆核3×3共9種最終意願組合，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-041` EndingArt（雙角色視角） | `F-02`、`F-10`（對應步驟 `SD-005-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 看場景光色、距離、原文、互動並重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-042` ReceiptTitle（雙角色視角） | `F-02`、`F-10`（對應步驟 `SD-005-S03`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 以S剩29999／30000／30001ms及A/B測小票，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S03`／`SD-005-I03`／`SD-005-V03`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-044` ReceiptBadges（雙角色視角） | `F-03`、`F-04`、`F-05`、`F-10`（對應步驟 `SD-005-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 測同書／換曲／對方見符號／quiet+S/A，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-045` NaturalCompletion（雙角色視角） | `F-03`、`F-04`、`F-05`、`F-10`（對應步驟 `SD-005-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 自然完成後聊天、單方同意／撤回再雙方同意下一場，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-046` SafeExit（雙角色視角） | `F-09`、`F-10`（對應步驟 `SD-005-S05`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 一方確認退出並與救書或alarm競態，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S05`／`SD-005-I05`／`SD-005-V05`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-048` AssetReadiness（雙角色視角） | `F-06`、`F-07`、`F-08`、`F-10`（對應步驟 `SD-005-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 載入、恢復與點擊，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S04`／`SD-005-I04`／`SD-005-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-049` AvatarReuse（雙角色視角） | `F-06`、`F-07`、`F-08`、`F-10`（對應步驟 `SD-005-S04`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 切換4姿態5表情、重連與失權，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S04`／`SD-005-I04`／`SD-005-V04`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |
| `RB4-BDD-050` PlatformPerformance（雙角色視角） | `F-03`、`F-04`、`F-05`、`F-10`（對應步驟 `SD-005-S01`） | 依原稿 `uiCopy` 與 80 項正式素材融圖呈現；支援 連續探索、翻書、倒數、背景與重連，共用 `cameraFrame` 與多邊形 `hitMask` | 素材載入中／送出 `busy` 禁用重按；中途離開取消回彈；409 自動同步提示；401/403 立即清私有狀態 | `POST /story/event`（WS `story.event.submit`）＋`GET /experience`；Web（滑鼠／DOM 焦點）與 Android（觸控／AppState）行為對齊，排除 iOS 與無障礙專項 | `SD-005-S01`／`SD-005-I01`／`SD-005-V01`＋`SD-006` Web Playwright & Android 實機雙端視覺與手勢驗收 |

## 技術規範與實作設計

### 架構、DDD 與責任

對應 `SYS-008` 後半與頂層組裝，消費 `CNT-002`、`CNT-003`。唯讀引用 `SD-004` 已完成之 `scene-event-track.ts`、`scene-stage.ts` 與前半元件；唯一寫入 `StoryStage.tsx`、`ADVStage.tsx`、`StoryExperienceScreen.tsx` 等 9 個產品檔與 `frontend/client/tests/unit/scene-v4-half2.test.tsx`，確保與 `SD-004` 零檔案交集。

### 重要函式、核心邏輯與狀態

| 核心 ID／目標類別或函式 | 輸入／輸出與前後置條件 | 演算法／分支／偽碼 | 交易／併發／冪等／重試 | 錯誤語意／驗證 |
|---|---|---|---|---|
| `useMonotonicRescueCountdown`（`frontend/client/src/TimedRescueOverlay.tsx`） | 輸入：`timedModule`（`phase`、`serverNow`、`deadlineAt`、`pausedRemainingMs`）；輸出：顯示秒數 `displaySeconds` 與水位階段 | 快照到達時記錄 `anchorMono = performance.now()` 與 `initialBudgetMs = deadlineAt - serverNow`；`running` 時每 200ms 計算 `rem = max(0, initialBudgetMs - (performance.now() - anchorMono))` 顯示 `Math.ceil(rem / 1000)`；`paused` 時固定顯示 `Math.ceil(pausedRemainingMs / 1000)`；`0` 秒僅顯示等待伺服器結算，絕不自行宣告勝負 | 不受使用者調整系統時鐘影響，重連收到新快照即重新校準錨點 | 失焦或離場自動清除 `setInterval` 防止計時器洩漏；由 `SD-005-V02` 驗證 |
| `BookmarkAndEndingPanel` 輸入護欄與小票渲染器 | 輸入：`endingSummary`、`bookmarkRitual`、`memoryReceipt`、`disabled`；輸出：安全書籤提交與記憶卡視圖 | 即時以 `[...note]` 計算 Unicode scalar 長度 `0..20`，輸入含控制字元或 `< >` 時顯示行內提示並禁用送出；小票僅渲染公開曲名、書名、救書數、4 稱號、`X/4` 與 4 印章，無任何帳號／暱稱／自由文字欄位 | 提交中鎖定按鈕防重送，完成後保留下方「一起開始下一場」與聊天抽屜可用 | B 級（`ev4-04`）自動隱藏書籤與意願表單，直接呈現屋簷結局與小票；由 `SD-005-V03` 驗證 |
| `StoryExperienceScreen` 頂層組裝、暫緩自動恢復與失權清理 | 輸入：API / WS 授權快照與事件流；輸出：全場 V4 畫面、動態建議與安全生命週期 | 將 `SD-004` 前半覆疊元件與本包後半覆疊元件接入 `StoryStage` / `ADVStage`；聊天室建議直接綁定當前快照篩選出之 3 句動態建議；當 `timedModule.phase === "paused"` 且本人為待恢復方時，前景就緒或點擊操作自動觸發受控恢復同步；401/403/`ended` 時呼叫擴充版 `clearPrivate()` 清空書牆選取、彩蛋彈窗、書籤草稿與圖片解碼狀態 | 保留既有 `matchingRequestId()` 冪等送出與 `unknown` 狀態「以原編號查回結果」恢復機制 | 媒體預載僅保留當前與相鄰鏡位所需資產，防止長時間遊玩記憶體無界增長；由 `SD-005-V04`,`V05` 驗證 |

### 契約、資料與平台

- **契約與版本**：嚴格對齊 [01-system-design.md](../01-system-design.md#契約與資料設計) 定義之 `CNT-001`（`scene-event.v3`）、`CNT-002`（動作白名單＋書籤 `0..20` Unicode scalar）、`CNT-003`（actor-scoped 快照＋單人 `own_profile` 興趣）與 `CNT-004`（私有 `story.framework.system.reconcile`）。
- **資料庫與儲存限制**：維持 `0001`～`0007` **21 張表、0 新欄、0 SQL Trigger、0 新增公開 HTTP 路由**；維持 `world_state_json <= 16,384`、`state_json <= 16,384`、manifest `<= 512KiB`／`4MiB`、素材 `<= 8MiB`、可達狀態 `<= 50,000`。
- **平台與安全範圍**：目標平台為 **Web** 與 **Android**（依 `D-051`/`D-052` 排除 iOS 與無障礙專項）；嚴禁記錄或輸出任何密碼、驗證碼、Google/Session token、Cookie 或私人照片位元組；本地維運一律經 `tools/local.mjs` 操作已知 local instance，嚴禁 `--remote`。

### 共用與改動合理性

- 100% 沿用既有認證、配對、聊天、16 款內建全身與私人靜態四姿態化身系統（執行期 **0 次 Gemini 呼叫**）。
- 本包可寫檔案清單與其餘 6 份 SD 分項完全互斥（單一寫入者），避免並行覆寫衝突並最小化對既有 V3 回歸面之影響。

## 檔案改動設計

### F-01：`frontend/client/src/TimedRescueOverlay.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`TimedRescueOverlay` 元件（手電筒 Ready、單調倒數、4 水位、15s 暫緩橫幅與 4 步救書手勢）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-008`,`009`／`RB4-BDD-023`～`036`／`SD-005-D02`,`I02`／`SD-005-S02`
- 改動要點與必要核心邏輯：實作手電筒雙 Ready 按鈕、單調時鐘倒數 HUD、4 階段漫水視覺與播報橫幅、暈開清單檢視與分享、乾燥區抽書與 `>=65%` 上滑傳遞手勢、防潮袋裝櫃、第 3 本墊底提示、第 4 本左扣→右扣→封箱三態鎖扣（錯序閃爍提示並歸零三扣燈號）及雙人各 6 句舞台快捷呼喊泡泡
- 此檔案的責任與白話設計原因：集中封裝 90 秒高張力雙向協作救書 UI，不污染頂層螢幕狀態
- 輸入／輸出、介面及契約限制：Props：`timedModule`、`myRole`、`myAreaId`、`uiCopy`、`disabled`、`onSubmitAction`
- 前置依賴：`SD-003-S07`、`SD-004-S05`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V02`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-02：`frontend/client/src/BookmarkAndEndingPanel.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：`BookmarkAndEndingPanel` 元件（阿澄回應、書籤 0–20 scalar 儀式、最終意願與《今日借閱小票》）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-006`,`010`,`011`／`RB4-BDD-020`,`038`～`045`／`SD-005-D03`,`I03`／`SD-005-S03`
- 改動要點與必要核心邏輯：渲染阿澄 `S/A × 聊開/慢熟` 致謝與布丁／拿鐵毛巾回饋、S/A 書籤 3 選 1＋`0–20` Unicode scalar 純文字輸入框（即時字數與非法字元阻擋）、雙方 3 種最終意願選擇，以及完成後之無個資《雨聲書店・今日借閱小票》記憶卡（黑膠、選書、救書統計、4 稱號、`X/4`、4 印章）
- 此檔案的責任與白話設計原因：完整呈現收尾情感餘韻與可收藏記憶小票，嚴守零自由輸入入小票
- 輸入／輸出、介面及契約限制：Props：`endingSummary`、`memoryReceipt`、`uiCopy`、`disabled`、`onSubmitAction`
- 前置依賴：`F-01`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V03`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-03：`frontend/client/src/SceneWeather.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`SceneWeather`（第 5–14 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-007`,`009`,`010`／`RB4-BDD-021`,`036`,`040`／`SD-005-D01`,`I01`／`SD-005-S01`
- 改動要點與必要核心邏輯：擴充支援暴雨瞬間閃電白光脈衝、室內斷電暖暗光罩與屋簷／雨過微光 4 結局差異化雨幕層次，保持 `pointerEvents="none"` 不攔截舞台點擊
- 此檔案的責任與白話設計原因：強化主動暴雨危機感與四結局光色差異
- 輸入／輸出、介面及契約限制：向後相容既有 `intensity` 並新增可選 `lightningFlash` / `powerOutage` / `endingMood`
- 前置依賴：`SD-004-S05`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-04：`frontend/client/src/SceneStoryMotion.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`SceneStoryMotion`（第 8–36 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-007`,`008`,`012`／`RB4-BDD-021`,`026`,`049`／`SD-005-D01`,`I01`／`SD-005-S01`
- 改動要點與必要核心邏輯：擴充支援暴雨導演 7 步複合演出、上滑傳書／裝袋／封箱過場動作；保持點擊「略過演出」、`AppState` 退背景與 `listenSceneBrowserLifecycle` 失焦時立即終止本地動畫且 0 次送出故事推進命令
- 此檔案的責任與白話設計原因：確保演出流暢且切背景／重連時絕不卡死或偷送命令
- 輸入／輸出、介面及契約限制：相容 `v2`/`v3` `PresentationStep[]`
- 前置依賴：`F-03`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-05：`frontend/client/src/StoryAudio.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`StoryAudio`（第 7–44 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-003`,`007`,`012`／`RB4-BDD-009`,`021`,`050`／`SD-005-D01`,`I01`／`SD-005-S01`
- 改動要點與必要核心邏輯：支援黑膠 3 曲 URL 切換時平滑交叉淡換、暴雨斷電時立即將 `music` 靜音暫停僅留雨聲環境音、尊重本人靜音狀態（同伴切歌不強開本人喇叭）、複用 `listenSceneBrowserLifecycle` 使 Web blur/hidden 與 Android background 立即暫停且回前景不自動播放、限制音效快取集合有界
- 此檔案的責任與白話設計原因：完整滿足跨端黑膠同步、斷電驟停與背景靜音規範
- 輸入／輸出、介面及契約限制：擴充 `StoryAudio` 支援動態 `musicUrl` 切換與 `powerOutage` 旗標
- 前置依賴：`SD-004-S05`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V01`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-06：`frontend/client/src/StoryStage.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`StoryStage`（第 12–80 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`～`010`／`SD-005-D04`,`I04`／`SD-005-S04`
- 改動要點與必要核心邏輯：在 `track.stage` 分支掛載 `SD-004` 之 `BookshopMinimapOverlay`、`ShelfCloseupDrawer`、`AmbientInteractableModal` 與本包 `TimedRescueOverlay`，當特寫抽屜／彩蛋彈窗／書本開啟時自動鎖定底層鏡頭平移避免手勢打架
- 此檔案的責任與白話設計原因：統一管理舞台層與各原位互動覆疊層的 Z 軸與觸控互斥
- 輸入／輸出、介面及契約限制：擴充 `TrackStagePresentation` 傳遞 V4 覆疊狀態與回呼
- 前置依賴：`F-01`～`F-05`、`SD-004-S05`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V04`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-07：`frontend/client/src/ADVStage.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`ADVStage`（第 10–55 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-006`,`010`,`011`／`SD-005-D04`,`I04`／`SD-005-S04`
- 改動要點與必要核心邏輯：支援 `店長・阿澄` 專屬琥珀暖棕說話者標籤樣式；當書牆特寫、彩蛋彈窗或救書覆疊開啟時自動收折底部敘事捲動層避免遮擋手勢，並在收尾／完成階段嵌入 `BookmarkAndEndingPanel`
- 此檔案的責任與白話設計原因：讓敘事對話框、救書舞台與結局小票在不同螢幕高度下清晰不重疊
- 輸入／輸出、介面及契約限制：維持既有 `ADVStage` 相容性並支援 V4 覆疊避讓
- 前置依賴：`F-02`、`F-06`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V04`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-08：`frontend/client/src/RealtimeRoomClient.ts`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`RealtimeRoomClient`（第 7–61 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-008`,`012`／`RB4-BDD-031`,`032`,`049`／`SD-005-D04`,`I04`／`SD-005-S04`
- 改動要點與必要核心邏輯：確保重連 `onopen` 完成同步後通知畫面校準最新 `serverNow`/`deadlineAt`，維持 `avatarHints` 有界（`<=64`）與斷線 `stop()` 完整清除計時器及 pending promises
- 此檔案的責任與白話設計原因：保障斷線重連後倒數計時與暫緩恢復即時對齊權威狀態
- 輸入／輸出、介面及契約限制：維持既有標準 WebSocket JSON 子協定 `datinghigh.v1`
- 前置依賴：`SD-003-S07`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V04`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-09：`frontend/client/src/StoryExperienceScreen.tsx`

- 改動類型：修改
- 目標類別／函式／區段與現況證據：`StoryExperienceScreen`（第 23–261 行）
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`～`012`,`014`／`SD-005-D04`,`I05`／`SD-005-S05`
- 改動要點與必要核心邏輯：完成 V4 全場面組裝：串接前半／後半全部元件與 `story.event.submit` 命令、綁定 8×3 動態聊天建議（點擊可填入草稿或送出）、實作暫緩期間斷線重入前景自動同步恢復、擴充 `clearPrivate()` 在 401/403/`ended`/換場時立即清空書牆／盲書／提問卡／書籤草稿／小票與有界媒體快取，完整保留聊天室、雙同意下一場與安全退出確認對話框
- 此檔案的責任與白話設計原因：在單一頂層螢幕收斂全場狀態流、隱私清理與雙端響應式布局
- 輸入／輸出、介面及契約限制：Expo Router `/game-round/[roundId]` 主畫面元件
- 前置依賴：`F-06`～`F-08`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client && npm --prefix frontend/client run export:web`（`SD-005-V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）

### F-10：`frontend/client/tests/unit/scene-v4-half2.test.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：V4 後半暴雨、單調倒數、救書手勢、書籤小票、背景停播與失權清理單元測試套件
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／涵蓋本包全部前端 Unit TDD／`SD-005-I01`～`I05`／`SD-005-S01`～`S05`
- 改動要點與必要核心邏輯：測試暴雨斷電停黑膠、背景停播不自播、單調時鐘防系統調錶、上滑傳書與三態鎖扣重置、15s 暫緩橫幅無恢復按鈕、書籤 20 scalar 阻擋非法字元、小票零個資、8×3 建議切換及 401/403/退出立即清空私有 DOM 與記憶體
- 此檔案的責任與白話設計原因：在進入真環境雙端 E2E 前完整鎖定後半與頂層組裝品質
- 輸入／輸出、介面及契約限制：Vitest 元件測試套件
- 前置依賴：`F-01`～`F-09`
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入
- 驗證方式與預期結果：`npm run test:client`（`SD-005-V01`～`V05`）
- 實際證據回填位置：本包測試計劃表對應 `V-ID` 與 [SPEC-001-RainBookshopV4-Verification.md](../../../../verification/SPEC-001-RainBookshopV4-Verification.md)（設計階段待回填）


## 有序實作與驗證步驟

### 步驟順序與起始關卡

| 步驟 ID／成果 | 唯一負責 I-ID／來源 | 前置步驟及所需結果／跨包契約 | F-ID／V-ID | 通過後可開始的下一步／條件 | 執行狀態／證據位置 |
|---|---|---|---|---|---|
| `SD-005-S01`／擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播 | `SD-005-I01`（`RB4-T-115`,`RB4-T-285`,`RB4-T-286`,`RB4-T-287`） | `SD-003-S07` 與 `SD-004-S05` 皆已通過 | `F-03`、`F-04`、`F-05`、`F-10`／`SD-005-V01` | `SD-005-S02` | `Planned`；證據待回填 |
| `SD-005-S02`／實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 | `SD-005-I02`（`RB4-T-126`,`RB4-T-143`,`RB4-T-149`,`RB4-T-155`…等 10 項 TDD） | `SD-005-S01` 通過 | `F-01`、`F-10`／`SD-005-V02` | `SD-005-S03` | `Planned`；證據待回填 |
| `SD-005-S03`／實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票 | `SD-005-I03`（`RB4-T-214`,`RB4-T-221`,`RB4-T-232`,`RB4-T-238`） | `SD-005-S02` 通過 | `F-02`、`F-10`／`SD-005-V03` | `SD-005-S04` | `Planned`；證據待回填 |
| `SD-005-S04`／擴充 `StoryStage.tsx`、`ADVStage.tsx` 與 `RealtimeRoomClient.ts` 完成舞台覆疊互斥與重連對時 | `SD-005-I04`（`RB4-T-272`,`RB4-T-273`,`RB4-T-274`,`RB4-T-279`,`RB4-T-280`,`RB4-T-281`） | `SD-005-S03` 通過 | `F-06`、`F-07`、`F-08`、`F-10`／`SD-005-V04` | `SD-005-S05` | `Planned`；證據待回填 |
| `SD-005-S05`／完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證 | `SD-005-I05`（`RB4-T-103`,`RB4-T-262`,`RB4-T-269`,`RB4-T-291`,`RB4-T-292`,`RB4-T-293`） | `SD-005-S04` 通過 | `F-09`、`F-10`／`SD-005-V05` | 移交完整前後端與雙端共用前端成果予 `SD-006` 啟動跨系統整合與雙平台 E2E | `Planned`；證據待回填 |

### SD-005-S01：擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播

**對應成果與責任**：唯一負責 `SD-005-I01`；對應 TDD：`RB4-T-115`、`RB4-T-285`、`RB4-T-286`、`RB4-T-287`；涉及檔案：`F-03`、`F-04`、`F-05`、`F-10`；驗證 ID：`SD-005-V01`；由 `SD-005` 執行者負責。  
**開始條件與前置證據**：`SD-003-S07` 與 `SD-004-S05` 皆已通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/SceneWeather.tsx`、`SceneStoryMotion.tsx`、`StoryAudio.tsx`、`scene-browser-lifecycle.ts`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：修改 `F-03`、`F-04`、`F-05`，新增 `F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-03`、`F-04`、`F-05`、`F-10` 落實「擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：擴充暴雨閃電、停電暗罩與四結局雨幕；擴充 7 步導演演出與略過／失焦即停；擴充 `StoryAudio` 黑膠 3 曲平滑淡換、斷電時停止 `music` 保留雨聲、未開啟聲音時同伴切歌不強播，以及 Web blur/hidden 與 Android background 立即暫停且回前景不自播。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C01-1`／正常（`RB4-BDD-009`,`021`,`050`） | 開啟聲音後切換黑膠曲目、觸發暴雨斷電、再模擬 `AppState="background"` / `window.blur` 後回 `active` | 切歌平滑更新音源、斷電後 `music.pause()` 且雨聲持續、退背景全部暫停且回前景維持 `enabled=false` 不自動復播 | 未開聲音之另一端切歌時維持靜音僅顯示曲名提示 | `SD-005-V01`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |
| `C01-2`／取消護欄 | 導演 7 步演出進行中點擊「略過演出」或視窗失焦 | 動畫立即停止清理 timer，0 次發出任何完成 API | 無殘留計時器或假提交 | `SD-005-V01`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `scene-v4-half2.test.tsx` 撰寫暴雨斷電音訊與背景停播測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 斷電停黑膠與新天氣狀態尚未實作而失敗 | 待回填 |
| 2／Green | 修改 `F-03`、`F-04`、`F-05` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 天氣、演出與音訊測試通過 | 待回填 |
| 3／Refactor 與回歸 | 重跑既有 `story-audio.test.tsx`、`scene-story-motion.test.tsx`、`scene-weather.test.tsx` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- story-audio scene-story-motion scene-weather` | 既有測試 100% 全綠 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-03`、`F-04`、`F-05`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-005-S02`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-005-S02：實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡

**對應成果與責任**：唯一負責 `SD-005-I02`；對應 TDD：`RB4-T-126`、`RB4-T-143`、`RB4-T-149`、`RB4-T-155`、`RB4-T-161`、`RB4-T-167`、`RB4-T-173`、`RB4-T-179`、`RB4-T-191`、`RB4-T-203`；涉及檔案：`F-01`、`F-10`；驗證 ID：`SD-005-V02`；由 `SD-005` 執行者負責。  
**開始條件與前置證據**：`SD-005-S01` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `docs/requirements/rain-bookshop-v4-draft.json`（`timedCoopRescue`、`uiCopy`）、`SPEC §6.2–6.4`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：新增 `F-01`，修改 `F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-01`、`F-10` 落實「實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：實作手電筒 Ready、基於 `performance.now()` 之單調倒數（支援任意釘選 `durationSeconds` 如 90s/120s）、4 水位線與播報、15 秒暫緩凍結橫幅（無額外恢復按鈕）、濕清單判讀分享、乾燥區抽書、`>=65%` 上滑傳遞、防潮袋裝櫃、第 3 本墊底提示、第 4 本左扣→右扣→封箱三態點擊與雙人各 6 句快捷呼喊泡泡。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C02-1`／正常與單調時鐘（`RB4-BDD-023`～`031`） | 傳入 `serverNow=1000, deadlineAt=91000`，將 `Date.now` 往後撥快 50 秒但 `performance.now` 僅過 2 秒；並測試上滑傳書、三態鎖扣與快捷泡泡 | 顯示秒數為 `88`（不受系統錶撥快影響）；上滑 `>=65%`、裝袋與 `left->right->seal` 依序送出正確動作；`paused` 時凍結顯示剩餘秒數與原稿 `pausedNotice` | 無任何獨立「恢復計時」按鈕 | `SD-005-V02`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |
| `C02-2`／錯序與歸零邊界（`RB4-BDD-028`,`033`,`036`） | 鎖扣錯序回傳 `latchIndex=0` 與 `wrongLockFeedback`；單調倒數走到 `0` 秒但伺服器結算快照尚未抵達 | 三扣燈號重置且已救 3 本標記保留；`0` 秒僅顯示等待伺服器結算且禁用救書按鈕，不自行切換結局 | 零客戶端越權結算 | `SD-005-V02`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增單調倒數、上滑傳書、鎖扣重置與暫緩橫幅測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | `TimedRescueOverlay` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `TimedRescueOverlay.tsx` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 全部救書覆疊測試通過 | 待回填 |
| 3／Refactor 與回歸 | 執行前端 typecheck 確認 props 型別嚴謹 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run typecheck` | 0 型別錯誤 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-01`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-005-S03`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-005-S03：實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票

**對應成果與責任**：唯一負責 `SD-005-I03`；對應 TDD：`RB4-T-214`、`RB4-T-221`、`RB4-T-232`、`RB4-T-238`；涉及檔案：`F-02`、`F-10`；驗證 ID：`SD-005-V03`；由 `SD-005` 執行者負責。  
**開始條件與前置證據**：`SD-005-S02` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `docs/requirements/rain-bookshop-v4-draft.json`（`clerkAftermath`、`bookmarkRitual`、`finalWish`、`endings`、`memoryReceipt`），以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：新增 `F-02`，修改 `F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-02`、`F-10` 落實「實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：實作阿澄 `S/A × 聊開/慢熟` 回應面板、S/A 書籤 3 句自選＋選填 `0..20` Unicode scalar 安全短語輸入框、3 種最終意願按鈕、B 級屋簷專屬面板，以及完成後之《雨聲書店・今日借閱小票》（黑膠、書名、救書統計、4 稱號、`X/4`、4 印章，零個資、零自由輸入）。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C03-1`／正常（`RB4-BDD-038`～`045`） | 渲染 S 級輸入 20 個含 Emoji scalar 短語送出書籤與意願；渲染完成態檢視 4 種結局與小票 `3/4` 及 4 枚印章 | Emoji 按單一 scalar 正確計數通過；小票完整呈現曲目、書名、等級稱號、`3/4` 與印章，且不含任何暱稱／Email／書籤自由輸入 | B 級自動略過書籤直顯屋簷收尾與小票 | `SD-005-V03`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |
| `C03-2`／輸入護欄 | 於書籤短語輸入 21 個字、`<b>hi</b>` 或控制字元 `\u0007` | 即時提示字數／字元限制並禁用送出按鈕，0 次發出請求 | 前端與後端一致攔截非法短語 | `SD-005-V03`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增書籤 20 scalar 護欄與借閱小票零個資渲染測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | `BookmarkAndEndingPanel` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `BookmarkAndEndingPanel.tsx` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 書籤、結局與小票測試全數通過 | 待回填 |
| 3／Refactor 與回歸 | 執行前端 typecheck | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run typecheck` | 0 型別錯誤 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-02`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-005-S04`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-005-S04：擴充 `StoryStage.tsx`、`ADVStage.tsx` 與 `RealtimeRoomClient.ts` 完成舞台覆疊互斥與重連對時

**對應成果與責任**：唯一負責 `SD-005-I04`；對應 TDD：`RB4-T-272`、`RB4-T-273`、`RB4-T-274`、`RB4-T-279`、`RB4-T-280`、`RB4-T-281`；涉及檔案：`F-06`、`F-07`、`F-08`、`F-10`；驗證 ID：`SD-005-V04`；由 `SD-005` 執行者負責。  
**開始條件與前置證據**：`SD-005-S03` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/StoryStage.tsx`、`ADVStage.tsx`、`RealtimeRoomClient.ts`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：修改 `F-06`、`F-07`、`F-08`、`F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-06`、`F-07`、`F-08`、`F-10` 落實「擴充 `StoryStage.tsx`、`ADVStage.tsx` 與 `RealtimeRoomClient.ts` 完成舞台覆疊互斥與重連對時」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：於 `StoryStage` 掛載小地圖、書牆特寫、環境彩蛋與救書覆疊並於抽屜開啟時鎖定底層鏡頭拖拽；於 `ADVStage` 支援 `店長・阿澄` 膠囊樣式與收尾面板避讓；於 `RealtimeRoomClient` 確保重連同步對齊倒數時鐘且維持有界快取。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C04-1`／正常（舞台組裝與重連對時） | 在 `StoryStage` 開啟 `ShelfCloseupDrawer` 並嘗試橫滑；模擬 `RealtimeRoomClient` 斷線重連成功 | 橫滑事件專屬於書牆抽屜，底層鏡頭 `pan` 維持 `0` 不晃動；重連後立即觸發 `sync` 更新 `serverNow` | `ADVStage` 正確渲染 `店長・阿澄` 並保留「略過」對話功能 | `SD-005-V04`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |
| `C04-2`／錯誤降級（`RB4-BDD-048` 素材缺檔） | 模擬舞台圖片 `onError` 載入失敗 | 顯示「場景圖片載入失敗；可重新載入場景素材，聊天室仍可使用」並鎖定舞台動作，不崩潰、不顯示假成功圖 | 聊天與安全退出保持可用 | `SD-005-V04`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增舞台覆疊手勢鎖定、`店長・阿澄` 樣式與重連同步測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 覆疊掛載與 `店長・阿澄` 樣式尚未接入而失敗 | 待回填 |
| 2／Green | 修改 `F-06`、`F-07`、`F-08` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 舞台與連線組裝測試通過 | 待回填 |
| 3／Refactor 與回歸 | 重跑既有 `story-stage.test.tsx` 與 `realtime-room-client.test.ts` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- story-stage realtime-room-client` | 既有舞台與 WS 客戶端測試全綠 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-06`、`F-07`、`F-08`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 `SD-005-S05`。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

### SD-005-S05：完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證

**對應成果與責任**：唯一負責 `SD-005-I05`；對應 TDD：`RB4-T-103`、`RB4-T-262`、`RB4-T-269`、`RB4-T-291`、`RB4-T-292`、`RB4-T-293`；涉及檔案：`F-09`、`F-10`；驗證 ID：`SD-005-V05`；由 `SD-005` 執行者負責。  
**開始條件與前置證據**：`SD-005-S04` 通過。  
**必讀工作範圍**：工作區 `C:\GitProjects\gamenenstyle\datinghigh` 下之 `frontend/client/src/StoryExperienceScreen.tsx`、`story.ts`，以及 [01-system-design.md](../01-system-design.md)。  
**可寫檔案／符號及禁止改動**：修改 `F-09`、`F-10`；嚴禁跨包修改非本包負責之檔案或竄改上游規格。  
**產品改動與 BDD／畫面關聯**：透過 `F-09`、`F-10` 落實「完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證」，直接支撐對應 BDD 條件、權威結果與雙平台畫面／安全契約（非僅新增空測試）。  
**具體行為與核心邏輯**：在 `StoryExperienceScreen` 完整串接 V4 前後半互動狀態、8×3 動態聊天建議切換、暫緩期間重返前景自動同步恢復，以及收到 `401`/`403`/`ended`/切換下一場時立即呼叫強化版 `clearPrivate()` 徹底清除盲書／提問卡／書籤草稿／小票／解碼圖片快取，並驗證 `export:web` 打包成功。  
**允許自行決定的局部細節**：私有輔助函式／區域變數命名與不影響公開 JSON 契約及視覺規格之內部排版常數；任何涉及 schema、API、SQL 表欄或原稿文字之變更一律禁止自行決定。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-1`／正常（`RB4-BDD-019`,`045`,`046` 全流程串接） | 模擬從入店→撕盲書→提問卡→暴雨→救書暫緩重入恢復→S 級書籤→結局 2 翻書→小票→雙同意下一場與 8 階段聊天建議切換 | 各階段無縫銜接、聊天抽屜隨階段切換對應 3 句建議、雙同意下一場清空上一場殘留狀態 | 聊天室與安全退出確認 Modal 全程正常運作 | `SD-005-V05`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |
| `C05-2`／失權與退出立即清理（`RB4-BDD-046`,`047`） | 在開啟盲書／書籤草稿／小票狀態下模擬 API 回傳 `401`、`403` 或點擊確認「結束本輪互動」 | 立即停止 WS、清空全數私有 state 與 DOM 文字並導向 `/login` 或 `/start`／結束頁 | 記憶體與畫面 0 私密殘留 | `SD-005-V05`／`frontend/client/tests/unit/scene-v4-half2.test.tsx` |

時間與隨機數在單元／整合測試中透過參數注入控制臨界值（如 `14999ms` vs `15000ms`、`deadlineAt - 1ms` vs `deadlineAt`），同時在真 Miniflare D1 與雙端 E2E 驗證真實執行環境；測試資源各自隔離不污染其他案例。

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 撰寫 `StoryExperienceScreen` V4 全場組裝、8×3 建議與 401/403 清理測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 頂層組裝與強化清理尚未接入而失敗 | 待回填 |
| 2／Green | 修改 `StoryExperienceScreen.tsx` 完成組裝與清理邏輯 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-v4-half2` | 全部頂層組裝測試通過 | 待回填 |
| 3／Refactor 與回歸 | 執行全套前端單元測試、型別檢查與正式 Web 靜態匯出驗證 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client run typecheck && npm run test:client && npm --prefix frontend/client run export:web` | 本包 5 個 `I`、全量前端測試與 `export:web` 100% 通過 | 待回填 |

**本步通過條件**：上述 Green 與回歸命令退出碼皆為 `0`，涵蓋之全部正常／錯誤／邊界斷言成立且零秘密日誌外洩。  
**必須停止的情況與回報內容**：若前置檔案缺失、真環境（如真 Miniflare D1 時鐘、權利依據、Android ADB 裝置或本人 Gate B 核准）不滿足，或發現需偏離已核准設計才可通過時，**立即停止後續步驟**，回報原設計位置、實測證據、影響範圍、最小替代建議與恢復條件。  
**可在本步修正的範圍**：本步可寫檔案（`F-09`、`F-10`）內符合既定設計之語法、型別與邊界邏輯修正；嚴禁放寬斷言、調高安全上限或跳過測試。  
**下一步與起始條件**：通過後進入 移交完整前後端與雙端共用前端成果予 `SD-006` 啟動跨系統整合與雙平台 E2E。  
**實際執行狀態／目前子階段／證據**：`Planned`／未開始／待實作回填（設計階段不開發）。  
**中斷與恢復資訊**：恢復時先核對 `git status`、已改檔案 SHA 與本步通過條件，重跑本步驗證命令確認現況後再續作，不盲目覆寫既有進度。

## 測試計劃與實際驗證方式

| 驗證 ID／來源 Todo／步驟 ID | 層級／行為／平台 | 環境與前置資料／案例 ID | 工作目錄與實際命令或畫面操作 | 預期結果／斷言 | 實作／測試位置 | 實際結果、時間、log／畫面證據 | 驗收狀態／等價依據或恢復條件 |
|---|---|---|---|---|---|---|---|
| `SD-005-V01`／`SD-005-I01`／`SD-005-S01` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C01-1`、`C01-2`（共 4 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half2` | 天氣、演出與音訊測試通過 | `F-03`、`F-04`、`F-05`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-005-V02`／`SD-005-I02`／`SD-005-S02` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C02-1`、`C02-2`（共 10 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half2` | 全部救書覆疊測試通過 | `F-01`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-005-V03`／`SD-005-I03`／`SD-005-S03` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C03-1`、`C03-2`（共 4 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half2` | 書籤、結局與小票測試全數通過 | `F-02`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-005-V04`／`SD-005-I04`／`SD-005-S04` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C04-1`、`C04-2`（共 6 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half2` | 舞台與連線組裝測試通過 | `F-06`、`F-07`、`F-08`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |
| `SD-005-V05`／`SD-005-I05`／`SD-005-S05` | Unit（Web／Android 適用項見 E2E） | 隔離測試環境或受控本地實例；涵蓋 `C05-1`、`C05-2`（共 6 項主計 TDD） | 目錄：`C:\GitProjects\gamenenstyle\datinghigh`<br>命令：`npm --prefix frontend/client test -- scene-v4-half2` | 全部頂層組裝測試通過 | `F-09`、`F-10` | 待回填（設計階段未執行） | `Incomplete` |

## 依賴關係與執行順序

| 任務／交付物 | 唯一執行／整合／驗收責任 | 前置／契約版本／開始條件 | 可寫範圍及排除 | 共享環境／隔離／互斥 | 安全並行或循序理由 | 完成及回傳條件 |
|---|---|---|---|---|---|---|
| `SD-005-暴雨救書協作與四結局借閱小票前端UX`（`SD-005-S01`～`SD-005-S05`） | SD-005 前端後半與頂層組裝執行者／跨系統雙端 E2E 驗收由 SD-006（Gate A）與 SD-007（Gate B / CleanReplay）負責 | 使用者明確核准 `final` `1.0.0`；前置依賴：`SD-003-S07` 與 `SD-004-S05` 皆已通過；契約 `SD-contract-v2`／`CNT-001`～`004` | 僅限本包 `F-01`～`F-10`；嚴禁跨包寫入他包檔案 | 單元與隔離 Miniflare 測試獨立運行；涉及 `127.0.0.1:8787` 或 Android ADB 之測試由 `SD-006`/`SD-007` 嚴格單一序列獨佔 | 依前置資料流與共享環境鎖定採嚴格有序關卡推進 | 本包 `I01`～`I05` 全數取得真實通過證據、無未提交髒檔且既有回歸全綠 |

全案關鍵依賴鏈：`SD-003-S01`（真 D1 時鐘探針）→ `SD-001` →（`SD-002` || `SD-004`）→ `SD-003-S02..S07` → `SD-005` → `SD-006`（Gate A 321 項）→ `SD-007-S02`（本人 Gate B）→ `SD-007-S03..S05`（具名清理、乾淨重玩、337/337 深度稽核與交付）。

## 風險、設計變更與人工確認紀錄

| ID／原設計版本 | 發現證據與為何不能照案實作 | 白話實務情境／功能影響 | 建議／替代與影響 SD／BDD／TDD | 負責者／觸發／成本時程 | 使用者決策／核准範圍／新版本 | 失效證據／重驗與恢復條件 |
|---|---|---|---|---|---|---|
| `FINAL-APPROVAL-GATE`／`1.0.0` | 依 `SD-contract-v2` 與 `design-decision` 規範，整合產出之 `final/` 未獲使用者明確確認前不得啟動產品開發 | 確保所有跨候選取捨（真實路徑修正、D1 `CASE ... json()` 回滾、21 表清理拓樸）符合使用者預期 | 審閱核准 `final` `1.0.0` 後轉為 `Ready for carefully-done`（影響 `SD-001`～`SD-007`） | 使用者本人／設計交付時觸發 | **待使用者明確確認（`Awaiting approval`）** | 取得明確核准後解除阻斷；後續若需改動已核准設計須先停工討論並遞增設計版本 |

已寫明的檔案、邏輯、介面、資料、依賴、契約或驗證方式若在實作期發現需變更，必須先停止本需求後續實作並向使用者報告確認，更新獲准設計後再續作；一般進度與證據回填不變更設計版本。

## 實現檢查清單／Todo

本區是本包 SD 進度的唯一計數來源。每個可勾選項都是葉節點，父分組只用標題。設計完成後只勾 D，I 要有有效實際驗收證據才可勾選。

### D：設計葉節點

- [x] **SD-005-D01** 完成主動暴雨 7 步過場、斷電閃爍、黑膠驟停、背景立即停播與有界快取設計
  - 類型／唯一分組：D／暴雨與音訊設計
  - 來源／責任／依賴：`RB4-AC-003`,`007`,`012`、`RB4-BDD-009`,`021`,`050`；`SD-005` 負責
  - 完成條件／設計證據：`F-03`～`F-05` 與 `SD-005-S01` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-005-D02** 完成手電筒 Ready、單調倒數、4 水位、15s 暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡 UX 設計
  - 類型／唯一分組：D／協作救書 UX 設計
  - 來源／責任／依賴：`RB4-AC-008`,`009`、`RB4-BDD-023`～`036`；`SD-005` 負責
  - 完成條件／設計證據：`F-01` 與 `SD-005-S02` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-005-D03** 完成阿澄回應、書籤 0–20 scalar 儀式、最終意願、四結局與零個資《今日借閱小票》UX 設計
  - 類型／唯一分組：D／結局與小票 UX 設計
  - 來源／責任／依賴：`RB4-AC-006`,`010`,`011`、`RB4-BDD-038`～`045`；`SD-005` 負責
  - 完成條件／設計證據：`F-02` 與 `SD-005-S03` 已完整定義（已通過全量一致性桌面稽核）
- [x] **SD-005-D04** 完成 `StoryStage`/`ADVStage`/`StoryExperienceScreen` 頂層組裝、8×3 動態建議與失權清理設計
  - 類型／唯一分組：D／頂層組裝與生命週期設計
  - 來源／責任／依賴：`RB4-AC-005`,`011`,`012`、`RB4-BDD-019`,`046`～`051`；`SD-005` 負責
  - 完成條件／設計證據：`F-06`～`F-09` 與 `SD-005-S04`/`S05` 已完整定義（已通過全量一致性桌面稽核）

### I：實作驗證葉節點

- [ ] **SD-005-I01** 完成「擴充 `SceneWeather.tsx`、`SceneStoryMotion.tsx` 與 `StoryAudio.tsx` 支援暴雨斷電、黑膠淡換驟停與背景停播」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-115`、`RB4-T-285`、`RB4-T-286`、`RB4-T-287`；`SD-005` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-005-S01`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-005-V01` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-005-I02** 完成「實作 `TimedRescueOverlay.tsx` 單調倒數、4 水位、15 秒暫緩橫幅與雙向救書／三態鎖扣／快捷泡泡」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-126`、`RB4-T-143`、`RB4-T-149`、`RB4-T-155`、`RB4-T-161`、`RB4-T-167`…等 10 項唯一 TDD；`SD-005` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-005-S02`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-005-V02` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-005-I03** 完成「實作 `BookmarkAndEndingPanel.tsx` 阿澄回應、書籤 0–20 Scalar 儀式、最終意願與零個資借閱小票」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-214`、`RB4-T-221`、`RB4-T-232`、`RB4-T-238`；`SD-005` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-005-S03`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-005-V03` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-005-I04** 完成「擴充 `StoryStage.tsx`、`ADVStage.tsx` 與 `RealtimeRoomClient.ts` 完成舞台覆疊互斥與重連對時」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-272`、`RB4-T-273`、`RB4-T-274`、`RB4-T-279`、`RB4-T-280`、`RB4-T-281`；`SD-005` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-005-S04`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-005-V04` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`
- [ ] **SD-005-I05** 完成「完成 `StoryExperienceScreen.tsx` 頂層全場組裝、8×3 動態聊天建議、失權清理與 Web 靜態匯出驗證」並取得實測驗收證據
  - 類型／唯一分組：I／Unit 實作驗證
  - 來源／責任／依賴：`RB4-T-103`、`RB4-T-262`、`RB4-T-269`、`RB4-T-291`、`RB4-T-292`、`RB4-T-293`；`SD-005` 負責；前置見步驟表
  - 全部必要步驟／指定整合驗證：`SD-005-S05`（全部通過且跨包回歸無誤才可勾選本 I，不按步驟比例給部分分數）
  - 驗收條件／驗證 ID：通過 `SD-005-V05` 全部正常、錯誤與臨界斷言
  - 產物與實際證據／驗收狀態：待回填至 `Verification.md`／`Incomplete`

## 檢查點與續作交接

| 日期／任務／執行者 | 已完成並驗收／證據 | 尚未驗收／停止原因 | 寫入責任與共享資源現況 | 所需決策／恢復條件與查核 | 續作對象、實際啟動結果／下一步 |
|---|---|---|---|---|---|
| 2026-11-26／`/design-decision` 建立 `SD-005`／`Antigravity (Gemini 4 Carbon (High))` | 設計葉節點 `D`: 4/4 完成並通過桌面稽核 | 實作葉節點 `I`: 0/5 未開始；依規範停於 `Awaiting approval` 等待人工核准 | 產品程式碼、測試、DB 與設定 **0 修改**；無運行中背景伺服器或鎖定資源 | 使用者明確核准 `SPEC-001-RainBookshopV4/final` 設計版本 `1.0.0` | 核准後交由 `/carefully-done` 核對基準快照並按全案步驟順序執行 |

**鎖定文件包／版本／核准依據**：`datinghigh/docs/sd/SPEC-001-RainBookshopV4/final/plans/SD-005-暴雨救書協作與四結局借閱小票前端UX.md`／版本 `1.0.0`／待使用者明確核准（快照見 `../00-overview.md`）。  
**目前 I-ID／步驟 ID／子階段／已發生副作用**：尚未開始（待進入 `SD-005-I01`／`SD-005-S01`）；已發生產品副作用：**無**。  
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
**執行狀態／驗收狀態／剩餘事項**：`Planned`／`Incomplete`／等待使用者明確核准 `final` `1.0.0` 後由 `/carefully-done` 執行 `SD-005-I01`～`I05`
