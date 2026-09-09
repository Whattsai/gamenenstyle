# SPEC-001-BrickModelCatalog — 實作前風險與缺漏稽核報告

**來源 MVP**：[MVP-001-V1Version](../requirements/MVP-001-V1Version.md)
**來源 SPEC**：[SPEC-001-BrickModelCatalog](SPEC-001-BrickModelCatalog.md)
**BDD**：[SPEC-001-BrickModelCatalog-BDD](../bdd/SPEC-001-BrickModelCatalog-BDD.md)
**TDD**：[SPEC-001-BrickModelCatalog-TDD](../tdd/SPEC-001-BrickModelCatalog-TDD.md)
**稽核日期**：2026-09-09
**狀態**：Ready for well-done；Q-001～003及補強SDD已確認，10項缺漏已補回SPEC／BDD／TDD，實作未開始。
**本輪邊界**：僅此文件包。未建立下一份 SPEC 或遊戲程式。

## 決策與回寫進度（本輪更新）

使用者「全數同意 請繼續」接受Q-001～003，後續「確認」補強SDD，無尚待回答的規劃問題。以下原風險描述保留稽核前定位；現行契約以SPEC第13節與本表回寫為準。

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

36/36 AC、56/56 BDD均有追溯；20個@frontend場景。233項＝168UT＋29IT＋14CT＋22ET，全部0%未執行；在179基線上追加30UT及24個已同意集成／契約／E2E案例。來源全量、實際畫面與效能尚未驗證，不把文件完整當產品完成。

## 一、原基線需求追溯摘要

- SPEC 驗收條款追溯：26/26（100%）有 BDD 與 TDD 對應。
- BDD 場景追溯：46/46（100%）有測試，其中13個 @frontend 場景。
- TDD 基線：138單元＋18集成＋9程式內API＋14E2E＝179項，全部0%未開始。
- MVP 19項均有責任歸屬；本份僅承擔模型及共用基礎部分，不能稱 MVP 的19項全部已測。
- 發現10項需補強的定義／邊界（高6、中4），提出24個追加測試名稱。現已完成SPEC／BDD／TDD回寫；本節26/46/179為稽核前基線，最新36/56/233見上表。
- 沒有僅因缺少 Scenario ID 的孤立項目；但「已有 ID 對照」不能解決不明確的發布路徑、判定基準與故障行為。
- 正式來源全量、生產狀態、模型品質、套件相容與實機畫面均尚未驗證，不能把本次文件追溯100%理解為產品完成100%。

### MVP → SPEC → BDD → TDD 責任矩陣

