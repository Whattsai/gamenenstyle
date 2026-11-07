# SPEC-001-StoryDialogueAndExit：雙人 ADV 劇情、對話與平順退出

**功能 ID**：`SPEC-001-StoryDialogueAndExit`
**來源**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
**優先級**：高；八份 SPEC 的第 4 份
**狀態**：SDD 已由使用者於 2026-11-08 明確確認；perfect-plan Phase 3／4 文件規劃中，未進行程式實作
**更新日期**：2026-11-07
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

`contracts/story-scenes.json` 作為單一版本化內容來源，保留 sceneId、對應 tag codes、time、place、event、choiceId／label／text。被使用的版本不能改寫舊輪台詞語意。Web／Android 同一套 React Native ADV 元件，依 `prototype.v2` 粉玫瑰、深紫、半透明面板、3:4 立繪與逐句敘事風格；每場有專屬場景視覺或明確設計替代，不將十場偷換成一個固定背景、一組文案。
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

**現有實作基線**：`0004_matching_sessions.sql` 目前是 `game_rounds`（7 欄）、`game_round_participants`（4 欄），另有 `match_invitations`（11 欄）、`match_conditions`（10 欄）。本 SPEC **不合併兩張 Game 表、不另造配對占用交易框架**。將 `game_round_participants` **僅更名**為 `game_active_round_claims`，維持 `participant_id`、`account_id UNIQUE`、`round_id`、`created_at` 四欄與原子釋放機制。`game_rounds` 的 `account_low_id`／`account_high_id` 是固定排序的兩個參與者，**不是邀請／受邀身分**；真正發起者由 `match_invitations.initiator_account_id` 查得，不重複新增欄位。更名會在**實作階段**同步更新 matching-commands、維運工具、overview 和測試；本次只改 SDD。

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
7. **0005 向前 Schema 建置方式**：既有 `game_rounds` 沒有候選 JSON；SQLite 不能直接以 `ALTER TABLE ADD COLUMN ... TEXT NOT NULL` 且沒有非 NULL DEFAULT 的方式安全升級。因已確認舊遊戲資料無須保留，**Well-Done 在核實非正式環境且受控清空全部舊遊戲關聯列後，使用向前 migration 重建空的 `game_rounds` 定義**（7→9 欄；不是修改既有 `0004` migration），並將已清空的占用表**更名**為 `game_active_round_claims`、保留原四欄與唯一保障。執行前須先明確檢查 Round／占用／相關邀請已清空；任何非空或未知環境 fail-closed，不能偷渡 nullable 欄位或塞假版次，不得影響帳號/Profile／其他模組。真 Miniflare D1 驗證 0004→0005 與零列／外鍵／失敗回滾；本輪不跑 migration。


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

**Gate A（引擎／驗證）**：首發只有一個完整可玩的正式故事時，正常配對後**不需要任何額外模式**，直接進 `scene-01`；對 N=2/3 的選擇決策可先用隔離單元／真 D1 測試資料驗證規則，隨著第 2 個真劇情發布就自然在玩家端二選一，不另設特殊上線 Gate。只有首發場景的 `node/branch/interaction/story_completed`、即時協作、資料一致、安全和故障案例都通過，才能聲稱「首發可驗證」；其餘九場仍是 backlog。

**Gate B（玩家體驗）**：使用者人工實際玩完整第一場並確認劇情節奏、場景視覺、角色相對比例、等待順暢、音效、支線豐富度、對話 UX 及分支變化；未取得確認前，**不進入剩餘九場製作／Well-Done 擴充**。可在此 Gate 反覆優化第一場，不用為趕總數把一場故事拆成假通過。


## 7. 安全、效能與驗證計畫

- **實際可玩故事數量測試**：第 1 場 N=0 時不接受也不建空 Round；N=1 同批鎖定單一 `catalogId` 並初始化 `(round_id,episode_seq=1)` StorySession，N=2 二選一、N=3 三選一、N>3 只鎖定前三個。初始候選 JSON 有序合法互異限 1..3、Profile／Catalog 競態全 batch rollback、Retired 版僅舊 Round 可讀；另外以真 Miniflare 驗證第 2／3 場的多 Session**資料結構**可保存，不代表 App 已支援選第 2 場。
- **選擇與結算測試**：共同／個別興趣排名、穩定同分排序與安全投影；**不建立 Offers／Votes 專用表**。N≥2 真人投票／改票只能追加共用 Round event，每個人的最後有效事件才參與結算；同選、異選採原 `initiator_account_id` 邀請方、兩端同時提交、舊 Request 重播不能覆蓋新票、結算後不可改、單邊未選不補票、與 end 競態均以真 D1 guard／CAS／回滾驗證。
- **跨平台／可搬遷邊界**：App／Application 的 WebSocket JSON 契約、Room event、冪等／補漏與 `IRoundRealtimeNotifier` 不含 Cloudflare SDK／DO 型別；測 portable notifier fake＋現有 Cloudflare Adapter 真 Upgrade／DO hibernation／告警／reconnect。SignalR 及 gRPC 為比較過的替代協定，不在本 SPEC 再做第二套傳輸。另以真 D1／Domain 隔離測試驗證同 Round 的第 1／2 場 Session 與 episode event，不把第 2 場 E2E 當成本期功能；第一場以外的入口保持封閉。
- **安全測試**：受限 WebSocket ticket 過期／一次消費／冒用、Session 撤銷、非成員、frame 大小／backpressure、限流與重連；真 D1 guard 驗 active Round、兩位 Claims、候選 ID 屬**對應 episode**、同 `(round_id,episode_seq)` 勝出只建一次、同輪最多一筆 `chapter_status='playing'`、`game_interaction_instances.story_session_id` FK 及全 Round 唯一 eventSeq。跨場舊選票／node／互動不能作用於新場；**本期 App/API/WS 嚴禁 `episodeSeq>1` 的啟動或操作**。未結算時 Events Query／WS 不得回另一人具體 `catalogId` payload，不能只前端隱藏。
- **雙端 E2E**：本地 Web↔Web、Android↔Web 兩個獨立真帳號實測已存在的劇情與完整分支；有人延遲回覆、斷線／回焦、互動等待、章節完成後仍可聊天、二次確認結束與原 pair 永久互斥。當只有一場時直接演出，第二場實際可玩後自然加入雙方選擇 E2E，不為驗證湊假劇本。iOS 依 D-052 暫緩、無障礙專項依 D-051 暫不納入。
- **效能與成本**：量測 commit→推播可視延遲、DO Hibernation 喚醒、Container 冷啟動、D1 讀寫、R2 資源傳輸及 Android 載入；未取得真結果前不可宣稱已通過。遊戲素材需合法使用，原型圖片不能視為已有商用授權。
- **不包含**：任何聊天／互動記錄搬移到 History 表、Housekeeping、清理排程及保留天數決策，使用者明確指定交由未來獨立 MVP；此處只驗**當輪使用期間的寫入、授權與回復**。本輪只修改 SDD Markdown，不執行 migration／部署／程式碼。

