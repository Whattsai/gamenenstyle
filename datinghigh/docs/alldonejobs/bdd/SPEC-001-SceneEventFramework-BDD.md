# SPEC-001-SceneEventFramework — BDD 場景規格

> V3 已由本人實玩驗收，依使用者確認縮減至已核證案例並結案。以下 118 場是原有完整核證，並非宣稱原191場全通過；已取代／未核證的73場不再列開發待辦。V4 直接依賴的共用契約由新版獨立設計及驗收。
> [MVP](../../requirements/MVP-001-LoveGameDatingApp.md)｜[SPEC](../specs/SPEC-001-SceneEventFramework.md)｜[TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md)｜[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)

## 現行進度

118/118 已核證（僅結案保留範圍）；原未完整核證項依使用者決策移除，未改記通過。

## 已核證場景

### SEF-BDD-001：唯一可玩類別直接進場

- [x] **Scenario: 唯一可玩類別直接進場**
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

- [x] **Scenario: 兩類別由真人各投一票**
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

- [x] **Scenario: 三個以上類別依興趣取前三**
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

- [x] **Scenario: 同場景可屬多個類別**
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

- [x] **Scenario: 同場景可有多條完整主線**
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

- [x] **Scenario: 新場景抽選權重為三比一**
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

- [x] **Scenario: 無序主線優先未玩三比一**
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

- [x] **Scenario: 有序主線不可跳章**
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

- [x] **Scenario: 線性主線一個結局即可發布**
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

- [x] **Scenario: 分支後可合流共同主線**
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

- [x] **Scenario: 同一事件在不同主線有不同用途**
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

- [x] **Scenario: 隱藏與隨機與前置條件可同時存在**
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

- [x] **Scenario: 主線場景全域事件池可共存**
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

- [x] **Scenario: 事件僅在本次遊玩不重複**
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

- [x] **Scenario: 整輪配對範圍限制事件重複**
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

- [x] **Scenario: 事件結果能影響後續劇情**
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

- [x] **Scenario: 抵達主線收尾節點自然完成**
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

- [x] **Scenario: 雙方同意才開始下一場**
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

- [x] **Scenario: 更新內容不影響進行中的劇情**
  - **來源**：`SEF-AC-010`；**標籤**：@happy-path @normal；**測試鍵**：`Content_ImmutablePinned`

```gherkin
@happy-path @normal
Scenario: 更新內容不影響進行中的劇情
  Given 玩家使用 v1 的 R2 bundle，發布者已發布 v2
  When 玩家重連並繼續本場
  Then 仍取回 v1 及其全部依賴的 Scene/Event 版本
  And 新場次才可採用 v2
```

### SEF-BDD-051：MVP-001 不生成 AI 動態主線

- [x] **Scenario: MVP-001 不生成 AI 動態主線**
  - **來源**：`SEF-AC-012`；**標籤**：@happy-path @normal；**測試鍵**：`Boundary_MVP002NoAIGeneration`

```gherkin
@happy-path @normal
Scenario: MVP-001 不生成 AI 動態主線
  Given 目前運行劇情模式且 R2 僅發布人工主線
  When 玩家自由輸入文字與故事互動
  Then 文字按現有聊天處理而非觸發 AI 動態造主線
  And 沉浸模式獨立留待 MVP-002
```

### SEF-BDD-004：兩人選不同類別由原邀請者決定

- [x] **Scenario: 兩人選不同類別由原邀請者決定**
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

- [x] **Scenario: 結算前允許改票**
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

- [x] **Scenario: 換配對對象重新計算去重**
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

- [x] **Scenario: 有序與無序主線混合隨機**
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

- [x] **Scenario: 不同真人選擇得到不同收尾**
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

- [x] **Scenario: 未做支線不阻塞主線完成**
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

- [x] **Scenario: 只有一人同意不能偷偷開下一場**
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

- [x] **Scenario: 同意可以在結算前撤回**
  - **來源**：`SEF-AC-008`；**標籤**：@alternative-path @critical；**測試鍵**：`Next_Withdraw`

