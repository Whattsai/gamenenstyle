# 相依關係地圖

本文件根據根與兩個模組的 `package.json`、`global.json`、`backend/**/*.csproj`、`Program.cs`、Wrangler／Expo／Docker 設定整理。版本代表目前 repo 設定，不宣稱為上游最新版本；解析後版本以各 lockfile 為準。

## 專案與套件

| 範圍 | 主要相依 |
|---|---|
| 根工具 | Node `24.x`、Playwright `1.64.1`；獨立 `package-lock.json` |
| .NET | SDK `10.0.204`、`rollForward=disable`、`net10.0`、nullable／implicit usings、warnings as errors；各專案 `packages.lock.json` |
| Domain | 無 NuGet／ProjectReference |
| Application | Domain；Logging.Abstractions `10.0.0` |
| Infrastructure | Application、ASP.NET Core framework、Authentication.JwtBearer `10.0.6`、SkiaSharp／SkiaSharp.NativeAssets.Linux.NoDependencies `4.154.0`（真解碼、壓縮；未採用 Identity／EF） |
| Api | Infrastructure；ASP.NET Core Web SDK |
| .NET tests | Unit／Integration 引用 Infrastructure，API 引用 Api；xUnit `2.9.3`、Test SDK `17.14.1`，部分專案用 coverlet `6.0.4`、TimeProvider.Testing `10.0.0`、Mvc.Testing `10.0.6` |
| E2eHost／PlatformProbe | E2eHost 引用 Api、Integration.Tests、Mvc.Testing；Probe 引用 Infrastructure |
| Worker | Containers SDK `0.3.7`、Zod `4.6.7`、Wrangler `4.155.0`、workers-types `5.20261029.1`；TypeScript `7.0.2`、Vitest `5.0.5`、Miniflare `5.20261023.2-beta` |
| Expo client | Expo `58.0.22`、React／React DOM `19.3.0`、React Native `0.88.1`、React Native Web；Expo Router／SecureStore／dev-client／expo-audio、safe-area-context／screens；音訊不啟用錄音、麥克風或背景播放 |
| Google native | react-native-nitro-google-signin `2.3.0`、nitro-modules `0.37.1`；Web 使用遠端 GIS script |
| 照片／UUID | expo-image-picker、expo-file-system、expo-crypto 的 SDK58相容版本（精確版本見 lock）；原生 picker 需要重建 APK |
| Client tests／build | TypeScript `6.0.3`、Vitest `5.0.5`、Testing Library、jsdom、Playwright；glob `14.0.2`／minimatch `11.0.1` overrides |

三個 npm 專案獨立安裝，沒有 npm workspaces。`prototypes/prototype.v2/` 的 Next.js 相依不屬正式應用。版本變更須同步 lockfile；Windows 的 Worker 套件變更後也須重跑 `setup:wsl` 更新隔離 Linux toolchain。

Worker測試另直接依賴esbuild `0.28.2`，將平台程式打包後在兩個獨立Miniflare Worker runtime共用D1／R2，驗證跨實例CAS；此依賴不進入產品瀏覽器或.NET容器。套件變更時須同步鎖檔與隔離 Linux toolchain。

Domain 嵌入根 `contracts/profile-fields.json` 與 `contracts/builtin-avatar-packs.json`，Worker import 同一契約；client 經 API 讀欄位／角色目錄，角色URL取neutral正式WebP。Docker build context 為 DatingHigh 根目錄，僅送入 backend 與 contracts。

## DI（Program.cs）

