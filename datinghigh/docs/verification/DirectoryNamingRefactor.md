# 根目錄命名重構驗證

日期：2026-11-01。範圍：資料夾及引用路徑調整，未變更認證、資料結構或業務規則。

## 目錄決策

- 前端移至 `frontend/client/`，前端單元測試維持在 `frontend/client/tests/`。
- .NET 後端移至 `backend/`，後端測試及容器建置隨之移動。
- 本地操作、建置與驗證工具移至 `tools/`，工具測試維持在 `tools/tests/`。
- 根目錄 `tests/` 保留：包含前端版面與 E2E，也包含真 Worker／Container／D1 整合、資料持久性、金鑰輪替及跨平台驗證，不能整體歸入前端。
- npm 指令、Cloudflare 設定、操作手冊、規格中的程式路徑及追溯檔同步更新。既有本地還原 instance 僅更新 Wrangler 的程式路徑，未搬移 D1／R2 資料或備份。

## 本輪執行

| 環境／檢查 | 結果 |
|---|---|
| Windows：`dotnet restore backend/DatingHigh.slnx` | 通過 |
| Windows：`npm run check:foundation` | 通過；工具 21、.NET 單元 67／API 53／整合 22、Worker 58、前端 106 項測試，以及型別檢查 |
| Web：`npm --prefix frontend/client run export:web` | 通過 |
| Web：`npm run test:layout` | 32 項通過；使用原生邊界 adapter，不作為 iOS 實機證據 |
| Windows：`npm run build:e2e-host` | 從新路徑重建通過 |
| 本地 Worker／Container／D1／R2：`npm run test:live` | 3 項通過 |
| Web：`npm run test:web` | 重跑 83 項通過（9.6 分鐘） |

首次 Web 執行出現測試主機啟動失敗並中止；已從新路徑執行 restore 與 `build:e2e-host` 後重新驗證。乾淨 checkout 請依 README 安裝、restore、匯出 Web 並建置測試主機。

本輪未重新執行 Android development APK 建置／裝置測試、iOS、真 Google 帳號操作、真收信或雲端部署。既有平台證據與完整驗收缺項維持原判定，詳見 [PlatformFoundation 驗證紀錄](SPEC-001-PlatformFoundation-Verification.md)。
