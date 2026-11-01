# SPEC-001-AvatarAndPreferences — 實作前風險與缺漏稽核

> **日期**：2026-11-01
> **來源**：[MVP](../requirements/MVP-001-LoveGameDatingApp.md) → [已確認 SDD](SPEC-001-AvatarAndPreferences.md) → [BDD 68 場景](../bdd/SPEC-001-AvatarAndPreferences-BDD.md) → [TDD 257 項（原243＋14補強）](../tdd/SPEC-001-AvatarAndPreferences-TDD.md)
> **本份範圍**：AvatarAndPreferences（禁止擴及 PlatformFoundation 既有 schema 或其他未授權 SPEC）
> **Gate 狀態**：**2026-11-01 使用者已確認 RQ-01=A、RQ-02=A，RiskAudit 所列12項風險均已接受或補回文件；14項缺漏已補回 TDD，Phase 5 Ready for well-done**。這是規劃交接，不是測試成功或已排除實作風險。

## 一、需求追溯摘要

| 對照 | 查核結果 | 意義 |
|---|---|---|
| MVP 範圍 | US-001～003 的13條 AC + US-020 的2條資料契約，共15條 | **15/15 有已確認 SDD 對應**；不是整份 MVP 的68條都由本 SPEC 處理 |
| SPEC `AP-AC` | 24 條 | **24/24 均有 BDD 場景引用** |
| BDD | 68 個唯一 Scenario（19 happy、8 alternative、19 error、10 boundary、12 frontend） | **68/68 均有TDD測試ID映射**，每 Scenario 至少3項 |
| TDD | 113 Unit + 65 Integration + 41 API + 38 E2E，共**257項**（243原項＋14稽核補強） | **0/257 已實測**；不是功能完成率 |
| API | SDD §7 的13組端點 | **13/13 有成功／拒絕／傳輸3類 API 測試** |
| DB | user_profiles 15欄 + user_media_assets 9欄 | 本份不建第三張表／Job／名片快照，也不使用 SQL Trigger |

### MVP → SPEC → BDD → TDD 回鏈

| MVP 驗收 | SDD 來源 | BDD 代表場景（完整場景→TDD逐一對應見TDD矩陣） | 檢核 |
|---|---|---|---|
| `AC-001-01` | `AP-AC-001`、`AP-AC-002`、`AP-AC-003`、`AP-AC-004`、`AP-AC-022` | `AP-BDD-002`、`AP-BDD-005`、`AP-BDD-015`、`AP-BDD-016`、`AP-BDD-063` | 已追溯 |
| `AC-001-02` | `AP-AC-005`、`AP-AC-006` | `AP-BDD-006`、`AP-BDD-007`、`AP-BDD-041` | 已追溯 |
| `AC-001-03` | `AP-AC-004`、`AP-AC-017` | `AP-BDD-005`、`AP-BDD-058` | 已追溯 |
| `AC-001-04` | `AP-AC-002`、`AP-AC-003`、`AP-AC-018` | `AP-BDD-015`、`AP-BDD-016`、`AP-BDD-035`、`AP-BDD-061` | 已追溯 |
| `AC-001-05` | `AP-AC-001`、`AP-AC-019`、`AP-AC-020` | `AP-BDD-001`、`AP-BDD-002`、`AP-BDD-018`、`AP-BDD-052`、`AP-BDD-057` | 已追溯 |
| `AC-001-06` | `AP-AC-002`、`AP-AC-022`、`AP-AC-024` | `AP-BDD-015`、`AP-BDD-019`、`AP-BDD-035`、`AP-BDD-063` | 已追溯 |
| `AC-002-01` | `AP-AC-007`、`AP-AC-008`、`AP-AC-010` | `AP-BDD-012`、`AP-BDD-032`、`AP-BDD-033` | 已追溯 |
| `AC-002-02` | `AP-AC-007`、`AP-AC-008`、`AP-AC-009`、`AP-AC-010` | `AP-BDD-012`、`AP-BDD-029`、`AP-BDD-032` | 已追溯 |
| `AC-002-03` | `AP-AC-016`、`AP-AC-023` | `AP-BDD-013`、`AP-BDD-043`、`AP-BDD-044`、`AP-BDD-055` | 已追溯 |
| `AC-003-01` | `AP-AC-011` | `AP-BDD-009`、`AP-BDD-051` | 已追溯 |
| `AC-003-02` | `AP-AC-012` | `AP-BDD-007`、`AP-BDD-010`、`AP-BDD-065` | 已追溯 |
| `AC-003-03` | `AP-AC-013`、`AP-AC-014` | `AP-BDD-007`、`AP-BDD-011`、`AP-BDD-051`、`AP-BDD-065` | 已追溯 |
| `AC-003-04` | `AP-AC-012`、`AP-AC-021` | `AP-BDD-008`、`AP-BDD-024`、`AP-BDD-050`、`AP-BDD-065` | 已追溯 |
| `AC-020-02` | `AP-AC-015`、`AP-AC-016` | `AP-BDD-010`、`AP-BDD-013`、`AP-BDD-026`、`AP-BDD-066` | 已追溯 |
| `AC-020-07` | `AP-AC-015`、`AP-AC-023` | `AP-BDD-004`、`AP-BDD-026`、`AP-BDD-044`、`AP-BDD-055` | 已追溯 |

