# SPEC-001-AvatarAndPreferences — TDD 測試清單

> **MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
> **SPEC**：[SPEC-001-AvatarAndPreferences](../specs/SPEC-001-AvatarAndPreferences.md)（使用者 2026-11-01 已確認，包括 D-047 無 SQL Trigger）
> **BDD**：[SPEC-001-AvatarAndPreferences-BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md)，68 個唯一場景
> **日期**：2026-11-01；**交接狀態**：**Ready for well-done**（SDD／RiskAudit 已確認，RQ-01=A、RQ-02=A；14項稽核測試已補，**尚未實作或通過任何測試**）

---

## 🎯 開發進度總覽

```text
📦 AvatarAndPreferences TDD
├─ 🔴 Red-Green-Refactor：未開始
├─ BDD：0/68 Scenario 通過
├─ TDD：0/257 測試通過（原243＋風險補強14）
├─ 前端：0/12 場景完成（需分 Web、Android、iOS 驗收）
└─ 進度：[░░░░░░░░░░░░░░░░░░░░] 0%
```

| 層級 | 待測數量 | 已驗收 | 狀態 |
|---|---:|---:|---|
| 單元測試 UT | 113 | 0 | 未開始 |
| 真 D1／R2／服務整合 IT | 65 | 0 | 未開始 |
| API 合約 API | 41 | 0 | 未開始 |
| Web／Android／iOS E2E | 38 | 0 | 未開始 |
| **合計** | **257** | **0** | **0%** |

**基線與範圍**：本份只有 `user_profiles` 15欄、`user_media_assets` 9欄；依 D-047 沒有 SQL Trigger；照片上限必須用固定 prepared 單條件式 `INSERT ... SELECT ... WHERE COUNT < 5 RETURNING`，不可先查再無條件插入；媒體更新採 owner、kind、status 條件與可變欄位白名單。原六張基礎表 54欄不變；名片邀請／同意／25分權限仍由後續 SPEC 負責。

**真實性 Gate**：UT 可 mock 時鐘／AI 故障，IT 的 SQL 性質須實際 Miniflare D1；R2 私人串流須實際介面；Gemini 真圖驗證不可用 mock 替代；16 款角色須有真正式資產；原型 Fixture 和 PlatformFoundation 過往通過不作此 SPEC 證據。

### 里程碑

- [ ] M1 — Red→Green：Domain／Application 規則與共用媒體壓縮
- [ ] M2 — 真 Miniflare D1，兩表、全部 API／媒體 R2、原子並發
- [ ] M3 — 真 Gemini 四張、相似度人工驗收、暫存一小時及選1張
- [ ] M4 — Web／Android／iOS UX、授權及故障驗證（未驗收平台保留明確缺項）
- [ ] M5 — 跨 SPEC 名片契約交付及完整深度稽核

## 🔗 MVP／SPEC／BDD／TDD 追溯矩陣

每個 `AP-BDD` 至少對應 3 個可驗證 TDD 項；每個 TDD ID 只在一項 checklist 中計數。MVP→AP-AC 以 SPEC §1.1 明確的 US-001／002／003 及 US-020 資料契約為準，不能因此把整個 US-020 標完成。

| BDD Scenario | SPEC 驗收 | 對應 TDD |
|---|---|---|
| `AP-BDD-001` | AP-AC-001、AP-AC-020 | `AP-UT-001`、`AP-UT-002`、`AP-IT-001` |
| `AP-BDD-002` | AP-AC-001、AP-AC-009、AP-AC-019 | `AP-UT-003`、`AP-UT-004`、`AP-IT-002`、`AP-API-040` |
| `AP-BDD-003` | AP-AC-001 | `AP-UT-005`、`AP-UT-006`、`AP-IT-003` |
| `AP-BDD-004` | AP-AC-001、AP-AC-015、AP-AC-023 | `AP-UT-007`、`AP-UT-008`、`AP-IT-004`、`AP-IT-065` |
| `AP-BDD-005` | AP-AC-004、AP-AC-017 | `AP-UT-009`、`AP-UT-010`、`AP-IT-005`、`AP-E2E-038` |
| `AP-BDD-006` | AP-AC-004、AP-AC-006 | `AP-UT-011`、`AP-UT-012`、`AP-IT-006` |
| `AP-BDD-007` | AP-AC-005、AP-AC-012、AP-AC-013 | `AP-UT-013`、`AP-UT-014`、`AP-IT-007`、`AP-API-041` |
| `AP-BDD-008` | AP-AC-021 | `AP-UT-015`、`AP-UT-016`、`AP-IT-008` |
| `AP-BDD-009` | AP-AC-011 | `AP-UT-017`、`AP-UT-018`、`AP-IT-009` |
| `AP-BDD-010` | AP-AC-012、AP-AC-015 | `AP-UT-019`、`AP-UT-020`、`AP-IT-010` |
| `AP-BDD-011` | AP-AC-013、AP-AC-014 | `AP-UT-021`、`AP-UT-022`、`AP-IT-011` |
| `AP-BDD-012` | AP-AC-007、AP-AC-008、AP-AC-010 | `AP-UT-023`、`AP-UT-024`、`AP-IT-012` |
| `AP-BDD-013` | AP-AC-015、AP-AC-016、AP-AC-023 | `AP-UT-025`、`AP-UT-026`、`AP-IT-013` |
| `AP-BDD-014` | AP-AC-020 | `AP-UT-027`、`AP-UT-028`、`AP-IT-014` |
| `AP-BDD-015` | AP-AC-002、AP-AC-003、AP-AC-018 | `AP-UT-029`、`AP-UT-030`、`AP-IT-015`、`AP-IT-061` |
| `AP-BDD-016` | AP-AC-003、AP-AC-006 | `AP-UT-031`、`AP-UT-032`、`AP-IT-016` |
| `AP-BDD-017` | AP-AC-003、AP-AC-004 | `AP-UT-033`、`AP-UT-034`、`AP-IT-017` |
| `AP-BDD-018` | AP-AC-019 | `AP-UT-035`、`AP-UT-036`、`AP-IT-018` |
| `AP-BDD-019` | AP-AC-024 | `AP-UT-037`、`AP-UT-038`、`AP-IT-019` |
| `AP-BDD-020` | AP-AC-001、AP-AC-004 | `AP-UT-039`、`AP-UT-040`、`AP-IT-020` |
| `AP-BDD-021` | AP-AC-001、AP-AC-018 | `AP-UT-041`、`AP-UT-042`、`AP-IT-021` |
| `AP-BDD-022` | AP-AC-001 | `AP-UT-043`、`AP-UT-044`、`AP-IT-022` |
| `AP-BDD-023` | AP-AC-003 | `AP-UT-045`、`AP-UT-046`、`AP-IT-023` |
| `AP-BDD-024` | AP-AC-005、AP-AC-012 | `AP-UT-047`、`AP-UT-048`、`AP-IT-024` |
| `AP-BDD-025` | AP-AC-003 | `AP-UT-049`、`AP-UT-050`、`AP-IT-025` |
| `AP-BDD-026` | AP-AC-015、AP-AC-023 | `AP-UT-051`、`AP-UT-052`、`AP-IT-026` |
| `AP-BDD-027` | AP-AC-014 | `AP-UT-053`、`AP-UT-054`、`AP-IT-027` |
| `AP-BDD-028` | AP-AC-009 | `AP-UT-055`、`AP-UT-056`、`AP-IT-028` |
| `AP-BDD-029` | AP-AC-009 | `AP-UT-057`、`AP-UT-058`、`AP-IT-029` |
| `AP-BDD-030` | AP-AC-009、AP-AC-019 | `AP-UT-059`、`AP-UT-060`、`AP-IT-030` |
| `AP-BDD-031` | AP-AC-001 | `AP-UT-061`、`AP-UT-062`、`AP-IT-031` |
| `AP-BDD-032` | AP-AC-007、AP-AC-008 | `AP-UT-063`、`AP-UT-064`、`AP-IT-032` |
| `AP-BDD-033` | AP-AC-007 | `AP-UT-065`、`AP-UT-066`、`AP-IT-033` |
| `AP-BDD-034` | AP-AC-003、AP-AC-024 | `AP-UT-067`、`AP-UT-068`、`AP-IT-034` |
| `AP-BDD-035` | AP-AC-003、AP-AC-024 | `AP-UT-069`、`AP-UT-070`、`AP-IT-035` |
| `AP-BDD-036` | AP-AC-003、AP-AC-018、AP-AC-024 | `AP-UT-071`、`AP-UT-072`、`AP-IT-036` |
| `AP-BDD-037` | AP-AC-003 | `AP-UT-073`、`AP-UT-074`、`AP-IT-037`、`AP-IT-064` |
| `AP-BDD-038` | AP-AC-003、AP-AC-006 | `AP-UT-075`、`AP-UT-076`、`AP-IT-038` |
| `AP-BDD-039` | AP-AC-001 | `AP-UT-077`、`AP-UT-078`、`AP-IT-039` |
| `AP-BDD-040` | AP-AC-003 | `AP-UT-079`、`AP-UT-080`、`AP-IT-040`、`AP-IT-063` |
| `AP-BDD-041` | AP-AC-005、AP-AC-013 | `AP-UT-081`、`AP-UT-082`、`AP-IT-041` |
| `AP-BDD-042` | AP-AC-021 | `AP-UT-083`、`AP-UT-084`、`AP-IT-042` |
| `AP-BDD-043` | AP-AC-016、AP-AC-023 | `AP-UT-085`、`AP-UT-086`、`AP-IT-043` |
| `AP-BDD-044` | AP-AC-016、AP-AC-023 | `AP-UT-087`、`AP-UT-088`、`AP-IT-044` |
| `AP-BDD-045` | AP-AC-005 | `AP-UT-089`、`AP-UT-090`、`AP-IT-045` |
| `AP-BDD-046` | AP-AC-001 | `AP-UT-091`、`AP-UT-092`、`AP-IT-046` |
| `AP-BDD-047` | AP-AC-001 | `AP-UT-093`、`AP-UT-094`、`AP-IT-047`、`AP-IT-057`、`AP-IT-058` |
| `AP-BDD-048` | AP-AC-001 | `AP-UT-095`、`AP-UT-096`、`AP-IT-048` |
| `AP-BDD-049` | AP-AC-001、AP-AC-006 | `AP-UT-097`、`AP-UT-098`、`AP-IT-049`、`AP-IT-059` |
| `AP-BDD-050` | AP-AC-005、AP-AC-021 | `AP-UT-099`、`AP-UT-100`、`AP-IT-050`、`AP-UT-113` |
| `AP-BDD-051` | AP-AC-011、AP-AC-013 | `AP-UT-101`、`AP-UT-102`、`AP-IT-051` |
| `AP-BDD-052` | AP-AC-019 | `AP-UT-103`、`AP-UT-104`、`AP-IT-052`、`AP-IT-062` |
| `AP-BDD-053` | AP-AC-003 | `AP-UT-105`、`AP-UT-106`、`AP-IT-053` |
| `AP-BDD-054` | AP-AC-003 | `AP-UT-107`、`AP-UT-108`、`AP-IT-054` |
| `AP-BDD-055` | AP-AC-023 | `AP-UT-109`、`AP-UT-110`、`AP-IT-055`、`AP-IT-060` |
| `AP-BDD-056` | AP-AC-024 | `AP-UT-111`、`AP-UT-112`、`AP-IT-056` |
| `AP-BDD-057` | AP-AC-001、AP-AC-020 | `AP-E2E-001`、`AP-E2E-002`、`AP-E2E-003` |
| `AP-BDD-058` | AP-AC-004、AP-AC-017 | `AP-E2E-004`、`AP-E2E-005`、`AP-E2E-006` |
| `AP-BDD-059` | AP-AC-001、AP-AC-009 | `AP-E2E-007`、`AP-E2E-008`、`AP-E2E-009` |
| `AP-BDD-060` | AP-AC-001 | `AP-E2E-010`、`AP-E2E-011`、`AP-E2E-012` |
| `AP-BDD-061` | AP-AC-018 | `AP-E2E-013`、`AP-E2E-014`、`AP-E2E-015`、`AP-E2E-037` |
| `AP-BDD-062` | AP-AC-003、AP-AC-018 | `AP-E2E-016`、`AP-E2E-017`、`AP-E2E-018` |
| `AP-BDD-063` | AP-AC-003、AP-AC-022 | `AP-E2E-019`、`AP-E2E-020`、`AP-E2E-021` |
| `AP-BDD-064` | AP-AC-003、AP-AC-024 | `AP-E2E-022`、`AP-E2E-023`、`AP-E2E-024` |
| `AP-BDD-065` | AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021 | `AP-E2E-025`、`AP-E2E-026`、`AP-E2E-027` |
| `AP-BDD-066` | AP-AC-020、AP-AC-015 | `AP-E2E-028`、`AP-E2E-029`、`AP-E2E-030` |
| `AP-BDD-067` | AP-AC-016、AP-AC-023 | `AP-E2E-031`、`AP-E2E-032`、`AP-E2E-033` |
| `AP-BDD-068` | AP-AC-001、AP-AC-003、AP-AC-012 | `AP-E2E-034`、`AP-E2E-035`、`AP-E2E-036` |

