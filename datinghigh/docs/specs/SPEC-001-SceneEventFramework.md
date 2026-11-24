# SPEC-001-SceneEventFramework：場景、主線與可重用事件框架

**功能 ID**：SPEC-001-SceneEventFramework
**來源 MVP**：[MVP-001-LoveGameDatingApp.md](../requirements/MVP-001-LoveGameDatingApp.md)（US-005／AC-005-04～35；V3 新增 AC-005-24～35）
**順序**：第 5 份，共 9 份 SPEC；依賴 `SPEC-001-MatchingSessions`、`SPEC-001-StoryDialogueAndExit`，提供 `SPEC-001-AffectionAndFeedback`、`SPEC-001-OnlineGamesAndQuests` 可重用基礎
**優先級**：高
**日期**：2026-11-17（雨聲書店 V3 故事全面重製 SDD；通用雙軌底座沿用先前設計）
**階段**：**2026-11-17 V3 SDD（RQ-01～05=A、06=A＋C）與容量 SEF-V3-RQ-01=B 均已確認，BDD／TDD／RiskAudit 完成規劃、Phase 5 Ready for well-done（僅文件交接）**。新版新增 BDD 70 場、TDD 250 項（含 10 項 RiskAudit 補強），歷史基線與最新合計為 BDD 191、TDD 875；V3 仍 **0/70 場、0/250 項**實際驗收。舊 V2 正式內容和既有 56 個完整覆核測試僅是歷史，不代表 V3 新人物、互動或 Web／Android 人工 Gate B 已通過。交接詳見 [最新 TDD Phase 5](../tdd/SPEC-001-SceneEventFramework-TDD.md)。
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
- **沿用既有驗收品質，不沿用過時實作手段**：V2 現行全身角色＋五張整圖、R2 ready Manifest、B1 表情與 2.5D Gate B 仍屬產品現況和舊版驗收；**V3-RQ-06 已確認改採 2D Puppet＋少量預製姿態**，保留五種表情的**語意／品質驗收**，但新版正式角色就緒資格改由 Rig Package 的完整性與實際表情／動作測試決定，**不再強制同一角色產出五張完整全身圖**。新流程尚未實作前仍執行既有伺服器 ready Gate；驗收不得空窗、降級或假稱已生效。

### 1.2 本人目前採用化身的遊戲入口條件

遊戲入口、恢復、即時連線票券及遊戲操作須由伺服器核對本人目前正式採用的化身。**既有 V2 現況**：內建角色完整五表情目錄，生成化身須為本人所有、未刪除且 ready，具有有效 R2 Manifest 及五張完整表情物件；不符回 `409 OWN_AVATAR_PACK_NOT_READY`，不提供劇情內容／票券／操作。**V3 正式目標（V3-RQ-06 已確認）**：改驗 `ActorRigPackage`（來源身份／owner／asset+rig 版本／完整分層／骨架／必要動作／五種語意表情／遮擋／hash／可解碼測試）是否 `ready`，不再以有五張整圖為必要條件；免費角色查正式資產目錄、AI 角色讀私人 R2 經授權的不可變 Rig Manifest。新 Gate 完整實作與雙平台驗證以前，舊 Gate **不得關閉**。

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

### 3.8 首條「雨聲書店」V3 互動故事 SDD（本版取代 V2 首條敘事）

**本節是已確認的規劃基線：SDD 六項決策及容量 B 已確認，BDD／TDD／RiskAudit 已完成 Phase 5 交接；實作、發布與平台證據以[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)為權威，人工 Gate B 仍須使用者試玩。** 2026-11-17 使用者要求**完全重新設計**雨聲書店，並明確接受先整理新 SDD 的方向。舊 §3.8「被雨打亂的最後一單」第 27 號取書單、I01～I08／A01～A08／S01～S03／E01～E02 **不再是目標劇情與未來人工驗收基線**；已發佈的 V2 及其技術回歸證據只屬現有產品歷史事實，不可宣稱 V3 已完成。其餘 Scene／Narrative 抽選、雙 Track、同意下一場、聊天與退出等通用契約繼續有效；既有 SDD 的 V2 特定節點、結局與演出引述，均以本節為新內容設計的優先依據。

#### 3.8.1 故事定位、固定角色與公開／私有資訊

- **工作劇名**：《雨聲書店・雨停之前》；Scene 保持 `rain-bookshop`（新版本須單獨發佈），新 Narrative 建議 `rain-bookshop-before-rain-stops`（`v1`）。舊 `rain-bookshop-last-order/v2` 不得原位覆寫；已進行中的舊 Session 只使用其原 SHA 釘選，更新發佈只影響新場。
- **時間線**：同一個傍晚；I 難得準時下班來熟悉的書店、A 下午放假出門逛街到傍晚遇雨避入書店；不是兩人同時進店或彼此已認識。外部大雨、室內輕音樂、木質與咖啡香由文字加場景及音效共同交代。
- **角色**：`inviter`=原邀請方 I；`acceptor`=接受方 A；雙方使用已採用正式全身化身且不固定性別；**店員 NPC 是有獨立可見人物身份、服裝、站位、表情、動作與對白的非真人角色**。不以 NPC 代玩家傳訊，不由系統代玩家搭話、回答、告白、同意或承諾見面。
- **體驗主題**：各自閒逛／選書 → I 看見 A 坐在角落被書感動、可選擇是否靠近 → A 可分享心情／只聊書／婉拒 → 大雨使低窪門口進水 → 店員先維持安全再請兩人協助保護乾燥書架的預留書 → 雨漸小、店員請兩杯咖啡、雙方自然聊天。無「丟失第 27 號訂單」的舊任務。
- **玩家隱私**：A 的書籍偏好、虛構角色感受／背景選項，僅在 A 主動分享之前保留 A 私有事實；I 只能看見故事明確的可見行為（讀書、流淚）及本人實際收到的回覆。問的是角色心境，**不蒐集或宣稱玩家真實失戀、壓力或人生經歷**；提供「單純被書感動、不設定經歷」中性選項。
- **真人聊天**可全程開啟，但公開分享建議按下才送出，選項及旁白不隱性發出本人訊息；玩家對話無須符合特定腳本才能推進。

#### 3.8.2 單 Scene 多 Area、視覺狀態與素材統一性

本故事同一 `SceneVisit` 中使用 `street-view`（只作開場／結局短分鏡）、`entrance`、`shelves`、`reading-corner`、`counter`、`window`、`safe-storage` 等 Area。**每個 Area 都使用符合其視角的獨立背景／前景／可互動物件素材**，但固定同一書店平面動線、入口／窗戶／書架／櫃檯相對方位、材質與照明、同一店員造型；不同區域不能只裁同一張圖，也不能各自生成互相矛盾的店面。物件／人物嵌入背景原位，鏡位與點擊座標同步，依 §3.8.7A 演出。

