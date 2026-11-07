# SPEC-001-StoryDialogueAndExit — BDD 場景規格

> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)；**已確認 SDD**：[SPEC-001-StoryDialogueAndExit](../specs/SPEC-001-StoryDialogueAndExit.md)
> **日期**：2026-11-08；**狀態**：perfect-plan Phase 3；尚未進入 Well-Done 或實作驗收。

## Feature 描述

真人雙人 ADV 敘事與合作：配對成立當下固定已發布可玩的最多三個故事；N=1直接開始、N=2雙方二選一、N≥3推薦前三名並雙方各選一個。選擇不同依原邀請方決定。兩人以標準 WebSocket 和 D1 事件序號共同遊玩、聊天與可恢復互動，任何一方都可二次確認結束。

**資料層硬性限制**：新表僅 `content_story_catalog`、`game_story_sessions`、`game_round_events`、`game_interaction_instances`；既有 `game_round_participants` 僅更名為 `game_active_round_claims`；Round JSON 僅凍結**第 1 場**候選，Session 以 `(round_id,episode_seq)` 分場，後續場次的候選／投票保存在帶場次編號的共用事件流。**不建 Episode／Offers／Votes 表；本期 App 只能玩第 1 場**。

## 前端 UX 與場景進度

- BDD 場景：**0/79**（0%，未執行或未驗收）；SD-BDD-071 是非正式舊遊戲測資重建，SD-BDD-072～079 為已確認 `SD-RQ-01=B` 的多場次資料模型及本期功能限制。
- `@frontend`：**0/15**（0%，Web／Android 要各自有真人證據）。
- 首場 `scene-01 雨聲書店` 必須先完成完整分支／互動／結尾，技術 Gate A、使用者實玩 Gate B 分別驗證；其餘九場仍是規劃概念。
- **排除**：iOS 暫緩、無障礙專項不在本期；History／Housekeeping／聊天紀錄搬移及保留天數留未來獨立 MVP；不提前實作後續 Affection／名片交換／OnlineGames 功能。

## Background（共同前提）

```gherkin
Feature: 真人雙人 ADV 劇情與平順退出
  Background:
    Given A與B是獨立有效登入且真實互相配對的玩家
    And 只能由真 active Round 的當前 game_active_round_claims 成員遊玩
    And 劇情來自 content_story_catalog 正式且完整可玩的已發布版本
    And Web與Android 共用固定 WebSocket 訊息契約與伺服器事實狀態
    And 不使用固定夏樹、假玩家答覆、尚未完成劇本或假好感度
```

## Happy Path — 正常流程

### SD-BDD-001：只有一個劇情直接開始

- [ ] **Scenario: 只有一個劇情直接開始**
  - **來源**：`SD-AC-002`、`SD-AC-017`、`SD-AC-018`；**優先級／標籤**：@smoke @happy-path @critical；**元件**：StoryExperienceScreen

```gherkin
@smoke @happy-path @critical
Scenario: SD-BDD-001 只有一個劇情直接開始
  Given 配對雙方合格且只有scene-01正式可玩
  When 受邀方接受配對
  Then 同批建立Round、唯一候選與StorySession
  And 兩端直接進劇情不投票
```

### SD-BDD-002：兩個故事自動二選一

- [ ] **Scenario: 兩個故事自動二選一**
  - **來源**：`SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**優先級／標籤**：@smoke @happy-path @critical；**元件**：StorySelectionScreen

```gherkin
@smoke @happy-path @critical
Scenario: SD-BDD-002 兩個故事自動二選一
  Given 正式有兩個可玩story_id
  When 受邀方接受邀請
  Then Round同批鎖定兩個版本Catalog ID
  And 兩端顯示同序兩卡且必須兩人選擇
```

### SD-BDD-003：三個以上取前三名

- [ ] **Scenario: 三個以上取前三名**
  - **來源**：`SD-AC-002`、`SD-AC-016`、`SD-AC-018`；**優先級／標籤**：@happy-path @critical；**元件**：StorySelectionScreen

```gherkin
@happy-path @critical
Scenario: SD-BDD-003 三個以上取前三名
  Given 正式有四個可玩story_id
  When 受邀方接受邀請
  Then 根據兩方興趣固定排名前三個Catalog ID
  And 未被推薦的第四個不可投票
```

### SD-BDD-004：共同興趣與均衡喜好排序

- [ ] **Scenario: 共同興趣與均衡喜好排序**
  - **來源**：`SD-AC-002`；**優先級／標籤**：@happy-path @critical；**元件**：—

```gherkin
@happy-path @critical
Scenario: SD-BDD-004 共同興趣與均衡喜好排序
  Given 雙方興趣及故事tag已合法發布
  When 建立新配對Round
  Then 依共同命中、兩方較少命中、總命中排序
  And 推薦priority與story_id決定最後同分
```

### SD-BDD-005：雙方選同一場結算

- [ ] **Scenario: 雙方選同一場結算**
  - **來源**：`SD-AC-016`、`SD-AC-017`；**優先級／標籤**：@happy-path @critical；**元件**：StorySelectionScreen

```gherkin
@happy-path @critical
Scenario: SD-BDD-005 雙方選同一場結算
  Given N為2且A已選X
  When B也選X
  Then D1只建立一筆X的StorySession
  And 兩端讀取相同story.selected結果
```

### SD-BDD-006：選擇衝突採原邀請方

- [ ] **Scenario: 選擇衝突採原邀請方**
  - **來源**：`SD-AC-016`、`SD-AC-017`；**優先級／標籤**：@smoke @happy-path @critical；**元件**：StorySelectionScreen

```gherkin
@smoke @happy-path @critical
Scenario: SD-BDD-006 選擇衝突採原邀請方
  Given B是原始邀請方且A是受邀方
  When A選X而B選Y
  Then 決議選Y且記錄原邀請方勝出理由
  And 不以先投票或ID大小替代邀請身分
```

### SD-BDD-007：雨聲書店ADV開場完整演出

- [ ] **Scenario: 雨聲書店ADV開場完整演出**
  - **來源**：`SD-AC-003`；**優先級／標籤**：@happy-path @normal；**元件**：ADVStage

```gherkin
@happy-path @normal
Scenario: SD-BDD-007 雨聲書店ADV開場完整演出
  Given 兩名玩家已進入scene-01
  When 開啟第一個劇情節點
  Then 顯示專屬背景、3:4人物、旁白與逐句演出
  And 呈現原型粉玫瑰深紫與半透明視覺
