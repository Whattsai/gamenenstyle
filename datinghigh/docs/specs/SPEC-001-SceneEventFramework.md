# SPEC-001-SceneEventFramework：場景、主線與可重用事件框架

**功能 ID**：SPEC-001-SceneEventFramework  
**來源 MVP**：[MVP-001-LoveGameDatingApp.md](../requirements/MVP-001-LoveGameDatingApp.md)（US-005／AC-005-04～16）
**順序**：第 5 份，共 9 份 SPEC；依賴 `SPEC-001-MatchingSessions`、`SPEC-001-StoryDialogueAndExit`，提供 `SPEC-001-AffectionAndFeedback`、`SPEC-001-OnlineGamesAndQuests` 可重用基礎  
**優先級**：高  
**日期**：2026-11-13（原 SDD 業務決策確認：2026-11-12）  
**階段**：依使用者要求暫停；首條主要流程及本人化身入口已完成本地技術驗證，整份框架規格尚未結案；原 SDD／RiskAudit 取捨及本人化身入口條件均已由使用者確認，實作證據與暫停範圍見 [驗證紀錄](../verification/SPEC-001-SceneEventFramework-Verification.md)，人工 Gate 不代簽。
**負責角色**：DatingHigh 應用開發；業務及人工驗收由使用者確認

## 1. 功能概述、範圍與非目標

**What**：把目前單一 `story-scenes.json`「雨聲書店」混合的場景表演、主線節點、互動定義，重構為**劇情類別（Category）→ 場景（Scene）→ 預設主線（Narrative）＋事件繫結（Event Binding）**。同一場景能有多條主線；有序主線須滿足前置條件，其他合格主線隨機並優先同一對玩家未玩過；事件規則可跨場景／主線重用。主線抵達收尾即自然完成，配對與聊天不結束，兩位玩家同意後可再開新一場。

**Why**：新場景、新主線、新事件主要透過已驗證的內容資料發布，而非每次改 .NET、D1 Schema、Worker 或 React 畫面；同時保留未來 AI 沉浸模式使用共用場景與事件的可能。

**本期包括**：類別推薦／投票改為選類別、場景與主線決議、版本化內容驗證、通用條件與事件生命週期、同一對玩家去重、單次劇情完成、雙方同意重玩、多場次隔離、既有「雨聲書店」正式改造及 Web／Android 回歸。

**不包括**：MVP-002 AI 即時生成主線／跨場景演出／無限劇情；好感度計分、正式 2 小遊戲及 3 任務的全部內容、約會、告白、History／Housekeeping、額外推薦候選預算表、SQL Trigger、正式發布或資料清除。場景中的互動樣例仍必須可玩，不能因未進入 OnlineGamesAndQuests 而空白。

### 1.1 必守的既有基線

- `cloudflare/migrations/0005_story_dialogue_exit.sql` 已定義 `content_story_catalog`、`game_story_sessions`、`game_round_events`、`game_interaction_instances`，及 `game_rounds.story_offer_catalog_ids_json`；後者目前代表**首場故事候選**，而非新類別。
- `contracts/story-scenes.json` 的 `scene-01/v2` 目前把「雨聲書店」的時間、地點、主線節點、`bookmark`／`reading-path` 互動與 2.5D 鏡位綁在一起；`StoryGraphPolicy` 目前強制至少兩個 ending，必須修正為**至少一個可達的收尾**。
- 現有 `StoryRecommendationPolicy` 推薦具體 StoryCatalog，`StorySelectionPolicy` 按原邀請方票決；`story-commands.ts`、Application 及 API 本期限制 `episodeSeq=1`。新方案要解除此限制，但**不能**以直接放寬 Client 輸入取代交易內驗證。
- 即時通訊沿用 `GameRoomSocket` DO、`IRoundRealtimeNotifier`、`game_round_events` 全域遞增序號／冪等 `clientRequestId`、授權 HTTPS snapshot／事件補漏；保留雙人真實投票、聊天室和「結束本輪互動」二次確認。
- 現有全身化身、B1 五表情、R2 ready Manifest、2.5D 分鏡、Web／Android Gate B 還有未完成驗收，**不移出、重做或降低 `SPEC-001-StoryDialogueAndExit` 的既有 Gate**。

### 1.2 本人目前採用化身的遊戲入口條件

遊戲入口、恢復、即時連線票券及遊戲操作須由伺服器核對本人目前正式採用的化身。內建化身須屬正式完整五表情目錄；生成化身須為本人所有、未刪除且 ready 的正式資產，具有有效 ready Manifest 及五張完整表情物件。缺少選用、製作未完成、清單或任一表情缺失時回 `409 OWN_AVATAR_PACK_NOT_READY`，不提供劇情內容、不核發票券、不寫入遊戲操作。

只核對目前採用者；另一組尚在製作的化身不得阻擋已就緒的選用。讀取私人儲存前後須重驗登入與目前選用。畫面清除既有場景、角色、聊天室及草稿，顯示原因及「前往個人檔案」；選用已就緒化身後可回同一輪，不重新抽劇情。第三人／撤銷授權仍優先回 403／401；結束本輪及 ended 安全狀態不受此條件阻擋。此規則不啟動或自動續產 B1。

## 2. 名詞、DDD 邊界與責任分層

| 名稱 | 定義 | 範圍 |
|---|---|---|
| `StoryCategory` | 玩家共同選擇的劇情**主題**（例如浪漫／懸疑）；與本人 Profile `reading/coffee/puzzle` 等**興趣標籤不同** | 可重用內容 |
| `Scene` | 背景、時間／空間氛圍、鏡位、可用互動區域；可被多個 Category 使用 | 可重用內容 |
| `Narrative` | 人工預寫的主線：開場、可達收尾、可選分支／不同結果；一場景可綁多主線 | 可重用內容 |
| `EventDefinition` | 具版本的共用互動／敘事事件定義：玩法模組、參數、安全輸入 | 可重用內容 |
| `EventBinding` | 在某主線、場景或全域事件池中套用 EventDefinition 的**位置與規則**：用途、條件、隱藏／隨機、重複限制、完成效果 | 各來源的 immutable 內容版本 |
| `GameRound` | 真正兩位玩家的整場配對遊戲與聊天／終止授權根；結束才永久排除該 pair | D1 Round Aggregate Root |
| `StorySession/Playthrough` | 同一 Round 的第 `episodeSeq` 次劇情體驗；**一場次一條主線**，完成後仍留 Round | D1 執行子 Aggregate |
| `SceneVisit` | 場次進入場景的事實；MVP-001 每個 Playthrough 恰好一筆 | D1 執行事實 |
| `EventInstance` | 這次實際觸發的某個 binding 的狀態；非跨場共用答題資料 | D1 執行事實 |

