# SPEC-001-AvatarAndPreferences — BDD 場景規格

> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)（US-001～003，US-020 的資料來源契約）
> **來源 SDD**：[SPEC-001-AvatarAndPreferences](../specs/SPEC-001-AvatarAndPreferences.md)（2026-11-01 使用者已確認，含 D-047 無 SQL Trigger）
> **生成日期**：2026-11-01
> **階段**：使用者已確認 SDD／RiskAudit（RQ-01=A、RQ-02=A），2026-11-02 D-050 修訂後規劃交接 Ready for well-done；73 個場景、13 個 @frontend，全部待開發／未驗收。

---

## 📝 Feature 描述

Feature：登入本人安全維護工作／偏好、私人真人照片及免費／AI 遊戲化身；本輪僅交付即時名片資料查詢與授權協作契約，不建立交換名片的邀請／雙方同意／計分路由。

**追溯慣例**：每個 `AP-BDD-###` 唯一且不可重編；標註 `AP-AC` 來源與 `MVP` 跨 SPEC 邊界。所有 `Then/And` 均為待實測的可觀察斷言，不代表目前產品已通過。D1 必須用真 Miniflare D1 驗證，保留兩張新 `user_` 表共 24 欄、**零個 SQL Trigger**；圖片壓縮及 AI 實際呼叫不可用 Fixture 冒充。

## 🎯 前端 UX 實作進度

```text
📦 AvatarAndPreferences 前端 UX
├─ 狀態：⏸️ 未開始
├─ 完整場景：0/13
└─ 進度：[░░░░░░░░░░░░░░░░░░░░] 0%
```

| 畫面／元件 | BDD 覆蓋 | 完整驗收 | 狀態 |
|---|---|---|---|
| PersonalPhotos 照片管理 | 照片空狀態／提示／上傳／排序／刪除 | 0 | 未開始 |
| FreeAvatarCatalog 化身選擇 | 16 款、跨分組、切換／記錄 | 0 | 未開始 |
| AvatarGenerationChoices | AI 鎖頭、Loading、4 選 1、故障 | 0 | 未開始 |
| DatingProfileForm | 資料設定、年齡、工作、偏好 | 0 | 未開始 |
| MyCardPreview／權限協作 | 本人預覽與跨帳號拒絕 | 0 | 未開始 |

## 📋 Background（前置條件）

```gherkin
Feature: AvatarAndPreferences 私人照片、化身與即時名片來源
  Background:
    Given A 與 B 為獨立有效帳號，除非另述，所有寫入必須使用已驗證的 CurrentUser 身分
    And 使用 PlatformFoundation 現有 Cookie／Bearer Session family 驗證與固定 prepared D1 commands
    And 圖片只可在私人 R2 以受限串流存取，個人真人照保存版小於等於200000 bytes
    And 新表僅有 user_profiles、user_media_assets，不建立 Trigger、AI Job、名片快照表
    And 測試使用可固定時鐘與故障注入，真 D1／真 R2／真 Gemini 需另具實際證據
```

| 角色 | 責任 |
|---|---|
| 本人（A） | 管理個人照、免費／AI 化身與基本資料 |
| 配對對象（B） | 在未授權時不得取得真人照、職業及其他名片私有欄位 |
| MatchingSessions（後續 SPEC） | 授權候選資料與配對輸入 |
| AffectionAndFeedback（後續 SPEC） | 同輪有效雙方同意後，方可呼叫名片與照片內部介面 |


---

## ✅ Happy Path — 正常流程

### @smoke @happy-path @critical @AP-BDD-001

- [ ] **Scenario: 照片是個人資料且顯示用途提醒**（`AP-BDD-001`）
  - **追溯**：AP-AC-001、AP-AC-020；SPEC §4～§8
  - **測試方法基名**：`PhotoPurposeNotice`

```gherkin
Scenario: AP-BDD-001 照片是個人資料且顯示用途提醒
  Given 本人已登入且目前沒有照片
  When 本人開啟照片管理並選擇上傳
  Then 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」
  And 並告知照片將在本人主動啟用 AI 時提供第三方生成服務
```

### @smoke @happy-path @critical @AP-BDD-002

- [ ] **Scenario: 上傳兩張真人照並保存壓縮版本**（`AP-BDD-002`）
  - **追溯**：AP-AC-001、AP-AC-009、AP-AC-019；SPEC §4～§8
  - **測試方法基名**：`PersonalPhotoUpload`

```gherkin
Scenario: AP-BDD-002 上傳兩張真人照並保存壓縮版本
  Given 本人選擇兩張有效圖片且單張不超過8 MiB
  When 本人依序上傳照片
  Then 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2
  And D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔
```

### @happy-path @critical @AP-BDD-003

- [ ] **Scenario: 重新排列本人照片**（`AP-BDD-003`）
  - **追溯**：AP-AC-001；SPEC §4～§8
  - **測試方法基名**：`PersonalPhotoReorder`

```gherkin
Scenario: AP-BDD-003 重新排列本人照片
  Given 本人已有三張 ready 個人照且持有目前 revision
  When 本人提交包含全部三張資產的全新順序
  Then 本人照片顯示順序依提交清單更新
  And 不產生額外照片及不改動其他帳號資料
```

### @happy-path @critical @AP-BDD-004

- [ ] **Scenario: 刪除照片後名片下次讀取反映刪除**（`AP-BDD-004`）
  - **追溯**：AP-AC-001、AP-AC-015、AP-AC-023；SPEC §4～§8
  - **測試方法基名**：`PersonalPhotoDelete`

```gherkin
Scenario: AP-BDD-004 刪除照片後名片下次讀取反映刪除
  Given 本人有一張 ready 照片且已授權的同輪名片讀取存在
  When 本人刪除該照片後對方再提出有效名片讀取
  Then 已刪照片不再列於即時名片且不能重新取得影像
  And 已刪照不作下次 AI 輸入並可排程清除 R2
```

### @smoke @happy-path @normal @AP-BDD-005

- [ ] **Scenario: 列出十六款真正不同的免費插畫角色**（`AP-BDD-005`）
  - **追溯**：AP-AC-004、AP-AC-017；SPEC §4～§8
  - **測試方法基名**：`BuiltinAvatarCatalog`

```gherkin
Scenario: AP-BDD-005 列出十六款真正不同的免費插畫角色
  Given 本人已登入
  When 本人開啟免費化身選擇清單
  Then 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪
  And 任何使用者都能跨風格分組自由選用且不要求照片，16張均為3:4直式半身至腰部、臉部清楚且背景簡潔
```

