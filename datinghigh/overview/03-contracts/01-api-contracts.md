# HTTP API 契約

本文件整合現行公開 HTTP／WebSocket 契約；不記需求增量或執行流水帳。認證、個資、配對及劇情各自依既有 SPEC 驗證，實際測試結果放 docs/verification。

## 角色授權讀圖

讀圖端點：`GET /api/v1/game-rounds/{roundId}/partner-avatar` 及 `.../partner-avatar/{version}/{expression}`；同房本人 `GET /api/v1/game-rounds/{roundId}/my-avatar` 及 `.../my-avatar/{version}/{expression}`；本人 `GET /api/v1/me/avatar/assets/{assetId}/expressions` 及 `.../{version}/{expression}`。回固定五表情、SHA／MIME／尺寸／大小、full-body.v1／standing／anchors 與授權 URL；另可含 `staticPosePackage`（static-poses.v1、packageVersion、assets、四pose各五表情frame）。靜態asset使用同一binary路徑的 `static-{sha256}` selector，回PNG；舊五表情仍回WebP。selector只能命中目前授權包中存在的SHA，不接受任意URL、owner或R2 key。API深層白名單移除來源SHA、儲存key及額外欄位。binary no-store 且 IO 後重驗授權／目前選角；免費已確認套組也走同房通道。

## 靜態化身製作與採用

受 PlatformAccess／Origin／no-store 保護的 GET `/me/avatar/expressions`（本人 adoption 或 null）；POST `/me/avatar/expressions/begin` 接 attemptId／index1..4／clientRequestId／expectedRevision；`/next` 接 workflowId／固定 expression／clientRequestId／可選 retryUncertain；`/cancel` 接 workflowId。status 亦可 POST 空物件。公開 begin 固定要求完整靜態包，先檢查已配置供應商支援姿態製作，再建立流程與扣額度；next 的固定步驟為五表情及 `pose-stand/sit/read/hold`，依序缺項續作；公開結果含進度、穩定ID及完整後的安全 `staticPosePackage`，不含 lease、來源SHA或私人key。POST `/me/avatar/expressions/review` 只接 workflowId／packageVersion，確認該完整版本後才允許候選 PUT selection；切回 saved 仍須本人既有 ready Manifest。GET `/me/avatar/expressions/{workflow}/poses/{stand|sit|read|hold}` 只供本人有效前景流程預覽PNG，沿用 Session／候選來源檢查並在IO後重驗。內部 binary GET／PUT `/v1/avatar/expressions/{workflow}/{step}` 只走 Container bridge；五表情WebP上限2MB，姿態PNG上限20MB，固定selector且有界串流。無半身升級入口。

## 劇情與即時通訊

已保存且目前採用的舊AI角色可用同一`/me/avatar/expressions/begin`提交`assetId`／`clientRequestId`／`expectedRevision`，與新候選的`attemptId`／`index`互斥。此流程沿用永久Master與既有五表情，只製作四姿態；進度帶`savedSource=true`，不依賴已過期候選或原真人照片。本人檢視精確`packageVersion`後的`review`會以原profile revision確認同一asset、結束工作流及通知同房讀取新包，不再另送選角PUT。重播回原確認結果；進場與重新同步不啟動生成。

所有路徑相對 `/api/v1`，需既有登入／Origin保護，回應 `no-store`：

