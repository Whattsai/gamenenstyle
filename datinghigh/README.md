# 心動迴路（DatingHigh）

DatingHigh 是戀愛養成交友平台；目前只交付 [PlatformFoundation](docs/specs/SPEC-001-PlatformFoundation.md) 的帳號、認證與資料基礎，後續交友業務尚未實作。

已建立 Email 驗碼註冊、登入、忘記／重設密碼、修改密碼、Google 登入與連結管理，以及登入恢復／撤銷。技術組成為 Expo SDK 58／React Native、.NET 10、Cloudflare Worker／Container／D1／私人 R2。

依既有 D-033、D-035 決策，本地 Web／Android 驗收已有結案紀錄；iOS、TalkBack、雲端與真收信仍有未驗收項目，production 未發布。詳見 [逐平台驗證紀錄](docs/verification/SPEC-001-PlatformFoundation-Verification.md) 與 [本地範圍](docs/verification/PlatformFoundation-LocalAcceptance.md)。

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
npm run storage:probe:local
npm run dev:platform
```

另一個終端執行 `node tools/serve-web.mjs`，開啟 **http://localhost:8081**；API 為 http://localhost:8787。網站來源請保持 `localhost`，以符合 Origin／Strict Cookie 設定。種子只有無登入能力的 disabled 帳號。

第一次啟動會在忽略的 `cloudflare/.dev.vars` 產生三個秘密，之後沿用。註冊／重設碼只在 local／Log 的容器 `LocalEmailVerification` 日誌取得；查看方式、Google 設定、重啟及資料備份見 [本地操作與部署](overview/04-deployment/01-deployment-checklist.md) 和 [環境變數](overview/04-deployment/02-environment-variables-template.md)。

Android 另需 JDK 17、Android SDK 與 emulator：

```powershell
npm run build:android
npm --prefix frontend/client start -- --dev-client --localhost --port 8082
```

安裝 APK、ADB reverse 與連線步驟見 [Android 操作](overview/04-deployment/01-deployment-checklist.md#android-development-build)。iOS 需要 macOS／Xcode 或另行配置可簽署的 development build；目前沒有 iOS 驗收證據。

## 常用驗證

| 命令 | 用途與前提 |
|---|---|
| `npm run check:foundation` | 政策、.NET、Worker、client 測試及兩個型別檢查；先完成安裝與 restore |
| `npm run test:live` | 真本地 Worker／Container／D1／R2 bridge；需平台運行 |
| `npm run test:email:local` | 真本地 log 寄碼、重寄與 reset；需平台運行 |
| `npm run build:e2e-host` | 建置受控 HTTP／寄信測試 host；後端變更或搬移目錄後重建 |
| `npm --prefix frontend/client run export:web` | 匯出目前 Web 程式 |
| `npm run test:web` | Web E2E；先匯出、建置 E2E host 並啟動本地平台，Playwright 會提供 8081 靜態服務 |
| `npm run test:layout` | 共用 UI 元件與 OS 邊界 adapter 的版面測試 |
| `npm run test:android` | 已安裝 development APK 的本地 smoke；目前有下述舊路徑限制 |

其他故障矩陣、持久性及換 key 檢查見 [驗證工作流](overview/02-development-guidelines/03-ai-workflow-stages.md)。`check:foundation -- --acceptance` 依完整原規劃判定，缺證據可回 exit 2；一般測試通過不等於完整驗收。

目前 Android smoke 的 APK 取檔、受控矩陣與真 Google 測試仍引用舊目錄，重跑前需修正；詳見 [重跑限制](overview/02-development-guidelines/03-ai-workflow-stages.md#目前重跑限制)。這次文件整理未修改測試程式，既有通過紀錄也不代表搬移後已重跑 Android。

## 目錄與文件

| 位置 | 用途 |
|---|---|
| `frontend/client/` | Expo 帳號 UI、API client、儲存與模組單元測試 |
| `backend/` | .NET 四層、後端測試、probe 與 Dockerfile |
| `cloudflare/` | Worker、固定資料指令、D1 migration 與部署設定 |
| `tests/` | 跨系統整合、Web／Android E2E、版面驗證與 runbooks |
| `tools/` | 本地資料 wrappers、建置、檢查及驗收工具 |
| `docs/` | 已確認需求、SPEC／BDD／TDD 與驗收證據 |
| `proposals/` | 提案與設計原型；不作正式業務模型 |

- [AGENTS.md](AGENTS.md)：AI 讀取順序與變更檢查清單。
- [系統概覽](overview/01-architecture/01-system-overview.md)、[模組地圖](overview/01-architecture/04-module-map.md)、[相依關係](overview/01-architecture/05-dependency-map.md)。
- [API 契約](overview/03-contracts/01-api-contracts.md)、[資料契約](overview/03-contracts/02-data-contracts.md)。
- [MVP](docs/requirements/MVP-001-LoveGameDatingApp.md)、[SPEC](docs/specs/SPEC-001-PlatformFoundation.md)、[BDD](docs/bdd/SPEC-001-PlatformFoundation-BDD.md)、[TDD](docs/tdd/SPEC-001-PlatformFoundation-TDD.md)。
- [本地案例覆核](docs/verification/PlatformFoundation-LocalMatrix.md)、[命名重構紀錄](docs/verification/DirectoryNamingRefactor.md)、[本地 Email 與相依補驗](docs/verification/PlatformFoundation-LocalEmailAndDependencies.md)。

開發前先讀相關規格與分層文件；認證／資料變更先補失敗測試，完成後同步受影響的 overview。交付說明請列出行為變更、驗證結果、平台／環境及剩餘缺項。秘密、憑證、本地 state 與備份不得提交。
