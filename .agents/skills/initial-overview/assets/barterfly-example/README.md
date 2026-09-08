# Barterfly

Barterfly 是一個服務交換平台。使用者可以作為 Giver 發布服務，也可以作為 Taker 接案並依任務進度完成交換。系統支援任務制與集點制，並透過 SignalR 提供交換狀態即時同步。

## 技術組成

- 後端：.NET 8、ASP.NET Core Web API、SignalR、JSON 檔案儲存
- 前端：Vue 3、TypeScript、Vite、Vue Router、Axios
- 測試：xUnit、Vitest、Playwright
- 部署：Docker 多階段建置，前端 build 後由 ASP.NET Core 同源服務

## 快速啟動

需求：

- .NET 8 SDK
- Node.js 20+
- npm

啟動後端：

```powershell
cd barterfly
dotnet run --project backend/Barterfly.API/Barterfly.API.csproj --urls http://localhost:5051
```

啟動前端：

```powershell
cd barterfly/frontend
npm install
npm run dev -- --host localhost --port 5173
```

本機前端會透過 `frontend/vite.config.ts` 將 `/api`、`/images`、`/exchangeHub` 代理到 `http://localhost:5051`。

## 常用驗證

在 `barterfly/` 執行：

```powershell
dotnet build Barterfly.sln
dotnet test backend/tests/Barterfly.Unit.Tests/Barterfly.Unit.Tests.csproj
dotnet test backend/tests/Barterfly.Integration.Tests/Barterfly.Integration.Tests.csproj
dotnet test backend/tests/Barterfly.E2E.Tests/Barterfly.E2E.Tests.csproj
```

在 `barterfly/frontend/` 執行：

```powershell
npm test
npm run build
npm run e2e
```

## 文件入口

- AI 與開發規範入口：[AGENTS.md](AGENTS.md)
- 架構總覽：[overview/01-architecture](overview/01-architecture)
- 開發規範：[overview/02-development-guidelines](overview/02-development-guidelines)
- API 與資料契約：[overview/03-contracts](overview/03-contracts)
- 部署與環境設定：[overview/04-deployment](overview/04-deployment)

## 貢獻方式

1. 開發前先閱讀 `AGENTS.md` 與相關 `overview/` 文件。
2. 依變更範圍補齊後端或前端測試。
3. 若變更 API、資料 schema、模組位置、啟動流程或部署設定，需同步更新對應 `overview/` 文件。
4. 不提交正式密鑰、正式 Google Client ID、正式 JWT Secret 或正式資料檔。
5. PR 或交付說明需包含修改摘要、主要檔案、驗證結果與文件更新狀態。
