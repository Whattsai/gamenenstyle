# SPEC-001-SceneEventFramework — TDD 測試清單

> **來源 MVP**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md)（AC-005-04～23）；**最新版 SDD**：[SceneEventFramework](../specs/SPEC-001-SceneEventFramework.md)；**BDD**：[121 場景](../bdd/SPEC-001-SceneEventFramework-BDD.md)
> **原生成日期**：2026-11-12；**2026-11-16 Phase 5 最終規劃**：BDD 121 場景；TDD 原 383＋雙 Track／劇本 222＋RiskAudit 20＝**625 項**。V2-RQ-01=A 與 10 組 GAP 已正式回寫；**本輪交接 Ready for well-done（僅規劃 Gate）**，非程式實作、產品測試或人工 Gate B 通過。完整證據見 [Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)。

## 開發進度總覽

```text
📦 SceneEventFramework / Red-Green-Refactor
├─ 狀態：2026-11-16 Perfect-plan Phase 5 完成，Ready for well-done；新引擎／首條正式故事尚待實作及 Gate B
├─ BDD：舊版 1/79、新版 0/42，合計 1/121（逐 ID 完整覆核）
├─ TDD：舊版 56/383，新版 0/242；合計 56/625（9.0%，只以完整斷言覆核計算）
├─ 前置 Gate：既有雨聲書店及全身化身仍有獨立未結案驗收
└─ 開發次序：先 1 條完整主線→使用者試玩調校確認→其餘 9 條
```

### 分層進度追蹤

| 層級 | 已完成 | 待實作 | 指定測試入口 |
|---|---:|---:|---|
| Unit | 25/366 | 341 | Domain 雙 Track／World／Publisher／新增圖依賴及劇本驗證 |
| Integration | 20/129 | 109 | Miniflare 真 D1、R2、CAS／rollback、本地清理與正式內容發布 |
| API | 5/53 | 48 | Actor-scoped HTTP/WS、私有內容、嚴格 params、NPC 假冒拒絕 |
| E2E | 6/77 | 71 | Web／Android 雙真人完整劇本、環境微動與 Ending A |
| **合計** | **56/625** | **569** | **新增 242 項全部待實作，既有 56 項僅對舊版已覆核案例有效** |

### 里程碑

- [x] M1：RiskAudit RA-Q1=A、RA-Q2=A 已由使用者明確確認，缺漏已增補至 BDD/TDD 並完成規劃回寫（**只代表規劃 Gate，不代表程式驗收**）。
- [ ] M2：在 `0006` 已存在的五表基礎上新增一筆個人 Track 進度表、重整 StorySession／EventInstance、在受控 local Clean Rebuild 後移除 `game_interaction_instances`；真 D1 rollback／唯一鍵／資料保護與 R2 v2 版本一致性測試全部具證據。
- [ ] M3：Category／Scene／Narrative 決議與 3:1、雙 Track 及 Shared 世界原子事件、各自進度／角色可見性、互動／NPC／物件操作、自然收尾與兩人同意重玩。
- [ ] M4：**重寫**唯一首條「被雨打亂的最後一單」正式 R2 v2 內容，按 SDD 21 Node／四 Area／三次交會／兩種 Ending／RB-01～14 實測；保留正式五表情、2.5D 素材、Web／Android 真雙人、B1／UX-P1～P5 安全與效能驗證。不以舊書籤劇本的測試代替新首條。
- [ ] M5：**使用者實際試玩、調校、明確通過首條 Gate**，取得後才能開發其餘九條主線。
- [ ] M6：最終至少十條完整可遊玩主線，實際內容非 fixtures，全部驗收。

當前實作、測試函式數、逐項覆核與未完事項統一見 [驗證紀錄](../verification/SPEC-001-SceneEventFramework-Verification.md)。下方日期段落保留原規劃交接快照，不代表目前產品驗收。

### 每日進度

**2026-11-12**：已確認 SDD RQ-01～03=A、RiskAudit RA-Q1=A／RA-Q2=A；BDD 63→66、TDD 295→320，原 8 組 GAP 已規劃；產品測試 0 通過。

**2026-11-13**：依最新全身化身、五表情與 2.5D 遊戲體驗影響稽核，BDD **+12（66→78）**、TDD **+59（320→379；Unit +36、Integration +8、API +3、E2E +12）**；八組跨 SPEC UX 缺漏補入。**僅規劃文件，產品測試 0/379，Gate B 仍未經使用者人工通過**。

## 1️⃣ 單元測試（Unit Tests）

### 建議測試檔：`backend/tests/DatingHigh.Unit.Tests/Application/SceneEventFrameworkPolicyTests.cs`

- [ ] **SEF-UT-001** `Recommend_OneCategory_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：Given 雙方配對成功且只有浪漫類別具有可玩主線；When 受邀方接受邀請
  - **驗證**：Then 伺服器直接選中浪漫類別並抽場景主線

- [ ] **SEF-UT-002** `Recommend_OneCategory_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有偽造投票，也沒有出現選類別畫面

- [ ] **SEF-UT-003** `Recommend_OneCategory_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有偽造投票，也沒有出現選類別畫面」

- [ ] **SEF-UT-004** `Recommend_TwoCategories_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：Given 浪漫與懸疑兩類別皆有可玩主線；When A 與 B 各提交有效類別票
  - **驗證**：Then 兩票決議後只形成一筆最新場次

- [ ] **SEF-UT-005** `Recommend_TwoCategories_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 決議前不顯示對方所選類別

- [ ] **SEF-UT-006** `Recommend_TwoCategories_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「決議前不顯示對方所選類別」

- [ ] **SEF-UT-007** `Recommend_ThreePlusCategories_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：Given 四類別皆有可玩主線且雙方興趣不同；When 配對成立並取得候選
  - **驗證**：Then 按雙方均衡推薦排序凍結前三個 Category ID

- [ ] **SEF-UT-008** `Recommend_ThreePlusCategories_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 候選順序兩端一致且不因重新整理改變

- [ ] **SEF-UT-009** `Recommend_ThreePlusCategories_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「候選順序兩端一致且不因重新整理改變」

- [ ] **SEF-UT-010** `Scene_MultiCategory_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：Given 雨聲書店同時對應浪漫與懸疑；When 兩個類別分別被選中
  - **驗證**：Then 都能找到同一已發布場景且引用正確版本

- [ ] **SEF-UT-011** `Scene_MultiCategory_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 類別不是 Profile 的 reading 興趣欄位

- [ ] **SEF-UT-012** `Scene_MultiCategory_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「類別不是 Profile 的 reading 興趣欄位」

- [ ] **SEF-UT-013** `Narrative_MultiPerScene_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：Given 雨聲書店綁定尋書與夜雨約定兩條主線；When 查詢同場景合格主線
  - **驗證**：Then 兩條主線均可在同一場景被選中

- [ ] **SEF-UT-014** `Narrative_MultiPerScene_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不同主線的 entry 與內容版本互不混淆

- [ ] **SEF-UT-015** `Narrative_MultiPerScene_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不同主線的 entry 與內容版本互不混淆」

- [x] **SEF-UT-016** `Scene_WeightThreeToOne_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-011／SEF-AC-003`；情境：新場景抽選權重為三比一
  - **前置／操作**：Given 一個未玩場景與一個已玩場景均合格；When 伺服器在可注入 RNG 下重複抽選
  - **驗證**：Then 未玩過場景的選中權重是已玩過的三倍

- [x] **SEF-UT-017** `Scene_WeightThreeToOne_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-011／SEF-AC-003`；情境：新場景抽選權重為三比一
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 並非硬性排除已玩場景

- [ ] **SEF-UT-018** `Scene_WeightThreeToOne_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-011／SEF-AC-003`；情境：新場景抽選權重為三比一
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「並非硬性排除已玩場景」

- [ ] **SEF-UT-019** `Narrative_UnorderedWeighted_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：Given 同一場景存在已玩與未玩無序主線；When 抽選主線
  - **驗證**：Then 未玩者取得較高但非唯一機率

- [ ] **SEF-UT-020** `Narrative_UnorderedWeighted_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 相同隨機種子可重現測試結果

- [ ] **SEF-UT-021** `Narrative_UnorderedWeighted_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「相同隨機種子可重現測試結果」

- [x] **SEF-UT-022** `Narrative_OrderedUnlock_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-015／SEF-AC-003`；情境：有序主線不可跳章
  - **前置／操作**：Given 第二章需要第一章完成且第三章未解鎖；When 抽選有序主線
  - **驗證**：Then 只能從目前符合前置條件的章節選擇

- [x] **SEF-UT-023** `Narrative_OrderedUnlock_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-015／SEF-AC-003`；情境：有序主線不可跳章
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能因權重偏好直接選第三章

- [ ] **SEF-UT-024** `Narrative_OrderedUnlock_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-015／SEF-AC-003`；情境：有序主線不可跳章
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能因權重偏好直接選第三章」

- [x] **SEF-UT-025** `Graph_OneEnding_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：線性主線一個結局即可發布
  - **前置／操作**：Given 線性主線只有一個可達 Ending 且有完整開場推進；When 發布工具驗證並進行遊玩
  - **驗證**：Then 內容合法且能抵達唯一結尾

- [x] **SEF-UT-026** `Graph_OneEnding_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：線性主線一個結局即可發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不再要求至少兩個 Ending 或固定四節點

- [x] **SEF-UT-027** `Graph_OneEnding_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：線性主線一個結局即可發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不再要求至少兩個 Ending 或固定四節點」

- [ ] **SEF-UT-028** `Graph_BranchRejoin_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：Given 兩個不同選項通往不同線索後合流；When 玩家選擇其中一項
  - **驗證**：Then 只有所選分支的事件結果寫入進度

- [ ] **SEF-UT-029** `Graph_BranchRejoin_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 其餘共用主線可正常繼續

- [ ] **SEF-UT-030** `Graph_BranchRejoin_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「其餘共用主線可正常繼續」

- [ ] **SEF-UT-031** `Event_RoleByBinding_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：Given 書籤事件被兩條主線引用；When 內容發布並啟動兩條主線
  - **驗證**：Then 第一條定義為支線，第二條可定義為主線

- [ ] **SEF-UT-032** `Event_RoleByBinding_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And EventDefinition ID 與玩法版本保持相同

- [ ] **SEF-UT-033** `Event_RoleByBinding_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「EventDefinition ID 與玩法版本保持相同」

- [ ] **SEF-UT-034** `Event_HiddenRandomConditional_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：Given 事件有 visibility=hidden、weighted_random 和完成找線索前置；When 符合條件後抽中此事件
  - **驗證**：Then 系統只在成功觸發時向合格玩家揭露

- [ ] **SEF-UT-035** `Event_HiddenRandomConditional_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 三個維度彼此不互斥

- [ ] **SEF-UT-036** `Event_HiddenRandomConditional_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「三個維度彼此不互斥」

- [x] **SEF-UT-037** `Event_ThreeSourcePools_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：主線場景全域事件池可共存
  - **前置／操作**：Given 書店存在主線綁定、場景綁定與相容全域綁定；When 伺服器彙整候選事件
  - **驗證**：Then 三來源依限定 Binding ID 合併並過濾相容性

- [x] **SEF-UT-038** `Event_ThreeSourcePools_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：主線場景全域事件池可共存
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 主線必要事件不被全域自由事件搶占

- [ ] **SEF-UT-039** `Event_ThreeSourcePools_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：主線場景全域事件池可共存
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「主線必要事件不被全域自由事件搶占」

- [x] **SEF-UT-040** `Event_PlaythroughScope_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-028／SEF-AC-006`；情境：事件僅在本次遊玩不重複
  - **前置／操作**：Given 同一 Binding 已於 episode 1 完成且 repeatScope=playthrough；When 雙方同意開始 episode 2 並符合觸發條件
  - **驗證**：Then episode 2 可重新觸發這個事件

- [x] **SEF-UT-041** `Event_PlaythroughScope_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-028／SEF-AC-006`；情境：事件僅在本次遊玩不重複
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And episode 1 仍無法重複建立相同 Binding instance

- [ ] **SEF-UT-042** `Event_PlaythroughScope_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-028／SEF-AC-006`；情境：事件僅在本次遊玩不重複
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「episode 1 仍無法重複建立相同 Binding instance」

- [x] **SEF-UT-043** `Event_RoundScope_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-029／SEF-AC-006`；情境：整輪配對範圍限制事件重複
  - **前置／操作**：Given 事件在 episode 1 完成且 repeatScope=round；When 同一 Round 的 episode 2 再符合觸發
  - **驗證**：Then 該事件不會再次觸發

- [x] **SEF-UT-044** `Event_RoundScope_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-029／SEF-AC-006`；情境：整輪配對範圍限制事件重複
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 更換配對組合可以在新的 Round 重新體驗

- [ ] **SEF-UT-045** `Event_RoundScope_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-029／SEF-AC-006`；情境：整輪配對範圍限制事件重複
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「更換配對組合可以在新的 Round 重新體驗」

- [ ] **SEF-UT-046** `Event_OutcomeChangesNarrative_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：Given 隱藏信件事件的結果旗標已合法提交；When 主線到達會檢查結果的節點
  - **驗證**：Then 依旗標決定後續可用的分支或回應

- [ ] **SEF-UT-047** `Event_OutcomeChangesNarrative_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 未完成事件不能偽造結果

- [ ] **SEF-UT-048** `Event_OutcomeChangesNarrative_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「未完成事件不能偽造結果」

- [ ] **SEF-UT-049** `Chapter_AutoComplete_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：Given 主線與必要事件均已滿足 Ending 條件；When 真人提交到 Ending 的最後操作
  - **驗證**：Then 該 StorySession 同筆交易更新為 completed

- [ ] **SEF-UT-050** `Chapter_AutoComplete_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不顯示額外完成按鈕也不把 Round ended

- [ ] **SEF-UT-051** `Chapter_AutoComplete_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不顯示額外完成按鈕也不把 Round ended」

- [ ] **SEF-UT-052** `Next_BothAgree_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：Given episode 1 已 completed 且 Round active；When A 與 B 各自提交同意
  - **驗證**：Then 系統恰好建立 episode 2 的候選或直接進場

- [ ] **SEF-UT-053** `Next_BothAgree_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 舊 episode 1 保持 completed 且聊天不斷

- [ ] **SEF-UT-054** `Next_BothAgree_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「舊 episode 1 保持 completed 且聊天不斷」

- [ ] **SEF-UT-055** `Content_ImmutablePinned_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：Given 玩家使用 v1 的 R2 bundle，發布者已發布 v2；When 玩家重連並繼續本場
  - **驗證**：Then 仍取回 v1 及其全部依賴的 Scene/Event 版本

- [ ] **SEF-UT-056** `Content_ImmutablePinned_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 新場次才可採用 v2

- [ ] **SEF-UT-057** `Content_ImmutablePinned_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「新場次才可採用 v2」

- [ ] **SEF-UT-058** `Gate_FirstStoryOnly_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-049／SEF-AC-011`；情境：首條雨聲書店先通過人工 Gate
  - **前置／操作**：Given 僅有已完整設計的雨聲書店初始主線；When 執行首條 Web/Android 真雙人完整試玩
  - **驗證**：Then 保留書籤、合作、收尾、聊天與重玩全流程證據

- [ ] **SEF-UT-059** `Gate_FirstStoryOnly_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-049／SEF-AC-011`；情境：首條雨聲書店先通過人工 Gate
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 使用者未核准前其他九條仍不得開發

- [ ] **SEF-UT-060** `Gate_FirstStoryOnly_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-049／SEF-AC-011`；情境：首條雨聲書店先通過人工 Gate
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「使用者未核准前其他九條仍不得開發」

- [ ] **SEF-UT-061** `Boundary_MVP002NoAIGeneration_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：Given 目前運行劇情模式且 R2 僅發布人工主線；When 玩家自由輸入文字與故事互動
  - **驗證**：Then 文字按現有聊天處理而非觸發 AI 動態造主線

- [ ] **SEF-UT-062** `Boundary_MVP002NoAIGeneration_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沉浸模式獨立留待 MVP-002

- [ ] **SEF-UT-063** `Boundary_MVP002NoAIGeneration_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沉浸模式獨立留待 MVP-002」

- [ ] **SEF-UT-064** `Vote_InviterTieBreak_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：Given A 是原邀請者且兩位選擇不同；When 雙方最後有效票已提交
  - **驗證**：Then 勝出類別等於 A 最後一次有效選擇

- [ ] **SEF-UT-065** `Vote_InviterTieBreak_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不以先登入或第二位提交者的選擇決勝

- [ ] **SEF-UT-066** `Vote_InviterTieBreak_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不以先登入或第二位提交者的選擇決勝」

- [ ] **SEF-UT-067** `Vote_ModifyBeforeSettlement_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：Given A 已投第一票且 B 尚未投；When A 改票後 B 才提交
  - **驗證**：Then 系統採 A 最後有效票結算

- [ ] **SEF-UT-068** `Vote_ModifyBeforeSettlement_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 原票仍在事件序列但不影響結果

- [ ] **SEF-UT-069** `Vote_ModifyBeforeSettlement_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「原票仍在事件序列但不影響結果」

- [ ] **SEF-UT-070** `Pair_NewPartnerReset_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：Given A 與 B 完成書店，A 與 C 是不同有效配對；When 系統替 A 與 C 抽場景主線
  - **驗證**：Then A 與 B 的歷史不降低 A 與 C 的書店權重

- [ ] **SEF-UT-071** `Pair_NewPartnerReset_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不跨配對讀取另一人的私人事件

- [ ] **SEF-UT-072** `Pair_NewPartnerReset_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不跨配對讀取另一人的私人事件」

- [x] **SEF-UT-073** `Narrative_MixedEligible_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-016／SEF-AC-003`；情境：有序與無序主線混合隨機
  - **前置／操作**：Given 第二章已解鎖且同場景另有獨立主線；When 系統計算合格候選後抽選
  - **驗證**：Then 第二章與獨立主線都能參與抽選

- [x] **SEF-UT-074** `Narrative_MixedEligible_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-016／SEF-AC-003`；情境：有序與無序主線混合隨機
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有強制第二章必須先玩

- [ ] **SEF-UT-075** `Narrative_MixedEligible_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-016／SEF-AC-003`；情境：有序與無序主線混合隨機
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有強制第二章必須先玩」

- [ ] **SEF-UT-076** `Graph_MultipleEndings_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：Given 雨聲書店保留原合作互動的兩種結果；When 兩位真人提交相同或不同答案
  - **驗證**：Then 系統分別抵達對應的已發布 Ending

- [ ] **SEF-UT-077** `Graph_MultipleEndings_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不替離線另一方自動選答案

- [ ] **SEF-UT-078** `Graph_MultipleEndings_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不替離線另一方自動選答案」

- [ ] **SEF-UT-079** `Chapter_OptionalNotRequired_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：Given 主線走到 Ending 但支線及隱藏事件仍未玩；When 最後主線節點提交成功
  - **驗證**：Then StorySession completed 並封存未完成事件

- [ ] **SEF-UT-080** `Chapter_OptionalNotRequired_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 聊天仍能正常使用

- [ ] **SEF-UT-081** `Chapter_OptionalNotRequired_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「聊天仍能正常使用」

- [ ] **SEF-UT-082** `Next_OneOnly_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：只有一人同意不能偷偷開下一場
  - **前置／操作**：Given episode 1 已 completed；When 只有 A 選擇再次遊玩
  - **驗證**：Then 只記錄 A 已同意等待 B

- [ ] **SEF-UT-083** `Next_OneOnly_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：只有一人同意不能偷偷開下一場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 仍維持 completed 頁面與聊天

- [ ] **SEF-UT-084** `Next_OneOnly_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：只有一人同意不能偷偷開下一場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「仍維持 completed 頁面與聊天」

- [x] **SEF-UT-085** `Next_Withdraw_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-040／SEF-AC-008`；情境：同意可以在結算前撤回
  - **前置／操作**：Given A 已同意且 B 尚未提交；When A 撤回同意
  - **驗證**：Then 雙方同意條件不成立且不建立下一場

- [x] **SEF-UT-086** `Next_Withdraw_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-040／SEF-AC-008`；情境：同意可以在結算前撤回
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 只有最後有效同意才計算

- [ ] **SEF-UT-087** `Next_Withdraw_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-040／SEF-AC-008`；情境：同意可以在結算前撤回
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「只有最後有效同意才計算」

- [x] **SEF-UT-088** `Scene_AllPlayedFallback_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-012／SEF-AC-003`；情境：場景都已玩過仍可再抽
  - **前置／操作**：Given 同一對玩家已完成該類別全部場景；When 雙方開始下一場
  - **驗證**：Then 系統仍可從合格場景抽選

- [x] **SEF-UT-089** `Scene_AllPlayedFallback_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-012／SEF-AC-003`；情境：場景都已玩過仍可再抽
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不因已全部體驗而無限等待

- [ ] **SEF-UT-090** `Scene_AllPlayedFallback_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-012／SEF-AC-003`；情境：場景都已玩過仍可再抽
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不因已全部體驗而無限等待」

- [ ] **SEF-UT-091** `Narrative_AllCompletedFallback_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：Given 某場景所有可選主線已完成；When 雙方開始新的場次
  - **驗證**：Then 系統仍能依規則抽中已玩主線

- [ ] **SEF-UT-092** `Narrative_AllCompletedFallback_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 有序章節的前置條件仍然生效

- [ ] **SEF-UT-093** `Narrative_AllCompletedFallback_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「有序章節的前置條件仍然生效」

- [ ] **SEF-UT-094** `Event_RepeatGroup_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：Given Scene 與 Global 都提供同一 repeatGroup 的事件；When 伺服器同時發現兩個合格 Binding
  - **驗證**：Then 只建立一個語意事件執行實例

- [ ] **SEF-UT-095** `Event_RepeatGroup_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不重複扣次數或重複通知

- [ ] **SEF-UT-096** `Event_RepeatGroup_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不重複扣次數或重複通知」

- [ ] **SEF-UT-097** `Event_ConcurrentSubmit_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：Given 兩個裝置以相同版本提交單次事件；When D1 交易並發執行
  - **驗證**：Then 只有一筆完成狀態與一次完成效果

- [ ] **SEF-UT-098** `Event_ConcurrentSubmit_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 舊 revision 或不同 payload 重播回 409

- [ ] **SEF-UT-099** `Event_ConcurrentSubmit_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「舊 revision 或不同 payload 重播回 409」

- [ ] **SEF-UT-100** `Chapter_EndRace_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：Given 最後主線提交和任一方確認退出同時發生；When D1 依交易順序處理兩個操作
  - **驗證**：Then 狀態符合原子序列且 Round ended 後禁止寫入

- [ ] **SEF-UT-101** `Chapter_EndRace_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有幽靈事件或雙重結算

- [ ] **SEF-UT-102** `Chapter_EndRace_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有幽靈事件或雙重結算」

- [ ] **SEF-UT-103** `Next_DoubleAgreeRace_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：Given 兩個登入帳號同時提交且網路可能重送；When D1 競態重試及補漏
  - **驗證**：Then 只存在一個 episode 2

- [ ] **SEF-UT-104** `Next_DoubleAgreeRace_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 首場候選 JSON 與其他場次票不相互覆寫

