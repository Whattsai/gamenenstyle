# SPEC-001-SceneEventFramework — TDD 測試清單

> V3 本人實玩已確認；依使用者範圍決策結案。只保留原完整核證的610項，移除265項未完整核證斷言（不勾記通過）。V4 直接相關的安全、共用及回歸契約獨立由 V4 驗收。
> [MVP](../../requirements/MVP-001-LoveGameDatingApp.md)｜[SPEC](../specs/SPEC-001-SceneEventFramework.md)｜[BDD](../bdd/SPEC-001-SceneEventFramework-BDD.md)｜[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)

## 現行進度

| 層級 | 完整核證／保留範圍 |
|---|---:|
| Unit | 359/359 |
| Integration | 126/126 |
| API | 53/53 |
| E2E | 72/72 |
| 合計 | 610/610 |

原始 BDD-049、117 所屬的少數已核證子測試仍保留原來源 ID 作歷史追溯，不等同這兩個已移除的整體 Scenario 通過。

## UT

- [x] **SEF-UT-001** `Recommend_OneCategory_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：Given 雙方配對成功且只有浪漫類別具有可玩主線；When 受邀方接受邀請
  - **驗證**：Then 伺服器直接選中浪漫類別並抽場景主線

- [x] **SEF-UT-002** `Recommend_OneCategory_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有偽造投票，也沒有出現選類別畫面

- [x] **SEF-UT-003** `Recommend_OneCategory_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有偽造投票，也沒有出現選類別畫面」

- [x] **SEF-UT-004** `Recommend_TwoCategories_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：Given 浪漫與懸疑兩類別皆有可玩主線；When A 與 B 各提交有效類別票
  - **驗證**：Then 兩票決議後只形成一筆最新場次

- [x] **SEF-UT-005** `Recommend_TwoCategories_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 決議前不顯示對方所選類別

- [x] **SEF-UT-006** `Recommend_TwoCategories_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「決議前不顯示對方所選類別」

- [x] **SEF-UT-007** `Recommend_ThreePlusCategories_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：Given 四類別皆有可玩主線且雙方興趣不同；When 配對成立並取得候選
  - **驗證**：Then 按雙方均衡推薦排序凍結前三個 Category ID

- [x] **SEF-UT-008** `Recommend_ThreePlusCategories_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 候選順序兩端一致且不因重新整理改變

- [x] **SEF-UT-009** `Recommend_ThreePlusCategories_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「候選順序兩端一致且不因重新整理改變」

- [x] **SEF-UT-010** `Scene_MultiCategory_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：Given 雨聲書店同時對應浪漫與懸疑；When 兩個類別分別被選中
  - **驗證**：Then 都能找到同一已發布場景且引用正確版本

- [x] **SEF-UT-011** `Scene_MultiCategory_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 類別不是 Profile 的 reading 興趣欄位

- [x] **SEF-UT-012** `Scene_MultiCategory_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「類別不是 Profile 的 reading 興趣欄位」

- [x] **SEF-UT-013** `Narrative_MultiPerScene_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：Given 雨聲書店綁定尋書與夜雨約定兩條主線；When 查詢同場景合格主線
  - **驗證**：Then 兩條主線均可在同一場景被選中

- [x] **SEF-UT-014** `Narrative_MultiPerScene_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不同主線的 entry 與內容版本互不混淆

- [x] **SEF-UT-015** `Narrative_MultiPerScene_WhenRepeatedOrStale_DoesNotViolateRules`（中）
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

- [x] **SEF-UT-018** `Scene_WeightThreeToOne_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-011／SEF-AC-003`；情境：新場景抽選權重為三比一
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「並非硬性排除已玩場景」

- [x] **SEF-UT-019** `Narrative_UnorderedWeighted_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：Given 同一場景存在已玩與未玩無序主線；When 抽選主線
  - **驗證**：Then 未玩者取得較高但非唯一機率

- [x] **SEF-UT-020** `Narrative_UnorderedWeighted_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 相同隨機種子可重現測試結果

- [x] **SEF-UT-021** `Narrative_UnorderedWeighted_WhenRepeatedOrStale_DoesNotViolateRules`（中）
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

- [x] **SEF-UT-024** `Narrative_OrderedUnlock_WhenRepeatedOrStale_DoesNotViolateRules`（高）
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

- [x] **SEF-UT-028** `Graph_BranchRejoin_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：Given 兩個不同選項通往不同線索後合流；When 玩家選擇其中一項
  - **驗證**：Then 只有所選分支的事件結果寫入進度

- [x] **SEF-UT-029** `Graph_BranchRejoin_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 其餘共用主線可正常繼續

- [x] **SEF-UT-030** `Graph_BranchRejoin_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「其餘共用主線可正常繼續」

- [x] **SEF-UT-031** `Event_RoleByBinding_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：Given 書籤事件被兩條主線引用；When 內容發布並啟動兩條主線
  - **驗證**：Then 第一條定義為支線，第二條可定義為主線

- [x] **SEF-UT-032** `Event_RoleByBinding_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And EventDefinition ID 與玩法版本保持相同

- [x] **SEF-UT-033** `Event_RoleByBinding_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「EventDefinition ID 與玩法版本保持相同」

- [x] **SEF-UT-034** `Event_HiddenRandomConditional_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：Given 事件有 visibility=hidden、weighted_random 和完成找線索前置；When 符合條件後抽中此事件
  - **驗證**：Then 系統只在成功觸發時向合格玩家揭露

- [x] **SEF-UT-035** `Event_HiddenRandomConditional_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 三個維度彼此不互斥

- [x] **SEF-UT-036** `Event_HiddenRandomConditional_WhenRepeatedOrStale_DoesNotViolateRules`（中）
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

- [x] **SEF-UT-039** `Event_ThreeSourcePools_WhenRepeatedOrStale_DoesNotViolateRules`（中）
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

- [x] **SEF-UT-042** `Event_PlaythroughScope_WhenRepeatedOrStale_DoesNotViolateRules`（中）
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

- [x] **SEF-UT-045** `Event_RoundScope_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-029／SEF-AC-006`；情境：整輪配對範圍限制事件重複
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「更換配對組合可以在新的 Round 重新體驗」

- [x] **SEF-UT-046** `Event_OutcomeChangesNarrative_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：Given 隱藏信件事件的結果旗標已合法提交；When 主線到達會檢查結果的節點
  - **驗證**：Then 依旗標決定後續可用的分支或回應

- [x] **SEF-UT-047** `Event_OutcomeChangesNarrative_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 未完成事件不能偽造結果

- [x] **SEF-UT-048** `Event_OutcomeChangesNarrative_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：事件結果能影響後續劇情
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「未完成事件不能偽造結果」

- [x] **SEF-UT-049** `Chapter_AutoComplete_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：Given 主線與必要事件均已滿足 Ending 條件；When 真人提交到 Ending 的最後操作
  - **驗證**：Then 該 StorySession 同筆交易更新為 completed

- [x] **SEF-UT-050** `Chapter_AutoComplete_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不顯示額外完成按鈕也不把 Round ended

- [x] **SEF-UT-051** `Chapter_AutoComplete_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-034／SEF-AC-007`；情境：抵達主線收尾節點自然完成
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不顯示額外完成按鈕也不把 Round ended」

- [x] **SEF-UT-052** `Next_BothAgree_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：Given episode 1 已 completed 且 Round active；When A 與 B 各自提交同意
  - **驗證**：Then 系統恰好建立 episode 2 的候選或直接進場

- [x] **SEF-UT-053** `Next_BothAgree_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 舊 episode 1 保持 completed 且聊天不斷

- [x] **SEF-UT-054** `Next_BothAgree_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：雙方同意才開始下一場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「舊 episode 1 保持 completed 且聊天不斷」

- [x] **SEF-UT-055** `Content_ImmutablePinned_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：Given 玩家使用 v1 的 R2 bundle，發布者已發布 v2；When 玩家重連並繼續本場
  - **驗證**：Then 仍取回 v1 及其全部依賴的 Scene/Event 版本

- [x] **SEF-UT-056** `Content_ImmutablePinned_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 新場次才可採用 v2

- [x] **SEF-UT-057** `Content_ImmutablePinned_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-046／SEF-AC-010`；情境：更新內容不影響進行中的劇情
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「新場次才可採用 v2」

- [x] **SEF-UT-059** `Gate_FirstStoryOnly_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-049／SEF-AC-011`；情境：首條雨聲書店先通過人工 Gate
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 使用者未核准前其他九條仍不得開發

- [x] **SEF-UT-060** `Gate_FirstStoryOnly_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-049／SEF-AC-011`；情境：首條雨聲書店先通過人工 Gate
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「使用者未核准前其他九條仍不得開發」

- [x] **SEF-UT-061** `Boundary_MVP002NoAIGeneration_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：Given 目前運行劇情模式且 R2 僅發布人工主線；When 玩家自由輸入文字與故事互動
  - **驗證**：Then 文字按現有聊天處理而非觸發 AI 動態造主線

- [x] **SEF-UT-062** `Boundary_MVP002NoAIGeneration_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沉浸模式獨立留待 MVP-002

- [x] **SEF-UT-063** `Boundary_MVP002NoAIGeneration_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-051／SEF-AC-012`；情境：MVP-001 不生成 AI 動態主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沉浸模式獨立留待 MVP-002」

- [x] **SEF-UT-064** `Vote_InviterTieBreak_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：Given A 是原邀請者且兩位選擇不同；When 雙方最後有效票已提交
  - **驗證**：Then 勝出類別等於 A 最後一次有效選擇

- [x] **SEF-UT-065** `Vote_InviterTieBreak_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不以先登入或第二位提交者的選擇決勝

- [x] **SEF-UT-066** `Vote_InviterTieBreak_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-004／SEF-AC-001`；情境：兩人選不同類別由原邀請者決定
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不以先登入或第二位提交者的選擇決勝」

- [x] **SEF-UT-067** `Vote_ModifyBeforeSettlement_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：Given A 已投第一票且 B 尚未投；When A 改票後 B 才提交
  - **驗證**：Then 系統採 A 最後有效票結算

- [x] **SEF-UT-068** `Vote_ModifyBeforeSettlement_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 原票仍在事件序列但不影響結果

- [x] **SEF-UT-069** `Vote_ModifyBeforeSettlement_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-005／SEF-AC-001`；情境：結算前允許改票
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「原票仍在事件序列但不影響結果」

- [x] **SEF-UT-070** `Pair_NewPartnerReset_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：Given A 與 B 完成書店，A 與 C 是不同有效配對；When 系統替 A 與 C 抽場景主線
  - **驗證**：Then A 與 B 的歷史不降低 A 與 C 的書店權重

- [x] **SEF-UT-071** `Pair_NewPartnerReset_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不跨配對讀取另一人的私人事件

- [x] **SEF-UT-072** `Pair_NewPartnerReset_WhenRepeatedOrStale_DoesNotViolateRules`（中）
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

- [x] **SEF-UT-075** `Narrative_MixedEligible_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-016／SEF-AC-003`；情境：有序與無序主線混合隨機
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有強制第二章必須先玩」

- [x] **SEF-UT-076** `Graph_MultipleEndings_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：Given 雨聲書店保留原合作互動的兩種結果；When 兩位真人提交相同或不同答案
  - **驗證**：Then 系統分別抵達對應的已發布 Ending

- [x] **SEF-UT-077** `Graph_MultipleEndings_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不替離線另一方自動選答案

- [x] **SEF-UT-078** `Graph_MultipleEndings_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不替離線另一方自動選答案」

- [x] **SEF-UT-079** `Chapter_OptionalNotRequired_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：Given 主線走到 Ending 但支線及隱藏事件仍未玩；When 最後主線節點提交成功
  - **驗證**：Then StorySession completed 並封存未完成事件

- [x] **SEF-UT-080** `Chapter_OptionalNotRequired_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 聊天仍能正常使用

- [x] **SEF-UT-081** `Chapter_OptionalNotRequired_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；情境：未做支線不阻塞主線完成
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「聊天仍能正常使用」

- [x] **SEF-UT-082** `Next_OneOnly_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：只有一人同意不能偷偷開下一場
  - **前置／操作**：Given episode 1 已 completed；When 只有 A 選擇再次遊玩
  - **驗證**：Then 只記錄 A 已同意等待 B

- [x] **SEF-UT-083** `Next_OneOnly_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：只有一人同意不能偷偷開下一場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 仍維持 completed 頁面與聊天

- [x] **SEF-UT-084** `Next_OneOnly_WhenRepeatedOrStale_DoesNotViolateRules`（高）
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

- [x] **SEF-UT-087** `Next_Withdraw_WhenRepeatedOrStale_DoesNotViolateRules`（高）
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

- [x] **SEF-UT-090** `Scene_AllPlayedFallback_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-012／SEF-AC-003`；情境：場景都已玩過仍可再抽
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不因已全部體驗而無限等待」

- [x] **SEF-UT-091** `Narrative_AllCompletedFallback_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：Given 某場景所有可選主線已完成；When 雙方開始新的場次
  - **驗證**：Then 系統仍能依規則抽中已玩主線

- [x] **SEF-UT-092** `Narrative_AllCompletedFallback_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 有序章節的前置條件仍然生效

- [x] **SEF-UT-093** `Narrative_AllCompletedFallback_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「有序章節的前置條件仍然生效」

- [x] **SEF-UT-094** `Event_RepeatGroup_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：Given Scene 與 Global 都提供同一 repeatGroup 的事件；When 伺服器同時發現兩個合格 Binding
  - **驗證**：Then 只建立一個語意事件執行實例

- [x] **SEF-UT-095** `Event_RepeatGroup_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不重複扣次數或重複通知

- [x] **SEF-UT-096** `Event_RepeatGroup_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不重複扣次數或重複通知」

- [x] **SEF-UT-097** `Event_ConcurrentSubmit_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：Given 兩個裝置以相同版本提交單次事件；When D1 交易並發執行
  - **驗證**：Then 只有一筆完成狀態與一次完成效果

- [x] **SEF-UT-098** `Event_ConcurrentSubmit_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 舊 revision 或不同 payload 重播回 409

- [x] **SEF-UT-099** `Event_ConcurrentSubmit_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：雙端同時完成同一事件只提交一次
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「舊 revision 或不同 payload 重播回 409」

- [x] **SEF-UT-100** `Chapter_EndRace_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：Given 最後主線提交和任一方確認退出同時發生；When D1 依交易順序處理兩個操作
  - **驗證**：Then 狀態符合原子序列且 Round ended 後禁止寫入

- [x] **SEF-UT-101** `Chapter_EndRace_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有幽靈事件或雙重結算

- [x] **SEF-UT-102** `Chapter_EndRace_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-037／SEF-AC-007`；情境：完成與結束整輪競態不殘留半場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有幽靈事件或雙重結算」

- [x] **SEF-UT-103** `Next_DoubleAgreeRace_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：Given 兩個登入帳號同時提交且網路可能重送；When D1 競態重試及補漏
  - **驗證**：Then 只存在一個 episode 2

- [x] **SEF-UT-104** `Next_DoubleAgreeRace_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 首場候選 JSON 與其他場次票不相互覆寫

- [x] **SEF-UT-105** `Next_DoubleAgreeRace_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：雙方同時同意恰好產生一場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「首場候選 JSON 與其他場次票不相互覆寫」

- [x] **SEF-UT-106** `Sequence_Monotonic_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：Given Room DO 訊息同時到達且某次廣播失敗；When D1 完成原子提交後客戶端補漏
  - **驗證**：Then 事件 sequence 單調且同 requestId 回原 receipt

- [x] **SEF-UT-107** `Sequence_Monotonic_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能用新的 requestId 自動補發未知結果

- [x] **SEF-UT-108** `Sequence_Monotonic_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能用新的 requestId 自動補發未知結果」

- [x] **SEF-UT-109** `Recovery_ReconnectNoReroll_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：Given 此場已釘選場景與主線且 DO 斷線；When Web 或 Android 重啟並重建連線
  - **驗證**：Then 以同一固定 ID 與 revision 恢復

- [x] **SEF-UT-110** `Recovery_ReconnectNoReroll_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不更動場景、票、事件結果與版本

- [x] **SEF-UT-111** `Recovery_ReconnectNoReroll_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不更動場景、票、事件結果與版本」

- [x] **SEF-UT-112** `Boundary_SingleSceneVisit_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：Given 同一 StorySession 已有一個 SceneVisit；When Client 要求直接換第二場景
  - **驗證**：Then 系統拒絕這次遊玩跨場景

- [x] **SEF-UT-113** `Boundary_SingleSceneVisit_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 資料模型仍可供未來沉浸模式多場景擴充

