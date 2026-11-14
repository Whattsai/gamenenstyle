# 心動迴路（DatingHigh）

DatingHigh「心動迴路」是戀愛養成交友平台，結合個人資料與化身、雙向配對、雙人互動劇情及即時聊天。帳號支援 Email 驗碼註冊、密碼管理、Google 登入與連結，以及登入恢復／撤銷。

前端使用 Expo SDK 58／React Native，共用 Web／Android 畫面；後端採 .NET 10 四層架構，搭配 Cloudflare Worker／Container、D1 與私人 R2。iOS 依 D-052 暫緩；無障礙專項依 D-051 不在目前 MVP 範圍。

本文提供專案簡介、環境需求、啟動、驗證與文件入口。AGENTS.md、README.md、overview 等非需求文件絕不可記錄需求流水帳；說明依主題直接整合更新。需求進度、測試結果、人工確認、故障經過與未完事項統一維護於各需求既有的 `docs/verification/` 文件。開發原則見 [AGENTS.md](AGENTS.md)。

## 快速啟動（Windows）

在本目錄執行。需要 Node 24、PowerShell 7、.NET SDK **10.0.204**、Docker Desktop（Linux containers），以及啟用 Docker integration 的 Ubuntu WSL。

```powershell
npm ci
npm --prefix cloudflare ci
npm --prefix frontend/client ci
dotnet restore backend/DatingHigh.slnx
npm run setup:wsl
npm --prefix frontend/client run export:web
npm run db:migrate:local
npm run db:seed:local
npm run content:publish:local
npm run storage:probe:local
npm run dev:platform
```

停止本地平台使用 `npm run dev:platform:stop`；重新啟動使用 `npm run dev:platform:restart`。

既有0004／0005且有舊遊戲資料時，使用 `npm run db:upgrade-scene:local`：對已知 local instance 停寫、備份、只清舊遊戲資料後套0006並發布首條分層內容；帳號、個資、照片與化身以保護表雜湊比對。不要把舊 StoryCatalog ID 當成 Category 或以空候選回填舊 Round。還原只建新目錄，沒有 remote 模式。

另一個終端執行 `node tools/serve-web.mjs`，開啟 **http://localhost:8081**；API 為 http://localhost:8787。網站來源請保持 `localhost`，以符合 Origin／Strict Cookie 設定。種子只有無登入能力的 disabled 帳號。

第一次啟動會在忽略的 `cloudflare/.dev.vars` 產生四個秘密，之後沿用。註冊／重設碼只在 local／Log 的容器 `LocalEmailVerification` 日誌取得；查看方式、Google 設定、重啟及資料備份見 [本地操作與部署](overview/04-deployment/01-deployment-checklist.md) 和 [環境變數](overview/04-deployment/02-environment-variables-template.md)。

## 配對測試：婉拒與結束遊戲

收到邀請時，探索卡的「接受邀請」下方及「邀請 → 收到的邀請」均可婉拒；須再按「確認永久婉拒」，按「保留邀請」不會拒絕。

遊戲內「結束本輪互動」會再次提醒永久無法配對，取消不改狀態。維運仍可在本目錄的終端結束指定**本地**測試房間：

```powershell
npm run game:list:local
npm run game:end:local -- --round-id "貼上房間UUID"
```

