# SPEC-001-StoryDialogueAndExit：雙人 ADV 劇情、對話與平順退出

**本階段靜態優先**：人物與NPC先以已確認姿態／五表情及對應Shot呈現；以下Puppet、連續眨眼／站坐／流淚／取書等角色動作暫緩，不作當前靜態路徑的前置Gate，也不保留未使用試作程式。場景／物件操作、真人選擇與同步、安全退出、素材品質／授權及Web／Android人工劇情Gate B仍須完成。優先範圍與證據見[SceneEventFramework](SPEC-001-SceneEventFramework.md)、[Verification](../verification/SPEC-001-SceneEventFramework-Verification.md)。

## 2026-11-17 V3-RQ-04／05／06 已確認：多結局、場景原位互動與 Puppet 舞台

**使用者最新決策**：`V3-RQ-04=A`（雙人意願三種結局）、`V3-RQ-05=A`（各區域獨立但一致的背景，物件和 NPC 與背景融合且點選本體後才展開）、`V3-RQ-06=A＋C`（2D Puppet 骨架＋少數一次性預製姿態）。**本節優先於**下方 2026-11-12「五張完整表情圖片」在 V3 的*角色演出實作方案*，但保留五種表情語意、完整全身身份保真、安全句尾換角、雙人聊天／退出與 Web／Android Gate B 等功能驗收。`V3-RQ-01～03=A` 也已明確獲使用者確認；**全部六項 V3 SDD 決策均已核准**，且使用者已選 `SEF-V3-RQ-01=B`（允許新 Rig 在不降品質及受控成本監測前提下超過舊五整圖容量）。**V3 BDD／TDD／RiskAudit 目前完成規劃與 Phase 5 文件交接**，但 Rig、舞台、角色生成程式與真 Web／Android／人工 Gate B 尚未實作驗證；不能當成已發佈或完成產品。

- **Area 舞台**：改為各區域有原位相互對應的背景／物件／前景遮擋／光源與可見 NPC。`StoryStage`／`StoryExperienceScreen` 必須能解釋已發布 `areaVisual/embeddedInteractable/hitShape/depth/interactionPreset`；常態無漂浮星號／卡片，玩家點書本、NPC 或箱子時才進入「從原位置抽出→特寫→打開／對話→收起返回」或受控拖放。人物地板影子、座椅遮擋、書本在書架上空位、雙方世界狀態不可穿幫。
- **通用角色 Renderer**：新增 `ActorMotionRenderer`，角色與 NPC 從已授權且 `ready` 的 `ActorRigPackage` 播放 `pose/expression/gesture/lookAt/propAttachment/position`；五情緒用局部眼／嘴／眉／骨架表達，不再靠五張整圖作為唯一動畫手段。部分大動作使用已發布有限 pose，非動畫幀產圖。完整解碼後按句尾／安全點換角，不混新舊身份；失權立即清私人素材。
- **實質三結局**：雙方都希望深入聊天→同桌中近景；雙方都願交流且至少一人只聊書→兩本已選書的實際推薦互動；任一方想獨處→各自舒適座位及窗雨鏡頭。可聊天但 NPC 不代真人表態，結局安全自然 completed；淹水不安全時優先撤離，不能端咖啡硬續劇情。
- **跨 SPEC Gate**：`AvatarAndPreferences` 需提供新的正式 Rig 與來源授權，既有五張整圖式 ready Gate 在新 Rig 完整實作、回歸與驗收前**仍須維持**；不得新增無素材即可進遊戲的分支。場景／角色／NPC 的預製素材與動畫白名單由 Publisher 驗證，Web／Android 實際測試原位點擊、人物站坐、遮擋、端杯、雙人競態、重連後狀態，以及已 ready 後切表情／重選角 Gemini 呼叫 0 次。
- **非目標**：不在本次 SDD 直接修改 `.tsx`、D1、R2 物件，也不自動將現有 80 張 WebP 刪除；新 Rig 如有成本／性能或身份偏移，必須在 1 款免費及 1 款 AI 角色的真機品質 Gate 驗證，再擴充所有正式角色。

**狀態**：僅同步使用者已確認的 V3 規格，未代表新 Rig 與多結局已開發或人工 Gate B 已通過。完整事件與每節點素材契約見 [SceneEventFramework §3.8](SPEC-001-SceneEventFramework.md)。



> 素材保存範圍：依使用者最新指示，僅保存正式runtime使用的角色WebP與目錄metadata，不再保留舊JPG、來源PNG或製作JSON。角色ID與已確認成品SHA保持；下文原畫比對屬製作驗收歷史，不要求持續保存原畫副本。人工確認仍以既有驗證紀錄為準，不能由素材存在或自動測試代簽。