- [x] **SEF-UT-114** `Boundary_SingleSceneVisit_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「資料模型仍可供未來沉浸模式多場景擴充」

- [x] **SEF-UT-115** `Recommend_NoPlayableCategory_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：Given 已發布類別無任何可玩主線；When 玩家接受配對邀請
  - **驗證**：Then 系統返回 NO_PLAYABLE_STORY 並保持邀請與配對資料一致

- [x] **SEF-UT-116** `Recommend_NoPlayableCategory_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有新增 game_rounds 或假測試故事

- [x] **SEF-UT-117** `Recommend_NoPlayableCategory_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有新增 game_rounds 或假測試故事」

- [x] **SEF-UT-118** `Vote_InvalidOrLeaked_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：Given 兩位已取得固定候選而對方尚未投票；When 第三人提交票或讀取對方原始票
  - **驗證**：Then 服務拒絕越權並只提供 partnerHasVoted 狀態

- [x] **SEF-UT-119** `Vote_InvalidOrLeaked_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不得洩漏私有興趣及未決議 categoryId

- [x] **SEF-UT-120** `Vote_InvalidOrLeaked_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不得洩漏私有興趣及未決議 categoryId」

- [x] **SEF-UT-121** `Scene_InvalidRelation_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：Given 關聯指向不存在或 retired 的場景版本；When 內容發布工具驗證
  - **驗證**：Then 拒絕發布且原已發布索引不受影響

- [x] **SEF-UT-122** `Scene_InvalidRelation_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不產生沒有可玩主線的候選類別

- [x] **SEF-UT-123** `Scene_InvalidRelation_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不產生沒有可玩主線的候選類別」

- [x] **SEF-UT-124** `Narrative_PrerequisiteForgery_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：Given 第三章尚未解鎖且客戶端知道其 ID；When 客戶端偽造選中的 narrativeId
  - **驗證**：Then 伺服器拒絕並保持現有場次不變

- [x] **SEF-UT-125** `Narrative_PrerequisiteForgery_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不得寫入非法選中事件

- [x] **SEF-UT-126** `Narrative_PrerequisiteForgery_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不得寫入非法選中事件」

- [x] **SEF-UT-127** `Graph_UnreachableEnding_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：Given 主線節點循環且找不到可達 Ending；When 內容發布工具驗證
  - **驗證**：Then 拒絕成為 published 完整主線

- [x] **SEF-UT-128** `Graph_UnreachableEnding_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不把其算入十條驗收數量

- [x] **SEF-UT-129** `Graph_UnreachableEnding_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不把其算入十條驗收數量」

- [x] **SEF-UT-130** `Event_SceneCapability_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：Given 全域事件需要書架能力但所在場景沒有書架；When 觸發引擎計算候選
  - **驗證**：Then 排除該全域事件

- [x] **SEF-UT-131** `Event_SceneCapability_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不因標記 global 就無條件可用

- [x] **SEF-UT-132** `Event_SceneCapability_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不因標記 global 就無條件可用」

- [x] **SEF-UT-133** `Event_UnsupportedRenderer_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：Given EventDefinition 使用前端未實作的 moduleType；When 內容發布工具驗證
  - **驗證**：Then 拒絕 published 並指出不支援的玩法

- [x] **SEF-UT-134** `Event_UnsupportedRenderer_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不生成只有點擊外觀的空白互動

- [x] **SEF-UT-135** `Event_UnsupportedRenderer_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不生成只有點擊外觀的空白互動」

- [x] **SEF-UT-136** `Event_InvalidDependency_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：Given 事件 A 需要尚未完成的 B 或定義互相循環；When 發布或觸發事件
  - **驗證**：Then 發布前拒絕循環，遊玩時拒絕未解鎖事件

- [x] **SEF-UT-137** `Event_InvalidDependency_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不修改任何已完成事件狀態

- [x] **SEF-UT-138** `Event_InvalidDependency_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不修改任何已完成事件狀態」

- [x] **SEF-UT-139** `Chapter_RejectOldOptional_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：Given StorySession 已完成且尚有未完成書籤事件；When 客戶端送出舊場次事件操作
  - **驗證**：Then 返回 EVENT_STATE_CONFLICT 且無新事件紀錄

- [x] **SEF-UT-140** `Chapter_RejectOldOptional_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 下一次有效重玩才能再次探索

- [x] **SEF-UT-141** `Chapter_RejectOldOptional_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「下一次有效重玩才能再次探索」

- [x] **SEF-UT-142** `Next_OldEpisodeReplay_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：Given 最新是 episode 3，客戶端仍帶 completedEpisodeSeq=1；When 再次提交舊場同意
  - **驗證**：Then 伺服器拒絕過期場次操作

- [x] **SEF-UT-143** `Next_OldEpisodeReplay_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不跨場使用舊選票或同意

- [x] **SEF-UT-144** `Next_OldEpisodeReplay_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不跨場使用舊選票或同意」

- [x] **SEF-UT-145** `Auth_ThirdPartyAndRevoked_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：Given 第三人知道 roundId 或原成員 session 被撤銷；When 呼叫投票、下一場、事件及訊息 API
  - **驗證**：Then 全部 fail-closed 不寫入資料

- [x] **SEF-UT-146** `Auth_ThirdPartyAndRevoked_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 只回安全錯誤而非真實玩家資料

- [x] **SEF-UT-147** `Auth_ThirdPartyAndRevoked_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「只回安全錯誤而非真實玩家資料」

- [x] **SEF-UT-148** `Content_R2Corrupt_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：Given 內容目錄存在但 Manifest 缺失或雜湊不符；When 伺服器驗證／準備下一場
  - **驗證**：Then 拒絕進場並維持可恢復的狀態

- [x] **SEF-UT-149** `Content_R2Corrupt_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不可提交半套 StorySession 或重新擲骰

- [x] **SEF-UT-150** `Content_R2Corrupt_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不可提交半套 StorySession 或重新擲骰」

- [x] **SEF-UT-151** `Content_InvalidManifest_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：Given Scene、Narrative、EventPool 之間引用版本不存在；When 發布工具驗證
  - **驗證**：Then 拒絕發佈並指出具體引用缺失

- [x] **SEF-UT-152** `Content_InvalidManifest_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 舊版已發布內容不被改寫

- [x] **SEF-UT-153** `Content_InvalidManifest_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-048／SEF-AC-010`；情境：事件依賴錯誤或跨版本引用不可發布
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「舊版已發布內容不被改寫」

- [x] **SEF-UT-154** `Gate_CannotCountFixtures_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：Given 系統只有一條完整主線與九張場景圖片或測試 fixtures；When 執行 MVP 完整度稽核
  - **驗證**：Then 只能計一條完整可玩主線

- [x] **SEF-UT-155** `Gate_CannotCountFixtures_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能因有分支／多種結局加算條數

- [x] **SEF-UT-156** `Gate_CannotCountFixtures_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：十條驗收不可由背景或測試故事充數
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能因有分支／多種結局加算條數」

- [x] **SEF-UT-157** `UI_OfferCount_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：Given 有效 Round 有一類別或二至三類別；When 玩家進入劇情頁
  - **驗證**：Then 唯一類別直接進場，多類別才顯示投票卡

- [x] **SEF-UT-158** `UI_OfferCount_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 投票前不顯示對方選中的類別

- [x] **SEF-UT-159** `UI_OfferCount_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「投票前不顯示對方選中的類別」

- [x] **SEF-UT-160** `UI_VoteWaiting_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：Given A 已投票且 B 暫時離線；When A 切換聊天再返回劇情入口
  - **驗證**：Then 保留本人票並顯示正在等待另一位玩家

- [x] **SEF-UT-161** `UI_VoteWaiting_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 沒有假選票、倒數替他選或超時決議

- [x] **SEF-UT-162** `UI_VoteWaiting_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「沒有假選票、倒數替他選或超時決議」

- [x] **SEF-UT-163** `UI_HiddenEvent_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：Given 未達書店隱藏書籤事件條件；When 玩家打開場景與事件列表
  - **驗證**：Then 不顯示隱藏事件標題與答案

- [x] **SEF-UT-164** `UI_HiddenEvent_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 符合條件並真正觸發才展示

- [x] **SEF-UT-165** `UI_HiddenEvent_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「符合條件並真正觸發才展示」

- [x] **SEF-UT-166** `UI_InteractionFeedback_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：Given 雙人合作互動需要兩人各自選擇；When A 提交自己的選項
  - **驗證**：Then 畫面顯示送出中、成功後等待對方

- [x] **SEF-UT-167** `UI_InteractionFeedback_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不能代替 B 作答或將 ACK 當成對方已讀

- [x] **SEF-UT-168** `UI_InteractionFeedback_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不能代替 B 作答或將 ACK 當成對方已讀」

- [x] **SEF-UT-169** `UI_ChapterCompleted_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：Given 主線抵達 Ending；When 畫面接收到已提交完成事件
  - **驗證**：Then 顯示本次劇情完成但聊天室仍可使用

- [x] **SEF-UT-170** `UI_ChapterCompleted_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 未完成事件不可再操作也無完成劇情按鈕

- [x] **SEF-UT-171** `UI_ChapterCompleted_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「未完成事件不可再操作也無完成劇情按鈕」

- [x] **SEF-UT-172** `UI_NextAgree_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：Given 劇情已完成而只有 A 想再玩；When A 點擊再次遊玩
  - **驗證**：Then 顯示我已同意、等待另一位玩家

- [x] **SEF-UT-173** `UI_NextAgree_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And B 拒絕或離線時保持聊天與 completed 狀態

- [x] **SEF-UT-174** `UI_NextAgree_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「B 拒絕或離線時保持聊天與 completed 狀態」

- [x] **SEF-UT-175** `UI_NextDuplicateClick_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：Given A 已按同意且網路回應尚未到達；When A 再次點擊同意
  - **驗證**：Then 控制項維持提交中而不產生第二個 requestId

- [x] **SEF-UT-176** `UI_NextDuplicateClick_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 收到 receipt 後恢復正確狀態

- [x] **SEF-UT-177** `UI_NextDuplicateClick_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「收到 receipt 後恢復正確狀態」

- [x] **SEF-UT-178** `UI_OfflineRecovery_GivenValidState_ProducesExpectedResult`（中）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：Given 玩家完成投票後斷線且 Server 已提交但 ACK 失聯；When 重新連線並取得快照及游標增量
  - **驗證**：Then 依 D1 恢復原場景、主線與事件結果

- [x] **SEF-UT-179** `UI_OfflineRecovery_GivenScenario_RespectsSecondaryInvariant`（中）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不重抽、不重送不同 requestId

- [x] **SEF-UT-180** `UI_OfflineRecovery_WhenRepeatedOrStale_DoesNotViolateRules`（中）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不重抽、不重送不同 requestId」

- [x] **SEF-UT-181** `UI_ContentFailure_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：Given 已抽選場景的 R2 Manifest 暫時無法讀取；When 玩家重新開啟劇情頁
  - **驗證**：Then 顯示無法載入劇情內容且提供重試載入

- [x] **SEF-UT-182** `UI_ContentFailure_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 不顯示假故事或換另一個場景

- [x] **SEF-UT-183** `UI_ContentFailure_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「不顯示假故事或換另一個場景」

- [x] **SEF-UT-184** `UI_BothPlatformsGate_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：Given A 用 Web、B 用 Android 遊玩首場雨聲書店；When 兩端完成書籤與雙人合作並進入收尾
  - **驗證**：Then 兩端依真 D1 顯示相同結果與 next 按鈕狀態

- [x] **SEF-UT-185** `UI_BothPlatformsGate_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 原 B1 五表情及全身 POV 驗收獨立保留

- [x] **SEF-UT-186** `UI_BothPlatformsGate_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「原 B1 五表情及全身 POV 驗收獨立保留」

- [x] **SEF-UT-187** `UI_EndConfirmation_GivenValidState_ProducesExpectedResult`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：Given 劇情已完成且兩人仍在聊天；When 一人點擊結束本輪互動
  - **驗證**：Then 先提示原 pair 永久不再互配並要求確認

- [x] **SEF-UT-188** `UI_EndConfirmation_GivenScenario_RespectsSecondaryInvariant`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：同上，檢查業務副作用與安全邊界
  - **驗證**：And 取消不結束且不影響下一場同意

- [x] **SEF-UT-189** `UI_EndConfirmation_WhenRepeatedOrStale_DoesNotViolateRules`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：以舊狀態、重複操作或非法內容重新評估上述條件
  - **驗證**：狀態／事件唯一性不退化，必要時回原 receipt 或拒絕操作；不違反「取消不結束且不影響下一場同意」

- [x] **SEF-UT-190** `SelectNarrative_SelectedCategory_MatchesEligibleCodes`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A／SEF-GAP-01`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：所選 Category.code 僅允許具有相符 eligibleCategoryCodes 的主線進入候選，拒絕純其他類別內容

- [x] **SEF-UT-191** `SelectNarrative_MultipleEligibleCodes_AllowsMultipleCategories`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：同一主線可聲明浪漫＋懸疑兩碼，在任一類別均合法

- [x] **SEF-UT-192** `SelectNarrative_CategoryMismatch_ReturnsNoCandidate`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：選懸疑但主線白名單只有浪漫時候選為空，RNG 不可抽到這條主線

- [x] **SEF-UT-193** `FreezeNextCategory_UsesLatestPersistedInterests`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：第二位玩家同意成功提交時，依兩位最新已儲存興趣計算類別候選

- [x] **SEF-UT-194** `FreezeNextCategory_ChangesAfterFreeze_DoNotRecalculate`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：凍結後再修改興趣，不更動已提交的 categoryIds 或舊場次

- [x] **SEF-UT-195** `FreezeNextCategory_SamePersistedSnapshotForBothPlayers`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：雙端讀取同一份伺服器快照，不允許客戶端各自重新排名

- [x] **SEF-UT-196** `RecommendCategory_NoEligibleNarrative_ExcludesCategory`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：類別只連到場景但沒有適用主線時，不可進入正式類別候選

- [x] **SEF-UT-197** `RecommendCategory_SceneCategoryWithoutNarrative_IsNotPlayable`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：空主線、未解鎖或已退休 Narrative 不可讓 Scene 被誤判可玩

- [x] **SEF-UT-198** `RecommendCategory_AllInvalid_NoPlayableStory`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：沒有任何可選類別時回 NO_PLAYABLE_STORY，不建立空 Round/Episode

- [x] **SEF-UT-199** `SelectNarrative_CategoryMismatch_RejectsCandidate`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`SEF-GAP-01`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：同場景多類別但某條主線不相符時，Publisher／SelectionPolicy 都拒絕選入

- [x] **SEF-UT-200** `Scene_Presentation_Preserved__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：相同鏡位、光色、遮擋、熱區座標與合法聲音 cue 在 Web／Android 保持一致

- [x] **SEF-UT-201** `Scene_Presentation_Preserved__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：靜態 Scene 的鏡位與背景不因換主線而遺失或重繪免費角色

- [x] **SEF-UT-202** `Scene_Presentation_Preserved__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-203** `Event_Presentation_Overlay_ReturnsToNode__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：角色依已提交事件結果演出表情與鏡頭，事件完成後恢復節點基底呈現

- [x] **SEF-UT-204** `Event_Presentation_Overlay_ReturnsToNode__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：演出不偷偷修改主線 currentNode 或額外觸發選擇與 Gemini

- [x] **SEF-UT-205** `Event_Presentation_Overlay_ReturnsToNode__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-206** `Event_Presentation_InvalidReference_Rejected__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：拒絕發布並指出無效引用

- [x] **SEF-UT-207** `Event_Presentation_InvalidReference_Rejected__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：保留原已發布可玩版本，不建立新資料表或任意外部資產請求

- [x] **SEF-UT-208** `Event_Presentation_InvalidReference_Rejected__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-209** `Hotspot_AuthoritativeVisibility_PreviewNoCommit__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：未解鎖時看不到隱藏入口，解鎖後可以檢視但取消不寫入完成事件

- [x] **SEF-UT-210** `Hotspot_AuthoritativeVisibility_PreviewNoCommit__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：伺服器再次驗證資格，不能從靜態 Manifest 取得隱藏答案

- [x] **SEF-UT-211** `Hotspot_AuthoritativeVisibility_PreviewNoCommit__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-212** `Avatar_SafeSwap_IndependentOfNarrative__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：五張表情完整解碼並在台詞安全句尾整組換角

- [x] **SEF-UT-213** `Avatar_SafeSwap_IndependentOfNarrative__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：storySessionId、currentNode、progressRevision、聊天與事件選擇不變

