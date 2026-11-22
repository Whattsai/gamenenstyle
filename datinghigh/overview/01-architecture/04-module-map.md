# 模組與修改入口

## 化身與場景

Gemini全身候選／五表情：`Media/GeminiAvatarImageGenerator.cs`；受控背景解碼／去背：`Media/AvatarChromaMask.cs`（Infrastructure既有Skia）。免費圖片由 contracts/builtin-avatar-packs.json 對應 public 目錄中的正式 WebP。

本人目前採用化身的遊戲入口由 `StoryDialogueService` 呼叫 Worker `round-avatar.ts` 的固定 `avatar.current.readiness` 驗證；此檢查涵蓋入口、恢復、票券及共用遊戲命令，畫面拒絕狀態由 `StoryExperienceScreen` 呈現。

角色讀取與演出模組：Application `AvatarReadService.cs`、Domain `SceneEventTrackPolicy.cs`、Infrastructure `Media/AvatarReadStore.cs`；Worker `round-avatar.ts`／`avatar-notification.ts`／`builtin-avatar.ts`；client `StoryStage.tsx`／`StoryPortrait.tsx`／`story-stage-geometry.ts`／`story-avatar.ts`。`tools/generate-builtin-avatar-assets.mjs` 依正式目錄與SHA重建16張neutral的選角import，直接匯入同一public來源。書店分層背景／透明前景在 `contracts/story-assets/`，prompt留同目錄provenance。`tools/avatar-reset-policy.mjs` 與既有local wrapper提供具名清單預覽／重試，沒有玩家公開重置API。

表情製作用例位於 Application `AvatarExpressionService.cs`／`Media/AvatarExpressionStore.cs`（介面），Infrastructure `Media/AvatarExpressionStore.cs`／既有 Gemini adapter 表情方法；Worker `avatar-adoption.ts`、`avatar-expression-manifest.ts`、`avatar-expression-store.ts`、`transparent-webp.ts`；client `avatar-adoption.ts` 接 `DatingProfileScreen`，ADVStage 接收單一 partner 參數；測試留在對應模組與跨系統測試目錄。

atlas 分層元件為 client `ActorMotionRenderer.tsx`，純 Rig 型別／姿態／表情與手錨校驗在 `actor-rig-policy.ts`（不依賴 React Native，供舞台預檢與 renderer 共用）；審查入口為 `tests/component-layout/scene-rig-preview.tsx` 與 `rig-review-catalog.ts`，Web 由 `server.mjs` 供應固定白名單素材，Android 由 development-only `tests/native/rig-entry.tsx` 掛載。此入口不寫正式角色目錄或 ready 狀態。

## 劇情與即時通訊

| 責任 | 位置 |
|---|---|
| 推薦／投票／文字／圖驗證 | `backend/src/DatingHigh.Domain/StoryPolicies.cs`、`SceneEventTrackPolicy.cs` |
| 共用用例／通知port | `backend/src/DatingHigh.Application/StoryDialogueService.cs`、`SceneEventFrameworkService.cs` |
| 場景／主線／事件純規則與編譯 | `backend/src/DatingHigh.Domain/SceneEventFrameworkPolicies.cs`、`SceneEventTrackPolicy.cs` |
| 通知adapter／HTTP嚴格JSON／DI | `backend/src/DatingHigh.Infrastructure/CloudflareRoundRealtimeNotifier.cs`、`backend/src/DatingHigh.Api/StoryPayload.cs`、`Program.cs` |
| 劇情目錄／Round／active claims／固定SQL | `cloudflare/migrations/0005_story_dialogue_exit.sql`、`cloudflare/src/story-commands.ts`、`matching-commands.ts` |
| 雙 Track／共享世界／選場與事件交易／授權內容 | `cloudflare/migrations/0007_scene_event_tracks.sql`、`cloudflare/src/scene-event-commands.ts`、`scene-event-track-commands.ts`、`scene-event-track-content.ts`、`scene-event-track-graph.ts`、`scene-event-presentation-schema.ts`、`scene-event-authorization.ts`、`scene-event-read.ts`、`scene-event-content.ts` |
| 標準WS／ticket／內容 | `cloudflare/src/room-socket.ts`、`realtime-ticket.ts`、`story-content.ts` |
| 共用場景／演出／互動／音訊／transport | `frontend/client/src/StoryExperienceScreen.tsx`、`ADVStage.tsx`、`SceneEventActions.tsx`、`SceneWorldObjects.tsx`、`SceneStoryMotion.tsx`、`StoryAudio.tsx`、`RealtimeRoomClient.ts`、`story.ts` |
| 正式內容／發布／本地升級 | `contracts/scene-event-content.json`、`contracts/rain-bookshop-last-order.json`、`contracts/story-assets/`、`tools/scene-event-content-policy.mjs`、`scene-event-publish-policy.mjs`、`scene-event-local-policy.mjs`、`local.mjs` |
| 事件演出安全覆寫 | `frontend/client/src/scene-event-track.ts`、`scene-browser-lifecycle.ts`、既有 `ADVStage.tsx`／`StoryAudio.tsx` |
| 多 Area 舞台契約／安全投影／原位命中 | `cloudflare/src/scene-event-stage-content.ts`（所有 NPC 資產／持物手錨 fail-closed）、`backend/src/DatingHigh.Application/SceneEventStageProjection.cs`、`frontend/client/src/scene-stage.ts`（公開 NPC Rig 組裝）、`EmbeddedSceneStage.tsx`（錯誤圖片關閉互動）、`SceneStoryMotion.tsx`（釘選書本圖像演出） |
| 真D1／DO／HTTP／UX證據 | `cloudflare/tests/story-dialogue-*.test.ts`、`backend/tests/DatingHigh.Api.Tests/StoryDialogueEndpointTests.cs`、`frontend/client/tests/unit/story-dialogue*`、`tests/e2e/{web,android}/scene-event-framework.*`、`tests/integration/story-dialogue-live.test.mjs` |

