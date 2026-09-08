---
name: sdd-specification
description: 執行 SDD 規格撰寫流程
license: MIT
---

# SDD 規格撰寫流程

本工作流協助將使用者需求轉換為正式的 SDD 規格文檔。

## 前置條件

- 使用者已提供高階需求描述
- 明確了解需求的業務價值

## 執行步驟

### 1. 分析使用者需求

仔細閱讀使用者提供的功能描述，識別：
- 功能目標和業務價值
- 目標使用者角色
- 核心使用場景
- 技術限制或特殊需求

### 2. 使用 SPEC 模板生成文檔

先由指定 MVP、已確認的切分表或既有文件的來源連結確認本 SPEC 所屬的 `MVP-XXX-MvpName.md`。若尚無 MVP，先建立需求來源；若多份來源仍無法唯一判定，才詢問使用者，不自行分配 SPEC 編號。

在 `docs/specs/` 目錄下創建 `SPEC-XXX-FeatureName.md`，其中 `XXX` 必須繼承來源 MVP 的編號，`FeatureName` 採該份 SPEC 的功能名稱。同一 MVP 的所有 SPEC 共用編號，不依實作順序、既有最大 SPEC 編號或空號遞增；例如 `MVP-005` 的兩份規格為 `SPEC-005-DocumentEditing` 與 `SPEC-005-StageDelivery`。

文件標頭的功能 ID、依賴及後續 BDD／TDD／風險報告必須使用完整 SPEC 名稱，並記錄來源 MVP 路徑。既有歷史文件依原名及來源關聯讀取，不自動重編；同編號的其他功能文件不構成檔名衝突。

參考 `.agents/skills/sdd-specification/assets/SPEC-XXX-Template.自訂流水號.New.md` 模板；模板檔名中的「自訂流水號」是既有資源名稱，不代表可自行分配 SPEC 編號。生成包含以下章節的文檔：

#### 必要章節

- **功能概述**：功能名稱、優先級、負責人、功能的 What 和 Why
- **功能設計**：詳細的技術實現方案、架構影響(ex.涉及的層級Domain/Application/Infrastructure/Presentation、新增或修改的組件)
- **API 設計**：RESTful 端點、請求/響應格式
- **資料結構**：Domain 實體、DTO、資料庫 Schema
- **驗收標準**：可測試的成功條件
- **技術考量**：性能、安全、錯誤處理

#### 其他建議章節
- **風險評估**：調整的潛在風險說明
- **參考資料**：相關 SPEC、外部文檔

### 3. 遵循 DDD 原則

確保設計符合 Domain-Driven Design 原則：
- 識別 Aggregate Root
- 定義 Value Objects
- 明確 Repository 介面
- 使用通用語言 (Ubiquitous Language)

### 4. 使用者確認

生成完整的 SPEC 文檔後，與使用者確認 SPEC 文檔：
- 使用繁體中文撰寫所有描述
- 功能描述是否完整且清晰
- 技術方案是否可行
- API 設計符合 RESTful 原則
- 資料結構符合 DDD 原則
- 測試範圍是否充分
- 錯誤處理策略明確
- 包含範例請求/響應
- 驗收標準可測試
- 技術風險已識別
- SPEC 編號繼承來源 MVP，完整名稱與切分表一致，來源／依賴／BDD／TDD 連結不混用同編號的其他 SPEC

### 5. 完成 SDD 階段

確認後，準備進入 BDD 階段。

## 產出物

- `docs/specs/SPEC-XXX-FeatureName.md`

## 下一步

執行 BDD Feature 生成技能：`.agents/skills/bdd-feature-generation/SKILL.md`
