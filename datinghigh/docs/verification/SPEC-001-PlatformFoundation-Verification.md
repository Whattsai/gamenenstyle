# PlatformFoundation 實作與驗證紀錄

更新：2026-11-01（Asia/Taipei）。範圍為 MVP-001 的 SPEC-001；其餘七份 SPEC、親密度及交換名片業務尚未實作。

2026-11-01 追加完成[本地 Email 與相依套件補驗](PlatformFoundation-LocalEmailAndDependencies.md)：註冊／reset／重寄真 log 碼通過，三個 npm 專案及 NuGet 9 專案零已知弱點；新版 Android APK 真 Google／SecureStore 冷恢復／登出回歸通過。

## 最新本地結案

2026-10-31 23:36 完成使用者指定的本地 Web／Android 驗收；無待使用者登入或操作項目。最終 `npm run check:foundation` 通過：腳本 21、.NET Unit 67／API 53／Integration 22、Worker 58、client 106，共 327 個測試，以及兩個型別檢查。Web 最終匯出後全套 82 項通過、1 項焦點測試失敗並單獨重現；測試補上目標頁標題等待後，該項獨立通過。產品程式在兩輪之間未變，83 個不同案例均有通過證據；原失敗保留，不記為單輪全通過。原始紀錄為 `.local/evidence/foundation-final-local.log`、`web-final-local.log`、`web-final-local-initial.json`、`web-screen-final-reproduce.log`、`web-screen-final-fixed.log`、`web-screen-final-passed.json`，組合摘要為 `web-final-local-summary.json`。

Android 另自動完成真 Google SDK／真 Google 公鑰／隔離 D1 首次建帳 201、冷啟 refresh 200、登出 204 及再次冷啟不復活（`native-real-google-lifecycle.json`）；實際 Web→Android 同 Email 登入確認同 owner、舊 Web family 被撤及回前景清除私人畫面（`cross-platform-email.json`）。真 SecureStore 延遲寫入與登出交錯亦通過（`bdd-054-native-race-passed.json`）。先前失敗及 emulator／Metro 問題紀錄保留，不當成通過結果。

最終 15 個公開 Web 檔案對三個本地後端秘密值零命中，測試 SDK／SecureStore fixture 標記零命中（`public-secret-scan-final.log`、`public-fixture-scan-final.log`）。此掃描搭配應用儲存、DTO 與 log 稽核；不宣稱觀察第三方 SDK 或雲端 telemetry 的全部內部行為。

本地判定見[本地案例覆核](PlatformFoundation-LocalMatrix.md)。原完整 TDD **207/227（91.2%）**、BDD **80/92（87.0%）**；iOS、TalkBack、staging／production 與真收信仍依決策及環境界限保留，production 未發布。以下較早段落的執行數為各輪歷史紀錄，最終總數以上表述與 `foundation-evidence.json` 為準。

## 真 Google Web 人工驗收

2026-10-30 使用 CookieSelf 的 DatingHigh Web OAuth client，使用者先前確認首次登入顯示本人帳號資訊；修正本地驗簽金鑰下載後，依序重新整理登入、登出、再次登入，使用者回覆「都正常了」。本項是實際 Google／GIS／本地 API／Worker／D1 的人工操作證據，未記錄帳號 Email、Google proof、Cookie 或 token。local Worker 的非敏感存取摘要亦有 Google 登入 201 與 200 紀錄（`.local/evidence/default-runtime-diagnostic.log`），但該摘要沒有 Account ID，不能單獨證明兩個回應屬於同一個帳號。Android 真 SDK 既有帳號登入已由使用者另行確認；iOS 依 D-033 暫緩。

金鑰由固定私有 `external.google-jwks` 指令取得，Worker 僅 HTTPS GET 固定 Google URL，以 `redirect: manual` 配合非 2xx 拒絕轉址。真 Worker 曾重現 `redirect: error` 不支援而回 503，已以失敗測試修正；私有橋接 200／公開 API 對無效 proof 回 401 已確認。熱重載後首次外連失敗的時序仍有觀察紀錄，不以停用 TLS 驗證或放寬 issuer／audience 解決。

