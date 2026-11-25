# SD-005-WebAndroid整合與GateA — 分項實作設計

狀態：Draft／未實作；契約 v2；設計 v2；2026-11-25。

## 開發進度總覽
### 整體進度
設計 D：0/1 已正式稽核；實作 I：0/43；本包主要 TDD：0/89（89 個規劃案例，非測試通過數）。
### 分層／分組進度追蹤
- Unit：0/3
- Integration：0/0
- API：0/0
- E2E：0/86
### 當前 Sprint 狀態
未開始；待候選完整稽核及人工核准。
### 里程碑
本包步驟全部驗收後依賴交接；Gate A/B 獨立。
### 關鍵指標
原稿相等、source ID 完整與所有適用層級實測；不以數量代替品質。
### 每日進度記錄
依 DatingHigh 規範不適用；實際證據只在既有 Verification。

## 功能概述
用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
## 功能需求與來源追溯
[全量矩陣](../02-traceability.md)；RB4-BDD-001、RB4-BDD-002、RB4-BDD-003、RB4-BDD-004、RB4-BDD-005、RB4-BDD-006、RB4-BDD-007、RB4-BDD-008、RB4-BDD-009、RB4-BDD-010、RB4-BDD-011、RB4-BDD-012、RB4-BDD-013、RB4-BDD-014、RB4-BDD-015、RB4-BDD-016、RB4-BDD-017、RB4-BDD-019、RB4-BDD-020、RB4-BDD-022、RB4-BDD-023、RB4-BDD-026、RB4-BDD-027、RB4-BDD-028、RB4-BDD-029、RB4-BDD-030、RB4-BDD-031、RB4-BDD-032、RB4-BDD-034、RB4-BDD-035、RB4-BDD-036、RB4-BDD-038、RB4-BDD-040、RB4-BDD-041、RB4-BDD-042、RB4-BDD-044、RB4-BDD-045、RB4-BDD-046、RB4-BDD-048、RB4-BDD-049、RB4-BDD-050、RB4-BDD-051、RB4-BDD-055。
## 用戶故事
以原 BDD 雙人真實配對、角色獨立／合作及退出權為準，本包不增加劇情。
## 畫面操作／系統處理流程
- SD-005-S01：由 actor role 決定唯一入店合法 action，門把/傘桶各自節點獨立；scene cue 不構成另一人進度。
- SD-005-S02：以 pinned graph 的 area adjacency 與 safe-zone guard 判定移動，暖金提示只取本人合法未探索項。
- SD-005-S03：呼吸光每 area 首入一次；空白長按只顯當前合法物件；取消、重新連線皆不得提交。
- SD-005-S04：以鏡位座標及 hit mask 區分 tap/長按/drag/swipe；取消或超區不 commit，合法 gesture 只送一次。
- SD-005-S05：原稿 20 書、封面、書卡、頁、字條、共鳴與書籤逐值比對；合法預覽不推進。
- SD-005-S06：盲書未撕前僅三個包裝標籤；撕封 actor-scoped CAS 後才釋出內容，取消不揭。
- SD-005-S07：僅本人已儲存興趣參與推薦；跨帳戶與 raw R2/WS 不得暴露 tags 或未揭封。
- SD-005-S08：書 ID 與三個共鳴 option 由原稿驗證；本人選定後顯示原文，preview/他人不得讀。
- SD-005-S09：黑膠切換是共用 state；只同步選曲不強迫播放；實際換曲一次才記 stamp fact。
- SD-005-S10：非主線場景探索維持兩人 track 與 revision 獨立；repeatable cue 不強制觸發主線。
- SD-005-S11：擦拭三階段及四符號按原稿；共享結果與本人動畫分離；重送不得加 stamp。
- SD-005-S12：對方前景實際渲染才送 witness；驗角色非作者、session、版本、Area、phase、授權；GET 不算。
- SD-005-S13：雙方合法選書後按 same/different 條件選原稿破冰，不由 client 宣稱相同。
- SD-005-S14：面紙拖放由合法 area 與近遠 slot/gesture 決定；取消不送或變更 Track。
- SD-005-S15：留白分支允許 A 主動；I 尊重獨處後退讓；不可代對方提交。
- SD-005-S16：拒絕保持原稿分支與可選探索，不生成假真人聊天。
- SD-005-S17：warm-track 才 seed 抽 4 題之一並釘選；各自提交先私密，雙提交同時翻牌。
- SD-005-S19：8 情境 24 原句按狀態篩選，僅聊天草稿；真人發送才寫 chat。
- SD-005-S20：阿澄 3 話題、4 組致謝依原稿條件；非阻塞 NPC cue 不代玩家回覆。
- SD-005-S22：七步暴雨演出依 sequence/cue fence；閃電、斷電、黑膠停止、進水不能重播舊 cue。
- SD-005-S23：雙角色各一個 ready；首次雙 ready 才建立 pinned duration deadline，重複 ready 不重計。
- SD-005-S26：每本依序分享線索→取書→上滑→收納；holder/slot/step 原子狀態，禁止跳步與雙計。
- SD-005-S27：第3本 bottom，第4本 top；I 取得反轉規則後才可分享 A，答案不預先下發。
- SD-005-S28：錯書/錯格不計；錯鎖扣 latchIndex 歸0，已放書/已救數保留、時間繼續。
- SD-005-S29：12 句原稿快捷呼喊只作合法 actor cue，不偽造真人聊天；重送依 receipt。
- SD-005-S30：75/50/30/15s 四階段在越過邊界後只投最新可見階段；遲到 alarm 不追播。
- SD-005-S31：雙方最近合法活動/有效連線取最早 15s 邊界，若早於 deadline 則 pause，剩餘以應暫緩時刻計。
- SD-005-S32：閒置者實際操作、斷線者回可操作畫面才恢復；首操作只同步；另一活動方不必操作；保留 holder/latch。
- SD-005-S34：4 本 deadline 前即 S；以剩餘毫秒 >=30000 決定 S_fast，原稿結局資料由 server。
- SD-005-S35：deadline 到且 2–3 本即 A，保留已救數；結算後拒救書動作。
- SD-005-S36：deadline 到且 0–1 本即 B，直接屋簷，不能再入危險區或進書籤願望。
- SD-005-S38：S/A 逐書三句或選填短語；0–20 Unicode scalar 純文字、合法公開前僅本人讀。
- SD-005-S40：雙方 wish 私密，任一 quiet→03；both keep→01；其餘無 quiet 且有 share→02；B→04。
- SD-005-S41：四結局原稿鏡位、道具、cue；S/A合法書籤，B屋簷；重連不倒退。
- SD-005-S42：四稱號由 S_fast 邊界、S_normal/A/B 及原文決定；小票由 server facts 生成。
- SD-005-S44：四印章按原稿 fact：same book/vinyl/witness/quiet+S/A；不含私密或自由輸入。
- SD-005-S45：結局自然完成 Session、Round 保持 active；雙同意下一場、撤回與聊天依既有 guard。
- SD-005-S46：任何 phase 可確認退出；round/claim CAS 阻止後續 event/cue/private asset；永久排除保持。
- SD-005-S48：缺正式 asset/遮罩/SHA/ready avatar fail closed；保留可用聊天退出；不得假圖或重產。
- SD-005-S49：沿用免費16款及 ready AI 四姿態五表情；切換、重連零重產；失權清除圖片。
- SD-005-S50：量測 Web 與 Android 真實延遲、渲染、記憶體及回歸；依原 TDD 門檻，不自行降低。
- SD-005-S51：Gate A 逐來源證據、真 D1/R2/DO、正式素材及權利、必要真供應商、雙平台全部成立。
- SD-005-S55：清理後以全新雙人配對在 V4-only 索引跑完整 Web/Android；舊 SHA 不可再選。
## 技術規範與實作設計
### 架構、DDD 與責任
SYS-07；用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
### 重要函式、核心邏輯與狀態
依[系統設計](../01-system-design.md)與下列每步；不在 renderer 決定結果、不在 Domain 執行 I/O。現有符號與 v4 proposed contract 的精確對應仍待逐檔稽核。
### 契約、資料與平台
21 表、0 新欄、0 Trigger、0 新公開 API；既有 revision、session、receipt、pin、授權、size guard 不放寬。Web/Android 分別驗證；本包不包含 iOS 與無障礙專項。
### 共用與改動合理性
僅新增 V4 所需行為，保留 V3 已驗收路徑至 Gate B，禁止跨包重複寫檔。

