# 分層邊界

本文件定義 Barterfly 現行後端與前端分層責任。任何功能開發若需要跨層，應維持本文件的依賴方向與責任分配。

實際專案參考、套件、DI 與外部服務相依請讀 `05-dependency-map.md`；本文件只描述分層責任與跨層邊界。

## 分層原則

- Domain 只放業務規則與狀態轉換，不依賴 HTTP、JSON、SignalR、Vue 或 DTO。
- Application 負責 use case 編排、權限檢查、Repository 協作、DTO mapping 與通知介面呼叫。
- Infrastructure 實作外部細節，例如 JSON 儲存、Google token 驗證、JWT。
- API 層只處理 HTTP、DI、Middleware、SignalR Hub、狀態碼轉換與靜態檔服務。
- Frontend 的 REST 呼叫集中在 `src/services`，跨頁狀態與副作用集中在 `src/composables`，頁面負責流程編排，元件負責呈現與事件。

## 後端分層

### Barterfly.Domain

位置：`backend/Barterfly.Domain`

責任：

- 定義核心 Entity：`User`、`Service`、`ServiceTask`、`Exchange`、`StepResult`。
- 定義核心 Enum：`UserStatus`、`ServiceStatus`、`ServiceMode`、`ExchangeStatus`、`TaskStatus`。
- 定義 Repository interface：`IUserRepository`、`IServiceRepository`、`IExchangeRepository`。
- 保有業務不可變規則與狀態轉換規則。

可做：

- 驗證標題、點數、step number 等領域必填或範圍規則。
- 控制服務生命週期，例如 `List`、`Delist`、`Archive`、`Restart`。
- 控制交換生命週期，例如 `SubmitStep`、`ApproveStep`、`Deliver`、`ConfirmReceipt`、`Release`。
- 計算 `EarnedPoints` 與 `Progress`。

不可做：

- 不讀寫 JSON 檔、圖片檔或環境變數。
- 不引用 ASP.NET Core、SignalR、DTO、Controller、Vue、Axios。
- 不決定 HTTP status code。
- 不查詢外部 Google API。

### Barterfly.Application

位置：`backend/Barterfly.Application`

責任：

- 編排 use case：`AuthService`、`ServiceApplicationService`、`ExchangeApplicationService`。
- 定義 API DTO 與應用層例外。
- 呼叫 Repository interface 載入與儲存聚合。
- 做使用者授權檢查，例如 Service owner、assigned Taker。
- 做 Entity 到 Response DTO 的 mapping。
- 透過 `IExchangeNotificationService` 發送即時通知。

可做：

- 將 Domain 的 `ArgumentException` 或 `InvalidOperationException` 轉成應用層 `BadRequestException`。
- 在同一 use case 中協調 Service 與 Exchange，例如接案時建立 Exchange 並把 Service 改為 `InProgress`。
- 在集點制進行中新增 Task 時，同步新增 Exchange 的 `StepResult`。
- 依使用者 id 過濾 Giver 或 Taker 資料。

不可做：

- 不直接處理 HTTP request/response 物件。
- 不決定路由。
- 不直接依賴 Infrastructure 具體類別。
- 不把前端顯示狀態寫入 Domain Entity。

現況例外：

- `ImageService` 位於 Application 專案，但含檔案系統操作。新功能仍需透過 `IImageService` 使用，不要把檔案操作擴散到 Controller 或 Domain。若後續整理架構，可考慮移入 Infrastructure。

### Barterfly.Infrastructure

位置：`backend/Barterfly.Infrastructure`

責任：

- 實作 Repository interface。
- 實作 JWT 產生與驗證。
- 實作 Google ID token 驗證。
- 封裝外部 SDK 或儲存細節。

可做：

- `JsonServiceRepository`、`JsonExchangeRepository`、`JsonUserRepository` 讀寫 JSON 檔。
- 使用 `SemaphoreSlim` 降低同 process 寫入競態。
- 使用 `Google.Apis.Auth` 驗證正式 Google ID token。
- 在測試 client id 下走 mock token 規則。

不可做：

- 不承載 Service 或 Exchange 的業務狀態規則。
- 不知道 Controller route 或前端畫面。
- 不直接呼叫 SignalR Hub。

### Barterfly.API

位置：`backend/Barterfly.API`

責任：

- 設定 DI、CORS、Swagger、靜態檔、SPA fallback、SignalR。
- 提供 HTTP Controller。
- 提供 `AuthenticationMiddleware` 與 `RequireAuthenticatedUserAttribute`。
- 提供 `ExchangeHub` 與 `ExchangeNotificationService`。
- 將應用層例外轉成 HTTP status code。

