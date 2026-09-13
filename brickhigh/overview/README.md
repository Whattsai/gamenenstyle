# Overview 目錄指引

`overview/` 是 AI 讀取專案現況的主要入口。目前只開發 [SPEC-001-BrickModelCatalog](../docs/specs/SPEC-001-BrickModelCatalog.md)；不是既有模板中的 Web／Docker 應用程式。以下為 2026-09-13 實際狀態；完整驗收進度以 [TDD](../docs/tdd/SPEC-001-BrickModelCatalog-TDD.md) 為準。

## 現有程式與邊界

| 路徑 | 已有內容與限制 |
|---|---|
| `game/Assets/BrickHigh/Domain/` | 不引用 UnityEngine 的座標、尺寸、查詢、結果、session 與存檔標頭契約 |
| `game/Assets/BrickHigh/Application/` | 只讀存檔相容政策、預覽搜尋／分頁／選取／錯誤狀態、單次重試與過期結果釋放；不建立人物／庫存資料，不執行還原 |
| `game/Assets/BrickHigh/Infrastructure/` | SQLite C API、包內 bytes／manifest 索引核對、固定 session 查詢、整組歷史引用 resolver、runtime_files 投影與 Addressables 離線啟動政策 |
| `game/Assets/BrickHigh/UnityRuntime/` | BrickAssetProvider 私有 locator／實際 bytes 雜湊與記憶體 bundle 載入、主執行緒 ModelLease、CatalogPreviewController 本機預覽協調與內部 Player 探針；未建立正式 UI |
| `game/Assets/BrickHigh/Editor/` | 產生獨立 Win64 Mono 工具鏈探針，真實 GLB 匯入／本地 Addressables／URP；不是 BuildPreviewPlayer 或發布工具 |
| `game/Assets/Plugins/x86_64/` | 官方 SQLite 3.53.4 DLL、Win64 匯入設定與使用條件；已做普通磚 Player 唯讀與缺 DLL 反例 |
| `game/Packages/`、`game/ProjectSettings/` | Unity 6000.3.18f1 與實際解析的 package lock；只通過部分工具鏈，不代表全部材質與安裝驗收 |
| `tools/catalog/` | Python 領域政策、開發端 SQLite、不可變物件儲存、LDraw 來源掃描／Blender 幾何轉換、GLB 結構與 Khronos 驗證；完整 CLI／工作恢復尚未完成 |
| `tools/tests/` | 相同 C# 核心原始碼的 .NET 10 NUnit harness 與 .NET Standard 2.1 編譯檢查，不是 Player |
| `tools/acceptance/tests/integration/` | Windows junction／檔案替換安全探針；尚非安裝包 E2E |
| `tools/acceptance/verify_toolchain_player.ps1` | 真實 Player 正常／無圖形／缺 DLL／包內 bundle 竄改／無頂層 bundle／缺啟動 catalog 六項矩陣；故障只注入新複本 |
| `tools/acceptance/verify_offline_bootstrap.py` | 回環 HTTP 計數反例，驗證遠端 catalog 在初始化前被拒絕；僅修改新建的人工 F-Catalog 複本 |
| `artifacts/` | 忽略版控的來源下載、工具與本機證據，不能當作已發布資產 |

`tools/catalog/schema.sql` 是製作端資料庫；`runtime_schema.sql` 是唯讀玩家投影。不能混用，也沒有正式 `player.db`。Frozen 固定來源投影，Published／Ready 不可原地修改；新增內容走後繼快照／revision。完整來源證據及發布報告閉環尚未完成，不得以合成測試資料發布真實 Release。

存檔引用摘要的現行實作格式為 `ref-digest-v1`：去重後的 `snapshotId/variantId/revisionId` 小寫 UUID 鍵依 ordinal 排序，以 LF 串接，前綴 `ref-digest-v1` 加 LF，再計算 UTF-8 SHA-256。`MigrationRequired` 不允許直接可寫開啟；真正 migration 留後續資料規格實作。

## 可重跑的本機驗證

