# SPEC-001-RainBookshopV4：雨聲書店 V4 完整互動劇情

**功能 ID**：SPEC-001-RainBookshopV4  
**來源**：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md) AC-005-36～46、[V4 作者草案（劇情與文案唯一權威）](../requirements/rain-bookshop-v4-draft.json)
**順序**：第6份；依賴 已結案的 [SceneEventFramework](../alldonejobs/specs/SPEC-001-SceneEventFramework.md)、既有配對／聊天／化身；本 SPEC 結案後才進 AffectionAndFeedback。  
**優先級**：高；**負責人**：DatingHigh 開發／使用者實玩驗收。  
**狀態**：SDD／BDD／TDD／RiskAudit 已確認並補強；Ready for well-done（規劃交接，尚未開發）。執行狀態見 [Verification](../verification/SPEC-001-RainBookshopV4-Verification.md)。

## 1. 目標與範圍

將已完成的 V3 按鈕式 ADV 提升為第一人稱可探索、主動進水、雙向限時協作及四種結局的完整雨聲書店。V3 已有的配對、獨立 Track、原位閱讀、權威共享世界、自然完成、聊天、重玩與安全退出是回歸基線；V3 未完整核證項已依使用者決策移除，不重做舊版斷言。V4 保留直接必要回歸：actor-scoped HTTP/WS/R2 與未分享線索隔離、真人提交及雙 Track／共享 D1 CAS／receipt、原位預覽不提交與鏡位／hitMask／拖放權威、缺素材拒發與失敗復原、靜態角色身份／ready／授權／零重產、雙端重連與章節完成／聊天／雙同意下一場／退出、版本釘選與安全清理。真 Gemini 品質／成本及原生必要矩陣只驗 V4 實際需要的靜態路徑；不新增舊版專項或完整 Puppet 前置。V4 所有劇情、文案與玩家可見行為以 `rain-bookshop-v4-draft.json` 為唯一內容權威；MVP、SPEC 的摘要若有衝突，以草案詳細定義為準。不能縮寫成示例、任意省略、改寫或以 V3 舊文案替代。採既有 16 款免費全身、四姿態／五表情，不以完整 Puppet 為前置。暫不開發其他九條、好感度／名片／問卷（後續 SPEC）、AI 動態主線、History housekeeping、iOS／無障礙專項。

## 2. 功能需求與操作流程

正式內容必須完整承接作者 JSON 的 `scene` 與 `narrative`（包括 `areas`、`cameras`、`assetManifestPlan`、`audio`、`books`、`ambientInteractables`、`npcs`、`tracks`、`personalBindings`、`sharedModules`、`endings`、`dynamicChatSuggestions`、`memoryReceipt`、`uiCopy`），保留全部角色對白、玩家選項、觸發與分支、書籍及彩蛋文字、題目和 UI 文案。SDD 正式化只允許必要的 Schema、技術綁定、真素材 metadata 及權威執行機制；不得改變劇情語意或玩家可見文字。草案自身矛盾、缺漏、權利或安全疑義須提出並取得使用者確認後才能調整。

| 階段 | 玩家行為及權威結果 |
|---|---|
| 入店 | I 熟客、A 避雨生客；點門把、傘桶，兩人各自進度、原位輪廓提示一次；左右導航、小地圖可收合，暖金點僅合法新事件／本人未探索彩蛋；長按空白短暫掃視，不以按鈕列表替代 |
| 探索 | 五區散布16經典＋4盲書，橫滑書牆特寫、撕封、原位開合；合法原創自譯／3–4頁試讀、推薦卡、匿名便條、各書三共鳴選項、三句書籤、錯抽吐槽；本人興趣推薦不洩露他人；閱讀預覽不提交 |
| 空間等待 | 黑膠3曲同步、今日特調黑板、擦霧雨窗3階段／4符號、訪客冊5則、阿澄3話題；非阻塞，拒絕互動仍可到導演節點 |
| 破冰 | 同書／異書分支；近遠拖面紙、借書、輕扶書籤留白；I 留白 A 可主動；A 獨處 I 真正退讓；真人明確發言才寫聊天；warm-track 從4題雨天卡依場次種子隨機抽1題，兩人私密提交後同時揭曉；8情境24句建議由實際狀態篩選 |
| 暴雨 | 兩人達到各自前半節奏點時伺服器恰好一次主動中斷，閃電／斷電／黑膠停止／門縫進水；阿澄赴門口防洪並託付任務；不要求玩家點雨情按鈕 |
| 救書 | 雙方接手電筒就位後才開始90秒；兩組題隨機釘選一組，每組4本跨乾燥區；暈開清單→對方比對→抽書／上滑傳遞→防潮袋／裝櫃，後半角色反轉及墊底／三態鎖扣；錯抽可依草案修正；快捷喊話；15秒斷線／閒置水位暫緩保護 |
| 結算 | 救完4本S（布丁），到時2–3本A（拿鐵／毛巾），0–1本B強制撤離屋簷；安全優先，不允許危險區續做；S/A 依已提交雙方意願走三結局，B 專屬第四結局 |
| 收尾 | 阿澄依S/A×聊開/慢熟回應；S/A 書籤三選一或選填20字純文字；留下一本書的名字後可原位翻對方桌上書；今日借閱小票含黑膠、書、救書統計、4稱號、X/4、4彩蛋印章，無真實個資；Session completed、Round active、可聊天、雙同意重玩／安全退出 |

## 3. SDD 技術方案（已確認）

### 3.0 現行實作盤點與變更邊界

本輪以現行程式／migration 而非僅 V3 文件判斷；以下是設計提案，不代表已實作 V4。

