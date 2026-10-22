# SPEC-001-BrickModelCatalog TDD 測試清單

> **來源**：[BDD 場景文件](../bdd/SPEC-001-BrickModelCatalog-BDD.md)
> **規格**：[SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md)
> **需求**：[MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
> **生成日期**：2026-09-09
> **最新核對**：2026-10-22；**Gate 3 固定20件技術里程碑已驗收完成，可開始 Gate 4**（僅 SPEC-001）。Gate 2 幾何20/20；Gate 3 QA品質／Frozen20/20、真Windows Player與離線安裝／更新／唯讀／故障30/30、正式LEGO來源子集合9/9 RuntimeBuild／Player與獨立verify Passed。QA11件不可冒充正式來源；Gate4將改採使用者指定盒組作來源及新增模型的正式分母，效能／全SPEC驗收與Preview／Release仍依原規格獨立處理，TDD未完成條目不降標、不自動勾選。

## 最新進度與驗收邊界

| 範圍 | 最新狀態 | 判定說明 |
|---|---|---|
| **Gate 2：固定20件模型** | **20/20 幾何 Ready** | 三軸尺寸逐軸誤差 ≤ `max(0.1 mm, 來源軸長0.5%)`；20/20 具備原始 LDraw 對照與真 Unity glTFast／MeshCollider 接點、碰撞、空腔的 `Verified` 證據 |
| 尺寸／碰撞／Player 基線 | 尺寸 **20/20**；碰撞 **20/20**；GLB ≤20 MiB **20/20** | 內部 Player 已能載入、操作20件；六方向畫面與 preview evidence 20/20 |
| **Gate 3 真實 Catalog 品質管線** | **20/20 Ready；60項已核准審查正式提交** | `brickhigh-gate3-quality-submit` 逐件沿用 `complete_revision_quality`；實跑Job `3b2ae26d-8449-41f3-adfd-294802cb995a` succeeded／exit 0，安全重試Job `406beb5b-0994-480a-813d-c9668654825c` succeeded／exit 0且SQLite位元組不變。原Pending模板及核准聲明綁定的summary永久保留，當前狀態見current-status.json；此Ready不會使fixture自動取得正式身份。 |
| **Gate 3 內部 Windows 安裝／Player** | **本批30/30 checks、exit0；固定20件真操作** | 最新Build Job `f10b2b1d-f785-4e1c-b7ac-4e7bc31bd135` succeeded／exit0；真原生安裝／A→B更新／可寫+唯讀啟動器與Player／每場景20件382幀22操作／storage denied／missing SQLite／uninstall及profile保留皆通過，Player Job `6d25a8f0-15e3-420c-a7de-4f9f13990961` succeeded／exit0、無失敗。F-Catalog是隔離內部QA，**不是正式20/20 RuntimeBuild或可發佈Preview／Release**。 |
| **Gate 3 正式 Frozen BuildValidationContent** | **已取得的官方來源9/9 RuntimeBuild+Player Passed** | 原QA Frozen v42仍保留；後繼LEGO官方Frozen `7f67a752-65a7-4817-a453-4ed4d90c8834` v20具9件Ready，真Unity Windows建置Job `8cad067c-039e-45a3-ac9b-43478fb2337c` exit0、獨立verify Job `a405fe34-24ef-47c2-8f39-0f8578414eb4` exit0／Passed；證據 `artifacts/validation-content/20261021T014631-27c55311/`。剩餘11件未擅自升格正式身份或RuntimeBuild，將在Gate4依實際盒組驗證；產品正式發佈仍未完成。 |
| **來源修訂Ready／正式來源資格** | **原QA Ready20/20，正式來源9/20、其餘11件待補** | 使用者確認9件官方Element圖片及4032a模具用途等價，9份SHA審查已由原Catalog來源API合法後繼匯入，Job `d4af4b06-c044-4535-b053-34a15c59709e` Passed。其餘11件沒有同外觀官方身分，不冒認通過；原QA/Frozen歷史不變。 |
| TDD 總進度 | **111/233（47.6%）** | 已符合111、部分符合90、未符合32；UT-142有獨立核對證據，原233個ID均保留 |
| BDD／UX／SPEC | **13/56（23.2%）**；**1/20（5.0%）**；**3/36（8.3%）** | 2026-10-22逐項對照原BDD56個SC，補勾SC-008/020/028/029（均有完整對應TDD綠燈），SPEC36個AC狀態為3完整、28部分、5未符合；UX不因非前端場景新增勾選。 |
| 工作範圍 | **Gate 3 固定20件技術驗收完成；可進 Gate 4** | 先驗證20件QA模型／內部真安裝Player與9件真來源正例；Gate4才以**實際指定盒組**為全量身分與模型分母（10334只是例子）、擴大實例、檢查效能與剩餘正式條款，既有幾何不重做，真Preview/Release閘門不解除。 |

**判定原則**：Gate 2 只檢驗固定20件模型的尺寸與合理接合／碰撞；不要求先歸屬特定盒組、取得該盒組官方 Element／Design 或完成後續發布人工核准。這是**幾何階段里程碑**，不會自動更動正式資料庫 `ModelRevision` 狀態、`visualApproved`、`visualBaselineId`、Frozen/Published 或正式 Release 門檻。


### 2026-10-22 SPEC／BDD／UX／TDD核對修正（最新）

- **TDD**：原233個ID保持唯一，逐項`[x]`111（UT96／IT6／CT7／ET2），未勾選122；完成率47.6%，分類矩陣為111符合／90部分／32未符合，不因BDD勾選再增加UT/IT/CT/ET數。
- **BDD**：56個不同SC均有單一checkbox，原文件實際勾選9個卻宣稱11/56；對照下列所有已勾選對應測試的Given／When／Then，補勾漏記的`SC-008`（UT022～024/IT004/CT004）、`SC-020`（UT058～060/CT002/003/009）、`SC-028`（UT082～084/IT008/CT002）、`SC-029`（UT085～087/IT004）。現行實際勾選**13/56（23.2%）**，43場景尚未完整勾選；不是新增測試數。其餘BDD即使有部分技術證據，缺完整對應或獨立UX/Preview/Release條件仍不得補勾。
- **UX**：20項中僅SC-037已勾選，**1/20（5.0%）**；其餘16部分、3未符合（這是UX原稽核分類，非由checkbox直接推算），本輪新增的4個SC都不是前端UX。
- **SPEC AC**：驗收矩陣36列ID唯一，實際**3符合（AC-002、003、010）／28部分／5未符合**，3/36=8.3%；之前稽核說明的27部分/6未符合與矩陣不同，已校正。AC仍有正式盒組、Preview/Release或完整正式身份等條件未完成，不能由單一SC完工推動AC自動通過。MVP requirement、SPEC、BDD及overview的頂部最新進度均已同步；有日期的舊執行紀錄標示為歷史，不作現況。
- **Gate狀態**：Gate3固定20件隔離QA技術里程碑完成，真官方來源僅9件正式RuntimeBuild成功，剩餘11件QA選色不冒充正式身份；Gate4繼續真實指定盒組來源全集與正式發布標準。保留原233 TDD、56 BDD、36 AC、20 UX測試及正式來源發布保護。

### 2026-10-22 TDD 233項核對補正：UT-142新通過，其他項目保留

- **UT-142 `ValidateCandidate_FrozenSnapshot_LeavesHeadUnchanged`升格為通過**：`tools/catalog/tests/integration/test_validation_content.py`既有隔離的規則測試已涵蓋Frozen未Published即可建立staging、Ready子集合可Prepared、結果寫入`validation_builds`仍保留原head、摘要漂移/不合格Player報告不可提交Passed。經現有受控MCP聚焦重驗Job `04403115-f8fe-447c-a71f-a25d52187951` **26/26 passed／exit0**。合成UnityFS/畫面只用於單元規則核對；真實9件官方來源的Windows RuntimeBuild／Player及獨立verify正例，另由Jobs `8cad067c-039e-45a3-ac9b-43478fb2337c`及`a405fe34-24ef-47c2-8f39-0f8578414eb4`證實。
- **此輪已通過但不重複加分**：原`ET-006`離線安裝／更新／資料保留早已勾選；近期固定20件F-Catalog真Player 30/30、Acceptance回歸81/81只是更新其可追溯Job。**仍不能勾選**：`IT-020`需真Preview包及完整staging、`UT-143/144`及`IT-021`需完整發布摘要/CAS正反例、`ET-001`需乾淨斷網環境完整安裝證據、`ET-008`需自製修補模型全鏈；已有部分證據不能假稱完整Then/And。
- **精確統計**：TDD由`110/233（47.2%）`→**`111/233（47.6%）`**；單元UT `95→96/168`、部分符合 `91→90`、未符合32不變，IT6、CT7、ET2不變。BDD經2026-10-22跨文件複核另補4個完整SC（由9勾選到13/56）；UX1/20、SPEC3/36維持不變；`SC-048/AC-028`需其他測試全部閉環才能升格。**Gate3固定20件技術里程碑完成**與**完整SPEC的233項TDD完成**屬不同驗收層次，Gate4接手指定盒組官方全量及仍未完成的Preview／Release／效能等規格。

### 2026-10-21 Gate 3 階段技術里程碑結案／Gate 4 接續準備（歷史結案批次，最新TDD項目稽核見上方）

- **使用者授權的驗收分工**：Gate 3對原固定20件檢驗**尺寸／形狀／連接／碰撞／Catalog QA修訂／Frozen／實際Windows安裝Player／更新與故障矩陣**，另須以已取得官方外觀核准的LEGO Element子集驗證嚴格正式Catalog→RuntimeBuild→Player→獨立verify可行性；不要求任意QA選色都取得LEGO官方生產Element。Gate4才以**使用者實際指定盒組**建立真實inventory唯一Element身份分母、模具與顏色印刷、去重增量建模、全量來源品質／正式資產／指定硬體效能及原SPEC其它條款。這是**Gate里程碑分工調整**，不是正式產品來源或發行標準的豁免。原233 TDD、56 BDD、36 AC、20 UX項目不刪除，整份SPEC未結案。
- **20件QA模型／品質／Frozen合格證據**：Gate2逐件尺寸誤差≤`max(0.1mm,0.5%)`、接點／碰撞20/20與外觀預覽20/20；`artifacts/acceptance/gate3-fixed20-staging/current-status.json` SHA `ba2380ed84d9e9b3d7c3a916c85521d09c2f0eff7fa1cc62eef2b43edfa46d89` 以`purpose=Gate3 fixed20 QA-only`明示隔離、itemCount20、`readyCount=20`、`pendingReviewCount=0`，原QA Frozen `0218014f-94cc-41a6-907d-11f795567f00` v42保留；原品質提交Job `3b2ae26d-8449-41f3-adfd-294802cb995a` succeeded，安全重試同SQLite bytes。
- **真Windows安裝版完整操作**：最新內部F-Catalog Windows Player Build Job `f10b2b1d-f785-4e1c-b7ac-4e7bc31bd135` **succeeded exit0**，生成`artifacts/acceptance/toolchain-20261021T022502-b6d04c11/Package`。真Installer／Launcher／Player Job `6d25a8f0-15e3-420c-a7de-4f9f13990961` **succeeded exit0、30/30 checks、failedChecks=[]**；A→B更新、可寫及唯讀各20件382畫面／22操作、profile不變、缺原生依賴、儲存權限拒絕、uninstall與既有資料保留全部通過。Player evidence位於獨立本機驗收資料根 `AppData/Local/brickhigh-local/player-acceptance/16b8aee4-5d18-427f-9a7a-b432a185e0b3/evidence`。F-Catalog仍不得用於正式Preview／Release。
- **來源與正式Unity RuntimeBuild正例**：9件真LEGO官方來源已合法後繼匯入（Job `d4af4b06-c044-4535-b053-34a15c59709e` exit0），真正式Frozen `7f67a752-65a7-4817-a453-4ed4d90c8834` v20，正式Windows Build Job `8cad067c-039e-45a3-ac9b-43478fb2337c` exit0、獨立verify Job `a405fe34-24ef-47c2-8f39-0f8578414eb4` exit0、9/9模型各六視圖及bundle SHA／Player passed；原始封存 `artifacts/validation-content/20261021T014631-27c55311/`。其餘11件`OfficialElementNotLocatedInVerifiedSources`保持Blocked，**不把20件QA宣稱為20件正式來源或20件正式RuntimeBuild**。
- **Fail-closed與驗收回歸**：直接重驗QA Frozen建置拒絕fixture的負例 `e65f16e7-32ad-4008-9930-9d02bd942dbb` **1/1 passed**，正式發佈沒有繞過來源。唯讀ACL矩陣第一次失敗：`run_interactive_fixture.py::_run_acl`對`stdout=None`呼叫`.strip()`，先Red Job `a11dec04-f21b-4f7d-98b5-6970abcb33d5` **1 failed**，最小修正後焦點回歸Job `60ba41a9-9c6b-437a-8aa7-81f43ae21168` **8/8 passed**；原QA staging測試原假設SQLite總revision恆等20，在9個合法source successor後變29，改成只驗原20個revision ID及Frozen不變，聚焦Job `96dd09ab-a129-4ba0-b599-98c4b94cf5f9` **1/1 passed**。完整Acceptance初輪 `47f40d31-549a-456a-b19a-2c0e25013bde` 80pass／1fail，修正後完整回歸 `26958c45-525b-4f4e-a57f-543470d14e99` **81/81 passed、exit0**。
- **結案判定**：以上固定20件QA與正式9件範例均已驗證，Gate3作為「固定20件技術能力與安裝／Player里程碑」**已完成，可啟動Gate4**；不宣告全部20件正式來源或全SPEC達成，不切Published head。Gate4第一步重新依實際指定盒組建立真實inventory／模型覆蓋分母，保留原20件幾何及9件正式來源資產能合法重用，未取得證據則依§§3.4、13.1～13.2阻擋發布；原TDD全項進度暫保持`110/233`、BDD`11/56`、UX`1/20`、SPEC`3/36`，後續逐項完整驗證才能勾選。

### 2026-10-21 Gate 3 正式來源9件／RuntimeBuild及Player真實驗證通過（歷史批次，最新里程碑以上方為準）

- 使用者本次對話明確確認9件LEGO官方Element照片與先前核准的模型外觀一致、`4032a`與`4032`在本模型用途等價。已另建9份 `build-plans/gate3-official-review-{ElementId}.json`，逐件綁定user-confirmed決策、Element、模型/metadata及原來源圖片SHA，不假稱審核身分經核實。原Pending模板、QA模型及核准皆保留；`build-plans/source-onboarding.json` SHA `efef8350a6897d06fcee29cd15585fe176e2c79fb2830e6694ecedcfe645e1bf`。
- 正式來源匯入固定Job **`d4af4b06-c044-4535-b053-34a15c59709e` succeeded／exit0／Passed**，9件Verified、剩餘11件因 `OfficialElementNotLocatedInVerifiedSources` Blocked。結果 `artifacts/source-onboarding/0ad6e36d18d765d1d248eb51f84229086f17f4fb0efed2d8790236cc680f471f/v2/result.json` SHA `482b85ff29d58d9393080576b893f0b7e1978c9eb298519e3c20d409247e36a9`。新官方Frozen `7f67a752-65a7-4817-a453-4ed4d90c8834`／v20、selection digest `bdf46db6838dc4e7dae54e4d7ea900ce280415b84f361bee8584e21f235a64b1`。舊QA Frozen v42不變，head未發布。
- 來源Job透過CAS將正式 `build-plans/validation-content.json` SHA釘選為 `cec4e7fe8af0e521db5e7cdbf50ecbb8ff262701ee9753c0c89b0971a20e0187`。真正Windows Unity正式驗證建置Job **`8cad067c-039e-45a3-ac9b-43478fb2337c` succeeded／exit0**；獨立Verify Job **`a405fe34-24ef-47c2-8f39-0f8578414eb4` succeeded／exit0／Passed**。證據 `artifacts/validation-content/20261021T014631-27c55311/`，`preflight.json`9件無issues、`editor-report.json` passed=true、`player-report.json` passed=true、`execution.json` playerExitCode=0，9件各有真mesh/材質/尺寸/六視圖 SHA與bundle SHA，`result.json` status=Passed、9個RuntimeBuild，buildId `ad3ec7d1-6d7c-473d-83c5-f1a1d8f2a815`，result SHA `8924f21c43bf5abd2eca30e7e07a7d178364210b6cde4a2274fea4df88b33728`、seal SHA `94e9f466c592baa178896876c5a6384b47c797cef33bb6bf3d8c4ba85a915489`。
- **Gate3整體尚未結案**，另11件仍缺同外觀LEGO官方Element，尤其紅`973p06`印刷、舊淺灰`14417/14418`需精確來源或未來另議外觀調整；未自行改模型、降低閘門或進Gate4。正式驗證子集9/20，非20/20；正式Preview/Release及全233項TDD繼續獨立，原計數110/233不因部分成功自動改。

### 2026-10-21 Gate 3 官方圖片取得9/9（本輪新證據）

- 在既有MCP受控流程以 `archive_external_source` 存入 **LEGO官方素材CDN** `https://www.lego.com/cdn/product-assets/element.img.lod5photo.192x192/{ElementId}.jpg`；九件候選皆 **HTTP200、image/jpeg、原始bytes與SHA完整封存**，不經其他MCP或代用第三方圖片。來源路徑均為 `artifacts/sources/gate3-official-image-{ElementId}/{source.bin,manifest.json}`；逐件JPEG SHA：
  - `300121` `e31ba3d2135b09efe186227d2247aa08ecf4982308402340dfe88fb3e880281b`
  - `302021` `b7dab10232d45917740c9b1df72aeaa1571e63187092ee9c907c779b29660ec4`
  - `6129995` `c096375e61e7639739f9b50857df1b02425a40ea3bdd36a03702d4e8433182b1`
  - `329821` `cfa7d84475f80e28e29dfe35c6506ea7728d61ff3d652fa28a5ffc64c7c7b414`
  - `403221` `8ca73f41b058e24a892af9676c61fb06c24f681c1da2f6cc9dd780cd405b6c6a`
  - `306924` `474f4ae2b04f4a117d052c35a3b59ec927231f36f5b2cd8eda589c45436e315d`
  - `6019155` `79a3197ab03acccda58e7c8116046591a0b7becac6265010cf29bea605cbf36f`
  - `300524` `00f362c49d6cc721d6c26af5b35fea849077ee3aac52721e6c9f610666f2c001`
  - `614121` `b77f933338c7a82da406da6df20685da0ca225318e3f1642f1792fc79cb2a9b5`
- 先前官方服務路徑 `https://www.lego.com/service/bricks/5/2/{ElementId}` 403，不能推論LEGO沒有該圖片。核對LEGO原始JPEG視覺可見300121為紅2×4、403221為紅色圓板、6019155為紅色側面凸點塊，但此觀察不代替逐件正式核准或4032a模具等價證明。
- **adapter缺口已修復**：`tools/catalog/source_onboarding.py::_appearance` 沿用內部 `_appearance_evidence`，在原舊路徑以外只新增精確固定URI `https://www.lego.com/cdn/product-assets/element.img.lod5photo.192x192/{ElementId}.jpg`。Element必須為ASCII 6～8位數字且逐字相符；不同domain／port／scheme／query／fragment／其他CDN路徑／不同Element均拒絕。保留來源manifest SHA、原檔SHA／byteLength／storagePath與HTTP200、8MB及像素上限。新路徑只接受image/jpeg及真正JPEG，要求192×192、完整EOI，先verify再以相同bytes實際load解碼；PNG／HTML／截斷JPEG／錯尺寸或MIME拒絕。原JSON／PNG／JPEG舊來源驗證、revision／模型／metadata SHA、Approved審查與模具等價閘門保留，未新增MCP Tools。
- `build-plans/source-onboarding.json` 只在原9個candidate加入 `officialEvidence` 的圖片與manifest雙SHA引用；輸入plan SHA `8504dd187869ff1247804b867be321cb2b4a74b0c4c4b62af1e8fe1308209eb0`。沒有填Approved／reviewPath／reviewSha256，父Frozen、版本、selection digest、20件範圍、ID及建置plan釘選均不變。缺審查時也會先驗附件；新模板帶同一圖片引用，decision保持Pending，shape／colour／print／mould全部false。
- **Red／Green**：新增 `tools/catalog/tests/unit/test_official_appearance_images.py`，Red Job `621633ad-1146-421f-94bd-c0301f951cfc` 為4 failed／29 passed；Green `dc8bc1ac-3a1e-4ad7-90f0-528c61d1b9c3` **33/33 passed**。包含正常固定JPEG、錯Element與URL／manifest／SHA／長度／HTTP／偽裝圖／截斷圖／尺寸／MIME、原人工審查與模具防護、舊JPEG／PNG相容，以及真正9份封存圖片與唯讀SQLite位元組不變。原來源流程回歸 `02a050eb-1aff-4806-805d-6a9fd5ff4fd9` **25/25 passed**；MCP **78/78 passed、0 skipped**。完整Catalog Job `7b715571-2363-4130-8de6-cac5a21797a3` **416/416 passed／exit0（801.54秒）**。真20件原核准附件唯讀重驗 `8597ae44-9da6-4583-9c8a-ff6c18d8cbf3` **2/2 passed**；`git diff --check`通過。
- **既有task實跑／安全重試**：`bc23fdf7-faf2-4383-ab9b-5df5f84db3b4`、`12bc6540-a64d-40ec-b6ae-a3e5edd6665e` 都完成20/20稽核，9/9圖片通過附件預驗；因未核准仍為Blocked／exit3。新不可變結果與9份Pending模板在 `artifacts/source-onboarding/b9d217e110d9c9c7f60ffefb54db0dff75fb9492ea19917e350720affe81e5f5/v2/`；result SHA `065b4b52fd00e0489c3bc603fa17a5b16649e3d6479d1511c1fd8b09c60557a5` 重跑完全一致。原模板及原始JPEG不覆寫。現有MCP已可使用新圖片；Node工具／task設定未改且每次啟動新的Python，無須重啟MCP或tunnel。
- 本輪九件圖片已存，但**9件人工來源外觀審查未完成、其餘11件仍缺對應官方身分**；不得自動Approved或修改已核准20件模型。正式來源資格0/20、RuntimeBuild0、正式Player0、QA Ready20/20、Frozen v42、TDD110/233不變；不進Gate4。

### 2026-10-20 Gate 3 正式來源後繼匯入固定入口（本輪最新）

**程式管線已新增，正式來源端到端尚未完成。** 唯一新增task為 `brickhigh-gate3-source-onboard`（原 `start_project_job`，900秒、不接受caller命令或參數）；輸入 `build-plans/source-onboarding.json`，固定原20件、原Frozen v42／selection digest，9件官方候選及5份完整官方封存。沒有新增MCP tools、改Write Lease或降低品質閘門。使用者另明確同意以本機檔案工具維護MCP本身；正式來源取得、匯入與資料操作仍只走GameNenStyle MCP。

- `tools/catalog/source_onboarding.py` 重驗原始request／response／manifest SHA與長度、LEGO確切URL／POST、指定盒組／無縮小篩選／完整count=total、重複Element、pinned dataset SHA與逐件part／色碼。另檢查GraphQL真正以單一searchElements(input:$input)使用已驗變數，拒絕literal條件、alias、directive或額外operation，不能僅憑variables證明查詢範圍。沿用 `map_pick_a_brick_set_response`、`load_authoritative_element_bindings`、`import_catalog`、`complete_revision_quality`、`freeze/select_revision`。多頁尚未收齊時一律拒絕，沒有將400筆上限當全量。一般mapper保持全資料嚴格拒絕衝突；固定cohort匯入可將非候選衝突隔離列入audit，候選自身衝突仍拒絕。本輪另外識別到非本批Element6117969（官方Design21712／pinned92411）、6378481（官方89954／pinned76537），未升格這兩件。
- 正式外觀審查必須明確Approved且綁定真正sourceRevision／model.glb／metadata SHA、Element／Design、精確LDraw part與colour、形狀／顏色／印刷／模具及原MCP封存的官方附件；布林聲明、第三方別名或殘缺PNG不放行。4032a對4032、3069b對3069等尾碼差異必須額外給明確模具等價證據，不能自動去尾碼。原模板只建立Pending；核准提交應另存 `build-plans/` 新檔，並在來源計畫候選填入reviewPath／reviewSha256，禁止覆寫不可變模板或手寫假官方原始資料。
- `repository.py` 的巢狀交易改用savepoint；`importing.py` 支援父Frozen版本／selection CAS、cohort缺口及原始provenance封存。整批可核實項目透過原API建立有parent的新Draft、正規variant及後繼revision，在同一外層交易內完成品質重驗、Freeze與CAS選件；故障前移轉不留半套DB狀態。原QA fixture／GLB／metadata／60項核准／Frozen歷史均保留，不切Published head。
- `quality.py::reuse_approved_revision` 只沿用可重算Ready且相同GLB／metadata SHA的既有資產核准，清楚封存原revision／原核准者與附件；另保留新的官方身分審查。新修訂仍走Building→Validating→原完整品質API，不用SQL改狀態。新增 `source_onboarding_runs` 不可變提交紀錄，crash後以同一輸入復用同一successor。提交成功後以SHA CAS原子更新validation-content plan，保留原plan bytes；CAS衝突可恢復，不重建修訂。Design未公開時保留null、geometry以Element隔離，與SPEC §3.3一致，不猜Design。
- **實際結果0/9正式匯入、0正式RuntimeBuild、0正式Player。** Job `635a8746-caf8-477c-a7d5-f473ed4d9979` 及重試 `8433c492-7cc5-4886-8135-1257b9f6e482` 都完成20/20來源稽核、exit3，業務結果Blocked；通用Job外層狀態為failed，逐件原因及Pending模板見 `artifacts/source-onboarding/5fce91a7c0d5e8a90359f643b9a2bbf9e80025a3ad2e55b6d3e0c5319077b5f2/v2/result.json`、`audit.json`、`source-mapping-conflicts.json`、`review-templates/`。result SHA `cc0b72ac324e81ade04f5de186426ef7f081a3653069acf70c7744516b179f1a`。最終query範圍檢查修正後，Job `269dcb3a-6a2e-4a5f-98cd-e0e5d73c57cd` 同樣20/20稽核後exit3／Blocked，result SHA重讀完全相同。9候選皆缺OfficialAppearanceReviewMissing；其餘11件為OfficialElementNotLocatedInVerifiedSources，僅表示本次已驗來源未取得，不表示不存在。
- **真實來源取得阻塞**：官方新增name欄位查詢成功；另外已對10698、40875、42210、40408、43269五份完整回應逐一核對，9候選的imageUrl皆為null（10698另有7個非本批Element有圖片，不得借用）。新增4份原MCP封存在 `artifacts/sources/gate3-image-field-{40875,42210,40408,43269}/`，derived audit／response SHA見同v2目錄 `image-field-audit.json`；測過color／colour等欄位回GraphQL400（原bytes已封存，不能假設有顏色證書）。原 `archive_external_source` 取得300121官方圖片端點回HTTP403。既有 `capture_lego_replacement_parts_metadata` 開啟10698官方頁成功HTTP200，使用者已回覆搜尋／選取300121，再次擷取實際回 `LEGO_REPLACEMENT_OFFICIAL_METADATA_NOT_FOUND`。未改用其他MCP操作瀏覽器、未繞安全檢查。現有外觀adapter只接受已SHA封存的對應Element圖片／結構化原始附件；未驗證的Next/HAR形狀不可直接當已支援。需要先取得真正可驗證的官方外觀內容；這個來源／擷取缺口未解決前，不能宣稱ChatGPT已可無人工介入完成全套正式驗收。

| 其餘11件 | 精確阻塞／接續方向（第三方僅作搜尋線索） |
|---|---|
| 3001透明／LDraw47 | 缺同透明外觀官方Element及pinned alias；11040／40953盒組線索不等於正式核准 |
| 973p06紅／4 | 目前同印刷線索主要黑色，原LDraw預設-c0；紅色同印刷未證實，不能自行改黑或換印刷 |
| 2780紅／4 | 缺同色官方Element與pinned alias；保留紅色，不能套其他色 |
| 3437紅／4 | DUPLO歷史part／色有第三方存在紀錄，尚無本外觀官方身分 |
| 3700舊淺灰／7 | 需歷史同色官方資料；不能套71淺藍灰 |
| 4085c舊淺灰／7 | 408502只是第三方候選；需確切c模具與舊色證明 |
| 30374紅／4 | 有第三方存在線索，尚缺同色及版本官方封存 |
| 14417舊淺灰／7 | 第三方主要深藍灰；原舊淺灰未證實，不自改72 |
| 14418舊淺灰／7 | 第三方主要淺藍灰；原舊淺灰未證實，不自改71 |
| 2456黃／14 | 有第三方存在線索，尚缺同色／精確版本官方身分 |
| 6060紅／4 | 有第三方存在線索，尚缺同色／精確版本官方身分 |

**接續順序**：常駐MCP需重新載入才能顯示新task，本輪未重啟tunnel。ChatGPT Desktop以 `@gamenenstyle-local-workspace well-done resume` 讀此段、確認lease及必要指令後，先補真正官方原始外觀附件與逐件審查，再以SHA保護更新來源計畫並跑 `brickhigh-gate3-source-onboard`；只有Passed後才跑既有 `brickhigh-unity-validation-content-build`、`brickhigh-validation-content-verify`。對紅973p06、球接件舊色與4032a模具，若需改模型或換版本，必須先人工決策。當前Ready20/20、QA Frozen v42、正式來源0/20、RuntimeBuild0、TDD110/233、BDD11/56、UX1/20、SPEC3/36不變，不進Gate4。

**本輪測試**：先Red17項缺模組／Design必填；後續新增非候選衝突與殘缺圖片Red2項、Pending模板Red1項。最終聚焦 `078bdd19-7a02-4689-833a-04a1fd5b7598` **25/25 passed**（新增實際query必須使用$input、拒絕literal篩選與conditional directive；Red `3efb1fb9-e990-4f1c-a53d-5bd0989a8a9c` 2 failed）（含5個crash點、重試位元組不變、SHA／錯盒組／缺頁／色碼／模具／未核准、Element-only真preflight、提交後build-plan CAS恢復）。MCP **78/78 passed、0 skipped**，npm check／check:source-onboard通過；補固定UTF-8父子程序環境測試，不接受caller注入任意env。完整Catalog最終固定版本回歸Job `3828cda0-f324-449c-befe-51730ac4cfcc` **383/383 passed／exit0（421.04秒）**。真20件原核准唯讀重驗 `a9cb0e15-2777-4791-bc94-ba4a455e2478` **2/2 passed**；`git diff --check`通過。前次 `5adf1aee-552f-4707-8300-25c9873892cf` 為380 passed／1 failed，唯一為既有錯誤訊息Design ID字樣契約，已保留原措辭並補具體ID，原mapper單元 `446f29aa-fab8-475e-80c8-829f93b7882d` 10/10通過；較早 `5d972748-84ef-4a3f-8470-079a4bd2062f` 在程式修改中啟動，13項失敗為舊mapper快取與新required_element_ids介面混用，不能算有效的固定版本完整回歸。

### 2026-10-20 Gate 3 固定20件來源「形狀×顏色×印刷」覆查（來源候選歷史）

**此為來源存在性稽核，不是正式Catalog來源放行**。已從現有20件QA `current-status.json` 與 pinned crosswalk 精確區分 LDraw 顏色與零件版本，並新增本機 MCP 封存的官方盒組 PickABrickQuery。因官方回應僅揭露 Element／Design，色碼由 pinned 第三方資料映射，官方候選仍須完整 source onboarding／外觀覆核。

- 已封存完整 LEGO 官方查詢：`42210` **257/257**（`artifacts/sources/gate3-verify-42210-source/`，response SHA `d5ab6449d221aff20f8c06c0874589c637dd0e9a1ac99502115f0a1bdb02a40d`）對應 **⑥紅色3705：Element 6129995／Design 3705**；`40408` **47/47**（`artifacts/sources/gate3-verify-40408-source/`，SHA `9125178e47473bd39b9ff085eaeb376b447f48a4cc043aef7b39f878db5459a0`）對應 **⑩紅色4032a：Element 403221／Design 4032**，但 4032a 精確模具變體尚未核准；`43269` **349/349**（`artifacts/sources/gate3-verify-43269-source/`，SHA `98759d4dd5bcf7d1b6f11316e97541a51f4b823b193de3a1be42c9dbf1c6500f`）對應 **⑯紅色11211：Element 6019155／Design 11211**。前輪的①②⑧⑪⑲⑳六件仍有效；**共9/20件有set-scoped官方Element／Design「候選同鍵」**，不是9件正式來源資格。
- 其他封存的官方回應包括11040、6462、11374、21324、76161、77070、40581、10325、60423、60443、40474、77263、42223、60414、60365、76039等。部分查詢 `total>count`（例11374為468/400、21324為528/400）是後端單頁上限，**不可將不完整回應偽裝成全量來源**；部分舊盒組回傳0亦不證明該零件從未生產。
- 已從第三方可公開查閱的真盒組／顏色紀錄得到其餘樣本多數並非「不存在」：③透明3001（BrickLink盒組11040／40953）；⑤紅2780；⑦紅3437 DUPLO；⑨舊淺灰3700；⑫舊淺灰4085c（例如6462，Element候選408502）；⑬紅30374；⑰黃2456；⑱紅6060，均有相同基本part／顏色的外部紀錄；⑥／⑩／⑯亦有上述官方同鍵候選。這些資料僅屬**第三方存在性線索**或官方Element／Design同鍵候選，不等於本QA修訂已獲正式來源核准。④、⑩、⑭、⑮必須額外核對具體印刷、模具或舊色。
- **確切顏色差異**：LDraw 官方 `7=Light_Grey`（舊淺灰），`71=Light_Bluish_Grey`（淺藍灰），不是相同顏色。⑭ `14417`、⑮ `14418` 的現行QA為 `colour=7`，但第三方零件目錄主要記錄14417的深藍灰、14418的淺藍灰，未取得**相同舊淺灰**的可信正式盒組身分；不得自動轉成色71或72。④ `973p06` 現行QA `colour=4` 紅色，但官方LDraw `parts/973p06.dat` 的 `!CMDLINE -c0` 為黑色預設，BrickLink `973pb0069` 印刷款的既有迷你人偶紀錄亦是黑色；**紅色同印刷外觀尚未證實**。⑩ `4032a` 不能只由官方Design `4032` 推導為完全相同模具，待形狀／版本比對。
- 外部查證參考（非官方 Element/Design 證書）：`https://ldraw.org/parts/colour.html`、`https://library.ldraw.org/parts/14205`、`https://www.bricklink.com/catalogItemIn.asp?P=973pb0069&in=M`、`https://www.bricklink.com/v2/catalog/catalogitem.page?P=14417`、`https://www.bricklink.com/v2/catalog/catalogitem.page?P=14418`。BrickLink、New Elementary等資料只用來找候選／辨識錯色，正式來源依原immutable官方請求／回應核對。
- **處理原則**：不重建已過Gate2的模型、不改使用者核准的GLB／revision／色碼、不以「找不到」判定一定不存在、不刪fixture、不直接改SQLite、不以第三方別名冒充LEGO官方。正式QA來源匯入／successor／Frozen改選仍需安全受控的MCP固定job與人類決策（對④⑭⑮的實際顏色與⑩的模具）；`ModelRevision Ready=20/20`、Frozen v42、正式來源資格0/20、RuntimeBuild0、Published head=null、TDD110/233、BDD11/56、UX1/20、SPEC3/36不變；不進Gate4。

### 2026-10-20 Gate 3 官方來源證據補充（尚未取得正式來源資格）

- 使用既有 `archive_external_http_exchange` 對 LEGO 官方 `PickABrickQuery` 以指定盒組、無文字篩選、含 AVAILABLE／OUT_OF_STOCK 的查詢取得完整回應：**40875 共225/225**（`artifacts/sources/gate3-40875-red-3001/`，request SHA `4def5a385da4effd5a13ac8fd352b3babba013ca1e2972f72834614e7393a4ae`，response SHA `61e869b1b9b7f33f3562b878f54dcc9047947c26b4d0705494746506dd291118`）；**10698 共230/230**（`artifacts/sources/gate3-set-10698-identity/`，response SHA `10d7edc06f853fb67b1fd3af52cc8c7330c07a5b340971058e5833bde66924f0`）。皆HTTP 200、無GraphQL errors，原request／response及manifest由MCP封存並核對SHA。
- 與原fixed20 pinned crosswalk交集後有**6/20 件官方Element／Design候選**：①`3001`紅`300121/3001`、②`3020`紅`302021/3020`、⑧`3298`紅`329821/3298`、⑪`3069b`黃`306924/3069`（40875）；⑲`3005`黃`300524/3005`、⑳`6141`紅`614121/6141`（10698）。①在兩盒組均找到。其餘14件沒有匹配；其他查詢（10696、10713、11021、11030、11033、7997、5512）均已另行封存，不得把空回應或無匹配視為完成。
- **本輪只取得官方候選證據**：GraphQL回應僅有Element／Design，LDraw顏色及造型映射仍由第三方pinned資料推得。仍須既有`map_pick_a_brick_set_response`、`load_authoritative_element_bindings`、實際來源比對、合法新Draft／後繼revision匯入及完整審查。MCP尚無可直接執行此source-onboarding與successor組合的固定工作入口，不能以測試runner冒充正式匯入或直接修改fixture／Frozen。**正式來源資格仍0/20，現有Ready20/20、Frozen v42、RuntimeBuild 0、Published head=null、TDD110/233均不變；不進Gate4。**

### 2026-10-20 固定20件已核准品質正式提交

- 新增的只是原 `start_project_job` 可執行之固定task **`brickhigh-gate3-quality-submit`**，無新增MCP tools；固定600秒，輸入固定20份review-submissions與既有核准聲明，拒絕外部命令、路徑或count。實作 `tools/catalog/quality_submission.py`，wrapper `tools/chatgpt-local-mcp/scripts/submit-brickhigh-quality-reviews.js`。
- 先整批預驗revision／變體／原計畫／Frozen membership／使用者聲明與所有實際模型、六視圖、來源和附件SHA，再封存原提交及附件，逐件呼叫 `complete_revision_quality`；沒有直接UPDATE狀態。Ready重試必須重算封存品質，且normalized核准內容完全相同；已提交品質但未寫receipt的中斷可恢復。OS鎖序列化提交，程序終止即釋放；原MCP Write Lease不變。
- 選件沿用 `select_revision`，補可選expected_version在原交易內CAS；相同選件重試不再增加version。保留原fixture scope／projection／part identity／原GLB與metadata，Published head維持null/version 0、validation_builds=0。staging重跑改為重讀原revision並驗證Ready封存，不重新建模；保留核准聲明已引用的原summary，當前狀態另存current-status.json。
- 提交batch：`16f2a42dacc0851e48d70fe74361098a97ab836292221a17c774610b7996676e`；`artifacts/quality-submissions/<batch>/result.json`與20份receipt、原提交／附件25份封存可核對。不可變提交證據SHA **`0849c7a1b297a0c86accc09cc3ef01069619ff14a0a9437290d5ad9183f72361`**。真20件模型／metadata及所有原manifest檔案逐一重讀SHA確認未變。
- 現有來源缺口稽核 `artifacts/quality-submissions/<batch>/source-gap-audit.json`，不可變SHA **`d4150e8e51715a6b62c38e4ad01238e890bd862e22ee585a13dabf131f1af955`**，保留crosswalk與官方identity audit原bytes。Pinned bulk Design 19/20、Element alias15/20是第三方對照；透明3001色47、2780色4、14417色7、14418色7及973p06色4仍缺pinned alias；973p06僅LDraw／BrickLink裝飾件對照，官方Design／Element未建立。既有其他盒組的官方來源不能套到不同色／印刷；**不是要求20件必須屬於10334**。需要逐件可驗證的實際外觀官方來源及合法後繼匯入，不能僅刪fixture冒充正式來源。
- Red：新增品質提交13項因模組缺失失敗；Frozen CAS及Ready staging續跑各先失敗後修正。Green：品質提交15/15、真核准／staging重驗3/3、MCP76/76（0 skipped）、新模組標準庫trace行覆蓋90.35%（206/228）；npm run check、check:quality-submit、git diff --check通過。完整Catalog最新結果見下方有效驗證表。
- 第一個額外Unity重跑 `be56dd7e-9591-4357-b8fd-e3e258b88501` 三次UPM IPC失敗：本次隔離SDK stdio測試client的預設環境未繼承ProgramData。查實SDK預設清單後僅補送必要Windows OS變數重跑，未修改MCP安全環境白名單／平台授權；上表a86a2f4f實際進入原builder並清楚回報來源阻擋。原常駐MCP需重新載入才顯示新task，本輪未重啟tunnel。
- 本批不提升TDD110/233、BDD11/56、UX1/20、SPEC3/36，不偽造正式RuntimeBuild或正式Player結論，不進Gate4。

### 分層 TDD 完成度

| 類型 | 已符合 | 部分符合 | 未符合 | 合計 |
|---|---:|---:|---:|---:|
| UT（單元） | 96 | 50 | 22 | 168 |
| IT（整合） | 6 | 20 | 3 | 29 |
| CT（程式內契約） | 7 | 7 | 0 | 14 |
| ET（端對端／安裝／視覺／效能） | 2 | 13 | 7 | 22 |
| **合計** | **111** | **90** | **32** | **233** |

每個原始測試ID只計一次；新增參數化負例、回歸項數與部分符合不增加完成數。下方保留完整233項測試定義、BDD追溯及逐項實作證據矩陣。

### 最後有效驗證證據

| 驗證 | 結果／來源 |
|---|---|
| Gate 2 fixed20 獨立判定 | `artifacts/acceptance/gate2-fixed20-metadata-inputs/summary.json`：`itemCount=20`、`referenceDimensionCount=20`、`collisionProxyCount=20`、**`gate2ReadyCount=20`**；正式Catalog `readyCount=0` |
| Gate 2 聚焦 Red／Green | 預期失敗 `ac27d968-75bd-4d9e-899c-6542cdbc81fa`（1 failed）；修正後 **1 passed／exit 0** `161ffee5-6c55-48c6-8538-9c3007e68e78` |
| 尺寸對照與碰撞明細 | `artifacts/acceptance/gate2-fixed20-source-dimensions.json`、`artifacts/acceptance/gate2-fixed20-metadata-inputs/checkpoint-review.html`；原 Unity PlayMode `73aecfc4-eac3-40d4-9c13-c05c2f1aba2c` Green |
| 20件外觀／預覽畫面 | `artifacts/acceptance/gate2-fixed20-preview-completion/manual-visual-review.html`、`artifacts/acceptance/pm-20260928-interactive-20-a/manual-visual-review.html`；不等於正式人工視覺基準 |
| Gate 3 真實 Catalog → Validating → 覆核模板 | 同一整合案例已擴大為固定**20件逐件驗證、20/20 passed／exit 0**，Job `64579a0f-8a35-4c98-b5c2-93c5152956b8`（2026-10-19，184.22秒）；原3件基線Job `9b80c0c4-2ea2-4ffc-8c8f-b81df4ca9ac8` 4/4 passed。測試使用隔離SQLite，未將人工Pending改為Ready |
| Gate 3 QA staging 首次建置／續跑 | `tools/acceptance/gate3_fixed20_staging.py`＋`test_gate3_fixed20_staging.py`：20件真SQLite修訂與覆核模板持久化，首次 **1 passed／exit 0** Job `141c408e-f4b0-4662-988a-03ee00c66aa7`；重跑沿用既有同一批revision、不重建 **1 passed／exit 0** Job `1239d3cc-ac9d-4e6d-9a17-0a112cb375c2`。正式範圍仍待人工審查 |
| 2026-10-20 使用者人工核准紀錄與逐件品質預驗證 | 使用者明確核准紀錄 `artifacts/acceptance/gate3-fixed20-staging/user-approval-attestation-20261020.json`；20份 `review-submissions/*.json` 合計60項Approved已附真尺寸碰撞、Player外觀及核准紀錄附件SHA。原Pending模板不覆寫。唯讀核對 `test_gate3_review_approval_submissions.py` **2/2 passed／exit 0**，Job `140d7ed2-64ed-4307-9486-55ed1843e2c6`；均通過Catalog `_normalize_review` 的模型封存與附件預驗。此列為正式提交前的歷史預驗證；本輪原品質API正式提交及安全重試均成功，DB已Ready 20/20、Frozen選件20/20；QA fixture及正式source identity缺口仍保留，詳見本頁最新狀態。 |
| Catalog 最新完整回歸 | **416/416 passed／exit0**（2026-10-21；801.54秒），Job `7b715571-2363-4130-8de6-cac5a21797a3`；經原MCP pytest runner。固定JPEG圖片33/33、原來源流程25/25、真20件核准唯讀重驗2/2、MCP78/78（0 skipped）、git diff --check通過。383/383為固定圖片adapter修復前歷史基線；TDD checklist110/233維持。 |
| Frozen builder／證據協定回歸 | `test_validation_content.py` **26/26 passed**；新模組標準庫trace行覆蓋 **93.99%**；MCP **75/75**、Unity EditMode **209/209**（Job `121bf773-0d29-491a-868e-81e97839cecc`）；`npm run check`、`git diff --check`通過。協定測試的Ready／UnityFS資料是隔離fixture，不能算正式資產。 |
| 真Windows validation Player共用管線 | `artifacts/acceptance/validation-content-engine-test/20261019T162319-324391d9/`：合成立方體 **testOnly**、真bundle載入、URP材質／尺寸、六張512×512畫面與exit 0；`sourceQualityApproved=false`，不產生Preview／Release或正式validation_builds。207檔／102249642 bytes已封存內容位址庫，audit摘要 `c22bfc4d7dc7a2b3241ea0482f6c9e6b0da3de09289b40b2390d475ef893eec1`。 |
| Gate 3 最新實機 Windows 內部安裝驗收 | Build Job `5a1773fc-5b29-4b86-9e8c-cde3ad8595bf` **成功／exit 0**；內部 Player acceptance Job `eb49022e-74f0-4c77-b708-aade6cb8aa9c` **30/30 checks／exit 0**、失敗0；buildId `20261019T153503-3a45ad1f`；可寫／唯讀各20件、382截圖與22操作、升級與故障/解除安裝通過。此為非正式 F-Catalog Player |
| 玩家 QA 焦點／啟動修正 | `PreviewBootstrap.cs` 在驗收模式提前設定 `runInBackground` 並記錄有限啟動階段；`InternalPreviewAcceptance.cs` 只在帶明確驗收輸出路徑時允許 InputSystem 失焦合成測試，仍檢查真實焦點與操作。之前 Player 驗收存在唯讀卡住或鍵盤焦點不穩，本次完整綠燈；正常玩家輸入設定不受影響 |
| 其他既有回歸 | .NET Core.Tests **168/168**、相容性 build exit 0；均為2026-10-18已存證結果，本次文件整理不重跑 |

### 2026-10-20 尚未完成與後續開發邊界（歷史快照；最新Gate3/Gate4以本頁頂部為準）

- Gate 2 **已按使用者最新定義完成20/20**；不要反覆以 `10334` crosswalk、缺 Element ID 或不相關的 SC-036 防呆負例將其改回0/20。
- **Gate 3 還未結案的真實阻塞**：20件人工明確核准已由原品質API正式提交為Ready並選入Frozen；剩餘問題是逐件實際外觀的正式來源身份尚未建立、QA範圍仍為fixture。最新builder已實讀version 42／20件Ready選件，仍明確阻擋20/20，validation_builds=0、head=null/version 0。需要可驗證的官方來源證據與合法後繼匯入，不能僅改fixture字樣或套用其他外觀的Element／Design。現有GLB可重用，不重做建模；來源覆蓋率／IoU、Ready、正式Player／RuntimeBuild及§13.1～13.2門檻均維持，Gate3尚未結案，不進Gate4。
- **其餘 SPEC 驗收**：完整畫面與 `visualBaselineId` 人工核准、離線安裝／更新錯誤矩陣、效能基準、輪組原型、來源與正式指定盒組全集交付等，依下列未完成 TDD 條目逐項處理；指定盒組只有**未來被正式指定**時才成為其全量 Catalog 分母。
- 保留既有 Git 工作樹及原始資產；**已獲授權進入 Gate 3，不進 Gate 4**。優先補真正的 Catalog→RuntimeBuild→Player 品質管線，保持本文件最新狀態集中呈現，不再新增歷史執行流水帳。

## 測試資料、位置與層級約定

所有位置相對 `brickhigh/`；已建立項目以本輪證據表為準，其餘仍是預計位置。Unity 測試須使用與鎖定 Editor 相容的 Unity Test Framework；Domain 不引用 UnityEngine。製作工具的 Python 測試採受控來源與真實 SQLite。單元層只能隔離規則、狀態機與判定器，不能由假 render report 推論真實畫面已正確。

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

- [x] **UT-001** `CatalogCoveragePolicy_CompleteArtifact_KeepsEvidence` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：完整來源保留 artifact、hash、observedAt 與有效日期。
- [x] **UT-002** `CatalogCoveragePolicy_ExpandedFamilies_KeepsCoverage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：System、Technic、DUPLO、人物組件及其他系列均列入涵蓋表，套裝展開與附件排除有理由。
- [x] **UT-003** `CatalogCoveragePolicy_MissingPage_ReportsGap` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：缺頁來源產生未解決 G，不宣稱來源完整。

### 1.2 SC-002 分離 LEGO Design、Element 與顏色身份

**位置**：`tools/catalog/tests/unit/test_sc_002.py`
**目標／來源**：隔離 LEGO Design／Element identity 與幾何去重規則；AC-002，BDD SC-002。
**共同前置**：同一 LEGO Design ID 有不同顏色的 Element，另有相同 Design／相同外觀被重複匯入的情境。
**共同動作**：維護者由指定盒組的 Element ID 建立／重用 Design 幾何與外觀 variant；依斷言使用受控輸入／SQLite 結果。涉及畫面或硬體時，本層只測 identity／去重規則，真實效果見對應 IT／ET。

- [x] **UT-004** `LegoDesignIdentity_SameDesign_ReusesGeometryPart` — @critical
  - 前置／動作：同一 Design ID `11211` 重複加入相同設計。
  - 預期：重用同一 Part／幾何身份，`parts` 不重複建立。
- [x] **UT-005** `LegoElementIdentity_DifferentColour_CreatesAppearanceVariants` — @critical
  - 前置／動作：同一 Design ID `11211` 分別加入 Medium Nougat 與 Earth Blue Element 外觀。
  - 預期：共用同一幾何 Part，但建立不同顏色／Element 對應的 appearance variants。
- [x] **UT-006** `LegoElementIdentity_ReissuedElementCanReuseSameAppearanceVariant` — @critical
  - 前置／動作：同一 Design 與同一外觀重複匯入／重發 Element identity。
  - 預期：重用相同 appearance variant，不因 Element 重發而重複建立幾何或相同外觀 variant。

### 1.3 SC-003 保留實際外觀變體及穩定識別

**位置**：`tools/catalog/tests/unit/test_sc_003.py`
**目標／來源**：隔離 `VariantIdentityPolicy` 規則；AC-003，BDD SC-003。
**共同前置**：同幾何有兩顏色與兩印刷來源，另有同來源 ID 的矛盾映射。
**共同動作**：維護者建立零件、變體與來源別名；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-007** `VariantIdentityPolicy_RealAppearance_CreatesVariant` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只建立有證據的實際組合，不做所有顏色笛卡兒積。
- [x] **UT-008** `VariantIdentityPolicy_PrintedKey_PreservesIdentity` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：印刷／材質納入 VariantKey，內部 ID 永不重新分配。
- [x] **UT-009** `VariantIdentityPolicy_ConflictingAlias_IsolatesMapping` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：矛盾外部 ID 隔離為衝突，不能直接合併。

### 1.4 SC-004 凍結分母與狀態生命週期

**位置**：`tools/catalog/tests/unit/test_sc_004.py`
**目標／來源**：隔離 `SnapshotLifecycle` 規則；AC-004、AC-009、AC-010，BDD SC-004。
**共同前置**：Draft 有已記錄的候選、證據、分類與規則。
**共同動作**：維護者 freeze 後建模，再嘗試修正判定；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-010** `SnapshotLifecycle_FrozenScope_RejectsMutation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Frozen 不允許改分母／證據／分類，修正須新 Draft。
- [x] **UT-011** `SnapshotLifecycle_RevisionFlow_RequiresValidation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：建模依 Pending、Building、Validating、Ready 流轉，失敗成 Failed。
- [x] **UT-012** `SnapshotLifecycle_PublishedContent_IsImmutable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Frozen 可更新所選 revision 並遞增 version，Published 不可改。

### 1.5 SC-005 全量發布與逐項完成證據

**位置**：`tools/catalog/tests/unit/test_sc_005.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-009、AC-017，BDD SC-005。
**共同前置**：指定盒組 scope 已審查且 C>0、G=0、V=C，沒有 identity／分類／品質／映射缺口。
**共同動作**：維護者要求正式發布；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-013** `CatalogCoveragePolicy_CompleteCounts_PassesGate` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：C 為指定盒組展開後去除 fixture 的候選分母，且 V=C；每個 Ready 變體逐一與已確認 Element／Design scope 對應。
  - 證據：`tools/catalog/policies.py::CatalogCoveragePolicy.evaluate`、`tools/catalog/repository.py::coverage`、`tools/catalog/tests/unit/test_sc_005.py::test_UT_013_CatalogCoveragePolicy_CompleteCounts_PassesGate`。
- [x] **UT-014** `CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：報告列出所有實際變體的來源與品質證據，不混入 fixtures。
  - 證據：`tools/catalog/tests/unit/test_sc_005.py::test_UT_014_CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery`，fixture 保留診斷但 C/V 分母完全排除。
- [x] **UT-015** `CatalogCoveragePolicy_SingleFailedGate_PreservesHead` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：僅全部門檻通過可切換 Published，單一門檻失敗維持舊 head。
  - 證據：`tools/catalog/tests/unit/test_sc_005.py::test_UT_015_CatalogCoveragePolicy_SingleFailedGate_PreservesHead`，真品質 bundle／validation build 正例與失敗 head-preservation 反例。

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

- [x] **UT-019** `CoordinatePolicy_LDrawPoint_ConvertsMeters` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：canonical 點為 (0.008,0.0096,-0.004) 公尺，GLB root scale 為 1。
- [x] **UT-020** `CoordinatePolicy_CanonicalBasis_ConvertsRotation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Unity 目標點為 (0.008,0.0096,0.004)，旋轉以 M R M^-1 轉換。
- [x] **UT-021** `CoordinatePolicy_AlreadyConvertedMesh_AvoidsSecondMirror` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：網格／法向／切線手性／面繞序／metadata 一致，匯入器既有轉換不重複鏡像。

### 1.8 SC-008 接點配對與碰撞空腔

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`
**目標／來源**：隔離 `ConnectorCompatibility` 規則；AC-008、AC-014，BDD SC-008。
**共同前置**：有 stud/tube、pin/hole、axle、clip/bar、ball/socket 及不同系列反例。
**共同動作**：驗證配對與插入後的碰撞；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-022** `ConnectorCompatibility_MatchingProfiles_AllowsPair` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：合法 profile 對及自由度可核對，不由同名 family 推定相容。
- [x] **UT-023** `ConnectorCompatibility_InsertionCavity_RemainsOpen` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：插接空腔不被整體包圍盒封死，插入 fixture 可成立。
- [x] **UT-024** `ConnectorCompatibility_RequiredConnector_RejectsMissing` — @critical
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

- [x] **UT-028** `RevisionManifestPolicy_VariantViews_RequiresSixDirections` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每變體有六視圖與對照來源，不能只用同幾何一張圖代替。
  - 證據：`tools/catalog/quality.py::_review_template`；`tools/catalog/tests/unit/test_sc_010.py::test_UT_028_RevisionManifestPolicy_VariantViews_RequiresSixDirections`，逐封存 bytes 核對 model／六方向／preview／source SHA，缺方向反例 fail-closed。
- [x] **UT-029** `RevisionManifestPolicy_Attribution_RequiresProvenance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：原始／輸出 hash、作者／授權、製作工具與來源版本完整。
  - 證據：`tools/catalog/quality.py::_validate_provenance`；`tools/catalog/tests/unit/test_sc_010.py::test_UT_029_RevisionManifestPolicy_Attribution_RequiresProvenance`，author／license／source URI／source hash／LDConfig／Blender／ImportLDraw commit／script SHA 正反例。
- [x] **UT-030** `RevisionManifestPolicy_RuntimeManifest_KeepsBuildIdentity` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：RuntimeBuild 另留 Editor、套件鎖定、coordinateProfile 與驗證 digest。
  - 證據：`game/Assets/BrickHigh/Infrastructure/ReleaseFileIndex.cs::ValidateRuntimeBuildIdentity`、`BrickCatalog.OpenAsync`、`ReadContractTests.RuntimeManifestBuildIdentity_MismatchRejectsPack`／`RuntimeManifestBuildIdentity_SourceRevisionForeignKeyRejectsDrift`；UT-030 7/7、Core 150/150、Unity EditMode 188/188 Green。

### 1.11 SC-011 新增盒組零件及冪等重建

**位置**：`tools/catalog/tests/unit/test_sc_011.py`
**目標／來源**：隔離 set-driven successor、revision identity 與工作冪等規則；AC-010，BDD SC-011。
**共同前置**：已有 Published snapshot，另指定新 LEGO 盒組帶入尚未收錄的 Element／Design，以及同工作鍵重試。
**共同動作**：由 Published 建立 successor 並加入新 scope component，再重跑工作；依斷言使用受控輸入／SQLite 結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-031** `SetDrivenSuccessor_AllowsSameBaselineAndPreservesPublishedParent` — @critical
  - 前置／動作：在相同 catalog baseline 由 Published 建 successor，加入指定盒組帶來的新 Element／Design。
  - 預期：新 identity 只存在 successor；舊 Published snapshot／entries 完全不變，且不以推出日期、在產／停產或其他 lifecycle 狀態作為 successor 前提。
  - 證據：`tools/catalog/repository.py::CatalogRepository.fork`；`tools/catalog/tests/unit/test_sc_011.py::test_UT_031_SetDrivenSuccessor_AllowsSameBaselineAndPreservesPublishedParent` 與 `tools/catalog/tests/integration/test_job_recovery.py::test_IT_006_RunJobRecovery_ScenarioMatrix_PreservesContract`。
- [x] **UT-032** `RevisionBuildPolicy_SameJobKey_EnforcesIdempotency` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：同鍵同輸入重用成功結果，同鍵不同輸入回衝突 exit 5。
- [x] **UT-033** `RevisionBuildPolicy_ChangedSource_CreatesRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：修改模型／metadata／製作工具產生新 source revision，不重用舊內容。
  - 證據：`tools/catalog/building.py::revision_input_digest`；`tools/catalog/tests/unit/test_sc_011.py` 對 source／metadata／toolchain 三類 identity 變更逐項斷言；`tools/catalog/tests/integration/test_catalog_build.py::test_build_changed_identity_input_creates_immutable_successor_revision` 驗證 predecessor manifest 不變且 successor revision 另建。

### 1.12 SC-012 更新後仍能讀取舊模型引用

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelReferenceResolverTests.cs`
**目標／來源**：隔離 `ModelReferenceResolver` 規則；AC-011、AC-023，BDD SC-012。
**共同前置**：存檔 fixture 引用舊 snapshot／variant／revision，而新的指定盒組 scope 已不再包含該 Element／Design。
**共同動作**：以精確引用解析資產並查詢新取得清單；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-034** `ModelReferenceResolver_ExactReference_PreservesRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊引用取得對應的相容 RuntimeBuild，不自動改成最新 revision。
  - 證據：`BrickCatalog.ResolveVariantAsync`／`ResolveModelAsync`；`ReadContractTests.ModelReferenceResolver_ExactReference_PreservesRevision`，完整歷史 tuple 精確回到舊 revision／RuntimeBuild／address key。
- [x] **UT-035** `ModelReferenceResolver_HistoricalProjection_RemainsFrozen` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：舊名稱／分類從凍結投影取得，不 join 最新可變資料。
  - 證據：`ReadContractTests.ModelReferenceResolver_HistoricalProjection_RemainsFrozen`，同 variant 的 current 與 historical 名稱／tier 故意不同，歷史 resolver 只回 frozen projection。
- [x] **UT-036** `ModelReferenceResolver_OutOfScopeVariant_ExcludesNewAcquisition` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不屬於目前指定盒組 scope 的變體不進入本次新取得清單，但舊精確引用仍可載入。
  - 證據：`ReadContractTests.ModelReferenceResolver_OutOfScopeVariant_ExcludesNewAcquisition`，retired variant 對 current `QueryAsync` 為空，但 exact historical projection/model 仍成功。

### 1.13 SC-013 來源缺件時補建而不以占位品交付

**位置**：`tools/catalog/tests/unit/test_sc_013.py`
**目標／來源**：隔離 `ModelBuildPolicy` 規則；AC-005、AC-007、AC-018，BDD SC-013。
**共同前置**：LDraw 缺子模型、TEXMAP 或曲面支援。
**共同動作**：維護者嘗試自建／補建並重新驗證；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-037** `ModelBuildPolicy_UnsupportedSource_RecordsFailure` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未支援來源先列 Failed 與原因，不當作完成。
  - 證據：`tools/catalog/building.py::_source_failure_reason`／`prepare_toolchain`／`build_catalog`；`tools/catalog/tests/unit/test_sc_013.py` 的真 LDraw parser 分類與 Failed revision/head-preservation 矩陣。
- [ ] **UT-038** `ModelBuildPolicy_CustomModel_KeepsEvidence` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：補建保留尺寸／外觀來源及新 revision。
- [ ] **UT-039** `ModelBuildPolicy_RepairedModel_RequiresFullValidation` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只有補件後同一品質門檻全部通過才可 Ready。

### 1.14 SC-014 引擎升版重建執行期資產

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs`（純 .NET Core harness 與 Unity EditMode 共同執行）
**目標／來源**：隔離 `RuntimeBuildPolicy` 規則；AC-011、AC-025，BDD SC-014。
**共同前置**：source revision 未變但 Editor／URP／套件鎖定或平台改變。
**共同動作**：重新製作 RuntimeBuild 映射；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-040** `RuntimeBuildPolicy_EngineChange_PreservesSourceRevision` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：source revision 保留，RuntimeBuild 身分隨建置輸入改變。
  - 證據：`RuntimeBuildPolicy.ComputeIdentity`、`ReadContractTests.RuntimeBuildPolicy_EngineChange_PreservesSourceRevision`；Editor／package lock 改變後 deterministic build ID 改變，但 ModelReference revision 保持原值。
- [x] **UT-041** `RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每個受支援舊引用映射到當前可載入產物。
  - 證據：`ReadContractTests.RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild`；真 SQLite 將歷史 source revision 映射到升版後 current RuntimeBuild，exact historical resolver 回新 build。
- [x] **UT-042** `RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不以保留舊 bundle 檔案當作相容驗證成功。
  - 證據：`ReleaseFileIndex.ValidateRuntimeBuildIdentity`、`ReadContractTests.RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility`；manifest 工具鏈升版但仍使用舊 RuntimeBuild／bundle 時 `OpenAsync` fail-closed。

### 1.15 SC-015 單一 session 的共用查詢契約

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs`（純 .NET Core harness 與 Unity EditMode 共同執行）
**目標／來源**：隔離 `BrickCatalog` 規則；AC-015、AC-019，BDD SC-015。
**共同前置**：完整已發布的本地 pack 含名稱、用途、接點與覆蓋資料。
**共同動作**：呼叫 OpenAsync、QueryAsync、GetVariantAsync、GetProfilesAsync、GetCoverageAsync；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-043** `BrickCatalog_SessionQueries_KeepSnapshot` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：全部回應固定 pack／snapshot／schema 並用 Success 或 Failure 擇一。
  - 證據：`ReadContractTests.BrickCatalog_SessionQueries_KeepSnapshot`；session 開啟後即使 manifest 指到另一 snapshot，五個讀取契約仍固定原 pack／snapshot／schema，未知 variant 為互斥 Failure。
- [x] **UT-044** `BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：詳情包含所選來源 revision、用途／錨點／車輛 metadata，規則與覆蓋值均來自同快照。
  - 證據：`ReadContractTests.BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData`；真 SQLite fixture 同時放入 anchor、vehicle metadata 與另一 snapshot 衝突 profile／coverage，回傳只取 session frozen projection。
- [x] **UT-045** `BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：只經本地資料與程式內方法取得，不啟動 HTTP 或變動擁有權。
  - 證據：`ReadContractTests.BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership`；所有公開 read calls 前後 pack 檔案集合／SHA 完全不變且無 WAL／SHM，`IBrickCatalog` surface 僅五個 read operations；runtime source 無 HTTP client/listener 依賴。

### 1.16 SC-016 唯讀安裝與本機資料分離

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalStoragePolicyTests.cs`
**目標／來源**：隔離 `LocalStoragePolicy` 規則；AC-022、AC-025，BDD SC-016。
**共同前置**：一般使用者安裝於唯讀目錄且有獨立 Profiles 與 Diagnostics。
**共同動作**：啟動、查詢並寫入診斷紀錄；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-046** `LocalStoragePolicy_ReadOnlyCatalog_AvoidsSidecars` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：catalog.db 以唯讀開啟且不產生安裝目錄 WAL／SHM。
- [x] **UT-047** `LocalStoragePolicy_WritableData_UsesUserRoot` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：可變資料只寫使用者可寫位置，不寫來源工具工作區。
  - 證據：`LocalStoragePolicy.Resolve`／`ProfileFile` 與 `LocalStoragePolicyTests.LocalStoragePolicy_WritableData_UsesUserRoot`；實際 profile／diagnostic 均落 LocalLow 產品資料根，install／source workspace 保持空白，重疊根與 traversal／nested path fail-closed；launcher 亦改用同一 policy。
- [x] **UT-048** `LocalStoragePolicy_DiagnosticRecord_RedactsSecrets` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：診斷不含金鑰／完整存檔且不自動上傳。
  - 證據：`LocalStoragePolicy.WriteStartupDiagnostic` 與 `LocalStoragePolicyTests.LocalStoragePolicy_DiagnosticRecord_RedactsSecrets`；診斷固定僅三欄，無 token／完整 save／inventory，非法 ID／非 UTC 拒絕且 `AutomaticDiagnosticUploadEnabled=false`。

### 1.17 SC-017 離線升級成功及解除安裝保留資料

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallUpdatePolicyTests.cs`
**目標／來源**：隔離 `InstallUpdatePolicy` 規則；AC-022、AC-023，BDD SC-017。
**共同前置**：遊戲已退出，舊 profile fixture 與版本 A 安裝完整。
**共同動作**：以完整包安裝 B，重新啟動後預設解除安裝；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-049** `InstallUpdatePolicy_ValidatedStaging_SwitchesVersion` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：B 完整 staged 且 hash 通過才切換啟動版本。
- [x] **UT-050** `InstallUpdatePolicy_Uninstall_PreservesProfile` — @critical
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

- [x] **UT-058** `VariantQueryValidator_InvalidFilter_ReturnsInvalidQuery` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：非法查詢回 InvalidQuery，找不到的有效 ID 回 VariantNotFound。
- [x] **UT-059** `VariantQueryValidator_ForeignCursor_ReturnsInvalidCursor` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：跨條件或快照 cursor 回 InvalidCursor，不重設到第一頁。
- [x] **UT-060** `VariantQueryValidator_FailureEnvelope_ExcludesSuccess` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：錯誤與正常值不並存，錯誤中不出現 SQL 或堆疊。

### 1.21 SC-021 來源中斷與限流保留進度

**位置**：`tools/catalog/tests/unit/test_sc_021.py`
**目標／來源**：隔離 `SourceRetryPolicy` 規則；AC-001、AC-018，BDD SC-021。
**共同前置**：來源遇到 timeout、429 含 Retry-After 或服務中斷。
**共同動作**：製作工具依保存工作重試；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-061** `SourceRetryPolicy_RateLimitedSource_RespectsRetryLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：遵守 Retry-After 並最多自動重試 3 次，超限保留待恢復。
- [x] **UT-062** `SourceRetryPolicy_InterruptedImport_PreservesCandidates` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗不清空成功候選、不刪除既有 identity，也不因缺資料自行猜測 Element／Design 對應。
- [x] **UT-063** `SourceRetryPolicy_CredentialFailure_RedactsOutput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：來源憑證不寫 URL／日誌，工具失敗 exit 4。

### 1.22 SC-022 建模工作當機與重複工作鍵

**位置**：`tools/catalog/tests/unit/test_sc_022.py`
**目標／來源**：隔離 `CatalogJobPolicy` 規則；AC-010、AC-018，BDD SC-022。
**共同前置**：單項超過 10 分鐘、worker 當機或重跑已有成功輸入。
**共同動作**：工具處理失敗並恢復工作；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-064** `CatalogJobPolicy_WorkerTimeout_FailsOnlyItem` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：當機／timeout 項目為 Failed，不影響其他獨立項目。
- [x] **UT-065** `CatalogJobPolicy_CompletedInput_ReusesResult` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：已完成且 input hash 相同的項目不重複製作。
- [x] **UT-066** `CatalogJobPolicy_JobConflict_ReturnsExitFive` — @critical
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

- [x] **UT-070** `ContentPathPolicy_TraversalPath_RejectsEscape` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：任意外部路徑與越界壓縮成員拒絕，不在目標範圍外寫入。
- [x] **UT-071** `ContentPathPolicy_RemoteAddress_RejectsBuild` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Player 只解析本地 address key，遠端 catalog／自動查更新使建置失敗。
- [x] **UT-072** `ContentPathPolicy_DeveloperArtifacts_ExcludedFromPlayer` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：draft、來源 adapter、維護 CLI 及來源金鑰不進入安裝包。

### 1.25 SC-025 未知存檔版本與缺舊映射保留原檔

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs`
**目標／來源**：隔離 `SaveCompatibilityChecker` 規則；AC-011、AC-023，BDD SC-025。
**共同前置**：SaveHeader 比 reader 新、assetContract 不符或 requiredModels 缺映射。
**共同動作**：呼叫 ISaveCompatibilityChecker.Check；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-073** `SaveCompatibilityChecker_NewerSchema_RejectsWithoutWrite` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：未知 schema 回 UnsupportedSchema，不覆寫存檔。
- [x] **UT-074** `SaveCompatibilityChecker_MissingRevision_DoesNotSubstitute` — @critical
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

### 1.27 SC-027 空 scope 與單一未解決項目不能全量發布

**位置**：`tools/catalog/tests/unit/test_sc_027.py`
**目標／來源**：隔離 `CatalogCoveragePolicy` 規則；AC-004、AC-009、AC-017，BDD SC-027。
**共同前置**：分別使用 C=0、G=1、V<C、未分類、品質或 provenance 缺漏的資料。
**共同動作**：計算指定盒組 scope 的 C/G/V 覆蓋率並要求發布；依斷言使用受控輸入／結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-079** `CatalogCoveragePolicy_ZeroCandidates_AvoidsFalseComplete` — @critical
  - 前置／動作：候選分母為空。
  - 預期：C=0 顯示「尚無候選模型」，coverage 為 null，不除以零或顯示 100%。
- [x] **UT-080** `CatalogCoveragePolicy_SingleGap_BlocksPublish` — @critical
  - 前置／動作：逐一注入 G、非 Ready、未分類、品質或 provenance 缺口。
  - 預期：任一未解缺口均阻止正式發布。
- [x] **UT-081** `CatalogCoveragePolicy_CompleteKnownSet_RequiresScopeReview` — @critical
  - 前置／動作：V=C 但 scope 尚未審查。
  - 預期：即使 coverage=100% 仍不可發布；只有 C>0、G=0、V=C 且 scope_reviewed=true 才允許。

### 1.28 SC-028 分頁邊界與固定排序

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/VariantPagingPolicyTests.cs`
**目標／來源**：隔離 `VariantPagingPolicy` 規則；AC-015、AC-019，BDD SC-028。
**共同前置**：同快照有 101 筆不同 variantId，篩選條件保持相同。
**共同動作**：以預設及邊界 Limit 逐頁查詢；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-082** `VariantPagingPolicy_LimitBounds_EnforcesOneToHundred` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：預設每頁 50，Limit=1 與 100 合法，0／負數／101 為 InvalidQuery。
- [x] **UT-083** `VariantPagingPolicy_StableCursor_CoversAllRows` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：固定 variantId 排序，遍歷 101 筆無重複或遺漏。
- [x] **UT-084** `VariantPagingPolicy_LastPage_HasNoCursor` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：末頁 nextCursor 為 null，空結果 items 為空集合。

### 1.29 SC-029 尺寸、接點與資產預算門檻

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs`
**目標／來源**：隔離 `MetadataValidationPolicy` 規則；AC-006、AC-008、AC-020、AC-024，BDD SC-029。
**共同前置**：資料分別在尺寸容差／接點誤差／大小上限及其相鄰兩側，另有 NaN、Infinity、負尺寸。
**共同動作**：驗證 metadata 及輸出預算；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-085** `MetadataValidationPolicy_ToleranceBoundary_UsesInclusiveLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：尺寸誤差 ≤ max(0.1 mm,0.5%×參考尺寸)，接點誤差 ≤0.05 mm 才通過。
- [x] **UT-086** `MetadataValidationPolicy_NonFiniteMetadata_RejectsInput` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：非有限數值、非正尺寸或非正 world scale 失敗，法向與切線須正規化。
- [x] **UT-087** `MetadataValidationPolicy_AssetBudget_EnforcesEachLimit` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：GLB ≤20 MiB、紋理每邊 ≤2048、預覽 ≤256 KiB；來源壓縮大小不冒充 runtime 記憶體。

### 1.30 SC-030 同時發布及歷史內容一致性

**位置**：`tools/catalog/tests/unit/test_sc_030.py`
**目標／來源**：隔離 `PublishConcurrencyPolicy` 規則；AC-009、AC-010、AC-018，BDD SC-030。
**共同前置**：兩個工作以相同 expected-head-version 要求發布。
**共同動作**：同時嘗試 CAS 交易並讀取結果；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-088** `PublishConcurrencyPolicy_SameHeadVersion_AllowsOneWinner` — @critical
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

- [x] **UT-094** `ModelLeasePolicy_DoubleDispose_ReleasesOnce` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：每份 lease 只釋放自己的 reference，重複 Dispose 安全。
- [ ] **UT-095** `ModelLeasePolicy_SharedActiveHandle_RemainsAlive` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：取消／失敗後已建立而未使用的 handle 均釋放，不提前釋放另一份仍使用資產。
- [x] **UT-096** `ModelLeasePolicy_UnityOperation_RequiresMainThread` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：Unity 物件建立／操作／銷毀只在主執行緒，背景僅處理資料與 IO。

### 1.33 SC-033 斷網安裝後首次進入模型預覽

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-016、AC-021、AC-025，BDD SC-033。
**共同前置**：乾淨 Windows x64 無 Editor／SDK／Blender／Python／資料庫服務且已斷網。
**共同動作**：安裝完整包並首次啟動 CatalogPreviewScene；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-097** `CatalogPreviewPresenter_OfflineStartup_ShowsPreview` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：顯示「模型預覽」與可用的搜尋、篩選、模型資訊，不要求登入。
- [x] **UT-098** `CatalogPreviewPresenter_PendingLoad_ShowsLoading` — @critical
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

- [x] **UT-100** `CatalogPreviewPresenter_CombinedFilters_SelectsMatchingRows` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：貨號精確匹配優先，名稱可部分匹配，所有篩選共同作用。
- [x] **UT-101** `CatalogPreviewPresenter_SelectedItem_ShowsFrozenDetails` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：清單與詳情使用同快照，展示所選名稱、版本及尺寸。
- [x] **UT-102** `CatalogPreviewPresenter_AppearanceSelection_ChangesModel` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：切換顏色或印刷時 3D 外觀與 variantId 一致，不只改文字。

### 1.35 SC-035 旋轉縮放與鍵盤操作不互相干擾

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs`
**目標／來源**：隔離 `PreviewCameraController` 規則；AC-016，BDD SC-035。
**共同前置**：模型預覽可操作且搜尋欄可取得焦點。
**共同動作**：拖曳、滾輪、重設視角並使用鍵盤搜尋／篩選／選取／重試／重設；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-103** `PreviewCameraController_CameraInput_UpdatesView` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：拖曳旋轉、滾輪縮放及重設可觀察真實 3D 模型。
- [x] **UT-104** `PreviewCameraController_TextFocus_BlocksCameraInput` — @critical
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

- [x] **UT-109** `CatalogPreviewPresenter_NoMatches_ShowsEmptyMessage` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：空狀態顯示「找不到符合條件的模型。」而不假造模型。
- [x] **UT-110** `CatalogPreviewPresenter_EmptyState_KeepsClearAction` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：保留可操作的「清除條件」入口。
- [x] **UT-111** `CatalogPreviewPresenter_ClearFilters_RestoresResults` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：清除後重查當前快照並回復有效清單，不變更目錄資料。

### 1.38 SC-038 模型錯誤不阻止選擇其他可用模型

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs`
**目標／來源**：隔離 `CatalogPreviewPresenter` 規則；AC-016、AC-018、AC-025，BDD SC-038。
**共同前置**：一個模型損毀且另一個可正常載入。
**共同動作**：選取損毀模型後改選正常模型；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-112** `CatalogPreviewPresenter_CorruptModel_ShowsRepairGuidance` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：失敗顯示「此模型檔案不完整，請使用完整安裝包修復。」及診斷 ID。
- [x] **UT-113** `CatalogPreviewPresenter_FailureView_DoesNotFakeSuccess` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：不以占位圖示宣稱成功，也不暴露堆疊／來源金鑰。
- [x] **UT-114** `CatalogPreviewPresenter_OtherModel_RemainsSelectable` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：其他可用模型仍可選取並正確呈現，既有存檔不變。

### 1.39 SC-039 快速換件僅呈現最新選擇

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs`
**目標／來源**：隔離 `SelectionRequestPolicy` 規則；AC-016、AC-026，BDD SC-039。
**共同前置**：A 載入慢、B 載入快。
**共同動作**：先選 A 隨即選 B，並令 A 最後才完成；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-115** `SelectionRequestPolicy_LateResult_DoesNotOverrideSelection` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：最後畫面僅呈現 B，A 不覆蓋 B 的模型或詳情。
- [x] **UT-116** `SelectionRequestPolicy_DiscardedResult_ReleasesHandle` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：A 可取消或丟棄結果，但其多餘 handle 必須釋放。
- [x] **UT-117** `SelectionRequestPolicy_RequestVersion_KeepsLoadingAccurate` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：快速反覆切換後 loading 狀態對應目前請求，不被舊結果關閉或卡住。

### 1.40 SC-040 重試等待期間防止重複啟動

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs`
**目標／來源**：隔離 `RetryRequestPolicy` 規則；AC-016、AC-026，BDD SC-040。
**共同前置**：可重試的暫時載入失敗已顯示「載入失敗，請重試。」。
**共同動作**：使用者連續按重試而第一次仍處理中；依斷言使用受控輸入／時鐘／載入結果。涉及畫面或硬體時，本層只測狀態／報告判定，真實效果見對應 IT／ET。

- [x] **UT-118** `RetryRequestPolicy_PendingRetry_DisablesButton` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：按鈕顯示「重試中…」且同一請求未完成前禁用。
- [x] **UT-119** `RetryRequestPolicy_DuplicateRetry_StartsOneRequest` — @critical
  - 前置／動作：沿用本節共同前置與動作，獨立初始化 fixture。
  - 預期：相同重試只啟動一次，未取消正常模型切換能力。
- [x] **UT-120** `RetryRequestPolicy_RetryCompletion_RestoresAction` — @critical
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

- [x] **UT-124** `GraphicsCapabilityPolicy_UnsupportedGraphics_ProvidesMessage` — @critical
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

### 1.47 SC-047 隔離技術預覽與正式指定盒組交付

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewPackagePolicyTests.cs`
**目標／來源**：隔離 `PreviewPackagePolicy` 的規則／狀態判定；AC-027、SC-047、GAP-001，SPEC §13.1。
**共同前置**：Frozen固定版本含已驗證 Ready 代表資產與 non-Ready／缺 identity／缺 RuntimeBuild 反例，正式指定盒組全集尚有缺口。
**共同動作**：建置並安裝Preview，再以Release開啟該包及請求正式取得用途。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-019、CT-010、ET-015 驗證。

- [ ] **UT-139** `SelectPreview_ReadySubset_ExcludesIncompleteItems` — @critical
  - 前置／動作：沿用共同前置，獨立建立 Ready 與 identity／品質／RuntimeBuild 缺漏反例並執行規則；不得共用可變狀態。
  - 預期：Preview僅含 Ready、RuntimeBuild 通過且使用條件可核對的代表件；顯示「技術預覽・非完整模型庫」與完整 C/G/V 及 Preview 子集合數。
- [ ] **UT-140** `OpenPackage_PreviewInRelease_ReturnsIncompatibleContent` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Release回IncompatibleContent及「此資產包僅供技術預覽，不能作為正式遊戲資料。」；包類型鎖在建置，不可改設定繞過。
- [ ] **UT-141** `AuthorizePreview_FormalPurpose_RejectsWithoutGrant` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Preview資料根獨立且只可Browse，不發道具、不寫正式進度、不匯入正式profile、不切正式head，畫面通過不提高全量完成度。

### 1.48 SC-048 先驗證Frozen候選再發布已驗證內容

**位置**：`tools/catalog/tests/unit/test_sc_048.py`（UT-143/144仍為規劃）；UT-142現行獨立fixture與完整規則證據位於`tools/catalog/tests/integration/test_validation_content.py`
**目標／來源**：隔離 `ValidationPromotionPolicy` 的規則／狀態判定；AC-028、SC-048、GAP-002，SPEC §13.2。
**共同前置**：Frozen快照及固定選件、工具鏈、target摘要，另備變更後快照與上一版head。
**共同動作**：執行BuildValidationContent後嘗試發布及BuildCatalogContent。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 IT-020、IT-021 驗證。

- [x] **UT-142** `ValidateCandidate_FrozenSnapshot_LeavesHeadUnchanged` — @critical
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

- [x] **UT-145** `ResolveProfile_StableIdentity_PreservesRoot` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：CompanyName固定GameNenStyle；Release BrickHigh/com.gamenenstyle.brickhigh、Preview BrickHighPreview/com.gamenenstyle.brickhigh.preview，升級沿用各自資料根。
- [x] **UT-146** `AcquireLifecycle_CompetingOwners_AllowsOneOwner` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：以applicationId與canonical installRoot共用生命週期鎖，安裝器從預檢持至提交、啟動器持至Player退出，同一使用者同一安裝只允許一個Player。
- [x] **UT-147** `InstallUpdate_NoPermission_PreservesPackageAndProfile` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：競爭顯示「遊戲或更新程序正在執行，請關閉後再試。」並不切換內容；權限失敗保留舊包與profile，不強殺、不新建第二資料庫。

### 1.50 SC-050 降版及備份失敗不擅自回退進度

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveRecoveryPolicyTests.cs`
**目標／來源**：隔離 `SaveRecoveryPolicy` 的規則／狀態判定；AC-030、SC-050、GAP-004，SPEC §13.4。
**共同前置**：人工F-Save含升版前完整備份、新版schema與新增進度；不使用私人正式存檔。
**共同動作**：檢查降版相容性，注入備份中斷，再在驗收harness選擇取消或確認還原。本層只用受控輸入隔離判定；真實資料庫、程序、像素及物理行為由 CT-011、IT-023、ET-017 驗證。

- [x] **UT-148** `CheckSave_NewerSchema_BlocksWritableConnection` — @critical
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
- [x] **UT-155** `ValidateText_ScalarAndCursorBounds_ReturnsSpecifiedError` — @critical
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

- [x] **UT-166** `ValidateWheelGeometry_InvalidDimensions_ExcludesCandidate` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：radiusMeters/widthMeters有限且>0、axleDirection為canonical局部正規化；必要尺寸未知不填0且不進輪組候選，但保留外觀資產。
- [x] **UT-167** `ValidateMass_UnknownEvidence_RequiresNullAndReason` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：Measured/Estimated有有限正massKg與來源理由；Unknown為null且附原因，不帶入虛構重量或性能。
- [ ] **UT-168** `MatchWheelProfile_IncompatiblePair_RejectsAssembly` — @critical
  - 前置／動作：沿用共同前置，獨立建立正例與對應反例並執行規則；不得共用可變狀態。
  - 預期：不相容配對拒絕；合法靜態軸心/模型/碰撞誤差符合§4.3，記錄scale/坡度/路肩高度/速度/物理設定及實際動態接觸與跳動，不宣稱完成MVP-002。

## 2️⃣ 集成測試（Integration Tests）

真實協作必須跨過本節列明的邊界，不只驗證 mock 呼叫次數。每個對應場景的三項結果均為本案例斷言，不可只挑 Happy Path。

### IT-001 SourceCatalog

**位置**：`tools/catalog/tests/integration/test_source_catalog.py`

- [x] **IT-001** `RunSourceCatalog_ScenarioMatrix_PreservesContract` — @critical
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

- [x] **IT-004** `RunCoordinateAndConnectors_ScenarioMatrix_PreservesContract` — @critical
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

- [x] **IT-006** `RunJobRecovery_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-011、SC-022。
  - 前置：真實工作 DB、可受控終止的 Blender worker、可控制時鐘與租約。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。
  - 證據：`tools/catalog/tests/integration/test_job_recovery.py` 以真 `CatalogRepository`／`CatalogJobs` 覆蓋 Published→same-baseline set-driven successor、新盒組 Element／Design 隔離、同鍵冪等／衝突 exit 5、revision identity 變更、過期租約雙連線接手與真 Blender subprocess timeout 隔離；最新 catalog regression 於本輪重驗。

### IT-007 LegacyRuntime

**位置**：`game/Assets/BrickHigh/Tests/PlayMode/LegacyRuntimeTests.cs`

- [ ] **IT-007** `RunLegacyRuntime_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-012、SC-014。
  - 前置：兩個來源快照、歷史投影與當前引擎重建的舊引用資產。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。

### IT-008 ReadContract

**位置**：`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs`

- [x] **IT-008** `RunReadContract_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-015、SC-028。
  - 前置：真實唯讀 SQLite、101 筆與多篩選組合，不 mock repository。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。
  - 證據：`ReadContractTests.RunReadContract_ScenarioMatrix_PreservesContract`；Release fixture 逐頁讀滿 101 筆，驗證 CharacterCreation／InitialBucket、selected revision、anchor／vehicle metadata、System＋DUPLO versioned profiles、C/G/V 完整審查，另一 snapshot 衝突資料不洩漏，且 pack 全檔 SHA 前後不變、無 WAL／SHM。

### IT-009 NativeStorage

**位置**：`tools/acceptance/run_interactive_fixture.py`（真 packaged Installer／Launcher／Windows Player matrix）

- [x] **IT-009** `RunNativeStorage_ScenarioMatrix_PreservesContract` — @critical
  - 目標／BDD：SC-016、SC-026。
  - 前置：真實 Windows Player 原生 DLL、含中文與空格的路徑、唯讀安裝區與不可寫使用者區。
  - 動作：依上述各場景的 When 分別執行，場景間重設隔離環境；fault 情境保留操作前後快照。
  - 預期：逐項驗證上述場景全部 Then／And；記錄實際 DB、檔案、UI 或 Player 結果，沒有未預期副作用。
  - 證據：`run_interactive_fixture.py` 對真安裝樹施加目前帳號 RX ACL，確認 write probe 被拒、Player 在唯讀 install 下仍 exit 0、install tree SHA 不變且無 WAL／SHM；另將獨立 LocalLow 改成不可寫，Launcher 必須 exit 3 並輸出 `StorageUnavailable`，既有 profile SHA 保持不變。fresh job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80` exit 0。

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

- [x] **IT-013** `RunExternalRetry_ScenarioMatrix_PreservesContract` — @critical
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
  - 前置：真實 Frozen SQLite 與可轉換的 Ready 代表模型；另備缺 identity、缺使用條件、未 Ready 件。
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

- [x] **CT-001** `OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-015、SC-019、SC-026。
  - 前置：已發布／缺目錄／缺相依／不支援 schema。
  - 動作：透過正式 C# 介面呼叫 `OpenAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：session 綁定 manifest，錯誤型別明確；取消不遺留連線。
  - 證據：`ReadContractTests.OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome`；pre-cancel、缺 pack、Release 正例、缺相依與 unsupported schema 均回指定結果，取消不產生 SQLite sidecar。

- [x] **CT-002** `QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-015、SC-020、SC-028、SC-031。
  - 前置：101筆、所有用途／篩選、Limit 邊界、跨快照 cursor。
  - 動作：透過正式 C# 介面呼叫 `QueryAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：排序及 cursor 無重漏，非法輸入拒絕且 Special 限制生效。
  - 證據：`ReadContractTests.QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome`；101 筆完整分頁、exact/family/tier/slot/用途、Special 排除、Limit／enum／bucket 條件、跨 snapshot cursor 與 cancellation 全矩陣 Green。

- [x] **CT-003** `GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-012、SC-015、SC-020。
  - 前置：有效 variant、未知 UUID、錯誤 snapshot。
  - 動作：透過正式 C# 介面呼叫 `GetVariantAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：詳情使用凍結投影與正確 revision；不存在回 VariantNotFound。
  - 證據：`ReadContractTests.GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome`；current variant 回 frozen snapshot/revision，其他 snapshot-only variant／未知 UUID 回 VariantNotFound，空 UUID、取消與 disposed session 回指定 typed error。

- [x] **CT-004** `GetProfilesAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-008、SC-015。
  - 前置：同名不同系列 profile 與多個快照。
  - 動作：透過正式 C# 介面呼叫 `GetProfilesAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：回該 session 的版本化完整配對規則，禁止混入最新規則。

- [x] **CT-005** `GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
  - 目標／BDD：SC-005、SC-015、SC-027。
  - 前置：空 scope、完整已知指定盒組分母、含 G 與完整審查資料。
  - 動作：透過正式 C# 介面呼叫 `GetCoverageAsync`，或以其 factory／Dispose 操作結果與資源。
  - 預期：回一致的 C/G/V 及涵蓋審查，空 scope 不報100%。
  - 證據：`ReadContractTests.GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome` 參數化 **3/3**；空 scope ratio=null、完整 C=V ratio=1、含 gap 的 C/G/V 與 ScopeReviewed 均精確回讀。

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

- [x] **CT-009** `CatalogResult_ContractMatrix_ReturnsSpecifiedOutcome` — @critical
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

- [x] **CT-011** `Downgrade_NewSaveSchema_BlocksWrites` — @critical
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

**位置**：`tools/acceptance/run_interactive_fixture.py`（真 packaged Installer／Launcher／Windows Player harness）。

- [x] **ET-006** `RunInstallUpgradeUninstall_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-016、SC-017。
  - 前置：一般使用者、唯讀安裝區、人工 profile fixture。
  - 動作：安裝 A→關閉→升級 B→啟動→預設解除安裝，全程核對 profile bytes／DB資料及本地寫入位置。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。
  - 證據：同一 harness 先以真 packaged installer 安裝 A，再升級 B 並核對 `installation.json` pointer、保留 previous version 與 profile SHA；之後真啟動 Player、注入唯讀 install／不可寫 user root／缺 sqlite3，最後以安裝版本內 uninstaller 執行預設解除安裝，要求 pointer 移除、profile 保留且只允許執行中的 uninstaller 自身殘留。fresh job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80` exit 0。

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
  - 動作：由指定盒組 inventory 獨立重算 C/G/V、逐變體 RuntimeBuild 載入與證據；每個 inventory row 必須有 authoritative Element identity，Design ID 有官方證據則驗證並用於 dedup，未公開 Design 則必須有 Element fallback provenance。Element identity 缺口／衝突時明確阻斷，不 skip 後算通過。
  - 預期：對應場景全部 Then／And 成立；提交 build／pack／snapshot／fixture 與硬體資料、實際結果及失敗證據。無設備或資產時記為阻斷，不能略過後算通過。

### ET-010 LegacyModelUpgrade

**位置**：`tools/acceptance/tests/test_legacy_model_upgrade.py`（預計 harness；人工操作驗證仍回報到同案例）。

- [ ] **ET-010** `RunLegacyModelUpgrade_InstalledPlayer_SatisfiesAcceptance` — @critical
  - 目標／BDD：SC-012、SC-014。
  - 前置：兩代實際包、保留來源 revision 與指定盒組 scope／分類差異。
  - 動作：新版載入舊精確引用，外觀／尺寸不被新模型替代；目前 scope 不再包含的舊 Element／Design 仍可由舊引用載入，但不因瀏覽而新增權益。
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
  - 動作：安裝、旋轉、縮放、換件、查看 non-Ready／缺 identity 件與 C/G/V；另裝 Release 相容 fixture 核對隔離。
  - 預期：可操作真實3D並可讀非完整標籤；無正式發放或進度；截圖錄影與包版本留存，Preview通過不勾ET-009指定盒組全集完成。
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

- [x] **ET-017** `RestoreBackup_WithoutExplicitChoice_PreservesNewProgress` — @critical
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

目前最新狀態以上方「最新進度與驗收邊界」為準。Gate 2 已20/20通過；使用者授權 Gate 3，接續固定20件的正式 Catalog 與可安裝 Player 驗證。不因本授權縮減剩餘233項完整驗收，也不自行進 Gate 4。

先讀取[風險稽核報告](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md)及本文件末尾交接紀錄。原SDD、風險方案及補強SDD均已確認，BDD／TDD回寫完成；使用者本輪已啟動 well-done。不降低全量、離線或真實畫面門檻。

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

## 規劃交接紀錄（目前有效）

**交接狀態**：Ready for well-done

**範圍**：`SPEC-001-BrickModelCatalog`；Gate 2 固定20件建模驗收20/20，Gate 3 已由使用者授權，繼續同20件；未授權 Gate 4 或其他 SPEC。

**已確認規劃**：原179項測試加54項補強為233項；56個BDD場景與36個SPEC驗收條款有追溯。規劃文件補強已完成，執行完成度以上方最新表格為準，而非原規劃日期0%的歷史敘述。

| 文件 | 位置 |
|---|---|
| MVP | [MVP-001-V1Version](../requirements/MVP-001-V1Version.md) |
| SPEC | [SPEC-001-BrickModelCatalog](../specs/SPEC-001-BrickModelCatalog.md) |
| BDD | [SPEC-001-BrickModelCatalog-BDD](../bdd/SPEC-001-BrickModelCatalog-BDD.md) |
| TDD | 本文件（233項ID、BDD追溯與下方逐項證據） |
| 風險稽核 | [SPEC-001-BrickModelCatalog-RiskAudit](../specs/SPEC-001-BrickModelCatalog-RiskAudit.md) |

**持續有效的風險決策**：Preview 與正式 Release 分離（SPEC §13.1～13.2）；凍結來源／版本與來源授權、修改不可變 revision 前須重新驗證；安裝更新、玩家資料保留與備份不可降級（§13.3～13.7）；外觀核准、正式效能硬體與輪組實證保留（§13.8～13.10）。`10334` 僅為指定盒組例子；Gate 2 20件不受其身份／庫存阻擋。不得重新引入停產／在產檢查。

**交接注意事項**：下方原始測試清單與逐項證據矩陣保留開發追溯；未完成條目仍不可直接標為通過。須先檢查 write-lease、Git 與既有測試證據；重用已成功驗收，阻塞時回報明確原因，不降低既定品質門檻。無需再次執行已通過的固定20件尺寸／碰撞驗收。

## 逐項證據矩陣（實作追溯）

本表保存233項原始ID的實作位置、測試證據與待補缺口，方便後續逐項開發。✅表示該TDD層級已具證據；⚠️／❌仍未完整符合。表中部分位置與行號源自早期靜態稽核，與最新結果有差異時以上方進度、實際程式及最新回歸為準；不得將舊行號或既有mock誤認正式Player通過。

最新可重跑證據與Job ID集中於上方驗收摘要；本表不再重複列歷史批次日誌。

### UT 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| UT-001／SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 來源附件、hash與UTC觀測／有效日期均有回讀斷言。 | — |
| UT-002／SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:56`；`tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 五類系列、套裝／人物展開與排除理由逐項比對。 | — |
| UT-003／SC-001 | ✅ 已符合 | `tools/catalog/importing.py:210` | `tools/catalog/tests/unit/test_sc_001.py:79`；`tools/catalog/tests/unit/test_sc_001.py:39`；`tools/catalog/tests/integration/test_source_import.py:126` | 缺頁及缺系列各產生未解G，發布被拒絕。 | — |
| UT-004／SC-002 | ✅ 已符合 | `tools/catalog/repository.py::CatalogRepository.add_part` | `tools/catalog/tests/unit/test_sc_002.py::test_UT_004_LegoDesignIdentity_SameDesign_ReusesGeometryPart` | 同一 LEGO Design ID 重複匯入只建立一個 Part／幾何身份。 | — |
| UT-005／SC-002 | ✅ 已符合 | `tools/catalog/repository.py::CatalogRepository.add_variant` | `tools/catalog/tests/unit/test_sc_002.py::test_UT_005_LegoElementIdentity_DifferentColour_CreatesAppearanceVariants` | 同 Design 不同顏色 Element 共用 Part，但建立不同 appearance variants。 | — |
| UT-006／SC-002 | ✅ 已符合 | `tools/catalog/repository.py::CatalogRepository.add_variant` | `tools/catalog/tests/unit/test_sc_002.py::test_UT_006_LegoElementIdentity_ReissuedElementCanReuseSameAppearanceVariant` | 同 Design／同外觀重複匯入重用相同 variant，不重複建立幾何或相同 appearance。 | — |
| UT-007／SC-003 | ✅ 已符合 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 只保存觀測組合，重複去重且不生成笛卡兒積。 | — |
| UT-008／SC-003 | ✅ 已符合 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:16`；`tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 印刷與材質改變key，重試保留UUID。 | — |
| UT-009／SC-003 | ✅ 已符合 | `tools/catalog/policies.py:68`；`tools/catalog/importing.py:195` | `tools/catalog/tests/unit/test_sc_003.py:24`；`tools/catalog/tests/unit/test_sc_003.py:8`；`tools/catalog/tests/integration/test_source_import.py:63`；`tools/catalog/tests/integration/test_catalog_resolve.py:178` | 矛盾alias拒絕合併並保留原候選／缺口。 | — |
| UT-010／SC-004 | ✅ 已符合 | `tools/catalog/repository.py:129`；`tools/catalog/schema.sql:26` | `tools/catalog/tests/integration/test_snapshot_repository.py:134` | 直接SQL改分母、證據、分類及G被trigger拒絕；後繼Draft可修正。 | — |
| UT-011／SC-004 | ✅ 符合 | `tools/catalog/repository.py:131`；`tools/catalog/quality.py:321`；`tools/catalog/quality.py:357` | `tools/catalog/tests/unit/test_quality_report.py:122`；`tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_snapshot_repository.py:123` | Pending／Building／Validating／Ready／Failed 轉移受控；布林報告遭拒，封存 bytes、人工附件與持久化品質摘要需重驗，隔離合成正例可 Ready；SC-004 整體仍受真實資產缺口限制。 | 本項完成；正式來源逐件審核另追 |
| UT-012／SC-004 | ✅ 已符合 | `tools/catalog/repository.py:129`；`tools/catalog/schema.sql:26` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_snapshot_repository.py:67` | Frozen選件遞增version，Published選件被拒絕。 | — |
| UT-013／SC-005 | ✅ 符合 | `tools/catalog/policies.py::CatalogCoveragePolicy.evaluate`；`tools/catalog/repository.py::coverage` | `tools/catalog/tests/unit/test_sc_005.py::test_UT_013_CatalogCoveragePolicy_CompleteCounts_PassesGate` | C 去除 fixture，V 逐件要求 authoritative identity、Ready、分類、quality、provenance；C>0、G=0、V=C 且 scope reviewed 才通過。 | 本項完成 |
| UT-014／SC-005 | ✅ 符合 | `tools/catalog/policies.py::CatalogCoveragePolicy.evaluate` | `tools/catalog/tests/unit/test_sc_005.py::test_UT_014_CatalogCoveragePolicy_FixtureRows_ExcludedFromDelivery` | fixture rows 可保留在診斷 variants 但不計入 C/V，正式 delivery 集合不混入 fixture。 | 本項完成 |
| UT-015／SC-005 | ✅ 符合 | `tools/catalog/repository.py::publish`；`tools/catalog/quality.py::complete_revision_quality` | `tools/catalog/tests/unit/test_sc_005.py::test_UT_015_CatalogCoveragePolicy_SingleFailedGate_PreservesHead`；`tools/catalog/tests/integration/test_catalog_cli.py` | 單一 gate 失敗維持舊 head；完整品質覆核、選件與 validation build 通過後真實切換 Published/head。 | 本項完成 |
| UT-016／SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212` | 實際GLB與綁hash的validator已驗；2026-10-18 另以內嵌 PNG+UV 正反矩陣補驗引用完整性與安全範圍；仍缺各代表真材質、完整影像解碼與警告處置矩陣。 | 高；`ModelValidationService_SelfContainedGltf_AcceptsReport_FullContractRegression` |
| UT-017／SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212` | 拒絕空／外部／非法GLB，並補齊無效內嵌紋理／UV／sampler／image 參照的 fail-closed 反例；尚缺完整占位件、遺失印刷與 Unity 粉紅 shader 反例。 | 高；`ModelValidationService_PlaceholderOrMissingMaterial_RejectsReport_FullContractRegression` |
| UT-018／SC-006 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11` | `artifacts/acceptance/pm-20260928-interactive-20-a/machine-audit.json`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 20個內部樣本逐件 Player 載入與操作通過，尚非合格 Ready RuntimeBuild 的每件驗證。 | 高；`ModelValidationService_PlayerValidation_RequiresEveryBuild_FullContractRegression` |
| UT-019／SC-007 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | 指定LDraw點與rootScale=1均有精確斷言。 | — |
| UT-020／SC-007 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:18`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | Unity點與基底旋轉矩陣精確斷言。 | — |
| UT-021／SC-007 | ✅ 符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69` | canonical 點／rotation／tangent handedness／triangle winding 單元契約已固定；3298 真 glTFast 非對稱 mesh 驗證 winding 與 vertex normals 一致，新增 `CoordinateTangentImportTests.cs` 又以真 glTFast 匯入帶 NORMAL／TANGENT 的 test-only glTF，job `73aecfc4-eac3-40d4-9c13-c05c2f1aba2c` Green／exit 0，log 為 `vertices=3 tangents=3 handedness=1 windingDot=1`；20件 metadata／Renderer bounds 亦逐件核對，因此本項閉環。 | 本項完成；ET-008 真 Source→Player 完整鏈另追 |
| UT-022／SC-008 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | 版本化 profileId、雙向明確 compatibleProfileIds、跨系列拒絕與可核對自由度符合本 UT 的隔離規則；core 140/140、最終 Unity EditMode exit 0，並有真 glTFast PlayMode 代表件補強證據。公開 session profile 投影另由 CT-004 驗收，不阻擋本單元項完成。 | 本項完成；CT-004／IT-004 另追 |
| UT-023／SC-008 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | probe-radius 對簡化 AABB 的 fail-closed 插接空腔正反 fixture 已完整驗證：整體包圍盒封死拒絕、中央空腔通過；core 140/140 與 Unity EditMode Green。真實 PlayMode 又以 glTFast 匯入 3001 並跑八個 cavity probes 成功，UPM blocker 已解除。 | 本項完成；IT-004 全矩陣另追 |
| UT-024／SC-008 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58`；`tools/catalog/quality.py:153` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46` | 本 UT 的隔離規則已閉環：需要接合的零件缺 connector evidence 必須拒絕，無接點裝飾件只有具明確理由才可通過；core 140/140、catalog 159/159 與最終 Unity EditMode Green。逐件真實 Ready revision 的 connector／collision 完整性仍是 Gate 2 資產整合工作，不降低本單元規則完成度。 | 本項完成；逐件 Ready／IT-004 另追 |
| UT-025／SC-009 | ❌ 未符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 有分類欄位，但無六部位相容Basic候選驗證。 | 高；`UsageClassification_BasicSlots_RequiresSixCandidates_FullContractRegression` |
| UT-026／SC-009 | ❌ 未符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 尚無同系統floor/wall/roof/opening接合候選矩陣。 | 高；`UsageClassification_BuildingRoles_RequiresCompatibleSet_FullContractRegression` |
| UT-027／SC-009 | ⚠️ 部分符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104` | 缺tier／reason會拒絕；部位、用途、錨點的完整資格缺口尚未驗。 | 高；`UsageClassification_MissingClassification_BlocksReadiness_FullContractRegression` |
| UT-028／SC-010 | ✅ 符合 | `tools/catalog/quality.py::_review_template`；`tools/catalog/render_views.py` | `tools/catalog/tests/unit/test_sc_010.py::test_UT_028_RevisionManifestPolicy_VariantViews_RequiresSixDirections` | revision 必須有綁定同一 model hash 的完整六方向與 preview；逐檔 hash／byteLength／PNG bytes 重算，appearance review 同時綁 sixViews 與 source SHA；缺方向拒絕。 | 本項完成 |
| UT-029／SC-010 | ✅ 符合 | `tools/catalog/quality.py::_validate_provenance`；`tools/catalog/sources.py::inspect_ldraw` | `tools/catalog/tests/unit/test_sc_010.py::test_UT_029_RevisionManifestPolicy_Attribution_RequiresProvenance` | 逐來源 author／license／hash／大小／官方 source、LDConfig 版本、Blender／ImportLDraw commit／coordinate profile／script SHA 與 modifications 均有正反例且 fail-closed。 | 本項完成 |
| UT-030／SC-010 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/ReleaseFileIndex.cs::ValidateRuntimeBuildIdentity`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs::OpenAsync`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs::RuntimeManifestBuildIdentity_MismatchRejectsPack`；`RuntimeManifestBuildIdentity_SourceRevisionForeignKeyRejectsDrift` | manifest 與 runtime build 逐筆核對 Editor／package lock／coordinate profile／bundle content digest／validation digest；source revision 漂移由 SQLite FK 直接拒絕。 | 本項完成 |
| UT-031／SC-011 | ✅ 符合 | `tools/catalog/repository.py::CatalogRepository.fork` | `tools/catalog/tests/unit/test_sc_011.py::test_UT_031_SetDrivenSuccessor_AllowsSameBaselineAndPreservesPublishedParent`；`tools/catalog/tests/integration/test_job_recovery.py::test_IT_006_RunJobRecovery_ScenarioMatrix_PreservesContract` | 指定盒組帶入的新 Element／Design 可在相同 catalog baseline 建立 successor；新 identity 只存在 successor，原 Published snapshot／entries 保持不變，完全不依賴推出日期、在產／停產或 production baseline 判定。 | 本項完成 |
| UT-032／SC-011 | ✅ 已符合 | `tools/catalog/jobs.py:158`；`tools/catalog/building.py:167`；`tools/catalog/repository.py:105` | `tools/catalog/tests/integration/test_catalog_build.py:57`；`tools/catalog/tests/integration/test_catalog_cli.py:153`；`tools/catalog/tests/integration/test_catalog_build.py:113` | 同鍵同輸入重用，changed metadata／manifest回exit5且無重複結果。 | — |
| UT-033／SC-011 | ✅ 符合 | `tools/catalog/building.py::revision_input_digest`；`tools/catalog/repository.py:105` | `tools/catalog/tests/unit/test_sc_011.py`；`tools/catalog/tests/integration/test_catalog_build.py::test_build_changed_identity_input_creates_immutable_successor_revision` | source／metadata／toolchain 三類變更皆產生不同 revision identity；真 SQLite／ObjectStore 整合另證明 predecessor manifest 不變、successor revision 另建且封存 bytes 均可重算。 | 本項完成；SC-011 仍待 UT-031／IT-006 |
| UT-034／SC-012 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs::ResolveVariantAsync`；`ResolveModelAsync` | `ReadContractTests.ModelReferenceResolver_ExactReference_PreservesRevision` | 完整舊 snapshot／variant／revision 精確回到原 RuntimeBuild 與 address，不自動改成 current revision。 | 本項完成 |
| UT-035／SC-012 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs::ResolveVariantAsync` | `ReadContractTests.ModelReferenceResolver_HistoricalProjection_RemainsFrozen` | current 與 historical 名稱／tier 故意不同；歷史讀取固定舊 snapshot projection，不 join 最新資料。 | 本項完成 |
| UT-036／SC-012 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs::QueryAsync`；`ResolveVariantAsync`；`ResolveModelAsync` | `ReadContractTests.ModelReferenceResolver_OutOfScopeVariant_ExcludesNewAcquisition` | retired variant 不進目前盒組查詢，但完整舊引用仍可讀 frozen details 與模型。 | 本項完成 |
| UT-037／SC-013 | ✅ 符合 | `tools/catalog/building.py::_source_failure_reason`；`prepare_toolchain`；`build_catalog`；`tools/catalog/sources.py::inspect_ldraw` | `tools/catalog/tests/unit/test_sc_013.py`；`tools/catalog/tests/unit/test_ldraw_sources.py` | 缺依賴、TEXMAP、provenance／license／malformed／其他來源失敗均映射穩定 reason code；真 build 不啟動 converter、revision=Failed 且不選件／不切 head。 | 本項完成 |
| UT-038／SC-013 | ❌ 未符合 | `tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 尚無人工補模與尺寸／外觀參照歸檔流程。 | 高；`ModelBuildPolicy_CustomModel_KeepsEvidence_FullContractRegression` |
| UT-039／SC-013 | ❌ 未符合 | `tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 尚無修補後通過全部品質並成為Ready的正例。 | 高；`ModelBuildPolicy_RepairedModel_RequiresFullValidation_FullContractRegression` |
| UT-040／SC-014 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/RuntimeBuildPolicy.cs::ComputeIdentity`；`ToolchainProbeBuild.cs` | `ReadContractTests.RuntimeBuildPolicy_EngineChange_PreservesSourceRevision` | deterministic identity 綁 source revision＋工具鏈＋內容／驗證 digest；Editor／lock 改變形成新 build，source revision 保留。 | 本項完成 |
| UT-041／SC-014 | ✅ 符合 | `BrickCatalog.ResolveVariantAsync`；`ResolveModelAsync`；`RuntimeBuildPolicy.ComputeIdentity` | `ReadContractTests.RuntimeBuildPolicy_LegacyReference_RequiresCurrentBuild` | 舊 exact source revision 在工具鏈升版後重新映射 current RuntimeBuild，歷史引用實際讀到新 build。 | 本項完成 |
| UT-042／SC-014 | ✅ 符合 | `ReleaseFileIndex.ValidateRuntimeBuildIdentity`；`BrickCatalog.OpenAsync` | `ReadContractTests.RuntimeBuildPolicy_OldBundleOnly_RejectsCompatibility` | 新 manifest 若仍只有舊工具鏈 RuntimeBuild／bundle mapping，開包直接 AssetCorrupt；舊檔存在不等於相容。 | 本項完成 |
| UT-043／SC-015 | ✅ 符合 | `BrickCatalog.OpenAsync`；`QueryAsync`；`GetVariantAsync`；`GetProfilesAsync`；`GetCoverageAsync` | `ReadContractTests.BrickCatalog_SessionQueries_KeepSnapshot` | session 開啟後 manifest current snapshot 漂移也不影響既有 session；所有回應仍固定原 pack／snapshot／schema，Success／Failure 互斥。 | 本項完成 |
| UT-044／SC-015 | ✅ 符合 | `BrickCatalog.GetVariantAsync`；`GetProfilesAsync`；`GetCoverageAsync` | `ReadContractTests.BrickCatalog_DetailsProfilesCoverage_ReturnFrozenData` | selected revision、用途／anchor／vehicle metadata 與 profile／coverage 均由 session snapshot frozen projection 回讀，不受另一 snapshot 衝突資料污染。 | 本項完成 |
| UT-045／SC-015 | ✅ 符合 | `IBrickCatalog`；`BrickCatalog`；`NativeSqlite` | `ReadContractTests.BrickCatalog_ReadOnlyCalls_DoNotGrantOwnership`；runtime source network API 稽核 | 五個公開 read calls 前後 pack 檔案集合／SHA 不變且無 WAL／SHM；API 無 ownership mutation surface，runtime source 無 HTTP client/listener 依賴。 | 本項完成 |
| UT-046／SC-016 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/NativeSqlite.cs:18`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:35` | 實際唯讀SQLite拒寫，DB bytes不變且無WAL／SHM。 | — |
| UT-047／SC-016 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/LocalStoragePolicy.cs`；`tools/launcher/Program.cs` | `LocalStoragePolicyTests.LocalStoragePolicy_WritableData_UsesUserRoot`；job `72178e6a-7e17-42ec-bb90-f66746884a04` | Preview／Release 的 Profiles／Diagnostics 固定 user LocalLow root；install/data root 重疊、path traversal／nested filename 均拒絕；真寫入後 install workspace 保持無新增檔。 | 本項完成 |
| UT-048／SC-016 | ✅ 符合 | `game/Assets/BrickHigh/Infrastructure/LocalStoragePolicy.cs::WriteStartupDiagnostic`；`tools/launcher/Program.cs` | `LocalStoragePolicyTests.LocalStoragePolicy_DiagnosticRecord_RedactsSecrets`；job `471b41b2-efe2-446d-996c-0b6ff07f14b9` | 診斷只允許 diagnosticId／failure／UTC time，無任意敏感 context；token／save／inventory 不入紀錄、非法輸入拒絕、automatic upload 明確 false。 | 本項完成 |
| UT-049／SC-017 | ✅ 已符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 真正InstallerCore完成staging/hash後才切pointer，壞包與切換故障保留舊值。 | — |
| UT-050／SC-017 | ✅ 已符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 安裝A/B及uninstall均比對人工profile bytes未變。 | — |
| UT-051／SC-017 | ⚠️ 部分符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100` | 實際包可離線啟動；缺新版session重新映射舊模型的升級矩陣。 | 高；`InstallUpdatePolicy_Restart_OpensNewSessionOffline_FullContractRegression` |
| UT-052／SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 只有相容checker，未實作一致備份先於migration的流程。 | 高；`SaveTransactionPolicy_CompletedBackup_PrecedesMigration_FullContractRegression` |
| UT-053／SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 原生SQL rollback不等於存檔migration與last-good備份恢復。 | 高；`SaveTransactionPolicy_FailedMigration_RollsBack_FullContractRegression` |
| UT-054／SC-018 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50` | 無組裝檔先寫後切DB引用的交易流程。 | 高；`SaveTransactionPolicy_FileBeforeReference_AvoidsPartialState_FullContractRegression` |
| UT-055／SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 已有開包typed error；manifest／DB／bundle缺失與hash各類仍未全驗。 | 高；`CatalogStartup_MissingFiles_ReturnTypedErrors_FullContractRegression` |
| UT-056／SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 顯示修復文案與DiagnosticId；尚缺由ID定位實際本機診斷紀錄。 | 高；`CatalogStartup_MissingModel_UsesRepairMessage_FullContractRegression` |
| UT-057／SC-019 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | provider不代換資產；缺失敗前後存檔bytes與全部載入錯誤矩陣。 | 高；`CatalogStartup_FailedLoad_PreservesUserData_FullContractRegression` |
| UT-058／SC-020 | ✅ 符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:99`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:235` | 真 SQLite session 中非法 Purpose／Tier／Slot／Limit 與空 UUID 精確回 InvalidQuery，未知有效 UUID 回 VariantNotFound；聚焦 .NET 測試 1/1 通過。 | 本項完成；SC-020 整體仍部分符合 |
| UT-059／SC-020 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:23` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:286` | 跨條件與另一session cursor明確InvalidCursor，不回首頁。 | — |
| UT-060／SC-020 | ✅ 符合 | `game/Assets/BrickHigh/Domain/CatalogResult.cs:23`；`game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogResultPolicyTests.cs:38`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:32` | Success／Failure 互斥，任意 SQL／stack message 無法進入玩家文案；僅准固定審核字串。 | 本項完成；SC-020 整體仍部分符合 |
| UT-061／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 429尊重Retry-After、至多三次重試、長等待及崩潰後預算持久化。 | — |
| UT-062／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:45`；`tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 同 DB 成功候選與完成 page 保留，失敗不刪除既有 identity 或改寫成功候選。 | — |
| UT-063／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:66`；`tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 憑證由header提供、不存URL／DB；外部失敗status exit4，CLI輸入錯誤另為2。 | — |
| UT-064／SC-022 | ✅ 已符合 | `tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | timeout／失聯worker標記單件Failed，另一件能完成。 | — |
| UT-065／SC-022 | ✅ 已符合 | `tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/unit/test_sc_022.py:27`；`tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | 同input hash完成項在重開DB及重試時不再執行。 | — |
| UT-066／SC-022 | ✅ 已符合 | `tools/catalog/jobs.py:178`；`tools/catalog/jobs.py:261` | `tools/catalog/tests/unit/test_sc_022.py:49`；`tools/catalog/tests/unit/test_sc_022.py:18`；`tools/catalog/tests/integration/test_catalog_jobs.py:42` | expired lease可接手，舊token失效，不同input衝突exit5且status保留原因。 | — |
| UT-067／SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | Installer hash失敗不切pointer；正式發布檔案staging整合仍缺。 | 高；`AtomicPublishPolicy_IncompleteStaging_PreservesHead_FullContractRegression` |
| UT-068／SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | DB trigger故障回滾且validation列保留，未驗真實內容檔保留。 | 高；`AtomicPublishPolicy_FailedCommit_RetainsContent_FullContractRegression` |
| UT-069／SC-023 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | 更新故障保留pointer/profile；指定文案與所有中斷／空間不足矩陣尚缺。 | 高；`AtomicPublishPolicy_InterruptedUpdate_KeepsPreviousVersion_FullContractRegression` |
| UT-070／SC-024 | ✅ 已符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ContentPathPolicyTests.cs:18`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 越界／絕對／ADS／保留名稱與壓縮成員反例在寫出前拒絕。 | — |
| UT-071／SC-024 | ✅ 已符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:22`；`tools/catalog/tests/unit/test_sc_024.py:17`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 遠端catalog、啟動更新及不可信provider設定在初始化前拒絕。 | — |
| UT-072／SC-024 | ✅ 已符合 | `tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `tools/catalog/tests/unit/test_sc_024.py:25`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 打包key政策拒絕draft／tools／sources／secret，attribution可通過。 | — |
| UT-073／SC-025 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 未知新schema回UnsupportedSchema且零resolver呼叫；checker沒有寫入入口。 | — |
| UT-074／SC-025 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:53`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 完整引用缺失回IncompatibleContent，未替代revision。 | — |
| UT-075／SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 固定文案已實作；尚缺可定位本機診斷與不相容存檔保留整組測試。 | 高；`SaveCompatibilityChecker_IncompatibleSave_ReportsPreservation_FullContractRegression` |
| UT-076／SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | DLL例外有修復訊息，缺乾淨Player原生通知與診斷完整矩陣。 | 高；`NativeDependencyPolicy_MissingNativeLibrary_ReportsRepair_FullContractRegression` |
| UT-077／SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | StorageUnavailable文案存在，缺不可寫使用者資料根的精確回傳測試。 | 高；`NativeDependencyPolicy_ReadOnlyUserRoot_ReturnsStorageUnavailable_FullContractRegression` |
| UT-078／SC-026 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 離線通知不安裝工具；缺故障時profile與全部診斷去敏斷言。 | 高；`NativeDependencyPolicy_DependencyFailure_PreservesProfiles_FullContractRegression` |
| UT-079／SC-027 | ✅ 已符合 | `tools/catalog/policies.py::CatalogCoveragePolicy` | `tools/catalog/tests/unit/test_sc_027.py::test_UT_079_CatalogCoveragePolicy_ZeroCandidates_AvoidsFalseComplete` | C=0 回 null 覆蓋率及「尚無候選模型」，不能發布。 | — |
| UT-080／SC-027 | ✅ 已符合 | `tools/catalog/policies.py::CatalogCoveragePolicy` | `tools/catalog/tests/unit/test_sc_027.py::test_UT_080_CatalogCoveragePolicy_SingleGap_BlocksPublish` | 逐一注入 G／非Ready／分類／品質／provenance 缺口均阻擋發布。 | — |
| UT-081／SC-027 | ✅ 已符合 | `tools/catalog/policies.py::CatalogCoveragePolicy` | `tools/catalog/tests/unit/test_sc_027.py::test_UT_081_CatalogCoveragePolicy_CompleteKnownSet_RequiresScopeReview` | V=C 但 scope 未審查仍拒絕；C>0、G=0、V=C 且 scope_reviewed 才有正例。 | — |
| UT-082／SC-028 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30` | 預設50，1／100可用，0／負數／101明確拒絕。 | — |
| UT-083／SC-028 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207` | 真SQLite遍歷101筆，排序與去重數量精確斷言。 | — |
| UT-084／SC-028 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:207`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:30` | 遍歷以末頁null結束；不匹配篩選回空集合。 | — |
| UT-085／SC-029 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | 尺寸及接點門檻含邊界與相鄰超限反例。 | — |
| UT-086／SC-029 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:18`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | 有限正值及單位向量規則有NaN／Infinity／零／負值反例。 | — |
| UT-087／SC-029 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:30`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | GLB、texture、preview各自超限反例；只判資產檔預算，不宣稱runtime記憶體。 | — |
| UT-088／SC-030 | ✅ 已符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | 兩個獨立SQLite連線競爭同head，恰一成功一衝突。 | — |
| UT-089／SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | 敗方不能再切head已驗；未驗已發布實體檔不刪除。 | 高；`PublishConcurrencyPolicy_LosingPublisher_CannotOverwrite_FullContractRegression` |
| UT-090／SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | session固定DB與snapshot，未在實際head切換時核對舊session。 | 高；`PublishConcurrencyPolicy_ExistingSession_RemainsStable_FullContractRegression` |
| UT-091／SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | SQL排除Special與eligible條件存在，Release所有用途正反例缺漏。 | 高；`AcquisitionEligibility_AcquisitionPurpose_ExcludesSpecial_FullContractRegression` |
| UT-092／SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | Browse／resolver不寫權益；尚缺正式庫存／人物資格零副作用fixture。 | 高；`AcquisitionEligibility_BrowseRead_DoesNotGrantItem_FullContractRegression` |
| UT-093／SC-031 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105`；`tools/catalog/resolving.py:24` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`tools/catalog/tests/integration/test_catalog_resolve.py:104` | resolve驗Special分類，未驗分類變更不發放的完整流程。 | 高；`AcquisitionEligibility_SpecialSources_RemainRestricted_FullContractRegression` |
| UT-094／SC-032 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:20`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 真Addressables reference重複Dispose一次，另一份lease仍有效。 | — |
| UT-095／SC-032 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 共享及取消有證據，失敗Acquire後所有已配置handle釋放的斷言仍不足。 | 高；`ModelLeasePolicy_SharedActiveHandle_RemainsAlive_FullContractRegression` |
| UT-096／SC-032 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:50`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 背景讀Prefab被拒絕，背景Dispose排回主執行緒且handle歸零。 | — |
| UT-097／SC-033 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:255`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:117`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:30`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 單元層標題／搜尋篩選控制及清單可用；不把UT當乾淨離線安裝驗收。 | — |
| UT-098／SC-033 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:44`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | pending顯示載入文案與null model，完成才解除loading。 | — |
| UT-099／SC-033 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 真內部Player已載入本地bundle；清除開發快取／乾淨斷網的完整條件未驗。 | 高；`CatalogPreviewPresenter_BundledAssets_AvoidsRemoteDependency_FullContractRegression` |
| UT-100／SC-034 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:60`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 真SQLite多條件共同篩選、貨號優先於部分名稱。 | — |
| UT-101／SC-034 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:139`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:80`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 固定snapshot詳細資料、名稱／revision／尺寸與Unknown標籤均有斷言。 | — |
| UT-102／SC-034 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:99`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45` | 單元層换variant綁定新ModelReference／lease並釋放舊模型，不只改名稱。 | — |
| UT-103／SC-035 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:69`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:55`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:37`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:110`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:102`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:88`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:40`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57` | 真Camera拖曳／縮放／重設與窄比例取景斷言。 | — |
| UT-104／SC-035 | ✅ 已符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewOrbitPolicyTests.cs:25`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:64`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57` | 文字焦點阻止拖曳、滾輪及鍵盤鏡頭並終止原拖曳。 | — |
| UT-105／SC-035 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:26`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:27`；`artifacts/acceptance/pm-20260928-interactive-20-a/run.json` | Tab／Shift+Tab 全控制焦點、Dropdown 離開、Clear Submit、可用 NextPage／Retry 焦點、50列捲動及 Player 選取／旋轉／重設已驗；搜尋／選取／重試／翻頁鍵盤 Submit 到 controller 的完整操作矩陣尚未驗。 | 高；`PreviewCameraController_KeyboardNavigation_ReachesControls_FullContractRegression` |
| UT-106／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:123` | PBR透明／橡膠政策與樣本可見，未逐變體對照印刷來源。 | 高；`MaterialPreviewPolicy_MaterialAssignment_PreservesAppearance_FullContractRegression` |
| UT-107／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:123` | Player固定光照有圖，無過曝／缺材質遮蔽的品質正反判定。 | 高；`MaterialPreviewPolicy_LightingPreset_PreservesReadability_FullContractRegression` |
| UT-108／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`artifacts/acceptance/pm-20260928-interactive-20-a/machine-audit.json` | 20個內部樣本有包版本與Player畫面，尚非合格交付變體及Editor替代反例的驗收政策。 | 高；`MaterialPreviewPolicy_PlayerEvidence_RequiredForAcceptance_FullContractRegression` |
| UT-109／SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:116`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 空結果文案、空rows及null model明確斷言。 | — |
| UT-110／SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:166`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:127`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 空結果保留CanClear，uGUI清除按鈕可用。 | — |
| UT-111／SC-037 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:139`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 清除重置所有條件再查同snapshot，恢復清單。 | — |
| UT-112／SC-038 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 模型錯誤顯示固定修復文案及來源DiagnosticId，不允許重試缺檔。 | — |
| UT-113／SC-038 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:173`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 失敗及null成功結果都不顯示模型，presenter不直出secret stack。 | — |
| UT-114／SC-038 | ✅ 已符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:188`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160` | 壞模型後仍可選另一件並清除舊錯誤；presenter無存檔寫入責任。 | — |
| UT-115／SC-039 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:16`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:208`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 慢A不能覆寫B模型／詳情，重試晚到亦受版本保護。 | — |
| UT-116／SC-039 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:32`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 丟棄／退出後晚到結果釋放一次，不能重新啟動已disposed policy。 | — |
| UT-117／SC-039 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:49`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:246`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247` | 舊結果不關閉新loading，晚到搜尋不蓋新頁。 | — |
| UT-118／SC-040 | ✅ 已符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:166`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | pending重試禁用且顯示重試中。 | — |
| UT-119／SC-040 | ✅ 已符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:20`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:208`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | 重複重試不建立第二請求，換件取消舊重試仍可進行。 | — |
| UT-120／SC-040 | ✅ 已符合 | `game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6` | `game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:36`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209` | 成功／可重試失敗恢復正確狀態，缺檔改指向修復。 | — |
| UT-121／SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | lease／instance釋放順序及RT重建各有測試，缺完整場景一次退出全資源核對。 | 高；`PreviewLifecycle_ExitScene_ReleasesOwnedResources_FullContractRegression` |
| UT-122／SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | disposed presenter忽略晚到結果；真銷毀uGUI後回呼矩陣未驗。 | 高；`PreviewLifecycle_LateCompletion_IgnoresDestroyedView_FullContractRegression` |
| UT-123／SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | RT重建有測試，缺重入新session並保留另一使用者mesh／material的整組斷言。 | 高；`PreviewLifecycle_ReenterScene_OpensFreshSession_FullContractRegression` |
| UT-124／SC-042 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 圖形不支援固定文案有政策測試；原生通知的實機矩陣另留ET。 | — |
| UT-125／SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 內部報告不自稱畫面核准；缺PNG／無3D的驗收判定反例。 | 高；`GraphicsCapabilityPolicy_MissingDevice_FailsVisualAcceptance_FullContractRegression` |
| UT-126／SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | launcher有本機診斷；未核對圖形故障時profile bytes與離線完整流程。 | 高；`GraphicsCapabilityPolicy_GraphicsFailure_PreservesData_FullContractRegression` |
| UT-127／SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無1000次查詢P95分項量測／門檻測試。 | 中；`PerformanceGate_QuerySamples_ApplySeparateP95Limits_FullContractRegression` |
| UT-128／SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無含hash至正確材質首幀的3秒判定。 | 中；`PerformanceGate_ColdModel_UsesThreeSecondLimit_FullContractRegression` |
| UT-129／SC-043 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | Player保存CPU／GPU／版本，缺完整驅動、cold定義及benchmark環境契約。 | 中；`PerformanceGate_BenchmarkRecord_RequiresEnvironment_FullContractRegression` |
| UT-130／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無2026片／8類幾何的固定效能場景。 | 中；`FramePerformanceGate_SceneManifest_RequiresRepresentativeBricks_FullContractRegression` |
| UT-131／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無穩態60秒原始frame資料及FPS／P95雙門檻。 | 中；`FramePerformanceGate_FrameSamples_EnforcesBothLimits_FullContractRegression` |
| UT-132／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 尚無基準硬體與固定profile效能驗收器。 | 中；`FramePerformanceGate_PlayerRun_RequiresMatchedEnvironment_FullContractRegression` |
| UT-133／SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | provider釋放閒置資產，但無256MiB LRU預算政策與測試。 | 中；`ResourceCachePolicy_UnusedCache_EnforcesBudget_FullContractRegression` |
| UT-134／SC-045 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 活躍lease保留已有證據，快取淘汰及活躍記憶體分列未驗。 | 中；`ResourceCachePolicy_ActiveAssets_AvoidsEviction_FullContractRegression` |
| UT-135／SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 未做20模型5輪物件／handles／記憶體趨勢核對。 | 中；`ResourceCachePolicy_RepeatedCycles_DetectsLeak_FullContractRegression` |
| UT-136／SC-046 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 無輪組模型／軸心／碰撞同倍率原型。 | 高；`VehicleMetadataPolicy_WorldScale_KeepsWheelGeometryAligned_FullContractRegression` |
| UT-137／SC-046 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 來源metadata保存mass狀態；runtime投影與有限原型仍未貫通。 | 高；`VehicleMetadataPolicy_UnknownMass_PreservesEvidenceState_FullContractRegression` |
| UT-138／SC-046 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 無主要車身剛體與坡道／路肩動態接觸紀錄。 | 高；`VehicleMetadataPolicy_ContactFixture_DoesNotClaimRaceComplete_FullContractRegression` |
| UT-139／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | C/G/V 與非完整 Preview 標記已有局部證據，內部包尚非 Ready 合格子集合。 | 高；`SelectPreview_ReadySubset_ExcludesIncompleteItems_FullContractRegression` |
| UT-140／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | Release拒Preview文案與編譯身分已有局部證據；修改config繞過反例未全驗。 | 高；`OpenPackage_PreviewInRelease_ReturnsIncompatibleContent_FullContractRegression` |
| UT-141／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | 獨立資料根／Browse限制已做，正式profile匯入與head／權益不變整組未驗。 | 高；`AuthorizePreview_FormalPurpose_RejectsWithoutGrant_FullContractRegression` |
| UT-142／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | repository可記Frozen validation；缺真Unity BuildValidationContent及合格子集。 | 高；`ValidateCandidate_FrozenSnapshot_LeavesHeadUnchanged_FullContractRegression` |
| UT-143／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | version改變拒舊報告，selection／toolchain／target逐欄矩陣不齊。 | 高；`PromoteCandidate_ChangedDigest_RejectsStaleReport_FullContractRegression` |
| UT-144／SC-048 | ⚠️ 部分符合 | `tools/catalog/repository.py:160`；`tools/catalog/cli.py:88` | `tools/catalog/tests/integration/test_snapshot_repository.py:56`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | CAS已驗，但BuildCatalogContent精確封裝Published產物尚缺。 | 高；`CommitPublication_CasConflict_PreservesPreviousHead_FullContractRegression` |
| UT-145／SC-049 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | Company／Product／applicationId及Release／Preview資料根明確固定並有斷言。 | — |
| UT-146／SC-049 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | canonical root鎖、雙程序兩種競爭順序及受控子程序授權已驗；launcher持鎖至退出。 | — |
| UT-147／SC-049 | ✅ 已符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64`；`tools/acceptance/tests/integration/test_install_update.py:118` | Busy固定訊息及permission／pointer失敗保留舊安裝與人工profile，無強殺或新DB路徑。 | — |
| UT-148／SC-050 | ✅ 已符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:14`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | Compatible／MigrationRequired區分寫入資格；新schema保留訊息且零resolver呼叫。 | — |
| UT-149／SC-050 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | 無WAL一致備份、last-good原子提交及migration故障恢復。 | 高；`CommitBackup_InvalidTemporaryCopy_PreservesLastGood_FullContractRegression` |
| UT-150／SC-050 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | 无版本／時間／取消／確認還原與保存較新進度的harness。 | 高；`RestoreSave_NoConfirmation_PreservesCurrentProgress_FullContractRegression` |
| UT-151／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 完整複合FK及resolver已做；錯variant／target／unique写入矩陣未全驗。 | 高；`ResolveReference_MixedTuple_RejectsWrongOwner_FullContractRegression` |
| UT-152／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | pack/schema/損毀已驗，snapshot/app/kind/target逐欄錯配矩陣未全驗。 | 高；`ValidateManifest_FieldMismatch_ReturnsIncompatibleContent_FullContractRegression` |
| UT-153／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 缺精確歷史映射回不相容，尚缺所有損毀資料與存檔不變反例。 | 高；`ResolveLegacy_MissingRevision_DoesNotUseLatest_FullContractRegression` |
| UT-154／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | null/disposed／跨owner／部分DTO及header有測試，全部公開方法與去重多引用矩陣不齊。 | 高；`ValidateInput_InvalidSessionOrDto_ReturnsInvalidQuery_FullContractRegression` |
| UT-155／SC-052 | ✅ 已符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:18`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | scalar／UTF16／ASCII界線與SQLite中文／引號／%/_字面搜尋、cursor綁定已驗。 | — |
| UT-156／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 預取消零handle／IO及取消釋放已有證據，全部async／取消不彈警報與晚到UI矩陣不齊。 | 高；`CancelRequest_PreCancelledInvalidInput_ReturnsCancelled_FullContractRegression` |
| UT-157／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python真junction及C#路徑政策已驗；Player最終目標／根外零讀取完整反例未驗。 | 高；`ResolveAsset_ReparseOrPrefixEscape_RejectsTarget_FullContractRegression` |
| UT-158／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | 實作每次讀實際bytes，Python同大小mtime反例已驗；新程序／多包／存活lease矩陣未全驗。 | 高；`ValidateCache_ChangedFileIdentity_RequiresHash_FullContractRegression` |
| UT-159／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | C#用verified bytes載bundle且鎖讀，缺真Player hash-to-load barrier競態及profile斷言。 | 高；`LoadVerified_BytesChangedBeforeRead_RejectsUnverifiedContent_FullContractRegression` |
| UT-160／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 報告明列visualApproved=false；缺核准登錄、baseline digest及改版重審政策。 | 中；`ApproveVisual_NoUserDecision_RemainsUnapproved_FullContractRegression` |
| UT-161／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:480`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:257`；`artifacts/test-results/pm-20260927-unity-integrated-r2.xml` | 缺字會有可見警示並可清除，隨包字型／shader已有檢查；印刷鏡像、過曝、粉紅 shader 等完整可見缺陷矩陣未驗。 | 中；`EvaluateVisual_VisibleDefect_FailsAcceptance_FullContractRegression` |
| UT-162／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | native launcher與誠實通用文案已做；無3D／崩潰原生通知的實機證據不齊。 | 中；`DescribeStartup_UnknownCause_UsesHonestNativeMessage_FullContractRegression` |
| UT-163／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 目前只保存探索環境，無基準資格判定及不同硬體反例測試。 | 中；`EvaluateBenchmark_DifferentHardware_MarksExploratory_FullContractRegression` |
| UT-164／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 無完整凍結BenchmarkProfile及變更失效比對器。 | 中；`CompareBenchmark_ChangedProfile_RejectsMixedResults_FullContractRegression` |
| UT-165／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 無首個正確畫面計時與2026片穩態資料，不能以總流程秒數代替。 | 中；`MeasureFirstFrame_PlaceholderVisible_DoesNotStopTimer_FullContractRegression` |
| UT-166／SC-056 | ✅ 已符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:31` | 來源metadata規則拒絕零／未知尺寸及非單位軸，wheelEligible=false但geometryIssues不增加；有限數值共用驗證已測。 | — |
| UT-167／SC-056 | ✅ 已符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | Unknown必須null與reason；Measured／Estimated共用有限正值及來源規則，缺理由／來源／Infinity反例已測。 | — |
| UT-168／SC-056 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 無輪胎／輪圈／軸配對與不同輪徑／軸距靜動態矩陣。 | 高；`MatchWheelProfile_IncompatiblePair_RejectsAssembly_FullContractRegression` |

### IT 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| IT-001／SC-001、SC-002、SC-003 | ✅ 已符合 | `tools/catalog/importing.py`；`tools/catalog/repository.py`；`tools/catalog/policies.py::VariantIdentityPolicy` | `tools/catalog/tests/unit/test_sc_001.py`；`tools/catalog/tests/unit/test_sc_002.py`；`tools/catalog/tests/unit/test_sc_003.py`；來源／resolve 整合測試 | 真 CLI、來源檔與 SQLite 涵蓋 set inventory、Design／Element identity、外觀 variant、hash／alias 及 rollback；不含任何 lifecycle 判定。 | — |
| IT-002／SC-004、SC-005、SC-027 | ⚠️ 部分符合 | `tools/catalog/repository.py:131`；`tools/catalog/quality.py:321`；`tools/catalog/cli.py:94`；`tools/catalog/policies.py:94` | `tools/catalog/tests/unit/test_quality_report.py:159`；`tools/catalog/tests/integration/test_snapshot_repository.py:123`；`tools/catalog/tests/integration/test_catalog_cli.py:81` | 快照／CAS、拒絕發布與單件合成報告正例已驗；仍無真實完整 SQLite 全量發布矩陣或成功切 head 正例。 | 高；`RunPublishGate_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-003／SC-006、SC-010、SC-013 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11`；`tools/catalog/building.py:114`；`tools/catalog/render_views.py:15`；`tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212`；`tools/catalog/tests/integration/test_six_views.py:12`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 真Blender／validator／六視圖可跑，缺補模與所有代表件完整品質及RuntimeBuild。 | 高；`RunModelPipeline_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-004／SC-007、SC-008、SC-029 | ✅ 符合 | `game/Assets/BrickHigh/Domain/Geometry.cs:15`；`game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58`；`game/Assets/BrickHigh/Domain/Geometry.cs:50` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`game/Assets/BrickHigh/Tests/PlayMode/CoordinateAndConnectorTests.cs`；`tools/catalog/tests/integration/test_transparent_conversion.py:69`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46`；`game/Assets/BrickHigh/Tests/EditMode/Unit/MetadataValidationPolicyTests.cs:9` | UPM blocker 已解除，真正 Unity PlayMode 非0測試已 Green。Gate 2 runner 以真 MeshCollider 驗證 **20/20 Verified collision fixtures**：既有 14417 `ball-v1` 三軸 solid probes、14418 `socket-v1` passage、2780 friction pin 的 Y／Z 橫切 solid probes、3705 axle 的 X／Y／Z 十字截面 solid probes，以及 3437 DUPLO 依 `stud7.dat` 9.6 mm 直徑以 4.66 mm probe 驗證四個 X/Z ±8 mm logical female sockets 開放，中央 `stud8.dat` clutch tube 僅作幾何證據；`973p06` 亦以真 glTFast／MeshCollider 驗證左右 arm socket 與 hips socket passage 保持開放、neck post solid probe 成立。canonical probes 皆先經 `CoordinatePolicy.ToUnity` 再比對匯入模型。最新 PlayMode job `77471e19-b5b8-4fb1-a43c-83496089832d` 確實進 Test Runner／exit 0，且同一 case 以 collision fixtures 對應的20個不同 model folders 逐件真實匯入，證明 **20/20 Renderer bounds 符合 SPEC 尺寸容差、20/20 GLB ≤20 MiB**；20件 runtime materials 實測皆 `textures=0`，所以只能證明本集合沒有超限 texture，不能作 texture-bearing pipeline 正例。immutable revision archive 的 preview 仍為 **12/20**，原8件 revision 不回寫；另以相同 `render_views.py` 綁定 exact model hash 建立獨立 Gate 2 acceptance evidence，補出原8件 preview，使固定20件可驗證 preview evidence 達 **20/20**，且 **20/20 ≤256 KiB**。acceptance job `adea623e-9198-4cbb-9ca2-1823e292a07f` exit 0；使用者於2026-10-03檢視 `artifacts/acceptance/gate2-fixed20-preview-completion/manual-visual-review.html` 後確認可繼續。此確認不產生正式 `visualBaselineId`、不把 `visualApproved` 改為 true、也不升格 Ready。其後補上兩個真 glTFast 正例：SC-029 test-only 32×16 texture fixture 在 PlayMode log 為 `IT004_TEXTURE_POSITIVE textures=1 target32x16=1`；SC-007 test-only tangent fixture log 為 `IT004_TANGENT_POSITIVE vertices=3 tangents=3 handedness=1 windingDot=1`。SC-008 原契約的 System stud/tube、Technic pin/hole、axle/hole、clip/bar、ball/socket 與跨系列 DUPLO 代表 profile／Collider 組合均已有真 MeshCollider fixture，加上版本化 profile contract 與跨系列拒絕。最終 PlayMode job `73aecfc4-eac3-40d4-9c13-c05c2f1aba2c` 確實 Green／exit 0，因此 SC-007／008／029 的 IT-004 矩陣閉環；fixed20 本身仍是 texture 0/20、archive preview 12/20，不能混同 test fixture 或 acceptance evidence。 | 本項完成；Ready／LEGO identity 與 ET-008 仍另追 |
| IT-005／SC-009、SC-031 | ⚠️ 部分符合 | `tools/catalog/resolving.py:24`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:105` | `tools/catalog/tests/integration/test_catalog_resolve.py:104`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192` | 分類及讀取過濾局部完成，缺六部位／同系統建材與Special用途完整矩陣。 | 高；`RunUsageProjection_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-006／SC-011、SC-022 | ✅ 符合 | `tools/catalog/repository.py::CatalogRepository.fork`；`tools/catalog/jobs.py`；`tools/catalog/building.py::revision_input_digest` | `tools/catalog/tests/integration/test_job_recovery.py`；`tools/catalog/tests/unit/test_sc_011.py`；`tools/catalog/tests/unit/test_sc_022.py`；`tools/catalog/tests/integration/test_catalog_build.py` | 真 SQLite 覆蓋 Published 後 same-baseline set-driven successor、新盒組 Element／Design 只進 successor、同鍵冪等／衝突、revision identity 變更、過期租約雙 worker 僅一人接手，以及真 Blender subprocess timeout 後獨立 item 可繼續；失敗 item 使整體 job 保持 Failed。 | 本項完成 |
| IT-007／SC-012、SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 精確resolver有測，尚無跨引擎重建舊模型的實際Player流程。 | 高；`RunLegacyRuntime_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-008／SC-015、SC-028 | ✅ 符合 | `BrickCatalog.OpenAsync`／`QueryAsync`／`GetVariantAsync`／`GetProfilesAsync`／`GetCoverageAsync` | `ReadContractTests.RunReadContract_ScenarioMatrix_PreservesContract`；focused job `e191f4d4-265d-489c-8d0d-bdbed50bb34d` | 真 Release SQLite 101 筆分頁、用途、selected revision、anchor／vehicle metadata、System＋DUPLO profiles、C/G/V 與另一 snapshot 衝突隔離均已驗；全 pack SHA 前後不變且無 WAL／SHM。 | 本項完成；SC-028 仍依其其他追溯項判定 |
| IT-009／SC-016、SC-026 | ✅ 符合 | `NativeSqlite`；`LocalStoragePolicy`；`tools/launcher/Program.cs`；`tools/acceptance/run_interactive_fixture.py` | fresh installed-Player job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80` exit 0 | 真 packaged Player 在中文／空白路徑及目前帳號 RX ACL 下成功；install tree SHA 不變、無 WAL／SHM；不可寫獨立 LocalLow 明確 `StorageUnavailable` 且 profile 不變。Acceptance-only root override 由 compile flag 隔離，不存在正式包。 | 本項完成；SC-026 仍依其其他追溯項判定 |
| IT-010／SC-017、SC-023 | ⚠️ 部分符合 | `tools/installer/InstallerCore.cs:53`；`tools/installer/InstallerCore.cs:175`；`tools/catalog/repository.py:190` | `tools/acceptance/tests/integration/test_install_update.py:72`；`tools/acceptance/tests/integration/test_install_update.py:100`；`tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118` | 真InstallerCore故障与profile保留已驗；空間不足及舊模型相容更新未全驗。 | 高；`RunInstallerSwitch_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-011／SC-018、SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | checker與SQLite rollback各有單測，無一致備份／migration／組裝檔引用流程。 | 高；`RunSaveFixtures_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-012／SC-019、SC-024 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42` | 包索引／遠端／越界局部反例已驗；完整安裝錯誤與存檔保留矩陣不齊。 | 高；`RunPackageValidation_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-013／SC-021 | ✅ 已符合 | `tools/catalog/jobs.py:50`；`tools/catalog/jobs.py:289` | `tools/catalog/tests/unit/test_sc_021.py:22`；`tools/catalog/tests/integration/test_catalog_jobs.py:83`；`tools/catalog/tests/integration/test_catalog_jobs.py:139` | 真HTTP stub 429／timeout加fake clock、checkpoint／重試上限及候選不變斷言涵蓋SC-021。 | — |
| IT-014／SC-030 | ⚠️ 部分符合 | `tools/catalog/repository.py:190` | `tools/catalog/tests/integration/test_snapshot_repository.py:67` | 真雙連線CAS已有證據，無head切換前後舊session／實體內容一致性驗證。 | 高；`RunConcurrentPublish_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-015／SC-032、SC-039、SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53`；`game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | lease與內部provider探針已驗；慢載入／退出重入的真場景共享資源矩陣不足。 | 高；`RunAssetLifetime_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-016／SC-033、SC-034、SC-035、SC-037、SC-038、SC-040、SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6`；`game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | uGUI與Player操作已有證據；鍵盤篩選／重試、損毀換件及圖形故障矩陣不齊。 | 高；`RunPreviewInteractions_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-017／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 20樣本畫面存在；缺逐變體來源外觀比對、橡膠差異及使用者核准紀錄。 | 高；`RunVisualVariants_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-018／SC-043、SC-044、SC-045、SC-046 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28`；`tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 無完整效能／記憶體／輪組原型與原始量測。 | 中；`RunPerformanceFixtures_ScenarioMatrix_PreservesContract_FullContractRegression` |
| IT-019／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | 有內部F-Catalog建置，非Ready與使用條件通過的Frozen合格子集。 | 高；`BuildPreview_IncompleteCatalog_LabelsNonRelease_FullContractRegression` |
| IT-020／SC-048 | ⚠️ 部分符合 | `tools/catalog/validation_content.py`；`game/Assets/BrickHigh/Editor/ValidationContentBuild.cs`；`game/Assets/BrickHigh/UnityRuntime/ValidationContentPlayer.cs` | `tools/catalog/tests/integration/test_validation_content.py`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ValidationContentTests.cs`；testOnly Windows Player六視圖 | 已有真正Frozen輸入、共用Unity／Player管線及不可變staging／RuntimeBuild索引；實際20件已核准、Ready及Frozen選件20/20；仍因fixture／正式來源身份未建立而阻擋，尚無合格正式來源子集的成功RuntimeBuild。 | 高；`BuildValidation_FrozenSnapshot_ProducesStagingOnly_FullContractRegression` |
| IT-021／SC-048 | ⚠️ 部分符合 | `tools/catalog/validation_content.py`；`tools/catalog/repository.py` | `tools/catalog/tests/integration/test_validation_content.py` | snapshot version／選件、target／Editor／package lock／座標／builder摘要、模型與metadata換包、Player／bundle／六視圖綁定及提交交易內CAS均有正反測試；Published完全匹配之正式封裝正例仍待合格來源。 | 高；`PromoteBuild_ChangedSourceDigest_RejectsPromotion_FullContractRegression` |
| IT-022／SC-049 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | 真兩程序競爭及檔案鎖故障已有證據，缺原生訊息與真ACL故障完整驗收。 | 高；`Update_GameRestartsDuringStaging_DefersSwitch_FullContractRegression` |
| IT-023／SC-050 | ❌ 未符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:15` | 沒有WAL一致備份及copy/validate/commit/migration故障注入流程。 | 高；`Backup_IncompleteCopy_DoesNotReplaceLastGood_FullContractRegression` |
| IT-024／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | 真SQLite完整引用resolver已驗；複合FK／unique／target所有寫入反例不齊。 | 高；`Resolve_MixedReferenceTuple_RejectsModel_FullContractRegression` |
| IT-025／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 零IO預取消及內部provider取消有證據；真UI銷毀回呼／不彈警報矩陣不足。 | 高；`AcquireAsync_PreCancelled_AllocatesNoHandle_FullContractRegression` |
| IT-026／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python真junction拒絕不等於Player adapter根外零讀取及profile驗證。 | 高；`LoadAsset_ReparsePointEscape_RejectsAccess_FullContractRegression` |
| IT-027／SC-053 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/SafeContent.cs:11`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:243` | `tools/acceptance/tests/integration/test_it_026.py:10`；`tools/acceptance/tests/integration/test_it_027.py:12`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:32` | Python同大小mtime／verified bytes已有測；缺真loader barrier／新程序／存活lease完整矩陣。 | 高；`LoadAsset_ReplacedSameSizeBundle_InvalidatesValidation_FullContractRegression` |
| IT-028／SC-056 | ⚠️ 部分符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 來源metadata檢查已做，未貫通runtime匯入／序列化／候選過濾。 | 高；`ValidateWheel_UnknownMass_DoesNotInventValue_FullContractRegression` |
| IT-029／SC-056 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90` | `tools/catalog/tests/unit/test_metadata_quality.py:61`；`tools/catalog/tests/unit/test_metadata_quality.py:75` | 沒有兩輪徑／兩軸距／非法配對的Unity靜態與動態原型。 | 高；`MatchWheel_IncompatibleAxle_RejectsAssembly_FullContractRegression` |

### CT 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| CT-001／SC-015、SC-019、SC-026 | ✅ 符合 | `BrickCatalog.OpenAsync`；`CatalogSession`；`ReleaseFileIndex` | `ReadContractTests.OpenAsync_ContractMatrix_ReturnsSpecifiedOutcome`；job `0ed8016e-493c-4e98-8c76-0c829b5cdca9` | pre-cancel、缺 pack、正式 Release 正例、缺相依、unsupported schema、固定 session 身分與零 sidecar 均回指定結果。 | 本項完成；SC-019／026 仍依各自其他追溯項判定 |
| CT-002／SC-015、SC-020、SC-028、SC-031 | ✅ 符合 | `BrickCatalog.QueryAsync`；`CatalogInputPolicy` | `ReadContractTests.QueryAsync_ContractMatrix_ReturnsSpecifiedOutcome`；job `9ef7c82a-f305-42dc-8cb1-230b8f059c43` | Release 101 筆分頁無重漏、exact/family/tier/slot/CharacterCreation/InitialBucket、Special 限制、非法輸入、跨 snapshot cursor 與取消完整矩陣 Green。 | 本項完成；其他場景仍依其其他追溯項判定 |
| CT-003／SC-012、SC-015、SC-020 | ✅ 符合 | `BrickCatalog.GetVariantAsync`；`ResolveVariantAsync` | `ReadContractTests.GetVariantAsync_ContractMatrix_ReturnsSpecifiedOutcome`；job `04b27f57-d034-43fe-ad4f-d003510e6676` | current frozen projection/revision、其他 snapshot-only variant、未知／空 UUID、取消與 disposed session typed outcomes 全部已驗。 | 本項完成；SC-012／020 仍依其他追溯項判定 |
| CT-004／SC-008、SC-015 | ✅ 符合 | `game/Assets/BrickHigh/Domain/ConnectorCompatibility.cs`；`tools/catalog/metadata_quality.py:58`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ConnectorCompatibilityTests.cs`；`tools/catalog/tests/unit/test_metadata_quality.py:37`；`tools/catalog/tests/unit/test_metadata_quality.py:46`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs`；Unity EditMode job `6703ec59-75cd-482d-8e01-e95ddfe6301b` | profile 配對本體已驗版本化ID、明確雙向相容與跨系列拒絕；真 SQLite contract fixture 同一 session 同時保留 System／DUPLO profiles，並在另一 snapshot 放入相同 `system-stud-v1` ID 的衝突定義，`GetProfilesAsync` 仍只回 session 綁定 snapshot。Unity 確實進 Test Runner 並 exit 0，因此本契約矩陣完成。 | 本項完成；IT-004 真實 Collider／配對矩陣另追 |
| CT-005／SC-005、SC-015、SC-027 | ✅ 符合 | `BrickCatalog.GetCoverageAsync`；`CatalogCoverage`；`CatalogCoveragePolicy` | `ReadContractTests.GetCoverageAsync_ContractMatrix_ReturnsSpecifiedOutcome`；job `2c8a79c9-3452-488d-88d2-154f46b473f0` | API 空 scope、完整 C=V、含 G 三組皆精確回 C/G/V、ScopeReviewed 與 ratio；空分母保持 null 而非 100%。 | 本項完成；SC-005／027 仍依其他追溯項判定 |
| CT-006／SC-012、SC-019、SC-024、SC-032 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`tools/catalog/content.py:14`；`game/Assets/BrickHigh/Infrastructure/LocalAddressablesPolicy.cs:11`；`game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`tools/catalog/tests/unit/test_sc_024.py:9`；`tools/catalog/tests/unit/test_ldraw_sources.py:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/LocalAddressablesPolicyTests.cs:42`；`game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159` | 真provider正常／取消已有證據；多包／全部故障／零權益寫入矩陣不足。 | 高；`AcquireAsync_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-007／SC-018、SC-025 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `game/Assets/BrickHigh/Tests/EditMode/Integration/NativeSqliteTests.cs:50`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 純checker測schema與missing單引用；缺真adapter完整requiredModels與存檔bytes。 | 高；`Check_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-008／SC-032、SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/UnityRuntime/ModelLease.cs:14`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:21`；`game/Assets/BrickHigh/UnityRuntime/ToolchainProbe.cs:159`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | session／lease可重複Dispose；真退出uGUI與共享資產矩陣不足。 | 高；`Dispose_ContractMatrix_ReturnsSpecifiedOutcome_FullContractRegression` |
| CT-009／SC-019、SC-020、SC-025、SC-026 | ✅ 符合 | `game/Assets/BrickHigh/Domain/CatalogResult.cs:7`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:67` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogResultPolicyTests.cs:8`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogResultPolicyTests.cs:33` | 全 11 錯誤碼、繁中文案、retryable、診斷 ID、Success／Failure 互斥及任意 message 去敏已參數化驗證；Unity 163/163。 | 本項完成；各 BDD 場景仍依各自端到端門檻計 |
| CT-010／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:210` | Release拒Preview已測；InitialBucket、profile隔離及改config反例不齊。 | 高；`OpenRelease_PreviewPack_RejectsPackage_FullContractRegression` |
| CT-011／SC-050 | ✅ 符合 | `game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9`；`game/Assets/BrickHigh/Application/SaveOpenCoordinator.cs:38` | `game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs:48`；`game/Assets/BrickHigh/Tests/EditMode/Contract/CT011RiskContractTests.cs:166` | 相容、需 migration、較新 schema、壞內容及空 requiredModels 矩陣已測；真 NativeSqlite F-Save 證明較新 schema 零可寫開啟且 bytes 不變，相容時可寫回讀。 | 本項完成；正式 Player 存檔流程仍待整合 |
| CT-012／SC-051 | ⚠️ 部分符合 | `tools/catalog/runtime_schema.sql:3`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:270` | pack/schema/腐壞有反例；全部身分逐欄及缺歷史引用矩陣不齊。 | 高；`OpenAsync_ManifestCatalogMismatch_RejectsPack_FullContractRegression` |
| CT-013／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 部分null/disposed/跨owner與header有測；全部方法及不同requiredModels去重仍缺。 | 高；`QueryAsync_NullOrDisposedSession_ReturnsInvalidQuery_FullContractRegression` |
| CT-014／SC-052 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Domain/CatalogInputPolicy.cs:36`；`game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:53` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogInputPolicyTests.cs:19`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:236`；`game/Assets/BrickHigh/Tests/EditMode/Unit/AssetProviderInputTests.cs:16` | 字面查詢與界線單測已做，契約层255/256/257及4095/4096/4097全矩陣未驗。 | 高；`QueryAsync_OversizedOrLiteralWildcard_ValidatesAndBinds_FullContractRegression` |

### ET 逐項判定

| ID／來源 | 狀態 | 實作位置 | 斷言／證據位置 | 判定與未完成原因 | 優先級／建議補測 |
|---|---|---|---|---|---|
| ET-001／SC-033 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:31`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:118` | 內部包可安裝首次啟動；未在無開發工具的乾淨斷網Windows完整驗收。 | 高；`RunOfflineInstall_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-002／SC-034、SC-035、SC-037 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:100`；`game/Assets/BrickHigh/UnityRuntime/PreviewCameraController.cs:12`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:81`；`game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:45`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PreviewCameraControllerTests.cs:41`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:26`；`game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:57`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:117` | 真Player換件／空結果／鏡頭／鍵盤有證據；所有篩選／鍵盤重試／翻頁尚缺。 | 高；`RunBrowseAndCamera_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-003／SC-036 | ⚠️ 部分符合 | `tools/catalog/materials.py:9`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21` | `tools/catalog/tests/unit/test_material_conversion.py:9`；`artifacts/acceptance/pm-20260928-interactive-20-a/PlayerEvidence/result.json` | 有20樣本六方向Player圖；缺逐外觀來源比對及材質失敗反例與使用者核准。 | 高；`RunMaterialAcceptance_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-004／SC-038、SC-039、SC-040、SC-041 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Application/CatalogPreviewPresenter.cs:10`；`game/Assets/BrickHigh/Application/SelectionRequestPolicy.cs:8`；`game/Assets/BrickHigh/Application/RetryRequestPolicy.cs:6`；`game/Assets/BrickHigh/UnityRuntime/CatalogPreviewController.cs:13`；`game/Assets/BrickHigh/Presentation/CatalogPreviewView.cs:19` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SelectionRequestPolicyTests.cs:17`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:247`；`game/Assets/BrickHigh/Tests/EditMode/Unit/RetryRequestPolicyTests.cs:10`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:209`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:231`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:193` | presenter與原生探針局部通過，未執行安裝版完整故障／快速切換／重入矩陣。 | 高；`RunRapidSelection_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-005／SC-019、SC-026、SC-042 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:236`；`game/Assets/BrickHigh/Domain/CatalogResult.cs:31`；`game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:240`；`tools/launcher/Program.cs:86`；`game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:88` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:157`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewPresenterTests.cs:160`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 原生啟動器存在，缺全部故障的原生通知與原profile保留證據。 | 高；`RunStartupFailure_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-006／SC-016、SC-017 | ✅ 符合 | `tools/installer/InstallerCore.cs`；`tools/launcher/Program.cs`；`LocalStoragePolicy`；`tools/acceptance/run_interactive_fixture.py` | fresh installed-Player job `3883ee7e-bcfc-4891-8b99-1b2f9c414e80` exit 0；既有 `test_install_update.py` unit/integration evidence | 真 packaged Installer 完成 A→B pointer 切換與歷史版本保留，真 Launcher／Player 在唯讀 install 下重啟成功，profile bytes 全程不變；預設 uninstall 移除 pointer／內容並只允許執行中 uninstaller 自身殘留。 | 本項完成；SC-017 仍依 UT-051／IT-010 判定 |
| ET-007／SC-023、SC-025 | ⚠️ 部分符合 | `tools/catalog/repository.py:190`；`tools/installer/InstallerCore.cs:53`；`game/Assets/BrickHigh/Application/SaveCompatibilityChecker.cs:9` | `tools/catalog/tests/integration/test_snapshot_repository.py:88`；`tools/acceptance/tests/integration/test_install_update.py:118`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:28`；`game/Assets/BrickHigh/Tests/EditMode/Unit/SaveCompatibilityCheckerTests.cs:54` | 更新回滾及schema政策部分已測，缺安裝版空間不足／缺舊映射逐例訊息。 | 高；`RunFailedUpdateAndSave_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-008／SC-006、SC-007、SC-010、SC-013 | ⚠️ 部分符合 | `tools/catalog/glb.py:28`；`tools/catalog/glb.py:11`；`game/Assets/BrickHigh/Domain/Geometry.cs:15`；`tools/catalog/building.py:114`；`tools/catalog/render_views.py:15`；`tools/catalog/building.py:167`；`tools/catalog/sources.py:38` | `tools/catalog/tests/unit/test_glb_validation.py:35`；`tools/catalog/tests/unit/test_validator_binding.py:17`；`tools/catalog/tests/integration/test_catalog_build.py:212`；`game/Assets/BrickHigh/Tests/EditMode/Unit/CoordinatePolicyTests.cs:9`；`tools/catalog/tests/integration/test_transparent_conversion.py:69`；`tools/catalog/tests/integration/test_six_views.py:12`；`tools/catalog/tests/unit/test_ldraw_sources.py:22` | 真來源轉GLB／Player樣本已做，缺自建補件及完整品質鏈。 | 高；`RunSourceToPlayer_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-009／SC-005、SC-027 | ❌ 未符合 | `tools/catalog/cli.py:88`；`tools/catalog/repository.py:190`；`tools/catalog/policies.py::CatalogCoveragePolicy` | `tools/catalog/tests/integration/test_catalog_cli.py`；`tools/catalog/tests/unit/test_sc_027.py`；`tools/acceptance/tests/integration/test_set_inventory_identity_audit.py` | 10334 inventory／identity 已閉環為 276/276 rows、0 identity gap；仍缺全 Ready 資產、逐變體 RuntimeBuild／品質證據與正式發布報告。 | 高；`RunFullCatalogRelease_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-010／SC-012、SC-014 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:192`；`game/Assets/BrickHigh/Editor/ToolchainProbeBuild.cs:21`；`tools/catalog/runtime_schema.sql:3` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:125` | 精確引用fixture能解析，沒有兩代引擎安裝包的舊外觀／尺寸驗收。 | 高；`RunLegacyModelUpgrade_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-011／SC-043 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無基準機1000次查詢P95與單件冷載首幀數據。 | 中；`RunQueryAndColdLoad_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-012／SC-044 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無2026片8幾何固定場景的正式FPS／P95報告。 | 中；`RunFrameBenchmark_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-013／SC-045 | ❌ 未符合 | `game/Assets/BrickHigh/UnityRuntime/BrickAssetProvider.cs:28` | `game/Assets/BrickHigh/Tests/EditMode/Unit/ModelLeasePolicyTests.cs:36` | 無20模型5輪切換與LRU／記憶體實測。 | 中；`RunMemoryBenchmark_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-014／SC-046 | ❌ 未符合 | `tools/catalog/metadata_quality.py:90`；`game/Assets/BrickHigh/Domain/Geometry.cs:15` | `tools/catalog/tests/unit/test_metadata_quality.py:75` | 無輪組坡道／路緣實際Player原型。 | 高；`RunWheelGeometryPrototype_InstalledPlayer_SatisfiesAcceptance_FullContractRegression` |
| ET-015／SC-047 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/BrickCatalog.cs:23`；`game/Assets/BrickHigh/PreviewEntry/PreviewBootstrap.cs:15` | `game/Assets/BrickHigh/Tests/EditMode/Integration/ReadContractTests.cs:192`；`game/Assets/BrickHigh/Tests/EditMode/Unit/PlayerStartupPolicyTests.cs:27`；`artifacts/acceptance/pm-20260928-interactive-20-a/run.json` | 內部20樣本可操作；缺合格Ready子集、全部代表類別及Release隔離完整驗收。 | 高；`AcceptPreview_VisibleAssets_DoesNotCompleteFullCatalog_FullContractRegression` |
| ET-016／SC-049 | ⚠️ 部分符合 | `game/Assets/BrickHigh/Infrastructure/InstallLifecycle.cs:11`；`tools/installer/InstallerCore.cs:53`；`tools/launcher/Program.cs:14` | `game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:17`；`tools/acceptance/tests/integration/test_install_update.py:184`；`tools/acceptance/tests/integration/test_install_update.py:118` | Preview持鎖啟動與Installer身份已有證據，缺兩代Release/Preview真包交叉升級矩陣。 | 高；`Upgrade_StableProductIdentity_UsesExistingProfile_FullContractRegression` |
| ET-017／SC-050 | ✅ 符合（F-Save harness） | `tools/acceptance/save_fixture_recovery.py:69`；`tools/acceptance/save_fixture_recovery.py:97`；`tools/acceptance/save_fixture_recovery.py:113` | `tools/acceptance/tests/integration/test_save_fixture_recovery.py`；`artifacts/acceptance/pm-20260927-save/` 四種 CLI 報告 | 真 SQLite／WAL 一致備份、失敗 rollback、最後良好備份及無選擇／取消／失敗／確認矩陣 14 項通過；確認前新進度保留，確認後先另存當前進度。正式玩家 UI 不屬本 harness。 | 本項完成；SC-050 正式 UI／schema 仍部分符合 |
| ET-018／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 隨包Noto與三尺寸可讀性已有證據，缺所有錯誤文案／缺glyph反例及乾淨離線機。 | 中；`Preview_MissingChineseGlyph_FailsVisualCheck_FullContractRegression` |
| ET-019／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `game/Assets/BrickHigh/Tests/EditMode/Unit/CatalogPreviewViewTests.cs:306`；`game/Assets/BrickHigh/Tests/EditMode/Unit/InstallLifecyclePolicyTests.cs:64` | 原生launcher有MessageBox與本機診斷，缺無3D／崩潰故障通知實機證據。 | 中；`Startup_NoGraphicsDevice_ProvidesNativeNotice_FullContractRegression` |
| ET-020／SC-054 | ⚠️ 部分符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170`；`tools/launcher/Program.cs:86` | `artifacts/acceptance/wd-20260926-interactive-c/PlayerEvidence/frames/`；`artifacts/acceptance/pm-20260928-interactive-20-a/manual-visual-review.html` | 使用者先前接受八件內部畫面方向；新20件安裝版畫面已交由使用者自行判斷外觀，主代理不代判。仍無綁定真實 Ready revision 的 `visualBaselineId`、正式核准及缺陷回歸流程，`visualApproved=false` 保持不變。 | 中；`Render_GoldenReferenceMismatch_RequiresReview_FullContractRegression` |
| ET-021／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 尚無固定2026片場景與指定或核准硬體的完整原始測量。 | 中；`Benchmark_DifferentHardware_DoesNotClaimBaselinePass_FullContractRegression` |
| ET-022／SC-055 | ❌ 未符合 | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | `game/Assets/BrickHigh/PreviewEntry/InternalPreviewAcceptance.cs:170` | 未凍結profile，無正確材質首幀及冷暖／穩態分段資料。 | 中；`Benchmark_ChangedPreset_InvalidatesComparison_FullContractRegression` |
