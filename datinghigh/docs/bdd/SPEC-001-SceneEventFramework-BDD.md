# SPEC-001-SceneEventFramework — BDD 場景規格

> **目前執行範圍**：依使用者決策先做靜態角色／場景整合，Puppet及連續角色動作試作暫緩，不保留未使用程式。原動態情境保留ID作後續追溯，不列本階段靜態交付前置，也不改勾通過；混合情境的身份、靜態表情／姿態、素材與授權斷言仍須驗證。實際進度及回復證據只記於[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)，下方歷史規劃與動作順序不覆蓋此範圍。

> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)（AC-005-04～35；新 V3 為 AC-005-24～35）
> **已確認 SDD**：[SPEC-001-SceneEventFramework](../specs/SPEC-001-SceneEventFramework.md)（原 SEF-RQ-01～03=A；新版雙 Track、雨聲書店詳稿已由使用者指示繼續 perfect-plan）
> **原規劃**：2026-11-12；**2026-11-16 最終計畫**：BDD-080～121 新增 42 項，合計 121 場景。V2-RQ-01=A 已確認，Phase 4 的 10 組 GAP 也已回寫 TDD，**新版 Phase 5 Ready for well-done（只代表規劃完成）**。舊版僅 1/79 完整覆核，新版仍 0/42，絕非產品已通過。
> **2026-11-17 V3 最新完整規劃**：SDD 六項 RQ 已確認且 `SEF-V3-RQ-01=B` 容量策略採受控增幅；原 V3 60 場＋RiskAudit 新增 10 場＝V3 70 場，BDD 合計 **191 場**；V3 0/70 尚未實作。舊 2026-11-16 Ready 僅屬歷史 V2，最新 Phase 5 以文件末尾交接狀態為準。

## Feature 描述

**Feature**：配對雙人選類別後在同一 Scene 進行個人雙 Track 與多次 Shared Event 交會；有真實場景物件操作、角色／雨景演出、私人線索與共享世界，首條「雨聲書店」的 21 個節點有明確文案與驗收。

**目標**：保留 Category→Scene→Narrative→EventBinding、未玩 3:1、自然完成／聊天／真人同意下一場，新增雙軌獨立進度、反覆交會／單方分流、Scene Area、嚴格動作參數／CAS、Web／Android 實際品質和 RB-01～RB-14。MVP-002／Housekeeping 不在本期。

> **目前執行權威**：[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)。上方規劃快照中的「未實作」不取代現行局部實作與缺項紀錄；歷史V2綠燈不算V3通過。

## 前端 UX 實作進度

```text
📦 SceneEventFramework
├─ 目前範圍：正式靜態包接線與首場V3整合；完整劇情仍未核證
├─ BDD完整覆核：118/191；其中V3 0/70，相關局部實作見Verification
├─ 17款靜態外觀均已逐款確認；實作與跨平台證據以Verification為準
└─ 正式Rig ready與首條V3 Gate B未通過，不製作其餘9場
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

## Alternative Path — 替代流程

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

## Boundary Conditions — 邊界條件

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

## Error Handling — 錯誤處理

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

## Frontend UX — 前端畫面

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

## 2026-11-12 RiskAudit 已確認規則的補強場景（RA-Q1=A／RA-Q2=A）

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


## 2026-11-13 人物呈現／遊戲體驗整合回歸（跨 SPEC 補強）

以下場景是已確認需求的*技術整合驗收補強*，不改變既有 Q1～Q7、SEF-RQ-01～03 或 RA-Q1／Q2，亦不改變原 StoryDialogueAndExit 的 Gate B 責任。全部場景目前 **未實作／未驗收**。

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

## 2026-11-15 新版雙軌框架與雨聲書店 BDD（SEF-BDD-080～121）

**本次新增 Scenario 一律未執行**；原 BDD-001～079 的既有測試證據和人工 Gate 不得代簽，BDD-080～121 以 SDD §3.3～3.8.6、§4～8 與 MVP AC-005-17～23 為規劃依據。

### 引擎：可驗證的行為

#### SEF-BDD-080：雙軌原子初始化

- [x] **Scenario: 雙軌原子初始化**
  - **來源**：SEF-AC-018；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 雙軌原子初始化
  Given 場次決議已成功且兩名真人身分有效
  When Server 建立 StorySession
  Then 同交易建立兩筆不同角色 Progress、單一 SceneVisit、共享世界
  And 任何一筆建立失敗都不能留下半場
```

#### SEF-BDD-081：各自推進不互蓋另一人

- [x] **Scenario: 各自推進不互蓋另一人**
  - **來源**：SEF-AC-018；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 各自推進不互蓋另一人
  Given I 和 A 各位於不同個人節點
  When I 先完成本人可用的事件
  Then 僅 I 的 node、Area、revision 進步，A 不變
  And A 可稍後親自完成未玩節點
```

#### SEF-BDD-082：角色授權只能按原邀請紀錄

- [x] **Scenario: 角色授權只能按原邀請紀錄**
  - **來源**：SEF-AC-018；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 角色授權只能按原邀請紀錄
  Given Round 已固定原邀請人及接受人
  When 前端假造另一方 role、nodeId 或 accountId
  Then Server 拒絕假冒且不修改進度
  And 不可用帳號大小或先上線順序決定角色
```

#### SEF-BDD-083：落後玩家離線重連不跳節點

- [x] **Scenario: 落後玩家離線重連不跳節點**
  - **來源**：SEF-AC-018；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 落後玩家離線重連不跳節點
  Given I 前進而 A 還在 A02
  When A 重新登入取授權 experience
  Then A 恢復 A02、Area、可操作物件及個人 revision
  And 全域 eventSeq 不能替 A 決策
```

#### SEF-BDD-084：共同結局必須滿足雙人必經事實

- [x] **Scenario: 共同結局必須滿足雙人必經事實**
  - **來源**：SEF-AC-019；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 共同結局必須滿足雙人必經事實
  Given I 的必要節點完成而 A08 未完成
  When I 嘗試結束本場主線
  Then chapter 仍是 playing 且 A 可繼續
  And A 完成及 Shared predicate 齊備才發出一次 chapter.completed
```

### 交會：可驗證的行為

#### SEF-BDD-085：共同事件完成後各自分流再交會

- [x] **Scenario: 共同事件完成後各自分流再交會**
  - **來源**：SEF-AC-019；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 共同事件完成後各自分流再交會
  Given S01 兩人真人核對且 I04、A04、S02 都在合法圖中
  When 雙方提交 S01 後分別移至不同區域
  Then I04、A04 分別開啟並可進 S02 再交會
  And 不修改對方未完成的私人事件
```

#### SEF-BDD-086：第二次共同事件只解鎖接受方

- [x] **Scenario: 第二次共同事件只解鎖接受方**
  - **來源**：SEF-AC-019；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 第二次共同事件只解鎖接受方
  Given S02 完成時 I 在 I08、A 尚未執行 A08
  When 伺服器結算 S02 的合法雙人答案
  Then 只開啟 A08 且 I 停留 I08
  And A 驗證完才可進入 S03
```

#### SEF-BDD-087：無界迴圈與跨線互等死鎖不得發布

- [x] **Scenario: 無界迴圈與跨線互等死鎖不得發布**
  - **來源**：SEF-AC-019；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 無界迴圈與跨線互等死鎖不得發布
  Given I 必經事件等 A，A 必經事件又等不可達的 I
  When Publisher 檢查兩條 Track 與 Shared 依賴圖
  Then 拒絕不能到達共同 Ending 的內容
  And 合法可選回訪不被錯誤禁止
```

#### SEF-BDD-088：角色限定 DSL 與非法條件輸入

- [x] **Scenario: 角色限定 DSL 與非法條件輸入**
  - **來源**：SEF-AC-019；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 角色限定 DSL 與非法條件輸入
  Given 條件採 role、Area、bindingKey 與共享世界事實
  When 有人注入未知條件、過深布林或假 role
  Then Schema 或 Domain 拒絕非法組合
  And 合法 all、any、not 僅查已提交事實
```

#### SEF-BDD-089：單一 Scene 支援多 Area 與多次遊玩

- [x] **Scenario: 單一 Scene 支援多 Area 與多次遊玩**
  - **來源**：SEF-AC-019；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 單一 Scene 支援多 Area 與多次遊玩
  Given 玩家已在第一場 Scene 探索多個 Area
  When 兩人完成後同意並進入第二場
  Then 每個 StorySession 僅一筆 SceneVisit、各自有 Area
  And 跨場次和跨角色同名節點不得互相污染
```

### 共享：可驗證的行為

#### SEF-BDD-090：個人線索分享前不得洩漏給另一人

- [x] **Scenario: 個人線索分享前不得洩漏給另一人**
  - **來源**：SEF-AC-020；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 個人線索分享前不得洩漏給另一人
  Given A 詢問店員得到書名但尚未分享
  When I 查快照、WS、熱區及可讀 Manifest
  Then I 不得看 A 私有節點或答案
  And A 主動分享後只公開允許的線索
```

#### SEF-BDD-091：兩人競取共享物件只有一位成功

- [x] **Scenario: 兩人競取共享物件只有一位成功**
  - **來源**：SEF-AC-020；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 兩人競取共享物件只有一位成功
  Given 書袋由共享世界權威記錄在書架
  When 兩名真人以相同 revision 同時 pick
  Then 只一個合法 D1 CAS 成功、另一人 409 同步
  And 物件不複製且不重複完成事件
```

#### SEF-BDD-092：合作答案分別由兩位真人提交

- [x] **Scenario: 合作答案分別由兩位真人提交**
  - **來源**：SEF-AC-020；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 合作答案分別由兩位真人提交
  Given S02 必須 I hold-bag 與 A retrieve-tag
  When I 先提交、A 離線後才操作
  Then 第一次提交只保留 I 事實且 EventInstance active
  And A 親提交後才完成一次 shared event
```

#### SEF-BDD-093：個人事件重複群組不能誤擋另一人

- [x] **Scenario: 個人事件重複群組不能誤擋另一人**
  - **來源**：SEF-AC-020；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 個人事件重複群組不能誤擋另一人
  Given 同一 EventDefinition 在 I 與 A 各有一個 binding
  When 兩人各自完成合法個人探索
  Then 兩份不同 scope 的 EventInstance 均存在
  And Shared binding 僅有一個共同 instance
```

#### SEF-BDD-094：隱藏線索不能透過事件補漏流出

- [x] **Scenario: 隱藏線索不能透過事件補漏流出**
  - **來源**：SEF-AC-020；**狀態**：待實作／未驗收

```gherkin
@critical @edge-case
Scenario: 隱藏線索不能透過事件補漏流出
  Given A 有尚未觸發的隱藏事件
  When I 請求 experience、events query 或公開 R2
  Then 無 A 私人線索、未知 binding 與私人 R2 key
  And 只顯示合作狀態的白名單摘要
```

### 操作：可驗證的行為

#### SEF-BDD-095：Area 移動不增加 SceneVisit

- [x] **Scenario: Area 移動不增加 SceneVisit**
  - **來源**：SEF-AC-021；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: Area 移動不增加 SceneVisit
  Given 一場 Scene 只有一筆 SceneVisit
  When I 由 entrance 移到 counter 再到 shelves
  Then 本人的 Area、鏡頭和可用熱區真實更新
  And 不可移至未解鎖或不存在的 Area
```

#### SEF-BDD-096：翻轉取書單必須親自點擊

- [x] **Scenario: 翻轉取書單必須親自點擊**
  - **來源**：SEF-AC-021；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: 翻轉取書單必須親自點擊
  Given I 在 entrance 可見濕紙單
  When I 親自點 flip 及查看特寫
  Then 紙張可見翻面並得到 27 的個人線索
  And 跳過動畫不能跳過 Server 的正式操作