| 分鏡群／Shot ID 建議 | 必有可見素材及動作 | 聲音／切換要求 |
|---|---|---|
| `sh-street-rain`、`sh-street-approach` | 下班／逛街視角、街道與招牌、雨勢增強；不可直接假裝有完整跨場景移動 | 戶外雨聲到門鈴，轉室內時雨聲變遠 |
| `sh-entrance-welcome` | 真書店入口、店員迎賓立繪／表情／站位；I/A 各自獨立開場 | 開門、門鈴、輕音樂淡入 |
| `sh-shelves-wide`、`sh-book-closeup` | 書架各類型原創封面、可讀簡介、可點試讀頁、翻書動畫 | 選取特寫／翻頁音；回到原書架構圖 |
| `sh-corner-observe`、`sh-corner-tear` | 閱讀角椅子、A 坐著看書、眼眶濕潤與眼淚層；I 視角只顯可見行為 | 鏡頭進近景、音樂輕微降低；不得自動顯露 A 的私密內心 |
| `sh-corner-approach`、`sh-corner-chat` | I 靠近／退開、A 抬頭、雙人合理站位、必要表情 | 隨選擇對應位置、表情與對話；沒有同步快進另一人 |
| `sh-npc-pass` | 店員拿書經過、問候、離開，至少起止兩個可見站位 | NPC 說話時人物可見、語句與動作順序對齊 |
| `sh-window-downpour`、`sh-entrance-seep` | 雨變大、街道積水、門縫滲水、地板水痕逐步擴展 | 輕音樂退後，雨／水聲增強，先提示安全動線 |
| `sh-npc-safety`、`sh-safe-shelves` | 店員指引往安全區，危險入口不可進入，乾燥書架與高處放置區 | 店員擔心／指引表情及位置，不做玩家角色替身 |
| `sh-rescue-books`、`sh-storage-ready` | 書單、封面比對、乾燥書籍、收納箱、放置高處的物件狀態改變 | 取書／放書／完成音效，物件狀態必須對應 D1 權威 |
| `sh-rain-eases`、`sh-coffee-serve`、`sh-window-coffee` | 雨勢減弱、店員微笑端兩杯咖啡、桌上兩杯咖啡熱氣、溫暖窗景收尾 | 水聲淡出、原輕音樂回來、咖啡杯輕觸桌面 |

**素材規格**：每個必經節點至少綁定一個有效 `shotId` 或具體的「前一有效 Shot + 有效增量演出」，且可確認玩家視角確有可見畫面變更；每個 NPC 出場節點必須有 NPC 人物素材、合法動作和站位；書籍／咖啡／收納箱／水位不可以通用文字框取代。支援同一實體場景可重用基底、攝影機與圖層，禁止以「每個節點都換一張不一致的全畫面圖」冒充連貫畫面。正式資產用內容版本、SHA／MIME／合法引用釘選。缺必要素材、未知 NPC／Cue／Renderer／動作時 Publisher **拒絕 V3 發布**，不能只在執行時退化為文字。

#### 3.8.3 第一段：I/A 各自獨立開場與情緒分支

| 節點 ID／角色 | 玩家看到的劇情與**本人**互動 | 畫面／NPC／轉移 |
|---|---|---|
| `iv3-01` I | 難得準時下班，走向最喜歡的獨立書店，享受不被趕時間打擾的傍晚 | `sh-street-approach` → `sh-entrance-welcome`；門鈴，店員微笑迎接 |
| `iv3-02` I | 店內音樂、香氣與戶外濕熱形成對比；可環視店內 | 入口慢鏡頭、可見店員返回櫃檯，音樂漸入 |
| `iv3-03` I | 書架展示愛情／成長／親友／人生等類型；可自由點封面、閱讀原創摘要／試讀，提醒可用聊天室分享閱讀經驗 | `sh-shelves-wide` ↔ `sh-book-closeup`；書架探索事件可重複且不阻塞 |
| `iv3-04` I | 走至閱讀角，注意 A 坐著翻書、眼眶有淚；旁白僅推測「被書打動了嗎？」 | 必須以 A 已完成 `av3-05` 的**可見狀態**才演出 `sh-corner-observe`／`sh-corner-tear`；否則 I 可先逛書架 |
| `iv3-05` I | 選「試著靠近」或「先繼續自己的小世界」；後者可回書架探索，保留再次選擇及後續外部雨情事件 | `sh-corner-approach` 或回 `sh-shelves-wide`；不強制搭話，不無限空等 |
| `iv3-06` I | 若靠近，三選一：溫柔關心／體貼提供面紙／從手上的書聊起 | 播放對應的 I 站位／道具／書封特寫；**選擇提交前不顯示 A 回應** |
| `av3-01` A | 下午放假逛街、傍晚遇雨避進書店，店員讓人慢慢逛 | `sh-street-rain` → `sh-entrance-welcome`，店員表情與迎賓動作 |
| `av3-02` A | 想起自己已許久沒認真看書，四處逛書架，點選封面與類別、可分享書籍但不強迫聊天 | `sh-shelves-wide`／`sh-book-closeup` |
| `av3-03` A | 選容易被哪類故事感動：愛情／成長療癒／親情友情／人生故事 | 四組原創封面與文本範例，所選屬**本人的私有劇情事實** |
| `av3-04` A | 可選角色共鳴原因：錯過的人／剛失去的感情、工作或人生壓力、親友回憶、未來迷惘，或「純粹因為故事而感動」；不得推定真人真實遭遇 | 書頁近景，對應短獨白與表情；選項與主題適配，不能把錯配的經歷套到所有書 |
| `av3-05` A | 在閱讀角坐下，閱讀到動容，角色眼眶泛淚／擦眼角；不向 I 自動揭露原因 | `sh-corner-tear`、坐姿和眼淚圖層、音樂輕化；可見狀態解鎖 I 觀察 |
| `av3-06` A | A 可繼續讀書；若 I 尚未搭話可逛書／聊天；若 I 真提交搭話方式，A 才看到該方式並自行回應 | `sh-corner-chat` 僅在合法邀請事件出現；沒有由 NPC 代替邀請 |

**書籍分支資料**：類別與各自 `bookId`、封面、原創摘要／試讀、適用 `emotionTheme`、可選 `resonanceId`（含中性選項）必須版本化且相容；書架類型選擇不得透露另一方 Profile／私人興趣。聊天建議只供按下後由真人發送。此處的「香氣」僅能藉文字／環境物件暗示，不宣稱裝置有嗅覺輸出。

#### 3.8.4 第二段：接觸、接受方回應與自然認識

