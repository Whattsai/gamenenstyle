# SPEC-001-SceneEventFramework：場景、主線與可重用事件框架

**功能 ID**：SPEC-001-SceneEventFramework
**來源 MVP**：[MVP-001-LoveGameDatingApp.md](../requirements/MVP-001-LoveGameDatingApp.md)（US-005／AC-005-04～23；本輪新增 AC-005-17～23）
**順序**：第 5 份，共 9 份 SPEC；依賴 `SPEC-001-MatchingSessions`、`SPEC-001-StoryDialogueAndExit`，提供 `SPEC-001-AffectionAndFeedback`、`SPEC-001-OnlineGamesAndQuests` 可重用基礎
**優先級**：高
**日期**：2026-11-15（本輪雙軌 SDD 修訂；原 SDD 業務決策：2026-11-12／13）
**階段**：新版雙 Track／共享世界／雨聲書店已完成 SDD、BDD／TDD 設計與新版 RiskAudit 人工確認；**V2-RQ-01=A 已確認**，收尾僅播放書架短鏡頭後自然完成，不新增互動尾聲。本次依 perfect-plan Phase 5 交付 well-done 可開發規劃，**不代表產品已實作或 Gate B 人工驗收通過**，詳見 [驗證紀錄](../verification/SPEC-001-SceneEventFramework-Verification.md)。
**負責角色**：DatingHigh 應用開發；業務及人工驗收由使用者確認

## 1. 功能概述、範圍與非目標

**What**：保留**劇情類別（Category）→ 場景（Scene）→ 預設主線（Narrative）＋事件繫結（Event Binding）**，把單一 Narrative 中兩人共用節點重構成邀請方／接受方獨立進度與共享事件圖，支援交會後再回單方、再分流及反覆合作；讓場景操作、角色位置／表情／鏡頭與雨景動效真正參與敘事。既有抽選、自然收尾、聊天和雙方同意下一場規則保留。

**Why**：新場景、新主線、新事件主要透過已驗證的內容資料發布，而非每次改 .NET、D1 Schema、Worker 或 React 畫面；同時保留未來 AI 沉浸模式使用共用場景與事件的可能。

**本期包括**：類別／場景／主線抽選、雙人獨立 Track、重複交會／分流、Scene 內 Area 移動、共享物件與個人線索、真實物件操作／人物／鏡頭／微動、事件安全與同步、雨聲書店新劇本、冗餘程式／資料表清理及 local clean rebuild 的設計與 Web／Android 驗收。

**不包括**：MVP-002 AI 即時生成主線／跨獨立 Scene 故事／無限劇情；好感計分、正式 2 小遊戲／3 任務、約會、告白、History／Housekeeping、額外候選預算表、SQL Trigger、production 部署。**本 SDD 階段不實際清資料或改程式**，清理列為實作 Gate。

### 1.1 必守的既有基線

- **已落地的 `0006` 現況**：`0005_story_dialogue_exit.sql` 曾建立 `game_story_sessions.current_node_id/progress_revision`、`game_interaction_instances` 及 `game_rounds.story_offer_catalog_ids_json`；`0006_scene_event_framework.sql` 已新增五張 Category／Scene／Visit／Event 資料表，將首場候選欄改為 `story_offer_category_ids_json`，並擴充 `content_story_catalog` 與 `game_story_sessions.selected_category_id`。目前仍存在**雙方共用單一 Node、舊互動實例表**；本輪必須重構，不能把 `0005` 當成最新 schema。
- **已落地的內容來源**：正式可玩路徑為 `contracts/scene-event-content.json` 發布的版本化 Category→Scene→Narrative→Event 定義，R2 使用 immutable SHA；`contracts/story-scenes.json` 的 `scene-01/v2` 是**遺留格式**，含 bookmark／reading-path 舊文本，並非新版首條需要保真的玩法。保留可共用的書店場景／素材；新故事與操作契約應取代舊文案、模組及不再使用的轉換器。
- **已落地的程式現況**：`SceneEventFrameworkService`、`scene-event-commands.ts` 已使用新 Category 投票、R2 分層內容與事件實例；其動作提交仍依賴 `game_story_sessions.current_node_id/progress_revision`。`story-commands.ts` 與 `StoryGraphPolicy` 尚有 `episodeSeq=1`、舊節點及 `game_interaction_instances` 路徑。新的雙 Track 及多場次契約須移除這些殘留限制，但不能只放寬 Client 輸入而不保留 D1 交易內授權。
- 即時通訊沿用 `GameRoomSocket` DO、`IRoundRealtimeNotifier`、`game_round_events` 全域遞增序號／冪等 `clientRequestId`、授權 HTTPS snapshot／事件補漏；保留雙人真實投票、聊天室和「結束本輪互動」二次確認。
- 現有全身化身、B1 五表情、R2 ready Manifest、2.5D 分鏡、Web／Android Gate B 還有未完成驗收，**不移出、重做或降低 `SPEC-001-StoryDialogueAndExit` 的既有 Gate**。

### 1.2 本人目前採用化身的遊戲入口條件

遊戲入口、恢復、即時連線票券及遊戲操作須由伺服器核對本人目前正式採用的化身。內建化身須屬正式完整五表情目錄；生成化身須為本人所有、未刪除且 ready 的正式資產，具有有效 ready Manifest 及五張完整表情物件。缺少選用、製作未完成、清單或任一表情缺失時回 `409 OWN_AVATAR_PACK_NOT_READY`，不提供劇情內容、不核發票券、不寫入遊戲操作。

只核對目前採用者；另一組尚在製作的化身不得阻擋已就緒的選用。讀取私人儲存前後須重驗登入與目前選用。畫面清除既有場景、角色、聊天室及草稿，顯示原因及「前往個人檔案」；選用已就緒化身後可回同一輪，不重新抽劇情。第三人／撤銷授權仍優先回 403／401；結束本輪及 ended 安全狀態不受此條件阻擋。此規則不啟動或自動續產 B1。

## 2. 名詞、DDD 邊界與責任分層

| 名稱 | 定義 | 範圍 |
|---|---|---|
| `StoryCategory` | 玩家共同選擇的劇情**主題**（例如浪漫／懸疑）；與本人 Profile `reading/coffee/puzzle` 等**興趣標籤不同** | 可重用內容 |
| `Scene` | 背景、時間、鏡位、可互動物件及若干 Area（書架／櫃檯等）；仍為同一場景 | 可重用內容 |
| `Narrative` | 一次場次的一條人工主線：邀請方／接受方的獨立 Track＋Shared Event 圖＋可達收尾 | 可重用內容 |
| `EventDefinition` | 具版本的共用互動／敘事事件定義：玩法模組、參數、安全輸入 | 可重用內容 |
| `EventBinding` | 在某主線、場景或全域事件池中套用 EventDefinition 的**位置與規則**：用途、條件、隱藏／隨機、重複限制、完成效果 | 各來源的 immutable 內容版本 |
| `GameRound` | 真正兩位玩家的整場配對遊戲與聊天／終止授權根；結束才永久排除該 pair | D1 Round Aggregate Root |
| `StorySession/Playthrough` | 同一 Round 的第 `episodeSeq` 次劇情體驗；**一場次一條主線**，完成後仍留 Round | D1 執行子 Aggregate |
| `SceneVisit` | 場次進入場景的事實；MVP-001 每個 Playthrough 恰好一筆 | D1 執行事實 |
| `EventInstance` | 本次綁定的 `inviter/acceptor/shared` 事件執行狀態，包括真實操作與合作答案 | D1 執行事實 |

**DDD 規則**：`GameRound` 為真人 pair／聊天／安全結束的 Aggregate Root；`StorySession` 為同一 Round 內的遊玩子 Aggregate（固定 Category／Scene／Narrative／內容 SHA、共享世界、完成資格），下含兩筆 `StoryParticipantProgress` 與 EventInstance。每次更新同交易驗 Round active、兩個有效 Claims、登入 actor 的原邀請角色、目前 Session／內容版本與相應 Track／shared revision；分享與共享物件是 Session 交易內權威，絕不能用 Client/DO 推算。Immutable Manifest 不含執行狀態。

**分層責任**：

| 層 | 具體職責與可沿用元件 |
|---|---|
| Domain | 沿用 `StoryCategoryRecommendationPolicy`、`SceneSelectionPolicy`、`NarrativeEligibilityPolicy`、`EventRulePolicy`、`PlaythroughLifecyclePolicy`，補雙 Track graph、跨線依賴／角色授權、Shared World transition、Ending predicate；Domain 保持無 D1／R2／DO 依賴 |
| Application | 以現有 `SceneEventFrameworkService` 作故事編排入口；投影各自 Track／事件資格與可見共享物件；`StoryDialogueService` 保留真正共用聊天／退出部分，移除舊平行節點實作；沿用 `IPlatformClient`／`IRoundRealtimeNotifier` |
| Infrastructure / Worker | 受控 D1 CAS 同批提交本人 Progress＋EventInstance＋必要 WorldState／`game_round_events`，R2 Immutable Manifest 與授權投影；整併 `story-commands.ts` 的過渡動作到 `scene-event-commands.ts`，不另開第二套 Room/DB 指令 |
| API / Expo | 沿用既有 `/api/v1/game-rounds/{roundId}`、`GameRoomSocket`、`StoryExperienceScreen`、`ADVStage`、`StoryStage`／`StoryPortrait`／`InteractionRenderer`，改為本人 Track snapshot、場景內操作、角色／物件演出；不以另一份 UI/WS 假同步 |

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

### 3.3 雙 Track 主線圖、可重用事件與條件語意

