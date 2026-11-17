# 檔案放置規則

## 共用契約與素材

共用非秘密靜態契約放根 `contracts/`；profile-fields.json 由 Domain／Worker 共讀，前端透過 API 目錄取得。內容來源在 `contracts/rain-bookshop-last-order.json` 與 `contracts/story-assets/`，生成來源與完整 prompt 保存在對應 provenance.json。

免費角色 metadata 在 `contracts/builtin-avatar-packs.json`，正式80張WebP唯一存放於 `frontend/client/public/avatars/full-body.v1/`；Web／原生選角直接匯入其中16張neutral，劇情透過授權通道讀同一份五表情。只保留正式runtime資產，不存舊JPG、來源PNG、製作JSON或重複圖片；真人照片及私人生成圖不得放入公開目錄。

## 模組責任

Domain 放純規則，Application 放用例與介面，Infrastructure 放 provider／binary adapter，Api 放 parser 與路由。固定 D1 SQL、R2 CAS、DO 與清理模組放 `cloudflare/src/`；前端共用 renderer／transport 放 `src/`，`app/` 只組裝路由畫面。詳細入口見 [模組地圖](../01-architecture/04-module-map.md)。

離線素材工具、發布驗證及本地資料政策放 `tools/`，經已知 local wrapper 執行；不搬成公開管理 API。模組單元測試留在模組內，SQL／HTTP／跨平台測試各留原責任邊界。

## 位置對照

| 內容 | 位置 |
|---|---|
| AI 開發原則、讀取順序與交付檢查 | 根 `AGENTS.md`；禁止追加日期流水帳、續接摘要或驗收結果 |
| 專案簡介、環境需求、啟動與驗證方式、文件入口 | 根 `README.md`；禁止記錄工作過程與逐次進度 |
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
| D1 schema | `cloudflare/migrations/`；現行0007共21張自有表，Foundation六表54欄、本人資料／媒體兩表27欄保持，場景內容與執行六表43欄，零 Trigger；欄位詳資料契約 |
| Worker 單元／真 D1 測試 | `cloudflare/tests/` |
| Expo 路由畫面 | `frontend/client/app/`；layout 只組合全域 provider／Stack |
| 前端共用 UI／API／session／storage | `frontend/client/src/`；Web 專用元件用 `.web.tsx` |
| 前端單元測試 | `frontend/client/tests/unit/` |
| 正式 UI 素材／原生 plugin | `frontend/client/assets/`、`frontend/client/plugins/` |
| 免費角色素材 | `frontend/client/public/avatars/full-body.v1/`；契約為contracts/builtin-avatar-packs.json，無另一套素材或製作來源目錄 |
| 跨系統整合／資料持久性 | 根 `tests/integration/` |
| Web／Android E2E | 根 `tests/e2e/web/`、`tests/e2e/android/` |
| 版面／native adapter | 根 `tests/component-layout/`、`tests/native/`；僅 development 測試 profile 可用 |
| 操作手冊 | `tests/e2e/runbooks/` |
| 可重跑開發／維運腳本與政策測試 | `tools/`、`tools/tests/` |
| MVP／SPEC／BDD／TDD／驗收 | `docs/requirements/`、`docs/specs/`、`docs/bdd/`、`docs/tdd/`、`docs/verification/` |
| 現況上下文 | `overview/01-architecture/`、`02-development-guidelines/`、`03-contracts/`、`04-deployment/` |
| 原型／提案 | `prototypes/`（或 `proposals/`）；不是正式業務程式入口，與 Expo 正式 runtime 分開 |

根 `tests/` 涵蓋前端、API、Worker／Container／D1 與持久性，不能因測試使用某個 client 就整包搬入前端。各模組單元測試留在模組內。

分層故事的建構設定在 `contracts/scene-event-content.json`，共用素材只留 `contracts/story-assets/`；不把 R2 發布產物、素材副本或測試 fixture 當成新增正式主線。Domain 保留圖／DSL 純規則，Application 協調，Worker 固定交易及內容讀取；位置見模組地圖。

生成的 Android／iOS 目錄、Web dist、bin／obj、node_modules、本地 `.wrangler/state`、`.local`、`.dev.vars`、`.env.local` 與備份不提交；三個 npm lockfile 與 NuGet lockfile 則需維護。測試摘要僅保存去敏資料，原生 UI XML 只在記憶體處理。

進度、測試結果、人工確認、故障處理與未完事項更新目標需求既有的 `docs/verification/` 文件；AGENTS.md、README.md、overview 及其他非需求文件只描述現行原則、結構、契約與操作，禁止以日期或需求批次追加流水帳；需要引用進度時只連結權威紀錄。

新增文件前先找現有權威位置；不要在根目錄另建重複狀態報告。需求 ID 與既有檔名保持穩定，不為填補編號空洞重編。新增或移動模組須同步 [模組地圖](../01-architecture/04-module-map.md)、引用路徑與測試 host 建置。
