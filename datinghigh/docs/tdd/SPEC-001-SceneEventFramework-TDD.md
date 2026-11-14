# SPEC-001-SceneEventFramework — TDD 測試清單

> **來源 MVP**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md)；**已確認 SDD**：[SceneEventFramework](../specs/SPEC-001-SceneEventFramework.md)；**BDD**：[79 場景](../bdd/SPEC-001-SceneEventFramework-BDD.md)
> **生成日期**：2026-11-12；**規劃狀態**：**Ready for well-done（規劃交接）**；SDD／RiskAudit 全部人工確認、TDD 已補強；**依使用者要求暫停；首條主流程與本人化身入口已驗證，整份規格尚未結案**；實作與 runner 證據見 [驗證紀錄](../verification/SPEC-001-SceneEventFramework-Verification.md)。

## 開發進度總覽

```text
📦 SceneEventFramework / Red-Green-Refactor
├─ 狀態：依使用者要求暫停；首條主流程及本人入口已驗證，整份規格未結案
├─ BDD：1/79
├─ TDD：56/383（14.6%；依完整斷言覆核，不以 runner 數量換算）
├─ 前置 Gate：既有雨聲書店及全身化身仍有獨立未結案驗收
└─ 開發次序：先 1 條完整主線→使用者試玩調校確認→其餘 9 條
```

### 分層進度追蹤

| 層級 | 已完成 | 待實作 | 指定測試入口 |
|---|---:|---:|---|
| Unit | 25/236 | 211 | Domain policy 與 UI 狀態隔離測試 |
| Integration | 20/80 | 60 | Miniflare 真 D1 + R2 immutable content + 發布／migration |
| API | 5/27 | 22 | .NET API／Worker 驗證、HTTP 與 WS 合約 |
| E2E | 6/40 | 34 | Web／Android 雙真人帳號與恢復 |
| **合計** | **56/383** | **327** | **完整 BDD 跨層結案尚待逐項覆核** |

### 里程碑

- [x] M1：RiskAudit RA-Q1=A、RA-Q2=A 已由使用者明確確認，缺漏已增補至 BDD/TDD 並完成規劃回寫（**只代表規劃 Gate，不代表程式驗收**）。
- [ ] M2：新五表及既有表最小改動，真 D1 rollback、唯一性與 R2 版本一致性測試。
- [ ] M3：雙方類別票、場景／主線去重與事件引擎、收尾、雙方同意重玩。
- [ ] M4：首條雨聲書店完整遷入，通過 Web／Android 事件鏡位／表情、安全熱區、五圖換角、跨 Episode、背景與恢復、已發布素材與原 B1／2.5D Gate；完整追溯 SEF-UX-GAP-01～08，不得代替本人 Gate B。
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

## 規劃交接紀錄

**交接狀態：Ready for well-done（僅規劃文件可交開發，不代表程式已完成或測試通過）**  
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

**無。** 所有需要使用者決定的規則已確認；12/12 項風險都有處置及落點，8/8 GAP 已補回 TDD。**Ready for well-done 只授權接手這份 SPEC 的開發，不代表本 MVP、首條人工試玩或任何程式測試已通過。**

---

## 2026-11-12 實作前稽核紀錄

- 風險：**12 項（高 7、中 4、低 1）**；RA-Q1=A、RA-Q2=A 已確認。
- 增補：BDD **+3（63→66）**；TDD **+25（295→320）**，內含 Unit +10、Integration +10、API +2、E2E +3，八組 GAP 均已補入。
- 2026-11-12 原文件鏈：新增 MVP AC **12/12**、SPEC AC **12/12**、BDD **66/66** 已追溯。2026-11-13 新增 SPEC AC-013～016、BDD-067～078 及其 TDD，現為 SPEC **16/16**、BDD **78/78** 有測試規劃對應，未執行產品測試。
- 本輪沒有修改產品程式碼、資料表 Schema 或任何環境資料。
