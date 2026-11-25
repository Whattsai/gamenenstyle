# SPEC-001-RainBookshopV4 雨聲書店 V4 — BDD 場景規格

**SPEC 來源**：[SPEC-001-RainBookshopV4](../specs/SPEC-001-RainBookshopV4.md)
**作者來源**：[rain-bookshop-v4-draft.json](../requirements/rain-bookshop-v4-draft.json)；執行細則依 SPEC §6.2–6.4。
**狀態**：規劃已確認；待 well-done 實作（0 完成）。

## Feature 描述

作為兩名真實配對玩家，我想以各自視角探索同一座書店、自然破冰並合作救書，以便有完整、不強迫聊天的共同故事體驗。

## 前端 UX 實作進度

整體：0/42 @frontend 場景（0%）；以下 checkbox 是唯一實作進度，不保存每日流水帳。所有畫面案例均須 Web／Android 分別驗證。

| 區域 | 待開始 | 完成 |
|---|---:|---:|
| 探索 | 12 | 0 |
| 破冰 | 7 | 0 |
| 救書 | 12 | 0 |
| 結局／小票 | 7 | 0 |
| 平台／清理 | 4 | 0 |

## Background（前置條件）

```gherkin
Feature: 雨聲書店 V4
  Background:
    Given 兩名成年真實使用者有合法配對Round、有效Session及ready化身
    And V4原稿經正式內容校驗、以版本及SHA釘選
    And 使用者決策RQ-01～04與可配置倒數已確認
```

## BDD 場景

### Happy Path — 正常流程

- [ ] **Scenario: RB4-BDD-001 EnterStore**
  - SPEC：`RB4-AC-001`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 兩位玩家各自釘選V4且尚未入店
  When I點門把且A點傘桶
  Then I與A分別到合法下一節點
  And 另一方未操作前其Track不變
  And 原場景融圖、門鈴與原文依角色呈現
  ```

- [ ] **Scenario: RB4-BDD-002 NavigateAreas**
  - SPEC：`RB4-AC-001`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 本人可探索目前區域
  When 左右導航及小地圖選合法相鄰區
  Then 鏡位與Area依合法鄰接更新
  And 暖金點只示本人合法未探索或新事件
  And 不顯示平鋪移動按鈕海或漂浮星號
  ```

- [ ] **Scenario: RB4-BDD-005 BookCatalog**
  - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 20本書正式目錄可用
  When 逐一在5區開書並翻至末頁
  Then 16經典和4盲書ID、區域、素材符合原稿
  And 全文、卡片、字條、書籤與共鳴原文逐書相等
  And 合法預覽合回原位且不推進
  ```

- [ ] **Scenario: RB4-BDD-006 BlindBook**
  - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 4盲書尚未揭封
  When 滑動各封條、取消、成功揭封後重連
  Then 揭封前只有合法包裝三標籤
  And 有效揭封後才投影該書內容
  And 取消／重送不誤選、不揭另一方私密書
  And 未揭封 metadata／回放與素材授權同樣隔離，不能從其他 transport 取得書名或原文
  ```

- [ ] **Scenario: RB4-BDD-008 Resonance**
  - SPEC：`RB4-AC-002`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given A選定草稿任一本書
  When 逐一選該書三項共鳴之一
  Then 只提交該書合法選項
  And 原文內心獨白對本人呈現
  And 他人看不到未分享共鳴且預覽不等於選擇
  ```

- [ ] **Scenario: RB4-BDD-009 VinylSync**
  - SPEC：`RB4-AC-003`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 兩方均在本場且各自音效偏好不同
  When 合法切換3曲並重連
  Then 共享曲目以權威版本同步
  And 淡換及原文提示正確、不強制他方開聲音
  And 背景停止播放器、回前景不自動播放
  ```

