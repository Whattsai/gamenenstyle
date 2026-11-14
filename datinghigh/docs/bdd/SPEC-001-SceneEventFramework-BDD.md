# SPEC-001-SceneEventFramework — BDD 場景規格

> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)（AC-005-04～15）  
> **已確認 SDD**：[SPEC-001-SceneEventFramework](../specs/SPEC-001-SceneEventFramework.md)，SEF-RQ-01～03=A  
> **生成日期**：2026-11-12；**規劃狀態**：Ready for well-done（僅已完成 SDD／RiskAudit／BDD/TDD 文件規劃），**79 個 BDD 尚未全數結案**；不得和既有 StoryDialogueAndExit 的驗收結果混算。

## Feature 描述

**Feature**：配對雙人從共同類別隨機進入場景與主線、觸發可重用事件、自然收尾與雙方同意再次遊玩。

**目標**：場景、主線與事件獨立而可組合；同一對玩家的未玩內容權重 3:1；主線完成後封存舊支線、保留配對及聊天；維持真 D1／WebSocket 授權與一致性。MVP-002 AI 動態主線及 Housekeeping 明確排除。

## 前端 UX 實作進度

```text
📦 SceneEventFramework
├─ 目前階段：依使用者要求暫停；首條主要技術流程及本人化身入口已驗證
├─ BDD：1/79 完整覆核通過（1.3%）
├─ 新增視覺需求：需延用 StoryDialogueAndExit 原 Gate B
└─ 首條雨聲書店：必須由使用者試玩調校確認後才開發其餘九條
```

實作子項、回歸與未完事項見 [驗證紀錄](../verification/SPEC-001-SceneEventFramework-Verification.md)。SEF-BDD-079 已完整覆核通過；其餘 Scenario 未完成逐項結案，不以既有劇情回歸數代替。

## Background（共同前提）

```gherkin
Feature: 場景與事件框架（SceneEventFramework）
  Background:
    Given A 和 B 為兩個真正登入的玩家，且 Round 處於 active
    And 雙方通過 game_active_round_claims 檢查
    And 所有可玩內容均來自已發布且已驗證的 immutable Manifest
    And D1 game_round_events 是事件序號與 receipt 權威
    And 每個 StorySession 的 scene、narrative、event 版本在選中後固定
```

## Happy Path — 正常流程

### SEF-BDD-001：唯一可玩類別直接進場

- [ ] **Scenario: 唯一可玩類別直接進場**
  - **來源**：`SEF-AC-001`；**標籤**：@happy-path @normal；**測試鍵**：`Recommend_OneCategory`

```gherkin
@happy-path @normal
Scenario: 唯一可玩類別直接進場
  Given 雙方配對成功且只有浪漫類別具有可玩主線
  When 受邀方接受邀請
  Then 伺服器直接選中浪漫類別並抽場景主線
  And 沒有偽造投票，也沒有出現選類別畫面
```

### SEF-BDD-002：兩類別由真人各投一票

- [ ] **Scenario: 兩類別由真人各投一票**
  - **來源**：`SEF-AC-001`；**標籤**：@happy-path @normal；**測試鍵**：`Recommend_TwoCategories`

```gherkin
@happy-path @normal
Scenario: 兩類別由真人各投一票
  Given 浪漫與懸疑兩類別皆有可玩主線
  When A 與 B 各提交有效類別票
  Then 兩票決議後只形成一筆最新場次
  And 決議前不顯示對方所選類別
```

### SEF-BDD-003：三個以上類別依興趣取前三

- [ ] **Scenario: 三個以上類別依興趣取前三**
  - **來源**：`SEF-AC-001`；**標籤**：@happy-path @normal；**測試鍵**：`Recommend_ThreePlusCategories`

```gherkin
@happy-path @normal
Scenario: 三個以上類別依興趣取前三
  Given 四類別皆有可玩主線且雙方興趣不同
  When 配對成立並取得候選
  Then 按雙方均衡推薦排序凍結前三個 Category ID
  And 候選順序兩端一致且不因重新整理改變
```

### SEF-BDD-008：同場景可屬多個類別

- [ ] **Scenario: 同場景可屬多個類別**
  - **來源**：`SEF-AC-002`；**標籤**：@happy-path @normal；**測試鍵**：`Scene_MultiCategory`

```gherkin
@happy-path @normal
Scenario: 同場景可屬多個類別
  Given 雨聲書店同時對應浪漫與懸疑
  When 兩個類別分別被選中
  Then 都能找到同一已發布場景且引用正確版本
  And 類別不是 Profile 的 reading 興趣欄位
```

### SEF-BDD-009：同場景可有多條完整主線

- [ ] **Scenario: 同場景可有多條完整主線**
  - **來源**：`SEF-AC-002`；**標籤**：@happy-path @normal；**測試鍵**：`Narrative_MultiPerScene`

```gherkin
@happy-path @normal
Scenario: 同場景可有多條完整主線
  Given 雨聲書店綁定尋書與夜雨約定兩條主線
  When 查詢同場景合格主線
  Then 兩條主線均可在同一場景被選中
  And 不同主線的 entry 與內容版本互不混淆
```

### SEF-BDD-011：新場景抽選權重為三比一

- [ ] **Scenario: 新場景抽選權重為三比一**
  - **來源**：`SEF-AC-003`；**標籤**：@happy-path @normal；**測試鍵**：`Scene_WeightThreeToOne`

```gherkin
@happy-path @normal
Scenario: 新場景抽選權重為三比一
  Given 一個未玩場景與一個已玩場景均合格
  When 伺服器在可注入 RNG 下重複抽選
  Then 未玩過場景的選中權重是已玩過的三倍
  And 並非硬性排除已玩場景
```

### SEF-BDD-014：無序主線優先未玩三比一

- [ ] **Scenario: 無序主線優先未玩三比一**
  - **來源**：`SEF-AC-003`；**標籤**：@happy-path @normal；**測試鍵**：`Narrative_UnorderedWeighted`

```gherkin
@happy-path @normal
Scenario: 無序主線優先未玩三比一
  Given 同一場景存在已玩與未玩無序主線
  When 抽選主線
  Then 未玩者取得較高但非唯一機率
  And 相同隨機種子可重現測試結果
```

### SEF-BDD-015：有序主線不可跳章

- [ ] **Scenario: 有序主線不可跳章**
  - **來源**：`SEF-AC-003`；**標籤**：@happy-path @normal；**測試鍵**：`Narrative_OrderedUnlock`

```gherkin
@happy-path @normal
Scenario: 有序主線不可跳章
  Given 第二章需要第一章完成且第三章未解鎖
  When 抽選有序主線
  Then 只能從目前符合前置條件的章節選擇
  And 不能因權重偏好直接選第三章
```

### SEF-BDD-019：線性主線一個結局即可發布

- [ ] **Scenario: 線性主線一個結局即可發布**
  - **來源**：`SEF-AC-004`；**標籤**：@happy-path @critical；**測試鍵**：`Graph_OneEnding`