| MVP需求 | 本份責任／SPEC | BDD／TDD證據鏈 | 其他責任與未完成狀態 |
|---|---|---|---|
| REQ-001 全量實際建模 | §3、4、8；AC-001～009、017 | SC-001～010、013、027、029；IT-001～004、ET-008、009 | 全量來源與模型未取得，不能只交樣本結案 |
| REQ-002 新貨號 | §4.2、5、6.5；AC-010、011 | SC-011、012、014、030；IT-006、007、014、ET-010 | 歷史引用與RuntimeBuild仍待實作 |
| REQ-003 人物選擇 | §4.3–4.4；AC-012 | SC-009；UT-025～027、IT-005 | 人物建立UI留SPEC-001-CharacterManagement |
| REQ-004 半價購買 | 本份只提供變體識別 | SC-003可作資產依賴，不算購買驗收 | SPEC-001-PurchaseEntitlements與CharacterManagement |
| REQ-005 2026片桶 | AC-008、014，僅候選與相容性 | SC-008、009、031；IT-004、005 | 發桶／隨機／必備建材配方留SPEC-001-PlayerInventory |
| REQ-006 特殊款限制 | §4.4、6.1；AC-013 | SC-031；UT-091～093、IT-005、CT-002 | 實際限定發放留相關交易／遊戲SPEC |
| REQ-007 額外人物資格 | 無資格消耗或交易實作 | 不新增本份發放測試 | PlayerInventory／PurchaseEntitlements／CharacterManagement |
| REQ-008 多人物選擇 | 無選人流程實作 | 不新增本份選人測試 | SPEC-001-CharacterManagement與入口整合 |
| REQ-009 人物成就 | 無成就資料表實作 | 不新增本份成就測試 | SPEC-001-CharacterManagement／後續遊戲 |
| REQ-010 建屋前限制 | AC-014僅提供建材資料 | SC-009；IT-005 | 入口與提桶留SPEC-001-CollectionHouseAndGameAccess |
| REQ-011 建屋與餘料 | AC-008、014僅接點／碰撞 | SC-008、009；IT-004、005 | PlayerInventory與CollectionHouseAndGameAccess |
| REQ-012 修改收藏屋 | 固定來源引用與可再組裝metadata | SC-008、012；IT-004、007 | 編輯與數量守恆留CollectionHouseAndGameAccess |
| REQ-013 玩家共用道具 | 模型查詢不得授予權益 | SC-015、031；CT-002、006 | 玩家所有權／庫存留SPEC-001-PlayerInventory |
| REQ-014 編輯人物存放櫃 | 款式資料與零授權副作用 | SC-009、031；IT-005 | CharacterManagement與CollectionHouseAndGameAccess |
| REQ-015 遊戲入口 | 本份僅模型預覽入口 | SC-033、ET-001不代表正式遊戲入口 | SPEC-001-CollectionHouseAndGameAccess |
| REQ-016 離線安裝 | §6.4、7；AC-021、025 | SC-019、026、033、042；ET-001、005 | 全遊戲離線需最後入口SPEC整合 |
| REQ-017 本機資料更新 | §5.3、6.5；AC-022、023 | SC-016～018、023、025；IT-009～011、ET-006、007 | 本份fixture驗證；各模組另定真實表與遷移 |
| REQ-018 畫面效能 | §7、8.2；AC-020、025 | SC-036、043～045；ET-003、011～013 | 正式建屋負載與賽車留後續SPEC |
| REQ-019 共用模組 | §5–6；AC-011、024、026 | SC-012、014、015、032、046；IT-007、008、015、018 | MVP-002只沿用資產契約，不開發正式車輛功能 |

MVP-002 的三張賽道、24顆輪子、3格展示與非隨機性能不列入本份完成分母。完整逐SC→測試ID對照保存在TDD矩陣，每個SC有3個獨立UT加相應IT／CT／ET，不在此重複整份清單。

## 二、技術風險深度評估

### 已檢查面向

| 面向 | 查核結果 | 處理 |
|---|---|---|
| DDD與層級依賴 | Domain禁止Unity／IO，製作工具與Player分離；聚合、值物件、Repository名稱已列 | 實作時以asmdef／依賴檢查驗證，不能只有文件分層 |
| Schema與DTO | 開發DB列FK／unique，玩家projection缺整組版本引用約束 | GAP-005 |
| 非同步與並發 | lease／取消／CAS已有基線；安裝互斥與disposed／預先取消不足 | GAP-003、006 |
| 持久化與回復 | 已定備份與交易；新版本寫入後降版的資料取捨未定 | GAP-004 |
| 外部來源與原生套件 | 開發端可stub，正式全量不可stub；沒有Unity專案或已鎖套件 | 保留原型先行，GAP-001、002；不宣稱相容已解決 |
| 空值／數字／字串 | 數值容差與Limit已有基線，null／字串上限／literal search不足 | GAP-006、010 |
| 路徑／權限／安全 | 已有../與唯讀目錄，未處理實際檔案目標與驗證快取失效 | GAP-007 |
| 模型品質／UI／錯誤 | 操作與錯誤場景完整；主觀外觀、缺字及圖形裝置啟動失敗通知仍需定義 | GAP-008 |
| 效能／跨模組物理 | 量測門檻存在，但本機不同於基準硬體，輪組矩陣待定 | GAP-009、010 |
| 測試分層 | 各公開方法已列CT，來源／SQLite／Player有真實測試鏈 | 單元模擬結果不能取代IT／ET；全量缺件仍阻斷 |
| 授權與發行 | 每資產需來源／使用條件及attribution，來源未取得 | 沿SPEC RISK-005，不替使用者承諾資產可自由散布 |
| 配置與執行依賴 | Player禁止來源金鑰、遠端catalog與維護CLI | SC-024／IT-012已有基線；實際包仍需驗證 |

