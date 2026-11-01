# PlatformFoundation 本地案例覆核

本表依使用者 D-033、D-035 決策檢查 Web 與 Android 本地範圍。2026-10-31 使用者另決定先跳過 TalkBack 實際讀屏，僅保留已完成的可及性節點與操作檢查；不將 TalkBack 記為通過。原 TDD／BDD 的完整狀態仍保留 iOS、staging 與真收信要求，見[逐項深度稽核](SPEC-001-PlatformFoundation-DeepAudit.md)。受控 SDK／寄信案例只證明被控邊界及其後的實際程式與資料庫，不能取代真 OAuth 或實際收信。

| 規劃案例 | 本地證據與未完成項 |
|---|---|
| UT 117、IT 35、API 51 | 原規劃案例已完整覆核，實際測試及對應位置見逐項深度稽核；另有固定 Google 公開金鑰橋接、CORS 與本地／完整範圍判定回歸。 |
| E2E-001 | Web／Android build、Email 流程、SecureStore 恢復、登出與裝置取代已測；使用者確認兩平台真 Google 登入。另以真 Android SDK、Google 公鑰及隔離 D1 自動完成首次建帳、冷啟 refresh、登出及再次冷啟不復活（`.local/evidence/native-real-google-lifecycle.json`）。Web→Android 同 Email 帳密實際 UI 登入也確認同 owner、撤舊建新及 Web 回前景清除私人畫面（`.local/evidence/cross-platform-email.json`）。 |
| E2E-002 | Web 小螢幕逐頁欄位標籤、焦點、可捲動、按鈕尺寸與減少動態已測（`.local/evidence/web-screen-accessibility.log`），另有共用元件矩陣；Android 真鍵盤、1.3／2.0 字體、橫向及 44dp 操作目標三案通過，也逐頁檢查指定標籤、可捲動及按鈕尺寸（`.local/evidence/native-accessibility-screens-passed.json`）。尚未以 TalkBack 執行完整讀屏操作，iOS 未驗收。 |
| E2E-003 | Web 與 Android 驗證、前導零、重複提交、五次錯碼鎖定、過期／重寄／舊碼、59／60 秒、六次限流已有實際 UI／API／D1 證據；Web 真 localhost Strict Cookie 的註冊、登入、refresh、登出串接已通過（`.local/evidence/web-local-complete-chain.log`）。真本地 Worker 對 127.0.0.1 網站 Origin 的 preflight 回 403，瀏覽器拒絕跨來源寫入（`.local/evidence/web-live-cors.log`）。 |
| E2E-004 | 使用者確認 Web 真 Google 登入及重登、Android 以同帳號原生登入；local Worker 記錄 201 與 200；固定唯讀彙總確認首次 Web 的帳號／Google 身分／session／generation 0 refresh，以及後續 Android 為同一帳號且原 Web family 已撤、Android family 為唯一有效 family（`.local/evidence/google-first-aggregate.log`、`.local/evidence/google-replacement-aggregate.log`）。沒有輸出帳號 ID 或 Email。iOS 與 staging 不在本輪範圍。 |
| E2E-005 | Web 登入流程與受控 Google controller 已測；Android 錯密碼／未知帳號同文案、本人資料與空登入方式均已通過；真 SDK 取消時沒有送出連結請求（`.local/evidence/native-real-identity-first-passed.json`）。 |
| E2E-006 | Web 實際 Cookie／API／D1 受控 SDK 的遲到與未知結果六案，以及原生 controller 取消、期限、重複與晚到結果已測；Android 實際 SDK 取消已通過。 |
| E2E-007 | Web／Android 各九組三種帳號 × 三種 sender 結果已測，包含通用文案、未知帳號無法重設及 Google-only 保留連結。 |
| E2E-008 | Web 錯／過期／重用碼與回應遺失已測；Android 九組重設及追加的錯／過期／確認不符、已提交回應遺失不重放、舊 Access／Refresh 失效與新密碼登入已通過（`.local/evidence/native-account-reset-passed-login-failed.json`）。 |
| E2E-009 | Web 本人摘要／空清單及跨 owner／未知資源拒絕、真容器私人 R2 隔離已測；Android 本人帳號摘要與空登入方式補跑通過。 |
| E2E-010 | Web 改密碼與舊 family 失效、Android 受控 401／成功／遺失回應及實際 D1 狀態已測；Web／Android 並行安全版本衝突的 UI、API 409 與原密碼保留均已通過（`.local/evidence/web-credential-race.json`、`.local/evidence/native-credential-race-passed.json`）。 |
| E2E-011 | 真 Google Web／Android 登入已由使用者確認；Android 受控 SDK 驗證 Google-only 設密碼；另以真 SDK、真 Google 公鑰及隔離 D1 驗證取消、直接連結、密碼解除、舊 session 失效及重新登入（`.local/evidence/native-real-identity-first-passed.json`）。該輪解除後另有兩次 Google 登入 503；相同 Email 衝突在隔離代理錯報 503 的缺陷已重現並修正為 Worker 的 409，原始兩次回應未保留錯誤碼，無法確證其原因。修正後真 SDK 全新帳號生命週期獨立通過；staging 原始要求仍未驗收。 |
| E2E-012 | Web 四種註冊／驗碼／登入／重設表單的 pending 禁重送及切頁均已補測通過；Android 四種註冊／驗碼／登入／重設表單的重複點擊與系統返回均已補跑通過，冷卻及第六次限流也已測。 |
| E2E-013 | Web／Android 逾時、讀取重試及未知寫入均有實際 HTTP 證據；Android 17 案及獨立暖寫補跑 1 案通過，客戶端假時鐘另精確檢查 45／30 秒。補強冷啟讀取故障後的明確重試／返回登入與 trace 顯示，Web／Android 實際 UI/API 測試均通過（`.local/evidence/bdd-085-web-recovery-final.log`、`.local/evidence/bdd-085-native-passed.json`）。 |
| E2E-014 | Web 多分頁、single-flight／409 與 session header 同步已通過。 |
| E2E-015 | Android development APK、真 SecureStore 冷恢復、寫入失敗、無效／遺失 Refresh 及回登入已測；iOS 暫緩。 |
| E2E-016 | Web 與 Android 的 handler 前 Access missing／expired、Refresh 409、禁止刷新類型、業務 401 與未知寫入不重放矩陣已有通過證據。 |
| E2E-017 | Web storage、Android 真 SecureStore 欄位與 flow 到期／清除已測；受控 Google proof 未出現在 Web storage、URL、resource URL 或 console（`.local/evidence/web-google-storage.log`）；Android 真 SDK 連結時實際 SecureStore 寫入欄位不含 Google 憑證、密碼、驗證碼或 Access Token（`.local/evidence/native-real-google-storage-auto.log`）。儲存政策另拒絕允許欄位中的 JWT 形狀憑證（`.local/evidence/storage-jwt-sinks.log`），程式稽核確認沒有應用自建 analytics／AsyncStorage 或敏感 console 輸出。Web 注入不完整帳號資料時不顯示已驗證或假登入方式、成功重試後才顯示；原生失效流程與正常登入回歸通過。本地覆核邊界為應用自己的 DTO、儲存、URL、bundle 與一般 log；第三方 Google SDK／系統帳號快取及雲端 telemetry 不列為已觀察。 |
| E2E-018 | Web 條件式登出與多分頁、Android 正常／回應遺失／冷啟重試及不撤後來 family 已測。另以 Android 真 SecureStore 延遲後繼寫入與登出交錯，確認先隱藏畫面、等待後撤銷、冷啟不復活（`.local/evidence/bdd-054-native-race-passed.json`）；Web 遲到 refresh 不復活舊 family 或影響新 family。 |
| E2E-019、020、023 | staging／正式 sender／真收信屬雲端要求，使用者已將雲端部署暫緩；不列為本地通過。 |
| E2E-021、022、024 | 本地備份還原、受控 sender 故障恢復及驗收缺項明示已有完整證據。 |