| Shared／節點 | 前提與雙方實際選擇 | 成功後呈現與流向 |
|---|---|---|
| `sv3-01-approach` | I 在 `iv3-06` 親選 `concern`「你還好嗎？」、`tissue`「需要面紙嗎？」、或 `book`「這本好看嗎？」；A 已進入可接觸的閱讀角狀態 | A 才收到確切那一個選項的視覺分鏡；I 顯示「等待對方回應」，不偽造答案或重播搭話 |
| `av3-07` A | 本人選 `open-up` 願分享一點**角色**心情、`books-only` 只聊書、或 `decline` 想獨處；若 I 選面紙，允許先道謝但仍獨立選是否聊天 | A 抬頭／擦眼淚／微笑／禮貌保持距離的視覺動作各有對應 Cue；未發送前 I 不可見 |
| `sv3-02-response` | 系統只投影已提交 A 回應；I 必須自己選擇合理接話（理解／聊書／尊重獨處），不能自動代言 | `open-up` → `sv3-03-books`；`books-only` → `sv3-03-books`；`decline` → 兩人各自探索，保留外部雨情必達路線 |
| `sv3-03-books` | 雙方各自可分享選過的書或類型；共同喜好導向共鳴、不同類型導向交換推薦，不需要互相輸入真實個資 | `sh-book-closeup` 雙封面與 `sh-corner-chat`；對方只看本人主動分享的書籍資訊 |
| `sv3-04-smalltalk` | A 可說「我原本只是進來躲雨」；I 可選擇分享「今天難得準時下班」或不說；自由聊天全程可用 | 二人站位逐漸自然，表情依**實際已選回應**變化，沒有預設已相愛 |
| `sv3-05-clerk` | 店員 NPC 拿書經過問候，兩人可各自回應或只點頭；若尚未認識，店員同樣自然路過，但不強制互動 | `sh-npc-pass`：NPC 有入場／表情／站位／離場的可見演出 |
| `sv3-06-weather` | 兩人可繼續閱讀或聊天；當必要開場個人節點完成後，雨勢事件**獨立於是否搭話**可合法觸發，且每場僅一次 | 已認識者看到共同轉場；尚未認識者各自看到相應視角，但進入同一個雨情事件，避免「不搭話就卡關」 |

**選擇語意**：搭話方式是 I 的已提交私有選擇，A 合法觸發後僅看到該方案；回應是 A 的選擇；只有回應已提交才揭露給 I。`decline` 不可被後續 NPC／事件偷偷改成「已同意聊天」，玩家可以之後主動再次接觸，但不重播同一搭話請求騷擾；開場等待可讀書／聊天／中性提示，不把另一人離線當作同意或拒絕。

#### 3.8.5 第三段：雨勢、低窪入口進水與安全合作救書

| Shared／節點 | 業務事件與必要動作 | 受控畫面、NPC、世界狀態 |
|---|---|---|
| `sv3-07-downpour` | 大雨再度增強、窗外路面積水，玩家可查看窗景 | `sh-window-downpour`，雨勢層級 `heavy`；兩視角一致，音效漸強 |
| `sv3-08-seep` | 因書店入口地勢較低，水從門縫滲入；店員察覺異常，提醒先避開門口 | `sh-entrance-seep`、店員走向門口／擔憂、地板水層從 `dry` → `seeping` |
| `sv3-09-safe` | 店員先確認出口／電器危害，要求兩人移到乾燥安全區，並通知有能力處理進水的人；危險區域停止一般探索 | `sh-npc-safety`、`sh-safe-shelves`；角色移位由真人完成或經已發佈的安全導覽，不讓玩家涉水靠電 |
| `sv3-10-help` | 店員說：「明天讀書會要用的預留書還在乾燥書架，能不能幫忙找出來，先放到高處？」玩家可各自接受安全的書籍整理任務 | 店員面向兩人求助的立繪與手持清單；兩位玩家的承接動作不能被互相代提交 |
| `iv3-07` I | 查看乾燥書架中多本原創封面，與 A 分享自己看到的書名／分類 | `sh-safe-shelves`，點書放大特寫；正確書實物狀態可被權威拿取 |
| `av3-08` A | 查看店員的讀書會預留清單，取得與 I 互補的分類、封面或識別線索；按分享才提供另一方 | NPC 傳遞清單的可見短演出；清單特寫，A 私有線索 → 主動共享 |
| `sv3-11-find` | I/A 分享必要線索後，兩人核對清單與書封；錯誤書可恢復、提示重比對，不永久鎖死、不洩漏未分享私有答案 | 兩本對照 UI／書封特寫；正確書被合法選中且可見 |
| `sv3-12-pack` | I 親自把書放進乾燥收納箱；A 親自核對數量／標籤並把物品放到高處；店員 NPC 也在安全區整理自己的書，但**不代兩位真人完成必須的操作** | `sh-rescue-books` → `sh-storage-ready`，物件 `at-shelf→held→in-box→on-high-shelf` 與唯一持有人／CAS 同交易 |
| `sv3-13-relief` | 書已安全收好，雨勢與滲水停止增加，外部協助到場；店員確認危險解除後道謝 | `sh-rain-eases`、水位 `stable`、NPC 放鬆／微笑；不可憑動畫播放完成進度 |

**安全邊界**：淹水只發生在低窪入口，任務目標必須仍在**乾燥、安全、遠離電源與積水**的區域；若水位超過安全門檻，必須改撤離／中止整理而不是要求玩家救書；不得教授玩家冒險涉水操作電器。地板水、書籍、箱子、水位狀態由受控共享世界保存，不能兩端各自假定。重要：曾選擇不搭話／婉拒的角色仍可因共同安全任務建立工作上的互動，**不能將此解讀為接受私下交友邀請**。任一方暫離時，已提交的個人／共享進度持久保留，允許安全的個人探索但不冒名完成合作。

#### 3.8.6 收尾：三種以雙方選擇決定的咖啡結局（V3-RQ-04=A，使用者已確認）

危機解除後店員真實走到桌邊端兩杯咖啡致謝（`sv3-14-thanks`、`sv3-15-coffee`）；咖啡不代表兩人願意交往或必須喝。兩位玩家各自對 `sv3-16-final-wish` 提交三選一：`keep-talking`（想再聊聊）、`share-books`（聊書就好）、`quiet-rest`（想獨處）。本人的意願在提交前不向對方展示，不冒充真人回覆。

| Ending | 雙方真人選擇 | 實際不同的劇情畫面／NPC／互動 |
|---|---|---|
| `ev3-01-more-talk`《雨停之前，再聊一會》 | 雙方都是 `keep-talking` | 同桌靠近、鏡頭拉近、互動對話提示；沒有自動告白、約見或聊天訊息 |
| `ev3-02-book-recommendation`《留下一本書的名字》 | 雙方都不是 `quiet-rest`，且至少一方選 `share-books` | 已選兩本書真正出現在桌上、可互相推薦，鏡頭轉向書籍；沒有強制私人話題 |
| `ev3-03-gentle-distance`《剛剛好的距離》 | 任一方選 `quiet-rest` | 雙方分坐舒適位置、窗雨／舒緩音樂、保持自主聊天；NPC 不強迫交談 |

三種版本的對白、分鏡、座位、表情、書本互動與 NPC 動作都要不同，不能只替換末段文字。都以「雨漸小、未來還有下一頁」的意境自然 `chapter.completed`，聊天室／下一場雙方同意／退出維持原有規則。單方先選時不結算，不強迫等待中的玩家停用聊天；第二人提交時 D1 原子決定唯一 Ending。若水災超過安全條件，先走 `safety-exit` 撤離版本而**不得端咖啡留在危險書店**，此為安全後備，須獨立驗證可達收尾、不使雙人死鎖。

#### 3.8.7 嚴格內容／API／DDD／資料／渲染器變更契約