```

#### SEF-BDD-097：錯書拖放不得造成不可恢復進度

- [x] **Scenario: 錯書拖放不得造成不可恢復進度**
  - **來源**：SEF-AC-021；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: 錯書拖放不得造成不可恢復進度
  Given I 尚未得到分享線索或選中錯書
  When 將 book-wednesday 拖到櫃檯
  Then 出現可恢復的具體提示，orderStatus 不變
  And 依正確資訊重新選書仍可完成
```

#### SEF-BDD-098：NPC 資訊由玩家觸發不代答

- [x] **Scenario: NPC 資訊由玩家觸發不代答**
  - **來源**：SEF-AC-021；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: NPC 資訊由玩家觸發不代答
  Given A 在櫃檯且店員可交談
  When A 親自選擇 query-title
  Then 只 A 先看到預訂資訊，分享後 I 才知道
  And NPC 不能代另一位真人聊天或提交
```

#### SEF-BDD-099：物件參數與非法 targetSlotId

- [x] **Scenario: 物件參數與非法 targetSlotId**
  - **來源**：SEF-AC-021；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: 物件參數與非法 targetSlotId
  Given 場景及物件白名單已由 R2 釘選
  When Client 提交未授權 objectId、targetSlotId 或 action
  Then Server 409／明確拒絕且世界未變
  And 合法 params 才能改 EventInstance 與進度
```

### 演出：可驗證的行為

#### SEF-BDD-100：站位、五表情與鏡頭 Cue 必須配合事件

- [x] **Scenario: 站位、五表情與鏡頭 Cue 必須配合事件**
  - **來源**：SEF-AC-022；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @edge-case
Scenario: 站位、五表情與鏡頭 Cue 必須配合事件
  Given S01、S02、S03 的角色素材與合法 Scene anchor 已釘選
  When 兩人完成互動後播放可見演出
  Then 鏡頭、物件、兩位真人化身及五表情符合 Cue
  And 缺正式動作姿勢時不冒充伸手或直接呼叫 Gemini
```

#### SEF-BDD-101：雨滴位移和微動開關

- [x] **Scenario: 雨滴位移和微動開關**
  - **來源**：SEF-AC-022；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @edge-case
Scenario: 雨滴位移和微動開關
  Given Rain Scene 顯示 AmbientMotion
  When 玩家檢視雨絲和玻璃水痕後關閉微動
  Then 畫面先有真正移動且關閉後停止循環
  And 必要 StoryMotion 仍能播放並且有可讀替代狀態
```

#### SEF-BDD-102：重新回前景不能重播風起與產圖

- [x] **Scenario: 重新回前景不能重播風起與產圖**
  - **來源**：SEF-AC-022；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @edge-case
Scenario: 重新回前景不能重播風起與產圖
  Given S02 風起已提交且標籤在窗台
  When Android/Web 進背景再返回並恢復 Session
  Then 根據權威狀態顯示標籤且不重觸發風事件
  And 不 autoplay 音效、不重送指令、不再產生五表情
```

#### SEF-BDD-103：錯誤演出素材無法發布與平台量測

- [x] **Scenario: 錯誤演出素材無法發布與平台量測**
  - **來源**：SEF-AC-022；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @edge-case
Scenario: 錯誤演出素材無法發布與平台量測
  Given Manifest 包含未知 anchor、表情、camera 或 motion
  When Publisher 驗證並由 Web/Android 量測正式遊玩
  Then 非法內容拒絕、合法內容保留可核對的 jank／記憶體／延遲證據
  And 不能以缺動畫的純文字替代宣告 Gate B 成功
```

### 雨聲書店：可驗證的行為

#### SEF-BDD-104：RB-01 兩端不同開場進度與台詞

- [x] **Scenario: RB-01 兩端不同開場進度與台詞**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-01；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-01 兩端不同開場進度與台詞
  Given 雨聲書店 v2 的 I01 和 A01 已釘選
  When I 先翻濕紙單、A 停在書架
  Then I 在 entrance、A 在 shelves，兩份台詞與鏡位獨立
  And 先行者不推進另一方未完成節點
```

#### SEF-BDD-105：RB-02 紙單及袋外 27 線索只屬發現者

- [x] **Scenario: RB-02 紙單及袋外 27 線索只屬發現者**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-02；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-02 紙單及袋外 27 線索只屬發現者
  Given I 看濕紙、A 查書袋外標籤
  When 兩人各自 inspect 並讀取 experience
  Then 僅本人看到已探索的資訊
  And 未經分享不洩漏對方私有節點或觸發
```

#### SEF-BDD-106：RB-03 S01 真人核對跨離線仍可完成

- [x] **Scenario: RB-03 S01 真人核對跨離線仍可完成**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-03；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-03 S01 真人核對跨離線仍可完成
  Given I 紙單與 A 袋子已在 counter
  When I 先按核對、A 離線重連後再按核對
  Then S01 在兩次真實操作後完成並分流 I04／A04
  And 不由店員代另一方核對
```

#### SEF-BDD-107：RB-04 A 分享正確書名才開啟 I06

- [x] **Scenario: RB-04 A 分享正確書名才開啟 I06**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-04；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-04 A 分享正確書名才開啟 I06
  Given I 看兩本海邊書、A 向店員查出正確書
  When I 在 A 尚未分享前嘗試領走書
  Then 不能完成；A 主動分享後 I 才能選中 book-rain
  And 不把 A 私人店員台詞完整傳給 I
```

#### SEF-BDD-108：RB-05 試放錯書有可恢復提示

- [x] **Scenario: RB-05 試放錯書有可恢復提示**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-05；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-05 試放錯書有可恢復提示
  Given I 選到 book-wednesday
  When I 嘗試放進 counter-slot
  Then 提示錯書且 orderStatus 不變
  And 可返回 shelves 重新選擇
```

#### SEF-BDD-109：RB-06 A 先拿綠封套但 I 尚未找書

- [x] **Scenario: RB-06 A 先拿綠封套但 I 尚未找書**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-06；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-06 A 先拿綠封套但 I 尚未找書
  Given A 知道封套位置且 I 仍在 I05
  When A 從 window 取出並送到 counter
  Then 只保存 A 的進度和 green-sleeve 位置、S02 不觸發
  And I 仍可完成自己的找書流程
```

#### SEF-BDD-110：RB-07 S02 風起、真人分工和斷線恢復

- [x] **Scenario: RB-07 S02 風起、真人分工和斷線恢復**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-07；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-07 S02 風起、真人分工和斷線恢復
  Given 正確書及封套已抵達 counter
  When S02 風起一次、I hold、A 下線後恢復並取回標籤
  Then 標籤只移動一次且 I 的真人提交保留
  And A 取回並放好才完成 Shared
```

#### SEF-BDD-111：RB-08 同一張標籤只有一個權威位置

- [x] **Scenario: RB-08 同一張標籤只有一個權威位置**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-08；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-08 同一張標籤只有一個權威位置
  Given order-tag-27 位於窗台
  When A 以同一舊 revision 在兩裝置同時取標籤且 I 越權嘗試取得
  Then 僅 A 的一份合法 D1 CAS 成功，其他舊版次衝突或越權請求被拒
  And 不產生第二張標籤或重播 S02，並顯示權威物件位置
```

#### SEF-BDD-112：RB-09 第二次共享事件後只進 A08

- [x] **Scenario: RB-09 第二次共享事件後只進 A08**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-09；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-09 第二次共享事件後只進 A08
  Given S02 completed，I 在 I08
  When A 到 counter 開始 verify-order
  Then 僅 A 開啟 A08，I 保持 I08
  And A 真人確認後才啟動 S03
```

#### SEF-BDD-113：RB-10 真人意向不同則自然進入 E02

- [x] **Scenario: RB-10 真人意向不同則自然進入 E02**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-10；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-10 真人意向不同則自然進入 E02
  Given S03 已解鎖、兩人各自能選擇 `look_back` 或 `rest_chat`
  When I 親自選 `look_back`（再看一眼書架，替今天畫個句點），A 親自選 `rest_chat`（先休息，接著自由聊天）
  Then E02 自然完成並同交易封存未完成 Side，Round 仍 active 且聊天仍可用
  And 任一方選 `rest_chat` 都不宣稱兩人同意回書架，也不會生成新的探索操作
```

#### SEF-BDD-114：RB-11 雙方回望書架後自然完成 E01

- [x] **Scenario: RB-11 雙方回望書架後自然完成 E01**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-11；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-11 雙方回望書架後自然完成 E01
  Given 雙人的必經事實與 S03 都已完成到可提交最終意向
  When I 與 A 各親自選 `look_back`（再看一眼書架，替今天畫個句點）
  Then Server 在第二人合法提交時同 D1 交易完成 chapter.completed、封存未完 Side、保存 receipt，Round active／聊天保留；Client 收到成功後才播一次書架回望短鏡頭
  And 不開放新探索／物件熱區／支線、無額外結束按鈕；未成功提交不能先播結局，動畫略過／重連不能再送完成命令
```

#### SEF-BDD-115：RB-12 重送斷線退出不得復活舊操作

- [x] **Scenario: RB-12 重送斷線退出不得復活舊操作**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-12；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-12 重送斷線退出不得復活舊操作
  Given I/A 不同步且有已提交 requestId
  When 重送原 payload、變造 payload、重連及退出
  Then 冪等返回原 receipt、變造拒絕、退出後拒寫
  And 不重抽主線或重新呼叫五表情
```

#### SEF-BDD-116：RB-13 關雨景後仍能完成風起事件

- [x] **Scenario: RB-13 關雨景後仍能完成風起事件**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-13；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-13 關雨景後仍能完成風起事件
  Given 玩家已關閉 AmbientMotion 且 S02 可用
  When 兩人完成按住書袋和取回標籤
  Then 雨絲循環停止但必要 StoryMotion 與物件狀態仍清楚
  And 可以略過表演不能略過操作
```

#### SEF-BDD-117：RB-14 Web Android 全劇本且 Gate B 人工核准

- [ ] **Scenario: RB-14 Web Android 全劇本且 Gate B 人工核准**
  - **來源**：SEF-AC-023／SDD §3.8.6 RB-14；**狀態**：待實作／未驗收

```gherkin
@critical @frontend @happy-path
Scenario: RB-14 Web Android 全劇本且 Gate B 人工核准
  Given 只發布首條正式雨聲書店並準備兩名真人
  When 兩端實玩 I01/A01 至 E01/E02 的所有必經流程
  Then 21 節點、四 Area、三次交會與五表情／鏡頭／音效都有可驗證證據
  And 未取得使用者人工核准不得開始另外九條
```

### 清理：可驗證的行為

#### SEF-BDD-118：本地 Clean Rebuild 不誤刪帳號與化身

- [x] **Scenario: 本地 Clean Rebuild 不誤刪帳號與化身**
  - **來源**：SEF-AC-024；**狀態**：待實作／未驗收

```gherkin
@critical @error-handling
Scenario: 本地 Clean Rebuild 不誤刪帳號與化身
  Given 僅識別 DatingHigh local DB 與 R2 並有保護資料清單
  When 在開發 Gate 模擬清理及重建計畫
  Then 只清舊遊戲測資與無用執行內容
  And 未知、遠端、正式環境直接拒絕
