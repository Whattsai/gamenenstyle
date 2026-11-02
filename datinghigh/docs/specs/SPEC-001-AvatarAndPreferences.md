# SPEC-001-AvatarAndPreferences: AI／免費化身、真人照與交友資料

**功能 ID**: `SPEC-001-AvatarAndPreferences`  
**關聯需求**: [MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)  
**優先級**: 高（MVP 第 2 順位）  
**狀態**: 2026-11-02 使用者確認 D-050 逐張產圖修訂，沿用已確認之本份完整 SDD（含 D-047 不使用 SQL Trigger）；RiskAudit RQ-01=A／RQ-02=A 已確認，14項稽核補強及 TDD 交接完成；**Ready for well-done（D-050 文件重審後，尚未實作）**
**最後更新**: 2026-11-02
**前置 SPEC**: [SPEC-001-PlatformFoundation](SPEC-001-PlatformFoundation.md)  
**後續依賴者**: `SPEC-001-MatchingSessions`、`SPEC-001-StoryDialogueAndExit`、`SPEC-001-AffectionAndFeedback`  
**責任範圍**: `US-001`～`US-003` 共 **13 條 MVP 驗收**；`US-020 / AC-020-02、AC-020-07` 的即時名片資料來源契約；不在本份實作 25 分門檻、邀請／同意／實際名片揭露或付款。

> 本輪已確認的產品決策以 MVP `D-036`～`D-050` 為準，取代 2026-11-01 前一版 SDD 中「每次上傳／每次 1 張、生成後刪照片、名片排除真人照、配對快照、刻意避免高度相似、暫不能選 Gemini」的提案。本份 SDD 細部設計已於 2026-11-01 經使用者確認，仍不得聲稱已實作或已完成測試。

## 1. 功能概述與交付成果

使用者可維護最多 5 張最滿意的**真人個人照**；每張上傳時由可重用的共用圖片壓縮底層處理，僅保存 ≤200 KB 的版本。選擇遊戲化身有**免費 16 款內建插畫角色（男性風格 8 款、女性風格 8 款）**及**未來付費的 AI 生成**兩條路徑。AI 目前以鎖頭標示，但點擊即可進入真生成，不付款；直接使用已保存的多張本人照片每次成功產生**1張**、單輪最多**4張**可比較的插畫風化身，使用者可提前採用、回選任一張，確認後只保存 **1 張**作遊戲角色。生成應盡量保留真人五官與辨識特徵，而不是讓人物因過度風格化失真。Gemini 可作為真實 API 的驗證來源。

個人資料提供暱稱、自介、個性、**工作／職業**、興趣、生活習慣、價值觀、互動頻率、年齡／區域及配對偏好，供後續 MatchingSessions 使用。初期對方只見可授權的遊戲化身；於另一份 AffectionAndFeedback 完成該輪雙方同意交換名片後，才可查閱本人**當下最新個人資料及已保存的真人個人照**。名片不建立快照或複製表。

### 1.1 需求與責任追溯

| MVP 來源 | 本份預計驗收 ID | 本份交付／責任 |
|---|---|---|
| `US-001 / AC-001-01` | `AP-AC-001`～`AP-AC-004`、`AP-AC-022` | 真 AI 根據已有照片逐張最多生成4款、可隨時採用，與原型風格一致；免費內建化身不需要 AI |
| `US-001 / AC-001-02` | `AP-AC-005`、`AP-AC-006` | 化身暱稱、個性、簡介及當前角色引用 |
| `US-001 / AC-001-03` | `AP-AC-004`、`AP-AC-017` | 男性風格 8、女性風格 8，共 16 款免費角色可用 |
| `US-001 / AC-001-04` | `AP-AC-002`、`AP-AC-003`、`AP-AC-018` | AI 鎖頭點擊即用、逐張最多4張、可回選及確認採用1；未實作計費 |
| `US-001 / AC-001-05` | `AP-AC-001`、`AP-AC-019`、`AP-AC-020` | 真人照為持續維護的個人資料、用途提醒、最多 5 張、≤200 KB 共用壓縮 |
| `US-001 / AC-001-06` | `AP-AC-002`、`AP-AC-022`、`AP-AC-024` | 插畫風下保留五官與相似度、Gemini 真實測試與安全 secret |
| `US-002 / AC-002-01、AC-002-02` | `AP-AC-007`～`AP-AC-010` | 初期不露真人照或敏感聯絡資料；私有媒體存取隔離 |
| `US-002 / AC-002-03` | `AP-AC-016`、`AP-AC-023` | 僅該輪有效雙方同意後可取得當前真人照片，跨輪／終止不可新增揭露 |
| `US-003 / AC-003-01` | `AP-AC-011` | 五大興趣類型、可維護標籤 |
| `US-003 / AC-003-02` | `AP-AC-012` | 生活型態、價值觀與互動頻率 |
| `US-003 / AC-003-03` | `AP-AC-013`、`AP-AC-014` | 年齡、地區及興趣權重供配對輸入 |
| `US-003 / AC-003-04` | `AP-AC-012`、`AP-AC-021` | 工作／職業欄位、18 歲以上限制 |
| `US-020 / AC-020-02、AC-020-07` | `AP-AC-015`、`AP-AC-016`、`AP-AC-023` | 目前個人資料＋照片的**授權讀取來源**；真正交換流程由 AffectionAndFeedback 負責 |

**本次計數**：完整承接 3 個故事／13 條驗收；跨 SPEC 提供 US-020 兩條的資料契約，**不能因此把 US-020 或名片交換標為已完成**。MVP 總量目前為 20 個故事／68 條 AC；既有 PlatformFoundation 文件包與進度不受影響。

## 2. 範圍與使用者角色

- **登入本人**：建立／更新或刪除個人真人照片、預覽壓縮版本、免費選擇 16 款角色、點 AI 鎖頭送出真生成、瀏覽 4 個結果並選用 1 張、編輯基本資料與配對偏好。
- **初期候選／已配對對方**：未取得有效名片同意前僅可透過未來 MatchingSessions 授權看到安全的遊戲化身／有限公開資訊，**不能**取得真人照片或工作等名片私有欄位。
- **交換名片後的該輪雙方**：未來由 AffectionAndFeedback 依親密度 25 分入口、雙方同意及互動有效性授權，才可讀取對方**當前**名片欄位與經 200 KB 壓縮的真人照；本人修改／刪除反映於後續讀取，不建立固定版本。
- **AI 生成請求**：每次本人操作僅觸發1張真實插畫生成；本輪最多累積4張成功候選，未採用者以私人R2短效保留供前端回選。只在本人確認採用後將1張轉正式媒體並結束該輪，無 Job D1 表；伺服器須嚴格管理同輪和同帳號並發、冪等、費用及候選效期。

**不包含**：真實配對演算法、對話、親密度／25 分計分、名片邀請同意本身、付費收款／訂閱／權益資料、管理後臺、身份證件 KYC。16 款角色的男性／女性只描述畫風分類，**不以使用者申報的性別限制可選類別**。

## 3. 已確認的設計基線及現況查核

1. 正式專案為 `frontend/client` Expo SDK 58 + React Native／Web、`backend/` .NET 10 四層、Cloudflare Worker／Containers／D1／**私人** R2；本地 D1 與正式分離。承接 PlatformFoundation 的 Session family／`CurrentUser`，Web Cookie、native Bearer、固定 D1 prepared commands、UUIDv7 首欄及 `user_` 表前綴（本 SPEC 的使用者直屬資料表統一命名；既有 `auth_`／`common_` 不變）；**不導入 EF／Identity**。
2. 現有 `IPrivateObjectStore`／`foundation-test` 每筆上限 8192 bytes，僅作基礎驗證，不得用來處理照片。要建立可授權的專用串流媒體路徑及通用壓縮介面，原認證及 R2 測試介面不改。
3. `prototype.v2` 中 `AvatarScreen`、`ProfileScreen`、暖陽／月光／櫻語／森語四種設計概念、色系、標籤與可用視覺元素可參考；原型固定「夏樹」、假化身、固定配對和 40／75 門檻不可作為真使用者資料、真 AI、正式候選或本次 16 款資產的驗收證據。
4. **業務決策已確認**：Q1 Gemini 可真測／provider 可抽換；Q2 真人照為個人資料、壓縮 ≤200 KB 保存並提醒用途；Q3 同意名片增加真人照及工作欄位；Q4 名片即時讀現有欄位不存快照；Q5 限 18 歲以上不主動加入 KYC；Q6 每帳號照片上限 5 張、不要求每次生成重新上傳；Q7 插畫風但保留五官擬真；另有免費16款、AI鎖頭4款選1及本 MVP 無扣款。**D-045** 使用者直屬資料表採 `user_` 前綴；**D-046** 以兩表精簡、不建 AI Job 表、不在 D1 保存 `byte_size`／`sha256`；**D-047** 本份禁止使用 SQL Trigger，改以 Application 驗證與單一 D1 條件式寫入維持業務限制。
5. **環境證據界限**：PlatformFoundation 在本地 Web／Android 有既有驗證，但 iOS／staging／真 Email 尚有獨立缺項。AI 生成、照片 R2、16 款角色均屬本份待開發範圍，不可把前一份本地通過或原型畫面視為已驗收。本份開發驗收的 Gemini API 金鑰須待使用者以本地／server secret 方式提供，不寫進本文。

## 4. 功能與業務規則

### 4.1 持續維護的真人照片與共用壓縮