1. **內容優先**：`contracts/scene-event-content.json` 改指向新的 V3 Scene／Narrative 來源；原 V2 仍為已釘選 Session 的歷史版本，未重新發佈的新遊玩不再選中舊 Narrative。新故事每個節點寫明 `nodeId/role/areaId/lines/shotId/actorCues/hotspotIds/transition`；需要同一節點多 Shot 時用有序 `presentationSteps`，有權威前置／成功後可見性。把每個 `sceneBeat` 的素材需求記在 Manifest 而不是程式硬編碼。
2. **擴展共用 2.5D 契約**：現有 `scenePresentation.backgroundAsset`、`cameras`、`hotspots` 和 `presentationSteps` 只有單背景／有限角色／物件／音效能力，V3 建議新增嚴格型別的 `shot`（背景／前景／圖層／camera／lighting／weather）、`npc`（可見 NPC ID、站位、表情、有限動作）及 `stageTransition`（鏡頭切換／淡入淡出／疊層切換），每一動作都必須是已發布白名單。新 `book-browser`／`weather-layer`／`coffee-service` 優先做**可重用 renderer**，不為書店直接寫特殊 UI；發布工具及 Client 共同以 Manifest 驗必要素材和狀態。
3. **NPC 實體表現**：目前 `npcs[]` 僅是互動目標，`trackPresentationStepSchema` 的 `character` 只支援真人兩個 role，V3 需要 NPC 專用 actor 及固定映射，不得以一張站立圖冒充端咖啡／走路；若無已核准的動作資產，改採合法鏡頭／遮擋／物件切換的有限演出，畫面仍需真能看見 NPC 與動作因果。NPC 不持有真人 Progress，不另建第三個玩家 Track。
4. **角色情緒與姿態（V3-RQ-06 已確認）**：使用本人已選的全身 Master 及版本化 `ActorRigPackage`，透過通用骨架／局部臉部參數表達五種情緒、坐著閱讀、抬頭、持書與淚光。原來五張整圖是 V2 歷史路徑，新 V3 不要求每個動作重新生圖；Rig 不足的大幅坐姿僅首次補必要合法 pose，仍須保留角色身份及正確桌椅遮擋。運行期 **Gemini 0 次**，不因外表性別設定表情。
5. **安全、隱私與同步**：`StorySession` 保留兩筆 `StoryParticipantProgress`；角色個人選書／情緒／搭話／回應存在受控 EventInstance／角色事實，已分享的書與公共水位／物件放在既有 `world_state_json` 可驗證的有限 flag／object state。每次本人動作走原有 `story.event.submit`、`expectedRevision`／`clientRequestId`／D1 CAS、`game_round_events`／HTTP snapshot／WS hint；投影只回本人可見 Shot／Cue／NPC 狀態、已公開世界與確實被分享的資訊。**目前沒有證據必須新增 D1 資料表**；先列零新表方案，若現有 JSON 尺寸／交易模型不夠再提出具體差異與回歸。
6. **API 提案**：優先沿用既有 `GET /api/v1/game-rounds/{roundId}/experience` 與 `POST /api/v1/game-rounds/{roundId}/story/event` 的身份驗證／回覆，擴充已發布內容與 actor-scoped snapshot 的 `stageShot`／`npcStates`／`environmentState`／`availableBookInteractions`；不設任意 asset URL、任意 client cue 或另一套 NPC API。請求仍是 `bindingId/actionId/params/expectedEventRevision/expectedTrackRevision/expectedSharedRevision/clientRequestId` 的現有受控欄位；精確 DTO 名稱需實作前由既有契約校正，不盲目宣告新增路由。
7. **失敗處理**：非法分支、未同意的搭話代答、尚未公開的私有選書、無效角色姿態、缺圖／音效／NPC 或跨視角素材矛盾，發布端拒絕。提交失敗／競態／斷線先恢復權威 Track／World／NPC 狀態，撤銷本地成功動畫，不自行改 request ID 重送；背景／失焦不自動重播音效或劇情動作。音效保留獨立環境與事件生命週期。
8. **素材存放與成本**：R2 使用新版本 immutable SHA，仍採共用的正式素材一份與必要 Manifest；書封／試讀全部採原創或有授權文字／圖像，避免未授權複製既有書籍。素材預製，劇情運行不生成圖片或 NPC。iOS 依既定 MVP 暫緩；Web／Android 均要以實際畫面與真操作驗收。

#### 3.8.7A 多區域場景內嵌式互動（V3-RQ-05=A，使用者已確認）

**最新使用者設計要求**：書店各區域要有專用背景、保持同一書店的空間與畫風；書籍、桌面、NPC、箱子、咖啡杯等物件必須**在場景中的原位出現，點選物件本體才啟動抽出／展開／打開／收起等動畫**。禁止目前漂浮感強的通用圖形卡片、發光 `✧` 熱區與前景貼圖。

- **分區專屬素材**：入口、書架、閱讀角、櫃檯、乾燥儲藏、窗邊咖啡分別有環境基底圖、近／遠景、可互動物件分離圖層、前景遮擋、接觸陰影、鏡頭、雨與光源。統一店內地圖／書架位置／家具／NPC 外觀，不是同一張全景硬裁切，也不能不同 AI 生圖導致場景穿幫。
- **物件嵌入與點擊**：在 JSON 配置 `areaVisual` 與 `embeddedInteractable` 的 `objectId/assetId/depth/anchor/hitShape/occlusion/visibleConditions/interactionPreset`；讓書脊嵌在書架，NPC 腳底貼地，杯子貼桌面，位置隨相機、裁切和不同螢幕精準轉換。隱形觸控範圍代替常駐大按鈕；首次教學、hover／長按才可顯低干擾引導。
- **場景內轉場動畫**：點書脊→書本從原位抽出→鏡頭放大→打開封面／原創試讀→關閉／放回；點 NPC→轉頭／表情→對話框；拿書→真實離架→拿在手中→放箱→放高處。動作進度與權威 D1 狀態綁定，失敗不得先播放成功動畫。
- **避免穿幫**：移走物件後背景有正確空位／遮罩底圖；人物在椅背、桌面後方要被遮擋，腳底與接地陰影、透視比例／色溫一致；雙人視角讀相同世界狀態，不可 A 拿走書後 B 仍在書架看到。
- **可重用 Renderer 與 Gate**：以通用 Area Stage、Embedded Interactable、Animation Preset 配置，未知圖層／動作／資產拒發；真 Web/Android 驗每區點擊精準、開闔回位、角色遮擋、背景無殘影、素材與鏡頭一致，不寫雨聲書店專屬 React 分支。

#### 3.8.7B 玩家與 NPC 姿勢／表情可重用化（V3-RQ-06=A＋C，使用者已確認）

**本階段執行範圍：靜態優先、動態暫緩。** 依使用者最新決策，先使用已確認的四種靜態姿態與五種表情整合人物、NPC與場景；本節後述Puppet、連續站坐／眨眼／流淚／取書動畫及動作試作改列後續，不作當前靜態交付前置，也不保留目前不用的試作程式。靜態角色身份／五官／衣裝／姿態品質、素材SHA與完整性、私人授權、現行ready防線及Web／Android與劇情Gate B仍須驗證，不以延期動畫放寬資料安全或宣稱新套組已ready。動態案例延期不等於通過，混合案例仍依靜態部分逐項核對；決策與回復證據見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)。

