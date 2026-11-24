# 資料與儲存契約

現行 migration 基線為 `0007_scene_event_tracks.sql`，共21張自有表、零 SQL Trigger；Foundation六表54欄、本人資料／媒體兩表27欄保持。資料契約以現行 migration、固定 commands 與程式型別為依據；需求進度及執行結果不在本文追加。

## 舞台與 atlas 呈現契約

`scene-stage.v1` 為可選 Scene JSON，定義 Area 的背景／前景／圖層、有限 shots（Area／camera／actor姿態、表情、gesture及音訊）與依 World object state 顯示的 embeddedInteractables。原位命中使用標準化 rect／polygon 與相同 camera 轉換；Publisher 檢查素材、Area、object state、shot及音訊引用，所有節點與結局演出須有對應 shot。NPC appearance 使用既有 Scene image asset ID，並非私人玩家 Rig。所有宣告的 NPC 姿態及五種語意表情圖片均須可解碼且具合法 image asset ID，即使本 Shot 尚未選取也不能略過；持物時另要求公開物件素材及唯一 `right-hand` 手錨。

NPC 另支援 `static-npc.v1`：每姿態指定同一公開 PNG 的尺寸與五種完整身體圖格，不疊加臉部圖片；完整校驗共用 `contracts/npc-static.ts`。此格式不宣告手錨，不可冒充具備私人玩家 Rig 或綁定額外持物。有對話選項的 NPC 必須有全部姿態／表情的非空 `hitMasks`；`contracts/scene-hit-mask.ts` 校驗有界十六進位透明遮罩，點擊只選取實際不透明身體，再由本人按對話選項提交。Actor 可用 `whenFlagEquals` 控制公開狀態可見性；投影會剔除不符合的角色及條件本身。

Scene 的 `books` 定義原創書籍的 objectId、標題、分類、摘要及2～12頁試讀；`copies` 可宣告共用同一封面與原文的其他實體書本，每個物件僅能屬於一本書。experience 只投影本人目前 Area 中可見書本的閱讀欄位，不附私有選書／共鳴條件。開書、翻頁及合回原位只保留本地 UI 狀態；展開時暫藏原物件圖，關閉後恢復，completed 亦只在仍授權且素材就緒時提供閱讀。

Stage 可用 `weather` 將公開 flag 的每個公開值映射到 steady／heavy／easing／stopped；不能引用私有 flag 值。Area 的 `weatherRegion` 宣告雨層的合法範圍，與背景共用鏡頭矩陣。對外只提供目前 intensity。

Scene 可選 `musicAsset`，必須引用正式 WAV；各 Area 可宣告 `audioMix:{ambienceGain,musicGain}`，兩者限0～1。`SceneAudioProjection` 只投影目前授權鏡位的混音；Client 仍須本人開啟聲音，混音漸變不影響權威世界，背景／失焦停止全部播放器，返回不自動播放。

Narrative 可選 `safetyExit:{endingId,conditions}`，必須引用同條件的唯一結局；合法動作先套效果，再優先判定安全收尾。結局最後一個已提交 Shot 成為重連後的持久鏡位；一般鏡位仍依實際 Area 過濾真人角色。以上均沿用既有 JSON 儲存及 D1 原子命令，不新增表或欄位。

內部 `story.framework.action.commit` 可附 `areaGuards`（accountId／role／revision／areaId）。Application 依本次 Binding 與收尾條件中的 `actor_area_is` 收集讀取位置；D1 在寫入前同批驗證帳號、邀請角色、版本及區域。所有個人動作亦附伺服器實際讀取的 `observedSharedRevision`，重驗合法條件與安全收尾所讀的共享世界；此讀取guard不增加Shared revision，只有世界改變才使舊讀取失效。這些內部CAS不修改另一人的Progress，也不是公開可指定的payload；單純過往到訪事實不因此鎖住對方目前進度，精確receipt重播仍回原結果。

client `ActorRigView` 的 `actor-rig.v1` 包含內容定址 assets、joints、atlas layers（region／position／size／depth）、四種姿態、五種表情覆寫及 propAnchors。這是共用呈現元件的輸入型別，尚不等於正式 R2 ready Manifest 或新授權 API；既有資產依五表情契約，新候選另依完整靜態包及本人版本確認契約。Client 可從已授權 Scene NPC 的公開姿勢／表情圖片建構共用渲染 Rig，但不得藉此推定私人玩家已取得正式 Rig ready；任一必要圖層失敗須封閉互動舞台。審查頁不產生正式版本或修改原角色 ID。

