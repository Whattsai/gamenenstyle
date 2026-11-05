# DatingHigh 開發入口

本目錄是「心動迴路」正式應用，包含 PlatformFoundation 與已完成本地Web／Android範圍驗收的 AvatarAndPreferences。使用繁體中文維護說明；不要替其餘 SPEC 建假成功頁、業務表或固定帳號。化身最新證據見 `docs/verification/SPEC-001-AvatarAndPreferences-Verification.md`。

## 讀取順序

1. [README](README.md)：啟動與驗證入口。
2. [系統概覽](overview/01-architecture/01-system-overview.md)、[分層邊界](overview/01-architecture/02-layer-boundary.md)、[執行流程](overview/01-architecture/03-runtime-flow.md)。
3. [模組地圖](overview/01-architecture/04-module-map.md)、[相依地圖](overview/01-architecture/05-dependency-map.md)。
4. [AI coding rules](overview/02-development-guidelines/01-ai-coding-rules.md)、[檔案放置](overview/02-development-guidelines/02-file-placement.md)、[工作流](overview/02-development-guidelines/03-ai-workflow-stages.md)。
5. 目標需求的 `docs/specs`、`docs/bdd`、`docs/tdd` 與 `docs/verification`；PlatformFoundation 對應 [SPEC](docs/specs/SPEC-001-PlatformFoundation.md)、[BDD](docs/bdd/SPEC-001-PlatformFoundation-BDD.md)、[TDD](docs/tdd/SPEC-001-PlatformFoundation-TDD.md)、[驗證紀錄](docs/verification/SPEC-001-PlatformFoundation-Verification.md)。

依任務補讀 [API 契約](overview/03-contracts/01-api-contracts.md)、[資料契約](overview/03-contracts/02-data-contracts.md)、[部署與本地操作](overview/04-deployment/01-deployment-checklist.md)、[環境變數](overview/04-deployment/02-environment-variables-template.md)。規劃基線與執行證據不一致時，先辨明日期與範圍，不把歷史「未實作」或局部通過視為現況結論。

## 目錄與技術

`frontend/client/` 為 Expo／React Native 前端；`backend/` 為 .NET 10 四層；`cloudflare/` 為 Worker／Container／D1／私人 R2；`tools/` 為開發與維運工具。根目錄 `tests/` 涵蓋跨系統整合與平台驗收，各模組單元測試留在模組內。檔案責任見 [放置規則](overview/02-development-guidelines/02-file-placement.md)。不要任意新增旁支 Markdown，優先更新既有權威文件。

## 必守規則

- 依使用者2026-11-04決策D-051／D-052：無障礙專項不納入目前整個遊戲MVP的設計、實作或驗收，不列待補；iOS暫緩。Web／Android一般功能與資料安全仍須驗證，歷史未驗不改記通過。

- 認證以 SPEC 為準：每帳號一個未撤銷 family；新登入同 D1 batch 撤舊建新；`cv` 只隨憑證變更增加；Refresh 30 秒寬限，逾時重放撤原 family。
- Foundation 六表54欄保持；AvatarAndPreferences 維持兩表27欄（2026-11-05已確認D-053由24欄向前升級），零 SQL Trigger。首欄 UUIDv7、固定 prepared SQL；不引入 Identity／EF、額外 marker/version 欄位、job 表或公開 command 入口。
- 認證與資料變更先加有意義的失敗測試，再實作。D1 的條件更新、UNIQUE、FK 與 rollback 必須用真 Miniflare D1；HTTP fixture 只驗 HTTP，不可取代 SQL 證據。
- 不要輸出、提交或持久記錄 raw code、密碼、平台／Google token、Cookie 或環境秘密。本地唯一碼日誌例外為明確 local／Log 的 `LocalEmailVerification`。產品內既有 Cookie／SecureStore／流程 metadata 儲存僅依資料契約處理，不另建秘密日誌或檔案。
- UI 測試關閉影片／trace；原生 UI XML 只在記憶體處理。
- 不修改其他專案的程序或資料。本地命令只能經 wrappers 指向已知 local instance；備份先暫停寫入，還原只建新目錄。不得把 local 操作換成 remote 旗標。
- 驗收逐平台與環境記錄。測試名稱有 ID 不等於整個規劃案例全通過；缺 iOS、真 Google、實際收信或雲端容器證據時保留未驗收，回寫精確缺項。既有真 Google 本地證據見驗證紀錄，不能擴推其他平台。production 只在具體版本已獲授權時發布。