| Lifetime | 註冊 |
|---|---|
| Singleton | AuthOptions、TimeProvider.System、PasswordHashService／IPasswordHashService、AccessTokens／IAccessTokenIssuer、IAuthCryptography→AuthCryptography、IExternalCredentialValidator→GoogleExternalCredentialValidator |
| Typed HttpClient | IPlatformClient→CloudflarePlatformClient；base `http://platform.internal/`、timeout 15 秒 |
| 媒體／AI | IImageCompressionService→ImageCompressionService（singleton）；IPrivateMediaStore→PrivateMediaStore、IAvatarCandidateStore→AvatarCandidateStore（內部HTTP30秒）；IAvatarImageGenerator→GeminiAvatarImageGenerator（HTTP100秒、單次生成90秒、無redirect／自動重送）；IAvatarExpressionGenerator→GeminiAvatarImageGenerator（HTTP100秒／provider90秒）、IAvatarExpressionStore→AvatarExpressionStore、IAvatarReadStore→AvatarReadStore（內部HTTP30秒）；AvatarService、AvatarExpressionService、AvatarReadService、OwnCardPreviewService scoped |
| Scoped | DatingProfileService、PersonalPhotosService、RateLimiter／Application IRateLimiter、IEmailCodeSender→EmailCodeSender、AuthApplication、Readiness、IPrivateObjectStore→PrivateObjectStore |
| 配對／劇情 | MatchingSessionService、StoryDialogueService scoped；StoryDialogueService 以既有 platform／clock／notifier 建立 SceneEventFrameworkService，無第二套房間服務；IMatchingCandidateProfileReader→MatchingCandidateProfileReader；IRoundRealtimeNotifier→CloudflareRoundRealtimeNotifier |
| Framework | 自訂 Platform authentication scheme、PlatformAccess authorization policy、允許單一 Web origin 的 CORS |

Google validator 由 factory 建立，讀取各 platform allowlist，並使用平台 client 取得 JWKS。不要繞過這些介面在頁面或 Domain 加外部 I/O。

## Runtime 與外部服務

| 相依 | 使用者／邊界 |
|---|---|
| Cloudflare bindings | Worker 的 `API` Durable Object／Container、`DB` D1、`FILES` 私人 R2、`ASSETS` 靜態檔、`GAME_ROOMS` Room DO、`STORY_CONTENT` 獨立故事 R2、僅 Worker 使用的 `ROUND_TICKET_HMAC_KEY`；cloud sender 另需 `EMAIL`／`EMAIL_FROM` |
| .NET Linux container | Dockerfile 固定 SDK／ASP.NET 10 映像 digest、非 root、8080；Worker 傳入認證與 Google 設定 |
| D1 | 所有寫入經固定 prepared commands／batch；.NET 不直接連 SQLite／D1 HTTP API |
| R2 | FILES 保存 owner 私人照片、候選、生成角色、Manifest 與 probe；STORY_CONTENT 保存四層版本內容及公開素材，內容 Manifest 只由受保護 bridge 讀取。免費 WebP 由 ASSETS 讀取，Round 通道重驗授權 |
| Gemini | .NET 固定 generativelanguage.googleapis.com generateContent；server header secret；來源為本人已壓縮照片，候選與五表情每次只產一張；表情使用同一候選，不重送真人照；AvatarChromaMask 使用既有 Skia 去背，失敗及未知成本不自動重試 |
| Google | Web GIS `https://accounts.google.com/gsi/client`；native SDK；Worker 只取 `https://www.googleapis.com/oauth2/v3/certs`，.NET 驗 RS256／audience／azp／Email |
| Email | local／Log 在專用 category；staging／production 使用 Cloudflare sender binding，部署前須核對實際 binding／sender |
| Client API | Web／iOS 預設 localhost:8787，Android emulator 預設 10.0.2.2:8787；EXPO_PUBLIC_API_ORIGIN 可覆寫，cloud 需 HTTPS |
| 本地 proxy | Ubuntu WSL 的隔離 Node `24.11.1`／Wrangler 與本專案 loopback egress relay，處理 Docker Desktop outbound 位址；不是公開代理 |
| Android build | JDK 17、Android SDK／adb、專案固定 Ninja `1.13.2`、CMake staging；Expo plugin 關閉 OkHttp 連線失敗自動重送 |

即時通訊使用標準 WebSocket／JSON，client 不依賴 Cloudflare SDK。沒有 SignalR、queue、Identity、EF、獨立資料庫服務或 repo CI/CD pipeline。Wrangler 已有 observability 開關且關閉 invocation logs；沒有額外 observability vendor。也沒有 EAS 設定可作現成 iOS 建置入口。

測試對 Miniflare、Docker／WSL、Chrome、emulator 的前提見 [工作流](../02-development-guidelines/03-ai-workflow-stages.md)，部署設定與 secrets 分類見 [環境變數](../04-deployment/02-environment-variables-template.md)。
