---
name: initial-overview
description: 初始化或重整專案的 AI 可讀上下文文件與開發者入口，建立/更新 README.md、AGENTS.md 與 overview/01-architecture、02-development-guidelines、03-contracts、04-deployment，讓開發者能快速啟動專案，讓 AI 能從 overview 快速理解現行程式結構、合約、部署、相依關係與後續需求開發時必須同步更新的文件。當使用者要求 initial-overview、初始化 overview、建立 AGENTS.md、建立 README、讓 AI 結構化讀取專案上下文、把既有專案整理成可被 AI 接手維護的文件入口時使用。
---

# Initial Overview

此技能負責把既有專案整理成開發者可快速理解、AI 可讀且可持續更新的上下文文件。只做文件初始化與同步規則建立，不執行功能需求規劃或程式開發。

## 核心原則

1. 先讀目標專案的實際程式碼、設定、測試與既有文件，再寫 `AGENTS.md` 與 `overview/`。
2. 文件內容必須反映現況；不要保留來源模板、其他專案名稱、未確認工具或不存在的流程。
3. `README.md` 面向人類開發者，只放快速理解、啟動、驗證、文件入口與貢獻方式；不要取代 `AGENTS.md` 或 `overview/`。
4. `AGENTS.md` 只做 AI 入口、通用規範、文件連結與高頻檢查清單；細節寫進 `overview/`。
5. `overview/01-architecture/01-system-overview.md` 只放概述、啟動點、主要業務模組；不要塞資料細節、限制、API endpoint 或部署規格。
6. 讀取順序放在 `AGENTS.md`；coding rules 放在 `overview/02-development-guidelines/01-ai-coding-rules.md`。
7. 若工作區存在 `.agents/skills/perfect-plan/SKILL.md` 與 `.agents/skills/well-done/SKILL.md`，把 `perfect-plan -> well-done` 作為規劃到開發的文件工作流入口寫入 `AGENTS.md` 與 workflow 文件；不要在本技能中實際執行需求規劃或開發。
8. 每個需求開發後都要能依 `overview/` 影響矩陣更新對應文件；這個規則必須固化到 `AGENTS.md` 與 `03-ai-workflow-stages.md`。
9. 專案參考、套件、DI、前後端 runtime 與外部服務相依寫在 `overview/01-architecture/05-dependency-map.md`；不要塞進 `01-system-overview.md`。

## 輸出格式範例

`assets/barterfly-example/` 保存一組已完成的輸出範例，包含：

- `README.md`
- `AGENTS.md`
- `overview/01-architecture/`
- `overview/02-development-guidelines/`
- `overview/03-contracts/`
- `overview/04-deployment/`

使用方式：

- 只把範例當作文件章節、粒度、表格、檢查清單與連結方式的參考。
- 不要複製範例中的專案名稱、業務描述、技術棧、API、部署環境或路徑到目標專案。
- 需要寫某一類文件時，只讀取對應範例檔案；不要一次載入整個 assets 目錄。
- 最終產出必須依目標專案實際程式碼與設定改寫。

## Phase 0：確認目標

1. 目標可以是目前工作區根目錄，或使用者指定的子專案、套件、服務目錄。
2. 若使用者未指定目標，先檢查當前目錄與可能的子專案目錄，請使用者確認。
3. 若目標專案已有 `AGENTS.md` 或 `overview/`，以現有內容為基礎更新，不重建、不覆蓋使用者已調整的方向。

## Phase 1：盤點現況

先用 `rg --files` 與少量重點讀檔建立上下文：

- 專案入口：`README.md`、`AGENTS.md`、`package.json`、`.sln`、`.csproj`、`Program.cs`、`main.ts`、`App.vue`、`router`。
- 後端：Controller/API route、Application/use case、Domain/entity/enum、Infrastructure/repository、middleware、hub、mapping、DTO。
- 前端：views、components、composables、services、router、測試與 build 設定。
- 測試：unit、integration、e2e、Playwright/Vitest/xUnit 等實際命令。
- 合約：request/response DTO、前端 service 型別、SignalR event、JSON schema、enum、圖片/檔案限制。
- 相依關係：ProjectReference、PackageReference、package manager dependencies、DI 註冊、前端 API/WebSocket client、proxy、外部服務與 runtime env。
- 部署：Dockerfile、dockerignore、appsettings、env 範本、CI/CD、cloud run 或其他平台設定。

