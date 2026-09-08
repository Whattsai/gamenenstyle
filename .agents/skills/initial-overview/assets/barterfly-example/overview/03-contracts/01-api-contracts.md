# API 契約

本文件記錄 Barterfly 現行 HTTP API 與 SignalR 對外契約。實作來源以 Controller、Application DTO 與前端 service 型別為準。

## 參考程式

- 後端入口：`backend/Barterfly.API/Controllers`
- 後端 DTO：`backend/Barterfly.Application/DTOs`
- 後端 mapping：`backend/Barterfly.Application/Mapping/MappingExtensions.cs`
- 前端 API client：`frontend/src/services/authApi.ts`、`frontend/src/services/exchangeApi.ts`
- HTTP base：後端 `/api`，前端 `httpClient` baseURL 為 `/api`

## 共用規則

- JSON 欄位使用 camelCase。
- Enum 對外以字串表示。
- 日期時間為 .NET `DateTime` JSON 格式，來源皆為 `DateTime.UtcNow`。
- 認證 header：`Authorization: Bearer {jwt}`。
- 前端 token 儲存在 `localStorage.jwt_token`。
- 標準錯誤回應：`{ "error": "message" }`。

## Auth API

| Method | Path | Auth | Request | Success |
|---|---|---|---|---|
| POST | `/api/auth/google` | No | `GoogleLoginRequest` | `200 AuthResponse` 或 `200 RegistrationRequiredResponse` |
| POST | `/api/auth/register` | No | `RegisterRequest` | `201 AuthResponse` |
| GET | `/api/auth/me` | Yes | none | `200 UserResponse` |

### Auth DTO

```ts
type GoogleLoginRequest = {
  googleIdToken: string
}

type RegisterRequest = {
  googleId: string
  email: string
  nickname: string
  avatarUrl?: string | null
}

type AuthResponse = {
  token: string
  user: UserResponse
}

type RegistrationRequiredResponse = {
  needsRegistration: true
  googleId: string
  email: string
  name: string
  avatarUrl: string | null
}

type UserResponse = {
  userId: string
  email: string
  nickname: string
  avatarUrl: string | null
  status: 'Active' | 'Disabled'
  createdAt: string
  lastLoginAt: string
}
```

## Service API

| Method | Path | Auth | Request | Success |
|---|---|---|---|---|
| GET | `/api/services?status=Listed` | No | query | `200 ServiceResponse[]` |
| GET | `/api/services?giverId={id}&status={status}` | Yes | query | `200 ServiceResponse[]` |
| POST | `/api/services` | Yes | `CreateServiceRequest` | `201 ServiceResponse` |
| GET | `/api/services/{id}` | Yes | none | `200 ServiceResponse` |
| PUT | `/api/services/{id}` | Yes | `UpdateServiceRequest` | `200 ServiceResponse` |
| DELETE | `/api/services/{id}` | Yes | none | `204` |
| POST | `/api/services/{id}/tasks` | Yes | `CreateTaskRequest` | `201 ServiceTaskResponse` |
| PUT | `/api/services/{id}/tasks/{taskId}` | Yes | `UpdateTaskRequest` | `200 ServiceTaskResponse` |
| DELETE | `/api/services/{id}/tasks/{taskId}` | Yes | none | `200` |
| POST | `/api/services/{id}/images` | Yes | `multipart/form-data files[]` | `200 ServiceResponse` |
| DELETE | `/api/services/{id}/images?imagePath={path}` | Yes | query | `200 ServiceResponse` |
| POST | `/api/services/{id}/list` | Yes | none | `200 ServiceResponse` |
| POST | `/api/services/{id}/delist` | Yes | none | `200 ServiceResponse` |
| POST | `/api/services/{id}/archive` | Yes | none | `200 ServiceResponse` |
| POST | `/api/services/{id}/restart` | Yes | none | `200 ServiceResponse` |

### Service DTO

```ts
type CreateServiceRequest = {
  title: string
  description?: string | null
  serviceMode?: 'Task' | 'Points'
  requiredPoints?: number | null
}

type UpdateServiceRequest = {
  title: string
  description?: string | null
}

type CreateTaskRequest = {
  stepNumber: number
  title: string
  description?: string | null
  points?: number
}

type UpdateTaskRequest = {
  title: string
  description?: string | null
}

type ServiceResponse = {
  serviceId: string
  title: string
  description: string
  imagePaths: string[]
  status: 'Draft' | 'Listed' | 'InProgress' | 'Completed' | 'Delisted' | 'Archived'
  tasks: ServiceTaskResponse[]
  createdAt: string
  updatedAt: string
  serviceMode: 'Task' | 'Points'
  requiredPoints: number | null
  giverName?: string | null
}

type ServiceTaskResponse = {
  taskId: string
  stepNumber: number
  title: string
  description: string
  status: 'Pending'
  points: number
}
```