| 既有入口 | 可沿用的實際能力 | V4 最小必要差異 |
|---|---|---|
| `Domain/SceneEventTrackPolicy.cs`、`SceneEventFrameworkPolicies.cs` | `SceneTrackContent`、`TrackState`、`TrackBindingDefinition`、`TrackActionRequest`、`TrackTransition`、角色條件／選場／雙方同意 | 現有 Compile 只接受 scene-event.v2，動作 params 為固定 ID 字串；增版本化、有限型別條件與多步共享事件／系統轉移；不另造引擎 |
| `Application/SceneEventFrameworkService.cs` | Content／State／Project／CommandAsync、同 request receipt、本人條件／revision、現有 notifier | 抽取共用已釘選內容的轉移／投影入口，加入系統事件 reconcile、分階段建議與 actor-scoped 模組投影；目前 suggestions 直接取 Narrative 靜態陣列 |
| `cloudflare/src/scene-event-track-commands.ts` | planTrackAction／executeTrackAction，單一 instance、本人及必要對方 Progress、World CAS、receipt、areaGuards、observedSharedRevision | 現有 state 嚴格為 enteredNodeIndexes／submissions／endingId，每 role 一筆 fact，且必須有本人提交；不能直接承載持續計時、多步操作或無玩家的系統提交。擴充既有事件資料契約與固定系統轉移 command，保留原安全 guard |
| `room-socket.ts` | Hibernation DO、票券、授權 WS、room.snapshot_hint | 目前 alarm 只清 nonce，連線時 setAlarm(now+31000)；改共用最早到期排程，保留 nonce GC，增加 timeout／idle／recovery reconcile，不能讓新連線覆蓋更早 deadline |
| `scene-event-track-content.ts`／`scene-event-track-graph.ts`／Publisher | Zod 嚴格解析、固定參考、雙角色可達性及 50,000 state 上限 | 現行 speaker 僅旁白／店員・NPC，params 固定 ID，演出 step union 固定；增加內容版別與受控 speaker、手勢／演出／多步模組，不能用任意字串條件或腳本 |
| `StoryExperienceScreen.tsx`／`scene-event-track.ts`／`SceneEventActions.tsx` | 共用 transport、合法 action + revision payload、cue fence、現有選項／移動入口 | V4 renderer 由內容能力選用；現有 isTrackExperience 只認 v2，擴充相容型別；V4 不顯示舊移動按鈕海，保留合法說話、退出、聊天 |
| `EmbeddedSceneStage.tsx`／`SceneWorldObjects.tsx`／`SceneBook.tsx` | 原位命中／場景圖層／PanResponder 拖放／本地翻頁 | 重用座標、hitMask、拖放與書籍展開動畫，補橫滑特寫、撕封／擦霧／上滑／長按／小地圖；現有 SceneBook 顯示固定「心動迴路原創試讀」，V4 改依草案可見文案，不能改寫書籍原文 |
| `tools/scene-event-content-policy.mjs`／`scene-event-publish-policy.mjs`／`rain-bookshop-v3-policy.mjs` | buildSceneEventTrackBundle、不可變 R2、Catalog 發布、正式首場 policy | V3 policy 寫死 v1/v3、iv3/av3 及舊結局；以版本分派的正式作者校驗承接 V4，舊 V3 仍可讀，Gate B 後移除無用舊版 policy／資產，不改寫原 SHA |
| 0005／0007 migration | 21 張表；事件 actor_account_id/client_request_id 可同為 NULL；instance UNIQUE(session,binding,scope)、CAS revision、JSON 16384 上限 | **建議 0 新表、0 新欄、0 Trigger**；系統事件可用 NULL actor 原有契約，唯一性由 instance CAS／固定 operation identity 判定，不造假真人、不要依 NULL UNIQUE 去重。DB 時鐘原子驗證及容量須實測，失敗才提出最小 migration |

所有新名稱均為 SDD 提案，非現行已存在的 API 或型別。既有 DDD 分層、private bridge、Session／Round 生命週期、真人化身與帳號授權保持；不引入 SignalR、新資料庫、獨立計時微服務、另一個 DO 或新的遊戲框架。

### 3.1 分層／DDD

沿用 Round/StorySession 聚合邊界與兩筆 ParticipantProgress，D1 為提交事實唯一權威。Domain 定義導演階段、救書題組、Ready/Running/Paused/Settled、Deadline、救援書籍狀態、結局與合法手勢意圖（不信任客戶端座標、剩餘時間、分數、角色或他人答案）；Application 依目前權威 Track/world 驗條件、決定狀態及 actor-scoped DTO；Infrastructure 沿用固定 private bridge；Worker 固定 prepared SQL CAS/batch、immutable R2 發布；Room DO 僅排程喚醒／連線／通知，提交由同一 Application 路徑完成。Web/Android 共用 scene renderer，手勢辨識與動畫不直接改世界，禁止 storyId 特例散落；共用受控 DSL／renderer 能力供未來劇情與小遊戲重用，不提前做其他內容。

### 3.2 導演與計時（建議）

兩人最後必要節奏點提交時，在同一 D1 交易中檢查條件與唯一事件 receipt、建立導演事件、進入 ready 狀態，避免兩個 actor 觸發兩次。前半彩蛋不做必要門檻。雙 ready 原子啟動，採伺服器時間 UTC deadline，不採兩端本地時間；D1 持久 deadline／暫緩時剩餘時長與 revision，DO alarm 與 HTTP 讀取／操作補償觸發同一受控結算；DO 冷啟動／重複 alarm 不重置秒數。以線性化交易時刻判斷最後一本：deadline 前合法提交可計入，等於或超過 deadline 先結算，4本達成即 S。結算與退出／雙人同時操作 CAS 競爭只能有一個有效結果，重送回原 receipt。

15 秒保護依草案 idleGraceSeconds=15 與 pausedNotice：建議有效斷線／閒置到門檻後水位暫緩；保存剩餘時間，雙方恢復可操作後才恢復。斷線指該 role 無任何有效授權連線，重連／權杖更新的短暫空窗依門檻處理；已達到 deadline 不得靠遲到暫緩逆轉結算。依 RQ-01／RA-Q1，閒置者實際操作或斷線者返回可操作畫面後自動繼續；仍活動方無須另操作，兩方皆閒置則兩方皆須重新參與。第一次恢復操作只同步、不計救書成果；允許反覆暫緩且不限制次數；有效活動為合法玩家操作；不把 heartbeat 當真人操作。安全退出任何時刻可操作，不強制復歸才能退出。

### 3.3 API／DTO