## 原完整 BDD 未關閉場景的本地覆核

原完整 92 場景中，80 場景的必要條件已完整覆核，詳見逐項稽核；其餘 12 場景逐條保留下列環境差異。下表的本地通過不會修改原場景勾選或分母。

| 場景 | 本地已完成的條件與證據 | 保留未驗收的原要求 |
|---|---|---|
| BDD-001 | 固定工具鏈／鎖檔、分層、真 Linux 容器、Web single export 與 Android development APK；Email 同 owner 交替登入見 `cross-platform-email.json` | iOS development build 與三平台依序執行 |
| BDD-002 | 真本地 Log 註冊請碼、D1 先建挑戰不建帳、HMAC／flow hash、正確規範化與 sender 故障矩陣 | 雲端 EMAIL binding 實際寄送 |
| BDD-004 | Web→Android 同 Email 帳密實際 UI 登入、同 owner／唯一最新 family、舊 Web 回前景清 UI；D1 交易失敗保留原登入另有整合測試 | 包含 iOS 的完整跨平台順序 |
| BDD-007 | 使用者真 Web／Android 同 Google 帳號登入、唯讀 D1 aggregate 確認同 owner 且舊 family 已撤；Android 真 SDK 生命週期獨立通過 | iOS SDK；公開 HTTPS 與雲端環境 |
| BDD-011 | 本地專用 Log 碼完成真 reset、cv 增加、舊憑證／碼失效、不自動登入；Web 與 Android 成功／拒絕／遺失回應矩陣 | staging／production 真 Email 收碼 |
| BDD-020 | Android 真 SecureStore 的正常冷恢復，真 Google 冷恢復，以及後繼寫入完成前不發布 Access 的失敗／延遲案例 | iOS Keychain／原生冷啟動 |
| BDD-044 | HTTP／DTO／JWT／owner 授權、應用儲存與 log 稽核；最終 Web bundle 對三個本地秘密的值掃描零命中。僅指定本地驗碼 category 可含碼 | 雲端 telemetry；第三方 SDK 及系統帳號服務內部快取未觀察 |
| BDD-068 | Web 真視窗與 Android 真畫面、品牌色／入口、Google 按鈕、從可信 session 才進帳號 | iOS 原生開始畫面 |
| BDD-069 | Web 大小視窗、focus／鍵盤／減少動態；Android 真鍵盤、字體 1.3／2.0、橫向、安全區元件矩陣及逐頁標籤／可達性 | iOS 原生；TalkBack 實際讀屏依使用者決定跳過 |
| BDD-088 | Android 真 SecureStore 失敗／失效 Refresh／新登入取代／未知登出不撤新 family；Web 對應恢復與多分頁矩陣 | iOS 原生同矩陣 |
| BDD-089 | Web sessionStorage 與 Android 真 SecureStore 僅恢復有效 metadata；完成／到期清除，冷啟不保留碼或密碼，真 SDK 路徑儲存欄位檢查與 JWT 值拒絕 | iOS Keychain；雲端 analytics／telemetry |
| BDD-093 | 本地真 Worker／Container／D1／私人 R2、重建、換 key、備份還原及故障 preflight 已測 | 此案的 staging 部署、公開 HTTPS、真收信與相容版本回復全保留，未部署或付費 |

