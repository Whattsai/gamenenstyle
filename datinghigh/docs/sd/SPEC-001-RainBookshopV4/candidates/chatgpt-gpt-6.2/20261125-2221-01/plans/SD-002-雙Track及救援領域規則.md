# SD-002-雙Track及救援領域規則 — 分項實作設計

狀態：Draft／未實作；契約 v2；設計 v2；2026-11-25。

## 開發進度總覽
### 整體進度
設計 D：0/1 已正式稽核；實作 I：0/35；本包主要 TDD：0/104（104 個規劃案例，非測試通過數）。
### 分層／分組進度追蹤
- Unit：0/104
- Integration：0/0
- API：0/0
- E2E：0/0
### 當前 Sprint 狀態
未開始；待候選完整稽核及人工核准。
### 里程碑
本包步驟全部驗收後依賴交接；Gate A/B 獨立。
### 關鍵指標
原稿相等、source ID 完整與所有適用層級實測；不以數量代替品質。
### 每日進度記錄
依 DatingHigh 規範不適用；實際證據只在既有 Verification。

## 功能概述
在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
## 功能需求與來源追溯
[全量矩陣](../02-traceability.md)；RB4-BDD-001、RB4-BDD-002、RB4-BDD-006、RB4-BDD-008、RB4-BDD-009、RB4-BDD-010、RB4-BDD-011、RB4-BDD-013、RB4-BDD-014、RB4-BDD-015、RB4-BDD-016、RB4-BDD-017、RB4-BDD-018、RB4-BDD-020、RB4-BDD-021、RB4-BDD-023、RB4-BDD-024、RB4-BDD-025、RB4-BDD-026、RB4-BDD-027、RB4-BDD-028、RB4-BDD-029、RB4-BDD-030、RB4-BDD-031、RB4-BDD-032、RB4-BDD-033、RB4-BDD-034、RB4-BDD-035、RB4-BDD-036、RB4-BDD-038、RB4-BDD-039、RB4-BDD-040、RB4-BDD-042、RB4-BDD-044、RB4-BDD-045。
### BDD 行為與產品實作分解

| BDD | 產品步驟 | 實際產品檔案／符號／核心 Green | 條件、結果與驗收 |
|---|---|---|---|
| RB4-BDD-001 | SD-002-S01 | F-01 `Compile`／`Apply`／`Available`：本人 entry node、角色與 actor allowed binding 三者匹配才移本人 Track；回傳 transition 与 doorbell cue，對方 node/revision 不變。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-002 | SD-002-S02 | F-01 `Available`／`Apply`：以本人 Area、pinned adjacency、phase/safe-zone 判合法移動，返回新 Area/shot 與本人可探索 hint；非法無狀態變更。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-006 | SD-002-S06 | F-01 `Evaluate`／`Apply`：以 role+book ID 驗封條操作，合法一次揭封只更新 actor module fact；取消不進 policy，重送由 receipt 層去重；不輸出他人私密 fact。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-008 | SD-002-S08 | F-01 `Available`／`Apply`：已選 bookId 且 optionId 屬三原稿選項才寫本人 resonance fact，輸出本人的原文 cue，preview 不走 Apply。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-009 | SD-002-S09 | F-01 `Apply`：只允許三個原稿 record ID，切換共享 currentTrack，實際變更才產出 stamp fact；不保存本地音量。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-010 | SD-002-S10 | F-01 `Evaluate`／`Available`／`Apply`：ambient binding 依 area/phase/角色可用，僅寫本人 explored 或合法 shared fact，不改另一方 progress，不成導演 prerequisite。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-011 | SD-002-S11 | F-01 `Apply`／`Available`：擦霧純 client，不更新 domain；合法四符號選擇取目前 symbol version +1，替換舊可見符號，已取得 witness fact 不撤銷。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-013 | SD-002-S13 | F-01 `Evaluate`／`Apply`：兩人已各提交選書才比較 canonical book ID，選 iv4-04-same/diff；單方未完成保持等待且不生成另一人選擇。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-014 | SD-002-S14 | F-01 `Available`／`Apply`：以當前合法近/遠 slot ID 驗 I 的 tissue action，記距離及 cue；A 的 accept/decline 為獨立 action，不等同 chat intent。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-015 | SD-002-S15 | F-01 `Evaluate`／`Apply`：I 留白轉 respect，保留 A 的聊書/音樂/安靜獨立 binding，A 選擇後才轉自己的節點；不代提交。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-016 | SD-002-S16 | F-01 `Apply`／`Available`：依 pinned open-up/books-only/decline route 更新 A 與必要 shared 分支，拒絕不產 chat effect，quiet 仍可到導演。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-017 | SD-002-S17 | F-01 `Activate`／`Apply`／`Available`：warm 前置才由場次 deterministic seed 釘選四題之一；保存兩份 private option，第二次合法提交後才產 reveal 與雙 warm transition。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-018 | SD-002-S18 | F-01 `Evaluate`／`Apply`：quiet 不需 question；驗 role、pinned question、option、revision，非法/重送不增加提交；同ID receipt 在 SD-003，禁止先揭。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-020 | SD-002-S20 | F-01 `Evaluate`／`Available`：以 actor role、node、grade、warm/quiet 選原稿招呼/話題/四組 aftermath；NPC cue 不產真人 message。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-021 | SD-002-S21 | F-01 `Evaluate`／`Apply`／`Activate`：兩邊節奏條件 I warm/respect、A warm/quiet 且 warm 已 reveal，才輸出一次 director+ready effect；非主線彩蛋不參與 gate。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-023 | SD-002-S23 | F-01 `Apply`／`Activate`：ready role mask 只從0→1；首次 mask=雙人時以 authority time 建 deadline、pinned setId；重複 ready no-op，等待不扣時。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-024 | SD-002-S24 | F-01 `Compile`／`Initial`／`Activate`：使用 pinned durationSeconds、threshold 與原文設定而非常數，90/120 分版；validate 不允許缺設定；既有 running/paused 不重新讀新版本。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-025 | SD-002-S25 | F-01 `Activate`／`Initial`：以場次固定 seed 從原兩個 setId 選一，保存 ID；每步按 pinned positionId 與 areaId，不要求四 Area；初始投影只授權角色。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-026 | SD-002-S26 | F-01 `Available`／`Apply`：step1/2 依 share→pick→pass→store 有限狀態；驗 actor/area/book/holder/slot/phase/revision，每次只一 transition，合法 store 才 count+1；無危險 Area 行為。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-027 | SD-002-S27 | F-01 `Apply`／`Available`：step3/4 I pickup/share reverse clue，A 底層/上層；第四本依 left/right/seal 的 latchIndex 0..3，seal 成立才 count+1；未分享 clue 不輸出。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-028 | SD-002-S28 | F-01 `Apply`：錯書、slot、role、area 不改 holder/count；錯鎖扣以合法錯序 action 重置 latchIndex=0 並原文 feedback，已放書及 rescuedCount 保留，不修改 deadline；可重試。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-029 | SD-002-S29 | F-01 `Available`／`Apply`：按 role 白名單各6 callout ID，輸出 cue effect，不寫 message；禁止任意 text/他方 ID。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-030 | SD-002-S30 | F-01 `Apply`（新增受控 system transition）：依 pinned thresholds、authority now 算最新 waterStage，遲到跨多階只輸出最新 cue，不重播；paused 固定 remaining。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-031 | SD-002-S31 | F-01 `Apply`（系統 transition）：I=min eligible role activity/disconnect+15000；I<D 且 now≥I 則 pausedRemainingMs=D-I；D≤I 且 now≥D 先結算；ping 不算 activity。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-032 | SD-002-S32 | F-01 `Apply`：按 pauseRequiredRole mask 判 idle 真操作/斷線回可操作畫面，首恢復只更新 mask/activity；必要人全恢復時 deadline=authority now+remaining；不變 holder/slot/latch/count，無次數限制。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-033 | SD-002-S33 | F-01 `Apply`：若 now≥deadline 先依 count A/B settle 拒計；now<deadline 且合法最後 seal 才 S；輸出互斥 effect 交 SD-003 原子 CAS，以真 D1 驗線性化時間。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-034 | SD-002-S34 | F-01 `Apply`：合法最後 seal 在 deadline 前 count=4 即 settle S，保存 remainingMs/grade/title fact，走書籤意願 gate，不等 timeout。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-035 | SD-002-S35 | F-01 `Apply`（system timeout）：到期 count∈{2,3} 只 settle A 一次，禁後續 rescue，輸出高處/拿鐵/毛巾 cue 與 bookmark phase。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-036 | SD-002-S36 | F-01 `Apply`（system timeout）：到期 count∈{0,1} settle B，直接 ev4-04 與安全區；禁 rescue、bookmark、wish 及危險區移動。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-038 | SD-002-S38 | F-01 `Available`／`Apply`：S/A 且本人合法選書才允許三句選項及 0–20 scalar optional note；保存 private actor fact，只有合法 ending disclosure 才釋出。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-039 | SD-002-S39 | F-01 `Apply`：只 bookmark note 可為自由文字，逐 scalar 計數、拒孤立 surrogate/控制字元/HTML/非法書或他人身份；其他 params 仍固定 ID；錯誤不產 effect。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-040 | SD-002-S40 | F-01 `Apply`／`Evaluate`：兩人 bookmark 完成後各自保存 wish；兩份完成才選 ending：任一 quiet→03，兩 keep→01，其他 share→02；B bypass→04。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-042 | SD-002-S42 | F-01 `Apply`：結算時依 authority remaining >= pinned 30000 選 S_fast，其餘 S_normal，A/B 依 grade；輸出安全 fact ID，不含 note/free text。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-044 | SD-002-S44 | F-01 `Apply`／`Evaluate`：same book、實際切曲、合法 partner witness、quiet+S/A 四獨立 fact；按原稿成立才輸出 badge ID，集合去重，無個資。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-045 | SD-002-S45 | F-01 `Apply`／F-02 `PlaythroughLifecyclePolicy`（沿用已確認的 next consent guard）：ending 合法完成產 Session completed，Round active；單方 consent/撤回不建場，雙方成立才走既有選場。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |

## 用戶故事
以原 BDD 雙人真實配對、角色獨立／合作及退出權為準，本包不增加劇情。
## 畫面操作／系統處理流程
- SD-002-S01：由 actor role 決定唯一入店合法 action，門把/傘桶各自節點獨立；scene cue 不構成另一人進度。
- SD-002-S02：以 pinned graph 的 area adjacency 與 safe-zone guard 判定移動，暖金提示只取本人合法未探索項。
- SD-002-S06：盲書未撕前僅三個包裝標籤；撕封 actor-scoped CAS 後才釋出內容，取消不揭。
- SD-002-S08：書 ID 與三個共鳴 option 由原稿驗證；本人選定後顯示原文，preview/他人不得讀。
- SD-002-S09：黑膠切換是共用 state；只同步選曲不強迫播放；實際換曲一次才記 stamp fact。
- SD-002-S10：非主線場景探索維持兩人 track 與 revision 獨立；repeatable cue 不強制觸發主線。
- SD-002-S11：擦拭三階段及四符號按原稿；共享結果與本人動畫分離；重送不得加 stamp。
- SD-002-S13：雙方合法選書後按 same/different 條件選原稿破冰，不由 client 宣稱相同。
- SD-002-S14：面紙拖放由合法 area 與近遠 slot/gesture 決定；取消不送或變更 Track。
- SD-002-S15：留白分支允許 A 主動；I 尊重獨處後退讓；不可代對方提交。
- SD-002-S16：拒絕保持原稿分支與可選探索，不生成假真人聊天。
- SD-002-S17：warm-track 才 seed 抽 4 題之一並釘選；各自提交先私密，雙提交同時翻牌。
- SD-002-S18：題目版本、option、actor 與 phase 嚴格檢查；單方答覆不洩漏，重送不重抽。
- SD-002-S20：阿澄 3 話題、4 組致謝依原稿條件；非阻塞 NPC cue 不代玩家回覆。
- SD-002-S21：兩方 pacing point 都到達才原子觸發 director 一次；warm 題卡完成先決。
- SD-002-S23：雙角色各一個 ready；首次雙 ready 才建立 pinned duration deadline，重複 ready 不重計。
- SD-002-S24：duration 來自 pinned 內容，測 90/120；整數、正值、溢位、threshold 嚴格遞減且小於總長。
- SD-002-S25：seed 釘選 set-a 或 set-b；A shelves 兩本不同位置合法，4 本 ID、原文順序完整。
- SD-002-S26：每本依序分享線索→取書→上滑→收納；holder/slot/step 原子狀態，禁止跳步與雙計。
- SD-002-S27：第3本 bottom，第4本 top；I 取得反轉規則後才可分享 A，答案不預先下發。
- SD-002-S28：錯書/錯格不計；錯鎖扣 latchIndex 歸0，已放書/已救數保留、時間繼續。
- SD-002-S29：12 句原稿快捷呼喊只作合法 actor cue，不偽造真人聊天；重送依 receipt。
- SD-002-S30：75/50/30/15s 四階段在越過邊界後只投最新可見階段；遲到 alarm 不追播。
- SD-002-S31：雙方最近合法活動/有效連線取最早 15s 邊界，若早於 deadline 則 pause，剩餘以應暫緩時刻計。
- SD-002-S32：閒置者實際操作、斷線者回可操作畫面才恢復；首操作只同步；另一活動方不必操作；保留 holder/latch。
- SD-002-S33：真 D1 同 batch 線性化，第四本 commit 必須嚴格早於 deadline；等於先結算；退出競態敗方無副作用。
- SD-002-S34：4 本 deadline 前即 S；以剩餘毫秒 >=30000 決定 S_fast，原稿結局資料由 server。
- SD-002-S35：deadline 到且 2–3 本即 A，保留已救數；結算後拒救書動作。
- SD-002-S36：deadline 到且 0–1 本即 B，直接屋簷，不能再入危險區或進書籤願望。
- SD-002-S38：S/A 逐書三句或選填短語；0–20 Unicode scalar 純文字、合法公開前僅本人讀。
- SD-002-S39：拒 >20 scalar、HTML/control 等違規短語；不得默改原稿選項或對他人公開。
- SD-002-S40：雙方 wish 私密，任一 quiet→03；both keep→01；其餘無 quiet 且有 share→02；B→04。
- SD-002-S42：四稱號由 S_fast 邊界、S_normal/A/B 及原文決定；小票由 server facts 生成。
- SD-002-S44：四印章按原稿 fact：same book/vinyl/witness/quiet+S/A；不含私密或自由輸入。
- SD-002-S45：結局自然完成 Session、Round 保持 active；雙同意下一場、撤回與聊天依既有 guard。
## 技術規範與實作設計
### 架構、DDD 與責任
SYS-02／SYS-03；在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
### 重要函式、核心邏輯與狀態
依[系統設計](../01-system-design.md)與下列每步；不在 renderer 決定結果、不在 Domain 執行 I/O。現有符號與 v4 proposed contract 的精確對應仍待逐檔稽核。
### 契約、資料與平台
21 表、0 新欄、0 Trigger、0 新公開 API；既有 revision、session、receipt、pin、授權、size guard 不放寬。Web/Android 分別驗證；本包不包含 iOS 與無障礙專項。
### 共用與改動合理性
僅新增 V4 所需行為，保留 V3 已驗收路徑至 Gate B，禁止跨包重複寫檔。

## 檔案改動設計
### F-01：`backend/src/DatingHigh.Domain/SceneEventTrackPolicy.cs`
Compile/Initial/ValidateCondition/Evaluate/Activate/Apply/Available：新增 v4 有限 typed transition 分支；傳入 authority time / actor / expected revision，回傳 effect/state 而不做 I/O；V3 保持原實作。

### F-02：`backend/src/DatingHigh.Domain/SceneEventFrameworkPolicies.cs`
既有選場、兩人 consent guard：V4 新場沿用版本選擇與排除策略，禁止單方開下一場。

### F-03：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
測試責任：依下方各 S 的 V-ID 建立具名測試，保留舊回歸，實際 assert 不以 mock 替代整合。