盤點時要記錄「實際存在」與「不存在」。不存在的項目不要寫成檢查要求，例如沒有資料庫就不要寫 migration、沒有 `/health` 就不要寫 health check。

## Phase 2：建立或更新 README.md

`README.md` 應保持簡短，面向初次接觸專案的人類開發者，包含：

1. 專案名稱與一句話目的。
2. 核心功能或使用者角色的簡短描述。
3. 技術組成。
4. 快速啟動步驟與必要前置需求。
5. 常用 build/test/lint/e2e 驗證命令。
6. 文件入口：`AGENTS.md`、`overview/`、需求或部署文件。
7. 社群或團隊貢獻方式：開發前閱讀文件、補測試、同步 overview、避免提交密鑰、PR/交付說明格式。

不要把完整架構、API schema、資料契約、部署手冊或 AI 工作規則塞進 `README.md`；用連結指向 `AGENTS.md` 與 `overview/`。

## Phase 3：建立或更新 AGENTS.md

`AGENTS.md` 應包含：

1. 專案 AI 入口定位。
2. 必讀文件連結：只列已完成且目前應讀的 `overview/` 文件。
3. 依任務補讀連結：API/資料契約、部署文件、需求文件等。
4. 若存在本地 skills，列出 `perfect-plan`、`well-done` 的路徑與用途。
5. 基本規範：語言、敏感資訊、不要任意新增 Markdown、先讀分層與測試。
6. 專案目的與技術組成的精簡描述。
7. 重要目錄、常用命令、測試放置規則。
8. 變更檢查清單。
9. Overview 文件同步規則矩陣。

不要把大量 API、資料 schema、部署步驟塞進 `AGENTS.md`；改放對應 `overview/` 文件。

## Phase 4：初始化 overview/01-architecture

建立或更新下列文件：

| 文件 | 目的 |
|---|---|
| `overview/01-architecture/01-system-overview.md` | AI 第一入口，描述系統定位、技術輪廓、主要業務模組、前後端啟動點、建議閱讀順序 |
| `overview/01-architecture/02-layer-boundary.md` | 描述後端/前端/測試/文件的分層責任與禁止跨層行為 |
| `overview/01-architecture/03-runtime-flow.md` | 描述程式面啟動與執行流程，例如 host、DI、middleware、router、API client、SignalR、SPA fallback |
| `overview/01-architecture/04-module-map.md` | 描述程式模組、檔案位置與常見修改入口；不要列完整 API endpoint 清單 |
| `overview/01-architecture/05-dependency-map.md` | 描述專案參考、套件、DI、前後端 runtime、外部服務、測試與部署相依 |

重點：

- `01-system-overview.md` 保持概述，不放資料限制、錯誤碼、完整 API 表。
- `03-runtime-flow.md` 描述 runtime flow，不要寫成業務流程規格。
- `04-module-map.md` 以模組與檔案為主，不取代 API contracts。
- `05-dependency-map.md` 以實際專案檔、package 檔、DI 註冊與外部服務設定推導；不要列不存在的資料庫、queue、CI 或第三方服務。

## Phase 5：初始化 overview/02-development-guidelines

建立或更新下列文件：

| 文件 | 目的 |
|---|---|
| `overview/02-development-guidelines/01-ai-coding-rules.md` | 依現行程式習慣建立後續 AI 修改程式規範；與讀取順序、skill workflow 無關 |
| `overview/02-development-guidelines/02-file-placement.md` | 說明新增/修改檔案應放的位置，以及文件、測試、前後端檔案放置規則 |
| `overview/02-development-guidelines/03-ai-workflow-stages.md` | 說明 AI 任務階段、`perfect-plan -> well-done` 交接、一般開發流程、驗證與交付格式 |

`01-ai-coding-rules.md` 需包含：

- 必守分層規則。
- 例外與錯誤處理慣例。
- 測試與文件同步規則。
- AI 實作要求。
- 新增完整功能範例流程。
- 常見任務處理方式。
- AI Review 重點。

