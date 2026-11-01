# 本地 Email 與相依套件補驗

2026-11-01。僅調整 PlatformFoundation 的本地測試入口、文件與 client 相依；不部署、不改資料模型或認證合約。原完整平台的暫緩項目仍依既有驗收紀錄保留。

## 本地驗證碼

`cloudflare/wrangler.jsonc` 固定 `APP_ENV=local`、`EmailDeliveryMode=Log`；`EmailCodeSender` 只在此組合輸出 `LocalEmailVerification`。註冊、reset 與重寄都有 `Purpose`、`Challenge`、`Recipient`、`Generation`、六位 `Code` 與 `ExpiresAt`；HTTP 回應僅有流程 metadata，不回傳驗證碼。

`npm run test:email:local` 已在真本地 Worker／Container／.NET／D1 上通過：

- 讀取容器 log 的註冊碼，建立已驗證帳號。
- 註冊、reset 的第 0 代碼都在指定 category；冷卻前重寄回 429。
- 實際等待 61 秒後，兩種重寄回 202，log 都出現第 1 代碼。
- 使用重寄後的碼成功建帳與重設密碼；reset 不自動登入，舊密碼與舊 Access 失效，新密碼登入原帳號成功。
- 測試帳號最後登出；報告只有通過結果，不保存 log 行、碼、密碼或 token。原始結果為 `.local/evidence/local-email-log-20261101.log`。

實作驗證位於 [local-email-log.test.mjs](../../tests/integration/local-email-log.test.mjs)；日常查看命令見 [README](../../README.md)。容器重建後須重新找容器 ID；舊碼日誌若已遺失，可於冷卻後重寄，不增加查碼 API，也不保存明碼到 D1。

未知 Email 的 reset 維持同形 202，但不寄碼也不產生對應 log；Google-only 的既有帳號可設本地密碼。這兩種帳號邊界沿用先前 Web／Android／真 D1 的三種帳號寄送矩陣，不以「沒有 log」誤判未知帳號寄送失敗。

## 相依弱點修補

重新稽核的 client 是 13 筆（2 high／10 moderate／1 low），與先前紀錄的 8 筆不同；根目錄與 Worker 都是 0。修補後三個 npm 專案的稽核均為 0，NuGet 的 9 個專案亦未列出已知弱點。

| 調整 | 原因 |
|---|---|
| Expo `58.0.21` → `58.0.22` | 同 SDK 修補版；其 CLI／config 更新移除舊 `zod`、`deepmerge` 相依，安裝後樹狀查詢確認不再包含兩者 |
| expo-dev-client `~58.0.18`、expo-router `~58.0.29` | 對齊新版 Expo 的相容性檢查；仍保留 RN `0.88.1` 與原 SDK 58 |
| npm override：glob `14.0.2` | 採用 AbortSignal 取消後停止背景遍歷的已修補版；Expo 上游的 `^13` 尚無符合公告修補範圍版本 |
| npm override：minimatch `11.0.1` | 採用 globparts amplification 已修補版；固定版本並更新 lockfile |

未停用 audit、未忽略警示，也未降回舊 Expo SDK。`glob`／`minimatch` 跨 major 的相容性以 Expo config、Web 匯出、fingerprint／Android 建置及實際流程回歸驗證。

公告依據：[glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)、[minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249)、[zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)、[deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)。原始 npm before／after JSON、NuGet JSON、版本樹及建置紀錄均保留在忽略的 `.local/evidence`。

## 回歸

| 檢查 | 結果 |
|---|---|
| `npm run check:foundation` | 327 個測試及兩個型別檢查通過；對齊兩個 client 套件後再次通過 client 型別與 106 個測試 |
| `expo install --check` | `Dependencies are up to date` |
| 原生測試 profile 防護 | 3 項通過；測試 Google adapter 無法進入一般或 production build |
| Web 匯出與回歸 | 最終版本匯出成功，註冊、reset、Cookie／refresh、登出、替代登入、視覺／鍵盤與逐頁可達性共 8 項通過 |
| 公開輸出秘密值掃描 | 15 個公開檔案，三個本地後端秘密值零命中 |
| Android | 同 SDK 修補版重建成功（744 個 Gradle tasks）；原 Debug 簽章 SHA-1 不變。API36 新 APK 真 Google 首次201、冷啟refresh200、登出204與再次冷啟不復活均通過 |

Android 工具鏈的 Gradle／Kotlin 棄用提示與 npm 弱點稽核分開記錄，並未透過關閉警告來取得零弱點結果。

新版 APK 及 SHA256 記錄在 `.local/evidence/android-security-apk.json`，真 SDK 結果為 `native-google-security-20261101.json`／`native-google-security-20261101-network-restored.log`。原更新安裝曾因模擬器空間不足被拒；確認原簽章後僅對 `com.datinghigh.app` 執行保留資料的替換安裝，未刪除 Google 帳號或其他 App 資料。首輪建置為對齊 Expo 相容版本而主動中止。

三次 Google UI 嘗試均取消且未送登入 API；裝置診斷顯示 Google 授權 NETWORK_ERROR，且 DNS 無法解析、IP 連線回 Network is unreachable。重連原有 AndroidWifi 後恢復路由／DNS，相同 APK 的完整真 SDK 流程通過。自動化另補安全的套件限制、完整帳號文字優先與不含個資的階段旗標；未加長產品45秒期限。三次取消 JSON／log 均保留，未算為通過。