> **2026-11-12 開發／製作方式續記**：已加入 v2 場景合成／授權五表情讀圖與 WS 換角，仍未全份驗收；最新實測見 [驗證紀錄](../verification/SPEC-001-StoryDialogueAndExit-Verification.md#2026-11-12-開發續接紀錄未結案)。使用者追加「直接你產生去比對就好，過程讓我確認」：免費角色改採 AI 延伸與原畫視覺比對、逐批人工確認，不加入鎖回原圖的合成流程或額外逐像素相等門檻；原畫仍保留，身份／衣裝／髮型／氣質不得任意重設。16款全身及五表情已逐批人工確認，80張透明WebP已輸出並接入選角；真Gemini及正式舞台完整驗收仍待完成。

> **2026-11-12 視覺體驗追加確認**：`Q-UX1=A` 第一人稱 2.5D、`Q-UX2=A` 固定五表情、`Q-UX3=B` 首場 UX-P1～P5 必做；`UX-RQ-01=B1` 前景阻擋、`UX-RQ-02=WS` 事件通知、`UX-RQ-03=R2-MANIFEST` 表情完成權威，**`UX-RQ-04=FULL-BODY` 免費16款保留原上半身向下延伸全身、AI全身化身五表情**。§3.1～3.9 及 `SD-AC-021～030` 已收斂；**本次 D1 新增／修改均 0，設計已更新但素材、UI 與測試尚未實作／驗收**。
>
> **2026-11-08 Well-Done 現況**：0005、真D1事件／投票、標準Room DO、共用ADV／合作／聊天／退出與首場完整內容已實作；逐平台結果、175/187（93.6%）覆核及保留項以 [驗證紀錄](../verification/SPEC-001-StoryDialogueAndExit-Verification.md) 與逐項追溯為準。Gate B人工實玩尚未確認，未達整份100%，不製作其餘九場／不勾十場MVP。下文保留原規劃與確認決策的日期脈絡。


**功能 ID**：`SPEC-001-StoryDialogueAndExit`
**來源**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
**優先級**：高；八份 SPEC 的第 4 份
**狀態**：2026-11-08 原 SDD 已確認且有部分 Well-Done 實作；**2026-11-12 新增全身／五表情／2.5D 方案已確認；`UX-AUDIT-RQ-01=CLEAN-RESET` 已確認：開發完成後先清除非正式環境全部舊角色與候選素材，再以全新角色端對端驗收，不實作半身角色相容／升級流程。新素材／實測尚未完成**。
**更新日期**：2026-11-12
**責任**：`US-005 / AC-005-01～03`、`US-012 / AC-012-02～04`，以及 `US-020 / AC-020-06～07` 的終止邊界。`AC-012-01` 的低分／冷卻提醒屬後續 `SPEC-001-AffectionAndFeedback`。
**依賴**：[PlatformFoundation](SPEC-001-PlatformFoundation.md)、[AvatarAndPreferences](SPEC-001-AvatarAndPreferences.md)、[MatchingSessions](SPEC-001-MatchingSessions.md)。

## 1. 目標、現況與範圍

本 SPEC 要交付「真實雙人戀愛養成遊玩體驗」，不是十個開場文字加聊天室：包含可重用的 ADV 劇情引擎、節點與分支、情境物件、共用互動模組、即時雙人協作、自由對話、故事章節完成及任一方安全退出。**配對成立時依雙方興趣排名，從當時可玩的劇情固定最多三個候選**：恰好一個就直接開始；二個提供二選一；三個以上推薦前三個供雙方選擇。二人選擇不同則依原邀請方的選擇決定本輪故事。只有二人需選時才存在等待投票的階段；一個劇情時不出現選劇情畫面。`game_rounds.active` 仍是唯一遊戲授權根；**故事章節完成不等於遊戲 Round 結束**，Round 在明確退出前仍可繼續對話、探索及承接其他後續模組。

**使用者 2026-11-07 確認強制驗證順序**：先完整開發**一個可從開場玩到本章結尾的劇情垂直切片**，含其所有實際分支、互動與支線、雙人 WebSocket、等待體驗、存讀恢復、角色／背景／動效／音效及退出；確認整體遊玩品質後再同引擎量產其他 9 場。既有十場表格是**規劃概念**，不能以「十場只有開場稿」或「第一場只完成一個 intro」冒充全部開發完畢。後續尚未批准的劇情不得標成完成。

**現況核查**：
- `MatchingSessions` 已有真雙方接受、`game_rounds`、`game_round_participants`、`GET /game-rounds`、`GET /game-rounds/{roundId}`；`frontend/client/src/MatchingScreen.tsx` 的 `GameRoundScreen` 仍是房間占位畫面。
- `cloudflare/src/index.ts` 的現有 `ApiContainer extends Container`、`getContainer(env.API,'api-v1')` 及 `sleepAfter='10m'`，`cloudflare/src/router.ts` 將 `/api/*` 全部送 Container，`wrangler.jsonc`／`wrangler.staging.jsonc` 只有 `API→ApiContainer` 的 DO binding、`max_instances=1`；無專用 WebSocket 連線層。`cloudflare/src/matching-commands.ts` 已有安全 `game.round.end`，產品端尚未接 API。
- `ProfileCatalog` 的正式興趣代碼目前有 `reading`、`coffee`、`puzzle` 等，但沒有獨立「貓咪」或「獨立書店」碼。正式映射必須使用實際 tag code（例如首發「雨聲書店」對應 `reading`），未來其他內容需要的標籤應先擴充目錄或設定合法 fallback，不得憑原型字詞臆造。
- `prototypes/prototype.v2` 的「夏樹」、固定自動回話及舊 40／75 門檻只可參考視覺，不得改造成對方真人訊息或正式計分。

**明確跨 SPEC 責任**：本份交付**可重用的劇情／互動引擎與首發故事內所需的實際互動實例**，但不在此宣稱已完成下一份 Affection 的好感度計分／問卷、OnlineGames 的完整 2 小遊戲＋3 任務、OfflineDating 的商家約會或 Confession；那些模組接續擴寫引擎。首發故事至少一個可完整執行的共用互動模組與一個支線，不能以缺後續 SPEC 為由做成空按鈕。
## 2. 業務語言、章節生命週期與互動規則

`StoryOffer`（第 1 場候選凍結於 `game_rounds`；未來第 2 場起候選以共用 `game_round_events` 凍結）、`StoryVote`（共用事件中的真人選擇）及 `StorySelectionResolution`（**每個 `episode_seq` 最多一個**勝出決議）是業務概念，**不新增專屬資料表**。`GameRound` 是 Aggregate Root 及有效權限來源；每個獨立劇本對應一筆 `StorySession`，以 `(round_id, episode_seq)` 分辨場次；`StoryNode` 是劇本內可恢復節點；`GameRoundEvent` 是該 Round 全域單調序號的真人聊天、按場次選劇情、互動與狀態事件；`InteractionInstance` 只屬於明確的 `story_session_id`。`StoryCatalog`／`InteractionDefinition` 是不可變、版本化的內容。**SD-RQ-01=B（2026-11-08）**：資料層預留同一 Round 多個獨立劇本的場次能力，但本期 App／Application **只允許 `episode_seq=1`**；不實作或顯示第二場入口。

1. **進場／授權**：每次讀寫驗有效 Session、當輪 active、兩個既定帳號 pair 及真正的 `game_active_round_claims`（實作前現名 `game_round_participants`）。Round ID、來源 Profile ID、曾互配或開啟的 WS 連線都不是單獨授權。不得傳 Email、精確生日、真人照、隱私欄位、個人分數、R2 私有 key。
2. **可玩劇情推薦數量（SD-Q4=B 已確認）**：在**受邀方接受配對、同一原子交易建立 Round** 時，依該時點雙方正式 Profile 興趣快照與已發布且可實際遊玩的故事目錄，排名後在 `game_rounds.story_offer_catalog_ids_json` 依順序鎖定 `N = MIN(3, availableStoryCount)` 個不同的 `content_story_catalog.catalog_id`，每一 ID 已唯一對應 `story_id + content_version`；**N=1 就直接開始，N=2 雙方二選一，N=3 雙方三選一**。沒有劇情（N=0）時不能建立沒有可玩內容的 Round，必須明確拒絕此次配對接受並保持既有資料完整。資料更新、登入先後、推薦目錄版本發布都不能改動本輪候選。推薦須以雙方為中心：**Round 的初始候選 JSON 永遠只代表第 1 場，未來後續場次不能覆寫它**。針對故事已發布的 `interest_tag_ids_json` 分別計算 `A_hits`、`B_hits`，以及 `shared_hits = |storyTags∩A_interestTags∩B_interestTags|`；按 `(shared_hits DESC, MIN(A_hits,B_hits) DESC, A_hits+B_hits DESC, recommendation_priority ASC, story_id ASC)` 做**可重現決定性排序**，取前三個不同的 `story_id`（同故事多版僅挑當前 published 版）。共同興趣不足時自動按雙方個別興趣的均衡涵蓋度補足，完全不命中才依預設優先序選通用劇情。對外推薦理由僅能取**雙方都允許揭露的共同標籤**，否則只回中性理由（例如「適合兩人輕鬆探索」）；不得藉理由／公開 score 間接洩漏私有興趣。所有候選均須為現有正式可玩內容；**不強迫湊滿三個，不使用假內容、不額外建立單故事例外模式、開關或未知的上線 Gate**。
3. **按候選數量決定 UI 與流程（SD-Q4 已確認）**：
   - **N=1**：接受配對時將唯一 `catalogId` 記入 Round 的**第 1 場**候選 JSON、原子建立 `episode_seq=1` 的一筆 `game_story_sessions` 並初始化節點；雙方進場直接玩，**不出現投票或選劇情頁面**、不產生虛構票。
   - **N=2**：兩人看到相同順序的兩張劇情卡，各自選一張，可在結算前改票；雙方都選完才結算。
   - **N=3**：兩人看到相同順序的三張最佳推薦劇情卡，各自選一張，可在結算前改票；雙方都選完才結算。
   - **N≥2 的共同規則**：每場相同採共同選擇，不同採 `match_invitations.initiator_account_id` 原始邀請方**在該 `episode_seq` 的最後有效選擇**；不是先進場、後提交或最高推薦者說了算。對方未提交前只顯示有無選擇，不揭露具體選項，不代替離線者投票、沒有超時自動決定。Round 保持 `active`，第 1 場 `experience.phase=pending_story_selection`，只能預覽候選／投票／查看狀態／確認退出；決議後該場不可再投票。本期只使用第 1 場，不提供新增後續場次的操作。
4. **第 1 場原子初始化**：`N=1` 時將建立 Round、寫入唯一候選、建立 `game_story_sessions(episode_seq=1)`、初始化 node／進度／必要 `story.selected` Round event 納入**原本接受邀請的同一個真 D1 原子 batch**；`N≥2` 則在 Round 候選 JSON 內鎖定 2 或 3 個 `catalogId`，以 `game_round_events(kind='story.vote.submitted', payload_json={episodeSeq:1,catalogId})` 追加雙方選擇／改票；第二票同一 D1 原子操作只讀**第 1 場**兩人各自最後有效事件，依原邀請方規則結算，建立唯一 `(round_id,episode_seq=1)` StorySession 並追加 `story.selected{episodeSeq:1,catalogId,storySessionId}` 系統事件。兩種路徑均沿用 `(round_id,actor_account_id,client_request_id)` 冪等鍵、`last_event_seq` CAS 與唯一約束。**一輪可依序存多筆 StorySession，但每一場只能結算一次；不得以舊場次選票決定新場次，也不建立 Offers 或 Votes 專用表。**
5. **真實雙人**：世界旁白、場景提示、NPC 僅可清楚標示系統／NPC 內容；**對方真人角色不能由系統自動代回**。訊息只由兩位真成員發送。玩家的選項屬自己的意圖，需顯示發送／提交結果。支線或互動可發系統事件，但不自動寫成另一位玩家說過話。
6. **章節節奏**：每個 Story 定義 `entry→beats→branch→interaction→rejoin→ending`；劇情引擎依該 `story_session_id` 的已提交事件決定當前 `node_id`。選項分「個人探索」「對方可見對話」「雙人合作」三類；每個 node 明定觸發、參與者、可用動作、完成條件、fallback 與下一個節點。**同一獨立故事內的章節／支線不產生另一個 `episode_seq`**。該故事 `completed` 後保留正常聊天、後續模組互動；不得自動 end Round。資料模型可在未來明確啟用的續玩流程中開始第 2 個獨立劇本；**本期不開啟該流程**。
7. **個人探索與雙人合作**：自己可獨立閱讀旁白／翻看物件／嘗試非阻塞小互動，讓另一位尚未回覆時也能遊玩；需要雙方提交的互動以 `pending_one/both_submitted/resolved` 狀態處理，僅顯示「等待另一方選擇」及可回遊戲，不強制對方即時在線。結算結果必須等待兩人真提交；若選擇不同，由該 InteractionDefinition 的確定性合流規則決定，不假造第二人的選擇。
8. **劇情與互動關聯**：StoryNode 只引用 `interaction_definition_id` 與版本，不複製互動流程程式。觸發規則採受控型別：`on_enter`、`on_choice_committed`、`on_both_submitted`、`on_interaction_completed`、`on_story_ended`；伺服器事件確認後才推進。不得將編輯者提供的任意 JS／SQL 當 runtime 腳本執行。
9. **跨劇情重用**：相同 `module_type`（雙人默契投票、物品調查、拼圖、共同選路、情境問答）可以在不同 StoryNode 實例化，各自套用不同文案、圖像、題目、難度及結算規則；模組程式只實作一次，所有實例透過 ID 與版本隔離。**跨劇情共用的是互動引擎／規則，不是同一輪執行的答題紀錄**；若需要歷史解鎖，用明示且授權的 Round 進度旗標，不複製訊息或推測對方資料。
10. **發訊**：純文字 trim 後 1～500 個 Unicode scalar、拒控制字元及 HTML 執行；每輪事件序號由 D1 原子遞增；同 `(round_id,actor_account_id,client_request_id)` 冪等，相同 ID 改 payload 必須 409。玩家選建議內容由已發布版次及 choiceId 讀取，不信任客戶端送的劇情文案。
11. **退出**：依使用者 `SD-Q2=B`，按「結束本輪互動」先開**明確確認**，說明原 pair 永久不得再配對；取消不影響 Round，確認後才調用既有 `game.round.end` 原子結束流程。D1 同批更新 ended／endedAt 並解除**恰好兩位** participants 占用，原 accountId pair 永久互斥，其餘玩家仍可新配。
12. **競態與所有後續操作**：`story.selection.vote/story.initialize/message.send/story.choice.submit/interaction.submit` 與未來名片／遊戲／問卷／約會／告白的每個 mutation，都必須在**同一個 D1 原子提交**中以當輪 active 和真參與者做 fail-closed guard，先成功的交易有效，後成功 end 之後的寫入拒絕。不能只由 WebSocket Presence、UI 或先 GET 斷言。
13. **離場語境**：「掰掰」「不想繼續」等只能在**本人**顯示「是否想結束？」，可繼續傳送、返回編輯、或進入正式結束確認；不自動退出、不向對方通報意圖、不以文字分類取代操作。
14. **結束後可見性**：依 `SD-Q3=A`，原雙方都不再取得聊天／互動歷史或新私人名片資料，僅可讀極小已結束狀態。本 SPEC 僅規範有效 Round 的持久事件與結束後權限；**資料移轉至 History／Housekeeping／保留天數由未來獨立 MVP 負責，本份不規劃、不建立、不執行**。永久 pair 排除的既有業務語意不變。
15. **低好感／冷卻**：`AC-012-01` 主動提醒由後續 Affection SPEC 定義；本份提供可重用的結束按鈕與有效 Round guard，不自設個人好感度分數或「逾時不回就扣分」。
## 3. 十種故事概念與一個完整首發垂直切片

下表十種是**後續故事企劃方向**，不是十個已完整可玩的章節；本階段只把 `scene-01 雨聲書店` 做到完整章節結尾、支線與重用互動。其餘九場保留概念與視覺方向，不製作假完成的內容檔。**當下有幾個真正已發布可玩的故事，就用其中最多三個作為候選；只有一個時直接玩，不可把尚未完成的其他九場假裝可選。**這些主題需要對映當前 `ProfileCatalog` 既有穩定代碼；首發確定使用 `reading`，其餘場景遇沒有正式 tag 時不得自造新碼，應回到共用目錄規劃。

| ID／故事 | {形容詞}{時間} | 地點 | 事件／適用共同興趣 |
|---|---|---|---|
| `scene-01` 雨聲書店 | 細雨綿綿的傍晚 | 獨立書店 | 兩人同時注意到一本書裡的手寫推薦卡；閱讀／書店 |
| `scene-02` 午後手沖 | 陽光慵懶的午後 | 街角咖啡館 | 當日限定咖啡豆只剩最後一份介紹卡；咖啡／美食 |
| `scene-03` 倒數謎題 | 霓虹微亮的晚上 | 實境解謎館前廳 | 體驗前出現一張可共同推理的謎題卡；解謎／桌遊 |
| `scene-04` 手作印記 | 微風清爽的週末上午 | 手作工坊 | 工作桌出現一枚待兩人命名的印模；手作／文創 |
| `scene-05` 展場色票 | 橘光柔和的黃昏 | 藝文展覽館 | 同一幅作品從兩側有不同觀賞角度；展覽／藝術 |
| `scene-06` 黑膠選曲 | 星光點點的夜晚 | 黑膠唱片店 | 試聽區響起一首沒標題的旋律；音樂 |
| `scene-07` 河岸晨跑 | 清風微涼的清晨 | 河濱步道 | 路線牌提供兩條風景各異的步道；運動／戶外 |
| `scene-08` 貓咪點名 | 雨後放晴的午後 | 貓咪主題咖啡館 | 店貓把玩具放在共同座位旁；寵物 |
| `scene-09` 底片留影 | 薄霧輕罩的下午 | 舊城街角 | 同一扇老窗顯出特別的光影；攝影／旅行 |
| `scene-10` 暖心市集 | 晴光透亮的週六上午 | 公益活動市集 | 志工邀請一起替物資箱設計標籤；公益／社群；也是無交集時通用候補 |

三選項實際建議文字（皆以「我」發送，非系統扮演對方）：

| 場景 | 觀察型 | 溫暖型 | 幽默型 |
|---|---|---|---|
| 01 | 你也注意到那張藏在書裡的卡片了嗎？ | 我喜歡有人認真推薦一本書的感覺，你呢？ | 我們是不是都被同一本書選中了？ |
| 02 | 你會先看產地還是風味介紹？ | 咖啡香讓人想慢慢聊天。 | 最後一份豆單，要先開個評審會嗎？ |
| 03 | 你覺得卡上哪個符號最關鍵？ | 一起解題好像更有趣。 | 如果第一題就卡住，可以先怪出題人嗎？ |
| 04 | 這枚印模你會取什麼名字？ | 自己做的小東西很有紀念價值。 | 我的手作技能可能要靠你救援。 |
| 05 | 從這邊看好像顏色變了。 | 願意分享你最喜歡的作品嗎？ | 解讀不同是藝術家的陰謀嗎？ |
| 06 | 這首歌你覺得像哪個季節？ | 音樂很適合成為第一個聊天話題。 | 猜歌名大賽開始，猜錯有參加獎嗎？ |
| 07 | 你會選短程還是風景路線？ | 早晨戶外走走很舒服。 | 我可以邊跑邊聊，但不保證跑贏你。 |
| 08 | 那隻貓是不是把玩具送過來了？ | 跟動物相處總讓人放鬆。 | 牠是不是在主持我們的破冰活動？ |
| 09 | 你剛也看到那扇窗的光影嗎？ | 喜歡一起發現日常的小細節。 | 這張照片是復古還是我技術不好？ |
| 10 | 你會替物資箱取什麼名字？ | 一起做有意義的事真好。 | 我想名字，你阻止我取太奇怪的。 |

`contracts/story-scenes.json` 作為單一版本化內容來源，保留 sceneId、對應 tag codes、time、place、event、choiceId／label／text。被使用的版本不能改寫舊輪台詞語意。Web／Android 同一套 React Native ADV 元件，依 `prototype.v2` 粉玫瑰、深紫、半透明面板、3:4 原始立繪素材與逐句敘事風格；每場有專屬場景視覺或明確設計替代，不將十場偷換成一個固定背景、一組文案。

### 3.1 第一人稱 2.5D 場景與角色融入（Q-UX1=A，2026-11-12 已確認）

**確認的產品體驗**：現在 `ADVStage.tsx` 以兩張 3:4 人物卡並排、`StoryExperienceScreen.tsx` 以場景／聊天室兩欄顯示，這不是目標。**玩家是故事當下的第一人稱主角；主要舞台中只看見對方的已採用化身，而不是把雙方人物卡放在背景上**。首場用 **2.5D 固定主觀鏡位＋多層畫面合成＋少量有劇情意義的近景／遠景切換**；不製作自由走動、360° 轉頭或完整即時 3D 地圖。

1. **雙方 POV 分別渲染**：A 用自己的鏡頭看 B、B 用自己的鏡頭看 A；必須用本輪有效參與者與對方當前授權可見的已採用全身 master 化身。背景與人物位置可依本機 POV 分別布局，真 `StorySession`、聊天、協作與 End 仍共用 D1／WS 權威；畫面物件座標不是另一端需要提交的業務事件。正常場景不顯示自己正面立繪；本人選角／名片等畫面可用同一全身 master 的合適近景裁切，但不得重新產出或扭曲角色。
2. **2.5D 舞台的合成次序**：場景底圖 → 空間深度／環境動態 → 對方人物遮罩／立繪 → 書桌／座椅／書架等前景遮擋與陰影 → 可互動熱區 → ADV／真人對話 HUD。人物需有一致的視線高度、遮擋、色溫與比例，不可用未去背的完整 3:4 圖片直接漂浮在底圖上；各層需有合法來源與版本。人物臉部及互動物件不得被 HUD 遮住。
3. **正式資產升級為 3:4 全身 master（UX-RQ-04=FULL-BODY）**：既有免費／AI 素材現況是半身至腰部，**僅是待升級的原始輸入，不再是本期正式遊戲資產目標**。本期由同一 full-body master asset 加上固定五表情支援**自然站立、全身遠景、半身中景與臉部近景**，透過鏡頭裁切／定位／遮擋／光色合成而非為每個鏡位重生人物；全身含頭頂、軀幹、雙腿、手與腳且比例自然。**免費16款只能在現有圖片下方做外延補畫／延展，不可重畫或重設既有上半身、五官、服裝、髮型、畫風及角色氣質，原圖永久保留供逐角色比對**；AI 候選則從最初就產生全身 3:4 圖，在 B1 採用前備齊同一全身角色的五表情。首場桌邊可以用全身 master 的中近景裁切／前景遮擋，**不能把只有站姿的圖片宣稱能自然坐姿**；站立／視距切換納入本期，坐下、轉身、走路、蹲下、手持物件等不同骨架姿勢或連續動畫需另立 pose set 規格，不能虛稱由裁切即可完成。詳 §3.8。
4. **雙規格布局與視角安全**：Android 直向手機及 Web 桌面寬螢幕應共用演出語意，但採不同取景安全區、角色 anchor／scale、敘事框占比及互動熱區換算；換尺寸、鍵盤開啟、聊天抽屜展開後要保持人物與關鍵物件可見。主場景不以整頁長捲動畫面拆散敘事節奏；劇情鏡頭可由玩家控制「繼續／略過」，不能因動畫播放而永久阻擋選擇。
5. **真人及 NPC 分層**：畫面中對方角色是對方已選的遊戲化身；店員 NPC、旁白與環境物件另外標示，不能拿固定範例人物充當真人，也不在場景圖中烙印某一位玩家的臉。

### 3.2 預製表情套組與劇情表演（Q-UX2=A，2026-11-12 已確認）

1. **統一版本化五表情標準（全角色、全故事、每次生成皆同一定義）**：只允許 `neutral` 平靜（自然眉眼、閉合放鬆嘴部）、`smile` 微笑（嘴角上揚、眉眼放鬆）、`surprised` 驚訝（眼睛睜大、眉上揚、微張嘴）、`thoughtful` 思索（視線略偏、眉輕收、嘴自然閉合）、`concerned` 擔憂（眉微蹙、嘴略抿、非哭泣）。固定 `expressionSpecVersion`、Prompt 模板、輸出順序、構圖與角色一致性驗證；不得每次、每人臨時自行改表情語意、加第六種或讓生成器任意命名。只允許眉眼與嘴等對應表情改變，髮型、五官比例、髮色、服裝、年齡、插畫畫風與 3:4 視角不隨表情改變；姿勢／目光／轉場由劇情另外指定，不能拿變姿勢冒充表情。劇本依固定 ID 指定，切換、略過、恢復必可預期。
2. **免費內建角色（16 款不可重畫）**：原有 `male-01～08`、`female-01～08` 的角色 ID、原圖與既有上半身美術皆視為定稿：以原圖為鎖定圖層，只**向下補出完整腿／鞋／站姿**，不得重繪原有臉部、髮型、上衣、色彩、筆觸及角色氣質，亦不得以另一張「很像」的重生角色替代；同一個全身 master 產出固定五表情，至少 **16 × 5 = 80 個角色×表情組合**。表情衍生時僅允許指定臉部表情區改動，上半身其餘畫面與完整衣裝／下半身皆一致；需人工逐一比對原版與新圖，先核對中近景保真再驗站立全身，靜態目錄版本化／可快取、玩家選角不呼叫 AI。
3. **AI 全身候選轉正式採用＝UX-RQ-01=B1＋UX-RQ-04**：原本最多四張候選仍依次只產一張，但**每張候選自首次 Gemini 生成即為頭到腳完整、3:4 直式的全身站姿 master**，維持既定真人相似度、插畫風格及基本外觀辨識（不先生成半身、採用時再多花一次全身擴圖）。按「採用這張」後先不改 `selected_avatar_ref`，以這張唯一全身候選為身份來源，前景循序製作／驗證相同全身站姿與服裝的固定五表情；原圖若符合 `neutral` 可直接重用。**完整全身 master、五表情、透明度／壓縮及身份檢查全部合格，才提交一次正式採用**；自己與對方此前沿用舊化身。**開發中舊半身 AI 化身不做升級／轉檔／沿用**；依 `UX-AUDIT-RQ-01=CLEAN-RESET`，新版實作完成後、正式全新體驗驗證前清除已確認非正式環境的舊角色測試資料，再從零建立全身 AI 候選與五表情套組。詳 §3.6、§3.8～3.9。
4. **品質失敗與執行期顯示必須分開**：採用前任何表情產製、壓縮、身份檢查或保存失敗，**整組不得正式採用**，舊化身不變；只允許玩家明確重試尚未成功的表情，不自動重產已成功者。只有在已正式採用後的暫時網路／下載故障，遊戲內才可使用**同一角色、同一版本的 `neutral`** 顯示降級，不因此觸發 Gemini，亦不得把降級視為 Gate B 五表情完整通過。
5. **劇情表演不等於真人反應**：有表情的是**劇情預先編排的虛擬化身演出**，不得把真人自由打字推斷成當下真實情緒、替真人說台詞、播放對方語音或替他同意互動。現有 `scene-01` 的 `speaker` 只有旁白／店員 NPC，並無對方真人劇本台詞；可安排非語言的背景神情演出，但**NPC 說話不觸發真人化身對口型**。真人對話的內容與狀態只由實際事件顯示，表演不暗示已讀／在線／已同意。
6. **輕量動效**：眨眼、呼吸與輕微視線移動僅是表演補充；速度、可見度與音訊同步應節制。暫停切到背景、裝置性能不足或開啟重要互動／確認視窗時，非必要微動效可停用，但劇情選擇與真聊天不受影響。

### 3.3 資料驅動演出與安全邊界（確認原則；具體 Schema 實作待 SDD 補齊）

- **責任切割**：`content_story_catalog`／不可變 Story manifest 定義「在某節點如何演出」，內建化身的表情套組由**角色資產目錄**管理；個人 AI 化身的套組由**本人選定的候選圖片**在 B1 前景採用作業中產製、驗證後與選中圖一起正式發佈，屬受授權保護的個人資產，不加入公用場景 R2／公開 CDN。故事資料只引用標準 `expression` ID，不為每個玩家重發一份 JSON、不建立 per-player 畫面坐標事件。
- **建議演出契約**：`scenePresentation`（`layers`、`cameraPresets`、`safeAreas`、`stageSlots`）、`nodes[].presentation`（`cameraPresetId`、場景層可見性、物件／熱區）、`nodes[].lines[].performance`（`targetRole`、`expression`、`pose`、`transition`）、`interactionRefs[].visualFeedback`（結果演出）、`audioCues`（原創音效）。本段是**設計欄位建議**，不冒稱目前 `contracts/story-scenes.json`、`story.ts` 或 API 已有這些欄位；下一輪規格收斂才定正式 JSON Schema、值域、範例和兼容策略。
- **表演目標與發話人必須分開**：`targetRole` 僅能對應經核准的場景角色（如 `partner_avatar`、`npc`、`environment`），`speaker` 原有旁白／NPC 語意不因人物動作而改成真人話語；真真人訊息不從 Story manifest 製造。若需 NPC 出現，使用獨立 NPC 美術，不挪用玩家 persona。
- **播放狀態和恢復**：D1 權威仍是節點／版本／revision，逐句播放索引及畫面鏡頭是**各裝置的本地演出狀態**，不新增 D1 表或將逐幀動作寫進 Round Event；重新登入時先依伺服器現有節點復原合法的入場鏡位／表情，再從安全的句首或本地有效播放位置重播，不偽造「雙方正好看到同一幀」。任何選擇／合作結果仍須提交原本 D1 guard；斷線可能顯示本地演出，但不得顯示未確定的對方操作結果。
- **影像授權與撤銷**：只有有效同一 Round 的兩名成員可讀取對方的**已正式採用**化身及表情；尚未 B1 完成的候選和部分表情只允許本人前景採用流程讀取，不可提早推給對方。禁止導出私人 R2 key、原始真人照片或未採用候選。Ended／憑證撤銷後停止後續取得、清理私人畫面投影。公用場景資產與私人衍生表情嚴格分離；延用現有私人 R2／Profile 安全語意，具體 DTO／權限需隨實作契約驗證，但**不為表情加入新的遊戲 D1 表或變更 Round 權威**。
- **素材發佈與載入**：採用 **§3.7 私人 R2 表情套組 Manifest** 作為完整性權威：固定 `avatarAssetId + expressionSpecVersion` 唯一套組、來源圖雜湊、五種固定表情的各別 R2 key／SHA-256／MIME／尺寸／檔案大小／透明資訊及套組 `ready`；只有後端通過完整檢查的 `ready` 才可正式選用。**R2 圖片存在≠產製成功；Profile 的 selected-avatar 狀態≠五表情完成**。已完成套組持久保存、不因遊戲切角色／回選舊角色／重登重新產圖；只有首次沒有可用套組，才在 B1 明確前景流程補製。首屏預載必要背景／對方 neutral／必要 HUD，其他表情按需預載；角色／表情 hash 變更才失效快取，禁止每句劇情重下載。
- **擴充性與限制**：首發場景完整 2.5D 表演先在 Web／Android 人工驗收，後續九場共用同引擎與資料型別，不是逐場手寫 React 畫面；不開啟第二場 API，亦不把 History／Housekeeping 納入本階段。

### 3.4 UX-P1～P5 全部納入首場必要體驗（Q-UX3=B，2026-11-12 已確認）

| 已確認需求 | 首場 `scene-01` 實際要做到的體驗 | 不能退讓的驗收界線 |
|---|---|---|
| **UX-P1 場景內聊天** | ADV 旁白／劇情句在場景下緣，真人聊天紀錄以可展開／收合的抽屜（桌面可為側欄）顯示；手機平常以角色／場景為主，輸入時不遮臉，訊息可返回查看 | 真人發送中／已送出／結果不明、對方真正訊息、輸入框、歷史分頁、即時連線與「結束本輪」必可使用；切換聊天不重置當前劇情節點 |
| **UX-P2 即景物件探索** | 以書籤／書架／桌面對應的場景熱區點擊，進入特寫、結果與返回；原 `inspect-object`／`cooperative-choice` 邏輯仍共用 | 直向／桌面熱區位置正確、不誤觸人物、遮擋物件仍有清楚可見操作入口；未按送出不得擅自提交 |
| **UX-P3 運鏡與光色敘事** | 入店雨景、桌邊靠近、書籤特寫、支線便條、雙結局有可感知的鏡位／光色／轉場差異，而非同一張背景搭不同文字 | 演出可略過，斷線／切頁不破壞 node；不可因運鏡丟掉選項、被裁切人臉或產生劇烈晃動 |
| **UX-P4 環境視聽** | 雨聲、店內氛圍、翻書／轉場音效、可操作的音量／靜音控制與節制環境微動態，等待時場景仍活著 | Web／Android 遵守音訊需本人啟動等平台限制；靜音／載入失敗可正常遊玩；不以聲音或動畫假裝真人在線、已讀或回覆 |
| **UX-P5 雙人互動回饋** | 書籤探索、選書協作與同選／異選兩個結局有不同的真提交結果動畫；等待對方時可回場景／自由聊天，對方真正完成後才切結果 | 送出中、提交成功、結果不明、待對方與已結算可辨別；不得自動替另一人選、不得將本地動畫視為 server commit |

### 3.5 深入設計缺漏稽核（2026-11-12，先留在本 SPEC 供討論）

| 缺漏 ID／風險 | 目前依據／實際影響 | 本輪規劃緩解及決策狀態 |
|---|---|---|
| `UX-GAP-01` 高：全身資產升級／免費角色保真 | 既有16款免費圖及 AI 圖仍是半身；直接重生全身容易改掉已獲使用者肯定的免費角色上半身、人物比例與表情一致性；3:4 全身 1K 也可能使臉太小 | **已確認 UX-RQ-04**：免費角色保留原圖及hash，依使用者後續決策以ImageGen延伸、逐張視覺比對及逐批人工確認；保留角色身份／髮型／原衣裝／氣質與穩定ID，另驗全身比例／透明邊緣／多鏡位；AI 首張候選即為全身。站立與遠近景本期完成；走路、坐姿等需另 pose set，不假裝僅全身即可支持 |
| `UX-GAP-02` 高：AI 自訂化身表情量與隱私成本 | 五表情不是單張候選圖自動就有；B1 會增加前景等待、API 逾時、供應商費用及中途取消／關閉風險 | **已確認 UX-RQ-01=B1**：前景順序產製並驗證，五表情完整才正式採用；採用期間不切角色／不啟動背景工作，成功部分只重用、失敗可明確重試；舊角色保留直到最終提交；不得重送真人原照 |
| `UX-GAP-03` 高：真人化身的「演出」被當作真人意願 | `scene-01` 的語音文字主要是旁白及店員，真人訊息由另一條 WS 事件來 | **已列規則**：腳本演出只做非語言動作／神情，NPC 另有角色；真人說話／已讀／合作結果不可由動畫推定，需驗收兩位真人看法 |
| `UX-GAP-04` 中：正在遊玩時更換已選化身 | 若一方在其他頁換圖，遊戲端可能仍顯示舊臉；目前 `StoryExperienceScreen` 初始化取得對方 persona，尚無 avatar-update 專屬通知 | **已確認 UX-RQ-02 事件驅動**：正式採用後通知 active Round Room DO，對方透過現有 WS 收到輕量 avatar revision/hint，只在通知時必要地讀一次最新授權資料；**不要定時 DB 輪詢**；當前一句演出完成且新素材 ready 時換角，斷線重連／重新入場校正一次 |
| `UX-GAP-05` 中：鏡位與互動點跨尺寸漂移 | 現有是全頁 ScrollView＋按鈕，沒有舞台 anchor、熱區與軟鍵盤規則 | **已列規則**：桌面／直向各安全框、歸一化熱區、前景遮罩與底部聊天抽屜；需兩端真實尺寸和輸入法實測 |
| `UX-GAP-06` 中：表演進度與權威節點不同步 | 現有 `StoryNode.lines` 僅 speaker/text，打字機逐句由 client 計時、D1 只存節點 | **已列規則**：表情與本地逐句渲染同步，不把動畫 frame 當業務進度；斷線恢復回權威節點安全播放，避免顯示未確認結果 |
| `UX-GAP-07` 中：影像權限和資產更新 | 場景背景為公用故事資產，AI 化身仍是受控私人媒體；目前 `ImageCompressionService` 將 alpha 鋪白再輸出 JPEG，**無法直接提供人物去背透明圖** | **已確認共用壓縮方向／技術缺口**：同一 `IImageCompressionService` 接受 `targetBytes`，須擴充透明 WebP 或等價遮罩以滿足 2.5D；檢驗被授權角色的 alpha、版本與大小，不能假稱現有 JPEG 可保透明；需要新 DTO／授權投影時只在相應界面增補，不建公開化身目錄 |
| `UX-GAP-08` 中：聲畫成本／退化行為 | 多層高清背景＋80組免費表情＋AI 衍生圖＋音效可能使 Web／Android 首屏和記憶體負擔激增 | **已列驗證方向**：可量測首屏可互動耗時、關鍵演出切換與實機峰值記憶體；按需載入／回收、素材壓縮、無音效與低資源 fallback；尚無性能數據，不虛構閾值 |

### 3.6 UX-RQ-01=B1、UX-RQ-02 追加確認（2026-11-12）

**UX-RQ-01=B1 — 固定表情、前景阻擋、完整後才採用（使用者已確認）**

1. **前景同步流程，而非背景工作**：選中的候選圖仍用原四選一 UI。玩家按「採用這張」後進入**同一個前景阻擋流程**；可依固定表情 ID 順序發出最多四個（必要時含 neutral 校正）逐張、逐次 await 的 HTTP 請求，每次完成即將結果存入**本人私人暫存**，不建立背景佇列、排程、離開頁面仍自動執行的 Job，也不以多請求並發增加負載。前景循序呼叫是一般非同步 I/O，不是背景作業；若單一請求合併四張導致 HTTP 逾時，應採四次依序確認而非偽稱一個長請求可可靠完成。
2. **操作阻擋必須前後端一致**：進入產製後不得選其他候選、切免費角色／已保存角色、重新開始生成、點第二次採用或重複提交；遮罩保留「正在製作第幾種固定表情」及明確失敗處置。**僅關閉前端按鈕不足以防多分頁／不同裝置**：伺服器須以前景採用的穩定候選 ID、clientRequestId、lease／CAS 與 profile revision 防止平行角色異動及晚到回覆覆蓋。作業持有期間其他角色切換請求明確拒絕／提示，不讓用戶悄悄切到另一人又被舊產圖覆寫。App 強制關閉或網路中斷不能阻止；不得讓後端背景續產，僅在本人重新進入前景流程時查一次作業狀態，再選擇繼續／重試／取消，不輪詢。
3. **全部成功才一次性正式採用**：維持目前舊的 `selected_avatar_type/ref` 和另一玩家看到的角色，直到同一候選 `neutral/smile/surprised/thoughtful/concerned` 五種全數成功、壓縮／人物一致性／合法授權均通過。先以 R2 CAS **安全提交完成狀態 `ready`**，之後才用現有 D1 Profile 採用的**單一原子條件交易**正式切換角色；**R2 + D1 並非單一跨服務交易**，必須以固定 requestId／assetId 查回並處理提交結果不明、R2 已 ready 但 D1 尚未選用、D1 版本衝突等情況，不能聲稱跨系統原子發布。任何一張失敗、期限過期、取消、逾時或最終提交不明，都不得部分切換；可保留已驗證 R2 ready 包供本人後續相同選用，但不可因此把未選化身投影到其他玩家。受控私人暫存沿用原候選短效儲存語意；不引入聊天 History／Housekeeping。
4. **切換／重登不會重產**：已成功的單張表情在 B1 暫存階段以穩定候選／預留正式 asset ID、`expressionSpecVersion`、固定表情 ID 記錄以供同輪明確重試；整套通過才轉成**持久、不可變**的正式 R2 表情套組 Manifest（§3.7），與正式 `avatarAssetId` 一對一關聯。改選免費、改選其他已保存 AI 角色、切回原角色、劇情進入不同節點、重新登入、WS 斷線恢復，都只**查詢已存在的 ready Manifest／授權讀取素材**，絕不因切換呼叫 Gemini。**舊半身角色不補製、不轉換**：開發完成後依 §3.9 在可確認的非正式環境受控清除舊角色資料；新驗收必須從第一次全身候選建立新的完整套組。正常驗收建立的全身角色缺少套組時，一律 fail-closed，不可從進場／切角偷偷觸發生成。角色基底確實更換時視為新 asset ID，正常新採用流程與舊包分離；同一 asset ID／版本的重新選用絕不重產。
5. **固定五表情品質與容量**：共用 §3.2 的五個版本化 ID／標準定義及**同一 3:4 全身站姿 master 的角色身形、臉部、衣裝與鞋子**；`neutral` 必須符合規範，不能將原本明顯笑臉硬稱 `neutral`。沿用目前 `IImageCompressionService.CompressAsync(input,targetBytes,...)`／SkiaSharp 共用底層：**表情衍生圖每張先以 200,000 bytes 作為測試目標**（非盲目硬壓、不變更既有 200KB 真人照片政策）；產製後逐張檢驗 MIME、尺寸、SHA、人物面貌、站姿及 2.5D 去背品質。因 1K 3:4 全身可能使臉部細節不足，**正式畫質與裁切保真優先，若 200KB／1K 達不到標準，必須實測更高解析度／調整參數後回報，不得犧牲角色品質或假稱驗收成功**。**目前既有 AI 候選圖目標是 2,000,000 bytes、共用壓縮會將 alpha 鋪白成 JPEG**；全身 2.5D 圖需在相同壓縮抽象擴充保透明 WebP／遮罩，不另建重複壓縮服務。
6. **B1 時間／失敗邊界**：現有 Gemini 每張請求最多 90 秒、目前候選 60 分鐘有效期，四張依序可能造成長前景等待；不保證總耗時，必須用真 Gemini 和 Web／Android 的 HTTP／頁面生命週期及 R2 逾期檢驗。失敗只能明確重試未成功表情／取消作業，不另跑成功項目；過期或權威狀態不明一律 fail-closed。沒有 B1 真實前景可完成及取消／恢復的證據，不能標 Gate B 通過。

**UX-RQ-02 — 正式採用後一次通知、在安全演出點更新（使用者已確認）**

- **不輪詢資料庫**：目前 `RealtimeRoomClient.ts`／`room-socket.ts` 已有標準 WS 和 Room DO 通知，但 `StoryExperienceScreen.tsx` 初始化後未針對對方已選化身變更更新 persona，且現有 Room DO 通知只涵蓋故事進度／終止，**不存在已實作的 `avatar.updated`**。設計要求在免費／AI 正式化身採用事務提交成功後，沿用 Application 通知出口／房間 DO，向活躍雙人房間推送**輕量角色變更提示**（帳號／avatar revision 或版本；不含私人照片、R2 key 或整張圖）。需以本人及對方 Round 成員權限過濾，不能從未確認的採用發通知。通知失敗不回滾已採用的 Profile，只在重連時做權威補漏。
- **接收只按需讀取**：B 收到提示才必要地取得**一次**目前授權的 persona／表情資產 metadata，若 revision 不比本地新則忽略；預載新五表情，畫面等**正在播放的這一句台詞結束／回可操作安全點**才原子切換角色與同版表情，**不必等 StoryNode 全部結束**。若同一來源通知重複、角色 hash 未變、仍在讀取中，合併去重，不多次 DB 查詢；任何新事件以最新版本為準。重新進場／背景切前景／WS 斷線重連時校正一次，不定時拉取、不每句台詞／每幀 DB read、不由畫面頻繁 rerender 觸發同步。
- **選角不同步情境**：A 正式採用前 B 不會看到新角色；B 當下沒有遊戲房間或已結束 Round，不需推送；若通知送達時演出未完，舊角色短暫保持完整，同一幀不混兩套表情。通知／資產取得失敗時維持舊角色並在下一次明確重連／重新入場校正；如私有授權已撤銷則立即停止使用受保護圖像。

### 3.7 私人 R2 表情套組 Manifest：唯一完成判斷（2026-11-12 使用者新增確認）

**決策**：不採用「查看 R2 是否有五張圖片」作為單獨判斷，也**不把 `user_media_assets.status='ready'` 當作表情完成證明**；新增**私人 R2 正式套組 Manifest**，以 `avatarAssetId + expressionSpecVersion + avatarAssetSpecVersion` 作為邏輯唯一鍵，`ready` 僅由後端在**全身 master 合格且固定五表情**都儲存、驗證後寫入。此 Manifest **與目前 `cloudflare/src/avatar-attempts.ts` 的短效四候選產圖 manifest 不同**：候選 manifest 記錄 `attemptId`、已產生幾張候選、60 分鐘效期；**表情 Manifest 是正式採用後必須永久保留的角色資產索引**，不能沿用候選 60 分鐘清理規則，也不能在角色切換時重建。

| 欄位／概念 | R2 私人表情 Manifest 定義 | 目的／限制 |
|---|---|---|
| `avatarAssetId`、`ownerAccountId`（後端 derivation，不接受用戶任填 R2 key） | 正式生成化身唯一 ID；在 B1 採用作業開始時固定／保留，並與 D1 `user_media_assets.asset_id` 對應；每位 owner 的私人命名空間隔離 | 絕不把兩位玩家的同名角色或不同次候選合併 |
| `expressionSpecVersion`、`avatarAssetSpecVersion` | 固定五表情規格與**全身 master 資產規格**各自版本化（如 `v1`、`full-body.v1`），與 Prompt／模型歷史分離；正式套組查找採 `avatarAssetId + expressionSpecVersion + avatarAssetSpecVersion` | 防止舊半身套組和新全身套組因 avatar ID 相同而撞版；角色切換不因模型更新而重產 |
| `sourceImageSha256`、`sourceAssetRef` | 原本選中**全身**候選的壓縮來源圖 hash／安全來源參照；本版新流程只允許首次生成的全身候選作身份來源；舊半身角色依 §3.9 清理，不設升級來源，不包含真人原始照片或 base64 | 防止 ID 指錯圖、選中的角色被換圖卻重用舊表情；與新全身 master 內容 hash 有可驗證關係 |
| `status` | `building`／`ready`（異常需明確隔離失效狀態）；正式 `ready` 版本不可變更其表情內容 | 只接受經完整驗證的 `ready` 套組；狀態不等於 Profile 的已選角色 |
| `masterAsset`、`framing`、`pose`、`stageAnchors` | 同一角色的**全身站姿 master** 參照／hash；`framing=full_body`、`pose=standing`，完整頭到腳輪廓、人物腳底／頭部及近景裁切安全座標；每個表情以同 master 身分衍生 | 讓固定鏡頭從同一張全身 master 安全推近／推遠；不能把 `framing=full_body` 當作已支援坐下、轉身或走路的證明 |
| `expressions` | **恰好五個** `neutral/smile/surprised/thoughtful/concerned`，每個都有伺服器推導的 private `objectKey`、`sha256`、`mimeType`、`width`、`height`、`byteSize`、透明／遮罩處理規格與一致的全身站姿資產參照 | 排除缺項、重複、半身冒充全身、不同人混圖、缺腳、壞遮罩、超出壓縮品質下限 |
| `generatorModel`、`promptVersion`、`verifiedAt` | 產圖與品質驗證來源資訊，不參與「是否要為同一角色重新生成」的日常判斷 | 換模型或 Prompt 不應讓舊角色切回時重產 |
| `manifestSchemaVersion`、`manifestSha256`／`etag` | Manifest 本身結構版本、內容雜湊或 R2 CAS 版本 | 支援權威驗證、並行排他與安全讀取／相容處理 |

**唯一決策流程（進場／切角零 Gemini）**：

1. **切回已保存角色**：從 D1 取得本人可選的正式 `avatarAssetId`，後端按 owner／ID／`expressionSpecVersion`／`avatarAssetSpecVersion` 只讀查詢 R2 Manifest。若同一版本為合法 `ready`，直接使用其五個既有表情，不逐張呼叫 `HEAD` 檢查每個 R2 物件，不呼叫 Gemini，不重新壓縮，也不因登入／劇情節點變化刷新已發布包。只有實際圖像讀取失敗才校驗對應 hash／key，報素材損毀並隔離／修復，**不能自動重產**。
2. **`building`／未完成**：只允許本人在明確 B1 前景操作中，以該穩定 ID 和相同 spec version 的候選暫存紀錄續做**尚未成功的表情**；每張完成由 server 驗 SHA／大小／透明度／人物一致性，更新暫存進度。關閉／超時保留已確認的同次進度直到原候選授權到期，**不在背景繼續產圖**；同一套組禁止多分頁並行生成，使用 R2 lease／ETag CAS／穩定 clientRequestId。
3. **首次成功**：恰好五種表情具備有效且已實際驗證的物件後，以 CAS 一次將該版套組宣告 `ready`；正式採用由 D1 條件式交易檢驗**本人、候選效期、Profile revision、ready Manifest／版本／來源身份**，只更新既有 `user_media_assets` 和 `user_profiles` 原有流程。R2 ready 只代表「素材完整」，不是已採用；Profile `selected_avatar_ref` 才是誰在用此角色的權威。
4. **版本變更／損毀**：固定五表情的 `v1` 角色**永遠不因未來 `v2` 或模型更換而自動重產**；要新版本須有另行明確規格及人工授權處置。若 Manifest ready 而圖片遺失／hash 不匹配，判為不可用素材並提出修復，不把單純切換變成 AI 生圖入口。回選／切換、載入、重連的流程**不得包含 `IAvatarImageGenerator.GenerateAsync`**。
5. **隱私、清理與落地**：候選圖、building 進度沿用短效私人 R2；正式 ready Manifest 和五表情按角色 ID 長期保留、可供再次切回，需防止現有候選清理誤刪。僅本人／活躍 Round 授權對象可取得合法素材投影；無法直接提供 R2 私有 key。以現有私人 R2 空間的 CAS／不可變保存設計，**本次明確不新增 D1 表、不改 D1 任何欄位、也不新增 SQL Trigger**；需要擴充既有 API／R2 object schema 與選用條件時，留給後續 BDD／TDD／Well-Done 實作。

**資料表影響與原 Story SPEC 異動分界**：

| 比較範圍 | D1 表結果 |
|---|---|
| **本次新增的表情 Manifest 完成判斷** | **新增 0 張；修改 0 張；刪除 0 張**。不建立 `user_avatar_expression_packs`／`user_avatar_expression_images` 等表；`user_profiles`、`user_media_assets` 欄位不變 |
| **先前 StoryDialogueAndExit 的 `0005` 劇情設計／migration** | **新增 4 張**：`content_story_catalog`、`game_story_sessions`、`game_round_events`、`game_interaction_instances`；**調整 2 張**：`game_rounds` 由 7→9 欄、`game_round_participants` 更名 `game_active_round_claims`（四欄不變）。這些**不是本次 Manifest 決策新增** |
| **角色／媒體既有資料** | `user_profiles.selected_avatar_type/ref` 繼續表示實際選用化身，`user_media_assets` 繼續保管正式生成化身；只在業務流程讀取 R2 ready Manifest 作正式採用／回選先決條件，**不新增 expression 欄位或 D1 Job 表** |

**新增驗收邊界**：全身 master 若缺頭、缺腳、斷肢、身形比例不自然、`framing`／遮罩錯誤即不能 `ready`；五種表情缺一張亦不能 `ready`；不同 avatar ID／source hash／expression version／full-body asset version 不能誤用；已 ready 後多次改選／重登／重連 Gemini 呼叫必為 0；第二裝置改選及失敗重試受控；最終提交重試不重產，R2 Manifest 缺失／破損必 fail-closed，不能以檔名存在當作完整成功。免費16款延伸後另需原圖逐款視覺比對與使用者確認，原圖／hash與ID保留；後續使用者明確選擇直接AI產生比對，不加入像素鎖回合成或逐像素相等門檻。以上為設計驗收，**尚未寫 BDD／TDD 測試或實作**。

### 3.8 UX-RQ-04=FULL-BODY：免費16款保真延伸／AI 全身正式 master（2026-11-12 已確認）

**產品定義**：免費16款與 AI 正式遊戲化身皆使用**頭到腳完整 3:4 全身站姿 master asset**，在同一角色身份下擴充固定五表情；人物可用於站立場景、全身遠景、半身中景與臉部近景。2.5D 引擎只做鏡頭裁切／縮放／前景遮擋／光照，不依每個鏡頭額外呼叫生成器、不建立固定每場一張替代角色。原來的半身限制**被本決策取代**，不再是目標規格。

**免費角色禁止重畫**：既有實際 `frontend/client/assets/avatars/{male|female}-01..08.jpg` 的 **16 張原始圖片與 `builtinAvatarId` 都必須原封保留**。以這些原圖為鎖定的美術來源，僅向下 outpaint／接續補繪既有服裝的下半身、腿、鞋及自然站姿；不以「重畫成看起來相近的人」替代，不重設原人物臉型、五官、髮色、髮型、表情基調、上衣輪廓、顏色、筆觸與氣質。允許為把原有半身置入同一 3:4 全身畫框所需的**等比例縮放／位置調整**，但不得非等比例拉伸、任意修臉或改動已存在的上半身原畫內容；接縫處只允許無損銜接。保留原圖與鎖定上半身遮罩／對齊參數作機械式區域比對，另由人工對每款同畫幅對照驗證「頭肩胸腹上衣保真、比例合理、補的腿鞋符合原設計」，不通過就重做**外延部分**而不是重畫免費角色。五表情只變受控表情區，其餘全身身形與上衣／下衣一致。16 款素材採版控公用靜態角色目錄，玩家選角色時不即時 AI 生圖。

**AI 化身不再先做半身**：修改既有 Gemini 生成目標（目前 prompt 與 1K 3:4 均明確以半身為設計）為首次**逐張候選就產出 3:4 全身站姿**，保留玩家本人可辨認的五官與原有插畫風；選中的這張圖就是 B1 的 identity/full-body master 參考，不應採用時再重複擴畫全身。前景 B1 依標準表情完成五表情、驗明同一髮型／服裝／身高比例與站姿後，才將全身套組 ready 並正式採用。**已確認尚未上線，舊半身 AI 角色資料全部為待汰換測資，無需保留舊 ID／舊臉做轉換，不新增舊角色延伸入口或相容層**；等新全身功能開發完成，依 §3.9 清除非正式環境舊角色資料後使用新全身流程從零驗收。真人照片仍依原授權保存／使用政策，清舊角色不代表清除本人照片或帳號。

**成像品質與動作邊界**：原 3:4 半身與新 3:4 全身不能在相同像素下同時維持同樣臉部解析度；實作須真實驗證 Web／Android 遠中近鏡、背景去背、色溫、鞋底落地位置、容器遮擋、縮放邊緣、眼神五官是否可辨、壓縮後差異。**不能先限定 1K／200KB 再因品質差而假通過**；如需較高解析度或保透明 WebP，應使用現有可參數化共用壓縮抽象提出調整／驗證成本，不偷改真人照片壓縮政策。全身 master **只代表一組自然站立姿勢**，不包含真正坐姿、走路、蹲下、轉身、拿物品、手腳連續動畫；新增不同骨架 pose 必須另有明確 pose asset／來源／版本／驗收，首場桌邊可用合理的站立遠中景或遮擋，不可拿站姿剪裁冒稱坐著。

**資料架構／相容性**：個人 AI 在 §3.7 私人 R2 Manifest 加 `avatarAssetSpecVersion=full-body.v1`、`framing=full_body`、`pose=standing`、`masterAsset`、來源 hash 與可安全裁切的 `stageAnchors`，表情與 master 同一版本並受同一 R2 ready 權威約束；**免費16款以版控靜態內容索引而非私人 R2／新增 D1 表**。後端以 master 狀態確認可否使用全身鏡位；現有故事 R2 manifest 以同一 `cameraPreset`／安全裁切參數控制鏡位，不能假設每張原圖已全身。保持目前 `user_profiles.selected_avatar_type/ref` 及 `user_media_assets` Schema；**本項新需求新增 0 張／修改 0 張 D1 表、無 Trigger**。本章已確認的選角用途調整會與既有 `SPEC-001-AvatarAndPreferences` 的 2026-11-01 `D-049` 半身決策衝突：**由本次 2026-11-12 全身決策取代該畫框要求，兩份 SDD 同步修訂，歷史原決策仍保留可追溯**。

**Gate B 必驗**：16 款免費**每一款**角色身份／髮型／原衣裝／氣質保留並逐款人工確認、原圖hash不變及下半身自然延伸、原始 ID 不變、五表情全身一致；AI 每個新候選頭到腳完整、五表情只改臉、B1 失敗不切角、切回已 ready 全身套組 Gemini 0 次；同一 master 於站立遠景、半身、中景近臉及 Web／Android 安全視窗切換均不露接縫／裁腳／糊臉；不能只測書店桌邊畫面就宣稱通用全身資產已完成。未通過不可宣稱新視覺需求 Gate B 完成，亦不可擅自將全身擴充解讀成走路／坐姿動畫已交付。

### 3.9 UX-AUDIT-RQ-01=CLEAN-RESET：開發完成後清除舊角色測資、全新驗收（2026-11-12 已確認）

**業務決策**：DatingHigh 尚未正式上線，使用者明確不要求保留、升級、遷移或相容現有半身 AI 角色。**完成新全身角色、五表情、B1、R2 Manifest 與遊戲 2.5D 實作後，在全新體驗 Gate A／Gate B 驗證開始前，以受控程序清除已核實非正式 DatingHigh 環境的舊角色相關測試資料**。**本輪 SDD／Perfect-plan 僅規劃清理，不能現在執行刪除**；也不得安排成自動背景排程。

**資料盤點（已核實現有 D1 migration 與 Worker 資產鍵慣例，執行時仍需重新比對部署版本）**：

| 範圍 | 開發完成後的清理處置 | 不可誤刪 |
|---|---|---|
| `user_profiles.selected_avatar_type`、`selected_avatar_ref` | 對已核准非正式測試環境的測試帳號，**同批設為 NULL**，並更新 `revision`／`updated_at`；保留 `user_profiles` 其他資料（暱稱、偏好、性別等） | 不刪 Profile／auth 帳號；不修改正式或不明環境 |
| `user_media_assets.kind='generated_avatar'` | 包括 `ready/pending/deleted` 的舊 AI 角色紀錄，在先以帳號＋`asset_id` 安全列舉 object key、確認無選角引用後刪除；避免殘留孤立角色引用。新增 full-body 驗收將建立新 `asset_id` | `kind='personal_photo'` 是本人照片與名片資料，**不屬於角色清除目標**，不能以 `DELETE FROM user_media_assets` 全刪 |
| 私人 R2 舊生成角色圖片 | 以 D1 `generated_avatar` 確認過的 owner + key `private/{accountId}/avatar/{assetId}` 清除舊圖；包含新表情方案實作前建立的舊版角色套組／Manifest 時，須使用相同 owner／asset/version 的**精確鍵清單**清理，不能 wildcard 清掉私有照片或新版本資產 | `private/{accountId}/photos/{assetId}` 真人照片、其他私人附件／跨帳號 R2 物件不能刪 |
| R2 舊候選與產圖暫存 | 清除相應測試帳號的 `private/{accountId}/avatar/temp/` 下候選 Manifest、候選圖、`active` pointer、失敗／未完成 B1 暫存，並終止相關有效作業；禁止清理與其他使用者相同候選字串的物件 | 不清除非 Avatar 的 R2 key、不碰現行免費角色來源檔 |
| 免費16款角色圖片／catalog | **保留既有16款已定稿原畫（鎖定上半身比對來源）與不變 `builtinAvatarId`**；產製好的全身版及五表情由版控素材管理，清理舊測資不應刪原圖或新正式全身版 | 不動 `frontend/client/assets/avatars/` 原美術檔與其他應用靜態資源 |
| 角色選用後的衍生／測試狀態 | 確認 Profile 選角被清空、舊生成圖／候選不再可存取；依既有 `profileReady` 規則重新計算資格，若因此影響目前 active Round／match eligibility，**先隔離或重建經核准的測試關聯狀態**，不可保留對不存在角色的可配對快照 | 不清除真身份資訊、登入 Session、與角色無關的個資、History／Housekeeping 或其他專案資料；現有配對測試資料若需重置，依既有非正式遊戲資料清理授權另列精確範圍 |

**執行安全 Gate／順序**：① 明確驗證 `environment`、DB ID、R2 bucket／namespace、全部目標帳號皆為非正式測試資料；未知或正式環境**直接拒絕**。② 確認新全身功能已可使用、沒有進行中的 B1 採用作業／live 遊戲會被中途破壞，建立精確 owner／asset／object-key 清單與計數及可回復證據。③ 由受控操作分批列舉、以 D1 交易更新選角 revision 並移除舊生成角色紀錄；R2 刪除為跨服務非原子操作，**必須記錄刪除成功／失敗、支援同一清單安全重試與中斷復原**，不可宣稱單一 D1 transaction 就清完 R2。④ 檢查 DB 及 R2 都無舊角色／候選殘留及無孤兒選角，再用兩位全新測試用戶**重新操作免費角色→上傳既有規範照片／產 AI 全身候選→ B1 五表情→完整首次採用／切角→ Web／Android 雙人場景**。⑤ 保留清理前後數量、具名環境、實際執行輸出與 Gate A／Gate B 重新驗證證據。沒有這些證據，不得標本決策已執行或 Gate B 已通過。

**影響與邊界**：本項是**在新功能完成後執行的一次性非正式角色測試資料重置**，與 `SD-RQ-02=A` 已確認的舊**遊戲 Round** 測資清除是**兩個不同受控批次**；不等於自動清除真人照片、全站帳號或正式業務資料；也不是聊天 History／Housekeeping 功能。只改角色測試資料內容，不需要 D1 Schema 新增／修改表、Trigger、舊半身遷移或永久相容 API。後續 Well-Done 必須提供預覽清單、可重試清理流程與真 DB／R2 證據。

**Gemini 模型與壓縮實際核對（設計資訊，尚未批准換模或動程式）**：

- `backend/src/DatingHigh.Infrastructure/Media/GeminiAvatarImageGenerator.cs` 目前 `GeminiOptions` **預設 `gemini-3.1-flash-image`**，`Program.cs` 由 `GEMINI_IMAGE_MODEL` 可覆寫，未確認部署環境是否另設 override；生圖請求 `imageSize=1K`、`aspectRatio=3:4`、`candidateCount=1`，單次 90 秒 deadline。程式 allowlist 只有 `gemini-3.1-flash-image`、`gemini-3-pro-image`、`gemini-2.5-flash-image`，**不能只改設定就使用 Lite**。
- 官方定價（USD／張 1K 輸出，輸入 Token／失敗重試另計）：`gemini-3.1-flash-image` **$0.067**；`gemini-3.1-flash-lite-image` **$0.0336**，Lite 官方定位更低成本／低延遲，但尚無本案實測秒數或同一臉四表情品質證據。表情四張僅輸出成本約 Flash **$0.268** vs Lite **$0.1344**；不等於成功率／實付成本同幅下降。建議**保留目前主化身 Flash，先隔離實測 Lite 製作四表情**，比較五官不漂移率、標準表情遵從度、1K／壓縮後人物可辨性、每張實際延遲與 retry 成本；未通過不可直接替換正式服務。
- Lite 對本案需確認 `3:4`／`1K` API 適配、允許模型清單、風格參考與已選候選圖提供順序、可靠遮罩與錯誤回退；不能把一般文字模型 `gemini-3.1-flash-lite` 誤作會輸出圖片的模型。

**SDD 本輪停止點**：`Q-UX1=A`／`Q-UX2=A`／`Q-UX3=B`、`UX-RQ-01=B1`／`UX-RQ-02=事件通知`、§3.7 `UX-RQ-03=R2-MANIFEST` 及**§3.8 `UX-RQ-04=FULL-BODY`** 均**已確認並回寫**。Lite 模型切換仍是待實測／決定的技術替代評估；200KB 表情衍生圖是待品質實測起始參數。**本次全身＋Manifest 方案 D1 0 新增／0 修改**；同步修訂 AvatarAndPreferences SDD 的衝突畫框前提，不進 BDD／TDD／RiskAudit、Story JSON 或程式實作。

## 4. 架構、Cloudflare WebSocket 與 D1 資料

### 4.1 已核查的 Worker／Container 邊界

- `cloudflare/src/index.ts` 使用 `getContainer(env.API,'api-v1')`、`ApiContainer extends Container`、`sleepAfter='10m'`；`router.ts` 目前對所有 `/api/*` 轉送 .NET；`wrangler.jsonc` 與 `wrangler.staging.jsonc` 均只有 `API/ApiContainer` DO binding、`max_instances=1`，且 `ASSETS.run_worker_first` 已含 `/api/*`。`API` 是 Container DO，**不能誤當已完成的聊天室 Hibernation DO**。
- Cloudflare 官方支援 WebSocket→Container，但是長連線可能使 Container 無法進入預期休眠；本 SPEC 建議**另外新增** `GAME_ROOMS→GameRoomSocket`（每個 `roundId` 一個獨立 DO instance），在**現有同一個 Worker** 中精確攔截 `GET /api/v1/game-rounds/{roundId}/ws` 的 Upgrade，與 Container API 路由分開。建立新 DO class 的 Wrangler migration 應追加新 tag／`new_sqlite_classes`，不可重寫既有 `v1 ApiContainer` migration；Container `max_instances=1` 不會限制 room DO 數，但仍是後端處理瓶頸，需另壓測。
- Room DO 使用 `ctx.acceptWebSocket(server)` 的 **WebSocket Hibernation API**、`webSocketMessage/Close/Error`；`serializeAttachment/deserializeAttachment` 只保存最少 connection metadata（帳號、family/session、Round、有效期限），不保存長期權杖、Profile 或聊天權威資料。不可使用常駐 `setInterval`／outbound 長連線妨礙 hibernation；短暫 presence／typing 屬非權威訊號。
- Web WebSocket 不能依賴任意自訂 Authorization header；Web／Android 先以已授權 REST `POST .../realtime-ticket` 取得**短時效、一次性、綁定 Session＋roundId＋裝置的握手憑證**，以安全 WebSocket subprotocol 或等價可驗證握手方式交換，不放長效 JWT／Refresh Token 在 URL、log 或持久儲存；Worker／DO 都檢查 Origin、Upgrade、有效憑證、實際 Round membership 與重播。ticket 使用獨立 HMAC secret、nonce 單次消費與過期清理，不沿用原始 Access Token 作長期 socket 身分。
- WS 開通不代表永久授權。Session 撤銷、新裝置登入踢舊家族、Round ended、token 到期／刷新都應觸發重驗／斷線重連；每個業務寫入需由 .NET Application＋真 D1 原子檢查 Session／Round，不能只信 DO 的 connection attachment。
- **訊息主流程**：client WebSocket command → Room DO 驗傳輸與 connection ticket → 經受保護**非公開內部服務橋接**呼叫現有 .NET Application 用例 → Worker 固定 D1 prepared SQL 原子提交 → 真 server receipt／eventSeq → DO 對兩端 WebSocket 推播。不可將 client 的 accountId／sender 欄位直接寫 D1，內部 bridge 必須驗服務來源、簽章及目前 session。正式 API 及既有 `IPlatformClient` 繼續是業務權威，DO 不另存第二本訊息帳。
- **中斷補償**：D1 commit 後 DO crash／推送失敗時，消息仍有效；前端依 `eventSeq`／snapshot cursor 用授權 HTTPS 唯讀增量 GET 補齊。WS 心跳／typing／presence 不能當送達或已讀證據；未知 submit 用同一 `clientRequestId` 讀回 receipt，不能自動重送建立另一操作。只在 server commit 後廣播，順序與去重由 D1 事件序號決定。
- `101 Switching Protocols` 要原樣回傳，不可由現有 `withCors` 以 `new Response(response.body...)` 包裝破壞 Upgrade；檢查 web／Android、local `ws://`、cloud `wss://` 的行為。需要加入 WS 路由、Env binding、Wrangler migration、受限握手與 DO 測試；不能只在前端改 `new WebSocket`。
- Cloudflare 官方依 Hibernation 可以在連線閒置時不繼續計 GB-s duration，但**傳入訊息／請求仍計費**；目前 Container 單 instance、D1 寫入／Worker 呼叫開銷、斷線高峰必須實測，不可因 DO 連線能休眠就宣稱零成本或高併發已通過。

### 4.1.1 SignalR／gRPC 適配結論（2026-11-07 技術評估）

| 選項 | 實際整合方式與限制 | 結論 |
|---|---|---|
| **ASP.NET Core SignalR** | 必須在現有 .NET Container 註冊 Hub／negotiate，讓 Worker 將連線 Upgrade 轉發到 Container；SignalR 使用 WebSocket，亦可選 fallback。長連線佔用 Container 的 TCP/記憶體並降低 `sleepAfter='10m'` 的休眠效果；往多 instance 擴展時另有 affinity、backplane／專用服務成本。Cloudflare 支援 SignalR，但**DO 原生 Hibernation 不會替 .NET Hub 連線休眠** | 技術可行，但本專案不導入 `AddSignalR`／Hub／Redis backplane／Azure SignalR；在未量測需求前避免多一套連線服務 |
| **原生 WebSocket + GameRoomSocket DO** | Worker 路由原樣回傳 `101`，`GAME_ROOMS` 每 Round 一個 DO instance 使用 `ctx.acceptWebSocket`／Hibernation；.NET 只處理授權與業務命令，D1 commit 後 DO 廣播，離線由 HTTPS cursor 補漏。Client Web/Android 共用簡單的版本化訊息契約 | **本 SDD 推薦方案**，保留 Cloudflare 空閒房間休眠特性，不額外增加 .NET SignalR Hub |
| **原生 gRPC／gRPC-Web** | 原生 HTTP/2 gRPC 的雙向串流不等於瀏覽器能直接使用；gRPC-Web browser 不支援 client-streaming／bidirectional-streaming；改成單向串流加 HTTP POST 反而需要維護雙協定 | 不用於玩家即時房間。未來若真的需要高吞吐後端**服務間**呼叫再獨立評估，不在本 SPEC 增加 |

參考官方文件：[Cloudflare DO WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)、[Microsoft SignalR hosting/scale](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)、[Microsoft gRPC-Web 限制](https://learn.microsoft.com/en-us/aspnet/core/grpc/grpcweb?view=aspnetcore-10.0)。

**採用原生 DO 的代價**是需要自行維護有限的 `RealtimeRoomClient` 連線管理、訊息契約、握手授權、重試／順序與心跳／在線態；不可因不用 SignalR 就省略這些測試。反之，這些邏輯只實作一次並供所有劇情／互動使用。仍應在首發真 Web/Android、Container 冷啟動、DO hibernation 以及並發失效下證明符合需求；目前是設計，**不是已實測通過**。

### 4.1.2 連線層可攜性：未來離開 Cloudflare

- **標準 WebSocket 不依賴 Cloudflare**。需要替換的是 `GameRoomSocket` Durable Object、Worker Upgrade 路由、Hibernation／Attachment 與房間分發等**平台專屬 Adapter**；遊戲業務、事件語意與前端畫面不應與 DO 綁死。
- **共通訊息契約**：Web／Android 使用標準 `ws://`／`wss://`、版本化 `{type,version,roundId,clientRequestId,eventSeq,payload}`，以及既有 ACK、重連、Session 授權與 HTTP snapshot／補漏。不要在 Client／Domain／Application 引用 Cloudflare SDK、DO ID、Wrangler binding。
- **最小化依賴**：Application 只透過一個必要的 `IRoundRealtimeNotifier` 埠發布「已提交的 Round 事件／Round 結束」；由目前的 Cloudflare Adapter 把它轉交 Room DO。訊息接受仍回到同一個 Application use case 與 D1 原子命令。勿在每個互動模組建立另一套 WS 服務或介面。
- **其他平台**：未來可換 ASP.NET Core 原生 WebSocket Gateway／自架 WS Server，保留同一 JSON wire protocol 與用戶端 WebSocket；如果改用 SignalR Hub，其 Hub protocol／Client SDK 另有轉換工作，不能宣稱原生 WebSocket frame 可直接接入 SignalR。若整個平台遷移，D1／R2 亦需另換資料 Adapter。
- **驗證**：Application 可用受控 notifier fake 測業務邏輯，Cloudflare 整合測試才驗 DO Hibernation、Upgrade 與重連。**本 SPEC 只實作目前需要的 Cloudflare Adapter，不預做第二套未來平台連線服務。**

### 4.2 DDD／程式分層

| 範圍 | 實作責任 |
|---|---|
| Domain | `StoryRecommendationPolicy` 依共同／個別興趣排前 N（1～3）個內容版次，`StorySelectionPolicy` 依兩人最後有效選擇、原邀請方決勝；`StoryGraphPolicy`、`InteractionDefinition`、`RoundEvent` 管劇情與互動，不引用 HTTP／DB |
| Application | `StoryDialogueService`、`InteractionOrchestrationService`：本期僅操作 `episode_seq=1`，其候選由 Round JSON 取得、有效選票以事件 `episodeSeq` 篩選；Session 依 `(round_id,episode_seq)` 找到正確進度與節點；未來續玩沿用 `story.episode.offers.frozen` 事件選候選，不修改 Round 原候選 JSON。沿用 `IPlatformClient`／`IRoundRealtimeNotifier`，不依賴 DO |
| Infrastructure | 沿用 `CloudflarePlatformClient`；內容由 `content_story_catalog` 對應 immutable R2 manifest／快取，所有 D1 命令沿用受控 prepared SQL，不另建投票儲存服務 |
| API | `Program.cs`：受保護 WS ticket、Top3 offers／vote、experience snapshot/events、內容索引／End；嚴格 JSON／Origin、no-store，票數的 HTTP/WS 寫入共用 Application，不實作兩套不同規則 |
| Worker | `index.ts`／`router.ts` 新增精準 Upgrade router 與 `GameRoomSocket` DO；`matching-commands.ts` 在原接受交易內鎖定 Round 候選 JSON（N=1 同批建立 Session），並同步改名 active claim 查詢；`commands.ts` 接上共用事件投票／結算固定命令；私人 outbound 不得公開 |
| Expo | `app/game-round/[roundId].tsx` 繼續使用，`StoryExperienceScreen`、單一 `RealtimeRoomClient`（標準 WebSocket／跨平台 JSON）、共用 `ADVStage`／`InteractionRenderer`；只有一個直接進場、二或三個才顯示選擇，UI 不引用 Cloudflare SDK |
| 內容發佈 | 以 `story/interaction manifest` 驗證工具發布 immutable versioned bundle，並釘選 SHA256；不要把大量故事寫成 .NET switch 或硬編譯進首頁 JS bundle |

### 4.3 命名規範與 D1 Schema（新增 4 張表＋既有 2 張調整；零 Trigger）

**使用者確認的資料表命名規則**：

| 前綴 | 專屬用途 | 本期資料表 |
|---|---|---|
| `game_` | **玩家實際遊戲執行**：輪次、帳號占用、故事進度、對話事件與互動實例 | `game_rounds`、`game_active_round_claims`、`game_story_sessions`、`game_round_events`、`game_interaction_instances` |
| `content_` | **可重用的遊戲內容定義**：正式劇本目錄、發布版本、興趣標籤、R2 manifest 索引 | `content_story_catalog`（取代原草案的 `game_story_catalog`）；互動模組的定義先沿用 R2 版本化 manifest，本期**不另增 content 表** |
| `match_` | 配對探索條件、邀請流程 | 既有 `match_conditions`、`match_invitations`，不變 |

**現有實作基線**：`0004_matching_sessions.sql` 目前是 `game_rounds`（7 欄）、`game_round_participants`（4 欄），另有 `match_invitations`（11 欄）、`match_conditions`（10 欄）。本 SPEC **不合併兩張 Game 表、不另造配對占用交易框架**。將 `game_round_participants` **僅更名**為 `game_active_round_claims`，維持 `participant_id`、`account_id UNIQUE`、`round_id`、`created_at` 四欄與原子釋放機制。`game_rounds` 的 `account_low_id`／`account_high_id` 是固定排序的兩個參與者，**不是邀請／受邀身分**；真正發起者由 `match_invitations.initiator_account_id` 查得，不重複新增欄位。更名會在**實作階段**同步更新 matching-commands、維運工具、overview 和測試；這是進入Well-Done前的SDD基線；現行更名與0005證據見上方驗證紀錄。

#### 既有表完整異動

| 表 | 型別／約束異動 | 語意 |
|---|---|---|
| `game_rounds`（7→9 欄） | 原 `round_id TEXT PK`、`invitation_id TEXT UNIQUE FK`、`account_low_id TEXT FK`、`account_high_id TEXT FK`、`status TEXT CHECK(active/ended)`、`started_at INTEGER`、`ended_at INTEGER NULL` **全部保留**；新增 `last_event_seq INTEGER NOT NULL DEFAULT 0 CHECK(last_event_seq>=0)`、`story_offer_catalog_ids_json TEXT NOT NULL`（**僅第 1 場**的 1..3 個有序且互異 Catalog ID；後續場次不覆寫）。保留 `idx_game_round_pair` 及 Pair／時間 CHECK | 配對成立原子凍結**第 1 場** 1～3 個版本化 Catalog ID；全 Round 事件序號持續遞增，後續場次候選透過同一事件流保存 |
| `game_round_participants` → `game_active_round_claims`（仍 4 欄） | `participant_id TEXT PK`、`account_id TEXT NOT NULL UNIQUE FK(auth_accounts)`、`round_id TEXT NOT NULL FK(game_rounds)`、`created_at INTEGER NOT NULL`；輪次索引調整為 `idx_game_active_round_claims_round` | 專門保證每帳號同時只能參加一輪；開始新增兩筆 Claim、結束原子釋放，不將占用視為永久參與者清單 |
| `match_invitations`／`match_conditions`／`user_profiles`／認證表 | **無 Schema 改動** | 保留既有邀請者、興趣、授權的權威資料；但接受配對固定 SQL 命令要在同批擴充故事初始化 |

#### 新增四張表：完整欄位及約束

| 表 | 欄位（SQLite D1 型別） | 主要約束／索引 |
|---|---|---|
| **`content_story_catalog`**（9 欄，**內容資料**） | `catalog_id TEXT NOT NULL PK`（UUIDv7）、`story_id TEXT NOT NULL`、`version TEXT NOT NULL`、`interest_tag_ids_json TEXT NOT NULL`、`recommendation_priority INTEGER NOT NULL`、`manifest_key TEXT NOT NULL`、`manifest_sha256 TEXT NOT NULL`、`status TEXT NOT NULL`、`published_at INTEGER NULL` | `UNIQUE(story_id,version)`、`UNIQUE(manifest_key)`、`CHECK(status IN ('draft','published','retired'))`，Interest JSON 必須是合法 Array，SHA256 為 64 hex。**部分唯一索引 `UNIQUE(story_id) WHERE status='published'`**，保證同一劇情同時間僅一個可推薦版本。Retired 版保留供既有 Round 使用；發布前驗全劇情／素材 |
| **`game_story_sessions`**（9 欄，**執行狀態**） | `story_session_id TEXT NOT NULL PK`（UUIDv7）、`round_id TEXT NOT NULL FK(game_rounds)`、`episode_seq INTEGER NOT NULL`、`catalog_id TEXT NOT NULL FK(content_story_catalog)`、`current_node_id TEXT NOT NULL`、`chapter_status TEXT NOT NULL`、`progress_revision INTEGER NOT NULL`、`created_at INTEGER NOT NULL`、`updated_at INTEGER NOT NULL` | **移除 `UNIQUE(round_id)`，改 `UNIQUE(round_id,episode_seq)`**；`CHECK(episode_seq>=1)`、`CHECK(chapter_status IN ('playing','completed'))`、`CHECK(progress_revision>=1)`、`CHECK(updated_at>=created_at)`；**部分唯一索引 `CREATE UNIQUE INDEX ... ON game_story_sessions(round_id) WHERE chapter_status='playing'`**，同一 Round 同時最多一個獨立劇本處於 playing。第 1 場的勝出 `catalog_id` 必須屬 Round 初始候選；後續場次必須屬對應 `story.episode.offers.frozen` 事件。可保留同輪已完成的多筆獨立劇本進度 |
| **`game_round_events`**（8 欄，**執行事件**） | `event_id TEXT NOT NULL PK`（UUIDv7）、`round_id TEXT NOT NULL FK(game_rounds)`、`sequence INTEGER NOT NULL`、`actor_account_id TEXT NULL FK(auth_accounts)`、`client_request_id TEXT NULL`、`kind TEXT NOT NULL`、`payload_json TEXT NOT NULL`、`created_at INTEGER NOT NULL` | `UNIQUE(round_id,sequence)`、`CHECK(sequence>0)`；真人事件以 `UNIQUE(round_id,actor_account_id,client_request_id)` 冪等，保留 `(round_id,kind,actor_account_id,sequence DESC)` 查詢索引，並建議於新 migration 建立**固定 expression index**：`(round_id, json_extract(payload_json,'$.episodeSeq'), actor_account_id, sequence DESC) WHERE kind='story.vote.submitted'`，以真 D1 查詢／測試確認多場投票不需全 Round 掃描。**不新增 Episode 或投票欄／表**：選票 `story.vote.submitted` payload 使用 `{episodeSeq,catalogId}`；勝出 `story.selected` payload 使用 `{episodeSeq,catalogId,storySessionId}`；未來下一場候選使用 `story.episode.offers.frozen` payload `{episodeSeq,catalogIds}`（1～3 個已發布版次），system actor 為 NULL。**依 `episodeSeq` 與 actor 各自還原最後有效票**，禁止跨場混算；所有 `payload_json` 使用固定 kind schema 白名單、大小及授權規則 |
| **`game_interaction_instances`**（10 欄，**互動執行**） | `interaction_instance_id TEXT NOT NULL PK`（UUIDv7）、`story_session_id TEXT NOT NULL FK(game_story_sessions)`、`node_id TEXT NOT NULL`、`definition_id TEXT NOT NULL`、`definition_version TEXT NOT NULL`、`status TEXT NOT NULL`、`state_json TEXT NOT NULL`、`revision INTEGER NOT NULL`、`created_at INTEGER NOT NULL`、`completed_at INTEGER NULL` | `UNIQUE(story_session_id,node_id,definition_id)`、`CHECK(revision>=1)`、`CHECK(status IN ('active','completed','cancelled'))`、狀態與完成時間對應、合法限長 JSON。**依使用者確認只以 `story_session_id` FK 關聯，移除舊草案重複的 `round_id`、`story_id`** |

**不新增推薦、投票或 Episode 專用表**：`game_round_story_offers`／`game_round_story_votes` 皆不建立。初始推薦只把最多三個 Catalog ID 按序寫入 `game_rounds.story_offer_catalog_ids_json`；未來第 2 場以 `game_round_events(kind='story.episode.offers.frozen')` 保存該場的固定候選，不更改第 1 場 JSON。內容預覽仍由 `content_story_catalog`／immutable R2 manifest 取得，**不複製 Profile 興趣或推薦分數**。選票 `story.vote.submitted` 需同時帶 `episodeSeq` 與 `catalogId` 且由 Session 取得 actor；對方尚未投票結算不得看到原始 payload。劇情內節點／互動事件只綁明確 `storySessionId`（和相對應 `episodeSeq`），自由聊天可屬整個 Round；不把投票、Manifest、DO 記憶體或前端儲存當權威。

#### 既有 Prepared SQL／D1 原子性如何沿用

1. **接受配對／第 1 場**：`match.invite.resolve(action=accept)` 沿用受限 prepared SQL batch、`game_active_round_claims.account_id UNIQUE` 與零列 fail-closed。Application 依雙方當時興趣、已完整發布目錄排名 `N=min(3,可玩故事數)`，同批重驗 Profile／Catalog；Round JSON 僅鎖定**第 1 場** N 個候選。`N=1` 同批建立 `(round_id,episode_seq=1)` StorySession、初始 node 與 `story.selected{episodeSeq:1,...}` 系統事件；`N=2/3` 待兩名真人投票後才建第 1 場 Session。`N=0` 不接受也不建空 Round。**JSON 元素沒有逐一 FK**，同批固定 SQL guard 驗證合法、互異且已發布 ID；不能信任預查。
2. **雙人選擇（第 1 場 N≥2）**：`story.selection.vote` 真 D1 batch 驗 Session／Round active／雙人 Claims／`episodeSeq=1`／`catalogId` 屬 Round 初始固定候選／該場未有 StorySession；`last_event_seq` CAS 下追加 `story.vote.submitted{episodeSeq:1,catalogId}`、actor 與 clientRequestId（同 ID 同 payload 回原 receipt，不同 payload 409；舊重播不得覆寫新票）。第二人提交時**同批只讀 `episodeSeq=1` 中兩人各自最後有效事件**，依共同選擇或原邀請方決勝建立 `(round_id,1)` 的 StorySession，追加 `story.selected{episodeSeq:1,catalogId,storySessionId}`。每場結算後拒絕對該場的改票，對方結算前只見投票狀態而非選項。
3. **本期遊玩與未來跨場隔離**：本期 API／WS 只能操作 `episodeSeq=1`，不能由 Client 自訂 `episodeSeq=2` 越權新增下一場。`game_interaction_instances.story_session_id` 反查 Round／episode；劇情節點、選項、互動事件必須和該 StorySession／版次綁定，拒絕從已 completed 的舊場次提交新的劇情操作、拒絕跨場引用舊 node／vote；**Round 全域自由聊天仍可在故事 completed 後繼續**。每次 mutate 同批驗 active、Session、雙人 Claims、revision；retired 版不可切換到別的版次。退出沿用原子 `game.round.end` 與恰好兩個 Claims 釋放，永久原 Pair 排除不變。
4. **實作注意**：目前 `matching-commands.ts` 的接受流程大量使用 `changes()=1` 依前一 SQL 寫入的筆數做保護；插入新的候選與 StorySession／Event 陳述式時必須核對順序並擴充真 D1 競態／回滾驗證。改名影響 `available()`、`match.invite.resolve`、`game.round.list/get/end`、`local-game-policy.mjs` 與既有 schema／API／Android／Web 測試，**並非只改一份 migration**。正式確認後在實作階段同步修改；本次不動程式。
5. **範圍界線**：不包含任何 History 表、Housekeeping、聊天搬移或資料保留天數規則，全部交由未來獨立 MVP。此回合只更新 SDD，不執行 migration、不清除資料、不宣稱已測試。
6. **未上線舊遊戲測資處置（SD-RQ-02=A，2026-11-08 已確認）**：使用者明確決定**不保留、不遷移舊版遊戲資料**。待 Well-Done 實作新版 Schema 時，僅對已辨識且核准的 DatingHigh **非正式測試資料庫**，清除全部舊 Round、帳號占用及必要關聯的邀請／遊戲測資後直接建立新測試資料；不得假填舊 Round 的 Catalog ID，也不得清除正式／未知環境、帳號、Profile 或其他專案資料。清理順序、外鍵完整性、失敗回滾及重新建立新版 Round 要有真 D1 測試。**這是未上線舊遊戲測資更替，不是聊天 History／Housekeeping；perfect-plan 不執行刪除或 migration**。
7. **0005 向前 Schema 建置方式**：既有 `game_rounds` 沒有候選 JSON；SQLite 不能直接以 `ALTER TABLE ADD COLUMN ... TEXT NOT NULL` 且沒有非 NULL DEFAULT 的方式安全升級。因已確認舊遊戲資料無須保留，**Well-Done 在核實非正式環境且受控清空全部舊遊戲關聯列後，使用向前 migration 重建空的 `game_rounds` 定義**（7→9 欄；不是修改既有 `0004` migration），並將已清空的占用表**更名**為 `game_active_round_claims`、保留原四欄與唯一保障。執行前須先明確檢查 Round／占用／相關邀請已清空；任何非空或未知環境 fail-closed，不能偷渡 nullable 欄位或塞假版次，不得影響帳號/Profile／其他模組。真 Miniflare D1 驗證 0004→0005 與零列／外鍵／失敗回滾；該句屬規劃階段限制；本次Well-Done已依同一決策執行受控local升級，未執行remote migration。


### 4.4 SD-RQ-01=B：未來多獨立劇本的資料契約，本期不開啟第二場

**本期已確認的產品行為**：每個 Round 仍只有**首次配對時的一次**選場／開始流程，完成 `episode_seq=1` 後繼續聊天與後續共用模組，但**不提供「開始下一個獨立劇本」按鈕、API 或 WS command**。測試允許用隔離資料建出 `episode_seq=2` 以驗證 Schema 與事件模型；**這不代表第 2 場已對玩家開放或已驗收**。

**資料結構現在就支援續玩**，不擴增已確認的四張新表：

1. `game_story_sessions` 每筆代表**完整獨立劇本**，同一 Round 可依 `episode_seq=1,2,3...` 存放歷次結果；`UNIQUE(round_id,episode_seq)` 保證同場不重建，`UNIQUE(round_id) WHERE chapter_status='playing'` 保證同時間只有一個正在遊玩的獨立劇本。故事內的多章節、支線與合作節點仍屬同一個 `story_session_id`，不因章節跳轉增加 episode。已完成的 StorySession 保留只讀進度供 Round 內安全投影，**Round ended 仍一律禁止查私人內容**。
2. `game_rounds.story_offer_catalog_ids_json` **永遠是第 1 場候選**，不得被後續場次覆蓋。未來要啟動第 `k>=2` 場時，在一筆真正原子 D1 操作中驗前一場 `chapter_status=completed`、Round active、恰好兩筆 Claims，按當時正式可玩故事與兩人興趣排名後，追加**唯一一筆** `game_round_events(kind='story.episode.offers.frozen',payload_json={episodeSeq:k,catalogIds:[...]})`。一場的 `catalogIds` 永久固定 1～3 個版本 ID，後續新發布不回溯改動。防止重複凍結同一個 `episodeSeq` 透過 `last_event_seq` CAS、同批重驗最大已凍結／已選定場次，及固定 SQL 零列 fail-closed。**這是未來流程的資料契約，不在本期新增啟動操作**。
3. 每張真人 `story.vote.submitted` 事件的 payload 都是 `{episodeSeq,catalogId}`；僅可選該場凍結候選。結算只能讀該 episode 兩名玩家各自最後有效票、由原始 `match_invitations.initiator_account_id` 做不同票決勝；追加 `story.selected{episodeSeq,catalogId,storySessionId}` 並建立對應唯一 `(round_id,episode_seq)` StorySession。候選僅 1 個時該場免投票直接建立 Session。重播、跨場 payload、錯用舊票、已決議再改票或 end 競態全部必須在真 SQL 交易拒絕。系統凍結候選／結算事件 `actor_account_id=NULL`，仍有 Round 全域 sequence；不新建 Episode、Offer、Vote 表。
4. `story.choice.submit`、`interaction.submit`、`story.node_changed`、`interaction.updated` 等**故事內事件**攜帶 `storySessionId` 及 `episodeSeq`，由伺服器核對 Session 關聯、`catalogId` 版次、`currentNode`／revision，不能將第 1 場事件套到第 2 場。自由文字聊天 `message.send` 是 Round 層級，無需偽造故事 Session，也不因單場 completed 而停用；增量讀取仍使用全 Round `eventSeq`，依授權／投票隱私投影過濾。
5. 未來開始下一場時必須新增 Application／API／UI 的顯式入口與狀態推進，但基於**目前已規劃的四張資料表和欄位**即可保存後續候選、投票、Session、互動、遊玩進度，**基本多場續玩不應再要求 D1 Schema Migration**。本期的 API、WS command 和前端拒絕啟動 `episodeSeq>1`；不以單純增加欄位或測試假場次聲稱未來產品已可使用。
6. **場次安全狀態**：第 1 場 N=1 在接受時直接產生 `playing` Session；N=2／3 的首次候選在尚未決議時為 `pending_story_selection`。未來第 k 場的候選已凍結但尚未建 Session 時同樣為待選狀態，來源只取該場對應的 offers.frozen 事件。不可同時有兩場待選、不可在上一場 `playing` 時凍結下一場、不可讓已 `ended` Round 再開新故事；這些條件須由伺服器 D1 batch guards 確保，不能只靠 UI。**目前不執行 k>=2 的流程**。

## 5. 通訊與 API／依可玩劇情數自動決定遊戲流程

### 5.1 從配對成立到進入故事（不設額外模式或未知門檻）

1. 邀請者 A 發邀請、受邀者 B 接受的**同一 D1 原子交易**，依當下興趣及已發布可玩內容在 `game_rounds.story_offer_catalog_ids_json` 鎖定**第 1 場（`episodeSeq=1`）**的 `N=min(3,availableStoryCount)` 個 `catalog_id`；不新增 Offers 專用表。這個 JSON 是第 1 場不變快照，未來場次以 §4.4 的 offers.frozen 共用事件保存候選。兩端按同一來源讀取，修改興趣、發布新版都不回溯改選。
2. **第 1 場 N=1：無選擇步驟**。接受配對的同批交易就以唯一可玩劇情建立 `game_story_sessions(episode_seq=1)`／初始節點，玩家直接進遊戲；`GET experience` 回 `phase=playing`、`episodeSeq=1`、`storySessionId`、`storyId`／`version`／`currentNode`，不用額外 POST 或啟動模式。
3. **第 1 場 N=2／3**：雙方從 Round 固定的兩張／三張候選各選一張。預覽資訊來自 `content_story_catalog`／R2；每次本人選擇／改票追加 `game_round_events(kind='story.vote.submitted',payload_json={episodeSeq:1,catalogId})`，以 `episodeSeq=1`＋本人＋`sequence` 找最後有效票；未決議時另一人僅知道有無選擇，不得讀具體 `catalogId`；兩人均完成才同批結算。
4. **N≥2 決勝規則**：同場同票用共同選擇；同場異票用最初 `match_invitations.initiator_account_id` 邀請者最後有效票。等待兩個真人提交，不因逾時／離線補票；D1 commit 後雙方由 WS `story.selected{episodeSeq,storySessionId}`／HTTP snapshot 得到一致結果；**結算後不可更改該 episode 選擇**。
5. **N=0（沒有可玩劇情）**：不能建立空 Round 或把邀請標記 accepted，應維持既有邀請狀態並回明確業務失敗；這是內容不存在時的必要安全檢查，不另立人工上線門檻。所有結果均基於當下實際可玩數量自動判斷。

### 5.2 WebSocket 與 HTTP 契約

**WebSocket（即時傳輸）**：`GET /api/v1/game-rounds/{roundId}/ws` 標準 Upgrade 接 Room DO。Server 事件：`story.selected`（含 `episodeSeq,storySessionId`）、`story.offers_ready`（N≥2，含 episodeSeq）、`story.vote_status`（含 episodeSeq；未結算不回對方選項）、`room.snapshot_hint`、`message.committed`（Round 層）、`story.node_changed`／`interaction.updated`（含 storySessionId、episodeSeq）、`player.presence`、`room.ended`。Client 命令：`story.vote.submit`（**本期僅 episodeSeq=1 且 N≥2**）、`message.send`、`story.choice.submit`／`interaction.submit`（含目前 `storySessionId`）、`presence.ping`；沒有第 2 場開啟 command。業務寫入要帶 `clientRequestId`；D1 commit 後才回 `command.ack{clientRequestId,eventSeq,result}`。Client 不可偽造 actor、邀請方或 episode 決議。

**HTTP（登入、握手、快照、補漏、結束，不以輪詢代替 WS）**：均沿用 `/api/v1` PlatformAccess、Cookie／Bearer、Origin、no-store、嚴格 JSON。HTTP 與 WebSocket 操作共用相同 Application use case、D1 原子命令、授權及冪等。

| 方法／端點 | 語意 |
|---|---|
| `POST /game-rounds/{roundId}/realtime-ticket` | 已登入且為真 Round active 成員，一次性短效 WebSocket ticket |
| `GET /game-rounds/{roundId}/experience` | **本期只回 episodeSeq=1**：N=1 回 `phase=playing,episodeSeq=1,storySessionId` 及已鎖故事／節點；N=2／3 未決議回 `phase=pending_story_selection,episodeSeq=1`、Round JSON 的 N 個候選、本人最新 `myVote` 和 `partnerHasVoted`，結算後回 `playing`。故事完成回 `chapter_status=completed` 但 Round 仍 active，可繼續 Round 聊天；ended 只回安全狀態。結構可承接未來後續 episode，但**本期不提供其啟動／操作** |
| `GET /game-rounds/{roundId}/story/offers` | 本期僅第 1 場 N≥2 的選劇情投影：`episodeSeq=1` 並依 Round JSON 順序回 N 張 `{catalogId,rank,storyId,version,title,summary,previewUrl}`，加本人最新有效票與 `partnerHasVoted`；預覽不揭露對方私人興趣。未來 episode>=2 可沿用端點、改由該 episode 的 offers.frozen 事件取得固定候選，**本期拒絕非 1 場的請求** |
| `POST /game-rounds/{roundId}/story/vote` | 本期僅第 1 場 N≥2 接受 `{clientRequestId,episodeSeq:1,catalogId}`，由 Session 判定真人 actor；共用 Event 追加選擇或改票，只回本人票／等待／該場已決議。N=1、已決議或 `episodeSeq>1` 一律拒絕；未來可沿用同一事件格式，不新增投票表 |
| `POST /game-rounds/{roundId}/events/query` | 有效 Round 以 `{afterSeq,limit}` 或 `{beforeSeq,limit}` 做有界事件補漏，輸出依本人／是否已決議投影；禁止在選場前看到另一人的具體選項 |
| `POST /game-rounds/{roundId}/end` | 既有受保護 `game.round.end`，經本人的二次確認後在待選或遊玩中均可結束 |
| `GET /game-rounds/{roundId}/status` | 原成員唯讀安全 `active|ended` 狀態；ended 不回舊聊天／互動 |

**本期不新增 `POST /story/start` 或第二場啟動端點**：第 1 場 N=1 在接受交易建立 `(round_id,1)` StorySession、N≥2 在該場兩票結算時建立。未來第二個獨立劇本才另規劃啟動入口，**沿用本次已保留的 D1 欄位和共用事件語意，不需只為多 StorySession 做 Migration**。也不新增 URL query 的 GET events；沿用 `POST events/query`。

`game_rounds.last_event_seq` 從 Round 建立即可排序；WS 傳輸可斷線，但成功 D1 事件必可經 HTTP snapshot／游標恢復。未提交完成或結果不明不能自動用新 requestId 重送；同 ID 同 payload 只能返回原結果，不同 payload 409。**共用事件流的原始 `story.vote.submitted` payload 不得在未結算前送給另一名玩家**，跨裝置／重連的所有事件端點均使用本人安全投影，不能只靠前端隱藏。N≥2 投票前只透露 `partnerHasVoted`，決議後才顯示雙方選擇及邀請方決勝理由。

錯誤：400 `INVALID_STORY_REQUEST/INVALID_STORY_VOTE`；401 Session；403/404 非成員防探測；409 `NO_PLAYABLE_STORY`、`STORY_SELECTION_PENDING`、`STORY_ALREADY_SELECTED`、`EVENT_STATE_CONFLICT`、`ROUND_NOT_ACTIVE`；429／503／504 依既有平台錯誤契約。所有公開 DTO 僅白名單欄位，不曝露私人 Profile、Email 或 R2 key。


## 6. 遊戲內容、資產儲存與擴充至千個故事

### 6.1 玩家狀態與內容的分離

- **內容資料**：D1 `content_story_catalog` 保存已發布的劇情 ID／版次、興趣標籤及 R2 manifest 索引；**執行資料**：`game_rounds.story_offer_catalog_ids_json` 僅固定**第 1 場**最多三個版次 ID；`game_round_events` 記全部 Round 的聊天及帶 `episodeSeq` 的候選凍結／投票／勝出／故事操作事件；`game_story_sessions` 按 `(round_id,episode_seq)` 分別保存歷次獨立劇本及進度，`game_interaction_instances` 以 `story_session_id` 綁定當次互動。**不額外建立 Episode／推薦／投票表**，不把素材 Binary、完整台詞或 Profile 分數複製進每輪；DO 不是權威資料庫。
- `R2` 保存發佈後 immutable 的故事／支線／互動 manifest、繁中台詞包、場景背景、互動圖片及未來音訊，路徑例如 `story-content/stories/scene-01/v1/manifest.json`、`story-content/interactions/cooperative-choice/v1/...`、`story-content/assets/{sha256}`。**另用專屬遊戲內容 R2 binding/bucket**，與現有 `FILES` 私人真人照片及生成化身分離；公開劇情視覺可經受控 Worker／快取或可信的公開 CDN，會員私人內容絕不走公開資源路徑。
- **N=1**：進場直接讀已選故事的 `experience`／manifest／首屏資產；**N=2/3**：依 Round 固定的 N 個 Catalog ID，自 `content_story_catalog`／內容 manifest 讀 preview 與精簡 metadata，雙方選完才載入勝出故事 `story_id/version/sha256` 的 manifest／首屏資產；其餘節點 lazy-load 與預載下一個可能節點。裝置以 hash／version 快取可重用素材，文字包支援 localization；遊戲狀態仍每次授權由 D1 確認。
- 發布器先對 JSON Schema 驗證：節點 ID 唯一、入口／結束可達、所有分支落點存在、沒有無限死循環、互動模組／所需資產／語言 key 有效、時間／場景／事件完整、興趣 tag 必須存在 `ProfileCatalog`、推薦預覽資訊／大小／雜湊與安全白名單通過，才把**一個完整可玩章節**在 `content_story_catalog` 由 draft 標 published 供 N=1 直接進場或 N=2/3 興趣推薦；同一 story_id 同時最多只有一個 published 版；不得把只有開場稿的故事標成 published。已開始的輪次仍 pin 舊版，不能因更新故事切斷進度；retire 阻止新輪使用，不刪既有版本。
- 大量內容由**資料驅動**擴充：Story manifest 定義 `nodes、trigger、conditions、interactionRefs、assets、localization、endings`；Interaction manifest 定義 `moduleType、parameters、resultFlags`；引擎按類型渲染／執行，增加第 1000 場通常只發布新資料／資源而非加一個 API、.NET switch／React page 或資料表。**新型互動機制**才需開發一次 renderer／domain policy，之後所有故事共用。
- Cloudflare R2 若要 CDN Cache API，需要正確自有網域路由；`workers.dev` 不可假設 Cache API 實際生效。首發可先通過受控 Worker／R2 路由，不承諾尚未部署的 CDN 命中率；正式規模時規劃 custom domain、immutable URL、Cache-Control／ETag 及容量測試。

### 6.2 共用遊戲模組／觸發流程

`StoryGraph`（主線敘事／分支）與 `InteractionRegistry`（可插入的互動）是**兩套可組合的系統**，不能把小遊戲硬綁在某個 Story.tsx 中；玩家在任一 StoryNode 可引用同一模組。例如：
- 雨聲書店的「找出書籤線索」使用 `inspect-object/v1`；未來展場故事可拿同一模組換成「調查畫框」，互動 UI/判定不重寫。
- 雙人選書、挑咖啡豆、決定散步方向都能使用 `cooperative-choice/v1`；每次有自己的 instance_id、題目／版次／狀態、雙人答題紀錄與合流結果，不把 A 故事的回覆誤算到 B 故事。
- 實境解謎正式的小遊戲（下份 OnlineGames）將來接同樣的 `InteractionRegistry`，但本 SPEC 僅負責其共用生命週期、觸發與首發樣例，不提前聲稱完整「2 小遊戲＋3 任務」都交付。

例子：`on_enter(node-investigate)` → 建立或讀取唯一 `inspect-object` 實例 → 玩家各自看書籤線索 → `interaction.completed` 寫入 Round event → 決定 `branch-node` → 兩端收到 `story.node_changed` → 進入對話／下一個選擇。每次轉移都在真 D1 原子操作內驗 currentNode+revision+Round active，WebSocket 只即時通知結果。

### 6.3 真人等待時的體驗（不假造回覆）

同時設計「個人可進展」及「雙人需等候」兩種節奏：
1. 玩家已發訊：立即顯示本人**送出中** bubble、場景微動畫或環境音；收到 server commit ack 才標**已送出**，無法證實對方已讀。對方在線與輸入中只顯示短時效 presence（不是持久事實）。
2. 對方還沒回覆：玩家仍可探索可選物件、閱讀場景旁白、選自己的下一個話題／開個人支線，不讓整個畫面停在轉圈；但**任何雙方協力結果不自動幫另一位選**，不可因回覆慢而變更好感度。
3. 當真正碰到雙人閘門：顯示對方尚未提交、可返回自由聊天／繼續個人探索，保留目前選擇讓重新進入可恢復；不強制兩人同時在線、不倒數處罰、不假扮對方。若設計章節需要雙方確認結局，就讓該節點 pending 並允許稍後恢復。
4. WebSocket 重連：畫面顯示重新連線／狀態未知，`exponential backoff+jitter`，恢復後補事件游標與 node、丟棄已過時的 ephemeral typing/presence。回前景立即同步，原生背景下不保證持續 socket。
5. 可用**獨立環境動效／輕量敘事／音效**填補等待，不以自動 NPC 聊天暗示對方已回覆；場景停在可互動狀態而非只有氣泡等待。後續若要 push notification，需要使用者另外確認及對應平台設計。

### 6.4 首發完成條件與人工品質 Gate

**首發 `scene-01 雨聲書店` 完整垂直切片**（既有正式 catalog 的 `reading` 共同興趣可觸發；測試準備使用真符合資格的雙帳號，不以固定夏樹替代），至少走完：
1. **序幕**：下雨書店背景／人物入場、書籤旁白與人物站位、可跳過的逐句 ADV。
2. **破冰**：三種可實際送出的真人開場句與自由輸入；彼此可在另一端立即看到真回覆，斷線重登可續。
3. **探索**：各自調查書籤／推薦卡，觸發至少一個可重用 `inspect-object/v1`，環境動效及音效不阻塞操作。
4. **協作**：使用 `cooperative-choice/v1` 選擇閱讀推薦方向；雙方可非同步提交，相同或不同選擇各有合流結果，沒有對方作答則可繼續聊天／探索，不自動補答。
5. **支線與分歧**：至少一個可選分支（例如「追尋書籤留下的提示」），可回歸主線；至少兩個可達成的不同收尾文本／視覺結果，且由真提交的選擇決定。
6. **章節收尾**：展示雙方選擇對應的結語與完整 `chapter.completed`，仍可自由聊天；真正結束 Round 必須另由「結束本輪互動」→「確認結束」觸發。
7. **完整防護**：Web／Android 雙人、WS 斷線、恢復、場景一致、不可跨 Round、重送競態、退出後阻擋及原 pair 永久排除全部可實測。

#### 首場節點到分鏡／表情／互動的內容核對基準（2026-11-12 規劃）

下表**不是已完成的美術或 JSON**；實作時應依目前首場正式節點圖做同一個可玩的完整故事，不新增假分支／NPC 對話、不改兩種結局業務條件。人物表情是編排的**非語言演出**，不是對方真人已產生的情緒或說話。

| 現有節點 | 建議第一人稱 2.5D 鏡位與場景 | 預製表情／已確認 UX |
|---|---|---|
| `entry` 入店 | 雨窗／書店門鈴到桌邊主觀視角，對方可用全身 master **自然站立**於桌旁，前景書桌依透視遮擋；可切換站立遠景／上身近景，不能把站姿稱為坐姿 | `neutral` 入場，雨聲及暖燈；店員 NPC 台詞不能由對方嘴裡說出（P3／P4） |
| `icebreak` 破冰 | 主觀鏡位面向桌對方，下緣出現 ADV 台詞與可收合真人聊天 | `smile` 可作預設**編排**神情；三種真人話題按本人才是真提交（P1） |
| `shelves` 書架 | 書架與夾頁的書籤進入近景，前景留對方角色可見部分 | `thoughtful`，書籤熱區進入 `inspect-object` 並返回（P2） |
| `side-note` 支線 | 抽出便條局部特寫，視角不遠離原書店 | `surprised` 或 `thoughtful`；NPC 說明仍標 NPC，不冒用真人（P2／P3） |
| `rejoin` 桌邊合流 | 回暖燈桌邊，畫面與支線鏡位有可感知的回歸 | `smile`，保留真人聊天、連線狀態（P1／P3） |
| `cooperate` 合作 | 桌面上的兩份閱讀提案與書籤明確可見 | `neutral` 或 `thoughtful`；按真雙人提交顯示 pending／結算（P5） |
| `ending-together` 同選 | 兩枚書籤在同頁、暖燈合流的收尾鏡位 | `smile`、場景有別於不同選的演出，章節完成仍可聊天（P3／P5） |
| `ending-two-pages` 異選 | 兩本不同書與逐漸轉輕的雨，獨立收尾構圖 | `thoughtful`／`smile` 依編排；不得與同選只換標題（P3／P5） |

**第一場品質覆核矩陣**：以兩個不同真人測試帳號互看對方 POV；**16 款免費各自進行舊版上半身與全身延伸版逐圖對照／五表情品質驗收**，另以至少兩種不同免費角色及一個實際採用 AI 全身角色完成真人雙人場景試玩；測試站立全身遠景、半身中景、近臉裁切、Web 寬螢幕／Android 直向、輸入法／聊天抽屜、音效、熱區、兩結局、斷線／重入／改選化身。不同姿勢的坐下／步行不列為已交付。每節點核對可感知差異與真雙人操作，不能只因 JSON 有 `framing`／`expression` 就標通過。

**Gate A（引擎／驗證）**：首發只有一個完整可玩的正式故事時，正常配對後**不需要任何額外模式**，直接進 `scene-01`；對 N=2/3 的選擇決策可先用隔離單元／真 D1 測試資料驗證規則，隨著第 2 個真劇情發布就自然在玩家端二選一，不另設特殊上線 Gate。只有首發場景的 `node/branch/interaction/story_completed`、即時協作、資料一致、安全和故障案例都通過，才能聲稱「首發可驗證」；其餘九場仍是 backlog。

**Gate B（玩家體驗）**：2026-11-12 已確認 **Q-UX1=A、Q-UX2=A、Q-UX3=B、UX-RQ-04=FULL-BODY**；因此玩家必須在首場完整實玩中確認**第一人稱 2.5D 舞台、16 款免費角色上半身原畫保真延伸的完整全身站姿、AI 全身候選／B1 五表情、同一 full-body master 遠中近取景、對方已選化身融入場景、UX-P1 場景內聊天、P2 即景探索、P3 運鏡光色、P4 視聽氛圍、P5 真雙人回饋**，以及原有劇情節奏、等待、兩種結局、Web／Android 跨尺寸／斷線恢復及安全退出。首場需測雙帳號互換 POV、真人聊天與 NPC 清楚分離；不可將技術 Gate A 或舊版 Web／Android 通過視為新視覺驗收。未取得 Gate B 人工確認前，**不進入剩餘九場製作／Well-Done 擴充**。可在此 Gate 反覆優化第一場，不用為趕總數把一場故事拆成假通過。


## 7. 安全、效能與驗證計畫

- **實際可玩故事數量測試**：第 1 場 N=0 時不接受也不建空 Round；N=1 同批鎖定單一 `catalogId` 並初始化 `(round_id,episode_seq=1)` StorySession，N=2 二選一、N=3 三選一、N>3 只鎖定前三個。初始候選 JSON 有序合法互異限 1..3、Profile／Catalog 競態全 batch rollback、Retired 版僅舊 Round 可讀；另外以真 Miniflare 驗證第 2／3 場的多 Session**資料結構**可保存，不代表 App 已支援選第 2 場。
- **選擇與結算測試**：共同／個別興趣排名、穩定同分排序與安全投影；**不建立 Offers／Votes 專用表**。N≥2 真人投票／改票只能追加共用 Round event，每個人的最後有效事件才參與結算；同選、異選採原 `initiator_account_id` 邀請方、兩端同時提交、舊 Request 重播不能覆蓋新票、結算後不可改、單邊未選不補票、與 end 競態均以真 D1 guard／CAS／回滾驗證。
- **跨平台／可搬遷邊界**：App／Application 的 WebSocket JSON 契約、Room event、冪等／補漏與 `IRoundRealtimeNotifier` 不含 Cloudflare SDK／DO 型別；測 portable notifier fake＋現有 Cloudflare Adapter 真 Upgrade／DO hibernation／告警／reconnect。SignalR 及 gRPC 為比較過的替代協定，不在本 SPEC 再做第二套傳輸。另以真 D1／Domain 隔離測試驗證同 Round 的第 1／2 場 Session 與 episode event，不把第 2 場 E2E 當成本期功能；第一場以外的入口保持封閉。
- **安全測試**：受限 WebSocket ticket 過期／一次消費／冒用、Session 撤銷、非成員、frame 大小／backpressure、限流與重連；真 D1 guard 驗 active Round、兩位 Claims、候選 ID 屬**對應 episode**、同 `(round_id,episode_seq)` 勝出只建一次、同輪最多一筆 `chapter_status='playing'`、`game_interaction_instances.story_session_id` FK 及全 Round 唯一 eventSeq。跨場舊選票／node／互動不能作用於新場；**本期 App/API/WS 嚴禁 `episodeSeq>1` 的啟動或操作**。未結算時 Events Query／WS 不得回另一人具體 `catalogId` payload，不能只前端隱藏。
- **雙端 E2E**：本地 Web↔Web、Android↔Web 兩個獨立真帳號實測已存在的劇情與完整分支；有人延遲回覆、斷線／回焦、互動等待、章節完成後仍可聊天、二次確認結束與原 pair 永久互斥。當只有一場時直接演出，第二場實際可玩後自然加入雙方選擇 E2E，不為驗證湊假劇本。iOS 依 D-052 暫緩、無障礙專項依 D-051 暫不納入。
- **效能與成本**：量測 commit→推播可視延遲、DO Hibernation 喚醒、Container 冷啟動、D1 讀寫、R2 資源傳輸及 Android 載入；未取得真結果前不可宣稱已通過。遊戲素材需合法使用，原型圖片不能視為已有商用授權。
- **2026-11-12 視覺體驗新驗收計畫（尚未執行）**：在原有故事技術測試之外，補獨立的場景組合／角色遮罩／表情身份一致性、免拉伸與表情資產缺失 fallback、相異 POV、場景層深度與熱區轉換、鍵盤與聊天抽屜覆蓋、逐句演出／略過／恢復、真雙人提交狀態與兩結局演出。使用受控 Web／Android 同劇情資料與實際裝置畫面覆核，不用原技術測試數代替新體驗結果。
- **表情製作安全與成本驗收（尚未執行）**：免費16款×5表情需有正式可檢視資產；AI B1 前景採用從候選圖生成固定五表情，驗證同一人物、R2 暫存與正式資產權限、失敗只重試未完成項、切換／重登只快取讀取不重產，並以前後端競態防止過時回覆覆蓋。維持真人照片不可被重送、Gemini 90 秒單請求截止、候選有效期及取消／未知提交安全；模型 Lite 替代未驗。
- **資料相容與性能驗收（尚未執行）**：manifest／renderer 擴充須驗舊版本 Round fallback、正式 avatar 套組 hash／版本完整、B1 產製期間跨 Web／Android 切換阻擋與中斷補救、共用 Skia 壓縮參數／alpha 不失真、首屏時間、表情快取命中與峰值記憶體。UX-RQ-04 另須保留16張原版角色供逐款視覺比對與使用者確認，逐一驗**角色身份／原衣裝／髮型保留、下半身自然延伸、五表情同全身 master、四肢及鞋完整、遠近景皆能辨臉**；AI 初始候選需全身且 B1 延伸／表情包重試受控。UX-RQ-02 驗採用事件必須觸發且 DB 無 timer／render-time polling，重連校正、防過期事件與撤銷授權；不得虛構 FPS／時間通過數字。
- **不包含**：任何聊天／互動記錄搬移到 History 表、Housekeeping、清理排程及保留天數決策，使用者明確指定交由未來獨立 MVP；此處只驗**當輪使用期間的寫入、授權與回復**。本輪只修改 SDD Markdown，不執行 migration／部署／程式碼。

## 8. 本次 SPEC 可測試驗收條件（按實際故事數量運作）

| ID | 驗收行為 | MVP／使用者決策 |
|---|---|---|
| `SD-AC-001` | 只有 active Round 真兩人成員與有效 Session 可進場；第三人／撤銷 Session 被拒 | AC-004-02、AC-012-04 |
| `SD-AC-002` | 接受配對同筆 D1 原子交易依當下雙方興趣排名，鎖定 `N=min(3,實際可玩故事數)` 個故事與版本；N=0 不產生空 Round，N=1 直接進入，N=2／3 分別二選一／三選一 | AC-005-02；SD-Q4 |
| `SD-AC-003` | 首發故事使用既有 3:4 **角色來源素材**，但遊戲本體以第一人稱 2.5D 分層場景呈現對方角色、旁白／真人區分、情節對應表情、音效與 ADV 演出；不常駐雙人頭像卡、不假扮真人 | AC-005-01；Q-UX1=A／Q-UX2=A |
| `SD-AC-004` | 每場三種不同性格真人破冰選項與自由文字；選項由本人真實送出 | AC-005-03 |
| `SD-AC-005` | WebSocket 真雙向，D1 commit 後 ack、Round eventSeq 有序、斷線補齊／冪等防重播 | AC-005-03 |
| `SD-AC-006` | 首發 `inspect-object`／`cooperative-choice` 具備可操作個人與雙人非同步互動／恢復 | AC-005-03 |
| `SD-AC-007` | 首發支線／分支／至少兩個結局可玩；chapter.completed 不自行結束 Round | AC-005-01～03 |
| `SD-AC-008` | 語境只提示本人可取消；正式退出需「結束本輪互動」→「確認結束」 | AC-012-02～03 |
| `SD-AC-009` | 任一方正式退出：真 D1 原子 ended＋解除兩人成員占用，原 pair 永久互斥 | AC-012-03 |
| `SD-AC-010` | end 與所有選場、聊天、互動及後續業務異動競態皆真 SQL fail-closed，結束後不得再揭露名片資料 | AC-012-04、AC-020-06～07 |
| `SD-AC-011` | ended 後只讓原成員讀安全狀態，不能查聊天／互動歷史；**本 SPEC 不包含 History／Housekeeping／保留期限** | AC-012-04；使用者決策 |
| `SD-AC-012` | WS 斷線／DO hibernate／Container 冷啟動／Session 換登／誤重播仍能恢復、安全一致 | AC-005-03 |
| `SD-AC-013` | Story Manifest／圖像資產 hash、不變版本、分支／模組引用有效、按實際當輪故事 lazy-load | AC-005-02 |
| `SD-AC-014` | 真人等待時仍能探索／自由聊天，不能假造對方答覆、已讀、倒數處罰 | AC-005-03 |
| `SD-AC-015` | 首發完整故事 Gate A 技術、Gate B 使用者體驗驗收確實完成，才依既有使用者決策繼續開發其他故事 | 2026-11-07 玩家體驗決策 |
| `SD-AC-016` | N=2／3 時本人以 `game_round_events` 追加有效投票／改票、取得本人最新有效選擇；兩人同選用共同結果，不同採 `match_invitations.initiator_account_id` 邀請者選擇；結算前不洩漏對方具體選項（含事件 API） | SD-Q4／資料精簡 |
| `SD-AC-017` | **本期只啟動第 1 場**：N=1 原子建立唯一 `(round_id,episode_seq=1)` StorySession；N=2／3 以第 1 場兩人最後有效 Event 投票原子建立；勝出 ID 必須在初始 Round 候選且已鎖合法版本。**資料結構**支援同一 Round 後續 episode Seq 2+、每場唯一且同時最多一個 playing；未來場次投票與候選必依 episode 隔離、不得重播跨場或改動初始候選 | SD-Q4／SD-RQ-01=B／資料精簡 |
| `SD-AC-018` | 只有第一場可玩時正常直接開始；第二場完成即可正常開放二選一；第三場完成變三選一；第四場以上仍推薦前三名，不建立額外模式／上線 Gate | 2026-11-07 及本輪使用者決策 |
| `SD-AC-019` | 前端標準 WS frame、事件 JSON／重連／冪等、Application 通知出口保持 Cloudflare 中立；DO 專屬邏輯限基礎設施 Adapter | 本輪可攜性決策 |
| `SD-AC-020` | **命名與資料精簡**：`game_` 僅遊戲執行、`content_` 僅內容定義；既有占用表只更名為 `game_active_round_claims` 且維持 `account_id UNIQUE`；新增**恰好 4 張表**，Session 為 **9 欄**（新增 `episode_seq`），`UNIQUE(round_id,episode_seq)`＋部分唯一 playing 索引；Episode 2+ 候選和投票只用共用事件保存，不新增 Episode／Offers／Votes 表；互動只以 `story_session_id` FK 連到遊戲 | 本輪使用者已確認 SD-RQ-01=B／SD-RQ-02=A |
| `SD-AC-021` | **2026-11-12 已確認**：Web／Android 每位玩家以固定第一人稱 2.5D 鏡位呈現對方正式已選的**全身站姿 master**，可站立全身遠景與自然裁切中近景，透視／遮擋／光色合理；不顯示並排雙卡、不要求自由 3D／真實走動、坐姿或即時骨架動作 | AC-005-01；Q-UX1=A／UX-RQ-04；§3.1／3.8 |
| `SD-AC-022` | **2026-11-12 已確認**：免費16款保留原圖與hash／穩定ID，以AI全身延伸、視覺比對與逐款人工覆核保留角色身份／髮型／原衣裝／氣質；AI 每張候選起即全身 3:4 站姿，B1 五表情同一全身人物，私人 R2 Manifest 的全身 master＋五檔 SHA／大小／格式／來源及 `ready` 均通過才採用；回選／重登 Gemini 0 次，不因版本或檔名誤判完成。逐句演出可略過／恢復，不猜真人情緒或假造發言 | AC-005-01；Q-UX2=A／UX-RQ-01=B1／UX-RQ-03／UX-RQ-04；§3.2／3.6～3.8 |
| `SD-AC-023` | **2026-11-12 已確認原則**：鏡位／人物 anchor／表情演出、前景遮擋、hotspot 由版本化內容驅動；AI 表情用共用壓縮指定單張大小且維持 2.5D 合成透明圖／遮罩品質；Web／Android 安全取景。化身正式採用後以 WS 變更通知按需讀取、同一句結束安全切換，**不以 DB 定時輪詢**，Round／WS／退出權威不變 | AC-005-01；UX-RQ-01=B1／UX-RQ-02；§3.3／3.6 |
| `SD-AC-024` | **UX-P1 已確認**：場景下緣 ADV 對話與可收合真人聊天區並存；手機輸入不遮臉、桌面可開側欄，真發送狀態、歷史、斷線及退出入口仍可操作 | AC-005-01／03；Q-UX3=B；§3.4 |
| `SD-AC-025` | **UX-P2 已確認**：場景物件熱區能進入書籤／書架等局部探索，跨尺寸位置正確、可返回場景、不因點擊就擅自提交真人選擇 | AC-005-01／03；Q-UX3=B；§3.4 |
| `SD-AC-026` | **UX-P3 已確認**：首場進店、書籤、支線與兩種結局具不同鏡頭／光色／轉場，可略過且不影響節點、表情與操作 | AC-005-01；Q-UX3=B；§3.4 |
| `SD-AC-027` | **UX-P4 已確認**：雨聲、環境及翻書／轉場聲、可控音量／靜音與等待微動效；播放失敗或平台拒絕自動播放時仍可完整操作，不假造真人狀態 | AC-005-01／03；Q-UX3=B；§3.4 |
| `SD-AC-028` | **UX-P5 已確認**：場景道具及兩結局對真合作提交給予不同回饋，明確區分送出中／已提交／未知／等待／結算，不替另一人作答或偽造已讀 | AC-005-01／03；Q-UX3=B；§3.4 |
| `SD-AC-029` | **全身化身保真與應用驗收**：16 款原角色經AI全身延伸、逐款視覺比對及使用者確認，保留身份／髮型／原衣裝／氣質與原 ID／原圖hash；不另加像素鎖回合成門檻；AI 初始每張候選為 3:4 全身，同人全身五表情與 Manifest 版本 ready；站立全身、半身／近景裁切均無缺腳、失真、接縫或糊臉；切換不產圖。坐姿／走路不算交付 | AC-005-01；UX-RQ-04；§3.8 |
| `SD-AC-030` | **非正式舊角色測資全清後再新體驗驗收**：新全身功能開發完、全新 Gate 前，僅在已核准非正式環境列出清單並清除舊選角、所有測試 AI 角色 D1／R2、候選／temp／舊表情包；保留本人照片、帳號／非角色 Profile 欄位、免費16款原畫；D1 revision／R2 多階段清理可安全重試，確認零孤兒後用全新全身角色跑 Web／Android，無半身升級／相容流程 | UX-AUDIT-RQ-01=CLEAN-RESET；§3.9 |

**階段及事實不可混算**：2026-11-12 新增的 **`SD-AC-021～030` 共十條**已依 Q-UX1～3、UX-RQ-01～04 與 UX-AUDIT-RQ-01=CLEAN-RESET 收斂驗收標準，**本次已補 BDD-080～115 共36場與對應新增 TDD ID**；**尚未進入新視覺實作或驗收**。原 187 項 TDD 的歷史完成比例**不能代表這十條新增視覺／角色重置已完成**。首發一場完整遊玩體驗通過，不代表原 MVP 10 個故事都完成；N=2／3 的選場測試只在相應實際有可玩故事時作正常驗收，不得把測試假故事當成玩家可用內容。既有規劃清單已整理為 [BDD 79 項](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md) 與 [TDD 187 項](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md)，原有部分功能已有實作，其真實驗證結果以 [Verification](../verification/SPEC-001-StoryDialogueAndExit-Verification.md) 為準；**上述79／187是2026-11-08歷史數字；2026-11-12本次決策追補後總數為115個BDD／295個TDD，所有新項皆未驗收**。

## 9. 已確認決策及本輪範圍

| ID | 已確認的選擇 | SDD 具體規則 |
|---|---|---|
| `SD-Q1=B` | 即時雙向 **WebSocket** | 現有 Cloudflare 部署採原生 Durable Objects Hibernation；固定標準 WS 事件協定＋單一 Application 通知埠，未來搬雲端僅換連線 Adapter／必要資料 Adapter；此時不另寫 SignalR Hub、gRPC 服務 |
| `SD-Q2=B` | 結束本輪要二次確認 | 「結束本輪」→說明原 pair 永久不能再配對→「確認結束」才正式結束；取消不影響 Round |
| `SD-Q3=A` | 結束後玩家不可回讀聊天／互動歷史 | 此份只實作 Round active 期間事件儲存及 ended 存取限制；**Housekeeping／History 表及資料保留政策整體交由未來獨立 MVP，不留任何本期規劃或實作項目** |
| `SD-Q4=B` | 配對成立當下鎖定興趣推薦候選，雙方選擇不同採原邀請方為主 | **N=min(3,當下可玩故事數)**：N=1 直接進劇情、N=2 雙方二選一、N=3 雙方三選一；N=0 不建立無內容 Round；人數與內容數決策不依賴登入先後 |
| `SD-GATE-01` | 先完整做一個劇情，人工試玩優化，再做下一場 | 首發 `scene-01 雨聲書店` 的完整章節、分支／互動、Web／Android 真人連線、等待／恢復／退出均須驗；這是原本明確確認的品質安排，不是額外的發布數量門檻 |
| `SD-MODULE-01` | 確認共用劇情引擎／觸發及跨場景互動模組 | 規則共用、遊玩互動執行實例隔離 |
| `SD-WAIT-01` | 確認非同步等待期間可繼續個人探索／自由聊天 | 不代替另一名真人回應，後續實際試玩再調整 |
| `SD-CONTENT-01` | 確認 D1 狀態＋R2 內容／素材＋用戶端按需載入 | 版本化 immutable manifest，擴至數百／上千故事仍共用引擎；定義／索引落在 `content_story_catalog` |
| `SD-DB-01` | **確認精簡且可多場資料層** | 兩張 Game 舊表不合併，`game_round_participants` 改名 `game_active_round_claims`、保留 Claim 唯一性；Round 新增 `last_event_seq` 和**第 1 場**候選 JSON；`game_story_sessions` 9 欄、`episode_seq` 與兩種唯一索引，後續場次候選／票／勝出全由帶 episode 的共用 Event 保存；互動只用 `story_session_id` FK；只新增 **4 張表** |
| `SD-NAMING-01` | **確認統一表名前綴** | `game_` 只存玩家實際遊戲執行狀態；`content_` 用於劇本／素材內容目錄；原 `game_story_catalog` 改為 `content_story_catalog`；不為命名目的增建其他表 |
| `Q-UX1=A` | **2026-11-12 確認第一人稱 2.5D ADV** | 固定主觀鏡位、分層合成、角色入景、必要視角切換與跨螢幕安全區；不要求自由 3D 場景／全身行走 |
| `Q-UX2=A` | **2026-11-12 確認預製五表情套組** | 免費16款及 AI 已選化身均需同人五表情並以劇本指令播放；不在真人聊天時即時 AI 生成或猜測情緒 |
| `Q-UX3=B` | **2026-11-12 確認 UX-P1～P5 全部納入首場** | 場景聊天／物件探索／運鏡光色／視聽氛圍／雙人互動回饋全部是 Gate B 實玩驗收，不可下修為建議項 |
| `UX-RQ-01=B1` | **確認前景阻擋製作五表情後一次採用** | 同一人物候選圖固定五表情標準；前景順序產生、採用期間前後端禁止切換角色；單張壓縮參數及透明品質檢查、全部通過才正式提交；成功表情永久依 avatar ID + spec version 重用，不因角色切換重產 |
| `UX-RQ-02=WS` | **確認事件驅動與安全時點切換** | 採用成功才通知 active Round，依 revision 只按需讀一次授權角色資訊，當前台詞結束且新資產備妥時切換；不做 DB 定時輪詢，重新入場／WS 重連才校正 |
| `UX-RQ-03=R2-MANIFEST` | **確認用私人 R2 版本化套組作完成權威** | `avatarAssetId + expressionSpecVersion + avatarAssetSpecVersion` 唯一定位；全身 master 和五表情驗證後才 CAS 標記 `ready`；正式回選只讀現成套組、Gemini 0 次；缺檔／hash 錯誤 fail-closed 不自動重產；D1 新增／修改表均 0；§3.7 |
| `UX-RQ-04=FULL-BODY` | **2026-11-12 確認全部正式化身改全身站姿** | 免費16款以既有已定稿圖片保留原有上半身、只補下半身與鞋；AI 首張候選即完整全身、B1 全身同人五表情；同一 master 支援站立遠景及安全中近景，坐下／走路另需 pose set；角色 ID 與 D1 Schema 不變；§3.8 |

**不存在「少於三個劇本先關閉正式選場／禁止使用」的門檻，也不設特別的單故事驗證開關或三場內容達標發布 Gate**。只有 N=0（根本沒有已發布可玩劇情）時不能讓玩家進入空遊戲。當第一個故事實際完成就可正常開始；增加第二場就自然進入雙人選擇流程，第三場以上推薦前三個。

本期不規劃 History schema、Housekeeping 流程或搬移規則；這是**明確排除範圍**而不是 SDD 待確認問題。本份 SDD 原規劃及 **SD-RQ-01=B／SD-RQ-02=A 均已由使用者確認**；只在文件階段規劃將來可擴充的 Session 資料模型，不提前實作第二場 UI 或開始流程。

## 10. 需求追溯與規劃交接狀態

- `US-005/AC-005-01～03` → 原 `SD-AC-002～007/012～020` ＋2026-11-12 已確認 `SD-AC-021～030`（含免費16款原上半身保真延伸、AI全身 master／五表情及開發後非正式舊角色清理）；`US-012/AC-012-02～04` → `SD-AC-008～011`；`US-020/AC-020-06～07` → `SD-AC-010～011`。本次跨 SPEC 對應 `AvatarAndPreferences AP-AC-017／018／022／025／026`。`AC-012-01` 留給 `SPEC-001-AffectionAndFeedback`。首發只做完一場，不代表全部 10 場已經交付。
- Phase 0／Phase 1：既有 MVP 及 8 份切分已確認，前三份 SPEC 的實作／驗收以各自正式 Verification 證據為準，不重做。
- **2026-11-12 體驗修訂 Phase 2～5 完成規劃交接**：`Q-UX1=A`（第一人稱2.5D）、`Q-UX2=A`（固定五表情）、`Q-UX3=B`（首場 UX-P1～P5）、`UX-RQ-01=B1`（前景阻擋）、`UX-RQ-02=WS`（事件通知，不輪詢DB）、`UX-RQ-03=R2-MANIFEST`（回選不重產）、`UX-RQ-04=FULL-BODY`（免費16款只往下延伸、AI首次全身）及 `UX-AUDIT-RQ-01=CLEAN-RESET`（新功能完成後非正式環境清舊角色，從零驗收）**全部已由使用者確認**。本 Story BDD新增36（總115）、TDD新增108（總295），RiskAudit新增9高4中；上游 Avatar SDD與BDD新增24（總97）、TDD新增120（總395）及RiskAudit新增8高4中已同步，原跨SPEC文件相依阻斷解除。**最新規劃 Ready for well-done，只表示已完成可實作的文件規劃；新視覺／全身素材／Gemini表情／D1 R2清理與Gate B均尚未實作或驗收，不可用舊版Passed代簽**。Gemini Lite仍待實測未切換，本次視覺D1新增／修改均0、原Story4新增表／2調整表不變；本輪未修改Runtime、原畫、DB、Story JSON。
- **Phase 2：已更新 SD-Q1～Q4、Cloudflare 可攜性邊界、1／2／3+ 劇本動態選場、原邀請方決勝及首發完整劇情驗收；依使用者最新確認將 SDD 新表由 6 減為 4、`game_` 運行／`content_` 內容命名分離、改名帳號占用表、Round 固定 Catalog ID、共用事件投票、Interaction 改 `story_session_id` FK。History／Housekeeping 留未來 MVP。**整份 SDD 已由使用者於 2026-11-08 明確確認**。Phase 3 BDD/TDD 與 Phase 4 RiskAudit 依 perfect-plan 接續產出；Phase 5 必須等風險問題經使用者確認後才能標為 Ready。**
- **Phase 3／4／5**：使用者已確認 `SD-RQ-01=B`（可儲存多獨立劇本，本期只啟動第 1 場）與 `SD-RQ-02=A`（非正式舊遊戲測資於 Well-Done 實作時安全清除重建）；[BDD](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md) 完成 **79 場景**、[TDD](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md) 完成 **187 個待執行測試 ID**、[RiskAudit](SPEC-001-StoryDialogueAndExit-RiskAudit.md) 10 高＋6 中風險逐項處置與 2 項缺漏回寫。**Phase 5：Ready for well-done（只代表可開始開發，實作驗收 0/187）**，完整交接見 TDD 末尾。只處理此 SPEC，不進下一份 SPEC 或程式實作。
