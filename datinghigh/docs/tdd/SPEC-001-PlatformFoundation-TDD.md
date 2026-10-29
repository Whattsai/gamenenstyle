# SPEC-001-PlatformFoundation TDD 測試清單

> **來源 BDD**：[SPEC-001-PlatformFoundation-BDD.md](../bdd/SPEC-001-PlatformFoundation-BDD.md)
> **來源 SPEC**：[SPEC-001-PlatformFoundation.md](../specs/SPEC-001-PlatformFoundation.md)
> **來源 MVP**：[MVP-001-LoveGameDatingApp.md](../requirements/MVP-001-LoveGameDatingApp.md)
> **生成／更新日期**：2026-10-29（現行版本已確認，Ready for well-done；MVP D-029～D-031 名片業務邊界及 D-017～D-028 的 227 個案例維持）
> **範圍**：僅 SPEC-001-PlatformFoundation。測試案例為規劃，未建立程式、未執行應用測試。既有測試編號不重編（`PF-API-007..009` 因移除外部註冊收件碼端點而刪減，缺號不補）。

2026-10-29 MVP 新增 `US-020`／`AC-020-01..06`，並將總體好感度更名為「親密度」。名片沿用配對前資料，25 分只控制入口顯示，邀請可重送，雙方同意才揭露，拒絕不改分，終止後不得完成待處理交換。欄位、交換／揭露及終止邊界由後續 AvatarAndPreferences／AffectionAndFeedback／StoryDialogueAndExit 文件包驗收；本份維持 227 個認證與平台基礎案例，不宣稱涵蓋 US-020，不新增名片端點、業務表或登入帳號資料揭露。

---

## 🎯 開發進度總覽

### 整體進度

```text
📦 SPEC-001-PlatformFoundation TDD 開發
├─ 🔴 Red-Green-Refactor 狀態：未開始
├─ ⏰ 開始時間：-
├─ 📅 預計完成：-
└─ 👤 負責人：後續 well-done 承接

進度條：[░░░░░░░░░░░░░░░░░░░░] 0% (0/227)
```

### 分層進度追蹤

| 測試層級 | 進度 | 已完成 | 進行中 | 待開始 | 狀態 |
|---|---|---|---|---|---|
| 1️⃣ 單元測試（39組） | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/117 | 0 | 117 | ⏸️ 未開始 |
| 2️⃣ 集成測試 | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/35 | 0 | 35 | ⏸️ 未開始 |
| 3️⃣ API測試（17端點） | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/51 | 0 | 51 | ⏸️ 未開始 |
| 4️⃣ E2E測試 | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/24 | 0 | 24 | ⏸️ 未開始 |
| 合計 | `[░░░░░░░░░░░░░░░░░░░░] 0%` | 0/227 | 0 | 227 | ⏸️ 未開始 |

### 當前 Sprint 狀態

| 項目 | 內容 |
|------|------|
| 當前階段 | BDD／TDD 規劃與實作前風險稽核（D-019～D-028 精簡同步完成） |
| 當前測試 | 無；尚未實作任何測試 |
| Red-Green-Refactor | 未開始 |
| 最後更新 | 2026-10-27 |
| 備註 | 已依 D-017／D-018 及 D-019～D-028 認證精簡決策更新全數案例與追溯表 |

### 里程碑

- [ ] M1：單元測試完成（0/117）。
- [ ] M2：真 D1／R2 emulator 與容器整合完成（0/35）。
- [ ] M3：17 個 HTTP 端點及其正常／拒絕／故障 51 案例完成（0/51）。
- [ ] M4：Web／Android／iOS 與 staging 真服務 E2E 完成（0/24）。
- [ ] M5：所有必要測試通過，完成 SPEC／BDD／TDD 追溯及深度稽核。
- [ ] M6：staging 證據與 production 發布狀態分別交接。

### 關鍵指標

| 指標 | 目標 | 當前 | 狀態 |
|------|------|------|------|
| 計畫案例執行率 | 100% | 0% | ⏸️ 未開始 |
| 必要案例通過率 | 100% | 未執行 | ⏸️ 未開始 |
| BDD Scenario 規劃映射率 | 100% | 92/92；每場景 3–6 個 Unit 及至少一個高層案例 | 僅文件映射完成，未執行 |
| 三平台真實執行證據 | Web、Android、iOS 各有證據 | 無 | ⏸️ 未開始 |
| staging 真 Google／收信／D1／R2 證據 | 全部具備 | 無 | ⏸️ 未開始 |

### 每日進度記錄

#### 2026-10-25

- 已讀來源 MVP、已確認 SPEC、BDD skill 與指定 TDD 範本，產出初始測試規劃。
- 應用與測試程式尚未建立；所有測試均未執行。

#### 2026-10-27

- 依 D-017（新登入成功撤銷舊登入）、D-018（忘記密碼不加人為固定延遲）及 D-019～D-028「全套精簡」認證機制決策同步更新。
- 刪除因取消外部註冊收件碼端點而不再適用的 `PF-BDD-006`、`PF-BDD-073` 及 `PF-API-007..009`（既有編號不重編）；全文件定稿為 **227 案（117 Unit＋35 Integration＋51 API＋24 E2E）／92 個 BDD 場景／37 條 PF-AC／17 組 API 端點**。全部應用測試未執行，進度 0%。

---

## 測試規劃共通契約

- 每個案例唯一 ID 採 `PF-UT-xxx`／`PF-IT-xxx`／`PF-API-xxx`／`PF-E2E-xxx`（既有編號不重編），名稱採 `Method_Condition_Result`。`P0` 為安全、原子性或基礎阻斷，`P1` 為必要產品流程，`P2` 為次要體驗。
- 每個案例列出檔案路徑、來源 BDD／PF-AC、目標、前提、動作、預期；共享案例只計一次。Scenario 映射表列出至少三個相關單元案例，避免重複建立同一規則的測試。
- 測試檔案路徑均為後續新增計畫；不代表目前已有檔案。單元測試可使用固定 clock、CSPRNG／sender／SDK adapter fake；D1 的 SQL、batch、條件更新、自然 UNIQUE 約束與持久化必須由真 emulator 整合測試驗證。
- Google／Email fake 只用於可重現故障；真 Google 登入及真收件只能以 staging／三平台 E2E 證據結案。local log 不代替 server 寄信；Web 不代替 iOS／Android development build。
- 六張自有表依 D-019～D-027 精簡後共 **54 欄**，保留 `auth_`／`common_` 前綴與第一欄 UUIDv7。禁止 Identity／EF，不建立 `auth_challenges`／`platform_metadata`。
- 有效 Google proof 可重用，首次登入驗證 `email_verified=true` 與可信網域（`gmail.com` 或 `hd` 等於 Email 網域）後直接原子建帳回 201（D-023）；連結 Google 僅需本人有效登入與同 Email，不需目前密碼且不踢登出（D-025）；Email 驗證碼單次使用；Refresh Token 單次輪替並具 `consumed_at` 起 **30 秒寬限窗**（D-020）。
- 同 Account 最多一個 `revoked_at IS NULL` family（D-017、D-021）：`session.create` 在同一 D1 batch 內撤銷所有 NULL 舊列並依 Account active/`cv` 條件插入新 family 與 generation 0 Refresh（不寫 `auth_accounts`、不增加 `cv`）。Web 不限制分頁數，已登入回應附 `X-DatingHigh-Session` 標頭供分頁於每次回應與回前景時比對狀態。
- 同一 D1 batch 內各寫入依 D-022 共用前置條件（Email 挑戰消耗放最後一句）並搭配自然 UNIQUE 約束回滾，`credential_version` 為唯一樂觀並行欄位。Access Token 採 HS256 單一秘密 `ACCESS_TOKEN_SECRET`（D-019）；驗證碼與限流各採單一 HMAC 秘密（`EMAIL_CODE_HMAC_KEY`、`RATE_LIMIT_HMAC_KEY`）且全由 .NET 計算雜湊（D-026、D-027）；傳輸判定僅依 `Origin` 與 `clientPlatform` 兩條規則運作（D-028）。

## 1️⃣ 單元測試（Unit Tests）

每組「位置／優先級」適用組內每案；每列各自列出精確來源、目標、前提、動作、預期。來源表示該案例支援該場景的一部分規則，完整場景由追溯表中的跨層案例共同驗證。共享案例只計一次，參數化資料不額外灌計數。

### 1.1 建置與平台配置

**位置（組內每案）**：`scripts/tests/foundation-build-policy.test.ts`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-001** `ValidateToolchain_PinnedCompatibleVersions_AcceptsBuildPlan` | PF-BDD-001；PF-AC-001、PF-AC-018 | 版本固定與相容性 | 已提供 .NET 10、Expo 58、Node 24、Wrangler 4.136.0+、Containers SDK 與 lockfile 清單 | 解析版本與映像設定 | 要求確切 servicing／patch、映像 digest、compatibility_date；浮動 latest、缺鎖檔或不相容組合拒絕 |
| - [ ] **PF-UT-002** `ValidateWebExport_SingleOutputAndApiPriority_AcceptsSpaConfiguration` | PF-BDD-001；PF-AC-001、PF-AC-018 | Web 匯出配置 | 配置含 Expo web.output 與 Worker 路由 | 分別輸入 single／server output 及 API fallback 設定 | 只接受 single SPA 與 API／health／internal 優先；配置通過不宣稱已完成匯出 |
| - [ ] **PF-UT-003** `ValidateNativeBuild_MissingPlatformEvidence_LeavesAcceptanceIncomplete` | PF-BDD-001；PF-AC-001、PF-AC-018 | 三平台證據預檢 | 已有 Web 或 Android build，缺 iOS development build | 彙整建置／執行證據 | 依平台列缺項；Windows 或 Web 成果不替代 iOS；不產生全部完成狀態 |

### 1.2 EmailAddress

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Domain/EmailAddressTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-004** `NormalizeEmail_AsciiAddressWithOuterWhitespace_ReturnsInvariantLowercase` | PF-BDD-026、PF-BDD-031、PF-BDD-070；PF-AC-002、PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-032 | 共用 Email canonicalization | 參數包含大小寫、外側空白、+tag 與 Gmail 點 | 呼叫 Email 正規化 | 只 trim 外側與 invariant lowercase；保留 +tag／點，不推定 alias 等價 |
| - [ ] **PF-UT-005** `ValidateEmail_LengthBoundaries_AcceptsOnlySupportedAsciiAddrSpec` | PF-BDD-026、PF-BDD-070；PF-AC-002、PF-AC-004、PF-AC-027 | 格式與長度邊界 | 參數涵蓋總長254／255 bytes、local-part64／65 bytes、Unicode、display name、註解與缺少分隔符 | 執行共用 server 驗證 | 合法邊界通過；超界及不支援格式拒絕，不建立帳號或挑戰 |
| - [ ] **PF-UT-006** `CreateEmailKey_EquivalentAddresses_UsesOneUniquenessKey` | PF-BDD-026、PF-BDD-031、PF-BDD-070；PF-AC-002、PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-032 | 所有建帳路徑共用唯一鍵 | Email 與 Google adapter 輸入等價及非等價地址 | 建立 repository／limiter 使用的 canonical key | 等價地址使用相同 key；不同 +tag／點不合併；錯誤回 EMAIL_ALREADY_REGISTERED 所需結果 |

### 1.3 PasswordPolicy／BCL Hash Adapter

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Security/PasswordHashServiceTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-007** `ValidatePassword_ScalarAndUtf8Boundaries_EnforcesUnmodifiedSecret` | PF-BDD-010、PF-BDD-027；PF-AC-004、PF-AC-007、PF-AC-016、PF-AC-035 | 密碼輸入規則 | 參數為11／12／128／129 scalar、emoji與512／513嚴格UTF-8 bytes、NUL／控制字元及孤立surrogate | 驗證密碼並檢視傳入 hasher 值 | 只接受12–128 scalar且≤512 bytes，拒孤立surrogate且不得replacement fallback；不trim／改大小寫／正規化 |
| - [ ] **PF-UT-008** `HashAndVerifyPassword_ValidAndUnknownAccount_UsesBclAndConstantTimePolicy` | PF-BDD-010、PF-BDD-027、PF-BDD-028；PF-AC-004、PF-AC-007、PF-AC-016、PF-AC-017、PF-AC-035 | 密碼雜湊及通用登入拒絕 | 固定測試 salt／dummy hash 與已知正確或錯誤密碼 | 產生／驗證自描述 hash，對不存在帳號走 dummy 驗證 | PBKDF2-HMAC-SHA256 600000次、16-byte salt、32-byte key；固定時間比對；錯密碼與無帳號均 INVALID_CREDENTIALS |
| - [ ] **PF-UT-009** `ParseAndRehashPassword_UnsupportedOrStaleParameters_RejectsOrUsesConditionalUpgrade` | PF-BDD-023、PF-BDD-027；PF-AC-004、PF-AC-007、PF-AC-035 | hash parser及等價rehash | 提供支援／不支援版本、超大成本、錯誤長度及較舊可升級 hash | 解析並提出 conditional rehash | 拒絕不受限參數；等價升級以 WHERE password_hash=@oldHash AND credential_version=@cv 條件更新，不增加cv、不覆蓋競態新密碼；無Identity／EF依賴 |

### 1.4 Registration Application

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/RegistrationTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-010** `RequestRegistration_ValidUnregisteredEmail_CreatesChallengeOnly` | PF-BDD-002；PF-AC-004、PF-AC-027、PF-AC-028、PF-AC-029 | 驗碼前不建立帳號 | Email合法且未註冊、limiter允許、sender可用 | 請求Email註冊碼 | 建立限時register_email challenge；未完成碼驗證無Account／family／平台token |
| - [ ] **PF-UT-011** `ConfirmRegistration_ValidPurposeBoundCodeOrExternalIdentity_BuildsOneAtomicCompletion` | PF-BDD-003、PF-BDD-005、PF-BDD-048；PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-032、PF-AC-034 | Email驗碼確認與首次Google直接建帳 | 有效active之register_email挑戰（flow與碼正確）或已驗證可信網域之新Google身分 | 建立account.register-email或account.register-external批次命令 | Email註冊共用挑戰active與generation/code_mac前置條件並於最後一句消耗挑戰；首次Google直接建無密碼Account＋identity＋family＋Refresh，不收client覆寫provider/subject/Email |
| - [ ] **PF-UT-012** `ConfirmRegistration_ConflictOrIncompleteWrite_DoesNotIssueTokens` | PF-BDD-003、PF-BDD-005、PF-BDD-048；PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-032、PF-AC-034 | 失敗無半套成果 | repository回Email／subject自然UNIQUE衝突、前置條件0列或SQL失敗 | 處理確認或建帳結果 | 回409 EMAIL_ALREADY_REGISTERED／EXTERNAL_IDENTITY_IN_USE或503；不核發token、不單獨消耗碼；真D1同批回滾由PF-IT-002／003驗證 |

### 1.5 EmailChallenge Policy

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Domain/EmailChallengeTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-013** `VerifyCode_BindingOrStateMismatch_RejectsWithoutCompletion` | PF-BDD-019、PF-BDD-038、PF-BDD-039、PF-BDD-045、PF-BDD-047；PF-AC-004、PF-AC-008、PF-AC-028、PF-AC-030、PF-AC-032 | 碼與原流程綁定 | 固定challenge、purpose（register_email或reset_password）、Email、generation、flow hash；參數逐項錯誤或state非active | 由.NET以單一EMAIL_CODE_HMAC_KEY計算並驗證六位碼／flow | 固定五欄順序challengeId|purpose|normalizedEmail|generation|code（ASCII 0x7C分隔、UUID小寫D、UTF-8無BOM、constant-time比對）；錯flow/purpose/generation/consumed/locked拒絕，D1無明文或裸SHA |
| - [ ] **PF-UT-014** `EvaluateChallenge_TimeAndResendBoundaries_UsesServerClock` | PF-BDD-038、PF-BDD-045、PF-BDD-046；PF-AC-004、PF-AC-028、PF-AC-031、PF-AC-032 | 碼期限與重寄邊界 | 固定UTC clock，參數涵蓋六位前導零、10分鐘、絕對30分鐘、59／60秒 | 產碼、驗碼及計算可重寄狀態 | 000001保留六位；到期拒絕，重寄不得延長絕對期限；冷卻以server時計算 |
| - [ ] **PF-UT-015** `RecordWrongCode_FifthFailureOrResend_PreservesCumulativeLockout` | PF-BDD-038、PF-BDD-045、PF-BDD-046、PF-BDD-047；PF-AC-004、PF-AC-028、PF-AC-031、PF-AC-032 | 錯碼上限與generation | challenge已有0至5次錯誤，含重寄新generation | 提出錯誤計數／重寄狀態轉換 | 每次錯誤原子累加至5並鎖定；重寄不清空，舊碼不復活；規劃條件更新而非記憶體count+1 |

### 1.6 Email Delivery

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/EmailDeliveryTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-016** `SendCode_UnpersistedOrUnapprovedChallenge_DoesNotInvokeSender` | PF-BDD-002、PF-BDD-040；PF-AC-004、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-031 | 寄送前持久化與受限範本 | challenge尚未持久化為active、錯用途／收件人，或limiter拒絕 | 嘗試寄碼 | 先通過限流並持久化active挑戰才呼叫email.code.send；僅允許固定挑戰收件人與註冊／重設範本，不接受任意from／to／HTML／subject |
| - [ ] **PF-UT-017** `SendCode_TenSecondTimeoutOrRegistrationSenderFailure_Returns503EmailDeliveryFailed` | PF-BDD-002、PF-BDD-040、PF-BDD-046；PF-AC-004、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-031 | 註冊寄信10秒逾時與503回應 | register_email首次請碼或resend，sender快速成功、回傳失敗或逾10秒timeout | 呼叫sender並處理結果 | sender逾時上限10秒，快速完成立即回202；註冊首次請碼與其resend遇sender失敗或逾時回503 EMAIL_DELIVERY_FAILED，挑戰保留供60秒冷卻後CAS產生新generation重寄並使舊碼作廢 |
| - [ ] **PF-UT-018** `SendCode_PasswordResetSenderFailure_ReturnsGeneric202AndLogsError` | PF-BDD-019、PF-BDD-040、PF-BDD-046；PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031 | 忘記密碼寄信失敗仍回同形202 | reset_password首次請碼或resend遭遇sender失敗或10秒timeout | 處理忘記密碼寄信異常並測試60秒冷卻重寄 | 忘記密碼request與resend遇sender失敗仍回同形通用202並記錄內部錯誤log，不向client暴露寄信失敗差異；60秒後重寄CAS遞增generation、保留failed_attempts與絕對期限 |

### 1.7 Password Recovery

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/PasswordRecoveryTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-019** `RequestReset_KnownUnknownOrExternalOnly_ReturnsSamePublicShape` | PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-077、PF-BDD-082；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030 | 忘記密碼隱私 | 已註冊／未知／Google-only的合法Email；全域sender設定相同 | 請求及重寄reset碼 | 已知／未知／Google-only均同形通用202；未知不寄且永不能完成。必要正常I/O完成即回、快成功不等待固定時窗；接受因sender必要I/O所剩timing差異，不新增固定5秒或其他延遲；全域未就緒先一致503 |
| - [ ] **PF-UT-020** `ResetPassword_ValidBoundChallenge_UpdatesCredentialAndRequiresLogin` | PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-039、PF-BDD-049、PF-BDD-078、PF-BDD-082；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030 | 正確重設／設定密碼 | 有效active reset挑戰綁Account及當前bound_credential_version，含無本地密碼帳號 | 建立account.reset-password批次命令並處理成功 | 同一D1 batch依挑戰active與bound_credential_version條件更新password_hash、將credential_version加1，最後一句消耗挑戰；保留Google綁定，舊family失效，不自動登入 |
| - [ ] **PF-UT-021** `ResetPassword_InvalidCodeOrChangedCredential_LeavesPasswordUntouched` | PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-039、PF-BDD-049、PF-BDD-078；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030 | 所有拒絕與結果不明 | 參數為錯碼、過期、錯purpose／flow、已消耗、無Account、cv已改 | 提交重設或處理回應遺失 | 拒絕且不修改密碼／不回顯存在性；不明先試新密碼，不自動重放或回滾 |

### 1.8 External Credential Validator Resolution

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/ExternalCredentialValidatorResolutionTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-022** `ResolveValidator_EnabledGoogle_SelectsOnlyRegisteredValidator` | PF-BDD-024、PF-BDD-030；PF-AC-002、PF-AC-018、PF-AC-019、PF-AC-034、PF-AC-035 | 通用IExternalCredentialValidator契約 | DI僅註冊google之IExternalCredentialValidator與固定平台client allowlist | 解析provider validator | 選取GoogleExternalCredentialValidator；通用DTO與資料表僅保存(provider, subject)，不把未註冊之Facebook標為可用 |
| - [ ] **PF-UT-023** `ResolveValidator_UnknownDisabledOrClientTrustOverride_RejectsInput` | PF-BDD-005、PF-BDD-030；PF-AC-019、PF-AC-021、PF-AC-032、PF-AC-034、PF-AC-035 | 拒絕未支援provider與信任注入 | 輸入facebook／未知provider或body自訂issuer／JWKS／audience／appID／owner | 解析請求 | 回400 UNSUPPORTED_PROVIDER或欄位錯誤400；不呼叫任意URL，不以clientPlatform擴大audience/azp信任 |
| - [ ] **PF-UT-024** `MapVerifiedIdentity_CaseSensitiveSubjectAndNormalizedEmail_PreservesStableKey` | PF-BDD-030；PF-AC-034、PF-AC-035 | 穩定外部身分鍵 | validator已驗證issuer、subject與Email | 映射VerifiedExternalIdentity(Provider, Subject, EmailNormalized) | Google合法issuer驗證通過，sub保留原始大小寫，Email走共用正規化；僅以(Provider, Subject)識別外部身分，不保存姓名／頭像作化身 |

### 1.9 Google Credential Validation

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Security/GoogleCredentialValidatorTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-025** `ValidateGoogle_ValidSignatureIssuerAndAudience_ReturnsVerifiedIdentity` | PF-BDD-005、PF-BDD-007、PF-BDD-017、PF-BDD-029；PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-023、PF-AC-032、PF-AC-034、PF-AC-035 | Google簽章與來源 | 受控JWKS與各平台正確GoogleIDToken | 驗證RS256、issuer、audience、必要azp、exp／iat | 精確allowlist均通過才回已驗證身分；非RS256、錯JWKS金鑰／簽章／來源／對象／時效逐一拒絕 |
| - [ ] **PF-UT-026** `ValidateGoogle_InvalidSubjectEmailOrUntrustedDomain_RejectsCredential` | PF-BDD-005、PF-BDD-007、PF-BDD-017、PF-BDD-029；PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-023、PF-AC-032、PF-AC-034、PF-AC-035 | Google必要claim與可信Email網域 | 參數為空sub、email_verified=false、非法Email、非ID Token，或Email網域非gmail.com且token之hd不等於Email網域 | 驗證credential | 基本claim無效回401 EXTERNAL_CREDENTIAL_INVALID；非gmail.com且無相符hd回401 EXTERNAL_EMAIL_UNTRUSTED；gmail.com或hd等於Email網域才通過 |
| - [ ] **PF-UT-027** `ValidateGoogle_ReusedUnexpiredProofWithoutServerNonce_AllowsRevalidation` | PF-BDD-017、PF-BDD-029；PF-AC-020、PF-AC-021、PF-AC-032、PF-AC-034、PF-AC-035 | 已確認簡化方案 | 同一份仍有效GoogleIDToken重複提交，無應用servernonce | 再次驗證 | 有效Googleproof可重用、無servernonce／auth_challenges；每次成功登入依共用單一登入原子撤舊family(reason=replaced_by_login)，不因proof本身重用判reuse；Email／Refresh單次性獨立保留 |

### 1.10 External Sign In

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/ExternalSignInTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-028** `CompleteExternalSignIn_ExistingIdentityAndMatchingEmail_CreatesSession` | PF-BDD-007、PF-BDD-017、PF-BDD-031；PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-023、PF-AC-027、PF-AC-028、PF-AC-032、PF-AC-034、PF-AC-035 | 既有Google登入 | 已驗(google, sub)屬既有Active Account且verified Email相符 | 執行第三方登入 | 回200與原Account ID；同一D1 batch條件撤銷舊family並建新family與Refresh；失敗不踢舊登入 |
| - [ ] **PF-UT-029** `CompleteExternalSignIn_NewIdentityAndTrustedUnusedEmail_CreatesAccountAndSessionDirectly` | PF-BDD-005、PF-BDD-017、PF-BDD-031；PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-032、PF-AC-034、PF-AC-035 | 首次Google直接建帳 | credential有效、Email網域可信（gmail.com或相符hd）且(google, sub)與Email均未註冊 | 執行account.register-external | 回201，同一D1 batch直接建立無本地密碼Active Account、auth_external_identities(google, sub)、family與generation0 Refresh，不需Email驗證碼挑戰 |
| - [ ] **PF-UT-030** `CompleteExternalSignIn_EmailOrIdentityConflict_RejectsAutomaticMerge` | PF-BDD-005、PF-BDD-031、PF-BDD-033；PF-AC-004、PF-AC-019、PF-AC-021、PF-AC-022、PF-AC-027、PF-AC-032、PF-AC-034、PF-AC-035 | Email／subject防重 | 新subject使用已存在Email、既有subjectEmail已改或identity屬他人 | 執行登入／確認 | 分別EMAIL_ALREADY_REGISTERED／EXTERNAL_EMAIL_CHANGED或ownership衝突；不搬移、合併或重建Account |