### @happy-path @normal @AP-BDD-006

- [ ] **Scenario: 選取免費角色並重新登入仍維持選用**（`AP-BDD-006`）
  - **追溯**：AP-AC-004、AP-AC-006；SPEC §4～§8
  - **測試方法基名**：`SelectBuiltinAvatar`

```gherkin
Scenario: AP-BDD-006 選取免費角色並重新登入仍維持選用
  Given 本人已取得合法 builtin ID 且 revision 最新
  When 本人選取免費角色並重新登入另一裝置
  Then 目前遊戲化身仍為相同的 builtin ID
  And 保留暱稱、職業與其他既有個人資料
```

### @smoke @happy-path @critical @AP-BDD-007

- [ ] **Scenario: 儲存個人資料與配對偏好**（`AP-BDD-007`）
  - **追溯**：AP-AC-005、AP-AC-012、AP-AC-013；SPEC §4～§8
  - **測試方法基名**：`SaveDatingProfile`

```gherkin
Scenario: AP-BDD-007 儲存個人資料與配對偏好
  Given 本人有最新 revision 及合法資料欄位
  When 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件
  Then 資料以 user_profiles 的固定 JSON 契約保存
  And 下次 GET 回傳同一目前版本且 revision 增加1
```

### @happy-path @critical @AP-BDD-008

- [ ] **Scenario: 完成成年個人資料設定**（`AP-BDD-008`）
  - **追溯**：AP-AC-021；SPEC §4～§8
  - **測試方法基名**：`AdultProfileReady`

```gherkin
Scenario: AP-BDD-008 完成成年個人資料設定
  Given 本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身
  When 本人儲存並重新讀取個人資料
  Then profileReady 為 true
  And 精確生日只供後端且不出現在他人投影
```

### @happy-path @normal @AP-BDD-009

- [ ] **Scenario: 興趣目錄與標籤可維護**（`AP-BDD-009`）
  - **追溯**：AP-AC-011；SPEC §4～§8
  - **測試方法基名**：`InterestCatalog`

```gherkin
Scenario: AP-BDD-009 興趣目錄與標籤可維護
  Given 版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗
  When 本人開啟目錄並儲存合法標籤
  Then 使用代碼而非 label 持久化三組興趣資料
  And 舊代碼停用後既存資料仍可辨識
```

### @happy-path @critical @AP-BDD-010

- [ ] **Scenario: 工作與生活描述成為即時名片來源**（`AP-BDD-010`）
  - **追溯**：AP-AC-012、AP-AC-015；SPEC §4～§8
  - **測試方法基名**：`CurrentCardProfile`

```gherkin
Scenario: AP-BDD-010 工作與生活描述成為即時名片來源
  Given 本人已填寫 occupation、生活習慣與價值觀
  When 受信任服務以有效同意內容讀取名片
  Then 回傳本人當前工作和生活描述
  And 不含私人擇偶條件或登入帳號秘密
```

### @happy-path @normal @AP-BDD-011

- [ ] **Scenario: 配對服務取得最小化偏好資料**（`AP-BDD-011`）
  - **追溯**：AP-AC-013、AP-AC-014；SPEC §4～§8
  - **測試方法基名**：`MatchingInputProjection`

```gherkin
Scenario: AP-BDD-011 配對服務取得最小化偏好資料
  Given 本人已保存合法年齡範圍、地區、興趣權重及標籤
  When 已授權的 MatchingSessions 服務要求配對輸入
  Then 只回傳目前配對演算法必需的欄位
  And 不回傳真人照、Email、原型固定候選或他人資料
```

### @happy-path @normal @AP-BDD-012

- [ ] **Scenario: 候選人物只有遊戲化身及有限公開資料**（`AP-BDD-012`）
  - **追溯**：AP-AC-007、AP-AC-008、AP-AC-010；SPEC §4～§8
  - **測試方法基名**：`CandidatePersonaProjection`

```gherkin
Scenario: AP-BDD-012 候選人物只有遊戲化身及有限公開資料
  Given 配對服務已對本輪候選完成授權
  When 呼叫取得候選人物投影
  Then 回傳當前選用化身與有限公開暱稱資訊
  And 不含真人照、occupation、生日、Email 或擇偶私有資料
```

### @happy-path @critical @AP-BDD-013

- [ ] **Scenario: 有效名片同意讀取當前真人照**（`AP-BDD-013`）
  - **追溯**：AP-AC-015、AP-AC-016、AP-AC-023；SPEC §4～§8
  - **測試方法基名**：`AuthorizedCardPhoto`

```gherkin
Scenario: AP-BDD-013 有效名片同意讀取當前真人照
  Given 同輪雙方已有效同意且互動未終止
  When 授權服務請求當前名片與受控照片串流
  Then 讀到最新 ready 照片的200KB壓縮版
  And 不產生任何名片快照或公開 R2 URL
```

### @happy-path @critical @AP-BDD-014

- [ ] **Scenario: 本人預覽將交換的即時名片**（`AP-BDD-014`）
  - **追溯**：AP-AC-020；SPEC §4～§8
  - **測試方法基名**：`MyCardPreview`

```gherkin
Scenario: AP-BDD-014 本人預覽將交換的即時名片
  Given 本人已填入工作、興趣與照片
  When 本人開啟我的名片預覽
  Then 顯示本人當前可分享的欄位與照片
  And 預覽權限不提供另一人讀取授權
```

### @smoke @happy-path @normal @AP-BDD-015

- [ ] **Scenario: AI 鎖頭首次只產生一張真結果（`AP-BDD-015`）
  - **追溯**：AP-AC-002、AP-AC-003、AP-AC-018；SPEC §4～§8
  - **測試方法基名**：`GenerateOneAvatar`

```gherkin
Scenario: AP-BDD-015 AI 鎖頭首次只產生一張真結果
  Given 本人已保存至少兩張 ready 真人照並已閱讀產圖頁第三方送照提醒
  When 本人按「開始產生第1張」
  Then 後端只呼叫本次一張 Gemini 並回傳一張真正可預覽的插畫，不要求一口氣取得四張
  And 回傳 attemptId、index=1、producedCount=1 及60分鐘到期資訊
```

### @smoke @happy-path @critical @AP-BDD-016

- [ ] **Scenario: 任選已成功候選只保存一張（`AP-BDD-016`）
  - **追溯**：AP-AC-003、AP-AC-006；SPEC §4～§8
  - **測試方法基名**：`SelectGeneratedAvatar`