## 靜態角色包

`contracts/static-avatar.ts` 定義 `static-poses.v1`：4種姿態各有完整5語意表情，frame引用帶SHA／MIME／尺寸／byteSize的PNG asset及有界region；重複ID、缺姿態、缺表情、越界或無引用asset一律拒絕。完整圖格不拆五官，也不表示連續動畫或Puppet已完成。

免費包由 `contracts/builtin-static-poses.json` 綁定原neutral來源SHA。私人包位於本人asset的 `static-poses/v1/{sourceSHA}/`，必須對應舊ready Manifest的sourceImageSha256；PNG按SHA命名，Manifest完成實際物件SHA／尺寸／alpha檢查後才create-only發布，併發相同包冪等，不同內容拒絕覆寫。公開投影只有packageVersion、assets與poses，不含sourceSHA或私人儲存位置。既有五表情Gate保留，已發布私人靜態包缺圖時亦拒絕本人入場。

前端 `StaticAvatarPreload` 全包解碼後才啟用含玩家的Stage；`staticStageActors` 依已授權Shot的role／pose／expression投影完整圖格。原生Image帶當下授權header，不持久化；失權或投影讀取失敗清除舊角色；V3必要素材解碼失敗封閉舞台，舊V2選用靜態圖解碼失敗不阻斷合法五圖回退與聊天。新候選明確製作流程在相容五表情後準備四姿態PNG；進場、重連與既有保存角色不自動生成。

## D1 schema

舊AI角色補姿態沿用本人foreground adoption metadata，增加可選`savedSource`與確認收據`committedRevision`，不增加D1欄位。保存角色的五表情Manifest／Master保持不變；四張未確認PNG暫存於`private/{owner}/avatar/temp/pose-sheets/{workflow}/{pose}.png`，只有本人workflow可預覽，確認前不放入目前選角能讀取的canonical包。明確review後才發布原sourceSHA的四姿態包、以原revision確認同一選角並清除暫存。到期GC保留仍有有效building／ready引用的預覽，刪除到期孤兒；舊候選收尾不得結束savedSource流程。

Foundation 原六張自有表共 **54 欄**（8＋5＋10＋8＋16＋7），每表首欄為 NOT NULL TEXT PRIMARY KEY，由程式建立小寫 canonical UUIDv7。D1 的 `d1_migrations` 是工具維護表，不計入自有六表。日期欄位使用 Unix epoch **milliseconds INTEGER**；DB row snake_case，公開 DTO camelCase。

以下列出 Foundation 欄位；`?` 表示 DB 可為 NULL，其餘 NOT NULL；ID／文字為 TEXT，時間／計數為 INTEGER。

| 表 | 欄位（依 migration 順序） | 約束／用途 |
|---|---|---|
| auth_accounts（8） | account_id、email_normalized、email_verified_at、password_hash?、status、credential_version、created_at、updated_at | Email UNIQUE；status=active／disabled；cv≥1，預設1；Google-only 可無密碼 |
| auth_external_identities（5） | identity_id、account_id、provider、subject、created_at | account FK；UNIQUE(provider,subject)、UNIQUE(account_id,provider)；subject binary case-sensitive；provider 1–64、subject 1–512 字元 |
| auth_sessions（10） | session_id、account_id、client_platform、credential_version、current_generation、created_at、absolute_expires_at、idle_expires_at、revoked_at?、revocation_reason? | account FK；platform=web／ios／android；cv≥1、generation≥0；期限均大於 created，idle≤absolute |
| auth_refresh_tokens（8） | token_id、session_id、token_hash、generation、created_at、expires_at、consumed_at?、replaced_by_token_id? | session FK、自我 replaced_by FK；hash UNIQUE 且長64；UNIQUE(session_id,generation)，generation≥0、expires>created |
| auth_email_challenges（16） | challenge_id、purpose、email_normalized、client_platform、flow_token_hash、code_mac?、generation、failed_attempts、account_id?、bound_credential_version?、state、created_at、expires_at、absolute_expires_at、resend_after、consumed_at? | flow hash UNIQUE 長64；code MAC NULL 或長64；account FK；generation≥0；失敗0–5；created<expires≤absolute |
| common_rate_limit_buckets（7） | bucket_id、policy_key、subject_type、subject_hash、window_start、attempt_count、expires_at | subject=email／ip／account／session；hash長64；UNIQUE(policy_key,subject_type,subject_hash,window_start)；count≥1、expires>window |