## 1️⃣ 單元測試（Unit Tests）

.NET Domain/Application 隔離規則、可固定 clock/provider；所有業務判斷的正常／拒絕均需先 Red 後 Green。

- [ ] `AP-UT-001` **`PhotoPurposeNotice_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已登入且目前沒有照片；執行 本人開啟照片管理並選擇上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-002` **`PhotoPurposeNotice_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟照片管理並選擇上傳；斷言 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」；並且 並告知照片將在本人主動啟用 AI 時提供第三方生成服務。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-003` **`PersonalPhotoUpload_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人選擇兩張有效圖片且單張不超過8 MiB；執行 本人依序上傳照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-004` **`PersonalPhotoUpload_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人依序上傳照片；斷言 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2；並且 D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-005` **`PersonalPhotoReorder_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有三張 ready 個人照且持有目前 revision；執行 本人提交包含全部三張資產的全新順序；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-006` **`PersonalPhotoReorder_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人提交包含全部三張資產的全新順序；斷言 本人照片顯示順序依提交清單更新；並且 不產生額外照片及不改動其他帳號資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-007` **`PersonalPhotoDelete_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-004`（AP-AC-001、AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有一張 ready 照片且已授權的同輪名片讀取存在；執行 本人刪除該照片後對方再提出有效名片讀取；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-008` **`PersonalPhotoDelete_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-004`（AP-AC-001、AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人刪除該照片後對方再提出有效名片讀取；斷言 已刪照片不再列於即時名片且不能重新取得影像；並且 已刪照不作下次 AI 輸入並可排程清除 R2。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-009` **`BuiltinAvatarCatalog_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已登入；執行 本人開啟免費化身選擇清單；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-010` **`BuiltinAvatarCatalog_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟免費化身選擇清單；斷言 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪；並且 任何使用者都能跨風格分組自由選用且不要求照片。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-011` **`SelectBuiltinAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已取得合法 builtin ID 且 revision 最新；執行 本人選取免費角色並重新登入另一裝置；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-012` **`SelectBuiltinAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選取免費角色並重新登入另一裝置；斷言 目前遊戲化身仍為相同的 builtin ID；並且 保留暱稱、職業與其他既有個人資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-013` **`SaveDatingProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有最新 revision 及合法資料欄位；執行 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-014` **`SaveDatingProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；斷言 資料以 user_profiles 的固定 JSON 契約保存；並且 下次 GET 回傳同一目前版本且 revision 增加1。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-015` **`AdultProfileReady_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身；執行 本人儲存並重新讀取個人資料；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-016` **`AdultProfileReady_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存並重新讀取個人資料；斷言 profileReady 為 true；並且 精確生日只供後端且不出現在他人投影。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-017` **`InterestCatalog_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗；執行 本人開啟目錄並儲存合法標籤；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-018` **`InterestCatalog_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟目錄並儲存合法標籤；斷言 使用代碼而非 label 持久化三組興趣資料；並且 舊代碼停用後既存資料仍可辨識。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-019` **`CurrentCardProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-010`（AP-AC-012、AP-AC-015）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已填寫 occupation、生活習慣與價值觀；執行 受信任服務以有效同意內容讀取名片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-020` **`CurrentCardProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-010`（AP-AC-012、AP-AC-015）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 受信任服務以有效同意內容讀取名片；斷言 回傳本人當前工作和生活描述；並且 不含私人擇偶條件或登入帳號秘密。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-021` **`MatchingInputProjection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-011`（AP-AC-013、AP-AC-014）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已保存合法年齡範圍、地區、興趣權重及標籤；執行 已授權的 MatchingSessions 服務要求配對輸入；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-022` **`MatchingInputProjection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-011`（AP-AC-013、AP-AC-014）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 已授權的 MatchingSessions 服務要求配對輸入；斷言 只回傳目前配對演算法必需的欄位；並且 不回傳真人照、Email、原型固定候選或他人資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-023` **`CandidatePersonaProjection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-012`（AP-AC-007、AP-AC-008、AP-AC-010）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：配對服務已對本輪候選完成授權；執行 呼叫取得候選人物投影；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-024` **`CandidatePersonaProjection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-012`（AP-AC-007、AP-AC-008、AP-AC-010）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 呼叫取得候選人物投影；斷言 回傳當前選用化身與有限公開暱稱資訊；並且 不含真人照、occupation、生日、Email 或擇偶私有資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-025` **`AuthorizedCardPhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-013`（AP-AC-015、AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：同輪雙方已有效同意且互動未終止；執行 授權服務請求當前名片與受控照片串流；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-026` **`AuthorizedCardPhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-013`（AP-AC-015、AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 授權服務請求當前名片與受控照片串流；斷言 讀到最新 ready 照片的200KB壓縮版；並且 不產生任何名片快照或公開 R2 URL。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-027` **`MyCardPreview_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已填入工作、興趣與照片；執行 本人開啟我的名片預覽；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-028` **`MyCardPreview_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟我的名片預覽；斷言 顯示本人當前可分享的欄位與照片；並且 預覽權限不提供另一人讀取授權。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-029` **`GenerateFourAvatars_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已保存至少兩張 ready 真人照並主動同意傳給 AI；執行 本人點擊鎖頭選風格並提交生成；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-030` **`GenerateFourAvatars_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人點擊鎖頭選風格並提交生成；斷言 無須付款即可收到4張不同的真 AI 插畫候選；並且 回傳一小時內有效的 attemptId 和四個候選索引。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-031` **`SelectGeneratedAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有四張尚未過期的私人 R2 候選和最新 revision；執行 本人選中其中第3張；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-032` **`SelectGeneratedAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選中其中第3張；斷言 僅第3張正式寫入 user_media_assets 並更新目前遊戲化身；並且 另外3張不建立正式媒體列且舊化身不被提前覆寫。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-033` **`ReselectGeneratedAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人擁有先前成功選定且仍為 ready 的 generated_avatar；執行 本人切換至該正式 assetId；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-034` **`ReselectGeneratedAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人切換至該正式 assetId；斷言 選用的 generated_avatar 被持久化為目前化身；並且 無需重新呼叫生成服務也不須新增圖片。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-035` **`ReusableImageCompression_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：另一個服務提供符合介面契約的圖片 stream 與 targetBytes；執行 該服務呼叫同一 IImageCompressionService；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-036` **`ReusableImageCompression_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 該服務呼叫同一 IImageCompressionService；斷言 得到正確 MIME、寬高及小於等於目標的壓縮輸出；並且 實作未依賴 avatar 名稱、R2 或照片數量規則。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-037` **`GeminiLiveVerification_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：測試環境以安全方式配置使用者授權的 Gemini API 憑證與照片；執行 後端啟用受控真 API 驗證；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-038` **`GeminiLiveVerification_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端啟用受控真 API 驗證；斷言 真實產生四張並記錄不含敏感資料的模型版本及成功證據；並且 客戶端、Git 和日誌不包含金鑰或原始人像內容。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-039` **`FreeWithoutPhotos_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人沒有任何真人照片；執行 本人選取 male-03 或 female-07；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-040` **`FreeWithoutPhotos_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選取 male-03 或 female-07；斷言 可以成功選用免費角色並進入已具備條件的個人資料流程；並且 不觸發 Gemini、付費或強制照片欄位。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-041` **`InsufficientSourcePhotos_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人只有0或1張 ready 真人照；執行 本人點擊 AI 鎖頭；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-042` **`InsufficientSourcePhotos_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人點擊 AI 鎖頭；斷言 顯示至少需要兩張已保存真人照的提示；並且 不發送 AI provider 請求也不改動目前化身。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-043` **`ReplaceAtPhotoLimit_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已持有五張 ready 真人照；執行 本人刪除一張後再上傳一張有效照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-044` **`ReplaceAtPhotoLimit_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人刪除一張後再上傳一張有效照片；斷言 新照片可占用釋放的第五個額度；並且 已刪照片不能復活或混入當前名片。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-045` **`AbandonGeneratedCandidates_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有當前免費角色；執行 本人啟動 AI 後選擇不使用任何結果；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-046` **`AbandonGeneratedCandidates_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人啟動 AI 後選擇不使用任何結果；斷言 當前化身保持不變；並且 暫存四張候選在期限到達後被清理。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-047` **`OptionalOccupation_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有成年生日、暱稱及合法角色；執行 本人將 occupation 設為 null；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-048` **`OptionalOccupation_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人將 occupation 設為 null；斷言 可成功保存並完成最小設定；並且 名片不會憑空顯示虛構職業。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-049` **`RetryExpiredAttempt_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人的上一次 attempt 已過期；執行 本人在有足夠照片時重新點擊生成；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-050` **`RetryExpiredAttempt_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人在有足夠照片時重新點擊生成；斷言 發起獨立的新生成請求而不是恢復舊 Job；並且 可能再次產生 API 成本且 UI 清楚提示。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-051` **`LiveCardRefresh_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-026`（AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：有效名片交換後本人修改 occupation 與照片；執行 同輪對方在互動仍有效時重新讀取名片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-052` **`LiveCardRefresh_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-026`（AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 同輪對方在互動仍有效時重新讀取名片；斷言 只顯示新的 occupation 和現存 ready 照片；並且 不從配對當時或前次名片讀取快照。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-053` **`PersistAfterRelogin_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已儲存偏好及正式選用角色；執行 本人重新登入 Web 或原生裝置；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-054` **`PersistAfterRelogin_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人重新登入 Web 或原生裝置；斷言 讀取同一帳號最新個人資料、照片清單與化身；並且 不因 Session family 改變而重新產生使用者資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-055` **`RejectOversizePhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人選擇一張大於8 MiB的照片；執行 本人送出照片上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-056` **`RejectOversizePhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人送出照片上傳；斷言 回傳413 IMAGE_TOO_LARGE；並且 R2 不保存原始檔且 D1 不增加 ready 照片。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-057` **`RejectForgedImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：檔名為 .jpg 但內容不是可解碼影像；執行 本人嘗試上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-058` **`RejectForgedImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人嘗試上傳；斷言 回傳400 INVALID_IMAGE；並且 不得產生可讀的圖片資產或洩漏解碼例外。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-059` **`RejectUncompressibleImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：圖片經安全解碼仍無法在畫質限制內壓至200000 bytes；執行 本人上傳該圖片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-060` **`RejectUncompressibleImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人上傳該圖片；斷言 回傳413 COMPRESSED_IMAGE_TOO_LARGE；並且 不改存未壓縮原檔，也不破壞已存照片。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-061` **`RejectSixthPhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有五張 pending 或 ready 本人照；執行 本人再上傳第六張；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-062` **`RejectSixthPhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人再上傳第六張；斷言 回傳409 PHOTO_LIMIT_REACHED；並且 資料庫不得新增第六張或殘留可讀 R2 孤兒。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-063` **`RejectForeignMedia_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權；執行 B 猜出 A 的 assetId 嘗試取得影像；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-064` **`RejectForeignMedia_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 猜出 A 的 assetId 嘗試取得影像；斷言 伺服器以本人擁有權驗證拒絕存取；並且 不公開圖片存在性、R2 objectKey 或持久 URL。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-065` **`RejectRevokedSession_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人舊 Session family 已被新登入撤銷；執行 舊憑證請求照片或選用化身；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-066` **`RejectRevokedSession_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 舊憑證請求照片或選用化身；斷言 回傳401 SESSION_REVOKED；並且 不得把舊請求寫入任何帳號的資料。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-067` **`RejectPartialGeneration_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：AI provider 真實或測試替身只返回三張不同圖；執行 本人提交一次生成；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-068` **`RejectPartialGeneration_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人提交一次生成；斷言 回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確生成失敗；並且 舊化身保留、已暫存候選被清理且不建 Job。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-069` **`RejectDuplicateGeneratedImages_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：provider 回傳至少兩張 byte-identical 圖片；執行 後端處理四張結果；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-070` **`RejectDuplicateGeneratedImages_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端處理四張結果；斷言 本次生成不得視為四張不同結果完成；並且 不以相同圖複製冒充候選。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-071` **`HandleGeminiFailure_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：Gemini 不可用、已達額度或請求超時；執行 本人要求 AI 生成；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-072` **`HandleGeminiFailure_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人要求 AI 生成；斷言 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；並且 保留舊化身且不得以假圖代替真結果。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-073` **`RejectExpiredCandidate_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：attemptId 已超過60分鐘；執行 本人試圖預覽或選擇過期候選；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-074` **`RejectExpiredCandidate_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人試圖預覽或選擇過期候選；斷言 預覽回410 AVATAR_CANDIDATE_EXPIRED；並且 不得新增正式媒體資產或改動目前化身。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-075` **`RejectForeignAvatarSelection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：B 持有 A 的 attemptId 或 generated assetId；執行 B 試圖將該圖設為自己的角色；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-076` **`RejectForeignAvatarSelection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 試圖將該圖設為自己的角色；斷言 回傳404或400 INVALID_AVATAR_SELECTION；並且 B 的目前角色及兩個帳號資產均維持原狀。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-077` **`CompensateFailedPhotoStorage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：照片在 D1 成功占位但 R2 上傳失敗；執行 後端執行失敗補償；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-078` **`CompensateFailedPhotoStorage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端執行失敗補償；斷言 本人該筆 pending 標記 deleted 且不可對外顯示；並且 不洩漏未壓縮 bytes，重試可正常占用額度。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-079` **`CompensateFailedAvatarSelection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：候選圖已複製到正式 R2 但 D1 CAS 失敗；執行 後端執行補償；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-080` **`CompensateFailedAvatarSelection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端執行補償；斷言 標記失敗的正式媒體列 deleted 並清除 R2 孤兒；並且 目前原化身仍有效且其他候選不持久化。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-081` **`RejectInvalidProfilePayload_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人送未知鍵、非法年齡範圍或非法標籤代碼；執行 本人更新個人資料；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-082` **`RejectInvalidProfilePayload_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人更新個人資料；斷言 回傳400 INVALID_PROFILE；並且 revision、JSON 內容及其他資料保持原值。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-083` **`RejectUnderageProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人輸入未滿18歲的有效生日；執行 本人嘗試完成個人資料設定；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-084` **`RejectUnderageProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人嘗試完成個人資料設定；斷言 profileReady 為 false 且交友入口被阻擋；並且 不得把尚未完成成年驗證當作已成年。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-085` **`RejectUnconsentedCard_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：雙方尚未完成同輪名片交換同意；執行 B 試圖查閱 A 的名片與私人照；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-086` **`RejectUnconsentedCard_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 試圖查閱 A 的名片與私人照；斷言 內部受控查詢拒絕；並且 即使知道對方 assetId 也不能經本人路由繞過。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-087` **`RejectTerminatedCard_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-044`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：A、B 曾同意名片但該輪已終止或 B 換成另一輪；執行 B 請求 A 的新資料或新照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-088` **`RejectTerminatedCard_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-044`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 請求 A 的新資料或新照片；斷言 授權服務拒絕新讀取；並且 先前見過的影像不能因此生成新的永久授權 URL。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-089` **`RejectStaleProfileRevision_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人同時開啟兩個版本相同的編輯頁；執行 第一頁成功更新後第二頁儲存舊 expectedRevision；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-090` **`RejectStaleProfileRevision_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 第一頁成功更新後第二頁儲存舊 expectedRevision；斷言 第二頁回409 PROFILE_VERSION_CONFLICT；並且 第一頁更新保留且前端提示重新載入。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-091` **`RejectInvalidPhotoOrder_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人提供不完整、重複或含其他人的照片排序清單；執行 本人送出排序；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-092` **`RejectInvalidPhotoOrder_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人送出排序；斷言 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT；並且 所有原照片順序和 revision 保持不變。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-093` **`AtomicFifthSixthInsert_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有四張 pending 或 ready 真人照；執行 兩個來源同時向同一 D1 執行受控條件 INSERT；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-094` **`AtomicFifthSixthInsert_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 兩個來源同時向同一 D1 執行受控條件 INSERT；斷言 最多一筆新增成功且最終有效數量恰為5；並且 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-095` **`PendingReservationCounts_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有四張 ready 及一張 pending 真人照；執行 另外一個請求嘗試上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-096` **`PendingReservationCounts_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 另外一個請求嘗試上傳；斷言 單一條件 INSERT 不得新增第六筆 pending；並且 pending 超時由既有清理處理但不能靠清理才限制額度。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-097` **`ImmutableMediaIdentity_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：已存在一筆 deleted 媒體資產；執行 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-098` **`ImmutableMediaIdentity_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；斷言 平台拒絕非法欄位與狀態變化；並且 不使用 Trigger 且所有受控入口維持同一不變式。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-099` **`UnicodeAndAgeBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：測試時鐘固定在臺灣日期並準備邊界生日；執行 本人依序輸入剛滿18歲與差一天未滿18歲生日；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-100` **`UnicodeAndAgeBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人依序輸入剛滿18歲與差一天未滿18歲生日；斷言 僅剛滿18歲能使 profileReady 為 true；並且 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-101` **`JsonPreferenceBoundaries_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人提供剛好上限的 traits、interest、topic、value 與 region 陣列；執行 本人儲存並接著測試重複及超上限元素；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-102` **`JsonPreferenceBoundaries_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存並接著測試重複及超上限元素；斷言 上限合法資料保存且重複、未知鍵、超限資料被拒絕；並且 preferredAgeMin/Max 成對且18至120、Min不大於Max。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-103` **`CompressionExactBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：不同影像大小剛好等於200000 bytes並透過分段輸入；執行 共用壓縮服務處理輸入；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-104` **`CompressionExactBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 共用壓縮服務處理輸入；斷言 成功輸出小於或等於200000 bytes；並且 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-105` **`CandidateIndexBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人持有有效 attemptId 且只有四個有效索引；執行 本人請求索引0、5或他人 attemptId；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-106` **`CandidateIndexBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人請求索引0、5或他人 attemptId；斷言 無效索引拒絕且合法1至4能讀；並且 R2 key 由 server 驗證的 accountId 形成，不能讓 client 指定。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-107` **`AvatarSelectionRace_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有兩個有效候選且同時送同一 expectedRevision；執行 兩個不同選用請求同時提交；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-108` **`AvatarSelectionRace_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 兩個不同選用請求同時提交；斷言 只有一個 CAS 成功且 revision 增加1；並且 落敗的複製檔案被補償，最終唯一角色仍可讀。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-109` **`CardTerminationRace_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-055`（AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：B 在同輪授權讀取 A 的照片之同時互動被終止；執行 後端準備開啟新的照片串流；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-110` **`CardTerminationRace_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-055`（AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端準備開啟新的照片串流；斷言 必須在開啟時核對有效同意與互動狀態；並且 不得因以前有同意就取得新增照片或新內容。失敗時保留既有狀態及無秘密 log。

- [ ] `AP-UT-111` **`SecretExposureBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：Gemini server secret 與本人照片已配置於測試環境；執行 執行成功與故障生成、產出客戶端 bundle；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [ ] `AP-UT-112` **`SecretExposureBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 執行成功與故障生成、產出客戶端 bundle；斷言 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source；並且 僅留下去識別的驗證證據。失敗時保留既有狀態及無秘密 log。

### [補強] 2026-11-01 實作前稽核追加 UT 測試（1項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [ ] `AP-UT-113` **`CalculateAdultAge_LeapDayAndTaiwanMidnight_UsesFixedClock`**
  - **稽核缺漏**：`RG-14`；**優先級**：低；**BDD**：`AP-BDD-050`；**來源**：RA-12、BDD-050
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **前置／操作**：以固定台灣時鐘測閏年2/29出生、剛滿18、差一天未滿18與午夜交界
  - **預期斷言**：固定時鐘驗2月29日、邊界當日及前一日，未成年不能 profileReady。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

## 2️⃣ 集成測試（Integration Tests）

實際 Miniflare D1／R2 私有資產與系統故障注入；SQL 不得只用 SQLite in-memory 或 stub 當真實結論。

- [ ] `AP-IT-001` **`PhotoPurposeNotice_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已登入且目前沒有照片；When 本人開啟照片管理並選擇上傳；Then 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」；And 並告知照片將在本人主動啟用 AI 時提供第三方生成服務。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-002` **`PersonalPhotoUpload_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人選擇兩張有效圖片且單張不超過8 MiB；When 本人依序上傳照片；Then 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2；And D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-003` **`PersonalPhotoReorder_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有三張 ready 個人照且持有目前 revision；When 本人提交包含全部三張資產的全新順序；Then 本人照片顯示順序依提交清單更新；And 不產生額外照片及不改動其他帳號資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-004` **`PersonalPhotoDelete_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-004`（AP-AC-001、AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有一張 ready 照片且已授權的同輪名片讀取存在；When 本人刪除該照片後對方再提出有效名片讀取；Then 已刪照片不再列於即時名片且不能重新取得影像；And 已刪照不作下次 AI 輸入並可排程清除 R2。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-005` **`BuiltinAvatarCatalog_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已登入；When 本人開啟免費化身選擇清單；Then 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪；And 任何使用者都能跨風格分組自由選用且不要求照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-006` **`SelectBuiltinAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已取得合法 builtin ID 且 revision 最新；When 本人選取免費角色並重新登入另一裝置；Then 目前遊戲化身仍為相同的 builtin ID；And 保留暱稱、職業與其他既有個人資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-007` **`SaveDatingProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有最新 revision 及合法資料欄位；When 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；Then 資料以 user_profiles 的固定 JSON 契約保存；And 下次 GET 回傳同一目前版本且 revision 增加1。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-008` **`AdultProfileReady_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身；When 本人儲存並重新讀取個人資料；Then profileReady 為 true；And 精確生日只供後端且不出現在他人投影。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-009` **`InterestCatalog_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗；When 本人開啟目錄並儲存合法標籤；Then 使用代碼而非 label 持久化三組興趣資料；And 舊代碼停用後既存資料仍可辨識。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-010` **`CurrentCardProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-010`（AP-AC-012、AP-AC-015）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已填寫 occupation、生活習慣與價值觀；When 受信任服務以有效同意內容讀取名片；Then 回傳本人當前工作和生活描述；And 不含私人擇偶條件或登入帳號秘密。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-011` **`MatchingInputProjection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-011`（AP-AC-013、AP-AC-014）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已保存合法年齡範圍、地區、興趣權重及標籤；When 已授權的 MatchingSessions 服務要求配對輸入；Then 只回傳目前配對演算法必需的欄位；And 不回傳真人照、Email、原型固定候選或他人資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-012` **`CandidatePersonaProjection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-012`（AP-AC-007、AP-AC-008、AP-AC-010）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 配對服務已對本輪候選完成授權；When 呼叫取得候選人物投影；Then 回傳當前選用化身與有限公開暱稱資訊；And 不含真人照、occupation、生日、Email 或擇偶私有資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-013` **`AuthorizedCardPhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-013`（AP-AC-015、AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 同輪雙方已有效同意且互動未終止；When 授權服務請求當前名片與受控照片串流；Then 讀到最新 ready 照片的200KB壓縮版；And 不產生任何名片快照或公開 R2 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-014` **`MyCardPreview_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已填入工作、興趣與照片；When 本人開啟我的名片預覽；Then 顯示本人當前可分享的欄位與照片；And 預覽權限不提供另一人讀取授權。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-015` **`GenerateFourAvatars_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已保存至少兩張 ready 真人照並主動同意傳給 AI；When 本人點擊鎖頭選風格並提交生成；Then 無須付款即可收到4張不同的真 AI 插畫候選；And 回傳一小時內有效的 attemptId 和四個候選索引。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-016` **`SelectGeneratedAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有四張尚未過期的私人 R2 候選和最新 revision；When 本人選中其中第3張；Then 僅第3張正式寫入 user_media_assets 並更新目前遊戲化身；And 另外3張不建立正式媒體列且舊化身不被提前覆寫。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-017` **`ReselectGeneratedAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人擁有先前成功選定且仍為 ready 的 generated_avatar；When 本人切換至該正式 assetId；Then 選用的 generated_avatar 被持久化為目前化身；And 無需重新呼叫生成服務也不須新增圖片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-018` **`ReusableImageCompression_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 另一個服務提供符合介面契約的圖片 stream 與 targetBytes；When 該服務呼叫同一 IImageCompressionService；Then 得到正確 MIME、寬高及小於等於目標的壓縮輸出；And 實作未依賴 avatar 名稱、R2 或照片數量規則。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-019` **`GeminiLiveVerification_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 測試環境以安全方式配置使用者授權的 Gemini API 憑證與照片；When 後端啟用受控真 API 驗證；Then 真實產生四張並記錄不含敏感資料的模型版本及成功證據；And 客戶端、Git 和日誌不包含金鑰或原始人像內容。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-020` **`FreeWithoutPhotos_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人沒有任何真人照片；When 本人選取 male-03 或 female-07；Then 可以成功選用免費角色並進入已具備條件的個人資料流程；And 不觸發 Gemini、付費或強制照片欄位。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-021` **`InsufficientSourcePhotos_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人只有0或1張 ready 真人照；When 本人點擊 AI 鎖頭；Then 顯示至少需要兩張已保存真人照的提示；And 不發送 AI provider 請求也不改動目前化身。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-022` **`ReplaceAtPhotoLimit_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已持有五張 ready 真人照；When 本人刪除一張後再上傳一張有效照片；Then 新照片可占用釋放的第五個額度；And 已刪照片不能復活或混入當前名片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-023` **`AbandonGeneratedCandidates_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已有當前免費角色；When 本人啟動 AI 後選擇不使用任何結果；Then 當前化身保持不變；And 暫存四張候選在期限到達後被清理。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-024` **`OptionalOccupation_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已有成年生日、暱稱及合法角色；When 本人將 occupation 設為 null；Then 可成功保存並完成最小設定；And 名片不會憑空顯示虛構職業。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-025` **`RetryExpiredAttempt_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人的上一次 attempt 已過期；When 本人在有足夠照片時重新點擊生成；Then 發起獨立的新生成請求而不是恢復舊 Job；And 可能再次產生 API 成本且 UI 清楚提示。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-026` **`LiveCardRefresh_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-026`（AP-AC-015、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 有效名片交換後本人修改 occupation 與照片；When 同輪對方在互動仍有效時重新讀取名片；Then 只顯示新的 occupation 和現存 ready 照片；And 不從配對當時或前次名片讀取快照。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-027` **`PersistAfterRelogin_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已儲存偏好及正式選用角色；When 本人重新登入 Web 或原生裝置；Then 讀取同一帳號最新個人資料、照片清單與化身；And 不因 Session family 改變而重新產生使用者資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-028` **`RejectOversizePhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人選擇一張大於8 MiB的照片；When 本人送出照片上傳；Then 回傳413 IMAGE_TOO_LARGE；And R2 不保存原始檔且 D1 不增加 ready 照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-029` **`RejectForgedImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 檔名為 .jpg 但內容不是可解碼影像；When 本人嘗試上傳；Then 回傳400 INVALID_IMAGE；And 不得產生可讀的圖片資產或洩漏解碼例外。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-030` **`RejectUncompressibleImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 圖片經安全解碼仍無法在畫質限制內壓至200000 bytes；When 本人上傳該圖片；Then 回傳413 COMPRESSED_IMAGE_TOO_LARGE；And 不改存未壓縮原檔，也不破壞已存照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-031` **`RejectSixthPhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有五張 pending 或 ready 本人照；When 本人再上傳第六張；Then 回傳409 PHOTO_LIMIT_REACHED；And 資料庫不得新增第六張或殘留可讀 R2 孤兒。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-032` **`RejectForeignMedia_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權；When B 猜出 A 的 assetId 嘗試取得影像；Then 伺服器以本人擁有權驗證拒絕存取；And 不公開圖片存在性、R2 objectKey 或持久 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-033` **`RejectRevokedSession_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人舊 Session family 已被新登入撤銷；When 舊憑證請求照片或選用化身；Then 回傳401 SESSION_REVOKED；And 不得把舊請求寫入任何帳號的資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-034` **`RejectPartialGeneration_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given AI provider 真實或測試替身只返回三張不同圖；When 本人提交一次生成；Then 回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確生成失敗；And 舊化身保留、已暫存候選被清理且不建 Job。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-035` **`RejectDuplicateGeneratedImages_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given provider 回傳至少兩張 byte-identical 圖片；When 後端處理四張結果；Then 本次生成不得視為四張不同結果完成；And 不以相同圖複製冒充候選。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-036` **`HandleGeminiFailure_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given Gemini 不可用、已達額度或請求超時；When 本人要求 AI 生成；Then 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；And 保留舊化身且不得以假圖代替真結果。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-037` **`RejectExpiredCandidate_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given attemptId 已超過60分鐘；When 本人試圖預覽或選擇過期候選；Then 預覽回410 AVATAR_CANDIDATE_EXPIRED；And 不得新增正式媒體資產或改動目前化身。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-038` **`RejectForeignAvatarSelection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given B 持有 A 的 attemptId 或 generated assetId；When B 試圖將該圖設為自己的角色；Then 回傳404或400 INVALID_AVATAR_SELECTION；And B 的目前角色及兩個帳號資產均維持原狀。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-039` **`CompensateFailedPhotoStorage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 照片在 D1 成功占位但 R2 上傳失敗；When 後端執行失敗補償；Then 本人該筆 pending 標記 deleted 且不可對外顯示；And 不洩漏未壓縮 bytes，重試可正常占用額度。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-040` **`CompensateFailedAvatarSelection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 候選圖已複製到正式 R2 但 D1 CAS 失敗；When 後端執行補償；Then 標記失敗的正式媒體列 deleted 並清除 R2 孤兒；And 目前原化身仍有效且其他候選不持久化。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-041` **`RejectInvalidProfilePayload_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人送未知鍵、非法年齡範圍或非法標籤代碼；When 本人更新個人資料；Then 回傳400 INVALID_PROFILE；And revision、JSON 內容及其他資料保持原值。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-042` **`RejectUnderageProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人輸入未滿18歲的有效生日；When 本人嘗試完成個人資料設定；Then profileReady 為 false 且交友入口被阻擋；And 不得把尚未完成成年驗證當作已成年。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-043` **`RejectUnconsentedCard_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 雙方尚未完成同輪名片交換同意；When B 試圖查閱 A 的名片與私人照；Then 內部受控查詢拒絕；And 即使知道對方 assetId 也不能經本人路由繞過。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-044` **`RejectTerminatedCard_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-044`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given A、B 曾同意名片但該輪已終止或 B 換成另一輪；When B 請求 A 的新資料或新照片；Then 授權服務拒絕新讀取；And 先前見過的影像不能因此生成新的永久授權 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-045` **`RejectStaleProfileRevision_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人同時開啟兩個版本相同的編輯頁；When 第一頁成功更新後第二頁儲存舊 expectedRevision；Then 第二頁回409 PROFILE_VERSION_CONFLICT；And 第一頁更新保留且前端提示重新載入。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-046` **`RejectInvalidPhotoOrder_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人提供不完整、重複或含其他人的照片排序清單；When 本人送出排序；Then 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT；And 所有原照片順序和 revision 保持不變。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-047` **`AtomicFifthSixthInsert_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有四張 pending 或 ready 真人照；When 兩個來源同時向同一 D1 執行受控條件 INSERT；Then 最多一筆新增成功且最終有效數量恰為5；And 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-048` **`PendingReservationCounts_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有四張 ready 及一張 pending 真人照；When 另外一個請求嘗試上傳；Then 單一條件 INSERT 不得新增第六筆 pending；And pending 超時由既有清理處理但不能靠清理才限制額度。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-049` **`ImmutableMediaIdentity_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 已存在一筆 deleted 媒體資產；When 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；Then 平台拒絕非法欄位與狀態變化；And 不使用 Trigger 且所有受控入口維持同一不變式。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-050` **`UnicodeAndAgeBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 測試時鐘固定在臺灣日期並準備邊界生日；When 本人依序輸入剛滿18歲與差一天未滿18歲生日；Then 僅剛滿18歲能使 profileReady 為 true；And 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-051` **`JsonPreferenceBoundaries_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人提供剛好上限的 traits、interest、topic、value 與 region 陣列；When 本人儲存並接著測試重複及超上限元素；Then 上限合法資料保存且重複、未知鍵、超限資料被拒絕；And preferredAgeMin/Max 成對且18至120、Min不大於Max。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-052` **`CompressionExactBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 不同影像大小剛好等於200000 bytes並透過分段輸入；When 共用壓縮服務處理輸入；Then 成功輸出小於或等於200000 bytes；And 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-053` **`CandidateIndexBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人持有有效 attemptId 且只有四個有效索引；When 本人請求索引0、5或他人 attemptId；Then 無效索引拒絕且合法1至4能讀；And R2 key 由 server 驗證的 accountId 形成，不能讓 client 指定。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-054` **`AvatarSelectionRace_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人有兩個有效候選且同時送同一 expectedRevision；When 兩個不同選用請求同時提交；Then 只有一個 CAS 成功且 revision 增加1；And 落敗的複製檔案被補償，最終唯一角色仍可讀。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-055` **`CardTerminationRace_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-055`（AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given B 在同輪授權讀取 A 的照片之同時互動被終止；When 後端準備開啟新的照片串流；Then 必須在開啟時核對有效同意與互動狀態；And 不得因以前有同意就取得新增照片或新內容。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [ ] `AP-IT-056` **`SecretExposureBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given Gemini server secret 與本人照片已配置於測試環境；When 執行成功與故障生成、產出客戶端 bundle；Then 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source；And 僅留下去識別的驗證證據。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

### [補強] 2026-11-01 實作前稽核追加 IT 測試（9項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [ ] `AP-IT-057` **`InsertPhoto_ParallelFifthSixthRequests_OnlyOneSucceeds`**
  - **稽核缺漏**：`RG-02`；**優先級**：高；**BDD**：`AP-BDD-047`；**來源**：RA-03、BDD-047/048
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真 Miniflare D1 已有4張ready，同帳號兩獨立請求競爭第5／第6張
  - **預期斷言**：兩個獨立客戶端同時入庫，pending／ready 計數確定≤5，失敗不能留可讀 R2。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-058` **`InsertPhoto_ConditionalReturningNoRow_MapsToPhotoLimit409`**
  - **稽核缺漏**：`RG-03`；**優先級**：高；**BDD**：`AP-BDD-047`；**來源**：RA-03、BDD-047
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真 Miniflare D1 已有5張pending+ready，執行單句prepared條件INSERT並讀RETURNING/changing count
  - **預期斷言**：用真 D1 讀 `RETURNING`／`changes` 結果；不能將0列看作成功，無 SQL Trigger。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-059` **`MediaCommands_IdentityFieldsAndIllegalTransitions_RejectMutation`**
  - **稽核缺漏**：`RG-04`；**優先級**：高；**BDD**：`AP-BDD-049`；**來源**：RA-03、BDD-049
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：逐一嘗試受控命令修改owner/kind/objectKey、deleted→ready、ready→pending與跨帳號寫入
  - **預期斷言**：列出所有 command 可用更新欄位，禁止改 owner/kind/objectKey、deleted復活、ready倒回pending；同時測命令繞行。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-060` **`OpenAuthorizedCardPhoto_TerminateDuringRead_DeniesNewStreams`**
  - **稽核缺漏**：`RG-05`；**優先級**：高；**BDD**：`AP-BDD-055`；**來源**：RA-04、BDD-055
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：名片有效雙方同意後在讀資料／開照片串流前終止互動或換輪，並驗client偽造授權context
  - **預期斷言**：名片授權 context 不能 client 偽造，互動終止和照片開串流之間重新驗證。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-061` **`GenerateAvatar_LiveGeminiFourUniqueImagesWithinRequestDeadline`**
  - **稽核缺漏**：`RG-07`；**優先級**：中；**BDD**：`AP-BDD-015`；**來源**：RA-01、AP-BDD-015/034/035/036
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：以授權照片2至5張與安全server secret真Gemini呼叫，注入逾時、重複圖與只產3張
  - **預期斷言**：真 API 依所選模型驗 2～5張來源、4張輸出與 server超時；量測成本／延遲並驗欠4張必失敗。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-062` **`CompressPersonalPhoto_FaceRegionAndPortraitOrientation_AcceptsHumanQualityReview`**
  - **稽核缺漏**：`RG-08`；**優先級**：中；**BDD**：`AP-BDD-052`；**來源**：RA-07、AP-BDD-002/052/063
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：以授權真人照通過分段stream壓縮到200000bytes、核對比例/EXIF、人工驗人臉相似度
  - **預期斷言**：200000 bytes來源照的臉部可辨識與比例；生成角色格式獨立，不對其套200KB來源照限制。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-063` **`SelectGeneratedAvatar_AfterR2CopyBeforeD1Commit_CompensatesOrphan`**
  - **稽核缺漏**：`RG-10`；**優先級**：中；**BDD**：`AP-BDD-040`；**來源**：RA-09、BDD-040/054
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真D1/R2完成候選複製但在選用revision CAS前注入失敗與並發
  - **預期斷言**：選中只有一張轉永久；兩個 CAS 同時選、R2已複製但 D1 失敗需補償並保留舊化身。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-064` **`AvatarCandidate_At60MinuteExpiry_RefusesReadAndSelection`**
  - **稽核缺漏**：`RG-11`；**優先級**：中；**BDD**：`AP-BDD-037`；**來源**：RA-09、AP-BDD-037/053
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：固定時鐘於候選59:59、60:00、60:01及跨帳號讀取與選用
  - **預期斷言**：候選59:59可用、60:00與之後必不可讀；R2 lifecycle延遲亦不可繞過 metadata 失效。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-IT-065` **`DeletedPersonalPhoto_WithCachedOrGuessedUrl_DeniesFreshRead`**
  - **稽核缺漏**：`RG-13`；**優先級**：中；**BDD**：`AP-BDD-004`；**來源**：RA-11、BDD-004/026
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：合法名片後本人刪照、換照或終止，他方持舊assetId、URL與快取嘗試新增讀取
  - **預期斷言**：刪照後即時名片新讀取不含舊 assetId；持舊URL不能再次新增讀取。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

## 3️⃣ API 端點測試（API Tests）

WebApplicationFactory 與可用的真平台橋接，驗證每條 §7 路由與 Cookie／Bearer／CSRF／ProblemDetails。

**API→SPEC→BDD 追溯對照**：本節各端點的三項 `Success`、`InvalidOrUnauthorized`、`WebNativeBoundary` 均依此表回鏈；其餘單元／整合測試依前節逐場景矩陣回鏈。

**稽核新增 API 追溯**：`AP-API-040`（RG-01）→ `POST /api/v1/me/photos`／`AP-BDD-002`；`AP-API-041`（RG-09）→ `PUT /api/v1/me/dating-profile`／`AP-BDD-007`。它們是原有三類 API 測試外的新增斷言。

| API endpoint | AP-AC | BDD 情境 |
|---|---|---|
| `GET /profile-catalog` | AP-AC-011 | AP-BDD-009、AP-BDD-051 |
| `GET /avatar-catalog` | AP-AC-004、AP-AC-017 | AP-BDD-005、AP-BDD-058 |
| `GET /me/dating-profile` | AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021 | AP-BDD-007、AP-BDD-008、AP-BDD-065 |
| `PUT /me/dating-profile` | AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021 | AP-BDD-007、AP-BDD-041、AP-BDD-045、AP-BDD-065 |
| `POST /me/photos` | AP-AC-001、AP-AC-009、AP-AC-019、AP-AC-020 | AP-BDD-001、AP-BDD-002、AP-BDD-028、AP-BDD-029、AP-BDD-030、AP-BDD-031、AP-BDD-047、AP-BDD-048、AP-BDD-059 |
| `GET /me/photos` | AP-AC-001、AP-AC-007 | AP-BDD-002、AP-BDD-003、AP-BDD-032 |
| `PUT /me/photos/order` | AP-AC-001 | AP-BDD-003、AP-BDD-046、AP-BDD-060 |
| `DELETE /me/photos/{assetId}` | AP-AC-001、AP-AC-023 | AP-BDD-004、AP-BDD-022、AP-BDD-060 |
| `GET /me/media/{assetId}` | AP-AC-007、AP-AC-008、AP-AC-016 | AP-BDD-012、AP-BDD-032、AP-BDD-043 |
| `POST /me/avatar/generations` | AP-AC-002、AP-AC-003、AP-AC-018、AP-AC-024 | AP-BDD-015、AP-BDD-021、AP-BDD-034、AP-BDD-035、AP-BDD-061、AP-BDD-062 |
| `GET /me/avatar/candidates/{attemptId}/{index}` | AP-AC-003、AP-AC-007 | AP-BDD-015、AP-BDD-036、AP-BDD-053、AP-BDD-063 |
| `PUT /me/avatar/selection` | AP-AC-003、AP-AC-004、AP-AC-006 | AP-BDD-006、AP-BDD-016、AP-BDD-017、AP-BDD-037、AP-BDD-054、AP-BDD-063 |
| `GET /me/card-preview` | AP-AC-015、AP-AC-020 | AP-BDD-014、AP-BDD-066 |


- [ ] `AP-API-001` **`GetProfileCatalog_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/profile-catalog；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。回應包含五類版本化標籤；不依賴登入Email。