## 有序實作與驗證步驟
### 步驟順序與起始關卡
SD-002-S01 → SD-002-S02 → SD-002-S06 → SD-002-S08 → SD-002-S09 → SD-002-S10 → SD-002-S11 → SD-002-S13 → SD-002-S14 → SD-002-S15 → SD-002-S16 → SD-002-S17 → SD-002-S18 → SD-002-S20 → SD-002-S21 → SD-002-S23 → SD-002-S24 → SD-002-S25 → SD-002-S26 → SD-002-S27 → SD-002-S28 → SD-002-S29 → SD-002-S30 → SD-002-S31 → SD-002-S32 → SD-002-S33 → SD-002-S34 → SD-002-S35 → SD-002-S36 → SD-002-S38 → SD-002-S39 → SD-002-S40 → SD-002-S42 → SD-002-S44 → SD-002-S45；跨包依總覽的階段順序。D1 時鐘可行性須先於救援實作，Gate B 須先於清理。

### SD-002-S01：EnterStore

- 來源：RB4-BDD-001；；SYS：SYS-02／SYS-03；對應 I：SD-002-I01。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：由 actor role 決定唯一入店合法 action，門把/傘桶各自節點獨立；scene cue 不構成另一人進度。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Compile`／`Apply`／`Available`：本人 entry node、角色與 actor allowed binding 三者匹配才移本人 Track；回傳 transition 与 doorbell cue，對方 node/revision 不變。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-001`；標籤：@happy-path @critical @frontend
- Given 兩位玩家各自釘選V4且尚未入店
- When I點門把且A點傘桶
- Then I與A分別到合法下一節點
- And 另一方未操作前其Track不變
- And 原場景融圖、門鈴與原文依角色呈現
- V-RB4-T-001（Unit）：EnterStore_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。；斷言：I與A分別到合法下一節點。
- V-RB4-T-002（Unit）：EnterStore_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。；斷言：另一方未操作前其Track不變。
- V-RB4-T-003（Unit）：EnterStore_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩位玩家各自釘選V4且尚未入店；動作：I點門把且A點傘桶。；斷言：原場景融圖、門鈴與原文依角色呈現。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I01；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S02：NavigateAreas

- 來源：RB4-BDD-002；；SYS：SYS-02／SYS-03；對應 I：SD-002-I02。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：以 pinned graph 的 area adjacency 與 safe-zone guard 判定移動，暖金提示只取本人合法未探索項。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Available`／`Apply`：以本人 Area、pinned adjacency、phase/safe-zone 判合法移動，返回新 Area/shot 與本人可探索 hint；非法無狀態變更。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-001`；標籤：@happy-path @critical @frontend
- Given 本人可探索目前區域
- When 左右導航及小地圖選合法相鄰區
- Then 鏡位與Area依合法鄰接更新
- And 暖金點只示本人合法未探索或新事件
- And 不顯示平鋪移動按鈕海或漂浮星號
- V-RB4-T-006（Unit）：NavigateAreas_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。；斷言：鏡位與Area依合法鄰接更新。
- V-RB4-T-007（Unit）：NavigateAreas_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。；斷言：暖金點只示本人合法未探索或新事件。
- V-RB4-T-008（Unit）：NavigateAreas_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：本人可探索目前區域；動作：左右導航及小地圖選合法相鄰區。；斷言：不顯示平鋪移動按鈕海或漂浮星號。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I02；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S06：BlindBook

- 來源：RB4-BDD-006；；SYS：SYS-02／SYS-03；對應 I：SD-002-I06。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：盲書未撕前僅三個包裝標籤；撕封 actor-scoped CAS 後才釋出內容，取消不揭。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Apply`：以 role+book ID 驗封條操作，合法一次揭封只更新 actor module fact；取消不進 policy，重送由 receipt 層去重；不輸出他人私密 fact。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
- Given 4盲書尚未揭封
- When 滑動各封條、取消、成功揭封後重連
- Then 揭封前只有合法包裝三標籤
- And 有效揭封後才投影該書內容
- And 取消／重送不誤選、不揭另一方私密書
- And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文
- V-RB4-T-026（Unit）：BlindBook_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。；斷言：揭封前只有合法包裝三標籤。
- V-RB4-T-027（Unit）：BlindBook_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。；斷言：有效揭封後才投影該書內容。
- V-RB4-T-028（Unit）：BlindBook_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：4盲書尚未揭封；動作：滑動各封條、取消、成功揭封後重連。；斷言：取消／重送不誤選、不揭另一方私密書。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I06；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S08：Resonance

- 來源：RB4-BDD-008；；SYS：SYS-02／SYS-03；對應 I：SD-002-I08。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：書 ID 與三個共鳴 option 由原稿驗證；本人選定後顯示原文，preview/他人不得讀。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Available`／`Apply`：已選 bookId 且 optionId 屬三原稿選項才寫本人 resonance fact，輸出本人的原文 cue，preview 不走 Apply。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
- Given A選定草稿任一本書
- When 逐一選該書三項共鳴之一
- Then 只提交該書合法選項
- And 原文內心獨白對本人呈現
- And 他人看不到未分享共鳴且預覽不等於選擇
- V-RB4-T-039（Unit）：Resonance_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。；斷言：只提交該書合法選項。
- V-RB4-T-040（Unit）：Resonance_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。；斷言：原文內心獨白對本人呈現。
- V-RB4-T-041（Unit）：Resonance_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：A選定草稿任一本書；動作：逐一選該書三項共鳴之一。；斷言：他人看不到未分享共鳴且預覽不等於選擇。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I08；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S09：VinylSync

- 來源：RB4-BDD-009；；SYS：SYS-02／SYS-03；對應 I：SD-002-I09。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：黑膠切換是共用 state；只同步選曲不強迫播放；實際換曲一次才記 stamp fact。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：只允許三個原稿 record ID，切換共享 currentTrack，實際變更才產出 stamp fact；不保存本地音量。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@happy-path @critical @frontend
- Given 兩方均在本場且各自音效偏好不同
- When 合法切換3曲並重連
- Then 共享曲目以權威版本同步
- And 淡換及原文提示正確、不強制他方開聲音
- And 背景停止播放器、回前景不自動播放
- V-RB4-T-044（Unit）：VinylSync_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。；斷言：共享曲目以權威版本同步。
- V-RB4-T-045（Unit）：VinylSync_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。；斷言：淡換及原文提示正確、不強制他方開聲音。
- V-RB4-T-046（Unit）：VinylSync_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩方均在本場且各自音效偏好不同；動作：合法切換3曲並重連。；斷言：背景停止播放器、回前景不自動播放。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I09；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S10：AmbientExplore

- 來源：RB4-BDD-010；；SYS：SYS-02／SYS-03；對應 I：SD-002-I10。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：非主線場景探索維持兩人 track 與 revision 獨立；repeatable cue 不強制觸發主線。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Available`／`Apply`：ambient binding 依 area/phase/角色可用，僅寫本人 explored 或合法 shared fact，不改另一方 progress，不成導演 prerequisite。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@alternative-path @critical @frontend
- Given 玩家等待對方主線操作
- When 查看小黑板、5則留言及阿澄3話題
- Then 所有原文及合法區域可用
- And 小黑板布丁伏筆保留
- And 探索不阻塞對方、非必經主線
- V-RB4-T-050（Unit）：AmbientExplore_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。；斷言：所有原文及合法區域可用。
- V-RB4-T-051（Unit）：AmbientExplore_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。；斷言：小黑板布丁伏筆保留。
- V-RB4-T-052（Unit）：AmbientExplore_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：玩家等待對方主線操作；動作：查看小黑板、5則留言及阿澄3話題。；斷言：探索不阻塞對方、非必經主線。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I10；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S11：FogWindow

- 來源：RB4-BDD-011；；SYS：SYS-02／SYS-03；對應 I：SD-002-I11。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：擦拭三階段及四符號按原稿；共享結果與本人動畫分離；重送不得加 stamp。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／`Available`：擦霧純 client，不更新 domain；合法四符號選擇取目前 symbol version +1，替換舊可見符號，已取得 witness fact 不撤銷。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-003`；標籤：@happy-path @critical @frontend
- Given 窗區可見雨勢
- When 擦霧查看3階段雨勢並留下4種合法符號
- Then 擦霧純呈現不誤提交
- And 符號由明確操作建立共享版本
- And 離窗後／替換／轉場只依已確認生命週期投影
- V-RB4-T-055（Unit）：FogWindow_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。；斷言：擦霧純呈現不誤提交。
- V-RB4-T-056（Unit）：FogWindow_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。；斷言：符號由明確操作建立共享版本。
- V-RB4-T-057（Unit）：FogWindow_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：窗區可見雨勢；動作：擦霧查看3階段雨勢並留下4種合法符號。；斷言：離窗後／替換／轉場只依已確認生命週期投影。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I11；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S13：SameDifferentBook