```

### SD-BDD-008：三種破冰建議由本人說出

- [ ] **Scenario: 三種破冰建議由本人說出**
  - **來源**：`SD-AC-004`；**優先級／標籤**：@happy-path @normal；**元件**：ChatComposer

```gherkin
@happy-path @normal
Scenario: SD-BDD-008 三種破冰建議由本人說出
  Given A與B在書店破冰節點
  When A選觀察型話題
  Then 訊息actor是A且文字取自已釘選版次
  And B只收到A真實發出的訊息
```

### SD-BDD-009：自由訊息真實雙端送達

- [ ] **Scenario: 自由訊息真實雙端送達**
  - **來源**：`SD-AC-004`、`SD-AC-005`；**優先級／標籤**：@happy-path @critical；**元件**：ChatComposer

```gherkin
@happy-path @critical
Scenario: SD-BDD-009 自由訊息真實雙端送達
  Given A與B在相同active Round並已連線
  When A送出合法文字
  Then D1成功後ACK再向B廣播相同事件序號
  And 無系統扮演B也無假已讀
```

### SD-BDD-010：等待另一人時仍可探索

- [ ] **Scenario: 等待另一人時仍可探索**
  - **來源**：`SD-AC-006`、`SD-AC-014`；**優先級／標籤**：@happy-path @normal；**元件**：InteractionRenderer

```gherkin
@happy-path @normal
Scenario: SD-BDD-010 等待另一人時仍可探索
  Given A在線但B暫離
  When A調查書籤物件
  Then A取得自己的探索結果
  And 雙人閘門仍必須等B真人提交
```

### SD-BDD-011：合作選擇相同可完成

- [ ] **Scenario: 合作選擇相同可完成**
  - **來源**：`SD-AC-006`；**優先級／標籤**：@happy-path @normal；**元件**：InteractionRenderer

```gherkin
@happy-path @normal
Scenario: SD-BDD-011 合作選擇相同可完成
  Given 雙方已進入cooperative-choice
  When 兩人分別提交同選項
  Then 模組結算並依故事圖推進
  And 不重用另一個節點互動的答題
```

### SD-BDD-012：合作分歧依互動定義合流

- [ ] **Scenario: 合作分歧依互動定義合流**
  - **來源**：`SD-AC-006`；**優先級／標籤**：@happy-path @normal；**元件**：InteractionRenderer

```gherkin
@happy-path @normal
Scenario: SD-BDD-012 合作分歧依互動定義合流
  Given 兩人處於有分歧規則的合作節點
  When 各自選擇不同答案
  Then 依InteractionDefinition的已發布規則推進
  And 不套用選劇情的邀請方優先規則
```

### SD-BDD-013：書店支線可返回主線

- [ ] **Scenario: 書店支線可返回主線**
  - **來源**：`SD-AC-007`；**優先級／標籤**：@happy-path @normal；**元件**：ADVStage

```gherkin
@happy-path @normal
Scenario: SD-BDD-013 書店支線可返回主線
  Given 主線有可達書籤支線
  When 玩家完成支線觸發條件
  Then 進入支線後回到指定rejoin節點
  And 雙方重連後主線節點一致
```

### SD-BDD-014：兩種結局確實由選擇影響

- [ ] **Scenario: 兩種結局確實由選擇影響**
  - **來源**：`SD-AC-007`；**優先級／標籤**：@happy-path @normal；**元件**：ADVStage

```gherkin
@happy-path @normal
Scenario: SD-BDD-014 兩種結局確實由選擇影響
  Given 兩組隔離Round選擇不同分支
  When 各自完成整章
  Then 可達兩種不同結語及視覺結果
  And 不以單一intro假裝故事完成
```

### SD-BDD-015：章節完成不會退出Round

- [ ] **Scenario: 章節完成不會退出Round**
  - **來源**：`SD-AC-007`；**優先級／標籤**：@happy-path @normal；**元件**：StoryExperienceScreen

```gherkin
@happy-path @normal
Scenario: SD-BDD-015 章節完成不會退出Round
  Given 兩名玩家完成scene-01結尾
  When 伺服器提交chapter.completed
  Then 故事標completed而Round仍active
  And 兩人可繼續自由聊天不釋放Claims
```

### SD-BDD-016：二次確認後原子結束

- [ ] **Scenario: 二次確認後原子結束**
  - **來源**：`SD-AC-008`、`SD-AC-009`；**優先級／標籤**：@happy-path @critical；**元件**：ExitDialog

```gherkin
@happy-path @critical
Scenario: SD-BDD-016 二次確認後原子結束
  Given 兩人仍在active Round
  When 一方點結束並確認
  Then D1標ended且恰好釋放雙方Claims
  And 原account pair永遠不得再配
```

### SD-BDD-017：結束後只回安全狀態

- [ ] **Scenario: 結束後只回安全狀態**
  - **來源**：`SD-AC-010`、`SD-AC-011`；**優先級／標籤**：@happy-path @critical；**元件**：StoryExperienceScreen

```gherkin
@happy-path @critical
Scenario: SD-BDD-017 結束後只回安全狀態
  Given 本輪已正式結束
  When 原成員查status及舊聊天
  Then status可見ended但聊天不可取回
  And 不能讀取結束後新的真人名片
```

### SD-BDD-018：WebSocket重連依序補漏

- [ ] **Scenario: WebSocket重連依序補漏**
  - **來源**：`SD-AC-012`、`SD-AC-019`；**優先級／標籤**：@happy-path @critical；**元件**：RealtimeRoomClient

```gherkin
@happy-path @critical
Scenario: SD-BDD-018 WebSocket重連依序補漏
  Given 玩家已保存上次eventSeq
  When WebSocket斷線後重新授權
  Then 藉安全snapshot與游標補齊已提交事件
  And 不產生重複訊息或順序倒置
```

### SD-BDD-019：只載入勝出劇情資產

- [ ] **Scenario: 只載入勝出劇情資產**
  - **來源**：`SD-AC-013`；**優先級／標籤**：@happy-path @normal；**元件**：ADVStage

```gherkin
@happy-path @normal
Scenario: SD-BDD-019 只載入勝出劇情資產
  Given Round已固定勝出StoryVersion
  When 玩家開啟故事及推進節點
  Then 取得鎖定hash的首屏與必要素材
  And 未選故事的巨大圖片不提前載入
