# Overview 目錄指引

`overview/` 是 AI 讀取專案現況的主要入口。目前只開發 [SPEC-001-BrickModelCatalog](../docs/specs/SPEC-001-BrickModelCatalog.md)；不是既有模板中的 Web／Docker 應用程式。以下已於2026-09-27完成現況同步；完整驗收進度以 [TDD](../docs/tdd/SPEC-001-BrickModelCatalog-TDD.md) 為準。

## 現有程式與邊界

| 路徑 | 已有內容與限制 |
|---|---|
| `game/Assets/BrickHigh/Domain/` | 不引用 UnityEngine 的座標、尺寸、查詢、結果、session 與存檔標頭契約 |
| `game/Assets/BrickHigh/Application/` | 只讀存檔相容政策、預覽搜尋／分頁／選取／錯誤狀態、單次重試、過期結果釋放與外接球鏡頭政策；不建立人物／庫存資料，不執行還原 |
| `game/Assets/BrickHigh/Infrastructure/` | SQLite C API、包內 bytes／manifest 索引核對、固定 session 查詢、整組歷史引用 resolver、runtime_files 投影與 Addressables 離線啟動政策 |
| `game/Assets/BrickHigh/UnityRuntime/` | BrickAssetProvider 私有 locator／實際 bytes 雜湊與記憶體 bundle 載入、主執行緒 ModelLease、CatalogPreviewController 本機預覽協調、PreviewCameraController 的 uGUI／Input System 鏡頭接點與內部 Player 探針；已有Presentation的uGUI繁中畫面，完整UX驗收未完成 |
| `game/Assets/BrickHigh/Editor/` | 產生獨立 Win64 Mono 工具鏈探針，真實 GLB 匯入／本地 Addressables／URP；不是 BuildPreviewPlayer 或發布工具 |
| `game/Assets/Plugins/x86_64/` | 官方 SQLite 3.53.4 DLL、Win64 匯入設定與使用條件；已做普通磚 Player 唯讀與缺 DLL 反例 |
| `game/Packages/`、`game/ProjectSettings/` | Unity 6000.3.18f1 與實際解析的 package lock；只通過部分工具鏈，不代表全部材質與安裝驗收 |
| `tools/catalog/` | Python 領域政策、開發端 SQLite、不可變物件儲存、LDraw 來源掃描／Blender 幾何轉換、GLB 結構與 Khronos 驗證；CLI import／resolve／build、租約與恢復已有；Ready品質及正式發布閉環尚未完成 |
| `tools/tests/` | 相同 C# 核心原始碼的 .NET 10 NUnit harness 與 .NET Standard 2.1 編譯檢查，不是 Player |
| `tools/acceptance/tests/integration/` | Windows junction／檔案替換安全探針；尚非安裝包 E2E |
| `tools/acceptance/verify_toolchain_player.ps1` | 真實 Player 正常／無圖形／缺 DLL／包內 bundle 竄改／無頂層 bundle／缺啟動 catalog 六項矩陣；故障只注入新複本 |
| `tools/acceptance/verify_offline_bootstrap.py` | 回環 HTTP 計數反例，驗證遠端 catalog 在初始化前被拒絕；僅修改新建的人工 F-Catalog 複本 |
| `artifacts/` | 忽略版控的來源下載、工具與本機證據，不能當作已發布資產 |

`tools/catalog/schema.sql` 是製作端資料庫；`runtime_schema.sql` 是唯讀玩家投影。不能混用，也沒有正式 `player.db`。Frozen 固定來源投影，Published／Ready 不可原地修改；新增內容走後繼快照／revision。完整來源證據及發布報告閉環尚未完成，不得以合成測試資料發布真實 Release。

存檔引用摘要的現行實作格式為 `ref-digest-v1`：去重後的 `snapshotId/variantId/revisionId` 小寫 UUID 鍵依 ordinal 排序，以 LF 串接，前綴 `ref-digest-v1` 加 LF，再計算 UTF-8 SHA-256。`MigrationRequired` 不允許直接可寫開啟；本SPEC要求的人工F-Save一致備份／migration故障及還原harness仍未實作；正式人物／庫存等資料遷移留後續規格。