- [ ] **SEF-UT-105** `Next_DoubleAgreeRace_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「首場候選 JSON 與其他場次票不相互覆寫」

- [ ] **SEF-UT-106** `Sequence_Monotonic_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：Given Room DO 訊息同時到達且某次廣播失敗；When D1 完成原子提交後客戶端補漏
  - **驗證**：Then 事件 sequence 單調且同 requestId 回原 receipt

- [ ] **SEF-UT-107** `Sequence_Monotonic_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能用新的 requestId 自動補發未知結果

- [ ] **SEF-UT-108** `Sequence_Monotonic_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能用新的 requestId 自動補發未知結果」

- [ ] **SEF-UT-109** `Recovery_ReconnectNoReroll_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：Given 此場已釘選場景與主線且 DO 斷線；When Web 或 Android 重啟並重建連線
  - **驗證**：Then 以同一固定 ID 與 revision 恢復

- [ ] **SEF-UT-110** `Recovery_ReconnectNoReroll_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不更動場景、票、事件結果與版本

- [ ] **SEF-UT-111** `Recovery_ReconnectNoReroll_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不更動場景、票、事件結果與版本」

- [ ] **SEF-UT-112** `Boundary_SingleSceneVisit_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：Given 同一 StorySession 已有一個 SceneVisit；When Client 要求直接換第二場景
  - **驗證**：Then 系統拒絕這次遊玩跨場景

- [ ] **SEF-UT-113** `Boundary_SingleSceneVisit_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 資料模型仍可供未來沉浸模式多場景擴充

- [ ] **SEF-UT-114** `Boundary_SingleSceneVisit_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「資料模型仍可供未來沉浸模式多場景擴充」

- [ ] **SEF-UT-115** `Recommend_NoPlayableCategory_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：Given 已發布類別無任何可玩主線；When 玩家接受配對邀請
  - **驗證**：Then 系統返回 NO_PLAYABLE_STORY 並保持邀請與配對資料一致

- [ ] **SEF-UT-116** `Recommend_NoPlayableCategory_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有新增 game_rounds 或假測試故事

- [ ] **SEF-UT-117** `Recommend_NoPlayableCategory_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有新增 game_rounds 或假測試故事」

- [ ] **SEF-UT-118** `Vote_InvalidOrLeaked_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：Given 兩位已取得固定候選而對方尚未投票；When 第三人提交票或讀取對方原始票
  - **驗證**：Then 服務拒絕越權並只提供 partnerHasVoted 狀態

- [ ] **SEF-UT-119** `Vote_InvalidOrLeaked_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不得洩漏私有興趣及未決議 categoryId

- [ ] **SEF-UT-120** `Vote_InvalidOrLeaked_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不得洩漏私有興趣及未決議 categoryId」

- [ ] **SEF-UT-121** `Scene_InvalidRelation_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：Given 關聯指向不存在或 retired 的場景版本；When 內容發布工具驗證
  - **驗證**：Then 拒絕發布且原已發布索引不受影響

- [ ] **SEF-UT-122** `Scene_InvalidRelation_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不產生沒有可玩主線的候選類別

- [ ] **SEF-UT-123** `Scene_InvalidRelation_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不產生沒有可玩主線的候選類別」

- [ ] **SEF-UT-124** `Narrative_PrerequisiteForgery_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：Given 第三章尚未解鎖且客戶端知道其 ID；When 客戶端偽造選中的 narrativeId
  - **驗證**：Then 伺服器拒絕並保持現有場次不變

- [ ] **SEF-UT-125** `Narrative_PrerequisiteForgery_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不得寫入非法選中事件

- [ ] **SEF-UT-126** `Narrative_PrerequisiteForgery_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不得寫入非法選中事件」

- [ ] **SEF-UT-127** `Graph_UnreachableEnding_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：Given 主線節點循環且找不到可達 Ending；When 內容發布工具驗證
  - **驗證**：Then 拒絕成為 published 完整主線

- [ ] **SEF-UT-128** `Graph_UnreachableEnding_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不把其算入十條驗收數量

- [ ] **SEF-UT-129** `Graph_UnreachableEnding_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不把其算入十條驗收數量」

- [ ] **SEF-UT-130** `Event_SceneCapability_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：Given 全域事件需要書架能力但所在場景沒有書架；When 觸發引擎計算候選
  - **驗證**：Then 排除該全域事件

- [ ] **SEF-UT-131** `Event_SceneCapability_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不因標記 global 就無條件可用

- [ ] **SEF-UT-132** `Event_SceneCapability_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不因標記 global 就無條件可用」

- [ ] **SEF-UT-133** `Event_UnsupportedRenderer_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：Given EventDefinition 使用前端未實作的 moduleType；When 內容發布工具驗證
  - **驗證**：Then 拒絕 published 並指出不支援的玩法

- [ ] **SEF-UT-134** `Event_UnsupportedRenderer_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不生成只有點擊外觀的空白互動

- [ ] **SEF-UT-135** `Event_UnsupportedRenderer_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不生成只有點擊外觀的空白互動」

- [ ] **SEF-UT-136** `Event_InvalidDependency_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：Given 事件 A 需要尚未完成的 B 或定義互相循環；When 發布或觸發事件
  - **驗證**：Then 發布前拒絕循環，遊玩時拒絕未解鎖事件

- [ ] **SEF-UT-137** `Event_InvalidDependency_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不修改任何已完成事件狀態

- [ ] **SEF-UT-138** `Event_InvalidDependency_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不修改任何已完成事件狀態」

- [ ] **SEF-UT-139** `Chapter_RejectOldOptional_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：Given StorySession 已完成且尚有未完成書籤事件；When 客戶端送出舊場次事件操作
  - **驗證**：Then 返回 EVENT_STATE_CONFLICT 且無新事件紀錄

- [ ] **SEF-UT-140** `Chapter_RejectOldOptional_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 下一次有效重玩才能再次探索

- [ ] **SEF-UT-141** `Chapter_RejectOldOptional_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「下一次有效重玩才能再次探索」

- [ ] **SEF-UT-142** `Next_OldEpisodeReplay_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：Given 最新是 episode 3，客戶端仍帶 completedEpisodeSeq=1；When 再次提交舊場同意
  - **驗證**：Then 伺服器拒絕過期場次操作

- [ ] **SEF-UT-143** `Next_OldEpisodeReplay_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不跨場使用舊選票或同意

- [ ] **SEF-UT-144** `Next_OldEpisodeReplay_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不跨場使用舊選票或同意」

- [ ] **SEF-UT-145** `Auth_ThirdPartyAndRevoked_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：Given 第三人知道 roundId 或原成員 session 被撤銷；When 呼叫投票、下一場、事件及訊息 API
  - **驗證**：Then 全部 fail-closed 不寫入資料

- [ ] **SEF-UT-146** `Auth_ThirdPartyAndRevoked_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 只回安全錯誤而非真實玩家資料

- [ ] **SEF-UT-147** `Auth_ThirdPartyAndRevoked_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「只回安全錯誤而非真實玩家資料」

- [ ] **SEF-UT-148** `Content_R2Corrupt_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：Given 內容目錄存在但 Manifest 缺失或雜湊不符；When 伺服器驗證／準備下一場
  - **驗證**：Then 拒絕進場並維持可恢復的狀態

- [ ] **SEF-UT-149** `Content_R2Corrupt_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不可提交半套 StorySession 或重新擲骰

- [ ] **SEF-UT-150** `Content_R2Corrupt_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不可提交半套 StorySession 或重新擲骰」

- [ ] **SEF-UT-151** `Content_InvalidManifest_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：Given Scene、Narrative、EventPool 之間引用版本不存在；When 發布工具驗證
  - **驗證**：Then 拒絕發佈並指出具體引用缺失

- [ ] **SEF-UT-152** `Content_InvalidManifest_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 舊版已發布內容不被改寫

- [ ] **SEF-UT-153** `Content_InvalidManifest_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「舊版已發布內容不被改寫」

### 建議測試檔：`frontend/client/tests/unit/scene-event-framework.test.tsx`

- [ ] **SEF-UT-154** `Gate_CannotCountFixtures_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：Given 系統只有一條完整主線與九張場景圖片或測試 fixtures；When 執行 MVP 完整度稽核
  - **驗證**：Then 只能計一條完整可玩主線

- [ ] **SEF-UT-155** `Gate_CannotCountFixtures_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能因有分支／多種結局加算條數

- [ ] **SEF-UT-156** `Gate_CannotCountFixtures_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能因有分支／多種結局加算條數」

- [ ] **SEF-UT-157** `UI_OfferCount_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：Given 有效 Round 有一類別或二至三類別；When 玩家進入劇情頁
  - **驗證**：Then 唯一類別直接進場，多類別才顯示投票卡

- [ ] **SEF-UT-158** `UI_OfferCount_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 投票前不顯示對方選中的類別

- [ ] **SEF-UT-159** `UI_OfferCount_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「投票前不顯示對方選中的類別」

- [ ] **SEF-UT-160** `UI_VoteWaiting_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：Given A 已投票且 B 暫時離線；When A 切換聊天再返回劇情入口
  - **驗證**：Then 保留本人票並顯示正在等待另一位玩家

- [ ] **SEF-UT-161** `UI_VoteWaiting_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有假選票、倒數替他選或超時決議

- [ ] **SEF-UT-162** `UI_VoteWaiting_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有假選票、倒數替他選或超時決議」

- [ ] **SEF-UT-163** `UI_HiddenEvent_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：Given 未達書店隱藏書籤事件條件；When 玩家打開場景與事件列表
  - **驗證**：Then 不顯示隱藏事件標題與答案

- [ ] **SEF-UT-164** `UI_HiddenEvent_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 符合條件並真正觸發才展示

- [ ] **SEF-UT-165** `UI_HiddenEvent_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「符合條件並真正觸發才展示」

- [ ] **SEF-UT-166** `UI_InteractionFeedback_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：Given 雙人合作互動需要兩人各自選擇；When A 提交自己的選項
  - **驗證**：Then 畫面顯示送出中、成功後等待對方

- [ ] **SEF-UT-167** `UI_InteractionFeedback_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能代替 B 作答或將 ACK 當成對方已讀

- [ ] **SEF-UT-168** `UI_InteractionFeedback_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能代替 B 作答或將 ACK 當成對方已讀」

- [ ] **SEF-UT-169** `UI_ChapterCompleted_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：Given 主線抵達 Ending；When 畫面接收到已提交完成事件
  - **驗證**：Then 顯示本次劇情完成但聊天室仍可使用

- [ ] **SEF-UT-170** `UI_ChapterCompleted_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 未完成事件不可再操作也無完成劇情按鈕

- [ ] **SEF-UT-171** `UI_ChapterCompleted_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「未完成事件不可再操作也無完成劇情按鈕」

- [ ] **SEF-UT-172** `UI_NextAgree_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：Given 劇情已完成而只有 A 想再玩；When A 點擊再次遊玩
  - **驗證**：Then 顯示我已同意、等待另一位玩家

- [ ] **SEF-UT-173** `UI_NextAgree_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And B 拒絕或離線時保持聊天與 completed 狀態

- [ ] **SEF-UT-174** `UI_NextAgree_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「B 拒絕或離線時保持聊天與 completed 狀態」

- [ ] **SEF-UT-175** `UI_NextDuplicateClick_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：Given A 已按同意且網路回應尚未到達；When A 再次點擊同意
  - **驗證**：Then 控制項維持提交中而不產生第二個 requestId

- [ ] **SEF-UT-176** `UI_NextDuplicateClick_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 收到 receipt 後恢復正確狀態

- [ ] **SEF-UT-177** `UI_NextDuplicateClick_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「收到 receipt 後恢復正確狀態」

- [ ] **SEF-UT-178** `UI_OfflineRecovery_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：Given 玩家完成投票後斷線且 Server 已提交但 ACK 失聯；When 重新連線並取得快照及游標增量
  - **驗證**：Then 依 D1 恢復原場景、主線與事件結果

- [ ] **SEF-UT-179** `UI_OfflineRecovery_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不重抽、不重送不同 requestId

- [ ] **SEF-UT-180** `UI_OfflineRecovery_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不重抽、不重送不同 requestId」

- [ ] **SEF-UT-181** `UI_ContentFailure_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：Given 已抽選場景的 R2 Manifest 暫時無法讀取；When 玩家重新開啟劇情頁
  - **驗證**：Then 顯示無法載入劇情內容且提供重試載入

- [ ] **SEF-UT-182** `UI_ContentFailure_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不顯示假故事或換另一個場景

- [ ] **SEF-UT-183** `UI_ContentFailure_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不顯示假故事或換另一個場景」

- [ ] **SEF-UT-184** `UI_BothPlatformsGate_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：Given A 用 Web、B 用 Android 遊玩首場雨聲書店；When 兩端完成書籤與雙人合作並進入收尾
  - **驗證**：Then 兩端依真 D1 顯示相同結果與 next 按鈕狀態

- [ ] **SEF-UT-185** `UI_BothPlatformsGate_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 原 B1 五表情及全身 POV 驗收獨立保留

- [ ] **SEF-UT-186** `UI_BothPlatformsGate_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「原 B1 五表情及全身 POV 驗收獨立保留」

- [ ] **SEF-UT-187** `UI_EndConfirmation_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：Given 劇情已完成且兩人仍在聊天；When 一人點擊結束本輪互動
  - **驗證**：Then 先提示原 pair 永久不再互配並要求確認

- [ ] **SEF-UT-188** `UI_EndConfirmation_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 取消不結束且不影響下一場同意

- [ ] **SEF-UT-189** `UI_EndConfirmation_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「取消不結束且不影響下一場同意」

### Unit 稽核補充（2026-11-12，風險確認後新增）

**預定測試檔**：`backend/tests/DatingHigh.Unit.Tests/Application/SceneEventFrameworkPolicyTests.cs`。各項狀態依 checklist 與驗證紀錄；與原測試清單並存，不重建舊 ID。

- [x] **SEF-UT-190** `SelectNarrative_SelectedCategory_MatchesEligibleCodes`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A／SEF-GAP-01`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：所選 Category.code 僅允許具有相符 eligibleCategoryCodes 的主線進入候選，拒絕純其他類別內容

- [x] **SEF-UT-191** `SelectNarrative_MultipleEligibleCodes_AllowsMultipleCategories`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：同一主線可聲明浪漫＋懸疑兩碼，在任一類別均合法

- [ ] **SEF-UT-192** `SelectNarrative_CategoryMismatch_ReturnsNoCandidate`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：選懸疑但主線白名單只有浪漫時候選為空，RNG 不可抽到這條主線

- [ ] **SEF-UT-193** `FreezeNextCategory_UsesLatestPersistedInterests`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：第二位玩家同意成功提交時，依兩位最新已儲存興趣計算類別候選

- [ ] **SEF-UT-194** `FreezeNextCategory_ChangesAfterFreeze_DoNotRecalculate`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：凍結後再修改興趣，不更動已提交的 categoryIds 或舊場次

- [ ] **SEF-UT-195** `FreezeNextCategory_SamePersistedSnapshotForBothPlayers`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：雙端讀取同一份伺服器快照，不允許客戶端各自重新排名

- [x] **SEF-UT-196** `RecommendCategory_NoEligibleNarrative_ExcludesCategory`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：類別只連到場景但沒有適用主線時，不可進入正式類別候選

- [ ] **SEF-UT-197** `RecommendCategory_SceneCategoryWithoutNarrative_IsNotPlayable`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：空主線、未解鎖或已退休 Narrative 不可讓 Scene 被誤判可玩

- [ ] **SEF-UT-198** `RecommendCategory_AllInvalid_NoPlayableStory`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：沒有任何可選類別時回 NO_PLAYABLE_STORY，不建立空 Round/Episode

- [ ] **SEF-UT-199** `SelectNarrative_CategoryMismatch_RejectsCandidate`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`SEF-GAP-01`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：同場景多類別但某條主線不相符時，Publisher／SelectionPolicy 都拒絕選入

### Unit：2026-11-13 跨 SPEC 人物／2.5D 整合補強（36 項，待實作）

預定入口：`backend/tests/DatingHigh.Unit.Tests/Application/SceneEventFrameworkPolicyTests.cs`、`frontend/client/tests/unit/scene-event-framework.test.tsx`，依實作位置選擇。測試名稱為規劃，**非已存在的方法**。

- [ ] **SEF-UT-200** `Scene_Presentation_Preserved__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：相同鏡位、光色、遮擋、熱區座標與合法聲音 cue 在 Web／Android 保持一致

- [ ] **SEF-UT-201** `Scene_Presentation_Preserved__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：靜態 Scene 的鏡位與背景不因換主線而遺失或重繪免費角色

- [ ] **SEF-UT-202** `Scene_Presentation_Preserved__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-203** `Event_Presentation_Overlay_ReturnsToNode__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：角色依已提交事件結果演出表情與鏡頭，事件完成後恢復節點基底呈現

- [ ] **SEF-UT-204** `Event_Presentation_Overlay_ReturnsToNode__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：演出不偷偷修改主線 currentNode 或額外觸發選擇與 Gemini

- [ ] **SEF-UT-205** `Event_Presentation_Overlay_ReturnsToNode__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-206** `Event_Presentation_InvalidReference_Rejected__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：拒絕發布並指出無效引用

- [ ] **SEF-UT-207** `Event_Presentation_InvalidReference_Rejected__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：保留原已發布可玩版本，不建立新資料表或任意外部資產請求

- [ ] **SEF-UT-208** `Event_Presentation_InvalidReference_Rejected__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-209** `Hotspot_AuthoritativeVisibility_PreviewNoCommit__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：未解鎖時看不到隱藏入口，解鎖後可以檢視但取消不寫入完成事件

- [ ] **SEF-UT-210** `Hotspot_AuthoritativeVisibility_PreviewNoCommit__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：伺服器再次驗證資格，不能從靜態 Manifest 取得隱藏答案

- [ ] **SEF-UT-211** `Hotspot_AuthoritativeVisibility_PreviewNoCommit__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-212** `Avatar_SafeSwap_IndependentOfNarrative__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：五張表情完整解碼並在台詞安全句尾整組換角

- [ ] **SEF-UT-213** `Avatar_SafeSwap_IndependentOfNarrative__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：storySessionId、currentNode、progressRevision、聊天與事件選擇不變

- [ ] **SEF-UT-214** `Avatar_SafeSwap_IndependentOfNarrative__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-215** `Avatar_NotReadyOrFailed_NoGeneration__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：繼續顯示舊完整角色或安全佔位，並可持續劇情及聊天

- [ ] **SEF-UT-216** `Avatar_NotReadyOrFailed_NoGeneration__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：不顯示新舊表情混包、不觸發 Gemini／next／採用 API、不自動續產

- [ ] **SEF-UT-217** `Avatar_NotReadyOrFailed_NoGeneration__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-218** `Episode_ResetOnlyStage_PreserveRound__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：台詞逐字動畫、鏡頭、音訊 cue、事件覆寫、對話視窗與舊 pending 動作均從新場次正確初始化

- [ ] **SEF-UT-219** `Episode_ResetOnlyStage_PreserveRound__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：舊聊天、Room 連線、目前角色以及第一場歷史不重建或消失

- [ ] **SEF-UT-220** `Episode_ResetOnlyStage_PreserveRound__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-221** `App_BackgroundResume_NoRerollOrGeneration__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：從快照與游標補漏恢復相同場次、熱區與對方人物，微動／音訊保持安全暫停策略

- [ ] **SEF-UT-222** `App_BackgroundResume_NoRerollOrGeneration__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：沒有重新抽籤、重送未知 action、音效自動播放或 B1 自動續產

- [ ] **SEF-UT-223** `App_BackgroundResume_NoRerollOrGeneration__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-224** `Avatar_RevokedOrStaleResponse_PurgesPrivate__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：舊 private Avatar 圖片與授權投影被清除且不顯示

- [ ] **SEF-UT-225** `Avatar_RevokedOrStaleResponse_PurgesPrivate__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：不同 round 的訊息、stage 素材與角色不能交叉污染

- [ ] **SEF-UT-226** `Avatar_RevokedOrStaleResponse_PurgesPrivate__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-227** `Chapter_Completed_StageAndChatStillVisible__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-076／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：雙方仍能看到本場收尾及聊天，支線入口變為不可操作

- [x] **SEF-UT-228** `Chapter_Completed_StageAndChatStillVisible__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-076／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：不因 phase 不再 playing 而卸載整個 ADV，也不出現多餘完成劇情按鈕

- [ ] **SEF-UT-229** `Chapter_Completed_StageAndChatStillVisible__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-076／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-230** `Scene_MotionAndAssetReuse_PerformanceEvidence__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：關閉時不啟動裝飾動畫，鏡位、角色與熱區仍能操作，圖片按版本重用

- [ ] **SEF-UT-231** `Scene_MotionAndAssetReuse_PerformanceEvidence__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：保存實際記憶體與切換延遲或 jank 的驗證證據，不宣稱未量測的 FPS

- [ ] **SEF-UT-232** `Scene_MotionAndAssetReuse_PerformanceEvidence__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [ ] **SEF-UT-233** `FirstStory_CrossSpec_ManualGate__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-078／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：最新 StoryDialogueAndExit UX-P1～P5、B1、全身角色與 SceneEventFramework 整合均有明確證據且人工 Gate B 尚須本人驗收

- [ ] **SEF-UT-234** `FirstStory_CrossSpec_ManualGate__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-078／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：未經使用者明確核准不能開始其餘九條，既有技術回放不能冒充真人人工通過

- [ ] **SEF-UT-235** `FirstStory_CrossSpec_ManualGate__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-078／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

## 2️⃣ 集成測試（Integration Tests）

### 建議測試檔：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`

- [x] **SEF-IT-001** `Recommend_OneCategory_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雙方配對成功且只有浪漫類別具有可玩主線；受邀方接受邀請
  - **驗證**：提交後 query/snapshot 確認「伺服器直接選中浪漫類別並抽場景主線」並保持「沒有偽造投票，也沒有出現選類別畫面」；錯誤必須完整 rollback

- [ ] **SEF-IT-002** `Recommend_TwoCategories_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：浪漫與懸疑兩類別皆有可玩主線；A 與 B 各提交有效類別票
  - **驗證**：提交後 query/snapshot 確認「兩票決議後只形成一筆最新場次」並保持「決議前不顯示對方所選類別」；錯誤必須完整 rollback

- [ ] **SEF-IT-003** `Recommend_ThreePlusCategories_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：四類別皆有可玩主線且雙方興趣不同；配對成立並取得候選
  - **驗證**：提交後 query/snapshot 確認「按雙方均衡推薦排序凍結前三個 Category ID」並保持「候選順序兩端一致且不因重新整理改變」；錯誤必須完整 rollback

- [ ] **SEF-IT-004** `Scene_MultiCategory_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雨聲書店同時對應浪漫與懸疑；兩個類別分別被選中
  - **驗證**：提交後 query/snapshot 確認「都能找到同一已發布場景且引用正確版本」並保持「類別不是 Profile 的 reading 興趣欄位」；錯誤必須完整 rollback