| 方法／路徑 | 契約 |
|---|---|
| GET `/game-rounds/{id}/status` | 原始兩人成員可查active／ended；第三人403、撤銷401 |
| GET `/game-rounds/{id}/experience` | 真正最新 episodeSeq；pending_category_selection 回同序類別、本人票、partnerHasVoted；playing／completed 只回目前節點、安全已觸發事件及釘選素材，completed 帶雙方同意狀態；ended 僅安全狀態 |
| GET `/game-rounds/{id}/story/offers` | 受保護類別投影；卡片含 categoryId／rank／title／summary／中性 reason，不回對方票或隱藏主線 |
| POST `/game-rounds/{id}/story/vote` | clientRequestId、episodeSeq、categoryId；同ID同payload回原序號，改payload或已決議場次409 |
| POST `/game-rounds/{id}/story/next` | clientRequestId、completedEpisodeSeq、agree；本人同意／撤回，只有同一最新已完成場次雙方同意才建立下一場；回最新 experience，無內容409 NO_PLAYABLE_STORY |
| POST `/game-rounds/{id}/story/event` | clientRequestId、storySessionId、bindingId、actionId、嚴格 params、expectedTrackRevision；共用世界／Shared 操作另帶 expectedSharedRevision，已有實例另帶 expectedEventRevision。actor／role／node 由登入與 Session 推導；同 payload 回原 receipt，舊 CAS 或改 payload 409；拒 client nextNode／state／另一人答案 |
| POST `/game-rounds/{id}/events/query` | afterSeq或beforeSeq恰一個、limit1～100；未決議他人票由伺服器投影vote_status仍保留sequence；ended拒私人歷史 |
| POST `/game-rounds/{id}/realtime-ticket` | deviceId UUIDv7；30秒一次性ticket綁account／family／cv／Round／device／platform，絕不放URL |
| GET `/game-rounds/{id}/ws` | Upgrade；子協定datinghigh.v1、ticket.<短效值>、device.<UUID>，只echo datinghigh.v1；Web Origin精確比對，native僅無Origin或連線同來源 |
| POST `/game-rounds/{id}/end` | 空object，二次確認由UI執行，任一原成員可永久end；冪等安全狀態 |

WS envelope 為 `{version:1,type,roundId,clientRequestId?,payload}`；白名單 presence.ping、story.vote.submit、message.send、story.next.requested、story.event.submit。`story.choice.submit`／`interaction.submit` 已拒絕。HTTP／WS 的事件命令共用同一 v2 嚴格 payload 與 Application，actor 僅取登入。成功 ACK 帶原 requestId／eventSeq；未知結果保留原 ID 查 receipt，禁止改 ID 自動重送。已知 CAS 409 只重新讀權威快照，由玩家再次明確操作。訊息 trim 後1～500 Unicode scalar，拒控制字元、孤立 surrogate 及 HTML；NPC 台詞不寫成真人訊息。

事件先驗角色、場次／Track／Shared／Event revision、觸發前置及角色可用動作條件，再於合格動作中比對參數。尚未解鎖的私有互動回安全 `EVENT_STATE_CONFLICT`，不能以正／誤答案的不同參數錯誤探測私人線索；有可用動作時的非法參數仍拒絕，任何失敗均不寫入進度或世界狀態。

playing／completed 的 `schemaVersion=scene-event.v2`，含 myTrack(role/nodeId/areaId/revision)、sharedRevision、合法 areas、可見 world.objects／flags、knownClues、availableEvents、cooperation 及 partnerPresence.inSameArea；不提供另一人的 Progress／私有台詞。availableEvents 只帶本人當前合法 params／revision。兩張真人類別票決議後另附 selectionReason，說明同票或採原邀請方最後有效票；未決議及唯一類別直接進場不提供該理由或對方票。presentationCue 含 eventSeq 與有界 camera／audio／expression／character／object／pause 步驟；動畫不提交操作。首次載入、失焦恢復及重送不重播舊 cue；結局 cue 必須在 Server 成功結算後才播放。completed 保留舞台、Round 聊天與 next 同意，沒有新探索或完成按鈕。R2 讀取前後及投影前重驗 family／成員；內部 story.framework.* 只走私有 bridge，raw Manifest 不公開。釘選內容缺檔／SHA 錯誤回 `503 INVALID_STORY_CONTENT`，畫面提供重新同步；恢復讀取原版，不重抽或更改 Session。

active 遊戲入口／恢復、events query、realtime-ticket 及 HTTP／WS 遊戲命令另驗本人目前採用的 ready 五表情；不完整回 `409 OWN_AVATAR_PACK_NOT_READY`。前端清空私人場景並提供個人檔案入口；另一組 pending 化身不影響已就緒的採用者。end 與 ended 安全投影保留。固定內部 `avatar.current.readiness` 只接收登入身分、回 `{ready:true}`，不接受 owner／assetId 或公開素材路徑。

內容宣告多 Area 舞台時，experience 可含 `stage`：`version=scene-stage.v1`、`currentShotId`、安全子集的 `shots`／`areaVisuals`／`embeddedInteractables`／NPC appearance。範圍限本人目前鏡位及已提交 cue 引用，不回完整未觸發舞台、條件或另一人的私人視角；原內容未宣告時省略 stage。cue 另可含有界 `{type:'shot',shotId,durationMs}`；只控制呈現，不由 client 寫回世界或選擇結果。此欄位沒有新增正式 Rig 製作或 binary 讀取端點。