- [x] **SEF-UT-214** `Avatar_SafeSwap_IndependentOfNarrative__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-215** `Avatar_NotReadyOrFailed_NoGeneration__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：繼續顯示舊完整角色或安全佔位，並可持續劇情及聊天

- [x] **SEF-UT-216** `Avatar_NotReadyOrFailed_NoGeneration__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：不顯示新舊表情混包、不觸發 Gemini／next／採用 API、不自動續產

- [x] **SEF-UT-217** `Avatar_NotReadyOrFailed_NoGeneration__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-218** `Episode_ResetOnlyStage_PreserveRound__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：台詞逐字動畫、鏡頭、音訊 cue、事件覆寫、對話視窗與舊 pending 動作均從新場次正確初始化

- [x] **SEF-UT-219** `Episode_ResetOnlyStage_PreserveRound__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：舊聊天、Room 連線、目前角色以及第一場歷史不重建或消失

- [x] **SEF-UT-220** `Episode_ResetOnlyStage_PreserveRound__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-221** `App_BackgroundResume_NoRerollOrGeneration__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：從快照與游標補漏恢復相同場次、熱區與對方人物，微動／音訊保持安全暫停策略

- [x] **SEF-UT-222** `App_BackgroundResume_NoRerollOrGeneration__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：沒有重新抽籤、重送未知 action、音效自動播放或 B1 自動續產

- [x] **SEF-UT-223** `App_BackgroundResume_NoRerollOrGeneration__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-224** `Avatar_RevokedOrStaleResponse_PurgesPrivate__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：舊 private Avatar 圖片與授權投影被清除且不顯示

- [x] **SEF-UT-225** `Avatar_RevokedOrStaleResponse_PurgesPrivate__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：不同 round 的訊息、stage 素材與角色不能交叉污染

- [x] **SEF-UT-226** `Avatar_RevokedOrStaleResponse_PurgesPrivate__StaleOrInvalidStateIsSafe`（高）
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

- [x] **SEF-UT-229** `Chapter_Completed_StageAndChatStillVisible__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-076／SEF-AC-015`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-230** `Scene_MotionAndAssetReuse_PerformanceEvidence__ConfirmedPresentationIsStable`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：關閉時不啟動裝飾動畫，鏡位、角色與熱區仍能操作，圖片按版本重用

- [x] **SEF-UT-231** `Scene_MotionAndAssetReuse_PerformanceEvidence__BoundaryDoesNotMutateStoryState`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：保存實際記憶體與切換延遲或 jank 的驗證證據，不宣稱未量測的 FPS

- [x] **SEF-UT-232** `Scene_MotionAndAssetReuse_PerformanceEvidence__StaleOrInvalidStateIsSafe`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`、2026-11-13 跨 SPEC 整合
  - **操作**：模擬安全授權、已釘選 Scene、Event、Avatar 與前端演出狀態
  - **驗證**：失權、過期事件、無效 ID 或跨 Episode 的資料不得造成演出污染、重新抽選、Gemini 請求或多次提交

- [x] **SEF-UT-236** `OwnAvatarNotReady_ClearsPrivateSceneAndOffersProfileReturn`：初載或已顯示場景後收到本人未就緒錯誤，清除私人內容與草稿、禁止互動並導向個人檔案；游標超過 snapshot 時重新讀權威狀態，不以事件 receipt 冒認畫面已同步。

- [x] **SEF-UT-237** `ParticipantTrack_Bdd080_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 場次決議已成功且兩名真人身分有效；When Server 建立 StorySession；Then 同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界

- [x] **SEF-UT-238** `ParticipantTrack_Bdd080_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界

- [x] **SEF-UT-239** `ParticipantTrack_Bdd080_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：任何一筆建立失敗都不能留下半場

- [x] **SEF-UT-240** `ParticipantTrack_Bdd081_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 和 A 各位於不同個人節點；When I 先完成本人可用的事件；Then 僅 I 的 node、Area、revision 進步，A 不變

- [x] **SEF-UT-241** `ParticipantTrack_Bdd081_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅 I 的 node、Area、revision 進步，A 不變

- [x] **SEF-UT-242** `ParticipantTrack_Bdd081_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 可稍後親自完成未玩節點

- [x] **SEF-UT-243** `ParticipantTrack_Bdd082_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given Round 已固定原邀請人及接受人；When 前端假造另一方 role、nodeId 或 accountId；Then Server 拒絕假冒且不修改進度

- [x] **SEF-UT-244** `ParticipantTrack_Bdd082_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：Server 拒絕假冒且不修改進度

- [x] **SEF-UT-245** `ParticipantTrack_Bdd082_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不可用帳號大小或先上線順序決定角色

- [x] **SEF-UT-246** `ParticipantTrack_Bdd083_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 前進而 A 還在 A02；When A 重新登入取授權 experience；Then A 恢復 A02、Area、可操作物件及個人 revision

- [x] **SEF-UT-247** `ParticipantTrack_Bdd083_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：A 恢復 A02、Area、可操作物件及個人 revision

- [x] **SEF-UT-248** `ParticipantTrack_Bdd083_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：全域 eventSeq 不能替 A 決策

- [x] **SEF-UT-249** `ParticipantTrack_Bdd084_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 的必要節點完成而 A08 未完成；When I 嘗試結束本場主線；Then chapter 仍是 playing 且 A 可繼續

- [x] **SEF-UT-250** `ParticipantTrack_Bdd084_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：chapter 仍是 playing 且 A 可繼續

- [x] **SEF-UT-251** `ParticipantTrack_Bdd084_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 完成及 Shared predicate 齊備才發出一次 chapter.completed

- [x] **SEF-UT-252** `SharedTransition_Bdd085_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given S01 兩人真人核對且 I04、A04、S02 都在合法圖中；When 雙方提交 S01 後分別移至不同區域；Then I04、A04 分別開啟並可進 S02 再交會

- [x] **SEF-UT-253** `SharedTransition_Bdd085_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：I04、A04 分別開啟並可進 S02 再交會

- [x] **SEF-UT-254** `SharedTransition_Bdd085_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不修改對方未完成的私人事件

- [x] **SEF-UT-255** `SharedTransition_Bdd086_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given S02 完成時 I 在 I08、A 尚未執行 A08；When 伺服器結算 S02 的合法雙人答案；Then 只開啟 A08 且 I 停留 I08

- [x] **SEF-UT-256** `SharedTransition_Bdd086_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只開啟 A08 且 I 停留 I08

- [x] **SEF-UT-257** `SharedTransition_Bdd086_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 驗證完才可進入 S03

- [x] **SEF-UT-258** `SharedTransition_Bdd087_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given I 必經事件等 A，A 必經事件又等不可達的 I；When Publisher 檢查兩條 Track 與 Shared 依賴圖；Then 拒絕不能到達共同 Ending 的內容

- [x] **SEF-UT-259** `SharedTransition_Bdd087_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：拒絕不能到達共同 Ending 的內容

- [x] **SEF-UT-260** `SharedTransition_Bdd087_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：合法可選回訪不被錯誤禁止

- [x] **SEF-UT-261** `SharedTransition_Bdd088_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 條件採 role、Area、bindingKey 與共享世界事實；When 有人注入未知條件、過深布林或假 role；Then Schema 或 Domain 拒絕非法組合

- [x] **SEF-UT-262** `SharedTransition_Bdd088_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：Schema 或 Domain 拒絕非法組合

- [x] **SEF-UT-263** `SharedTransition_Bdd088_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：合法 all、any、not 僅查已提交事實

- [x] **SEF-UT-264** `SharedTransition_Bdd089_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 玩家已在第一場 Scene 探索多個 Area；When 兩人完成後同意並進入第二場；Then 每個 StorySession 僅一筆 SceneVisit、各自有 Area

- [x] **SEF-UT-265** `SharedTransition_Bdd089_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：每個 StorySession 僅一筆 SceneVisit、各自有 Area

- [x] **SEF-UT-266** `SharedTransition_Bdd089_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：跨場次和跨角色同名節點不得互相污染

- [x] **SEF-UT-267** `WorldState_Bdd090_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given A 詢問店員得到書名但尚未分享；When I 查快照、WS、熱區及可讀 Manifest；Then I 不得看 A 私有節點或答案

- [x] **SEF-UT-268** `WorldState_Bdd090_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：I 不得看 A 私有節點或答案

- [x] **SEF-UT-269** `WorldState_Bdd090_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 主動分享後只公開允許的線索

- [x] **SEF-UT-270** `WorldState_Bdd091_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 書袋由共享世界權威記錄在書架；When 兩名真人以相同 revision 同時 pick；Then 只一個合法 D1 CAS 成功、另一人 409 同步

- [x] **SEF-UT-271** `WorldState_Bdd091_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只一個合法 D1 CAS 成功、另一人 409 同步

- [x] **SEF-UT-272** `WorldState_Bdd091_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：物件不複製且不重複完成事件

- [x] **SEF-UT-273** `WorldState_Bdd092_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given S02 必須 I hold-bag 與 A retrieve-tag；When I 先提交、A 離線後才操作；Then 第一次提交只保留 I 事實且 EventInstance active

- [x] **SEF-UT-274** `WorldState_Bdd092_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：第一次提交只保留 I 事實且 EventInstance active

- [x] **SEF-UT-275** `WorldState_Bdd092_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 親提交後才完成一次 shared event

- [x] **SEF-UT-276** `WorldState_Bdd093_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given 同一 EventDefinition 在 I 與 A 各有一個 binding；When 兩人各自完成合法個人探索；Then 兩份不同 scope 的 EventInstance 均存在

- [x] **SEF-UT-277** `WorldState_Bdd093_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：兩份不同 scope 的 EventInstance 均存在

- [x] **SEF-UT-278** `WorldState_Bdd093_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：Shared binding 僅有一個共同 instance

- [x] **SEF-UT-279** `WorldState_Bdd094_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：Given A 有尚未觸發的隱藏事件；When I 請求 experience、events query 或公開 R2；Then 無 A 私人線索、未知 binding 與私人 R2 key

- [x] **SEF-UT-280** `WorldState_Bdd094_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：無 A 私人線索、未知 binding 與私人 R2 key

- [x] **SEF-UT-281** `WorldState_Bdd094_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：只顯示合作狀態的白名單摘要

- [x] **SEF-UT-282** `SceneInteraction_Bdd095_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given 一場 Scene 只有一筆 SceneVisit；When I 由 entrance 移到 counter 再到 shelves；Then 本人的 Area、鏡頭和可用熱區真實更新

- [x] **SEF-UT-283** `SceneInteraction_Bdd095_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：本人的 Area、鏡頭和可用熱區真實更新

- [x] **SEF-UT-284** `SceneInteraction_Bdd095_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不可移至未解鎖或不存在的 Area

- [x] **SEF-UT-285** `SceneInteraction_Bdd096_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given I 在 entrance 可見濕紙單；When I 親自點 flip 及查看特寫；Then 紙張可見翻面並得到 27 的個人線索

- [x] **SEF-UT-286** `SceneInteraction_Bdd096_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：紙張可見翻面並得到 27 的個人線索

- [x] **SEF-UT-287** `SceneInteraction_Bdd096_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：跳過動畫不能跳過 Server 的正式操作

- [x] **SEF-UT-288** `SceneInteraction_Bdd097_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given I 尚未得到分享線索或選中錯書；When 將 book-wednesday 拖到櫃檯；Then 出現可恢復的具體提示，orderStatus 不變

- [x] **SEF-UT-289** `SceneInteraction_Bdd097_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：出現可恢復的具體提示，orderStatus 不變

- [x] **SEF-UT-290** `SceneInteraction_Bdd097_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：依正確資訊重新選書仍可完成

- [x] **SEF-UT-291** `SceneInteraction_Bdd098_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given A 在櫃檯且店員可交談；When A 親自選擇 query-title；Then 只 A 先看到預訂資訊，分享後 I 才知道

- [x] **SEF-UT-292** `SceneInteraction_Bdd098_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只 A 先看到預訂資訊，分享後 I 才知道

- [x] **SEF-UT-293** `SceneInteraction_Bdd098_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：NPC 不能代另一位真人聊天或提交

- [x] **SEF-UT-294** `SceneInteraction_Bdd099_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given 場景及物件白名單已由 R2 釘選；When Client 提交未授權 objectId、targetSlotId 或 action；Then Server 409／明確拒絕且世界未變

- [x] **SEF-UT-295** `SceneInteraction_Bdd099_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：Server 409／明確拒絕且世界未變

- [x] **SEF-UT-296** `SceneInteraction_Bdd099_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：合法 params 才能改 EventInstance 與進度

- [x] **SEF-UT-297** `ScenePresentation_Bdd100_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；When 兩人完成互動後播放可見演出；Then 鏡頭、物件、兩位真人化身及五表情符合 Cue

- [x] **SEF-UT-298** `ScenePresentation_Bdd100_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：鏡頭、物件、兩位真人化身及五表情符合 Cue

- [x] **SEF-UT-299** `ScenePresentation_Bdd100_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini

- [x] **SEF-UT-300** `ScenePresentation_Bdd101_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given Rain Scene 顯示 AmbientMotion；When 玩家檢視雨絲和玻璃水痕後關閉微動；Then 畫面先有真正移動且關閉後停止循環

- [x] **SEF-UT-301** `ScenePresentation_Bdd101_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：畫面先有真正移動且關閉後停止循環

- [x] **SEF-UT-302** `ScenePresentation_Bdd101_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：必要 StoryMotion 仍能播放並且有可讀替代狀態

- [x] **SEF-UT-303** `ScenePresentation_Bdd102_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given S02 風起已提交且標籤在窗台；When Android/Web 進背景再返回並恢復 Session；Then 根據權威狀態顯示標籤且不重觸發風事件

- [x] **SEF-UT-304** `ScenePresentation_Bdd102_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：根據權威狀態顯示標籤且不重觸發風事件

- [x] **SEF-UT-305** `ScenePresentation_Bdd102_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不 autoplay 音效、不重送指令、不再產生五表情

- [x] **SEF-UT-306** `ScenePresentation_Bdd103_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：Given Manifest 包含未知 anchor、表情、camera 或 motion；When Publisher 驗證並由 Web/Android 量測正式遊玩；Then 非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據

- [x] **SEF-UT-307** `ScenePresentation_Bdd103_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據

- [x] **SEF-UT-308** `ScenePresentation_Bdd103_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`frontend/client/tests/unit/scene-event-framework.test.tsx`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不能以缺動畫的純文字替代宣告 Gate B 成功

- [x] **SEF-UT-309** `RainBookshop_Bdd104_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 雨聲書店 v2 的 I01 和 A01 已釘選；When I 先翻濕紙單、A 停在書架；Then I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立

- [x] **SEF-UT-310** `RainBookshop_Bdd104_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立

- [x] **SEF-UT-311** `RainBookshop_Bdd104_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：先行者不推進另一方未完成節點

- [x] **SEF-UT-312** `RainBookshop_Bdd105_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 看濕紙、A 查書袋外標籤；When 兩人各自 inspect 並讀取 experience；Then 僅本人看到已探索的資訊

- [x] **SEF-UT-313** `RainBookshop_Bdd105_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅本人看到已探索的資訊

- [x] **SEF-UT-314** `RainBookshop_Bdd105_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：未經分享不洩漏對方私有節點或觸發

- [x] **SEF-UT-315** `RainBookshop_Bdd106_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 紙單與 A 袋子已在 counter；When I 先按核對、A 離線重連後再按核對；Then S01 在兩次真實操作後完成並分流 I04／A04

- [x] **SEF-UT-316** `RainBookshop_Bdd106_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：S01 在兩次真實操作後完成並分流 I04／A04

- [x] **SEF-UT-317** `RainBookshop_Bdd106_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不由店員代另一方核對

- [x] **SEF-UT-318** `RainBookshop_Bdd107_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 看兩本海邊書、A 向店員查出正確書；When I 在 A 尚未分享前嘗試領走書；Then 不能完成；A 主動分享後 I 才能選中 book-rain

- [x] **SEF-UT-319** `RainBookshop_Bdd107_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：不能完成；A 主動分享後 I 才能選中 book-rain

- [x] **SEF-UT-320** `RainBookshop_Bdd107_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不把 A 私人店員台詞完整傳給 I

- [x] **SEF-UT-321** `RainBookshop_Bdd108_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I 選到 book-wednesday；When I 嘗試放進 counter-slot；Then 提示錯書且 orderStatus 不變

- [x] **SEF-UT-322** `RainBookshop_Bdd108_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：提示錯書且 orderStatus 不變

- [x] **SEF-UT-323** `RainBookshop_Bdd108_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：可返回 shelves 重新選擇