```gherkin
Scenario: AP-BDD-016 任選已成功候選只保存一張
  Given 本人已依序成功產生三張私人 R2 候選且 revision 為最新
  When 本人回選第2張、看完採用警語後按「確認採用」
  Then 只有所選第2張正式寫入 user_media_assets 並更新目前遊戲化身，本輪隨即關閉
  And 其餘已成功兩張不建立正式媒體列，未確認前舊化身維持不變
```

### @happy-path @critical @AP-BDD-017

- [ ] **Scenario: 重新選用先前的正式生成化身**（`AP-BDD-017`）
  - **追溯**：AP-AC-003、AP-AC-004；SPEC §4～§8
  - **測試方法基名**：`ReselectGeneratedAvatar`

```gherkin
Scenario: AP-BDD-017 重新選用先前的正式生成化身
  Given 本人擁有先前成功選定且仍為 ready 的 generated_avatar
  When 本人切換至該正式 assetId
  Then 選用的 generated_avatar 被持久化為目前化身
  And 無需重新呼叫生成服務也不須新增圖片
```

### @happy-path @critical @AP-BDD-018

- [ ] **Scenario: 共用壓縮可被非化身圖片功能呼叫**（`AP-BDD-018`）
  - **追溯**：AP-AC-019；SPEC §4～§8
  - **測試方法基名**：`ReusableImageCompression`

```gherkin
Scenario: AP-BDD-018 共用壓縮可被非化身圖片功能呼叫
  Given 另一個服務提供符合介面契約的圖片 stream 與 targetBytes
  When 該服務呼叫同一 IImageCompressionService
  Then 得到正確 MIME、寬高及小於等於目標的壓縮輸出
  And 實作未依賴 avatar 名稱、R2 或照片數量規則
```

### @happy-path @critical @AP-BDD-019

- [ ] **Scenario: 使用 server secret 真正逐張呼叫 Gemini（`AP-BDD-019`）
  - **追溯**：AP-AC-024；SPEC §4～§8
  - **測試方法基名**：`GeminiLiveVerification`

```gherkin
Scenario: AP-BDD-019 使用 server secret 真正逐張呼叫 Gemini
  Given 測試環境以安全方式配置使用者授權的 Gemini API 憑證與真人照片
  When 本人明確要求單張生成，後端啟用真實 Gemini API
  Then 每次成功真正產出一張可預覽的3:4插畫並記錄非敏感的模型版本與耗時／用量證據
  And 客戶端、Git與日誌均不包含秘密或原始人像，未產出圖片不能假成功
```


---

## 🔀 Alternative Path — 替代流程

### @alternative-path @critical @AP-BDD-020

- [ ] **Scenario: 沒有照片可以先選免費化身**（`AP-BDD-020`）
  - **追溯**：AP-AC-001、AP-AC-004；SPEC §4
  - **測試方法基名**：`FreeWithoutPhotos`

```gherkin
Scenario: AP-BDD-020 沒有照片可以先選免費化身
  Given 本人沒有任何真人照片
  When 本人選取 male-03 或 female-07
  Then 可以成功選用免費角色並進入已具備條件的個人資料流程
  And 不觸發 Gemini、付費或強制照片欄位
```

### @alternative-path @critical @AP-BDD-021

- [ ] **Scenario: 照片不足時 AI 提供上傳引導**（`AP-BDD-021`）
  - **追溯**：AP-AC-001、AP-AC-018；SPEC §4
  - **測試方法基名**：`InsufficientSourcePhotos`

```gherkin
Scenario: AP-BDD-021 照片不足時 AI 提供上傳引導
  Given 本人只有0或1張 ready 真人照
  When 本人點擊 AI 鎖頭
  Then 顯示至少需要兩張已保存真人照的提示
  And 不發送 AI provider 請求也不改動目前化身
```

### @alternative-path @critical @AP-BDD-022

- [ ] **Scenario: 五張照片可刪除後補上新照片**（`AP-BDD-022`）
  - **追溯**：AP-AC-001；SPEC §4
  - **測試方法基名**：`ReplaceAtPhotoLimit`

```gherkin
Scenario: AP-BDD-022 五張照片可刪除後補上新照片
  Given 本人已持有五張 ready 真人照
  When 本人刪除一張後再上傳一張有效照片
  Then 新照片可占用釋放的第五個額度
  And 已刪照片不能復活或混入當前名片
```

### @alternative-path @critical @AP-BDD-023

- [ ] **Scenario: 本輪未採用仍保留既有化身（`AP-BDD-023`）
  - **追溯**：AP-AC-003；SPEC §4
  - **測試方法基名**：`AbandonGeneratedCandidates`

```gherkin
Scenario: AP-BDD-023 本輪未採用仍保留既有化身
  Given 本人已有當前免費角色與一至三張本輪已成功候選
  When 本人暫不採用並離開產圖畫面
  Then 目前遊戲化身保持不變且已成功候選在60分鐘效期內仍可由本人依參照安全預覽
  And 到期才拒絕讀取／清理，沒有正式資產、付款或自動產下一張
```

### @alternative-path @normal @AP-BDD-024

- [ ] **Scenario: 職業留空不阻擋基本設定**（`AP-BDD-024`）
  - **追溯**：AP-AC-005、AP-AC-012；SPEC §4
  - **測試方法基名**：`OptionalOccupation`

```gherkin
Scenario: AP-BDD-024 職業留空不阻擋基本設定
  Given 本人已有成年生日、暱稱及合法角色
  When 本人將 occupation 設為 null
  Then 可成功保存並完成最小設定
  And 名片不會憑空顯示虛構職業
```

### @alternative-path @normal @AP-BDD-025

- [ ] **Scenario: 過期本輪可以重新開始逐張產圖（`AP-BDD-025`）
  - **追溯**：AP-AC-003；SPEC §4
  - **測試方法基名**：`RetryExpiredAttempt`

```gherkin
Scenario: AP-BDD-025 過期本輪可以重新開始逐張產圖
  Given 本人的上次 attempt 已超過60分鐘
  When 本人在照片足夠時再次主動按「開始產生第1張」
  Then 建立新的獨立短效本輪、只請求一張，不恢復舊 provider 執行
  And 先前候選已失效且需提示重試可能有供應商成本，但本 MVP 不扣款
```

### @alternative-path @critical @AP-BDD-026

- [ ] **Scenario: 更新自介與照片後授權讀最新資料**（`AP-BDD-026`）
  - **追溯**：AP-AC-015、AP-AC-023；SPEC §4
  - **測試方法基名**：`LiveCardRefresh`