- [ ] `AP-API-002` **`GetProfileCatalog_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/profile-catalog 送出請求；驗 400 INVALID_PROFILE（惡意 query） 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-003` **`GetProfileCatalog_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/profile-catalog；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-004` **`GetAvatarCatalog_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/avatar-catalog；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。16個正式不同的 male/female 插畫資產、ID有效。

- [ ] `AP-API-005` **`GetAvatarCatalog_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/avatar-catalog 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-006` **`GetAvatarCatalog_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/avatar-catalog；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-007` **`GetDatingProfile_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/dating-profile；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。owner、revision、profileReady、目前照片 metadata；隱藏密鑰。

- [ ] `AP-API-008` **`GetDatingProfile_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/dating-profile 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-009` **`GetDatingProfile_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/dating-profile；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-010` **`PutDatingProfile_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/dating-profile；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。合法生日、工作、固定 JSON 欄位與 CAS；敗者不覆蓋。

- [ ] `AP-API-011` **`PutDatingProfile_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/dating-profile 送出請求；驗 409 PROFILE_VERSION_CONFLICT／400 INVALID_PROFILE 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-012` **`PutDatingProfile_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/dating-profile；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-013` **`PostPersonalPhoto_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 POST /api/v1/me/photos；斷言 201 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。獨立串流、8 MiB、200000bytes、無 Trigger 的單條件 INSERT。