## Phase 6：初始化 overview/03-contracts

建立或更新下列文件：

| 文件 | 目的 |
|---|---|
| `overview/03-contracts/01-api-contracts.md` | HTTP API、request/response DTO、前端 service 型別、SignalR event、錯誤碼與維護規則 |
| `overview/03-contracts/02-data-contracts.md` | JSON/DB schema、entity 可序列化欄位、enum、圖片/檔案限制、設定 key 與維護規則 |

規則：

- 只從實際 Controller/route、DTO、前端 API client、Domain entity、repository 推導。
- 不把業務流程細節寫成 API 契約。
- API 欄位要標清 nullable/optional、enum 值與日期格式。
- 若專案沒有後端 API 或資料儲存，文件要明確說明「目前無」，不要套模板。

## Phase 7：初始化 overview/04-deployment

建立或更新下列文件：

| 文件 | 目的 |
|---|---|
| `overview/04-deployment/01-deployment-checklist.md` | 依 Docker、CI/CD、runtime、測試與實際可用 endpoint 建立部署前後檢查表 |
| `overview/04-deployment/02-environment-variables-template.md` | 列出實際使用的 runtime env、build-time env、secret/variable 分類與安全規則 |

規則：

- 不列不存在的資料庫、migration、observability 或 health endpoint。
- 環境變數名稱必須符合實際 framework 規則，例如 ASP.NET Core 使用 `__` 對應階層設定。
- 前端 build-time 變數與後端 runtime 變數分開寫。
- 不把正式密鑰、正式資料或服務帳號 JSON 寫入文件。

## Phase 8：建立 Overview 文件同步規則

在 `AGENTS.md` 與 `overview/02-development-guidelines/03-ai-workflow-stages.md` 寫入下列要求：

- 每次需求開發完成前，必須檢查 `overview/` 是否受影響。
- 若受影響，必須更新對應文件。
- 若判斷不需更新，交付時必須說明原因。

建議矩陣：

| 變更內容 | 必查文件 |
|---|---|
| 系統定位、主要業務模組、啟動點改變 | `overview/01-architecture/01-system-overview.md` |
| 分層責任、跨層依賴、檔案責任改變 | `overview/01-architecture/02-layer-boundary.md`、`overview/02-development-guidelines/02-file-placement.md` |
| 啟動流程、middleware、SignalR、SPA fallback、runtime 流程改變 | `overview/01-architecture/03-runtime-flow.md` |
| 新增/移動模組、Controller、Service、Entity、Repository、前端 views/components/composables/services | `overview/01-architecture/04-module-map.md` |
| 新增/移除專案參考、NuGet/npm 套件、DI 註冊、前端 runtime client、外部服務或 proxy | `overview/01-architecture/05-dependency-map.md` |
| coding rule、測試策略、AI 工作流程或開發約定改變 | `overview/02-development-guidelines/` |
| HTTP endpoint、request/response DTO、前端 API 型別、SignalR event 改變 | `overview/03-contracts/01-api-contracts.md` |
| JSON schema、Entity 可序列化欄位、enum、圖片限制、設定 key 改變 | `overview/03-contracts/02-data-contracts.md` |
| Docker、部署流程、環境變數、CORS、資料掛載改變 | `overview/04-deployment/` |

## Phase 9：品質檢查

完成後至少執行：

```powershell
git diff --check
```

並執行針對性掃描：

- 來源模板或其他專案名稱。
- 不應存在的舊文件路徑。
- 未確認但被列為必讀的文件。
- 專案未使用的部署項目，例如 database migration、health endpoint、observability vendor。

掃描範圍應是目標專案輸出文件；不要把本技能的 `assets/barterfly-example/` 視為目標專案殘留。

若只修改 Markdown，不需要跑程式測試；若為了確認文件內容讀取程式碼，不因此修改程式。

## 最終回覆

列出：

- 新增或更新的 `README.md`、`AGENTS.md` 與 `overview/` 文件。
- 是否已建立 Overview 文件同步規則。
- 已執行的驗證命令與結果。
- 明確說明是否只修改 Markdown。
