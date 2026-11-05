# HTTP API 契約

## 2026-11-05 個人資料與名片修訂

`GET /profile-catalog`新增`fields`，來源唯一contracts/profile-fields.json；既有groups新增gender／romanticOrientation選項。本人GET與完整PUT新增gender、romanticOrientation、cardVisibility（三者必須出現在完整PUT）。`GET /me/card-preview`只回傳有效開放欄位，關閉鍵直接省略，包含照片metadata與ageBand；精確生日、帳號資訊及私有偏好不分享。HTTP路由數不變；client獨立路由`/card-preview`每次進入重讀。MatchingInput新增性別／性向且與分享設定無關，未建立候選配對或他人名片入口。


來源為 [Program.cs](../../backend/src/DatingHigh.Api/Program.cs)、[HttpContract.cs](../../backend/src/DatingHigh.Api/HttpContract.cs)、[AuthApplication.cs](../../backend/src/DatingHigh.Application/AuthApplication.cs)、[Worker router](../../cloudflare/src/router.ts) 與 [前端 api.ts](../../frontend/client/src/api.ts)。需求權威仍為 [SPEC](../../docs/specs/SPEC-001-PlatformFoundation.md)。目前保留 PlatformFoundation **15 個認證路由**及 **2 個健康路由**，另新增 AvatarAndPreferences **13 個受保護路由**（資料、照片、目錄、化身及本人名片預覽）；沒有 SignalR event 或公開資料 command API。

## AvatarAndPreferences（2026-11-03）

新增13條受保護路由，全部沿用 PlatformAccess、本人 Session family、Web Cookie／Origin 與 native Bearer。固定內部命令及 binary bridge 不公開。停用目錄值可保留本人同欄位既存值；新加入或移除後重新加入回400 INVALID_PROFILE，保留時仍核對revision及Session。本人資料使用19欄嚴格完整 JSON、版本化目錄及 revision CAS；`POST /me/photos` 是唯一允許8MiB JPEG／PNG／WebP binary 的入口，其他 JSON 仍16KiB。照片必須真解碼並壓至200000 bytes，AI輸出上限2MB，兩者不混用。

| 方法與路徑 | 輸入／結果 |
|---|---|
| GET `/profile-catalog` | version、groups；穩定代碼／繁中 label／category／active |
| GET `/avatar-catalog` | 16個 male-01～08、female-01～08，免費正式靜態圖 path，非真人照片 |
| POST `/me/photos` | binary Content-Type；201安全metadata，超限413、格式400、滿5張409 |
| GET `/me/media/{assetId}` | 本人ready照片或正式AI化身；no-store／nosniff；未授權或已刪不可新讀 |
| POST `/me/avatar/generations` | styleId、UUIDv7 clientRequestId、expectedProducedCount，續產加attemptId；200單張 `{attemptId,index,producedCount,maxCandidates:4,expiresAt}` |
| GET `/me/avatar/candidates/{attemptId}/{index}` | 本人本輪1～4短效圖；過期410、未產404、無效Session401 |
| PUT `/me/avatar/selection` | builtin:{type,builtinAvatarId,expectedRevision}；新生成:{type,attemptId,index,expectedRevision}；既有正式圖:{type,assetId,expectedRevision} |
| GET `/me/card-preview` | 本人分享欄位／化身設定／照片metadata／概略年齡／提醒；無Email、精確生日、擇偶私有資料 |

其餘5條 profile／photo metadata／排序／刪除見下表。首次 generation 不會自動補齊4張；重播相同 request 不重送 provider；同帳號競爭409。未知provider用量503 `IMAGE_PROVIDER_UNCERTAIN` 並鎖住本輪，已有候選保留可採用。每輪60分鐘；採用前顯示未來付費／目前免費提醒，取消不提交。已關閉或滿額409。`GET /me/dating-profile` 附安全 `avatarAttempt` 供未知結果後只讀復原；狀態依賴故障時附 `avatarAttemptUnavailable`，前端保留原候選。

真人照片／生成圖不提供公開R2 URL。他人名片及共享照片路由尚未開放；`ICurrentCardAuthorization` 預設拒絕，後續SPEC才定義有效同意。

本人資料另附 `generatedAvatars:[{assetId,mimeType,createdAt}]`，只列本人ready正式AI圖，可透過既有selection路由重選，不再呼叫provider或複製圖片。不可選資產回400 `INVALID_AVATAR_SELECTION`；本人資產遇過期revision回409 `PROFILE_VERSION_CONFLICT`。圖片與輸入均不接受owner或R2 key。

候選採用回 `{revision,assetId}`；正式assetId可與attemptId不同。私有proposedAssetId只由.NET產生，不在公開JSON白名單，client不得指定；expectedRevision與資料／排序同為1～Int32.MaxValue。採用失敗補償只取消pending；已提交的ready圖以既有receipt恢復，不因回覆遺失刪圖或重送provider。

刪除／變更來源會關閉不再有效的生成輪次，回409 `AVATAR_SOURCE_CHANGED`。已完成provider但發布失敗視為未知用量；內部持有原lease的失敗補償可在Session到期／撤銷後解除generating狀態，只更新原manifest失敗metadata，不取得來源、不生成新圖或寫入正式資料。所有讀圖／生成／採用仍驗有效Session。

跨SPEC五項內部讀取介面定義於 `IAvatarAndPreferencesReader`；`ProfileReadRequest`的帳號與輪次不是授權證明。目前未註冊adapter，待MatchingSessions／AffectionAndFeedback每次查核有效參與／同意／未終止後實作，不新增公開他人資料路由。

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
| PUT `/me/dating-profile` | 本人 | expectedRevision、nickname、bio、occupation、birthDate、regionCode、traitTagIds、interestTagIds、topicTagIds、valueTagIds、5 種生活互動偏好、preferredAgeMin／Max、preferredRegionCodes、sharedInterestWeight | 200 `{revision}`；首次可先建空 profile；409 `PROFILE_VERSION_CONFLICT`、401 `SESSION_REVOKED`；驗證目錄內代碼 |
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
