# Web／Android／iOS 驗收

對應 PF-E2E-001..018。Web、Android、iOS 各列結果；必要子項未執行時原案例保持未完成。

Web：export 後執行 `npm run test:web`。真本地流程包括 HttpOnly Strict Cookie、Email 註冊、登入、改密碼、reset、其他裝置取代與 focus 清除；受控 sender／離線故障另外標記，不作真收信證據。查看 360px 與桌面置中，無橫向溢出、focus 可見、減少動態、所有表單可捲動。

Android：`npm run build:android`，安裝 development APK，啟動 Metro 8082，對明確 emulator 作 localhost reverse，開 development URL，執行 `npm run test:android`。確認註冊成功、強制停止後以 SecureStore Refresh 恢復、logout、重新密碼登入及被其他裝置取代後清 UI。驗碼／密碼不寫 UI dump、影片、log；測試只保存摘要與 APK SHA-256。真機需補軟鍵盤、safe area、TalkBack 與失敗 SecureStore 情境。

iOS：在 macOS/Xcode 或已配置 EAS 建立 development build；目前沒有此環境證據。記 build／裝置／OS／簽章與 URL scheme，驗同一組表單、Keychain 恢復、失效與 logout。不可將 Android APK 或 Web 結果填為 iOS 完成。

真 Google：每平台以實際 SDK 操作首次／既有登入、取消、切換帳號與晚到結果；token 僅記憶體與 HTTPS body。核對 RS256／固定 issuer／平台 audience／azp、email_verified、gmail 或相符 hd。受控 JWKS 單元測試不能作三平台真 Google 證據。

同 Account 逐次驗收，每次新登入都撤銷前一 family；不要求同時保持多裝置有效。所有尚缺的參數組合列在驗證報告，不用測試數量代替需求完成率。

Android 本地矩陣依序執行 `test:android:forms`、`test:android:recovery`、`test:android:retry`、`test:android:account`、`test:android:identity`。帳號組涵蓋錯誤登入同文案、空登入方式、重設表單拒絕及已提交但遺失回應時不重放、舊憑證失效與新密碼登入。identity 組只在開發測試環境替換 Google SDK 回傳值，仍執行真 Screen、API、Worker 與 D1，驗直接連結／密碼驗證解除及 Google-only 設密碼；production 禁止使用此測試 profile。這些受控服務測試不代替真 Google SDK 或收信。需要隔離 ADB 時，以 `tools/test-android.ps1 -Suite <suite> -AdbPort 5038` 指向已確認的專用 server；不重啟其他工具的 ADB。