### 1.11 External Identity Management

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Domain/ExternalIdentityManagementTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-031** `LinkIdentity_AuthenticatedOwnerAndMatchingTrustedEmail_LinksWithoutPasswordOrReLogin` | PF-BDD-012、PF-BDD-013、PF-BDD-014、PF-BDD-018、PF-BDD-032、PF-BDD-033、PF-BDD-034、PF-BDD-081；PF-AC-002、PF-AC-007、PF-AC-008、PF-AC-021、PF-AC-022、PF-AC-030、PF-AC-034、PF-AC-035 | 本人已登入直接連結 | 有效Access／family且Google credential具可信網域並與本人Email相同 | 驗連結前提並建立identity.external.link命令 | owner只取自CurrentUser；不需currentPassword、不增加credential_version、不撤銷目前family，回200 {provider, linked: true} |
| - [ ] **PF-UT-032** `ManageIdentity_EmailMismatchOwnerConflictOrLastMethod_RejectsMutation` | PF-BDD-013、PF-BDD-014、PF-BDD-018、PF-BDD-032、PF-BDD-033、PF-BDD-034、PF-BDD-081；PF-AC-002、PF-AC-007、PF-AC-021、PF-AC-022、PF-AC-034、PF-AC-035 | 所有權與最後方式 | Email不同、identity屬他人、同Account不同同provider，或解除後無登入方式 | 請求連結／解除 | 回EXTERNAL_EMAIL_MISMATCH／EXTERNAL_IDENTITY_IN_USE／LAST_LOGIN_METHOD；不搬移identity、不刪最後方式 |
| - [ ] **PF-UT-033** `ManageIdentity_SameIdentityLinkOrPasswordVerifiedUnlink_AppliesCorrectSessionPolicy` | PF-BDD-013、PF-BDD-014、PF-BDD-018、PF-BDD-081；PF-AC-002、PF-AC-007、PF-AC-022、PF-AC-034、PF-AC-035 | 連結冪等與解除撤銷 | 同(provider, subject)已連結、新連結，或已設本地密碼執行解除綁定 | 執行連結／解除規則 | 新連結與同identity重複連結均回200 {provider, linked: true}且不增cv、不踢登出；解除綁定須驗currentPassword並原子將cv加1使全部舊family失效 |

### 1.12 Session Creation and Lifetime

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/SessionCreationTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-034** `CreateSession_SequentialOrConcurrentSuccessfulLogins_KeepsOnlyLastCommittedFamily` | PF-BDD-004、PF-BDD-007、PF-BDD-055；PF-AC-003、PF-AC-005、PF-AC-007、PF-AC-019、PF-AC-021、PF-AC-023、PF-AC-034 | 新登入立即取代舊裝置 | 同Account既有唯一active與歷史revoked family；Email／Google已驗成功，含兩個新登入並行 | 先完成pair隨機值與HS256簽署而不曝光；同一D1 batch撤銷全部revoked_at IS NULL舊列（reason=replaced_by_login），再依Account active與cv條件建新family（受partial UNIQUE保護）與generation0 Refresh | 正常登入不寫auth_accounts、不加cv；成功commit後最後一個唯一有效，commit前失敗保舊；舊UI於下次API或回前景核驗時提示 |
| - [ ] **PF-UT-035** `CalculateExpiry_AbsoluteIdleAndAccessBoundaries_ClampsDeadlines` | PF-BDD-004、PF-BDD-008、PF-BDD-053、PF-BDD-055；PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-023、PF-AC-024 | 10分鐘／30日／7日 | 固定clock，建立時點與refresh時點含精確到期 | 計算family與Access期限 | 絕對30日、idle7日；refresh只更新idle且不超絕對；Access不超10分鐘或family當前到期，family時間嚴格判定 |
| - [ ] **PF-UT-036** `CreateSession_ZeroRowsDisabledOrChangedCredential_IssuesNoPair` | PF-BDD-055；PF-AC-007 | 建立競態拒絕 | Active Account在提交前disabled／credential_version變動，或batch內新family／Refresh寫入SQL失敗／UNIQUE衝突 | 處理session.create結果 | 條件不符時新family與Refresh插入0列、SQL錯誤或UNIQUE衝突時整批回滾保留原有效family，绝不核發token pair |

### 1.13 Access Token and CurrentUser

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Security/AccessTokenValidationTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-037** `ValidateAccess_RequiredClaimsSecretAndTimes_RequiresPlatformHs256Jwt` | PF-BDD-009、PF-BDD-035、PF-BDD-053；PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-009、PF-AC-016、PF-AC-023、PF-AC-034 | 平台HS256 JWT完整驗證 | 各參數缺iss／aud／sub／sid／cv／jti／iat／nbf／exp、錯typ／alg（如none或RS256）、錯ACCESS_TOKEN_SECRET簽章與時間 | 驗證HS256 at+jwt | 只接受固定issuer／audience與單一ACCESS_TOKEN_SECRET之HS256簽章，最多30秒時間偏差；Google token／Refresh／none等一律拒絕 |
| - [ ] **PF-UT-038** `ValidateAccess_RevokedExpiredDisabledOrChangedFamily_RejectsStillValidJwt` | PF-BDD-009、PF-BDD-015、PF-BDD-035、PF-BDD-053、PF-BDD-076、PF-BDD-086、PF-BDD-090；PF-AC-002、PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-009、PF-AC-016、PF-AC-020、PF-AC-022、PF-AC-023、PF-AC-025、PF-AC-026、PF-AC-034 | D1 family權威與X-DatingHigh-Session標頭 | JWT未到期但family已撤銷／過期／被新登入取代、Account停用／cv不符 | 查詢D1 primary建立CurrentUser並輸出標頭 | 每次D1 primary核驗family與cv，被取代/撤銷/cv不符回401 SESSION_REVOKED；有效登入回應附X-DatingHigh-Session: <sessionId>供前端同步狀態 |
| - [ ] **PF-UT-039** `ProjectSession_ValidOwnerContext_ExposesOnlySafeMetadata` | PF-BDD-009、PF-BDD-035、PF-BDD-079；PF-AC-002、PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-009、PF-AC-016、PF-AC-023、PF-AC-034 | 本人查詢投影 | 已驗CurrentUser及本人Account／identity集合 | 投影session、me與identities | 相同Account ID；GET不回raw token，identity摘要不回外部subject或Email；不接受owner覆寫 |

### 1.14 Refresh Rotation

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/RefreshSessionTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-040** `RefreshSession_CurrentTokenAndValidFamily_BuildsConditionalSuccessor` | PF-BDD-008、PF-BDD-051、PF-BDD-052；PF-AC-006、PF-AC-007、PF-AC-023、PF-AC-024、PF-AC-026 | 原子輪替計畫 | 已驗Refresh hash歸屬、平台與current_generation且取得額度 | 建立session.refresh同batch更新與UNIQUE(session_id, generation)後繼插入 | 產生唯一generation+1後繼並標記前token consumed_at與replaced_by_token_id；前置條件0列或SQL衝突不核發pair |
| - [ ] **PF-UT-041** `RefreshSession_ConsumedToken_HandlesGraceRetryConflictAndReuseRevocation` | PF-BDD-008、PF-BDD-051；PF-AC-006、PF-AC-023、PF-AC-024、PF-AC-026 | 30秒寬限窗與逾時重放撤銷 | 已消耗Refresh分為：① consumed_at 30秒內且為緊接前一代（generation=current-1）、② 30秒內非緊接前一代或並行落敗、③ 逾30秒重放（含session額度已滿） | 判定已消耗token分支 | ① 視為回應遺失重試，從目前head再輪替一次回200；② 回409 REFRESH_RETRY不撤銷；③ 逾30秒不受session額度阻擋，回401 REFRESH_TOKEN_REUSE並持久撤銷原family（不影響其他新family） |
| - [ ] **PF-UT-042** `RefreshSession_DependencyOrResponseUnknown_RecoversSafelyWithGraceOrSessionCheck` | PF-BDD-008、PF-BDD-021、PF-BDD-051、PF-BDD-052；PF-AC-006、PF-AC-007、PF-AC-023、PF-AC-024、PF-AC-025、PF-AC-026 | 故障與網路結果不明 | D1失敗或refresh提交後網路回應遺失 | 處理失敗／恢復策略 | D1失敗回503不發pair；回應遺失時Web可先GET /session唯讀確認或於30秒寬限內重試，原生寫入後繼成功才覆寫原token |

### 1.15 Platform Transport

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Api/TokenTransportPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-043** `SelectTransport_WebCookieOrNativeBearer_FollowsTwoTransportRules` | PF-BDD-004、PF-BDD-025、PF-BDD-036；PF-AC-003、PF-AC-004、PF-AC-005、PF-AC-016、PF-AC-023 | 兩條平台傳輸規則 | clientPlatform=web（帶Origin）或clientPlatform=ios/android（無Origin） | 依clientPlatform選擇憑證來源 | web只讀平台HttpOnly Cookie（忽略Authorization與body refreshToken），ios/android只讀Bearer與body refreshToken（忽略Cookie）；僅原生回傳raw token pair |
| - [ ] **PF-UT-044** `SelectTransport_OriginWithNonWebPlatform_RejectsRequest` | PF-BDD-025、PF-BDD-036；PF-AC-004、PF-AC-005、PF-AC-016、PF-AC-023 | 防瀏覽器偽裝原生平台 | 請求帶有Origin標頭但clientPlatform指定為ios或android | 解析傳輸規則1 | 帶Origin之請求一律視為web傳輸，clientPlatform!=web回400且不執行handler，防止瀏覽器腳本騙取JSON明文token |
| - [ ] **PF-UT-045** `SelectCredential_WrongTokenKindOrDifferentLogoutFamilies_RejectsAuthorization` | PF-BDD-036；PF-AC-005、PF-AC-023 | token類型與登出一致性 | Refresh當Bearer、Access送refresh、Google作平台憑證或logout兩憑證不同family | 驗證endpoint憑證規則 | 拒絕錯類型／混用；logout可識別過期／consumedRefresh僅撤銷，不授其他操作 |

### 1.16 Web Origin and Cookie

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Api/WebRequestPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-046** `ValidateWebMutation_ExactOriginJsonAndClientHeader_RequiresAllGuards` | PF-BDD-037；PF-AC-005、PF-AC-020 | Web CSRF政策 | 註冊／登入／refresh／復原／連結／解除／登出請求 | 逐一移除或替換Origin、JSON Content-Type、X-DatingHigh-Client:web | 任一不符拒絕；第三方提交無callbackGET／表單POST例外 |
| - [ ] **PF-UT-047** `EvaluateCors_AllowedPreflight_ReturnsOnlyExplicitPermissions` | PF-BDD-037；PF-AC-005、PF-AC-020 | CORS與OPTIONS | 白名單與非白名單Origin的OPTIONS，無AccessToken | 產生preflight決策 | 只放行設定來源／方法／headers；不要求Access；禁止帶credentials的wildcard |
| - [ ] **PF-UT-048** `WriteCookiesAndSessionHeader_CloudOrLocalEnvironment_UsesProtectedPairAndExposesSession` | PF-BDD-004、PF-BDD-037；PF-AC-003、PF-AC-005、PF-AC-020、PF-AC-023 | Cookie成對與X-DatingHigh-Session標頭 | 成功建立／refresh、已登入API及登出，環境含本地HTTP與雲端HTTPS | 產生Cookie與回應標頭 | 雲端__Host pair為HttpOnly/Secure/Strict/Path=/無Domain，local用dev名稱；已登入回應附X-DatingHigh-Session且CORS暴露該標頭 |

### 1.17 Logout and Revocation

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/LogoutTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-049** `RevokeSession_CurrentOrReplacedFamily_NeverRevokesLatestOtherFamily` | PF-BDD-015、PF-BDD-021、PF-BDD-022、PF-BDD-054、PF-BDD-090；PF-AC-002、PF-AC-006、PF-AC-007、PF-AC-024、PF-AC-025、PF-AC-026 | 只撤所持憑證對應family | 同Account一個最新有效family與歷史replaced_by_login family，輸入各自可識別Access/Refresh | 執行session.revoke | 只撤憑證對應之目標family並回204，舊裝置logout絕不撤銷最新有效family；無憑證或已撤銷保持冪等204 |
| - [ ] **PF-UT-050** `RevokeSession_ExpiredConsumedAbsentOrAlreadyRevoked_RemainsSafeAndIdempotent` | PF-BDD-015、PF-BDD-054；PF-AC-006、PF-AC-007、PF-AC-024、PF-AC-026 | 失效憑證撤銷邊界 | 過期／consumedRefresh可識別，或無憑證／已撤銷 | 請求登出 | 過期／consumed Refresh僅可撤其原family，無憑證／已撤銷204；舊family操作不影響最新登入；被撤family新舊pair拒絕，不登出Google／解除綁定 |
| - [ ] **PF-UT-051** `HandleLogout_NetworkFailure_PreservesRevocationOnlyRecovery` | PF-BDD-022、PF-BDD-090；PF-AC-002、PF-AC-007、PF-AC-025 | 失敗待撤銷重試 | server撤銷未確認，等待重試間另一裝置可能已成功新登入 | 更新client狀態並於下次啟動重試撤銷 | 隱藏私人畫面並保留僅供revoke重試之原family憑證，不先refresh；重試成功回204後清除本機狀態且不影響另一裝置之新family |

### 1.18 Resource and Private Object Authorization

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Security/ResourceAccessPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-052** `AuthorizeResource_ValidatedCurrentUser_DerivesOwnerFromContext` | PF-BDD-009、PF-BDD-016、PF-BDD-043、PF-BDD-079；PF-AC-002、PF-AC-003、PF-AC-009、PF-AC-014、PF-AC-016、PF-AC-023、PF-AC-034 | 本人與object owner | A／B兩帳號與已驗CurrentUser | 要求me或private put/get/delete | owner只能衍生自Access／family；body／query owner不授權，不能讀寫B的物件 |
| - [ ] **PF-UT-053** `AuthorizeResource_UnknownTypeOrMissingParticipantPolicy_DeniesAccess` | PF-BDD-016、PF-BDD-043；PF-AC-009、PF-AC-014、PF-AC-016 | 未來資源預設拒絕 | 未知資源種類或尚未有參與者policy | 檢查存取 | 預設拒絕，不用所有登入者皆可的stub；不實作配對／照片公開規則 |
| - [ ] **PF-UT-054** `BuildPrivateKey_TraversalOrInvalidPurpose_RejectsUntrustedPath` | PF-BDD-016、PF-BDD-043；PF-AC-009、PF-AC-014、PF-AC-016 | 私人R2 key限制 | purpose／objectId含../、分隔符、編碼跳脫或他人prefix | 生成key | 拒絕非法；合法key為private/{verifiedAccountId}/{purpose}/{objectId}，probe不成授權捷徑 |

### 1.19 RateLimit Policies and Call Sites

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/RateLimitPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-055** `ResolveRatePolicy_NineAuthenticationEntries_UsesStaticRateLimitPolicies` | PF-BDD-002、PF-BDD-028、PF-BDD-056、PF-BDD-057；PF-AC-004、PF-AC-016、PF-AC-017、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-036 | 靜態常數表九筆額度 | 靜態常數表RateLimitPolicies含寄碼email 5/ip 30每小時；驗碼email 10、登入email 10/ip 60、external（登入與連結）ip 30、敏感變更（改密碼與解除綁定）account 10每15分鐘；refresh session 10/ip 120每分鐘 | 解析各policy_key與subject_type | 九項時窗／上限正確；包含無帳號及失敗嘗試 |
| - [ ] **PF-UT-056** `ConsumeRatePolicy_UnknownPolicySubjectOrClientQuota_RejectsConfiguration` | PF-BDD-056、PF-BDD-059；PF-AC-017、PF-AC-036 | 靜態政策邊界與輸入拒絕 | 未知policy_key、該政策不允許的subject_type、client自訂windowMs／limit／bucketId | 呼叫TryConsumeAsync与rate-limit.consume驗證 | 嚴格拒絕未知policy_key、不符的subject_type與自訂額度參數且不回Allowed；合法政策跨受信任入口共用原子計數 |
| - [ ] **PF-UT-057** `RunProtectedAction_DeniedOrFailedAttempt_StopsSideEffectWithoutRefund` | PF-BDD-002、PF-BDD-028、PF-BDD-056、PF-BDD-057；PF-AC-004、PF-AC-016、PF-AC-017、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-036 | 取得額度才執行 | 任一適用bucket超限或後續業務失敗 | 執行寄碼／驗密碼／驗碼／external驗證／refresh用例 | 一次HTTP操作按bucket descriptor去重，先計IP再計尚未扣的可信subject，每bucket只扣一次；任一超限即停止後續sender／validator／rotation，已取得計數不退還 |

### 1.20 RateLimit Subjects and HMAC

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Security/RateLimitSubjectTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-058** `HashSubject_PipeDelimitedCanonicalInput_ProducesStableHmacInDotNet` | PF-BDD-057、PF-BDD-058；PF-AC-017、PF-AC-028、PF-AC-036 | .NET統一計算subject_hash | 單一RATE_LIMIT_HMAC_KEY與canonical_subject（正規化Email、正規化IPv4/IPv6、小寫UUIDv7） | 由.NET計算lowercaseHex(HMAC-SHA256(key, UTF8("v1|" + APP_ENV + "|" + subject_type + "|" + canonical_subject))) | 相同環境／subject_type／canonical_subject雜湊穩定且跨環境隔離，D1不存raw Email或raw IP |
| - [ ] **PF-UT-059** `ResolveSubject_WorkerTrustedClientIpAndVerifiedEntities_RejectsUntrustedInput` | PF-BDD-058、PF-BDD-059；PF-AC-017、PF-AC-036 | Worker可信IP標頭與對象來源 | Worker正規化連線IP後以X-DatingHigh-Internal-Client-Ip傳給.NET；外部偽造XFF或client自報Account/session ID | 解析各限流subject | IP僅信Worker清除外部標頭後注入之X-DatingHigh-Internal-Client-Ip；resend/verify由挑戰取Email；Account/session僅取自已驗證憑證，拒絕client自報ID |
| - [ ] **PF-UT-060** `SelectBucket_SamePolicySubjectWindow_PreservesUniqueBucketAndRotationSemantics` | PF-BDD-058、PF-BDD-059；PF-AC-017、PF-AC-036 | bucket自然唯一鍵與秘密輪替 | 同policy_key/subject_type/subject_hash/window_start_ms併發UPSERT，或更換RATE_LIMIT_HMAC_KEY | 執行單句ON CONFLICT原子累加並測試秘密更換 | 併發請求命中同一bucket並保留原bucket_id；直接更換RATE_LIMIT_HMAC_KEY時以新hash建立新bucket（接受現有視窗額度重置），無需雙key過渡 |

### 1.21 RateLimit Window and Faults

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/RateLimitWindowTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-061** `CalculateWindow_ExactBoundary_CreatesNextFixedWindow` | PF-BDD-060、PF-BDD-084；PF-AC-002、PF-AC-017、PF-AC-028、PF-AC-036 | 固定視窗邊界 | now位於視窗末毫秒及下視窗起點 | 計floor(nowMs/windowMs)*windowMs | 新window可用且不等cleanup；不宣稱滑動時窗限制 |
| - [ ] **PF-UT-062** `EvaluateCounts_OverLimitMultipleBuckets_ReturnsSaturatedRetryAfter` | PF-BDD-060、PF-BDD-084；PF-AC-002、PF-AC-017、PF-AC-028、PF-AC-036 | 飽和與429 | 各bucket回limit／limit+1及不同expiresAt | 計拒絕與Retry-After | count>limit拒絕；飽和limit+1；超限取最晚到期ceil秒至少1；已記次數不回滾 |
| - [ ] **PF-UT-063** `ConsumeAndCleanup_DependencyFailureOrExpiredBuckets_FailsClosedAndBoundsWork` | PF-BDD-041、PF-BDD-060；PF-AC-013、PF-AC-015、PF-AC-017、PF-AC-024、PF-AC-036 | 限流故障與清理 | D1結果不明、container休眠及>1000 backlog | Worker scheduled handler驅動固定cleanup command，在執行預算內多個有界批次 | consume故障503無Allowed／副作用；scheduled不靠容器timer，單批≤1000、可重試並記backlog；新視窗不等cleanup |

### 1.22 Schema and Naming Contract

**位置（組內每案）**：`cloudflare/tests/foundation-schema-policy.test.ts`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-064** `ValidateSchema_SixTablesFiftyFourColumnsAndFirstColumnIds_PreservesConfirmedStructure` | PF-BDD-061、PF-BDD-062；PF-AC-033、PF-AC-035、PF-AC-037 | 六表54欄／第一欄UUIDv7 | 讀取規劃migration schema描述 | 驗auth_accounts(8)／auth_external_identities(5)／auth_sessions(10)／auth_refresh_tokens(8)／auth_email_challenges(16)及common_rate_limit_buckets(7) | 各表第一欄單欄NOT NULL UUIDv7 PK、合計54欄；後端拒絕錯格式或非v7 ID |
| - [ ] **PF-UT-065** `ValidateRelations_NaturalUniquenessAndForeignKeys_PreservesBusinessConstraints` | PF-BDD-061、PF-BDD-062、PF-BDD-064；PF-AC-011、PF-AC-016、PF-AC-033、PF-AC-035、PF-AC-037 | 自然唯一約束 | schema與固定SQL／索引／wrapper alias映射 | 檢查email_normalized、(provider, subject)、(account_id, provider)、token_hash、(session_id, generation)、flow_token_hash與bucket四欄 | 完整UNIQUE/FK與BINARY subject、完整命名映射；auth_sessions具UNIQUE partial index(account_id) WHERE revoked_at IS NULL，alias不動態拼接表名 |
| - [ ] **PF-UT-066** `ValidateDependencies_ForbiddenTablesOrGuidSecrets_RejectsPlan` | PF-BDD-061、PF-BDD-062；PF-AC-033、PF-AC-035、PF-AC-037 | 已確認禁用項與秘密 | 依賴／migration／DTO含或不含Identity、EF、auth_challenges、platform_metadata及GUID化秘密 | 做靜態policy檢查 | 禁用項拒絕；工具migration history保留；Flow／Refresh仍32-byte隨機；不建其他七份業務表 |

### 1.23 Worker Routing and Commands

**位置（組內每案）**：`cloudflare/tests/platform-boundary.test.ts`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-067** `DispatchCommand_UnknownSqlOrExtraPrivilege_RejectsUntrustedInput` | PF-BDD-016、PF-BDD-025、PF-BDD-042、PF-BDD-062、PF-BDD-066；PF-AC-004、PF-AC-005、PF-AC-009、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-016、PF-AC-029、PF-AC-035、PF-AC-037 | 固定command DTO | 未知command、任意SQL／table／bucket、額外權限欄位、超16KiB／重複JSON／錯型別 | 解析並dispatch | 未知／非法欄位400或拒絕、超體積413；prepared固定SQL，不用跨HTTP BEGIN／COMMIT；秘密不回ProblemDetails |
| - [ ] **PF-UT-068** `RoutePublicRequest_ApiHealthInternalAndSpoofedContext_EnforcesBoundary` | PF-BDD-042、PF-BDD-066；PF-AC-013、PF-AC-015、PF-AC-016、PF-AC-029 | 公網信任邊界 | API／health／internal及合法前端路由，外部X-DatingHigh-Internal-* | 執行Worker路由policy | 清外部信任標頭，internal拒絕；未知API JSON404不回SPA；合法前端fallback；container僅binding到8080 |
| - [ ] **PF-UT-069** `MapFailure_DependencyStartupOrUnknownError_ReturnsSanitizedProblem` | PF-BDD-025、PF-BDD-041、PF-BDD-042；PF-AC-004、PF-AC-005、PF-AC-013、PF-AC-015、PF-AC-016、PF-AC-017、PF-AC-024 | 故障投影 | bridge／D1／R2timeout、container啟動超時、未知例外 | 轉HTTPerror | 503 DEPENDENCY_UNAVAILABLE／504 STARTUP_TIMEOUT／500；application/problem+json含traceId，無body／Cookie／SQL／secret |

### 1.24 Local Environment Wrappers

**位置（組內每案）**：`scripts/tests/local-instance-policy.test.ts`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-070** `ResolveLocalInstance_DifferentWorkingDirectories_ReturnsSameAbsoluteState` | PF-BDD-063；PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-026 | 固定磁碟目錄 | 從專案根與另一cwd呼叫default wrapper | 解析root/config/cwd/state | 皆指向datinghigh/cloudflare及其.wrangler/state；restoreinstance指向自己的固定config目錄 |
| - [ ] **PF-UT-071** `ParseLocalCommand_RemoteConfigOrUnknownAlias_RejectsUnsafeSelection` | PF-BDD-064；PF-AC-011、PF-AC-016、PF-AC-037 | 本地操作界線 | remote／production／任意config、未知instance／view及shell特殊字元 | 解析migrate／seed／query／execute參數 | 僅已知localinstance；固定accounts／sessions view；自訂SQL僅executefile／stdin，不拼shell字串 |
| - [ ] **PF-UT-072** `BuildLocalInvocation_RestartAndDatabaseCommands_UseOneBinding` | PF-BDD-063、PF-BDD-064；PF-AC-006、PF-AC-010、PF-AC-011、PF-AC-014、PF-AC-016、PF-AC-026、PF-AC-037 | 查改與持久化接線 | 同instance啟停、migrate／seed／execute／export／probe | 形成工具invocation | 使用同cwd/config/localDB binding；不建立第二可寫資料庫，不修改活躍emulator WAL；不把配置存在當持久化證據 |