- [ ] **Scenario: RB4-BDD-011 FogWindow**
  - SPEC：`RB4-AC-003`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 窗區可見雨勢
  When 擦霧查看3階段雨勢並留下4種合法符號
  Then 擦霧純呈現不誤提交
  And 符號由明確操作建立共享版本
  And 離窗後／替換／轉場只依已確認生命週期投影
  ```

- [ ] **Scenario: RB4-BDD-013 SameDifferentBook**
  - SPEC：`RB4-AC-004`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 兩人各自完成正式選書
  When 測同一本與不同一本兩路
  Then 以已提交ID比對
  And I走iv4-04-same或diff及原文
  And 他人未提交時不揭露、不代選
  ```

- [ ] **Scenario: RB4-BDD-014 TissueDistance**
  - SPEC：`RB4-AC-004`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given I可接近閱讀角
  When 拖面紙到近／遠合法位置後A各選收下／不用
  Then 距離與原文cue依實際手勢
  And A收不收面紙不等於是否聊天
  And 錯區或重送不提交額外行為
  ```

- [ ] **Scenario: RB4-BDD-017 QuestionCard**
  - SPEC：`RB4-AC-005`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 雙方已進warm-track
  When 依場次種子從4題釘選1題並各自回答
  Then 同場重連不重抽
  And 第一份答案只本人可見
  And 雙方提交後同時揭曉同頻／反差、到warm節點
  And HTTP／WS／事件回放不得泄漏未揭曉答案
  ```

- [ ] **Scenario: RB4-BDD-019 ChatSuggestions**
  - SPEC：`RB4-AC-005`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 劇情依8個適用情境進展
  When 逐情境打開聊天、點一則或自由聊天
  Then 各情境3句原文及合法篩選
  And 未點不發送、點擊由真人送出
  And 聊天仍可用且不冒充NPC或對方
  ```

- [ ] **Scenario: RB4-BDD-020 ClerkPersona**
  - SPEC：`RB4-AC-006`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given I熟客與A避雨生客各自入店
  When 各試3種招呼及4組危機後致謝
  Then 角色分眾原文與表情正確
  And 阿澄赴入口防洪切電，不站原地觀望
  And S/A×warm/quiet原文匹配且不代發真人訊息
  ```

- [ ] **Scenario: RB4-BDD-021 DirectorTrigger**
  - SPEC：`RB4-AC-007`；標籤：@happy-path @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given I/A尚未全部達原稿warm/respect與warm/quiet
  When 兩方並行提交最後節奏點
  Then 滿足雙條件才觸發且warm必先完成提問卡
  And 同場只建立一次director事件及ready
  And 未完成彩蛋不阻塞、非按鈕觸發
  ```

- [ ] **Scenario: RB4-BDD-022 StormPresentation**
  - SPEC：`RB4-AC-007`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 伺服器已提交導演事件
  When 兩端接cue或斷線重連
  Then 原稿閃光、雷聲、冷鏡、黑膠停、雨聲、水痕及台詞
  And 原合法鏡位與權威世界一致
  And 重連還原當前狀態不重播舊cue或假提交
  ```

- [ ] **Scenario: RB4-BDD-023 ReadyGate**
  - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 救書ready且一方尚未接手電筒
  When 單方先ready後雙方並行ready
  Then 單方等待不扣秒
  And 雙ready原子建立唯一deadline與題組
  And 雙端同一權威倒數並顯示原文等待提示
  ```

- [ ] **Scenario: RB4-BDD-025 RescueSetPin**
  - SPEC：`RB4-AC-008`；標籤：@happy-path @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 場次尚未抽題組
  When 種子抽選兩組各4步並重連
  Then 只釘選原兩組之一
  And 每步書ID與區域、線索文字符合草稿
  And 重連／重送不重抽且不向未授權方回完整解答
  And set A 第1、3本保留在 shelves 兩個不同位置；四書台不等於四不同 Area，不更改原稿
  ```