### 🔴 高風險：原缺口與已確認處理方式

| ID | 文件／場景／測試定位 | 實際影響 | 建議 |
|---|---|---|---|
| GAP-001 | SPEC §3.4／§7／§11；SC-005、027、033；ET-001、009 | 正式包只允許全量 Published，但先看原生畫面的技術里程碑沒有獨立交付契約。 | 新增 Preview-only 包：僅納入逐件品質通過且使用條件已核對的代表資產；來源狀態與全量缺口明列，獨立存放、不授權玩家權益、不冒充正式全量；正式 Release 全量門檻不變。（Q-001，方案及SDD已確認，回寫見本輪進度表） |
| GAP-002 | SPEC §4.2／§6.3／§8.1；SC-004、006、014；IT-002、003、007 | 順序圖先 Unity 驗證再來源發布，但 BuildCatalogContent 僅讀 Published，可能形成互相等待。 | 拆成 Frozen 候選的 staging 驗證建置與 Published 的發行封裝；發布引用已驗證且 hash 相符的候選結果，Player 正式包仍只接受 Published。（Q-001，方案及SDD已確認，回寫見本輪進度表） |
| GAP-003 | SPEC §5.3／§6.5；SC-016、017、023；IT-009、010；ET-006、007 | 尚未定義應用程式身分固定與更新互斥；改 Company/Product 名稱可能像新存檔，更新檢查後又開遊戲可能鎖檔。 | 固定 CompanyName／ProductName／application identifier 與資料根；升級器和 Player 共享生命週期鎖，安裝預檢到切換期間不允許新實例；無權限明確失敗，不啟動第二個不同資料庫。（Q-003，方案及SDD已確認，回寫見本輪進度表） |
| GAP-004 | SPEC §6.5；SC-018、025；IT-011；ET-007 | 新版本成功遷移且繼續遊玩後再降版，還原舊程式不等於舊程式能讀新存檔；盲目回復可能丟進度。 | 區分安裝失敗前的回復與成功遷移後的降版：不相容時禁止舊版寫入新存檔；保留新存檔與升級前完整備份，只有玩家明確選擇還原才回到舊進度；本份只做 fixture／相容介面。（Q-003，方案及SDD已確認，回寫見本輪進度表） |
| GAP-005 | SPEC §5.3／§6.1–6.2；SC-012、015、025；IT-007、008；CT-003、006、007 | runtime_models 未完整列出主鍵／FK／唯一性，若 snapshot、variant、revision 各自存在但彼此不屬於對方，可能載入錯件。 | 定義整組引用及當前 buildTarget 的唯一映射、變體與 revision 歸屬驗證、catalog／release manifest 的 pack與snapshot一致性；開啟前做 referential checks，任何混搭拒絕，不靠 caller 自律。（Q-003，方案及SDD已確認，回寫見本輪進度表） |
| GAP-007 | SPEC §5.4／§6.4／§8.3；SC-019、024；IT-012；ET-005 | 已測路徑字串越界與首次hash，但未涵蓋 Windows junction/reparse point、同大小檔案被換掉後沿用舊驗證快取。 | 解析後仍檢查實際目標不越出包與暫存根；快取綁 pack／預期digest與檔案身分，檔案改動失效；損毀安全拒絕。hash僅作內容完整性，不宣稱可抵抗同時替換manifest的惡意包。（Q-003，方案及SDD已確認，回寫見本輪進度表） |

