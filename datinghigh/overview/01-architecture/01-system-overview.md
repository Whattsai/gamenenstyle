# 系統概覽

## MatchingSessions（2026-11-06）

正式應用已加入受限候選探索、`match-score-v1` 雙向計分、72小時邀請、雙方確認及持久雙人房間。`user_profiles` 是唯一個資來源，四張新表承接搜尋投影、邀請、遊戲與帳號唯一占用；房間只顯示真實輪次與安全角色。登入／恢復後由 `/start` 分流至 `/profile`、`/matching` 或 `/game-round/{roundId}`。逐項與平台證據以 [MatchingSessions 驗證紀錄](../../docs/verification/SPEC-001-MatchingSessions-Verification.md) 為準。

下列2026-11-05個人資料段落保留當時基線；配對現況以上述新增模組為準。劇情收發、產品退出入口、分數及名片同意仍由後續 SPEC 承接。

## 個人資料修訂（2026-11-05）

新增生理性別／戀愛性向及欄位分享開關、依性別的免費化身選擇、獨立唯讀名片預覽。業務仍限本人管理與預覽，跨帳號名片持續預設拒絕；未建立配對流程。現行schema為Foundation六表54欄＋業務兩表27欄，實際驗證狀態見AvatarAndPreferences驗證紀錄同日修訂。


DatingHigh（心動迴路）是戀愛養成交友平台。現行正式程式包含 PlatformFoundation、AvatarAndPreferences 與 MatchingSessions。本人交友資料、私人照片、16款免費化身及 Gemini 逐張生成供真正配對流程使用；劇情、親密度、雙方名片同意流程、小遊戲、約會及告白仍由後續規格承接。本人預覽或配對成立不代表授權他人查看名片。

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
