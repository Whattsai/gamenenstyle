# 系統概覽

DatingHigh（心動迴路）是戀愛養成交友平台。現行正式程式包含 PlatformFoundation，以及已完成本地Web／Android範圍驗收的 AvatarAndPreferences：本人交友資料、照片私人儲存、16 款免費化身與 Gemini 多照片逐張生成。配對、劇情、親密度、雙方名片同意流程、遊戲、約會及告白仍由後續規格承接；本人預覽不代表授權他人查看。

## 技術輪廓與主要模組

| 模組 | 責任 |
|---|---|
| Expo／React Native client | 共用 Web／行動版帳號畫面、表單、Google 入口與登入恢復 |
| .NET Domain／Application | 身分與認證規則、用例與外部 adapter 契約 |
| .NET Infrastructure／Api | 密碼學、外部身分驗證、平台橋接及 HTTP 傳輸 |
| Cloudflare Worker／Container | 公開入口、靜態前端與 API 容器路由 |
| Cloudflare 資料層 | D1 固定資料操作、私人 R2 與清理 |
| 本地工具與跨系統測試 | 本機平台、資料操作、建置與逐平台驗收 |

## 啟動點

- 前端：`frontend/client/package.json` 的 `expo-router/entry`，進入 `app/_layout.tsx` 與 `app/index.tsx`。
- API：`backend/src/DatingHigh.Api/Program.cs`。
- 平台：`cloudflare/src/index.ts`，設定由 `cloudflare/wrangler*.jsonc` 提供。
- 本地開發：根 `package.json` 的 `dev:platform` 呼叫 `tools/local.mjs`；Web 匯出由 `tools/serve-web.mjs` 提供本機存取。

從本文件接續閱讀 [分層邊界](02-layer-boundary.md)、[runtime flow](03-runtime-flow.md)、[模組地圖](04-module-map.md) 與 [相依地圖](05-dependency-map.md)；任務讀取順序以 [AGENTS.md](../../AGENTS.md) 為準。

目前本地 Web／Android 與完整三平台／雲端的驗收狀態不同，請查 [驗證紀錄](../../docs/verification/SPEC-001-PlatformFoundation-Verification.md)。本文件不作驗收清單或規格替代。