## Exchange API

| Method | Path | Auth | Request | Success |
|---|---|---|---|---|
| POST | `/api/exchanges` | Yes | `CreateExchangeRequest` | `201 ExchangeResponse` |
| GET | `/api/exchanges/{id}` | Yes | none | `200 ExchangeResponse` |
| GET | `/api/exchanges/service/{serviceId}/active` | Yes | none | `200 ExchangeResponse` |
| GET | `/api/exchanges/my` | Yes | none | `200 ExchangeResponse[]` |
| POST | `/api/exchanges/{id}/steps/{stepNumber}/submit` | Yes | `SubmitStepRequest` | `200 StepResultResponse` |
| POST | `/api/exchanges/{id}/steps/{stepNumber}/approve` | Yes | none | `200 ApproveStepResponse` |
| POST | `/api/exchanges/{id}/release` | Yes | none | `200 ExchangeResponse` |
| POST | `/api/exchanges/{id}/deliver` | Yes | none | `200 ExchangeResponse` |
| POST | `/api/exchanges/{id}/confirm-receipt` | Yes | none | `200 ExchangeResponse` |

### Exchange DTO

```ts
type CreateExchangeRequest = {
  serviceId: string
}

type SubmitStepRequest = {
  note?: string | null
}

type ExchangeResponse = {
  exchangeId: string
  serviceId: string
  takerId: string
  status: 'Active' | 'Released' | 'Completed' | 'Delivered' | 'ReceiptConfirmed'
  currentStep: number
  totalSteps: number
  progress: number
  stepResults: StepResultResponse[]
  acceptedAt: string
  completedAt: string | null
  takerName?: string | null
  requiredPoints?: number | null
  earnedPoints?: number | null
}

type StepResultResponse = {
  stepNumber: number
  note: string | null
  status: 'Pending' | 'Submitted' | 'Approved'
  submittedAt: string | null
  approvedAt: string | null
  points: number
}

type ApproveStepResponse = {
  exchangeId: string
  stepNumber: number
  status: 'Pending' | 'Submitted' | 'Approved'
  approvedAt: string | null
  progress: number
  isLastStep: boolean
  showCelebration: boolean
  earnedPoints?: number
  requiredPoints?: number
}
```

## SignalR 契約

| 項目 | 契約 |
|---|---|
| Hub path | `/exchangeHub` |
| Auth | JWT，前端透過 SignalR `accessTokenFactory` 傳入 |
| Server -> client method | `ExchangeStatusChanged` |
| Group | `user:{userId}` |

### ExchangeNotification

```ts
type ExchangeNotification = {
  eventType: 'StepSubmitted' | 'StepApproved' | 'ExchangeDelivered' | 'ReceiptConfirmed' | 'ExchangeReleased' | 'TaskAdded'
  exchangeId: string
  serviceId: string
  stepNumber: number | null
  exchangeStatus: string
  progress: number
  earnedPoints: number | null
  requiredPoints: number | null
}
```

## 錯誤碼

| Status | 用途 |
|---|---|
| `400` | request 無效、狀態轉換不合法、圖片格式或大小錯誤 |
| `401` | 未登入、JWT 無效、Google token 無效 |
| `403` | 已登入但不是 Giver/Taker/owner，或使用者停用 |
| `404` | Service、Exchange、User 或 Active exchange 不存在 |
| `409` | 重複註冊或服務已被接案 |
| `502` | Google API 無法使用 |

## 維護規則

- 新增或改動 endpoint 時，同步更新 Controller、Application DTO、前端 `src/services` 與本文件。
- 新增 response 欄位時，同步檢查 `MappingExtensions.cs` 與前端 optional/null 處理。
- 新增 SignalR event 時，同步更新 `ExchangeNotificationService`、`useExchangeHub.ts` 與測試。
- 不在本文件放業務流程細節；流程行為請看 `overview/01-architecture/03-runtime-flow.md` 與 Domain/Application 測試。
