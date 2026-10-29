# SPEC-001-PlatformFoundation 實作前風險與缺漏稽核

**日期**：2026-10-25（初審）；2026-10-27（依使用者決策 D-017／D-018 修訂；同日依「認證機制精簡」D-019～D-028 重新評估並同步更新）；2026-10-29（同步 MVP D-029～D-031 責任邊界，並完成現行版本確認與開發交接）
**範圍**：僅 `SPEC-001-PlatformFoundation`；繼承來源 MVP 編號 `001`。
**狀態**：D-017～D-028 的風險／缺漏已依精簡契約回寫五份文件；2026-10-29 使用者以「同意目前版本」確認現行文件包與已記錄風險取捨，Ready for well-done。未實作、未執行應用測試。
**決策狀態**：D-017 新登入成功踢舊、D-018 不加固定等待、D-019～D-028 精簡方案及現行修訂版均已確認；D-029～D-031 的親密度／名片需求亦已回寫，無待使用者確認議題。

## 一、來源與需求追溯

| 文件 | 用途／確認狀態 |
|---|---|
| [MVP](../requirements/MVP-001-LoveGameDatingApp.md) | 需求及八份切分已確認；保留 D-001～D-018 歷史決策（受影響列已註記取代／調整）、D-019～D-028 認證精簡，2026-10-29 新增 D-029～D-031 親密度更名及交換名片 |
| [SPEC](SPEC-001-PlatformFoundation.md) | 2026-10-25 確認原 SDD；2026-10-27 依 D-017／018 修訂，再依 D-019～D-028 精簡定稿（6 表 54 欄、17 組 API 端點） |
| [BDD](../bdd/SPEC-001-PlatformFoundation-BDD.md) | 92 個唯一場景（`PF-BDD-006`、`PF-BDD-073` 已依 D-023 移除不重編）、25 個 `@frontend` 場景；未實作 |
| [TDD](../tdd/SPEC-001-PlatformFoundation-TDD.md) | 227 個唯一案例（117 Unit＋35 Integration＋51 API＋24 E2E；`PF-API-007..009` 已依 D-023 移除不重編）、92 場景映射及持久交接紀錄；未執行 |

本份以五份規劃文件內容逐項對照。文件有映射不代表測試通過，也不代表已執行應用測試。本報告的 `PF-AUD-*`／`PF-GAP-*` 編號維持穩定不重編。

### 責任邊界

- MVP 共 20 個故事、61 條驗收。本份直接承接 `US-013..019` 的 21 條驗收中屬於平台基礎的責任；新增 `US-020`／`AC-020-01..06` 不計入本份認證驗收。
- `US-013` 的完整交友流程、`US-015` 的照片／化身實際業務仍需其他 SPEC；`US-002`／`US-006` 在此僅有私人資料與授權基礎，不能標為整項完成。
- 其他七份 SPEC 的化身、配對、劇情、好感度、遊戲、約會與告白未生成，不是本輪應補寫的基礎平台缺漏。
- D-029 僅將總體好感度更名為「親密度」，計算與區間／等級隱私不變。D-030／D-031 的名片欄位由 AvatarAndPreferences、25 分入口／雙方同意／重送／揭露由 AffectionAndFeedback、終止後禁止完成待處理交換由 StoryDialogueAndExit 承接；名片引用配對前資料，不以 auth DTO 開放登入 Email 或憑證。相關業務規格與風險待所屬文件包處理，本份 37 條 PF-AC／92 個 BDD／227 個 TDD 的基線與已記錄風險處理狀態不變。
- 保留六張自有表、依 D-019～D-027 精簡後合計 **54 欄**（原 66 欄）、第一欄 UUIDv7、通用 provider（外部身分僅保存 `provider`＋`subject`）、`auth_`／`common_` 前綴。不恢復 `auth_challenges`／`platform_metadata`，不導入 Identity／EF。
- 有效 Google proof 可重用、Email 驗證碼單次消耗、Refresh 單次輪替並依 D-020 保留 `consumed_at` 起 30 秒寬限窗；依 D-017／D-021 每次成功登入都撤銷舊 family，不能以 proof 可重用推論可同時存在多個未撤銷 family。Google 首次登入依 D-023 驗證 `email_verified=true` 與可信網域（`gmail.com` 或 `hd` 等於 Email 網域）後直接建帳回 201，不再要求收件驗證碼。

### 全鏈核對結果

精簡後基線（2026-10-27 依 D-017～D-028 覆核）：**37/37 PF-AC、92/92 BDD（含 25 個 `@frontend`）、227 個測試規劃（117 Unit＋35 Integration＋51 API＋24 E2E）、17 組公開 API 端點、6 張表 54 欄**。實作及執行進度均為 0%。