1. 個人資料頁維護 **0～5 張**本人照片。免費選用內建角色**不要求先上傳照片**；使用 AI 生成時則需至少 2 張現有可用照片，以符合「多張照片生成」意圖。每張原始上傳檔上限 8 MiB，超過或破損拒絕；一張張替換／新增／移除，不設「每次 AI 生成都重新上傳」的流程。
2. 選照片前固定顯示使用者要求的提醒原文：**「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」**。另明示原照會用於經使用者選擇的 AI 生成；將照片傳給第三方 Gemini 時另有清楚的用途告知。不得在未同意的情況下把真人照當一般公開大頭貼。
3. **只保存壓縮後的個人真人照版本**，不是 byte-for-byte 原始上傳檔。共用 `IImageCompressionService.CompressAsync(input, targetBytes, options, ct)` 可由未來其他圖片功能使用，預設 `targetBytes = 200_000`（200 KB）；先讀圖、校正方向、去除 EXIF／GPS／ICC 非必要資訊、保留長寬比、不放大，再以畫質與必要縮放組合，在 `≤200_000 bytes` 條件下選擇合理的最高視覺品質；返回正確 MIME、尺寸、壓縮後 byte 長度與壓縮結果；大小僅在處理時驗證、不寫入 DB。壓縮失敗／無法安全解碼／無法達上限時明確拒收，**不保存原始未壓縮檔作為備份**。
4. 原始上傳 bytes 只在受限暫存／處理期間存在，壓縮成功後不得另存長期全解析度副本；照片列表只引用壓縮後的私人 R2 物件。本人可以預覽、重新排序、刪除或替換，刪除後不得再在授權名片或後續 AI 新任務中讀取。
5. 圖片格式提案：JPEG／PNG／WebP，HEIC／HEIF 可由可用的 client adapter 轉成受支援格式；後端依實際內容解碼，限制解碼後最大像素數、拒絕偽造 MIME、損毀或惡意圖片。壓縮的品質優先序為「清晰五官／保留比例／不失真」，而不是無條件壓成一團模糊像素。**200 KB 約束可能使細節有所損失；需以真人樣本驗收是否足以供相似度生成。**
6. 照片是個人資料而非任務暫存。生成成功不自動清除；僅本人刪除或帳號資料處理規則要求才刪除。若照片與處理中的 AI 生成請求有競態，刪除後新請求不得引用，既有請求於發布結果前重驗來源、已刪來源的結果必須廢棄；即使 AI 回覆晚到，也不得恢復已刪私人照片。

### 4.2 免費 16 款與 AI 鎖頭逐張最多四款

1. **免費路徑**：固定資產目錄包含男性風格 `male-01`～`male-08` 共 8 款，以及女性風格 `female-01`～`female-08` 共 8 款，各有不同可辨識立繪；使用者可跨組自由選任一個，不需 AI、照片、金流或資料庫內建角色表。圖片以受版控的應用靜態資源及穩定 `builtinAvatarId` 引用，禁止把同一圖片換名稱充當 16 款。 **D-049／RQ-02=A**：免費16款及 AI最多4張候選統一直式3:4半身至腰部立繪，臉部清晰、背景簡潔，畫框可比較；必要時等比例裁切／留白，不可拉伸或裁掉臉部。
2. **AI 路徑**：入口顯示未來付費的**鎖頭圖示**與說明，**本 MVP 點擊鎖頭即打開完整真 AI 功能**，無結帳、權限購買或收費 API；真正的付費能力由 `MVP-003-PayModule` 承接，交換名片不付費。需至少 2 張本人現有照片（最多 5 張），並可選生成風格選項。 **D-048／RQ-01=A**：每次進入產圖頁醒目顯示「產圖時會將你已上傳的個人照片提供給第三方 AI 服務處理；不會自動公開給其他玩家」；只有本人按「開始產生第1張」或後續「產生下一張」才傳送現有照片，不額外跳同意視窗、不在背景自動呼叫 AI、不建同意資料表，缺少兩張 ready 照片時只引導上傳。
3. **逐張產生流程（D-050）**：本人先按「開始產生第1張」，server 以已保存的2～5張 ready 真人照產出**一張**真正符合3:4畫框的插畫候選並回傳；該張完成後立即可按「採用這張」或「產生下一張」，至多4張**成功**結果。每張未採用候選仍在前端候選列可回選（前端保存短效參照，不永久保存原始圖片 bytes；對應私人R2候選有效60分鐘），不必為第一張滿意者生成剩餘三張。
4. **單張成功定義**：每次受控 provider 請求僅接受一張已成功解碼、安全檢查、符合格式且與同輪先前結果不同的真 Gemini 插畫，寫入本輪合法的私人R2候選後才回傳200與新 index；不保證模型必然出圖，重複圖／沒有圖／超時時不得計入成功數，也不得複製假圖。上一張成功結果不受下一張失敗影響；已選用化身不被任何未確認結果覆蓋。
5. AI 插畫風格應符合 `prototype.v2` 的視覺小說人物設計，但重點在 **插畫風下仍能辨識與本人相似的臉型、五官、髮型及神情**，不得只追求卡通風而刻意扭曲真人特徵。使用多張本人照片和固定版本的風格指示；結果不得偷放任何完整來源照片作背景、不得外洩私人 EXIF 或帳號 Email。品質驗收用使用者授權照片與結果做人工相似度／風格比較，模型輸出不能保證百分百保真。
6. 共用選用狀態只能有 **一個目前遊戲化身**：`builtin` + catalog ID 或 `generated` + 本人已正式選定並保存的生成圖片 asset ID；伺服器檢核擁有權、成功狀態與 catalog 存在。錯誤、不完整或未選用的生成結果不覆寫既有化身。暱稱／個性／自介不因切換免費／AI 角色而清空。

### 4.3 本人資料、工作欄位與配對偏好

| 區塊 | 本份欄位 | 用途與可見性 |
|---|---|---|
| 形象 | `nickname`（提案 2～12 字）、`bio`（提案 0～40 字）、`traitTagIds`、`selectedAvatarType`、`selectedAvatarRef` | 初期展示受授權的遊戲化身與公開暱稱／簡介 |
| **工作／職業** | `occupation`（單一可編輯文字欄位，提案最多 60 字，可空） | 本人資料，未交換名片前不給對方；不強制填公司名稱或真實雇主 |
| 真人個人照 | 最多 5 張 `personalPhotoAssetIds`，可排序 | 只存壓縮版本；初期本人可見，**雙方名片同意後**授權對方讀取當前版本 |
| 興趣／價值觀 | `interestTagIds`、`topicTagIds`、`valueTagIds` | 涵蓋文創、戶外、美食、影劇動漫、心理測驗；字串 code 不等於前端顯示 label |
| 生活與互動偏好 | `weekendPreference`、`sleepSchedule`、`conversationStyle`、`expectedInteractionFrequency`、`relationshipMode` | 本人輸入，供未來配對與經同意後名片欄位 |
| 本人年齡及地區 | `birthDate`（私密）、`regionCode`（粗粒度縣市／行政區） | 出生日期用於 18 歲以上入場檢查及匹配年齡；不公開精確出生日期／精確位置 |
| 擇偶條件 | `preferredAgeMin`、`preferredAgeMax`、`preferredRegionCodes`、`sharedInterestWeight` | 本人偏好供 MatchingSessions，**不**當成交換名片要揭露的自我描述 |
| 登入帳號 | `auth_accounts.email_normalized`、憑證與 provider 識別 | 不複製進個人名片、候選 DTO 或任何圖片路徑 |

- 年滿 **18 歲**是確定的產品政策；依後端以現行日期／本人 `birthDate` 計算，不接受小於 18 歲者進入交友功能。沒有已授權的身份證件 KYC，**不假稱完成真人身份核實**。
- 興趣分類以至少五大需求類型的版本化靜態目錄表示；新增／停用代碼須維持歷史可讀性。不靠固定原型對象計算假契合度。候選資訊用途與真雙向演算法由 `MatchingSessions` 定義。
- `profileReady` 由 server 驗證是否具備有效暱稱、年滿18歲的生日與可用化身；額外興趣／配對條件留給 MatchingSessions 判定；**免費內建角色可完成化身設定，不能因沒有照片／AI 付款而阻擋整份資料設定**。本份不擅自決定未來匹配對象的顯示或強制工作欄位的必要性。
- 用 `profile.revision` 做**編輯並行防覆寫**，不是名片歷史快照；更新本人資料時同一 D1 原子條件提交，資料最新值是唯一名片來源。

### 4.4 即時名片來源與隱私邊界

| 投影 | 對象／條件 | 可用資料 |
|---|---|---|
| `OwnProfile` | 本人登入且 Session 有效 | 完整可編輯欄位、私人照片列表、目前有效 AI 候選（如 UI 持有暫存 attemptId）、目前選用角色 |
| `CandidatePersona` | 只有未來 MatchingSessions 對特定候選授權 | 本人選用的**遊戲化身**、暱稱、有限公開描述／興趣；**不得**出現真人照片、登入 Email 或私有擇偶條件 |
| `CurrentCardData` | **內部資料契約**，限未來 AffectionAndFeedback 檢查該輪雙方有效同意及未終止後讀取 | **目前**暱稱、自介、個性、工作／職業、興趣、生活習慣、價值觀、可分享的年齡層／粗粒度地區及目前最多 5 張真人照片（200 KB 版本） |