```gherkin
@happy-path @critical
Scenario: 線性主線一個結局即可發布
  Given 線性主線只有一個可達 Ending 且有完整開場推進
  When 發布工具驗證並進行遊玩
  Then 內容合法且能抵達唯一結尾
  And 不再要求至少兩個 Ending 或固定四節點
```

### SEF-BDD-020：分支後可合流共同主線

- [ ] **Scenario: 分支後可合流共同主線**
  - **來源**：`SEF-AC-004`；**標籤**：@happy-path @normal；**測試鍵**：`Graph_BranchRejoin`

```gherkin
@happy-path @normal
Scenario: 分支後可合流共同主線
  Given 兩個不同選項通往不同線索後合流
  When 玩家選擇其中一項
  Then 只有所選分支的事件結果寫入進度
  And 其餘共用主線可正常繼續
```

### SEF-BDD-023：同一事件在不同主線有不同用途

- [ ] **Scenario: 同一事件在不同主線有不同用途**
  - **來源**：`SEF-AC-005`；**標籤**：@happy-path @normal；**測試鍵**：`Event_RoleByBinding`

```gherkin
@happy-path @normal
Scenario: 同一事件在不同主線有不同用途
  Given 書籤事件被兩條主線引用
  When 內容發布並啟動兩條主線
  Then 第一條定義為支線，第二條可定義為主線
  And EventDefinition ID 與玩法版本保持相同
```

### SEF-BDD-024：隱藏與隨機與前置條件可同時存在

- [ ] **Scenario: 隱藏與隨機與前置條件可同時存在**
  - **來源**：`SEF-AC-005`；**標籤**：@happy-path @normal；**測試鍵**：`Event_HiddenRandomConditional`

```gherkin
@happy-path @normal
Scenario: 隱藏與隨機與前置條件可同時存在
  Given 事件有 visibility=hidden、weighted_random 和完成找線索前置
  When 符合條件後抽中此事件
  Then 系統只在成功觸發時向合格玩家揭露
  And 三個維度彼此不互斥
```

### SEF-BDD-025：主線場景全域事件池可共存

- [ ] **Scenario: 主線場景全域事件池可共存**
  - **來源**：`SEF-AC-005`；**標籤**：@happy-path @normal；**測試鍵**：`Event_ThreeSourcePools`

```gherkin
@happy-path @normal
Scenario: 主線場景全域事件池可共存
  Given 書店存在主線綁定、場景綁定與相容全域綁定
  When 伺服器彙整候選事件
  Then 三來源依限定 Binding ID 合併並過濾相容性
  And 主線必要事件不被全域自由事件搶占
```

### SEF-BDD-028：事件僅在本次遊玩不重複

- [ ] **Scenario: 事件僅在本次遊玩不重複**
  - **來源**：`SEF-AC-006`；**標籤**：@happy-path @normal；**測試鍵**：`Event_PlaythroughScope`

```gherkin
@happy-path @normal
Scenario: 事件僅在本次遊玩不重複
  Given 同一 Binding 已於 episode 1 完成且 repeatScope=playthrough
  When 雙方同意開始 episode 2 並符合觸發條件
  Then episode 2 可重新觸發這個事件
  And episode 1 仍無法重複建立相同 Binding instance
```

### SEF-BDD-029：整輪配對範圍限制事件重複

- [ ] **Scenario: 整輪配對範圍限制事件重複**
  - **來源**：`SEF-AC-006`；**標籤**：@happy-path @normal；**測試鍵**：`Event_RoundScope`

```gherkin
@happy-path @normal
Scenario: 整輪配對範圍限制事件重複
  Given 事件在 episode 1 完成且 repeatScope=round
  When 同一 Round 的 episode 2 再符合觸發
  Then 該事件不會再次觸發
  And 更換配對組合可以在新的 Round 重新體驗
```

### SEF-BDD-031：事件結果能影響後續劇情

- [ ] **Scenario: 事件結果能影響後續劇情**
  - **來源**：`SEF-AC-006`；**標籤**：@happy-path @normal；**測試鍵**：`Event_OutcomeChangesNarrative`

```gherkin
@happy-path @normal
Scenario: 事件結果能影響後續劇情
  Given 隱藏信件事件的結果旗標已合法提交
  When 主線到達會檢查結果的節點
  Then 依旗標決定後續可用的分支或回應
  And 未完成事件不能偽造結果
```

### SEF-BDD-034：抵達主線收尾節點自然完成

- [ ] **Scenario: 抵達主線收尾節點自然完成**
  - **來源**：`SEF-AC-007`；**標籤**：@happy-path @normal；**測試鍵**：`Chapter_AutoComplete`

```gherkin
@happy-path @normal
Scenario: 抵達主線收尾節點自然完成
  Given 主線與必要事件均已滿足 Ending 條件
  When 真人提交到 Ending 的最後操作
  Then 該 StorySession 同筆交易更新為 completed
  And 不顯示額外完成按鈕也不把 Round ended
```

### SEF-BDD-038：雙方同意才開始下一場

- [ ] **Scenario: 雙方同意才開始下一場**
  - **來源**：`SEF-AC-008`；**標籤**：@happy-path @critical；**測試鍵**：`Next_BothAgree`

```gherkin
@happy-path @critical
Scenario: 雙方同意才開始下一場
  Given episode 1 已 completed 且 Round active
  When A 與 B 各自提交同意
  Then 系統恰好建立 episode 2 的候選或直接進場
  And 舊 episode 1 保持 completed 且聊天不斷
```

### SEF-BDD-046：更新內容不影響進行中的劇情

- [ ] **Scenario: 更新內容不影響進行中的劇情**
  - **來源**：`SEF-AC-010`；**標籤**：@happy-path @normal；**測試鍵**：`Content_ImmutablePinned`

```gherkin
@happy-path @normal
Scenario: 更新內容不影響進行中的劇情
  Given 玩家使用 v1 的 R2 bundle，發布者已發布 v2
  When 玩家重連並繼續本場
  Then 仍取回 v1 及其全部依賴的 Scene/Event 版本
  And 新場次才可採用 v2
```

### SEF-BDD-049：首條雨聲書店先通過人工 Gate

- [ ] **Scenario: 首條雨聲書店先通過人工 Gate**
  - **來源**：`SEF-AC-011`；**標籤**：@happy-path @critical；**測試鍵**：`Gate_FirstStoryOnly`

```gherkin
@happy-path @critical
Scenario: 首條雨聲書店先通過人工 Gate
  Given 僅有已完整設計的雨聲書店初始主線
  When 執行首條 Web/Android 真雙人完整試玩
  Then 保留書籤、合作、收尾、聊天與重玩全流程證據
  And 使用者未核准前其他九條仍不得開發
```

### SEF-BDD-051：MVP-001 不生成 AI 動態主線

- [ ] **Scenario: MVP-001 不生成 AI 動態主線**
  - **來源**：`SEF-AC-012`；**標籤**：@happy-path @normal；**測試鍵**：`Boundary_MVP002NoAIGeneration`