### 🟡 中風險：須納入開發與驗收設計

| ID | 文件／場景／測試定位 | 實際影響 | 建議 |
|---|---|---|---|
| GAP-006 | SPEC §6.1–6.2；SC-020、028、032；CT-001～009 | 有正常、非法enum與頁數測試，但 null／disposed session、超長字串、預先取消及SQLite特殊字元尚未明列。 | 補契約輸入上限提案：QueryText≤256 Unicode scalar、Cursor≤4096 ASCII字元，空文字表示不篩選；null DTO／已Dispose／非本pack session 回 InvalidQuery，預先取消回 Cancelled 且不配置資源。以參數化SQL驗證中文、引號、%與_的字面搜尋。（Q-003，方案及SDD已確認，回寫見本輪進度表） |
| GAP-008 | SPEC §7／§8.1；SC-035、036、042；IT-016、017；ET-003、005 | 玩具質感仍偏主觀，尚無核准的固定畫面基準；繁體中文缺字與無圖形裝置時 Unity 自己尚未啟動的通知路徑也未定義。 | 原型先提交固定光照／鏡頭的塑膠、橡膠、透明、印刷、非對稱與人物代表畫面，由使用者核准後凍結基準；比對判定由可見缺陷與來源核對先行，不跨GPU強求逐像素相同。隨包提供可再散布繁中文字型與fallback；無圖形裝置由原生啟動器／系統通知交代，不假設uGUI可啟動。（Q-002，方案及SDD已確認，回寫見本輪進度表） |
| GAP-009 | SPEC §8.2；SC-043～045；IT-018；ET-011～013 | 本機是 i5-13500H／Iris Xe／23.6 GiB可見記憶體，非原規格 GTX1660／i5-10400；還沒有可重現的Medium設定檔與首幀取樣界線。 | 本機先做操作與探索量測，正式60FPS保留原基準（或另行核准的新基準）。凍結解析度、render scale、AA、陰影、透明比例與鏡頭軌跡，首幀須材質完成；報告分冷啟動、首次載入與熱快取，不擅自關品質冒充達標。（Q-002，方案及SDD已確認，回寫見本輪進度表） |
| GAP-010 | SPEC §2.4／§4.3／§8.2；SC-029、046；IT-004、018；ET-014 | 輪組原型只要求留下結果，缺少可判斷的幾何配對矩陣；可選massKg的Unknown與null語意、輪徑/輪寬單位未完整細化。 | 輪尺寸沿canonical公尺、局部軸向需有限且正規化，Unknown質量為null且有reason；固定合法與非法輪胎/輪圈/車軸fixture，記錄坡度／路肩高／速度／scale。判定以幾何對齊與相容拒絕為本份門檻，不擴大為操控平衡或任何車都可駕駛。（Q-003，方案及SDD已確認，回寫見本輪進度表） |

### 🟢 已有基線控制的風險（不等於已完成實測）

| 原SPEC風險 | 已有控制與證據鏈 | 目前狀態 |
|---|---|---|
| RISK-001／002 來源與補模 | SC-001～006、013、027；ET-009不可用fixture冒充 | 尚未消除；Q-001只決定先看預覽，不能讓全球來源缺口自動消失 |
| RISK-003／004 接點與外觀識別 | SC-003、007～009、029、036；IT-004、005、017 | 已有基線；GAP-008、010已補回文件，實際輪組與外觀核准尚未執行 |
| RISK-005 來源使用條件 | SC-010、013；IT-003；每資產attribution | 未取得資產使用證據者不得加入可散布包，Preview亦同 |
| RISK-006 全量大小 | SC-029、043～045與§8.2預算 | 無完整包大小；不能承諾下載量或刪舊引用縮包 |
| RISK-007 SDD未確認 | 使用者在畫面驗收說明後回覆「好 繼續」 | 原SDD與補強版均已確認；本次風險方案亦全數同意 |
| RISK-008 套件相容 | SC-006、014、026、033；IT-009／ET-001 | 實作原型待做；未鎖版、未跑Player |
| RISK-009／010／011 尺度、更新、效能 | SC-007、017～018、023、025、043～046 | GAP-003～010已補回SPEC／BDD／TDD；仍需實際測試證據 |