- [ ] **SEF-IT-005** `Narrative_MultiPerScene_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雨聲書店綁定尋書與夜雨約定兩條主線；查詢同場景合格主線
  - **驗證**：提交後 query/snapshot 確認「兩條主線均可在同一場景被選中」並保持「不同主線的 entry 與內容版本互不混淆」；錯誤必須完整 rollback

- [ ] **SEF-IT-006** `Scene_WeightThreeToOne_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-011／SEF-AC-003`；情境：新場景抽選權重為三比一
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：一個未玩場景與一個已玩場景均合格；伺服器在可注入 RNG 下重複抽選
  - **驗證**：提交後 query/snapshot 確認「未玩過場景的選中權重是已玩過的三倍」並保持「並非硬性排除已玩場景」；錯誤必須完整 rollback

- [ ] **SEF-IT-007** `Narrative_UnorderedWeighted_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一場景存在已玩與未玩無序主線；抽選主線
  - **驗證**：提交後 query/snapshot 確認「未玩者取得較高但非唯一機率」並保持「相同隨機種子可重現測試結果」；錯誤必須完整 rollback

- [ ] **SEF-IT-008** `Narrative_OrderedUnlock_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-015／SEF-AC-003`；情境：有序主線不可跳章
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第二章需要第一章完成且第三章未解鎖；抽選有序主線
  - **驗證**：提交後 query/snapshot 確認「只能從目前符合前置條件的章節選擇」並保持「不能因權重偏好直接選第三章」；錯誤必須完整 rollback

- [ ] **SEF-IT-009** `Graph_OneEnding_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：線性主線一個結局即可發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：線性主線只有一個可達 Ending 且有完整開場推進；發布工具驗證並進行遊玩
  - **驗證**：提交後 query/snapshot 確認「內容合法且能抵達唯一結尾」並保持「不再要求至少兩個 Ending 或固定四節點」；錯誤必須完整 rollback

- [ ] **SEF-IT-010** `Graph_BranchRejoin_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：兩個不同選項通往不同線索後合流；玩家選擇其中一項
  - **驗證**：提交後 query/snapshot 確認「只有所選分支的事件結果寫入進度」並保持「其餘共用主線可正常繼續」；錯誤必須完整 rollback

- [ ] **SEF-IT-011** `Event_RoleByBinding_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：書籤事件被兩條主線引用；內容發布並啟動兩條主線
  - **驗證**：提交後 query/snapshot 確認「第一條定義為支線，第二條可定義為主線」並保持「EventDefinition ID 與玩法版本保持相同」；錯誤必須完整 rollback

- [ ] **SEF-IT-012** `Event_HiddenRandomConditional_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：事件有 visibility=hidden、weighted_random 和完成找線索前置；符合條件後抽中此事件
  - **驗證**：提交後 query/snapshot 確認「系統只在成功觸發時向合格玩家揭露」並保持「三個維度彼此不互斥」；錯誤必須完整 rollback

- [ ] **SEF-IT-013** `Event_ThreeSourcePools_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：主線場景全域事件池可共存
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：書店存在主線綁定、場景綁定與相容全域綁定；伺服器彙整候選事件
  - **驗證**：提交後 query/snapshot 確認「三來源依限定 Binding ID 合併並過濾相容性」並保持「主線必要事件不被全域自由事件搶占」；錯誤必須完整 rollback

- [ ] **SEF-IT-014** `Event_PlaythroughScope_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-028／SEF-AC-006`；情境：事件僅在本次遊玩不重複
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一 Binding 已於 episode 1 完成且 repeatScope=playthrough；雙方同意開始 episode 2 並符合觸發條件
  - **驗證**：提交後 query/snapshot 確認「episode 2 可重新觸發這個事件」並保持「episode 1 仍無法重複建立相同 Binding instance」；錯誤必須完整 rollback

- [ ] **SEF-IT-015** `Event_RoundScope_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-029／SEF-AC-006`；情境：整輪配對範圍限制事件重複
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：事件在 episode 1 完成且 repeatScope=round；同一 Round 的 episode 2 再符合觸發
  - **驗證**：提交後 query/snapshot 確認「該事件不會再次觸發」並保持「更換配對組合可以在新的 Round 重新體驗」；錯誤必須完整 rollback

- [ ] **SEF-IT-016** `Event_OutcomeChangesNarrative_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：隱藏信件事件的結果旗標已合法提交；主線到達會檢查結果的節點
  - **驗證**：提交後 query/snapshot 確認「依旗標決定後續可用的分支或回應」並保持「未完成事件不能偽造結果」；錯誤必須完整 rollback

- [x] **SEF-IT-017** `Chapter_AutoComplete_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：主線與必要事件均已滿足 Ending 條件；真人提交到 Ending 的最後操作
  - **驗證**：提交後 query/snapshot 確認「該 StorySession 同筆交易更新為 completed」並保持「不顯示額外完成按鈕也不把 Round ended」；錯誤必須完整 rollback

- [x] **SEF-IT-018** `Next_BothAgree_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：episode 1 已 completed 且 Round active；A 與 B 各自提交同意
  - **驗證**：提交後 query/snapshot 確認「系統恰好建立 episode 2 的候選或直接進場」並保持「舊 episode 1 保持 completed 且聊天不斷」；錯誤必須完整 rollback

- [x] **SEF-IT-019** `Content_ImmutablePinned_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：玩家使用 v1 的 R2 bundle，發布者已發布 v2；玩家重連並繼續本場
  - **驗證**：提交後 query/snapshot 確認「仍取回 v1 及其全部依賴的 Scene/Event 版本」並保持「新場次才可採用 v2」；錯誤必須完整 rollback

- [ ] **SEF-IT-020** `Gate_FirstStoryOnly_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-049／SEF-AC-011`；情境：首條雨聲書店先通過人工 Gate
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：僅有已完整設計的雨聲書店初始主線；執行首條 Web/Android 真雙人完整試玩
  - **驗證**：提交後 query/snapshot 確認「保留書籤、合作、收尾、聊天與重玩全流程證據」並保持「使用者未核准前其他九條仍不得開發」；錯誤必須完整 rollback

- [ ] **SEF-IT-021** `Boundary_MVP002NoAIGeneration_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：目前運行劇情模式且 R2 僅發布人工主線；玩家自由輸入文字與故事互動
  - **驗證**：提交後 query/snapshot 確認「文字按現有聊天處理而非觸發 AI 動態造主線」並保持「沉浸模式獨立留待 MVP-002」；錯誤必須完整 rollback

- [x] **SEF-IT-022** `Vote_InviterTieBreak_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：A 是原邀請者且兩位選擇不同；雙方最後有效票已提交
  - **驗證**：提交後 query/snapshot 確認「勝出類別等於 A 最後一次有效選擇」並保持「不以先登入或第二位提交者的選擇決勝」；錯誤必須完整 rollback

- [x] **SEF-IT-023** `Vote_ModifyBeforeSettlement_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：A 已投第一票且 B 尚未投；A 改票後 B 才提交
  - **驗證**：提交後 query/snapshot 確認「系統採 A 最後有效票結算」並保持「原票仍在事件序列但不影響結果」；錯誤必須完整 rollback

- [ ] **SEF-IT-024** `Pair_NewPartnerReset_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：A 與 B 完成書店，A 與 C 是不同有效配對；系統替 A 與 C 抽場景主線
  - **驗證**：提交後 query/snapshot 確認「A 與 B 的歷史不降低 A 與 C 的書店權重」並保持「不跨配對讀取另一人的私人事件」；錯誤必須完整 rollback

- [ ] **SEF-IT-025** `Narrative_MixedEligible_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-016／SEF-AC-003`；情境：有序與無序主線混合隨機
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第二章已解鎖且同場景另有獨立主線；系統計算合格候選後抽選
  - **驗證**：提交後 query/snapshot 確認「第二章與獨立主線都能參與抽選」並保持「沒有強制第二章必須先玩」；錯誤必須完整 rollback

- [ ] **SEF-IT-026** `Graph_MultipleEndings_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雨聲書店保留原合作互動的兩種結果；兩位真人提交相同或不同答案
  - **驗證**：提交後 query/snapshot 確認「系統分別抵達對應的已發布 Ending」並保持「不替離線另一方自動選答案」；錯誤必須完整 rollback

- [ ] **SEF-IT-027** `Chapter_OptionalNotRequired_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：主線走到 Ending 但支線及隱藏事件仍未玩；最後主線節點提交成功
  - **驗證**：提交後 query/snapshot 確認「StorySession completed 並封存未完成事件」並保持「聊天仍能正常使用」；錯誤必須完整 rollback

- [x] **SEF-IT-028** `Next_OneOnly_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：只有一人同意不能偷偷開下一場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：episode 1 已 completed；只有 A 選擇再次遊玩
  - **驗證**：提交後 query/snapshot 確認「只記錄 A 已同意等待 B」並保持「仍維持 completed 頁面與聊天」；錯誤必須完整 rollback

- [x] **SEF-IT-029** `Next_Withdraw_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-040／SEF-AC-008`；情境：同意可以在結算前撤回
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：A 已同意且 B 尚未提交；A 撤回同意
  - **驗證**：提交後 query/snapshot 確認「雙方同意條件不成立且不建立下一場」並保持「只有最後有效同意才計算」；錯誤必須完整 rollback

- [ ] **SEF-IT-030** `Scene_AllPlayedFallback_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-012／SEF-AC-003`；情境：場景都已玩過仍可再抽
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一對玩家已完成該類別全部場景；雙方開始下一場
  - **驗證**：提交後 query/snapshot 確認「系統仍可從合格場景抽選」並保持「不因已全部體驗而無限等待」；錯誤必須完整 rollback

- [ ] **SEF-IT-031** `Narrative_AllCompletedFallback_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：某場景所有可選主線已完成；雙方開始新的場次
  - **驗證**：提交後 query/snapshot 確認「系統仍能依規則抽中已玩主線」並保持「有序章節的前置條件仍然生效」；錯誤必須完整 rollback

- [ ] **SEF-IT-032** `Event_RepeatGroup_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：Scene 與 Global 都提供同一 repeatGroup 的事件；伺服器同時發現兩個合格 Binding
  - **驗證**：提交後 query/snapshot 確認「只建立一個語意事件執行實例」並保持「不重複扣次數或重複通知」；錯誤必須完整 rollback

- [ ] **SEF-IT-033** `Event_ConcurrentSubmit_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：兩個裝置以相同版本提交單次事件；D1 交易並發執行
  - **驗證**：提交後 query/snapshot 確認「只有一筆完成狀態與一次完成效果」並保持「舊 revision 或不同 payload 重播回 409」；錯誤必須完整 rollback

- [x] **SEF-IT-034** `Chapter_EndRace_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：最後主線提交和任一方確認退出同時發生；D1 依交易順序處理兩個操作
  - **驗證**：提交後 query/snapshot 確認「狀態符合原子序列且 Round ended 後禁止寫入」並保持「沒有幽靈事件或雙重結算」；錯誤必須完整 rollback

- [x] **SEF-IT-035** `Next_DoubleAgreeRace_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：兩個登入帳號同時提交且網路可能重送；D1 競態重試及補漏
  - **驗證**：提交後 query/snapshot 確認「只存在一個 episode 2」並保持「首場候選 JSON 與其他場次票不相互覆寫」；錯誤必須完整 rollback

- [ ] **SEF-IT-036** `Sequence_Monotonic_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：Room DO 訊息同時到達且某次廣播失敗；D1 完成原子提交後客戶端補漏
  - **驗證**：提交後 query/snapshot 確認「事件 sequence 單調且同 requestId 回原 receipt」並保持「不能用新的 requestId 自動補發未知結果」；錯誤必須完整 rollback

- [ ] **SEF-IT-037** `Recovery_ReconnectNoReroll_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：此場已釘選場景與主線且 DO 斷線；Web 或 Android 重啟並重建連線
  - **驗證**：提交後 query/snapshot 確認「以同一固定 ID 與 revision 恢復」並保持「不更動場景、票、事件結果與版本」；錯誤必須完整 rollback

- [ ] **SEF-IT-038** `Boundary_SingleSceneVisit_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一 StorySession 已有一個 SceneVisit；Client 要求直接換第二場景
  - **驗證**：提交後 query/snapshot 確認「系統拒絕這次遊玩跨場景」並保持「資料模型仍可供未來沉浸模式多場景擴充」；錯誤必須完整 rollback

- [x] **SEF-IT-039** `Recommend_NoPlayableCategory_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：已發布類別無任何可玩主線；玩家接受配對邀請
  - **驗證**：提交後 query/snapshot 確認「系統返回 NO_PLAYABLE_STORY 並保持邀請與配對資料一致」並保持「沒有新增 game_rounds 或假測試故事」；錯誤必須完整 rollback

- [ ] **SEF-IT-040** `Vote_InvalidOrLeaked_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：兩位已取得固定候選而對方尚未投票；第三人提交票或讀取對方原始票
  - **驗證**：提交後 query/snapshot 確認「服務拒絕越權並只提供 partnerHasVoted 狀態」並保持「不得洩漏私有興趣及未決議 categoryId」；錯誤必須完整 rollback

- [ ] **SEF-IT-041** `Scene_InvalidRelation_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：關聯指向不存在或 retired 的場景版本；內容發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕發布且原已發布索引不受影響」並保持「不產生沒有可玩主線的候選類別」；錯誤必須完整 rollback

- [ ] **SEF-IT-042** `Narrative_PrerequisiteForgery_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第三章尚未解鎖且客戶端知道其 ID；客戶端偽造選中的 narrativeId
  - **驗證**：提交後 query/snapshot 確認「伺服器拒絕並保持現有場次不變」並保持「不得寫入非法選中事件」；錯誤必須完整 rollback

- [ ] **SEF-IT-043** `Graph_UnreachableEnding_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：主線節點循環且找不到可達 Ending；內容發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕成為 published 完整主線」並保持「不把其算入十條驗收數量」；錯誤必須完整 rollback

- [ ] **SEF-IT-044** `Event_SceneCapability_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：全域事件需要書架能力但所在場景沒有書架；觸發引擎計算候選
  - **驗證**：提交後 query/snapshot 確認「排除該全域事件」並保持「不因標記 global 就無條件可用」；錯誤必須完整 rollback

- [ ] **SEF-IT-045** `Event_UnsupportedRenderer_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：EventDefinition 使用前端未實作的 moduleType；內容發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕 published 並指出不支援的玩法」並保持「不生成只有點擊外觀的空白互動」；錯誤必須完整 rollback

- [ ] **SEF-IT-046** `Event_InvalidDependency_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：事件 A 需要尚未完成的 B 或定義互相循環；發布或觸發事件
  - **驗證**：提交後 query/snapshot 確認「發布前拒絕循環，遊玩時拒絕未解鎖事件」並保持「不修改任何已完成事件狀態」；錯誤必須完整 rollback

- [ ] **SEF-IT-047** `Chapter_RejectOldOptional_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：StorySession 已完成且尚有未完成書籤事件；客戶端送出舊場次事件操作
  - **驗證**：提交後 query/snapshot 確認「返回 EVENT_STATE_CONFLICT 且無新事件紀錄」並保持「下一次有效重玩才能再次探索」；錯誤必須完整 rollback

- [ ] **SEF-IT-048** `Next_OldEpisodeReplay_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：最新是 episode 3，客戶端仍帶 completedEpisodeSeq=1；再次提交舊場同意
  - **驗證**：提交後 query/snapshot 確認「伺服器拒絕過期場次操作」並保持「不跨場使用舊選票或同意」；錯誤必須完整 rollback

- [ ] **SEF-IT-049** `Auth_ThirdPartyAndRevoked_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第三人知道 roundId 或原成員 session 被撤銷；呼叫投票、下一場、事件及訊息 API
  - **驗證**：提交後 query/snapshot 確認「全部 fail-closed 不寫入資料」並保持「只回安全錯誤而非真實玩家資料」；錯誤必須完整 rollback

- [ ] **SEF-IT-050** `Content_R2Corrupt_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：內容目錄存在但 Manifest 缺失或雜湊不符；伺服器驗證／準備下一場
  - **驗證**：提交後 query/snapshot 確認「拒絕進場並維持可恢復的狀態」並保持「不可提交半套 StorySession 或重新擲骰」；錯誤必須完整 rollback

- [ ] **SEF-IT-051** `Content_InvalidManifest_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：Scene、Narrative、EventPool 之間引用版本不存在；發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕發佈並指出具體引用缺失」並保持「舊版已發布內容不被改寫」；錯誤必須完整 rollback

- [x] **SEF-IT-052** `Publish_OnlyFiveNewTables_EnforcesFkAndStatus`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：Publish_OnlyFiveNewTables_EnforcesFkAndStatus
  - **前置／操作**：檢查新 0006 schema 及五張新增表
  - **驗證**：新建目錄、關聯、visit、event instance 全部 FK、唯一索引和狀態 CHECK 生效

- [x] **SEF-IT-053** `Migration_Old0005Applied_ForwardOnly`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：Migration_Old0005Applied_ForwardOnly
  - **前置／操作**：已套用 0005 的非正式測試 DB
  - **驗證**：新 migration 不倒改既有版本，受控測資重建前核身環境

- [x] **SEF-IT-054** `Catalog_ReferenceVersionPinned_NoCrossVersion`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：Catalog_ReferenceVersionPinned_NoCrossVersion
  - **前置／操作**：兩個版本各有不同 Scene/Event 定義
  - **驗證**：同一 StorySession 始終讀同版且不錯配 EventBinding

- [ ] **SEF-IT-055** `Selection_R2FaultBeforeD1Commit_RetrySameDecision`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：Selection_R2FaultBeforeD1Commit_RetrySameDecision
  - **前置／操作**：內容檢查後 R2 暫時故障且 D1 commit 不確定
  - **驗證**：恢復時查既有決議，不重抽、不建立半場

- [ ] **SEF-IT-056** `RoundRepeat_ConcurrentEpisodes_EnforcesGroup`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：RoundRepeat_ConcurrentEpisodes_EnforcesGroup
  - **前置／操作**：多個 Episode 使用相同 repeatGroup
  - **驗證**：同 Round 只允許一筆完成事件造成的作用

- [ ] **SEF-IT-057** `EventBinding_ThreeSources_SameSemanticDeduplicates`（高）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：EventBinding_ThreeSources_SameSemanticDeduplicates
  - **前置／操作**：Narrative/Scene/Global Pool 重疊綁定
  - **驗證**：相同 repeatGroup 不重複觸發且主線必要事件不被跳過

- [ ] **SEF-IT-058** `Graph_SingleEnding_RejectsNonTerminatingCycle`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：Graph_SingleEnding_RejectsNonTerminatingCycle
  - **前置／操作**：一個 Ending 的合法圖與不可終結圖
  - **驗證**：合法者發布、不可終結循環者拒絕

- [ ] **SEF-IT-059** `NextConsent_OnePlayerOffline_NoTimeoutAutoVote`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：NextConsent_OnePlayerOffline_NoTimeoutAutoVote
  - **前置／操作**：A 同意但 B 長期離線
  - **驗證**：不產生自動表決、Round 聊天與序號仍一致

- [ ] **SEF-IT-060** `PairHistory_AccountLowHigh_TracksOnlyPair`（高）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：PairHistory_AccountLowHigh_TracksOnlyPair
  - **前置／操作**：A+B 完成場景，A+C 再遊玩
  - **驗證**：權重按 ordered pair 計算，不交叉污染

- [ ] **SEF-IT-061** `Gate_OnlyFirstCompleteStory_NoFixturePromotion`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：Gate_OnlyFirstCompleteStory_NoFixturePromotion
  - **前置／操作**：十條內容中僅首條完成與九個 fixture
  - **驗證**：最終驗收計數=1、人工 Gate 未確認阻止後九條

### Integration 稽核補充（2026-11-12，風險確認後新增）

**預定測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`。各項狀態依 checklist 與驗證紀錄；與原測試清單並存，不重建舊 ID。

- [ ] **SEF-IT-062** `Narrative_SelectedCategory_RealD1_OnlyEligiblePersists`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：真 D1 與 R2 清單含混合三種主線；選懸疑只建立符合白名單的 StorySession/SceneVisit，無類別錯配

- [x] **SEF-IT-063** `NextEpisode_LatestInterests_RealD1_OffersFrozenExactlyOnce`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：A 修改興趣成功後，B 第二個同意以最新兩人興趣原子凍結 episode+1；重送不重算

- [ ] **SEF-IT-064** `Category_NoMatchingNarrative_RealD1_RollsBackAcceptance`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：Scene 關聯懸疑但沒有相符可玩主線，真 D1 禁止空 Round／Episode、維持既有 Round 已完成狀態

- [ ] **SEF-IT-065** `SelectNarrative_CategoryMismatch_RealD1_RejectsCandidate`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`SEF-GAP-01`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：R2 Manifest 的類別與 D1 category/scene 關聯不符時，抽選交易拒絕不完整 StorySession

- [x] **SEF-IT-066** `SelectNextCategory_AfterInterestChange_UsesApprovedSnapshot`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`SEF-GAP-02`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：兩人興趣在下一場同意前後變動，確認以第 2 個有效同意提交時的已儲存值重新推薦並固定候選

- [x] **SEF-IT-067** `ApplySchema_WhenOldStoryIdsExist_DoesNotTreatAsCategoryIds`（高）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；`SEF-GAP-03`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：0005 舊 StoryCatalog ID 不得被新欄當成 Category ID；真 D1 受控非正式測資重建與 rollback 生效

- [x] **SEF-IT-068** `ResolveScene_WhenGlobalPoolChanges_RetainsPinnedDependencySha`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；`SEF-GAP-04`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：R2 Scene/Narrative/GlobalPool/EventDefinition 版次與 SHA 一併釘選；R2 失敗後重試不重擲

- [ ] **SEF-IT-069** `CompleteChapter_WithPendingPartnerInteraction_CancelsBothInstancesAtomically`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；`SEF-GAP-05`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：主線完成時，同一 D1 原子批次同步封存未完 EventInstance 及既有 InteractionInstance；不能殘留 pending

- [ ] **SEF-IT-070** `StartNext_WhenConsentWithdrawRacesSecondAgree_ResolvesOneAuthoritativeState`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；`SEF-GAP-06`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：同意／撤回／第二同意三路競態只得一個有效下一場或完成等待，不能重複 episode

- [ ] **SEF-IT-071** `FirstStoryGate_BeforeManualApproval_DoesNotCountOtherNineNarratives`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；`SEF-GAP-08`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：驗收來源僅一條已核准的真主線；測試 fixture、圖片、分支、尚未授權的另外九條不計入完成數

### Integration：2026-11-13 跨 SPEC 整合（待實作）