## 可重跑的本機驗證

### 2026-09-25 製作 CLI 續作

`python -m tools.catalog --workspace <絕對工作目錄>` 現已接上 `import`、`resolve`、`freeze`、`build`、`validate`、`publish`、`status`。`import` 可以建立新的 `catalog.sqlite`，其他命令要求既有資料庫；`--db` 只能是該工作目錄內的相對路徑。完整來源品質與正式 Unity 發行入口仍未完成，不能把內部 F-Catalog 當作可發布包。

```powershell
python -m tools.catalog --workspace C:/catalog-work import --manifest manifest.json --job-key source-v1
python -m tools.catalog --workspace C:/catalog-work resolve --snapshot <UUID> --decisions decisions.json
python -m tools.catalog --workspace C:/catalog-work freeze --snapshot <UUID> --expected-version <版本>
python -m tools.catalog --workspace C:/catalog-work build --snapshot <UUID> --job-key build-v1 --plan build-plan.json
python -m tools.catalog --workspace C:/catalog-work validate --snapshot <UUID>
```

匯入 manifest 採整數 `schemaVersion=1`，含 UTC `baselineAt`、`expectedFamilies`、`sources`；每個來源保存 `name/sourceUri/sourceVersion/observedAt/effectiveAt/expectedPages/pages`，每頁保存 `number/path/sha256`，頁面為 `schemaVersion/records`。來源 URI 不接受帳密、query 或 fragment；憑證不得保存到 manifest。`candidate`、`set`、`minifigure`、`excluded` 的完整可重跑範例見 `tools/catalog/tests/unit/test_sc_001.py`。缺頁／缺系列／未展開組件保留 G，候選一律先為 Unknown；同一 job-key 的不同有效輸入回 exit 5。原始頁面封存於 `artifacts/catalog/objects/<sha256>/content`，DB 儲存鍵相對工作目錄，重試亦核對封存 bytes。

判定檔採 `schemaVersion=1`、`expectedVersion`、非空 `entries`。每列包含 `variantId`、`evidence`、`classification`，可選 `aliases`。證據列為 `artifactId/claim/effectiveFrom/effectiveTo/reviewer/reason`，附件必須已存在且 hash 正確；主張僅接受 Producing、Discontinued、InStock、OutOfStock、Candidate、Unknown。日期缺失、僅庫存或有效期外不構成在產證據；同變體相反主張保留 Unknown，不能藉新判定刪除舊證據。附件真實含義仍需維護者核對，工具不把測試附件當真實生產證據。

分類列包含 `tier/reason/allowedAcquisitionSources/characterSlots/creationEligible/bucketEligible/buildSystems`；Special 不得開啟人物建立或初始桶用途。別名列為 `source/externalId/targetKind`，`targetKind=Part|Variant`；相反映射拒絕，不重編內部 ID。完整範例與 CLI→SQLite 矩陣見 `tools/catalog/tests/integration/test_catalog_resolve.py`。整份判定以單一交易提交；版本衝突、附件損毀或任一錯列均回滾。完全相同且尚未被後續版本取代的重試不增加版本；Frozen 不允許判定。來源附件及 evidence 由 DB trigger 禁止覆寫／刪除。

`validate` 會重讀來源證據並按基準日核對 Active；交付數 V 不採信單一 Ready／品質布林旗標。現階段未建立可核對的完整品質報告與正式 RuntimeBuild 管線，`unverifiable-quality-report` 等缺口仍拒絕發布；不應用手改資料庫繞過它。退出碼維持 0 成功、2 輸入錯誤、3 門檻不足、4 外部／工具錯誤、5 衝突。