```gherkin
Scenario: AP-BDD-026 更新自介與照片後授權讀最新資料
  Given 有效名片交換後本人修改 occupation 與照片
  When 同輪對方在互動仍有效時重新讀取名片
  Then 只顯示新的 occupation 和現存 ready 照片
  And 不從配對當時或前次名片讀取快照
```

### @alternative-path @normal @AP-BDD-027

- [ ] **Scenario: 登入登出後個人資料保持一致**（`AP-BDD-027`）
  - **追溯**：AP-AC-014；SPEC §4
  - **測試方法基名**：`PersistAfterRelogin`

```gherkin
Scenario: AP-BDD-027 登入登出後個人資料保持一致
  Given 本人已儲存偏好及正式選用角色
  When 本人重新登入 Web 或原生裝置
  Then 讀取同一帳號最新個人資料、照片清單與化身
  And 不因 Session family 改變而重新產生使用者資料
```


---

## ❌ Error Handling — 錯誤流程

### @error-handling @critical @AP-BDD-028

- [ ] **Scenario: 超過8 MiB的原始照片必須拒絕**（`AP-BDD-028`）
  - **追溯**：AP-AC-009；SPEC §9.3
  - **測試方法基名**：`RejectOversizePhoto`

```gherkin
Scenario: AP-BDD-028 超過8 MiB的原始照片必須拒絕
  Given 本人選擇一張大於8 MiB的照片
  When 本人送出照片上傳
  Then 回傳413 IMAGE_TOO_LARGE
  And R2 不保存原始檔且 D1 不增加 ready 照片
```

### @error-handling @normal @AP-BDD-029

- [ ] **Scenario: 偽造 MIME 或毀損圖片拒絕**（`AP-BDD-029`）
  - **追溯**：AP-AC-009；SPEC §9.3
  - **測試方法基名**：`RejectForgedImage`

```gherkin
Scenario: AP-BDD-029 偽造 MIME 或毀損圖片拒絕
  Given 檔名為 .jpg 但內容不是可解碼影像
  When 本人嘗試上傳
  Then 回傳400 INVALID_IMAGE
  And 不得產生可讀的圖片資產或洩漏解碼例外
```

### @error-handling @normal @AP-BDD-030

- [ ] **Scenario: 圖片無法壓縮到200KB時拒絕**（`AP-BDD-030`）
  - **追溯**：AP-AC-009、AP-AC-019；SPEC §9.3
  - **測試方法基名**：`RejectUncompressibleImage`

```gherkin
Scenario: AP-BDD-030 圖片無法壓縮到200KB時拒絕
  Given 圖片經安全解碼仍無法在畫質限制內壓至200000 bytes
  When 本人上傳該圖片
  Then 回傳413 COMPRESSED_IMAGE_TOO_LARGE
  And 不改存未壓縮原檔，也不破壞已存照片
```

### @error-handling @critical @AP-BDD-031

- [ ] **Scenario: 照片數量上限拒絕第六張**（`AP-BDD-031`）
  - **追溯**：AP-AC-001；SPEC §9.3
  - **測試方法基名**：`RejectSixthPhoto`

```gherkin
Scenario: AP-BDD-031 照片數量上限拒絕第六張
  Given 本人已有五張 pending 或 ready 本人照
  When 本人再上傳第六張
  Then 回傳409 PHOTO_LIMIT_REACHED
  And 資料庫不得新增第六張或殘留可讀 R2 孤兒
```

### @error-handling @critical @AP-BDD-032

- [ ] **Scenario: 另一帳號不能讀取本人照片和 AI 圖片**（`AP-BDD-032`）
  - **追溯**：AP-AC-007、AP-AC-008；SPEC §9.3
  - **測試方法基名**：`RejectForeignMedia`

```gherkin
Scenario: AP-BDD-032 另一帳號不能讀取本人照片和 AI 圖片
  Given A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權
  When B 猜出 A 的 assetId 嘗試取得影像
  Then 伺服器以本人擁有權驗證拒絕存取
  And 不公開圖片存在性、R2 objectKey 或持久 URL
```

### @error-handling @normal @AP-BDD-033

- [ ] **Scenario: 登入已撤銷不得存取私人媒體**（`AP-BDD-033`）
  - **追溯**：AP-AC-007；SPEC §9.3
  - **測試方法基名**：`RejectRevokedSession`

```gherkin
Scenario: AP-BDD-033 登入已撤銷不得存取私人媒體
  Given 本人舊 Session family 已被新登入撤銷
  When 舊憑證請求照片或選用化身
  Then 回傳401 SESSION_REVOKED
  And 不得把舊請求寫入任何帳號的資料
```

### @error-handling @normal @AP-BDD-034

- [ ] **Scenario: 當次沒有產出一張不得回報成功（`AP-BDD-034`）
  - **追溯**：AP-AC-003、AP-AC-024；SPEC §9.3
  - **測試方法基名**：`RejectPartialGeneration`

```gherkin
Scenario: AP-BDD-034 當次沒有產出一張不得回報成功
  Given 本輪已有兩張有效候選但這次 Gemini 沒有回傳可解碼圖片
  When 本人按「產生下一張」要求第3張
  Then 本次回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確失敗，producedCount 保持2
  And 既有兩張依舊可預覽／採用，不能刪掉、冒充第3張或自動重送
```

### @error-handling @critical @AP-BDD-035

- [ ] **Scenario: 與既有候選相同不得計入下一張（`AP-BDD-035`）
  - **追溯**：AP-AC-003、AP-AC-024；SPEC §9.3
  - **測試方法基名**：`RejectDuplicateGeneratedImages`

```gherkin
Scenario: AP-BDD-035 與既有候選相同不得計入下一張
  Given 本輪已有一張成功候選，provider 回傳 byte-identical 的圖片
  When 本人要求產生下一張，後端比對已有候選
  Then 這次不產生新的 index，也不增加 producedCount，提示可主動再試
  And 先前候選保持可選，禁止複製舊圖冒充新成果
```

### @error-handling @critical @AP-BDD-036

- [ ] **Scenario: 單張逾時或限額不污染舊化身及候選（`AP-BDD-036`）
  - **追溯**：AP-AC-003、AP-AC-018、AP-AC-024；SPEC §9.3
  - **測試方法基名**：`HandleGeminiFailure`