```gherkin
@happy-path @normal
Scenario: MVP-001 不生成 AI 動態主線
  Given 目前運行劇情模式且 R2 僅發布人工主線
  When 玩家自由輸入文字與故事互動
  Then 文字按現有聊天處理而非觸發 AI 動態造主線
  And 沉浸模式獨立留待 MVP-002
```

## Alternative Path — 替代流程

### SEF-BDD-004：兩人選不同類別由原邀請者決定

- [ ] **Scenario: 兩人選不同類別由原邀請者決定**
  - **來源**：`SEF-AC-001`；**標籤**：@alternative-path @normal；**測試鍵**：`Vote_InviterTieBreak`

```gherkin
@alternative-path @normal
Scenario: 兩人選不同類別由原邀請者決定
  Given A 是原邀請者且兩位選擇不同
  When 雙方最後有效票已提交
  Then 勝出類別等於 A 最後一次有效選擇
  And 不以先登入或第二位提交者的選擇決勝
```

### SEF-BDD-005：結算前允許改票

- [ ] **Scenario: 結算前允許改票**
  - **來源**：`SEF-AC-001`；**標籤**：@alternative-path @normal；**測試鍵**：`Vote_ModifyBeforeSettlement`

```gherkin
@alternative-path @normal
Scenario: 結算前允許改票
  Given A 已投第一票且 B 尚未投
  When A 改票後 B 才提交
  Then 系統採 A 最後有效票結算
  And 原票仍在事件序列但不影響結果
```

### SEF-BDD-013：換配對對象重新計算去重

- [ ] **Scenario: 換配對對象重新計算去重**
  - **來源**：`SEF-AC-003`；**標籤**：@alternative-path @normal；**測試鍵**：`Pair_NewPartnerReset`

```gherkin
@alternative-path @normal
Scenario: 換配對對象重新計算去重
  Given A 與 B 完成書店，A 與 C 是不同有效配對
  When 系統替 A 與 C 抽場景主線
  Then A 與 B 的歷史不降低 A 與 C 的書店權重
  And 不跨配對讀取另一人的私人事件
```

### SEF-BDD-016：有序與無序主線混合隨機

- [ ] **Scenario: 有序與無序主線混合隨機**
  - **來源**：`SEF-AC-003`；**標籤**：@alternative-path @normal；**測試鍵**：`Narrative_MixedEligible`

```gherkin
@alternative-path @normal
Scenario: 有序與無序主線混合隨機
  Given 第二章已解鎖且同場景另有獨立主線
  When 系統計算合格候選後抽選
  Then 第二章與獨立主線都能參與抽選
  And 沒有強制第二章必須先玩
```

### SEF-BDD-021：不同真人選擇得到不同收尾

- [ ] **Scenario: 不同真人選擇得到不同收尾**
  - **來源**：`SEF-AC-004`；**標籤**：@alternative-path @critical；**測試鍵**：`Graph_MultipleEndings`

```gherkin
@alternative-path @critical
Scenario: 不同真人選擇得到不同收尾
  Given 雨聲書店保留原合作互動的兩種結果
  When 兩位真人提交相同或不同答案
  Then 系統分別抵達對應的已發布 Ending
  And 不替離線另一方自動選答案
```

### SEF-BDD-035：未做支線不阻塞主線完成

- [ ] **Scenario: 未做支線不阻塞主線完成**
  - **來源**：`SEF-AC-007`；**標籤**：@alternative-path @normal；**測試鍵**：`Chapter_OptionalNotRequired`

```gherkin
@alternative-path @normal
Scenario: 未做支線不阻塞主線完成
  Given 主線走到 Ending 但支線及隱藏事件仍未玩
  When 最後主線節點提交成功
  Then StorySession completed 並封存未完成事件
  And 聊天仍能正常使用
```

### SEF-BDD-039：只有一人同意不能偷偷開下一場

- [ ] **Scenario: 只有一人同意不能偷偷開下一場**
  - **來源**：`SEF-AC-008`；**標籤**：@alternative-path @critical；**測試鍵**：`Next_OneOnly`

```gherkin
@alternative-path @critical
Scenario: 只有一人同意不能偷偷開下一場
  Given episode 1 已 completed
  When 只有 A 選擇再次遊玩
  Then 只記錄 A 已同意等待 B
  And 仍維持 completed 頁面與聊天
```

### SEF-BDD-040：同意可以在結算前撤回

- [ ] **Scenario: 同意可以在結算前撤回**
  - **來源**：`SEF-AC-008`；**標籤**：@alternative-path @critical；**測試鍵**：`Next_Withdraw`

```gherkin
@alternative-path @critical
Scenario: 同意可以在結算前撤回
  Given A 已同意且 B 尚未提交
  When A 撤回同意
  Then 雙方同意條件不成立且不建立下一場
  And 只有最後有效同意才計算
```

## Boundary Conditions — 邊界條件

### SEF-BDD-012：場景都已玩過仍可再抽

- [ ] **Scenario: 場景都已玩過仍可再抽**
  - **來源**：`SEF-AC-003`；**標籤**：@edge-case @critical；**測試鍵**：`Scene_AllPlayedFallback`

```gherkin
@edge-case @critical
Scenario: 場景都已玩過仍可再抽
  Given 同一對玩家已完成該類別全部場景
  When 雙方開始下一場
  Then 系統仍可從合格場景抽選
  And 不因已全部體驗而無限等待
```

### SEF-BDD-017：合格主線均玩過仍可重玩

- [ ] **Scenario: 合格主線均玩過仍可重玩**
  - **來源**：`SEF-AC-003`；**標籤**：@edge-case @critical；**測試鍵**：`Narrative_AllCompletedFallback`

```gherkin
@edge-case @critical
Scenario: 合格主線均玩過仍可重玩
  Given 某場景所有可選主線已完成
  When 雙方開始新的場次
  Then 系統仍能依規則抽中已玩主線
  And 有序章節的前置條件仍然生效
```

### SEF-BDD-030：相同事件不同來源依語意去重

- [ ] **Scenario: 相同事件不同來源依語意去重**
  - **來源**：`SEF-AC-006`；**標籤**：@edge-case @critical；**測試鍵**：`Event_RepeatGroup`

```gherkin
@edge-case @critical
Scenario: 相同事件不同來源依語意去重
  Given Scene 與 Global 都提供同一 repeatGroup 的事件
  When 伺服器同時發現兩個合格 Binding
  Then 只建立一個語意事件執行實例
  And 不重複扣次數或重複通知
```

### SEF-BDD-033：雙端同時完成同一事件只提交一次

- [ ] **Scenario: 雙端同時完成同一事件只提交一次**
  - **來源**：`SEF-AC-006`；**標籤**：@edge-case @critical；**測試鍵**：`Event_ConcurrentSubmit`

```gherkin
@edge-case @critical
Scenario: 雙端同時完成同一事件只提交一次
  Given 兩個裝置以相同版本提交單次事件
  When D1 交易並發執行
  Then 只有一筆完成狀態與一次完成效果
  And 舊 revision 或不同 payload 重播回 409
```

