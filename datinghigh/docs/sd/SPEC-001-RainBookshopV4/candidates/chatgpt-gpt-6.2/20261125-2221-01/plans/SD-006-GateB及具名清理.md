# SD-006-GateB及具名清理 — 分項實作設計

狀態：Draft／未實作；契約 v2；設計 v2；2026-11-25。

## 開發進度總覽
### 整體進度
設計 D：0/1 已正式稽核；實作 I：0/4；本包主要 TDD：0/13（13 個規劃案例，非測試通過數）。
### 分層／分組進度追蹤
- Unit：0/9
- Integration：0/3
- API：0/0
- E2E：0/1
### 當前 Sprint 狀態
未開始；待候選完整稽核及人工核准。
### 里程碑
本包步驟全部驗收後依賴交接；Gate A/B 獨立。
### 關鍵指標
原稿相等、source ID 完整與所有適用層級實測；不以數量代替品質。
### 每日進度記錄
依 DatingHigh 規範不適用；實際證據只在既有 Verification。

## 功能概述
Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
## 功能需求與來源追溯
[全量矩陣](../02-traceability.md)；RB4-BDD-052、RB4-BDD-053、RB4-BDD-054、RB4-BDD-055。
### BDD 行為與產品實作分解

| BDD | 產品步驟 | 實際產品檔案／符號／核心 Green | 條件、結果與驗收 |
|---|---|---|---|
| RB4-BDD-052 | SD-006-S52 | F-01/F-02（純人工 Gate，產品無寫入）：讀 Verification Gate A 與正式版本 SHA；僅明確本人實玩核准該 SHA 才允許後續 cleanup，拒絕或缺證據保留 V3 與所有資料。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-053 | SD-006-S53 | F-01 `validateSceneEventTarget`／`planSceneEventUpgrade`、F-02 `withPausedWrites`：先確認 default local、停寫、備份，列具名 V1/2/3 及 V4 測試 Round/Session/Invitation/claim/event/catalog/asset 引用；混合非驗收或未知引用拒絕，保護帳號/個資/化身/其他內容指紋。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-054 | SD-006-S54 | F-01 `applySceneEventUpgrade`／F-02 `withPausedWrites`：按已核准精確 plan 與 FK 順序在 D1 原子清理，R2 僅無剩餘引用 SHA；中斷重讀 plan/狀態，補償、重試、保護指紋與無孤兒查核；不以 prefix 廣刪。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |
| RB4-BDD-055 | SD-006-S55 | F-01/F-02 清理成果沿用；純回歸由 SD-005-S55、SD-004-S55：正式索引僅 V4，舊 SHA 不可恢復，新配對完整流程，查保護指紋及無孤兒；不為通過而修改業務。 | 同號步驟逐條 Given/When/Then/And 與 V-ID；跨包結果見總矩陣 |

## 用戶故事
以原 BDD 雙人真實配對、角色獨立／合作及退出權為準，本包不增加劇情。
## 畫面操作／系統處理流程
- SD-006-S52：只接受使用者本人對 exact pinned SHA 的實玩確認；未確認不得清理或宣稱驗收。
- SD-006-S53：具名 local Round/版本/pair 清單；混合非測試輪、未知引用拒絕；共享資產保護。
- SD-006-S54：停寫備份後依 FK 順序原子清除具名資料，失敗 rollback；R2 僅無引用 key，保護資料指紋。
- SD-006-S55：清理後以全新雙人配對在 V4-only 索引跑完整 Web/Android；舊 SHA 不可再選。
## 技術規範與實作設計
### 架構、DDD 與責任
SYS-06；Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
### 重要函式、核心邏輯與狀態
依[系統設計](../01-system-design.md)與下列每步；不在 renderer 決定結果、不在 Domain 執行 I/O。現有符號與 v4 proposed contract 的精確對應仍待逐檔稽核。
### 契約、資料與平台
21 表、0 新欄、0 Trigger、0 新公開 API；既有 revision、session、receipt、pin、授權、size guard 不放寬。Web/Android 分別驗證；本包不包含 iOS 與無障礙專項。
### 共用與改動合理性
僅新增 V4 所需行為，保留 V3 已驗收路徑至 Gate B，禁止跨包重複寫檔。

## 檔案改動設計
### F-01：`tools/scene-event-local-policy.mjs`
validateSceneEventTarget / planSceneEventUpgrade / applySceneEventUpgrade：驗具名 local instance/Round/pair/版本/引用；擴充清理 plan/保護指紋，混合非測試資料 fail closed。

