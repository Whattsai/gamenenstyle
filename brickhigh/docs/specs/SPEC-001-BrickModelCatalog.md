# SPEC-001-BrickModelCatalog: 未停產積木模型庫與共用資產契約

**功能 ID**: `SPEC-001-BrickModelCatalog`
**關聯需求**: [MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
**優先級**: 高
**負責角色**: 模型資產維護者、共用模組開發者
**狀態**: Unity 單機版 SDD 修訂完成，待細部規格確認；引擎與畫面方向已確認
**最後更新**: 2026-09-09
**建議實作順序**: 本 MVP 第 1 順位
**前置 SPEC**: 無
**本輪邊界**: 僅規劃本 SPEC；尚未生成 BDD／TDD、執行正式風險稽核或開始實作

## 1. 功能概述

建立可追溯來源、可實際載入並持續擴充的未停產樂高積木模型庫，供後續人物、玩家庫存與收藏屋共用。每個納入範圍的實體零件變體均須有正確的 3D 外觀與用途資料；只有零件名稱、圖片、下載連結或占位方塊不算建模完成。

2026-09-09 使用者已同意可下載安裝、資料全在地端的 Unity／URP 單機方向。本修訂據此定義目錄判定、模型製作、Unity 匯入、本機資產包、程式內介面及安裝驗收；取代原先以網頁與本機服務為中心的草案。引擎與畫面方向無須重複確認，新的座標、套件、安裝／資料版本與測試細節在本份 SDD 供審閱。

本 SPEC 只建立共用模型與最小原生預覽交付，不實作人物、庫存、建屋或賽車玩法；後續模組在同一 Unity Player 內使用本契約。

### 1.1 來源與需求追溯

| MVP 來源 | 本 SPEC 責任 | 本 SPEC 驗收 |
|---|---|---|
| `REQ-001`、故事 001、`DEC-001` | 未停產目錄、實際模型、完整性核對 | `AC-001`～`AC-009`、`AC-017` |
| `REQ-002`、故事 001 | 新貨號增量建模、版本更新與既有引用保存 | `AC-010`、`AC-011` |
| `REQ-003`、故事 002 | 人物組件款式、部位及裝配錨點資料 | `AC-012` |
| `REQ-006`、故事 002／009、`PLAN-001` | 特殊款分類、限定取得來源及建立人物／初始桶資格過濾 | `AC-013` |
| `REQ-005`、`REQ-010`～`REQ-012`、`PLAN-001`、`PLAN-003` | 提供可連接建材、碰撞代理、用途標籤及相容性資料 | `AC-008`、`AC-014`；2026 片抽樣與建屋判定由後續 SPEC 實作 |
| 共用模型存取與後續整合 | 程式內查詢、Unity 預覽、維護錯誤與效能 | `AC-015`～`AC-020` |
| `REQ-016`～`REQ-019`、`DEC-003`～`DEC-006` | 本機安裝基礎、離線模型包、Unity 畫面、更新／存檔相容邊界 | `AC-021`～`AC-026` |
| [MVP-002-BrickRace](../requirements/MVP-002-BrickRace.md) 共用模型需求 | 輪組幾何、質量資料欄位、尺度與複合碰撞相容性；不承擔正式車輛性能與賽道驗收 | `AC-008`、`AC-024`；業務演算法留待 MVP-002 |

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


### 2.2 已確認架構與本次具體選型

| 層級 | 選擇 | 實作邊界 |
|---|---|---|
| 玩家執行環境 | `Unity 6.3 LTS`、`C#`、Windows x86-64 原生 Player | 首版以 Windows 10／11 x64、DirectX 11 為驗收平台；採 Mono scripting backend，依 Unity 支援的 `.NET Standard 2.1` API profile 撰寫共用程式。正式鎖定 editor 修補版及套件版本後才產出發行包。 |
| 渲染／UI | `URP`、`uGUI`、`Input System` | 塑膠積木、橡膠、透明與印刷材質；玩家介面與模型預覽均在引擎內，不啟動瀏覽器或 HTTP listener。 |
| 遊戲內模組 | `BrickHigh.Domain`、`Application`、`Infrastructure`、`UnityPresentation` assembly definitions | 直接呼叫 C# 契約；Domain 不引用 `UnityEngine`，Unity 物件只在呈現／載入層處理。 |
| 本機資料 | 唯讀 `catalog.db` ＋後續模組的可寫 `player.db`，均使用 SQLite | 本 SPEC 實作目錄讀取與存檔相容檢查，玩家資料表仍由後續 SPEC 定義。遊戲不用 ORM；以 SQLite 原生 C API 與 Unity 相容的薄 C# adapter 執行參數化 SQL，Windows x64 native library 隨包交付。 |
| 模型來源 | Blender 與 LDraw／自建來源 → `GLB` ＋ metadata | Blender 僅為開發依賴，不在玩家電腦批次建模。模型來源與權利資訊保存在開發端。 |
| Unity 資產轉換 | Unity `glTFast` Editor import → Prefab／Mesh／Material → 本地 Addressables | GLB 為製作／交換格式，正式遊玩載入預先轉換的 Unity 資產；不在每次啟動解析全量 GLB。 |
| 建置工具 | Blender Python、開發端 Python／SQLite 工具、Unity Editor batchmode | 開發端可取得外部來源；玩家的執行、存檔與資產讀取不需網路。 |
| 測試 | Unity Test Framework 的 EditMode／PlayMode、Standalone Player 測試、SQLite 整合、glTF Validator | 移除網頁 E2E 與伺服器效能指標；實測安裝包、離線初啟與實際 GPU／物理行為。 |

Unity 的 API profile 與一般 .NET runtime 並不相同，依 [Unity 6.3 相容性文件](https://docs.unity3d.com/6000.3/Documentation/Manual/dotnet-profile-support.html) 選 `.NET Standard 2.1`；原 `.NET 10／EF Core 10` 不列為 Unity Player 相依套件。SQLite adapter 必須先在實際 Windows Player 完成原生 DLL 載入、唯讀查詢、交易、中文路徑與中斷恢復測試，不能只以 Editor 通過認定可發行。

[Unity glTFast](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.14/manual/index.html) 提供 Editor 匯入，支援 URP；[Addressables](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/AddressableAssetsOverview.html) 用於本地資產載入。實作先以相容的 `glTFast 6.14.x`、`Addressables 2.7.x` 為候選，驗證後鎖定確切修補版；URP 跟隨所選 Unity 6.3 相容版本。文件中的候選不是已安裝或已驗證版本。

### 2.3 預計目錄與模組責任

預計 Unity 專案位於 `brickhigh/game/`；`Assets/BrickHigh/{Domain,Application,Infrastructure,Presentation,Editor,Tests}/`、`Packages/`、`ProjectSettings/` 由開發階段建立。`tools/catalog/` 與 `blender/catalog/` 保存製作工具／來源，`artifacts/catalog/` 保存可重建產物；大量二進位來源不強制全部加入一般 Git 物件。本次只修改需求與 SPEC，不建立程式或安裝套件。

遊戲、模型製作與發行的關係如下：

```text
開發端：零件來源 → Blender / 模型驗證 → Unity 匯入 / URP 檢核 → 本地資產包 / 安裝包
玩家端：安裝 → BrickHigh.exe → 程式內模型查詢 / 場景載入
                                  ├─ 安裝目錄：唯讀目錄及 Unity 資產
                                  └─ 使用者目錄：本機玩家存檔及設定
```

`overview/` 尚無實際 Unity 架構可記錄，依工作區慣例在實作後更新；既有 `Dockerfile`／Orick 模板不作本遊戲部署契約。

### 2.4 已同意的畫面與賽車設計邊界

URP 使用一致的塑膠主材質、適當反射與柔和光照，保留零件接縫與倒角；橡膠、透明件與印刷各有可重用材質設定。建造／展示注重近距離辨識，賽車注重路況與穩定鏡頭；本 SPEC 只驗收模型呈現與代表場景，不建立正式收藏屋 UI、Cinemachine 駕駛流程或三張賽道。

為支援 MVP-002，保留逐片組裝來源、輪組錨點及碰撞代理；移動車身建議使用一個主要剛體與有限數量的複合碰撞體，輪組另外處理。這是相容性設計，不表示任何形狀車輛皆已可駕駛。輪數、動力來源、可用車架、性能公式與賽道規格仍由 MVP-002 決定。

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
  → 全量驗證 → Unity 匯入與材質／座標／碰撞檢核
  → 原子發布模型快照 → 建立本地資產包 → 安裝包 → 遊戲程式內取用
```

幾何優先使用有明確來源的 LDraw 官方 library 資產；匯入時解析完整依賴、顏色及面朝向。第一版需實作或整合可驗證的 LDraw→Blender 轉換器，不能假設 Blender 原生具備 LDraw 匯入。標準 primitives 可使用參數式建模；未支援的印刷、紋理、曲面或零件須以 Blender 補建，保留尺寸／圖片參考與檢核報告。

LDraw→Blender 轉換器尚未選定或驗證。開發時先以普通磚、薄板、透明件、印刷人物組件、Technic 孔軸及 DUPLO 件做轉換能力驗證，再批次處理；這是開發次序，不是縮小最終交付範圍。缺子模型、BFC／TEXMAP／材質轉換未支援時須補模或保留失敗，不能只因一般磚能載入就宣稱全部格式受支援。

每項 `ModelRevision` 狀態為 `Pending → Building → Validating → Ready`，任一步失敗轉 `Failed` 並保留原因。重試使用相同工作鍵，已成功且輸入雜湊一致的結果可重用；改動模型、材質、metadata 或製作工具版本則產生新 revision；只改 Unity 建置版本時保留來源 revision，另產生 RuntimeBuild。`Ready` 必須來自實際報告，不能手動跳過品質檢查。

### 4.3 座標、接點與碰撞

來源 GLB 與 canonical metadata 統一為右手座標、`+Y` 向上、距離單位公尺、角度弧度；GLB scene root 的 scale 為 `[1,1,1]`，metadata 與 mesh 使用同一座標。`glTF` 的單位與軸向依 [Khronos 規格](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)。

LDraw 原始 `-Y` 向上、`1 LDU ≈ 0.4 mm`，依 [LDraw File Format](https://www.ldraw.org/article/218.html) 轉換：`(x,y,z) → (0.0004x,-0.0004y,-0.0004z)`，旋轉接點法向及切線時採相同旋轉、不套長度比例。不要再套第二次 Blender／glTF 軸向變換。參考測試必須檢查非對稱模型，避免僅以對稱磚漏掉鏡像錯誤。

Unity 使用左手座標，見 [Unity 座標系說明](https://docs.unity3d.com/6000.3/Documentation/Manual/QuaternionAndEulerRotationsInUnity.html)。本專案 canonical→Unity 目標基底定義為 `M = diag(1,1,-1)`，位置為 `p_u = M p_c`，旋轉用 `R_u = M R_c M^-1`；法向、切線、接點、輪軸與碰撞幾何亦需一致轉換，並處理面繞序與切線手性。不能把右手 quaternion 原值直接當 Unity quaternion。

glTFast 自身已處理座標轉換；Editor adapter 以非對稱基底 fixture 驗證所選版本的實際基底，必要時在匯入輸出套用一次基底校正，使最終 mesh 與 metadata 符合上述 M。禁止對已轉換 mesh 再重複鏡像。每份 RuntimeBuild 保存 `coordinateProfile=canonical-rh-to-unity-lh-v1` 與基底驗證結果。

實體積木尺寸與遊戲世界尺度分開保存。canonical 維持公尺；組裝配置以整數積木座標／明確局部 transform 保存。Unity 呈現可套 `WorldScaleProfile` 的統一正比例，不對每個零件各自改比例；本模型預覽以比例 1 核對來源尺寸。正式搭建與賽車共同尺度由代表車輛／賽道原型驗證後固定版本；輪半徑、接點與碰撞須同倍率，質量及動力則由獨立遊戲規則決定，不能把幾何縮放直接當作性能公式。


| Metadata | 最低內容與不變量 |
|---|---|
| `bounds`、`referenceDimensions` | 有限數值、正尺寸；保存局部軸向、基準點與來源尺寸。幾何包圍盒容差為每軸 `max(0.1 mm, 0.5% × 參考尺寸)`。 |
| `connectors[]` | `id`、`family`、`profile`、局部 `position`、`normal`、`tangent`、對接側別及自由度。向量正規化；接點位置須有對照驗證，誤差不超過 `0.05 mm`。 |
| `compatibilityProfiles` | 版本化的相容配對表，至少涵蓋實際出現的 stud/tube、Technic pin/hole、axle、clip/bar、ball/socket；新型接點以明確新 profile 擴充。相同 family 不直接視為可接合。 |
| `collisionProxy` | 由盒、凸多面體或多個簡化形狀組成；可接合的空腔不得一律以整體包圍盒封死。碰撞代理需與接點配對 fixture 一起驗證。 |
| `vehicleMetadata` | 可選的輪半徑、輪寬、輪軸方向、輪胎／輪圈／車軸相容 profile；`massKg` 需附來源或 `Estimated`／`Unknown` 標記，不以 mesh 包圍盒任意認定重量。未知質量不阻止純外觀發布，但不得被當作已核實的賽車參數。 |
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

遊戲 Application 透過 `OpenCatalog`、`QueryVariants`、`AcquireModel`、`ISaveCompatibilityChecker.Check` 協調；Domain 不呼叫網路、Blender 或檔案系統。Unity Infrastructure 負責本機 SQLite／資產 handle，Presentation 負責場景物件與 UI。開發端工具另負責 `ImportCatalog`、`BuildModelRevision`、`ValidateSnapshot`、`PublishSnapshot`，以版本化的 manifest／schema 交換資料；不要求 Python 與 Unity 共享同一執行時 handler，也不將製作工具編入 Player。

### 5.2 開發端目錄 Schema

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

### 5.3 玩家端資料分區與唯讀發行 Schema

| 區域 | 內容 | 規則 |
|---|---|---|
| 安裝目錄 `StreamingAssets/Catalog/<packId>/` | `catalog.db`、`release-manifest.json`、本地 Addressables catalog／bundle 與相容資產 | 開啟唯讀；不在遊戲啟動時下載新目錄或原地更新。 |
| `Application.persistentDataPath/Profiles/<profileId>/` | 後續 `player.db`、設定、存檔版本、目前及備份資料 | 本機玩家身分與人物 ID 分開；不把存檔放進安裝目錄。 |
| `Application.persistentDataPath/Diagnostics/` | 本機錯誤／效能紀錄 | 不自動上傳；不記錄憑證或完整玩家存檔。 |
| 開發端工具資料 | 原始來源、證據、製作工作、未發布模型與完整品質報告 | 不隨玩家安裝包提供外部服務憑證、下載工作或草稿編輯入口。 |

玩家端 `catalog.db` 使用下列唯讀投影，與上節維護 DB 分開：

- `runtime_snapshots(snapshot_id PK, baseline_at, coverage_json, schema_version)`。
- `runtime_variants(snapshot_id, variant_id, part_id, production_status, tier, display_json, usage_json, selected_revision_id)`，複合主鍵為 snapshot／variant；只有該快照的 Active 變體可供新取得。
- `runtime_models(snapshot_id, variant_id, revision_id, runtime_build_id, metadata_json, address_key)`，保存現行與相容版本的精確引用；新取得清單不因相容模型存在就出現停產／特殊款。
- `runtime_builds(runtime_build_id PK, source_revision_id, build_target, editor_version, package_lock_digest, coordinate_profile, content_digest, validation_digest)`。
- `runtime_files(storage_key PK, sha256, byte_length, kind)`；`runtime_profiles(snapshot_id, profile_id, definition_json)` 保存相容接點等規則。
- `runtime_meta(key PK,value)` 保存 `packId`、`currentSnapshotId`、`schemaVersion`、`minReaderVersion`、`assetContractVersion`。來源 attribution 以必要的本機唯讀資產提供。

來源 GLB 與 Unity bundle 是兩種不同產物；同一 ModelRevision 因 Unity／URP／平台改變會有不同 RuntimeBuild。玩家存檔引用來源 snapshot／variant／revision，不保存 Unity InstanceID 或易變 Addressables 內部路徑。精確引用由當前發行包映射至適用的 RuntimeBuild。

SQLite adapter 的範圍限於參數綁定、讀取、transaction／busy handling、FK 與 schema 版本檢查；後續存檔的 write transaction、backup、migration 共用此邊界。Player 端 `catalog.db` 發行前完成 checkpoint，以 `journal_mode=DELETE` 及已關閉連線的乾淨檔案打包，避免唯讀安裝位置還需 WAL／SHM 寫入；依 [SQLite 發行注意事項](https://www.sqlite.org/wal.html)。不以複製仍在寫入的 DB 當作一致備份。

### 5.4 資產布局與不可變性

每個 revision manifest 包含 `variantId`、`revisionId`、`schemaVersion`、來源／工具版本、`model.glb`、`metadata.json`、`preview.png`、`attribution.json` 與品質報告的 SHA-256、位元組數及儲存鍵。實際檔案存於 `artifacts/catalog/objects/{sha256}/`；以生成的 storage key 存取，不接受任意本機路徑。

先寫 staging、校驗所有檔案並搬入不可變內容庫，再在資料庫交易內選定 revision／發布快照。檔案失敗不更新 head；資料交易失敗可能留下未引用內容，由後續明確維護工作清理，不在本版自動刪除。已發布檔案不得覆寫；相同 key 內容不同時回報損毀。


## 6. 程式內 API、製作工具與本機發行

### 6.1 共用 C# 讀取契約

本節的 API 指同一 Player 程序內的介面，不是 REST 服務；依已確認的單機需求不建立 HTTP endpoints。模型目錄不包含玩家擁有權，取得模型 handle 不授予道具或裝備資格。

```csharp
public interface IBrickCatalog
{
    Task<CatalogResult<CatalogSession>> OpenAsync(
        CancellationToken cancellationToken);
    Task<CatalogResult<VariantPage>> QueryAsync(
        CatalogSession session, VariantQuery query,
        CancellationToken cancellationToken);
    Task<CatalogResult<VariantDetails>> GetVariantAsync(
        CatalogSession session, Guid variantId,
        CancellationToken cancellationToken);
    Task<CatalogResult<CompatibilityProfiles>> GetProfilesAsync(
        CatalogSession session, CancellationToken cancellationToken);
    Task<CatalogResult<CatalogCoverage>> GetCoverageAsync(
        CatalogSession session, CancellationToken cancellationToken);
}

public interface IBrickAssetProvider
{
    Task<CatalogResult<ModelLease>> AcquireAsync(
        ModelReference model, CancellationToken cancellationToken);
}

public interface ISaveCompatibilityChecker
{
    CatalogResult<CompatibilityReport> Check(
        SaveHeader save, IReadOnlyList<ModelReference> requiredModels);
}
```

`CatalogSession` 是固定 `packId + snapshotId + schemaVersion` 的只讀 session，`OpenAsync` 從安裝包 release manifest 解析。場景結束 Dispose session；同一 session 不自動換版本。查詢用工作執行緒與受控 SQLite connection，不在每個 Update 迴圈做 IO。

`VariantQuery` 欄位：`QueryText`（貨號精確優先、名稱部分匹配）、`Family`、`Tier`、`Slot`、`Purpose=Browse|CharacterCreation|InitialBucket`、`BuildSystem`、`Cursor`、`Limit`。預設 50、上限 100，按不可變 variantId 排序；cursor 綁定快照、篩選 hash 與最後 ID。跨條件／快照使用回 `InvalidCursor`，不偷偷重設。

`CharacterCreation` 排除 Special 且要求 creationEligible；`InitialBucket` 要求 bucketEligible、非特殊款及指定相容系統。正式新取得查詢只回傳 Active／Ready 變體；歷史存檔以精確 ModelReference 讀取相容資產，不經新取得查詢。`Browse` 僅為系統模型查詢，不作為玩家收藏櫃的擁有清單。

`ModelLease` 擁有一份 Addressables reference count；呼叫端以 Dispose 釋放且重複 Dispose 安全，不能直接破壞共用 mesh／材質。建立／操作／銷毀 Unity Object 需切回主執行緒；背景任務只處理資料與 IO。取消或過時選取的載入不得覆蓋新選項，已完成的未使用 handle 仍須釋放。

### 6.2 DTO 與錯誤範例

以下僅為測試資料格式，不代表已存在的積木或完成資產。

```json
{
  "schemaVersion": 1,
  "packId": "catalog-win64-test-v1",
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

`ModelReference` 包含 source snapshotId／variantId／revisionId；`VariantDetails` 再含外觀、接點、碰撞、人物錨點、車輛 metadata 與 runtimeBuildId。asset provider 依資料庫映射解析本機 address key，不接受任意路徑或外部 URL。

`CatalogResult<T>` 只能為 `Success(value)` 或 `Failure(error)`，不可同時有兩者。錯誤碼包含 `CatalogNotInstalled`、`CatalogNotPublished`、`InvalidQuery`、`InvalidCursor`、`VariantNotFound`、`AssetMissing`、`AssetCorrupt`、`UnsupportedSchema`、`IncompatibleContent`、`StorageUnavailable`、`Cancelled`；必須可判斷可否重試。錯誤訊息顯示繁體中文，診斷 ID 寫本機紀錄，不在 UI 顯示例外堆疊。

```json
{
  "code": "AssetMissing",
  "message": "此模型檔案不完整，請使用完整安裝包修復。",
  "retryable": false,
  "diagnosticId": "test-diagnostic-001"
}
```

缺模型不改為占位方塊並宣稱成功，也不刪除存檔中的積木。新版本存檔由舊程式開啟時，回報版本不相容並保留原檔。

### 6.3 開發端命令契約

以下為規劃中的製作工具操作，僅在開發者電腦執行。共同輸入含 schemaVersion、來源檔相對路徑、SHA-256、來源日期／版本與工作鍵；禁止路徑跨出指定工作目錄。

| 操作 | 結果 |
|---|---|
| `catalog import --manifest <path> --job-key <key>` | 原始資料完整性驗證、候選清單與映射衝突；來源取得由獨立 adapter 處理，失敗不可把部分結果當完整來源。 |
| `catalog resolve --snapshot <id> --decisions <path>` | 將有證據的判定、分類及別名寫入 Draft。 |
| `catalog freeze --snapshot <id> --expected-version <n>` | 固定來源／分母；未查明項目保留為發布阻斷。 |
| `catalog build --snapshot <id> --job-key <key>` | 製作或恢復 GLB／metadata 等模型產物。 |
| `catalog validate --snapshot <id>` | 全量來源、模型與分類檢查，輸出逐項結果。 |
| `catalog publish --snapshot <id> --expected-head-version <n>` | 開發端發布來源模型快照，不等於玩家安裝包已完成。 |
| Unity batchmode `BuildCatalogContent` | 讀取已發布來源，經 glTFast／URP 匯入與座標校正，建立 catalog.db、本地 Addressables、RuntimeBuild 映射與驗證結果。 |
| Unity batchmode `BuildWindowsPlayer` | 打包 Player 與必要執行相依項目，再生成安裝交付物與 checksum。 |
| `catalog status --job <id>` | 顯示進度／失敗，依輸入 hash 恢復。 |

工具 exit code：0 成功、2 輸入錯誤、3 門檻不足、4 工具／外部失敗、5 版本／工作鍵衝突。輸出不得包含 API key。Player 不包含這些命令、來源 adapter 或寫入目錄工作。

### 6.4 離線資產包與安裝

`release-manifest.json` 至少包含 packId、appVersion、readerVersion、currentSnapshotId、catalogDbSha256、catalogSchemaVersion、assetContractVersion、buildTarget、editorVersion、packageLockDigest、compatibleSaveVersions、所有資產 bundle／local catalog 的 storage key 與 digest。manifest 在建置時生成，包內所有路徑都必須解析到本地安裝位置；禁用遠端 Addressables catalog、遠端載入路徑與啟動自動更新查詢。

Unity [Addressables 建置](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/Builds.html) 產物與 Player 一起交付。GLB 是來源，安裝包包含預轉換的 mesh／材質／Prefab 等 runtime 資產、必要 attribution 與可讀 metadata；不要求每次開遊戲重新轉換，原始 Blender 工作檔不必隨包發行。

Windows 安裝交付物包含完整 Player、Unity runtime、Mono 與 SQLite native library 等必要檔案，建立啟動入口及移除安裝入口；任何必要 redistributable 都須隨安裝包離線提供。不能只交付單一 exe、Git 專案或需要 Unity Editor 的場景。首份 SPEC 的獨立驗收包可啟動至只讀模型預覽，完整遊戲入口在最後的收藏屋 SPEC 串接。

啟動流程：讀本機 release manifest → 驗證 DB 與 schema → 開啟 catalog session → 初始化必要資產 → 顯示入口。對大 bundle 按需做完整性驗證並保存本機快取；安裝／更新完成時做全包 hash 檢查。玩家首次離線啟動不得依賴已存在的網頁、Unity Editor 或資產下載快取。無任何必要登入或聯網啟用步驟。

### 6.5 更新、版本引用與玩家資料保存

本版使用玩家自行下載的完整離線安裝更新，不開發自動更新服務。更新前關閉遊戲，將新版本完整寫入獨立 staging 目錄、核對 manifest／檔案及必要相容內容後，再切換可啟動版本。未完成時舊版仍可啟動；既有安裝內容不在玩家遊玩中原地覆寫。安裝器不修改 player.db，移除程式預設保留使用者存檔。

Unity AssetBundle 受引擎／平台版本約束，本版不承諾任意舊 bundle 可由新版引擎直接讀取。每次更新須針對目前引擎重新建置仍需支援的舊來源 revision，納入當次包的 runtime_models 映射；同一發行系列保留先前正式發布模型的相容映射。沒有所需來源或映射時，更新驗證失敗，不能只保留一個新引擎讀不了的舊 bundle。

`SaveHeader` 最低包含 saveSchemaVersion、appVersion、profileId、assetContractVersion、worldScaleProfileId 與使用的 ModelReference 集合摘要。本 SPEC 提供 `ISaveCompatibilityChecker.Check` 與人工測試 fixture；實際人物／庫存／車輛資料由後續 SPEC 持久化。存檔中的缺模型或未知新 schema 造成可解釋錯誤，原檔及最後完整備份保留。

後續存檔共用約束：邏輯上一次取得／消耗以同一 SQLite transaction 提交；migration 在遊戲載入資料前執行，先建立一致備份，在交易中升版，失敗回滾。組裝資料若另外以檔案保存，先產生不可變新檔再在 DB transaction 切換引用，不跨 DB／檔案各自提交半套狀態。SQLite 備份須用 backup API 或停止寫入並關閉連線後取得一致檔案，不能任意複製仍有未 checkpoint 的 DB；參考 [SQLite 原子提交](https://www.sqlite.org/atomiccommit.html)。


## 7. Unity 預覽 UI 與操作狀態

Editor 製作預覽可查看 Draft／Frozen，明確標示未發布。首份 SPEC 的獨立 Windows 驗收包提供 `CatalogPreviewScene`，只讀已封裝的發布模型，標示「模型預覽」；它不是玩家收藏櫃。正式遊戲後續由入口模組決定是否保留模型瀏覽工具，不因此授予玩家全量道具。

使用 uGUI 清單與 Unity Camera：左側搜尋、系列／款式／部位篩選與虛擬化分頁清單，右側單模型預覽、版本及尺寸摘要。滑鼠拖曳旋轉、滾輪縮放、按鈕重設視角；窄視窗上下排列。色彩與印刷變體是不同可選項目。文字輸入期間不得同時觸發模型旋轉或遊戲快捷鍵。

| 狀態 | 操作與結果 |
|---|---|
| 初次載入 | 本機載入進度；必要目錄／模型缺漏時顯示安裝不完整與修復方式，不導向外部下載作為唯一繼續方法。 |
| 搜尋無結果 | 顯示無結果及清除條件，已載入畫面不假造樣本。 |
| 快速切換零件／變體 | 新選取優先；舊載入可取消或結果被丟棄並釋放，不能蓋掉新模型。 |
| 模型損毀／不相容 | 顯示錯誤與診斷 ID，其他可用模型仍可選擇；不自動刪模型或重設存檔。 |
| 圖形裝置不支援 | 顯示可理解的啟動失敗原因；僅能顯示 PNG 不算 3D 驗收通過。 |
| 包版本更新 | 遊戲退出後安裝，新啟動才開新 session；同一 session 不被背景更新改動。 |
| 離開預覽 | 釋放 ModelLease、預覽 instance、臨時 render texture 及可回收資源，不破壞共用 mesh／材質。 |

所有搜尋／篩選／選取／重試／重設操作可使用鍵盤。程式內對話只呈現玩家需要理解的錯誤；工具版本、來源比對與製作工作紀錄放在開發預覽詳細資訊。

畫面基準採精緻玩具質感：柔和主光、環境光與反射探針；塑膠使用合適的粗糙度與低金屬度，橡膠與透明件有獨立設定。以來源顏色／印刷核對後再調整燈光，不靠過曝掩蓋材質錯誤。建造時輪廓／接點預覽需清晰，攝影景深及動態模糊預設不影響模型驗收。

按 variant 共用網格與材質，場景以空間區塊作批次／LOD／按需載入；隱藏內部幾何的最佳化不得刪除編輯資料或讓重新拆裝失效。大量重複積木的 GPU instancing 方案由實際 URP 批次結果驗證，不能只因開啟某個選項就宣稱已最佳化。

## 8. 品質、效能與錯誤策略

### 8.1 每個變體的完成定義

每個 `Ready` revision 均須有非空可渲染 mesh、完整材質／紋理、正確版本與變體映射、可解析 metadata、來源清單、glTF Validator 無 error 的報告、軸向／尺寸檢核、連接／人物錨點檢核及前後左右上下六視圖。Unity RuntimeBuild 另需通過 URP 材質、座標、Prefab 引用及本地 bundle 實際載入檢查。警告須逐類記錄處理或可接受原因；不可無條件忽略。

幾何家族可共用尺寸與接點驗證結果，但每個顏色／印刷變體仍要渲染、檢查材質指派並與其來源外觀核對。每個 revision 保存通過／失敗結果與檢核工具版本；失敗者不能僅靠人工改旗標發布。

GLB 必須自含所有 buffer／紋理，不得從外部 URI 補抓；只用標準 PBR／alpha 外觀及經預覽工具驗證的擴充。未支援材質轉成有對照報告的標準表示；不能忽略透明／印刷等原始外觀。


### 8.2 可量測目標（本次 SDD 的驗收提案）

先以 Windows x64、DirectX 11、SSD、16 GiB RAM、1080p 為測試條件；基準 GPU／CPU 候選為 GTX 1660 6 GiB／Core i5-10400。這是擬定的量測機，不代表使用者已擁有此設備或已實測；可使用實際可取得且規格明載的代表機重新校準，未量測前不宣稱最低系統需求已驗收。

| 指標 | 測量方式與門檻 |
|---|---|
| 本機查詢 | 至少 `max(100000,A)` 筆 metadata，暖機後 1000 次查詢，分頁 50 筆；列表 P95 ≤ 100 ms、詳情 P95 ≤ 50 ms；不含資產載入，不在主執行緒同步阻塞。 |
| 單模型預覽 | SSD 冷載入至第一個正確畫面 ≤ 3 秒；顯示載入狀態，材質與圖片已在本機。記錄 GLB 與實際 bundle 大小。 |
| 大量積木畫面 | 在 Standalone 非 Development Build，以實際至少 2026 片可見積木、至少 8 類幾何及包含印刷／透明件的固定 manifest 場景驗收；不能只放 2026 個最低面數相同方塊。 |
| 畫面流暢 | 上述基準機／1080p、固定 Medium 圖形 preset，關閉 VSync／幀率上限量測，暖機 30 秒後記錄 60 秒：平均 ≥ 60 FPS、P95 frame time ≤ 20 ms。讀取載入畫面單獨統計，不混入穩態數字；正常 UI 操作必須納入。 |
| 資產預算 | 來源 GLB ≤ 20 MiB、單張紋理 ≤ 2048×2048、預覽圖 ≤ 256 KiB；另報告 Unity mesh／texture CPU 與 GPU 記憶體及 bundle 體積，不以來源壓縮大小代替 runtime 預算。 |
| 資源釋放 | 同一組 20 個模型切換 5 輪後，已釋放 handles 與 Unity mesh／texture 數量回到允許快取上限；renderer cache 使用 LRU，快取估計上限 256 MiB，使用中的資產另外統計。 |
| 車輛相容性驗證 | 技術原型使用不同輪徑／軸距的幾何 fixture、主要車身剛體與有限複合碰撞體，在短路面／坡面／路緣檢查輪組位置與尺度；不設定最終賽車圈速或操控平衡門檻。 |

每次量測保存 GPU／CPU 型號、驅動、Unity／URP／套件版本、內容 manifest、preset、載入與穩態結果。全量建模工期、最低配備及下載容量在有代表模型與完整分母後估算，不能從上述暫定目標推導已能滿足所有場景。超過原型效能目標時先改善批次、LOD、接點搜尋與碰撞負擔，再以證據調整設計；不可悄悄降低 2026 片或刪除變體需求。

### 8.3 失敗與重試

- 外部來源 timeout、`429` 或服務中斷：保存中斷點、尊重 `Retry-After`，最多自動重試 3 次後保留待恢復；不得因失敗把來源清單清空或判定所有零件停產。API 使用憑證由環境提供，僅放 Authorization header，不存入 URL 或報告。
- 匯入映射衝突、缺必要欄位、基準日期不明：回報具體來源列與原因；沒有完整檔案核對結果不得標示來源完成。
- Blender worker timeout（每資產預設 10 分鐘）、crash 或非零結束：只將該工作項標失敗，繼續獨立項目；不自動延長到無上限。每個子程序停用自動腳本執行，僅執行專案維護的工具。
- 缺子零件、未知材質／擴充、尺寸或連接驗證失敗：不輸出可發布模型；列明需補件／修模項目。
- 磁碟空間不足、hash 不符、metadata 與 mesh 不符：保留舊快照，發布失敗並回報可定位的工作 ID。
- 開發端多個寫入工作：SQLite 單寫入者排程，工作持有到期租約；恢復時依已完成 item/hash 去重。發布使用 head version compare-and-swap，衝突者重新讀取與驗證。Player 目錄為唯讀，不執行來源更新工作。
- 匯入路徑／壓縮檔成員路徑越界、外部 GLB URI：開發工具拒絕；Player asset provider 只解析包內 address key，不接受來源 URL、SQL、腳本或任意磁碟路徑。
- 本機不可寫、空間不足、原生 SQLite DLL 缺失、資產包版本不相容：阻止相關流程，顯示本機修復方式；不嘗試連線補救、不清空玩家資料。
- 玩家已有存檔但需要的模型 revision 不在相容包內：保持原存檔並回 IncompatibleContent，不以新模型替換舊模型尺寸或來源 ID。
- Unity shader variant 遺漏、URP 材質錯誤或 bundle 相依檔未包含：視為建置失敗；必須在實際離線 Player 檢查，Editor 能顯示不算通過。

## 9. 驗收標準與測試策略

### 9.1 驗收清單

| ID | 可測試條件 |
|---|---|
| `AC-001` | 快照保留基準日期、來源 artifact／hash、各系列覆蓋與審查結果；來源缺頁不能被標示為完整。 |
| `AC-002` | 已停產變體不進入新建模分母；未知、單純缺貨、舊現貨及相反證據不自動推成 Active 或 Retired。 |
| `AC-003` | 同幾何不同實際顏色／印刷可獨立識別，外部 ID 衝突被攔截；某變體停產不排除其他 Active 變體。 |
| `AC-004` | 全部未停產候選在固定快照中逐項有 revision；無法證明全量時報告 U／G 等缺口，禁止宣稱已完成。 |
| `AC-005` | 每個交付 GLB 通過格式及品質檢查，對應 RuntimeBuild 可由實際 Unity Player 載入呈現；空 mesh、占位方塊、缺紋理或錯誤印刷不能通過。 |
| `AC-006` | LDraw → canonical GLB 的軸向、單位、法向及參考尺寸通過指定容差，非對稱件沒有鏡像。 |
| `AC-007` | 每份外觀變體保留來源、作者／授權、原始與輸出 hash、工具版本及六視圖；RuntimeBuild 另留 Editor／套件版本、轉換契約與渲染驗證結果。 |
| `AC-008` | 接點、相容 profile 與碰撞代理可用配對 fixture 驗證，合法插接不因封閉包圍盒被擋；不相容系列不能因同名接點通過。 |
| `AC-009` | 存在 Unknown、來源缺口、分類缺漏、Failed revision 或品質錯誤時，發布失敗且現有 head 不變；空基準不顯示 100%。 |
| `AC-010` | 新貨號或模型修正建立後繼 snapshot／revision；匯入或建置重試不產生重複變體／結果。 |
| `AC-011` | 新快照生效後，舊 snapshot／revision 可依精確 ID 取得相容 RuntimeBuild；不因停產、分類或 Unity 版本改動讓既有模型引用失效。 |
| `AC-012` | 人物組件有 tier、部位、錨點與相容規格；每個基本部位至少有可供下一份人物規格使用的有效候選，缺候選明確阻斷。 |
| `AC-013` | Special 在人物建立與初始桶查詢均不可取得；直接查詢模型不改變任何玩家權益。 |
| `AC-014` | 至少一個相容建造系統提供可構成地板、牆面、屋頂與出入口的有效建材集合；傳出可供後續配方與建屋驗證使用的 metadata。 |
| `AC-015` | 遊戲內列表／詳情／相容規則固定同一 session／snapshot；cursor 同條件無漏項／重複，跨條件或快照使用被拒絕。 |
| `AC-016` | 原生預覽涵蓋載入、無結果、模型失敗、圖形裝置不支援、快速切換及重試；鍵盤可操作，失敗不顯示假的成功模型。 |
| `AC-017` | 全量交付報告滿足 A>0、U=0、G=0、V=A 及所有品質門檻，列出原始清單與逐變體證據；測試資料不列入實際資產分母。 |
| `AC-018` | 開發端外部中斷、解析錯誤、worker crash、重複工作鍵與檔案／DB 發布失敗可恢復，不破壞已發布版本；玩家端安裝損毀則明確報錯且保留存檔。 |
| `AC-019` | 內部介面拒絕非法輸入、越界路徑及未發布資產，錯誤不洩漏開發路徑／憑證；安裝包不含 draft、維護 CLI 或來源服務金鑰。 |
| `AC-020` | 第 8.2 節查詢、畫面與資源回收目標具備可重跑環境、固定場景、硬體／版本紀錄及實測數據；Editor 結果不能代替 Standalone。 |
| `AC-021` | 乾淨 Windows x64 測試環境斷網後，完整安裝包可安裝、首次啟動及操作模型預覽；不需另裝 Editor、SDK、Blender、Python、資料庫服務或執行期下載。 |
| `AC-022` | 一般使用者以唯讀安裝目錄執行，寫入僅落在允許的使用者資料位置；模擬既有 profile／存檔在重啟、覆蓋升級與預設解除安裝後保持完整。 |
| `AC-023` | 離線更新測試涵蓋成功、空間不足、中途失敗、缺少舊 revision 映射及較新存檔 schema；失敗保留可回復版本與原存檔，不靜默重設或套用最新模型。 |
| `AC-024` | 非對稱 fixture 驗證 canonical GLB → Unity 座標轉換僅一次，mesh／錨點／接點／碰撞／輪軸一致；正值世界比例可追溯，未知質量明確標記；代表輪徑／軸距在簡單坡道、路肩接觸測試中留下結果。 |
| `AC-025` | 封裝後真實 Player 可查詢隨附 SQLite、載入本地 Addressables 及正確 URP 材質／印刷／透明件；清除開發機快取或斷網仍可運作，無粉紅遺失 shader 或隱藏遠端依賴。 |
| `AC-026` | ModelLease 在成功、取消、失敗、快速換件及離開畫面時正確釋放；過期結果不覆蓋新選擇，Unity 操作在主執行緒，共用且仍被引用的資產不提前釋放。 |

### 9.2 測試分層

- Domain／Application EditMode 單元測試：三態證據、變體唯一性、分類用途、快照門檻、版本轉移、接點配對與相容檢查，涵蓋 `AC-001`～`AC-004`、`AC-008`～`AC-015`、`AC-023`。
- 真實資料整合：開發端 SQLite 與 Windows Player 的原生 SQLite adapter 分別驗證 FK／unique／transaction、參數綁定、唯讀 DB、分頁、工作租約、重試與發布競爭。不能以記憶體假資料庫取代交易及原生相依驗收。
- 開發端模型管線：Python 工具測試與 Unity Editor 匯入測試先用可核對的幾何／材質／印刷／連接正反例，再逐項檢查全部實際交付變體；來源線上取得與離線可重跑檢查分開。
- Unity PlayMode：真實 prefab／URP 材質、uGUI 狀態、鏡頭與輸入、主執行緒限制、取消競態、lease 生命週期、固定版本契約及座標轉換；涵蓋 `AC-005`～`AC-008`、`AC-015`～`AC-016`、`AC-024`～`AC-026`。
- 原生 E2E：受控來源 fixture → 真實 Blender 轉換 → Unity 匯入／資產建置 → 本地 catalog.db／Addressables → Windows 安裝包 → 斷網首次啟動／查詢／旋轉／切換外觀。此鏈不得 mock 掉轉換器、SQLite adapter 或資產載入。
- 安裝／更新驗收：在乾淨 Windows 環境以一般使用者執行，測試唯讀安裝目錄、使用者資料目錄、損毀包、空間不足、升級／回復及解除安裝保留資料，涵蓋 `AC-018`、`AC-021`～`AC-023`、`AC-025`。本份用明確的存檔 fixture 驗證契約；真實人物／庫存／房屋／訂單資料的遷移須在其負責 SPEC 另行驗收。
- Standalone 畫面／資源測試：固定 2026 件實際模型組合、指定品質設定與硬體量測；車輪接觸原型只驗證本份資產尺度／碰撞適用性，不代替 MVP-002 的操控、性能映射或三張賽道驗收。
- 全量資料驗收另存逐件 manifest／來源證據／品質報告；fixtures 通過只證明工具行為，不能取代 `AC-017` 的真實全量交付。

以上為 SDD 測試策略，不是已執行測試，也不是已生成的 BDD／TDD。取得本 SPEC 確認後，逐項生成 Scenario 與 TDD case ID，並保留本表追溯。

## 10. 風險與需審閱的設計決策

| 風險 ID | 實際影響 | 本次設計處理／目前狀態 |
|---|---|---|
| `RISK-001` | 尚無已驗證的全球未停產零件快照；售價／現貨不能證明生產狀態，可能無法完成全量門檻。 | 三態與來源涵蓋審查；未知不當停產。改採官方販售清單須明確變更需求。尚未消除。 |
| `RISK-002` | 社群模型可能缺新零件、印刷或特殊系列；工具完成不代表所有模型完成。 | 逐件缺口、自建補模路徑及全量分母；尚未取得可承諾的數量與工期。 |
| `RISK-003` | 模型能看但接點／碰撞錯誤，玩家仍無法搭屋或裝人物。 | 配對 fixture、錨點與相容系統一起驗收；建屋配方留在後續 SPEC。 |
| `RISK-004` | 印刷辨識或來源 ID 合併錯誤導致玩家取得錯誤外觀。 | 幾何／變體分離、衝突隔離、分類記錄及逐變體渲染驗收。 |
| `RISK-005` | 第三方資產使用條件不清，模型包無法交付。 | 逐資產保存來源／授權／作者；資料不足列缺件，不默認可用。 |
| `RISK-006` | 全量資產與歷史修訂超過下載、磁碟或顯存預算。 | 按需載入與內容去重；實測總量、安裝暫存及相容資產成本，不能為縮包默刪舊引用。尚無全量大小。 |
| `RISK-007` | 引擎方向已同意，但新版介面、套件、座標、效能與更新驗收細節尚未逐份確認。 | 本 SPEC 為修訂後 SDD 待確認；尚未進入 BDD／TDD 或可開發交接。 |
| `RISK-008` | glTFast／Addressables／原生 SQLite 的特定版本在 Unity Player 不相容。 | 最先完成最小真實 Windows 封裝驗證後才鎖版；候選版本不是已驗證組合。不以 Editor 成功替代 Player。 |
| `RISK-009` | 二次座標轉換或模型／物理尺度不一致造成鏡像、輪軸偏移與不穩定接觸。 | 非對稱座標 fixture、統一 WorldScaleProfile、簡單坡道／路肩測試；比例尚待原型決定，不保證 WheelCollider 已適合最終賽車。 |
| `RISK-010` | Unity 升級使舊 AssetBundle 不相容，或更新中斷造成舊存檔無法載入。 | 保留 source revision，重建目前相容 RuntimeBuild；安裝 staging／回復、存檔 schema 檢查與不相容阻斷。 |
| `RISK-011` | 2026 件與未來車輛的畫面負載未量測，1080p／60 FPS 可能需調整品質。 | 指定候選硬體與可重現場景，量測 CPU／GPU／資源再調整；不宣稱已達最低配備或最終賽車效能。 |

本輪已確認的是原 MVP 規則與 Unity 單機架構方向；待審閱的是本 SPEC 細節：保留 2026-09-08 生產狀態基準及全量門檻、開發端來源管線、canonical GLB 與 Unity RuntimeBuild 分離、原生套件驗證、1080p 效能基準、安裝／存檔相容契約。上述風險未因方向確認而視為已接受，後續風險稽核仍須逐項處理。

## 11. 實作順序、依賴與後續文件

本 SPEC 內部建議順序：

1. 建立最小 Unity Windows 封裝原型：原生 SQLite、本地 Addressables、URP 與唯讀安裝路徑，驗證套件相容後鎖版。
2. 領域規則、來源清單、證據與快照；同時揭露實際全量缺口。
3. 代表模型的 Blender 轉換、座標／材質／接點驗證、2026 件效能場景與有限輪組接觸原型。
4. 全量建模／補件與逐項品質驗證，建置來源快照及相容 RuntimeBuild。
5. 內部查詢介面、原生預覽整合、本地資產封裝與安裝／升級／回復驗收。
6. 全量報告與 Windows Player 驗收。只要全量模型尚未完成，SPEC 不得標示全部完成。

原型是降低風險的實作順序，不是改成僅交付代表模型，也不提前開發完整賽車模式。

| 後續 SPEC | 使用本 SPEC 的契約 |
|---|---|
| `SPEC-001-PlayerInventory` | 固定變體與 revision 引用、初始桶用途與相容系統；實作本地玩家／庫存持久化、2026 片、必備建材配方及領桶去重。 |
| `SPEC-001-PurchaseEntitlements` | 變體識別與可發放對象；本地模擬訂單、付款結果、優惠、冪等發放及資料遷移由該 SPEC 負責。 |
| `SPEC-001-CharacterManagement` | 部位、款式及錨點相容資料；本地人物存檔、建立、半價整合及多人物流程由該 SPEC 負責。 |
| `SPEC-001-CollectionHouseAndGameAccess` | 尺寸、接點、碰撞、建材用途與資產 lease；建屋判定、存檔與完整安裝版遊戲流程由該 SPEC 負責。 |

[MVP-002](../requirements/MVP-002-BrickRace.md) 後續賽車規格沿用同一份模型／存檔識別、資產載入、世界比例及相容契約，再補車輛組裝、性能映射、24 個輪胎發放、展示格、三條賽道與實際操控驗收。本輪不建立 SPEC-002，也不因選引擎而更動這些需求。

後續規劃文件完整名稱固定如下，目前皆尚未建立：

- `docs/bdd/SPEC-001-BrickModelCatalog-BDD.md`
- `docs/tdd/SPEC-001-BrickModelCatalog-TDD.md`
- `docs/specs/SPEC-001-BrickModelCatalog-RiskAudit.md`（若採獨立報告）

本 SPEC 確認後，由 `bdd-feature-generation` 生成 BDD／TDD，再由 `pre-implementation-risk-gap-audit` 逐項稽核。所有風險決策與補回項目完成後，才在本 SPEC 的 TDD 末尾寫入 `well-done` 交接。現在沒有 `Ready for well-done` 狀態，不開始下一份 SPEC。

## 12. 參考資料與驗證紀錄

來源資料與原模型基準於 2026-09-08 查核；Unity／離線封裝相關文件於 2026-09-09 查核。基準日期不因引擎修訂而自動重算。

- 引擎生命週期：[Unity 6 支援資訊](https://unity.com/releases/unity-6/support)。
- 編譯相容範圍：[Unity 6.3 .NET profile](https://docs.unity3d.com/6000.3/Documentation/Manual/dotnet-profile-support.html)；依此不沿用原先 .NET 10／EF Core 應用程式架構。
- 渲染與座標：[Render pipeline 選擇](https://docs.unity3d.com/6000.0/Documentation/Manual/choose-a-render-pipeline.html)、[Unity 座標與旋轉](https://docs.unity3d.com/6000.3/Documentation/Manual/QuaternionAndEulerRotationsInUnity.html)。
- 資產：[glTFast 6.14](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.14/manual/index.html)、[Addressables 2.7 建置](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/Builds.html)。此處為候選版本文件，不代表已完成本機相容驗證。
- 安裝與資料：[Windows Player 檔案](https://docs.unity3d.com/6000.3/Documentation/Manual/WindowsStandaloneBinaries.html)、[persistentDataPath](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Application-persistentDataPath.html)、[SQLite WAL](https://www.sqlite.org/wal.html)。
- 後續車輛原型依據：[WheelCollider 原理與限制](https://docs.unity3d.com/6000.0/Documentation/Manual/wheel-colliders-introduction.html)、[Compound collider](https://docs.unity3d.com/6000.0/Documentation/Manual/compound-colliders-introduction.html)。引擎功能存在不等於已證明適合本遊戲的比例與操控。
- 原 GLB／LDraw 格式來源見第 3、4 節。Blender 最新線上匯出手冊前次未能成功讀取，未據此宣稱轉換器已驗證；實作仍須用本機 exporter 與代表資產跑通管線。
- 規劃依據為 MVP、實際工作區與已查核官方文件；來源調查不是完成下載／建模證據。
- 本次只修改 Markdown，交付前執行 `git diff --check`，並核對驗收編碼、來源與文件包名稱。
- Unity 專案、程式碼、模型管線及應用測試尚未實作／執行；既有 Blender 場景檢查不代表本規格通過。