`auth_sessions` 的 partial UNIQUE index `idx_auth_sessions_active_account` 限定 `account_id WHERE revoked_at IS NULL`；已到期但未撤銷仍占此唯一條件，新登入同 batch 撤舊再建新。其餘索引為 sessions account／expiry、challenges email+purpose／expiry、rate bucket expiry。

challenge purpose 為 `register_email | reset_password`，state 為 `active | consumed | locked | expired`。schema provider 留通用欄位，現有 commands／validator 僅接受 google。revocation_reason 是 nullable TEXT，現行寫入 `replaced_by_login`、`logout`、`refresh_reuse`，不是 DB CHECK enum。

## 本人資料與媒體

Schema 由 [0002](../../cloudflare/migrations/0002_avatar_preferences.sql) 與 [0003](../../cloudflare/migrations/0003_profile_gender_card_visibility.sql) 定義：本人資料18欄、媒體9欄，零 SQL Trigger。

| 表 | 欄位 |
|---|---|
| user_profiles（18） | profile_id、account_id、nickname、bio、occupation、birth_date、region_code、traits_json、interests_json、preferences_json、selected_avatar_type、selected_avatar_ref、revision、created_at、updated_at、gender、romantic_orientation_json、card_visibility_json |
| user_media_assets（9） | asset_id、account_id、kind、object_key、mime_type、display_order、status、created_at、deleted_at |

profile首次ensure冪等；嚴格22欄輸入（含expectedRevision）、三組JSON（preferences固定9鍵）及版本化靜態目錄見SPEC。臺灣日期18+，Unicode scalar長度；occupation可空。本人投影含精確生日及私有偏好，名片預覽只用分享白名單。generated profileReady額外要求本人ready正式資產，不單靠type/ref字串。儲存含停用目錄選項時，Application先讀本人目前revision及同欄位歷史值；只允許原值保留，其他欄位出現同碼也不能當作保留依據。撤銷401、版本落後409、新加入停用碼400，停用值保留不另新增metadata鍵；gender 為 nullable male／female／diverse，romantic_orientation_json 為同碼唯一陣列0～3項，card_visibility_json 為分享白名單 boolean map；預設依共用欄位定義。ageBand 不接受 birthDate 分享鍵，profileReady 需要性別與非空性向。

`profile.photo.reserve` 單條件 INSERT…SELECT COUNT(pending+ready)<5 RETURNING；pending計入配額。ready按當下ready最大序號+1配號。排序核對整個ready集合及revision，刪除同batch先CAS、soft-delete、壓緊其餘序號；零列不假成功。上傳失敗僅透過 `profile.photo.cancel-upload` 撤pending，不因遺失回覆誤刪ready；舊內部delete不供正式HTTP刪除使用。R2先成功寫入才ready，刪除先tombstone才允許R2實體清除。GC清逾30分鐘pending及tombstone物件；R2 `_system/avatar-preferences/cleanup.json`保存photoCursor、r2Cursor及最多100個尚未處理key／到期metadata，分配各段預算並以ETag提交進度，不刪ready原件、不加D1 job表。

AI狀態不加job表：每帳號R2 active pointer與60分鐘manifest以ETag CAS提供排他、成功數1～4、request replay、短效來源ID、已失敗requestID、unknown成本鎖及採用receipt。摘要digest僅在短效manifest去重，D1不存byte_size／hash。來源照片存 `private/{owner}/photos/{asset}`，候選存 `private/{owner}/avatar/temp/{attempt}/{manifest|1..4}`；確認採用後先在既有媒體表保留generated pending，再複製選中圖至 `private/{owner}/avatar/{asset}`，D1同batch條件pending→ready並更新profile revision。正式資產不隨候選到期清除；中斷的未提交副本延後清理。

