# SPEC-001-AvatarAndPreferences — TDD 結案核證清單

**狀態：使用者已於 2026-11-25 確認驗收完成。** 原始已核證 236 項保留，原未核證 159 項不冒充測試通過；其功能依現行實作對照，已取代或未實作的舊測試計畫不再作開發待辦。既有核證屬原執行版本，與本次使用者驗收分開記錄。

現行功能：本人照片／個資／配對投影／免費16款、逐張AI候選及前景採用、五表情及四靜態姿態套組、已完成素材重用、私人授權、非正式測資精確清理。實作對照及未單獨核證的技術細項見 Verification。實際雙方名片交換由 AffectionAndFeedback 負責；不要求未使用原畫、Puppet、iOS、額外供應商品質成本實驗。

[現行 SPEC](../specs/SPEC-001-AvatarAndPreferences.md)／[驗證與結案對照](../verification/SPEC-001-AvatarAndPreferences-Verification.md)

## 原已核證案例（236 項）

- [x] `AP-UT-001` **`PhotoPurposeNotice_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已登入且目前沒有照片；執行 本人開啟照片管理並選擇上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-002` **`PhotoPurposeNotice_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟照片管理並選擇上傳；斷言 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」；並且 並告知照片將在本人主動啟用 AI 時提供第三方生成服務。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-003` **`PersonalPhotoUpload_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人選擇兩張有效圖片且單張不超過8 MiB；執行 本人依序上傳照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-004` **`PersonalPhotoUpload_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人依序上傳照片；斷言 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2；並且 D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-005` **`PersonalPhotoReorder_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有三張 ready 個人照且持有目前 revision；執行 本人提交包含全部三張資產的全新順序；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-006` **`PersonalPhotoReorder_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人提交包含全部三張資產的全新順序；斷言 本人照片顯示順序依提交清單更新；並且 不產生額外照片及不改動其他帳號資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-009` **`BuiltinAvatarCatalog_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已登入；執行 本人開啟免費化身選擇清單；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-010` **`BuiltinAvatarCatalog_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟免費化身選擇清單；斷言 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪；並且 任何使用者都能跨風格分組自由選用且不要求照片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-011` **`SelectBuiltinAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已取得合法 builtin ID 且 revision 最新；執行 本人選取免費角色並重新登入另一裝置；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-012` **`SelectBuiltinAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選取免費角色並重新登入另一裝置；斷言 目前遊戲化身仍為相同的 builtin ID；並且 保留暱稱、職業與其他既有個人資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-013` **`SaveDatingProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有最新 revision 及合法資料欄位；執行 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-014` **`SaveDatingProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；斷言 資料以 user_profiles 的固定 JSON 契約保存；並且 下次 GET 回傳同一目前版本且 revision 增加1。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-015` **`AdultProfileReady_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身；執行 本人儲存並重新讀取個人資料；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-016` **`AdultProfileReady_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存並重新讀取個人資料；斷言 profileReady 為 true；並且 精確生日只供後端且不出現在他人投影。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-017` **`InterestCatalog_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗；執行 本人開啟目錄並儲存合法標籤；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-018` **`InterestCatalog_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟目錄並儲存合法標籤；斷言 使用代碼而非 label 持久化三組興趣資料；並且 舊代碼停用後既存資料仍可辨識。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-027` **`MyCardPreview_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已填入工作、興趣與照片；執行 本人開啟我的名片預覽；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-028` **`MyCardPreview_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人開啟我的名片預覽；斷言 顯示本人當前可分享的欄位與照片；並且 預覽權限不提供另一人讀取授權。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-029` **`GenerateOneAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已保存至少兩張 ready 真人照並已閱讀產圖頁第三方送照提醒；操作 本人按「開始產生第1張」；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-030` **`GenerateOneAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人按「開始產生第1張」；斷言 後端只呼叫本次一張 Gemini 並回傳一張真正可預覽的插畫，不要求一口氣取得四張；另驗 回傳 attemptId、index=1、producedCount=1 及60分鐘到期資訊。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-031` **`SelectGeneratedAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已依序成功產生三張私人 R2 候選且 revision 為最新；操作 本人回選第2張、看完採用警語後按「確認採用」；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-032` **`SelectGeneratedAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人回選第2張、看完採用警語後按「確認採用」；斷言 只有所選第2張正式寫入 user_media_assets 並更新目前遊戲化身，本輪隨即關閉；另驗 其餘已成功兩張不建立正式媒體列，未確認前舊化身維持不變。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-033` **`ReselectGeneratedAvatar_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人擁有先前成功選定且仍為 ready 的 generated_avatar；執行 本人切換至該正式 assetId；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-034` **`ReselectGeneratedAvatar_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人切換至該正式 assetId；斷言 選用的 generated_avatar 被持久化為目前化身；並且 無需重新呼叫生成服務也不須新增圖片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-035` **`ReusableImageCompression_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：另一個服務提供符合介面契約的圖片 stream 與 targetBytes；執行 該服務呼叫同一 IImageCompressionService；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-036` **`ReusableImageCompression_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 該服務呼叫同一 IImageCompressionService；斷言 得到正確 MIME、寬高及小於等於目標的壓縮輸出；並且 實作未依賴 avatar 名稱、R2 或照片數量規則。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-037` **`GeminiLiveVerification_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：測試環境以安全方式配置使用者授權的 Gemini API 憑證與真人照片；操作 本人明確要求單張生成，後端啟用真實 Gemini API；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-038` **`GeminiLiveVerification_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人明確要求單張生成，後端啟用真實 Gemini API；斷言 每次成功真正產出一張可預覽的3:4插畫並記錄非敏感的模型版本與耗時／用量證據；另驗 客戶端、Git與日誌均不包含秘密或原始人像，未產出圖片不能假成功。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-039` **`FreeWithoutPhotos_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人沒有任何真人照片；執行 本人選取 male-03 或 female-07；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-040` **`FreeWithoutPhotos_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人選取 male-03 或 female-07；斷言 可以成功選用免費角色並進入已具備條件的個人資料流程；並且 不觸發 Gemini、付費或強制照片欄位。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-041` **`InsufficientSourcePhotos_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人只有0或1張 ready 真人照；執行 本人點擊 AI 鎖頭；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-042` **`InsufficientSourcePhotos_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人點擊 AI 鎖頭；斷言 顯示至少需要兩張已保存真人照的提示；並且 不發送 AI provider 請求也不改動目前化身。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-043` **`ReplaceAtPhotoLimit_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已持有五張 ready 真人照；執行 本人刪除一張後再上傳一張有效照片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-044` **`ReplaceAtPhotoLimit_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人刪除一張後再上傳一張有效照片；斷言 新照片可占用釋放的第五個額度；並且 已刪照片不能復活或混入當前名片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-045` **`AbandonGeneratedCandidates_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有當前免費角色與一至三張本輪已成功候選；操作 本人暫不採用並離開產圖畫面；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-046` **`AbandonGeneratedCandidates_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人暫不採用並離開產圖畫面；斷言 目前遊戲化身保持不變且已成功候選在60分鐘效期內仍可由本人依參照安全預覽；另驗 到期才拒絕讀取／清理，沒有正式資產、付款或自動產下一張。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-047` **`OptionalOccupation_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有成年生日、暱稱及合法角色；執行 本人將 occupation 設為 null；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-048` **`OptionalOccupation_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人將 occupation 設為 null；斷言 可成功保存並完成最小設定；並且 名片不會憑空顯示虛構職業。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-049` **`RetryExpiredAttempt_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人的上次 attempt 已超過60分鐘；操作 本人在照片足夠時再次主動按「開始產生第1張」；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-050` **`RetryExpiredAttempt_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人在照片足夠時再次主動按「開始產生第1張」；斷言 建立新的獨立短效本輪、只請求一張，不恢復舊 provider 執行；另驗 先前候選已失效且需提示重試可能有供應商成本，但本 MVP 不扣款。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-053` **`PersistAfterRelogin_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已儲存偏好及正式選用角色；執行 本人重新登入 Web 或原生裝置；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-054` **`PersistAfterRelogin_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人重新登入 Web 或原生裝置；斷言 讀取同一帳號最新個人資料、照片清單與化身；並且 不因 Session family 改變而重新產生使用者資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-055` **`RejectOversizePhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人選擇一張大於8 MiB的照片；執行 本人送出照片上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-056` **`RejectOversizePhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人送出照片上傳；斷言 回傳413 IMAGE_TOO_LARGE；並且 R2 不保存原始檔且 D1 不增加 ready 照片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-057` **`RejectForgedImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：檔名為 .jpg 但內容不是可解碼影像；執行 本人嘗試上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-058` **`RejectForgedImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人嘗試上傳；斷言 回傳400 INVALID_IMAGE；並且 不得產生可讀的圖片資產或洩漏解碼例外。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-059` **`RejectUncompressibleImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：圖片經安全解碼仍無法在畫質限制內壓至200000 bytes；執行 本人上傳該圖片；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-060` **`RejectUncompressibleImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人上傳該圖片；斷言 回傳413 COMPRESSED_IMAGE_TOO_LARGE；並且 不改存未壓縮原檔，也不破壞已存照片。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-061` **`RejectSixthPhoto_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有五張 pending 或 ready 本人照；執行 本人再上傳第六張；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-062` **`RejectSixthPhoto_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人再上傳第六張；斷言 回傳409 PHOTO_LIMIT_REACHED；並且 資料庫不得新增第六張或殘留可讀 R2 孤兒。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-063` **`RejectForeignMedia_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權；執行 B 猜出 A 的 assetId 嘗試取得影像；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-064` **`RejectForeignMedia_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 猜出 A 的 assetId 嘗試取得影像；斷言 伺服器以本人擁有權驗證拒絕存取；並且 不公開圖片存在性、R2 objectKey 或持久 URL。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-065` **`RejectRevokedSession_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人舊 Session family 已被新登入撤銷；執行 舊憑證請求照片或選用化身；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-066` **`RejectRevokedSession_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 舊憑證請求照片或選用化身；斷言 回傳401 SESSION_REVOKED；並且 不得把舊請求寫入任何帳號的資料。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-067` **`RejectMissingSingleImage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本輪已有兩張有效候選但這次 Gemini 沒有回傳可解碼圖片；操作 本人按「產生下一張」要求第3張；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-068` **`RejectMissingSingleImage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人按「產生下一張」要求第3張；斷言 本次回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確失敗，producedCount 保持2；另驗 既有兩張依舊可預覽／採用，不能刪掉、冒充第3張或自動重送。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-069` **`RejectDuplicateCandidate_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本輪已有一張成功候選，provider 回傳 byte-identical 的圖片；操作 本人要求產生下一張，後端比對已有候選；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-070` **`RejectDuplicateCandidate_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人要求產生下一張，後端比對已有候選；斷言 這次不產生新的 index，也不增加 producedCount，提示可主動再試；另驗 先前候選保持可選，禁止複製舊圖冒充新成果。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-071` **`HandleSingleGeminiFailure_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：Gemini 不可用、限額不足或本張請求超時，且本輪已有一張成功候選；操作 本人要求第二張插畫；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-072` **`HandleSingleGeminiFailure_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人要求第二張插畫；斷言 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；若供應商狀態不確定須顯示不可自動重送；另驗 第一張候選仍有效、舊化身不變，沒有假圖或自動繼續產生。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-073` **`RejectExpiredCandidate_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：attemptId 已超過60分鐘；執行 本人試圖預覽或選擇過期候選；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-074` **`RejectExpiredCandidate_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人試圖預覽或選擇過期候選；斷言 預覽回410 AVATAR_CANDIDATE_EXPIRED；並且 不得新增正式媒體資產或改動目前化身。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-075` **`RejectForeignAvatarSelection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：B 持有 A 的 attemptId 或 generated assetId；執行 B 試圖將該圖設為自己的角色；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-076` **`RejectForeignAvatarSelection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 試圖將該圖設為自己的角色；斷言 回傳404或400 INVALID_AVATAR_SELECTION；並且 B 的目前角色及兩個帳號資產均維持原狀。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-077` **`CompensateFailedPhotoStorage_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：照片在 D1 成功占位但 R2 上傳失敗；執行 後端執行失敗補償；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-078` **`CompensateFailedPhotoStorage_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端執行失敗補償；斷言 本人該筆 pending 標記 deleted 且不可對外顯示；並且 不洩漏未壓縮 bytes，重試可正常占用額度。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-079` **`CompensateFailedAvatarSelection_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：候選圖已複製到正式 R2 但 D1 CAS 失敗；執行 後端執行補償；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-080` **`CompensateFailedAvatarSelection_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 後端執行補償；斷言 標記失敗的正式媒體列 deleted 並清除 R2 孤兒；並且 目前原化身仍有效且其他候選不持久化。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-081` **`RejectInvalidProfilePayload_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人送未知鍵、非法年齡範圍或非法標籤代碼；執行 本人更新個人資料；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-082` **`RejectInvalidProfilePayload_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人更新個人資料；斷言 回傳400 INVALID_PROFILE；並且 revision、JSON 內容及其他資料保持原值。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-083` **`RejectUnderageProfile_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人輸入未滿18歲的有效生日；執行 本人嘗試完成個人資料設定；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-084` **`RejectUnderageProfile_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人嘗試完成個人資料設定；斷言 profileReady 為 false 且交友入口被阻擋；並且 不得把尚未完成成年驗證當作已成年。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-085` **`RejectUnconsentedCard_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：雙方尚未完成同輪名片交換同意；執行 B 試圖查閱 A 的名片與私人照；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-086` **`RejectUnconsentedCard_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 B 試圖查閱 A 的名片與私人照；斷言 內部受控查詢拒絕；並且 即使知道對方 assetId 也不能經本人路由繞過。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-089` **`RejectStaleProfileRevision_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人同時開啟兩個版本相同的編輯頁；執行 第一頁成功更新後第二頁儲存舊 expectedRevision；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-090` **`RejectStaleProfileRevision_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 第一頁成功更新後第二頁儲存舊 expectedRevision；斷言 第二頁回409 PROFILE_VERSION_CONFLICT；並且 第一頁更新保留且前端提示重新載入。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-091` **`RejectInvalidPhotoOrder_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人提供不完整、重複或含其他人的照片排序清單；執行 本人送出排序；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-092` **`RejectInvalidPhotoOrder_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人送出排序；斷言 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT；並且 所有原照片順序和 revision 保持不變。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-093` **`AtomicFifthSixthInsert_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人已有四張 pending 或 ready 真人照；執行 兩個來源同時向同一 D1 執行受控條件 INSERT；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-094` **`AtomicFifthSixthInsert_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 兩個來源同時向同一 D1 執行受控條件 INSERT；斷言 最多一筆新增成功且最終有效數量恰為5；並且 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-095` **`PendingReservationCounts_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有四張 ready 及一張 pending 真人照；執行 另外一個請求嘗試上傳；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-096` **`PendingReservationCounts_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 另外一個請求嘗試上傳；斷言 單一條件 INSERT 不得新增第六筆 pending；並且 pending 超時由既有清理處理但不能靠清理才限制額度。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-097` **`ImmutableMediaIdentity_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：已存在一筆 deleted 媒體資產；執行 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-098` **`ImmutableMediaIdentity_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；斷言 平台拒絕非法欄位與狀態變化；並且 不使用 Trigger 且所有受控入口維持同一不變式。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-099` **`UnicodeAndAgeBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：測試時鐘固定在臺灣日期並準備邊界生日；執行 本人依序輸入剛滿18歲與差一天未滿18歲生日；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-100` **`UnicodeAndAgeBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人依序輸入剛滿18歲與差一天未滿18歲生日；斷言 僅剛滿18歲能使 profileReady 為 true；並且 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-101` **`JsonPreferenceBoundaries_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人提供各組可達的合法最大選取數（取欄位上限與目前目錄數的較小值；topic 上限仍為8、現有6碼）的 traits、interest、topic、value 與 region 陣列；執行 本人儲存並接著測試重複及超上限元素；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-102` **`JsonPreferenceBoundaries_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 本人儲存並接著測試重複及超上限元素；斷言 上限合法資料保存且重複、未知鍵、超限資料被拒絕；並且 preferredAgeMin/Max 成對且18至120、Min不大於Max。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-103` **`CompressionExactBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：不同影像大小剛好等於200000 bytes並透過分段輸入；執行 共用壓縮服務處理輸入；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-104` **`CompressionExactBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 共用壓縮服務處理輸入；斷言 成功輸出小於或等於200000 bytes；並且 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-105` **`CandidateIndexBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人持有尚未到期、只成功產出索引1與2的 attemptId；操作 本人請求索引0、3、5或他人 attemptId；驗證只允許合法狀態繼續 IO。

- [x] `AP-UT-106` **`CandidateIndexBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：以替身 Repository／Clock／Provider 操作：本人請求索引0、3、5或他人 attemptId；斷言 僅實際存在且屬本人的1與2可讀，其餘索引拒絕；另驗 R2 key 從 server CurrentUser.accountId 推導，且最多容許索引4。失敗不污染既有狀態、日誌不留秘密。