```gherkin
@alternative-path @critical
Scenario: 同意可以在結算前撤回
  Given A 已同意且 B 尚未提交
  When A 撤回同意
  Then 雙方同意條件不成立且不建立下一場
  And 只有最後有效同意才計算
```

### SEF-BDD-012：場景都已玩過仍可再抽

- [x] **Scenario: 場景都已玩過仍可再抽**
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

- [x] **Scenario: 合格主線均玩過仍可重玩**
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

- [x] **Scenario: 相同事件不同來源依語意去重**
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

- [x] **Scenario: 雙端同時完成同一事件只提交一次**
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

- [x] **Scenario: 完成與結束整輪競態不殘留半場**
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

- [x] **Scenario: 雙方同時同意恰好產生一場**
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

- [x] **Scenario: 全輪事件序號與冪等保存**
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

- [x] **Scenario: 重連與刷新不能重抽場景主線**
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

- [x] **Scenario: 劇情模式單次只走一個場景**
  - **來源**：`SEF-AC-012`；**標籤**：@edge-case @critical；**測試鍵**：`Boundary_SingleSceneVisit`

```gherkin
@edge-case @critical
Scenario: 劇情模式單次只走一個場景
  Given 同一 StorySession 已有一個 SceneVisit
  When Client 要求直接換第二場景
  Then 系統拒絕這次遊玩跨場景
  And 資料模型仍可供未來沉浸模式多場景擴充
```

### SEF-BDD-006：沒有完整內容不建立空遊戲

- [x] **Scenario: 沒有完整內容不建立空遊戲**
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

- [x] **Scenario: 無效類別票和未決議投票隱私**
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

- [x] **Scenario: 無效類別或場景關聯拒絕發布**
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

- [x] **Scenario: 客戶端無法指定尚未解鎖主線**
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

- [x] **Scenario: 不可抵達結尾不能發布**
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

- [x] **Scenario: 全域事件不得在不相容場景出現**
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

- [x] **Scenario: 未知事件玩法不能發布**
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

- [x] **Scenario: 不符合前置或循環依賴不能觸發**
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

- [x] **Scenario: 完成後禁止觸發舊支線**
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

- [x] **Scenario: 舊場同意不能開啟新場**
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

- [x] **Scenario: 第三人及撤銷登入不得操作**
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

- [x] **Scenario: R2 缺檔或 SHA 錯誤不得啟動**
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

- [x] **Scenario: 事件依賴錯誤或跨版本引用不可發布**
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

- [x] **Scenario: 十條驗收不可由背景或測試故事充數**
  - **來源**：`SEF-AC-011`；**標籤**：@error-handling @critical；**測試鍵**：`Gate_CannotCountFixtures`

```gherkin
@error-handling @critical
Scenario: 十條驗收不可由背景或測試故事充數
  Given 系統只有一條完整主線與九張場景圖片或測試 fixtures
  When 執行 MVP 完整度稽核
  Then 只能計一條完整可玩主線
  And 不能因有分支／多種結局加算條數
```

### SEF-BDD-053：畫面依類別候選數切換

- [x] **Scenario: 畫面依類別候選數切換**
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

- [x] **Scenario: 等待對方投票可聊天並回來**
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

- [x] **Scenario: 隱藏事件在符合條件前不暴露**
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

- [x] **Scenario: 事件互動有提交回饋與防重**
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

- [x] **Scenario: 完成時自然收尾並保留聊天**
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

- [x] **Scenario: 再次遊玩按鈕等待雙方同意**
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

- [x] **Scenario: 再次遊玩重複點擊不產生多場**
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

- [x] **Scenario: 斷線恢復顯示權威狀態**
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

- [x] **Scenario: 內容壞檔提示可重試但不重抽**
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

- [x] **Scenario: Web 與 Android 共用首條驗收**
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

- [x] **Scenario: 結束配對仍需二次確認**
  - **來源**：`SEF-AC-009`；**標籤**：@frontend @critical；**測試鍵**：`UI_EndConfirmation`

```gherkin
@frontend @critical
Scenario: 結束配對仍需二次確認
  Given 劇情已完成且兩人仍在聊天
  When 一人點擊結束本輪互動
  Then 先提示原 pair 永久不再互配並要求確認
  And 取消不結束且不影響下一場同意
```

