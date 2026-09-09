# SPEC-001-BrickModelCatalog TDD 測試清單

> **來源**：[BDD 場景文件](../bdd/SPEC-001-BrickModelCatalog-BDD.md)
> **規格**：[SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md)
> **需求**：[MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
> **生成日期**：2026-09-09
> **狀態**：⏸️ 未開始；233 項測試（179 基線＋54 補強），尚未產生測試程式或執行。

## 🎯 開發進度總覽

### 整體進度

```text
SPEC-001-BrickModelCatalog TDD 開發
Red-Green-Refactor：未開始
開始時間／預計完成／負責人：尚未指定
進度條：[░░░░░░░░░░░░░░░░░░░░] 0% (0/233)
```

### 分層進度追蹤

| 測試層級 | 進度 | 已完成 | 進行中 | 待開始 | 狀態 |
|---|---|---|---|---|---|
| 1️⃣ 單元測試 | 0% | 0/168 | 0 | 168 | ⏸️ 未開始 |
| 2️⃣ 集成測試 | 0% | 0/29 | 0 | 29 | ⏸️ 未開始 |
| 3️⃣ 程式內 API 契約 | 0% | 0/14 | 0 | 14 | ⏸️ 未開始 |
| 4️⃣ E2E／安裝／畫面／效能 | 0% | 0/22 | 0 | 22 | ⏸️ 未開始 |
| 合計 | 0% | 0/233 | 0 | 233 | ⏸️ 未開始 |

一個 checklist ID 是一個測試案例；參數化資料列與 assertions 不重複灌入進度。BDD 56 場景各有3項單元測試，且另有真實集成／Player／E2E 覆蓋。沒有把「已生成文件」算成「測試通過」。

### 當前 Sprint 狀態

| 項目 | 內容 |
|---|---|
| 當前階段 | perfect-plan Phase 5：Ready for well-done，尚未開始開發 |
| 當前執行測試 | 無 |
| Red-Green-Refactor | 未開始 |
| 最後更新 | 2026-09-09 |
| 備註 | 179基線保留；追加30單元＋24集成／契約／E2E，共233項 |

### 里程碑

- [ ] M1：完成已核准的原生封裝相容原型與對應失敗測試。
- [ ] M2：完成領域／製作管線／真實 SQLite 測試。
- [ ] M3：完成程式內契約、座標與 Unity UX 測試。
- [ ] M4：完成真實安裝／離線／升級及畫面證據。
- [ ] M5：完成指定硬體效能、逐資產品質與全量發布門檻。
- [ ] M6：完成實作稽核與交付；不得因測試綠燈但實際模型缺件就勾選。

### 關鍵指標

| 指標 | 目標 | 目前 |
|---|---|---|
| 全部案例結果 | 233/233 有符合預期且可追溯的驗證證據 | 0/233，未執行 |
| BDD → TDD 文件追溯 | 56/56 | 已生成映射，非測試通過 |
| 模型正式交付 | SPEC §3.4 全量門檻與每件品質通過 | 未取得完整分母，未驗收 |
| 原生畫面 | 可安裝、離線、可操作且材質正確 | 尚無 Player |
| 效能 | SPEC §8.2 固定硬體／場景的目標 | 未量測 |
| 程式碼覆蓋率 | 開發後報告；不能替代模型／Player 驗收 | 無程式碼，無數值 |

### 每日進度記錄

2026-09-09：SDD 經使用者確認；生成46場景與179測試。未開始實作、未取得正式畫面截圖、未跑任何 Unity 測試。

## 測試資料、位置與層級約定

所有位置相對 `brickhigh/`，都是預計新增位置，現在不存在。Unity 測試使用與鎖定 Editor 相容的 Unity Test Framework；Domain 不引用 UnityEngine。製作工具的 Python 測試採受控來源與真實 SQLite。單元層只能隔離規則、狀態機與判定器，不能由假 render report 推論真實畫面已正確。

- 單元：開發端 `tools/catalog/tests/unit/`；遊戲 `game/Assets/BrickHigh/Tests/EditMode/Unit/`。
- 集成：Python 管線、Unity EditMode／PlayMode／Player，依下表列出實際執行層。
- API：保留模板 API 章節，但依已確認的單機需求改為 C# 程式內契約。HTTP／Controller／WebApplicationFactory／SpecFlow 不適用，不建立假端點。
- E2E：`tools/acceptance/tests/` 驅動實際安裝版與人工驗收步驟；硬體故障或視覺核對可用可重跑的人工程序，必須保存證據，不能因此略過。
- F-Catalog／F-Geometry／F-Save／F-Performance 與正式 Release-Catalog 的用途依 BDD Background。生產測試不得使用私人正式存檔做故障注入。
- 文案以 BDD 實際字串斷言；外部服務錯誤只在工具端，Player 不可回退到網路下載。
- 所有公開契約均在 CT 層列出；新增方法必須追到場景與測試。尚未定義的額外公開方法不是可宣稱已覆蓋的實作。

### 基線回歸與新增案例的執行約束

原179項測試定義、名稱與編碼保留。BDD「基線與補強的合併適用規則」同樣約束原測試的setup與斷言；SPEC第13節是已確認契約，不可沿舊前置要求Frozen驗證先Published、允許降版覆寫或將Preview算正式全量。新增54項是30個獨立規則測試加已同意的24個真實集成／契約／E2E案例；參數化正反資料不另灌水計數。SC-050／ET-017只驗收恢復harness及政策，正式玩家還原UI留後續SPEC。

## 1️⃣ 單元測試（Unit Tests）

每組3項分別驗證 BDD 的 Then／And。真實像素、安裝與物理效果必須另通過 IT／ET；此處測試其輸入驗證、狀態或報告判定規則，不能把 mock 畫面當成果。

### 1.1 SC-001 保存跨來源基準及涵蓋證據

**位置**：`tools/catalog/tests/unit/test_sc_001.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-001、AC-004，BDD SC-001。
**共同前置**：具完整分頁／hash 的跨系列來源與基準日 2026-09-08，另有一個缺頁來源。
**共同動作**：維護者匯入並核對候選集合；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-001** `CatalogCoveragePolicy_CompleteArtifact_KeepsEvidence` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：完整來源保留 artifact、hash、observedAt 與有效日期。
- [ ] **UT-002** `CatalogCoveragePolicy_ExpandedFamilies_KeepsCoverage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：System、Technic、DUPLO、人物組件及其他系列均列入涵蓋表，套裝展開與附件排除有理由。
- [ ] **UT-003** `CatalogCoveragePolicy_MissingPage_ReportsGap` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺頁來源產生未解決 G，不宣稱來源完整。

### 1.2 SC-002 逐變體判定生產三態

**位置**：`tools/catalog/tests/unit/test_sc_002.py`
**目標／來源**：隔離 `ProductionStatusPolicy` 規則；AC-002，BDD SC-002。
**共同前置**：候選分別有有效生產、停產、缺貨、舊現貨、日期不明及衝突證據。
**共同動作**：維護者計算基準日生產狀態；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-004** `ProductionStatusPolicy_DatedEvidence_ClassifiesStatus` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：有效生產且無衝突判為 Active，有效停產判為 Retired。
- [ ] **UT-005** `ProductionStatusPolicy_AmbiguousEvidence_RemainsUnknown` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺貨、舊現貨、日期不明與衝突均保持 Unknown。
- [ ] **UT-006** `ProductionStatusPolicy_RetiredColor_PreservesOtherVariant` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：某顏色停產不改變另一有效 Active 變體。

### 1.3 SC-003 保留實際外觀變體及穩定識別

**位置**：`tools/catalog/tests/unit/test_sc_003.py`
**目標／來源**：隔離 `VariantIdentityPolicy` 規則；AC-003，BDD SC-003。
**共同前置**：同幾何有兩顏色與兩印刷來源，另有同來源 ID 的矛盾映射。
**共同動作**：維護者建立零件、變體與來源別名；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-007** `VariantIdentityPolicy_RealAppearance_CreatesVariant` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只建立有證據的實際組合，不做所有顏色笛卡兒積。
- [ ] **UT-008** `VariantIdentityPolicy_PrintedKey_PreservesIdentity` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：印刷／材質納入 VariantKey，內部 ID 永不重新分配。
- [ ] **UT-009** `VariantIdentityPolicy_ConflictingAlias_IsolatesMapping` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：矛盾外部 ID 隔離為衝突，不能直接合併。

### 1.4 SC-004 凍結分母與狀態生命週期

**位置**：`tools/catalog/tests/unit/test_sc_004.py`
**目標／來源**：隔離 `SnapshotLifecycle` 規則；AC-004、AC-009、AC-010，BDD SC-004。
**共同前置**：Draft 有已記錄的候選、證據、分類與規則。
**共同動作**：維護者 freeze 後建模，再嘗試修正判定；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-010** `SnapshotLifecycle_FrozenScope_RejectsMutation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Frozen 不允許改分母／證據／分類，修正須新 Draft。
- [ ] **UT-011** `SnapshotLifecycle_RevisionFlow_RequiresValidation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：建模依 Pending、Building、Validating、Ready 流轉，失敗成 Failed。
- [ ] **UT-012** `SnapshotLifecycle_PublishedContent_IsImmutable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Frozen 可更新所選 revision 並遞增 version，Published 不可改。

### 1.5 SC-005 全量發布與逐項完成證據

**位置**：`tools/catalog/tests/unit/test_sc_005.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-009、AC-017，BDD SC-005。
**共同前置**：實際來源範圍已審查且 A>0、U=0、G=0、V=A，沒有分類／品質／映射缺口。
**共同動作**：維護者要求正式發布；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-013** `CatalogCoveragePolicy_CompleteCounts_PassesGate` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：C=A+R+U 且 Ready 變體逐一與已確認分母對應。
- [ ] **UT-014** `CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：報告列出所有實際變體的來源與品質證據，不混入 fixtures。
- [ ] **UT-015** `CatalogCoveragePolicy_SingleFailedGate_PreservesHead` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：僅全部門檻通過可切換 Published，單一門檻失敗維持舊 head。

### 1.6 SC-006 驗證真實 GLB 與 Unity 產物

**位置**：`tools/catalog/tests/unit/test_sc_006.py`
**目標／來源**：隔離 `ModelValidationService` 規則；AC-005、AC-007、AC-025，BDD SC-006。
**共同前置**：代表普通磚、薄板、透明件、印刷人物、Technic 及 DUPLO 的來源已具備。
**共同動作**：轉換並檢驗各模型及 RuntimeBuild；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-016** `ModelValidationService_SelfContainedGltf_AcceptsReport` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：GLB 自含 mesh／buffer／紋理且 Validator 無 error，warning 有處理記錄。
- [ ] **UT-017** `ModelValidationService_PlaceholderOrMissingMaterial_RejectsReport` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：空 mesh、占位方塊、缺紋理、遺失印刷或粉紅 shader 均驗證失敗。
- [ ] **UT-018** `ModelValidationService_PlayerValidation_RequiresEveryBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Player 實際載入全部交付 RuntimeBuild 的結果逐一留存。

### 1.7 SC-007 保持來源尺寸與非對稱方向

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs`
**目標／來源**：隔離 `CoordinatePolicy` 規則；AC-006、AC-024，BDD SC-007。
**共同前置**：非對稱模型含 LDraw 點 (20,-24,10)、方向、切線、接點及尺寸。
**共同動作**：轉成 canonical 再匯入 Unity；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-019** `CoordinatePolicy_LDrawPoint_ConvertsMeters` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：canonical 點為 (0.008,0.0096,-0.004) 公尺，GLB root scale 為 1。
- [ ] **UT-020** `CoordinatePolicy_CanonicalBasis_ConvertsRotation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Unity 目標點為 (0.008,0.0096,0.004)，旋轉以 M R M^-1 轉換。
- [ ] **UT-021** `CoordinatePolicy_AlreadyConvertedMesh_AvoidsSecondMirror` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：網格／法向／切線手性／面繞序／metadata 一致，匯入器既有轉換不重複鏡像。

### 1.8 SC-008 接點配對與碰撞空腔

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`
**目標／來源**：隔離 `ConnectorCompatibility` 規則；AC-008、AC-014，BDD SC-008。
**共同前置**：有 stud/tube、pin/hole、axle、clip/bar、ball/socket 及不同系列反例。
**共同動作**：驗證配對與插入後的碰撞；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-022** `ConnectorCompatibility_MatchingProfiles_AllowsPair` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：合法 profile 對及自由度可核對，不由同名 family 推定相容。
- [ ] **UT-023** `ConnectorCompatibility_InsertionCavity_RemainsOpen` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：插接空腔不被整體包圍盒封死，插入 fixture 可成立。
- [ ] **UT-024** `ConnectorCompatibility_RequiredConnector_RejectsMissing` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：需要接合的零件缺接點時不 Ready；無接點裝飾件可附理由。

### 1.9 SC-009 人物與建屋候選資料可供後續使用

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/UsageClassificationTests.cs`
**目標／來源**：隔離 `UsageClassification` 規則；AC-012、AC-014，BDD SC-009。
**共同前置**：已分類零件涵蓋基本人物六部位與同一建造系統。
**共同動作**：產生人物及建材候選投影；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-025** `UsageClassification_BasicSlots_RequiresSixCandidates` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：頭、身體、手、腳、頭飾、手上裝備各至少一個相容 Basic 候選。
- [ ] **UT-026** `UsageClassification_BuildingRoles_RequiresCompatibleSet` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：floor、wall、roof、opening 候選均可在同系統接合。
- [ ] **UT-027** `UsageClassification_MissingClassification_BlocksReadiness` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺部位、用途或分類時報告缺口，不發放積木或宣稱房屋完成。

### 1.10 SC-010 每個外觀版本保留品質與來源記錄

**位置**：`tools/catalog/tests/unit/test_sc_010.py`
**目標／來源**：隔離 `RevisionManifestPolicy` 規則；AC-007，BDD SC-010。
**共同前置**：同幾何有不同顏色及印刷 revision。
**共同動作**：維護者彙整輸出 manifest；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-028** `RevisionManifestPolicy_VariantViews_RequiresSixDirections` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每變體有六視圖與對照來源，不能只用同幾何一張圖代替。
- [ ] **UT-029** `RevisionManifestPolicy_Attribution_RequiresProvenance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：原始／輸出 hash、作者／授權、製作工具與來源版本完整。
- [ ] **UT-030** `RevisionManifestPolicy_RuntimeManifest_KeepsBuildIdentity` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：RuntimeBuild 另留 Editor、套件鎖定、coordinateProfile 與驗證 digest。

### 1.11 SC-011 新增貨號及冪等重建

**位置**：`tools/catalog/tests/unit/test_sc_011.py`
**目標／來源**：隔離 `RevisionBuildPolicy` 規則；AC-010，BDD SC-011。
**共同前置**：已有 Published，另有基準日後推出的新貨號及同工作鍵重試。
**共同動作**：建立較新基準的後繼快照並重跑工作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-031** `RevisionBuildPolicy_NewPart_RequiresLaterBaseline` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：新貨號進入較新基準快照，舊快照不變。
- [ ] **UT-032** `RevisionBuildPolicy_SameJobKey_EnforcesIdempotency` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：同鍵同輸入重用成功結果，同鍵不同輸入回衝突 exit 5。
- [ ] **UT-033** `RevisionBuildPolicy_ChangedSource_CreatesRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：修改模型／metadata／製作工具產生新 source revision，不重用舊內容。

### 1.12 SC-012 更新後仍能讀取舊模型引用

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelReferenceResolverTests.cs`
**目標／來源**：隔離 `ModelReferenceResolver` 規則；AC-011、AC-023，BDD SC-012。
**共同前置**：存檔 fixture 引用舊 snapshot／variant／revision，新目錄已停產該變體。
**共同動作**：以精確引用解析資產並查詢新取得清單；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-034** `ModelReferenceResolver_ExactReference_PreservesRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊引用取得對應的相容 RuntimeBuild，不自動改成最新 revision。
- [ ] **UT-035** `ModelReferenceResolver_HistoricalProjection_RemainsFrozen` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊名稱／分類從凍結投影取得，不 join 最新可變資料。
- [ ] **UT-036** `ModelReferenceResolver_RetiredVariant_ExcludesNewAcquisition` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：停產變體不進入新取得清單，舊引用仍可載入。

### 1.13 SC-013 來源缺件時補建而不以占位品交付

**位置**：`tools/catalog/tests/unit/test_sc_013.py`
**目標／來源**：隔離 `ModelBuildPolicy` 規則；AC-005、AC-007、AC-018，BDD SC-013。
**共同前置**：LDraw 缺子模型、TEXMAP 或曲面支援。
**共同動作**：維護者嘗試自建／補建並重新驗證；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-037** `ModelBuildPolicy_UnsupportedSource_RecordsFailure` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未支援來源先列 Failed 與原因，不當作完成。
- [ ] **UT-038** `ModelBuildPolicy_CustomModel_KeepsEvidence` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：補建保留尺寸／外觀來源及新 revision。
- [ ] **UT-039** `ModelBuildPolicy_RepairedModel_RequiresFullValidation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只有補件後同一品質門檻全部通過才可 Ready。

### 1.14 SC-014 引擎升版重建執行期資產

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RuntimeBuildPolicyTests.cs`
**目標／來源**：隔離 `RuntimeBuildPolicy` 規則；AC-011、AC-025，BDD SC-014。
**共同前置**：source revision 未變但 Editor／URP／套件鎖定或平台改變。
**共同動作**：重新製作 RuntimeBuild 映射；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-040** `RuntimeBuildPolicy_EngineChange_PreservesSourceRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：source revision 保留，RuntimeBuild 身分隨建置輸入改變。
- [ ] **UT-041** `RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每個受支援舊引用映射到當前可載入產物。
- [ ] **UT-042** `RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不以保留舊 bundle 檔案當作相容驗證成功。

### 1.15 SC-015 單一 session 的共用查詢契約

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/BrickCatalogTests.cs`
**目標／來源**：隔離 `BrickCatalog` 規則；AC-015、AC-019，BDD SC-015。
**共同前置**：完整已發布的本地 pack 含名稱、用途、接點與覆蓋資料。
**共同動作**：呼叫 OpenAsync、QueryAsync、GetVariantAsync、GetProfilesAsync、GetCoverageAsync；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-043** `BrickCatalog_SessionQueries_KeepSnapshot` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：全部回應固定 pack／snapshot／schema 並用 Success 或 Failure 擇一。
- [ ] **UT-044** `BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：詳情包含所選來源 revision、用途／錨點／車輛 metadata，規則與覆蓋值均來自同快照。
- [ ] **UT-045** `BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只經本地資料與程式內方法取得，不啟動 HTTP 或變動擁有權。

### 1.16 SC-016 唯讀安裝與本機資料分離

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalStoragePolicyTests.cs`
**目標／來源**：隔離 `LocalStoragePolicy` 規則；AC-022、AC-025，BDD SC-016。
**共同前置**：一般使用者安裝於唯讀目錄且有獨立 Profiles 與 Diagnostics。
**共同動作**：啟動、查詢並寫入診斷紀錄；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-046** `LocalStoragePolicy_ReadOnlyCatalog_AvoidsSidecars` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：catalog.db 以唯讀開啟且不產生安裝目錄 WAL／SHM。
- [ ] **UT-047** `LocalStoragePolicy_WritableData_UsesUserRoot` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：可變資料只寫使用者可寫位置，不寫來源工具工作區。
- [ ] **UT-048** `LocalStoragePolicy_DiagnosticRecord_RedactsSecrets` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：診斷不含金鑰／完整存檔且不自動上傳。

### 1.17 SC-017 離線升級成功及解除安裝保留資料

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallUpdatePolicyTests.cs`
**目標／來源**：隔離 `InstallUpdatePolicy` 規則；AC-022、AC-023，BDD SC-017。
**共同前置**：遊戲已退出，舊 profile fixture 與版本 A 安裝完整。
**共同動作**：以完整包安裝 B，重新啟動後預設解除安裝；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-049** `InstallUpdatePolicy_ValidatedStaging_SwitchesVersion` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：B 完整 staged 且 hash 通過才切換啟動版本。
- [ ] **UT-050** `InstallUpdatePolicy_Uninstall_PreservesProfile` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：安裝器與解除安裝不修改或刪除原 profile fixture。
- [ ] **UT-051** `InstallUpdatePolicy_Restart_OpensNewSessionOffline` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：重開依新 session 映射舊模型，無額外登入或下載。

### 1.18 SC-018 一致備份與失敗交易恢復

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveTransactionPolicyTests.cs`
**目標／來源**：隔離 `SaveTransactionPolicy` 規則；AC-022、AC-023，BDD SC-018。
**共同前置**：人工存檔 fixture 的 DB 與不可變組裝檔已有一致引用。
**共同動作**：執行一致備份及帶故障注入的 migration／引用更新；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-052** `SaveTransactionPolicy_CompletedBackup_PrecedesMigration` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：backup 完成後才開始 migration，備份可獨立讀回。
- [ ] **UT-053** `SaveTransactionPolicy_FailedMigration_RollsBack` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：交易失敗時 rollback，保留原 schema／資料與最後完整備份。
- [ ] **UT-054** `SaveTransactionPolicy_FileBeforeReference_AvoidsPartialState` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：組裝新檔先完整寫入再切 DB 引用，不引用不存在或半寫檔。

### 1.19 SC-019 缺漏或損毀安裝包不假裝成功

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogStartupTests.cs`
**目標／來源**：隔離 `CatalogStartup` 規則；AC-018、AC-019、AC-021、AC-025，BDD SC-019。
**共同前置**：必要 manifest／DB／bundle 分別缺失或 hash 不符。
**共同動作**：啟動或載入對應模型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-055** `CatalogStartup_MissingFiles_ReturnTypedErrors` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺目錄回 CatalogNotInstalled，缺模型回 AssetMissing，hash 錯誤回 AssetCorrupt。
- [ ] **UT-056** `CatalogStartup_MissingModel_UsesRepairMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：模型缺失文案為「此模型檔案不完整，請使用完整安裝包修復。」並提供診斷 ID。
- [ ] **UT-057** `CatalogStartup_FailedLoad_PreservesUserData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不下載替代資產、不顯示占位成功、不刪除既有存檔。

### 1.20 SC-020 非法查詢與不存在變體有明確結果

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VariantQueryValidatorTests.cs`
**目標／來源**：隔離 `VariantQueryValidator` 規則；AC-015、AC-019，BDD SC-020。
**共同前置**：含非法 enum、無效 UUID、未知有效 UUID 或跨條件 cursor 的查詢。
**共同動作**：呼叫共用查詢契約；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-058** `VariantQueryValidator_InvalidFilter_ReturnsInvalidQuery` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：非法查詢回 InvalidQuery，找不到的有效 ID 回 VariantNotFound。
- [ ] **UT-059** `VariantQueryValidator_ForeignCursor_ReturnsInvalidCursor` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：跨條件或快照 cursor 回 InvalidCursor，不重設到第一頁。
- [ ] **UT-060** `VariantQueryValidator_FailureEnvelope_ExcludesSuccess` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：錯誤與正常值不並存，錯誤中不出現 SQL 或堆疊。

### 1.21 SC-021 來源中斷與限流保留進度

**位置**：`tools/catalog/tests/unit/test_sc_021.py`
**目標／來源**：隔離 `SourceRetryPolicy` 規則；AC-001、AC-018，BDD SC-021。
**共同前置**：來源遇到 timeout、429 含 Retry-After 或服務中斷。
**共同動作**：製作工具依保存工作重試；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-061** `SourceRetryPolicy_RateLimitedSource_RespectsRetryLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：遵守 Retry-After 並最多自動重試 3 次，超限保留待恢復。
- [ ] **UT-062** `SourceRetryPolicy_InterruptedImport_PreservesCandidates` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗不清空成功候選或把缺資料判成停產。
- [ ] **UT-063** `SourceRetryPolicy_CredentialFailure_RedactsOutput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：來源憑證不寫 URL／日誌，工具失敗 exit 4。

### 1.22 SC-022 建模工作當機與重複工作鍵

**位置**：`tools/catalog/tests/unit/test_sc_022.py`
**目標／來源**：隔離 `CatalogJobPolicy` 規則；AC-010、AC-018，BDD SC-022。
**共同前置**：單項超過 10 分鐘、worker 當機或重跑已有成功輸入。
**共同動作**：工具處理失敗並恢復工作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-064** `CatalogJobPolicy_WorkerTimeout_FailsOnlyItem` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：當機／timeout 項目為 Failed，不影響其他獨立項目。
- [ ] **UT-065** `CatalogJobPolicy_CompletedInput_ReusesResult` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：已完成且 input hash 相同的項目不重複製作。
- [ ] **UT-066** `CatalogJobPolicy_JobConflict_ReturnsExitFive` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：過期租約可恢復，同工作鍵不同輸入回 exit 5，status 提供工作原因。

### 1.23 SC-023 發布及安裝切換失敗保留舊版本

**位置**：`tools/catalog/tests/unit/test_sc_023.py`
**目標／來源**：隔離 `AtomicPublishPolicy` 規則；AC-009、AC-018、AC-023，BDD SC-023。
**共同前置**：staging、檔案搬入、DB commit 或安裝驗證可注入空間不足與中斷。
**共同動作**：執行發布或離線更新；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-067** `AtomicPublishPolicy_IncompleteStaging_PreservesHead` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：檔案或 hash 失敗不得切 head／可啟動版本。
- [ ] **UT-068** `AtomicPublishPolicy_FailedCommit_RetainsContent` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：DB 失敗回滾且不自動刪除可能仍需使用的內容。
- [ ] **UT-069** `AtomicPublishPolicy_InterruptedUpdate_KeepsPreviousVersion` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：原版本與原存檔保持可回復，提示「更新未完成，已保留原版本與存檔。」。

### 1.24 SC-024 拒絕越界內容與不應隨包的工具

**位置**：`tools/catalog/tests/unit/test_sc_024.py`
**目標／來源**：隔離 `ContentPathPolicy` 規則；AC-019、AC-025，BDD SC-024。
**共同前置**：manifest 含 ../、絕對路徑、外部 GLB URI 或遠端 Addressables；另有含憑證的 draft。
**共同動作**：執行來源匯入與 Player 打包檢查；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-070** `ContentPathPolicy_TraversalPath_RejectsEscape` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：任意外部路徑與越界壓縮成員拒絕，不在目標範圍外寫入。
- [ ] **UT-071** `ContentPathPolicy_RemoteAddress_RejectsBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Player 只解析本地 address key，遠端 catalog／自動查更新使建置失敗。
- [ ] **UT-072** `ContentPathPolicy_DeveloperArtifacts_ExcludedFromPlayer` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：draft、來源 adapter、維護 CLI 及來源金鑰不進入安裝包。

### 1.25 SC-025 未知存檔版本與缺舊映射保留原檔

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs`
**目標／來源**：隔離 `SaveCompatibilityChecker` 規則；AC-011、AC-023，BDD SC-025。
**共同前置**：SaveHeader 比 reader 新、assetContract 不符或 requiredModels 缺映射。
**共同動作**：呼叫 ISaveCompatibilityChecker.Check；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-073** `SaveCompatibilityChecker_NewerSchema_RejectsWithoutWrite` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未知 schema 回 UnsupportedSchema，不覆寫存檔。
- [ ] **UT-074** `SaveCompatibilityChecker_MissingRevision_DoesNotSubstitute` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺映射／不相容內容回 IncompatibleContent，不改用最新模型。
- [ ] **UT-075** `SaveCompatibilityChecker_IncompatibleSave_ReportsPreservation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：文案為「此存檔與目前版本不相容，原存檔已保留。」並列可定位診斷。

### 1.26 SC-026 原生相依或寫入權限失敗可定位

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/NativeDependencyPolicyTests.cs`
**目標／來源**：隔離 `NativeDependencyPolicy` 規則；AC-018、AC-021、AC-025，BDD SC-026。
**共同前置**：乾淨 Player 缺 SQLite DLL 或使用者資料目錄不可寫。
**共同動作**：嘗試啟動與必要資料操作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-076** `NativeDependencyPolicy_MissingNativeLibrary_ReportsRepair` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺相依顯示「必要執行檔不完整，請使用完整安裝包修復。」。
- [ ] **UT-077** `NativeDependencyPolicy_ReadOnlyUserRoot_ReturnsStorageUnavailable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不可寫回 StorageUnavailable 與「無法寫入本機資料，請檢查權限與可用空間。」。
- [ ] **UT-078** `NativeDependencyPolicy_DependencyFailure_PreservesProfiles` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不嘗試安裝線上工具、不清空既有 profile，記錄去敏診斷。

### 1.27 SC-027 空目錄與單一未解決項目不能全量發布

**位置**：`tools/catalog/tests/unit/test_sc_027.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-004、AC-009、AC-017，BDD SC-027。
**共同前置**：分別使用 A=0、U=1、G=1、V=A-1 或未分類一筆的資料。
**共同動作**：計算覆蓋率並要求發布；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-079** `CatalogCoveragePolicy_ZeroActive_AvoidsFalseComplete` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：A=0 顯示「尚無已確認基準」，不除以零或顯示 100%。
- [ ] **UT-080** `CatalogCoveragePolicy_SingleGap_BlocksPublish` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：任一未知、缺口、缺 revision 或分類缺漏均阻止正式發布。
- [ ] **UT-081** `CatalogCoveragePolicy_CompleteKnownSet_RequiresScopeReview` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：V/A=100% 但無涵蓋審查仍不是全量完成。

### 1.28 SC-028 分頁邊界與固定排序

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VariantPagingPolicyTests.cs`
**目標／來源**：隔離 `VariantPagingPolicy` 規則；AC-015、AC-019，BDD SC-028。
**共同前置**：同快照有 101 筆不同 variantId，篩選條件保持相同。
**共同動作**：以預設及邊界 Limit 逐頁查詢；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-082** `VariantPagingPolicy_LimitBounds_EnforcesOneToHundred` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：預設每頁 50，Limit=1 與 100 合法，0／負數／101 為 InvalidQuery。
- [ ] **UT-083** `VariantPagingPolicy_StableCursor_CoversAllRows` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：固定 variantId 排序，遍歷 101 筆無重複或遺漏。
- [ ] **UT-084** `VariantPagingPolicy_LastPage_HasNoCursor` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：末頁 nextCursor 為 null，空結果 items 為空集合。

### 1.29 SC-029 尺寸、接點與資產預算門檻

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs`
**目標／來源**：隔離 `MetadataValidationPolicy` 規則；AC-006、AC-008、AC-020、AC-024，BDD SC-029。
**共同前置**：資料分別在尺寸容差／接點誤差／大小上限及其相鄰兩側，另有 NaN、Infinity、負尺寸。
**共同動作**：驗證 metadata 及輸出預算；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-085** `MetadataValidationPolicy_ToleranceBoundary_UsesInclusiveLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：尺寸誤差 ≤ max(0.1 mm,0.5%×參考尺寸)，接點誤差 ≤0.05 mm 才通過。
- [ ] **UT-086** `MetadataValidationPolicy_NonFiniteMetadata_RejectsInput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：非有限數值、非正尺寸或非正 world scale 失敗，法向與切線須正規化。
- [ ] **UT-087** `MetadataValidationPolicy_AssetBudget_EnforcesEachLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：GLB ≤20 MiB、紋理每邊 ≤2048、預覽 ≤256 KiB；來源壓縮大小不冒充 runtime 記憶體。

### 1.30 SC-030 同時發布及歷史內容一致性

**位置**：`tools/catalog/tests/unit/test_sc_030.py`
**目標／來源**：隔離 `PublishConcurrencyPolicy` 規則；AC-009、AC-010、AC-018，BDD SC-030。
**共同前置**：兩個工作以相同 expected-head-version 要求發布。
**共同動作**：同時嘗試 CAS 交易並讀取結果；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-088** `PublishConcurrencyPolicy_SameHeadVersion_AllowsOneWinner` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只有一個工作成功切 head，另一個回版本衝突。
- [ ] **UT-089** `PublishConcurrencyPolicy_LosingPublisher_CannotOverwrite` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗工作不能覆寫成功結果或刪除已發布資產。
- [ ] **UT-090** `PublishConcurrencyPolicy_ExistingSession_RemainsStable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊 session 的投影與精確 revision 不跟著 head 改動。

### 1.31 SC-031 特殊款不能透過直接查詢取得權益

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/AcquisitionEligibilityTests.cs`
**目標／來源**：隔離 `AcquisitionEligibility` 規則；AC-013、AC-014、AC-015，BDD SC-031。
**共同前置**：模型庫含 Basic、Advanced、Special 與外觀可用但不可建造的件。
**共同動作**：以 CharacterCreation、InitialBucket 及 Browse 查詢；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-091** `AcquisitionEligibility_AcquisitionPurpose_ExcludesSpecial` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：人物建立與桶查詢均排除 Special，前者檢查 creationEligible，後者檢查 bucketEligible／BuildSystem。
- [ ] **UT-092** `AcquisitionEligibility_BrowseRead_DoesNotGrantItem` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Browse 或精確載入可讀模型資料但不增加庫存／人物資格。
- [ ] **UT-093** `AcquisitionEligibility_SpecialSources_RemainRestricted` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Special 的來源保持聯名／成就／活動，不因分類改動自動發放。

### 1.32 SC-032 資產引用生命週期與主執行緒

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs`
**目標／來源**：隔離 `ModelLeasePolicy` 規則；AC-026，BDD SC-032。
**共同前置**：兩個使用者共用 mesh／材質，載入可能成功、失敗或取消。
**共同動作**：AcquireAsync 後以不同順序 Dispose，包括重複 Dispose；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-094** `ModelLeasePolicy_DoubleDispose_ReleasesOnce` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每份 lease 只釋放自己的 reference，重複 Dispose 安全。
- [ ] **UT-095** `ModelLeasePolicy_SharedActiveHandle_RemainsAlive` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：取消／失敗後已建立而未使用的 handle 均釋放，不提前釋放另一份仍使用資產。
- [ ] **UT-096** `ModelLeasePolicy_UnityOperation_RequiresMainThread` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Unity 物件建立／操作／銷毀只在主執行緒，背景僅處理資料與 IO。

### 1.33 SC-033 斷網安裝後首次進入模型預覽

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-016、AC-021、AC-025，BDD SC-033。
**共同前置**：乾淨 Windows x64 無 Editor／SDK／Blender／Python／資料庫服務且已斷網。
**共同動作**：安裝完整包並首次啟動 CatalogPreviewScene；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-097** `CatalogPreviewPresenter_OfflineStartup_ShowsPreview` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：顯示「模型預覽」與可用的搜尋、篩選、模型資訊，不要求登入。
- [ ] **UT-098** `CatalogPreviewPresenter_PendingLoad_ShowsLoading` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：載入時顯示「正在載入本機模型…」，未完成前不假報可操作成功。
- [ ] **UT-099** `CatalogPreviewPresenter_BundledAssets_AvoidsRemoteDependency` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：實際 3D 模型由包內 SQLite／Addressables 取得，不依賴開發快取或下載。

### 1.34 SC-034 搜尋篩選與切換外觀

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-015、AC-016，BDD SC-034。
**共同前置**：已載入同快照的多系列、多款式及不同印刷變體。
**共同動作**：輸入貨號／名稱並依系列、款式、部位篩選後選取變體；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-100** `CatalogPreviewPresenter_CombinedFilters_SelectsMatchingRows` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：貨號精確匹配優先，名稱可部分匹配，所有篩選共同作用。
- [ ] **UT-101** `CatalogPreviewPresenter_SelectedItem_ShowsFrozenDetails` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：清單與詳情使用同快照，展示所選名稱、版本及尺寸。
- [ ] **UT-102** `CatalogPreviewPresenter_AppearanceSelection_ChangesModel` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：切換顏色或印刷時 3D 外觀與 variantId 一致，不只改文字。

### 1.35 SC-035 旋轉縮放與鍵盤操作不互相干擾

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs`
**目標／來源**：隔離 `PreviewCameraController` 規則；AC-016，BDD SC-035。
**共同前置**：模型預覽可操作且搜尋欄可取得焦點。
**共同動作**：拖曳、滾輪、重設視角並使用鍵盤搜尋／篩選／選取／重試／重設；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-103** `PreviewCameraController_CameraInput_UpdatesView` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：拖曳旋轉、滾輪縮放及重設可觀察真實 3D 模型。
- [ ] **UT-104** `PreviewCameraController_TextFocus_BlocksCameraInput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：文字輸入焦點阻止模型旋轉與遊戲快捷鍵被同步觸發。
- [ ] **UT-105** `PreviewCameraController_KeyboardNavigation_ReachesControls` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：所有規定的清單／按鈕操作可用鍵盤完成，窄視窗上下排列而不遮住必要控制。

### 1.36 SC-036 玩具材質、印刷與透明外觀核對

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/MaterialPreviewPolicyTests.cs`
**目標／來源**：隔離 `MaterialPreviewPolicy` 規則；AC-005、AC-007、AC-025，BDD SC-036。
**共同前置**：實際來源包含塑膠、橡膠、透明與印刷且已有六視圖。
**共同動作**：在封裝 Player 用固定光照觀察各變體；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-106** `MaterialPreviewPolicy_MaterialAssignment_PreservesAppearance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：塑膠／橡膠／透明材質有可辨差異，印刷位置與來源相符。
- [ ] **UT-107** `MaterialPreviewPolicy_LightingPreset_PreservesReadability` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：反射與柔光不以過曝遮住接縫、倒角或缺材質。
- [ ] **UT-108** `MaterialPreviewPolicy_PlayerEvidence_RequiredForAcceptance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每個變體有 Player 畫面證據與版本資料，純 PNG 或 Editor 畫面不能取代。

### 1.37 SC-037 搜尋空狀態可以清除條件恢復

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-015、AC-016，BDD SC-037。
**共同前置**：目錄可用但目前篩選不符合任何變體。
**共同動作**：搜尋完成後再按清除條件；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-109** `CatalogPreviewPresenter_NoMatches_ShowsEmptyMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：空狀態顯示「找不到符合條件的模型。」而不假造模型。
- [ ] **UT-110** `CatalogPreviewPresenter_EmptyState_KeepsClearAction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保留可操作的「清除條件」入口。
- [ ] **UT-111** `CatalogPreviewPresenter_ClearFilters_RestoresResults` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：清除後重查當前快照並回復有效清單，不變更目錄資料。

### 1.38 SC-038 模型錯誤不阻止選擇其他可用模型

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-016、AC-018、AC-025，BDD SC-038。
**共同前置**：一個模型損毀且另一個可正常載入。
**共同動作**：選取損毀模型後改選正常模型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-112** `CatalogPreviewPresenter_CorruptModel_ShowsRepairGuidance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗顯示「此模型檔案不完整，請使用完整安裝包修復。」及診斷 ID。
- [ ] **UT-113** `CatalogPreviewPresenter_FailureView_DoesNotFakeSuccess` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不以占位圖示宣稱成功，也不暴露堆疊／來源金鑰。
- [ ] **UT-114** `CatalogPreviewPresenter_OtherModel_RemainsSelectable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：其他可用模型仍可選取並正確呈現，既有存檔不變。

### 1.39 SC-039 快速換件僅呈現最新選擇

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs`
**目標／來源**：隔離 `SelectionRequestPolicy` 規則；AC-016、AC-026，BDD SC-039。
**共同前置**：A 載入慢、B 載入快。
**共同動作**：先選 A 隨即選 B，並令 A 最後才完成；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-115** `SelectionRequestPolicy_LateResult_DoesNotOverrideSelection` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：最後畫面僅呈現 B，A 不覆蓋 B 的模型或詳情。
- [ ] **UT-116** `SelectionRequestPolicy_DiscardedResult_ReleasesHandle` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：A 可取消或丟棄結果，但其多餘 handle 必須釋放。
- [ ] **UT-117** `SelectionRequestPolicy_RequestVersion_KeepsLoadingAccurate` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：快速反覆切換後 loading 狀態對應目前請求，不被舊結果關閉或卡住。

### 1.40 SC-040 重試等待期間防止重複啟動

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs`
**目標／來源**：隔離 `RetryRequestPolicy` 規則；AC-016、AC-026，BDD SC-040。
**共同前置**：可重試的暫時載入失敗已顯示「載入失敗，請重試。」。
**共同動作**：使用者連續按重試而第一次仍處理中；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-118** `RetryRequestPolicy_PendingRetry_DisablesButton` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：按鈕顯示「重試中…」且同一請求未完成前禁用。
- [ ] **UT-119** `RetryRequestPolicy_DuplicateRetry_StartsOneRequest` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：相同重試只啟動一次，未取消正常模型切換能力。
- [ ] **UT-120** `RetryRequestPolicy_RetryCompletion_RestoresAction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：完成或再失敗後恢復操作；不可重試的缺檔錯誤改指向完整包修復。

### 1.41 SC-041 離開預覽釋放資源並可再進入

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewLifecycleTests.cs`
**目標／來源**：隔離 `PreviewLifecycle` 規則；AC-016、AC-026，BDD SC-041。
**共同前置**：預覽持有 lease、instance、render texture 及待完成載入。
**共同動作**：離開場景，待舊請求完成後重新進入；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-121** `PreviewLifecycle_ExitScene_ReleasesOwnedResources` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：離開時釋放 session、lease、instance 與臨時 render texture。
- [ ] **UT-122** `PreviewLifecycle_LateCompletion_IgnoresDestroyedView` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未完成請求返回後不碰已銷毀 UI 且釋放未使用 handle。
- [ ] **UT-123** `PreviewLifecycle_ReenterScene_OpensFreshSession` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：重新進入可開新 session，共用仍被使用的 mesh／材質保持有效。

### 1.42 SC-042 圖形裝置不支援時回報啟動失敗

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/GraphicsCapabilityPolicyTests.cs`
**目標／來源**：隔離 `GraphicsCapabilityPolicy` 規則；AC-016、AC-021，BDD SC-042。
**共同前置**：圖形裝置不支援指定的原生 3D 執行條件。
**共同動作**：啟動安裝版預覽；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-124** `GraphicsCapabilityPolicy_UnsupportedGraphics_ProvidesMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：玩家可取得「目前圖形裝置不支援本遊戲，請檢查顯示驅動與系統需求。」。
- [ ] **UT-125** `GraphicsCapabilityPolicy_MissingDevice_FailsVisualAcceptance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不把只能顯示 PNG 或未建立 3D 裝置的結果標成通過。
- [ ] **UT-126** `GraphicsCapabilityPolicy_GraphicsFailure_PreservesData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保留診斷與原存檔，不強制連線修復。

### 1.43 SC-043 本地查詢與單件冷載入時間

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PerformanceGateTests.cs`
**目標／來源**：隔離 `PerformanceGate` 規則；AC-020，BDD SC-043。
**共同前置**：SSD 基準機及 max(100000,A) 筆 metadata 與可載入模型。
**共同動作**：暖機後查詢 1000 次，另測單模型冷載入；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-127** `PerformanceGate_QuerySamples_ApplySeparateP95Limits` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：50 筆分頁查詢 P95 ≤100 ms、詳情 P95 ≤50 ms，資產載入不混計。
- [ ] **UT-128** `PerformanceGate_ColdModel_UsesThreeSecondLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：單模型冷載入至第一個正確畫面 ≤3 秒且顯示載入狀態。
- [ ] **UT-129** `PerformanceGate_BenchmarkRecord_RequiresEnvironment` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：紀錄 CPU／GPU／驅動／套件／manifest 與 cold 定義，不以主執行緒同步查詢。

### 1.44 SC-044 2026 片畫面與實際 Player 流暢度

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/FramePerformanceGateTests.cs`
**目標／來源**：隔離 `FramePerformanceGate` 規則；AC-020、AC-025，BDD SC-044。
**共同前置**：固定 manifest 含至少 2026 可見積木、8 類幾何、印刷與透明件，指定 1080p Medium 基準機。
**共同動作**：用非 Development Standalone 關閉 VSync／幀率上限，暖機30秒後量測60秒且操作 UI；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-130** `FramePerformanceGate_SceneManifest_RequiresRepresentativeBricks` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：場景量與幾何組合達門檻，不能用同款低面數方塊替代。
- [ ] **UT-131** `FramePerformanceGate_FrameSamples_EnforcesBothLimits` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：平均 ≥60 FPS 且 P95 frame time ≤20 ms，載入段單獨統計。
- [ ] **UT-132** `FramePerformanceGate_PlayerRun_RequiresMatchedEnvironment` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保存原始 frame 資料、畫面證據與環境；Editor／另一硬體結果不得冒充基準機通過。

### 1.45 SC-045 多輪切換的記憶體與快取上限

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ResourceCachePolicyTests.cs`
**目標／來源**：隔離 `ResourceCachePolicy` 規則；AC-020、AC-026，BDD SC-045。
**共同前置**：固定20模型含共用資產且有可回收與仍使用項目。
**共同動作**：切換5輪並離開預覽，量測 handles／mesh／texture 與記憶體；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-133** `ResourceCachePolicy_UnusedCache_EnforcesBudget` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：無使用引用的快取以 LRU 控制估計 ≤256 MiB。
- [ ] **UT-134** `ResourceCachePolicy_ActiveAssets_AvoidsEviction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：仍使用資產獨立統計且不被快取清除。
- [ ] **UT-135** `ResourceCachePolicy_RepeatedCycles_DetectsLeak` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：釋放後物件與 handles 回到允許快取範圍，不每輪持續累積。

### 1.46 SC-046 輪組尺度與有限接觸原型

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VehicleMetadataPolicyTests.cs`
**目標／來源**：隔離 `VehicleMetadataPolicy` 規則；AC-008、AC-024，BDD SC-046。
**共同前置**：不同輪徑／軸距 fixture 有局部輪軸、碰撞體與質量來源標記。
**共同動作**：以統一世界倍率建立有限輪組坡道／路肩接觸原型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [ ] **UT-136** `VehicleMetadataPolicy_WorldScale_KeepsWheelGeometryAligned` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：模型、輪半徑、錨點及碰撞同倍率且 profile 可追溯。
- [ ] **UT-137** `VehicleMetadataPolicy_UnknownMass_PreservesEvidenceState` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：massKg 的 Measured／Estimated／Unknown 不混同，未知不冒充已核實性能。
- [ ] **UT-138** `VehicleMetadataPolicy_ContactFixture_DoesNotClaimRaceComplete` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：主要車身剛體與簡化碰撞的接觸結果留存，不宣稱完成車輛性能演算法或三賽道。

### 1.47 SC-047 隔離技術預覽與正式全量交付

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewPackagePolicyTests.cs`
**目標／來源**：隔離 `PreviewPackagePolicy` 的規則／狀態判定；AC-027、SC-047、GAP-001，SPEC §13.1。
**共同前置**：Frozen固定版本含已驗證代表資產、Unknown與Retired反例，正式全量尚有缺口。
**共同動作**：建置並安裝Preview，再以Release開啟該包及請求正式取得用途。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-019、CT-010、ET-015 驗證。

- [ ] **UT-139** `SelectPreview_MixedStatuses_ExcludesRetiredAndLabelsUnknown` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Preview僅含Ready且RuntimeBuild通過及使用條件可核對的非Retired代表件，Unknown顯示「生產狀態待查」；顯示「技術預覽・非完整模型庫」與完整C/A/R/U/G/V及子集合數。
- [ ] **UT-140** `OpenPackage_PreviewInRelease_ReturnsIncompatibleContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Release回IncompatibleContent及「此資產包僅供技術預覽，不能作為正式遊戲資料。」；包類型鎖在建置，不可改設定繞過。
- [ ] **UT-141** `AuthorizePreview_FormalPurpose_RejectsWithoutGrant` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Preview資料根獨立且只可Browse，不發道具、不寫正式進度、不匯入正式profile、不切正式head，畫面通過不提高全量完成度。

### 1.48 SC-048 先驗證Frozen候選再發布已驗證內容

**位置**：`tools/catalog/tests/unit/test_sc_048.py`
**目標／來源**：隔離 `ValidationPromotionPolicy` 的規則／狀態判定；AC-028、SC-048、GAP-002，SPEC §13.2。
**共同前置**：Frozen快照及固定選件、工具鏈、target摘要，另備變更後快照與上一版head。
**共同動作**：執行BuildValidationContent後嘗試發布及BuildCatalogContent。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-020、IT-021 驗證。

- [ ] **UT-142** `ValidateCandidate_FrozenSnapshot_LeavesHeadUnchanged` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：驗證只產生不可變staging與validation_builds證據，不需先Published也不切head；Preview可引用合格子集合。
- [ ] **UT-143** `PromoteCandidate_ChangedDigest_RejectsStaleReport` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：正式發布需全量門檻且snapshot/version/selection/toolchain/target與通過報告一致；任一變更拒絕舊報告。
- [ ] **UT-144** `CommitPublication_CasConflict_PreservesPreviousHead` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：發布以CAS提交已驗證build，失敗保留head；BuildCatalogContent只封裝Published的精確已驗證產物，再建Player與安裝包。

### 1.49 SC-049 更新與啟動共用互斥且身分穩定

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs`
**目標／來源**：隔離 `InstallLifecyclePolicy` 的規則／狀態判定；AC-029、SC-049、GAP-003，SPEC §13.3。
**共同前置**：既有Release人工profile與另一個Preview資料根；安裝器與啟動器競爭同一安裝路徑。
**共同動作**：在更新預檢至切換期間重啟遊戲，另測遊戲先持鎖及無寫入權限。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-022、ET-016 驗證。

- [ ] **UT-145** `ResolveProfile_StableIdentity_PreservesRoot` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：CompanyName固定GameNenStyle；Release BrickHigh/com.gamenenstyle.brickhigh、Preview BrickHighPreview/com.gamenenstyle.brickhigh.preview，升級沿用各自資料根。
- [ ] **UT-146** `AcquireLifecycle_CompetingOwners_AllowsOneOwner` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：以applicationId與canonical installRoot共用生命週期鎖，安裝器從預檢持至提交、啟動器持至Player退出，同一使用者同一安裝只允許一個Player。
- [ ] **UT-147** `InstallUpdate_NoPermission_PreservesPackageAndProfile` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：競爭顯示「遊戲或更新程序正在執行，請關閉後再試。」並不切換內容；權限失敗保留舊包與profile，不強殺、不新建第二資料庫。

### 1.50 SC-050 降版及備份失敗不擅自回退進度

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveRecoveryPolicyTests.cs`
**目標／來源**：隔離 `SaveRecoveryPolicy` 的規則／狀態判定；AC-030、SC-050、GAP-004，SPEC §13.4。
**共同前置**：人工F-Save含升版前完整備份、新版schema與新增進度；不使用私人正式存檔。
**共同動作**：檢查降版相容性，注入備份中斷，再在驗收harness選擇取消或確認還原。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 CT-011、IT-023、ET-017 驗證。

- [ ] **UT-148** `CheckSave_NewerSchema_BlocksWritableConnection` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Compatible或MigrationRequired以CompatibilityReport回報，未知schema回UnsupportedSchema且不開可寫連線，提示「此存檔版本較新，已保留目前進度。請使用相容版本開啟。」。
- [ ] **UT-149** `CommitBackup_InvalidTemporaryCopy_PreservesLastGood` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：備份先一致複製至暫存再驗證提交，失敗不覆蓋最後良好備份；migration交易失敗回滾，不改目前進度。
- [ ] **UT-150** `RestoreSave_NoConfirmation_PreservesCurrentProgress` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：提示「還原將回到所選備份的進度；目前資料會另行保留。」並列版本與時間；未確認、取消或失敗不替換目前資料，確認還原仍另存較新資料；正式玩家還原UI留後續SPEC。

### 1.51 SC-051 完整模型引用與包身分必須一致

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RuntimeReferencePolicyTests.cs`
**目標／來源**：隔離 `RuntimeReferencePolicy` 的規則／狀態判定；AC-031、SC-051、GAP-005，SPEC §13.5。
**共同前置**：真實SQLite具不同snapshot/variant/revision/target及manifest正反例。
**共同動作**：開啟包並解析正常、混搭、遺失歷史引用與未知schema。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-024、CT-012 驗證。

- [ ] **UT-151** `ResolveReference_MixedTuple_RejectsWrongOwner` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：runtime_models與runtime_builds以完整複合PK/FK/unique約束歸屬及target，每組ModelReference只解析唯一符合版本，不回退最新。
- [ ] **UT-152** `ValidateManifest_FieldMismatch_ReturnsIncompatibleContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：manifest與runtime_meta的pack/snapshot/schema/applicationId/packageKind/target逐項一致，錯配回IncompatibleContent，未知schema回UnsupportedSchema。
- [ ] **UT-153** `ResolveLegacy_MissingRevision_DoesNotUseLatest` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：損毀資料回AssetCorrupt，缺少必要歷史引用回IncompatibleContent；拒絕前不載入錯件或改動存檔。

### 1.52 SC-052 輸入邊界與取消順序具有精確契約

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs`
**目標／來源**：隔離 `CatalogInputPolicy` 的規則／狀態判定；AC-032、SC-052、GAP-006，SPEC §13.6。
**共同前置**：含中文、引號、百分號、底線的目錄，合法及null/disposed/跨包session與預先取消token。
**共同動作**：呼叫查詢、載入及相容性介面，參數化測試邊界與取消競態。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 CT-013、CT-014、IT-025 驗證。

- [ ] **UT-154** `ValidateInput_InvalidSessionOrDto_ReturnsInvalidQuery` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：未取消時null DTO/session、disposed/偽造/跨包session、非法enum/UUID或Limit不在1至100回InvalidQuery；空requiredModels仍驗header、重複引用去重且逐件查核。
- [ ] **UT-155** `ValidateText_ScalarAndCursorBounds_ReturnsSpecifiedError` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：QueryText null/空代表不篩選，至多256 Unicode scalar且UTF16有效；Cursor null/空為首頁、至多4096 ASCII，錯誤/跨查詢回InvalidCursor；中文、引號、%及_為參數化字面搜尋。
- [ ] **UT-156** `CancelRequest_PreCancelledInvalidInput_ReturnsCancelled` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：預先取消優先回Cancelled且無IO/handle配置；中途取消釋放資源；InvalidQuery與InvalidCursor顯示第13.6節文案，取消不彈警報。

### 1.53 SC-053 實際檔案目標與新載入內容不可繞過驗證

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetIntegrityPolicyTests.cs`
**目標／來源**：隔離 `AssetIntegrityPolicy` 的規則／狀態判定；AC-033、SC-053、GAP-007，SPEC §13.7。
**共同前置**：允許根目錄、相似前綴目錄、越界junction與已驗證後同大小替換的bundle。
**共同動作**：解析資產最終路徑並在快取命中、新程序與hash後讀取競態下重新載入。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-026、IT-027 驗證。

- [ ] **UT-157** `ResolveAsset_ReparseOrPrefixEscape_RejectsTarget` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：最終解析路徑必須在指定包或暫存根內；拒絕reparse point越界，不只比對字串前綴，不讀取根外內容。
- [ ] **UT-158** `ValidateCache_ChangedFileIdentity_RequiresHash` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：驗證快取綁pack/expectedDigest/最終路徑/fileIdentity；新程序、替換或無可靠身分時不能沿用跨讀取判定，新load核對實際bytes。
- [ ] **UT-159** `LoadVerified_BytesChangedBeforeRead_RejectsUnverifiedContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：hash至loader間保護檔案不被寫換或傳入已驗證stream；損毀拒絕且不改玩家資料，既有記憶體lease可共用；不宣稱hash是簽章或DRM。

### 1.54 SC-054 真實畫面基準、繁中字型與原生失敗通知

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VisualAcceptancePolicyTests.cs`
**目標／來源**：隔離 `VisualAcceptancePolicy` 的規則／狀態判定；AC-034、SC-054、GAP-008，SPEC §13.8。
**共同前置**：可安裝Preview含代表模型、隨包繁中文字型與授權；另備缺字、缺材質及無3D裝置反例。
**共同動作**：提交固定六視圖與操作錄影請使用者核准，並驗證渲染回歸及啟動器通知。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 ET-018、ET-019、ET-020 驗證。

- [ ] **UT-160** `ApproveVisual_NoUserDecision_RemainsUnapproved` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：實際Player代表模型畫面核准後記錄visualBaselineId、光照/鏡頭/材質digest、版本、日期及意見，未核准不得自稱既定風格通過。
- [ ] **UT-161** `EvaluateVisual_VisibleDefect_FailsAcceptance` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：缺字、印刷缺失/鏡像、粉紅shader、過曝等可見缺陷不通過；跨GPU不要求像素全等，關鍵外觀改動重新核准，繁中字型及fallback斷網可用。
- [ ] **UT-162** `DescribeStartup_UnknownCause_UsesHonestNativeMessage` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：BrickHighLauncher.exe在無Unity圖形裝置時仍有Windows原生通知與診斷；未知原因用「遊戲未能完成啟動，請檢查安裝檔與顯示驅動。」；正常啟動無多餘console且必要相依隨包。

### 1.55 SC-055 不同硬體及品質設定不可冒充基準效能

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/BenchmarkEvidencePolicyTests.cs`
**目標／來源**：隔離 `BenchmarkEvidencePolicy` 的規則／狀態判定；AC-035、SC-055、GAP-009，SPEC §13.9。
**共同前置**：本機Iris Xe探索環境與SPEC基準機，固定BenchmarkProfile及改設定反例。
**共同動作**：執行實際Player冷啟動、首次模型載入、熱載入與2026片穩態量測。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 ET-021、ET-022 驗證。

- [ ] **UT-163** `EvaluateBenchmark_DifferentHardware_MarksExploratory` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Iris Xe結果只作探索，正式以GTX1660/i5-10400/16GiB/SSD或另行核准硬體驗收，不同硬體不標基準通過。
- [ ] **UT-164** `CompareBenchmark_ChangedProfile_RejectsMixedResults` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：profile記錄1920x1080/renderScale1/動態解析度關閉及已核准AA/陰影/光照/透明比例/相機/UI/套件digest；設定變更另建profile，未凍結不能算Medium驗收。
- [ ] **UT-165** `MeasureFirstFrame_PlaceholderVisible_DoesNotStopTimer` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Acquire至第一個正確mesh/材質/紋理畫面包含hash且≤3秒；冷暖與OS快取條件分列，2026片8類幾何關VSync上限暖30秒測60秒，平均≥60FPS且P95≤20ms，保留原始資料與畫面。

### 1.56 SC-056 輪組單位、未知質量與配對原型可核對

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/WheelMetadataPolicyTests.cs`
**目標／來源**：隔離 `WheelMetadataPolicy` 的規則／狀態判定；AC-036、SC-056、GAP-010，SPEC §13.10。
**共同前置**：至少兩種輪徑與兩種軸距，合法及非法輪胎/輪圈/軸配對，Measured/Estimated/Unknown質量資料。
**共同動作**：驗證metadata並在固定坡道/路肩與WorldScaleProfile建立靜態和動態原型。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-028、IT-029 驗證。

- [ ] **UT-166** `ValidateWheelGeometry_InvalidDimensions_ExcludesCandidate` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：radiusMeters/widthMeters有限且>0、axleDirection為canonical局部正規化；必要尺寸未知不填0且不進輪組候選，但保留外觀資產。
- [ ] **UT-167** `ValidateMass_UnknownEvidence_RequiresNullAndReason` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Measured/Estimated有有限正massKg與來源理由；Unknown為null且附原因，不帶入虛構重量或性能。
- [ ] **UT-168** `MatchWheelProfile_IncompatiblePair_RejectsAssembly` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：不相容配對拒絕；合法靜態軸心/模型/碰撞誤差符合§4.3，記錄scale/坡度/路肩高度/速度/物理設定及實際動態接觸與跳動，不宣稱完成MVP-002。

## 2️⃣ 集成測試（Integration Tests）

真實協作必須跨過本節列明的邊界，不只驗證 mock 呼叫次數。每個對應場景的三項結果均為本案例斷言，不可只挑 Happy Path。

### IT-001 SourceCatalog

**位置**：`tools/catalog/tests/integration/test_source_catalog.py`

- [ ] **IT-001** `RunSourceCatalog_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-001、SC-002、SC-003。
  - 前置：真實 SQLite、受控來源檔、FK／unique 與日期資料，不使用真實來源服務作為離線測試前置。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-002 PublishGate

**位置**：`tools/catalog/tests/integration/test_publish_gate.py`

- [ ] **IT-002** `RunPublishGate_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-004、SC-005、SC-027。
  - 前置：真實 SQLite 與不可變內容庫，逐門檻缺一的完整正反例。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-003 ModelPipeline

**位置**：`tools/catalog/tests/integration/test_model_pipeline.py`

- [ ] **IT-003** `RunModelPipeline_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-006、SC-010、SC-013。
  - 前置：真實 Blender、已鎖定轉換器、glTF Validator 與代表資產，不能 mock 轉換器。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-004 CoordinateAndConnectors

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`

- [ ] **IT-004** `RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-007、SC-008、SC-029。
  - 前置：實際 glTFast 匯入 mesh、metadata、碰撞配對與非對稱 fixture。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-005 UsageProjection

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/UsageProjectionTests.cs`

- [ ] **IT-005** `RunUsageProjection_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-009、SC-031。
  - 前置：真實 catalog.db、六部位與同系統建材，含 Special／無分類反例。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-006 JobRecovery

**位置**：`tools/catalog/tests/integration/test_job_recovery.py`

- [ ] **IT-006** `RunJobRecovery_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-011、SC-022。
  - 前置：真實工作 DB、可受控終止的 Blender worker、可控制時鐘與租約。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-007 LegacyRuntime

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/LegacyRuntimeTests.cs`

- [ ] **IT-007** `RunLegacyRuntime_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-012、SC-014。
  - 前置：兩個來源快照、歷史投影與當前引擎重建的舊引用資產。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-008 ReadContract

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs`

- [ ] **IT-008** `RunReadContract_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-015、SC-028。
  - 前置：真實唯讀 SQLite、101 筆與多篩選組合，不 mock repository。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-009 NativeStorage

**位置**：`game/Assets/BrickHigh/Tests/Player/NativeStorageTests.cs`

- [ ] **IT-009** `RunNativeStorage_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-016、SC-026。
  - 前置：真實 Windows Player 原生 DLL、含中文與空格的路徑、唯讀安裝區與不可寫使用者區。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-010 InstallerSwitch

**位置**：`tools/acceptance/tests/test_installer_switch.py`

- [ ] **IT-010** `RunInstallerSwitch_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-017、SC-023。
  - 前置：隔離 Windows 測試機中的真實安裝包 A／B，逐階段故障注入，不操作個人正式存檔。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-011 SaveFixtures

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/SaveFixtureTests.cs`

- [ ] **IT-011** `RunSaveFixtures_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-018、SC-025。
  - 前置：真實 SQLite backup／transaction，人工 SaveHeader 與不可變檔案；不實作其他模組資料表。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-012 PackageValidation

**位置**：`tools/acceptance/tests/test_package_validation.py`

- [ ] **IT-012** `RunPackageValidation_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-019、SC-024。
  - 前置：實際安裝包清單與受控損毀版本，含越界、缺檔及遠端相依反例。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-013 ExternalRetry

**位置**：`tools/catalog/tests/integration/test_external_retry.py`

- [ ] **IT-013** `RunExternalRetry_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-021。
  - 前置：本機受控來源 stub 回 429／timeout，注入 fake clock；不可冒充全量來源證據。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-014 ConcurrentPublish

**位置**：`tools/catalog/tests/integration/test_concurrent_publish.py`

- [ ] **IT-014** `RunConcurrentPublish_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-030。
  - 前置：兩個 SQLite connection／程序競爭同 head，核對獲勝者與交易回滾。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-015 AssetLifetime

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/AssetLifetimeTests.cs`

- [ ] **IT-015** `RunAssetLifetime_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-032、SC-039、SC-041。
  - 前置：真實 Addressables handles、共用 mesh／材質與可控制完成次序的載入邊界。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-016 PreviewInteractions

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/PreviewInteractionTests.cs`

- [ ] **IT-016** `RunPreviewInteractions_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-033、SC-034、SC-035、SC-037、SC-038、SC-040、SC-042。
  - 前置：uGUI／Input System 與實際場景；故障由測試 seam 注入，不能代替真實無圖形裝置 E2E。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-017 VisualVariants

**位置**：`game/Assets/BrickHigh/Tests/Player/VisualVariantTests.cs`

- [ ] **IT-017** `RunVisualVariants_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-036。
  - 前置：封裝 Player 的代表材質與逐變體畫面證據，固定相機／燈光並對照來源。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-018 PerformanceFixtures

**位置**：`game/Assets/BrickHigh/Tests/Player/PerformanceFixtureTests.cs`

- [ ] **IT-018** `RunPerformanceFixtures_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-043、SC-044、SC-045、SC-046。
  - 前置：實際 SQLite、代表場景、記憶體與輪組原型，紀錄硬體及原始量測；不能用假的 profiler 數據。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-019 BuildPreview

**位置**：`tools/catalog/tests/integration/test_it_019.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-019** `BuildPreview_IncompleteCatalog_LabelsNonRelease` — @critical
  - 目標／BDD：SC-047；AC-027；SPEC §13.1。
  - 前置：真實Frozen SQLite與可轉換的非Retired代表模型；另備缺使用條件、未Ready件。
  - 動作：實際BuildValidationContent及BuildPreviewPlayer；讀回包manifest與目錄。
  - 預期：只封裝合格子集；含packageKind/applicationId/sourceSnapshotStatus/sourceSelectionDigest/previewCompleteness，保留全量缺口與非完整標記，正式head不動。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-020 BuildValidation

**位置**：`tools/catalog/tests/integration/test_it_020.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-020** `BuildValidation_FrozenSnapshot_ProducesStagingOnly` — @critical
  - 目標／BDD：SC-048；AC-028；SPEC §13.2。
  - 前置：真實Frozen快照、上一版head及Unity批次驗證工具鏈。
  - 動作：未Published先執行BuildValidationContent；檢查DB紀錄及staging，再由合格子集建Preview。
  - 預期：能走完而不循環等待Published；validation_builds保存全部摘要與結果，正式head不變；失敗結果不能被發布引用。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-021 PromoteBuild

**位置**：`tools/catalog/tests/integration/test_it_021.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-021** `PromoteBuild_ChangedSourceDigest_RejectsPromotion` — @critical
  - 目標／BDD：SC-048；AC-028；SPEC §13.2。
  - 前置：已通過validation_build與真實DB；逐列改snapshot版本/選件/工具鏈/target及CAS競爭。
  - 動作：對每個變更呼叫catalog publish；另跑完全一致正例並BuildCatalogContent。
  - 預期：任何摘要不符或CAS失敗拒絕且head不變；正例先滿足全量fixture門檻才Published並精確封裝，不把fixture當實際來源完成。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-022 Update

**位置**：`tools/acceptance/tests/integration/test_it_022.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-022** `Update_GameRestartsDuringStaging_DefersSwitch` — @critical
  - 目標／BDD：SC-049；AC-029；SPEC §13.3。
  - 前置：真實兩個Windows程序、暫存安裝根、人工profile及同步barrier。
  - 動作：分別令遊戲先持鎖、安裝器先持鎖，再競爭啟動/更新；注入無權限與切換失敗。
  - 預期：僅一方持生命週期鎖；更新期間不啟Player，遊戲期間不切包，失敗用指定提示且舊包/profile hash不變；不強殺或建立第二DB。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-023 Backup

**位置**：`tools/acceptance/tests/integration/test_it_023.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-023** `Backup_IncompleteCopy_DoesNotReplaceLastGood` — @critical
  - 目標／BDD：SC-050；AC-030；SPEC §13.4。
  - 前置：真實SQLite含WAL資料與已驗證良好備份；故障注入在copy/validate/commit/migration階段。
  - 動作：以backup API或停寫關閉連線取得一致備份，逐階段中斷；另測成功遷移。
  - 預期：完整備份含已提交WAL資料；中斷不替換last-good，migration交易回滾；成功才原子提交新備份與可相容新資料。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-024 Resolve

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT024RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-024** `Resolve_MixedReferenceTuple_RejectsModel` — @critical
  - 目標／BDD：SC-051；AC-031；SPEC §13.5。
  - 前置：真實SQLite啟用FK，含合法新舊snapshot與交錯variant/revision/buildTarget。
  - 動作：嘗試插入違反複合FK/unique的列；對既存損毀fixture執行開啟檢核與ModelReference解析。
  - 預期：寫入約束拒絕混搭；讀取不選最新或另一target；合法舊引用仍精確載入，錯誤不改profile；具體錯誤碼按§13.5。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-025 AcquireAsync

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT025RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-025** `AcquireAsync_PreCancelled_AllocatesNoHandle` — @critical
  - 目標／BDD：SC-052；AC-032；SPEC §13.6。
  - 前置：真實資產adapter與可計數handle/IO；token已取消且另帶非法輸入。
  - 動作：預先取消呼叫AcquireAsync；在進行中載入與UI離開barrier再次取消。
  - 預期：預先取消優先Cancelled，零IO/零handle配置；中途取消釋放未使用handle/instance且不回寫已銷毀UI，不顯示警報。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-026 LoadAsset

**位置**：`tools/acceptance/tests/integration/test_it_026.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-026** `LoadAsset_ReparsePointEscape_RejectsAccess` — @critical
  - 目標／BDD：SC-053；AC-033；SPEC §13.7。
  - 前置：專用暫存包根與根外無敏感內容sentinel、相似前綴根及可測junction/symlink。
  - 動作：經包路徑解析器載入越界及合法檔案；若環境不能建立reparse測試則記阻斷，不skip通過。
  - 預期：越界或整包reparse拒絕政策成立，根外sentinel零讀取；合法資產可載入，profile不變；不只靠路徑字串前綴。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-027 LoadAsset

**位置**：`tools/acceptance/tests/integration/test_it_027.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-027** `LoadAsset_ReplacedSameSizeBundle_InvalidatesValidation` — @critical
  - 目標／BDD：SC-053；AC-033；SPEC §13.7。
  - 前置：合法bundle已hash，製作同大小且相同mtime但內容不同檔案；受控hash-to-load barrier。
  - 動作：於下次load前替換，另在hash後讀取前嘗試寫換；測新程序、缺可靠fileIdentity與存活lease。
  - 預期：新load驗實際bytes，替換不可用舊快取；使用鎖或verified stream避免讀未驗內容，錯誤拒絕不動profile；存活記憶體lease保持有效。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-028 ValidateWheel

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT028RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-028** `ValidateWheel_UnknownMass_DoesNotInventValue` — @critical
  - 目標／BDD：SC-056；AC-036；SPEC §13.10。
  - 前置：真實metadata匯入/序列化/查詢，Unknown/null與Measured/Estimated正反例；NaN/Infinity/0/負數尺寸。
  - 動作：跨製作與runtime契約讀寫輪組資料並檢查候選過濾。
  - 預期：Unknown保留null及reason、無預設重量/性能；Measured/Estimated有限正值且有來源理由；必要尺寸缺漏不進輪候選但不刪外觀，軸向/單位維持canonical。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### IT-029 MatchWheel

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/Integration/IT029RiskTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **IT-029** `MatchWheel_IncompatibleAxle_RejectsAssembly` — @critical
  - 目標／BDD：SC-056；AC-036；SPEC §13.10。
  - 前置：Unity PlayMode真實兩種輪徑、兩種軸距與正反配對，固定scale/坡道/路肩/速度/物理設定。
  - 動作：建合法原型量靜態接點/碰撞，嘗試非法配對並跑有限動態接觸；與ET-014共用可追溯fixture。
  - 預期：合法幾何誤差符合§4.3、不相容拒絕且不產生裝配；保存實際接觸/跳動與畫面，檔案存在本身不算幾何通過，不宣稱正式賽車。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

## 3️⃣ API 契約測試（API Tests；非 HTTP）

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/BrickCatalogContractTests.cs`；`AcquireAsync`／Unity 資源釋放另在 `game/Assets/BrickHigh/Tests/PlayMode/AssetProviderContractTests.cs` 執行。

使用真實 adapter 與受控 DB／資產；不使用網路測試伺服器。下列9項涵蓋5個 IBrickCatalog 方法、資產載入、相容檢查與資源／結果契約。

- [ ] **CT-001** `OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-015、SC-019、SC-026。
  - 前置：已發布／缺目錄／缺相依／不支援 schema。
  - 動作：透過正式 C# 介面呼叫 `OpenAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：session 綁定 manifest，錯誤型別明確；取消不遺留連線。

- [ ] **CT-002** `QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-015、SC-020、SC-028、SC-031。
  - 前置：101筆、所有用途／篩選、Limit 邊界、跨快照 cursor。
  - 動作：透過正式 C# 介面呼叫 `QueryAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：排序及 cursor 無重漏，非法輸入拒絕且 Special 限制生效。

- [ ] **CT-003** `GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-012、SC-015、SC-020。
  - 前置：有效 variant、未知 UUID、錯誤 snapshot。
  - 動作：透過正式 C# 介面呼叫 `GetVariantAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：詳情使用凍結投影與正確 revision；不存在回 VariantNotFound。

- [ ] **CT-004** `GetProfilesAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-008、SC-015。
  - 前置：同名不同系列 profile 與多個快照。
  - 動作：透過正式 C# 介面呼叫 `GetProfilesAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：回該 session 的版本化完整配對規則，禁止混入最新規則。

- [ ] **CT-005** `GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-005、SC-015、SC-027。
  - 前置：空基準、完整已知分母、含G/U與完整審查資料。
  - 動作：透過正式 C# 介面呼叫 `GetCoverageAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：回一致的 C/A/R/U/G/V 及涵蓋審查，空基準不報100%。

- [ ] **CT-006** `AcquireAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-012、SC-019、SC-024、SC-032。
  - 前置：精確引用、缺檔、損毀、取消、任意路徑。
  - 動作：透過正式 C# 介面呼叫 `AcquireAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：只回正確本地資產 lease 或 typed error；零權益寫入。

- [ ] **CT-007** `Check_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-018、SC-025。
  - 前置：SaveHeader、模型引用清單、新 schema 與缺映射。
  - 動作：透過正式 C# 介面呼叫 `Check`，或以其 factory／Dispose 操作結果與資源。
  - 預期：相容報告對應完整 requiredModels，失敗不寫入或替換原資料。

- [ ] **CT-008** `Dispose_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-032、SC-041。
  - 前置：session／lease 有共用資產且重複釋放。
  - 動作：透過正式 C# 介面呼叫 `Dispose`，或以其 factory／Dispose 操作結果與資源。
  - 預期：每次資源所有權正確結束，不提前卸載共用資產或留掛起UI回呼。

- [ ] **CT-009** `CatalogResult_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-019、SC-020、SC-025、SC-026。
  - 前置：全部已列錯誤碼與 Success 樣本。
  - 動作：透過正式 C# 介面呼叫 `CatalogResult`，或以其 factory／Dispose 操作結果與資源。
  - 預期：Success／Failure 互斥、retryable 與繁體中文文案一致且無敏感堆疊。

### CT-010 OpenRelease

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT010RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-010** `OpenRelease_PreviewPack_RejectsPackage` — @critical
  - 目標／BDD：SC-047；AC-027；SPEC §13.1。
  - 前置：Release runtime與真實Preview包、修改config偽裝Release反例。
  - 動作：呼叫OpenAsync及Preview session的CharacterCreation/InitialBucket用途；嘗試匯入Preview profile。
  - 預期：Release精確回IncompatibleContent且指定文案；Preview只Browse、不發放、不開正式profile；改設定無法更改建置身分。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-011 Downgrade

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-011** `Downgrade_NewSaveSchema_BlocksWrites` — @critical
  - 目標／BDD：SC-050；AC-030；SPEC §13.4。
  - 前置：相容、需migration、未知較新schema及bad-content的F-Save與可記錄連線模式的adapter。
  - 動作：呼叫相容性checker並嘗試舊版開啟；另測空requiredModels。
  - 預期：成功分Compatible/MigrationRequired；未知schema=UnsupportedSchema，bad-content=IncompatibleContent；不相容零可寫連線、不換空白存檔，空清單仍核header。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-012 OpenAsync

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT012RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-012** `OpenAsync_ManifestCatalogMismatch_RejectsPack` — @critical
  - 目標／BDD：SC-051；AC-031；SPEC §13.5。
  - 前置：有效manifest/runtime_meta，逐欄換pack/snapshot/schema/app/kind/target，另備損毀DB與缺歷史引用。
  - 動作：參數化呼叫OpenAsync與requiredModels相容檢核。
  - 預期：包身分/target錯配與缺歷史引用=IncompatibleContent、未知schema=UnsupportedSchema、損毀=AssetCorrupt；不開可用session或錯模型。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-013 QueryAsync

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT013RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-013** `QueryAsync_NullOrDisposedSession_ReturnsInvalidQuery` — @critical
  - 目標／BDD：SC-052；AC-032；SPEC §13.6。
  - 前置：合法以及null/disposed/偽造/跨包session，null query/ref/header/requiredModels、非法enum/UUID/Limit。
  - 動作：未取消下逐項呼叫相關公開介面；另測Limit1/100、空requiredModels及重複引用。
  - 預期：非法輸入精確InvalidQuery且在IO前拒絕；合法邊界可用，空requiredModels仍查header、重複引用去重但不漏任一必要版本。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### CT-014 QueryAsync

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Contract/CT014RiskContractTests.cs`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **CT-014** `QueryAsync_OversizedOrLiteralWildcard_ValidatesAndBinds` — @critical
  - 目標／BDD：SC-052；AC-032；SPEC §13.6。
  - 前置：真實SQLite含中文、引號、%/_及相近非匹配文字；Unicode scalar255/256/257、代理對/孤立代理與Cursor4095/4096/4097反例。
  - 動作：執行QueryAsync；另測空/null文字、非ASCII/損毀/跨查詢Cursor。
  - 預期：QueryText以scalar計數，無效UTF16/超限=InvalidQuery；Cursor錯誤=InvalidCursor；null/空首頁/不篩選，特殊字元只字面匹配且使用參數綁定，不能擴大SQL或結果。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

## 4️⃣ E2E 測試（End-to-End Tests）

以下案例必須使用實際 Windows 安裝版；ET-008 另含真正製作管線，ET-009 的全量來源不可由 fixture 代替。ET-011～ET-014 要保留原始測量資料，不只保存「PASS」字樣。

### ET-001 OfflineInstall

**位置**：`tools/acceptance/tests/test_offline_install.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-001** `RunOfflineInstall_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-033。
  - 前置：乾淨 Windows、斷網、完整安裝包。
  - 動作：從安裝、啟動到第一個真實模型，並保留錄影／畫面、網路依賴檢查與安裝版本。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-002 BrowseAndCamera

**位置**：`tools/acceptance/tests/test_browse_and_camera.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-002** `RunBrowseAndCamera_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-034、SC-035、SC-037。
  - 前置：已安裝預覽與多變體包。
  - 動作：滑鼠及鍵盤完成搜尋、篩選、空結果、清除、換外觀、旋轉、縮放、重設與窄視窗操作。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-003 MaterialAcceptance

**位置**：`tools/acceptance/tests/test_material_acceptance.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-003** `RunMaterialAcceptance_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-036。
  - 前置：封裝 Player 的塑膠／橡膠／透明／印刷實際資產。
  - 動作：逐變體核對來源與六視圖、缺材質反例；保存檢查者、結論、問題清單與畫面版本。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-004 RapidSelection

**位置**：`tools/acceptance/tests/test_rapid_selection.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-004** `RunRapidSelection_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-038、SC-039、SC-040、SC-041。
  - 前置：真實場景與受控慢載入／可重試失敗。
  - 動作：快速換件、重試連點、退出重入及選擇其他模型，核對畫面與 handles，不能只以 presenter 單測驗收。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-005 StartupFailure

**位置**：`tools/acceptance/tests/test_startup_failure.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-005** `RunStartupFailure_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-019、SC-026、SC-042。
  - 前置：隔離機的缺 DLL／缺包／不支援圖形條件。
  - 動作：確認可理解的啟動失敗通知及原資料完整；不能把沒有 3D 畫面標示通過。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-006 InstallUpgradeUninstall

**位置**：`tools/acceptance/tests/test_install_upgrade_uninstall.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-006** `RunInstallUpgradeUninstall_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-016、SC-017。
  - 前置：一般使用者、唯讀安裝區、人工 profile fixture。
  - 動作：安裝 A→關閉→升級 B→啟動→預設解除安裝，全程核對 profile bytes／DB資料及本地寫入位置。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-007 FailedUpdateAndSave

**位置**：`tools/acceptance/tests/test_failed_update_and_save.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-007** `RunFailedUpdateAndSave_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-023、SC-025。
  - 前置：原版本及人工存檔、新包的空間不足／中斷／缺映射／未知schema。
  - 動作：逐例核對原存檔、可回復版本與具體訊息；不清空重建作為成功。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-008 SourceToPlayer

**位置**：`tools/acceptance/tests/test_source_to_player.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-008** `RunSourceToPlayer_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-006、SC-007、SC-010、SC-013。
  - 前置：受控來源與代表自建修補模型。
  - 動作：真實 Blender→GLB驗證→Unity→本地DB與bundle→安裝→離線選取旋轉；不能mock關鍵鏈，fixture包不冒充正式全量。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-009 FullCatalogRelease

**位置**：`tools/acceptance/tests/test_full_catalog_release.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-009** `RunFullCatalogRelease_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-005、SC-027。
  - 前置：已取得的實際全量來源、模型與涵蓋審查。
  - 動作：獨立重算 C/A/R/U/G/V、逐變體RuntimeBuild載入與證據；未取得來源時明確阻斷，不skip後算通過。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-010 LegacyModelUpgrade

**位置**：`tools/acceptance/tests/test_legacy_model_upgrade.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-010** `RunLegacyModelUpgrade_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-012、SC-014。
  - 前置：兩代實際包、保留來源revision與停產／分類差異。
  - 動作：新版載入舊精確引用，外觀／尺寸不被新模型替代，停產不影響既有引用且不新發放。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-011 QueryAndColdLoad

**位置**：`tools/acceptance/tests/test_query_and_cold_load.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-011** `RunQueryAndColdLoad_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-043。
  - 前置：SPEC §8.2 記錄的基準硬體與SSD。
  - 動作：執行1000次查詢及單件冷載入，分別提交P95、首幀時間與原始樣本。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-012 FrameBenchmark

**位置**：`tools/acceptance/tests/test_frame_benchmark.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-012** `RunFrameBenchmark_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-044。
  - 前置：規定基準硬體、非Development Standalone、固定2026片場景。
  - 動作：1080p Medium／關VSync，暖機30秒後60秒，平均60FPS與P95≤20ms並保存UI操作錄影。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-013 MemoryBenchmark

**位置**：`tools/acceptance/tests/test_memory_benchmark.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-013** `RunMemoryBenchmark_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-045。
  - 前置：固定20模型含共用資產。
  - 動作：換件5輪後核對LRU≤256MiB的未使用快取及實際存活物件，活躍資產分列。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-014 WheelGeometryPrototype

**位置**：`tools/acceptance/tests/test_wheel_geometry_prototype.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-014** `RunWheelGeometryPrototype_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-046。
  - 前置：不同輪徑／軸距、統一比例、短坡道與路緣。
  - 動作：保存輪軸／碰撞對齊與接觸結果，指出跳動／尺度問題；不宣稱已能正式賽車。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-015 AcceptPreview

**位置**：`tools/acceptance/tests/test_et_015.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-015** `AcceptPreview_VisibleAssets_DoesNotCompleteFullCatalog` — @critical
  - 目標／BDD：SC-047；AC-027；SPEC §13.1。
  - 前置：斷網乾淨Windows與Preview安裝包，代表普通磚/板/透明/印刷人物/Technic插銷軸/DUPLO及非對稱件。
  - 動作：安裝、旋轉、縮放、換件、查看Unknown件與全量計數；另裝Release相容fixture核對隔離。
  - 預期：可操作真實3D並可讀非完整及待查標籤；無正式發放或進度；截圖錄影與包版本留存，Preview通過不勾ET-009全量完成。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-016 Upgrade

**位置**：`tools/acceptance/tests/test_et_016.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-016** `Upgrade_StableProductIdentity_UsesExistingProfile` — @critical
  - 目標／BDD：SC-049；AC-029；SPEC §13.3。
  - 前置：兩代同產品安裝包及獨立Preview包，Release/Preview各有可辨識人工profile。
  - 動作：記錄Company/Product/applicationId/persistentDataPath後實際升級、重開並交叉檢查捷徑及資料根。
  - 預期：Release與Preview各自沿用原根與profile，不互讀；捷徑走啟動器且持鎖至Player退出，正常無console；安裝/升級不寫player.db。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-017 RestoreBackup

**位置**：`tools/acceptance/tests/test_et_017.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-017** `RestoreBackup_WithoutExplicitChoice_PreservesNewProgress` — @critical
  - 目標／BDD：SC-050；AC-030；SPEC §13.4。
  - 前置：隔離F-Save恢復驗收harness，備份版本/時間與新版進度可辨；不是正式玩家UI。
  - 動作：展示指定提示後依序無選擇、取消、注入還原失敗、明確確認還原。
  - 預期：前三者保留目前進度及last-good；確認後才切至指定備份且另存較新資料可恢復；保留提示/選擇/前後hash證據，正式UI待PlayerInventory。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-018 Preview

**位置**：`tools/acceptance/tests/test_et_018.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-018** `Preview_MissingChineseGlyph_FailsVisualCheck` — @critical
  - 目標／BDD：SC-054；AC-034；SPEC §13.8。
  - 前置：離線乾淨Windows、合法隨包字型/fallback及故意缺字反例。
  - 動作：用實際Player遍歷所有繁中UI/錯誤訊息/待查標籤，核對字型使用條件與出字畫面。
  - 預期：缺字方框、缺fallback或授權證據不通過；正例不依賴系統碰巧有字型或線上下載，保存畫面與字型版本。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-019 Startup

**位置**：`tools/acceptance/tests/test_et_019.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-019** `Startup_NoGraphicsDevice_ProvidesNativeNotice` — @critical
  - 目標／BDD：SC-054；AC-034；SPEC §13.8。
  - 前置：含原生BrickHighLauncher.exe的安裝包，無支援圖形裝置環境及Player缺失/崩潰故障fixture。
  - 動作：從捷徑啟動，在Unity UI建立前觀察Windows原生通知與診斷，再測正常斷網啟動。
  - 預期：確知不支援用SC-042文案、未知原因用§13.8通用文案，不編造原因；無3D仍可取得提示與診斷，profile保留，正常無console且離線相依齊備。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-020 Render

**位置**：`tools/acceptance/tests/test_et_020.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-020** `Render_GoldenReferenceMismatch_RequiresReview` — @critical
  - 目標／BDD：SC-054；AC-034；SPEC §13.8。
  - 前置：實際安裝Player代表模型六視圖、光照/鏡頭/材質版本及使用者核准紀錄；未核准與可見缺陷反例。
  - 動作：提交首批畫面核准，按visualBaselineId比對後續包並逐列注入印刷缺失/鏡像/粉紅shader/過曝與關鍵風格改動。
  - 預期：無核准不能凍結；缺陷失敗，關鍵改動需重新審閱；跨GPU不要求像素全等，保留操作錄影、版本digest、核准日期與意見。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-021 Benchmark

**位置**：`tools/acceptance/tests/test_et_021.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-021** `Benchmark_DifferentHardware_DoesNotClaimBaselinePass` — @critical
  - 目標／BDD：SC-055；AC-035；SPEC §13.9。
  - 前置：Iris Xe本機與指定基準機資料，實際2026片8類幾何場景。
  - 動作：用相同已凍結profile在可用硬體量測；欠缺指定設備時保留正式未驗收。
  - 預期：探索結果不得冒稱基準通過；只有指定或另核准硬體的真實Player且完整原始資料才能判平均≥60FPS/P95≤20ms，欠設備不skip後標pass。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

### ET-022 Benchmark

**位置**：`tools/acceptance/tests/test_et_022.py`（預計；需真實相依／Player或可重跑驗收harness，不以全部mock取代）。

- [ ] **ET-022** `Benchmark_ChangedPreset_InvalidatesComparison` — @critical
  - 目標／BDD：SC-055；AC-035；SPEC §13.9。
  - 前置：已核准AA/陰影等profile與改renderScale/硬體/透明比例/相機的反例；實際Player。
  - 動作：冷啟動/首次Acquire/熱載入分段計時含hash；執行暖30秒測60秒與UI操作，另故意先顯示占位mesh。
  - 預期：任一profile變更不混入舊結果，未凍結只探索；首幀截止必須正確mesh/material/texture且≤3秒，OS快取條件揭露，存原始幀及操作證據。
  - 證據：命令／步驟、fixture與pack/build版本、實際結果及失敗診斷；可見行為附實際畫面或錄影，涉及外觀需核准紀錄。缺設備或資產記為阻斷，不能skip後算通過。

## BDD → TDD 逐項追溯

| BDD | SPEC AC | TDD IDs |
|---|---|---|
| SC-001 | AC-001、AC-004 | UT-001、UT-002、UT-003、IT-001 |
| SC-002 | AC-002 | UT-004、UT-005、UT-006、IT-001 |
| SC-003 | AC-003 | UT-007、UT-008、UT-009、IT-001 |
| SC-004 | AC-004、AC-009、AC-010 | UT-010、UT-011、UT-012、IT-002 |
| SC-005 | AC-009、AC-017 | UT-013、UT-014、UT-015、IT-002、CT-005、ET-009 |
| SC-006 | AC-005、AC-007、AC-025 | UT-016、UT-017、UT-018、IT-003、ET-008 |
| SC-007 | AC-006、AC-024 | UT-019、UT-020、UT-021、IT-004、ET-008 |
| SC-008 | AC-008、AC-014 | UT-022、UT-023、UT-024、IT-004、CT-004 |
| SC-009 | AC-012、AC-014 | UT-025、UT-026、UT-027、IT-005 |
| SC-010 | AC-007 | UT-028、UT-029、UT-030、IT-003、ET-008 |
| SC-011 | AC-010 | UT-031、UT-032、UT-033、IT-006 |
| SC-012 | AC-011、AC-023 | UT-034、UT-035、UT-036、IT-007、CT-003、CT-006、ET-010 |
| SC-013 | AC-005、AC-007、AC-018 | UT-037、UT-038、UT-039、IT-003、ET-008 |
| SC-014 | AC-011、AC-025 | UT-040、UT-041、UT-042、IT-007、ET-010 |
| SC-015 | AC-015、AC-019 | UT-043、UT-044、UT-045、IT-008、CT-001、CT-002、CT-003、CT-004、CT-005 |
| SC-016 | AC-022、AC-025 | UT-046、UT-047、UT-048、IT-009、ET-006 |
| SC-017 | AC-022、AC-023 | UT-049、UT-050、UT-051、IT-010、ET-006 |
| SC-018 | AC-022、AC-023 | UT-052、UT-053、UT-054、IT-011、CT-007 |
| SC-019 | AC-018、AC-019、AC-021、AC-025 | UT-055、UT-056、UT-057、IT-012、CT-001、CT-006、CT-009、ET-005 |
| SC-020 | AC-015、AC-019 | UT-058、UT-059、UT-060、CT-002、CT-003、CT-009 |
| SC-021 | AC-001、AC-018 | UT-061、UT-062、UT-063、IT-013 |
| SC-022 | AC-010、AC-018 | UT-064、UT-065、UT-066、IT-006 |
| SC-023 | AC-009、AC-018、AC-023 | UT-067、UT-068、UT-069、IT-010、ET-007 |
| SC-024 | AC-019、AC-025 | UT-070、UT-071、UT-072、IT-012、CT-006 |
| SC-025 | AC-011、AC-023 | UT-073、UT-074、UT-075、IT-011、CT-007、CT-009、ET-007 |
| SC-026 | AC-018、AC-021、AC-025 | UT-076、UT-077、UT-078、IT-009、CT-001、CT-009、ET-005 |
| SC-027 | AC-004、AC-009、AC-017 | UT-079、UT-080、UT-081、IT-002、CT-005、ET-009 |
| SC-028 | AC-015、AC-019 | UT-082、UT-083、UT-084、IT-008、CT-002 |
| SC-029 | AC-006、AC-008、AC-020、AC-024 | UT-085、UT-086、UT-087、IT-004 |
| SC-030 | AC-009、AC-010、AC-018 | UT-088、UT-089、UT-090、IT-014 |
| SC-031 | AC-013、AC-014、AC-015 | UT-091、UT-092、UT-093、IT-005、CT-002 |
| SC-032 | AC-026 | UT-094、UT-095、UT-096、IT-015、CT-006、CT-008 |
| SC-033 | AC-016、AC-021、AC-025 | UT-097、UT-098、UT-099、IT-016、ET-001 |
| SC-034 | AC-015、AC-016 | UT-100、UT-101、UT-102、IT-016、ET-002 |
| SC-035 | AC-016 | UT-103、UT-104、UT-105、IT-016、ET-002 |
| SC-036 | AC-005、AC-007、AC-025 | UT-106、UT-107、UT-108、IT-017、ET-003 |
| SC-037 | AC-015、AC-016 | UT-109、UT-110、UT-111、IT-016、ET-002 |
| SC-038 | AC-016、AC-018、AC-025 | UT-112、UT-113、UT-114、IT-016、ET-004 |
| SC-039 | AC-016、AC-026 | UT-115、UT-116、UT-117、IT-015、ET-004 |
| SC-040 | AC-016、AC-026 | UT-118、UT-119、UT-120、IT-016、ET-004 |
| SC-041 | AC-016、AC-026 | UT-121、UT-122、UT-123、IT-015、CT-008、ET-004 |
| SC-042 | AC-016、AC-021 | UT-124、UT-125、UT-126、IT-016、ET-005 |
| SC-043 | AC-020 | UT-127、UT-128、UT-129、IT-018、ET-011 |
| SC-044 | AC-020、AC-025 | UT-130、UT-131、UT-132、IT-018、ET-012 |
| SC-045 | AC-020、AC-026 | UT-133、UT-134、UT-135、IT-018、ET-013 |
| SC-046 | AC-008、AC-024 | UT-136、UT-137、UT-138、IT-018、ET-014 |

| SC-047 | AC-027 | UT-139、UT-140、UT-141、IT-019、CT-010、ET-015 |
| SC-048 | AC-028 | UT-142、UT-143、UT-144、IT-020、IT-021 |
| SC-049 | AC-029 | UT-145、UT-146、UT-147、IT-022、ET-016 |
| SC-050 | AC-030 | UT-148、UT-149、UT-150、CT-011、IT-023、ET-017 |
| SC-051 | AC-031 | UT-151、UT-152、UT-153、IT-024、CT-012 |
| SC-052 | AC-032 | UT-154、UT-155、UT-156、CT-013、CT-014、IT-025 |
| SC-053 | AC-033 | UT-157、UT-158、UT-159、IT-026、IT-027 |
| SC-054 | AC-034 | UT-160、UT-161、UT-162、ET-018、ET-019、ET-020 |
| SC-055 | AC-035 | UT-163、UT-164、UT-165、ET-021、ET-022 |
| SC-056 | AC-036 | UT-166、UT-167、UT-168、IT-028、IT-029 |
## 📝 測試清單使用說明

### Step 1：確認可開發條件

先讀取[風險稽核報告](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md)及本文件末尾交接紀錄。原SDD、風險方案及補強SDD均已確認，BDD／TDD回寫完成，規劃狀態為 Ready for well-done。開始實作由使用者另行啟動 well-done；不降低全量、離線或真實畫面門檻。

### Step 2：依 SPEC 的風險優先順序執行

1. 原生套件與安裝原型先做最小 Red-Green-Refactor；依已確認SPEC第13.1～13.2節建立隔離Preview，先可安裝、可離線操作再擴大資產量。
2. 領域／來源／版本／座標／材質，逐項單元→集成→程式內契約。
3. 原生 UX 與資源釋放、實際安裝版流程、升級與故障。
4. 固定硬體效能及全量來源／逐模型品質。不要等到全部模型做完才第一次驗證套件能否打包。
5. 完成後由實作稽核追溯；本輪不自行開啟下一份 SPEC。

### Step 3：Red-Green-Refactor 與證據

每次先建立會因缺少功能而失敗的測試，最小實作使其通過，再重構。每個 UT／IT／CT／ET ID 記錄命令、環境、結果與實作位置。既有模板的80%覆蓋率不是本 SPEC 已確認的完成替代門檻，不得用數字覆蓋率代替233項驗收與全量模型。

### 畫面驗收證據要求

ET-001～ET-005 與 ET-012 提交可操作安裝包識別、實際 Player 截圖／錄影及操作結果；包含正常、載入、無結果、錯誤、快速換件及重試。ET-003 另附逐變體外觀／印刷來源對照，ET-012 附 FPS／frame time 原始數據。證據產物保存於後續 `artifacts/acceptance/<buildId>/<caseId>/`，不可把設計圖、AI概念圖或 Editor 圖冒充安裝版畫面。

ET-015～ET-022 同樣保存實際操作證據；ET-017僅人工存檔恢復harness，不把它稱為完整遊戲UI。ET-020須取得使用者對真實Player的畫面核准；ET-021／022須揭露硬體與profile差異。

## 📝 稽核記錄

2026-09-09：保留179基線測試，使用者已「全數同意 請繼續」風險方案並「確認」補強版SDD。10項缺漏已回寫SPEC §13／AC-027～036、BDD SC-047～056與54項TDD補強（30UT＋11IT＋5CT＋8ET）。合計168UT＋29IT＋14CT＋22ET＝233項，全部未執行；36/36 AC及56/56場景有文件追溯，非產品完成率。

文件驗證：已核對233個唯一且連續的測試ID、56個Given／When／Then場景及各至少3個UT、36個AC追溯、原179項測試ID／名稱保留、24個建議名稱全數追加、五份文件本機連結與Markdown空白。`git diff --check`通過（僅Git行尾轉換提示）；這些是文件檢查，不是Unity或遊戲測試。

## 規劃交接紀錄

**交接狀態**：Ready for well-done
**最後確認日期**：2026-09-09
**唯一開發目標／順序**：`SPEC-001-BrickModelCatalog`，MVP-001 第1順位；不得自行接續下一份SPEC。

### 文件包

| 類型 | 路徑 | 狀態 |
|---|---|---|
| MVP | [MVP-001-V1Version](../requirements/MVP-001-V1Version.md) | 已確認規劃基線；其餘模組尚未完成 |
| SPEC | [SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md) | 基線及第13節補強已確認，36個AC |
| BDD | [SPEC-001-BrickModelCatalog-BDD](../bdd/SPEC-001-BrickModelCatalog-BDD.md) | 56場景、20個@frontend，已生成並追溯 |
| TDD | [SPEC-001-BrickModelCatalog-TDD](SPEC-001-BrickModelCatalog-TDD.md) | 233項已補強；實作／執行0% |
| RiskAudit | [SPEC-001-BrickModelCatalog-RiskAudit](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md) | Q-001～003及補強SDD均已確認，10項缺漏已回寫 |

### 已確認風險

使用者先回覆「全數同意 請繼續」接受Q-001～003，再回覆「確認」接受具體SDD補強。以下接受的是處理方式與驗收門檻，不代表未取得的來源、軟體或硬體證據已存在。

| 風險 ID | 風險摘要 | 使用者決策 | 文件回寫位置 | 開發注意事項 |
|---|---|---|---|---|
| Q-001／GAP-001、002 | 首次畫面與全量發布互等 | 使用者接受：獨立Preview先行，不縮減全量需求 | SPEC §13.1～13.2；SC-047～048；IT-019～021、CT-010、ET-015 | Frozen先驗證，正式Release全量與CAS門檻仍在 |
| Q-002／GAP-008、009 | 外觀主觀與硬體不同 | 使用者接受：實際畫面先核准，探索與正式量測分開 | SPEC §13.8～13.9；SC-054～055；ET-018～022 | 尚無visualBaselineId或正式基準量測，不可假稱完成 |
| Q-003／GAP-003～007、010 | 更新、恢復、引用、輸入、資產與輪組缺口 | 已補回文件：依同意方案保留資料、精確拒絕及補測 | SPEC §13.3～13.7、13.10；SC-049～053、056及下表 | 本份只F-Save與有限輪組原型，無人物交易房屋或正式賽車 |
| RISK-001／002 | 全量來源與補模未取得 | 使用者接受：依Q-001分階段驗證，正式全量未完成不能結案 | SPEC §3.4、13.1；SC-001～006、013、027、047；ET-008、009、015 | Unknown不能當Active；無全球涵蓋證據不得稱全量 |
| RISK-003／004 | 接點及外觀識別 | 已補回文件：沿基線及Q-002／003加驗外觀與輪組 | SC-003、007～009、029、036、054、056；IT-004、005、017、029；ET-020 | 真實資產尺寸／材質核對，不能只有mock |
| RISK-005 | 來源使用條件未核實 | 使用者接受：Q-001規定逐資產可散布證據先於Preview納入 | SPEC §13.1；SC-010、013、047；IT-003、019 | 沒有來源／使用條件者不可散布，不推定商標授權 |
| RISK-006 | 全量包大小未知 | 使用者接受：全量仍需後續實測，不用子集合承諾大小 | SPEC §8.2、13.1；SC-029、043～045、047；ET-009、011～013 | 不刪必要歷史引用來縮包，超預算要記缺口 |
| RISK-007 | SDD確認 | 已補回文件：原SDD及第13節已明確確認 | 本紀錄、SPEC狀態與MVP階段紀錄 | 不再列為規劃阻斷 |
| RISK-008 | 原生套件相容未實測 | 使用者接受：Q-001原型優先驗證，未通過不能凍結發行工具鏈 | SPEC §2、13.2；SC-006、014、026、033、048；IT-020、ET-001、015 | 鎖定實際可用Editor、SQLite、glTFast、Addressables與URP版本後離線打包 |
| RISK-009／010／011 | 尺度、升級與效能 | 已補回文件：Q-002／003保留原門檻並增加具體驗收 | SPEC §13.3～13.4、13.9～13.10；SC-049、050、055、056 | 硬體不足不冒充正式通過，降版不覆蓋新進度 |

### 已補回缺漏

| 缺漏 ID | 缺漏來源 | 補入文件位置 | 補入項目 | 狀態 |
|---|---|---|---|---|
| GAP-001 | RiskAudit 第二節／AC-027 | SPEC §13.1；BDD SC-047；TDD UT-139、UT-140、UT-141、IT-019、CT-010、ET-015 | 隔離技術預覽與正式全量交付 | 已補回文件 |
| GAP-002 | RiskAudit 第二節／AC-028 | SPEC §13.2；BDD SC-048；TDD UT-142、UT-143、UT-144、IT-020、IT-021 | 先驗證Frozen候選再發布已驗證內容 | 已補回文件 |
| GAP-003 | RiskAudit 第二節／AC-029 | SPEC §13.3；BDD SC-049；TDD UT-145、UT-146、UT-147、IT-022、ET-016 | 更新與啟動共用互斥且身分穩定 | 已補回文件 |
| GAP-004 | RiskAudit 第二節／AC-030 | SPEC §13.4；BDD SC-050；TDD UT-148、UT-149、UT-150、CT-011、IT-023、ET-017 | 降版及備份失敗不擅自回退進度 | 已補回文件 |
| GAP-005 | RiskAudit 第二節／AC-031 | SPEC §13.5；BDD SC-051；TDD UT-151、UT-152、UT-153、IT-024、CT-012 | 完整模型引用與包身分必須一致 | 已補回文件 |
| GAP-006 | RiskAudit 第二節／AC-032 | SPEC §13.6；BDD SC-052；TDD UT-154、UT-155、UT-156、CT-013、CT-014、IT-025 | 輸入邊界與取消順序具有精確契約 | 已補回文件 |
| GAP-007 | RiskAudit 第二節／AC-033 | SPEC §13.7；BDD SC-053；TDD UT-157、UT-158、UT-159、IT-026、IT-027 | 實際檔案目標與新載入內容不可繞過驗證 | 已補回文件 |
| GAP-008 | RiskAudit 第二節／AC-034 | SPEC §13.8；BDD SC-054；TDD UT-160、UT-161、UT-162、ET-018、ET-019、ET-020 | 真實畫面基準、繁中字型與原生失敗通知 | 已補回文件 |
| GAP-009 | RiskAudit 第二節／AC-035 | SPEC §13.9；BDD SC-055；TDD UT-163、UT-164、UT-165、ET-021、ET-022 | 不同硬體及品質設定不可冒充基準效能 | 已補回文件 |
| GAP-010 | RiskAudit 第二節／AC-036 | SPEC §13.10；BDD SC-056；TDD UT-166、UT-167、UT-168、IT-028、IT-029 | 輪組單位、未知質量與配對原型可核對 | 已補回文件 |

共10項（高6、中4），新增10個BDD場景與54項TDD；原179項定義與編碼保留。原建議24個測試名稱全數落入各層，其餘30項確保每場景至少3個獨立單元測試。文件追溯36/36 AC、56/56場景；所有測試仍未執行。

### 實作注意事項

- 先用最小Red-Green-Refactor驗證原生相依、Frozen staging、離線安裝及隔離Preview。以真實代表模型交出可旋轉／縮放／換件的Player，先讓使用者驗收畫面；不等待全量模型齊備才首次封裝。
- Preview含普通磚、板、透明、印刷人物、Technic插銷／軸、DUPLO及非對稱代表，可重疊；逐件Ready及RuntimeBuild證據不可省略，未知生產狀態明示待查，已知停產排除。
- Preview及Release的包身分、資料根與安裝捷徑分開，僅透過原生啟動器進入，更新與啟動共用生命週期鎖。玩家不需Editor、Blender、Python、伺服器或網路。
- 233案例逐一留Red／Green／Refactor、命令與證據；unit綠燈不替代實際模型／Player。人工畫面驗收可以重跑程序留證，不可無聲skip。
- 正式人物、2026片發放、模擬訂單交易、建屋、玩家還原UI及完整MVP-002賽車留各自SPEC。本份F-Save只用人工測試資料，禁止故障注入使用者正式存檔。
- 若實作發現新契約變更或確實無法完成既定門檻，回報具體證據與缺口，不擅自換引擎、縮減來源、改硬體基準或新增線上服務。

### 不得進入開發的阻斷項

無（規劃層級）。所有必需決策與文件補強均已完成；本紀錄是交接，不是已開始實作。

### 不得宣告正式交付的開發驗收門檻

| 門檻 | 目前狀態／解除證據 |
|---|---|
| 全量未停產來源與逐資產使用／品質 | 未取得完整證據；需SPEC §3.4與ET-009實際通過，Preview不得代替 |
| 可安裝離線原生相依與工具鏈鎖版 | 尚無Unity專案或Player；需原型安裝、正常／故障及包依賴驗證 |
| 代表畫面核准及繁中可讀性 | 尚無實際畫面；ET-018～020提交Player六視圖／操作錄影並記錄使用者核准visualBaselineId |
| 固定Medium profile及正式硬體效能 | AA／陰影隨畫面核准鎖定；Iris Xe只探索，ET-021／022與原效能案例需正式證據 |
| 精確引用、更新／備份／降版與輪組 | 僅文件定義；依本233案例執行並由後續實作稽核逐項核對 |

下一步由使用者啟動 `well-done` 接手本文件包；perfect-plan於此停止，不建立下一份SPEC。
