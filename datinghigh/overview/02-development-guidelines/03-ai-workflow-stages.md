# AI 工作階段與交付

## 任務入口

先依 [AGENTS.md](../../AGENTS.md) 讀現況與目標規格，檢查工作樹，保留既有使用者改動。判斷任務為文件同步、既有功能修正，或新需求的規劃／開發。不同需求的確認與完成證據不可相互代簽。

工作區提供 [perfect-plan](../../../.agents/skills/perfect-plan/SKILL.md) 與 [well-done](../../../.agents/skills/well-done/SKILL.md)。完整需求鏈採 `perfect-plan -> well-done`：前者整理已確認 MVP／SPEC／BDD／TDD 與風險稽核交接，後者承接測試先行、UX、深度稽核與缺漏修復。依使用者任務及 skill 規則執行；只做 initial-overview 時不啟動這兩個流程。

## 一般開發

1. 明確列出觸發條件、預期行為、規格來源與必要平台／環境；先讀現行 implementation／test，避免以歷史規劃段落代替現況。
2. 認證／資料變更先以有意義的失敗測試重現，再跨必要層實作與重構；SQL 依真 Miniflare D1 證據判定。
3. 執行相應回歸；跨層認證改動使用基礎整體檢查及必要 live／UI 測試。原生 plugin 變更需重建／安裝 APK。
4. 同步受影響的契約與 overview，直接整合成現行說明；AGENTS.md、README.md、overview 等非需求文件禁止按日期／需求追加流水帳。進度、測試結果、人工確認、故障經過與未完事項只更新既有需求驗證文件。
5. 檢查 diff、敏感資料與下列影響矩陣後交付。若 overview 無影響，必須說明原因。

## 驗證命令與前提

所有命令在 DatingHigh 根目錄執行；依任務選擇，不是每次都必跑全部。

| 範圍 | 命令／前提 |
|---|---|
| Markdown | `git diff --check`、相對連結、路徑與現況掃描；只改 Markdown 不跑程式測試 |
| 工具／後端／Worker／client | `npm test`、`npm run test:server`、`npm run test:worker`、`npm run test:client` |
| 型別 | `npm --prefix cloudflare run typecheck`、`npm --prefix frontend/client run typecheck` |
| 基礎整體 | `npm run check:foundation`：版本／設定、工具測試、dotnet test、兩模組型別及 Vitest，最後評估既有驗收證據 |
| Web | 先 `npm --prefix frontend/client run export:web`、`npm run build:e2e-host`，平台運行後 `npm run test:web`；Chrome、8081 靜態服務，Playwright 可自啟／重用 |
| 共用版面 | `npm run test:layout`；使用 8092 測試服務與 OS 邊界 adapter，不代替完整原生驗收 |
| 真 bridge／寄碼 | 平台運行後 `npm run test:live`、`npm run test:email:local`；不將 log 視為收信 |
| 重啟／換 key | `node --test tests/integration/restart-data.test.mjs`、`node --test tests/integration/key-rotation.test.mjs` |
| readiness 故障 | `npm run test:readiness:faults`；暫停既有 local 服務，建立新 instance，完成後恢復 |
| Android smoke | 安裝 development APK、啟動 emulator／Metro／平台後 `npm run test:android` |
| Android 受控矩陣 | `npm run test:android:faults`、`:forms`、`:recovery`、`:retry`、`:account`、`:identity`、`:pending`；前綴皆為 `test:android`，腳本先建 E2E host，使用專用 Metro／真 SecureStore |
| Android 真身分管理 | `npm run test:android:real-identity`；需要人工取消及選擇已授權 Google 帳號，隔離 D1；不保存 Email／proof |
| Android 真 Google 生命週期 | 先建 E2E host，再 `pwsh -File tools/test-android.ps1 -Suite real-google-lifecycle -AdbPort 5038`；只在已授權操作該帳號的模擬器使用 |
| 完整原規劃判定 | `npm run check:foundation -- --acceptance`；缺完整證據時 exit 2，不等於單元測試失敗 |