現有 `POST /game-rounds/{id}/story/event`、`story.event.submit` 共用嚴格 envelope：clientRequestId、storySessionId、bindingId、actionId、params、expectedTrackRevision，必要時 expectedSharedRevision/expectedEventRevision。新增動作以內容白名單、每種 params schema 驗證；例：`params:{objectId:"..." }`（依正式內容允許值），不得 client 指定結果、秒數或其他角色。GET experience 追加僅本人可見的探索物件／可選書內容、手勢能力／合法操作、public cue、救援投影（phase、serverNow、deadline 或剩餘時長、已完成數、本人合法題目視圖）、結局／小票安全投影。導演、暫緩與結算通知由既有安全事件／序號及 snapshot 補漏，新增 envelope type 只在正式契約確認後。聊天建議為本地選填草稿，快捷呼喊不寫成假真人聊天。已知409重讀權威狀態，不自動重送新 request；未知結果同ID查 receipt。失權立即清投影、圖片、私有書籤／線索及舊 cue。

### 3.4 資料設計

現行 0007、21表、零 Trigger；六張場景相關表與 `game_story_sessions.world_state_json`、`game_event_instances`、`game_round_events`、兩筆 participant progress 可承載目前狀態及具冪等的事件。提案優先使用既有有限 WorldState/Event state 保存題組ID、節奏、ready、deadline、pause、已救物件／結算、符號／小票必要事實；不得把全部書全文、素材、他人私密興趣或完整歷史放進 world JSON。現行 JSON 上限16384字元／DSL深度8、64節點、每組32，內容512KiB/四層4MiB、資產8MiB限制須以 V4 實際草案與可達性量測，不任意提高或拆掉 guard。若原欄位無法在真 D1 同交易核對 deadline／CAS 或安全持久化，才在 SDD 確認後調整最少必要 schema，零 Trigger；不先承諾新表。結局 X/4 僅計 V4 伺服器已提交的合法完成記錄；依 RQ-02 僅同一 pair 目前 Round 同版 V4 的不同已完成 ending，含本場，不計 V3。

### 3.5 素材、UI 與安全

Scene `rain-bookshop/v4`、Narrative `rain-bookshop-before-rain-stops/v2`，草案 `scene-event.v3-draft` 不是正式 schema；確認後實作正式版本、生成／檢查 JSON、不可變 SHA、byteLength、實際坐標／hitMasks。80項草案素材（18 可沿用、62新項；1 image-set、58 image、21 audio；image-set 不等於單張圖）及全部8區／鏡位依作者資料逐項核對。共享素材只存一份，禁止以舊版 placeholder 冒充。Web／Android 手勢：同一 camera transform、pointer/touch hit test、短點／長按／拖放／橫滑互斥、離開原位取消、快速重按不重複提交、畫面縮放裁切不越權；手勢成功且 server 確認後才顯示權威結果，失敗還原。聲音仍由本人開啟、背景停止、不自動恢復；同步選曲不等於強制替對方播放。私人興趣貼紙只本人，兩人答案先私有後共同揭曉；書籤選填短語以現行 Unicode scalar／控制字元／HTML 拒絕契約、20字限制，無真人照片、真實姓名或未授權個資進小票。16本經典逐本確認來源公有領域與使用地法域，僅原創／合法自譯，不取商業譯文或現代封面。保留已核准16款角色外觀、四姿態五表情、私人包完整性／採用、失權、零重產；真 Gemini 質量成本證據及原生必要矩陣尚未全驗，不宣稱已通過。

### 3.6 作者草案編譯、完整性與事件責任

作者來源固定為 `docs/requirements/rain-bookshop-v4-draft.json`，SHA-256 `b5c18f6762c87e25e1e83deb5769d19dc170c94a69bd6c1cdb15fe34b6809d95`（本輪讀取 150743 bytes）。原文不動。草案 `scene-event.v3-draft` 並非可直接發布契約；正式提案採 `scene-event.v3`，既有 v2 reader 與 v3 同一套引擎共用安全基礎，直到 Gate B 清舊。Scene／Narrative／EventDefinition 仍分離，不把草案文字直接當程式或 DSL；保留原 ID 或以可逆 mapping 對應，技術生成的 entry／binding／event ID 必須有來源。原始字串逐 Unicode scalar 比對，不 trim／改標點／換 speaker，JSON escape 差異不算改文案；素材 SHA、技術欄位、合法 DSL 是編譯產物。MCP 顯示的少數欄位有遮罩，實作時應由工作區直接使用原檔做完整性檢查，不可將遮罩當內容。

| 作者 JSON 來源（以 JSON path 及 ID 追溯） | 本次核對數量及實作目標 | 對應 AC |
|---|---|---|
| scene.areas / cameras / assetManifestPlan / audio | 8 Area、80 素材項（18 reuse／62 new；1 image-set、58 image、21 audio），正式場景、鏡位、物件及音效 | 001、003、012、015 |
| scene.books | 20 書（16 經典、4 盲書）；封面、推薦卡、全文頁、匿名便條、書籤三句、共鳴、錯書回饋逐書保留 | 002、004、008、010、015 |
| scene.ambientInteractables / npcs | 4 場景物件、阿澄 3 話題（合計5項等待互動）；場景事件、共享曲目／霧窗符號、本人探索 | 003、006、011、015 |
| narrative.tracks.inviter / acceptor | I 15、A 13 節點；28 節點均須可達並核對原文，入口 iv4-01/av4-01 | 001、004、006、007、015 |
| narrative.personalBindings | 9 個個人 binding，招呼、選書、共鳴、接近、面紙接收與回覆、A 主動；補技術 edge 不造新故事 | 002、004、006、015 |
| sharedModules.questionCard | 4 題，warm-track 才開；伺服器釘選、本人私密提交、同時揭曉；完成才到 iv4-warm／av4-warm | 005、007、015 |
| sharedModules.directorFloodInterrupt / rescueReadyGate | 原始 trigger：I 到 warm/respect 且 A 到 warm/quiet；warm 節奏點在提問卡完成後，不能跳卡；原始7步演出及台詞、雙 ready | 006～008、015 |
| sharedModules.timedCoopRescue | 90 秒、2 組各4本、雙人各6句快捷、4 水位播報、15秒保護、S/A/B 三級 | 008、009、012、015 |
| sharedModules.clerkAftermath / bookmarkRitual / finalWish、endings | 4 組致謝、每書3句／選填20字、雙方3種意願、4 結局 | 006、010、011、015 |
| dynamicChatSuggestions / memoryReceipt / uiCopy | 8×3 原句、4 稱號、4 印章、4 結局、14 組 UI 欄位（含巢狀 guidance） | 005、011、015 |