`build`接受Frozen的版本化計畫，預設位置`build-plans/<snapshotId>.json`，亦可用`--plan`。格式為`schemaVersion=1/snapshotId/snapshotVersion/library/importer/items`；library及importer均位於workspace內，item含`variantId/part/colour/metadata`，metadata含`path/sha256`。只執行專案LDraw轉換腳本，Blender與Node從PATH定位並記錄可執行檔／腳本／套件鎖及來源hash；Blender使用`--factory-startup --disable-autoexec`，轉換、Khronos與六視圖共用10分鐘上限。失敗項目保留Failed與安全原因，其餘項目繼續；相同輸入重用已核實產物，輸入變更需新工作鍵／revision。

模型封存`model.glb/metadata.json/conversion.json/khronos-report.json/attribution.json`、`six-views.json`、前後左右上下六張PNG及`preview.png`至不可變內容庫，manifest綁定variant／revision與實際hash。轉換成功僅到Validating，`jobStatus=Completed,exitCode=3,qualityPassed=false`代表製作工作已完成但品質門檻尚不足；不選revision、不切head。metadata可計算檢核含canonical公尺profile、referenceDimensions、bounds、接點正規化／位置容差、可選vehicleMetadata輪尺寸及質量狀態；missing或不合格項目列在`validation_json.metadataChecks`，不是自動品質通過。六視圖由`render_views.py`從實際GLB使用固定CPU渲染設定生成，報告綁定模型hash、工具版本、相機及光照；來源署名保存逐依賴作者、使用條件及原始hash。六視圖產生不等於核准；未有來源外觀及接點配對／碰撞實證者仍不Ready。調度層失敗自動釋放自己的租約，過時worker不能清除接手者租約。完整受控計畫範例與真Blender CLI驗證見`tools/catalog/tests/integration/test_catalog_build.py`。

工作目錄為 `brickhigh/`。本機使用 Python 3.13.14／pytest 9.0.2、.NET SDK 10.0.204、Blender 5.2.1；Node 驗證器依 `tools/catalog/package-lock.json` 固定。C# 測試會還原 NUnit／Newtonsoft.Json 開發相依，不代表玩家需要 .NET SDK 或網路。

```powershell
python -m pytest -q --junitxml=artifacts/test-results/python-20260910.xml
dotnet test tools/tests/BrickHigh.Core.Tests.csproj --nologo --verbosity quiet
dotnet build tools/tests/BrickHigh.Core.Compatibility.csproj --nologo --verbosity quiet
npm ci --prefix tools/catalog --ignore-scripts --no-audit --no-fund
```

真實 Blender 探針另外需要 `blender` 在 PATH、官方 LDraw library 位於 `artifacts/sources/ldraw-release/ldraw`，以及 ImportLDraw 位於 `artifacts/toolchain/ImportLDraw`、commit 為 `c306fb777a4e0da85492f09d65daf458767a0aa1`。缺任一工具時該探針會明確 skip，不能把 skip 算完成；最近既有回歸（9/26）為Python173 passed／Unity EditMode129 passed，無失敗或略過；9/27只做稽核，沒有重跑產品回歸。測試案例數不等於 TDD checklist 完成數。

取得與展開 LDraw 來源後，可在**全新輸出目錄**執行幾何探針：

```powershell
python -m tools.catalog.sources artifacts/sources/ldraw-complete.zip artifacts/sources/ldraw-release
blender --background --factory-startup --python-exit-code 4 --python tools/catalog/blender_convert.py -- --library artifacts/sources/ldraw-release/ldraw --importer artifacts/toolchain/ImportLDraw --part 3001.dat --colour 4 --output artifacts/models/3001-red-new-probe
node tools/catalog/validate_glb.cjs artifacts/models/3001-red-new-probe/model.glb artifacts/models/3001-red-new-probe/khronos-report.json
```