```

### SD-BDD-020：第一場全章必須雙Gate驗證

- [ ] **Scenario: 第一場全章必須雙Gate驗證**
  - **來源**：`SD-AC-015`；**優先級／標籤**：@happy-path @normal；**元件**：—

```gherkin
@happy-path @normal
Scenario: SD-BDD-020 第一場全章必須雙Gate驗證
  Given scene-01已達所有分支和互動技術條件
  When 真人完成Web與Android實玩
  Then 分別保留Gate A與Gate B實際證據
  And 其餘九場仍列未交付直到真的完成
```

### SD-BDD-021：四張新表與前綴分工

- [ ] **Scenario: 四張新表與前綴分工**
  - **來源**：`SD-AC-020`；**優先級／標籤**：@happy-path @critical；**元件**：—

```gherkin
@happy-path @critical
Scenario: SD-BDD-021 四張新表與前綴分工
  Given 即將套用本SPEC的migration
  When 檢視D1 Schema
  Then 只建一張content_與三張game_新表
  And 不建立Offers或Votes表或額外內容定義表
```

### SD-BDD-022：帳號占用表更名沿用保障

- [ ] **Scenario: 帳號占用表更名沿用保障**
  - **來源**：`SD-AC-020`；**優先級／標籤**：@happy-path @critical；**元件**：—

```gherkin
@happy-path @critical
Scenario: SD-BDD-022 帳號占用表更名沿用保障
  Given 原0004已有game_round_participants
  When 套用更名migration
  Then 變為game_active_round_claims且四欄與account_id UNIQUE不變
  And Matching與維運路徑同步改名
```

## Alternative Path — 替代流程

### SD-BDD-023：候選凍結不受後續更動

- [ ] **Scenario: 候選凍結不受後續更動**
  - **來源**：`SD-AC-002`；**優先級／標籤**：@alternative-path @critical；**元件**：—

```gherkin
@alternative-path @critical
Scenario: SD-BDD-023 候選凍結不受後續更動
  Given 既有Round固定N個候選
  When 玩家修改興趣或發布新版故事
  Then 既有Catalog ID與推薦順序不變
  And 只有新Round可見新排名
```

### SD-BDD-024：無共同興趣時均衡推薦

- [ ] **Scenario: 無共同興趣時均衡推薦**
  - **來源**：`SD-AC-002`；**優先級／標籤**：@alternative-path @critical；**元件**：—

```gherkin
@alternative-path @critical
Scenario: SD-BDD-024 無共同興趣時均衡推薦
  Given 兩人的合法興趣沒有交集
  When 進行新Round推薦
  Then 先兼顧各別興趣再按priority補足
  And 不發明不存在的tag或假劇本
```

### SD-BDD-025：改票以最後有效事件為準

- [ ] **Scenario: 改票以最後有效事件為準**
  - **來源**：`SD-AC-016`；**優先級／標籤**：@alternative-path @critical；**元件**：StorySelectionScreen

```gherkin
@alternative-path @critical
Scenario: SD-BDD-025 改票以最後有效事件為準
  Given A已選X但B尚未選
  When A改選Y
  Then 共用事件多一筆且A最新票是Y
  And B仍只知道A已選
```

### SD-BDD-026：對方離線不自動選劇情

- [ ] **Scenario: 對方離線不自動選劇情**
  - **來源**：`SD-AC-016`；**優先級／標籤**：@alternative-path @critical；**元件**：StorySelectionScreen

```gherkin
@alternative-path @critical
Scenario: SD-BDD-026 對方離線不自動選劇情
  Given A已選而B離線
  When A重新登入等待
  Then 狀態仍是pending_story_selection
  And 沒有超時自動補票
```

### SD-BDD-027：離場語句只提醒本人

- [ ] **Scenario: 離場語句只提醒本人**
  - **來源**：`SD-AC-008`；**優先級／標籤**：@alternative-path @critical；**元件**：ExitDialog

```gherkin
@alternative-path @critical
Scenario: SD-BDD-027 離場語句只提醒本人
  Given A輸入先到這邊
  When A觸發送出
  Then 只有A看到是否想結束的提示
  And B不知道A尚在考慮退出
```

### SD-BDD-028：誤判離場可選繼續

- [ ] **Scenario: 誤判離場可選繼續**
  - **來源**：`SD-AC-008`；**優先級／標籤**：@alternative-path @critical；**元件**：ExitDialog

```gherkin
@alternative-path @critical
Scenario: SD-BDD-028 誤判離場可選繼續
  Given 本人看到離場語境提示
  When 點繼續傳送
  Then Round保持active且訊息仍可由本人送出
  And 不擅自結束或通知對方
```

### SD-BDD-029：取消正式結束不改狀態

- [ ] **Scenario: 取消正式結束不改狀態**
  - **來源**：`SD-AC-008`、`SD-AC-009`；**優先級／標籤**：@alternative-path @critical；**元件**：ExitDialog

```gherkin
@alternative-path @critical
Scenario: SD-BDD-029 取消正式結束不改狀態
  Given 正式結束確認Dialog已開啟
  When A點取消
  Then 不呼叫end且Round仍active
  And Claims及聊天不變
```

### SD-BDD-030：故事Retire不切斷已開始輪次

- [ ] **Scenario: 故事Retire不切斷已開始輪次**
  - **來源**：`SD-AC-013`；**優先級／標籤**：@alternative-path @normal；**元件**：—

```gherkin
@alternative-path @normal
Scenario: SD-BDD-030 故事Retire不切斷已開始輪次
  Given Round已鎖定Published版本
  When 該Catalog版本被標Retired
  Then 舊Round仍讀原immutable版本
  And 新Round不再推薦退休版本
```

### SD-BDD-031：協作離線後可回來完成

- [ ] **Scenario: 協作離線後可回來完成**
  - **來源**：`SD-AC-014`；**優先級／標籤**：@alternative-path @normal；**元件**：InteractionRenderer

```gherkin
@alternative-path @normal
Scenario: SD-BDD-031 協作離線後可回來完成
  Given A已提交互動但B未選
  When B重登後提交真選擇
  Then 合作依兩份有效真人答覆結算
  And 等待期間A仍可探索與聊天