## 檔案改動設計

本包只有測試 runner／證據工作，屬純驗證例外；實際產品改動在 SD-001～004，不把測試檔案當業務程式。Gate A 的三個 Unit 項 RB4-T-291～293 必須重新定位到適合純驗收政策的 Unit runner，與真雙平台 Gate A 證據分開；目前主映射有缺陷，未解決前不能核准。SD-005-S55 只在 Gate B 及 SD-006-S54 完成後開始，不是 Gate A 的前置。
### F-01：`tests/e2e/web/scene-event-v4.spec.ts`
測試責任：依下方各 S 的 V-ID 建立具名測試，保留舊回歸，實際 assert 不以 mock 替代整合。 新檔（設計提案），不得誤認已存在。

### F-02：`tests/e2e/android/scene-event-v4.mjs`
測試責任：依下方各 S 的 V-ID 建立具名測試，保留舊回歸，實際 assert 不以 mock 替代整合。 新檔（設計提案），不得誤認已存在。

## 有序實作與驗證步驟
### 步驟順序與起始關卡
SD-005-S01 → SD-005-S02 → SD-005-S03 → SD-005-S04 → SD-005-S05 → SD-005-S06 → SD-005-S07 → SD-005-S08 → SD-005-S09 → SD-005-S10 → SD-005-S11 → SD-005-S12 → SD-005-S13 → SD-005-S14 → SD-005-S15 → SD-005-S16 → SD-005-S17 → SD-005-S19 → SD-005-S20 → SD-005-S22 → SD-005-S23 → SD-005-S26 → SD-005-S27 → SD-005-S28 → SD-005-S29 → SD-005-S30 → SD-005-S31 → SD-005-S32 → SD-005-S34 → SD-005-S35 → SD-005-S36 → SD-005-S38 → SD-005-S40 → SD-005-S41 → SD-005-S42 → SD-005-S44 → SD-005-S45 → SD-005-S46 → SD-005-S48 → SD-005-S49 → SD-005-S50 → SD-005-S51；SD-005-S55 為 Gate B 及 SD-006-S54 之後的獨立回歸步驟；跨包依總覽的階段順序。D1 時鐘可行性須先於救援實作，Gate B 須先於清理。

### SD-005-S01：EnterStore

- 來源：RB4-BDD-001；；SYS：SYS-07；對應 I：SD-005-I01。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：由 actor role 決定唯一入店合法 action，門把/傘桶各自節點獨立；scene cue 不構成另一人進度。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S01 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-001`；標籤：@happy-path @critical @frontend
- Given 兩位玩家各自釘選V4且尚未入店
- When I點門把且A點傘桶
- Then I與A分別到合法下一節點
- And 另一方未操作前其Track不變
- And 原場景融圖、門鈴與原文依角色呈現
- V-RB4-T-004（E2E）：EnterStore_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。；斷言：I與A分別到合法下一節點；另一方未操作前其Track不變；原場景融圖、門鈴與原文依角色呈現；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-005（E2E）：EnterStore_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。；斷言：I與A分別到合法下一節點；另一方未操作前其Track不變；原場景融圖、門鈴與原文依角色呈現；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I01；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S02：NavigateAreas

- 來源：RB4-BDD-002；；SYS：SYS-07；對應 I：SD-005-I02。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：以 pinned graph 的 area adjacency 與 safe-zone guard 判定移動，暖金提示只取本人合法未探索項。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S02 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-001`；標籤：@happy-path @critical @frontend
- Given 本人可探索目前區域
- When 左右導航及小地圖選合法相鄰區
- Then 鏡位與Area依合法鄰接更新
- And 暖金點只示本人合法未探索或新事件
- And 不顯示平鋪移動按鈕海或漂浮星號
- V-RB4-T-009（E2E）：NavigateAreas_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。；斷言：鏡位與Area依合法鄰接更新；暖金點只示本人合法未探索或新事件；不顯示平鋪移動按鈕海或漂浮星號；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-010（E2E）：NavigateAreas_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。；斷言：鏡位與Area依合法鄰接更新；暖金點只示本人合法未探索或新事件；不顯示平鋪移動按鈕海或漂浮星號；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I02；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S03：DiscoverObjects

- 來源：RB4-BDD-003；；SYS：SYS-07；對應 I：SD-005-I03。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：呼吸光每 area 首入一次；空白長按只顯當前合法物件；取消、重新連線皆不得提交。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S03 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-001`；標籤：@boundary @critical @frontend
- Given 本場首次進區、其後再次進同區
- When 先觀看呼吸光再長按空白與放開
- Then 首次只提示一次
- And 長按只短暫顯示合法物件輪廓
- And 掃視、取消或重連不提交主線
- V-RB4-T-014（E2E）：DiscoverObjects_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。；斷言：首次只提示一次；長按只短暫顯示合法物件輪廓；掃視、取消或重連不提交主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-015（E2E）：DiscoverObjects_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：本場首次進區、其後再次進同區；動作：先觀看呼吸光再長按空白與放開。；斷言：首次只提示一次；長按只短暫顯示合法物件輪廓；掃視、取消或重連不提交主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I03；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S04：GestureFence

- 來源：RB4-BDD-004；；SYS：SYS-07；對應 I：SD-005-I04。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：以鏡位座標及 hit mask 區分 tap/長按/drag/swipe；取消或超區不 commit，合法 gesture 只送一次。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S04 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-001`；標籤：@error-handling @critical @frontend
- Given 鏡頭縮放、手勢衝突或請求pending
- When 快速連點、滑動、拖出、取消或送舊revision
- Then 一次合法意圖最多一次提交
- And 無效命中或取消不提交且物件復位
- And 409重新同步、未知結果只同ID查receipt
- V-RB4-T-019（E2E）：GestureFence_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。；斷言：一次合法意圖最多一次提交；無效命中或取消不提交且物件復位；409重新同步、未知結果只同ID查receipt；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-020（E2E）：GestureFence_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：鏡頭縮放、手勢衝突或請求pending；動作：快速連點、滑動、拖出、取消或送舊revision。；斷言：一次合法意圖最多一次提交；無效命中或取消不提交且物件復位；409重新同步、未知結果只同ID查receipt；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I04；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S05：BookCatalog

