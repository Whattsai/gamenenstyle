# SD-005-暴雨救書協作與四結局借閱小票前端UX — 分項實作設計

**功能／工作包 ID**：`SD-005-暴雨救書協作與四結局借閱小票前端UX`
**完整 SPEC 名稱／來源 MVP／SPEC／BDD／TDD**：`SPEC-001-RainBookshopV4`／[MVP-001](../../../../requirements/MVP-001-LoveGameDatingApp.md)、[作者草案 JSON](../../../../requirements/rain-bookshop-v4-draft.json)、[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[RiskAudit](../../../../specs/SPEC-001-RainBookshopV4-RiskAudit.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)
**文件包／AI／模型／批次**：`docs/sd/SPEC-001-RainBookshopV4/final`／ChatGPT GPT-6.2／20261126
**設計版本／契約版本／優先級**：`0.2.0-draft`／`SD-contract-v2`／高（後半危機協作、結局小票與全畫面組裝）
**執行狀態／驗收狀態／最後更新**：`Planned`／`Incomplete`；設計 Draft／2026-11-26
**執行／整合／驗收責任**：唯一寫入、後半元件單元驗證與 `StoryExperienceScreen` 頂層前端組裝責任：`SD-005` 執行者；Web／Android 雙平台真畫面 E2E 與 Gate A 驗收責任：[SD-006](SD-006-跨系統整合雙平台E2E與技術GateA驗收.md)
**來源與程式碼基準、核准設計快照**：見 [SD 總覽 — 來源、程式與設計基準](../00-overview.md#來源程式與設計基準)

## 開發進度總覽

### 整體進度

| 指標 | 完成／總數 | 狀態 |
|---|---:|---|
| 設計 D | 0 / 4 | Draft；須全量逐項稽核後才勾選 |
| 本分項主要 TDD 結構映射 | 18 / 18 | 不是完整設計涵蓋或產品驗證 |
| 本分項行為責任清冊 | 22 項 BDD 關聯 | 跨包責任不得重複計入來源總數 |
| 實作驗證 I | 0 / 4 | 0.0%；尚未開發 |

### 分層／分組進度追蹤

本分項 D、I 以「實現檢查清單／Todo」唯一葉節點計算；S 細步不新增分母。設計核准與產品驗收分離。

### 當前 Sprint 狀態

Draft，無執行中 I、無實作證據；以 [總覽](../00-overview.md) 與 [設計決策](../03-design-decision.md) 的 final 核准關卡為準。

### 里程碑

完成本包細步、群組整合關卡、必要跨包驗證後才能勾選 I；未取得證據不得提前勾選。最終產品驗收見 SD-006、SD-007。

### 關鍵指標

主要 TDD 18 項；D 4、I 4；既有產品證據 0。BDD 完整設計涵蓋尚待逐條確認，不以映射數替代。

### 每日進度記錄

不適用。依 AGENTS.md 僅就地維護有效設計及唯一進度；證據只放 Verification。

## 功能概述

本分項負責 Expo／React Native（Web 與 Android 共用）後半場高潮危機協作、收尾儀式、四種差異化結局與《雨聲書店・今日借閱小票》，並作為 `StoryExperienceScreen.tsx` 的唯一寫入者完成全場 V4 體驗組裝：
1. **主動暴雨 7 步過場與音訊轉場**：接收伺服器主動觸發之 `directorCue`，依序播放慘白閃光（`#eef6ff` 220ms）、`fx-thunder-flash`、`storm-crisis` 冷鏡位、黑膠唱針滋聲驟停（`vinyl-scratch-stop`）、`rain-heavy` 傾盆大雨、`fx-water-seep`、門縫 `waterline: seeping` 與阿澄赴門口防洪託付台詞；以 `cueFence` 確保斷線重連還原當前狀態而不重播過期閃電或舊播報。
2. **手電筒 Ready Gate、權威倒數與 90 秒雙向手勢救書**：點擊 `prop-flashlight-v4` 就位（單方亮燈顯示等待不扣秒，雙亮燈啟動權威倒數與 `bgm-rescue-tension`）；HUD 顯示 `Math.ceil(remainingMs / 1000)`、75/50/30/15 秒四階段地板水痕與最後 15 秒 `fx-countdown-tick`；實作 15 秒斷線／閒置 `慢節奏呼吸保護中` 暫緩橫幅與無按鈕前景重入／實際操作自動恢復；實作 A 端淋濕清單分享＋防潮袋拖曳＋高櫃上下層放置＋三態鎖扣（`左扣 → 右扣 → 下壓封條`，錯扣復位重試），I 端跨乾燥區抽書向上滑動傳遞＋後半反轉規則卡拾獲分享＋錯抽吐槽復位，以及雙方各 6 句快捷呼喊舞台泡泡（不寫入真人聊天室）。
3. **S/A/B 結算、書籤儀式、四結局與借閱小票**：S 級（手沖＋焦糖布丁）、A 級（拿鐵＋乾毛巾）、B 級（強制撤離二樓 `eaves-corridor` 保溫瓶熱茶毛巾、鎖死低處積水區）；S/A 執行牛皮書籤儀式（3 句金句＋0–20 字安全純文字即時檢核）與 3×3 最終意願私密選擇；四結局各自鏡位與燈光，結局 2《留下一本書的名字》支援點擊木桌上對方留下的書原位翻開滑出牛皮書籤；最後伴隨 `fx-receipt-print` 展開零個資《今日借閱小票》（黑膠、雙書、救書統計、4 稱號、`X/4`、4 印章、阿澄註腳），並保留自然完成後聊天、雙同意下一場清理舊投影與全階段安全退出立即清快取。

## 功能需求與來源追溯

| MVP／SPEC 項目 | BDD Scenario（23 個 `@frontend`） | TDD 測試項（本包唯一負責之 18 項前端 Unit） | 系統設計 ID／本包 Todo／步驟 ID | 驗收條件 | 跨包共同成果與整合責任 |
|---|---|---|---|---|---|
| `RB4-AC-007`、`008` | `RB4-BDD-022`、`023`、`030`～`032` | `RB4-T-118`～`120`、`165`～`167`（6 項） | `SYS-008`／`D01`、`D02`、`I01`、`I02`／`S01`、`S02` | 7 步風暴演出與鏡位一致、重連不重播舊 cue；雙 ready 顯示同一權威倒數；75/50/30/15s 水位與播報正確、client 改本地時鐘不影響權威秒數；15s 暫緩橫幅與前景重入自動恢復 | 權威計時與 DO 排程歸 `SD-002`/`003`；雙端 E2E（含 `RB4-T-324`）歸 `SD-006` |
| `RB4-AC-008`、`009` | `RB4-BDD-026`～`029`、`034`～`036` | `RB4-T-159`～`161`（3 項）＋救書手勢與結算元件驗證 | `SYS-008`／`D02`、`I02`／`S02` | 濕清單／反轉卡分享、上滑傳書、裝袋放上下層、三態鎖扣與錯序復位重試；雙方各 6 句快捷只發舞台泡泡不寫假聊天；S 布丁／A 拿鐵／B 強制撤離屋簷鎖危險區 | 領域與 D1 持久化歸 `SD-002`/`003`；雙端 E2E 歸 `SD-006` |
| `RB4-AC-010`、`011`、`014` | `RB4-BDD-038`、`040`～`042`、`044`～`046`、`055` | `RB4-T-230`～`232`（3 項）＋書籤／小票／完成／退出組裝驗證 | `SYS-008`／`D03`、`I03`／`S03` | 書籤 3 句＋0–20 字即時防呆、結局 2 原位翻開對方書滑出書籤；四結局正式鏡位與素材且無規格文字；小票稱號、`X/4`、印章與零個資；自然完成聊天／雙同意下一場清舊 cue／全階段安全退出 | 領域與 API 歸 `SD-002`/`003`；雙端 E2E 歸 `SD-006`/`007` |
| `RB4-AC-012`、`RA-11` | `RB4-BDD-048`～`050` | `RB4-T-279`～`281`、`285`～`287`（6 項） | `SYS-008`／`D04`、`I04`／`S04` | 缺素材 fail closed 不顯示 placeholder 並保留聊天／退出；16 免費與 ready AI 4 姿態 5 表情重用零重產、失權清圖；有界快取、背景停播與效能採集鉤子就緒 | 真環境與雙端實機量測歸 `SD-006`（`RB4-T-288`～`290`、`337`） |

### BDD 行為與產品實作分解

| BDD Scenario／條件或 Examples | 角色／Given | When／操作 | Then／And／But 各結果與副作用 | 實際產品 F-ID／符號／核心分支 | 必要 S／I／V／跨包成果 |
|---|---|---|---|---|---|
| `RB4-BDD-022`、`023`、`030`～`032`（風暴過場、Ready、水位階段、暫緩與前景自動恢復） | 雙端進入導演中斷與救書倒數 | 接導演 cue、單／雙點手電筒、跨 75/50/30/15s、改本地時間、斷線／失焦後回前景或操作 | 閃光／雷聲／冷鏡／唱針停／水痕依序呈現且重連不重播；秒數以伺服器相對剩餘毫秒單調計算；回前景可操作時透過 `RealtimeRoomClient`／`StoryExperienceScreen` 自動送 `resume-participation`（無確認按鈕） | `F-03` `SceneWeather`、`F-04` `SceneStoryMotion`、`F-05` `StoryAudio`、`F-01` `TimedRescueOverlay`、`F-06` `RealtimeRoomClient`、`F-07` `StoryExperienceScreen` | `SD-005-S01`、`S02`、`S04`／`I01`、`I02`、`I04`／`V-001`、`V-002`、`V-004`；跨包 `SD-002`、`SD-003`、`SD-006` |
| `RB4-BDD-026`～`029`、`034`～`036`（救書手勢、反轉鎖扣、錯抽復位、快捷泡泡、S/A/B 結算） | `I` 搜救位與 `A` 收納位 | `A` 分享清單、`I` 跨區抽書上滑、`I` 分享反轉卡、`A` 拖入防潮袋放上下層並點三扣、點 6 句快捷、結算 S/A/B | 上滑 `dy < -48px` 送 `pull-and-pass-book`；錯抽／錯槽／錯扣顯示原稿提示並復位（已放書保留）；快捷顯示舞台泡泡不進聊天室；B 級直切屋簷並禁用低處導覽 | `F-01` `TimedRescueOverlay`（`BookUpwardSwipeArea`、`MoistureBagAndShelf`、`ThreeStageLatches`、`CalloutBar`） | `SD-005-S02`／`I02`／`V-002`；跨包 `SD-002`、`SD-003`、`SD-006` |
| `RB4-BDD-038`、`040`～`042`、`044`～`046`、`055`（書籤、意願、四結局、結局 2 翻書、小票、完成與退出） | S/A/B 結算與章節收尾 | 選書籤金句＋填 0–20 字、選最終意願、結局 2 點對方桌上書、看借閱小票、聊天／同意下一場／安全退出 | 超過 20 scalars 或含 `< >`／控制碼即時攔截；結局 2 開啟 `SceneBook` 滑出 `prop-bookmark-v4`；小票呈現復古紙張與成立印章、零個資；退出立即清空本地資源 | `F-02` `BookmarkAndEndingPanel`、`F-07` `StoryExperienceScreen`（組裝 `SD-004` `SceneBook`） | `SD-005-S03`、`S04`／`I03`、`I04`／`V-003`、`V-004`；跨包 `SD-002`～`004`、`SD-006`、`SD-007` |
| `RB4-BDD-048`～`050`（資產就緒、靜態化身重用、有界快取與效能監測） | 正式資產或故障／失權／背景切換 | 缺圖載入、切換 4 姿態 5 表情、401/403 失權、連續探索翻書與退背景 | 缺圖顯標準錯誤橫幅不顯假圖，聊天／退出仍可按；化身只讀既有靜態 URL 零重產；失權與離開立即釋放圖片／音訊快取並記錄效能指標供 Gate A 讀取 | `F-05` `StoryAudio`、`F-07` `StoryExperienceScreen`（`useBoundedSceneAssetCache`、`useScenePerfTelemetry`） | `SD-005-S01`、`S04`／`I01`、`I04`／`V-001`、`V-004`；跨包 `SD-001`、`SD-003`、`SD-006` |

## 用戶故事

- 作為**並肩面對書店暴雨倒灌危機的兩位玩家**，我想要用手電筒照亮黑暗、在 90 秒水位上漲的緊張弦樂裡一個跨區滑書、一個裝袋鎖箱並用泡泡互相喊話，不論完美救完吃私藏布丁或狼狽撤上二樓屋簷喝熱茶，最後都能拿到一張屬於今晚卻不洩露個資的借閱小票。

## 畫面操作／系統處理流程

1. **伺服器相對時間計算（防本地時鐘竄改）**：前端收到體驗快照 `{ serverNow, deadlineAt }` 時記錄單調偏移 `initialRemainingMs = Math.max(0, deadlineAt - serverNow)` 與本地 `performance.now()` 起點，畫面顯示 `Math.ceil(Math.max(0, initialRemainingMs - (performance.now() - mountPerfNow)) / 1000)`；即使使用者修改手機或電腦系統日期時間，倒數顯示與伺服器 D1 判定均完全不受影響，且歸零時前端僅顯示等待結算而不自行宣判等級。
2. **暫緩自動恢復信號**：`StoryExperienceScreen` 監聽 `AppState`（Android）與 `document.visibilityState`（Web）；當救書處於 `paused` 且本人剛從斷線重連成功並處於前景可操作狀態時，自動送出一次受控 `resume-participation`；若本人因 15 秒閒置處於前景暫緩，則本人下一次點擊／滑動場景物件時送出操作由伺服器完成同步恢復。

### 畫面、元件與互動分解（適用時）

| 畫面／區域／角色／BDD | 實際頁面、元件、handler／F-ID | 布局、內容、素材與操作／手勢 | 狀態、導覽、禁用／錯誤／重試 | API／事件、權威狀態與平台差異 | 必要 S／I／V、可重現操作與視覺驗收 |
|---|---|---|---|---|---|
| **暴雨 7 步過場與背景音訊控制**<br>（`BDD-022`、`009`、`050`） | `F-03` `SceneWeather`、`F-04` `SceneStoryMotion`、`F-05` `StoryAudio` | 閃電遮罩、手電筒暗景光束、`prop-water-levels-v4` 四階段水痕；黑膠平滑淡換、唱針滋聲停轉、`bgm-rescue-tension` 與 `fx-countdown-tick`。 | `lastPlayedCueSeq` 防止重連重播；背景／失焦立即 `pauseAndUnload` 且回前景不自動重播。 | 依 `directorCue` 與 `audioProjection` 驅動；Web 與 Android 音訊生命週期一致。 | `SD-005-S01`／`I01`／`V-001`；雙端驗收於 `SD-006` |
| **手電筒 Ready、90s 雙向救書與快捷泡泡**<br>（`I` & `A`／`BDD-023`、`026`～`032`、`034`～`036`） | `F-01` `TimedRescueOverlay` | 頂部水位倒數條＋已救 `X/4`；`paused` 時浮現《慢節奏呼吸保護中》橫幅；`A` 端 `prop-wet-booklist-v4`、防潮袋 `prop-moisture-bag-v4`、上下層高櫃與 `prop-box-latches-v4` 三扣；`I` 端向上滑書手勢與 `prop-storage-rule-note-v4`；側邊 6 句快捷呼喊膠囊與舞台泡泡。 | 單方 ready 等待不扣秒；錯抽／錯槽／錯扣彈原稿提示並復位（已放書保留）；B 級鎖死低處導覽直進屋簷。 | 提交 `ready-flashlight`、`share-wet-clue`、`pull-and-pass-book`、`share-reverse-clue`、`bag-and-shelve-book`、`click-box-latch`、`quick-callout`、`resume-participation`。 | `SD-005-S02`／`I02`／`V-002`；雙端驗收於 `SD-006` |
| **書籤儀式、四結局與今日借閱小票**<br>（`I` & `A`／`BDD-038`、`040`～`042`、`044`～`046`） | `F-02` `BookmarkAndEndingPanel`、`F-07` `StoryExperienceScreen` | S（`prop-pudding-coffee-v4`）／A（`prop-towel-latte-v4`）／B（`bg-eaves-corridor-v4`＋`prop-thermos-towel-v4`）；`prop-bookmark-v4` 3 句選 1＋20 字純文字框；最終意願 3 選 1；結局 2 點木桌夥伴書翻開；`ui-memory-receipt-v4` 與 `ui-receipt-badges-v4` 復古印章。 | 字數 `>20` scalars 或含 `< >`／控制碼禁用送出；首份意願蓋牌等待；未成立印章不顯示；下一場切換清舊狀態，安全退出隨時可用。 | 提交 `submit-bookmark`、`submit-final-wish`、`open-partner-book`；共用 `SD-004` 之 `SceneBook` 顯示夥伴授權書籤。 | `SD-005-S03`、`S04`／`I03`、`I04`／`V-003`、`V-004`；雙端驗收於 `SD-006` |

## 技術規範與實作設計

### 架構、DDD 與責任

- 所屬層級：`frontend/client/src/`（後半元件、音訊／天氣／動畫與頂層 `StoryExperienceScreen` 唯一組裝層）。
- 唯讀引用 `SD-004` 已建立之 `frontend/client/src/scene-event-track.ts`、`BookshopMinimapOverlay`、`ShelfCloseupDrawer`、`AmbientInteractableModal`、`EmbeddedSceneStage`、`SceneBook`、`SceneEventActions`，零重複寫入。

### 重要函式、核心邏輯與狀態

| 核心 ID／目標類別或函式 | 輸入／輸出與前後置條件 | 演算法／分支／偽碼 | 交易／併發／冪等／重試 | 錯誤語意／驗證 |
|---|---|---|---|---|
| `C05-1`：`useMonotonicRescueCountdown`（`F-01`） | 輸入 `{ phase, serverNow, deadlineAt, pausedRemainingMs }`；輸出 `{ displaySeconds, waterStage }` | 使用 `performance.now()` 計算自收到快照起經過之單調毫秒數，絕不呼叫 `Date.now()` 與 `deadlineAt` 直接相減，徹底免疫客戶端調快／調慢系統時鐘。 | 快照更新時平滑校正基準。 | `RB4-T-165`～`167` 驗證。 |
| `C05-2`：`validateBookmarkInputClient`（`F-02`） | 輸入使用者輸入字串；輸出 `{ valid, runeCount, reason }` | `Array.from(str.normalize('NFC').trim())` 計算 Unicode code points 數 `0..20`、攔截控制字元與 `<`/`>`，提供與後端 `SceneEventV4Policy.ValidateBookmarkNote` 100% 對稱之即時 UI 回饋。 | 純同步計算。 | 後端仍做最終權威檢查。 |
| `C05-3`：`useBoundedSceneAssetCache` & 失權清理（`F-07`） | 輸入當前 `areaId`、鄰接 `adjacentAreaIds`、認證狀態與 `storySessionId` | 僅保留當前與相鄰 Area（最多 5 個區域視窗）之已載入圖片／音訊引用；當 `storySessionId` 切換、離開頁面或收到 `401`/`403` 時立即清空全部圖片 URI、停止音訊、清除私人書籤與 `cueFence`。 | 確定性生命週期清理 hook。 | `RB4-T-279`～`281`、`285`～`287` 驗證。 |

### 契約、資料與平台

- Web bundle 匯出驗證：組裝完成後必須通過 `npm --prefix frontend/client run export:web` 靜態建置無錯誤，供 `SD-006` Web E2E 與 Android Metro/APK 直接使用。

### 共用與改動合理性

- 將 `StoryExperienceScreen.tsx` 與 `RealtimeRoomClient.ts` 的寫入權集中於本包，使前半（`SD-004`）與後半（`SD-005`）子元件各自獨立開發測試後，在本包最後一步一次性無衝突組裝。

### 現行頂層整合與前後景契約

- F07 StoryExperienceScreen 的 submitTrackAction(event,action) 既有 guard：isTrackExperience、stageAssetReady、stageCameraReady、stageMediaUnavailable，再用 mutate('story.event.submit',trackActionPayload)。新 overlay 統一接此入口；不新增另一個 HTTP/WS mutation、不從動畫推導權威狀態。pending unknown 依既有 receipt recovery；revision/conflict 重抓 snapshot，不樂觀重送。
- F01 新 TimedRescueOverlay 只讀服務器 phase/deadline/remainingMs/ready/step/slot/latchIndex/rescuedCount；用接收 snapshot 的 serverNow + monotonic elapsed 顯示 ceil 秒數，paused 固定 remaining；每次 snapshot/前景/重連重新對齊。0 秒不由前端判 grade；權威結果才進結局。雙 ready 之前不跑計時，I 搜救 A 收納不交換角色；3/4 本由 I 分享反轉規則；錯扣只重置次序不把書放回原位。
- F03 SceneWeather(intensity,frame,phase)、F04 SceneStoryMotion(steps,objects,frame,viewport,asset,onStep,onFinish)、F05 StoryAudio(url,cueUrl,cueId,musicUrl,mix) 擴充 v3 已提交 cue；保留 seenCues/cueGeneration 去重，已過期不追播、失焦停播，切換 snapshot 後舊 cue onFinish 不得回寫新 scene。聲音只依權威曲目、mix 與使用者開關，不跟著背景輪詢重播。
- F06 RealtimeRoomClient＋F09 listenSceneBrowserLifecycle：Web blur/focus、visibility 與 native AppState 同步使用前景可操作 guard；resume-participation 僅實際有效重連／恢復前景或合法操作、資產及互動 ready 時送一次，第一個恢復操作只同步。不能以 heartbeat 或背景 retry 當活動。SD003 決定合格角色及是否恢復。
- F02 新 BookmarkAndEndingPanel 按既有 actor-safe DTO 分支；note 以既有 story.ts validStoryMessage 同安全過濾，允許 trim 空值或 1–20 scalar；server 拒絕為準。結局鏡位／人物姿勢取 SD001 pinned assets＋既有 actorRigs，無資產 fail closed，保留聊天、退出、重讀。小票只讀授權完成資料，不傳入自由文字；B 無書籤／意願。結局2的授權書由 SceneBook 共用展示，無權限不載入。
- F08 Vitest：`npm --prefix frontend/client test -- scene-event-v4-rescue-endings`；整包 `npm run test:client`＋`npm --prefix frontend/client run export:web`。Web export 只證明 build；真操作、Android／重連及效能由 SD006。

## 檔案改動設計

### F-01：`frontend/client/src/TimedRescueOverlay.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：全新手電筒 Ready Gate、權威單調倒數 HUD、15s 暫緩橫幅、濕清單／反轉卡、上滑傳書、防潮袋／高櫃上下層／三態鎖扣與快捷呼喊泡泡元件。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-008`、`009`／`RB4-BDD-023`、`026`～`032`、`034`～`036`／`RB4-T-159`～`161`、`165`～`167`／`SD-005-D02`、`I02`／`S02`
- 改動要點與必要核心邏輯：實作 `useMonotonicRescueCountdown`、向上滑書手勢、裝袋上架與三態鎖扣（錯扣歸零不丟已放書）及雙角色各 6 句快捷呼喊（只發舞台泡泡，不呼叫聊天發送）。
- 此檔案的責任與白話設計原因：承載 90 秒跨區雙向協作的核心操作介面與即時回饋。
- 輸入／輸出、介面及契約限制：唯讀引用 `SD-004` `scene-event-track.ts` 之 `TimedRescueView`。
- 前置依賴：`SD-004` 完成 `F-01` 型別。
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入。
- 驗證方式與預期結果：`V-002` 單元測試通過。
- 實際證據回填位置：`V-002`（待回填）。

### F-02：`frontend/client/src/BookmarkAndEndingPanel.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：全新阿澄事後致謝、牛皮書籤儀式、3×3 最終意願、四結局專屬視覺層與《雨聲書店・今日借閱小票》元件。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-006`、`010`、`011`／`RB4-BDD-038`、`040`～`042`、`044`／`RB4-T-230`～`232`／`SD-005-D03`、`I03`／`S03`
- 改動要點與必要核心邏輯：渲染 S/A/B 飲品甜點毛巾道具、書籤 3 句＋20 scalar 輸入檢查、最終意願蓋牌等待、結局 2 木桌夥伴書點擊入口，以及零個資復古收據與 4 枚條件印章。
- 此檔案的責任與白話設計原因：呈現四種實質差異結局的情感收尾與可收藏的視覺記憶小票。
- 輸入／輸出、介面及契約限制：絕不接收或顯示真實姓名、Email、真人照片或他人未授權 `note`。
- 前置依賴：`SD-004` 型別。
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入。
- 驗證方式與預期結果：`V-003` 單元測試通過。
- 實際證據回填位置：`V-003`（待回填）。

### F-03：`frontend/client/src/SceneWeather.tsx`、`F-04`：`SceneStoryMotion.tsx` 與 `F-05`：`StoryAudio.tsx`

- 改動類型：修改三檔
- 目標類別／函式／區段與現況證據：擴充天氣（閃電、停電手電筒光束、4 階段水位線）、演出動畫（唱針停轉、水痕擴展、阿澄防洪離櫃）與音訊（3 首黑膠淡換、救書弦樂、最後 15 秒節拍、背景立即停播且回前景不自動恢復）。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-003`、`007`、`008`、`012`／`RB4-BDD-009`、`022`、`030`、`050`／`RB4-T-118`～`120`／`SD-005-D01`、`I01`／`S01`
- 改動要點與必要核心邏輯：綁定 `cueFence` 序號確保重連不重播舊閃電／炸雷；`StoryAudio` 嚴格在背景／失焦／卸載／失權時立即停止並釋放播放器。
- 此檔案的責任與白話設計原因：提供跨平台一致的風暴氛圍演出與嚴格背景音訊安全控制。
- 輸入／輸出、介面及契約限制：保持 V3 舊音訊與天氣 props 相容。
- 前置依賴：`SD-001` 素材契約、`SD-004` 型別。
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入。
- 驗證方式與預期結果：`RB4-T-118`～`120` 與音訊測試通過。
- 實際證據回填位置：`V-001`（待回填）。

### F-06：`frontend/client/src/RealtimeRoomClient.ts` 與 `F-07`：`frontend/client/src/StoryExperienceScreen.tsx`

- 改動類型：修改兩檔
- 目標類別／函式／區段與現況證據：擴充前景可見狀態追蹤與重連同步，並在 `StoryExperienceScreen.tsx` 完整組裝 `SD-004` 前半元件與本包後半元件、15s 暫緩前景重入自動恢復、有界快取釋放、缺素材 fail-closed（保留聊天／退出）、靜態化身零重產重用、雙同意下一場清理與全階段安全退出。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-AC-001`～`012`、`014`／全部 42 個 `@frontend` BDD／`RB4-T-279`～`281`、`285`～`287`／`SD-005-D04`、`I04`／`S04`
- 改動要點與必要核心邏輯：依 `experience.schemaVersion === 'scene-event.v3'` 啟用去按鈕化 V4 舞台組裝，串接所有動作至統一 `submitStoryEvent`，並記錄載入／互動延遲／快取計數供 Gate A 效能驗收讀取。
- 此檔案的責任與白話設計原因：作為全前端單一頂層組裝點，統合所有畫面狀態、即時同步與資源安全釋放。
- 輸入／輸出、介面及契約限制：V3 場次仍走原 V3 分支零退化。
- 前置依賴：`SD-003` 後端契約、`SD-004` 前半元件、本包 `F-01`～`F-05`。
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入。
- 驗證方式與預期結果：`npm run test:client` 與 `npm --prefix frontend/client run export:web` 全數成功。
- 實際證據回填位置：`V-004`（待回填）。

### F-08：`frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`

- 改動類型：新增
- 目標類別／函式／區段與現況證據：新增後半風暴、救書、結局、小票、化身重用、快取釋放與全畫面組裝共 18 項前端 Unit TDD 測試套件。
- 對應 SYS／SPEC／BDD／TDD／Todo／負責步驟：`SYS-008`／`RB4-T-118`～`120`、`159`～`161`、`165`～`167`、`230`～`232`、`279`～`281`、`285`～`287`／`SD-005-I01`～`I04`／`S01`～`S04`
- 改動要點與必要核心邏輯：測試風暴 cue fence、單調倒數免疫本地改時鐘、救書手勢與快捷泡泡、四結局與結局 2 翻書、小票零個資、化身切換零重產與失權清資源。
- 此檔案的責任與白話設計原因：為後半複雜動態互動與資源清理提供快速可靠的單元驗證。
- 輸入／輸出、介面及契約限制：遵循既有 client test runner。
- 前置依賴：隨 `S01`～`S04` Red-Green 撰寫。
- 寫入責任、共用責任與可寫區段：`SD-005` 唯一寫入。
- 驗證方式與預期結果：`npm run test:client` 100% 通過。
- 實際證據回填位置：`V-001`～`V-004`（待回填）。

### F-09：`frontend/client/src/scene-browser-lifecycle.ts`、`frontend/client/src/story.ts`

SD-005 唯一修改 `listenSceneBrowserLifecycle` 與必要既有 story client API adapter，與 `StoryExperienceScreen`、`RealtimeRoomClient` 共用權威 snapshot；AppState/blur/visibility 失焦停止音訊與微動、取消未提交手勢、失權清有界快取；返回僅重讀及依 RA-Q1 判定可操作後恢復，不自動播放、不偷送救書。S01/S04、V-001/V-004，Web/Android 實際重連歸 SD-006。SD-004 只讀這些契約。

## 有序實作與驗證步驟

### 步驟順序與起始關卡

| 步驟 ID／成果 | 唯一負責 I-ID／來源 | 前置步驟及所需結果／跨包契約 | F-ID／V-ID | 通過後可開始的下一步／條件 | 執行狀態／證據位置 |
|---|---|---|---|---|---|
| `SD-005-S01`：主動暴雨 7 步過場、重連 Cue Fence 與音訊淡換／驟停／背景停播元件 | `SD-005-I01`／`RB4-BDD-022`、`RB4-T-118`～`120` | `SD-003` 與 `SD-004` 已完成 | `F-03`、`F-04`、`F-05`、`F-08`／`V-001` | `SD-005-S02`（風暴過場與音訊測試全綠） | `Planned`；待回填 |
| `SD-005-S02`：手電筒 Ready、單調權威倒數、4 階段水位、15s 暫緩橫幅、雙向救書手勢與快捷呼喊泡泡 | `SD-005-I02`／`RB4-BDD-023`、`026`～`032`、`034`～`036`、`RB4-T-159`～`161`、`165`～`167` | `SD-005-S01` 通過 | `F-01`、`F-08`／`V-002` | `SD-005-S03`（救書手勢、單調時鐘與快捷泡泡全綠） | `Planned`；待回填 |
| `SD-005-S03`：阿澄致謝、牛皮書籤儀式、3×3 意願、四結局視覺層、結局 2 翻對方書與今日借閱小票 | `SD-005-I03`／`RB4-BDD-038`、`040`～`042`、`044`、`RB4-T-230`～`232` | `SD-005-S02` 通過 | `F-02`、`F-08`／`V-003` | `SD-005-S04`（四結局與小票測試全綠） | `Planned`；待回填 |
| `SD-005-S04`：`StoryExperienceScreen` 頂層全場組裝、前景自動恢復、化身零重產、失權有界快取清理與 Web 匯出驗證 | `SD-005-I04`／`RB4-BDD-045`、`046`、`048`～`050`、`RB4-T-279`～`281`、`285`～`287` | `SD-005-S03` 通過 | `F-06`、`F-07`、`F-08`／`V-004` | 本包全部完成，解鎖 `SD-006` 雙平台真環境 E2E 與 Gate A | `Planned`；待回填 |

### SD-005-S01：主動暴雨 7 步過場、重連 Cue Fence 與音訊淡換／驟停／背景停播元件

**對應成果與責任**：唯一負責 `SD-005-I01`；來源 `RB4-AC-007`、`RB4-BDD-022`、`RB4-T-118`～`120`；檔案 `F-03`～`F-05`、`F-08`；驗證 `V-001`。
**開始條件與前置證據**：`SD-003` 與 `SD-004` 已完成。
**必讀工作範圍**：`SceneWeather.tsx`、`SceneStoryMotion.tsx`、`StoryAudio.tsx`、`rain-bookshop-v4.json` 之 `directorFloodInterrupt`。
**可寫檔案／符號及禁止改動**：`F-03`～`F-05`、`F-08`。
**產品改動與 BDD／畫面關聯**：實作閃光、炸雷、`storm-crisis` 冷鏡、黑膠唱針滋聲停轉、大雨與漫水演出，以及重連 `cueFence` 防重播與背景強制停播。
**具體行為與核心邏輯**：首次收到導演事件序號播放完整 7 步序列；斷線重連收到同一已處理序號時直接呈現暗景與水痕當前態，不重閃白光或重播炸雷。
**允許自行決定的局部細節**：閃光淡出補間參數。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-S01-1`／`RB4-T-118`～`120` 暴雨過場與重連 | 送入首次 `directorCue` 驗證 7 步與台詞，再模擬斷線重連載入相同 `eventSeq` | 首次完整觸發閃光、雷聲、`storm-crisis`、黑膠停轉與水痕；重連還原當前狀態且重播次數為 `0`、無假提交 | 背景失焦立即停止音訊播放 | `V-001`／`scene-event-v4-rescue-endings.test.tsx` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 建立 `scene-event-v4-rescue-endings.test.tsx` 寫入 `RB4-T-118`～`120` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 因風暴 7 步與唱針停轉尚未實作而失敗 | 待回填 |
| 2／Green | 實作 `F-03`、`F-04`、`F-05` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | `RB4-T-118`～`120` 全通過 | 待回填 |
| 3／必要 Refactor 與回歸 | 跑前端單元回歸 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:client` | 全數通過，完成 `SD-005-I01` | 待回填 |

**本步通過條件**：`RB4-T-118`～`120` 與既有音訊／天氣測試通過。
**必須停止的情況與回報內容**：前置、必要測試環境、實際檔案／契約與設計不符，或驗收斷言不成立且需改設計時停止；不降低規格。
**可在本步修正的範圍**：`F-03`～`F-05`、`F-08`。
**下一步與起始條件**：`SD-005-S02`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：無外部副作用。

### SD-005-S02：手電筒 Ready、單調權威倒數、4 階段水位、15s 暫緩橫幅、雙向救書手勢與快捷呼喊泡泡

**對應成果與責任**：唯一負責 `SD-005-I02`；來源 `RB4-AC-008`、`009`、`RB4-BDD-023`、`026`～`032`、`034`～`036`、`RB4-T-159`～`161`、`165`～`167`；檔案 `F-01`、`F-08`；驗證 `V-002`。
**開始條件與前置證據**：`SD-005-S01` 通過。
**必讀工作範圍**：`contracts/rain-bookshop-v4.json` 之 `rescueReadyGate`、`timedCoopRescue`、本包 `C05-1`。
**可寫檔案／符號及禁止改動**：`F-01`、`F-08`。
**產品改動與 BDD／畫面關聯**：實作 `TimedRescueOverlay` 全部救書操作、單調倒數（免疫竄改 `Date.now`）、75/50/30/15s 水位播報去重、15s 暫緩橫幅、錯抽／錯槽／錯扣復位與雙方各 6 句快捷舞台泡泡。
**具體行為與核心邏輯**：快捷泡泡點擊只呼叫 `onSubmitRescueAction('quick-callout', { calloutId })`，絕不呼叫聊天室 `sendChatMessage`，且只渲染本人角色所屬 6 句按鈕。
**允許自行決定的局部細節**：水痕波動與泡泡淡出微動畫。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-S02-1`／`RB4-T-159`～`161` 快捷呼喊與舞台泡泡 | 分別以 `inviter` 與 `acceptor` 渲染救書中介面並點擊 6 句快捷 | 僅顯示本人合法 6 句原文；點擊產生舞台泡泡命令，`onSendChat` 呼叫數為 `0`；未分享清單不外洩 | 偽造他方 ID 由後端拒絕並於前端無入口 | `V-002`／`scene-event-v4-rescue-endings.test.tsx` |
| `C05-S02-2`／`RB4-T-165`～`167` 水位階段、單調秒數與手勢復位 | 推進跨 75/50/30/15s、延遲重連在 20s 載入、竄改 `Date.now() + 999999`；另測上滑傳書、錯扣復位與 `paused` 橫幅 | 4 階段原文與 `ceil` 秒數一致，20s 重連不補播 75/50/30s 舊 cue，改 `Date.now` 不影響顯示秒數；錯扣復位保留已上架書視覺 | 單方 ready 顯示等待且秒數不減 | `V-002`／同上 |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增 `RB4-T-159`～`161`、`165`～`167` 與救書手勢元件測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 因 `TimedRescueOverlay` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-01` `TimedRescueOverlay` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 新增測試全數通過 | 待回填 |
| 3／必要 Refactor 與回歸 | 跑完整前端測試套件 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:client` | 100% 通過，完成 `SD-005-I02` | 待回填 |

**本步通過條件**：`V-002` 與 `npm run test:client` 全綠。
**必須停止的情況與回報內容**：前置、必要測試環境、實際檔案／契約與設計不符，或驗收斷言不成立且需改設計時停止；不降低規格。
**可在本步修正的範圍**：`F-01`、`F-08`。
**下一步與起始條件**：`SD-005-S03`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：無外部副作用。

### SD-005-S03：阿澄致謝、牛皮書籤儀式、3×3 意願、四結局視覺層、結局 2 翻對方書與今日借閱小票

**對應成果與責任**：唯一負責 `SD-005-I03`；來源 `RB4-AC-010`、`011`、`RB4-BDD-038`、`040`～`042`、`044`、`RB4-T-230`～`232`；檔案 `F-02`、`F-08`；驗證 `V-003`。
**開始條件與前置證據**：`SD-005-S02` 通過。
**必讀工作範圍**：`contracts/rain-bookshop-v4.json` 之 `clerkAftermath`、`bookmarkRitual`、`finalWish`、`endings`、`memoryReceipt`、本包 `C05-2`。
**可寫檔案／符號及禁止改動**：`F-02`、`F-08`。
**產品改動與 BDD／畫面關聯**：實作 `BookmarkAndEndingPanel`，涵蓋書籤 0–20 scalar 即時檢核、3×3 意願蓋牌等待、四結局專屬鏡位光色與道具（S 布丁、A 拿鐵毛巾、B 屋簷保溫瓶）、結局 2 翻閱對方桌上書入口與零個資《今日借閱小票》。
**具體行為與核心邏輯**：四種結局畫面絕不出現任何條件代碼或規格說明字樣；重連載入已結局狀態直接穩定呈現結局與小票，不退回救書或意願選擇前。
**允許自行決定的局部細節**：小票鋸齒邊框陰影與展開動畫曲線。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-S03-1`／`RB4-T-230`～`232` 四結局、書籤與借閱小票 | 逐一傳入 `ev4-01`～`04` 投影並模擬重連；測試書籤 0/20/21 字與 `<script>` 輸入；測試結局 2 翻開夥伴桌上書與小票 4 稱號／4 印章 | 四結局各自鏡位、色調、道具與原文精確呈現，B 專屬屋簷無書籤步驟；重連不退回且零規格字；21 字與 HTML 即時攔截；小票無任何個資或自由輸入 | 未成立印章絕不渲染 | `V-003`／`scene-event-v4-rescue-endings.test.tsx` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增 `RB4-T-230`～`232` 及書籤／小票元件測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 因 `BookmarkAndEndingPanel` 尚未建立而失敗 | 待回填 |
| 2／Green | 實作 `F-02` `BookmarkAndEndingPanel` | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 新增測試全數通過 | 待回填 |
| 3／必要 Refactor 與回歸 | 跑完整前端測試套件 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:client` | 100% 通過，完成 `SD-005-I03` | 待回填 |

**本步通過條件**：`RB4-T-230`～`232` 與 `npm run test:client` 全綠。
**必須停止的情況與回報內容**：前置、必要測試環境、實際檔案／契約與設計不符，或驗收斷言不成立且需改設計時停止；不降低規格。
**可在本步修正的範圍**：`F-02`、`F-08`。
**下一步與起始條件**：`SD-005-S04`。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：無外部副作用。

### SD-005-S04：`StoryExperienceScreen` 頂層全場組裝、前景自動恢復、化身零重產、失權有界快取清理與 Web 匯出驗證

**對應成果與責任**：唯一負責 `SD-005-I04`；來源 `RB4-AC-011`、`012`、`014`、`RB4-BDD-032`、`045`、`046`、`048`～`050`、`055`、`RB4-T-279`～`281`、`285`～`287`；檔案 `F-06`、`F-07`、`F-08`；驗證 `V-004`。
**開始條件與前置證據**：`SD-005-S03` 通過，且 `SD-004` 全部元件已就緒。
**必讀工作範圍**：`StoryExperienceScreen.tsx`、`RealtimeRoomClient.ts`、`SD-004` 匯出之全部元件、本包 `C05-3`。
**可寫檔案／符號及禁止改動**：`F-06`、`F-07`、`F-08`。
**產品改動與 BDD／畫面關聯**：完成 V4 全流程畫面組裝、斷線重回前景自動送 `resume-participation`、缺素材 fail-closed 保留聊天與退出、16 款免費與 ready AI 靜態化身 4 姿態 5 表情重用（零重產）、失權與離開立即清圖片／音訊／私有書籤快取、雙同意下一場清舊 cue，並驗證 `export:web` 正式打包通過。
**具體行為與核心邏輯**：`useBoundedSceneAssetCache` 限制快取上限為當前與相鄰區，收到 `401`/`403` 或 `round.ended` 同步清空所有敏感狀態與媒體實例。
**允許自行決定的局部細節**：內部效能指標物件掛載結構（僅提供非敏感耗時與快取計數供測試讀取）。

#### 測試資料與預期結果

| 案例 ID／來源與類型 | fixture／輸入及初始狀態 | 預期輸出／錯誤／狀態 | 必要斷言與副作用 | V-ID／測試位置 |
|---|---|---|---|---|
| `C05-S04-1`／`RB4-T-279`～`281` 靜態化身重用與失權清圖 | 16 免費角色與 ready AI 化身切換 4 姿態×5 表情、重連及模擬 `401`/`403` 失權 | 保持原核准外觀、切換與重連觸發生成 API 次數為 `0`；失權立即清空化身與場景圖片 URI | 真 provider 與回放標記嚴格區分 | `V-004`／`scene-event-v4-rescue-endings.test.tsx` |
| `C05-S04-2`／`RB4-T-285`～`287` 有界快取、缺素材保護與全畫面組裝 | 連續跨 8 區移動、翻書、倒數、切換下一場、安全退出與注入 503 缺素材 | 快取資源數維持有界、離開與失權後清為 `0`；503 時不顯假圖且聊天與安全退出仍可操作；Web 靜態匯出成功 | 無實測數據時效能標記維持未簽認 | `V-004`／同上 + `export:web` |

#### 本步操作次序與判定

| 順序／子階段 | 操作與目標符號 | 工作目錄 | 命令／測試選擇器或畫面操作 | 預期結果與判定 | 實際結果／證據回填位置 |
|---|---|---|---|---|---|
| 1／Red | 新增 `RB4-T-279`～`281`、`285`～`287` 與 `StoryExperienceScreen` V4 整合單元測試 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 因 `StoryExperienceScreen` 尚未掛載 V4 元件與有界快取而失敗 | 待回填 |
| 2／Green | 實作 `F-06`、`F-07` 完成全場組裝與資源管理 | `C:\GitProjects\gamenenstyle\datinghigh` | `npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 本包全部 18 項 Unit TDD 全數通過 | 待回填 |
| 3／必要 Refactor 與回歸＋Web 正式打包驗證 | 執行全前端測試套件並匯出正式 Web bundle | `C:\GitProjects\gamenenstyle\datinghigh` | `npm run test:client && npm --prefix frontend/client run export:web` | 全部前端測試（含 `SD-004` 24 項＋本包 18 項＋既有 V3）通過且 Web bundle 匯出零錯誤 | 待回填 |

**本步通過條件**：本包 18/18 項 TDD、`npm run test:client` 與 `export:web` 全數通過。
**必須停止的情況與回報內容**：前置、必要測試環境、實際檔案／契約與設計不符，或驗收斷言不成立且需改設計時停止；不降低規格。
**可在本步修正的範圍**：`F-01`～`F-08`。
**下一步與起始條件**：全系統產品程式碼（`SD-001`～`SD-005`）至此全部就緒，移交 [SD-006](SD-006-跨系統整合雙平台E2E與技術GateA驗收.md) 執行真環境跨系統整合、Web／Android 雙端實測與技術 Gate A。
**實際執行狀態／目前子階段／證據**：待回填。
**中斷與恢復資訊**：重跑 `npm run test:client` 核對現況。

### 細步執行清冊（依 DEC-14 重建順序）

上方 S01～Sxx 區塊保留完整核心設計、具體 fixture、命令及群組整合關卡；有下列細步的群組先依表逐步完成產品行為，再執行原群組回歸/整合，**不重複實作或計數**。細步為獨立 S-ID、引用原唯一 I；所有必要細步與原群組驗收成立才可勾選該 I。跨包產品位置是唯讀依賴，真正寫入只依本包 F。未完全查明精確符號或分支的細步不得直接開工，須先完成全量設計稽核。

| 群組關卡 | 有序細步（先執行，後群組整合） | 唯一 I | 狀態 |
|---|---|---|---|
| SD-005-S01 | SD-005-S122 | SD-005-I01 | Planned |
| SD-005-S02 | SD-005-S223 → SD-005-S226 → SD-005-S227 → SD-005-S228 → SD-005-S229 → SD-005-S230 → SD-005-S231 → SD-005-S232 → SD-005-S234 → SD-005-S235 → SD-005-S236 | SD-005-I02 | Planned |
| SD-005-S03 | SD-005-S338 → SD-005-S340 → SD-005-S341 → SD-005-S342 → SD-005-S344 | SD-005-I03 | Planned |
| SD-005-S04 | SD-005-S445 → SD-005-S446 → SD-005-S448 → SD-005-S449 → SD-005-S450 | SD-005-I04 | Planned |

#### SD-005-S122：StormPresentation

**唯一 I／原群組／F-V**：SD-005-I01／SD-005-S01／`F-03`、`F-04`、`F-05`、`F-08`／`V-001`。**來源**：RB4-BDD-022；RB4-T-118、RB4-T-119、RB4-T-120。

**可觀察成果與行為**：`RB4-BDD-022` StormPresentation (`RB4-AC-007`；@happy-path @critical @frontend)；Given 伺服器已提交導演事件 / When 兩端接cue或斷線重連 / Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞 / And 原合法鏡位與權威世界一致 / And 重連還原當前狀態不重播舊cue或假提交。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-118`：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-119`：原合法鏡位與權威世界一致。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-120`：重連還原當前狀態不重播舊cue或假提交。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S01 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S223：ReadyGate

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-023；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-023` ReadyGate (`RB4-AC-008`；@happy-path @critical @frontend)；Given 救書ready且一方尚未接手電筒 / When 單方先ready後雙方並行ready / Then 單方等待不扣秒 / And 雙ready原子建立唯一deadline與題組 / And 雙端同一權威倒數並顯示原文等待提示。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S226：RescueSteps

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-026；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-026` RescueSteps (`RB4-AC-008`；@happy-path @critical @frontend)；Given 任一原題組第1或第2步 / When A分享線索、I跨合法區抽書上滑、A收書裝袋上架 / Then 權威狀態依角色與步驟轉移 / And 只有合法完整上架計1本 / And 原文成功回饋、無危險入口操作。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S227：ReverseClues

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-027；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-027` ReverseClues (`RB4-AC-008`；@happy-path @critical @frontend)；Given 已完成前兩本 / When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條 / Then 反轉線索只合法分享才揭露 / And 第3本下層、第4本完整鎖扣才增加計數 / And 兩組原文toast及合法結果完整 / And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S228：WrongRescue

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-028；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-028` WrongRescue (`RB4-AC-008`；@error-handling @critical @frontend)；Given 救書進行中 / When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動 / Then 錯書／槽／扣原文回饋 / And 不增加rescuedCount、不接受不合法持物或轉移 / And UI復位，合法後續仍可完成 / And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S229：QuickCallouts

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-029；RB4-T-159、RB4-T-160、RB4-T-161。

**可觀察成果與行為**：`RB4-BDD-029` QuickCallouts (`RB4-AC-008`；@happy-path @critical @frontend)；Given 救書中雙方各有6句快捷 / When 逐句點選並嘗試偽造他方ID / Then 只顯示本人合法原文 / And 明確點擊才發舞台泡泡 / And 不寫假真人聊天、不洩未分享答案。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-159`：只顯示本人合法原文。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-160`：明確點擊才發舞台泡泡。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-161`：不寫假真人聊天、不洩未分享答案。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S230：WaterStages

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-030；RB4-T-165、RB4-T-166、RB4-T-167。

**可觀察成果與行為**：`RB4-BDD-030` WaterStages (`RB4-AC-008`；@boundary @critical @frontend)；Given 90秒倒數已running / When 權威時間跨75/50/30/15秒及延遲重連 / Then 各水位階段及原文播報正確 / And 過期cue不重播、畫面ceil秒數一致 / And client改時鐘不影響D1 deadline / And 各門檻來自釘選內容，發布時驗證數字文案一致。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-165`：各水位階段及原文播報正確。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-166`：過期cue不重播、畫面ceil秒數一致。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-167`：client改時鐘不影響D1 deadline。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S231：PauseIdle

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-031；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-031` PauseIdle (`RB4-AC-008`；@boundary @critical @frontend)；Given running時一方合法操作停止 / When 測14999/15000ms閒置且仍有ping / Then 未達15秒不暫緩、達門檻暫緩 / And ping不更新有效活動 / And 保存剩餘時間且原稿暫緩提示正確 / And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S232：PauseReconnect

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-032；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-032` PauseReconnect (`RB4-AC-008`；@alternative-path @critical @frontend)；Given 一方斷線15秒已暫緩 / When 雙方恢復可操作、重複斷線多次 / Then 自動恢復且不要求確認按鈕 / And 保存剩餘時間、無次數上限、不補扣暫緩秒 / And 重連／冷啟動不重設90秒 / And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與 / And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S234：GradeS

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-034；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-034` GradeS (`RB4-AC-009`；@happy-path @critical @frontend)；Given 4本在期限內完成 / When 伺服器提交最後合法封箱 / Then 立即S不等歸零 / And 播放原文及布丁演出 / And 走書籤／最終意願而非屋簷。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S235：GradeA

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-035；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-035` GradeA (`RB4-AC-009`；@boundary @critical @frontend)；Given 到期已救2或3本 / When DO喚醒或合法讀取補償 / Then A結算且停止救書 / And 原文退至高處、拿鐵及毛巾 / And 走書籤／最終意願。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S236：GradeB

**唯一 I／原群組／F-V**：SD-005-I02／SD-005-S02／`F-01`、`F-08`／`V-002`。**來源**：RB4-BDD-036；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-036` GradeB (`RB4-AC-009`；@boundary @critical @frontend)；Given 到期已救0或1本 / When 系統結算 / Then B直接ev4-04-eaves-shelter / And 停止救書且不可再進危險區或提交 / And 屋簷原文與專用鏡位，不走書籤或wish。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateRescueAction`, `TryResumeFromPause`, `SettleRescueByGrade`), `cloudflare/src/scene-event-track-commands.ts`, `room-socket.ts`, `frontend/client/src/SceneWeather.tsx`, `SceneStoryMotion.tsx`, `StoryAudio.tsx`, `TimedRescueOverlay.tsx`, `StoryExperienceScreen.tsx`。`SceneWeather` + `SceneStoryMotion` + `TimedRescueOverlay`：7 步風暴演出（`cueFence` 防重播）、手電筒 Ready、單調權威 `ceil` 秒數與 4 階段水痕、15s 暫緩呼吸橫幅與前景重入／操作自動恢復（無按鈕、首動不計分）、濕清單／上滑傳書／防潮袋／上下層／三態鎖扣（錯扣歸零保留已放書）、各 6 句快捷舞台泡泡、S 布丁／A 拿鐵／B 強制撤離屋簷（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S02 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S338：Bookmark

**唯一 I／原群組／F-V**：SD-005-I03／SD-005-S03／`F-02`、`F-08`／`V-003`。**來源**：RB4-BDD-038；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-038` Bookmark (`RB4-AC-010`；@happy-path @critical @frontend)；Given S/A已結算 / When 逐書三句書籤選一，選填0/20字並各自提交 / Then 沿用草稿原句與本人短語 / And 未合法公開前對方看不到 / And 留書結局可原位翻對方已授權書籤 / And 未授權 note 不得由素材、歷史事件或通知取得。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S340：WishMatrix

**唯一 I／原群組／F-V**：SD-005-I03／SD-005-S03／`F-02`、`F-08`／`V-003`。**來源**：RB4-BDD-040；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-040` WishMatrix (`RB4-AC-010`；@happy-path @critical @frontend)；Given S/A兩方書籤已完成 / When 覆核3×3共9種最終意願組合 / Then 兩人keep-talking才ev4-01 / And 無quiet且至少一share-books才ev4-02 / And 任一quiet即ev4-03；第一份未揭露。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S341：EndingArt

**唯一 I／原群組／F-V**：SD-005-I03／SD-005-S03／`F-02`、`F-08`／`V-003`。**來源**：RB4-BDD-041；RB4-T-230、RB4-T-231、RB4-T-232。

**可觀察成果與行為**：`RB4-BDD-041` EndingArt (`RB4-AC-010`；@happy-path @critical @frontend)；Given 四種結局各已合法提交 / When 看場景光色、距離、原文、互動並重連 / Then 四結局各自正式鏡位與素材 / And S/A對應致謝與書籤，B專屬屋簷 / And 重連不退回結局前，不出現規格文字。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-230`：四結局各自正式鏡位與素材。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-231`：S/A對應致謝與書籤，B專屬屋簷。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-232`：重連不退回結局前，不出現規格文字。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S342：ReceiptTitle

**唯一 I／原群組／F-V**：SD-005-I03／SD-005-S03／`F-02`、`F-08`／`V-003`。**來源**：RB4-BDD-042；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-042` ReceiptTitle (`RB4-AC-011`；@boundary @critical @frontend)；Given S/A/B權威完成 / When 以S剩29999／30000／30001ms及A/B測小票 / Then S_fast >=30000、其餘S_normal / And A/B稱號原文符合草稿 / And 書、黑膠、救援統計及阿澄附註只來自已提交事實 / And 稱號門檻隨釘選版本設定；小票不含自由輸入。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S344：ReceiptBadges

**唯一 I／原群組／F-V**：SD-005-I03／SD-005-S03／`F-02`、`F-08`／`V-003`。**來源**：RB4-BDD-044；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-044` ReceiptBadges (`RB4-AC-011`；@happy-path @critical @frontend)；Given 四印章各有獨立成立或不成立事實 / When 測同書／換曲／對方見符號／quiet+S/A / Then 各印章只對應原稿條件 / And 不成立不顯示、重送不重複 / And 小票無真實姓名、Email、照片、私密Profile或未授權內容 / And 印章依當前符號實際呈現見證而非背景讀取或自我見證。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S03 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S445：NaturalCompletion

**唯一 I／原群組／F-V**：SD-005-I04／SD-005-S04／`F-06`、`F-07`、`F-08`／`V-004`。**來源**：RB4-BDD-045；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-045` NaturalCompletion (`RB4-AC-011`；@happy-path @critical @frontend)；Given 本場已結局、Round仍active / When 自然完成後聊天、單方同意／撤回再雙方同意下一場 / Then 不額外要求完成按鈕或支線 / And 聊天仍可用；雙方同意才建新場 / And 新場釘選合法版本、舊投影與cue清除。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S446：SafeExit

**唯一 I／原群組／F-V**：SD-005-I04／SD-005-S04／`F-06`、`F-07`、`F-08`／`V-004`。**來源**：RB4-BDD-046；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-046` SafeExit (`RB4-AC-011`；@error-handling @critical @frontend)；Given ready/running/paused/settled/completed任一階段 / When 一方確認退出並與救書或alarm競態 / Then 退出不受倒數或素材故障阻塞 / And 解除占用、終止權限且pair排除 / And 無後續訊息／操作／私有圖或舊cue / And 退出與救書競態的敗方不再寫入。

**產品檔案、核心邏輯與 UX**：`Domain/SceneEventV4Policy.cs` (`EvaluateFinalWish`, `BuildMemoryReceiptProjection`), `Application/SceneBookProjection.cs` (`ProjectPartnerTableBook`), `cloudflare/src/scene-event-track-commands.ts`, `frontend/client/src/BookmarkAndEndingPanel.tsx`, `SceneBook.tsx`, `StoryExperienceScreen.tsx`。`BookmarkAndEndingPanel` + `SceneBook` + `StoryExperienceScreen`：牛皮書籤 3 句＋0–20 字即時防呆、3×3 意願蓋牌等待、四結局專屬鏡位／光色／道具（無規格字）、結局 2 原位翻開夥伴桌上書滑出書籤、零個資《今日借閱小票》（4 稱號、`X/4`、4 印章）、自然完成聊天／雙同意下一場／全階段安全退出（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S448：AssetReadiness

**唯一 I／原群組／F-V**：SD-005-I04／SD-005-S04／`F-06`、`F-07`、`F-08`／`V-004`。**來源**：RB4-BDD-048；無本群組主要 TDD；產品責任與後續整合驗證依 BDD／追溯矩陣，不新增來源案例。

**可觀察成果與行為**：`RB4-BDD-048` AssetReadiness (`RB4-AC-012`；@error-handling @critical @frontend)；Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready / When 載入、恢復與點擊 / Then fail closed，不以placeholder冒充 / And 保留可用聊天/退出及重讀、現有錯誤碼 / And 恢復原版且不重抽、不呼叫Gemini / And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。本步不另計來源 ID；後續依追溯責任與群組整合斷言。


**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S449：AvatarReuse

**唯一 I／原群組／F-V**：SD-005-I04／SD-005-S04／`F-06`、`F-07`、`F-08`／`V-004`。**來源**：RB4-BDD-049；RB4-T-279、RB4-T-280、RB4-T-281。

**可觀察成果與行為**：`RB4-BDD-049` AvatarReuse (`RB4-AC-012`；@happy-path @critical @frontend)；Given 16免費角色及既有ready AI套組 / When 切換4姿態5表情、重連與失權 / Then 保持已核准身份／外觀、資產共用 / And 切換或重連不重產 / And 失權清圖；真provider證據與回放分開 / And 必要真 provider 質量及成本證據不可由回放代簽。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-279`：保持已核准身份／外觀、資產共用。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-280`：切換或重連不重產。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-281`：失權清圖；真provider證據與回放分開。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。

#### SD-005-S450：PlatformPerformance

**唯一 I／原群組／F-V**：SD-005-I04／SD-005-S04／`F-06`、`F-07`、`F-08`／`V-004`。**來源**：RB4-BDD-050；RB4-T-285、RB4-T-286、RB4-T-287。

**可觀察成果與行為**：`RB4-BDD-050` PlatformPerformance (`RB4-AC-012`；@performance @critical @frontend)；Given 正式V4完整資產、Web與Android現有驗收裝置 / When 連續探索、翻書、倒數、背景與重連 / Then 記錄載入／操作延遲／記憶體／動畫對V3基線 / And 離開與失權清資源且有界快取 / And 無實測不得標Gate A通過 / And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證。

**產品檔案、核心邏輯與 UX**：`cloudflare/src/scene-event-read.ts`, `scene-event-authorization.ts`, `frontend/client/src/StoryExperienceScreen.tsx` (`useBoundedSceneAssetCache`), `StoryAudio.tsx`。`StoryExperienceScreen` + `StoryAudio`：缺素材／壞 SHA fail-closed（不顯示假圖，保留聊天與安全退出）、16 免費與 ready AI 靜態化身 4 姿態×5 表情重用零重產與失權清圖、有界快取釋放與 Web/Android 載入／延遲／記憶體基線對照（Web & Android）。本細步只寫入本分項群組 F 授權的實際產品檔案及測試；上述跨包檔案由其唯一 owner 實作，不在本步重寫。按群組核心分支與既有符號擴充，前置契約、錯誤、副作用及平台差異沿用同群組明定內容。

**測試／操作與判定**：工作目錄 `datinghigh`；`npm run test:client`，以群組指定元件測試檔；Web/Android 真觸控依 SD-006。先按 Given 建立實際 fixture，Red 驗證具體未實作條件（純準備/驗收不製造 Red）；Green 執行本細步的產品行為並核對下列來源結果、同群組具體案例值及必要副作用；Refactor 只在核准範圍，完成後跑群組回歸。主要斷言如下：
- `RB4-T-285`：記錄載入／操作延遲／記憶體／動畫對V3基線。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-286`：離開與失權清資源且有界快取。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。
- `RB4-T-287`：無實測不得標Gate A通過。；測試位置 `frontend/client/tests/unit/scene-event-v4-rescue-endings.test.tsx`。

**前置／停止／恢復**：群組起始條件及同群組前一步成立；若缺必要產品符號、實際路徑、已確定的 fixture/斷言、真平台、權利或契約而須改設計即停止；不得以測試名稱代簽。完成本細步指定成果及斷言，再執行同群組下一細步；最後執行 SD-005-S04 群組回歸與整合關卡。 證據只回填 Verification 與本步現行狀態；尚未開發。


## 測試計劃與實際驗證方式

| 驗證 ID／來源 Todo／步驟 ID | 層級／行為／平台 | 環境與前置資料／案例 ID | 工作目錄與實際命令或畫面操作 | 預期結果／斷言 | 實作／測試位置 | 實際結果、時間、log／畫面證據 | 驗收狀態／等價依據或恢復條件 |
|---|---|---|---|---|---|---|---|
| `V-001`／`SD-005-I01`／`S01` | UX+Unit／暴雨 7 步過場、重連 cue fence 與背景停播／Client Test | 風暴 cue 投影／`RB4-T-118`～`120` | `C:\GitProjects\gamenenstyle\datinghigh`<br>`npm --prefix frontend/client test -- scene-event-v4-rescue-endings` | 3 項全綠，重連不重播舊閃電、背景立即停播 | `F-03`～`F-05`／`F-08` | 待回填 | `Incomplete` |
| `V-002`／`SD-005-I02`／`S02` | UX+Unit／Ready、單調倒數、4 水位、雙向救書手勢與快捷泡泡／Client Test | 救書投影／`RB4-T-159`～`161`、`165`～`167` | 同上 | 6 項全綠，改本地時鐘無效、快捷不進真人聊天 | `F-01`／`F-08` | 待回填 | `Incomplete` |
| `V-003`／`SD-005-I03`／`S03` | UX+Unit／書籤儀式、四結局、結局 2 翻書與借閱小票／Client Test | 四結局與小票投影／`RB4-T-230`～`232` | 同上 | 3 項全綠，四結局差異化、小票零個資 | `F-02`／`F-08` | 待回填 | `Incomplete` |
| `V-004`／`SD-005-I04`／`S04` | UX+Unit+Build／頂層組裝、化身零重產、失權有界快取與 Web 匯出／Client+Expo Web | 全階段投影／`RB4-T-279`～`281`、`285`～`287` | `C:\GitProjects\gamenenstyle\datinghigh`<br>`npm run test:client && npm --prefix frontend/client run export:web` | 6 項與全 client 套件通過，Web bundle 建置成功 | `F-06`、`F-07`／`F-08` | 待回填 | `Incomplete` |

## 依賴關係與執行順序

| 任務／交付物 | 唯一執行／整合／驗收責任 | 前置／契約版本／開始條件 | 可寫範圍及排除 | 共享環境／隔離／互斥 | 安全並行或循序理由 | 完成及回傳條件 |
|---|---|---|---|---|---|---|
| `SD-005` 後半危機結局 UX 與 `StoryExperienceScreen` 全場組裝 | `SD-005` 執行者／移交 `SD-006` 雙端 E2E 驗收 | `SD-003` 與 `SD-004` 均已完成 | 僅限本包 `F-01`～`F-08`；唯讀引用 `SD-004` 檔案 | 前端測試與靜態匯出環境，不佔用 `8787` | 循序於 `SD-003`、`SD-004` 之後以無衝突組裝 `StoryExperienceScreen.tsx` | 回傳 `F-01`～`F-08` 改動、18/18 項 Unit 綠燈與 `export:web` 產出成功證據 |

## 風險、設計變更與人工確認紀錄

| ID／原設計版本 | 發現證據與為何不能照案實作 | 白話實務情境／功能影響 | 建議／替代與影響 SD／BDD／TDD | 負責者／觸發／成本時程 | 使用者決策／核准範圍／新版本 | 失效證據／重驗與恢復條件 |
|---|---|---|---|---|---|---|
| `RA-01`、`RA-11`／`v0.2.0-draft` | 斷線重連後若要求額外點「繼續」按鈕違反 `RQ-01`；多區 80 素材若無界快取可能造成 Android 記憶體飆高或退背景仍漏音 | 影響雙人救書流暢度與行動裝置體驗 | 前景重入自動送 `resume-participation`；實作有界快取與失焦強制停播 | `SD-005` 執行者／`S01`、`S04` | 上游 `RQ-01=A`、`RA-Q1/Q4=A` 已確認；等待本 SD 包 `v0.2.0-draft` 核准 | 無失效證據 |

## 實現檢查清單／Todo

### D：設計葉節點

- [ ] **SD-005-D01** 完成主動暴雨 7 步過場、重連 `cueFence` 防重播與 3 首黑膠／救書弦樂／背景立即停播音訊設計
  - 類型／唯一分組：D／設計（暴雨過場、90s 雙向手勢救書與暫緩恢復、書籤四結局小票、音訊與資源生命週期）
  - 來源／責任／依賴：`RB4-AC-003`、`007`、`012`、`RB4-BDD-009`、`022`、`050`／`SD-005`／依賴 `SD-001-D04`、`SD-004-D01`
  - 完成條件／設計證據：已明定於 `F-03`～`F-05` 及步驟 `S01`
- [ ] **SD-005-D02** 完成手電筒 Ready Gate、單調權威倒數、4 階段水位、15s 暫緩橫幅、雙向救書手勢（上滑／裝袋／上下層／三扣）與快捷泡泡設計
  - 類型／唯一分組：D／設計（暴雨過場、90s 雙向手勢救書與暫緩恢復、書籤四結局小票、音訊與資源生命週期）
  - 來源／責任／依賴：`RB4-AC-008`、`009`、`RQ-01`、`RA-01`、`RA-05`、`RB4-BDD-023`、`026`～`036`／`SD-005`／依賴 `SD-004-D01`
  - 完成條件／設計證據：已明定於 `C05-1`、`F-01` 及步驟 `S02`
- [ ] **SD-005-D03** 完成阿澄致謝、牛皮書籤 0–20 scalar 即時檢核、3×3 意願、四結局專屬視覺、結局 2 翻對方桌上書與零個資借閱小票設計
  - 類型／唯一分組：D／設計（暴雨過場、90s 雙向手勢救書與暫緩恢復、書籤四結局小票、音訊與資源生命週期）
  - 來源／責任／依賴：`RB4-AC-006`、`010`、`011`、`RB4-BDD-038`、`040`～`042`、`044`／`SD-005`／依賴 `SD-004-D02`
  - 完成條件／設計證據：已明定於 `C05-2`、`F-02` 及步驟 `S03`
- [ ] **SD-005-D04** 完成 `StoryExperienceScreen` 頂層組裝、前景自動恢復信號、靜態化身零重產、失權有界快取釋放與安全退出設計
  - 類型／唯一分組：D／設計（暴雨過場、90s 雙向手勢救書與暫緩恢復、書籤四結局小票、音訊與資源生命週期）
  - 來源／責任／依賴：`RB4-AC-011`、`012`、`014`、`RB4-BDD-032`、`045`、`046`、`048`～`050`、`055`／`SD-005`／依賴 `SD-003-D04`、`SD-005-D01`～`D03`
  - 完成條件／設計證據：已明定於 `C05-3`、`F-06`、`F-07` 及步驟 `S04`

### I：實作驗證葉節點

- [ ] **SD-005-I01** 實作並驗證暴雨 7 步過場、重連 `cueFence` 防重播與背景強制停播音訊元件（3 項 Unit）
  - 類型／唯一分組：I／UX + Unit（Expo Web／Android 後半元件、`StoryExperienceScreen` 組裝與單元驗證）
  - 來源／責任／依賴：`RB4-BDD-022`、`RB4-T-118`～`120`／`SD-005` 執行者／依賴 `SD-003`、`SD-004`
  - 全部必要步驟／指定整合驗證：`SD-005-S01`（雙端真畫面 E2E 於 `SD-006`）；並須完成 SD-005-S122
  - 驗收條件／驗證 ID：`V-001` 3 項單元測試全通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-005-I02** 實作並驗證手電筒 Ready、單調倒數、4 階段水位、雙向救書手勢與快捷呼喊泡泡元件（6 項 Unit）
  - 類型／唯一分組：I／UX + Unit（Expo Web／Android 後半元件、`StoryExperienceScreen` 組裝與單元驗證）
  - 來源／責任／依賴：`RB4-BDD-023`、`026`～`032`、`034`～`036`、`RB4-T-159`～`161`、`165`～`167`／`SD-005` 執行者／依賴 `SD-005-I01`
  - 全部必要步驟／指定整合驗證：`SD-005-S02`（雙端真畫面 E2E 於 `SD-006`）；並須完成 SD-005-S223、SD-005-S226、SD-005-S227、SD-005-S228、SD-005-S229、SD-005-S230、SD-005-S231、SD-005-S232、SD-005-S234、SD-005-S235、SD-005-S236
  - 驗收條件／驗證 ID：`V-002` 6 項單元測試全通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-005-I03** 實作並驗證牛皮書籤儀式、3×3 意願、四結局、結局 2 翻對方書與今日借閱小票元件（3 項 Unit）
  - 類型／唯一分組：I／UX + Unit（Expo Web／Android 後半元件、`StoryExperienceScreen` 組裝與單元驗證）
  - 來源／責任／依賴：`RB4-BDD-038`、`040`～`042`、`044`、`RB4-T-230`～`232`／`SD-005` 執行者／依賴 `SD-005-I02`
  - 全部必要步驟／指定整合驗證：`SD-005-S03`（雙端真畫面 E2E 於 `SD-006`）；並須完成 SD-005-S338、SD-005-S340、SD-005-S341、SD-005-S342、SD-005-S344
  - 驗收條件／驗證 ID：`V-003` 3 項單元測試全通過
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`
- [ ] **SD-005-I04** 完成 `StoryExperienceScreen` 全場組裝、前景自動恢復、化身零重產、失權有界快取清理與 `export:web` 打包驗證（6 項 Unit）
  - 類型／唯一分組：I／UX + Unit（Expo Web／Android 後半元件、`StoryExperienceScreen` 組裝與單元驗證）
  - 來源／責任／依賴：`RB4-BDD-045`、`046`、`048`～`050`、`RB4-T-279`～`281`、`285`～`287`／`SD-005` 執行者／依賴 `SD-005-I03`
  - 全部必要步驟／指定整合驗證：`SD-005-S04`（雙端真畫面 E2E 於 `SD-006`）；並須完成 SD-005-S445、SD-005-S446、SD-005-S448、SD-005-S449、SD-005-S450
  - 驗收條件／驗證 ID：`V-004` 6 項單元測試、`npm run test:client` 全綠且 `export:web` 產出成功
  - 產物與實際證據／驗收狀態：待回填／`Incomplete`

## 檢查點與續作交接

**目前狀態**：Draft／Planned／Incomplete，所有 I 未開工。來源與候選保留；final 版本 `0.2.0-draft` 未核准。

**責任與共享資源**：以本文件 F 責任、系統設計、總覽的順序為準；無產品寫入、無資料副作用、無進行中的產品 runner。

**恢復條件**：完整設計稽核與使用者核准精確 final 版本後，核對來源與程式基準，依細步執行。發現設計漂移、權利不明、平台或 guard 不足即停止；保留已證實成果，僅重驗受影響範圍。

## 相關文檔

- [SD 總覽](../00-overview.md)
- [系統設計](../01-system-design.md)
- [追溯矩陣](../02-traceability.md)
- 前置與後續分項：[SD-003](SD-003-權威計時交易與房間排程同步.md)、[SD-004](SD-004-去按鈕化探索書牆與雙向破冰前端UX.md) → **本包 SD-005** → [SD-006](SD-006-跨系統整合雙平台E2E與技術GateA驗收.md) → [SD-007](SD-007-實玩GateB與Local清理結案交付.md)
- 上游文件：[SPEC-001-RainBookshopV4](../../../../specs/SPEC-001-RainBookshopV4.md)、[BDD](../../../../bdd/SPEC-001-RainBookshopV4-BDD.md)、[TDD](../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)

## 生成者、最後更新與狀態

ChatGPT GPT-6.2／2026-11-26／`0.2.0-draft`。基於兩候選及 DEC-01～14 的整合草案。產品未開發，禁止進 carefully-done。
