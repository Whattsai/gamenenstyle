---
name: bdd-frontend-ux-implementation
description: 從 BDD Feature 文件提取前端 UX 場景，作為 checklist 逐項引導 AI 實作前端畫面功能，並即時追蹤進度與稽核
license: MIT
---

# BDD 前端 UX 實作引導技能

此技能協助 AI 直接以 BDD 文件（`.md`）中的 Scenario checklist 作為前端 UX 實作的引導，
逐項確保每個 BDD 場景描述的畫面行為確實被實作，並即時更新進度追蹤與稽核機制。

## 核心理念

**BDD `.md` 文件 = 前端 UX 實作的需求源頭 + 進度追蹤載體**

- BDD 文件使用 Markdown 格式，原生支援 `- [ ]` checklist、進度條、表格
- 每個 Scenario 已是 `- [ ]` 格式，本 SKILL 直接讀取並更新完成狀態
- 進度條、完成百分比、SPEC 交叉比對結果直接更新在 BDD 文件中
- 同時交叉比對 SPEC 來源文件（`docs/specs/SPEC-XXX.md`），補足 BDD 可能遺漏的前端細項

## 何時使用此技能

- 使用者要求「依 BDD 開發前端畫面」或「開始實作前端 UX」
- TDD 後端開發完成，準備開發前端畫面
- 需要確保 BDD 描述的所有 UX 行為確實被實作
- 使用者要求「檢查前端實作是否符合 BDD」

## 行為規範

1. **嚴格遵循 BDD 場景**：每個 Scenario 都是一個實作項目，不得跳過
2. **SPEC 交叉比對**：必須同時讀取 SPEC 來源文件，確認 BDD 是否有遺漏的前端需求
3. **逐項實作、逐項回報**：完成一項才進下一項，每項都更新進度
4. **證據導向**：每個完成項目必須附實作檔案路徑 + 行號
5. **不偏離 BDD**：不實作 BDD 中未描述的功能（但可建議補充遺漏場景）
6. **進度必須精確**：完成數 / 總數，百分比即時更新

---

## 執行流程

### Phase 1：📋 BDD 場景解析 + SPEC 交叉比對

#### 1. 讀取 BDD Feature 文件

讀取指定的 `docs/bdd/SPEC-XXX.md` 文件。BDD 文件本身已包含 `- [ ]` checklist 與進度追蹤區段。

#### 2. 讀取 SPEC 來源文件

同時讀取對應的 `docs/specs/SPEC-XXX.md` 文件，提取所有前端相關需求：
- 使用者介面需求（UI/UX 描述）
- 驗收標準中涉及畫面的項目
- 互動流程描述（按鈕、表單、Dialog 等）
- 錯誤提示文案
- Loading/空狀態/禁用狀態描述
- 動畫效果需求
- 響應式/排版需求

#### 3. 提取前端相關場景

從 BDD `.md` 的所有 `- [ ] **Scenario: ...**` 項目中識別與前端相關的場景，判斷依據：

| 識別模式 | 場景類型 | 範例關鍵字 |
|---------|---------|-----------|
| 畫面渲染 | `@ui-render` | `應該顯示`、`應包含`、`卡片應即時更新` |
| 使用者互動 | `@user-interaction` | `用戶點擊`、`使用者按下`、`點擊按鈕` |
| 狀態更新 | `@state-update` | `應即時更新`、`狀態應為`、`進度條應更新` |
| 動畫效果 | `@animation` | `動畫`、`淡出`、`Loading`、`confetti` |
| 錯誤提示 UI | `@error-ui` | `顯示錯誤訊息`、`顯示警告`、`Toast` |
| 連線狀態 UI | `@connectivity-ui` | `指示器`、`橫幅`、`重新連線按鈕` |
| 已標記前端 | `@frontend` | BDD 文件中已標記 `@frontend` 的場景 |

#### 4. SPEC vs BDD 缺漏比對（關鍵步驟）

逐項比對 SPEC 中的前端需求是否都有對應的 BDD 場景覆蓋：

```
🔍 SPEC vs BDD 前端覆蓋率檢查
═══════════════════════════════════════

✅ 已覆蓋:
  SPEC 4.2.1 服務卡片狀態顯示 → BDD L23 AC-1
  SPEC 4.2.3 慶祝動畫規格     → BDD L39 AC-2
  ...

⚠️ 未覆蓋（建議補充 BDD 場景）:
  SPEC 4.3.1 表單驗證提示     → BDD 中無對應場景
  SPEC 4.4.2 分頁載入更多     → BDD 中無對應場景
  ...

覆蓋率: 85% (17/20 項 SPEC 前端需求已有 BDD 場景)
═══════════════════════════════════════
```

**處理缺漏的規則**：
- 缺漏項目標記為 `⚠️ SPEC 補充`，加入 checklist 但標記來源為 SPEC（非 BDD）
- 建議使用者事後補充對應的 BDD 場景
- 缺漏項目的實作要點從 SPEC 原文提取

直接在 BDD `.md` 文件中更新以下區段：

1. **頂部進度區段**：更新進度條、分頁面/元件進度表格、SPEC 覆蓋率表格
2. **SPEC 補充區段**：將 BDD 未覆蓋但 SPEC 有要求的項目寫入 `## ⚠️ SPEC 補充 — BDD 未覆蓋項目` 區段
3. **輸出摘要**至對話中：

```
📋 BDD 前端 UX 實作清單 — SPEC-XXX [功能名稱]
來源: docs/bdd/SPEC-XXX.md
SPEC: docs/specs/SPEC-XXX.md
總場景數: N 個 | 前端相關: M 個 | SPEC 補充: K 個
SPEC 前端覆蓋率: X% (Y/Z)
缺漏項目: K 個（已寫入 BDD 文件 SPEC 補充區段）
```

