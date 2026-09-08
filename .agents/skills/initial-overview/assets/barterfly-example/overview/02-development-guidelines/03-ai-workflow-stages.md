# AI Workflow Stages

本文件描述 AI 在 Barterfly 的任務階段。詳細規則以對應 skill 為準，本文件只列入口、交接條件與 Barterfly 路徑。

## Stage 0：讀取入口

每次開始前先讀：

1. `AGENTS.md`
2. `overview/01-architecture/`
3. `overview/02-development-guidelines/`
4. 使用者指定的 `docs/requirements`、`docs/specs`、`docs/bdd`、`docs/tdd`

## Stage 1：判斷工作模式

| 使用者意圖 | 使用流程 | 主要輸入 | 主要輸出 |
|---|---|---|---|
| 高階需求、需求整理、規劃到可開發 | `perfect-plan` | `docs/requirements/` 或使用者需求 | MVP、SPEC、BDD、TDD、風險缺漏、交接紀錄 |
| 已完成規劃並要實作到驗收 | `well-done` | TDD 的「規劃交接紀錄」 | 程式、測試、文件回寫、深度稽核 |
| 小型 bugfix 或文件調整 | 一般開發流程 | 本文件與架構文件 | 最小必要修改與驗證 |

## Stage 2：`perfect-plan`

入口：工作區根目錄 `.agents/skills/perfect-plan/SKILL.md`

子流程路徑（工作區根目錄）：

- `.agents/skills/mvp-requirement-generation/SKILL.md`
- `.agents/skills/sdd-specification/SKILL.md`
- `.agents/skills/bdd-feature-generation/SKILL.md`
- `.agents/skills/pre-implementation-risk-gap-audit/SKILL.md`

文件輸出位置：

- MVP：`docs/requirements/MVP-XXX-FeatureName.md`
- SPEC：`docs/specs/SPEC-XXX-FeatureName.md`
- BDD：`docs/bdd/SPEC-XXX-FeatureName-BDD.md`
- TDD：`docs/tdd/SPEC-XXX-FeatureName-TDD.md`

必要確認點：

- MVP 需求規劃確認。
- 每份 SPEC 細部規劃確認。
- 實作前風險與缺漏確認。

完成條件：

- 每個 MVP 需求可追到 SPEC、BDD Scenario 與 TDD 測試。
- 風險與缺漏已回寫到文件。
- TDD 末尾有 `## 規劃交接紀錄`。
- `交接狀態` 為 `Ready for well-done`。

## Stage 3：`well-done`

入口：工作區根目錄 `.agents/skills/well-done/SKILL.md`

前置條件：

- TDD 文件存在 `## 規劃交接紀錄`。
- 文件包表格列出 MVP、SPEC、BDD、TDD 路徑。
- `交接狀態` 為 `Ready for well-done`。
- 無 `待確認` 風險或只存在對話中的缺漏。

子流程路徑（工作區根目錄）：

- `.agents/skills/tdd-development/SKILL.md`
- `.agents/skills/bdd-frontend-ux-implementation/SKILL.md`
- `.agents/skills/spec-bdd-implementation-deep-audit/SKILL.md`

開發定位路徑：

- 後端入口：`backend/Barterfly.API/Program.cs`
- 後端 Controller：`backend/Barterfly.API/Controllers`
- Application use case：`backend/Barterfly.Application/Services`
- Domain 規則：`backend/Barterfly.Domain`
- Infrastructure：`backend/Barterfly.Infrastructure`
- 前端服務：`frontend/src/services`
- 前端狀態：`frontend/src/composables`
- 前端頁面：`frontend/src/views`
- 前端元件：`frontend/src/components`

完成條件：

- TDD 項目完成並回寫證據。
- BDD 場景完成並回寫證據。
- SPEC/BDD/TDD/實作/測試逐項深度稽核。
- 完成度重算為 100%。

## Stage 4：一般開發流程

未進入完整 skill 流程時，仍依下列順序：

1. 讀 `overview/01-architecture/04-module-map.md` 定位檔案。
2. 依 `02-file-placement.md` 放置新增或修改檔案。
3. 先補或更新測試，再改實作。
4. 同步前後端 DTO、API 型別、SignalR event、`overview/03-contracts`、`overview/04-deployment` 與相關測試。
5. 更新受影響的既有文件。

## Stage 5：Overview 文件同步檢查

每次需求開發完成後、交付前必須執行：

1. 對照 `AGENTS.md` 的「Overview 文件同步規則」判斷受影響文件。
2. 只更新與本次變更直接相關的 overview 文件，不新增重複文件。
3. 若 API、DTO、SignalR event、JSON schema、enum、環境變數或部署流程有變動，必須同步更新 `overview/03-contracts` 或 `overview/04-deployment`。
4. 若新增/搬移模組、改變啟動流程或新增套件/DI/外部依賴，必須同步更新 `overview/01-architecture`。
5. 若判斷 overview 不需更新，交付時列出「overview 無需更新」與原因。

## Stage 6：驗證

依變更範圍選擇：

```powershell
dotnet build Barterfly.sln
dotnet test backend/tests/Barterfly.Unit.Tests/Barterfly.Unit.Tests.csproj
dotnet test backend/tests/Barterfly.Integration.Tests/Barterfly.Integration.Tests.csproj
dotnet test backend/tests/Barterfly.E2E.Tests/Barterfly.E2E.Tests.csproj
```

```powershell
npm test
npm run build
npm run e2e
```

只改 Markdown：

```powershell
git diff --check
```

## Stage 7：交付

最終回覆列出：

- 修改摘要。
- 主要文件或程式路徑。
- Overview 文件更新結果；若未更新，說明不需更新的原因。
- 已執行驗證與結果。
- 未執行驗證的原因。
- 若使用 `well-done`，列出完成度與深度稽核結論。