`profile.avatar.reserve/adopt/cancel-adoption`處理採用媒體生命週期，不增加表或欄位。正式asset UUIDv7由.NET server提出，與attemptId分開，R2 manifest的selectedAssetId保留單次採用身分；失敗重試用新ID，deleted不復活。取消補償可在原Session失效後清理自己的pending，並為較晚reserve留下tombstone；已ready不可被取消。先原子取消再刪R2，避免失敗者刪掉並行已提交圖。D1已ready但R2關輪回覆遺失時，status／begin只修復既有receipt，不重新生成／複製／增加revision。

媒體固定指令的可寫範圍如下；所有輸入採strict schema，現有資產的account_id／kind／object_key／mime_type／created_at不可修改。呼叫端不可傳status、deleted_at或display_order；SQL依目前身分及狀態推導。對外仍只經受保護API，不公開command入口。

| 內部指令 | 允許變更 |
|---|---|
| `profile.photo.reserve` | 新建pending照片；owner與照片ID推導固定key，pending＋ready少於5才插入；既有ID不可覆寫 |
| `profile.photo.ready` | 僅pending→ready，依當前ready尾端推導display_order |
| `profile.photo.cancel-upload` | 僅pending→deleted及deleted_at；不能取消已ready |
| `profile.photo.delete` | 本人pending／ready→deleted及deleted_at；只留作內部生命週期指令 |
| `profile.photo.reorder` | 完整本人ready集合的display_order，及profile revision／updated_at |
| `profile.photo.delete-compact` | 同batch修改profile revision／updated_at、目標status／deleted_at、其餘ready display_order |
| `profile.photo.list`、`profile.avatar.list` | 唯讀，只回本人ready metadata |
| `profile.avatar.reserve` | 新建generated pending；來源及revision有效才插入，既有ID不覆寫 |
| `profile.avatar.cancel-adoption` | 本人generated pending→deleted／deleted_at，或先建不可復活的deleted保留列；ready不變 |
| `profile.avatar.adopt` | 本人generated pending→ready，及profile選用欄位／revision／updated_at |
| `profile.avatar.builtin`、`profile.avatar.generated` | 只改profile選用欄位／revision／updated_at，不改媒體身分或建立副本 |

圖片規則：上傳最多8MiB，安全解碼JPEG／PNG／WebP、像素24M／邊長8192、拒動畫／偽造MIME／損壞圖；校正EXIF方向、白底透明、去EXIF／GPS／ICC、保留比例不放大，來源JPEG≤200000 bytes。AI結果≤2MB、3:4容許小幅供應商尺寸取整，顯示contain不裁切。正式免費角色使用 full-body.v1 的16套五表情透明 WebP；正式圖與真人媒體分開，不保留原畫或製作中間檔。

本人正式AI圖清單僅回assetId／mimeType／createdAt；重選使用相同資產與profile revision CAS，不建立副本。來源改變會關閉舊manifest；失敗request ID上限64，超限在新lease前拒絕以保持manifest可讀。關閉輪次仍辨識初次request replay，不誤開另一輪付費生成。

前端未儲存表單以記憶體baseline及revision追蹤；metadata重讀可保留草稿，但伺服器欄位已改變時禁止將舊草稿搭配新revision覆寫，須明確重新整理。不將草稿、候選或真人照片另存localStorage／日誌。

## 配對與占用

配對投影、邀請、房間與占用採固定 prepared SQL；現行 schema 以0007為準。實體 ID 為程式提供 UUIDv7 TEXT NOT NULL PK，關聯表使用複合 PK，時間為 Unix ms。

| 表（欄數） | 依序欄位／主要約束 |
|---|---|
| match_conditions（10） | condition_id、account_id UNIQUE FK、gender、romantic_orientation_json、birth_date、region_code?、interests_json、preferences_json、created_at、updated_at；只供搜尋，不是可直接編輯的 Profile |
| match_invitations（11） | invitation_id、account_low_id、account_high_id、initiator_account_id、client_request_id、status、invalidated_reason?、created_at、expires_at、updated_at、responded_at?；排序 pair、帳號FK、initiator屬於pair、UNIQUE(initiator,request)、pending pair partial UNIQUE |
| game_rounds（9） | round_id、invitation_id UNIQUE FK、account_low_id、account_high_id、status、started_at、ended_at?、last_event_seq、story_offer_catalog_ids_json；active／ended，保留永久 pair 歷史 |
| game_active_round_claims（4） | participant_id、account_id UNIQUE FK、round_id FK、created_at；每場恰好兩位，結束時原子釋放；round索引 |