### SEF-BDD-037：完成與結束整輪競態不殘留半場

- [ ] **Scenario: 完成與結束整輪競態不殘留半場**
  - **來源**：`SEF-AC-007`；**標籤**：@edge-case @critical；**測試鍵**：`Chapter_EndRace`

```gherkin
@edge-case @critical
Scenario: 完成與結束整輪競態不殘留半場
  Given 最後主線提交和任一方確認退出同時發生
  When D1 依交易順序處理兩個操作
  Then 狀態符合原子序列且 Round ended 後禁止寫入
  And 沒有幽靈事件或雙重結算
```

### SEF-BDD-041：雙方同時同意恰好產生一場

- [ ] **Scenario: 雙方同時同意恰好產生一場**
  - **來源**：`SEF-AC-008`；**標籤**：@edge-case @critical；**測試鍵**：`Next_DoubleAgreeRace`

```gherkin
@edge-case @critical
Scenario: 雙方同時同意恰好產生一場
  Given 兩個登入帳號同時提交且網路可能重送
  When D1 競態重試及補漏
  Then 只存在一個 episode 2
  And 首場候選 JSON 與其他場次票不相互覆寫
```

### SEF-BDD-043：全輪事件序號與冪等保存

- [ ] **Scenario: 全輪事件序號與冪等保存**
  - **來源**：`SEF-AC-009`；**標籤**：@edge-case @critical；**測試鍵**：`Sequence_Monotonic`

```gherkin
@edge-case @critical
Scenario: 全輪事件序號與冪等保存
  Given Room DO 訊息同時到達且某次廣播失敗
  When D1 完成原子提交後客戶端補漏
  Then 事件 sequence 單調且同 requestId 回原 receipt
  And 不能用新的 requestId 自動補發未知結果
```

### SEF-BDD-045：重連與刷新不能重抽場景主線

- [ ] **Scenario: 重連與刷新不能重抽場景主線**
  - **來源**：`SEF-AC-009`；**標籤**：@edge-case @critical；**測試鍵**：`Recovery_ReconnectNoReroll`

```gherkin
@edge-case @critical
Scenario: 重連與刷新不能重抽場景主線
  Given 此場已釘選場景與主線且 DO 斷線
  When Web 或 Android 重啟並重建連線
  Then 以同一固定 ID 與 revision 恢復
  And 不更動場景、票、事件結果與版本
```

### SEF-BDD-052：劇情模式單次只走一個場景

- [ ] **Scenario: 劇情模式單次只走一個場景**
  - **來源**：`SEF-AC-012`；**標籤**：@edge-case @critical；**測試鍵**：`Boundary_SingleSceneVisit`

```gherkin
@edge-case @critical
Scenario: 劇情模式單次只走一個場景
  Given 同一 StorySession 已有一個 SceneVisit
  When Client 要求直接換第二場景
  Then 系統拒絕這次遊玩跨場景
  And 資料模型仍可供未來沉浸模式多場景擴充
```

## Error Handling — 錯誤處理

### SEF-BDD-006：沒有完整內容不建立空遊戲

- [ ] **Scenario: 沒有完整內容不建立空遊戲**
  - **來源**：`SEF-AC-001`；**標籤**：@error-handling @critical；**測試鍵**：`Recommend_NoPlayableCategory`

```gherkin
@error-handling @critical
Scenario: 沒有完整內容不建立空遊戲
  Given 已發布類別無任何可玩主線
  When 玩家接受配對邀請
  Then 系統返回 NO_PLAYABLE_STORY 並保持邀請與配對資料一致
  And 沒有新增 game_rounds 或假測試故事
```

### SEF-BDD-007：無效類別票和未決議投票隱私

- [ ] **Scenario: 無效類別票和未決議投票隱私**
  - **來源**：`SEF-AC-001`；**標籤**：@error-handling @critical；**測試鍵**：`Vote_InvalidOrLeaked`

```gherkin
@error-handling @critical
Scenario: 無效類別票和未決議投票隱私
  Given 兩位已取得固定候選而對方尚未投票
  When 第三人提交票或讀取對方原始票
  Then 服務拒絕越權並只提供 partnerHasVoted 狀態
  And 不得洩漏私有興趣及未決議 categoryId
```

### SEF-BDD-010：無效類別或場景關聯拒絕發布

- [ ] **Scenario: 無效類別或場景關聯拒絕發布**
  - **來源**：`SEF-AC-002`；**標籤**：@error-handling @critical；**測試鍵**：`Scene_InvalidRelation`

```gherkin
@error-handling @critical
Scenario: 無效類別或場景關聯拒絕發布
  Given 關聯指向不存在或 retired 的場景版本
  When 內容發布工具驗證
  Then 拒絕發布且原已發布索引不受影響
  And 不產生沒有可玩主線的候選類別
```

### SEF-BDD-018：客戶端無法指定尚未解鎖主線

- [ ] **Scenario: 客戶端無法指定尚未解鎖主線**
  - **來源**：`SEF-AC-003`；**標籤**：@error-handling @critical；**測試鍵**：`Narrative_PrerequisiteForgery`

```gherkin
@error-handling @critical
Scenario: 客戶端無法指定尚未解鎖主線
  Given 第三章尚未解鎖且客戶端知道其 ID
  When 客戶端偽造選中的 narrativeId
  Then 伺服器拒絕並保持現有場次不變
  And 不得寫入非法選中事件
```

### SEF-BDD-022：不可抵達結尾不能發布

- [ ] **Scenario: 不可抵達結尾不能發布**
  - **來源**：`SEF-AC-004`；**標籤**：@error-handling @critical；**測試鍵**：`Graph_UnreachableEnding`

```gherkin
@error-handling @critical
Scenario: 不可抵達結尾不能發布
  Given 主線節點循環且找不到可達 Ending
  When 內容發布工具驗證
  Then 拒絕成為 published 完整主線
  And 不把其算入十條驗收數量
```

### SEF-BDD-026：全域事件不得在不相容場景出現

- [ ] **Scenario: 全域事件不得在不相容場景出現**
  - **來源**：`SEF-AC-005`；**標籤**：@error-handling @critical；**測試鍵**：`Event_SceneCapability`

```gherkin
@error-handling @critical
Scenario: 全域事件不得在不相容場景出現
  Given 全域事件需要書架能力但所在場景沒有書架
  When 觸發引擎計算候選
  Then 排除該全域事件
  And 不因標記 global 就無條件可用
```

### SEF-BDD-027：未知事件玩法不能發布

- [ ] **Scenario: 未知事件玩法不能發布**
  - **來源**：`SEF-AC-005`；**標籤**：@error-handling @critical；**測試鍵**：`Event_UnsupportedRenderer`

```gherkin
@error-handling @critical
Scenario: 未知事件玩法不能發布
  Given EventDefinition 使用前端未實作的 moduleType
  When 內容發布工具驗證
  Then 拒絕 published 並指出不支援的玩法
  And 不生成只有點擊外觀的空白互動
```