工作目錄為 `brickhigh/`。本機使用 Python 3.13.14／pytest 9.0.2、.NET SDK 10.0.204、Blender 5.2.1；Node 驗證器依 `tools/catalog/package-lock.json` 固定。C# 測試會還原 NUnit／Newtonsoft.Json 開發相依，不代表玩家需要 .NET SDK 或網路。

```powershell
python -m pytest -q --junitxml=artifacts/test-results/python-20260910.xml
dotnet test tools/tests/BrickHigh.Core.Tests.csproj --nologo --verbosity quiet
dotnet build tools/tests/BrickHigh.Core.Compatibility.csproj --nologo --verbosity quiet
npm ci --prefix tools/catalog --ignore-scripts --no-audit --no-fund
```

真實 Blender 探針另外需要 `blender` 在 PATH、官方 LDraw library 位於 `artifacts/sources/ldraw-release/ldraw`，以及 ImportLDraw 位於 `artifacts/toolchain/ImportLDraw`、commit 為 `c306fb777a4e0da85492f09d65daf458767a0aa1`。缺任一工具時該探針會明確 skip，不能把 skip 算完成；最近回歸為 Python 38 passed／純 C# 81 passed／Unity 專案 EditMode 86 passed，無 skipped。測試案例數不等於 TDD checklist 完成數。

取得與展開 LDraw 來源後，可在**全新輸出目錄**執行幾何探針：

```powershell
python -m tools.catalog.sources artifacts/sources/ldraw-complete.zip artifacts/sources/ldraw-release
blender --background --factory-startup --python-exit-code 4 --python tools/catalog/blender_convert.py -- --library artifacts/sources/ldraw-release/ldraw --importer artifacts/toolchain/ImportLDraw --part 3001.dat --colour 4 --output artifacts/models/3001-red-new-probe
node tools/catalog/validate_glb.cjs artifacts/models/3001-red-new-probe/model.glb artifacts/models/3001-red-new-probe/khronos-report.json
```