**注意**：上表是**追溯完整性**，不是實作證據；完整名片交換（25分門檻、邀請、雙方同意、終止）由後續 `SPEC-001-AffectionAndFeedback` 等負責，本份只能先驗內部讀取契約和拒絕越權。

## 二、技術與業務風險（依嚴重度）

| ID | 等級 | 風險與實際影響 | 來源 | 緩解／下一步 | 決策狀態 |
|---|---|---|---|---|---|
| `RA-01` | **高** | 真人 AI 四圖同步生成能否在平台時限內完成 | SPEC §8.4、§9.1；AP-BDD-015/034/035/036；TDD AP-IT-015、AP-IT-034 | Gemini 官方明示不保證精確出圖數量；同次請求可能需多次模型呼叫且產生成本。後端必須四張全部有效且不同才算成功；真 Gemini＋本地 Worker／.NET 全鏈測耗時與實際費率，超時明確失敗並保留原化身，不自建 Job。 | **使用者接受**：D-046 單次請求無 Job 的取捨不變；已補 AP-IT-061（RG-07）。真 Gemini 4圖／時限與成本須在 well-done 實測，未達4張不可放行 |
| `RA-02` | **高** | 8MiB 上傳與現有 8KiB 私人 R2/16KiB JSON 限制不相容 | SPEC §3、§7、§9.2；現行 cloudflare/src/platform.ts、frontend/client/src/api.ts | 既有 object.private.put 對檔案限8192 bytes，前端預設非GET使用 application/json；直接共用會造成照片上傳失敗或繞過原 CSRF 規則。需新增嚴格驗證的串流專用 API／worker handler，保留原認證 API JSON 限制與可信 Origin。 | **已補回文件**：新增 AP-API-040（RG-01）驗證受控媒體串流、Web/原生授權與 8 MiB 限制；不擴充原 Foundation 8 KiB 入口 |
| `RA-03` | **高** | 取消 Trigger 後，D1 照片名額與媒體不變式的競態 | SPEC §8.2、§8.5；BDD-047/048/049；TDD AP-IT-047/048/049 | 單一 prepared 條件式 INSERT 要以真 D1 驗並發第5/6張、0列、取消／刪除競態；媒體 owner/kind/key 更新必不可由任何受控命令通過，ready→pending／deleted→ready 必須拒絕。更要實測 D1 對 RETURNING 與 changes/result 的回應，避免誤當插入成功。 | **已補回文件**：新增 AP-IT-057～059（RG-02～04），驗真 D1 同時上傳、RETURNING 0列與受控 UPDATE，不使用 SQL Trigger |
| `RA-04` | **高** | 名片授權過期、終止競態和跨輪讀取 | SPEC §4.4、§6；BDD-013/043/044/055；TDD AP-IT-013/043/044/055 | 只靠前端隱藏名片或僅傳 boolean authorizedContext 不安全。受信任 AffectionAndFeedback 需在每次投影及開照片串流時，核對本輪雙方同意、有效參與及未終止；猜 ID、他輪及已終止皆拒絕。當前 SPEC 僅保護內部資料契約，完整 E2E 要等後續 SPEC。 | **已補回文件**：AP-IT-060（RG-05），每次名片照片開啟前重驗同輪有效雙方同意／終止；完整跨 SPEC E2E 後續整合驗 |
| `RA-05` | **高** | 真人照傳送 Gemini 的用途告知與按開始授權（已確認方案 A） | SPEC §4.1、§9.1；BDD-001/015/061；TDD AP-UT-001、AP-E2E-015 | 個人照原本也是交換名片用途；如果未醒目告知第三方 AI 會收到照片，使用者可能在不知情下將真人照傳出去。須在首次實際傳送前清楚顯示第三方用途並有本人主動操作，不預設背景傳送。 | **已補回文件**：使用者明確選 **RQ-01=A／D-048**；產圖頁內嵌用途提醒，按開始才送照；AP-E2E-037（RG-06）覆蓋，沒有額外跳窗 |
| `RA-06` | **中** | 免費與 AI 化身角色構圖一致性（已確認3:4半身方案 A） | SPEC §4.2、§5.1；BDD-005/015/063；TDD AP-IT-015、AP-E2E-021 | 免費16款與 AI4款若構圖不同，遊戲人物欄位會裁掉臉、看不出相似度，還可能需要重新產圖。建議一致直向3:4的半身／胸腰人物立繪、臉部清楚；背景單純且不預設透明一定可行。 | **已補回文件**：使用者明確選 **RQ-02=A／D-049**；3:4半身至腰部、五官清楚、背景簡潔；AP-IT-062、AP-E2E-038（RG-08、RG-12） |
| `RA-07` | **中** | 200KB來源照未必足夠保留 AI 人臉相似度 | SPEC §4.1、§9.2；AP-BDD-002/052/063；TDD AP-IT-002、AP-IT-052 | 壓縮服務須在200000 bytes內保留五官、方向、長寬比、色彩、EXIF移除；以使用者授權真人照做人工相似度驗收。AI正式結果不是個人真人照，不得誤套來源照200KB限制而破壞角色品質。 | **使用者接受**：200,000 bytes 來源照限制維持；AP-IT-062（RG-08）要求真人品質驗證，未達人臉可辨識不得假稱合格 |
| `RA-08` | **中** | 固定 JSON 投影與範例欄位尚缺對齊測試 | SPEC §7、§8.3；AP-BDD-007/041/051；TDD AP-UT-013、AP-IT-041、AP-API-010 | SPEC preferences_json 固定9鍵、interests_json含topicTagIds；§7 PUT 示範沒有 topicTagIds，應驗 DTO 的完整／部分資料映射、未知／重複鍵、合法歷史停用標籤、跨版本回讀及禁止敏感資料直列輸出。 | **已補回文件**：SDD §7 PUT 範例補 topicTagIds，AP-API-041（RG-09）驗固定 JSON 與歷史代碼 |
| `RA-09` | **中** | 四張暫存候選失敗補償與單次永久化競態 | SPEC §8.4、§8.5；BDD-016/036/040/053/054；TDD AP-IT-016/036/040/053/054 | 暫存60分鐘，R2 metadata 期限要與 clock 一致；使用者選擇時競態僅一個 CAS 成功。逾期、重試、D1失敗、R2複製中斷都需補償、GC 保底；沒有 Job 不保證斷線恢復。 | **使用者接受**：D-046 無 Job 且重試可能再耗成本；AP-IT-063、064（RG-10、11）必驗補償、60分鐘到期、CAS |
| `RA-10` | **中** | 免費16款立繪正式素材及品質驗收 | SPEC §4.2、§11；BDD-005/058；TDD AP-IT-005、AP-E2E-006 | 必須是真正16幅不同、可在商品中使用的素材，不能複製同一圖重新命名或使用原型 fixture；需驗視覺差異、授權與手機 UI 裁切、可跨兩組選取。 | **已補回文件**：AP-E2E-038（RG-12）驗16張不同正式立繪資產及來源授權，不用假圖，統一3:4構圖 |
| `RA-11` | **中** | 名片照片替換與身分狀態快取可能揭露舊內容 | SPEC §4.4、§9.3；BDD-004/026/044；TDD AP-IT-004/026/044 | 本人的 ready 刪除後必立刻無法開始新的被授權串流；Cache-Control no-store、過期代理 URL 不應繞過重新授權。曾被對方保存的影像客戶端無法遠端收回，不宣稱可撤回已交付內容。 | **已補回文件**：AP-IT-065（RG-13）驗照片刪除、舊 URL、授權終止及 no-store 後不得新增揭露 |
| `RA-12` | **低** | 年齡計算、Unicode與標籤目錄跨版本邊界 | SPEC §4.3、§8.3；AP-BDD-050/051；TDD AP-IT-050/051 | 固定臺灣時區與時鐘測試足18歲／未足18歲，含2月29日、未來日期、跨年；Unicode scalar、最大陣列／JSON長度與停用代碼須可讀且不得改義。 | **已補回文件**：AP-UT-113（RG-14）驗2/29、18歲與臺灣午夜固定時鐘 |

