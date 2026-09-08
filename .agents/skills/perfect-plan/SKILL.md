---
name: perfect-plan
description: 規劃階段工作流協調技能，整合 .agents/skills 中的 mvp-requirement-generation、sdd-specification、bdd-feature-generation、pre-implementation-risk-gap-audit，將高階需求或 MVP 草稿推進到已確認的 MVP、SPEC、BDD、TDD 與實作前風險缺漏稽核結果。當使用者要求「perfect-plan」、「完整規劃」、「需求到開發前規劃」、「先產生 MVP/SPEC/BDD/TDD」、「實作前風險稽核」或要在開發前完成可追溯文件鏈時使用。
---

# Perfect Plan

此技能負責「規劃到可開發」階段。使用此技能時，只產出與確認需求、規格、BDD/TDD 與實作前風險缺漏，不進行程式碼實作。開發實作交由 `well-done`。

## 核心規則

1. 先閱讀工作目錄中的 `AGENTS.md` 或同等 agent 指示文件；若存在分析、設計、開發方法文件，也一併閱讀。
2. 讀取使用者指定的 MVP、SPEC、BDD、TDD 文件；若未指定來源，先檢查 `docs/requirements/` 並請使用者確認本次功能範圍。
3. 每個階段開始前，讀取對應 `.agents/skills/{skill-name}/SKILL.md` 並遵守其流程；若子技能與本技能的人工確認節點衝突，以本技能為準，再以使用者最新明確要求為最高優先。
4. 涉及其他工作區、應用程式、服務、資料庫或外部模組時，先閱讀該目標範圍的 agent 指示、README、相關文件與實際程式碼，不得只依記憶或文件推測既有行為。
5. 文件語言、命名、路徑與格式遵循目前工作區既有慣例；若無明確慣例，使用使用者本次需求的語言。
6. 技術名詞、路徑、API、類別與方法名稱保留原文並使用 monospace。
7. 不要跳過需求追溯：每個 MVP 需求都要能追到 SPEC、BDD Scenario 與 TDD 測試。
8. 此技能不得進入程式碼實作；完成後必須將 `well-done` 可接手的交接資訊寫入文件，不得只存在對話輸出。
9. 每次執行以「一份 SPEC 從 SDD 到 BDD/TDD、風險稽核、交接」為邊界；完成交接後必須停止並通知使用者進入 `well-done`。不得自主選擇下一份 SPEC 繼續規劃。

## 文件編碼與關聯規則

- `SPEC-XXX-FeatureName` 的 `XXX` 必須繼承來源 `MVP-XXX-MvpName` 的編號。同一 MVP 拆出的所有 SPEC 共用此編號，以不同 `FeatureName` 區分；實作順序另列，不遞增 SPEC 編號，也不依 `docs/specs/` 的最大編號或空號配號。
- 例如 `MVP-005-ProjectCollaboration.md` 拆為 `SPEC-005-DocumentEditing.md` 與 `SPEC-005-StageDelivery.md`，第二份仍為 `005`。MVP 與各 SPEC 的功能名稱不必相同。
- BDD、TDD 與獨立風險報告沿用來源 SPEC 的完整檔名主幹，分別加上 `-BDD.md`、`-TDD.md`、`-RiskAudit.md`。依賴、交接與歸檔偵測均以完整名稱及來源 MVP 路徑關聯，不能只用共用的 `SPEC-XXX` 判定為同一文件包。
- 既有歷史文件依其明確來源連結讀取，不因套用此規則自動改名或覆寫；本次新建或尚未落地的切分建議須符合來源 MVP 編號。

## 人工確認點

必須暫停等待使用者明確確認的階段：

| 階段 | 觸發點 | 暫停前產出 |
|------|--------|------------|
| MVP 需求規劃確認 | 執行 `mvp-requirement-generation` 後 | 完整 MVP 文件與 SPEC 切分建議 |
| SDD 細部規劃確認 | 每份 SPEC 執行 `sdd-specification` 後 | SPEC 文件、API/資料/UI 設計、測試策略 |
| 實作前風險確認 | 執行 `pre-implementation-risk-gap-audit` 後 | 風險報告、缺漏測試、以實際功能影響描述且需使用者回答的問題 |
| 規劃交接停止點 | Phase 5 寫入交接紀錄後 | `Ready for well-done` 或 `Blocked` 狀態；停止並提示下一步使用 `well-done` |

不需人工確認、應由 AI 自主完成的階段：

- `bdd-feature-generation`
- 將已確認的實作前風險缺漏補回 TDD 文件
- 將規劃交接紀錄寫入文件

## Phase 0：需求來源建立