- [ ] `AP-API-014` **`PostPersonalPhoto_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 POST /api/v1/me/photos 送出請求；驗 413 IMAGE_TOO_LARGE／409 PHOTO_LIMIT_REACHED／400 INVALID_IMAGE 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-015` **`PostPersonalPhoto_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 POST /api/v1/me/photos；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-016` **`GetPersonalPhotos_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/photos；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人照片與排序，跨 owner 不洩漏。

- [ ] `AP-API-017` **`GetPersonalPhotos_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/photos 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-018` **`GetPersonalPhotos_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/photos；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-019` **`PutPhotoOrder_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/photos/order；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。完整有效 ID 集合和 revision；同 D1 batch。

- [ ] `AP-API-020` **`PutPhotoOrder_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/photos/order 送出請求；驗 400 INVALID_PROFILE／409 PROFILE_VERSION_CONFLICT 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-021` **`PutPhotoOrder_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/photos/order；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-022` **`DeletePersonalPhoto_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 DELETE /api/v1/me/photos/{assetId}；斷言 204 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人且狀態條件刪除；已刪對方不可新讀。

- [ ] `AP-API-023` **`DeletePersonalPhoto_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 DELETE /api/v1/me/photos/{assetId} 送出請求；驗 404 PHOTO_NOT_FOUND 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-024` **`DeletePersonalPhoto_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 DELETE /api/v1/me/photos/{assetId}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-025` **`GetPrivateMedia_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/media/{assetId}；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人可讀、no-store/nosniff、不回 objectKey。

