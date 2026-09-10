# SPEC-001-BrickModelCatalog 未停產積木模型庫 — BDD 場景規格

> **SPEC 來源**：[SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md)
> **需求來源**：[MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
> **生成日期**：2026-09-09
> **確認依據**：原 SDD「好 繼續」、風險方案「全數同意 請繼續」、補強版 SDD「確認」（2026-09-09）。
> **狀態**：56 場景已生成並追溯；well-done Phase 2 核心實作進行中（2026-09-10），場景驗收仍為 0/56、UX 0/20。測試與限制見 [TDD 本輪紀錄](../tdd/SPEC-001-BrickModelCatalog-TDD.md)。

## 📝 Feature 描述

**Feature**：未停產積木模型庫、原生模型預覽及離線資產交付。

作為模型維護者與驗收者，我想要核對每個零件的來源、品質與版本，並在實際安裝的 Unity Player 中操作預覽，以便後續人物、庫存、建屋及車輛能共用可靠資產。

本文件是需求與 UX checklist，不是 SpecFlow 可執行測試。保留模板結構；原網頁元件改成 Unity 場景／uGUI，網路服務失敗只屬開發端來源取得。安裝版不要求 HTTP、帳號或連線。
正式全量發布仍受 SPEC §3.4 限制；以下受控 fixtures 僅用於測試，不能假稱已取得全部未停產零件。SPEC 第13節已確認，新增 SC-047～056 與原基線合併適用；早期 Preview 不解除正式 Release 的全量門檻。

## 🎯 前端 UX 實作進度

### 整體進度

```text
SPEC-001-BrickModelCatalog 原生預覽 UX
實作狀態：⏸️ 未開始
開始時間／預計完成／負責人：尚未指定
進度條：[░░░░░░░░░░░░░░░░░░░░] 0% (0/20)
```

### 分頁面／元件進度

| 頁面／元件 | 進度 | 已完成 | 進行中 | 待開始 | 狀態 |
|---|---|---|---|---|---|
| 模型預覽／錯誤／輸入 SC-033～SC-042 | 0% | 0/10 | 0 | 10 | ⏸️ 未開始 |
| 畫面與輪組量測 SC-043、SC-044、SC-046 | 0% | 0/3 | 0 | 3 | ⏸️ 未開始 |
| Preview／更新／恢復harness／輸入文案／畫面基準／效能／輪組 SC-047、049、050、052、054～056 | 0% | 0/7 | 0 | 7 | ⏸️ 未開始 |

### SPEC 前端覆蓋率

| 指標 | 數值 | 狀態 |
|---|---|---|
| 直接涉及畫面的驗收條款 | AC-005、007、016、020、021、024、025、026、027、029、030、032、034、035、036，共15項 | 已逐項對照 |
| BDD 有對應 @frontend 場景 | 15/15（100%） | 僅文件追溯，不代表畫面完成 |
| 前端場景 | 20 | 0項已實作 |
| 全部場景（46基線＋10補強） | 56 | 0項已驗收 |
| 新增SPEC條款 AC-027～036 | 10/10有場景與測試 | 文件追溯完成，未執行 |

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
| F-Catalog | 多系列／三態／101筆分頁／衝突資料 | 不當作真實全量 |
| F-Geometry | 非對稱、印刷、透明、六部位、接點正反例 | 不以占位方塊當成完成模型 |
| F-Save | 人工 profile／schema／舊ModelReference | 不宣稱已實作玩家庫存與人物資料表 |
| F-Performance | 實際2026片、8類幾何、固定20件切換、輪組 | 不宣稱代表所有未來賽道場景 |
| Release-Catalog | 後續實際取得的完整來源與資產 | 缺來源時阻斷，不以測試資料替代 |

## 基線與補強的合併適用規則

- SC-005／027 的全量門檻與 SC-033 的「模型預覽」正式包流程保留；SC-047 是獨立且明確標示的技術預覽，不得以其通過勾選正式全量案例。
- SC-004／006／014 的建置前置依 §13.2：Frozen staging 驗證 → 合格 Preview 或通過全量與摘要核對後 Published → 正式封裝，不能要求驗證前先發布。
- SC-016～018／023／025 的更新、備份及相容性合併 SC-049～051；本份只用人工 F-Save 與恢復 harness，未包含正式人物／庫存／還原 UI。
- SC-020／028／032 的輸入、取消、載入保護合併 SC-052／053；具體錯誤碼與字串以 §13.5～13.7 為準。InvalidQuery：「查詢條件無效，請調整後重試。」；InvalidCursor：「清單位置已失效，請重新搜尋。」。
- SC-035／036／042～046 的可見外觀、啟動通知、效能與輪組合併 SC-054～056；無核准畫面或指定硬體不得用模擬結果宣稱通過。

## ✅ Happy Path — 正常流程

### SC-001 @happy-path @critical

- [ ] **Scenario: 保存跨來源基準及涵蓋證據**
  - SPEC 對應：§3.1–3.4；AC-001、AC-004。
  - 涉及元件：`CatalogCoveragePolicy`（預計元件，尚未建立）。
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

- [ ] **Scenario: 逐變體判定生產三態**
  - SPEC 對應：§3.3；AC-002。
  - 涉及元件：`ProductionStatusPolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-004、UT-005、UT-006、IT-001。

```gherkin
@happy-path @critical
Scenario: SC-002 逐變體判定生產三態
  Given 候選分別有有效生產、停產、缺貨、舊現貨、日期不明及衝突證據
  When 維護者計算基準日生產狀態
  Then 有效生產且無衝突判為 Active，有效停產判為 Retired
  And 缺貨、舊現貨、日期不明與衝突均保持 Unknown
  And 某顏色停產不改變另一有效 Active 變體
```

### SC-003 @happy-path @critical

- [ ] **Scenario: 保留實際外觀變體及穩定識別**
  - SPEC 對應：§4.1、5.2；AC-003。
  - 涉及元件：`VariantIdentityPolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-007、UT-008、UT-009、IT-001。

```gherkin
@happy-path @critical
Scenario: SC-003 保留實際外觀變體及穩定識別
  Given 同幾何有兩顏色與兩印刷來源，另有同來源 ID 的矛盾映射
  When 維護者建立零件、變體與來源別名
  Then 只建立有證據的實際組合，不做所有顏色笛卡兒積
  And 印刷／材質納入 VariantKey，內部 ID 永不重新分配
  And 矛盾外部 ID 隔離為衝突，不能直接合併
```

### SC-004 @happy-path @critical

- [ ] **Scenario: 凍結分母與狀態生命週期**
  - SPEC 對應：§3.4、4.2、5.2；AC-004、AC-009、AC-010。
  - 涉及元件：`SnapshotLifecycle`（預計元件，尚未建立）。
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

- [ ] **Scenario: 全量發布與逐項完成證據**
  - SPEC 對應：§3.4、8.1；AC-009、AC-017。
  - 涉及元件：`CatalogCoveragePolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-013、UT-014、UT-015、IT-002、CT-005、ET-009。

```gherkin
@happy-path @critical @smoke
Scenario: SC-005 全量發布與逐項完成證據
  Given 實際來源範圍已審查且 A>0、U=0、G=0、V=A，沒有分類／品質／映射缺口
  When 維護者要求正式發布
  Then C=A+R+U 且 Ready 變體逐一與已確認分母對應
  And 報告列出所有實際變體的來源與品質證據，不混入 fixtures
  And 僅全部門檻通過可切換 Published，單一門檻失敗維持舊 head
```

### SC-006 @happy-path @critical

- [ ] **Scenario: 驗證真實 GLB 與 Unity 產物**
  - SPEC 對應：§4.2、8.1；AC-005、AC-007、AC-025。
  - 涉及元件：`ModelValidationService`（預計元件，尚未建立）。
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
  - 涉及元件：`CoordinatePolicy`（預計元件，尚未建立）。
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

- [ ] **Scenario: 接點配對與碰撞空腔**
  - SPEC 對應：§4.3；AC-008、AC-014。
  - 涉及元件：`ConnectorCompatibility`（預計元件，尚未建立）。
  - TDD 對應：UT-022、UT-023、UT-024、IT-004、CT-004。

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
  - 涉及元件：`UsageClassification`（預計元件，尚未建立）。
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
  - 涉及元件：`RevisionManifestPolicy`（預計元件，尚未建立）。
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

- [ ] **Scenario: 單一 session 的共用查詢契約**
  - SPEC 對應：§6.1–6.2；AC-015、AC-019。
  - 涉及元件：`BrickCatalog`（預計元件，尚未建立）。
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

- [ ] **Scenario: 新增貨號及冪等重建**
  - SPEC 對應：§4.2、5.2、6.3；AC-010。
  - 涉及元件：`RevisionBuildPolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-031、UT-032、UT-033、IT-006。

```gherkin
@alternative-path @critical
Scenario: SC-011 新增貨號及冪等重建
  Given 已有 Published，另有基準日後推出的新貨號及同工作鍵重試
  When 建立較新基準的後繼快照並重跑工作
  Then 新貨號進入較新基準快照，舊快照不變
  And 同鍵同輸入重用成功結果，同鍵不同輸入回衝突 exit 5
  And 修改模型／metadata／製作工具產生新 source revision，不重用舊內容
```

### SC-012 @alternative-path @critical

- [ ] **Scenario: 更新後仍能讀取舊模型引用**
  - SPEC 對應：§5.3、6.5；AC-011、AC-023。
  - 涉及元件：`ModelReferenceResolver`（預計元件，尚未建立）。
  - TDD 對應：UT-034、UT-035、UT-036、IT-007、CT-003、CT-006、ET-010。

```gherkin
@alternative-path @critical
Scenario: SC-012 更新後仍能讀取舊模型引用
  Given 存檔 fixture 引用舊 snapshot／variant／revision，新目錄已停產該變體
  When 以精確引用解析資產並查詢新取得清單
  Then 舊引用取得對應的相容 RuntimeBuild，不自動改成最新 revision
  And 舊名稱／分類從凍結投影取得，不 join 最新可變資料
  And 停產變體不進入新取得清單，舊引用仍可載入
```

### SC-013 @alternative-path @critical

- [ ] **Scenario: 來源缺件時補建而不以占位品交付**
  - SPEC 對應：§4.2、8.3；AC-005、AC-007、AC-018。
  - 涉及元件：`ModelBuildPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`RuntimeBuildPolicy`（預計元件，尚未建立）。
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

- [ ] **Scenario: 唯讀安裝與本機資料分離**
  - SPEC 對應：§5.3、6.4；AC-022、AC-025。
  - 涉及元件：`LocalStoragePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`InstallUpdatePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`SaveTransactionPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`CatalogStartup`（預計元件，尚未建立）。
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

- [ ] **Scenario: 非法查詢與不存在變體有明確結果**
  - SPEC 對應：§6.1–6.2；AC-015、AC-019。
  - 涉及元件：`VariantQueryValidator`（預計元件，尚未建立）。
  - TDD 對應：UT-058、UT-059、UT-060、CT-002、CT-003、CT-009。

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

- [ ] **Scenario: 來源中斷與限流保留進度**
  - SPEC 對應：§6.3、8.3；AC-001、AC-018。
  - 涉及元件：`SourceRetryPolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-061、UT-062、UT-063、IT-013。

```gherkin
@error-handling @critical
Scenario: SC-021 來源中斷與限流保留進度
  Given 來源遇到 timeout、429 含 Retry-After 或服務中斷
  When 製作工具依保存工作重試
  Then 遵守 Retry-After 並最多自動重試 3 次，超限保留待恢復
  And 失敗不清空成功候選或把缺資料判成停產
  And 來源憑證不寫 URL／日誌，工具失敗 exit 4
```

### SC-022 @error-handling @critical

- [ ] **Scenario: 建模工作當機與重複工作鍵**
  - SPEC 對應：§6.3、8.3；AC-010、AC-018。
  - 涉及元件：`CatalogJobPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`AtomicPublishPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`ContentPathPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`SaveCompatibilityChecker`（預計元件，尚未建立）。
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
  - 涉及元件：`NativeDependencyPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`CatalogCoveragePolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-079、UT-080、UT-081、IT-002、CT-005、ET-009。

```gherkin
@edge-case @critical
Scenario: SC-027 空目錄與單一未解決項目不能全量發布
  Given 分別使用 A=0、U=1、G=1、V=A-1 或未分類一筆的資料
  When 計算覆蓋率並要求發布
  Then A=0 顯示「尚無已確認基準」，不除以零或顯示 100%
  And 任一未知、缺口、缺 revision 或分類缺漏均阻止正式發布
  And V/A=100% 但無涵蓋審查仍不是全量完成
```

### SC-028 @edge-case @critical

- [ ] **Scenario: 分頁邊界與固定排序**
  - SPEC 對應：§6.1；AC-015、AC-019。
  - 涉及元件：`VariantPagingPolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-082、UT-083、UT-084、IT-008、CT-002。

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

- [ ] **Scenario: 尺寸、接點與資產預算門檻**
  - SPEC 對應：§4.3、8.2；AC-006、AC-008、AC-020、AC-024。
  - 涉及元件：`MetadataValidationPolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-085、UT-086、UT-087、IT-004。

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
  - 涉及元件：`PublishConcurrencyPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`AcquisitionEligibility`（預計元件，尚未建立）。
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
  - 涉及元件：`ModelLeasePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`CatalogPreviewPresenter`（預計元件，尚未建立）。
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
  - 涉及元件：`CatalogPreviewPresenter`（預計元件，尚未建立）。
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
  - 涉及元件：`PreviewCameraController`（預計元件，尚未建立）。
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
  - 涉及元件：`MaterialPreviewPolicy`（預計元件，尚未建立）。
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

- [ ] **Scenario: 搜尋空狀態可以清除條件恢復**
  - SPEC 對應：§7；AC-015、AC-016。
  - 涉及元件：`CatalogPreviewPresenter`（預計元件，尚未建立）。
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
  - 涉及元件：`CatalogPreviewPresenter`（預計元件，尚未建立）。
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
  - 涉及元件：`SelectionRequestPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`RetryRequestPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`PreviewLifecycle`（預計元件，尚未建立）。
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
  - 涉及元件：`GraphicsCapabilityPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`PerformanceGate`（預計元件，尚未建立）。
  - TDD 對應：UT-127、UT-128、UT-129、IT-018、ET-011。

```gherkin
@performance @critical @frontend
Scenario: SC-043 本地查詢與單件冷載入時間
  Given SSD 基準機及 max(100000,A) 筆 metadata 與可載入模型
  When 暖機後查詢 1000 次，另測單模型冷載入
  Then 50 筆分頁查詢 P95 ≤100 ms、詳情 P95 ≤50 ms，資產載入不混計
  And 單模型冷載入至第一個正確畫面 ≤3 秒且顯示載入狀態
  And 紀錄 CPU／GPU／驅動／套件／manifest 與 cold 定義，不以主執行緒同步查詢
```

### SC-044 @performance @critical @frontend

- [ ] **Scenario: 2026 片畫面與實際 Player 流暢度**
  - SPEC 對應：§8.2；AC-020、AC-025。
  - 涉及元件：`FramePerformanceGate`（預計元件，尚未建立）。
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
  - 涉及元件：`ResourceCachePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`VehicleMetadataPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`PreviewPackagePolicy`（預計元件，尚未建立）。
  - TDD 對應：UT-139、UT-140、UT-141、IT-019、CT-010、ET-015。

```gherkin
@risk-regression @critical @frontend
Scenario: SC-047 隔離技術預覽與正式全量交付
  Given Frozen固定版本含已驗證代表資產、Unknown與Retired反例，正式全量尚有缺口
  When 建置並安裝Preview，再以Release開啟該包及請求正式取得用途
  Then Preview僅含Ready且RuntimeBuild通過及使用條件可核對的非Retired代表件，Unknown顯示「生產狀態待查」；顯示「技術預覽・非完整模型庫」與完整C/A/R/U/G/V及子集合數
  And Release回IncompatibleContent及「此資產包僅供技術預覽，不能作為正式遊戲資料。」；包類型鎖在建置，不可改設定繞過
  And Preview資料根獨立且只可Browse，不發道具、不寫正式進度、不匯入正式profile、不切正式head，畫面通過不提高全量完成度
```

### SC-048 @risk-regression @critical

- [ ] **Scenario: 先驗證Frozen候選再發布已驗證內容**
  - SPEC 對應：§13.2；AC-028；GAP-002。
  - 涉及元件：`ValidationPromotionPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`InstallLifecyclePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`SaveRecoveryPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`RuntimeReferencePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`CatalogInputPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`AssetIntegrityPolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`VisualAcceptancePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`BenchmarkEvidencePolicy`（預計元件，尚未建立）。
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
  - 涉及元件：`WheelMetadataPolicy`（預計元件，尚未建立）。
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
**最後更新**：2026-09-09
**狀態**：Ready for well-done；56 場景、20 個 @frontend 場景均未實作。