```gherkin
Scenario: AP-BDD-036 單張逾時或限額不污染舊化身及候選
  Given Gemini 不可用、限額不足或本張請求超時，且本輪已有一張成功候選
  When 本人要求第二張插畫
  Then 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；若供應商狀態不確定須顯示不可自動重送
  And 第一張候選仍有效、舊化身不變，沒有假圖或自動繼續產生
```

### @error-handling @normal @AP-BDD-037

- [ ] **Scenario: 過期候選不可讀或選用**（`AP-BDD-037`）
  - **追溯**：AP-AC-003；SPEC §9.3
  - **測試方法基名**：`RejectExpiredCandidate`

```gherkin
Scenario: AP-BDD-037 過期候選不可讀或選用
  Given attemptId 已超過60分鐘
  When 本人試圖預覽或選擇過期候選
  Then 預覽回410 AVATAR_CANDIDATE_EXPIRED
  And 不得新增正式媒體資產或改動目前化身
```

### @error-handling @normal @AP-BDD-038

- [ ] **Scenario: 候選與正式資產不能跨帳號選用**（`AP-BDD-038`）
  - **追溯**：AP-AC-003、AP-AC-006；SPEC §9.3
  - **測試方法基名**：`RejectForeignAvatarSelection`

```gherkin
Scenario: AP-BDD-038 候選與正式資產不能跨帳號選用
  Given B 持有 A 的 attemptId 或 generated assetId
  When B 試圖將該圖設為自己的角色
  Then 回傳404或400 INVALID_AVATAR_SELECTION
  And B 的目前角色及兩個帳號資產均維持原狀
```

### @error-handling @critical @AP-BDD-039

- [ ] **Scenario: R2 寫入失敗時補償 pending**（`AP-BDD-039`）
  - **追溯**：AP-AC-001；SPEC §9.3
  - **測試方法基名**：`CompensateFailedPhotoStorage`

```gherkin
Scenario: AP-BDD-039 R2 寫入失敗時補償 pending
  Given 照片在 D1 成功占位但 R2 上傳失敗
  When 後端執行失敗補償
  Then 本人該筆 pending 標記 deleted 且不可對外顯示
  And 不洩漏未壓縮 bytes，重試可正常占用額度
```

### @error-handling @normal @AP-BDD-040

- [ ] **Scenario: 生成化身正式化失敗要補償**（`AP-BDD-040`）
  - **追溯**：AP-AC-003；SPEC §9.3
  - **測試方法基名**：`CompensateFailedAvatarSelection`

```gherkin
Scenario: AP-BDD-040 生成化身正式化失敗要補償
  Given 候選圖已複製到正式 R2 但 D1 CAS 失敗
  When 後端執行補償
  Then 標記失敗的正式媒體列 deleted 並清除 R2 孤兒
  And 目前原化身仍有效且其他候選不持久化
```

### @error-handling @critical @AP-BDD-041

- [ ] **Scenario: 不合法個人資料 JSON 與代碼被拒絕**（`AP-BDD-041`）
  - **追溯**：AP-AC-005、AP-AC-013；SPEC §9.3
  - **測試方法基名**：`RejectInvalidProfilePayload`

```gherkin
Scenario: AP-BDD-041 不合法個人資料 JSON 與代碼被拒絕
  Given 本人送未知鍵、非法年齡範圍或非法標籤代碼
  When 本人更新個人資料
  Then 回傳400 INVALID_PROFILE
  And revision、JSON 內容及其他資料保持原值
```

### @error-handling @critical @AP-BDD-042

- [ ] **Scenario: 未成年不能啟用交友功能**（`AP-BDD-042`）
  - **追溯**：AP-AC-021；SPEC §9.3
  - **測試方法基名**：`RejectUnderageProfile`

```gherkin
Scenario: AP-BDD-042 未成年不能啟用交友功能
  Given 本人輸入未滿18歲的有效生日
  When 本人嘗試完成個人資料設定
  Then profileReady 為 false 且交友入口被阻擋
  And 不得把尚未完成成年驗證當作已成年
```

### @error-handling @critical @AP-BDD-043

- [ ] **Scenario: 沒有雙方同意不能讀對方名片照**（`AP-BDD-043`）
  - **追溯**：AP-AC-016、AP-AC-023；SPEC §9.3
  - **測試方法基名**：`RejectUnconsentedCard`

```gherkin
Scenario: AP-BDD-043 沒有雙方同意不能讀對方名片照
  Given 雙方尚未完成同輪名片交換同意
  When B 試圖查閱 A 的名片與私人照
  Then 內部受控查詢拒絕
  And 即使知道對方 assetId 也不能經本人路由繞過
```

### @error-handling @critical @AP-BDD-044

- [ ] **Scenario: 互動終止或跨輪不能再讀更新資料**（`AP-BDD-044`）
  - **追溯**：AP-AC-016、AP-AC-023；SPEC §9.3
  - **測試方法基名**：`RejectTerminatedCard`

```gherkin
Scenario: AP-BDD-044 互動終止或跨輪不能再讀更新資料
  Given A、B 曾同意名片但該輪已終止或 B 換成另一輪
  When B 請求 A 的新資料或新照片
  Then 授權服務拒絕新讀取
  And 先前見過的影像不能因此生成新的永久授權 URL
```

### @error-handling @critical @AP-BDD-045

- [ ] **Scenario: 個人資料版本過期不得覆寫**（`AP-BDD-045`）
  - **追溯**：AP-AC-005；SPEC §9.3
  - **測試方法基名**：`RejectStaleProfileRevision`

```gherkin
Scenario: AP-BDD-045 個人資料版本過期不得覆寫
  Given 本人同時開啟兩個版本相同的編輯頁
  When 第一頁成功更新後第二頁儲存舊 expectedRevision
  Then 第二頁回409 PROFILE_VERSION_CONFLICT
  And 第一頁更新保留且前端提示重新載入
```

### @error-handling @critical @AP-BDD-046

- [ ] **Scenario: 照片排序不得夾帶他人或漏掉ID**（`AP-BDD-046`）
  - **追溯**：AP-AC-001；SPEC §9.3
  - **測試方法基名**：`RejectInvalidPhotoOrder`

```gherkin
Scenario: AP-BDD-046 照片排序不得夾帶他人或漏掉ID
  Given 本人提供不完整、重複或含其他人的照片排序清單
  When 本人送出排序
  Then 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT
  And 所有原照片順序和 revision 保持不變
```


---

## 🔲 Boundary Conditions — 邊界／並發

### @edge-case @critical @AP-BDD-047