### SEF-BDD-032：不符合前置或循環依賴不能觸發

- [ ] **Scenario: 不符合前置或循環依賴不能觸發**
  - **來源**：`SEF-AC-006`；**標籤**：@error-handling @critical；**測試鍵**：`Event_InvalidDependency`

```gherkin
@error-handling @critical
Scenario: 不符合前置或循環依賴不能觸發
  Given 事件 A 需要尚未完成的 B 或定義互相循環
  When 發布或觸發事件
  Then 發布前拒絕循環，遊玩時拒絕未解鎖事件
  And 不修改任何已完成事件狀態
```

### SEF-BDD-036：完成後禁止觸發舊支線

- [ ] **Scenario: 完成後禁止觸發舊支線**
  - **來源**：`SEF-AC-007`；**標籤**：@error-handling @critical；**測試鍵**：`Chapter_RejectOldOptional`

```gherkin
@error-handling @critical
Scenario: 完成後禁止觸發舊支線
  Given StorySession 已完成且尚有未完成書籤事件
  When 客戶端送出舊場次事件操作
  Then 返回 EVENT_STATE_CONFLICT 且無新事件紀錄
  And 下一次有效重玩才能再次探索
```

### SEF-BDD-042：舊場同意不能開啟新場

- [ ] **Scenario: 舊場同意不能開啟新場**
  - **來源**：`SEF-AC-008`；**標籤**：@error-handling @critical；**測試鍵**：`Next_OldEpisodeReplay`

```gherkin
@error-handling @critical
Scenario: 舊場同意不能開啟新場
  Given 最新是 episode 3，客戶端仍帶 completedEpisodeSeq=1
  When 再次提交舊場同意
  Then 伺服器拒絕過期場次操作
  And 不跨場使用舊選票或同意
```

### SEF-BDD-044：第三人及撤銷登入不得操作

- [ ] **Scenario: 第三人及撤銷登入不得操作**
  - **來源**：`SEF-AC-009`；**標籤**：@error-handling @critical；**測試鍵**：`Auth_ThirdPartyAndRevoked`

```gherkin
@error-handling @critical
Scenario: 第三人及撤銷登入不得操作
  Given 第三人知道 roundId 或原成員 session 被撤銷
  When 呼叫投票、下一場、事件及訊息 API
  Then 全部 fail-closed 不寫入資料
  And 只回安全錯誤而非真實玩家資料
```

### SEF-BDD-047：R2 缺檔或 SHA 錯誤不得啟動

- [ ] **Scenario: R2 缺檔或 SHA 錯誤不得啟動**
  - **來源**：`SEF-AC-010`；**標籤**：@error-handling @critical；**測試鍵**：`Content_R2Corrupt`

```gherkin
@error-handling @critical
Scenario: R2 缺檔或 SHA 錯誤不得啟動
  Given 內容目錄存在但 Manifest 缺失或雜湊不符
  When 伺服器驗證／準備下一場
  Then 拒絕進場並維持可恢復的狀態
  And 不可提交半套 StorySession 或重新擲骰
```

### SEF-BDD-048：事件依賴錯誤或跨版本引用不可發布

- [ ] **Scenario: 事件依賴錯誤或跨版本引用不可發布**
  - **來源**：`SEF-AC-010`；**標籤**：@error-handling @critical；**測試鍵**：`Content_InvalidManifest`

```gherkin
@error-handling @critical
Scenario: 事件依賴錯誤或跨版本引用不可發布
  Given Scene、Narrative、EventPool 之間引用版本不存在
  When 發布工具驗證
  Then 拒絕發佈並指出具體引用缺失
  And 舊版已發布內容不被改寫
```

### SEF-BDD-050：十條驗收不可由背景或測試故事充數

- [ ] **Scenario: 十條驗收不可由背景或測試故事充數**
  - **來源**：`SEF-AC-011`；**標籤**：@error-handling @critical；**測試鍵**：`Gate_CannotCountFixtures`

```gherkin
@error-handling @critical
Scenario: 十條驗收不可由背景或測試故事充數
  Given 系統只有一條完整主線與九張場景圖片或測試 fixtures
  When 執行 MVP 完整度稽核
  Then 只能計一條完整可玩主線
  And 不能因有分支／多種結局加算條數
```

## Frontend UX — 前端畫面

### SEF-BDD-053：畫面依類別候選數切換

- [ ] **Scenario: 畫面依類別候選數切換**
  - **來源**：`SEF-AC-001`；**標籤**：@frontend @normal；**測試鍵**：`UI_OfferCount`

```gherkin
@frontend @normal
Scenario: 畫面依類別候選數切換
  Given 有效 Round 有一類別或二至三類別
  When 玩家進入劇情頁
  Then 唯一類別直接進場，多類別才顯示投票卡
  And 投票前不顯示對方選中的類別
```

### SEF-BDD-054：等待對方投票可聊天並回來

- [ ] **Scenario: 等待對方投票可聊天並回來**
  - **來源**：`SEF-AC-001`；**標籤**：@frontend @normal；**測試鍵**：`UI_VoteWaiting`

```gherkin
@frontend @normal
Scenario: 等待對方投票可聊天並回來
  Given A 已投票且 B 暫時離線
  When A 切換聊天再返回劇情入口
  Then 保留本人票並顯示正在等待另一位玩家
  And 沒有假選票、倒數替他選或超時決議
```

### SEF-BDD-055：隱藏事件在符合條件前不暴露

- [ ] **Scenario: 隱藏事件在符合條件前不暴露**
  - **來源**：`SEF-AC-005`；**標籤**：@frontend @normal；**測試鍵**：`UI_HiddenEvent`

```gherkin
@frontend @normal
Scenario: 隱藏事件在符合條件前不暴露
  Given 未達書店隱藏書籤事件條件
  When 玩家打開場景與事件列表
  Then 不顯示隱藏事件標題與答案
  And 符合條件並真正觸發才展示
```

### SEF-BDD-056：事件互動有提交回饋與防重

- [ ] **Scenario: 事件互動有提交回饋與防重**
  - **來源**：`SEF-AC-006`；**標籤**：@frontend @normal；**測試鍵**：`UI_InteractionFeedback`

```gherkin
@frontend @normal
Scenario: 事件互動有提交回饋與防重
  Given 雙人合作互動需要兩人各自選擇
  When A 提交自己的選項
  Then 畫面顯示送出中、成功後等待對方
  And 不能代替 B 作答或將 ACK 當成對方已讀
```

### SEF-BDD-057：完成時自然收尾並保留聊天

- [ ] **Scenario: 完成時自然收尾並保留聊天**
  - **來源**：`SEF-AC-007`；**標籤**：@frontend @normal；**測試鍵**：`UI_ChapterCompleted`