- 來源：RB4-BDD-005；；SYS：SYS-07；對應 I：SD-005-I05。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：原稿 20 書、封面、書卡、頁、字條、共鳴與書籤逐值比對；合法預覽不推進。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S05 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
- Given 20本書正式目錄可用
- When 逐一在5區開書並翻至末頁
- Then 16經典和4盲書ID、區域、素材符合原稿
- And 全文、卡片、字條、書籤與共鳴原文逐書相等
- And 合法預覽合回原位且不推進
- V-RB4-T-024（E2E）：BookCatalog_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。；斷言：16經典和4盲書ID、區域、素材符合原稿；全文、卡片、字條、書籤與共鳴原文逐書相等；合法預覽合回原位且不推進；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-025（E2E）：BookCatalog_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：20本書正式目錄可用；動作：逐一在5區開書並翻至末頁。；斷言：16經典和4盲書ID、區域、素材符合原稿；全文、卡片、字條、書籤與共鳴原文逐書相等；合法預覽合回原位且不推進；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I05；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S06：BlindBook

- 來源：RB4-BDD-006；；SYS：SYS-07；對應 I：SD-005-I06。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：盲書未撕前僅三個包裝標籤；撕封 actor-scoped CAS 後才釋出內容，取消不揭。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S06 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
- Given 4盲書尚未揭封
- When 滑動各封條、取消、成功揭封後重連
- Then 揭封前只有合法包裝三標籤
- And 有效揭封後才投影該書內容
- And 取消／重送不誤選、不揭另一方私密書
- And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文
- V-RB4-T-030（E2E）：BlindBook_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。；斷言：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-031（E2E）：BlindBook_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。；斷言：揭封前只有合法包裝三標籤；有效揭封後才投影該書內容；取消／重送不誤選、不揭另一方私密書；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I06；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S07：InterestBadge

- 來源：RB4-BDD-007；；SYS：SYS-07；對應 I：SD-005-I07。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：僅本人已儲存興趣參與推薦；跨帳戶與 raw R2/WS 不得暴露 tags 或未揭封。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S07 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-002`；標籤：@error-handling @critical @frontend
- Given 雙方有不同未公開興趣
- When 以本人身份讀書架或竄改owner
- Then 推薦貼紙只依本人已儲存興趣
- And raw DTO不含對方興趣或未揭封內容
- And 越權讀取拒絕且不快取私人資料
- V-RB4-T-037（E2E）：InterestBadge_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。；斷言：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-038（E2E）：InterestBadge_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：雙方有不同未公開興趣；動作：以本人身份讀書架或竄改owner。；斷言：推薦貼紙只依本人已儲存興趣；raw DTO不含對方興趣或未揭封內容；越權讀取拒絕且不快取私人資料；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I07；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S08：Resonance

- 來源：RB4-BDD-008；；SYS：SYS-07；對應 I：SD-005-I08。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：書 ID 與三個共鳴 option 由原稿驗證；本人選定後顯示原文，preview/他人不得讀。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S08 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
- Given A選定草稿任一本書
- When 逐一選該書三項共鳴之一
- Then 只提交該書合法選項
- And 原文內心獨白對本人呈現
- And 他人看不到未分享共鳴且預覽不等於選擇
- V-RB4-T-042（E2E）：Resonance_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。；斷言：只提交該書合法選項；原文內心獨白對本人呈現；他人看不到未分享共鳴且預覽不等於選擇；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-043（E2E）：Resonance_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。；斷言：只提交該書合法選項；原文內心獨白對本人呈現；他人看不到未分享共鳴且預覽不等於選擇；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I08；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S09：VinylSync

- 來源：RB4-BDD-009；；SYS：SYS-07；對應 I：SD-005-I09。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：黑膠切換是共用 state；只同步選曲不強迫播放；實際換曲一次才記 stamp fact。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S09 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@happy-path @critical @frontend
- Given 兩方均在本場且各自音效偏好不同
- When 合法切換3曲並重連
- Then 共享曲目以權威版本同步
- And 淡換及原文提示正確、不強制他方開聲音
- And 背景停止播放器、回前景不自動播放
- V-RB4-T-048（E2E）：VinylSync_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。；斷言：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-049（E2E）：VinylSync_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。；斷言：共享曲目以權威版本同步；淡換及原文提示正確、不強制他方開聲音；背景停止播放器、回前景不自動播放；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I09；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S10：AmbientExplore

- 來源：RB4-BDD-010；；SYS：SYS-07；對應 I：SD-005-I10。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：非主線場景探索維持兩人 track 與 revision 獨立；repeatable cue 不強制觸發主線。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S10 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@alternative-path @critical @frontend
- Given 玩家等待對方主線操作
- When 查看小黑板、5則留言及阿澄3話題
- Then 所有原文及合法區域可用
- And 小黑板布丁伏筆保留
- And 探索不阻塞對方、非必經主線
- V-RB4-T-053（E2E）：AmbientExplore_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。；斷言：所有原文及合法區域可用；小黑板布丁伏筆保留；探索不阻塞對方、非必經主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-054（E2E）：AmbientExplore_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。；斷言：所有原文及合法區域可用；小黑板布丁伏筆保留；探索不阻塞對方、非必經主線；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I10；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S11：FogWindow

- 來源：RB4-BDD-011；；SYS：SYS-07；對應 I：SD-005-I11。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：擦拭三階段及四符號按原稿；共享結果與本人動畫分離；重送不得加 stamp。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S11 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@happy-path @critical @frontend
- Given 窗區可見雨勢
- When 擦霧查看3階段雨勢並留下4種合法符號
- Then 擦霧純呈現不誤提交
- And 符號由明確操作建立共享版本
- And 離窗後／替換／轉場只依已確認生命週期投影
- V-RB4-T-058（E2E）：FogWindow_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。；斷言：擦霧純呈現不誤提交；符號由明確操作建立共享版本；離窗後／替換／轉場只依已確認生命週期投影；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-059（E2E）：FogWindow_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。；斷言：擦霧純呈現不誤提交；符號由明確操作建立共享版本；離窗後／替換／轉場只依已確認生命週期投影；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I11；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S12：FogWitness

- 來源：RB4-BDD-012；；SYS：SYS-07；對應 I：SD-005-I12。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：對方前景實際渲染才送 witness；驗角色非作者、session、版本、Area、phase、授權；GET 不算。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S12 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@boundary @critical @frontend
- Given 窗區符號存在且對方尚未見證
- When 背景讀取、同作者見證、舊符號見證及對方實際呈現
- Then 前3種不計印章
- And 只接受對方在窗區對目前版本的合法見證
- And 成立事實保留到小票；替換／轉場／完成清可見符號
- And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤
- V-RB4-T-064（E2E）：FogWitness_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。；斷言：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-065（E2E）：FogWitness_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：窗區符號存在且對方尚未見證；動作：背景讀取、同作者見證、舊符號見證及對方實際呈現。；斷言：前3種不計印章；只接受對方在窗區對目前版本的合法見證；成立事實保留到小票；替換／轉場／完成清可見符號；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I12；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S13：SameDifferentBook

- 來源：RB4-BDD-013；；SYS：SYS-07；對應 I：SD-005-I13。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙方合法選書後按 same/different 條件選原稿破冰，不由 client 宣稱相同。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S13 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@happy-path @critical @frontend
- Given 兩人各自完成正式選書
- When 測同一本與不同一本兩路
- Then 以已提交ID比對
- And I走iv4-04-same或diff及原文
- And 他人未提交時不揭露、不代選
- V-RB4-T-070（E2E）：SameDifferentBook_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。；斷言：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-071（E2E）：SameDifferentBook_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。；斷言：以已提交ID比對；I走iv4-04-same或diff及原文；他人未提交時不揭露、不代選；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I13；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S14：TissueDistance

- 來源：RB4-BDD-014；；SYS：SYS-07；對應 I：SD-005-I14。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：面紙拖放由合法 area 與近遠 slot/gesture 決定；取消不送或變更 Track。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S14 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@happy-path @critical @frontend
- Given I可接近閱讀角
- When 拖面紙到近／遠合法位置後A各選收下／不用
- Then 距離與原文cue依實際手勢
- And A收不收面紙不等於是否聊天
- And 錯區或重送不提交額外行為
- V-RB4-T-076（E2E）：TissueDistance_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。；斷言：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-077（E2E）：TissueDistance_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。；斷言：距離與原文cue依實際手勢；A收不收面紙不等於是否聊天；錯區或重送不提交額外行為；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I14；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S15：GiveSpaceReverse

- 來源：RB4-BDD-015；；SYS：SYS-07；對應 I：SD-005-I15。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：留白分支允許 A 主動；I 尊重獨處後退讓；不可代對方提交。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S15 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@alternative-path @critical @frontend
- Given I選扶書籤留白
- When A各選主動聊書／音樂／保持安靜
- Then I退開且A有獨立主動權
- And 聊書與音樂進各自原節點
- And A保持安靜走respect/quiet、無假聊天
- V-RB4-T-082（E2E）：GiveSpaceReverse_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。；斷言：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-083（E2E）：GiveSpaceReverse_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。；斷言：I退開且A有獨立主動權；聊書與音樂進各自原節點；A保持安靜走respect/quiet、無假聊天；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I15；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S16：DeclineApproach

- 來源：RB4-BDD-016；；SYS：SYS-07；對應 I：SD-005-I16。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：拒絕保持原稿分支與可選探索，不生成假真人聊天。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S16 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@alternative-path @critical @frontend
- Given I選面紙或借書接近
- When A選open-up／books-only／decline
- Then 依草稿對應route與原文
- And 拒絕不出現假聊天及不強制撮合
- And 安靜軌道仍能合法達導演
- V-RB4-T-088（E2E）：DeclineApproach_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。；斷言：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-089（E2E）：DeclineApproach_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。；斷言：依草稿對應route與原文；拒絕不出現假聊天及不強制撮合；安靜軌道仍能合法達導演；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I16；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S17：QuestionCard

- 來源：RB4-BDD-017；；SYS：SYS-07；對應 I：SD-005-I17。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：warm-track 才 seed 抽 4 題之一並釘選；各自提交先私密，雙提交同時翻牌。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S17 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-005`；標籤：@happy-path @critical @frontend
- Given 雙方已進warm-track
- When 依場次種子從4題釘選1題並各自回答
- Then 同場重連不重抽
- And 第一份答案只本人可見
- And 雙方提交後同時揭曉同頻／反差、到warm節點
- And HTTP／WS／事件回放不得泄漏未揭曉答案
- V-RB4-T-094（E2E）：QuestionCard_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。；斷言：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-095（E2E）：QuestionCard_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。；斷言：同場重連不重抽；第一份答案只本人可見；雙方提交後同時揭曉同頻／反差、到warm節點；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I17；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S19：ChatSuggestions

