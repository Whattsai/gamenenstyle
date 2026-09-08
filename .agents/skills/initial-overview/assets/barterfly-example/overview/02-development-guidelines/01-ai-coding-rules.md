# 程式實作規範

本文件依 Barterfly 現行前後端程式習慣，定義 AI 後續修改程式時應遵守的 coding rules。文件讀取順序與工作流請看 `AGENTS.md` 與 `03-ai-workflow-stages.md`。

## 必守規則

- 維持既有分層：`API` 接 HTTP、`Application` 編排 use case、`Domain` 放狀態規則、`Infrastructure` 實作儲存與外部服務。
- Controller 只做 request 轉接、目前使用者取得、HTTP 狀態碼轉換；不要把業務流程寫進 Controller。
- Domain entity 使用方法封裝狀態轉換，維持 `private set`、`JsonInclude`、`JsonConstructor` 的 JSON 儲存相容性。
- Application Service 負責 repository 查詢、owner/taker/giver 授權檢查、呼叫 Domain 方法、更新 repository、組 response DTO。
- DTO 與前端 `frontend/src/services` 型別必須同步，欄位命名維持前端 camelCase、後端 DTO 對應 JSON 輸出。
- 前端 API 呼叫只放 `frontend/src/services`，頁面與元件透過 service/composable 呼叫，不直接建立新的 Axios instance。
- SignalR 事件一律走 `IExchangeNotificationService`、`ExchangeNotificationService`、`ExchangeHub`、`useExchangeHub.ts`。
- 圖片與 JSON 路徑以 `DataStorage:Path`、`IImageService`、JSON repository 為準，不在 Controller 或 View 手動組儲存細節。

## 例外與錯誤

- Domain 驗證失敗維持丟 `ArgumentException` 或 `InvalidOperationException`。
- Application Service 將可預期錯誤轉為 `BadRequestException`、`ForbiddenException`、`NotFoundException`、`ConflictException`。
- Controller 捕捉應用層例外並回傳 `{ error = ex.Message }`，HTTP 狀態碼需符合既有慣例。
- 授權失敗優先在 Application Service 檢查 owner/taker/giver；Filter/Middleware 只負責登入身分。
- SignalR 通知失敗不得中斷主要交易流程，維持 `try/catch` + `ILogger.LogError`。
- 前端 401 維持由 `httpClient.ts` interceptor 清除 `jwt_token`、`current_user` 並導回 `/login`。

## 測試與文件

- Domain 狀態規則改動：先補 `backend/tests/Barterfly.Unit.Tests/Domain`。
- Application use case 改動：補 `backend/tests/Barterfly.Unit.Tests/Application` 或 `Services`。
- Controller、Middleware、Repository、SignalR 整合改動：補 `backend/tests/Barterfly.Integration.Tests`。
- 跨 API 完整流程：補 `backend/tests/Barterfly.E2E.Tests`。
- 前端 service、composable、router、component、view 改動：補鄰近 `__tests__`。
- 使用者跨頁流程或即時同步：補 `frontend/e2e` 或既有 Playwright 測試。
- 修改 API 欄位、狀態規則、SignalR event、儲存格式時，同步更新相關 overview 或 docs 文件。
- 每次需求開發完成後，都要依 `AGENTS.md` 的「Overview 文件同步規則」檢查並更新受影響的 `overview/` 文件。

## AI 實作要求

- 實作前輸出影響範圍與檔案修改計畫。
- 先找既有相同模式，再新增類別、方法或測試。
- 不任意新增抽象；只有跨多處重複或符合既有命名模式時才新增。
- 不重寫無關檔案、不格式化整個專案、不改動使用者未要求的資料檔。
- 交付時輸出修改摘要、主要檔案、測試結果、overview 文件更新結果與未驗證風險。

## 新增完整功能範例流程

假設要新增一個 Service/Exchange 相關功能，AI 應依此順序實作：

1. 檢查 `Domain/Entities` 是否已有相同狀態規則或方法可擴充。
2. 新增或調整 `Application/DTOs` request/response。
3. 在 `Domain` entity 或 enum 補核心規則，並先補 Domain 測試。
4. 在 `Application/Services` 編排 use case、授權檢查、repository 更新與 mapping。
5. 如需儲存查詢，先更新 `Domain/Interfaces`，再改 `Infrastructure/Repositories`。
6. 在 `API/Controllers` 新增 action，只做轉接與 HTTP 錯誤映射。
7. 若有即時同步，更新 notification DTO、service、hub handler 與前端 `useExchangeHub.ts`。
8. 在 `frontend/src/services` 更新 API function 與 TypeScript interface。
9. 在 `frontend/src/composables`、`views`、`components` 接上 UI 行為。
10. 補後端與前端測試，依範圍執行 build/test。

## 常見任務處理方式

### 新增 API 欄位

- 後端先改 `Application/DTOs` 與 `MappingExtensions.cs`。
- 前端同步改 `frontend/src/services/*.ts` interface。
- 檢查 view/component 是否有 null、optional、預設值處理。

### 新增服務狀態或交換狀態

- 優先檢查 `ServiceStatus`、`ExchangeStatus`、`TaskStatus`。
- 狀態轉換寫在 `Service`、`Exchange` 或 `StepResult` 方法中。
- 補 Domain 測試，再補 Application/Controller 測試。

### 新增圖片上傳或刪除行為

- 優先使用 `IImageService` 與 `ImageService`。
- Service 圖片路徑只透過 `Service.AddImagePaths`、`Service.RemoveImagePath` 更新。
- Controller 使用 `IFormFile` 轉成 stream tuple，不直接寫檔。

### 新增權限判斷

- API 登入身分由 `AuthenticationMiddleware` 與 `RequireAuthenticatedUserAttribute` 處理。
- 目前使用者透過 `HttpContext.GetCurrentUserId()` 取得。
- Giver/Taker/owner 權限放在 Application Service，不放前端或 Controller 當唯一防線。

### 新增 SignalR 事件

- 後端更新 `ExchangeNotification`、`IExchangeNotificationService`、`ExchangeNotificationService`。
- Application Service 在狀態更新成功後送通知，通知失敗只記錄 log。
- 前端更新 `useExchangeHub.ts` 的 known event 與 handler，並補 handler 測試。

### 修改 JSON 儲存格式

- 維持 entity 的 JSON 反序列化相容性。
- 檢查 `JsonUserRepository`、`JsonServiceRepository`、`JsonExchangeRepository`。
- 測試需涵蓋既有資料欄位缺失或新增欄位預設值。

## AI Review 重點

AI 檢查 PR 或變更時，優先看：

- 是否把業務規則寫進 Controller 或前端。
- Domain 狀態轉換是否有測試保護。
- API DTO 與前端 `services` 型別是否一致。
- Application Service 是否正確檢查 Giver/Taker/owner。
- Repository interface 與 JSON repository 是否同步。
- SignalR 事件是否前後端同步，通知失敗是否不影響主要流程。
- `Program.cs` DI、CORS、middleware、hub route 是否因新增服務而缺漏。
- `appsettings*.json` 是否誤提交敏感資訊。
- 圖片與 JSON 儲存路徑是否繞過 `DataStorage:Path`。