來源：[官方 LDraw complete.zip](https://library.ldraw.org/library/updates/complete.zip)、[ImportLDraw](https://github.com/TobyLobster/ImportLDraw)。本輪來源壓縮檔 SHA-256 為 `d2a695868ed2b3957c45b022a6451908edab22cc043179dd61d18dd382b35e11`；來源更新後不可沿用舊 hash 或聲稱同一 revision。轉換僅在未開啟 blend 的獨立背景程序執行，拒絕覆蓋既有輸出；不修改 `blender/brickhigh.blend` 或使用者偏好設定。

## 下一個驗收關卡

`well-done`已完成本次Phase 4現況稽核；TDD 70/233（30.0%；68 UT、2 IT、0 CT、0 ET）；BDD 5/56（8.9%）；UX 1/20（5.0%）；SPEC 完整驗收條款 2/36（5.6%）。已有8模型內部Player、uGUI、原生launcher及安裝更新局部證據。下一關仍為合格Ready Preview、使用者畫面核准、完整故障／跨版本矩陣及正式效能／全量。功能開發按使用者要求保持停止。

Unity EditMode 使用 `-batchmode -nographics -projectPath <game絕對路徑> -runTests -testPlatform EditMode -assemblyNames BrickHigh.Tests.EditMode -testResults <新的xml> -logFile <新的log>`。不加 `-quit`，由 Test Runner 結束；只計專案 assembly，不把 Addressables 文件範例測試算進完成度。

內部 Player 使用 `-batchmode -projectPath <game絕對路徑> -executeMethod BrickHigh.Editor.ToolchainProbeBuild.Build -quit -logFile <新的log>`。來源固定為有紀錄 hash 的 `artifacts/models/3001-red-exploratory-v1/model.glb`；每次建立新 `artifacts/acceptance/toolchain-<id>/Player`，log 的 `BRICKHIGH_PROBE_BUILD` 列出實際路徑。從 `brickhigh/` 執行 `./tools/acceptance/verify_toolchain_player.ps1 -PlayerDirectory <該Player目錄>`；此程序會產生圖片、報告及故障複本，不碰正式 Profiles。

探針只在 `UNITY_EDITOR` 或建置明確加入的 `BRICKHIGH_TOOLCHAIN_PROBE` 編譯，使用獨立 `com.gamenenstyle.brickhigh.toolchainprobe` 身分，不偽裝 Preview／Release。畫面是 Player 的 Camera RenderRequest（不是 Editor 截圖，也不是使用者桌面操作驗收）；黑圖、遺失 shader 與未釋放引用均須失敗。第一輪黑圖的歷史 `passed=true` 已在 TDD 撤銷畫面證據資格，保留原報告供追溯。

**探針不能直接雙擊當瀏覽器使用**：它要求 `-probe-output <全新報告目錄>`；沒有參數會主動以 exit 2 結束，驗證完成也會退出。請透過上述驗收腳本執行；`BrickHighToolchainProbe.exe` 不是正式玩家啟動入口，也沒有持續操作模式。

**2026-09-26可人工操作的階段成果**：`ToolchainProbeBuild.BuildInteractiveFixture`另產生持續操作的內部預覽包；已安裝版本為`20260926T025815-ef8f8371`，直接執行`C:/bh-qa-wd/20260926-c/BrickHighLauncher.exe`。正常啟動不設定`BRICKHIGH_ACCEPTANCE_OUTPUT`，不會自動操作或退出。這是8件LDraw幾何樣本，尚非合格Preview或全量模型庫。可驗收繁中字型、模型材質／透明外觀、旋轉縮放重設、搜尋（例如3001）與清除、清單、Tab／Shift+Tab／方向鍵／Enter、直式視窗重排。預覽區取得焦點後方向鍵旋轉、PageUp／PageDown縮放、Home重設；文字輸入不操作鏡頭。`artifacts/acceptance/wd-20260926-interactive-c/PlayerEvidence/`保存154張實際Player畫面及`result.json`，同層`run.json`在其父目錄。使用者本次要求階段完成後停下，待視覺驗收回饋再繼續。

預覽控制層現有 `CatalogPreviewPresenter<T>`（純狀態）及 `CatalogPreviewController`（Unity 本機協調）。後者持有 session／provider／instance，提供搜尋、清除、下一頁、選取、重試與主執行緒 `Changed` 通知。畫面應只讀 `State`，透過 controller 操作，不能自行繞過狀態機釋放 ModelLease；退出時 Dispose，畫面自有 render texture 另由畫面釋放。`ReleasingModel` 保證先停用 instance，再釋放共用資產引用。`Presentation/CatalogPreviewView`已接上uGUI、繁中字型、Tab導覽與虛擬清單方向鍵捲動，完整UX／錯誤矩陣仍未驗收。`SubmitSearch`略過未改動欄位的失焦重查，明確搜尋按鈕仍可重新執行。

`PreviewCameraController.Bind(camera, bounds, eventSystem)` 明確借用所屬畫面的透視 Camera 與 EventSystem；只移動鏡頭，不修改模型 transform。將元件放在預覽區域的 uGUI 命中物件上；現行CatalogPreviewView已提供raycast Graphic／Selectable、InputSystemUIInputModule與鍵盤導覽。左鍵拖曳／滾輪由 uGUI 派送；只有預覽區域被選取時才讀方向鍵、PageUp／PageDown、Home。uGUI InputField 取得焦點即阻擋鏡頭輸入並結束舊拖曳，不依賴延遲一幀的 isFocused。解除使用時呼叫 Unbind；元件不銷毀借用的 Camera 或模型。改用其他文字元件時須補上其焦點 adapter 與測試，不能假設已涵蓋所有文字套件。

鏡頭取景使用外接球及視窗較小視角，依來源公尺 bounds 計算距離／裁切面；視窗長寬比變更保留旋轉與縮放，重設可完整取景。新版探針另要求 `previewCameraVerified` 與 `camera-reset.png`、`camera-orbit-zoom.png`、`camera-portrait.png`。這些是實際 Player 的受控事件／相機畫面證據，不是桌面HID操作、完整UI驗收、已核准燈光或六視圖資產品質證據。

新版原生驗收另要求 `previewFlowVerified`／`previewRetryVerified`：真實 SQLite 空結果→清除→完整引用→instance→釋放，以及啟動設定暫時被占用後解除並在同一 controller 重試。舊 build 缺少這些報告欄位，不滿足新版腳本；應重新建置。provider 的暫時初始化失敗只在等待者／租約歸零後清除，重試仍重新驗檔；尚不代表所有初始化故障矩陣已完成。

新版探針的人工 F-Catalog 僅測試 SQLite→固定引用→Addressables adapter，manifest 明列 `purpose=F-Catalog`／`readyAsset=false`；不得用於發布。故障複本放在 `artifacts/acceptance/fault-*` 的短路徑，原檔分別保留為 `sqlite3.dll.disabled`／`original.bundle.backup`。實測 292 字元 bundle 路徑在 Unity Mono 下回報缺檔；短路徑測試只隔離 hash 反例，未解決長路徑安裝相容性。

從 `brickhigh/` 執行 `python tools/acceptance/verify_offline_bootstrap.py --player-directory <該Player目錄>` 可重跑啟動設定反例。舊 Player 曾向回環位址請求 catalog 並逾時；修正後在 0 次 HTTP 請求、0 資產 handle 下回 AssetCorrupt。這是開發端測試工具，非 Player 相依。

最新內部包已使用 `StreamingAssets/Catalog/<packId>` 放置 DB、manifest、私有 catalog 與 bundle。Player 固定頂層 `aa` 只提供初始化 settings／catalog，bytes 必須與選定包索引一致；模型從包內讀取並驗 hash。此單包布局已通過原生探針，但正式發布、完整安裝驗收、多包併發與長路徑驗收仍未完成。人工包在建置後連同 meta 移回 `Assets/ToolchainProbeGenerated`，不當作可發行 Preview 留在專案中。

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