1. **名片即時讀取，不建立資料快照／名片表**。更新 `occupation`、`bio`、興趣，或者替換、刪除照片，下一次成功的授權名片讀取看到的是最新資料。此處「配對前已輸入的資料」描述沿用個人資料欄位，而非只能看配對當下的固定內容。
2. `SPEC-001-AvatarAndPreferences` 不提供公開的 `GET /profiles/{otherId}/card`；應由 `AffectionAndFeedback` 在檢查關聯、互動仍有效、雙方同意後，呼叫**內部唯讀查詢**取得本人當前資料和短效受保護的真人照串流。就算猜到 asset ID／知道 account ID，亦不能繞過驗證；不得使用永不過期或公用 R2 URL。
3. 不另加掉分取消已交換名片的規則（原 D-031 不變）。然而該輪結束後**不得開始新的授權讀取／揭露新更新的資料**；結束後已看過的歷史內容呈現規則由 AffectionAndFeedback／StoryDialogueAndExit 配合終止規則設計，不在本份新增名片快照表。
4. 真人照與生成化身是兩種不同可見性資料；只選免費角色的使用者亦可上傳真人照、以供未來交換。登入 Email、精確生日、精確 GPS、密碼、Provider token、私人好感度均不列入名片。
5. 上傳／編輯資料時使用者應可在本人畫面預覽「若同意交換名片，會提供哪些欄位與真人照」，避免在不知情下把敏感資訊分享出去。

## 5. 使用者操作流程與 UI／UX

```text
PlatformFoundation 完成 Email／Google 登入
  ↓
個人資料頁（始終可回來修改）
  ├─「工作／職業」、暱稱、自介、個性、興趣／生活偏好、18+生日及擇偶條件
  └─「個人照片」顯示固定提醒與同意用途 → 0～5張增加／預覽／排序／替換／移除
        └─ 本地預覽 → 單張 ≤8 MiB → 伺服器共用壓縮 ≤200 KB → 私人 R2 → 顯示保存版本
  ↓
選擇遊戲化身（與真人照片分開）
  ├─ 免費角色：男性風格 8 款／女性風格 8 款 → 選 1 → 即可使用
  └─ AI 客製化（鎖頭）：點擊即用、不付款
         → 引用個人資料已保存的至少2張真人照
         → 每次開啟產圖頁顯示第三方 AI 照片用途告知（RQ-01=A）
          → 本人按「開始產生第1張」→ 一次只產出一張真結果
         → Gemini／provider 真生成同一工作共 4 張直式3:4半身至腰部結果
         → 比較四張，選最滿意的 1 張 → 作為遊戲化身
  ↓
本人預覽自己未來「交換名片」會呈現的目前欄位與照片
  ↓
待後續 MatchingSessions 真實匹配 → AffectionAndFeedback 在親密度25分開名片入口
  ↓
雙方有效同意交換後 → 即時讀取目前資料／真人照；未同意或該輪終止不揭露新資料
```

### 5.1 介面與互動

- 延續 `prototype.v2` 的玫瑰粉／深紫色、半透明面板、ADV 立繪感。免費角色要提供 **16 張各有區別的正式插畫資產**，不拿原型 4 款角色圖複製改名冒充。 **RQ-02=A**：免費16款和AI4張使用相近3:4直式半身至腰部畫框、清楚五官與簡潔背景；遊戲對話容器不能裁掉臉或拉伸失真。
- 照片編輯屬**個人資料頁**，AI 是從已保存的照片啟動；不是每次點 AI 都重新上傳。Android／iOS 使用系統照片挑選、Web 使用檔案選擇，僅請求必要存取權限。0 張仍可用免費化身；AI 按鈕需提示至少 2 張。
- 固定提醒文字必須在照片首次上傳及後續新增／替換前可見，不藏在深層條款；另提供本人「同意後名片預覽」區，使使用者清楚照片和職業會被分享。
- AI 鎖頭只代表**未來**的付費能力：本MVP進入頁面與每次生成均不收費、不扣點。首次需按「開始產生第1張」，之後由本人按「產生下一張」逐張生成，成功才出現新候選（最多4張）、可從既有候選清單回選；點「採用這張」**額外開啟採用確認視窗**，顯示「採用後將結束本輪；未來正式付費上線後，若要重新產生需依當時方案付費；目前免費」。確認前不能結束本輪或永久保存，取消則保留全部有效候選。此採用確認與D-048所禁止的「**送照片前再多一個同意跳窗**」是不同動作，兩者不衝突。
- 表單需要空白、載入中、離線、圖片過大／壓縮失敗、未滿 18 歲、重送、防重複點擊、provider 超時、斷線後可能需重新生成、資料 CAS 409 與登入狀態失效等明確提示；互動按鈕防重複提交。
- 除照片上傳有短暫本機預覽外，不把原始照片或 provider 憑證存進未受控本地快取／日志。安全圖片可經驗證授權短效讀取，不能使用公用 R2 URL。
- 真正的 Web／Android／iOS 截圖、字體放大、鍵盤焦點、螢幕閱讀器及 reduced motion 驗收分開留證據。依既有 D-033／D-035 可保留 iOS／雲端暫緩但不得標為 Passed；本地 Web／Android 亦需這次功能自己的真實驗證。

## 6. DDD、分層責任與跨 SPEC 契約

| 層級 | 設計元件 | 職責 |
|---|---|---|
| Domain | `DatingProfile` Aggregate Root（包含基本資料、照片引用與偏好）、`AvatarSelection`、`MediaAsset`／短效 AI 候選 Value Object | 18+、欄位限制、每帳號最多5張、AI輸入至少2張、來源 owner、目前唯一選用化身、4張生成完成規則、CAS |
| Domain | `Occupation`、`AgeRange`、`RegionCode`、`ProfileRevision` | 正規化、欄位範圍、標籤代碼與版本核對；**ProfileRevision 只防併發覆寫，不保存名片歷史** |
| Application | `DatingProfileService`、`AvatarSelectionService`、`AvatarGenerationService` | 本人資料更新、免費角色切換、每次1張 AI 生成、本輪至多4張、回選／確認採用及短效占位、檢查權限與資料投影 |
| Application 共用能力 | `IImageCompressionService.CompressAsync(input, targetBytes=200_000, options, ct)` | 不依賴照片業務語意的通用圖片壓縮；任何後續上傳圖像流程都可用，回傳壓縮 bytes、byteLength、尺寸、MIME，不要求額外計算內容雜湊 |
| Application／Infrastructure | `IPrivateMediaStore`、`IAvatarImageGenerator`、`IImageDecoder` | 串流圖片到私人 R2；真 Gemini adapter／可替換 provider；安全的圖片檢查與編碼 |
| Cloudflare／D1 | 僅白名單的 `profile.*`／`avatar.*` 固定 commands、私人媒體 handler | 依目前有效 session family 判斷 owner；prepared SQL／batch／唯一限制，不公開任意 SQL 或 R2 key |
| API | 本人 `/api/v1/me/*` 路由、串流端點與 ProblemDetails | 接受驗證後的平台身分、檢查流量與容量、拒絕跨帳號猜 ID、Web Origin／CSRF 與原生 Bearer |
| Expo／React Native | `PersonalPhotos`、`FreeAvatarCatalog`、`AvatarGenerationChoices`、`DatingProfileForm`、`MyCardPreview` | 本人照片／資料、16款免費角色、鎖頭、逐張最多4張、可提前採用／回選／採用確認與費用預告、可見性提醒與錯誤恢復 |

**共用壓縮契約**：壓縮功能放在中立共用服務（例如 `backend/src/DatingHigh.Application/Media/` 的 interface、`Infrastructure/Media/` adapter），不得寫死 `avatar` 路徑、圖片數量、R2、名片或任何 UI 規則；目標 bytes、尺寸限制、允許格式是參數／明確 options，未傳入時 `targetBytes = 200_000`。伺服器驗證每次輸出 `byteLength ≤ targetBytes`；後續其他圖片功能可用不同 targetBytes。測試不依賴 ImageSharp 或未審查的脆弱套件，也不假設任意 stream 都能直接被影像 decoder 單次同步讀完；需驗真實串流分段與失敗回復。

**跨 SPEC 提供的內部介面（本份只定義，不實作名片邏輯）**：

- `GetMatchingInput(accountId, authorizedServiceContext)`：從當前 profile 取年齡、地區、興趣與擇偶偏好，限 MatchingSessions；不傳真人照片、登入 Email 或他人的權杖。
- `GetCandidatePersona(accountId, participantContext)`：受 MatchingSessions 授權後才取目前的**遊戲化身**與有限公開資訊；不用猜到 accountId 就開放。
- `GetCurrentCardFields(accountId, authorizedInteractionContext)`：**只有**後續 AffectionAndFeedback 驗證該輪雙方同意、有效且未終止後才可取得當前職業／興趣／生活描述與照片 asset IDs；**沒有 snapshotId／profileRevision 讀取歷史名片**。
- `OpenAuthorizedCardPhoto(assetId, interactionContext)`：由持有名片授權的服務二次檢查當輪有效狀態、對方 owner 與照片現況，串流 200 KB 版本；不可拿 `GET /me/media` 的本人路由代替配對對方授權。
- `GetCurrentAvatar(accountId, participantContext)`：讀取本人選中的免費內建角色或生成圖，無法藉此取得生成來源的真人照。

**信任邊界**：`Api -> Infrastructure -> Application -> Domain`；server 端持有 Gemini／R2 credentials，client 僅有照片選擇與受控 API；Worker 的內部媒體與 SQL 指令不可因新增圖片路由而開放給外網。

## 7. API 設計草案