## 真 Google Android 人工驗收

2026-10-31，使用者以原 Web Google 帳號在 API 36 模擬器、DatingHigh development APK 及原生 SDK 完成登入，並確認帳號及 Google 連結畫面「都很正常」。固定 local wrapper 的唯讀 D1 彙總查詢確認一個 Google Account 同時具有首次 Web session（與帳號建立同一交易時間）及較後的 Android session；只保存數量 1，不輸出 Email、Account ID、Google proof 或 token。查詢與結果為 `.local/google-cross-platform-summary.sql`、`.local/evidence/google-cross-platform-verified.log`。獨立的測試 SDK profile 為身份管理故障測試使用，不能替代此人工結果。原規劃的 staging 首次建立帳號、iOS 與真收信仍分別保留未驗收。

## 2026-10-30 本地補驗

`check:foundation` 通過：腳本 17、.NET Unit 54／API 51／Integration 18、Worker 49、client 61，以及兩個 TypeScript 檢查。此後新增的原生 Google controller 取消／45 秒期限／重複點擊／晚到／卸載測試，獨立 8／8 通過；這些仍屬受控 SDK 邊界證據。

Android 重設流程的九組「本地密碼／Google-only／不存在帳號 × 寄送成功／拒絕／逾時」均已有實際 UI／API／Worker／D1 通過證據。最後的不存在帳號／成功案曾因測試時間預算取消，增加 UI 自動化預算後單獨通過；產品 HTTP 45／30 秒上限未延長。已保留原取消紀錄。證據為 `native-reset-partial.json`、`native-reset-seven-passed-one-cancelled.json`、`native-reset-none-success-passed.json`。

原生登出四案及註冊錯碼五次鎖定、59／60 秒冷卻與第六次 429 已通過。Android 重試矩陣原 17 案及獨立暖寫補跑 1 案均通過；先前 UI 讀取失敗及 server 計時差造成的失敗紀錄仍保留。Web 完整回歸 60 案後，另補跑註冊／驗碼／登入／重設四種 pending 切頁與重複提交，四案通過。Android 額外重設回應遺失／舊憑證失效／新密碼登入已通過；字體／橫向鍵盤、登入負例與受控 SDK 連結管理均已通過；Android 四種表單的系統返回與不重送已在修正後全數通過。所有原始摘要位於忽略的 `.local/evidence`，可重跑入口見 README。以下原始規劃進度仍包含 D-033、D-035 暫緩的 iOS／staging 要求。

目前 **207/227 個 TDD 案例完整覆核（91.2%）**、**80/92 個 BDD 場景完整覆核（87.0%）**，原始完整範圍尚未達 100%。九條帳號路由及認證／資料基礎已實作；iOS、雲端及真收信保留未驗收。完整清單見 [逐項深度稽核](SPEC-001-PlatformFoundation-DeepAudit.md)、[機器可讀追溯](foundation-traceability.json)；人工覆核依據為 [case review](foundation-case-review.json)。測試函式數與規劃案例數不同，一個函式可參數化覆蓋多個案例，名稱有 ID 不自動算完成。

## 本輪使用者補充決策

D-035：本輪限定本地驗收；staging依使用者決策暫緩，不啟用付費、不部署。iOS及staging都不計為通過；原完整驗收數保留，與目前範圍分開。可做與不能取代的證據見[本地驗收範圍](PlatformFoundation-LocalAcceptance.md)。

D-033：依使用者明確指示，先略過iOS驗收；iOS保留未驗收／暫緩，不計為實際執行通過。本輪優先完整驗Web、Android及真服務。D-034：Google登入使用CookieSelf內DatingHigh專用OAuth用戶端，參考Barterfly的前端build-time、後端audience設定；Barterfly只讀取設定文件，未修改。提供的JSON僅取公開client ID，client secret未複製至專案。

## 實作及可重現命令