- [x] **SEF-UT-324** `RainBookshop_Bdd109_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given A 知道封套位置且 I 仍在 I05；When A 從 window 取出並送到 counter；Then 只保存 A 的進度和 green-sleeve 位置、S02 不觸發

- [x] **SEF-UT-325** `RainBookshop_Bdd109_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只保存 A 的進度和 green-sleeve 位置、S02 不觸發

- [x] **SEF-UT-326** `RainBookshop_Bdd109_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：I 仍可完成自己的找書流程

- [x] **SEF-UT-327** `RainBookshop_Bdd110_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 正確書及封套已抵達 counter；When S02 風起一次、I hold、A 下線後恢復並取回標籤；Then 標籤只移動一次且 I 的真人提交保留

- [x] **SEF-UT-328** `RainBookshop_Bdd110_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：標籤只移動一次且 I 的真人提交保留

- [x] **SEF-UT-329** `RainBookshop_Bdd110_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 取回並放好才完成 Shared

- [x] **SEF-UT-330** `RainBookshop_Bdd111_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given order-tag-27 位於窗台；When A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得；Then 僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒

- [x] **SEF-UT-331** `RainBookshop_Bdd111_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒

- [x] **SEF-UT-332** `RainBookshop_Bdd111_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不產生第二張標籤或重播 S02，並顯示權威物件位置

- [x] **SEF-UT-333** `RainBookshop_Bdd112_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given S02 completed，I 在 I08；When A 到 counter 開始 verify-order；Then 僅 A 開啟 A08，I 保持 I08

- [x] **SEF-UT-334** `RainBookshop_Bdd112_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：僅 A 開啟 A08，I 保持 I08

- [x] **SEF-UT-335** `RainBookshop_Bdd112_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：A 真人確認後才啟動 S03

- [x] **SEF-UT-336** `RainBookshop_Bdd113_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given S03 已解鎖且兩人可選最終意向；When I 親按 look_back、A 親按 rest_chat；Then E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用

- [x] **SEF-UT-337** `RainBookshop_Bdd113_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用

- [x] **SEF-UT-338** `RainBookshop_Bdd113_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索

- [x] **SEF-UT-339** `RainBookshop_Bdd114_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 雙人必經事實與 S03 都有效；When I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）；Then 第二位合法意向提交時 Server 即決定 E01，Chapter／Side 同 D1 交易完成且保存 receipt；Client 收到成功後只演短書架回望，Round active／聊天保留

- [x] **SEF-UT-340** `RainBookshop_Bdd114_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：E01 只演短書架回望後自然 completed、未完 Side 同交易封存、Round active／聊天保留

- [x] **SEF-UT-341** `RainBookshop_Bdd114_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：暖光演出不能解鎖新物件／Side 或多一個結束按鈕；跳動畫／重連仍維持完成結果

- [x] **SEF-UT-342** `RainBookshop_Bdd115_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given I/A 不同步且有已提交 requestId；When 重送原 payload、變造 payload、重連及退出；Then 冪等返回原 receipt、變造拒絕、退出後拒寫

- [x] **SEF-UT-343** `RainBookshop_Bdd115_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：冪等返回原 receipt、變造拒絕、退出後拒寫

- [x] **SEF-UT-344** `RainBookshop_Bdd115_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不重抽主線或重新呼叫五表情

- [x] **SEF-UT-345** `RainBookshop_Bdd116_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：Given 玩家已關閉 AmbientMotion 且 S02 可用；When 兩人完成按住書袋和取回標籤；Then 雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚

- [x] **SEF-UT-346** `RainBookshop_Bdd116_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚

- [x] **SEF-UT-347** `RainBookshop_Bdd116_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Unit.Tests/Domain/RainBookshopPolicyTests.cs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：可以略過表演不能略過操作

- [x] **SEF-UT-351** `LocalCleanup_Bdd118_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given 僅識別 DatingHigh local DB 與 R2 並有保護資料清單；When 在開發 Gate 模擬清理及重建計畫；Then 只清舊遊戲測資與無用執行內容

- [x] **SEF-UT-352** `LocalCleanup_Bdd118_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只清舊遊戲測資與無用執行內容

- [x] **SEF-UT-353** `LocalCleanup_Bdd118_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：未知、遠端、正式環境直接拒絕

- [x] **SEF-UT-354** `LocalCleanup_Bdd119_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given scene-event.v2 新 runtime 已完整替換原路徑；When 從空 local DB 執行 migration 及引用稽核；Then game_interaction_instances 已無表與索引且雙方 Progress 正確

- [x] **SEF-UT-355** `LocalCleanup_Bdd119_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：game_interaction_instances 已無表與索引且雙方 Progress 正確

- [x] **SEF-UT-356** `LocalCleanup_Bdd119_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：保留 Round／聊天／EventReceipt／退出能力

- [x] **SEF-UT-357** `LocalCleanup_Bdd120_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given 16 款全身與五表情已正式提供且 R2 SHA 釘選；When 清除舊 story-scenes 與 bookmark 發布流程；Then 只有失效的舊入口被移除，正式來源與本劇本素材仍正常

- [x] **SEF-UT-358** `LocalCleanup_Bdd120_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：只有失效的舊入口被移除，正式來源與本劇本素材仍正常

- [x] **SEF-UT-359** `LocalCleanup_Bdd120_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不能依檔案名稱相似就刪美術成品

- [x] **SEF-UT-360** `LocalCleanup_Bdd121_WithValidAction_ProducesExpectedFact`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：Given 首條技術測試全通過但真人試玩尚未核准；When 開發準備製作另外九條正式主線；Then 維持九條擴充 Gate 阻斷並可調整首條

- [x] **SEF-UT-361** `LocalCleanup_Bdd121_WithMissingPrecondition_RejectsUnauthorizedMutation`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：以該 Scenario 缺前置／非法 actor 或未解鎖狀態重測：不得跳節點、偽造真人操作、改共享世界或成功寫 receipt；原業務期望：維持九條擴充 Gate 阻斷並可調整首條

- [x] **SEF-UT-362** `LocalCleanup_Bdd121_WithReplayOrConcurrentAction_PreservesSecondaryInvariant`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tools/tests/story-content-policy.test.mjs`
  - **具體驗證**：斷線恢復、事件重送、重複播放／二人不同步時檢查次要斷言：不以測試 fixture 或兩個 Ending 當成多條故事

- [x] **SEF-UT-363** `TrackGraph_WhenThreeCrossingsAndOptionalCycle_ValidatesEndings`（高）
  - **來源**：`SEF-V2-GAP-04`；`SEF-BDD-085／SEF-BDD-087／SEF-BDD-089`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：I/A 交替三次交會、Shared→A-only，另有有界可選回訪
  - **預期斷言**：Publisher 接受合法圖且所有必經角色可到達 Ending，不錯誤重置對方 Node
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

- [x] **SEF-UT-364** `TrackGraph_WhenRequiredCrossTrackCycle_RejectsDeadlock`（高）
  - **來源**：`SEF-V2-GAP-04`；`SEF-BDD-087／SEF-BDD-088`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：I 必經事件等待 A，而 A 也只可由不可達的 I 後續事件解鎖
  - **預期斷言**：Publisher 拒絕必經死鎖與不可達 Ending，不誤判有界可選回訪
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

- [x] **SEF-UT-365** `SceneEventPolicy_WhenUnknownAreaObjectSlotOrAction_FailsClosed`（高）
  - **來源**：`SEF-V2-GAP-05`；`SEF-BDD-095／SEF-BDD-099／SEF-BDD-103`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：move-area／manipulate-object／NPC 傳入未知 Area、objectId、slot、module 或 params
  - **預期斷言**：嚴格 Schema／Domain 拒絕、無受控物件的偽造效果，缺 Cue 或素材不得發布
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

- [x] **SEF-UT-366** `RainBookshopPublisher_WhenNodeOrCueMissing_RejectsManifest`（高）
  - **來源**：`SEF-V2-GAP-07`；`SEF-BDD-104／SEF-BDD-117`；**建議測試入口**：`backend/tests/DatingHigh.Unit.Tests/Domain/SceneEventTrackTests.cs`
  - **前置／操作**：21 Node、四 Area、三次交會、兩 Ending 及正式 Cue 中缺任何必經台詞、物件或素材 hash
  - **預期斷言**：版本化 Publisher 逐項檢查 RB-01～14 與 SDD，缺必經內容一律拒絕，不用 fixture 湊內容
  - **證據要求**：Red→Green Unit／合法 Manifest 驗證

## IT

- [x] **SEF-IT-001** `Recommend_OneCategory_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-001／SEF-AC-001`；情境：唯一可玩類別直接進場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雙方配對成功且只有浪漫類別具有可玩主線；受邀方接受邀請
  - **驗證**：提交後 query/snapshot 確認「伺服器直接選中浪漫類別並抽場景主線」並保持「沒有偽造投票，也沒有出現選類別畫面」；錯誤必須完整 rollback

- [x] **SEF-IT-002** `Recommend_TwoCategories_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：兩類別由真人各投一票
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：浪漫與懸疑兩類別皆有可玩主線；A 與 B 各提交有效類別票
  - **驗證**：提交後 query/snapshot 確認「兩票決議後只形成一筆最新場次」並保持「決議前不顯示對方所選類別」；錯誤必須完整 rollback

- [x] **SEF-IT-003** `Recommend_ThreePlusCategories_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：三個以上類別依興趣取前三
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：四類別皆有可玩主線且雙方興趣不同；配對成立並取得候選
  - **驗證**：提交後 query/snapshot 確認「按雙方均衡推薦排序凍結前三個 Category ID」並保持「候選順序兩端一致且不因重新整理改變」；錯誤必須完整 rollback

- [x] **SEF-IT-004** `Scene_MultiCategory_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-008／SEF-AC-002`；情境：同場景可屬多個類別
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雨聲書店同時對應浪漫與懸疑；兩個類別分別被選中
  - **驗證**：提交後 query/snapshot 確認「都能找到同一已發布場景且引用正確版本」並保持「類別不是 Profile 的 reading 興趣欄位」；錯誤必須完整 rollback

- [x] **SEF-IT-005** `Narrative_MultiPerScene_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-009／SEF-AC-002`；情境：同場景可有多條完整主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雨聲書店綁定尋書與夜雨約定兩條主線；查詢同場景合格主線
  - **驗證**：提交後 query/snapshot 確認「兩條主線均可在同一場景被選中」並保持「不同主線的 entry 與內容版本互不混淆」；錯誤必須完整 rollback

- [x] **SEF-IT-006** `Scene_WeightThreeToOne_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-011／SEF-AC-003`；情境：新場景抽選權重為三比一
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：一個未玩場景與一個已玩場景均合格；伺服器在可注入 RNG 下重複抽選
  - **驗證**：提交後 query/snapshot 確認「未玩過場景的選中權重是已玩過的三倍」並保持「並非硬性排除已玩場景」；錯誤必須完整 rollback

- [x] **SEF-IT-007** `Narrative_UnorderedWeighted_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-014／SEF-AC-003`；情境：無序主線優先未玩三比一
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一場景存在已玩與未玩無序主線；抽選主線
  - **驗證**：提交後 query/snapshot 確認「未玩者取得較高但非唯一機率」並保持「相同隨機種子可重現測試結果」；錯誤必須完整 rollback

- [x] **SEF-IT-008** `Narrative_OrderedUnlock_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-015／SEF-AC-003`；情境：有序主線不可跳章
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第二章需要第一章完成且第三章未解鎖；抽選有序主線
  - **驗證**：提交後 query/snapshot 確認「只能從目前符合前置條件的章節選擇」並保持「不能因權重偏好直接選第三章」；錯誤必須完整 rollback

- [x] **SEF-IT-009** `Graph_OneEnding_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：線性主線一個結局即可發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：線性主線只有一個可達 Ending 且有完整開場推進；發布工具驗證並進行遊玩
  - **驗證**：提交後 query/snapshot 確認「內容合法且能抵達唯一結尾」並保持「不再要求至少兩個 Ending 或固定四節點」；錯誤必須完整 rollback

- [x] **SEF-IT-010** `Graph_BranchRejoin_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-020／SEF-AC-004`；情境：分支後可合流共同主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：兩個不同選項通往不同線索後合流；玩家選擇其中一項
  - **驗證**：提交後 query/snapshot 確認「只有所選分支的事件結果寫入進度」並保持「其餘共用主線可正常繼續」；錯誤必須完整 rollback

- [x] **SEF-IT-011** `Event_RoleByBinding_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-023／SEF-AC-005`；情境：同一事件在不同主線有不同用途
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：書籤事件被兩條主線引用；內容發布並啟動兩條主線
  - **驗證**：提交後 query/snapshot 確認「第一條定義為支線，第二條可定義為主線」並保持「EventDefinition ID 與玩法版本保持相同」；錯誤必須完整 rollback

- [x] **SEF-IT-012** `Event_HiddenRandomConditional_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：隱藏與隨機與前置條件可同時存在
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：事件有 visibility=hidden、weighted_random 和完成找線索前置；符合條件後抽中此事件
  - **驗證**：提交後 query/snapshot 確認「系統只在成功觸發時向合格玩家揭露」並保持「三個維度彼此不互斥」；錯誤必須完整 rollback

- [x] **SEF-IT-013** `Event_ThreeSourcePools_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：主線場景全域事件池可共存
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：書店存在主線綁定、場景綁定與相容全域綁定；伺服器彙整候選事件
  - **驗證**：提交後 query/snapshot 確認「三來源依限定 Binding ID 合併並過濾相容性」並保持「主線必要事件不被全域自由事件搶占」；錯誤必須完整 rollback

- [x] **SEF-IT-014** `Event_PlaythroughScope_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-028／SEF-AC-006`；情境：事件僅在本次遊玩不重複
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一 Binding 已於 episode 1 完成且 repeatScope=playthrough；雙方同意開始 episode 2 並符合觸發條件
  - **驗證**：提交後 query/snapshot 確認「episode 2 可重新觸發這個事件」並保持「episode 1 仍無法重複建立相同 Binding instance」；錯誤必須完整 rollback

- [x] **SEF-IT-015** `Event_RoundScope_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-029／SEF-AC-006`；情境：整輪配對範圍限制事件重複
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：事件在 episode 1 完成且 repeatScope=round；同一 Round 的 episode 2 再符合觸發
  - **驗證**：提交後 query/snapshot 確認「該事件不會再次觸發」並保持「更換配對組合可以在新的 Round 重新體驗」；錯誤必須完整 rollback

- [x] **SEF-IT-016** `Event_OutcomeChangesNarrative_RealD1_AtomicAndPersistent`（中）
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

- [x] **SEF-IT-021** `Boundary_MVP002NoAIGeneration_RealD1_AtomicAndPersistent`（中）
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

- [x] **SEF-IT-024** `Pair_NewPartnerReset_RealD1_AtomicAndPersistent`（中）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：換配對對象重新計算去重
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：A 與 B 完成書店，A 與 C 是不同有效配對；系統替 A 與 C 抽場景主線
  - **驗證**：提交後 query/snapshot 確認「A 與 B 的歷史不降低 A 與 C 的書店權重」並保持「不跨配對讀取另一人的私人事件」；錯誤必須完整 rollback

- [x] **SEF-IT-025** `Narrative_MixedEligible_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-016／SEF-AC-003`；情境：有序與無序主線混合隨機
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第二章已解鎖且同場景另有獨立主線；系統計算合格候選後抽選
  - **驗證**：提交後 query/snapshot 確認「第二章與獨立主線都能參與抽選」並保持「沒有強制第二章必須先玩」；錯誤必須完整 rollback

- [x] **SEF-IT-026** `Graph_MultipleEndings_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-021／SEF-AC-004`；情境：不同真人選擇得到不同收尾
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：雨聲書店保留原合作互動的兩種結果；兩位真人提交相同或不同答案
  - **驗證**：提交後 query/snapshot 確認「系統分別抵達對應的已發布 Ending」並保持「不替離線另一方自動選答案」；錯誤必須完整 rollback

- [x] **SEF-IT-027** `Chapter_OptionalNotRequired_RealD1_AtomicAndPersistent`（高）
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

- [x] **SEF-IT-030** `Scene_AllPlayedFallback_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-012／SEF-AC-003`；情境：場景都已玩過仍可再抽
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一對玩家已完成該類別全部場景；雙方開始下一場
  - **驗證**：提交後 query/snapshot 確認「系統仍可從合格場景抽選」並保持「不因已全部體驗而無限等待」；錯誤必須完整 rollback

- [x] **SEF-IT-031** `Narrative_AllCompletedFallback_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-017／SEF-AC-003`；情境：合格主線均玩過仍可重玩
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：某場景所有可選主線已完成；雙方開始新的場次
  - **驗證**：提交後 query/snapshot 確認「系統仍能依規則抽中已玩主線」並保持「有序章節的前置條件仍然生效」；錯誤必須完整 rollback

- [x] **SEF-IT-032** `Event_RepeatGroup_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：相同事件不同來源依語意去重
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：Scene 與 Global 都提供同一 repeatGroup 的事件；伺服器同時發現兩個合格 Binding
  - **驗證**：提交後 query/snapshot 確認「只建立一個語意事件執行實例」並保持「不重複扣次數或重複通知」；錯誤必須完整 rollback

