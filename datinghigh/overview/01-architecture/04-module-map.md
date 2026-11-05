# 模組與修改入口

## 2026-11-05 新增入口

- `contracts/profile-fields.json`、Domain `ProfileFields.cs`：跨.NET／Worker共用定義，API目錄提供client；不是任意資料寫入引擎。
- `cloudflare/migrations/0003_profile_gender_card_visibility.sql`：三欄向前升級，固定commands維持原子性。
- `frontend/client/src/profile-fields.ts`：型別、有效分享預設、payload與草稿比較。
- `frontend/client/app/card-preview.tsx`、`src/CardPreviewScreen.tsx`：獨立名片載入與可重用唯讀CardDisplay，照片來源由載入端注入。DatingProfileScreen不再內嵌名片。


所有路徑以 DatingHigh 根目錄為基準。端點與欄位詳見 [API](../03-contracts/01-api-contracts.md)／[資料契約](../03-contracts/02-data-contracts.md)。

| 模組 | 主要位置 | 常見修改 |
|---|---|---|
| Domain 規則 | `backend/src/DatingHigh.Domain/Policies.cs`、`SessionLifetime.cs`、`AvatarAndPreferencesPolicies.cs` | Email、密碼、ID、期限、資源預設拒絕；新增 AvatarAndPreferences nickname／age／photo quota／AI 索引領域規則；媒體／AI用例及分平台證據見下方模組與驗證紀錄 |
| 認證用例 | `backend/src/DatingHigh.Application/AuthApplication.cs` | 註冊、登入、refresh、重設、密碼與 identity |
| 本人交友資料用例 | `backend/src/DatingHigh.Application/DatingProfileService.cs` | 本人完整 JSON 驗證、18+、Unicode scalar、首次 profile ensure、Session／revision CAS、無秘密讀取投影；目錄驗證／停用值僅保留同欄歷史值／安全投影 |
| 本人真人照管理（局部） | `backend/src/DatingHigh.Application/PersonalPhotosService.cs` | 只讀本人 ready 照片安全 metadata，D1 原子完整重排與 CAS、ready soft-delete＋壓緊、失效 Session 二次查核；**未接私人 R2 刪除、上傳與共用壓縮** |
| 介面契約 | Application 的 `Contracts.cs`、`SecurityContracts.cs`、`RateLimiting.cs`、`PrivateObjects.cs` | adapter／CurrentUser／結果協作 |
| 密碼學 | Infrastructure 的 `PasswordHashService.cs`、`AccessTokens.cs`、`AuthCryptography.cs`、`Crypto.cs` | 雜湊、JWT、opaque token、HMAC |
| 外部與資料 bridge | Infrastructure 的 `PlatformClient.cs`、`GoogleExternalCredentialValidator.cs`、`EmailCodeSender.cs`、`PrivateObjectStore.cs` | 固定指令、驗簽、sender、owner |
| 就緒與限流 | Infrastructure 的 `Readiness.cs`、`RateLimiter.cs`、`AuthOptions.cs` | 設定、依賴檢查與限流 adapter |
| HTTP | `backend/src/DatingHigh.Api/Program.cs`、`HttpContract.cs`、`PlatformAuthentication.cs` | 路由／DI、嚴格輸入、Cookie、ProblemDetails、family 驗證；交友資料 GET/PUT、真人照 metadata GET／排序 PUT／邏輯刪除 DELETE；特定 PUT 使用獨立完整 JSON parser，原認證入口不變 |
| Worker ingress／container | `cloudflare/src/index.ts`、`router.ts` | assets、CORS、可信標頭與容器生命週期 |
| Worker 內部平台 | `cloudflare/src/platform.ts`、`strict-json.ts` | ready、Foundation R2、sender、固定 JWKS、清理及嚴格解析；內部binary照片PUT／GET／DELETE及GC已接.NET |
| D1 | `cloudflare/src/commands.ts`、`migrations/0001_foundation.sql`、`migrations/0002_avatar_preferences.sql` | Zod 輸入、prepared SQL、原子 batch 與 schema；新增 profile.ensure/read/update CAS、profile.avatar.builtin/generated CAS、photo.reserve/ready/delete/list/reorder/delete-compact，及 Unicode scalar 一致性；真 D1 局部完成，個人 GET/PUT API 已接通，已接私人R2媒體 |
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
| `tests/integration/` | 真本地平台、Email log、restart、key rotation、readiness 故障 |
| `tests/e2e/web/`、`tests/e2e/android/` | 真 UI 與各種正常／故障矩陣 |
| `tests/component-layout/`、`tests/native/` | 共用 UI 版面 adapter、development-only native 故障 adapter |
| `tests/e2e/runbooks/` | 本地資料、三平台、受控故障及 staging 的操作前提 |

`prototypes/prototype.v2/` 是 Next.js 提案原型，與 Expo 正式 runtime 分開。`docs/verification` 的 JSON／Markdown 保存追溯與覆核；測試原始去敏摘要放忽略的 `.local/evidence`。

Android 測試的部分 import／Metro／APK 路徑尚未隨搬移更新，現況限制見 [工作流](../02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制)。

## AvatarAndPreferences 新增模組（2026-11-03）

- `Application/AvatarService.cs`：本人明確生成／重播／採用；`ProfileProjections.cs`：分享欄位白名單及預設拒絕授權介面。
- `Application/Media/`、`Infrastructure/Media/`：Skia壓縮、私人媒體bridge、Gemini adapter、候選binary I/O；StyleReferences為原型圖風格參考。
- `cloudflare/src/media-cleanup.ts`：有預算的私人媒體清理與R2進度metadata；`cloudflare/src/avatar-attempts.ts`：R2 manifest CAS、同帳號排他、短效候選、採用與復原；固定D1命令仍在commands.ts。
- `frontend/client/app/profile.tsx`、`src/DatingProfileScreen.tsx`：資料、照片、16款免費化身、AI候選與本人名片預覽；`avatar-assets.ts`及assets/avatars保存正式免費素材與來源。
- `tools/verify-avatar-live.mjs`、`backend/tools/DatingHigh.MediaProbe/`：明確授權真人照片的本地真測，不保存憑證／原始照片；MediaProbe只擷取白名單模型／token／耗時，成本按官方費率估算、不是帳單。
- `tests/e2e/web/avatar-*.spec.ts`、`tests/e2e/android/avatar-{preferences,photos,gemini-live}.mjs`：跨系統UI證據，分別驗基本資料、系統picker與照片CRUD、明確opt-in真生成採用；分平台限制見驗證紀錄。
- `backend/src/DatingHigh.Application/AvatarPreferencesReadContracts.cs`：後續SPEC五項內部讀取契約；目前只有介面與白名單投影，尚未註冊跨帳號授權adapter。
- `cloudflare/tests/avatar-worker-cas.integration.test.ts`：兩個獨立Worker runtime共享真Miniflare D1／R2的首次／第4張競態、重播與到期證據。