承接 PlatformFoundation `/api/v1`、camelCase、ISO 8601、ProblemDetails、`Cache-Control: no-store`、Web CSRF／native Bearer。下表是**新 SDD 提議端點**，尚未實作；本人路由皆要求目前有效 PlatformAccess、D1 family／cv 驗證。圖片上傳為串流專用例外，**不得全域取消現有 JSON 16 KiB 上限**。

| 方法／路徑（`/api/v1` 相對） | 授權與輸入 | 成功與關鍵限制 |
|---|---|---|
| `GET /profile-catalog` | 本人；無 body | 200；五大興趣目錄／版本、性格與偏好選項 |
| `GET /avatar-catalog` | 本人；無 body | 200；男性風格8＋女性風格8之固定 ID、圖片與授權可用資訊 |
| `GET /me/dating-profile` | 本人；無 body | 200；當前個人資料、最多5筆私人照片 metadata、當前化身 ID、`revision`、`profileReady` |
| `PUT /me/dating-profile` | 本人；完整 validated fields＋`expectedRevision` | 200；文字、職業、生日、興趣、生活／配對偏好以 CAS 更新；409 防覆寫 |
| `POST /me/photos` | 本人；單一受控圖片串流，不直接傳 R2 key | 201；上傳 ≤8 MiB，後端壓縮 **≤200_000 bytes**、由後端驗證並以單一 D1 條件式 INSERT 原子限制本人照片 pending＋ready 總數≤5，存私人 R2 返回 assetId 與 metadata |
| `GET /me/photos` | 本人 | 200；照片 metadata／排序、只能本人的真照片 |
| `PUT /me/photos/order` | 本人；至多5個資產 ID 與預期 revision | 200；只能排列本人全部現有照片，不建立新圖片 |
| `DELETE /me/photos/{assetId}` | 本人；單筆資產 ID | 204；刪除／遮蔽即對日後的即時名片讀取失效，跨 owner 拒絕 |
| `GET /me/media/{assetId}` | 本人；資產 ID（真人照或本人生成結果） | 200；stream、no-store、nosniff；**不回 R2 key 或公用 URL** |
| `POST /me/avatar/generations` | 本人；`styleId`、首次不帶 `attemptId`，續產帶本人有效 `attemptId`、`clientRequestId`（同輪冪等）、`expectedProducedCount`（0～3）；每次明確點擊只發1張請求 | 200；**成功時只回新產生的一張** `{attemptId,index,producedCount,maxCandidates:4,expiresAt}`；若失敗不增加成功張數且已產圖可續選。已關閉／超過4張／同時生成拒絕409，provider超時503，限流429；不得在一次請求強制生成4張或建立D1 Job表 |
| `GET /me/avatar/candidates/{attemptId}/{index}` | 本人；attemptId UUIDv7、index 1～4，CurrentUser 自行推導 R2 key | 200；受控串流本輪已成功產生的臨時候選（最多四張）；過期410、無權拒絕；不可公開或作長效頭像 |
| `PUT /me/avatar/selection` | 本人；`type=builtin`＋目錄ID，或 `type=generated`＋已成功產出的有效 `attemptId/index`，帶 `expectedRevision`；前端必須已顯示「採用後結束本輪／未來正式付費重生提示」並由本人確認，既有正式本人 asset 亦可重新選用 | 200；由伺服器原子關閉本輪，只將所選1張轉永久R2＋DB資產並 CAS 設唯一化身；其他0～3張短效清理，重送不得重複正式化；取消前端確認不送出PUT；無真付款／購買／權益API |
| `GET /me/card-preview` | 本人 | 200；本人預覽當前將分享的資料與照片清單，不能替代另一人同意 |

**不在本份建立** `GET /users/{id}/card`、公開名片照片路由、付款端點、交易／權益 API。跨帳號名片只由後續 AffectionAndFeedback 在有效雙方同意後透過受限內部資料查詢與短效影像代理存取；使用者猜到 owner／asset ID 不能繞過同意。介面不得直接公開原始 R2 路徑。

**更新範例**（示意；代碼以未來正式目錄為準，非實際可呼叫的已部署 API）：

```json
{
  "expectedRevision": 3,
  "nickname": "星河旅人",
  "bio": "喜歡手作與戶外散步",
  "occupation": "軟體工程師",
  "birthDate": "1995-08-12",
  "regionCode": "TW-TPE",
  "traitTagIds": ["warm"],
  "interestTagIds": ["puzzle", "handcraft"],
  "topicTagIds": ["puzzle_chat"],
  "weekendPreference": "explore",
  "sleepSchedule": "night_owl",
  "conversationStyle": "warm",
  "expectedInteractionFrequency": "weekly",
  "relationshipMode": "friends_first",
  "valueTagIds": ["creativity"],
  "preferredAgeMin": 25,
  "preferredAgeMax": 35,
  "preferredRegionCodes": ["TW-TPE", "TW-NWT"],
  "sharedInterestWeight": 60
}
```

`GET /me/dating-profile` 不應回登入 Email 的備份、R2 objectKey、原始未壓縮 bytes 或任何 provider 憑證。`GET /me/card-preview` 僅本人預覽；對方名片回應只由未來受同意保護的服務建構，且每次讀取目前最新資料。下游新增路由時須執行資料存取授權與終止競態整合測試，不依賴僅有 URL 所有權的假驗證。

**API 錯誤分類**：400 INVALID_PROFILE／INVALID_IMAGE／INVALID_AVATAR_SELECTION、401 SESSION_REVOKED／ACCESS_TOKEN_EXPIRED、404 PHOTO_NOT_FOUND／AVATAR_CANDIDATE_NOT_FOUND、409 PROFILE_VERSION_CONFLICT／PHOTO_LIMIT_REACHED／AVATAR_GENERATION_IN_PROGRESS／AVATAR_LIMIT_REACHED／AVATAR_ATTEMPT_CLOSED、410 AVATAR_CANDIDATE_EXPIRED、413 IMAGE_TOO_LARGE／COMPRESSED_IMAGE_TOO_LARGE、429 RATE_LIMITED、503 IMAGE_PROVIDER_UNAVAILABLE／STORAGE_UNAVAILABLE；實際狀態碼及前端繁中文案在 BDD 應一致。

## 8. D1 資料結構、JSON 契約與私人 R2（精簡定稿提案）

### 8.1 表數量、欄位責任與命名

依使用者 2026-11-01 **D-046 精簡決策**，本份僅新增 **2 張** `user_` 前綴 D1 業務表：`user_profiles` **15 欄**、`user_media_assets` **9 欄**，合計 **24 欄**。**取消 `user_avatar_generation_jobs`**；`user_media_assets` **不存 `byte_size`、`sha256`、`generation_job_id`、`result_index`**。個人照片大小由壓縮服務在保存前驗證；圖片 MIME 先經 decoder 確認並寫入 R2 Content-Type，D1 的 `mime_type` 僅用於列表與回應，須與 R2 metadata 一致。無照片去重或檔案完整性稽核需求，不持久化 SHA-256。

| 表 | 目的 | 所有權及不建的表 |
|---|---|---|
| `user_profiles` | 目前個人資料、工作、興趣／生活／擇偶偏好、唯一選用化身、CAS 修訂版本 | 一帳號一列；沒有名片快照或歷史表 |
| `user_media_assets` | 已保存的本人照片、**實際選定後才持久保存**的 AI 化身 | 本人照片最多5張；不建生成工作表、免費角色表或標籤目錄表 |

所有新表首欄為 `TEXT NOT NULL PRIMARY KEY` 的小寫 canonical UUIDv7；`account_id` 為參照既有 `auth_accounts` 的 FK，建立後由後端固定 SQL 白名單維持不可變；D1 時間欄位為 Unix epoch **milliseconds INTEGER**，API 回應 camelCase。保留原六張 `auth_`／`common_` 基礎表共 54 欄，不因本份更名或加欄。下方為**未執行的 migration 目標 SQL**，待本份 SDD 核准後才由 `well-done` 建立新 migration 並跑真 Miniflare D1。

### 8.2 D1 Schema（完整建表草案）

```sql
CREATE TABLE user_profiles (
  profile_id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE REFERENCES auth_accounts(account_id),
  nickname TEXT NOT NULL DEFAULT '' CHECK (length(nickname) <= 12),
  bio TEXT NOT NULL DEFAULT '' CHECK (length(bio) <= 40),
  occupation TEXT CHECK (occupation IS NULL OR length(trim(occupation)) BETWEEN 1 AND 60),
  birth_date TEXT CHECK (birth_date IS NULL OR length(birth_date) = 10),
  region_code TEXT CHECK (region_code IS NULL OR length(region_code) BETWEEN 1 AND 16),
  traits_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(traits_json) AND json_type(traits_json) = 'array'),
  interests_json TEXT NOT NULL DEFAULT '{"interestTagIds":[],"topicTagIds":[],"valueTagIds":[]}'
    CHECK (json_valid(interests_json) AND json_type(interests_json) = 'object'),
  preferences_json TEXT NOT NULL DEFAULT '{}'
    CHECK (json_valid(preferences_json) AND json_type(preferences_json) = 'object'),
  selected_avatar_type TEXT CHECK (selected_avatar_type IN ('builtin', 'generated')),
  selected_avatar_ref TEXT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL CHECK (updated_at >= created_at),
  CHECK (
    (selected_avatar_type IS NULL AND selected_avatar_ref IS NULL)
    OR (selected_avatar_type IS NOT NULL AND selected_avatar_ref IS NOT NULL
        AND length(selected_avatar_ref) BETWEEN 1 AND 80)
  )
);

CREATE TABLE user_media_assets (
  asset_id TEXT NOT NULL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES auth_accounts(account_id),
  kind TEXT NOT NULL CHECK (kind IN ('personal_photo', 'generated_avatar')),
  object_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  display_order INTEGER CHECK (display_order >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'deleted')),
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  CHECK (
    (kind = 'personal_photo' AND display_order IS NOT NULL)
    OR (kind = 'generated_avatar' AND display_order IS NULL)
  ),
  CHECK (
    (status = 'deleted' AND deleted_at IS NOT NULL AND deleted_at >= created_at)
    OR (status IN ('pending', 'ready') AND deleted_at IS NULL)
  )
);

CREATE INDEX idx_user_media_owner_kind_status_order
  ON user_media_assets(account_id, kind, status, display_order);
```

