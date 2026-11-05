# AI 工作階段與交付

## 2026-11-05 修訂驗證原則

兩表27欄及0003、性別／性向／分享白名單用真Miniflare D1證明升級與原子性；HTTP fixture仍僅證HTTP。獨立名片頁每次重讀已過濾資料，UI測關閉照片無請求、預覽前儲存失敗不導頁、下拉與返回捨棄確認。2026-11-04原Android／Web結案不擴推本次追加修訂；依同日Verification逐平台記錄。記憶體壓力下依序跑模組，逾時／ECONNRESET不可記通過。


## 任務入口

先依 [AGENTS.md](../../AGENTS.md) 讀現況與目標規格，檢查工作樹，保留既有使用者改動。判斷任務為文件同步、既有功能修正，或新需求的規劃／開發。現有 PlatformFoundation 不能作其他七份 SPEC 已確認或已完成的證據。

工作區提供 [perfect-plan](../../../.agents/skills/perfect-plan/SKILL.md) 與 [well-done](../../../.agents/skills/well-done/SKILL.md)。完整需求鏈採 `perfect-plan -> well-done`：前者整理已確認 MVP／SPEC／BDD／TDD 與風險稽核交接，後者承接測試先行、UX、深度稽核與缺漏修復。依使用者任務及 skill 規則執行；只做 initial-overview 時不啟動這兩個流程。

## 一般開發

1. 明確列出觸發條件、預期行為、規格來源與必要平台／環境；先讀現行 implementation／test，避免以歷史規劃段落代替現況。
2. 認證／資料變更先以有意義的失敗測試重現，再跨必要層實作與重構；SQL 依真 Miniflare D1 證據判定。
3. 執行相應回歸；跨層認證改動使用基礎整體檢查及必要 live／UI 測試。原生 plugin 變更需重建／安裝 APK。
4. 同步受影響的契約、overview 與驗收追溯。平台／真服務缺項繼續列出，不以可執行程式或局部測試替代。
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

2026-11-01 文件盤點以靜態讀檔確認：`tests/e2e/android/fixture.mjs`、`faults.test.mjs` 與多個矩陣／真 Google 腳本仍引用搬移前的 `../../../scripts/local-policy.mjs`、`scripts/local.mjs` 或 `apps/client/`；這些應用／工具已移至 `frontend/client/`、`tools/`。受影響命令雖列在 package.json，不能當作目前可直接重跑；需先在後續程式修正任務處理路徑並驗證。

`smoke.mjs` 的 UI 流程後也仍從舊 `apps/client/android/...` 讀 APK hash，因此 `test:android` 即使完成前段操作，最後仍有失敗風險。本次 initial-overview 只記錄現況，不修改程式或重跑裝置測試。[命名重構紀錄](../../docs/verification/DirectoryNamingRefactor.md) 本來也明載該輪未重跑 Android；較早通過證據繼續保留，不能推論搬移後已通過。

## 驗收與證據

`docs/verification/foundation-evidence.json` 記平台／環境證據；`foundation-case-review.json` 為人工案例覆核，`foundation-traceability.json` 與 DeepAudit 提供完整追溯。不要只因函式名稱含 PF ID 就改成 passed。

既有 D-033／D-035 暫緩 iOS／staging，無障礙專項已依2026-11-04 D-051排除整個目前MVP，iOS依D-052暫緩；歷史未驗不記為通過。評估器的 `accepted`／`missing` 是完整原規劃，`scopedAccepted`／`scopedMissing` 是明確決策下的本地範圍。真 Google 本地 Web／Android 已有證據，仍不能代替 iOS／staging；真收信與雲端內部行為各自保留缺項。

目前狀態以 [驗證紀錄](../../docs/verification/SPEC-001-PlatformFoundation-Verification.md)、[本地矩陣](../../docs/verification/PlatformFoundation-LocalMatrix.md) 與 [深度稽核](../../docs/verification/SPEC-001-PlatformFoundation-DeepAudit.md) 為準，overview 不另維護易過期的測試數字。

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

## AvatarAndPreferences增補驗證