目前 `StoryPortrait` 主要切換五張完整角色圖片、`StoryStage` 以平移角色呈現動作；缺少真坐姿／閱讀／端杯／持書。建議抽象 `ActorMotionRenderer`，玩家及 NPC 都透過 `actorId + rigVersion` 和可宣告 `pose/expression/gesture/lookAt/propAttachment/position` 的 Cue 演出；劇本無需按劇情反覆生圖。

| 技術方案 | 可行做法 | 風險／取捨 |
|---|---|---|
| A：**2D Puppet 分層／骨架** | 從正式全身 master **一次性**分離頭、臉、軀幹、手、腿、髮與眼／嘴局部貼圖，套用通用骨架、網格、微動與表情參數 | 最能保原本 2.5D 視覺，但原圖被遮住的身體結構不會自動出現，需一次性補圖及 rig 品質驗證 |
| B：**標準化 3D humanoid** | 共用骨架、動畫與 BlendShape，每角色另做 3D 外觀 | 連續站、坐、走較自由，但從個人照片或免費插畫保真建立 3D 外觀成本高，與目前畫風差異大 |
| C：**少量離線專用姿態＋局部動作** | 每角色有站立／坐著／看書／持書少量姿態，臉部與呼吸／眨眼用局部動畫、鏡頭補間 | 較容易控制品質，但姿勢增加會隨角色增添素材，動作自由度有限 |
| D：**Live2D／Spine 專業逐角 rig** | 將每角色圖像正式分層與網格綁定，再重用動作模板 | 視覺品質高但逐個使用者 AI 化身 rig 成本可觀，單張 PNG 無法自動生成自然全姿態 |

**正式選型：V3-RQ-06=A＋C（2026-11-17 已確認）**。以全身 Master 為身份基礎，只在新角色建立／首次採用流程做一次性可重試的分層、遮擋補圖、骨架綁定、局部眼口表情製作和必要的 `sit/read/hold` 姿態，建立已驗證的不可變 Rig Manifest。保留 `neutral/smile/surprised/thoughtful/concerned` 五種**表情語意**，透過臉部局部參數／貼圖和骨架狀態實現，**不要求各五張完整全身圖，也不在劇情每段產新圖**。`idle/blink/read/sit/tear/turn/hold/smile` 使用預製曲線／rig／姿態資產；書籍道具掛載到合法手部錨點，角色與椅子／桌面互相遮擋。正式編輯素材後先由使用者真機／Web 驗一款原免費角色及一款 AI 角色，再完成其他角色；免費 16 款原上半身與 ID 保留。高角度轉身、深坐姿等單張平面 Master 不足處，允許於初次建檔一次性補姿態，不假稱骨架可憑空生成看不到的部位。

**Rig 完成判斷與失敗策略**：`ActorRigPackage` 以 `(avatarAssetId, sourceHash, rigSpecVersion, expressionSpecVersion)` 為唯一建檔版本，宣告 `layers[]`（素材 ID、SHA、尺寸、alpha）、`skeleton`（joint／mesh／binding）、`posePresets[]`、`expressions[]`（五語意狀態及可驗 face cues）、`propAnchors`、`stageAnchors`、`validation` 與 `ready`。正式 AI 資源放本人私人 R2、免費角色版控公用索引；後端依原有登入／角色採用授權傳可讀投影，不洩漏他人私人 R2 key。首次建檔容許受控重試失敗分層／動作；**ready 後的選角、切表情、進場、聊天、斷線、切回角色都只讀不可變包，Gemini 呼叫數須為 0**。Rig 缺層、hash 不符、角色身份漂移、動作／表情品質未通過都不得 `ready`。版本變更與原 ready 角色不混包；測試前不自動清除既有正式或未知環境資料。原 `AvatarAndPreferences`／`StoryDialogueAndExit` 五張整圖式 ready 契約須在 V3 BDD/TDD 一併改成新 Rig 完成條件，**仍保留相同或更嚴格的防缺圖、防混角、防重產、五情緒與 Web／Android Gate**；本 SDD 不是已實作。

**SEF-V3-RQ-01=B（2026-11-17 使用者已確認）：Rig 儲存容量採品質優先、受控增加**。個別 AI Rig 的正式私人 R2 bytes（Master、必要 layers／遮罩／Pose／Manifest、不可回收的合法衍生資產）**允許超過同一角色原本五張完整全身表情圖**，不可再以「必須不高於五圖」作為 ready 或內容發布的阻擋條件。**仍必須**以每個角色的舊五圖 bytes 當比較基線，量測新版總 bytes、圖層及短效素材去向、生成／重試次數、完成等待、共用素材去重、R2 成本與異常警戒，禁止無限制增加圖檔／為每個表情或劇本產整張人物圖；不存在合法 owner/reference 的孤兒資產才可依受控流程清理，不能清除已 ready 資產或跨帳號檔案。人臉相似度／解析度／五情緒／自然動作／Web 與 Android 品質 Gate 不得因成本降低；遇容量增加但品質達標，可受控採用並保留容量成本紀錄，不自動卡在舊基準。警戒值需要實際觀測後訂定，**未授權設定具體比例或金額上限**。此為製作與交接契約，並非已量測或實作。

**與 MVP-005 相容界線（2026-11-17 核對）**：本期 V3 角色可從已核准的完整全身 AI Master 建立 Rig，但未來 `MVP-005-AvatarWithDating.md` 要改成「AI 只生臉、身體／衣服共用拼裝」，應讓 `ActorMotionRenderer` 接受不同版本的身份來源（本期 `ai-full-body`，未來 `ai-face-only`）與統一動作 Cue；不能在故事內容寫死每位玩家一套全身圖／五套表情。共同骨架與動作／服裝素材應可跨玩家共用、個人只存身份相關素材和選件設定；原畫畫風／臉部辨識／五情緒語意／正式就緒 Gate 不降級。**這是未來擴充接縫，不宣告本期已實作捏臉、換裝、AI face-only，也不能保證拆層後一定比原五張圖省容量**。實際相容性、資產 byte 數與臉／衣服接縫品質依 [AvatarAndPreferences](SPEC-001-AvatarAndPreferences.md) 首輪 Gate 實測。

#### 3.8.8 V3 驗收門檻、風險決策與 SDD 人工確認