- [x] `AP-UT-107` **`AvatarSelectionRace_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：本人有兩個有效候選且同時送同一 expectedRevision；執行 兩個不同選用請求同時提交；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-108` **`AvatarSelectionRace_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 兩個不同選用請求同時提交；斷言 只有一個 CAS 成功且 revision 增加1；並且 落敗的複製檔案被補償，最終唯一角色仍可讀。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-111` **`SecretExposureBoundary_Precondition_EnforcesDomainRule`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：在 Domain／Application 的隔離前置條件模擬：Gemini server secret 與本人照片已配置於測試環境；執行 執行成功與故障生成、產出客戶端 bundle；驗證正確的允許／拒絕，不能讓不合法狀態進入 IO。

- [x] `AP-UT-112` **`SecretExposureBoundary_Action_PreservesResultInvariant`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：用替身 Repository／Clock／Provider 進行 執行成功與故障生成、產出客戶端 bundle；斷言 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source；並且 僅留下去識別的驗證證據。失敗時保留既有狀態及無秘密 log。

- [x] `AP-UT-113` **`CalculateAdultAge_LeapDayAndTaiwanMidnight_UsesFixedClock`**
  - **稽核缺漏**：`RG-14`；**優先級**：低；**BDD**：`AP-BDD-050`；**來源**：RA-12、BDD-050
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **前置／操作**：以固定台灣時鐘測閏年2/29出生、剛滿18、差一天未滿18與午夜交界
  - **預期斷言**：固定時鐘驗2月29日、邊界當日及前一日，未成年不能 profileReady。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。
  - **2026-11-02 Runner 實證**：`DatingHigh.Unit.Tests/Domain/AvatarAndPreferencesPolicyTests.cs` 固定 UTC 時鐘 15:59:59→16:00:00 對應臺灣午夜，並驗閏年2月29與未滿／剛滿18；Red `c583d845-b24e-43b7-850c-f9b65f793025`，Green 全 Unit `f1f7a1e8-cb58-4dfa-af0d-d94410c9a540` **101/101**。純 Domain 規則通過，不代表 HTTP 或 E2E 通過。

