# Overview 目錄指引

`overview/` 是 AI 讀取專案現況的主要入口。目前只開發 [SPEC-001-BrickModelCatalog](../docs/specs/SPEC-001-BrickModelCatalog.md)；不是既有模板中的 Web／Docker 應用程式。以下為 2026-09-10 實際狀態；完整驗收進度以 [TDD](../docs/tdd/SPEC-001-BrickModelCatalog-TDD.md) 為準。

## 現有程式與邊界

| 路徑 | 已有內容與限制 |
|---|---|
| `game/Assets/BrickHigh/Domain/` | 不引用 UnityEngine 的座標、尺寸、查詢、結果、session 與存檔標頭契約 |
| `game/Assets/BrickHigh/Application/` | 只讀存檔相容政策；不建立人物／庫存資料，不執行還原 |
| `game/Assets/BrickHigh/Infrastructure/` | SQLite C API adapter、Windows 包內路徑與 bytes 核對、固定 session 查詢；尚無 Addressables provider |
| `game/Assets/Plugins/x86_64/` | 官方 SQLite 3.53.4 DLL、Win64 匯入設定與使用條件；只通過本機 harness，尚未驗收 Player |
| `game/Packages/`、`game/ProjectSettings/` | Unity 6000.3.18f1 專案骨架及候選套件清單；尚無 Player、場景或經驗證的 package lock |
| `tools/catalog/` | Python 領域政策、開發端 SQLite、不可變物件儲存、LDraw 來源掃描／Blender 幾何轉換、GLB 結構與 Khronos 驗證；完整 CLI／工作恢復尚未完成 |
| `tools/tests/` | 相同 C# 核心原始碼的 .NET 10 NUnit harness 與 .NET Standard 2.1 編譯檢查，不是 Player |
| `tools/acceptance/tests/integration/` | Windows junction／檔案替換安全探針；尚非安裝包 E2E |
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

真實 Blender 探針另外需要 `blender` 在 PATH、官方 LDraw library 位於 `artifacts/sources/ldraw-release/ldraw`，以及 ImportLDraw 位於 `artifacts/toolchain/ImportLDraw`、commit 為 `c306fb777a4e0da85492f09d65daf458767a0aa1`。缺任一工具時該探針會明確 skip，不能把 skip 算完成；2026-09-10 實際回歸為 Python 38 passed／C# 33 passed，無 skipped。

取得與展開 LDraw 來源後，可在**全新輸出目錄**執行幾何探針：

```powershell
python -m tools.catalog.sources artifacts/sources/ldraw-complete.zip artifacts/sources/ldraw-release
blender --background --factory-startup --python-exit-code 4 --python tools/catalog/blender_convert.py -- --library artifacts/sources/ldraw-release/ldraw --importer artifacts/toolchain/ImportLDraw --part 3001.dat --colour 4 --output artifacts/models/3001-red-new-probe
node tools/catalog/validate_glb.cjs artifacts/models/3001-red-new-probe/model.glb artifacts/models/3001-red-new-probe/khronos-report.json
```

來源：[官方 LDraw complete.zip](https://library.ldraw.org/library/updates/complete.zip)、[ImportLDraw](https://github.com/TobyLobster/ImportLDraw)。本輪來源壓縮檔 SHA-256 為 `d2a695868ed2b3957c45b022a6451908edab22cc043179dd61d18dd382b35e11`；來源更新後不可沿用舊 hash 或聲稱同一 revision。轉換僅在未開啟 blend 的獨立背景程序執行，拒絕覆蓋既有輸出；不修改 `blender/brickhigh.blend` 或使用者偏好設定。

## 下一個驗收關卡

`well-done` 尚在 Phase 2；接續需可用且已完成適用授權的 Unity Editor，才能驗證套件解析、SQLite native plugin、URP／glTFast／Addressables、Preview 封裝與離線 Player。已下載的官方 Editor 安裝呼叫被取消，未重試提權；需使用者提供可用 Editor 路徑或自行完成安裝與授權。後續還有模型分類／接點／完整來源、UX、安裝更新、畫面核准及指定硬體效能，不可把本機測試當作整份 SPEC 完成。

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