### SEF-BDD-064：選擇懸疑類別只能抽到適用的主線

- [x] **Scenario: 選擇懸疑類別只能抽到適用的主線**
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

- [x] **Scenario: 重新遊玩時使用雙方最新已儲存興趣**
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

- [x] **Scenario: 類別下只有不相符的主線不得顯示為可玩**
  - **來源**：`SEF-AC-001`、`SEF-RA-01／RA-Q1=A`；**標籤**：@error-handling @critical；**測試鍵**：`Category_WithoutMatchingNarrative_HasNoPlayableContent`

```gherkin
@error-handling @critical
Scenario: 類別下只有不相符的主線不得顯示為可玩
  Given 唯一與懸疑類別關聯的場景沒有任何適用懸疑且已解鎖的主線
  When 系統產生可推薦類別或試圖將懸疑納入固定候選
  Then 懸疑不得成為可玩候選，沒有其他有效類別時回 NO_PLAYABLE_STORY
  And 不建立沒有真正可玩主線的 Round 或 Episode，也不以浪漫主線填充
```

### SEF-BDD-067：Scene／Narrative 拆分保留雨聲書店正式視覺

- [x] **Scenario: Scene／Narrative 拆分保留雨聲書店正式視覺**
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

- [x] **Scenario: 事件可暫時改變表情與鏡頭並還原**
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

- [x] **Scenario: 不合法的事件演出素材不能發布**
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

- [x] **Scenario: 隱藏事件解鎖前不顯示熱區且檢視不提交**
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

- [x] **Scenario: 遊戲中角色換成完整五表情且不重置劇情**
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

- [x] **Scenario: 人物仍在製作或讀圖失敗不生成與不混包**
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

- [x] **Scenario: 新場次同樣叫 entry 也要重置舞台但保留聊天**
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

- [x] **Scenario: App 背景前景恢復不重抽或再生成**
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

- [x] **Scenario: 結束配對後私人角色與舊請求不能復活**
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

- [x] **Scenario: 主線完成時畫面保持收尾與聊天**
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

- [x] **Scenario: 多事件切換保留微動開關且留下效能證據**
  - **來源**：`SEF-AC-016`；**標籤**：@frontend @critical；**測試鍵**：`Scene_MotionAndAssetReuse_PerformanceEvidence`

```gherkin
@frontend @critical
Scenario: 多事件切換保留微動開關且留下效能證據
  Given Web／Android 使用正式五表情與透明桌面前景，連續切換多個可用事件
  When 使用者關閉場景微動後再觸發新事件、退背景與恢復
  Then 關閉時不啟動裝飾動畫，鏡位、角色與熱區仍能操作，圖片按版本重用
  And 保存實際記憶體與切換延遲或 jank 的驗證證據，不宣稱未量測的 FPS
```

### SEF-BDD-079：本人目前採用化身尚未就緒時不可進入遊戲

- [x] **Scenario: 本人採用化身的五表情必須就緒，無關的製作中化身不影響入口**；真 D1／R2、HTTP／共用 WS 用例、Web 及 Android 入口／恢復已通過；證據見驗證紀錄。

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

### SEF-BDD-080：雙軌原子初始化

- [x] **Scenario: 雙軌原子初始化**
  - **來源**：SEF-AC-018

```gherkin
@critical @edge-case
Scenario: 雙軌原子初始化
  Given 場次決議已成功且兩名真人身分有效
  When Server 建立 StorySession
  Then 同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界
  And 任何一筆建立失敗都不能留下半場
```

### SEF-BDD-081：各自推進不互蓋另一人

- [x] **Scenario: 各自推進不互蓋另一人**
  - **來源**：SEF-AC-018

```gherkin
@critical @edge-case
Scenario: 各自推進不互蓋另一人
  Given I 和 A 各位於不同個人節點
  When I 先完成本人可用的事件
  Then 僅 I 的 node、Area、revision 進步，A 不變
  And A 可稍後親自完成未玩節點
```

### SEF-BDD-082：角色授權只能按原邀請紀錄