- [x] `AP-UT-114` **`GenerateOneCandidate_FirstImageApproved_DoesNotRequestRemainingThree`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬只產出第一張且使用者立即確定採用；預期 驗 Gemini 僅被呼叫一次、後續三張均未請求、目前免費且採用後本輪關閉。

- [x] `AP-UT-115` **`ChooseFirstCandidate_ConfirmOnce_OnlyOneAssetCreated`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬首次真圖、採用確認及重複送出選用；預期 驗只新增1張正式生成 asset、profile revision 只增加1、重複不二次建立。

- [x] `AP-UT-116` **`KeepSkippedCandidate_WhenNewOneArrives_PreservesEarlierReference`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬本輪第1張暫不採用，接著成功產生第2張；預期 驗候選清單保留1與2，前端只有短效參照、不存持久圖片資料。

- [x] `AP-UT-117` **`SelectEarlierCandidate_AfterSecondResult_PersistsOnlySelected`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：模擬回選第1張並確認採用；預期 驗只正式化第1張、候選2不寫入 user_media_assets。

- [x] `AP-UT-118` **`ReserveCandidateSlot_ConcurrentRequests_AllowsSingleInFlight`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：以同帳號兩分頁不同 clientRequestId 競爭第4張；預期 只有一個 inFlight 取得權利，另一個409；同 id 重送不再次呼叫 provider。

- [x] `AP-UT-119` **`RejectFifthCandidate_AfterFourSuccesses_DoesNotChargeProvider`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：本輪 manifest producedCount=4、closed 或過期；預期 拒絕第5張與已關閉請求，provider 呼叫次數不增加。

- [x] `AP-UT-120` **`ProviderTimeout_AfterTwoCandidates_DoesNotIncrementCount`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-072`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：已有2張候選，第3張失敗或超時；預期 確認 producedCount 仍2、保留先前2圖並保留原化身。

- [x] `AP-UT-121` **`UnknownProviderCost_DoesNotAutoRetrySameRequest`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Application.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-072`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：假設供應商狀態未知且 client 重送相同 requestId；預期 不自動重新消耗成本／新增候選，需使用者明確再次操作、限流再驗。