```

### SD-BDD-032：系統旁白與NPC不冒充玩家

- [ ] **Scenario: 系統旁白與NPC不冒充玩家**
  - **來源**：`SD-AC-003`、`SD-AC-014`；**優先級／標籤**：@alternative-path @normal；**元件**：ADVStage

```gherkin
@alternative-path @normal
Scenario: SD-BDD-032 系統旁白與NPC不冒充玩家
  Given 故事包含系統與NPC台詞
  When 呈現對話場景
  Then NPC與系統標註清楚
  And 沒有任何B的人物自動發言
```

## Boundary Conditions — 邊界條件

### SD-BDD-033：零個可玩劇本不得空配對

- [ ] **Scenario: 零個可玩劇本不得空配對**
  - **來源**：`SD-AC-002`、`SD-AC-018`；**優先級／標籤**：@edge-case @critical；**元件**：StorySelectionScreen

```gherkin
@edge-case @critical
Scenario: SD-BDD-033 零個可玩劇本不得空配對
  Given 存在pending邀請但沒有published完整故事
  When B嘗試接受
  Then 回NO_PLAYABLE_STORY且邀請不變accepted
  And 沒有孤兒Round或Claims
```

### SD-BDD-034：同story_id不得同時兩個Published

- [ ] **Scenario: 同story_id不得同時兩個Published**
  - **來源**：`SD-AC-002`、`SD-AC-020`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-034 同story_id不得同時兩個Published
  Given 同story_id的v1已發布
  When 管理者把v2也設為Published
  Then D1部分唯一索引拒絕重複published
  And 舊Round仍可引用v1
```

### SD-BDD-035：同分排名穩定不隨重試變動

- [ ] **Scenario: 同分排名穩定不隨重試變動**
  - **來源**：`SD-AC-002`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-035 同分排名穩定不隨重試變動
  Given 多場故事命中指標完全相同
  When 資料競態導致重新排名
  Then 依priority及story_id得到同序
  And 兩端不見隨機結果
```

### SD-BDD-036：1至500 Unicode scalar邊界

- [ ] **Scenario: 1至500 Unicode scalar邊界**
  - **來源**：`SD-AC-005`；**優先級／標籤**：@edge-case @critical；**元件**：ChatComposer

```gherkin
@edge-case @critical
Scenario: SD-BDD-036 1至500 Unicode scalar邊界
  Given A在合法聊天室輸入中文及emoji
  When 分別送出1、500、501個Unicode scalar
  Then 1及500合規而501拒絕
  And 不以UTF-16 code unit錯判emoji
```

### SD-BDD-037：同時操作序號仍唯一遞增

- [ ] **Scenario: 同時操作序號仍唯一遞增**
  - **來源**：`SD-AC-005`、`SD-AC-017`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-037 同時操作序號仍唯一遞增
  Given 同Round並行發話及投票
  When 兩端同時送出
  Then last_event_seq與事件sequence無重複
  And 同ID重播只讀原結果
```

### SD-BDD-038：雙票同時提交僅一故事

- [ ] **Scenario: 雙票同時提交僅一故事**
  - **來源**：`SD-AC-017`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-038 雙票同時提交僅一故事
  Given 兩人於第1場N2同時選擇
  When 並行提交D1
  Then UNIQUE(round_id,episode_seq) 保證同一場只建立一個StorySession與一次決議
  And 兩端結果完全一致
```

### SD-BDD-039：改票與第二人選票交錯取最後有效

- [ ] **Scenario: 改票與第二人選票交錯取最後有效**
  - **來源**：`SD-AC-017`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-039 改票與第二人選票交錯取最後有效
  Given A先選X再改Y且B未投票
  When B提交X
  Then 依A最後有效Y和B有效X結算
  And 原邀請方決勝且不可重算
```

### SD-BDD-040：帳號同時跨兩輪只准一輪

- [ ] **Scenario: 帳號同時跨兩輪只准一輪**
  - **來源**：`SD-AC-020`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-040 帳號同時跨兩輪只准一輪
  Given A同時收到兩組配對邀請
  When 兩筆接受並行提交
  Then Claim.account_id UNIQUE防第二場
  And 失敗接受批次無殘留accepted
```

### SD-BDD-041：互動實例只以StorySession關聯

- [ ] **Scenario: 互動實例只以StorySession關聯**
  - **來源**：`SD-AC-020`；**優先級／標籤**：@edge-case @critical；**元件**：—

```gherkin
@edge-case @critical
Scenario: SD-BDD-041 互動實例只以StorySession關聯
  Given 一個故事有多節點互動
  When 建立本節點實例
  Then UNIQUE(story_session_id,node_id,definition_id)防重
  And 不額外存round_id或story_id
```

## Error Handling — 錯誤處理

### SD-BDD-042：第三人知道Round ID仍拒讀

- [ ] **Scenario: 第三人知道Round ID仍拒讀**
  - **來源**：`SD-AC-001`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-042 第三人知道Round ID仍拒讀
  Given C不是本Round成員
  When C查experience、events、ticket和WS
  Then 各入口拒絕且不洩漏房間內容
  And 無故事、人物或私有資料外洩
```

### SD-BDD-043：新登入撤舊Session不許持續寫

- [ ] **Scenario: 新登入撤舊Session不許持續寫**
  - **來源**：`SD-AC-001`、`SD-AC-012`；**優先級／標籤**：@error-handling @critical；**元件**：RealtimeRoomClient

```gherkin
@error-handling @critical
Scenario: SD-BDD-043 新登入撤舊Session不許持續寫
  Given A新裝置登入撤銷舊family
  When 舊裝置繼續發WS命令
  Then D1拒寫且連線被重驗或關閉
  And 無舊身份發話
```

### SD-BDD-044：控制字元與可執行HTML拒絕

- [ ] **Scenario: 控制字元與可執行HTML拒絕**
  - **來源**：`SD-AC-005`；**優先級／標籤**：@error-handling @critical；**元件**：ChatComposer

```gherkin
@error-handling @critical
Scenario: SD-BDD-044 控制字元與可執行HTML拒絕
  Given A輸入危險控制字元或HTML
  When 呼叫文字提交
  Then 回INVALID_STORY_REQUEST且沒有事件
  And 客戶端亦不執行HTML
```