- 來源：RB4-BDD-019；；SYS：SYS-07；對應 I：SD-005-I19。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：8 情境 24 原句按狀態篩選，僅聊天草稿；真人發送才寫 chat。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S19 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-005`；標籤：@happy-path @critical @frontend
- Given 劇情依8個適用情境進展
- When 逐情境打開聊天、點一則或自由聊天
- Then 各情境3句原文及合法篩選
- And 未點不發送、點擊由真人送出
- And 聊天仍可用且不冒充NPC或對方
- V-RB4-T-105（E2E）：ChatSuggestions_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。；斷言：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-106（E2E）：ChatSuggestions_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：劇情依8個適用情境進展；動作：逐情境打開聊天、點一則或自由聊天。；斷言：各情境3句原文及合法篩選；未點不發送、點擊由真人送出；聊天仍可用且不冒充NPC或對方；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I19；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S20：ClerkPersona

- 來源：RB4-BDD-020；；SYS：SYS-07；對應 I：SD-005-I20。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：阿澄 3 話題、4 組致謝依原稿條件；非阻塞 NPC cue 不代玩家回覆。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S20 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-006`；標籤：@happy-path @critical @frontend
- Given I熟客與A避雨生客各自入店
- When 各試3種招呼及4組危機後致謝
- Then 角色分眾原文與表情正確
- And 阿澄赴入口防洪切電，不站原地觀望
- And S/A×warm/quiet原文匹配且不代發真人訊息
- V-RB4-T-111（E2E）：ClerkPersona_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。；斷言：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-112（E2E）：ClerkPersona_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。；斷言：角色分眾原文與表情正確；阿澄赴入口防洪切電，不站原地觀望；S/A×warm/quiet原文匹配且不代發真人訊息；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I20；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S22：StormPresentation