| V3 驗收標記 | 明確可測結果 |
|---|---|
| `V3-AC-01` | 兩人各自獨立進店，I 下班和 A 避雨的時間線一致；各有街景→入口 Shot／店員迎賓／雨聲門鈴音樂，合法 Area 導覽與本人投影；各自進度不可互推；缺開場素材拒絕發布 |
| `V3-AC-02` | 各種類原創書籍可從書架**原位書脊**點擊、抽出、翻封面／摘要／試讀、關閉復位；已選書籍先私有、本人分享才公開；書種與情緒主題要相容，反覆預覽不構成事件提交 |
| `V3-AC-03` | A 可以選已發布原創書籍的**虛構角色情緒共鳴**或中性「純粹感動」，不可推定玩家真實經歷或更新 Profile；閱讀角坐姿、眼淚和 I 所能看到的可見行為符合先後順序，私有原因不得外洩 |
| `V3-AC-04` | I 可自選靠近／不搭話，靠近時有關心、面紙、聊書三種**不同場景演出**；A 由本人選願談心／只聊書／拒絕，婉拒後不強迫私人聊天；送面紙與道謝不等於同意交往 |
| `V3-AC-05` | 已搭話／未搭話／婉拒的雙 Track 都可前進到共同雨情，任一方快慢、離線、重連與換機保持獨立進度、Area 與 Revision；不得代選、互等死鎖、假訊息或越權提交 |
| `V3-AC-06` | 店員 NPC 有固定可見人物、立足位置和一致外觀；迎賓／路過／玩家點人物本體交談／察覺進水／安全指引／整理書及端咖啡都要有合法姿態與道具演出，不冒充真人訊息 |
| `V3-AC-07` | 大雨到積水、門口滲水、救書後雨勢漸小均有合法音畫與兩端共同世界狀態；危險區停用探索與整理，超過安全門檻強制走撤離路線；僅安全乾燥區能操作書籍，不能靠近積水電源 |
| `V3-AC-08` | 店員預留書單和書架原創封面提供互補私人線索，真人主動分享後才公開；錯書可重選；I 找書入乾箱、A 核對與移到高處皆本人實際操作，物件位置和 D1 CAS 原子一致，NPC 不代通關 |
| `V3-AC-09` | 救書完成後雙方真人各選最終意願；都想再聊→同桌；至少一人聊書且均不想獨處→雙書推薦；任一方想獨處→保持舒服距離；三結局有**不同鏡頭／NPC／道具／人物距離**，危險時優先 safety-exit，completed 不結束 Round（V3-RQ-04 已確認） |
| `V3-AC-10` | 每個必經 V3 節點與過場均有可發布合法 Shot、NPC、音效、書籍／物件／角色 Cue，Publisher 拒絕缺素材或未知動作；新 V3 內容 SHA 與舊 V2 Session immutable 分離；必經首條 Web／Android 人工 Gate B 達標之前不做其餘九篇 |
| `V3-AC-11` | 同一書店各區有專屬但一致的背景與圖層；書籍／NPC／道具在原位可點並實際抽出／開啟／交談／拿放／復位，鏡位、遮擋、陰影與多人世界狀態正確；不顯示漂浮熱區；必經素材不齊拒發（V3-RQ-05 已確認） |
| `V3-AC-12` | V3-RQ-06 已確認 2D Puppet Rig＋少量預製姿態：一款免費與一款 AI 可自然從站立→坐下閱讀→抬頭／流淚→持書；五語意表情由局部 Cue／rig 呈現且身份不漂移；首次建檔／ready Rig Package 驗證素材 SHA、遮擋、動作、跨裝置授權；ready 後切換、重連、進場及動作不呼叫 Gemini，原 Gate 防缺包／混包不退化 |

**跨規格責任**：SceneEventFramework 負責 Shot／NPC／World／事件、Publisher 與安全投影；StoryDialogueAndExit 負責 ADV 舞台／`ActorMotionRenderer`／五種表情語意／對話框／聊天與收尾 UI；AvatarAndPreferences 依 V3-RQ-06 提供正式 `ready ActorRigPackage` 及首次建檔流程。新 V3 驗收須同時通過角色一致性、分鏡視覺與 Web／Android 真雙人操作。舊 `rain-bookshop-last-order` 測試可保留作版本回歸，但**不能拿既有 v2 的綠燈取代本版 V3 測試**。

**雨聲書店 V3 SDD 決策記錄（2026-11-17）**：使用者明確確認 V3-RQ-01／02／03 全部採 A；V3-RQ-04／05 採 A、V3-RQ-06 採 A＋C。**六項均已正式確認**，不是只把建議寫入。
- **V3-RQ-01=A（已確認）接觸與拒絕**：採接受方選擇獨處後停止私聊推進；即使因淹水共同協助，也只推進安全合作，除非雙方之後主動開始聊天。
- **V3-RQ-02=A（已確認）感動原因**：採用**虛構角色情緒**與中性選項，無需玩家真實隱私；書籍類型改變演出和可選共鳴，不要求把「選了失戀」寫進玩家 Profile。
- **V3-RQ-03=A（已確認）書店進水安全**：採只在門口積水，救書限乾燥安全區；危險狀況優先撤離，絕不以玩家身體涉險作任務。
- **V3-RQ-04=A（已確認）多結局**：正式採用三種以雙人意願決定的咖啡結局：同桌深入聊天／交流選過的書／保持舒服距離；每種實際分鏡、道具、人物與 NPC 不同，危險進水時優先撤離，見 §3.8.6。
- **V3-RQ-05=A（已確認）場景與物件融合互動**：分區專屬且一致的書店環境，所有書／NPC／箱子／咖啡融入背景原位，點擊本體才播放抽出／閱讀／交談／拿放／返回動畫，不能漂浮在背景前。詳見 §3.8.7A。

- **V3-RQ-06=A＋C（已確認）角色動畫架構**：正式採「2D Puppet 分層骨架＋少量一次性預製姿態」，保留五語意表情，但改由臉部局部動畫／表情狀態呈現；一次性 rig 建檔且品質檢核通過後保存不可變套組，不再按表情／劇情即時生成全身圖片。玩家與 NPC 共用可控動作介面；免費 16 款原畫保真。`AvatarAndPreferences` 與 `StoryDialogueAndExit` 的舊五圖式 `ready` Gate 需同步修改，不能忽略跨規格契約與測試。詳見 §3.8.7B。

本節已將 V3-RQ-01～06 與 `SEF-V3-RQ-01=B`（Rig 容量可在品質優先前提下受控增幅）正式回寫，**未修改程式／R2／D1／角色資產**；最新 BDD 191 場／TDD 875 項（新 V3 70 場／250 項）、12 風險與 10 GAP 已追溯並完成 Phase 5 規劃交接。既有 V2 技術驗證及 Gate B 不能代替新 V3 真實驗收。

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

### 4.4 與全身角色／五表情語意／2D Puppet／2.5D 舞台的整合契約（2026-11-17 V3 修訂）

本節將原已確認的全身身份、五種表情**語意**、2.5D、B1 安全與人工 Gate B 品質保留，但**V3-RQ-06 已正式取代「一定需五張完整全身表情圖」的實作手段**：由首次建檔的 `ready ActorRigPackage`（分層骨架＋少量預製姿態）驅動新版人物演出，場景原位點擊／遮擋則依 V3-RQ-05；此為設計，現有 V2 程式需在 Well-Done 與 BDD/TDD 更新後受控遷改。