```gherkin
@frontend @normal
Scenario: 完成時自然收尾並保留聊天
  Given 主線抵達 Ending
  When 畫面接收到已提交完成事件
  Then 顯示本次劇情完成但聊天室仍可使用
  And 未完成事件不可再操作也無完成劇情按鈕
```

### SEF-BDD-058：再次遊玩按鈕等待雙方同意

- [ ] **Scenario: 再次遊玩按鈕等待雙方同意**
  - **來源**：`SEF-AC-008`；**標籤**：@frontend @critical；**測試鍵**：`UI_NextAgree`

```gherkin
@frontend @critical
Scenario: 再次遊玩按鈕等待雙方同意
  Given 劇情已完成而只有 A 想再玩
  When A 點擊再次遊玩
  Then 顯示我已同意、等待另一位玩家
  And B 拒絕或離線時保持聊天與 completed 狀態
```

### SEF-BDD-059：再次遊玩重複點擊不產生多場

- [ ] **Scenario: 再次遊玩重複點擊不產生多場**
  - **來源**：`SEF-AC-008`；**標籤**：@frontend @critical；**測試鍵**：`UI_NextDuplicateClick`

```gherkin
@frontend @critical
Scenario: 再次遊玩重複點擊不產生多場
  Given A 已按同意且網路回應尚未到達
  When A 再次點擊同意
  Then 控制項維持提交中而不產生第二個 requestId
  And 收到 receipt 後恢復正確狀態
```

### SEF-BDD-060：斷線恢復顯示權威狀態

- [ ] **Scenario: 斷線恢復顯示權威狀態**
  - **來源**：`SEF-AC-009`；**標籤**：@frontend @normal；**測試鍵**：`UI_OfflineRecovery`

```gherkin
@frontend @normal
Scenario: 斷線恢復顯示權威狀態
  Given 玩家完成投票後斷線且 Server 已提交但 ACK 失聯
  When 重新連線並取得快照及游標增量
  Then 依 D1 恢復原場景、主線與事件結果
  And 不重抽、不重送不同 requestId
```

### SEF-BDD-061：內容壞檔提示可重試但不重抽

- [ ] **Scenario: 內容壞檔提示可重試但不重抽**
  - **來源**：`SEF-AC-010`；**標籤**：@frontend @normal；**測試鍵**：`UI_ContentFailure`

```gherkin
@frontend @normal
Scenario: 內容壞檔提示可重試但不重抽
  Given 已抽選場景的 R2 Manifest 暫時無法讀取
  When 玩家重新開啟劇情頁
  Then 顯示無法載入劇情內容且提供重試載入
  And 不顯示假故事或換另一個場景
```

### SEF-BDD-062：Web 與 Android 共用首條驗收

- [ ] **Scenario: Web 與 Android 共用首條驗收**
  - **來源**：`SEF-AC-011`；**標籤**：@frontend @critical；**測試鍵**：`UI_BothPlatformsGate`

```gherkin
@frontend @critical
Scenario: Web 與 Android 共用首條驗收
  Given A 用 Web、B 用 Android 遊玩首場雨聲書店
  When 兩端完成書籤與雙人合作並進入收尾
  Then 兩端依真 D1 顯示相同結果與 next 按鈕狀態
  And 原 B1 五表情及全身 POV 驗收獨立保留
```

### SEF-BDD-063：結束配對仍需二次確認

- [ ] **Scenario: 結束配對仍需二次確認**
  - **來源**：`SEF-AC-009`；**標籤**：@frontend @critical；**測試鍵**：`UI_EndConfirmation`

```gherkin
@frontend @critical
Scenario: 結束配對仍需二次確認
  Given 劇情已完成且兩人仍在聊天
  When 一人點擊結束本輪互動
  Then 先提示原 pair 永久不再互配並要求確認
  And 取消不結束且不影響下一場同意
```

## 2026-11-12 RiskAudit 已確認規則的補強場景（RA-Q1=A／RA-Q2=A）

### SEF-BDD-064：選擇懸疑類別只能抽到適用的主線

- [ ] **Scenario: 選擇懸疑類別只能抽到適用的主線**
  - **來源**：`SEF-AC-003`、`SEF-RA-01／RA-Q1=A`；**標籤**：@happy-path @critical；**測試鍵**：`Narrative_SelectedCategory_MatchesEligibleCodes`

```gherkin
@happy-path @critical
Scenario: 選擇懸疑類別只能抽到適用的主線
  Given 雨聲書店同時屬於浪漫與懸疑類別
  And 場景內有一條僅適用浪漫、一條僅適用懸疑及一條同時適用兩類的主線
  When 雙方選定懸疑類別且伺服器抽選主線
  Then 候選僅包括適用懸疑的主線，浪漫專屬主線不得入選
  And 合格候選再依前置條件與 3:1 去重權重抽選，重連不得重抽
```

### SEF-BDD-065：重新遊玩時使用雙方最新已儲存興趣

- [ ] **Scenario: 重新遊玩時使用雙方最新已儲存興趣**
  - **來源**：`SEF-AC-008`、`SEF-RA-02／RA-Q2=A`；**標籤**：@happy-path @critical；**測試鍵**：`NextEpisode_UsesLatestPersistedInterestsAtFreeze`

```gherkin
@happy-path @critical
Scenario: 重新遊玩時使用雙方最新已儲存興趣
  Given A 與 B 已完成第一場劇情且仍在同一有效配對遊戲
  And A 更新解謎興趣後已成功儲存，而 B 保持原本已儲存興趣
  When A 與 B 先後同意開始下一場且伺服器成功凍結下一場類別候選
  Then 系統依當下最新已儲存的 A 與 B 興趣計算同一組固定候選
  And 第一場候選與已完成歷史不變，重連及後續修改興趣不能重算這次候選
```

### SEF-BDD-066：類別下只有不相符的主線不得顯示為可玩

- [ ] **Scenario: 類別下只有不相符的主線不得顯示為可玩**
  - **來源**：`SEF-AC-001`、`SEF-RA-01／RA-Q1=A`；**標籤**：@error-handling @critical；**測試鍵**：`Category_WithoutMatchingNarrative_HasNoPlayableContent`

```gherkin
@error-handling @critical
Scenario: 類別下只有不相符的主線不得顯示為可玩
  Given 唯一與懸疑類別關聯的場景沒有任何適用懸疑且已解鎖的主線
  When 系統產生可推薦類別或試圖將懸疑納入固定候選
  Then 懸疑不得成為可玩候選，沒有其他有效類別時回 NO_PLAYABLE_STORY
  And 不建立沒有真正可玩主線的 Round 或 Episode，也不以浪漫主線填充
```


## 2026-11-13 人物呈現／遊戲體驗整合回歸（跨 SPEC 補強）

以下場景是已確認需求的*技術整合驗收補強*，不改變既有 Q1～Q7、SEF-RQ-01～03 或 RA-Q1／Q2，亦不改變原 StoryDialogueAndExit 的 Gate B 責任。全部場景目前 **未實作／未驗收**。

### SEF-BDD-067：Scene／Narrative 拆分保留雨聲書店正式視覺

