# 資料與儲存契約

現況來源為 [migration](../../cloudflare/migrations/0001_foundation.sql)、[prepared commands](../../cloudflare/src/commands.ts)、[platform](../../cloudflare/src/platform.ts)、Domain／Infrastructure 與 client storage。業務責任以已確認 SPEC 為準。

## D1 schema

六張自有表共 **54 欄**（8＋5＋10＋8＋16＋7），每表首欄為 NOT NULL TEXT PRIMARY KEY，由程式建立小寫 canonical UUIDv7。D1 的 `d1_migrations` 是工具維護表，不計入自有六表。日期欄位使用 Unix epoch **milliseconds INTEGER**；DB row snake_case，公開 DTO camelCase。

以下完整列出現行欄位；`?` 表示 DB 可為 NULL，其餘 NOT NULL；ID／文字為 TEXT，時間／計數為 INTEGER。

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

subject 僅存 RATE_LIMIT_HMAC_KEY 派生 hash；不預建未來業務政策。`RateLimiter.cs` 在單一request內依policy／subject／window去重；IP先commit，拒絕後不再處理其他subject，同階段額度批次提交，採最晚Retry-After。

## Client 持久化

| Key（實際前綴 datinghigh.） | 允許 JSON 欄位 | 儲存位置 |
|---|---|---|
| email-flow | challengeId、flowToken、expiresAt、absoluteExpiresAt、resendAfter、emailMasked、purpose；deliveryFailed optional boolean | Web sessionStorage／native SecureStore；完成或到期清除 |
| refresh | refreshToken、sessionId，兩者必填 | 只 native SecureStore，WHEN_UNLOCKED_THIS_DEVICE_ONLY；Web 禁止此 key |
| pending-revoke | Web 僅 optional sessionId；native optional sessionId／refreshToken | 同平台 storage，登出待確認／重試使用 |

storage-policy 只允許上述 key／欄位、JSON object，單值≤4096字元；禁止任意 SDK response／JWT／密碼／raw code 混入流程 metadata。native Access 只在 ApiClient 記憶體，Web 平台憑證由 HttpOnly Cookie 管理；Google proof 不持久化。flowToken 僅依既有流程儲存白名單使用，不輸出到日誌或交付文件。

## 私人 R2 與 readiness

私人 key 為 `private/{accountId}/foundation-test/{objectId}`，owner 必須由已驗證 CurrentUser 取得；objectId 為 UUIDv7，操作前重驗 family。現行只支援 foundation-test 用途，內容最大8192 bytes、內部 JSON Base64字串上限12000，Content-Type固定 application/octet-stream；沒有業務圖片格式、縮圖或公開 URL 契約。

ready 檢查 EXPECTED_MIGRATION 的 `d1_migrations` 記錄、六表欄位順序／首欄PK與NOT NULL、未撤銷 session UNIQUE index，以及 R2 `_system/foundation/probe.txt` 內容 `datinghigh-foundation-v1`。它不是完整資料稽核；UNIQUE／FK／rollback 的行為仍由真 D1 測試證明。

每小時清理過期 rate bucket、challenge（以 absolute expiry 的保留窗）、session／refresh（absolute expiry後7天）。refresh 自參照先分批解除再刪除，最後刪無 token 的 session；不刪帳號／identity，也不將清理當授權機制。

## 設定與變更

實際設定 key、binding、build-time／runtime 分類見 [環境變數](../04-deployment/02-environment-variables-template.md)。沒有 appsettings 階層設定；目前讀取的認證名稱不改寫成其他慣例名稱。

schema 變更須先有已確認範圍、migration／prepared SQL／ready 同步與真 D1 失敗測試；不得任意擴充54欄基線或塞入業務表。同步 DTO／storage／設定時也需更新 API、相依地圖與對應測試，保留 local／cloud 資料隔離。