- **圖結構**：每條 Narrative 有且僅有一個 `tracks.inviter.entry` 與 `tracks.acceptor.entry`，各自至少一個合法節點；Shared 由綁定事件構成，並非第三名玩家或全域 `current_node_id`。可選分支、無分支及多收尾均合法，但必須至少有一組**可達的共同 Ending predicate**，且所有允許的必經路徑都能完成。`StoryGraphPolicy` 舊版 `entry/nodes` 單線結構及至少二 Ending 限制必須淘汰；場次完成不得只看其中一方到達某個 Ending 字串。
- **事件用途與來源**：`EventDefinition` 僅定義重用玩法；`EventBinding` 在 narrative/scene/global 作用域宣告 `narrativeRole=main|side`、`trackScope=inviter|acceptor|shared`、`visibility`、`selectionMode`、`triggerConditions`、`repeatScope/repeatGroup` 及安全結算規則。三種來源可疊加；同一 EventDefinition 可在不同故事／Track 擔任不同用途。`BindingKey=scope:sourceId:bindingId`，每個 scope 中都必須全域唯一。必經 `main`／`requiredForEnding` 不允許隨機不出現（`weighted_random` 且 probability<1），可選 side／hidden 不阻塞主線。
- **條件 DSL**：保留 `all/any/not`（深度最多 8、AST 節點最多 64）、`narrative_completed`（已完成前序場次）等既有語意；原 `node_entered/choice_committed/event_completed` 擴為**明確角色與限定鍵**的 `track_node_entered`、`track_choice_committed`、`track_event_completed`；新增 `shared_event_completed`、`world_object_state`、`actor_area_is`（角色＋Area）、`shared_flag_equals`。Server 用已提交 Progress、EventInstance 與 WorldState 求值；不讀 client 自報的 `Flags`、任意 SQL/JS、未授權 Profile 或外部 URL。
- **條件型別範例**：`{"track_event_completed":{"role":"inviter","bindingKey":"narrative:rain-bookshop:inspect-slip"}}`、`{"world_object_state":{"objectId":"book-bag","state":"on-counter"}}`、`{"actor_area_is":{"role":"acceptor","areaId":"counter"}}`；布林可組合，但引用不存在的角色／Area／Binding／狀態、角色 scope 不匹配或無法滿足的必要前置條件必須在發布階段拒絕。舊 `flag_equals` 在新內容改為受控的 `shared_flag_equals`，不可讓一般文字旗標覆蓋個人事實。
- **跨線效果**：Shared Event 可宣告 `unlockSharedBindings` 及對兩個角色的 `unlockNodes`；角色未親自完成其必要操作時，**只能解鎖目標、不能替他完成或代選**。`inviterNextNode/acceptorNextNode` 只在該角色自己的合法操作或雙方都已完成的共同轉移中生效；沒有指定目標則維持本人當前節點。事件後可以回到指定一方／雙方或再進新共享事件，次數不設固定限制。
- **重複限制**：`repeatScope=playthrough`／`round` 的事件仍在 StorySession／Round 範圍去重；個人 `repeatGroup` 預設以 role 隔離，Shared 才以兩人共同事實去重，禁止 A 完成個人事件誤擋 B 同類個人事件。若事件明確設跨角色唯一，必須在 Manifest 宣告並由 Domain／D1 原子驗證。固定 Scene capability、已發布 Renderer、未玩權重與不可重播 receipt 等原規則保留。
- **圖驗證與隱私**：Publisher 預編譯依賴圖、檢查兩角色入口、所有轉移 target、無必經互等死鎖與無界迴圈、Ending 可達；只能對登入 actor 投影其已揭露節點／線索，不能將對方未解鎖的圖或 Hidden binding 下發 Client。未知 Module／動作資產／條件欄位應 fail closed。

### 3.4 收尾、自由聊天與再次遊玩

`playing → completed` 只在**雙方必經 Track 事實、必要 Shared Event／合法 Ending predicate 全部滿足**後才代表此場主線完成，並非某一名玩家先看到 Ending 文案就能直接結案，也不代表 `game_rounds.active → ended`。Server 同 D1 交易提交 `chapter.completed`、取消未完成 side／hidden Event，後續原章節操作全部拒絕，不需另按「完成劇情」。**SEF-RQ-02=A 已確認**：可選支線不必做完即可自然收尾，Room 仍可聊天；若要探索漏掉支線，須雙方同意新一次遊玩。

再次遊玩採**雙方同意**：在目前最新場次 completed 且 Round active 的前提下，由真實玩家各自提交 `story.next.requested`（可撤回），只在**同一個已完成 episode** 上聚合兩位最後有效的「同意」，兩人皆同意才原子產生下一個 `episodeSeq` 的候選凍結事件；若唯一類別直接建立下一場，否則等待類別投票。不同場次的同意／類別票不混用；離線不假投票、不同意不阻止聊天。永遠只有一個待選或 playing 的最新場次；同一 Round 的完成紀錄可以有多筆。

原 Round 的二次確認退出照舊：一方確認後將 `game_rounds` ended、釋放 Claims、永久排除該 pair；歷史聊天室與互動不再由原玩家 API 回讀。此 SPEC 不安排 Housekeeping／History 功能。

### 3.5 雙人 Track、反覆交會與分流

**本輪 SDD 設計基線（已確認供本次 perfect-plan 交接）**：一個 `StorySession` 仍只釘選一條 Narrative／一個 Scene，但其內容同時擁有原邀請方 `inviter`、接受方 `acceptor` 的獨立進度和多個共享 `shared` EventBinding。原邀請方由既有 `match_invitations.initiator_account_id` 決定；`shared` 是事件圖，不是第三個玩家進度或另一條獨立 Narrative。

1. **各自進度**：玩家各有 `current_node_id`、`current_area_id`、`revision`；任何人先到後面節點都不能替另一人跳過必要節點、代選或代提交。各 Track 可自行探索，只有真正必要的前置條件才等待。
2. **反覆交會／分流**：共同事件的有效轉移可包含 `inviterNextNode`、`acceptorNextNode`、`unlockSharedBindings`、`worldEffects`。未指定任一方下一節點時該方原進度不變，允許個人→共同、共同→單方、共同→雙方各自、共同→下一共享事件及依條件分流；可多次交會，不能只合流後一路到結局。 **共同節點本身不會鎖住全場**；同一人走到更後面的個人分支並不會更改另一人的 currentNode，只有必要的共享條件才進入等待。
3. **同一世界的不同知識**：各角色已知／未分享的線索屬個人完成事實；共享物件與明確分享過的線索才進入 `WorldState`。A 已拿走的書，B 的畫面不能還顯示在原處；B 沒親自取得的隱藏線索不能因 A 完成就暴露。
4. **共享事件的真人性**：需要 A/B 分工時可指定不同合法動作，只有各自真人提交成功才結算。單方解鎖另一方的新事件並不等於替他走到那一節。離線／等待不倒數、不自動假答，雙方仍可聊天與探索允許的支線。
5. **完成條件**：Ending 由已釘選 Narrative 的必要 `inviter`／`acceptor`／`shared` 事實與完成條件共同裁定；任一方先走到 Ending 文字不代表全場 completed。正式完成時同交易封存未完成可選支線，Round 與自由聊天仍保持。
6. **發布完整性**：Publisher 須驗證每條必經依賴可到達收尾、拒絕無界必經循環、互等死鎖、不存在的角色目標或必經事件隨機未出現的設計。可選支線不可反過來阻塞必要主線；複雜交會圖也要有明確最大節點／事件上限。

### 3.6 單一 Scene 多 Area、角色與物件

- **Area** 為同一 Scene 內的門口、書架、櫃檯、窗邊等位置，移動只更新本人 `current_area_id` 及相應節點／可用熱區；一場仍恰好一筆 `game_scene_visits`，不擴展至 MVP-002 跨 Scene 移動。
- **WorldState** 採受控、有限大小的 `game_story_sessions.world_state_json` 與 `shared_revision`（原全域進度改名），只接受 Scene Manifest 宣告的物件、狀態和轉移。每次改寫以 D1 CAS 檢查共享 revision，並留下 Round event；同一物品不可被兩人同時領走。只改個人節點不無謂碰撞另一人的個人 revision。
- **演出位置** 使用既有第一人稱 2.5D、全身角色／五表情、攝影機與前景遮擋；只有雙方在故事上可相遇且 Area 合理時才可顯示對方人物，對方人物顯示不代表他在線。
- **隱私**：API/WS 以登入 actor 投影其本人當前節點／線索／可操作熱區，只對他提供可揭露的對方狀態。不可將完整未解鎖雙軌 Manifest、私人線索或隱藏事件 definition 一起下發。

### 3.7 事件行為、演出等待與微動

- **事件註冊**：沿用 `inspect-object`、`cooperative-choice`，增加可重用 `move-area`、`manipulate-object`（檢視、翻面、拖放至目標）、`talk-to-npc`、`cooperative-action` 類型及其 renderer/validator；實際互動應出現在場景物件和人物上，不是只開文字選項窗。Publisher 拒絕未知模組或缺必要素材。
- **演出序列**：`presentationSteps` 支援安全白名單的鏡頭移動／縮放、熱區高亮、物件移動／顯示、角色進出／位置、五表情、已發布音效、短暫停頓；不許動態 JS、外部 URL 或事件觸發 Gemini 產圖。先前事件動作失敗時要同步還原畫面，不可把動畫播放當成提交成功。
- **等待分離**：台詞停頓、鏡頭與角色動畫在前端本地執行，允許安全略過、不新增 DB Timer；對方真人提交、共享物件更新或前置條件才是伺服器持久化等待。離線時可以聊天與探索其他已解鎖事件，但不幫對方作答。
- **角色與資產**：既有已確認全身化身＋五表情、句尾安全換角保留。站位、位移、鏡頭與遮擋先用現有圖；真實伸手拿書、坐姿、行走等若現有五圖不足，必須具備同角色已審核的動作資產才能正式發布，不即時呼叫生成服務湊畫面。
- **環境微動**：`AmbientMotion` 必須有肉眼可辨的雨滴實際位移、玻璃水痕／反光、書頁或光影細微變化，不再只有靜止雨線的透明度改變；`StoryMotion` 負責紙張飛落、物件操作及角色／鏡頭劇情演出。原開關只關 AmbientMotion，必要 StoryMotion 仍能播放或安全略過；背景／失焦暫停循環，Web／Android 實測真畫面流暢度、jank 與記憶體。

### 3.8 首條「雨聲書店」新故事垂直切片

保留雨夜獨立書店氛圍、可重用背景及正式化身，但**取代**抽象的書籤／推薦卡／同一本書抒情主線。建議新劇本「被雨打亂的最後一單」：兩人各自帶著不同線索進入同一書店，發生至少兩次合理交會，中間可返回單方或雙方不同任務。台詞以台灣日常口語、具體目標、小意外、幽默及自然認識對方為主，不硬逼玩家表白。

| 段落 | 邀請方 Track | 接受方 Track | 實際畫面／共享互動 |
|---|---|---|---|
| 進場 | 檢查被雨水糊掉的取書單 | 在書架發現錯放的書袋 | 門鈴、雨滴、取書單翻面、書袋熱區 |
| 第一次交會 | 到櫃檯提供殘存編號 | 帶書袋到櫃檯 | 真正看到兩份線索並列及合理的角色站位 |
| 再分流 | 回書架找對應的書 | 向店員核對日期 | 各有個人事件，完成後可解鎖另一方進展但不代做 |
| 第二次交會 | 帶回書 | 帶回日期線索 | 風吹散桌面卡片，兩人分工操作物件 |
| 收尾 | 選擇是否推薦一本書 | 選擇是否交換或聊天 | 根據真實操作形成合理後果，保留自由聊天 |

首條可有兩種有意義的收尾作為實玩示例，但所有 Narrative 的通用發布規則仍只要求至少一個可達 Ending。Gate B 需由使用者實玩確認劇情清楚、有趣、互動可見、角色／微動自然，核准前不製作其餘九條。


#### 3.8.1 首條可玩劇本：背景、角色及主題

**劇本工作名稱**：「被雨打亂的最後一單」；`narrativeId=rain-bookshop-last-order`、`sceneId=rain-bookshop`。使用者已確認以完整劇本進入 perfect-plan，**V2-RQ-01=A**：E01 是最後回望書架的鏡頭而非開放新探索，兩人各自表態後自然 `chapter.completed`、未完 Side 封存，聊天保留；不新增結束按鈕。**逐字台詞與真實趣味性仍以未來本人 Gate B 試玩為準**。本版不是既有 `rain-bookshop-lost-note/v1` 已發佈內容；Category 及 3:1 不改。