發布前以作者來源與正式產物建立機器可檢查的完整性清單（既有內容／發布工具承接；不要另外創建流水帳），逐項檢查原文、引用、角色、可達轉移、每組素材、條件及投影；相同節點原文不得被拼湊替代；缺 ID、未映射、文字差異、未知技術 operator、壞 SHA 均 fail closed。兩個不同作品的版權或草案缺漏不是技術轉換可私改的理由。完整性驗證在 BDD/TDD 作獨立 AC，不只比較節點總數。資產正式發布的實際 bytes、解碼、尺寸、座標、hitMask 仍須製作後驗；目前只量作者原檔，不代表正式分檔／狀態尺寸或 graph 已通過。

### 3.7 權威狀態、資料模型與計時交易

建議資料表維持 0007；各欄位均為**既有 JSON 裡的提案欄位**，非 DB 新欄。沿用 `game_story_sessions.world_state_json` 的 objects／flags 及 shared_revision、`game_event_instances.state_json` 的既有 submission fact，v3 才允許白名單 typed module state；不把私密答案塞入 public World。JSON 由 Domain 與 Worker 共同校驗，v2 舊資料仍通過原 validator。

| 現有資料位置 | V4 最小狀態 | 保護 |
|---|---|---|
| game_story_participant_progress | 既有兩筆 role、node、Area、revision | 未提交不得代動另一人；共享完成只走合法轉移 |
| world_state_json | 公開物件狀態、公開曲目／水位階段、已分享符號／線索的必要 ID、公開 cue；不重複保存完整書籍與文案 | 共享 revision；不得放私人答案、原始個資 |
| game_event_instances (各 binding) | typed state：選書／共鳴、本人探索或盲書揭封、questionId 與各 role 私密答案、分享／見證、bookmark／wish 等分開有限 module state | 各 instance revision；私有 state 依 role 投影，完成條件及 disclosure 由 Domain 決定 |
| game_event_instances (sv4-rescue-coop shared) | setId、phase、ready role mask、deadlineAt 或 pausedRemainingMs、roleActivityAt、pause generation、step 1..4、stage/holder/slot/latchIndex、rescuedCount、grade、settledAt、已播水位 mask；ID 引用原題組不存全文 | 固定 finite state；每步 CAS；phase 與欄位互斥校驗；S 即刻完成、A/B deadline 結算 |
| game_round_events | 既有玩家 receipt／eventSeq；系統事件 actor 和 client_request_id 都 NULL，payload 只含安全結果／operation identity；歷史 X/4 建議查完成 Session 對應的 V4 ending ID，不新增累計表 | 系統 transition 在 instance/Session CAS 與 eventSeq 同批；禁止以 NULL UNIQUE 當冪等；私密內容不經共用 event feed 發送 |

狀態機：前半雙 Track → director once → ready (雙 ready 才 running) → running ↔ paused → settled(S/A/B)；S/A → bookmark → 兩份 finalWish → 既有自然完成；B → 直接屋簷 Ending；任何階段 Round end 均優先阻止後續操作、取消未完成 instance。director 可附最後真人節奏提交同批；若現有單一 instance commit 不足，擴充限定的原子 plan，而非兩次不一致交易；系統 reconcile 可補遺漏但不得出現二次演出。

救書每本嚴格依題組的 step：A 可看本步濕清單、可明確分享；I 在合法乾燥區抽取正確書、上滑傳給 A；A 接收／裝袋／放合法 slot；第3本驗 bottom shelf，第4本驗 top shelf 與左扣→右扣→seal，只有完整提交才增加 rescuedCount。錯書、錯位、錯序回草案原文，不增加成功數；錯扣僅重置本次鎖扣順序，已放書、已救數保留，不額外扣秒；暫緩或重連保持權威 holder／slot／latchIndex。不洩露未分享答案。依 RA-Q2，題組 A 在 shelves 的兩本書為不同取書位置，不要求四個不同 Area。書 ID、slot ID 來自合法投影，動作不信任像素。多步 module 不是覆寫同 role 最後提交的舊 fact；每步有當前 state、順序、role、holder、revision 及同 request receipt。重複合法互動（切歌、符號、快捷）不使用一次性 completed binding 模擬；用有界目前狀態與既有 event seq，原子重送不產生二次效果。

伺服器時間採 Unix milliseconds（現有 DB 語意）；90 秒以 D1 交易線性化時間為準，SQL guard 須在同批以已核實真 Miniflare D1 支援的資料庫時間函式判斷 `now < deadlineAt`；不可只在 HTTP 或 DO 啟動時取時間後無界等待。D1 時間精度／原子條件必須實測，不可使用 client time；若 SQLite/D1 不能證明毫秒交易 guard，先停下提出等效最小方案，不能降低判定。deadline 前最後一本完整封箱即 S；等於／晚於 deadline 不接受後續救書，已救 2–3=A、0–1=B。畫面秒數使用 ceil(剩餘毫秒/1000)，0 不代表 client 有結算權；水位階段依 75/50/30/15 秒門檻一次投影，延遲喚醒不追播過期 cue。草案沒有四本且 remainingSeconds=0 的條件；採上述「最後一本須嚴格早於 deadline」可使該狀態不可達，依已確認 RQ-01 固定此行為。