```

#### SEF-BDD-119：最終 Schema 無舊互動表或單線命令

- [x] **Scenario: 最終 Schema 無舊互動表或單線命令**
  - **來源**：SEF-AC-024；**狀態**：待實作／未驗收

```gherkin
@critical @error-handling
Scenario: 最終 Schema 無舊互動表或單線命令
  Given scene-event.v2 新 runtime 已完整替換原路徑
  When 從空 local DB 執行 migration 及引用稽核
  Then game_interaction_instances 已無表與索引且雙方 Progress 正確
  And 保留 Round／聊天／EventReceipt／退出能力
```

#### SEF-BDD-120：保留有引用的正式角色素材與書店場景

- [x] **Scenario: 保留有引用的正式角色素材與書店場景**
  - **來源**：SEF-AC-024；**狀態**：待實作／未驗收

```gherkin
@critical @error-handling
Scenario: 保留有引用的正式角色素材與書店場景
  Given 16 款全身與五表情已正式提供且 R2 SHA 釘選
  When 清除舊 story-scenes 與 bookmark 發布流程
  Then 只有失效的舊入口被移除，正式來源與本劇本素材仍正常
  And 不能依檔案名稱相似就刪美術成品
```

#### SEF-BDD-121：人工首條 Gate 未核准禁止九條量產

- [x] **Scenario: 人工首條 Gate 未核准禁止九條量產**
  - **來源**：SEF-AC-023；**狀態**：待實作／未驗收

```gherkin
@critical @error-handling
Scenario: 人工首條 Gate 未核准禁止九條量產
  Given 首條技術測試全通過但真人試玩尚未核准
  When 開發準備製作另外九條正式主線
  Then 維持九條擴充 Gate 阻斷並可調整首條
  And 不以測試 fixture 或兩個 Ending 當成多條故事
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
| SEF-AC-018 | SEF-BDD-080、SEF-BDD-081、SEF-BDD-082、SEF-BDD-083 |
| SEF-AC-019 | SEF-BDD-084、SEF-BDD-085、SEF-BDD-086、SEF-BDD-087、SEF-BDD-088、SEF-BDD-089 |
| SEF-AC-020 | SEF-BDD-090、SEF-BDD-091、SEF-BDD-092、SEF-BDD-093、SEF-BDD-094 |
| SEF-AC-021 | SEF-BDD-095、SEF-BDD-096、SEF-BDD-097、SEF-BDD-098、SEF-BDD-099 |
| SEF-AC-022 | SEF-BDD-100、SEF-BDD-101、SEF-BDD-102、SEF-BDD-103 |
| SEF-AC-023 | SEF-BDD-104、SEF-BDD-105、SEF-BDD-106、SEF-BDD-107、SEF-BDD-108、SEF-BDD-109、SEF-BDD-110、SEF-BDD-111、SEF-BDD-112、SEF-BDD-113、SEF-BDD-114、SEF-BDD-115、SEF-BDD-116、SEF-BDD-117、SEF-BDD-121 |
| SEF-AC-024 | SEF-BDD-118、SEF-BDD-119、SEF-BDD-120 |

**121/121 場景已有 BDD 規劃與 SPEC AC 追溯（舊版 79＋新版 42）**；目前舊版 1/79 項完整覆核，新版 0/42，合計 1/121。RB-01～14 均對應 BDD-104～117，E01 選項依 V2-RQ-01=A 更新為「再看一眼書架，替今天畫個句點」，無互動尾聲。TDD 現為 625 項，12 項新風險與 10 組 GAP 已回寫，**Phase 5 規劃可交 well-done，但所有新行為與人工 Gate B 仍待實際驗收**。


---

## 2026-11-17 雨聲書店 V3 正式新增 BDD（SEF-BDD-122～181，60 場）

**最新有效狀態**：V3-RQ-01～06 已全數確認（01～05=A、06=A＋C）。舊 121 場 BDD／625 項 TDD 是 V2／引擎基線，**不可視為 V3 已驗收**；下列 60 場均為新增規劃、0/60 完成，原 121 場完成狀態與測試 ID 原封保留。更新後 **總 BDD 181 場（121 歷史＋60 V3），實際通過仍只有原完整覆核 1 場，V3 0 場**。MVP 新條件 `AC-005-24～35` 全部逐項對應；每個正式故事分鏡／NPC／道具／角色需 Web 與 Android 人工 Gate B。未完成 RiskAudit 人工決策，不得標記 V3 Ready。

**測試角色和環境**：登入 I/A 雙真人、角色版號及 R2 授權、真 Worker／Miniflare D1、已發佈 V3 immutable manifests、可觀察的 Web／Android 舞台，沒有替代另一真人提交的測試捷徑。所有 Scene／Narrative／Event 特定 ID 以 SDD §3.8 和合法 Publisher 定義為準。五語意表情保留，但 **V3 是可動 Rig 而非五張完整全身圖片的業務契約**。

**覆蓋分類**：每 AC 五場，包含正常、替代、錯誤、邊界、跨端人物／畫面；特殊負向斷言與真跨層觀察不能僅由 UI mock 代簽。

### SEF-BDD-122：兩人各自抵達同一間書店
- [ ] **Scenario: 兩人各自抵達同一間書店**
  - **來源**：`AC-005-24`／`V3-AC-01`；**標籤**：@frontend @critical；**測試鍵**：`DualEntrySeparate`；**跨層**：`ET`
  - **負向斷言**：伺服器不得只存一份共用 currentNode

```gherkin
@frontend @critical
Scenario: 兩人各自抵達同一間書店
  Given 雙方進入同一已釘選 V3 場次，I 當日準時下班、A 下午逛街
  When 兩人分別讀取自己的首節點並進門
  Then I 與 A 各自看到街景→入口的合法分鏡及店員迎賓
  And 兩人不因先到而跳過另一人的個人開場
  But 伺服器不得只存一份共用 currentNode
```

### SEF-BDD-123：入店雨聲門鈴與音樂一致
- [ ] **Scenario: 入店雨聲門鈴與音樂一致**
  - **來源**：`AC-005-24`／`V3-AC-01`；**標籤**：@frontend @critical；**測試鍵**：`EntryAudioSequence`；**跨層**：`ET`
  - **負向斷言**：不允許由音效播放推進 D1 節點

```gherkin
@frontend @critical
Scenario: 入店雨聲門鈴與音樂一致
  Given 兩人各自在街道大雨下進入書店
  When 播放 sh-street-rain 與 sh-entrance-welcome
  Then 門鈴、雨聲遠近及店內音樂依分鏡順序切換
  And 前景恢復不重播一次性門鈴或重產素材
  But 不允許由音效播放推進 D1 節點
```

### SEF-BDD-124：I 和 A 的入場權限及資訊隔離
- [ ] **Scenario: I 和 A 的入場權限及資訊隔離**
  - **來源**：`AC-005-24`／`V3-AC-01`；**標籤**：@error-handling @critical；**測試鍵**：`EntryActorProjection`；**跨層**：`API`
  - **負向斷言**：不得由 Client 指定任意 role 取得別人視角

```gherkin
@error-handling @critical
Scenario: I 和 A 的入場權限及資訊隔離
  Given StorySession 有雙方獨立角色、Entry 與 Area
  When I 和 A 分別呼叫授權 experience
  Then 回應只有本人 Track 與可見已分享世界
  And 不能取得另一方未觸發私有節點與選書
  But 不得由 Client 指定任意 role 取得別人視角
```

### SEF-BDD-125：書店多區導覽的真實位置
- [ ] **Scenario: 書店多區導覽的真實位置**
  - **來源**：`AC-005-24`／`V3-AC-01`；**標籤**：@happy-path @critical；**測試鍵**：`EntryAreaSpatialMap`；**跨層**：`IT`
  - **負向斷言**：不能把另一張不相容店面圖當作同一店

```gherkin
@happy-path @critical
Scenario: 書店多區導覽的真實位置
  Given 已發布書店有入口、書架、閱讀角、櫃檯與窗邊的固定地圖
  When 玩家依允許的移動事件從入口走至書架
  Then 場景背景和視角依 Area 正確切換且書架相對方位不變
  And 跨 Area 後先前角色與共用物件位置一致
  But 不能把另一張不相容店面圖當作同一店
```

### SEF-BDD-126：缺開場 Shot 或 NPC 素材拒絕發布
- [ ] **Scenario: 缺開場 Shot 或 NPC 素材拒絕發布**
  - **來源**：`AC-005-24`／`V3-AC-01`；**標籤**：@happy-path @critical；**測試鍵**：`EntryAssetRequired`；**跨層**：`IT`
  - **負向斷言**：不能只有文字框就標示角色入場成功

```gherkin
@happy-path @critical
Scenario: 缺開場 Shot 或 NPC 素材拒絕發布
  Given V3 Entry 對應的迎賓 NPC 或必要 Shot 缺少有效素材 SHA
  When Publisher 驗證新內容
  Then 拒絕發布且不得設為可玩的主線
  And 原已發布 V2 Session 仍可讀取釘選原版
  But 不能只有文字框就標示角色入場成功
```

### SEF-BDD-127：點擊書脊抽出並閱讀原創簡介
- [ ] **Scenario: 點擊書脊抽出並閱讀原創簡介**
  - **來源**：`AC-005-25`／`V3-AC-02`；**標籤**：@frontend @critical；**測試鍵**：`BookSpineRead`；**跨層**：`ET`
  - **負向斷言**：未點擊之前不自動展開閱讀浮層

```gherkin
@frontend @critical
Scenario: 點擊書脊抽出並閱讀原創簡介
  Given 玩家在書架 Area 看見嵌入背景的原創書脊
  When 點選書本原位並選擇閱讀
  Then 書本抽出、轉近景、打開封面摘要及試讀頁
  And 關閉後返回同一書架與原位而非漂浮卡片
  But 未點擊之前不自動展開閱讀浮層
```

### SEF-BDD-128：書種與試讀內容合法且可重用
- [ ] **Scenario: 書種與試讀內容合法且可重用**
  - **來源**：`AC-005-25`／`V3-AC-02`；**標籤**：@happy-path @critical；**測試鍵**：`BookCatalogValid`；**跨層**：`IT`
  - **負向斷言**：不得露出未授權既有著作全文或無 bookId 書

```gherkin
@happy-path @critical
Scenario: 書種與試讀內容合法且可重用
  Given 已發布四類原創書籍具有 bookId、封面、摘要和適用主題
  When 玩家切換不同書籍與類別
  Then 每本展示正確封面、書名與經授權內容
  And 來源版本不變並可安全重開
  But 不得露出未授權既有著作全文或無 bookId 書
```

### SEF-BDD-129：個人選書先私有直到本人分享
- [ ] **Scenario: 個人選書先私有直到本人分享**
  - **來源**：`AC-005-25`／`V3-AC-02`；**標籤**：@error-handling @critical；**測試鍵**：`BookSelectionPrivate`；**跨層**：`API`
  - **負向斷言**：不得以 NPC 或系統自動發送 A 的分享訊息

```gherkin
@error-handling @critical
Scenario: 個人選書先私有直到本人分享
  Given A 已選定閱讀書籍但未提交分享
  When I 讀取快照、WS 提示及可見書目
  Then 只能得知公開書架內容，沒有 A 的個人選書答案
  And A 親自分享後才顯示受允許的書籍摘要
  But 不得以 NPC 或系統自動發送 A 的分享訊息
```

### SEF-BDD-130：重複查看書本不會重複完成事件
- [ ] **Scenario: 重複查看書本不會重複完成事件**
  - **來源**：`AC-005-25`／`V3-AC-02`；**標籤**：@frontend @critical；**測試鍵**：`BookPeekNoCommit`；**跨層**：`ET`
  - **負向斷言**：不能因關閉視窗直接寫入故事完成 receipt