### 1.25 Backup Restore Policy

**位置（組內每案）**：`scripts/tests/local-backup-policy.test.ts`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-073** `ValidateBackupName_ExistingOrEscapingPath_RejectsOverwrite` | PF-BDD-065；PF-AC-012 | 備份安全檔名 | 同名已存在、../、絕對路徑與合法名稱 | 解析output | 只允許.local/backups安全檔名；不覆寫或跳出專案，備份忽略Git |
| - [ ] **PF-UT-074** `ValidateRestoreTarget_NewBoundedInstance_RequiresEmptyLocalDestination` | PF-BDD-065；PF-AC-012 | 新instance要求 | target符合或不符[a-z0-9-]{1,32}、已存在或指向remote | 驗restore目標與config | 只新localinstance可用，原instance保留，所有wrapper用相同instance映射 |
| - [ ] **PF-UT-075** `PlanSnapshotRestore_ActiveWrites_UsesConsistentExportAndValidation` | PF-BDD-065；PF-AC-012 | 一致備份／驗還原 | 本地有寫入並請求backup／restore | 產生操作順序 | 先暫停寫入再wranglerlocalexport且完成恢復；restore核schema／約束／Account，不直接複製活WAL、不選正式資源 |

### 1.26 Readiness and Deployment Policy

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Infrastructure/ReadinessPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-076** `EvaluateReady_EnvironmentSchemaSecretsAndSender_RequiresAllDependencies` | PF-BDD-041、PF-BDD-066、PF-BDD-093；PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-017、PF-AC-019、PF-AC-024、PF-AC-026、PF-AC-029 | ready必要條件 | 參數逐項缺schema／migration／R2 probe／環境秘密（ACCESS_TOKEN_SECRET、EMAIL_CODE_HMAC_KEY、RATE_LIMIT_HMAC_KEY）／sender、server Log模式或loopback bridge | 判ready | 缺項或秘密不足32 bytes回503；server不降級log；只回unavailable/traceId；不每次寄信、不建metadata表 |
| - [ ] **PF-UT-077** `PreflightDeployment_TargetBindingsOrVersionMismatch_StopsRelease` | PF-BDD-066、PF-BDD-093；PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-019、PF-AC-026、PF-AC-029 | 部署目標與相容性 | 候選cloudaccount／D1ID／R2／origin、不可變build及migration相容範圍 | 比較安全設定與實際接線 | 錯環境／不相容migration停止；同schema不證明資源正確；記錄lockfile、digest、buildID |
| - [ ] **PF-UT-078** `PlanRollback_CompatibleArtifactsOrDataRestore_SeparatesOperations` | PF-BDD-066、PF-BDD-093；PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-019、PF-AC-026、PF-AC-029 | 發布與回復 | 部分migration已成功、版本故障，或資料需還原 | 產回復計畫 | 只回相容Worker／container／assets；不假設前migration自動回滾、不清資料；D1還原需具體損失方案，production狀態另列 |

### 1.27 Keys and Retention

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Security/KeyRingRetentionTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-079** `LoadSecrets_RestartWithUnexpiredArtifacts_RetainsSymmetricSecrets` | PF-BDD-063、PF-BDD-067；PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-026、PF-AC-028 | 重啟秘密穩定 | 同環境持久注入ACCESS_TOKEN_SECRET、EMAIL_CODE_HMAC_KEY、RATE_LIMIT_HMAC_KEY（各≥32 bytes），尚有未過期HS256 Access與EmailChallenge | 重啟載入環境秘密 | 不隨啟動隨機重造；既有HS256 Access、EmailChallenge與限流bucket在重啟後持續有效 |
| - [ ] **PF-UT-080** `RotateSecret_AccessCodeOrRateLimitSecretChanged_AppliesDefinedInvalidation` | PF-BDD-067；PF-AC-006、PF-AC-026、PF-AC-028 | 單一對稱秘密輪替語意 | 分別更換ACCESS_TOKEN_SECRET、EMAIL_CODE_HMAC_KEY或RATE_LIMIT_HMAC_KEY | 驗證既有Access、未完成EmailChallenge與限流bucket行為 | 更換ACCESS_TOKEN_SECRET使舊Access立即回401並由有效Refresh換發新Access；更換EMAIL_CODE_HMAC_KEY使未完成挑戰驗碼失敗須重請；更換RATE_LIMIT_HMAC_KEY重置視窗額度 |
| - [ ] **PF-UT-081** `CleanupArtifacts_ExpiredRetentionBoundaries_UsesOrderedBoundedBatches` | PF-BDD-067；PF-AC-006、PF-AC-026、PF-AC-028 | 清理期限與外鍵順序 | Email絕對到期、Refreshfamily絕對到期及self-reference lineage | 計cleanupeligibility／排序 | Worker scheduled在容器睡眠也驅動cleanup；Email24h／family+7d保留，selfreference/records先family後；>1000 backlog於預算分批每批≤1000、記backlog/可重試且不刪有效資料 |

### 1.28 Client Entry and Visual Policy

**位置（組內每案）**：`apps/client/tests/unit/foundation-entry.test.tsx`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-082** `RenderFoundation_PrototypeTokensAndResponsiveLayout_ProvidesUsableControls` | PF-BDD-024、PF-BDD-068；PF-AC-002、PF-AC-003、PF-AC-018、PF-AC-019 | 原型風格及版面 | 小螢幕／大螢幕、keyboard／safearea環境 | 呈現共用background／glasspanel／button／form | 使用rose／plum／gold既定token，單欄可捲動、鍵盤不遮操作，無固定700px裁切 |
| - [ ] **PF-UT-083** `OpenEntry_VerifiedSessionOrMissingCredentials_UsesTrustedNavigation` | PF-BDD-068；PF-AC-002、PF-AC-003 | 開始頁可信登入 | 本機假已登入布林、有效session回應或缺憑證 | 啟動入口恢復 | 只有server驗證後進本人頁；無憑證顯Email／Google入口；不展示固定demo帳號 |
| - [ ] **PF-UT-084** `RenderAccessibility_KeyboardFocusReducedMotionOrGoogleUnavailable_PreservesAccess` | PF-BDD-024、PF-BDD-068；PF-AC-002、PF-AC-003、PF-AC-018、PF-AC-019 | 可操作性與替代登入 | Web鍵盤、讀屏label、減少動態或Google未配置 | 操作入口與欄位 | 可見focus／label、錯誤不僅顏色、減少動態；Google明示暫不可用且Email可操作，Google驗收仍未完成 |

### 1.29 Client Forms

**位置（組內每案）**：`apps/client/tests/unit/auth-forms.test.tsx`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-085** `SubmitAuthForm_InvalidFieldsOrRepeatedClicks_SendsAtMostOneValidRequest` | PF-BDD-070、PF-BDD-071、PF-BDD-074、PF-BDD-083；PF-AC-002、PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-025、PF-AC-027、PF-AC-028 | 表單與重複提交 | Email／login／forgot／reset表單含缺欄位、確認密碼不符或pending | 提交／重複點擊 | 就地可讀錯誤、pending禁重複；不以client驗證替代server；reset確認欄不重複送API |
| - [ ] **PF-UT-086** `DisplayAuthFailure_DuplicateEmailOrInvalidCredentials_UsesDefinedMessage` | PF-BDD-070、PF-BDD-071、PF-BDD-074、PF-BDD-077；PF-AC-002、PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-027、PF-AC-028、PF-AC-030 | 身份錯誤文案 | EMAIL_ALREADY_REGISTERED、INVALID_CREDENTIALS或resetrequest202 | 套用server結果 | 重複Email提示改原方式登入／連結；錯密碼與未知Email相同『Email 或密碼不正確』；forgot顯『若此 Email 可處理，將收到驗證碼』 |
| - [ ] **PF-UT-087** `CompleteAuthForm_ConfirmedResult_NavigatesWithoutPrematureLogin` | PF-BDD-070、PF-BDD-071、PF-BDD-074、PF-BDD-077、PF-BDD-078、PF-BDD-091；PF-AC-002、PF-AC-004、PF-AC-008、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-030 | 成功導頁 | Email請碼202、Email確認201、首次Google直接建帳201／既有Google 200／帳密登入201、reset 204 | 處理提交結果 | Email請碼到/verify-email或/reset-password；Email確認201、Google 200/201或帳密201建立session後進/account；reset 204回/login |

### 1.30 Client Verify Email

**位置（組內每案）**：`apps/client/tests/unit/email-verification.test.tsx`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-088** `RenderVerification_EmailRegistrationAndReset_PreservesLeadingZerosAndPasswordFields` | PF-BDD-071、PF-BDD-072；PF-AC-002、PF-AC-004、PF-AC-028、PF-AC-030 | 驗碼頁欄位與前導零 | register_email或reset_password挑戰metadata與遮罩Email | 輸入000001並填寫密碼與確認密碼 | 000001保留六位字串；顯示遮罩Email、倒數與兩個密碼欄，確認密碼僅client比對不重複送API；未完成201/204不進本人頁 |
| - [ ] **PF-UT-089** `RenderChallenge_ServerDeadlineOrRateLimit_DrivesResendCountdown` | PF-BDD-071、PF-BDD-084；PF-AC-002、PF-AC-004、PF-AC-017、PF-AC-028 | server倒數與429 | 固定serverexpires／resendAfter及Retry-After | 時間跨冷卻／到期，點重寄 | 倒數依server時間，60秒前禁重寄；429尊重Retry-After；成功新generation舊碼失效 |
| - [ ] **PF-UT-090** `OpenVerification_MissingExpiredOrInvalidFlow_ReturnsRecoveryState` | PF-BDD-071、PF-BDD-072、PF-BDD-089、PF-BDD-091；PF-AC-002、PF-AC-004、PF-AC-016、PF-AC-028、PF-AC-030、PF-AC-031 | 空狀態／錯誤提示 | 缺metadata、flow過期、錯碼／locked／目的不符 | 開頁或提交 | 顯重新請碼／通用無效碼提示而非空白崩潰；清到期metadata，不顯原碼／密碼 |

### 1.31 Client Google SDK

**位置（組內每案）**：`apps/client/tests/unit/google-operation.test.ts`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-091** `HandleSdkResult_CancelledStaleOrSwitchedOperation_IgnoresOldIdentity` | PF-BDD-074、PF-BDD-075、PF-BDD-076；PF-AC-002、PF-AC-019、PF-AC-020、PF-AC-022、PF-AC-025 | SDK本機操作關聯 | 多操作序號、取消／登出／換Account或X-DatingHigh-Session變更後晚到SDK結果 | 處理callback | 只當前operation序號有效；連結送出前核對currentSessionId未變；無server challenge或nonce依賴 |
| - [ ] **PF-UT-092** `SubmitGoogleCredential_CurrentOperation_SendsOneMemoryOnlyRequest` | PF-BDD-074、PF-BDD-075、PF-BDD-076、PF-BDD-083；PF-AC-002、PF-AC-019、PF-AC-020、PF-AC-022、PF-AC-025 | SDK證明傳輸 | 當前有效SDK credential，執行Google登入或已登入連結 | 提交並連點／換帳號 | 登入與連結均只送一次HTTPS JSON {credential, clientPlatform}（連結無需currentPassword）；pending禁切換；credential僅留記憶體，處理完即清 |
| - [ ] **PF-UT-093** `HandleGoogleHttp_UnknownResult_ConfirmsStateWithoutReplayingMutation` | PF-BDD-075、PF-BDD-076；PF-AC-020、PF-AC-022、PF-AC-025 | 已送HTTP結果不明 | 第三方登入／連結已提交而回應遺失 | 取消畫面或嘗試恢復 | 禁止自動重送寫入；先以GET /api/v1/session或GET /api/v1/me/identities唯讀確認並比對X-DatingHigh-Session標頭，若session已變或回401 SESSION_REVOKED則清舊畫面並回登入 |

### 1.32 Client Account Screens

**位置（組內每案）**：`apps/client/tests/unit/account-management.test.tsx`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-094** `RenderAccount_OwnDtoWithEmptyIdentities_ShowsSafeSummary` | PF-BDD-009、PF-BDD-079；PF-AC-002、PF-AC-003、PF-AC-009、PF-AC-016、PF-AC-023、PF-AC-034 | 本人摘要與空狀態 | 本人AccountDto、hasLocalPassword與空／非空linkedProviders | 呈現account／connections | 只顯示本人Email、驗證狀態與登入方式；空集合可操作，不展示外部subject或內部基礎設施資訊 |
| - [ ] **PF-UT-095** `CompleteCredentialMutation_LinkUnlinkOrChangePassword_AppliesCorrectSessionUX` | PF-BDD-034、PF-BDD-080、PF-BDD-081、PF-BDD-082；PF-AC-002、PF-AC-007、PF-AC-008、PF-AC-022、PF-AC-030 | 密碼／連結／解除管理UX | 連結Google 200、改密碼／解除Google 204、版本衝突409、Google-only無本地密碼嘗試解除（409 LAST_LOGIN_METHOD） | 操作password／connections | 連結成功顯示『Google 已連結』並保持目前登入；改密碼與解除Google成功清除登入並導回登入頁；無本地密碼嘗試解除時引導先透過Email設定密碼 |
| - [ ] **PF-UT-096** `RenderLogout_PendingFailureOrSuccess_ReflectsServerRevocation` | PF-BDD-022、PF-BDD-090；PF-AC-002、PF-AC-007、PF-AC-025 | 登出UX | server撤銷pending／失敗／204 | 點登出並重新開啟 | pending禁重複，失敗隱藏私人頁且顯未完成／可重試；成功清pair；下次不恢復待撤family |

### 1.33 Client Session Refresh

**位置（組內每案）**：`apps/client/tests/unit/session-recovery.test.ts`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-097** `CoordinateMultiTabAndRefresh_Concurrent401sAndSessionHeader_SyncsAcrossTabs` | PF-BDD-020、PF-BDD-021、PF-BDD-086、PF-BDD-087、PF-BDD-088；PF-AC-005、PF-AC-024、PF-AC-025、PF-AC-026 | Web多分頁與X-DatingHigh-Session同步 | Web開啟多個分頁共用Cookie、單分頁內並行401、另一分頁切換帳號或重新登入使X-DatingHigh-Session改變 | 執行single-flight refresh並於每次回應與focus/pageshow/visibilitychange檢查X-DatingHigh-Session | Web不限制分頁數且無第二分頁阻擋頁；單分頁內並行401合併為單次refresh；當回應之X-DatingHigh-Session與本機currentSessionId不符或收401 SESSION_REVOKED時，立即清除過期分頁私人畫面並回登入 |
| - [ ] **PF-UT-098** `RetryApi_PreHandlerMissingOrExpiredAccessAnd409RefreshRetry_RetriesSafelyOnce` | PF-BDD-086、PF-BDD-087；PF-AC-005、PF-AC-024、PF-AC-025 | 安全401重送與409 REFRESH_RETRY重試 | handler前ACCESS_TOKEN_EXPIRED/MISSING、refresh遇409 REFRESH_RETRY、SESSION_REVOKED或業務401 | 執行ApiClient重試策略 | 僅handler前缺/過期Access允許refresh（若refresh遇409 REFRESH_RETRY，以最新Refresh/Cookie重試refresh一次），成功後原請求最多重送一次；SESSION_REVOKED/REFRESH_TOKEN_REUSE不重送 |
| - [ ] **PF-UT-099** `RestoreSession_LostResponseOrSecureStoreFailure_RequiresSafeRecovery` | PF-BDD-020、PF-BDD-021、PF-BDD-022、PF-BDD-086、PF-BDD-088；PF-AC-005、PF-AC-007、PF-AC-024、PF-AC-025、PF-AC-026 | 原生儲存／Web回應遺失恢復 | native冷啟動／SecureStore寫入失敗；Web refresh回應遺失（瀏覽器可能已收新Cookie或仍在30秒寬限窗內） | 執行恢復流程 | native先持久寫入後繼Refresh才放行，失敗清登入回登入頁；Web先GET /api/v1/session唯讀確認或於30秒寬限內重試refresh，若已被其他裝置取代則顯示『帳號已在其他裝置登入，請重新登入』 |

### 1.34 Client Failure and Timeout Policy

**位置（組內每案）**：`apps/client/tests/unit/api-failure-policy.test.ts`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-100** `PresentApiFailure_StatusAndTraceId_ShowsRecoverableNonSecretNotice` | PF-BDD-072、PF-BDD-080、PF-BDD-085、PF-BDD-092；PF-AC-002、PF-AC-007、PF-AC-015、PF-AC-025、PF-AC-028、PF-AC-030 | 錯誤及產品文案 | 503／504／500、credentialversion衝突、錯碼／過期 | 呈現錯誤 | 可讀重試或重登入提示與traceId，保留合理表單狀態；不暴露D1／Docker／SQL／binding或rawsecret |
| - [ ] **PF-UT-101** `RetryNetwork_ReadOnlyOrUncertainMutation_RespectsOneRetryBudget` | PF-BDD-021、PF-BDD-076、PF-BDD-078、PF-BDD-085、PF-BDD-087、PF-BDD-092；PF-AC-002、PF-AC-008、PF-AC-015、PF-AC-020、PF-AC-022、PF-AC-025、PF-AC-030 | 有限重試與不明結果 | GET故障與註冊／reset／改密碼／Google結果不明 | 判重試 | 唯讀最多一次；已可能執行寫入不自動重放，按流程唯讀確認／新密碼登入，不假設切頁回滾 |
| - [ ] **PF-UT-102** `WaitForResponse_NormalOrColdStart_UsesThirtyOrFortyFiveSeconds` | PF-BDD-083、PF-BDD-085、PF-BDD-092；PF-AC-002、PF-AC-015、PF-AC-020、PF-AC-025 | timeout與loading | 固定clock及一般／首次container啟動 | 等待到30秒／45秒與重複點擊 | 一般30秒、coldstart45秒上限並顯『連線中』／loading；不無限等待、不重複送出 |

### 1.35 Sensitive Data and Temporary Storage

**位置（組內每案）**：`apps/client/tests/unit/sensitive-data-policy.test.ts`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-103** `PersistSecret_PasswordCodeOrProviderToken_RejectsDurableAndTelemetryStorage` | PF-BDD-020、PF-BDD-044、PF-BDD-088、PF-BDD-089；PF-AC-002、PF-AC-005、PF-AC-016、PF-AC-019、PF-AC-025、PF-AC-026、PF-AC-031 | 秘密分類 | password／code／Googletoken／platformpair與一般logging／analytics／錄影sink | 嘗試持久化或投影 | code／password／Googlecredential不落地、不入URL／一般log；Web平台token不入storage，nativeAccess僅memoryRefresh才SecureStore |
| - [ ] **PF-UT-104** `PersistEmailFlow_ActiveOrCompletedMetadata_EnforcesExpiryAndCleanup` | PF-BDD-044、PF-BDD-089、PF-BDD-091；PF-AC-002、PF-AC-016、PF-AC-019、PF-AC-028、PF-AC-030、PF-AC-031 | Email暫存例外 | challengeId／flowToken／期限與完成／到期事件 | 儲存／重啟／清除 | 僅有效期WebsessionStorage／nativeSecureStore；完成／到期移除，缺失提供重新請碼；不把碼／密碼混入metadata |
| - [ ] **PF-UT-105** `EmitVerificationLog_ExplicitTrustedLocalMode_AllowsOnlyDedicatedCategory` | PF-BDD-044；PF-AC-016、PF-AC-019、PF-AC-031 | local log受控例外 | APP_ENV、可信Workerexecution與EmailDeliveryMode各組合 | 選sender／logpolicy | 只有local+Log可輸出專用LocalEmailVerification；server拒ready，不進telemetry；一般DTO／health／bundle／log無hash、MAC、secret／私人資訊 |

### 1.36 Acceptance Evidence Policy

**位置（組內每案）**：`scripts/tests/foundation-evidence-policy.test.ts`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-106** `ValidateEvidence_WebAndroidIosAndEnvironments_RequiresSeparateArtifacts` | PF-BDD-001、PF-BDD-093、PF-BDD-094；PF-AC-001、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-018、PF-AC-019、PF-AC-026、PF-AC-029 | 證據維度 | 有不同platform／local／staging／production的build與執行紀錄 | 檢查reportinventory | 各平台／環境分列版本、時間、結果；Web不補原生，staging部署不宣稱production發布 |
| - [ ] **PF-UT-107** `ValidateEvidence_FakeProviderOrAcceptedEmail_RejectsSubstituteForRealFlow` | PF-BDD-001、PF-BDD-093、PF-BDD-094；PF-AC-001、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-018、PF-AC-019、PF-AC-026、PF-AC-029 | 真服務證據預檢 | fakeGoogle／Email、provideracceptedmessageID或真收碼完成紀錄 | 判Google／寄信／D1R2驗收 | 只有真SDK登入、實際收信並完成、真接線／restart讀回可結案；保存去敏messageID／時間／結果，不存code |
| - [ ] **PF-UT-108** `CloseAcceptance_UnavailableResourceOrMissingExecution_LeavesIncompleteStatus` | PF-BDD-001、PF-BDD-093、PF-BDD-094；PF-AC-001、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-018、PF-AC-019、PF-AC-026、PF-AC-029 | 缺資源不冒稱完成 | iOSbuild或雲端resource／sender未就緒，其他cases通過 | 產交付狀態 | 明列未驗收與具體阻斷；未執行不Passed，不以配置檔／預期數量產100%；不擴張其他SPEC範圍 |

### 1.37 Atomic Completion Command Policy

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Infrastructure/CompletionCommandPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-109** `PlanCompletion_SharedPreconditionsAndFinalConsume_RequiresOneAtomicBatch` | PF-BDD-003、PF-BDD-005、PF-BDD-011、PF-BDD-048、PF-BDD-049；PF-AC-004、PF-AC-008、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-030、PF-AC-032、PF-AC-034 | 同batch共用前置條件與最後消耗挑戰 | register-email、register-external、reset-password、session.create與session.refresh命令參數 | 產生固定prepared SQL batch語句順序 | register-email與reset-password同batch所有寫入共用挑戰active與generation/code_mac前置條件，並把消耗挑戰(state='consumed')放最後一句；session.create同batch撤舊並依Account active/cv建新family與Refresh；session.refresh依current_generation與UNIQUE(session_id, generation)輪替 |
| - [ ] **PF-UT-110** `HandleCompletion_ZeroRowsUniqueConflictOrFault_ProducesNoPartialSuccess` | PF-BDD-003、PF-BDD-005、PF-BDD-011、PF-BDD-047、PF-BDD-048、PF-BDD-049、PF-BDD-052；PF-AC-004、PF-AC-007、PF-AC-008、PF-AC-021、PF-AC-024、PF-AC-027、PF-AC-028、PF-AC-030、PF-AC-032、PF-AC-034 | 0列／UNIQUE衝突／SQL故障回滾 | batch回傳前置條件0列、自然UNIQUE衝突或SQL錯誤 | 判定completion結果 | 前置條件不符時全批0列寫入，UNIQUE衝突或SQL錯誤時D1整批原子回滾，不留半套Account/identity/family/token或已消耗未生效的挑戰；獨立錯碼累加與限流已提交計數不回滾 |
| - [ ] **PF-UT-111** `PlanConcurrentCompletion_SameCodeEmailOrToken_PreservesSingleWinner` | PF-BDD-003、PF-BDD-048、PF-BDD-049；PF-AC-004、PF-AC-008、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-030、PF-AC-032 | 並行仲裁計畫 | 兩次同碼、Email／Google同址／subject或同Refresh請求 | 建立CAS／自然UNIQUE檢查及衝突投影 | 同碼/Email/subject確認至多一成功；同Refresh重放只撤該family；同Account兩成功新登入按commit最後唯一有效，session.create失敗保舊，不以預SELECT或全域cv替代CAS/UNIQUE |

### 1.38 Sensitive Mutation Authorization

**位置（組內每案）**：`server/tests/DatingHigh.Unit.Tests/Application/SensitiveMutationPolicyTests.cs`
**優先級（組內每案）**：P0

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-112** `AuthorizeMutation_ExpiredFamilyOrCredentialVersionChangedAtCommit_RejectsStaleAuthorization` | PF-BDD-010、PF-BDD-013、PF-BDD-023、PF-BDD-032、PF-BDD-050、PF-BDD-055；PF-AC-007、PF-AC-016、PF-AC-022、PF-AC-034、PF-AC-035 | 提交時授權與credential_version檢查 | 入口已驗Access／必要密碼，最後寫入前family撤銷／到期或credential_version改變 | 建立最終SQL條件並處理0列 | 最終SQL必核本人有效family、Active Account與credential_version；0列時無identity或password_hash寫入，重讀回401 SESSION_REVOKED或409 CREDENTIAL_CHANGED |
| - [ ] **PF-UT-113** `ApplyCredentialChange_PasswordChangeResetOrUnlink_IncrementsCvAndInvalidatesOldFamilies` | PF-BDD-010、PF-BDD-013、PF-BDD-014、PF-BDD-050、PF-BDD-054、PF-BDD-055、PF-BDD-080；PF-AC-002、PF-AC-007、PF-AC-016、PF-AC-022、PF-AC-024、PF-AC-026、PF-AC-034、PF-AC-035 | credential_version遞增與不遞增邊界 | 改密碼／reset／解除綁定，對照一般登入與連結外部身分 | 套用credential_version與family撤銷策略 | 改密碼、重設密碼與解除外部綁定將credential_version加1使全部舊family失效；一般新登入與連結外部身分不增加credential_version（新登入僅同batch撤銷舊family） |
| - [ ] **PF-UT-114** `ApplyEquivalentOrIdempotentMutation_RehashOrSameIdentity_PreservesCredentialVersion` | PF-BDD-018、PF-BDD-023、PF-BDD-050；PF-AC-007、PF-AC-022、PF-AC-035 | 等價rehash與冪等連結界線 | 等價password_hash升級或同(provider, subject)重複連結，另有新密碼競態 | 執行條件寫入／冪等回應 | rehash以WHERE password_hash=@oldHash AND credential_version=@cv條件更新且不加cv；同identity重複連結回200 {provider, linked: true}不加cv、不要求重登 |