- [ ] **Scenario: D1 無 Trigger 的第五第六張並發上傳**（`AP-BDD-047`）
  - **追溯**：AP-AC-001；SPEC §8.2～8.5
  - **測試方法基名**：`AtomicFifthSixthInsert`

```gherkin
Scenario: AP-BDD-047 D1 無 Trigger 的第五第六張並發上傳
  Given 本人已有四張 pending 或 ready 真人照
  When 兩個來源同時向同一 D1 執行受控條件 INSERT
  Then 最多一筆新增成功且最終有效數量恰為5
  And 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED
```

### @edge-case @normal @AP-BDD-048

- [ ] **Scenario: pending 預留名額不得被並發繞過**（`AP-BDD-048`）
  - **追溯**：AP-AC-001；SPEC §8.2～8.5
  - **測試方法基名**：`PendingReservationCounts`

```gherkin
Scenario: AP-BDD-048 pending 預留名額不得被並發繞過
  Given 本人有四張 ready 及一張 pending 真人照
  When 另外一個請求嘗試上傳
  Then 單一條件 INSERT 不得新增第六筆 pending
  And pending 超時由既有清理處理但不能靠清理才限制額度
```

### @edge-case @critical @AP-BDD-049

- [ ] **Scenario: 受控 UPDATE 不得更改 owner、key 或復活照片**（`AP-BDD-049`）
  - **追溯**：AP-AC-001、AP-AC-006；SPEC §8.2～8.5
  - **測試方法基名**：`ImmutableMediaIdentity`

```gherkin
Scenario: AP-BDD-049 受控 UPDATE 不得更改 owner、key 或復活照片
  Given 已存在一筆 deleted 媒體資產
  When 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready
  Then 平台拒絕非法欄位與狀態變化
  And 不使用 Trigger 且所有受控入口維持同一不變式
```

### @edge-case @normal @AP-BDD-050

- [ ] **Scenario: 暱稱 Unicode 與生日滿18歲界限**（`AP-BDD-050`）
  - **追溯**：AP-AC-005、AP-AC-021；SPEC §8.2～8.5
  - **測試方法基名**：`UnicodeAndAgeBoundary`

```gherkin
Scenario: AP-BDD-050 暱稱 Unicode 與生日滿18歲界限
  Given 測試時鐘固定在臺灣日期並準備邊界生日
  When 本人依序輸入剛滿18歲與差一天未滿18歲生日
  Then 僅剛滿18歲能使 profileReady 為 true
  And 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate
```

### @edge-case @normal @AP-BDD-051

- [ ] **Scenario: 固定 JSON 陣列與年齡範圍上下界**（`AP-BDD-051`）
  - **追溯**：AP-AC-011、AP-AC-013；SPEC §8.2～8.5
  - **測試方法基名**：`JsonPreferenceBoundaries`

```gherkin
Scenario: AP-BDD-051 固定 JSON 陣列與年齡範圍上下界
  Given 本人提供剛好上限的 traits、interest、topic、value 與 region 陣列
  When 本人儲存並接著測試重複及超上限元素
  Then 上限合法資料保存且重複、未知鍵、超限資料被拒絕
  And preferredAgeMin/Max 成對且18至120、Min不大於Max
```

### @edge-case @critical @AP-BDD-052

- [ ] **Scenario: 200000 bytes 精確邊界與分段串流**（`AP-BDD-052`）
  - **追溯**：AP-AC-019；SPEC §8.2～8.5
  - **測試方法基名**：`CompressionExactBoundary`

```gherkin
Scenario: AP-BDD-052 200000 bytes 精確邊界與分段串流
  Given 不同影像大小剛好等於200000 bytes並透過分段輸入
  When 共用壓縮服務處理輸入
  Then 成功輸出小於或等於200000 bytes
  And 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS
```

### @edge-case @normal @AP-BDD-053

- [ ] **Scenario: 只有實際產出的候選索引可讀（`AP-BDD-053`）
  - **追溯**：AP-AC-003；SPEC §8.2～8.5
  - **測試方法基名**：`CandidateIndexBoundary`

```gherkin
Scenario: AP-BDD-053 只有實際產出的候選索引可讀
  Given 本人持有尚未到期、只成功產出索引1與2的 attemptId
  When 本人請求索引0、3、5或他人 attemptId
  Then 僅實際存在且屬本人的1與2可讀，其餘索引拒絕
  And R2 key 從 server CurrentUser.accountId 推導，且最多容許索引4
```

### @edge-case @critical @AP-BDD-054

- [ ] **Scenario: 選用並發只更新一個當前化身**（`AP-BDD-054`）
  - **追溯**：AP-AC-003；SPEC §8.2～8.5
  - **測試方法基名**：`AvatarSelectionRace`

```gherkin
Scenario: AP-BDD-054 選用並發只更新一個當前化身
  Given 本人有兩個有效候選且同時送同一 expectedRevision
  When 兩個不同選用請求同時提交
  Then 只有一個 CAS 成功且 revision 增加1
  And 落敗的複製檔案被補償，最終唯一角色仍可讀
```

### @edge-case @critical @AP-BDD-055

- [ ] **Scenario: 已終止與授權讀取同時發生**（`AP-BDD-055`）
  - **追溯**：AP-AC-023；SPEC §8.2～8.5
  - **測試方法基名**：`CardTerminationRace`

```gherkin
Scenario: AP-BDD-055 已終止與授權讀取同時發生
  Given B 在同輪授權讀取 A 的照片之同時互動被終止
  When 後端準備開啟新的照片串流
  Then 必須在開啟時核對有效同意與互動狀態
  And 不得因以前有同意就取得新增照片或新內容
```

### @edge-case @critical @AP-BDD-056

- [ ] **Scenario: AI 記錄與前端打包均不含機密**（`AP-BDD-056`）
  - **追溯**：AP-AC-024；SPEC §8.2～8.5
  - **測試方法基名**：`SecretExposureBoundary`

```gherkin
Scenario: AP-BDD-056 AI 記錄與前端打包均不含機密
  Given Gemini server secret 與本人照片已配置於測試環境
  When 執行成功與故障生成、產出客戶端 bundle
  Then 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source
  And 僅留下去識別的驗證證據
```


---

## 🖥️ Frontend UX — 介面及無障礙

### @frontend @critical @AP-BDD-057

- [ ] **Scenario: 照片頁空狀態和指定用途提示**（`AP-BDD-057`）
  - **追溯**：AP-AC-001、AP-AC-020；SPEC §5.1／§7
  - **測試方法基名**：`PhotoScreenEmptyState`