```gherkin
@frontend @critical
Scenario: 重複查看書本不會重複完成事件
  Given 同一本書的閱讀預覽允許多次開關
  When 玩家連續點選、返回再選不同書
  Then 每次都顯示預覽但不等同完成合作事件
  And 只在合法本人提交後持久化正式選擇
  But 不能因關閉視窗直接寫入故事完成 receipt
```

### SEF-BDD-131：書籍類型不匹配的情緒選項受限
- [ ] **Scenario: 書籍類型不匹配的情緒選項受限**
  - **來源**：`AC-005-25`／`V3-AC-02`；**標籤**：@happy-path @critical；**測試鍵**：`BookThemeCompatibility`；**跨層**：`IT`
  - **負向斷言**：不能把任意情緒經歷強塞到所有書類

```gherkin
@happy-path @critical
Scenario: 書籍類型不匹配的情緒選項受限
  Given 某書籍只適用成長療癒類的共鳴主題
  When 玩家嘗試用另一書類專屬情緒選項操作
  Then Domain 拒絕不相容組合但允許中性原因
  And 個人選書狀態保持，畫面提供重選
  But 不能把任意情緒經歷強塞到所有書類
```

### SEF-BDD-132：A 選虛構故事共鳴而非真人經歷
- [ ] **Scenario: A 選虛構故事共鳴而非真人經歷**
  - **來源**：`AC-005-26`／`V3-AC-03`；**標籤**：@error-handling @critical；**測試鍵**：`ResonanceFiction`；**跨層**：`API`
  - **負向斷言**：不能將虛構故事選項解讀為真實隱私資料

```gherkin
@error-handling @critical
Scenario: A 選虛構故事共鳴而非真人經歷
  Given A 正在讀已發布原創故事，畫面有虛構角色背景
  When A 選擇與角色相應的共鳴原因
  Then 故事只作虛構角色內心演出、不問真實失戀或壓力史
  And 不得回寫玩家 Profile 或配對條件
  But 不能將虛構故事選項解讀為真實隱私資料
```

### SEF-BDD-133：A 可選單純被書感動的中性原因
- [ ] **Scenario: A 可選單純被書感動的中性原因**
  - **來源**：`AC-005-26`／`V3-AC-03`；**標籤**：@frontend @critical；**測試鍵**：`ResonanceNeutral`；**跨層**：`ET`
  - **負向斷言**：不能以空缺強迫補填私密背景

```gherkin
@frontend @critical
Scenario: A 可選單純被書感動的中性原因
  Given A 不願選失去戀情、工作壓力等故事原因
  When A 選擇純粹因故事感動
  Then 可合法進入閱讀角坐下並繼續劇情
  And 不因不揭露私人原因卡住雨情主線
  But 不能以空缺強迫補填私密背景
```

### SEF-BDD-134：閱讀角有坐姿淚光及正確可見性
- [ ] **Scenario: 閱讀角有坐姿淚光及正確可見性**
  - **來源**：`AC-005-26`／`V3-AC-03`；**標籤**：@frontend @critical；**測試鍵**：`CornerTearPose`；**跨層**：`ET`
  - **負向斷言**：不能用表情文字取代坐姿或洩漏內心

```gherkin
@frontend @critical
Scenario: 閱讀角有坐姿淚光及正確可見性
  Given A 已選合法書籍並到閱讀角，I 尚在書架
  When A 翻書到動容節點 av3-05
  Then A 的已核准角色呈現坐姿、眼眶濕潤與擦淚 Cue
  And I 僅在合法觀察範圍看見可見行為不見原因
  But 不能用表情文字取代坐姿或洩漏內心
```

### SEF-BDD-135：I 早到閱讀角不會偷看到 A 的未來狀態
- [ ] **Scenario: I 早到閱讀角不會偷看到 A 的未來狀態**
  - **來源**：`AC-005-26`／`V3-AC-03`；**標籤**：@happy-path @critical；**測試鍵**：`CornerVisibilityTiming`；**跨層**：`IT`
  - **負向斷言**：不能為讓畫面好看而替 A 推進 Track

```gherkin
@happy-path @critical
Scenario: I 早到閱讀角不會偷看到 A 的未來狀態
  Given I 已抵達閱讀角，但 A 尚未完成 av3-05
  When I 查看場景及可用事件
  Then 不提前顯示 A 已坐著落淚的未發生狀態
  And I 可以繼續逛書架而不是強制等待
  But 不能為讓畫面好看而替 A 推進 Track
```

### SEF-BDD-136：A 的私有情緒及書籍答案不可外洩
- [ ] **Scenario: A 的私有情緒及書籍答案不可外洩**
  - **來源**：`AC-005-26`／`V3-AC-03`；**標籤**：@error-handling @critical；**測試鍵**：`ResonanceProjectionSafe`；**跨層**：`API`
  - **負向斷言**：不能靠隱藏 UI 而完整傳送私人內容

```gherkin
@error-handling @critical
Scenario: A 的私有情緒及書籍答案不可外洩
  Given A 已提交虛構情緒原因但未主動分享
  When I 以 HTTP、WS、R2 Manifest 嘗試取 A 選項
  Then 不回傳私有 nodeId、resonanceId、隱藏答案或角色照片 Key
  And I 僅看到法律上合法的公開情緒視覺 Cue
  But 不能靠隱藏 UI 而完整傳送私人內容
```

### SEF-BDD-137：I 可以不搭話而正常前進
- [ ] **Scenario: I 可以不搭話而正常前進**
  - **來源**：`AC-005-27`／`V3-AC-04`；**標籤**：@happy-path @critical；**測試鍵**：`ApproachOptional`；**跨層**：`IT`
  - **負向斷言**：不能由系統自動替 I 選擇搭話

```gherkin
@happy-path @critical
Scenario: I 可以不搭話而正常前進
  Given I 在角落觀察到 A，選擇繼續逛自己的書
  When I 繼續閱讀書籍直到天氣惡化
  Then 可經外部雨情進入後續主線並保有再搭話的合法機會
  And A 不會收到並不存在的搭話訊息
  But 不能由系統自動替 I 選擇搭話
```

### SEF-BDD-138：三種搭話實際有三種演出
- [ ] **Scenario: 三種搭話實際有三種演出**
  - **來源**：`AC-005-27`／`V3-AC-04`；**標籤**：@frontend @critical；**測試鍵**：`ApproachThreeStyles`；**跨層**：`ET`
  - **負向斷言**：不能只換文字而沿用錯誤的道具動作

```gherkin
@frontend @critical
Scenario: 三種搭話實際有三種演出
  Given I 已確認 A 真正在閱讀角且可接觸
  When I 分別選關心、遞面紙或聊手上的書
  Then 各方案有相異的人物站位、面紙或書封演出
  And A 只收到 I 真正提交的那一種做法
  But 不能只換文字而沿用錯誤的道具動作
```

### SEF-BDD-139：A 可自行談心、聊書或婉拒
- [ ] **Scenario: A 可自行談心、聊書或婉拒**
  - **來源**：`AC-005-27`／`V3-AC-04`；**標籤**：@error-handling @critical；**測試鍵**：`ResponseThreeChoices`；**跨層**：`API`
  - **負向斷言**：系統不可因已收到邀請而替 A 接受

```gherkin
@error-handling @critical
Scenario: A 可自行談心、聊書或婉拒
  Given A 收到 I 本人已提交的接觸邀請
  When A 親自選 open-up、books-only 或 decline
  Then I 僅收到 A 已提交的正確回應
  And 不同回應各自啟動合法接話或互不打擾分支
  But 系統不可因已收到邀請而替 A 接受
```

### SEF-BDD-140：A 婉拒後不再自動推進親密聊天
- [ ] **Scenario: A 婉拒後不再自動推進親密聊天**
  - **來源**：`AC-005-27`／`V3-AC-04`；**標籤**：@happy-path @critical；**測試鍵**：`DeclineRespected`；**跨層**：`IT`
  - **負向斷言**：不能由共同救書推定 A 同意私人交往

```gherkin
@happy-path @critical
Scenario: A 婉拒後不再自動推進親密聊天
  Given A 已對 I 的搭話提交 decline
  When 接著進入店員路過和救書合作
  Then 只允許安全相關合作，雙方保持自主距離
  And 私下聊天仍需雙方後續主動發起
  But 不能由共同救書推定 A 同意私人交往
```

### SEF-BDD-141：I 遞面紙與 A 回應的因果正確
- [ ] **Scenario: I 遞面紙與 A 回應的因果正確**
  - **來源**：`AC-005-27`／`V3-AC-04`；**標籤**：@frontend @critical；**測試鍵**：`TissueInteractionAgency`；**跨層**：`ET`
  - **負向斷言**：不能把道謝等同於同意談心

```gherkin
@frontend @critical
Scenario: I 遞面紙與 A 回應的因果正確
  Given I 選體貼提供面紙，A 仍有獨立回應權
  When A 接受面紙但同時選擇不聊天
  Then 面紙交接動畫可播，仍維持 decline 的拒絕效果
  And I 不會出現未被本人選擇的延續對話
  But 不能把道謝等同於同意談心
```

### SEF-BDD-142：雙 Track 快慢不同不跳戲
- [ ] **Scenario: 雙 Track 快慢不同不跳戲**
  - **來源**：`AC-005-28`／`V3-AC-05`；**標籤**：@happy-path @critical；**測試鍵**：`TracksDifferentPace`；**跨層**：`IT`
  - **負向斷言**：不得合併成全域 currentNode 覆寫對方

```gherkin
@happy-path @critical
Scenario: 雙 Track 快慢不同不跳戲
  Given I 完成自己的書架段落，A 尚在選故事書
  When I 收到共用雨情前置解鎖通知
  Then A 的私人段落未被跳過，I 可以繼續合法探索
  And 各自 Revision 和 Area 彼此獨立
  But 不得合併成全域 currentNode 覆寫對方
```

### SEF-BDD-143：A 離線後重連保留本人選擇
- [ ] **Scenario: A 離線後重連保留本人選擇**
  - **來源**：`AC-005-28`／`V3-AC-05`；**標籤**：@frontend @critical；**測試鍵**：`TrackReconnect`；**跨層**：`ET`
  - **負向斷言**：不能因重連自動替 A 搭話、選書或生成 AI 圖

```gherkin
@frontend @critical
Scenario: A 離線後重連保留本人選擇
  Given A 選了一本書後網路斷線，I 持續本人的探索
  When A 重連取得 /experience 快照與事件游標
  Then A 回原來自己的合法節點與已選書籍
  And I 的節點與共享世界仍保持真實狀態
  But 不能因重連自動替 A 搭話、選書或生成 AI 圖
```

### SEF-BDD-144：拒絕聊天仍可合法開始雨情
- [ ] **Scenario: 拒絕聊天仍可合法開始雨情**
  - **來源**：`AC-005-28`／`V3-AC-05`；**標籤**：@happy-path @critical；**測試鍵**：`DeclineDoesNotDeadlock`；**跨層**：`IT`
  - **負向斷言**：不能把 decline 設成不可能完成主線的前置

```gherkin
@happy-path @critical
Scenario: 拒絕聊天仍可合法開始雨情
  Given I 沒搭話或 A 已經婉拒，而雙方完成必要個人開場
  When 天氣共用事件滿足前置並觸發
  Then 雨情依相同世界狀態開始，沒有互相等待死鎖
  And 不強迫兩人建立私人親密關係
  But 不能把 decline 設成不可能完成主線的前置
```