來源：[官方 LDraw complete.zip](https://library.ldraw.org/library/updates/complete.zip)、[ImportLDraw](https://github.com/TobyLobster/ImportLDraw)。本輪來源壓縮檔 SHA-256 為 `d2a695868ed2b3957c45b022a6451908edab22cc043179dd61d18dd382b35e11`；來源更新後不可沿用舊 hash 或聲稱同一 revision。轉換僅在未開啟 blend 的獨立背景程序執行，拒絕覆蓋既有輸出；不修改 `blender/brickhigh.blend` 或使用者偏好設定。

## 下一個驗收關卡

`well-done` 尚在 Phase 2。Unity 已由使用者安裝，實際路徑為 `C:/Program Files/Unity/Hub/Editor/6000.3.18f1/Editor/Unity.exe`；授權解析與 Windows 建置可用。受控 provider 已接通普通磚，但多包／多相依／catalog 遠端拒絕全集、合格代表件、Preview 的來源／品質／封裝、UX、原生啟動器與安裝更新、使用者畫面核准及指定硬體效能仍需完成；內部單磚探針不完成這些門檻。

Unity EditMode 使用 `-batchmode -nographics -projectPath <game絕對路徑> -runTests -testPlatform EditMode -assemblyNames BrickHigh.Tests.EditMode -testResults <新的xml> -logFile <新的log>`。不加 `-quit`，由 Test Runner 結束；只計專案 assembly，不把 Addressables 文件範例測試算進完成度。

內部 Player 使用 `-batchmode -projectPath <game絕對路徑> -executeMethod BrickHigh.Editor.ToolchainProbeBuild.Build -quit -logFile <新的log>`。來源固定為有紀錄 hash 的 `artifacts/models/3001-red-exploratory-v1/model.glb`；每次建立新 `artifacts/acceptance/toolchain-<id>/Player`，log 的 `BRICKHIGH_PROBE_BUILD` 列出實際路徑。從 `brickhigh/` 執行 `./tools/acceptance/verify_toolchain_player.ps1 -PlayerDirectory <該Player目錄>`；此程序會產生圖片、報告及故障複本，不碰正式 Profiles。

探針只在 `UNITY_EDITOR` 或建置明確加入的 `BRICKHIGH_TOOLCHAIN_PROBE` 編譯，使用獨立 `com.gamenenstyle.brickhigh.toolchainprobe` 身分，不偽裝 Preview／Release。畫面是 Player 的 Camera RenderRequest（不是 Editor 截圖，也不是使用者桌面操作驗收）；黑圖、遺失 shader 與未釋放引用均須失敗。第一輪黑圖的歷史 `passed=true` 已在 TDD 撤銷畫面證據資格，保留原報告供追溯。

**探針不能直接雙擊當瀏覽器使用**：它要求 `-probe-output <全新報告目錄>`；沒有參數會主動以 exit 2 結束，驗證完成也會退出。請透過上述驗收腳本執行；`BrickHighToolchainProbe.exe` 不是正式玩家啟動入口，也沒有持續操作模式。

預覽控制層現有 `CatalogPreviewPresenter<T>`（純狀態）及 `CatalogPreviewController`（Unity 本機協調）。後者持有 session／provider／instance，提供搜尋、清除、下一頁、選取、重試與主執行緒 `Changed` 通知。畫面應只讀 `State`，透過 controller 操作，不能自行繞過狀態機釋放 ModelLease；退出時 Dispose，畫面自有 render texture 另由畫面釋放。`ReleasingModel` 保證先停用 instance，再釋放共用資產引用。這些尚未接上完整 uGUI／鍵盤／鏡頭／字型，不能當 UX 已交付。

新版原生驗收另要求 `previewFlowVerified`／`previewRetryVerified`：真實 SQLite 空結果→清除→完整引用→instance→釋放，以及啟動設定暫時被占用後解除並在同一 controller 重試。舊 build 缺少這些報告欄位，不滿足新版腳本；應重新建置。provider 的暫時初始化失敗只在等待者／租約歸零後清除，重試仍重新驗檔；尚不代表所有初始化故障矩陣已完成。

新版探針的人工 F-Catalog 僅測試 SQLite→固定引用→Addressables adapter，manifest 明列 `purpose=F-Catalog`／`readyAsset=false`；不得用於發布。故障複本放在 `artifacts/acceptance/fault-*` 的短路徑，原檔分別保留為 `sqlite3.dll.disabled`／`original.bundle.backup`。實測 292 字元 bundle 路徑在 Unity Mono 下回報缺檔；短路徑測試只隔離 hash 反例，未解決長路徑安裝相容性。

從 `brickhigh/` 執行 `python tools/acceptance/verify_offline_bootstrap.py --player-directory <該Player目錄>` 可重跑啟動設定反例。舊 Player 曾向回環位址請求 catalog 並逾時；修正後在 0 次 HTTP 請求、0 資產 handle 下回 AssetCorrupt。這是開發端測試工具，非 Player 相依。

最新內部包已使用 `StreamingAssets/Catalog/<packId>` 放置 DB、manifest、私有 catalog 與 bundle。Player 固定頂層 `aa` 只提供初始化 settings／catalog，bytes 必須與選定包索引一致；模型從包內讀取並驗 hash。此單包布局已通過原生探針，但正式發布／安裝、多包併發與長路徑驗收仍未完成。人工包在建置後連同 meta 移回 `Assets/ToolchainProbeGenerated`，不當作可發行 Preview 留在專案中。

## 建議結構

| 目錄 | 用途 |
|---|---|
| `01-architecture/` | 系統概述、分層邊界、runtime flow、模組地圖、相依關係 |
| `02-development-guidelines/` | AI coding rules、檔案放置規則、AI workflow stages |
| `03-contracts/` | API contract、資料 contract、事件與設定 key |
| `04-deployment/` | 部署檢查表、環境變數模板與安全規則 |

## 建置規則

- 空白模板只保留目錄與指引，不填入未確認的架構、API、資料或部署內容。
- `AGENTS.md` 只作為 AI 入口與文件索引，細節應寫入 `overview/` 對應文件。
- 每次功能開發完成前，必須檢查是否需要同步更新 `overview/`。
- 若判斷不需更新 `overview/`，交付時需說明原因。