## 工作流與命令

工作區已有 [perfect-plan](../.agents/skills/perfect-plan/SKILL.md)（需求至 MVP／SPEC／BDD／TDD／風險稽核）及 [well-done](../.agents/skills/well-done/SKILL.md)（依文件開發、UX、深度稽核及缺漏修復）。完整文件鏈採 `perfect-plan -> well-done`；依使用者任務啟用，不因整理文件而自動執行規劃或開發。

| 任務 | 命令 |
|---|---|
| 基礎整體驗證 | `npm run check:foundation` |
| 真本地 bridge | `npm run test:live` |
| Web | 先 `npm --prefix frontend/client run export:web`、`npm run build:e2e-host`，平台運行後 `npm run test:web` |
| 個別模組 | `npm test`、`npm run test:server`、`npm run test:worker`、`npm run test:client` |
| 本地平台 | `npm run dev:platform`；必要時 `npm run dev:platform:restart` |
| 文件檢查 | `git diff --check`，加連結與現況掃描 |

故障／重啟／換 key 與其他依賴 8787 的測試依序執行；詳細前提與平台限制見工作流。只改 Markdown 不需跑程式測試。

Android 測試目前仍有搬移前的路徑引用，見 [重跑限制](overview/02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制)；不要把既有驗收紀錄當作現行腳本可直接重跑的證明。

## 完成前檢查

- [ ] 變更符合已確認範圍與分層，不以原型資料假裝功能完成。
- [ ] 認證／資料變更有先失敗後通過的測試證據，並執行對應回歸。
- [ ] DTO、prepared commands、migration、前端型別及設定一致。
- [ ] 未洩漏秘密，未改其他專案，未混用 local／remote。
- [ ] 測試結果與完整案例覆核分開，精確回寫環境／平台缺項。
- [ ] 檢查下列 overview 影響矩陣；受影響就更新，若無影響，交付時說明原因。

## Overview 同步矩陣

每次需求開發完成前必查；同一規則也固化於 [工作流](overview/02-development-guidelines/03-ai-workflow-stages.md)。

| 變更內容 | 必查文件 |
|---|---|
| 定位、主要模組、啟動點 | [01-system-overview](overview/01-architecture/01-system-overview.md) |
| 分層、跨層依賴、檔案責任 | [02-layer-boundary](overview/01-architecture/02-layer-boundary.md)、[02-file-placement](overview/02-development-guidelines/02-file-placement.md) |
| 啟動、middleware、router、SPA、runtime | [03-runtime-flow](overview/01-architecture/03-runtime-flow.md) |
| 新增／移動 API、service、模組、頁面／元件 | [04-module-map](overview/01-architecture/04-module-map.md) |
| 專案參考、套件、DI、client、外部服務、proxy | [05-dependency-map](overview/01-architecture/05-dependency-map.md) |
| coding rules、測試策略、工作約定 | [02-development-guidelines](overview/02-development-guidelines/01-ai-coding-rules.md) 的受影響文件 |
| HTTP、DTO、前端 API 型別 | [01-api-contracts](overview/03-contracts/01-api-contracts.md) |
| DB／JSON schema、enum、檔案限制、設定 key | [02-data-contracts](overview/03-contracts/02-data-contracts.md) |
| Docker、部署、環境變數、CORS、資料掛載 | [部署檢查](overview/04-deployment/01-deployment-checklist.md)、[環境變數](overview/04-deployment/02-environment-variables-template.md) |
