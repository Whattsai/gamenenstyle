# 分層與信任邊界

## 後端

| 層 | 實際責任 | 邊界 |
|---|---|---|
| Domain | Email／密碼／UUIDv7／session 期限、DomainException、預設拒絕政策 | 不引用 HTTP、Cloudflare、UI 或資料庫套件 |
| Application | `AuthApplication`、限流／密碼學／權杖／寄信／外部身分／私人儲存介面 | 依賴 Domain 與介面；不拼 SQL、不寫 Cookie、不直接叫 Google SDK |
| Infrastructure | BCL PBKDF2、JWT、Google JWKS、sender、Readiness、固定 outbound client | 實作 Application 介面；不公開任意 SQL 或檔案 key 給 client |
| Api | DI、嚴格 JSON、platform／Origin、Cookie／Bearer、授權、ProblemDetails | 將輸入交用例；不取代 Domain 或 D1 原子條件 |

專案參考鏈為 `Api -> Infrastructure -> Application -> Domain`；API 可透過傳遞參考使用內層型別。實際 DI 與套件見 [相依地圖](05-dependency-map.md)。

## Cloudflare

- `router.ts` 負責 ingress、可信標頭、preflight、API／assets 優先序；外部 `X-DatingHigh-Internal-*` 一律移除再建。
- `ApiContainer`／Durable Object wrapper 只管容器生命週期與路由，不存帳號或 session 狀態。
- `platform.ts` 只由容器 `platform.internal` outbound handler 存取，處理 ready、寄信、固定 Google JWKS 與私人 R2。
- `commands.ts` 驗證嚴格輸入並產生固定 prepared statements，透過 D1 batch 實現條件更新與原子性；不得改成接受呼叫者 SQL。
- 公開 `/internal`、其子路徑與 `/v1/commands/*` 拒絕存取。不得為方便操作而公開 bridge。

## 前端

`app/` 組合帳號畫面與導覽；`src/api.ts` 統一 HTTP、refresh、未知結果及登出復原；`src/session.tsx` 提供全應用狀態；`src/storage*.ts`／`flow.ts` 限定儲存欄位；`GoogleButton` 的 Web／native 實作隔離 SDK。頁面不得自行持久化平台 token、解讀 client profile 為可信 Google 身分，或繞過 ApiClient 重送資料變更。

私人 R2 的 owner 取自已驗證 context，Worker 在實際物件操作前再驗 family。未定義的未來資源權限預設拒絕；原型 UI 的固定對象不作正式授權資料。

## 測試與文件

模組單元測試留在該模組，根 `tests/` 保留跨系統與平台驗收。HTTP fixture 證明 HTTP 契約；D1 條件、UNIQUE、FK、rollback 必須有真 Miniflare D1 證據。受控 sender／SDK 不證明實際收件或真 Google。

`docs/` 保存需求與驗收權威；`overview/` 描述現行實作與維護入口；`prototypes/` 僅供原型／視覺參考。擴大業務範圍須先有對應已確認文件。