**DDD 規則**：`GameRound` 是所有配對參與權限與安全結束的交易邊界；`StorySession`、`SceneVisit`、`EventInstance` 的建立／推進必由 Round active、兩個 `game_active_round_claims`、登入 Session 與預期 Revision 同批保護。內容實體唯讀且發布後不可變。

**分層責任**：

| 層 | 具體職責與可沿用元件 |
|---|---|
| Domain | `StoryCategoryRecommendationPolicy`（延伸現有推薦排名）、`SceneSelectionPolicy`、`NarrativeEligibilityPolicy`、`EventRulePolicy`、`PlaythroughLifecyclePolicy`；純規則、不可引用 D1／R2／DO |
| Application | 在現有 `StoryDialogueService` 周邊抽取場景／主線／事件 orchestration；共用 `IPlatformClient`／`IRoundRealtimeNotifier`；沒有另一份房間服務 |
| Infrastructure / Worker | `content_*` 的唯讀 D1 發布索引與已授權 R2 Manifest；既有固定 prepared SQL 受保護橋接、真 D1 batch；不運行編輯者 JavaScript／SQL |
| API / Expo | 沿用 `/api/v1/game-rounds/{roundId}`、`StoryExperienceScreen`、`RealtimeRoomClient`、`ADVStage` 與 `InteractionRenderer`；新增類別及下一場同意投影，既有 2.5D 呈現不重做 |

## 3. 選擇、主線與劇情完成規則

### 3.1 類別推薦與雙人決議

1. 配對邀請被接受時，依當下兩人的正式興趣與**至少具有一條「同時符合該類別、該場景及有序前置條件」可玩主線**的已發布場景集合，對 Category 進行推薦（不是 Story ID），取 `N=min(3,eligibleCategoryCount)`；僅有場景標籤而無適用主線的 Category 不得入選。**RA-Q1=A 已確認**：一條主線可以適用多種類別，但不能用純浪漫主線填充懸疑類別。
2. `N=0`：維持既有「不可建立空 Round」策略、回明確錯誤，不造假內容。`N=1`：直接決議唯一類別，不需要兩人假投票，隨後自動抽場景和主線；`N=2`：雙方二選一；`N>=3`：依雙方共同／個別興趣均衡排名取前三，雙方三選一。此候選數量依真實發布內容自動決定，不設測試用「滿三場」門檻。
3. 雙方同票用共同類別，異票仍用**原邀請者最後有效票**；結算前允許改票，對方只看已投票與否，不能知道其具體選項。首場候選凍結於配對成立當下。**RA-Q2=A 已確認**：下一場在雙方同意齊備、由伺服器實際開始新場次時，**同一受控 D1 提交讀取兩人當下最新已儲存的興趣**，重新計算並凍結當場真正可玩的 Category 候選與其順序（依 Episode 事件保存）；不得沿用配對當下興趣、不得在兩端各自重新計算、不得覆寫首場快照。後續改變興趣不回溯已凍結場次。若當下沒有可玩內容，不建立空 Episode，保持原 completed Round 與聊天，回傳 NO_PLAYABLE_STORY 供兩人稍後重試；不能重擲已提交成功的內容。
4. Category 的 `interest_tag_ids_json` 使用已存在 ProfileCatalog 的興趣 ID；對外推薦理由只使用雙方允許揭露的共同興趣，否則中性理由。對話與其他人個人偏好不得因類別／排名洩漏。

### 3.2 場景與主線隨機

1. 已決議的類別先查 `content_scene_category_links` 及 Published Scene，並要求其**至少有一條 Narrative Manifest 的 `eligibleCategoryCodes` 包含該 Category 穩定 `code`、已發布且滿足順序／前置條件**；否則排除此場景。`eligibleCategoryCodes` 可有多個元素，以支援同主線跨類別；不得只以 Scene 具某類別，就讓該 Scene 內任意 Narrative 被抽中。以**排序後的 pair（account_low_id/account_high_id）**對所有歷史已完成的場次比對；優先給沒體驗過的場景較高抽中權重，但仍允許已玩場景出現。全數已玩過時在所有合格場景抽選；改配對對象不沿用舊權重。
2. 選中場景後，只考慮其綁定且已發布、**`eligibleCategoryCodes` 含已選 Category.code** 的 Narrative，驗證 `prerequisites`、`sequence_group_id` 及 `sequence_order`。同一序列需完成上一個要求的章節才可抽中後章；不符合即排除。無序主線不受序列約束。
3. **有序／無序混合**：先算合格集合，再依同一對玩家的主線完成紀錄調整權重、隨機決定；不強制進入已解鎖的序列下一章。當合格主線皆已體驗過，可再次抽到舊主線。換配對對象重算，不把 A＋B 的紀錄當成 A 的全域永久排除。
4. 選擇在**伺服器**計算並以 `scene.selected`／`narrative.selected` 系統事件及該場 StorySession 釘選，不可按重整、掉線、重播指令就重新抽，不能信 Client 指定不在候選的 Scene/Narrative ID。不得因正在玩某場而另抽第二條。
5. **SEF-RQ-01=A 已確認**：場景與主線的「未玩過：已玩過」抽選初期權重均為 **3:1**，而不是絕對禁止重複；後續可依使用者首場試玩調校。若候選全為同一種類，則在該候選集合內正常隨機；有序解鎖是**硬條件**，不參與權重討價還價。同一場景有新主線但場景舊的情況，仍有機會選中該場景。伺服器 RNG 可注入測試種子、正式使用安全隨機值；UI 不提供「重抽直到滿意」漏洞。

### 3.3 主線圖與事件角色

