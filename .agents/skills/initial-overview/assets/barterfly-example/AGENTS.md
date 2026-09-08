# Barterfly AI 開發指引

本文件是 AI 在 `barterfly/` 子專案工作的入口規範。開始修改程式前，先讀本文件與下列必讀入口；若任務需要更細上下文，再從程式入口、架構文件與開發規範延伸閱讀。

## AI 讀取文件連結

### 必讀入口

1. [系統總覽](overview/01-architecture/01-system-overview.md)
2. [分層邊界](overview/01-architecture/02-layer-boundary.md)
3. [程式執行流程](overview/01-architecture/03-runtime-flow.md)
4. [模組對照](overview/01-architecture/04-module-map.md)
5. [相依關係圖](overview/01-architecture/05-dependency-map.md)
6. [程式實作規範](overview/02-development-guidelines/01-ai-coding-rules.md)
7. [檔案放置規範](overview/02-development-guidelines/02-file-placement.md)
8. [AI Workflow Stages](overview/02-development-guidelines/03-ai-workflow-stages.md)

### 工作流技能

- 規劃到可開發：工作區根目錄 `.agents/skills/perfect-plan/SKILL.md`
- 開發到驗收：工作區根目錄 `.agents/skills/well-done/SKILL.md`
- 文件包位置：`docs/requirements/`、`docs/specs/`、`docs/bdd/`、`docs/tdd/`

### 依任務補讀

- API 或前端 service 型別變更：[API 契約](overview/03-contracts/01-api-contracts.md)
- JSON 儲存、圖片、enum 或設定變更：[資料儲存契約](overview/03-contracts/02-data-contracts.md)
- 部署、容器或環境變數變更：[部署流程檢查表](overview/04-deployment/01-deployment-checklist.md)、[環境變數範本](overview/04-deployment/02-environment-variables-template.md)

### Overview 文件同步規則

每次需求開發完成前，必須依實際變更檢查 `overview/` 是否需要同步更新；若判斷不需要更新，交付時也要明確說明原因。

| 變更內容 | 必查文件 |
|---|---|
| 系統定位、主要業務模組、啟動點改變 | `overview/01-architecture/01-system-overview.md` |
| 分層責任、跨層依賴、檔案責任改變 | `overview/01-architecture/02-layer-boundary.md`、`overview/02-development-guidelines/02-file-placement.md` |
| 啟動流程、middleware、SignalR、SPA fallback、前後端 runtime 流程改變 | `overview/01-architecture/03-runtime-flow.md` |
| 新增/移動模組、Controller、Service、Entity、Repository、前端 views/components/composables/services | `overview/01-architecture/04-module-map.md` |
| 新增/移除專案參考、NuGet/npm 套件、DI 註冊、外部服務或 runtime 依賴 | `overview/01-architecture/05-dependency-map.md` |
| coding rule、測試策略、AI 工作流程或開發約定改變 | `overview/02-development-guidelines/` |
| HTTP endpoint、request/response DTO、前端 API 型別、SignalR event 改變 | `overview/03-contracts/01-api-contracts.md` |
| JSON schema、Entity 可序列化欄位、enum、圖片限制、設定 key 改變 | `overview/03-contracts/02-data-contracts.md` |
| Docker、部署流程、Cloud Run、環境變數、CORS、資料掛載改變 | `overview/04-deployment/` |

## 基本規範

- 回覆、文件、程式註解與提交訊息使用繁體中文。
- 不要任意新增 Markdown 檔案；除非使用者指定，優先更新既有文件。
- 不要提交密鑰、正式 Google Client ID、正式 JWT Secret、正式資料檔。
- 變更前先確認現有測試與分層模式，避免用繞過 Domain 或 Application Service 的方式完成工作。
- 專案快速啟動與貢獻入口見 `README.md`；AI 實作脈絡以本文件、`overview/`、`docs/` 與程式碼為準。

## 專案概觀

Barterfly 是服務交換平台。Giver 發布服務，Taker 接案並完成任務，Giver 審核步驟後交付服務，Taker 確認點收完成交換。系統支援兩種服務模式：

- `Task` 任務制：每個 Task 對應一個 Step，Taker 需依序提交，所有 Step 通過後 Exchange 完成。
- `Points` 集點制：Service 有 `RequiredPoints`，Task 可有不同 `Points`，Taker 累積核准點數達標後 Exchange 完成；集點制可在進行中由 Giver 動態新增 Task。

