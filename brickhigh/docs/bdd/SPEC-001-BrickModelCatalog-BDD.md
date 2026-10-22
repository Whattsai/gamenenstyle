# SPEC-001-BrickModelCatalog 指定盒組積木模型庫 — BDD 場景規格

> **SPEC 來源**：[SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md)
> **需求來源**：[MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
> **生成日期**：2026-09-09
> **確認依據**：原 SDD「好 繼續」、風險方案「全數同意 請繼續」、補強版 SDD「確認」（2026-09-09）。
> **狀態**：2026-10-21 Gate 3 固定20件隔離QA技術里程碑完成，可移交Gate4擴大真實指定盒組與來源驗收；Gate3 QA Ready20/20、真Windows安裝／Player矩陣30/30，正式來源正例9/9 RuntimeBuild／Player／獨立verify通過，其餘11件仍未取得官方身分，不能混同正式Release。BDD已逐項對照為13/56（2026-10-22）、UX1/20，完整產品SPEC驗收未完成。正式來源、Preview及Release門檻保持§§3.4、13.1～13.2不變。

**2026-10-21 Gate 3／Gate 4 階段驗收分離（使用者決議）**：Gate3只對固定20件建模技術與Player操作品質做隔離QA的20/20驗收，另對可確認官方來源的9件保留真正後繼Catalog／Frozen／RuntimeBuild／真Windows Player／獨立verify正例；沒有來源的QA樣本不能當官方Element、合格Preview或Release。QA內部Player完整安裝、更新、唯讀與故障矩陣須以真Job證據通過才可判定Gate3里程碑完成，**不將20件QA包稱為20件正式RuntimeBuild**。Gate4才對使用者指定盒組的完整inventory、真實Element／可選Design／顏色印刷模具、同型去重、擴充模型數量及指定硬體效能做完整驗收；正式發布C/G/V、來源資格與SPEC §13.1～13.2完全不放寬。此為階段分工修訂，**原56個BDD場景、20個UX和正式逐項完成條件不刪減／不自動勾選**；完整證據與Gate3是否可結案見TDD最新。

**2026-10-19 Gate 2 最新決策**：固定20件是與特定盒組無關的幾何／接合品質樣本；`10334` 為指定盒組範例，與該盒組 part+color 不重疊不能阻塞 Gate 2。依來源逐軸 `max(0.1mm, 0.5%)` 尺寸容差及已驗證真 Unity 接點／碰撞 fixtures 判定 `gate2Ready`；正式 Catalog revision Ready／`visualBaselineId`、Preview／Release 與整份 BDD 的完成數獨立處理。本變更不削減發布或後續完整驗收要求。

**2026-10-18 驗證同步**：Catalog **234/234**（`69102445-b0dc-4b0f-a5f2-de6dfdfe1552`）、Acceptance **70/70**（`f11eec41-e20a-4f8a-9adf-bca314377957`）、完整 Python **304/304 passed / exit 0**（`798f4d27-95ca-4a42-9afe-a9f33467dd10`）、.NET Core.Tests **168/168**（`61379679-bc26-45c4-b4c3-5814aee03d93`）、netstandard compatibility build **exit 0**（`114c77bc-b0c6-4848-bf6b-8ad2e5641f94`）。僅更新回歸證據，TDD **110/233**、BDD **11/56**、UX **1/20**、SPEC **3/36**、fixed20 **Ready 0/20** 不變，仍不進 Gate 3。 完整測試通過不自動勾選 BDD／UX 場景。


**2026-10-22 跨文件勾選稽核**：56個獨立SC各一個checkbox，9件既有勾選＋4件有完整對應TDD證據而漏勾的SC-008/020/028/029，共**13/56**；UX SC-033～042等合計20場景僅SC-037勾選，**1/20**。以本頁現行勾選為準，2026-10-18等舊文字為歷史快照，不得覆蓋最新數字；整份SPEC及Preview/Release仍未結案。

## 📝 Feature 描述

**Feature**：指定 LEGO 盒組驅動的積木模型庫、原生模型預覽及離線資產交付。

作為模型維護者與驗收者，我想要核對每個零件的來源、品質與版本，並在實際安裝的 Unity Player 中操作預覽，以便後續人物、庫存、建屋及車輛能共用可靠資產。

本文件是需求與 UX checklist，不是 SpecFlow 可執行測試。保留模板結構；原網頁元件改成 Unity 場景／uGUI，網路服務失敗只屬開發端來源取得。安裝版不要求 HTTP、帳號或連線。
正式全量發布仍受 SPEC §3.4 限制；正式分母改為「已指定盒組集合展開後的唯一 authoritative LEGO Element identity」，Design ID 在官方有提供時作 geometry dedup provenance，未公開時以 Element fallback；以下受控 fixtures 僅用於測試，不能假稱已完整取得指定盒組清單。SPEC 第13節已確認，新增 SC-047～056 與原基線合併適用；早期 Preview 不解除正式 Release 的完整指定盒組門檻。

2026-09-13歷史紀錄（不作目前狀態）：SC-033、034、037～040 已有 `Application/CatalogPreviewPresenter.cs`、`RetryRequestPolicy.cs` 及 `UnityRuntime/CatalogPreviewController.cs` 的狀態／本機協調實作（相對 `game/Assets/BrickHigh/`），單元規則與真實 SQLite 搜尋已測。SC-035 新增 `Application/PreviewOrbitPolicy.cs` 與 `UnityRuntime/PreviewCameraController.cs`：環繞、縮放、重設、窄長寬比取景，以及所屬 EventSystem 的文字焦點隔離。SC-041 僅部分離開與晚到結果處理；尚無完整 uGUI、字型、畫面自有 render texture、安裝操作證據，因此不勾選場景或 UX。以下場景元件的「預計」文字為原規劃基線，現況以2026-09-27矩陣及 TDD 為準。

## 🎯 前端 UX 實作進度

2026-10-10：SC-001～003 已統一為指定盒組／authoritative Element identity／optional Design geometry 契約。現行實作與測試以 `tools/catalog/importing.py`、`test_sc_001.py`～`test_sc_003.py`、`test_source_import.py` 與 `test_catalog_resolve.py` 為準。

2026-09-25歷史紀錄（續）：SC-033～042／047的畫面已有`Presentation/CatalogPreviewView.cs`及內部入口。本輪修正直式來源狀態順序與1080p清單列池不足，`wd-20260925-ui-final.xml`為126 passed。新build `20260925T102722-7366c2b9`經原生安裝器及launcher成功啟動，`artifacts/acceptance/wd-20260925-interactive-c/run.json`保留8模型操作與154張Player畫面；`PlayerEvidence/frames/frame00153.png`已檢視直式狀態與文字。這是F-Catalog內部幾何證據，readyAsset=false、visualApproved=false；完整鍵盤／錯誤矩陣、逐資產品質及使用者畫面核准仍未完成，因此不勾選完整UX場景。

### 整體進度

**2026-10-22最新核對**：目前以 TDD **111/233（47.6%）** 為實作主進度，36 個 AC、56 個 BDD 場景與 20 個 UX 項目仍採完整 Given／When／Then 才升格。Gate 2 固定20件已完成 20/20 collision 與 acceptance preview evidence；原8件另以真 `CatalogRepository`／`ObjectStore` 建立 8/8 acceptance-only successor revisions，全部維持 Validating／未選定／`visualApproved=false`，未改寫 legacy revision，也不等同正式 Ready 視覺基準。目錄 scope 與 Ready／發布只依指定盒組 identity、C/G/V 與逐件品質證據判定。完整證據見 [TDD 本輪紀錄](../tdd/SPEC-001-BrickModelCatalog-TDD.md)。

**2026-10-22逐項核對**：BDD真實勾選為 **13/56（23.2%）**，未完整勾選43。除原先9件已勾場景，新增追認SC-008、SC-020、SC-028、SC-029（所有列出的對應TDD已勾選、對應完整Given／When／Then），不是新增測試項目。UX仍僅 **1/20（5.0%）**；場景完成不等於完整AC或指定盒組的正式發布門檻通過。

```text
SPEC-001-BrickModelCatalog 原生預覽 UX
進度條：[█░░░░░░░░░░░░░░░░░░░] 5.0% (1/20)
狀態：本輪增量稽核完成；逐件 Ready 與正式來源待補
最後更新：2026-10-03
```

### 分頁面／元件進度

| 頁面／元件 | 進度 | 已符合 | 部分符合 | 未符合 |
|---|---|---|---|---|
| SC-033～042 模型預覽／錯誤／輸入 | 10.0% | 1/10 | 9 | 0 |
| SC-043、044、046 畫面與輪組量測 | 0.0% | 0/3 | 1 | 2 |
| SC-047、049、050、052、054～056 補強UX | 0.0% | 0/7 | 6 | 1 |
| 合計 | 5.0% | 1/20 | 16 | 3 |

### SPEC 前端覆蓋率

| 指標 | 數值 | 狀態 |
|---|---|---|
| 直接涉及畫面的驗收條款 | AC-005、007、016、020、021、024、025、026、027、029、030、032、034、035、036，共15項 | 已逐項對照 |
| BDD 有對應 @frontend 場景 | 15/15（100%） | 僅文件追溯，不代表畫面完成 |
| 前端場景 | 20 | 1已符合、16部分符合、3未符合 |
| 全部場景（46基線＋10補強） | 56 | **13已符合、43未完整勾選**（部分／未符合不以勾選自動推算） |
| 新增SPEC條款 AC-027～036 | 10/10有場景與測試規劃 | 已逐項稽核，均未完整驗收 |

AC-015／018／019／022／023 另由操作、錯誤與安裝測試交叉涵蓋；不把其他 MVP 的人物／建屋 UI 算成本文件已覆蓋。

## 📋 Background（前置條件）

```gherkin
Feature: 本機積木目錄與真實三維預覽
  Background:
    Given 本輪只驗收 SPEC-001-BrickModelCatalog
    And 玩家執行環境為 Windows x64 Unity 6.3 LTS 與 URP
    And 受控測試資料與正式全量來源的身分清楚分離
    And 除明列開發端來源取得外流程不依賴網路
```

| 資料組 | 用途 | 禁止誤用 |
|---|---|---|
| F-Catalog | 指定盒組／Element ID／Design ID／101筆分頁／衝突資料 | 不當作真實指定盒組清單 |
| F-Geometry | 非對稱、印刷、透明、六部位、接點正反例 | 不以占位方塊當成完成模型 |
| F-Save | 人工 profile／schema／舊ModelReference | 不宣稱已實作玩家庫存與人物資料表 |
| F-Performance | 實際2026片、8類幾何、固定20件切換、輪組 | 不宣稱代表所有未來賽道場景 |
| Release-Catalog | 使用者已指定盒組集合的完整 inventory、authoritative Element 身份與資產 | 缺 Element identity、geometry provenance（authoritative Design 或 Element fallback）或資產時阻斷，不以測試資料替代 |

## 基線與補強的合併適用規則

- SC-005／027 的全量門檻與 SC-033 的「模型預覽」正式包流程保留；SC-047 是獨立且明確標示的技術預覽，不得以其通過勾選正式全量案例。
- SC-004／006／014 的建置前置依 §13.2：Frozen staging 驗證 → 合格 Preview 或通過全量與摘要核對後 Published → 正式封裝，不能要求驗證前先發布。
- SC-016～018／023／025 的更新、備份及相容性合併 SC-049～051；本份只用人工 F-Save 與恢復 harness，未包含正式人物／庫存／還原 UI。
- SC-020／028／032 的輸入、取消、載入保護合併 SC-052／053；具體錯誤碼與字串以 §13.5～13.7 為準。InvalidQuery：「查詢條件無效，請調整後重試。」；InvalidCursor：「清單位置已失效，請重新搜尋。」。
- SC-035／036／042～046 的可見外觀、啟動通知、效能與輪組合併 SC-054～056；無核准畫面或指定硬體不得用模擬結果宣稱通過。

## ✅ Happy Path — 正常流程

### SC-001 @happy-path @critical

- [x] **Scenario: 保存跨來源基準及涵蓋證據**
  - SPEC 對應：§3.1–3.4；AC-001、AC-004。
  - 涉及元件：`CatalogCoveragePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-001、UT-002、UT-003、IT-001。

```gherkin
@happy-path @critical
Scenario: SC-001 保存跨來源基準及涵蓋證據
  Given 具完整分頁／hash 的跨系列來源與基準日 2026-09-08，另有一個缺頁來源
  When 維護者匯入並核對候選集合
  Then 完整來源保留 artifact、hash、observedAt 與有效日期
  And System、Technic、DUPLO、人物組件及其他系列均列入涵蓋表，套裝展開與附件排除有理由
  And 缺頁來源產生未解決 G，不宣稱來源完整
```

### SC-002 @happy-path @critical

- [x] **Scenario: 分離 LEGO Design ID、Element ID 與顏色身份**
  - SPEC 對應：§3.3；AC-002。
  - 涉及元件：`CatalogRepository` 的 geometry identity、variant identity 與外部別名。
  - TDD 對應：UT-004、UT-005、UT-006、IT-001。

```gherkin
@happy-path @critical
Scenario: SC-002 分離 LEGO Design ID、Element ID 與顏色身份
  Given 同一 LEGO Design ID 有不同顏色的 Element ID，另有同顏色重新出現的 Element ID
  When 維護者匯入指定盒組 inventory 並建立幾何零件與外觀變體
  Then 同一 Design ID 重用同一 geometry part，不重複建立幾何身份
  And 不同顏色 Element ID 保留為不同外觀／Element 身份，但可共用同一 Design 幾何
  And 同一 Design 與同一外觀再次出現時重用既有 variant，不因盒組內重複數量而重複建模
```

### SC-003 @happy-path @critical

- [x] **Scenario: 保留實際外觀變體、Element 別名及穩定識別**
  - SPEC 對應：§4.1、5.2；AC-003。
  - 涉及元件：`VariantIdentityPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-007、UT-008、UT-009、IT-001。

```gherkin
@happy-path @critical
Scenario: SC-003 保留實際外觀變體、Element 別名及穩定識別
  Given 同 Design 幾何有兩顏色與兩印刷 Element，另有外部 ID 的矛盾映射
  When 維護者建立 geometry part、外觀 variant 與 LEGO Element／來源別名
  Then 只建立指定盒組 inventory 實際觀測到的組合，不做所有顏色笛卡兒積
  And 顏色／印刷／材質納入 VariantKey，LEGO Element ID 保留為可追溯別名，內部 ID 永不重新分配
  And 矛盾外部 ID 隔離為衝突，不能直接合併
```

### SC-004 @happy-path @critical

- [ ] **Scenario: 凍結分母與狀態生命週期**
  - SPEC 對應：§3.4、4.2、5.2；AC-004、AC-009、AC-010。
  - 涉及元件：`SnapshotLifecycle`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-010、UT-011、UT-012、IT-002。

```gherkin
@happy-path @critical
Scenario: SC-004 凍結分母與狀態生命週期
  Given Draft 有已記錄的候選、證據、分類與規則
  When 維護者 freeze 後建模，再嘗試修正判定
  Then Frozen 不允許改分母／證據／分類，修正須新 Draft
  And 建模依 Pending、Building、Validating、Ready 流轉，失敗成 Failed
  And Frozen 可更新所選 revision 並遞增 version，Published 不可改
```

### SC-005 @happy-path @critical @smoke

- [ ] **Scenario: 指定盒組全集發布與逐項完成證據**
  - SPEC 對應：§3.4、8.1；AC-009、AC-017。
  - 涉及元件：`CatalogCoveragePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-013、UT-014、UT-015、IT-002、CT-005、ET-009。

```gherkin
@happy-path @critical @smoke
Scenario: SC-005 指定盒組全集發布與逐項完成證據
  Given 使用者已指定盒組集合，inventory 已完整展開且 C>0、G=0、V=C，沒有 LEGO 身份／分類／品質／映射缺口
  When 維護者要求正式發布
  Then Ready 變體逐一與指定盒組展開後的唯一 Element／Design 分母對應
  And 報告列出所有指定盒組實際元素的來源、Design/Element 身份與品質證據，不混入 fixtures
  And 僅全部門檻通過可切換 Published，單一門檻失敗維持舊 head
```

### SC-006 @happy-path @critical

- [ ] **Scenario: 驗證真實 GLB 與 Unity 產物**
  - SPEC 對應：§4.2、8.1；AC-005、AC-007、AC-025。
  - 涉及元件：`ModelValidationService`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-016、UT-017、UT-018、IT-003、ET-008。

```gherkin
@happy-path @critical
Scenario: SC-006 驗證真實 GLB 與 Unity 產物
  Given 代表普通磚、薄板、透明件、印刷人物、Technic 及 DUPLO 的來源已具備
  When 轉換並檢驗各模型及 RuntimeBuild
  Then GLB 自含 mesh／buffer／紋理且 Validator 無 error，warning 有處理記錄
  And 空 mesh、占位方塊、缺紋理、遺失印刷或粉紅 shader 均驗證失敗
  And Player 實際載入全部交付 RuntimeBuild 的結果逐一留存
```

### SC-007 @happy-path @critical

- [ ] **Scenario: 保持來源尺寸與非對稱方向**
  - SPEC 對應：§4.3；AC-006、AC-024。
  - 涉及元件：`CoordinatePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-019、UT-020、UT-021、IT-004、ET-008。

```gherkin
@happy-path @critical
Scenario: SC-007 保持來源尺寸與非對稱方向
  Given 非對稱模型含 LDraw 點 (20,-24,10)、方向、切線、接點及尺寸
  When 轉成 canonical 再匯入 Unity
  Then canonical 點為 (0.008,0.0096,-0.004) 公尺，GLB root scale 為 1
  And Unity 目標點為 (0.008,0.0096,0.004)，旋轉以 M R M^-1 轉換
  And 網格／法向／切線手性／面繞序／metadata 一致，匯入器既有轉換不重複鏡像
```

### SC-008 @happy-path @critical

- [x] **Scenario: 接點配對與碰撞空腔**
  - SPEC 對應：§4.3；AC-008、AC-014。
  - 涉及元件：`ConnectorCompatibility`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-022、UT-023、UT-024、IT-004、CT-004。
  - **2026-10-22 勾選稽核**：對應UT-022/023/024、IT-004、CT-004逐項已勾選且覆蓋本場景的 Given／When／Then；保留完整驗收證據於TDD原測試ID，本次僅修正BDD漏勾，不增加TDD測試數。

```gherkin
@happy-path @critical
Scenario: SC-008 接點配對與碰撞空腔
  Given 有 stud/tube、pin/hole、axle、clip/bar、ball/socket 及不同系列反例
  When 驗證配對與插入後的碰撞
  Then 合法 profile 對及自由度可核對，不由同名 family 推定相容
  And 插接空腔不被整體包圍盒封死，插入 fixture 可成立
  And 需要接合的零件缺接點時不 Ready；無接點裝飾件可附理由
```

### SC-009 @happy-path @critical

- [ ] **Scenario: 人物與建屋候選資料可供後續使用**
  - SPEC 對應：§4.4；AC-012、AC-014。
  - 涉及元件：`UsageClassification`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-025、UT-026、UT-027、IT-005。

```gherkin
@happy-path @critical
Scenario: SC-009 人物與建屋候選資料可供後續使用
  Given 已分類零件涵蓋基本人物六部位與同一建造系統
  When 產生人物及建材候選投影
  Then 頭、身體、手、腳、頭飾、手上裝備各至少一個相容 Basic 候選
  And floor、wall、roof、opening 候選均可在同系統接合
  And 缺部位、用途或分類時報告缺口，不發放積木或宣稱房屋完成
```

### SC-010 @happy-path @critical

- [ ] **Scenario: 每個外觀版本保留品質與來源記錄**
  - SPEC 對應：§4.2、5.4、8.1；AC-007。
  - 涉及元件：`RevisionManifestPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-028、UT-029、UT-030、IT-003、ET-008。

```gherkin
@happy-path @critical
Scenario: SC-010 每個外觀版本保留品質與來源記錄
  Given 同幾何有不同顏色及印刷 revision
  When 維護者彙整輸出 manifest
  Then 每變體有六視圖與對照來源，不能只用同幾何一張圖代替
  And 原始／輸出 hash、作者／授權、製作工具與來源版本完整
  And RuntimeBuild 另留 Editor、套件鎖定、coordinateProfile 與驗證 digest
```

### SC-015 @happy-path @critical

- [x] **Scenario: 單一 session 的共用查詢契約**
  - SPEC 對應：§6.1–6.2；AC-015、AC-019。
  - 涉及元件：`BrickCatalog`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-043、UT-044、UT-045、IT-008、CT-001、CT-002、CT-003、CT-004、CT-005。

```gherkin
@happy-path @critical
Scenario: SC-015 單一 session 的共用查詢契約
  Given 完整已發布的本地 pack 含名稱、用途、接點與覆蓋資料
  When 呼叫 OpenAsync、QueryAsync、GetVariantAsync、GetProfilesAsync、GetCoverageAsync
  Then 全部回應固定 pack／snapshot／schema 並用 Success 或 Failure 擇一
  And 詳情包含所選來源 revision、用途／錨點／車輛 metadata，規則與覆蓋值均來自同快照
  And 只經本地資料與程式內方法取得，不啟動 HTTP 或變動擁有權
```

## 🔀 Alternative Path — 替代流程

### SC-011 @alternative-path @critical

- [x] **Scenario: 新增盒組零件及冪等重建**
  - SPEC 對應：§4.2、5.2、6.3；AC-010。
  - 涉及元件：`RevisionBuildPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-031、UT-032、UT-033、IT-006。

```gherkin
@alternative-path @critical
Scenario: SC-011 新增盒組零件及冪等重建
  Given 已有 Published，使用者再指定一個含新 LEGO Element／Design 的盒組及同工作鍵重試
  When 以相同 catalog baseline 建立後繼快照、展開新盒組 inventory 並重跑工作
  Then 新盒組帶入的唯一 Element／Design 只進入後繼快照，舊快照保持不變
  And 同鍵同輸入重用成功結果，同鍵不同輸入回衝突 exit 5
  And 修改模型／metadata／製作工具產生新 source revision，不重用舊內容
```

### SC-012 @alternative-path @critical

- [ ] **Scenario: 更新後仍能讀取舊模型引用**
  - SPEC 對應：§5.3、6.5；AC-011、AC-023。
  - 涉及元件：`ModelReferenceResolver`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-034、UT-035、UT-036、IT-007、CT-003、CT-006、ET-010。

```gherkin
@alternative-path @critical
Scenario: SC-012 更新後仍能讀取舊模型引用
  Given 存檔 fixture 引用舊 snapshot／variant／revision，而目前指定盒組集合已不再包含該 Element／Design
  When 以精確引用解析資產並查詢目前指定盒組清單
  Then 舊引用取得對應的相容 RuntimeBuild，不自動改成最新 revision
  And 舊名稱／分類從凍結投影取得，不 join 最新可變資料
  And 不在目前指定盒組集合中的舊模型不進入新清單，但既有精確引用仍可載入
```

### SC-013 @alternative-path @critical

- [ ] **Scenario: 來源缺件時補建而不以占位品交付**
  - SPEC 對應：§4.2、8.3；AC-005、AC-007、AC-018。
  - 涉及元件：`ModelBuildPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-037、UT-038、UT-039、IT-003、ET-008。

```gherkin
@alternative-path @critical
Scenario: SC-013 來源缺件時補建而不以占位品交付
  Given LDraw 缺子模型、TEXMAP 或曲面支援
  When 維護者嘗試自建／補建並重新驗證
  Then 未支援來源先列 Failed 與原因，不當作完成
  And 補建保留尺寸／外觀來源及新 revision
  And 只有補件後同一品質門檻全部通過才可 Ready
```

### SC-014 @alternative-path @critical

- [ ] **Scenario: 引擎升版重建執行期資產**
  - SPEC 對應：§5.3、6.5；AC-011、AC-025。
  - 涉及元件：`RuntimeBuildPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-040、UT-041、UT-042、IT-007、ET-010。

```gherkin
@alternative-path @critical
Scenario: SC-014 引擎升版重建執行期資產
  Given source revision 未變但 Editor／URP／套件鎖定或平台改變
  When 重新製作 RuntimeBuild 映射
  Then source revision 保留，RuntimeBuild 身分隨建置輸入改變
  And 每個受支援舊引用映射到當前可載入產物
  And 不以保留舊 bundle 檔案當作相容驗證成功
```

### SC-016 @alternative-path @critical

- [x] **Scenario: 唯讀安裝與本機資料分離**
  - SPEC 對應：§5.3、6.4；AC-022、AC-025。
  - 涉及元件：`LocalStoragePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-046、UT-047、UT-048、IT-009、ET-006。

```gherkin
@alternative-path @critical
Scenario: SC-016 唯讀安裝與本機資料分離
  Given 一般使用者安裝於唯讀目錄且有獨立 Profiles 與 Diagnostics
  When 啟動、查詢並寫入診斷紀錄
  Then catalog.db 以唯讀開啟且不產生安裝目錄 WAL／SHM
  And 可變資料只寫使用者可寫位置，不寫來源工具工作區
  And 診斷不含金鑰／完整存檔且不自動上傳
```

### SC-017 @alternative-path @critical

- [ ] **Scenario: 離線升級成功及解除安裝保留資料**
  - SPEC 對應：§6.5；AC-022、AC-023。
  - 涉及元件：`InstallUpdatePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-049、UT-050、UT-051、IT-010、ET-006。

```gherkin
@alternative-path @critical
Scenario: SC-017 離線升級成功及解除安裝保留資料
  Given 遊戲已退出，舊 profile fixture 與版本 A 安裝完整
  When 以完整包安裝 B，重新啟動後預設解除安裝
  Then B 完整 staged 且 hash 通過才切換啟動版本
  And 安裝器與解除安裝不修改或刪除原 profile fixture
  And 重開依新 session 映射舊模型，無額外登入或下載
```

### SC-018 @alternative-path @critical

- [ ] **Scenario: 一致備份與失敗交易恢復**
  - SPEC 對應：§6.5；AC-022、AC-023。
  - 涉及元件：`SaveTransactionPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-052、UT-053、UT-054、IT-011、CT-007。

```gherkin
@alternative-path @critical
Scenario: SC-018 一致備份與失敗交易恢復
  Given 人工存檔 fixture 的 DB 與不可變組裝檔已有一致引用
  When 執行一致備份及帶故障注入的 migration／引用更新
  Then backup 完成後才開始 migration，備份可獨立讀回
  And 交易失敗時 rollback，保留原 schema／資料與最後完整備份
  And 組裝新檔先完整寫入再切 DB 引用，不引用不存在或半寫檔
```

## ❌ Error Handling — 錯誤處理

### SC-019 @error-handling @critical

- [ ] **Scenario: 缺漏或損毀安裝包不假裝成功**
  - SPEC 對應：§6.2、6.4、8.3；AC-018、AC-019、AC-021、AC-025。
  - 涉及元件：`CatalogStartup`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-055、UT-056、UT-057、IT-012、CT-001、CT-006、CT-009、ET-005。

```gherkin
@error-handling @critical
Scenario: SC-019 缺漏或損毀安裝包不假裝成功
  Given 必要 manifest／DB／bundle 分別缺失或 hash 不符
  When 啟動或載入對應模型
  Then 缺目錄回 CatalogNotInstalled，缺模型回 AssetMissing，hash 錯誤回 AssetCorrupt
  And 模型缺失文案為「此模型檔案不完整，請使用完整安裝包修復。」並提供診斷 ID
  And 不下載替代資產、不顯示占位成功、不刪除既有存檔
```

### SC-020 @error-handling @critical

- [x] **Scenario: 非法查詢與不存在變體有明確結果**
  - SPEC 對應：§6.1–6.2；AC-015、AC-019。
  - 涉及元件：`VariantQueryValidator`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-058、UT-059、UT-060、CT-002、CT-003、CT-009。
  - **2026-10-22 勾選稽核**：對應UT-058/059/060、CT-002/003/009逐項已勾選且覆蓋本場景的 Given／When／Then；保留完整驗收證據於TDD原測試ID，本次僅修正BDD漏勾，不增加TDD測試數。

```gherkin
@error-handling @critical
Scenario: SC-020 非法查詢與不存在變體有明確結果
  Given 含非法 enum、無效 UUID、未知有效 UUID 或跨條件 cursor 的查詢
  When 呼叫共用查詢契約
  Then 非法查詢回 InvalidQuery，找不到的有效 ID 回 VariantNotFound
  And 跨條件或快照 cursor 回 InvalidCursor，不重設到第一頁
  And 錯誤與正常值不並存，錯誤中不出現 SQL 或堆疊
```

### SC-021 @error-handling @critical

- [x] **Scenario: 來源中斷與限流保留進度**
  - SPEC 對應：§6.3、8.3；AC-001、AC-018。
  - 涉及元件：`SourceRetryPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-061、UT-062、UT-063、IT-013。

```gherkin
@error-handling @critical
Scenario: SC-021 來源中斷與限流保留進度
  Given 來源遇到 timeout、429 含 Retry-After 或服務中斷
  When 製作工具依保存工作重試
  Then 遵守 Retry-After 並最多自動重試 3 次，超限保留待恢復
  And 失敗不清空成功候選，也不把缺資料當成已解析完成的 LEGO Element／Design 身份
  And 來源憑證不寫 URL／日誌，工具失敗 exit 4
```

### SC-022 @error-handling @critical

- [x] **Scenario: 建模工作當機與重複工作鍵**
  - SPEC 對應：§6.3、8.3；AC-010、AC-018。
  - 涉及元件：`CatalogJobPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-064、UT-065、UT-066、IT-006。

```gherkin
@error-handling @critical
Scenario: SC-022 建模工作當機與重複工作鍵
  Given 單項超過 10 分鐘、worker 當機或重跑已有成功輸入
  When 工具處理失敗並恢復工作
  Then 當機／timeout 項目為 Failed，不影響其他獨立項目
  And 已完成且 input hash 相同的項目不重複製作
  And 過期租約可恢復，同工作鍵不同輸入回 exit 5，status 提供工作原因
```

### SC-023 @error-handling @critical

- [ ] **Scenario: 發布及安裝切換失敗保留舊版本**
  - SPEC 對應：§5.4、6.5；AC-009、AC-018、AC-023。
  - 涉及元件：`AtomicPublishPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-067、UT-068、UT-069、IT-010、ET-007。

```gherkin
@error-handling @critical
Scenario: SC-023 發布及安裝切換失敗保留舊版本
  Given staging、檔案搬入、DB commit 或安裝驗證可注入空間不足與中斷
  When 執行發布或離線更新
  Then 檔案或 hash 失敗不得切 head／可啟動版本
  And DB 失敗回滾且不自動刪除可能仍需使用的內容
  And 原版本與原存檔保持可回復，提示「更新未完成，已保留原版本與存檔。」
```

### SC-024 @error-handling @critical

- [ ] **Scenario: 拒絕越界內容與不應隨包的工具**
  - SPEC 對應：§5.4、6.3–6.4、8.3；AC-019、AC-025。
  - 涉及元件：`ContentPathPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-070、UT-071、UT-072、IT-012、CT-006。

```gherkin
@error-handling @critical
Scenario: SC-024 拒絕越界內容與不應隨包的工具
  Given manifest 含 ../、絕對路徑、外部 GLB URI 或遠端 Addressables；另有含憑證的 draft
  When 執行來源匯入與 Player 打包檢查
  Then 任意外部路徑與越界壓縮成員拒絕，不在目標範圍外寫入
  And Player 只解析本地 address key，遠端 catalog／自動查更新使建置失敗
  And draft、來源 adapter、維護 CLI 及來源金鑰不進入安裝包
```

### SC-025 @error-handling @critical

- [ ] **Scenario: 未知存檔版本與缺舊映射保留原檔**
  - SPEC 對應：§6.2、6.5；AC-011、AC-023。
  - 涉及元件：`SaveCompatibilityChecker`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-073、UT-074、UT-075、IT-011、CT-007、CT-009、ET-007。

```gherkin
@error-handling @critical
Scenario: SC-025 未知存檔版本與缺舊映射保留原檔
  Given SaveHeader 比 reader 新、assetContract 不符或 requiredModels 缺映射
  When 呼叫 ISaveCompatibilityChecker.Check
  Then 未知 schema 回 UnsupportedSchema，不覆寫存檔
  And 缺映射／不相容內容回 IncompatibleContent，不改用最新模型
  And 文案為「此存檔與目前版本不相容，原存檔已保留。」並列可定位診斷
```

### SC-026 @error-handling @critical

- [ ] **Scenario: 原生相依或寫入權限失敗可定位**
  - SPEC 對應：§2.2、8.3；AC-018、AC-021、AC-025。
  - 涉及元件：`NativeDependencyPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-076、UT-077、UT-078、IT-009、CT-001、CT-009、ET-005。

```gherkin
@error-handling @critical
Scenario: SC-026 原生相依或寫入權限失敗可定位
  Given 乾淨 Player 缺 SQLite DLL 或使用者資料目錄不可寫
  When 嘗試啟動與必要資料操作
  Then 缺相依顯示「必要執行檔不完整，請使用完整安裝包修復。」
  And 不可寫回 StorageUnavailable 與「無法寫入本機資料，請檢查權限與可用空間。」
  And 不嘗試安裝線上工具、不清空既有 profile，記錄去敏診斷
```

## 🔲 Boundary Conditions — 邊界條件

### SC-027 @edge-case @critical

- [ ] **Scenario: 空目錄與單一未解決項目不能全量發布**
  - SPEC 對應：§3.4；AC-004、AC-009、AC-017。
  - 涉及元件：`CatalogCoveragePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-079、UT-080、UT-081、IT-002、CT-005、ET-009。

```gherkin
@edge-case @critical
Scenario: SC-027 空目錄與單一未解決項目不能全量發布
  Given 分別使用 C=0、G=1、V=C-1、缺 LEGO 身份或未分類一筆的資料
  When 計算覆蓋率並要求發布
  Then C=0 顯示「尚無候選模型」，不除以零或顯示 100%
  And 任一來源／身份缺口、缺 revision 或分類缺漏均阻止正式發布
  And V/C=100% 但無指定盒組範圍審查仍不是全量完成
```

### SC-028 @edge-case @critical

- [x] **Scenario: 分頁邊界與固定排序**
  - SPEC 對應：§6.1；AC-015、AC-019。
  - 涉及元件：`VariantPagingPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-082、UT-083、UT-084、IT-008、CT-002。
  - **2026-10-22 勾選稽核**：對應UT-082/083/084、IT-008、CT-002逐項已勾選且覆蓋本場景的 Given／When／Then；保留完整驗收證據於TDD原測試ID，本次僅修正BDD漏勾，不增加TDD測試數。

```gherkin
@edge-case @critical
Scenario: SC-028 分頁邊界與固定排序
  Given 同快照有 101 筆不同 variantId，篩選條件保持相同
  When 以預設及邊界 Limit 逐頁查詢
  Then 預設每頁 50，Limit=1 與 100 合法，0／負數／101 為 InvalidQuery
  And 固定 variantId 排序，遍歷 101 筆無重複或遺漏
  And 末頁 nextCursor 為 null，空結果 items 為空集合
```

### SC-029 @edge-case @critical

- [x] **Scenario: 尺寸、接點與資產預算門檻**
  - SPEC 對應：§4.3、8.2；AC-006、AC-008、AC-020、AC-024。
  - 涉及元件：`MetadataValidationPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-085、UT-086、UT-087、IT-004。
  - **2026-10-22 勾選稽核**：對應UT-085/086/087、IT-004逐項已勾選且覆蓋本場景的 Given／When／Then；保留完整驗收證據於TDD原測試ID，本次僅修正BDD漏勾，不增加TDD測試數。

```gherkin
@edge-case @critical
Scenario: SC-029 尺寸、接點與資產預算門檻
  Given 資料分別在尺寸容差／接點誤差／大小上限及其相鄰兩側，另有 NaN、Infinity、負尺寸
  When 驗證 metadata 及輸出預算
  Then 尺寸誤差 ≤ max(0.1 mm,0.5%×參考尺寸)，接點誤差 ≤0.05 mm 才通過
  And 非有限數值、非正尺寸或非正 world scale 失敗，法向與切線須正規化
  And GLB ≤20 MiB、紋理每邊 ≤2048、預覽 ≤256 KiB；來源壓縮大小不冒充 runtime 記憶體
```

### SC-030 @edge-case @critical

- [ ] **Scenario: 同時發布及歷史內容一致性**
  - SPEC 對應：§5.2、5.4；AC-009、AC-010、AC-018。
  - 涉及元件：`PublishConcurrencyPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-088、UT-089、UT-090、IT-014。

```gherkin
@edge-case @critical
Scenario: SC-030 同時發布及歷史內容一致性
  Given 兩個工作以相同 expected-head-version 要求發布
  When 同時嘗試 CAS 交易並讀取結果
  Then 只有一個工作成功切 head，另一個回版本衝突
  And 失敗工作不能覆寫成功結果或刪除已發布資產
  And 舊 session 的投影與精確 revision 不跟著 head 改動
```

### SC-031 @edge-case @critical

- [ ] **Scenario: 特殊款不能透過直接查詢取得權益**
  - SPEC 對應：§4.4、6.1；AC-013、AC-014、AC-015。
  - 涉及元件：`AcquisitionEligibility`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-091、UT-092、UT-093、IT-005、CT-002。

```gherkin
@edge-case @critical
Scenario: SC-031 特殊款不能透過直接查詢取得權益
  Given 模型庫含 Basic、Advanced、Special 與外觀可用但不可建造的件
  When 以 CharacterCreation、InitialBucket 及 Browse 查詢
  Then 人物建立與桶查詢均排除 Special，前者檢查 creationEligible，後者檢查 bucketEligible／BuildSystem
  And Browse 或精確載入可讀模型資料但不增加庫存／人物資格
  And Special 的來源保持聯名／成就／活動，不因分類改動自動發放
```

### SC-032 @edge-case @critical

- [ ] **Scenario: 資產引用生命週期與主執行緒**
  - SPEC 對應：§6.1、7；AC-026。
  - 涉及元件：`ModelLeasePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-094、UT-095、UT-096、IT-015、CT-006、CT-008。

```gherkin
@edge-case @critical
Scenario: SC-032 資產引用生命週期與主執行緒
  Given 兩個使用者共用 mesh／材質，載入可能成功、失敗或取消
  When AcquireAsync 後以不同順序 Dispose，包括重複 Dispose
  Then 每份 lease 只釋放自己的 reference，重複 Dispose 安全
  And 取消／失敗後已建立而未使用的 handle 均釋放，不提前釋放另一份仍使用資產
  And Unity 物件建立／操作／銷毀只在主執行緒，背景僅處理資料與 IO
```

## 🖥️ Frontend UX — 原生畫面

### SC-033 @happy-path @critical @smoke @frontend

- [ ] **Scenario: 斷網安裝後首次進入模型預覽**
  - SPEC 對應：§6.4、7；AC-016、AC-021、AC-025。
  - 涉及元件：`CatalogPreviewPresenter`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-097、UT-098、UT-099、IT-016、ET-001。

```gherkin
@happy-path @critical @smoke @frontend
Scenario: SC-033 斷網安裝後首次進入模型預覽
  Given 乾淨 Windows x64 無 Editor／SDK／Blender／Python／資料庫服務且已斷網
  When 安裝完整包並首次啟動 CatalogPreviewScene
  Then 顯示「模型預覽」與可用的搜尋、篩選、模型資訊，不要求登入
  And 載入時顯示「正在載入本機模型…」，未完成前不假報可操作成功
  And 實際 3D 模型由包內 SQLite／Addressables 取得，不依賴開發快取或下載
```

### SC-034 @happy-path @critical @frontend

- [ ] **Scenario: 搜尋篩選與切換外觀**
  - SPEC 對應：§6.1、7；AC-015、AC-016。
  - 涉及元件：`CatalogPreviewPresenter`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-100、UT-101、UT-102、IT-016、ET-002。

```gherkin
@happy-path @critical @frontend
Scenario: SC-034 搜尋篩選與切換外觀
  Given 已載入同快照的多系列、多款式及不同印刷變體
  When 輸入貨號／名稱並依系列、款式、部位篩選後選取變體
  Then 貨號精確匹配優先，名稱可部分匹配，所有篩選共同作用
  And 清單與詳情使用同快照，展示所選名稱、版本及尺寸
  And 切換顏色或印刷時 3D 外觀與 variantId 一致，不只改文字
```

### SC-035 @happy-path @critical @frontend

- [ ] **Scenario: 旋轉縮放與鍵盤操作不互相干擾**
  - SPEC 對應：§7；AC-016。
  - 涉及元件：`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs`、`Application/PreviewOrbitPolicy.cs`（後者相對 `game/Assets/BrickHigh/`）。
  - 部分證據：`PreviewCameraControllerTests.cs`／`PreviewOrbitPolicyTests.cs` 驗證取景與焦點；原生 `ToolchainProbe.VerifyPreviewCamera` 驗證實際載入模型，詳 TDD 鏡頭接續紀錄。完整鍵盤控制鏈與窄視窗 UI 重排仍未完成，SC-035／UT-105／IT-016／ET-002 不因此勾選。
  - TDD 對應：UT-103、UT-104、UT-105、IT-016、ET-002。

```gherkin
@happy-path @critical @frontend
Scenario: SC-035 旋轉縮放與鍵盤操作不互相干擾
  Given 模型預覽可操作且搜尋欄可取得焦點
  When 拖曳、滾輪、重設視角並使用鍵盤搜尋／篩選／選取／重試／重設
  Then 拖曳旋轉、滾輪縮放及重設可觀察真實 3D 模型
  And 文字輸入焦點阻止模型旋轉與遊戲快捷鍵被同步觸發
  And 所有規定的清單／按鈕操作可用鍵盤完成，窄視窗上下排列而不遮住必要控制
```

### SC-036 @happy-path @critical @frontend

- [ ] **Scenario: 玩具材質、印刷與透明外觀核對**
  - SPEC 對應：§7、8.1；AC-005、AC-007、AC-025。
  - 涉及元件：`MaterialPreviewPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-106、UT-107、UT-108、IT-017、ET-003。

```gherkin
@happy-path @critical @frontend
Scenario: SC-036 玩具材質、印刷與透明外觀核對
  Given 實際來源包含塑膠、橡膠、透明與印刷且已有六視圖
  When 在封裝 Player 用固定光照觀察各變體
  Then 塑膠／橡膠／透明材質有可辨差異，印刷位置與來源相符
  And 反射與柔光不以過曝遮住接縫、倒角或缺材質
  And 每個變體有 Player 畫面證據與版本資料，純 PNG 或 Editor 畫面不能取代
```

### SC-037 @happy-path @critical @frontend

- [x] **Scenario: 搜尋空狀態可以清除條件恢復**
  - SPEC 對應：§7；AC-015、AC-016。
  - 涉及元件：`CatalogPreviewPresenter`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-109、UT-110、UT-111、IT-016、ET-002。

```gherkin
@happy-path @critical @frontend
Scenario: SC-037 搜尋空狀態可以清除條件恢復
  Given 目錄可用但目前篩選不符合任何變體
  When 搜尋完成後再按清除條件
  Then 空狀態顯示「找不到符合條件的模型。」而不假造模型
  And 保留可操作的「清除條件」入口
  And 清除後重查當前快照並回復有效清單，不變更目錄資料
```

### SC-038 @happy-path @critical @frontend

- [ ] **Scenario: 模型錯誤不阻止選擇其他可用模型**
  - SPEC 對應：§6.2、7；AC-016、AC-018、AC-025。
  - 涉及元件：`CatalogPreviewPresenter`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-112、UT-113、UT-114、IT-016、ET-004。

```gherkin
@happy-path @critical @frontend
Scenario: SC-038 模型錯誤不阻止選擇其他可用模型
  Given 一個模型損毀且另一個可正常載入
  When 選取損毀模型後改選正常模型
  Then 失敗顯示「此模型檔案不完整，請使用完整安裝包修復。」及診斷 ID
  And 不以占位圖示宣稱成功，也不暴露堆疊／來源金鑰
  And 其他可用模型仍可選取並正確呈現，既有存檔不變
```

### SC-039 @happy-path @critical @frontend

- [ ] **Scenario: 快速換件僅呈現最新選擇**
  - SPEC 對應：§6.1、7；AC-016、AC-026。
  - 涉及元件：`SelectionRequestPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-115、UT-116、UT-117、IT-015、ET-004。

```gherkin
@happy-path @critical @frontend
Scenario: SC-039 快速換件僅呈現最新選擇
  Given A 載入慢、B 載入快
  When 先選 A 隨即選 B，並令 A 最後才完成
  Then 最後畫面僅呈現 B，A 不覆蓋 B 的模型或詳情
  And A 可取消或丟棄結果，但其多餘 handle 必須釋放
  And 快速反覆切換後 loading 狀態對應目前請求，不被舊結果關閉或卡住
```

### SC-040 @happy-path @critical @frontend

- [ ] **Scenario: 重試等待期間防止重複啟動**
  - SPEC 對應：§7；AC-016、AC-026。
  - 涉及元件：`RetryRequestPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-118、UT-119、UT-120、IT-016、ET-004。

```gherkin
@happy-path @critical @frontend
Scenario: SC-040 重試等待期間防止重複啟動
  Given 可重試的暫時載入失敗已顯示「載入失敗，請重試。」
  When 使用者連續按重試而第一次仍處理中
  Then 按鈕顯示「重試中…」且同一請求未完成前禁用
  And 相同重試只啟動一次，未取消正常模型切換能力
  And 完成或再失敗後恢復操作；不可重試的缺檔錯誤改指向完整包修復
```

### SC-041 @happy-path @critical @frontend

- [ ] **Scenario: 離開預覽釋放資源並可再進入**
  - SPEC 對應：§6.1、7；AC-016、AC-026。
  - 涉及元件：`PreviewLifecycle`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-121、UT-122、UT-123、IT-015、CT-008、ET-004。

```gherkin
@happy-path @critical @frontend
Scenario: SC-041 離開預覽釋放資源並可再進入
  Given 預覽持有 lease、instance、render texture 及待完成載入
  When 離開場景，待舊請求完成後重新進入
  Then 離開時釋放 session、lease、instance 與臨時 render texture
  And 未完成請求返回後不碰已銷毀 UI 且釋放未使用 handle
  And 重新進入可開新 session，共用仍被使用的 mesh／材質保持有效
```

### SC-042 @happy-path @critical @frontend

- [ ] **Scenario: 圖形裝置不支援時回報啟動失敗**
  - SPEC 對應：§7；AC-016、AC-021。
  - 涉及元件：`GraphicsCapabilityPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-124、UT-125、UT-126、IT-016、ET-005。

```gherkin
@happy-path @critical @frontend
Scenario: SC-042 圖形裝置不支援時回報啟動失敗
  Given 圖形裝置不支援指定的原生 3D 執行條件
  When 啟動安裝版預覽
  Then 玩家可取得「目前圖形裝置不支援本遊戲，請檢查顯示驅動與系統需求。」
  And 不把只能顯示 PNG 或未建立 3D 裝置的結果標成通過
  And 保留診斷與原存檔，不強制連線修復
```

## ⚡ Performance — 效能需求

### SC-043 @performance @critical @frontend

- [ ] **Scenario: 本地查詢與單件冷載入時間**
  - SPEC 對應：§8.2；AC-020。
  - 涉及元件：`PerformanceGate`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-127、UT-128、UT-129、IT-018、ET-011。

```gherkin
@performance @critical @frontend
Scenario: SC-043 本地查詢與單件冷載入時間
  Given SSD 基準機及 max(100000,C) 筆 metadata 與可載入模型
  When 暖機後查詢 1000 次，另測單模型冷載入
  Then 50 筆分頁查詢 P95 ≤100 ms、詳情 P95 ≤50 ms，資產載入不混計
  And 單模型冷載入至第一個正確畫面 ≤3 秒且顯示載入狀態
  And 紀錄 CPU／GPU／驅動／套件／manifest 與 cold 定義，不以主執行緒同步查詢
```

### SC-044 @performance @critical @frontend

- [ ] **Scenario: 2026 片畫面與實際 Player 流暢度**
  - SPEC 對應：§8.2；AC-020、AC-025。
  - 涉及元件：`FramePerformanceGate`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-130、UT-131、UT-132、IT-018、ET-012。

```gherkin
@performance @critical @frontend
Scenario: SC-044 2026 片畫面與實際 Player 流暢度
  Given 固定 manifest 含至少 2026 可見積木、8 類幾何、印刷與透明件，指定 1080p Medium 基準機
  When 用非 Development Standalone 關閉 VSync／幀率上限，暖機30秒後量測60秒且操作 UI
  Then 場景量與幾何組合達門檻，不能用同款低面數方塊替代
  And 平均 ≥60 FPS 且 P95 frame time ≤20 ms，載入段單獨統計
  And 保存原始 frame 資料、畫面證據與環境；Editor／另一硬體結果不得冒充基準機通過
```

### SC-045 @performance @critical

- [ ] **Scenario: 多輪切換的記憶體與快取上限**
  - SPEC 對應：§8.2；AC-020、AC-026。
  - 涉及元件：`ResourceCachePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-133、UT-134、UT-135、IT-018、ET-013。

```gherkin
@performance @critical
Scenario: SC-045 多輪切換的記憶體與快取上限
  Given 固定20模型含共用資產且有可回收與仍使用項目
  When 切換5輪並離開預覽，量測 handles／mesh／texture 與記憶體
  Then 無使用引用的快取以 LRU 控制估計 ≤256 MiB
  And 仍使用資產獨立統計且不被快取清除
  And 釋放後物件與 handles 回到允許快取範圍，不每輪持續累積
```

### SC-046 @performance @critical @frontend

- [ ] **Scenario: 輪組尺度與有限接觸原型**
  - SPEC 對應：§2.4、4.3、8.2；AC-008、AC-024。
  - 涉及元件：`VehicleMetadataPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-136、UT-137、UT-138、IT-018、ET-014。

```gherkin
@performance @critical @frontend
Scenario: SC-046 輪組尺度與有限接觸原型
  Given 不同輪徑／軸距 fixture 有局部輪軸、碰撞體與質量來源標記
  When 以統一世界倍率建立有限輪組坡道／路肩接觸原型
  Then 模型、輪半徑、錨點及碰撞同倍率且 profile 可追溯
  And massKg 的 Measured／Estimated／Unknown 不混同，未知不冒充已核實性能
  And 主要車身剛體與簡化碰撞的接觸結果留存，不宣稱完成車輛性能演算法或三賽道
```


## 🛡️ 已確認風險補強 — 原生交付與保護契約

以下承接使用者對補強版 SDD 的「確認」，不改寫或重編 SC-001～046。

### SC-047 @risk-regression @critical @frontend

- [ ] **Scenario: 隔離技術預覽與正式全量交付**
  - SPEC 對應：§13.1；AC-027；GAP-001。
  - 涉及元件：`PreviewPackagePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-139、UT-140、UT-141、IT-019、CT-010、ET-015。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-047 隔離技術預覽與正式全量交付
  Given Frozen固定版本含已驗證代表資產，而使用者指定盒組全集仍有 LEGO 身份或 Ready 缺口
  When 建置並安裝Preview，再以Release開啟該包及請求正式取得用途
  Then Preview僅含 Ready、RuntimeBuild 通過且 Design/Element 身份與使用條件可核對的代表件；顯示「技術預覽・非完整模型庫」與完整 C/G/V 及預覽子集合數
  And Release回IncompatibleContent及「此資產包僅供技術預覽，不能作為正式遊戲資料。」；包類型鎖在建置，不可改設定繞過
  And Preview資料根獨立且只可Browse，不發道具、不寫正式進度、不匯入正式profile、不切正式head，畫面通過不提高指定盒組全集完成度
```

### SC-048 @risk-regression @critical

- [ ] **Scenario: 先驗證Frozen候選再發布已驗證內容**
  - SPEC 對應：§13.2；AC-028；GAP-002。
  - 涉及元件：`ValidationPromotionPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-142、UT-143、UT-144、IT-020、IT-021。

```gherkin
@risk-regression @critical
Scenario: SC-048 先驗證Frozen候選再發布已驗證內容
  Given Frozen快照及固定選件、工具鏈、target摘要，另備變更後快照與上一版head
  When 執行BuildValidationContent後嘗試發布及BuildCatalogContent
  Then 驗證只產生不可變staging與validation_builds證據，不需先Published也不切head；Preview可引用合格子集合
  And 正式發布需全量門檻且snapshot/version/selection/toolchain/target與通過報告一致；任一變更拒絕舊報告
  And 發布以CAS提交已驗證build，失敗保留head；BuildCatalogContent只封裝Published的精確已驗證產物，再建Player與安裝包
```

### SC-049 @risk-regression @critical @frontend

- [ ] **Scenario: 更新與啟動共用互斥且身分穩定**
  - SPEC 對應：§13.3；AC-029；GAP-003。
  - 涉及元件：`InstallLifecyclePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-145、UT-146、UT-147、IT-022、ET-016。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-049 更新與啟動共用互斥且身分穩定
  Given 既有Release人工profile與另一個Preview資料根；安裝器與啟動器競爭同一安裝路徑
  When 在更新預檢至切換期間重啟遊戲，另測遊戲先持鎖及無寫入權限
  Then CompanyName固定GameNenStyle；Release BrickHigh/com.gamenenstyle.brickhigh、Preview BrickHighPreview/com.gamenenstyle.brickhigh.preview，升級沿用各自資料根
  And 以applicationId與canonical installRoot共用生命週期鎖，安裝器從預檢持至提交、啟動器持至Player退出，同一使用者同一安裝只允許一個Player
  And 競爭顯示「遊戲或更新程序正在執行，請關閉後再試。」並不切換內容；權限失敗保留舊包與profile，不強殺、不新建第二資料庫
```

### SC-050 @risk-regression @critical @frontend

- [ ] **Scenario: 降版及備份失敗不擅自回退進度**
  - SPEC 對應：§13.4；AC-030；GAP-004。
  - 涉及元件：`SaveRecoveryPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-148、UT-149、UT-150、CT-011、IT-023、ET-017。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-050 降版及備份失敗不擅自回退進度
  Given 人工F-Save含升版前完整備份、新版schema與新增進度；不使用私人正式存檔
  When 檢查降版相容性，注入備份中斷，再在驗收harness選擇取消或確認還原
  Then Compatible或MigrationRequired以CompatibilityReport回報，未知schema回UnsupportedSchema且不開可寫連線，提示「此存檔版本較新，已保留目前進度。請使用相容版本開啟。」
  And 備份先一致複製至暫存再驗證提交，失敗不覆蓋最後良好備份；migration交易失敗回滾，不改目前進度
  And 提示「還原將回到所選備份的進度；目前資料會另行保留。」並列版本與時間；未確認、取消或失敗不替換目前資料，確認還原仍另存較新資料；正式玩家還原UI留後續SPEC
```

### SC-051 @risk-regression @critical

- [ ] **Scenario: 完整模型引用與包身分必須一致**
  - SPEC 對應：§13.5；AC-031；GAP-005。
  - 涉及元件：`RuntimeReferencePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-151、UT-152、UT-153、IT-024、CT-012。

```gherkin
@risk-regression @critical
Scenario: SC-051 完整模型引用與包身分必須一致
  Given 真實SQLite具不同snapshot/variant/revision/target及manifest正反例
  When 開啟包並解析正常、混搭、遺失歷史引用與未知schema
  Then runtime_models與runtime_builds以完整複合PK/FK/unique約束歸屬及target，每組ModelReference只解析唯一符合版本，不回退最新
  And manifest與runtime_meta的pack/snapshot/schema/applicationId/packageKind/target逐項一致，錯配回IncompatibleContent，未知schema回UnsupportedSchema
  And 損毀資料回AssetCorrupt，缺少必要歷史引用回IncompatibleContent；拒絕前不載入錯件或改動存檔
```

### SC-052 @risk-regression @critical @frontend

- [ ] **Scenario: 輸入邊界與取消順序具有精確契約**
  - SPEC 對應：§13.6；AC-032；GAP-006。
  - 涉及元件：`CatalogInputPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-154、UT-155、UT-156、CT-013、CT-014、IT-025。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-052 輸入邊界與取消順序具有精確契約
  Given 含中文、引號、百分號、底線的目錄，合法及null/disposed/跨包session與預先取消token
  When 呼叫查詢、載入及相容性介面，參數化測試邊界與取消競態
  Then 未取消時null DTO/session、disposed/偽造/跨包session、非法enum/UUID或Limit不在1至100回InvalidQuery；空requiredModels仍驗header、重複引用去重且逐件查核
  And QueryText null/空代表不篩選，至多256 Unicode scalar且UTF16有效；Cursor null/空為首頁、至多4096 ASCII，錯誤/跨查詢回InvalidCursor；中文、引號、%及_為參數化字面搜尋
  And 預先取消優先回Cancelled且無IO/handle配置；中途取消釋放資源；InvalidQuery與InvalidCursor顯示第13.6節文案，取消不彈警報
```

### SC-053 @risk-regression @critical

- [ ] **Scenario: 實際檔案目標與新載入內容不可繞過驗證**
  - SPEC 對應：§13.7；AC-033；GAP-007。
  - 涉及元件：`AssetIntegrityPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-157、UT-158、UT-159、IT-026、IT-027。

```gherkin
@risk-regression @critical
Scenario: SC-053 實際檔案目標與新載入內容不可繞過驗證
  Given 允許根目錄、相似前綴目錄、越界junction與已驗證後同大小替換的bundle
  When 解析資產最終路徑並在快取命中、新程序與hash後讀取競態下重新載入
  Then 最終解析路徑必須在指定包或暫存根內；拒絕reparse point越界，不只比對字串前綴，不讀取根外內容
  And 驗證快取綁pack/expectedDigest/最終路徑/fileIdentity；新程序、替換或無可靠身分時不能沿用跨讀取判定，新load核對實際bytes
  And hash至loader間保護檔案不被寫換或傳入已驗證stream；損毀拒絕且不改玩家資料，既有記憶體lease可共用；不宣稱hash是簽章或DRM
```

### SC-054 @risk-regression @critical @frontend

- [ ] **Scenario: 真實畫面基準、繁中字型與原生失敗通知**
  - SPEC 對應：§13.8；AC-034；GAP-008。
  - 涉及元件：`VisualAcceptancePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-160、UT-161、UT-162、ET-018、ET-019、ET-020。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-054 真實畫面基準、繁中字型與原生失敗通知
  Given 可安裝Preview含代表模型、隨包繁中文字型與授權；另備缺字、缺材質及無3D裝置反例
  When 提交固定六視圖與操作錄影請使用者核准，並驗證渲染回歸及啟動器通知
  Then 實際Player代表模型畫面核准後記錄visualBaselineId、光照/鏡頭/材質digest、版本、日期及意見，未核准不得自稱既定風格通過
  And 缺字、印刷缺失/鏡像、粉紅shader、過曝等可見缺陷不通過；跨GPU不要求像素全等，關鍵外觀改動重新核准，繁中字型及fallback斷網可用
  And BrickHighLauncher.exe在無Unity圖形裝置時仍有Windows原生通知與診斷；未知原因用「遊戲未能完成啟動，請檢查安裝檔與顯示驅動。」；正常啟動無多餘console且必要相依隨包
```

### SC-055 @risk-regression @critical @frontend

- [ ] **Scenario: 不同硬體及品質設定不可冒充基準效能**
  - SPEC 對應：§13.9；AC-035；GAP-009。
  - 涉及元件：`BenchmarkEvidencePolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-163、UT-164、UT-165、ET-021、ET-022。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-055 不同硬體及品質設定不可冒充基準效能
  Given 本機Iris Xe探索環境與SPEC基準機，固定BenchmarkProfile及改設定反例
  When 執行實際Player冷啟動、首次模型載入、熱載入與2026片穩態量測
  Then Iris Xe結果只作探索，正式以GTX1660/i5-10400/16GiB/SSD或另行核准硬體驗收，不同硬體不標基準通過
  And profile記錄1920x1080/renderScale1/動態解析度關閉及已核准AA/陰影/光照/透明比例/相機/UI/套件digest；設定變更另建profile，未凍結不能算Medium驗收
  And Acquire至第一個正確mesh/材質/紋理畫面包含hash且≤3秒；冷暖與OS快取條件分列，2026片8類幾何關VSync上限暖30秒測60秒，平均≥60FPS且P95≤20ms，保留原始資料與畫面
```

### SC-056 @risk-regression @critical @frontend

- [ ] **Scenario: 輪組單位、未知質量與配對原型可核對**
  - SPEC 對應：§13.10；AC-036；GAP-010。
  - 涉及元件：`WheelMetadataPolicy`（規劃名稱；實際對應檔案與狀態見2026-09-27矩陣）。
  - TDD 對應：UT-166、UT-167、UT-168、IT-028、IT-029。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-056 輪組單位、未知質量與配對原型可核對
  Given 至少兩種輪徑與兩種軸距，合法及非法輪胎/輪圈/軸配對，Measured/Estimated/Unknown質量資料
  When 驗證metadata並在固定坡道/路肩與WorldScaleProfile建立靜態和動態原型
  Then radiusMeters/widthMeters有限且>0、axleDirection為canonical局部正規化；必要尺寸未知不填0且不進輪組候選，但保留外觀資產
  And Measured/Estimated有有限正massKg與來源理由；Unknown為null且附原因，不帶入虛構重量或性能
  And 不相容配對拒絕；合法靜態軸心/模型/碰撞誤差符合§4.3，記錄scale/坡度/路肩高度/速度/物理設定及實際動態接觸與跳動，不宣稱完成MVP-002
```

## ⚠️ SPEC 補充 — BDD 未覆蓋項目

AC-001～036 均有場景及 TDD 追溯（36/36）。本輪未發現尚未回寫的規劃缺漏；來源全量、逐資產品質、實際 Player 畫面核准及正式效能仍未驗收，不算已消除的產品風險。

## 需求與驗收追溯

| SPEC AC | BDD Scenario |
|---|---|
| AC-001 | SC-001、SC-021 |
| AC-002 | SC-002 |
| AC-003 | SC-003 |
| AC-004 | SC-001、SC-004、SC-027 |
| AC-005 | SC-006、SC-013、SC-036 |
| AC-006 | SC-007、SC-029 |
| AC-007 | SC-006、SC-010、SC-013、SC-036 |
| AC-008 | SC-008、SC-029、SC-046 |
| AC-009 | SC-004、SC-005、SC-023、SC-027、SC-030 |
| AC-010 | SC-004、SC-011、SC-022、SC-030 |
| AC-011 | SC-012、SC-014、SC-025 |
| AC-012 | SC-009 |
| AC-013 | SC-031 |
| AC-014 | SC-008、SC-009、SC-031 |
| AC-015 | SC-015、SC-020、SC-028、SC-031、SC-034、SC-037 |
| AC-016 | SC-033、SC-034、SC-035、SC-037、SC-038、SC-039、SC-040、SC-041、SC-042 |
| AC-017 | SC-005、SC-027 |
| AC-018 | SC-013、SC-019、SC-021、SC-022、SC-023、SC-026、SC-030、SC-038 |
| AC-019 | SC-015、SC-019、SC-020、SC-024、SC-028 |
| AC-020 | SC-029、SC-043、SC-044、SC-045 |
| AC-021 | SC-019、SC-026、SC-033、SC-042 |
| AC-022 | SC-016、SC-017、SC-018 |
| AC-023 | SC-012、SC-017、SC-018、SC-023、SC-025 |
| AC-024 | SC-007、SC-029、SC-046 |
| AC-025 | SC-006、SC-014、SC-016、SC-019、SC-024、SC-026、SC-033、SC-036、SC-038、SC-044 |
| AC-026 | SC-032、SC-039、SC-040、SC-041、SC-045 |

| AC-027 | SC-047 |
| AC-028 | SC-048 |
| AC-029 | SC-049 |
| AC-030 | SC-050 |
| AC-031 | SC-051 |
| AC-032 | SC-052 |
| AC-033 | SC-053 |
| AC-034 | SC-054 |
| AC-035 | SC-055 |
| AC-036 | SC-056 |

每個場景的 TDD 對照列於場景下及 TDD 完整矩陣。MVP 跨 SPEC 責任見稽核報告，未生成的其他 SPEC 不算已完成。

## 🔗 相關文檔

- [SPEC 來源](../specs/SPEC-001-BrickModelCatalog.md)
- [TDD 測試清單](../tdd/SPEC-001-BrickModelCatalog-TDD.md)
- [實作前風險稽核](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md)

**生成者**：AI
**最後現行核對**：2026-10-22（頂端摘要及勾選為準）
**2026-10-10 歷史狀態（不得視作現況）**：當時`well-done`仍在Gate2，舊摘要曾填BDD 11/56、UX1/20；現行原56個Scenario實際13個勾選，Gate3已按新版里程碑結案，可進Gate4。authoritative Element／Design 的正式發佈契約未放寬。

## 2026-09-27 全56場景實作稽核（歷史快照；最新勾選與完成數以本文上方2026-10-22稽核為準）

逐項核對原Given／When／Then；路徑相對brickhigh，行號為稽核時點。部分單測完整不自動提升場景。N列的檔案是最接近的既有邊界，尚無該場景實作／完整測試。缺漏與補測名稱詳TDD同SC的三個UT及IT／CT／ET列。

| 場景 | 狀態 | 實作證據 | 斷言／執行證據 | 判定／剩餘工作 |
|---|---|---|---|---|
| SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 來源附件、hash與UTC觀測／有效日期均有回讀斷言。；五類系列、套裝／人物展開與排除理由逐項比對。；缺頁及缺系列各產生未解G，發布被拒絕。真CLI／SQLite的IT-001補足跨邊界證據。 |
| SC-002 | ✅ 已符合 | `tools/catalog/repository.py`；`tools/catalog/importing.py` | `tools/catalog/tests/unit/test_sc_002.py`；`tools/catalog/tests/integration/test_source_import.py` | 同一 Design ID 重用 geometry part；不同顏色形成不同外觀 variant／Element 身份；同 Design＋同外觀重用既有 variant。 |
| SC-003 | ✅ 已符合 | `tools/catalog/policies.py`；`tools/catalog/importing.py` | `tools/catalog/tests/unit/test_sc_003.py`；`tools/catalog/tests/integration/test_source_import.py`；`tools/catalog/tests/integration/test_catalog_resolve.py` | 只保存盒組 inventory 實際觀測組合，重複去重且不生成笛卡兒積；顏色／印刷／材質形成 VariantKey，LEGO Element 與來源 ID 保留可追溯別名；矛盾 alias 拒絕合併。 |
| SC-004 | ⚠️ 部分符合 | `tools/catalog/repository.py:131`；`tools/catalog/quality.py:321` | `tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_snapshot_repository.py:123` | 真 SQLite 保護及逐 bytes Ready 品質報告門檻已有合成正反例；真實全量來源及每件人工覆核未完成。 |
| SC-005 | ⚠️ 部分符合 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_catalog_cli.py:81`；`tools/catalog/tests/integration/test_catalog_cli.py:196` | 全量實際來源與可成功發布的品質閉環尚缺。 |
| SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212` | 缺全代表件品質反例及完整RuntimeBuild載入。 |
| SC-007 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | 缺真匯入mesh／normal／metadata整組基底一致性。 |
| SC-008 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:58` | `tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | 缺接點配對／空腔碰撞；欄位檢查不能替代。 |
| SC-009 | ⚠️ 部分符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 缺六部位與同系統建材候選。 |
| SC-010 | ⚠️ 部分符合 | `tools/catalog/building.py:114`；`tools/catalog/render_views.py:15` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12` | 來源／六視圖已封存；缺每變體外觀及正式RuntimeBuild證據。 |
| SC-011 | ✅ 已符合 | `tools/catalog/repository.py`；`tools/catalog/jobs.py`；`tools/catalog/building.py` | `tools/catalog/tests/unit/test_sc_011.py`；`tools/catalog/tests/integration/test_job_recovery.py`；`tools/catalog/tests/integration/test_catalog_build.py` | 已驗證 Published parent 不變、同 baseline successor 可加入新指定盒組 Element/Design、同鍵冪等／衝突，以及 source／metadata／toolchain 變更建立新 revision。 |
| SC-012 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs::ResolveVariantAsync`；`ResolveModelAsync` | `ReadContractTests.ModelReferenceResolver_ExactReference_PreservesRevision`；`ModelReferenceResolver_HistoricalProjection_RemainsFrozen`；`ModelReferenceResolver_OutOfScopeVariant_ExcludesNewAcquisition` | UT-034～036 已以真 SQLite 證明 exact 舊 revision、frozen 名稱／分類及 out-of-current-scope 舊引用可載入；場景仍缺 IT-007／CT-003／CT-006／ET-010 與跨 Editor／套件版本重建後的正式 RuntimeBuild 映射，所以不升格整個 BDD。 |
| SC-013 | ⚠️ 部分符合 | `tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 缺補模來源歸檔與修補後Ready正例。 |
| SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/RuntimeBuildPolicy.cs::ComputeIdentity`；`game/Assets/BrickHigh/Infrastructure/ReleaseFileIndex.cs::ValidateRuntimeBuildIdentity`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs` | `ReadContractTests.RuntimeBuildPolicy_EngineChange_PreservesSourceRevision`；`RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild`；`RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility` | UT-040～042 已證明工具鏈升版保留 source revision、legacy exact reference 重映射 current RuntimeBuild、old bundle-only fail-closed；仍缺 IT-007／ET-010 與正式安裝更新／跨版本 RuntimeBuild 發行矩陣，所以整個 BDD 不升格。 |
| SC-015 | ✅ 已符合 | `BrickCatalog.OpenAsync`／`QueryAsync`／`GetVariantAsync`／`GetProfilesAsync`／`GetCoverageAsync` | UT-043～045；`RunReadContract_ScenarioMatrix_PreservesContract`；`OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome`；`QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome`；`GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome`；`GetProfilesAsync_FixedSession_SeparatesFamiliesAndSnapshotVersions`；`GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome` | fixed session 不漂移；Release 101 筆分頁、用途與 Special、selected revision／anchor／vehicle metadata、versioned profiles、C/G/V、typed failure/cancel/cursor、唯讀零副作用全部以真 SQLite／正式 C# adapter 閉環；Core 165/165、Unity EditMode 203/203、netstandard build exit 0。 |
| SC-016 | ✅ 符合 | `NativeSqlite`；`LocalStoragePolicy`；`tools/launcher/Program.cs`；`tools/acceptance/run_interactive_fixture.py` | UT-046～048；fresh installed-Player job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80` exit 0 | catalog 唯讀無 WAL／SHM，Profiles／Diagnostics 僅落 user LocalLow；真 packaged Player 在中文＋空白路徑與目前帳號 RX 安裝 ACL 下成功，install tree 不變；不可寫 LocalLow 明確 `StorageUnavailable` 且 profile 不變；診斷固定三欄、不含敏感資料且不自動上傳。Acceptance-only storage override 由 compile flag 隔離，正式包無此入口。SC-016 全部追溯項已閉環。 |
| SC-017 | ⚠️ 部分符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 安裝器已有staging及profile保留測試，缺新session映射舊模型。 |
| SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 沒有存檔一致備份／migration／組裝檔引用流程。 |
| SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 缺完整安裝錯誤與可定位診斷／存檔保留矩陣。 |
| SC-020 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:23` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:32`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236` | 缺非法enum／UUID及未知有效UUID完整查詢矩陣。 |
| SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 本機HTTP stub與工作DB核對429／timeout、重試上限、候選保留及憑證header。 |
| SC-022 | ✅ 已符合 | `tools/catalog/jobs.py` | `tools/catalog/tests/unit/test_sc_022.py`；`tools/catalog/tests/integration/test_job_recovery.py` | 過期租約僅一個 worker 可接手；真 Blender subprocess timeout 保留單件失敗且後續獨立 item 可執行；同鍵同輸入重用、不同輸入衝突均已驗。 |
| SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | 缺發布實體檔案與所有更新中斷／空間不足矩陣。 |
| SC-024 | ⚠️ 部分符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 政策與內部遠端拒絕已驗；正式包掃描全矩陣不齊。 |
| SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | checker已有schema與引用規則；缺實際存檔保存與可定位診斷。 |
| SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 缺乾淨Player缺DLL／不可寫資料根及原生通知全矩陣。 |
| SC-027 | ⚠️ 部分符合 | `tools/catalog/policies.py:94` | `tools/catalog/tests/unit/test_sc_027.py:12`；`tools/catalog/tests/integration/test_catalog_cli.py:64` | 單元門檻完整，真CLI逐項缺一與完整正例矩陣未齊。 |
| SC-028 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30` | 101筆分頁已驗；公開QueryAsync的Limit邊界全矩陣未齊。 |
| SC-029 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | 單元數值／預算規則已驗，實際metadata→輸出→Player完整邊界驗收不足。 |
| SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | CAS一勝一敗已驗，缺舊session及實體資產不變。 |
| SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | Release人物／初始桶／Browse用途矩陣尚缺。 |
| SC-032 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | lease共享與主執行緒已驗，失敗Acquire／實際共用資源整組不足。 |
| SC-033 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 內部包可啟動，未完成乾淨斷網Windows完整安裝驗收。 |
| SC-034 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 搜尋／詳細／lease單測已驗；多系列多款式與印刷的實際操作矩陣不足。 |
| SC-035 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57` | 鏡頭與部分Player鍵盤操作已驗，缺鍵盤篩選／翻頁／重試全鏈。 |
| SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:123` | 有Player畫面，缺來源外觀比對及逐變體品質核准。 |
| SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:150`；`artifacts/acceptance/wd-20260926-interactive-c/PlayerEvidence/result.json:1` | 真Player空搜尋→清除→恢復8筆與重新載入成功；單測確認清除按鈕及同snapshot，無目錄寫入。 |
| SC-038 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | presenter可從壞模型切正常，真安裝版故障及存檔不變尚未全驗。 |
| SC-039 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 過期結果規則完整；真安裝版慢A／快B及handles矩陣不足。 |
| SC-040 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | 重試政策及探針局部通過，真uGUI連點／再次失敗／換件矩陣不足。 |
| SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | 資源局部測試已做，缺實際退出重入且仍保留他人資產。 |
| SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 訊息政策與native launcher存在，實際無3D故障通知矩陣未完成。 |
| SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無指定硬體查詢P95與單件正確首幀量測。 |
| SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無2026片／8類幾何基準場景與穩態量測。 |
| SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無20件5輪快取／LRU／記憶體量測。 |
| SC-046 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 有mass欄位檢查，沒有輪組同尺度接觸原型。 |
| SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | 內部包尚不是 Design/Element 身份、Ready、RuntimeBuild 與使用條件均完整核對的正式 Preview 子集。 |
| SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | helper資料表及CAS存在，真Unity驗證→發布→精確封裝未完成。 |
| SC-049 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | 身份／互斥政策與真程序競爭已驗，缺真ACL與兩代Release/Preview完整矩陣。 |
| SC-050 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveOpenCoordinator.cs:38`；`tools/acceptance/save_fixture_recovery.py:69` | `game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs:166`；`tools/acceptance/tests/integration/test_save_fixture_recovery.py` | F-Save 真 SQLite 降版與備份／還原選擇矩陣已驗；正式玩家存檔 schema 及 UI 尚未整合。 |
| SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | resolver有局部證據；所有FK／target／manifest逐欄矩陣不齊。 |
| SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 輸入／字面搜尋已有測試，全部方法與取消UI矩陣不齊。 |
| SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python安全探針及verified bytes已做，真Player替換／barrier／新程序矩陣不足。 |
| SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:480`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:257`；`artifacts/acceptance/pm-20260928-interactive-20-a/manual-visual-review.html` | 缺字警示、真 Player／382 畫面及原生 launcher 已驗；20件外觀待使用者確認，正式逐件基準和缺陷反例未齊。 |
| SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 沒有凍結profile與正式基準資料，不能以Iris Xe代替。 |
| SC-056 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 來源輪組／mass規則已有單測，跨runtime及靜動態配對原型未做。 |