**一句話目標**：雨天的獨立書店只剩一張被淋糊的第 27 號取書單；店員把預訂袋放錯地方，客人快來了。兩名玩家各有不同線索，必須先認出同一筆訂單、再分工找對的書和封套，最後一起處理突來的風雨，才還原整份訂單。這是一個低壓、帶一點幽默的共同小事件，而非靠故弄玄虛的抒情文字推進關係。

**人物**：玩家 I＝原邀請方、玩家 A＝接受方（實際化身使用已採用的任意角色，不固定性別／外型）；「店員」是唯一必經 NPC；顧客只由結尾門鈴暗示，不出現假扮第三人的聊天室。所有對玩家的劇情文字使用「你」，角色沒有預設姓名、情史、職業或系統冒充的真人語音。玩家真人之間的台詞僅由本人選擇明確「說出／分享」或自行發送聊天後出現；NPC 和旁白不能代玩家回答、告白或承諾相約現實見面。

**可玩節奏**：初次進場個人探索 → `S01` 第一次交會核對「27」 → 雙方分流各找書／問店員 → `S02` 第二次交會處理突來風雨 → **只回 A 方**再確認封套與標籤，I 方停留可聊天／自由探索 → `S03` 再次交會雙方各自決定如何收尾 → 兩種符合當下選擇的自然 Ending。主要目標、必要台詞及每個必需操作可由首場完整玩到結局；可選支線不阻擋。

#### 3.8.2 場內位置、可見素材及物件事實

四個 `Area` 都屬同一筆 `game_scene_visits`；區域切換應有鏡頭／景深／角色 anchor 的**可視**變化，不是只替換一段文字，也不另建 Scene。

| Area ID | 場內位置與可見元素 | 互動／舞台規則 |
|---|---|---|
| `entrance` | 玻璃門、門鈴、濕雨傘架、地上的第 27 號濕紙單 | I 初始所在；點濕紙單並翻面，完成後可移動到 counter |
| `shelves` | 兩本近似書名的展示書、預訂布袋及標籤 | A 初始所在；可檢視袋外標籤，不擅自打開顧客私人物；I 後續找書 |
| `counter` | 店員、收據托盤、封袋位置、可貼共享線索的便條板 | 首次與末次交會、書本／布袋／封套放置；玩家間資訊僅在真正分享後共同可見 |
| `window` | 雨痕玻璃、窗台、綠色書封套與可能飛來的第 27 號標籤 | A 後續取封套；`S02` 風起後標籤飛到此處，需本人取回 |

| 物件鍵 | 初始位置／狀態 | 合法動作與狀態演進 |
|---|---|---|
| `pickup-slip-27` | entrance／濕紙正面可見 | I `inspect/flip`→得知私有「27、海邊的…、19:30」；I `place` 到 counter 才讓共享事件可核對，不公開其他未解鎖資訊 |
| `reserve-bag-27` | shelves／掛起、袋外 27 | A `inspect` 得知袋外 27；A `pick/place` 帶至 counter；不須解開袋內的私人留言 |
| `book-rain` | shelves／《海邊的雨天》深藍封面 | I 檢視後可以暫存候選；必須獲合法分享的書名才允許 `pick` 並放到 counter；錯書不能以硬猜永久推進 |
| `book-wednesday` | shelves／《海邊的星期三》淺綠封面 | 可觀察、比較；試放錯書顯示可恢復的提示，不能直接 completed 或卡死 |
| `green-sleeve` | window／乾燥綠色封套 | A 詢問店員後移到 window `pick`、帶回 counter `place`；不把封套外觀誤當書本真封面 |
| `order-tag-27` | reserve-bag-27／外附標籤 | `S02` 第一次有效觸發才從袋外移至 window；A 後續取回、帶到 counter 核對；同時操作不得生成第二張 |
| `counter-slot` | counter／空 | 合法接收濕紙單、袋、選定書、封套、標籤；每件物品有獨立 occupancy，不用一個布林遮蔽多件 |
| `window` | 關閉、雨痕可見 | 風起演出屬一次性 StoryMotion；`AmbientMotion` 可隨開關停止，不能因此取消已發生的標籤移動事實 |

**共享狀態**只存物件位置、被誰持有、書／袋／封套／標籤是否完成組合、`orderStatus=missing|searching|packing|verified` 與必要 `shared_revision`；I／A 的已閱線索、已按過的選項存於該角色的不可偽造 EventInstance／進度事實。若一件物件在對方持有中，另一方不可再取得；UI 以實際權威 snapshot 顯示「已被取走」，沒有幽靈副本。沒有任意玩家自填 JSON 世界旗標。

#### 3.8.3 逐節點雙人劇情與正式文案草稿

表中「旁白／店員」是**確定可由內容引擎播出的文字草稿**，非玩家真人代言；「你的動作」須由該玩家親自點擊／拖放／選取才 commit。`Ixx`／`Axx` 是各自 Track node；`Sxx` 為共享 EventBinding／互動流程，並**不**是第三筆玩家 `current_node_id`。本表是演出內容的 SDD 規格，發布時還須轉成嚴格的 `scene-event.v2` Node／EventDefinition／Binding Manifest。

| ID 與視角 | 逐節點文案（依序呈現） | 玩家實際操作、演出與進度 |
|---|---|---|
| **I01** entrance | 旁白：「雨一下大，這間書店的玻璃門看起來像裝了水族箱。」店員：「歡迎！不過今天進門會附贈一個小任務。最後一筆取書單被雨淋糊了。」 | 門鈴響、鏡頭由雨窗移到地板；顯示濕紙單熱區，不自動代玩家回答 |
| **I02** entrance | 旁白：「紙角還看得到『27』、『海邊的……』和『19:30』，剩下的字被雨洗到休假了。」 | I 點 `pickup-slip-27`，親自翻面，提交 `slip-inspected`；紙張鏡頭特寫與濕痕，不暴露 A 的袋標 |
| **I03** counter | 店員：「第 27 號？太好了，我記得預訂袋也有個 27。你先把紙放櫃檯，我們等另一份線索。」 | I 經 Area 移動、拖紙到 `counter-slot`；解鎖 I 的首次交會等待，未完成 A 仍可留在櫃檯聊天 |
| **A01** shelves | 旁白：「這裡書好多。最醒目的不是小說，是書架邊一個一直快掉下來的布袋。」店員（遠處）：「我明明把預訂袋收好了啊……」 | A 初始 camera 看向書架，書袋輕晃，玩家點開袋外熱區 |
| **A02** shelves | 旁白：「袋子外面掛著『27』。裡面好像還沒放書，先不要亂翻別人的預訂品。」 | A `inspect` 袋外編號並 `pick` 布袋，得私有 `bag-label-inspected`，不預設已知取書單 |
| **A03** counter | 店員：「欸，找到袋子了！麻煩先放這裡。對了，別替我打開別人要送的卡片。」 | A 移動至 counter，拖袋到空位，提交 `bag-at-counter`；若 I 未到可等待或聊天 |
| **S01** counter／第一次交會 | 店員：「一張單是 27，一個袋也是 27。至少今天還有一件事沒被雨沖走。」店員：「一個人幫我找書，另一個幫我核對預訂紀錄，好嗎？」 | 條件 I 紙單已放、A 袋已放、雙方在 counter；**I 親按核對紙單、A 親按核對袋標**，兩份真提交完成後 `orderStatus=searching`、解鎖 I04＋A04（雙向分流），同框顯示雙方已採用化身 |
| **I04** shelves | 旁白：「《海邊的雨天》，深藍色；《海邊的星期三》，淺綠色。單子只剩『海邊的』，選哪一本都有點像在猜雨量。」 | I 移至 shelves，可自由檢視兩本封面；書本與標籤具可點熱區，尚不能靠猜錯書直接完成 |
| **I05** shelves | 旁白：「書名很接近，顏色也會騙人。先看看櫃檯有沒有傳來真正的訂單線索。」 | I 可以 `inspect` 兩書、查看自己探索紀錄、聊天；若 A 尚未分享，明示「等待另一份書名資訊」，不強迫切另一人的進度 |
| **A04** counter | 店員：「我記得有本藍色的，但客人特別說要包綠封套。等等，我翻一下預訂簿。」 | A 親選 `talk-to-npc/query-title`，鏡頭聚焦預訂簿；NPC 不能自己在未操作時主動完成 |
| **A05** counter | 店員：「找到了！第 27 號是《海邊的雨天》，七點半來拿。綠色封套我放窗邊，差點把兩本『海邊的』搞混。」 | A `inspect` 預訂簿得私有書名與封套線索；**A 親按「分享線索」**貼到共享便條板，觸發 `order-clue-shared`，才讓 I 得知正確書名 |
| **I06** shelves | 旁白：「櫃檯的便條板多了一行：第 27 號，《海邊的雨天》，深藍封面，另包綠封套。這次終於不是猜謎。」 | 僅 `order-clue-shared` 後出現可提交的正確 `book-rain` 熱區；I 選書、錯書只提示重新比對，不修改終局 |
| **I07** counter | 店員：「對，就是這本。還好你沒有被綠封面的那本騙走。」 | I `pick` 正確書、移到 counter `place`，更新世界 `book-rain=on-counter`；A 的進度不因此自動前進 |
| **A06** window | 旁白：「窗邊的綠封套還是乾的，店員至少成功保護了其中一樣東西。」 | A 移至 window、`pick` 封套；雨滴持續移動，移動鏡頭而非切成新 Scene |
| **A07** counter | 店員：「綠封套也到了。你們這速度，我可能該把店名改成『失物招領書店』。」 | A 將封套放 counter；只有正確書和封套都到位後才解鎖 `S02`，先來者不被假完成 |
| **S02** counter→window→counter／第二次交會 | 店員：「好，書放進去就——欸，窗邊！標籤飛走了！」旁白：「一陣風從窗縫灌進來，第 27 號標籤滑到窗台。」店員：「一個先幫我按住書袋，另一個把標籤拿回來！」 | `S02` 首次合法觸發**一次**將 `order-tag-27` 從袋外移至 window；I 在 counter 親提交 `hold-bag`，A 親移到 window `retrieve-tag` 再返回 counter `place-tag`，全部角色提交與真物件狀態滿足才標記共享事件 completed；角色、紙張動效可見，不能 NPC 幫 B 完成 |
| **I08** counter | 旁白：「書袋總算沒再逃跑。你壓著袋角，櫃檯那頭正在做最後確認。」 | I 留在 counter、可聊天／看書／檢視本人已知線索；`S02` 後**不推進 I 的 node**，待 A 核對完成再解鎖最終共同事件 |
| **A08** counter／只回接受方 | 店員：「最後再看一下，這張標籤是 27，書名和綠封套也對。可以幫我確認一下嗎？」 | `S02` 完成後**只解鎖 A08**；A 親檢查標籤號碼、書本與封套 `verify-order`，提交 `order-verified`；I 保持 I08，兩人不被強制同步到相同節點 |
| **S03** counter／第三次交會 | 店員：「太好了！第 27 號總算完整，客人來時我可以裝得很從容。」（門鈴響）店員：「這回真的有人來了。謝謝你們，想不想再各挑一張書籤當謝禮？」 | I／A 各自**親自**選擇 `look_back`（「再看一眼書架，替今天畫個句點」）或 `rest_chat`（「先休息，接著自由聊天」）；選項不會自行發送真人對話。雙方完成必要事件與意向提交後**立即判定** E01/E02，不額外開啟可互動尾聲 |
| **E01** 再翻一頁 | 店員：「想再看一眼書架？好啊。今天真的多虧你們了！」旁白：「兩人回望書架，暖光落在一排書脊。這場雨天的小任務，正好在這裡畫上句點。」 | **兩人都選 `look_back`** 才進入 E01；短暫切到 shelves 暖光及雙人同框鏡頭，**沒有熱區、物件操作、自由探索或其他 Side**。隨後自然 `chapter.completed`，未完支線同交易封存；Round 仍 active、聊天可繼續，沒有額外「完成」按鈕 |
| **E02** 雨聲裡的五分鐘 | 店員：「今天多虧你們。不急，坐著等雨小一點也好。」旁白：「書袋送好了，窗上的雨聲還在。接下來要說什麼，由你們自己決定。」 | 任一方選「先休息／今天先到這」則此 Ending；鏡頭靠窗、保留聊天但不自動送任何真人回覆，`chapter.completed`；不暗示已約好下一次見面 |