#### 6. 確認清單

輸出 checklist 後暫停，等待使用者確認再進入 Phase 2。

---

### Phase 2：🔨 逐項實作

#### 實作順序

1. **`@critical`** 優先級的場景（必須全部完成）
2. **`@normal`** 優先級的場景
3. **`@optional`** 優先級的場景

同優先級內，按頁面/元件分組實作（減少檔案切換）。

#### 每個項目的實作流程

```
┌─ 1. 選擇下一個未完成項目
│
├─ 2. 回讀 BDD 場景原文（BDD .md 文件中的 Scenario 區段）
│     確認 Given/When/Then 的完整語意
│
├─ 3. 定位目標元件（Vue/React/TS 文件路徑）
│
├─ 4. 實作前端功能
│     ├─ 修改/新增 Vue 元件
│     ├─ 修改/新增 CSS 樣式（動畫、狀態指示器等）
│     ├─ 修改/新增 composable（狀態管理、事件處理）
│     └─ 修改路由設定（如需要）
│
├─ 5. 驗證行為
│     ├─ 手動瀏覽器測試
│     └─ 或執行元件測試
│
└─ 6. 進入 Phase 3 標記完成
```

#### 允許做的事

- ✅ 修改/新增 Vue 元件（`.vue`）
- ✅ 修改/新增 CSS/SCSS 樣式
- ✅ 修改/新增 composable/hook
- ✅ 修改路由設定
- ✅ 新增前端元件測試

#### 禁止做的事

- ❌ 修改後端代碼（除非有對應 BDD 場景明確要求）
- ❌ 跳過 checklist 項目不實作
- ❌ 不驗證就進下一項
- ❌ 實作 BDD 和 SPEC 中皆未描述的功能

---

### Phase 3：✅ 驗收標記

每完成一個項目，**直接更新 BDD `.md` 文件**中的 checklist 狀態：

```markdown
- [x] **Scenario: AC-1 Giver 即時感知 Taker 提交任務步驟**  ✅
  - SPEC 對應: §4.2.1
  - 涉及元件: ServiceCard.vue, GiverDashboard.vue
  - 實作檔案: `frontend/src/views/GiverDashboard.vue` (L120-L145)
  - 實作檔案: `frontend/src/components/ServiceCard.vue` (L45-L62)
  - 完成時間: 2026-04-22 17:30
  - 驗證: 手動測試通過
```

同時更新 BDD 文件頂部的進度區段（進度條、分頁面/元件進度表格）。

**標記規則**：
- `[x]` = 完成且驗證通過
- `[/]` = 進行中
- `[ ]` = 未開始
- `[!]` = 實作有困難，需討論

---

### Phase 4：📊 進度統計與稽核

#### 進度計算公式

```
total_items     = checklist 中前端相關場景總數
completed       = [x] 已完成項數
in_progress     = [/] 進行中項數
blocked         = [!] 有困難項數
pending         = total_items - completed - in_progress - blocked
overall_percent = round(completed / total_items * 100, 1)
```

#### 分優先級統計

| 優先級 | 完成 | 總數 | 百分比 |
|--------|------|------|--------|
| 🔴 Critical | X | Y | Z% |
| 🟡 Normal | X | Y | Z% |
| 🟢 Optional | X | Y | Z% |

#### 分頁面/元件統計

| 頁面/元件 | 完成 | 總數 | 百分比 |
|-----------|------|------|--------|
| GiverDashboard.vue | X | Y | Z% |
| TakerBrowse.vue | X | Y | Z% |
| ... | ... | ... | ... |

#### 最終輸出摘要

```
═══════════════════════════════════════
📊 SPEC-XXX 前端 UX 實作稽核報告
═══════════════════════════════════════
整體進度: [████████████████░░░░] 80% (16/20)
Critical: 100% (8/8) ✅
Normal:   75% (6/8)
Optional: 50% (2/4)

已完成場景: 16
進行中場景: 1
有困難場景: 1
未開始場景: 2

實作涉及檔案:
  ├─ frontend/src/views/GiverDashboard.vue
  ├─ frontend/src/views/TakerBrowse.vue
  ├─ frontend/src/components/CelebrationAnimation.vue
  ├─ frontend/src/composables/useExchangeHub.ts
  └─ frontend/src/composables/useSignalR.ts

最後更新: 2026-04-22 17:30
═══════════════════════════════════════
```

---

## 循環終止條件

✅ 所有 `@critical` 場景已實作完成
✅ 所有 `@normal` 場景已實作完成（或標記為 `[!]` 並說明原因）
✅ 所有 `⚠️ SPEC 補充` 項目已實作或標記原因
✅ 每個完成項目都有實作檔案路徑 + 行號證據
✅ SPEC 前端覆蓋率已計算
✅ 進度百分比已重算

## 禁止事項

- ❌ 宣稱完成但無法提供實作檔案路徑
- ❌ 沿用舊進度百分比而不重算
- ❌ 跳過 `@critical` 場景
- ❌ 批量標記完成而未逐項驗證
- ❌ 不讀取 SPEC 來源文件就開始實作
- ❌ 發現 SPEC 缺漏卻不標記

## 與其他技能的關係

```
SDD SPEC ──────────┐
       ↓            ↓
bdd-feature-generation workflow → -BDD.md 文件
                                       ↓
                  本 SKILL：讀取 -BDD.md + SPEC → 前端 UX 逐項實作
                                       ↓
             spec-bdd-implementation-deep-audit SKILL：事後稽核
```

---

**最後更新**: 2026-04-22
**維護者**: 開發團隊
