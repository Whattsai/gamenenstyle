# SPEC-001-BrickModelCatalog: 未停產積木模型庫與共用資產契約

**功能 ID**: `SPEC-001-BrickModelCatalog`
**關聯需求**: [MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
**優先級**: 高
**負責角色**: 模型資產維護者、共用模組開發者
**狀態**: SDD 草案完成，待使用者確認
**最後更新**: 2026-09-08
**建議實作順序**: 本 MVP 第 1 順位
**前置 SPEC**: 無
**本輪邊界**: 僅規劃本 SPEC；尚未生成 BDD／TDD、執行正式風險稽核或開始實作

## 1. 功能概述

建立可追溯來源、可實際載入並持續擴充的未停產樂高積木模型庫，供後續人物、玩家庫存與收藏屋共用。每個納入範圍的實體零件變體均須有正確的 3D 外觀與用途資料；只有零件名稱、圖片、下載連結或占位方塊不算建模完成。

本規格提出目錄判定、模型製作、版本發布、資料與 API 契約，以及模型預覽驗收方式。下述技術選型、判定政策與品質數值均屬本次 SDD 提案，經本階段確認後才成為實作基準。

### 1.1 來源與需求追溯

| MVP 來源 | 本 SPEC 責任 | 本 SPEC 驗收 |
|---|---|---|
| `REQ-001`、故事 001、`DEC-001` | 未停產目錄、實際模型、完整性核對 | `AC-001`～`AC-009`、`AC-017` |
| `REQ-002`、故事 001 | 新貨號增量建模、版本更新與既有引用保存 | `AC-010`、`AC-011` |
| `REQ-003`、故事 002 | 人物組件款式、部位及裝配錨點資料 | `AC-012` |
| `REQ-006`、故事 002／009、`PLAN-001` | 特殊款分類、限定取得來源及建立人物／初始桶資格過濾 | `AC-013` |
| `REQ-005`、`REQ-010`～`REQ-012`、`PLAN-001`、`PLAN-003` | 提供可連接建材、碰撞代理、用途標籤及相容性資料 | `AC-008`、`AC-014`；2026 片抽樣與建屋判定由後續 SPEC 實作 |
| 共用模型存取與後續整合 | API、預覽、維護錯誤與效能 | `AC-015`～`AC-020` |

`PLAN-002` 的每人物領桶、共用收藏屋及建立期半價已在 MVP 確認，本 SPEC 不實作人物建立或發放。其餘 MVP 需求由原切分表追溯至後續 SPEC，不能以本 SPEC 完成宣稱 MVP 全部完成。

### 1.2 範圍

- 納入各系列未停產的積木零件，包含 `System`、`Technic`、`DUPLO`、人物零件及其他官方系列；不同已存在的顏色、印刷、雙色成型、材質或幾何版本均需識別。
- 不建立不存在的「所有零件 × 所有顏色」組合；只納入有來源證據的實際變體。
- 套裝及組合人物用於發現零件，不以整盒套裝代替個別零件建模。不可拆分的出廠組件可作一個零件，並記錄組件關係；可拆分零件不得只以合併模型交付。
- 貼紙紙張、說明書與包裝作來源附件；貼有圖樣的積木可作外觀變體。電子、透明、軟質、布料及可動零件在本版須有靜態外觀與接合資料；通電功能、變形求解、布料模擬與關節動力學不在本 SPEC，不能因此略過其外觀模型。
- 模型庫不代表玩家擁有權。此階段不發放積木、不製作商店、不開發人物或收藏屋編輯器，也不串接真實金流。

## 2. 現況與技術選型

### 2.1 實際查核

2026-09-08 已讀取專案 `GEMINI.md`、`.github/copilot-instructions.md`、`docs/README.md`、`overview/README.md`、`Dockerfile` 及 `blender/bootstrap_blender_mcp.py`。目前未找到應用程式的 `.csproj`、`package.json` 或前後端實作；既有部署檔仍引用 `OrickLineBot` 模板，不沿用為已存在的應用契約。

本機 `Blender 5.2.1 LTS` 已以背景程序、`--factory-startup --disable-autoexec` 唯讀開啟 `blender/brickhigh.blend`，只發現 `Camera`、8 頂點的 `Cube` 與 `Light`。MCP 場景查詢曾回傳連線中斷，後改以上述獨立程序取得證據；未保存或變更既有場景。現況無可核對的積木模型清單。

### 2.2 建議技術棧

| 層級 | 本次選擇 | 理由與限制 |
|---|---|---|
| Domain／Application／API | `C#`、`ASP.NET Core 10` | 延續工作區 C# 分層方向；`.NET 10` 為官方支援中的 LTS，版本依 [Microsoft 支援政策](https://dotnet.microsoft.com/en-us/platform/support/policy) 核對。開發時鎖定可用修補版。 |
| 持久化 | `EF Core 10`、`SQLite` | 本 SPEC 為單一目錄寫入者與讀取服務，不先引入遠端資料庫；整合測試使用真實暫存 SQLite 檔。未來多副本寫入須另做資料庫遷移設計。 |
| 資產製作 | 本機 `Blender 5.2.1 LTS`、版本化的 Blender Python 建模／匯出工具 | 工具記錄版本、輸入及輸出雜湊，批次程序不依賴互動 MCP 連線。既有場景保留，積木各自保存來源資產。 |
| 交付格式 | `glTF 2.0` 的自含 `GLB`、`JSON` metadata、`PNG` 預覽 | 供不同遊戲引擎讀取；發布資產不可依賴玩家直接連線到外部模型站。 |
| 預覽驗收介面 | `Vue 3`、`TypeScript`、`Vite`、`Three.js GLTFLoader` | 延續範本的 Vue 方向，製作獨立的開發用只讀模型預覽頁；不是玩家存放櫃或管理後台。 |
| 測試 | `xUnit`、`Vitest`、`Playwright`、glTF Validator、批次 Blender 品質檢查 | 分別驗證規則、API／資料交易、前端狀態及實際資產。工具精確版本寫入後續 lockfile 與驗收證據。 |

新增路徑建議為 `backend/BrickHigh.{Domain,Application,Infrastructure,API,CatalogCli}/`、`frontend/src/features/catalog-preview/`、`blender/catalog/`、`assets/catalog/`。本次只記錄預計位置，不建立程式骨架。`overview/` 依現有指引待實際實作後同步更新，本階段不把提案寫成已存在架構。

## 3. 目錄基準與停產判定

### 3.1 基準範圍

第一版建議基準為 `2026-09-08 23:59:59 Asia/Taipei`，內部保存 `2026-09-08T15:59:59Z`。此日期是納入判定的截止點，不表示當天已抓取完整快照。後續取得的來源需記錄 `observedAt`、證據適用日期及是否足以回溯至基準日；無法回溯者維持待查，不臆測歷史狀態。

候選集合取零件目錄、官方零件／套裝清單、人物零件展開及模型庫對照的聯集，保留各來源總筆數、分頁／檔案完整性、時間、版本及雜湊。不得只採某地區 Pick a Brick 頁面的可買項目作為全球全部未停產零件。

不同系列、來源缺頁、未成功展開的人物組件及待映射外部貨號都須出現在涵蓋缺口中。系列沒有結果時須有明確證據或缺口紀錄，不當作天然不在範圍。

### 3.2 資料來源分工

| 來源 | 本次使用方式 | 不可推論的事項 |
|---|---|---|
| [LEGO Pick a Brick](https://www.lego.com/en-us/pick-and-build/pick-a-brick)、官方產品及零件清單 | 確認外觀、貨號、變體與官方銷售／供應證據，保存地區及查核日期。 | 缺貨、找不到或某套裝停售不自動表示零件停產；現貨也可能是舊庫存，不能單憑現貨證明仍在生產。 |
| [Rebrickable API v3](https://rebrickable.com/api/v3/docs/) | 使用其建議的 CSV 路徑建立全量候選，API 只補差異與個別對照；人物須展開組件，保留外部 ID。 | API 文件未提供本專案可直接依賴的全球零件停產保證；Rebrickable 不是 LEGO 官方生產狀態來源。 |
| [LDraw Library](https://library.ldraw.org/documentation) | 鎖定官方 library release 作幾何來源，保留子零件、材質及來源關係；找不到者另行建模。 | LDraw 是社群系統，官方 library release 指 LDraw 的發布，不代表 LEGO 官方模型、全量涵蓋或未停產證明。 |
| 人工維護的證據補件 | 補入官方答覆、可核對的生產狀態及貨號對照，記錄附件、判定者、日期與理由。 | 不能只填「同意納入」就把未知停產狀態變成事實。 |

Rebrickable 的全量 CSV 建議、API 認證與限流見其上述官方文件；本次讀取 Downloads 頁面遇到工具 `402`，未下載或驗證全量檔案，不能把此錯誤解讀為必須付費。模型來源使用逐資產授權紀錄；LDraw 現行貢獻協議與歷史授權可能不同，依[實際檔頭及來源](https://library.ldraw.org/documentation/licenses-and-legal/ldraworg-contributor-agreement)保留作者、授權版本與修改說明，不把整個 library 一律標成同一授權。

### 3.3 三態判定

| `productionStatus` | 進入條件 | 本版處理 |
|---|---|---|
| `Active` | 有適用於基準日的明確未停產／仍生產證據，且無未解決的相反證據。 | 加入需建模集合。 |
| `Retired` | 有適用於基準日的明確零件／變體停產證據。 | 排除本版新建模分母，保留排除理由與外部 ID。 |
| `Unknown` | 僅有上市年份、銷售庫存、查無結果，或來源衝突、缺少有效日期。 | 留在待釐清清單；不能隱藏或當成已停產。 |

狀態判定以變體為主：某顏色停產不連帶排除仍生產的其他顏色，同造型貨號不同不自動合併。`Active` 是本專案有證據支持的判定結果，不是外部網站欄位原封照搬。

若來源無法提供足夠生產狀態證據，維護工具及部分資產仍可開發與驗證，但全量交付維持未完成。改採「官方目前販售」作未停產的業務代理條件會改變範圍，需另記明確決策；本 SPEC 不預設替換使用者的「不包含停產」。

### 3.4 完整性與發布門檻

每個 `CatalogSnapshot` 同時報告候選數 `C`、確認未停產數 `A`、確認停產數 `R`、待查數 `U`、來源／系列涵蓋缺口數 `G`、已驗證可交付變體數 `V`。候選完成分類時須滿足 `C = A + R + U`；非積木附件另列具理由的範圍排除，不混入此分式。

- 模型覆蓋率為 `V / A`，`A = 0` 時顯示「尚無已確認基準」，不顯示 100%。
- 分母在快照凍結後不可縮小；修正候選或停產判定建立後繼草稿並呈現差異。
- 全量完成須同時滿足 `A > 0`、`U = 0`、`G = 0`、`V = A`、無映射衝突、所有品質與來源檢核通過，並有涵蓋範圍審查紀錄。
- `V / A = 100%` 僅證明已知基準內的模型完成；只有另完成來源涵蓋審查才能宣稱符合本 MVP 的全部範圍。若不能證明完整性，保留阻斷，不以測試樣本代表全量。
- 快照可為 `Draft`、`Frozen`、`Published`；草稿可供維護者預覽。正式 `Published` 必須符合上述全量門檻。禁止將部分完成快照發布成可供遊戲使用的正式基準。

## 4. 模型與分類契約

### 4.1 身分與外觀

- `PartDefinition`：一個經確認的幾何／出廠組件定義，內部 `partId` 使用不可變 UUID；官方 design ID、Rebrickable part number 與 LDraw filename 另以來源別名記錄。
- `PartVariant`：幾何、顏色、印刷／雙色成型及材質配置的實際組合，使用不可變 `variantId`；element ID 作來源映射，禁止只以顏色名稱當唯一鍵。
- 印刷與多色部分不可因主色替換而消失。同幾何可共用來源 mesh，但每個變體均需可獨立解析、呈現及驗收；去重不能減少變體分母。
- 外部別名不得未經證據自動合併。舊 ID 更正採有方向的 alias／supersedes 關係，既有 `variantId` 及資產版本仍可解析。

### 4.2 建模管線

```text
來源快照與範圍審查
  → 候選／別名／變體整理 → 三態判定 → 凍結需建模集合
  → 幾何取得或製作 → Blender 標準化與外觀修整
  → 接點／碰撞／用途與人物錨點標註
  → GLB + metadata + PNG + 來源與品質報告
  → 全量驗證 → 原子發布快照 → 共用 API 與遊戲取用
```

幾何優先使用有明確來源的 LDraw 官方 library 資產；匯入時解析完整依賴、顏色及面朝向。第一版需實作或整合可驗證的 LDraw→Blender 轉換器，不能假設 Blender 原生具備 LDraw 匯入。標準 primitives 可使用參數式建模；未支援的印刷、紋理、曲面或零件須以 Blender 補建，保留尺寸／圖片參考與檢核報告。

外部轉換器尚未選定或驗證。開發時先以普通磚、薄板、透明件、印刷人物組件、Technic 孔軸及 DUPLO 件做轉換能力驗證，再批次處理；這是開發次序，不是縮小最終交付範圍。Three.js 的 [LDrawLoader](https://threejs.org/docs/pages/LDrawLoader.html) 文件列出的擴充支援不包含完整 `TEXMAP` 保證，不能只因能載入一般磚就宣稱印刷與紋理都受支援。

每項 `ModelRevision` 狀態為 `Pending → Building → Validating → Ready`，任一步失敗轉 `Failed` 並保留原因。重試使用相同工作鍵，已成功且輸入雜湊一致的結果可重用；改動模型、材質、metadata 或工具版本則產生新 revision。`Ready` 必須來自實際報告，不能手動跳過品質檢查。

### 4.3 座標、接點與碰撞

交付統一為右手座標、`+Y` 向上、距離單位公尺、角度弧度；GLB scene root 的 scale 為 `[1,1,1]`，metadata 與 mesh 使用同一座標。`glTF` 的單位與軸向依 [Khronos 規格](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)。

LDraw 原始 `-Y` 向上、`1 LDU ≈ 0.4 mm`，依 [LDraw File Format](https://www.ldraw.org/article/218.html) 轉換：`(x,y,z) → (0.0004x,-0.0004y,-0.0004z)`，旋轉接點法向及切線時採相同旋轉、不套長度比例。不要再套第二次 Blender／glTF 軸向變換。參考測試必須檢查非對稱模型，避免僅以對稱磚漏掉鏡像錯誤。

| Metadata | 最低內容與不變量 |
|---|---|
| `bounds`、`referenceDimensions` | 有限數值、正尺寸；保存局部軸向、基準點與來源尺寸。幾何包圍盒容差為每軸 `max(0.1 mm, 0.5% × 參考尺寸)`。 |
| `connectors[]` | `id`、`family`、`profile`、局部 `position`、`normal`、`tangent`、對接側別及自由度。向量正規化；接點位置須有對照驗證，誤差不超過 `0.05 mm`。 |
| `compatibilityProfiles` | 版本化的相容配對表，至少涵蓋實際出現的 stud/tube、Technic pin/hole、axle、clip/bar、ball/socket；新型接點以明確新 profile 擴充。相同 family 不直接視為可接合。 |
| `collisionProxy` | 由盒、凸多面體或多個簡化形狀組成；可接合的空腔不得一律以整體包圍盒封死。碰撞代理需與接點配對 fixture 一起驗證。 |
| `characterAttachments[]` | `slot`、錨點、相容人物規格及單件／組件關係；不以 `DUPLO` 與一般人物同名部位推定可裝配。 |
| `structuralRoles[]` | 已驗證可作 `floor`、`wall`、`roof`、`opening` 的用途標籤，以及相容建造系統。標籤不等於收藏屋完成判定。 |

沒有外部接點的裝飾件可使用空 `connectors` 並記錄原因；需要接合卻未定義接點者不可標記 `Ready`。複雜軟質／可動零件使用一個明確基準姿態與外部接點，本版不保證任意姿態下的碰撞或力學。

### 4.4 款式與用途

款式是遊戲規則，不能從售價、印刷存在與否或 LDraw 類別臆測。每個變體在版本化的分類清單記錄 `tier = Basic | Advanced | Special`、`allowedAcquisitionSources`、`characterSlots`、`creationEligible`、`bucketEligible` 及 `buildSystems`。

- `Special`：`creationEligible=false`、`bucketEligible=false`；取得來源只能是已定義的聯名、成就或活動規則，不因模型存在自動發放。
- `Basic`／`Advanced`：人物可用部位須符合錨點相容資料；普通建材能否放入初始桶須依已驗證連接／碰撞能力標記，不能預設所有外觀資產都可抽取。
- 所有分類需有理由與維護紀錄，未分類項目不進入正式發布；分類資料不是玩家庫存或商品價格。
- 保證初始建屋的必備建材候選需落在同一相容建造系統中，且涵蓋 `floor`、`wall`、`roof`、`opening`。本 SPEC 提供可用集合與接合 fixture；實際建屋配方、尺寸與 2026 片分配由後續庫存／收藏屋 SPEC 完成。

## 5. 領域設計與資料結構

### 5.1 DDD 邊界

| 聚合根 | 管理範圍 | Repository／服務 |
|---|---|---|
| `PartDefinition` | 內部零件 ID、幾何身分、來源別名及不可拆組件關係 | `IPartRepository` |
| `CatalogSnapshot` | 基準日期、候選 membership、判定／分類版本引用、涵蓋審查及發布狀態 | `ICatalogSnapshotRepository`、`CatalogCoveragePolicy` |
| `ModelRevision` | 變體輸入、來源資產、工具版本、輸出檔案與品質報告 | `IModelRevisionRepository`、`ModelValidationService` |
| `CatalogJob` | 匯入／建模／驗證工作、進度、租約與重試 | `ICatalogJobRepository` |

Value Objects 包含 `ExternalPartReference`、`EvidenceReference`、`VariantKey`、`AssetDigest`、`ConnectorProfile`、`Transform`、`CatalogVersion`。`PartVariant` 為零件聚合下的識別實體；大量變體分頁查詢，禁止把整個 library 一次載入聚合記憶體。

Application 透過 `ImportCatalog`、`BuildModelRevision`、`ValidateSnapshot`、`PublishSnapshot`、`QueryCatalog` 協調；Domain 不呼叫網路、Blender 或檔案系統。Infrastructure 實作來源 adapter、SQLite、內容定址資產庫及受控 Blender worker；API／CLI 共用相同 application handlers。

### 5.2 Schema

UUID 欄位以 SQLite `TEXT` 存放；時間一律 UTC ISO 8601；數量使用非負 `INTEGER`。JSON 欄位保存 `schemaVersion=1` 並在 application 層驗證結構；FK 啟用且禁止刪除被引用紀錄。

| 表 | 主鍵及主要欄位 | 約束 |
|---|---|---|
| `parts` | `part_id PK`、`name`、`family`、`geometry_identity`、`version` | 內部 ID 永不重新分配。 |
| `variants` | `variant_id PK`、`part_id FK`、`variant_key`、`appearance_json` | `UNIQUE(part_id, variant_key)`；材質／印刷及色碼來源包含在 key 中。 |
| `external_refs` | `source`、`external_id`、`target_kind`、`target_id`、`evidence_id` | 同一來源 ID 若有多個候選映射，先存工作區衝突，不能直接寫入確定映射；確定映射 `UNIQUE(source,external_id,target_kind)`。 |
| `source_artifacts` | `artifact_id PK`、`source_uri`、`observed_at`、`effective_at`、`digest`、`storage_key`、`license_json` | 原始內容不可變；保存來源版本及已取得檔案清單。 |
| `evidence` | `evidence_id PK`、`artifact_id FK`、`subject_ref`、`claim`、`effective_from/to`、`reviewer`、`reason` | 狀態判定必須可追到來源內容，不只保存 URL。 |
| `snapshots` | `snapshot_id PK`、`baseline_at`、`parent_id FK`、`status`、`scope_manifest_json`、`coverage_review_json`、`compatibility_profiles_json`、`version` | 凍結後範圍與規則不可修改；發布需匹配預期 version。 |
| `snapshot_entries` | `snapshot_id FK`、`variant_id FK`、`production_status`、`evidence_ids_json`、`classification_json`、`display_projection_json`、`selected_revision_id FK` | `PK(snapshot_id,variant_id)`；所選 revision 必須屬於該變體；投影保存名稱、外觀與來源別名。 |
| `coverage_gaps` | `gap_id PK`、`snapshot_id FK`、`source`、`family`、`kind`、`resolution_evidence_id` | 未解決項目計入 `G`，不能藉刪除解除阻斷。 |
| `model_revisions` | `revision_id PK`、`variant_id FK`、`input_digest`、`toolchain_json`、`status`、`manifest_json`、`validation_json` | `UNIQUE(variant_id,input_digest)`；狀態按允許轉移規則更新。 |
| `jobs`／`job_items` | `job_id PK`、`idempotency_key`、`input_digest`、`kind`、`status`、`lease_until`、`attempts`；逐項 input hash、結果及錯誤 | 相同工作鍵與輸入重用；鍵相同但輸入不同回衝突。 |
| `catalog_head` | 單列 `id=1`、`snapshot_id FK`、`version` | 交易內比較版本後切換，併發發布只有一個成功。 |

所有已發布回應使用 snapshot 中凍結的名稱／別名／分類投影及指定 revision，不直接 join 可變的最新工作資料產生歷史內容。歷史資產可因新目錄的停產判定停止新取得，但保留精確版本讀取，避免後續玩家已存檔模型失效。

`Frozen` 固定候選、證據、分類與相容規則，但仍可記錄建置結果、更新所選 revision 及驗證報告，每次操作遞增 version。`Published` 的內容及模型選擇完全不可變。凍結後若需解決未知判定、補來源或修正分類，建立後繼 Draft，可重用輸入未變且已通過的模型，不能在原快照悄悄改分母。新貨號若晚於基準日推出，必須在採用較新基準日的後繼快照納入。

### 5.3 資產布局與不可變性

每個 revision manifest 包含 `variantId`、`revisionId`、`schemaVersion`、來源／工具版本、`model.glb`、`metadata.json`、`preview.png`、`attribution.json` 與品質報告的 SHA-256、位元組數及儲存鍵。實際檔案存於 `assets/catalog/objects/{sha256}/`；以生成的 storage key 存取，不接受任意本機路徑。

先寫 staging、校驗所有檔案並搬入不可變內容庫，再在資料庫交易內選定 revision／發布快照。檔案失敗不更新 head；資料交易失敗可能留下未引用內容，由後續明確維護工作清理，不在本版自動刪除。已發布檔案不得覆寫；相同 key 內容不同時回報損毀。

## 6. API 與維護介面

### 6.1 共用讀取 API

Base path 為 `/api/v1/catalog`。模型目錄本身不包含玩家資料；下載模型不授予擁有權或裝備權。正式 API 僅回傳已發布快照，draft 查詢只在開發預覽模式使用。未知欄位／枚舉／參數回 `400`，找不到資源回 `404`，尚無發布版本回 `503 CATALOG_NOT_PUBLISHED`。

| Method / Path | 參數／結果 |
|---|---|
| `GET /current` | `snapshotId`、`baselineAt`、`schemaVersion`、`counts`、manifest digest。 |
| `GET /snapshots/{snapshotId}/variants` | `q`（貨號精確優先、名稱部分匹配）、`family`、`tier`、`slot`、`purpose=Browse\|CharacterCreation\|InitialBucket`、`buildSystem`、`cursor`、`limit`。 |
| `GET /snapshots/{snapshotId}/variants/{variantId}` | 變體與所選模型 revision、外觀、用途、錨點／連接資訊、資產 URL；不存在於該 snapshot 回 `404`。 |
| `GET /snapshots/{snapshotId}/compatibility-profiles` | 該快照的相容 profile 清單與配對規則版本。 |
| `GET /snapshots/{snapshotId}/coverage` | 基準範圍、分類數與模型完成數；對公開回應省略內部 reviewer 及本機路徑。 |
| `GET /assets/{sha256}/{assetName}` | manifest 中已登錄且被已發布快照引用的資產；`assetName` 僅容許固定清單，驗證不存在路徑跳脫。 |

分頁預設 `limit=50`，上限 `100`，依不可變 `variantId` 排序。cursor 綁定 `snapshotId`、過濾條件雜湊與最後 ID；參數不一致回 `400 INVALID_CURSOR`，不可偷偷換到最新快照。最新入口先解析 `/current`，後續整個讀取流程固定 snapshot，避免更新時跨版本漏項或重複。

`CharacterCreation` 排除 `Special` 且須 `creationEligible=true`；`InitialBucket` 須 `bucketEligible=true`、非特殊款且符合指定建造系統。`Browse` 只是模型查詢，不是玩家收藏櫃。正式回應均排除 `Retired`、`Unknown` 與未 `Ready` 的資產。

### 6.2 回應範例

以下 UUID、貨號與模型數字僅為測試格式範例，不代表實際未停產清單或已建模資產。

```http
GET /api/v1/catalog/snapshots/11111111-1111-4111-8111-111111111111/variants?purpose=InitialBucket&buildSystem=System&limit=50
Accept: application/json
```

```json
{
  "schemaVersion": 1,
  "snapshotId": "11111111-1111-4111-8111-111111111111",
  "items": [{
    "variantId": "22222222-2222-4222-8222-222222222222",
    "partId": "33333333-3333-4333-8333-333333333333",
    "name": "測試用基本磚",
    "tier": "Basic",
    "productionStatus": "Active",
    "buildSystems": ["System"],
    "characterSlots": [],
    "creationEligible": false,
    "bucketEligible": true,
    "structuralRoles": ["wall"],
    "modelRevisionId": "44444444-4444-4444-8444-444444444444"
  }],
  "nextCursor": null
}
```

詳情回應另含 `assets` 陣列，每項為 `{kind, url, sha256, byteLength, mediaType}`，`sha256` 必須為 64 位小寫十六進位。長期存檔引用使用 `snapshotId + variantId + modelRevisionId`，不能保存 `/current` 的可變語意作模型版本。

```json
{
  "type": "urn:brickhigh:error:catalog-not-published",
  "title": "模型庫尚未發布",
  "status": 503,
  "code": "CATALOG_NOT_PUBLISHED",
  "traceId": "test-trace-001"
}
```

API 不回傳外部供應商 API key、完整磁碟路徑或原始 exception。metadata 回應帶 ETag；內容定址資產可長期 immutable cache，`/current` 必須重新驗證。沒有 body 的條件式命中使用 `304`。

### 6.3 維護 CLI

本版寫入流程走本機 CLI，不開放網際網路維護 API，也不新增登入／權限產品功能。維護者使用作業系統帳號權限存取資料庫與 staging；正式讀取服務對已發布模型只讀。

| 指令契約（預計） | 輸入與輸出 |
|---|---|
| `catalog import --manifest <path> --job-key <key>` | manifest 引用已取得的來源檔及 SHA-256、日期／來源範圍；回傳 `jobId`、候選與衝突摘要。來源下載是獨立 adapter 工作，不接受任意遠端 URL 交由伺服器抓取。 |
| `catalog resolve --snapshot <id> --decisions <path>` | 批次帶入判定證據、分類及映射；驗證所有引用存在，只能修改 Draft。 |
| `catalog freeze --snapshot <id> --expected-version <n>` | 固定來源與 membership；`Unknown` 可保留供模型製作，但必須明列為發布阻斷。 |
| `catalog build --snapshot <id> --job-key <key>` | 為 `Active` 變體排程或恢復模型建置；逐項記錄輸入與結果。 |
| `catalog validate --snapshot <id>` | 全量核對來源涵蓋、分類、模型、連接與交付檔案，輸出機器可讀 JSON 及摘要。 |
| `catalog publish --snapshot <id> --expected-head-version <n>` | 重新驗證發布門檻並原子切換 head；成功回 snapshot 與 digest，失敗不影響舊版本。 |
| `catalog status --job <id>` | 顯示成功、失敗、待處理數及各失敗原因，可恢復中斷工作。 |

Exit code：`0` 成功、`2` 輸入不合法、`3` 規則／發布門檻未滿足、`4` 外部或工具失敗、`5` 版本／工作鍵衝突。非零不得顯示全量成功。匯入檔解析失敗保留整批未完成狀態，不把讀到的部分資料當作來源完整快照。

## 7. 預覽 UI 與操作狀態

`/catalog-preview` 僅為開發／驗收模式的只讀介面，綁定 loopback，正式部署預設停用。可讀 Frozen 或 Draft 的已產出候選並明確標示「驗收預覽／未發布」，不提供商品、玩家庫存或購買按鈕。

配套只讀路由使用 `/internal/catalog-preview`：`GET /snapshots` 列出維護快照，`GET /snapshots/{id}/variants`、`GET /snapshots/{id}/variants/{variantId}`、`GET /snapshots/{id}/coverage` 及 `GET /assets/{sha256}/{assetName}` 重用正式 DTO 並額外回傳建置狀態，允許預覽候選資產。需同時啟用 Development 設定與本機 loopback 連線，否則路由不開放；不得利用公開資產端點繞過草稿限制。

頁面左側為搜尋、系列／款式／部位篩選與分頁清單；右側顯示所選變體的 3D 模型、旋轉／縮放／重設視角及尺寸／版本／來源摘要。視窗較窄時清單置上、預覽置下。一次只載入一個詳細模型，列表以預覽圖呈現。

| 狀態 | 畫面行為 |
|---|---|
| 初次載入 | 顯示載入狀態；成功後列出目錄。尚無資料時說明尚未匯入，保留搜尋區，不顯示假的示範收藏。 |
| 搜尋無結果 | 顯示「找不到符合條件的模型」及清除篩選操作。 |
| 選取／換色／印刷變體 | 依 variant 載入對應 GLB；保留讀取中狀態，取消或忽略過時請求，舊回應不可蓋掉新選項。 |
| 模型缺漏／載入失敗 | 顯示該變體不可預覽及重試，不以方塊代替並標記成功。其他清單項目仍可選擇。 |
| WebGL 不可用 | 顯示預覽圖與文字原因；此狀態不算 3D 呈現驗收通過。 |
| 快照更新 | 目前頁面仍讀取原快照，提示可載入新版本；主動切換後重設 cursor 與所選模型。 |

搜尋、篩選、重試及清單選取可使用鍵盤；圖形預覽附零件名稱、變體與尺寸的文字資訊。離開頁面或切換模型時釋放 GPU 幾何、材質及紋理，避免反覆瀏覽累積記憶體。

## 8. 品質、效能與錯誤策略

### 8.1 每個變體的完成定義

每個 `Ready` revision 均須有非空可渲染 mesh、完整材質／紋理、正確版本與變體映射、可解析 metadata、來源清單、glTF Validator 無 error 的報告、軸向／尺寸檢核、連接／人物錨點檢核及前後左右上下六視圖。警告須逐類記錄處理或可接受原因；不可無條件忽略。

幾何家族可共用尺寸與接點驗證結果，但每個顏色／印刷變體仍要渲染、檢查材質指派並與其來源外觀核對。每個 revision 保存通過／失敗結果與檢核工具版本；失敗者不能僅靠人工改旗標發布。

GLB 必須自含所有 buffer／紋理，不得從外部 URI 補抓；只用標準 PBR／alpha 外觀及經預覽工具驗證的擴充。未支援材質轉成有對照報告的標準表示；不能忽略透明／印刷等原始外觀。

### 8.2 可量測目標（本次設計提案）

| 指標 | 驗收環境與門檻 |
|---|---|
| 目錄列表 | 使用至少 `max(100000, A)` 筆 metadata 的效能資料集，在 4 vCPU／8 GiB、SSD、單節點本機資料庫下，10 個並行讀取、暖機後 1000 次查詢的 P95 ≤ 500 ms；不含資產傳輸。 |
| 變體詳情 | 同環境、無外部資料來源即時呼叫，P95 ≤ 300 ms。 |
| 首次 3D 顯示 | 桌面 Chromium、WebGL2、8 GiB RAM 及可用硬體加速，1080p、20 Mbps／50 ms 模擬網路；5 MiB 以下單模型從選取至首幀 ≤ 5 秒。 |
| 資產預算 | 每個 GLB ≤ 20 MiB、每張紋理 ≤ 2048×2048、預覽圖 ≤ 256 KiB；超過者列為待最佳化，不以無聲降材質或刪印刷解決。大於 5 MiB 模型的首幀門檻按傳輸時間 `大小/20 Mbps + 3 秒`。 |
| 瀏覽穩定性 | 同一組 20 個模型循環切換 5 輪，GPU 幾何／紋理資源數不逐輪單調成長；驗收記錄瀏覽器與顯示裝置。 |

上述數值是規劃目標，非本次已測得結果。全量建模工期與磁碟需求須於候選清單及代表模型完成後估算，不在缺少分母時承諾天數或固定模型總數。

### 8.3 失敗與重試

- 外部來源 timeout、`429` 或服務中斷：保存中斷點、尊重 `Retry-After`，最多自動重試 3 次後保留待恢復；不得因失敗把來源清單清空或判定所有零件停產。API 使用憑證由環境提供，僅放 Authorization header，不存入 URL 或報告。
- 匯入映射衝突、缺必要欄位、基準日期不明：回報具體來源列與原因；沒有完整檔案核對結果不得標示來源完成。
- Blender worker timeout（每資產預設 10 分鐘）、crash 或非零結束：只將該工作項標失敗，繼續獨立項目；不自動延長到無上限。每個子程序停用自動腳本執行，僅執行專案維護的工具。
- 缺子零件、未知材質／擴充、尺寸或連接驗證失敗：不輸出可發布模型；列明需補件／修模項目。
- 磁碟空間不足、hash 不符、metadata 與 mesh 不符：保留舊快照，發布失敗並回報可定位的工作 ID。
- 多個寫入工作：SQLite 單寫入者排程，工作持有到期租約；恢復時依已完成 item/hash 去重。發布使用 head version compare-and-swap，衝突者重新讀取與驗證。
- 匯入路徑／壓縮檔成員路徑越界、外部 GLB URI：拒絕；讀取 API 不接受任意來源 URL、SQL、腳本或磁碟路徑。

## 9. 驗收標準與測試策略

### 9.1 驗收清單

| ID | 可測試條件 |
|---|---|
| `AC-001` | 快照保留基準日期、來源 artifact／hash、各系列覆蓋與審查結果；來源缺頁不能被標示為完整。 |
| `AC-002` | 已停產變體不進入新建模分母；未知、單純缺貨、舊現貨及相反證據不自動推成 Active 或 Retired。 |
| `AC-003` | 同幾何不同實際顏色／印刷可獨立識別，外部 ID 衝突被攔截；某變體停產不排除其他 Active 變體。 |
| `AC-004` | 全部未停產候選在固定快照中逐項有 revision；無法證明全量時報告 U／G 等缺口，禁止宣稱已完成。 |
| `AC-005` | 每個交付 GLB 可由實際 glTF loader 呈現；空 mesh、占位方塊、缺紋理或錯誤印刷不能通過品質驗證。 |
| `AC-006` | LDraw 轉換／自建模型的軸向、單位、法向及參考尺寸通過指定容差，非對稱件沒有鏡像。 |
| `AC-007` | 每份外觀變體保留來源、作者／授權資訊、原始與輸出 hash、工具版本及六視圖證據。 |
| `AC-008` | 接點、相容 profile 與碰撞代理可用配對 fixture 驗證，合法插接不因封閉包圍盒被擋；不相容系列不能因同名接點通過。 |
| `AC-009` | 存在 `Unknown`、來源缺口、分類缺漏、Failed revision 或品質錯誤時，發布失敗且現有 head 不變；空基準不顯示 100%。 |
| `AC-010` | 新貨號或模型修正建立後繼 snapshot／revision；匯入或建置重試不產生重複變體／結果。 |
| `AC-011` | 新快照生效後，舊 snapshot 與 revision 可依精確 ID 讀取；不得因停產或分類改動讓既有存檔模型失效。 |
| `AC-012` | 人物組件有 tier、部位、錨點與相容規格；每個基本部位至少有可供下一份人物規格使用的有效候選，缺候選明確阻斷。 |
| `AC-013` | `Special` 在人物建立與初始桶查詢均不可取得；直接查詢模型不改變任何玩家權益。 |
| `AC-014` | 至少一個相容建造系統提供可構成地板、牆面、屋頂與出入口的有效建材集合；傳出可供後續配方與建屋驗證使用的 metadata。 |
| `AC-015` | 列表／詳情／相容規則均固定同一 snapshot；cursor 在同條件無漏項／重複，跨條件使用被拒絕。 |
| `AC-016` | 預覽完整涵蓋載入、無結果、模型失敗、WebGL 不可用、快速切換及重試；失敗不顯示假的成功模型。 |
| `AC-017` | 全量交付報告滿足 `A>0`、`U=0`、`G=0`、`V=A` 及所有品質門檻，列出原始清單與每個變體證據；測試資料不列入實際資產分母。 |
| `AC-018` | 外部中斷、解析錯誤、worker crash、重複工作鍵與檔案／DB 發布失敗均有可恢復結果，且不破壞已發布版本。 |
| `AC-019` | API 對非法輸入、越界路徑、未發布資產及敏感錯誤正確拒絕；正式部署不暴露 draft 預覽與寫入 CLI。 |
| `AC-020` | 第 8.2 節效能與資源回收目標具有可重跑的測試環境、數據及結果。 |

### 9.2 測試分層

- Domain 單元測試：三態證據、變體唯一性、分類與用途、快照凍結／發布門檻、版本轉移、連接配對，涵蓋 `AC-001`～`AC-004`、`AC-008`～`AC-014`。
- 資料／服務整合：真實 SQLite FK／unique／transaction、檔案庫、工作租約、匯入重試與 head 競爭；涵蓋 `AC-009`～`AC-011`、`AC-015`、`AC-018`、`AC-019`。不以 EF InMemory 代替交易驗收。
- 模型管線測試：先用最小、可核對幾何與反例驗證軸向／材質／印刷／連接，再對所有實際納入的變體批次檢查 `AC-005`～`AC-008`、`AC-017`；來源取得測試與離線可重跑測試分開。
- API 契約：篩選、分頁、schema、錯誤、cache 與 snapshot 一致性；前端測試驗證請求競態及狀態呈現。
- E2E：實際匯入受控 fixture → 建置模型 → 驗證 → 發布 → API → 瀏覽器旋轉／選取變體；不得在此端對端流程 mock 掉 Blender 與 GLB loader。
- 全量資料驗收與效能測試分別保存 manifest／資產報告及負載環境；fixtures 通過只證明工具行為，不能取代真實全量交付。

以上為 SDD 測試策略，不是已執行測試，也不是已生成的 BDD／TDD。取得本 SPEC 確認後，逐項生成 Scenario 與 TDD case ID，並保留本表追溯。

## 10. 風險與需審閱的設計決策

| 風險 ID | 實際影響 | 本次設計處理／目前狀態 |
|---|---|---|
| `RISK-001` | 目前尚無已驗證的全球未停產零件快照；僅靠售價／現貨無法確認生產狀態，可能長期無法完成全量門檻。 | 三態與來源涵蓋審查；未知不當停產。若要改採官方販售清單需明確改需求。尚未消除。 |
| `RISK-002` | 社群模型可能缺新零件、印刷或特殊系列，工具完成仍不代表所有模型完成。 | 保留逐件缺口、自建補模路徑與全量分母；開發中估算工作量。尚未取得數量。 |
| `RISK-003` | 模型載入正常但接點／碰撞錯誤，後續玩家仍無法搭屋或裝人物。 | 接點與碰撞配對 fixture、人物錨點與相容系統一起驗收；建屋配方留在後續 SPEC。 |
| `RISK-004` | 多款式／印刷辨識或來源 ID 合併錯誤會造成玩家取得錯誤外觀。 | 幾何與變體分離、映射衝突隔離、分類逐項記錄與變體渲染驗收。 |
| `RISK-005` | 第三方資產來源與使用條件不清，無法形成可交付模型包。 | 逐資產保存來源／授權與作者；資料不足者列缺件而非默認可用。 |
| `RISK-006` | 全量模型與大量高細節資產可能超過下載／顯存預算。 | 分頁、按需載入、內容去重與每資產預算，使用實際模型量測後回報；不預先承諾建模工期。 |
| `RISK-007` | 只確認三項 MVP 規則，尚未確認本 SPEC 的工具、資料基準與發布門檻。 | 本階段交付完整規格供確認；尚未進入 BDD／TDD 或可開發交接。 |

本次重點審閱：以 2026-09-08 為基準且保持跨系列／外觀變體範圍；嚴格區分生產狀態與銷售庫存；採用可追溯 LDraw／Blender 補建與 GLB 交付；以全量與品質門檻控制正式發布；採用單一寫入者的本機模型維護管線與共用讀取 API。這些是本 SPEC 的提案，不將使用者先前「三項皆同意」延伸為此階段已確認。

## 11. 實作順序、依賴與後續文件

本 SPEC 內部建議依序完成：領域規則與來源清單 → 匯入／證據與快照 → 代表模型的轉換及品質驗證 → 全量建模與補件 → 發布／API → 預覽整合與全量驗收。可先完成工具並呈現真實缺口，但只要全量模型尚未完成，SPEC 實作狀態不得改為全部完成。

| 後續 SPEC | 使用本 SPEC 的契約 |
|---|---|
| `SPEC-001-PlayerInventory` | 固定變體與 revision 引用、初始桶用途與相容系統篩選；實作 2026 片、必備建材配方及領桶去重。 |
| `SPEC-001-PurchaseEntitlements` | 款式、變體識別與可發放對象；價格、優惠與模擬交易由該 SPEC 負責。 |
| `SPEC-001-CharacterManagement` | 部位、款式及錨點相容資料；人物建立、半價整合及多人物流程由該 SPEC 負責。 |
| `SPEC-001-CollectionHouseAndGameAccess` | 尺寸、接點、碰撞與建材用途；建屋完成判定與遊戲入口由該 SPEC 負責。 |

後續規劃文件完整名稱固定如下，目前皆尚未建立：

- `docs/bdd/SPEC-001-BrickModelCatalog-BDD.md`
- `docs/tdd/SPEC-001-BrickModelCatalog-TDD.md`
- `docs/specs/SPEC-001-BrickModelCatalog-RiskAudit.md`（若採獨立報告）

本 SPEC 確認後，由 `bdd-feature-generation` 生成 BDD／TDD，再由 `pre-implementation-risk-gap-audit` 逐項稽核。所有風險決策與補回項目完成後，才在本 SPEC 的 TDD 末尾寫入 `well-done` 交接。現在沒有 `Ready for well-done` 狀態，不開始下一份 SPEC。

## 12. 參考資料與驗證紀錄

外部來源均於 2026-09-08 查核；上文已在對應事實處提供官方／來源維護者連結。另參考 [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) 的 glTF 2.0 載入契約。Blender 最新線上匯出手冊本次未能成功讀取，未據此宣稱轉換器已驗證；實作前仍須用本機 exporter 與代表資產跑通管線。

- 規劃依據：來源 MVP 與本機實際檔案；外部來源調查不是完成下載／建模證據。
- 本次只修改 Markdown，交付前執行 `git diff --check`，並核對 SPEC 編號、來源與文件包名稱。
- 程式碼、模型與應用測試尚未實作／執行；背景 Blender 檢查僅用於確認既有場景內容。
