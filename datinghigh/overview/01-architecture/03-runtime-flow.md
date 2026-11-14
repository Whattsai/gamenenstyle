# 啟動與執行流程

## 平台與 HTTP

1. `tools/local.mjs dev` 在 Windows 使用 Ubuntu WSL 的隔離 Node／Wrangler，載入已知 instance 設定與 state；秘密只補缺，重啟沿用。
2. Wrangler 載入 `cloudflare/src/index.ts`，Expo single SPA 由 ASSETS 供應；API、health、internal 與故事素材依固定路由優先經 Worker。
3. Worker 拒絕公開 internal／commands，直接回合法 API preflight；API／health 以重建的 request ID、environment、client IP 標頭交 `getContainer(env.API, 'api-v1')`。
4. ApiContainer 啟動 Linux .NET、監聽8080，空閒10分鐘可休眠；環境由 Worker 傳入，資料不保存在容器檔案系統。
5. `Program.cs` 依序執行 CORS、自訂錯誤／輸入 middleware、authentication、authorization 與 minimal API。輸入 parser 依認證、個資、配對、劇情用途限制欄位、型別、大小與重複鍵；設定 no-store 並拒非法 Origin／query。
6. PlatformAccess 先驗 Access JWT，再以 `session.validate` 查目前帳號與 family；查驗失敗回 ProblemDetails。
7. 用例以固定 `platform.internal` 命令經 outbound handler 呼叫 Worker，執行 prepared D1 batch 或 R2 操作。
8. 資料提交成功後才回結果與憑證；未知 API 回 JSON404，不落入 SPA。容器連線故障回503／504，合法 Web Origin 保留 CORS。

`/health/live` 只表示程序存活；ready 核對設定、migration／schema／索引與 R2 probe，詳 [資料契約](../03-contracts/02-data-contracts.md)。

## 登入恢復與導覽

Expo Router 掛載 SafeAreaProvider、SessionProvider 與 Stack。SessionProvider 建立共用 ApiClient／FlowStore，先處理 pending revoke 再恢復 session；native 從 SecureStore refresh，Web 使用 HttpOnly Cookie。

ApiClient 共用單一進行中的 refresh Promise。native 先保存 refresh 再接受狀態；Web 比對 session 標頭，前景／focus／pageshow／visibilitychange 重驗。登出先隱藏私人畫面，再確認伺服器撤銷；重試不撤較新的 family。

`/start` 讀本人 Profile 與目前遊戲，優先回原房間，其次依 profileReady 分流；查詢失敗保留重試。房間回前景重讀授權，403 經 `/start` 重驗，503 不自行認定已結束。

Google Web 由 GIS popup、native 由 SDK 取得 proof；proof 僅在 RAM 傳至 .NET。Worker 取固定 JWKS，.NET 驗簽；缺公開 client 設定時入口不可用。

## 個資與照片

表單與名片共用 profile-catalog.fields。草稿依有效預設比較語意差異；名片預覽先儲存修改，再 GET 最新資料後導覽，每次 focus 讀伺服器過濾投影，不從草稿拼接。照片／化身操作保留未存欄位並檢查 revision 衝突；成功變更或重讀使舊名片投影失效。

只有 `POST /me/photos` 接收最多8MiB binary。Skia 真解碼、校正方向、移除 metadata 並壓至200000 bytes，D1 原子占位後 R2 create-only 寫入，再 pending→ready。失敗只撤 pending；刪除先 soft-delete／壓緊排序，再清 R2，GC 補償未完成清理。binary read 在 I/O 後重驗 Session／資產。

## 候選、五表情與採用

明確 POST 才呼叫 Gemini。R2 attempt manifest CAS 鎖定來源與單一 in-flight，每次只產一張，最多4張；相同 request replay 不重呼 provider／扣額度，未知成本不自動重試。輸入為本人壓縮照片與獨立風格參考，不保存原始照片。