- [x] **SEF-IT-033** `Event_ConcurrentSubmit_RealD1_AtomicAndPersistent`（高）
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

- [x] **SEF-IT-036** `Sequence_Monotonic_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：全輪事件序號與冪等保存
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：Room DO 訊息同時到達且某次廣播失敗；D1 完成原子提交後客戶端補漏
  - **驗證**：提交後 query/snapshot 確認「事件 sequence 單調且同 requestId 回原 receipt」並保持「不能用新的 requestId 自動補發未知結果」；錯誤必須完整 rollback

- [x] **SEF-IT-037** `Recovery_ReconnectNoReroll_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-045／SEF-AC-009`；情境：重連與刷新不能重抽場景主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：此場已釘選場景與主線且 DO 斷線；Web 或 Android 重啟並重建連線
  - **驗證**：提交後 query/snapshot 確認「以同一固定 ID 與 revision 恢復」並保持「不更動場景、票、事件結果與版本」；錯誤必須完整 rollback

- [x] **SEF-IT-038** `Boundary_SingleSceneVisit_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-052／SEF-AC-012`；情境：劇情模式單次只走一個場景
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：同一 StorySession 已有一個 SceneVisit；Client 要求直接換第二場景
  - **驗證**：提交後 query/snapshot 確認「系統拒絕這次遊玩跨場景」並保持「資料模型仍可供未來沉浸模式多場景擴充」；錯誤必須完整 rollback

- [x] **SEF-IT-039** `Recommend_NoPlayableCategory_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-006／SEF-AC-001`；情境：沒有完整內容不建立空遊戲
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：已發布類別無任何可玩主線；玩家接受配對邀請
  - **驗證**：提交後 query/snapshot 確認「系統返回 NO_PLAYABLE_STORY 並保持邀請與配對資料一致」並保持「沒有新增 game_rounds 或假測試故事」；錯誤必須完整 rollback

- [x] **SEF-IT-040** `Vote_InvalidOrLeaked_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：無效類別票和未決議投票隱私
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：兩位已取得固定候選而對方尚未投票；第三人提交票或讀取對方原始票
  - **驗證**：提交後 query/snapshot 確認「服務拒絕越權並只提供 partnerHasVoted 狀態」並保持「不得洩漏私有興趣及未決議 categoryId」；錯誤必須完整 rollback

- [x] **SEF-IT-041** `Scene_InvalidRelation_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-010／SEF-AC-002`；情境：無效類別或場景關聯拒絕發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：關聯指向不存在或 retired 的場景版本；內容發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕發布且原已發布索引不受影響」並保持「不產生沒有可玩主線的候選類別」；錯誤必須完整 rollback

- [x] **SEF-IT-042** `Narrative_PrerequisiteForgery_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-018／SEF-AC-003`；情境：客戶端無法指定尚未解鎖主線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第三章尚未解鎖且客戶端知道其 ID；客戶端偽造選中的 narrativeId
  - **驗證**：提交後 query/snapshot 確認「伺服器拒絕並保持現有場次不變」並保持「不得寫入非法選中事件」；錯誤必須完整 rollback

- [x] **SEF-IT-043** `Graph_UnreachableEnding_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-022／SEF-AC-004`；情境：不可抵達結尾不能發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：主線節點循環且找不到可達 Ending；內容發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕成為 published 完整主線」並保持「不把其算入十條驗收數量」；錯誤必須完整 rollback

- [x] **SEF-IT-044** `Event_SceneCapability_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-026／SEF-AC-005`；情境：全域事件不得在不相容場景出現
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：全域事件需要書架能力但所在場景沒有書架；觸發引擎計算候選
  - **驗證**：提交後 query/snapshot 確認「排除該全域事件」並保持「不因標記 global 就無條件可用」；錯誤必須完整 rollback

- [x] **SEF-IT-045** `Event_UnsupportedRenderer_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-027／SEF-AC-005`；情境：未知事件玩法不能發布
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：EventDefinition 使用前端未實作的 moduleType；內容發布工具驗證
  - **驗證**：提交後 query/snapshot 確認「拒絕 published 並指出不支援的玩法」並保持「不生成只有點擊外觀的空白互動」；錯誤必須完整 rollback

- [x] **SEF-IT-046** `Event_InvalidDependency_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-032／SEF-AC-006`；情境：不符合前置或循環依賴不能觸發
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：事件 A 需要尚未完成的 B 或定義互相循環；發布或觸發事件
  - **驗證**：提交後 query/snapshot 確認「發布前拒絕循環，遊玩時拒絕未解鎖事件」並保持「不修改任何已完成事件狀態」；錯誤必須完整 rollback

- [x] **SEF-IT-047** `Chapter_RejectOldOptional_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：完成後禁止觸發舊支線
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：StorySession 已完成且尚有未完成書籤事件；客戶端送出舊場次事件操作
  - **驗證**：提交後 query/snapshot 確認「返回 EVENT_STATE_CONFLICT 且無新事件紀錄」並保持「下一次有效重玩才能再次探索」；錯誤必須完整 rollback

- [x] **SEF-IT-048** `Next_OldEpisodeReplay_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：舊場同意不能開啟新場
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：最新是 episode 3，客戶端仍帶 completedEpisodeSeq=1；再次提交舊場同意
  - **驗證**：提交後 query/snapshot 確認「伺服器拒絕過期場次操作」並保持「不跨場使用舊選票或同意」；錯誤必須完整 rollback

- [x] **SEF-IT-049** `Auth_ThirdPartyAndRevoked_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-044／SEF-AC-009`；情境：第三人及撤銷登入不得操作
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：第三人知道 roundId 或原成員 session 被撤銷；呼叫投票、下一場、事件及訊息 API
  - **驗證**：提交後 query/snapshot 確認「全部 fail-closed 不寫入資料」並保持「只回安全錯誤而非真實玩家資料」；錯誤必須完整 rollback

- [x] **SEF-IT-050** `Content_R2Corrupt_RealD1_AtomicAndPersistent`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：R2 缺檔或 SHA 錯誤不得啟動
  - **前置／操作**：Miniflare 真 D1、固定 R2 內容與真序號：內容目錄存在但 Manifest 缺失或雜湊不符；伺服器驗證／準備下一場
  - **驗證**：提交後 query/snapshot 確認「拒絕進場並維持可恢復的狀態」並保持「不可提交半套 StorySession 或重新擲骰」；錯誤必須完整 rollback

- [x] **SEF-IT-051** `Content_InvalidManifest_RealD1_AtomicAndPersistent`（高）
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

- [x] **SEF-IT-055** `Selection_R2FaultBeforeD1Commit_RetrySameDecision`（高）
  - **來源**：`SEF-BDD-047／SEF-AC-010`；情境：Selection_R2FaultBeforeD1Commit_RetrySameDecision
  - **前置／操作**：內容檢查後 R2 暫時故障且 D1 commit 不確定
  - **驗證**：恢復時查既有決議，不重抽、不建立半場

- [x] **SEF-IT-056** `RoundRepeat_ConcurrentEpisodes_EnforcesGroup`（高）
  - **來源**：`SEF-BDD-030／SEF-AC-006`；情境：RoundRepeat_ConcurrentEpisodes_EnforcesGroup
  - **前置／操作**：多個 Episode 使用相同 repeatGroup
  - **驗證**：同 Round 只允許一筆完成事件造成的作用

- [x] **SEF-IT-057** `EventBinding_ThreeSources_SameSemanticDeduplicates`（高）
  - **來源**：`SEF-BDD-025／SEF-AC-005`；情境：EventBinding_ThreeSources_SameSemanticDeduplicates
  - **前置／操作**：Narrative/Scene/Global Pool 重疊綁定
  - **驗證**：相同 repeatGroup 不重複觸發且主線必要事件不被跳過

- [x] **SEF-IT-058** `Graph_SingleEnding_RejectsNonTerminatingCycle`（高）
  - **來源**：`SEF-BDD-019／SEF-AC-004`；情境：Graph_SingleEnding_RejectsNonTerminatingCycle
  - **前置／操作**：一個 Ending 的合法圖與不可終結圖
  - **驗證**：合法者發布、不可終結循環者拒絕

- [x] **SEF-IT-059** `NextConsent_OnePlayerOffline_NoTimeoutAutoVote`（高）
  - **來源**：`SEF-BDD-038／SEF-AC-008`；情境：NextConsent_OnePlayerOffline_NoTimeoutAutoVote
  - **前置／操作**：A 同意但 B 長期離線
  - **驗證**：不產生自動表決、Round 聊天與序號仍一致

- [x] **SEF-IT-060** `PairHistory_AccountLowHigh_TracksOnlyPair`（高）
  - **來源**：`SEF-BDD-013／SEF-AC-003`；情境：PairHistory_AccountLowHigh_TracksOnlyPair
  - **前置／操作**：A+B 完成場景，A+C 再遊玩
  - **驗證**：權重按 ordered pair 計算，不交叉污染

- [x] **SEF-IT-061** `Gate_OnlyFirstCompleteStory_NoFixturePromotion`（高）
  - **來源**：`SEF-BDD-050／SEF-AC-011`；情境：Gate_OnlyFirstCompleteStory_NoFixturePromotion
  - **前置／操作**：十條內容中僅首條完成與九個 fixture
  - **驗證**：最終驗收計數=1、人工 Gate 未確認阻止後九條

- [x] **SEF-IT-062** `Narrative_SelectedCategory_RealD1_OnlyEligiblePersists`（高）
  - **來源**：`SEF-BDD-064／SEF-AC-003`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：真 D1 與 R2 清單含混合三種主線；選懸疑只建立符合白名單的 StorySession/SceneVisit，無類別錯配