- [x] **Scenario: 角色授權只能按原邀請紀錄**
  - **來源**：SEF-AC-018

```gherkin
@critical @edge-case
Scenario: 角色授權只能按原邀請紀錄
  Given Round 已固定原邀請人及接受人
  When 前端假造另一方 role、nodeId 或 accountId
  Then Server 拒絕假冒且不修改進度
  And 不可用帳號大小或先上線順序決定角色
```

### SEF-BDD-083：落後玩家離線重連不跳節點

- [x] **Scenario: 落後玩家離線重連不跳節點**
  - **來源**：SEF-AC-018

```gherkin
@critical @edge-case
Scenario: 落後玩家離線重連不跳節點
  Given I 前進而 A 還在 A02
  When A 重新登入取授權 experience
  Then A 恢復 A02、Area、可操作物件及個人 revision
  And 全域 eventSeq 不能替 A 決策
```

### SEF-BDD-084：共同結局必須滿足雙人必經事實

- [x] **Scenario: 共同結局必須滿足雙人必經事實**
  - **來源**：SEF-AC-019

```gherkin
@critical @edge-case
Scenario: 共同結局必須滿足雙人必經事實
  Given I 的必要節點完成而 A08 未完成
  When I 嘗試結束本場主線
  Then chapter 仍是 playing 且 A 可繼續
  And A 完成及 Shared predicate 齊備才發出一次 chapter.completed
```

### SEF-BDD-085：共同事件完成後各自分流再交會

- [x] **Scenario: 共同事件完成後各自分流再交會**
  - **來源**：SEF-AC-019

```gherkin
@critical @edge-case
Scenario: 共同事件完成後各自分流再交會
  Given S01 兩人真人核對且 I04、A04、S02 都在合法圖中
  When 雙方提交 S01 後分別移至不同區域
  Then I04、A04 分別開啟並可進 S02 再交會
  And 不修改對方未完成的私人事件
```

### SEF-BDD-086：第二次共同事件只解鎖接受方

- [x] **Scenario: 第二次共同事件只解鎖接受方**
  - **來源**：SEF-AC-019

```gherkin
@critical @edge-case
Scenario: 第二次共同事件只解鎖接受方
  Given S02 完成時 I 在 I08、A 尚未執行 A08
  When 伺服器結算 S02 的合法雙人答案
  Then 只開啟 A08 且 I 停留 I08
  And A 驗證完才可進入 S03
```

### SEF-BDD-087：無界迴圈與跨線互等死鎖不得發布

- [x] **Scenario: 無界迴圈與跨線互等死鎖不得發布**
  - **來源**：SEF-AC-019

```gherkin
@critical @edge-case
Scenario: 無界迴圈與跨線互等死鎖不得發布
  Given I 必經事件等 A，A 必經事件又等不可達的 I
  When Publisher 檢查兩條 Track 與 Shared 依賴圖
  Then 拒絕不能到達共同 Ending 的內容
  And 合法可選回訪不被錯誤禁止
```

### SEF-BDD-088：角色限定 DSL 與非法條件輸入

- [x] **Scenario: 角色限定 DSL 與非法條件輸入**
  - **來源**：SEF-AC-019

```gherkin
@critical @edge-case
Scenario: 角色限定 DSL 與非法條件輸入
  Given 條件採 role、Area、bindingKey 與共享世界事實
  When 有人注入未知條件、過深布林或假 role
  Then Schema 或 Domain 拒絕非法組合
  And 合法 all、any、not 僅查已提交事實
```

### SEF-BDD-089：單一 Scene 支援多 Area 與多次遊玩

- [x] **Scenario: 單一 Scene 支援多 Area 與多次遊玩**
  - **來源**：SEF-AC-019

```gherkin
@critical @edge-case
Scenario: 單一 Scene 支援多 Area 與多次遊玩
  Given 玩家已在第一場 Scene 探索多個 Area
  When 兩人完成後同意並進入第二場
  Then 每個 StorySession 僅一筆 SceneVisit、各自有 Area
  And 跨場次和跨角色同名節點不得互相污染
```

### SEF-BDD-090：個人線索分享前不得洩漏給另一人

