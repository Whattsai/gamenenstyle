# 檔案放置規則

MatchingSessions（2026-11-06）：純計分放 Domain `MatchingScore.cs`，用例與受限 reader 契約放 Application，固定 adapter 放 Infrastructure，數字 parser 放 Api。四表 SQL 與投影共用邏輯獨立於 `cloudflare/src/matching-commands.ts`，由既有 commands whitelist 入口呼叫；0004不修改 Foundation／Avatar 的既有欄位。Expo 配對畫面在 `src/MatchingScreen.tsx`，路由在 `app/`；SQL／HTTP／跨平台證據各留原測試層，不把受控 host 或 seed 放正式端點。

本地測試結束工具的SQL政策放`tools/local-game-policy.mjs`，透過既有local wrapper操作；真CLI跨系統測試放`tests/integration/local-game-maintenance.test.mjs`，零列回滾另由真Miniflare測試驗證。不可把維運工具搬成公開game-end API或前端正式退出功能。

共用非秘密靜態契約放根`contracts/`；profile-fields.json由Domain／Worker共讀，前端只取API目錄。新增受支援欄位要同步migration、完整DTO與固定SQL，不另建設定表或動態SQL。名片頁獨立在app/card-preview.tsx，顯示與載入在src/CardPreviewScreen.tsx分離。


| 內容 | 位置 |
|---|---|
| 純規則、ID、期限、預設拒絕政策 | `backend/src/DatingHigh.Domain/` |
| 認證用例、adapter 介面、CurrentUser | `backend/src/DatingHigh.Application/` |
| 密碼學、Google、sender、平台 client | `backend/src/DatingHigh.Infrastructure/` |
| minimal API／DI／HTTP／authentication | `backend/src/DatingHigh.Api/` |
| .NET 模組測試 | `backend/tests/DatingHigh.Unit.Tests/`、`DatingHigh.Api.Tests/`、`DatingHigh.Integration.Tests/` |
| 測試專用 HTTP host | `backend/tests/DatingHigh.E2eHost/`；不放正式路由或 release 入口 |
| .NET 平台 probe | `backend/tools/DatingHigh.PlatformProbe/` |
| 圖片 adapter／共用介面 | `backend/src/DatingHigh.Infrastructure/Media/`、`backend/src/DatingHigh.Application/Media/` |
| 圖片處理與真 provider probe | `backend/tools/DatingHigh.MediaProbe/`；真人來源不放版本庫 |
| Worker／commands／strict JSON | `cloudflare/src/` |
| D1 schema | `cloudflare/migrations/`；0001六表54欄＋0002新增兩表24欄＋0003擴至兩表27欄，零 Trigger |
| Worker 單元／真 D1 測試 | `cloudflare/tests/` |
| Expo 路由畫面 | `frontend/client/app/`；layout 只組合全域 provider／Stack |
| 前端共用 UI／API／session／storage | `frontend/client/src/`；Web 專用元件用 `.web.tsx` |
| 前端單元測試 | `frontend/client/tests/unit/` |
| 正式 UI 素材／原生 plugin | `frontend/client/assets/`、`frontend/client/plugins/` |
| 化身圖片／來源追溯 | `frontend/client/assets/avatars/` 含 provenance.json；公開免費圖另存 `public/avatars/`，真人照與 AI 候選不在此 |
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