建議入口：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`；原有跨平台測試需按實際位置建立，**不得視為已存在或已通過**。

- [ ] **SEF-IT-072** `PinnedScenePresentation_AfterNarrativeSplit_PreservesApprovedAssets`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：已發布 Scene/Narrative 跨版本抽選及 R2 資產 SHA 查回
  - **驗證**：原雨聲書店背景、前景、鏡頭、熱區和 audioCue 均固定並且內容可被重新載入

- [ ] **SEF-IT-073** `EventPresentation_OverlayDoesNotCommitNarrativeNode`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：真 D1 EventInstance 達成並用 eventSeq 重連恢復
  - **驗證**：暫時表情/鏡位效果可投影、清除、還原；current_node_id/revision 不因演出而變

- [ ] **SEF-IT-074** `Publisher_InvalidPresentationId_FailsAtomically`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Publisher 收到不存在的 camera、expression、audio asset
  - **驗證**：拒絕發布，原 Published 版本及對應檔案索引不被改壞

- [ ] **SEF-IT-075** `HiddenHotspot_ProjectionAndPreview_ProducesNoEventCommit`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：靜態 Scene 有 hotspot，Event 未解鎖，使用真 D1/HTTP 投影
  - **驗證**：未解鎖前不洩漏；解鎖預覽但取消不新增 game_event_instances

- [ ] **SEF-IT-076** `AvatarUpdated_LeavesStorySessionAndSceneVersionUnchanged`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：有權限的 actor 在進行中的 Round 採用新 ready 五表情
  - **驗證**：avatarVersion 更新而 storySessionId、currentNode、progressRevision、場景 Manifest SHA 均不改

- [x] **SEF-IT-077** `NewEpisode_SameNodeId_ResetsOnlyStageAndKeepsChat`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Round episode2 node=entry，episode1 node=entry 且聊天存在
  - **驗證**：episode2 的 Stage/Action 作用域獨立，原 Round 聊天事件可回讀且不覆寫

- [ ] **SEF-IT-078** `ForegroundSync_WhenRequestUncertain_DoesNotRerollOrResubmit`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：退背景、斷線、ACK 遺失後重連真 DO/D1/R2
  - **驗證**：只能用已提交 Snapshot/eventSeq 查回，不重抽或自動產生下一個 Action

- [ ] **SEF-IT-079** `RevokedRound_StaleAvatarResponse_CannotRevealPrivateAssets`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：已退出的 Round 與晚回的私人 R2 角色請求
  - **驗證**：經 401/403/ended 清投影後不能顯示舊五表情或跨房資料

## 3️⃣ API／HTTP 測試（API Tests）

### 建議測試檔：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`

- [ ] **SEF-API-001** `Experience_GetActive_ReturnsCurrentEpisode`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：GET /game-rounds/{roundId}/experience
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/experience
  - **驗證**：GET 最新場次，含 Category/Scene/Narrative、完成與雙方同意狀態

- [x] **SEF-API-002** `Experience_GetEnded_ReturnsOnlySafeStatus`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：GET /game-rounds/{roundId}/experience
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/experience
  - **驗證**：Round ended 不回聊天與隱藏事件明細

- [x] **SEF-API-003** `Experience_WhenNotMember_RejectsWithoutLeak`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：GET /game-rounds/{roundId}/experience
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/experience
  - **驗證**：第三人與撤銷登入只取得安全拒絕

- [ ] **SEF-API-004** `CategoryOffers_ValidRound_ReturnsFrozenTop3`（高）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：GET /game-rounds/{roundId}/story/offers
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/story/offers
  - **驗證**：同一場次最多三個已發布類別並按原排序

- [ ] **SEF-API-005** `CategoryOffers_PartnerVotePending_HidesSelectedId`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：GET /game-rounds/{roundId}/story/offers
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/story/offers
  - **驗證**：對方未結算的票不能洩漏

- [ ] **SEF-API-006** `CategoryOffers_StaleEpisode_ReturnsConflict`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：GET /game-rounds/{roundId}/story/offers
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/story/offers
  - **驗證**：已結算舊 episode 不覆蓋新候選

- [ ] **SEF-API-007** `CategoryVote_ValidPair_ResolvesExactlyOnce`（高）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：POST /game-rounds/{roundId}/story/vote
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/vote
  - **驗證**：真人兩票同批依原邀請者決議

- [ ] **SEF-API-008** `CategoryVote_NotInFrozenOffers_Rejects`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：POST /game-rounds/{roundId}/story/vote
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/vote
  - **驗證**：不在固定候選之票回 400/409 且不寫入

- [ ] **SEF-API-009** `CategoryVote_RequestIdReplay_UsesReceipt`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：POST /game-rounds/{roundId}/story/vote
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/vote
  - **驗證**：原 requestId 重播保留第一次票、不再抽場景

- [ ] **SEF-API-010** `Next_OnlyOneAgree_KeepsCompleted`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：單方 agree=true 不建立 episode+1

- [ ] **SEF-API-011** `Next_BothAgree_CreatesSingleEpisode`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：兩人同意建唯一新場、支援同時提交

- [ ] **SEF-API-012** `Next_WithdrawBeforeResolution_RemainsCompleted`（高）
  - **來源**：`SEF-BDD-040／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：agree=false 撤回在結算前生效

- [ ] **SEF-API-013** `Next_StaleCompletedEpisode_Rejects`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：過期 completedEpisodeSeq 409、沒有新 episode

- [x] **SEF-API-014** `Event_ValidBinding_UpdatesOnce`（高）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：只接受釘選內容允許的 binding/action，寫入 EventInstance 與事件序號

- [ ] **SEF-API-015** `Event_AfterCompletion_RejectsOldOptional`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：主線完成後舊事件 409

- [x] **SEF-API-016** `Event_InvalidRevision_RejectsWithoutMutation`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：舊 revision 或重播改 payload 不更新

- [ ] **SEF-API-017** `Event_HiddenNotTriggered_ProjectsSafely`（高）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：隱藏事件未解鎖，不漏 ID/答案

- [ ] **SEF-API-018** `EventsQuery_AfterSeq_ReturnsOrderedProjected`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：POST /game-rounds/{roundId}/events/query
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/events/query
  - **驗證**：用 afterSeq 順序補漏，不洩漏未決票

- [ ] **SEF-API-019** `EventsQuery_InvalidCursor_Rejects`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：POST /game-rounds/{roundId}/events/query
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/events/query
  - **驗證**：無效 cursor 400，分頁有限界

- [ ] **SEF-API-020** `End_WhenConfirmed_RevokesRoundWrites`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-007`；情境：POST /game-rounds/{roundId}/end
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/end
  - **驗證**：正式退出釋放 Claims 與永久排除 pair

- [ ] **SEF-API-021** `End_WhenCancelled_PreservesRound`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-007`；情境：POST /game-rounds/{roundId}/end
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/end
  - **驗證**：前端取消不發 end mutation

### API 稽核補充（2026-11-12，風險確認後新增）

**預定測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`。各項狀態依 checklist 與驗證紀錄；與原測試清單並存，不重建舊 ID。

- [ ] **SEF-API-022** `PostNext_AfterInterestChange_ReturnsFrozenNewCategorySnapshot`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`SEF-GAP-02`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：POST /story/next 第二同意後回固定的新場候選，重連後同一 candidate IDs；不回任何玩家私有原始興趣

- [ ] **SEF-API-023** `LegacyStoryVote_AfterCategoryContractChange_RejectsOldStoryCatalogPayload`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；`SEF-GAP-07`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：POST /story/vote 若用舊 StoryCatalog ID 當 Category ID，回安全 400/409，不能落到舊劇情選擇路徑

### API：2026-11-13 跨 SPEC 整合（待實作）

建議入口：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`；原有跨平台測試需按實際位置建立，**不得視為已存在或已通過**。

- [ ] **SEF-API-024** `Experience_WhenHiddenEventUnqualified_ExcludesHotspotProjection`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：GET experience 未解鎖及已解鎖熱區時的安全權限快照
  - **驗證**：只投影當前可互動內容；不洩漏 hidden 事件標題、答案、條件

- [ ] **SEF-API-025** `Experience_OnEpisodeChange_ProjectsNewStageAndSameRoundChat`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：同 Round 第2場 GET /experience 並查事件游標
  - **驗證**：返回新 storySessionId/episodeSeq，保留 chat Round 事件，不回前場 pending action

- [ ] **SEF-API-026** `PartnerAvatar_WhenRevoked_RefusesOldPrivateImage`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：失權後帶舊 avatarVersion 向 partner-avatar 請求圖片
  - **驗證**：401/403 或 ended safe failure，不公開私人 R2 key／已撤銷影像

## 4️⃣ 端到端測試（End-to-End Tests）

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-001** `Gate_CannotCountFixtures_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：雙人本地 Web 場景：系統只有一條完整主線與九張場景圖片或測試 fixtures
  - **驗證**：操作「執行 MVP 完整度稽核」後畫面應符合「只能計一條完整可玩主線」及「不能因有分支／多種結局加算條數」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-002** `Gate_CannotCountFixtures_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：真 Android + 另一個獨立登入玩家：系統只有一條完整主線與九張場景圖片或測試 fixtures
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「只能計一條完整可玩主線」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-003** `UI_OfferCount_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：雙人本地 Web 場景：有效 Round 有一類別或二至三類別
  - **驗證**：操作「玩家進入劇情頁」後畫面應符合「唯一類別直接進場，多類別才顯示投票卡」及「投票前不顯示對方選中的類別」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-004** `UI_OfferCount_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：真 Android + 另一個獨立登入玩家：有效 Round 有一類別或二至三類別
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「唯一類別直接進場，多類別才顯示投票卡」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-005** `UI_VoteWaiting_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：雙人本地 Web 場景：A 已投票且 B 暫時離線
  - **驗證**：操作「A 切換聊天再返回劇情入口」後畫面應符合「保留本人票並顯示正在等待另一位玩家」及「沒有假選票、倒數替他選或超時決議」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-006** `UI_VoteWaiting_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：真 Android + 另一個獨立登入玩家：A 已投票且 B 暫時離線
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「保留本人票並顯示正在等待另一位玩家」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-007** `UI_HiddenEvent_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：雙人本地 Web 場景：未達書店隱藏書籤事件條件
  - **驗證**：操作「玩家打開場景與事件列表」後畫面應符合「不顯示隱藏事件標題與答案」及「符合條件並真正觸發才展示」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-008** `UI_HiddenEvent_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：真 Android + 另一個獨立登入玩家：未達書店隱藏書籤事件條件
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「不顯示隱藏事件標題與答案」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-009** `UI_InteractionFeedback_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：雙人本地 Web 場景：雙人合作互動需要兩人各自選擇
  - **驗證**：操作「A 提交自己的選項」後畫面應符合「畫面顯示送出中、成功後等待對方」及「不能代替 B 作答或將 ACK 當成對方已讀」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-010** `UI_InteractionFeedback_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：真 Android + 另一個獨立登入玩家：雙人合作互動需要兩人各自選擇
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「畫面顯示送出中、成功後等待對方」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [x] **SEF-ET-011** `UI_ChapterCompleted_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：雙人本地 Web 場景：主線抵達 Ending
  - **驗證**：操作「畫面接收到已提交完成事件」後畫面應符合「顯示本次劇情完成但聊天室仍可使用」及「未完成事件不可再操作也無完成劇情按鈕」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-012** `UI_ChapterCompleted_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：真 Android + 另一個獨立登入玩家：主線抵達 Ending
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「顯示本次劇情完成但聊天室仍可使用」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [x] **SEF-ET-013** `UI_NextAgree_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：雙人本地 Web 場景：劇情已完成而只有 A 想再玩
  - **驗證**：操作「A 點擊再次遊玩」後畫面應符合「顯示我已同意、等待另一位玩家」及「B 拒絕或離線時保持聊天與 completed 狀態」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-014** `UI_NextAgree_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：真 Android + 另一個獨立登入玩家：劇情已完成而只有 A 想再玩
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「顯示我已同意、等待另一位玩家」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-015** `UI_NextDuplicateClick_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：雙人本地 Web 場景：A 已按同意且網路回應尚未到達
  - **驗證**：操作「A 再次點擊同意」後畫面應符合「控制項維持提交中而不產生第二個 requestId」及「收到 receipt 後恢復正確狀態」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-016** `UI_NextDuplicateClick_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：真 Android + 另一個獨立登入玩家：A 已按同意且網路回應尚未到達
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「控制項維持提交中而不產生第二個 requestId」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-017** `UI_OfflineRecovery_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：雙人本地 Web 場景：玩家完成投票後斷線且 Server 已提交但 ACK 失聯
  - **驗證**：操作「重新連線並取得快照及游標增量」後畫面應符合「依 D1 恢復原場景、主線與事件結果」及「不重抽、不重送不同 requestId」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-018** `UI_OfflineRecovery_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：真 Android + 另一個獨立登入玩家：玩家完成投票後斷線且 Server 已提交但 ACK 失聯
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「依 D1 恢復原場景、主線與事件結果」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-019** `UI_ContentFailure_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：雙人本地 Web 場景：已抽選場景的 R2 Manifest 暫時無法讀取
  - **驗證**：操作「玩家重新開啟劇情頁」後畫面應符合「顯示無法載入劇情內容且提供重試載入」及「不顯示假故事或換另一個場景」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-020** `UI_ContentFailure_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：真 Android + 另一個獨立登入玩家：已抽選場景的 R2 Manifest 暫時無法讀取
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「顯示無法載入劇情內容且提供重試載入」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [ ] **SEF-ET-021** `UI_BothPlatformsGate_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：雙人本地 Web 場景：A 用 Web、B 用 Android 遊玩首場雨聲書店
  - **驗證**：操作「兩端完成書籤與雙人合作並進入收尾」後畫面應符合「兩端依真 D1 顯示相同結果與 next 按鈕狀態」及「原 B1 五表情及全身 POV 驗收獨立保留」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-022** `UI_BothPlatformsGate_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：真 Android + 另一個獨立登入玩家：A 用 Web、B 用 Android 遊玩首場雨聲書店
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「兩端依真 D1 顯示相同結果與 next 按鈕狀態」

### 建議測試檔：`tests/e2e/web/scene-event-framework.spec.ts`

- [x] **SEF-ET-023** `UI_EndConfirmation_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：雙人本地 Web 場景：劇情已完成且兩人仍在聊天
  - **驗證**：操作「一人點擊結束本輪互動」後畫面應符合「先提示原 pair 永久不再互配並要求確認」及「取消不結束且不影響下一場同意」

### 建議測試檔：`tests/e2e/android/scene-event-framework.mjs`

- [ ] **SEF-ET-024** `UI_EndConfirmation_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：真 Android + 另一個獨立登入玩家：劇情已完成且兩人仍在聊天
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「先提示原 pair 永久不再互配並要求確認」

### E2E 稽核補充（2026-11-12，風險確認後新增）

**預定測試檔**：`tests/e2e/web/scene-event-framework.spec.ts 及 tests/e2e/android/scene-event-framework.mjs`。各項狀態依 checklist 與驗證紀錄；與原測試清單並存，不重建舊 ID。

- [ ] **SEF-ET-025** `FinishChapter_PartnerPendingInteraction_ShowsCancelled`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；`SEF-GAP-05`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：Web 與另一真人正在等待雙人事件，主線結束時兩端顯示事件已停止，仍可正常聊天，不假造對方結果

- [ ] **SEF-ET-026** `LegacyClient_StoryVotePayload_IsRejectedWithoutUnsafeFallback`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；`SEF-GAP-07`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：前端錯誤傳舊 StoryCatalog ID，服務拒絕且 UI 顯示可恢復錯誤，不因此選錯主線

- [ ] **SEF-ET-027** `FirstStoryGate_NoApproval_DoesNotPromoteFixturesToReleasedContent`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；`SEF-GAP-08`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：人工 Gate 證據未簽核時，E2E 只驗首條雨聲書店，不將其他九條測試 fixtures 算成正式內容；此為驗收／內容發布流程檢查，非虛構 App 防擴充功能

### E2E：2026-11-13 跨 SPEC 整合（待實作）

建議入口：`tests/e2e/web/scene-event-framework.spec.ts、tests/e2e/android/scene-event-framework.mjs`；原有跨平台測試需按實際位置建立，**不得視為已存在或已通過**。

- [ ] **SEF-ET-028** `ScenePresentationSplit_FullArtWebAndroid`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：已發佈 Scene/Narrative 對應雨聲書店 Web/Android 背景／前景／鏡位／熱區／音效
  - **驗證**：兩端同畫面構圖，正式免費全身角色未重繪

- [ ] **SEF-ET-029** `EventOutcomePresentation_OverlayReverts`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：真人觸發信件自由事件
  - **驗證**：短暫表情、鏡位、音效在事件完成後還原，主線不無故跳節點

- [ ] **SEF-ET-030** `BadEventPresentation_PublishRejected`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：事件來源有非法表情或相機
  - **驗證**：出版失敗時 Web/Android 保持舊版可玩

- [ ] **SEF-ET-031** `HiddenHotspot_PreviewDoesNotCommit`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：探索書籤前置條件先不滿足後滿足
  - **驗證**：不可見時不漏內容、可見後取消不寫事件

- [ ] **SEF-ET-032** `AvatarSwap_DuringNarrativeSafeAtLineEnd`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：同一 Round 真對方切換已 ready 全身角色
  - **驗證**：五圖全部載入後句尾換角，聊天與劇情 node 不變

- [ ] **SEF-ET-033** `AvatarNotReady_ResumeDoesNotGenerate`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：B1 中斷、尚未 ready 或新五圖之一解碼失敗
  - **驗證**：保留完整舊角色或佔位、沒有新 Gemini 請求或正式採用

- [x] **SEF-ET-034** `EpisodeNewScene_ResetsStageNotChat`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：第一場與第二場均有 entry 節點
  - **驗證**：新場台詞、鏡頭、Event modal 初始化而 Round 聊天與已採用角色保留

- [ ] **SEF-ET-035** `BackgroundFocus_ResumesWithoutSideEffects`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：Home／AppState 退到背景又回前景
  - **驗證**：微動及聲音符合停止規則，授權快照恢復但不重抽、重送、續產

- [ ] **SEF-ET-036** `StaleAvatarRequest_AfterExitRejected`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：退出 Round 後舊圖片請求晚回
  - **驗證**：不復活私人圖片，不混進下一 Round

- [x] **SEF-ET-037** `CompletedChapter_StillRendersStageAndChat`（高）
  - **來源**：`SEF-BDD-076／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：未完成支線而主線已到結尾
  - **驗證**：兩端顯示已完成劇情與保留聊天室，未完支線不可操作

- [ ] **SEF-ET-038** `SceneMotionOff_AssetReuseMeasurements`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：關閉場景微動後連續進入可用事件並恢復 App
  - **驗證**：鏡頭、人物、熱區可用，無裝飾動畫，保留實測 jank／記憶體／載入延遲的證據

- [ ] **SEF-ET-039** `CrossSpecGate_BothPlatformsAndHumanReview`（高）
  - **來源**：`SEF-BDD-078／SEF-AC-016`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：首條書店使用已定稿免費與 AI 全身角色、兩種收尾
  - **驗證**：自動驗證與人工 Gate B 分開，未經使用者核准不能擴充其餘九條

## BDD → TDD 逐項追溯