**玩家意向的實際 UI 文案**（不以選項自動代另一方說話）：S01 選「我來核對紙單／我來核對袋標」按本人角色顯示；A05「分享：書名和綠封套」，I06「拿《海邊的雨天》」，S02 依 I／A 顯示「按住書袋／去窗台取回標籤」，A08「確認第 27 號訂單」，S03 雙方皆提供 `look_back`＝「再看一眼書架，替今天畫個句點」及 `rest_chat`＝「先休息，接著自由聊天」。前者是**純演出後直接 Ending**，不是繼續探索承諾；選項不是代玩家發出聊天。仍須顯示待辦／對方合作等待原因。

#### 3.8.4 交會、分流及條件契約（應轉成 EventBinding）

| Binding／事件 | 可觸發條件與行為人 | 成功後轉移及必須保持的事實 |
|---|---|---|
| `inspect-slip`（I） | I 在 entrance，`pickup-slip-27` 可見，親自 flip | 記錄 I `slip-inspected`，只解鎖 I03 |
| `inspect-bag`（A） | A 在 shelves，`reserve-bag-27` 未被他人持有 | 記錄 A `bag-label-inspected`，只解鎖 A03 |
| `S01/counter-meet`（Shared） | I／A 都在 counter，`slip=on-counter`、`bag=on-counter`，雙方各自核對提交 | `orderStatus=searching`；**雙方各自**解鎖 I04／A04，不冒名推進任何人的未完成操作 |
| `share-order-clue`（A→I） | A 在 counter，已經過 NPC 正式驗證書名 | A 主動分享後形成共享線索 `order-clue-shared`；I06 才可拿正確書，不把 A 的所有私有 NPC 對話暴露 |
| `deliver-book`（I） | I 在 shelves 選 `book-rain` 且共享書名已解鎖，移到 counter 正確槽 | `book-rain=on-counter`；不修改 A 的進度 |
| `deliver-sleeve`（A） | A 已詢問店員、在 window 取得 `green-sleeve` 並移到 counter | `green-sleeve=on-counter`；不修改 I 的進度 |
| `S02/wind-rescue`（Shared） | 正確書、袋、封套在 counter，雙方已完成 S01；I/A 可在各自 Area 操作 | 第一次啟動才移動一次標籤；I `hold-bag`，A `retrieve-tag`＋`place-tag` 都完成後才結算；`S02` 完成**只解鎖 A08**，I 保持 I08 |
| `verify-order`（A） | `S02` completed、A 在 counter，書／封套／標籤 27 均已就位 | A 親自 `verify`，設定 `orderStatus=verified`；解鎖 S03，不假裝 I 親手核對 |
| `S03/final-exchange`（Shared） | `S01`＋`S02`＋`verify-order` 均完成、雙方可以在 counter 觀看已驗證訂單 | 雙方獨立提交 `finalPreference=look_back|rest_chat`；**都選 `look_back` 才 E01，其他組合 E02**。兩結局均在雙方實際操作與必要 predicate 全滿足後自然完成 Chapter／同交易封存未完 Side；E01 僅是鏡頭回望書架，不解鎖新互動、也不需要追加結束提交 |
| 可選探索（Side） | I／A 可各自檢視不同書腰、收銀台提示、窗外雨痕 | 可增台詞／鏡頭／表情但不能搶占 `repeatGroup`、改主要 Ending 必要事實或阻塞 S01～S03 |

**轉移語意再確認**：`S01` 結算時兩人回自己的不同 Node；`S02` 結算時 **I 保持 I08、只釋出 A08**；`S03` 再次匯合並以兩個真選擇決定收尾。`unlockNodes` 不是直接寫入對方 `current_node_id`，不得把「看見提示」當成「完成節點」。同一個 StorySession 內可有數次交會且沒有第三位玩家進度；即使 A 先完成所有可用單方節點，I 尚未完成時仍能恢復到本人最後位置與待辦。

**E01／E02 的權威結算時序**：S03 第二位玩家的合法最終意向提交當下，Server 在同一次 D1 交易決定 Ending、設定 `chapter.completed`、封存未完成 Side 並保存 receipt／eventSeq；**Client 收到成功權威結果後**才播放 E01 書架回望或 E02 靠窗的短鏡頭。動畫可略過／失焦不重播，也不另送「完成」命令。畫面在動畫完畢後呈現已完成狀態、保留 Round 聊天；若提交失敗則不得先播出成功結局。

#### 3.8.5 演出 Cue、對話節奏與素材限制

| Cue ID／使用點 | 具體舞台表現 | 限制／降級規則 |
|---|---|---|
| `amb-rain-window`：四個 Area | 雨絲隨時間落下、玻璃水痕緩慢往下滑、室外反光有幅度；非單純靜態雨線淡入淡出 | 環境微動開關可以完全停止，回前景先驗 Session；不因關閉而隱藏劇情關鍵物件 |
| `fx-doorbell`：I01、S03 | 開門門鈴短音；門口→櫃檯有短鏡頭移動 | 失焦與重連不自動重播、音效不觸發 D1 |
| `fx-paper-flip`：I02 | 玩家點後紙張在自身中心區域翻面、鏡頭放大可讀「27」；完成後原物件仍在該位置直到真提交 | 若翻面動畫略過仍可看到可讀資訊，不要求額外畫成角色伸手 |
| `fx-character-meet`：S01、S02、S03 | 只有兩個已採用的全身化身在合理 counter anchor 同框；鏡位切換、先後靠近、五表情 neutral→surprised→smile | 只用已正式採用的五表情／anchor／裁切；沒有 approved 新姿勢素材時不能假裝伸手、接物、牽手 |
| `fx-clue-board`：A05 | 貼出便條板、I 端「新共享線索」標記，書架中正確書的合法熱區才被啟用 | 未分享前不在 I 端預先顯示正解；失敗不顯示綠勾 |
| `fx-gust`：S02 | 一次可見的風聲、窗邊雨聲增強、紙標籤沿明確路徑從袋外飛到窗台；鏡頭依 Area 看到其新位置 | 物件狀態移動由 D1 一次性提交，重播動畫不能重移物件、不得複製標籤 |
| `fx-hold-and-retrieve`：S02 | I 端袋子被固定、A 端窗台標籤可拖回櫃檯；各自呈現等待另一人的提交 | 不需兩名真人同秒操作，A 斷線／回來仍保留已提交的 I hold，不以 NPC 代完成 |
| `fx-ending-shelf/window`：E01/E02 | E01 只有一次短暫書架暖光回望／同框，E02 靠窗雨景與店員收尾；五表情／既有 anchor 演出 | 播放可跳過、失焦重連不重播已完成 Cue；**兩種 Ending 都立即完成**且未完 Side 封存、聊天仍可用；E01 不回到可操作的 shelves Area，不顯示新熱區 |

**文本節奏**：單段對話以一至兩句短句為主；NPC 每次不連續念長段規則，動作提示顯示在可互動物件附近；重要線索採有圖的物件特寫、已知線索卡或共享便條板呈現，不能只藏在已過去的旁白。玩家若切離再回，應看得見「目前要做什麼、由誰完成、在哪個 Area」的簡短摘要。視覺演出不是每次點擊都跳 modal；合法結果由 WorldState 決定，等待可暫停、聊天或檢視已有事實。只在有正式素材及 renderer 的情況發布；缺關鍵物件動畫的版本不得以純文字替代後標記 Gate B 通過。

#### 3.8.6 逐劇情驗收案例：必須從實際故事而非只測引擎

| 劇情案例 ID | 具體輸入／場景 | 必須看見的結果 |
|---|---|---|
| `RB-01` | I 與 A 首次進場，兩人不同速度 | I 在 entrance、A 在 shelves，兩端有各自台詞、Area 與獨立 revision；I 先到 counter 不能將 A 跳至 S01 |
| `RB-02` | I 只看濕紙、A 只看袋 | I 只知殘存的「27／海邊的」、A 只知袋外 27；未提交分享前不能看對方的私有資訊 |
| `RB-03` | S01 只有 I 確認、A 離線後再回來 | S01 不完成、I 的真人提交保留；A 回線親確認後才解鎖 I04＋A04，沒有自動投票／代按 |
| `RB-04` | A 尚未分享書名，I 點兩本書 | 只能查看不能直接硬猜使主線完成；A 分享後 I 才能合法選取 `book-rain` |
| `RB-05` | I 將錯書 `book-wednesday` 試放櫃檯 | 可還原的錯誤提示，錯誤操作無永久 WorldState／Ending 副作用，可重新選擇 |
| `RB-06` | A 先到 window 取得封套，I 還在找書 | 只有 A 物件、進度更新；S02 仍不啟動，I 後續可繼續玩自己的節點 |
| `RB-07` | 兩人到 counter 觸發 S02、A 突然離線 | 風只吹一次、標籤真實位置持久；I 的 hold 持久，A 重連後可去 window 取回；不能假裝另一人完成 |
| `RB-08` | 接受方 A 同一帳號兩裝置／重送同時取回唯一標籤，或邀請方 I 越權試圖取回 | 只有 A 的一次合法操作可成功；I 的越權請求拒絕，舊版次返回 409 重新同步；標籤不複製、S02 不重演 |
| `RB-09` | S02 completed，I／A 進度不一致 | **只 A** 取得 A08 核對事件；I 留 I08 可聊天，A 核對後 S03 才解鎖 |
| `RB-10` | S03 I 選 `look_back`、A 選 `rest_chat`（或反向） | 一律 E02，兩人真選擇各記一次；章節自然 completed、未完成 Side 封存、Round active／聊天保留；不能偽造雙方同意回書架 |
| `RB-11` | S03 雙方都選 `look_back`（「再看一眼書架，替今天畫個句點」） | E01 播放一次書架暖光／同框短鏡頭，**不可操作新物件或支線、不要求結束按鈕**；主線自然 completed、未完 Side 依 `SEF-RQ-02=A` 封存、Round active 且可聊天 |
| `RB-12` | 重送同 requestId、不同 payload、切後台、重新開啟、退出 | 冪等、409、授權、進度與世界狀態一致；不重播已完成動作、不漏個人線索、不重新生成表情、不讓結束 Round 再操作 |
| `RB-13` | 關閉環境微動後執行 S02 | 雨絲循環停止，必要的「標籤飛走／取回」劇情演出及物件狀態仍可正確感知與操作 |
| `RB-14` | 真 Web／Android 由雙方不同人操作整個劇本 | 從 I01/A01 到 S01→分流→S02→僅 A08→S03→E01/E02 的所有必經操作、台詞、音效、鏡頭、五表情／Area 都與本文一致；使用者人工 Gate B 確認「有趣、自然、確實可玩」才放行其餘九條 |

