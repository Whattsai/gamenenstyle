# 檔案放置規則

| 內容 | 位置 |
|---|---|
| 純規則、ID、期限、預設拒絕政策 | `backend/src/DatingHigh.Domain/` |
| 認證用例、adapter 介面、CurrentUser | `backend/src/DatingHigh.Application/` |
| 密碼學、Google、sender、平台 client | `backend/src/DatingHigh.Infrastructure/` |
| minimal API／DI／HTTP／authentication | `backend/src/DatingHigh.Api/` |
| .NET 模組測試 | `backend/tests/DatingHigh.Unit.Tests/`、`DatingHigh.Api.Tests/`、`DatingHigh.Integration.Tests/` |
| 測試專用 HTTP host | `backend/tests/DatingHigh.E2eHost/`；不放正式路由或 release 入口 |
| .NET 平台 probe | `backend/tools/DatingHigh.PlatformProbe/` |
| Worker／commands／strict JSON | `cloudflare/src/` |
| D1 schema | `cloudflare/migrations/`；既有 `0001_foundation.sql` 是現行六表基線 |
| Worker 單元／真 D1 測試 | `cloudflare/tests/` |
| Expo 路由畫面 | `frontend/client/app/`；layout 只組合全域 provider／Stack |
| 前端共用 UI／API／session／storage | `frontend/client/src/`；Web 專用元件用 `.web.tsx` |
| 前端單元測試 | `frontend/client/tests/unit/` |
| 正式 UI 素材／原生 plugin | `frontend/client/assets/`、`frontend/client/plugins/` |
| 跨系統整合／資料持久性 | 根 `tests/integration/` |
| Web／Android E2E | 根 `tests/e2e/web/`、`tests/e2e/android/` |
| 版面／native adapter | 根 `tests/component-layout/`、`tests/native/`；僅 development 測試 profile 可用 |
| 操作手冊 | `tests/e2e/runbooks/` |
| 可重跑開發／維運腳本與政策測試 | `tools/`、`tools/tests/` |
| MVP／SPEC／BDD／TDD／驗收 | `docs/requirements/`、`docs/specs/`、`docs/bdd/`、`docs/tdd/`、`docs/verification/` |
| 現況上下文 | `overview/01-architecture/`、`02-development-guidelines/`、`03-contracts/`、`04-deployment/` |
| 原型／提案 | `prototypes/`（或 `proposals/`）；不是正式業務程式入口，與 Expo 正式 runtime 分開 |

根 `tests/` 涵蓋前端、API、Worker／Container／D1 與持久性，不能因測試使用某個 client 就整包搬入前端。各模組單元測試留在模組內。

生成的 Android／iOS 目錄、Web dist、bin／obj、node_modules、本地 `.wrangler/state`、`.local`、`.dev.vars`、`.env.local` 與備份不提交；三個 npm lockfile 與 NuGet lockfile 則需維護。測試摘要僅保存去敏資料，原生 UI XML 只在記憶體處理。

新增文件前先找現有權威位置；不要在根目錄另建重複狀態報告。需求 ID 與既有檔名保持穩定，不為填補編號空洞重編。新增或移動模組須同步 [模組地圖](../01-architecture/04-module-map.md)、引用路徑與測試 host 建置。