- [ ] `AP-API-026` **`GetPrivateMedia_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/media/{assetId} 送出請求；驗 404 PHOTO_NOT_FOUND／401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-027` **`GetPrivateMedia_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/media/{assetId}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-028` **`PostAvatarGeneration_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 POST /api/v1/me/avatar/generations；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。兩至五張現有照片、真 AI 四圖、單次請求、不建立 job。

- [ ] `AP-API-029` **`PostAvatarGeneration_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 POST /api/v1/me/avatar/generations 送出請求；驗 503 IMAGE_PROVIDER_UNAVAILABLE／429 RATE_LIMITED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-030` **`PostAvatarGeneration_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 POST /api/v1/me/avatar/generations；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-031` **`GetAvatarCandidate_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/avatar/candidates/{attemptId}/{index}；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。R2短效與 owner/key 推導，索引1至4。

- [ ] `AP-API-032` **`GetAvatarCandidate_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/avatar/candidates/{attemptId}/{index} 送出請求；驗 410 AVATAR_CANDIDATE_EXPIRED／404 AVATAR_CANDIDATE_NOT_FOUND 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-033` **`GetAvatarCandidate_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/avatar/candidates/{attemptId}/{index}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-034` **`PutAvatarSelection_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/avatar/selection；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。免費與 generated 擇一、舊化身不被不完整請求覆寫。

- [ ] `AP-API-035` **`PutAvatarSelection_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/avatar/selection 送出請求；驗 400 INVALID_AVATAR_SELECTION／409 PROFILE_VERSION_CONFLICT 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-036` **`PutAvatarSelection_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/avatar/selection；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [ ] `AP-API-037` **`GetCardPreview_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/card-preview；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。本人當前名片投影；不表示同意對方讀。

- [ ] `AP-API-038` **`GetCardPreview_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/card-preview 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [ ] `AP-API-039` **`GetCardPreview_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/card-preview；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

### [補強] 2026-11-01 實作前稽核追加 API 測試（2項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [ ] `AP-API-040` **`UploadMediaStream_WebNativeMultipartAndBinary_EnforcesOriginAnd8MiBLimits`**
  - **稽核缺漏**：`RG-01`；**優先級**：高；**BDD**：`AP-BDD-002`；**來源**：RA-02、§7 POST /me/photos
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **前置／操作**：Web Cookie+Origin／Android或iOS Bearer，真二進位圖片串流、>8MiB與偽造Origin的受控上傳
  - **預期斷言**：Web原 Cookie + Origin 必經正確 CSRF；native Bearer；8192原測試儲存路徑不能當生產照片路徑。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-API-041` **`PutDatingProfile_TopicTagIdsAndLegacyCodes_RoundTripsExactSchema`**
  - **稽核缺漏**：`RG-09`；**優先級**：中；**BDD**：`AP-BDD-007`；**來源**：RA-08、AP-BDD-007/041/051
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **前置／操作**：PUT再GET含interestTagIds/topicTagIds/valueTagIds與preferences九鍵，並輸入未知/重複鍵、停用歷史代碼
  - **預期斷言**：九鍵偏好 JSON、三欄 interests JSON、topicTagIds、未知鍵拒絕、舊目錄代碼可回讀。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