房間UUID也會顯示在遊戲畫面。結束指令原子釋放雙方占用並保留ended歷史；若原本local平台正在運行，會先暫停寫入，執行後恢復並等ready，命令成功後重整Web或Android。**原本兩個帳號結束後永久不再配對**；要反覆測同一對，需另建測試帳號，這個指令不清除永久歷史。它不修改帳號、個資、照片或其他房間，也沒有remote模式。完整步驟見[本地操作](overview/04-deployment/01-deployment-checklist.md#本地測試結束指定遊戲)。

Android 另需 JDK 17、Android SDK 與 emulator：

```powershell
npm run build:android
npm --prefix frontend/client start -- --dev-client --localhost --port 8082
```

安裝 APK、ADB reverse 與連線步驟見 [Android 操作](overview/04-deployment/01-deployment-checklist.md#android-development-build)。iOS 開發需要 macOS／Xcode 或另行配置可簽署的 development build。

手動驗證的 Metro 應正常載入 `frontend/client/.env.local`；設定 Google 登入時須帶入公開的 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`。若以 `EXPO_NO_DOTENV=1` 啟動卻未明確提供此值，原生畫面會停用 Google 登入，即使既有 Web 匯出檔仍可使用。

## 常用驗證

| 命令 | 用途與前提 |
|---|---|
| `npm run check:foundation` | 政策、.NET、Worker、client 測試及兩個型別檢查；先完成安裝與 restore |
| `npm run test:live` | 真本地 Worker／Container／D1／R2 bridge；需平台運行 |
| `npm run test:email:local` | 真本地 log 寄碼、重寄與 reset；需平台運行 |
| `npm run build:e2e-host` | 建置受控 HTTP／寄信測試 host；後端變更或搬移目錄後重建 |
| `npm --prefix frontend/client run export:web` | 匯出目前 Web 程式 |
| `npm run test:web` | Web E2E；先匯出、建置 E2E host 並啟動本地平台，Playwright 會提供 8081 靜態服務 |
| `npm run test:scene:web` | 新場景事件框架的真 D1／R2／Room DO 雙人 Web 流程；先 export／build E2eHost，與 Android 套件依序執行 |
| `npm run test:layout` | 共用 UI 元件與 OS 邊界 adapter 的版面測試 |
| `npm run test:android` | 已安裝 development APK 的本地 smoke；目前有下述舊路徑限制 |

其他故障矩陣、持久性及換 key 檢查見 [驗證工作流](overview/02-development-guidelines/03-ai-workflow-stages.md)。`check:foundation -- --acceptance` 依完整原規劃判定，缺證據可回 exit 2；一般測試通過不等於完整驗收。

Android smoke 的 APK 取檔、受控矩陣與真 Google 測試若引用舊目錄，重跑前須依 [重跑限制](overview/02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制) 檢查並修正路徑。

## 目錄與文件

| 位置 | 用途 |
|---|---|
| `frontend/client/` | Expo 共用畫面、API client、儲存與模組單元測試 |
| `backend/` | .NET 四層、後端測試、probe 與 Dockerfile |
| `cloudflare/` | Worker、固定資料指令、D1 migration 與部署設定 |
| `tests/` | 跨系統整合、Web／Android E2E、版面驗證與 runbooks |
| `tools/` | 本地資料 wrappers、建置、檢查及驗收工具 |
| `docs/` | 已確認需求、SPEC／BDD／TDD 與驗收證據 |
| `prototypes/` | 設計與視覺原型（如 Next.js 原型）；不作正式業務模型 |

- [AGENTS.md](AGENTS.md)：AI 讀取順序與變更檢查清單。
- [系統概覽](overview/01-architecture/01-system-overview.md)、[模組地圖](overview/01-architecture/04-module-map.md)、[相依關係](overview/01-architecture/05-dependency-map.md)。
- [API 契約](overview/03-contracts/01-api-contracts.md)、[資料契約](overview/03-contracts/02-data-contracts.md)。
- [MVP](docs/requirements/MVP-001-LoveGameDatingApp.md)、[SPEC](docs/specs/SPEC-001-PlatformFoundation.md)、[BDD](docs/bdd/SPEC-001-PlatformFoundation-BDD.md)、[TDD](docs/tdd/SPEC-001-PlatformFoundation-TDD.md)。

| 功能 | 規格 | 進度與驗證紀錄 |
|---|---|---|
| 帳號與平台基礎 | [PlatformFoundation](docs/specs/SPEC-001-PlatformFoundation.md) | [驗證紀錄](docs/verification/SPEC-001-PlatformFoundation-Verification.md) |
| 化身與個人偏好 | [AvatarAndPreferences](docs/specs/SPEC-001-AvatarAndPreferences.md) | [驗證紀錄](docs/verification/SPEC-001-AvatarAndPreferences-Verification.md) |
| 配對與邀請 | [MatchingSessions](docs/specs/SPEC-001-MatchingSessions.md) | [驗證紀錄](docs/verification/SPEC-001-MatchingSessions-Verification.md) |
| 劇情、聊天與退出 | [StoryDialogueAndExit](docs/specs/SPEC-001-StoryDialogueAndExit.md) | [驗證紀錄](docs/verification/SPEC-001-StoryDialogueAndExit-Verification.md) |
| 場景、事件與下一場 | [SceneEventFramework](docs/specs/SPEC-001-SceneEventFramework.md) | [驗證紀錄](docs/verification/SPEC-001-SceneEventFramework-Verification.md) |

開發前先讀相關規格與分層文件；認證／資料變更先補失敗測試，完成後同步受影響的 overview。交付說明請列出行為變更、驗證結果、平台／環境及剩餘缺項。秘密、憑證、本地 state 與備份不得提交。