**後端照片新增的固定 prepared SQL 範例（API 寫入時執行，**不可放入 schema migration**）：**

```sql
-- 不建立 SQL Trigger；以單一條件式 INSERT 守住5張上限。
-- 同一 D1 寫入語句內完成「pending＋ready < 5」檢查與新增排序；不可先查數量再寫入。
-- ?1=assetId、?2=目前登入 accountId、?3=服務端生成的 R2 key、
-- ?4=經解碼驗證的 MIME、?5=Unix epoch 毫秒。其餘欄位由伺服器固定。
INSERT INTO user_media_assets
  (asset_id, account_id, kind, object_key, mime_type, display_order, status, created_at)
SELECT ?1, ?2, 'personal_photo', ?3, ?4,
       COALESCE((
         SELECT MAX(display_order) + 1 FROM user_media_assets
         WHERE account_id = ?2 AND kind = 'personal_photo'
           AND status IN ('pending', 'ready') AND deleted_at IS NULL
       ), 0),
       'pending', ?5
WHERE (
  SELECT COUNT(*) FROM user_media_assets
  WHERE account_id = ?2 AND kind = 'personal_photo'
    AND status IN ('pending', 'ready') AND deleted_at IS NULL
) < 5
RETURNING asset_id;
```

**Schema 與 Application 職責分界**：本份不建立或呼叫任何 SQL Trigger；PK／FK／UNIQUE／CHECK 負責基本資料完整性，業務條件採後端檢核與固定 prepared D1 條件式 SQL，不開放任意欄位更新。上方 `CREATE TABLE`／`CREATE INDEX` 是未執行的 migration 草案，後方 `INSERT ... RETURNING` 僅是 Runtime API command 範例；兩者不得混用，並須經真 Miniflare D1 並發驗證。

- `nickname` 可在尚未完成設定的 profile 中為空字串；**非空時必須為2～12個 Unicode scalar**，`bio` 0～40、`occupation` 空值或1～60。字串由 .NET trim 與計數，拒絕控制字元、孤立 surrogate 與不符合規則的 enum；資料庫 `length` 是輔助上限，不能代替應用驗證。
- `birth_date` 採 ISO `YYYY-MM-DD` 日期文字而非 timestamp，由 .NET `DateOnly` 嚴格解析真正有效日期、不得為未來日，依服務採用的**臺灣日曆日期**判斷 18 歲；閏年2月29日生日跨非閏年按當地法律與產品年齡規則一致處理，測試須固定時鐘。註冊可先是 NULL；使用交友／配對前必須年滿18歲。生日不進公開投影。
- `region_code` 與所有選項代碼按版本化靜態目錄驗證；不存 GPS、經緯度或任意輸入的區域字串。
- `selected_avatar_type/ref` 必須成對為 NULL 或成對有值。選 `builtin` 時 reference 必須是 16 個穩定目錄 ID；選 `generated` 時必須透過**同一 prepared D1 條件 UPDATE**確認該 UUIDv7 資產 `account_id` 是本人、`kind=generated_avatar`、`status=ready` 且未刪，並檢查 `revision`；不能僅依外部呼叫先 SELECT 後無條件 UPDATE。沒有跨 builtin／media 的單一 FK，因此這項是 Application／prepared SQL 責任。
- `revision` 用於 `UPDATE ... WHERE account_id=? AND revision=?`，成功才 `revision=revision+1`；更新 0 列回 409 並重新讀取，不另外建 version／snapshot 表。照片排序也需要以同一 profile revision 作串列化，且一次核對**整個目前有效照片 ID 集合**，重排後保證每個 `display_order` 於目前清單為 0～N-1、沒有重複；一般上傳期間序號可大於4；不要在缺少 CAS 時只對每張照片各自更新。排序變更採同一 D1 batch，0變更不得假裝成功。
- 照片 `status` 只允許 `pending -> ready -> deleted`、`pending -> deleted`，不能反轉；後端僅提供依 `asset_id + account_id + kind + expected status` 條件更新 `status/deleted_at`（或受控排序更新），每次檢查 affected rows／`RETURNING`，不得透過 API／固定 D1 command 更新 `account_id`、`kind`、`object_key` 或復活已刪照片。若繞過受控後端直接執行任意管理 SQL，這些應用層不變式不受保證；須以資料庫存取權限限制此類入口。`generated_avatar` 只有被使用者選擇後才會建立正式持久資料。私人 R2 物件的內容型別與 D1 `mime_type` 保持一致；`byte_size`、hash 僅在圖片處理／驗證期間使用，不寫入 D1。
- **照片最多5張不使用 Trigger**：先由 Application 驗證輸入，再由單一受控 prepared `INSERT ... SELECT ... WHERE (COUNT(pending＋ready) < 5) RETURNING asset_id` 同時決定是否占位，且用同一語句內的 `MAX(display_order)+1` 取得排序；無回傳列代表未新增，檢查後回 `409 USER_PHOTO_LIMIT_REACHED`，不得將此情況當成功。禁止 `SELECT COUNT` 後執行不帶條件的獨立 INSERT。`display_order` 不限制為0～4，重排才正規化為0～N-1；`pending -> ready` 不增加占額，`deleted` 不能復活。R2 失敗時以 owner／status 條件 UPDATE 將 pending 標為 deleted，超時 pending 由既有 housekeeping 定期清理；須以真 Miniflare D1 的同帳號並發上傳及失敗補償測試，證明第5／第6張競爭時總量仍≤5。
- UUIDv7 形狀／Unix 毫秒與 JSON 內容深度在 .NET service／固定 D1 command 驗證，不能宣稱上述 SQLite `CHECK` 足以覆蓋全部業務語意。索引以 `account_id` owner 查詢及狀態排序為主；兩張表以外不增加臨時統計／tag／AI 工作表。

### 8.3 JSON 欄位固定結構

`traits_json` 是**代碼字串陣列**，對應 API `traitTagIds`（最多5個、不可重複；每個代碼必須存在且有效），例如 `["warm","curious"]`。

`interests_json` 是固定三欄物件（不是任意巢狀 JSON），例如：

```json
{"interestTagIds":["puzzle","handcraft"],"topicTagIds":[],"valueTagIds":["creativity"]}
```

每一陣列成員都是目錄內代碼、去重且順序規範化；`interestTagIds` 最多12、`topicTagIds` 最多8、`valueTagIds` 最多8。新增目錄代碼必須兼容舊版既存值；若舊代碼停用，讀取仍能辨識，編輯時不可無預警改成另一個含義。

`preferences_json` 的**固定九個鍵**、語意、型別如下；未設定選項用 `null`、未設定區域用空陣列，不把缺鍵與空字串混用：

```json
{
  "weekendPreference": null,
  "sleepSchedule": null,
  "conversationStyle": null,
  "expectedInteractionFrequency": null,
  "relationshipMode": null,
  "preferredAgeMin": null,
  "preferredAgeMax": null,
  "preferredRegionCodes": [],
  "sharedInterestWeight": 50
}
```

| JSON key | 型別／限制 | 用途與讀取範圍 |
|---|---|---|
| `weekendPreference` | 目錄代碼或 NULL | 自身生活描述，僅授權名片投影 |
| `sleepSchedule` | 目錄代碼或 NULL | 作息，僅授權名片投影 |
| `conversationStyle` | 目錄代碼或 NULL | 互動風格，僅授權名片投影 |
| `expectedInteractionFrequency` | 目錄代碼或 NULL | 互動頻率，僅授權名片投影 |
| `relationshipMode` | 目錄代碼或 NULL | 關係期待，僅授權名片投影 |
| `preferredAgeMin`、`preferredAgeMax` | **成對**整數或成對 NULL；18～120，若有值 Min≤Max | 私有配對條件，不揭露在名片 |
| `preferredRegionCodes` | 目錄代碼陣列，0～10筆、去重 | 私有配對條件，不揭露在名片 |
| `sharedInterestWeight` | 整數 0～100，預設50 | 私有配對演算法權重，不揭露在名片 |

**寫入／讀取契約**：API 以 camelCase 收欄位、固定 whitelist 映射至上述三個 JSON 欄位；JSON 一律為合法 UTF-8、大小／深度有上限、不接受未知鍵、重複鍵、錯誤型別、非法目錄 code、重複 ID 或範圍衝突。新建 profile 寫入完整固定形狀與預設值；讀取既存缺省的 `preferences_json='{}'` 時由 .NET 以同一規格填入預設，避免前後端分歧；更新時正規化為完整形狀，不把從舊版本未知屬性悄悄回傳給 client。生日／擇偶條件／真人照／登入 Email 有嚴格不同的投影白名單；絕不直接把資料庫整列序列化為候選或名片。