conditions 無 gaming status、人工開關或 source_profile_revision。個資仍是 user_profiles 唯一事實來源；只有配對欄位／資格異動才同 batch UPSERT／DELETE，無關照片排序、工作／自介、分享設定不碰投影。condition_id 使用來源 profile_id（同樣是 UUIDv7），不是新增可供 client 寫入的識別。user_profiles.revision 僅維持原本人 CAS，不作跨表相等查詢。

invitation 狀態為 pending／accepted／declined／cancelled／expired／invalidated；invalidated_reason 只允許 other_round_started／eligibility_changed，其他狀態為 NULL。72小時由伺服器懶惰失效；性向／軟偏好異動不撤銷原 pending。declined 或 ended 的原 accountId pair 永久互斥，不追蹤重新註冊的真人。

固定內部命令為 `match.candidate.search`、`match.candidate.persona.read`、`match.invite.create/list/resolve`、`game.round.list/get/end`。接受及結束的 SQL CASE guard 在不滿足完整後置條件時使 statement 失敗，讓同 D1 batch 真正回滾；不能以應用層提交後檢查代替。正式生成化身沿既有私人 R2，沒有配對照片副本、名片快照或 job 表。搜尋與邀請限流見固定指令與限流表。

## 劇情與事件

占用表為 `game_active_round_claims`（4欄、account UNIQUE），Round 含 `last_event_seq` 與 `story_offer_category_ids_json` 共9欄。凍結 JSON 只代表第一場；後續候選由 `story.episode.offers.frozen` 保存。推薦先排除沒有適用主線的類別，再依共同命中、較少方命中、總命中、priority、code 排序，取最多三個 Category。

劇情目錄 `content_story_catalog`13欄、`game_story_sessions`10欄、`game_round_events`8欄。Catalog 的 scene_catalog_id／sequence_group_id／sequence_order／prerequisites_json 與 SHA Narrative 一致；每穩定 ID 最多一個 published，retired 仍供已釘選場次讀取。Session 保存 selected_category_id、shared_revision 與≤16384字元 JSON object 的 world_state_json，不再有共享 current_node_id 或 progress_revision。保留 UNIQUE(round_id,episode_seq) 及 playing partial UNIQUE。`game_interaction_instances` 已移除，歷史 migration 不倒改。

場景內容與執行六表共43欄：

| 表 | 欄數與邊界 |
|---|---|
| content_story_categories | 8；category_id、code、version、title、興趣 tags、priority、status、published_at；每 code 最多一個 published |
| content_scene_catalog | 8；scene_catalog_id、scene_id、version、title、manifest key／SHA、status、published_at |
| content_scene_category_links | 2；Scene Catalog／Category FK 複合 PK |
| game_scene_visits | 6；UUID、Session FK、visit_seq=1、Scene FK、entered_at、left_at；UNIQUE(session,visit_seq)；Area 移動不新增 Visit |
| game_event_instances | 12；UUID、Session FK、scope:sourceId:bindingId、event_id／version、repeat_group、status、state_json、revision、created_at、completed_at、track_scope；UNIQUE(session,binding,track_scope) |
| game_story_participant_progress | 7；Session FK、account_id、role、current_node_id、current_area_id、revision、updated_at；PK(session,account)、UNIQUE(session,role)，恰兩個原始角色 |

EventInstance track_scope 為 inviter／acceptor／shared，status 為 active／completed／cancelled，JSON object≤16384字元、revision≥1；完成／取消含 completed_at。個人 Progress、共享 World、EventInstance、receipt 及事件序號同 D1 batch CAS；共同行為只在已釘選合法轉移時更新另一方進度，不代他提交答案。隨機正／負決策只保存一次；同 role/repeatGroup 的負決策也阻擋本局其他 random／fixed alias，必要主線保留該群組。起始效果與 cue 在第一筆真人提交時生效；私有抽選不修改 shared_revision、World 或兩人 Progress，共享抽選才增加共享 revision。repeatGroup 依 track_scope 隔離，round 範圍參考同 Round 已完成歷史，playthrough 範圍可在新 Session 重玩。Round 序號唯一，actor／requestId 同 payload 回 receipt、改 payload 409。票及同意以 episode／actor 最大已提交序號重建，不新增票表或 job。