真媒體整合為 `backend/tests/DatingHigh.Integration.Tests/PersonalMediaIntegrationTests.cs` 及Worker四個AP測試檔；Web基本流程與明確opt-in真Gemini流程在 `tests/e2e/web/avatar-*.spec.ts`。default local二進位／Cookie／Bearer界線可用 `node --test tests/integration/avatar-http-live.test.mjs`，只傳虛構圖片、不呼叫Gemini。原生新腳本 `tests/e2e/android/avatar-preferences.mjs` 使用support與真local平台，不依賴上述舊fixture路徑；需目前含picker的新APK、8082 Metro與明確指定本專案QA device／ADB port。基本腳本以外的照片上傳／排序／刪除由 `avatar-photos.mjs` 使用專用QA相簿內虛構插畫驗證；`avatar-gemini-live.mjs` 需DATINGHIGH_GEMINI_LIVE=1及兩張已授權來源環境路徑，來源只經本人binary API讀入RAM，不複製至模擬器／證據。候選數預設1；明確設定DATINGHIGH_NATIVE_CANDIDATES=4才走四張真生成／完整frame／回選第2張。僅整輪及最後清理通過才產生匿名摘要；單張／四張證據分開，TalkBack等無障礙專項不在目前範圍。

真Gemini／原生操作期間也不能修改觸發hot reload的Worker／backend／frontend程式。原始碼、export及wrapper restart先完成並等ready，再依序測；測試中的503不能憑推測歸咎供應商，需凍結環境重現。匿名完整ID追溯由 `node tools/audit-avatar-traceability.mjs` 依人工覆核map重建，不能把275個規劃名稱當275個已通過測試。

追溯同時保留73個BDD完整斷言及每項證據；業務SQL／Application場景與13項完整三平台UX分開核對。GC多頁壓力驗證使用隔離Miniflare與可控IO耗時，核對多次有限預算的持續前進及有效物件保留；不將它擴推成雲端長期排程負載證據。

Web可選狀態須確認實際DOM的aria-pressed／aria-checked，不能只檢查React Native的accessibilityState prop；原生核對一般操作與選用結果；TalkBack／VoiceOver依D-051不列實作或驗收工作。Android UI XML只在記憶體處理；Escape收合API36 predictive-back未收合的測試鍵盤，啟動前確認專用DatingHighQA／DatingHighQA31及明確device。API36的System UI ANR／UiAutomation.connect timeout不能當成App功能通過，API31結果也不能擴推API36。

原生靜態圖片須用實際frame驗3:4：React Native Image先套用bundled source的intrinsic height，只寫width及aspectRatio仍會留下過長卡片；本畫面明確清除height後，原生基本腳本實測比例。UiAutomator的十進位／十六進位emoji entity需單次解碼，不能把鎖頭按鈕定位失敗當provider故障。本人名片預覽在成功資料變更／重新讀取後清除舊投影，避免已刪照片或舊職業仍留在畫面。

候選到期同時關閉已開啟的採用確認窗；實際按確認仍重驗api.serverNow，不能只依賴背景可能延遲的timer。Web `avatar-expiry-ui.spec.ts` 是明確的HTTP故障／候選讀取注入，不能作真Gemini或SQL證據；真帳號及虛構來源照清理須完整通過，Android對應行為已由`avatar-controlled.mjs`獨立實測：已開採用窗到期後不可提交；iOS依D-052暫緩。

`tests/integration/avatar-controlled-host.test.mjs`驗真HTTP／Application／Miniflare D1／R2的供應商失敗與重播；`tests/e2e/android/avatar-controlled.mjs`使用隔離E2eHost及8084 Metro，僅供應商回應受控，不作真Gemini品質證據。已修正其共用fixture搬移前的tools／frontend路徑。不得與其他操作同一QA裝置／8084的測試並跑；新增相依後須先restore E2eHost再build，不能沿用過期assets。

靜態圖片的Web分支以height:auto覆寫原始高度，Android保留height:undefined；兩平台均須量實際3:4框，不能只檢查aspectRatio宣告或載入成功。

`avatar-managed.mjs`補原生超8MiB／可重選、照片配額回收、revision衝突與表單／重登；`avatar-privacy.mjs`以兩個真隔離帳號驗Native Bearer猜私人asset回404及原生畫面無他人照片入口。這些腳本只用專用QA裝置，不與其他UiAutomator讀取同時執行。替換表單既有文字時先定位實際EditText、移到末尾逐字刪除再輸入，不能點到同名標籤，也不能假設數字鍵盤支援Ctrl+A；捲動必須讓輸入框本身可見。


2026-11-05 D-053：BDD／TDD開頭必列含追加需求的總進度；目前BDD範圍73/73、全部規劃73/81，原TDD 236/275與新8/8驗證組分開計算。追溯重建保留人工覆核的profileCardRevision與追加Markdown章節，不自動核准新組，也不得覆寫掉追加進度。原生新流程`tests/e2e/android/profile-card-settings.mjs`已用搬移後fixture在專用QA API31完整exit0；這不代表其餘舊路徑腳本均已重跑。平台重驗邊界以Verification為準。