**最小設定完成判定**：`profileReady` 僅在本人已有有效暱稱（2～12）、合法成年生日及一個有效 `selected_avatar` 時為 true；無真人照片、無 AI、無工作欄位均不阻擋免費化身的基本設定。MatchingSessions 將另依是否有足夠興趣／擇偶條件決定能否參與配對，**不在本份擅自新增強制配對欄位**。

### 8.4 無 Job 表的逐張最多四張 AI 候選流程（D-050）

1. **開始產圖**：本人進入頁面僅顯示 D-048 第三方用途說明、風格及目前選用化身。本人按「開始產生第1張」才觸發 `POST /me/avatar/generations`；server 每次重驗已保存的2～5張 `ready` 真人照、account owner、登入 Session、限流及 R2 狀態，**每個 HTTP 請求最多調度1張 Gemini 結果**，不在同一請求遞迴產4張。
2. **短效本輪身分**：首次請求建立 `attemptId`（UUIDv7）及 `private/{accountId}/avatar/temp/{attemptId}/manifest` 的短效私人 R2 狀態（有效60分鐘），紀錄 `expiresAt`、`producedCount=0`、連續成功索引清單、固定風格、`open/inFlight/closed`、目前受控 `clientRequestId`、重試回覆必要的非秘密中繼資訊；此 metadata 不是 D1 Job 表，不持久紀錄外部 provider 工作，不提供 background worker 或斷線後續跑保證。**跨 attempt 排他**：另以本帳號固定的 `private/{accountId}/avatar/temp/active` 私有 R2 指標執行條件建立（create-only），同帳號首次產圖並發只能有一個 attempt 取得使用權；關閉或到期時以 ETag CAS 更新／釋放，必須先確認舊 inFlight 不再能提交結果，避免不同 attemptId 繞過上限。前端只保存 `attemptId`／候選索引和短效預覽，不能把原始個人照與候選圖永久放入 localStorage／SecureStore。
3. **並行與成本防護**：同帳號同時最多1個 open attempt，同 attempt 同時最多1張 `inFlight`；使用 R2 manifest 的條件式寫入（例如依 ETag 的 CAS）取得排他占位，`expectedProducedCount`、`clientRequestId`／request digest 做冪等檢查。重送相同請求應取回已完成結果或受控回 `409 AVATAR_GENERATION_IN_PROGRESS`，不得因此再次呼叫 Gemini。已經有4張成功候選、已採用關閉、過期或不符 accountId／styleId 的請求一律拒絕，不能繞前端開多頁同時產圖；每帳號限流／同時請求上限與服務預算由既有平台 `IRateLimiter` 及限額策略提供，**不宣稱完全避免第三方對超時請求計費**。需在真 R2 條件寫入與真 Worker 並發測試中證明跨實例排他，若現有 bridge 不支援須提出證據並阻止通過該 Gate，不放寬限制。
4. **逐張成功及失敗**：每次 provider 真回1張、圖片可解碼／檢核格式、安全、3:4畫框且與本輪已存候選不同後，先保存 `private/{accountId}/avatar/temp/{attemptId}/{nextIndex}`，再以受控 CAS 將 `producedCount` 增1、釋放 `inFlight`，最後才回 `200 {attemptId,index,producedCount,maxCandidates:4,expiresAt}`。**只有真實成功並可讀取的一張才占1個成功額度**；沒有圖片、重複、超時、R2失敗均不產生新 index，已成功候選不刪除，也不將本輪整批判為失敗。無法確認是否已產生／已扣費的 provider 超時須顯示不確定狀態並禁止自動重送，查本輪短效狀態後讓使用者明確再次操作；重試可增加供應商成本，必受限流控制。
5. **暫存與回選**：成功候選索引依序1～4，前端即時顯示成功的單張結果；「暫不採用」保留本輪短效候選列及私人 R2 暫存圖。可從任何仍有效的已成功索引返回預覽、比較和選擇；前端顯示 `已產 n/4`，在 `n<4` 且非 `inFlight` 才開放「產生下一張」，`n=4` 時只能選擇或放棄，不得再要求第5張。本輪到期後所有候選不再可用；不得把 preview 變成永久／公開 URL。
6. **確認採用與費用文案**：本人點「採用這張」**先出現採用確認視窗**，文字明示「確定採用後本輪將結束，未採用圖片不會永久保存；未來正式付費上線後，重新生成將依當時方案付費；本 MVP 目前免費」。按「取消」不改 `attempt`／當前化身，按「確認採用」才呼叫 `PUT /me/avatar/selection`。此視窗與產圖頁面上無第二次 Gemini「送照同意跳窗」的 D-048 互不牴觸；禁止未實作的金流／扣點提示為已生效收費。
7. **唯一正式化與關閉**：server 重新驗目前 Session、candidate owner、有效 `attemptId/index`、來源真人照仍ready、`user_profiles.revision`；以同輪 CAS 鎖定 closed/selected 避免生成與採用並發。只將選中的1張複製至正式 R2、建立1筆 `generated_avatar` 並以 D1 CAS 設為唯一目前化身；失敗保留原角色、補償 D1 pending／R2 孤兒，若未完成不得永久關閉可選候選。選用成功後關閉本輪，拒絕任何續產；剩餘成功候選（0～3張）到期或儘速清理，不建立永久資產。重送選用須冪等回報同一結果或明確衝突，不可重複扣費／儲存。
8. **效期與安全**：本輪固定60分鐘（建立後不因逐張產出延長），在每次續產、讀取、選用時驗 `expiresAt`；R2 lifecycle/GC 僅保底，逾期立即拒絕410。生成途中真人照被刪除則**不得發布該張候選**，但已合法產出的其他候選仍需於採用時重新驗來源；超時 `inFlight` 的解鎖不得在可能仍有外部請求執行時放行並發第二筆，必須真實驗證安全的 lease recovery。沒有持久Job、不保證斷線可續跑同一次 provider 呼叫；短效 manifest 尚有效且本輪 open 時，已成功候選允許安全重讀與後續續產。


### 8.5 R2/D1 一致性、授權與清理

- **本人照片上傳**：先安全解碼及共用壓縮後才向 D1 建立占位 `pending`（單一 D1 條件式 INSERT 檢核5張上限），依固定 owner+asset ID R2 key 上傳成功後才轉 `ready`；失敗補償標記 `deleted` 並刪除 R2 孤兒。不能把 raw 8 MiB 上傳檔原封不動保存。壓縮目標 200,000 bytes 是處理服務檢查值，**不是 D1 `byte_size` 欄位**。
- **刪除／排序**：本人刪照先在 D1 標記 `deleted`，讓名片與 AI 新讀取立即無效；R2 刪除採安全補償／重試，已持有舊資料的外部接收者無法受控回收。刪照若不是指定目前 `display_order`，其餘照片按 0～N-1 重新排序；相同 profile CAS 可防止並發覆寫。照片內容由內部照片代理串流並加 no-store/nosniff，不回傳私人 R2 objectKey。
- **圖片元資訊**：壓縮服務在記憶體驗證大小、像素、格式並回傳 MIME；R2 object metadata 存 Content-Type、必要的到期時間；D1 的 `mime_type` 保存業務列表必需的格式。沒有 DB `byte_size`／`sha256`；未要求全站圖片去重、數位指紋或定期檔案稽核。
- **GC**：定期處理超時 `pending`、已標記刪除但殘留 R2 的私人物件、逾期臨時 AI 候選／manifest（最多4圖）；不能靠 GC 決定權限失效時點。清理任務按既有平台維運機制規劃，不因本 SPEC 建任何 task／outbox／job 新表；不得清除使用者仍在使用的 `ready` 本人照片或已選定的正式生成化身。
- **目前名片資料**：同意後每次由 `user_profiles` 及 `user_media_assets WHERE kind='personal_photo' AND status='ready'` 即時讀取；本份僅提供授權內部介面，雙方同意與互動終止由 `AffectionAndFeedback` 等後續 SPEC 控制。沒有 `card`、`snapshot`、`builtin_avatar`、`tag_catalog`、`user_avatar_generation_jobs` 新表。

## 9. AI、隱私與錯誤處理

### 9.1 Gemini 驗證、提供者抽象與品質

- `IAvatarImageGenerator` 隔離供應商；**已獲使用者同意用 Gemini 作真實生成驗證**，但具體 Gemini 圖像模型、可上傳格式、每個請求的出圖數、費率與區域可用性，需要在實作前以官方 API 文件及使用者已配置的服務實測確認，不憑假資料推定「單次 API 必回1張」能力，必須以真 Gemini 證明單張成功與合理耗時。
- Gemini API credentials 由使用者在實作驗證階段設到已隔離的本地 `env`／安全的 server secret；**不得在對話、版本庫、前端打包檔、API response、紀錄或測試 fixture 留下明碼**。驗收時可使用其授權的測試照片，並記錄最小的成功證據（不含個資的 request correlation ID、model version、產出數量、成功／錯誤類別、主動確認相似度），不保留完整上傳照片或 secret 的 log。
- 固定 server-side 風格指示（`promptVersion`）與使用者選定的 style，統一3:4直式半身至腰部、簡潔背景並保留人臉辨識特徵，創作圖仍採 ADV 插畫風。防止用戶輸入作為 system prompt、原圖不被意外公開；不能承諾 AI 影像百分之百精準，但需要**真人照片比對**確認沒有重大形變、錯誤臉孔／膚色偏移／五官變化。
- **每張獨立成功**：每個 Gemini 請求必須取得1張可安全解碼、與本輪既有候選不同、完成私人R2儲存的真正插畫，才回成功；不可讓一張 provider 回覆冒充四張。若該張失敗只停止這次，保留已成功候選、提醒再次嘗試可能產生成本；既有共用限流、同帳號排他、短效R2狀態與重送冪等必須防止不受控並發。真Gemini與真R2需要逐張驗證延遲、用量、單張成本與失敗回復，不宣稱可以完全取消供應商的失敗計費。
- 未授權傳送真人照給第三方時不得呼叫 Gemini；需提供來源照片使用告知和本人明確觸發 AI 功能。輸出須通過平台內容安全與授權檢查；過度扭曲真人臉不是安全要求，也不等於通過隱私保護。 **RQ-01=A**：僅開頁／點鎖頭／取消或照片不足時不得傳送；按明示的「開始產生第1張／產生下一張」才是真正的本次本人確認。