EventInstance JSON 的 `submissions` 保存各真人最新步驟事實；可選 `enteredNodeIndexes` 保存各 role 已實際到過節點在釘選 Narrative nodes 中的索引，索引0～255、每角色最多256個不重複值。後續提交不可刪除歷史，不更新對方 Progress 時也不可修改對方索引；和Progress／receipt同批保存，重複觀察覆寫最新步驟仍不遺失 `track_node_entered` 事實。舊實例沒有此鍵時仍可從既有submission／目前節點／Entry判斷；索引只供Server內部使用，不向另一人公開。

內容為 `scene-event.v2`：Narrative 含 inviter／acceptor 各自 Entry／Node、個人及 Shared Binding、Ending predicate；Scene 含合法 Area 鄰接、物件狀態與轉移、slot、NPC、共享 flags、能力與演出。六種 Module 為 move-area／inspect-object／manipulate-object／talk-to-npc／cooperative-action／cooperative-choice。DSL 限深度8、總節點64、每組32項，僅查已提交角色／區域／事件／世界／前置主線事實；拒腳本、SQL、外部 URL、私人 Profile 條件與未知 operator。Publisher 以雙角色有限狀態驗可達 Ending／必經死鎖，unlock 不等於 entered，合法可選回訪可保留。

Scene／Narrative／EventDefinition／GlobalPool 各有 version／key／SHA；單物件≤512KiB、四層合計≤4MiB、受限參照數。素材≤8MiB，只允許 PNG／JPEG／WebP／WAV，key 為 `story-content/assets/<sha256>` 且逐位元驗證；STORY_CONTENT 與私人 FILES 分離。Client 只接 actor-scoped 投影，不取得 raw Manifest、隱藏條件／答案或私人 R2 key。自然收尾同批完成 Session、取消未完事件及關閉 Visit，Round 仍 active；真人雙同意才建下一場。Client 的票、聊天、ticket、presence 只留授權畫面 RAM，離開／ended 即清空。

## 版本化場景與免費素材

`scenePresentation.version=2.5d.v1` 使用固定無腳本 camera／focus／portrait／tint／foreground 與歸一化 inspect 熱區；foregroundAsset 只引用同 manifest 圖片，前景、背景與熱區共用鏡頭矩陣，禁止任意 URL／私人媒體 key。每節點 presentation 只引用該版 camera、固定五表情與合法 object；audioCues 僅引用同 manifest WAV。

免費角色契約為 `contracts/builtin-avatar-packs.json`：16個穩定ID，各有 neutral／smile／surprised／thoughtful／concerned，含內容定址 WebP、SHA／avatarVersion、尺寸、大小、full-body.v1／standing 與 stageAnchors。唯一素材目錄為 frontend/client/public/avatars/full-body.v1，靜態neutral與劇情五表情共用；人工確認結果保存在需求驗證文件，不保存製作JSON或記錄於overview。

## 全身五表情、靜態製作與 R2

全身候選 prompt 為 `datinghigh-adv-full-body.v2`，保留 portrait.v3 的身份／畫風文字並使用全身取景；表情及靜態製作版本為 `datinghigh-expression-and-static.v3`，以選中候選作唯一來源，使用保留洋紅底；五表情由Skia去背後以透明WebP入庫，四姿態各一張五欄表以透明PNG入庫。姿態請求固定16:9／2K，僅接受已配置的 gemini-3.1-flash-image／gemini-3-pro-image，不切換模型或自動重試；解碼後檢查每欄完整、邊界及重複圖格，仍須本人核對身份、手部與表情品質。

Gemini 衍生圖使用 LosslessWebp，每檔上限2MB、最低600×800且保留3:4比例；來源照片仍為 JPEG／200000 bytes，免費套組每檔上限200000 bytes。Worker 依 RFC9649 驗靜態 VP8X／VP8L alpha，拒動畫、metadata、畫布不符與偽alpha容器；站姿幾何檢查拒明顯缺腿、缺腳／鞋或鞋底裁切，不作身份／畫風核准。

