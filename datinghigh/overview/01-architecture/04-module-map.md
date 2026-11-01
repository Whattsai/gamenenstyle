# 模組與修改入口

所有路徑以 DatingHigh 根目錄為基準。端點與欄位詳見 [API](../03-contracts/01-api-contracts.md)／[資料契約](../03-contracts/02-data-contracts.md)。

| 模組 | 主要位置 | 常見修改 |
|---|---|---|
| Domain 規則 | `backend/src/DatingHigh.Domain/Policies.cs`、`SessionLifetime.cs` | Email、密碼、ID、期限、資源預設拒絕 |
| 認證用例 | `backend/src/DatingHigh.Application/AuthApplication.cs` | 註冊、登入、refresh、重設、密碼與 identity |
| 介面契約 | Application 的 `Contracts.cs`、`SecurityContracts.cs`、`RateLimiting.cs`、`PrivateObjects.cs` | adapter／CurrentUser／結果協作 |
| 密碼學 | Infrastructure 的 `PasswordHashService.cs`、`AccessTokens.cs`、`AuthCryptography.cs`、`Crypto.cs` | 雜湊、JWT、opaque token、HMAC |
| 外部與資料 bridge | Infrastructure 的 `PlatformClient.cs`、`GoogleExternalCredentialValidator.cs`、`EmailCodeSender.cs`、`PrivateObjectStore.cs` | 固定指令、驗簽、sender、owner |
| 就緒與限流 | Infrastructure 的 `Readiness.cs`、`RateLimiter.cs`、`AuthOptions.cs` | 設定、依賴檢查與限流 adapter |
| HTTP | `backend/src/DatingHigh.Api/Program.cs`、`HttpContract.cs`、`PlatformAuthentication.cs` | 路由／DI、嚴格輸入、Cookie、ProblemDetails、family 驗證 |
| Worker ingress／container | `cloudflare/src/index.ts`、`router.ts` | assets、CORS、可信標頭與容器生命週期 |
| Worker 內部平台 | `cloudflare/src/platform.ts`、`strict-json.ts` | ready、R2、sender、固定 JWKS、清理及嚴格解析 |
| D1 | `cloudflare/src/commands.ts`、`migrations/0001_foundation.sql` | Zod 輸入、prepared SQL、原子 batch 與 schema |
| Expo 啟動與頁面 | `frontend/client/app/_layout.tsx`、`index.tsx`、`register.tsx`、`verify-email.tsx`、`login.tsx`、`forgot-password.tsx`、`reset-password.tsx`、`account.tsx`、`account/password.tsx`、`account/connections.tsx` | 九條帳號路由與共用 provider |
| 前端共用 UI | `frontend/client/src/Screen.tsx`、`ui.tsx`、`forms.ts`、`pending-back-guard.ts`、`app/global.css`、`assets/bg-cafe.jpg` | 版面、表單／等待、返回防護與視覺 |
| 前端連線與儲存 | `src/api.ts`、`api-origin.ts`、`session.tsx`、`storage.ts`、`storage-policy.ts`、`flow.ts` | refresh、復原、允許持久化欄位 |
| Google 與原生設定 | client 的 `src/GoogleButton.web.tsx`、`src/GoogleButton.tsx`、`app.config.ts`、`plugins/with-no-network-retry.cjs` | SDK、scheme、Android 網路重試；plugin 變更須重建 APK |
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
| `backend/tests/DatingHigh.E2eHost/HostMain.cs` | 受控 E2E HTTP／sender／回應遺失 host |
| `cloudflare/tests/` | commands／ingress／strict JSON／JWKS 與 `d1.integration.test.ts` 真 D1 |
| `frontend/client/tests/unit/` | API／storage／session／表單／SDK controller |
| `tools/tests/` | local instance、重啟、WSL relay、版本及測試 profile 政策 |
| `tests/integration/` | 真本地平台、Email log、restart、key rotation、readiness 故障 |
| `tests/e2e/web/`、`tests/e2e/android/` | 真 UI 與各種正常／故障矩陣 |
| `tests/component-layout/`、`tests/native/` | 共用 UI 版面 adapter、development-only native 故障 adapter |
| `tests/e2e/runbooks/` | 本地資料、三平台、受控故障及 staging 的操作前提 |

`proposals/prototypes/prototype.v2/` 是 Next.js 提案原型，與 Expo 正式 runtime 分開。`docs/verification` 的 JSON／Markdown 保存追溯與覆核；測試原始去敏摘要放忽略的 `.local/evidence`。

Android 測試的部分 import／Metro／APK 路徑尚未隨搬移更新，現況限制見 [工作流](../02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制)。
