# 程式執行流程

本文件描述 Barterfly 程式面的 runtime flow，作為 AI 閱讀實作時的執行脈絡。此處不展開使用者操作細節。

## 後端 Host 啟動流程

入口：`backend/Barterfly.API/Program.cs`

```text
WebApplication.CreateBuilder
  -> 讀取組態與資料路徑
  -> AddControllers / Swagger
  -> AddSignalR
  -> 註冊 Repository interface 的實作
  -> 註冊 Application Service
  -> 註冊 JWT、Google token、Image、SignalR notification 等服務
  -> 設定 CORS
  -> Build app
  -> 啟用 Swagger
  -> UseCors
  -> 初始化必要目錄與檔案
  -> 設定 SPA 入口 cache header
  -> UseStaticFiles
  -> UseWhen(/exchangeHub) 補 SignalR access_token
  -> UseWhen(/api) 套用 AuthenticationMiddleware
  -> UseWhen(/exchangeHub) 套用 AuthenticationMiddleware
  -> MapControllers
  -> MapHub<ExchangeHub>
  -> 非 Development 啟用 MapFallbackToFile
  -> Run
```

AI 閱讀後端啟動流程時，先看 `Program.cs` 的註冊順序，再對照要追的 Controller、Application Service 與 Repository。

## 後端 HTTP Request 執行流程

一般 API request 會經過下列管線：

```text
Client
  -> ASP.NET Core middleware pipeline
  -> CORS
  -> AuthenticationMiddleware
  -> RequireAuthenticatedUserAttribute
  -> Controller action
  -> Application Service
  -> Domain Entity / Repository interface
  -> Infrastructure Repository / external service
  -> Application mapping
  -> Controller response
```

各層閱讀重點：

- `AuthenticationMiddleware`：驗證 Bearer token，查詢使用者，將 `UserId` 放入 `HttpContext.Items`。
- `RequireAuthenticatedUserAttribute`：確保 Controller action 執行時已有驗證使用者。
- Controller：處理 HTTP request/response、status code 與例外轉換。
- Application Service：編排 use case、授權檢查、Repository 協作與通知。
- Domain Entity：承載狀態轉換與核心規則。
- Infrastructure：提供 Repository、JWT、Google token 等外部細節。

## 後端 SignalR 執行流程

SignalR 連線與通知分成兩段：連線建立與事件推送。

### 連線建立

```text
Frontend useSignalR
  -> HubConnectionBuilder.withUrl('/exchangeHub', accessTokenFactory)
  -> 後端 /exchangeHub middleware 讀取 access_token
  -> AuthenticationMiddleware 驗證 token
  -> ExchangeHub.OnConnectedAsync
  -> Groups.AddToGroupAsync("user:{userId}")
```

### 事件推送

```text
Application Service
  -> IExchangeNotificationService
  -> ExchangeNotificationService
  -> IHubContext<ExchangeHub>
  -> Clients.Group("user:{targetUserId}")
  -> SendAsync("ExchangeStatusChanged", notification)
  -> frontend useExchangeHub handler
  -> view reload REST data
```

AI 追即時同步問題時，先確認 Application Service 是否有呼叫 `IExchangeNotificationService`，再確認 `ExchangeNotificationService` 的 event type 與前端 `useExchangeHub` handler 是否一致。

## 前端啟動流程

入口：`frontend/src/main.ts`

```text
main.ts
  -> import style.css
  -> setupHttpInterceptors()
  -> createApp(App)
  -> use(router)
  -> mount('#app')
```

`App.vue` 掛載後會依登入狀態載入目前使用者並啟動 SignalR：

```text
App.vue setup
  -> useRoute / useRouter
  -> useAuth
  -> useDevice
  -> useExchangeHub
  -> computed theme / navbar height
  -> onMounted
      -> fetchMe()
      -> start SignalR
  -> RouterView render current page
```

## 前端 Router 執行流程

入口：`frontend/src/router/index.ts`

```text
createRouter
  -> routes
  -> beforeEach(authGuard)
      -> 讀取 localStorage jwt_token
      -> 解析 JWT payload exp
      -> 未登入或過期導向 /login
      -> 已登入進入 /login 則導向 /
      -> 其他情況放行
```

頁面載入後，資料取得通常由 view 的 `onMounted` 或 SignalR handler 呼叫 `loadData()` 完成。

## 前端 REST Action 執行流程

```text
View user action
  -> view handler
  -> useApiAction.execute
  -> service function in src/services
  -> httpClient
  -> Axios request interceptor 加 Bearer token
  -> backend API
  -> Axios response interceptor
      -> 401 時清除 localStorage 並導向 /login
  -> view 更新 local state
```

AI 追前端 API 問題時，先從 view handler 找到 `src/services` 的 function，再檢查 `httpClient.ts` 與後端 Controller。

## 前端 SignalR Action 執行流程

```text
View setup
  -> useExchangeHub()
  -> 註冊 onStepSubmitted / onStepApproved / onAnyChange 等 handler
  -> SignalR 收到 ExchangeStatusChanged
  -> useExchangeHub 依 eventType 分派
  -> view handler 呼叫 loadData()
  -> REST API 重新取得資料
```

SignalR event 本身只是一個同步提示，畫面資料仍以 REST 重新取得後的結果為準。

## 測試執行流程

後端測試：

```text
dotnet test
  -> Unit Tests
      -> Domain / Application / Middleware / Service
  -> Integration Tests
      -> WebApplicationFactory<Program>
      -> Test DI replacement
      -> HttpClient request
  -> E2E Tests
      -> 跨 API 流程驗證
```

前端測試：

```text
npm test
  -> Vitest
      -> services / composables / router / components / views

npm run e2e
  -> Playwright
      -> 啟動後端 webServer
      -> 啟動 Vite dev server
      -> browser flow
```

## Docker 執行流程

入口：`Dockerfile`

```text
frontend-build stage
  -> npm ci
  -> npm run build

backend-build stage
  -> dotnet restore
  -> dotnet publish

runtime stage
  -> copy backend publish
  -> copy frontend dist to wwwroot
  -> set ASPNETCORE_URLS
  -> dotnet Barterfly.API.dll
```

容器執行時是同一個 ASP.NET Core process 同時服務 API、SignalR、圖片靜態檔與前端 SPA。