R2 前景狀態為 `private/{owner}/avatar/temp/adoption`，可含 `staticRequired`、`poseSheets`、`staticVersion`、`reviewedStaticVersion`；既有 `inFlight` 擴為五表情加四個固定姿態步驟，沿用同一 CAS lock，不建DB欄位。姿態暫存 `pose-{pose}.png` 帶同lease／workflow／source收據，完整後按SHA放入canonical static prefix並驗全部物件；ready保存後移除四張暫存。精確版本review後才允許正式selection；取消後續作保留成功步驟，未知結果須明確重試。canonical檔案及manifest帶到期孤兒metadata，GC只刪無合法owner/ready reference且到期物件，保留已採用包。套組為 `private/{owner}/avatar/{asset}/expressions/v1/full-body.v1/{expression}.webp` 與 manifest.json。恰好五表情，驗 owner、來源hash、版本、尺寸、alpha、各圖hash與長度後才 immutable ready；ready 不等於已選。正式選用以 D1 CAS 提交，取消增加既有 Profile revision 作 fence。遊戲入口只驗本人目前採用的正式資產：DB 本人／未刪除／ready、有效 ready Manifest、五物件存在／MIME／長度；另一組 pending 不影響已就緒採用者，不新增 readiness 欄位或 marker。

生成 pending GC 為兩小時，照片 pending 為三十分鐘；固定表情／Manifest 路徑附 orphanAfter，到期且 D1 非 ready 才清。每帳號可重用 adoption checkpoint 由 CAS 覆用，不無條件刪除，以免刪除新前景鎖。一次性本地清理依具名帳號、精確 key／etag、備份與無 writer 前提操作；執行結果另記驗證文件。

## 認證與序列化規則

- Email 僅支援 ASCII addr-spec，trim 外側空白並 invariant lowercase；總長≤254、local-part≤64，保留 `+tag`／點，不合併別名。
- 密碼保留原字串，不 trim／正規化／改大小寫；12–128 Unicode scalar、嚴格 UTF-8≤512 bytes，拒控制字元及孤立 surrogate。PBKDF2-HMAC-SHA256 使用 600000 iterations、16-byte salt、32-byte key，僅存自描述 hash。
- 平台 Access JWT 為 HS256、typ=`at+jwt`，驗 iss／aud／nbf／exp／sub／sid／cv／jti／iat；sub／sid／jti 為 UUIDv7，cv claim 解析為正整數。JWT 時間為 Unix **seconds**，與 DB milliseconds 分開。
- Access 最長10分鐘，受 idle／absolute 上限裁切；family 絕對30天，idle7天，refresh 不延長 absolute。JWT 驗證有30秒時鐘偏差，D1 active-session 條件仍查實際 Access／family 到期。
- refresh／flow token 由32-byte隨機值產生，base64url長43；D1 僅存 lowercase hex SHA-256。六位 Email code 以單一 EMAIL_CODE_HMAC_KEY 計算 keyed MAC，由 .NET 產生與驗證，不存明碼。
- challenge 每代10分鐘、整體30分鐘、重寄60秒冷卻；五次錯碼鎖定，重寄不重設錯誤次數。確認用共用前置條件與原子提交；Email 挑戰最後一句才消耗。
- 新登入不增加帳號 cv；改密碼／reset／解除 Google 增加 cv，舊 family 因版本不符失效。等價 rehash／Google 連結不增加 cv。
- Refresh 以目前 generation 條件輪替。已消耗 token 在30秒內且只落後一代時可輪替目前 head，更舊代回409；超過30秒重放回401並撤原 family，不能撤較新 family。

公開 Account 不序列化 password_hash、cv、provider subject、token hash／MAC；wire DTO 與 nullable／optional 見 [API 契約](01-api-contracts.md)。

## 固定指令與限流

內部 bridge 只接受 POST `platform.internal/v1/commands/<固定名稱>` 與嚴格 JSON／Zod schema；所有 SQL 值以 bind 傳入。DB 命令回 `{rows: object[], changes: number[]}`，每句 changes 供用例檢查，0列不能當成功；多句使用同一 D1 batch。其他 ready／JWKS／email／object 命令有各自結果，不能套成任意 SQL API。

