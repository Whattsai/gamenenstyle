# 相依關係圖

本文件記錄 Barterfly 現行程式相依關係。AI 若要新增套件、專案參考、DI 註冊、外部服務、前端 API client 或 runtime 依賴，應先讀本文件，再回到對應程式入口確認細節。套件版本以專案檔與 lock file 為準，本文件只維護依賴目的與方向。

## 盤點來源

- `Barterfly.sln`
- `backend/**/*.csproj`
- `backend/Barterfly.API/Program.cs`
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/src/services/*`
- `frontend/src/composables/useSignalR.ts`
- `frontend/src/composables/useExchangeHub.ts`
- `Dockerfile`
- `backend/Barterfly.API/appsettings*.json`

## 後端專案參考

| 專案 | 內部參考 | 主要外部套件 | 說明 |
|---|---|---|---|
| `Barterfly.Domain` | 無 | 無 | 最底層核心規則，不依賴其他 Barterfly 專案 |
| `Barterfly.Application` | `Barterfly.Domain` | `Microsoft.Extensions.Logging.Abstractions` | Use case、DTO、例外、抽象介面與 mapping |
| `Barterfly.Infrastructure` | `Barterfly.Application`、`Barterfly.Domain` | `Google.Apis.Auth`、`System.IdentityModel.Tokens.Jwt` | 實作 Repository、Google token 驗證與 JWT |
| `Barterfly.API` | `Barterfly.Application`、`Barterfly.Infrastructure`、`Barterfly.Domain` | `Microsoft.AspNetCore.OpenApi`、`Swashbuckle.AspNetCore`、`System.IdentityModel.Tokens.Jwt` | Host、Controller、Middleware、SignalR、DI 組裝與靜態檔服務 |
| `Barterfly.Unit.Tests` | `Domain`、`Application`、`Infrastructure`、`API` | `xunit`、`FluentAssertions`、`Moq`、`coverlet.collector` | 單元測試 |
| `Barterfly.Integration.Tests` | `Domain`、`Application`、`Infrastructure`、`API` | `Microsoft.AspNetCore.Mvc.Testing`、`Microsoft.AspNetCore.TestHost`、`Microsoft.AspNetCore.SignalR.Client`、`xunit`、`FluentAssertions`、`Moq` | HTTP、DI、Repository、SignalR 整合測試 |
| `Barterfly.E2E.Tests` | `API`、`Barterfly.Integration.Tests` | `Microsoft.AspNetCore.Mvc.Testing`、`xunit`、`coverlet.collector` | 後端跨 API 流程測試 |

## 後端依賴方向

```text
Barterfly.Domain
  <- Barterfly.Application
  <- Barterfly.Infrastructure
  <- Barterfly.API
```

實際呼叫方向：

```text
Controller / Middleware / Hub
  -> Application Service
  -> Domain Entity / Repository interface
  -> Infrastructure Repository / external service
```

重要規則：

- `Domain` 不得依賴 `Application`、`Infrastructure`、`API`、HTTP、SignalR 或 DTO。
- `Application` 可依賴 `Domain` 與自身抽象介面，不直接依賴 Infrastructure 具體類別。
- `Infrastructure` 依賴 `Application` 抽象與 `Domain` interface/entity，負責外部細節實作。
- `API` 是組裝層，可同時參考各後端專案，但不應把業務狀態轉換寫在 Controller。
- `ImageService` 現況位於 `Application` 但含檔案系統操作；新增功能仍透過 `IImageService` 使用，不要擴散檔案依賴。

## DI 組裝相依

DI 入口：`backend/Barterfly.API/Program.cs`

| 抽象或服務 | 實作 | Lifetime | 依賴來源 |
|---|---|---|---|
| `IServiceRepository` | `JsonServiceRepository` | Singleton | `DataStorage:Path/services.json` |
| `IExchangeRepository` | `JsonExchangeRepository` | Singleton | `DataStorage:Path/exchanges.json` |
| `IUserRepository` | `JsonUserRepository` | Singleton | `DataStorage:Path/users.json` |
| `ServiceApplicationService` | 本身 | Scoped | Service/User/Exchange repository、`IImageService`、`IExchangeNotificationService`、logger |
| `ExchangeApplicationService` | 本身 | Scoped | Exchange/Service/User repository、`IExchangeNotificationService`、logger |
| `IAuthService` | `AuthService` | Scoped | `IUserRepository`、`IJwtTokenService`、`IGoogleTokenValidator` |
| `IExchangeNotificationService` | `ExchangeNotificationService` | Scoped | `IHubContext<ExchangeHub>`、logger |
| `IImageService` | `ImageService` | Singleton | `DataStorage:Path/images` |
| `IJwtTokenService` | `JwtTokenService` | Singleton | `Jwt` options |
| `IGoogleTokenValidator` | `GoogleTokenValidator` | Singleton | `Google:ClientId` |

## 後端通知相依

```text
ServiceApplicationService / ExchangeApplicationService
  -> IExchangeNotificationService
  -> ExchangeNotificationService
  -> IHubContext<ExchangeHub>
  -> Clients.Group("user:{targetUserId}")
  -> SendAsync("ExchangeStatusChanged", notification)
```

SignalR 是同步提示，不是資料權威來源。前端收到事件後仍需透過 REST API 重新載入資料。

## 前端套件相依

| 類型 | 套件 | 用途 |
|---|---|---|
| runtime | `vue` | Vue 3 app、reactivity、component |
| runtime | `vue-router` | SPA 路由與 auth guard |
| runtime | `axios` | REST API client |
| runtime | `@microsoft/signalr` | Exchange 即時同步 |
| dev/test | `vite`、`@vitejs/plugin-vue`、`typescript`、`vue-tsc` | 前端開發、型別檢查與 build |
| dev/test | `vitest`、`@vue/test-utils`、`@testing-library/vue`、`jsdom` | 前端單元與整合測試 |
| e2e | `@playwright/test` | 瀏覽器端 E2E |

## 前端模組相依

```text
main.ts
  -> setupHttpInterceptors
  -> router
  -> App.vue

App.vue / views
  -> composables
  -> services
  -> components

services
  -> httpClient
  -> axios
  -> /api

useExchangeHub
  -> useAuth
  -> useSignalR
  -> @microsoft/signalr
  -> /exchangeHub
```

前端開發伺服器透過 `frontend/vite.config.ts` 將 `/api`、`/images`、`/exchangeHub` 代理到 `http://localhost:5051`。

## Runtime 外部依賴

| 依賴 | 來源 | 用途 |
|---|---|---|
| Google ID token 驗證 | `Google.Apis.Auth`、`Google:ClientId` | 正式 Google 登入 token 驗證；測試 client id 或空值時使用 mock 規則 |
| JWT | `Jwt:SecretKey`、`Jwt:Issuer`、`Jwt:Audience`、`Jwt:ExpirationDays` | 平台登入狀態與 API/SignalR 驗證 |
| JSON 檔案儲存 | `DataStorage:Path` | `services.json`、`exchanges.json`、`users.json` |
| 圖片靜態檔 | `DataStorage:Path/images` | `/images` 靜態檔服務 |
| CORS | `Cors:AllowedOrigins` | 本機 Vite、preview 與 staging origin |
| Docker build | `node:20-alpine`、`.NET SDK 8.0`、`.NET ASP.NET runtime 8.0` | 前端 build、後端 publish、runtime image |
| Cloud Run runtime | `PORT`、`ASPNETCORE_URLS`、`ASPNETCORE_ENVIRONMENT=Staging` | 容器監聽與 staging 組態 |

## 變更同步規則

- 新增或移除後端專案參考時，同步更新本文件與 `02-layer-boundary.md`。
- 新增 NuGet 或 npm 套件時，同步更新本文件，並說明該套件服務的層級。
- 新增 DI 註冊或改變 lifetime 時，同步更新「DI 組裝相依」。
- 新增外部服務、儲存位置、代理路徑、Docker base image 或 runtime env 時，同步更新本文件與 `overview/04-deployment/`。
- 若依賴方向需要破例，交付時需說明原因、影響範圍與後續整理建議。
