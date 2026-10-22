# SPEC-001-BrickModelCatalog: 指定盒組積木模型庫與共用資產契約

**功能 ID**: `SPEC-001-BrickModelCatalog`
**關聯需求**: [MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
**優先級**: 高
**負責角色**: 模型資產維護者、共用模組開發者
**狀態**: SDD基線與§13規範有效；Gate 2固定20件幾何／接合20/20已完成、Gate 3固定20件隔離QA技術里程碑已完成（含真Windows安裝／更新／Player矩陣，9件真官方來源正式RuntimeBuild／Player）；Gate 4為指定盒組全集、身份／模型擴大、硬體效能與完整SPEC剩餘驗收。完整正式Preview／Release尚未通過。
**最後更新**: 2026-10-22
**建議實作順序**: 本 MVP 第 1 順位
**前置 SPEC**: 無
**本輪邊界**: 僅實作本SPEC；已有來源CLI、可恢復模型建置、不可變來源／模型／六視圖封存、uGUI繁中預覽、鍵盤與滑鼠操作，以及經原生安裝器／啟動器逐件驗證的20樣本Windows Player。仍非合格Preview或全量Release。現況以 [TDD 驗證紀錄](../tdd/SPEC-001-BrickModelCatalog-TDD.md) 為準。

**2026-10-22 跨需求／開發文件逐項稽核（現行進度）**：TDD **111/233（47.6%）**、共233個獨立測試ID（UT96／IT6／CT7／ET2），122未勾；BDD **13/56（23.2%）**、共56個獨立SC，其中13已勾（原BDD漏勾SC-008／020／028／029，該四件對應TDD測試全已完成）；UX 1/20（5%）；本SPEC本頁§14的36項AC驗收矩陣為**3完整／28部分／5未符合**（3/36＝8.3%），先前說明27部分／6未符合是摘要筆誤。Gate3固定20件技術里程碑已完成，但真正可交付官方來源僅9件，正式Preview／Release及其餘SPEC驗收未完成；Gate4依真實指定盒組擴大。本段是最新數字，2026-10-18／09-27段落為歷史執行記錄。

**2026-10-20 Gate 3 品質提交歷史現況（以2026-10-21新決策及最新TDD為準）**：20份使用者已核准的品質報告已由固定任務 `brickhigh-gate3-quality-submit` 透過原 `complete_revision_quality` 正式提交，來源修訂Ready及Frozen選件均20/20（version 42），安全重試不改SQLite位元組。QA fixture與逐件正式來源身份仍保留原限制，正式來源資格仍0/20，尚無這20件的Passed RuntimeBuild／正式Player結論；不進Gate4。詳見TDD最新證據；本次未改§13.1～13.2規範。

### 2026-10-21 Gate 3 與 Gate 4 階段責任分界（使用者授權）

固定20件是**技術與模型品質的受控QA樣本，不是任何指定盒組的真實inventory**。為避免與Gate4重複，里程碑的驗收責任明確分為：

- **Gate 3（固定20件模型管線／隔離QA技術驗收）**：20/20真來源形狀與尺寸、接點／碰撞、已核准的QA品質修訂與Frozen選件；以獨立安裝的內部`F-Catalog`驗收包跑20件實際Unity Player載入、材質／印刷／透明／接合與操作、可寫／唯讀安裝、A→B更新、故障／降權與個人資料保留矩陣；留存Job、版本、畫面及摘要。另以已找到真官方身分的9件完成**不同於QA包**的正式Catalog successor→Frozen→Unity RuntimeBuild→真Player→獨立verify完整正例，證明正式來源管線可運作。Gate3不要求每一件任意QA顏色都對應到LEGO曾出品的Element，不能因QA顏色未能核實而否定建模管線。**兩種驗證分別計數，不能稱內部20件已正式RuntimeBuild通過**。
- **Gate 4（真實盒組與擴大驗證）**：由使用者實際指定盒組才確立scope與唯一Element分母，完整展開inventory、逐件權威身分／顏色／印刷／模具、同形不同色的變體及合法幾何去重，缺模型才新增，擴充模型類型和數量；執行對應真實來源Catalog／RuntimeBuild／Player、正式安裝與代表性硬體效能及完整SPEC剩餘測試。Gate3的20件模型不當作盒組全量，Gate4不重做已核准的相同模型幾何，只驗新增或變更資產、正式身份與新規模。
- **不可放寬的產品閘門**：`F-Catalog`的QA fixture永不升格為`Preview`、`Release`、正式元素身份或Published head。§§3.4、13.1～13.2的正式來源、審查、C>0／G=0／V=C、完整RuntimeBuild／Player與可交付來源資格均維持原規格；9件正式來源僅為9件子集合通過，原QA20件`Ready`只是QA核准，其他11件沒有官方來源資格。Gate3階段里程碑結案**不代表SPEC-001全部36項AC、56個BDD或233個TDD結案**；未完成的正式產品測試需明確保留在Gate4／後續SPEC，不能改勾選或移除。
- **Gate3結案須有實際證據**：20件原QA品質／Frozen／內部真Windows安裝Player矩陣通過、9件正式來源端到端真建置與Player獨立verify通過、失敗/來源隔離負例仍正確阻擋、TDD／BDD／overview一致且Git差異檢查通過；任一缺失不能僅靠使用者允許結案而假造通過。

### 2026-10-19 Gate 2 固定20件模型驗收決策（使用者最新確認）

- `10334` 僅為未來使用者**可以指定盒組**的例子，**不是** Gate 2 固定20件的來源篩選、Element/Design 官方身分或套件從屬門檻；不得再以與10334不重疊阻塞固定20件。
- Gate 2 的獨立模型驗收採 **尺寸＋合理接合**：逐件原始 LDraw 幾何對 GLB 三軸尺寸容差為 `max(0.1 mm, 來源尺寸的0.5%)`，且使用既有真 Unity glTFast／MeshCollider 與 exact model/source digest 綁定的接點、插接空腔與 collisionProxy `Verified` 證據。兩者通過即可列 `gate2Ready=true`，固定20件全部符合即屬 Gate 2 **幾何 Ready 20/20**；不需要特定盒組對應、官方 Element/Design 或全部外觀人工核准才能達成這個階段里程碑。
- `gate2Ready` 僅代表上述建模尺寸／接合驗收，**不得**以此直接改寫不可變 `ModelRevision`、標記 `visualApproved`、將 `Validating` 跳成正式 `Ready` 或發布 `Release`；完整 Catalog/Preview/Release 的來源、品質、RuntimeBuild 與發布契約仍分別依 §§3.4、4.2、13.1～13.2 稽核。不得再將 `readyAsset=false` 或正式 `Ready 0/20` 誤解為 Gate 2 尺寸／接合未通過。
- Gate 2 後續不以新增防呆案例取代這20件已通過的明確證據；持久化狀態與報告應分別顯示 `gate2ReadyCount` 和正式 Catalog `readyCount`。本決策不自動授權進入 Gate 3。

### 2026-10-18 歷史實作與驗收進度（已由2026-10-22頂端跨文件稽核取代）

| 範圍 | 已有實作／證據 | 尚未完成 |
|---|---|---|
| 來源與目錄 | import／resolve CLI、指定盒組候選、LEGO Element identity、可選 authoritative Design identity、不可變附件及 Frozen 缺口保護；`set_inventory_identity.py` 以 authoritative set Element binding fail-closed 升格身份；官方 Design 有證據時才作跨 Element geometry dedup，未公開 Design 的 Element 以自身 Element ID 作 isolated geometry fallback。10334 的 PAB response **276/276** 提供 276 Element identities／184 official Design IDs；`36752a` 透過唯一 pinned `B` child 安全橋接；官方 Building Instructions 第198頁另證明特殊音效件 Element `6488969` 屬於 10334，且其 authoritative identity 保持 `designId=null`，不採用 pinned candidate `109006` 冒充官方 Design。最終 audit 為 **276/276 inventory rows、277 Element identities、184 Design-based + 1 Element fallback = 185 geometry identities、0 identity gaps**；受控 SQLite 與 fail-closed 矩陣維持 | 指定盒組 identity blocker 已閉環；尚未完成的是逐資產模型／Ready、正式視覺基準、RuntimeBuild、發布、完整故障／效能矩陣。特殊件 `6488969` 若未來取得官方 Design，可再建立有 provenance 的 successor mapping，不回寫或猜測現值 |
| 模型製作 | 固定ImportLDraw、Blender、Khronos實際轉換；工作租約／重試／版本競態保護；固定20件品質樣本已達20/20 reference dimensions、20/20 collision Verified、IT-004 真 glTFast 尺寸／座標／tangent／texture-bearing 正例閉環；source／metadata／toolchain 任一變更皆產生新 revision identity，successor 不覆寫舊 revision | 正式 Ready 仍為0/20；舊 fixed20 只保留為 Gate 2 品質樣本，不是 10334 正式建模清單或 inventory 分母。Pinned bulk evidence 為 Design 19/20、目前外觀 Element alias 15/20；`gate2-fixed20-part-crosswalk.json` schema v4 證明 fixed20 與 10334 僅 7/20 part 型態重疊（3020、3705、3700、4032a、3069b、3005、6141），fixed20 當時使用的同 part+同顏色外觀則 0/20 重疊；`specifiedSetInventoryId=null`、`catalogEligibleElementIdentityCount=0` 仍刻意維持。Bulk alias、第三方 set membership 或 BrickLink identity-only 證據只能保留作研究／交叉驗證，不能算正式 catalog 身份完成 |
| 原生預覽 | uGUI、繁中字型、缺字可見警示、虛擬清單、搜尋清除、鏡頭與鍵盤操作、橫直重排；固定20件 acceptance preview evidence 已20/20且20/20 ≤256 KiB，原8件以合法 acceptance-only successor archive 補證據且舊 revision 不回寫 | 使用者已確認本階段畫面可繼續，但這不建立正式 `visualBaselineId` 或 `visualApproved=true`；完整 UX、故障、效能與正式逐件視覺基準仍未驗收 |

TDD **110/233（47.2%；95 UT、6 IT、7 CT、2 ET）**；BDD **11/56（19.6%）**；UX 1/20（5.0%）；SPEC 完整驗收條款 **3/36（8.3%）**。完成度不因新增來源 parser／audit 測試數量而直接上調。2026-10-10 真實 LEGO 10334 identity 已達 **276/276 inventory rows、277 Element identities、184 official Design-based geometry identities + 1 Element fallback = 185 geometry identities、0 identity gaps**。`36752a` 由官方 parent `36752`／Element `6474268`／Design `36752` 與唯一 pinned `B` relationship 安全橋接；`3677c02`／Element `6488969` 由官方 Building Instructions 證明 set membership，官方未公開可驗證 Design，因此保留 `designId=null`、以 `element:6488969` 作 isolated geometry fallback；pinned candidate `109006` 不升格成官方 Design。fixed20 與 10334 仍僅 **7/20 part 型態重疊、0/20 同 part+同顏色外觀重疊**，因此 fixed20 不作正式 set scope／C 分母；正式 Ready 仍 **0/20**。2026-10-10 歷史 Python catalog regression **232/232 passed**（job `8b9aa67f-aa15-4c24-8a1d-f57a57e6c1f4`）、acceptance regression **68/68 passed**（job `936a497a-faf6-49b0-99d4-af562f3635d7`）、完整 Python regression **300/300 passed / exit 0**（job `8eda617c-209e-4f6f-af38-32e3f94fb064`，207.30s）；另有 fresh installed-Player storage／upgrade acceptance **exit 0**（job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80`），已閉環 SC-016 的一般帳號唯讀安裝／不可寫 user-root／A→B 升級／uninstall 矩陣。另有 2026-10-10 歷史 Core.Tests **167/167 passed / exit 0**（job `bd117e25-ff4a-4ac7-a323-63bb5787c3ae`）、Unity EditMode **205/205 passed / exit 0**（job `25ee7889-5cf3-4a8c-b088-56b4c8c146f7`）、netstandard compatibility build **exit 0**（job `7d9929a4-e3e5-45ac-a3d7-d77da2baea56`）、launcher build **exit 0**（job `0be0f0a2-b143-4833-9f8e-1d2062233128`）。Gate 2 未結束；identity blocker 已閉環，但正式 `visualBaselineId`、逐件 Ready、RuntimeBuild／發布與指定硬體門檻仍未完成。

**2026-10-18 最新回歸**：Catalog **234/234**（`69102445-b0dc-4b0f-a5f2-de6dfdfe1552`）、Acceptance **70/70**（`f11eec41-e20a-4f8a-9adf-bca314377957`）、完整 Python **304/304 passed / exit 0**（`798f4d27-95ca-4a42-9afe-a9f33467dd10`）、.NET Core.Tests **168/168**（`61379679-bc26-45c4-b4c3-5814aee03d93`）、netstandard compatibility build **exit 0**（`114c77bc-b0c6-4848-bf6b-8ad2e5641f94`）。僅更新回歸證據，TDD **110/233**、BDD **11/56**、UX **1/20**、SPEC **3/36**、fixed20 **Ready 0/20** 不變，仍不進 Gate 3。

## 1. 功能概述

建立由使用者指定 LEGO 盒組驅動、可追溯來源、可實際載入並持續擴充的積木模型庫，供後續人物、玩家庫存與收藏屋共用。每個納入範圍的實體零件變體均須有正確的 3D 外觀與用途資料；只有零件名稱、圖片、下載連結或占位方塊不算建模完成。

2026-09-09 使用者已同意可下載安裝、資料全在地端的 Unity／URP 單機方向。本修訂據此定義目錄判定、模型製作、Unity 匯入、本機資產包、程式內介面及安裝驗收；取代原先以網頁與本機服務為中心的草案。引擎與畫面方向無須重複確認，新的座標、套件、安裝／資料版本與測試細節在本份 SDD 供審閱。

本 SPEC 只建立共用模型與最小原生預覽交付，不實作人物、庫存、建屋或賽車玩法；後續模組在同一 Unity Player 內使用本契約。

2026-09-09 使用者在了解本階段包含實際安裝版畫面驗收、目前仍無可操作畫面後，回覆「好 繼續」。依此記錄本修訂 SDD 已確認；其後使用者回覆「全數同意 請繼續」，接受 Q-001～Q-003 與 GAP-001～010 的處理方向。使用者後續回覆「確認」，本補強版 SDD 已確認；具體契約已回寫原章節與第13節，BDD／TDD補強及交接已完成，不重問已同意方向。

### 1.1 來源與需求追溯

| MVP 來源 | 本 SPEC 責任 | 本 SPEC 驗收 |
|---|---|---|
| `REQ-001`、故事 001、`DEC-001` | 指定盒組 inventory、LEGO Element／Design 身份、實際模型與完整性核對 | `AC-001`～`AC-009`、`AC-017` |
| `REQ-002`、故事 001 | 新貨號增量建模、版本更新與既有引用保存 | `AC-010`、`AC-011` |
| `REQ-003`、故事 002 | 人物組件款式、部位及裝配錨點資料 | `AC-012` |
| `REQ-006`、故事 002／009、`PLAN-001` | 特殊款分類、限定取得來源及建立人物／初始桶資格過濾 | `AC-013` |
| `REQ-005`、`REQ-010`～`REQ-012`、`PLAN-001`、`PLAN-003` | 提供可連接建材、碰撞代理、用途標籤及相容性資料 | `AC-008`、`AC-014`；2026 片抽樣與建屋判定由後續 SPEC 實作 |
| 共用模型存取與後續整合 | 程式內查詢、Unity 預覽、維護錯誤與效能 | `AC-015`～`AC-020` |
| `REQ-016`～`REQ-019`、`DEC-003`～`DEC-006` | 本機安裝基礎、離線模型包、Unity 畫面、更新／存檔相容邊界 | `AC-021`～`AC-026` |
| [MVP-002-BrickRace](../requirements/MVP-002-BrickRace.md) 共用模型需求 | 輪組幾何、質量資料欄位、尺度與複合碰撞相容性；不承擔正式車輛性能與賽道驗收 | `AC-008`、`AC-024`；業務演算法留待 MVP-002 |

`PLAN-002` 的每人物領桶、共用收藏屋及建立期半價已在 MVP 確認，本 SPEC 不實作人物建立或發放。其餘 MVP 需求由原切分表追溯至後續 SPEC，不能以本 SPEC 完成宣稱 MVP 全部完成。

### 1.2 範圍

- 納入使用者指定 LEGO 盒組 inventory 中的積木零件，包含其中出現的 `System`、`Technic`、`DUPLO`、人物零件及其他系列；不同已存在的顏色、印刷、雙色成型、材質或幾何版本均需識別。
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

### 2.3 目錄與模組責任

Unity專案已位於`brickhigh/game/`，上述Domain／Application／Infrastructure／Presentation／Editor／Tests分層、Packages及ProjectSettings已有實作。製作工具位於`tools/catalog/`，來源及可重建產物位於`artifacts/`；原規劃的`blender/catalog/`不作已存在實作的宣稱。已產生內部Player及安裝包，完整發行門檻仍待驗收；大量二進位來源不強制加入一般Git物件。

遊戲、模型製作與發行的關係如下：

```text
開發端：零件來源 → Blender / 模型驗證 → Unity 匯入 / URP 檢核 → 本地資產包 / 安裝包
玩家端：安裝 → BrickHigh.exe → 程式內模型查詢 / 場景載入
                                  ├─ 安裝目錄：唯讀目錄及 Unity 資產
                                  └─ 使用者目錄：本機玩家存檔及設定
```

`overview/README.md`已記錄Unity、製作CLI、驗證命令及可操作內部包入口；完整架構文件仍依後續實作同步。既有`Dockerfile`／Orick模板不作本遊戲部署契約。

### 2.4 已同意的畫面與賽車設計邊界

URP 使用一致的塑膠主材質、適當反射與柔和光照，保留零件接縫與倒角；橡膠、透明件與印刷各有可重用材質設定。建造／展示注重近距離辨識，賽車注重路況與穩定鏡頭；本 SPEC 只驗收模型呈現與代表場景，不建立正式收藏屋 UI、Cinemachine 駕駛流程或三張賽道。

為支援 MVP-002，保留逐片組裝來源、輪組錨點及碰撞代理；移動車身建議使用一個主要剛體與有限數量的複合碰撞體，輪組另外處理。這是相容性設計，不表示任何形狀車輛皆已可駕駛。輪數、動力來源、可用車架、性能公式與賽道規格仍由 MVP-002 決定。

## 3. 指定盒組範圍與 LEGO 身份解析

### 3.1 指定盒組基準

模型收錄分母由使用者明確指定的 LEGO 盒組編號集合決定。`CatalogSnapshot.scope_manifest_json` 保存盒組編號、來源 artifact、來源版本／觀測時間、inventory 摘要與 digest；新增盒組或修正 inventory 建立後繼 Draft，不修改既有 Frozen／Published。

每個盒組 inventory 須保留可核對的 Element ID、數量與外觀映射；Design ID 僅在 authoritative source 實際提供時保存。正式身份解析方向固定為「指定盒組 inventory → authoritative Element ID →（若有）authoritative Design ID／顏色／印刷」，不得反過來從 LDraw filename、Rebrickable part number、顏色或外觀猜 Element／Design。人物與子組件必須展開成實際 Element；貼紙紙張、說明書與包裝等非建模附件可依明確規則排除並保留理由。跨盒組重複 Element、同盒組重複數量都不建立重複變體；只有具同一 authoritative Design 的多個 Element 才可直接共用核心幾何，沒有官方 Design 的 Element 以自身 Element ID 隔離幾何。

來源缺頁、盒組 inventory 不完整、Element identity 無法核對、外部 ID 衝突及未成功展開的人物組件都須出現在 `coverage_gaps`，不能藉縮小盒組範圍或猜測 ID 消除缺口。單純「官方未公開 Design ID」本身不是 identity gap；此時必須記錄 Element-only provenance 並使用 Element geometry fallback，禁止以第三方 Design 值填洞。

### 3.2 資料來源分工

| 來源 | 本次使用方式 | 不可推論的事項 |
|---|---|---|
| LEGO 官方盒組／Pick a Brick／零件資料 | 核對盒組、Element ID、官方有提供時的 Design ID、顏色／印刷及官方名稱，保存查核來源與時間。 | 某頁面未公開 Design ID 時不能自行猜測或以第三方值、顏色／名稱替代；已證實的 Element identity 仍可用 Element fallback 保留。 |
| [Rebrickable API v3](https://rebrickable.com/api/v3/docs/) | 使用 Downloads CSV 輔助盒組 inventory、Element／part crosswalk 與人物組件展開，保留第三方 ID。 | Rebrickable part number 不能直接視為 LEGO Design ID；同一 part 對多個 Design 世代時必須由盒組 Element 身份消歧。 |
| [LDraw Library](https://library.ldraw.org/documentation) | 鎖定 library release 作幾何來源，保留子零件、材質及來源關係；找不到者另行建模。 | LDraw filename／後綴是幾何來源識別，不是唯一官方 LEGO Element／Design 身份。 |
| 人工維護的證據補件 | 補入官方身份、跨來源對照、幾何等價與使用條件，記錄附件、判定者、日期與理由。 | 不能只以肉眼相似或第三方同號把不同 Design ID 合併。 |

2026-09-27 已從 Rebrickable 官方 CDN 下載 12 份 bulk CSV，完整 URL、欄位、列數、bytes 與 SHA-256 保存於 `artifacts/sources/rebrickable-20260927/download-manifest.json`；其用途限於 inventory／crosswalk／候選輔助。模型來源使用逐資產授權紀錄；LDraw 依[實際檔頭及來源](https://library.ldraw.org/documentation/licenses-and-legal/ldraworg-contributor-agreement)保留作者、授權版本與修改說明。

### 3.3 Element／Design 身份與去重

- LEGO `Element ID` 表示具體可識別的零件變體身份；同一 Design 的不同顏色／印刷若具有不同 Element ID，目錄必須比照分開保存，不能因外形相同合併料號。
- LEGO `Design ID` 是**可選的**核心設計／幾何官方鍵；只有 authoritative source 實際提供 Design ID 時，同一 Design 的不同 Element 才可直接共用經驗證的核心 mesh／geometry revision。官方未公開 Design ID 的 Element 仍是完整 catalog identity，geometry identity 退回該 Element 本身且不得跨 Element 自動合併；材質／印刷與 Element 變體身份保留在 appearance／variant 層。
- 正式 catalog 的身份證據以使用者指定盒組中的 Element ID 為起點。若舊探索模型只有 LDraw／BrickLink／Rebrickable 身份、沒有可核對 Element ID，只能當幾何或外觀研究證據，不得計入指定盒組的已完成變體 `V`。
- 不同 authoritative Design ID 不因 Rebrickable part number、LDraw filename 或外觀相似而自動合併；沒有 authoritative Design ID 的不同 Element 也不得因第三方 candidate 相同而自動合併。若要額外共用 mesh，必須另有可追溯的幾何等價證據，且仍保留各自 Element／Design provenance。
- 同盒組數量與跨盒組重複只增加 inventory quantity，不建立重複 `PartDefinition`／`PartVariant`／`ModelRevision`。
- Element 已由 authoritative set evidence 證實但官方未公開 Design ID 時，不列 identity gap；保存 `designId=null` 與 Element geometry fallback。只有 Element identity／set membership 本身無法核對或互相衝突時才列 identity gap；任何 Design 都不得由顏色、名稱、最近似 part number、第三方 candidate 或歷史世代猜測。

### 3.4 完整性與發布門檻

每個 `CatalogSnapshot` 報告指定盒組展開去重後的候選變體數 `C`、未解 inventory／身份／來源缺口數 `G`、已驗證可交付變體數 `V`。非積木附件另列具理由的範圍排除，不混入 `C`。

- 模型覆蓋率為 `V / C`；`C = 0` 時顯示「尚未指定可驗收盒組」，不顯示 100%。
- 分母在快照凍結後不可縮小；新增盒組、修正 inventory 或身份映射建立後繼 Draft 並呈現差異。
- 全量完成須同時滿足 `C > 0`、`G = 0`、`V = C`、無映射衝突、所有品質與來源檢核通過，並有指定盒組涵蓋審查紀錄。
- `V / C = 100%` 僅代表目前已指定盒組全集完成；後續新增盒組建立 successor，不改寫舊 Published。
- 快照可為 `Draft`、`Frozen`、`Published`；草稿可供維護者預覽。正式 `Published` 必須符合上述全量門檻。禁止將部分完成快照發布成正式 Release 基準。
- 另允許第 13.1 節的 `Preview` 技術驗收包：從 Frozen 中選取已通過逐件品質及使用條件檢核的模型，明確隔離於正式 `Release`。Preview 可在指定盒組全集未完成時交付，但不得切換正式 head、授予玩家道具或標記本 SPEC 全部完成。

## 4. 模型與分類契約

### 4.1 身分與外觀

- `PartDefinition`：一個經確認的核心設計／幾何或不可拆出廠組件定義，內部 `partId` 使用不可變 UUID；LEGO Design ID 是主要官方設計映射，Rebrickable part number 與 LDraw filename 另以來源別名記錄。
- `PartVariant`：具體 Element／顏色／印刷／雙色成型及材質配置的實際組合，使用不可變 `variantId`；LEGO Element ID 作精確來源映射及去重鍵之一，禁止只以顏色名稱或 Design ID 取代 Element 身份。相同 Design 的多個 Element variant 可指向同一核心幾何 revision。
- 印刷與多色部分不可因主色替換而消失。同幾何可共用來源 mesh，但每個變體均需可獨立解析、呈現及驗收；去重不能減少變體分母。
- 外部別名不得未經證據自動合併。舊 ID 更正採有方向的 alias／supersedes 關係，既有 `variantId` 及資產版本仍可解析。

### 4.2 建模管線

```text
指定盒組與 inventory 審查
  → Element／Design／外觀身份整理 → 去重與缺口檢查 → 凍結需建模集合
  → 幾何取得或製作 → Blender 標準化與外觀修整
  → 接點／碰撞／用途與人物錨點標註
  → GLB + metadata + PNG + 來源與品質報告
  → Frozen 候選的來源驗證 → Unity staging 匯入／材質／座標／碰撞檢核
  ├─ 已通過的代表模型 → Preview 技術驗收包（不改正式 head）
  └─ 全量與品質皆通過 → 原子發布來源快照
       → 核對 staging 與發布摘要完全相符 → Release 資產包／安裝包
```

幾何優先使用有明確來源的 LDraw 官方 library 資產；匯入時解析完整依賴、顏色及面朝向。第一版需實作或整合可驗證的 LDraw→Blender 轉換器，不能假設 Blender 原生具備 LDraw 匯入。標準 primitives 可使用參數式建模；未支援的印刷、紋理、曲面或零件須以 Blender 補建，保留尺寸／圖片參考與檢核報告。

LDraw→Blender已採固定commit的ImportLDraw，並由`tools/catalog/blender_convert.py`執行；普通磚等樣本已有真實轉換、Khronos與六視圖證據，尚未代表全部格式／系列通過。開發時先以普通磚、薄板、透明件、印刷人物組件、Technic 孔軸及 DUPLO 件做轉換能力驗證，再批次處理；這是開發次序，不是縮小最終交付範圍。缺子模型、BFC／TEXMAP／材質轉換未支援時須補模或保留失敗，不能只因一般磚能載入就宣稱全部格式受支援。

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
| `CatalogSnapshot` | 指定盒組 scope、候選 membership、身份／分類版本引用、涵蓋審查及發布狀態 | `ICatalogSnapshotRepository`、`CatalogCoveragePolicy` |
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
| `evidence` | `evidence_id PK`、`artifact_id FK`、`subject_ref`、`claim`、`effective_from/to`、`reviewer`、`reason` | 身份、幾何、外觀、盒組 membership 等判定必須可追到來源內容，不只保存 URL。 |
| `snapshots` | `snapshot_id PK`、`baseline_at`、`parent_id FK`、`status`、`scope_manifest_json`、`coverage_review_json`、`compatibility_profiles_json`、`version` | 凍結後範圍與規則不可修改；發布需匹配預期 version。 |
| `snapshot_entries` | `snapshot_id FK`、`variant_id FK`、`evidence_ids_json`、`classification_json`、`display_projection_json`、`selected_revision_id FK` | `PK(snapshot_id,variant_id)`；所選 revision 必須屬於該變體；投影保存名稱、LEGO Design／Element、外觀與來源別名。 |
| `coverage_gaps` | `gap_id PK`、`snapshot_id FK`、`source`、`family`、`kind`、`resolution_evidence_id` | 未解決項目計入 `G`，不能藉刪除解除阻斷。 |
| `model_revisions` | `revision_id PK`、`variant_id FK`、`input_digest`、`toolchain_json`、`status`、`manifest_json`、`validation_json` | `UNIQUE(variant_id,input_digest)`；狀態按允許轉移規則更新。 |
| `jobs`／`job_items` | `job_id PK`、`idempotency_key`、`input_digest`、`kind`、`status`、`lease_until`、`attempts`；逐項 input hash、結果及錯誤 | 相同工作鍵與輸入重用；鍵相同但輸入不同回衝突。 |
| `catalog_head` | 單列 `id=1`、`snapshot_id FK`、`version` | 交易內比較版本後切換，併發發布只有一個成功。 |

所有已發布回應使用 snapshot 中凍結的名稱／別名／身份／分類投影及指定 revision，不直接 join 可變的最新工作資料產生歷史內容。後續新增盒組或修正身份映射不改寫舊 snapshot；歷史精確引用持續可讀，避免玩家已存檔模型失效。

`Frozen` 固定指定盒組 scope、候選、證據、身份映射、分類與相容規則，但仍可記錄建置結果、更新所選 revision 及驗證報告，每次操作遞增 version。`Published` 的內容及模型選擇完全不可變。凍結後若需新增盒組、補來源、修正 Element／Design 映射或分類，建立後繼 Draft；可重用輸入未變且已通過的模型，不能在原快照悄悄改分母。

### 5.3 玩家端資料分區與唯讀發行 Schema

| 區域 | 內容 | 規則 |
|---|---|---|
| 安裝目錄 `StreamingAssets/Catalog/<packId>/` | `catalog.db`、`release-manifest.json`、本地 Addressables catalog／bundle 與相容資產 | 開啟唯讀；不在遊戲啟動時下載新目錄或原地更新。 |
| `Application.persistentDataPath/Profiles/<profileId>/` | 後續 `player.db`、設定、存檔版本、目前及備份資料 | 本機玩家身分與人物 ID 分開；不把存檔放進安裝目錄。 |
| `Application.persistentDataPath/Diagnostics/` | 本機錯誤／效能紀錄 | 不自動上傳；不記錄憑證或完整玩家存檔。 |
| 開發端工具資料 | 原始來源、證據、製作工作、未發布模型與完整品質報告 | 不隨玩家安裝包提供外部服務憑證、下載工作或草稿編輯入口。 |

玩家端 `catalog.db` 使用下列唯讀投影，與上節維護 DB 分開：

- `runtime_snapshots(snapshot_id PK, baseline_at, coverage_json, schema_version)`。
- `runtime_variants(snapshot_id, variant_id, part_id, tier, display_json, usage_json, selected_revision_id)`，複合主鍵為 snapshot／variant；正式新取得只使用該快照已 Ready 且符合用途資格的變體。
- `runtime_models(snapshot_id, variant_id, revision_id, runtime_build_id, metadata_json, address_key)`，保存現行與相容版本的精確引用；歷史相容模型存在不會自動加入目前用途清單或改變 Special 資格。
- `runtime_builds(runtime_build_id PK, source_revision_id, build_target, editor_version, package_lock_digest, coordinate_profile, content_digest, validation_digest)`。
- `runtime_files(storage_key PK, sha256, byte_length, kind)`；`runtime_profiles(snapshot_id, profile_id, definition_json)` 保存相容接點等規則。
- `runtime_meta(key PK,value)` 保存 `packId`、`currentSnapshotId`、`schemaVersion`、`minReaderVersion`、`assetContractVersion`，另含 `applicationId`、`packageKind`、`buildTarget`、`sourceSnapshotStatus`；完整版本引用的新增欄位及 FK 依第 13.5 節。來源 attribution 以必要的本機唯讀資產提供。

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

`CharacterCreation` 排除 Special 且要求 creationEligible；`InitialBucket` 要求 bucketEligible、非特殊款及指定相容系統。正式新取得查詢只回傳 Ready 且符合用途資格的變體；歷史存檔以精確 ModelReference 讀取相容資產，不經新取得查詢。`Browse` 僅為系統模型查詢，不作為玩家收藏櫃的擁有清單。

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
| `catalog resolve --snapshot <id> --decisions <path>` | 將有證據的身份／幾何／外觀／盒組 membership、分類及別名寫入 Draft。 |
| `catalog freeze --snapshot <id> --expected-version <n>` | 固定指定盒組 scope、identity 映射與分母；未解 inventory／身份缺口保留為發布阻斷。 |
| `catalog build --snapshot <id> --job-key <key>` | 製作或恢復 GLB／metadata 等模型產物。 |
| `catalog validate --snapshot <id>` | 全量來源、模型與分類檢查，輸出逐項結果。 |
| `catalog publish --snapshot <id> --expected-head-version <n>` | 開發端發布來源模型快照，不等於玩家安裝包已完成。 |
| Unity batchmode `BuildValidationContent` | 讀取 Frozen 的指定 snapshot version／selection digest，建立 Unity staging、逐件 RuntimeBuild 與驗證報告；不切正式 head。 |
| Unity batchmode `BuildPreviewPlayer` | 從通過檢核的 staging 子集合建立 Preview 包，逐項列明來源、LEGO 身份與缺口；不得使用 Release 身分或存檔。 |
| Unity batchmode `BuildCatalogContent` | 僅讀 Published，核對完整 staging 輸入與工具 digest，組成正式 catalog.db／本地 Addressables；摘要改變須重驗，不盲目沿用舊結果。 |
| Unity batchmode `BuildWindowsPlayer` | 打包 Player 與必要執行相依項目，再生成安裝交付物與 checksum。 |
| `catalog status --job <id>` | 顯示進度／失敗，依輸入 hash 恢復。 |

工具 exit code：0 成功、2 輸入錯誤、3 門檻不足、4 工具／外部失敗、5 版本／工作鍵衝突。輸出不得包含 API key。Player 不包含這些命令、來源 adapter 或寫入目錄工作。

### 6.4 離線資產包與安裝

`release-manifest.json` 至少包含 packId、appVersion、readerVersion、currentSnapshotId、catalogDbSha256、catalogSchemaVersion、assetContractVersion、buildTarget、editorVersion、packageLockDigest、compatibleSaveVersions、所有資產 bundle／local catalog 的 storage key 與 digest；另依第 13.1 節包含 packageKind、applicationId、sourceSnapshotStatus、sourceSelectionDigest、previewCompleteness。manifest 在建置時生成，包內所有路徑都必須解析到本地安裝位置；禁用遠端 Addressables catalog、遠端載入路徑與啟動自動更新查詢。

Unity [Addressables 建置](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/Builds.html) 產物與 Player 一起交付。GLB 是來源，安裝包包含預轉換的 mesh／材質／Prefab 等 runtime 資產、必要 attribution 與可讀 metadata；不要求每次開遊戲重新轉換，原始 Blender 工作檔不必隨包發行。

Windows 安裝交付物包含完整 Player、Unity runtime、Mono 與 SQLite native library 等必要檔案，建立啟動入口及移除安裝入口；任何必要 redistributable 都須隨安裝包離線提供。不能只交付單一 exe、Git 專案或需要 Unity Editor 的場景。首份 SPEC 先交付第 13.1 節的 Preview 技術驗收包，再完成全量 Release 的只讀模型預覽；完整遊戲入口仍在最後的收藏屋 SPEC 串接。

啟動流程：讀本機 release manifest → 驗證 DB 與 schema → 開啟 catalog session → 初始化必要資產 → 顯示入口。對大 bundle 按需做完整性驗證；驗證重用與檔案替換檢查依第 13.7 節，不以檔案大小或 mtime 相同直接信任。安裝／更新完成時做全包 hash 檢查。玩家首次離線啟動不得依賴已存在的網頁、Unity Editor 或資產下載快取。無任何必要登入或聯網啟用步驟。

### 6.5 更新、版本引用與玩家資料保存

本版使用玩家自行下載的完整離線安裝更新，不開發自動更新服務。更新前關閉遊戲，將新版本完整寫入獨立 staging 目錄、核對 manifest／檔案及必要相容內容後，再切換可啟動版本。未完成時舊版仍可啟動；既有安裝內容不在玩家遊玩中原地覆寫。安裝器不修改 player.db，移除程式預設保留使用者存檔。

Unity AssetBundle 受引擎／平台版本約束，本版不承諾任意舊 bundle 可由新版引擎直接讀取。每次更新須針對目前引擎重新建置仍需支援的舊來源 revision，納入當次包的 runtime_models 映射；同一發行系列保留先前正式發布模型的相容映射。沒有所需來源或映射時，更新驗證失敗，不能只保留一個新引擎讀不了的舊 bundle。

`SaveHeader` 最低包含 saveSchemaVersion、appVersion、profileId、assetContractVersion、worldScaleProfileId 與使用的 ModelReference 集合摘要。本 SPEC 提供 `ISaveCompatibilityChecker.Check` 與人工測試 fixture；實際人物／庫存／車輛資料由後續 SPEC 持久化。存檔中的缺模型或未知新 schema 造成可解釋錯誤，原檔及最後完整備份保留。

後續存檔共用約束：邏輯上一次取得／消耗以同一 SQLite transaction 提交；migration 在遊戲載入資料前執行，先建立一致備份，在交易中升版，失敗回滾。組裝資料若另外以檔案保存，先產生不可變新檔再在 DB transaction 切換引用，不跨 DB／檔案各自提交半套狀態。SQLite 備份須用 backup API 或停止寫入並關閉連線後取得一致檔案，不能任意複製仍有未 checkpoint 的 DB；參考 [SQLite 原子提交](https://www.sqlite.org/atomiccommit.html)。


## 7. Unity 預覽 UI 與操作狀態

Editor 製作預覽可查看 Draft／Frozen，明確標示未發布。Windows 包均提供 `CatalogPreviewScene`：Release 只讀已封裝的 Published 模型，標示「模型預覽」；Preview 僅讀第 13.1 節的受控候選子集合，持續標示「技術預覽・非完整模型庫」。兩者都不是玩家收藏櫃。正式遊戲後續由入口模組決定是否保留模型瀏覽工具，不因此授予玩家全量道具。

使用 uGUI 清單與 Unity Camera：左側搜尋、系列／款式／部位篩選與虛擬化分頁清單，右側單模型預覽、版本及尺寸摘要。滑鼠拖曳旋轉、滾輪縮放、按鈕重設視角；窄視窗上下排列。色彩與印刷變體是不同可選項目。文字輸入期間不得同時觸發模型旋轉或遊戲快捷鍵。

| 狀態 | 操作與結果 |
|---|---|
| 初次載入 | 本機載入進度；必要目錄／模型缺漏時顯示安裝不完整與修復方式，不導向外部下載作為唯一繼續方法。 |
| 搜尋無結果 | 顯示無結果及清除條件，已載入畫面不假造樣本。 |
| 快速切換零件／變體 | 新選取優先；舊載入可取消或結果被丟棄並釋放，不能蓋掉新模型。 |
| 模型損毀／不相容 | 顯示錯誤與診斷 ID，其他可用模型仍可選擇；不自動刪模型或重設存檔。 |
| 圖形裝置不支援 | 由隨包 Windows 啟動器／系統通知顯示失敗原因，不假設 uGUI 已能啟動；僅能顯示 PNG 不算 3D 驗收通過，詳第 13.8 節。 |
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
| 本機查詢 | 至少 `max(100000,C)` 筆 metadata，暖機後 1000 次查詢，分頁 50 筆；列表 P95 ≤ 100 ms、詳情 P95 ≤ 50 ms；不含資產載入，不在主執行緒同步阻塞。 |
| 單模型預覽 | SSD 冷載入至第一個正確畫面 ≤ 3 秒；顯示載入狀態，材質與圖片已在本機。記錄 GLB 與實際 bundle 大小。 |
| 大量積木畫面 | 在 Standalone 非 Development Build，以實際至少 2026 片可見積木、至少 8 類幾何及包含印刷／透明件的固定 manifest 場景驗收；不能只放 2026 個最低面數相同方塊。 |
| 畫面流暢 | 上述基準機／1080p、固定 Medium 圖形 preset，關閉 VSync／幀率上限量測，暖機 30 秒後記錄 60 秒：平均 ≥ 60 FPS、P95 frame time ≤ 20 ms。讀取載入畫面單獨統計，不混入穩態數字；正常 UI 操作必須納入。 |
| 資產預算 | 來源 GLB ≤ 20 MiB、單張紋理 ≤ 2048×2048、預覽圖 ≤ 256 KiB；另報告 Unity mesh／texture CPU 與 GPU 記憶體及 bundle 體積，不以來源壓縮大小代替 runtime 預算。 |
| 資源釋放 | 同一組 20 個模型切換 5 輪後，已釋放 handles 與 Unity mesh／texture 數量回到允許快取上限；renderer cache 使用 LRU，快取估計上限 256 MiB，使用中的資產另外統計。 |
| 車輛相容性驗證 | 技術原型使用不同輪徑／軸距的幾何 fixture、主要車身剛體與有限複合碰撞體，在短路面／坡面／路緣檢查輪組位置與尺度；不設定最終賽車圈速或操控平衡門檻。 |

每次量測保存 GPU／CPU 型號、驅動、Unity／URP／套件版本、內容 manifest、preset、載入與穩態結果。全量建模工期、最低配備及下載容量在有代表模型與完整分母後估算，不能從上述暫定目標推導已能滿足所有場景。超過原型效能目標時先改善批次、LOD、接點搜尋與碰撞負擔，再以證據調整設計；不可悄悄降低 2026 片或刪除變體需求。

### 8.3 失敗與重試

- 外部來源 timeout、`429` 或服務中斷：保存中斷點、尊重 `Retry-After`，最多自動重試 3 次後保留待恢復；不得因失敗把指定盒組 inventory 或既有成功候選清空。API 使用憑證由環境提供，僅放 Authorization header，不存入 URL 或報告。
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
| `AC-001` | 快照保留指定盒組 scope、inventory 來源 artifact／hash、Element 展開與涵蓋審查結果；來源缺頁或未展開 Element 不能被標示為完整。 |
| `AC-002` | LEGO Element／Design 分層：指定盒組的 Element ID 必須有 authoritative set evidence 與外觀身份；Design ID 僅在 authoritative source 有提供時保存並作 geometry dedup。沒有官方 Design 的 Element 以自身 Element ID 作 isolated geometry fallback；不同 Element／Design 不因第三方同號自動合併。 |
| `AC-003` | Element ID 作精確變體去重；同一 Element 在同盒組重複數量或跨盒組重複不建立第二份變體。只有同一 authoritative Design 的多個 Element可直接重用核心 mesh；缺官方 Design 的 Element 不跨 Element 去重；外部 ID 衝突被攔截。 |
| `AC-004` | 使用者已指定盒組全集在固定快照中逐項有可追溯身份與 revision；inventory／身份缺口以 G 報告，禁止以縮小 scope 宣稱已完成。 |
| `AC-005` | 每個交付 GLB 通過格式及品質檢查，對應 RuntimeBuild 可由實際 Unity Player 載入呈現；空 mesh、占位方塊、缺紋理或錯誤印刷不能通過。 |
| `AC-006` | LDraw → canonical GLB 的軸向、單位、法向及參考尺寸通過指定容差，非對稱件沒有鏡像。 |
| `AC-007` | 每份外觀變體保留來源、作者／授權、原始與輸出 hash、工具版本及六視圖；RuntimeBuild 另留 Editor／套件版本、轉換契約與渲染驗證結果。 |
| `AC-008` | 接點、相容 profile 與碰撞代理可用配對 fixture 驗證，合法插接不因封閉包圍盒被擋；不相容系列不能因同名接點通過。 |
| `AC-009` | 存在 inventory／身份／來源缺口、分類缺漏、Failed revision 或品質錯誤時，發布失敗且現有 head 不變；C=0 不顯示 100%。 |
| `AC-010` | 新增指定盒組或模型修正建立後繼 snapshot／revision；同一盒組／Element／Design 匯入或建置重試不產生重複變體／結果。 |
| `AC-011` | 新快照生效後，舊 snapshot／revision 可依精確 ID 取得相容 RuntimeBuild；不因盒組 scope、身份映射、分類或 Unity 版本改動讓既有模型引用失效。 |
| `AC-012` | 人物組件有 tier、部位、錨點與相容規格；每個基本部位至少有可供下一份人物規格使用的有效候選，缺候選明確阻斷。 |
| `AC-013` | Special 在人物建立與初始桶查詢均不可取得；直接查詢模型不改變任何玩家權益。 |
| `AC-014` | 至少一個相容建造系統提供可構成地板、牆面、屋頂與出入口的有效建材集合；傳出可供後續配方與建屋驗證使用的 metadata。 |
| `AC-015` | 遊戲內列表／詳情／相容規則固定同一 session／snapshot；cursor 同條件無漏項／重複，跨條件或快照使用被拒絕。 |
| `AC-016` | 原生預覽涵蓋載入、無結果、模型失敗、圖形裝置不支援、快速切換及重試；鍵盤可操作，失敗不顯示假的成功模型。 |
| `AC-017` | 全量交付報告滿足 C>0、G=0、V=C 及所有品質門檻，列出指定盒組 inventory、authoritative Element identity、可用時的 authoritative Design 或 Element fallback，以及逐變體證據；測試資料不列入實際資產分母。 |
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

- Domain／Application EditMode 單元測試：盒組 scope、Element identity／optional Design／Element fallback、變體唯一性、分類用途、快照門檻、版本轉移、接點配對與相容檢查，涵蓋 `AC-001`～`AC-004`、`AC-008`～`AC-015`、`AC-023`。
- 真實資料整合：開發端 SQLite 與 Windows Player 的原生 SQLite adapter 分別驗證 FK／unique／transaction、參數綁定、唯讀 DB、分頁、工作租約、重試與發布競爭。不能以記憶體假資料庫取代交易及原生相依驗收。
- 開發端模型管線：Python 工具測試與 Unity Editor 匯入測試先用可核對的幾何／材質／印刷／連接正反例，再逐項檢查全部實際交付變體；來源線上取得與離線可重跑檢查分開。
- Unity PlayMode：真實 prefab／URP 材質、uGUI 狀態、鏡頭與輸入、主執行緒限制、取消競態、lease 生命週期、固定版本契約及座標轉換；涵蓋 `AC-005`～`AC-008`、`AC-015`～`AC-016`、`AC-024`～`AC-026`。
- 原生 E2E：受控來源 fixture → 真實 Blender 轉換 → Unity 匯入／資產建置 → 本地 catalog.db／Addressables → Windows 安裝包 → 斷網首次啟動／查詢／旋轉／切換外觀。此鏈不得 mock 掉轉換器、SQLite adapter 或資產載入。
- 安裝／更新驗收：在乾淨 Windows 環境以一般使用者執行，測試唯讀安裝目錄、使用者資料目錄、損毀包、空間不足、升級／回復及解除安裝保留資料，涵蓋 `AC-018`、`AC-021`～`AC-023`、`AC-025`。本份用明確的存檔 fixture 驗證契約；真實人物／庫存／房屋／訂單資料的遷移須在其負責 SPEC 另行驗收。
- Standalone 畫面／資源測試：固定 2026 件實際模型組合、指定品質設定與硬體量測；車輪接觸原型只驗證本份資產尺度／碰撞適用性，不代替 MVP-002 的操控、性能映射或三張賽道驗收。
- 全量資料驗收另存逐件 manifest／來源證據／品質報告；fixtures 通過只證明工具行為，不能取代 `AC-017` 的真實全量交付。

以上為 SDD 測試策略，不是已執行測試。2026-09-09已保留原46場景／179測試，並依確認後第13節追加10場景／54測試；[BDD](../bdd/SPEC-001-BrickModelCatalog-BDD.md)共56場景，[TDD](../tdd/SPEC-001-BrickModelCatalog-TDD.md)共233項。AC-001～036均有BDD／TDD文件追溯（36/36），2026-09-09規劃時實作與驗收為0%；目前數值見開頭2026-09-27稽核。

## 10. 風險與需審閱的設計決策

| 風險 ID | 實際影響 | 本次設計處理／目前狀態 |
|---|---|---|
| `RISK-001` | 指定盒組 inventory 可能缺頁、Element identity 無法核對，或第三方 part number／Design candidate 互相衝突，可能造成錯件、漏件或錯誤 geometry dedup。 | 盒組→authoritative Element 必須可追溯；官方 Design 存在時才納入 Design provenance，未公開 Design 時採 Element isolated fallback。Element identity 缺口／衝突維持 fail-closed；舊 fixed20 僅作 Gate 2 品質樣本。 |
| `RISK-002` | 社群模型可能缺新零件、印刷或特殊系列；工具完成不代表所有模型完成。 | 逐件缺口、自建補模路徑及全量分母；尚未取得可承諾的數量與工期。 |
| `RISK-003` | 模型能看但接點／碰撞錯誤，玩家仍無法搭屋或裝人物。 | 配對 fixture、錨點與相容系統一起驗收；建屋配方留在後續 SPEC。 |
| `RISK-004` | 印刷辨識或來源 ID 合併錯誤導致玩家取得錯誤外觀。 | 幾何／變體分離、衝突隔離、分類記錄及逐變體渲染驗收。 |
| `RISK-005` | 第三方資產使用條件不清，模型包無法交付。 | 逐資產保存來源／授權／作者；資料不足列缺件，不默認可用。 |
| `RISK-006` | 全量資產與歷史修訂超過下載、磁碟或顯存預算。 | 按需載入與內容去重；實測總量、安裝暫存及相容資產成本，不能為縮包默刪舊引用。尚無全量大小。 |
| `RISK-007` | SDD 基線確認與新增稽核風險決策須分開記錄，避免將概括同意延伸為全部風險已接受。 | 2026-09-09 修訂 SDD 已確認，BDD／TDD 已生成；Q-001～Q-003 已全數同意；具體補強契約見第 13 節，補強SDD確認及測試清單回寫已於2026-09-09完成；實作驗收依本次矩陣。 |
| `RISK-008` | glTFast／Addressables／原生 SQLite 的特定版本在 Unity Player 不相容。 | 最先完成最小真實 Windows 封裝驗證後才鎖版；候選版本不是已驗證組合。不以 Editor 成功替代 Player。 |
| `RISK-009` | 二次座標轉換或模型／物理尺度不一致造成鏡像、輪軸偏移與不穩定接觸。 | 非對稱座標 fixture、統一 WorldScaleProfile、簡單坡道／路肩測試；比例尚待原型決定，不保證 WheelCollider 已適合最終賽車。 |
| `RISK-010` | Unity 升級使舊 AssetBundle 不相容，或更新中斷造成舊存檔無法載入。 | 保留 source revision，重建目前相容 RuntimeBuild；安裝 staging／回復、存檔 schema 檢查與不相容阻斷。 |
| `RISK-011` | 2026 件與未來車輛的畫面負載未量測，1080p／60 FPS 可能需調整品質。 | 指定候選硬體與可重現場景，量測 CPU／GPU／資源再調整；不宣稱已達最低配備或最終賽車效能。 |

本 SPEC 的指定盒組 scope、LEGO 身份、全量門檻、來源管線、GLB／RuntimeBuild 分離、原生套件驗證、效能及安裝／存檔契約已隨本輪 SDD 確認。規劃交接當時實作可行性尚未實測；[風險稽核](SPEC-001-BrickModelCatalog-RiskAudit.md) 所列 10 項缺漏與 24 個測試補強方向已獲使用者全數同意；具體SDD亦已確認，10項缺漏均補至SPEC／BDD／TDD；規劃交接當時尚未執行實際測試；現行 Python／Unity／Player 驗證基線見本文件開頭與 TDD；本輪 Python 最新為 catalog 197/197、acceptance 67/67、完整 Python 上一全量基線 264/264；新增指定盒組 identity resolver 已用真實 pinned 10334 驗證 276 個 part/color／933 件 inventory、minifig／sub-set 展開與 fail-closed Element 升格；fixed20 的 pinned bulk Design／Element alias 與指定盒組 set-scoped identity 分層記錄，fixed20 只作品質樣本，與 10334 part 型態重疊 7/20、同外觀重疊 0/20，正式 authoritative set identity 仍未建立。

## 11. 實作順序、依賴與後續文件

本 SPEC 內部建議順序：

1. 建立獨立 Preview 的最小 Unity Windows 封裝原型：原生 SQLite、本地 Addressables、URP、啟動錯誤通知與唯讀安裝路徑，驗證套件相容後鎖版。
2. 領域規則、指定盒組 inventory、LEGO 身份證據與快照；同時揭露實際 inventory／identity 缺口。
3. 代表模型的 Blender 轉換、座標／材質／接點驗證；交付真實 Preview 包供使用者核准固定畫面基準，再批次推進外觀製作。另做 2026 件效能場景與有限輪組接觸原型，分開記錄本機與正式基準機結果。
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

本輪規劃文件已建立：

- [docs/bdd/SPEC-001-BrickModelCatalog-BDD.md](../bdd/SPEC-001-BrickModelCatalog-BDD.md)
- [docs/tdd/SPEC-001-BrickModelCatalog-TDD.md](../tdd/SPEC-001-BrickModelCatalog-TDD.md)
- [docs/specs/SPEC-001-BrickModelCatalog-RiskAudit.md](SPEC-001-BrickModelCatalog-RiskAudit.md)

本 SPEC 及第13節已確認，已依 `bdd-feature-generation` 補齊BDD／TDD，並依 `pre-implementation-risk-gap-audit` 完成回寫核對。TDD末尾交接狀態為 `Ready for well-done`，規劃阻斷項無；套件、來源、畫面及正式效能仍須開發階段實測。此為2026-09-09規劃交接時的工作邊界；後續已開始本 SPEC 實作，Gate 1 視覺方向已確認，目前持續進行 Gate 2，尚未開始下一份 SPEC。

## 12. 參考資料與驗證紀錄

來源資料於 2026-09-08 初次查核；LEGO Element／Design 身份策略於 2026-10-05 更新為指定盒組 Element ID 主導、Element 變體與 Design 幾何分層；Unity／離線封裝相關文件於 2026-09-09 查核。

- 引擎生命週期：[Unity 6 支援資訊](https://unity.com/releases/unity-6/support)。
- 編譯相容範圍：[Unity 6.3 .NET profile](https://docs.unity3d.com/6000.3/Documentation/Manual/dotnet-profile-support.html)；依此不沿用原先 .NET 10／EF Core 應用程式架構。
- 渲染與座標：[Render pipeline 選擇](https://docs.unity3d.com/6000.0/Documentation/Manual/choose-a-render-pipeline.html)、[Unity 座標與旋轉](https://docs.unity3d.com/6000.3/Documentation/Manual/QuaternionAndEulerRotationsInUnity.html)。
- 資產：[glTFast 6.14](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.14/manual/index.html)、[Addressables 2.7 建置](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/Builds.html)。此處為候選版本文件，不代表已完成本機相容驗證。
- 安裝與資料：[Windows Player 檔案](https://docs.unity3d.com/6000.3/Documentation/Manual/WindowsStandaloneBinaries.html)、[persistentDataPath](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Application-persistentDataPath.html)、[SQLite WAL](https://www.sqlite.org/wal.html)。
- 後續車輛原型依據：[WheelCollider 原理與限制](https://docs.unity3d.com/6000.0/Documentation/Manual/wheel-colliders-introduction.html)、[Compound collider](https://docs.unity3d.com/6000.0/Documentation/Manual/compound-colliders-introduction.html)。引擎功能存在不等於已證明適合本遊戲的比例與操控。
- 原 GLB／LDraw 格式來源見第 3、4 節。Blender 最新線上匯出手冊前次未能成功讀取，未據此宣稱轉換器已驗證；實作仍須用本機 exporter 與代表資產跑通管線。
- 規劃依據為 MVP、實際工作區與已查核官方文件；來源調查不是完成下載／建模證據。
- 2026-09-09規劃交接時只修改Markdown，執行`git diff --check`並核對驗收編碼、來源與文件包名稱；不是目前整體實作狀態。
- 2026-09-09交接時Unity專案、程式碼、模型管線及應用測試尚未實作／執行；2026-09-26現況及實測證據已回寫文件開頭。既有Blender場景檢查及內部樣本皆不代表整份規格通過。

## 13. 已同意風險方案的具體契約（補強版 SDD，已確認）

**決策來源**：使用者回覆「全數同意 請繼續」，接受 RiskAudit 的 Q-001～Q-003；2026-10-04 再確認模型 scope 改由指定盒組 inventory 驅動。以下把 GAP-001～010 回寫為具體設計；不是已完成原型、資產或實測的聲明。本文涉及 Preview 的新契約與既有 Release 契約分開；正式全量門檻仍依第 3.4 節。

### 13.1 Preview 技術驗收包與 Release 隔離（GAP-001）

| 契約 | Preview | Release |
|---|---|---|
| `packageKind` | `Preview` | `Release` |
| 來源資格 | 固定 Frozen version 中逐件 Ready 且 RuntimeBuild 驗證通過的明列子集合 | 完整 Published 快照與相容歷史引用 |
| LEGO 身份／scope | 可使用 Frozen 中身份已追溯且品質合格的明列子集合；缺完整盒組 coverage 時持續標示非完整 | 完整指定盒組 scope 必須達 C>0、G=0、V=C；新取得清單只包含 Ready 且符合用途資格的變體 |
| 介面 | 固定顯示「技術預覽・非完整模型庫」，可搜尋／換件／旋轉／縮放並顯示本包清單與缺口 | 標示「模型預覽」，只讀正式模型；完整玩法由後續SPEC整合 |
| 玩家資料 | 不開啟正式Profiles、不發放道具、不建立正式進度；僅自身設定、診斷與受控fixture | 使用正式資料根與相容存檔 |
| 驗收結論 | 只能標記技術預覽里程碑通過，不完成AC-017 | 全量與其他全部門檻通過才可結案 |

每件 Preview 資產仍須滿足 LEGO 身份、來源／使用條件、幾何／材質／尺寸／接點等適用的品質檢核；不能用指定盒組全集未完成作為免除逐件品質的理由。

Preview 首次畫面核准組合涵蓋普通磚、薄板、透明件、印刷人物組件、Technic 孔軸與 DUPLO 件，並含非對稱幾何；同一代表件可涵蓋多種特性。這不要求首次包即包含所有2026片場景，但完整SPEC效能驗收仍必須使用第8.2節的2026片／至少8類幾何。

`release-manifest.json` 新增必填 `packageKind`、`applicationId`、`sourceSnapshotStatus`、`sourceSelectionDigest`、`previewCompleteness`。Preview 的 completeness 保存包內變體數、整體 C/G/V、指定盒組涵蓋審查狀態與「非完整」標記，不能把子集合數當作全量分母。Release 的 previewCompleteness 為 null。

Player 在編譯／建置設定中固定允許的 packageKind，不能用玩家設定切換。Release 收到 Preview manifest 回 `IncompatibleContent`，顯示「此資產包僅供技術預覽，不能作為正式遊戲資料。」；Preview 的查詢固定 `Purpose=Browse`，拒絕 CharacterCreation／InitialBucket。Release 不提供把 Preview profile 匯入正式存檔的功能。本版也不包含任何由 Preview 自動升格為 Release 的操作。

### 13.2 先驗證、再發布的建置契約（GAP-002）

1. 製作工具 freeze 候選範圍；每個 source revision 完成 GLB／metadata 等來源品質檢查才能 Ready。
2. `BuildValidationContent` 接受 Frozen 的 `snapshotId + snapshotVersion + sourceSelectionDigest`，搭配 `buildTarget + editorVersion + packageLockDigest + coordinateProfile` 建立不可變 staging 輸入。每個 RuntimeBuild 留下實際Unity載入與品質結果。
3. Preview 可封裝其中通過的代表子集合；無權切正式 head。即使 G>0，仍可做這條技術驗證路徑。
4. 正式 `catalog publish` 另要求整個範圍符合第3.4節，且指定發行平台的全量RuntimeBuild驗證已通過；在交易內核對 expected version 與來源／選件digest後發布。
5. `BuildCatalogContent` 接受 Published，將完全匹配的 staging 產物封裝為 Release。來源、選定revision、工具、座標或目標平台摘要不符，一律拒絕重用並重建／重驗，不能只改manifest字樣。
6. `BuildWindowsPlayer` 與最後安裝包測試仍需執行；來源Published不代表安裝版已通過，也不省略最終Player實際載入。

製作端需持久化 `validation_builds(build_id PK, snapshot_id, snapshot_version, selection_digest, toolchain_digest, target, result_digest, status)`；Published 記錄引用已核對的 build ID。實際內容在交易前寫入不可變內容庫，狀態提交失敗不切head。不得以解除門檻的方法打破循環依賴。

### 13.3 固定應用身分、資料根與更新互斥（GAP-003）

首版發行識別採 `CompanyName=GameNenStyle`、Release `ProductName=BrickHigh`、`applicationId=com.gamenenstyle.brickhigh`；Preview 使用 `ProductName=BrickHighPreview`、`applicationId=com.gamenenstyle.brickhigh.preview`。這些是專案本機識別，不代表註冊商標或外部帳號。首版發行後不得只因改展示名稱就改動資料根；需要遷移另立明確版本化程序。

使用各自 `Application.persistentDataPath`；Preview 與 Release 的安裝位置、快捷入口、驗收fixture、設定及診斷分離。開發／測試使用隔離資料根，不操作真正玩家profile。

啟動器與更新器使用依 `applicationId + canonical installRoot` 生成的同一生命週期互斥鎖。啟動器須持鎖至Player退出；更新器從預檢、staging驗證、切換到完成持鎖。拿不到鎖時顯示「遊戲或更新程序正在執行，請關閉後再試。」並退出，不強制終止遊戲、不繞過鎖。直接啟動Player仍須驗證受控啟動權與安裝版本，不能繞過更新互斥；以同使用者／同一安裝的單一Player作本版支援邊界。

此鎖避免遊戲與安裝切換同時操作；不是反作弊或防惡意本機程式的安全保證。權限不足或鎖無法建立時保留原版本，禁止退回「直接覆寫」。安裝器只處理程式內容，不修改player.db。

### 13.4 備份、遷移、降版與明確還原（GAP-004）

`ISaveCompatibilityChecker.Check` 的成功值 `CompatibilityReport` 區分 `Compatible` 與 `MigrationRequired`；未知schema或內容不相容依既有契約返回 `Failure(UnsupportedSchema)`／`Failure(IncompatibleContent)`。能解析header不等於允許寫入，只有相容或已成功遷移才能開啟可寫資料。

- 遷移前用SQLite一致備份或停止寫入並關閉連線後備份；先寫獨立暫存備份，確認可讀、schema與引用完整，再標記完整備份。中斷備份不能覆蓋最後良好備份。
- 安裝切換失敗且新程式尚未遷移資料時，可回復舊程式內容；存檔不變。
- 新版已遷移或已保存新進度後，不保證舊版可直接使用該資料。舊版檢查不相容時不開啟可寫連線、不重新建立空檔，保留新存檔與升級前備份。
- 預設顯示「此存檔版本較新，已保留目前進度。請使用相容版本開啟。」。即使有舊備份，也不能自動回退新進度。
- 要還原備份時，先顯示版本／時間與「還原將回到所選備份的進度；目前資料會另行保留。」，取得明確確認後才切換。取消、確認不存在或還原失敗均維持當前資料；被替換的新進度另留不可變保留副本，不能默刪。

本份實作相容檢查、恢復政策與人工fixture驗證；真正人物／庫存／購買／房屋的migration與還原UI在各自SPEC實作。本條約束會作為後續依賴，不提前建立那些資料表。

### 13.5 完整模型引用與發行資料一致性（GAP-005）

玩家投影需補上以下不可分割的身分關係：

| 投影 | 主鍵／約束 |
|---|---|
| `runtime_revisions` | `(variant_id, revision_id)` 複合主鍵；另 `UNIQUE(revision_id)`，來源revision只屬於一個變體 |
| `runtime_models` | 加 `build_target`，主鍵為 `(snapshot_id, variant_id, revision_id, build_target)`；FK對應runtime_variants的snapshot／variant、runtime_revisions的variant／revision |
| `runtime_builds` | 加 `variant_id`；source_revision_id／variant_id 必須對應runtime_revisions；提供可被引用的唯一 `(runtime_build_id, variant_id, source_revision_id, build_target)` |
| 模型與建置關係 | runtime_models的runtime_build_id／variant_id／revision_id／build_target整組FK對應runtime_builds，禁止僅各欄位分別存在就視為相容 |

所有相容歷史snapshot／variant列也保留在投影，故外鍵不要求它必須在目前新取得清單。包內地址鍵必須解析至同一pack所列本地bundle；同一精確引用與平台只能有一個有效映射。

封裝前執行資料庫完整性與FK檢查；Player OpenAsync核對manifest和runtime_meta的packId、snapshotId、schema、applicationId、packageKind及target，並驗證依賴引用。schema未知回UnsupportedSchema；同版本結構損毀回AssetCorrupt；包身分／平台不符回IncompatibleContent；缺指定舊模型映射保持IncompatibleContent。不把任何錯誤改為最新variant的成功回應。

`ModelReference` 即第6.2節的snapshot／variant／revision組合；resolver須檢查整組歸屬，不把使用者傳入的revision直接當可自由載入的全庫ID。

### 13.6 輸入、session、取消與錯誤契約（GAP-006）

- QueryText最多256個Unicode scalar；空字串或null QueryText代表不加文字條件，無效UTF-16輸入回InvalidQuery。Cursor最多4096個ASCII字元；null或空字串代表第一頁，非ASCII、超長、格式或綁定內容不符均回InvalidCursor。此處cursor僅需驗證結構與session綁定，不新增網路認證。
- null query DTO、null／已Dispose／非目前catalog持有的session、非法enum、Limit不在1～100或文字超限回InvalidQuery。不默默截短搜尋文字。session由OpenAsync產生，不接受由caller自行拼造pack身分。
- 文字搜尋保留貨號精確優先及名稱部分匹配；中文、引號、百分號與底線都是字面內容。SQL使用參數綁定，LIKE的通配符需顯式escape，不拼接輸入。
- 任一async方法收到已取消token，優先回Cancelled且不配置DB connection／asset handle；取消不等於其他失敗已被治癒。非預先取消時，先做輸入與session驗證再進入IO。載入中的取消依第6.1節釋放已取得但未使用的資源。
- null ModelReference／SaveHeader／requiredModels集合及非法UUID結構回InvalidQuery。requiredModels可為空集合，仍需驗證存檔header；重複引用可去重但不得漏驗。Dispose重複呼叫安全。
- InvalidQuery文案「查詢條件無效，請調整後重試。」；InvalidCursor文案「清單位置已失效，請重新搜尋。」；Cancelled不顯示為破壞資料的錯誤視窗。其他既有錯誤文案沿第6.2／7節與BDD基線，不洩漏堆疊。

### 13.7 實際路徑與驗證快取（GAP-007）

來源匯入、安裝staging與資產載入均在解析最終路徑後檢查其位於各自明確根目錄內；不可只比較原始字串前綴。Windows junction／symbolic link／reparse point 若可能指向根外則拒絕；本版受控安裝內容不需要透過reparse point取得資產，可直接拒絕包內此類節點。

同大小、同名稱或同mtime不足以沿用已驗證結論。驗證索引至少綁定packId、預期SHA-256、正規化實際路徑與檔案身分。程序重啟或檔案被替換後重新驗證；沒有可信檔案身分時不用跨讀取快取。

以「新載入」為完整性檢查邊界：先驗證當次實際讀入的bundle bytes，再交給載入器；已在記憶體且仍持有有效lease的內容可以共用。若採直接從檔案載入，驗證到載入完成期間須維持同一檔案不可被替換／寫入的讀取保護；做不到時走驗證後的受控資料流，不依賴僅mtime檢查。驗證失敗釋放暫存資源並回AssetCorrupt，不把損毀檔案移到正式存檔位置。

這是損毀與意外替換防護，hash不等於發行者簽章；不承諾抵抗同時替換程式、manifest及bundle的惡意管理者。本版不新增DRM／線上驗證。

### 13.8 代表畫面核准、繁中文字型與啟動錯誤（GAP-008）

Preview里程碑須交付實際安裝包、固定光照／相機下的代表模型六視圖、可操作錄影及版本資料。使用者核准「外觀與可讀性」後保存 `visualBaselineId`、pack／source revision／RuntimeBuild、camera／lighting／URP preset摘要、核准日期與意見，再推進同風格批次製作。需要改動已核准的關鍵材質或光照，須提交新對照而非直接覆蓋基準。

核對項目包括形狀／倒角／接縫、顏色與印刷位置、塑膠與橡膠差異、透明可見性、文字與控制可讀性。允許不同GPU的正常像素差異，但不可接受遺失印刷、材質錯誤、鏡像、明顯穿插或過曝掩蓋細節；自動影像差異僅作提醒，不自行宣稱使用者已核准。

將已確認可隨包提供的繁體中文字型與必要fallback／授權說明納入本地資產，涵蓋所有UI文案。檢測缺字方框／遺失glyph即記畫面失敗；Preview、Release與離線首次啟動都不能依賴線上字型。

安裝快捷入口指向隨包 `BrickHighLauncher.exe`，處理生命週期鎖、Player啟動與必要失敗通知；其通知不依賴Unity圖形裝置。Player缺少、圖形初始化失敗或啟動崩潰時，啟動器以Windows系統通知／原生對話顯示具體可行文案及診斷位置；可辨識的不支援裝置用既有BDD文案。無法確知根因時顯示「遊戲未能完成啟動，請檢查安裝檔與顯示驅動。」而不偽裝診斷。正常狀態不額外開出命令列視窗，必要執行相依一樣離線隨包提供。

### 13.9 畫面與效能量測的固定條件（GAP-009）

本機已觀測的i5-13500H／Iris Xe／23.6 GiB環境，只用作操作、外觀及探索量測。正式SPEC第8.2節的GTX1660／i5-10400、16 GiB、SSD、1080p Medium門檻保留；沒有對應設備時記錄「正式基準未驗收」，不以另一台的結果代替，也不要求使用者現在購買設備。

`BenchmarkProfile` 在第一次基準量測前保存：1920×1080輸出、render scale=1、動態解析度關閉、AA模式與等級、陰影解析度／距離、光照與反射設定、材質與透明件清單、相機軌跡、可見數量、UI操作序列、套件版本及其digest。AA／陰影具體值隨代表畫面核准鎖定；未鎖定前只屬探索測試，不能算Medium基準已完成。

保留關VSync／幀率上限、暖機30秒、穩態60秒、平均60FPS及P95≤20ms等原門檻。若改preset、render scale、代表模型組合或硬體，產生新profile並分開記錄，不混入原基準統計。

單件3秒門檻從首次Acquire請求到所需mesh／材質／紋理正確出現在實際Player畫面計時，包含本次完整性驗證；不得以占位首幀截止。報告分成：程序冷啟動、新程序首次模型載入、同程序熱快取重載。標明是否重開機／是否保留OS檔案快取；未清OS快取不得宣稱物理磁碟完全冷讀。載入畫面不混入穩態FPS，但另行報告其時間。

### 13.10 輪組metadata與可判斷的原型矩陣（GAP-010）

`vehicleMetadata` 有輪組幾何時，`radiusMeters`／`widthMeters` 必須有限且大於0；`axleDirection` 為canonical局部正規化方向。未知的必要輪尺寸不得用0假裝已知；該變體不進入依賴此欄位的輪組候選，但不因此默刪其外觀資產。

質量欄位為 `massKg: number|null`、`massEvidence=Measured|Estimated|Unknown`、`massReason` 及可追溯來源。Measured／Estimated需有限正值與量測或估算依據，Unknown則massKg=null並附原因。不把Unknown變成預設性能數字。

原型至少記錄兩種不同輪徑、兩種軸距、合法輪胎／輪圈／車軸配對及一組不相容反例。每次固定並保存WorldScaleProfile、路面尺寸、坡度、路肩高度、測試速度與物理設定；實際接點誤差沿第4.3節，單位換算後同門檻。不相容profile須拒絕裝配；合法組在靜止基準姿態下可核對輪軸與模型／碰撞對齊，動態接觸結果與可見跳動逐項留存。

本份驗收幾何／metadata／配對與可重現結果，不以「有結果檔」掩飾靜態錯位，也不承諾所有路肩平順。最終車輛合法性、動力公式、操控與三賽道由MVP-002規劃。

### 13.11 補強驗收與測試回寫邊界

| ID | 來源 | 可測試條件 |
|---|---|---|
| `AC-027` | GAP-001／Q-001 | Preview在指定盒組全集未完成時仍可安裝操作，顯示包類型、身份 coverage 與缺口；Release拒絕Preview包，兩者資料隔離且不提升全量完成度。 |
| `AC-028` | GAP-002／Q-001 | Frozen可建立staging驗證與Preview但不切正式head；Release發布及封裝必須完整核對來源／選件／工具摘要，改動後拒絕沿用舊報告。 |
| `AC-029` | GAP-003／Q-003 | 固定應用身分保持既有profile路徑；遊戲與更新競爭時只有合法流程持鎖，更新途中重啟不造成原地覆寫或第二資料庫。 |
| `AC-030` | GAP-004／Q-003 | 失敗備份保留最後良好版本；新版存檔降版不開可寫連線；未明確確認不還原，取消／失敗保留目前與備份資料。 |
| `AC-031` | GAP-005／Q-003 | snapshot／variant／revision／target整組錯配與manifest／DB身分不一致均被拒絕，不載入另一零件或靜默選最新版本。 |
| `AC-032` | GAP-006／Q-003 | null／disposed／跨pack session、字串上限、中文／引號／百分號／底線與預先取消均依第13.6節返回精確結果，取消不配置資源。 |
| `AC-033` | GAP-007／Q-003 | 越界reparse point與同大小檔案替換不得繞過檢查；新載入驗證實際內容，損毀拒絕且不動玩家資料。 |
| `AC-034` | GAP-008／Q-002 | 固定代表Player畫面有使用者核准紀錄；缺字／缺材質不通過，無3D裝置可取得原生失敗通知而非僅靠uGUI。 |
| `AC-035` | GAP-009／Q-002 | 不同硬體或preset不冒充基準通過；首幀材質完成、冷暖載入與穩態資料分列，固定profile與畫面證據可重跑。 |
| `AC-036` | GAP-010／Q-003 | 輪組單位／軸向／質量狀態明確；正反配對與不同輪徑／軸距原型可驗證，Unknown不產生虛構重量。 |

舊AC-001～026保留不重編。上述10個新增AC已對應BDD SC-047～056及54個新增TDD案例（30UT＋11IT＋5CT＋8ET）；包含RiskAudit原建議24個測試名稱。共56場景／233測試；規劃交接時全數具追溯且未執行，目前進度見開頭2026-09-27稽核。規劃阻斷已解除並交接well-done，但不能以此宣稱全量來源、可操作畫面或正式效能完成。

## 14. 2026-09-27 全項現況稽核

本次已逐項核對36個AC、56個BDD場景與233個TDD項目；稽核完成不等於缺漏修復完成。功能開發依使用者要求保持停止，待視覺驗收回饋。

完整驗收條款**3/36（8.3%）**，依下方36列狀態實際為**28部分符合、5未符合**（2026-10-22核對修正；不等於額外AC通過）。AC-002／003的通過只證明 LEGO Design／Element 分層、外觀變體與 alias 衝突等身份行為，沒有把 fixture 計入指定盒組真實分母。路徑相對brickhigh；未符合列附最接近的現有邊界以說明缺少的實作。

| AC | 狀態 | BDD | 實作證據 | 斷言證據 | 判定／缺漏 |
|---|---|---|---|---|---|
| AC-001 | ⚠️ 部分符合 | SC-001 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 附件／來源涵蓋規則已驗；完整涵蓋審查及實際來源仍未具備。 |
| AC-002 | ✅ 已符合 | SC-002、SC-003 | `tools/catalog/repository.py`；`tools/catalog/importing.py` | `tools/catalog/tests/unit/test_sc_002.py`；`tools/catalog/tests/integration/test_catalog_resolve.py` | 同 Design 重用幾何 Part、不同顏色建立不同 appearance variant、相同外觀重試去重；Design／Element 身份分層已有 SQLite 證據。 |
| AC-003 | ✅ 已符合 | SC-003、SC-002 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 觀測外觀穩定識別、印刷／材質 variant key、alias 衝突及重複 identity 去重均有真 CLI／SQLite 證據。 |
| AC-004 | ⚠️ 部分符合 | SC-004、SC-005 | `tools/catalog/repository.py:131`；`tools/catalog/quality.py:321`；`tools/catalog/cli.py:88` | `tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_snapshot_repository.py:123`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | Frozen 固定 scope／分母、G 與 Ready 品質報告驗證已有合成正反例；指定盒組全集與全部真實變體逐項 Ready 尚未完成。 |
| AC-005 | ⚠️ 部分符合 | SC-006 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `artifacts/acceptance/pm-20260928-interactive-20-a/machine-audit.json`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 20內部樣本 GLB／材質在 Player 載入與操作成功，缺完整 Ready 品質／占位／印刷／材質反例。 |
| AC-006 | ⚠️ 部分符合 | SC-007、SC-029 | `game/Assets/BrickHigh/Domain/Geometry.cs:15`；`game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | 數值座標與非對稱樣本已驗，完整法向／尺寸來源整組未驗。 |
| AC-007 | ⚠️ 部分符合 | SC-010 | `tools/catalog/building.py:114`；`tools/catalog/render_views.py:15` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12` | 來源／六視圖封存已做；逐外觀對照與正式RuntimeBuild渲染驗證未完成。 |
| AC-008 | ⚠️ 部分符合 | SC-008 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；Gate 2 20件 collision fixtures | IT-004 已以真 glTFast／MeshCollider 閉環 System、Technic pin/hole、axle、clip/bar、ball/socket、DUPLO 等代表配對與空腔／solid probes；但正式逐件 Ready、全量來源與後續輪組／人物用途仍未完成。 |
| AC-009 | ⚠️ 部分符合 | SC-005、SC-027 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190`；`tools/catalog/policies.py:94` | `tools/catalog/tests/integration/test_catalog_cli.py:81`；`tools/catalog/tests/integration/test_catalog_cli.py:196`；`tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | 負例閘門已實作，正式來源／品質及舊head保留全矩陣未完成。 |
| AC-010 | ✅ 符合 | SC-011、SC-022 | `tools/catalog/repository.py`；`tools/catalog/jobs.py`；`tools/catalog/building.py` | `tools/catalog/tests/unit/test_sc_011.py`；`tools/catalog/tests/integration/test_job_recovery.py`；`tools/catalog/tests/integration/test_catalog_build.py` | 新指定盒組可在相同 catalog baseline 建立 successor 並加入新的 LEGO Element／Design，舊 Frozen／Published snapshot 不變；同鍵冪等／不同輸入衝突、source／metadata／toolchain 新 revision、過期租約接手、單件 timeout 與真 Blender worker 終止恢復均有真 SQLite/job flow 證據。 |
| AC-011 | ⚠️ 部分符合 | SC-012、SC-014 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs::ResolveVariantAsync`；`ResolveModelAsync`；`game/Assets/BrickHigh/Infrastructure/RuntimeBuildPolicy.cs::ComputeIdentity`；`ReleaseFileIndex.ValidateRuntimeBuildIdentity`；`tools/catalog/runtime_schema.sql` | UT-034～036 exact historical reference 矩陣；UT-040～042 RuntimeBuild rebuild／legacy remap／old-bundle rejection 矩陣 | 已證明盒組 scope／名稱／分類改變時舊 exact snapshot／variant／revision 可讀 frozen projection，且 Editor／package lock 改變時 source revision 保留、RuntimeBuild 身分重算並把歷史引用映射到 current build；仍缺 IT-007／ET-010 與正式安裝更新／跨版本發行矩陣，因此 AC-011 不升格。 |
| AC-012 | ❌ 未符合 | SC-009 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 分類欄位存在，六基本部位候選／錨點相容驗收尚無。 |
| AC-013 | ⚠️ 部分符合 | SC-031 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | Special過濾與分類規則存在，Release取得用途與零權益副作用全矩陣不足。 |
| AC-014 | ❌ 未符合 | SC-009 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 無可構成地板／牆／屋頂／出入口的同系統實際建材集合。 |
| AC-015 | ⚠️ 部分符合 | SC-015、SC-020、SC-028、SC-031、SC-034、SC-037 | `BrickCatalog.OpenAsync`／`QueryAsync`／`GetVariantAsync`／`GetProfilesAsync`／`GetCoverageAsync`；`CatalogInputPolicy` | SC-015 的 UT-043～045、IT-008、CT-001～005 全部完成；Release 101 筆分頁、用途、selected revision、anchor／vehicle metadata、versioned profiles、coverage 與 typed failure/cancel 均有真 SQLite 證據 | **SC-015 已完整閉環**；但 AC-015 還同時依賴 SC-020／028／031／034／037，其中仍有未完成矩陣，因此 AC-015 不升格。 |
| AC-016 | ⚠️ 部分符合 | SC-033、SC-035、SC-038、SC-039、SC-040、SC-042 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19`；`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8`；`game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6`；`game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | uGUI可操作，尚缺完整錯誤、快速切換、鍵盤與原生圖形故障驗收。 |
| AC-017 | ❌ 未符合 | SC-005 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_catalog_cli.py:81`；`tools/catalog/tests/integration/test_catalog_cli.py:196` | 尚未取得指定盒組全集 inventory／官方身份與 Ready 資產，不能以 fixture 滿足真實全量交付。 |
| AC-018 | ⚠️ 部分符合 | SC-021、SC-022、SC-023 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289`；`tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261`；`tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139`；`tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42`；`tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | 來源重試与工作恢復已驗；發布／安裝全部故障及存檔保留矩陣不足。 |
| AC-019 | ⚠️ 部分符合 | SC-015、SC-019、SC-020、SC-024、SC-028 | `IBrickCatalog`；`BrickCatalog`；`CatalogInputPolicy`；`CatalogResult`；`LocalAddressablesPolicy`；`tools/catalog/content.py` | SC-015 的 UT-043～045、IT-008、CT-001～005 全部完成；公開 catalog surface 僅五個 read operations，pack SHA 前後不變且無 SQLite sidecar，Release typed outcomes 亦已驗 | **SC-015 已完整閉環**；AC-019 仍受 SC-019／020／024／028 的完整安裝錯誤、正式包掃描與其他 contract/E2E 缺口阻擋，因此不升格。 |
| AC-020 | ❌ 未符合 | SC-043、SC-044、SC-045 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無規定硬體／場景的查詢、FPS、記憶體實測。 |
| AC-021 | ⚠️ 部分符合 | SC-033 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 內部包已安裝操作，未在乾淨斷網Windows完整驗收。 |
| AC-022 | ⚠️ 部分符合 | SC-016、SC-017、SC-018 | `NativeSqlite`；`LocalStoragePolicy`；`tools/launcher/Program.cs`；`InstallerCore`；`tools/acceptance/run_interactive_fixture.py` | UT-046～048；fresh installed-Player job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80` exit 0；既有 install/update tests | SC-016 已完整閉環：真 Player 在 RX 安裝 ACL 下執行且 install tree／profile 保持完整，不可寫 LocalLow 明確失敗；A→B upgrade 與預設 uninstall 亦有 E2E 證據。但 AC-022 仍受 SC-017 的其餘更新契約與 SC-018 一致備份／migration 阻擋，因此不升格。 |
| AC-023 | ⚠️ 部分符合 | SC-017、SC-023、SC-025 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175`；`tools/catalog/repository.py:190`；`game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100`；`tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 部分更新回滾與相容政策已測，空間不足／缺舊映射完整安裝驗收不足。 |
| AC-024 | ⚠️ 部分符合 | SC-007、SC-046 | `game/Assets/BrickHigh/Domain/Geometry.cs:15`；`tools/catalog/metadata_quality.py:90` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 座標與mass規則已有，無輪組／碰撞同尺度及坡道接觸原型。 |
| AC-025 | ⚠️ 部分符合 | SC-006、SC-014、SC-016、SC-019、SC-024、SC-026、SC-033、SC-036、SC-038、SC-044 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11`；`tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11`；`tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42`；`tools/catalog/tests/unit/test_material_conversion.py:9`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:123` | 本地SQLite／Addressables及代表材質有Player證據；清快取／乾淨斷網和全材質矩陣不足。 |
| AC-026 | ⚠️ 部分符合 | SC-032、SC-039、SC-041 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53`；`game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | lease與過期結果已有證據，全部失敗Acquire／真退出重入矩陣不足。 |
| AC-027 | ⚠️ 部分符合 | SC-047 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | 內部可操作樣本仍非合格Ready的Preview子集合。 |
| AC-028 | ⚠️ 部分符合 | SC-048 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | Frozen與CAS helper已做，真Unity staging驗證→發布→精確封裝尚缺。 |
| AC-029 | ⚠️ 部分符合 | SC-049 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | 身份與跨程序互斥已有證據；兩代正式包及真ACL故障矩陣不足。 |
| AC-030 | ⚠️ 部分符合 | SC-050 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9`；`game/Assets/BrickHigh/Application/SaveOpenCoordinator.cs:38`；`tools/acceptance/save_fixture_recovery.py:69` | `game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs:166`；`tools/acceptance/tests/integration/test_save_fixture_recovery.py` | F-Save 降版零可寫連線、一致備份及明確確認還原 harness 已驗；正式玩家存檔流程、UI 與 schema 尚未整合。 |
| AC-031 | ⚠️ 部分符合 | SC-051 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 完整引用resolver有測；FK／target／manifest每欄反例尚缺。 |
| AC-032 | ⚠️ 部分符合 | SC-052 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 文字／session／預取消局部已驗，全部公開方法精確結果／資源矩陣不足。 |
| AC-033 | ⚠️ 部分符合 | SC-053 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | 安全路徑與verified bytes已有，真loader替換barrier／新程序全矩陣不足。 |
| AC-034 | ⚠️ 部分符合 | SC-054 | `game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:480`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:257`；`artifacts/acceptance/pm-20260928-interactive-20-a/manual-visual-review.html` | 真 Player、隨包字型及缺字警示已驗；20件外觀交由使用者人工判定，正式逐件 `visualBaselineId` 與缺陷矩陣仍缺。 |
| AC-035 | ❌ 未符合 | SC-055 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 沒有正式基準、凍結profile及完整分段首幀／穩態測量。 |
| AC-036 | ⚠️ 部分符合 | SC-056 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 來源輪徑／軸向／mass單元規則已驗，runtime貫通及正反靜動態原型尚缺。 |

### 功能章節及風險覆盖

以下逐段核對主要功能／合約章節；條款判定以本節36列AC與TDD233列為準。文件中的架構選型、接口名稱及規劃順序不自行算產品完成。

| 章節 | 對應核對 | 目前結論與實作／測試定位 |
|---|---|---|
| §1／2 範圍與架構 | SC-015及相關AC | 模型庫與開發工具分離，其他MVP模組未開發；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` |
| §3.1／3.2 指定盒組與來源 | SC-001及相關AC | 受控盒組／來源涵蓋行為已有，指定盒組全集仍未取得；`tools/catalog/importing.py`；`tools/catalog/tests/unit/test_sc_001.py` |
| §3.3 LEGO 身份／去重 | SC-002及相關AC | Design／Element 分層與同 Design 外觀 variant 去重已有 SQLite 證據；正式資料必須由指定盒組 Element ID 精確消歧，舊 fixed20 中無 Element ID 的探索樣本不得算身份完成；`tools/catalog/repository.py`；`tools/catalog/tests/unit/test_sc_002.py` |
| §3.4 C/G/V 分母及發布 | SC-005及相關AC | 負例有效，指定盒組全集與正式品質正例未完成；`tools/catalog/cli.py:88`；`tools/catalog/tests/integration/test_catalog_cli.py:81` |
| §4.1 身分 | SC-003及相關AC | 觀測外觀與alias隔離已驗；`tools/catalog/policies.py:68`；`tools/catalog/tests/unit/test_sc_003.py:8` |
| §4.2 管線 | SC-013及相關AC | 轉換／封存已有，補模與Ready未完成；`tools/catalog/building.py:167`；`tools/catalog/tests/integration/test_catalog_build.py:212` |
| §4.3 座標／接合／碰撞 | SC-008及相關AC | 數值檢查已有，配對／物理原型未完成；`tools/catalog/metadata_quality.py:58`；`tools/catalog/tests/unit/test_metadata_quality.py:37` |
| §4.4 款式／用途 | SC-031及相關AC | 分類欄位與過濾已有，候選相容實證未完成；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192` |
| §5.1 DDD責任 | SC-015及相關AC | Domain／Application／Infrastructure存在，業務能力仍依逐AC判定；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` |
| §5.2 製作schema | SC-004及相關AC | 不可變與CAS已有，完整品質報告連結不足；`tools/catalog/repository.py:129`；`tools/catalog/tests/integration/test_snapshot_repository.py:123` |
| §5.3 唯讀投影 | SC-051及相關AC | schema／resolver存在，逐欄／跨版本矩陣不齊；`tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` |
| §5.4 內容庫 | SC-024及相關AC | 路徑／hash／不可變存放已有，正式發布整合不足；`tools/catalog/content.py:14`；`tools/catalog/tests/unit/test_sc_024.py:9` |
| §6.1／6.2 程式內API／DTO | SC-052及相關AC | 公開方法存在，14項CT均未全驗；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19` |
| §6.3 CLI與Unity建置 | SC-048及相關AC | import／resolve／build存在；正式Unity驗證／封裝入口未完成；`tools/catalog/repository.py:160`；`tools/catalog/tests/integration/test_snapshot_repository.py:56` |
| §6.4 安裝與離線 | SC-017及相關AC | 內部完整包可安裝，乾淨離線驗收未完成；`tools/installer/InstallerCore.cs:53`；`tools/acceptance/tests/integration/test_install_update.py:72` |
| §6.5 更新與存檔 | SC-050及相關AC | 安裝切換與checker已有；一致備份／還原缺漏；`game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` |
| §7 UI／輸入／批次 | SC-035及相關AC | uGUI可操作；鍵盤完整矩陣、批次LOD及資源效能不足；`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41` |
| §8.1 品質 | SC-006及相關AC | 格式／hash部分已驗，逐件Ready品質闭環未完成；`tools/catalog/glb.py:28`；`tools/catalog/tests/unit/test_glb_validation.py:35` |
| §8.2 效能／預算 | SC-044及相關AC | 檔案預算單測已有；正式場景量測未做；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` |
| §8.3 故障 | SC-021及相關AC | 來源重試已有；全部製作／發布／安裝故障未全驗；`tools/catalog/jobs.py:50`；`tools/catalog/tests/unit/test_sc_021.py:22` |
| §9 驗收 | SC-005及相關AC | 36AC／233TDD已逐項過表，尚未全部符合；`tools/catalog/cli.py:88`；`tools/catalog/tests/integration/test_catalog_cli.py:81` |
| §11／12 依賴與參考 | SC-014及相關AC | 歷史規劃／參考不是RuntimeBuild相容驗收；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` |
| §13.1／GAP-001 | AC-027／SC-047 | 內部包不是Ready且使用條件驗證通過的正式Preview子集。；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192` |
| §13.2／GAP-002 | AC-028／SC-048 | 已補正式Frozen BuildValidationContent入口、RuntimeBuild staging SQLite／不可變證據與真Windows驗證Player管線；26項協定測試及testOnly Player六視圖通過，現有20份明確核准已透過原品質API正式提交、Ready及Frozen選件20/20；仍因fixture／未建立逐件正式來源身份而正確阻擋，正式Ready來源→發布→完全匹配封裝仍未完成。；`tools/catalog/validation_content.py`；`game/Assets/BrickHigh/Editor/ValidationContentBuild.cs`；`tools/catalog/tests/integration/test_validation_content.py` |
| §13.3／GAP-003 | AC-029／SC-049 | 身份／互斥政策與真程序競爭已驗，缺真ACL與兩代Release/Preview完整矩陣。；`game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17` |
| §13.4／GAP-004 | AC-030／SC-050 | schema政策已驗；一致備份及明確還原harness未做。；`game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` |
| §13.5／GAP-005 | AC-031／SC-051 | resolver有局部證據；所有FK／target／manifest逐欄矩陣不齊。；`tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` |
| §13.6／GAP-006 | AC-032／SC-052 | 輸入／字面搜尋已有測試，全部方法與取消UI矩陣不齊。；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19` |
| §13.7／GAP-007 | AC-033／SC-053 | Python安全探針及verified bytes已做，真Player替換／barrier／新程序矩陣不足。；`game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`tools/acceptance/tests/integration/test_it_026.py:10` |
| §13.8／GAP-008 | AC-034／SC-054 | 繁中字型／154畫面與launcher存在；外觀未核准、缺陷反例不齊。；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306` |
| §13.9／GAP-009 | AC-035／SC-055 | 沒有凍結profile與正式基準資料，不能以Iris Xe代替。；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` |
| §13.10／GAP-010 | AC-036／SC-056 | 來源輪組／mass規則已有單測，跨runtime及靜動態配對原型未做。；`tools/catalog/metadata_quality.py:90`；`tools/catalog/tests/unit/test_metadata_quality.py:61` |

### RISK-001～011逐項現況

| 風險 | 狀態／恢復條件 | 證據位置 |
|---|---|---|
| RISK-001 | 10334 的 identity 已閉環為 276/276 rows、0 gap；風險仍適用於未來新增盒組的 inventory／Element 缺口，以及沒有 authoritative Design 時誤用第三方 candidate 造成錯誤 geometry dedup | `tools/catalog/set_inventory_identity.py`；`tools/catalog/lego_pick_a_brick.py`；`tools/catalog/tests/unit/test_set_inventory_identity.py`；10334 authoritative identity audit |
| RISK-002 | 未消除；缺件／特殊格式仍須補建並驗Ready | `tools/catalog/building.py:167`；`tools/catalog/tests/integration/test_catalog_build.py:212` |
| RISK-003 | 未消除；接點／人物錨點與碰撞配對未驗 | `tools/catalog/metadata_quality.py:58`；`tools/catalog/tests/unit/test_metadata_quality.py:37` |
| RISK-004 | 識別／衝突部分降低風險；印刷外觀逐件驗收仍缺 | `tools/catalog/policies.py:68`；`tools/catalog/tests/unit/test_sc_003.py:8` |
| RISK-005 | 作者／授權已封存；逐資產使用條件審閱未完成 | `tools/catalog/building.py:114`；`tools/catalog/tests/integration/test_catalog_build.py:212` |
| RISK-006 | 未量測全量／歷史內容／runtime記憶體與安裝峰值 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` |
| RISK-007 | 規劃確認已完成；本次逐項稽核不等同實作風險已關閉 | `tools/catalog/repository.py:160`；`tools/catalog/tests/integration/test_snapshot_repository.py:56` |
| RISK-008 | 本機原生樣本工具鏈已通；全部代表材質／乾淨機未驗 | `tools/catalog/glb.py:28`；`tools/catalog/tests/unit/test_glb_validation.py:35` |
| RISK-009 | 數值與非對稱局部已驗，輪組／碰撞同尺度仍缺 | `game/Assets/BrickHigh/Domain/Geometry.cs:15`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9` |
| RISK-010 | 精確引用／更新回滾局部有證據，跨引擎舊資產重建未驗 | `game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` |
| RISK-011 | 正式1080p／2026件負載與指定基準機尚未量測 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` |
