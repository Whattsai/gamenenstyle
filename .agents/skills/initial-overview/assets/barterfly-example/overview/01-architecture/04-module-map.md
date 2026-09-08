# 模組對照

本文件從程式面描述 Barterfly 的模組位置與責任，協助 AI 快速定位要讀取或修改的檔案。此處不列 API route endpoint，僅保留程式面模組對照。

## 後端專案模組

```text
backend/
  Barterfly.API/
  Barterfly.Application/
  Barterfly.Domain/
  Barterfly.Infrastructure/
  tests/
```

| 專案 | 主要責任 | 優先閱讀檔案 |
|---|---|---|
| `Barterfly.API` | ASP.NET Core host、Controller、Middleware、SignalR Hub、DI、靜態檔服務 | `Program.cs` |
| `Barterfly.Application` | Use case 編排、DTO、mapping、應用層例外、通知介面 | `Services/*.cs`、`DTOs/*.cs` |
| `Barterfly.Domain` | Entity、Enum、Repository interface、核心狀態規則 | `Entities/*.cs`、`Enums/*.cs`、`Interfaces/*.cs` |
| `Barterfly.Infrastructure` | Repository 實作、JWT、Google token 驗證 | `Repositories/*.cs`、`Services/*.cs` |
| `backend/tests` | 後端單元、整合與 E2E 測試 | 依變更層級選擇測試專案 |

## 後端 API 層模組

| 模組 | 位置 | 程式責任 |
|---|---|---|
| Host 啟動 | `backend/Barterfly.API/Program.cs` | 註冊 DI、middleware、SignalR、Controller、靜態檔與 SPA fallback |
| Auth Controller | `backend/Barterfly.API/Controllers/AuthController.cs` | 將登入與使用者查詢 HTTP request 轉交給 `IAuthService` |
| Services Controller | `backend/Barterfly.API/Controllers/ServicesController.cs` | 將服務管理 HTTP request 轉交給 `ServiceApplicationService` |
| Exchanges Controller | `backend/Barterfly.API/Controllers/ExchangesController.cs` | 將交換與任務進度 HTTP request 轉交給 `ExchangeApplicationService` |
| Authentication Middleware | `backend/Barterfly.API/Middleware/AuthenticationMiddleware.cs` | 驗證 JWT、查詢使用者、注入目前使用者識別碼 |
| Auth Filter | `backend/Barterfly.API/Filters/RequireAuthenticatedUserAttribute.cs` | 在 action 執行前確認 request 已完成驗證 |
| HttpContext Extension | `backend/Barterfly.API/Extensions/HttpContextAuthExtensions.cs` | 封裝目前使用者識別碼讀取方式 |
| Exchange Hub | `backend/Barterfly.API/Hubs/ExchangeHub.cs` | SignalR 連線群組管理 |
| Exchange Notification | `backend/Barterfly.API/Services/ExchangeNotificationService.cs` | 將應用層通知送到 SignalR group |

## 後端 Application 模組

| 模組 | 位置 | 程式責任 |
|---|---|---|
| Auth use case | `backend/Barterfly.Application/Services/AuthService.cs` | Google 登入結果處理、註冊、JWT 簽發、目前使用者查詢 |
| Service use case | `backend/Barterfly.Application/Services/ServiceApplicationService.cs` | Service 相關 use case 編排、owner 檢查、圖片與 Task 操作 |
| Exchange use case | `backend/Barterfly.Application/Services/ExchangeApplicationService.cs` | Exchange 相關 use case 編排、Taker/Giver 授權與通知 |
| Image service | `backend/Barterfly.Application/Services/ImageService.cs` | 圖片驗證、儲存與刪除的現有抽象實作 |
| DTO | `backend/Barterfly.Application/DTOs/*.cs` | 後端對外 request/response 與 SignalR notification shape |
| Interfaces | `backend/Barterfly.Application/Interfaces/*.cs` | JWT、Google token、Image、通知等應用層依賴抽象 |
| Mapping | `backend/Barterfly.Application/Mapping/MappingExtensions.cs` | Domain Entity 到 response DTO 的轉換 |
| Exceptions | `backend/Barterfly.Application/Exceptions/*.cs` | 應用層錯誤類型 |

## 後端 Domain 模組

| 模組 | 位置 | 程式責任 |
|---|---|---|
| User | `backend/Barterfly.Domain/Entities/User.cs` | 使用者資料與帳號狀態 |
| Service | `backend/Barterfly.Domain/Entities/Service.cs` | Giver 服務生命週期、任務與服務模式 |
| ServiceTask | `backend/Barterfly.Domain/Entities/ServiceTask.cs` | 單一任務定義、step number 與 points |
| Exchange | `backend/Barterfly.Domain/Entities/Exchange.cs` | Taker 接案後的交換狀態、進度與交付流程 |
| StepResult | `backend/Barterfly.Domain/Entities/StepResult.cs` | 單一步驟的提交、審核與狀態推導 |
| Enums | `backend/Barterfly.Domain/Enums/*.cs` | User、Service、Exchange、Task、ServiceMode 狀態枚舉 |
| Repository interfaces | `backend/Barterfly.Domain/Interfaces/*.cs` | Domain 對儲存能力的抽象 |

## 後端 Infrastructure 模組

| 模組 | 位置 | 程式責任 |
|---|---|---|
| JsonUserRepository | `backend/Barterfly.Infrastructure/Repositories/JsonUserRepository.cs` | User 儲存實作 |
| JsonServiceRepository | `backend/Barterfly.Infrastructure/Repositories/JsonServiceRepository.cs` | Service 儲存實作 |
| JsonExchangeRepository | `backend/Barterfly.Infrastructure/Repositories/JsonExchangeRepository.cs` | Exchange 儲存實作 |
| JwtTokenService | `backend/Barterfly.Infrastructure/Services/JwtTokenService.cs` | JWT 產生與驗證 |
| GoogleTokenValidator | `backend/Barterfly.Infrastructure/Services/GoogleTokenValidator.cs` | Google token 驗證與測試模式 token 規則 |