Scene 原創書籍透過 `books:[{id,objectId,title,category,summary,pages}]` 白名單投影，限本人目前 Area 的可見實體書及宣告副本。`stage.weather` 只含公開世界狀態對應的 `intensity`；Area 視覺可含 `weatherRegion`。NPC appearance 可使用公開 `static-npc.v1` 完整身體圖格及完整姿態／表情的 `hitMasks`，不傳可見性條件。可選 `musicAsset` 與 `audioMix:{ambienceGain,musicGain}` 提供目前授權鏡位的原創音樂及混音。一般 Shot 不會繪出實際位於其他 Area 的真人；completed 的權威結局 Shot 保留於 `currentShotId`，`currentNode.presentation.cameraId` 使用該 Shot 的相機，重連不回到結局前鏡位。上述欄位均不增加操作端點，翻書、音訊與微動不提交權威狀態。

`/internal/round-command`僅Worker→Container私有transport，外部`/internal/*`仍阻擋。公開故事素材只允許GET／HEAD `/story-content/assets/<64位sha256>`，不接受query或任意key。

## 配對與邀請

下列配對 PlatformAccess 端點，路徑相對 `/api/v1`。沿用 no-store、Web Origin／Cookie、native Bearer、無 query／未知鍵／重複鍵拒絕；不接受 client score、account owner、SQL 或私人圖片 key。候選 ID 是 profile_id，不是 accountId。

| 方法／路徑 | 輸入／結果 |
|---|---|
| POST `/match-candidates/search` | 嚴格數字 `{offset,limit}`，offset 0～5000、limit 1～20；完整合格集合先計分排序後分頁，`{items:[{candidateId,score,invitationState,invitationId}],nextOffset}`；無 persona |
| GET `/match-candidates/{candidateId}` | 重驗當前授權的單筆 `{candidateId,score,invitationState,invitationId,persona}` |
| POST `/match-invitations` | 嚴格 UUIDv7 字串 `{candidateId,clientRequestId}`；201 pending，反向既有邀請且本人明確同意可200 accepted＋roundId |
| GET `/match-invitations` | `{incoming,outgoing}`；每筆 invitationId、candidateId、status、direction、invalidatedReason、expiresAt、roundId、安全 persona |
| POST `/match-invitations/{id}/accept` | `{}`；只有接收者，200 accepted＋同一個 roundId；不回溯修改後的性向 |
| POST `/match-invitations/{id}/decline` | `{}`；只有接收者，200 declined，此 accountId pair 永久排除 |
| POST `/match-invitations/{id}/cancel` | `{}`；只有發起者，200 cancelled，不永久排除 |
| GET `/game-rounds` | `{items}`，本人目前至多一場 active，含 roundId、status、startedAt、candidateId、persona |
| GET `/game-rounds/{roundId}` | 本人且真正兩人參與的 active 房間；同上單筆物件，無假聊天／名片／真人照 |

persona 僅 nickname、bio、traitTagIds、interestTagIds、selectedAvatarType／Ref、可空 avatarDataUrl。失去硬資格後的歷史邀請可有空 selectedAvatarType／Ref，畫面不以其他圖片補造；候選仍須有有效正式化身。內建化身由原靜態資產顯示；生成化身僅嵌入目前正式資產的短暫 no-store data URL，R2等待後重新授權，不是原照或公開 R2 URL。角色引用也不授權名片。

本模組 expiresAt／startedAt 使用 **Unix milliseconds number**，與 Foundation 的 ISO Timestamp 回應分開。可空 invitationState／invitationId／invalidatedReason／roundId／nextOffset 以 null 表達。失敗：400 `INVALID_MATCH_REQUEST`、401 Session、403 `RESOURCE_FORBIDDEN`、409 `PROFILE_NOT_READY`／`GAME_IN_PROGRESS`／`MATCH_STATE_CONFLICT`、410 `INVITATION_EXPIRED`、429／Retry-After、503依賴故障。配對命令不公開；產品 end 端點見劇情契約。未知結果先 GET 邀請與輪次回查。

## 個資欄位與本人名片