- [x] **Scenario: 個人線索分享前不得洩漏給另一人**
  - **來源**：SEF-AC-020

```gherkin
@critical @edge-case
Scenario: 個人線索分享前不得洩漏給另一人
  Given A 詢問店員得到書名但尚未分享
  When I 查快照、WS、熱區及可讀 Manifest
  Then I 不得看 A 私有節點或答案
  And A 主動分享後只公開允許的線索
```

### SEF-BDD-091：兩人競取共享物件只有一位成功

- [x] **Scenario: 兩人競取共享物件只有一位成功**
  - **來源**：SEF-AC-020

```gherkin
@critical @edge-case
Scenario: 兩人競取共享物件只有一位成功
  Given 書袋由共享世界權威記錄在書架
  When 兩名真人以相同 revision 同時 pick
  Then 只一個合法 D1 CAS 成功、另一人 409 同步
  And 物件不複製且不重複完成事件
```

### SEF-BDD-092：合作答案分別由兩位真人提交

- [x] **Scenario: 合作答案分別由兩位真人提交**
  - **來源**：SEF-AC-020

```gherkin
@critical @edge-case
Scenario: 合作答案分別由兩位真人提交
  Given S02 必須 I hold-bag 與 A retrieve-tag
  When I 先提交、A 離線後才操作
  Then 第一次提交只保留 I 事實且 EventInstance active
  And A 親提交後才完成一次 shared event
```

### SEF-BDD-093：個人事件重複群組不能誤擋另一人

- [x] **Scenario: 個人事件重複群組不能誤擋另一人**
  - **來源**：SEF-AC-020

```gherkin
@critical @edge-case
Scenario: 個人事件重複群組不能誤擋另一人
  Given 同一 EventDefinition 在 I 與 A 各有一個 binding
  When 兩人各自完成合法個人探索
  Then 兩份不同 scope 的 EventInstance 均存在
  And Shared binding 僅有一個共同 instance
```

### SEF-BDD-094：隱藏線索不能透過事件補漏流出

- [x] **Scenario: 隱藏線索不能透過事件補漏流出**
  - **來源**：SEF-AC-020

```gherkin
@critical @edge-case
Scenario: 隱藏線索不能透過事件補漏流出
  Given A 有尚未觸發的隱藏事件
  When I 請求 experience、events query 或公開 R2
  Then 無 A 私人線索、未知 binding 與私人 R2 key
  And 只顯示合作狀態的白名單摘要
```

### SEF-BDD-095：Area 移動不增加 SceneVisit

- [x] **Scenario: Area 移動不增加 SceneVisit**
  - **來源**：SEF-AC-021

```gherkin
@critical @frontend @happy-path
Scenario: Area 移動不增加 SceneVisit
  Given 一場 Scene 只有一筆 SceneVisit
  When I 由 entrance 移到 counter 再到 shelves
  Then 本人的 Area、鏡頭和可用熱區真實更新
  And 不可移至未解鎖或不存在的 Area
```

### SEF-BDD-096：翻轉取書單必須親自點擊

- [x] **Scenario: 翻轉取書單必須親自點擊**
  - **來源**：SEF-AC-021

```gherkin
@critical @frontend @happy-path
Scenario: 翻轉取書單必須親自點擊
  Given I 在 entrance 可見濕紙單
  When I 親自點 flip 及查看特寫
  Then 紙張可見翻面並得到 27 的個人線索
  And 跳過動畫不能跳過 Server 的正式操作
```

### SEF-BDD-097：錯書拖放不得造成不可恢復進度

- [x] **Scenario: 錯書拖放不得造成不可恢復進度**
  - **來源**：SEF-AC-021

```gherkin
@critical @frontend @happy-path
Scenario: 錯書拖放不得造成不可恢復進度
  Given I 尚未得到分享線索或選中錯書
  When 將 book-wednesday 拖到櫃檯
  Then 出現可恢復的具體提示，orderStatus 不變
  And 依正確資訊重新選書仍可完成
```

### SEF-BDD-098：NPC 資訊由玩家觸發不代答