| policy_key | subject／固定視窗／上限 |
|---|---|
| email_code_send.v1 | email／1小時／5；ip／1小時／30 |
| email_code_verify.v1 | email／15分鐘／10 |
| password_login.v1 | email／15分鐘／10；ip／15分鐘／60 |
| external_credential.v1 | ip／15分鐘／30 |
| credential_change.v1 | account／15分鐘／10 |
| session_refresh.v1 | session／1分鐘／10；ip／1分鐘／120 |
| avatar_generate.v1 | account／1小時／8 |
| avatar_expression.v1 | account／1小時／20 |
| matching_search.v1 | account／1分鐘／30 |
| matching_invite.v1 | account／1小時／10 |
| story_ticket.v1 | account／1分鐘／30 |
| story_mutation.v1 | account／1分鐘／120 |

subject 僅存 RATE_LIMIT_HMAC_KEY 派生 hash；不預建未來業務政策。`RateLimiter.cs` 在單一request內依policy／subject／window去重；IP先commit，拒絕後不再處理其他subject，同階段額度批次提交，採最晚Retry-After。

## Client 持久化

| Key（實際前綴 datinghigh.） | 允許 JSON 欄位 | 儲存位置 |
|---|---|---|
| email-flow | challengeId、flowToken、expiresAt、absoluteExpiresAt、resendAfter、emailMasked、purpose；deliveryFailed optional boolean | Web sessionStorage／native SecureStore；完成或到期清除 |
| refresh | refreshToken、sessionId，兩者必填 | 只 native SecureStore，WHEN_UNLOCKED_THIS_DEVICE_ONLY；Web 禁止此 key |
| pending-revoke | Web 僅 optional sessionId；native optional sessionId／refreshToken | 同平台 storage，登出待確認／重試使用 |

storage-policy 只允許上述 key／欄位、JSON object，單值≤4096字元；禁止任意 SDK response／JWT／密碼／raw code 混入流程 metadata。native Access 只在 ApiClient 記憶體，Web 平台憑證由 HttpOnly Cookie 管理；Google proof 不持久化。flowToken 僅依既有流程儲存白名單使用，不輸出到日誌或交付文件。

## 私人 R2 與 readiness

私人 key 為 `private/{accountId}/foundation-test/{objectId}`，owner 必須由已驗證 CurrentUser 取得；objectId 為 UUIDv7，操作前重驗 family。Foundation測試物件路徑只支援 foundation-test 用途，內容最大8192 bytes、內部 JSON Base64字串上限12000，Content-Type固定 application/octet-stream；不借用作業務圖片路徑；AvatarAndPreferences使用前述獨立媒體通道，無公開私人圖片URL。

ready 檢查 EXPECTED_MIGRATION 的 `d1_migrations` 記錄；0007 驗21表欄位順序／PK／NOT NULL、零 Trigger、未撤銷 session UNIQUE、故事 published／playing、Scene／序列／事件／候選及雙 Track 角色唯一約束；0007 已移除舊 episode vote 索引，拒舊 published Catalog 缺 Scene。另驗 STORY_CONTENT／GAME_ROOMS／ticket secret 與 R2 `_system/foundation/probe.txt` 內容 `datinghigh-foundation-v1`。歷史 Foundation readiness 檢查保留於明確舊基線測試；舊0006不能冒充0007就緒；它不是完整資料稽核，UNIQUE／FK／rollback 行為仍由真 D1 測試證明。

每小時清理過期 rate bucket、challenge（以 absolute expiry 的保留窗）、session／refresh（absolute expiry後7天）。refresh 自參照先分批解除再刪除，最後刪無 token 的 session；不刪帳號／identity，也不將清理當授權機制。

## 設定與變更

實際設定 key、binding、build-time／runtime 分類見 [環境變數](../04-deployment/02-environment-variables-template.md)。沒有 appsettings 階層設定；目前讀取的認證名稱不改寫成其他慣例名稱。

schema 變更須先有已確認範圍、migration／prepared SQL／ready 同步與真 D1 失敗測試；不得修改 Foundation 原六張 54 欄的既有基線；新增業務表須另立已核准的 migration 與完整業務測試。同步 DTO／storage／設定時也需更新 API、相依地圖與對應測試，保留 local／cloud 資料隔離。