### 1.39 Client Layout and Accessibility

**位置（組內每案）**：`apps/client/tests/unit/foundation-layout.test.tsx`
**優先級（組內每案）**：P1

| 完成／唯一 ID／Method_Condition_Result | 來源 BDD／PF-AC | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|---|
| - [ ] **PF-UT-115** `RenderLayout_SmallScreenSafeAreaAndKeyboard_KeepsActionsVisible` | PF-BDD-069；PF-AC-001、PF-AC-002 | 小螢幕與鍵盤可見性 | 參數為小螢幕、safearea、鍵盤展開與長錯誤訊息 | 呈現開始／帳號表單並計算可捲動容器 | 主操作可達且不被鍵盤／安全區遮住，無固定700px裁切 |
| - [ ] **PF-UT-116** `NavigateForm_WebKeyboardAndAccessibleLabels_ExposesVisibleFocus` | PF-BDD-069；PF-AC-001、PF-AC-002 | Web鍵盤與讀屏 | 表單與按鈕具有label，可模擬Tab／ShiftTab／Enter | 依順序導覽與提交 | focus可見、順序合理、互動可鍵盤完成，錯誤不只依顏色 |
| - [ ] **PF-UT-117** `RenderMotion_ReducedMotionPreference_PreservesUsableFeedback` | PF-BDD-069；PF-AC-001、PF-AC-002 | 減少動態偏好 | 系統減少動態開啟／關閉與loading／錯誤狀態 | 切換偏好並呈現互動回饋 | 減少非必要動態而保留明確loading／錯誤／操作提示 |

## 2️⃣ 集成測試（Integration Tests）

真實邊界依每案前提執行；SQL／CAS／FK／持久化不得以 InMemory DB 或 mock bridge 替代。測試故障注入限 local／test 隔離資源。

- [ ] **PF-IT-001** `NormalizeAndPersist_EmailAndGooglePaths_EnforcesGlobalUniqueEmail`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/AccountUniquenessTests.cs`
  - **來源**：PF-BDD-026、PF-BDD-031、PF-BDD-048；PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-032
  - **目標**：全域Email唯一與固定身分。
  - **前提**：真D1 emulator與大小寫／空白等價Email，Email／Google建帳路徑。
  - **動作**：並行提交同址與不同subject，查六表結果。
  - **預期**：最多一Account；輸者409，無搬移或自動合併；+tag／點保持不同地址。

- [ ] **PF-IT-002** `CompleteRegistration_BatchFaultOrZeroRows_RollsBackAllDependentWrites`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/RegistrationAtomicityTests.cs`
  - **來源**：PF-BDD-002、PF-BDD-003、PF-BDD-048；PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-032
  - **目標**：Email原子建帳與共用前置條件回滾。
  - **前提**：真D1，active之register_email挑戰與測試可控故障點。
  - **動作**：在同一D1 batch內測試挑戰前置條件不符（0列）、Email自然UNIQUE衝突或中間步驟SQL錯誤，並將條件消耗挑戰置於batch最後一句。
  - **預期**：前置條件不符時全批0列寫入；UNIQUE衝突或SQL錯誤時D1整批原子回滾，挑戰保持active、無孤立Account/family/Refresh，且token不曝光。

- [ ] **PF-IT-003** `CompleteExternalRegistration_EmailOrSubjectRace_PreservesOneOwner`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/ExternalRegistrationTests.cs`
  - **來源**：PF-BDD-005、PF-BDD-017、PF-BDD-031、PF-BDD-048；PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-032、PF-AC-034、PF-AC-035
  - **目標**：首次Google直接建帳（account.register-external）之並行唯一與回滾。
  - **前提**：真D1與已驗證可信網域之新Google身分(google, sub, email_normalized)。
  - **動作**：並行提交同(google, sub)或同Email之首次Google建帳，或注入batch內identity/family步驟SQL失敗。
  - **預期**：至多建立一筆無本地密碼Account與(google, sub) identity；衝突或SQL失敗時整批回滾無孤立資料；後續重送同有效Google proof走既有綁定登入（200）並原子替換舊family。

- [ ] **PF-IT-004** `VerifyChallenge_WrongFlowPurposeGenerationOrState_CannotComplete`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/EmailChallengeTests.cs`
  - **來源**：PF-BDD-019、PF-BDD-038、PF-BDD-045；PF-AC-004、PF-AC-028、PF-AC-030、PF-AC-032
  - **目標**：碼綁定與秘密保存。
  - **前提**：真D1，固定clock／單一EMAIL_CODE_HMAC_KEY與六位前導零碼。
  - **動作**：逐項換flow／purpose（register_email與reset_password互換）／generation／state／期限並提交。
  - **預期**：各不合法不得建帳／reset；DB僅存.NET計算之code_mac與flow_token_hash，無明文或裸SHA；精確10／30分鐘到期拒絕；包含嚴格UTF-8 emoji／孤立surrogate負例與五欄0x7C framing比對。

- [ ] **PF-IT-005** `ResendChallenge_ConcurrentResendsAndCooldown_ActivatesOnlyLatestGeneration`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/EmailChallengeResendTests.cs`
  - **來源**：PF-BDD-040、PF-BDD-046；PF-AC-028、PF-AC-029、PF-AC-031
  - **目標**：60秒重寄冷卻與併發generation CAS。
  - **前提**：真D1，active挑戰且resend_after=T+60秒、已有4次錯碼。
  - **動作**：於T+60秒前嘗試重寄，再於T+60秒邊界併發執行email.challenge.resend。
  - **預期**：冷卻前429附Retry-After；邊界後相同預期generation最多一次CAS成功遞增generation並更新code_mac，舊generation驗證碼立即失效，failed_attempts仍保留4次且絕對30分鐘期限不延長。

- [ ] **PF-IT-006** `RecordWrongCode_ConcurrentFailures_LocksAtFiveWithoutLostUpdates`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/ChallengeFailureCounterTests.cs`
  - **來源**：PF-BDD-038、PF-BDD-047；PF-AC-004、PF-AC-028、PF-AC-032
  - **目標**：原子錯誤計數。
  - **前提**：真D1同challenge，足夠Email驗碼額度。
  - **動作**：並行送錯碼並在第五次後試正確碼／重寄。
  - **預期**：計數不遺失、最多5並locked；回錯誤不回滾已計失敗；重寄不能清鎖繞過。

- [ ] **PF-IT-007** `RequestReset_KnownUnknownExternalOnlyOrDeliveryFailure_PreservesPrivacy`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/PasswordResetRequestTests.cs`
  - **來源**：PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-040；PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031
  - **目標**：忘記密碼同形回應與寄信失敗隱藏。
  - **前提**：真D1，已知／未知／Google-only Email及受控sender故障（含10秒timeout）。
  - **動作**：known／unknown／Google-only執行request與resend，參數化sender快速成功、拒絕與10秒timeout，另對未知虛擬挑戰提交任意碼。
  - **預期**：皆回同形通用202、不含投遞狀態欄位；未知不寄且永不能reset；已知Email遇sender失敗仍回同形202並記內部log；必要I/O完成即回不加人為固定等待（D-018）。

- [ ] **PF-IT-008** `ResetPassword_ConcurrentConfirmationOrBatchFault_UpdatesExactlyOnce`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/PasswordResetAtomicityTests.cs`
  - **來源**：PF-BDD-011、PF-BDD-012、PF-BDD-039、PF-BDD-049；PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030
  - **目標**：重設密碼同批原子性與撤銷。
  - **前提**：真D1，一個有效family與多個歷史revoked family、第三方綁定、有效active reset挑戰。
  - **動作**：並行提交同reset碼；或令Account bound_credential_version不符（0列）／注入SQL錯誤。
  - **預期**：同一D1 batch依挑戰active與bound_credential_version相符更新password_hash與credential_version+1，最後一句消耗挑戰；並行最多一次成功，0列或SQL錯誤時挑戰不消耗且密碼不變；成功後舊有效family與歷史token皆因cv不符失效，Google綁定保留且不自動登入。

- [ ] **PF-IT-009** `CreateSession_ConcurrentLoginsOrBatchFault_PreservesSingleWinner`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/SessionCreationRaceTests.cs`
  - **來源**：PF-BDD-023、PF-BDD-055；PF-AC-007、PF-AC-035
  - **目標**：單一登入同batch原子替換與失敗保舊。
  - **前提**：真D1，同Account一個有效與歷史revoked／expired但revoked_at仍NULL測試列；Email/Google兩成功新登入並行，或注入新family／Refresh寫入失敗。
  - **動作**：先準備隨機pair與HS256簽署但不曝光；同一D1 batch將同Account全部revoked_at IS NULL舊列標記為replaced_by_login，再依Account active與cv條件插入新family（受partial UNIQUE保護）與generation0 Refresh（不寫auth_accounts、不加cv）。
  - **預期**：commit後最後成功者為唯一revoked_at IS NULL之有效family；若新family或Refresh插入引發SQL錯誤或UNIQUE衝突，整批回滾並保留原有效family；若cv已先變更則插入0列不發pair；rehash依password_hash與cv條件更新不加cv、不覆寫競態新密碼。

- [ ] **PF-IT-010** `RotateRefresh_AnyDependentSqlFaultOrUniqueConflict_RestoresPriorAtomicState`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/RefreshAtomicityTests.cs`
  - **來源**：PF-BDD-008、PF-BDD-052；PF-AC-006、PF-AC-007、PF-AC-023、PF-AC-024
  - **目標**：Refresh每步SQL失敗或UNIQUE衝突回滾。
  - **前提**：真D1原family／token與固定current_generation，能注入故障或衝突。
  - **動作**：在同一D1 batch內對auth_sessions更新、UNIQUE(session_id, generation)後繼Refresh插入或前token標記consumed注入SQL錯誤／衝突，或令前置條件0列。
  - **預期**：SQL錯誤或UNIQUE衝突時D1整批回滾，family current_generation/idle與前後token完整還原；前置條件0列時不核發pair。

- [ ] **PF-IT-011** `RotateRefresh_GraceWindowRetryConcurrentConflictAndExpiredReplay_EnforcesD020Rules`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/RefreshReplayTests.cs`
  - **來源**：PF-BDD-008、PF-BDD-051、PF-BDD-052；PF-AC-006、PF-AC-007、PF-AC-023、PF-AC-024、PF-AC-026
  - **目標**：驗證D-020之30秒寬限窗重試、並行409與逾30秒重放撤銷。
  - **前提**：真D1與固定clock，同Refresh由多請求並行或在不同時間點重送。
  - **動作**：分別測試：① consumed_at 30秒內重送緊接前一代token、② 兩請求同時並行刷新同代token（或30秒內送非緊接前一代token）、③ consumed_at超過30秒後重放已消耗token（含session額度已滿情況）。
  - **預期**：① 從目前head再原子輪替一次並回200新pair，不撤銷family；② 並行落敗方回409 REFRESH_RETRY，不撤銷family；③ 超過30秒重放不受session輪替額度阻擋，回401 REFRESH_TOKEN_REUSE並持久撤銷整個原family（不影響同Account後來新建之其他family）。

- [ ] **PF-IT-012** `RevokeAndRefresh_ConcurrentRequests_LeavesFamilyUnusableAfterRevocation`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/LogoutRaceTests.cs`
  - **來源**：PF-BDD-015、PF-BDD-054；PF-AC-006、PF-AC-007、PF-AC-024、PF-AC-026
  - **目標**：登出與刷新競態。
  - **前提**：真D1，同Account歷史replaced family與唯一最新active，交錯原family refresh/logout及成功新登入。
  - **動作**：交錯submit/revoke/create與舊裝置expired/consumedRefresh logout。
  - **預期**：目標family撤銷commit後其全部token拒絕；最新登入family不被舊refresh/revoke/重放撤銷，歷史logout冪等204；server立即撤，舊client下次API/回前景核驗提示，不加push或承諾離線畫面同毫秒改變。

- [ ] **PF-IT-013** `ChangePassword_WithCreateOrRefreshRace_InvalidatesEveryOldCredentialVersion`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/CredentialMutationRaceTests.cs`
  - **來源**：PF-BDD-010、PF-BDD-050、PF-BDD-055；PF-AC-007、PF-AC-016、PF-AC-022
  - **目標**：改密碼線性化與credential_version遞增。
  - **前提**：真D1，一個有效family+多歷史revoked，驗密碼/create/refresh可停在最後SQL前。
  - **動作**：交錯change-password與create/refresh、兩個新登入commit及logout。
  - **預期**：改密碼依有效family與目前cv原子更新password_hash並將credential_version加1，所有舊憑證立即不可用；一般登入不寫auth_accounts、不加cv，僅同batch撤銷NULL舊family並建新family。

- [ ] **PF-IT-014** `LinkIdentity_AuthorizationExpiresBeforeCommit_RejectsAllDependentWrites`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/ExternalLinkCommitTests.cs`
  - **來源**：PF-BDD-013、PF-BDD-032、PF-BDD-050；PF-AC-007、PF-AC-022、PF-AC-034、PF-AC-035
  - **目標**：本人連結最後SQL授權條件。
  - **前提**：真D1，入口驗Access與Google credential成功，最後SQL前可令family撤銷／過期或credential_version改變。
  - **動作**：逐項造成family失效或cv變更後執行identity.external.link。
  - **預期**：最後SQL因有效family或Account active/cv條件不成立而插入0列，不寫入identity、不回成功。

- [ ] **PF-IT-015** `ManageExternalIdentity_ConstraintsIdempotencyAndUnlink_ProtectsOwnerAndLogin`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/ExternalIdentityManagementTests.cs`
  - **來源**：PF-BDD-013、PF-BDD-014、PF-BDD-018、PF-BDD-033、PF-BDD-034；PF-AC-007、PF-AC-021、PF-AC-022、PF-AC-034、PF-AC-035
  - **目標**：identity雙重唯一、直接連結不增cv與解除綁定增cv。
  - **前提**：真D1，A／B、同Account同provider、Google-only及有密碼帳號。
  - **動作**：並行連結／解除，重複同(provider, subject)與Google-only嘗試解除之最後方式負例。
  - **預期**：UNIQUE(provider, subject)與UNIQUE(account_id, provider)保護唯一；連結與重複連結均回200 {provider, linked: true}且不增加cv、不撤銷family；解除綁定在同一D1 batch內將credential_version加1並刪除identity使全部舊family失效；無本地密碼拒絕解除並回409 LAST_LOGIN_METHOD。

- [ ] **PF-IT-016** `ValidateFamily_PrimaryD1StateChanges_ImmediatelyRejectsOldJwt`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/AccessFamilyValidationTests.cs`
  - **來源**：PF-BDD-009、PF-BDD-035、PF-BDD-053、PF-BDD-076；PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-009、PF-AC-016、PF-AC-020、PF-AC-022、PF-AC-023、PF-AC-025、PF-AC-034
  - **目標**：D1 primary權威及期限。
  - **前提**：真D1，一個最新有效family與歷史revoked，HS256 JWT尚未到期，30日/7日精確邊界。
  - **動作**：撤銷／停用／改cv及時間跨界後呼叫session.validate。
  - **預期**：每次查D1 primary，family嚴格到期／被取代或cv不符立即回401 SESSION_REVOKED，合法則回CurrentUser並供API輸出X-DatingHigh-Session標頭。

- [ ] **PF-IT-017** `ConsumeAuthenticationPolicies_AllNineEntries_EnforcesConfirmedLimits`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/RateLimitPolicyTests.cs`
  - **來源**：PF-BDD-028、PF-BDD-051、PF-BDD-056、PF-BDD-059；PF-AC-004、PF-AC-016、PF-AC-017、PF-AC-024、PF-AC-026、PF-AC-036
  - **目標**：靜態常數表九項政策真計數。
  - **前提**：真D1，RateLimitPolicies九筆規則、固定clock、受控副作用spy。
  - **動作**：各政策做到limit及limit+1，含不存在Email／無效Refresh／逾30秒重放Refresh。
  - **預期**：九筆對象／時窗／額度與SPEC一致；先IP再歸屬；失敗嘗試也計數不退；一次operation每bucket去重只扣一次；IP gate過後逾30秒之consumed token重放撤銷不受session額度阻擋。

- [ ] **PF-IT-018** `SendCode_MixedPurposeAndChallenge_SixthEmailAttemptNeverSends`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/SharedEmailSendLimitTests.cs`
  - **來源**：PF-BDD-002、PF-BDD-057；PF-AC-004、PF-AC-017、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-036
  - **目標**：寄碼跨入口共用每小時5次。
  - **前提**：真D1，同canonical Email跨register_email／reset_password及兩者resend，多IP。
  - **動作**：五次允許後第六次與並行多次請碼。
  - **預期**：sender總呼叫不超5、第六次起429+Retry-After；換challenge/purpose/大小寫不重置；計數先於sender呼叫。

- [ ] **PF-IT-019** `UpsertRateBucket_ConcurrentContainersWithDifferentCandidateIds_PreservesOneCounter`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/RateLimitConcurrencyTests.cs`
  - **來源**：PF-BDD-056、PF-BDD-058、PF-BDD-059；PF-AC-017、PF-AC-036
  - **目標**：單一RATE_LIMIT_HMAC_KEY、.NET計算hash與UPSERT自然鍵仲裁。
  - **前提**：真D1，Worker傳遞X-DatingHigh-Internal-Client-Ip，.NET以單一RATE_LIMIT_HMAC_KEY計算subject_hash，兩container給不同候選bucket UUID。
  - **動作**：並行多次執行rate-limit.consume及重啟container。
  - **預期**：UNIQUE(policy_key, subject_type, subject_hash, window_start_ms)確保只建一筆bucket、原bucket_id保留且計數原子累加不遺失；跨重啟一致，不以SELECT後count+1實作。

- [ ] **PF-IT-020** `ConsumeStaticPolicies_CrossEntrySharingAndUnknownRejection_EnforcesStaticCatalog`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/CommonRateLimiterTests.cs`
  - **來源**：PF-BDD-056、PF-BDD-058、PF-BDD-059；PF-AC-017、PF-AC-036
  - **目標**：靜態RateLimitPolicies跨入口共用與非法參數拒絕。
  - **前提**：真D1，RateLimitPolicies定義之認證政策（如email_code_send.v1跨註冊與重設共用、credential_change.v1跨改密碼與解除綁定共用）。
  - **動作**：同對象跨共用入口consume、不同policy_key隔離consume；另送未知policy_key／不允許的subject_type／自訂額度。
  - **預期**：同policy_key跨入口共用計數、不同policy_key隔離；未知policy_key、不符的subject_type或自訂windowMs/limit一律拒絕；duplicate descriptor單次請求只扣一次。

- [ ] **PF-IT-021** `ConsumeRateWindow_BoundaryCleanupOrD1Failure_ReturnsBoundedFailClosedDecision`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/D1/RateLimitWindowTests.cs`
  - **來源**：PF-BDD-041、PF-BDD-060、PF-BDD-067；PF-AC-006、PF-AC-013、PF-AC-015、PF-AC-017、PF-AC-024、PF-AC-026、PF-AC-028、PF-AC-036
  - **目標**：限流視窗／故障。
  - **前提**：真D1，固定視窗邊界、多項超限、超1000過期bucket及D1故障。
  - **動作**：固定窗consume/Retry-After、duplicate descriptors與IP分階段；Worker scheduled在container休眠時驅動多batchcleanup並注入D1故障。
  - **預期**：count飽和limit+1、RetryAfter最晚expiry ceil≥1，已取得計數不退；各bucket只一次；scheduled預算內>1000 backlog分批≤1000且可重試/記backlog，新窗不等cleanup；D1故障503無副作用。

- [ ] **PF-IT-022** `ApplyMigration_SixTablesFiftyFourColumnsAndRelations_PreservesSchemaContract`（P0）
  - **位置**：`cloudflare/tests/integration/foundation-schema.test.ts`
  - **來源**：PF-BDD-061、PF-BDD-062、PF-BDD-064；PF-AC-011、PF-AC-016、PF-AC-033、PF-AC-035、PF-AC-037
  - **目標**：六表54欄實體Schema。
  - **前提**：空真D1 emulator與第一份migration。
  - **動作**：migrate後查table_info／index／FK，測非法ID handler及自然鍵重複。
  - **預期**：六表共54欄（8+5+10+8+16+7）、第一欄UUIDv7單欄PK、auth_/common_映射／約束完整；無auth_challenges／metadata／Identity／EF；含UNIQUE(provider, subject)與auth_sessions唯一partial index(account_id) WHERE revoked_at IS NULL。

- [ ] **PF-IT-023** `AccessPrivateObject_TwoOwnersOrTraversal_RejectsCrossOwnerOperations`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/R2/PrivateObjectStoreTests.cs`
  - **來源**：PF-BDD-016、PF-BDD-043；PF-AC-009、PF-AC-014、PF-AC-016
  - **目標**：私人adapter真權限。
  - **前提**：真D1／R2 emulator與A／B兩已驗Account、測試object。
  - **動作**：Aput後Bget/delete/put同key，測pathtraversal及未知resource。
  - **預期**：僅A合法用途讀寫，其他拒絕；驗Accessexp/family/cv；無公開媒體API／bucketpublicURL。

- [ ] **PF-IT-024** `ProbeStorage_ThroughDotNetOutboundHandlerAndRestart_PreservesDigest`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/R2/FoundationProbeTests.cs`
  - **來源**：PF-BDD-063；PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-026
  - **目標**：probe真接線持久化。
  - **前提**：真Docker+Wrangler+D1/R2，本地固定probe UTF8內容。
  - **動作**：經.NET寫讀probe，重建／重啟container再讀並核digest。
  - **預期**：digest一致且D1Account/R2物件仍在；不得以容器檔案或mock整段bridge代替。

- [ ] **PF-IT-025** `RouteWorker_PublicInternalAndSpoofedIdentity_EnforcesContainerBoundary`（P0）
  - **位置**：`cloudflare/tests/integration/public-boundary.test.ts`
  - **來源**：PF-BDD-035、PF-BDD-037、PF-BDD-042、PF-BDD-066；PF-AC-005、PF-AC-006、PF-AC-013、PF-AC-015、PF-AC-016、PF-AC-020、PF-AC-023、PF-AC-029
  - **目標**：公網路由／信任標頭。
  - **前提**：真Worker→container→outboundhandler，帶偽造internal／userIDheaders。
  - **動作**：存取internalcommands／任意SQL／未知API／health／合法SPA。
  - **預期**：internal拒絕、外部信任標頭清除，不冒用身份；未知API JSON404而前端合法路由HTML，無公開internalhostDNS；檢六protected endpoints metadata明確RequireAuthorization Access+family；匿名註冊/login/recovery/Google/health/OPTIONS例外、refresh/logout專用處理，不以fallback把unknownAPI404變401。

- [ ] **PF-IT-026** `RestartLocalPlatform_DifferentCwdOrContainerRebuild_UsesSameDiskState`（P0）
  - **位置**：`scripts/tests/integration/local-state.test.ts`
  - **來源**：PF-BDD-063；PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-026
  - **目標**：固定磁碟狀態。
  - **前提**：真本地Docker/Wrangler，已建Account/family/有效EmailChallenge/probe。
  - **動作**：從另一cwd停止／重啟／重建並查資料。
  - **預期**：同絕對state目錄，資料／有效family／碼／probe保留，撤銷不復活；無第二可寫DB。

- [ ] **PF-IT-027** `RunLocalDataCommands_QueriesAndChanges_RejectsRemoteAndSecretProjection`（P0）
  - **位置**：`scripts/tests/integration/local-data-tools.test.ts`
  - **來源**：PF-BDD-064；PF-AC-011、PF-AC-016、PF-AC-037
  - **目標**：本地查改命令。
  - **前提**：真D1與專案wrappers，local測試seed。
  - **動作**：migrate重跑、seed、固定views、executefile改狀態；傳remote/config/未知view。
  - **預期**：既有Account保留、應用讀到狀態變更；view無hash/MAC/subject；非法參數拒絕，未操作雲端資料。

- [ ] **PF-IT-028** `BackupAndRestore_NewInstanceAndSafePaths_PreservesOriginalAndConstraints`（P0）
  - **位置**：`scripts/tests/integration/local-backup.test.ts`
  - **來源**：PF-BDD-065；PF-AC-012
  - **目標**：真磁碟備份還原。
  - **前提**：真localinstance有資料與活躍寫入，可用隔離workspace。
  - **動作**：暫停寫入export、重名／跳脫負例、restore新instance再查。
  - **預期**：不覆備份／原instance，schema／Account／FK/UNIQUE一致；所有wrappers指新instance；拒remote與任意config。

- [ ] **PF-IT-029** `RestartSecretsAndSessions_PersistedSymmetricSecrets_KeepValidArtifactsAndRevocations`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/Infrastructure/KeyRestartTests.cs`
  - **來源**：PF-BDD-063、PF-BDD-067；PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-026、PF-AC-028
  - **目標**：單一對稱秘密與Session重啟持久。
  - **前提**：真container+D1，持久注入ACCESS_TOKEN_SECRET、EMAIL_CODE_HMAC_KEY、RATE_LIMIT_HMAC_KEY，具未過期HS256 Access、有效／撤銷family與active EmailChallenge。
  - **動作**：重啟container再驗HS256 Access、Refresh與Email驗證碼。
  - **預期**：有效保持、撤銷不復活；重啟不隨機重造秘密。