- [x] **Scenario: NPC 資訊由玩家觸發不代答**
  - **來源**：SEF-AC-021

```gherkin
@critical @frontend @happy-path
Scenario: NPC 資訊由玩家觸發不代答
  Given A 在櫃檯且店員可交談
  When A 親自選擇 query-title
  Then 只 A 先看到預訂資訊，分享後 I 才知道
  And NPC 不能代另一位真人聊天或提交
```

### SEF-BDD-099：物件參數與非法 targetSlotId

- [x] **Scenario: 物件參數與非法 targetSlotId**
  - **來源**：SEF-AC-021

```gherkin
@critical @frontend @happy-path
Scenario: 物件參數與非法 targetSlotId
  Given 場景及物件白名單已由 R2 釘選
  When Client 提交未授權 objectId、targetSlotId 或 action
  Then Server 409／明確拒絕且世界未變
  And 合法 params 才能改 EventInstance 與進度
```

### SEF-BDD-100：站位、五表情與鏡頭 Cue 必須配合事件

- [x] **Scenario: 站位、五表情與鏡頭 Cue 必須配合事件**
  - **來源**：SEF-AC-022

```gherkin
@critical @frontend @edge-case
Scenario: 站位、五表情與鏡頭 Cue 必須配合事件
  Given S01、S02、S03 的角色素材與合法 Scene anchor 已釘選
  When 兩人完成互動後播放可見演出
  Then 鏡頭、物件、兩位真人化身及五表情符合 Cue
  And 缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini
```

### SEF-BDD-101：雨滴位移和微動開關

- [x] **Scenario: 雨滴位移和微動開關**
  - **來源**：SEF-AC-022

```gherkin
@critical @frontend @edge-case
Scenario: 雨滴位移和微動開關
  Given Rain Scene 顯示 AmbientMotion
  When 玩家檢視雨絲和玻璃水痕後關閉微動
  Then 畫面先有真正移動且關閉後停止循環
  And 必要 StoryMotion 仍能播放並且有可讀替代狀態
```

### SEF-BDD-102：重新回前景不能重播風起與產圖

- [x] **Scenario: 重新回前景不能重播風起與產圖**
  - **來源**：SEF-AC-022

```gherkin
@critical @frontend @edge-case
Scenario: 重新回前景不能重播風起與產圖
  Given S02 風起已提交且標籤在窗台
  When Android/Web 進背景再返回並恢復 Session
  Then 根據權威狀態顯示標籤且不重觸發風事件
  And 不 autoplay 音效、不重送指令、不再產生五表情
```

### SEF-BDD-103：錯誤演出素材無法發布與平台量測

- [x] **Scenario: 錯誤演出素材無法發布與平台量測**
  - **來源**：SEF-AC-022

```gherkin
@critical @frontend @edge-case
Scenario: 錯誤演出素材無法發布與平台量測
  Given Manifest 包含未知 anchor、表情、camera 或 motion
  When Publisher 驗證並由 Web/Android 量測正式遊玩
  Then 非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據
  And 不能以缺動畫的純文字替代宣告 Gate B 成功
```

### SEF-BDD-104：RB-01 兩端不同開場進度與台詞

- [x] **Scenario: RB-01 兩端不同開場進度與台詞**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-01

```gherkin
@critical @frontend @happy-path
Scenario: RB-01 兩端不同開場進度與台詞
  Given 雨聲書店 v2 的 I01 和 A01 已釘選
  When I 先翻濕紙單、A 停在書架
  Then I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立
  And 先行者不推進另一方未完成節點
```

### SEF-BDD-105：RB-02 紙單及袋外 27 線索只屬發現者

- [x] **Scenario: RB-02 紙單及袋外 27 線索只屬發現者**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-02

```gherkin
@critical @frontend @happy-path
Scenario: RB-02 紙單及袋外 27 線索只屬發現者
  Given I 看濕紙、A 查書袋外標籤
  When 兩人各自 inspect 並讀取 experience
  Then 僅本人看到已探索的資訊
  And 未經分享不洩漏對方私有節點或觸發
```

### SEF-BDD-106：RB-03 S01 真人核對跨離線仍可完成

