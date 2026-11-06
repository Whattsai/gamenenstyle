# 環境變數與 bindings

MatchingSessions（2026-11-06）沒有新增產品設定 key／秘密／binding。local與staging的 EXPECTED_MIGRATION 改為 `0004_matching_sessions.sql`，ready核對12張自有表；DB增加四張配對／遊戲表。`DATINGHIGH_E2E_MATCHING_PROFILE=1` 僅供測試 host 開啟受保護的合成測資控制，不屬正式 Api／Worker 或 Expo production 設定。

來源為 `AuthOptions.Load`、`Program.cs`、`ApiContainer.envVars`、`PlatformEnv`、client／Expo 設定與本地工具。以下只列名稱及用途，不含可用秘密。現行 .NET 直接讀頂層名稱，沒有 appsettings 階層；不要自行改成 `Auth__...`。未來若引入階層設定，才依 ASP.NET Core 的 `__` 映射規則同步修改 loader 與文件。

## Worker vars 與 .NET runtime

下列設定由 Worker vars／secrets 提供，再經 `ApiContainer.envVars` 轉入 .NET；修改後需讓容器載入新環境。

| 名稱 | 類型／必要性 | 現行規則 |
|---|---|---|
| APP_ENV | 一般變數，必要 | local／staging／production；未設定為unset且ready拒絕 |
| WEB_ORIGIN | 一般變數，必要 | 精確origin，無路徑／尾斜線；local為http://localhost:8081，cloud HTTPS |
| ACCESS_TOKEN_ISSUER | 一般變數，必要 | 非空，環境分離；local設定datinghigh-local |
| ACCESS_TOKEN_AUDIENCE | 一般變數，必要 | 非空，環境分離；local設定datinghigh-local-client |
| ACCESS_TOKEN_SECRET | Secret，必要 | Base64解碼至少32 bytes；HS256單一秘密 |
| EMAIL_CODE_HMAC_KEY | Secret，必要 | Base64解碼至少32 bytes；驗證碼MAC |
| RATE_LIMIT_HMAC_KEY | Secret，必要 | Base64解碼至少32 bytes；限流subject hash |
| EmailDeliveryMode | 一般變數，必要 | 名稱保持此拼法；local只接受Log，staging／production只接受Cloudflare |
| GOOGLE_WEB_CLIENT_ID | 公開ID，Google Web功能需要 | server按逗號分隔為Web audiences／azp allowlist；不提供client secret |
| GOOGLE_IOS_ALLOWED_CLIENTS | 公開ID清單，iOS Google功能需要 | 逗號分隔，須涵蓋實際SDK產生的audience／azp |
| GOOGLE_ANDROID_ALLOWED_CLIENTS | 公開ID清單，Android Google功能需要 | 逗號分隔，須配合Web client／native設定與簽章 |
| GEMINI_API_KEY | Secret，AI 生成需要 | 只在忽略的 server `cloudflare/.dev.vars`／部署 secret 設定；Worker 轉入容器，永不進 EXPO_PUBLIC 或 URL／日誌；缺少時 AI 503，免費角色仍可用 |
| GEMINI_IMAGE_MODEL | 一般變數，選填 | 預設 gemini-3.1-flash-image；只允許程式內列出的 Gemini image model，不能傳任意 endpoint |

Google allowlist 可為空，基礎ready不因此失敗；呼叫該platform的Google驗證則503 EXTERNAL_PROVIDER_UNAVAILABLE。前端缺client ID時入口顯示不可用，不能回假成功。

`ASPNETCORE_URLS=http://+:8080` 在 Dockerfile 設定，由容器網路承接，不是直接公開API。Docker映像的 APP_UID 用於非root執行，無須當成業務secret。

## 只由 Worker 使用

| 名稱 | 種類 | 用途 |
|---|---|---|
| EXPECTED_MIGRATION | var，必要 | local／staging 設定為0004_matching_sessions.sql；ready查migration及12表欄位／占用索引；不轉入.NET。staging 變更未代表已部署 |
| EMAIL_FROM | 一般設定，cloud必要 | 已完成sender domain驗證的寄件地址；不以任意地址替代 |
| EMAIL | Email sender binding，cloud必要 | 平台寄信用；目前staging設定尚缺 |
| DB | D1 binding | Foundation六表54欄＋AvatarAndPreferences兩表27欄＋MatchingSessions四表32欄及migration metadata；不能換其他專案DB |
| FILES | 私人R2 binding | owner物件與固定probe；非公開bucket |
| API | Durable Object／Container binding | ApiContainer生命週期及api-v1路由 |
| ASSETS | Wrangler assets binding | local為frontend/client/dist；staging為.local/staging-web |

