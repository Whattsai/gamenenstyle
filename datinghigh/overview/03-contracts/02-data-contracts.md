# 資料與儲存契約

## 現行資料版本（2026-11-05 D-053）

[0003](../../cloudflare/migrations/0003_profile_gender_card_visibility.sql)新增gender、romantic_orientation_json、card_visibility_json，user_profiles18欄＋media9欄＝兩表27欄；Foundation六表54欄及零Trigger不變。已在default local套用；staging設定更新但未部署。下方0002兩表24欄是歷史建表基線。

完整PUT為22鍵；新增性別nullable單選male／female／diverse、性向唯一多選同碼（0～3）、分享白名單boolean map。{}依[共用定義](../../contracts/profile-fields.json)取有效預設；只允許shareable cardKey，ageBand不接收birthDate分享鍵。偏好JSON固定9鍵不變。新欄位defaultVisible缺值必為false。性別與不符免費化身清除同一CAS；AI保留。profileReady追加性別及非空性向。


基礎版本來源為 [0001 migration](../../cloudflare/migrations/0001_foundation.sql)、[prepared commands](../../cloudflare/src/commands.ts)、[platform](../../cloudflare/src/platform.ts)、Domain／Infrastructure 與 client storage。業務責任以已確認 SPEC 為準。

## D1 schema

Foundation 原六張自有表共 **54 欄**（8＋5＋10＋8＋16＋7），每表首欄為 NOT NULL TEXT PRIMARY KEY，由程式建立小寫 canonical UUIDv7。D1 的 `d1_migrations` 是工具維護表，不計入自有六表。日期欄位使用 Unix epoch **milliseconds INTEGER**；DB row snake_case，公開 DTO camelCase。

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

## AvatarAndPreferences（2026-11-03）

[0002_avatar_preferences.sql](../../cloudflare/migrations/0002_avatar_preferences.sql) 新增兩表24欄，Foundation六表54欄不變、無SQL Trigger。已對本專案 default local 套用，未部署SIT／production。

| 表 | 欄位 |
|---|---|
| user_profiles（15） | profile_id、account_id、nickname、bio、occupation、birth_date、region_code、traits_json、interests_json、preferences_json、selected_avatar_type、selected_avatar_ref、revision、created_at、updated_at |
| user_media_assets（9） | asset_id、account_id、kind、object_key、mime_type、display_order、status、created_at、deleted_at |

profile首次ensure冪等；嚴格22欄輸入（含expectedRevision）、三組JSON（preferences固定9鍵）及版本化靜態目錄見SPEC。臺灣日期18+，Unicode scalar長度；occupation可空。本人投影含精確生日及私有偏好，名片預覽只用分享白名單。generated profileReady額外要求本人ready正式資產，不單靠type/ref字串。儲存含停用目錄選項時，Application先讀本人目前revision及同欄位歷史值；只允許原值保留，其他欄位出現同碼也不能當作保留依據。撤銷401、版本落後409、新加入停用碼400，停用值保留不另新增metadata鍵；D-053新增三個具名schema欄位另見下文。

`profile.photo.reserve` 單條件 INSERT…SELECT COUNT(pending+ready)<5 RETURNING；pending計入配額。ready按當下ready最大序號+1配號。排序核對整個ready集合及revision，刪除同batch先CAS、soft-delete、壓緊其餘序號；零列不假成功。上傳失敗僅透過 `profile.photo.cancel-upload` 撤pending，不因遺失回覆誤刪ready；舊內部delete不供正式HTTP刪除使用。R2先成功寫入才ready，刪除先tombstone才允許R2實體清除。GC清逾30分鐘pending及tombstone物件；R2 `_system/avatar-preferences/cleanup.json`保存photoCursor、r2Cursor及最多100個尚未處理key／到期metadata，分配各段預算並以ETag提交進度，不刪ready原件、不加D1 job表。

AI狀態不加job表：每帳號R2 active pointer與60分鐘manifest以ETag CAS提供排他、成功數1～4、request replay、短效來源ID、已失敗requestID、unknown成本鎖及採用receipt。摘要digest僅在短效manifest去重，D1不存byte_size／hash。來源照片存 `private/{owner}/photos/{asset}`，候選存 `private/{owner}/avatar/temp/{attempt}/{manifest|1..4}`；確認採用後先在既有媒體表保留generated pending，再複製選中圖至 `private/{owner}/avatar/{asset}`，D1同batch條件pending→ready並更新profile revision。正式資產不隨候選到期清除；中斷的未提交副本延後清理。

`profile.avatar.reserve/adopt/cancel-adoption`處理採用媒體生命週期，不增加表或欄位。正式asset UUIDv7由.NET server提出，與attemptId分開，R2 manifest的selectedAssetId保留單次採用身分；失敗重試用新ID，deleted不復活。取消補償可在原Session失效後清理自己的pending，並為較晚reserve留下tombstone；已ready不可被取消。先原子取消再刪R2，避免失敗者刪掉並行已提交圖。D1已ready但R2關輪回覆遺失時，status／begin只修復既有receipt，不重新生成／複製／增加revision。

