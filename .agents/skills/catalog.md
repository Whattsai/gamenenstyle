# Orick Skills Catalog

本文件列出 root `.agents/skills/` 目前可用的 skill、觸發詞與適用範圍。執行 repository 任務前，先讀 root `AGENTS.md`，再讀本 catalog，最後依任務選擇一個主要 skill。

## 使用規則

1. 除非使用者明確要求組合工作流，否則一次只選一個主要 skill。
2. 選定 skill 後，必須完整閱讀該 skill 的 `SKILL.md`。
3. 若 `SKILL.md` 要求讀取其他資源、範例、模板或文件，必須依該 skill 指示讀取。
4. 開始執行前，必須先說明所選 skill、必讀檔案、驗收標準與驗證計畫。
5. 若目前工具無法讀取必讀檔案或無法執行驗證，必須明確說明限制，不得假裝完成。

## 可用 Skills

| Skill | 觸發詞 | 適用範圍 | 選定後必讀 |
|---|---|---|---|
| `initial-overview` | `initial-overview`、初始化 overview、建立 AGENTS.md、建立 README、整理專案上下文 | 初始化或重整專案的 AI 可讀入口文件，建立/更新 README、AGENTS 與 overview 架構/開發規範/契約/部署文件。只做文件初始化與同步規則，不做功能開發。 | `.agents/skills/initial-overview/SKILL.md` |
| `mvp-requirement-generation` | MVP 需求、草稿需求、需求轉正式 MVP、產品需求整理 | 將草稿需求文件轉成正式 MVP 需求文件，提供後續 SDD 規格撰寫所需的初步規劃資訊。 | `.agents/skills/mvp-requirement-generation/SKILL.md` |
| `sdd-specification` | SDD、SPEC、規格撰寫、產生規格 | 依 MVP 或需求內容撰寫 SDD/SPEC 規格文件。 | `.agents/skills/sdd-specification/SKILL.md` |
| `bdd-feature-generation` | BDD、Feature、Gherkin、TDD 測試清單、測試案例清單 | 從 SPEC 產生 BDD Feature 文件與 TDD 測試清單。 | `.agents/skills/bdd-feature-generation/SKILL.md` |
| `pre-implementation-risk-gap-audit` | 實作前風險、風險缺漏、RiskAudit、TDD 補強 | 在 TDD 開發前檢查 SPEC/BDD/TDD 文件的實作風險與缺漏，提出解法並補齊測試清單。 | `.agents/skills/pre-implementation-risk-gap-audit/SKILL.md` |
| `perfect-plan` | `perfect-plan`、完整規劃、需求到開發前規劃、先產生 MVP/SPEC/BDD/TDD、實作前風險稽核 | 規劃階段協調技能，整合 MVP、SDD、BDD、TDD 與風險缺漏稽核，將高階需求推進到可實作文件包。這是規劃主入口。 | `.agents/skills/perfect-plan/SKILL.md`，以及該 skill 指定的組合 skill 文件 |
| `tdd-development` | `tdd-development`、TDD、Red-Green-Refactor、依 TDD 開發、測試先行 | 依 TDD 測試清單逐一執行 Red-Green-Refactor，嚴格遵循測試先行。 | `.agents/skills/tdd-development/SKILL.md` |
| `bdd-frontend-ux-implementation` | BDD 前端、前端 UX、UX checklist、依 BDD 實作畫面 | 從 BDD Feature 提取前端 UX 場景，建立 checklist 並逐項引導前端畫面功能實作與稽核。 | `.agents/skills/bdd-frontend-ux-implementation/SKILL.md` |
| `spec-bdd-implementation-deep-audit` | 深度稽核、SPEC/BDD/TDD 對照、完成度百分比、缺漏回寫 | 在 TDD 完成後，逐項比對 SPEC/BDD/TDD 與實作現況，回寫缺漏並重新計算進度。 | `.agents/skills/spec-bdd-implementation-deep-audit/SKILL.md` |
| `well-done` | `well-done`、開始開發、依 TDD 開發、從文件實作到驗收、補齊缺漏直到完成 | 開發與驗收階段協調技能，接手 MVP/SPEC/BDD/TDD 文件包，整合 TDD、前端 UX 與深度稽核，直到需求可追溯完成。這是實作主入口。 | `.agents/skills/well-done/SKILL.md`，以及該 skill 指定的組合 skill 文件 |
| `fantastic-design` | `fantastic-design`、SD 設計、開發前詳細實作設計 | 承接已確認的規劃文件包，產出多 AI／模型／批次候選系統設計、分項 SD 與追溯矩陣；只設計，等待人工確認。 | `.agents/skills/fantastic-design/SKILL.md`，以及該 skill 指定的文件契約、規劃規則與四份固定範本 |
| `design-decision` | `design-decision`、比較設計、決定最終 SD | 選用的逐細項候選比較與整合，產出可獨立接手的完整 final 文件包；等待人工確認 final。 | `.agents/skills/design-decision/SKILL.md`，以及該 skill 指定的共用規則與五份固定範本 |
| `carefully-done` | `carefully-done`、依核准 SD 逐項實作 | 依具體核准設計版本逐項實作、實際驗證、稽核並同步 SD 與 BDD/TDD；偏離已記載設計先停止討論。 | `.agents/skills/carefully-done/SKILL.md`，以及該 skill 指定的規則、執行程序與適用子技能 |