## 前端模組

```text
frontend/src/
  main.ts
  App.vue
  router/
  services/
  composables/
  views/
  components/
```

| 模組 | 位置 | 程式責任 |
|---|---|---|
| Bootstrap | `frontend/src/main.ts` | 初始化 HTTP interceptor、建立 Vue app、掛載 router |
| App Shell | `frontend/src/App.vue` | 應用殼層、導覽、登入後使用者狀態、SignalR 連線狀態 |
| Router | `frontend/src/router/index.ts` | 路由表與登入導向 |
| Auth API client | `frontend/src/services/authApi.ts` | Auth 相關 REST client 與型別 |
| Exchange API client | `frontend/src/services/exchangeApi.ts` | Service/Exchange REST client 與型別 |
| HTTP client | `frontend/src/services/httpClient.ts` | Axios instance、Bearer token、401 處理 |
| Auth composable | `frontend/src/composables/useAuth.ts` | JWT、current user、登入、註冊、登出 |
| SignalR composable | `frontend/src/composables/useSignalR.ts` | HubConnection、重連、連線狀態 |
| Exchange Hub composable | `frontend/src/composables/useExchangeHub.ts` | Exchange event 分派與 handler 註冊 |
| API action composable | `frontend/src/composables/useApiAction.ts` | loading 與 apiError 包裝 |
| Device composable | `frontend/src/composables/useDevice.ts` | 行動裝置判斷 |

## 前端頁面模組

| 頁面 | 位置 | 程式責任 |
|---|---|---|
| Home | `frontend/src/views/HomePage.vue` | 登入後 Giver/Taker 摘要與快速導覽 |
| GiverDashboard | `frontend/src/views/GiverDashboard.vue` | Giver 服務管理頁面 |
| TakerBrowse | `frontend/src/views/TakerBrowse.vue` | Taker 可接案服務與我的案件頁面 |
| ExchangeDetail | `frontend/src/views/ExchangeDetail.vue` | 單一 Exchange 細節頁 |
| LoginPage | `frontend/src/views/LoginPage.vue` | 登入頁 |
| RegisterPage | `frontend/src/views/RegisterPage.vue` | 首次註冊頁 |

## 前端元件模組

| 元件 | 位置 | 程式責任 |
|---|---|---|
| ServiceForm | `frontend/src/components/ServiceForm.vue` | 服務建立表單 |
| ServiceCard | `frontend/src/components/ServiceCard.vue` | 服務卡片與圖片呈現 |
| TaskList | `frontend/src/components/TaskList.vue` | 任務列表、提交、審核、編輯事件 |
| ProgressBar | `frontend/src/components/ProgressBar.vue` | 進度顯示 |
| ImageUploader | `frontend/src/components/ImageUploader.vue` | 圖片選取與上傳互動 |
| GoogleSignInButton | `frontend/src/components/GoogleSignInButton.vue` | Google 登入按鈕 |
| ApiErrorMessage | `frontend/src/components/ApiErrorMessage.vue` | API 錯誤訊息 |
| CelebrationAnimation | `frontend/src/components/CelebrationAnimation.vue` | 任務通過後的提示動畫 |

## 測試模組

| 測試層級 | 位置 | 使用時機 |
|---|---|---|
| 後端 Unit | `backend/tests/Barterfly.Unit.Tests` | Domain、Application、Middleware、Service 單元行為 |
| 後端 Integration | `backend/tests/Barterfly.Integration.Tests` | Controller、Repository、Auth、SignalR、CORS 等整合行為 |
| 後端 E2E | `backend/tests/Barterfly.E2E.Tests` | 跨 API 的完整後端流程 |
| 前端 Unit/Integration | `frontend/src/**/__tests__` | services、composables、router、components、views |
| 前端 Playwright | `frontend/e2e` | 瀏覽器端流程與即時同步 |

## 常見修改路徑

| 任務類型 | 建議閱讀順序 |
|---|---|
| 認證或登入問題 | `useAuth.ts` -> `authApi.ts` -> `AuthController.cs` -> `AuthService.cs` -> JWT/Google infrastructure |
| Giver 服務管理問題 | `GiverDashboard.vue` -> `exchangeApi.ts` -> `ServicesController.cs` -> `ServiceApplicationService.cs` -> `Service.cs` |
| Taker 接案或案件問題 | `TakerBrowse.vue` -> `exchangeApi.ts` -> `ExchangesController.cs` -> `ExchangeApplicationService.cs` -> `Exchange.cs` |
| 任務或進度問題 | `TaskList.vue` -> `ServiceTask.cs` / `StepResult.cs` -> `Service.cs` / `Exchange.cs` |
| 即時同步問題 | view handler -> `useExchangeHub.ts` -> `useSignalR.ts` -> `ExchangeNotificationService.cs` -> 呼叫通知的 Application Service |
| 前端 API 型別問題 | `exchangeApi.ts` / `authApi.ts` -> `Application/DTOs` -> `MappingExtensions.cs` |
| 儲存或外部服務問題 | Application Service -> Domain interface -> `Infrastructure/Repositories` 或 `Infrastructure/Services` |
| 套件、DI 或 runtime 相依變更 | `05-dependency-map.md` -> 專案檔/package 檔 -> `Program.cs` 或前端 client/proxy 設定 |