本輪沒有把任何未實測的風險標為「已消除」，也沒有因風險屬中等便自動記為「使用者接受」。

## 三、TDD 缺漏測試清單（已全數追加）

以下保留原24個建議名稱，已全數追加至TDD各層；各案例具體前置／動作／預期以TDD為準，編碼定位見本輪回寫表。另追加30個單元案例，合計233項，不重編原179項。

| GAP | 優先級／層級 | 建議新增測試 | 理由與前置／動作／預期 |
|---|---|---|---|
| GAP-001 | 高／UT/IT/E2E | `BuildPreview_IncompleteCatalog_LabelsNonRelease`<br>`OpenRelease_PreviewPack_RejectsPackage`<br>`AcceptPreview_VisibleAssets_DoesNotCompleteFullCatalog` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。正式包只允許全量 Published，但先看原生畫面的技術里程碑沒有獨立交付契約。 |
| GAP-002 | 高／IT/契約 | `BuildValidation_FrozenSnapshot_ProducesStagingOnly`<br>`PromoteBuild_ChangedSourceDigest_RejectsPromotion` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。順序圖先 Unity 驗證再來源發布，但 BuildCatalogContent 僅讀 Published，可能形成互相等待。 |
| GAP-003 | 高／IT/E2E | `Update_GameRestartsDuringStaging_DefersSwitch`<br>`Upgrade_StableProductIdentity_UsesExistingProfile` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。尚未定義應用程式身分固定與更新互斥；改 Company/Product 名稱可能像新存檔，更新檢查後又開遊戲可能鎖檔。 |
| GAP-004 | 高／UT/IT/E2E | `Downgrade_NewSaveSchema_BlocksWrites`<br>`Backup_IncompleteCopy_DoesNotReplaceLastGood`<br>`RestoreBackup_WithoutExplicitChoice_PreservesNewProgress` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。新版本成功遷移且繼續遊玩後再降版，還原舊程式不等於舊程式能讀新存檔；盲目回復可能丟進度。 |
| GAP-005 | 高／UT/IT/契約 | `Resolve_MixedReferenceTuple_RejectsModel`<br>`OpenAsync_ManifestCatalogMismatch_RejectsPack` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。runtime_models 未完整列出主鍵／FK／唯一性，若 snapshot、variant、revision 各自存在但彼此不屬於對方，可能載入錯件。 |
| GAP-006 | 中／UT/IT/契約 | `QueryAsync_NullOrDisposedSession_ReturnsInvalidQuery`<br>`QueryAsync_OversizedOrLiteralWildcard_ValidatesAndBinds`<br>`AcquireAsync_PreCancelled_AllocatesNoHandle` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。有正常、非法enum與頁數測試，但 null／disposed session、超長字串、預先取消及SQLite特殊字元尚未明列。 |
| GAP-007 | 高／IT/E2E | `LoadAsset_ReparsePointEscape_RejectsAccess`<br>`LoadAsset_ReplacedSameSizeBundle_InvalidatesValidation` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。已測路徑字串越界與首次hash，但未涵蓋 Windows junction/reparse point、同大小檔案被換掉後沿用舊驗證快取。 |
| GAP-008 | 中／IT/E2E | `Preview_MissingChineseGlyph_FailsVisualCheck`<br>`Startup_NoGraphicsDevice_ProvidesNativeNotice`<br>`Render_GoldenReferenceMismatch_RequiresReview` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。玩具質感仍偏主觀，尚無核准的固定畫面基準；繁體中文缺字與無圖形裝置時 Unity 自己尚未啟動的通知路徑也未定義。 |
| GAP-009 | 中／UT/E2E | `Benchmark_DifferentHardware_DoesNotClaimBaselinePass`<br>`Benchmark_ChangedPreset_InvalidatesComparison` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。本機是 i5-13500H／Iris Xe／23.6 GiB可見記憶體，非原規格 GTX1660／i5-10400；還沒有可重現的Medium設定檔與首幀取樣界線。 |
| GAP-010 | 中／UT/IT | `ValidateWheel_UnknownMass_DoesNotInventValue`<br>`MatchWheel_IncompatibleAxle_RejectsAssembly` | 依上表定位的場景，準備該缺口的正反例並執行所建議操作；核對具體拒絕／保留／展示結果。輪組原型只要求留下結果，缺少可判斷的幾何配對矩陣；可選massKg的Unknown與null語意、輪徑/輪寬單位未完整細化。 |