### F-02：`tools/local.mjs`
withPausedWrites：固定本機 wrapper、停寫與備份、dry plan 比對、原子清理後重驗；僅 Gate B 核准 SHA，禁止遠端或 prefix 清理。

### F-03：`cloudflare/tests/scene-event-local-upgrade.integration.test.ts`
測試責任：依下方各 S 的 V-ID 建立具名測試，保留舊回歸，實際 assert 不以 mock 替代整合。

### F-04：`tests/integration/local-game-maintenance.test.mjs`
測試責任：依下方各 S 的 V-ID 建立具名測試，保留舊回歸，實際 assert 不以 mock 替代整合。

## 有序實作與驗證步驟
### 步驟順序與起始關卡
SD-006-S52 → SD-006-S53 → SD-006-S54 → SD-006-S55；跨包依總覽的階段順序。D1 時鐘可行性須先於救援實作，Gate B 須先於清理。

### SD-006-S52：GateB

- 來源：RB4-BDD-052；；SYS：SYS-06；對應 I：SD-006-I52。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：只接受使用者本人對 exact pinned SHA 的實玩確認；未確認不得清理或宣稱驗收。 Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
- 產品 F／符號與 Green：F-01/F-02（純人工 Gate，產品無寫入）：讀 Verification Gate A 與正式版本 SHA；僅明確本人實玩核准該 SHA 才允許後續 cleanup，拒絕或缺證據保留 V3 與所有資料。
- 驗證檔案：`人工 Gate B`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-013`；標籤：@alternative-path @critical @manual
- Given Gate A已完成且有精確版本SHA
- When 使用者實際遊玩並確認或拒絕
- Then 只有明確核准精確版本才可清理
- And 拒絕或未確認保留V3及舊場次
- And 自動測試不能代簽
- V-RB4-T-295（E2E）：GateB_ExactVersion_UserApproves；`人工 Gate B`；前置：Gate A已完成且有精確版本SHA；動作：使用者實際遊玩並確認或拒絕。；斷言：只有明確核准精確版本才可清理；拒絕或未確認保留V3及舊場次；自動測試不能代簽；只由使用者實玩核准。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。本步為人工 Gate，Red/Green 自動化不適用；未核准即停止。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm test；npm --prefix cloudflare test -- scene-event-track-upgrade；node --test tests/integration/local-game-maintenance.test.mjs；實際清理命令須於實作前確認固定 local wrapper`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-006-I52；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-006-S53：CleanupScope

- 來源：RB4-BDD-053；；SYS：SYS-06；對應 I：SD-006-I53。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：具名 local Round/版本/pair 清單；混合非測試輪、未知引用拒絕；共享資產保護。 Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
- 產品 F／符號與 Green：F-01 `validateSceneEventTarget`／`planSceneEventUpgrade`、F-02 `withPausedWrites`：先確認 default local、停寫、備份，列具名 V1/2/3 及 V4 測試 Round/Session/Invitation/claim/event/catalog/asset 引用；混合非驗收或未知引用拒絕，保護帳號/個資/化身/其他內容指紋。
- 驗證檔案：`tests/integration/local-game-maintenance.test.mjs`、`cloudflare/tests/scene-event-track-upgrade.integration.test.ts`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-013`；標籤：@error-handling @critical
- Given Gate B已核准且已知local停寫
- When 預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境
- Then 不明環境／未授權／無備份拒清理
- And 精確Round/Session/Invitation/claim/event/catalog及R2引用清單
- And 保護帳號、個資、化身與其他故事或資產
- And 混有非驗收遊玩資料或未知引用的輪次拒清並列衝突
- V-RB4-T-296（Unit）：CleanupScope_Case1_VerifiesPrimaryRule；`tests/integration/local-game-maintenance.test.mjs`；前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。；斷言：不明環境／未授權／無備份拒清理。
- V-RB4-T-297（Unit）：CleanupScope_Case2_VerifiesBoundaryOrProjection；`tests/integration/local-game-maintenance.test.mjs`；前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。；斷言：精確Round/Session/Invitation/claim/event/catalog及R2引用清單。
- V-RB4-T-298（Unit）：CleanupScope_Case3_VerifiesSideEffectFence；`tests/integration/local-game-maintenance.test.mjs`；前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。；斷言：保護帳號、個資、化身與其他故事或資產。
- V-RB4-T-299（Integration）：CleanupScope_RealDependencies_PreservesContract；`cloudflare/tests/scene-event-track-upgrade.integration.test.ts`；前置：Gate B已核准且已知local停寫；動作：預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境。；斷言：不明環境／未授權／無備份拒清理；精確Round/Session/Invitation/claim/event/catalog及R2引用清單；保護帳號、個資、化身與其他故事或資產；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。
- V-RB4-T-334（Integration）：Cleanup_MixedRoundAndSharedReference_BlocksUnsafeDeletion；`cloudflare/tests/scene-event-track-upgrade.integration.test.ts`；來源：RA-08／BDD053/054；關聯場景依 [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md) 之 G13。；前置／動作：受控local混合非驗收Round、共用素材與未知引用；預覽清理並模擬中斷。；斷言：非測試輪混合版本或未知引用拒清，具名測試清理保護FK及R2共享SHA；拒清衝突；已授權具名測試輪清理後FK／保護指紋相符、剩餘R2引用不刪。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm test；npm --prefix cloudflare test -- scene-event-track-upgrade；node --test tests/integration/local-game-maintenance.test.mjs；實際清理命令須於實作前確認固定 local wrapper`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-006-I53；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-006-S54：CleanupAtomicity