## 4️⃣ E2E／UX 測試（Web、Android、iOS）

每個 @frontend 場景分別在 Web、Android、iOS 保留獨立驗收；iOS 未執行不得由 Web／Android 冒充。

- [ ] `AP-E2E-001` **`PhotoScreenEmptyState_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-002` **`PhotoScreenEmptyState_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-003` **`PhotoScreenEmptyState_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-004` **`FreeAvatarPickerUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-005` **`FreeAvatarPickerUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-006` **`FreeAvatarPickerUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-007` **`PersonalPhotoUploadUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-008` **`PersonalPhotoUploadUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-009` **`PersonalPhotoUploadUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-010` **`PhotoOrderDeleteUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-011` **`PhotoOrderDeleteUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-012` **`PhotoOrderDeleteUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-013` **`AiLockEntryUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人已存兩張以上真人照且已閱讀資料用途；操作 點擊帶鎖頭的 AI 按鈕；應驗證 可進入真 AI 生成並看到風格選擇，且 沒有付款畫面、扣點或權益 API。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-014` **`AiLockEntryUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人已存兩張以上真人照且已閱讀資料用途；操作 點擊帶鎖頭的 AI 按鈕；應驗證 可進入真 AI 生成並看到風格選擇，且 沒有付款畫面、扣點或權益 API。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-015` **`AiLockEntryUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人已存兩張以上真人照且已閱讀資料用途；操作 點擊帶鎖頭的 AI 按鈕；應驗證 可進入真 AI 生成並看到風格選擇，且 沒有付款畫面、扣點或權益 API。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-016` **`AiGenerateLoadingUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人已開始一次四圖生成；操作 使用者連續點擊產圖按鈕；應驗證 畫面顯示處理中並禁用重複提交，且 失敗復原後可重新發起但提示不保證恢復先前進度。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-017` **`AiGenerateLoadingUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人已開始一次四圖生成；操作 使用者連續點擊產圖按鈕；應驗證 畫面顯示處理中並禁用重複提交，且 失敗復原後可重新發起但提示不保證恢復先前進度。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-018` **`AiGenerateLoadingUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人已開始一次四圖生成；操作 使用者連續點擊產圖按鈕；應驗證 畫面顯示處理中並禁用重複提交，且 失敗復原後可重新發起但提示不保證恢復先前進度。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-019` **`AiFourChoicesUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人收到尚未過期的四張插畫；操作 本人點選第二張並確認選用；應驗證 清楚標示選取結果並在成功後換成遊戲化身，且 其他三張不留作永久選用圖片。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-020` **`AiFourChoicesUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人收到尚未過期的四張插畫；操作 本人點選第二張並確認選用；應驗證 清楚標示選取結果並在成功後換成遊戲化身，且 其他三張不留作永久選用圖片。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-021` **`AiFourChoicesUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人收到尚未過期的四張插畫；操作 本人點選第二張並確認選用；應驗證 清楚標示選取結果並在成功後換成遊戲化身，且 其他三張不留作永久選用圖片。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-022` **`AiFailureRecoveryUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 生成 provider 失敗或先前候選到期；操作 畫面接到503或410回應；應驗證 呈現具體的失敗及重新生成說明，且 不顯示假成功、不修改目前已選的角色。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-023` **`AiFailureRecoveryUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 生成 provider 失敗或先前候選到期；操作 畫面接到503或410回應；應驗證 呈現具體的失敗及重新生成說明，且 不顯示假成功、不修改目前已選的角色。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-024` **`AiFailureRecoveryUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 生成 provider 失敗或先前候選到期；操作 畫面接到503或410回應；應驗證 呈現具體的失敗及重新生成說明，且 不顯示假成功、不修改目前已選的角色。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-025` **`DatingProfileFormUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-026` **`DatingProfileFormUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-027` **`DatingProfileFormUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-028` **`MyCardPreviewUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-029` **`MyCardPreviewUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-030` **`MyCardPreviewUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-031` **`ConsentGateUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-032` **`ConsentGateUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-033` **`ConsentGateUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-034` **`ProfileAccessibilityUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 使用鍵盤、螢幕閱讀器、字體放大並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-035` **`ProfileAccessibilityUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：原生圖片選取／返回及 TalkBack：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 使用鍵盤、螢幕閱讀器、字體放大並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [ ] `AP-E2E-036` **`ProfileAccessibilityUi_Ios_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：iOS 圖片權限／VoiceOver：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 使用鍵盤、螢幕閱讀器、字體放大並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