下表列精簡後基線的代表案例供逐條核對；完整場景、所有案例與優先級見 [TDD 的 BDD Scenario → TDD 追溯](../tdd/SPEC-001-PlatformFoundation-TDD.md#bdd-scenario--tdd-追溯)。

| SPEC 驗收 | MVP 來源／責任 | BDD 代表 | Unit 代表 | 高層代表 |
|---|---|---|---|---|
| PF-AC-001 | US-013／AC-013-01 | PF-BDD-001 | PF-UT-001、PF-UT-002、PF-UT-003 | PF-IT-035、PF-API-049、PF-E2E-001 |
| PF-AC-002 | US-013／AC-013-01、AC-013-02 | PF-BDD-068、PF-BDD-069、PF-BDD-071、PF-BDD-079 | PF-UT-039、PF-UT-052、PF-UT-082 | PF-API-004、PF-E2E-002 |
| PF-AC-003 | US-013／AC-013-02 | PF-BDD-004、PF-BDD-009 | PF-UT-034、PF-UT-035、PF-UT-037 | PF-IT-016、PF-API-013、PF-E2E-001 |
| PF-AC-004 | US-018／AC-018-01、AC-018-03 | PF-BDD-003、PF-BDD-048 | PF-UT-011、PF-UT-012、PF-UT-109 | PF-IT-001、PF-API-004、PF-E2E-003 |
| PF-AC-005 | US-017／AC-017-01、AC-017-03 | PF-BDD-036、PF-BDD-037 | PF-UT-043、PF-UT-044、PF-UT-045 | PF-API-013、PF-E2E-016 |
| PF-AC-006 | US-017／AC-017-02、AC-017-04 | PF-BDD-053、PF-BDD-063 | PF-UT-035、PF-UT-037、PF-UT-038 | PF-IT-016、PF-API-016、PF-E2E-019 |
| PF-AC-007 | US-017／AC-017-04 | PF-BDD-050、PF-BDD-054、PF-BDD-055 | PF-UT-034、PF-UT-035、PF-UT-036 | PF-IT-009、PF-API-022、PF-E2E-010 |
| PF-AC-008 | US-019／AC-019-02、AC-019-03 | PF-BDD-049 | PF-UT-020、PF-UT-021、PF-UT-109 | PF-IT-008、PF-API-034 |
| PF-AC-009 | MVP身分與資料歸屬；US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅權限基礎） | PF-BDD-043 | PF-UT-052、PF-UT-053、PF-UT-054 | PF-IT-023、PF-API-025、PF-E2E-009 |
| PF-AC-010 | US-014／AC-014-01、AC-014-02 | PF-BDD-063 | PF-UT-070、PF-UT-072、PF-UT-079 | PF-IT-024、PF-E2E-019 |
| PF-AC-011 | US-014／AC-014-01、AC-014-02 | PF-BDD-064 | PF-UT-065、PF-UT-071、PF-UT-072 | PF-IT-022、PF-E2E-021 |
| PF-AC-012 | US-014／AC-014-02 | PF-BDD-065 | PF-UT-073、PF-UT-074、PF-UT-075 | PF-IT-028、PF-E2E-021 |
| PF-AC-013 | US-015／AC-015-01 | PF-BDD-042、PF-BDD-093 | PF-UT-067、PF-UT-068、PF-UT-069 | PF-IT-025、PF-API-049、PF-E2E-019 |
| PF-AC-014 | US-015／AC-015-02 | PF-BDD-016、PF-BDD-063 | PF-UT-052、PF-UT-053、PF-UT-054 | PF-IT-023、PF-E2E-009 |
| PF-AC-015 | US-015／AC-015-01、AC-015-02 | PF-BDD-066 | PF-UT-067、PF-UT-068、PF-UT-076 | PF-IT-025、PF-API-049、PF-E2E-019 |
| PF-AC-016 | US-002／AC-002-01、AC-002-02及US-006／AC-006-02、AC-006-03（僅私人契約） | PF-BDD-044 | PF-UT-103、PF-UT-104、PF-UT-105 | PF-IT-032、PF-API-052、PF-E2E-017 |
| PF-AC-017 | MVP D-012、D-015；US-018／AC-018-04 | PF-BDD-057、PF-BDD-058 | PF-UT-055、PF-UT-057、PF-UT-058 | PF-IT-018、PF-API-001 |
| PF-AC-018 | US-013／AC-013-01；US-015／AC-015-01、AC-015-02 | PF-BDD-094 | PF-UT-106、PF-UT-107、PF-UT-108 | PF-E2E-001 |
| PF-AC-019 | US-016／AC-016-01 | PF-BDD-007、PF-BDD-074、PF-BDD-093 | PF-UT-025、PF-UT-026、PF-UT-028 | PF-API-037、PF-E2E-001 |
| PF-AC-020 | US-016／AC-016-02 | PF-BDD-029、PF-BDD-075、PF-BDD-076 | PF-UT-025、PF-UT-026、PF-UT-027 | PF-API-037、PF-E2E-005 |
| PF-AC-021 | US-016／AC-016-03 | PF-BDD-031、PF-BDD-048 | PF-UT-004、PF-UT-006、PF-UT-011 | PF-IT-001、PF-API-037、PF-E2E-005 |
| PF-AC-022 | US-016／AC-016-04 | PF-BDD-050、PF-BDD-034 | PF-UT-031、PF-UT-032、PF-UT-095 | PF-IT-015、PF-API-040、PF-E2E-011 |
| PF-AC-023 | US-017／AC-017-01 | PF-BDD-035 | PF-UT-037、PF-UT-038、PF-UT-039 | PF-IT-016、PF-API-013、PF-E2E-016 |
| PF-AC-024 | US-017／AC-017-02 | PF-BDD-051、PF-BDD-052 | PF-UT-040、PF-UT-041、PF-UT-042 | PF-IT-010、PF-API-016、PF-E2E-023 |
| PF-AC-025 | US-017／AC-017-03 | PF-BDD-086、PF-BDD-087、PF-BDD-088 | PF-UT-097、PF-UT-098、PF-UT-099 | PF-API-016、PF-E2E-014 |
| PF-AC-026 | US-017／AC-017-03、AC-017-04；US-016／AC-016-02 | PF-BDD-067、PF-BDD-093 | PF-UT-076、PF-UT-077、PF-UT-078 | PF-IT-029、PF-API-052、PF-E2E-019 |
| PF-AC-027 | US-018／AC-018-03 | PF-BDD-031、PF-BDD-048 | PF-UT-004、PF-UT-006、PF-UT-011 | PF-IT-001、PF-API-004、PF-E2E-005 |
| PF-AC-028 | US-018／AC-018-04；US-019／AC-019-02 | PF-BDD-045、PF-BDD-046、PF-BDD-047 | PF-UT-013、PF-UT-014、PF-UT-015 | PF-IT-004、PF-API-004、PF-E2E-003 |
| PF-AC-029 | US-018／AC-018-02；US-019／AC-019-01 | PF-BDD-040、PF-BDD-093 | PF-UT-016、PF-UT-017、PF-UT-018 | PF-IT-005、PF-API-001、PF-E2E-019 |
| PF-AC-030 | US-019／AC-019-01、AC-019-02、AC-019-03 | PF-BDD-019、PF-BDD-049 | PF-UT-013、PF-UT-019、PF-UT-020 | PF-IT-004、PF-API-031、PF-E2E-007 |
| PF-AC-031 | US-018／AC-018-02、AC-018-04；US-019／AC-019-01、AC-019-02 | PF-BDD-040、PF-BDD-046 | PF-UT-014、PF-UT-015、PF-UT-016 | PF-IT-005、PF-API-001、PF-E2E-003 |
| PF-AC-032 | US-018／AC-018-01、AC-018-03；US-016／AC-016-03 | PF-BDD-005、PF-BDD-017 | PF-UT-011、PF-UT-012、PF-UT-023 | PF-IT-003、PF-API-037、PF-E2E-004 |
| PF-AC-033 | MVP D-010 | PF-BDD-061 | PF-UT-064、PF-UT-065、PF-UT-066 | PF-IT-022 |
| PF-AC-034 | MVP D-009；US-016／AC-016-03、AC-016-04 | PF-BDD-030 | PF-UT-022、PF-UT-023、PF-UT-024 | PF-API-037、PF-E2E-005 |
| PF-AC-035 | MVP D-013、D-014；US-016／AC-016-02 | PF-BDD-062、PF-BDD-017 | PF-UT-025、PF-UT-026、PF-UT-027 | PF-IT-003、PF-API-037、PF-E2E-004 |
| PF-AC-036 | MVP D-015 | PF-BDD-059 | PF-UT-056、PF-UT-059、PF-UT-060 | PF-IT-020 |
| PF-AC-037 | MVP D-016、D-010 | PF-BDD-062、PF-BDD-064 | PF-UT-064、PF-UT-065、PF-UT-066 | PF-IT-022、PF-E2E-021 |

## 二、技術風險與處理方案

以下 `PF-AUD-*` 為本次稽核 ID，與 SPEC 原有 `PF-R-*` 初步風險分開。初審列三項高、八項中、兩項低；2026-10-27 依使用者決策 D-017～D-028（含「全套精簡」）重新評估並同步更新五份規劃文件。下列列出處理後規則，不代表程式已實作。

### 高風險

#### PF-AUD-H1：單一有效登入 family 原子替換與 Web 多分頁狀態同步（D-017、D-020、D-021）

**定位**：MVP D-017／D-020／D-021、SPEC「Access Token、Refresh Token、單一登入與工作階段生命週期」；`PF-AC-003/007/020/024/025`；BDD `004/007/017/051/055/075/076/086/087/090`。

**使用者決策（2026-10-27）**：先確認「允許電腦登入，立即登出手機」（D-017），隨後於認證機制精簡中確認「全套精簡」（D-020、D-021）：保留同 Account 單一有效 family 與新登入撤舊，但取消瀏覽器單分頁互斥鎖與前端預期工作階段請求標頭，並為 Refresh 增設 30 秒寬限窗。已回寫規則如下：

1. 同 Account 最多一個未撤銷 family（由 SQLite partial UNIQUE 索引 `idx_auth_sessions_active_account` 保護 `auth_sessions(account_id) WHERE revoked_at IS NULL`）。新登入完成驗證後，`session.create` 在同一 D1 batch 內先將該 Account 所有 `revoked_at IS NULL` 舊列標記為 `revoked_at=@now, revocation_reason='replaced_by_login'`，再依 Account `status='active' AND credential_version=@cv` 條件插入新 family 與 generation 0 Refresh（**不寫入 `auth_accounts`、不增加 `credential_version`**）。SQL 在 commit 前失敗則整批回滾保留舊登入，commit 後回應遺失不假回滾；最後成功 commit 者唯一有效。
2. Web **不限制開啟分頁數**，不顯示第二分頁阻擋頁。單一分頁內多個並行 401 以 single-flight 合併 refresh；當多個分頁共用 Cookie 同時觸發 refresh 時，依 D-020 提供 `consumed_at` 起 **30 秒寬限窗**：緊接前一代（`generation = current_generation - 1`）於 30 秒內重試視為網路回應遺失並從目前 head 再輪替一次回 200；30 秒內並行落敗回 409 `REFRESH_RETRY`（不撤銷 family），client 以最新 Cookie／Refresh 重試一次即可恢復；超過 30 秒重放則回 401 `REFRESH_TOKEN_REUSE` 並持久撤銷整個 family。
3. 所有已登入 API 回應均附帶 `X-DatingHigh-Session: <sessionId>`（目前有效 family ID，並透過 `Access-Control-Expose-Headers: X-DatingHigh-Session` 暴露給 Web）。client 記錄 `currentSessionId`，並在每次回應及 `focus`、`pageshow`、`visibilitychange`（回前景）時比對；一旦發現 `X-DatingHigh-Session` 改變或收到 401 `SESSION_REVOKED`，舊分頁立即清除私人畫面並導向登入頁（或重新以 `/session` 同步最新身分）。
4. **已知接受之剩餘風險**：① 因移除前端預期工作階段請求標頭，若使用者在同一瀏覽器另一分頁改登不同帳號 B，原分頁 A 在尚未觸發回前景核驗前送出之首個Cookie請求會以新 Cookie 身分執行（單人戀愛交友遊戲可接受此極端操作取捨）；② D-020 的 30 秒 Refresh 寬限窗使前一代被竊 Refresh Token 在 `consumed_at` 後 30 秒內被重放時不會觸發整條 family 撤銷，超過 30 秒則立即觸發 `REFRESH_TOKEN_REUSE` 撤銷整條 family。

#### PF-AUD-H2：D1 同批次共用前置條件與自然 UNIQUE 約束原子回滾（D-022）

**定位**：SPEC「固定資料操作、交易與一致性」；`PF-AC-004/007/008/022/024/028`；BDD `003/048/049/050/052`。

依 D-022 精簡決策，已移除輔助版本欄位、批次標記欄位，以及「故意更新違反 CHECK/NOT NULL 約束令批次拋錯的結尾 guard」，改用標準 D1 批次原子性設計（[D1 batch 官方契約](https://developers.cloudflare.com/d1/worker-api/d1-database/)）：

| Command | D-022 精簡後的同批次原子性作法 |
|---|---|
| `account.register-email` | 同一 D1 batch 內建立 Account、建立 family、建立 generation 0 Refresh 全部共用「挑戰仍為 `active`、未到期且 `generation`/`code_mac` 相符」之前置條件，並將條件消耗挑戰（`state='consumed'`）放在 batch **最後一句**；若前置條件不符則全批 0 列寫入，若 Email 自然 UNIQUE 衝突或任一步驟 SQL 失敗則 D1 自動整批回滾 |
| `account.register-external` | 首次 Google 登入於同一 D1 batch 內建立無密碼 Account、建立 `auth_external_identities(provider, subject)`、建立 family 與 generation 0 Refresh；由 `UNIQUE(email_normalized)`、`UNIQUE(provider, subject)`、`UNIQUE(account_id, provider)` 保證唯一，任一衝突整批回滾 |
| `account.reset-password` | 同一 D1 batch 先依挑戰仍為 `active` 且 Account `credential_version = bound_credential_version` 條件更新 `password_hash` 與 `credential_version = credential_version + 1`，最後一句條件消耗挑戰；Account 未更新則挑戰不消耗 |
| `session.refresh` | 同一 D1 batch 依 `current_generation` 與未撤銷條件更新 `auth_sessions`、插入後繼 Refresh（以 `UNIQUE(session_id, generation)` 為最終線性化點）並標記前 token `consumed_at` 與 `replaced_by_token_id`；UNIQUE 衝突或 SQL 失敗整批回滾 |
| `session.create` | 同一 D1 batch 條件撤銷同 Account 所有 `revoked_at IS NULL` 舊列，再依 Account `status='active' AND credential_version=@cv` 插入新 family（受 partial UNIQUE 保護）與 generation 0 Refresh，不寫 `auth_accounts` |
| `identity.external.link`／`unlink` | 連結依有效 family 與 Account active/`cv` 條件插入 identity（不加 `cv`）；解除綁定在同一 batch 內依有效 family 與 `cv` 條件將 `credential_version` 加 1 並刪除 identity |

`credential_version` 為唯一樂觀並行控制欄位；密碼等價升級（`account.rehash`）以 `WHERE password_hash = @expectedOldHash AND credential_version = @cv` 作 CAS 且不增加 `credential_version`。

#### PF-AUD-H3：驗證碼寄送 10 秒逾時與註冊 503／忘記密碼通用 202（D-026）

**定位**：SPEC「Email 驗證碼與註冊流程」；`PF-AC-028/029/031`；BDD `002/040/046/070`。

依 D-026 精簡決策，已移除驗證碼投遞狀態機（四態轉換與 20 秒觀察窗 deadline CAS）及回應中的投遞狀態欄位，改為同步明確處理：

1. 後端先將挑戰持久化為 `state='active'`，再呼叫 `email.code.send`（逾時上限 **10 秒**）；成功完成即回 202。
2. 若寄信服務回傳失敗或逾 10 秒未完成：
   - **Email 註冊首次請求與其 resend**：直接回 **503 `EMAIL_DELIVERY_FAILED`**（「驗證碼暫時無法寄送，請稍後重試」）；已建立的挑戰保留，使用者於 60 秒 `resend_after` 冷卻後可重寄產生新 `generation` 並使舊碼立即作廢。
   - **忘記密碼首次請求與其 resend**：仍回與成功完全同形的通用 **202**，並記錄內部錯誤 log，避免透過寄信失敗差異暴露帳號或設定狀態。

### 中風險

| ID | 精確定位／現有 BDD | 實際影響與缺漏 | D-019～D-028 處理結果 |
|---|---|---|---|
| `PF-AUD-M1` | SPEC「信任邊界」「限流簡化」；`PF-AC-017/036`；058 | Worker 與 .NET 若各自雜湊可能重複雜湊或不一致 | 依 D-027：Worker 負責驗證並正規化可信客戶端 IP（含 IPv6 與 IPv4-mapped 正規化），以內部標頭 `X-DatingHigh-Internal-Client-Ip` 傳給 .NET；`subject_hash` **統一由 .NET 計算**，Worker 不計算 HMAC |
| `PF-AUD-M2` | SPEC「密碼」「code HMAC」「限流 HMAC」；`PF-AC-004/028/036`；027/045/058 | 位元組格式與孤立 surrogate 處理需固定 | 依 D-026/D-027：驗證碼與限流各採單一環境秘密（`EMAIL_CODE_HMAC_KEY`、`RATE_LIMIT_HMAC_KEY`）且全由 .NET 以管道符 `|` 分隔之固定 UTF-8 無 BOM 字串計算 lowercase hex HMAC-SHA256；密碼拒絕孤立 surrogate 且無 replacement fallback |
| `PF-AUD-M3` | SPEC「限流」；`PF-AC-017/036`；056/057/059 | 單次請求可能重複扣減同一 bucket | 依 D-027：政策定義於靜態常數表 `RateLimitPolicies`；單次 HTTP 操作按 bucket descriptor 去重，先計 IP 再計尚未扣減的可信對象，任一超限停止後續動作且保留已計次數，Retry-After 取最晚到期秒數 |
| `PF-AUD-M4` | SPEC「Refresh 重放」與「限流」；`PF-AC-017/024`；051/056 | session 輪替額度耗盡時可能先回 429 而漏掉逾 30 秒重放撤銷 | 依 D-020：先經 IP 額度檢查；若 token 已消耗且超過 30 秒寬限窗，直接執行 `REFRESH_TOKEN_REUSE` 撤銷整個原 family，不受 session 輪替額度阻擋；未消耗 token 與 30 秒寬限重試才扣 session 額度 |
| `PF-AUD-M5` | SPEC「cleanup」「容器空閒休眠」；`PF-AC-015/026/028`；060/067 | 容器睡眠時 timer 不能保證清理；單批 1000 列可能積壓 | Worker scheduled handler 呼叫固定 cleanup command；每批最多 1000 筆，於執行預算內分多批處理並記錄 backlog／重試。先清 Refresh self-reference／records 再清 family，不刪未到期資料 |
| `PF-AUD-M6` | SPEC「本地開發」第 2 點；`PF-AC-001/005`；037/063 | Expo localhost 與 API 127.0.0.1 不同 site 可能導致 Strict Cookie 不送 | Web 公開 API 使用 `http://localhost:8787`，Expo `http://localhost:8081`；Worker 仍可 bind 127.0.0.1。固定 Origin／credentials／CORS（含暴露 `X-DatingHigh-Session`），真瀏覽器驗登入／refresh／logout |
| `PF-AUD-M7` | SPEC「DDD／API 認證欄」；`PF-AC-005/006/009/015`；035/037/066 | JWT middleware 不會自動保護每個 endpoint；過度 fallback 會影響公開路由或 404 | 六條受保護路由明確設定 `RequireAuthorization`（HS256 Access＋D1 primary family 驗證）。註冊／登入／復原／Google 登入、health／OPTIONS 明列匿名；refresh／logout 使用專用憑證處理；未知 API 回 JSON 404 不落 SPA（[Microsoft 授權說明](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/secure-data?view=aspnetcore-10.0)） |
| `PF-AUD-M8` | SPEC「忘記密碼」；`PF-AC-030/031`；019/077 | 同形 202 仍可能從已知／未知地址的必要 I/O 時間差推測註冊狀態 | **使用者接受剩餘風險（D-018）**：明確拒絕固定等待。正常處理完成即回、保留通用訊息／flow／碼驗證／限流（含 D-026 寄信失敗時仍回通用 202）；不採人工延遲，不承諾時間一致 |

**M1／M2 秘密輪替語意補充（D-019、D-026、D-027）**：移除 RSA key ring、驗證碼多 key 與限流雙 key 過渡 SQL。三個環境秘密（`ACCESS_TOKEN_SECRET`、`EMAIL_CODE_HMAC_KEY`、`RATE_LIMIT_HMAC_KEY`）各為單一至少 32-byte 秘密：更換 `ACCESS_TOKEN_SECRET` 時既有 Access 立即失效並由未撤銷 family 之 Refresh 透明換發新 Access；更換 `EMAIL_CODE_HMAC_KEY` 時未完成之 10 分鐘挑戰作廢須重請驗證碼；更換 `RATE_LIMIT_HMAC_KEY` 時直接接受進行中固定視窗額度重置。

**D-023 Google 首次登入直接建帳之網域信任防護**：為避免外部 IdP 未驗證網域所有權的潛在帳號預先占領（pre-account takeover）風險，当 Google 首次登入直接建帳時，後端除驗證 RS256 簽章、`iss`、`aud`、`azp`、`exp`、非空 `sub` 與 `email_verified=true` 外，強制要求 **Email 網域為 `gmail.com`，或 token 的 `hd`（Hosted Domain）claim 完全等於 Email 網域**；不符者回 401 `EXTERNAL_EMAIL_UNTRUSTED`，引導改用 Email 驗證碼註冊。

### 低風險與既定限制

| ID | 查核結果 | 實作注意事項 |
|---|---|---|
| `PF-AUD-L1` | 官方文件支持既定 Expo／Containers outbound handlers／Email binding 路線，未發現必須推翻架構的依據 | 實作鎖 patch／peer dependencies／映像；iOS build、Google client／簽章、Cloudflare sender 資格與真收件仍需取得證據。官方能力不等於本專案已部署或通過 |
| `PF-AUD-L2` | 依 D-019～D-027 精簡後靜態計數為**六表 54 欄**，首欄主鍵與自然 UNIQUE 一致；表名／索引／FK／wrapper 分類無矛盾 | UUIDv7 是識別，不是秘密或交易順序；所有 command、DTO、FK 採 canonical 格式，工具 migration history 豁免 |

## 三、缺漏測試與精確回寫位置

表內測試 ID 均引用同名 TDD（共 227 案）。表內 `UT/IT/API/E2E` 皆帶 `PF-` 前綴，BDD 皆帶 `PF-BDD-` 前綴。

| 缺漏 ID／優先級 | 來源／已具備的覆蓋 | 擴充既有測試 | 已回寫之精簡後斷言／測試名稱 |
|---|---|---|---|
| `PF-GAP-01` 高 | H1；D-017/D-021 與 BDD 004/017/055/076/086/090 | UT-038/049/093/097/098/099；API-017/019/023/026/029/041/044/047；E2E-006/014/016/018 | 單一有效 family 同 batch 替換（不寫 `auth_accounts`、不加 `cv`）、commit 前失敗保舊；Web 允許多分頁，已登入回應附 `X-DatingHigh-Session` 供分頁於每次回應與回前景時比對，變更或收 401 `SESSION_REVOKED` 即清私人畫面 |
| `PF-GAP-02` 高 | H2；D-022/D-023 與 BDD 003/005/048 | UT-034/036/109/110；IT-002/003/009 | Email 註冊同 batch 共用挑戰 `active` 前置條件並將消耗挑戰放最後一句；首次 Google 直接同 batch 建無密碼 Account＋identity＋family＋Refresh；自然 UNIQUE 衝突或 SQL 錯誤整批回滾 |
| `PF-GAP-03` 高 | H2；D-022 與 BDD 049 | IT-008 | 重設密碼同 batch 依挑戰 `active` 與 `bound_credential_version` 條件更新 `password_hash` 與 `credential_version+1`，最後一句消耗挑戰；0 列或 SQL 錯誤時挑戰與密碼均不變 |
| `PF-GAP-04` 高 | H2；D-020/D-022 與 BDD 051/052 | UT-109；IT-010/011 | Refresh 依 `current_generation` 與 `UNIQUE(session_id, generation)` 原子輪替；`consumed_at` 30 秒內緊接前一代重試回 200 再輪替、並行落敗回 409 `REFRESH_RETRY`、逾 30 秒重放回 401 `REFRESH_TOKEN_REUSE` 撤銷 family |
| `PF-GAP-05` 高 | H2；D-022/D-025 與 BDD 013/014/034/050 | IT-014/015 | 連結 Google 僅需本人有效 Access/family 與同 Email（不需密碼、不加 `cv`、不踢登出）；解除綁定需驗目前密碼並在同 batch 內將 `cv+1` 與刪除 identity；無本地密碼回 409 `LAST_LOGIN_METHOD` |
| `PF-GAP-06` 高 | H3；D-026 與 BDD 040/046/070 | UT-017/018；IT-005/033；E2E-022 | sender 逾時上限 10 秒；Email 註冊與其 resend 失敗回 503 `EMAIL_DELIVERY_FAILED`（挑戰保留供 60 秒冷卻後重寄新 generation），忘記密碼與其 resend 失敗仍回同形通用 202 並記內部 log |
| `PF-GAP-07` 中 | M1/M2；D-027 與 BDD 058 | UT-058/059/060；IT-019/020 | Worker 正規化可信 IP 後以 `X-DatingHigh-Internal-Client-Ip` 傳給 .NET；`subject_hash` 全由 .NET 以單一 `RATE_LIMIT_HMAC_KEY` 與 `"v1|" + APP_ENV + "|" + subject_type + "|" + canonical_subject` 計算 |
| `PF-GAP-08` 中 | M2；D-026 與 BDD 027/045 | UT-007/013；IT-004 | 密碼拒絕孤立 surrogate 且無 replacement fallback；`code_mac` 由 .NET 以單一 `EMAIL_CODE_HMAC_KEY` 與五欄 `0x7C` framing 計算並 constant-time 比對 |
| `PF-GAP-09` 中 | M3；D-027 與 BDD 056/057/059 | UT-057/059；IT-017/019/020/021 | 靜態常數表 `RateLimitPolicies` 定義政策，拒絕未知 policy 或不允許的 `subject_type`；單次操作先 IP 再可信對象且 duplicate descriptor 只扣一次 |
| `PF-GAP-10` 中 | M4；D-020 與 BDD 051/056 | UT-041；IT-011/017；E2E-023 | IP gate 放行後，超過 30 秒寬限之已消耗 token 重放即使 session 輪替額度已滿仍持久撤銷原 family |
| `PF-GAP-11` 中 | M5；BDD 060/067 | UT-063/081；IT-021/031 | container 睡眠時 Worker scheduled driver 仍觸發；超過 1000 筆 backlog 分多批處理、每批 ≤1000 可重試且只清符合保留期資料 |
| `PF-GAP-12` 中 | M6；BDD 037/063 | E2E-003/014/018 | `localhost:8081` → `localhost:8787` 使用 dev Strict Cookie 與 `X-DatingHigh-Session` 完成註冊／登入／refresh／logout，錯 Origin／127.0.0.1 公開 URL 負例 |
| `PF-GAP-13` 高 | M7；D-019 與 BDD 035/037/066 | IT-025；API-020/026/029/041/044/047 | 六個受保護端點明確 `RequireAuthorization`（HS256 Access＋D1 primary family 驗證）、缺失／過期／撤銷時 handler 執行 0 次；匿名／refresh／logout／OPTIONS 與未知 404 例外 |
| `PF-GAP-14` 高 | M8；D-018/D-026 與 BDD 019/077 | UT-019；IT-007；API-010/012/031/033；E2E-007/022 | known／unknown／Google-only request＋resend 保留同形 202 及文案；無人為固定等待，快成功即回，接受時間差剩餘風險 |

## 四、使用者決策紀錄與白話結果

| 問題／決策 | 2026-10-27 原文／決策 | 實際結果 |
|---|---|---|
| Q1／D-017 | 「不允許多分頁/跨裝置登入」；追問新舊優先後選「允許電腦登入，立即登出手機」 | 新裝置成功登入即撤銷舊 family；新登入 commit 前失敗保舊。同一 Account 不會有兩個同時未撤銷 family |
| Q2／D-018 | 已白話解釋時間差與 5 秒僅為提案後，答「不需要有任何等待」 | 不加固定延遲，正常必要 I/O 完成即回；保留通用訊息／驗碼／限流，接受回應快慢仍可能讓人推測地址是否存在（[OWASP 忘記密碼指引](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)） |
| 精簡／D-019～D-028 | 檢視登入認證過度設計分析後，明確指示「全套精簡」並繼續完成設計更新 | ① Access 改為 HS256 單一秘密（D-019）；② Refresh 增設 30 秒寬限窗與 409 `REFRESH_RETRY`（D-020）；③ 取消 Web 單分頁鎖與預期工作階段請求標頭，改用 `X-DatingHigh-Session` 回應標頭同步（D-021）；④ 移除輔助版本／批次標記欄位與結尾故意違反約束之 guard，改用同 batch 共用前置條件與自然 UNIQUE 回滾（D-022）；⑤ Google 首次登入驗可信網域後直接建帳回 201，移除外部註冊收件碼端點（D-023、D-024）；⑥ 已登入連結 Google 不需密碼、不踢登出（D-025）；⑦ 移除驗證碼投遞狀態機，sender 逾時 10 秒、註冊失敗回 503 `EMAIL_DELIVERY_FAILED`（D-026）；⑧ 單一 HMAC 秘密全由 .NET 雜湊＋靜態 `RateLimitPolicies`（D-027）；⑨ 傳輸判定簡化為兩條規則（D-028）；Schema 由 66 欄降為 54 欄，公開 API 由 18 組降為 17 組 |

## 五、處理與交接狀態

| 項目 | 狀態 | 文件位置／下一步 |
|---|---|---|
| MVP／SPEC／BDD／TDD／RiskAudit | 已依 D-017～D-028 全面同步更新 | 五份規劃文件契約、欄位數（54 欄）、端點數（17 組）、場景數（92 場景）與測試數（227 案）完全對齊 |
| H1／D-017／D-020／D-021 | 已回寫文件 | SPEC 權杖與單一登入節、BDD 004/007/017/051/055/086 及 TDD 對應案例 |
| H2／H3／M1..M7（含 D-019、D-022～D-028） | 已回寫文件 | SPEC 同 batch 原子性／Google 直接建帳／連結簡化／sender 10 秒／靜態限流／兩條傳輸規則；GAP02..13 各案例 |
| M8／D-018 | 使用者接受剩餘時間差；已回寫取捨 | MVP D-018、SPEC forgot、BDD 019/077、GAP14 |
| L1／L2 | 已記錄交接注意事項 | 鎖版、真三平台／雲端證據、六表 54 欄、UUIDv7 及 `idx_auth_sessions_active_account` partial UNIQUE 仍須實作驗收 |
| 基線追溯 | 92 場景／227 測試規劃，修訂覆核完成 | 五文件來源／表格／映射完整，沒有孤立或未定義案例；所有應用測試未執行 |
| 開發交接 | **Ready for well-done**；規劃阻斷項：無 | 2026-10-29 使用者以「同意目前版本」完成修訂版及風險取捨確認；TDD 已持久化確認日期、13 組已補回缺漏與 1 組接受剩餘風險的紀錄，交由 well-done 實作 |

本次確認的是設計與開發基準，不代表底層原子性、Refresh 競態或真服務已驗證。D1 條件寫入／零列無副作用、Refresh 寬限恢復、Google、真收信及 Web／Android／iOS 證據，均須依 TDD 在實作階段完成；規劃就緒不改變目前實作與測試進度 0%。

## 六、文件查核與外部依據

### 靜態文件查核

- BDD：**92 個唯一 Scenario**（`PF-BDD-001..094`，其中 `PF-BDD-006`、`PF-BDD-073` 已依 D-023 移除不重編）、**25 個 `@frontend`**；每個具 Given／When／Then、優先級與類型，未勾選 92／92。
- Schema：`auth_accounts` 8 欄、`auth_external_identities` 5 欄、`auth_sessions` 10 欄、`auth_refresh_tokens` 8 欄、`auth_email_challenges` 16 欄、`common_rate_limit_buckets` 7 欄，**合計 54 欄**。
- TDD：**227 個唯一案例**（117 Unit／35 Integration／51 API／24 E2E；`PF-API-007..009` 已依 D-023 移除不重編）、**92 個場景映射**、每場景 3–6 個 Unit 及至少一個高層案例；0 個孤立案例、0 個未定義引用、**17 組 API 端點**。
- 五份文件均為 UTF-8 無 BOM、LF 行尾，相對連結與跨文件引用核對一致。以上皆為文件靜態檢查，沒有執行應用測試。

### 官方來源（2026-10-25 查核；2026-10-27 補查）

- [Expo SDK 58](https://expo.dev/changelog/sdk-58)、[Google 登入](https://docs.expo.dev/guides/google-authentication/)：版本與 development build 條件。
- [Containers 本地開發](https://developers.cloudflare.com/containers/guides/local-dev/)、[Worker bindings 接線](https://developers.cloudflare.com/containers/configuration/workers-connections/)：自有 Dockerfile、本地版本與 outbound handler。
- [Email Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)、[寄件設定](https://developers.cloudflare.com/email-service/get-started/send-emails/)：真 sender binding 與網域條件；接受回應不代替實際收件。
- [D1 batch](https://developers.cloudflare.com/d1/worker-api/d1-database/)：批次交易失敗與回滾依據。
- [SQLite partial indexes](https://www.sqlite.org/partialindex.html)：以條件 UNIQUE 保護單一未撤銷 family；不把動態現在時間寫入索引條件。
- [OWASP 忘記密碼](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)：一致訊息及時序建議；本案依 D-018 不加人工等待並記錄剩餘風險。

本報告的同 batch 共用前置條件、sender 10 秒逾時、Refresh 30 秒寬限窗、單一登入與 `X-DatingHigh-Session` 分頁同步及風險分級為設計判斷，官方文件僅支持所引用的底層行為，不代表官方替本專案背書或已驗證實作。