所有補強已完成SDD確認並回寫BDD與具體測試。原建議列的層級僅是稽核時提案；最終11IT／5CT／8ET及每場景3UT以TDD為準，實際畫面核准留開發階段執行。

## 四、已同意的建議與討論事項（保留決策脈絡）

### Q-001：先交付能操作的技術預覽，但不把它當成全量完成

**你會看到的差異**：開發先交付一個可安裝、可離線旋轉／縮放／換件的真實Unity預覽包，明確標示「技術預覽・非完整模型庫」。它只含當時已驗證且可用的代表資產，不提供正式玩家道具或進度。

**若不處理**：現有規格只允許全部零件都確認未停產且完成建模後才發布正式包；由於全量來源尚未建立，可能很久都無法交付可安裝畫面，連套件驗證也存在發布前後的互相等待。

**建議做法**：採用獨立Preview里程碑與驗證建置路徑；Preview的資料根／包類型與正式Release分開，不能直接轉成正式存檔。正式「全量未停產」門檻保持原樣，缺來源時繼續列為未完成；不改成只做少量模型的最終產品。若要以官方販售清單代理生產狀態，須另行明確變更需求，本題不代為採用。

**原確認問題（已回答：全數同意）**：是否接受先驗收明確標示的技術預覽，再持續完成原本全量交付的安排？

**技術對照**：GAP-001、002；SPEC §3.4／4.2／6.3／7／11；SC-005、006、027、033；ET-001、008、009。接受只代表處理方向，Preview仍須真實資產與Player驗收，不是概念圖或占位方塊。

### Q-002：先核准實際畫面風格，且區分本機試跑與正式效能

**你會看到的差異**：第一批代表模型先提供真實安裝版畫面，讓你核對塑膠、透明、印刷、細節與可讀性，再據此批次製作；每次畫面／FPS報告標明硬體與設定。

**現況證據**：2026-09-09以唯讀Windows硬體查詢取得 i5-13500H、Intel Iris Xe Graphics、約23.6 GiB可見實體記憶體；另有SuperDisplay Virtual Adapter。這不是SPEC指定GTX1660／i5-10400基準機。僅硬體列舉，不是效能實測，也不能據此判斷能否達60FPS。

**若不處理**：所有資產做好後才發現風格不符會大幅返工；拿不同電腦或偷偷降低陰影／render scale的數字比較，無法驗收既定目標。

**建議做法**：本機先驗收操作、畫面與探索量測；正式1080p Medium／60FPS保留原基準，取得對應測試機或明確核准替代基準後再驗收。不要求現在購買設備，也不把本機試跑當成正式效能通過。先取得你對代表畫面的核准，再凍結燈光／鏡頭／品質基準；繁體中文字型與啟動失敗提示納入畫面驗收。

**原確認問題（已回答：全數同意）**：是否接受先核准代表畫面、以目前電腦做操作驗證，並將指定基準機的正式效能驗收分開記錄？