- 來源：RB4-BDD-022；；SYS：SYS-07；對應 I：SD-005-I22。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：七步暴雨演出依 sequence/cue fence；閃電、斷電、黑膠停止、進水不能重播舊 cue。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S22 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-007`；標籤：@happy-path @critical @frontend
- Given 伺服器已提交導演事件
- When 兩端接cue或斷線重連
- Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞
- And 原合法鏡位與權威世界一致
- And 重連還原當前狀態不重播舊cue或假提交
- V-RB4-T-122（E2E）：StormPresentation_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。；斷言：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-123（E2E）：StormPresentation_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：伺服器已提交導演事件；動作：兩端接cue或斷線重連。；斷言：原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞；原合法鏡位與權威世界一致；重連還原當前狀態不重播舊cue或假提交；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I22；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S23：ReadyGate

- 來源：RB4-BDD-023；；SYS：SYS-07；對應 I：SD-005-I23。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙角色各一個 ready；首次雙 ready 才建立 pinned duration deadline，重複 ready 不重計。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S23 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 救書ready且一方尚未接手電筒
- When 單方先ready後雙方並行ready
- Then 單方等待不扣秒
- And 雙ready原子建立唯一deadline與題組
- And 雙端同一權威倒數並顯示原文等待提示
- V-RB4-T-129（E2E）：ReadyGate_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。；斷言：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-130（E2E）：ReadyGate_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。；斷言：單方等待不扣秒；雙ready原子建立唯一deadline與題組；雙端同一權威倒數並顯示原文等待提示；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I23；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S26：RescueSteps

- 來源：RB4-BDD-026；；SYS：SYS-07；對應 I：SD-005-I26。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：每本依序分享線索→取書→上滑→收納；holder/slot/step 原子狀態，禁止跳步與雙計。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S26 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 任一原題組第1或第2步
- When A分享線索、I跨合法區抽書上滑、A收書裝袋上架
- Then 權威狀態依角色與步驟轉移
- And 只有合法完整上架計1本
- And 原文成功回饋、無危險入口操作
- V-RB4-T-145（E2E）：RescueSteps_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。；斷言：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-146（E2E）：RescueSteps_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。；斷言：權威狀態依角色與步驟轉移；只有合法完整上架計1本；原文成功回饋、無危險入口操作；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I26；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S27：ReverseClues

- 來源：RB4-BDD-027；；SYS：SYS-07；對應 I：SD-005-I27。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：第3本 bottom，第4本 top；I 取得反轉規則後才可分享 A，答案不預先下發。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S27 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 已完成前兩本
- When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條
- Then 反轉線索只合法分享才揭露
- And 第3本下層、第4本完整鎖扣才增加計數
- And 兩組原文toast及合法結果完整
- And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數
- V-RB4-T-151（E2E）：ReverseClues_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。；斷言：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-152（E2E）：ReverseClues_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。；斷言：反轉線索只合法分享才揭露；第3本下層、第4本完整鎖扣才增加計數；兩組原文toast及合法結果完整；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I27；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S28：WrongRescue

- 來源：RB4-BDD-028；；SYS：SYS-07；對應 I：SD-005-I28。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：錯書/錯格不計；錯鎖扣 latchIndex 歸0，已放書/已救數保留、時間繼續。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S28 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@error-handling @critical @frontend
- Given 救書進行中
- When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動
- Then 錯書／槽／扣原文回饋
- And 不增加rescuedCount、不接受不合法持物或轉移
- And UI復位，合法後續仍可完成
- And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續
- V-RB4-T-157（E2E）：WrongRescue_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。；斷言：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-158（E2E）：WrongRescue_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。；斷言：錯書／槽／扣原文回饋；不增加rescuedCount、不接受不合法持物或轉移；UI復位，合法後續仍可完成；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I28；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S29：QuickCallouts

- 來源：RB4-BDD-029；；SYS：SYS-07；對應 I：SD-005-I29。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：12 句原稿快捷呼喊只作合法 actor cue，不偽造真人聊天；重送依 receipt。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S29 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 救書中雙方各有6句快捷
- When 逐句點選並嘗試偽造他方ID
- Then 只顯示本人合法原文
- And 明確點擊才發舞台泡泡
- And 不寫假真人聊天、不洩未分享答案
- V-RB4-T-163（E2E）：QuickCallouts_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。；斷言：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-164（E2E）：QuickCallouts_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。；斷言：只顯示本人合法原文；明確點擊才發舞台泡泡；不寫假真人聊天、不洩未分享答案；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I29；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S30：WaterStages

- 來源：RB4-BDD-030；；SYS：SYS-07；對應 I：SD-005-I30。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：75/50/30/15s 四階段在越過邊界後只投最新可見階段；遲到 alarm 不追播。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S30 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@boundary @critical @frontend
- Given 90秒倒數已running
- When 權威時間跨75/50/30/15秒及延遲重連
- Then 各水位階段及原文播報正確
- And 過期cue不重播、畫面ceil秒數一致
- And client改時鐘不影響D1 deadline
- And 各門檻來自釘選內容，發布時驗證數字文案一致
- V-RB4-T-169（E2E）：WaterStages_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。；斷言：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-170（E2E）：WaterStages_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。；斷言：各水位階段及原文播報正確；過期cue不重播、畫面ceil秒數一致；client改時鐘不影響D1 deadline；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I30；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S31：PauseIdle

- 來源：RB4-BDD-031；；SYS：SYS-07；對應 I：SD-005-I31。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙方最近合法活動/有效連線取最早 15s 邊界，若早於 deadline 則 pause，剩餘以應暫緩時刻計。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S31 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@boundary @critical @frontend
- Given running時一方合法操作停止
- When 測14999/15000ms閒置且仍有ping
- Then 未達15秒不暫緩、達門檻暫緩
- And ping不更新有效活動
- And 保存剩餘時間且原稿暫緩提示正確
- And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先
- V-RB4-T-175（E2E）：PauseIdle_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。；斷言：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-176（E2E）：PauseIdle_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。；斷言：未達15秒不暫緩、達門檻暫緩；ping不更新有效活動；保存剩餘時間且原稿暫緩提示正確；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I31；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S32：PauseReconnect

- 來源：RB4-BDD-032；；SYS：SYS-07；對應 I：SD-005-I32。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：閒置者實際操作、斷線者回可操作畫面才恢復；首操作只同步；另一活動方不必操作；保留 holder/latch。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S32 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@alternative-path @critical @frontend
- Given 一方斷線15秒已暫緩
- When 雙方恢復可操作、重複斷線多次
- Then 自動恢復且不要求確認按鈕
- And 保存剩餘時間、無次數上限、不補扣暫緩秒
- And 重連／冷啟動不重設90秒
- And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與
- And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原
- V-RB4-T-182（E2E）：PauseReconnect_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。；斷言：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-183（E2E）：PauseReconnect_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。；斷言：自動恢復且不要求確認按鈕；保存剩餘時間、無次數上限、不補扣暫緩秒；重連／冷啟動不重設90秒；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-324（E2E）：Resume_RepeatedIdle_WebAndAndroidNoDeadlock；`tests/e2e/android/scene-event-v4.mjs`；來源：RA-01／BDD032；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G03。；前置／動作：兩真人各平台實際進場；反覆閒置、斷線、前景重入。；斷言：兩真人前景實際重入、多次閒置／斷線自動恢復、原操作不重複；兩平台獨立證據；首次恢復操作不計成果且兩平台分別留證，沒有重置時長或卡死。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I32；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S34：GradeS

- 來源：RB4-BDD-034；；SYS：SYS-07；對應 I：SD-005-I34。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：4 本 deadline 前即 S；以剩餘毫秒 >=30000 決定 S_fast，原稿結局資料由 server。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S34 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-009`；標籤：@happy-path @critical @frontend
- Given 4本在期限內完成
- When 伺服器提交最後合法封箱
- Then 立即S不等歸零
- And 播放原文及布丁演出
- And 走書籤／最終意願而非屋簷
- V-RB4-T-193（E2E）：GradeS_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：4本在期限內完成；動作：伺服器提交最後合法封箱。；斷言：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-194（E2E）：GradeS_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：4本在期限內完成；動作：伺服器提交最後合法封箱。；斷言：立即S不等歸零；播放原文及布丁演出；走書籤／最終意願而非屋簷；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I34；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S35：GradeA