readiness／restart／換 key 與其他依賴 8787 的測試不得並跑；其他需要同一平台、模擬器或 fixture 的矩陣也依序執行。UI 測試關閉 trace／影片，原生 UI XML 僅在記憶體處理。詳見 [受控故障 runbook](../../tests/e2e/runbooks/foundation-controlled-faults.md) 與 [三平台 runbook](../../tests/e2e/runbooks/foundation-three-platforms.md)。

## 目前重跑限制

部分 Android 矩陣與真 Google 腳本仍引用 `scripts/local-policy.mjs`、`scripts/local.mjs` 或 `apps/client/`；實際位置為 `tools/`、`frontend/client/`。執行前逐份檢查 import、Metro cwd 與 APK 路徑，不以 package.json 有命令視為可重跑。

`faults.test.mjs` 與多個 account／forms／identity／pending／recovery／retry 矩陣含舊路徑；`real-google-support.mjs`／`real-identity.test.mjs` 的設定檔與 wrapper 路徑亦須檢查。`smoke.mjs` 從舊 APK 路徑讀 hash；測試入口可啟動不代表整輪能完成。路徑調整須在對應程式修正任務驗證，不能沿用舊平台證據。

## 驗收與證據

`docs/verification/foundation-evidence.json` 記平台／環境證據；`foundation-case-review.json` 為人工案例覆核，`foundation-traceability.json` 與 DeepAudit 提供完整追溯。不要只因函式名稱含 PF ID 就改成 passed。

依 D-051，無障礙專項不納入目前 MVP；依 D-052，iOS 暫緩。評估器的 `accepted`／`missing` 代表完整原規劃，`scopedAccepted`／`scopedMissing` 代表明確決策下的驗收範圍。本地或受控證據不替代其他平台、真服務或雲端證據。

目前狀態以 [驗證紀錄](../../docs/verification/SPEC-001-PlatformFoundation-Verification.md)、[本地矩陣](../../docs/verification/PlatformFoundation-LocalMatrix.md) 與 [深度稽核](../../docs/verification/SPEC-001-PlatformFoundation-DeepAudit.md) 為準，overview 只維護現行原則、結構、契約與操作，不記需求進度或工作流水帳。

## Overview 同步矩陣

每次需求開發完成前必查；受影響就更新對應文件，若不需更新，交付必須說明原因。此規則也固定在 AGENTS.md。

| 變更內容 | 必查文件 |
|---|---|
| 系統定位、主要模組、啟動點 | [01-system-overview](../01-architecture/01-system-overview.md) |
| 分層責任、跨層依賴、檔案責任 | [02-layer-boundary](../01-architecture/02-layer-boundary.md)、[02-file-placement](02-file-placement.md) |
| 啟動、middleware、router、SPA、runtime | [03-runtime-flow](../01-architecture/03-runtime-flow.md) |
| 新增／移動模組、API、service、前端頁面／元件 | [04-module-map](../01-architecture/04-module-map.md) |
| 專案參考、套件、DI、client、外部服務、proxy | [05-dependency-map](../01-architecture/05-dependency-map.md) |
| coding rule、測試策略、AI 工作約定 | 本目錄三份指南中受影響的文件 |
| HTTP、request／response DTO、前端 API 型別 | [01-api-contracts](../03-contracts/01-api-contracts.md) |
| DB／JSON schema、enum、檔案限制、設定 key | [02-data-contracts](../03-contracts/02-data-contracts.md) |
| Docker、部署、環境變數、CORS、資料掛載 | [部署檢查](../04-deployment/01-deployment-checklist.md)、[環境變數](../04-deployment/02-environment-variables-template.md) |

## 交付格式

說明最終行為、修改位置及原因，列出實際執行命令／結果／平台／環境與必要前提；沒執行或不具證據的項目明確保留。補充 overview 更新處或無影響原因、剩餘風險與下一個真正需要外部條件的缺項。只改文件時明確說明只修改 Markdown。


## 模組驗證方式