### SEF-BDD-145：斷線與雙人同時操作必須原子結算
- [ ] **Scenario: 斷線與雙人同時操作必須原子結算**
  - **來源**：`AC-005-28`／`V3-AC-05`；**標籤**：@error-handling @critical；**測試鍵**：`TrackConcurrency`；**跨層**：`API`
  - **負向斷言**：不能將 WS 播放成功當成 D1 成功

```gherkin
@error-handling @critical
Scenario: 斷線與雙人同時操作必須原子結算
  Given I/A 以相同舊 Shared revision 同時提交互動
  When Worker 在真 D1 CAS 執行兩人提交
  Then 各本人答案與共用效果只合法寫入一次
  And 409 競態者可讀權威快照繼續
  But 不能將 WS 播放成功當成 D1 成功
```

### SEF-BDD-146：第三人或假冒角色不得操作對方進度
- [ ] **Scenario: 第三人或假冒角色不得操作對方進度**
  - **來源**：`AC-005-28`／`V3-AC-05`；**標籤**：@error-handling @critical；**測試鍵**：`TrackRoleAuthorization`；**跨層**：`API`
  - **負向斷言**：不得相信 Client 提供的原邀請者身份

```gherkin
@error-handling @critical
Scenario: 第三人或假冒角色不得操作對方進度
  Given 已登入 I 或無關第三人持有可見 sessionId
  When 傳入 A 的 role、nodeId 或 requestId 偽造事件
  Then 伺服器依認證身份拒絕越權操作
  And A 私有資料及原本 Revision 不變
  But 不得相信 Client 提供的原邀請者身份
```

### SEF-BDD-147：NPC 店員有固定身份和出入場姿態
- [ ] **Scenario: NPC 店員有固定身份和出入場姿態**
  - **來源**：`AC-005-29`／`V3-AC-06`；**標籤**：@frontend @critical；**測試鍵**：`NpcStageIdentity`；**跨層**：`ET`
  - **負向斷言**：不能只顯示店員台詞而無人物資產

```gherkin
@frontend @critical
Scenario: NPC 店員有固定身份和出入場姿態
  Given 書店正式場景有唯一店員 actorId、造型與合法站位
  When 從迎賓切到櫃檯及書架路過
  Then 同一店員連續出現並轉頭走動、表情一致
  And NPC 不會突然變成另一真人玩家立繪
  But 不能只顯示店員台詞而無人物資產
```

### SEF-BDD-148：玩家點店員本體才開啟對話
- [ ] **Scenario: 玩家點店員本體才開啟對話**
  - **來源**：`AC-005-29`／`V3-AC-06`；**標籤**：@frontend @critical；**測試鍵**：`NpcEmbeddedClick`；**跨層**：`ET`
  - **負向斷言**：不能點畫面任意空白處都觸發 NPC

```gherkin
@frontend @critical
Scenario: 玩家點店員本體才開啟對話
  Given 店員已站在閱讀角邊且可以被玩家交談
  When 玩家點店員身體的場景 hitShape
  Then 店員回頭、顯示對話並保持正確腳底錨點
  And 沒有永久漂浮的 ✧ 或大頭卡片
  But 不能點畫面任意空白處都觸發 NPC
```

### SEF-BDD-149：店員可見地引導遠離水並端咖啡
- [ ] **Scenario: 店員可見地引導遠離水並端咖啡**
  - **來源**：`AC-005-29`／`V3-AC-06`；**標籤**：@frontend @critical；**測試鍵**：`NpcSafetyCoffeeMotion`；**跨層**：`ET`
  - **負向斷言**：不能用未發布姿勢在遊玩時向 AI 即時產圖

```gherkin
@frontend @critical
Scenario: 店員可見地引導遠離水並端咖啡
  Given 店員已在進水段察覺危險，後續雨情安全解除
  When 店員移動指示安全區並在收尾端上兩杯咖啡
  Then 不同事件各有已核准的站位、端杯道具、遮擋與表情
  And 無必要動作素材時不可宣稱完整發布
  But 不能用未發布姿勢在遊玩時向 AI 即時產圖
```

### SEF-BDD-150：NPC 不可被偽裝成對方的聊天訊息
- [ ] **Scenario: NPC 不可被偽裝成對方的聊天訊息**
  - **來源**：`AC-005-29`／`V3-AC-06`；**標籤**：@error-handling @critical；**測試鍵**：`NpcNoPartnerImpersonation`；**跨層**：`API`
  - **負向斷言**：不能把 NPC 系統旁白寫入對方聊天歷史

```gherkin
@error-handling @critical
Scenario: NPC 不可被偽裝成對方的聊天訊息
  Given NPC 已向雙方詢問是否幫忙整理書籍
  When 某位玩家偽造 NPC chat 或另一真人的 actorId
  Then 伺服器僅接受登入者的合法提交和標示 NPC 對白
  And 聊天 message.committed 不出現假真人
  But 不能把 NPC 系統旁白寫入對方聊天歷史
```

### SEF-BDD-151：NPC 必要資產缺失 Publisher 拒絕
- [ ] **Scenario: NPC 必要資產缺失 Publisher 拒絕**
  - **來源**：`AC-005-29`／`V3-AC-06`；**標籤**：@happy-path @critical；**測試鍵**：`NpcRequiredAssetValidation`；**跨層**：`IT`
  - **負向斷言**：不能只驗 actor 名稱存在就算完整演出

```gherkin
@happy-path @critical
Scenario: NPC 必要資產缺失 Publisher 拒絕
  Given V3 必經節點宣告 NPC 端杯但缺動作或杯子資產
  When 發佈工具檢驗演出依賴圖
  Then 拒絕發布該 Narrative，不能發布文字替身
  And 仍可重放已釘選的合法歷史內容
  But 不能只驗 actor 名稱存在就算完整演出
```

### SEF-BDD-152：雨勢從重雨到入口滲水的可見變化
- [ ] **Scenario: 雨勢從重雨到入口滲水的可見變化**
  - **來源**：`AC-005-30`／`V3-AC-07`；**標籤**：@frontend @critical；**測試鍵**：`StormToSeep`；**跨層**：`ET`
  - **負向斷言**：不能只調透明度冒充雨滴移動

```gherkin
@frontend @critical
Scenario: 雨勢從重雨到入口滲水的可見變化
  Given 兩人均進入合法天氣事件、雨量尚未升級
  When Shared 事件從 heavy 開始並進展到 seeping
  Then 窗外雨滴移動、門縫水痕、地板反射與音效可見變化
  And 兩端看到一致的權威水位等級
  But 不能只調透明度冒充雨滴移動
```

### SEF-BDD-153：危險入口禁止救書操作
- [ ] **Scenario: 危險入口禁止救書操作**
  - **來源**：`AC-005-30`／`V3-AC-07`；**標籤**：@error-handling @critical；**測試鍵**：`UnsafeAreaDisabled`；**跨層**：`API`
  - **負向斷言**：不能將客戶端隱藏按鈕當成安全授權

```gherkin
@error-handling @critical
Scenario: 危險入口禁止救書操作
  Given 書店入口低窪水位達禁止靠近條件
  When 玩家嘗試進入危險 Area 或操作插座附近物件
  Then Domain 拒絕該動作且不寫成功 receipt
  And 可選安全導覽移動到乾燥區
  But 不能將客戶端隱藏按鈕當成安全授權
```

### SEF-BDD-154：水位超標切換到安全撤離
- [ ] **Scenario: 水位超標切換到安全撤離**
  - **來源**：`AC-005-30`／`V3-AC-07`；**標籤**：@happy-path @critical；**測試鍵**：`FloodSafetyFallback`；**跨層**：`IT`
  - **負向斷言**：不能因任務未完成就永遠鎖住劇情

```gherkin
@happy-path @critical
Scenario: 水位超標切換到安全撤離
  Given 共享水位超過安全整理門檻，或退出通道不安全
  When 系統觸發獨立 safety-exit 並停止整理
  Then 雙方能在合法狀態完成安全撤離分鏡
  And 不出現端咖啡留在危險店內的結尾
  But 不能因任務未完成就永遠鎖住劇情
```

### SEF-BDD-155：A/I 水位與 NPC 警示同步
- [ ] **Scenario: A/I 水位與 NPC 警示同步**
  - **來源**：`AC-005-30`／`V3-AC-07`；**標籤**：@happy-path @critical；**測試鍵**：`FloodWorldConsistency`；**跨層**：`IT`
  - **負向斷言**：不能由兩端分別增水而出現不同危險等級

```gherkin
@happy-path @critical
Scenario: A/I 水位與 NPC 警示同步
  Given 兩玩家在不同 Area，A 先看到店員察覺積水
  When I 收到安全權威快照及 WS 通知
  Then 共用世界只保存一套水位／警示／禁入狀態
  And 個人鏡位依本人 Area 合法投影但結果一致
  But 不能由兩端分別增水而出現不同危險等級
```

### SEF-BDD-156：安全區救書不靠近電源或積水
- [ ] **Scenario: 安全區救書不靠近電源或積水**
  - **來源**：`AC-005-30`／`V3-AC-07`；**標籤**：@frontend @critical；**測試鍵**：`RescueSafeZoneOnly`；**跨層**：`ET`
  - **負向斷言**：不能因動畫好看而把箱子移到危險區

```gherkin
@frontend @critical
Scenario: 安全區救書不靠近電源或積水
  Given NPC 指引到乾燥區且真正安全條件成立
  When 玩家點收納箱與乾燥書架
  Then 可做已授權的安全找書／收納操作
  And 不顯示教玩家涉水靠電救書的操作引導
  But 不能因動畫好看而把箱子移到危險區
```

### SEF-BDD-157：兩人收到互補書單線索
- [ ] **Scenario: 兩人收到互補書單線索**
  - **來源**：`AC-005-31`／`V3-AC-08`；**標籤**：@happy-path @critical；**測試鍵**：`ClueComplementary`；**跨層**：`IT`
  - **負向斷言**：不能把完整答案一開始就公開

```gherkin
@happy-path @critical
Scenario: 兩人收到互補書單線索
  Given I 可看書架封面，A 可看店員讀書會名單
  When 兩人各自查看自己合法來源
  Then 個人取得互補且可合併判斷的有效線索
  And 未分享的部分在另一人視角不可見
  But 不能把完整答案一開始就公開
```

### SEF-BDD-158：A 主動共享清單後 I 才可比對
- [ ] **Scenario: A 主動共享清單後 I 才可比對**
  - **來源**：`AC-005-31`／`V3-AC-08`；**標籤**：@error-handling @critical；**測試鍵**：`ClueExplicitShare`；**跨層**：`API`
  - **負向斷言**：不能靠 Preview/動作播放自動完成分享

```gherkin
@error-handling @critical
Scenario: A 主動共享清單後 I 才可比對
  Given A 取得清單但尚未明確點擊分享
  When I 多次讀取 experience 或等待 WS
  Then I 不見未分享的預留書名；A 提交後才同步允許資訊
  And 公開資訊最小化且持久化一份
  But 不能靠 Preview/動作播放自動完成分享
```

### SEF-BDD-159：玩家選錯書仍可重新比對
- [ ] **Scenario: 玩家選錯書仍可重新比對**
  - **來源**：`AC-005-31`／`V3-AC-08`；**標籤**：@frontend @critical；**測試鍵**：`WrongBookRecover`；**跨層**：`ET`
  - **負向斷言**：不能提前提供另一人的私人正確答案

```gherkin
@frontend @critical
Scenario: 玩家選錯書仍可重新比對
  Given 兩人正在找預留書，但 I 選了錯誤封面
  When 按下本人的核對動作
  Then 顯示可理解的重新比對提示且世界中書仍在原位
  And 沒有永久鎖死、錯誤筆數不能當完成任務
  But 不能提前提供另一人的私人正確答案
```