`GET /profile-catalog` 回傳 `fields`，來源唯一contracts/profile-fields.json；groups 包含 gender／romanticOrientation 選項。本人GET與完整PUT包含gender、romanticOrientation、cardVisibility（三者必須出現在完整PUT）。`GET /me/card-preview`只回傳有效開放欄位，關閉鍵直接省略，包含照片metadata與ageBand；精確生日、帳號資訊及私有偏好不分享。client獨立路由`/card-preview`每次進入重讀。MatchingInput 包含性別／性向且與分享設定無關；候選配對不授權他人名片讀取。


契約來源為 [Program.cs](../../backend/src/DatingHigh.Api/Program.cs)、[HttpContract.cs](../../backend/src/DatingHigh.Api/HttpContract.cs)、[前端 api.ts](../../frontend/client/src/api.ts) 及 Worker 固定路由；需求與驗證權威見對應 docs 文件。HTTP 不公開資料 commands，WebSocket 業務通道使用標準協定，不使用 SignalR。

## 照片與化身

照片、化身與本人名片路由沿用 PlatformAccess、本人 Session family、Web Cookie／Origin 與 native Bearer。固定內部命令及 binary bridge 不公開。停用目錄值可保留本人同欄位既存值；新加入或移除後重新加入回400 INVALID_PROFILE，保留時仍核對revision及Session。本人資料使用22鍵嚴格完整 JSON、版本化目錄及 revision CAS；`POST /me/photos` 是唯一允許8MiB JPEG／PNG／WebP binary 的入口，其他 JSON 仍16KiB。照片必須真解碼並壓至200000 bytes，AI輸出上限2MB，兩者不混用。

| 方法與路徑 | 輸入／結果 |
|---|---|
| GET `/profile-catalog` | version、groups、fields；穩定代碼／繁中 label／category／active |
| GET `/avatar-catalog` | version=full-body.v1，16個 male-01～08、female-01～08；assetPath 取共用builtin-avatar-packs.json的neutral內容定址WebP，非真人照片 |
| POST `/me/photos` | binary Content-Type；201安全metadata，超限413、格式400、滿5張409 |
| GET `/me/media/{assetId}` | 本人ready照片或正式AI化身；no-store／nosniff；未授權或已刪不可新讀 |
| POST `/me/avatar/generations` | styleId、UUIDv7 clientRequestId、expectedProducedCount，續產加attemptId；200單張 `{attemptId,index,producedCount,maxCandidates:4,expiresAt}` |
| GET `/me/avatar/candidates/{attemptId}/{index}` | 本人本輪1～4短效圖；過期410、未產404、無效Session401 |
| PUT `/me/avatar/selection` | builtin:{type,builtinAvatarId,expectedRevision}；新生成:{type,attemptId,index,expectedRevision}；既有正式圖:{type,assetId,expectedRevision} |
| GET `/me/card-preview` | 本人分享欄位／化身設定／照片metadata／概略年齡／提醒；無Email、精確生日、擇偶私有資料 |

Profile／photo metadata／排序／刪除見路由表。首次 generation 不會自動補齊4張；重播相同 request 不重送 provider；同帳號競爭409。未知provider用量503 `IMAGE_PROVIDER_UNCERTAIN` 並鎖住本輪，已有候選保留可採用。每輪60分鐘；採用前顯示未來付費／目前免費提醒，取消不提交。已關閉或滿額409。`GET /me/dating-profile` 附安全 `avatarAttempt` 供未知結果後只讀復原；狀態依賴故障時附 `avatarAttemptUnavailable`，前端保留原候選。

五表情生成端另檢查去背後的站姿像素幾何；明顯缺腿、缺腳／鞋或鞋底裁切時，`POST /me/avatar/expressions/next` 回503 `AVATAR_FULL_BODY_INVALID`，不儲存失敗表情、不讓套組ready或切換正式角色。這是缺肢體結構的拒絕，不代表自動判斷身份相似度或畫風；候選仍需本人預覽確認。

真人照片／生成圖不提供公開R2 URL。`ICurrentCardAuthorization` 預設拒絕跨帳號名片及共享照片；同房角色讀取不授予名片或原照權限。

本人資料另附 `generatedAvatars:[{assetId,mimeType,createdAt}]`，只列本人ready正式AI圖，可透過既有selection路由重選，不再呼叫provider或複製圖片。不可選資產回400 `INVALID_AVATAR_SELECTION`；本人資產遇過期revision回409 `PROFILE_VERSION_CONFLICT`。圖片與輸入均不接受owner或R2 key。