binding 是 Wrangler 資源設定，不是可在 `.env` 中填字串替代的環境變數。部署目標記於 `cloudflare/deployment-targets.json`；production目前為null。目前沒有需要填寫的DB connection string、Google client secret、SignalR、queue或第三方observability API key。

## Client build-time

Expo 的 `EXPO_PUBLIC_*` 會進公開bundle，僅能放公開設定；變更後重匯Web或重啟／重建相應client，不會由後端runtime自動更新。

| 名稱 | 用途／預設 |
|---|---|
| EXPO_PUBLIC_API_ORIGIN | ApiClient來源；未設時Android為http://10.0.2.2:8787，其餘為http://localhost:8787；空字串為相對同源API，cloud必須HTTPS |
| EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID | GIS與native SDK的webClientId；單一公開ID，須在server對應allowlist |
| EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID | iOS SDK client ID；iOS缺此值則入口不可用 |
| GOOGLE_IOS_URL_SCHEME | app.config.ts讀取，啟用Google native plugin的iosUrlScheme；非EXPO_PUBLIC，由native build配置使用 |

client的忽略檔為 `frontend/client/.env.local`。可依環境建立以下只含公開設定的檔案，不把佔位字串當作真實Google ID：

```dotenv
EXPO_PUBLIC_API_ORIGIN=http://localhost:8787
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<public-web-client-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<public-ios-client-id>
GOOGLE_IOS_URL_SCHEME=<reversed-ios-client-id>
```

不使用Google時省略三個Google設定；Android emulator的API來源應設10.0.2.2或省略override。不要把此localhost範例原樣用於雲端／硬體裝置。

## 工具與測試 profile

| 名稱 | 使用位置／規則 |
|---|---|
| ANDROID_HOME、JAVA_HOME | build-android.ps1；未設時嘗試本機Android SDK與Microsoft JDK17 |
| DATINGHIGH_ADB_PORT | Android驗收wrapper選定ADB server port；不改其他專案程序 |
| DATINGHIGH_ANDROID_DEVICE | Android測試指定裝置，預設emulator-5554；每次先確認對象 |
| DATINGHIGH_LINUX_TOOLCHAIN | local.mjs的內部WSL選擇，Windows wrapper設定為1；不手動切remote |
| DATINGHIGH_E2E_AVATAR_PROFILE | 僅隔離E2eHost明選受控圖片供應商及真D1／R2 bridge；不由正式API讀取，不含真Gemini呼叫 |
| DATINGHIGH_NATIVE_FAULT_PROFILE | Metro development-only SecureStore故障adapter；正式build／export不得帶1 |
| DATINGHIGH_NATIVE_GOOGLE_PROFILE | 專用測試Google adapter，須搭配fault profile且僅development；不是真SDK證據 |
| EXPO_PUBLIC_NATIVE_FAULT_ORIGIN | 僅測試profile的loopback host／emulator對應來源，供SecureStore與clock adapter使用；不得帶入正式bundle |
| DATINGHIGH_E2E_REAL_GOOGLE、DATINGHIGH_E2E_GOOGLE_CLIENTS | 隔離E2E host選擇真Google驗證及公開client allowlist；不是正式runtime設定 |
| EXPO_NO_DOTENV | native fixture設1，避免讀入日常client設定而覆蓋受控測試環境 |
| NODE_ENV | Expo／Metro的production防護；不得藉改值讓fixture進release |

測試專用控制值由 `tools/test-android.ps1`／相應fixture管理，不加入正式環境範本。`LOCALAPPDATA` 等OS內建位置僅作工具查找，不重設成task目錄。

## 秘密生命週期

local wrapper只在 `cloudflare/.dev.vars` 不存在時生成三個32-byte Base64秘密；已存在就沿用，不補印、不覆寫。其他instance有獨立設定與state；既有權杖的還原驗證需要對應秘密，不能假設新instance隨機key相同。

staging／production的秘密獨立由安全管道配置，不進Wrangler vars、Git、前端EXPO_PUBLIC或報告。不得輸出／提交token、Cookie、密碼、raw code、Google proof、service account JSON。唯一碼日誌例外僅明確local／Log的LocalEmailVerification；雲端不能用Log取代sender。

新增／更名key時同步loader、Worker envVars、Expo／native設定、preflight、測試、[資料契約](../03-contracts/02-data-contracts.md)與[相依地圖](../01-architecture/05-dependency-map.md)，並檢查公開bundle無秘密值或測試profile。