- 來源：RB4-BDD-035；；SYS：SYS-07；對應 I：SD-005-I35。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：deadline 到且 2–3 本即 A，保留已救數；結算後拒救書動作。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S35 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-009`；標籤：@boundary @critical @frontend
- Given 到期已救2或3本
- When DO喚醒或合法讀取補償
- Then A結算且停止救書
- And 原文退至高處、拿鐵及毛巾
- And 走書籤／最終意願
- V-RB4-T-199（E2E）：GradeA_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。；斷言：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-200（E2E）：GradeA_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。；斷言：A結算且停止救書；原文退至高處、拿鐵及毛巾；走書籤／最終意願；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I35；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S36：GradeB

- 來源：RB4-BDD-036；；SYS：SYS-07；對應 I：SD-005-I36。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：deadline 到且 0–1 本即 B，直接屋簷，不能再入危險區或進書籤願望。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S36 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-009`；標籤：@boundary @critical @frontend
- Given 到期已救0或1本
- When 系統結算
- Then B直接ev4-04-eaves-shelter
- And 停止救書且不可再進危險區或提交
- And 屋簷原文與專用鏡位，不走書籤或wish
- V-RB4-T-205（E2E）：GradeB_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：到期已救0或1本；動作：系統結算。；斷言：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-206（E2E）：GradeB_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：到期已救0或1本；動作：系統結算。；斷言：B直接ev4-04-eaves-shelter；停止救書且不可再進危險區或提交；屋簷原文與專用鏡位，不走書籤或wish；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I36；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S38：Bookmark

- 來源：RB4-BDD-038；；SYS：SYS-07；對應 I：SD-005-I38。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：S/A 逐書三句或選填短語；0–20 Unicode scalar 純文字、合法公開前僅本人讀。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S38 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
- Given S/A已結算
- When 逐書三句書籤選一，選填0/20字並各自提交
- Then 沿用草稿原句與本人短語
- And 未合法公開前對方看不到
- And 留書結局可原位翻對方已授權書籤
- And 未授權 note 不得由素材、歷史事件或通知取得
- V-RB4-T-217（E2E）：Bookmark_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。；斷言：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-218（E2E）：Bookmark_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。；斷言：沿用草稿原句與本人短語；未合法公開前對方看不到；留書結局可原位翻對方已授權書籤；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I38；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S40：WishMatrix

- 來源：RB4-BDD-040；；SYS：SYS-07；對應 I：SD-005-I40。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙方 wish 私密，任一 quiet→03；both keep→01；其餘無 quiet 且有 share→02；B→04。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S40 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
- Given S/A兩方書籤已完成
- When 覆核3×3共9種最終意願組合
- Then 兩人keep-talking才ev4-01
- And 無quiet且至少一share-books才ev4-02
- And 任一quiet即ev4-03；第一份未揭露
- V-RB4-T-228（E2E）：WishMatrix_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。；斷言：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-229（E2E）：WishMatrix_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。；斷言：兩人keep-talking才ev4-01；無quiet且至少一share-books才ev4-02；任一quiet即ev4-03；第一份未揭露；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I40；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S41：EndingArt

- 來源：RB4-BDD-041；；SYS：SYS-07；對應 I：SD-005-I41。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：四結局原稿鏡位、道具、cue；S/A合法書籤，B屋簷；重連不倒退。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S41 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
- Given 四種結局各已合法提交
- When 看場景光色、距離、原文、互動並重連
- Then 四結局各自正式鏡位與素材
- And S/A對應致謝與書籤，B專屬屋簷
- And 重連不退回結局前，不出現規格文字
- V-RB4-T-234（E2E）：EndingArt_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。；斷言：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-235（E2E）：EndingArt_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：四種結局各已合法提交；動作：看場景光色、距離、原文、互動並重連。；斷言：四結局各自正式鏡位與素材；S/A對應致謝與書籤，B專屬屋簷；重連不退回結局前，不出現規格文字；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I41；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S42：ReceiptTitle

- 來源：RB4-BDD-042；；SYS：SYS-07；對應 I：SD-005-I42。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：四稱號由 S_fast 邊界、S_normal/A/B 及原文決定；小票由 server facts 生成。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S42 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@boundary @critical @frontend
- Given S/A/B權威完成
- When 以S剩29999／30000／30001ms及A/B測小票
- Then S_fast >=30000、其餘S_normal
- And A/B稱號原文符合草稿
- And 書、黑膠、救援統計及阿澄附註只來自已提交事實
- And 稱號門檻隨釘選版本設定；小票不含自由輸入
- V-RB4-T-240（E2E）：ReceiptTitle_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。；斷言：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-241（E2E）：ReceiptTitle_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。；斷言：S_fast >=30000、其餘S_normal；A/B稱號原文符合草稿；書、黑膠、救援統計及阿澄附註只來自已提交事實；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I42；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S44：ReceiptBadges

- 來源：RB4-BDD-044；；SYS：SYS-07；對應 I：SD-005-I44。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：四印章按原稿 fact：same book/vinyl/witness/quiet+S/A；不含私密或自由輸入。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S44 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@happy-path @critical @frontend
- Given 四印章各有獨立成立或不成立事實
- When 測同書／換曲／對方見符號／quiet+S/A
- Then 各印章只對應原稿條件
- And 不成立不顯示、重送不重複
- And 小票無真實姓名、Email、照片、私密Profile或未授權內容
- And 印章依當前符號實際呈現見證而非背景讀取或自我見證
- V-RB4-T-251（E2E）：ReceiptBadges_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。；斷言：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-252（E2E）：ReceiptBadges_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。；斷言：各印章只對應原稿條件；不成立不顯示、重送不重複；小票無真實姓名、Email、照片、私密Profile或未授權內容；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I44；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S45：NaturalCompletion

- 來源：RB4-BDD-045；；SYS：SYS-07；對應 I：SD-005-I45。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：結局自然完成 Session、Round 保持 active；雙同意下一場、撤回與聊天依既有 guard。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S45 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@happy-path @critical @frontend
- Given 本場已結局、Round仍active
- When 自然完成後聊天、單方同意／撤回再雙方同意下一場
- Then 不額外要求完成按鈕或支線
- And 聊天仍可用；雙方同意才建新場
- And 新場釘選合法版本、舊投影與cue清除
- V-RB4-T-258（E2E）：NaturalCompletion_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。；斷言：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-259（E2E）：NaturalCompletion_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。；斷言：不額外要求完成按鈕或支線；聊天仍可用；雙方同意才建新場；新場釘選合法版本、舊投影與cue清除；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I45；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S46：SafeExit

- 來源：RB4-BDD-046；；SYS：SYS-07；對應 I：SD-005-I46。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：任何 phase 可確認退出；round/claim CAS 阻止後續 event/cue/private asset；永久排除保持。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S46 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@error-handling @critical @frontend
- Given ready/running/paused/settled/completed任一階段
- When 一方確認退出並與救書或alarm競態
- Then 退出不受倒數或素材故障阻塞
- And 解除占用、終止權限且pair排除
- And 無後續訊息／操作／私有圖或舊cue
- And 退出與救書競態的敗方不再寫入
- V-RB4-T-265（E2E）：SafeExit_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。；斷言：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-266（E2E）：SafeExit_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：ready/running/paused/settled/completed任一階段；動作：一方確認退出並與救書或alarm競態。；斷言：退出不受倒數或素材故障阻塞；解除占用、終止權限且pair排除；無後續訊息／操作／私有圖或舊cue；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I46；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S48：AssetReadiness