| 範圍 | 主要位置 | 已執行結果 |
|---|---|---|
| .NET Domain／Application／安全 adapter | `backend/src`、`backend/tests/DatingHigh.Unit.Tests` | 最終 67 個單元測試通過；Google JWT 負例及所有認證 limiter fail-closed 另補強 |
| HTTP／授權／嚴格 JSON／Cookie／Origin | `backend/tests/DatingHigh.Api.Tests` | 最終 53 個測試通過，覆蓋 51 個規劃 API 案例；含 protected route 拒絕矩陣、Google DTO／Cookie 與條件式登出 |
| .NET 用例＋真 D1 | `backend/tests/DatingHigh.Integration.Tests` | 最終 22 個測試通過；真 Miniflare D1 的驗碼、sender、同 Email／Google 併發、UNIQUE／FK／rollback |
| Worker／真 D1／私人 R2 | `cloudflare/tests` | 最終 58 個測試與型別檢查通過；原子 batch／CAS／rollback／schema／quota／cleanup／ownership、Google 金鑰橋接與代理一致性 |
| 前端控制器與真 Screen 元件 | `frontend/client/tests/unit` | 最終 106 個測試及型別檢查通過；含 Google 晚到結果、Cookie refresh 復原、帳號完整性、精確文案及 SecureStore／登出交錯 |
| local wrapper／建置／驗收政策 | `tools/tests` | 最終 21 個測試通過；含 relay 清理、原生測試 profile 防護與明確使用者暫緩的範圍判定，暫緩不算完整通過 |
| Web 真本機流程及明定故障替身 | `tests/e2e/web` | 最終全套 82 項通過，1 項焦點測試同步修正後獨立通過，共 83 個不同案例具通過證據；真 Cookie、45／30 秒中止、sender 故障、Google 結果復原、refresh 與條件式登出競態 |
| 真 Worker→Container→.NET→D1／R2 | `tests/integration/foundation-live.test.mjs` | 3個測試通過：原生傳輸契約、私人R2 ownership、Refresh grace／409／逾30秒重放、舊family logout與公開internal404／spoofed identity／SPA |
| 重建／查改／備份還原 | `tests/integration/restart-data.test.mjs` | 實際重建、有效／撤銷 family、待驗證挑戰、固定 cwd、migrate／seed、safe views、新 instance restore 與約束通過 |
| 真容器換 key | `tests/integration/key-rotation.test.mjs` | 舊 Access 失效／Refresh 換新 Access／舊碼拒絕／新碼成功通過；原 local secrets 已在 finally 恢復 |

```powershell
npm run check:foundation
npm --prefix frontend/client run export:web
npm run test:web
npm run test:live
node --test tests/integration/restart-data.test.mjs
node --test tests/integration/key-rotation.test.mjs
npm run check:foundation -- --acceptance
```

live、restart、key-rotation、Android 測試須依序執行。restart／key-rotation 會暫停同一個 local 服務；不要與 Web 或原生流程並行。key-rotation 只更換本工作區 local secrets 並恢復原值，不操作 staging／production。整體 `check:foundation` 不依賴外部帳號，會編譯只經 stdin/stdout 通訊、無監聽 socket、無持久資料的 Miniflare 測試 runner。`--acceptance` 對必要證據缺項回 exit 2；這與測試失敗分開判定。

原始執行紀錄在忽略的 `.local/evidence`：`check-foundation.log`、`dotnet-integration.log`、`web-export.log`、`web-run.log`、`playwright.json`、`live-run.log`、`restart-data-run.log`、`restart-data.json`、`key-rotation-run.log`、`key-rotation.json`。其中摘要 JSON 不含帳密、code 或 token；不可提交 raw 本地驗碼日誌、UI dump、影片或測試憑證。

## 本輪補齊的可重現證據