## 技術組成

- 後端：`.NET 8`、ASP.NET Core Web API、SignalR、xUnit、FluentAssertions、Moq。
- 前端：Vue 3、TypeScript、Vite、Vue Router、Axios、`@microsoft/signalr`、Vitest、Playwright。
- 儲存：JSON 檔案儲存 `services.json`、`exchanges.json`、`users.json`，圖片儲存在 `data/images`。
- 容器執行：`Dockerfile` 先建置前端，再發布後端，最後由 ASP.NET Core 同源服務 `wwwroot` SPA 與 `/api`。

## 重要目錄

```text
barterfly/
├── backend/
│   ├── Barterfly.API/               # HTTP API、DI、Middleware、SignalR Hub、靜態檔服務
│   ├── Barterfly.Application/       # DTO、Use Case、應用例外、Entity to DTO mapping
│   ├── Barterfly.Domain/            # Entity、Enum、Repository interface、核心狀態規則
│   ├── Barterfly.Infrastructure/    # JSON Repository、Google Token、JWT
│   └── tests/                       # Unit、Integration、E2E 測試
├── frontend/
│   ├── src/views/                   # Home、Giver、Taker、Exchange、Auth 頁面
│   ├── src/components/              # ServiceCard、ServiceForm、TaskList 等共用元件
│   ├── src/composables/             # Auth、SignalR、API action、device 判斷
│   ├── src/services/                # REST API client 與 HTTP interceptor
│   └── e2e/                         # Playwright 測試
├── docs/
│   ├── requirements/                 # MVP 需求文件
│   ├── specs/                        # SDD/SPEC 文件
│   ├── bdd/                          # BDD 場景文件
│   └── tdd/                          # TDD 測試規劃與交接紀錄
└── overview/
    ├── 01-architecture/             # AI 讀取程式實作上下文的架構入口
    ├── 02-development-guidelines/   # AI 實作、放置與工作流規範
    ├── 03-contracts/                # API 與資料儲存契約
    └── 04-deployment/               # 部署檢查與環境變數範本
```

## 常用命令

在 `barterfly/` 目錄執行：

```powershell
dotnet build Barterfly.sln
dotnet test backend/tests/Barterfly.Unit.Tests/Barterfly.Unit.Tests.csproj
dotnet test backend/tests/Barterfly.Integration.Tests/Barterfly.Integration.Tests.csproj
dotnet test backend/tests/Barterfly.E2E.Tests/Barterfly.E2E.Tests.csproj
```

在 `barterfly/frontend/` 目錄執行：

```powershell
npm test
npm run build
npm run e2e
```

本機開發常用服務：

```powershell
dotnet run --project backend/Barterfly.API/Barterfly.API.csproj --urls http://localhost:5051
npm run dev -- --host localhost --port 5173
```

`frontend/vite.config.ts` 會把 `/api`、`/images`、`/exchangeHub` 代理到 `http://localhost:5051`。

## 測試放置規則

- Domain 規則改動：補 `backend/tests/Barterfly.Unit.Tests/Domain`。
- Application use case 改動：補 `backend/tests/Barterfly.Unit.Tests/Application` 或 `Services`。
- Controller、Middleware、Repository、SignalR 整合改動：補 `backend/tests/Barterfly.Integration.Tests`。
- 跨 API 完整流程：補 `backend/tests/Barterfly.E2E.Tests`。
- 前端 service/composable/router/component/view：補鄰近的 `__tests__`。
- 使用者端跨頁流程或即時同步：補 `frontend/e2e` 或現有 Playwright 測試。

## 變更檢查清單

- API request/response 欄位變動時，同步更新後端 DTO、前端 `src/services` 型別與測試。
- Service 或 Exchange 狀態規則變動時，先改 Domain 測試，再改 Application 與 Controller 測試。
- 新增 SignalR 事件時，同步更新 `ExchangeNotification`、`IExchangeNotificationService`、`ExchangeNotificationService`、`useExchangeHub` 與前端事件處理測試。
- 新增環境設定時，同步更新 `appsettings*.json`、相關啟動設定與 `overview/04-deployment/02-environment-variables-template.md`。
- 圖片與 JSON 儲存路徑以 `DataStorage:Path` 為準，不要在 Controller 或 View 直接組檔案路徑。
- 交付前必須完成 `overview/` 影響檢查，並更新所有受影響的 overview 文件。