**首條故事的交付門檻**：故事內容版本、每個 Node/Binding 的 ID、台詞、熱區、操作參數、共享狀態、演出 Cue、雙人等待、兩種 Ending 和上述 `RB-01～RB-14` 必須互相對得起來；新增／調整台詞或事件必須同步更新實際發布的版本化 Manifest 和 BDD／TDD 的案例追溯。本文是審稿用 SDD；技術測試通過不等於台詞與趣味由使用者人工認可。Gate B 未通過不能製作其他九條正式主線。

## 4. 資料結構（D1 + Immutable R2）

**SEF-RQ-03=A 原設計已透過 0006 實作 5 張新增表**（`content_story_categories`、`content_scene_catalog`、`content_scene_category_links`、`game_scene_visits`、`game_event_instances`），EventDefinition 仍放 immutable R2，不另建事件內容目錄。**本次最新清理設計**以 0006 現行結構為基線：新增 1 張真正需要的玩家進度表、擴充 Session／EventInstance、在依賴移除後刪除 1 張重複舊互動表；不是重做原五表或新增另一套房間／事件引擎。本輪只更新 SDD，不執行 migration／清測資；實作階段使用受控 local clean rebuild，無舊遊戲資料移轉，保留現有 SQL 原子性與授權測試。

### 4.1 已有五表與本輪新增一表的目標 Schema

| 表 | 建議欄位及型別 | 約束／用途 |
|---|---|---|
| `content_story_categories` | `category_id TEXT PK`、`code TEXT`、`version TEXT`、`title TEXT`、`interest_tag_ids_json TEXT`、`recommendation_priority INTEGER`、`status TEXT`、`published_at INTEGER NULL` | `UNIQUE(code,version)`、`status draft/published/retired`、興趣 JSON array、同 code 最多一 published 版 |
| `content_scene_catalog` | `scene_catalog_id TEXT PK`、`scene_id TEXT`、`version TEXT`、`title TEXT`、`manifest_key TEXT`、`manifest_sha256 TEXT`、`status TEXT`、`published_at INTEGER NULL` | `UNIQUE(scene_id,version)`、Manifest key 唯一、hash 64 hex、同 scene 至多一 published；含視覺素材／鏡位 |
| `content_scene_category_links` | `scene_catalog_id TEXT FK`、`category_id TEXT FK` | 複合 PK；版本化 Scene 連結類別，可多對多；發布時要求至少一個類別且有可玩主線 |
| `game_scene_visits` | `scene_visit_id TEXT PK`、`story_session_id TEXT FK`、`visit_seq INTEGER`、`scene_catalog_id TEXT FK`、`entered_at INTEGER`、`left_at INTEGER NULL` | `UNIQUE(story_session_id,visit_seq)`；MVP-001 `visit_seq=1` 唯一訪問，與章節 completed 同批填 `left_at`，未來多場景可沿用記錄概念 |
| `game_event_instances` | 原 `0006` 欄位全部沿用，新增 `track_scope TEXT NOT NULL CHECK(track_scope IN ('inviter','acceptor','shared'))`，唯一鍵改為 `UNIQUE(story_session_id,binding_id,track_scope)`；`state_json` 僅能保存合法結果、角色分工答案，`revision` 仍 CAS。 | 單方事件與 Shared 各自有唯一 instance；Shared 合作由兩名真人分別提交到同一 instance，最後一方有效提交才結算與推進。`repeatGroup` 個人事件按 role 隔離，不互相擋住。 |
| **`game_story_participant_progress`（本輪新增）** | `story_session_id TEXT NOT NULL REFERENCES game_story_sessions(story_session_id)`、`account_id TEXT NOT NULL`、`role TEXT NOT NULL CHECK(role IN ('inviter','acceptor'))`、`current_node_id TEXT NOT NULL`、`current_area_id TEXT NOT NULL`、`revision INTEGER NOT NULL CHECK(revision>=1)`、`updated_at INTEGER NOT NULL`。 | `PRIMARY KEY(story_session_id,account_id)`＋`UNIQUE(story_session_id,role)`；建立場次時同批恰好兩筆；actor/role 由伺服器驗 Round／邀請紀錄，不靠 FK 自動判斷身分；個人線索由本人 EventInstance 事實導出。 |

**不新增 `content_event_catalog`**：本期用**SHA-256 完整性驗證的版本化 R2 EventDefinition Manifest** 及 Narrative 的 `eventBindings` 直接引用，發布時完整解析依賴與雜湊；避免每個可重用事件再佔一張資料表。若以後需讓運營人員在 D1 搜尋／上下架單一事件，再依具體需求增加 catalog，不影響 Event ID/version 契約。

### 4.2 現有資料表調整

| 表 | 建議異動 | 不變條件 |
|---|---|---|
| `content_story_catalog` | **已由 `0006` 加入** `scene_catalog_id`、`sequence_group_id`、`sequence_order`、`prerequisites_json`；`story_id` 表示預設主線，已釘選 Narrative 的 `eligibleCategoryCodes` 限制可選 Category。新首條使用新版本內容；不再稱這些欄位為尚未新增。 | 已有 `UNIQUE(story_id,version)`、發布與有序前置的完整檢查保留；不用 AI 動態主線目錄。 |
| `game_rounds` | `0006` **已將** `story_offer_catalog_ids_json` **更名**為 `story_offer_category_ids_json`（首場最多三個已凍結 Category ID）；後續 Episode 使用 `story.episode.offers.frozen`。不再計畫重複更名或用舊 Story ID 當 Category ID。 | `round_id`、pair、status、`last_event_seq`、邀請與 Claims 保留，不另建票選表。 |
| `game_story_sessions` | 沿用既有 `round_id/episode_seq/catalog_id/selected_category_id/chapter_status`，**移除**雙方共用 `current_node_id`；`progress_revision` 改為 `shared_revision INTEGER NOT NULL CHECK(shared_revision>=1)`，新增 `world_state_json TEXT NOT NULL DEFAULT '{}'`（合法 JSON object、長度 <=16384、內容依釘選 Scene 合法狀態與轉移驗證）。`shared_revision` 僅在共同事件／世界／章節狀態變動時增加；角色 Node/Area/Revision 移到 Progress。 | 原 `UNIQUE(round_id,episode_seq)`、同 Round 最多一個 playing、FK 與章節結束保留；禁止用共享節點代替兩個人的完成事實。 |
| **`game_interaction_instances`（移除）** | `inspect-object`／`cooperative-choice` 等舊執行狀態、答案與結算都併入 `game_event_instances`；移除查詢、舊命令、雙表收尾與必要測試改為新契約，最後在本地乾淨 Schema 確認表及索引完全不存在。 | 刪表前先驗 API／Worker／Application／前端及保留的聊天、合作、冪等、退出安全，不能只 DROP TABLE。 |

| `game_round_events` | 保留八欄／序號／冪等，擴充明確白名單 event kind 與 `episodeSeq` 投影、隱藏投票／隱藏事件保護 | `actor_account_id` 只能取登入真人；系統事件 NULL；不可由 Client 指定 kind 或任意 JSON |
| `game_active_round_claims`、`match_invitations`、`user_profiles` | **零 Schema 變更** | 沿用原 Pair、原邀請方、配對資格及全平台單人佔用權威 |

**本輪對 0006 後 Schema 的淨異動**：新增 `game_story_participant_progress` **1 表**、移除 `game_interaction_instances` **1 表**，其餘已存在 5 張場景／內容／事件表沿用；變更既有 Session、EventInstance 的約束與欄位。最終不保留舊故事與新事件的重複執行事實。不新增投票表、第三條 Shared Track 進度表、`content_event_catalog`、AI Job 表或 SQL Trigger。

**主要索引**：保留 `idx_game_round_pair`、`idx_game_story_playing`、場景／主線／分類查詢、`game_round_events` 序號與事件查詢；新增 `game_story_participant_progress(story_session_id,account_id)` 主鍵和角色唯一索引；事件唯一性調整為 `(story_session_id,binding_id,track_scope)`，仍以 `repeatScope`／`repeatGroup` 保護重複語意。`game_scene_visits.visit_seq=1` 仍成立，因為本期只在同一 Scene 的不同 Area 移動。

### 4.3 R2 內容拆分、發布與釘選

- **Category**：小型 D1 目錄與 Tag 權重；不等於 Profile tag。Narrative 以 Category 穩定 `code` 表示適用性，實際場次仍固定 Category 的已發布版本 ID，避免單純更新 Category 顯示版本就讓既有 Narrative 失效。
- **Scene Manifest**：新 `scene-event.v2`，含 `sceneId/version`、固定 SHA、時間地點、2.5D 鏡位／圖層、`areas[]`（合法 Area／鏡頭／轉移）、`sceneObjects[]`（物件／初始狀態／可用槽位／允許的狀態轉移）、Hotspot／演出素材與 `sceneEventBindings`；書架、櫃檯等 Area 不另建 Scene。
- **Narrative Manifest**：新 `scene-event.v2` 有 `narrativeId/version`、已釘選 Scene、`eligibleCategoryCodes`、序列前置、`tracks.inviter.entry/nodes[]`／`tracks.acceptor.entry/nodes[]`、`sharedEventBindings[]` 與 `endingRequires[]`；`(role,nodeId)` 唯一。Publisher 檢查兩個 Entry、所有跨線 target、必經協作條件可達、Ending 可達與互等死鎖。舊 `scene-event.v1` 的單一 `entry/nodes` 不支援新需求，本地可乾淨重建且不實作相容轉換。
- **Global EventPool Manifest**：獨立版本及 SHA 的共用 Binding 清單，依 `sceneCapabilities`、前置規則與觸發設定自動成為符合資格場景的候選，不必在每個主線重複宣告；只在有明確可用且相容的 Scene 時裁定。
- **Event Definition／Binding Manifest**：EventDefinition 固定 `moduleType`、每種 `actionId` 與嚴格 `params` schema／Renderer；EventBinding 用 `trackScope/requiredActors/triggerConditions/presentationSteps/worldEffects/unlockNodes`、限定的 `inviterNextNode/acceptorNextNode` 與 `repeatScope`；跨主線／場景重用的同一 EventDefinition 不複製業務表。
- **Publisher 必驗**：原 Catalog／Manifest 雙向對應、SHA、版本、類別一致性、3:1 抽選依賴、Scene 能力、R2 資產／Renderer 白名單保留；新加兩個 Track Entry、所有節點目標、合法 actor/Area/物件／世界轉移、可發布的演出資產、必要 Shared 事件真人前置、無必經互等死鎖及至少一可達 Ending。未發布／未知 Module／無資產／循環依賴均 fail-closed。
- 選中的 category/scene/narrative/event version 都在本次選擇快照及 StorySession 中被釘選；R2 內容 immutable，內容退休不影響現有正在玩的場次，重連後不跳版。不把 `FILES` 私人真人照片與遊戲公開素材混桶。

