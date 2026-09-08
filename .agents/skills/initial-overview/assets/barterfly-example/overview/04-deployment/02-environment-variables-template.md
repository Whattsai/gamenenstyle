# 環境變數範本

本文件列出 Barterfly 部署時需確認的環境變數與 build-time 設定。不得填入正式密鑰、服務帳號 JSON 或正式資料。

## 後端 Runtime

ASP.NET Core 階層式設定在環境變數中使用 `__` 對應 `:`。

| 環境變數 | 對應設定 | 必要 | 敏感 | 說明 |
|---|---|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | runtime environment | Yes | No | Staging 使用 `Staging`；本機使用 `Development` |
| `PORT` | Cloud Run runtime port | Cloud Run | No | Cloud Run 通常注入 `8080`；目前 Dockerfile 預設以 `8080` 執行 |
| `ASPNETCORE_URLS` | Kestrel listen URL | Container | No | Dockerfile 預設設為 `http://+:8080` |
| `DataStorage__Path` | `DataStorage:Path` | Staging/Production | No | JSON 與圖片根目錄，Cloud Run 建議 `/app/data` |
| `Jwt__SecretKey` | `Jwt:SecretKey` | Yes | Yes | JWT 簽章密鑰，至少 32 字元 |
| `Jwt__Issuer` | `Jwt:Issuer` | No | No | 預設 `Barterfly` |
| `Jwt__Audience` | `Jwt:Audience` | No | No | 預設 `Barterfly` |
| `Jwt__ExpirationDays` | `Jwt:ExpirationDays` | No | No | 預設 `30` |
| `Google__ClientId` | `Google:ClientId` | Yes | No | Google OAuth Client ID；測試模式可使用 `test-*` |
| `Cors__AllowedOrigins__0` | `Cors:AllowedOrigins:0` | Yes | No | 第一個允許來源 |
| `Cors__AllowedOrigins__1` | `Cors:AllowedOrigins:1` | Optional | No | 第二個允許來源 |
| `Logging__LogLevel__Default` | `Logging:LogLevel:Default` | Optional | No | 預設 `Information` |
| `Logging__LogLevel__Microsoft.AspNetCore` | `Logging:LogLevel:Microsoft.AspNetCore` | Optional | No | 預設 `Warning` |

## 前端 Build-Time

Vite 變數只在前端 build 時生效，部署後改 runtime 環境變數不會改變已建置的前端 bundle。

| 變數 | 必要 | 敏感 | 說明 |
|---|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Yes | No | Google Identity Services 前端 client id |

目前 Dockerfile 行為：

- 複製 `frontend/` 後執行 `npm run build`。
- 若存在 `frontend/.env.staging`，會先複製為 `.env.production`。
- 前端 API、圖片與 SignalR 使用同源路徑：`/api`、`/images`、`/exchangeHub`。

## CI/CD Variables

若使用 GitHub Actions 或其他 CI/CD，建議分成 Secret 與 Variable。

### Secrets

| 名稱 | 用途 |
|---|---|
| `GCP_SA_KEY` | GCP service account JSON；不得進版控 |
| `JWT_SECRET_KEY` | 部署流程可映射為 `Jwt__SecretKey` |

### Variables

| 名稱 | 用途 |
|---|---|
| `GCP_PROJECT` | GCP 專案 ID |
| `GCP_REGION` | Cloud Run 區域 |
| `SERVICE_NAME` | Cloud Run service 名稱 |
| `GCS_BUCKET_NAME` | 掛載到 `/app/data` 的 bucket 名稱 |
| `GOOGLE_CLIENT_ID` | 部署流程可映射為 `Google__ClientId` 與 `VITE_GOOGLE_CLIENT_ID` |

## appsettings 對照

| 檔案 | 用途 |
|---|---|
| `backend/Barterfly.API/appsettings.json` | 基礎設定；不可填正式密鑰 |
| `backend/Barterfly.API/appsettings.Development.json` | 本機開發測試設定 |
| `backend/Barterfly.API/appsettings.Staging.json` | Staging 預設 `DataStorage:Path=/app/data` |

## 範例：Cloud Run Runtime

```text
ASPNETCORE_ENVIRONMENT=Staging
DataStorage__Path=/app/data
Jwt__SecretKey=<secret-at-least-32-chars>
Jwt__Issuer=Barterfly
Jwt__Audience=Barterfly
Jwt__ExpirationDays=30
Google__ClientId=<google-client-id.apps.googleusercontent.com>
Cors__AllowedOrigins__0=https://<service-url>
Logging__LogLevel__Default=Information
Logging__LogLevel__Microsoft.AspNetCore=Warning
```

## 範例：frontend/.env.staging

```text
VITE_GOOGLE_CLIENT_ID=<google-client-id.apps.googleusercontent.com>
```

## AI 檢查規則

- 新增後端設定時，同步更新 `appsettings*.json`、本文件與部署檢查表。
- 新增前端 `VITE_*` 變數時，同步更新 `frontend/.env.example`、`frontend/.env.staging` 產生流程與本文件。
- 不把 `Jwt__SecretKey`、`GCP_SA_KEY` 或正式資料填入文件或程式碼。
- 若改變 `DataStorage__Path`，需同步確認 JSON 檔案、圖片路徑與資料備份策略。
