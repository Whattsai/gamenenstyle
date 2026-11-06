# 本地操作與部署檢查

## MatchingSessions 基線（2026-11-06）

default local 已透過原 wrapper 套用 `0004_matching_sessions.sql`；local／staging 的 EXPECTED_MIGRATION 現為0004，ready驗12張表及單場占用唯一索引。staging僅同步設定，未部署；沒有 production 發布。新模組未新增環境秘密、binding、網域或外部服務。

### 本地測試結束指定遊戲

正式產品仍沒有退出HTTP／UI。本地開發可在DatingHigh根目錄執行：

```powershell
npm run game:list:local
npm run game:end:local -- --round-id "貼上房間UUID"
```

第一條只列目前active房間的UUID、開始時間、雙方暱稱與參與者數，不列憑證或照片。第二條只接受一個UUIDv7，經原local wrapper指向已知instance；必要時可明確加`--instance 已存在的本地名稱`，拒絕remote／production／任意SQL。若目標instance正在運行，先經其既有control暫停寫入，於同一真D1 batch驗恰好兩位參與者、保存ended、釋放兩人占用並驗零殘留，最後恢復平台且等待8787 ready。只有選中的房間會變更；未知房間、錯誤占用或中途零列失敗整批回滾，已正確結束的重送為冪等。

成功後重整Web／Android即可回配對入口。保留原accepted邀請及ended輪次，因此原accountId pair依規格永久不再配；這不是「清除同一對測試歷史」的reset。沒有刪帳號／Profile／R2，也沒有替Story建立公開退出入口，不得將CLI證據勾成MS-ET-017產品退出E2E。

`node --test tests/integration/local-game-maintenance.test.mjs`在新建的named local instance驗實際Wrangler CLI與batch回滾，完成後只清理該測試自己建立的目錄；不會代替你結束default現存房間。

配對重建驗證以明確隔離的 Miniflare D1／R2及受控 host 執行：重建四表、建立真測試帳號、按相同範圍清理私有測試資產，不引入ETL／舊資料相容。不要將此流程套到未知／remote／production目標；default既有帳號與私人媒體不作任意推測清除。真平台與各平台證據見 [MatchingSessions 驗證紀錄](../../docs/verification/SPEC-001-MatchingSessions-Verification.md)。以下0003／0002段落為歷史操作基線。

## 現行migration與context（2026-11-05）

default local已經正式wrapper向前套用0003；當時EXPECTED_MIGRATION local／staging設0003_profile_gender_card_visibility.sql，staging未部署。root contracts需隨container：Dockerfile仍在backend，build context為DatingHigh根（Wrangler image_build_context=".."），根.dockerignore只送backend及contracts，勿用舊backend-only context。下方2026-11-03的0002為歷史紀錄。所有本地故障、重啟及依賴8787測試仍依序執行。


本文件整理現有 wrappers、Docker／Wrangler 與 runbooks；不是發布授權或新驗收證據。2026-11-01 的既有紀錄顯示本地 Web／Android 已結案；iOS依D-052暫緩、無障礙依D-051不在目前MVP範圍，雲端／真收信仍保留界限。D-033／D-035 暫緩 iOS／staging，不啟用付費、不部署；production 未配置／發布。詳見 [本地範圍](../../docs/verification/PlatformFoundation-LocalAcceptance.md) 與 [逐平台紀錄](../../docs/verification/SPEC-001-PlatformFoundation-Verification.md)。

## 本地啟動與資料

安裝／首次啟動命令見 [README](../../README.md)。Windows 使用 Node24、PowerShell7、.NET SDK10.0.204、Docker Desktop Linux containers、Ubuntu WSL integration；`setup:wsl` 在本專案 `.local/toolchain` 安裝固定 Linux Node／Wrangler，不能用其他專案的程序替代。

- [ ] 三個 npm 專案各自 `npm ci`，.NET solution restore；Worker 相依變更後更新 WSL toolchain。
- [ ] 先 export Web，確保 `frontend/client/dist` 存在，再使用 wrappers migrate／seed／R2 probe。
- [ ] `npm run dev:platform` 啟動 loopback8787，`node tools/serve-web.mjs` 提供 http://localhost:8081。
- [ ] 驗 `/health/live` 與 `/health/ready`；前者只表示程序存活，不能代替 ready。
- [ ] 沿用忽略的 `.dev.vars` 三個秘密；重啟不刪 state，不把工具檔或備份提交。

| 操作 | 命令 |
|---|---|
| Migration／無登入能力種子 | `npm run db:migrate:local`、`npm run db:seed:local` |
| 固定非秘密欄位查詢 | `npm run db:query:local -- --view accounts` 或 `--view sessions` |
| 本地 SQL 檔 | `npm run db:execute:local -- --file <sql-file>` |
| R2 probe 讀回 | `npm run storage:probe:local` |
| 新名稱備份 | `npm run db:backup:local -- --name before-change` |
| 還原至新 instance | `npm run db:restore:local -- --file .local/backups/before-change.sql --target restored-copy` |
| 查還原副本 | `npm run db:query:local -- --instance restored-copy --view accounts` |
| 平台重啟 | `npm run dev:platform:restart` |