可做：

- 從 `HttpContext.Items["UserId"]` 取得已驗證使用者。
- 為 `/exchangeHub` 從 query string `access_token` 補 Authorization header。
- 對 `/api` 與 `/exchangeHub` 套用 JWT 驗證。
- 服務 `/images` 與前端 build 後的 `wwwroot`。

不可做：

- 不直接改 Entity 狀態，必須呼叫 Application Service。
- 不直接讀寫 Repository，除非是測試或啟動初始化。
- 不把權限規則只放在前端。

## 前端分層

### services

位置：`frontend/src/services`

責任：

- 封裝 REST API 呼叫。
- 定義前端使用的 request/response TypeScript interface。
- `httpClient.ts` 統一處理 baseURL、Bearer token 與 401 登出導向。

不可做：

- 不直接操作 Vue 畫面狀態。
- 不在每個頁面各自組 Authorization header。

### composables

位置：`frontend/src/composables`

責任：

- `useAuth` 管理 JWT、current user、登入、註冊、登出、token 過期判斷。
- `useSignalR` 管理 HubConnection、重連、online/offline、連線狀態。
- `useExchangeHub` 封裝 Barterfly 的 SignalR 事件語意。
- `useApiAction` 管理 loading 與 apiError。
- `useDevice` 判斷行動裝置版面。

不可做：

- 不直接渲染 UI。
- 不把 API endpoint 字串散落到 composable，REST endpoint 仍以 services 為準。

### views

位置：`frontend/src/views`

責任：

- 頁面層流程編排與資料載入。
- 根據路由 query 做定位或切 tab。
- 註冊 SignalR 事件後重新載入資料。

主要頁面：

- `HomePage.vue`：登入後的 Giver/Taker 摘要。
- `GiverDashboard.vue`：Giver 服務管理、Task 管理、圖片、上架、封存、重啟、交付。
- `TakerBrowse.vue`：瀏覽服務、接案、我的案件、提交、釋出、點收。
- `ExchangeDetail.vue`：交換細節頁，目前偏測試與舊流程輔助。
- `LoginPage.vue`、`RegisterPage.vue`：Google 登入與首次註冊。

不可做：

- 不直接用 `fetch` 或 `axios` 呼叫 API，應透過 services。
- 不把 Domain 狀態轉換規則寫死為唯一真相，後端仍是權威。

### components

位置：`frontend/src/components`

責任：

- 呈現 Service、Task、Progress、Error、Google button、動畫等可重用 UI。
- 透過 props 接資料，透過 emit 回報事件。

不可做：

- 不直接呼叫 API。
- 不直接修改 router 或 auth state，除非元件本身職責就是登入按鈕並以事件通知外層。

## 認證邊界

- 前端 token key 為 `jwt_token`，目前保存在 `localStorage`。
- `current_user` 是前端快取，用於刷新前先顯示暱稱。
- 後端 JWT subject 是 `UserId`。
- `AuthenticationMiddleware` 驗證 token、查詢使用者、拒絕 disabled user。
- `RequireAuthenticatedUserAttribute` 確保 action 執行前已有 `UserId`。
- `/api/auth/google` 與 `/api/auth/register` 是匿名入口。
- `GET /api/services?status=Listed` 可匿名瀏覽，其他 services list 需要登入。

## 即時同步邊界

- SignalR 只傳狀態變更通知，不作為資料權威來源。
- 後端事件由 Application Service 觸發，API Controller 不應自行發通知。
- Hub 連線加入 `user:{userId}` 群組，只推給相關 Giver 或 Taker。
- 前端收到 `ExchangeStatusChanged` 後應重新呼叫 REST API 取得最新 Service/Exchange。

## 判斷準則

新增或修改功能時，用下列問題判斷放置位置：

| 問題 | 放置位置 |
|---|---|
| 是否是 Service/Exchange/User 的不可變規則或狀態轉換？ | Domain |
| 是否需要協調多個 Repository、做授權、發通知？ | Application |
| 是否涉及 JSON、Google SDK、JWT、檔案系統？ | Infrastructure 或現有抽象 |
| 是否處理 HTTP route、status code、middleware、hub route？ | API |
| 是否新增 REST endpoint client 或 DTO 型別？ | Frontend services |
| 是否是跨頁登入、SignalR、loading/error 狀態？ | Frontend composables |
| 是否是頁面資料載入與使用者操作流程？ | Frontend views |
| 是否是可重用畫面片段？ | Frontend components |
