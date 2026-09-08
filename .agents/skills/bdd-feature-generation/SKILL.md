---
name: bdd-feature-generation
description: BDD Feature 文件生成與 TDD 測試清單生成
license: MIT
---

# BDD Feature 文件生成流程

本工作流將 SDD SPEC 轉換為 BDD Feature 文件，並自動生成 TDD 測試清單。

## 前置條件

- 已完成 SDD SPEC 文檔（`docs/specs/SPEC-XXX-FeatureName.md`）
- SPEC 已經過使用者確認

## 重要：BDD 的角色定位

BDD Feature 文件在此工作流中扮演三個角色：

1. **需求規格書**：用業務語言描述系統行為
2. **TDD 測試生成器**：AI 自動解析並轉換為 TDD 測試清單
3. **前端 UX 實作引導**：每個前端相關 Scenario 作為 checklist 項目，確保畫面行為被逐項實作（搭配 `bdd-frontend-ux-implementation` SKILL 使用）

⚠️ **BDD Feature 文件不作為 SpecFlow 測試使用**

## 執行步驟

### 1. 分析 SPEC 文檔

從 SPEC 中深入分析拆解：
- 使用者故事
- 核心功能點
- 關鍵場景
- 業務規則
- 預期行為
- 驗收標準

### 2. 生成 BDD Feature 文件(Gherkin 場景)

在 `docs/bdd/` 目錄下創建 `SPEC-XXX-FeatureName-BDD.md`：

**重要**：
- 輸出格式嚴格要求務必使用 `.agents/skills/tdd-development/assets/SPEC-XXX-Template.sdd流水號-BDD.md` 作為範本。
- BDD 文件使用 Markdown 格式，原生支援 `- [ ]` checklist、進度追蹤、SPEC 交叉對應
- Gherkin 語法保留在 ` ```gherkin ` 代碼區塊中
- 至少必須包含**Happy Path**、**Error Handling**、**Boundary Conditions**、**Alternative Path**、**Frontend UX**場景類型

為每個驗收標準**最細緻**生成對應的場景：

| 場景類型 | 數量要求 | 說明 |
|---------|---------|------|
| **Happy Path** | 最細緻 | 正常流程 |
| **Error Handling** | 最細緻 | 錯誤處理（無效輸入 + 業務規則違反） |
| **Boundary Conditions** | 最細緻 | 邊界條件 |
| **Alternative Path** | 視需求 | 替代流程 |
| **Frontend UX** | 最細緻 | 前端畫面行為（頁面載入、互動、動畫、錯誤提示、Loading 狀態）|


```gherkin
Feature: [功能名稱]
  作為一個 [角色]
  我想要 [功能]
  以便 [價值]

  Background:
    Given [共同的前置條件]
    And [其他前置條件]

  @smoke @happy-path
  Scenario: [正常流程場景]
    Given [前置條件]
    When [執行動作]
    Then [預期結果]
    And [其他驗證]

  @edge-case
  Scenario: [邊界情況場景]
    Given [特殊前置條件]
    When [執行動作]
    Then [預期結果]

  @error-handling
  Scenario: [錯誤處理場景]
    Given [錯誤條件]
    When [執行動作]
    Then [錯誤處理結果]