- [ ] **Scenario: RB4-BDD-026 RescueSteps**
  - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 任一原題組第1或第2步
  When A分享線索、I跨合法區抽書上滑、A收書裝袋上架
  Then 權威狀態依角色與步驟轉移
  And 只有合法完整上架計1本
  And 原文成功回饋、無危險入口操作
  ```

- [ ] **Scenario: RB4-BDD-027 ReverseClues**
  - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 已完成前兩本
  When I拾取並分享第3/4本規則、A正確放下層／上層及左→右→封條
  Then 反轉線索只合法分享才揭露
  And 第3本下層、第4本完整鎖扣才增加計數
  And 兩組原文toast及合法結果完整
  And 三扣操作順序錯誤後可重試且已放書保持；只有完整正確封箱才增加成功數
  ```

- [ ] **Scenario: RB4-BDD-029 QuickCallouts**
  - SPEC：`RB4-AC-008`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 救書中雙方各有6句快捷
  When 逐句點選並嘗試偽造他方ID
  Then 只顯示本人合法原文
  And 明確點擊才發舞台泡泡
  And 不寫假真人聊天、不洩未分享答案
  ```

- [ ] **Scenario: RB4-BDD-034 GradeS**
  - SPEC：`RB4-AC-009`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 4本在期限內完成
  When 伺服器提交最後合法封箱
  Then 立即S不等歸零
  And 播放原文及布丁演出
  And 走書籤／最終意願而非屋簷
  ```

- [ ] **Scenario: RB4-BDD-038 Bookmark**
  - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given S/A已結算
  When 逐書三句書籤選一，選填0/20字並各自提交
  Then 沿用草稿原句與本人短語
  And 未合法公開前對方看不到
  And 留書結局可原位翻對方已授權書籤
  And 未授權 note 不得由素材、歷史事件或通知取得
  ```

- [ ] **Scenario: RB4-BDD-040 WishMatrix**
  - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given S/A兩方書籤已完成
  When 覆核3×3共9種最終意願組合
  Then 兩人keep-talking才ev4-01
  And 無quiet且至少一share-books才ev4-02
  And 任一quiet即ev4-03；第一份未揭露
  ```

- [ ] **Scenario: RB4-BDD-041 EndingArt**
  - SPEC：`RB4-AC-010`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 四種結局各已合法提交
  When 看場景光色、距離、原文、互動並重連
  Then 四結局各自正式鏡位與素材
  And S/A對應致謝與書籤，B專屬屋簷
  And 重連不退回結局前，不出現規格文字
  ```

- [ ] **Scenario: RB4-BDD-044 ReceiptBadges**
  - SPEC：`RB4-AC-011`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 四印章各有獨立成立或不成立事實
  When 測同書／換曲／對方見符號／quiet+S/A
  Then 各印章只對應原稿條件
  And 不成立不顯示、重送不重複
  And 小票無真實姓名、Email、照片、私密Profile或未授權內容
  And 印章依當前符號實際呈現見證而非背景讀取或自我見證
  ```

- [ ] **Scenario: RB4-BDD-045 NaturalCompletion**
  - SPEC：`RB4-AC-011`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 本場已結局、Round仍active
  When 自然完成後聊天、單方同意／撤回再雙方同意下一場
  Then 不額外要求完成按鈕或支線
  And 聊天仍可用；雙方同意才建新場
  And 新場釘選合法版本、舊投影與cue清除
  ```

- [ ] **Scenario: RB4-BDD-049 AvatarReuse**
  - SPEC：`RB4-AC-012`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 16免費角色及既有ready AI套組
  When 切換4姿態5表情、重連與失權
  Then 保持已核准身份／外觀、資產共用
  And 切換或重連不重產
  And 失權清圖；真provider證據與回放分開
  And 必要真 provider 質量及成本證據不可由回放代簽
  ```