### 9.2 圖片壓縮與安全邊界

- 目標是**保存清晰而非保存原始 bytes**：通用壓縮到 `≤200_000 bytes`，先解碼及去 EXIF／GPS、適度調品質與長寬，不拉伸不扭曲。應驗縮圖像素、長寬比、輸出格式、重複使用、透明圖片、解碼失敗、惡意超大圖片，以及分段串流／重試。壓縮若導致五官難辨，應提示使用者換照或調整輸入，而不是默默超過200 KB。
- 個人照片的每一個讀取點都需區分「本人管理」與「交換名片後由對方查閱」。就算外部 AI 可以見照片，仍不得把它設成普通可搜尋的圖片或使用無限期有效的公用 URL。
- 成年政策：未滿 18 歲不得完成交友資料設定。使用者自己輸入生日是自我聲明，沒有額外證件 KYC；未來對外只可顯示年齡層／粗粒度地區。

### 9.3 故障與恢復矩陣

| 情境 | 預期處理 |
|---|---|
| 沒有個人照片但選擇免費 16 款之一 | 允許選用，使用者不需 Gemini、也不觸發付費 |
| 少於2張照片點擊 AI 鎖頭 | 可進入介紹及上傳引導，但不啟動生成；指出需先保存多張本人照片 |
| 圖片格式偽造、資料破損、超過8 MiB、壓縮後仍大於200 KB | 明確拒絕，不把未壓縮 bytes 存為已成功照片；保留已存在資料 |
| 兩端同時上傳第5／第6張 | 只能原子接受不超過5張，超額回明確錯誤，不留下可存取孤兒檔 |
| D1 寫入成功但 R2 失敗，或 R2 成功 D1 逾時 | pending／孤兒補償與可重試，不能把無檔資產變成可讀 |
| 同帳號多頁並發產圖、重送、單張逾時／無圖／重複圖、產出4張後再要求第5張 | 一次只允許1個inFlight；以短效R2 CAS與clientRequestId防止重複呼叫；失敗不占成功額度但先前候選保留。達4張或已採用／過期拒絕409／410，不能自動因超時重送；提示供應商成本可能已發生、MVP仍不向使用者收款 |
| Gemini 配置失效、額度不足、API 超時或回傳不同格式 | 給可處理的錯誤提示；不寫入假的成功圖、不洩漏 API key |
| 本人已刪真人照但生成回應晚到 | 不使用已刪照片新生成、不恢復私人檔案、不把遲到圖自動切換為使用中的化身 |
| 未同意名片或任一方已終止，持舊照片 URL／猜 ID | 授權拒絕且不開始新的照片串流或資料揭露；不依 client 隱藏按鈕保護 |
| 修改 `occupation` 或替換／刪除照片，對方已合法交換名片 | 下一次有效授權查閱取最新欄位與照片，不沿用快照；已終止不得看到後續變更 |
| 不同帳號試讀照片或生成結果 | 拒絕並防止藉錯誤細節枚舉資產存在性 |
| 測試／正式登入已被撤銷而仍持舊畫面或在請求進行中 | 依 PlatformFoundation family／cv 驗證拒絕，不提交敏感照片上傳或選用結果到其他帳號 |

敏感日誌不得保存照片 base64、完整 EXIF、Gemini secret、原始人像、個人工作資料或內部完整 prompt；僅保存受控 opaque ID、非機密的圖片尺寸／耗時、狀態及失敗類別。前端不得自行持久化登入敏感資料。

## 10. 分層測試策略（已確認 SDD；BDD／TDD 已生成，待實作）

| 測試層級 | 最低必驗收場景 |
|---|---|
| Domain／Unit | 18歲生日邊界、職業與暱稱長度、0～5張真人照、免費選角無照可用、AI 最少2張、共16款目錄 ID、目前唯一化身、逐張1張才成功、最多4張成功候選、確認採用、超額／並發／失效拒絕、狀態轉移、CAS、標籤去重與名片白名單 |
| **共用圖片壓縮** | 真手機／Web 圖片、200,000 bytes 上限、不放大與長寬比、EXIF/GPS 清除、色彩／方向、格式與像素限制、分段串流與失敗復原；**以非化身圖片再呼叫同一介面**，證明沒有照片業務耦合 |
| D1 Integration | **2張**新業務表＋原六張基礎表分離，24欄首欄 UUIDv7、FK／UNIQUE／CHECK、無 Trigger 的條件式 INSERT／零列回應（含並發第5／第6張）、受控 UPDATE 欄位白名單／狀態轉移拒絕、CAS、同 owner 限制、照片排序競態與 R2 失敗補償；**真 Miniflare D1** 驗證 SQL 而非 mock |
| R2／媒體整合 | 上傳時以共用服務驗證≤200 KB，不持久保存原圖、D1 byte_size 或 sha256；驗 R2 MIME／私有 key、照片刪除後不可讀、逐張短效候選及manifest到期／清理、選中1張轉正式資產而其餘0～3張不落 DB；本人管理與名片通道分離 |
| AI Provider | 逐張1張真結果／重複候選拒絕／失敗保留先前成功圖／時限／真人來源被刪／單張暫存清理；以安全 server secret 用真 Gemini **每請求只產1張**，驗可預覽、3:4、唯一性與成本／延遲；4張滿額禁止第5張，不得假稱同步出4張，也不得自動重送不確定供應商請求 |
| API／Security | 每個端點正常與錯誤、400／401／404／409／413／429／503、Web CSRF、Native Bearer、session revoked、跨 owner 猜測資產、圖片偽造格式及超額；產圖限流／同帳號併發排他／idempotency與採用二次確認，AI 鎖頭MVP不扣款，名片預覽不給他人 |
| Web／Android／iOS E2E | 帳號 A 選16款免費角色、維護真人照片、點AI鎖頭逐張生成1～4張、提前採用或回選、確認後採用1張、填寫工作與偏好；帳號 B 未同意無法讀取 A 照片；未來有效交換同意後讀最新工作／照片，修改即更新，終止後不得新增揭露。**下一份 SPEC 尚未實作時，只能先驗契約，不可假稱名片 E2E 已完成** |
| UX／恢復 | 重新登入、照片選擇取消、壓縮失敗、逐張中離頁／斷線保留已成功候選、超時狀態不確定禁止自動重送（不承諾 job 恢復）、重複提交防護、短效候選到期410、Loading／空狀態、409衝突、鍵盤／觸控／螢幕閱讀器與字體放大 |

已由 [BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md) 規劃 Happy Path、Error、Boundary、Alternative、`@frontend` UX；[TDD](../tdd/SPEC-001-AvatarAndPreferences-TDD.md) 逐場景追溯到測試 ID。這只是文件規劃，**不得將場景或測試標成已執行**；實作前 [RiskAudit](SPEC-001-AvatarAndPreferences-RiskAudit.md) 已於2026-11-01確認；2026-11-02 D-050 修訂後另需同步驗證逐張流程，未執行功能測試。

## 11. 本份可驗收條件（SDD 已核准，待 TDD 實作驗收）