- [ ] **PF-IT-030** `RotateSymmetricSecrets_AccessAndCodeSecretReplacement_EnforcesCleanInvalidation`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/Infrastructure/KeyRotationTests.cs`
  - **來源**：PF-BDD-035、PF-BDD-067；PF-AC-005、PF-AC-006、PF-AC-023、PF-AC-026、PF-AC-028
  - **目標**：驗證D-019/D-026/D-027單一對稱秘密更換行為。
  - **前提**：真container+D1，既有HS256 Access、有效Refresh與未完成EmailChallenge。
  - **動作**：更換ACCESS_TOKEN_SECRET、EMAIL_CODE_HMAC_KEY與RATE_LIMIT_HMAC_KEY後驗證舊Access、執行Refresh換發新Access、驗證舊挑戰碼。
  - **預期**：更換ACCESS_TOKEN_SECRET後舊Access回401 ACCESS_TOKEN_INVALID，但未撤銷family仍可以Refresh成功換發新Access；更換EMAIL_CODE_HMAC_KEY後舊未完成挑戰驗碼失敗須重請；秘密不入bundle或一般log。

- [ ] **PF-IT-031** `CleanupExpiredArtifacts_RetentionAndSelfReferences_DeletesInBoundedOrder`（P1）
  - **位置**：`cloudflare/tests/integration/foundation-cleanup.test.ts`
  - **來源**：PF-BDD-060、PF-BDD-067；PF-AC-006、PF-AC-017、PF-AC-026、PF-AC-028、PF-AC-036
  - **目標**：清理實際FK／期限。
  - **前提**：真D1，超過1000筆bucket／challenge與Refreshselfreference資料。
  - **動作**：容器休眠時由Worker scheduled固定cleanupcommand，在預算內處理>1000 backlog多批與中途故障重試。
  - **預期**：每批≤1000且記backlog/重試，依retention條件、Refresh selfreference/records先family後；未到期不刪、不依容器timer，Email24小時內移除、Refresh/family絕對+7日。

- [ ] **PF-IT-032** `RunLocalEmailFlow_TrustedLogSender_OutputsOnlyDedicatedBackendCategory`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/Email/LocalEmailSenderTests.cs`
  - **來源**：PF-BDD-002、PF-BDD-011、PF-BDD-044；PF-AC-004、PF-AC-008、PF-AC-016、PF-AC-019、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031
  - **目標**：local專用log完整流程。
  - **前提**：真local後端／D1，明確local+Log，攔截一般telemetry與accesslog。
  - **動作**：請註冊／reset碼，從專用後端category取碼完成，再試serverLogmode。
  - **預期**：只專用category含目的/challenge/收件人/generation/code/期限；一般log/前端/URL不含碼，serverLogmode拒ready。

- [ ] **PF-IT-033** `SendCloudEmail_FixedTemplateAndTenSecondTimeout_HandlesProviderFailuresHonestly`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/Email/CloudflareEmailHandlerTests.cs`
  - **來源**：PF-BDD-040、PF-BDD-044、PF-BDD-046；PF-AC-016、PF-AC-019、PF-AC-028、PF-AC-029、PF-AC-031
  - **目標**：EMAIL handler、10秒逾時與註冊503／重設202分界。
  - **前提**：真D1／outbound handler，受控EMAIL fake只供故障測試。
  - **動作**：測試任意recipient/template負例、快速send、provider拒絕與10秒timeout，並於60秒冷卻後執行CAS重寄。
  - **預期**：僅固定範本與active挑戰可send；sender逾10秒或失敗時，Email註冊與其resend回503 EMAIL_DELIVERY_FAILED（挑戰保留供60秒後CAS重寄新generation），忘記密碼與其resend仍回同形通用202並記內部錯誤log。

- [ ] **PF-IT-034** `EvaluateEnvironment_ResourceMismatchOrDependencyFailure_RejectsReadiness`（P0）
  - **位置**：`server/tests/DatingHigh.Integration.Tests/Infrastructure/ReadinessTests.cs`
  - **來源**：PF-BDD-041、PF-BDD-066；PF-AC-013、PF-AC-015、PF-AC-017、PF-AC-024、PF-AC-029
  - **目標**：真ready與環境preflight。
  - **前提**：真Workercontainer，隔離D1/R2，逐項錯bindings／schema／keys／sender／probe。
  - **動作**：啟動或呼叫ready及deploypreflight，不實際對production作負例。
  - **預期**：錯target／相容性停止，缺任一依賴503且回應去敏；不每health寄信，live僅程序存活。

- [ ] **PF-IT-035** `BuildFoundation_PinnedCompatibleStack_ExportsSpaAndStartsContainer`（P1）
  - **位置**：`scripts/tests/integration/foundation-build.test.ts`
  - **來源**：PF-BDD-001、PF-BDD-066；PF-AC-001、PF-AC-013、PF-AC-015、PF-AC-018、PF-AC-029
  - **目標**：實際本地基礎建置。
  - **前提**：鎖定SDK／packages／image及完整本地工具鏈，無真雲端秘密入client。
  - **動作**：build.NET Linux8080container、exportExpoWeb single、啟Worker本地訪SPA/API。
  - **預期**：建置產物／lockfile／digest可追溯、SPA與API路由正確；實際原生build另由E2E，不以此代替。

## 3️⃣ API 端點測試（API Tests）

**共通測試位置**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`；ASP.NET HTTP host 與 Worker contract。共 **17 組公開端點、每端點 3 案（正常／拒絕／故障），合計 51 案**（原 `3.3` 之 `PF-API-007..009` 因 D-023 移除外部註冊收件碼端點而刪減，既有編號不重編）。健康端點公開，不新增登入門檻。

**路由／授權矩陣（每案共通斷言）**：`GET /session`、`GET /me`、`PUT /me/password`、`POST /me/identities/{provider}`、`GET /me/identities`、`DELETE /me/identities/{provider}` 六條受保護路由明確設定 `RequireAuthorization`（HS256 Access＋D1 primary family 驗證）；逐一驗證缺失、過期、無效、已撤銷或被新登入取代之 Access 皆回 401 且 handler 執行 0 次。註冊、帳密登入、復原、Google 登入、health 與 `OPTIONS` 明列匿名，`refresh`/`logout` 使用專用憑證處理，不被一般 Access fallback 攔截；未知 `/api/*` 回 JSON 404 不落入 SPA。所有已登入回應均附 `X-DatingHigh-Session: <sessionId>` 並透過 `Access-Control-Expose-Headers: X-DatingHigh-Session` 暴露給 Web 分頁同步狀態。

### 3.1 `POST /api/v1/email-registrations`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-002、PF-BDD-026、PF-BDD-040、PF-BDD-056、PF-BDD-057、PF-BDD-070；PF-AC-002、PF-AC-004、PF-AC-017、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-031、PF-AC-036
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-001** `RequestEmailRegistration_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 未註冊合法Email、sender可用、合法Web/ios/android | 送出 POST /api/v1/email-registrations | 202回challengeId、flowToken、expiresAt、resendAfter，無Account或平台token |
| - [ ] **PF-API-002** `RequestEmailRegistration_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 非法Email 400、已註冊409 EMAIL_ALREADY_REGISTERED、超寄碼額度429且sender呼叫0次；Web CSRF或帶Origin卻非web拒絕 | 逐項拒絕條件送出 POST /api/v1/email-registrations | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-003** `RequestEmailRegistration_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 未註冊合法Email、合法Web/ios/android | 注入D1/bridge故障或sender失敗／10秒逾時後送 POST /api/v1/email-registrations | D1/bridge故障回503 DEPENDENCY_UNAVAILABLE；sender失敗或逾10秒回503 EMAIL_DELIVERY_FAILED（挑戰保留供冷卻後重寄） |

### 3.2 `POST /api/v1/accounts`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-003、PF-BDD-025、PF-BDD-038、PF-BDD-045、PF-BDD-047、PF-BDD-048、PF-BDD-071、PF-BDD-072、PF-BDD-084、PF-BDD-091；PF-AC-002、PF-AC-004、PF-AC-005、PF-AC-016、PF-AC-017、PF-AC-021、PF-AC-027、PF-AC-028、PF-AC-030、PF-AC-032
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-004** `ConfirmEmailRegistration_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效active之register_email挑戰、正確flow/code/合規密碼 | 送出 POST /api/v1/accounts | 201已驗Account及family/gen0 Refresh（附X-DatingHigh-Session標頭）；Web設兩Cookie無raw token，native回token pair |
| - [ ] **PF-API-005** `ConfirmEmailRegistration_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 錯flow/purpose/code 400、過期/消耗410、重複Email 409、錯型別/重複JSON/未知欄400、>16KiB 413、限流429 | 逐項拒絕條件送出 POST /api/v1/accounts | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-006** `ConfirmEmailRegistration_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效active之register_email挑戰、正確flow/code/合規密碼 | 注入D1 SQL故障或前置條件不符後送 POST /api/v1/accounts | 同一D1 batch共用挑戰active前置條件並將消耗挑戰放最後一句，故障或衝突整批回滾回503，不留半套資料且不單獨消耗碼 |

> 註：原 `3.3`（`PF-API-007`～`PF-API-009`）已依 D-023 移除（首次 Google 登入改於 `3.13 POST /api/v1/sessions/external/{provider}` 直接原子建帳並回 201），既有編號不重編。

### 3.4 `POST /api/v1/email-challenges/{id}/resend`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-038、PF-BDD-040、PF-BDD-046、PF-BDD-047、PF-BDD-084、PF-BDD-091；PF-AC-002、PF-AC-004、PF-AC-017、PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031、PF-AC-032
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-010** `ResendEmailChallenge_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 正確flow、60秒冷卻已過、未絕對到期，含register_email與reset_password | 送出 POST /api/v1/email-challenges/{id}/resend | 202新generation使舊碼失效；reset同形通用202；必要I/O完成即回、無固定人工延遲 |
| - [ ] **PF-API-011** `ResendEmailChallenge_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 錯flow 400、過期/消耗410、60秒內或Email額度超限429+Retry-After、改recipient/purpose/platform拒絕 | 逐項拒絕條件送出 POST /api/v1/email-challenges/{id}/resend | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-012** `ResendEmailChallenge_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 正確flow、60秒冷卻已過、未絕對到期，含register_email與reset_password | 注入D1故障或sender失敗／10秒逾時後送 POST /api/v1/email-challenges/{id}/resend | D1故障回503 DEPENDENCY_UNAVAILABLE；sender失敗時註冊重寄回503 EMAIL_DELIVERY_FAILED，忘記密碼重寄仍回同形通用202並記內部log |

### 3.5 `POST /api/v1/sessions`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-004、PF-BDD-026、PF-BDD-027、PF-BDD-028、PF-BDD-035、PF-BDD-036、PF-BDD-037、PF-BDD-074；PF-AC-002、PF-AC-003、PF-AC-004、PF-AC-005、PF-AC-006、PF-AC-016、PF-AC-017、PF-AC-019、PF-AC-020、PF-AC-023、PF-AC-027、PF-AC-035
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-013** `CreatePasswordSession_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 同Account跨Web/ios/android先後登入；已有一有效及歷史revoked family | 送出 POST /api/v1/sessions | 201回同Account並附X-DatingHigh-Session；同一D1 batch撤銷全部revoked_at IS NULL舊列為replaced_by_login並建新family與Refresh（不寫auth_accounts、不加cv） |
| - [ ] **PF-API-014** `CreatePasswordSession_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 錯密碼/未知Email/Google-only皆401 INVALID_CREDENTIALS且dummy驗證；格式400、帶Origin卻非web 400、CSRF不合拒絕、限流429 | 逐項拒絕條件送出 POST /api/v1/sessions | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-015** `CreatePasswordSession_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 同Account已有一有效family | 注入D1新family／Refresh寫入故障或cv變更後送 POST /api/v1/sessions | D1故障回503且整批回滾保留原有效family；cv不符則插入0列不發pair；pair於commit前簽署備妥但不曝光 |

### 3.6 `POST /api/v1/session/refresh`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-008、PF-BDD-021、PF-BDD-035、PF-BDD-036、PF-BDD-051、PF-BDD-052、PF-BDD-053、PF-BDD-056、PF-BDD-076、PF-BDD-086、PF-BDD-087、PF-BDD-088；PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-017、PF-AC-020、PF-AC-022、PF-AC-023、PF-AC-024、PF-AC-025、PF-AC-026、PF-AC-036
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-016** `RefreshSession_ValidRequestOrGraceRetry_ReturnsContractSuccess` | 正常HTTP契約与30秒寬限重試 | 合法未消耗Refresh，或consumed_at 30秒內緊接前一代（generation=current-1）重試 | 送出 POST /api/v1/session/refresh | 200回唯一新後繼與HS256 Access（附X-DatingHigh-Session），更新idle不延absolute；Web更新兩Cookie無raw token，原生回token pair |
| - [ ] **PF-API-017** `RefreshSession_RejectedInputConflictOrReuse_EnforcesContractBoundary` | 拒絕分支、並行409與逾30秒重放401 | 帶Origin卻非web 400；Access冒充Refresh 401；30秒內並行落敗409 REFRESH_RETRY（不撤銷）；逾30秒重放401 REFRESH_TOKEN_REUSE（撤銷整個family）；expired/invalid/revoked 401；超額429 | 逐項條件送出 POST /api/v1/session/refresh | 各參數驗指定狀態/code；409 REFRESH_RETRY保留family可用，逾30秒重放持久撤銷原family；ProblemDetails不洩秘密 |
| - [ ] **PF-API-018** `RefreshSession_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 合法Refresh且family當前有效 | 注入D1後繼插入／consumed更新SQL故障或UNIQUE衝突後送 POST /api/v1/session/refresh | D1故障回503且整批回滾，還原current_generation/idle/token狀態，不發pair；IP gate通過後逾30秒之consumed重放撤銷不受session輪替額度阻擋 |

### 3.7 `GET /api/v1/session`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-009、PF-BDD-021、PF-BDD-035、PF-BDD-036；PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-009、PF-AC-016、PF-AC-023、PF-AC-025、PF-AC-034
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-019** `GetSession_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效平台HS256 Access+D1 family | 送出 GET /api/v1/session | 200回account/session/tokenMetadata（不含raw token）並附X-DatingHigh-Session: <sessionId> |
| - [ ] **PF-API-020** `GetSession_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 缺/過期/無效Access、revoked/被取代/cv不符family回401；Google/Refresh不得代Access | 逐項拒絕條件送出 GET /api/v1/session | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-021** `GetSession_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效平台HS256 Access | 注入D1 primary查詢故障後送 GET /api/v1/session | D1故障回503，不回假登入或固定資料 |

### 3.8 `DELETE /api/v1/session`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-015、PF-BDD-022、PF-BDD-036、PF-BDD-037、PF-BDD-054、PF-BDD-076、PF-BDD-086、PF-BDD-090；PF-AC-002、PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-020、PF-AC-022、PF-AC-023、PF-AC-024、PF-AC-025、PF-AC-026
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-022** `DeleteSession_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 可識別當前或歷史replaced family憑證，含無憑證/已撤銷 | 送出 DELETE /api/v1/session | 204只撤憑證所屬原family並清除Web Cookie；舊裝置logout重試不撤銷最新有效family；無憑證/已撤銷保持冪等204 |
| - [ ] **PF-API-023** `DeleteSession_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 同時提供指向不同family之Access與Refresh回400、帶Origin卻非web 400、Web CSRF不合回403 | 逐項拒絕條件送出 DELETE /api/v1/session | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-024** `DeleteSession_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 可識別family需D1撤銷；另設無憑證不需D1對照 | 對原family注入D1 revoke故障；另送無憑證logout | 需D1撤銷之原family故障回503，不宣稱完成且不清待撤銷重試憑證；無憑證仍204 |

### 3.9 `GET /api/v1/me`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-009、PF-BDD-035、PF-BDD-043、PF-BDD-076、PF-BDD-079、PF-BDD-086；PF-AC-002、PF-AC-003、PF-AC-005、PF-AC-006、PF-AC-009、PF-AC-014、PF-AC-016、PF-AC-020、PF-AC-022、PF-AC-023、PF-AC-025、PF-AC-034
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-025** `GetMe_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效本人Access+D1 family | 送出 GET /api/v1/me | 200回本人AccountDto（含本人Email與登入方式摘要）並附X-DatingHigh-Session，不回hash/外部subject/raw token |
| - [ ] **PF-API-026** `GetMe_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 缺/expired/revoked/被取代Access 401；owner覆寫參數400；Google/Refresh當Bearer 401 | 逐項拒絕條件送出 GET /api/v1/me | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-027** `GetMe_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效本人Access | 注入D1 family/Account讀取故障後送 GET /api/v1/me | D1故障回503，不用固定demo或空DTO假成功 |

### 3.10 `PUT /api/v1/me/password`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-010、PF-BDD-023、PF-BDD-027、PF-BDD-050、PF-BDD-055、PF-BDD-076、PF-BDD-080、PF-BDD-086；PF-AC-002、PF-AC-004、PF-AC-005、PF-AC-007、PF-AC-016、PF-AC-020、PF-AC-022、PF-AC-025、PF-AC-035
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-028** `ChangePassword_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效本人Access/family、正確目前密碼與合規新密碼 | 送出 PUT /api/v1/me/password | 204條件更新password_hash並將credential_version加1，所有舊憑證立即失效並清除Web Cookie pair |
| - [ ] **PF-API-029** `ChangePassword_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 新密碼非法400、錯目前密碼/Access 401、無本地密碼409 PASSWORD_NOT_SET、版本衝突409 CREDENTIAL_CHANGED、限流429 | 逐項拒絕條件送出 PUT /api/v1/me/password | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-030** `ChangePassword_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效本人Access/family、正確目前密碼與合規新密碼 | 注入D1條件更新故障後送 PUT /api/v1/me/password | D1故障回503，原hash與cv不變；最終0列不回成功 |

### 3.11 `POST /api/v1/password-reset-requests`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-040、PF-BDD-077；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-031** `RequestPasswordReset_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 已知/未知/Google-only合法Email，sender全域設定一致 | 送出 POST /api/v1/password-reset-requests | 202回同形metadata及『若此 Email 可處理，將收到驗證碼』；未知不寄且永不能reset；必要I/O完成即回不加人為固定延遲（D-018） |
| - [ ] **PF-API-032** `RequestPasswordReset_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 非法Email 400、超額429+Retry-After、Web Origin/JSON/header不合拒絕；未知Email不得回404或特殊shape | 逐項拒絕條件送出 POST /api/v1/password-reset-requests | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-033** `RequestPasswordReset_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 已知/未知/Google-only合法Email | 注入D1故障或sender失敗／10秒逾時後送 POST /api/v1/password-reset-requests | D1故障查帳號前一致回503；已知Email遇sender失敗或逾10秒仍回同形通用202並記內部錯誤log |

### 3.12 `POST /api/v1/password-resets`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-039、PF-BDD-049、PF-BDD-078；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-034** `ResetPassword_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效active reset挑戰綁Account/cv、正確flow/code及合規newPassword | 送出 POST /api/v1/password-resets | 204同一D1 batch更新password_hash與credential_version+1並於最後一句消耗挑戰，不自動登入，Google綁定保留 |
| - [ ] **PF-API-035** `ResetPassword_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 錯/過期/重用/錯purpose/flow/未知Account碼400 INVALID_OR_EXPIRED_CODE、cv已改409 CREDENTIAL_CHANGED、密碼非法400、限流429 | 逐項拒絕條件送出 POST /api/v1/password-resets | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-036** `ResetPassword_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效active reset挑戰綁Account/cv、正確flow/code及合規newPassword | 注入D1 SQL故障後送 POST /api/v1/password-resets | 同一D1 batch故障整批回滾回503，挑戰保持active、password_hash與cv不變 |

### 3.13 `POST /api/v1/sessions/external/{provider}`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-005、PF-BDD-007、PF-BDD-017、PF-BDD-029、PF-BDD-030、PF-BDD-031、PF-BDD-048、PF-BDD-074、PF-BDD-075、PF-BDD-076；PF-AC-002、PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-022、PF-AC-023、PF-AC-025、PF-AC-027、PF-AC-028、PF-AC-032、PF-AC-034、PF-AC-035
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-037** `CreateExternalSession_ValidExistingOrFirstTime_Returns200Or201Directly` | 正常HTTP契約（既有200與首次直接建帳201） | 合法可信網域（gmail.com或相符hd）之Google credential，對應既有(google, sub)或全新未註冊身分 | 送出 POST /api/v1/sessions/external/{provider} | 既有綁定回200並同batch撤銷舊family建新family；全新(google, sub)且Email未註冊時直接同batch建無密碼Account＋identity＋family＋Refresh並回201（附X-DatingHigh-Session） |
| - [ ] **PF-API-038** `CreateExternalSession_RejectedInputOrUntrustedDomain_EnforcesContractBoundary` | 拒絕分支與非可信網域401 | 未知provider 400 UNSUPPORTED_PROVIDER；簽章/issuer/aud/azp/exp/sub/email_verified錯401 EXTERNAL_CREDENTIAL_INVALID；非gmail.com且無相符hd回401 EXTERNAL_EMAIL_UNTRUSTED；同Email已存在409 EMAIL_ALREADY_REGISTERED、既有sub之Email變更409 EXTERNAL_EMAIL_CHANGED；限流429 | 逐項拒絕條件送出 POST /api/v1/sessions/external/{provider} | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-039** `CreateExternalSession_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 合法Google credential | 注入JWKS/D1/bridge故障後送 POST /api/v1/sessions/external/{provider} | 故障回503且整批回滾不假成功；commit前失敗保留既有登入且不留孤立Account/identity |

### 3.14 `POST /api/v1/me/identities/{provider}`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-013、PF-BDD-018、PF-BDD-032、PF-BDD-033、PF-BDD-050、PF-BDD-076、PF-BDD-081、PF-BDD-086；PF-AC-002、PF-AC-005、PF-AC-020、PF-AC-021、PF-AC-022、PF-AC-025、PF-AC-034、PF-AC-035
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-040** `LinkExternalIdentity_ValidRequest_ReturnsContractSuccessWithoutReLogin` | 正常HTTP契約（不需密碼、不踢登出） | 有效本人Access/family與同Email可信網域之Google credential（含首次連結與同identity重複連結） | 送出 POST /api/v1/me/identities/{provider}（僅credential與clientPlatform） | 200回 `{provider: "google", linked: true}` 並附X-DatingHigh-Session；不增加credential_version、不撤銷目前family、不清除Web Cookie |
| - [ ] **PF-API-041** `LinkExternalIdentity_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 無有效Access/family 401、無效credential或非可信網域401、EXTERNAL_EMAIL_MISMATCH/EXTERNAL_IDENTITY_IN_USE/CREDENTIAL_CHANGED 409、未知provider/額外欄400、external_credential.v1限流429 | 逐項拒絕條件送出 POST /api/v1/me/identities/{provider} | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-042** `LinkExternalIdentity_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效本人Access/family與同Email Google credential | 注入D1寫入故障或提交前family失效／cv變更後送 POST /api/v1/me/identities/{provider} | D1故障回503且不寫入identity；提交前family撤銷或cv變更則插入0列並回401或409 |

### 3.15 `GET /api/v1/me/identities`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-009、PF-BDD-034、PF-BDD-076、PF-BDD-079、PF-BDD-086；PF-AC-002、PF-AC-003、PF-AC-005、PF-AC-009、PF-AC-016、PF-AC-020、PF-AC-022、PF-AC-023、PF-AC-025、PF-AC-034
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-043** `GetExternalIdentities_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效本人Access/family，含空集合 | 送出 GET /api/v1/me/identities | 200回hasLocalPassword與identities[{provider,linkedAt}]並附X-DatingHigh-Session，不回外部subject或Email |
| - [ ] **PF-API-044** `GetExternalIdentities_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 缺/expired/revoked/被取代Access 401；owner覆寫參數400 | 逐項拒絕條件送出 GET /api/v1/me/identities | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-045** `GetExternalIdentities_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效本人Access/family | 注入D1查詢故障後送 GET /api/v1/me/identities | D1故障回503，不以空集合掩蓋依賴失敗 |