---

### [補強] 2026-11-01 實作前稽核追加 E2E 測試（2項）

**來源**：[RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md) 的 `RG-01`～`RG-14`；使用者已確認 RQ-01=A／RQ-02=A。測試尚未執行。

- [ ] `AP-E2E-037` **`GenerateAvatar_BeforeThirdPartyDisclosure_DoesNotTransmitSourcePhoto`**
  - **稽核缺漏**：`RG-06`；**優先級**：高；**BDD**：`AP-BDD-061`；**來源**：RA-05、BDD-001/061
  - **測試位置**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **前置／操作**：Web／Android／iOS進入鎖頭頁但未按開始就離開、照片不足，及明確按「開始產生4張」
  - **預期斷言**：使用者未主動觸發 AI 時，Gemini 無外送請求；UI 顯示傳送用途及明確操作。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [ ] `AP-E2E-038` **`BuiltinAvatarCatalog_SixteenDistinctLicensedImages_ValidatesActualAssets`**
  - **稽核缺漏**：`RG-12`；**優先級**：中；**BDD**：`AP-BDD-005`；**來源**：RA-10、BDD-005/058
  - **測試位置**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **前置／操作**：逐一驗16張獨立正式角色素材授權與視覺差異，於Web/Android/iOS測3:4容器
  - **預期斷言**：逐16個ID辨識、來源授權、實際資產不同，三平台載入與容器裁切。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

## 🧪 關鍵測試資料與交付限制

| 類別 | 必須提供的真實驗證 |
|---|---|
| D1 原子並發 | 同帳號4張 ready、兩個第5／第6張並發、4 ready+1 pending 並發、單語句回傳0列、owner 不可改、deleted 不可復活、無 CREATE TRIGGER，且查最終有效資產恰5 |
| D1 與 JSON | 兩張表首欄 UUIDv7、外鍵／CHECK／UNIQUE、15＋9欄、固定 JSON 深度與白名單、CAS stale、照片排序完整集合、真 D1 batch 衝突與 rollback |
| 私人圖片 | 8MiB 上傳、≤200000 bytes、錯誤 MIME／惡意解碼／EXIF GPS、分段 stream、R2 pending/ready/deleted、GC、跨帳號拒絕與 response nosniff/no-store |
| 生成及選用 | 2～5張已存來源、同次請求4張互異、短效 attempt 60分、1張正式化、剩餘3張不建表、重複／過期／競態／中斷／失敗後原化身不變 |
| 真人品質 | 需使用者授權提供的照片與 Gemini 真 API，人工逐張比較五官、臉型及髮型；記錄模型／結果數／時間與匿名品質評語，不留原始影像或明碼 secret |
| 名片跨 SPEC | 本份只測讀取投影及拒絕授權的隔離契約；實際25分、邀請、雙方同意、終止狀態的完整 E2E 留待 AffectionAndFeedback／StoryDialogueAndExit 完成才驗 |
| 前端 | 16款真不同插畫、照片用途提示完整文字、AI 鎖頭即用不扣款、圖片四選一、錯誤提示、Loading、無障礙、Web／Android／iOS 分平台 |

## 📝 測試清單使用說明

1. 先 Red：寫出符合每一個 TDD ID 的失敗測試，保留有效失敗證據；以 Domain／Application → D1／R2 → HTTP → 前端順序 Green，再重構及回歸。
2. 完整功能結果才可勾選 BDD 對應場景；有單一單元測試通過不等於 UX／平台驗收通過。
3. `API` 列表的每一項成功／拒絕／平台傳輸測試均須與對應 `AP-AC`、`AP-BDD` 回鏈；API 對應以 SPEC §7 明列路由為準，不憑空實作跨使用者名片端點。
4. 使用者已於2026-11-01確認 RQ-01=A、RQ-02=A，12項風險均有處理決議、14項缺漏已補回。**Ready for well-done 只代表規劃交接，0/257項測試已通過；不能跳過真D1、真Gemini、素材與分平台驗收。**

## 🔗 相關文件

- [MVP](../requirements/MVP-001-LoveGameDatingApp.md)
- [SPEC](../specs/SPEC-001-AvatarAndPreferences.md)
- [BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md)
- [RiskAudit](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md)