媒體固定指令的可寫範圍如下；所有輸入採strict schema，現有資產的account_id／kind／object_key／mime_type／created_at不可修改。呼叫端不可傳status、deleted_at或display_order；SQL依目前身分及狀態推導。對外仍只經受保護API，不公開command入口。

| 內部指令 | 允許變更 |
|---|---|
| `profile.photo.reserve` | 新建pending照片；owner與照片ID推導固定key，pending＋ready少於5才插入；既有ID不可覆寫 |
| `profile.photo.ready` | 僅pending→ready，依當前ready尾端推導display_order |
| `profile.photo.cancel-upload` | 僅pending→deleted及deleted_at；不能取消已ready |
| `profile.photo.delete` | 本人pending／ready→deleted及deleted_at；只留作內部生命週期指令 |
| `profile.photo.reorder` | 完整本人ready集合的display_order，及profile revision／updated_at |
| `profile.photo.delete-compact` | 同batch修改profile revision／updated_at、目標status／deleted_at、其餘ready display_order |
| `profile.photo.list`、`profile.avatar.list` | 唯讀，只回本人ready metadata |
| `profile.avatar.reserve` | 新建generated pending；來源及revision有效才插入，既有ID不覆寫 |
| `profile.avatar.cancel-adoption` | 本人generated pending→deleted／deleted_at，或先建不可復活的deleted保留列；ready不變 |
| `profile.avatar.adopt` | 本人generated pending→ready，及profile選用欄位／revision／updated_at |
| `profile.avatar.builtin`、`profile.avatar.generated` | 只改profile選用欄位／revision／updated_at，不改媒體身分或建立副本 |

圖片規則：上傳最多8MiB，安全解碼JPEG／PNG／WebP、像素24M／邊長8192、拒動畫／偽造MIME／損壞圖；校正EXIF方向、白底透明、去EXIF／GPS／ICC、保留比例不放大，來源JPEG≤200000 bytes。AI結果≤2MB、3:4容許小幅供應商尺寸取整，顯示contain不裁切。正式免費圖16張JPG及provenance版本2026-11-03.v2，與真人媒體分開。

本人正式AI圖清單僅回assetId／mimeType／createdAt；重選使用相同資產與profile revision CAS，不建立副本。來源改變會關閉舊manifest；失敗request ID上限64，超限在新lease前拒絕以保持manifest可讀。關閉輪次仍辨識初次request replay，不誤開另一輪付費生成。

前端未儲存表單以記憶體baseline及revision追蹤；metadata重讀可保留草稿，但伺服器欄位已改變時禁止將舊草稿搭配新revision覆寫，須明確重新整理。不將草稿、候選或真人照片另存localStorage／日誌。

完整驗證與尚缺Gate見[本SPEC驗證紀錄](../../docs/verification/SPEC-001-AvatarAndPreferences-Verification.md)；測試通過數不是275項完整驗收數。

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

私人 key 為 `private/{accountId}/foundation-test/{objectId}`，owner 必須由已驗證 CurrentUser 取得；objectId 為 UUIDv7，操作前重驗 family。Foundation測試物件路徑只支援 foundation-test 用途，內容最大8192 bytes、內部 JSON Base64字串上限12000，Content-Type固定 application/octet-stream；不借用作業務圖片路徑；AvatarAndPreferences使用前述獨立媒體通道，無公開私人圖片URL。

ready 檢查 EXPECTED_MIGRATION 的 `d1_migrations` 記錄、依EXPECTED_MIGRATION驗六表／八表欄位順序／首欄PK與NOT NULL、未撤銷 session UNIQUE index，以及 R2 `_system/foundation/probe.txt` 內容 `datinghigh-foundation-v1`。它不是完整資料稽核；UNIQUE／FK／rollback 的行為仍由真 D1 測試證明。

每小時清理過期 rate bucket、challenge（以 absolute expiry 的保留窗）、session／refresh（absolute expiry後7天）。refresh 自參照先分批解除再刪除，最後刪無 token 的 session；不刪帳號／identity，也不將清理當授權機制。

## 設定與變更

實際設定 key、binding、build-time／runtime 分類見 [環境變數](../04-deployment/02-environment-variables-template.md)。沒有 appsettings 階層設定；目前讀取的認證名稱不改寫成其他慣例名稱。

schema 變更須先有已確認範圍、migration／prepared SQL／ready 同步與真 D1 失敗測試；不得修改 Foundation 原六張 54 欄的既有基線；新增業務表須另立已核准的 migration 與完整業務測試。同步 DTO／storage／設定時也需更新 API、相依地圖與對應測試，保留 local／cloud 資料隔離。