- 來源：RB4-BDD-054；；SYS：SYS-06；對應 I：SD-006-I54。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：停寫備份後依 FK 順序原子清除具名資料，失敗 rollback；R2 僅無引用 key，保護資料指紋。 Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
- 產品 F／符號與 Green：F-01 `applySceneEventUpgrade`／F-02 `withPausedWrites`：按已核准精確 plan 與 FK 順序在 D1 原子清理，R2 僅無剩餘引用 SHA；中斷重讀 plan/狀態，補償、重試、保護指紋與無孤兒查核；不以 prefix 廣刪。
- 驗證檔案：`tests/integration/local-game-maintenance.test.mjs`、`cloudflare/tests/scene-event-track-upgrade.integration.test.ts`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-013`；標籤：@error-handling @critical
- Given 已確認清理範圍與備份
- When 故障注入D1交易或R2清理並重試
- Then FK依賴及保護指紋正確、無孤兒
- And 測試pair排除與占用不殘留
- And R2只刪無剩餘引用、故障可補償且不假成功
- And 共用 R2 SHA 有剩餘引用不可刪；保護指紋及失敗補償可核證
- V-RB4-T-300（Unit）：CleanupAtomicity_Case1_VerifiesPrimaryRule；`tests/integration/local-game-maintenance.test.mjs`；前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。；斷言：FK依賴及保護指紋正確、無孤兒。
- V-RB4-T-301（Unit）：CleanupAtomicity_Case2_VerifiesBoundaryOrProjection；`tests/integration/local-game-maintenance.test.mjs`；前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。；斷言：測試pair排除與占用不殘留。
- V-RB4-T-302（Unit）：CleanupAtomicity_Case3_VerifiesSideEffectFence；`tests/integration/local-game-maintenance.test.mjs`；前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。；斷言：R2只刪無剩餘引用、故障可補償且不假成功。
- V-RB4-T-303（Integration）：CleanupAtomicity_RealDependencies_PreservesContract；`cloudflare/tests/scene-event-track-upgrade.integration.test.ts`；前置：已確認清理範圍與備份；動作：故障注入D1交易或R2清理並重試。；斷言：FK依賴及保護指紋正確、無孤兒；測試pair排除與占用不殘留；R2只刪無剩餘引用、故障可補償且不假成功；使用實際 D1/R2/DO 或真 bridge、故障注入及前後狀態對照，依責任不以fixture冒充。。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm test；npm --prefix cloudflare test -- scene-event-track-upgrade；node --test tests/integration/local-game-maintenance.test.mjs；實際清理命令須於實作前確認固定 local wrapper`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-006-I54；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

### SD-006-S55：CleanReplay

- 來源：RB4-BDD-055；；SYS：SYS-06；對應 I：SD-006-I55。
- 前置：依整體依賴順序及原 BDD Given；本步如屬 UI/整合，先確認 authoritative projection / pinned content 可用。
- 核心實作：清理後以全新雙人配對在 V4-only 索引跑完整 Web/Android；舊 SHA 不可再選。 Gate A 完整後使用者實際遊玩核准精確候選 SHA 才停寫、備份及執行具名 local 清理。禁止遠端、prefix 廣刪、刪共享 SHA。
- 產品 F／符號與 Green：F-01/F-02 清理成果沿用；純回歸由 SD-005-S55、SD-004-S55：正式索引僅 V4，舊 SHA 不可恢復，新配對完整流程，查保護指紋及無孤兒；不為通過而修改業務。
- 驗證檔案：`tests/integration/local-game-maintenance.test.mjs`；僅修改本包唯一路徑，跨包產品引用不得重複寫入。

