# PlatformFoundation 受控故障測試

此補充不取代三平台／staging runbook。受控 EMAIL provider、OS adapter 與 development SDK 故障 profile 只驗證指定邊界，不能算真 Google、收件匣或 iOS 裝置通過。

## 完整寄信路徑與瀏覽器

`npm run check:foundation` 包含7個 .NET Cloudflare sender 整合測試。實際 AuthApplication、EmailCodeSender、Worker dispatch、真 Miniflare D1 與受控 EMAIL provider 在同一輪執行；stdin/stdout IPC 不開公開 command endpoint。Clock 可推進精確10秒timeout、60秒resend。

```powershell
npm run build:e2e-host
npm --prefix frontend/client run export:web
npm run test:web
```

Web 測試 host 僅綁定隨機 loopback port，控制憑證只在父子程序記憶體。正式 API 透過 WebApplicationFactory 執行，真正 Worker／D1 仍在私有 IPC。測試 host／控制路徑不編入 API deployment。六組寄信測試涵蓋 register/reset × 成功/拒絕/timeout、保留原flow、resend、舊碼拒絕及新碼完成。多分頁案例另使用8787真正 Worker/Container 及 Strict Cookies。

## Layout 與真隔離 Container 故障

`npm run test:layout` 在8092執行32組實際共用元件測試。OS供給的 keyboard viewport、safe area 與平台行為由 adapter 注入；裝置原生鍵盤與讀屏仍須各平台驗收。

`npm run test:readiness:faults` 先由固定migration建立新 `fault-ready-*` local instance，只修改它的 bindings/schema/index/probe/keys/origin/sender。15個fault逐一要求live200、ready503且無秘密，最後恢復ready200及原default服務。不要與依賴8787的Web、live、restart、key rotation測試並行。

## Android 真 SecureStore 的故障 profile

先依 README 建置／安裝 development APK，啟動指定 emulator。執行 `npm run test:android:faults`；如使用獨立 ADB server，設定 `DATINGHIGH_ADB_PORT`，裝置以 `DATINGHIGH_ANDROID_DEVICE` 選擇（預設 `emulator-5554`）。

測試自行啟動8084 Metro及隨機port測試API；`DATINGHIGH_NATIVE_FAULT_PROFILE=1` 只將 storage 模組對 expo-secure-store 的import導向測試adapter。成功讀寫仍委派真SDK；指定refresh寫失敗時拋錯。profile禁止production bundle，不改登入驗證或正式API。結束僅停止本輪啟動的Metro/test host及指定測試app。

監測僅記錄operation、允許key、JSON欄位名稱與成功與否，不記錄值。原生UI XML僅在記憶體分析，不保存原生截圖、影片或UI dump。API故障由test host精確注入handler前401、一次409及已commit回應遺失，請求計數僅path/method/status。摘要寫在忽略的 `.local/evidence/native-faults.json`，只有全案通過才寫 `status: passed`。

Android正式development/release原生設定另以Expo plugin關閉OkHttp連線失敗自動重送。曾由此測試重現一次JS fetch產生兩次PUT（204後401）；修改plugin必須重建安裝APK。8項原生檢查及APK SHA256的摘要在忽略的native-faults.json；受控response drop仍在commit之後真正中斷連線。