- [x] `AP-IT-001` **`PhotoPurposeNotice_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-001`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已登入且目前沒有照片；When 本人開啟照片管理並選擇上傳；Then 顯示「請提供自己最滿意的個人照，未來同意的情況下提供對方交換名片時查閱」；And 並告知照片將在本人主動啟用 AI 時提供第三方生成服務。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-002` **`PersonalPhotoUpload_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-002`（AP-AC-001、AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人選擇兩張有效圖片且單張不超過8 MiB；When 本人依序上傳照片；Then 系統透過共用壓縮將每張壓至200000 bytes以下並寫入私人 R2；And D1 僅保留本人 pending→ready 的照片資產，不存原始未壓縮檔。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-003` **`PersonalPhotoReorder_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-003`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有三張 ready 個人照且持有目前 revision；When 本人提交包含全部三張資產的全新順序；Then 本人照片顯示順序依提交清單更新；And 不產生額外照片及不改動其他帳號資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-005` **`BuiltinAvatarCatalog_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-005`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已登入；When 本人開啟免費化身選擇清單；Then 顯示 male-01 至 male-08 與 female-01 至 female-08 共16個不同立繪；And 任何使用者都能跨風格分組自由選用且不要求照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-006` **`SelectBuiltinAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-006`（AP-AC-004、AP-AC-006）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已取得合法 builtin ID 且 revision 最新；When 本人選取免費角色並重新登入另一裝置；Then 目前遊戲化身仍為相同的 builtin ID；And 保留暱稱、職業與其他既有個人資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-007` **`SaveDatingProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-007`（AP-AC-005、AP-AC-012、AP-AC-013）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有最新 revision 及合法資料欄位；When 本人儲存暱稱、自介、工作、標籤、生活偏好與擇偶條件；Then 資料以 user_profiles 的固定 JSON 契約保存；And 下次 GET 回傳同一目前版本且 revision 增加1。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-008` **`AdultProfileReady_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-008`（AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人出生日期符合臺灣日期下已滿18歲且已有合法暱稱與免費化身；When 本人儲存並重新讀取個人資料；Then profileReady 為 true；And 精確生日只供後端且不出現在他人投影。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-009` **`InterestCatalog_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-009`（AP-AC-011）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 版本化目錄至少涵蓋文創、戶外、美食、影劇動漫、心理測驗；When 本人開啟目錄並儲存合法標籤；Then 使用代碼而非 label 持久化三組興趣資料；And 舊代碼停用後既存資料仍可辨識。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-014` **`MyCardPreview_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-014`（AP-AC-020）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已填入工作、興趣與照片；When 本人開啟我的名片預覽；Then 顯示本人當前可分享的欄位與照片；And 預覽權限不提供另一人讀取授權。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-015` **`GenerateOneAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-015`（AP-AC-002、AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人已保存至少兩張 ready 真人照並已閱讀產圖頁第三方送照提醒；When 本人按「開始產生第1張」；Then 後端只呼叫本次一張 Gemini 並回傳一張真正可預覽的插畫，不要求一口氣取得四張；And 回傳 attemptId、index=1、producedCount=1 及60分鐘到期資訊。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-016` **`SelectGeneratedAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-016`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人已依序成功產生三張私人 R2 候選且 revision 為最新；When 本人回選第2張、看完採用警語後按「確認採用」；Then 只有所選第2張正式寫入 user_media_assets 並更新目前遊戲化身，本輪隨即關閉；And 其餘已成功兩張不建立正式媒體列，未確認前舊化身維持不變。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-017` **`ReselectGeneratedAvatar_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-017`（AP-AC-003、AP-AC-004）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人擁有先前成功選定且仍為 ready 的 generated_avatar；When 本人切換至該正式 assetId；Then 選用的 generated_avatar 被持久化為目前化身；And 無需重新呼叫生成服務也不須新增圖片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-018` **`ReusableImageCompression_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-018`（AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 另一個服務提供符合介面契約的圖片 stream 與 targetBytes；When 該服務呼叫同一 IImageCompressionService；Then 得到正確 MIME、寬高及小於等於目標的壓縮輸出；And 實作未依賴 avatar 名稱、R2 或照片數量規則。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-019` **`GeminiLiveVerification_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-019`（AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 測試環境以安全方式配置使用者授權的 Gemini API 憑證與真人照片；When 本人明確要求單張生成，後端啟用真實 Gemini API；Then 每次成功真正產出一張可預覽的3:4插畫並記錄非敏感的模型版本與耗時／用量證據；And 客戶端、Git與日誌均不包含秘密或原始人像，未產出圖片不能假成功。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-020` **`FreeWithoutPhotos_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-020`（AP-AC-001、AP-AC-004）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人沒有任何真人照片；When 本人選取 male-03 或 female-07；Then 可以成功選用免費角色並進入已具備條件的個人資料流程；And 不觸發 Gemini、付費或強制照片欄位。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-021` **`InsufficientSourcePhotos_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-021`（AP-AC-001、AP-AC-018）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人只有0或1張 ready 真人照；When 本人點擊 AI 鎖頭；Then 顯示至少需要兩張已保存真人照的提示；And 不發送 AI provider 請求也不改動目前化身。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-022` **`ReplaceAtPhotoLimit_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-022`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已持有五張 ready 真人照；When 本人刪除一張後再上傳一張有效照片；Then 新照片可占用釋放的第五個額度；And 已刪照片不能復活或混入當前名片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-023` **`AbandonGeneratedCandidates_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-023`（AP-AC-003）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人已有當前免費角色與一至三張本輪已成功候選；When 本人暫不採用並離開產圖畫面；Then 目前遊戲化身保持不變且已成功候選在60分鐘效期內仍可由本人依參照安全預覽；And 到期才拒絕讀取／清理，沒有正式資產、付款或自動產下一張。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-024` **`OptionalOccupation_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-024`（AP-AC-005、AP-AC-012）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人已有成年生日、暱稱及合法角色；When 本人將 occupation 設為 null；Then 可成功保存並完成最小設定；And 名片不會憑空顯示虛構職業。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-025` **`RetryExpiredAttempt_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-025`（AP-AC-003）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人的上次 attempt 已超過60分鐘；When 本人在照片足夠時再次主動按「開始產生第1張」；Then 建立新的獨立短效本輪、只請求一張，不恢復舊 provider 執行；And 先前候選已失效且需提示重試可能有供應商成本，但本 MVP 不扣款。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-027` **`PersistAfterRelogin_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-027`（AP-AC-014）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已儲存偏好及正式選用角色；When 本人重新登入 Web 或原生裝置；Then 讀取同一帳號最新個人資料、照片清單與化身；And 不因 Session family 改變而重新產生使用者資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-028` **`RejectOversizePhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-028`（AP-AC-009）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人選擇一張大於8 MiB的照片；When 本人送出照片上傳；Then 回傳413 IMAGE_TOO_LARGE；And R2 不保存原始檔且 D1 不增加 ready 照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-029` **`RejectForgedImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-029`（AP-AC-009）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 檔名為 .jpg 但內容不是可解碼影像；When 本人嘗試上傳；Then 回傳400 INVALID_IMAGE；And 不得產生可讀的圖片資產或洩漏解碼例外。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-030` **`RejectUncompressibleImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-030`（AP-AC-009、AP-AC-019）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 圖片經安全解碼仍無法在畫質限制內壓至200000 bytes；When 本人上傳該圖片；Then 回傳413 COMPRESSED_IMAGE_TOO_LARGE；And 不改存未壓縮原檔，也不破壞已存照片。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-031` **`RejectSixthPhoto_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-031`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有五張 pending 或 ready 本人照；When 本人再上傳第六張；Then 回傳409 PHOTO_LIMIT_REACHED；And 資料庫不得新增第六張或殘留可讀 R2 孤兒。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-032` **`RejectForeignMedia_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-032`（AP-AC-007、AP-AC-008）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given A 擁有私人照和正式 AI 圖片，B 已登入但沒有授權；When B 猜出 A 的 assetId 嘗試取得影像；Then 伺服器以本人擁有權驗證拒絕存取；And 不公開圖片存在性、R2 objectKey 或持久 URL。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-033` **`RejectRevokedSession_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-033`（AP-AC-007）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人舊 Session family 已被新登入撤銷；When 舊憑證請求照片或選用化身；Then 回傳401 SESSION_REVOKED；And 不得把舊請求寫入任何帳號的資料。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-034` **`RejectMissingSingleImage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-034`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本輪已有兩張有效候選但這次 Gemini 沒有回傳可解碼圖片；When 本人按「產生下一張」要求第3張；Then 本次回傳503 IMAGE_PROVIDER_UNAVAILABLE 或明確失敗，producedCount 保持2；And 既有兩張依舊可預覽／採用，不能刪掉、冒充第3張或自動重送。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-035` **`RejectDuplicateCandidate_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-035`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本輪已有一張成功候選，provider 回傳 byte-identical 的圖片；When 本人要求產生下一張，後端比對已有候選；Then 這次不產生新的 index，也不增加 producedCount，提示可主動再試；And 先前候選保持可選，禁止複製舊圖冒充新成果。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-036` **`HandleSingleGeminiFailure_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-036`（AP-AC-003、AP-AC-018、AP-AC-024）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given Gemini 不可用、限額不足或本張請求超時，且本輪已有一張成功候選；When 本人要求第二張插畫；Then 明確回傳503 IMAGE_PROVIDER_UNAVAILABLE 或429 RATE_LIMITED；若供應商狀態不確定須顯示不可自動重送；And 第一張候選仍有效、舊化身不變，沒有假圖或自動繼續產生。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-037` **`RejectExpiredCandidate_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-037`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given attemptId 已超過60分鐘；When 本人試圖預覽或選擇過期候選；Then 預覽回410 AVATAR_CANDIDATE_EXPIRED；And 不得新增正式媒體資產或改動目前化身。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-038` **`RejectForeignAvatarSelection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-038`（AP-AC-003、AP-AC-006）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given B 持有 A 的 attemptId 或 generated assetId；When B 試圖將該圖設為自己的角色；Then 回傳404或400 INVALID_AVATAR_SELECTION；And B 的目前角色及兩個帳號資產均維持原狀。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-039` **`CompensateFailedPhotoStorage_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-039`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 照片在 D1 成功占位但 R2 上傳失敗；When 後端執行失敗補償；Then 本人該筆 pending 標記 deleted 且不可對外顯示；And 不洩漏未壓縮 bytes，重試可正常占用額度。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-040` **`CompensateFailedAvatarSelection_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-040`（AP-AC-003）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 候選圖已複製到正式 R2 但 D1 CAS 失敗；When 後端執行補償；Then 標記失敗的正式媒體列 deleted 並清除 R2 孤兒；And 目前原化身仍有效且其他候選不持久化。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-041` **`RejectInvalidProfilePayload_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-041`（AP-AC-005、AP-AC-013）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人送未知鍵、非法年齡範圍或非法標籤代碼；When 本人更新個人資料；Then 回傳400 INVALID_PROFILE；And revision、JSON 內容及其他資料保持原值。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-042` **`RejectUnderageProfile_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-042`（AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人輸入未滿18歲的有效生日；When 本人嘗試完成個人資料設定；Then profileReady 為 false 且交友入口被阻擋；And 不得把尚未完成成年驗證當作已成年。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-043` **`RejectUnconsentedCard_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-043`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 雙方尚未完成同輪名片交換同意；When B 試圖查閱 A 的名片與私人照；Then 內部受控查詢拒絕；And 即使知道對方 assetId 也不能經本人路由繞過。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-045` **`RejectStaleProfileRevision_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-045`（AP-AC-005）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人同時開啟兩個版本相同的編輯頁；When 第一頁成功更新後第二頁儲存舊 expectedRevision；Then 第二頁回409 PROFILE_VERSION_CONFLICT；And 第一頁更新保留且前端提示重新載入。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-046` **`RejectInvalidPhotoOrder_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-046`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人提供不完整、重複或含其他人的照片排序清單；When 本人送出排序；Then 回傳400 INVALID_PROFILE 或409 PROFILE_VERSION_CONFLICT；And 所有原照片順序和 revision 保持不變。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-047` **`AtomicFifthSixthInsert_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-047`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人已有四張 pending 或 ready 真人照；When 兩個來源同時向同一 D1 執行受控條件 INSERT；Then 最多一筆新增成功且最終有效數量恰為5；And 資料庫不存在 CREATE TRIGGER 且敗者回409 PHOTO_LIMIT_REACHED。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-048` **`PendingReservationCounts_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-048`（AP-AC-001）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 本人有四張 ready 及一張 pending 真人照；When 另外一個請求嘗試上傳；Then 單一條件 INSERT 不得新增第六筆 pending；And pending 超時由既有清理處理但不能靠清理才限制額度。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-049` **`ImmutableMediaIdentity_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-049`（AP-AC-001、AP-AC-006）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 已存在一筆 deleted 媒體資產；When 呼叫者試圖走受控 command 變更 account_id、kind、object_key 或改回 ready；Then 平台拒絕非法欄位與狀態變化；And 不使用 Trigger 且所有受控入口維持同一不變式。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-050` **`UnicodeAndAgeBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-050`（AP-AC-005、AP-AC-021）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given 測試時鐘固定在臺灣日期並準備邊界生日；When 本人依序輸入剛滿18歲與差一天未滿18歲生日；Then 僅剛滿18歲能使 profileReady 為 true；And 暱稱以 Unicode scalar 計數且拒絕控制字元與孤立 surrogate。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-051` **`JsonPreferenceBoundaries_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-051`（AP-AC-011、AP-AC-013）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人提供各組可達的合法最大選取數（取欄位上限與目前目錄數的較小值；topic 上限仍為8、現有6碼）的 traits、interest、topic、value 與 region 陣列；When 本人儲存並接著測試重複及超上限元素；Then 上限合法資料保存且重複、未知鍵、超限資料被拒絕；And preferredAgeMin/Max 成對且18至120、Min不大於Max。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-052` **`CompressionExactBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-052`（AP-AC-019）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 不同影像大小剛好等於200000 bytes並透過分段輸入；When 共用壓縮服務處理輸入；Then 成功輸出小於或等於200000 bytes；And 保留長寬比、方向與五官可辨識，不保留 EXIF/GPS。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-053` **`CandidateIndexBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-053`（AP-AC-003）
  - **前置／動作／預期**：以真 D1／私人 R2、受控 provider 故障注入測試：Given 本人持有尚未到期、只成功產出索引1與2的 attemptId；When 本人請求索引0、3、5或他人 attemptId；Then 僅實際存在且屬本人的1與2可讀，其餘索引拒絕；And R2 key 從 server CurrentUser.accountId 推導，且最多容許索引4。需驗資料及授權、不得只比對 HTTP Mock；真 Gemini 證據另列。

- [x] `AP-IT-054` **`AvatarSelectionRace_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-054`（AP-AC-003）
  - **前置／動作／預期**：應用整合（可替身 provider，但 Gemini 真測另列）：Given 本人有兩個有效候選且同時送同一 expectedRevision；When 兩個不同選用請求同時提交；Then 只有一個 CAS 成功且 revision 增加1；And 落敗的複製檔案被補償，最終唯一角色仍可讀。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-056` **`SecretExposureBoundary_Integration_EnforcesPersistenceAndAccess`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-056`（AP-AC-024）
  - **前置／動作／預期**：真 Miniflare D1 與私人 R2（媒體故障以受控替身注入）：Given Gemini server secret 與本人照片已配置於測試環境；When 執行成功與故障生成、產出客戶端 bundle；Then 日誌、API response、bundle、R2 object key 均無明碼秘密或 raw source；And 僅留下去識別的驗證證據。需檢查狀態、受影響列數、授權及補償，不得僅比對 HTTP mock。

- [x] `AP-IT-057` **`InsertPhoto_ParallelFifthSixthRequests_OnlyOneSucceeds`**
  - **稽核缺漏**：`RG-02`；**優先級**：高；**BDD**：`AP-BDD-047`；**來源**：RA-03、BDD-047/048
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真 Miniflare D1 已有4張ready，同帳號兩獨立請求競爭第5／第6張
  - **預期斷言**：兩個獨立客戶端同時入庫，pending／ready 計數確定≤5，失敗不能留可讀 R2。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-058` **`InsertPhoto_ConditionalReturningNoRow_MapsToPhotoLimit409`**
  - **稽核缺漏**：`RG-03`；**優先級**：高；**BDD**：`AP-BDD-047`；**來源**：RA-03、BDD-047
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真 Miniflare D1 已有5張pending+ready，執行單句prepared條件INSERT並讀RETURNING/changing count
  - **預期斷言**：用真 D1 讀 `RETURNING`／`changes` 結果；不能將0列看作成功，無 SQL Trigger。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-059` **`MediaCommands_IdentityFieldsAndIllegalTransitions_RejectMutation`**
  - **稽核缺漏**：`RG-04`；**優先級**：高；**BDD**：`AP-BDD-049`；**來源**：RA-03、BDD-049
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：逐一嘗試受控命令修改owner/kind/objectKey、deleted→ready、ready→pending與跨帳號寫入
  - **預期斷言**：列出所有 command 可用更新欄位，禁止改 owner/kind/objectKey、deleted復活、ready倒回pending；同時測命令繞行。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-061` **`GenerateAvatar_LiveGeminiSingleImagePerRequestWithBoundedCost`**
  - **稽核缺漏**：`RG-07`；**優先級**：中；**BDD**：`AP-BDD-015`；**來源**：RA-01、AP-BDD-015/034/035/036
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真Gemini 2～5張已存來源，每張請求僅生成1張，另外注入無圖、重複圖與單張逾時並量測成本。
  - **預期斷言**：真 Gemini 每個請求只回1張真圖、可解碼／安全／互異且成功才計入 producedCount；逐張驗證耗時、費用、R2與同帳號排他，沒有圖片／超時不得假成功或清除先前有效候選。不以Mock、Fixture冒充真測。