- `npm run test:layout`：共用實際元件的32組layout單元矩陣通過，涵蓋兩平台OS行為、大小viewport、鍵盤、安全區及長錯誤。OS邊界由adapter提供，不算實體iOS證據。
- `npm run test:readiness:faults`：新local instance的實際Worker/Container15項故障全部通過，baseline及finally恢復ready200；不碰staging與既有資料。
- `npm run build:e2e-host` 後 `npm run test:web`：新增2個真正多分頁案例及6組完整寄信故障恢復。受控EMAIL provider不代替真收件匣。
- `npm run test:android:faults`：測試專用development Metro profile，僅在storage SDK邊界注入寫失敗；成功寫仍使用真SecureStore。此profile禁止production export，不改正式API或登入驗證。結果另列於原生證據。

原始結果：`.local/evidence/layout-unit-run.log`、`layout-unit.json`、`cloud-email-integration.log`、`readiness-faults-run.log`、`readiness-faults.json`、`multi-tab-network.json`、`delivery-e2e-run.log`及`native-faults-run.log`。SDK監測只存操作、允許的key與JSON欄位名稱，不存值；UI XML僅在記憶體，無原生截圖或影片。

## 版本與建置

原規劃的測試位置欄保留當時的拆分名稱；實作採集中檔案及參數化測試，實際檔案與行號以traceability為準。

| 元件 | 固定版本／證據 |
|---|---|
| Host Node／.NET SDK | Node 24.11.1；`global.json` 10.0.204 |
| Expo／React Native | Expo 58.0.22；RN 0.88.1；React 19.3.0；client TypeScript 6.0.3；2026-11-01 同 SDK 安全修補 |
| Cloudflare | Wrangler 4.155.0；Containers 0.3.7；compatibility date 2026-10-24；Worker TypeScript 7.0.2 |
| Linux build SDK | `mcr.microsoft.com/dotnet/sdk:10.0@sha256:9c7b6b263d9d4c2e4718e16dae6d75cd8f4b5ccf206f1e7d48a98eb429981b03`；實際映像 SDK 10.0.403 |
| Linux runtime | `mcr.microsoft.com/dotnet/aspnet:10.0.6@sha256:902cb7375e347f20c93d959bf1feba884e0a9232e0087991ace8eb4f82d2986d` |
| Android | JDK 17、Gradle 9.4.1、Ninja 1.13.2；x86_64 debug APK 已建置與安裝；API 36 emulator |

所有 npm 與 .NET 專案保留 lockfile；Dockerfile 使用 digest。Windows 的 Containers 由 Ubuntu WSL 隔離工具鏈啟動；Docker Desktop outbound 只為本工作區 workerd 建 loopback relay。建置／操作入口見 [README](../../README.md)。

## 各平台及環境

| 項目 | 狀態與實際證據 |
|---|---|
| Web local | 已通過上述 60 個測試及 single SPA export；靜態網站 localhost:8081、API localhost:8787，使用 HttpOnly／SameSite Strict Cookie |
| Android local | development APK 建置／安裝成功；2026-10-30 00:55 API36 emulator完整通過原生Email註冊、SecureStore冷啟動恢復、logout、密碼登入及換機清除私人畫面並回登入。摘要為`.local/evidence/android-smoke.json`；不涵蓋真Google、iOS或完整native UX矩陣 |
| Android受控故障 | 新development APK建置／安裝後8項檢查通過；真SecureStore、真API/Worker/D1、寫入失敗、無效／遺失Refresh、Access過期＋一次409、業務401及未知寫入不重放。`.local/evidence/native-faults.json`含時間及APK SHA256；不代替iOS或全部native UX |
| iOS | 未驗收。此 Windows 環境無 macOS／Xcode，亦無已配置且可簽署的 EAS development build；不得以 Web 或 Android 代替 |
| Google | 使用者確認 Web 真 Google 登入及登出後重登正常；後端受控 RSA／JWKS、平台 allowlist、可信 Email、直接建帳／連結及 SDK controller 已測。Android 真 SDK 既有帳號登入由使用者確認正常，iOS 暫緩 |
| Email | local 專用 category 流程已測；缺 EMAIL sender binding、已驗證寄件網域與真收件匣的註冊／reset 實測。受控 provider 或 messageId 不是收件證據 |
| staging | 已建立 D1、私人 R2、migration／probe，Worker／assets 已上傳；Container deploy API 回 401／1000，明示帳號需 Workers Paid。Container 未成功部署，不視為 staging 可用 |
| production | 未發布；未改方案、未進行付費升級 |