### SD-BDD-045：偽造actor或非本輪Catalog被拒

- [ ] **Scenario: 偽造actor或非本輪Catalog被拒**
  - **來源**：`SD-AC-016`、`SD-AC-017`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-045 偽造actor或非本輪Catalog被拒
  Given 本Round候選是X與Y
  When A提交catalogId Z並假稱B為actor
  Then 伺服器依A Session及Round白名單拒絕
  And 沒有事件或Session狀態改變
```

### SD-BDD-046：未決議票不能由事件補漏外洩

- [ ] **Scenario: 未決議票不能由事件補漏外洩**
  - **來源**：`SD-AC-016`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-046 未決議票不能由事件補漏外洩
  Given A已選X而B還沒選
  When B用events query、snapshot及WS恢復
  Then B只能知道A已選而不知Catalog ID
  And 原始story.vote.submitted的payload不得外洩
```

### SD-BDD-047：單故事不可呼叫投票改劇情

- [ ] **Scenario: 單故事不可呼叫投票改劇情**
  - **來源**：`SD-AC-017`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-047 單故事不可呼叫投票改劇情
  Given N1已在接受邀請時直接開始
  When 任何成員呼叫story/vote
  Then 回STORY_ALREADY_SELECTED
  And 不生成虛構選票
```

### SD-BDD-048：End先提交後拒絕對方寫入

- [ ] **Scenario: End先提交後拒絕對方寫入**
  - **來源**：`SD-AC-010`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-048 End先提交後拒絕對方寫入
  Given A的end與B的聊天交錯
  When end先提交成功
  Then B收到ROUND_NOT_ACTIVE
  And 不產生ended後新事件
```

### SD-BDD-049：已結束不能用舊游標翻聊天

- [ ] **Scenario: 已結束不能用舊游標翻聊天**
  - **來源**：`SD-AC-010`、`SD-AC-011`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-049 已結束不能用舊游標翻聊天
  Given 原成員留有舊eventSeq
  When 結束後查events或experience
  Then 無法取得先前私人聊天及互動
  And 仍可查安全ended狀態
```

### SD-BDD-050：一次性握手Ticket不可跨用

- [ ] **Scenario: 一次性握手Ticket不可跨用**
  - **來源**：`SD-AC-012`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-050 一次性握手Ticket不可跨用
  Given A曾使用合法短效ticket
  When 重播或換Round／裝置使用
  Then WS Upgrade拒絕
  And 長效Access與Refresh絕不載入URL
```

### SD-BDD-051：提交成功推播失敗可補齊

- [ ] **Scenario: 提交成功推播失敗可補齊**
  - **來源**：`SD-AC-012`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-051 提交成功推播失敗可補齊
  Given D1已commit一則聊天
  When DO在推播前崩潰
  Then B重連取得該筆且不重複
  And A用同requestId只讀原receipt
```

### SD-BDD-052：未完成劇情Manifest不可發布

- [ ] **Scenario: 未完成劇情Manifest不可發布**
  - **來源**：`SD-AC-013`；**優先級／標籤**：@error-handling @normal；**元件**：—

```gherkin
@error-handling @normal
Scenario: SD-BDD-052 未完成劇情Manifest不可發布
  Given 草稿缺ending或參照無效
  When 內容工具檢查發布
  Then Catalog不得標published
  And 不出現在推薦候選
```

### SD-BDD-053：私人R2照片不可以劇情公開載入

- [ ] **Scenario: 私人R2照片不可以劇情公開載入**
  - **來源**：`SD-AC-013`、`SD-AC-020`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-053 私人R2照片不可以劇情公開載入
  Given 劇情manifest指向私人會員照片key
  When 嘗試發布或由公開路由讀取
  Then 拒絕存取與洩漏key
  And 只有核准公開劇情資產可讀
```

### SD-BDD-054：更名殘留舊表查詢必被回歸發現

- [ ] **Scenario: 更名殘留舊表查詢必被回歸發現**
  - **來源**：`SD-AC-020`；**優先級／標籤**：@error-handling @critical；**元件**：—

```gherkin
@error-handling @critical
Scenario: SD-BDD-054 更名殘留舊表查詢必被回歸發現
  Given schema已更名為game_active_round_claims
  When 執行Matching與維運真D1完整測試
  Then 舊表名存取必失敗而非誤判通過
  And 占用及釋放仍同批保障
```

## Frontend UX — 前端操作

### SD-BDD-055：單劇情進場直接顯示ADV

- [ ] **Scenario: 單劇情進場直接顯示ADV**
  - **來源**：`SD-AC-003`、`SD-AC-018`；**優先級／標籤**：@frontend @normal；**元件**：StoryExperienceScreen

```gherkin
@frontend @normal
Scenario: SD-BDD-055 單劇情進場直接顯示ADV
  Given 唯一正式故事為scene-01且Round已接受
  When 玩家從首頁進場
  Then 直接顯示書店開場
  And 沒有多餘單場選擇頁
```

### SD-BDD-056：二選一雙端卡片一致

- [ ] **Scenario: 二選一雙端卡片一致**
  - **來源**：`SD-AC-002`、`SD-AC-016`；**優先級／標籤**：@frontend @critical；**元件**：StorySelectionScreen

```gherkin
@frontend @critical
Scenario: SD-BDD-056 二選一雙端卡片一致
  Given Round固定兩個Catalog ID
  When 兩名玩家開啟選場
  Then 兩端只有兩張相同順序合法卡片
  And 第三張空卡不出現
```

### SD-BDD-057：三選一只顯示安全Preview

- [ ] **Scenario: 三選一只顯示安全Preview**
  - **來源**：`SD-AC-002`、`SD-AC-016`；**優先級／標籤**：@frontend @critical；**元件**：StorySelectionScreen

```gherkin
@frontend @critical
Scenario: SD-BDD-057 三選一只顯示安全Preview
  Given Round固定三個Catalog ID
  When 兩端開啟選場畫面
  Then 只呈現三個已授權公開預覽
  And 不曝露私人tag及推薦計分
```

### SD-BDD-058：選場提交中禁止重複操作

- [ ] **Scenario: 選場提交中禁止重複操作**
  - **來源**：`SD-AC-016`；**優先級／標籤**：@frontend @critical；**元件**：StorySelectionScreen