| 來源 | 權威與擁有者 | SceneEventFramework 使用規則 |
|---|---|---|
| Scene 分區背景／圖層／鏡位／內嵌點擊區／音效 | Published Scene Manifest（V3 `areaVisual/embeddedInteractable/interactionPreset`），由 `StoryStage` 與共用 Scene Renderer 處理 | 不同 Area 使用一致空間設定下的各自環境圖、可移除物件、前景遮擋與光影；不常駐顯示 `✧` 浮動熱區，點物件本體才有對應書本／NPC 動畫；V2 舊背景只是歷史資產 |
| Narrative 節點表演 | 已發布的 `Narrative Manifest.tracks.<role>.nodes[].presentation`；role 由 Round 真實參與身分決定 | 以 `(storySessionId,role,nodeId)` 限定節點 ID，僅投影本人可見的 camera、表情、hotspot，不能繼續從全域 `nodes[]` 找雙人唯一 Node。 |
| Event 演出 | 已發布 EventBinding 的 `presentationSteps`（保留輕量 `presentationEffects` 可在新版本轉成同一 Renderer 的標準 Step），配合已提交 EventInstance／eventSeq | 僅接受合法 camera／Rig 五表情語意／pose／角色 anchor／原位物件動畫／已發佈音訊；演出可中斷、略過，但不能直接造成 D1 故事推進或重複操作。 |
| 對方角色與五語意表情／姿勢 | AvatarAndPreferences 正式採用的 `ready ActorRigPackage`，來源 `avatarAssetId + rigSpecVersion + expressionSpecVersion`、授權的本人／partner-avatar 投影 | `neutral/smile/surprised/thoughtful/concerned` 以 Rig 局部臉部參數與合法姿態顯示，站坐／拿書有對應骨架及道具 anchor；Client 不直接收到他人私人 R2 key，Narrative/Event 不保存玩家角色圖 URL、Gemini job 或生成結果 |
| Round／聊天／授權 | `game_rounds`、`game_round_events`、Room DO、授權快照 | 新 Episode 不產生另一間聊天室或另建房間；舊 Round ended／401／403 必須清私有角色投影 |
| 初次生成／Rig 建檔 | AvatarAndPreferences 的首次採用 B1＋一次性 Rig 編譯／品質驗證流程 | 本 SPEC 只使用經授權且已採用的 `ready` 套組，不能在劇情／換姿勢時呼叫 Gemini、重建 Rig、另發候選或背景續做 |

**規則與失敗保護**：

1. **發布校驗**：Scene 必須宣告 Area／物件狀態及有效鏡位、前後景、音效、內嵌物件與合法 `hitShape`；Narrative 的雙 Track 節點與跨線／共享綁定目標皆存在；`presentationSteps` 只能引用合法 camera、五表情語意、Rig pose、嵌入原位點擊、角色站位、物件動畫與已發布音訊。未知動作 module、不可達 Ending、互等死鎖、任意 URL／JS／未審核動作資產均拒絕發布；本輪 D1 異動依 `4`，不受原「不得增加第六張表」舊語意限制。
2. **事件驅動的演出不改故事權威**：Domain 先驗 role、所在 Area、物件與事件前置條件；熱區本身不等於操作資格。點擊／拖動時可預覽本地動畫，但只有已提交的 D1 EventInstance／WorldState 形成業務效果；失敗同步回權威畫面。尚未解鎖的隱藏事件、個人線索不下發對方。
3. **效果的起訖**：`presentationSteps` 依本人 Track／Scene 基底鏡位播放，當事件完成、取消、改 Node 或 Chapter completed 時清除疊加；動作是否成功完全由 D1 的 EventInstance／WorldState／Progress 驗證，不因 animation finish／WS 重播改變故事權威。`presentationEffects` 是演出語法糖，不是另一套可修改進度的系統。
4. **角色與內容雙版本互不污染**：Scene／Narrative／Event R2 Manifest 依場次固定 SHA；`avatar.updated` 不能修改 `shared_revision` 或玩家個人進度，也不重抽主線。整份 Rig Package（含必要分層／五語意表情／動作）先驗證與解碼，再按句尾或安全點換角；新套組載入失敗保留仍授權的完整舊套組或安全佔位，失權即清除私人圖片；不因事件切表情而再次呼叫 Gemini。
5. **跨場次 UI 狀態**：新 `storySessionId` 要重設各自 Track 的文字逐句／事件 overlay／鏡頭與物件動畫、pending action、cue；畫面識別至少採 `storySessionId + actorRole + nodeId`，非單用 node ID。相同 Round 保留聊天、授權化身及 WS；reconnect 取得本人最新 track/world snapshot，不跳過本人仍未做的節點。
6. **背景與恢復**：Android Home／Web 失焦暫停 Scene 微動／音訊，回前景以授權 `/experience` 和增量事件游標恢復場次、Event 與角色；不重擲場景、不重送未知操作、不 autoplay 音效、不觸發表情生成／B1 續產。現有手動「關閉場景微動」必須維持。角色 Rig 同版本重用已解碼分層／骨架／預製姿態，Event 只按需載入自己的資產；Web／Android 應量測實際切換延遲、jank、記憶體，而非宣稱虛構 FPS。
7. **首條重寫與 Gate**：保留已使用者核准的 16 款免費全身角色身份／畫風／ID；既有 80 張完整表情 WebP 視為歷史實作資產，新 Rig 成品通過驗收後受控取代其動畫角色，不任意刪原畫或正式資產，**不保留舊書籤／閱讀選項與抒情文案為必經故事**。改為 `3.8` 新敘事、兩次以上交會／分流、動作事件及可見微動；已確認角色畫風／身份不得退化，原 StoryDialogueAndExit UX-P1～P5、B1、Gate B 各自保留人工驗證。舊技術回放不能冒充新劇情試玩通過。

**接口邊界**：沿用 `/experience` 快照、Room 事件游標與 `avatar.updated` 授權投影；正式角色由已 ready 的 Rig Package 提供，不另建遊戲中生成任務；新首次 Rig 建檔屬 Avatar 層，入口檢驗與現有 D1 資料重用。**本輪只新增一張必要的個人 Track 進度表、整併一張舊互動表**，不是因為增加 Area／角色動畫就新增多張 D1 表；不提前實作 AI 沉浸模式。

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
| **Gate 2：雨聲書店 V3 完整故事／真實人工 Gate B** | 實作 §3.8 的雙開場、搭話與拒絕、多視角接續、安全淹水合作、NPC、每節點 Shot／背景／書籍／物件／音效及三種已確認咖啡 Ending（以及安全撤離例外）；Web／Android 真雙人快慢不同、斷線恢復、新角色 Rig＋五情緒語意／NPC／分鏡品質、效能及 UX-P1～P5/B1 逐段試玩；使用者本人明確核准 | 不將 V2 第27號訂單、文字框、舊技術測試或缺素材預覽冒充 V3 完整體驗；**未核准不做其餘九條** |
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

**文件追溯與本輪停止點（2026-11-17 最新）**：[BDD](../bdd/SPEC-001-SceneEventFramework-BDD.md) 保留舊 121 場、增 V3 原 60＋RiskAudit 10＝**191 場**；[TDD](../tdd/SPEC-001-SceneEventFramework-TDD.md) 保留舊 625 項、增 V3 原 240＋稽核 10＝**875 項**。[RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md) **12 項風險／10 GAP 已閉環到文件**；容量 `SEF-V3-RQ-01=B` 已取得使用者決策，Phase 5 **Ready for well-done（規劃層）**。V3 仍 0/70 BDD、0/250 TDD 實作驗證；舊 RA-Q1／RA-Q2、SEF-RQ-01～03 與歷史 V2 里程碑不因新版本改寫而失效。請由 Well-Done 按最新 TDD 交接實作，不能把本 SPEC 的 Ready 當成 Gate B 已過。