| BDD | Unit（原 3 項／補強時可增加） | 真 D1 或 Web＋Android E2E | SPEC |
|---|---|---|---|
| SEF-BDD-001 | SEF-UT-001、SEF-UT-002、SEF-UT-003 | SEF-IT-001 | SEF-AC-001 |
| SEF-BDD-002 | SEF-UT-004、SEF-UT-005、SEF-UT-006 | SEF-IT-002 | SEF-AC-001 |
| SEF-BDD-003 | SEF-UT-007、SEF-UT-008、SEF-UT-009 | SEF-IT-003 | SEF-AC-001 |
| SEF-BDD-008 | SEF-UT-010、SEF-UT-011、SEF-UT-012 | SEF-IT-004 | SEF-AC-002 |
| SEF-BDD-009 | SEF-UT-013、SEF-UT-014、SEF-UT-015 | SEF-IT-005 | SEF-AC-002 |
| SEF-BDD-011 | SEF-UT-016、SEF-UT-017、SEF-UT-018 | SEF-IT-006 | SEF-AC-003 |
| SEF-BDD-014 | SEF-UT-019、SEF-UT-020、SEF-UT-021 | SEF-IT-007 | SEF-AC-003 |
| SEF-BDD-015 | SEF-UT-022、SEF-UT-023、SEF-UT-024 | SEF-IT-008 | SEF-AC-003 |
| SEF-BDD-019 | SEF-UT-025、SEF-UT-026、SEF-UT-027 | SEF-IT-009、SEF-IT-058 | SEF-AC-004 |
| SEF-BDD-020 | SEF-UT-028、SEF-UT-029、SEF-UT-030 | SEF-IT-010 | SEF-AC-004 |
| SEF-BDD-023 | SEF-UT-031、SEF-UT-032、SEF-UT-033 | SEF-IT-011、SEF-IT-057 | SEF-AC-005 |
| SEF-BDD-024 | SEF-UT-034、SEF-UT-035、SEF-UT-036 | SEF-IT-012 | SEF-AC-005 |
| SEF-BDD-025 | SEF-UT-037、SEF-UT-038、SEF-UT-039 | SEF-IT-013 | SEF-AC-005 |
| SEF-BDD-028 | SEF-UT-040、SEF-UT-041、SEF-UT-042 | SEF-IT-014 | SEF-AC-006 |
| SEF-BDD-029 | SEF-UT-043、SEF-UT-044、SEF-UT-045 | SEF-IT-015 | SEF-AC-006 |
| SEF-BDD-031 | SEF-UT-046、SEF-UT-047、SEF-UT-048 | SEF-IT-016、SEF-IT-056 | SEF-AC-006 |
| SEF-BDD-034 | SEF-UT-049、SEF-UT-050、SEF-UT-051 | SEF-IT-017 | SEF-AC-007 |
| SEF-BDD-038 | SEF-UT-052、SEF-UT-053、SEF-UT-054 | SEF-IT-018、SEF-IT-059 | SEF-AC-008 |
| SEF-BDD-046 | SEF-UT-055、SEF-UT-056、SEF-UT-057 | SEF-IT-019、SEF-IT-054 | SEF-AC-010 |
| SEF-BDD-049 | SEF-UT-058、SEF-UT-059、SEF-UT-060 | SEF-IT-020 | SEF-AC-011 |
| SEF-BDD-051 | SEF-UT-061、SEF-UT-062、SEF-UT-063 | SEF-IT-021、SEF-IT-061 | SEF-AC-012 |
| SEF-BDD-004 | SEF-UT-064、SEF-UT-065、SEF-UT-066 | SEF-IT-022 | SEF-AC-001 |
| SEF-BDD-005 | SEF-UT-067、SEF-UT-068、SEF-UT-069 | SEF-IT-023 | SEF-AC-001 |
| SEF-BDD-013 | SEF-UT-070、SEF-UT-071、SEF-UT-072 | SEF-IT-024、SEF-IT-060 | SEF-AC-003 |
| SEF-BDD-016 | SEF-UT-073、SEF-UT-074、SEF-UT-075 | SEF-IT-025 | SEF-AC-003 |
| SEF-BDD-021 | SEF-UT-076、SEF-UT-077、SEF-UT-078 | SEF-IT-026 | SEF-AC-004 |
| SEF-BDD-035 | SEF-UT-079、SEF-UT-080、SEF-UT-081 | SEF-IT-027 | SEF-AC-007 |
| SEF-BDD-039 | SEF-UT-082、SEF-UT-083、SEF-UT-084 | SEF-IT-028 | SEF-AC-008 |
| SEF-BDD-040 | SEF-UT-085、SEF-UT-086、SEF-UT-087 | SEF-IT-029 | SEF-AC-008 |
| SEF-BDD-012 | SEF-UT-088、SEF-UT-089、SEF-UT-090 | SEF-IT-030 | SEF-AC-003 |
| SEF-BDD-017 | SEF-UT-091、SEF-UT-092、SEF-UT-093 | SEF-IT-031 | SEF-AC-003 |
| SEF-BDD-030 | SEF-UT-094、SEF-UT-095、SEF-UT-096 | SEF-IT-032 | SEF-AC-006 |
| SEF-BDD-033 | SEF-UT-097、SEF-UT-098、SEF-UT-099 | SEF-IT-033 | SEF-AC-006 |
| SEF-BDD-037 | SEF-UT-100、SEF-UT-101、SEF-UT-102 | SEF-IT-034 | SEF-AC-007 |
| SEF-BDD-041 | SEF-UT-103、SEF-UT-104、SEF-UT-105 | SEF-IT-035 | SEF-AC-008 |
| SEF-BDD-043 | SEF-UT-106、SEF-UT-107、SEF-UT-108 | SEF-IT-036 | SEF-AC-009 |
| SEF-BDD-045 | SEF-UT-109、SEF-UT-110、SEF-UT-111 | SEF-IT-037 | SEF-AC-009 |
| SEF-BDD-052 | SEF-UT-112、SEF-UT-113、SEF-UT-114 | SEF-IT-038 | SEF-AC-012 |
| SEF-BDD-006 | SEF-UT-115、SEF-UT-116、SEF-UT-117 | SEF-IT-039 | SEF-AC-001 |
| SEF-BDD-007 | SEF-UT-118、SEF-UT-119、SEF-UT-120 | SEF-IT-040 | SEF-AC-001 |
| SEF-BDD-010 | SEF-UT-121、SEF-UT-122、SEF-UT-123 | SEF-IT-041、SEF-IT-052 | SEF-AC-002 |
| SEF-BDD-018 | SEF-UT-124、SEF-UT-125、SEF-UT-126 | SEF-IT-042 | SEF-AC-003 |
| SEF-BDD-022 | SEF-UT-127、SEF-UT-128、SEF-UT-129 | SEF-IT-043 | SEF-AC-004 |
| SEF-BDD-026 | SEF-UT-130、SEF-UT-131、SEF-UT-132 | SEF-IT-044 | SEF-AC-005 |
| SEF-BDD-027 | SEF-UT-133、SEF-UT-134、SEF-UT-135 | SEF-IT-045 | SEF-AC-005 |
| SEF-BDD-032 | SEF-UT-136、SEF-UT-137、SEF-UT-138 | SEF-IT-046 | SEF-AC-006 |
| SEF-BDD-036 | SEF-UT-139、SEF-UT-140、SEF-UT-141 | SEF-IT-047 | SEF-AC-007 |
| SEF-BDD-042 | SEF-UT-142、SEF-UT-143、SEF-UT-144 | SEF-IT-048 | SEF-AC-008 |
| SEF-BDD-044 | SEF-UT-145、SEF-UT-146、SEF-UT-147 | SEF-IT-049 | SEF-AC-009 |
| SEF-BDD-047 | SEF-UT-148、SEF-UT-149、SEF-UT-150 | SEF-IT-050、SEF-IT-055 | SEF-AC-010 |
| SEF-BDD-048 | SEF-UT-151、SEF-UT-152、SEF-UT-153 | SEF-IT-051 | SEF-AC-010 |
| SEF-BDD-050 | SEF-UT-154、SEF-UT-155、SEF-UT-156 | SEF-ET-001、SEF-ET-002 | SEF-AC-011 |
| SEF-BDD-053 | SEF-UT-157、SEF-UT-158、SEF-UT-159 | SEF-ET-003、SEF-ET-004 | SEF-AC-001 |
| SEF-BDD-054 | SEF-UT-160、SEF-UT-161、SEF-UT-162 | SEF-ET-005、SEF-ET-006 | SEF-AC-001 |
| SEF-BDD-055 | SEF-UT-163、SEF-UT-164、SEF-UT-165 | SEF-ET-007、SEF-ET-008 | SEF-AC-005 |
| SEF-BDD-056 | SEF-UT-166、SEF-UT-167、SEF-UT-168 | SEF-ET-009、SEF-ET-010 | SEF-AC-006 |
| SEF-BDD-057 | SEF-UT-169、SEF-UT-170、SEF-UT-171 | SEF-ET-011、SEF-ET-012 | SEF-AC-007 |
| SEF-BDD-058 | SEF-UT-172、SEF-UT-173、SEF-UT-174 | SEF-ET-013、SEF-ET-014 | SEF-AC-008 |
| SEF-BDD-059 | SEF-UT-175、SEF-UT-176、SEF-UT-177 | SEF-ET-015、SEF-ET-016 | SEF-AC-008 |
| SEF-BDD-060 | SEF-UT-178、SEF-UT-179、SEF-UT-180 | SEF-ET-017、SEF-ET-018 | SEF-AC-009 |
| SEF-BDD-061 | SEF-UT-181、SEF-UT-182、SEF-UT-183 | SEF-ET-019、SEF-ET-020 | SEF-AC-010 |
| SEF-BDD-062 | SEF-UT-184、SEF-UT-185、SEF-UT-186 | SEF-ET-021、SEF-ET-022 | SEF-AC-011 |
| SEF-BDD-063 | SEF-UT-187、SEF-UT-188、SEF-UT-189 | SEF-ET-023、SEF-ET-024 | SEF-AC-009 |

| SEF-BDD-064 | SEF-UT-190、SEF-UT-191、SEF-UT-192、SEF-UT-199 | SEF-IT-062、SEF-IT-065 | SEF-AC-003 |
| SEF-BDD-065 | SEF-UT-193、SEF-UT-194、SEF-UT-195 | SEF-IT-063、SEF-IT-066；SEF-API-022 | SEF-AC-008 |
| SEF-BDD-066 | SEF-UT-196、SEF-UT-197、SEF-UT-198 | SEF-IT-064 | SEF-AC-001 |

| SEF-BDD-067 | SEF-UT-200、SEF-UT-201、SEF-UT-202 | SEF-IT-072、SEF-ET-028 | SEF-AC-013 |
| SEF-BDD-068 | SEF-UT-203、SEF-UT-204、SEF-UT-205 | SEF-IT-073、SEF-ET-029 | SEF-AC-013 |
| SEF-BDD-069 | SEF-UT-206、SEF-UT-207、SEF-UT-208 | SEF-IT-074、SEF-ET-030 | SEF-AC-013 |
| SEF-BDD-070 | SEF-UT-209、SEF-UT-210、SEF-UT-211 | SEF-IT-075、SEF-API-024、SEF-ET-031 | SEF-AC-015 |
| SEF-BDD-071 | SEF-UT-212、SEF-UT-213、SEF-UT-214 | SEF-IT-076、SEF-ET-032 | SEF-AC-014 |
| SEF-BDD-072 | SEF-UT-215、SEF-UT-216、SEF-UT-217 | SEF-ET-033 | SEF-AC-014 |
| SEF-BDD-073 | SEF-UT-218、SEF-UT-219、SEF-UT-220 | SEF-IT-077、SEF-API-025、SEF-ET-034 | SEF-AC-015 |
| SEF-BDD-074 | SEF-UT-221、SEF-UT-222、SEF-UT-223 | SEF-IT-078、SEF-ET-035 | SEF-AC-015 |
| SEF-BDD-075 | SEF-UT-224、SEF-UT-225、SEF-UT-226 | SEF-IT-079、SEF-API-026、SEF-ET-036 | SEF-AC-014 |
| SEF-BDD-076 | SEF-UT-227、SEF-UT-228、SEF-UT-229 | SEF-ET-037 | SEF-AC-015 |
| SEF-BDD-077 | SEF-UT-230、SEF-UT-231、SEF-UT-232 | SEF-ET-038 | SEF-AC-016 |
| SEF-BDD-078 | SEF-UT-233、SEF-UT-234、SEF-UT-235 | SEF-ET-039 | SEF-AC-016 |
| SEF-BDD-079 | SEF-UT-236 | SEF-IT-080、SEF-API-027、SEF-ET-040 | SEF-AC-017 |

### 8 組 RiskAudit 缺漏的 TDD 對應

| GAP | 已補的具體 TDD ID | 是否需要額外程式驗證 |
|---|---|---|
| SEF-GAP-01 | SEF-UT-199、SEF-IT-065；另 BDD-064 的 UT-190～192、IT-062 | 類別適用與 Publisher／選擇器雙重校驗 |
| SEF-GAP-02 | SEF-IT-066、SEF-API-022；另 BDD-065 的 UT-193～195、IT-063 | 新一場最新興趣、同批凍結與重連 |
| SEF-GAP-03 | SEF-IT-067 | 0005→新版 schema 語意轉換與 rollback |
| SEF-GAP-04 | SEF-IT-068 | R2 依賴全版釘選、缺檔重試不重擲 |
| SEF-GAP-05 | SEF-IT-069、SEF-ET-025 | 完成主線時同步封存未完事件及雙人等待 |
| SEF-GAP-06 | SEF-IT-070 | 雙方同意與撤回的原子競態 |
| SEF-GAP-07 | SEF-API-023、SEF-ET-026 | 舊 StoryCatalog 投票 payload 拒絕、UI 回歸 |
| SEF-GAP-08 | SEF-IT-071、SEF-ET-027 | 首條完整內容人工驗證 Gate 與正式數量統計 |

### 2026-11-13 跨 SPEC UX 影響稽核的八組補強

| UX GAP | 整合風險／BDD | 新增 TDD 追溯 | 狀態 |
|---|---|---|---|
| SEF-UX-GAP-01 | Scene 拆分與正式 2.5D 參照；BDD-067/069 | UT-200～202/206～208、IT-072/074、ET-028/030 | 未實作 |
| SEF-UX-GAP-02 | Event 演出暫時覆寫／還原；BDD-068 | UT-203～205、IT-073、ET-029 | 未實作 |
| SEF-UX-GAP-03 | 隱藏熱區與預覽不提交；BDD-070 | UT-209～211、IT-075、API-024、ET-031 | 未實作 |
| SEF-UX-GAP-04 | 五表情整包換角／B1 停產／失權清除；BDD-071/072/075 | UT-212～217/224～226、IT-076/079、API-026、ET-032/033/036 | 未實作 |
| SEF-UX-GAP-05 | 跨 Episode 重設舞台及完成仍顯示收尾；BDD-073/076 | UT-218～220/227～229、IT-077、API-025、ET-034/037 | 未實作 |
| SEF-UX-GAP-06 | 背景／回前景／游標恢復不重抽、不產圖；BDD-074 | UT-221～223、IT-078、ET-035 | 未實作 |
| SEF-UX-GAP-07 | 手動關閉微動／素材快取／實際效能證據；BDD-077 | UT-230～232、ET-038 | 未實作 |
| SEF-UX-GAP-08 | 第一條 Web／Android 全身角色與原 Gate B；BDD-078 | UT-233～235、ET-039 | 未實作 |

原 SEF-GAP-01～08 的已核准業務取捨維持不變。以上是另外八組跨 SPEC 技術整合缺漏，新增測試**不等於原 AvatarAndPreferences／StoryDialogueAndExit Gate B 已完成**。

**需求回查**：AC-005-04～15 → SPEC SEF-AC-001～016 → 本頁 `SEF-BDD-001～078` → 上列 TDD；全部 **78 場**有至少三個 Unit 斷言與真 D1 或 E2E 測試。API 明列 7 類端點的成功、失敗、安全及競態。測試名稱及檔案是預計實作位置，尚不存在的測試檔不得宣稱已建立。新版故事狀態必須另跑原 StoryDialogueAndExit 的 Web／Android／Avatar UX 回歸，不可拿本 SPEC 的測試代替。

## 本人目前採用化身入口補充（SEF-AC-017／SEF-BDD-079）

- [x] **SEF-UT-236** `OwnAvatarNotReady_ClearsPrivateSceneAndOffersProfileReturn`：初載或已顯示場景後收到本人未就緒錯誤，清除私人內容與草稿、禁止互動並導向個人檔案；游標超過 snapshot 時重新讀權威狀態，不以事件 receipt 冒認畫面已同步。
- [x] **SEF-IT-080** `CurrentAdoptedAvatar_RequiresCompleteOwnedPack`：真 Miniflare D1／R2 驗本人當前 ready 資產、有效清單與五物件；缺圖、pending、他人資產拒絕；另一組 pending 不影響已就緒採用者；R2 等待後撤銷401。
- [x] **SEF-API-027** `OwnAvatarNotReady_BlocksEntryTicketAndCommands`：真 HTTP／Application／D1 驗入口、票券與共用 WS 命令用例拒絕且零寫入；本人恢復後可進；第三人403，end 及 ended 安全狀態不受阻。
- [x] **SEF-ET-040** `BothPlatforms_OwnAvatarGateAndReadyResume`：Web／Android 真 UI 以 active Round 直接重入驗阻擋、無角色及聊天室、個人檔案入口；恢復原採用者後回同 Round 繼續遊戲，不重抽。


## 測試清單使用說明

1. [RiskAudit](../specs/SPEC-001-SceneEventFramework-RiskAudit.md) RA-Q1=A／RA-Q2=A 已確認，八組缺漏已補入，規劃可交 well-done；這不代表任何產品測試通過。
2. well-done 依 Red→Green→Refactor 測試，使用現有真 D1／Miniflare／Web／Android 工具並補記 runner evidence，不把 fixture 當正式可玩主線。
3. 開發首條劇情完整體驗交使用者實際驗收，**未取得明確核准不產生其餘九條完整主線**。
4. 不提前實作 AI 動態劇情、跨場景沉浸模式或 History／Housekeeping。

## 歷史規劃交接紀錄（2026-11-12 舊框架，非本輪權威）

**歷史交接狀態（2026-11-12 舊框架）：Ready for well-done，已由 2026-11-15 新版 SDD／BDD／TDD 規劃取代；**本輪唯一權威狀態為本文末尾的 `Blocked`**。
**最後確認日期：2026-11-12**  
**本輪唯一目標**：`SPEC-001-SceneEventFramework`；未自動切換到其他 SPEC  
**交接時基線**：BDD **0/78**、TDD **0/379**；當時僅規劃。**目前開發現況**以頂部分層統計與 [驗證紀錄](../verification/SPEC-001-SceneEventFramework-Verification.md) 為準。

### 文件包

| 類型 | DatingHigh 路徑 | 確認狀態 |
|---|---|---|
| MVP | `docs/requirements/MVP-001-LoveGameDatingApp.md` | 最新驗收條件及 RA-Q1=A／RA-Q2=A 已確認 |
| SPEC／SDD | `docs/specs/SPEC-001-SceneEventFramework.md` | SEF-RQ-01～03=A、RA-Q1=A、RA-Q2=A 均已確認 |
| BDD | `docs/bdd/SPEC-001-SceneEventFramework-BDD.md` | 78 場景，含 12 個人物／舞台整合場景，皆未執行 |
| TDD | `docs/tdd/SPEC-001-SceneEventFramework-TDD.md` | 379 項，含 59 個跨 SPEC 整合測試，尚未實作 |
| RiskAudit | `docs/specs/SPEC-001-SceneEventFramework-RiskAudit.md` | 原 12 項風險及新 8 項跨 SPEC 影響風險都有具體處置；無新增待決業務問題 |
| 舊版上游 | `docs/specs/SPEC-001-StoryDialogueAndExit.md` 及原 BDD/TDD/Verification | 保留原 Gate B 和全身化身／B1 未驗收項目，不得代簽 |

### 已確認風險與決策

| ID | 使用者決策或已採的規劃防護 | 文件回寫位置／Well-Done 要驗證的內容 |
|---|---|---|
| SEF-RQ-01=A | 未玩與已玩場景及主線按初始 3:1 權重，允許重玩 | SDD §3.2；BDD-011/014；固定 RNG 測試 |
| SEF-RQ-02=A | 到主線 Ending 封存本次未完支線與雙人互動，聊天室維持 | SDD §3.4；BDD-034～037；真 D1 同交易取消 |
| SEF-RQ-03=A | 新增五張必要表、事件內容留 R2；不建 content_event_catalog | SDD §4；真 D1／R2 發布及 Migration 驗證 |
| **RA-Q1=A／SEF-RA-01** | 已選劇情類別限制 Scene 及 Narrative；主線可適用多類別 | MVP AC-005-04/06、SDD §3.1/3.2/4.3、BDD-064/066、GAP-01 |
| **RA-Q2=A／SEF-RA-02** | 下一場以同意齊備當下最新已儲存興趣重新推薦並固定候選 | MVP AC-005-11、SDD §3.1/6、BDD-065、GAP-02 |
| SEF-RA-03 | 新舊 Story/Category 候選不誤用 | RiskAudit §二/五；GAP-03，真 D1 向前 Migration 與安全測資清理 |
| SEF-RA-04／06 | D1/R2 交易分界、四層依賴版本及 SHA 固定 | RiskAudit §二/五；GAP-04，重試不重新抽選 |
| SEF-RA-05 | 雙方同意／撤回並發只能建立一個 Episode | RiskAudit §二/五；GAP-06，真 D1 競態 |
| SEF-RA-07／10 | 舊／新互動狀態同步、收尾取消等待中的支線 | RiskAudit §二/五；GAP-05，真 D1＋雙端回饋 |
| SEF-RA-08 | 舊 StoryCatalog 投票 API/UI 必須一致改成 Category | RiskAudit §二/五；GAP-07，舊 payload 安全拒絕 |
| SEF-RA-09／11 | 接受 3:1 隨機特性，第一條必須人工試玩才可製作九條 | MVP AC-005-14、SDD §7、GAP-08；不得把 fixtures 當內容 |
| SEF-RA-12 | Publisher 的 DSL／候選／依賴有界、無不受控腳本 | SDD §3.3/4.3、原 BDD/TDD 內容發布測試 |

### 已補回八組缺漏

| GAP | 已補入測試（未實作） | 狀態 |
|---|---|---|
| SEF-GAP-01 | UT-199、IT-065；新增 BDD-064/066 對應 UT-190～192／196～198、IT-062/064 | 已規劃 |
| SEF-GAP-02 | IT-066、API-022；新增 BDD-065 對應 UT-193～195、IT-063 | 已規劃 |
| SEF-GAP-03 | IT-067 | 已規劃 |
| SEF-GAP-04 | IT-068 | 已規劃 |
| SEF-GAP-05 | IT-069、ET-025 | 已規劃 |
| SEF-GAP-06 | IT-070 | 已規劃 |
| SEF-GAP-07 | API-023、ET-026 | 已規劃 |
| SEF-GAP-08 | IT-071、ET-027 | 已規劃 |

每個測試完整名稱、前置及斷言見本檔對應 Unit／Integration／API／E2E 區。這八組為原 RiskAudit 缺漏的正式回寫，並非實際修復／通過證據。

### Well-Done 實作注意事項與建議順序

1. 先確認 active Workspace Session、Write Lease 與所有 Git staged/unstaged 改動。現有 StoryDialogueAndExit／AvatarAndPreferences（全身化身、B1 五表情、2.5D 場景）仍有未結案工作，不能覆寫、混算完成率或降低原 Gate B。
2. 真實以 `0005_story_dialogue_exit.sql`、`StoryDialogueService`、`story-commands.ts`、`StoryGraphPolicy`、`contracts/story-scenes.json` 為基線；新增向前 Migration，補**五張新表**與原表最小異動。不增加 Trigger、Episode／Offers／Votes 專用表、`content_event_catalog`。
3. 先完成 Category→Scene→Narrative 的發布與選擇政策：Narrative Manifest `eligibleCategoryCodes`、有序前置、3:1、同一對玩家去重；內容由 Publisher 驗證，Runtime 另以相同規則過濾，防止選了懸疑卻抽到純浪漫。版次及全域事件池 SHA 一併釘選。
4. 以現有 Round 權威、原邀請者決勝、D1 CAS/事件序號／真雙人 WebSocket 接類別票、事件實例、自然完成與**雙方同意新場次**；第二同意成功時取得最新已儲存雙方興趣快照。HTTP/WS 同一規則、斷線不重抽，結束 Round 後不再可讀私人歷史。
5. 首次只遷入並完成**「雨聲書店」一條正式可完整遊玩的主線**，保留已定稿免費 16 款全身角色／80 張五表情、已核准 AI 套組、2.5D 清空桌面背景＋透明前景／鏡位／熱區／音效，以及書籤、合作、對話、既有分支與完整收尾、真人 Web／Android。§4.4 的事件演出、全身換角、跨場重設、背景恢復與效能證據必須一起驗證。新框架真 D1／R2、雙人操作、前景恢復、斷線與交互退場均要實際跑並留下 runner evidence。
6. **首條完成後先停**：使用者必須親自試玩、調校並明確核准後才可開始開發其餘九條正式主線。最終仍需至少 10 條；測試 fixtures、十張圖或同一主線分支不算內容數量。此為**內容擴充 Gate**，不是目前規劃交接阻斷。
7. 未來 MVP-002 AI 動態主線／跨場景沉浸模式、History/Housekeeping、好感／約會／告白，不在本次開發範圍；不可假借共用框架提前實作。
8. 清測資僅限已識別且核准的非正式 DatingHigh 環境，不能碰未知／正式資料庫或意外清除帳號、個資、真人照片、化身。不能修改曾套用的舊 Migration 或沿用別的 SPEC 的 CLEAN-RESET 授權。

### 2026-11-13 跨 SPEC 影響稽核的開發注意事項

- **新增的整合契約與責任**：以 [SDD §4.4](../specs/SPEC-001-SceneEventFramework.md) 為準。Scene Manifest 擁有背景／前景／鏡位與熱區，Narrative 只引用節點演出，EventBinding 只宣告可選的暫時 `presentationEffects`；對方角色由 AvatarAndPreferences 的正式採用版本與 StoryDialogueAndExit 的授權投影擁有。不可另建 Event 專用舞台或角色表。
- **新整合測試**：`SEF-BDD-067～078`、`SEF-UT-200～235`、`SEF-IT-072～079`、`SEF-API-024～026`、`SEF-ET-028～039`，均須由 Well-Done 實作並附實際 runner 與雙平台驗證。原 StoryDialogueAndExit Gate B 及 AvatarAndPreferences 的完整 B1 驗收**仍獨立存在**。
- **禁止退化**：不重繪免費 16 款全身角色／80 張五表情，不把私人角色 URL 或 R2 key 放進公開 Scene Manifest；B1 背景中斷、回前景不自動續產、五圖解碼後句尾換角、撤權清除、微動開關、音效背景暫停、原兩結局與透明桌面遮擋均需保留。
- **跨 Episode 要求**：不同 StorySession 即使使用同名 `entry`，也必須重設逐字動畫、鏡位、Hotspot overlay、Modal 與 Cue；同 Round 的聊天、授權與目前採用的 Avatar 保留。事件 preview 不提交、完成後不殘留支線，重連不重新擲骰或誤重播。
- **效能證據**：按需載入事件素材／重用同版五表情，針對 Web、Android 記錄真實的角色換裝、事件切換、背景恢復時延與實測記憶體／jank；未取得可重現數據不得宣稱達到某個 FPS。
- **實作邊界與 Gate**：只需補原訂五張 D1 表，全部已確認業務選擇不變；以雨聲書店首條為唯一正式新內容。必須由使用者親自試玩調校並明確核准後，才可開始其餘九條；本輪未執行產品測試或調整原視覺 SPEC。

### 2026-11-13 追溯增量