```gherkin
@frontend @critical
Scenario: SD-BDD-058 選場提交中禁止重複操作
  Given 玩家按下提交候選
  When 同一按鈕被快速連點
  Then 按鈕Loading且不重複提交
  And 未知結果以同ID確認
```

### SD-BDD-059：待另一方選擇不展示其票

- [ ] **Scenario: 待另一方選擇不展示其票**
  - **來源**：`SD-AC-016`；**優先級／標籤**：@frontend @critical；**元件**：StorySelectionScreen

```gherkin
@frontend @critical
Scenario: SD-BDD-059 待另一方選擇不展示其票
  Given A已投票B未提交
  When A觀看選場等待
  Then 顯示等待另一方選擇
  And 不顯示B選項或假倒數
```

### SD-BDD-060：邀請方決勝顯示原因

- [ ] **Scenario: 邀請方決勝顯示原因**
  - **來源**：`SD-AC-016`；**優先級／標籤**：@frontend @critical；**元件**：StorySelectionScreen

```gherkin
@frontend @critical
Scenario: SD-BDD-060 邀請方決勝顯示原因
  Given 雙方投票不同且已結算
  When 打開結果畫面
  Then 顯示採原邀請方的選擇
  And 兩端載入同一故事
```

### SD-BDD-061：聊天送出中與已送出分開

- [ ] **Scenario: 聊天送出中與已送出分開**
  - **來源**：`SD-AC-004`、`SD-AC-005`；**優先級／標籤**：@frontend @critical；**元件**：ChatComposer

```gherkin
@frontend @critical
Scenario: SD-BDD-061 聊天送出中與已送出分開
  Given 玩家送出合法文字
  When D1還未回覆ACK
  Then 泡泡顯示送出中直到已提交
  And 沒有實際讀取證據不顯示已讀
```

### SD-BDD-062：斷線畫面安全恢復

- [ ] **Scenario: 斷線畫面安全恢復**
  - **來源**：`SD-AC-012`；**優先級／標籤**：@frontend @critical；**元件**：RealtimeRoomClient

```gherkin
@frontend @critical
Scenario: SD-BDD-062 斷線畫面安全恢復
  Given WebSocket意外斷開
  When 玩家回前景且網路恢復
  Then 顯示重新連線中直到補齊
  And 未確認結果不宣稱已送達
```

### SD-BDD-063：協作等待可返回探索

- [ ] **Scenario: 協作等待可返回探索**
  - **來源**：`SD-AC-006`、`SD-AC-014`；**優先級／標籤**：@frontend @normal；**元件**：InteractionRenderer

```gherkin
@frontend @normal
Scenario: SD-BDD-063 協作等待可返回探索
  Given A已選而B未選
  When A返回場景
  Then 顯示等待另一方選擇
  And 可以探索且再打開卡保留答覆
```

### SD-BDD-064：ADV逐句分支與結尾畫面

- [ ] **Scenario: ADV逐句分支與結尾畫面**
  - **來源**：`SD-AC-003`、`SD-AC-007`；**優先級／標籤**：@frontend @normal；**元件**：ADVStage

```gherkin
@frontend @normal
Scenario: SD-BDD-064 ADV逐句分支與結尾畫面
  Given 書店有主線支線合流與結尾
  When 玩家逐節點完成故事
  Then 立繪動畫音效與結果按已提交分支呈現
  And 不能只有一個intro冒稱完成
```

### SD-BDD-065：離場語句提示可取消

- [ ] **Scenario: 離場語句提示可取消**
  - **來源**：`SD-AC-008`；**優先級／標籤**：@frontend @critical；**元件**：ExitDialog

```gherkin
@frontend @critical
Scenario: SD-BDD-065 離場語句提示可取消
  Given A輸入不想繼續
  When 本人看到語境提示
  Then 提供繼續、返回編輯與結束按鈕
  And 不通知B本人尚在考慮退出
```

### SD-BDD-066：結束Dialog顯示永久互斥警示

- [ ] **Scenario: 結束Dialog顯示永久互斥警示**
  - **來源**：`SD-AC-008`、`SD-AC-009`；**優先級／標籤**：@frontend @critical；**元件**：ExitDialog

```gherkin
@frontend @critical
Scenario: SD-BDD-066 結束Dialog顯示永久互斥警示
  Given 玩家在任意階段按結束本輪
  When 彈出二次確認
  Then 顯示原pair永久不能再配對
  And 取消不修改任何狀態
```

### SD-BDD-067：結束成功雙端安全離場

- [ ] **Scenario: 結束成功雙端安全離場**
  - **來源**：`SD-AC-009`、`SD-AC-011`；**優先級／標籤**：@frontend @critical；**元件**：StoryExperienceScreen

```gherkin
@frontend @critical
Scenario: SD-BDD-067 結束成功雙端安全離場
  Given 一方已確認結束且D1成功
  When 兩端收到ended狀態
  Then 兩端不得再操作舊聊天
  And 返回鍵不能開舊對話
```

### SD-BDD-068：送出不明確回應可同步查詢

- [ ] **Scenario: 送出不明確回應可同步查詢**
  - **來源**：`SD-AC-001`、`SD-AC-005`；**優先級／標籤**：@frontend @critical；**元件**：ChatComposer

```gherkin
@frontend @critical
Scenario: SD-BDD-068 送出不明確回應可同步查詢
  Given 發訊遇503或結果不明
  When 玩家選重新同步
  Then 顯示目前無法確認送出結果請重新同步
  And 不得新requestId重寫同句話
```

### SD-BDD-069：第二場發布自然開啟二選一

- [ ] **Scenario: 第二場發布自然開啟二選一**
  - **來源**：`SD-AC-018`；**優先級／標籤**：@frontend @normal；**元件**：StorySelectionScreen

```gherkin
@frontend @normal
Scenario: SD-BDD-069 第二場發布自然開啟二選一
  Given 第一場已完整且後來第二場Published
  When 新一組配對成功
  Then 新Round自然進入二選一
  And 舊Round保持原版不變
```

## Performance — 效能與隔離

### SD-BDD-070：多房間效能須有真數據

- [ ] **Scenario: 多房間效能須有真數據**
  - **來源**：`SD-AC-005`、`SD-AC-012`、`SD-AC-019`；**優先級／標籤**：@performance @critical；**元件**：RealtimeRoomClient