- 來源：RB4-BDD-013；；SYS：SYS-02／SYS-03；對應 I：SD-002-I13。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙方合法選書後按 same/different 條件選原稿破冰，不由 client 宣稱相同。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Apply`：兩人已各提交選書才比較 canonical book ID，選 iv4-04-same/diff；單方未完成保持等待且不生成另一人選擇。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@happy-path @critical @frontend
- Given 兩人各自完成正式選書
- When 測同一本與不同一本兩路
- Then 以已提交ID比對
- And I走iv4-04-same或diff及原文
- And 他人未提交時不揭露、不代選
- V-RB4-T-066（Unit）：SameDifferentBook_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。；斷言：以已提交ID比對。
- V-RB4-T-067（Unit）：SameDifferentBook_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。；斷言：I走iv4-04-same或diff及原文。
- V-RB4-T-068（Unit）：SameDifferentBook_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：兩人各自完成正式選書；動作：測同一本與不同一本兩路。；斷言：他人未提交時不揭露、不代選。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I13；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S14：TissueDistance

- 來源：RB4-BDD-014；；SYS：SYS-02／SYS-03；對應 I：SD-002-I14。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：面紙拖放由合法 area 與近遠 slot/gesture 決定；取消不送或變更 Track。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Available`／`Apply`：以當前合法近/遠 slot ID 驗 I 的 tissue action，記距離及 cue；A 的 accept/decline 為獨立 action，不等同 chat intent。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@happy-path @critical @frontend
- Given I可接近閱讀角
- When 拖面紙到近／遠合法位置後A各選收下／不用
- Then 距離與原文cue依實際手勢
- And A收不收面紙不等於是否聊天
- And 錯區或重送不提交額外行為
- V-RB4-T-072（Unit）：TissueDistance_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。；斷言：距離與原文cue依實際手勢。
- V-RB4-T-073（Unit）：TissueDistance_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。；斷言：A收不收面紙不等於是否聊天。
- V-RB4-T-074（Unit）：TissueDistance_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I可接近閱讀角；動作：拖面紙到近／遠合法位置後A各選收下／不用。；斷言：錯區或重送不提交額外行為。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I14；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S15：GiveSpaceReverse

- 來源：RB4-BDD-015；；SYS：SYS-02／SYS-03；對應 I：SD-002-I15。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：留白分支允許 A 主動；I 尊重獨處後退讓；不可代對方提交。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Apply`：I 留白轉 respect，保留 A 的聊書/音樂/安靜獨立 binding，A 選擇後才轉自己的節點；不代提交。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@alternative-path @critical @frontend
- Given I選扶書籤留白
- When A各選主動聊書／音樂／保持安靜
- Then I退開且A有獨立主動權
- And 聊書與音樂進各自原節點
- And A保持安靜走respect/quiet、無假聊天
- V-RB4-T-078（Unit）：GiveSpaceReverse_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。；斷言：I退開且A有獨立主動權。
- V-RB4-T-079（Unit）：GiveSpaceReverse_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。；斷言：聊書與音樂進各自原節點。
- V-RB4-T-080（Unit）：GiveSpaceReverse_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I選扶書籤留白；動作：A各選主動聊書／音樂／保持安靜。；斷言：A保持安靜走respect/quiet、無假聊天。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I15；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S16：DeclineApproach

- 來源：RB4-BDD-016；；SYS：SYS-02／SYS-03；對應 I：SD-002-I16。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：拒絕保持原稿分支與可選探索，不生成假真人聊天。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／`Available`：依 pinned open-up/books-only/decline route 更新 A 與必要 shared 分支，拒絕不產 chat effect，quiet 仍可到導演。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-004`；標籤：@alternative-path @critical @frontend
- Given I選面紙或借書接近
- When A選open-up／books-only／decline
- Then 依草稿對應route與原文
- And 拒絕不出現假聊天及不強制撮合
- And 安靜軌道仍能合法達導演
- V-RB4-T-084（Unit）：DeclineApproach_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。；斷言：依草稿對應route與原文。
- V-RB4-T-085（Unit）：DeclineApproach_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。；斷言：拒絕不出現假聊天及不強制撮合。
- V-RB4-T-086（Unit）：DeclineApproach_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I選面紙或借書接近；動作：A選open-up／books-only／decline。；斷言：安靜軌道仍能合法達導演。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I16；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S17：QuestionCard

- 來源：RB4-BDD-017；；SYS：SYS-02／SYS-03；對應 I：SD-002-I17。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：warm-track 才 seed 抽 4 題之一並釘選；各自提交先私密，雙提交同時翻牌。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Activate`／`Apply`／`Available`：warm 前置才由場次 deterministic seed 釘選四題之一；保存兩份 private option，第二次合法提交後才產 reveal 與雙 warm transition。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-005`；標籤：@happy-path @critical @frontend
- Given 雙方已進warm-track
- When 依場次種子從4題釘選1題並各自回答
- Then 同場重連不重抽
- And 第一份答案只本人可見
- And 雙方提交後同時揭曉同頻／反差、到warm節點
- And HTTP／WS／事件回放不得泄漏未揭曉答案
- V-RB4-T-090（Unit）：QuestionCard_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。；斷言：同場重連不重抽。
- V-RB4-T-091（Unit）：QuestionCard_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。；斷言：第一份答案只本人可見。
- V-RB4-T-092（Unit）：QuestionCard_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：雙方已進warm-track；動作：依場次種子從4題釘選1題並各自回答。；斷言：雙方提交後同時揭曉同頻／反差、到warm節點。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I17；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S18：QuestionCardGuard

- 來源：RB4-BDD-018；；SYS：SYS-02／SYS-03；對應 I：SD-002-I18。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：題目版本、option、actor 與 phase 嚴格檢查；單方答覆不洩漏，重送不重抽。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Apply`：quiet 不需 question；驗 role、pinned question、option、revision，非法/重送不增加提交；同ID receipt 在 SD-003，禁止先揭。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-005`；標籤：@error-handling @critical
- Given 安靜軌道或他方未回答
- When 竄改題ID、他方答案、重送或提前查揭曉
- Then 拒非法操作且不變更revision
- And 同ID同payload回原receipt、改payload409
- And quiet路不被問答阻塞
- V-RB4-T-096（Unit）：QuestionCardGuard_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。；斷言：拒非法操作且不變更revision。
- V-RB4-T-097（Unit）：QuestionCardGuard_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。；斷言：同ID同payload回原receipt、改payload409。
- V-RB4-T-098（Unit）：QuestionCardGuard_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：安靜軌道或他方未回答；動作：竄改題ID、他方答案、重送或提前查揭曉。；斷言：quiet路不被問答阻塞。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I18；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S20：ClerkPersona

- 來源：RB4-BDD-020；；SYS：SYS-02／SYS-03；對應 I：SD-002-I20。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：阿澄 3 話題、4 組致謝依原稿條件；非阻塞 NPC cue 不代玩家回覆。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Available`：以 actor role、node、grade、warm/quiet 選原稿招呼/話題/四組 aftermath；NPC cue 不產真人 message。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-006`；標籤：@happy-path @critical @frontend
- Given I熟客與A避雨生客各自入店
- When 各試3種招呼及4組危機後致謝
- Then 角色分眾原文與表情正確
- And 阿澄赴入口防洪切電，不站原地觀望
- And S/A×warm/quiet原文匹配且不代發真人訊息
- V-RB4-T-107（Unit）：ClerkPersona_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。；斷言：角色分眾原文與表情正確。
- V-RB4-T-108（Unit）：ClerkPersona_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。；斷言：阿澄赴入口防洪切電，不站原地觀望。
- V-RB4-T-109（Unit）：ClerkPersona_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I熟客與A避雨生客各自入店；動作：各試3種招呼及4組危機後致謝。；斷言：S/A×warm/quiet原文匹配且不代發真人訊息。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I20；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S21：DirectorTrigger