- 來源：RB4-BDD-048；；SYS：SYS-07；對應 I：SD-005-I48。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：缺正式 asset/遮罩/SHA/ready avatar fail closed；保留可用聊天退出；不得假圖或重產。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S48 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-012`；標籤：@error-handling @critical @frontend
- Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready
- When 載入、恢復與點擊
- Then fail closed，不以placeholder冒充
- And 保留可用聊天/退出及重讀、現有錯誤碼
- And 恢復原版且不重抽、不呼叫Gemini
- And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材
- V-RB4-T-277（E2E）：AssetReadiness_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。；斷言：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-278（E2E）：AssetReadiness_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready；動作：載入、恢復與點擊。；斷言：fail closed，不以placeholder冒充；保留可用聊天/退出及重讀、現有錯誤碼；恢復原版且不重抽、不呼叫Gemini；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I48；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S49：AvatarReuse

- 來源：RB4-BDD-049；；SYS：SYS-07；對應 I：SD-005-I49。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：沿用免費16款及 ready AI 四姿態五表情；切換、重連零重產；失權清除圖片。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S49 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-012`；標籤：@happy-path @critical @frontend
- Given 16免費角色及既有ready AI套組
- When 切換4姿態5表情、重連與失權
- Then 保持已核准身份／外觀、資產共用
- And 切換或重連不重產
- And 失權清圖；真provider證據與回放分開
- And 必要真 provider 質量及成本證據不可由回放代簽
- V-RB4-T-283（E2E）：AvatarReuse_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。；斷言：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-284（E2E）：AvatarReuse_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：16免費角色及既有ready AI套組；動作：切換4姿態5表情、重連與失權。；斷言：保持已核准身份／外觀、資產共用；切換或重連不重產；失權清圖；真provider證據與回放分開；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I49；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S50：PlatformPerformance

- 來源：RB4-BDD-050；；SYS：SYS-07；對應 I：SD-005-I50。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：量測 Web 與 Android 真實延遲、渲染、記憶體及回歸；依原 TDD 門檻，不自行降低。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-004-S50 產品 F/符號與 Green，及矩陣同 BDD 的 SD-002／003 必要產品成果；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-012`；標籤：@performance @critical @frontend
- Given 正式V4完整資產、Web與Android現有驗收裝置
- When 連續探索、翻書、倒數、背景與重連
- Then 記錄載入／操作延遲／記憶體／動畫對V3基線
- And 離開與失權清資源且有界快取
- And 無實測不得標Gate A通過
- And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證
- V-RB4-T-289（E2E）：PlatformPerformance_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。；斷言：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-290（E2E）：PlatformPerformance_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：正式V4完整資產、Web與Android現有驗收裝置；動作：連續探索、翻書、倒數、背景與重連。；斷言：記錄載入／操作延遲／記憶體／動畫對V3基線；離開與失權清資源且有界快取；無實測不得標Gate A通過；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I50；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S51：GateA

- 來源：RB4-BDD-051；；SYS：SYS-07；對應 I：SD-005-I51。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：Gate A 逐來源證據、真 D1/R2/DO、正式素材及權利、必要真供應商、雙平台全部成立。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-001 正式資產與發布、SD-002 Domain、SD-003 真交易/投影、SD-004 全部適用畫面；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-012`；標籤：@happy-path @critical
- Given V4正式候選與真環境測試
- When 核對全部AC、兩題組、四結局及必要平台
- Then 真D1/R2/DO與HTTP/WS有精確證據
- And Web/Android及素材/內容/權限/效能逐項核對
- And 未驗或失敗不得以局部測試通過代簽
- And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽
- V-RB4-T-291（Unit）：GateA_Case1_VerifiesPrimaryRule；`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs`；前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。；斷言：真D1/R2/DO與HTTP/WS有精確證據。
- V-RB4-T-292（Unit）：GateA_Case2_VerifiesBoundaryOrProjection；`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs`；前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。；斷言：Web/Android及素材/內容/權限/效能逐項核對。
- V-RB4-T-293（Unit）：GateA_Case3_VerifiesSideEffectFence；`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs`；前置：V4正式候選與真環境測試；動作：核對全部AC、兩題組、四結局及必要平台。；斷言：未驗或失敗不得以局部測試通過代簽。
- V-RB4-T-337（E2E）：GateA_RealAssetsAndRightsAndNativeRunner_RequiresEvidence；`tests/e2e/web/scene-event-v4.spec.ts；tests/e2e/android/scene-event-v4.mjs`；來源：RA-11/12／BDD048–051/056；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G16。；前置／動作：正式候選全素材，核對runner、APK／ADB與真provider必要證據，逐16經典與音樂／封面權利。；斷言：真Web/Android正式素材、可重跑路徑、必要供應商品質/成本、逐書與音樂權利核對均有證據；缺項不代簽；Web與Android獨立證據、逐資產與權利核對、效能與品質俱全才可Gate A；缺項不代簽。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I51；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-005-S55：CleanReplay