```gherkin
Scenario: AP-BDD-057 照片頁空狀態和指定用途提示
  Given 本人進入沒有任何照片的個人資料頁
  When 畫面完成載入並按新增照片
  Then 呈現空狀態與完整用途提醒文案
  And 圖片選擇取消後不呼叫上傳 API 且不報成功
```

### @frontend @normal @AP-BDD-058

- [ ] **Scenario: 免費角色畫面載入與切換**（`AP-BDD-058`）
  - **追溯**：AP-AC-004、AP-AC-017；SPEC §5.1／§7
  - **測試方法基名**：`FreeAvatarPickerUi`

```gherkin
Scenario: AP-BDD-058 免費角色畫面載入與切換
  Given 本人進入免費角色清單
  When 瀏覽兩組各八種插畫並選一種
  Then 可辨識的16張3:4直式半身至腰部資產完整顯示，五官不被裁切或拉伸
  And 選中的角色與目前選用狀態正確顯示，畫框與AI候選構圖一致
```

### @frontend @critical @AP-BDD-059

- [ ] **Scenario: 相片上傳進度及錯誤提示**（`AP-BDD-059`）
  - **追溯**：AP-AC-001、AP-AC-009；SPEC §5.1／§7
  - **測試方法基名**：`PersonalPhotoUploadUi`

```gherkin
Scenario: AP-BDD-059 相片上傳進度及錯誤提示
  Given 本人在手機或 Web 選擇一張照片
  When 送出有效上傳或使用超額圖片
  Then 呈現上傳處理狀態與明確成功／失敗回饋
  And 失敗不假顯示已成功且可重新選圖
```

### @frontend @critical @AP-BDD-060

- [ ] **Scenario: 照片排序及刪除確認**（`AP-BDD-060`）
  - **追溯**：AP-AC-001；SPEC §5.1／§7
  - **測試方法基名**：`PhotoOrderDeleteUi`

```gherkin
Scenario: AP-BDD-060 照片排序及刪除確認
  Given 本人已有三張可見照片
  When 拖曳重排或選擇刪除
  Then 顯示新順序或明確刪除確認結果
  And 版本衝突需提示重新整理而非覆蓋新資料
```

### @frontend @normal @AP-BDD-061

- [ ] **Scenario: AI 鎖頭進入逐張產圖且 MVP 不收費（`AP-BDD-061`）
  - **追溯**：AP-AC-018；SPEC §5.1／§7
  - **測試方法基名**：`AiLockEntryUi`

```gherkin
Scenario: AP-BDD-061 AI 鎖頭進入逐張產圖且 MVP 不收費
  Given 本人已存兩張以上 ready 真人照
  When 點擊帶鎖頭的 AI 按鈕進入產圖頁
  Then 顯示風格選擇及醒目的第三方 Gemini 照片使用提醒，按「開始產生第1張」後才送出一張請求
  And 僅開頁不得呼叫 Gemini、無第二個送照同意跳窗、無付款／扣點；每張完成可採用或繼續
```

### @frontend @normal @AP-BDD-062

- [ ] **Scenario: 逐張 Loading 與重複點擊防護（`AP-BDD-062`）
  - **追溯**：AP-AC-003、AP-AC-018；SPEC §5.1／§7
  - **測試方法基名**：`AiGenerateLoadingUi`

```gherkin
Scenario: AP-BDD-062 逐張 Loading 與重複點擊防護
  Given 本人正產生本輪第2張且第1張已成功
  When 本人在兩個分頁快速重送同一 clientRequestId 或連點「產生下一張」
  Then 介面只顯示一個進行中請求，server 使用短效排他與冪等拒絕額外 Gemini 呼叫
  And 產生第二張成功才占下一個 index，出錯保留第1張且不自動重試
```

### @frontend @normal @AP-BDD-063

- [ ] **Scenario: 最多四張逐步比較後任選一張（`AP-BDD-063`）
  - **追溯**：AP-AC-003、AP-AC-022；SPEC §5.1／§7
  - **測試方法基名**：`AiFourChoicesUi`

```gherkin
Scenario: AP-BDD-063 最多四張逐步比較後任選一張
  Given 本人本輪依序成功取得四張3:4半身至腰部互異插畫候選
  When 本人回選第2張、看完採用確認並確定選用
  Then 清楚標示候選2並只將此張設為遊戲化身，四張畫框不裁切五官
  And 其餘三張不留永久資產，第四張後無法再要求第5張
```

### @frontend @normal @AP-BDD-064

- [ ] **Scenario: 單張失敗、候選過期與不確定計費的提示（`AP-BDD-064`）
  - **追溯**：AP-AC-003、AP-AC-024；SPEC §5.1／§7
  - **測試方法基名**：`AiFailureRecoveryUi`

```gherkin
Scenario: AP-BDD-064 單張失敗、候選過期與不確定計費的提示
  Given 當次 provider 逾時、回傳錯誤或本輪到期
  When 畫面收到503、429、409或410回應
  Then 提供可理解的錯誤、保留既有有效候選；不確定供應商成本的逾時不得自動重送
  And 不顯示假成功、舊化身不變，已到期候選不得再採用
```

### @frontend @critical @AP-BDD-065

- [ ] **Scenario: 個人資料表單驗證及空白職業**（`AP-BDD-065`）
  - **追溯**：AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021；SPEC §5.1／§7
  - **測試方法基名**：`DatingProfileFormUi`

```gherkin
Scenario: AP-BDD-065 個人資料表單驗證及空白職業
  Given 本人打開工作與偏好表單
  When 輸入合法工作或空白工作並儲存
  Then 前端顯示與後端一致的驗證結果和最新 revision
  And 未成年、非法年齡偏好和非法標籤具體提示
```

### @frontend @critical @AP-BDD-066

- [ ] **Scenario: 我的名片預覽提示分享範圍**（`AP-BDD-066`）
  - **追溯**：AP-AC-020、AP-AC-015；SPEC §5.1／§7
  - **測試方法基名**：`MyCardPreviewUi`

```gherkin
Scenario: AP-BDD-066 我的名片預覽提示分享範圍
  Given 本人有工作與私人照片
  When 點開自己的名片預覽
  Then 明確列出被同意後可分享的欄位及壓縮版照片
  And 不把本人預覽誤認為已授權對方查看
```

### @frontend @critical @AP-BDD-067

- [ ] **Scenario: 無同意時禁止直接跳到他人名片**（`AP-BDD-067`）
  - **追溯**：AP-AC-016、AP-AC-023；SPEC §5.1／§7
  - **測試方法基名**：`ConsentGateUi`