```

**重要規範**：
- ✅ 關鍵字使用英文：`Feature`, `Scenario`, `Given`, `When`, `Then`, `And`
- ✅ 步驟描述使用繁體中文
- ✅ 使用標籤：`@smoke`, `@happy-path`, `@edge-case`, `@error-handling`, `@frontend`
- ✅ 所有 Scenario 必須標記優先級：`@critical`, `@normal`, `@optional`
- ✅ 前端畫面相關場景必須標記 `@frontend`（供 `bdd-frontend-ux-implementation` SKILL 識別）

### 3. 執行BDD文檔檢查清單

- **再次**比對BDD完整符合每一項SDD需求，以使接續TDD產出符合需求

#### BDD Feature 生成檢查

- [ ] 涵蓋所有 SDD 驗收標準
- [ ] 每個場景有明確的 Given-When-Then
- [ ] 錯誤訊息使用實際文案（不是「顯示錯誤」）
- [ ] 場景已標記優先級（@critical/@normal/@optional）
- [ ] 邊界條件已覆蓋
- [ ] 使用繁體中文描述
- [ ] **前端場景覆蓋率**：每個涉及畫面的 SDD 需求都有對應的 `@frontend` 場景
- [ ] **前端場景包含**：頁面載入、空狀態、使用者互動、Loading 狀態、錯誤提示、重複點擊防護

### 4. 生成 TDD 測試清單

**嚴格根據每一項** BDD 場景，產生 **一份整合的** TDD 測試清單文件。

**重要**：輸出格式嚴格要求務必使用 `.agents/skills/tdd-development/assets/SPEC-XXX-Template.bdd流水號-TDD.md` 作為範本。

目標檔案：`docs/tdd/SPEC-XXX-FeatureName-TDD.md`

#### 文件結構要求

該文件應包含所有測試層級：

1.  **開發進度總覽**：進度條、里程碑、每日進度
2.  **1️⃣ 單元測試（Unit Tests）** - 隔離測試
3.  **2️⃣ 集成測試（Integration Tests）** - 組件協作
4.  **3️⃣ API 測試（API Tests）** - HTTP 測試
5.  **3️⃣ E2E 測試（End-to-End Tests）** - 使用者測試
6.  **測試清單使用說明**

#### 內容填寫指南

- **開發進度**：初始化為 0%，狀態為 `⏸️ 未開始`
- **測試項目**：從 BDD 場景推導出具體的測試案例
- **格式**：每個測試案例應包含目標、前置條件、執行動作、預期結果

### 5. 執行TDD檢查清單

確認以下內容：
- BDD 場景是否覆蓋所有TDD測試案例
- 測試清單是否完整（包含所有層級）且整合在同一文件中
- 測試優先級是否合理

#### TDD 測試清單生成檢查

- [ ] 單元測試覆蓋所有公開方法
- [ ] 集成測試覆蓋關鍵流程
- [ ] API 測試覆蓋所有端點
- [ ] 測試命名符合 `[方法名]_[條件]_[預期結果]` 格式
- [ ] 包含測試檔案路徑
- [ ] 標記測試優先級

### 6. 完成 BDD 階段

待使用者確認後，準備進入 TDD 開發階段。

## 產出物

- `docs/bdd/SPEC-XXX-FeatureName-BDD.md`（BDD 場景規格，Markdown 格式，含 checklist + 進度追蹤）
- `docs/tdd/SPEC-XXX-FeatureName-TDD.md` (每份 SPEC 各有一份整合文件)

## 下一步

執行 TDD 開發技能：`.agents/skills/tdd-development/SKILL.md`

---

## 轉換規則使用範例

### 從 BDD Scenario 到 TDD 測試的映射

#### 規則 1：每個 Scenario 至少生成 3-7 個單元測試

```gherkin
Scenario: 新增持股 - 正常流程
  Given 股票 "2330" 尚未存在
  When 使用者新增股票 "2330"，張數 10
  Then 系統應該成功新增

↓ 自動生成 ↓

單元測試：
[Fact] AddHoldingAsync_WithValidData_ShouldSucceed()
[Fact] AddHoldingAsync_WithDuplicateStock_ShouldThrowInvalidOperationException()
[Fact] AddHoldingAsync_WithEmptyStockId_ShouldThrowArgumentException()
[Fact] AddHoldingAsync_WithInvalidStockIdFormat_ShouldThrowArgumentException()
[Fact] AddHoldingAsync_WithNegativeShares_ShouldThrowArgumentException()
[Fact] AddHoldingAsync_WithZeroPrice_ShouldThrowArgumentException()
[Fact] AddHoldingAsync_ShouldCallRepositorySaveOnce()
```

#### 規則 2：關鍵 Scenario 需生成集成測試

```gherkin
Scenario: 新增持股並從資料庫讀取

↓ 自動生成 ↓

集成測試：
[Fact] AddHolding_ShouldPersistToDatabaseSuccessfully()
[Fact] AddHolding_ThenGetAll_ShouldReturnNewHolding()
[Fact] AddHolding_ShouldTriggerCacheInvalidation()
```

#### 規則 3：每個 API 端點需生成 API 測試

```gherkin
Scenario: POST /api/stocks/holdings

↓ 自動生成 ↓

API 測試：
[Fact] PostHolding_WithValidData_ShouldReturn201Created()
[Fact] PostHolding_WithInvalidData_ShouldReturn400BadRequest()
[Fact] PostHolding_WithDuplicateStock_ShouldReturn409Conflict()
[Fact] PostHolding_ResponseShouldIncludeLocationHeader()
```