## 配對與邀請

本地測試維運另有`tools/local-game-policy.mjs`固定結束SQL，僅由`tools/local.mjs`／`local-policy.mjs`的`game-end`及`query --view games`使用；package scripts為`game:end:local`／`game:list:local`。不打包到Api／Worker，不提供公開管理路由。探索卡與邀請列表共用永久婉拒確認。

| 責任 | 位置 |
|---|---|
| 純雙向計分／固定縣市代表點 | `backend/src/DatingHigh.Domain/MatchingScore.cs` |
| 受限 reader 契約、候選排序、邀請及輪次用例 | `backend/src/DatingHigh.Application/MatchingSessionService.cs` |
| 固定指令 reader | `backend/src/DatingHigh.Infrastructure/MatchingCandidateProfileReader.cs` |
| 數字 JSON parser／九端點／DI | `backend/src/DatingHigh.Api/MatchingPayload.cs`、`Program.cs` |
| 四表及原子命令／來源同步判斷 | `cloudflare/migrations/0004_matching_sessions.sql`、`src/matching-commands.ts`、`src/commands.ts` |
| 限定正式生成化身的 R2 讀取／重新授權 | `cloudflare/src/platform.ts` |
| 登入分流、探索、邀請、真輪次房間 | `frontend/client/src/MatchingScreen.tsx`、`src/matching.ts`；`app/start.tsx`、`matching.tsx`、`invitations.tsx`、`game-round/[roundId].tsx` |
| 計分／HTTP＋真 D1／SQL 故障證據 | `backend/tests/DatingHigh.Unit.Tests/Domain/MatchingScoreTests.cs`、`backend/tests/DatingHigh.Api.Tests/Matching{Endpoint,RealD1}Tests.cs`、`cloudflare/tests/matching-sessions-d1.integration.test.ts` |
| 共用 UI／Web／Android／真平台 | `frontend/client/tests/unit/matching-sessions.test.tsx`、`tests/e2e/{web,android}/matching-sessions.*`、`tests/integration/matching-sessions-live.test.mjs` |

上述相對 `src`／`app` 路徑依該列模組根目錄解讀；產品退出由 StoryDialogueService 處理，本地維運命令不屬公開 API。

## 個資欄位與名片

- `contracts/profile-fields.json`、Domain `ProfileFields.cs`：跨.NET／Worker共用定義，API目錄提供client；不是任意資料寫入引擎。
- `cloudflare/migrations/0003_profile_gender_card_visibility.sql`：三欄向前升級，固定commands維持原子性。
- `frontend/client/src/profile-fields.ts`：型別、有效分享預設、payload與草稿比較。
- `frontend/client/app/card-preview.tsx`、`src/CardPreviewScreen.tsx`：獨立名片載入與可重用唯讀CardDisplay，照片來源由載入端注入。DatingProfileScreen 透過獨立路由開啟名片。


## 基礎平台與共用模組

所有路徑以 DatingHigh 根目錄為基準。端點與欄位詳見 [API](../03-contracts/01-api-contracts.md)／[資料契約](../03-contracts/02-data-contracts.md)。