- 來源：RB4-BDD-021；；SYS：SYS-02／SYS-03；對應 I：SD-002-I21。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：兩方 pacing point 都到達才原子觸發 director 一次；warm 題卡完成先決。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Evaluate`／`Apply`／`Activate`：兩邊節奏條件 I warm/respect、A warm/quiet 且 warm 已 reveal，才輸出一次 director+ready effect；非主線彩蛋不參與 gate。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-007`；標籤：@happy-path @critical
- Given I/A尚未全部達原稿warm/respect與warm/quiet
- When 兩方並行提交最後節奏點
- Then 滿足雙條件才觸發且warm必先完成提問卡
- And 同場只建立一次director事件及ready
- And 未完成彩蛋不阻塞、非按鈕觸發
- V-RB4-T-113（Unit）：DirectorTrigger_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。；斷言：滿足雙條件才觸發且warm必先完成提問卡。
- V-RB4-T-114（Unit）：DirectorTrigger_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。；斷言：同場只建立一次director事件及ready。
- V-RB4-T-115（Unit）：DirectorTrigger_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：I/A尚未全部達原稿warm/respect與warm/quiet；動作：兩方並行提交最後節奏點。；斷言：未完成彩蛋不阻塞、非按鈕觸發。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I21；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S23：ReadyGate

- 來源：RB4-BDD-023；；SYS：SYS-02／SYS-03；對應 I：SD-002-I23。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙角色各一個 ready；首次雙 ready 才建立 pinned duration deadline，重複 ready 不重計。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／`Activate`：ready role mask 只從0→1；首次 mask=雙人時以 authority time 建 deadline、pinned setId；重複 ready no-op，等待不扣時。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 救書ready且一方尚未接手電筒
- When 單方先ready後雙方並行ready
- Then 單方等待不扣秒
- And 雙ready原子建立唯一deadline與題組
- And 雙端同一權威倒數並顯示原文等待提示
- V-RB4-T-124（Unit）：ReadyGate_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。；斷言：單方等待不扣秒。
- V-RB4-T-125（Unit）：ReadyGate_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。；斷言：雙ready原子建立唯一deadline與題組。
- V-RB4-T-126（Unit）：ReadyGate_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書ready且一方尚未接手電筒；動作：單方先ready後雙方並行ready。；斷言：雙端同一權威倒數並顯示原文等待提示。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I23；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S24：DurationConfig

- 來源：RB4-BDD-024；；SYS：SYS-02／SYS-03；對應 I：SD-002-I24。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：duration 來自 pinned 內容，測 90/120；整數、正值、溢位、threshold 嚴格遞減且小於總長。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Compile`／`Initial`／`Activate`：使用 pinned durationSeconds、threshold 與原文設定而非常數，90/120 分版；validate 不允許缺設定；既有 running/paused 不重新讀新版本。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@boundary @critical
- Given 90秒正式內容與另一合法120秒測試版本
- When 發布新配置並讓新舊場次各自ready
- Then 總時長來自釘選durationSeconds不硬編碼
- And 舊場次90秒、新場次120秒且不熱改deadline
- And 無效整數、門檻越界、溢位或缺設定拒發
- And 發布前驗數值文案及全部時間門檻，暫緩中的舊版仍依原時長恢復
- V-RB4-T-131（Unit）：DurationConfig_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。；斷言：總時長來自釘選durationSeconds不硬編碼。
- V-RB4-T-132（Unit）：DurationConfig_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。；斷言：舊場次90秒、新場次120秒且不熱改deadline。
- V-RB4-T-133（Unit）：DurationConfig_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：90秒正式內容與另一合法120秒測試版本；動作：發布新配置並讓新舊場次各自ready。；斷言：無效整數、門檻越界、溢位或缺設定拒發。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I24；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S25：RescueSetPin

- 來源：RB4-BDD-025；；SYS：SYS-02／SYS-03；對應 I：SD-002-I25。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：seed 釘選 set-a 或 set-b；A shelves 兩本不同位置合法，4 本 ID、原文順序完整。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Activate`／`Initial`：以場次固定 seed 從原兩個 setId 選一，保存 ID；每步按 pinned positionId 與 areaId，不要求四 Area；初始投影只授權角色。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical
- Given 場次尚未抽題組
- When 種子抽選兩組各4步並重連
- Then 只釘選原兩組之一
- And 每步書ID與區域、線索文字符合草稿
- And 重連／重送不重抽且不向未授權方回完整解答
- And set A 第1、3本保留在 shelves 兩個不同位置；四書台不等於四不同 Area，不更改原稿
- V-RB4-T-136（Unit）：RescueSetPin_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。；斷言：只釘選原兩組之一。
- V-RB4-T-137（Unit）：RescueSetPin_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。；斷言：每步書ID與區域、線索文字符合草稿。
- V-RB4-T-138（Unit）：RescueSetPin_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：場次尚未抽題組；動作：種子抽選兩組各4步並重連。；斷言：重連／重送不重抽且不向未授權方回完整解答。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I25；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S26：RescueSteps

- 來源：RB4-BDD-026；；SYS：SYS-02／SYS-03；對應 I：SD-002-I26。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：每本依序分享線索→取書→上滑→收納；holder/slot/step 原子狀態，禁止跳步與雙計。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Available`／`Apply`：step1/2 依 share→pick→pass→store 有限狀態；驗 actor/area/book/holder/slot/phase/revision，每次只一 transition，合法 store 才 count+1；無危險 Area 行為。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 任一原題組第1或第2步
- When A分享線索、I跨合法區抽書上滑、A收書裝袋上架
- Then 權威狀態依角色與步驟轉移
- And 只有合法完整上架計1本
- And 原文成功回饋、無危險入口操作
- V-RB4-T-141（Unit）：RescueSteps_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。；斷言：權威狀態依角色與步驟轉移。
- V-RB4-T-142（Unit）：RescueSteps_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。；斷言：只有合法完整上架計1本。
- V-RB4-T-143（Unit）：RescueSteps_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：任一原題組第1或第2步；動作：A分享線索、I跨合法區抽書上滑、A收書裝袋上架。；斷言：原文成功回饋、無危險入口操作。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I26；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S27：ReverseClues

- 來源：RB4-BDD-027；；SYS：SYS-02／SYS-03；對應 I：SD-002-I27。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：第3本 bottom，第4本 top；I 取得反轉規則後才可分享 A，答案不預先下發。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／`Available`：step3/4 I pickup/share reverse clue，A 底層/上層；第四本依 left/right/seal 的 latchIndex 0..3，seal 成立才 count+1；未分享 clue 不輸出。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 已完成前兩本
- When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條
- Then 反轉線索只合法分享才揭露
- And 第3本下層、第4本完整鎖扣才增加計數
- And 兩組原文toast及合法結果完整
- And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數
- V-RB4-T-147（Unit）：ReverseClues_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。；斷言：反轉線索只合法分享才揭露。
- V-RB4-T-148（Unit）：ReverseClues_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。；斷言：第3本下層、第4本完整鎖扣才增加計數。
- V-RB4-T-149（Unit）：ReverseClues_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：已完成前兩本；動作：I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條。；斷言：兩組原文toast及合法結果完整。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I27；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S28：WrongRescue

- 來源：RB4-BDD-028；；SYS：SYS-02／SYS-03；對應 I：SD-002-I28。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：錯書/錯格不計；錯鎖扣 latchIndex 歸0，已放書/已救數保留、時間繼續。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：錯書、slot、role、area 不改 holder/count；錯鎖扣以合法錯序 action 重置 latchIndex=0 並原文 feedback，已放書及 rescuedCount 保留，不修改 deadline；可重試。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@error-handling @critical @frontend
- Given 救書進行中
- When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動
- Then 錯書／槽／扣原文回饋
- And 不增加rescuedCount、不接受不合法持物或轉移
- And UI復位，合法後續仍可完成
- And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續
- V-RB4-T-153（Unit）：WrongRescue_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。；斷言：錯書／槽／扣原文回饋。
- V-RB4-T-154（Unit）：WrongRescue_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。；斷言：不增加rescuedCount、不接受不合法持物或轉移。
- V-RB4-T-155（Unit）：WrongRescue_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書進行中；動作：逐20本錯抽、錯slot、錯序、錯role／area或重複滑動。；斷言：UI復位，合法後續仍可完成。
- V-RB4-T-330（Unit）：Lock_WrongOrder_RetryWithoutLosingStoredBooks；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；來源：RA-05／BDD027/028；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G09。；前置／動作：已放書且部分扣件完成；依各錯序及合法順序重試。；斷言：錯扣重置鎖扣而非已救數或已放置書，正確序列才完成；只重置鎖扣index至0；已放書、已救數不變，沒有額外時間扣除，成功只計一次。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I28；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S29：QuickCallouts

- 來源：RB4-BDD-029；；SYS：SYS-02／SYS-03；對應 I：SD-002-I29。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：12 句原稿快捷呼喊只作合法 actor cue，不偽造真人聊天；重送依 receipt。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Available`／`Apply`：按 role 白名單各6 callout ID，輸出 cue effect，不寫 message；禁止任意 text/他方 ID。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
- Given 救書中雙方各有6句快捷
- When 逐句點選並嘗試偽造他方ID
- Then 只顯示本人合法原文
- And 明確點擊才發舞台泡泡
- And 不寫假真人聊天、不洩未分享答案
- V-RB4-T-159（Unit）：QuickCallouts_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。；斷言：只顯示本人合法原文。
- V-RB4-T-160（Unit）：QuickCallouts_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。；斷言：明確點擊才發舞台泡泡。
- V-RB4-T-161（Unit）：QuickCallouts_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：救書中雙方各有6句快捷；動作：逐句點選並嘗試偽造他方ID。；斷言：不寫假真人聊天、不洩未分享答案。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I29；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S30：WaterStages