- 一條 Narrative 必須有唯一 Entry、至少一個可達 Ending；所有可走分支要指向存在的節點，無法抵達收尾、缺失資產、無界循環、未定義結算類型或無效前置條件均不得 Published。**不再要求至少兩個 Ending**，線性主線完全合法。
- `narrativeRole` 是某個 `EventBinding` 在指定主線中的 `main|side`，不是 `EventDefinition` 的全域固定欄位；Scene／Global 來源預設為自由事件，若某條主線需將其指定為主線必要事件，應由該 Narrative 的 Binding 明確引用並覆寫用途。同一 EventDefinition 可在主線 A 當 `side`、主線 B 當 `main`。**「隱藏」「隨機」「條件觸發」不可做成互斥 enum**：獨立使用 `visibility=visible|hidden`、`selectionMode=fixed|weighted_random`、`triggerConditions` 以及 `interactionType`、`sceneScope`、`repeatScope`；因此同一事件可以是「有前置條件的隱藏隨機支線」。同條主線需不同用途時使用不同 Binding ID 並逐一驗證。
- 條件只允許受控 DSL：`node_entered`、`choice_committed`、`event_completed`（指向 binding ID）、`flag_equals`、`narrative_completed`（供有序主線解鎖），以及由伺服器允許的雙方合作完成狀態；`all/any/not` 為受界限的布林組合，禁止任意字串求值、SQL、JS、外部 URL、任意私有 Profile 欄位。
- EventDefinition 的 `moduleType` 必須由 `InteractionRegistry` 的白名單認識：現有 `inspect-object`、`cooperative-choice` 直接遷移；未來遊戲／解謎類需要 OnlineGamesAndQuests 明確實作，不能以宣告 JSON 就假裝前端有 renderer。Publisher 須拒絕缺 renderer/validator 的正式內容；也須移除舊 `StoryGraphPolicy` 對「至少四節點、至少兩個 Ending」的硬限制，改為依內容合理性驗至少 Entry 與可達 Ending，不以固定分支數充數。
- **事件來源可疊加**：Narrative 專屬 Binding、Scene 專屬 Binding、全域共用 EventPool 的 Binding 都可在本次場次成為候選，系統依已釘選 Scene 能力標籤、主線狀態、前置條件、安全白名單及出現機率裁定。全域事件不代表任何場景都能無條件出現；publisher 必須確認場景能力相容。Binding 的穩定識別採 `scope + sourceId + bindingId`（亦即 `game_event_instances.binding_id` 存完整限定鍵），避免不同來源撞名；相同 `eventId/repeatGroup` 的同語意重複候選要由伺服器按規則去重，不讓同一件事突然觸發兩次。必要主線事件優先保障主線節奏，場景／全域自由事件只能在允許的節點觸發，不搶占雙人協作閘門。
- `repeatScope=playthrough` 以同一 StorySession／Binding 去重；`repeatScope=round` 查同一 Round 的已完成相同語意事件鍵（可定義 `repeatGroup`），不將其他配對或真人個人聊天紀錄作隱含條件。隱藏事件觸發前不得提前洩漏內容／條件；未進入 trigger 時不得創建已完成狀態。
- `requiredForEnding` 為可選 binding 規則；一條主線的有效 Ending/必要前置條件才是可結束的權威，**不強制做完 side/hidden**。可選事件完成所設結果旗標可影響下一節／收尾內容，但不把這解讀為每條主線都需要多結局。

### 3.4 收尾、自由聊天與再次遊玩

`playing → completed` 僅表示**此場次主線完成**，不是 `game_rounds.active → ended`。真人操作有效提交並達到 Ending 時，與事件序號／Revision 在**同個 D1 交易**將章節完成且發出系統 `chapter.completed`；不額外等待按「完成劇情」。**SEF-RQ-02=A 已確認**：主線抵達 Ending 自然封存本場所有尚未完成的支線／隱藏事件，不再觸發或推進這次的任何事件；完成後該場不接受新事件或改劇情進度，但仍可在 Round 自由聊天。若要探索漏掉的支線，雙方同意新一次遊玩後才可重新進入。

再次遊玩採**雙方同意**：在目前最新場次 completed 且 Round active 的前提下，由真實玩家各自提交 `story.next.requested`（可撤回），只在**同一個已完成 episode** 上聚合兩位最後有效的「同意」，兩人皆同意才原子產生下一個 `episodeSeq` 的候選凍結事件；若唯一類別直接建立下一場，否則等待類別投票。不同場次的同意／類別票不混用；離線不假投票、不同意不阻止聊天。永遠只有一個待選或 playing 的最新場次；同一 Round 的完成紀錄可以有多筆。

原 Round 的二次確認退出照舊：一方確認後將 `game_rounds` ended、釋放 Claims、永久排除該 pair；歷史聊天室與互動不再由原玩家 API 回讀。此 SPEC 不安排 Housekeeping／History 功能。

## 4. 資料結構（D1 + Immutable R2）

**SEF-RQ-03=A 已確認：新增五張必要 D1 資料表並沿用現有表，不建額外事件內容目錄表（`content_event_catalog`），EventDefinition 使用 Immutable R2 Manifest。** 優先延用現有資料表與已驗證機制，不另建推薦表、選票表、Episode 表或 AI Job 表。下列 Schema 已經使用者同意，細部實作仍須由 BDD/TDD、RiskAudit 驗證一致性。只允許在實作階段以新 `0006`（或下一個未使用序號）向前 migration／受控非正式測試資料清理完成；**不直接覆寫可能已套用的 0005 或動未知／正式環境**。

### 4.1 新增資料表（建議 5 張）

| 表 | 建議欄位及型別 | 約束／用途 |
|---|---|---|
| `content_story_categories` | `category_id TEXT PK`、`code TEXT`、`version TEXT`、`title TEXT`、`interest_tag_ids_json TEXT`、`recommendation_priority INTEGER`、`status TEXT`、`published_at INTEGER NULL` | `UNIQUE(code,version)`、`status draft/published/retired`、興趣 JSON array、同 code 最多一 published 版 |
| `content_scene_catalog` | `scene_catalog_id TEXT PK`、`scene_id TEXT`、`version TEXT`、`title TEXT`、`manifest_key TEXT`、`manifest_sha256 TEXT`、`status TEXT`、`published_at INTEGER NULL` | `UNIQUE(scene_id,version)`、Manifest key 唯一、hash 64 hex、同 scene 至多一 published；含視覺素材／鏡位 |
| `content_scene_category_links` | `scene_catalog_id TEXT FK`、`category_id TEXT FK` | 複合 PK；版本化 Scene 連結類別，可多對多；發布時要求至少一個類別且有可玩主線 |
| `game_scene_visits` | `scene_visit_id TEXT PK`、`story_session_id TEXT FK`、`visit_seq INTEGER`、`scene_catalog_id TEXT FK`、`entered_at INTEGER`、`left_at INTEGER NULL` | `UNIQUE(story_session_id,visit_seq)`；MVP-001 `visit_seq=1` 唯一訪問，與章節 completed 同批填 `left_at`，未來多場景可沿用記錄概念 |
| `game_event_instances` | `event_instance_id TEXT PK`、`story_session_id TEXT FK`、`binding_id TEXT`、`event_id TEXT`、`event_version TEXT`、`repeat_group TEXT`、`status TEXT`、`state_json TEXT`、`revision INTEGER`、`created_at INTEGER`、`completed_at INTEGER NULL` | `UNIQUE(story_session_id,binding_id)`；status active/completed/cancelled；revision CAS、有限長合法 JSON；重複範圍由已釘選 Binding 規則判定，不完全信任表內狀態 |