| ID | 檢驗可觀察結果 |
|---|---|
| `AP-AC-001` | 個人頁維護0～5張本人照片；可新增／替換／排序／刪除，免費化身無照可用，AI 引用既有至少2張 |
| `AP-AC-002` | 真 AI 依本人多張已保存照片生成遊戲插畫化身，保留合理五官相似度；不得用原圖或 Fixture 偽裝 |
| `AP-AC-003` | **本輪逐張最多4張**：每次成功只能得到1張真 Gemini 圖並可立即預覽／採用；失敗不占成功張數且保留先前候選；任何先前有效候選可回選，最多4張後禁第5張；選用確認後只保存所選1張且關閉本輪，其餘候選僅60分鐘私人R2暫存，無D1 Job表 |
| `AP-AC-004` | 免費8款男性風格／8款女性風格，當前化身選用和切換於跨端／重登一致 |
| `AP-AC-005` | 本人修改暱稱、自介、個性標籤並保存；異常 Unicode／不合法值拒絕 |
| `AP-AC-006` | 目前選用遊戲化身（免費或生成）有供後續遊戲引用的安全契約，不能讀取來源真人照 |
| `AP-AC-007` | 真人照初期僅本人與授權 AI 工作可讀，不得經未同意的對方或公網 R2 URL 取得 |
| `AP-AC-008` | 無未來 MatchingSessions／AffectionAndFeedback 的授權，無法列舉他人遊戲角色／真人照片／生成結果 |
| `AP-AC-009` | 上傳只保存≤200 KB版本，去除 EXIF／GPS；偽造類型／超額／壓縮失敗不得保存 |
| `AP-AC-010` | 候選投影不含真人照、登入 Email、工作等名片私有欄位；名片投影不含憑證、精確生日、GPS 或個人分數 |
| `AP-AC-011` | 興趣目錄涵蓋五大需求類型，使用者可編修且無效／重複項不能通過 |
| `AP-AC-012` | 工作／職業、生活習慣、作息、價值觀與互動頻率可本人編修，供後續名片／配對讀取 |
| `AP-AC-013` | 期待年齡、地區與共同興趣權重可設定，後端驗證範圍及持久化 |
| `AP-AC-014` | 受信任的 MatchingSessions 可讀當前配對輸入；不能取得原型固定對象或跨帳號資料 |
| `AP-AC-015` | 名片來源是**當前**同一份本人資料，無第二套名片編輯／名片快照表 |
| `AP-AC-016` | 名片真人照只經同意後授權通道取得；原始人像與遊戲化身不混用，不公開永久可讀 URL |
| `AP-AC-017` | 存在16張真正不同的正式免費插畫資產，男性風格8、女性風格8，可跨分類選用，無需付費或照片；須與AI候選一致為3:4直式半身至腰部立繪、五官清楚且背景簡潔 |
| `AP-AC-018` | AI 鎖頭進入產圖頁，明示第三方 Gemini 照片用途；按「開始產生第1張」／「產生下一張」才送照片且每次僅生成1張，最多4張成功候選；點採用先跳確認「採用後結束本輪、未來正式付費上線後重生依方案收費（**MVP目前免費**）」；取消則繼續挑選，確認才正式儲存；不跳額外送照同意窗、不扣款 |
| `AP-AC-019` | 圖片共用壓縮可跨用途調用，預設 targetBytes=200,000，每張真實輸出≤目標且外觀合理，僅儲存R2壓縮版 |
| `AP-AC-020` | 照片上傳前確實顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」，並提供本人照片與名片預覽 |
| `AP-AC-021` | 未滿18歲無法完成交友資料設定；生日作內部年齡驗證、不公開精確生日，不假稱證件KYC |
| `AP-AC-022` | AI 結果符合 ADV 插畫風及3:4直式半身至腰部構圖，臉不可被裁切，並由授權真人樣本人工比較五官、臉型與髮型相似度，不以刻意失真作合格 |
| `AP-AC-023` | 有效名片同意能反映被查閱者**目前**工作／個人資料／真人照更新與刪除；無同意、跨輪或終止後不能新增揭露（實際同意流程後續整合驗證） |
| `AP-AC-024` | Gemini 透過 server secret 真實調用，不暴露金鑰到 client／Git；失敗、未取得當次單張或重複圖不以模擬結果冒充成功 |

**MVP→SDD 映射**：`AC-001-01..06`、`AC-002-01..03`、`AC-003-01..04` 及 `AC-020-02`／`AC-020-07` 在 §1.1 有責任回鏈。`US-020` 的25分入口、雙方同意及終止實作仍由後續 SPEC 負責。

## 12. 使用者決策回寫與 SDD 確認點

### 12.1 Q1～Q7 已依 2026-11-01 決定，不重問

| 原題 | 使用者已確認內容 | 本份落點 |
|---|---|---|
| Q1 Gemini／真 AI | 同意通用 provider；可用使用者既有配置／金鑰的 Gemini 真實驗證 | §4.2、§9.1，金鑰不寫入文件 |
| Q2 真人照保存 | 個人資料及名片的一環，經**共用壓縮至200 KB**保存，顯示指定提醒 | §4.1、§6、§8；不在生成後預設刪除 |
| Q3 名片資料 | 增加真人照與工作／職業 | §4.3、§4.4，雙方同意後看目前壓縮版 |
| Q4 資料版本 | **即時資料**、不要新增不必要的表 | §4.4、§8，沒有名片快照／名片表 |
| Q5 成年 | 同意18+、生日私人、無擅自要求KYC | §4.3、§9 |
| Q6 照片限制 | 每人上限5張、單張上傳8 MiB；**不需每次生成重上傳** | §4.1，AI使用現有多張 |
| Q7 畫風／相似度 | 插畫風下盡量保留本人五官，不應過度強調禁止擬真 | §4.2、§9、§11 |

### 12.2 新需求及使用者表名前綴決策已回寫

- AI 屬**未來付費**：本 MVP 顯示鎖頭、點擊即可完整真使用，**每次產1張、最多4張可提前採用／回選，採用確認預告未來付費（目前免費）**；正式付款與權益交由 MVP-003。
- **免費 16 款**：男性風格8、女性風格8；不需真人照片或付款，也不以本人性別限制所選類別。
- **即時名片**：包含當前工作／職業與經壓縮的真人照；必須經該輪雙方有效同意，沒有配對時快照。
- **D-045 使用者資料表命名**：所有本份使用者直屬表統一使用 `user_` 前綴；該決策保留，原三表數量已由 D-046 精簡，不修改既有認證與系統共用表。
- **D-046 同意方案 A 及移除欄位**：**取消 `user_avatar_generation_jobs`**、圖片 DB 欄位 `byte_size`／`sha256`，連同僅為 job 關聯而設的 `generation_job_id`／`result_index` 一併移除；改成兩表，本輪最多四張圖先短效私人 R2 暫存（每次1張，依D-050）、選1張才正式保存；同意不具持久 job 進度及斷線恢復保證。
- **D-047 不使用 SQL Trigger（2026-11-01）**：移除原本限制照片5張及防媒體歸屬／狀態變更的兩個 Trigger 設計；改為後端 Business Logic、單一 D1 條件式 INSERT 原子檢查上限，配合不可任意更新 owner/kind/key 的受控 UPDATE 與狀態轉換條件；保留 PK／FK／UNIQUE／CHECK 和真 D1 併發／競態驗證。此決策僅適用本份 AvatarAndPreferences 的新增表，不回溯改動已完成的 PlatformFoundation。
- **D-048／RQ-01=A（2026-11-01）**：產圖頁固定可見第三方 Gemini 照片用途提醒，本人按「開始產生第1張」／後續「產生下一張」才送照片，無二次跳窗／背景傳送或新同意資料表。
- **D-049／RQ-02=A（2026-11-01）**：免費16款與AI4張均為3:4直式半身至腰部插畫立繪，五官清楚、背景簡潔，禁止拉伸及裁掉臉。

### 12.3 2026-11-01 已確認之 SDD 設計細節

以下細節已隨使用者 2026-11-01「已確認 SDD，請繼續」一併核准；不重問 Q1～Q7 或已決定的 D-047：

| 細節 | 目前 SDD 建議 | 使用者可見差異 |
|---|---|---|
| S1 照片最低數 | 個人資料0～5張、免費化身無照可用、AI需已保存至少2張 | 可先用免費角色進遊戲，AI符合多張照片 |
| S2 壓縮尺寸 | **200 KB＝200,000 bytes 上限**，只存壓縮版 | 原始解析度可能損失少量細節，必須保持五官清晰 |
| S3 工作欄位 | 單一可空文字，暫定最多60字，不另外收集公司／部門 | 避免強制揭露雇主 |
| S4 表數量及命名 | **已確認 D-046／D-047：只新增2張 `user_` 表**（`user_profiles` 15欄、`user_media_assets` 9欄），不建 AI Jobs／名片／免費角色／快照／目錄表，**不使用 SQL Trigger** | 照片最多5張由後端與單一 D1 原子條件 INSERT 限制，其他媒體欄位由受控條件 UPDATE 保護；圖片大小與雜湊不進 D1；逐張最多四圖短效暫存，選一張後才正式保存 |
| S5 名片更新 | 已同意且該輪有效時每次讀最新欄位及照片，終止後不再揭露新增或修改 | 可避免過期資料／保存複本 |
| S6 Gemini 設定 | 實作時由使用者放入安全本地或 server secret | 不需在對話提供明碼金鑰 |

**SDD／RiskAudit 確認紀錄**：2026-11-01 使用者確認整份 SDD 後再次確認 RiskAudit RQ-01=A、RQ-02=A，授權補入14項稽核測試。BDD／TDD／RiskAudit 已同步、完成 Phase 5 [TDD 規劃交接紀錄](../tdd/SPEC-001-AvatarAndPreferences-TDD.md#規劃交接紀錄)：**Ready for well-done**。此狀態僅表示規劃可交給開發，未執行程式修改或測試；不得延伸到其他 SPEC。 **2026-11-02 追加D-050**：使用者同意逐張產圖，本份已更新 API／R2／BDD／TDD／風險與交接，取代「整批四張」的舊成功條件。

## 13. 相關文件與下一階段

- 需求來源：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)，最新業務決策 `D-036`～`D-050`，目前 20 個 US／68 條 AC。
- 基礎依賴：[SPEC-001-PlatformFoundation](SPEC-001-PlatformFoundation.md)、[現行平台 API 契約](../../overview/03-contracts/01-api-contracts.md)、[資料契約](../../overview/03-contracts/02-data-contracts.md)。
- 原型僅供視覺參考：[prototype.v2 AvatarScreen／ProfileScreen](../../prototypes/prototype.v2/app/screens.tsx)，其 Fixture 不作真 AI／真使用者／16款免費角色驗收。
- **現階段**：[BDD](../bdd/SPEC-001-AvatarAndPreferences-BDD.md)、[TDD](../tdd/SPEC-001-AvatarAndPreferences-TDD.md) 及 [RiskAudit](SPEC-001-AvatarAndPreferences-RiskAudit.md) 已於風險確認後補強並完成 **Ready for well-done** 規劃交接。後續本份實作改由 `well-done` 接手，本輪不修改產品程式或開始下一份 SPEC。