| 新補強 | 數量 | 實作狀態 |
|---|---:|---|
| SceneEventFramework SPEC AC-013～016 | 4 | SDD 已增補、非產品通過 |
| BDD-067～078 | 12 | 0/12 通過 |
| TDD Unit-200～235 | 36 | 0/36 通過 |
| TDD Integration-072～079 | 8 | 0/8 通過 |
| TDD API-024～026 | 3 | 0/3 通過 |
| TDD E2E-028～039 | 12 | 0/12 通過 |
| 新的 SEF-UX-GAP-01～08 | 8 | 文件均有 TDD 落點，尚未實作 |

本次更新後 **SPEC 16/16、BDD 78/78 均有測試規劃對應**；規劃交接當時 TDD 為 **0/379**；目前實作統計見本頁頂部與驗證紀錄。既有原 12 項 RiskAudit 與 8 組 Gap 仍保留，另 8 項視覺／整合風險的防護措施見 RiskAudit §六。

### 不得進入開發的規劃阻斷項

**歷史紀錄：**2026-11-12 舊框架當時無待決策項目；此處已被 2026-11-15 雙 Track／新劇本新增風險稽核取代，不表示新版可以直接 well-done。

---

## 2026-11-12 實作前稽核紀錄

- 風險：**12 項（高 7、中 4、低 1）**；RA-Q1=A、RA-Q2=A 已確認。
- 增補：BDD **+3（63→66）**；TDD **+25（295→320）**，內含 Unit +10、Integration +10、API +2、E2E +3，八組 GAP 均已補入。
- 2026-11-12 原文件鏈：新增 MVP AC **12/12**、SPEC AC **12/12**、BDD **66/66** 已追溯。2026-11-13 新增 SPEC AC-013～016、BDD-067～078 及其 TDD，現為 SPEC **16/16**、BDD **78/78** 有測試規劃對應，未執行產品測試。
- 本輪沒有修改產品程式碼、資料表 Schema 或任何環境資料。## 2026-11-15 新版雙 Track／雨聲書店 TDD 正式增量（Phase 3）

**本節不修改歷史已通過證據**。對應新增 BDD-080～121，逐一規劃 **3 項 Unit＋1 項 Integration**，再於下節規劃 API 與 Web／Android E2E。全為 `- [ ]`／待先 Red 再 Green；不可因方法名稱被列入就標記已執行。新測試檔路徑均為**建議新增／延用位置**，以 well-done 實際引用稽核後決定，避免重複引擎。

### 新版 Unit：SEF-UT-237～362（126 項，全部待實作）

- [ ] **SEF-UT-237** `ParticipantTrack_Bdd080_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 場次決議已成功且兩名真人身分有效；When Server 建立 StorySession；Then 同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界

- [ ] **SEF-UT-238** `ParticipantTrack_Bdd080_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界

- [ ] **SEF-UT-239** `ParticipantTrack_Bdd080_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：任何一筆建立失敗都不能留下半場

- [ ] **SEF-UT-240** `ParticipantTrack_Bdd081_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 和 A 各位於不同個人節點；When I 先完成本人可用的事件；Then 僅 I 的 node、Area、revision 進步，A 不變

- [ ] **SEF-UT-241** `ParticipantTrack_Bdd081_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅 I 的 node、Area、revision 進步，A 不變

- [ ] **SEF-UT-242** `ParticipantTrack_Bdd081_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 可稍後親自完成未玩節點

- [ ] **SEF-UT-243** `ParticipantTrack_Bdd082_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given Round 已固定原邀請人及接受人；When 前端假造另一方 role、nodeId 或 accountId；Then Server 拒絕假冒且不修改進度

- [ ] **SEF-UT-244** `ParticipantTrack_Bdd082_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：Server 拒絕假冒且不修改進度

- [ ] **SEF-UT-245** `ParticipantTrack_Bdd082_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不可用帳號大小或先上線順序決定角色

- [ ] **SEF-UT-246** `ParticipantTrack_Bdd083_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 前進而 A 還在 A02；When A 重新登入取授權 experience；Then A 恢復 A02、Area、可操作物件及個人 revision

- [ ] **SEF-UT-247** `ParticipantTrack_Bdd083_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：A 恢復 A02、Area、可操作物件及個人 revision

- [ ] **SEF-UT-248** `ParticipantTrack_Bdd083_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：全域 eventSeq 不能替 A 決策

- [ ] **SEF-UT-249** `ParticipantTrack_Bdd084_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 的必要節點完成而 A08 未完成；When I 嘗試結束本場主線；Then chapter 仍是 playing 且 A 可繼續

- [ ] **SEF-UT-250** `ParticipantTrack_Bdd084_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：chapter 仍是 playing 且 A 可繼續

- [ ] **SEF-UT-251** `ParticipantTrack_Bdd084_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 完成及 Shared predicate 齊備才發出一次 chapter.completed

- [ ] **SEF-UT-252** `SharedTransition_Bdd085_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given S01 兩人真人核對且 I04、A04、S02 都在合法圖中；When 雙方提交 S01 後分別移至不同區域；Then I04、A04 分別開啟並可進 S02 再交會

- [ ] **SEF-UT-253** `SharedTransition_Bdd085_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：I04、A04 分別開啟並可進 S02 再交會

- [ ] **SEF-UT-254** `SharedTransition_Bdd085_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不修改對方未完成的私人事件

- [ ] **SEF-UT-255** `SharedTransition_Bdd086_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given S02 完成時 I 在 I08、A 尚未執行 A08；When 伺服器結算 S02 的合法雙人答案；Then 只開啟 A08 且 I 停留 I08

- [ ] **SEF-UT-256** `SharedTransition_Bdd086_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只開啟 A08 且 I 停留 I08

- [ ] **SEF-UT-257** `SharedTransition_Bdd086_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 驗證完才可進入 S03

- [ ] **SEF-UT-258** `SharedTransition_Bdd087_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 必經事件等 A，A 必經事件又等不可達的 I；When Publisher 檢查兩條 Track 與 Shared 依賴圖；Then 拒絕不能到達共同 Ending 的內容

- [ ] **SEF-UT-259** `SharedTransition_Bdd087_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：拒絕不能到達共同 Ending 的內容

- [ ] **SEF-UT-260** `SharedTransition_Bdd087_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：合法可選回訪不被錯誤禁止

- [ ] **SEF-UT-261** `SharedTransition_Bdd088_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 條件採 role、Area、bindingKey 與共享世界事實；When 有人注入未知條件、過深布林或假 role；Then Schema 或 Domain 拒絕非法組合

- [ ] **SEF-UT-262** `SharedTransition_Bdd088_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：Schema 或 Domain 拒絕非法組合

- [ ] **SEF-UT-263** `SharedTransition_Bdd088_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：合法 all、any、not 僅查已提交事實

- [ ] **SEF-UT-264** `SharedTransition_Bdd089_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 玩家已在第一場 Scene 探索多個 Area；When 兩人完成後同意並進入第二場；Then 每個 StorySession 僅一筆 SceneVisit、各自有 Area

- [ ] **SEF-UT-265** `SharedTransition_Bdd089_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：每個 StorySession 僅一筆 SceneVisit、各自有 Area

- [ ] **SEF-UT-266** `SharedTransition_Bdd089_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：跨場次和跨角色同名節點不得互相污染

- [ ] **SEF-UT-267** `WorldState_Bdd090_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given A 詢問店員得到書名但尚未分享；When I 查快照、WS、熱區及可讀 Manifest；Then I 不得看 A 私有節點或答案

- [ ] **SEF-UT-268** `WorldState_Bdd090_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：I 不得看 A 私有節點或答案

- [ ] **SEF-UT-269** `WorldState_Bdd090_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 主動分享後只公開允許的線索

- [ ] **SEF-UT-270** `WorldState_Bdd091_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 書袋由共享世界權威記錄在書架；When 兩名真人以相同 revision 同時 pick；Then 只一個合法 D1 CAS 成功、另一人 409 同步

- [ ] **SEF-UT-271** `WorldState_Bdd091_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只一個合法 D1 CAS 成功、另一人 409 同步

- [ ] **SEF-UT-272** `WorldState_Bdd091_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：物件不複製且不重複完成事件

- [ ] **SEF-UT-273** `WorldState_Bdd092_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given S02 必須 I hold-bag 與 A retrieve-tag；When I 先提交、A 離線後才操作；Then 第一次提交只保留 I 事實且 EventInstance active

- [ ] **SEF-UT-274** `WorldState_Bdd092_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：第一次提交只保留 I 事實且 EventInstance active

- [ ] **SEF-UT-275** `WorldState_Bdd092_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 親提交後才完成一次 shared event

- [ ] **SEF-UT-276** `WorldState_Bdd093_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 同一 EventDefinition 在 I 與 A 各有一個 binding；When 兩人各自完成合法個人探索；Then 兩份不同 scope 的 EventInstance 均存在

- [ ] **SEF-UT-277** `WorldState_Bdd093_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：兩份不同 scope 的 EventInstance 均存在

- [ ] **SEF-UT-278** `WorldState_Bdd093_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：Shared binding 僅有一個共同 instance

- [ ] **SEF-UT-279** `WorldState_Bdd094_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given A 有尚未觸發的隱藏事件；When I 請求 experience、events query 或公開 R2；Then 無 A 私人線索、未知 binding 與私人 R2 key

- [ ] **SEF-UT-280** `WorldState_Bdd094_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：無 A 私人線索、未知 binding 與私人 R2 key

- [ ] **SEF-UT-281** `WorldState_Bdd094_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：只顯示合作狀態的白名單摘要

- [ ] **SEF-UT-282** `SceneInteraction_Bdd095_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given 一場 Scene 只有一筆 SceneVisit；When I 由 entrance 移到 counter 再到 shelves；Then 本人的 Area、鏡頭和可用熱區真實更新

- [ ] **SEF-UT-283** `SceneInteraction_Bdd095_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：本人的 Area、鏡頭和可用熱區真實更新

- [ ] **SEF-UT-284** `SceneInteraction_Bdd095_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不可移至未解鎖或不存在的 Area

- [ ] **SEF-UT-285** `SceneInteraction_Bdd096_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given I 在 entrance 可見濕紙單；When I 親自點 flip 及查看特寫；Then 紙張可見翻面並得到 27 的個人線索

- [ ] **SEF-UT-286** `SceneInteraction_Bdd096_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：紙張可見翻面並得到 27 的個人線索

- [ ] **SEF-UT-287** `SceneInteraction_Bdd096_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：跳過動畫不能跳過 Server 的正式操作

- [ ] **SEF-UT-288** `SceneInteraction_Bdd097_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given I 尚未得到分享線索或選中錯書；When 將 book-wednesday 拖到櫃檯；Then 出現可恢復的具體提示，orderStatus 不變

- [ ] **SEF-UT-289** `SceneInteraction_Bdd097_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：出現可恢復的具體提示，orderStatus 不變

- [ ] **SEF-UT-290** `SceneInteraction_Bdd097_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：依正確資訊重新選書仍可完成

- [ ] **SEF-UT-291** `SceneInteraction_Bdd098_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given A 在櫃檯且店員可交談；When A 親自選擇 query-title；Then 只 A 先看到預訂資訊，分享後 I 才知道

- [ ] **SEF-UT-292** `SceneInteraction_Bdd098_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只 A 先看到預訂資訊，分享後 I 才知道

- [ ] **SEF-UT-293** `SceneInteraction_Bdd098_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：NPC 不能代另一位真人聊天或提交

- [ ] **SEF-UT-294** `SceneInteraction_Bdd099_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given 場景及物件白名單已由 R2 釘選；When Client 提交未授權 objectId、targetSlotId 或 action；Then Server 409／明確拒絕且世界未變

- [ ] **SEF-UT-295** `SceneInteraction_Bdd099_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：Server 409／明確拒絕且世界未變

- [ ] **SEF-UT-296** `SceneInteraction_Bdd099_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：合法 params 才能改 EventInstance 與進度

- [ ] **SEF-UT-297** `ScenePresentation_Bdd100_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；When 兩人完成互動後播放可見演出；Then 鏡頭、物件、兩位真人化身及五表情符合 Cue

- [ ] **SEF-UT-298** `ScenePresentation_Bdd100_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：鏡頭、物件、兩位真人化身及五表情符合 Cue

- [ ] **SEF-UT-299** `ScenePresentation_Bdd100_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini

- [ ] **SEF-UT-300** `ScenePresentation_Bdd101_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given Rain Scene 顯示 AmbientMotion；When 玩家檢視雨絲和玻璃水痕後關閉微動；Then 畫面先有真正移動且關閉後停止循環

- [ ] **SEF-UT-301** `ScenePresentation_Bdd101_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：畫面先有真正移動且關閉後停止循環

- [ ] **SEF-UT-302** `ScenePresentation_Bdd101_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：必要 StoryMotion 仍能播放並且有可讀替代狀態

- [ ] **SEF-UT-303** `ScenePresentation_Bdd102_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given S02 風起已提交且標籤在窗台；When Android/Web 進背景再返回並恢復 Session；Then 根據權威狀態顯示標籤且不重觸發風事件

- [ ] **SEF-UT-304** `ScenePresentation_Bdd102_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：根據權威狀態顯示標籤且不重觸發風事件

- [ ] **SEF-UT-305** `ScenePresentation_Bdd102_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不 autoplay 音效、不重送指令、不再產生五表情

- [ ] **SEF-UT-306** `ScenePresentation_Bdd103_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given Manifest 包含未知 anchor、表情、camera 或 motion；When Publisher 驗證並由 Web/Android 量測正式遊玩；Then 非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據

- [ ] **SEF-UT-307** `ScenePresentation_Bdd103_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據

- [ ] **SEF-UT-308** `ScenePresentation_Bdd103_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不能以缺動畫的純文字替代宣告 Gate B 成功

- [ ] **SEF-UT-309** `RainBookshop_Bdd104_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 雨聲書店 v2 的 I01 和 A01 已釘選；When I 先翻濕紙單、A 停在書架；Then I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立

- [ ] **SEF-UT-310** `RainBookshop_Bdd104_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立

- [ ] **SEF-UT-311** `RainBookshop_Bdd104_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：先行者不推進另一方未完成節點

- [ ] **SEF-UT-312** `RainBookshop_Bdd105_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 看濕紙、A 查書袋外標籤；When 兩人各自 inspect 並讀取 experience；Then 僅本人看到已探索的資訊

- [ ] **SEF-UT-313** `RainBookshop_Bdd105_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅本人看到已探索的資訊

- [ ] **SEF-UT-314** `RainBookshop_Bdd105_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：未經分享不洩漏對方私有節點或觸發

- [ ] **SEF-UT-315** `RainBookshop_Bdd106_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 紙單與 A 袋子已在 counter；When I 先按核對、A 離線重連後再按核對；Then S01 在兩次真實操作後完成並分流 I04／A04

- [ ] **SEF-UT-316** `RainBookshop_Bdd106_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：S01 在兩次真實操作後完成並分流 I04／A04

- [ ] **SEF-UT-317** `RainBookshop_Bdd106_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不由店員代另一方核對

- [ ] **SEF-UT-318** `RainBookshop_Bdd107_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 看兩本海邊書、A 向店員查出正確書；When I 在 A 尚未分享前嘗試領走書；Then 不能完成；A 主動分享後 I 才能選中 book-rain

- [ ] **SEF-UT-319** `RainBookshop_Bdd107_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：不能完成；A 主動分享後 I 才能選中 book-rain

- [ ] **SEF-UT-320** `RainBookshop_Bdd107_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不把 A 私人店員台詞完整傳給 I

- [ ] **SEF-UT-321** `RainBookshop_Bdd108_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 選到 book-wednesday；When I 嘗試放進 counter-slot；Then 提示錯書且 orderStatus 不變

- [ ] **SEF-UT-322** `RainBookshop_Bdd108_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：提示錯書且 orderStatus 不變

- [ ] **SEF-UT-323** `RainBookshop_Bdd108_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：可返回 shelves 重新選擇

- [ ] **SEF-UT-324** `RainBookshop_Bdd109_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given A 知道封套位置且 I 仍在 I05；When A 從 window 取出並送到 counter；Then 只保存 A 的進度和 green-sleeve 位置、S02 不觸發

- [ ] **SEF-UT-325** `RainBookshop_Bdd109_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只保存 A 的進度和 green-sleeve 位置、S02 不觸發

- [ ] **SEF-UT-326** `RainBookshop_Bdd109_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：I 仍可完成自己的找書流程

- [ ] **SEF-UT-327** `RainBookshop_Bdd110_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 正確書及封套已抵達 counter；When S02 風起一次、I hold、A 下線後恢復並取回標籤；Then 標籤只移動一次且 I 的真人提交保留

- [ ] **SEF-UT-328** `RainBookshop_Bdd110_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：標籤只移動一次且 I 的真人提交保留

- [ ] **SEF-UT-329** `RainBookshop_Bdd110_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 取回並放好才完成 Shared

- [ ] **SEF-UT-330** `RainBookshop_Bdd111_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given order-tag-27 位於窗台；When A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得；Then 僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒

- [ ] **SEF-UT-331** `RainBookshop_Bdd111_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒

- [ ] **SEF-UT-332** `RainBookshop_Bdd111_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不產生第二張標籤或重播 S02，並顯示權威物件位置

- [ ] **SEF-UT-333** `RainBookshop_Bdd112_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given S02 completed，I 在 I08；When A 到 counter 開始 verify-order；Then 僅 A 開啟 A08，I 保持 I08

- [ ] **SEF-UT-334** `RainBookshop_Bdd112_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅 A 開啟 A08，I 保持 I08

- [ ] **SEF-UT-335** `RainBookshop_Bdd112_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 真人確認後才啟動 S03

- [ ] **SEF-UT-336** `RainBookshop_Bdd113_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given S03 已解鎖且兩人可選最終意向；When I 親按 look_back、A 親按 rest_chat；Then E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用

- [ ] **SEF-UT-337** `RainBookshop_Bdd113_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用

- [ ] **SEF-UT-338** `RainBookshop_Bdd113_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索

- [ ] **SEF-UT-339** `RainBookshop_Bdd114_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 雙人必經事實與 S03 都有效；When I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）；Then 第二位合法意向提交時 Server 即決定 E01，Chapter／Side 同 D1 交易完成且保存 receipt；Client 收到成功後只演短書架回望，Round active／聊天保留

- [ ] **SEF-UT-340** `RainBookshop_Bdd114_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：E01 只演短書架回望後自然 completed、未完 Side 同交易封存、Round active／聊天保留

- [ ] **SEF-UT-341** `RainBookshop_Bdd114_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：暖光演出不能解鎖新物件／Side 或多一個結束按鈕；跳動畫／重連仍維持完成結果

- [ ] **SEF-UT-342** `RainBookshop_Bdd115_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I/A 不同步且有已提交 requestId；When 重送原 payload、變造 payload、重連及退出；Then 冪等返回原 receipt、變造拒絕、退出後拒寫

- [ ] **SEF-UT-343** `RainBookshop_Bdd115_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：冪等返回原 receipt、變造拒絕、退出後拒寫

- [ ] **SEF-UT-344** `RainBookshop_Bdd115_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不重抽主線或重新呼叫五表情

- [ ] **SEF-UT-345** `RainBookshop_Bdd116_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 玩家已關閉 AmbientMotion 且 S02 可用；When 兩人完成按住書袋和取回標籤；Then 雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚

- [ ] **SEF-UT-346** `RainBookshop_Bdd116_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚

- [ ] **SEF-UT-347** `RainBookshop_Bdd116_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：可以略過表演不能略過操作

- [ ] **SEF-UT-348** `RainBookshop_Bdd117_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-117／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 只發布首條正式雨聲書店並準備兩名真人；When 兩端實玩 I01/A01 至 E01/E02 的所有必經流程；Then 21 節點、四 Area、三次交會與五表情／鏡頭／音效都有可驗證證據

- [ ] **SEF-UT-349** `RainBookshop_Bdd117_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-117／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：21 節點、四 Area、三次交會與五表情／鏡頭／音效都有可驗證證據

- [ ] **SEF-UT-350** `RainBookshop_Bdd117_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-117／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：未取得使用者人工核准不得開始另外九條

- [ ] **SEF-UT-351** `LocalCleanup_Bdd118_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given 僅識別 DatingHigh local DB 與 R2 並有保護資料清單；When 在開發 Gate 模擬清理及重建計畫；Then 只清舊遊戲測資與無用執行內容

- [ ] **SEF-UT-352** `LocalCleanup_Bdd118_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只清舊遊戲測資與無用執行內容

- [ ] **SEF-UT-353** `LocalCleanup_Bdd118_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：未知、遠端、正式環境直接拒絕

- [ ] **SEF-UT-354** `LocalCleanup_Bdd119_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given scene-event.v2 新 runtime 已完整替換原路徑；When 從空 local DB 執行 migration 及引用稽核；Then game_interaction_instances 已無表與索引且雙方 Progress 正確

- [ ] **SEF-UT-355** `LocalCleanup_Bdd119_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：game_interaction_instances 已無表與索引且雙方 Progress 正確

- [ ] **SEF-UT-356** `LocalCleanup_Bdd119_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：保留 Round／聊天／EventReceipt／退出能力

- [ ] **SEF-UT-357** `LocalCleanup_Bdd120_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given 16 款全身與五表情已正式提供且 R2 SHA 釘選；When 清除舊 story-scenes 與 bookmark 發布流程；Then 只有失效的舊入口被移除，正式來源與本劇本素材仍正常

- [ ] **SEF-UT-358** `LocalCleanup_Bdd120_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只有失效的舊入口被移除，正式來源與本劇本素材仍正常

- [ ] **SEF-UT-359** `LocalCleanup_Bdd120_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不能依檔案名稱相似就刪美術成品

- [ ] **SEF-UT-360** `LocalCleanup_Bdd121_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given 首條技術測試全通過但真人試玩尚未核准；When 開發準備製作另外九條正式主線；Then 維持九條擴充 Gate 阻斷並可調整首條

- [ ] **SEF-UT-361** `LocalCleanup_Bdd121_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：維持九條擴充 Gate 阻斷並可調整首條

- [ ] **SEF-UT-362** `LocalCleanup_Bdd121_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不以測試 fixture 或兩個 Ending 當成多條故事

### 新版 Integration：SEF-IT-081～122（42 項，全部待實作）