- 來源：RB4-BDD-030；；SYS：SYS-02／SYS-03；對應 I：SD-002-I30。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：75/50/30/15s 四階段在越過邊界後只投最新可見階段；遲到 alarm 不追播。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`（新增受控 system transition）：依 pinned thresholds、authority now 算最新 waterStage，遲到跨多階只輸出最新 cue，不重播；paused 固定 remaining。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@boundary @critical @frontend
- Given 90秒倒數已running
- When 權威時間跨75/50/30/15秒及延遲重連
- Then 各水位階段及原文播報正確
- And 過期cue不重播、畫面ceil秒數一致
- And client改時鐘不影響D1 deadline
- And 各門檻來自釘選內容，發布時驗證數字文案一致
- V-RB4-T-165（Unit）：WaterStages_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。；斷言：各水位階段及原文播報正確。
- V-RB4-T-166（Unit）：WaterStages_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。；斷言：過期cue不重播、畫面ceil秒數一致。
- V-RB4-T-167（Unit）：WaterStages_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：90秒倒數已running；動作：權威時間跨75/50/30/15秒及延遲重連。；斷言：client改時鐘不影響D1 deadline。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I30；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S31：PauseIdle

- 來源：RB4-BDD-031；；SYS：SYS-02／SYS-03；對應 I：SD-002-I31。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙方最近合法活動/有效連線取最早 15s 邊界，若早於 deadline 則 pause，剩餘以應暫緩時刻計。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`（系統 transition）：I=min eligible role activity/disconnect+15000；I<D 且 now≥I 則 pausedRemainingMs=D-I；D≤I 且 now≥D 先結算；ping 不算 activity。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@boundary @critical @frontend
- Given running時一方合法操作停止
- When 測14999/15000ms閒置且仍有ping
- Then 未達15秒不暫緩、達門檻暫緩
- And ping不更新有效活動
- And 保存剩餘時間且原稿暫緩提示正確
- And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先
- V-RB4-T-171（Unit）：PauseIdle_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。；斷言：未達15秒不暫緩、達門檻暫緩。
- V-RB4-T-172（Unit）：PauseIdle_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。；斷言：ping不更新有效活動。
- V-RB4-T-173（Unit）：PauseIdle_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：running時一方合法操作停止；動作：測14999/15000ms閒置且仍有ping。；斷言：保存剩餘時間且原稿暫緩提示正確。
- V-RB4-T-322（Unit）：Resume_IdleRoleReturns_AutomaticallyRestartsClock；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；來源：RA-01／BDD031–032；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G01。；前置／動作：暫緩中單方／雙方閒置或斷線；執行首次合法操作或返回可操作畫面。；斷言：暫緩狀態仍可核證重新參與；不以ping解除；不要求另按恢復；仍活動方不用再操作，雙方皆閒置須各自重新參與；首次恢復操作不計救書成果。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I31；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S32：PauseReconnect

- 來源：RB4-BDD-032；；SYS：SYS-02／SYS-03；對應 I：SD-002-I32。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：閒置者實際操作、斷線者回可操作畫面才恢復；首操作只同步；另一活動方不必操作；保留 holder/latch。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：按 pauseRequiredRole mask 判 idle 真操作/斷線回可操作畫面，首恢復只更新 mask/activity；必要人全恢復時 deadline=authority now+remaining；不變 holder/slot/latch/count，無次數限制。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@alternative-path @critical @frontend
- Given 一方斷線15秒已暫緩
- When 雙方恢復可操作、重複斷線多次
- Then 自動恢復且不要求確認按鈕
- And 保存剩餘時間、無次數上限、不補扣暫緩秒
- And 重連／冷啟動不重設90秒
- And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與
- And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原
- V-RB4-T-177（Unit）：PauseReconnect_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。；斷言：自動恢復且不要求確認按鈕。
- V-RB4-T-178（Unit）：PauseReconnect_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。；斷言：保存剩餘時間、無次數上限、不補扣暫緩秒。
- V-RB4-T-179（Unit）：PauseReconnect_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：一方斷線15秒已暫緩；動作：雙方恢復可操作、重複斷線多次。；斷言：重連／冷啟動不重設90秒。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I32；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S33：DeadlineRace

- 來源：RB4-BDD-033；；SYS：SYS-02／SYS-03；對應 I：SD-002-I33。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：真 D1 同 batch 線性化，第四本 commit 必須嚴格早於 deadline；等於先結算；退出競態敗方無副作用。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：若 now≥deadline 先依 count A/B settle 拒計；now<deadline 且合法最後 seal 才 S；輸出互斥 effect 交 SD-003 原子 CAS，以真 D1 驗線性化時間。
- 驗證檔案：無主測試檔；跨分項驗收；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-008`；標籤：@boundary @critical
- Given 最後一本只差合法封箱
- When 在deadline-1、deadline、deadline+1ms與timeout競態提交
- Then 嚴格早於deadline完成才S
- And 等於或晚於deadline拒操作，先按現有已救數結算
- And 真D1原子交易只有一結果、同receipt不重複
- And 最後毫秒、退出及 timeout 的跨Worker競態均以真 D1 guard／CAS 證明，敗方無副作用
本步為跨包產品責任，原場景所有 TDD ID 見追溯矩陣；不得用無測試的 UI 變更自證。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I33；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S34：GradeS

- 來源：RB4-BDD-034；；SYS：SYS-02／SYS-03；對應 I：SD-002-I34。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：4 本 deadline 前即 S；以剩餘毫秒 >=30000 決定 S_fast，原稿結局資料由 server。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：合法最後 seal 在 deadline 前 count=4 即 settle S，保存 remainingMs/grade/title fact，走書籤意願 gate，不等 timeout。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-009`；標籤：@happy-path @critical @frontend
- Given 4本在期限內完成
- When 伺服器提交最後合法封箱
- Then 立即S不等歸零
- And 播放原文及布丁演出
- And 走書籤／最終意願而非屋簷
- V-RB4-T-189（Unit）：GradeS_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：4本在期限內完成；動作：伺服器提交最後合法封箱。；斷言：立即S不等歸零。
- V-RB4-T-190（Unit）：GradeS_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：4本在期限內完成；動作：伺服器提交最後合法封箱。；斷言：播放原文及布丁演出。
- V-RB4-T-191（Unit）：GradeS_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：4本在期限內完成；動作：伺服器提交最後合法封箱。；斷言：走書籤／最終意願而非屋簷。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I34；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S35：GradeA