**不新增 `content_event_catalog`**：本期用**SHA-256 完整性驗證的版本化 R2 EventDefinition Manifest** 及 Narrative 的 `eventBindings` 直接引用，發布時完整解析依賴與雜湊；避免每個可重用事件再佔一張資料表。若以後需讓運營人員在 D1 搜尋／上下架單一事件，再依具體需求增加 catalog，不影響 Event ID/version 契約。

### 4.2 現有資料表調整

| 表 | 建議異動 | 不變條件 |
|---|---|---|
| `content_story_catalog` | 現有 `story_id` 正式解釋為**預設主線識別**，新增 `scene_catalog_id TEXT FK`、`sequence_group_id TEXT NULL`、`sequence_order INTEGER NULL`、`prerequisites_json TEXT DEFAULT '[]'`；**主線適用類別留在有 SHA 驗證的 Narrative Manifest `eligibleCategoryCodes`（穩定代碼），不為此新增 D1 表**；版次、Manifest SHA、發布唯一條件沿用。已有 scene-01/v2 需以新首條主線的內容目錄與 R2 資產映射重建 | 不改成 AI 動態主線目錄；有序 group/order 必須成對有效，無序均 NULL，先決條件 publisher 驗證無循環 |
| `game_rounds` | `story_offer_catalog_ids_json` 重命名或重建為 `story_offer_category_ids_json`，**只代表首場**凍結的最多三個 Category ID；之後場次 `story.episode.offers.frozen` 事件紀錄 `categoryIds` | 保留 `round_id`、pair、status、`last_event_seq`、有效邀請與 Claims；不新增推薦／投票表 |
| `game_story_sessions` | 仍作 **Playthrough** 權威，不為純命名重建 `game_playthroughs`；原 `catalog_id` 是本場選中的 Narrative Catalog，增加 `selected_category_id TEXT FK`；場景由 `game_scene_visits` 及 Narrative→Scene 一致性讀取。移除 API/Domain `episodeSeq=1` 限制但保留 `UNIQUE(round_id,episode_seq)`／同輪最多一個 playing 索引 | `current_node_id`、`chapter_status=playing/completed`、`progress_revision` 原子 CAS；新一場選擇前尚無 Session，用 events 快照表示 pending |
| `game_interaction_instances` | 保留現行欄位；若互動由 EventBinding 觸發，建議加 `event_instance_id TEXT NULL FK` 以追溯來源，舊模組仍可無此值 | 不複製第二份聊天或題目答案，保留雙人提交／冪等條件 |
| `game_round_events` | 保留八欄／序號／冪等，擴充明確白名單 event kind 與 `episodeSeq` 投影、隱藏投票／隱藏事件保護 | `actor_account_id` 只能取登入真人；系統事件 NULL；不可由 Client 指定 kind 或任意 JSON |
| `game_active_round_claims`、`match_invitations`、`user_profiles` | **零 Schema 變更** | 沿用原 Pair、原邀請方、配對資格及全平台單人佔用權威 |

**資料表數量**：推薦新增 **5 張**；原有 4 張劇情／互動／事件表及 Round 依上列調整，沒有額外 `content_narrative_catalog`／`game_playthroughs`／投票表。這是兼顧清楚責任與最小 migration 的建議，而不是對外宣稱現行資料庫已具備新欄位。

**主要索引**：保留 `idx_game_round_pair`、`idx_game_story_playing`、`idx_game_vote_episode`；增 `(scene_catalog_id,status)` 主線候選、`(sequence_group_id,sequence_order)` 連續章節、`(category_id,scene_catalog_id)` 反向場景查詢、`(story_session_id,status)` 事件狀態及 `(story_session_id,visit_seq)`。Pair 歷史透過 `game_rounds.account_low_id/account_high_id` JOIN completed `game_story_sessions` 與 `game_scene_visits` 查，不存第二份可漂移的完成清單。

### 4.3 R2 內容拆分、發布與釘選

- **Category**：小型 D1 目錄與 Tag 權重；不等於 Profile tag。Narrative 以 Category 穩定 `code` 表示適用性，實際場次仍固定 Category 的已發布版本 ID，避免單純更新 Category 顯示版本就讓既有 Narrative 失效。
- **Scene Manifest**：`sceneId/version`、`time`、`place`、背景、2.5D `scenePresentation`／鏡位、場景能力標籤、素材 hash 及該場景共用的 `sceneEventBindings`；不攜帶某條主線的玩家進度。
- **Narrative Manifest**：`narrativeId/version`、場景 ID/version、**`eligibleCategoryCodes`（非空、去重的 Category 穩定 code 陣列，可同時適用浪漫及懸疑）**、entry、nodes、choices、ending、此主線特有的 `narrativeEventBindings`、建議話題；一條完整可收尾的主線。Publisher 確認每個 code 是合法 published Category，且與該 Scene 的類別關聯一致；新候選及伺服器抽選均使用此限制，退休版只供釘選的舊場次繼續。
- **Global EventPool Manifest**：獨立版本及 SHA 的共用 Binding 清單，依 `sceneCapabilities`、前置規則與觸發設定自動成為符合資格場景的候選，不必在每個主線重複宣告；只在有明確可用且相容的 Scene 時裁定。
- **Event Definition Manifest**：`eventId/version`、`moduleType`、schema 限制、題目／結果型別。各來源 Binding 定義 `narrativeRole`（若在主線有此用途）、`visibility`、`selectionMode`、`triggerConditions`、`repeatScope`、`repeatGroup` 與環境需求。隱藏與隨機可同時成立。各 Scene/Narrative 引用的 Event 和全域池版本及 SHA 必須一併釘選；不同場景可共用同一 `eventId/version`，但執行 Instance 各自獨立。
- 發布工具先驗：UUID/Stable ID／版次不重複、索引／Manifest 雙向對應、興趣 Tag 有效、所有必需 Event／renderer 存在、Scene 類別非空、**Narrative 適用類別不可空／不可包含不屬於 Scene 的類別或無效 code；每個供玩家選的類別都必須有至少一條真正符合類別且滿足前置條件的主線**、序列無循環、Entry 與至少一 Ending 可達、隱藏條件安全、範圍與大小／hash、2.5D 資產有效、時間地點事件完整；**全部通過後**才以 D1 原子發布可玩組合。
- 選中的 category/scene/narrative/event version 都在本次選擇快照及 StorySession 中被釘選；R2 內容 immutable，內容退休不影響現有正在玩的場次，重連後不跳版。不把 `FILES` 私人真人照片與遊戲公開素材混桶。

