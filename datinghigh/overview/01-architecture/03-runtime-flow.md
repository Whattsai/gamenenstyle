# 啟動與執行流程

## 平台與 HTTP

1. `tools/local.mjs dev` 在 Windows 切入 Ubuntu WSL 的隔離 Node／Wrangler。使用已知 instance 的設定與 state；初次建立秘密，重啟沿用。
2. Wrangler 載入 `cloudflare/src/index.ts`。Web assets 使用 Expo single SPA 輸出；API／health／internal 路徑優先經 Worker。
3. `router.ts` 拒絕公開 internal／commands；合法 API preflight 直接回應。其餘 API／health 以重建的 request ID、environment、client IP 標頭交 `getContainer(env.API, 'api-v1')`。
4. `ApiContainer` 啟動 Linux .NET、監聽 8080，空閒 10 分鐘可休眠。環境設定由 Worker 轉入；資料不保存在容器檔案系統。
5. `Program.cs` 建立 DI／CORS，依序進入 `UseCors`、自訂錯誤／輸入 middleware、authentication、authorization 及 minimal API。自訂 middleware 設 `no-store`、校驗可信環境、讀取一次 JSON、判斷 platform／Origin 並拒 query。
6. 授權端點先由 `PlatformAuthentication` 驗 Access JWT，再透過 `session.validate` 查 D1 的目前帳號與 family。查驗失敗回 ProblemDetails。
7. 用例經 `IPlatformClient` POST 固定命令至 `http://platform.internal/v1/commands/...`；Containers SDK 的 outbound handler 呼叫 Worker `dispatch`，執行 prepared D1 batch 或私人 R2 操作。
8. 用例在資料提交成功後才回帳號／session；API 依 Web Cookie 或 native JSON 傳送憑證。未知 API 回 JSON 404，不落入 SPA。

Worker 會為容器連線失敗提供 503／504 ProblemDetails，並對允許的 Web Origin 保留 CORS。`/health/live` 僅表示程序存活；ready 會驗證設定、D1 migration／schema／唯一索引及 R2 probe。詳細條件見 [資料契約](../03-contracts/02-data-contracts.md)。

## 前端

1. Expo Router 進入 `_layout.tsx`，掛載 SafeAreaProvider、SessionProvider 與 Stack。
2. SessionProvider 建立共用 ApiClient／FlowStore；啟動先處理 pending revoke，再恢復 session。native 先從 SecureStore refresh，Web 使用 HttpOnly Cookie 查詢 session。
3. 畫面透過 ApiClient 呼叫 API。每個 client 執行個體共用一個進行中的 refresh Promise；讀取失敗可受控重試，資料變更遇到未知結果不任意重送。
4. native refresh 成功先寫 SecureStore 後接受狀態。Web 每次回應比較 session 標頭；回前景／focus／pageshow／visibilitychange 會重驗目前 session。沒有 BroadcastChannel 廣播或 Web 單分頁限制。
5. 登出先隱藏私人畫面並保留限定的 pending-revoke metadata，等待伺服器確認；重試不撤銷較新的 family。

Google Web 從 GIS popup 取得 proof；native 從原生 SDK 取得 proof。proof 只在記憶體傳至 .NET，伺服器透過 Worker 取得固定 Google JWKS 後驗簽。缺公開 client 設定時 UI 顯示不可用。

## 背景與本機服務

Worker 每小時 cron 執行分批清理；每批最多 1000 筆，預算 20 秒，剩餘 backlog 留至後續排程。不使用常駐帳號 worker 或 queue。

本機 `serve-web.mjs` 在 loopback 8081 提供匯出檔與無副檔名 SPA fallback。這與 Worker 的正式 assets 路由分開；目前沒有 SignalR、WebSocket 業務通道或 .NET SPA fallback。