候選採用回 `{revision,assetId}`；正式assetId可與attemptId不同。私有proposedAssetId只由.NET產生，不在公開JSON白名單，client不得指定；expectedRevision與資料／排序同為1～Int32.MaxValue。採用失敗補償只取消pending；已提交的ready圖以既有receipt恢復，不因回覆遺失刪圖或重送provider。

刪除／變更來源會關閉不再有效的生成輪次，回409 `AVATAR_SOURCE_CHANGED`。已完成provider但發布失敗視為未知用量；內部持有原lease的失敗補償可在Session到期／撤銷後解除generating狀態，只更新原manifest失敗metadata，不取得來源、不生成新圖或寫入正式資料。所有讀圖／生成／採用仍驗有效Session。

跨SPEC五項內部讀取介面定義於 `IAvatarAndPreferencesReader`；`ProfileReadRequest`的帳號與輪次不是授權證明。介面本身不授權；任何 adapter 都必須另驗有效參與、同意與未終止，不提供公開他人資料捷徑。

## 共通傳輸

- base path 為 `/api/v1`。**原 PlatformFoundation 認證 request body** 仍僅接受大小寫敏感的 JSON 字串欄位，拒絕 null／數字／布林／重複與未知欄位；原深度8／16384 bytes 限制不變。**交友資料／排序／化身輸入** 使用獨立的嚴格完整 JSON parser，支援規格的數字、null、字串與標籤陣列；同樣拒絕重複／未知欄位、非 object、超過 16384 bytes。
- `/api` 請求不接受 query。需要 body 時使用 `application/json`；GET 無 body。伺服器回應 camelCase，API／health 設 `Cache-Control: no-store`。
- `clientPlatform` 值固定 `web | ios | android`。middleware 優先從 body、`X-DatingHigh-Client`、Origin／Authorization 等既有規則判斷；應由共用 client 明確送正確 header，不自建平台推斷。
- 有 Origin 只能為 web。Web 的非 GET／HEAD／OPTIONS 請求必須精確匹配 `WEB_ORIGIN`、`X-DatingHigh-Client: web` 及正確 Content-Type（只有照片 POST 可用核准圖片 MIME）。
- Web 只從 HttpOnly Cookie 取得 Access／Refresh，原生只從 Bearer／body 取得；Web body 的 refreshToken 不作憑證來源。
- 授權成功及登入回應附 `X-DatingHigh-Session`。允許的 CORS origin 可讀此標頭、`Retry-After`、`Date`；允許 methods 為 GET／POST／PUT／DELETE／OPTIONS，headers 為 Content-Type／X-DatingHigh-Client／Authorization，並允許 credentials。

## 路由

下表路徑皆相對 `/api/v1`；「本人」表示 PlatformAccess，先驗 JWT 再查 D1 目前 family／cv。