**示意（非目前已存在的可執行 Manifest）**：

```json
{
  "narrativeId": "rain-bookshop-lost-note",
  "sceneId": "rain-bookshop",
  "version": "v1",
  "entry": "entry",
  "nodes": [{"id":"entry","choices":[{"id":"investigate","next":"shelves"}]},
            {"id":"shelves","choices":[{"id":"finish","next":"ending"}]},
            {"id":"ending","ending":true,"choices":[]}],
  "eventBindings": [
    {"bindingId":"bookmark-side","eventId":"inspect-bookmark","eventVersion":"v1",
     "narrativeRole":"side","visibility":"hidden","selectionMode":"weighted_random",
     "triggerConditions":{"all":[{"nodeEntered":"shelves"}]},
     "repeatScope":"playthrough","repeatGroup":"bookmark"}
  ]
}
```

此範例僅展示結構，不替代真正雨聲書店完整 2.5D 資產、台詞、互動／兩種既有收尾。

### 4.4 與全身角色／五表情／2.5D 舞台的整合契約（2026-11-13 影響稽核）

本節僅補齊已確認體驗的跨 SPEC 整合，不另造角色、動畫、圖片生成或資料表；以 `StoryDialogueAndExit`、`AvatarAndPreferences` 的實際實作及 `docs/verification/SPEC-001-StoryDialogueAndExit-Verification.md` 最新證據為基線，**不以自動測試取代使用者 Gate B**。

| 來源 | 權威與擁有者 | SceneEventFramework 使用規則 |
|---|---|---|
| Scene 2.5D 背景／透明前景／鏡位／光色／熱區／音效 | Published Scene Manifest（`scenePresentation.version=2.5d.v1`）；呈現由 `StoryStage`／`story-stage-geometry` 負責 | 原 `scene-01/v2` 清空桌面背景、透明桌面前景與共用 cameraFrame、`cameras/hotspots/audioCues` 不得退化；場景空間資產不可被移至只屬單一主線的資料 |
| Narrative 節點表演 | Published Narrative Manifest 的 `nodes[].presentation.cameraId/expression/hotspotIds` | 各 ID 要對應同一釘選 Scene；節點 ID 只在 `storySessionId` 的範圍內唯一 |
| Event 演出 | Published EventBinding 的可選 `presentationEffects`，配合伺服器已提交的 EventInstance/sequence | 只允許引用現有 Scene camera、五表情 ID、合法 hotspot 和發布過的 audio cue；演出是*暫時覆寫*，不是修改 Narrative Node、化身或直接觸發生成 |
| 對方角色與五表情 | AvatarAndPreferences 已正式採用的 `full-body.v1`、`standing`、`avatarVersion`＋私人 partner-avatar API | `neutral/smile/surprised/thoughtful/concerned` 五圖及 `stageAnchors.head/feet` 由 `StoryPortrait` 顯示；Scene/Narrative/Event Manifest **不能存私人 R2 key、角色圖 URL、Gemini job 或表情生成結果** |
| Round／聊天／授權 | `game_rounds`、`game_round_events`、Room DO、授權快照 | 新 Episode 不產生另一間聊天室或另建房間；舊 Round ended／401／403 必須清私有角色投影 |
| B1 產圖／續做 | AvatarAndPreferences B1 流程 | 本 SPEC 只能使用已採用 ready 的人物套組；**不可呼叫 Gemini、下一張表情、正式採用 API 或因前景恢復自動續產** |

**規則與失敗保護**：