- [x] **Scenario: RB-03 S01 真人核對跨離線仍可完成**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-03

```gherkin
@critical @frontend @happy-path
Scenario: RB-03 S01 真人核對跨離線仍可完成
  Given I 紙單與 A 袋子已在 counter
  When I 先按核對、A 離線重連後再按核對
  Then S01 在兩次真實操作後完成並分流 I04／A04
  And 不由店員代另一方核對
```

### SEF-BDD-107：RB-04 A 分享正確書名才開啟 I06

- [x] **Scenario: RB-04 A 分享正確書名才開啟 I06**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-04

```gherkin
@critical @frontend @happy-path
Scenario: RB-04 A 分享正確書名才開啟 I06
  Given I 看兩本海邊書、A 向店員查出正確書
  When I 在 A 尚未分享前嘗試領走書
  Then 不能完成；A 主動分享後 I 才能選中 book-rain
  And 不把 A 私人店員台詞完整傳給 I
```

### SEF-BDD-108：RB-05 試放錯書有可恢復提示

- [x] **Scenario: RB-05 試放錯書有可恢復提示**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-05

```gherkin
@critical @frontend @happy-path
Scenario: RB-05 試放錯書有可恢復提示
  Given I 選到 book-wednesday
  When I 嘗試放進 counter-slot
  Then 提示錯書且 orderStatus 不變
  And 可返回 shelves 重新選擇
```

### SEF-BDD-109：RB-06 A 先拿綠封套但 I 尚未找書

- [x] **Scenario: RB-06 A 先拿綠封套但 I 尚未找書**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-06

```gherkin
@critical @frontend @happy-path
Scenario: RB-06 A 先拿綠封套但 I 尚未找書
  Given A 知道封套位置且 I 仍在 I05
  When A 從 window 取出並送到 counter
  Then 只保存 A 的進度和 green-sleeve 位置、S02 不觸發
  And I 仍可完成自己的找書流程
```

### SEF-BDD-110：RB-07 S02 風起、真人分工和斷線恢復

- [x] **Scenario: RB-07 S02 風起、真人分工和斷線恢復**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-07

```gherkin
@critical @frontend @happy-path
Scenario: RB-07 S02 風起、真人分工和斷線恢復
  Given 正確書及封套已抵達 counter
  When S02 風起一次、I hold、A 下線後恢復並取回標籤
  Then 標籤只移動一次且 I 的真人提交保留
  And A 取回並放好才完成 Shared
```

### SEF-BDD-111：RB-08 同一張標籤只有一個權威位置

- [x] **Scenario: RB-08 同一張標籤只有一個權威位置**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-08

```gherkin
@critical @frontend @happy-path
Scenario: RB-08 同一張標籤只有一個權威位置
  Given order-tag-27 位於窗台
  When A 以同一舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  Then 僅 A 的一份合法 D1 CAS 成功，其他舊版次衝突或越權請求被拒
  And 不產生第二張標籤或重播 S02，並顯示權威物件位置
```

### SEF-BDD-112：RB-09 第二次共享事件後只進 A08

- [x] **Scenario: RB-09 第二次共享事件後只進 A08**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-09

```gherkin
@critical @frontend @happy-path
Scenario: RB-09 第二次共享事件後只進 A08
  Given S02 completed，I 在 I08
  When A 到 counter 開始 verify-order
  Then 僅 A 開啟 A08，I 保持 I08
  And A 真人確認後才啟動 S03
```

### SEF-BDD-113：RB-10 真人意向不同則自然進入 E02

- [x] **Scenario: RB-10 真人意向不同則自然進入 E02**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-10

```gherkin
@critical @frontend @happy-path
Scenario: RB-10 真人意向不同則自然進入 E02
  Given S03 已解鎖、兩人各自能選擇 `look_back` 或 `rest_chat`
  When I 親自選 `look_back`（再看一眼書架，替今天畫個句點），A 親自選 `rest_chat`（先休息，接著自由聊天）
  Then E02 自然完成並同交易封存未完成 Side，Round 仍 active 且聊天仍可用
  And 任一方選 `rest_chat` 都不宣稱兩人同意回書架，也不會生成新的探索操作
```