- 來源：RB4-BDD-035；；SYS：SYS-02／SYS-03；對應 I：SD-002-I35。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：deadline 到且 2–3 本即 A，保留已救數；結算後拒救書動作。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`（system timeout）：到期 count∈{2,3} 只 settle A 一次，禁後續 rescue，輸出高處/拿鐵/毛巾 cue 與 bookmark phase。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-009`；標籤：@boundary @critical @frontend
- Given 到期已救2或3本
- When DO喚醒或合法讀取補償
- Then A結算且停止救書
- And 原文退至高處、拿鐵及毛巾
- And 走書籤／最終意願
- V-RB4-T-195（Unit）：GradeA_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。；斷言：A結算且停止救書。
- V-RB4-T-196（Unit）：GradeA_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。；斷言：原文退至高處、拿鐵及毛巾。
- V-RB4-T-197（Unit）：GradeA_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：到期已救2或3本；動作：DO喚醒或合法讀取補償。；斷言：走書籤／最終意願。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I35；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S36：GradeB

- 來源：RB4-BDD-036；；SYS：SYS-02／SYS-03；對應 I：SD-002-I36。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：deadline 到且 0–1 本即 B，直接屋簷，不能再入危險區或進書籤願望。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`（system timeout）：到期 count∈{0,1} settle B，直接 ev4-04 與安全區；禁 rescue、bookmark、wish 及危險區移動。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-009`；標籤：@boundary @critical @frontend
- Given 到期已救0或1本
- When 系統結算
- Then B直接ev4-04-eaves-shelter
- And 停止救書且不可再進危險區或提交
- And 屋簷原文與專用鏡位，不走書籤或wish
- V-RB4-T-201（Unit）：GradeB_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：到期已救0或1本；動作：系統結算。；斷言：B直接ev4-04-eaves-shelter。
- V-RB4-T-202（Unit）：GradeB_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：到期已救0或1本；動作：系統結算。；斷言：停止救書且不可再進危險區或提交。
- V-RB4-T-203（Unit）：GradeB_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：到期已救0或1本；動作：系統結算。；斷言：屋簷原文與專用鏡位，不走書籤或wish。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I36；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S38：Bookmark

- 來源：RB4-BDD-038；；SYS：SYS-02／SYS-03；對應 I：SD-002-I38。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：S/A 逐書三句或選填短語；0–20 Unicode scalar 純文字、合法公開前僅本人讀。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Available`／`Apply`：S/A 且本人合法選書才允許三句選項及 0–20 scalar optional note；保存 private actor fact，只有合法 ending disclosure 才釋出。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
- Given S/A已結算
- When 逐書三句書籤選一，選填0/20字並各自提交
- Then 沿用草稿原句與本人短語
- And 未合法公開前對方看不到
- And 留書結局可原位翻對方已授權書籤
- And 未授權 note 不得由素材、歷史事件或通知取得
- V-RB4-T-212（Unit）：Bookmark_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。；斷言：沿用草稿原句與本人短語。
- V-RB4-T-213（Unit）：Bookmark_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。；斷言：未合法公開前對方看不到。
- V-RB4-T-214（Unit）：Bookmark_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A已結算；動作：逐書三句書籤選一，選填0/20字並各自提交。；斷言：留書結局可原位翻對方已授權書籤。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I38；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S39：BookmarkValidation

- 來源：RB4-BDD-039；；SYS：SYS-02／SYS-03；對應 I：SD-002-I39。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：拒 >20 scalar、HTML/control 等違規短語；不得默改原稿選項或對他人公開。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：只 bookmark note 可為自由文字，逐 scalar 計數、拒孤立 surrogate/控制字元/HTML/非法書或他人身份；其他 params 仍固定 ID；錯誤不產 effect。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-010`；標籤：@error-handling @critical
- Given 書籤操作可用
- When 送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note
- Then 非法輸入400且無寫入
- And 0與20合法及emoji scalar一致
- And 其他params仍為嚴格ID，禁止任意文字
- V-RB4-T-219（Unit）：BookmarkValidation_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。；斷言：非法輸入400且無寫入。
- V-RB4-T-220（Unit）：BookmarkValidation_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。；斷言：0與20合法及emoji scalar一致。
- V-RB4-T-221（Unit）：BookmarkValidation_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：書籤操作可用；動作：送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note。；斷言：其他params仍為嚴格ID，禁止任意文字。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I39；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S40：WishMatrix

- 來源：RB4-BDD-040；；SYS：SYS-02／SYS-03；對應 I：SD-002-I40。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：雙方 wish 私密，任一 quiet→03；both keep→01；其餘無 quiet 且有 share→02；B→04。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／`Evaluate`：兩人 bookmark 完成後各自保存 wish；兩份完成才選 ending：任一 quiet→03，兩 keep→01，其他 share→02；B bypass→04。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
- Given S/A兩方書籤已完成
- When 覆核3×3共9種最終意願組合
- Then 兩人keep-talking才ev4-01
- And 無quiet且至少一share-books才ev4-02
- And 任一quiet即ev4-03；第一份未揭露
- V-RB4-T-224（Unit）：WishMatrix_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。；斷言：兩人keep-talking才ev4-01。
- V-RB4-T-225（Unit）：WishMatrix_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。；斷言：無quiet且至少一share-books才ev4-02。
- V-RB4-T-226（Unit）：WishMatrix_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A兩方書籤已完成；動作：覆核3×3共9種最終意願組合。；斷言：任一quiet即ev4-03；第一份未揭露。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I40；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S42：ReceiptTitle

- 來源：RB4-BDD-042；；SYS：SYS-02／SYS-03；對應 I：SD-002-I42。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：四稱號由 S_fast 邊界、S_normal/A/B 及原文決定；小票由 server facts 生成。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`：結算時依 authority remaining >= pinned 30000 選 S_fast，其餘 S_normal，A/B 依 grade；輸出安全 fact ID，不含 note/free text。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@boundary @critical @frontend
- Given S/A/B權威完成
- When 以S剩29999／30000／30001ms及A/B測小票
- Then S_fast >=30000、其餘S_normal
- And A/B稱號原文符合草稿
- And 書、黑膠、救援統計及阿澄附註只來自已提交事實
- And 稱號門檻隨釘選版本設定；小票不含自由輸入
- V-RB4-T-236（Unit）：ReceiptTitle_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。；斷言：S_fast >=30000、其餘S_normal。
- V-RB4-T-237（Unit）：ReceiptTitle_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。；斷言：A/B稱號原文符合草稿。
- V-RB4-T-238（Unit）：ReceiptTitle_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：S/A/B權威完成；動作：以S剩29999／30000／30001ms及A/B測小票。；斷言：書、黑膠、救援統計及阿澄附註只來自已提交事實。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I42；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S44：ReceiptBadges

- 來源：RB4-BDD-044；；SYS：SYS-02／SYS-03；對應 I：SD-002-I44。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：四印章按原稿 fact：same book/vinyl/witness/quiet+S/A；不含私密或自由輸入。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／`Evaluate`：same book、實際切曲、合法 partner witness、quiet+S/A 四獨立 fact；按原稿成立才輸出 badge ID，集合去重，無個資。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@happy-path @critical @frontend
- Given 四印章各有獨立成立或不成立事實
- When 測同書／換曲／對方見符號／quiet+S/A
- Then 各印章只對應原稿條件
- And 不成立不顯示、重送不重複
- And 小票無真實姓名、Email、照片、私密Profile或未授權內容
- And 印章依當前符號實際呈現見證而非背景讀取或自我見證
- V-RB4-T-247（Unit）：ReceiptBadges_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。；斷言：各印章只對應原稿條件。
- V-RB4-T-248（Unit）：ReceiptBadges_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。；斷言：不成立不顯示、重送不重複。
- V-RB4-T-249（Unit）：ReceiptBadges_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：四印章各有獨立成立或不成立事實；動作：測同書／換曲／對方見符號／quiet+S/A。；斷言：小票無真實姓名、Email、照片、私密Profile或未授權內容。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I44；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-002-S45：NaturalCompletion

- 來源：RB4-BDD-045；；SYS：SYS-02／SYS-03；對應 I：SD-002-I45。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：結局自然完成 Session、Round 保持 active；雙同意下一場、撤回與聊天依既有 guard。 在 Domain 以純函數計算合法 actor、當前節點、typed state、下一狀態和語意效果；不得自行 commit、讀時鐘或接收 client 推測結果。
- 產品 F／符號與 Green：F-01 `Apply`／F-02 `PlaythroughLifecyclePolicy`（沿用已確認的 next consent guard）：ending 合法完成產 Session completed，Round active；單方 consent/撤回不建場，雙方成立才走既有選場。
- 驗證檔案：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-011`；標籤：@happy-path @critical @frontend
- Given 本場已結局、Round仍active
- When 自然完成後聊天、單方同意／撤回再雙方同意下一場
- Then 不額外要求完成按鈕或支線
- And 聊天仍可用；雙方同意才建新場
- And 新場釘選合法版本、舊投影與cue清除
- V-RB4-T-253（Unit）：NaturalCompletion_Case1_VerifiesPrimaryRule；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。；斷言：不額外要求完成按鈕或支線。
- V-RB4-T-254（Unit）：NaturalCompletion_Case2_VerifiesBoundaryOrProjection；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。；斷言：聊天仍可用；雙方同意才建新場。
- V-RB4-T-255（Unit）：NaturalCompletion_Case3_VerifiesSideEffectFence；`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`；前置：本場已結局、Round仍active；動作：自然完成後聊天、單方同意／撤回再雙方同意下一場。；斷言：新場釘選合法版本、舊投影與cue清除。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-002-I45；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