- [x] `AP-IT-062` **`CompressPersonalPhoto_FaceRegionAndPortraitOrientation_AcceptsHumanQualityReview`**
  - **稽核缺漏**：`RG-08`；**優先級**：中；**BDD**：`AP-BDD-052`；**來源**：RA-07、AP-BDD-002/052/063
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：以授權真人照通過分段stream壓縮到200000bytes、核對比例/EXIF、人工驗人臉相似度
  - **預期斷言**：200000 bytes來源照的臉部可辨識與比例；生成角色格式獨立，不對其套200KB來源照限制。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-063` **`SelectGeneratedAvatar_AfterR2CopyBeforeD1Commit_CompensatesOrphan`**
  - **稽核缺漏**：`RG-10`；**優先級**：中；**BDD**：`AP-BDD-040`；**來源**：RA-09、BDD-040/054
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：真D1/R2完成候選複製但在選用revision CAS前注入失敗與並發
  - **預期斷言**：選中只有一張轉永久；兩個 CAS 同時選、R2已複製但 D1 失敗需補償並保留舊化身。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-064` **`AvatarCandidate_At60MinuteExpiry_RefusesReadAndSelection`**
  - **稽核缺漏**：`RG-11`；**優先級**：中；**BDD**：`AP-BDD-037`；**來源**：RA-09、AP-BDD-037/053
  - **測試位置**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **前置／操作**：固定時鐘於候選59:59、60:00、60:01及跨帳號讀取與選用
  - **預期斷言**：候選59:59可用、60:00與之後必不可讀；R2 lifecycle延遲亦不可繞過 metadata 失效。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-IT-066` **`SingleGeneratedCandidate_ConfirmedFirst_PersistsOnlyOne`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：以真 R2／D1 成功產生第1張並立即採用；預期 永久R2及DB僅1張候選，成功後關閉短效本輪、沒有後續 Gemini 請求。

- [x] `AP-IT-067` **`PreviouslySkippedCandidate_StillReadableAndSelectable`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：真私人R2短效有兩張有效候選，第二張產出後回選第一張；預期 效期內第一張可讀並被正式採用；第二張仍不落正式DB，到期由GC清理。

- [x] `AP-IT-068` **`R2ManifestConditionalWrite_AcrossWorkers_EnforcesOneInFlightAndMaxFour`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：真 R2／Worker 不同實例同帳號同時用不同 attemptId 爭搶首次 open attempt，以及同輪並行產第4張；另測重送與過期 inFlight；預期 R2 manifest 條件寫入／CAS嚴格跨 attempt 僅一個 active 指標、同輪僅一個有效 inFlight 占位，絕不發第5張或重複呼叫；未能證實則阻擋硬Gate。

- [x] `AP-IT-069` **`SingleFailure_LeavesValidEarlierCandidatesAndNoGhostIndex`**
  - **位置建議**：`datinghigh/tests/integration/avatar-and-preferences/`
  - **來源**：`AP-BDD-072`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：真R2已有2張，第3張 provider故障、重複或未知計費而回503；預期 先前2張仍可讀／採用，server成功數不變且不產生假 index，不自動重試。

- [x] `AP-API-001` **`GetProfileCatalog_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/profile-catalog；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。回應包含五類版本化標籤；不依賴登入Email。