DO alarm 是喚醒，不是時間真相。共用排程取 nonce 清理／當前 session deadline／idle 檢查的最早時刻，存最小 round/session/generation 提示；重啟以 D1 重建而非重設倒數。提案新增固定 private system reconcile command（名稱 `story.framework.system.reconcile`，未存在），以既有 Worker/Container 信任邊界調用共用 Application/Domain 轉移，不帶假玩家憑證、無公開端點、禁止任意 state 或分數；SQL 驗最新 active Round、正確兩 claims／Session／釘選版本／事件 phase／revision，並在同批寫 D1、原 event seq、結案／receipt。DO 失敗／通知丟失時，合法 experience 讀取與遊戲操作先 reconcile 當前狀態；GET 的補償僅能完成應已發生的權威時間轉移，不代表代玩家提交，cache no-store。當 round 已結束、Session 改變、phase 不匹配或 alarm 重複時不再變動；不能延後退出。發生 R2／依賴故障保留 D1、回現有503，重試同一狀態、不假成功。若通知未送達，既有 reconnect/snapshot_hint 補漏。

### 3.8 API／DTO 詳細提案（不增加公開路由）

沿用現有 `POST /api/v1/game-rounds/{id}/story/event` 及同 payload 的 `story.event.submit`，`GET /api/v1/game-rounds/{id}/experience` 既有 experience、event feed、chat、next、end、ticket 及授權素材。新能力放正式 v3 白名單 typed action，不把 draft 的自然語言當 command。以下 request／response 只示意技術 envelope、識別字為提案，並非新增劇本或文案；正式 action ID 由編譯 mapping 固定。

```json
{
  "clientRequestId": "019abcde-f0ab-7123-8123-123456789abc",
  "storySessionId": "019abcde-f0ab-7123-8123-123456789abd",
  "bindingId": "narrative:rain-bookshop-before-rain-stops:sv4-rescue-coop",
  "actionId": "pass-book",
  "params": {"bookId": "classic-little-prince"},
  "expectedTrackRevision": 12,
  "expectedSharedRevision": 23,
  "expectedEventRevision": 4
}
```

同一 WS requestId 置於既有 envelope，payload 不重複 clientRequestId；HTTP ACK 沿用 clientRequestId/eventSeq，重新讀 experience。v3 params 預設仍固定 ID；只有 bookmark 專用 action 的 note 才允許 0～20 Unicode scalar 的安全純文字（允許不填，保留草案選項），沿用 Domain 文本防護並配對嚴格 Zod／client 驗證，不放寬其他 params。所有 clientRequestId／revision／role／Area／已釘選事件及目前 phase 從現行安全機制校驗。對外不回原始 solution／targetSet 完整定義、未分享對方選書、答案、note 或歷史私有資料；已分享的原文才進公開投影。

```json
{
  "schemaVersion": "scene-event.v3",
  "phase": "playing",
  "timedModule": {
    "phase": "running",
    "serverNow": 1800000000000,
    "deadlineAt": 1800000060000,
    "rescuedCount": 1,
    "totalCount": 4,
    "waterStage": 2
  }
}
```

上述為部分 DTO；保留 myTrack/sharedRevision/availableEvents/world/stage/assets/suggestions 等既有欄位。新投影：map 僅本人可探索提示、book 依合法 Area／盲書未揭封只回包裝標籤、current question 只回題及本人選項／已提交狀態，雙方提交後才同時 reveal；cue 只給已觸發的步驟；timedModule paused 時只回剩餘時間，settled 回 grade；角色線索／合法手勢／候選物件、bookmark、ending receipt 均依狀態投影。投影的 command params 不由 client 自填任意 ID；原始 content 不公開。已知400 INVALID_STORY_REQUEST／401 SESSION_REVOKED／403 RESOURCE_FORBIDDEN／409 EVENT_STATE_CONFLICT／503 INVALID_STORY_CONTENT 或依賴故障沿用；倒數已結算或暫緩競態回既有409加權威 refresh，重播同 request receipt 不重扣秒、不重複事件。通知僅安全 snapshot_hint；現有 round events 投影必須逐事件查能見範圍，不能用全量 broadcast 洩露私密資料。

### 3.9 UI、互動與錯誤復原設計

| 畫面／手勢 | 沿用與擴充 | 驗收重點 |
|---|---|---|
| 入店／探索 | EmbeddedSceneStage 共用鏡頭座標／hitMask，左右鄰接導航＋收合小地圖；門把、傘桶、區域首次呼吸光、長按空白短掃描 | 小地圖只顯示本人合法區域／未探索彩蛋，未知隱藏事件不提前揭露；首次提示以場次角色狀態為基準，重連不造成錯誤主線提交 |
| 書牆／盲書／雨窗 | SceneBook 原位預覽、共用 PanResponder 擴充橫滑、撕封、擦霧；scroll / drag / swipe / long press / tap 互斥，裝置與鏡頭統一座標 | 預覽／滑動不直接推主線；揭封／符號／正式選書才按合法 action，關閉原位還原，不先發出未解鎖書名全文；雨窗符號按原內容可見 |
| 破冰／問答 | 共用雙 Track、原位拖放面紙、合法角色選擇；不把 NPC 旁白當真人聊天 | 同／異書、接／不接面紙與聊天選擇分開；I 留白時 A 有主動權，拒絕走 respect／quiet，warm 問答完成才推進 |
| 暴雨／救書 | 既有 SceneStoryMotion、StoryAudio／現有 cue fence；V4 擴充有限 flash、音樂停止、雨聲與 waterline、倒數 overlay、拖袋／上滑傳書及鎖扣 | 本地動畫可取消、暫停、重連重建，動作 pending 禁重複、錯誤還原；播放權限仍由本人控制，背景不自行重播；只在 server ACK/快照後呈現權威成果 |
| 結局／小票 | 既有 completed stage、chat／next／end；4 差異化 shot、原位翻對方桌書、授權 note、小票版型 | B 直接屋簷，不再可救書；A/S 依兩份 wish，quiet 優先。結局後僅合法書籤及公開成果；不開放一般探索，下一場切換清舊投影 |

時間保護、符號見證、共享 BGM 需跨雙裝置同步測試；本地播放偏好不改共享曲目。草案的原始文案直接用於 UI（包括提示／等待／退出）；缺素材先封閉互動、保留可用聊天／退出及重讀；不得以純文字或假圖代替應有演出。圖片與音訊按當前合法鏡位預載、有界快取、離開／失權釋放；不因切姿態、鏡位或重連呼叫 Gemini。草案全部 80 素材項逐項解碼、實際 SHA／MIME／byteLength、遮罩和鏡位核對。實際 Web/Android 量測載入、記憶體、動畫及操作延遲，以現有裝置和 V3 基線比較；不得先宣稱效能已驗。