### 3.16 `DELETE /api/v1/me/identities/{provider}`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-014、PF-BDD-032、PF-BDD-033、PF-BDD-034、PF-BDD-050、PF-BDD-076、PF-BDD-081、PF-BDD-086；PF-AC-002、PF-AC-005、PF-AC-007、PF-AC-020、PF-AC-021、PF-AC-022、PF-AC-025
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-046** `UnlinkExternalIdentity_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | 有效本人Access/family、正確目前本地密碼、已綁定指定provider | 送出 DELETE /api/v1/me/identities/{provider} | 204同一D1 batch將credential_version加1並刪除本人指定provider identity，使全部舊family失效並清除Web Cookie pair |
| - [ ] **PF-API-047** `UnlinkExternalIdentity_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | Access無效401、錯目前密碼400/401、無本地密碼409 LAST_LOGIN_METHOD、版本衝突409 CREDENTIAL_CHANGED、未知provider 400、credential_change.v1限流429 | 逐項拒絕條件送出 DELETE /api/v1/me/identities/{provider} | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-048** `UnlinkExternalIdentity_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | 有效本人Access/family、正確目前本地密碼 | 注入D1刪除／cv更新SQL故障後送 DELETE /api/v1/me/identities/{provider} | 同一D1 batch故障整批回滾回503，identity與cv保持不變，不能假解除 |

### 3.17 `GET /health/live`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-001、PF-BDD-041、PF-BDD-042、PF-BDD-066、PF-BDD-092；PF-AC-001、PF-AC-002、PF-AC-013、PF-AC-015、PF-AC-016、PF-AC-017、PF-AC-018、PF-AC-024、PF-AC-025、PF-AC-029
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-049** `GetLiveness_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | container程序可達已啟動，公開端點無認證要求 | 送出 GET /health/live | 200 status:alive，僅程序存活，不探D1/R2也不曝資源資訊 |
| - [ ] **PF-API-050** `GetLiveness_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 偽造internal/user context headers不可取得可信身份，Worker清除後live仍可200；不新增認證門檻 | 逐項拒絕條件送出 GET /health/live | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-051** `GetLiveness_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | HTTP Worker可達，container未成功啟動/啟動中；另設已啟程序但D1/R2故障 | 使Worker→container啟動逾時/不可達；另測已啟程序僅D1/R2故障 | Worker到container不可啟動/不可達503，啟動超時504 STARTUP_TIMEOUT；程序已啟動僅D1/R2故障時live 200/ready 503，無假alive/SPA |

### 3.18 `GET /health/ready`

**位置（每案）**：`server/tests/DatingHigh.Api.Tests/PlatformFoundationEndpointTests.cs`
**來源（每案）**：PF-BDD-041、PF-BDD-044、PF-BDD-066、PF-BDD-067、PF-BDD-093；PF-AC-006、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-016、PF-AC-017、PF-AC-019、PF-AC-024、PF-AC-026、PF-AC-028、PF-AC-029、PF-AC-031
**優先級（每案）**：P0

| 完成／唯一 ID／名稱 | 目標 | 前提 | 動作 | 預期 |
|---|---|---|---|---|
| - [ ] **PF-API-052** `GetReadiness_ValidRequest_ReturnsContractSuccess` | 正常HTTP契約 | D1 migration/schema(54欄)、R2 probe、環境對稱秘密、環境sender與實際binding全就緒 | 送出 GET /health/ready | 200 ready去敏，不每次health寄信，不建metadata表 |
| - [ ] **PF-API-053** `GetReadiness_RejectedInputOrAuthorization_EnforcesContractBoundary` | 拒絕分支 | 錯target/不相容schema/server Log模式/缺sender或對稱秘密回503 unavailable+traceId，不降級假ready | 逐項拒絕條件送出 GET /health/ready | 各參數驗指定狀態/code、handler零未授權副作用；ProblemDetails不洩秘密 |
| - [ ] **PF-API-054** `GetReadiness_DependencyOrExecutionFailure_ReturnsHonestFailure` | 依賴／執行失敗 | D1/R2/bridge原本就緒 | 注入D1/R2/bridge故障後送 GET /health/ready | D1/R2/bridge故障回503，live已啟程序仍200；不曝DB/bucket/SQL/path/secret |

敏感 HTTP 回應皆驗證 `Cache-Control: no-store`、錯誤 `application/problem+json` 含 `type/title/status/code/traceId`，`camelCase`／UTC ISO8601／UUIDv7 正確；建立與刷新 session 依 `web`/`ios`/`android` 兩條傳輸規則運作，所有已登入回應皆附 `X-DatingHigh-Session` 標頭。

## 4️⃣ E2E 測試（End-to-End Tests）

`.spec.ts` 為後續可自動化的 Web／client 行為測試；`runbooks/*.md` 為需要真裝置、真服務、build 或收件證據的可執行驗收清單。這些路徑皆為規劃，尚未建立。每案的參數平台各自記錄結果；任一必要平台／環境未執行，該案不得全數完成。

- [ ] **PF-E2E-001** `BuildAndRun_ThreeDevelopmentPlatforms_CompletesFoundationAccountFlow`（P0）
  - **位置**：`tests/e2e/runbooks/foundation-three-platforms.md`
  - **來源**：PF-BDD-001、PF-BDD-004、PF-BDD-007、PF-BDD-020、PF-BDD-094；PF-AC-001、PF-AC-003、PF-AC-005、PF-AC-018、PF-AC-019、PF-AC-021、PF-AC-023、PF-AC-025、PF-AC-026、PF-AC-034
  - **平台／環境**：Web＋Android＋iOS，各local或staging依執行環境可達API。
  - **目標**：三平台原生／Webbuild與基本流程。
  - **前提**：已配置實際SDK、Android簽章、iOSmacOS/Xcode或可驗證雲端build，真帳號。
  - **動作**：Webexport/原生developmentbuild安裝；三平台依序各以Email與真Google登入，核本人頁/refresh再登出，另測新裝置成功取代舊。
  - **預期**：逐平台保存build/裝置/時間/結果、AccountID不變；新登入commit立即server撤舊，舊裝置下一API/回前景核驗後提示重新登入；不加push、不宣稱離線畫面同毫秒改變。失敗commit前保舊，最後成功commit唯一；iOS缺證仍未驗收。

- [ ] **PF-E2E-002** `OperateFoundation_ResponsiveKeyboardAndAccessibility_UsesPrototypeVisuals`（P1）
  - **位置**：`tests/e2e/web/foundation-visual-accessibility.spec.ts`
  - **來源**：PF-BDD-024、PF-BDD-068、PF-BDD-069；PF-AC-001、PF-AC-002、PF-AC-003、PF-AC-018、PF-AC-019
  - **平台／環境**：Web與Android／iOS，local／staging。
  - **目標**：原型視覺及可操作性。
  - **前提**：小螢幕／大螢幕、實際鍵盤與safearea，Web鍵盤／減少動態偏好。
  - **動作**：開開始頁及帳號表單，捲動／focus／讀屏label／Google未就緒替代。
  - **預期**：玫瑰深紫／半透明風格，鍵盤不遮按鈕；focus可見、錯誤不只顏色、動態可減少；Google未就緒明示而Email仍可用。

- [ ] **PF-E2E-003** `RegisterEmail_ValidationCodeResendAndDuplicate_CreatesOneVerifiedAccount`（P0）
  - **位置**：`tests/e2e/web/email-registration.spec.ts`
  - **來源**：PF-BDD-002、PF-BDD-003、PF-BDD-026、PF-BDD-027、PF-BDD-037、PF-BDD-038、PF-BDD-045、PF-BDD-046、PF-BDD-047、PF-BDD-063、PF-BDD-070、PF-BDD-071、PF-BDD-072、PF-BDD-084、PF-BDD-091；PF-AC-002、PF-AC-004、PF-AC-005、PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-017、PF-AC-020、PF-AC-026、PF-AC-027、PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031、PF-AC-032、PF-AC-035
  - **平台／環境**：Web及原生必要流程，local真log／staging真信分列。
  - **目標**：Email註冊完整UX。
  - **前提**：未註冊Email、server限流／clock受控；碼從指定local終端或真信取得。
  - **動作**：非法表單、請碼、前導零碼、錯碼／過期／flow缺失、60秒重寄、確認與重複Email。
  - **預期**：清楚欄位／錯誤／倒數，pending禁重送；舊碼失效、5次鎖定；成功前無本人登入、成功唯一Account，重複提示原方式登入／連結；本地真瀏覽器localhost:8081→localhost:8787帶credentials與dev Strict pair完成註冊/login/refresh/logout；Worker仍可bind127.0.0.1；公開API改127.0.0.1或錯Origin不得當合法same-site成功。

- [ ] **PF-E2E-004** `RegisterAndLoginGoogle_FirstTimeDirectAccountCreationThenExistingLogin_UsesSameAccount`（P0）
  - **位置**：`tests/e2e/runbooks/google-first-registration.md`
  - **來源**：PF-BDD-005、PF-BDD-007、PF-BDD-017、PF-BDD-074；PF-AC-002、PF-AC-004、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-023、PF-AC-028、PF-AC-032、PF-AC-034、PF-AC-035
  - **平台／環境**：Web GIS popup＋iOS／Android真SDK，staging。
  - **目標**：Google首次直接建帳（201）與既有帳號跨裝置登入（200）。
  - **前提**：環境Google client IDs／origin／原生簽章已配置，真Google帳號（gmail.com或相符hd）。
  - **動作**：首次Google登入直接完成建帳進帳號頁，再於另一裝置以同Google帳號登入。
  - **預期**：首次POST /api/v1/sessions/external/google直接回201建立無本地密碼Account與session（無需收件驗證碼）；另一裝置既有Google回200且Account ID相同、原子撤銷前次family；有效proof可重用但每次成功登入仍撤舊，不公開姓名/頭像。

- [ ] **PF-E2E-005** `Login_EmailGoogleCancelOrUnavailable_ShowsCorrectStates`（P1）
  - **位置**：`tests/e2e/web/login-paths.spec.ts`
  - **來源**：PF-BDD-024、PF-BDD-028、PF-BDD-029、PF-BDD-030、PF-BDD-031、PF-BDD-074；PF-AC-002、PF-AC-004、PF-AC-016、PF-AC-017、PF-AC-018、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-027、PF-AC-032、PF-AC-034、PF-AC-035
  - **平台／環境**：Web與原生local／staging。
  - **目標**：登入成功／拒絕／替代入口。
  - **前提**：已存在Email及Google帳號，錯密碼／fake無效Google僅供故障，另有真Google。
  - **動作**：Email登入、錯帳密、Google取消／無效／設定缺失、同址新subject。
  - **預期**：錯密碼與未知帳號同文案；取消留原頁；無效不登入、同址不合併；未就緒顯暫不可用且Email可用，真Google成功另存證。

- [ ] **PF-E2E-006** `RunGoogleOperation_CancelSwitchStaleOrUnknownResult_DoesNotApplyOldAction`（P0）
  - **位置**：`tests/e2e/web/google-operation-lifecycle.spec.ts`
  - **來源**：PF-BDD-075、PF-BDD-076、PF-BDD-083；PF-AC-002、PF-AC-020、PF-AC-022、PF-AC-025
  - **平台／環境**：Web及iOS／Android SDK適配，各自紀錄。
  - **目標**：SDK晚回、HTTP不明與X-DatingHigh-Session比對。
  - **前提**：可控制SDK callback延遲／網路，具兩個Account／family。
  - **動作**：SDK取消／換帳號／登出、晚callback、重複點擊，HTTP已送後斷回應。
  - **預期**：舊序號操作不生效、送連結前核對本機currentSessionId；HTTP pending禁換帳號、不假回滾、不自動重送寫入，以GET /session或/me/identities唯讀確認並比對X-DatingHigh-Session標頭；若發現X-DatingHigh-Session改變或回401 SESSION_REVOKED則清除舊畫面並回登入。

- [ ] **PF-E2E-007** `RequestPasswordReset_KnownUnknownAndGoogleOnly_ShowsGenericFlow`（P0）
  - **位置**：`tests/e2e/web/forgot-password.spec.ts`
  - **來源**：PF-BDD-011、PF-BDD-012、PF-BDD-019、PF-BDD-077、PF-BDD-082；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030
  - **平台／環境**：Web／原生，local與staging收信分列。
  - **目標**：忘記密碼與無密碼帳號引導。
  - **前提**：已註冊、未知、Google-only Email，具合法收件權。
  - **動作**：從forgot/Google-only設定入口執行request/resend；known/unknown/Google-only參數化快速send、拒絕及10秒timeout。
  - **預期**：固定通用文案轉reset不揭露登入方式或投遞狀態，未知Email永不能reset；必要I/O完成即回無固定人工等待（D-018）；Google-only可設密碼並保留Google綁定。

- [ ] **PF-E2E-008** `ResetPassword_InvalidSuccessOrLostResponse_RequiresNewPasswordLogin`（P0）
  - **位置**：`tests/e2e/web/password-reset.spec.ts`
  - **來源**：PF-BDD-011、PF-BDD-012、PF-BDD-039、PF-BDD-078；PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-028、PF-AC-030
  - **平台／環境**：Web／原生，local／staging分列。
  - **目標**：重設完整流程與結果不明。
  - **前提**：一個有效family加歷史revoked、reset碼與可斷回應proxy。
  - **動作**：錯／過期／重用碼、確認密碼不符、正確reset及成功回應遺失。
  - **預期**：拒絕不改；成功回登入，新密碼可用、唯一舊有效與所有歷史token拒絕；不明先試新密碼不重放。新密碼重新登入也採單一登入替換，未commit失敗保舊，不假回滾已commit。

- [ ] **PF-E2E-009** `OpenAccount_OwnSummaryEmptyIdentityAndUnknownResource_ShowsOnlyOwnerData`（P0）
  - **位置**：`tests/e2e/web/account-ownership.spec.ts`
  - **來源**：PF-BDD-009、PF-BDD-016、PF-BDD-043、PF-BDD-079；PF-AC-002、PF-AC-003、PF-AC-009、PF-AC-014、PF-AC-016、PF-AC-023、PF-AC-034
  - **平台／環境**：Web與原生，local／staging。
  - **目標**：本人與空登入方式摘要。
  - **前提**：A／B兩帳號、空或Google identity清單，私人adapter測試fixture。
  - **動作**：開本人頁／connections，嘗試owner覆寫與跨owner測試物件。
  - **預期**：只顯示本人Email／驗證／登入方式，空狀態可操作；不回外部subject或hash，跨owner／未知resource拒絕；不建立媒體公開產品流程。

- [ ] **PF-E2E-010** `ChangePassword_SuccessWrongPasswordOrConflict_InvalidatesAllOldDevices`（P0）
  - **位置**：`tests/e2e/web/change-password.spec.ts`
  - **來源**：PF-BDD-010、PF-BDD-050、PF-BDD-080；PF-AC-002、PF-AC-007、PF-AC-016、PF-AC-022
  - **平台／環境**：Web加第二實裝置／browser，local／staging。
  - **目標**：改密碼UX與撤銷。
  - **前提**：同Account一有效family與多歷史revoked、目前密碼及版本競態。
  - **動作**：錯密碼／弱新密碼／並行變更後提交，再正確改密碼。
  - **預期**：錯誤/衝突不假成功；改密碼後所有舊憑證不可用，回登入並說明需重新登入；正常新登入不加cv、另裝置再成功會取代現family；server撤銷立即，UI下次核驗反應。

- [ ] **PF-E2E-011** `ManageGoogleIdentity_DirectLinkPasswordUnlinkAndConflict_EnforcesD025Rules`（P0）
  - **位置**：`tests/e2e/runbooks/google-identity-management.md`
  - **來源**：PF-BDD-013、PF-BDD-014、PF-BDD-018、PF-BDD-032、PF-BDD-033、PF-BDD-034、PF-BDD-050、PF-BDD-081、PF-BDD-082；PF-AC-002、PF-AC-007、PF-AC-008、PF-AC-021、PF-AC-022、PF-AC-030、PF-AC-034、PF-AC-035
  - **平台／環境**：三平台真Google＋staging。
  - **目標**：Google直接連結（不需密碼、不踢登出）與驗證密碼解除綁定。
  - **前提**：本人已登入帳號、同Email Google與異Email／他人identity；Google-only無本地密碼帳號。
  - **動作**：從connections直接連結Google、重複連結、輸入目前密碼解除Google，並測不同Email／已被他人占用／Google-only無本地密碼嘗試解除。
  - **預期**：連結與重複連結不需密碼、回200顯示『Google 已連結』並保持目前登入；解除綁定須驗目前密碼，成功回204使全部舊family失效並導回登入頁；Google-only嘗試解除回409 LAST_LOGIN_METHOD並引導先透過Email設定本地密碼。

- [ ] **PF-E2E-012** `SubmitForms_LoadingCooldownOrRateLimit_PreventsDuplicateActions`（P1）
  - **位置**：`tests/e2e/web/form-loading-and-limits.spec.ts`
  - **來源**：PF-BDD-070、PF-BDD-071、PF-BDD-072、PF-BDD-083、PF-BDD-084；PF-AC-002、PF-AC-004、PF-AC-017、PF-AC-020、PF-AC-025、PF-AC-027、PF-AC-028、PF-AC-030
  - **平台／環境**：Web及原生local受控延遲／clock。
  - **目標**：loading與額度UX。
  - **前提**：註冊／驗碼／登入／reset表單，sender spy與可見server時間。
  - **動作**：pending多次點擊、返回／切頁、重寄59／60秒、第6次寄碼。
  - **預期**：一個請求、loading可見，切頁不假交易撤銷；倒數依server，429顯可重試時間；超額sender無呼叫。

- [ ] **PF-E2E-013** `HandleApiFailure_NetworkStatusTimeoutAndReadRetry_UsesBoundedRecovery`（P1）
  - **位置**：`tests/e2e/web/network-recovery.spec.ts`
  - **來源**：PF-BDD-021、PF-BDD-076、PF-BDD-078、PF-BDD-085、PF-BDD-092；PF-AC-002、PF-AC-008、PF-AC-015、PF-AC-020、PF-AC-022、PF-AC-025、PF-AC-030
  - **平台／環境**：Web與原生local故障proxy。
  - **目標**：503／504／500及30/45秒。
  - **前提**：受控read／mutation回應丟失、coldstart延遲。
  - **動作**：觸發故障，跨30秒一般與45秒coldstart，檢網路呼叫數。
  - **預期**：顯連線中／trace提示；唯讀最多重試一次；不明mutation不重送，Google唯讀查結果、reset先新密碼登入，不無限等待。

- [ ] **PF-E2E-014** `OperateMultiTabWeb_SingleFlightRefresh409RetryAndSessionHeaderSync_SynchronizesTabs`（P0）
  - **位置**：`tests/e2e/web/multi-tab-refresh.spec.ts`
  - **來源**：PF-BDD-021、PF-BDD-037、PF-BDD-063、PF-BDD-075、PF-BDD-076、PF-BDD-086、PF-BDD-087、PF-BDD-090；PF-AC-002、PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-010、PF-AC-014、PF-AC-020、PF-AC-022、PF-AC-024、PF-AC-025、PF-AC-026
  - **平台／環境**：Web真browser多分頁，local／staging。
  - **目標**：驗證D-020/D-021 Web多分頁操作、30秒寬限／409重試與X-DatingHigh-Session同步。
  - **前提**：localhost:8081→localhost:8787 dev Strict Cookie，開啟多個Web分頁共用Cookie。
  - **動作**：多分頁同時開啟與操作帳號頁（無阻擋頁）；觸發單分頁並行401與雙分頁同時refresh（觸發409 REFRESH_RETRY或30秒寬限重試）；在分頁B登出或重新登入另一Session後切換回分頁A（觸發focus/visibilitychange與API回應比對X-DatingHigh-Session）。
  - **預期**：Web允許多分頁正常操作；單分頁並行401以single-flight合併refresh，雙分頁同時refresh遇409 REFRESH_RETRY時以最新Cookie重試一次即成功；當分頁B登出或換Session後，分頁A於回前景或下次回應發現X-DatingHigh-Session變更或收401 SESSION_REVOKED，立即清除舊私人畫面並導回登入頁；localhost同site Cookie成功、錯Origin負例拒絕。

- [ ] **PF-E2E-015** `RestoreNative_ColdStartStorageFailureOrLostRefresh_RequiresSafeLogin`（P0）
  - **位置**：`tests/e2e/runbooks/native-session-recovery.md`
  - **來源**：PF-BDD-020、PF-BDD-088；PF-AC-005、PF-AC-025、PF-AC-026
  - **平台／環境**：Android＋iOS development build，local／staging。
  - **目標**：原生安全儲存恢復。
  - **前提**：真SecureStore、可受控寫失敗／refresh401／回應遺失，Access只memory。
  - **動作**：殺程式重開、正常刷新、寫後繼失敗及遺失回應。
  - **預期**：正常安全存後繼才放行；失敗清本機登入／回登入不重用舊Refresh；providercredential不落SecureStore；重啟不能拿本機布林進私頁。

- [ ] **PF-E2E-016** `RetryProtectedRequest_PreHandlerExpiryAnd409RefreshRetry_DoesNotDuplicateBusinessWrite`（P0）
  - **位置**：`tests/e2e/web/api-retry-boundary.spec.ts`
  - **來源**：PF-BDD-035、PF-BDD-036、PF-BDD-087；PF-AC-005、PF-AC-006、PF-AC-023、PF-AC-024、PF-AC-025
  - **平台／環境**：Web與原生local可計數handler。
  - **目標**：401重送邊界與409 REFRESH_RETRY單次重試。
  - **前提**：handler spy、Access expiry/missing/SESSION_REVOKED/業務401及refresh 409可控。
  - **動作**：送read與test mutation觸發各種401／409與不明回應。
  - **預期**：僅handler前缺/過期Access可觸發refresh（遇409 REFRESH_RETRY最多重試refresh一次）後重送原請求一次、業務handler只執行一次；SESSION_REVOKED/ACCESS_TOKEN_INVALID/REFRESH_TOKEN_REUSE及未知寫入結果絕不自動重送。

- [ ] **PF-E2E-017** `InspectClientStorage_FlowCompletionExpiryAndSecrets_PreservesOnlyAllowedMetadata`（P0）
  - **位置**：`tests/e2e/web/sensitive-storage-and-flow.spec.ts`
  - **來源**：PF-BDD-044、PF-BDD-089、PF-BDD-091；PF-AC-002、PF-AC-016、PF-AC-019、PF-AC-028、PF-AC-030、PF-AC-031
  - **平台／環境**：Web／原生，local與serverlog檢視分列。
  - **目標**：Email暫存／秘密不外洩。
  - **前提**：可觀察Webstorage／native儲存adapter／bundle／URL／analytics與logging。
  - **動作**：輸入碼密碼、Google登入、重啟flow、完成／過期，再檢各sink。
  - **預期**：Web平台token僅HttpOnlypair，nativeAccessmemoryRefreshSecureStore；Emailflowmetadata限期且清除；無code/password/hash/MAC/privatekey/providercredential落地／洩漏。

- [ ] **PF-E2E-018** `Logout_ReplacedDeviceRetryOrMultiTabSync_NeverRevokesNewLogin`（P0）
  - **位置**：`tests/e2e/web/logout-recovery.spec.ts`
  - **來源**：PF-BDD-015、PF-BDD-022、PF-BDD-037、PF-BDD-054、PF-BDD-086、PF-BDD-090；PF-AC-002、PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-020、PF-AC-024、PF-AC-025、PF-AC-026
  - **平台／環境**：Web與原生，多裝置／多分頁local／staging。
  - **目標**：登出UX、待撤銷恢復與跨分頁同步。
  - **前提**：同Account唯一最新active與歷史replaced family，可阻斷revoke回應及在別裝置成功登入。
  - **動作**：對當前family正常/斷線logout、舊裝置重開撤銷重試、與新成功登入交錯；同瀏覽器另一分頁回前景核驗。
  - **預期**：當前成功204撤銷原family並清Cookie，另一分頁回前景或下次API收401 SESSION_REVOKED即清私人畫面；斷線待撤銷不自動refresh；舊裝置logout/refresh/replay絕不撤銷最新有效family。

- [ ] **PF-E2E-019** `DeployStaging_RealWorkerContainerD1R2AndEmail_PreservesDataAfterRestart`（P0）
  - **位置**：`tests/e2e/runbooks/staging-foundation-release.md`
  - **來源**：PF-BDD-063、PF-BDD-066、PF-BDD-067、PF-BDD-093；PF-AC-006、PF-AC-010、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-019、PF-AC-026、PF-AC-028、PF-AC-029
  - **平台／環境**：真Cloudflare staging，三平台實際連線。
  - **目標**：staging接線／收信／首次Google直接建帳／持久化。
  - **前提**：資源preflight、verified sender與Google設定就緒、相容migration(54欄)／不可變artifact。
  - **動作**：部署Worker→.NET→outbound D1/R2，真收Email註冊與忘記密碼驗證碼完成流程、實測首次Google登入直接建帳，重啟container及查probe。
  - **預期**：保存去敏時間/結果；Account/family/有效EmailChallenge/秘密/probe在重啟後仍正確；公網internal拒絕、unknown API JSON 404、ready真依賴；不把staging作production發布。

- [ ] **PF-E2E-020** `EvaluateCloudSender_LogModeMissingBindingOrDomain_RejectsFakeReadiness`（P0）
  - **位置**：`tests/e2e/runbooks/cloud-email-readiness.md`
  - **來源**：PF-BDD-044、PF-BDD-066、PF-BDD-093、PF-BDD-094；PF-AC-001、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-016、PF-AC-018、PF-AC-019、PF-AC-026、PF-AC-029、PF-AC-031
  - **平台／環境**：staging隔離測試設定；production僅授權後實際驗收。
  - **目標**：server真寄信與不降級。
  - **前提**：已onboardsenderdomain／配額可檢，保留安全設定回復方案。
  - **動作**：staging缺binding／域未就緒／Logmode負例，再恢復合法設定真收件完成註冊reset。
  - **預期**：錯設定ready失敗無rawcode一般log／URL／response；不降級log或fake；provideraccepted不等已收信；production未執行需明列。