### SEF-BDD-160：取書入箱與放高處由兩個真人完成
- [ ] **Scenario: 取書入箱與放高處由兩個真人完成**
  - **來源**：`AC-005-31`／`V3-AC-08`；**標籤**：@happy-path @critical；**測試鍵**：`PackTwoRealContributions`；**跨層**：`IT`
  - **負向斷言**：不能只看其中一個人點完成便 chapter.completed

```gherkin
@happy-path @critical
Scenario: 取書入箱與放高處由兩個真人完成
  Given I 和 A 都已取得合法的互補線索
  When I 取書放乾箱，A 逐本核對並放至高處
  Then 兩人的真實動作都到齊才完成 sv3-12-pack
  And NPC 只能表演自己的整理，不代任何一位真人
  But 不能只看其中一個人點完成便 chapter.completed
```

### SEF-BDD-161：同本書競態和錯 Revision 不得複製
- [ ] **Scenario: 同本書競態和錯 Revision 不得複製**
  - **來源**：`AC-005-31`／`V3-AC-08`；**標籤**：@error-handling @critical；**測試鍵**：`BookCasNoDuplication`；**跨層**：`API`
  - **負向斷言**：不能同一本書在架上和箱內同時存在

```gherkin
@error-handling @critical
Scenario: 同本書競態和錯 Revision 不得複製
  Given I/A 同時拿同一書架原位物件且都用舊版本
  When 兩個 HTTP 提交同時進入 D1
  Then 只一個合法移動成功並保存 objectId 唯一位置
  And 另一個返回 409 且重載後顯示真實書籍位置
  But 不能同一本書在架上和箱內同時存在
```

### SEF-BDD-162：兩人都願再聊得到同桌結局
- [ ] **Scenario: 兩人都願再聊得到同桌結局**
  - **來源**：`AC-005-32`／`V3-AC-09`；**標籤**：@frontend @critical；**測試鍵**：`EndingMoreTalk`；**跨層**：`ET`
  - **負向斷言**：不能只靠第一人的選擇決定全部人的結局

```gherkin
@frontend @critical
Scenario: 兩人都願再聊得到同桌結局
  Given 書已安全收妥且兩人都各自選 keep-talking
  When 第二名真人提交 sv3-16-final-wish
  Then 僅產生 ev3-01-more-talk，人物靠近同桌、鏡頭聚焦
  And 不自動告白或生成本人聊天訊息
  But 不能只靠第一人的選擇決定全部人的結局
```

### SEF-BDD-163：選聊書得到真實雙書推薦結局
- [ ] **Scenario: 選聊書得到真實雙書推薦結局**
  - **來源**：`AC-005-32`／`V3-AC-09`；**標籤**：@frontend @critical；**測試鍵**：`EndingShareBooks`；**跨層**：`ET`
  - **負向斷言**：不能只更換最後一段文字

```gherkin
@frontend @critical
Scenario: 選聊書得到真實雙書推薦結局
  Given 兩人都不是 quiet-rest 且至少一方選 share-books
  When 第二名真人提交最終意願
  Then 僅產生 ev3-02-book-recommendation，已選兩本書在桌上可推薦
  And 不同書本／鏡頭／NPC 對話與同桌結局有差異
  But 不能只更換最後一段文字
```

### SEF-BDD-164：任一人想獨處時尊重距離
- [ ] **Scenario: 任一人想獨處時尊重距離**
  - **來源**：`AC-005-32`／`V3-AC-09`；**標籤**：@happy-path @critical；**測試鍵**：`EndingQuietRest`；**跨層**：`IT`
  - **負向斷言**：不能以邀請方意願覆蓋對方獨處選擇

```gherkin
@happy-path @critical
Scenario: 任一人想獨處時尊重距離
  Given 其中一位本人選 quiet-rest，另一位選 keep-talking
  When 雙方意願提交後計算結局
  Then 僅產生 ev3-03-gentle-distance，座位分開且仍能聊天
  And 無人被強迫接受同桌親密分鏡
  But 不能以邀請方意願覆蓋對方獨處選擇
```

### SEF-BDD-165：最終意願須兩人各自提交且只能結算一次
- [ ] **Scenario: 最終意願須兩人各自提交且只能結算一次**
  - **來源**：`AC-005-32`／`V3-AC-09`；**標籤**：@error-handling @critical；**測試鍵**：`EndingAtomicConsent`；**跨層**：`API`
  - **負向斷言**：不能在兩份答案尚未齊備時自動替第二人選

```gherkin
@error-handling @critical
Scenario: 最終意願須兩人各自提交且只能結算一次
  Given 第一個玩家已提交最終意願、第二個尚未選
  When 第二個玩家提交並與重送同時抵達
  Then D1 同一筆唯一結局與 chapter.completed 原子寫入
  And 第一人等待仍能聊天、重送不產生第二個 ending
  But 不能在兩份答案尚未齊備時自動替第二人選
```

### SEF-BDD-166：危險淹水優先撤離且聊天保持
- [ ] **Scenario: 危險淹水優先撤離且聊天保持**
  - **來源**：`AC-005-32`／`V3-AC-09`；**標籤**：@happy-path @critical；**測試鍵**：`EndingSafetyOverride`；**跨層**：`IT`
  - **負向斷言**：不能因 fallback 而繞過必要真人授權或結束 Round

```gherkin
@happy-path @critical
Scenario: 危險淹水優先撤離且聊天保持
  Given 兩人接近咖啡結局前水位被權威判定不安全
  When 安全分流觸發並結算本場
  Then 顯示安全撤離而不是留店喝咖啡，Chapter 可合法收尾
  And 配對 Round 仍可聊天、待雙方同意再重玩
  But 不能因 fallback 而繞過必要真人授權或結束 Round
```

### SEF-BDD-167：所有必要節點都要合法 Shot 和素材
- [ ] **Scenario: 所有必要節點都要合法 Shot 和素材**
  - **來源**：`AC-005-33`／`V3-AC-10`；**標籤**：@happy-path @critical；**測試鍵**：`PublisherShotMatrix`；**跨層**：`IT`
  - **負向斷言**：不能用上一張無變化靜圖加不同文字蒙混

```gherkin
@happy-path @critical
Scenario: 所有必要節點都要合法 Shot 和素材
  Given V3 Narrative 有兩人 Entry、共享節點與三種咖啡結尾
  When Publisher 枚舉所有必經 nodeId、bindingId 與條件分支
  Then 每個合法分支都能對到已釘選 Shot、人物、NPC／道具和音效
  And 同一 Area 內容版本與 SHA 均符合 manifest
  But 不能用上一張無變化靜圖加不同文字蒙混
```

### SEF-BDD-168：缺必要素材或未知 Cue 時不能發布
- [ ] **Scenario: 缺必要素材或未知 Cue 時不能發布**
  - **來源**：`AC-005-33`／`V3-AC-10`；**標籤**：@error-handling @critical；**測試鍵**：`PublisherRejectMissing`；**跨層**：`API`
  - **負向斷言**：不能在 Runtime 偷偷回退文字劇情

```gherkin
@error-handling @critical
Scenario: 缺必要素材或未知 Cue 時不能發布
  Given 新 V3 參考未上傳的原創書封、NPC 姿勢或未知 gesture
  When Publisher 驗證 source manifest
  Then 拒發 V3 內容且不影響合法舊版
  And 缺陷列表可指回確切 nodeId、assetId 與原因
  But 不能在 Runtime 偷偷回退文字劇情
```

### SEF-BDD-169：事件失敗需要撤銷虛假成功動畫
- [ ] **Scenario: 事件失敗需要撤銷虛假成功動畫**
  - **來源**：`AC-005-33`／`V3-AC-10`；**標籤**：@frontend @critical；**測試鍵**：`AnimationCommitAuthority`；**跨層**：`ET`
  - **負向斷言**：不能因動畫已播放就認定事件完成

```gherkin
@frontend @critical
Scenario: 事件失敗需要撤銷虛假成功動畫
  Given 玩家對原位物件送出動作，當時 revision 已失效
  When 伺服器拒絕後前端恢復權威快照
  Then 書本／人物回到真實位置，未出現假收納完成
  And 不寫入多餘 EventInstance 或 WS 成功訊息
  But 不能因動畫已播放就認定事件完成
```

### SEF-BDD-170：微動開關不會關掉必要劇情動作
- [ ] **Scenario: 微動開關不會關掉必要劇情動作**
  - **來源**：`AC-005-33`／`V3-AC-10`；**標籤**：@frontend @critical；**測試鍵**：`AmbientStoryMotionSeparated`；**跨層**：`ET`
  - **負向斷言**：不能以關閉微動造成世界狀態難辨

```gherkin
@frontend @critical
Scenario: 微動開關不會關掉必要劇情動作
  Given 玩家關閉書店環境微動，仍觸發拿書和店員端杯
  When Web／Android 播放必要 StoryMotion
  Then 雨水背景循環停止，必要動作仍合法演出或安全略過
  And 回前景不自動重放已完成事件／音效
  But 不能以關閉微動造成世界狀態難辨
```

### SEF-BDD-171：一場完整試玩前其他九篇維持不可玩
- [ ] **Scenario: 一場完整試玩前其他九篇維持不可玩**
  - **來源**：`AC-005-33`／`V3-AC-10`；**標籤**：@error-handling @critical；**測試鍵**：`PublisherGateBEnforced`；**跨層**：`API`
  - **負向斷言**：不能拿 121 個舊 BDD 通過率當作 V3 人工驗收

```gherkin
@error-handling @critical
Scenario: 一場完整試玩前其他九篇維持不可玩
  Given V3 首條仍未由使用者 Web／Android 完整人工核准
  When 系統嘗試將第二至第十篇標為完成發布
  Then 發佈流程或規劃 Gate 阻擋其他九篇的可玩狀態
  And 首條所有必經演出必須真實人工觀察
  But 不能拿 121 個舊 BDD 通過率當作 V3 人工驗收
```

### SEF-BDD-172：六個店內 Area 有不同但一致的環境畫面
- [ ] **Scenario: 六個店內 Area 有不同但一致的環境畫面**
  - **來源**：`AC-005-34`／`V3-AC-11`；**標籤**：@frontend @critical；**測試鍵**：`AreaDedicatedLayers`；**跨層**：`ET`
  - **負向斷言**：不能全區只用單張全景硬裁切或 AI 亂換店面

```gherkin
@frontend @critical
Scenario: 六個店內 Area 有不同但一致的環境畫面
  Given 書店入口、書架、閱讀角、櫃檯、乾燥儲藏和窗邊咖啡有固定地圖
  When 玩家在 Area 之間移動和轉鏡
  Then 各區有相互一致但專屬的背景、遮擋、陰影和可見物件圖層
  And 桌椅、窗與書架位置、店員衣著保持一致
  But 不能全區只用單張全景硬裁切或 AI 亂換店面
```

### SEF-BDD-173：書本原位點擊並打開關閉返回
- [ ] **Scenario: 書本原位點擊並打開關閉返回**
  - **來源**：`AC-005-34`／`V3-AC-11`；**標籤**：@frontend @critical；**測試鍵**：`EmbeddedBookAnimation`；**跨層**：`ET`
  - **負向斷言**：不能常駐漂浮按鈕、星號或物件卡片

```gherkin
@frontend @critical
Scenario: 書本原位點擊並打開關閉返回
  Given 書脊已和書架背景配準並有合法無形 hitShape
  When 玩家點擊書脊、閱讀後關閉
  Then 抽書、翻頁、返回與原背景空位／遮擋一致
  And 不同鏡頭、螢幕比例下點擊區與書脊仍對齊
  But 不能常駐漂浮按鈕、星號或物件卡片
```