### 3.10 結局判定與尚未明定的內容規則

草案 `endings[].conditions` 明確：B → ev4-04-eaves-shelter；S/A 且兩人 keep-talking → ev4-01-more-talk；無人 quiet-rest 且至少一人 share-books → ev4-02-book-recommendation；任一 quiet-rest → ev4-03-gentle-distance。S/A 的 3×3 組合各唯一結局；書籤與意願必須真人提交、不得提前揭露。草案未指定的 S_fast/S_normal 時間分界、X/4 歷史範圍、霧窗符號見證、反覆暫緩及恢復細節，依 §6.2 已確認決策實作及驗收，與原始作者文案區分。純技術補完（如 gesture 取消、ID mapping、CAS guard）不改原文與分支。

## 4. 驗收條件（新 SPEC 的需求，不是既有測試 ID）

| SPEC / MVP | 必須可驗收的遊戲行為 | 主要責任 |
|---|---|---|
| RB4-AC-001 / AC-005-36 | 移除表單式按鈕海與常駐說教／殘留舊劇本文案；支援門把／傘桶／多區抽書／橫滑書牆／撕盲書封條／擦霧雨窗／拖放物品與左右極簡導引＋可收合手繪小地圖（帶暖金微光點）；首次入區提供 1 次柔和邊緣呼吸光並支援長按掃視可互動物件輪廓（無漂浮星號） | RainBookshopV4 |
| RB4-AC-002 / AC-005-37 | 16 本合法公有領域真實經典名著（原創自譯摘錄＋阿澄推薦卡＋末頁匿名讀者字條，零現代版權侵權）與 4 本需手勢撕封牛皮紙盲書共 20 本書，真實散落融圖於 5 個書店區塊；可依登入本人 Profile 興趣標籤顯示柔和推薦貼紙（不外洩對方未公開興趣），預覽翻書不構成誤提交 | RainBookshopV4 |
| RB4-AC-003 / AC-005-38 | 支援空間感官共振與非阻塞等待彩蛋：黑膠唱片機切換 3 曲風時雙方 BGM 即時同步切換並提示；櫃檯今日雨天特調小黑板可點擊查看並呼應後續布丁彩蛋；起霧雨窗支援擦霧觀測 3 階段雨勢與留存 4 符號；閱讀角 5 則訪客留言冊與阿澄 3 話題閒聊隨時可玩且不阻塞主線 | RainBookshopV4 |
| RB4-AC-004 / AC-005-39 | 系統偵測雙方自 20 本書所選經典／盲書是否相同，觸發同書命運或異書反差演出；閱讀角破冰支援拖放面紙（近／遠）、借書搭話與輕扶書籤後留白，且 I 留白時開放 A 主動互動契機；A 選獨處後 I 進入專屬退讓節點，絕不顯示假聊天文案 | RainBookshopV4 |
| RB4-AC-005 / AC-005-40 | 閱讀角互動軌道支援 4 題隨機「雨天提問卡」同時揭曉默契／反差玩法，並依 8 種劇情階段與實際觸發事件動態提供 24 句自然口語聊天建議，不再全場固定三句 | RainBookshopV4 |
| RB4-AC-006 / AC-005-41 | 店長 NPC「阿澄」具一致人設與分眾對話：開場區別對待熟客 I 與避雨生客 A；暴雨時合理赴門口頂擋水板斷電而託付搶救絕版書；事後依 `S/A × 聊開/慢熟` 動態回應，絕不代真人發言或強行撮合 | RainBookshopV4 |
| RB4-AC-007 / AC-005-42 | 暴雨與進水危機由伺服器導演機制於雙方滿足前半段節奏點後**主動觸發**（閃電、停電閃爍、黑膠驟停、門縫漫水），不再要求玩家點按鈕觸發下雨，且已搭話／未搭話／獨處路線皆可達 | RainBookshopV4 |
| RB4-AC-008 / AC-005-43 | 90 秒即時水位倒數於雙方接過手電筒就位（Ready Gate）後啟動；每場由伺服器自 2 組跨區 4 本絕版書題組隨機釘選 1 組，雙人以手勢完成跨干燥區雙向互補搶救（暈開清單判讀、跨區抽書上滑傳遞、防潮袋裝櫃、後半反轉墊底規則與三態鎖扣順序），支援舞台快捷呼喊泡泡與 15 秒斷線／閒置水位暫緩保護 | RainBookshopV4 |
| RB4-AC-009 / AC-005-44 | 救書任務具三種權威動態結算：時間內救完 4/4（S 級含私藏布丁）、時間到救出 2–3 本（A 級含拿鐵毛巾）、以及倒數歸零水位破警戒線且僅救 0–1 本時**強制中斷救書並撤離（B 級）**；撤離直進專屬屋簷結局《雨夜屋簷下的並肩》，並移除舊版易誤觸地雷支線 | RainBookshopV4 |
| RB4-AC-010 / AC-005-45 | 四種結局在畫面、光色、人物距離、阿澄台詞與互動具實質差異且無規格書出戲文字；S／A 級支援夾書籤儀式（3 句自選＋選填 20 字純文字安全短語），《留下一本書的名字》結局後可實景翻開對方桌上書看見牛皮書籤內容 | RainBookshopV4 |
| RB4-AC-011 / AC-005-46 | 章節自然完成時產生無真實個資之《雨聲書店・今日借閱小票》視覺記憶卡（含黑膠、選書、救書統計、4 級稱號、結局進度 `X/4` 與 4 枚隱藏彩蛋復古印章）；維持 Round active、自由聊天、雙方同意下一場與安全退出，且新內容須升版發布、不覆寫既有 V3 不可變 SHA | RainBookshopV4 |
| RB4-AC-012 | 技術 Gate A 包含真 D1/R2/DO、所有內容／必要分支與四結局、Web／Android 正式畫面、隱私、倒數競態／復原、素材品質及效能；本人實際遊玩並明確核准精確版本／SHA 才過 Gate B | RainBookshopV4 |
| RB4-AC-013 | Gate B 後才清除舊版及其相關遊玩資料；不做遷移／轉換，未用舊程式與素材移除，保留共用與其他專案／帳號個資資產；驗 FK、無孤兒、保護資料不變及全新 V4 從頭重玩 | RainBookshopV4 |
| RB4-AC-014 | 清理後 V4 是唯一首場正式可玩版本、舊版本不能選／不能恢復，聊天、配對與安全退出仍正確；技術及本人 Gate 都有證據才結案，下一份才 AffectionAndFeedback | RainBookshopV4 |
| RB4-AC-015 | 逐項追溯並核對 V4 作者 JSON 全部有效節點、對白、選項、事件條件、分支、書籍、彩蛋、題組、結局、記憶卡及 UI 原文；正式契約與 runtime 呈現不得遺漏、改寫或以範例／舊版代替。經使用者確認的例外須明確回寫權威內容及驗收條件 | RainBookshopV4 |