- [ ] **PF-E2E-021** `OperateLocalDatabase_BackupNewRestoreAndRestart_UsesOnlyDeveloperDisk`（P0）
  - **位置**：`tests/e2e/runbooks/local-data-operations.md`
  - **來源**：PF-BDD-063、PF-BDD-064、PF-BDD-065；PF-AC-006、PF-AC-010、PF-AC-011、PF-AC-012、PF-AC-014、PF-AC-016、PF-AC-026、PF-AC-037
  - **平台／環境**：真本地磁碟＋D1/R2 emulator，不操作雲端負例。
  - **目標**：開發者查改備份流程。
  - **前提**：僅localwrapper、現有Account/probe與新instance名稱。
  - **動作**：從不同cwd啟動、migrate/seed/query/execute改狀態、backup／restore新instance、重啟。
  - **預期**：視圖無秘密、應用讀到修改；備份不覆寫、原instance不變、schema約束一致；remote/config/path跳脫拒絕；實體資料留使用者磁碟。

- [ ] **PF-E2E-022** `RecoverEmailDelivery_Registration503AndResetGeneric202_AllowsCooldownResend`（P0）
  - **位置**：`tests/e2e/web/email-delivery-recovery.spec.ts`
  - **來源**：PF-BDD-040、PF-BDD-046、PF-BDD-047、PF-BDD-070、PF-BDD-072、PF-BDD-084；PF-AC-002、PF-AC-017、PF-AC-028、PF-AC-029、PF-AC-030、PF-AC-031
  - **平台／環境**：local/test可控sender故障；不作真收信替代。
  - **目標**：驗證D-026 sender 10秒逾時、註冊503 EMAIL_DELIVERY_FAILED與忘記密碼通用202及冷卻重寄UX。
  - **前提**：可注入sender拒絕與10秒timeout，60秒resend冷卻可控。
  - **動作**：分別於Email註冊與忘記密碼觸發sender失敗／逾10秒，再於60秒冷卻後重寄新generation並完成驗證。
  - **預期**：Email註冊與其resend遇sender失敗回503 EMAIL_DELIVERY_FAILED並顯示『驗證碼暫時無法寄送，請稍後重試』；忘記密碼與其resend仍回同形通用202；60秒後重寄產生新generation使舊碼失效並保留錯誤次數與30分鐘絕對期限。

- [ ] **PF-E2E-023** `ExerciseStagingSecurity_ReusableGoogleProofRefreshGraceAndReplay_EnforcesAcceptedRules`（P0）
  - **位置**：`tests/e2e/runbooks/staging-auth-security.md`
  - **來源**：PF-BDD-017、PF-BDD-035、PF-BDD-051、PF-BDD-054、PF-BDD-055、PF-BDD-093；PF-AC-005、PF-AC-006、PF-AC-007、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-019、PF-AC-020、PF-AC-021、PF-AC-023、PF-AC-024、PF-AC-026、PF-AC-029、PF-AC-032、PF-AC-035
  - **平台／環境**：真staging、真Google與平台tokens；秘密只在受控記憶體。
  - **目標**：真服務Google proof重用、Refresh 30秒寬限窗與逾30秒重放撤銷。
  - **前提**：真Google已建帳，一個最新active與歷史revoked family。
  - **動作**：同有效Google proof再次登入；測試Refresh於consumed_at 30秒內緊接前一代重試（200）、並行刷新（409 REFRESH_RETRY）與超過30秒重放（401 REFRESH_TOKEN_REUSE撤銷family）。
  - **預期**：Google proof可再驗並原子撤銷舊family；Refresh 30秒內前一代重試回200再輪替、並行落敗回409不撤銷、逾30秒重放回401持久撤銷原family（且不受session額度阻擋、不影響後來新建之其他family）。

- [ ] **PF-E2E-024** `ReportAcceptance_MissingPlatformCloudResourceOrProductionRelease_RemainsExplicitlyIncomplete`（P1）
  - **位置**：`tests/e2e/runbooks/foundation-evidence-handoff.md`
  - **來源**：PF-BDD-001、PF-BDD-024、PF-BDD-093、PF-BDD-094；PF-AC-001、PF-AC-002、PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-018、PF-AC-019、PF-AC-026、PF-AC-029
  - **平台／環境**：Web／Android／iOS、local／staging／production分列。
  - **目標**：驗收交付與相容回復演練。
  - **前提**：蒐集所有build／run／收信／Google／D1R2／回復紀錄，可能缺iOS或雲端資源。
  - **動作**：逐項核來源、版本、平台、環境、結果，staging演練相容artifactrollback。
  - **預期**：缺項明列未驗收及原因，不以mock／messageID／設定檔冒稱通過；production發布未執行即未發布，回復artifact不自動反向schema或清D1。

## BDD Scenario → TDD 追溯

每列 3–6 個單元案例分別驗規則／授權／預檢與故障政策，並由 Integration／API／E2E 驗證實際協作。共享案例只計一次。全部來源均為本份 `SPEC-001-PlatformFoundation-BDD.md`（共 **92 個唯一 Scenario**；`PF-BDD-006` 與 `PF-BDD-073` 已依 D-023 移除且不重編）。表中的覆蓋為規劃追溯，執行仍為 0%。

| BDD Scenario／標題 | PF-AC | Unit（至少3案） | Integration | API | E2E |
|---|---|---|---|---|---|
| **PF-BDD-001** 建立可追溯的 Expo 三平台及 .NET 分層建置 | PF-AC-001、PF-AC-018 | PF-UT-001、PF-UT-002、PF-UT-003、PF-UT-106、PF-UT-107、PF-UT-108 | PF-IT-035 | PF-API-049、PF-API-050、PF-API-051 | PF-E2E-001、PF-E2E-024 |
| **PF-BDD-002** Email 請求收件碼只建立限時挑戰 | PF-AC-004、PF-AC-027、PF-AC-028、PF-AC-029 | PF-UT-010、PF-UT-016、PF-UT-017、PF-UT-055、PF-UT-057 | PF-IT-002、PF-IT-018、PF-IT-032 | PF-API-001、PF-API-002、PF-API-003 | PF-E2E-003 |
| **PF-BDD-003** Email 收件碼確認原子建立已驗證帳號 | PF-AC-004、PF-AC-027、PF-AC-028 | PF-UT-011、PF-UT-012、PF-UT-109、PF-UT-110、PF-UT-111 | PF-IT-002 | PF-API-004、PF-API-005、PF-API-006 | PF-E2E-003 |
| **PF-BDD-004** Email 帳密先後跨裝置登入僅保留最新 family | PF-AC-003、PF-AC-005、PF-AC-023 | PF-UT-034、PF-UT-035、PF-UT-043、PF-UT-048 | — | PF-API-013、PF-API-014、PF-API-015 | PF-E2E-001 |
| **PF-BDD-005** 首次 Google 登入驗證可信網域並直接原子建立無本地密碼帳號 | PF-AC-004、PF-AC-019、PF-AC-021、PF-AC-028、PF-AC-032、PF-AC-034、PF-AC-035 | PF-UT-011、PF-UT-012、PF-UT-025、PF-UT-026、PF-UT-029、PF-UT-109 | PF-IT-003 | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-004 |
| **PF-BDD-007** 既有 Google 先後跨平台登入僅保留最新 family | PF-AC-019、PF-AC-021、PF-AC-023、PF-AC-034 | PF-UT-025、PF-UT-026、PF-UT-028、PF-UT-034 | — | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-001、PF-E2E-004 |
| **PF-BDD-008** 合法 Refresh 原子輪替並更新受限制的 idle | PF-AC-006、PF-AC-023、PF-AC-024 | PF-UT-035、PF-UT-040、PF-UT-041、PF-UT-042 | PF-IT-010、PF-IT-011 | PF-API-016、PF-API-017、PF-API-018 | — |
| **PF-BDD-009** 本人 session、帳號及登入方式查詢使用可信身分 | PF-AC-003、PF-AC-009、PF-AC-016、PF-AC-023、PF-AC-034 | PF-UT-037、PF-UT-038、PF-UT-039、PF-UT-052、PF-UT-094 | PF-IT-016 | PF-API-019、PF-API-020、PF-API-021、PF-API-025、PF-API-026、PF-API-027、PF-API-043、PF-API-044、PF-API-045 | PF-E2E-009 |
| **PF-BDD-010** 修改目前密碼後全部舊裝置失效 | PF-AC-007、PF-AC-016 | PF-UT-007、PF-UT-008、PF-UT-112、PF-UT-113 | PF-IT-013 | PF-API-028、PF-API-029、PF-API-030 | PF-E2E-010 |
| **PF-BDD-011** 忘記密碼以正確收件碼重設且不自動登入 | PF-AC-008、PF-AC-028、PF-AC-030 | PF-UT-019、PF-UT-020、PF-UT-021、PF-UT-109、PF-UT-110 | PF-IT-007、PF-IT-008、PF-IT-032 | PF-API-031、PF-API-032、PF-API-033、PF-API-034、PF-API-035、PF-API-036 | PF-E2E-007、PF-E2E-008 |
| **PF-BDD-012** 僅第三方帳號以 Email 設定本地密碼 | PF-AC-008、PF-AC-022、PF-AC-030 | PF-UT-019、PF-UT-020、PF-UT-021、PF-UT-031 | PF-IT-007、PF-IT-008 | PF-API-031、PF-API-032、PF-API-033、PF-API-034、PF-API-035、PF-API-036 | PF-E2E-007、PF-E2E-008 |
| **PF-BDD-013** 本人已登入直接連結同 Email Google 且不強制重登 | PF-AC-022、PF-AC-034、PF-AC-035 | PF-UT-031、PF-UT-032、PF-UT-033、PF-UT-112、PF-UT-113 | PF-IT-014、PF-IT-015 | PF-API-040、PF-API-041、PF-API-042 | PF-E2E-011 |
| **PF-BDD-014** 解除 Google 保留本地登入方式 | PF-AC-007、PF-AC-022 | PF-UT-031、PF-UT-032、PF-UT-033、PF-UT-113 | PF-IT-015 | PF-API-046、PF-API-047、PF-API-048 | PF-E2E-011 |
| **PF-BDD-015** 登出只撤指定 family 且舊裝置不得影響新登入 | PF-AC-006、PF-AC-007、PF-AC-026 | PF-UT-038、PF-UT-049、PF-UT-050 | PF-IT-012 | PF-API-022、PF-API-023、PF-API-024 | PF-E2E-018 |
| **PF-BDD-016** 私人 object adapter 由可信 owner 衍生 R2 key | PF-AC-009、PF-AC-014、PF-AC-016 | PF-UT-052、PF-UT-053、PF-UT-054、PF-UT-067 | PF-IT-023 | — | PF-E2E-009 |
| **PF-BDD-017** 有效 Google proof 可重用且每次登入成功撤舊 | PF-AC-020、PF-AC-021、PF-AC-032、PF-AC-035 | PF-UT-025、PF-UT-026、PF-UT-027、PF-UT-028、PF-UT-029 | PF-IT-003 | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-004、PF-E2E-023 |
| **PF-BDD-018** 同帳號同 identity 重複連結為冪等成功 | PF-AC-022 | PF-UT-031、PF-UT-032、PF-UT-033、PF-UT-114 | PF-IT-015 | PF-API-040、PF-API-041、PF-API-042 | PF-E2E-011 |
| **PF-BDD-019** 未知 Email 忘記密碼回同形且永不能完成 | PF-AC-028、PF-AC-030 | PF-UT-013、PF-UT-018、PF-UT-019、PF-UT-020、PF-UT-021 | PF-IT-004、PF-IT-007 | PF-API-031、PF-API-032、PF-API-033、PF-API-034、PF-API-035、PF-API-036 | PF-E2E-007 |
| **PF-BDD-020** 原生冷啟動從安全儲存恢復 session | PF-AC-005、PF-AC-025、PF-AC-026 | PF-UT-097、PF-UT-099、PF-UT-103 | — | — | PF-E2E-001、PF-E2E-015 |
| **PF-BDD-021** Web 刷新回應遺失先以 Cookie 唯讀確認或於 30 秒寬限內重試 | PF-AC-024、PF-AC-025 | PF-UT-042、PF-UT-049、PF-UT-097、PF-UT-099、PF-UT-101 | — | PF-API-016、PF-API-019、PF-API-020、PF-API-021 | PF-E2E-013、PF-E2E-014 |
| **PF-BDD-022** 登出失敗保留只供撤銷重試的狀態 | PF-AC-007、PF-AC-025 | PF-UT-049、PF-UT-051、PF-UT-096、PF-UT-099 | — | PF-API-022、PF-API-023、PF-API-024 | PF-E2E-018 |
| **PF-BDD-023** 等價密碼條件 rehash 不增加 cv | PF-AC-007、PF-AC-035 | PF-UT-009、PF-UT-112、PF-UT-114 | PF-IT-009 | PF-API-028、PF-API-029、PF-API-030 | — |
| **PF-BDD-024** Google 設定未就緒仍提供帳密流程 | PF-AC-002、PF-AC-019、PF-AC-018 | PF-UT-022、PF-UT-082、PF-UT-084 | — | — | PF-E2E-002、PF-E2E-005、PF-E2E-024 |
| **PF-BDD-025** 認證 API 嚴格 JSON、body 大小與錯誤投影 | PF-AC-004、PF-AC-005、PF-AC-016 | PF-UT-043、PF-UT-044、PF-UT-067、PF-UT-069 | — | PF-API-004、PF-API-005、PF-API-006 | — |
| **PF-BDD-026** Email 格式與長度由共用 server 元件拒絕 | PF-AC-004、PF-AC-027 | PF-UT-004、PF-UT-005、PF-UT-006 | PF-IT-001 | PF-API-001、PF-API-002、PF-API-003、PF-API-013、PF-API-014、PF-API-015 | PF-E2E-003 |
| **PF-BDD-027** 密碼規則與 PBKDF2 parser 拒絕非法輸入 | PF-AC-004、PF-AC-035 | PF-UT-007、PF-UT-008、PF-UT-009 | — | PF-API-013、PF-API-014、PF-API-015、PF-API-028、PF-API-029、PF-API-030 | PF-E2E-003 |
| **PF-BDD-028** 無帳號與錯密碼使用同一登入錯誤 | PF-AC-004、PF-AC-016、PF-AC-017 | PF-UT-008、PF-UT-055、PF-UT-057 | PF-IT-017 | PF-API-013、PF-API-014、PF-API-015 | PF-E2E-005 |
| **PF-BDD-029** Google credential 逐項拒絕不可信證明與非可信網域 | PF-AC-020、PF-AC-021、PF-AC-034 | PF-UT-025、PF-UT-026、PF-UT-027 | — | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-005 |
| **PF-BDD-030** 未知 provider 或信任設定注入被拒絕 | PF-AC-034、PF-AC-035 | PF-UT-022、PF-UT-023、PF-UT-024 | — | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-005 |
| **PF-BDD-031** 全域 Email 衝突與 Google Email 變更拒絕 | PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-032 | PF-UT-004、PF-UT-006、PF-UT-028、PF-UT-029、PF-UT-030 | PF-IT-001、PF-IT-003 | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-005 |
| **PF-BDD-032** Google 連結須具當下本人有效登入，解除綁定須驗證目前密碼 | PF-AC-022 | PF-UT-031、PF-UT-032、PF-UT-112 | PF-IT-014 | PF-API-040、PF-API-041、PF-API-042、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-011 |
| **PF-BDD-033** Google Email 與 identity 所有權衝突不得連結 | PF-AC-021、PF-AC-022 | PF-UT-030、PF-UT-031、PF-UT-032 | PF-IT-015 | PF-API-040、PF-API-041、PF-API-042、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-011 |
| **PF-BDD-034** 最後登入方式保護與無密碼引導 | PF-AC-022 | PF-UT-031、PF-UT-032、PF-UT-095 | PF-IT-015 | PF-API-043、PF-API-044、PF-API-045、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-011 |
| **PF-BDD-035** 平台 Access 必驗 claims、HS256 簽章與 D1 狀態 | PF-AC-005、PF-AC-006、PF-AC-023 | PF-UT-037、PF-UT-038、PF-UT-039 | PF-IT-016、PF-IT-025、PF-IT-030 | PF-API-013、PF-API-014、PF-API-015、PF-API-016、PF-API-017、PF-API-018、PF-API-019、PF-API-020、PF-API-021、PF-API-025、PF-API-026、PF-API-027 | PF-E2E-016、PF-E2E-023 |
| **PF-BDD-036** Web 與行動端兩條傳輸規則及 token 類型邊界 | PF-AC-005、PF-AC-023 | PF-UT-043、PF-UT-044、PF-UT-045 | — | PF-API-013、PF-API-014、PF-API-015、PF-API-016、PF-API-017、PF-API-018、PF-API-019、PF-API-020、PF-API-021、PF-API-022、PF-API-023、PF-API-024 | PF-E2E-016 |
| **PF-BDD-037** 全部 Web 寫入統一 Origin、CSRF 與 CORS 並暴露 X-DatingHigh-Session | PF-AC-005、PF-AC-020 | PF-UT-046、PF-UT-047、PF-UT-048 | PF-IT-025 | PF-API-013、PF-API-014、PF-API-015、PF-API-022、PF-API-023、PF-API-024 | PF-E2E-003、PF-E2E-014、PF-E2E-018 |
| **PF-BDD-038** Email code 綁定 flow、purpose 與 generation | PF-AC-004、PF-AC-028、PF-AC-032 | PF-UT-013、PF-UT-014、PF-UT-015 | PF-IT-004、PF-IT-006 | PF-API-004、PF-API-005、PF-API-006、PF-API-010、PF-API-011、PF-API-012 | PF-E2E-003 |
| **PF-BDD-039** reset 無效或 cv 改變不能修改密碼 | PF-AC-008、PF-AC-028、PF-AC-030 | PF-UT-013、PF-UT-020、PF-UT-021 | PF-IT-008 | PF-API-034、PF-API-035、PF-API-036 | PF-E2E-008 |
| **PF-BDD-040** sender 10 秒逾時、註冊寄送失敗回 503 與重設密碼通用 202 | PF-AC-029、PF-AC-031 | PF-UT-016、PF-UT-017、PF-UT-018 | PF-IT-005、PF-IT-007、PF-IT-033 | PF-API-001、PF-API-002、PF-API-003、PF-API-010、PF-API-011、PF-API-012、PF-API-031、PF-API-032、PF-API-033 | PF-E2E-022 |
| **PF-BDD-041** 依賴或限流故障 fail closed | PF-AC-013、PF-AC-015、PF-AC-017、PF-AC-024 | PF-UT-063、PF-UT-069、PF-UT-076 | PF-IT-021、PF-IT-034 | PF-API-049、PF-API-050、PF-API-051、PF-API-052、PF-API-053、PF-API-054 | — |
| **PF-BDD-042** 公網 command、SQL 與身分 header 偽造被拒絕 | PF-AC-013、PF-AC-016 | PF-UT-067、PF-UT-068、PF-UT-069 | PF-IT-025 | PF-API-049、PF-API-050、PF-API-051 | — |
| **PF-BDD-043** 跨 owner 及 path traversal 預設拒絕 | PF-AC-009、PF-AC-014 | PF-UT-052、PF-UT-053、PF-UT-054 | PF-IT-023 | PF-API-025、PF-API-026、PF-API-027 | PF-E2E-009 |
| **PF-BDD-044** 公開輸出不洩秘密與私人資訊 | PF-AC-016、PF-AC-019、PF-AC-031 | PF-UT-103、PF-UT-104、PF-UT-105 | PF-IT-032、PF-IT-033 | PF-API-052、PF-API-053、PF-API-054 | PF-E2E-017、PF-E2E-020 |
| **PF-BDD-045** 六位碼、十分鐘及絕對三十分鐘期限邊界 | PF-AC-028 | PF-UT-013、PF-UT-014、PF-UT-015 | PF-IT-004 | PF-API-004、PF-API-005、PF-API-006 | PF-E2E-003 |
| **PF-BDD-046** 六十秒 resend 邊界及併發 generation CAS | PF-AC-028、PF-AC-031 | PF-UT-014、PF-UT-015、PF-UT-017、PF-UT-018 | PF-IT-005、PF-IT-033 | PF-API-010、PF-API-011、PF-API-012 | PF-E2E-003、PF-E2E-022 |
| **PF-BDD-047** 五次錯碼原子鎖定抗併發 | PF-AC-028 | PF-UT-013、PF-UT-015、PF-UT-110 | PF-IT-006 | PF-API-004、PF-API-005、PF-API-006、PF-API-010、PF-API-011、PF-API-012 | PF-E2E-003、PF-E2E-022 |
| **PF-BDD-048** Email/Google 同址與同 subject 併發建帳只建一次與同批回滾 | PF-AC-004、PF-AC-021、PF-AC-027、PF-AC-032 | PF-UT-011、PF-UT-012、PF-UT-109、PF-UT-110、PF-UT-111 | PF-IT-001、PF-IT-002、PF-IT-003 | PF-API-004、PF-API-005、PF-API-006、PF-API-037、PF-API-038、PF-API-039 | — |
| **PF-BDD-049** 同重設碼併發只改一次及同批次原子回滾 | PF-AC-008、PF-AC-028、PF-AC-030 | PF-UT-020、PF-UT-021、PF-UT-109、PF-UT-110、PF-UT-111 | PF-IT-008 | PF-API-034、PF-API-035、PF-API-036 | — |
| **PF-BDD-050** 敏感寫入最後 SQL 重驗授權與 credential_version | PF-AC-007、PF-AC-022 | PF-UT-112、PF-UT-113、PF-UT-114 | PF-IT-013、PF-IT-014 | PF-API-028、PF-API-029、PF-API-030、PF-API-040、PF-API-041、PF-API-042、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-010、PF-E2E-011 |
| **PF-BDD-051** Refresh 30 秒寬限窗重試、並行落敗 409 與逾時重放撤銷 family | PF-AC-024、PF-AC-026 | PF-UT-040、PF-UT-041、PF-UT-042 | PF-IT-011、PF-IT-017 | PF-API-016、PF-API-017、PF-API-018 | PF-E2E-023 |
| **PF-BDD-052** Refresh 每步 SQL 失敗或 UNIQUE 衝突回滾與零列不核發 | PF-AC-007、PF-AC-024 | PF-UT-040、PF-UT-042、PF-UT-110 | PF-IT-010、PF-IT-011 | PF-API-016、PF-API-017、PF-API-018 | — |
| **PF-BDD-053** family 三十日及 idle 七日嚴格邊界 | PF-AC-006、PF-AC-023 | PF-UT-035、PF-UT-037、PF-UT-038 | PF-IT-016 | PF-API-016、PF-API-017、PF-API-018 | — |
| **PF-BDD-054** logout、refresh 與替代登入競態不影響最新 family | PF-AC-007、PF-AC-024、PF-AC-026 | PF-UT-049、PF-UT-050、PF-UT-113 | PF-IT-012 | PF-API-022、PF-API-023、PF-API-024 | PF-E2E-018、PF-E2E-023 |
| **PF-BDD-055** 新登入提交順序、憑證變更與失敗回滾競態 | PF-AC-007 | PF-UT-034、PF-UT-035、PF-UT-036、PF-UT-112、PF-UT-113 | PF-IT-009、PF-IT-013 | PF-API-028、PF-API-029、PF-API-030 | PF-E2E-023 |
| **PF-BDD-056** 九筆認證限流政策的可信對象與額度 | PF-AC-017、PF-AC-036 | PF-UT-055、PF-UT-056、PF-UT-057 | PF-IT-017、PF-IT-019、PF-IT-020 | PF-API-001、PF-API-002、PF-API-003、PF-API-016、PF-API-017、PF-API-018 | — |
| **PF-BDD-057** 跨用途寄碼五次第六不得 send | PF-AC-017、PF-AC-028、PF-AC-036 | PF-UT-055、PF-UT-057、PF-UT-058 | PF-IT-018 | PF-API-001、PF-API-002、PF-API-003 | — |
| **PF-BDD-058** 單一 RATE_LIMIT_HMAC_KEY、.NET 統一計算 subject_hash 與跨容器一致 bucket | PF-AC-017、PF-AC-036 | PF-UT-058、PF-UT-059、PF-UT-060 | PF-IT-019、PF-IT-020 | — | — |
| **PF-BDD-059** 靜態 RateLimitPolicies 常數表與拒絕未知 policy 或不允許的 subject_type | PF-AC-036 | PF-UT-056、PF-UT-059、PF-UT-060 | PF-IT-017、PF-IT-019、PF-IT-020 | — | — |
| **PF-BDD-060** 固定窗、飽和計數與 cleanup 邊界 | PF-AC-017、PF-AC-036 | PF-UT-061、PF-UT-062、PF-UT-063 | PF-IT-021、PF-IT-031 | — | — |
| **PF-BDD-061** 六表首欄 UUIDv7 與自然唯一鍵 | PF-AC-033、PF-AC-037 | PF-UT-064、PF-UT-065、PF-UT-066 | PF-IT-022 | — | — |
| **PF-BDD-062** 六表五十四欄與功能前綴同步映射 | PF-AC-035、PF-AC-037 | PF-UT-064、PF-UT-065、PF-UT-066、PF-UT-067 | PF-IT-022 | — | — |
| **PF-BDD-063** cwd、停止與重建容器不影響磁碟持久資料 | PF-AC-006、PF-AC-010、PF-AC-014、PF-AC-026 | PF-UT-070、PF-UT-072、PF-UT-079 | PF-IT-024、PF-IT-026、PF-IT-029 | — | PF-E2E-003、PF-E2E-014、PF-E2E-019、PF-E2E-021 |
| **PF-BDD-064** 本地 migrate、seed、固定 view 與明確修改隔離 | PF-AC-011、PF-AC-016、PF-AC-037 | PF-UT-065、PF-UT-071、PF-UT-072 | PF-IT-022、PF-IT-027 | — | PF-E2E-021 |
| **PF-BDD-065** 備份不覆寫與新 instance 還原 | PF-AC-012 | PF-UT-073、PF-UT-074、PF-UT-075 | PF-IT-028 | — | PF-E2E-021 |
| **PF-BDD-066** 環境 preflight、ready 故障與 API/SPA 路由 | PF-AC-013、PF-AC-015、PF-AC-029 | PF-UT-067、PF-UT-068、PF-UT-076、PF-UT-077、PF-UT-078 | PF-IT-025、PF-IT-034、PF-IT-035 | PF-API-049、PF-API-050、PF-API-051、PF-API-052、PF-API-053、PF-API-054 | PF-E2E-019、PF-E2E-020 |
| **PF-BDD-067** 單一對稱秘密重啟持久、輪替語意與資料保留清理 | PF-AC-006、PF-AC-026、PF-AC-028 | PF-UT-079、PF-UT-080、PF-UT-081 | PF-IT-021、PF-IT-029、PF-IT-030、PF-IT-031 | PF-API-052、PF-API-053、PF-API-054 | PF-E2E-019 |
| **PF-BDD-068** 開始畫面採原型視覺及可信 session 入口 | PF-AC-002、PF-AC-003 | PF-UT-082、PF-UT-083、PF-UT-084 | — | — | PF-E2E-002 |
| **PF-BDD-069** 小螢幕、鍵盤、focus 與可存取性 | PF-AC-001、PF-AC-002 | PF-UT-115、PF-UT-116、PF-UT-117 | — | — | PF-E2E-002 |
| **PF-BDD-070** 註冊請碼、已註冊 Email 與寄送失敗 503 提示 | PF-AC-002、PF-AC-004、PF-AC-027、PF-AC-029 | PF-UT-004、PF-UT-005、PF-UT-006、PF-UT-085、PF-UT-086、PF-UT-087 | — | PF-API-001、PF-API-002、PF-API-003 | PF-E2E-003、PF-E2E-012、PF-E2E-022 |
| **PF-BDD-071** Email 驗碼頁與確認密碼 | PF-AC-002、PF-AC-004、PF-AC-028 | PF-UT-085、PF-UT-086、PF-UT-087、PF-UT-088、PF-UT-089、PF-UT-090 | — | PF-API-004、PF-API-005、PF-API-006 | PF-E2E-003、PF-E2E-012 |
| **PF-BDD-072** 驗碼與表單錯誤給可修正明確文案 | PF-AC-002、PF-AC-028、PF-AC-030 | PF-UT-088、PF-UT-090、PF-UT-100 | — | PF-API-004、PF-API-005、PF-API-006 | PF-E2E-003、PF-E2E-012、PF-E2E-022 |
| **PF-BDD-074** 登入成功、首次 Google 直接建帳、通用錯誤與 Google SDK 取消 | PF-AC-002、PF-AC-019、PF-AC-020、PF-AC-021 | PF-UT-085、PF-UT-086、PF-UT-087、PF-UT-091、PF-UT-092 | — | PF-API-013、PF-API-014、PF-API-015、PF-API-037、PF-API-038、PF-API-039 | PF-E2E-004、PF-E2E-005 |
| **PF-BDD-075** SDK 操作序號、晚到結果與 X-DatingHigh-Session 狀態比對 | PF-AC-020、PF-AC-022 | PF-UT-091、PF-UT-092、PF-UT-093 | — | PF-API-037、PF-API-038、PF-API-039 | PF-E2E-006、PF-E2E-014 |
| **PF-BDD-076** Google HTTP 不明結果不視畫面取消為 server 回滾 | PF-AC-020、PF-AC-022、PF-AC-025 | PF-UT-038、PF-UT-091、PF-UT-092、PF-UT-093、PF-UT-101 | PF-IT-016 | PF-API-016、PF-API-017、PF-API-018、PF-API-022、PF-API-023、PF-API-024、PF-API-025、PF-API-026、PF-API-027、PF-API-028、PF-API-029、PF-API-030、PF-API-037、PF-API-038、PF-API-039、PF-API-040、PF-API-041、PF-API-042、PF-API-043、PF-API-044、PF-API-045、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-006、PF-E2E-013、PF-E2E-014 |
| **PF-BDD-077** 忘記密碼通用文案及轉重設 | PF-AC-002、PF-AC-030 | PF-UT-019、PF-UT-086、PF-UT-087 | — | PF-API-031、PF-API-032、PF-API-033 | PF-E2E-007 |
| **PF-BDD-078** 重設成功回登入及不明結果先試新密碼 | PF-AC-002、PF-AC-008、PF-AC-030 | PF-UT-020、PF-UT-021、PF-UT-087、PF-UT-101 | — | PF-API-034、PF-API-035、PF-API-036 | PF-E2E-008、PF-E2E-013 |
| **PF-BDD-079** 帳號頁只呈本人與真實登入方式 | PF-AC-002、PF-AC-009、PF-AC-016、PF-AC-034 | PF-UT-039、PF-UT-052、PF-UT-094 | — | PF-API-025、PF-API-026、PF-API-027、PF-API-043、PF-API-044、PF-API-045 | PF-E2E-009 |
| **PF-BDD-080** 改密碼成功與衝突文案 | PF-AC-002、PF-AC-007 | PF-UT-095、PF-UT-100、PF-UT-113 | — | PF-API-028、PF-API-029、PF-API-030 | PF-E2E-010 |
| **PF-BDD-081** 登入方式管理直接連結、驗證密碼解除與衝突 | PF-AC-002、PF-AC-022 | PF-UT-031、PF-UT-032、PF-UT-033、PF-UT-095 | — | PF-API-040、PF-API-041、PF-API-042、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-011 |
| **PF-BDD-082** 無本地密碼引導 Email 設定 | PF-AC-002、PF-AC-008、PF-AC-022、PF-AC-030 | PF-UT-019、PF-UT-020、PF-UT-095 | — | — | PF-E2E-007、PF-E2E-011 |
| **PF-BDD-083** 全部變更操作 loading 與重複提交防護 | PF-AC-002、PF-AC-020、PF-AC-025 | PF-UT-085、PF-UT-092、PF-UT-102 | — | — | PF-E2E-006、PF-E2E-012 |
| **PF-BDD-084** server 倒數、重寄及429 | PF-AC-002、PF-AC-017、PF-AC-028 | PF-UT-061、PF-UT-062、PF-UT-089 | — | PF-API-004、PF-API-005、PF-API-006、PF-API-010、PF-API-011、PF-API-012 | PF-E2E-003、PF-E2E-012、PF-E2E-022 |
| **PF-BDD-085** 網路與依賴錯誤可重試但不顯假帳號 | PF-AC-002、PF-AC-015、PF-AC-025 | PF-UT-100、PF-UT-101、PF-UT-102 | — | — | PF-E2E-013 |
| **PF-BDD-086** Web 允許多分頁操作、single-flight refresh 與 X-DatingHigh-Session 狀態同步 | PF-AC-005、PF-AC-024、PF-AC-025 | PF-UT-038、PF-UT-097、PF-UT-098、PF-UT-099 | — | PF-API-016、PF-API-017、PF-API-018、PF-API-022、PF-API-023、PF-API-024、PF-API-025、PF-API-026、PF-API-027、PF-API-028、PF-API-029、PF-API-030、PF-API-040、PF-API-041、PF-API-042、PF-API-043、PF-API-044、PF-API-045、PF-API-046、PF-API-047、PF-API-048 | PF-E2E-014、PF-E2E-018 |
| **PF-BDD-087** 只重送 handler 前過期/缺失 Access 請求一次 | PF-AC-024、PF-AC-025 | PF-UT-097、PF-UT-098、PF-UT-101 | — | PF-API-016、PF-API-017、PF-API-018 | PF-E2E-014、PF-E2E-016 |
| **PF-BDD-088** refresh 或 SecureStore 失敗回登入 | PF-AC-005、PF-AC-025 | PF-UT-097、PF-UT-099、PF-UT-103 | — | PF-API-016、PF-API-017、PF-API-018 | PF-E2E-015 |
| **PF-BDD-089** Email metadata 與敏感欄位生命週期 | PF-AC-002、PF-AC-016、PF-AC-031 | PF-UT-090、PF-UT-103、PF-UT-104 | — | — | PF-E2E-017 |
| **PF-BDD-090** 登出畫面依 server 撤銷確認 | PF-AC-002、PF-AC-007、PF-AC-025 | PF-UT-038、PF-UT-049、PF-UT-051、PF-UT-096 | — | PF-API-022、PF-API-023、PF-API-024 | PF-E2E-014、PF-E2E-018 |
| **PF-BDD-091** 缺失/過期流程與空狀態可重新開始 | PF-AC-002、PF-AC-028、PF-AC-030 | PF-UT-087、PF-UT-090、PF-UT-104 | — | PF-API-004、PF-API-005、PF-API-006、PF-API-010、PF-API-011、PF-API-012 | PF-E2E-003、PF-E2E-017 |
| **PF-BDD-092** 一般三十秒、cold start四十五秒與唯讀重試 | PF-AC-002、PF-AC-015、PF-AC-025 | PF-UT-100、PF-UT-101、PF-UT-102 | — | PF-API-049、PF-API-050、PF-API-051 | PF-E2E-013 |
| **PF-BDD-093** staging 真服務、收信、部署與相容回復 | PF-AC-013、PF-AC-014、PF-AC-015、PF-AC-019、PF-AC-026、PF-AC-029 | PF-UT-076、PF-UT-077、PF-UT-078、PF-UT-106、PF-UT-107、PF-UT-108 | — | PF-API-052、PF-API-053、PF-API-054 | PF-E2E-019、PF-E2E-020、PF-E2E-023、PF-E2E-024 |
| **PF-BDD-094** 平台及環境證據分開且不冒稱完整產品完成 | PF-AC-001、PF-AC-018 | PF-UT-106、PF-UT-107、PF-UT-108 | — | — | PF-E2E-001、PF-E2E-020、PF-E2E-024 |