檔名省略前綴者均位於忽略的 `.local/evidence`。每個本地結論依實際來源與執行證據覆核；完整程式／測試路徑及行號見 `foundation-traceability.json`。

## 本地結論

2026-10-31 完成本地範圍覆核，`localMatrix.status=passed`。最終 `check:foundation` 的 327 個測試及兩個型別檢查通過；最終匯出後 Web 全套先通過 82 項，1 項焦點測試失敗並單獨重現。該測試在導航後立即操作同名 Email 欄位，未先確認目標頁；補上目標頁標題等待後，原焦點檢查獨立通過。兩輪之間未修改產品程式；83 個不同案例均有通過證據，但不宣稱單輪全 83 項通過。原始失敗、重現及補跑結果均保留，摘要見 `.local/evidence/web-final-local-summary.json`。

本地 Web／Android 已無待使用者操作項目。iOS、TalkBack、雲端部署／真寄送收信、雲端 telemetry 及第三方系統內部快取保留上述界限；未發布 production。原完整 TDD 207/227、BDD 80/92，仍未達完整三平台及雲端 100%。

2026-11-01 追加完成[本地 Email 與相依套件補驗](PlatformFoundation-LocalEmailAndDependencies.md)：真 log 註冊／reset／重寄、三處 npm 零弱點、NuGet 9 專案零已知弱點，以及新版 APK 的真 Google／冷啟／登出回歸。模擬器無網路時的三次取消紀錄保留；恢復虛擬 Wi-Fi 後通過，未放寬產品期限或登入成功條件。原完整平台案例數不變。
