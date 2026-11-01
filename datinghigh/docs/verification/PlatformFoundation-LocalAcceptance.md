# PlatformFoundation 本地驗收範圍

2026-10-30 使用者決策 D-033、D-035：本輪限定本地 Web 與 Android；iOS 及雲端部署保留暫緩，不計為通過。不修改原規格中的完整平台要求。

| 項目 | 本地可驗證的部分 | 本地證據的界限 |
|---|---|---|
| API、D1、私人 R2 | 真本地 Worker／Container／Miniflare D1／R2、原子交易、重啟持久性、故障與復原 | 不代表 Cloudflare 雲端部署、網路與資源設定已通過 |
| Web | localhost UI、HttpOnly／SameSite Cookie、多分頁、重試、逾時與儲存清理 | HTTPS Secure Cookie、公開網域、雲端 Origin／CORS 與路由需部署後另驗 |
| Android | development APK、API36 模擬器、真 SecureStore、本地 API、SDK 邊界故障 | 不代表實體裝置、其他 Android 版本或發行簽章已驗收；TalkBack 依使用者決定暫緩，節點／鍵盤檢查另列 |
| Google | CookieSelf 的 DatingHigh Web／Android OAuth 已完成真 SDK 登入；Android 另自動測真 SDK 首次建帳、冷恢復、登出及連結管理 | 使用者先前完成人工登入並授權自動選擇既有帳號；受控 JWKS、預置 Google 身分及 SDK 載入不算真登入成功，也不代替 iOS 或雲端設定 |
| Email | 本地 Log 驗證碼、受控寄送成功／失敗／逾時、真 API／D1 的註冊與 reset | 未配置真寄件來源及收件匣，無法證明真實送達、垃圾信判定或 Cloudflare EMAIL binding；受控 provider 不替代收信證據 |
| iOS | 共用程式與受控邊界測試 | 依使用者決策暫緩；沒有 iOS SDK、Keychain、原生畫面或 development build 的執行證據 |
| staging／production | 設定檢查、部署前拒絕缺少 sender 的配置 | 本輪不部署、不啟用付費；雲端 Containers 啟動、公開 HTTPS、正式 binding、真寄信與資源配置保留未驗收 |

真 Google 登入仍屬本地驗收範圍。真收信需要使用者提供／配置可用寄件服務及測試收件匣；本輪不擅自建立付費資源，也不把缺少的收信證據標成成功。

實際執行結果與逐項缺項另見 [驗證紀錄](SPEC-001-PlatformFoundation-Verification.md) 及 [逐項稽核](SPEC-001-PlatformFoundation-DeepAudit.md)。

驗收程式分別回報完整原規劃的 `accepted`／`missing` 與本地範圍的 `scopedAccepted`／`scopedMissing`。本地結果需有本地案例完整覆核、Web／Android 實際帳號流程及兩平台真 Google 登入等證據；只有明確記錄的使用者暫緩，才可從本地判定排除 iOS／staging。真收信和原始完整平台矩陣仍保留在完整缺項，不能由本地結果代替。