- [ ] **Scenario: Scene／Narrative 拆分保留雨聲書店正式視覺**
  - **來源**：`SEF-AC-013`；**標籤**：@frontend @critical；**測試鍵**：`Scene_Presentation_Preserved`

```gherkin
@frontend @critical
Scenario: Scene／Narrative 拆分保留雨聲書店正式視覺
  Given 雨聲書店 scene-01/v2 已有背景／透明桌面前景、六鏡位、書籤熱區與音效
  When 發布新的 Scene／Narrative 內容並進入原本相同的節點
  Then 相同鏡位、光色、遮擋、熱區座標與合法聲音 cue 在 Web／Android 保持一致
  And 靜態 Scene 的鏡位與背景不因換主線而遺失或重繪免費角色
```

### SEF-BDD-068：事件可暫時改變表情與鏡頭並還原

- [ ] **Scenario: 事件可暫時改變表情與鏡頭並還原**
  - **來源**：`SEF-AC-013`；**標籤**：@frontend @critical；**測試鍵**：`Event_Presentation_Overlay_ReturnsToNode`

```gherkin
@frontend @critical
Scenario: 事件可暫時改變表情與鏡頭並還原
  Given 玩家正站在書店場景的既有劇情節點，該節點有基底鏡頭與表情
  When 玩家合法完成一個設定驚訝表情與信件特寫鏡頭的自由事件
  Then 角色依已提交事件結果演出表情與鏡頭，事件完成後恢復節點基底呈現
  And 演出不偷偷修改主線 currentNode 或額外觸發選擇與 Gemini
```

### SEF-BDD-069：不合法的事件演出素材不能發布

- [ ] **Scenario: 不合法的事件演出素材不能發布**
  - **來源**：`SEF-AC-013`；**標籤**：@frontend @critical；**測試鍵**：`Event_Presentation_InvalidReference_Rejected`

```gherkin
@frontend @critical
Scenario: 不合法的事件演出素材不能發布
  Given EventBinding 的 presentationEffects 引用了不存在的鏡位、非五表情 ID 或未發布音效
  When 內容 Publisher 驗證完整 Scene／Narrative／Event 套件
  Then 拒絕發布並指出無效引用
  And 保留原已發布可玩版本，不建立新資料表或任意外部資產請求
```

### SEF-BDD-070：隱藏事件解鎖前不顯示熱區且檢視不提交

- [ ] **Scenario: 隱藏事件解鎖前不顯示熱區且檢視不提交**
  - **來源**：`SEF-AC-015`；**標籤**：@frontend @critical；**測試鍵**：`Hotspot_AuthoritativeVisibility_PreviewNoCommit`

```gherkin
@frontend @critical
Scenario: 隱藏事件解鎖前不顯示熱區且檢視不提交
  Given Scene Manifest 有書籤熱區座標，綁定事件仍是隱藏且未滿足條件
  When 玩家開場後查看舞台，再於符合條件時點擊已顯示熱區並取消探索
  Then 未解鎖時看不到隱藏入口，解鎖後可以檢視但取消不寫入完成事件
  And 伺服器再次驗證資格，不能從靜態 Manifest 取得隱藏答案
```

### SEF-BDD-071：遊戲中角色換成完整五表情且不重置劇情

- [ ] **Scenario: 遊戲中角色換成完整五表情且不重置劇情**
  - **來源**：`SEF-AC-014`；**標籤**：@frontend @critical；**測試鍵**：`Avatar_SafeSwap_IndependentOfNarrative`

```gherkin
@frontend @critical
Scenario: 遊戲中角色換成完整五表情且不重置劇情
  Given 雙方正在書店同一 storySession，對方已採用另一個完整 full-body.v1 五表情套組
  When 房間收到 avatar.updated，前端載入授權的新人物版本
  Then 五張表情完整解碼並在台詞安全句尾整組換角
  And storySessionId、currentNode、progressRevision、聊天與事件選擇不變
```

### SEF-BDD-072：人物仍在製作或讀圖失敗不生成與不混包

- [ ] **Scenario: 人物仍在製作或讀圖失敗不生成與不混包**
  - **來源**：`SEF-AC-014`；**標籤**：@frontend @critical；**測試鍵**：`Avatar_NotReadyOrFailed_NoGeneration`

```gherkin
@frontend @critical
Scenario: 人物仍在製作或讀圖失敗不生成與不混包
  Given 新五表情未 ready 或某張讀圖失敗，而原角色仍獲授權
  When 遊戲畫面同步角色，或玩家退背景後再回前景
  Then 繼續顯示舊完整角色或安全佔位，並可持續劇情及聊天
  And 不顯示新舊表情混包、不觸發 Gemini／next／採用 API、不自動續產
```

### SEF-BDD-073：新場次同樣叫 entry 也要重置舞台但保留聊天

- [ ] **Scenario: 新場次同樣叫 entry 也要重置舞台但保留聊天**
  - **來源**：`SEF-AC-015`；**標籤**：@frontend @critical；**測試鍵**：`Episode_ResetOnlyStage_PreserveRound`

```gherkin
@frontend @critical
Scenario: 新場次同樣叫 entry 也要重置舞台但保留聊天
  Given 同一 Round 第一場 completed 且聊天、目前已採用角色仍有效
  When 雙方同意進入另一個 storySession，該主線節點同樣叫 entry
  Then 台詞逐字動畫、鏡頭、音訊 cue、事件覆寫、對話視窗與舊 pending 動作均從新場次正確初始化
  And 舊聊天、Room 連線、目前角色以及第一場歷史不重建或消失
```

### SEF-BDD-074：App 背景前景恢復不重抽或再生成

- [ ] **Scenario: App 背景前景恢復不重抽或再生成**
  - **來源**：`SEF-AC-015`；**標籤**：@frontend @critical；**測試鍵**：`App_BackgroundResume_NoRerollOrGeneration`

```gherkin
@frontend @critical
Scenario: App 背景前景恢復不重抽或再生成
  Given 雙人進行自由事件且已有釘選 Scene、Narrative、Event 序號與已採用角色
  When Android Home 或 Web 失焦後回到前景並重新授權同步
  Then 從快照與游標補漏恢復相同場次、熱區與對方人物，微動／音訊保持安全暫停策略
  And 沒有重新抽籤、重送未知 action、音效自動播放或 B1 自動續產
```

### SEF-BDD-075：結束配對後私人角色與舊請求不能復活

- [ ] **Scenario: 結束配對後私人角色與舊請求不能復活**
  - **來源**：`SEF-AC-014`；**標籤**：@frontend @critical；**測試鍵**：`Avatar_RevokedOrStaleResponse_PurgesPrivate`

```gherkin
@frontend @critical
Scenario: 結束配對後私人角色與舊請求不能復活
  Given 上一房間的五表情 HTTP 仍在載入，玩家已退出或憑證失效
  When 舊請求回覆抵達且使用者打開另一房間
  Then 舊 private Avatar 圖片與授權投影被清除且不顯示
  And 不同 round 的訊息、stage 素材與角色不能交叉污染
```