- [x] **SEF-IT-063** `NextEpisode_LatestInterests_RealD1_OffersFrozenExactlyOnce`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`RA-Q2=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：A 修改興趣成功後，B 第二個同意以最新兩人興趣原子凍結 episode+1；重送不重算

- [x] **SEF-IT-064** `Category_NoMatchingNarrative_RealD1_RollsBackAcceptance`（高）
  - **來源**：`SEF-BDD-066／SEF-AC-001`；`RA-Q1=A`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：Scene 關聯懸疑但沒有相符可玩主線，真 D1 禁止空 Round／Episode、維持既有 Round 已完成狀態

- [x] **SEF-IT-065** `SelectNarrative_CategoryMismatch_RealD1_RejectsCandidate`（高）
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

- [x] **SEF-IT-069** `CompleteChapter_WithPendingPartnerInteraction_CancelsBothInstancesAtomically`（高）
  - **來源**：`SEF-BDD-035／SEF-AC-007`；`SEF-GAP-05`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：主線完成時，同一 D1 原子批次同步封存未完 EventInstance 及既有 InteractionInstance；不能殘留 pending

- [x] **SEF-IT-070** `StartNext_WhenConsentWithdrawRacesSecondAgree_ResolvesOneAuthoritativeState`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；`SEF-GAP-06`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：同意／撤回／第二同意三路競態只得一個有效下一場或完成等待，不能重複 episode

- [x] **SEF-IT-072** `PinnedScenePresentation_AfterNarrativeSplit_PreservesApprovedAssets`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：已發布 Scene/Narrative 跨版本抽選及 R2 資產 SHA 查回
  - **驗證**：原雨聲書店背景、前景、鏡頭、熱區和 audioCue 均固定並且內容可被重新載入

- [x] **SEF-IT-073** `EventPresentation_OverlayDoesNotCommitNarrativeNode`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：真 D1 EventInstance 達成並用 eventSeq 重連恢復
  - **驗證**：暫時表情/鏡位效果可投影、清除、還原；current_node_id/revision 不因演出而變

- [x] **SEF-IT-074** `Publisher_InvalidPresentationId_FailsAtomically`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Publisher 收到不存在的 camera、expression、audio asset
  - **驗證**：拒絕發布，原 Published 版本及對應檔案索引不被改壞

- [x] **SEF-IT-075** `HiddenHotspot_ProjectionAndPreview_ProducesNoEventCommit`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：靜態 Scene 有 hotspot，Event 未解鎖，使用真 D1/HTTP 投影
  - **驗證**：未解鎖前不洩漏；解鎖預覽但取消不新增 game_event_instances

- [x] **SEF-IT-076** `AvatarUpdated_LeavesStorySessionAndSceneVersionUnchanged`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：有權限的 actor 在進行中的 Round 採用新 ready 五表情
  - **驗證**：avatarVersion 更新而 storySessionId、currentNode、progressRevision、場景 Manifest SHA 均不改

- [x] **SEF-IT-077** `NewEpisode_SameNodeId_ResetsOnlyStageAndKeepsChat`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Round episode2 node=entry，episode1 node=entry 且聊天存在
  - **驗證**：episode2 的 Stage/Action 作用域獨立，原 Round 聊天事件可回讀且不覆寫

- [x] **SEF-IT-078** `ForegroundSync_WhenRequestUncertain_DoesNotRerollOrResubmit`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：退背景、斷線、ACK 遺失後重連真 DO/D1/R2
  - **驗證**：只能用已提交 Snapshot/eventSeq 查回，不重抽或自動產生下一個 Action

- [x] **SEF-IT-079** `RevokedRound_StaleAvatarResponse_CannotRevealPrivateAssets`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：已退出的 Round 與晚回的私人 R2 角色請求
  - **驗證**：經 401/403/ended 清投影後不能顯示舊五表情或跨房資料

- [x] **SEF-IT-080** `CurrentAdoptedAvatar_RequiresCompleteOwnedPack`：真 Miniflare D1／R2 驗本人當前 ready 資產、有效清單與五物件；缺圖、pending、他人資產拒絕；另一組 pending 不影響已就緒採用者；R2 等待後撤銷401。

- [x] **SEF-IT-081** `ParticipantTrack_Bdd080_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：場次決議已成功且兩名真人身分有效；Server 建立 StorySession
  - **真實邊界斷言**：同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界；任何一筆建立失敗都不能留下半場；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-082** `ParticipantTrack_Bdd081_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 和 A 各位於不同個人節點；I 先完成本人可用的事件
  - **真實邊界斷言**：僅 I 的 node、Area、revision 進步，A 不變；A 可稍後親自完成未玩節點；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-083** `ParticipantTrack_Bdd082_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：Round 已固定原邀請人及接受人；前端假造另一方 role、nodeId 或 accountId
  - **真實邊界斷言**：Server 拒絕假冒且不修改進度；不可用帳號大小或先上線順序決定角色；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-084** `ParticipantTrack_Bdd083_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 前進而 A 還在 A02；A 重新登入取授權 experience
  - **真實邊界斷言**：A 恢復 A02、Area、可操作物件及個人 revision；全域 eventSeq 不能替 A 決策；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-085** `ParticipantTrack_Bdd084_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 的必要節點完成而 A08 未完成；I 嘗試結束本場主線
  - **真實邊界斷言**：chapter 仍是 playing 且 A 可繼續；A 完成及 Shared predicate 齊備才發出一次 chapter.completed；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-086** `SharedTransition_Bdd085_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：S01 兩人真人核對且 I04、A04、S02 都在合法圖中；雙方提交 S01 後分別移至不同區域
  - **真實邊界斷言**：I04、A04 分別開啟並可進 S02 再交會；不修改對方未完成的私人事件；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-087** `SharedTransition_Bdd086_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：S02 完成時 I 在 I08、A 尚未執行 A08；伺服器結算 S02 的合法雙人答案
  - **真實邊界斷言**：只開啟 A08 且 I 停留 I08；A 驗證完才可進入 S03；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-088** `SharedTransition_Bdd087_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-087／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 必經事件等 A，A 必經事件又等不可達的 I；Publisher 檢查兩條 Track 與 Shared 依賴圖
  - **真實邊界斷言**：拒絕不能到達共同 Ending 的內容；合法可選回訪不被錯誤禁止；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-089** `SharedTransition_Bdd088_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-088／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：條件採 role、Area、bindingKey 與共享世界事實；有人注入未知條件、過深布林或假 role
  - **真實邊界斷言**：Schema 或 Domain 拒絕非法組合；合法 all、any、not 僅查已提交事實；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-090** `SharedTransition_Bdd089_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-089／SEF-AC-019；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：玩家已在第一場 Scene 探索多個 Area；兩人完成後同意並進入第二場
  - **真實邊界斷言**：每個 StorySession 僅一筆 SceneVisit、各自有 Area；跨場次和跨角色同名節點不得互相污染；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-091** `WorldState_Bdd090_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：A 詢問店員得到書名但尚未分享；I 查快照、WS、熱區及可讀 Manifest
  - **真實邊界斷言**：I 不得看 A 私有節點或答案；A 主動分享後只公開允許的線索；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-092** `WorldState_Bdd091_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：書袋由共享世界權威記錄在書架；兩名真人以相同 revision 同時 pick
  - **真實邊界斷言**：只一個合法 D1 CAS 成功、另一人 409 同步；物件不複製且不重複完成事件；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-093** `WorldState_Bdd092_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：S02 必須 I hold-bag 與 A retrieve-tag；I 先提交、A 離線後才操作
  - **真實邊界斷言**：第一次提交只保留 I 事實且 EventInstance active；A 親提交後才完成一次 shared event；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-094** `WorldState_Bdd093_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：同一 EventDefinition 在 I 與 A 各有一個 binding；兩人各自完成合法個人探索
  - **真實邊界斷言**：兩份不同 scope 的 EventInstance 均存在；Shared binding 僅有一個共同 instance；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-095** `WorldState_Bdd094_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：A 有尚未觸發的隱藏事件；I 請求 experience、events query 或公開 R2
  - **真實邊界斷言**：無 A 私人線索、未知 binding 與私人 R2 key；只顯示合作狀態的白名單摘要；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-096** `SceneInteraction_Bdd095_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：一場 Scene 只有一筆 SceneVisit；I 由 entrance 移到 counter 再到 shelves
  - **真實邊界斷言**：本人的 Area、鏡頭和可用熱區真實更新；不可移至未解鎖或不存在的 Area；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-097** `SceneInteraction_Bdd096_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：I 在 entrance 可見濕紙單；I 親自點 flip 及查看特寫
  - **真實邊界斷言**：紙張可見翻面並得到 27 的個人線索；跳過動畫不能跳過 Server 的正式操作；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-098** `SceneInteraction_Bdd097_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：I 尚未得到分享線索或選中錯書；將 book-wednesday 拖到櫃檯
  - **真實邊界斷言**：出現可恢復的具體提示，orderStatus 不變；依正確資訊重新選書仍可完成；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-099** `SceneInteraction_Bdd098_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：A 在櫃檯且店員可交談；A 親自選擇 query-title
  - **真實邊界斷言**：只 A 先看到預訂資訊，分享後 I 才知道；NPC 不能代另一位真人聊天或提交；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-100** `SceneInteraction_Bdd099_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：場景及物件白名單已由 R2 釘選；Client 提交未授權 objectId、targetSlotId 或 action
  - **真實邊界斷言**：Server 409／明確拒絕且世界未變；合法 params 才能改 EventInstance 與進度；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-101** `ScenePresentation_Bdd100_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；兩人完成互動後播放可見演出
  - **真實邊界斷言**：鏡頭、物件、兩位真人化身及五表情符合 Cue；缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-102** `ScenePresentation_Bdd101_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：Rain Scene 顯示 AmbientMotion；玩家檢視雨絲和玻璃水痕後關閉微動
  - **真實邊界斷言**：畫面先有真正移動且關閉後停止循環；必要 StoryMotion 仍能播放並且有可讀替代狀態；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-103** `ScenePresentation_Bdd102_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-102／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：S02 風起已提交且標籤在窗台；Android/Web 進背景再返回並恢復 Session
  - **真實邊界斷言**：根據權威狀態顯示標籤且不重觸發風事件；不 autoplay 音效、不重送指令、不再產生五表情；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-104** `ScenePresentation_Bdd103_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-103／SEF-AC-022；**建議測試檔**：`tests/integration/scene-stage-interactions.test.mjs`
  - **前置／操作**：Manifest 包含未知 anchor、表情、camera 或 motion；Publisher 驗證並由 Web/Android 量測正式遊玩
  - **真實邊界斷言**：非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據；不能以缺動畫的純文字替代宣告 Gate B 成功；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-105** `RainBookshop_Bdd104_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：雨聲書店 v2 的 I01 和 A01 已釘選；I 先翻濕紙單、A 停在書架
  - **真實邊界斷言**：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立；先行者不推進另一方未完成節點；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-106** `RainBookshop_Bdd105_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 看濕紙、A 查書袋外標籤；兩人各自 inspect 並讀取 experience
  - **真實邊界斷言**：僅本人看到已探索的資訊；未經分享不洩漏對方私有節點或觸發；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-107** `RainBookshop_Bdd106_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **真實邊界斷言**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-108** `RainBookshop_Bdd107_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 看兩本海邊書、A 向店員查出正確書；I 在 A 尚未分享前嘗試領走書
  - **真實邊界斷言**：不能完成；A 主動分享後 I 才能選中 book-rain；不把 A 私人店員台詞完整傳給 I；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-109** `RainBookshop_Bdd108_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I 選到 book-wednesday；I 嘗試放進 counter-slot
  - **真實邊界斷言**：提示錯書且 orderStatus 不變；可返回 shelves 重新選擇；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-110** `RainBookshop_Bdd109_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：A 知道封套位置且 I 仍在 I05；A 從 window 取出並送到 counter
  - **真實邊界斷言**：只保存 A 的進度和 green-sleeve 位置、S02 不觸發；I 仍可完成自己的找書流程；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-111** `RainBookshop_Bdd110_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **真實邊界斷言**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-112** `RainBookshop_Bdd111_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **真實邊界斷言**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-113** `RainBookshop_Bdd112_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：S02 completed，I 在 I08；A 到 counter 開始 verify-order
  - **真實邊界斷言**：僅 A 開啟 A08，I 保持 I08；A 真人確認後才啟動 S03；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-114** `RainBookshop_Bdd113_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：S03 已解鎖且兩人可選最終意向；I 親按 look_back、A 親按 rest_chat
  - **真實邊界斷言**：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用；任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-115** `RainBookshop_Bdd114_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：雙人必經事實與 S03 都有效；I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）
  - **真實邊界斷言**：第二位合法意向提交即同 D1 交易完成 E01／Side 封存／receipt；成功回應後才播一次暖光鏡頭，缺 receipt 不得假播成功；沒有可操作新物件／支線或第二個結束命令；跳動畫／重連不再提交；Round active／聊天保留，需使用真 Miniflare D1／R2 而非 fixture 斷言

- [x] **SEF-IT-116** `RainBookshop_Bdd115_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **真實邊界斷言**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-117** `RainBookshop_Bdd116_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`cloudflare/tests/rain-bookshop-d1.integration.test.ts`
  - **前置／操作**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **真實邊界斷言**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-119** `LocalCleanup_Bdd118_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-118／SEF-AC-024；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：僅識別 DatingHigh local DB 與 R2 並有保護資料清單；在開發 Gate 模擬清理及重建計畫
  - **真實邊界斷言**：只清舊遊戲測資與無用執行內容；未知、遠端、正式環境直接拒絕；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-120** `LocalCleanup_Bdd119_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-119／SEF-AC-024；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：scene-event.v2 新 runtime 已完整替換原路徑；從空 local DB 執行 migration 及引用稽核
  - **真實邊界斷言**：game_interaction_instances 已無表與索引且雙方 Progress 正確；保留 Round／聊天／EventReceipt／退出能力；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-121** `LocalCleanup_Bdd120_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-120／SEF-AC-024；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：16 款全身與五表情已正式提供且 R2 SHA 釘選；清除舊 story-scenes 與 bookmark 發布流程
  - **真實邊界斷言**：只有失效的舊入口被移除，正式來源與本劇本素材仍正常；不能依檔案名稱相似就刪美術成品；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-122** `LocalCleanup_Bdd121_WithRealBoundary_PersistsExpectedBehavior`（高）
  - **來源**：SEF-BDD-121／SEF-AC-023；**建議測試檔**：`tests/integration/local-game-maintenance.test.mjs`
  - **前置／操作**：首條技術測試全通過但真人試玩尚未核准；開發準備製作另外九條正式主線
  - **真實邊界斷言**：維持九條擴充 Gate 阻斷並可調整首條；不以測試 fixture 或兩個 Ending 當成多條故事；需依案例使用真 Miniflare D1／版本化 R2／受控 Worker、場景／內容發布或 local wrapper，不能用 HTTP fixture 冒充 DB 原子驗證。

- [x] **SEF-IT-123** `SharedEvent_WhenSecondActorRevisionStale_KeepsFirstSubmission`（高）
  - **來源**：`SEF-V2-GAP-01`；`SEF-BDD-092／SEF-BDD-110`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 已提交 hold-bag，A 以過時 sharedRevision 交 retrieve-tag
  - **預期斷言**：A 得 409；S02 未完成；I 已提交且有效的真人答案與 receipt 保留；雙 Track 及 WorldState 無半套狀態
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [x] **SEF-IT-124** `StorySession_WhenAtomicD1BatchFails_RollsBackAllFacts`（高）
  - **來源**：`SEF-V2-GAP-01`；`SEF-BDD-080／SEF-BDD-092`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：真 D1 故障注入第二個真人合法操作的 EventInstance、Progress、WorldState 或 game_round_events 寫入
  - **預期斷言**：同一交易完全 rollback，無 shared completed、無額外 eventSeq/receipt、未誤推進兩人
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [x] **SEF-IT-125** `OrderTag_WhenSameActorTwoDevicesRace_HasSingleWinner`（高）
  - **來源**：`SEF-V2-GAP-02`；`SEF-BDD-091／SEF-BDD-111`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：A 同帳號兩裝置以同一 sharedRevision 同時 pick order-tag-27
  - **預期斷言**：只能一個合法 CAS 成功；敗者讀回權威狀態，標籤唯一、不二次完成 S02
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [x] **SEF-IT-126** `OrderTag_WhenInviterSpoofsAcceptorAction_RejectsWrite`（高）
  - **來源**：`SEF-V2-GAP-02`；`SEF-BDD-082／SEF-BDD-111`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：I 猜到 A 專用 Binding／action 並帶偽造 role／accountId
  - **預期斷言**：拒絕操作且 EventInstance／WorldState／兩個 Progress 均不變
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [x] **SEF-IT-127** `LocalCleanup_WhenUnknownOrRemoteEnvironment_RefusesMutation`（高）
  - **來源**：`SEF-V2-GAP-06`；`SEF-BDD-118`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：未知 DB／R2 bucket、remote/SIT/prod 路徑、未完成停寫與備份
  - **預期斷言**：Local wrapper 必須停止，不執行 DROP／DELETE，不破壞帳號、角色與資料
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [x] **SEF-IT-128** `LocalCleanup_WhenLocalRebuilt_PreservesIdentityAndDropsLegacy`（高）
  - **來源**：`SEF-V2-GAP-06`；`SEF-BDD-118／SEF-BDD-119／SEF-BDD-120`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：確定 local、先停寫備份再 clean rebuild，保留帳號／個資／正式角色 hash
  - **預期斷言**：game_interaction_instances 和所有正式 Legacy 引用消失；真 D1 FK／索引與聊天、退出仍可運作
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

- [x] **SEF-IT-129** `RainBookshopR2_WhenHashTampered_RejectsAndKeepsPinnedScene`（高）
  - **來源**：`SEF-V2-GAP-07`；`SEF-BDD-104／SEF-BDD-117`；**建議測試入口**：`cloudflare/tests/scene-event-framework-d1.integration.test.ts`
  - **前置／操作**：釘選已發布 v2 Scene/Narrative/Event，R2 缺檔、被篡改或 SHA 不符
  - **預期斷言**：Worker fail closed，不重抽主線或退回 bookmark 舊內容；重連仍讀原合法釘選版本
  - **證據要求**：真 Miniflare D1／R2 與 rollback/CAS 證據，不能用 HTTP fixture 代簽

## API

- [x] **SEF-API-001** `Experience_GetActive_ReturnsCurrentEpisode`（高）
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

- [x] **SEF-API-004** `CategoryOffers_ValidRound_ReturnsFrozenTop3`（高）
  - **來源**：`SEF-BDD-003／SEF-AC-001`；情境：GET /game-rounds/{roundId}/story/offers
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/story/offers
  - **驗證**：同一場次最多三個已發布類別並按原排序

- [x] **SEF-API-005** `CategoryOffers_PartnerVotePending_HidesSelectedId`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：GET /game-rounds/{roundId}/story/offers
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/story/offers
  - **驗證**：對方未結算的票不能洩漏

- [x] **SEF-API-006** `CategoryOffers_StaleEpisode_ReturnsConflict`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：GET /game-rounds/{roundId}/story/offers
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 GET /game-rounds/{roundId}/story/offers
  - **驗證**：已結算舊 episode 不覆蓋新候選

- [x] **SEF-API-007** `CategoryVote_ValidPair_ResolvesExactlyOnce`（高）
  - **來源**：`SEF-BDD-002／SEF-AC-001`；情境：POST /game-rounds/{roundId}/story/vote
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/vote
  - **驗證**：真人兩票同批依原邀請者決議

- [x] **SEF-API-008** `CategoryVote_NotInFrozenOffers_Rejects`（高）
  - **來源**：`SEF-BDD-007／SEF-AC-001`；情境：POST /game-rounds/{roundId}/story/vote
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/vote
  - **驗證**：不在固定候選之票回 400/409 且不寫入

- [x] **SEF-API-009** `CategoryVote_RequestIdReplay_UsesReceipt`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：POST /game-rounds/{roundId}/story/vote
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/vote
  - **驗證**：原 requestId 重播保留第一次票、不再抽場景

- [x] **SEF-API-010** `Next_OnlyOneAgree_KeepsCompleted`（高）
  - **來源**：`SEF-BDD-039／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：單方 agree=true 不建立 episode+1

- [x] **SEF-API-011** `Next_BothAgree_CreatesSingleEpisode`（高）
  - **來源**：`SEF-BDD-041／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：兩人同意建唯一新場、支援同時提交

- [x] **SEF-API-012** `Next_WithdrawBeforeResolution_RemainsCompleted`（高）
  - **來源**：`SEF-BDD-040／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：agree=false 撤回在結算前生效

- [x] **SEF-API-013** `Next_StaleCompletedEpisode_Rejects`（高）
  - **來源**：`SEF-BDD-042／SEF-AC-008`；情境：POST /game-rounds/{roundId}/story/next
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/next
  - **驗證**：過期 completedEpisodeSeq 409、沒有新 episode

- [x] **SEF-API-014** `Event_ValidBinding_UpdatesOnce`（高）
  - **來源**：`SEF-BDD-031／SEF-AC-006`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：只接受釘選內容允許的 binding/action，寫入 EventInstance 與事件序號

- [x] **SEF-API-015** `Event_AfterCompletion_RejectsOldOptional`（高）
  - **來源**：`SEF-BDD-036／SEF-AC-007`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：主線完成後舊事件 409

- [x] **SEF-API-016** `Event_InvalidRevision_RejectsWithoutMutation`（高）
  - **來源**：`SEF-BDD-033／SEF-AC-006`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：舊 revision 或重播改 payload 不更新

- [x] **SEF-API-017** `Event_HiddenNotTriggered_ProjectsSafely`（高）
  - **來源**：`SEF-BDD-024／SEF-AC-005`；情境：POST /game-rounds/{roundId}/story/event
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/story/event
  - **驗證**：隱藏事件未解鎖，不漏 ID/答案

- [x] **SEF-API-018** `EventsQuery_AfterSeq_ReturnsOrderedProjected`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：POST /game-rounds/{roundId}/events/query
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/events/query
  - **驗證**：用 afterSeq 順序補漏，不洩漏未決票

- [x] **SEF-API-019** `EventsQuery_InvalidCursor_Rejects`（高）
  - **來源**：`SEF-BDD-043／SEF-AC-009`；情境：POST /game-rounds/{roundId}/events/query
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/events/query
  - **驗證**：無效 cursor 400，分頁有限界

- [x] **SEF-API-020** `End_WhenConfirmed_RevokesRoundWrites`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-007`；情境：POST /game-rounds/{roundId}/end
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/end
  - **驗證**：正式退出釋放 Claims 與永久排除 pair

- [x] **SEF-API-021** `End_WhenCancelled_PreservesRound`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-007`；情境：POST /game-rounds/{roundId}/end
  - **前置／操作**：有效登入、明確會員與指定輸入，請求 POST /game-rounds/{roundId}/end
  - **驗證**：前端取消不發 end mutation