- [ ] **Scenario: RB4-BDD-051 GateA**
  - SPEC：`RB4-AC-012`；標籤：@happy-path @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given V4正式候選與真環境測試
  When 核對全部AC、兩題組、四結局及必要平台
  Then 真D1/R2/DO與HTTP/WS有精確證據
  And Web/Android及素材/內容/權限/效能逐項核對
  And 未驗或失敗不得以局部測試通過代簽
  And 16經典、音樂與封面逐項核對使用權，缺權利或任一真環境證據不得發布或代簽
  ```

- [ ] **Scenario: RB4-BDD-055 CleanReplay**
  - SPEC：`RB4-AC-014`；標籤：@happy-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 清理完成且正式索引只剩V4
  When 新配對、進場、結局、聊天、重玩與退出
  Then 舊版不可選、無舊SHA或歷史恢復
  And V4完整可玩、配對/聊天/退出維持
  And 所有Gate證據齊全才可結案與進下一SPEC
  ```

### Alternative Path — 替代流程

- [ ] **Scenario: RB4-BDD-010 AmbientExplore**
  - SPEC：`RB4-AC-003`；標籤：@alternative-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 玩家等待對方主線操作
  When 查看小黑板、5則留言及阿澄3話題
  Then 所有原文及合法區域可用
  And 小黑板布丁伏筆保留
  And 探索不阻塞對方、非必經主線
  ```

- [ ] **Scenario: RB4-BDD-015 GiveSpaceReverse**
  - SPEC：`RB4-AC-004`；標籤：@alternative-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given I選扶書籤留白
  When A各選主動聊書／音樂／保持安靜
  Then I退開且A有獨立主動權
  And 聊書與音樂進各自原節點
  And A保持安靜走respect/quiet、無假聊天
  ```

- [ ] **Scenario: RB4-BDD-016 DeclineApproach**
  - SPEC：`RB4-AC-004`；標籤：@alternative-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given I選面紙或借書接近
  When A選open-up／books-only／decline
  Then 依草稿對應route與原文
  And 拒絕不出現假聊天及不強制撮合
  And 安靜軌道仍能合法達導演
  ```

- [ ] **Scenario: RB4-BDD-032 PauseReconnect**
  - SPEC：`RB4-AC-008`；標籤：@alternative-path @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 一方斷線15秒已暫緩
  When 雙方恢復可操作、重複斷線多次
  Then 自動恢復且不要求確認按鈕
  And 保存剩餘時間、無次數上限、不補扣暫緩秒
  And 重連／冷啟動不重設90秒
  And 閒置者重新操作或斷線者返回可操作畫面即恢復，仍活動者不用操作；兩方皆閒置則兩方均須重新參與
  And 首次恢復操作只同步不計救書成果；持書、槽位及扣件進度均由權威狀態還原
  ```

- [ ] **Scenario: RB4-BDD-052 GateB**
  - SPEC：`RB4-AC-013`；標籤：@alternative-path @critical @manual
  - 涉及：Gate B／Verification

  ```gherkin
  Given Gate A已完成且有精確版本SHA
  When 使用者實際遊玩並確認或拒絕
  Then 只有明確核准精確版本才可清理
  And 拒絕或未確認保留V3及舊場次
  And 自動測試不能代簽
  ```

### Error Handling — 錯誤處理

- [ ] **Scenario: RB4-BDD-004 GestureFence**
  - SPEC：`RB4-AC-001`；標籤：@error-handling @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 鏡頭縮放、手勢衝突或請求pending
  When 快速連點、滑動、拖出、取消或送舊revision
  Then 一次合法意圖最多一次提交
  And 無效命中或取消不提交且物件復位
  And 409重新同步、未知結果只同ID查receipt
  ```

- [ ] **Scenario: RB4-BDD-007 InterestBadge**
  - SPEC：`RB4-AC-002`；標籤：@error-handling @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 雙方有不同未公開興趣
  When 以本人身份讀書架或竄改owner
  Then 推薦貼紙只依本人已儲存興趣
  And raw DTO不含對方興趣或未揭封內容
  And 越權讀取拒絕且不快取私人資料
  ```