## 8. 本次 SPEC 可測試驗收條件（按實際故事數量運作）

| ID | 驗收行為 | MVP／使用者決策 |
|---|---|---|
| `SD-AC-001` | 只有 active Round 真兩人成員與有效 Session 可進場；第三人／撤銷 Session 被拒 | AC-004-02、AC-012-04 |
| `SD-AC-002` | 接受配對同筆 D1 原子交易依當下雙方興趣排名，鎖定 `N=min(3,實際可玩故事數)` 個故事與版本；N=0 不產生空 Round，N=1 直接進入，N=2／3 分別二選一／三選一 | AC-005-02；SD-Q4 |
| `SD-AC-003` | 首發故事完整背景／3:4 角色立繪／旁白／對話氣泡／音效與 ADV 節點演出；不假扮真人 | AC-005-01 |
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

**階段及事實不可混算**：首發一場完整遊玩體驗通過，不代表原 MVP 10 個故事都完成；N=2／3 的選場測試只在相應實際有可玩故事時作正常驗收，不得把測試假故事當成玩家可用內容。已建立 [BDD 71 項](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md) 與 [TDD 163 項](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md) 的規劃清單，**並非已實作或已驗收**。

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

**不存在「少於三個劇本先關閉正式選場／禁止使用」的門檻，也不設特別的單故事驗證開關或三場內容達標發布 Gate**。只有 N=0（根本沒有已發布可玩劇情）時不能讓玩家進入空遊戲。當第一個故事實際完成就可正常開始；增加第二場就自然進入雙人選擇流程，第三場以上推薦前三個。

本期不規劃 History schema、Housekeeping 流程或搬移規則；這是**明確排除範圍**而不是 SDD 待確認問題。本份 SDD 原規劃及 **SD-RQ-01=B／SD-RQ-02=A 均已由使用者確認**；只在文件階段規劃將來可擴充的 Session 資料模型，不提前實作第二場 UI 或開始流程。

## 10. 需求追溯與規劃交接狀態

- `US-005/AC-005-01～03` → `SD-AC-002～007/012～020`；`US-012/AC-012-02～04` → `SD-AC-008～011`；`US-020/AC-020-06～07` → `SD-AC-010～011`。`AC-012-01` 留給 `SPEC-001-AffectionAndFeedback`。首發只做完一場，不代表全部 10 場已經交付。
- Phase 0／Phase 1：既有 MVP 及 8 份切分已確認，前三份 SPEC 的實作／驗收以各自正式 Verification 證據為準，不重做。
- **Phase 2：已更新 SD-Q1～Q4、Cloudflare 可攜性邊界、1／2／3+ 劇本動態選場、原邀請方決勝及首發完整劇情驗收；依使用者最新確認將 SDD 新表由 6 減為 4、`game_` 運行／`content_` 內容命名分離、改名帳號占用表、Round 固定 Catalog ID、共用事件投票、Interaction 改 `story_session_id` FK。History／Housekeeping 留未來 MVP。**整份 SDD 已由使用者於 2026-11-08 明確確認**。Phase 3 BDD/TDD 與 Phase 4 RiskAudit 依 perfect-plan 接續產出；Phase 5 必須等風險問題經使用者確認後才能標為 Ready。**
- **Phase 3／4／5**：使用者已確認 `SD-RQ-01=B`（可儲存多獨立劇本，本期只啟動第 1 場）與 `SD-RQ-02=A`（非正式舊遊戲測資於 Well-Done 實作時安全清除重建）；[BDD](../bdd/SPEC-001-StoryDialogueAndExit-BDD.md) 完成 **79 場景**、[TDD](../tdd/SPEC-001-StoryDialogueAndExit-TDD.md) 完成 **187 個待執行測試 ID**、[RiskAudit](SPEC-001-StoryDialogueAndExit-RiskAudit.md) 10 高＋6 中風險逐項處置與 2 項缺漏回寫。**Phase 5：Ready for well-done（只代表可開始開發，實作驗收 0/187）**，完整交接見 TDD 末尾。只處理此 SPEC，不進下一份 SPEC 或程式實作。