staging account：`9c4353055ae969a9d62e4a6754e100d7`；D1：`a367561e-b9a3-495b-be8a-bd3a1b837ce6`（`datinghigh-staging`）；R2：`datinghigh-staging-private`；設定來源 `cloudflare/wrangler.staging.jsonc`／`deployment-targets.json`。預定 origin 為 `https://datinghigh-staging.orick.workers.dev`，不是已通過驗收的網站。缺 sender 時 `preflight:staging` 必須拒絕，不填假 binding。秘密只保留在忽略檔或 Cloudflare secret store。

## 本輪修正與仍待完整證據項

最後回歸另確認：原生cold restore遇已替換family導回登入、還原config來源路徑可跨Windows／WSL解析、ready拒絕失去UNIQUE的active-family索引，以及Email在Unicode大小寫轉換前先拒絕非ASCII（避免K等字元被折成ASCII後誤接受）。前後端Email表單規則已對齊。

已由失敗測試重現並修正：session 建立最後寫入判定、0-row 後不得使用既存候選 family、reset 最後 consume 與 unlink 的 `changes()` 依賴、Refresh CAS／rollback、嚴格 Unicode JSON 回400、503 的安全 recovery metadata、舊成本 hash 條件升級、client refresh 第二次衝突清私人狀態、Google SDK 晚到 callback／重複 HTTP、防敏感資料 storage、密碼 surrogate／C1 控制字元、背景圖橫向溢出，以及 Windows／WSL 活躍 WAL 的本地寫入競態。

註冊首次寄送503新增 ProblemDetails `recovery`，只含原 challenge／flow 與期限，讓 caller 能在60秒冷卻後重寄保留的挑戰。無 code、password 或平台 token；reset 維持同形202。此必要契約細化已同步 SPEC，沒有新增 endpoint、資料欄或投遞狀態機。

尚未關閉的20個原規劃案例均為 E2E，逐項列於 traceability：001–013、015–020、023。Unit 117/117、Integration 35/35、API 51/51 已完整覆核；E2E 4/24。Web／Android 真 Google 登入及 Android 真 SDK 的取消、連結與解除連結已有本地證據；iOS、真收信及 staging Containers 仍未驗收。本地逐項覆核已完成，證據界限見[本地案例覆核](PlatformFoundation-LocalMatrix.md)。原始完整平台案例不能僅憑本地通過而關閉。

D-032已由使用者確認，Web登出與重試改帶原sessionId body條件；5個HTTP及2個真browser/API/Worker/D1案例通過。原Cookie可在Access過期後撤銷；新Cookie不符回409且無revoke/Set-Cookie，移除舊marker、不refresh，也不把409當成原family已撤銷證明。Android 正常／遺失回應／冷啟重試與替換 family 保護已有本地測試；iOS 仍暫緩。Android Metro 冷載入與UI automation等待另計，API的首次45秒／後續30秒上限不變。Android smoke已記錄APK SHA256；最後補正iOS simulator預設origin為localhost，Android仍為10.0.2.2，並以單元回歸驗證此平台選擇。


Android回應遺失測試實際重現：密碼變更已204提交，OkHttp底層自動重送PUT後收到401。已新增 `frontend/client/plugins/with-no-network-retry.cjs`，在MainApplication啟動時安裝保留React Native cookie/cache設定、但 `retryOnConnectionFailure(false)` 的client factory；JavaScript統一控制重試。新APK以同一斷線注入重測，伺服器只記一次PUT/204，UI呈現未知結果提示，8項檢查全通過。此修正只具Android原生證據，iOS仍未驗收。