- [x] `AP-API-002` **`GetProfileCatalog_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/profile-catalog 送出請求；惡意 query 依Foundation共通傳輸回400 INVALID_REQUEST，撤銷回401 SESSION_REVOKED，均驗對應ProblemDetails；不得成功寫入或洩漏私人欄位。2026-11-04澄清傳輸錯誤與交友欄位驗證的區別，不改既有Foundation錯誤碼。

- [x] `AP-API-003` **`GetProfileCatalog_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/profile-catalog`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/profile-catalog；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-004` **`GetAvatarCatalog_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/avatar-catalog；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。16個正式不同的 male/female 插畫資產、ID有效。

- [x] `AP-API-005` **`GetAvatarCatalog_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/avatar-catalog 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-006` **`GetAvatarCatalog_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/avatar-catalog`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/avatar-catalog；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-007` **`GetDatingProfile_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/dating-profile；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。owner以已驗證CurrentUser約束，不接受client傳owner或回傳認證識別；驗revision、profileReady、目前照片metadata，隱藏密鑰。

- [x] `AP-API-008` **`GetDatingProfile_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/dating-profile 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-009` **`GetDatingProfile_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/dating-profile；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-010` **`PutDatingProfile_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/dating-profile；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。合法生日、工作、固定 JSON 欄位與 CAS；敗者不覆蓋。

- [x] `AP-API-011` **`PutDatingProfile_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/dating-profile 送出請求；驗 409 PROFILE_VERSION_CONFLICT／400 INVALID_PROFILE 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-012` **`PutDatingProfile_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/dating-profile`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/dating-profile；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-013` **`PostPersonalPhoto_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 POST /api/v1/me/photos；斷言 201 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。獨立串流、8 MiB、200000bytes、無 Trigger 的單條件 INSERT。

