# SPEC-001-AvatarAndPreferences — BDD 場景規格

> **2026-11-12 實作續記**：Story well-done 已接入 B1／R2 ready／透明壓縮的局部增量；完整新素材、雙平台與清測資未驗收，新項仍不批量勾選。跨 SPEC 證據及未完項見 [Story 同日紀錄](../verification/SPEC-001-StoryDialogueAndExit-Verification.md#2026-11-12-開發續接紀錄未結案)。

## 2026-11-12 最新全身角色 BDD 規劃進度（取代下方舊基線作為目前計算）

| 範圍 | 已完整覆核／總場景 | 狀態 |
|---|---:|---|
| 原本 `AP-BDD-001～073` | **73/73** | 原 Web／Android、AI半身等歷史驗收結果保留，不代表新版全身已通過 |
| **本次新增 `AP-BDD-074～097`** | **0/24** | 原畫只延伸下半身、AI首次全身、B1五表情、R2 Manifest、CLEAN-RESET，全部未實作／未驗收 |
| **AvatarAndPreferences 本身 BDD** | **73/97（75.3%）** | 原場景73＋新場景24；新要求不得借用舊證據 |
| 後續跨 SPEC 正向授權整合 | **0/8** | 歸屬 Matching／Story／Affection，與本次新增24場景是不同範圍 |
| **全部規劃含後續整合** | **73/105（69.5%）** | 新場景24＋原跨SPEC延後8，均不列Passed |

**新增規劃**：AP-AC-017／018／022／025／026 ↔ AP-BDD-074～097（24個唯一ID）↔ [新增120項TDD](../tdd/SPEC-001-AvatarAndPreferences-TDD.md)；每個新 Gherkin 場景有3 Unit＋1 Integration＋1 API／E2E。原 `AP-PC-001～008` 八組 D-053 驗證仍為獨立粒度，不與這 97個 BDD 場景重複加總。已確認 `D-049` 半身構圖由 2026-11-12 全身方案取代，原列 [x] 是歷史版證據，**不適用新 Gate B**。iOS與無障礙依 D-051／052 已明確排除本期，非「漏測卻算通過」。

## 需求總進度（2026-11-05；歷史範圍）

| 範圍 | 完整覆核／總數 | 完成率 | 說明 |
|---|---:|---:|---|
| **目前Web／Android需求合計** | **73/73** | **100%** | 原範圍65＋D-053新增8；不是整個遊戲MVP完成率 |
| 原有BDD範圍 | 65/65 | 100% | 原73場景中，8項跨SPEC正向授權整合另列 |
| D-053新增 AP-PC-001～008 | 8/8 | 100% | 新欄位、化身限制、分享設定、編輯與獨立名片流程 |
| **全部已規劃BDD（含後續整合）** | **73/81** | **90.1%** | 73原場景＋8新增；剩餘8項後續SPEC整合未驗收 |
| 原有前端UX：Web／Android | 13/13 | 100% | 新流程另見AP-PC-003～008 |

分母納入本次新增需求；暫緩／後續整合不記為通過。TDD原275個ID及新增8組分開統計，詳見[TDD總表](../tdd/SPEC-001-AvatarAndPreferences-TDD.md#需求總進度2026-11-05)；逐平台與最後兩項共用UI修正的重驗邊界見[最新驗證紀錄](../verification/SPEC-001-AvatarAndPreferences-Verification.md#2026-11-05-d-053-個人資料化身獨立名片修訂)。iOS暫緩，無障礙專項不在目前範圍。

## 2026-11-05 D-053 追加場景（8/8完整覆核）

| ID | Given／When／Then | 實作與驗證 |
|---|---|---|
| AP-PC-001 | 舊帳號升級0003後資料保留，三欄為NULL／[]／{}，Foundation不變且零Trigger | migration、avatar-preferences-d1.integration.test.ts |
| AP-PC-002 | 非法性別、重複性向或分享未知／私有鍵，儲存拒絕且無部分變更；未填仍可存但未完成 | ProfileUpdateInput、D1／Application測試 |
| AP-PC-003 | 已存男／女／多元時，只能選8／8／16款；未存性別先提示；改性別同時清不符免費化身，AI保留 | AvatarService、commands、DatingProfileScreen |
| AP-PC-004 | 關閉分享後名片完全省略欄位與照片；性別／性向／新欄位預設關閉，配對投影仍保留性別／性向 | ProfileProjections、CardDisplay、Web請求觀測 |
| AP-PC-005 | 修改表單或開關後頂端出現儲存，恢復原值則隱藏，無底部儲存或更新鈕 | profile-fields、DatingProfileScreen及client測試 |
| AP-PC-006 | 預覽有草稿先存再重讀再開獨立頁；無修改直接開，409／不明／讀取失敗留原頁不重送 | client／Web測試 |
| AP-PC-007 | 下拉更新與返回遇草稿先確認，取消保留，捨棄才更新／離開；無上一頁回帳號 | client／Web／Android流程 |
| AP-PC-008 | 每次進入唯讀名片重讀，820px切換分欄／單欄，可捲動且照片保比例；重新登入保留設定 | CardPreviewScreen、Web／Android流程 |

本次8組均已完整覆核，與原範圍65組合計73/73；逐平台結果依Verification同日章節。本次有獨立證據，不以歷史通過數擴推新增場景。


> **來源 MVP**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)（US-001～003，US-020 的資料來源契約）
> **來源 SDD**：[SPEC-001-AvatarAndPreferences](../specs/SPEC-001-AvatarAndPreferences.md)（2026-11-01 使用者已確認，含 D-047 無 SQL Trigger）
> **生成日期**：2026-11-01
> **階段**：2026-11-05 D-053完成本地範圍，原73＋新增8共81個場景；目前責任範圍73/73，另8項後續SPEC整合未驗收。原13個@frontend已按Web／Android覆核，iOS暫緩、無障礙不在範圍。使用者先前確認的SDD／RiskAudit（RQ-01=A、RQ-02=A）保留。

---

### 2026-11-04 本輪驗收範圍調整

使用者最新決策：無障礙專項設計、實作及驗收不納入目前整個遊戲MVP範圍（D-051），不列待補、不作完成阻擋；iOS開發／驗收則依D-052暫緩。原始規劃及歷史證據保留，不將排除或暫緩改記通過；原始275項的覆核比例不是調整範圍後的完成率，Web／Android其餘功能與故障斷言仍須逐項驗證。

「跨SPEC授權」指後續MatchingSessions的輪次／參與者、AffectionAndFeedback的雙方名片同意，以及StoryDialogueAndExit的終止狀態整合。本份依已確認SPEC只交付資料契約、分享欄位白名單及私人媒體界線；目前本人可管理／預覽，他人讀取預設拒絕。後續模組完成後再驗同輪有效同意可讀、跨輪／終止拒絕的新讀取；這項後續整合不要求在本份先實作其他SPEC。

**本輪Web／Android BDD**：65/65個範圍內場景完整覆核；UX 13/13；後續SPEC正向整合8項另列，iOS暫緩、無障礙不在範圍。

## 📝 Feature 描述

Feature：登入本人安全維護工作／偏好、私人真人照片及免費／AI 遊戲化身；本輪僅交付即時名片資料查詢與授權協作契約，不建立交換名片的邀請／雙方同意／計分路由。

**追溯慣例**：每個 `AP-BDD-###` 唯一且不可重編；D-053另用`AP-PC-###`。標註 `AP-AC` 來源與 `MVP` 跨 SPEC 邊界。所有 `Then/And` 均為可觀察斷言，通過與範圍以本輪追溯索引的逐項證據為準。D1 必須用真 Miniflare D1 驗證，兩張業務表現為27欄（0002歷史24欄、0003追加3欄）、**零個 SQL Trigger**；圖片壓縮及 AI 實際呼叫不可用 Fixture 冒充。

## 🎯 前端 UX 實作進度

```text
📦 AvatarAndPreferences 前端 UX
├─ 狀態：🟢 Web／Android範圍完整覆核
├─ 當前範圍：Web／Android；iOS暫緩、無障礙不在範圍
└─ 完整場景：本輪65/65，UX 13/13；後續SPEC正向整合8項另列
```

| 畫面／元件 | BDD 覆蓋 | 完整驗收 | 狀態 |
|---|---|---|---|
| PersonalPhotos 照片管理 | 照片空狀態／提示／上傳／排序／刪除 | Web／Android通過 | 本輪功能矩陣已覆核 |
| FreeAvatarCatalog 化身選擇 | 16 款、跨分組、切換／記錄 | Web／Android通過 | 本輪功能矩陣已覆核 |
| AvatarGenerationChoices | AI 鎖頭、Loading、4 選 1、故障 | Web／Android通過 | 本輪功能矩陣已覆核 |
| DatingProfileForm | 資料設定、年齡、工作、偏好 | Web／Android通過 | 本輪功能矩陣已覆核 |
| MyCardPreview／權限協作 | 本人預覽與跨帳號拒絕 | Web／Android通過 | 本輪功能矩陣已覆核 |

## 2026-11-04 現況與證據

正式前端為 `frontend/client/src/DatingProfileScreen.tsx` 與 `app/profile.tsx`，已包含13個UX範圍；16款真正式圖、私人照片、名片預覽、資料／生活／擇偶條件、AI逐張與比較採用。使用者確認第三版AI相似度及prototype風格方向；Web真生成「先取消、再採用」通過，且只送一次生成。固定手機導覽與儲存已補。

Web基本／照片／表單／重登／跨帳號拒絕6/6；受控錯誤與到期6/6；既有真Gemini單張採用與本輪真四張流程分別通過，四張同時驗第2／第4張跨分頁競爭、冪等重播、滿額拒絕及回選第2張。Android API31專用QA：16圖與跨組選取、空picker取消、超8MiB後重試／五張名額回收、排序及revision衝突／刪除、表單及實際UI重登、兩帳號私人媒體拒絕與七種受控故障均整輪通過；真Gemini單張及四候選也有獨立完整證據。當前BDD 65/65、UX 13/13；其餘8項正向跨SPEC授權整合另列，iOS依D-052暫緩，無障礙依D-051不在目前整個MVP範圍。沒有用Web替代Android或宣稱iOS通過。分環境結果、歷史失敗與證據見[驗證紀錄](../verification/SPEC-001-AvatarAndPreferences-Verification.md)、[逐ID索引](../verification/SPEC-001-AvatarAndPreferences-Traceability.md)。

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

- [x] **Scenario: 照片是個人資料且顯示用途提醒**（`AP-BDD-001`）
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

- [x] **Scenario: 上傳兩張真人照並保存壓縮版本**（`AP-BDD-002`）
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

- [x] **Scenario: 重新排列本人照片**（`AP-BDD-003`）
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

- [x] **Scenario: 列出十六款真正不同的免費插畫角色**（`AP-BDD-005`）
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

- [x] **Scenario: 選取免費角色並重新登入仍維持選用**（`AP-BDD-006`）
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

- [x] **Scenario: 儲存個人資料與配對偏好**（`AP-BDD-007`）
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

- [x] **Scenario: 完成成年個人資料設定**（`AP-BDD-008`）
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

- [x] **Scenario: 興趣目錄與標籤可維護**（`AP-BDD-009`）
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

- [x] **Scenario: 本人預覽將交換的即時名片**（`AP-BDD-014`）
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

- [x] **Scenario: AI 鎖頭首次只產生一張真結果（`AP-BDD-015`）
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

- [x] **Scenario: 任選已成功候選只保存一張（`AP-BDD-016`）
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

- [x] **Scenario: 重新選用先前的正式生成化身**（`AP-BDD-017`）
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

- [x] **Scenario: 共用壓縮可被非化身圖片功能呼叫**（`AP-BDD-018`）
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

- [x] **Scenario: 使用 server secret 真正逐張呼叫 Gemini（`AP-BDD-019`）
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

- [x] **Scenario: 沒有照片可以先選免費化身**（`AP-BDD-020`）
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

- [x] **Scenario: 照片不足時 AI 提供上傳引導**（`AP-BDD-021`）
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

- [x] **Scenario: 五張照片可刪除後補上新照片**（`AP-BDD-022`）
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

- [x] **Scenario: 本輪未採用仍保留既有化身（`AP-BDD-023`）
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

- [x] **Scenario: 職業留空不阻擋基本設定**（`AP-BDD-024`）
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

- [x] **Scenario: 過期本輪可以重新開始逐張產圖（`AP-BDD-025`）
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

- [x] **Scenario: 登入登出後個人資料保持一致**（`AP-BDD-027`）
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

- [x] **Scenario: 超過8 MiB的原始照片必須拒絕**（`AP-BDD-028`）
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

- [x] **Scenario: 偽造 MIME 或毀損圖片拒絕**（`AP-BDD-029`）
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

- [x] **Scenario: 圖片無法壓縮到200KB時拒絕**（`AP-BDD-030`）
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

- [x] **Scenario: 照片數量上限拒絕第六張**（`AP-BDD-031`）
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

- [x] **Scenario: 另一帳號不能讀取本人照片和 AI 圖片**（`AP-BDD-032`）
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

- [x] **Scenario: 登入已撤銷不得存取私人媒體**（`AP-BDD-033`）
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

- [x] **Scenario: 當次沒有產出一張不得回報成功（`AP-BDD-034`）
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

- [x] **Scenario: 與既有候選相同不得計入下一張（`AP-BDD-035`）
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

- [x] **Scenario: 單張逾時或限額不污染舊化身及候選（`AP-BDD-036`）
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

- [x] **Scenario: 過期候選不可讀或選用**（`AP-BDD-037`）
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

- [x] **Scenario: 候選與正式資產不能跨帳號選用**（`AP-BDD-038`）
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

- [x] **Scenario: R2 寫入失敗時補償 pending**（`AP-BDD-039`）
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

- [x] **Scenario: 生成化身正式化失敗要補償**（`AP-BDD-040`）
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

- [x] **Scenario: 不合法個人資料 JSON 與代碼被拒絕**（`AP-BDD-041`）
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

- [x] **Scenario: 未成年不能啟用交友功能**（`AP-BDD-042`）
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

- [x] **Scenario: 沒有雙方同意不能讀對方名片照**（`AP-BDD-043`）
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

- [x] **Scenario: 個人資料版本過期不得覆寫**（`AP-BDD-045`）
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

- [x] **Scenario: 照片排序不得夾帶他人或漏掉ID**（`AP-BDD-046`）
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

- [x] **Scenario: D1 無 Trigger 的第五第六張並發上傳**（`AP-BDD-047`）
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

- [x] **Scenario: pending 預留名額不得被並發繞過**（`AP-BDD-048`）
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

- [x] **Scenario: 受控 UPDATE 不得更改 owner、key 或復活照片**（`AP-BDD-049`）
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

- [x] **Scenario: 暱稱 Unicode 與生日滿18歲界限**（`AP-BDD-050`）
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

- [x] **Scenario: 固定 JSON 陣列與年齡範圍上下界**（`AP-BDD-051`）
  - **追溯**：AP-AC-011、AP-AC-013；SPEC §8.2～8.5
  - **測試方法基名**：`JsonPreferenceBoundaries`

```gherkin
Scenario: AP-BDD-051 固定 JSON 陣列與年齡範圍上下界
  Given 本人提供各組可達的合法最大選取數（取欄位上限與目前目錄數的較小值；topic 上限仍為8、現有6碼）的 traits、interest、topic、value 與 region 陣列
  When 本人儲存並接著測試重複及超上限元素
  Then 上限合法資料保存且重複、未知鍵、超限資料被拒絕
  And preferredAgeMin/Max 成對且18至120、Min不大於Max
```

### @edge-case @critical @AP-BDD-052

- [x] **Scenario: 200000 bytes 精確邊界與分段串流**（`AP-BDD-052`）
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

- [x] **Scenario: 只有實際產出的候選索引可讀（`AP-BDD-053`）
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

- [x] **Scenario: 選用並發只更新一個當前化身**（`AP-BDD-054`）
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

- [x] **Scenario: AI 記錄與前端打包均不含機密**（`AP-BDD-056`）
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

## 🖥️ Frontend UX — 介面操作

### @frontend @critical @AP-BDD-057

- [x] **Scenario: 照片頁空狀態和指定用途提示**（`AP-BDD-057`）
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

- [x] **Scenario: 免費角色畫面載入與切換**（`AP-BDD-058`）
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

- [x] **Scenario: 相片上傳進度及錯誤提示**（`AP-BDD-059`）
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

- [x] **Scenario: 照片排序及刪除確認**（`AP-BDD-060`）
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

- [x] **Scenario: AI 鎖頭進入逐張產圖且 MVP 不收費（`AP-BDD-061`）
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

- [x] **Scenario: 逐張 Loading 與重複點擊防護（`AP-BDD-062`）
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

- [x] **Scenario: 最多四張逐步比較後任選一張（`AP-BDD-063`）
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

- [x] **Scenario: 單張失敗、候選過期與不確定計費的提示（`AP-BDD-064`）
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

- [x] **Scenario: 個人資料表單驗證及空白職業**（`AP-BDD-065`）
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

- [x] **Scenario: 我的名片預覽提示分享範圍**（`AP-BDD-066`）
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

- [x] **Scenario: 無同意時禁止直接跳到他人名片**（`AP-BDD-067`）
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

- [x] **Scenario: 手機／Web 重登與資料一致性**（`AP-BDD-068`）
  - **追溯**：AP-AC-001、AP-AC-003、AP-AC-012；SPEC §5.1／§7
  - **測試方法基名**：`ProfileReloginConsistencyUi`

```gherkin
Scenario: AP-BDD-068 手機／Web 重登與資料一致性
  Given 本人於 iOS、Android 或 Web 使用個人資料與選角
  When 完成表單與選角操作並重新登入
  Then 表單與照片及化身選擇可操作且資料重讀一致
  And 不以原型 Fixture／舊照片快取遮蔽目前值
```

---


---

## 2026-11-02 D-050 逐張產圖新增場景（保留原68個ID）

### @happy-path @critical @AP-BDD-069

- [x] **Scenario: 第一張滿意即可提前採用**（`AP-BDD-069`）
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

- [x] **Scenario: 暫不採用可回選之前候選**（`AP-BDD-070`）
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

- [x] **Scenario: 跨頁同時請求不可多產或超出四張**（`AP-BDD-071`）
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

- [x] **Scenario: 單張逾時不自動再產及保留成功候選**（`AP-BDD-072`）
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

- [x] **Scenario: 確認採用視窗與未來重新生成費用提示**（`AP-BDD-073`）
  - **追溯**：AP-AC-003、AP-AC-018；SPEC §4.2／§7／§8.4／§9
  - **測試方法基名**：`AdoptionConfirmationPaymentNoticeUi`

```gherkin
Scenario: AP-BDD-073 確認採用視窗與未來重新生成費用提示
  Given 本人有1～4張有效候選且當前 MVP 不收費
  When 本人對任一張按「採用這張」後先按「取消」，再重新開啟確認並按「確認採用」
  Then 視窗清楚寫明採用關閉本輪及未來正式付費上線後重新產圖依當時方案收費（目前免費），取消不寫入，確認才採用
  And 採用後不能再新增候選、不產生金流／扣款；其他候選不永久保留
```

## 2026-11-12 全身化身／B1／R2／CLEAN-RESET 新增 BDD（AP-BDD-074～097；24項全部未驗收）

本段由 2026-11-12 用戶確認的 `AP-AC-017／018／022／025／026` 及跨 SPEC `SD-AC-021～030` 衍生；原AP-BDD-001～073、AP-PC-001～008歷史覆核維持不變，但舊半身構圖不是新視覺的通過證據。新增24場不可借用歷史真Gemini／Web／Android結果標成已通過。新體驗先開發，完成後才執行非正式環境受控CLEAN-RESET，再由零開始新全身驗收。

### @critical @happy-path @frontend @AP-BDD-074

- [ ] **Scenario: 免費16款原畫視覺保真與人工確認**（`AP-BDD-074`）
  - **追溯**：`AP-AC-017`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody74`

```gherkin
Scenario: AP-BDD-074 免費16款原畫視覺保真與人工確認
  Given 原有16款male-01～08及female-01～08已封存原圖與穩定ID
  When 依後續使用者決策直接AI延伸全身，逐款與原畫視覺比對並逐批人工確認，不增加像素鎖回流程
  Then 16款每一張均保留原圖hash與穩定ID，AI全身延伸後逐款比對角色身份、髮型／原衣裝／氣質與自然腿腳，並取得使用者確認
  And 不得任意重設角色身份、原衣裝／髮型／氣質；任一未獲確認的失真不通過；不另加逐像素相等門檻
```

### @critical @happy-path @frontend @AP-BDD-075

- [ ] **Scenario: 免費角色全身站姿及裁切安全**（`AP-BDD-075`）
  - **追溯**：`AP-AC-017`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody75`

```gherkin
Scenario: AP-BDD-075 免費角色全身站姿及裁切安全
  Given 免費16款已取得通過保真審查的3:4全身站姿master
  When 將每款角色顯示在全身遠景與中近景並套用原有相機安全框
  Then 頭、身、雙手、腿、鞋完整，角色下緣與背景落點正確，近景五官清晰
  And 不能扭曲拉伸或把站姿當成坐姿／步行動畫
```

### @critical @happy-path @AP-BDD-076

- [ ] **Scenario: 免費16款固定五表情版本化**（`AP-BDD-076`）
  - **追溯**：`AP-AC-017`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody76`

```gherkin
Scenario: AP-BDD-076 免費16款固定五表情版本化
  Given 16款原始上半身已通過鎖定比對且有全身master
  When 在同一角色上驗neutral、smile、surprised、thoughtful、concerned五標準表情
  Then 全部16×5組合存在、命名與表情定義固定、臉以外的全身服裝腿鞋一致
  And 缺一表情或其他部位被意外重繪不可將本角色標成完整
```

### @critical @frontend @happy-path @AP-BDD-077

- [ ] **Scenario: 免費選角及切回不觸發產圖**（`AP-BDD-077`）
  - **追溯**：`AP-AC-004`、`AP-AC-017`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody77`

```gherkin
Scenario: AP-BDD-077 免費選角及切回不觸發產圖
  Given 已登入測試玩家有依已存性別可選的全身免費角色與其固定五表情
  When 本人選免費角色A、改選B、重新選回A及重登
  Then 所有選角都沿用穩定builtinAvatarId與靜態資產，Gemini呼叫計數保持0
  And 不會在切角時新增個人AI角色資料、重生成表情或讀私人真人來源照片
```

### @critical @happy-path @AP-BDD-078

- [ ] **Scenario: AI第一次逐張候選就是3:4全身**（`AP-BDD-078`）
  - **追溯**：`AP-AC-002`、`AP-AC-003`、`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody78`

```gherkin
Scenario: AP-BDD-078 AI第一次逐張候選就是3:4全身
  Given 使用者已授權至少2張ready真人照且正式full-body生成規格已設定
  When 使用者逐張按開始生成並查看第一張和之後候選
  Then 每次成功僅一張3:4全身站姿插畫，頭、手、腿、鞋完整且臉型與原授權照片可比
  And 不得先產半身後採用時補全身；不得超過4張成功候選
```

### @critical @error-handling @AP-BDD-079

- [ ] **Scenario: 全身AI來源照片授權與人物一致**（`AP-BDD-079`）
  - **追溯**：`AP-AC-002`、`AP-AC-007`、`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody79`

```gherkin
Scenario: AP-BDD-079 全身AI來源照片授權與人物一致
  Given 本人照片有可用與撤銷或缺少來源兩種狀態
  When 玩家進入AI頁、選風格、請求全身候選以及稍後固定表情
  Then 首次候選只能在本人主動授權後使用已保存的2～5張合法照片；五表情僅參考已選全身候選
  And 不得在產表情時再次傳真人原照，不得依任意猜測assetId讀他人照片
```

### @critical @edge-case @AP-BDD-080

- [ ] **Scenario: 全身圖近臉品質與解析度門檻**（`AP-BDD-080`）
  - **追溯**：`AP-AC-019`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody80`

```gherkin
Scenario: AP-BDD-080 全身圖近臉品質與解析度門檻
  Given 同一3:4全身候選以現有1K與候選更高解析度兩種設定輸出
  When 將full-body圖等比例裁切到書店臉部近景並進行人工作品比對
  Then 角色五官可辨、比例與人物原有氣質一致，尺寸與成本記錄可驗
  And 若1K使臉糊或200KB壓縮失真必阻擋ready並回報改參數所需成本，不得以降低門檻結案
```

### @critical @frontend @happy-path @AP-BDD-081

- [ ] **Scenario: B1採用前景鎖定且不先改Profile**（`AP-BDD-081`）
  - **追溯**：`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody81`

```gherkin
Scenario: AP-BDD-081 B1採用前景鎖定且不先改Profile
  Given 使用者在有效候選中選中一張全身角色並按確認採用
  When B1在前景逐一生成固定五表情，同時本人嘗試切換免費或另一AI角色
  Then 畫面顯示當前產製項目與進度；任何裝置尚未完成時都不可正式切換
  And 直到整包ready前D1舊selectedAvatarRef保持不變，無背景產圖排程
```

### @critical @happy-path @AP-BDD-082

- [ ] **Scenario: B1全部五表情驗證後才提交**（`AP-BDD-082`）
  - **追溯**：`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody82`

```gherkin
Scenario: AP-BDD-082 B1全部五表情驗證後才提交
  Given AI候選與其固定五表情已由同一全身master衍生
  When server驗證五個固定ID、身份、hash、尺寸、格式、alpha與全身完整性
  Then 私人R2包完成CAS ready後，D1同一revision條件式提交一次正式已選角色
  And ready僅代表素材完整，不能把未在D1正式採用的角色投影給對方
```

### @critical @error-handling @AP-BDD-083

- [ ] **Scenario: B1單張失敗保留成功與原選角**（`AP-BDD-083`）
  - **追溯**：`AP-AC-003`、`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody83`

```gherkin
Scenario: AP-BDD-083 B1單張失敗保留成功與原選角
  Given 五表情中的neutral與smile已驗證但surprised產圖失敗或provider回覆不明
  When 使用者在前景選擇重試、取消或離開
  Then 成功的表情資產沿相同assetId與version保留；只允許明確重試尚未成功的表情
  And 取消或逾時不改舊角色，provider狀態不明不得自動再次付費呼叫
```

### @critical @edge-case @AP-BDD-084

- [ ] **Scenario: 多裝置B1排他與延遲採用競態**（`AP-BDD-084`）
  - **追溯**：`AP-AC-003`、`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody84`

```gherkin
Scenario: AP-BDD-084 多裝置B1排他與延遲採用競態
  Given 同帳號裝置A持有有效R2 lease正在執行B1
  When 裝置B嘗試改選角色，且裝置A晚到的舊revision回覆到達
  Then 前後端均拒絕B1期間切角，多分頁不得重產同一表情，後到過時結果不得覆寫新角色
  And 使用CAS與穩定requestId確保同一全身套組同時只有一個有效製作流程
```

### @critical @edge-case @AP-BDD-085

- [ ] **Scenario: 五表情Manifest含雙版本及不可變內容**（`AP-BDD-085`）
  - **追溯**：`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody85`

```gherkin
Scenario: AP-BDD-085 五表情Manifest含雙版本及不可變內容
  Given 同一owner/asset下可能有半身歷史格式與新full-body版本標示
  When server檢驗avatarAssetId、sourceHash、expressionSpecVersion、avatarAssetSpecVersion及五張各自的sha/mime/size
  Then 只有同一full-body master與固定版本五張都驗證通過才標ready，此版Manifest不可偷偷覆寫
  And 單純存在五張檔名、user_media_assets.status=ready或錯誤版本不能算表情套組完成
```

### @critical @error-handling @AP-BDD-086

- [ ] **Scenario: R2圖片毀損或錯誤版本禁止自動補產**（`AP-BDD-086`）
  - **追溯**：`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody86`

```gherkin
Scenario: AP-BDD-086 R2圖片毀損或錯誤版本禁止自動補產
  Given 已保存Manifest為ready但其中一個R2物件損毀或hash不匹配
  When 本人重新選回同角色並請求載入表情
  Then 以版本化權威驗證並安全顯示素材不可用或修復提示
  And 不得因圖片遺失而在切角、登入或劇情畫面自動呼叫Gemini重產
```

### @critical @error-handling @AP-BDD-087

- [ ] **Scenario: R2已ready但D1採用結果不明**（`AP-BDD-087`）
  - **追溯**：`AP-AC-018`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody87`

```gherkin
Scenario: AP-BDD-087 R2已ready但D1採用結果不明
  Given 五表情Manifest已ready但D1條件交易可能因revision衝突或網路回覆不明而未正式選用
  When 同一requestId重試確認採用或另一玩家讀取其角色
  Then 依D1查回真實selectedAvatarRef與revision，未採用則另一人仍見舊角色
  And 不得宣稱R2與D1是單一交易，也不得因回覆不明重做五表情
```

### @critical @happy-path @frontend @AP-BDD-088

- [ ] **Scenario: 重新選已完成角色與重登零Gemini**（`AP-BDD-088`）
  - **追溯**：`AP-AC-004`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody88`

```gherkin
Scenario: AP-BDD-088 重新選已完成角色與重登零Gemini
  Given 玩家有A、B兩個合法已ready全身AI角色套組
  When 本人從A切B再切A、重登並在有效遊戲重新入場
  Then 只按owner/asset與雙規格版本讀既有完整Manifest及可快取素材，Gemini呼叫恆為0
  And 相同全身角色不重新壓縮，不因後續Prompt或模型變更自動重產
```

### @critical @error-handling @AP-BDD-089

- [ ] **Scenario: 五表情私人資產授權不泄漏**（`AP-BDD-089`）
  - **追溯**：`AP-AC-006`、`AP-AC-007`、`AP-AC-008`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody89`

```gherkin
Scenario: AP-BDD-089 五表情私人資產授權不泄漏
  Given 本人角色已正式採用且存在有效及無效Round、被封存候選與原始真人照片
  When 不同帳號、已結束玩家與合法當輪對方請求角色投影或媒體串流
  Then 只有本人與有效當輪授權可取得正式已採用角色的適用圖片，來源真人照片及私有objectKey不對外回傳
  And 跨owner猜鍵、讀未採用候選、已結束Round或不明版本必安全拒絕
```

### @critical @edge-case @AP-BDD-090

- [ ] **Scenario: 共用壓縮保全身透明度與真人照規則**（`AP-BDD-090`）
  - **追溯**：`AP-AC-009`、`AP-AC-019`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody90`

```gherkin
Scenario: AP-BDD-090 共用壓縮保全身透明度與真人照規則
  Given 正式全身角色需要透明WebP或遮罩，而本人真人來源照仍限制200000 bytes
  When 同一共用IImageCompressionService依明確參數處理表情與一般照片
  Then 全身角色透明／遮罩可保且臉部不失真，真人照仍去EXIF及維持其既定大小／權限
  And 不新增重複壓縮服務，不將透明背景鋪白JPEG卻宣稱2.5D合格
```

### @critical @frontend @happy-path @AP-BDD-091

- [ ] **Scenario: 跨Web與Android安全顯示與不同鏡位**（`AP-BDD-091`）
  - **追溯**：`AP-AC-017`、`AP-AC-022`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody91`

```gherkin
Scenario: AP-BDD-091 跨Web與Android安全顯示與不同鏡位
  Given 免費全身角色與AI全身表情均具合法ready版本及stageAnchors
  When Web桌面與Android直向分別切換站立遠景、半身中景、近臉特寫
  Then 使用同一master安全裁切，人物完整且焦點、身形、腳部落點與表情一致
  And 鍵盤、聊天抽屜、不同裝置安全區不能擋住臉或重要互動
```

### @critical @edge-case @AP-BDD-092

- [ ] **Scenario: 角色正式採用通知不對D1輪詢**（`AP-BDD-092`）
  - **追溯**：`AP-AC-006`、`AP-AC-018`、`AP-AC-025`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody92`

```gherkin
Scenario: AP-BDD-092 角色正式採用通知不對D1輪詢
  Given 有效Room中對方正在播放一段故事台詞
  When 本人成功採用新已ready全身角色且後端交易提交
  Then 使用WebSocket向對方發版本提示，必要時按需讀一次正式授權角色，等當前台詞結束安全切換
  And 採用前不能通知，正常演出與每秒渲染不查D1，舊事件／斷線重連安全校正
```

### @critical @alternative-path @AP-BDD-093

- [ ] **Scenario: 開發中半身角色只清理不升級**（`AP-BDD-093`）
  - **追溯**：`AP-AC-025`、`AP-AC-026`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody93`

```gherkin
Scenario: AP-BDD-093 開發中半身角色只清理不升級
  Given 產品未上線且舊半身AI角色僅是開發期測試資料
  When 實作全身版本並準備重新驗證角色選用與劇情
  Then 不提供半身轉全身、舊ID兼容或遊戲畫面自動產圖入口
  And 僅在全身實作完成後依非正式環境CLEAN-RESET流程清理，再建立新全身角色
```

### @critical @error-handling @AP-BDD-094

- [ ] **Scenario: 只在核准非正式環境清理角色測資**（`AP-BDD-094`）
  - **追溯**：`AP-AC-026`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody94`

```gherkin
Scenario: AP-BDD-094 只在核准非正式環境清理角色測資
  Given 目標D1與R2可能是已核實非正式測試環境或正式／未知／其他專案環境
  When 請求列出並清除舊selectedAvatar、generatedAvatar與avatar/temp候選
  Then 僅已核准非正式環境可根據帳號、DB與R2鍵清單執行一次性清理
  And 任何正式或未知環境、尚在B1產製或遊戲中必拒絕，沒有背景自動清理
```

### @critical @edge-case @AP-BDD-095

- [ ] **Scenario: D1與R2清理可重試且不得殘留**（`AP-BDD-095`）
  - **追溯**：`AP-AC-026`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody95`

```gherkin
Scenario: AP-BDD-095 D1與R2清理可重試且不得殘留
  Given 非正式環境有generated_avatar各狀態、Profile舊選角、R2 avatar正式／候選／舊Manifest
  When 確認精確owner/asset/objectKey清單後，執行清理並模擬R2刪除中途故障
  Then D1清空角色選用並更新revision，相關舊generated_avatar與R2物件歸零、無孤兒且相同清單重試安全
  And 不以跨服務原子交易假稱一次成功或不檢查刪除失敗
```

### @critical @error-handling @AP-BDD-096

- [ ] **Scenario: 清角色保留本人照片帳號與免費原圖**（`AP-BDD-096`）
  - **追溯**：`AP-AC-026`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody96`

```gherkin
Scenario: AP-BDD-096 清角色保留本人照片帳號與免費原圖
  Given 同帳號兼有個人照片、名片、非角色Profile欄位以及16款免費原畫
  When 在非正式環境執行舊角色測試資料清理
  Then 只有AI角色與候選／相關選角被清，personal_photo與private/photos及帳號Profile其他欄位原16張原畫hash不變
  And 不得DELETE整個user_media_assets或用過寬R2前綴誤刪與角色無關的檔案
```

### @critical @smoke @frontend @happy-path @AP-BDD-097

- [ ] **Scenario: 清完從零驗證整套全身使用體驗**（`AP-BDD-097`）
  - **追溯**：`AP-AC-017`、`AP-AC-018`、`AP-AC-022`、`AP-AC-025`、`AP-AC-026`；2026-11-12已確認全身化身／CLEAN-RESET，新需求**未實作／未驗收**
  - **測試方法基名**：`FullBody97`

```gherkin
Scenario: AP-BDD-097 清完從零驗證整套全身使用體驗
  Given 新全身與B1功能已開發完成且非正式環境舊角色清理有D1/R2核對紀錄
  When 兩個獨立測試帳號由零選全身免費角色、以授權照產全身AI候選、B1五表情完成與切角，再於Web/Android遊玩書店雙結局
  Then 全部新角色由本版資產與ready Manifest建成，雙端遠中近鏡及UX-P1～P5皆有真證據
  And 免費16款上半身人工保真及使用者Gate B未確認前不能勾本次新體驗完成
```
## ⚠️ SPEC 補充／跨 SPEC 延後驗收

- `AP-AC-001`～`AP-AC-026` 均有對應場景（25／26由AP-BDD-074～097補足）。真實的配對成立、親密度25分入口、名片邀請／同意／拒絕及互動終止是 `SPEC-001-MatchingSessions`、`SPEC-001-AffectionAndFeedback` 與 `SPEC-001-StoryDialogueAndExit` 的責任；本文件只驗證本份的受限內部介面與故障注入，不將跨 SPEC 尚未實作的 E2E 標為通過。
- Gemini 真 API 成功4圖、200KB 真人照五官品質、16張**實際不同**插畫以及 Web／Android／iOS 互動都必須保留驗收證據，不能用原型／替身／歷史驗證取代。
- D-047 已確定**不使用 SQL Trigger**；所有上限及 immutable rule 以受控 SQL 條件／服務邏輯實作，需真 D1 競態證據。

## 🔗 相關文件

- [MVP](../requirements/MVP-001-LoveGameDatingApp.md)
- [SDD](../specs/SPEC-001-AvatarAndPreferences.md)
- [TDD](../tdd/SPEC-001-AvatarAndPreferences-TDD.md)
- [風險稽核](../specs/SPEC-001-AvatarAndPreferences-RiskAudit.md)

**歷史狀態（2026-11-01～05範圍）**：當時SDD、RiskAudit確認與73場景規劃 Ready；其中RQ-02=A/D-049 半身要求**已被2026-11-12全身方案取代**。最新新增24場全部未驗收；新版規劃 Ready／Gate結果依本文件最上方增量章節、對應TDD/RiskAudit，不得以歷史狀態代簽。