```gherkin
@performance @critical
Scenario: SD-BDD-070 多房間效能須有真數據
  Given 隔離兩個Round與WebSocket
  When 並行發訊與重連
  Then 各房間事件只推本房間
  And 記錄commit到顯示、DO喚醒、Container冷啟動量測
```

## Boundary Conditions — 未上線測試資料重建（風險決策補強）

### SD-BDD-071：只清除非正式舊遊戲資料再用新 Schema 測試

- [ ] **Scenario: 只清除非正式舊遊戲資料再用新 Schema 測試**
  - **來源**：`SD-AC-020`；`SD-RQ-02=A`（2026-11-08）；**標籤**：@edge-case @critical；**元件**：—（部署／測試資料準備）

```gherkin
@edge-case @critical
Scenario: SD-BDD-071 只清除非正式舊遊戲資料再用新 Schema 測試
  Given DatingHigh 尚未上線且已核實此資料庫是受控非正式測試環境
  And 舊版 Round、帳號占用與遊戲依賴測資仍存在
  When 實作階段依受控程序清除全部舊遊戲資料並套用新版 Schema
  Then 不保留或偽造舊 Round 的 Catalog ID 且新遊戲測試資料能正常建立
  And 無孤兒佔用或接受邀請，沒有刪除帳號、個人 Profile 或其他專案資料
  And 未知環境及正式環境不得執行此清除
```

## SD-RQ-01=B 多獨立劇本預留結構與本期功能界線

> 以下 SD-BDD-072～079 以隔離 D1／Domain／API 檢驗**資料結構與封閉權限**；不實作未來第二場的選劇情 UI 或正式續玩 API，也不以測試資料冒充已發布遊戲內容。

### SD-BDD-072：相同 Round 可保存依序完成的多個獨立 StorySession

- [ ] **Scenario: 相同 Round 可保存依序完成的多個獨立 StorySession**
  - **來源**：`SD-AC-017`、`SD-AC-020`；**標籤**：@edge-case @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@edge-case @critical
Scenario: SD-BDD-072 相同 Round 可保存依序完成的多個獨立 StorySession
  Given 非正式隔離 D1 已有同 Round 的第1場 StorySession 且狀態 completed
  When 以相同 Round ID 建立 episodeSeq=2 的另一筆已發布版次 StorySession
  Then 兩筆 StorySession 分別保有 storySessionId、episodeSeq、進度與劇本版本
  And UNIQUE(round_id,episode_seq) 生效且不需要新增第五張表
```

### SD-BDD-073：同輪不得有兩個同時 playing 的獨立劇本

- [ ] **Scenario: 同輪不得有兩個同時 playing 的獨立劇本**
  - **來源**：`SD-AC-017`、`SD-AC-020`；**標籤**：@edge-case @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@edge-case @critical
Scenario: SD-BDD-073 同輪不得有兩個同時 playing 的獨立劇本
  Given 同一 Round 的 episodeSeq=1 仍為 playing
  When 並行建立 episodeSeq=2 且 chapter_status=playing
  Then 部分 UNIQUE(round_id) WHERE chapter_status=playing 拒絕第二筆
  And 第一筆及 Round 不受影響且失敗 batch 完全回滾
```

### SD-BDD-074：第二場候選以共用事件凍結不覆寫初始候選

- [ ] **Scenario: 第二場候選以共用事件凍結不覆寫初始候選**
  - **來源**：`SD-AC-002`、`SD-AC-017`、`SD-AC-020`；**標籤**：@alternative-path @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@alternative-path @critical
Scenario: SD-BDD-074 第二場候選以共用事件凍結不覆寫初始候選
  Given 同 Round 第1場已完成且第1場候選 JSON 仍保持原值
  When 在隔離真 D1 測試 fixture 寫入 episodeSeq=2 的 story.episode.offers.frozen 事件
  Then 第2場候選從該事件的 episodeSeq 和 catalogIds 重建
  And Round 初始候選 JSON 不變且沒有 Episode Offers 或 Votes 表
```

### SD-BDD-075：第2場投票絕不能讀取第1場的最後選票

- [ ] **Scenario: 第2場投票絕不能讀取第1場的最後選票**
  - **來源**：`SD-AC-016`、`SD-AC-017`；**標籤**：@edge-case @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@edge-case @critical
Scenario: SD-BDD-075 第2場投票絕不能讀取第1場的最後選票
  Given 同 Round 第1場已有 A與B 投票且第2場已有獨立凍結候選
  When 在隔離事件政策測試中用 episodeSeq=2 分別提交 A與B 的有效選擇
  Then 結算只採第2場兩名玩家各自最後有效票
  And 第1場選票和重播不可改動第2場勝出且未決議仍隱藏對方票
```

### SD-BDD-076：劇情節點與互動絕不能跨 StorySession 混用

- [ ] **Scenario: 劇情節點與互動絕不能跨 StorySession 混用**
  - **來源**：`SD-AC-005`、`SD-AC-006`、`SD-AC-017`；**標籤**：@error-handling @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@error-handling @critical
Scenario: SD-BDD-076 劇情節點與互動絕不能跨 StorySession 混用
  Given Round 中 episodeSeq=1 completed 而 episodeSeq=2 使用不同 StorySession 與 nodeId
  When 嘗試用第1場 storySessionId 的互動實例或事件影響第2場進度
  Then 真 D1 權限、Session 關聯與 revision guard 拒絕跨場寫入
  And 自由文字仍維持 Round 級事件且全域 eventSeq 有序
```

### SD-BDD-077：本期 UI 與命令只允許啟動第一個獨立劇本

- [ ] **Scenario: 本期 UI 與命令只允許啟動第一個獨立劇本**
  - **來源**：`SD-AC-017`、`SD-AC-018`、`SD-AC-020`；**標籤**：@frontend @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@frontend @critical
Scenario: SD-BDD-077 本期 UI 與命令只允許啟動第一個獨立劇本
  Given 第1場已完成且 DB Schema 容許下一場 StorySession
  When 玩家在 Web或Android 或自行送HTTP與WS指令要求開始第2場
  Then 本期畫面不提供下一場入口且所有未開放的 episodeSeq>1 寫入都拒絕
  And 第1場 completed 後仍可 Round 自由聊天且不自動結束遊戲
```

### SD-BDD-078：下一場不能在前一場進行中或 Round ended 時啟動