## 5. 結案與資料清理（已確認業務決策）

1. V4 開發及 Gate A 完成後升版發布，不覆寫 V3/舊 SHA。保留舊內容與舊場次至本人 Gate B 完成，既有釘選不被默默重指；V4 未核准不得刪。
2. 使用者實際試玩完整體驗並明確確認版本／SHA，記錄在 Verification；不可由 runner 代簽。
3. 僅已知 default local，停寫並預覽精確版本／Catalog ID、FK 依賴及相關 round/session/visit/progress/event/receipt/claim/遊玩歷史；確認哪些舊 Round 需完整移除（不得留下無法配對的舊測試永久拒絕／占用或孤立聊天），先具名清單與保護資料指紋，使用現有 local wrapper 及交易／補償；不執行 remote/production。不需資料搬移；清理精確範圍依 RQ-04：一併清除具名 V4 驗收用測試 Round 及其關聯。共享帳號、個資、真人照片、化身、其他業務資料及仍被 V4 引用的素材保持。
4. 移除舊雨聲書店各版本的發布引用、僅舊版使用的內容／資產與無用程式／fixture，保留現行歷史文件與可重用測試；R2 刪除以剩餘引用集核對，不按名稱或 prefix 盲刪；D1 無孤兒／舊索引／舊 claim。故障可重跑清理不假成功。
5. 清理後驗 V4 全新配對/進場/完成/聊天/重玩/退出，舊版不可選、protected 資料不變，實際驗證記錄後才結案。不得先進 AffectionAndFeedback 或 Expansion。

## 6. 測試計畫與規劃確認點

以 RB4-AC-001～015 及完整作者 JSON 生成 BDD/TDD，建立 JSON 路徑／內容 ID → SPEC AC → BDD Scenario → TDD 案例的追溯與原文／完整性核對，涵蓋 Domain、真 Miniflare D1/R2/DO 故障注入、HTTP/WS 授權、Web/Android 實際手勢與素材、真 provider 質量／成本、效能、雙真人 Gate、清理前後驗收。重用現有有意義測試與實作，不將 V3 的歷史未全覆核數直接搬入。

### 6.1 測試與實作責任（Phase 3 後逐 ID 細化）

| 層級 | 既有測試入口與本次新增焦點 |
|---|---|
| Domain／Application | 既有 SceneEventTrackPolicy/Framework 測試，作者 28 節點／9 binding 的可達性、四題/兩題組、S/A/B 邊界、9 wish 組合、拒絕／獨處及反向主動、投影安全、未知結果重試 |
| Worker 真 D1/R2/DO | cloudflare/tests 既有 scene/story 真 Miniflare 測試；新增最後一毫秒競態、跨 Worker CAS、系統 NULL actor 冪等、alarm 冷啟動／nonce 共用排程、暫緩／退出競態、雙 ready、重播／失敗 rollback、舊版釘選／新發布及 orphan 防護；不得用 HTTP fixture 代替 |
| HTTP/WS | StoryDialogueEndpointTests、真 live bridge、既有 ticket/session；相同 command、無越權 raw manifest、拒偽造 role/answer/time、任意 params、失權／舊 snapshot／503 |
| Client／真 UI | 既有 story-dialogue、scene-event-framework、scene-event-v3 測試入口，新增 v4 正式 Web/Android 手勢、兩真人各自畫面、原位書牆／擦霧／盲書／拖放、音效、倒數重連、四結局及小票；四姿態五表情與必要真 Gemini 使用既有驗證能力、不代簽 |
| Publisher／內容 | 原 builder／runtime validator／graph；來源完整性（逐 JSON path/ID/原文）、全部素材與四結局可達、兩題組、每書可讀、V3 兼容、正式索引與 SHA；若 graph state explosion 須以等價有限狀態抽象與獨立證據處理，不拔除 50,000 guard |
| 清理 | Gate A、Gate B 核准明確 SHA 後，沿用已知 local wrapper；停寫、預覽、FK 依賴順序、備份、精確列舊 Round/Session/Invitation/claim/event/catalog/asset、剩餘引用核對、故障重試、V4 乾淨重玩；不碰帳號、個資、照片、化身或其他專案 |

規劃驗收須將 RB4-AC-001～015 和所有草案來源逐項對到 BDD、TDD；測試函式數不等於完整案例數。Gate B 須使用者實玩確切版本，舊資料清理須回歸才結案。正式程式修改時同步受影響的 overview API/data/module map/runtime/部署規範，本階段不把未實作方案寫成現行架構。

### 6.2 已確認 SDD 決策（現行有效規則）

| ID | 確認結果 |
|---|---|
| RQ-01 | A：雙方恢復操作能力後自動繼續，允許重複暫緩、不限制次數；斷線持續15秒或本人無有效合法互動15秒暫緩，不以背景 ping 當作玩家操作；最後一本必須嚴格早於 deadline 完成。 |
| RQ-02 | A：S 級完成時剩餘毫秒 >= 30000 為 S_fast，其餘 S_normal；X/4 計同一 pair 目前 Round 內 V4 同版已完成 Session 的 distinct ending ID（包含本場），不得跨 Round／pair、混入 V3 或未完成場。 |
| RQ-03 | A：符號保留到被替換、導演轉場或該場結束；另一方在窗區實際呈現目前符號後送出受授權的見證操作，server 核對該符號版本／角色／區域，非背景 snapshot 讀取；成功事實保留至本場結算。 |
| RQ-04 | A：Gate B 後清除 V1/V2/V3 舊版及明確識別的 V4 驗收用 Round、相關遊玩／邀請／占用／測試 pair 排除關聯，保留帳號、個資、照片、化身及 V4 正式內容／共用資產；從乾淨配對重驗。 |