- [ ] **Scenario: RB4-BDD-018 QuestionCardGuard**
  - SPEC：`RB4-AC-005`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 安靜軌道或他方未回答
  When 竄改題ID、他方答案、重送或提前查揭曉
  Then 拒非法操作且不變更revision
  And 同ID同payload回原receipt、改payload409
  And quiet路不被問答阻塞
  ```

- [ ] **Scenario: RB4-BDD-028 WrongRescue**
  - SPEC：`RB4-AC-008`；標籤：@error-handling @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 救書進行中
  When 逐20本錯抽、錯slot、錯序、錯role／area或重複滑動
  Then 錯書／槽／扣原文回饋
  And 不增加rescuedCount、不接受不合法持物或轉移
  And UI復位，合法後續仍可完成
  And 錯扣只重置本次鎖扣至0，已放書及已救數不變，不額外扣秒，正常倒數繼續
  ```

- [ ] **Scenario: RB4-BDD-037 AlarmRecovery**
  - SPEC：`RB4-AC-009`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given nonce清理、deadline、idle alarm競爭或DO重啟
  When 模擬重複alarm、通知遺失、D1/R2故障及GET補償
  Then 最早到期不被新nonce覆蓋
  And 舊session/generation無副作用，合法結果一次提交
  And 故障保留權威狀態、503後重試恢復
  And 系統 NULL actor 的冪等依固定 operation identity／phase／revision，不依賴 NULL UNIQUE
  And 多分頁、權杖刷新／撤銷、失焦及 nonce GC 不覆蓋最早應處理時刻
  ```

- [ ] **Scenario: RB4-BDD-039 BookmarkValidation**
  - SPEC：`RB4-AC-010`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 書籤操作可用
  When 送21 scalar、控制字元、孤立surrogate、HTML、未知書ID或他人note
  Then 非法輸入400且無寫入
  And 0與20合法及emoji scalar一致
  And 其他params仍為嚴格ID，禁止任意文字
  ```

- [ ] **Scenario: RB4-BDD-046 SafeExit**
  - SPEC：`RB4-AC-011`；標籤：@error-handling @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given ready/running/paused/settled/completed任一階段
  When 一方確認退出並與救書或alarm競態
  Then 退出不受倒數或素材故障阻塞
  And 解除占用、終止權限且pair排除
  And 無後續訊息／操作／私有圖或舊cue
  And 退出與救書競態的敗方不再寫入
  ```

- [ ] **Scenario: RB4-BDD-047 StrictTransport**
  - SPEC：`RB4-AC-012`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 有效及失效帳號、HTTP/WS相同操作
  When 送正確payload、偽造role/time、錯revision、重複ID與失權
  Then 兩transport同規則與receipt
  And 400/401/403/409/503依既有契約，無狀態異動
  And 拒公開system reconcile、raw manifest與私人key
  And raw R2、HTTP、WS 與歷史事件均遵守角色與版本授權，不返回未揭封書或未公開答案／note
  ```

- [ ] **Scenario: RB4-BDD-048 AssetReadiness**
  - SPEC：`RB4-AC-012`；標籤：@error-handling @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 任一正式資產缺失、SHA/尺寸/hitMask錯誤或化身未ready
  When 載入、恢復與點擊
  Then fail closed，不以placeholder冒充
  And 保留可用聊天/退出及重讀、現有錯誤碼
  And 恢復原版且不重抽、不呼叫Gemini
  And 正式素材逐一驗解碼／SHA／遮罩，不使用不明權利素材
  ```

- [ ] **Scenario: RB4-BDD-053 CleanupScope**
  - SPEC：`RB4-AC-013`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given Gate B已核准且已知local停寫
  When 預覽具名V1/V2/V3及V4測試輪與引用、模擬不明環境
  Then 不明環境／未授權／無備份拒清理
  And 精確Round/Session/Invitation/claim/event/catalog及R2引用清單
  And 保護帳號、個資、化身與其他故事或資產
  And 混有非驗收遊玩資料或未知引用的輪次拒清並列衝突
  ```