### 8.1 跨 SPEC 人物／舞台整合驗收（不取代原 Gate B）

| 驗收 ID | 必須驗證的結果 | 追溯 |
|---|---|---|
| SEF-AC-013 | Scene／Narrative 拆分後 2.5D 鏡位、背景／前景、熱區、音效完整；Event 演出以安全的鏡位／表情／音效效果疊加並能還原，非法 ID 不得發布 | MVP AC-005-08/13；StoryDialogueAndExit 2.5D |
| SEF-AC-014 | V3 已採用 `ActorRigPackage`（五語意表情）與 Scene 各自維持版本；新 Rig 套組完整解碼／姿態與動作驗證＋句尾安全換角；失敗不顯示混包、失權即清除；Event 不啟動 Gemini | MVP AC-005-13；AvatarAndPreferences B1 |
| SEF-AC-015 | V3 原位隱形可點物件／NPC 依權威事件資格啟用、預覽不提交；新 Episode 重設舞台但保留 Round 聊天／當前 Avatar；背景／重連不重抽、重送、autoplay、續產 | MVP AC-005-09～11/13 |
| SEF-AC-016 | 首條雨聲書店 Web／Android UX-P1～P5、免費／AI 全身人物、三種咖啡結局＋安全後備、微動與場景素材實證；使用者人工 Gate B 核准後才擴充其餘九條 | MVP AC-005-14；StoryDialogueAndExit Gate B |
| SEF-AC-017 | 本人目前採用化身的V3 角色 Rig（含五語意表情）未就緒時禁止遊戲入口、恢復、票券及操作；清除私人畫面並提供個人檔案入口；不受另一組 pending 化身影響 | MVP AC-005-16；§1.2；BDD-079 |

### 8.2 本次雙 Track／共享世界／場景體驗新增驗收

| 驗收 ID | 必須驗證的結果 | MVP 追溯 |
|---|---|---|
| SEF-AC-018 | A／B 各自 Node／Area／Revision；快慢不同、離線／恢復不跳過任何一人必經節點；進度不能互蓋 | AC-005-17 |
| SEF-AC-019 | 同一 Narrative 可重複個人→共享→指定一方／雙方分流→共享，條件解鎖與 Ending 有可達性檢驗，無互等死鎖 | AC-005-18 |
| SEF-AC-020 | 私有線索不先向對方洩漏、分享後共享；物件被拿取後另一端視圖一致，雙人競態和冪等安全 | AC-005-19 |
| SEF-AC-021 | Scene Area 移動、物件點選／翻面／拖放、NPC 對話、角色位置／表情／鏡頭與音效由可驗合法操作驅動 | AC-005-20 |
| SEF-AC-022 | AmbientMotion 雨滴／反光／物件持續位移肉眼可辨且可關；StoryMotion／必要動畫不因關微動而消失，雙平台畫質與效能量測 | AC-005-21 |
| SEF-AC-023 | 首條雨聲書店 V3 依 §3.8 完全取代第27號取書單，雙人各有開場、搭話／婉拒、書籍閱讀、淹水合作與咖啡自然收尾；每一必經環節都有可見素材切換及 NPC；人工 Gate B 明確核准才製作其餘九條 | AC-005-22（V3 修訂）；§3.8 V3-AC-01～12 |
| SEF-AC-024 | 本地乾淨 Schema 重建、已知測資清除、舊互動表／重複程式及內容依賴已移除；聊天／退出／授權／Avatar／多場次及真 D1 回歸不退化 | AC-005-23 |

### 8.3 雨聲書店 V3 專屬驗收追溯（六項 SDD＋容量 B 均已確認；BDD／TDD／RiskAudit 已補回）

本版新增需求 `AC-005-24～35` 與 §3.8.8 `V3-AC-01～12` 逐一對應；原每項 5 個 BDD 情境（`SEF-BDD-122～181` 共60）再補 RiskAudit 10 場（`SEF-BDD-182～191`），對應 Phase3 TDD240＋稽核10＝**新 V3 70 BDD／250 TDD**，總數191 BDD／875 TDD。原有 `SEF-AC-023` 與共用 `SEF-AC-001～024` 仍是基線回歸，**不得以 V2 任何綠燈取代 V3**。每個必要 `nodeId / bindingId` → 角色與本人視角 → 條件與互動 → 唯一 Shot、NPC／演出／資產 SHA → D1 權威結果 → 可達 Ending 的發布矩陣，由 SDD §3.8.3～3.8.7B 提供內容契約、BDD Publisher／雙人案例與 TDD 單元／整合／真機測試共同約束；**逐節點真素材、Web／Android 畫面與使用者 Gate B 證據仍須在 Well-Done 實作時驗證**，不因規劃追溯已覆蓋 AC 12/12 就宣稱角色或遊戲已完成。

#### 8.3.1 V3 MVP→SPEC→BDD→TDD 逐項追溯（使用者 B 決策後的最終規劃）

| MVP 新增驗收 | 本 SPEC 專屬驗收 | 原 V3 BDD | RiskAudit BDD（有增補者） | TDD 對應落點／狀態 |
|---|---|---|---|---|
| `AC-005-24` | `V3-AC-01` | `SEF-BDD-122～126` | 無新增 | `SEF-UT-367～381`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-25` | `V3-AC-02` | `SEF-BDD-127～131` | 無新增 | `SEF-UT-382～396`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-26` | `V3-AC-03` | `SEF-BDD-132～136` | `SEF-BDD-184` | `SEF-UT-397～411`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-27` | `V3-AC-04` | `SEF-BDD-137～141` | 無新增 | `SEF-UT-412～426`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-28` | `V3-AC-05` | `SEF-BDD-142～146` | 無新增 | `SEF-UT-427～441`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-29` | `V3-AC-06` | `SEF-BDD-147～151` | 無新增 | `SEF-UT-442～456`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-30` | `V3-AC-07` | `SEF-BDD-152～156` | `SEF-BDD-185` | `SEF-UT-457～471`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-31` | `V3-AC-08` | `SEF-BDD-157～161` | 無新增 | `SEF-UT-472～486`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-32` | `V3-AC-09` | `SEF-BDD-162～166` | `SEF-BDD-186` | `SEF-UT-487～501`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-33` | `V3-AC-10` | `SEF-BDD-167～171` | `SEF-BDD-188` | `SEF-UT-502～516`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-34` | `V3-AC-11` | `SEF-BDD-172～176` | `SEF-BDD-187` | `SEF-UT-517～531`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |
| `AC-005-35` | `V3-AC-12` | `SEF-BDD-177～181` | `SEF-BDD-182、183、189～191` | `SEF-UT-532～546`＋相同 BDD 的真 Integration／API／E2E；完整覆核見[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md) |

補強 ID：`GAP-01～10` → `SEF-BDD-182～191` → `SEF-IT-149～151`、`SEF-API-070～071`、`SEF-UT-547～548`、`SEF-ET-103～105`，完整一對一細節以 [RiskAudit](SPEC-001-SceneEventFramework-RiskAudit.md) 與 [TDD Phase 5](../tdd/SPEC-001-SceneEventFramework-TDD.md) 為準。**本表是規劃追溯 12/12，不是 12 項實際驗收通過**。

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