### 化身與個資

- 真媒體整合入口為 `backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs` 與 Worker 媒體測試。`node --test tests/integration/avatar-http-live.test.mjs` 驗 default local binary／Cookie／Bearer，使用虛構圖，不呼叫 Gemini。
- Web 使用 `tests/e2e/web/avatar-*.spec.ts`。原生資料、照片與選角使用 `avatar-preferences.mjs`、`avatar-photos.mjs`、`avatar-managed.mjs`、`avatar-privacy.mjs`、`profile-card-settings.mjs`；須安裝含 picker 的 development APK、啟動8082 Metro與指定專用QA裝置／ADB port。
- 真 Gemini 使用明確 opt-in 的 `avatar-gemini-live.mjs`／Web spec，以及已授權來源路徑；來源只讀入 RAM，不保存到裝置或證據。候選預設一張，四張測試須明確設定。測試期間凍結來源碼、匯出與平台重啟，先等 ready 再操作。
- `avatar-controlled.mjs` 使用隔離 E2eHost 與8084 Metro；`avatar-full-body.mjs` 使用明確QA31／ADB5038與已確認圖像回放目錄。受控回應與回放不能作為真 provider 品質證據。
- 表情迴圈核對 focus／AppState、背景停止續送與採用、前景只讀復原、本人明確繼續及未知成本不自動重送。候選與 next POST 的 client deadline 為110秒，provider90秒、HTTP100秒；到期時關閉確認窗，提交仍重驗 serverNow。
- 套組檢查使用 `node --test tools/tests/builtin-avatar-assets.test.mjs`；正式目錄更新後執行 `node tools/generate-builtin-avatar-assets.mjs`，核對80張成品SHA、avatarVersion與16個neutral匯入。素材只存一份public來源，未使用的原畫、製作紀錄與副本不留存；人工核准結果記在需求驗證文件。
- 名片測試涵蓋關閉照片無讀取、預覽先儲存、載入失敗不導覽、返回保護草稿及變更後清除舊投影；schema／SQL 原子性使用真 D1。

### 配對與劇情

- 配對 SQL／R2 使用 `npm --prefix cloudflare test -- matching-sessions-d1.integration.test.ts`；API 使用 dotnet 的 Matching filter；共用 UI 使用 `matching-sessions.test.tsx`。
- Web 先 export、build:e2e-host，再跑 `matching-sessions.spec.ts`；原生 `matching-sessions.mjs` 使用專用裝置／ADB port、自有8084 Metro，可依 basic／extended／routing／card 分組。它們不與同裝置或同 port 的測試並行。
- `npm run game:list:local`／`npm run game:end:local -- --round-id UUID` 只供本地維運；`tests/integration/local-game-maintenance.test.mjs` 驗 CLI 與 D1 rollback，不替代產品退出 UX。
- `npm run test:story:web` 前先 export Web／build E2eHost；`npm run test:story:android` 指定QA裝置與ADB port，單程序獨占UiAutomator，透過SDK launch參數關閉開發浮動按鈕。`npm run test:story:live` 需真local平台ready。
- 劇情 fixture 可驗多個完整內容的選場引擎，不當作額外正式故事。技術回放不替代本人 Gate B，Gate B 確認前不得擴充其餘九場。

### UI 與追溯原則

圖片需量實際3:4 frame，不能只驗 aspectRatio 宣告；Web height:auto、native height:undefined。UiAutomator XML 的 emoji entity 單次解碼，輸入須定位實際 EditText，捲動使其可見；裝置 ANR／連線 timeout 不得記產品通過。

追溯工具 `audit-avatar-traceability.mjs`、`audit-matching-traceability.mjs`、`audit-story-traceability.mjs` 僅依人工覆核重建索引，不因測試名稱有 ID 就核准。追加需求的斷言與覆核紀錄須保留；規劃數、測試函式數、平台證據與完整驗收分開計算。GC 壓力測試的可控 I/O／Miniflare 結果不擴推成雲端長期負載證據。