- [x] `AP-API-014` **`PostPersonalPhoto_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 POST /api/v1/me/photos 送出請求；驗 413 IMAGE_TOO_LARGE／409 PHOTO_LIMIT_REACHED／400 INVALID_IMAGE 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-015` **`PostPersonalPhoto_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 POST /api/v1/me/photos；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-016` **`GetPersonalPhotos_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/photos；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人照片與排序，跨 owner 不洩漏。

- [x] `AP-API-017` **`GetPersonalPhotos_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/photos 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-018` **`GetPersonalPhotos_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/photos`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/photos；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-019` **`PutPhotoOrder_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/photos/order；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。完整有效 ID 集合和 revision；同 D1 batch。

- [x] `AP-API-020` **`PutPhotoOrder_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/photos/order 送出請求；驗 400 INVALID_PROFILE／409 PROFILE_VERSION_CONFLICT 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-021` **`PutPhotoOrder_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/photos/order`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/photos/order；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-022` **`DeletePersonalPhoto_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 DELETE /api/v1/me/photos/{assetId}；斷言 204 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人且狀態條件刪除；已刪對方不可新讀。

- [x] `AP-API-023` **`DeletePersonalPhoto_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 DELETE /api/v1/me/photos/{assetId} 送出請求；驗 404 PHOTO_NOT_FOUND 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-024` **`DeletePersonalPhoto_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 DELETE /api/v1/me/photos/{assetId}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 DELETE /api/v1/me/photos/{assetId}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-025` **`GetPrivateMedia_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/media/{assetId}；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。只本人可讀、no-store/nosniff、不回 objectKey。

- [x] `AP-API-026` **`GetPrivateMedia_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/media/{assetId} 送出請求；驗 404 PHOTO_NOT_FOUND／401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-027` **`GetPrivateMedia_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/media/{assetId}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/media/{assetId}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-028` **`PostAvatarGeneration_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 POST /api/v1/me/avatar/generations；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。兩至五張已保存照片、每次只真產1張、回傳attemptId/index/producedCount/expiresAt、同輪上限4且不建Job、不建立 job。

- [x] `AP-API-029` **`PostAvatarGeneration_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 POST /api/v1/me/avatar/generations 送出請求；驗 503 IMAGE_PROVIDER_UNAVAILABLE／429 RATE_LIMITED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-030` **`PostAvatarGeneration_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 POST /api/v1/me/avatar/generations`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 POST /api/v1/me/avatar/generations；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-031` **`GetAvatarCandidate_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/avatar/candidates/{attemptId}/{index}；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。R2短效與 owner/key 推導，索引1至4。

- [x] `AP-API-032` **`GetAvatarCandidate_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/avatar/candidates/{attemptId}/{index} 送出請求；驗 410 AVATAR_CANDIDATE_EXPIRED／404 AVATAR_CANDIDATE_NOT_FOUND 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-033` **`GetAvatarCandidate_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/avatar/candidates/{attemptId}/{index}`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/avatar/candidates/{attemptId}/{index}；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-034` **`PutAvatarSelection_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 PUT /api/v1/me/avatar/selection；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。免費與 generated 擇一、舊化身不被不完整請求覆寫。

- [x] `AP-API-035` **`PutAvatarSelection_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 PUT /api/v1/me/avatar/selection 送出請求；驗 400 INVALID_AVATAR_SELECTION／409 PROFILE_VERSION_CONFLICT 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-036` **`PutAvatarSelection_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 PUT /api/v1/me/avatar/selection`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 PUT /api/v1/me/avatar/selection；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-037` **`GetCardPreview_Success_ReturnsDocumentedResponse`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：使用本人有效 Web Cookie／native Bearer 呼叫 GET /api/v1/me/card-preview；斷言 200 與 camelCase JSON／對應串流、no-store、預期的完整 DTO。本人當前名片投影；不表示同意對方讀。

- [x] `AP-API-038` **`GetCardPreview_InvalidOrUnauthorized_ReturnsProblemDetails`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：以不合法輸入／撤銷 Session／跨 owner 對 GET /api/v1/me/card-preview 送出請求；驗 401 SESSION_REVOKED 對應 ProblemDetails；不得成功寫入或洩漏私人欄位。

- [x] `AP-API-039` **`GetCardPreview_WebNativeBoundary_EnforcesTransport`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`SPEC §7 GET /api/v1/me/card-preview`（AP-AC）
  - **前置／動作／預期**：以 Web Origin／clientPlatform 與原生 Bearer 分別呼叫 GET /api/v1/me/card-preview；驗既有同意的 CSRF／Session family 規則、嚴格 body schema 與 Content-Type；圖片串流不得放寬全域 16 KiB JSON 限制。

- [x] `AP-API-040` **`UploadMediaStream_WebNativeMultipartAndBinary_EnforcesOriginAnd8MiBLimits`**
  - **稽核缺漏**：`RG-01`；**優先級**：高；**BDD**：`AP-BDD-002`；**來源**：RA-02、§7 POST /me/photos
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **前置／操作**：Web Cookie+Origin／Android或iOS Bearer，真二進位圖片串流、>8MiB與偽造Origin的受控上傳
  - **預期斷言**：Web原 Cookie + Origin 必經正確 CSRF；native Bearer；8192原測試儲存路徑不能當生產照片路徑。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-API-041` **`PutDatingProfile_TopicTagIdsAndLegacyCodes_RoundTripsExactSchema`**
  - **稽核缺漏**：`RG-09`；**優先級**：中；**BDD**：`AP-BDD-007`；**來源**：RA-08、AP-BDD-007/041/051
  - **測試位置**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **前置／操作**：PUT再GET含interestTagIds/topicTagIds/valueTagIds與preferences九鍵，並輸入未知/重複鍵、停用歷史代碼
  - **預期斷言**：九鍵偏好 JSON、三欄 interests JSON、topicTagIds、未知鍵拒絕、舊目錄代碼可回讀。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-API-042` **`PostAvatarGeneration_FirstCall_ReturnsSingleCandidateEnvelope`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-069`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：POST /api/v1/me/avatar/generations帶styleId與clientRequestId，首次無 attemptId；預期 200只包含 index=1、producedCount=1、maxCandidates=4、expiresAt與attemptId，不含其他三張、raw source 或R2 key。

- [x] `AP-API-043` **`PostAvatarGeneration_NextCall_RequiresAttemptAndExpectedCount`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-070`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：POST同一路由續帶attemptId、expectedProducedCount與新clientRequestId；預期 每次只增加一張、正確回 index=2；偽造attemptId、style變更或不連續count回400／409。

- [x] `AP-API-044` **`PostAvatarGeneration_ParallelOrDuplicate_ReturnsIdempotentOrConflict`**
  - **位置建議**：`datinghigh/backend/tests/DatingHigh.Api.Tests/AvatarAndPreferences/`
  - **來源**：`AP-BDD-071`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：兩個分頁同時送不同requestId及相同requestId重送，並測producedCount=4或closed；預期 相同requestId重放回既有結果／受控in-progress；不同競爭409，滿額或closed拒絕，沒有額外Gemini呼叫。