1. 若使用者提供高階需求但尚未有 MVP 文件，檢查 `docs/requirements/` 既有最大流水號，建立 `docs/requirements/MVP-XXX-FeatureName.md` 草稿。此配號只適用於新建 MVP；其下 SPEC 一律繼承該 MVP 編號。
2. 若使用者指定既有 MVP 文件，直接以該檔為來源。
3. 若使用者未指定需求來源且無法從上下文判斷，先檢查 `docs/requirements/`，請使用者確認本次功能範圍。

### 已完成 SPEC 歸檔偵測

當使用者指定既有 MVP 文件，或 MVP 文件已建立完成後，進入 Phase 1/Phase 2 前必須先判斷是否已有已完成並歸檔的 SPEC：

1. 以 MVP 文件所在的 `docs/requirements/` 推導同層文件根目錄 `docs/`，並檢查相對應的 `docs/alldonejobs/`。
2. 讀取 MVP 文件中的「建議 SPEC 切分」與建議順序，列出本 MVP 預期處理的 SPEC 名稱。
3. 對每一個 SPEC，依完整名稱（含 `FeatureName`）依序檢查下列位置是否已有同名文件包；同編號的另一份 SPEC 已歸檔，不表示本份已完成：
   - 進行中位置：`docs/specs/SPEC-XXX-FeatureName.md`、`docs/bdd/SPEC-XXX-FeatureName-BDD.md`、`docs/tdd/SPEC-XXX-FeatureName-TDD.md`
   - 已完成歸檔位置：`docs/alldonejobs/SPEC-XXX-FeatureName.md`、`docs/alldonejobs/SPEC-XXX-FeatureName-BDD.md`、`docs/alldonejobs/SPEC-XXX-FeatureName-TDD.md`
4. 若 SPEC 文件包位於 `docs/alldonejobs/`，且使用者已明確告知該 SPEC 已完成交付驗收，或文件內容可判斷為已完成、已驗收、`Ready for well-done`、實作落地或全數測試完成，則將該 SPEC 視為已完成，保留為依賴參考，不得重新產出或覆寫。
5. 若 SPEC 文件包位於 `docs/alldonejobs/` 但完成狀態不明，先讀取文件確認；仍無法判斷時，停止並請使用者確認是否應跳過。
6. Phase 2 開始時，若使用者未明確指定 SPEC，選取建議順序中第一個尚未完成、尚未歸檔的 SPEC 作為本輪唯一規劃目標；已完成歸檔的 SPEC 僅作為依賴與追溯來源。
7. 若所有建議 SPEC 都已在 `docs/alldonejobs/` 中完成歸檔，停止並回報本 MVP 已無待規劃 SPEC，不得建立重複文件。

## Phase 1：MVP 需求規劃

1. 讀取 `.agents/skills/mvp-requirement-generation/SKILL.md`。
2. 對 MVP 草稿就地執行正式化、補足需求規劃、驗收條件、影響範圍與「建議 SPEC 切分」。
3. 停止並要求使用者確認：
   - 原始需求是否完整保留。
   - 驗收條件是否符合業務意圖。
   - 建議 SPEC 切分與實作順序是否接受。
4. 未取得確認前，不得進入 SDD。

## Phase 2：依 SPEC 切分執行 SDD

1. 依 MVP「建議 SPEC 切分」的建議順序選取本輪要處理的一份 SPEC；若使用者未明確指定，選取第一個尚未完成、尚未歸檔的 SPEC。
2. 每份 SPEC 開始前，讀取 `.agents/skills/sdd-specification/SKILL.md`。
3. 產出或更新 `docs/specs/SPEC-XXX-FeatureName.md`。
4. 每份 SPEC 產出後都停止等待使用者確認細部規劃。
5. 若使用者要求調整 SPEC，先修正並再次確認，再進入下一階段。

每輪只處理一份 SPEC。該 SPEC 完成 Phase 5 交接後必須停止並提示使用者改由 `well-done` 接手，不得自動進入下一份 SPEC 規劃。除非使用者明確要求先產出多份 SDD 文件，仍需嚴格依據要求的文件範圍進行SDD 人工確認、完成任一 SPEC 的 BDD/TDD、風險稽核與交接，完成後仍必須停止。

## Phase 3：BDD/TDD 文件生成

1. 讀取 `.agents/skills/bdd-feature-generation/SKILL.md`。
2. 將已確認的 SPEC 轉成：
   - `docs/bdd/SPEC-XXX-FeatureName-BDD.md`
   - `docs/tdd/SPEC-XXX-FeatureName-TDD.md`
3. BDD 的 Gherkin 關鍵字與步驟語言遵循工作區或 `bdd-feature-generation` 的規則。
4. 不在此階段等待人工確認；生成後直接進入實作前稽核。