**文件狀態**：RiskAudit已確認、14項稽核測試已補回；**Ready for well-done**，0/257測試通過。

---

## 📝 2026-11-01 實作前風險與缺漏稽核紀錄

**結論**：5高／6中／1低共12項風險，RQ-01=A、RQ-02=A 均已由使用者確認並回寫；原243項TDD保留，追加14項（Unit+1、Integration+9、API+2、E2E+2），總計**257項，0已實測**。68個BDD Scenario與24條AP-AC均有追溯，未重編原有ID。

## 規劃交接紀錄

**交接狀態**: **Ready for well-done**

**最後確認日期**: 2026-11-01
**範圍及順序**: 僅 `SPEC-001-AvatarAndPreferences`（MVP-001第2順位）；既有 `SPEC-001-PlatformFoundation` 實作與證據不受修改。

### 文件包

| 類型 | 路徑 | 狀態 |
|---|---|---|
| MVP | `datinghigh/docs/requirements/MVP-001-LoveGameDatingApp.md` | 已確認 D-036～D-049，20故事／68 AC |
| SPEC | `datinghigh/docs/specs/SPEC-001-AvatarAndPreferences.md` | SDD已確認；24條AP-AC；2表24欄 |
| BDD | `datinghigh/docs/bdd/SPEC-001-AvatarAndPreferences-BDD.md` | 68場景、12個@frontend，0通過 |
| TDD | `datinghigh/docs/tdd/SPEC-001-AvatarAndPreferences-TDD.md` | 257項待測，原243＋14 |
| RiskAudit | `datinghigh/docs/specs/SPEC-001-AvatarAndPreferences-RiskAudit.md` | 12項風險均已決議，RQ-01=A、RQ-02=A |

### 已確認風險

| 風險 ID | 風險 | 使用者確認／文件回寫與開發注意事項 |
|---|---|---|
| `RA-01` | 真人 AI 四圖同步生成能否在平台時限內完成 | **使用者接受**：D-046 單次請求無 Job 的取捨不變；已補 AP-IT-061（RG-07）。真 Gemini 4圖／時限與成本須在 well-done 實測，未達4張不可放行 |
| `RA-02` | 8MiB 上傳與現有 8KiB 私人 R2/16KiB JSON 限制不相容 | **已補回文件**：新增 AP-API-040（RG-01）驗證受控媒體串流、Web/原生授權與 8 MiB 限制；不擴充原 Foundation 8 KiB 入口 |
| `RA-03` | 取消 Trigger 後，D1 照片名額與媒體不變式的競態 | **已補回文件**：新增 AP-IT-057～059（RG-02～04），驗真 D1 同時上傳、RETURNING 0列與受控 UPDATE，不使用 SQL Trigger |
| `RA-04` | 名片授權過期、終止競態和跨輪讀取 | **已補回文件**：AP-IT-060（RG-05），每次名片照片開啟前重驗同輪有效雙方同意／終止；完整跨 SPEC E2E 後續整合驗 |
| `RA-05` | 真人照傳送 Gemini 的用途告知與按開始授權（已確認方案 A） | **已補回文件**：使用者明確選 **RQ-01=A／D-048**；產圖頁內嵌用途提醒，按開始才送照；AP-E2E-037（RG-06）覆蓋，沒有額外跳窗 |
| `RA-06` | 免費與 AI 化身角色構圖一致性（已確認3:4半身方案 A） | **已補回文件**：使用者明確選 **RQ-02=A／D-049**；3:4半身至腰部、五官清楚、背景簡潔；AP-IT-062、AP-E2E-038（RG-08、RG-12） |
| `RA-07` | 200KB來源照未必足夠保留 AI 人臉相似度 | **使用者接受**：200,000 bytes 來源照限制維持；AP-IT-062（RG-08）要求真人品質驗證，未達人臉可辨識不得假稱合格 |
| `RA-08` | 固定 JSON 投影與範例欄位尚缺對齊測試 | **已補回文件**：SDD §7 PUT 範例補 topicTagIds，AP-API-041（RG-09）驗固定 JSON 與歷史代碼 |
| `RA-09` | 四張暫存候選失敗補償與單次永久化競態 | **使用者接受**：D-046 無 Job 且重試可能再耗成本；AP-IT-063、064（RG-10、11）必驗補償、60分鐘到期、CAS |
| `RA-10` | 免費16款立繪正式素材及品質驗收 | **已補回文件**：AP-E2E-038（RG-12）驗16張不同正式立繪資產及來源授權，不用假圖，統一3:4構圖 |
| `RA-11` | 名片照片替換與身分狀態快取可能揭露舊內容 | **已補回文件**：AP-IT-065（RG-13）驗照片刪除、舊 URL、授權終止及 no-store 後不得新增揭露 |
| `RA-12` | 年齡計算、Unicode與標籤目錄跨版本邊界 | **已補回文件**：AP-UT-113（RG-14）驗2/29、18歲與臺灣午夜固定時鐘 |

**風險分界**：接受 `RA-01`（無Job同步四圖）、`RA-07`（200KB壓縮）及 `RA-09`（中斷補償／重新呼叫成本）代表接受既有設計取捨，**不是**表示Gemini四圖、臉部品質或R2補償已通過真實測試；未達驗收標準需停止並提交證據，不得自行降低Gate或增加Job表。

### 已補回缺漏

| 缺漏 ID | 稽核來源 | TDD 補入項目 | 狀態 |
|---|---|---|---|
| `RG-01` | RA-02、§7 POST /me/photos | `AP-API-040` | 已補入，尚未執行 |
| `RG-02` | RA-03、BDD-047/048 | `AP-IT-057` | 已補入，尚未執行 |
| `RG-03` | RA-03、BDD-047 | `AP-IT-058` | 已補入，尚未執行 |
| `RG-04` | RA-03、BDD-049 | `AP-IT-059` | 已補入，尚未執行 |
| `RG-05` | RA-04、BDD-055 | `AP-IT-060` | 已補入，尚未執行 |
| `RG-06` | RA-05、BDD-001/061 | `AP-E2E-037` | 已補入，尚未執行 |
| `RG-07` | RA-01、AP-BDD-015/034/035/036 | `AP-IT-061` | 已補入，尚未執行 |
| `RG-08` | RA-07、AP-BDD-002/052/063 | `AP-IT-062` | 已補入，尚未執行 |
| `RG-09` | RA-08、AP-BDD-007/041/051 | `AP-API-041` | 已補入，尚未執行 |
| `RG-10` | RA-09、BDD-040/054 | `AP-IT-063` | 已補入，尚未執行 |
| `RG-11` | RA-09、AP-BDD-037/053 | `AP-IT-064` | 已補入，尚未執行 |
| `RG-12` | RA-10、BDD-005/058 | `AP-E2E-038` | 已補入，尚未執行 |
| `RG-13` | RA-11、BDD-004/026 | `AP-IT-065` | 已補入，尚未執行 |
| `RG-14` | RA-12、BDD-050 | `AP-UT-113` | 已補入，尚未執行 |

### 實作注意事項

1. **D-048／RQ-01=A**：產圖頁每次醒目顯示「產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家」。**本人按「開始產生4張」才可傳送既有照片**；進頁不自動送照、無二次跳窗、無新同意表。
2. **D-049／RQ-02=A**：免費16款與AI四候選均為**直式3:4半身至腰部立繪，清晰五官、簡潔背景**；容器不裁臉或拉伸，須以授權人像人工確認相似度與構圖。
3. **D-045～D-047 Schema**：新表僅 `user_profiles` 15欄及 `user_media_assets` 9欄，**0個SQL Trigger**，不建AI Job／名片快照／免費角色表，不存圖片byte_size／sha256；既有auth/common六表54欄不變。
4. **D1/R2安全**：照片輸入≤8MiB，使用可重用壓縮服務輸出≤200000 bytes存私人R2；第5／第6張並發由單句prepared條件式INSERT（含pending額度）及0列檢查守住；受控UPDATE不可改owner/kind/objectKey、deleted不可復活。真Miniflare D1／R2測試是必要Gate。
5. **傳輸界限**：業務媒體使用獨立受控串流通道，保持Web Origin/Cookie與原生Bearer／Session驗證；不得放寬原平台16KiB JSON限制，或套用Foundation僅8192 bytes的測試物件API。
6. **Gemini真生成**：金鑰只以安全的server secret配置，不得進Git／前端／log；使用已保存本人2～5張真人照，同一次前端請求成功**必為4張互異真圖**且只正式保存選中的1張。缺圖／超時不得假成功，也不擅改同步無Job方案。
7. **跨SPEC名片界線**：本份僅提供目前本人資料／照片的授權內部讀取契約；25分入口、雙方同意、名片新讀取權限與終止整合由MatchingSessions、StoryDialogueAndExit及AffectionAndFeedback後續負責；不得擅增公開他人名片路由／快照表。
8. **證據與平台**：真D1並發、R2補償、真Gemini四圖、16張真正不同且有合法來源的插畫資產、Web/Android/iOS各平台證據都須如實驗收。沿用既有 iOS／雲端暫緩決策但不得標Passed；歷史Foundation證據不等於本份驗證。
9. **硬性停損**：Gemini無法在時限內產4張、200KB壓縮難以辨識臉部、D1/R2補償或授權競態未通過時，必須提出實際證據並停止相應Gate，不改規格、不降低標準。

### 不得進入開發的阻斷項

**無（規劃確認階段）**。外部模型、真實圖片、D1/R2及分平台測試屬於開發驗收硬性條件，仍未實測，不能宣稱已通過。

**交接停止點**：本輪 `perfect-plan` Phase 5 完成，後續應由 `well-done datinghigh/docs/tdd/SPEC-001-AvatarAndPreferences-TDD.md` 接續實作；**本次不修改產品程式碼、不建Migration、不呼叫Gemini、不處理其他SPEC**。

