# 檔案放置規範

新增或移動檔案前，先對照 `overview/01-architecture/04-module-map.md`，優先放進既有模組。

## 後端

| 類型 | 放置位置 |
|---|---|
| Host、DI、middleware pipeline | `backend/Barterfly.API/Program.cs` |
| Controller | `backend/Barterfly.API/Controllers` |
| Middleware | `backend/Barterfly.API/Middleware` |
| Filter | `backend/Barterfly.API/Filters` |
| SignalR Hub | `backend/Barterfly.API/Hubs` |
| API 層 SignalR 推送實作 | `backend/Barterfly.API/Services` |
| Application use case | `backend/Barterfly.Application/Services` |
| Request/response DTO | `backend/Barterfly.Application/DTOs` |
| Application interface | `backend/Barterfly.Application/Interfaces` |
| Entity mapping | `backend/Barterfly.Application/Mapping` |
| Application exception | `backend/Barterfly.Application/Exceptions` |
| Domain entity | `backend/Barterfly.Domain/Entities` |
| Domain enum | `backend/Barterfly.Domain/Enums` |
| Repository interface | `backend/Barterfly.Domain/Interfaces` |
| JSON repository | `backend/Barterfly.Infrastructure/Repositories` |
| JWT、Google token 等外部服務 | `backend/Barterfly.Infrastructure/Services` |

## 前端

| 類型 | 放置位置 |
|---|---|
| Vue app bootstrap | `frontend/src/main.ts` |
| App shell | `frontend/src/App.vue` |
| 路由 | `frontend/src/router` |
| REST API client 與型別 | `frontend/src/services` |
| 跨頁狀態、SignalR、API action | `frontend/src/composables` |
| 頁面 | `frontend/src/views` |
| 共用元件 | `frontend/src/components` |
| 靜態資源 | `frontend/src/assets` |
| 全域樣式 | `frontend/src/style.css` |

## 測試

| 類型 | 放置位置 |
|---|---|
| 後端 Domain/Application 單元測試 | `backend/tests/Barterfly.Unit.Tests` |
| 後端 Controller/Repository/Auth/SignalR 整合測試 | `backend/tests/Barterfly.Integration.Tests` |
| 後端跨 API 流程測試 | `backend/tests/Barterfly.E2E.Tests` |
| 前端 unit/integration 測試 | `frontend/src/**/__tests__` |
| 前端瀏覽器 E2E | `frontend/e2e` |

## 文件

| 類型 | 放置位置 |
|---|---|
| AI 入口 | `AGENTS.md` |
| 架構上下文 | `overview/01-architecture` |
| 開發規範 | `overview/02-development-guidelines` |
| API 與資料契約 | `overview/03-contracts` |
| 部署與環境設定 | `overview/04-deployment` |
| MVP 需求 | `docs/requirements` |
| SPEC/SDD | `docs/specs` |
| BDD | `docs/bdd` |
| TDD 與規劃交接紀錄 | `docs/tdd` |

## 新增檔案前檢查

1. 是否已有相近檔案或測試可擴充。
2. 是否需要同步更新 `overview/01-architecture/04-module-map.md`。
3. API DTO 是否同步更新前端 `frontend/src/services` 型別。
4. SignalR event 是否同步更新 `useExchangeHub.ts` 與相關測試。
5. 新增設定是否同步更新 `appsettings*.json` 與啟動流程說明。

## 禁止事項

- 不在 `Domain` 放 ASP.NET、JSON 檔案、圖片檔或環境設定讀寫。
- 不在 Controller 或 Vue view 直接處理資料儲存細節。
- 不新增與既有 `services`、`composables`、Application Service 重複的平行抽象。
- 不把測試資料、正式資料或密鑰放進文件與原始碼。