## Phase 4：實作前風險與缺漏稽核

1. 讀取 `.agents/skills/pre-implementation-risk-gap-audit/SKILL.md`。
2. 逐項比對 MVP、SPEC、BDD、TDD，建立需求追溯矩陣。
3. 產出風險報告與缺漏清單。
4. 確認風險報告中的待使用者回答問題符合 `pre-implementation-risk-gap-audit` 的「實際功能影響」導向問題格式；不符合時先重寫，再停止等待使用者確認與回答。
5. 使用者確認後，將每一項風險標記為下列狀態之一：
   - `已補回文件`：已回寫到 MVP、SPEC、BDD 或 TDD。
   - `使用者接受`：使用者明確接受此風險，並記錄原因與開發注意事項。
   - `待確認`：尚未取得決策；此狀態不得進入可開發交接。
6. 將缺漏補回對應文件；缺漏不得只存在稽核報告或對話中：
   - 規格缺漏補回 MVP 或 SPEC。
   - 行為缺漏補回 BDD。
   - 測試缺漏補回 TDD。
7. 若使用者回覆造成 MVP、SPEC 或 BDD 需要調整，先回到對應階段更新並重新確認。

## Phase 5：規劃交接紀錄持久化

完成規劃時，必須把 `well-done` 可接手的交接資訊寫入文件。對話摘要只能作為提示，不可作為唯一交接來源。

### 寫入位置

優先寫入對應的 `docs/tdd/SPEC-XXX-FeatureName-TDD.md` 末尾。若一次交付多份 SPEC，則每份 TDD 文件都要有自己的「規劃交接紀錄」。若工作區已有固定交接文件慣例，遵循既有慣例，但仍需在 TDD 文件中留下可追溯連結。

### 必要內容

在 TDD 文件末尾新增或更新以下區塊：

```markdown
## 規劃交接紀錄

**交接狀態**: Ready for well-done
**最後確認日期**: YYYY-MM-DD

### 文件包
| 類型 | 路徑 | 狀態 |
|------|------|------|
| MVP | `docs/requirements/MVP-XXX-MvpName.md` | 已確認 |
| SPEC | `docs/specs/SPEC-XXX-FeatureName.md` | 已確認 |
| BDD | `docs/bdd/SPEC-XXX-FeatureName-BDD.md` | 已生成並追溯 |
| TDD | `docs/tdd/SPEC-XXX-FeatureName-TDD.md` | 已補強 |

### 已確認風險
| 風險 ID | 風險摘要 | 使用者決策 | 文件回寫位置 | 開發注意事項 |
|---------|----------|------------|--------------|--------------|

### 已補回缺漏
| 缺漏 ID | 缺漏來源 | 補入文件位置 | 補入項目 | 狀態 |
|---------|----------|--------------|----------|------|

### 實作注意事項
- [由風險稽核與使用者確認整理出的開發注意事項]

### 不得進入開發的阻斷項
- 無
```

### 可交接條件

只有同時符合下列條件，才能將 `交接狀態` 標記為 `Ready for well-done`：

- MVP 文件路徑。
- 已確認的 SPEC 文件路徑與建議實作順序。
- BDD 文件路徑。
- TDD 文件路徑。
- 所有風險皆已確認，且每項都有使用者決策、文件回寫位置或接受原因。
- 所有缺漏皆已補回 MVP、SPEC、BDD 或 TDD 中的正確位置。
- TDD 文件包含實作注意事項與補強測試清單。
- 「不得進入開發的阻斷項」為 `無`。

若任一條件不符合，將 `交接狀態` 標記為 `Blocked`，列出阻斷項，停止並要求使用者確認或補充資訊。

### 最終回覆

最終只輸出交接紀錄所在文件與摘要，不重新承載完整交接內容：

- 已寫入交接紀錄的 TDD 文件路徑。
- `Ready for well-done` 或 `Blocked` 狀態。
- 已補回的風險與缺漏數量。
- 若為 `Blocked`，列出阻斷項與需要使用者回答的問題。
- 若為 `Ready for well-done`，明確提示下一步應由 `well-done` 接手；不得主動宣布或開始下一份 SPEC 規劃。

## 驗證要求

1. 只修改 Markdown 文件時，至少執行 `git diff --check`。
2. 若規劃過程需要讀取或檢查程式碼，不因此修改程式碼。
3. 驗證無法執行時，在最終回覆明確說明原因。
4. 每階段交付前核對：新 SPEC 編號等於來源 MVP 編號；同一 MVP 的完整 SPEC 名稱互不重複；BDD／TDD／風險報告、依賴與交接連結保留正確的完整 SPEC 名稱，不混用同編號的其他文件包。