#### 測試資料與預期結果
- - SPEC：`RB4-AC-014`；標籤：@happy-path @critical @frontend
- Given 清理完成且正式索引只剩V4
- When 新配對、進場、結局、聊天、重玩與退出
- Then 舊版不可選、無舊SHA或歷史恢復
- And V4完整可玩、配對/聊天/退出維持
- And 所有Gate證據齊全才可結案與進下一SPEC
- V-RB4-T-304（Unit）：CleanReplay_Case1_VerifiesPrimaryRule；`tests/integration/local-game-maintenance.test.mjs`；前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。；斷言：舊版不可選、無舊SHA或歷史恢復。
- V-RB4-T-305（Unit）：CleanReplay_Case2_VerifiesBoundaryOrProjection；`tests/integration/local-game-maintenance.test.mjs`；前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。；斷言：V4完整可玩、配對/聊天/退出維持。
- V-RB4-T-306（Unit）：CleanReplay_Case3_VerifiesSideEffectFence；`tests/integration/local-game-maintenance.test.mjs`；前置：清理完成且正式索引只剩V4；動作：新配對、進場、結局、聊天、重玩與退出。；斷言：所有Gate證據齊全才可結案與進下一SPEC。

#### 本步操作次序與判定
1. Red：建立上述具名測試並先核對失敗是預期缺少 V4 行為，不是 fixture 或環境故障。
2. Green：依核心規則最小實作，限定 F 責任；驗證命令：`npm test；npm --prefix cloudflare test -- scene-event-track-upgrade；node --test tests/integration/local-game-maintenance.test.mjs；實際清理命令須於實作前確認固定 local wrapper`（只在實作完成、依賴與實際 runner 已確認後執行）。
3. Refactor：保留 V3 路徑、負向 guard、重送／授權／錯誤回復；跑本包及相依回歸。任一原斷言不成立、實際環境缺失或需改原稿／架構時停止，不勾選 SD-006-I55；完成後續同包下一 S 或依總覽交接。證據寫入既有 Verification。

## 測試計劃與實際驗證方式
本包 V-ID 直接等於原 TDD ID（前綴 V-），完整前置/動作/斷言逐步列出。命令工作目錄 datinghigh；npm test；npm --prefix cloudflare test -- scene-event-track-upgrade；node --test tests/integration/local-game-maintenance.test.mjs；實際清理命令須於實作前確認固定 local wrapper。所有具名測試及實際輸出未執行；命令選擇器、原生 runner、實際 fixture 路徑須再驗證，不能把設計候選當 runnable implementation。
## 依賴關係與執行順序
[總覽](../00-overview.md)；先真環境可行性、內容契約與 Domain，再權威交易、renderer、兩端整合、Gate A、人工 Gate B、local 清理與重驗、深度稽核。
## 風險、設計變更與人工確認紀錄
已確認 RA-Q1～04 及 RQ-01～04；若真 D1 毫秒 guard、容量、權利、素材或 runner 不成立先停止提出最小方案。候選尚未人工核准。
## 實現檢查清單／Todo
### D：設計葉節點
- [ ] SD-006-D01：逐檔符號、責任、S/V、可執行命令與原斷言完整深度稽核。
### I：實作驗證葉節點
- [ ] SD-006-I52：GateB；對應 SD-006-S52；RB4-T-295
- [ ] SD-006-I53：CleanupScope；對應 SD-006-S53；RB4-T-296、RB4-T-297、RB4-T-298、RB4-T-299、RB4-T-334
- [ ] SD-006-I54：CleanupAtomicity；對應 SD-006-S54；RB4-T-300、RB4-T-301、RB4-T-302、RB4-T-303
- [ ] SD-006-I55：CleanReplay；對應 SD-006-S55；RB4-T-304、RB4-T-305、RB4-T-306
## 檢查點與續作交接
本包 Draft；未改產品與原需求；先補逐檔設計/命令稽核，再申請使用者確認。
## 相關文檔
[總覽](../00-overview.md)／[系統設計](../01-system-design.md)／[追溯矩陣](../02-traceability.md)／[原 TDD](../../../../../../tdd/SPEC-001-RainBookshopV4-TDD.md)
## 生成者、最後更新與狀態
ChatGPT GPT-6.2；2026-11-25；Draft。