default 的 cwd 固定 `cloudflare/`，state 位於 `cloudflare/.wrangler/state`；其他已知 instance 位於 `.local/instances/<name>/`。工具限制 local、config 與允許參數，拒未知 instance／remote 旗標／覆寫目標。migrate／seed／execute／backup 在本 instance 有服務運行時先透過帶憑證的 loopback control 暫停寫入，再恢復。restore 只新建目錄並檢查 FK，不能覆蓋原資料；既有 token 的驗證還需安全配置相同秘密。

查詢 view 仍含帳號 Email 等本地私人資料，不貼入公開報告。備份含私人資料且保持忽略；不要直接修改活躍 emulator 的 SQLite WAL。詳細持久性與還原流程見 [local data runbook](../../tests/e2e/runbooks/foundation-local-data.md)。

## 本地驗證碼

只有 `APP_ENV=local` 且 `EmailDeliveryMode=Log` 時，.NET category `LocalEmailVerification` 可輸出碼。啟動平台並開啟登入頁後，在另一個 PowerShell 終端：

```powershell
$taskContainer = docker ps --filter name=workerd-datinghigh-local-ApiContainer --format '{{.ID}} {{.Names}}' |
    Where-Object { $_ -notmatch '-proxy' } | Select-Object -First 1
if (!$taskContainer) { throw '請先啟動本地平台並開啟登入頁' }
$taskContainerId = ($taskContainer -split ' ')[0]
docker logs --since 10m --follow $taskContainerId
```

`Purpose=register_email` 是註冊，`reset_password` 是忘記密碼；依 Recipient／Challenge 選正確流程與最新 Generation，六位 Code 保留前導零。這是僅供本地終端取碼的例外，不把日誌行、碼、密碼或 token 保存到測試報告／Git。Ctrl+C 結束追蹤；容器重建後重新取 ID，舊碼 log 遺失則等冷卻後重寄。不要新增查碼 API。

未知 Email 的 reset 仍回同形成功但不寄碼，沒有對應 log；既有 Google-only 帳號可透過 reset 設本地密碼。`npm run test:email:local` 只在記憶體讀碼、驗證註冊／reset／60秒冷卻與重寄，不能代替真收信。補驗紀錄見 [LocalEmailAndDependencies](../../docs/verification/PlatformFoundation-LocalEmailAndDependencies.md)。

## Android development build

需要 JDK17、Android SDK／emulator、可用的本地平台；以下以指定 emulator-5554 示範，換裝置時先確認對象。

```powershell
npm run build:android
adb -s emulator-5554 install -r frontend/client/android/app/build/outputs/apk/debug/app-debug.apk
npm --prefix frontend/client start -- --dev-client --localhost --port 8082
```

另開終端執行 `adb -s emulator-5554 reverse tcp:8082 tcp:8082`，在該裝置開啟 `datinghigh://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082`。emulator API 預設 `http://10.0.2.2:8787`；硬體裝置另設可達的 EXPO_PUBLIC_API_ORIGIN，cloud 一律 HTTPS。

build 腳本使用專案內固定 Ninja1.13.2 與 CMake staging，避免 Windows 舊 Ninja 路徑限制，不修改套件原始碼／全機 registry。`plugins/with-no-network-retry.cjs` 以可重現 Expo plugin 關閉 Android OkHttp 連線失敗自動重送，避免已提交的密碼變更被底層再送；plugin 變更必須重建／安裝 APK，不能只更新 Metro。

iOS 的 `com.datinghigh.app`／scheme 設定已存在，但目前沒有可驗收 build，也沒有既存 EAS 配置；需要另行具備 macOS／Xcode 或已配置的簽署建置環境。

目前 Android E2E 的 fixture／真 Google／smoke 仍有搬移前路徑；裝置命令的重跑限制見 [工作流](../02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制)。APK建置入口已使用新路徑，但不能據此推論測試腳本也已全部更新。

## 既有故障判讀

- 本地熱重載後 ready 正常、Google 503：先確認固定 JWKS bridge 與本專案容器網路。2026-10-30 曾重啟 wrapper 後恢復，但尚未證明上游確切根因；可用 `dev:platform:restart`，保留 D1／R2，不動其他專案。
- Android Google UI 取消且沒送登入 API：先查 emulator 路由／DNS。2026-11-01 曾無網路，重連原有 AndroidWifi 後相同 APK 真 Google／冷啟／登出通過；ADB reverse 能連 Metro 不代表 emulator 對外有網路。
- 2026-11-05原生Google入口排障：先確認Metro載入公開Google client ID，再查裝置Google Play服務版本與是否已有可用Google帳號。DatingHighQA31的Google APIs映像當時只有22.50.14（225014047），SDK日誌要求230815045；其`com.android.vending`實際為LicenseChecker而無商店啟動Activity，不能視為可更新的Google Play。手動Google驗證改用既有DatingHighQA的Android36 Google Play映像，服務26.43.30、APK雜湊與本次build相同。帳號登入需使用者在裝置完成；SDK回`noSavedCredentialFound`時只表示缺可用登入資訊，不是密碼錯誤或使用者取消。這些裝置前提不等於新的真Google登入已通過。
- WSL／Docker outbound 位址由本專案 `wsl-egress.mjs` 的 loopback relay 處理，不開 LAN、不設公開 SQL 管理端點。