1. **發布校驗**：Scene 保留完整 `backgroundAsset/foregroundAsset/cameras/hotspots/foreground/audioCues`；Narrative Node 的 cameraId／hotspotIds 指向 Scene 中存在的版本化 ID。EventBinding 的 `presentationEffects` 僅接受有限的 `cameraId/expressionId/audioCueId/hotspotVisibility`，由 Publisher 白名單驗證且 Runtime 只接受已固定版本的安全投影，禁任意 URL／Script／新 Pose；不增加第六張 D1 表或第二個 renderer。
2. **事件驅動的演出不改故事權威**：Narrative／Scene／Global 事件先由伺服器計算 hidden／conditional／random／repeatScope／前置條件，僅投影當下可見、可互動的熱區。純靜態 Scene Manifest 的熱區座標**不是操作資格**，不得洩漏尚未解鎖 hidden 事件名稱或答案。點擊熱區只是開啟檢視，必須真人選項提交並由 D1 CAS／Revision 接受才形成事件結果；關閉視窗不寫入選擇。
3. **效果的起訖**：事件演出依已提交的 EventInstance／eventSeq 疊加在 Narrative Node 的基底鏡位與表情上；Event 完成、取消、Chapter completed 時清掉覆寫，回到基底，無須再產生新的 Narrative Node。同 eventSeq 重播不得重放已完成互動；主線進度只接受授權節點轉移，不能把 `presentationEffects` 當作推進指令。
4. **角色與內容雙版本互不污染**：Scene／Narrative／Event R2 Manifest 依場次固定版本和 SHA；對方 `avatarVersion` 由當前有效授權的已採用版本獨立更新。收到 `avatar.updated` 不改 `game_story_sessions.progress_revision`，也不重抽故事。五表情完整解碼且台詞到達安全句尾後才一起切換；新套組載入失敗保留仍授權的完整舊套組或安全佔位，不混入部分表情。以 Round+avatar generation fence 排除舊回應；失權即清除私人圖片，不能因快取還原失權畫面。
5. **跨場次 UI 狀態**：原 `StoryExperience` 的 `episodeSeq:1` 必須改成伺服器最新 Episode。新 `storySessionId` 需重設 `ADVStage` 的 line/letters／動畫、Stage camera／event overlay、物件或合作 Modal、上一場 pending action／音效 cue，採 `storySessionId + nodeId` 而非只有 `nodeId` 辨識。相同 `roundId` 保留已提交聊天、配對、仍有效角色與 WebSocket；完成的 Episode 仍可看收尾和聊天，不可因 `phase` 不再 playing 就將舞台卸載。
6. **背景與恢復**：Android Home／Web 失焦暫停 Scene 微動／音訊，回前景以授權 `/experience` 和增量事件游標恢復場次、Event 與角色；不重擲場景、不重送未知操作、不 autoplay 音效、不觸發表情生成／B1 續產。現有手動「關閉場景微動」必須維持。角色五圖同版本重用已解碼素材，Event 只按需載入自己的資產；Web／Android 應量測實際切換延遲、jank、記憶體，而非宣稱虛構 FPS。
7. **首條保真與 Gate**：以已確認的免費 16 個全身角色／80 張正式五表情 WebP 和獲核准 AI 套組為基線，`scene-01/v2` 書店前景遮擋、兩種 Ending、`bookmark`／`reading-path`、音效及鏡位不重做、不重畫。StoryDialogueAndExit 原 UX-P1～P5、B1、人物與 Gate B 繼續獨立稽核；2026-11-13 的局部回放測試不等於真人第二手機或使用者正式試玩通過。

**接口邊界**：沿用 `/experience` 快照、Room 事件游標與 `avatar.updated` 授權投影，Event 演出資訊可以由固定 Scene/Narrative/Event 內容＋已提交狀態在前端還原。**不新增 D1 表，不存另一份角色資料，不提前實作沉浸模式或新姿勢生成**。

## 5. HTTP／WebSocket API 設計（建議契約）

沿用既有 `/api/v1/game-rounds/{roundId}` 成員權限，所有 POST 由 Cookie／Bearer Session 推導真人 actor、接受 UUIDv7 `clientRequestId`，並驗 Round active + Claims；WS 只通知 D1 已提交的變更。下述新 API 命名為 SDD 提案，**不表示程式已有端點**。

| 方法與路徑（相對 `/api/v1`） | 行為／回應 |
|---|---|
| `GET /game-rounds/{roundId}/experience`（既有擴充） | 回最新 `episodeSeq`、`phase=pending_category_selection|playing|completed`、Category offers、已決議 Scene／Narrative、Node、事件摘要、`partnerHasVoted`／`partnerAgreedNext`；不可洩漏未結算的對方投票 |
| `GET /game-rounds/{roundId}/story/offers`（既有調整） | 回該次被凍結的最多 3 個**Category** 卡（`categoryId,title,rank,summary`）；移除直接選 Story Catalog 的舊語意 |
| `POST /game-rounds/{roundId}/story/vote`（既有調整） | `{clientRequestId,episodeSeq,categoryId}`；只在 pending 且候選含此類別有效；未結算只回等待狀態，決議後回 selectedCategory 與 StorySession |
| `POST /game-rounds/{roundId}/story/next`（新增） | `{clientRequestId,completedEpisodeSeq,agree:boolean}`；記真實同意／撤回；兩人同意才開始下一場，未同意維持聊天 |
| `POST /game-rounds/{roundId}/story/event`（新增或延伸 existing interaction submit） | `{clientRequestId,storySessionId,bindingId,actionId,expectedRevision}`；server 使用釘選 Manifest 判斷 Event/Node/條件，單交易提交 EventInstance、互動結果、Round event |
| `POST /game-rounds/{roundId}/events/query`（既有） | 按全域 `sequence` 有界補漏，授權欄位與隱藏資訊安全投影 |
| `POST /game-rounds/{roundId}/end`（既有） | 原「結束本輪互動」二次確認，與劇情完成無關 |

**例：雙人同意開下一場**：

```http
POST /api/v1/game-rounds/{roundId}/story/next
Content-Type: application/json

{"clientRequestId":"<UUIDv7>","completedEpisodeSeq":1,"agree":true}
```

第一人收到 `{"phase":"completed","myAgreedNext":true,"partnerAgreedNext":false}`；第二人同意後，Server 只**建立一次**第 2 場凍結候選，並以新 `episodeSeq` 呈現待選或直接開場。此範例省略共用授權 header，不含對方個人資訊。

**事件種類及通知**：保留 `message.committed`、`story.node_changed`、`interaction.updated`、`chapter.completed`、`room.ended`；新增／調整 `story.category.offers.frozen`、`story.category.vote.submitted`、`story.category.selected`、`story.scene.selected`、`story.narrative.selected`、`story.next.requested`、`story.event.started|completed`。通知仍由 Room DO 發送 `room.snapshot_hint` 或安全事件投影；前端不以 WS 推送成功作權威真相。

## 6. 原子操作與關鍵競態