### SEF-BDD-076：主線完成時畫面保持收尾與聊天

- [ ] **Scenario: 主線完成時畫面保持收尾與聊天**
  - **來源**：`SEF-AC-015`；**標籤**：@frontend @critical；**測試鍵**：`Chapter_Completed_StageAndChatStillVisible`

```gherkin
@frontend @critical
Scenario: 主線完成時畫面保持收尾與聊天
  Given 主線達到 Ending 且部分支線未完成
  When 伺服器同交易提交 chapter.completed 並封存未完成事件
  Then 雙方仍能看到本場收尾及聊天，支線入口變為不可操作
  And 不因 phase 不再 playing 而卸載整個 ADV，也不出現多餘完成劇情按鈕
```

### SEF-BDD-077：多事件切換保留微動開關且留下效能證據

- [ ] **Scenario: 多事件切換保留微動開關且留下效能證據**
  - **來源**：`SEF-AC-016`；**標籤**：@frontend @critical；**測試鍵**：`Scene_MotionAndAssetReuse_PerformanceEvidence`

```gherkin
@frontend @critical
Scenario: 多事件切換保留微動開關且留下效能證據
  Given Web／Android 使用正式五表情與透明桌面前景，連續切換多個可用事件
  When 使用者關閉場景微動後再觸發新事件、退背景與恢復
  Then 關閉時不啟動裝飾動畫，鏡位、角色與熱區仍能操作，圖片按版本重用
  And 保存實際記憶體與切換延遲或 jank 的驗證證據，不宣稱未量測的 FPS
```

### SEF-BDD-078：首條完整遊戲必須保留人物與 2.5D Gate

- [ ] **Scenario: 首條完整遊戲必須保留人物與 2.5D Gate**
  - **來源**：`SEF-AC-016`；**標籤**：@frontend @critical；**測試鍵**：`FirstStory_CrossSpec_ManualGate`

```gherkin
@frontend @critical
Scenario: 首條完整遊戲必須保留人物與 2.5D Gate
  Given 只有雨聲書店第一條主線可供真雙人完整驗證，正式免費與 AI 人物套組可使用
  When 玩家以 Web＋Android 完成物件探索、事件演出、兩種結局、角色切換及再次遊玩
  Then 最新 StoryDialogueAndExit UX-P1～P5、B1、全身角色與 SceneEventFramework 整合均有明確證據且人工 Gate B 尚須本人驗收
  And 未經使用者明確核准不能開始其餘九條，既有技術回放不能冒充真人人工通過
```

## SEF-BDD-079：本人目前採用化身尚未就緒時不可進入遊戲

**已通過**：真 D1／R2、HTTP／共用 WS 用例、Web 及 Android 入口／恢復；證據見驗證紀錄。

```gherkin
Scenario: 本人採用化身的五表情必須就緒，無關的製作中化身不影響入口
  Given 玩家已有 active Round，伺服器可辨識本人當前採用的化身
  When 該化身尚未 ready、缺少 ready Manifest 或任一表情物件
  Then 直接網址、恢復、票券及遊戲操作回 409 OWN_AVATAR_PACK_NOT_READY，不提交遊戲寫入
  And 畫面清除場景、角色、聊天室與草稿，提供「前往個人檔案」
  When 本人改用已就緒的化身並回到遊戲
  Then 回到原 Round 及已釘選劇情，不重抽；其他 pending 化身不阻擋
  And 第三人與撤銷仍回 403 與 401，未就緒也可永久結束本輪
```

## SPEC 驗收覆蓋矩陣

| SPEC AC | BDD Scenario |
|---|---|
| SEF-AC-001 | SEF-BDD-001、SEF-BDD-002、SEF-BDD-003、SEF-BDD-004、SEF-BDD-005、SEF-BDD-006、SEF-BDD-007、SEF-BDD-053、SEF-BDD-054、**SEF-BDD-066** |
| SEF-AC-002 | SEF-BDD-008、SEF-BDD-009、SEF-BDD-010 |
| SEF-AC-003 | SEF-BDD-011、SEF-BDD-012、SEF-BDD-013、SEF-BDD-014、SEF-BDD-015、SEF-BDD-016、SEF-BDD-017、SEF-BDD-018、**SEF-BDD-064** |
| SEF-AC-004 | SEF-BDD-019、SEF-BDD-020、SEF-BDD-021、SEF-BDD-022 |
| SEF-AC-005 | SEF-BDD-023、SEF-BDD-024、SEF-BDD-025、SEF-BDD-026、SEF-BDD-027、SEF-BDD-055 |
| SEF-AC-006 | SEF-BDD-028、SEF-BDD-029、SEF-BDD-030、SEF-BDD-031、SEF-BDD-032、SEF-BDD-033、SEF-BDD-056 |
| SEF-AC-007 | SEF-BDD-034、SEF-BDD-035、SEF-BDD-036、SEF-BDD-037、SEF-BDD-057 |
| SEF-AC-008 | SEF-BDD-038、SEF-BDD-039、SEF-BDD-040、SEF-BDD-041、SEF-BDD-042、SEF-BDD-058、SEF-BDD-059、**SEF-BDD-065** |
| SEF-AC-009 | SEF-BDD-043、SEF-BDD-044、SEF-BDD-045、SEF-BDD-060、SEF-BDD-063 |
| SEF-AC-010 | SEF-BDD-046、SEF-BDD-047、SEF-BDD-048、SEF-BDD-061 |
| SEF-AC-011 | SEF-BDD-049、SEF-BDD-050、SEF-BDD-062 |
| SEF-AC-012 | SEF-BDD-051、SEF-BDD-052 |
| SEF-AC-013 | SEF-BDD-067、SEF-BDD-068、SEF-BDD-069 |
| SEF-AC-014 | SEF-BDD-071、SEF-BDD-072、SEF-BDD-075 |
| SEF-AC-015 | SEF-BDD-070、SEF-BDD-073、SEF-BDD-074、SEF-BDD-076 |
| SEF-AC-016 | SEF-BDD-077、SEF-BDD-078 |
| SEF-AC-017 | SEF-BDD-079 |

**79/79 場景已建立規劃與追溯；1/79 完整實作覆核通過**。已將 RA-Q1=A、RA-Q2=A 增補為 SEF-BDD-064～066，不覆蓋原 63 個場景。另依 2026-11-13 全身角色／2.5D 影響稽核補入 SEF-BDD-067～078（12 場），保留原 StoryDialogueAndExit Gate B。對應 [TDD 測試清單](../tdd/SPEC-001-SceneEventFramework-TDD.md) 必須以本場景的 ID 雙向追溯。已確認的 RA-Q1=A／RA-Q2=A 及 12 項風險處置見 [RiskAudit](../specs/SPEC-001-SceneEventFramework-RiskAudit.md)，交接細節見 [TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md#規劃交接紀錄)；目前 Ready 只表示可以開始開發首條主線，非已測試通過。