| 模組 | 主要位置 | 常見修改 |
|---|---|---|
| Domain 規則 | `backend/src/DatingHigh.Domain/Policies.cs`、`SessionLifetime.cs`、`AvatarAndPreferencesPolicies.cs` | Email、密碼、ID、期限、資源預設拒絕；AvatarAndPreferences nickname／age／photo quota／AI 索引領域規則 |
| 認證用例 | `backend/src/DatingHigh.Application/AuthApplication.cs` | 註冊、登入、refresh、重設、密碼與 identity |
| 本人交友資料用例 | `backend/src/DatingHigh.Application/DatingProfileService.cs` | 本人完整 JSON 驗證、18+、Unicode scalar、首次 profile ensure、Session／revision CAS、無秘密讀取投影；目錄驗證／停用值僅保留同欄歷史值／安全投影 |
| 本人真人照管理 | `backend/src/DatingHigh.Application/PersonalPhotosService.cs` | 本人照片上傳、共用壓縮、私人 R2 讀取／刪除、安全 metadata、D1 完整重排／CAS、soft-delete／壓緊與 Session 重驗 |
| 介面契約 | Application 的 `Contracts.cs`、`SecurityContracts.cs`、`RateLimiting.cs`、`PrivateObjects.cs` | adapter／CurrentUser／結果協作 |
| 密碼學 | Infrastructure 的 `PasswordHashService.cs`、`AccessTokens.cs`、`AuthCryptography.cs`、`Crypto.cs` | 雜湊、JWT、opaque token、HMAC |
| 外部與資料 bridge | Infrastructure 的 `PlatformClient.cs`、`GoogleExternalCredentialValidator.cs`、`EmailCodeSender.cs`、`PrivateObjectStore.cs` | 固定指令、驗簽、sender、owner |
| 就緒與限流 | Infrastructure 的 `Readiness.cs`、`RateLimiter.cs`、`AuthOptions.cs` | 設定、依賴檢查與限流 adapter |
| HTTP | `backend/src/DatingHigh.Api/Program.cs`、`HttpContract.cs`、`PlatformAuthentication.cs` | 路由／DI、嚴格輸入、Cookie、ProblemDetails、family 驗證；交友資料 GET/PUT、真人照 metadata GET／排序 PUT／邏輯刪除 DELETE；特定 PUT 使用獨立完整 JSON parser，原認證入口不變 |
| Worker ingress／container | `cloudflare/src/index.ts`、`router.ts` | assets、CORS、可信標頭與容器生命週期 |
| Worker 內部平台 | `cloudflare/src/platform.ts`、`strict-json.ts` | ready、Foundation R2、sender、固定 JWKS、清理及嚴格解析；內部 binary 照片 PUT／GET／DELETE 與 GC |
| D1 | `cloudflare/src/commands.ts`、`migrations/0001_foundation.sql`、`migrations/0002_avatar_preferences.sql` | Zod 輸入、prepared SQL、原子 batch 與 schema；profile.ensure/read/update CAS、profile.avatar.builtin/generated CAS、photo.reserve/ready/delete/list/reorder/delete-compact，及 Unicode scalar 一致性；個資與私人 R2 媒體由固定命令協調 |
| Expo 啟動與頁面 | `frontend/client/app/_layout.tsx`、`index.tsx`、`register.tsx`、`verify-email.tsx`、`login.tsx`、`forgot-password.tsx`、`reset-password.tsx`、`account.tsx`、`account/password.tsx`、`account/connections.tsx` | 九條帳號路由與共用 provider |
| 前端共用 UI | `frontend/client/src/Screen.tsx`、`ui.tsx`、`forms.ts`、`pending-back-guard.ts`、`app/global.css`、`assets/bg-cafe.jpg` | 版面、表單／等待、返回防護與視覺 |
| 前端連線與儲存 | `src/api.ts`、`api-origin.ts`、`session.tsx`、`storage.ts`、`storage-policy.ts`、`flow.ts` | refresh、復原、允許持久化欄位 |
| Google 與原生設定 | client 的 `src/GoogleButton.web.tsx`、`src/GoogleButton.tsx`、`app.config.ts`、`plugins/with-no-network-retry.cjs` | SDK、scheme、Android 網路重試；原生SDK啟動／Play服務／設定／無可用帳號與取得proof後的交換失敗分開提示，不公開SDK原始例外；plugin 變更須重建 APK |
| 本地工具 | `tools/local.mjs`、`local-policy.mjs`、`restart-local.mjs`、`setup-wsl.ps1`、`wsl-egress.mjs` | instance、資料 wrappers、WSL 與 loopback relay |
| 建置／驗證工具 | `tools/build-android.ps1`、`test-android.ps1`、`check.mjs`、`foundation-policy.mjs`、`audit-foundation.mjs`、`deploy-preflight.mjs` | 建置、平台案例、證據評估與部署預檢 |
| Probe | `backend/tools/DatingHigh.PlatformProbe/Program.cs` | 真 .NET outbound 及私人 R2 整合檢查；不作公開端點 |