- [ ] **Scenario: RB4-BDD-054 CleanupAtomicity**
  - SPEC：`RB4-AC-013`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 已確認清理範圍與備份
  When 故障注入D1交易或R2清理並重試
  Then FK依賴及保護指紋正確、無孤兒
  And 測試pair排除與占用不殘留
  And R2只刪無剩餘引用、故障可補償且不假成功
  And 共用 R2 SHA 有剩餘引用不可刪；保護指紋及失敗補償可核證
  ```

- [ ] **Scenario: RB4-BDD-057 PublisherVersion**
  - SPEC：`RB4-AC-015`；標籤：@error-handling @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 既有V3釘選與新V4正式內容
  When 測v2/v3 parser、SHA不符、缺asset、非法DSL及版本發布
  Then 舊場次維持原SHA、v4新版本不可變
  And v3拒任意腳本或未知型別，D1/R2失敗不發布
  And 正式索引僅合法內容且Gate B前保留舊版讀取
  ```

### Boundary Conditions — 邊界條件

- [ ] **Scenario: RB4-BDD-003 DiscoverObjects**
  - SPEC：`RB4-AC-001`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 本場首次進區、其後再次進同區
  When 先觀看呼吸光再長按空白與放開
  Then 首次只提示一次
  And 長按只短暫顯示合法物件輪廓
  And 掃視、取消或重連不提交主線
  ```

- [ ] **Scenario: RB4-BDD-012 FogWitness**
  - SPEC：`RB4-AC-003`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 窗區符號存在且對方尚未見證
  When 背景讀取、同作者見證、舊符號見證及對方實際呈現
  Then 前3種不計印章
  And 只接受對方在窗區對目前版本的合法見證
  And 成立事實保留到小票；替換／轉場／完成清可見符號
  And 只有對方在前景窗區實際渲染目前符號且合法授權才回報見證；不得把背景 GET 當看見，也不宣稱眼球追蹤
  ```

- [ ] **Scenario: RB4-BDD-024 DurationConfig**
  - SPEC：`RB4-AC-008`；標籤：@boundary @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 90秒正式內容與另一合法120秒測試版本
  When 發布新配置並讓新舊場次各自ready
  Then 總時長來自釘選durationSeconds不硬編碼
  And 舊場次90秒、新場次120秒且不熱改deadline
  And 無效整數、門檻越界、溢位或缺設定拒發
  And 發布前驗數值文案及全部時間門檻，暫緩中的舊版仍依原時長恢復
  ```

- [ ] **Scenario: RB4-BDD-030 WaterStages**
  - SPEC：`RB4-AC-008`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 90秒倒數已running
  When 權威時間跨75/50/30/15秒及延遲重連
  Then 各水位階段及原文播報正確
  And 過期cue不重播、畫面ceil秒數一致
  And client改時鐘不影響D1 deadline
  And 各門檻來自釘選內容，發布時驗證數字文案一致
  ```

- [ ] **Scenario: RB4-BDD-031 PauseIdle**
  - SPEC：`RB4-AC-008`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given running時一方合法操作停止
  When 測14999/15000ms閒置且仍有ping
  Then 未達15秒不暫緩、達門檻暫緩
  And ping不更新有效活動
  And 保存剩餘時間且原稿暫緩提示正確
  And 晚到 alarm 依應暫緩的15秒時刻計算剩餘時間；若 deadline 已先到，結算優先
  ```

- [ ] **Scenario: RB4-BDD-033 DeadlineRace**
  - SPEC：`RB4-AC-008`；標籤：@boundary @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 最後一本只差合法封箱
  When 在deadline-1、deadline、deadline+1ms與timeout競態提交
  Then 嚴格早於deadline完成才S
  And 等於或晚於deadline拒操作，先按現有已救數結算
  And 真D1原子交易只有一結果、同receipt不重複
  And 最後毫秒、退出及 timeout 的跨Worker競態均以真 D1 guard／CAS 證明，敗方無副作用
  ```

