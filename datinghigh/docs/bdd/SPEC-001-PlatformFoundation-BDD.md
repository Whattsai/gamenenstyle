# SPEC-001-PlatformFoundation 跨平台應用、使用者身分與 Cloudflare 資料基礎 — BDD 場景規格

> **從 SDD 規格文件轉換生成**
> **SPEC 來源**: [SPEC-001-PlatformFoundation](../specs/SPEC-001-PlatformFoundation.md)
> **MVP 來源**: [MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
> **生成日期**: 2026-10-25
> **修訂日期**: 2026-10-29；補記 MVP D-029～D-031 的名片業務邊界；2026-10-27 D-017／D-018 及認證機制精簡決策 D-019～D-028 的場景維持。
> **階段**: 依使用者確認 SDD 產生規劃文件；未實作、未執行應用測試。

---

## 📝 Feature 描述

**Feature**: 三平台共用的已驗證身分、Email／Google 登入、平台權杖與 Cloudflare 資料基礎。

作為使用者，我想在 iOS、Android、Web 使用同一份可復原帳號；作為開發者與維護者，我想在自己磁碟查改本地資料並以真實 Cloudflare 接線驗收，以便後續功能沿用可信身分與持久化邊界。

本份只承接 PlatformFoundation。US-002／US-006 僅驗權限及私人資料契約，US-013 僅驗帳號基本流程與視覺骨架；其餘七份 SPEC 的化身、配對、劇情、分數、問卷、遊戲、約會與告白仍未完成，不建立可誤認為完成的 demo。

MVP 於 2026-10-29 依 D-029～D-031 統一將總體好感度更名為「親密度」，新增 `US-020` 的 25 分交換名片、配對前個人資料、雙方同意、可重送及拒絕不改分。欄位由 AvatarAndPreferences、交換／揭露由 AffectionAndFeedback、終止邊界由 StoryDialogueAndExit 承接；本份 92 個場景不含名片業務驗收，既有登入 Email 與私人資料保護不因新增需求而放寬。

**閱讀規則**：PF-BDD ID 為穩定追溯 ID，**既有編號不重編**；其中 `PF-BDD-006` 與 `PF-BDD-073` 因 D-023 決定首次 Google 登入直接建帳（不再走外部註冊收件碼驗證）而移除，缺號不補，全文件共 **92 個唯一 Scenario**（含 **25 個 `@frontend` Scenario**）。每個場景均為未實作 checklist。「逐一」列出的輸入／故障是全部必驗資料列，後續 TDD 不能只測一例。BDD 的繁中 UI 文案是呈現層細化，不新增未定義 API code。技術故障場景以精確 HTTP／code／副作用驗收，產品文案見相應前端場景。

**已確認決策（含 D-019～D-028 精簡）**：
1. **單一登入與 Web 多分頁（D-017、D-021）**：每個 Account 最多容許一個未撤銷 family（以 `UNIQUE(account_id) WHERE revoked_at IS NULL` 保護），新登入成功原子撤銷舊 family，commit 前失敗保舊；Web **不限制分頁數**（移除瀏覽器單分頁鎖與前端預期工作階段請求標頭），改由已登入 API 回應附帶 `X-DatingHigh-Session`（CORS 暴露）與 401 `SESSION_REVOKED` 讓分頁同步狀態。
2. **權杖與 30 秒寬限窗（D-019、D-020）**：Access Token 採 **HS256** 與單一環境秘密 `ACCESS_TOKEN_SECRET`；Refresh Token 單次輪替並以 `UNIQUE(session_id, generation)` 為線性化點，對已消耗 token 提供 **30 秒寬限窗**（30 秒內緊接前一代重試回 200 再輪替、30 秒內並行落敗回 409 `REFRESH_RETRY`、逾 30 秒重放回 401 `REFRESH_TOKEN_REUSE` 並撤銷整個 family）。
3. **Google 直接建帳與簡化連結（D-023、D-024、D-025）**：有效 Google ID Token 可重用，後端驗證 `email_verified=true` 且網域為 `gmail.com` 或 `hd` claim 等於 Email 網域（否則回 401 `EXTERNAL_EMAIL_UNTRUSTED`）；首次登入直接於同一 D1 batch 建帳並回 201；已登入連結 Google 僅需有效本人 Access＋family 與同 Email，不需目前密碼、不增加 `credential_version`、不踢登出；解除綁定仍需目前密碼並增加 `credential_version`。
4. **原子性、寄信、限流與傳輸簡化（D-022、D-026、D-027、D-028）**：移除樂觀並行輔助版本與批次標記欄位及故意觸發約束錯誤的結尾 guard，改用同一 D1 batch 共用前置條件與 UNIQUE 衝突回滾（`credential_version` 為唯一並行欄位）；移除驗證碼投遞狀態機，寄信逾時 10 秒，註冊寄送失敗回 503 `EMAIL_DELIVERY_FAILED`、忘記密碼仍回通用 202；限流與驗證碼各採單一 HMAC 環境秘密（`RATE_LIMIT_HMAC_KEY`、`EMAIL_CODE_HMAC_KEY`）且全由 .NET 計算雜湊，限流政策定義於靜態常數表 `RateLimitPolicies`；傳輸判定僅保留兩條規則（有 `Origin` 必為 web；依 `clientPlatform` 讀取對應來源並忽略另一來源）。
5. **資料表結構**：六張自有表精簡後共 **54 欄**，第一欄單欄 UUIDv7，`auth_`／`common_` 命名，禁止 Identity／EF。

## 🎯 前端 UX 實作進度

### 整體進度

```text
📦 SPEC-001-PlatformFoundation 前端 UX 實作
├─ 🔨 實作狀態: 未開始
├─ ⏰ 開始時間: -
├─ 📅 預計完成: -
└─ 👤 負責人: -

進度條: [░░░░░░░░░░░░░░░░░░░░] 0% (0/25)
```

### 分頁面/元件進度

| 頁面/元件 | 進度 | 已完成 | 進行中 | 待開始 | 狀態 |
|---|---|---|---|---|---|
| Google 未就緒與共用等待元件（024、092） | 0% | 0/2 | 0 | 2 | ⏸️ 未開始 |
| 九條帳號路由、互動及登入恢復（068–072、074–091） | 0% | 0/23 | 0 | 23 | ⏸️ 未開始 |

各 ID 皆有 PF-BDD- 前綴；分類互斥，以唯一 Scenario ID 計數（`PF-BDD-073` 已依 D-023 移除）。

### SPEC 前端覆蓋率

| 指標 | 數值 | 狀態 |
|---|---|---|
| SPEC 畫面／路由總數 | 9：開始、註冊、驗碼、登入、忘記、重設、帳號、改密碼、連結 | 文件已列出 |
| BDD 已覆蓋 | 9/9 路由；25個 @frontend 場景 | 文件覆蓋100%，未實作 |
| SPEC 補充未覆蓋項目 | 0 | 不代表測試通過 |
| 前端實作進度 | 0% | ⏸️ 未開始 |

---

## 📋 Background（前置條件）

```gherkin
Feature: PlatformFoundation 帳號、Session、資料及部署基礎
  Background:
    Given 來源 MVP 與本份 SDD 已由使用者確認，所有場景只描述後續待實作行為
    And 固定 clock 與 random adapter 可控制邊界，真實資料、寄信、Google及原生建置依各場景驗收
    And A、B 預設是獨立帳號；標明同Account之裝置family則只有最新成功登入有效，環境秘密分離且不進 Git
    And 公開 API 採 HTTPS、/api/v1、嚴格 JSON、no-store 與 ProblemDetails；本地 loopback HTTP 為明訂例外
```

| 邊界 | 可替身範圍 | 不可因此宣稱完成 |
|---|---|---|
| Domain／Application | clock、random、故障sender／validator | 真 D1、Google、收信 |
| 本地整合 | 故障注入；其他經真 Docker／Wrangler bridge | 雲端部署 |
| 前端／E2E | 明定故障案例 | iOS／Android各須development build執行 |
| staging | 真Google、真收信、D1/R2 | 不可用local、mock或message ID代替結果 |

---

## ✅ Happy Path — 正常流程

### @happy-path @critical @smoke @PF-BDD-001

- [ ] **Scenario: PF-BDD-001 — 建立可追溯的 Expo 三平台及 .NET 分層建置**
  - SPEC 對應: `PF-AC-001`、`PF-AC-018`
  - MVP 追溯: US-013／AC-013-01；US-015／AC-015-01、AC-015-02
  - 涉及元件: apps/client；server；cloudflare；建置紀錄

  ```gherkin
  Scenario: PF-BDD-001 建立可追溯的 Expo 三平台及 .NET 分層建置
    Given 正式應用尚未建立且原型僅供視覺參考
    When 開發者依版本策略建立與建置本份平台骨架
    Then Expo SDK58相容依賴、Node24、Wrangler4.136.0以上實際patch、Containers SDK、net10.0 SDK、runtime及映像digest均固定並提交鎖檔
    And Domain、Application、Infrastructure、Api依指定責任分層，不引用Identity或EF
    And Web以single輸出匯出，Android及iOS各有development build與帳號基本流程執行證據；缺證據記「未驗收」
    And compatibility_date固定2026-10-24，Linux容器內8080，每環境邏輯容器api-v1，Durable Object wrapper只管生命週期/路由；容器空閒十分鐘可休眠
    And Web、Android、iOS的同Account驗收逐次登入，每次新登入成功撤銷上次family，不以三平台同時保持登入作正例
  ```

### @happy-path @critical @PF-BDD-002

- [ ] **Scenario: PF-BDD-002 — Email 請求收件碼只建立限時挑戰**
  - SPEC 對應: `PF-AC-004`、`PF-AC-027`、`PF-AC-028`、`PF-AC-029`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-018／AC-018-03；US-018／AC-018-04；US-019／AC-019-02；US-018／AC-018-02；US-019／AC-019-01
  - 涉及元件: RequestRegistrationCode；EmailChallenge；sender

  ```gherkin
  Scenario: PF-BDD-002 Email 請求收件碼只建立限時挑戰
    Given 尚未註冊的Email為「 Reader+tag@Example.com 」且sender就緒
    When POST /api/v1/email-registrations提交合法clientPlatform
    Then 先持久化register_email挑戰（state=active）並呼叫sender（逾時上限10秒），成功回202及challengeId、flowToken、expiresAt、resendAfter，Email固定reader+tag@example.com
    And 只保存32-byte隨機flowToken之SHA-256與由.NET以單一EMAIL_CODE_HMAC_KEY計算的六位碼keyed HMAC，不保存密碼或raw code
    And 未確認前無Account、identity、family或平台token，未確認挑戰不永久占用Email
    And 明確APP_ENV=local且Log模式時，在.NET專用LocalEmailVerification終端category取得purpose/challenge/Email/generation/code/期限，cloud則由EMAIL binding真寄，不送raw code到前端
  ```

### @happy-path @critical @smoke @PF-BDD-003

- [ ] **Scenario: PF-BDD-003 — Email 收件碼確認原子建立已驗證帳號**
  - SPEC 對應: `PF-AC-004`、`PF-AC-027`、`PF-AC-028`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-018／AC-018-03；US-018／AC-018-04；US-019／AC-019-02
  - 涉及元件: ConfirmRegistration；account.register-email

  ```gherkin
  Scenario: PF-BDD-003 Email 收件碼確認原子建立已驗證帳號
    Given register_email挑戰state=active、未過期、generation與code_mac相符且Email未被使用
    When POST /api/v1/accounts提交正確flowToken、六位碼、合法密碼及原平台
    Then 回201與已驗證AccountDto、session及符合平台傳輸的tokens（含X-DatingHigh-Session回應標頭）
    And 同一D1 batch共用挑戰仍為active且generation/code_mac相符之前置條件，依序建立Active Account、email_verified_at、family與generation0 Refresh，並於batch最後一句條件消耗挑戰（state='consumed'）
    And 密碼只保存指定PBKDF2自描述hash，不建外部identity；再次提交碼不得再建帳或核發token
  ```

### @happy-path @critical @smoke @PF-BDD-004

- [ ] **Scenario: PF-BDD-004 — Email 帳密先後跨裝置登入僅保留最新 family**
  - SPEC 對應: `PF-AC-003`、`PF-AC-005`、`PF-AC-023`
  - MVP 追溯: US-013／AC-013-02；US-017／AC-017-01、AC-017-03；US-017／AC-017-01
  - 涉及元件: CreateSession；SessionProvider

  ```gherkin
  Scenario: PF-BDD-004 Email 帳密先後跨裝置登入僅保留最新 family
    Given 已驗證Active Account先在手機登入，該family是目前唯一有效登入
    When iOS、Android、Web依序成功POST /api/v1/sessions，並逐次確認前後憑證
    Then 各次201的Account ID相同，但每次成功提交都在同一D1 batch內條件撤銷同Account舊family並建立最新唯一有效family與generation0 Refresh（不寫入auth_accounts、不增加credential_version）
    And 電腦登入成功後手機舊Access即使未到期及舊Refresh皆拒絕；手機觀察到替代失效時顯「帳號已在其他裝置登入，請重新登入」
    And 密碼錯誤、驗證失敗、限流或新family/Refresh寫入失敗不得撤銷原本仍有效登入；沒有其他成功提交時保留原狀
    And 原生取得Bearer Access及opaque Refresh，Web僅回期限與兩個HttpOnly Cookie並附X-DatingHigh-Session標頭，GET /me由D1取得同一Account
    And 不依client自報ID、固定demo或容器記憶體，三平台證據依序取得，不宣稱同時有效
    And 「失敗保留舊登入」僅指commit前驗證或SQL失敗；新登入已commit而HTTP回應遺失時舊登入已撤，不假設回滾、不盲重送登入
  ```

### @happy-path @critical @PF-BDD-005

- [ ] **Scenario: PF-BDD-005 — 首次 Google 登入驗證可信網域並直接原子建立無本地密碼帳號**
  - SPEC 對應: `PF-AC-004`、`PF-AC-019`、`PF-AC-021`、`PF-AC-028`、`PF-AC-032`、`PF-AC-034`、`PF-AC-035`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-016／AC-016-01；US-016／AC-016-03；MVP D-009、D-023、D-024
  - 涉及元件: CompleteExternalSignIn；GoogleExternalCredentialValidator；account.register-external

  ```gherkin
  Scenario: PF-BDD-005 首次 Google 登入驗證可信網域並直接原子建立無本地密碼帳號
    Given google啟用且SDK credential有效、email_verified=true、Email網域為gmail.com（或token之hd claim等於Email網域），且(google, sub)與正規化Email尚未使用
    When POST /api/v1/sessions/external/google提交credential、clientPlatform
    Then 回201與已驗證AccountDto（hasLocalPassword=false且linkedProviders包含google）、session及符合平台傳輸的tokens
    And 同一D1 batch（account.register-external）原子建立Active Account（password_hash=NULL、email_verified_at設為當下）、auth_external_identities(provider='google', subject=sub)、family與generation0 Refresh
    And 無需二次Email驗證碼挑戰，不存Google credential至D1，且不得由request覆寫provider、subject或Email
  ```

### @happy-path @critical @PF-BDD-007

- [ ] **Scenario: PF-BDD-007 — 既有 Google 先後跨平台登入僅保留最新 family**
  - SPEC 對應: `PF-AC-019`、`PF-AC-021`、`PF-AC-023`、`PF-AC-034`
  - MVP 追溯: US-016／AC-016-01；US-016／AC-016-03；US-017／AC-017-01；MVP D-009；US-016／AC-016-03、AC-016-04
  - 涉及元件: GIS popup；native SDK；session.create

  ```gherkin
  Scenario: PF-BDD-007 既有 Google 先後跨平台登入僅保留最新 family
    Given Web GIS popup及iOS/Android development build SDK設定真實，Google (provider, subject)已綁定Active Account
    When 三平台依序提交有效ID Token且verified Email具可信網域並與Account相同
    Then 各次200回同一Account；每次成功登入提交在同一D1 batch內撤銷舊family並建立新family與generation0 Refresh，僅最新family的Access/Refresh可用
    And Google驗證或建立family失敗不踢除既有有效登入，三平台執行證據逐次記錄
    And 不需server nonce或auth_challenges，Google姓名/真實頭像不作公開化身，Google憑證不作平台API憑證
    And Google ID Token僅留記憶體、以HTTPS body送後清除，不存sessionStorage/SecureStore/D1/URL/log；不取offline access、Google Refresh Token或多餘scopes，不需client secret
  ```

### @happy-path @critical @smoke @PF-BDD-008

- [ ] **Scenario: PF-BDD-008 — 合法 Refresh 原子輪替並更新受限制的 idle**
  - SPEC 對應: `PF-AC-006`、`PF-AC-023`、`PF-AC-024`
  - MVP 追溯: US-017／AC-017-02、AC-017-04；US-017／AC-017-01；US-017／AC-017-02
  - 涉及元件: RefreshSession；session.refresh

  ```gherkin
  Scenario: PF-BDD-008 合法 Refresh 原子輪替並更新受限制的 idle
    Given family有效且generation0 Refresh未消耗
    When POST /api/v1/session/refresh以正確平台傳輸提交Refresh
    Then 回200，同一D1 batch依目前current_generation=0與未撤銷條件更新auth_sessions、建立唯一generation1 Refresh（受UNIQUE(session_id, generation)保護）並標記generation0 consumed_at與replaced_by_token_id
    And 回新pair，Web更新兩個Cookie並附X-DatingHigh-Session標頭，D1只存Refresh SHA-256
    And idle更新至不超過絕對30日之七日，HS256 Access exp不超十分鐘及目前family期限
  ```

### @happy-path @critical @PF-BDD-009

- [ ] **Scenario: PF-BDD-009 — 本人 session、帳號及登入方式查詢使用可信身分**
  - SPEC 對應: `PF-AC-003`、`PF-AC-009`、`PF-AC-016`、`PF-AC-023`、`PF-AC-034`
  - MVP 追溯: US-013／AC-013-02；MVP身分與資料歸屬；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅權限基礎）；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）；US-017／AC-017-01；MVP D-009；US-016／AC-016-03、AC-016-04
  - 涉及元件: GET /session；GET /me；GET /me/identities

  ```gherkin
  Scenario: PF-BDD-009 本人 session、帳號及登入方式查詢使用可信身分
    Given Access及D1 family、Active、cv皆有效
    When 分別GET /api/v1/session、/api/v1/me、/api/v1/me/identities
    Then 回200及本人的AccountDto、session期限或登入方式摘要，且回應標頭附X-DatingHigh-Session為目前有效family ID
    And GET不回raw token；identities只含hasLocalPassword與provider、linkedAt
    And DTO無外部subject、密碼hash、code MAC、flow hash；JWT無Email
  ```

### @happy-path @critical @PF-BDD-010

- [ ] **Scenario: PF-BDD-010 — 修改目前密碼後全部舊裝置失效**
  - SPEC 對應: `PF-AC-007`、`PF-AC-016`
  - MVP 追溯: US-017／AC-017-04；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）
  - 涉及元件: ChangePassword；PUT /me/password

  ```gherkin
  Scenario: PF-BDD-010 修改目前密碼後全部舊裝置失效
    Given 本人有本地密碼、目前唯一有效family及先前已撤銷的歷史family，目前密碼正確
    When PUT /api/v1/me/password提交合法newPassword且最後寫入授權與credential_version有效
    Then 回204，條件更新password_hash並將credential_version加1，清除Web Cookie pair
    And 目前及全部歷史舊Access/Refresh皆因cv不符或已撤銷而失效，新密碼可重新登入，舊密碼回INVALID_CREDENTIALS
    And Google綁定保留，不為本案例同時建立兩個有效family
  ```

### @happy-path @critical @smoke @PF-BDD-011

- [ ] **Scenario: PF-BDD-011 — 忘記密碼以正確收件碼重設且不自動登入**
  - SPEC 對應: `PF-AC-008`、`PF-AC-028`、`PF-AC-030`
  - MVP 追溯: US-019／AC-019-02、AC-019-03；US-018／AC-018-04；US-019／AC-019-02；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: RequestPasswordReset；ResetPassword

  ```gherkin
  Scenario: PF-BDD-011 忘記密碼以正確收件碼重設且不自動登入
    Given 已註冊Email對應Active Account及目前cv
    When POST /api/v1/password-reset-requests後以正確碼POST /api/v1/password-resets
    Then 首次回同形202及「若此 Email 可處理，將收到驗證碼」，挑戰固定Account ID及bound_credential_version
    And 確認回204，同一D1 batch依挑戰仍為active且bound_credential_version相符之條件更新password_hash、將credential_version加1，並於最後一句消耗挑戰，不核發session
    And 舊密碼、所有舊Access/Refresh及綁舊cv的其他reset挑戰失效，新密碼可重新登入
    And 本機從專用後端log取得reset碼，staging/production從實際Email收碼；兩者均走完整挑戰驗證而非假成功
  ```

### @happy-path @critical @PF-BDD-012

- [ ] **Scenario: PF-BDD-012 — 僅第三方帳號以 Email 設定本地密碼**
  - SPEC 對應: `PF-AC-008`、`PF-AC-022`、`PF-AC-030`
  - MVP 追溯: US-019／AC-019-02、AC-019-03；US-016／AC-016-04；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: ResetPassword；Account

  ```gherkin
  Scenario: PF-BDD-012 僅第三方帳號以 Email 設定本地密碼
    Given 已驗證Account只有google而無本地密碼
    When 本人以有效Email碼提交合法newPassword
    Then 回204並建立本地hash、保留Google，全部舊family失效
    And 重新以Email密碼或Google都回同一Account；未設定前帳密登入為通用INVALID_CREDENTIALS
  ```

### @happy-path @critical @PF-BDD-013

- [ ] **Scenario: PF-BDD-013 — 本人已登入直接連結同 Email Google 且不強制重登**
  - SPEC 對應: `PF-AC-022`、`PF-AC-034`、`PF-AC-035`
  - MVP 追溯: US-016／AC-016-04；MVP D-009、D-025；US-016／AC-016-03、AC-016-04；MVP D-013、D-014；US-016／AC-016-02
  - 涉及元件: LinkExternalIdentity；POST /me/identities/google

  ```gherkin
  Scenario: PF-BDD-013 本人已登入直接連結同 Email Google 且不強制重登
    Given 本人Access/family/cv有效，verified Google Email具可信網域且與本人Email相同，且(google, sub)未被占用
    When POST /api/v1/me/identities/google提交credential、clientPlatform（無需提交currentPassword）
    Then 回200、provider=google、linked=true
    And 依當下有效family與Account active/cv條件寫入auth_external_identities(provider, subject)
    And 不增加credential_version、不撤銷目前有效family、不清除Web Cookie，之後使用Google登入仍回本人Account
  ```

### @happy-path @critical @PF-BDD-014

- [ ] **Scenario: PF-BDD-014 — 解除 Google 保留本地登入方式**
  - SPEC 對應: `PF-AC-007`、`PF-AC-022`
  - MVP 追溯: US-017／AC-017-04；US-016／AC-016-04
  - 涉及元件: UnlinkExternalIdentity；DELETE /me/identities/google

  ```gherkin
  Scenario: PF-BDD-014 解除 Google 保留本地登入方式
    Given 本人有本地密碼及Google，Access有效且目前密碼正確
    When DELETE /api/v1/me/identities/google提交currentPassword
    Then 回204，同一D1 batch依目前有效family與credential_version條件將credential_version加1並刪除本人Google identity，使所有舊family失效並清除Web Cookie pair
    And 本地密碼可重新登入，Account/Email不刪除，Google本身不被登出
  ```

### @happy-path @critical @PF-BDD-015

- [ ] **Scenario: PF-BDD-015 — 登出只撤指定 family 且舊裝置不得影響新登入**
  - SPEC 對應: `PF-AC-006`、`PF-AC-007`、`PF-AC-026`
  - MVP 追溯: US-017／AC-017-02、AC-017-04；US-017／AC-017-04；US-017／AC-017-03、AC-017-04；US-016／AC-016-02
  - 涉及元件: RevokeSession；DELETE /session

  ```gherkin
  Scenario: PF-BDD-015 登出只撤指定 family 且舊裝置不得影響新登入
    Given 同Account曾在手機建立A，之後電腦成功登入建立B並已撤銷A，只有B有效
    When A以可辨識其歷史family的Access或Refresh DELETE /api/v1/session，隨後B主動登出
    Then A的冪等撤銷只作用A並回204，不撤銷B、不以Account ID清除最新family
    And B登出持久撤銷B後回204才清B兩個Cookie或SecureStore；其新舊token皆拒絕
    And 無憑證或重複指定family登出仍204，過期/consumed Refresh只可識別撤銷而不能授權其他操作
    And A若使用舊Refresh恢復登入則拒絕，不產生新family或改變B
  ```

### @happy-path @critical @PF-BDD-016

- [ ] **Scenario: PF-BDD-016 — 私人 object adapter 由可信 owner 衍生 R2 key**
  - SPEC 對應: `PF-AC-009`、`PF-AC-014`、`PF-AC-016`
  - MVP 追溯: MVP身分與資料歸屬；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅權限基礎）；US-015／AC-015-02；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）
  - 涉及元件: IPrivateObjectStore；object.private.put/get/delete

  ```gherkin
  Scenario: PF-BDD-016 私人 object adapter 由可信 owner 衍生 R2 key
    Given A的Access有效且用途/object ID/bytes/metadata符合限制
    When 內部依序put、get、delete私人測試object
    Then handler重查exp/family/cv，以private/{A的AccountId}/{purpose}/{objectId}衍生key
    And 讀回內容、byte length、SHA-256一致，delete後不可讀
    And 不提供公開媒體API或公開bucket URL，不以probe作私人授權捷徑
  ```

---

## 🔀 Alternative Path — 替代流程

### @alternative-path @critical @PF-BDD-017

- [ ] **Scenario: PF-BDD-017 — 有效 Google proof 可重用且每次登入成功撤舊**
  - SPEC 對應: `PF-AC-020`、`PF-AC-021`、`PF-AC-032`、`PF-AC-035`
  - MVP 追溯: US-016／AC-016-02；US-016／AC-016-03；US-018／AC-018-01、AC-018-03；MVP D-013、D-014、D-023
  - 涉及元件: CompleteExternalSignIn；account.register-external；session.create

  ```gherkin
  Scenario: PF-BDD-017 有效 Google proof 可重用且每次登入成功撤舊
    Given Google ID Token仍有效、具可信Email網域且限流有額度，Account目前至多一個有效family
    When 相同credential先後重送，或Email與Google對同Account並行提交新登入
    Then 首次未知(google, sub)且Email未註冊時直接建帳回201，後續重送同credential走既有綁定登入回200；按成功commit順序最後一個family唯一有效，先成功者隨後被一般新登入規則撤銷
    And 不回proof-reuse錯誤，不將Google proof重用當Refresh重放處罰；撤舊只因另一次登入成功
    And 驗證失敗或SQL寫入失敗整批回滾不替換目前登入；舊裝置再refresh不得復活被撤family
    And Email驗證碼與Refresh各自維持單次消耗（Refresh具30秒寬限窗）
    And 成功commit但回應遺失仍已替代舊family，不因Google proof可重用而自動重送不明登入；需重新由使用者操作確認登入
  ```

### @alternative-path @normal @PF-BDD-018

- [ ] **Scenario: PF-BDD-018 — 同帳號同 identity 重複連結為冪等成功**
  - SPEC 對應: `PF-AC-022`
  - MVP 追溯: US-016／AC-016-04
  - 涉及元件: LinkExternalIdentity

  ```gherkin
  Scenario: PF-BDD-018 同帳號同 identity 重複連結為冪等成功
    Given 本人已連相同Google (provider, subject)，當下Access及family有效
    When 再POST /api/v1/me/identities/google提交credential與clientPlatform
    Then 回200、provider=google、linked=true；identity仍一筆
    And credential_version與目前family不因重複連結變更，無第三方登入挑戰
  ```

### @alternative-path @critical @PF-BDD-019

- [ ] **Scenario: PF-BDD-019 — 未知 Email 忘記密碼回同形且永不能完成**
  - SPEC 對應: `PF-AC-028`、`PF-AC-030`
  - MVP 追溯: US-018／AC-018-04；US-019／AC-019-02；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: RequestPasswordReset；resend

  ```gherkin
  Scenario: PF-BDD-019 未知 Email 忘記密碼回同形且永不能完成
    Given 比較存在帳號、僅Google帳號、未知Email，格式皆合法
    When 各POST /api/v1/password-reset-requests及冷卻後resend（含已知Email遭遇sender寄送失敗或逾時）
    Then 都回同形202、challengeId、flowToken、expiresAt、resendAfter及「若此 Email 可處理，將收到驗證碼」，無登入方式或投遞狀態欄位
    And 未知Email不寄信、無可改Account，任何碼均不能重設；已知Email若sender失敗則記錄內部錯誤log但仍回同形202
    And 不為回應加固定人為等待，不採五秒觀察窗；正常必要I/O完成即回覆，已知/未知Email可保留寄送等工作造成的時間差
    And 不以404或差異status/文案揭露存在性，不承諾相同耗時或完全消除時間側通道
  ```

### @alternative-path @critical @PF-BDD-020

- [ ] **Scenario: PF-BDD-020 — 原生冷啟動從安全儲存恢復 session**
  - SPEC 對應: `PF-AC-005`、`PF-AC-025`、`PF-AC-026`
  - MVP 追溯: US-017／AC-017-01、AC-017-03；US-017／AC-017-03；US-017／AC-017-03、AC-017-04；US-016／AC-016-02
  - 涉及元件: NativeCredentialStore；ApiClient

  ```gherkin
  Scenario: PF-BDD-020 原生冷啟動從安全儲存恢復 session
    Given 原生Access隨程序重啟消失，只剩SecureStore的Refresh與family ID
    When client啟動執行一次受協調refresh
    Then 先成功持久寫入後繼Refresh再恢復請求，Access僅留記憶體
    And 不存Access到AsyncStorage/檔案/URL，未完成SDK本機流程重新開始，不恢復server第三方挑戰
  ```

### @alternative-path @critical @PF-BDD-021

- [ ] **Scenario: PF-BDD-021 — Web 刷新回應遺失先以 Cookie 唯讀確認或於 30 秒寬限內重試**
  - SPEC 對應: `PF-AC-024`、`PF-AC-025`
  - MVP 追溯: US-017／AC-017-02、AC-017-03；MVP D-020、D-021
  - 涉及元件: WebCredentialStore；GET /session；POST /session/refresh

  ```gherkin
  Scenario: PF-BDD-021 Web 刷新回應遺失先以 Cookie 唯讀確認或於 30 秒寬限內重試
    Given Web分頁已提交refresh但網路中斷導致回應不明，瀏覽器可能已收下新Cookie或仍保有前一代Cookie
    When 該分頁恢復登入狀態
    Then 先以目前Cookie GET /api/v1/session唯讀確認一次；若新Access Cookie已生效則直接恢復並同步X-DatingHigh-Session
    And 若瀏覽器仍持緊接前一代Refresh Cookie且距consumed_at未逾30秒，再次POST /api/v1/session/refresh可由30秒寬限窗自目前head再輪替一次並回200恢復
    And 若family已被其他裝置新登入替代，顯「帳號已在其他裝置登入，請重新登入」並導回登入頁
  ```

### @alternative-path @critical @PF-BDD-022

- [ ] **Scenario: PF-BDD-022 — 登出失敗保留只供撤銷重試的狀態**
  - SPEC 對應: `PF-AC-007`、`PF-AC-025`
  - MVP 追溯: US-017／AC-017-04；US-017／AC-017-03
  - 涉及元件: SessionProvider；RevokeSession

  ```gherkin
  Scenario: PF-BDD-022 登出失敗保留只供撤銷重試的狀態
    Given 手機A登出時網路中斷而撤銷未確認，之後可能有電腦B新登入成功並替代A
    When A處理失敗並於下次啟動重試原family撤銷
    Then 隱藏A私人畫面，未確認前顯「尚未完成伺服器登出，請重試」，僅留原family的撤銷重試憑證
    And 不先refresh待撤銷A；若A已因B登入撤銷，A的冪等logout只確認A失效並完成本機清除，不影響B
    And 不允許以A舊憑證登出或撤銷目前唯一有效B，B仍以最新family存取
  ```

### @alternative-path @normal @PF-BDD-023

- [ ] **Scenario: PF-BDD-023 — 等價密碼條件 rehash 不增加 cv**
  - SPEC 對應: `PF-AC-007`、`PF-AC-035`
  - MVP 追溯: US-017／AC-017-04；MVP D-013、D-014、D-022；US-016／AC-016-02
  - 涉及元件: IPasswordHashService；account.rehash

  ```gherkin
  Scenario: PF-BDD-023 等價密碼條件 rehash 不增加 cv
    Given 支援的舊版/舊成本PBKDF2已驗證且本人Access有效
    When 以等價密碼產生本版hash並依原password_hash與credential_version條件執行account.rehash
    Then password_hash更新但credential_version不變，既有family不被撤銷
    And 競態已改密碼時因password_hash或credential_version不符而更新零列，不覆寫新密碼或復活舊密碼，不用Identity/EF
  ```

### @alternative-path @normal @frontend @PF-BDD-024

- [ ] **Scenario: PF-BDD-024 — Google 設定未就緒仍提供帳密流程**
  - SPEC 對應: `PF-AC-002`、`PF-AC-019`、`PF-AC-018`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-016／AC-016-01；US-013／AC-013-01；US-015／AC-015-01、AC-015-02
  - 涉及元件: IExternalCredentialValidator；/login

  ```gherkin
  Scenario: PF-BDD-024 Google 設定未就緒仍提供帳密流程
    Given Google必要設定缺失而Email sender/帳密可用
    When 開啟登入頁
    Then Google顯示「Google 登入暫時無法使用，請稍後再試」，Email登入/註冊仍可操作
    And Google真登入保持未驗收，不以mock替代，不向使用者公開設定/秘密/binding細節
  ```

---

## ❌ Error Handling — 錯誤處理

### @error-handling @critical @PF-BDD-025

- [ ] **Scenario: PF-BDD-025 — 認證 API 嚴格 JSON、body 大小與錯誤投影**
  - SPEC 對應: `PF-AC-004`、`PF-AC-005`、`PF-AC-016`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-017／AC-017-01、AC-017-03；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）
  - 涉及元件: API JSON binding；ProblemDetails

  ```gherkin
  Scenario: PF-BDD-025 認證 API 嚴格 JSON、body 大小與錯誤投影
    Given 認證API採camelCase、UTC ISO8601、UUIDv7 ID與no-store
    When 逐一送超16KiB body、未知欄位、重複JSON屬性、錯型別、非法clientPlatform或owner欄位
    Then 超量413，其餘400，application/problem+json含type/title/status/code/traceId
    And 只投影可公開欄位錯誤，不回密碼/token/code/exception且無帳號或session副作用
  ```

### @error-handling @critical @PF-BDD-026

- [ ] **Scenario: PF-BDD-026 — Email 格式與長度由共用 server 元件拒絕**
  - SPEC 對應: `PF-AC-004`、`PF-AC-027`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-018／AC-018-03
  - 涉及元件: EmailAddress；全部建帳入口

  ```gherkin
  Scenario: PF-BDD-026 Email 格式與長度由共用 server 元件拒絕
    Given 所有Email及provider建帳入口共用validator
    When 逐一送非ASCII、display name、註解、空local-part、超64bytes local-part、超254bytes地址
    Then 回400及「請輸入有效的 Email」，不寄碼/建帳
    And 合法64bytes local-part及254bytes地址接受；只trim外側空白及invariant lowercase
    And 不刪+tag/Gmail點、不推測不同字面alias相等
  ```

### @error-handling @critical @PF-BDD-027

- [ ] **Scenario: PF-BDD-027 — 密碼規則與 PBKDF2 parser 拒絕非法輸入**
  - SPEC 對應: `PF-AC-004`、`PF-AC-035`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；MVP D-013、D-014；US-016／AC-016-02
  - 涉及元件: IPasswordHashService；註冊/修改/重設

  ```gherkin
  Scenario: PF-BDD-027 密碼規則與 PBKDF2 parser 拒絕非法輸入
    Given 共用Unicode scalar及UTF-8長度規則
    When 逐一送11或129scalar、超512bytes、NUL/控制字元密碼，或不支援/參數超限hash字串
    Then 新密碼400並提示「密碼須為 12 至 128 個字元，且不可包含控制字元」，parser不執行任意成本
    And 合法12/128scalar且至多512bytes接受，不trim/改大小寫/Unicode正規化
    And PBKDF2-HMAC-SHA256 600000次、獨立16byte CSPRNG salt、32byte key，自描述格式、constant-time比較
  ```

### @error-handling @critical @PF-BDD-028

- [ ] **Scenario: PF-BDD-028 — 無帳號與錯密碼使用同一登入錯誤**
  - SPEC 對應: `PF-AC-004`、`PF-AC-016`、`PF-AC-017`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）；MVP D-012、D-015；US-018／AC-018-04
  - 涉及元件: POST /sessions；IPasswordHashService

  ```gherkin
  Scenario: PF-BDD-028 無帳號與錯密碼使用同一登入錯誤
    Given 不存在Email、僅Google帳號及錯密碼帳號
    When 各POST /api/v1/sessions且格式合法
    Then 都401 INVALID_CREDENTIALS、title「Email 或密碼不正確」，不核發token
    And 都走限流與受限密碼驗證，必要時dummy hash；一般log不記body/hash/token
  ```

### @error-handling @critical @PF-BDD-029

- [ ] **Scenario: PF-BDD-029 — Google credential 逐項拒絕不可信證明與非可信網域**
  - SPEC 對應: `PF-AC-020`、`PF-AC-021`、`PF-AC-034`
  - MVP 追溯: US-016／AC-016-02；US-016／AC-016-03；MVP D-009、D-023；US-016／AC-016-03、AC-016-04
  - 涉及元件: GoogleExternalCredentialValidator

  ```gherkin
  Scenario: PF-BDD-029 Google credential 逐項拒絕不可信證明與非可信網域
    Given GoogleExternalCredentialValidator固定server環境allowlist
    When 逐一送錯簽章/非RS256/錯issuer或audience/必要azp不符/過期或非法iat/空sub/email_verified=false/無效Email/非ID Token，或送非gmail.com且無相等hd claim之Email
    Then 簽章或基本claim無效回401 EXTERNAL_CREDENTIAL_INVALID及「Google 登入驗證失敗，請重新登入 Google」
    And Email網域非gmail.com且token之hd不等於Email網域時，回401 EXTERNAL_EMAIL_UNTRUSTED及「此 Google 帳號的 Email 未通過網域信任檢查，請改用 Email 驗證碼註冊或先以密碼登入」
    And 不建Account/identity/family，sub保留大小寫，clientPlatform不擴大audience/azp信任範圍
  ```

### @error-handling @critical @PF-BDD-030

- [ ] **Scenario: PF-BDD-030 — 未知 provider 或信任設定注入被拒絕**
  - SPEC 對應: `PF-AC-034`、`PF-AC-035`
  - MVP 追溯: MVP D-009、D-024；US-016／AC-016-03、AC-016-04；MVP D-013、D-014；US-016／AC-016-02
  - 涉及元件: IExternalCredentialValidator；共用provider API

  ```gherkin
  Scenario: PF-BDD-030 未知 provider 或信任設定注入被拒絕
    Given 本份僅註冊google之IExternalCredentialValidator實作
    When external登入/連結/解除指定facebook、未知或未啟用provider，或body注入issuer/JWKS URL/audience/app ID
    Then 不支援provider回400 UNSUPPORTED_PROVIDER，額外欄位400，不發任意外部請求
    And 不宣稱Facebook已支援；DTO與auth_external_identities(provider, subject)保持provider通用，不設Google專屬linked布林
  ```

### @error-handling @critical @PF-BDD-031

- [ ] **Scenario: PF-BDD-031 — 全域 Email 衝突與 Google Email 變更拒絕**
  - SPEC 對應: `PF-AC-004`、`PF-AC-021`、`PF-AC-027`、`PF-AC-032`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-016／AC-016-03；US-018／AC-018-03
  - 涉及元件: Email/external登入；D1 UNIQUE

  ```gherkin
  Scenario: PF-BDD-031 全域 Email 衝突與 Google Email 變更拒絕
    Given Email已由任一登入方式註冊
    When 用大小寫/外側空白變體註冊或新Google subject使用相同Email
    Then 409 EMAIL_ALREADY_REGISTERED及「此 Email 已註冊，請先使用原有方式登入，再連結 Google」
    And 不寄註冊碼/建帳/自動合併或核發既有Account token
    And 已綁定subject的verified Email改變則409 EXTERNAL_EMAIL_CHANGED及「Google Email 已變更，請使用原有登入方式」，不自動改Email
  ```

### @error-handling @critical @PF-BDD-032

- [ ] **Scenario: PF-BDD-032 — Google 連結須具當下本人有效登入，解除綁定須驗證目前密碼**
  - SPEC 對應: `PF-AC-022`
  - MVP 追溯: US-016／AC-016-04；MVP D-025
  - 涉及元件: POST /me/identities/google；DELETE /me/identities/google

  ```gherkin
  Scenario: PF-BDD-032 Google 連結須具當下本人有效登入，解除綁定須驗證目前密碼
    Given Google credential有效但本人Access缺失/過期/family已撤銷/Account disabled/cv不符，或解除綁定時currentPassword錯誤
    When 提交POST /api/v1/me/identities/google連結或DELETE /api/v1/me/identities/google解除
    Then 無效登入回401拒絕連結或解除，解除綁定密碼錯誤回400/401並提示「目前密碼不正確」
    And 不依client狀態、Email相同或先前驗證旗標省略本人Access與D1 family檢查
    And 失敗時不寫刪identity、不增加cv、不搬移帳號
  ```

### @error-handling @critical @PF-BDD-033

- [ ] **Scenario: PF-BDD-033 — Google Email 與 identity 所有權衝突不得連結**
  - SPEC 對應: `PF-AC-021`、`PF-AC-022`
  - MVP 追溯: US-016／AC-016-03；US-016／AC-016-04；MVP D-025
  - 涉及元件: LinkExternalIdentity；identity UNIQUE

  ```gherkin
  Scenario: PF-BDD-033 Google Email 與 identity 所有權衝突不得連結
    Given 本人Access與D1 family有效
    When 分別提交verified Email與本人Email不同、(google, sub)已屬他人，或本人google provider已綁定另一sub的credential
    Then Email不同409 EXTERNAL_EMAIL_MISMATCH及「Google Email 必須與目前帳號相同」
    And identity衝突409 EXTERNAL_IDENTITY_IN_USE及「此 Google 登入已被使用，無法連結」
    And 不搬identity/合併Account，不增加cv或撤銷目前family
  ```

### @error-handling @critical @PF-BDD-034

- [ ] **Scenario: PF-BDD-034 — 最後登入方式保護與無密碼引導**
  - SPEC 對應: `PF-AC-022`
  - MVP 追溯: US-016／AC-016-04；MVP D-025
  - 涉及元件: Account policy；DELETE /me/identities/{provider}

  ```gherkin
  Scenario: PF-BDD-034 最後登入方式保護與無密碼引導
    Given Account只有Google且無本地密碼（hasLocalPassword=false）
    When 嘗試DELETE /api/v1/me/identities/google或受信任domain操作企圖刪最後登入方式
    Then API與domain拒絕刪除最後登入方式，投影409 LAST_LOGIN_METHOD及「請先保留至少一種登入方式」，前端引導「請先透過 Email 設定密碼」
    And identity/cv/family不變，確保帳號永遠保留至少一種可用登入方式
  ```

### @error-handling @critical @PF-BDD-035

- [ ] **Scenario: PF-BDD-035 — 平台 Access 必驗 claims、HS256 簽章與 D1 狀態**
  - SPEC 對應: `PF-AC-005`、`PF-AC-006`、`PF-AC-023`
  - MVP 追溯: US-017／AC-017-01、AC-017-03；US-017／AC-017-02、AC-017-04；US-017／AC-017-01；MVP D-019
  - 涉及元件: JWT middleware；session.validate

  ```gherkin
  Scenario: PF-BDD-035 平台 Access 必驗 claims、HS256 簽章與 D1 狀態
    Given /me與/session要求目前唯一有效的平台Access
    When 逐一送缺必要claims、錯iss/aud/typ、none/RS256/錯HS256簽章/時間不符、Google ID/Access Token、opaque Refresh或失效family
    Then 拒絕且不進handler；缺失/到期/無效/撤銷區分ACCESS_TOKEN_MISSING、ACCESS_TOKEN_EXPIRED、ACCESS_TOKEN_INVALID、SESSION_REVOKED
    And 必驗iss/aud/sub/sid/cv/jti/iat/nbf/exp、typ=at+jwt及單一ACCESS_TOKEN_SECRET之HS256簽章，JWT時間偏差最多30秒
    And 每次在D1 primary核sid/Active/cv/期限；舊family因新登入撤銷或cv不符時即使JWT未到期亦回401 SESSION_REVOKED
    And client確認被新登入替代時顯「帳號已在其他裝置登入，請重新登入」，不得refresh該已撤family
  ```

### @error-handling @critical @PF-BDD-036

- [ ] **Scenario: PF-BDD-036 — Web 與行動端兩條傳輸規則及 token 類型邊界**
  - SPEC 對應: `PF-AC-005`、`PF-AC-023`
  - MVP 追溯: US-017／AC-017-01、AC-017-03；US-017／AC-017-01；MVP D-028
  - 涉及元件: Token transport resolver；refresh；logout

  ```gherkin
  Scenario: PF-BDD-036 Web 與行動端兩條傳輸規則及 token 類型邊界
    Given 傳輸解析僅依Origin標頭與clientPlatform兩條規則運作
    When 帶Origin標頭卻指定clientPlatform為ios或android、refresh端點送Access Token、業務API送Refresh Token，或logout同時附帶指向不同family的Access與Refresh
    Then 帶Origin卻非web回400，token類型錯用回401，logout不同family回400且不撤銷任一family
    And clientPlatform=web只讀取平台HttpOnly Cookie（忽略Authorization與body refreshToken），clientPlatform=ios/android且無Origin時只讀取Authorization Bearer與body refreshToken（忽略Cookie）
  ```

### @error-handling @critical @PF-BDD-037

- [ ] **Scenario: PF-BDD-037 — 全部 Web 寫入統一 Origin、CSRF 與 CORS 並暴露 X-DatingHigh-Session**
  - SPEC 對應: `PF-AC-005`、`PF-AC-020`
  - MVP 追溯: US-017／AC-017-01、AC-017-03；US-016／AC-016-02；MVP D-021、D-028
  - 涉及元件: Worker；Web request guard；OPTIONS

  ```gherkin
  Scenario: PF-BDD-037 全部 Web 寫入統一 Origin、CSRF 與 CORS 並暴露 X-DatingHigh-Session
    Given 註冊/登入/Google/refresh/logout/link/unlink/reset均為Web寫入
    When 缺/偽造精確Origin、非application/json或缺X-DatingHigh-Client:web，或跨站GET/表單login_uri寫入
    Then 回403或型別錯誤400且無寫入；credentialed CORS無wildcard
    And 合法OPTIONS僅放行指定來源/方法/header且不要求Access
    And 正式Web同源，兩個__Host Cookie為Secure/HttpOnly/SameSite=Strict/Path=/無Domain；local HTTP用獨立dev Cookie
    And 已登入API回應附X-DatingHigh-Session標頭（目前有效family ID），且CORS設Access-Control-Expose-Headers: X-DatingHigh-Session供Web分頁比對狀態
  ```

### @error-handling @critical @PF-BDD-038

- [ ] **Scenario: PF-BDD-038 — Email code 綁定 flow、purpose 與 generation**
  - SPEC 對應: `PF-AC-004`、`PF-AC-028`、`PF-AC-032`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-018／AC-018-04；US-019／AC-019-02；MVP D-023、D-026
  - 涉及元件: EmailChallenge；account.register-email；account.reset-password

  ```gherkin
  Scenario: PF-BDD-038 Email code 綁定 flow、purpose 與 generation
    Given 合法EmailChallenge存在（purpose僅限register_email或reset_password）
    When 逐一用錯flow/challenge、錯purpose、舊generation、已consumed或locked碼確認
    Then 不建帳/不重設密碼/不核發token，兩種purpose不能互用，提示「驗證碼錯誤或已失效，請重新確認」
    And 明確過期註冊挑戰依契約410及「驗證碼已過期，請重新申請」
    And 不採client已驗證布林/改Email/purpose，D1無明文碼或裸code SHA
  ```

### @error-handling @critical @PF-BDD-039

- [ ] **Scenario: PF-BDD-039 — reset 無效或 cv 改變不能修改密碼**
  - SPEC 對應: `PF-AC-008`、`PF-AC-028`、`PF-AC-030`
  - MVP 追溯: US-019／AC-019-02、AC-019-03；US-018／AC-018-04；US-019／AC-019-02；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: POST /password-resets；account.reset-password

  ```gherkin
  Scenario: PF-BDD-039 reset 無效或 cv 改變不能修改密碼
    Given reset綁固定Account及舊cv
    When 逐一送錯/過期/超次數/重用/錯用途/錯flow/未知虛擬挑戰或cv已改
    Then 無效碼400 INVALID_OR_EXPIRED_CODE及「驗證碼錯誤或已失效，請重新申請」
    And cv衝突409 CREDENTIAL_CHANGED及「帳號安全設定已變更，請重新操作」，不透露存在性
    And 密碼/identity/cv/family不因失敗重設變更
  ```

### @error-handling @critical @PF-BDD-040

- [ ] **Scenario: PF-BDD-040 — sender 10 秒逾時、註冊寄送失敗回 503 與重設密碼通用 202**
  - SPEC 對應: `PF-AC-029`、`PF-AC-031`
  - MVP 追溯: US-018／AC-018-02；US-019／AC-019-01；US-018／AC-018-02、AC-018-04；US-019／AC-019-01、AC-019-02；MVP D-026
  - 涉及元件: sender；RequestRegistrationCode；RequestPasswordReset；resend

  ```gherkin
  Scenario: PF-BDD-040 sender 10 秒逾時、註冊寄送失敗回 503 與重設密碼通用 202
    Given 挑戰已持久化為active並呼叫email.code.send（逾時上限10秒）
    When provider拒絕、丟出例外或逾10秒未完成
    Then Email註冊首次請求與其resend回503 EMAIL_DELIVERY_FAILED及「驗證碼暫時無法寄送，請稍後重試」
    And 挑戰保留，使用者於60秒resend_after冷卻後可重寄產生新generation並使舊碼立即作廢，不盲重送舊碼或回傳raw code
    And 忘記密碼首次請求與其resend遇sender失敗仍回同形通用202並記錄內部錯誤log，不向client暴露寄信失敗差異
    And email.code.send僅接受有效挑戰固定收件人/用途與固定註冊或重設範本，不接受client任意from/to/HTML/subject，信中不含密碼或平台token
  ```

### @error-handling @critical @PF-BDD-041

- [ ] **Scenario: PF-BDD-041 — 依賴或限流故障 fail closed**
  - SPEC 對應: `PF-AC-013`、`PF-AC-015`、`PF-AC-017`、`PF-AC-024`
  - MVP 追溯: US-015／AC-015-01；US-015／AC-015-01、AC-015-02；MVP D-012、D-015；US-018／AC-018-04；US-017／AC-017-02
  - 涉及元件: Platform client；IRateLimiter；ProblemDetails

  ```gherkin
  Scenario: PF-BDD-041 依賴或限流故障 fail closed
    Given 限流額度或原子業務結果尚未確認
    When D1/R2/bridge逾時故障或限流寫入不明
    Then 503 DEPENDENCY_UNAVAILABLE，不回Allowed/假登入/假投遞/空成功
    And 限流拒絕或不明時不得呼叫sender、密碼/碼驗證、Google validator或Refresh輪替
    And 顯示「服務暫時無法使用，請稍後再試」及trace ID，結果不明寫入不自動重送
  ```

### @error-handling @critical @PF-BDD-042

- [ ] **Scenario: PF-BDD-042 — 公網 command、SQL 與身分 header 偽造被拒絕**
  - SPEC 對應: `PF-AC-013`、`PF-AC-016`
  - MVP 追溯: US-015／AC-015-01；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）
  - 涉及元件: PublicRouter；PlatformCommandDispatcher

  ```gherkin
  Scenario: PF-BDD-042 公網 command、SQL 與身分 header 偽造被拒絕
    Given .NET只經platform.internal固定outbound handler存取bindings
    When 公網呼叫/internal/*或commands/SQL，或送X-DatingHigh-Internal-*身分標頭
    Then 公開路由拒絕無副作用；Worker先清外部信任標頭再建立可信context
    And 內部dispatcher也拒絕未知command、額外權限欄位、任意SQL/table/bucket
    And 固定prepared SQL只於可信handler，容器無獨立公開入口，client無D1/R2管理權
  ```

### @error-handling @critical @PF-BDD-043

- [ ] **Scenario: PF-BDD-043 — 跨 owner 及 path traversal 預設拒絕**
  - SPEC 對應: `PF-AC-009`、`PF-AC-014`
  - MVP 追溯: MVP身分與資料歸屬；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅權限基礎）；US-015／AC-015-02
  - 涉及元件: IResourceAccessPolicy；private adapter；/me

  ```gherkin
  Scenario: PF-BDD-043 跨 owner 及 path traversal 預設拒絕
    Given A/B有效且私人object屬B
    When A覆寫/me owner、要求B object、送../或絕對路徑/任意key，或存取未知資源種類
    Then /me owner覆寫400；其餘拒絕，不讀改刪B資料
    And owner只由可信CurrentUser取得，未提供參與者實作預設拒絕
    And 不以所有登入者皆可stub替代後續MatchSession授權
  ```

### @error-handling @critical @PF-BDD-044

- [ ] **Scenario: PF-BDD-044 — 公開輸出不洩秘密與私人資訊**
  - SPEC 對應: `PF-AC-016`、`PF-AC-019`、`PF-AC-031`
  - MVP 追溯: US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）；US-016／AC-016-01；US-018／AC-018-02、AC-018-04；US-019／AC-019-01、AC-019-02
  - 涉及元件: DTO；logging；Expo bundle；sender

  ```gherkin
  Scenario: PF-BDD-044 公開輸出不洩秘密與私人資訊
    Given 已完成Email/Google/Refresh/private及錯誤流程
    When 檢查DTO/JWT/Web JSON/URL/bundle/analytics/一般log/雲端telemetry
    Then 無password_hash、code/MAC、flow hash、Google credential、raw Cookie/Bearer、Cloudflare secret或ACCESS_TOKEN_SECRET/EMAIL_CODE_HMAC_KEY/RATE_LIMIT_HMAC_KEY
    And Email只給本人授權範圍，不給配對對方，Google姓名/真實頭像不公開為化身
    And raw code唯一例外為明確local LocalEmailVerification，不流前端/一般記錄/雲端telemetry
  ```

---

## 🔲 Boundary Conditions — 邊界條件

### @boundary @edge-case @critical @PF-BDD-045

- [ ] **Scenario: PF-BDD-045 — 六位碼、十分鐘及絕對三十分鐘期限邊界**
  - SPEC 對應: `PF-AC-028`
  - MVP 追溯: US-018／AC-018-04；US-019／AC-019-02
  - 涉及元件: EmailChallenge；server clock

  ```gherkin
  Scenario: PF-BDD-045 六位碼、十分鐘及絕對三十分鐘期限邊界
    Given 碼可為000001，有效十分鐘且challenge絕對三十分鐘
    When 在各expiresAt前一毫秒、等於expiresAt及absoluteExpiresAt確認/重寄
    Then 保留前導零；只state=active且未到碼期限及絕對期限可用，等於期限拒絕
    And 重寄expiresAt不跨絕對三十分鐘，碼由.NET以單一EMAIL_CODE_HMAC_KEY綁challenge/purpose/Email/generation計算HMAC並constant-time比對
  ```

### @boundary @edge-case @critical @PF-BDD-046

- [ ] **Scenario: PF-BDD-046 — 六十秒 resend 邊界及併發 generation CAS**
  - SPEC 對應: `PF-AC-028`、`PF-AC-031`
  - MVP 追溯: US-018／AC-018-04；US-019／AC-019-02；US-018／AC-018-02、AC-018-04；US-019／AC-019-01、AC-019-02；MVP D-026
  - 涉及元件: email.challenge.resend；sender

  ```gherkin
  Scenario: PF-BDD-046 六十秒 resend 邊界及併發 generation CAS
    Given generation0已四次驗錯且resendAfter=T+60秒
    When 冷卻前重寄，再於精確邊界併發重寄
    Then 冷卻前429附Retry-After，邊界後依state='active'與預期generation條件最多一次重寄CAS成功
    And 新generation立即更新code_mac並使舊碼失效，failed_attempts仍為四次、絕對三十分鐘期限不變
  ```

### @boundary @edge-case @critical @PF-BDD-047

- [ ] **Scenario: PF-BDD-047 — 五次錯碼原子鎖定抗併發**
  - SPEC 對應: `PF-AC-028`
  - MVP 追溯: US-018／AC-018-04；US-019／AC-019-02
  - 涉及元件: email.challenge.fail-attempt

  ```gherkin
  Scenario: PF-BDD-047 五次錯碼原子鎖定抗併發
    Given 同challenge已有四次錯碼且共用額度足夠
    When 多請求同送錯碼，再送正確碼或重寄
    Then failed_attempts原子累加至最多五並鎖定，不因回錯誤而回滾
    And 正確碼不得繞過已提交鎖定，重寄不清次數，提示「驗證次數已達上限，請重新申請驗證碼」
    And 不產生Account或密碼副作用
  ```

### @boundary @edge-case @critical @PF-BDD-048

- [ ] **Scenario: PF-BDD-048 — Email/Google 同址與同 subject 併發建帳只建一次與同批回滾**
  - SPEC 對應: `PF-AC-004`、`PF-AC-021`、`PF-AC-027`、`PF-AC-032`
  - MVP 追溯: US-018／AC-018-01、AC-018-03；US-016／AC-016-03；US-018／AC-018-03；MVP D-022、D-023
  - 涉及元件: account.register-email；account.register-external；D1 UNIQUE

  ```gherkin
  Scenario: PF-BDD-048 Email/Google 同址與同 subject 併發建帳只建一次與同批回滾
    Given 多筆有效register_email挑戰指相同正規化Email，或多個首次Google登入提交相同正規化Email或相同(google, sub)
    When 在真D1並行執行account.register-email或account.register-external，並對batch內步驟注入SQL失敗或前置條件不符
    Then 最多一份Account及相符identity/family成功建立，另一方因D1自然UNIQUE衝突整批回滾並回409 EMAIL_ALREADY_REGISTERED或EXTERNAL_IDENTITY_IN_USE
    And account.register-email同一D1 batch所有INSERT共用挑戰仍為active且generation/code_mac相符之前置條件，並將條件消耗挑戰放在最後一句；前置條件不符時全批零列寫入，SQL錯誤或UNIQUE衝突時整批原子回滾，無孤立identity/family/token或已消耗未建帳的挑戰
  ```

### @boundary @edge-case @critical @PF-BDD-049

- [ ] **Scenario: PF-BDD-049 — 同重設碼併發只改一次及同批次原子回滾**
  - SPEC 對應: `PF-AC-008`、`PF-AC-028`、`PF-AC-030`
  - MVP 追溯: US-019／AC-019-02、AC-019-03；US-018／AC-018-04；US-019／AC-019-02；US-019／AC-019-01、AC-019-02、AC-019-03；MVP D-022
  - 涉及元件: account.reset-password

  ```gherkin
  Scenario: PF-BDD-049 同重設碼併發只改一次及同批次原子回滾
    Given reset挑戰state=active尚未消耗並綁目前bound_credential_version
    When 兩個正確碼確認並行提交不同新密碼，或batch內SQL失敗/Account條件不符
    Then 同一D1 batch先依挑戰仍為active且bound_credential_version相符之條件更新auth_accounts(password_hash, credential_version = credential_version + 1)，最後一句條件消耗挑戰；並行提交最多成功一次，只有該次密碼及新增cv生效
    And 另一方因挑戰已consumed或Account credential_version已增加而更新零列並回400 INVALID_OR_EXPIRED_CODE或409 CREDENTIAL_CHANGED，不覆寫成功密碼
    And 若Account未更新或SQL錯誤，挑戰不變為consumed，密碼與挑戰保持原子一致
  ```

### @boundary @edge-case @critical @PF-BDD-050

- [ ] **Scenario: PF-BDD-050 — 敏感寫入最後 SQL 重驗授權與 credential_version**
  - SPEC 對應: `PF-AC-007`、`PF-AC-022`
  - MVP 追溯: US-017／AC-017-04；US-016／AC-016-04；MVP D-022、D-025
  - 涉及元件: account.change-password；identity.external.link；identity.external.unlink

  ```gherkin
  Scenario: PF-BDD-050 敏感寫入最後 SQL 重驗授權與 credential_version
    Given API已驗Access及必要密碼但尚未完成D1寫入
    When logout/disabled/其他密碼變更/credential_version改變/Access或family到期先於最後SQL
    Then 最後SQL之有效family、Account status='active'與credential_version條件不成立而更新零列，不寫入password_hash或變更identity
    And 零列時重讀區分並回401 SESSION_REVOKED或409 CREDENTIAL_CHANGED
    And 兩Account並行搶綁同一(google, sub)時由UNIQUE(provider, subject)保證最多一筆成功，衝突者回409 EXTERNAL_IDENTITY_IN_USE；解除綁定與cv遞增在同一D1 batch內共用相同前置條件，保持原子一致
  ```

### @boundary @edge-case @critical @PF-BDD-051

- [ ] **Scenario: PF-BDD-051 — Refresh 30 秒寬限窗重試、並行落敗 409 與逾時重放撤銷 family**
  - SPEC 對應: `PF-AC-024`、`PF-AC-026`
  - MVP 追溯: US-017／AC-017-02；US-017／AC-017-03、AC-017-04；US-016／AC-016-02；MVP D-020
  - 涉及元件: session.refresh；session.revoke

  ```gherkin
  Scenario: PF-BDD-051 Refresh 30 秒寬限窗重試、並行落敗 409 與逾時重放撤銷 family
    Given family Refresh在真D1以UNIQUE(session_id, generation)線性化輪替
    When 分別測試：① token於consumed_at起30秒內且為緊接前一代（generation = current_generation - 1）重送、② 兩請求並行刷新同代token或30秒內提交非緊接前一代之已消耗token、③ 超過consumed_at 30秒後重放已消耗token
    Then ① 視為網路回應遺失重試，從目前head再原子輪替一次並回200與新token pair，不撤銷family
    And ② 並行落敗方或不符緊接前一代之30秒內重試回409 REFRESH_RETRY，不撤銷family，client改用最新儲存的Refresh或Cookie重試一次即可恢復
    And ③ 超過30秒寬限窗重放回401 REFRESH_TOKEN_REUSE並持久撤銷整個family（revocation_reason='refresh_reuse'），使該family所有Access與Refresh失效；未知隨機token回401 REFRESH_TOKEN_INVALID且不撤銷任何可用family
  ```

### @boundary @edge-case @critical @PF-BDD-052

- [ ] **Scenario: PF-BDD-052 — Refresh 每步 SQL 失敗或 UNIQUE 衝突回滾與零列不核發**
  - SPEC 對應: `PF-AC-007`、`PF-AC-024`
  - MVP 追溯: US-017／AC-017-04；US-017／AC-017-02；MVP D-020、D-022
  - 涉及元件: session.refresh

  ```gherkin
  Scenario: PF-BDD-052 Refresh 每步 SQL 失敗或 UNIQUE 衝突回滾與零列不核發
    Given 已驗Refresh歸屬
    When 分別在auth_sessions條件更新、後繼Refresh插入（UNIQUE(session_id, generation)）或前token標記consumed注入SQL失敗/衝突，或前置條件更新零列
    Then SQL失敗或UNIQUE衝突時整batch原子回滾且不回新pair，不留半套後繼或消耗前token
    And 前置條件零列時不無條件簽發；重讀判斷屬30秒寬限重試、409 REFRESH_RETRY、逾30秒REFRESH_TOKEN_REUSE，或REFRESH_TOKEN_EXPIRED/INVALID/SESSION_REVOKED
    And 不以batch無exception單獨宣稱成功，必須核對受影響列數
  ```

### @boundary @edge-case @critical @PF-BDD-053

- [ ] **Scenario: PF-BDD-053 — family 三十日及 idle 七日嚴格邊界**
  - SPEC 對應: `PF-AC-006`、`PF-AC-023`
  - MVP 追溯: US-017／AC-017-02、AC-017-04；US-017／AC-017-01
  - 涉及元件: AuthSession；session.validate/refresh

  ```gherkin
  Scenario: PF-BDD-053 family 三十日及 idle 七日嚴格邊界
    Given family建立T，absolute=T+30日，idle至多T+7日
    When 在idle/absolute前後及相等時間驗Access/refresh並頻繁一般API
    Then 只期限前允許，相等即失效，不套JWT三十秒容差延長family
    And 一般API不延idle，成功refresh至多延至absolute，新Access exp不超目前期限
  ```

### @boundary @edge-case @critical @PF-BDD-054

- [ ] **Scenario: PF-BDD-054 — logout、refresh 與替代登入競態不影響最新 family**
  - SPEC 對應: `PF-AC-007`、`PF-AC-024`、`PF-AC-026`
  - MVP 追溯: US-017／AC-017-04；US-017／AC-017-02；US-017／AC-017-03、AC-017-04；US-016／AC-016-02
  - 涉及元件: session.refresh；session.revoke

  ```gherkin
  Scenario: PF-BDD-054 logout、refresh 與替代登入競態不影響最新 family
    Given Account目前只有family A有效，A的refresh/logout與另一裝置新登入B交錯
    When 依不同commit順序執行，含A refresh回應晚於A撤銷或B登入提交
    Then A撤銷提交後A新舊Access/Refresh皆拒絕，晚到回應不能復活A
    And 若B成功登入，A必已撤銷且B為唯一有效family；A後續或晚到的logout/refresh只作用A，不撤B或建立可繞過B的後繼
    And 若B登入失敗則不因此撤A，A是否可用仍依A自己的logout/期限判定
    And 重啟不復活已撤A，其他Account的family不受影響
  ```

### @boundary @edge-case @critical @PF-BDD-055

- [ ] **Scenario: PF-BDD-055 — 新登入提交順序、憑證變更與失敗回滾競態**
  - SPEC 對應: `PF-AC-007`
  - MVP 追溯: US-017／AC-017-04；MVP D-021、D-022
  - 涉及元件: session.create；account.change-password

  ```gherkin
  Scenario: PF-BDD-055 新登入提交順序、憑證變更與失敗回滾競態
    Given Account目前只有原family有效，帳密/Google驗證完成但session.create尚未提交
    When Email與Google新登入並行，或與改密碼/reset/logout交錯，並注入新family或generation0 Refresh寫入失敗
    Then session.create在同一D1 batch內先將同Account所有revoked_at IS NULL舊列標記為replaced_by_login，再依Account status='active'與credential_version=@cv條件建立新family（受partial UNIQUE idx_auth_sessions_active_account保護）與generation0 Refresh，不寫入auth_accounts、不增加credential_version
    And 依成功commit順序最後成功者唯一有效，不同時保留兩個未撤銷family；若新family或Refresh寫入引發SQL錯誤/UNIQUE衝突則整批回滾，原有效family保留
    And 若credential_version已先變更，舊cv建新family因條件不符而零列且不核發pair；先建舊cv family後才變cv亦立即因cv不符失效
    And account.rehash以WHERE password_hash=@expectedOldHash AND credential_version=@cv保護等價rehash不覆寫競態新密碼
    And timeout/結果未知不自動重放已可能commit的新登入，成功commit後HTTP遺失亦不回滾已撤舊family
  ```

### @boundary @edge-case @critical @PF-BDD-056

- [ ] **Scenario: PF-BDD-056 — 九筆認證限流政策的可信對象與額度**
  - SPEC 對應: `PF-AC-017`、`PF-AC-036`
  - MVP 追溯: MVP D-012、D-015、D-025、D-027；US-018／AC-018-04
  - 涉及元件: RateLimitPolicies；IRateLimiter

  ```gherkin
  Scenario: PF-BDD-056 九筆認證限流政策的可信對象與額度
    Given 靜態常數表RateLimitPolicies定義SPEC六個policy_key、九筆subject額度規則
    When 各自使用最後可用額度與下一次嘗試
    Then email_code_send.v1為email 5/小時、ip 30/小時；email_code_verify.v1為email 10/15分鐘
    And password_login.v1為email 10/15分鐘、ip 60/15分鐘；external_credential.v1（含Google登入與連結）為ip 30/15分鐘
    And credential_change.v1（含修改密碼與解除外部綁定）為account 10/15分鐘；session_refresh.v1為session 10/分鐘、ip 120/分鐘；下一次均回429 RATE_LIMITED
    And 每次HTTP嘗試計數失敗不退；refresh先計IP，若token為超過30秒寬限之已消耗重放則直接撤銷family不受session輪替額度阻擋，正常未消耗或30秒寬限重試才計session額度
  ```

### @boundary @edge-case @critical @PF-BDD-057

- [ ] **Scenario: PF-BDD-057 — 跨用途寄碼五次第六不得 send**
  - SPEC 對應: `PF-AC-017`、`PF-AC-028`、`PF-AC-036`
  - MVP 追溯: MVP D-012、D-015；US-018／AC-018-04；US-019／AC-019-02；MVP D-015
  - 涉及元件: email_code_send.v1；IEmailCodeSender

  ```gherkin
  Scenario: PF-BDD-057 跨用途寄碼五次第六不得 send
    Given 同小時同Email剩五次額度、多container及不同挑戰
    When 混合Email註冊請求、忘記密碼請求、兩者resend及Email大小寫變體併發六次以上
    Then 全入口最多五次取Email額度並呼叫sender，第六起429且不呼叫sender
    And IP跨Email累計，多限制取最晚expiresAt之Retry-After且至少一秒
    And rejected的已提交計數不因429回滾，限流先於寄信或昂貴驗證
  ```

### @boundary @edge-case @critical @PF-BDD-058

- [ ] **Scenario: PF-BDD-058 — 單一 RATE_LIMIT_HMAC_KEY、.NET 統一計算 subject_hash 與跨容器一致 bucket**
  - SPEC 對應: `PF-AC-017`、`PF-AC-036`
  - MVP 追溯: MVP D-012、D-015、D-027；US-018／AC-018-04
  - 涉及元件: RateLimit subject hasher；Worker context

  ```gherkin
  Scenario: PF-BDD-058 單一 RATE_LIMIT_HMAC_KEY、.NET 統一計算 subject_hash 與跨容器一致 bucket
    Given 共享單一環境秘密RATE_LIMIT_HMAC_KEY與server UTC時鐘
    When 同Email/正規化IP/Account/原family跨container及restart取額度
    Then Worker將可信連線IP正規化（含IPv6與IPv4-mapped正規化）後以內部標頭X-DatingHigh-Internal-Client-Ip傳給.NET，subject_hash統一由.NET計算lowercaseHex(HMAC-SHA256(RATE_LIMIT_HMAC_KEY, UTF8("v1|" + APP_ENV + "|" + subject_type + "|" + canonical_subject)))，D1不存raw Email或raw IP
    And UNIQUE(policy_key, subject_type, subject_hash, window_start_ms)使併發UPSERT只建一筆bucket並保留原bucket_id
    And IP僅信Worker內部標頭；resend/verify經flow驗證取challenge Email；Account/session不採client自報ID
    And 環境/type/policy分隔，跨容器重啟一致；秘密輪替時直接更換RATE_LIMIT_HMAC_KEY並接受現有視窗額度重置
  ```

### @boundary @edge-case @critical @PF-BDD-059

- [ ] **Scenario: PF-BDD-059 — 靜態 RateLimitPolicies 常數表與拒絕未知 policy 或不允許的 subject_type**
  - SPEC 對應: `PF-AC-036`
  - MVP 追溯: MVP D-015、D-027
  - 涉及元件: IRateLimiter；RateLimitPolicies；rate-limit.consume

  ```gherkin
  Scenario: PF-BDD-059 靜態 RateLimitPolicies 常數表與拒絕未知 policy 或不允許的 subject_type
    Given 靜態常數表RateLimitPolicies定義本份六個認證policy_key及其允許的subject_type、windowMs與limit
    When 受信任入口呼叫IRateLimiter與rate-limit.consume，或送未知policy_key、不屬該政策的subject_type、client自訂windowMs/limit/bucketId
    Then 合法政策跨入口共用原子計數與去重descriptor，未知policy_key、不允許的subject_type或自訂額度參數一律拒絕且不寫入D1
    And 任一bucket超限即停止後續業務動作，保留已消耗計數並回最晚Retry-After
  ```

### @boundary @edge-case @normal @PF-BDD-060

- [ ] **Scenario: PF-BDD-060 — 固定窗、飽和計數與 cleanup 邊界**
  - SPEC 對應: `PF-AC-017`、`PF-AC-036`
  - MVP 追溯: MVP D-012、D-015；US-018／AC-018-04；MVP D-015
  - 涉及元件: common_rate_limit_buckets；cleanup

  ```gherkin
  Scenario: PF-BDD-060 固定窗、飽和計數與 cleanup 邊界
    Given 目前固定窗已超限且舊bucket未清
    When 持續大量嘗試，於下一window_start邊界再次提交並cleanup
    Then count最多limit+1，Retry-After=ceil((expiresAt-nowMs)/1000)且至少一秒
    And 新窗floor(nowMs/windowMs)*windowMs另計，無須等cleanup，不宣稱滑動小時保證
    And 每小時受控每批至多1000筆只刪過期bucket
    And Worker scheduled handler不依賴休眠container timer，經固定cleanup command在執行預算內分多批清逾1000筆backlog，記錄backlog/重試且每批有界
  ```

### @boundary @edge-case @critical @PF-BDD-061

- [ ] **Scenario: PF-BDD-061 — 六表首欄 UUIDv7 與自然唯一鍵**
  - SPEC 對應: `PF-AC-033`、`PF-AC-037`
  - MVP 追溯: MVP D-010；MVP D-016、D-010、D-024
  - 涉及元件: migration；ID factory；command validation

  ```gherkin
  Scenario: PF-BDD-061 六表首欄 UUIDv7 與自然唯一鍵
    Given 六張自有表及工具內部migration history分開
    When 檢查順序/主鍵並對command送NULL、非標準格式、非小寫或非v7 ID
    Then 第一欄account_id/identity_id/session_id/token_id/challenge_id/bucket_id皆NOT NULL單欄UUIDv7 TEXT
    And server產生小寫36字元D格式，API/外鍵一致，client不能指定，非法ID拒絕
    And 保留email_normalized、(provider, subject)、(account_id, provider)、token_hash、(session_id, generation)、flow_token_hash及(policy_key, subject_type, subject_hash, window_start_ms)自然UNIQUE
    And 不承諾同毫秒跨容器/時鐘回調嚴格遞增，flow/Refresh/SDK nonce不以GUID代替
    And auth_sessions另以UNIQUE(account_id) WHERE revoked_at IS NULL的partial index保護同Account至多一筆未撤銷family，歷史已撤銷列可保留
    And partial unique涵蓋所有revoked_at=NULL歷史列，即使expired/cv已舊亦占唯一槽；新登入需同batch先撤此類列，不能靠期限predicate或多個NULL列繞過
  ```

### @boundary @edge-case @critical @PF-BDD-062

- [ ] **Scenario: PF-BDD-062 — 六表五十四欄與功能前綴同步映射**
  - SPEC 對應: `PF-AC-035`、`PF-AC-037`
  - MVP 追溯: MVP D-013、D-014、D-019～D-027；US-016／AC-016-02；MVP D-016、D-010
  - 涉及元件: D1 migration；fixed SQL；wrapper views

  ```gherkin
  Scenario: PF-BDD-062 六表五十四欄與功能前綴同步映射
    Given 本份第一migration未落地
    When 檢查schema/command/索引/外鍵/view alias
    Then 六表為auth_accounts(8欄)/auth_external_identities(5欄)/auth_sessions(10欄)/auth_refresh_tokens(8欄)/auth_email_challenges(16欄)/common_rate_limit_buckets(7欄)，合計54欄
    And 索引idx_完整表名_用途、外鍵完整表名，accounts/sessions固定映射auth_，不拼接alias
    And 無auth_challenges/store/API、platform_metadata/view、Identity/EF或其餘七SPEC業務表
    And 後續同目的同前綴、共用common_，已有資料用向前migration不清空升級
    And 固定SQL與migration同步保留auth_sessions(account_id) WHERE revoked_at IS NULL的unique partial index
  ```

### @boundary @edge-case @critical @PF-BDD-063

- [ ] **Scenario: PF-BDD-063 — cwd、停止與重建容器不影響磁碟持久資料**
  - SPEC 對應: `PF-AC-006`、`PF-AC-010`、`PF-AC-014`、`PF-AC-026`
  - MVP 追溯: US-017／AC-017-02、AC-017-04；US-014／AC-014-01、AC-014-02；US-015／AC-015-02；US-017／AC-017-03、AC-017-04；US-016／AC-016-02
  - 涉及元件: local wrappers；Wrangler；D1/R2

  ```gherkin
  Scenario: PF-BDD-063 cwd、停止與重建容器不影響磁碟持久資料
    Given default狀態在datinghigh/cloudflare/.wrangler/state，已存Account、有效family、EmailChallenge及probe
    When 從不同cwd啟動、停止、重啟、重建container
    Then wrappers解析同一絕對cwd/config/state，不產生第二套空DB
    And Account/有效family/EmailChallenge/probe仍在，撤銷family仍拒絕
    And .NET經真handler讀_system/foundation/probe.txt之UTF-8 datinghigh-foundation-v1且SHA-256正確
    And D1為權威，不以DO SQLite、container暫存或另一可寫SQLite替代
  ```

### @boundary @edge-case @critical @PF-BDD-064

- [ ] **Scenario: PF-BDD-064 — 本地 migrate、seed、固定 view 與明確修改隔離**
  - SPEC 對應: `PF-AC-011`、`PF-AC-016`、`PF-AC-037`
  - MVP 追溯: US-014／AC-014-01、AC-014-02；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）；MVP D-016、D-010
  - 涉及元件: db:migrate:local；seed/query/execute wrappers

  ```gherkin
  Scenario: PF-BDD-064 本地 migrate、seed、固定 view 與明確修改隔離
    Given wrappers固定--local、已知instance/config及同D1 binding
    When 重跑migration/seed，查accounts/sessions，再--file明改本地帳號status
    Then 原帳號不重建，view只回非秘密JSON，應用讀到狀態變更
    And accounts含ID/測試Email/驗證時間/status/版本，sessions含family/account/generation/期限/撤銷，不回hash/MAC/flow/subject
    And query拒絕任意SQL/多句/未知view/metadata/config/remote/production，execute僅檔案/stdin/工具參數不拼shell
    And cloud不變，seed無cloud固定公開密碼，LAN不開放管理介面；watch bridge亦只loopback/local秘密並連同一資料
  ```

### @boundary @edge-case @critical @PF-BDD-065

- [ ] **Scenario: PF-BDD-065 — 備份不覆寫與新 instance 還原**
  - SPEC 對應: `PF-AC-012`
  - MVP 追溯: US-014／AC-014-02
  - 涉及元件: db:backup:local；db:restore:local

  ```gherkin
  Scenario: PF-BDD-065 備份不覆寫與新 instance 還原
    Given default有持久資料與外鍵/唯一約束
    When 暫停本地寫入後備份安全名稱，再還原至全新[a-z0-9-]{1,32}名稱
    Then 同cwd/config執行wrangler d1 export --local至.local/backups再恢復寫入，不只複製活躍WAL
    And 既有備份/既有target/不安全名/path traversal/config/remote拒絕，保留原instance
    And 新config在.local/instances/{target}、預設state匯入，schema/資料/約束一致，各wrapper同--instance切換
    And CLI/DB Browser只操作備份副本，不改運作emulator WAL且不選正式資源
  ```

### @boundary @edge-case @critical @PF-BDD-066

- [ ] **Scenario: PF-BDD-066 — 環境 preflight、ready 故障與 API/SPA 路由**
  - SPEC 對應: `PF-AC-013`、`PF-AC-015`、`PF-AC-029`
  - MVP 追溯: US-015／AC-015-01；US-015／AC-015-01、AC-015-02；US-018／AC-018-02；US-019／AC-019-01
  - 涉及元件: deploy；/health/live；/health/ready；PublicRouter

  ```gherkin
  Scenario: PF-BDD-066 環境 preflight、ready 故障與 API/SPA 路由
    Given local/staging/production分離D1/R2/origin/秘密/build
    When preflight核account/D1 ID/R2 binding，逐一錯執行設定/缺migration或schema/index/probe錯digest/缺keys/server Log或EMAIL/domain
    Then 阻止錯目標發布或ready503 unavailable及traceId，不讀寫metadata表
    And live只表程序，ready不每次寄信不曝DB/bucket/SQL/Email/路徑/secret
    And /api/*、/health/*、/internal/*先處理，未知API為JSON404，合法前端深路由才SPA
    And server缺HTTPS origin、啟local bridge或開發繞過亦拒啟動/就緒
  ```

### @boundary @edge-case @critical @PF-BDD-067

- [ ] **Scenario: PF-BDD-067 — 單一對稱秘密重啟持久、輪替語意與資料保留清理**
  - SPEC 對應: `PF-AC-006`、`PF-AC-026`、`PF-AC-028`
  - MVP 追溯: US-017／AC-017-02、AC-017-04；US-017／AC-017-03、AC-017-04；US-016／AC-016-02；US-018／AC-018-04；US-019／AC-019-02；MVP D-019、D-026、D-027
  - 涉及元件: ACCESS_TOKEN_SECRET；EMAIL_CODE_HMAC_KEY；RATE_LIMIT_HMAC_KEY；cleanup

  ```gherkin
  Scenario: PF-BDD-067 單一對稱秘密重啟持久、輪替語意與資料保留清理
    Given 有未過期HS256 Access、EmailChallenge及consumed Refresh lineage
    When container重啟、更換環境秘密並按固定clock執行cleanup
    Then 容器重啟不隨機重造秘密，未過期Access、Session與EmailChallenge在同秘密下持續有效
    And 更換ACCESS_TOKEN_SECRET使既有Access立即失效並由有效Refresh換發新Access；更換EMAIL_CODE_HMAC_KEY使未完成挑戰作廢須重請驗證碼；更換RATE_LIMIT_HMAC_KEY重置進行中視窗額度
    And EmailChallenge絕對到期24小時內移除
    And Refresh lineage/family保留至absolute後七日，按self-reference/records/family每批至多1000筆清，不含不存在第三方挑戰
    And cleanup由Worker scheduled handler驅動，container睡眠仍可執行；大量backlog於預算內分批與可重試，不刪未到期/未到保留期資料
  ```

---

## 🖥️ Frontend UX — 前端畫面

### @critical @frontend @happy-path @PF-BDD-068

- [ ] **Scenario: PF-BDD-068 — 開始畫面採原型視覺及可信 session 入口**
  - SPEC 對應: `PF-AC-002`、`PF-AC-003`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-013／AC-013-02
  - 涉及元件: /；SceneBackground；GlassPanel

  ```gherkin
  Scenario: PF-BDD-068 開始畫面採原型視覺及可信 session 入口
    Given 三平台首次開啟且無可恢復有效登入
    When 開始畫面載入
    Then 顯示「使用 Email 註冊」、「使用 Email 登入」及合品牌Google按鈕
    And 採rose #ff7aa2、roseDeep #ff4f86、gold #ffd27a、ink #2a1730、plum #3a1a48、場景背景及半透明卡片
    And 有效session恢復後才進本人帳號，不依本機布林、固定夏樹或虛構配對頁宣稱其他SPEC完成
  ```

### @critical @frontend @boundary @PF-BDD-069

- [ ] **Scenario: PF-BDD-069 — 小螢幕、鍵盤、focus 與可存取性**
  - SPEC 對應: `PF-AC-001`、`PF-AC-002`
  - MVP 追溯: US-013／AC-013-01；US-013／AC-013-01、AC-013-02
  - 涉及元件: 全部帳號路由；FormField；PrimaryButton

  ```gherkin
  Scenario: PF-BDD-069 小螢幕、鍵盤、focus 與可存取性
    Given Web大/小視窗及Android/iOS小螢幕、安全區、軟鍵盤
    When 逐頁操作開始/註冊/驗碼/登入/復原/帳號/連結
    Then 單欄可捲且提交/返回可達，不採700px最小高度裁切，大螢幕置中
    And Web鍵盤順序可操作、有可見focus、欄位accessibility label、錯誤不只顏色
    And 尊重減少動態偏好，無需動畫才能理解成功/失敗
  ```

### @critical @frontend @happy-path @PF-BDD-070

- [ ] **Scenario: PF-BDD-070 — 註冊請碼、已註冊 Email 與寄送失敗 503 提示**
  - SPEC 對應: `PF-AC-002`、`PF-AC-004`、`PF-AC-027`、`PF-AC-029`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-018／AC-018-01、AC-018-02、AC-018-03；MVP D-026
  - 涉及元件: /register；FormField；InlineNotice

  ```gherkin
  Scenario: PF-BDD-070 註冊請碼、已註冊 Email 與寄送失敗 503 提示
    Given 使用者輸入Email
    When 提交合法未註冊地址收到202、收到409 EMAIL_ALREADY_REGISTERED，或sender失敗收到503 EMAIL_DELIVERY_FAILED
    Then 202後轉/verify-email並顯示「驗證碼已寄出，請查看信箱」
    And 503 EMAIL_DELIVERY_FAILED顯示「驗證碼暫時無法寄送，請稍後重試」，使用者可於冷卻後重寄新generation驗證碼
    And 重複地址顯示「此 Email 已註冊，請先使用原有方式登入，再連結 Google」及「前往登入」
    And 格式錯「請輸入有效的 Email」，不進已登入帳號
  ```

### @critical @frontend @happy-path @PF-BDD-071

- [ ] **Scenario: PF-BDD-071 — Email 驗碼頁與確認密碼**
  - SPEC 對應: `PF-AC-002`、`PF-AC-004`、`PF-AC-028`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-018／AC-018-01、AC-018-03；US-018／AC-018-04；US-019／AC-019-02
  - 涉及元件: /verify-email；FormField

  ```gherkin
  Scenario: PF-BDD-071 Email 驗碼頁與確認密碼
    Given 有效register_email metadata
    When 頁面載入並輸入正確六位碼及相同合法密碼/確認
    Then 顯示遮罩Email、有效期、server重寄倒數、兩個密碼欄，000001保留前導零
    And 確認密碼只client比對不重複送API
    And POST /accounts 201後才「Email 驗證完成」並進本人帳號、移除flow metadata
  ```

### @critical @frontend @error-handling @PF-BDD-072

- [ ] **Scenario: PF-BDD-072 — 驗碼與表單錯誤給可修正明確文案**
  - SPEC 對應: `PF-AC-002`、`PF-AC-028`、`PF-AC-030`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-018／AC-018-04；US-019／AC-019-02；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: /verify-email；/reset-password；InlineNotice

  ```gherkin
  Scenario: PF-BDD-072 驗碼與表單錯誤給可修正明確文案
    Given 使用者仍在註冊/重設流程
    When 密碼確認不符、錯碼、過期或鎖定
    Then 各顯示「兩次密碼輸入不一致」、「驗證碼錯誤或已失效，請重新確認」、「驗證碼已過期，請重新申請」、「驗證次數已達上限，請重新申請驗證碼」
    And 不進成功頁不宣稱已改密碼，reset不揭露Email存在性
    And 安全可保留的流程/欄位可修正，code/密碼不記分析/錄影/持久草稿
  ```

### @critical @frontend @alternative-path @PF-BDD-074

- [ ] **Scenario: PF-BDD-074 — 登入成功、首次 Google 直接建帳、通用錯誤與 Google SDK 取消**
  - SPEC 對應: `PF-AC-002`、`PF-AC-019`、`PF-AC-020`、`PF-AC-021`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-016／AC-016-01、AC-016-02、AC-016-03；MVP D-023
  - 涉及元件: /login；GIS popup；native SDK

  ```gherkin
  Scenario: PF-BDD-074 登入成功、首次 Google 直接建帳、通用錯誤與 Google SDK 取消
    Given 登入頁可選Email密碼、Google及「忘記密碼」
    When Email登入201、既有Google登入200、首次Google登入直接建帳201，或遇帳密401、EXTERNAL_EMAIL_UNTRUSTED 401、SDK取消/失敗
    Then 200或201建立server session（既有帳號原子撤銷舊family）後直接進本人帳號頁；INVALID_CREDENTIALS顯「Email 或密碼不正確」且不踢原有效登入
    And SDK取消留原頁「已取消 Google 登入」並恢復按鈕，不送舊結果、不撤舊family
    And 無效/過期credential提示「Google 登入驗證失敗，請重新登入 Google」，非可信網域EXTERNAL_EMAIL_UNTRUSTED提示「此 Google 帳號的 Email 未通過網域信任檢查，請改用 Email 驗證碼註冊或先以密碼登入」
  ```

### @critical @frontend @boundary @PF-BDD-075

- [ ] **Scenario: PF-BDD-075 — SDK 操作序號、晚到結果與 X-DatingHigh-Session 狀態比對**
  - SPEC 對應: `PF-AC-020`、`PF-AC-022`
  - MVP 追溯: US-016／AC-016-02；US-016／AC-016-04；MVP D-021
  - 涉及元件: GoogleAuthController；SessionProvider

  ```gherkin
  Scenario: PF-BDD-075 SDK 操作序號、晚到結果與 X-DatingHigh-Session 狀態比對
    Given SDK操作未完成，連結時記住操作序號與當時currentSessionId
    When 取消/登出/換帳號/新操作取代後舊結果晚到，或期間收到不同X-DatingHigh-Session回應標頭
    Then 只處理目前序號，舊結果不提交登入/連結
    And 連結送出前若currentSessionId已變或已登出，則取消並顯「登入狀態已變更，請重新操作」
    And SDK進行中防重複點擊，client檢查不取代server本人Access與D1 family授權
  ```

### @critical @frontend @error-handling @PF-BDD-076

- [ ] **Scenario: PF-BDD-076 — Google HTTP 不明結果不視畫面取消為 server 回滾**
  - SPEC 對應: `PF-AC-020`、`PF-AC-022`、`PF-AC-025`
  - MVP 追溯: US-016／AC-016-02；US-016／AC-016-04；US-017／AC-017-03；MVP D-021
  - 涉及元件: GoogleAuthController；ApiClient

  ```gherkin
  Scenario: PF-BDD-076 Google HTTP 不明結果不視畫面取消為 server 回滾
    Given Google登入/連結HTTP已送未確認
    When 使用者重送/換帳號/切頁或回應遺失
    Then 禁重複提交及帳號切換，不假設忽略回應會撤交易或Cookie
    And 以唯讀GET /api/v1/session或GET /api/v1/me/identities確認並比對X-DatingHigh-Session標頭，無法確認則顯「操作結果尚未確認，請重新登入後查看」
    And 不自動重送寫入、不因UI取消解除既有綁定或再建帳；若發現X-DatingHigh-Session與本機紀錄不符或回401 SESSION_REVOKED，立即清除舊畫面context並重新確認登入
  ```

### @critical @frontend @happy-path @PF-BDD-077

- [ ] **Scenario: PF-BDD-077 — 忘記密碼通用文案及轉重設**
  - SPEC 對應: `PF-AC-002`、`PF-AC-030`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: /login；/forgot-password

  ```gherkin
  Scenario: PF-BDD-077 忘記密碼通用文案及轉重設
    Given 使用者由登入頁選「忘記密碼」
    When 已註冊/未知/Google-only地址合法提交收到202
    Then 都顯「若此 Email 可處理，將收到驗證碼」並轉重設，不加固定人為等待、五秒窗或最短回覆時間
    And 必要I/O完成即顯結果，接受已知/未知地址的寄送工作時間差，不以延遲掩蓋存在性
    And 可檢查信箱及冷卻後重寄，不顯登入方式/註冊標記/送達保證
    And 全域503對所有地址同顯「服務暫時無法使用，請稍後再試」
  ```

### @critical @frontend @happy-path @PF-BDD-078

- [ ] **Scenario: PF-BDD-078 — 重設成功回登入及不明結果先試新密碼**
  - SPEC 對應: `PF-AC-002`、`PF-AC-008`、`PF-AC-030`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-019／AC-019-02、AC-019-03；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: /reset-password；/login

  ```gherkin
  Scenario: PF-BDD-078 重設成功回登入及不明結果先試新密碼
    Given 重設頁有六位碼、新密碼及確認欄
    When 正確確認204或提交後網路中斷結果不明
    Then 204顯「密碼已重設，請使用新密碼重新登入」並回登入，不自動建session
    And 不明顯「操作結果尚未確認，請先嘗試使用新密碼登入」，不重放可能消耗的碼
    And 錯誤留可修正流程，不回滾已提交密碼或宣稱舊session仍有效
  ```

### @critical @frontend @happy-path @PF-BDD-079

- [ ] **Scenario: PF-BDD-079 — 帳號頁只呈本人與真實登入方式**
  - SPEC 對應: `PF-AC-002`、`PF-AC-009`、`PF-AC-016`、`PF-AC-034`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；MVP身分與資料歸屬；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅權限基礎）；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）；MVP D-009；US-016／AC-016-03、AC-016-04
  - 涉及元件: /account；GET /me；GET /me/identities

  ```gherkin
  Scenario: PF-BDD-079 帳號頁只呈本人與真實登入方式
    Given 本人登入有效
    When 帳號唯讀載入成功
    Then 顯本人Email、「Email 已驗證」、本地密碼/Google狀態及改/設密碼、連結、登出入口
    And 無外部連結顯「尚未連結 Google」，不虛構資料
    And 不顯外部subject、Google真實頭像、私人分數或D1/SQL/Docker/binding
  ```

### @critical @frontend @happy-path @PF-BDD-080

- [ ] **Scenario: PF-BDD-080 — 改密碼成功與衝突文案**
  - SPEC 對應: `PF-AC-002`、`PF-AC-007`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-017／AC-017-04
  - 涉及元件: /account/password

  ```gherkin
  Scenario: PF-BDD-080 改密碼成功與衝突文案
    Given 本人有本地密碼並輸入目前、新密碼及確認
    When API204、錯密碼、409 CREDENTIAL_CHANGED或503
    Then 成功「密碼已更新，所有裝置都需要重新登入」並回登入
    And 失敗各顯「目前密碼不正確」、「帳號安全設定已變更，請重新操作」、「服務暫時無法使用，請稍後再試」
    And 失敗恢復可操作狀態不宣稱完成更新
  ```

### @critical @frontend @happy-path @PF-BDD-081

- [ ] **Scenario: PF-BDD-081 — 登入方式管理直接連結、驗證密碼解除與衝突**
  - SPEC 對應: `PF-AC-002`、`PF-AC-022`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-016／AC-016-04；MVP D-025
  - 涉及元件: /account/connections

  ```gherkin
  Scenario: PF-BDD-081 登入方式管理直接連結、驗證密碼解除與衝突
    Given 本人已登入並進入登入方式管理頁
    When 直接以Google SDK完成連結（不需輸入目前密碼）、輸入目前密碼解除Google，或收到Email不同/identity占用/最後方式衝突
    Then 連結成功回200後顯示「Google 已連結」並保持目前登入狀態（不強制重登）；解除成功回204後顯示「登入方式已更新，請重新登入」並導回登入頁
    And 衝突各顯「Google Email 必須與目前帳號相同」、「此 Google 登入已被使用，無法連結」、「請先保留至少一種登入方式」
    And 未成功不改為已連/已解除，不搬移/合併他人帳號
  ```

### @critical @frontend @alternative-path @PF-BDD-082

- [ ] **Scenario: PF-BDD-082 — 無本地密碼引導 Email 設定**
  - SPEC 對應: `PF-AC-002`、`PF-AC-008`、`PF-AC-022`、`PF-AC-030`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-019／AC-019-02、AC-019-03；US-016／AC-016-04；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: /account；/account/connections

  ```gherkin
  Scenario: PF-BDD-082 無本地密碼引導 Email 設定
    Given hasLocalPassword=false且已有Google
    When 選設定密碼或需要目前密碼的管理操作
    Then 「請先透過 Email 設定密碼」並走Email寄碼重設
    And 不以空目前密碼呼叫更新/解除、不提供離線復原碼/client驗證旗標替代
    And 成功要求重登並保留Google
  ```

### @critical @frontend @boundary @PF-BDD-083

- [ ] **Scenario: PF-BDD-083 — 全部變更操作 loading 與重複提交防護**
  - SPEC 對應: `PF-AC-002`、`PF-AC-020`、`PF-AC-025`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-016／AC-016-02；US-017／AC-017-03
  - 涉及元件: PrimaryButton；LoadingOverlay；帳號表單

  ```gherkin
  Scenario: PF-BDD-083 全部變更操作 loading 與重複提交防護
    Given 寄碼/確認/登入/refresh/reset/改密碼/連結/解除/logout已送
    When 連點或按Enter
    Then 顯「處理中」或「連線中」、載入指示及disabled，只送一次同操作
    And 成功或可恢復失敗後更新狀態並恢復操作，SDK/HTTP階段皆有進行中旗標
    And 切頁不宣稱撤已提交交易，不能無限loading
  ```

### @critical @frontend @boundary @PF-BDD-084

- [ ] **Scenario: PF-BDD-084 — server 倒數、重寄及429**
  - SPEC 對應: `PF-AC-002`、`PF-AC-017`、`PF-AC-028`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；MVP D-012、D-015；US-018／AC-018-04；US-019／AC-019-02
  - 涉及元件: /verify-email；/reset-password；InlineNotice

  ```gherkin
  Scenario: PF-BDD-084 server 倒數、重寄及429
    Given 挑戰有resendAfter或API429 Retry-After
    When 改client時鐘、切頁回來、到期及點重寄
    Then 以server基準顯「請稍候再重寄驗證碼」及倒數，冷卻前禁用
    And 成功重寄「已重新寄送驗證碼，請使用最新的驗證碼」，舊碼不可用
    And 429「操作過於頻繁，請稍後再試」並守Retry-After，不以client按鈕代替server限流
  ```

### @critical @frontend @error-handling @PF-BDD-085

- [ ] **Scenario: PF-BDD-085 — 網路與依賴錯誤可重試但不顯假帳號**
  - SPEC 對應: `PF-AC-002`、`PF-AC-015`、`PF-AC-025`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-015／AC-015-01、AC-015-02；US-017／AC-017-03
  - 涉及元件: InlineNotice；ApiClient；/account

  ```gherkin
  Scenario: PF-BDD-085 網路與依賴錯誤可重試但不顯假帳號
    Given 唯讀帳號載入或認證遇離線/503/504/500
    When client收到失敗或等待達上限
    Then 離線「網路連線中斷，請檢查連線後重試」，服務錯誤「服務暫時無法使用，請稍後再試」及trace ID
    And 提供「重試」/「返回登入」，未授權或未取資料不虛構Email/已登入
    And 唯讀最多重試一次；寫入不明顯「操作結果尚未確認」不盲送
  ```

### @critical @frontend @boundary @PF-BDD-086

- [ ] **Scenario: PF-BDD-086 — Web 允許多分頁操作、single-flight refresh 與 X-DatingHigh-Session 狀態同步**
  - SPEC 對應: `PF-AC-005`、`PF-AC-024`、`PF-AC-025`
  - MVP 追溯: US-017／AC-017-01、AC-017-02、AC-017-03；MVP D-020、D-021
  - 涉及元件: SessionProvider；ApiClient；X-DatingHigh-Session偵測

  ```gherkin
  Scenario: PF-BDD-086 Web 允許多分頁操作、single-flight refresh 與 X-DatingHigh-Session 狀態同步
    Given Web同origin開啟多個分頁且共用HttpOnly Cookie
    When 使用者在多分頁瀏覽、分頁內多API同收可恢復Access 401、兩分頁同時refresh遇409 REFRESH_RETRY，或另一分頁重新登入/登出/切換帳號
    Then Web不限制開啟分頁數、不顯示第二分頁阻擋頁；各分頁與原生client在單一執行個體內以single-flight合併並行401 refresh
    And 若refresh因另一分頁剛完成輪替而收到409 REFRESH_RETRY，該分頁以瀏覽器最新Cookie重試refresh一次即可恢復；若網路遺失重送緊接前一代token且在30秒寬限內，後端回200再輪替
    And 每次已登入API回應皆附X-DatingHigh-Session標頭（目前family ID），分頁於每次回應及focus/pageshow/visibilitychange回前景時核對currentSessionId
    And 若發現X-DatingHigh-Session已改變或收到401 SESSION_REVOKED，舊分頁立即清除私人畫面並導向登入頁（或重新以/session同步最新身分），不保留過期私人資料
  ```

### @critical @frontend @boundary @PF-BDD-087

- [ ] **Scenario: PF-BDD-087 — 只重送 handler 前過期/缺失 Access 請求一次**
  - SPEC 對應: `PF-AC-024`、`PF-AC-025`
  - MVP 追溯: US-017／AC-017-02、AC-017-03；MVP D-020、D-021
  - 涉及元件: ApiClient；API auth middleware

  ```gherkin
  Scenario: PF-BDD-087 只重送 handler 前過期/缺失 Access 請求一次
    Given ACCESS_TOKEN_EXPIRED或ACCESS_TOKEN_MISSING且確定handler未執行
    When 執行refresh（含遇409 REFRESH_RETRY時以最新儲存的Refresh/Cookie單次重試refresh）成功
    Then 原請求最多重送一次，第二次401回登入
    And SESSION_REVOKED/ACCESS_TOKEN_INVALID/REFRESH_TOKEN_REUSE/業務401/網路不明/可能執行寫入不自動重送
    And refresh回401不遞迴，顯「登入狀態已失效，請重新登入」
  ```

### @critical @frontend @error-handling @PF-BDD-088

- [ ] **Scenario: PF-BDD-088 — refresh 或 SecureStore 失敗回登入**
  - SPEC 對應: `PF-AC-005`、`PF-AC-025`
  - MVP 追溯: US-017／AC-017-01、AC-017-03；US-017／AC-017-03
  - 涉及元件: SessionProvider；NativeCredentialStore

  ```gherkin
  Scenario: PF-BDD-088 refresh 或 SecureStore 失敗回登入
    Given refresh過期/撤銷/重用、原生不明回應無後繼或新Refresh寫SecureStore失敗
    When client處理恢復結果或確認舊family已被其他裝置新登入替代
    Then 清本機可用登入並回登入，不再用舊Refresh；確認替代時顯「帳號已在其他裝置登入，請重新登入」
    And 其餘失效顯「登入狀態已失效，請重新登入」，新Refresh寫成功前不恢復請求，Access不落地
    And 清舊裝置登入不撤銷最新family；server登出撤銷未確認仍走待撤銷流程不誤稱完成
    And server在新登入commit即令舊憑證失效；舊client於下一API或回前景核驗時清私人UI並提示，不新增push端點，不承諾閒置/離線畫面同毫秒變化
  ```

### @critical @frontend @boundary @PF-BDD-089

- [ ] **Scenario: PF-BDD-089 — Email metadata 與敏感欄位生命週期**
  - SPEC 對應: `PF-AC-002`、`PF-AC-016`、`PF-AC-031`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約）；US-018／AC-018-02、AC-018-04；US-019／AC-019-01、AC-019-02
  - 涉及元件: EmailFlowStore；sessionStorage；SecureStore

  ```gherkin
  Scenario: PF-BDD-089 Email metadata 與敏感欄位生命週期
    Given 尚在有效Email註冊/reset挑戰
    When 頁面重載或app重啟，之後完成/到期
    Then 只在有效期由Web sessionStorage/原生SecureStore恢復challenge metadata與flowToken
    And 碼/密碼不存草稿/URL/analytics/錄影，平台token與Google credential不進此flow store
    And 完成/到期清metadata，不能恢復則「驗證流程已失效，請重新申請」並回對應入口
  ```

### @critical @frontend @happy-path @PF-BDD-090

- [ ] **Scenario: PF-BDD-090 — 登出畫面依 server 撤銷確認**
  - SPEC 對應: `PF-AC-002`、`PF-AC-007`、`PF-AC-025`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-017／AC-017-04；US-017／AC-017-03；MVP D-021
  - 涉及元件: /account；SessionProvider

  ```gherkin
  Scenario: PF-BDD-090 登出畫面依 server 撤銷確認
    Given 本人在目前唯一有效帳號選「登出」，或已被新裝置替代的舊裝置重試原logout
    When DELETE /session回204或原family撤銷結果因網路不明
    Then 204後僅清此次本機登入，「已登出」回開始頁；舊裝置請求不撤銷最新有效family
    And 不明隱藏私人畫面「尚未完成伺服器登出，請重試」，下次啟動先處理原撤銷而非refresh
    And 不登出Google本身/解除綁定，同Account不保留其他並行有效session；同瀏覽器其他分頁於回前景或下次API收到401 SESSION_REVOKED時同步清除私人畫面
  ```

### @normal @frontend @error-handling @PF-BDD-091

- [ ] **Scenario: PF-BDD-091 — 缺失/過期流程與空狀態可重新開始**
  - SPEC 對應: `PF-AC-002`、`PF-AC-028`、`PF-AC-030`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-018／AC-018-04；US-019／AC-019-02；US-019／AC-019-01、AC-019-02、AC-019-03
  - 涉及元件: /verify-email；/reset-password；connections

  ```gherkin
  Scenario: PF-BDD-091 缺失/過期流程與空狀態可重新開始
    Given 直達驗碼/reset卻無有效metadata，或登入方式無外部連結
    When 頁面載入
    Then 無挑戰「驗證流程已失效，請重新申請」及「重新申請」，無可略過驗證之按鈕
    And 無Google顯「尚未連結 Google」及符合目前登入能力的操作
    And 不以null/空陣列/載入錯誤推定已驗證、無密碼或可刪最後方式
  ```

---

## ⚠️ SPEC 補充 — BDD 未覆蓋項目

本版 PF-AC-001..037 與九條畫面路由皆有場景；未發現需新增的產品需求。以下為 TDD／風險稽核須保留的解讀，非實作完成：

- `LAST_LOGIN_METHOD` 為 domain 不變條件；Google-only 帳號（`hasLocalPassword=false`）在解除 Google 綁定時直接觸發 409 `LAST_LOGIN_METHOD` 保護並引導先透過 Email 設定本地密碼；已連結外部身分時則僅需當下有效本人 Access＋D1 family 與同 Email，不需輸入目前密碼且不踢登出（D-025）。
- SDK nonce/state 按平台模式處理；後端不建預期 nonce，不因無應用自訂 nonce 拒絕合法 cached Google ID Token；首次 Google 登入須通過 `email_verified=true` 與可信網域（`gmail.com` 或 `hd` 等於 Email 網域）驗證後直接原子建帳回 201（D-023）。
- Email `flowToken` 可在有效期恢復流程，不等於可持久保存 code、密碼、Google credential 或平台 token。
- `ready` 的設定／binding 檢查與 staging 真收信皆須完成，不讓 `ready` 每次寄信。
- 同 Account 單一有效 family 與新登入成功撤舊已於 D-017／D-021 確認；Web 不限制開啟分頁數，透過每次已登入回應的 `X-DatingHigh-Session` 標頭與 401 `SESSION_REVOKED` 在 `focus`/`pageshow`/`visibilitychange` 與每次回應同步分頁狀態。
- Refresh 輪替以 `UNIQUE(session_id, generation)` 為最終線性化點，並依 D-020 提供 `consumed_at` 起 30 秒寬限窗（緊接前一代重試回 200 再輪替、並行落敗回 409 `REFRESH_RETRY`、逾 30 秒回 401 `REFRESH_TOKEN_REUSE` 並撤銷 family）。
- 忘記密碼 request/resend 依 D-018 與 D-026 不加人為固定等待，正常必要 I/O 後即回同形 202（含寄信失敗時仍回通用 202 並記內部 log），接受剩餘時間差；Email 註冊寄信失敗則回 503 `EMAIL_DELIVERY_FAILED`（sender 逾時上限 10 秒）。
- 同一 D1 batch 內各寫入依 D-022 共用前置條件（Email 挑戰消耗置於 batch 最後一句）並搭配自然 UNIQUE 約束確保原子回滾，`credential_version` 為唯一樂觀並行欄位；限流與驗證碼各採單一 HMAC 秘密（`RATE_LIMIT_HMAC_KEY`、`EMAIL_CODE_HMAC_KEY`）且全由 .NET 計算雜湊（D-026、D-027）。

---

## ⚡ Performance — 效能與交付證據

### @normal @frontend @performance @PF-BDD-092

- [ ] **Scenario: PF-BDD-092 — 一般三十秒、cold start四十五秒與唯讀重試**
  - SPEC 對應: `PF-AC-002`、`PF-AC-015`、`PF-AC-025`
  - MVP 追溯: US-013／AC-013-01、AC-013-02；US-015／AC-015-01、AC-015-02；US-017／AC-017-03
  - 涉及元件: ApiClient；Worker；LoadingOverlay

  ```gherkin
  Scenario: PF-BDD-092 一般三十秒、cold start四十五秒與唯讀重試
    Given 一般請求或首次container啟動等待中
    When 一般達三十秒或cold start四十五秒未完成
    Then 結束等待給可處理錯誤，cold start期間「連線中」，server啟動逾時504 STARTUP_TIMEOUT
    And 純讀取最多重試一次，確認註冊/reset/改密碼結果不明不自動重送
    And 不承諾本份未實測的延遲/SLA/水平擴充
  ```

### @critical @performance @PF-BDD-093

- [ ] **Scenario: PF-BDD-093 — staging 真服務、收信、部署與相容回復**
  - SPEC 對應: `PF-AC-013`、`PF-AC-014`、`PF-AC-015`、`PF-AC-019`、`PF-AC-026`、`PF-AC-029`
  - MVP 追溯: US-015／AC-015-01；US-015／AC-015-02；US-015／AC-015-01、AC-015-02；US-016／AC-016-01；US-017／AC-017-03、AC-017-04；US-016／AC-016-02；US-018／AC-018-02；US-019／AC-019-01
  - 涉及元件: deploy程序；staging smoke

  ```gherkin
  Scenario: PF-BDD-093 staging 真服務、收信、部署與相容回復
    Given staging資源、Google設定及Cloudflare Email Service sender網域已就緒
    When 依preflight/checkpoint/向前migration/probe/Worker-container-assets順序部署並真驗收
    Then Worker→.NET container→outbound handler→D1/R2有實測，真收Email註冊與忘記密碼驗證碼完成流程，並實測首次Google登入直接建帳
    And 私人R2及probe digest正確，容器重啟D1 Account/family/有效EmailChallenge與R2 probe保留
    And 真Google、Email防重、Refresh 30秒寬限與逾時重放撤銷、logout競態、跨平台恢復有去敏證據，不以202代替真收信
    And migration失敗停止發布，問題版僅回復相容Worker/映像/assets，不自動清空或還原D1
    And 以手機先登入再電腦成功登入實測即撤手機舊Access/Refresh，反向操作與Email/Google併發亦僅最後成功commit有效；失敗新登入保留原登入
    And 驗收分開記錄server提交時舊憑證即被拒絕，以及舊client下一API/回前景核驗後清UI；不以尚未推送的閒置畫面要求新push能力
  ```

### @critical @performance @PF-BDD-094

- [ ] **Scenario: PF-BDD-094 — 平台及環境證據分開且不冒稱完整產品完成**
  - SPEC 對應: `PF-AC-001`、`PF-AC-018`
  - MVP 追溯: US-013／AC-013-01；US-015／AC-015-01、AC-015-02
  - 涉及元件: check:foundation；交付報告；build紀錄

  ```gherkin
  Scenario: PF-BDD-094 平台及環境證據分開且不冒稱完整產品完成
    Given 交付本份PlatformFoundation文件與後續驗收紀錄
    When 整理local、Web、Android、iOS、staging與production狀態
    Then 每項各列版本/build ID、日期、執行及結果證據，缺iOS/雲端資源明記「未驗收」
    And 不以設定存在、mock、Web或local結果替代原生/雲端，production未授權或未執行則不宣稱已發布
    And 本份完成只代表US013與US015基礎責任，其他七SPEC業務與整份MVP仍須各自驗收
    And 同Account三平台證據依成功登入先後分別記錄，前一平台已撤銷而非多裝置同時有效；Web含多分頁X-DatingHigh-Session狀態同步與舊分頁失效清除證據
  ```

---

## 🔎 驗收與追溯總表

**92 個唯一 Scenario（PF-BDD-001..094，其中 PF-BDD-006、PF-BDD-073 已依 D-023 移除且不重編）**、**25 個 @frontend Scenario**。文件覆蓋 PF-AC-001..037 共 37/37；全部場景未勾選，實作與測試進度 0%。

| SPEC 驗收 | BDD ID | MVP 來源 |
|---|---|---|
| PF-AC-001 | PF-BDD-001、PF-BDD-069、PF-BDD-094 | US-013／AC-013-01 |
| PF-AC-002 | PF-BDD-024、PF-BDD-068、PF-BDD-069、PF-BDD-070、PF-BDD-071、PF-BDD-072、PF-BDD-074、PF-BDD-077、PF-BDD-078、PF-BDD-079、PF-BDD-080、PF-BDD-081、PF-BDD-082、PF-BDD-083、PF-BDD-084、PF-BDD-085、PF-BDD-089、PF-BDD-090、PF-BDD-091、PF-BDD-092 | US-013／AC-013-01、AC-013-02 |
| PF-AC-003 | PF-BDD-004、PF-BDD-009、PF-BDD-068 | US-013／AC-013-02 |
| PF-AC-004 | PF-BDD-002、PF-BDD-003、PF-BDD-005、PF-BDD-025、PF-BDD-026、PF-BDD-027、PF-BDD-028、PF-BDD-031、PF-BDD-038、PF-BDD-048、PF-BDD-070、PF-BDD-071 | US-018／AC-018-01、AC-018-03 |
| PF-AC-005 | PF-BDD-004、PF-BDD-020、PF-BDD-025、PF-BDD-035、PF-BDD-036、PF-BDD-037、PF-BDD-086、PF-BDD-088 | US-017／AC-017-01、AC-017-03 |
| PF-AC-006 | PF-BDD-008、PF-BDD-015、PF-BDD-035、PF-BDD-053、PF-BDD-063、PF-BDD-067 | US-017／AC-017-02、AC-017-04 |
| PF-AC-007 | PF-BDD-010、PF-BDD-014、PF-BDD-015、PF-BDD-022、PF-BDD-023、PF-BDD-050、PF-BDD-052、PF-BDD-054、PF-BDD-055、PF-BDD-080、PF-BDD-090 | US-017／AC-017-04 |
| PF-AC-008 | PF-BDD-011、PF-BDD-012、PF-BDD-039、PF-BDD-049、PF-BDD-078、PF-BDD-082 | US-019／AC-019-02、AC-019-03 |
| PF-AC-009 | PF-BDD-009、PF-BDD-016、PF-BDD-043、PF-BDD-079 | MVP身分與資料歸屬；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅權限基礎） |
| PF-AC-010 | PF-BDD-063 | US-014／AC-014-01、AC-014-02 |
| PF-AC-011 | PF-BDD-064 | US-014／AC-014-01、AC-014-02 |
| PF-AC-012 | PF-BDD-065 | US-014／AC-014-02 |
| PF-AC-013 | PF-BDD-041、PF-BDD-042、PF-BDD-066、PF-BDD-093 | US-015／AC-015-01 |
| PF-AC-014 | PF-BDD-016、PF-BDD-043、PF-BDD-063、PF-BDD-093 | US-015／AC-015-02 |
| PF-AC-015 | PF-BDD-041、PF-BDD-066、PF-BDD-085、PF-BDD-092、PF-BDD-093 | US-015／AC-015-01、AC-015-02 |
| PF-AC-016 | PF-BDD-009、PF-BDD-010、PF-BDD-016、PF-BDD-025、PF-BDD-028、PF-BDD-042、PF-BDD-044、PF-BDD-064、PF-BDD-079、PF-BDD-089 | US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約） |
| PF-AC-017 | PF-BDD-028、PF-BDD-041、PF-BDD-056、PF-BDD-057、PF-BDD-058、PF-BDD-060、PF-BDD-084 | MVP D-012、D-015；US-018／AC-018-04 |
| PF-AC-018 | PF-BDD-001、PF-BDD-024、PF-BDD-094 | US-013／AC-013-01；US-015／AC-015-01、AC-015-02 |
| PF-AC-019 | PF-BDD-005、PF-BDD-007、PF-BDD-024、PF-BDD-044、PF-BDD-074、PF-BDD-093 | US-016／AC-016-01 |
| PF-AC-020 | PF-BDD-017、PF-BDD-029、PF-BDD-037、PF-BDD-074、PF-BDD-075、PF-BDD-076、PF-BDD-083 | US-016／AC-016-02 |
| PF-AC-021 | PF-BDD-005、PF-BDD-007、PF-BDD-017、PF-BDD-029、PF-BDD-031、PF-BDD-033、PF-BDD-048、PF-BDD-074 | US-016／AC-016-03 |
| PF-AC-022 | PF-BDD-012、PF-BDD-013、PF-BDD-014、PF-BDD-018、PF-BDD-032、PF-BDD-033、PF-BDD-034、PF-BDD-050、PF-BDD-075、PF-BDD-076、PF-BDD-081、PF-BDD-082 | US-016／AC-016-04 |
| PF-AC-023 | PF-BDD-004、PF-BDD-007、PF-BDD-008、PF-BDD-009、PF-BDD-035、PF-BDD-036、PF-BDD-053 | US-017／AC-017-01 |
| PF-AC-024 | PF-BDD-008、PF-BDD-021、PF-BDD-041、PF-BDD-051、PF-BDD-052、PF-BDD-054、PF-BDD-086、PF-BDD-087 | US-017／AC-017-02 |
| PF-AC-025 | PF-BDD-020、PF-BDD-021、PF-BDD-022、PF-BDD-076、PF-BDD-083、PF-BDD-085、PF-BDD-086、PF-BDD-087、PF-BDD-088、PF-BDD-090、PF-BDD-092 | US-017／AC-017-03 |
| PF-AC-026 | PF-BDD-015、PF-BDD-020、PF-BDD-051、PF-BDD-054、PF-BDD-063、PF-BDD-067、PF-BDD-093 | US-017／AC-017-03、AC-017-04；US-016／AC-016-02 |
| PF-AC-027 | PF-BDD-002、PF-BDD-003、PF-BDD-026、PF-BDD-031、PF-BDD-048、PF-BDD-070 | US-018／AC-018-03 |
| PF-AC-028 | PF-BDD-002、PF-BDD-003、PF-BDD-005、PF-BDD-011、PF-BDD-019、PF-BDD-038、PF-BDD-039、PF-BDD-045、PF-BDD-046、PF-BDD-047、PF-BDD-049、PF-BDD-057、PF-BDD-067、PF-BDD-071、PF-BDD-072、PF-BDD-084、PF-BDD-091 | US-018／AC-018-04；US-019／AC-019-02 |
| PF-AC-029 | PF-BDD-002、PF-BDD-040、PF-BDD-066、PF-BDD-070、PF-BDD-093 | US-018／AC-018-02；US-019／AC-019-01 |
| PF-AC-030 | PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-039、PF-BDD-049、PF-BDD-072、PF-BDD-077、PF-BDD-078、PF-BDD-082、PF-BDD-091 | US-019／AC-019-01、AC-019-02、AC-019-03 |
| PF-AC-031 | PF-BDD-040、PF-BDD-044、PF-BDD-046、PF-BDD-089 | US-018／AC-018-02、AC-018-04；US-019／AC-019-01、AC-019-02 |
| PF-AC-032 | PF-BDD-005、PF-BDD-017、PF-BDD-031、PF-BDD-038、PF-BDD-048 | US-018／AC-018-01、AC-018-03；US-016／AC-016-03 |
| PF-AC-033 | PF-BDD-061 | MVP D-010 |
| PF-AC-034 | PF-BDD-005、PF-BDD-007、PF-BDD-009、PF-BDD-013、PF-BDD-029、PF-BDD-030、PF-BDD-079 | MVP D-009；US-016／AC-016-03、AC-016-04 |
| PF-AC-035 | PF-BDD-005、PF-BDD-013、PF-BDD-017、PF-BDD-023、PF-BDD-027、PF-BDD-030、PF-BDD-062 | MVP D-013、D-014；US-016／AC-016-02 |
| PF-AC-036 | PF-BDD-056、PF-BDD-057、PF-BDD-058、PF-BDD-059、PF-BDD-060 | MVP D-015 |
| PF-AC-037 | PF-BDD-061、PF-BDD-062、PF-BDD-064 | MVP D-016、D-010 |

### MVP 本輪責任界定

| MVP 故事 | 本輪追溯的全部驗收 | 責任限制 |
|---|---|---|
| US-013 | AC-013-01、AC-013-02 | 三平台骨架、帳號基本流程及原型視覺；完整配對／分數／門檻／退出仍由其餘七份SPEC驗收 |
| US-014 | AC-014-01、AC-014-02 | 本地磁碟、查改、重啟保存及匯出還原 |
| US-015 | AC-015-01、AC-015-02 | .NET／Worker／D1／R2接線、測試部署與設定；照片及化身實際業務屬後續SPEC，production發布須另有執行證據 |
| US-016 | AC-016-01、AC-016-02、AC-016-03、AC-016-04 | Google實際adapter、後端驗證、首次直接建帳、明確連結及最後方式保護 |
| US-017 | AC-017-01、AC-017-02、AC-017-03、AC-017-04 | HS256 Access／Refresh、30秒寬限窗輪替、恢復及撤銷 |
| US-018 | AC-018-01、AC-018-02、AC-018-03、AC-018-04 | Email驗碼、環境寄送、全域防重及單次挑戰 |
| US-019 | AC-019-01、AC-019-02、AC-019-03 | 忘記／重設、無效拒絕及舊憑證失效 |

上述US-013..019共21條MVP AC均有本輪責任追溯；US-013、US-015的跨完整產品內容不能僅因本份完成即標為整項完成。US-002與US-006另僅追溯隱私／授權基礎，未驗其照片或分數業務。

### 文件生成檢查結果

| 項目 | 結果 |
|---|---|
| PF-AC完整追溯 | 37/37 |
| Given／When／Then及穩定ID | 全場景具備；英文關鍵字、繁中步驟（PF-BDD-006、PF-BDD-073 已移除不重編） |
| 優先級及類型 | 每場景critical或normal，含Happy／Alternative／Error／Boundary／Frontend／Performance |
| 成功失敗輸出 | 既有API狀態及code、具體UI文案、授權與原子性副作用 |
| 期限、併發與替代 | 同batch共用前置條件、Refresh 30秒寬限窗與逾時重放、重寄、取消、結果不明、恢復皆覆蓋 |
| 前端 | 九route，載入、空狀態、互動、loading、錯誤、防重、可存取性、多分頁X-DatingHigh-Session同步 |
| 實作與應用測試 | 未執行；92場景全部未勾選 |

---

## 🔗 相關文檔

- [SPEC 來源](../specs/SPEC-001-PlatformFoundation.md) — 已確認 SDD。
- [MVP 來源](../requirements/MVP-001-LoveGameDatingApp.md) — US／AC／決策。
- [TDD 測試清單](../tdd/SPEC-001-PlatformFoundation-TDD.md) — 由本份穩定ID生成，不代表已執行。
- [實作前風險稽核](../specs/SPEC-001-PlatformFoundation-RiskAudit.md) — 文件包缺漏與風險決策。

**生成者**: AI
**最後更新**: 2026-10-27
**狀態**: ✅ 已依 D-019～D-028 精簡修訂規劃文件；⏸️ 實作與測試未開始；尚未宣告 Ready for well-done。
