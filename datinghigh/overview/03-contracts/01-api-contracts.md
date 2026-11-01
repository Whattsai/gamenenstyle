# HTTP API 契約

來源為 [Program.cs](../../backend/src/DatingHigh.Api/Program.cs)、[HttpContract.cs](../../backend/src/DatingHigh.Api/HttpContract.cs)、[AuthApplication.cs](../../backend/src/DatingHigh.Application/AuthApplication.cs)、[Worker router](../../cloudflare/src/router.ts) 與 [前端 api.ts](../../frontend/client/src/api.ts)。需求權威仍為 [SPEC](../../docs/specs/SPEC-001-PlatformFoundation.md)。目前共 15 個認證路由與 2 個健康路由；沒有 SignalR event、業務照片上傳或公開資料 command API。

## 共通傳輸

- 認證 base path 為 `/api/v1`。所有 request body 欄位都是大小寫敏感的 JSON 字串；拒絕 null、數字、布林、重複／未知欄位、非 object、深度超過 8 或 body 超過 16384 bytes。下表未標 optional 的 body 欄位必填且不可為空。
- `/api` 請求不接受 query。需要 body 時使用 `application/json`；GET 無 body。伺服器回應 camelCase，API／health 設 `Cache-Control: no-store`。
- `clientPlatform` 值固定 `web | ios | android`。middleware 優先從 body、`X-DatingHigh-Client`、Origin／Authorization 等既有規則判斷；應由共用 client 明確送正確 header，不自建平台推斷。
- 有 Origin 只能為 web。Web 的非 GET／HEAD／OPTIONS 請求必須精確匹配 `WEB_ORIGIN`、`X-DatingHigh-Client: web` 及 JSON Content-Type。
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