- [ ] **Scenario: 下一場不能在前一場進行中或 Round ended 時啟動**
  - **來源**：`SD-AC-010`、`SD-AC-017`；**標籤**：@edge-case @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@edge-case @critical
Scenario: SD-BDD-078 下一場不能在前一場進行中或 Round ended 時啟動
  Given 同 Round 前一場尚在 playing 或整輪已經 ended
  When 模擬 future episode offers frozen、vote、selected 與 end 競態的真 D1 寫入
  Then 固定 SQL guard 拒絕凍結下一場或建下一個 StorySession
  And 沒有孤兒事件、錯誤的投票或重新占用且舊資料不受影響
```

### SD-BDD-079：首場選定事件與後續場次事件有明確場次標識

- [ ] **Scenario: 首場選定事件與後續場次事件有明確場次標識**
  - **來源**：`SD-AC-005`、`SD-AC-016`、`SD-AC-017`、`SD-AC-020`；**標籤**：@edge-case @critical；**狀態**：資料模型／安全契約測試，第二場玩家入口不在本期

```gherkin
@edge-case @critical
Scenario: SD-BDD-079 首場選定事件與後續場次事件有明確場次標識
  Given 同 Round 第一場 N1 自動開始或 N2 兩人已投票結算
  When 讀取完整共用事件流和已選故事快照
  Then 首場投票及 story.selected 都含 episodeSeq=1 且勝出事件含 storySessionId
  And 之後的 episodeSeq=2 同名事件不會被誤判成第1場更新
```

## 需求追溯矩陣

| 已確認 SDD 驗收 | BDD Gherkin 場景 |
|---|---|
| `SD-AC-001` | `SD-BDD-042`、`SD-BDD-043`、`SD-BDD-068` |
| `SD-AC-002` | `SD-BDD-001`、`SD-BDD-002`、`SD-BDD-003`、`SD-BDD-004`、`SD-BDD-023`、`SD-BDD-024`、`SD-BDD-033`、`SD-BDD-034`、`SD-BDD-035`、`SD-BDD-056`、`SD-BDD-057`、`SD-BDD-074` |
| `SD-AC-003` | `SD-BDD-007`、`SD-BDD-032`、`SD-BDD-055`、`SD-BDD-064` |
| `SD-AC-004` | `SD-BDD-008`、`SD-BDD-009`、`SD-BDD-061` |
| `SD-AC-005` | `SD-BDD-009`、`SD-BDD-036`、`SD-BDD-037`、`SD-BDD-044`、`SD-BDD-061`、`SD-BDD-068`、`SD-BDD-070`、`SD-BDD-076`、`SD-BDD-079` |
| `SD-AC-006` | `SD-BDD-010`、`SD-BDD-011`、`SD-BDD-012`、`SD-BDD-063`、`SD-BDD-076` |
| `SD-AC-007` | `SD-BDD-013`、`SD-BDD-014`、`SD-BDD-015`、`SD-BDD-064` |
| `SD-AC-008` | `SD-BDD-016`、`SD-BDD-027`、`SD-BDD-028`、`SD-BDD-029`、`SD-BDD-065`、`SD-BDD-066` |
| `SD-AC-009` | `SD-BDD-016`、`SD-BDD-029`、`SD-BDD-066`、`SD-BDD-067` |
| `SD-AC-010` | `SD-BDD-017`、`SD-BDD-048`、`SD-BDD-049`、`SD-BDD-078` |
| `SD-AC-011` | `SD-BDD-017`、`SD-BDD-049`、`SD-BDD-067` |
| `SD-AC-012` | `SD-BDD-018`、`SD-BDD-043`、`SD-BDD-050`、`SD-BDD-051`、`SD-BDD-062`、`SD-BDD-070` |
| `SD-AC-013` | `SD-BDD-019`、`SD-BDD-030`、`SD-BDD-052`、`SD-BDD-053` |
| `SD-AC-014` | `SD-BDD-010`、`SD-BDD-031`、`SD-BDD-032`、`SD-BDD-063` |
| `SD-AC-015` | `SD-BDD-020` |
| `SD-AC-016` | `SD-BDD-002`、`SD-BDD-003`、`SD-BDD-005`、`SD-BDD-006`、`SD-BDD-025`、`SD-BDD-026`、`SD-BDD-045`、`SD-BDD-046`、`SD-BDD-056`、`SD-BDD-057`、`SD-BDD-058`、`SD-BDD-059`、`SD-BDD-060`、`SD-BDD-075`、`SD-BDD-079` |
| `SD-AC-017` | `SD-BDD-001`、`SD-BDD-005`、`SD-BDD-006`、`SD-BDD-037`、`SD-BDD-038`、`SD-BDD-039`、`SD-BDD-045`、`SD-BDD-047`、`SD-BDD-072`、`SD-BDD-073`、`SD-BDD-074`、`SD-BDD-075`、`SD-BDD-076`、`SD-BDD-077`、`SD-BDD-078`、`SD-BDD-079` |
| `SD-AC-018` | `SD-BDD-001`、`SD-BDD-002`、`SD-BDD-003`、`SD-BDD-033`、`SD-BDD-055`、`SD-BDD-069`、`SD-BDD-077` |
| `SD-AC-019` | `SD-BDD-018`、`SD-BDD-070` |
| `SD-AC-020` | `SD-BDD-021`、`SD-BDD-022`、`SD-BDD-034`、`SD-BDD-040`、`SD-BDD-041`、`SD-BDD-053`、`SD-BDD-054`、`SD-BDD-071`、`SD-BDD-072`、`SD-BDD-073`、`SD-BDD-074`、`SD-BDD-077`、`SD-BDD-079` |

**覆蓋率**：20/20 項 SPEC 驗收有獨立可執行的行為場景，BDD 實作與驗證均未開始；完整十場內容開發與第一場品質 Gate 不得混算。

## 關聯文件

- [已確認 SDD](../specs/SPEC-001-StoryDialogueAndExit.md)
- [TDD](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md)
- [RiskAudit](../specs/SPEC-001-StoryDialogueAndExit-RiskAudit.md)
- [MatchingSessions BDD](SPEC-001-MatchingSessions-BDD.md)（僅共用既有配對與原子占用邊界）

**最後更新**：2026-11-08；**狀態**：⏸️ 未開始。