1. **接受配對**：同 batch 驗雙方真實 Session、候選／已發布類別數量與每個類別至少一條**同類別且已解鎖**的主線、兩個 Claims 唯一、Round 建立及首場 Category offer 凍結。唯一類別自動決定，但不得偽造投票。若 Category／Scene／Narrative R2 無法驗證可玩，不能只建空場次；必要時延遲進場並保持可恢復的已提交決議狀態，不再擲骰。
2. **類別投票**：每人最後有效票是帶 `episodeSeq` 的事件；原邀請方決勝、選後不得改；伺服器 transaction 再驗 Category 與固定 offers；相同 `clientRequestId`／相同 payload 回原 receipt、相同 ID／不同 payload 409。
3. **決議及隨機**：分類、場景、主線的合格集合先依**所選 Category.code 和 Narrative `eligibleCategoryCodes`**、已發布狀態及前置條件篩選，再從 D1 已發布索引與可讀 immutable manifest 計算，Server 抽選**恰好一次**，選出 Scene/Narrative IDs 後同一受保護交易寫入 StorySession、SceneVisit 與選中事件；中途重試必須先查 receipt／既有 Session，不能重新抽。R2 失敗時需有可恢復的 retry 路徑，絕不把不存在的資料 commit 成正式 Scene。
4. **開始／完成事件**：同一個 `(storySessionId,bindingId)` 只存在一筆 EventInstance；Domain 用釘選 Manifest 計算條件並限制 repeatGroup；D1 CAS 驗 Session playing、node/revision、EventInstance revision、Round active 和 actor；雙人互動仍等兩個真人答題才結算。若某事件完成會讓主線到達 Ending，同交易完成 StorySession 並追加 `chapter.completed`。
5. **再次遊玩**：僅在最新場次 completed 可對該 `completedEpisodeSeq` 表態，按 actor 最後有效事件判斷是否雙方同意；當第二個有效同意提交並將要建立 `episodeSeq+1` 時**讀取雙方最新已儲存興趣並凍結新類別候選**，不回溯舊場或用客戶端快照；兩票同時抵達／重送只產生一個 `episodeSeq+1`，撤回對既有已開始場次無效。不得把同一場結束與下一場選擇同時擁有兩個 playing。
6. **退出優先**：結束 Round 與任何投票、聊天、觸發、完成、重玩寫入，都在真 D1 原子交易重驗 active+Claims；退出先 commit 後其他命令 409，操作先 commit 後退出則保留合法歷史但 ended 不再供原玩家查完整內容。不得用 DO presence 或前端判斷代替。
7. **隱私**：未決議前不得向另一方洩漏投票內容；未觸發隱藏事件不揭露 definition、條件及結果；不要回原始私人興趣、Email、真實照片、個人好感度或私人 R2 key；系統旁白／NPC 不能冒充對方真人。

## 7. 開發增量與首條內容遷入策略

| Gate | 必須完成 | 明確禁止 |
|---|---|---|
| **SDD／BDD／TDD（本輪規劃）** | 使用者核准 Schema／API／事件條件，補完整案例與 RiskAudit | 此階段直接修改程式／DB |
| **Gate 1：資料底座＋唯一首條** | 新 migration、內容發布工具、Category→Scene→Narrative、事件 Binding、真 D1 Round／重玩／安全授權；遷入「雨聲書店」既有 `scene-01/v2` 兩結局、bookmark／reading-path、原 2.5D 背景／透明前景／熱區／五表情／音效，完成 §4.4 契約回歸 | 不得用背景圖或假內容冒充完成，不重畫現有免費角色 |
| **Gate 2：首條真實使用者驗收** | Web／Android 真雙人，選擇、自由事件疊加表情／鏡位／音效、動態熱區、物件探索、等待另一真人、五圖安全換角、跨 Episode 只重設舞台而聊天保留、背景／重連不重抽或重產、自然收尾；原 StoryDialogueAndExit UX-P1～P5／B1／全身角色 Gate B 仍各自留證，由使用者親自試玩調校並明確核准 | **未經人工核准不得開始其餘九條主線**；自動測試及舊視覺 Gate 不自動繼承通過 |
| **Gate 3：餘下九條** | 僅在 Gate 2 通過後，按共同框架逐條補齊至至少十條完整可玩主線；測試有序、無序、混合、多場景／類別關聯、事件重用與有無分支主線 | 不能用十張場景圖或測試 fixture 充數 |

目前尚未上線，未來實作可依既有使用者決策只在**已識別的非正式 DatingHigh 測試環境**清除舊遊戲測資並重建；須先確認環境與保留帳號、Profile、真人照片等非遊戲資料，這不等於 Avatar 全身角色 CLEAN-RESET 的清理授權；正式與未知環境不得動，migration 不倒改。

## 8. 可測試驗收條件與追溯

| SPEC 驗收 ID | 可測試行為 | MVP 來源 |
|---|---|---|
| SEF-AC-001 | Category 僅從**所屬場景且至少一條適用類別／符合前置條件的真正可玩主線**推導；N=0/1/2/3 各按規則處理，真人雙票同票／異票／改票／離線及隱私正確 | AC-005-04 |
| SEF-AC-002 | Scene↔Category 多對多，場景與主線不同概念，同一場景至少可綁兩條完整 Narrative；換 pair 不沿用去重 | AC-005-05/06/12 |
| SEF-AC-003 | 主線依所選 Category 的**適用類別白名單**篩選後才抽選；無序主線隨機優先未玩、全玩過能重玩；有序主線不能跳章；混合時不強制有序優先 | AC-005-06/12 |
| SEF-AC-004 | 線性主線只有一個 Ending 也能發布及玩完；分支／兩結局亦可正常演出，結果由已提交選擇導出 | AC-005-07 |
| SEF-AC-005 | 同一 EventDefinition 在兩個 Narrative 的 role 不同，帶固定／條件／隱藏／隨機互動及跨場景適配；不重複開發模組 | AC-005-08 |
| SEF-AC-006 | playthrough／round 兩種 repeatScope 與同一 repeatGroup 正確去重；缺依賴、隱藏未達成皆不觸發 | AC-005-09 |
| SEF-AC-007 | 主線收尾後自動 completed、未玩支線不阻塞、繼續聊天且 Round active；原 End 雙確認才能 ended | AC-005-10 |
| SEF-AC-008 | 雙方同意後恰好建立一筆下一場，**使用雙方當下最新已儲存興趣重新推薦、固定該場候選，舊場不變**；單方／撤回／舊場票／競態／重送均不得偷開新場 | AC-005-11 |
| SEF-AC-009 | 現有 `game_round_events` 序號、冪等、拒舊 Revision、HTTP+WS 補漏與安全投影不得退化 | AC-005-13 |
| SEF-AC-010 | 版本發佈後已有玩家仍使用原版；退休內容不能進入新候選、R2 錯誤 fail-closed；不洩漏私有資料 | AC-005-13 |
| SEF-AC-011 | 使用者親自驗證新架構的唯一首條後才擴充；最終十條主線有完整可達 Ending，不以背景或分支充數 | AC-005-14 |
| SEF-AC-012 | MVP-001 不呼叫 AI 推進劇情，不建 AI 生成任務，未來 AI 動態主線不需依賴 `content_story_catalog` | AC-005-15 |