```gherkin
Scenario: AP-BDD-067 無同意時禁止直接跳到他人名片
  Given 候選配對尚未取得同輪有效雙方同意
  When 使用者嘗試從 UI 或猜 URL 查看對方真人照
  Then UI 不提供有效入口且後端回拒絕
  And 對方照片不得以公開 R2 圖址洩漏
```

### @frontend @critical @AP-BDD-068

- [ ] **Scenario: 手機／Web 重登與無障礙操作**（`AP-BDD-068`）
  - **追溯**：AP-AC-001、AP-AC-003、AP-AC-012；SPEC §5.1／§7
  - **測試方法基名**：`ProfileAccessibilityUi`

```gherkin
Scenario: AP-BDD-068 手機／Web 重登與無障礙操作
  Given 本人於 iOS、Android 或 Web 使用個人資料與選角
  When 使用鍵盤、螢幕閱讀器、字體放大並重新登入
  Then 表單與照片及化身選擇可操作且資料重讀一致
  And 不以原型 Fixture／舊照片快取遮蔽目前值
```

---


---

## 2026-11-02 D-050 逐張產圖新增場景（保留原68個ID）

### @happy-path @critical @AP-BDD-069

- [ ] **Scenario: 第一張滿意即可提前採用**（`AP-BDD-069`）
  - **追溯**：AP-AC-003、AP-AC-018；SPEC §4.2／§7／§8.4／§9
  - **測試方法基名**：`QuickAdoptFirstCandidate`

```gherkin
Scenario: AP-BDD-069 第一張滿意即可提前採用
  Given 本人已保存至少兩張 ready 個人照而尚未有本輪候選
  When 本人按「開始產生第1張」收到真圖後直接確認採用
  Then 只呼叫一次 Gemini 並將第1張正式選為遊戲化身、關閉本輪
  And 不額外產第2～4張、不增加 AI 用量，也不向目前 MVP 使用者收費
```

### @alternative-path @critical @AP-BDD-070

- [ ] **Scenario: 暫不採用可回選之前候選**（`AP-BDD-070`）
  - **追溯**：AP-AC-003；SPEC §4.2／§7／§8.4／§9
  - **測試方法基名**：`RevisitEarlierCandidate`

```gherkin
Scenario: AP-BDD-070 暫不採用可回選之前候選
  Given 本人在本輪第1張完成後選擇「產生下一張」，第2張也完成
  When 本人返回第1張並按「採用這張」且確認
  Then 第1張可在60分鐘內被選用，候選2不再永久保存
  And 前端只保留安全預覽參照，R2候選仍受 owner 與到期驗證
```

### @edge-case @critical @AP-BDD-071

- [ ] **Scenario: 跨頁同時請求不可多產或超出四張**（`AP-BDD-071`）
  - **追溯**：AP-AC-003、AP-AC-024；SPEC §4.2／§7／§8.4／§9
  - **測試方法基名**：`AtomicCandidateBudget`

```gherkin
Scenario: AP-BDD-071 跨頁同時請求不可多產或超出四張
  Given 本人已成功產出3張，且兩個分頁持有相同本輪 attemptId
  When 兩端同時送不同 clientRequestId 產生下一張並重送其中一筆
  Then 最多一筆真 Gemini 呼叫成功新增 index4，另一筆拒絕409並不得再產第5張
  And 重送同一 requestId 可冪等取回原結果，後端短效排他與 R2 CAS 實測通過
```

### @error-handling @critical @AP-BDD-072

- [ ] **Scenario: 單張逾時不自動再產及保留成功候選**（`AP-BDD-072`）
  - **追溯**：AP-AC-003、AP-AC-024；SPEC §4.2／§7／§8.4／§9
  - **測試方法基名**：`UncertainGenerationRetry`

```gherkin
Scenario: AP-BDD-072 單張逾時不自動再產及保留成功候選
  Given 本人本輪已有兩張成功候選，第3張 provider 請求逾時且第三方是否計費未知
  When 前端等待逾時回覆或刷新畫面
  Then 仍可重新讀取先前兩張，不自動發起重送，也不把第3張計入成功
  And 須明示重試可能再次產生供應商成本，使用者主動確認後且符合限流才能再請求
```

### @frontend @critical @AP-BDD-073

- [ ] **Scenario: 確認採用視窗與未來重新生成費用提示**（`AP-BDD-073`）
  - **追溯**：AP-AC-003、AP-AC-018；SPEC §4.2／§7／§8.4／§9
  - **測試方法基名**：`AdoptionConfirmationPaymentNoticeUi`

```gherkin
Scenario: AP-BDD-073 確認採用視窗與未來重新生成費用提示
  Given 本人有1～4張有效候選且當前 MVP 不收費
  When 本人對任一張按「採用這張」後先按「取消」，再重新開啟確認並按「確認採用」
  Then 視窗清楚寫明採用關閉本輪及未來正式付費上線後重新產圖依當時方案收費（目前免費），取消不寫入，確認才採用
  And 採用後不能再新增候選、不產生金流／扣款；其他候選不永久保留
```

## ⚠️ SPEC 補充／跨 SPEC 延後驗收

- `AP-AC-001`～`AP-AC-024` 均有對應場景。真實的配對成立、親密度25分入口、名片邀請／同意／拒絕及互動終止是 `SPEC-001-MatchingSessions`、`SPEC-001-AffectionAndFeedback` 與 `SPEC-001-StoryDialogueAndExit` 的責任；本文件只驗證本份的受限內部介面與故障注入，不將跨 SPEC 尚未實作的 E2E 標為通過。
- Gemini 真 API 成功4圖、200KB 真人照五官品質、16張**實際不同**插畫以及 Web／Android／iOS 互動都必須保留驗收證據，不能用原型／替身／歷史驗證取代。
- D-047 已確定**不使用 SQL Trigger**；所有上限及 immutable rule 以受控 SQL 條件／服務邏輯實作，需真 D1 競態證據。

## 🔗 相關文件

- [MVP](../requirements/MVP-001-LoveGameDatingApp.md)
- [SDD](../specs/SPEC-001-AvatarAndPreferences.md)
- [TDD](../tdd/SPEC-001-AvatarAndPreferences-TDD.md)
- [風險稽核](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md)

**狀態**：SDD 與 RiskAudit 已確認、風險決策 RQ-01=A／RQ-02=A 已回寫，規劃文件 Ready for well-done；73 個唯一 Scenario、13 個 @frontend；0 項完整驗收。