- [x] **SEF-API-022** `PostNext_AfterInterestChange_ReturnsFrozenNewCategorySnapshot`（高）
  - **來源**：`SEF-BDD-065／SEF-AC-008`；`SEF-GAP-02`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：POST /story/next 第二同意後回固定的新場候選，重連後同一 candidate IDs；不回任何玩家私有原始興趣

- [x] **SEF-API-023** `LegacyStoryVote_AfterCategoryContractChange_RejectsOldStoryCatalogPayload`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；`SEF-GAP-07`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：POST /story/vote 若用舊 StoryCatalog ID 當 Category ID，回安全 400/409，不能落到舊劇情選擇路徑

- [x] **SEF-API-024** `Experience_WhenHiddenEventUnqualified_ExcludesHotspotProjection`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：GET experience 未解鎖及已解鎖熱區時的安全權限快照
  - **驗證**：只投影當前可互動內容；不洩漏 hidden 事件標題、答案、條件

- [x] **SEF-API-025** `Experience_OnEpisodeChange_ProjectsNewStageAndSameRoundChat`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：同 Round 第2場 GET /experience 並查事件游標
  - **驗證**：返回新 storySessionId/episodeSeq，保留 chat Round 事件，不回前場 pending action

- [x] **SEF-API-026** `PartnerAvatar_WhenRevoked_RefusesOldPrivateImage`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：失權後帶舊 avatarVersion 向 partner-avatar 請求圖片
  - **驗證**：401/403 或 ended safe failure，不公開私人 R2 key／已撤銷影像

- [x] **SEF-API-027** `OwnAvatarNotReady_BlocksEntryTicketAndCommands`：真 HTTP／Application／D1 驗入口、票券與共用 WS 命令用例拒絕且零寫入；本人恢復後可進；第三人403，end 及 ended 安全狀態不受阻。

- [x] **SEF-API-028** `StoryEventEndpoint_Bdd080_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-080／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：場次決議已成功且兩名真人身分有效；Server 建立 StorySession
  - **HTTP／WS 結果**：同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界；任何一筆建立失敗都不能留下半場。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-029** `StoryEventEndpoint_Bdd081_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-081／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 和 A 各位於不同個人節點；I 先完成本人可用的事件
  - **HTTP／WS 結果**：僅 I 的 node、Area、revision 進步，A 不變；A 可稍後親自完成未玩節點。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-030** `StoryEventEndpoint_Bdd082_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-082／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：Round 已固定原邀請人及接受人；前端假造另一方 role、nodeId 或 accountId
  - **HTTP／WS 結果**：Server 拒絕假冒且不修改進度；不可用帳號大小或先上線順序決定角色。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-031** `StoryEventEndpoint_Bdd083_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-083／SEF-AC-018；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 前進而 A 還在 A02；A 重新登入取授權 experience
  - **HTTP／WS 結果**：A 恢復 A02、Area、可操作物件及個人 revision；全域 eventSeq 不能替 A 決策。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-032** `StoryEventEndpoint_Bdd084_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-084／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 的必要節點完成而 A08 未完成；I 嘗試結束本場主線
  - **HTTP／WS 結果**：chapter 仍是 playing 且 A 可繼續；A 完成及 Shared predicate 齊備才發出一次 chapter.completed。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-033** `StoryEventEndpoint_Bdd085_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-085／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：S01 兩人真人核對且 I04、A04、S02 都在合法圖中；雙方提交 S01 後分別移至不同區域
  - **HTTP／WS 結果**：I04、A04 分別開啟並可進 S02 再交會；不修改對方未完成的私人事件。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-034** `StoryEventEndpoint_Bdd086_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-086／SEF-AC-019；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：S02 完成時 I 在 I08、A 尚未執行 A08；伺服器結算 S02 的合法雙人答案
  - **HTTP／WS 結果**：只開啟 A08 且 I 停留 I08；A 驗證完才可進入 S03。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-035** `StoryEventEndpoint_Bdd090_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-090／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：A 詢問店員得到書名但尚未分享；I 查快照、WS、熱區及可讀 Manifest
  - **HTTP／WS 結果**：I 不得看 A 私有節點或答案；A 主動分享後只公開允許的線索。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-036** `StoryEventEndpoint_Bdd091_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-091／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：書袋由共享世界權威記錄在書架；兩名真人以相同 revision 同時 pick
  - **HTTP／WS 結果**：只一個合法 D1 CAS 成功、另一人 409 同步；物件不複製且不重複完成事件。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-037** `StoryEventEndpoint_Bdd092_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-092／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：S02 必須 I hold-bag 與 A retrieve-tag；I 先提交、A 離線後才操作
  - **HTTP／WS 結果**：第一次提交只保留 I 事實且 EventInstance active；A 親提交後才完成一次 shared event。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-038** `StoryEventEndpoint_Bdd093_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-093／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：同一 EventDefinition 在 I 與 A 各有一個 binding；兩人各自完成合法個人探索
  - **HTTP／WS 結果**：兩份不同 scope 的 EventInstance 均存在；Shared binding 僅有一個共同 instance。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-039** `StoryEventEndpoint_Bdd094_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-094／SEF-AC-020；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：A 有尚未觸發的隱藏事件；I 請求 experience、events query 或公開 R2
  - **HTTP／WS 結果**：無 A 私人線索、未知 binding 與私人 R2 key；只顯示合作狀態的白名單摘要。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-040** `StoryEventEndpoint_Bdd095_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-095／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：一場 Scene 只有一筆 SceneVisit；I 由 entrance 移到 counter 再到 shelves
  - **HTTP／WS 結果**：本人的 Area、鏡頭和可用熱區真實更新；不可移至未解鎖或不存在的 Area。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-041** `StoryEventEndpoint_Bdd096_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-096／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 在 entrance 可見濕紙單；I 親自點 flip 及查看特寫
  - **HTTP／WS 結果**：紙張可見翻面並得到 27 的個人線索；跳過動畫不能跳過 Server 的正式操作。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-042** `StoryEventEndpoint_Bdd097_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-097／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 尚未得到分享線索或選中錯書；將 book-wednesday 拖到櫃檯
  - **HTTP／WS 結果**：出現可恢復的具體提示，orderStatus 不變；依正確資訊重新選書仍可完成。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-043** `StoryEventEndpoint_Bdd098_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-098／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：A 在櫃檯且店員可交談；A 親自選擇 query-title
  - **HTTP／WS 結果**：只 A 先看到預訂資訊，分享後 I 才知道；NPC 不能代另一位真人聊天或提交。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-044** `StoryEventEndpoint_Bdd099_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-099／SEF-AC-021；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：場景及物件白名單已由 R2 釘選；Client 提交未授權 objectId、targetSlotId 或 action
  - **HTTP／WS 結果**：Server 409／明確拒絕且世界未變；合法 params 才能改 EventInstance 與進度。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-045** `StoryEventEndpoint_Bdd106_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **HTTP／WS 結果**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-046** `StoryEventEndpoint_Bdd110_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **HTTP／WS 結果**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-047** `StoryEventEndpoint_Bdd111_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **HTTP／WS 結果**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-048** `StoryEventEndpoint_Bdd115_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **HTTP／WS 結果**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-049** `StoryEventEndpoint_Bdd116_WithAuthorizedActor_EnforcesStateAndReceipt`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **Given／When**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **HTTP／WS 結果**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作。實際路徑按場景使用 `/experience`、`/story/event`、`/events/query` 與 Room WS；驗 200/401/403/409、嚴格 params、expectedTrackRevision／expectedSharedRevision／expectedEventRevision、clientRequestId 冪等與 actor-scoped 安全投影。不存在的 API 不可用假回應冒充通過。

- [x] **SEF-API-050** `Experience_WhenPartnerCluePrivate_OmitsSecretProjection`（高）
  - **來源**：`SEF-V2-GAP-03`；`SEF-BDD-090／SEF-BDD-094／SEF-BDD-105`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：A 已問到正確書名但未分享，I 讀 /experience／events query／WS
  - **預期斷言**：I 無 A 私有節點／未解鎖 binding／書名／私人 R2 key；僅 A 親分享後公開有限摘要
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

- [x] **SEF-API-051** `PublishedContent_WhenHiddenTrackRequested_NeverExposesRawManifest`（高）
  - **來源**：`SEF-V2-GAP-03`；`SEF-BDD-094／SEF-BDD-107`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：I 嘗試由公開 R2、cache 與內容 URL 取得 A 私人分支與 R2 物件
  - **預期斷言**：禁止未授權的 raw private Manifest／隱藏資料；僅 actor-scoped 精簡投影可讀
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

- [x] **SEF-API-052** `StoryEvent_WhenInvalidParamsOrVersion_RejectsWithoutReceipt`（高）
  - **來源**：`SEF-V2-GAP-05`；`SEF-BDD-096／SEF-BDD-099／SEF-BDD-103`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：HTTP/WS 帶未知 actionId/slot、額外參數、過期 Track/Shared/Event revision
  - **預期斷言**：回正確拒絕／409，不寫 D1 receipt/eventSeq/WorldState，不廣播成功 WS
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

- [x] **SEF-API-053** `NpcDialogue_WhenActorSpoofed_NeverProducesPartnerMessage`（高）
  - **來源**：`SEF-V2-GAP-08`；`SEF-BDD-098／SEF-BDD-113／SEF-BDD-114`；**建議測試入口**：`backend/tests/DatingHigh.Api.Tests/SceneEventFrameworkEndpointTests.cs`
  - **前置／操作**：Client 在 NPC 對話或意向提交時造假另一人 accountId/chat author
  - **預期斷言**：只記合法 caller 的操作，NPC 台詞不能變成另一真人 message.committed
  - **證據要求**：HTTP／WS 正式授權與事件結果，不以 mock 單獨代簽

## ET

- [x] **SEF-ET-003** `UI_OfferCount_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：雙人本地 Web 場景：有效 Round 有一類別或二至三類別
  - **驗證**：操作「玩家進入劇情頁」後畫面應符合「唯一類別直接進場，多類別才顯示投票卡」及「投票前不顯示對方選中的類別」

- [x] **SEF-ET-004** `UI_OfferCount_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；情境：畫面依類別候選數切換
  - **前置／操作**：真 Android + 另一個獨立登入玩家：有效 Round 有一類別或二至三類別
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「唯一類別直接進場，多類別才顯示投票卡」

- [x] **SEF-ET-005** `UI_VoteWaiting_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：雙人本地 Web 場景：A 已投票且 B 暫時離線
  - **驗證**：操作「A 切換聊天再返回劇情入口」後畫面應符合「保留本人票並顯示正在等待另一位玩家」及「沒有假選票、倒數替他選或超時決議」

- [x] **SEF-ET-006** `UI_VoteWaiting_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-054／SEF-AC-001`；情境：等待對方投票可聊天並回來
  - **前置／操作**：真 Android + 另一個獨立登入玩家：A 已投票且 B 暫時離線
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「保留本人票並顯示正在等待另一位玩家」

- [x] **SEF-ET-007** `UI_HiddenEvent_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：雙人本地 Web 場景：未達書店隱藏書籤事件條件
  - **驗證**：操作「玩家打開場景與事件列表」後畫面應符合「不顯示隱藏事件標題與答案」及「符合條件並真正觸發才展示」

- [x] **SEF-ET-008** `UI_HiddenEvent_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-055／SEF-AC-005`；情境：隱藏事件在符合條件前不暴露
  - **前置／操作**：真 Android + 另一個獨立登入玩家：未達書店隱藏書籤事件條件
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「不顯示隱藏事件標題與答案」

- [x] **SEF-ET-009** `UI_InteractionFeedback_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：雙人本地 Web 場景：雙人合作互動需要兩人各自選擇
  - **驗證**：操作「A 提交自己的選項」後畫面應符合「畫面顯示送出中、成功後等待對方」及「不能代替 B 作答或將 ACK 當成對方已讀」

- [x] **SEF-ET-010** `UI_InteractionFeedback_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-056／SEF-AC-006`；情境：事件互動有提交回饋與防重
  - **前置／操作**：真 Android + 另一個獨立登入玩家：雙人合作互動需要兩人各自選擇
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「畫面顯示送出中、成功後等待對方」

- [x] **SEF-ET-011** `UI_ChapterCompleted_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：雙人本地 Web 場景：主線抵達 Ending
  - **驗證**：操作「畫面接收到已提交完成事件」後畫面應符合「顯示本次劇情完成但聊天室仍可使用」及「未完成事件不可再操作也無完成劇情按鈕」

- [x] **SEF-ET-012** `UI_ChapterCompleted_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；情境：完成時自然收尾並保留聊天
  - **前置／操作**：真 Android + 另一個獨立登入玩家：主線抵達 Ending
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「顯示本次劇情完成但聊天室仍可使用」

- [x] **SEF-ET-013** `UI_NextAgree_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：雙人本地 Web 場景：劇情已完成而只有 A 想再玩
  - **驗證**：操作「A 點擊再次遊玩」後畫面應符合「顯示我已同意、等待另一位玩家」及「B 拒絕或離線時保持聊天與 completed 狀態」

- [x] **SEF-ET-014** `UI_NextAgree_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-058／SEF-AC-008`；情境：再次遊玩按鈕等待雙方同意
  - **前置／操作**：真 Android + 另一個獨立登入玩家：劇情已完成而只有 A 想再玩
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「顯示我已同意、等待另一位玩家」

- [x] **SEF-ET-015** `UI_NextDuplicateClick_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：雙人本地 Web 場景：A 已按同意且網路回應尚未到達
  - **驗證**：操作「A 再次點擊同意」後畫面應符合「控制項維持提交中而不產生第二個 requestId」及「收到 receipt 後恢復正確狀態」

- [x] **SEF-ET-016** `UI_NextDuplicateClick_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-059／SEF-AC-008`；情境：再次遊玩重複點擊不產生多場
  - **前置／操作**：真 Android + 另一個獨立登入玩家：A 已按同意且網路回應尚未到達
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「控制項維持提交中而不產生第二個 requestId」

- [x] **SEF-ET-017** `UI_OfflineRecovery_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：雙人本地 Web 場景：玩家完成投票後斷線且 Server 已提交但 ACK 失聯
  - **驗證**：操作「重新連線並取得快照及游標增量」後畫面應符合「依 D1 恢復原場景、主線與事件結果」及「不重抽、不重送不同 requestId」

- [x] **SEF-ET-018** `UI_OfflineRecovery_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-060／SEF-AC-009`；情境：斷線恢復顯示權威狀態
  - **前置／操作**：真 Android + 另一個獨立登入玩家：玩家完成投票後斷線且 Server 已提交但 ACK 失聯
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「依 D1 恢復原場景、主線與事件結果」

- [x] **SEF-ET-019** `UI_ContentFailure_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：雙人本地 Web 場景：已抽選場景的 R2 Manifest 暫時無法讀取
  - **驗證**：操作「玩家重新開啟劇情頁」後畫面應符合「顯示無法載入劇情內容且提供重試載入」及「不顯示假故事或換另一個場景」

- [x] **SEF-ET-020** `UI_ContentFailure_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-061／SEF-AC-010`；情境：內容壞檔提示可重試但不重抽
  - **前置／操作**：真 Android + 另一個獨立登入玩家：已抽選場景的 R2 Manifest 暫時無法讀取
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「顯示無法載入劇情內容且提供重試載入」

- [x] **SEF-ET-021** `UI_BothPlatformsGate_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：雙人本地 Web 場景：A 用 Web、B 用 Android 遊玩首場雨聲書店
  - **驗證**：操作「兩端完成書籤與雙人合作並進入收尾」後畫面應符合「兩端依真 D1 顯示相同結果與 next 按鈕狀態」及「原 B1 五表情及全身 POV 驗收獨立保留」

- [x] **SEF-ET-022** `UI_BothPlatformsGate_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；情境：Web 與 Android 共用首條驗收
  - **前置／操作**：真 Android + 另一個獨立登入玩家：A 用 Web、B 用 Android 遊玩首場雨聲書店
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「兩端依真 D1 顯示相同結果與 next 按鈕狀態」

- [x] **SEF-ET-023** `UI_EndConfirmation_Web_ReflectsAuthoritativeState`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：雙人本地 Web 場景：劇情已完成且兩人仍在聊天
  - **驗證**：操作「一人點擊結束本輪互動」後畫面應符合「先提示原 pair 永久不再互配並要求確認」及「取消不結束且不影響下一場同意」