## 測試計劃與實際驗證方式
本包 V-ID 直接等於原 TDD ID（前綴 V-），完整前置/動作/斷言逐步列出。命令工作目錄 datinghigh；dotnet test backend/tests/DatingHigh.Unit.Tests --filter FullyQualifiedName~SceneEventTrackTests。所有具名測試及實際輸出未執行；命令選擇器、原生 runner、實際 fixture 路徑須再驗證，不能把設計候選當 runnable implementation。
## 依賴關係與執行順序
[總覽](../00-overview.md)；先真環境可行性、內容契約與 Domain，再權威交易、renderer、兩端整合、Gate A、人工 Gate B、local 清理與重驗、深度稽核。
## 風險、設計變更與人工確認紀錄
已確認 RA-Q1～04 及 RQ-01～04；若真 D1 毫秒 guard、容量、權利、素材或 runner 不成立先停止提出最小方案。候選尚未人工核准。
## 實現檢查清單／Todo
### D：設計葉節點
- [ ] SD-002-D01：逐檔符號、責任、S/V、可執行命令與原斷言完整深度稽核。
### I：實作驗證葉節點
- [ ] SD-002-I01：EnterStore；對應 SD-002-S01；RB4-T-001、RB4-T-002、RB4-T-003
- [ ] SD-002-I02：NavigateAreas；對應 SD-002-S02；RB4-T-006、RB4-T-007、RB4-T-008
- [ ] SD-002-I06：BlindBook；對應 SD-002-S06；RB4-T-026、RB4-T-027、RB4-T-028
- [ ] SD-002-I08：Resonance；對應 SD-002-S08；RB4-T-039、RB4-T-040、RB4-T-041
- [ ] SD-002-I09：VinylSync；對應 SD-002-S09；RB4-T-044、RB4-T-045、RB4-T-046
- [ ] SD-002-I10：AmbientExplore；對應 SD-002-S10；RB4-T-050、RB4-T-051、RB4-T-052
- [ ] SD-002-I11：FogWindow；對應 SD-002-S11；RB4-T-055、RB4-T-056、RB4-T-057
- [ ] SD-002-I13：SameDifferentBook；對應 SD-002-S13；RB4-T-066、RB4-T-067、RB4-T-068
- [ ] SD-002-I14：TissueDistance；對應 SD-002-S14；RB4-T-072、RB4-T-073、RB4-T-074
- [ ] SD-002-I15：GiveSpaceReverse；對應 SD-002-S15；RB4-T-078、RB4-T-079、RB4-T-080
- [ ] SD-002-I16：DeclineApproach；對應 SD-002-S16；RB4-T-084、RB4-T-085、RB4-T-086
- [ ] SD-002-I17：QuestionCard；對應 SD-002-S17；RB4-T-090、RB4-T-091、RB4-T-092
- [ ] SD-002-I18：QuestionCardGuard；對應 SD-002-S18；RB4-T-096、RB4-T-097、RB4-T-098
- [ ] SD-002-I20：ClerkPersona；對應 SD-002-S20；RB4-T-107、RB4-T-108、RB4-T-109
- [ ] SD-002-I21：DirectorTrigger；對應 SD-002-S21；RB4-T-113、RB4-T-114、RB4-T-115
- [ ] SD-002-I23：ReadyGate；對應 SD-002-S23；RB4-T-124、RB4-T-125、RB4-T-126
- [ ] SD-002-I24：DurationConfig；對應 SD-002-S24；RB4-T-131、RB4-T-132、RB4-T-133
- [ ] SD-002-I25：RescueSetPin；對應 SD-002-S25；RB4-T-136、RB4-T-137、RB4-T-138
- [ ] SD-002-I26：RescueSteps；對應 SD-002-S26；RB4-T-141、RB4-T-142、RB4-T-143
- [ ] SD-002-I27：ReverseClues；對應 SD-002-S27；RB4-T-147、RB4-T-148、RB4-T-149
- [ ] SD-002-I28：WrongRescue；對應 SD-002-S28；RB4-T-153、RB4-T-154、RB4-T-155、RB4-T-330
- [ ] SD-002-I29：QuickCallouts；對應 SD-002-S29；RB4-T-159、RB4-T-160、RB4-T-161
- [ ] SD-002-I30：WaterStages；對應 SD-002-S30；RB4-T-165、RB4-T-166、RB4-T-167
- [ ] SD-002-I31：PauseIdle；對應 SD-002-S31；RB4-T-171、RB4-T-172、RB4-T-173、RB4-T-322
- [ ] SD-002-I32：PauseReconnect；對應 SD-002-S32；RB4-T-177、RB4-T-178、RB4-T-179
- [ ] SD-002-I33：DeadlineRace；對應 SD-002-S33；跨包驗收
- [ ] SD-002-I34：GradeS；對應 SD-002-S34；RB4-T-189、RB4-T-190、RB4-T-191
- [ ] SD-002-I35：GradeA；對應 SD-002-S35；RB4-T-195、RB4-T-196、RB4-T-197
- [ ] SD-002-I36：GradeB；對應 SD-002-S36；RB4-T-201、RB4-T-202、RB4-T-203
- [ ] SD-002-I38：Bookmark；對應 SD-002-S38；RB4-T-212、RB4-T-213、RB4-T-214
- [ ] SD-002-I39：BookmarkValidation；對應 SD-002-S39；RB4-T-219、RB4-T-220、RB4-T-221
- [ ] SD-002-I40：WishMatrix；對應 SD-002-S40；RB4-T-224、RB4-T-225、RB4-T-226
- [ ] SD-002-I42：ReceiptTitle；對應 SD-002-S42；RB4-T-236、RB4-T-237、RB4-T-238
- [ ] SD-002-I44：ReceiptBadges；對應 SD-002-S44；RB4-T-247、RB4-T-248、RB4-T-249
- [ ] SD-002-I45：NaturalCompletion；對應 SD-002-S45；RB4-T-253、RB4-T-254、RB4-T-255
## 檢查點與續作交接
本包 Draft；未改產品與原需求；先補逐檔設計/命令稽核，再申請使用者確認。
## 相關文檔
[總覽](../00-overview.md)／[系統設計](../01-system-design.md)／[追溯矩陣](../02-traceability.md)／[原 TDD](../../../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)
## 生成者、最後更新與狀態
ChatGPT GPT-6.2；2026-11-25；Draft。