最小技術方案已確認：21 表、0 新欄、0 Trigger、0 新公開 API；若真環境驗證無法達成容量、原子時鐘、可達性，不自行擴表或降低 guard，先提出最小修正。作者 JSON 原文保留不動，上述補充是使用者確認的執行規則；與原文未明定的地方共同構成驗收基準。

### 6.3 實作前風險決策（已確認）

| 決策 | 現行有效規則 |
|---|---|
| RA-Q1=A／RA-01 | 暫緩時允許受控恢復訊號：閒置者再次實際操作場景，斷線者返回可操作畫面；仍活動者不須額外操作，兩人皆閒置則皆須重新參與。第一次恢復操作只解除暫緩與同步，不計救書成果，不以 ping 或背景 GET 代替。晚到 alarm 以應暫緩的15秒門檻時刻扣算剩餘時間，與 deadline 比較，已先到期不得逆轉結算；恢復時重建活動基準，仍允許反覆暫緩、無次數限制。 |
| RA-Q2=A／RA-04 | 「四個乾燥書台」是四個不同取書位置，非四個不同 Area。完整保留原稿 set-a-starlight 第1及3本在 shelves 的不同位置；set-b-rainlight 原四 Area 不變，不移書、不重排、不改文案。 |
| RA-Q3=A／RA-05 | 按錯鎖扣只將本次三扣順序重置至0，已放書與已救數保持，可立即依原稿錯序提示再試；不額外扣秒，正常倒數繼續。暫緩、重連依權威狀態還原 holder／slot／latchIndex 及已救數，不重做整場。 |
| RA-Q4=A／RA-02/03/06–12 | 接受 [RiskAudit](./SPEC-001-RainBookshopV4-RiskAudit.md) 所列具體方案及16個補強案例。系統事件固定私有入口、真D1原子guard／CAS／冪等；配置版本及數字文案一致；霧窗只核證對方前景窗區實際渲染、版本／角色／授權，不宣稱可證眼球注視；盲書／私密答案／note的HTTP／WS／回放／R2隔離，小票不含玩家自由輸入；精確具名 local 清理與保護指紋，非測試混合輪／不明引用拒絕；DO最早排程與有效role連線；有界內容／graph與真環境驗證；逐書與音樂／封面權利、正式素材及真Web/Android證據。若真D1時鐘／容量／可達性無法達標、權利不明或清理有衝突，停下提出最小方案，不自行降低guard／Gate、變更架構或劇本。 |

以上為使用者已確認的執行細則，作者 JSON 原文保持不動。TDD 逐項補強 RB4-T-322～337；規劃交接以 TDD 末尾唯一交接紀錄為準。

### 6.4 倒數時間配置（已確認）

以釘選 Narrative 的 `sharedModules.timedCoopRescue.durationSeconds` 為單一倒數總時長來源；V4 初版為90秒。正式編譯保留型別化設定，雙 ready 時 server 讀該版本配置建立 deadline，DO、Domain、D1、DTO 及 Web/Android 倒數／水位顯示使用同一配置。不得在各層硬編碼90或由 client 傳入總時長。變更時只需修改內容配置、驗證及升版發布，不修改業務程式；已釘選舊場次保持原時長，不熱改正在遊玩的 deadline。水位播報與 S_fast 門檻亦採同一版本內容設定，目前原文75/50/30/15秒與30秒門檻維持；若縮短後超出有效範圍，發布前須明確調整有關設定及經確認的數字文案，不自動改作者文字或默默截斷。設定須為正整數、毫秒換算安全、播報嚴格遞減且小於總時長，S_fast 門檻可達；具體邊界錯誤 fail closed。以90及另一合法時長例如120的測試內容證明不必改程式、舊場次不受影響。

## 7. 依賴與相關文件

- [來源 MVP](../requirements/MVP-001-LoveGameDatingApp.md)、[作者草案](../requirements/rain-bookshop-v4-draft.json)。
- [已結案 SceneEventFramework](../alldonejobs/specs/SPEC-001-SceneEventFramework.md)、[StoryDialogueAndExit](../alldonejobs/specs/SPEC-001-StoryDialogueAndExit.md)、[AvatarAndPreferences](../alldonejobs/specs/SPEC-001-AvatarAndPreferences.md)、[MatchingSessions](../alldonejobs/specs/SPEC-001-MatchingSessions.md)。
- [現行 API 契約](../../overview/03-contracts/01-api-contracts.md)、[現行資料契約](../../overview/03-contracts/02-data-contracts.md)、[模組地圖](../../overview/01-architecture/04-module-map.md)、[Verification](../verification/SPEC-001-RainBookshopV4-Verification.md)。
- Phase 3 產出：`docs/bdd/SPEC-001-RainBookshopV4-BDD.md`、`docs/tdd/SPEC-001-RainBookshopV4-TDD.md`；Phase 4 風險：`docs/specs/SPEC-001-RainBookshopV4-RiskAudit.md`（已確認並補強）。

## 8. 實現檢查清單（規劃，未開發）

- [ ] 完成作者原文／ID／資產／分支完整性編譯與 v3 契約驗證。
- [ ] 完成共用 Domain／Application 多步事件、系統導演、權威倒數、actor-scoped 投影。
- [ ] 完成既有 D1 JSON／CAS、系統 reconcile／DO alarm、版本發布與權限驗證。
- [ ] 完成共用前端手勢、原位場景、音訊、倒數、四結局與小票；保留聊天及安全退出。
- [ ] 完成真 D1/R2/DO、HTTP/WS、Web／Android 回歸及 Gate A。
- [ ] 取得使用者 Gate B 確認，執行受控 local 清理及 V4 乾淨回歸，才可結案。