### SEF-BDD-174：NPC 腳底貼地、椅桌遮擋正確
- [ ] **Scenario: NPC 腳底貼地、椅桌遮擋正確**
  - **來源**：`AC-005-34`／`V3-AC-11`；**標籤**：@frontend @critical；**測試鍵**：`ActorDepthOcclusion`；**跨層**：`ET`
  - **負向斷言**：不能把 2D 原圖無動作橫移冒充自然坐下

```gherkin
@frontend @critical
Scenario: NPC 腳底貼地、椅桌遮擋正確
  Given 角色從書架走到閱讀角並坐到椅子上
  When 切換鏡位並播放 sitting pose
  Then 人物穿過對應前景時有合理遮擋、陰影及透視
  And NPC 頭部與杯子不浮在場景外
  But 不能把 2D 原圖無動作橫移冒充自然坐下
```

### SEF-BDD-175：書從架上被拿走後兩端不再重複顯示
- [ ] **Scenario: 書從架上被拿走後兩端不再重複顯示**
  - **來源**：`AC-005-34`／`V3-AC-11`；**標籤**：@happy-path @critical；**測試鍵**：`EmbeddedWorldAuthoritative`；**跨層**：`IT`
  - **負向斷言**：不能繪圖資源快取覆蓋權威已移動物件

```gherkin
@happy-path @critical
Scenario: 書從架上被拿走後兩端不再重複顯示
  Given 同一書物件在 D1 世界狀態中已移到箱子
  When 兩人各自更新不同角度的 Area snapshot
  Then 兩邊書架同位置顯示空位、箱內有書，沒有重複書
  And 世界狀態 Revision 與 client animation cue 對應
  But 不能繪圖資源快取覆蓋權威已移動物件
```

### SEF-BDD-176：縮放與裁切的觸控 hitShape 不越權
- [ ] **Scenario: 縮放與裁切的觸控 hitShape 不越權**
  - **來源**：`AC-005-34`／`V3-AC-11`；**標籤**：@error-handling @critical；**測試鍵**：`HitShapeCameraTransform`；**跨層**：`API`
  - **負向斷言**：不能因前端錯座標觸發隱藏私有事件

```gherkin
@error-handling @critical
Scenario: 縮放與裁切的觸控 hitShape 不越權
  Given 某書僅在合法 Area/狀態允許觸發
  When 玩家在 Web／Android 不同尺寸觸控書附近物件
  Then 只有正確本體 hitShape 可啟動該書操作
  And 伺服器仍重驗權威資格及角色身份
  But 不能因前端錯座標觸發隱藏私有事件
```

### SEF-BDD-177：首次 AI 全身候選建立正式 Rig 而非五張整圖
- [ ] **Scenario: 首次 AI 全身候選建立正式 Rig 而非五張整圖**
  - **來源**：`AC-005-35`／`V3-AC-12`；**標籤**：@error-handling @critical；**測試鍵**：`RigFirstAdoption`；**跨層**：`API`
  - **負向斷言**：不能用沒有 Rig 的半完成成品替換正式角色

```gherkin
@error-handling @critical
Scenario: 首次 AI 全身候選建立正式 Rig 而非五張整圖
  Given AI 玩家核准一張 3:4 全身候選並擁有合法私人素材
  When 本人首次採用時執行分層、局部表情、骨架及少量必要姿勢建檔
  Then 完整 ready ActorRigPackage 與原有玩家身份畫風一致
  And 保留舊角色直至新包完整驗證通過，途中故障可受控重試
  But 不能用沒有 Rig 的半完成成品替換正式角色
```

### SEF-BDD-178：Rig 五種情緒與自然坐讀拿書動作
- [ ] **Scenario: Rig 五種情緒與自然坐讀拿書動作**
  - **來源**：`AC-005-35`／`V3-AC-12`；**標籤**：@frontend @critical；**測試鍵**：`RigFiveExpressionsAndPose`；**跨層**：`ET`
  - **負向斷言**：不能以五張整圖重生代替新版可動介面驗證

```gherkin
@frontend @critical
Scenario: Rig 五種情緒與自然坐讀拿書動作
  Given 一位免費與一位 AI 角色有同版有效 Rig、表情與姿態
  When 播放 neutral、smile、surprised、thoughtful、concerned 及 sit/read/hold
  Then 表情辨識、臉型一致、動作自然且書本綁合法手部錨點
  And 坐姿椅背前景遮擋不穿幫且舊版近景品質不退化
  But 不能以五張整圖重生代替新版可動介面驗證
```

### SEF-BDD-179：Ready 後切角色重連和切表情不再產圖
- [ ] **Scenario: Ready 後切角色重連和切表情不再產圖**
  - **來源**：`AC-005-35`／`V3-AC-12`；**標籤**：@frontend @critical；**測試鍵**：`RigNoGeminiDuringPlay`；**跨層**：`ET`
  - **負向斷言**：不能把已存的同版 Rig 判定為需要再次製作

```gherkin
@frontend @critical
Scenario: Ready 後切角色重連和切表情不再產圖
  Given 兩位玩家已使用驗證 ready 的 immutable Rig Package
  When 換表情、重新選回同角色、重連或新場次進入
  Then Gemini 呼叫次數為零且只讀已授權版本化素材
  And 場次／聊天／角色身份與資產 hash 無混包
  But 不能把已存的同版 Rig 判定為需要再次製作
```

### SEF-BDD-180：不同玩家只共用有授權的骨架與服裝素材
- [ ] **Scenario: 不同玩家只共用有授權的骨架與服裝素材**
  - **來源**：`AC-005-35`／`V3-AC-12`；**標籤**：@happy-path @critical；**測試鍵**：`RigSharedAssetsAndPrivacy`；**跨層**：`IT`
  - **負向斷言**：不能為每位玩家複製五張全身角色圖作公用衣物

```gherkin
@happy-path @critical
Scenario: 不同玩家只共用有授權的骨架與服裝素材
  Given 多位玩家選同一免費角色與通用骨架，道具由公共目錄提供
  When 兩人同時讀共用資產及個人 AI Rig
  Then 共用素材僅有一份來源，私人臉／master 仍依 owner 驗證
  And 無法從另一人的 manifest 取得私有 R2 key 或來源照片
  But 不能為每位玩家複製五張全身角色圖作公用衣物
```

### SEF-BDD-181：Puppet 記憶體容量與未來 MVP-005 可擴充
- [ ] **Scenario: Puppet 記憶體容量與未來 MVP-005 可擴充**
  - **來源**：`AC-005-35`／`V3-AC-12`；**標籤**：@frontend @critical；**測試鍵**：`RigQualityStorageGate`；**跨層**：`ET`
  - **負向斷言**：不能宣稱分層一定省空間，亦不可降低五官相似度與解析度

```gherkin
@frontend @critical
Scenario: Puppet 記憶體容量與未來 MVP-005 可擴充
  Given 已核准原 AI 全身生成圖與對照的新版 Rig、相同照片／畫風測資存在
  When 比對 1 免費、1 AI 的 Web／Android 表情、站坐與素材指標
  Then 記錄每名 AI 總 R2 bytes、Gemini 次數及失敗重試、讀取與記憶體／畫面品質
  And 來源可版本化為 ai-full-body 與未來 ai-face-only 且不需故事特殊邏輯
  But 不能宣稱分層一定省空間，亦不可降低五官相似度與解析度
```

### V3 新增需求追溯（必須再對應 TDD，新增項未實作）

| MVP | SPEC | V3 BDD 場景 | 數量 |
|---|---|---|---:|
| `AC-005-24` | `V3-AC-01` | `SEF-BDD-122`、`SEF-BDD-123`、`SEF-BDD-124`、`SEF-BDD-125`、`SEF-BDD-126` | 5 |
| `AC-005-25` | `V3-AC-02` | `SEF-BDD-127`、`SEF-BDD-128`、`SEF-BDD-129`、`SEF-BDD-130`、`SEF-BDD-131` | 5 |
| `AC-005-26` | `V3-AC-03` | `SEF-BDD-132`、`SEF-BDD-133`、`SEF-BDD-134`、`SEF-BDD-135`、`SEF-BDD-136` | 5 |
| `AC-005-27` | `V3-AC-04` | `SEF-BDD-137`、`SEF-BDD-138`、`SEF-BDD-139`、`SEF-BDD-140`、`SEF-BDD-141` | 5 |
| `AC-005-28` | `V3-AC-05` | `SEF-BDD-142`、`SEF-BDD-143`、`SEF-BDD-144`、`SEF-BDD-145`、`SEF-BDD-146` | 5 |
| `AC-005-29` | `V3-AC-06` | `SEF-BDD-147`、`SEF-BDD-148`、`SEF-BDD-149`、`SEF-BDD-150`、`SEF-BDD-151` | 5 |
| `AC-005-30` | `V3-AC-07` | `SEF-BDD-152`、`SEF-BDD-153`、`SEF-BDD-154`、`SEF-BDD-155`、`SEF-BDD-156` | 5 |
| `AC-005-31` | `V3-AC-08` | `SEF-BDD-157`、`SEF-BDD-158`、`SEF-BDD-159`、`SEF-BDD-160`、`SEF-BDD-161` | 5 |
| `AC-005-32` | `V3-AC-09` | `SEF-BDD-162`、`SEF-BDD-163`、`SEF-BDD-164`、`SEF-BDD-165`、`SEF-BDD-166` | 5 |
| `AC-005-33` | `V3-AC-10` | `SEF-BDD-167`、`SEF-BDD-168`、`SEF-BDD-169`、`SEF-BDD-170`、`SEF-BDD-171` | 5 |
| `AC-005-34` | `V3-AC-11` | `SEF-BDD-172`、`SEF-BDD-173`、`SEF-BDD-174`、`SEF-BDD-175`、`SEF-BDD-176` | 5 |
| `AC-005-35` | `V3-AC-12` | `SEF-BDD-177`、`SEF-BDD-178`、`SEF-BDD-179`、`SEF-BDD-180`、`SEF-BDD-181` | 5 |
| **合計** | **V3-AC-01～12** | **SEF-BDD-122～181** | **60** |

**跨 MVP 的責任分界**：`MVP-005-AvatarWithDating.md` 未來才做捏臉／AI face-only／換裝／衣物權益；本階段 V3-AC-12 只驗證 Rig 介面可版本化、共用骨架和動畫可重用、未來可接受其他 identity source，**不在現在實作未來完整 MVP-005**。所有儲存容量／生成效率數字皆需實測，不可填假 KPI；不降低已核准 AI 臉部、全身畫風及五情緒品質。


## 2026-11-17 RiskAudit Phase 4 補強 Gherkin（SEF-BDD-182～191，10 場）

**依使用者 `SEF-V3-RQ-01=B` 決策補齊**：上段 BDD 122～181 60 場沿用；本段新增 10 個風險邊界場景，與 `SEF-V3-GAP-01～10`／TDD 正式追加測試一對一。涵蓋 AI Rig 首次建檔重入、R2 孤兒、私人線索、拒絕後安全撤離、結局競態、跨平台 hitShape、Publisher 可達路徑、外觀版控、Android 低記憶體與免費16款身份保真。**總 BDD 191（原121＋V3 60＋風險10）場；V3 規劃 70 場、實際 0/70 驗收；不得將本段寫入當成產品 Gate B 已過。**

### SEF-BDD-182：兩個裝置同時首次製作 AI Rig 只產生一份不可變包
- [ ] **Scenario: 兩個裝置同時首次製作 AI Rig 只產生一份不可變包**
  - **來源**：`AC-005-35`／`V3-AC-12`／`SEF-V3-GAP-01`；**既有場景交叉驗證**：SEF-BDD-177、179；**標籤**：@critical @edge-case