**外部依據與現有程式核對**：
- Google 官方 [Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation) 明示模型可能不完全遵守提示的圖片張數，提供的模型對來源圖數、圖片比例和尺寸支援各異；因此實際 modelId／生成4張、時間與費率都必須真測，不能預設固定出圖4張。
- Cloudflare 官方 [D1 Prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) 及 [D1 Database](https://developers.cloudflare.com/d1/worker-api/d1-database/) 說明使用 `bind`、`run`、`first`、`batch` 的介面；本份不可直接以一般 SQLite 的 RETURNING 期待取代本地真 D1 的受影響列數查驗。
- 已唯讀核對 `datinghigh/cloudflare/src/platform.ts`：既有 `object.private.put` 的 bytes 上限8192，對外不等於8MiB業務照片串流；`datinghigh/frontend/client/src/api.ts` 預設非GET Content-Type為 `application/json`，圖片上傳必須另設安全且隔離的路徑，不能直接擴充認證原有 JSON body 上限。

### 已確認的方案不可被本稽核覆寫

D-036～D-047 已包含：本人照0～5張、8MiB輸入／只保存≤200000 bytes壓縮版、免費16張、AI鎖頭當前免費使用、四張候選擇一、僅選中圖正式保存、同次請求／無Job、兩張新 `user_` 表共24欄、照片不存 byte_size／sha256、**不使用 Trigger**、名片只讀當前本人資料、Gemini 真驗證。這些決策**不在本次重新提問或被技術稽核改寫**。

## 三、已補入 TDD 的14項稽核測試（全部待實作）

| 缺漏 ID | 優先級 | 發現來源 | 類別 | 測試名稱 | 補強目的 | 已補回 TDD ID |
|---|---|---|---|---|---|---|
| `RG-01` | 高 | RA-02、§7 POST /me/photos | API／整合 | `UploadMediaStream_WebNativeMultipartAndBinary_EnforcesOriginAnd8MiBLimits` | Web原 Cookie + Origin 必經正確 CSRF；native Bearer；8192原測試儲存路徑不能當生產照片路徑 | `AP-API-040`（已補入，未執行） |
| `RG-02` | 高 | RA-03、BDD-047/048 | 真 D1 | `InsertPhoto_ParallelFifthSixthRequests_OnlyOneSucceeds` | 兩個獨立客戶端同時入庫，pending／ready 計數確定≤5，失敗不能留可讀 R2 | `AP-IT-057`（已補入，未執行） |
| `RG-03` | 高 | RA-03、BDD-047 | 真 D1 | `InsertPhoto_ConditionalReturningNoRow_MapsToPhotoLimit409` | 用真 D1 讀 `RETURNING`／`changes` 結果；不能將0列看作成功，無 SQL Trigger | `AP-IT-058`（已補入，未執行） |
| `RG-04` | 高 | RA-03、BDD-049 | 真 D1／Worker | `MediaCommands_IdentityFieldsAndIllegalTransitions_RejectMutation` | 列出所有 command 可用更新欄位，禁止改 owner/kind/objectKey、deleted復活、ready倒回pending；同時測命令繞行 | `AP-IT-059`（已補入，未執行） |
| `RG-05` | 高 | RA-04、BDD-055 | 內部安全整合 | `OpenAuthorizedCardPhoto_TerminateDuringRead_DeniesNewStreams` | 名片授權 context 不能 client 偽造，互動終止和照片開串流之間重新驗證 | `AP-IT-060`（已補入，未執行） |
| `RG-06` | 高 | RA-05、BDD-001/061 | UX/API | `GenerateAvatar_BeforeThirdPartyDisclosure_DoesNotTransmitSourcePhoto` | 使用者未主動觸發 AI 時，Gemini 無外送請求；UI 顯示傳送用途及明確操作 | `AP-E2E-037`（已補入，未執行） |
| `RG-07` | 中 | RA-01、AP-BDD-015/034/035/036 | 真 Gemini 整合 | `GenerateAvatar_LiveGeminiFourUniqueImagesWithinRequestDeadline` | 真 API 依所選模型驗 2～5張來源、4張輸出與 server超時；量測成本／延遲並驗欠4張必失敗 | `AP-IT-061`（已補入，未執行） |
| `RG-08` | 中 | RA-07、AP-BDD-002/052/063 | 媒體／人工 | `CompressPersonalPhoto_FaceRegionAndPortraitOrientation_AcceptsHumanQualityReview` | 200000 bytes來源照的臉部可辨識與比例；生成角色格式獨立，不對其套200KB來源照限制 | `AP-IT-062`（已補入，未執行） |
| `RG-09` | 中 | RA-08、AP-BDD-007/041/051 | DTO／API | `PutDatingProfile_TopicTagIdsAndLegacyCodes_RoundTripsExactSchema` | 九鍵偏好 JSON、三欄 interests JSON、topicTagIds、未知鍵拒絕、舊目錄代碼可回讀 | `AP-API-041`（已補入，未執行） |
| `RG-10` | 中 | RA-09、BDD-040/054 | R2／真D1 | `SelectGeneratedAvatar_AfterR2CopyBeforeD1Commit_CompensatesOrphan` | 選中只有一張轉永久；兩個 CAS 同時選、R2已複製但 D1 失敗需補償並保留舊化身 | `AP-IT-063`（已補入，未執行） |
| `RG-11` | 中 | RA-09、AP-BDD-037/053 | R2／時鐘 | `AvatarCandidate_At60MinuteExpiry_RefusesReadAndSelection` | 候選59:59可用、60:00與之後必不可讀；R2 lifecycle延遲亦不可繞過 metadata 失效 | `AP-IT-064`（已補入，未執行） |
| `RG-12` | 中 | RA-10、BDD-005/058 | 素材／Web+原生 | `BuiltinAvatarCatalog_SixteenDistinctLicensedImages_ValidatesActualAssets` | 逐16個ID辨識、來源授權、實際資產不同，三平台載入與容器裁切 | `AP-E2E-038`（已補入，未執行） |
| `RG-13` | 中 | RA-11、BDD-004/026 | 安全整合 | `DeletedPersonalPhoto_WithCachedOrGuessedUrl_DeniesFreshRead` | 刪照後即時名片新讀取不含舊 assetId；持舊URL不能再次新增讀取 | `AP-IT-065`（已補入，未執行） |
| `RG-14` | 低 | RA-12、BDD-050 | Domain | `CalculateAdultAge_LeapDayAndTaiwanMidnight_UsesFixedClock` | 固定時鐘驗2月29日、邊界當日及前一日，未成年不能 profileReady | `AP-UT-113`（已補入，未執行） |

**補強結果**：2026-11-01 經使用者確認，`RG-01`～`RG-14` 已依上表加入原 TDD 對應測試層級、分配穩定 ID 並更新全部數量及追溯；**未重生 TDD，0/257 測試已執行**。

## 四、2026-11-01 使用者決策（均已確認）

### RQ-01 — **確認 A**：AI 產圖前的第三方照片用途說明（D-048）

- **使用者決策**：AI 產圖頁每次開啟均醒目顯示「產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家」；使用者按「開始產生4張」才視為本次明確確認、才可讀取並傳送已保存照片至 Gemini。僅點擊鎖頭進頁面不會呼叫 Gemini。
- **不採方案 B**：不另加同意跳窗；不新增同意資料表、背景傳送或自動啟動生成。沒有足夠照片時只顯示引導。
- **回寫**：MVP `D-048`／`AC-001-04`；SDD §4.2、§5.1、§9.1、`AP-AC-018`；BDD `AP-BDD-015`、`AP-BDD-061`；TDD `RG-06 → AP-E2E-037`（含真實無外傳斷言）。

### RQ-02 — **確認 A**：免費與 AI 化身 3:4 半身至腰部構圖（D-049）

- **使用者決策**：免費16款與 AI 4 張候選一律使用**直式3:4半身至腰部人物立繪**，臉部五官清楚、背景簡潔，初期遊戲對話和候選比較採一致畫框。
- **不採方案 B**：不採全身立繪；若模型輸出尺寸不符，應以合理等比例裁切／留白調整，不拉伸或裁斷臉，不能以構圖一致犧牲五官相似度。
- **回寫**：MVP `D-049`／`AC-001-01`；SDD §4.2、§5.1、§9.1、`AP-AC-017`、`AP-AC-022`；BDD `AP-BDD-005`、`AP-BDD-058`、`AP-BDD-063`；TDD `RG-08 → AP-IT-062`、`RG-12 → AP-E2E-038`。

## 五、Phase 5 規劃交接結論（已完成）

- **RiskAudit 確認**：2026-11-01 使用者明確確認 RQ-01=A、RQ-02=A；12項風險各自標記為**已補回文件**或**使用者接受**，無尚待決策的規劃問題；已接受風險仍屬未來測試與驗收門檻，不得逕行視為已消除。
- **測試補強**：14項缺漏 `RG-01`～`RG-14` 已逐一加入 TDD（新增1 Unit、9 Integration、2 API、2跨平台 E2E），原243＋14＝**257**。所有項目仍未執行，BDD 68場景亦未勾選。
- **架構不變**：只新增 `user_profiles` 15欄與 `user_media_assets` 9欄，0 個 Trigger、不建立 AI Job／名片快照，照片≤200000 bytes 壓縮版、四張 AI 候選短效 R2 存放。
- **交接狀態**：**Ready for well-done**，權威交接紀錄：[SPEC-001-AvatarAndPreferences-TDD.md — 規劃交接紀錄](../tdd/SPEC-001-AvatarAndPreferences-TDD.md#規劃交接紀錄)。
- **後續實作的品質 Gate（不是未決的規劃問題）**：真 Miniflare D1 並發第5／第6張、R2受控串流與補償、真 Gemini 在時限內產出4張互異圖像及五官相似度、16張正式素材、Web／Android／iOS實測、名片權限在下游 SPEC 整合驗證。任一實測無法通過要回報並停在相應 Gate，不降低標準或擅自建 Job 表。
- 本次不修改應用程式碼，不把本份規劃交接當作 PlatformFoundation 或下游 SPEC 的完成狀態，不自行啟動下一份 SPEC。