**`scene-event.v2` 內容示意（僅解釋契約，不是可直接發布 Manifest）**：

```json
{
  "schemaVersion": "scene-event.v2",
  "narrativeId": "rain-bookshop-last-order",
  "scene": {"id": "rain-bookshop", "version": "v2", "sha256": "<pinned-sha256>"},
  "tracks": {
    "inviter": {"entry": "i-door", "nodes": [{"id": "i-door", "areaId": "entrance"}, {"id": "i-shelf", "areaId": "shelves"}]},
    "acceptor": {"entry": "a-shelves", "nodes": [{"id": "a-shelves", "areaId": "shelves"}, {"id": "a-counter", "areaId": "counter"}]}
  },
  "sharedEventBindings": [{
    "bindingId": "counter-meet", "trackScope": "shared",
    "requiredActors": ["inviter", "acceptor"],
    "triggerConditions": {"all": [
      {"track_event_completed": {"role": "inviter", "bindingKey": "narrative:rain-bookshop-last-order:inspect-slip"}},
      {"track_event_completed": {"role": "acceptor", "bindingKey": "narrative:rain-bookshop-last-order:inspect-bag"}}
    ]},
    "transitions": {"unlockNodes": {"inviter": ["i-shelf"], "acceptor": ["a-counter"]}},
    "worldEffects": {"order-state": "searching"}
  }],
  "endingRequires": ["inviter:book-identified", "acceptor:order-verified", "shared:final-exchange"]
}
```

實際發布需要完整 EventDefinition、Scene 物件、合法 state 轉移、所有節點台詞與資產釘選；上述縮寫不能繞過 Publisher 驗證，更不能由 Client 指定 actor 或任意下一節點。

### 4.4 與全身角色／五表情／2.5D 舞台的整合契約（2026-11-13 影響稽核）

本節承接原已確認的全身角色／五表情／2.5D 基線；本輪新增場景移動、人物站位、可見物件操作與兩種動效；原 B1 和人工 Gate B 不降低，也不再把「只能演出固定五張表情」誤當能自然做伸手／行走等動作。

| 來源 | 權威與擁有者 | SceneEventFramework 使用規則 |
|---|---|---|
| Scene 2.5D 背景／透明前景／鏡位／光色／熱區／音效 | Published Scene Manifest（`scenePresentation.version=2.5d.v1`）；呈現由 `StoryStage`／`story-stage-geometry` 負責 | 原 `scene-01/v2` 清空桌面背景、透明桌面前景與共用 cameraFrame、`cameras/hotspots/audioCues` 不得退化；場景空間資產不可被移至只屬單一主線的資料 |
| Narrative 節點表演 | 已發布的 `Narrative Manifest.tracks.<role>.nodes[].presentation`；role 由 Round 真實參與身分決定 | 以 `(storySessionId,role,nodeId)` 限定節點 ID，僅投影本人可見的 camera、表情、hotspot，不能繼續從全域 `nodes[]` 找雙人唯一 Node。 |
| Event 演出 | 已發布 EventBinding 的 `presentationSteps`（保留輕量 `presentationEffects` 可在新版本轉成同一 Renderer 的標準 Step），配合已提交 EventInstance／eventSeq | 僅接受合法 camera／五表情／角色 anchor／場景物件動畫／已發佈音訊；演出可中斷、略過，但不能直接造成 D1 故事推進或重複操作。 |
| 對方角色與五表情 | AvatarAndPreferences 已正式採用的 `full-body.v1`、`standing`、`avatarVersion`＋私人 partner-avatar API | `neutral/smile/surprised/thoughtful/concerned` 五圖及 `stageAnchors.head/feet` 由 `StoryPortrait` 顯示；Scene/Narrative/Event Manifest **不能存私人 R2 key、角色圖 URL、Gemini job 或表情生成結果** |
| Round／聊天／授權 | `game_rounds`、`game_round_events`、Room DO、授權快照 | 新 Episode 不產生另一間聊天室或另建房間；舊 Round ended／401／403 必須清私有角色投影 |
| B1 產圖／續做 | AvatarAndPreferences B1 流程 | 本 SPEC 只能使用已採用 ready 的人物套組；**不可呼叫 Gemini、下一張表情、正式採用 API 或因前景恢復自動續產** |

**規則與失敗保護**：

1. **發布校驗**：Scene 必須宣告 Area／物件狀態及有效鏡位、前後景、音效、熱區；Narrative 的雙 Track 節點與跨線／共享綁定目標皆存在；`presentationSteps` 只能引用合法 camera、五表情、熱區、角色站位、物件動畫與已發布音訊。未知動作 module、不可達 Ending、互等死鎖、任意 URL／JS／未審核動作資產均拒絕發布；本輪 D1 異動依 `4`，不受原「不得增加第六張表」舊語意限制。
2. **事件驅動的演出不改故事權威**：Domain 先驗 role、所在 Area、物件與事件前置條件；熱區本身不等於操作資格。點擊／拖動時可預覽本地動畫，但只有已提交的 D1 EventInstance／WorldState 形成業務效果；失敗同步回權威畫面。尚未解鎖的隱藏事件、個人線索不下發對方。
3. **效果的起訖**：`presentationSteps` 依本人 Track／Scene 基底鏡位播放，當事件完成、取消、改 Node 或 Chapter completed 時清除疊加；動作是否成功完全由 D1 的 EventInstance／WorldState／Progress 驗證，不因 animation finish／WS 重播改變故事權威。`presentationEffects` 是演出語法糖，不是另一套可修改進度的系統。
4. **角色與內容雙版本互不污染**：Scene／Narrative／Event R2 Manifest 依場次固定 SHA；`avatar.updated` 不能修改 `shared_revision` 或玩家個人進度，也不重抽主線。五表情先完整解碼＋句尾安全換角；新套組載入失敗保留仍授權的完整舊套組或安全佔位，失權即清除私人圖片；不因事件切表情而再次呼叫 Gemini。
5. **跨場次 UI 狀態**：新 `storySessionId` 要重設各自 Track 的文字逐句／事件 overlay／鏡頭與物件動畫、pending action、cue；畫面識別至少採 `storySessionId + actorRole + nodeId`，非單用 node ID。相同 Round 保留聊天、授權化身及 WS；reconnect 取得本人最新 track/world snapshot，不跳過本人仍未做的節點。
6. **背景與恢復**：Android Home／Web 失焦暫停 Scene 微動／音訊，回前景以授權 `/experience` 和增量事件游標恢復場次、Event 與角色；不重擲場景、不重送未知操作、不 autoplay 音效、不觸發表情生成／B1 續產。現有手動「關閉場景微動」必須維持。角色五圖同版本重用已解碼素材，Event 只按需載入自己的資產；Web／Android 應量測實際切換延遲、jank、記憶體，而非宣稱虛構 FPS。
7. **首條重寫與 Gate**：保留已經使用者核准的 16 款免費全身角色／80 張五表情與可重用書店素材，**不保留舊書籤／閱讀選項與抒情文案為必經故事**。改為 `3.8` 新敘事、兩次以上交會／分流、動作事件及可見微動；已確認角色畫風／身份不得退化，原 StoryDialogueAndExit UX-P1～P5、B1、Gate B 各自保留人工驗證。舊技術回放不能冒充新劇情試玩通過。

**接口邊界**：沿用 `/experience` 快照、Room 事件游標與 `avatar.updated` 授權投影；角色圖片仍由正式 Avatar 套組提供，不另建生成任務。**本輪只新增一張必要的個人 Track 進度表、整併一張舊互動表**，不是因為增加 Area／角色動畫就新增多張 D1 表；不提前實作 AI 沉浸模式。

## 5. HTTP／WebSocket API 設計（建議契約）

沿用既有 `/api/v1/game-rounds/{roundId}` 成員權限，所有 POST 由 Cookie／Bearer Session 推導真人 actor、接受 UUIDv7 `clientRequestId`，並驗 Round active + Claims；WS 只通知 D1 已提交的變更。下述新 API 命名為 SDD 提案，**不表示程式已有端點**。

| 方法與路徑（相對 `/api/v1`） | 行為／回應 |
|---|---|
| `GET /game-rounds/{roundId}/experience`（既有擴充） | 除 Category／Scene／Narrative／Episode，回 `myTrack={role,nodeId,areaId,revision}`、`sharedRevision`、本人可見的 `world`、`availableEvents`、安全的 `partnerPresence/partnerTaskStatus`；不回另一方完整節點／個人線索／未觸發 hidden Manifest |
| `GET /game-rounds/{roundId}/story/offers`（既有調整） | 回該次被凍結的最多 3 個**Category** 卡（`categoryId,title,rank,summary`）；移除直接選 Story Catalog 的舊語意 |
| `POST /game-rounds/{roundId}/story/vote`（既有調整） | `{clientRequestId,episodeSeq,categoryId}`；只在 pending 且候選含此類別有效；未結算只回等待狀態，決議後回 selectedCategory 與 StorySession |
| `POST /game-rounds/{roundId}/story/next`（新增） | `{clientRequestId,completedEpisodeSeq,agree:boolean}`；記真實同意／撤回；兩人同意才開始下一場，未同意維持聊天 |
| `POST /game-rounds/{roundId}/story/event`（統一事件操作） | `{clientRequestId,storySessionId,bindingId,actionId,params,expectedTrackRevision,expectedSharedRevision?,expectedEventRevision?}`。`params` 按已釘選 EventDefinition 的 `moduleType/actionId` 驗嚴格 schema；只有需要共享狀態時 `expectedSharedRevision` 必填，對既存 EventInstance 操作時 `expectedEventRevision` 必須符合當前 CAS。Actor、角色、可操作目標、有效的 nextNode／世界效果完全由 Server 判定。淘汰舊 `nodeId/expectedRevision` 作雙人共同進度的命令。 |
| `POST /game-rounds/{roundId}/events/query`（既有） | 按全域 `sequence` 有界補漏，授權欄位與隱藏資訊安全投影 |
| `POST /game-rounds/{roundId}/end`（既有） | 原「結束本輪互動」二次確認，與劇情完成無關 |

**事件操作 `params` 契約（設計提案）**：