上表省略前綴的頁面檔名相對 `frontend/client/app/`；前端 `src/...` 相對 `frontend/client/`；Infrastructure／Application 指對應 `backend/src/DatingHigh.*`。

## 測試入口

| 位置 | 證明範圍 |
|---|---|
| `backend/tests/DatingHigh.Unit.Tests/` | Domain／Application／Infrastructure 規則與邊界 |
| `backend/tests/DatingHigh.Api.Tests/` | HTTP 輸入、授權、Cookie、response；fixture 不能代替真 SQL |
| `backend/tests/DatingHigh.Integration.Tests/` | 透過 `RealPlatform.cs`／根 integration runner 的真 D1 與 bridge |
| `backend/tests/DatingHigh.E2eHost/HostMain.cs`、`AvatarFixtureState.cs` | 受控 E2E HTTP／sender／回應遺失；明選avatar profile時以真D1／R2驗圖片供應商故障，非production服務 |
| `cloudflare/tests/` | commands／ingress／strict JSON／JWKS、Foundation及本SPEC真Miniflare D1／R2；照片配額／排序／刪除、候選lease／採用補償與跨Worker CAS。Application及HTTP端到端證據另在backend Integration與根Web／Android E2E，不以單層測試擴推整體驗收 |
| `frontend/client/tests/unit/` | API／storage／session／表單／SDK controller |
| `tools/tests/` | local instance、重啟、WSL relay、版本及測試 profile 政策 |
| `tools/native-audio-policy.mjs` | 從記憶體中的 Android audio dump 依指定 App UID 篩出播放器狀態；不輸出原始 dump、資產 URI 或其他 App 資料 |
| `tests/integration/` | 真本地平台、Email log、restart、key rotation、readiness 故障 |
| `tests/e2e/web/`、`tests/e2e/android/` | 真 UI 與各種正常／故障矩陣 |
| `tests/e2e/web/audio-browser.ts` | 單一音效生命週期案例的獨立Chrome；default context使用noDefaults保留真切頁事件，只處理本身視窗與受控臨時profile，關閉後驗證路徑邊界並清理 |
| `tests/component-layout/`、`tests/native/` | 共用 UI 版面 adapter、development-only native 故障 adapter |
| `tests/e2e/runbooks/` | 本地資料、三平台、受控故障及 staging 的操作前提 |

`prototypes/prototype.v2/` 是 Next.js 提案原型，與 Expo 正式 runtime 分開。`docs/verification` 的 JSON／Markdown 保存追溯與覆核；測試原始去敏摘要放忽略的 `.local/evidence`。

Android 測試的部分 import／Metro／APK 路徑尚未隨搬移更新，現況限制見 [工作流](../02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制)。

## 媒體與生成角色

- `Application/AvatarService.cs`：本人明確生成／重播／採用；`ProfileProjections.cs`：分享欄位白名單及預設拒絕授權介面。
- `Application/Media/`、`Infrastructure/Media/`：Skia壓縮、私人媒體bridge、Gemini adapter、候選binary I/O；StyleReferences為原型圖風格參考。
- `cloudflare/src/media-cleanup.ts`：有預算的私人媒體清理與R2進度metadata；`cloudflare/src/avatar-attempts.ts`：R2 manifest CAS、同帳號排他、短效候選、採用與復原；固定D1命令仍在commands.ts。
- `frontend/client/app/profile.tsx`、`src/DatingProfileScreen.tsx`：資料、照片、16款免費化身、AI候選與本人名片預覽；`avatar-assets.ts`匯入public/avatars的正式neutral圖片。
- `tools/verify-avatar-live.mjs`、`backend/tools/DatingHigh.MediaProbe/`：明確授權真人照片的本地真測，不保存憑證／原始照片；MediaProbe只擷取白名單模型／token／耗時，成本按官方費率估算、不是帳單。
- `tests/e2e/web/avatar-*.spec.ts`、`tests/e2e/android/avatar-{preferences,photos,gemini-live}.mjs`：跨系統UI證據，分別驗基本資料、系統picker與照片CRUD、明確opt-in真生成採用；分平台限制見驗證紀錄。
- `backend/src/DatingHigh.Application/AvatarPreferencesReadContracts.cs`：內部讀取介面與白名單投影；介面不提供跨帳號授權，須由用例另驗參與／同意條件。
- `cloudflare/tests/avatar-worker-cas.integration.test.ts`：兩個獨立Worker runtime共享真Miniflare D1／R2的首次／第4張競態、重播與到期證據。