## 雲端部署前後（目前暫緩）

現有 staging 設定／D1／私人 R2／migration／probe 已建立，先前 Worker／assets 上傳不能證明 Container 已部署。最後部署證據為 Containers 資格／Workers Paid 未就緒；設定也缺 EMAIL binding／sender。目前 `preflight:staging` 預期拒絕，不得改 Log 模式過關。這些是既有紀錄，不是本次重新查詢帳號的結果。

若未來取得明確的具體版本／環境授權，依 [staging runbook](../../tests/e2e/runbooks/foundation-staging.md) 完成：

- [ ] 核對 `deployment-targets.json` 與 `wrangler.staging.jsonc` 的 account／worker／D1／私人 R2／HTTPS origin，確認 Containers 資格及已驗證 sender。
- [ ] 配置 EMAIL binding／EMAIL_FROM、cloud模式、三個環境獨立秘密與 Google audiences／native簽章；不得放 client secret 到前端。
- [ ] `npm run preflight:staging` 通過，再記 D1 checkpoint 與相容 migration。以 cloud API origin（同源可為空字串）匯出至 `.local/staging-web`，不直接重用 local bundle。
- [ ] `backend/Dockerfile` 以 backend 為 build context；SDK與ASP.NET映像固定digest，非root8080。記錄映像／Worker／assets版本，不擅自升版或發布。
- [ ] 只向前套用相容 migration，完成 probe、必要測試與部署；失敗停止後續步驟。repo 沒有 CI/CD pipeline 可視為已自動執行。
- [ ] 實測 live／ready、未知API JSON404、公網internal404、偽造可信標頭失效、真.NET outbound、D1／R2持久性與兩owner隔離。
- [ ] 以真SDK／Google及可控制信箱完成登入／連結／解除與註冊／reset實收；202／message ID不證明收件。逐平台、環境記錄未驗項目。
- [ ] 驗同帳號依序登入、Refresh寬限／重放、舊裝置登出及重建不復活；回寫 `docs/verification` 的去敏證據。

rollback 只允許與現有 schema 相容的舊 Worker／image／assets，不自動清空或還原 D1；資料復原另按具體操作處理。production target 目前為 null，沒有現成 production 配置；只在具體版本已獲授權時發布。

驗證矩陣、序列執行限制與交付格式見 [AI 工作流](../02-development-guidelines/03-ai-workflow-stages.md)。

## AvatarAndPreferences本地驗證（2026-11-03）

0002已在本專案default local套用，local／staging設定EXPECTED_MIGRATION為0002；staging未部署。Skia native Linux資產已隨container publish，修改adapter／secret後使用正式wrapper重啟、等ready再測。重啟等待窗240秒，不以Docker build結束當API ready。

Gemini只在忽略的 `cloudflare/.dev.vars` 設 `GEMINI_API_KEY`，選填 `GEMINI_IMAGE_MODEL`；不進client env。真測必須使用本次已授權照片，路徑由stdin／該次測試process環境讀入，報告只保留匿名結果。`tools/verify-avatar-live.mjs` 為真本地最多4張／採用／配額流程；Web `avatar-gemini-live.spec.ts` 需明確設定DATINGHIGH_GEMINI_LIVE=1及兩個來源路徑才執行，預設skip，不自動發生費用。

真生成／原生UI測試期間凍結frontend export、Worker／backend原始碼及平台重啟；熱重載亦可能中斷正在執行的操作。先完成編譯／restart及ready，再依序跑平台操作。Android僅使用本專案專用QA AVD／指定ADB port，不操作其他專案裝置。development build的右上Tools overlay可能蓋住右側導覽按鈕，QA腳本在同按鈕左緣點擊，不把overlay故障算成產品授權成功。

GC每小時清理；Foundation、照片、候選分配時間預算，R2 `_system/avatar-preferences/cleanup.json` 保存tombstone cursor與未處理清單頁，預算耗盡下次接續。只有固定私人key、D1已deleted／未提交orphan及已到期候選可清除；正式ready化身保持。無新增D1 job表。

完整Gate與平台缺項以[AvatarAndPreferences驗證紀錄](../../docs/verification/SPEC-001-AvatarAndPreferences-Verification.md)為準，Foundation歷史結案不擴推本份。