- [x] `AP-E2E-001` **`PhotoScreenEmptyState_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-002` **`PhotoScreenEmptyState_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-057`（AP-AC-001、AP-AC-020）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人進入沒有任何照片的個人資料頁；操作 畫面完成載入並按新增照片；應驗證 呈現空狀態與完整用途提醒文案，且 圖片選擇取消後不呼叫上傳 API 且不報成功。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-004` **`FreeAvatarPickerUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-005` **`FreeAvatarPickerUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-058`（AP-AC-004、AP-AC-017）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人進入免費角色清單；操作 瀏覽兩組各八種插畫並選一種；應驗證 可辨識的16張資產完整顯示，且 選中的角色與目前選用狀態正確顯示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-007` **`PersonalPhotoUploadUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-008` **`PersonalPhotoUploadUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-059`（AP-AC-001、AP-AC-009）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人在手機或 Web 選擇一張照片；操作 送出有效上傳或使用超額圖片；應驗證 呈現上傳處理狀態與明確成功／失敗回饋，且 失敗不假顯示已成功且可重新選圖。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-010` **`PhotoOrderDeleteUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-011` **`PhotoOrderDeleteUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-060`（AP-AC-001）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人已有三張可見照片；操作 拖曳重排或選擇刪除；應驗證 顯示新順序或明確刪除確認結果，且 版本衝突需提示重新整理而非覆蓋新資料。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-013` **`AiLockEntryUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 本人已存兩張以上 ready 真人照；When 點擊帶鎖頭的 AI 按鈕進入產圖頁；Then 顯示風格選擇及醒目的第三方 Gemini 照片使用提醒，按「開始產生第1張」後才送出一張請求；And 僅開頁不得呼叫 Gemini、無第二個送照同意跳窗、無付款／扣點；每張完成可採用或繼續。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-014` **`AiLockEntryUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-061`（AP-AC-018）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 本人已存兩張以上 ready 真人照；When 點擊帶鎖頭的 AI 按鈕進入產圖頁；Then 顯示風格選擇及醒目的第三方 Gemini 照片使用提醒，按「開始產生第1張」後才送出一張請求；And 僅開頁不得呼叫 Gemini、無第二個送照同意跳窗、無付款／扣點；每張完成可採用或繼續。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-016` **`AiGenerateLoadingUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 本人正產生本輪第2張且第1張已成功；When 本人在兩個分頁快速重送同一 clientRequestId 或連點「產生下一張」；Then 介面只顯示一個進行中請求，server 使用短效排他與冪等拒絕額外 Gemini 呼叫；And 產生第二張成功才占下一個 index，出錯保留第1張且不自動重試。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-017` **`AiGenerateLoadingUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-062`（AP-AC-003、AP-AC-018）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 本人正產生本輪第2張且第1張已成功；When 本人在兩個分頁快速重送同一 clientRequestId 或連點「產生下一張」；Then 介面只顯示一個進行中請求，server 使用短效排他與冪等拒絕額外 Gemini 呼叫；And 產生第二張成功才占下一個 index，出錯保留第1張且不自動重試。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-019` **`AiFourChoicesUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 本人本輪依序成功取得四張3:4半身至腰部互異插畫候選；When 本人回選第2張、看完採用確認並確定選用；Then 清楚標示候選2並只將此張設為遊戲化身，四張畫框不裁切五官；And 其餘三張不留永久資產，第四張後無法再要求第5張。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-020` **`AiFourChoicesUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-063`（AP-AC-003、AP-AC-022）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 本人本輪依序成功取得四張3:4半身至腰部互異插畫候選；When 本人回選第2張、看完採用確認並確定選用；Then 清楚標示候選2並只將此張設為遊戲化身，四張畫框不裁切五官；And 其餘三張不留永久資產，第四張後無法再要求第5張。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-022` **`AiFailureRecoveryUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：Web 專屬使用者驗收：Given 當次 provider 逾時、回傳錯誤或本輪到期；When 畫面收到503、429、409或410回應；Then 提供可理解的錯誤、保留既有有效候選；不確定供應商成本的逾時不得自動重送；And 不顯示假成功、舊化身不變，已到期候選不得再採用。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-023` **`AiFailureRecoveryUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-064`（AP-AC-003、AP-AC-024）
  - **前置／動作／預期**：Android 專屬使用者驗收：Given 當次 provider 逾時、回傳錯誤或本輪到期；When 畫面收到503、429、409或410回應；Then 提供可理解的錯誤、保留既有有效候選；不確定供應商成本的逾時不得自動重送；And 不顯示假成功、舊化身不變，已到期候選不得再採用。本平台未實跑不得以別的平台替代或標已通過。

- [x] `AP-E2E-025` **`DatingProfileFormUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-026` **`DatingProfileFormUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-065`（AP-AC-005、AP-AC-012、AP-AC-013、AP-AC-021）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人打開工作與偏好表單；操作 輸入合法工作或空白工作並儲存；應驗證 前端顯示與後端一致的驗證結果和最新 revision，且 未成年、非法年齡偏好和非法標籤具體提示。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-028` **`MyCardPreviewUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-029` **`MyCardPreviewUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-066`（AP-AC-020、AP-AC-015）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人有工作與私人照片；操作 點開自己的名片預覽；應驗證 明確列出被同意後可分享的欄位及壓縮版照片，且 不把本人預覽誤認為已授權對方查看。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-031` **`ConsentGateUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-032` **`ConsentGateUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-067`（AP-AC-016、AP-AC-023）
  - **前置／動作／預期**：原生圖片選取／返回：前置 候選配對尚未取得同輪有效雙方同意；操作 使用者嘗試從 UI 或猜 URL 查看對方真人照；應驗證 UI 不提供有效入口且後端回拒絕，且 對方照片不得以公開 R2 圖址洩漏。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-034` **`ProfileReloginConsistencyUi_Web_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：瀏覽器與鍵盤操作：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 完成表單與選角操作並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-035` **`ProfileReloginConsistencyUi_Android_ReflectsExpectedUserOutcome`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-068`（AP-AC-001、AP-AC-003、AP-AC-012）
  - **前置／動作／預期**：原生圖片選取／返回：前置 本人於 iOS、Android 或 Web 使用個人資料與選角；操作 完成表單與選角操作並重新登入；應驗證 表單與照片及化身選擇可操作且資料重讀一致，且 不以原型 Fixture／舊照片快取遮蔽目前值。若平台未可驗收明確標示未驗收，不以 Web 取代原生。

- [x] `AP-E2E-037` **`GenerateAvatar_BeforeThirdPartyDisclosure_DoesNotTransmitSourcePhoto`**
  - **稽核缺漏**：`RG-06`；**優先級**：高；**BDD**：`AP-BDD-061`；**來源**：RA-05、BDD-001/061
  - **測試位置**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **前置／操作**：Web／Android／iOS進入鎖頭頁但未按開始就離開、照片不足，及明確按「開始產生第1張」
  - **預期斷言**：使用者未主動觸發 AI 時，Gemini 無外送請求；UI 顯示傳送用途及明確操作。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-E2E-038` **`BuiltinAvatarCatalog_SixteenDistinctLicensedImages_ValidatesActualAssets`**
  - **稽核缺漏**：`RG-12`；**優先級**：中；**BDD**：`AP-BDD-005`；**來源**：RA-10、BDD-005/058
  - **測試位置**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **前置／操作**：逐一驗16張獨立正式角色素材授權與視覺差異，於Web/Android/iOS測3:4容器
  - **預期斷言**：逐16個ID辨識、來源授權、實際資產不同，三平台載入與容器裁切。不得以 Mock、Fixture 或單一平台成功冒充要求的真整合與跨平台結果。

- [x] `AP-E2E-039` **`AdoptConfirmation_Web_ShowsFutureChargeNoticeAndCancelPreservesSession`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-073`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：Web產圖成功1～4張後按採用，先取消再確認；預期 顯示採用結束本輪／未來正式付費重生依方案收費、目前免費；取消保留本輪，確認才正式採用，不扣款。

- [x] `AP-E2E-040` **`AdoptConfirmation_Android_ShowsFutureChargeNoticeAndCancelPreservesSession`**
  - **位置建議**：`datinghigh/tests/e2e/avatar-and-preferences/`
  - **來源**：`AP-BDD-073`（AP-AC-003、AP-AC-018／024；D-050）
  - **前置／動作／預期**：Android產圖成功1～4張後按採用，先取消再確認；預期 顯示採用結束本輪／未來正式付費重生依方案收費、目前免費；取消保留本輪，確認才正式採用，不扣款。