- 來源：RB4-BDD-055；；SYS：SYS-07；對應 I：SD-005-I55。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：清理後以全新雙人配對在 V4-only 索引跑完整 Web/Android；舊 SHA 不可再選。 用真實正式內容、雙人不同 session、真 D1/R2/DO 及兩平台獨立證據驗證；不能以 mock、fixture、歷史 V3 結果代簽。
- 被驗證的產品成果：SD-006-S54 清理完成、SD-004-S55、SD-003-S55；本包為純整合驗證，不重複改產品；失敗回原 owner。
- 驗證檔案：`tests/e2e/web/scene-event-v4.spec.ts`、`tests/e2e/android/scene-event-v4.mjs`。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-014`；標籤：@happy-path @critical @frontend
- Given 清理完成且正式索引只剩V4
- When 新配對、進場、結局、聊天、重玩與退出
- Then 舊版不可選、無舊SHA或歷史恢復
- And V4完整可玩、配對/聊天/退出維持
- And 所有Gate證據齊全才可結案與進下一SPEC
- V-RB4-T-308（E2E）：CleanReplay_Web_MatchesPlayerExperience；`tests/e2e/web/scene-event-v4.spec.ts`；前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。；斷言：舊版不可選、無舊SHA或歷史恢復；V4完整可玩、配對/聊天/退出維持；所有Gate證據齊全才可結案與進下一SPEC；兩真人正式畫面及權威狀態相符，無fixture代簽。。
- V-RB4-T-309（E2E）：CleanReplay_Android_MatchesPlayerExperience；`tests/e2e/android/scene-event-v4.mjs`；前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。；斷言：舊版不可選、無舊SHA或歷史恢復；V4完整可玩、配對/聊天/退出維持；所有Gate證據齊全才可結案與進下一SPEC；兩真人正式畫面及權威狀態相符，無fixture代簽。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-005-I55；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

## 測試計劃與實際驗證方式
Gate A 和 CleanReplay 的 Unit/Integration 案例由本包統籌但執行必須落在來源指定層級；不能將 Unit 填入 E2E runner，具體寫檔責任回 SD-002／003／004。API 案例按來源同驗 HTTP 與 WS；涉及兩層者必須有各自證據。CleanReplay 的實際 E2E 只在 SD-006 Gate B 清理完成之後跑，不阻塞 Gate A；先執行 001～051 對應 Gate A 範圍。
本包 V-ID 直接等於原 TDD ID（前綴 V-），完整前置/動作/斷言逐步列出。命令工作目錄 datinghigh；npm --prefix frontend/client run export:web；npm run build:e2e-host；npx playwright test --config tests/playwright.config.ts scene-event-v4.spec.ts；Android runner 新檔建立後依真 QA ADB 裝置執行 node tests/e2e/android/scene-event-v4.mjs。所有具名測試及實際輸出未執行；命令選擇器、原生 runner、實際 fixture 路徑須再驗證，不能把設計候選當 runnable implementation。
## 依賴關係與執行順序
[總覽](../00-overview.md)；先真環境可行性、內容契約與 Domain，再權威交易、renderer、兩端整合、Gate A、人工 Gate B、local 清理與重驗、深度稽核。
## 風險、設計變更與人工確認紀錄
已確認 RA-Q1～04 及 RQ-01～04；若真 D1 毫秒 guard、容量、權利、素材或 runner 不成立先停止提出最小方案。候選尚未人工核准。
## 實現檢查清單／Todo
### D：設計葉節點
- [ ] SD-005-D01：逐檔符號、責任、S/V、可執行命令與原斷言完整深度稽核。
### I：實作驗證葉節點
- [ ] SD-005-I01：EnterStore；對應 SD-005-S01；RB4-T-004、RB4-T-005
- [ ] SD-005-I02：NavigateAreas；對應 SD-005-S02；RB4-T-009、RB4-T-010
- [ ] SD-005-I03：DiscoverObjects；對應 SD-005-S03；RB4-T-014、RB4-T-015
- [ ] SD-005-I04：GestureFence；對應 SD-005-S04；RB4-T-019、RB4-T-020
- [ ] SD-005-I05：BookCatalog；對應 SD-005-S05；RB4-T-024、RB4-T-025
- [ ] SD-005-I06：BlindBook；對應 SD-005-S06；RB4-T-030、RB4-T-031
- [ ] SD-005-I07：InterestBadge；對應 SD-005-S07；RB4-T-037、RB4-T-038
- [ ] SD-005-I08：Resonance；對應 SD-005-S08；RB4-T-042、RB4-T-043
- [ ] SD-005-I09：VinylSync；對應 SD-005-S09；RB4-T-048、RB4-T-049
- [ ] SD-005-I10：AmbientExplore；對應 SD-005-S10；RB4-T-053、RB4-T-054
- [ ] SD-005-I11：FogWindow；對應 SD-005-S11；RB4-T-058、RB4-T-059
- [ ] SD-005-I12：FogWitness；對應 SD-005-S12；RB4-T-064、RB4-T-065
- [ ] SD-005-I13：SameDifferentBook；對應 SD-005-S13；RB4-T-070、RB4-T-071
- [ ] SD-005-I14：TissueDistance；對應 SD-005-S14；RB4-T-076、RB4-T-077
- [ ] SD-005-I15：GiveSpaceReverse；對應 SD-005-S15；RB4-T-082、RB4-T-083
- [ ] SD-005-I16：DeclineApproach；對應 SD-005-S16；RB4-T-088、RB4-T-089
- [ ] SD-005-I17：QuestionCard；對應 SD-005-S17；RB4-T-094、RB4-T-095
- [ ] SD-005-I19：ChatSuggestions；對應 SD-005-S19；RB4-T-105、RB4-T-106
- [ ] SD-005-I20：ClerkPersona；對應 SD-005-S20；RB4-T-111、RB4-T-112
- [ ] SD-005-I22：StormPresentation；對應 SD-005-S22；RB4-T-122、RB4-T-123
- [ ] SD-005-I23：ReadyGate；對應 SD-005-S23；RB4-T-129、RB4-T-130
- [ ] SD-005-I26：RescueSteps；對應 SD-005-S26；RB4-T-145、RB4-T-146
- [ ] SD-005-I27：ReverseClues；對應 SD-005-S27；RB4-T-151、RB4-T-152
- [ ] SD-005-I28：WrongRescue；對應 SD-005-S28；RB4-T-157、RB4-T-158
- [ ] SD-005-I29：QuickCallouts；對應 SD-005-S29；RB4-T-163、RB4-T-164
- [ ] SD-005-I30：WaterStages；對應 SD-005-S30；RB4-T-169、RB4-T-170
- [ ] SD-005-I31：PauseIdle；對應 SD-005-S31；RB4-T-175、RB4-T-176
- [ ] SD-005-I32：PauseReconnect；對應 SD-005-S32；RB4-T-182、RB4-T-183、RB4-T-324
- [ ] SD-005-I34：GradeS；對應 SD-005-S34；RB4-T-193、RB4-T-194
- [ ] SD-005-I35：GradeA；對應 SD-005-S35；RB4-T-199、RB4-T-200
- [ ] SD-005-I36：GradeB；對應 SD-005-S36；RB4-T-205、RB4-T-206
- [ ] SD-005-I38：Bookmark；對應 SD-005-S38；RB4-T-217、RB4-T-218
- [ ] SD-005-I40：WishMatrix；對應 SD-005-S40；RB4-T-228、RB4-T-229
- [ ] SD-005-I41：EndingArt；對應 SD-005-S41；RB4-T-234、RB4-T-235
- [ ] SD-005-I42：ReceiptTitle；對應 SD-005-S42；RB4-T-240、RB4-T-241
- [ ] SD-005-I44：ReceiptBadges；對應 SD-005-S44；RB4-T-251、RB4-T-252
- [ ] SD-005-I45：NaturalCompletion；對應 SD-005-S45；RB4-T-258、RB4-T-259
- [ ] SD-005-I46：SafeExit；對應 SD-005-S46；RB4-T-265、RB4-T-266
- [ ] SD-005-I48：AssetReadiness；對應 SD-005-S48；RB4-T-277、RB4-T-278
- [ ] SD-005-I49：AvatarReuse；對應 SD-005-S49；RB4-T-283、RB4-T-284
- [ ] SD-005-I50：PlatformPerformance；對應 SD-005-S50；RB4-T-289、RB4-T-290
- [ ] SD-005-I51：GateA；對應 SD-005-S51；RB4-T-291、RB4-T-292、RB4-T-293、RB4-T-337
- [ ] SD-005-I55：CleanReplay；對應 SD-005-S55；RB4-T-308、RB4-T-309
## 檢查點與續作交接
本包 Draft；未改產品與原需求；先補逐檔設計/命令稽核，再申請使用者確認。
## 相關文檔
[總覽](../00-overview.md)／[系統設計](../01-system-design.md)／[追溯矩陣](../02-traceability.md)／[原 TDD](../../../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)
## 生成者、最後更新與狀態
ChatGPT GPT-6.2；2026-11-25；Draft。