```gherkin
@critical @edge-case
Scenario: 兩個裝置同時首次製作 AI Rig 只產生一份不可變包
  Given 同一 AI 玩家有已核准的全身 Master、來源 SHA 和 rigSpecVersion，兩部裝置同時發起首次建檔
  When 兩筆同來源版本的首次 Rig 建檔請求並行到達 Worker
  Then 伺服器只有一個受控建檔任務和一份經驗證的 ready Manifest，重複者重用已完成步驟
  And Gemini 必需產圖呼叫數不因雙裝置重送增加，不產生兩個不同 owner／來源混包
  But 任一中途失敗或尚未 ready 的套組不得切換本人正式化身
```

### SEF-BDD-183：Rig 製作中斷後重試只補缺少圖層且清理孤兒
- [ ] **Scenario: Rig 製作中斷後重試只補缺少圖層且清理孤兒**
  - **來源**：`AC-005-35`／`V3-AC-12`／`SEF-V3-GAP-02`；**既有場景交叉驗證**：SEF-BDD-177、181；**標籤**：@critical @error-handling

```gherkin
@critical @error-handling
Scenario: Rig 製作中斷後重試只補缺少圖層且清理孤兒
  Given 初次製作一半的 AI Rig 部分分層已驗證 SHA，部分上傳失敗而原正式化身仍可用
  When 本人在有效授權下重新執行同版 Rig 建檔並進行受控孤兒掃描
  Then 已驗證成功圖層直接重用，只重試缺少或不合格部分，完成後唯一新包才可 ready
  And 僅清除符合 owner、未被 ready Manifest 引用、非未知環境且已判定無引用的孤兒
  But 不得誤刪已 ready 或其他玩家的私人 R2 圖檔，也不得因重試無限增加圖片
```

### SEF-BDD-184：私有情緒與書籍資料不因快取重連流向另一人
- [ ] **Scenario: 私有情緒與書籍資料不因快取重連流向另一人**
  - **來源**：`AC-005-26`／`V3-AC-03`／`SEF-V3-GAP-03`；**既有場景交叉驗證**：SEF-BDD-129、136；**標籤**：@critical @error-handling

```gherkin
@critical @error-handling
Scenario: 私有情緒與書籍資料不因快取重連流向另一人
  Given A 已選擇虛構角色共鳴原因與一本書，尚未主動分享；I 的手機有舊快取並經 WS 重連
  When I 重讀 experience、接收 events 補漏、讀已發布內容投影及快取重驗
  Then I 只能收到本人的劇情進度與合法的 A 公開可見動作，沒有 A 未分享的情緒和書籍答案
  And A 後續親自分享時，I 才能看明確授權的書籍摘要且不見私人共鳴原因
  But 不允許把完整私人 Track 或 raw Manifest 送給 Client 再只靠 UI 隱藏
```

### SEF-BDD-185：拒絕搭話後遇洪水仍可安全撤離且不被迫親密
- [ ] **Scenario: 拒絕搭話後遇洪水仍可安全撤離且不被迫親密**
  - **來源**：`AC-005-30`／`V3-AC-07`／`SEF-V3-GAP-04`；**既有場景交叉驗證**：SEF-BDD-137、140、154；**標籤**：@critical @alternative-path

```gherkin
@critical @alternative-path
Scenario: 拒絕搭話後遇洪水仍可安全撤離且不被迫親密
  Given I 未搭話或 A 已選 decline，兩個 Track 已達合法雨情前置，入口水位突然超標
  When 伺服器推進安全事件並觸發 safety-exit
  Then 兩人依自己的合法畫面安全撤離且可自然完成本章，Round 仍允許聊天與本人退出
  And 拒絕仍然有效，沒有 NPC 代兩人決定是否交往或製造假訊息
  But 不得要求先同意私人聊天才進入雨情安全事件
```

### SEF-BDD-186：最後意願與水位危險及 Room 結束同時發生只產一個結果
- [ ] **Scenario: 最後意願與水位危險及 Room 結束同時發生只產一個結果**
  - **來源**：`AC-005-32`／`V3-AC-09`／`SEF-V3-GAP-05`；**既有場景交叉驗證**：SEF-BDD-164、165、166；**標籤**：@critical @edge-case

```gherkin
@critical @edge-case
Scenario: 最後意願與水位危險及 Room 結束同時發生只產一個結果
  Given I/A 正在提交最後意願，Room 正在結束或共享水位已進入危險，且相同 requestId 被重送
  When 所有提交在同一有效 D1 CAS 與 Round active 檢查交錯執行
  Then 合法狀態最多只有一個安全結局或依終了狀態停止推進，不會同時寫入咖啡和撤離 Ending
  And 已 ended 的 Round 不再接受劇情動作，未結束 Round 仍保留真聊天權限
  But 不能因 WS 重送、先播端杯動畫或另一方請求而產出兩個完成紀錄
```

### SEF-BDD-187：縮放轉鏡和快速連點書脊只操作一個真正物件
- [ ] **Scenario: 縮放轉鏡和快速連點書脊只操作一個真正物件**
  - **來源**：`AC-005-34`／`V3-AC-11`／`SEF-V3-GAP-06`；**既有場景交叉驗證**：SEF-BDD-173、175、176；**標籤**：@critical @frontend @edge-case

```gherkin
@critical @frontend @edge-case
Scenario: 縮放轉鏡和快速連點書脊只操作一個真正物件
  Given Web／Android 在不同螢幕比例及相機縮放下顯示原位書脊，該書仍在書架
  When 玩家快速連點接近書脊邊界並與另一方同時操作箱內物件
  Then hitShape 跟著 camera/viewport 轉換，只有被按中之合法物件觸發且權威 CAS 只成功一次
  And 兩端同步顯示書架空位與箱中真實書本並保留正確遮擋
  But 不能將點擊傳到相鄰私有物件、隱藏事件或讓同本書重複出現
```

### SEF-BDD-188：三種咖啡結局或撤離分支缺一項資產都拒發
- [ ] **Scenario: 三種咖啡結局或撤離分支缺一項資產都拒發**
  - **來源**：`AC-005-33`／`V3-AC-10`／`SEF-V3-GAP-07`；**既有場景交叉驗證**：SEF-BDD-126、151、167、168；**標籤**：@critical @error-handling

```gherkin
@critical @error-handling
Scenario: 三種咖啡結局或撤離分支缺一項資產都拒發
  Given 新 V3 Publisher 宣告三種最終意願結局及 water danger safety-exit，第三結局缺必要 NPC pose 或安全撤離缺 Area 圖層
  When Publisher 展開全部可達條件路徑檢驗 node、shot、actor、cue、資產 SHA
  Then Publisher 拒絕整份不可完整發布的 V3 新版本，指出欠缺之確切結局節點和資產
  And 既有合法 V2 已釘選 Session 仍可讀原版本
  But 不能只驗一條 happy path 或把無素材分支退化為文字框
```

### SEF-BDD-189：未来不同身份來源不得偷偷替換已釘選的 AI 全身角色
- [ ] **Scenario: 未来不同身份來源不得偷偷替換已釘選的 AI 全身角色**
  - **來源**：`AC-005-35`／`V3-AC-12`／`SEF-V3-GAP-08`；**既有場景交叉驗證**：SEF-BDD-177、179、180；**標籤**：@critical @error-handling

```gherkin
@critical @error-handling
Scenario: 未来不同身份來源不得偷偷替換已釘選的 AI 全身角色
  Given 某場 StorySession 已固定本人 ai-full-body Rig 的 owner、sourceHash、rigVersion、外觀版本
  When Client 企圖注入尚未支援或不相容的 ai-face-only 欄位與錯誤來源版本，並重新讀取遊玩快照
  Then 後端拒絕未知來源和不合版本組合，原場固定的合法角色外觀不被改寫
  And 未來真的完成 MVP-005 後也必須按新版本及使用者合法選角流程，不依 Client 直接切身份
  But 不能混用另一玩家臉部、舊版髮型／衣服或私人 R2 keys
```

### SEF-BDD-190：Android 記憶體不足恢復同一個 Rig 不生新圖
- [ ] **Scenario: Android 記憶體不足恢復同一個 Rig 不生新圖**
  - **來源**：`AC-005-35`／`V3-AC-12`／`SEF-V3-GAP-09`；**既有場景交叉驗證**：SEF-BDD-178、179、181；**標籤**：@critical @frontend @edge-case

```gherkin
@critical @frontend @edge-case
Scenario: Android 記憶體不足恢復同一個 Rig 不生新圖
  Given Android 前景顯示已 ready 的 AI Rig，切至背景遭 OS 回收部分記憶體與圖層
  When 玩家返回遊戲、重新載入已授權同版 Rig 並切換五情緒
  Then 仍顯示原有五官與姿態、正確遮擋與同版資產 hash；失敗時提供安全等待／重載
  And 記錄真裝置記憶體與載入延遲，不會因重新進場或表情切換呼叫 Gemini
  But 缺必要素材不能假裝完整 ready，也不能顯示混雜其他人的圖層
```

### SEF-BDD-191：免費十六款逐一保留已核准身份與原衣裝
- [ ] **Scenario: 免費十六款逐一保留已核准身份與原衣裝**
  - **來源**：`AC-005-35`／`V3-AC-12`／`SEF-V3-GAP-10`；**既有場景交叉驗證**：SEF-BDD-177、178、181；**標籤**：@critical @frontend @edge-case

```gherkin
@critical @frontend @edge-case
Scenario: 免費十六款逐一保留已核准身份與原衣裝
  Given 正式免費素材目錄包含男8女8共16個穩定 ID 和已核准的角色外觀／來源 hash
  When 逐一為每款建置 Rig 並在 Web／Android 切五表情、站坐讀書與持物
  Then 16 款全部維持原五官、髮型、上身衣裝、氣質和穩定 ID，必要新增分層不重畫既有身份
  And 每款保留可驗 SHA／來源／真機視覺對照；未通過任何一款都不得把全16款視為已驗收
  But 不能只測第一款 POC 就將其餘15款標為 ready 或清除舊正式素材
```

### RiskAudit GAP → BDD 追溯

| 缺漏 | BDD | 設計所屬需求 | 新增真測試 |
|---|---|---|---|
| `SEF-V3-GAP-01` | `SEF-BDD-182` | `AC-005-35`／`V3-AC-12` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-02` | `SEF-BDD-183` | `AC-005-35`／`V3-AC-12` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-03` | `SEF-BDD-184` | `AC-005-26`／`V3-AC-03` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-04` | `SEF-BDD-185` | `AC-005-30`／`V3-AC-07` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-05` | `SEF-BDD-186` | `AC-005-32`／`V3-AC-09` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-06` | `SEF-BDD-187` | `AC-005-34`／`V3-AC-11` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-07` | `SEF-BDD-188` | `AC-005-33`／`V3-AC-10` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-08` | `SEF-BDD-189` | `AC-005-35`／`V3-AC-12` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-09` | `SEF-BDD-190` | `AC-005-35`／`V3-AC-12` | 依 TDD V3 稽核補強章節 |
| `SEF-V3-GAP-10` | `SEF-BDD-191` | `AC-005-35`／`V3-AC-12` | 依 TDD V3 稽核補強章節 |

**狀態優先序**：歷史 BDD 121 場及其完成紀錄不可覆寫；V3 70 場仍全部待實作，新的 Phase 5 只表示規劃可交開發，不代表真 Web／Android 或真人操作已通過。