| 方法與路徑 | 授權 | Body 欄位 | 成功 |
|---|---|---|---|
| POST `/email-registrations` | 匿名 | email、clientPlatform | 202 ChallengeMetadata |
| POST `/password-reset-requests` | 匿名 | email、clientPlatform | 202 ChallengeMetadata；未知 Email 仍同形，不寄碼 |
| POST `/accounts` | 匿名 | challengeId、flowToken、code、password、clientPlatform | 201 LoginResponse |
| POST `/email-challenges/{id}/resend` | 匿名 | flowToken | 202 ChallengeMetadata |
| POST `/sessions` | 匿名 | email、password、clientPlatform | 201 LoginResponse |
| POST `/sessions/external/{provider}` | 匿名 | credential、clientPlatform | 新 Google 帳號 201／既有 200 LoginResponse |
| POST `/session/refresh` | 匿名，以 Refresh 驗證 | clientPlatform；refreshToken optional（native 成功必需，web 用 Cookie） | 200 LoginResponse |
| DELETE `/session` | 匿名，以所帶憑證定位 family | refreshToken、sessionId 均 optional | 204；Web 清 Cookie；sessionId 可防止撤較新 family |
| POST `/password-resets` | 匿名 | challengeId、flowToken、code、newPassword | 204；不自動登入 |
| GET `/session` | 本人 | 無 | 200 CurrentSessionResponse |
| GET `/me` | 本人 | 無 | 200 Account |
| GET `/me/dating-profile` | 本人 | 無 | 200 個人資料完整本人欄位、照片 metadata、選用化身、revision、profileReady；不回登入 Email 或 R2 key |
| PUT `/me/dating-profile` | 本人 | expectedRevision、nickname、bio、occupation、birthDate、regionCode、traitTagIds、interestTagIds、topicTagIds、valueTagIds、5 種生活互動偏好、preferredAgeMin／Max、preferredRegionCodes、sharedInterestWeight、gender、romanticOrientation、cardVisibility | 200 `{revision}`；首次可先建空 profile；409 `PROFILE_VERSION_CONFLICT`、401 `SESSION_REVOKED`；驗證目錄內代碼 |
| GET `/me/photos` | 本人 | 無 | 200 `{photos:[{assetId,mimeType,displayOrder,createdAt}]}`；只回本人 ready、no-store，無 R2 key |
| PUT `/me/photos/order` | 本人 | 嚴格 JSON `{expectedRevision:number,assetIds:UUIDv7[1..5]}`，不可重複／缺少／多餘 ID | 200 `{revision}`；D1 批次核驗本人全部 ready 集合且按順序重排，0列→重新驗 session 後 401／409；無效 body→400 |
| DELETE `/me/photos/{assetId}` | 本人 | 無業務欄位；Web 依既有 CSRF gate 傳送空 `{}` JSON，native 可無 body | 204；只允許本人 ready UUIDv7，以目前 profile revision 進行 D1 soft delete＋剩餘照片排序壓緊；猜 ID／重複刪除 404、失效 session 401、競態 409；成功軟刪後嘗試清除R2，故障由GC補償 |
| PUT `/me/password` | 本人 | currentPassword、newPassword | 204，Web 清 Cookie |
| POST `/me/identities/{provider}` | 本人 | credential、clientPlatform | 200 `{provider: string, linked: true}`；不踢登出 |
| GET `/me/identities` | 本人 | 無 | 200 IdentityList |
| DELETE `/me/identities/{provider}` | 本人 | currentPassword | 204，Web 清 Cookie |

`provider` 目前只支援 `google`，不是任意 provider adapter。challenge ID／session ID 是小寫 canonical UUIDv7；code 是六位 ASCII 數字字串，保留前導零。flowToken／Refresh 是 32-byte 隨機值的 43 字元 base64url。密碼規則見 [資料契約](02-data-contracts.md)。

DELETE `/session` 不要求仍有效的登入；未知／已撤銷憑證可冪等 204。若 Access／Refresh 指向不同 family 回 400 `CREDENTIAL_FAMILY_MISMATCH`；與 optional sessionId 不符回 409 `SESSION_CHANGED`，不撤較新 family。不得把 optional sessionId 當作可直接撤任意 session 的授權。

| 健康路由 | 成功 | 說明 |
|---|---|---|
| GET `/health/live` | 200 `{status: "alive"}` | 只證明 API 程序存活 |
| GET `/health/ready` | 200 `{status: "ready"}` | 設定、migration／schema／index、R2 probe 都就緒；否則 503 |

公開 `/internal`、其子路徑與 `/v1/commands/*` 回 404；未知 API 回 ProblemDetails 404，不回 SPA HTML。健康路由不需使用者登入，但 ready 仍須正確的 Worker 可信環境。

## 回應型別

以下為 wire schema；`?` 代表省略，沒有宣告 nullable 的成功欄位不回 null。`Timestamp` 是 .NET DateTimeOffset 序列化的 ISO 8601 字串（含 UTC／offset），不要要求固定小數位或只接受 `Z`。