- [ ] **SEF-IT-081** `ParticipantTrack_Bdd080_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：場次決議已成功且兩名真人身分有效；Server 建立 StorySession
  - **真實邊界斷言**：同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界；任何一筆建立失敗都不能留下半場；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-082** `ParticipantTrack_Bdd081_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 和 A 各位於不同個人節點；I 先完成本人可用的事件
  - **真實邊界斷言**：僅 I 的 node、Area、revision 進步，A 不變；A 可稍後親自完成未玩節點；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-083** `ParticipantTrack_Bdd082_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：Round 已固定原邀請人及接受人；前端假造另一方 role、nodeId 或 accountId
  - **真實邊界斷言**：Server 拒絕假冒且不修改進度；不可用帳號大小或先上線順序決定角色；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-084** `ParticipantTrack_Bdd083_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 前進而 A 還在 A02；A 重新登入取授權 experience
  - **真實邊界斷言**：A 恢復 A02、Area、可操作物件及個人 revision；全域 eventSeq 不能替 A 決策；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-085** `ParticipantTrack_Bdd084_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 的必要節點完成而 A08 未完成；I 嘗試結束本場主線
  - **真實邊界斷言**：chapter 仍是 playing 且 A 可繼續；A 完成及 Shared predicate 齊備才發出一次 chapter.completed；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-086** `SharedTransition_Bdd085_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：S01 兩人真人核對且 I04、A04、S02 都在合法圖中；雙方提交 S01 後分別移至不同區域
  - **真實邊界斷言**：I04、A04 分別開啟並可進 S02 再交會；不修改對方未完成的私人事件；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-087** `SharedTransition_Bdd086_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：S02 完成時 I 在 I08、A 尚未執行 A08；伺服器結算 S02 的合法雙人答案
  - **真實邊界斷言**：只開啟 A08 且 I 停留 I08；A 驗證完才可進入 S03；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-088** `SharedTransition_Bdd087_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 必經事件等 A，A 必經事件又等不可達的 I；Publisher 檢查兩條 Track 與 Shared 依賴圖
  - **真實邊界斷言**：拒絕不能到達共同 Ending 的內容；合法可選回訪不被錯誤禁止；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-089** `SharedTransition_Bdd088_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：條件採 role、Area、bindingKey 與共享世界事實；有人注入未知條件、過深布林或假 role
  - **真實邊界斷言**：Schema 或 Domain 拒絕非法組合；合法 all、any、not 僅查已提交事實；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-090** `SharedTransition_Bdd089_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：玩家已在第一場 Scene 探索多個 Area；兩人完成後同意並進入第二場
  - **真實邊界斷言**：每個 StorySession 僅一筆 SceneVisit、各自有 Area；跨場次和跨角色同名節點不得互相污染；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-091** `WorldState_Bdd090_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：A 詢問店員得到書名但尚未分享；I 查快照、WS、熱區及可讀 Manifest
  - **真實邊界斷言**：I 不得看 A 私有節點或答案；A 主動分享後只公開允許的線索；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-092** `WorldState_Bdd091_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：書袋由共享世界權威記錄在書架；兩名真人以相同 revision 同時 pick
  - **真實邊界斷言**：只一個合法 D1 CAS 成功、另一人 409 同步；物件不複製且不重複完成事件；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-093** `WorldState_Bdd092_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：S02 必須 I hold-bag 與 A retrieve-tag；I 先提交、A 離線後才操作
  - **真實邊界斷言**：第一次提交只保留 I 事實且 EventInstance active；A 親提交後才完成一次 shared event；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-094** `WorldState_Bdd093_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：同一 EventDefinition 在 I 與 A 各有一個 binding；兩人各自完成合法個人探索
  - **真實邊界斷言**：兩份不同 scope 的 EventInstance 均存在；Shared binding 僅有一個共同 instance；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-095** `WorldState_Bdd094_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：A 有尚未觸發的隱藏事件；I 請求 experience、events query 或公開 R2
  - **真實邊界斷言**：無 A 私人線索、未知 binding 與私人 R2 key；只顯示合作狀態的白名單摘要；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-096** `SceneInteraction_Bdd095_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：一場 Scene 只有一筆 SceneVisit；I 由 entrance 移到 counter 再到 shelves
  - **真實邊界斷言**：本人的 Area、鏡頭和可用熱區真實更新；不可移至未解鎖或不存在的 Area；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-097** `SceneInteraction_Bdd096_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：I 在 entrance 可見濕紙單；I 親自點 flip 及查看特寫
  - **真實邊界斷言**：紙張可見翻面並得到 27 的個人線索；跳過動畫不能跳過 Server 的正式操作；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-098** `SceneInteraction_Bdd097_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：I 尚未得到分享線索或選中錯書；將 book-wednesday 拖到櫃檯
  - **真實邊界斷言**：出現可恢復的具體提示，orderStatus 不變；依正確資訊重新選書仍可完成；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-099** `SceneInteraction_Bdd098_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：A 在櫃檯且店員可交談；A 親自選擇 query-title
  - **真實邊界斷言**：只 A 先看到預訂資訊，分享後 I 才知道；NPC 不能代另一位真人聊天或提交；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-100** `SceneInteraction_Bdd099_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：場景及物件白名單已由 R2 釘選；Client 提交未授權 objectId、targetSlotId 或 action
  - **真實邊界斷言**：Server 409／明確拒絕且世界未變；合法 params 才能改 EventInstance 與進度；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-101** `ScenePresentation_Bdd100_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；兩人完成互動後播放可見演出
  - **真實邊界斷言**：鏡頭、物件、兩位真人化身及五表情符合 Cue；缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-102** `ScenePresentation_Bdd101_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：Rain Scene 顯示 AmbientMotion；玩家檢視雨絲和玻璃水痕後關閉微動
  - **真實邊界斷言**：畫面先有真正移動且關閉後停止循環；必要 StoryMotion 仍能播放並且有可讀替代狀態；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-103** `ScenePresentation_Bdd102_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：S02 風起已提交且標籤在窗台；Android/Web 進背景再返回並恢復 Session
  - **真實邊界斷言**：根據權威狀態顯示標籤且不重觸發風事件；不 autoplay 音效、不重送指令、不再產生五表情；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-104** `ScenePresentation_Bdd103_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：Manifest 包含未知 anchor、表情、camera 或 motion；Publisher 驗證並由 Web/Android 量測正式遊玩
  - **真實邊界斷言**：非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據；不能以缺動畫的純文字替代宣告 Gate B 成功；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-105** `RainBookshop_Bdd104_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：雨聲書店 v2 的 I01 和 A01 已釘選；I 先翻濕紙單、A 停在書架
  - **真實邊界斷言**：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立；先行者不推進另一方未完成節點；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-106** `RainBookshop_Bdd105_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 看濕紙、A 查書袋外標籤；兩人各自 inspect 並讀取 experience
  - **真實邊界斷言**：僅本人看到已探索的資訊；未經分享不洩漏對方私有節點或觸發；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-107** `RainBookshop_Bdd106_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **真實邊界斷言**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-108** `RainBookshop_Bdd107_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 看兩本海邊書、A 向店員查出正確書；I 在 A 尚未分享前嘗試領走書
  - **真實邊界斷言**：不能完成；A 主動分享後 I 才能選中 book-rain；不把 A 私人店員台詞完整傳給 I；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-109** `RainBookshop_Bdd108_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 選到 book-wednesday；I 嘗試放進 counter-slot
  - **真實邊界斷言**：提示錯書且 orderStatus 不變；可返回 shelves 重新選擇；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-110** `RainBookshop_Bdd109_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：A 知道封套位置且 I 仍在 I05；A 從 window 取出並送到 counter
  - **真實邊界斷言**：只保存 A 的進度和 green-sleeve 位置、S02 不觸發；I 仍可完成自己的找書流程；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-111** `RainBookshop_Bdd110_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **真實邊界斷言**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-112** `RainBookshop_Bdd111_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **真實邊界斷言**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-113** `RainBookshop_Bdd112_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：S02 completed，I 在 I08；A 到 counter 開始 verify-order
  - **真實邊界斷言**：僅 A 開啟 A08，I 保持 I08；A 真人確認後才啟動 S03；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-114** `RainBookshop_Bdd113_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：S03 已解鎖且兩人可選最終意向；I 親按 look_back、A 親按 rest_chat
  - **真實邊界斷言**：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用；任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-115** `RainBookshop_Bdd114_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：雙人必經事實與 S03 都有效；I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）
  - **真實邊界斷言**：第二位合法意向提交即同 D1 交易完成 E01／Side 封存／receipt；成功回應後才播一次暖光鏡頭，缺 receipt 不得假播成功；沒有可操作新物件／支線或第二個結束命令；跳動畫／重連不再提交；Round active／聊天保留，需使用真 Miniflare D1／R2 而非 fixture 斷言

- [ ] **SEF-IT-116** `RainBookshop_Bdd115_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **真實邊界斷言**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-117** `RainBookshop_Bdd116_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **真實邊界斷言**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-118** `RainBookshop_Bdd117_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-117／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：只發布首條正式雨聲書店並準備兩名真人；兩端實玩 I01/A01 至 E01/E02 的所有必經流程
  - **真實邊界斷言**：21 節點、四 Area、三次交會與五表情／鏡頭／音效都有可驗證證據；未取得使用者人工核准不得開始另外九條；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-119** `LocalCleanup_Bdd118_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：僅識別 DatingHigh local DB 與 R2 並有保護資料清單；在開發 Gate 模擬清理及重建計畫
  - **真實邊界斷言**：只清舊遊戲測資與無用執行內容；未知、遠端、正式環境直接拒絕；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-120** `LocalCleanup_Bdd119_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：scene-event.v2 新 runtime 已完整替換原路徑；從空 local DB 執行 migration 及引用稽核
  - **真實邊界斷言**：game_interaction_instances 已無表與索引且雙方 Progress 正確；保留 Round／聊天／EventReceipt／退出能力；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-121** `LocalCleanup_Bdd120_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：16 款全身與五表情已正式提供且 R2 SHA 釘選；清除舊 story-scenes 與 bookmark 發布流程
  - **真實邊界斷言**：只有失效的舊入口被移除，正式來源與本劇本素材仍正常；不能依檔案名稱相似就刪美術成品；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [ ] **SEF-IT-122** `LocalCleanup_Bdd121_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：首條技術測試全通過但真人試玩尚未核准；開發準備製作另外九條正式主線
  - **真實邊界斷言**：維持九條擴充 Gate 阻斷並可調整首條；不以測試 fixture 或兩個 Ending 當成多條故事；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

## 2026-11-15 新版 API／E2E 測試與追溯

### API／HTTP／WS：SEF-API-028～049（22 項，全部待實作）

- [ ] **SEF-API-028** `StoryEventEndpoint_Bdd080_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：場次決議已成功且兩名真人身分有效；Server 建立 StorySession
  - **HTTP／WS 結果**：同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界；任何一筆建立失敗都不能留下半場。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-029** `StoryEventEndpoint_Bdd081_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 和 A 各位於不同個人節點；I 先完成本人可用的事件
  - **HTTP／WS 結果**：僅 I 的 node、Area、revision 進步，A 不變；A 可稍後親自完成未玩節點。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-030** `StoryEventEndpoint_Bdd082_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：Round 已固定原邀請人及接受人；前端假造另一方 role、nodeId 或 accountId
  - **HTTP／WS 結果**：Server 拒絕假冒且不修改進度；不可用帳號大小或先上線順序決定角色。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-031** `StoryEventEndpoint_Bdd083_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 前進而 A 還在 A02；A 重新登入取授權 experience
  - **HTTP／WS 結果**：A 恢復 A02、Area、可操作物件及個人 revision；全域 eventSeq 不能替 A 決策。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-032** `StoryEventEndpoint_Bdd084_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 的必要節點完成而 A08 未完成；I 嘗試結束本場主線
  - **HTTP／WS 結果**：chapter 仍是 playing 且 A 可繼續；A 完成及 Shared predicate 齊備才發出一次 chapter.completed。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-033** `StoryEventEndpoint_Bdd085_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：S01 兩人真人核對且 I04、A04、S02 都在合法圖中；雙方提交 S01 後分別移至不同區域
  - **HTTP／WS 結果**：I04、A04 分別開啟並可進 S02 再交會；不修改對方未完成的私人事件。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-034** `StoryEventEndpoint_Bdd086_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：S02 完成時 I 在 I08、A 尚未執行 A08；伺服器結算 S02 的合法雙人答案
  - **HTTP／WS 結果**：只開啟 A08 且 I 停留 I08；A 驗證完才可進入 S03。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-035** `StoryEventEndpoint_Bdd090_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：A 詢問店員得到書名但尚未分享；I 查快照、WS、熱區及可讀 Manifest
  - **HTTP／WS 結果**：I 不得看 A 私有節點或答案；A 主動分享後只公開允許的線索。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-036** `StoryEventEndpoint_Bdd091_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：書袋由共享世界權威記錄在書架；兩名真人以相同 revision 同時 pick
  - **HTTP／WS 結果**：只一個合法 D1 CAS 成功、另一人 409 同步；物件不複製且不重複完成事件。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-037** `StoryEventEndpoint_Bdd092_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：S02 必須 I hold-bag 與 A retrieve-tag；I 先提交、A 離線後才操作
  - **HTTP／WS 結果**：第一次提交只保留 I 事實且 EventInstance active；A 親提交後才完成一次 shared event。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-038** `StoryEventEndpoint_Bdd093_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：同一 EventDefinition 在 I 與 A 各有一個 binding；兩人各自完成合法個人探索
  - **HTTP／WS 結果**：兩份不同 scope 的 EventInstance 均存在；Shared binding 僅有一個共同 instance。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-039** `StoryEventEndpoint_Bdd094_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：A 有尚未觸發的隱藏事件；I 請求 experience、events query 或公開 R2
  - **HTTP／WS 結果**：無 A 私人線索、未知 binding 與私人 R2 key；只顯示合作狀態的白名單摘要。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-040** `StoryEventEndpoint_Bdd095_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：一場 Scene 只有一筆 SceneVisit；I 由 entrance 移到 counter 再到 shelves
  - **HTTP／WS 結果**：本人的 Area、鏡頭和可用熱區真實更新；不可移至未解鎖或不存在的 Area。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-041** `StoryEventEndpoint_Bdd096_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 在 entrance 可見濕紙單；I 親自點 flip 及查看特寫
  - **HTTP／WS 結果**：紙張可見翻面並得到 27 的個人線索；跳過動畫不能跳過 Server 的正式操作。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-042** `StoryEventEndpoint_Bdd097_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 尚未得到分享線索或選中錯書；將 book-wednesday 拖到櫃檯
  - **HTTP／WS 結果**：出現可恢復的具體提示，orderStatus 不變；依正確資訊重新選書仍可完成。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-043** `StoryEventEndpoint_Bdd098_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：A 在櫃檯且店員可交談；A 親自選擇 query-title
  - **HTTP／WS 結果**：只 A 先看到預訂資訊，分享後 I 才知道；NPC 不能代另一位真人聊天或提交。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-044** `StoryEventEndpoint_Bdd099_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：場景及物件白名單已由 R2 釘選；Client 提交未授權 objectId、targetSlotId 或 action
  - **HTTP／WS 結果**：Server 409／明確拒絕且世界未變；合法 params 才能改 EventInstance 與進度。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-045** `StoryEventEndpoint_Bdd106_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **HTTP／WS 結果**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-046** `StoryEventEndpoint_Bdd110_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **HTTP／WS 結果**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-047** `StoryEventEndpoint_Bdd111_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **HTTP／WS 結果**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-048** `StoryEventEndpoint_Bdd115_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **HTTP／WS 結果**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [ ] **SEF-API-049** `StoryEventEndpoint_Bdd116_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **HTTP／WS 結果**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

### Web／Android E2E：SEF-ET-041～072（32 項，全部待實作）

- [ ] **SEF-ET-041** `StoryExperienceWeb_Bdd100_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；兩人完成互動後播放可見演出
  - **必須觀察的實際結果**：鏡頭、物件、兩位真人化身及五表情符合 Cue；缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-042** `StoryExperienceAndroid_Bdd100_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；兩人完成互動後播放可見演出
  - **必須觀察的實際結果**：鏡頭、物件、兩位真人化身及五表情符合 Cue；缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-043** `StoryExperienceWeb_Bdd101_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：Rain Scene 顯示 AmbientMotion；玩家檢視雨絲和玻璃水痕後關閉微動
  - **必須觀察的實際結果**：畫面先有真正移動且關閉後停止循環；必要 StoryMotion 仍能播放並且有可讀替代狀態。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-044** `StoryExperienceAndroid_Bdd101_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：Rain Scene 顯示 AmbientMotion；玩家檢視雨絲和玻璃水痕後關閉微動
  - **必須觀察的實際結果**：畫面先有真正移動且關閉後停止循環；必要 StoryMotion 仍能播放並且有可讀替代狀態。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-045** `StoryExperienceWeb_Bdd104_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：雨聲書店 v2 的 I01 和 A01 已釘選；I 先翻濕紙單、A 停在書架
  - **必須觀察的實際結果**：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立；先行者不推進另一方未完成節點。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-046** `StoryExperienceAndroid_Bdd104_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：雨聲書店 v2 的 I01 和 A01 已釘選；I 先翻濕紙單、A 停在書架
  - **必須觀察的實際結果**：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立；先行者不推進另一方未完成節點。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-047** `StoryExperienceWeb_Bdd105_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 看濕紙、A 查書袋外標籤；兩人各自 inspect 並讀取 experience
  - **必須觀察的實際結果**：僅本人看到已探索的資訊；未經分享不洩漏對方私有節點或觸發。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-048** `StoryExperienceAndroid_Bdd105_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 看濕紙、A 查書袋外標籤；兩人各自 inspect 並讀取 experience
  - **必須觀察的實際結果**：僅本人看到已探索的資訊；未經分享不洩漏對方私有節點或觸發。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-049** `StoryExperienceWeb_Bdd106_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **必須觀察的實際結果**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-050** `StoryExperienceAndroid_Bdd106_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **必須觀察的實際結果**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-051** `StoryExperienceWeb_Bdd107_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 看兩本海邊書、A 向店員查出正確書；I 在 A 尚未分享前嘗試領走書
  - **必須觀察的實際結果**：不能完成；A 主動分享後 I 才能選中 book-rain；不把 A 私人店員台詞完整傳給 I。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-052** `StoryExperienceAndroid_Bdd107_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 看兩本海邊書、A 向店員查出正確書；I 在 A 尚未分享前嘗試領走書
  - **必須觀察的實際結果**：不能完成；A 主動分享後 I 才能選中 book-rain；不把 A 私人店員台詞完整傳給 I。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-053** `StoryExperienceWeb_Bdd108_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 選到 book-wednesday；I 嘗試放進 counter-slot
  - **必須觀察的實際結果**：提示錯書且 orderStatus 不變；可返回 shelves 重新選擇。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-054** `StoryExperienceAndroid_Bdd108_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 選到 book-wednesday；I 嘗試放進 counter-slot
  - **必須觀察的實際結果**：提示錯書且 orderStatus 不變；可返回 shelves 重新選擇。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-055** `StoryExperienceWeb_Bdd109_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：A 知道封套位置且 I 仍在 I05；A 從 window 取出並送到 counter
  - **必須觀察的實際結果**：只保存 A 的進度和 green-sleeve 位置、S02 不觸發；I 仍可完成自己的找書流程。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-056** `StoryExperienceAndroid_Bdd109_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：A 知道封套位置且 I 仍在 I05；A 從 window 取出並送到 counter
  - **必須觀察的實際結果**：只保存 A 的進度和 green-sleeve 位置、S02 不觸發；I 仍可完成自己的找書流程。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-057** `StoryExperienceWeb_Bdd110_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **必須觀察的實際結果**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-058** `StoryExperienceAndroid_Bdd110_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **必須觀察的實際結果**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-059** `StoryExperienceWeb_Bdd111_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **必須觀察的實際結果**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-060** `StoryExperienceAndroid_Bdd111_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **必須觀察的實際結果**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-061** `StoryExperienceWeb_Bdd112_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：S02 completed，I 在 I08；A 到 counter 開始 verify-order
  - **必須觀察的實際結果**：僅 A 開啟 A08，I 保持 I08；A 真人確認後才啟動 S03。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-062** `StoryExperienceAndroid_Bdd112_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：S02 completed，I 在 I08；A 到 counter 開始 verify-order
  - **必須觀察的實際結果**：僅 A 開啟 A08，I 保持 I08；A 真人確認後才啟動 S03。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-063** `StoryExperienceWeb_Bdd113_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：S03 已解鎖且兩人可選最終意向；I 親按 look_back、A 親按 rest_chat
  - **必須觀察的實際結果**：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用；任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-064** `StoryExperienceAndroid_Bdd113_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：S03 已解鎖且兩人可選最終意向；I 親按 look_back、A 親按 rest_chat
  - **必須觀察的實際結果**：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用；任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-065** `StoryExperienceWeb_Bdd114_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：雙人必經事實與 S03 都有效；I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）
  - **必須觀察的實際結果**：E01 只演短書架回望後自然 completed、未完 Side 同交易封存、Round active／聊天保留；暖光演出不能解鎖新物件／Side 或多一個結束按鈕；跳動畫／重連仍維持完成結果。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-066** `StoryExperienceAndroid_Bdd114_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：雙人必經事實與 S03 都有效；I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）
  - **必須觀察的實際結果**：E01 只演短書架回望後自然 completed、未完 Side 同交易封存、Round active／聊天保留；暖光演出不能解鎖新物件／Side 或多一個結束按鈕；跳動畫／重連仍維持完成結果。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-067** `StoryExperienceWeb_Bdd115_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **必須觀察的實際結果**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-068** `StoryExperienceAndroid_Bdd115_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **必須觀察的實際結果**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-069** `StoryExperienceWeb_Bdd116_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **必須觀察的實際結果**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-070** `StoryExperienceAndroid_Bdd116_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **必須觀察的實際結果**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-071** `StoryExperienceWeb_Bdd117_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-117／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：只發布首條正式雨聲書店並準備兩名真人；兩端實玩 I01/A01 至 E01/E02 的所有必經流程
  - **必須觀察的實際結果**：21 節點、四 Area、三次交會與五表情／鏡頭／音效都有可驗證證據；未取得使用者人工核准不得開始另外九條。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [ ] **SEF-ET-072** `StoryExperienceAndroid_Bdd117_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-117／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：只發布首條正式雨聲書店並準備兩名真人；兩端實玩 I01/A01 至 E01/E02 的所有必經流程
  - **必須觀察的實際結果**：21 節點、四 Area、三次交會與五表情／鏡頭／音效都有可驗證證據；未取得使用者人工核准不得開始另外九條。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

### 新版 BDD → TDD 完整追溯（42/42）