**測試策略**：Domain Unit（多對多、排序、可選分支、前置 DSL、Repeat）、內容發布工具測試（未發布／循環／未知 renderer／hash）、Miniflare **真 D1**（FK、Unique、CAS、重送、rollback、雙方同時同意、結束競態）、.NET API／Worker 合約（授權與個資投影）、Web／Android 雙人 E2E（含斷線／換裝置／真人等待）、既有 StoryDialogueAndExit UI／全身化身回歸。只用 HTTP fixture 不等於 D1 原子性證據。

**文件追溯**：本 SPEC 的 SDD 及 RiskAudit RA-Q1=A／RA-Q2=A 均已於 2026-11-12 確認，2026-11-13 依最新人物／遊戲體驗增加 SEF-AC-013～016 與 SEF-UX-GAP-01～08；[BDD 78 場景](../bdd/SPEC-001-SceneEventFramework-BDD.md)、[TDD 379 測試與交接](../tdd/SPEC-001-SceneEventFramework-TDD.md#規劃交接紀錄)、[RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md) 已完成規劃追溯。**Ready for well-done 僅指可交開發，產品功能未實作、首條人工 Gate 未通過**。

### 8.1 跨 SPEC 人物／舞台整合驗收（不取代原 Gate B）

| 驗收 ID | 必須驗證的結果 | 追溯 |
|---|---|---|
| SEF-AC-013 | Scene／Narrative 拆分後 2.5D 鏡位、背景／前景、熱區、音效完整；Event 演出以安全的鏡位／表情／音效效果疊加並能還原，非法 ID 不得發布 | MVP AC-005-08/13；StoryDialogueAndExit 2.5D |
| SEF-AC-014 | 已採用五表情與 Scene 各自維持版本；新套組完整解碼＋句尾安全換角；失敗不顯示混包、失權即清除；Event 不啟動 Gemini | MVP AC-005-13；AvatarAndPreferences B1 |
| SEF-AC-015 | 動態熱區依權威事件資格顯示、預覽不提交；新 Episode 重設舞台但保留 Round 聊天／當前 Avatar；背景／重連不重抽、重送、autoplay、續產 | MVP AC-005-09～11/13 |
| SEF-AC-016 | 首條雨聲書店 Web／Android UX-P1～P5、免費／AI 全身人物、兩結局、微動與場景素材實證；使用者人工 Gate B 核准後才擴充其餘九條 | MVP AC-005-14；StoryDialogueAndExit Gate B |
| SEF-AC-017 | 本人目前採用化身的五表情未就緒時禁止遊戲入口、恢復、票券及操作；清除私人畫面並提供個人檔案入口；不受另一組 pending 化身影響 | MVP AC-005-16；§1.2；BDD-079 |

## 9. 已確認的 SDD 取捨（SEF-RQ-01～03=A）及 RiskAudit 後續關卡

| ID | 原因及對實際遊玩的影響 | 使用者已確認方案 |
|---|---|---|
| SEF-RQ-01（已確認 A） | 已玩過的場景仍有未玩過主線時，如果場景「去重」採硬排除，玩家可能很久玩不到那條新主線 | **採 A**：場景與主線未玩過／已玩過權重初期 **3:1**，舊場景仍有機會；經人工試玩可調整。不採 B 的硬排除。 |
| SEF-RQ-02（已確認 A） | 若主線抵達 Ending 後仍可觸發原場次支線，容易造成「已完成卻在更新舊進度」與重玩衝突 | **採 A**：收尾即封存本次未完成支線；可聊天，欲探索須雙方同意開始新場次。不採 B。 |
| SEF-RQ-03（已確認 A） | 過度拆表會造成重複來源與維護成本，場景仍需穩定版本與歷史 | **採 A**：§4 的 **5 張新增表＋既有表最小調整**，EventDefinition 留在 immutable R2 Manifest；不建 content_event_catalog／專用投票表。 |

**2026-11-12 使用者確認記錄**：SEF-RQ-01=A（場景／主線未玩過權重初期 3:1、允許舊場景、可在試玩後調校）；SEF-RQ-02=A（主線自然收尾即封存未完成支線、聊天保留、再次體驗需下一場）；SEF-RQ-03=A（新增五表、沿用既有表、事件內容以 R2 Manifest 管理）。三項皆已回寫，不再列為待確認事項。新識別的實作前風險依獨立 RiskAudit 另行確認，不能反向變更已核准 SDD。

### 9.1 2026-11-12 RiskAudit 最終確認（RA-Q1=A／RA-Q2=A）

- **SEF-RA-01／RA-Q1=A**：玩家選定 Category 後，Scene 與 Narrative 必須同時適用該類別；Narrative 以 `eligibleCategoryCodes` 宣告一至多個合法代碼，由內容 Publisher 與遊玩時抽選規則雙重檢核。沒有新增第六張資料表。
- **SEF-RA-02／RA-Q2=A**：只有每次新場次開始（雙方同意且伺服器成功凍結候選時）才以最新已儲存的雙方興趣重新推薦；以伺服器一次受控提交取得同一份候選快照，斷線／重試皆沿用。原已選場次不得變更。
- 其餘高／中／低風險均有具體實作護欄與 TDD 補強，按 [RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md) 紀錄執行；**已確認風險不代表程式已驗收**。

## 10. 引用與修改範圍

- MVP：`docs/requirements/MVP-001-LoveGameDatingApp.md`（2026-11-12 最新 SceneEventFramework 章節、AC-005-04～15）
- 原上游：[StoryDialogueAndExit](SPEC-001-StoryDialogueAndExit.md)；`docs/verification/SPEC-001-StoryDialogueAndExit-Verification.md`（既有 Gate B、全身視覺未結案）
- 既有 Schema：`cloudflare/migrations/0005_story_dialogue_exit.sql`、`cloudflare/src/story-commands.ts`、`cloudflare/src/story-content.ts`
- 既有 Domain：`backend/src/DatingHigh.Domain/StoryGraphPolicy.cs`、`backend/src/DatingHigh.Domain/StoryPolicies.cs`
- 既有內容：`contracts/story-scenes.json`、`contracts/story-assets/`
- 預定修改：`backend/src/DatingHigh.Domain/`、`backend/src/DatingHigh.Application/`、`cloudflare/src/`、`cloudflare/migrations/`、`tools/story-content-policy.mjs`、`frontend/client/src/` 與對應 Unit／Integration／E2E 測試；**本 SDD 階段均未動程式**。