- [x] **SEF-ET-024** `UI_EndConfirmation_Android_MatchesWebAndPersistsState`（高）
  - **來源**：`SEF-BDD-063／SEF-AC-009`；情境：結束配對仍需二次確認
  - **前置／操作**：真 Android + 另一個獨立登入玩家：劇情已完成且兩人仍在聊天
  - **驗證**：與 Web 相同的權威場次、回饋、按鈕防重及恢復；「先提示原 pair 永久不再互配並要求確認」

- [x] **SEF-ET-025** `FinishChapter_PartnerPendingInteraction_ShowsCancelled`（高）
  - **來源**：`SEF-BDD-057／SEF-AC-007`；`SEF-GAP-05`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：Web 與另一真人正在等待雙人事件，主線結束時兩端顯示事件已停止，仍可正常聊天，不假造對方結果

- [x] **SEF-ET-026** `LegacyClient_StoryVotePayload_IsRejectedWithoutUnsafeFallback`（高）
  - **來源**：`SEF-BDD-053／SEF-AC-001`；`SEF-GAP-07`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：前端錯誤傳舊 StoryCatalog ID，服務拒絕且 UI 顯示可恢復錯誤，不因此選錯主線

- [x] **SEF-ET-027** `FirstStoryGate_NoApproval_DoesNotPromoteFixturesToReleasedContent`（高）
  - **來源**：`SEF-BDD-062／SEF-AC-011`；`SEF-GAP-08`
  - **前置／操作**：依來源 BDD 建立可玩／不可玩內容、雙真人有效授權與測試 fixture（非正式內容）
  - **驗證**：人工 Gate 證據未簽核時，E2E 只驗首條雨聲書店，不將其他九條測試 fixtures 算成正式內容；此為驗收／內容發布流程檢查，非虛構 App 防擴充功能

- [x] **SEF-ET-028** `ScenePresentationSplit_FullArtWebAndroid`（高）
  - **來源**：`SEF-BDD-067／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：已發佈 Scene/Narrative 對應雨聲書店 Web/Android 背景／前景／鏡位／熱區／音效
  - **驗證**：兩端同畫面構圖，正式免費全身角色未重繪

- [x] **SEF-ET-029** `EventOutcomePresentation_OverlayReverts`（高）
  - **來源**：`SEF-BDD-068／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：真人觸發信件自由事件
  - **驗證**：短暫表情、鏡位、音效在事件完成後還原，主線不無故跳節點

- [x] **SEF-ET-030** `BadEventPresentation_PublishRejected`（高）
  - **來源**：`SEF-BDD-069／SEF-AC-013`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：事件來源有非法表情或相機
  - **驗證**：出版失敗時 Web/Android 保持舊版可玩

- [x] **SEF-ET-031** `HiddenHotspot_PreviewDoesNotCommit`（高）
  - **來源**：`SEF-BDD-070／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：探索書籤前置條件先不滿足後滿足
  - **驗證**：不可見時不漏內容、可見後取消不寫事件

- [x] **SEF-ET-032** `AvatarSwap_DuringNarrativeSafeAtLineEnd`（高）
  - **來源**：`SEF-BDD-071／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：同一 Round 真對方切換已 ready 全身角色
  - **驗證**：五圖全部載入後句尾換角，聊天與劇情 node 不變

- [x] **SEF-ET-033** `AvatarNotReady_ResumeDoesNotGenerate`（高）
  - **來源**：`SEF-BDD-072／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：B1 中斷、尚未 ready 或新五圖之一解碼失敗
  - **驗證**：保留完整舊角色或佔位、沒有新 Gemini 請求或正式採用

- [x] **SEF-ET-034** `EpisodeNewScene_ResetsStageNotChat`（高）
  - **來源**：`SEF-BDD-073／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：第一場與第二場均有 entry 節點
  - **驗證**：新場台詞、鏡頭、Event modal 初始化而 Round 聊天與已採用角色保留

- [x] **SEF-ET-035** `BackgroundFocus_ResumesWithoutSideEffects`（高）
  - **來源**：`SEF-BDD-074／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：Home／AppState 退到背景又回前景
  - **驗證**：微動及聲音符合停止規則，授權快照恢復但不重抽、重送、續產

- [x] **SEF-ET-036** `StaleAvatarRequest_AfterExitRejected`（高）
  - **來源**：`SEF-BDD-075／SEF-AC-014`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：退出 Round 後舊圖片請求晚回
  - **驗證**：不復活私人圖片，不混進下一 Round

- [x] **SEF-ET-037** `CompletedChapter_StillRendersStageAndChat`（高）
  - **來源**：`SEF-BDD-076／SEF-AC-015`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：未完成支線而主線已到結尾
  - **驗證**：兩端顯示已完成劇情與保留聊天室，未完支線不可操作

- [x] **SEF-ET-038** `SceneMotionOff_AssetReuseMeasurements`（高）
  - **來源**：`SEF-BDD-077／SEF-AC-016`；跨 SPEC 影響稽核
  - **操作**：Web＋Android 兩名獨立玩家：關閉場景微動後連續進入可用事件並恢復 App
  - **驗證**：鏡頭、人物、熱區可用，無裝飾動畫，保留實測 jank／記憶體／載入延遲的證據

- [x] **SEF-ET-040** `BothPlatforms_OwnAvatarGateAndReadyResume`：Web／Android 真 UI 以 active Round 直接重入驗阻擋、無角色及聊天室、個人檔案入口；恢復原採用者後回同 Round 繼續遊戲，不重抽。

- [x] **SEF-ET-041** `StoryExperienceWeb_Bdd100_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；兩人完成互動後播放可見演出
  - **必須觀察的實際結果**：鏡頭、物件、兩位真人化身及五表情符合 Cue；缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-042** `StoryExperienceAndroid_Bdd100_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-100／SEF-AC-022；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：S01、S02、S03 的角色素材與合法 Scene anchor 已釘選；兩人完成互動後播放可見演出
  - **必須觀察的實際結果**：鏡頭、物件、兩位真人化身及五表情符合 Cue；缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-043** `StoryExperienceWeb_Bdd101_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：Rain Scene 顯示 AmbientMotion；玩家檢視雨絲和玻璃水痕後關閉微動
  - **必須觀察的實際結果**：畫面先有真正移動且關閉後停止循環；必要 StoryMotion 仍能播放並且有可讀替代狀態。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-044** `StoryExperienceAndroid_Bdd101_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-101／SEF-AC-022；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：Rain Scene 顯示 AmbientMotion；玩家檢視雨絲和玻璃水痕後關閉微動
  - **必須觀察的實際結果**：畫面先有真正移動且關閉後停止循環；必要 StoryMotion 仍能播放並且有可讀替代狀態。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-045** `StoryExperienceWeb_Bdd104_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：雨聲書店 v2 的 I01 和 A01 已釘選；I 先翻濕紙單、A 停在書架
  - **必須觀察的實際結果**：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立；先行者不推進另一方未完成節點。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-046** `StoryExperienceAndroid_Bdd104_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-104／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：雨聲書店 v2 的 I01 和 A01 已釘選；I 先翻濕紙單、A 停在書架
  - **必須觀察的實際結果**：I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立；先行者不推進另一方未完成節點。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-047** `StoryExperienceWeb_Bdd105_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 看濕紙、A 查書袋外標籤；兩人各自 inspect 並讀取 experience
  - **必須觀察的實際結果**：僅本人看到已探索的資訊；未經分享不洩漏對方私有節點或觸發。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-048** `StoryExperienceAndroid_Bdd105_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-105／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 看濕紙、A 查書袋外標籤；兩人各自 inspect 並讀取 experience
  - **必須觀察的實際結果**：僅本人看到已探索的資訊；未經分享不洩漏對方私有節點或觸發。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-049** `StoryExperienceWeb_Bdd106_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **必須觀察的實際結果**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-050** `StoryExperienceAndroid_Bdd106_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-106／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 紙單與 A 袋子已在 counter；I 先按核對、A 離線重連後再按核對
  - **必須觀察的實際結果**：S01 在兩次真實操作後完成並分流 I04／A04；不由店員代另一方核對。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-051** `StoryExperienceWeb_Bdd107_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 看兩本海邊書、A 向店員查出正確書；I 在 A 尚未分享前嘗試領走書
  - **必須觀察的實際結果**：不能完成；A 主動分享後 I 才能選中 book-rain；不把 A 私人店員台詞完整傳給 I。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-052** `StoryExperienceAndroid_Bdd107_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-107／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 看兩本海邊書、A 向店員查出正確書；I 在 A 尚未分享前嘗試領走書
  - **必須觀察的實際結果**：不能完成；A 主動分享後 I 才能選中 book-rain；不把 A 私人店員台詞完整傳給 I。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-053** `StoryExperienceWeb_Bdd108_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I 選到 book-wednesday；I 嘗試放進 counter-slot
  - **必須觀察的實際結果**：提示錯書且 orderStatus 不變；可返回 shelves 重新選擇。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-054** `StoryExperienceAndroid_Bdd108_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-108／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I 選到 book-wednesday；I 嘗試放進 counter-slot
  - **必須觀察的實際結果**：提示錯書且 orderStatus 不變；可返回 shelves 重新選擇。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-055** `StoryExperienceWeb_Bdd109_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：A 知道封套位置且 I 仍在 I05；A 從 window 取出並送到 counter
  - **必須觀察的實際結果**：只保存 A 的進度和 green-sleeve 位置、S02 不觸發；I 仍可完成自己的找書流程。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-056** `StoryExperienceAndroid_Bdd109_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-109／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：A 知道封套位置且 I 仍在 I05；A 從 window 取出並送到 counter
  - **必須觀察的實際結果**：只保存 A 的進度和 green-sleeve 位置、S02 不觸發；I 仍可完成自己的找書流程。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-057** `StoryExperienceWeb_Bdd110_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **必須觀察的實際結果**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-058** `StoryExperienceAndroid_Bdd110_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-110／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：正確書及封套已抵達 counter；S02 風起一次、I hold、A 下線後恢復並取回標籤
  - **必須觀察的實際結果**：標籤只移動一次且 I 的真人提交保留；A 取回並放好才完成 Shared。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-059** `StoryExperienceWeb_Bdd111_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **必須觀察的實際結果**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-060** `StoryExperienceAndroid_Bdd111_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-111／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：order-tag-27 位於窗台；A 以舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  - **必須觀察的實際結果**：僅 A 一份合法 D1 CAS 成功，其餘舊版次衝突／越權請求被拒；不產生第二張標籤或重播 S02，並顯示權威物件位置。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-061** `StoryExperienceWeb_Bdd112_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：S02 completed，I 在 I08；A 到 counter 開始 verify-order
  - **必須觀察的實際結果**：僅 A 開啟 A08，I 保持 I08；A 真人確認後才啟動 S03。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-062** `StoryExperienceAndroid_Bdd112_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-112／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：S02 completed，I 在 I08；A 到 counter 開始 verify-order
  - **必須觀察的實際結果**：僅 A 開啟 A08，I 保持 I08；A 真人確認後才啟動 S03。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-063** `StoryExperienceWeb_Bdd113_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：S03 已解鎖且兩人可選最終意向；I 親按 look_back、A 親按 rest_chat
  - **必須觀察的實際結果**：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用；任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-064** `StoryExperienceAndroid_Bdd113_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-113／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：S03 已解鎖且兩人可選最終意向；I 親按 look_back、A 親按 rest_chat
  - **必須觀察的實際結果**：E02 自然 completed、未完 Side 同交易封存、Round active 且聊天可用；任一方 rest_chat 均不宣稱雙方同意回書架；不解鎖新探索。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-065** `StoryExperienceWeb_Bdd114_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：雙人必經事實與 S03 都有效；I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）
  - **必須觀察的實際結果**：E01 只演短書架回望後自然 completed、未完 Side 同交易封存、Round active／聊天保留；暖光演出不能解鎖新物件／Side 或多一個結束按鈕；跳動畫／重連仍維持完成結果。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-066** `StoryExperienceAndroid_Bdd114_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-114／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：雙人必經事實與 S03 都有效；I 與 A 各親按 look_back（再看一眼書架，替今天畫個句點）
  - **必須觀察的實際結果**：E01 只演短書架回望後自然 completed、未完 Side 同交易封存、Round active／聊天保留；暖光演出不能解鎖新物件／Side 或多一個結束按鈕；跳動畫／重連仍維持完成結果。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-067** `StoryExperienceWeb_Bdd115_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **必須觀察的實際結果**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-068** `StoryExperienceAndroid_Bdd115_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-115／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：I/A 不同步且有已提交 requestId；重送原 payload、變造 payload、重連及退出
  - **必須觀察的實際結果**：冪等返回原 receipt、變造拒絕、退出後拒寫；不重抽主線或重新呼叫五表情。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-069** `StoryExperienceWeb_Bdd116_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`tests/e2e/web/scene-event-framework.spec.ts`
  - **Given／When**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **必須觀察的實際結果**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作。Web 需驗 Canvas/DOM 層實際物件、角色站位、雨景位移及主動點擊，不以 API-only 判斷 UI 通過。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-070** `StoryExperienceAndroid_Bdd116_WithRealDualActors_PresentsExpectedScene`（高）
  - **來源**：SEF-BDD-116／SEF-AC-023；**建議測試檔**：`tests/e2e/android/scene-event-framework.mjs`
  - **Given／When**：玩家已關閉 AmbientMotion 且 S02 可用；兩人完成按住書袋和取回標籤
  - **必須觀察的實際結果**：雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚；可以略過表演不能略過操作。模擬器需驗實際畫面／點擊、返回／前景恢復及 UiAutomator，不以 Web 測試代簽。 Stage／R2／本地 D1 需是可重建真流程，RB-14 並需使用者人工 Gate B。

- [x] **SEF-ET-073** `StoryStage_WhenNpcAndPartnerSpeak_DisplaysCorrectAttribution`（高）
  - **來源**：`SEF-V2-GAP-08`；`SEF-BDD-098／SEF-BDD-113`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：店員／旁白／兩名真人在 Web／Android 同場，兩人各有私有選項
  - **預期斷言**：畫面標明 NPC，不替另一真人發聊天或選意向；每位真人需自行按下操作
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [x] **SEF-ET-074** `AmbientMotionWeb_WhenDisabled_PreservesStoryMotion`（高）
  - **來源**：`SEF-V2-GAP-09`；`SEF-BDD-100／SEF-BDD-116`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Web 關閉 AmbientMotion，S02 仍可觸發
  - **預期斷言**：雨滴循環停止但必要標籤飛出／取回可看見或安全略過，保留真實互動延遲記錄
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [x] **SEF-ET-075** `AmbientMotionAndroid_WhenResumed_DoesNotReplayStoryCue`（高）
  - **來源**：`SEF-V2-GAP-09`；`SEF-BDD-101／SEF-BDD-102／SEF-BDD-116`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Android S02 完成後退背景再恢復並切換化身
  - **預期斷言**：不重移動標籤、重播音效或 Gemini 產圖；以快照恢復，留 jank／記憶體／延遲證據
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [x] **SEF-ET-076** `RainBookshopWeb_WhenBothLookBack_CompletesWithoutEpilogue`（高）
  - **來源**：`SEF-V2-GAP-10`；`SEF-BDD-114／SEF-BDD-117`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Web 兩人各自選 look_back（再看一眼書架，替今天畫個句點）
  - **預期斷言**：Server 收到第二份合法 look_back 即同 D1 交易 completed／封存 Side／保存 receipt；Client 確認成功後只播一次短鏡頭，沒有新熱區／支線／結束按鈕；失敗不先顯示成功，Round 聊天保留
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

- [x] **SEF-ET-077** `RainBookshopAndroid_WhenChoicesDiffer_UsesE02AndKeepsGate`（高）
  - **來源**：`SEF-V2-GAP-10`；`SEF-BDD-113／SEF-BDD-114／SEF-BDD-121`；**建議測試入口**：`tests/e2e/web/scene-event-framework.spec.ts / tests/e2e/android/scene-event-framework.mjs`
  - **前置／操作**：Android/Web 真人分選 look_back／rest_chat，亦驗雙 look_back
  - **預期斷言**：第二份合法意向提交時 Server 同交易選定 Ending／封存未完 Side／保存 receipt；不同意向必 E02、雙 look_back 才 E01；Client 不需再送完成命令，兩者自然收尾且聊天保留；人工 Gate B 未核准不製作其餘九條
  - **證據要求**：真 Web／Android 畫面／操作／效能證據；仍須本人人工 Gate B

## 規劃交接紀錄

已結案；不再作開發入口。V4 按獨立 SPEC 重新建立必要 BDD／TDD。
