# 資料儲存契約

本文件記錄 Barterfly 目前 JSON 檔案儲存契約。實作來源以 Domain Entity、JSON Repository、`Program.cs` 與 `ImageService` 為準。

## 參考程式

- Entity：`backend/Barterfly.Domain/Entities`
- Enum：`backend/Barterfly.Domain/Enums`
- Repository：`backend/Barterfly.Infrastructure/Repositories`
- 儲存路徑設定：`backend/Barterfly.API/Program.cs`
- 圖片服務：`backend/Barterfly.Application/Services/ImageService.cs`

## 儲存位置

| 資料 | 預設路徑 | 設定來源 |
|---|---|---|
| Users | `{DataStorage:Path}/users.json` | `JsonUserRepository` |
| Services | `{DataStorage:Path}/services.json` | `JsonServiceRepository` |
| Exchanges | `{DataStorage:Path}/exchanges.json` | `JsonExchangeRepository` |
| Images | `{DataStorage:Path}/images` | `ImageService` |

- `DataStorage:Path` 未設定時，使用 `backend/Barterfly.API/data`。
- Staging 目前設定為 `/app/data`。
- JSON 序列化使用 camelCase、縮排輸出、enum 字串。
- Repository 寫入時先寫 `.tmp` 檔再覆蓋正式檔。

## Users Schema

檔案：`users.json`

```ts
type User = {
  userId: string
  googleId: string
  email: string
  nickname: string
  avatarUrl: string | null
  status: 'Active' | 'Disabled'
  createdAt: string
  lastLoginAt: string
}
```

維護規則：

- `googleId` 是 Google 帳號查詢鍵。
- `nickname`、`email`、`googleId` 建立時不可空白。
- 登入成功會更新 `lastLoginAt`。
- `status = Disabled` 時不可登入。

## Services Schema

檔案：`services.json`

```ts
type Service = {
  serviceId: string
  giverId: string
  title: string
  description: string
  imagePaths: string[]
  status: 'Draft' | 'Listed' | 'InProgress' | 'Completed' | 'Delisted' | 'Archived'
  tasks: ServiceTask[]
  serviceMode: 'Task' | 'Points'
  requiredPoints: number | null
  createdAt: string
  updatedAt: string
}

type ServiceTask = {
  taskId: string
  stepNumber: number
  title: string
  description: string
  points: number
}
```

維護規則：

- `Task` 模式下 `requiredPoints` 應為 `null`，每個 task 的 `points` 對外視為 `1`。
- `Points` 模式下 `requiredPoints` 必須大於 `0`，task `points` 必須大於 `0`。
- `ServiceTask` 不儲存 status；API response 的 task status 目前由 mapping 固定為 `Pending`。
- `imagePaths` 儲存格式為 `images/{fileName}`。

## Exchanges Schema

檔案：`exchanges.json`

```ts
type Exchange = {
  exchangeId: string
  serviceId: string
  takerId: string
  status: 'Active' | 'Released' | 'Completed' | 'Delivered' | 'ReceiptConfirmed'
  currentStep: number
  totalSteps: number
  stepResults: StepResult[]
  acceptedAt: string
  completedAt: string | null
  requiredPoints: number | null
}

type StepResult = {
  stepNumber: number
  note: string | null
  submittedAt: string | null
  approvedAt: string | null
  points: number
}
```

維護規則：

- `StepResult.status` 不儲存，由 `submittedAt`、`approvedAt` 推導。
- `progress` 不儲存，由 `Exchange.Progress` 計算。
- `earnedPoints` 不儲存，由已審核 step 的 `points` 加總。
- `GetActiveByServiceIdAsync` 目前回傳第一筆 `status != Released` 的 exchange，不只 `Active`。

## Images Contract

| 項目 | 契約 |
|---|---|
| 允許副檔名 | `.jpg`、`.jpeg`、`.png`、`.webp` |
| 大小限制 | 5MB |
| 儲存檔名 | `{Guid}{extension}` |
| 儲存路徑 | `{DataStorage:Path}/images/{Guid}{extension}` |
| API 回傳 path | `images/{Guid}{extension}` |
| 靜態檔 URL | `/images/{Guid}{extension}` |

## Enum 值

| Enum | 值 |
|---|---|
| `UserStatus` | `Active`、`Disabled` |
| `ServiceMode` | `Task`、`Points` |
| `ServiceStatus` | `Draft`、`Listed`、`InProgress`、`Completed`、`Delisted`、`Archived` |
| `ExchangeStatus` | `Active`、`Released`、`Completed`、`Delivered`、`ReceiptConfirmed` |
| `TaskStatus` | `Pending`、`Submitted`、`Approved` |

## 設定契約

| Key | 用途 |
|---|---|
| `DataStorage:Path` | JSON 與圖片儲存根目錄 |
| `Jwt:SecretKey` | JWT 簽章密鑰 |
| `Jwt:Issuer` | JWT issuer，預設 `Barterfly` |
| `Jwt:Audience` | JWT audience，預設 `Barterfly` |
| `Jwt:ExpirationDays` | JWT 過期天數，預設 `30` |
| `Google:ClientId` | Google token 驗證用 client id |
| `Cors:AllowedOrigins` | 前端來源白名單 |

## 維護規則

- 修改 Entity 可序列化欄位時，同步更新本文件、Repository 測試與 API response DTO。
- 新增 enum 值時，同步更新前端型別、顯示邏輯與測試。
- 修改圖片限制時，同步更新 `ImageService`、前端上傳驗證與本文件。
- 不在 JSON 檔案中儲存衍生欄位；衍生值由 Domain 或 mapping 計算。