## 2026-10-27 實作前稽核補強與 D-019～D-028 精簡回寫

下列保留 14 組 `PF-GAP-01..14` 索引，並已依 D-019～D-028 認證精簡決策更新各案例斷言（總數 **227 案**，應用測試未執行，不代表實作通過）：

| 缺漏組 | 內容（含 D-019～D-028 精簡更新） | 原案例回寫位置 | 已更新斷言 |
|---|---|---|---|
| PF-GAP-01 | H1／D-017／D-021：單一有效 family 替換＋Web 多分頁 `X-DatingHigh-Session` 同步 | PF-UT-038、PF-UT-049、PF-UT-093、PF-UT-097、PF-UT-098、PF-UT-099；PF-API-017、PF-API-019、PF-API-023、PF-API-026、PF-API-029、PF-API-041、PF-API-044、PF-API-047；PF-E2E-006、PF-E2E-014、PF-E2E-016、PF-E2E-018 | 同Account最後成功commit唯一有效、commit前失敗保舊；Web允許多分頁，已登入回應附X-DatingHigh-Session標頭供分頁於每次回應及回前景時比對，變更或收401 SESSION_REVOKED即清私人畫面 |
| PF-GAP-02 | H2／D-022／D-023：建帳與 session.create 同 batch 原子性 | PF-UT-034、PF-UT-036、PF-UT-109、PF-UT-110；PF-IT-002、PF-IT-003、PF-IT-009 | Email建帳同batch共用挑戰active前置條件並將消耗挑戰放最後一句；首次Google直接同batch建無密碼Account＋identity＋family＋Refresh；session.create同batch撤舊並依Account active/cv建新family與Refresh（不寫auth_accounts），UNIQUE衝突或SQL錯誤整批回滾 |
| PF-GAP-03 | H2／D-022：reset 同 batch 原子性 | PF-IT-008 | 同batch依挑戰active與bound_credential_version條件更新password_hash與credential_version+1，最後一句消耗挑戰；0列或SQL錯誤時挑戰與密碼皆不變更 |
| PF-GAP-04 | H2／D-020／D-022：refresh 同 batch 輪替與 30 秒寬限窗 | PF-UT-109；PF-IT-010、PF-IT-011 | 依current_generation與UNIQUE(session_id, generation)原子輪替；consumed_at 30秒內緊接前一代重試回200再輪替、30秒內並行落敗回409 REFRESH_RETRY、逾30秒重放回401 REFRESH_TOKEN_REUSE並撤銷family |
| PF-GAP-05 | H2／D-022／D-025：link／unlink 簡化與原子性 | PF-IT-014、PF-IT-015 | 連結僅需本人有效Access/family與同Email（不需密碼、不加cv、不踢登出）；解除綁定需驗目前密碼並在同batch內將credential_version加1與刪除identity；Google-only嘗試解除回409 LAST_LOGIN_METHOD |
| PF-GAP-06 | H3／D-026：sender 10 秒逾時與註冊 503／重設 202 | PF-UT-017、PF-UT-018；PF-IT-005、PF-IT-033；PF-E2E-022 | 移除投遞狀態機；sender逾時上限10秒，Email註冊與其resend失敗回503 EMAIL_DELIVERY_FAILED（挑戰保留供60秒冷卻後重寄新generation），忘記密碼與其resend失敗仍回同形通用202並記內部錯誤log |
| PF-GAP-07 | M1／M2／D-027：單一 RATE_LIMIT_HMAC_KEY 與 .NET 統一雜湊 | PF-UT-058、PF-UT-059、PF-UT-060；PF-IT-019、PF-IT-020 | Worker正規化IP後以X-DatingHigh-Internal-Client-Ip傳給.NET；.NET以單一RATE_LIMIT_HMAC_KEY計算"v1|"+APP_ENV+"|"+subject_type+"|"+canonical_subject之HMAC-SHA256；秘密更換直接重置視窗額度 |
| PF-GAP-08 | M2／D-026：嚴格 UTF-8 與單一 EMAIL_CODE_HMAC_KEY | PF-UT-007、PF-UT-013；PF-IT-004 | 密碼拒絕孤立surrogate；code_mac由.NET以單一EMAIL_CODE_HMAC_KEY與固定五欄0x7C framing計算並constant-time比對 |
| PF-GAP-09 | M3／D-027：靜態 RateLimitPolicies 與每 bucket 單次扣減 | PF-UT-057、PF-UT-059；PF-IT-017、PF-IT-019、PF-IT-020、PF-IT-021 | 靜態常數表RateLimitPolicies定義政策，拒絕未知policy_key或subject_type；單次請求先IP再可信subject且duplicate descriptor只扣一次 |
| PF-GAP-10 | M4／D-020：逾 30 秒 consumed 重放撤銷不受額度阻擋 | PF-UT-041；PF-IT-011、PF-IT-017；PF-E2E-023 | IP gate通過後，超過30秒寬限之已消耗token重放即使session輪替額度已滿仍持久撤銷原family（不影響新family） |
| PF-GAP-11 | M5：scheduled cleanup | PF-UT-063、PF-UT-081；PF-IT-021、PF-IT-031 | Worker scheduled不依容器timer；>1000 backlog預算內多batch、每批≤1000/可重試/記backlog/不刪有效資料 |
| PF-GAP-12 | M6：localhost same-site | PF-E2E-003、PF-E2E-014、PF-E2E-018 | localhost:8081→localhost:8787 credentials/dev Strict Cookies真登入/refresh/logout，錯Origin/127.0.0.1 public URL負例 |
| PF-GAP-13 | M7／D-019：六條受保護路由與 HS256 Access | PF-IT-025；PF-API-020、PF-API-026、PF-API-029、PF-API-041、PF-API-044、PF-API-047 | 六條protected routes明確RequireAuthorization（HS256 Access+D1 primary family驗證）；匿名、refresh/logout/OPTIONS與unknown 404例外 |
| PF-GAP-14 | M8／D-018：忘記密碼拒絕固定等待 | PF-UT-019；PF-IT-007；PF-API-010、PF-API-012、PF-API-031、PF-API-033；PF-E2E-007、PF-E2E-022 | known/unknown/Google-only request/resend同形202；必要I/O完成即回，不加人為固定延遲，接受剩餘timing差 |

## 📝 測試清單使用說明

確認實作前風險決策並完成文件同步後，才由 well-done 依 Unit → Integration → API → E2E 執行 Red-Green-Refactor。先寫有意義的失敗測試、最小實作、重構；每次完成回寫證據及分層進度，未執行不可標 Passed。實環境缺資源時保留未驗收與具體阻斷，不以 mock、配置檔存在或 API 接受狀態結案。

## 🔗 相關文檔

- [完整 BDD](../bdd/SPEC-001-PlatformFoundation-BDD.md)
- [完整 SPEC](../specs/SPEC-001-PlatformFoundation.md)
- [來源 MVP](../requirements/MVP-001-LoveGameDatingApp.md)
- [同名實作前風險稽核](../specs/SPEC-001-PlatformFoundation-RiskAudit.md)

## 規劃交接紀錄

**交接狀態**：Ready for well-done
**最後確認日期**：2026-10-29
**最後決策日期**：2026-10-29（使用者以「同意目前版本」確認現行五份文件包及已記錄風險取捨；D-017～D-028 認證修訂及 D-029～D-031 需求回寫已確認）
**本輪成果**：92 個 BDD 場景（25 個 `@frontend`）、227 個唯一測試規劃（117 Unit＋35 Integration＋51 API＋24 E2E）、37 條 PF-AC、17 組 API 端點、6 張表 54 欄；實作與應用測試執行 0%。

本次開發基準為 `SPEC-001-PlatformFoundation`，僅涵蓋平台／認證基礎。`US-020` 交換名片仍由後續業務文件包承接，不計入本份 227 案的完成度。既有技術假設須以實作與測試驗證，確認設計不等於測試已通過。

### 文件包

| 類型 | 路徑 | 狀態 |
|---|---|---|
| MVP | [MVP-001-LoveGameDatingApp.md](../requirements/MVP-001-LoveGameDatingApp.md) | 2026-10-29 已確認現行需求／八份切分及 D-017～D-031 回寫（20 故事／61 驗收） |
| SPEC | [SPEC-001-PlatformFoundation.md](../specs/SPEC-001-PlatformFoundation.md) | 2026-10-29 已確認修訂版；本 MVP 第 1 順位、無前置 SPEC；D-017～D-028 精簡契約為開發基準（6 表 54 欄、17 組端點） |
| BDD | [SPEC-001-PlatformFoundation-BDD.md](../bdd/SPEC-001-PlatformFoundation-BDD.md) | 已生成並追溯；92 個唯一 ID（`006`、`073` 已移除不重編）／25 個 frontend／九路由；實作未開始 |
| TDD | 本文件 | 已補強；117 Unit＋35 Integration＋51 API＋24 E2E＝227 案（`PF-API-007..009` 已移除不重編）；92 場景映射維持，未執行 |
| RiskAudit | [SPEC-001-PlatformFoundation-RiskAudit.md](../specs/SPEC-001-PlatformFoundation-RiskAudit.md) | 2026-10-29 已確認處理方案及已記錄風險取捨；13 組缺漏已補回、1 組接受剩餘風險 |

### 已確認風險與決策處理紀錄

2026-10-29 使用者已確認現行版本；以下方案、回寫位置及已列明的取捨均為開發依據，無待確認項目。實作時仍須驗證安全不變條件，不能因設計已確認而省略失敗／競態測試。

| 風險／決策 | 使用者決策或處理依據 | 文件回寫位置 | 開發注意事項 |
|---|---|---|---|
| D-017／D-021／PF-AUD-H1 | 新登入成功立即撤舊；D-021 取消 Web 單分頁鎖與預期工作階段請求標頭，改以 `X-DatingHigh-Session` 回應標頭與 401 `SESSION_REVOKED` 同步分頁 | SPEC 單一登入節；BDD 004/007/017/055/086；UT 034/036/097、IT 009、E2E 001/014 | `session.create` 同 batch 撤舊建新且不寫 `auth_accounts`、不加 `cv`；Web 允許多分頁，於每次回應及 `focus`/`pageshow`/`visibilitychange` 比對 `X-DatingHigh-Session` |
| D-018／PF-AUD-M8 | 使用者明確答「不需要有任何等待」，不加人為固定延遲；接受回應時間差剩餘風險 | MVP D-018、SPEC forgot、BDD 019/077、UT 019、IT 007、API 031/033、E2E 007 | 正常必要 I/O 完成即回，保留通用 202／訊息／驗碼／限流 |
| D-019／D-020 | Access 改為 HS256 單一秘密 `ACCESS_TOKEN_SECRET`；Refresh 單次輪替增設 `consumed_at` 起 30 秒寬限窗 | SPEC 權杖節；BDD 008/035/051/067；UT 037/041/080、IT 011/030、API 016/017、E2E 023 | 30 秒內緊接前一代重試回 200 再輪替、並行落敗回 409 `REFRESH_RETRY`、逾 30 秒回 401 `REFRESH_TOKEN_REUSE` 撤銷 family |
| D-022／PF-AUD-H2 | 移除輔助版本／批次標記欄位與故意違反約束的結尾 guard，改用同 batch 共用前置條件與自然 UNIQUE 回滾 | SPEC 固定資料操作節；BDD 003/048/049/050/052；UT 109/110、IT 002/008/010 | `credential_version` 為唯一樂觀並行欄位；Email 挑戰消耗放 batch 最後一句 |
| D-023／D-024／D-025 | Google 首次登入驗可信網域（`gmail.com` 或相符 `hd`）後直接建帳回 201；連結不需密碼不踢登出；解除綁定需密碼並增 `cv` | SPEC 第三方登入節；BDD 005/013/014/029/030/032/081；UT 022..033、IT 003/014/015、API 037..048 | 非可信網域回 401 `EXTERNAL_EMAIL_UNTRUSTED`；`auth_external_identities` 僅存 `(provider, subject)` |
| D-026／D-027／D-028 | 移除投遞狀態機（sender 逾時 10 秒，註冊失敗回 503 `EMAIL_DELIVERY_FAILED`）；單一 HMAC 秘密全由 .NET 雜湊＋靜態 `RateLimitPolicies`；兩條傳輸規則 | SPEC 寄信／限流／傳輸節；BDD 002/036/040/056..059；UT 017/018/043/044/055..060、IT 017..020/033 | Worker 以 `X-DatingHigh-Internal-Client-Ip` 傳正規化 IP；帶 `Origin` 必為 `web`，依 `clientPlatform` 讀取對應來源並忽略另一來源 |
| PF-AUD-L1／L2 | 記錄為實作驗收注意事項 | RiskAudit 低風險表、Schema、平台／staging 驗收 | 保留版本鎖定、六表 54 欄、第一欄 UUIDv7 與 `idx_auth_sessions_active_account` partial UNIQUE |

### 已補回缺漏

- `PF-GAP-01..13`：13 組技術缺漏已補回對應 SPEC／BDD／TDD；逐項位置及斷言見本文件「2026-10-27 實作前稽核補強與 D-019～D-028 精簡回寫」表與 RiskAudit 第三節。這是測試規劃已補強，應用測試尚未執行。
- `PF-GAP-14`：依 D-018 接受忘記密碼的剩餘時間差風險，已回寫通用回應／不加人為等待的驗收及測試斷言；位置見同表第 14 組。

### 實作注意事項

- 六表 54 欄、首欄 UUIDv7、`auth_`／`common_` 前綴、provider 通用性維持；保留 `idx_auth_sessions_active_account` partial UNIQUE，不導入 Identity／EF，不恢復 `auth_challenges`／`platform_metadata`。
- 新登入先準備 pair 及 HS256 JWT 但不曝光，再於同一 D1 batch 撤銷全部 `revoked_at IS NULL` 舊 family 並依 Account `status='active' AND credential_version=@cv` 建立新 family 與 generation 0 Refresh（不寫 `auth_accounts`、不加 `cv`）。
- Web 允許多分頁操作，透過每次已登入回應的 `X-DatingHigh-Session` 標頭與 401 `SESSION_REVOKED` 在每次回應及 `focus`/`pageshow`/`visibilitychange` 同步分頁狀態。
- D1／條件更新／FK／自然 UNIQUE 用真 emulator 與 bridge；Google／server 真收信／Web／Android／iOS 與 staging 各取獨立證據，缺環境就保留未驗收。
- production 發布須依具體版本授權，本份不等於完整 MVP 或其他七份 SPEC 已完成。測試與應用程式尚未建立，227 案全部未執行。

### 不得進入開發的阻斷項

- 無

2026-10-29「同意目前版本」已解除修訂文件最終確認的交接阻斷，下一階段由 `well-done` 接手本份實作與驗收。Google client／簽章、Cloudflare 資源／真寄信、iOS build 與真裝置等為實作期間的環境檢查及驗收工作，不是未決產品選項，也不代表已取得對應驗證證據。