### SEF-BDD-114：RB-11 雙方回望書架後自然完成 E01

- [x] **Scenario: RB-11 雙方回望書架後自然完成 E01**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-11

```gherkin
@critical @frontend @happy-path
Scenario: RB-11 雙方回望書架後自然完成 E01
  Given 雙人的必經事實與 S03 都已完成到可提交最終意向
  When I 與 A 各親自選 `look_back`（再看一眼書架，替今天畫個句點）
  Then Server 在第二人合法提交時同 D1 交易完成 chapter.completed、封存未完 Side、保存 receipt，Round active／聊天保留；Client 收到成功後才播一次書架回望短鏡頭
  And 不開放新探索／物件熱區／支線、無額外結束按鈕；未成功提交不能先播結局，動畫略過／重連不能再送完成命令
```

### SEF-BDD-115：RB-12 重送斷線退出不得復活舊操作

- [x] **Scenario: RB-12 重送斷線退出不得復活舊操作**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-12

```gherkin
@critical @frontend @happy-path
Scenario: RB-12 重送斷線退出不得復活舊操作
  Given I/A 不同步且有已提交 requestId
  When 重送原 payload、變造 payload、重連及退出
  Then 冪等返回原 receipt、變造拒絕、退出後拒寫
  And 不重抽主線或重新呼叫五表情
```

### SEF-BDD-116：RB-13 關雨景後仍能完成風起事件

- [x] **Scenario: RB-13 關雨景後仍能完成風起事件**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-13

```gherkin
@critical @frontend @happy-path
Scenario: RB-13 關雨景後仍能完成風起事件
  Given 玩家已關閉 AmbientMotion 且 S02 可用
  When 兩人完成按住書袋和取回標籤
  Then 雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚
  And 可以略過表演不能略過操作
```

### SEF-BDD-118：本地 Clean Rebuild 不誤刪帳號與化身

- [x] **Scenario: 本地 Clean Rebuild 不誤刪帳號與化身**
  - **來源**：SEF-AC-024

```gherkin
@critical @error-handling
Scenario: 本地 Clean Rebuild 不誤刪帳號與化身
  Given 僅識別 DatingHigh local DB 與 R2 並有保護資料清單
  When 在開發 Gate 模擬清理及重建計畫
  Then 只清舊遊戲測資與無用執行內容
  And 未知、遠端、正式環境直接拒絕
```

### SEF-BDD-119：最終 Schema 無舊互動表或單線命令

- [x] **Scenario: 最終 Schema 無舊互動表或單線命令**
  - **來源**：SEF-AC-024

```gherkin
@critical @error-handling
Scenario: 最終 Schema 無舊互動表或單線命令
  Given scene-event.v2 新 runtime 已完整替換原路徑
  When 從空 local DB 執行 migration 及引用稽核
  Then game_interaction_instances 已無表與索引且雙方 Progress 正確
  And 保留 Round／聊天／EventReceipt／退出能力
```

### SEF-BDD-120：保留有引用的正式角色素材與書店場景

- [x] **Scenario: 保留有引用的正式角色素材與書店場景**
  - **來源**：SEF-AC-024

```gherkin
@critical @error-handling
Scenario: 保留有引用的正式角色素材與書店場景
  Given 16 款全身與五表情已正式提供且 R2 SHA 釘選
  When 清除舊 story-scenes 與 bookmark 發布流程
  Then 只有失效的舊入口被移除，正式來源與本劇本素材仍正常
  And 不能依檔案名稱相似就刪美術成品
```

### SEF-BDD-121：人工首條 Gate 未核准禁止九條量產

- [x] **Scenario: 人工首條 Gate 未核准禁止九條量產**
  - **來源**：SEF-AC-023

```gherkin
@critical @error-handling
Scenario: 人工首條 Gate 未核准禁止九條量產
  Given 首條技術測試全通過但真人試玩尚未核准
  When 開發準備製作另外九條正式主線
  Then 維持九條擴充 Gate 阻斷並可調整首條
  And 不以測試 fixture 或兩個 Ending 當成多條故事
```