先前 client 的 npm audit 為8筆（5 low／3 high），歷史結果保留於 `.local/evidence/dependency-audit.json`。2026-11-01 重查為13筆，已透過 Expo 同 SDK 修補版及 glob／minimatch 修補版本清除至0；根目錄／Worker 也為0，NuGet 9專案未列出已知弱點。版本、相容性與實際回歸見[本地 Email 與相依套件補驗](PlatformFoundation-LocalEmailAndDependencies.md)。

## Android 真 Google 身分管理與代理一致性

2026-10-31 以使用者帳號及隔離、暫時的 D1 測試資料執行真 Android Google SDK：取消授權不送連結請求；同 Email 帳號連結回 200，使用密碼解除回 204，原 family 因 credential version 改變失效，密碼重登後原 session 已撤銷。未修改原帳號的 Google 連結；只保存路徑、狀態與結果（`.local/evidence/native-real-identity-first-passed.json`）。後續單一程序自動選擇同帳號的補測也通過，確認真 SecureStore 寫入欄位未包含 Google 憑證、密碼、驗證碼或 Access Token（`.local/evidence/native-real-google-storage-auto.log`）；這不代表已觀察第三方 SDK 的內部儲存。

該次解除後另觀察到兩次 Google 登入 503。隔離測試代理先前直接執行 SQL 命令，會把 Email 唯一鍵衝突錯誤轉成 503；重現測試先得到 503，修正代理使用實際 Worker dispatch 後改為 409 `EMAIL_ALREADY_REGISTERED`，並確認未建立新帳號、身分或 session。原始 503 沒有保存錯誤碼，故無法確定皆由此原因造成。原生真 SDK 取消／連結／解除及既有登入證據不代表雲端或 iOS 已驗收。

## 帳號恢復故障

BDD-085 覆核發現冷啟帳號讀取失敗時缺少明確重試／返回登入入口，且冷啟 5xx 的追蹤編號沒有傳到畫面。已補上恢復操作及錯誤追蹤編號；若原生憑證已清除，重試會回登入並提示登入狀態失效。先有失敗單元測試，再以元件、真瀏覽器及 Android 模擬器／隔離 API 驗證（`.local/evidence/bdd-085-retry-red.log`、`.local/evidence/bdd-085-trace-red.log`、`.local/evidence/bdd-085-no-credential-red.log`、`.local/evidence/bdd-085-web-recovery-final.log`、`.local/evidence/bdd-085-native-passed.json`）。

BDD-072 原將註冊與重設的過期／鎖定文案一概寫成分別顯示，與 SPEC `/password-resets` 僅回 `INVALID_OR_EXPIRED_CODE` 的合約不一致。已把 BDD 明確修正為註冊區分過期／鎖定、重設維持同形錯誤；不改變 SPEC 或實際 API。兩平台已有對應驗證碼流程與不明結果測試。

BDD-021 覆核發現 Web refresh 回應遺失後原實作直接清除登入，未執行規格指定的 Cookie 恢復。已補上：先以目前 Cookie 唯讀查詢 session；若 Access 缺失／過期才以原 Refresh Cookie 重試一次，family 變更、撤銷或確認服務故障都不接管其他帳號或盲送。紅測見 `.local/evidence/bdd-021-refresh-red.log`；真瀏覽器／隔離 API／D1 對新 Cookie 已收到與未收到兩種情境均通過（`.local/evidence/bdd-021-refresh-web.log`）。

BDD-054 稽核另發現原生 SecureStore 後繼寫入與登出交錯的缺口。現先保存撤銷意圖、等待已開始的憑證寫入，期間隱藏私人畫面；等待超過 30 秒保留 pending 供重試。晚到寫入不恢復登入，若儲存已換成新 family，舊登出或重試也不撤銷或移除它。受控單元交錯與 Android 真 SecureStore 延遲／實際 API／D1 案例已通過（`.local/evidence/bdd-054-family-races-final.log`、`.local/evidence/bdd-054-native-race-passed.json`）；Web 的 refresh 晚於另一裝置登入也確認舊 family 不復活、新 family 仍可用（`.local/evidence/bdd-054-web-late-refresh.log`）。
