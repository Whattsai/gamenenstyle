# 部署流程檢查表

本文件是 Barterfly 部署前後的檢查依據。正式部署前仍需人工確認環境、版本、權限、密鑰與回滾條件。

## 參考程式與文件

- 容器建置：`Dockerfile`
- Docker 排除規則：`.dockerignore`
- 後端設定：`backend/Barterfly.API/appsettings.json`、`appsettings.Staging.json`
- 前端設定：`frontend/.env.example`、`frontend/.env.staging`、`frontend/vite.config.ts`
- API 契約：`overview/03-contracts/01-api-contracts.md`
- 資料契約：`overview/03-contracts/02-data-contracts.md`

## 現行部署模型

| 項目 | 現況 |
|---|---|
| Runtime | ASP.NET Core `.NET 8` |
| 前端 | Vue/Vite build 後複製到 `wwwroot` |
| API | 同源 `/api` |
| SignalR | 同源 `/exchangeHub`，需 WebSocket |
| 圖片 | `/images` 靜態檔，來源為 `{DataStorage:Path}/images` |
| 資料 | JSON 檔案：`users.json`、`services.json`、`exchanges.json` |
| Staging 環境 | `ASPNETCORE_ENVIRONMENT=Staging` |
| 容器 port | Dockerfile 預設監聽 `8080`；Cloud Run 應使用 `8080` |

## Pre-Deploy

- [ ] 確認目標環境：Local Docker / Staging / Production。
- [ ] 確認分支、commit、版本與本次變更範圍。
- [ ] 執行或記錄未執行原因：
  - `dotnet build Barterfly.sln`
  - `dotnet test backend/tests/Barterfly.Unit.Tests/Barterfly.Unit.Tests.csproj`
  - `dotnet test backend/tests/Barterfly.Integration.Tests/Barterfly.Integration.Tests.csproj`
  - `dotnet test backend/tests/Barterfly.E2E.Tests/Barterfly.E2E.Tests.csproj`
  - `npm test`
  - `npm run build`
- [ ] 確認前端 `VITE_GOOGLE_CLIENT_ID` 會在 build 時注入。
- [ ] 確認後端必要設定已透過環境變數提供，參考 `02-environment-variables-template.md`。
- [ ] 確認 `Jwt__SecretKey` 不為空且至少 32 字元。
- [ ] 確認 `Google__ClientId` 與前端 `VITE_GOOGLE_CLIENT_ID` 對應同一組 OAuth client。
- [ ] 確認 `Cors__AllowedOrigins__0` 包含實際前端 origin。
- [ ] 確認 `DataStorage__Path` 指向持久化路徑；Cloud Run 建議掛載到 `/app/data`。
- [ ] 確認 JSON 檔案與圖片資料已備份。
- [ ] 確認 Cloud Run 或容器平台允許 WebSocket。
- [ ] 確認 JSON 檔案儲存限制：多實例可能造成一致性風險；Cloud Run 建議 `max-instances=1`。
- [ ] 確認沒有提交正式密鑰、正式資料檔或服務帳號 JSON。

## Build

在 `barterfly/` 目錄執行本地容器建置：

```powershell
docker build -t barterfly-app:local .
```

容器建置流程：

1. `node:20-alpine` 執行 `npm ci` 與 `npm run build`。
2. 若存在 `frontend/.env.staging`，Docker build 會複製為 `.env.production`。
3. `.NET SDK 8.0` 執行 `dotnet restore` 與 `dotnet publish`。
4. Runtime image 使用 `mcr.microsoft.com/dotnet/aspnet:8.0`。
5. 前端 `dist` 複製到 `/app/wwwroot`。
6. 建立 `/app/data/images`。

## Deploy

- [ ] 容器 image 已成功 build。
- [ ] 目標環境變數已設定。
- [ ] 若使用 Cloud Run，確認：
  - [ ] service 開放未驗證存取，讓 SPA、公開 API 與 Swagger 可被瀏覽器存取。
  - [ ] 使用 gen2 或支援 WebSocket 的執行環境。
  - [ ] Cloud Run container port 與容器監聽 port 均為 `8080`。
  - [ ] 資料 bucket 或 volume 掛載到 `DataStorage__Path`。
  - [ ] instance 上限符合 JSON 儲存限制。
- [ ] 若使用 GitHub Actions，確認實際 workflow 存在並會產生或提供 `frontend/.env.staging`。
- [ ] 部署紀錄包含環境、image tag、commit、操作者與時間。

## Post-Deploy

以實際部署 URL 取代 `{baseUrl}`：

```powershell
curl {baseUrl}/api/services?status=Listed
curl -i {baseUrl}/api/auth/me
curl -i {baseUrl}/swagger
```

預期：

- `GET /api/services?status=Listed` 回 `200`。
- 未帶 token 的 `GET /api/auth/me` 回 `401`。
- Staging 的 `/swagger` 可開啟；Production 若關閉 Swagger，需記錄為預期行為。
- SPA 首頁與 Vue Router 子路由可重新整理。
- `/images/{fileName}` 可讀取已存在圖片。
- Google 登入可取得 token；測試模式需確認使用 `valid-*` token 的行為。
- SignalR `/exchangeHub` 可建立連線並在狀態變更後收到 `ExchangeStatusChanged`。

## Rollback

- [ ] 記錄上一版可用 image tag。
- [ ] 確認 rollback 不需要 JSON schema downgrade。
- [ ] 若本次修改資料格式，先備份 `users.json`、`services.json`、`exchanges.json` 與 `images/`。
- [ ] 回滾後重新驗證公開服務列表、登入、建立服務、接案與 SignalR 同步。

## AI 部署回報格式

- 目標環境：
- Commit / image tag：
- Build 結果：
- 測試結果：
- 環境變數變更：
- 資料備份狀態：
- 部署後驗證：
- 回滾條件：
- 需人工確認：
