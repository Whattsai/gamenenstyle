# 啟動與執行流程

## MatchingSessions（2026-11-06）

登入／註冊／有效 Session 恢復後，`/start` 讀本人 Profile 及目前遊戲；已有遊戲優先回原房間，其次依 profileReady 分流。查詢未知時保留重試，不視為已就緒。探索先取得完整適格集合，Application 計分排序再取 offset／limit；清單只有 ID、總分與邀請方向，畫面按需讀一張並預載其後最多三張安全人物卡。

配對搜尋 POST 使用獨立數字 JSON parser，其餘配對 POST 沿用嚴格字串／空物件 parser。九端點沿用 PlatformAccess、no-store、Origin／Cookie 或 Bearer；無效配對輸入回 `INVALID_MATCH_REQUEST`。邀請清單或操作以伺服器時間懶惰到期／安全失效，不靠背景 job；未知 mutation 先 GET 輪次／邀請回查，不盲目重送。

個資／正式化身命令僅在配對輸入實際變更時同步 conditions；無關個資、分享設定及照片排序不變更投影。接受在一個 D1 batch 內提交 accepted、round、兩個 participants 與其餘 pending 失效；SQL guard 拒絕零列中途更新。內部 `game.round.end` 原子保存 ended 及釋放占用，尚無產品退出 HTTP／UI。正式生成化身只從私人 R2 讀取，等待後重新核對 Session／目前候選或輪次授權。

## 2026-11-05 個人資料編輯流程

profile-catalog.fields提供同一欄位定義供表單、欄位前開關與名片。草稿snapshot比較有效預設，僅有語意差異顯示儲存。預覽有修改先PUT，再成功GET最新本人資料後push `/card-preview`；任何失敗保留編輯頁且不重送。名片focus每次GET已過濾投影，不由草稿或cache組合。Android RefreshControl／手機Web頂端touch下拉及返回皆先保護草稿；成功照片／化身操作保留未存欄位與visibility並檢查revision衝突。


## 平台與 HTTP

1. `tools/local.mjs dev` 在 Windows 切入 Ubuntu WSL 的隔離 Node／Wrangler。使用已知 instance 的設定與 state；初次建立秘密，重啟沿用。
2. Wrangler 載入 `cloudflare/src/index.ts`。Web assets 使用 Expo single SPA 輸出；API／health／internal 路徑優先經 Worker。
3. `router.ts` 拒絕公開 internal／commands；合法 API preflight 直接回應。其餘 API／health 以重建的 request ID、environment、client IP 標頭交 `getContainer(env.API, 'api-v1')`。
4. `ApiContainer` 啟動 Linux .NET、監聽 8080，空閒 10 分鐘可休眠。環境設定由 Worker 轉入；資料不保存在容器檔案系統。
5. `Program.cs` 建立 DI／CORS，依序進入 `UseCors`、自訂錯誤／輸入 middleware、authentication、authorization 及 minimal API。自訂 middleware 設 `no-store`、校驗可信環境、讀取一次 JSON、判斷 platform／Origin 並拒 query。僅 `PUT /api/v1/me/dating-profile` 與 `PUT /api/v1/me/photos/order` 使用各自 ≤16 KiB 完整 JSON／重複鍵 validator，舊認證路由仍走純字串 `RequestPayload`。
6. 授權端點先由 `PlatformAuthentication` 驗 Access JWT，再透過 `session.validate` 查 D1 的目前帳號與 family。查驗失敗回 ProblemDetails。
7. 用例經 `IPlatformClient` POST 固定命令至 `http://platform.internal/v1/commands/...`；Containers SDK 的 outbound handler 呼叫 Worker `dispatch`，執行 prepared D1 batch 或私人 R2 操作。
8. 用例在資料提交成功後才回帳號／session；API 依 Web Cookie 或 native JSON 傳送憑證。交友資料、照片及化身全部經 PlatformAccess；0列 PUT 二次查 session 區分401／409，GET 投影排除認證秘密與 R2 key。未知 API 回 JSON404，不落入 SPA。

AvatarAndPreferences資料保存：一般有效目錄沿既有ensure／CAS流程；提交停用碼時額外核對本人目前版本及該欄既存值，不允許透過手工PUT新選停用選項。

AvatarAndPreferences 照片流程：只有 `POST /me/photos` 允許8MiB binary，.NET Skia 真解碼／方向校正／移除 metadata 後壓到200000 bytes，再由 D1 原子占位、內部 R2 create-only 寫入及 pending→ready。失敗只撤 pending；正式刪除先 D1 soft-delete＋壓緊排序，再清 R2，失敗由 GC 補償。本人 `/me/media/{id}` 經內部 `/v1/media/assets/{id}` 取得資料，R2 等待後再查 Session／資產。

AI 只有明確 POST 才執行：R2 attempt manifest 的條件寫入鎖定本人來源與單一 in-flight，.NET 每次呼叫 Gemini 一張，成功才增加 producedCount（最多4）。相同 request replay 不再呼叫 provider／扣 limiter；未知成本不自動重試。暫存60分鐘，採用指定一張後複製到私人正式 key、D1 batch 提交本人 generated asset 與 revision，關閉本輪；其餘候選到期清理。Gemini 輸入是2～5張壓縮來源及獨立的原型風格參考，不保存原始照片。

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

## 2026-11-06 化身版面與失效房間修正

CandidatePersona的圖片由前端固定3:4容器控制，Image以100%寬高及contain在框內縮放，避免免費資產的原始尺寸覆蓋版面；不變更圖片資料或生成流程。房間頁於Web回焦／原生前景重讀目前輪次；403經`/start`重驗Profile與active輪次，503保留重試，不自行認定遊戲已結束。後端交易、schema、API與配對規則不變。