**技術對照**：GAP-008、009；SC-035、036、042～045；IT-016～018；ET-003、005、011～013。若你希望這台Iris Xe就是正式目標，請明確指定，再修訂效能基線；本輪不預設更換目標。

### Q-003：異常時保留創作資料並阻止錯誤載入

**你會看到的差異**：更新時會要求關閉遊戲；不能讀取新版存檔、錯誤模型或損毀包時，顯示明確原因並保留原資料。降版若需要回到升級前進度，不會擅自幫你還原，須由你明確選擇。搜尋及載入會拒絕異常輸入，輪組不相容也會明確判定。

**若不處理**：更新與遊戲同時執行可能造成版本混用；看似正常的錯誤版本引用可能把積木換成另一種形狀；自動降版回復可能抹掉升級後的創作。

**建議做法**：採用GAP-003～007與010的資料／版本／輸入保護及測試。固定資料根、更新互斥、保留新舊資料、完整模型引用驗證；損毀不自動重設。不把本階段的人工存檔fixture擴張成完整人物／購買／收藏屋資料表，也不把輪組原型擴大為完整賽車。

**原確認問題（已回答：全數同意）**：是否接受以上「明確阻止不相容操作、優先保留原資料、不自動回退創作進度」的保護方案與補強測試？

**技術對照**：GAP-003、004、005、006、007、010；SC-012、016～020、023～026、028、032、046及對應IT／CT／ET。拒絕錯誤輸入不代表新增線上反作弊或DRM。

## 五、證據與限制

- 初次稽核工作區無未提交變更；本次決策回寫保留前輪尚未提交的五份規劃文件，不重置工作樹；無同名已完成歸檔包；只有MVP與已確認SPEC，沒有Unity遊戲專案。未安裝軟體、未修改來源資產或個人存檔。
- Unity Windows的持久資料路徑通常含CompanyName／ProductName，所以本報告推導出固定應用身分的測試必要性；這不是已觀察到存檔遺失。[Unity persistentDataPath](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Application-persistentDataPath.html)
- SQLite備份API提供一致資料副本，但它不替遊戲決定「新進度降版時要不要被覆蓋」。GAP-004是本專案的產品／恢復策略缺口。[SQLite Backup API](https://www.sqlite.org/backup.html)
- WheelCollider使用射線接觸，路肩與高度落差可能出現跳動；因此本報告要求固定輪組／路面測試矩陣，不聲稱已測得本遊戲操控結果。[Unity WheelCollider](https://docs.unity3d.com/6000.3/Documentation/Manual/wheel-colliders-introduction.html)
- 沒有新取得全球未停產清單、完整模型包或來源再散布證據；不能靠本次稽核判定來源問題已解決。正式金流、商標使用、F1賽道授權不在本份已驗收範圍。
- BDD／TDD依模板保留正常、替代、錯誤、邊界、UX、效能與各測試層；因單機需求，HTTP測試改成程式內契約，沒有新增網頁架構。
- 文件檢查核對每個SC的Given／When／Then、36個AC映射、233個測試唯一編碼與逐場景對照、內部連結及Markdown空白。檢查結果不是應用測試結果。

## 六、回寫與交接條件

目前：**Ready for well-done**。使用者確認鏈、10項缺漏回寫、新舊追溯核對均已完成；[TDD末尾](../tdd/SPEC-001-BrickModelCatalog-TDD.md)已持久化完整文件包、風險決策、逐項回寫與開發注意事項。

規劃阻斷項：無。全量來源、套件鎖版、原型畫面核准與正式硬體驗證仍是開發交付門檻，未實測者不宣稱已消除；這些門檻不阻止依已確認安排先建隔離Preview。下一步由well-done接手，本輪停止且不產生程式碼或下一份SPEC。

**生成者**：AI
**最後更新**：2026-09-09