個資畫面 GET 本人表情進度，明確採用後 begin，僅 navigation focus 且 AppState active 時依序 next。背景／離頁使舊迴圈失效；已送出單張可完成，不續送下一張或正式採用。返回只讀狀態，須本人按繼續。五張驗證完成並發布 immutable ready 後，才以 PUT selection 提交正式資產與 Profile revision。

取消先 D1 revision fence，再釋放 R2 lock；已提交資產以 receipt 恢復，不因回覆遺失刪圖、重產或重複增加 revision。候選暫存60分鐘，正式 ready 資產不隨候選到期清除。

## 配對與房間

探索取得完整適格集合，由 Application 計分排序後分頁；列表只回安全資料，畫面按需讀人物卡並預載其後最多三張。個資命令只在配對輸入／資格改變時同步 conditions。

邀請由伺服器時間懶惰到期，不靠背景 job。接受邀請先驗 R2 分層內容，再在同一 D1 batch 提交 accepted、round、兩筆 claims、其他 pending 失效及1～3個可玩 Category ID。N1 同批決議類別、Scene、Narrative，建立第一場 Session／SceneVisit；N2/3 等待兩位真人最新票，異票採原邀請者。mutation 未知結果先查 receipt，不重讀 R2 或重擲已提交選擇。

## 劇情、即時事件與演出

App 先讀受保護 experience，再取得30秒一次性 realtime-ticket，以子協定連每房獨立 GameRoomSocket。DO 將固定命令轉送 Container 私有 `/internal/round-command`，共用 Application；D1 成功後才 ACK／通知。重連依 snapshot／cursor 補漏，保留原 request ID 查回結果。

入口、恢復、事件讀取、票券及遊戲命令先驗本人當前採用化身的 ready 五表情。生成者重驗本人所有／未刪除／ready、R2 清單及五個物件；只驗目前採用者。未就緒清除私人畫面並引導個人檔案，end 與 ended 安全狀態仍可用。`avatar.updated` 同時刷新入口權威狀態與對方套組。若事件 cursor 比 snapshot 新，須再讀 snapshot 追上後才完成同步及清除 pending。

SceneEventFrameworkService 組合已驗 SHA 的四層內容；Domain 以已提交事實、能力、條件及 repeatGroup 裁定候選，Worker 以 Session／EventInstance revision CAS 原子啟動或推進。隨機未觸發也保存取消裁定與安全 cursor 更新，重整不重擲；未觸發內容、條件、私人 key 不投影給 client。R2 等待前後重新驗 family 與 Round 成員。

抵達 Ending 同批完成 Session、取消未完支線及關閉 SceneVisit，Round 仍 active 並可聊天。兩位真人對同一最新 completed episode 的最後同意皆有效，才同批以最新已儲存興趣凍結下一場候選；無可玩內容回 NO_PLAYABLE_STORY，不留空場。換 Session 重設逐字、鏡位、Modal 與事件演出，保留同 Round 聊天、草稿與對方角色。

初載、回前景、重連與 `avatar.updated` 讀對方套組；五圖保持掛載，完整解碼且句尾才換套。授權移除或 ended 使在途回應失效。StoryStage 共用鏡頭矩陣呈現背景、角色、前景及熱區；聊天室與敘事使用各自捲動區。

End 同批釋放兩筆 claims、取消未完互動／事件並關閉 SceneVisit；通知後清空私人畫面，只保留安全 ended 狀態。公開 `/story-content/assets/<sha256>` 由 STORY_CONTENT 供應，不能導向私人 FILES。

## 背景與本機服務

Worker 每小時分批清理，單批最多1000筆、預算20秒，backlog 留待後續排程；不使用常駐帳號 worker 或 queue。本機 `serve-web.mjs` 在 loopback8081 提供匯出檔與無副檔名 SPA fallback，與 Worker 的 ASSETS 路由分開。