| `moduleType`／`actionId` | 嚴格參數 | 權威檢核與畫面效果 |
|---|---|---|
| `move-area / enter` | `{areaId}` | 本人可走的相鄰 Area、入口條件、該 Area 的 camera／Hotspot |
| `inspect-object / inspect 或 flip` | `{objectId}` | 物件存在、可見／可達、合法操作；翻面只展示實際合法面向 |
| `manipulate-object / pick 或 place` | `{objectId,targetSlotId?}` | 持有／位置、合法槽位及共享 state transition；`place` 必須有目標槽 |
| `talk-to-npc / choose` | `{npcId,dialogueOptionId}` | NPC 當前位置、合法公開對話分支，不冒充另一真人 |
| `cooperative-action / submit` | `{optionId}` | 每位 actor 的合法選項分開保存，兩位真人提交後才結算 |

以上 `params` 都是**伺服器從當場釘選 Manifest 定義的白名單 ID**，不接受任意座標、未聲明欄位、直接設定世界旗標、假冒 actor、指定 nextNode 或 script。單純視覺預覽不 POST；已 POST 的動作仍以 D1 receipt 確認。

**例：邀請方把書袋拖放到櫃檯（新 API 示意，非現行實作）**：

```http
POST /api/v1/game-rounds/{roundId}/story/event
Content-Type: application/json

{"clientRequestId":"<UUIDv7>","storySessionId":"<UUIDv7>",
 "bindingId":"narrative:rain-bookshop-last-order:place-book-bag",
 "actionId":"place","params":{"objectId":"book-bag","targetSlotId":"counter-slot"},
 "expectedTrackRevision":3,"expectedSharedRevision":2,"expectedEventRevision":1}
```

Server 從 Session／邀請身分推導 `inviter` 並驗本人目前 Area、Item 被誰持有及槽位資格。成功 receipt 至少回 `clientRequestId/eventSeq` 及最新權威修訂；`/experience` 只向本人回新 `myTrack` 和准許的物件／線索，對方只收到授權範圍的共享提示。同一 requestId＋相同 payload 返回同一 receipt；同 requestId 不同 payload、過期角色／事件／世界 revision、物件已被別人拿走則 `409 EVENT_STATE_CONFLICT`，先重取 snapshot，**不得為補動畫而自動使用新 ID 重送**。若事件 instance 尚未啟動，`expectedEventRevision` 省略並在同批由 Server 建立；重試從原 receipt 判斷。

**例：雙人同意開下一場**：

```http
POST /api/v1/game-rounds/{roundId}/story/next
Content-Type: application/json

{"clientRequestId":"<UUIDv7>","completedEpisodeSeq":1,"agree":true}
```

第一人收到 `{"phase":"completed","myAgreedNext":true,"partnerAgreedNext":false}`；第二人同意後，Server 只**建立一次**第 2 場凍結候選，並以新 `episodeSeq` 呈現待選或直接開場。此範例省略共用授權 header，不含對方個人資訊。

**事件種類及通知**：保留 `message.committed`、`chapter.completed`、`room.ended`、Category／Scene／Narrative 選擇與 `story.next.requested`；把舊 `story.node_changed`（全域唯一 node）改為角色限定的 `story.track.updated` 與共同的 `story.world.updated`，`story.event.started|completed` 必須有 role/scope，不能向另一方廣播私有 nodeId、完整未觸發 Binding 或個人答案。`game_round_events.sequence` 仍是全 Round 全域遞增；傳給對方時以安全 `room.snapshot_hint` 或已投影事件提示讀取自己的 `/experience`，斷線先權威 snapshot 再依 cursor 有界補漏；WS／客戶端動畫不能代替 D1 receipt。

## 6. 原子操作與關鍵競態

1. **接受配對**：同 batch 驗雙方真實 Session、候選／已發布類別數量與每個類別至少一條**同類別且已解鎖**的主線、兩個 Claims 唯一、Round 建立及首場 Category offer 凍結。唯一類別自動決定，但不得偽造投票。若 Category／Scene／Narrative R2 無法驗證可玩，不能只建空場次；必要時延遲進場並保持可恢復的已提交決議狀態，不再擲骰。
2. **類別投票**：每人最後有效票是帶 `episodeSeq` 的事件；原邀請方決勝、選後不得改；伺服器 transaction 再驗 Category 與固定 offers；相同 `clientRequestId`／相同 payload 回原 receipt、相同 ID／不同 payload 409。
3. **決議及隨機**：依已選 Category／Narrative 適用類別／解鎖條件及 R2 內容驗證後只抽選一次；同一 D1 batch 建立 StorySession（初始化合法 WorldState／shared revision）、兩筆本人 Progress（邀請方／接受方各自入口）、一筆 SceneVisit 及唯一選中事件。失敗／未知結果先查既有 receipt／Session，不能再抽或只建半套雙軌。
4. **個人與 Shared 事件的原子結算**：`(storySessionId,bindingId,trackScope)` 唯一 EventInstance，從登入 actor 判定 role，再驗當前合法 Node/Area、EventInstance CAS、個人 Progress revision、必要 Shared revision、Round active／Claims 與 pinned Manifest。純個人事件只改本人 Progress；改世界的操作同批改 WorldState＋Shared revision 並寫 receipt。**雙人合作第一人提交**：只保存該真人答案及 Instance revision、狀態仍 active，不能推進另一人；**第二人提交**：在同一 D1 batch 驗兩份真人答案、套用共享效果、解鎖／合法分流及必要完成條件。雙方同時操作同物件只能有一份合法獲勝結果；輸家 409 並重新同步，不因本地動畫宣告成功。結局只在必要雙 Track＋Shared 條件齊備時提交 completed、取消未完 side，Round 聊天保留。
5. **再次遊玩**：僅在最新場次 completed 可對該 `completedEpisodeSeq` 表態，按 actor 最後有效事件判斷是否雙方同意；當第二個有效同意提交並將要建立 `episodeSeq+1` 時**讀取雙方最新已儲存興趣並凍結新類別候選**，不回溯舊場或用客戶端快照；兩票同時抵達／重送只產生一個 `episodeSeq+1`，撤回對既有已開始場次無效。不得把同一場結束與下一場選擇同時擁有兩個 playing。
6. **退出優先**：結束 Round 與任何投票、聊天、觸發、完成、重玩寫入，都在真 D1 原子交易重驗 active+Claims；退出先 commit 後其他命令 409，操作先 commit 後退出則保留合法歷史但 ended 不再供原玩家查完整內容。不得用 DO presence 或前端判斷代替。
7. **隱私**：未決議前不得向另一方洩漏投票內容；未觸發隱藏事件不揭露 definition、條件及結果；不要回原始私人興趣、Email、真實照片、個人好感度或私人 R2 key；系統旁白／NPC 不能冒充對方真人。

### 6.1 角色視角、CAS 與狀態恢復的明確規則

1. **互不覆蓋**：A 只有修改 A 的 `game_story_participant_progress` 權限，B 同理；任何系統事件改兩個角色節點前，必須先證實雙方已完成該 Shared Event 所要求的動作。只解鎖另一人的節點不能推進其 `current_node_id`，其尚未讀取的個人劇情保持待玩。
2. **EventInstance 與 WorldState 避免雙軌漂移**：任何共用物件操作、觸發、合作答案與其結果都在同一次 D1 受控批次結算；`game_round_events` 的 receipt 和其相依 D1 狀態一併成立，禁止一張表 completed／另一張 active 的過渡狀態。Shared Event 重入只依同一 instance 的 Revision＋真人答案判定，不能新建另一 instance 假裝第一次。
3. **私有進度／共享提示**：個人角色的敏感提示不能裝進公開的 `story.world.updated`；向對方只能送「你可參與的合作事項已解鎖」等白名單投影。即使 Client 已得知公開 Scene Manifest，也不應下載未解鎖 narrative 的秘密條件和對方答案。
4. **恢復順序**：重新連線先授權取最新 `myTrack/sharedRevision/visibleWorld/availableEvents`、`eventSeq`，再取進度後的受控事件；若事件游標已超過 snapshot，重新讀權威 snapshot，直到兩者一致才解除提交等待。不得因一方快或重連而自動選擇、跳節點、重抽 Scene、重播音效／產生 Gemini。
5. **完成與退出優先**：Chapter completed／Room ended 的 state transition 不可與新事件繼續競態；一方先結束 Round 時另外一方必須看到安全 ended，不可再觸發私人事件。保留原 `clientRequestId` 重複提交以及未知結果先查 receipt 的語意。

## 7. 開發增量與首條內容遷入策略

| Gate | 必須完成 | 明確禁止 |
|---|---|---|
| **SDD／BDD／TDD（本輪規劃）** | 使用者核准 Schema／API／事件條件，補完整案例與 RiskAudit | 此階段直接修改程式／DB |
| **Gate 1：雙軌底座／清理** | 先以 TDD 失敗測試驗兩人不同進度、角色授權與 World CAS；重構 Progress／Session／EventInstance、移除 `game_interaction_instances` 與舊平行命令、Publisher＋動作白名單；只在確認過的本地 DatingHigh 測試環境執行 Clean Rebuild，無舊資料相容／搬移 | 不碰未知／production／其他專案，不刪已核准角色來源與無關資產，不降低真 D1／授權 Gate |
| **Gate 2：雨聲書店新劇情／真實人工 Gate B** | 重寫故事與生活化台詞、至少兩次交會／再分流、角色站位與五表情、物件操作、Area 移動、可辨微動、環境／事件音效；Web／Android 雙人快慢不同、等待、斷線恢復、跨場次聊天／退出、效能及 UX-P1～P5/B1 逐項核對；使用者親自試玩核准 | 不將舊書籤／合作閱讀技術測試冒稱新劇本通過；**未核准不做其餘九條** |
| **Gate 3：餘下九條** | 僅在 Gate 2 通過後，按共同框架逐條補齊至至少十條完整可玩主線；測試有序、無序、混合、多場景／類別關聯、事件重用與有無分支主線 | 不能用十張場景圖或測試 fixture 充數 |

本輪新決策允許**已知 DatingHigh 本地測試資料**在實作 Gate 受控清除、重新建立新 Schema／內容，不需要遷移舊 StorySession／舊節點、保留過時的轉換器或雙表狀態。清除前必須驗實際 DB／R2 bucket、只屬本地、列出目標與備份／恢復路徑；資料清理和美術素材／程序碼清理分別驗證，其他專案、未知／正式環境絕不動。已套用的 `0005/0006` 不直接當作執行中資料偷偷改義；以清楚的本地 schema 重建與可重跑 migration 鏈收斂最終結構，**最終 DB 不應殘留無用表**。

### 7.1 移除過渡程式與本地乾淨重建的最終清單