```typescript
type Timestamp = string;
type Account = {
  accountId: string; email: string; emailVerified: boolean;
  hasLocalPassword: boolean; linkedProviders: string[]; createdAt: Timestamp;
};
type Session = {
  sessionId: string; absoluteExpiresAt: Timestamp; idleExpiresAt: Timestamp;
};
type ChallengeMetadata = {
  challengeId: string; flowToken: string; expiresAt: Timestamp;
  absoluteExpiresAt: Timestamp; resendAfter: Timestamp; message: string;
};
type WebTokens = {accessExpiresAt: Timestamp; refreshExpiresAt: Timestamp};
type NativeTokens = WebTokens & {
  tokenType: 'Bearer'; accessToken: string; refreshToken: string;
};
type LoginResponse = {account: Account; session: Session; tokens: WebTokens | NativeTokens};
type CurrentSessionResponse = {
  account: Account; session: Session;
  tokenMetadata: {accessExpiresAt: Timestamp; refreshExpiresAt: Timestamp};
};
type IdentityList = {
  hasLocalPassword: boolean;
  identities: {provider: string; linkedAt: Timestamp}[];
};
type Problem = {
  type: string; title: string; status: number; code: string; traceId: string;
  recovery?: ChallengeMetadata;
};
```

目前 Account 的 `emailVerified` 為 true，linkedProviders 為空或含 google；不回 password hash、provider subject、cv 或 Google proof。登入 WebTokens 只有期限，原生 NativeTokens 才有平台 token。GET session 使用 tokenMetadata，並非登入回應的 tokens。

前端 `Account` 對應上述帳號欄位；`SessionResponse` 為 client 接受不同 session 回應的較窄介面（account／tokens optional，session 只宣告 sessionId），不代表伺服器成功回應可省略其他上述欄位。`EmailFlow` 的 emailMasked／purpose／deliveryFailed 是 client metadata，並非 ChallengeMetadata 的 wire 欄位。

## Cookie 與失敗

local Cookie 名稱為 `datinghigh_access_dev`／`datinghigh_refresh_dev`；cloud 為 `__Host-datinghigh_access`／`__Host-datinghigh_refresh`。皆 HttpOnly、SameSite=Strict、Path=/、不設 Domain；cloud 加 Secure，local loopback HTTP 為例外。

ProblemDetails Content-Type 為 `application/problem+json`，type 使用 `urn:datinghigh:problem:<lowercase-hyphen-code>`。只在 503 `EMAIL_DELIVERY_FAILED` 的可恢復註冊／重寄回 recovery；不回 raw code。reset sender 故障仍維持同形 metadata，不能由 202 推論寄送成功。

| 狀態 | 常見 code／來源 |
|---|---|
| 400 | INVALID_REQUEST、INVALID_EMAIL、INVALID_PASSWORD、INVALID_PLATFORM、INVALID_OR_EXPIRED_CODE、UNSUPPORTED_PROVIDER、CREDENTIAL_FAMILY_MISMATCH |
| 401 | INVALID_CREDENTIALS、CURRENT_PASSWORD_INVALID、ACCESS_TOKEN_MISSING／INVALID／EXPIRED、SESSION_REVOKED、REFRESH_INVALID／REVOKED／EXPIRED、REFRESH_TOKEN_REUSE、EXTERNAL_CREDENTIAL_INVALID、EXTERNAL_EMAIL_UNTRUSTED |
| 403 | ORIGIN_FORBIDDEN；內部私人資源拒絕可為 RESOURCE_FORBIDDEN |
| 404 | NOT_FOUND |
| 409 | EMAIL_ALREADY_REGISTERED、EXTERNAL_IDENTITY_IN_USE、EXTERNAL_EMAIL_CHANGED／MISMATCH、CREDENTIAL_CHANGED、REFRESH_RETRY、SESSION_CHANGED、PASSWORD_NOT_SET、LAST_LOGIN_METHOD |
| 410 | 註冊 challenge 的 CODE_EXPIRED／CODE_LOCKED；reset 的無效／到期維持通用 400 |
| 413 | REQUEST_TOO_LARGE |
| 429 | RATE_LIMITED，附 Retry-After 秒數 |
| 500 | INTERNAL_ERROR |
| 503／504 | DEPENDENCY_UNAVAILABLE、EMAIL_DELIVERY_FAILED、EXTERNAL_PROVIDER_UNAVAILABLE；Worker 啟動 timeout 為 STARTUP_TIMEOUT 504 |

前端另有 NETWORK_ERROR／REQUEST_SUPERSEDED／SECURE_STORAGE_FAILED／LOGOUT_PENDING 等本機 ApiFailure，不把它們視作伺服器 code。read 可受控重試；mutation 不因逾時就當成未提交而重送。

變更端點時同步 route、用例、前端型別／呼叫、HTTP 測試與本文件；影響資料條件時還需同步 [資料契約](02-data-contracts.md) 和真 D1 測試。