- [ ] **Scenario: RB4-BDD-035 GradeA**
  - SPEC：`RB4-AC-009`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 到期已救2或3本
  When DO喚醒或合法讀取補償
  Then A結算且停止救書
  And 原文退至高處、拿鐵及毛巾
  And 走書籤／最終意願
  ```

- [ ] **Scenario: RB4-BDD-036 GradeB**
  - SPEC：`RB4-AC-009`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 到期已救0或1本
  When 系統結算
  Then B直接ev4-04-eaves-shelter
  And 停止救書且不可再進危險區或提交
  And 屋簷原文與專用鏡位，不走書籤或wish
  ```

- [ ] **Scenario: RB4-BDD-042 ReceiptTitle**
  - SPEC：`RB4-AC-011`；標籤：@boundary @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given S/A/B權威完成
  When 以S剩29999／30000／30001ms及A/B測小票
  Then S_fast >=30000、其餘S_normal
  And A/B稱號原文符合草稿
  And 書、黑膠、救援統計及阿澄附註只來自已提交事實
  And 稱號門檻隨釘選版本設定；小票不含自由輸入
  ```

- [ ] **Scenario: RB4-BDD-043 ReceiptCollection**
  - SPEC：`RB4-AC-011`；標籤：@boundary @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 同Round含重複V4結局、其他pair、其他Round、V3與未完成
  When 完成本場並生成X/4
  Then 當前V4同版已完成不同結局含本場
  And 其他Round/pair/版本或未完成不計
  And 重播不重複累計且0..4有界
  ```

- [ ] **Scenario: RB4-BDD-056 AuthorIntegrity**
  - SPEC：`RB4-AC-015`；標籤：@boundary @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 完整原始JSON與編譯的正式v3內容
  When 逐JSON path/ID比較並注入缺字、標點改動、缺ID與placeholder
  Then 28節點9個人binding、全部書與模組原文逐項保留
  And 合法技術轉換可逆、未知條件/內容差異拒發
  And 原稿SHA不被覆寫，經確認例外才調整基準
  And 保留原稿兩題組的書與位置、逐 scalar／ID；權利不明不得自行替換
  ```

- [ ] **Scenario: RB4-BDD-058 Reachability**
  - SPEC：`RB4-AC-015`；標籤：@boundary @critical
  - 涉及：Domain／Application／Worker／Publisher

  ```gherkin
  Given 編譯完整草稿及有限狀態模型
  When 遍歷全部節點、角色、題組、問答、拒絕及結局
  Then 28節點與4結局可達、兩方不死鎖
  And 同一合法狀態唯一結局、B優先安全結束
  And 不得拆除既有graph/JSON/資產guard來冒充通過
  And 最壞合法重複探索與兩題組須實測現有 JSON／graph guard，超限提出最小方案而非放寬
  ```

### Performance — 效能

- [ ] **Scenario: RB4-BDD-050 PlatformPerformance**
  - SPEC：`RB4-AC-012`；標籤：@performance @critical @frontend
  - 涉及：StoryExperienceScreen／場景共用 renderer（Web／Android）

  ```gherkin
  Given 正式V4完整資產、Web與Android現有驗收裝置
  When 連續探索、翻書、倒數、背景與重連
  Then 記錄載入／操作延遲／記憶體／動畫對V3基線
  And 離開與失權清資源且有界快取
  And 無實測不得標Gate A通過
  And 正式 Web／Android runner 路徑、APK／ADB 及效能資料皆須可核證
  ```


## Frontend UX 與 SPEC 覆蓋

所有 @frontend 場景的 Given/When/Then 必須在正式 Web、Android 驗證初始載入／pending／無合法操作時隱藏入口／失敗回復／重複點擊。錯誤採原稿 UI copy 或現有錯誤契約，不創作新劇本。逐 AC 對應：15/15；詳細映射見 RiskAudit。不是測試已通過的證據。

## 相關文檔

- [TDD](../tdd/SPEC-001-RainBookshopV4-TDD.md)
- [RiskAudit](../specs/SPEC-001-RainBookshopV4-RiskAudit.md)
- [Verification](../verification/SPEC-001-RainBookshopV4-Verification.md)