## 常用選擇

| 任務情境 | 建議主要 skill |
|---|---|
| 整理既有專案入口、README、AGENTS、overview | `initial-overview` |
| 只有高階想法或草稿需求，需要推到可開發文件包 | `perfect-plan` |
| 已有 TDD 文件，要開始測試先行實作 | `tdd-development` |
| 已有完整 MVP/SPEC/BDD/TDD，要自動化開發到驗收 | `well-done` |
| TDD 完成後要檢查實作是否 100% 對齊文件 | `spec-bdd-implementation-deep-audit` |
| 已有 Ready for well-done 文件包，另需先完成 SD 詳細設計 | `fantastic-design` |
| 要逐項比較 SD 候選並整合完整 final | `design-decision`（選用） |
| 已明確確認 SD 文件包與版本，依設計逐項實作驗收 | `carefully-done` |

## 組合規則

- `perfect-plan` 是規劃組合入口，可能串接 `mvp-requirement-generation`、`sdd-specification`、`bdd-feature-generation`、`pre-implementation-risk-gap-audit`。
- `well-done` 是開發驗收組合入口，可能串接 `tdd-development`、`bdd-frontend-ux-implementation`、`spec-bdd-implementation-deep-audit`。
- 若使用者只指定單一 skill，先執行該 skill，不自動升級為組合流程。
- 若任務目標只是問答、查詢或小型文件修正，不必強行使用規劃或開發型 skill。

## 可選 SD 分支

原有 `perfect-plan → well-done` 路徑、入口選用規則與技能／範本保持原樣。需要詳細設計時，另選以下分支：

```text
perfect-plan
  → Ready for well-done
  → fantastic-design（可由不同 AI／模型以不同批次執行）
  → design-decision（選用）
  → 人工確認採用的 SD 文件包與具體設計版本
  → Ready for carefully-done
  → carefully-done
```

`Ready for well-done` 仍是原 TDD 規劃交接；`Ready for carefully-done` 另記於 SD 交接。readyforwelldone、可進行 carefullydone 是狀態，不新增同名技能。

SD 存於需求所屬 `docs/sd/<SPEC 完整名稱>/`，以完整 SPEC 名稱及來源文件關聯；不只用共用編號。carefully-done 有 final 優先採 final；無 final 時唯一候選可選用，兩套以上須先取得選擇或執行 design-decision。各情況仍須通過設計完整性、來源基準與明確核准檢查，不能因有候選就直接開發。