| BDD / SPEC AC | Unit（3 項） | Integration | API | Web / Android E2E |
|---|---|---|---|---|
| BDD-080／AC-018 | UT-237～239 | IT-081 | API-028 | — |
| BDD-081／AC-018 | UT-240～242 | IT-082 | API-029 | — |
| BDD-082／AC-018 | UT-243～245 | IT-083 | API-030 | — |
| BDD-083／AC-018 | UT-246～248 | IT-084 | API-031 | — |
| BDD-084／AC-019 | UT-249～251 | IT-085 | API-032 | — |
| BDD-085／AC-019 | UT-252～254 | IT-086 | API-033 | — |
| BDD-086／AC-019 | UT-255～257 | IT-087 | API-034 | — |
| BDD-087／AC-019 | UT-258～260 | IT-088 | — | — |
| BDD-088／AC-019 | UT-261～263 | IT-089 | — | — |
| BDD-089／AC-019 | UT-264～266 | IT-090 | — | — |
| BDD-090／AC-020 | UT-267～269 | IT-091 | API-035 | — |
| BDD-091／AC-020 | UT-270～272 | IT-092 | API-036 | — |
| BDD-092／AC-020 | UT-273～275 | IT-093 | API-037 | — |
| BDD-093／AC-020 | UT-276～278 | IT-094 | API-038 | — |
| BDD-094／AC-020 | UT-279～281 | IT-095 | API-039 | — |
| BDD-095／AC-021 | UT-282～284 | IT-096 | API-040 | — |
| BDD-096／AC-021 | UT-285～287 | IT-097 | API-041 | — |
| BDD-097／AC-021 | UT-288～290 | IT-098 | API-042 | — |
| BDD-098／AC-021 | UT-291～293 | IT-099 | API-043 | — |
| BDD-099／AC-021 | UT-294～296 | IT-100 | API-044 | — |
| BDD-100／AC-022 | UT-297～299 | IT-101 | — | ET-041、ET-042 |
| BDD-101／AC-022 | UT-300～302 | IT-102 | — | ET-043、ET-044 |
| BDD-102／AC-022 | UT-303～305 | IT-103 | — | — |
| BDD-103／AC-022 | UT-306～308 | IT-104 | — | — |
| BDD-104／AC-023 | UT-309～311 | IT-105 | — | ET-045、ET-046 |
| BDD-105／AC-023 | UT-312～314 | IT-106 | — | ET-047、ET-048 |
| BDD-106／AC-023 | UT-315～317 | IT-107 | API-045 | ET-049、ET-050 |
| BDD-107／AC-023 | UT-318～320 | IT-108 | — | ET-051、ET-052 |
| BDD-108／AC-023 | UT-321～323 | IT-109 | — | ET-053、ET-054 |
| BDD-109／AC-023 | UT-324～326 | IT-110 | — | ET-055、ET-056 |
| BDD-110／AC-023 | UT-327～329 | IT-111 | API-046 | ET-057、ET-058 |
| BDD-111／AC-023 | UT-330～332 | IT-112 | API-047 | ET-059、ET-060 |
| BDD-112／AC-023 | UT-333～335 | IT-113 | — | ET-061、ET-062 |
| BDD-113／AC-023 | UT-336～338 | IT-114 | — | ET-063、ET-064 |
| BDD-114／AC-023 | UT-339～341 | IT-115 | — | ET-065、ET-066 |
| BDD-115／AC-023 | UT-342～344 | IT-116 | API-048 | ET-067、ET-068 |
| BDD-116／AC-023 | UT-345～347 | IT-117 | API-049 | ET-069、ET-070 |
| BDD-117／AC-023 | UT-348～350 | IT-118 | — | ET-071、ET-072 |
| BDD-118／AC-024 | UT-351～353 | IT-119 | — | — |
| BDD-119／AC-024 | UT-354～356 | IT-120 | — | — |
| BDD-120／AC-024 | UT-357～359 | IT-121 | — | — |
| BDD-121／AC-023 | UT-360～362 | IT-122 | — | — |

## 2026-11-16 RiskAudit 十組缺漏正式補強測試（20 項）

**決策基線**：使用者明確確認 `V2-RQ-01=A`；每組 `SEF-V2-GAP-01～10` 各補兩項可獨立驗證的測試，全部維持未實作 `- [ ]`。此 20 項原本**沒有**計入 605，現正式加入後為 **625**；這是新增規劃，並非已通過證據。

| GAP | 正式 TDD 測試 | 對應 BDD | 狀態 |
|---|---|---|---|
| SEF-V2-GAP-01 | SEF-IT-123、SEF-IT-124 | BDD-092/110、BDD-080/092 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-02 | SEF-IT-125、SEF-IT-126 | BDD-091/111、BDD-082/111 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-03 | SEF-API-050、SEF-API-051 | BDD-090/094/105、BDD-094/107 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-04 | SEF-UT-363、SEF-UT-364 | BDD-085/087/089、BDD-087/088 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-05 | SEF-UT-365、SEF-API-052 | BDD-095/099/103、BDD-096/099/103 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-06 | SEF-IT-127、SEF-IT-128 | BDD-118、BDD-118/119/120 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-07 | SEF-UT-366、SEF-IT-129 | BDD-104/117、BDD-104/117 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-08 | SEF-API-053、SEF-ET-073 | BDD-098/113/114、BDD-098/113 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-09 | SEF-ET-074、SEF-ET-075 | BDD-100/116、BDD-101/102/116 | 已補入文件；待 well-done 驗證 |
| SEF-V2-GAP-10 | SEF-ET-076、SEF-ET-077 | BDD-114/117、BDD-113/114/121 | 已補入文件；待 well-done 驗證 |

### Unit／Domain 與 Publisher（4 項）

- [ ] **SEF-UT-363** `TrackGraph_WhenThreeCrossingsAndOptionalCycle_ValidatesEndings`（高）
  - **來源**：`SEF-V2-GAP-04`；`SEF-BDD-085／SEF-BDD-087／SEF-BDD-089`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：I/A 交替三次交會、Shared→A-only，另有有界可選回訪
  - **預期斷言**：Publisher 接受合法圖且所有必經角色可到達 Ending，不錯誤重置對方 Node
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

- [ ] **SEF-UT-364** `TrackGraph_WhenRequiredCrossTrackCycle_RejectsDeadlock`（高）
  - **來源**：`SEF-V2-GAP-04`；`SEF-BDD-087／SEF-BDD-088`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：I 必經事件等待 A，而 A 也只可由不可達的 I 後續事件解鎖
  - **預期斷言**：Publisher 拒絕必經死鎖與不可達 Ending，不誤判有界可選回訪
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

- [ ] **SEF-UT-365** `SceneEventPolicy_WhenUnknownAreaObjectSlotOrAction_FailsClosed`（高）
  - **來源**：`SEF-V2-GAP-05`；`SEF-BDD-095／SEF-BDD-099／SEF-BDD-103`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：move-area／manipulate-object／NPC 傳入未知 Area、objectId、slot、module 或 params
  - **預期斷言**：嚴格 Schema／Domain 拒絕、無受控物件的偽造效果，缺 Cue 或素材不得發布
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

- [ ] **SEF-UT-366** `RainBookshopPublisher_WhenNodeOrCueMissing_RejectsManifest`（高）
  - **來源**：`SEF-V2-GAP-07`；`SEF-BDD-104／SEF-BDD-117`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：21 Node、四 Area、三次交會、兩 Ending 及正式 Cue 中缺任何必經台詞、物件或素材 hash
  - **預期斷言**：版本化 Publisher 逐項檢查 RB-01～14 與 SDD，缺必經內容一律拒絕，不用 fixture 湊內容
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

### 真 D1／R2／local Integration（7 項）

- [ ] **SEF-IT-123** `SharedEvent_WhenSecondActorRevisionStale_KeepsFirstSubmission`（高）
  - **來源**：`SEF-V2-GAP-01`；`SEF-BDD-092／SEF-BDD-110`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 已提交 hold-bag，A 以過時 sharedRevision 交 retrieve-tag
  - **預期斷言**：A 得 409；S02 未完成；I 已提交且有效的真人答案與 receipt 保留；雙 Track 及 WorldState 無半套狀態
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [ ] **SEF-IT-124** `StorySession_WhenAtomicD1BatchFails_RollsBackAllFacts`（高）
  - **來源**：`SEF-V2-GAP-01`；`SEF-BDD-080／SEF-BDD-092`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：真 D1 故障注入第二個真人合法操作的 EventInstance、Progress、WorldState 或 game_round_events 寫入
  - **預期斷言**：同一交易完全 rollback，無 shared completed、無額外 eventSeq/receipt、未誤推進兩人
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [ ] **SEF-IT-125** `OrderTag_WhenSameActorTwoDevicesRace_HasSingleWinner`（高）
  - **來源**：`SEF-V2-GAP-02`；`SEF-BDD-091／SEF-BDD-111`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：A 同帳號兩裝置以同一 sharedRevision 同時 pick order-tag-27
  - **預期斷言**：只能一個合法 CAS 成功；敗者讀回權威狀態，標籤唯一、不二次完成 S02
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [ ] **SEF-IT-126** `OrderTag_WhenInviterSpoofsAcceptorAction_RejectsWrite`（高）
  - **來源**：`SEF-V2-GAP-02`；`SEF-BDD-082／SEF-BDD-111`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 猜到 A 專用 Binding／action 並帶偽造 role／accountId
  - **預期斷言**：拒絕操作且 EventInstance／WorldState／兩個 Progress 均不變
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [ ] **SEF-IT-127** `LocalCleanup_WhenUnknownOrRemoteEnvironment_RefusesMutation`（高）
  - **來源**：`SEF-V2-GAP-06`；`SEF-BDD-118`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：未知 DB／R2 bucket、remote/SIT/prod 路徑、未完成停寫與備份
  - **預期斷言**：Local wrapper 必須停止，不執行 DROP／DELETE，不破壞帳號、角色與資料
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [ ] **SEF-IT-128** `LocalCleanup_WhenLocalRebuilt_PreservesIdentityAndDropsLegacy`（高）
  - **來源**：`SEF-V2-GAP-06`；`SEF-BDD-118／SEF-BDD-119／SEF-BDD-120`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：確定 local、先停寫備份再 clean rebuild，保留帳號／個資／正式角色 hash
  - **預期斷言**：game_interaction_instances 和所有正式 Legacy 引用消失；真 D1 FK／索引與聊天、退出仍可運作
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [ ] **SEF-IT-129** `RainBookshopR2_WhenHashTampered_RejectsAndKeepsPinnedScene`（高）
  - **來源**：`SEF-V2-GAP-07`；`SEF-BDD-104／SEF-BDD-117`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：釘選已發布 v2 Scene/Narrative/Event，R2 缺檔、被篡改或 SHA 不符
  - **預期斷言**：Worker fail closed，不重抽主線或退回 bookmark 舊內容；重連仍讀原合法釘選版本
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

### API／HTTP／WS（4 項）

- [ ] **SEF-API-050** `Experience_WhenPartnerCluePrivate_OmitsSecretProjection`（高）
  - **來源**：`SEF-V2-GAP-03`；`SEF-BDD-090／SEF-BDD-094／SEF-BDD-105`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：A 已問到正確書名但未分享，I 讀 /experience／events query／WS
  - **預期斷言**：I 無 A 私有節點／未解鎖 binding／書名／私人 R2 key；僅 A 親分享後公開有限摘要
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

- [ ] **SEF-API-051** `PublishedContent_WhenHiddenTrackRequested_NeverExposesRawManifest`（高）
  - **來源**：`SEF-V2-GAP-03`；`SEF-BDD-094／SEF-BDD-107`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：I 嘗試由公開 R2、cache 與內容 URL 取得 A 私人分支與 R2 物件
  - **預期斷言**：禁止未授權的 raw private Manifest／隱藏資料；僅 actor-scoped 精簡投影可讀
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

- [ ] **SEF-API-052** `StoryEvent_WhenInvalidParamsOrVersion_RejectsWithoutReceipt`（高）
  - **來源**：`SEF-V2-GAP-05`；`SEF-BDD-096／SEF-BDD-099／SEF-BDD-103`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：HTTP/WS 帶未知 actionId/slot、額外參數、過期 Track/Shared/Event revision
  - **預期斷言**：回正確拒絕／409，不寫 D1 receipt/eventSeq/WorldState，不廣播成功 WS
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

- [ ] **SEF-API-053** `NpcDialogue_WhenActorSpoofed_NeverProducesPartnerMessage`（高）
  - **來源**：`SEF-V2-GAP-08`；`SEF-BDD-098／SEF-BDD-113／SEF-BDD-114`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：Client 在 NPC 對話或意向提交時造假另一人 accountId/chat author
  - **預期斷言**：只記合法 caller 的操作，NPC 台詞不能變成另一真人 message.committed
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

### Web／Android E2E（5 項）

- [ ] **SEF-ET-073** `StoryStage_WhenNpcAndPartnerSpeak_DisplaysCorrectAttribution`（高）
  - **來源**：`SEF-V2-GAP-08`；`SEF-BDD-098／SEF-BDD-113`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：店員／旁白／兩名真人在 Web／Android 同場，兩人各有私有選項
  - **預期斷言**：畫面標明 NPC，不替另一真人發聊天或選意向；每位真人需自行按下操作
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [ ] **SEF-ET-074** `AmbientMotionWeb_WhenDisabled_PreservesStoryMotion`（高）
  - **來源**：`SEF-V2-GAP-09`；`SEF-BDD-100／SEF-BDD-116`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Web 關閉 AmbientMotion，S02 仍可觸發
  - **預期斷言**：雨滴循環停止但必要標籤飛出／取回可看見或安全略過，保留真實互動延遲記錄
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [ ] **SEF-ET-075** `AmbientMotionAndroid_WhenResumed_DoesNotReplayStoryCue`（高）
  - **來源**：`SEF-V2-GAP-09`；`SEF-BDD-101／SEF-BDD-102／SEF-BDD-116`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Android S02 完成後退背景再恢復並切換化身
  - **預期斷言**：不重移動標籤、重播音效或 Gemini 產圖；以快照恢復，留 jank／記憶體／延遲證據
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [ ] **SEF-ET-076** `RainBookshopWeb_WhenBothLookBack_CompletesWithoutEpilogue`（高）
  - **來源**：`SEF-V2-GAP-10`；`SEF-BDD-114／SEF-BDD-117`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Web 兩人各自選 look_back（再看一眼書架，替今天畫個句點）
  - **預期斷言**：Server 收到第二份合法 look_back 即同 D1 交易 completed／封存 Side／保存 receipt；Client 確認成功後只播一次短鏡頭，沒有新熱區／支線／結束按鈕；失敗不先顯示成功，Round 聊天保留
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [ ] **SEF-ET-077** `RainBookshopAndroid_WhenChoicesDiffer_UsesE02AndKeepsGate`（高）
  - **來源**：`SEF-V2-GAP-10`；`SEF-BDD-113／SEF-BDD-114／SEF-BDD-121`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Android/Web 真人分選 look_back／rest_chat，亦驗雙 look_back
  - **預期斷言**：第二份合法意向提交時 Server 同交易選定 Ending／封存未完 Side／保存 receipt；不同意向必 E02、雙 look_back 才 E01；Client 不需再送完成命令，兩者自然收尾且聊天保留；人工 Gate B 未核准不製作其餘九條
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

### 新版分層計數與最終追溯

- Phase 3：Unit **126**、Integration **42**、API **22**、E2E **32**，共 **222** 項。
- Phase 4 稽核補強：Unit **4**（UT-363～366）、Integration **7**（IT-123～129）、API **4**（API-050～053）、E2E **5**（ET-073～077），共 **20** 項，十組 SEF-V2-GAP 各兩項。
- 舊版 **383** 項保留、新版新增 **242** 項；總計 **625** 項，原有 **56/383** 完整覆核通過、新版 **0/242**，故目前整體 **56/625**（9.0%）。不可用測試函式執行數代替完整案例覆核。
- **121/121 BDD** 均有明確 SPEC AC 追溯：舊版 79、新版 42；新增 BDD-080～121 對應 TDD 原 Phase 3 的 222 項，稽核 GAP 的 20 項亦標示對應 BDD；**RB-01～14** 均有至少一個 BDD、Unit、Integration 與 Web／Android 雙平台 E2E，最終仍須真人 Gate B。

## 規劃交接紀錄

**交接狀態：Ready for well-done（只代表本 SPEC 的規劃可交開發）**

**最後確認日期：2026-11-16**
**唯一工作範圍**：`SPEC-001-SceneEventFramework` — 最新雙 Track／共享世界／雨聲書店「被雨打亂的最後一單」首條正式遊戲及舊引擎清理。
**決策**：`V2-RQ-01=A`（使用者明確確認）。E01 選項＝「再看一眼書架，替今天畫個句點」，只有短暫書架鏡頭／暖光，隨即自然 completed 且封存未完 Side；保留 Round 聊天，不開新探索、不加結束按鈕。E02 是不同意向的自然完成。

### 文件包與實作順序

| 類型 | 文件路徑 | 階段狀態 |
|---|---|---|
| MVP | `docs/requirements/MVP-001-LoveGameDatingApp.md` | AC-005-04～23 已確認，原業務決策保留 |
| SPEC / SDD | `docs/specs/SPEC-001-SceneEventFramework.md` | SEF-AC-001～024；兩人不同 Track／共享世界／21 Node 雨聲書店／E01 A 已確認 |
| BDD | `docs/bdd/SPEC-001-SceneEventFramework-BDD.md` | 121 場景已追溯，新增 BDD-080～121 尚未實作 |
| TDD | `docs/tdd/SPEC-001-SceneEventFramework-TDD.md` | 625 項規劃，新增 V2-GAP 的 20 項未實作 |
| RiskAudit | `docs/specs/SPEC-001-SceneEventFramework-RiskAudit.md` | 新 12 風險、10 GAP 均有定案／測試落點，無待確認決策 |
| Verification | `docs/verification/SPEC-001-SceneEventFramework-Verification.md` | 規劃與 runner 實際結果分開，首條人工 Gate B 待實測 |

**Gate 1**：先完成 SceneContent `scene-event.v2` Publisher、雙人 Progress／WorldState D1、統一 EventInstance 與 authorizer、嚴格 CAS／receipt，從**已確認的 DatingHigh local** 清測試資料並建最終 Schema；必須移除舊 `game_interaction_instances` 及已無正式依賴的單線命令，不遷移未上線的舊故事狀態，保護帳號、照片、正式角色及非本次資料。

**Gate 2**：唯一先做「被雨打亂的最後一單」完整 21 Node（I01～I08、A01～A08、S01～S03、E01～E02）、四 Area、三次交會、回單方 A08、真物件／NPC 操作、正式全身五表情／2.5D／音效／可辨微動，依 `RB-01～14` 與 Web／Android 真雙人雙平台完整驗證 E01／E02。使用者親自試玩調校、**明確通過 Gate B 才能製作另外九條**，不以 fixture／自動化代簽。

### 已確認風險與處置（新版 12 項）

| 風險 ID | 處置依據／使用者決策 | 已補回的落點與 well-done 必驗要求 |
|---|---|---|
| `SEF-V2-RA-01` | 兩人獨立 Track、D1 同交易建立，無第三條玩家進度（既定 SDD） | SDD §3.5/4/6；BDD-080～084；IT-123/124，真 D1 rollback |
| `SEF-V2-RA-02` | Shared 真人分開提交、CAS 僅結算一次（既定 SDD） | SDD §6；BDD-092/110；IT-123～126，雙人競態與冪等 |
| `SEF-V2-RA-03` | 只下發登入 actor 可看資訊、私人線索未分享不得見（既定 SDD） | SDD §3.3/6；BDD-090/094；API-050/051，R2/WS 洩漏負例 |
| `SEF-V2-RA-04` | unlock 不代另一人的 currentNode，必經圖不得互等死鎖（既定 SDD） | SDD §3.3/3.5；BDD-085～089；UT-363/364 |
| `SEF-V2-RA-05` | 未上線故事測資可在已確認 local 重建，無用資料表/程式移除（既定 SDD） | SDD §7.1；BDD-118～120；IT-127/128，未知／遠端拒清 |
| `SEF-V2-RA-06` | 全部正式內容只用受控 v2 Publisher 和 module registry | SDD §3.7/4.3；BDD-095～103；UT-365、API-052 |
| `SEF-V2-RA-07` | 雨聲書店 21 Node、四 Area、3 次交會、兩 Ending 對照實際發布內容 | SDD §3.8；RB-01～14；UT-366、IT-129，內容 SHA 與素材 |
| `SEF-V2-RA-08` | A 專屬取標籤、I 越權拒絕的衝突已修正 | SDD RB-08／BDD-111／TDD UT-330～332、IT-125/126 |
| `SEF-V2-RA-09` | **使用者 V2-RQ-01=A**：回望書架只有短鏡頭且直接 completed | SDD E01/S03/RB-10/11、BDD-113/114、ET-076/077 |
| `SEF-V2-RA-10` | NPC 不代人發訊息、真人選項須本人提交（既定 SDD） | SDD §3.8、BDD-098；API-053、ET-073 |
| `SEF-V2-RA-11` | AmbientMotion 與 StoryMotion 分離，正式素材／五表情不退化 | SDD §3.7/3.8.5；BDD-100～103；ET-074/075 |
| `SEF-V2-RA-12` | 第一條正式雙人試玩為不可代簽的 Gate，其他九條延後 | SDD §7、BDD-117/121；ET-076/077，使用者人工核准 |

以上風險在**規劃層**均已以使用者決策或已確認設計防護與明確測試處置，**不是**宣稱風險在實際程式已消除；先前 `SEF-RQ-01～03`、`RA-Q1/Q2` 及原 12 項 SEF-RA／8 項 UX-RA 均保留原有效決策，重點核證照舊。

### 已補回風險缺漏（10/10 組，新增 20 個 TDD）

| 缺漏 | 來源風險 | 測試落點 | 規劃狀態 |
|---|---|---|---|
| `SEF-V2-GAP-01` | RA-01/02 | IT-123、IT-124 | 已補回 TDD |
| `SEF-V2-GAP-02` | RA-02/08 | IT-125、IT-126 | 已補回 TDD |
| `SEF-V2-GAP-03` | RA-03 | API-050、API-051 | 已補回 TDD |
| `SEF-V2-GAP-04` | RA-04 | UT-363、UT-364 | 已補回 TDD |
| `SEF-V2-GAP-05` | RA-06 | UT-365、API-052 | 已補回 TDD |
| `SEF-V2-GAP-06` | RA-05 | IT-127、IT-128 | 已補回 TDD |
| `SEF-V2-GAP-07` | RA-07 | UT-366、IT-129 | 已補回 TDD |
| `SEF-V2-GAP-08` | RA-10 | API-053、ET-073 | 已補回 TDD |
| `SEF-V2-GAP-09` | RA-11 | ET-074、ET-075 | 已補回 TDD |
| `SEF-V2-GAP-10` | RA-09/12 | ET-076、ET-077 | 已補回 TDD |

### 實作注意事項與安全界線

- 必須由 `well-done` 先接手 Red→Green→Refactor；正式授權、資料競態與端點需真 Miniflare D1／R2／HTTP／WS runner 證據，真 Web／Android 遊玩與人物／動畫／效能不可用 API fixture 假稱通過。
- 不降低原 StoryDialogueAndExit、AvatarAndPreferences 的 B1、UX-P1～P5、16 款全身免費角色／80 張五表情、原人物畫風／素材來源、真化身採用授權及 Gate B，不再生成已有完整版本的五表情。
- 同場保持單一 Scene、多 Area／每人獨立 Track；故事內容必須以 **`scene-event.v2` 已審核 Publisher** 發布，且實作與 TDD／BDD 指定的 Node、台詞、Cue、Binding、物件及兩 Ending 全部吻合。不得保留另一套舊 runtime。
- 未知 local 位置、非本需求資料、SIT／production 等未獲授權環境，停止清理；不改其他專案、不引入 SQL Trigger、不得把測試通過率與規劃覆蓋率混算。
- MVP-002 AI 動態主線、跨 Scene 自由移動、History／Housekeeping、好感／約會／告白及其資料表都不屬於本輪範圍。

### 不得進入開發的阻斷項

**無（規劃層）**。V2-RQ-01=A 已由使用者明確確認，新增 12 項風險均有處置、10 組 GAP 均已補回正式 TDD；**Ready for well-done** 僅表示可開始按本 SPEC 的 Gate 1／2 進行程式實作。任何真實 runner 失敗、未授權 DB、素材缺失或人工 Gate B 尚未核准，都必須依實作 Gate 保留相應阻斷，不能自行降低標準。
