# 系統總覽

本文件是 AI 讀取 Barterfly 程式實作上下文的第一入口。此處只保留系統定位、專案分工、主要業務模組與啟動點；詳細分層、執行流程、模組檔案對照與相依關係請接續閱讀同目錄其他文件。

## 系統定位

Barterfly 是一個服務交換平台。使用者可以作為 Giver 發布服務，也可以作為 Taker 接案並依任務進度完成交換。系統的核心目標是讓服務發布、接案、任務提交、審核、交付與點收形成可追蹤流程。

## 技術輪廓

- 後端：.NET 8、ASP.NET Core Web API、SignalR。
- 前端：Vue 3、TypeScript、Vite、Vue Router。
- 認證：Google 登入後由後端簽發平台 JWT。
- 測試：後端 xUnit，前端 Vitest 與 Playwright。
- 執行模式：前端建置後由 ASP.NET Core 同源服務。

## 專案分工

```text
frontend/
  src/main.ts                 # 前端啟動入口
  src/App.vue                 # 前端殼層與 RouterView
  src/router/                 # 路由與登入導向
  src/services/               # REST API client
  src/composables/            # Auth、SignalR、API action 等跨頁狀態
  src/views/                  # 主要頁面
  src/components/             # 共用 UI 元件

backend/
  Barterfly.API/              # HTTP、SignalR、Middleware、DI 與 host 設定
  Barterfly.Application/      # Use case、DTO、應用層例外與 mapping
  Barterfly.Domain/           # Entity、Enum、Repository interface 與核心業務規則
  Barterfly.Infrastructure/   # 外部服務與儲存實作
  tests/                      # 後端測試專案

overview/
  01-architecture/            # 系統架構入口
  02-development-guidelines/  # AI 實作、放置與工作流規範
  03-contracts/               # API 與資料儲存契約
  04-deployment/              # 部署檢查與環境變數範本
```

## 主要業務模組

| 業務模組 | 程式入口 | 概述 |
|---|---|---|
| 使用者與認證 | `AuthController`、`AuthService`、`useAuth` | 處理 Google 登入、首次註冊、目前使用者狀態與前端登入狀態 |
| Giver 服務管理 | `ServicesController`、`ServiceApplicationService`、`GiverDashboard.vue` | 處理服務建立、任務設定、圖片操作、上架下架、封存與重啟 |
| Taker 接案流程 | `ExchangesController`、`ExchangeApplicationService`、`TakerBrowse.vue` | 處理服務瀏覽、接案、任務提交、案件釋出與點收 |
| 任務與進度 | `Service`、`ServiceTask`、`Exchange`、`StepResult`、`TaskList.vue` | 承載任務制與集點制的核心狀態、進度與 UI 操作 |
| 即時同步 | `ExchangeHub`、`ExchangeNotificationService`、`useSignalR`、`useExchangeHub` | 在交換狀態變更後通知前端重新同步資料 |
| 首頁與導覽 | `App.vue`、`HomePage.vue`、`router/index.ts` | 提供登入後 shell、快速導覽與 Giver/Taker 摘要 |

## 啟動點

### 後端啟動點

- `backend/Barterfly.API/Program.cs`
  - 建立 ASP.NET Core host。
  - 註冊 Controller、SignalR、Repository、Application Service 與基礎設施服務。
  - 設定 CORS、Middleware、靜態檔與 SPA fallback。
  - 對外掛載 HTTP API 與 SignalR Hub。

### 前端啟動點

- `frontend/src/main.ts`
  - 註冊 HTTP interceptor。
  - 建立 Vue app。
  - 掛載 router 與 `App.vue`。

- `frontend/src/App.vue`
  - 提供登入後應用殼層。
  - 初始化目前使用者資料。
  - 啟動 SignalR 連線狀態管理。
  - 承接路由頁面。

- `frontend/src/router/index.ts`
  - 定義主要頁面路由。
  - 檢查本機 JWT 狀態並處理登入導向。

## 建議閱讀順序

1. 本文件：先了解系統定位、主要模組與啟動點。
2. `02-layer-boundary.md`：確認後端與前端分層責任。
3. `03-runtime-flow.md`：理解程式啟動、HTTP request、SignalR 與前端頁面執行流程。
4. `04-module-map.md`：定位實際檔案與常見變更入口。
5. `05-dependency-map.md`：確認專案參考、套件、DI、前後端 runtime 與外部服務相依。