| 依賴範圍 | 必須完成的清理／改造 | 不可刪除的正式能力 |
|---|---|---|
| `cloudflare/src/story-commands.ts`、`scene-event-commands.ts` | 統一 Category／Event／Track 的 D1 指令；移除舊 `story.action.commit`、全域 `current_node_id` CAS 及雙表結算路徑 | Session／Round 授權、receipt、聊天、全域 eventSeq、結束與重玩 |
| `backend/.../StoryDialogueService.cs`、`SceneEventFrameworkService.cs`、`StoryGraphPolicy.cs`、`EventRulePolicy.cs` | 改成一套 `scene-event.v2` 的雙 Track 投影與跨線驗證；移除平行單線節點策略與已無呼叫者的 Legacy 類別／方法 | 已驗證的角色權限、事件 Rule、R2 hash、斷線與退出政策 |
| `game_story_sessions`／`game_event_instances`／`game_interaction_instances` | 新 Track／World Schema，將舊互動執行事實合一並最終刪除 Legacy 表、索引、D1 指令；完成後驗 FK、CHECK、Unique、rollback 及 Legacy 表不存在 | `game_rounds`、`game_round_events`、Claims、正式帳號／配對紀錄結構 |
| `contracts/story-scenes.json`、`scene-event-content.json`、`tools` 內容發布流程 | 以新版 R2 Manifest／Publisher 取代過時的書籤內容與 `scene-event.v1` 轉換器，刪除已無 runtime／測試使用者的舊腳本／素材副本；保留確實被引用的背景與角色圖 | Category→Scene→Narrative→EventBinding、不可變內容版本／SHA、既有免費角色視覺 |
| `frontend/client` 的 `ADVStage`／`StoryStage`／`InteractionRenderer`／`StoryExperienceScreen` | 把單一 node 與 modal 流程改為本人 Track、Area／物件、角色／演出；刪除已失去入口的舊 UI 分支 | Web／Android、聊天、換角五表情、退出確認與受控快取 |

清理先做**實際引用追蹤**（程式、測試、工具、migration 與已發布內容配置）；正式需要的共用函式不能依檔名或時間判斷就刪除。只針對已識別的 DatingHigh 本地 DB／R2 開發資料使用 Clean Rebuild，不寫舊遊戲資料 migration，也不新增 fallback 相容路徑。已套用過的 migration 不可在未知環境倒改；建立可從空本地環境重建的唯一最終 Schema／發布鏈，清後核對表與索引、真 D1 操作及 Web／Android。**本 SDD 階段只規劃、不執行清除**。

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

**測試策略**：Domain Unit（雙 Track 圖可達、反覆交會／回單方、無必經死鎖、共享物件白名單、個人可見性、只在必要節點等真人）；Publisher（JSON Schema、Area／hotspot／renderer、動作資產、跨線相容性、內容 SHA）；**真 Miniflare D1**（兩筆 Progress 建立／同一物件雙人競態／CAS／冪等／雙人不同步／退出與完成競態／清理 schema）；API／Worker（actor-scoped 投影、未分享線索不洩漏、R2／WS／snapshot 復原）；Web／Android 實際點擊／拖放／Area 移動／人物／微動／兩次交會及人工 Gate B。舊驗證案例須按新業務意義改寫，而非直接刪測試或將 HTTP fixture 當 SQL 原子證據。

**文件追溯與本輪停止點**：`MVP-001` AC-005-04～23 → 本 SPEC `SEF-AC-001～024` → [BDD](../bdd/SPEC-001-SceneEventFramework-BDD.md) **121 場景** → [TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md) **625 項（含 10 組 RiskAudit GAP 共 20 項測試）** → [RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md)。舊 RQ-01～03／RA-Q1/Q2 均保留；**V2-RQ-01=A 已確認**，新版 12 項風險及 10 項 GAP 各有文件處置／TDD 落點。Phase 5 交接只代表可以由 well-done 開始開發，絕不冒稱 E01／Gate B 已在產品實測通過。

### 8.1 跨 SPEC 人物／舞台整合驗收（不取代原 Gate B）

| 驗收 ID | 必須驗證的結果 | 追溯 |
|---|---|---|
| SEF-AC-013 | Scene／Narrative 拆分後 2.5D 鏡位、背景／前景、熱區、音效完整；Event 演出以安全的鏡位／表情／音效效果疊加並能還原，非法 ID 不得發布 | MVP AC-005-08/13；StoryDialogueAndExit 2.5D |
| SEF-AC-014 | 已採用五表情與 Scene 各自維持版本；新套組完整解碼＋句尾安全換角；失敗不顯示混包、失權即清除；Event 不啟動 Gemini | MVP AC-005-13；AvatarAndPreferences B1 |
| SEF-AC-015 | 動態熱區依權威事件資格顯示、預覽不提交；新 Episode 重設舞台但保留 Round 聊天／當前 Avatar；背景／重連不重抽、重送、autoplay、續產 | MVP AC-005-09～11/13 |
| SEF-AC-016 | 首條雨聲書店 Web／Android UX-P1～P5、免費／AI 全身人物、兩結局、微動與場景素材實證；使用者人工 Gate B 核准後才擴充其餘九條 | MVP AC-005-14；StoryDialogueAndExit Gate B |
| SEF-AC-017 | 本人目前採用化身的五表情未就緒時禁止遊戲入口、恢復、票券及操作；清除私人畫面並提供個人檔案入口；不受另一組 pending 化身影響 | MVP AC-005-16；§1.2；BDD-079 |

### 8.2 本次雙 Track／共享世界／場景體驗新增驗收

| 驗收 ID | 必須驗證的結果 | MVP 追溯 |
|---|---|---|
| SEF-AC-018 | A／B 各自 Node／Area／Revision；快慢不同、離線／恢復不跳過任何一人必經節點；進度不能互蓋 | AC-005-17 |
| SEF-AC-019 | 同一 Narrative 可重複個人→共享→指定一方／雙方分流→共享，條件解鎖與 Ending 有可達性檢驗，無互等死鎖 | AC-005-18 |
| SEF-AC-020 | 私有線索不先向對方洩漏、分享後共享；物件被拿取後另一端視圖一致，雙人競態和冪等安全 | AC-005-19 |
| SEF-AC-021 | Scene Area 移動、物件點選／翻面／拖放、NPC 對話、角色位置／表情／鏡頭與音效由可驗合法操作驅動 | AC-005-20 |
| SEF-AC-022 | AmbientMotion 雨滴／反光／物件持續位移肉眼可辨且可關；StoryMotion／必要動畫不因關微動而消失，雙平台畫質與效能量測 | AC-005-21 |
| SEF-AC-023 | 首條雨聲書店以新劇情至少兩次交會／再分流、口語且具目標、自然共同收尾；人工 Gate B 明確核准才製作其餘九條 | AC-005-22 |
| SEF-AC-024 | 本地乾淨 Schema 重建、已知測資清除、舊互動表／重複程式及內容依賴已移除；聊天／退出／授權／Avatar／多場次及真 D1 回歸不退化 | AC-005-23 |

## 9. 已確認的 SDD 取捨（SEF-RQ-01～03=A）及 RiskAudit 後續關卡

| ID | 原因及對實際遊玩的影響 | 使用者已確認方案 |
|---|---|---|
| SEF-RQ-01（已確認 A） | 已玩過的場景仍有未玩過主線時，如果場景「去重」採硬排除，玩家可能很久玩不到那條新主線 | **採 A**：場景與主線未玩過／已玩過權重初期 **3:1**，舊場景仍有機會；經人工試玩可調整。不採 B 的硬排除。 |
| SEF-RQ-02（已確認 A） | 若主線抵達 Ending 後仍可觸發原場次支線，容易造成「已完成卻在更新舊進度」與重玩衝突 | **採 A**：收尾即封存本次未完成支線；可聊天，欲探索須雙方同意開始新場次。不採 B。 |
| SEF-RQ-03（原已確認 A） | 原 SceneEventFramework 需要版本化內容與事件，避免新增無用內容目錄 | 原 `0006` 的五張新增表已存在，EventDefinition 留 Immutable R2、零 `content_event_catalog`；**本輪最新使用者要求清理重複資料表與舊程式，因此再新增 1 張 Progress、刪除 1 張 Legacy Interaction，並非否定先前五張必要表**。 |

**決策記錄**：2026-11-12 SEF-RQ-01=A（3:1）、SEF-RQ-02=A（Ending 封存 Side）、SEF-RQ-03=A（0006 五表、EventDefinition R2）、RA-Q1／RA-Q2=A 全部保留。雙軌、三次交會、回單方、21 Node 首條劇本已用於本次 perfect-plan；**2026-11-16 V2-RQ-01=A**：E01 改成「再看一眼書架，替今天畫個句點」，只播放結尾演出、自然完成，無可互動尾聲。產品與人工 Gate B 仍待 well-done 驗證。

### 9.1 2026-11-12 RiskAudit 最終確認（RA-Q1=A／RA-Q2=A）

- **SEF-RA-01／RA-Q1=A**：已選 Category 時 Scene 與 Narrative 都需適用該類別，`eligibleCategoryCodes` 由 Publisher／遊玩抽選雙重檢查。此判斷不需要**另建類別關聯第六張表**；本輪新增 `game_story_participant_progress` 是獨立雙軌執行事實，不是增加 Category 表。
- **SEF-RA-02／RA-Q2=A**：只有每次新場次開始（雙方同意且伺服器成功凍結候選時）才以最新已儲存的雙方興趣重新推薦；以伺服器一次受控提交取得同一份候選快照，斷線／重試皆沿用。原已選場次不得變更。
- 其餘高／中／低風險均有具體實作護欄與 TDD 補強，按 [RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md) 紀錄執行；**已確認風險不代表程式已驗收**。

## 10. 引用與修改範圍

- MVP：`docs/requirements/MVP-001-LoveGameDatingApp.md`（AC-005-04～23，新一輪新增雙 Track／場景互動 AC-005-17～23）
- 原上游：[StoryDialogueAndExit](SPEC-001-StoryDialogueAndExit.md)；`docs/verification/SPEC-001-StoryDialogueAndExit-Verification.md`（既有 Gate B、全身視覺未結案）
- **實際已套用基線**：`cloudflare/migrations/0005_story_dialogue_exit.sql`、`0006_scene_event_framework.sql`，及 `cloudflare/src/story-commands.ts`、`scene-event-commands.ts`、`scene-event-content.ts`；後續需移除失效的 `0005` 單線操作與 `game_interaction_instances` 相依。
- **Domain／Application**：`backend/src/DatingHigh.Domain/StoryGraphPolicy.cs`、`EventRulePolicy.cs`、`backend/src/DatingHigh.Application/SceneEventFrameworkService.cs` 與 `StoryDialogueService.cs`；沿用正式入口、移除重複節點推進。
- **內容與呈現**：`contracts/scene-event-content.json`、`contracts/story-scenes.json`（舊版待移除）、`frontend/client/src/StoryStage.tsx`、`ADVStage.tsx`、`StoryExperienceScreen.tsx`、`InteractionRenderer.tsx`；免費角色素材與五表情依原 SPEC 保護。
- **實作／測試修改範圍**：`cloudflare/migrations`、`cloudflare/src`、`backend/src/DatingHigh.Domain`、`DatingHigh.Application`、`tools` 的內容發布器、`frontend/client/src`、真 D1／Unit／Integration／API／Web／Android 測試。本文為 SDD 文件更新，尚未修改程式或刪除資料。
