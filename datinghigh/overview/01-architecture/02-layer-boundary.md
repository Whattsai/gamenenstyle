# 分層與信任邊界

## 後端

| 層 | 責任 | 邊界 |
|---|---|---|
| Domain | 認證／資料／配對／劇情純規則、ID、期限、DomainException | 不引用 HTTP、Cloudflare、UI 或資料庫套件 |
| Application | 認證、個資、媒體、配對、劇情用例與 adapter 契約 | 不拼 SQL、不寫 Cookie、不直接呼叫平台 SDK |
| Infrastructure | 密碼學、JWT／Google 驗簽、sender、固定 outbound client、Skia／Gemini adapter | 實作 Application 介面，不公開任意 SQL 或物件 key |
| Api | DI、嚴格 JSON、platform／Origin、Cookie／Bearer、授權、ProblemDetails | 將輸入交用例，不取代 Domain 規則或 D1 原子條件 |

專案參考鏈為 `Api -> Infrastructure -> Application -> Domain`；API 可透過傳遞參考使用內層型別。DI 與套件見 [相依地圖](05-dependency-map.md)。

## Cloudflare 與資料權威

- `router.ts` 負責 ingress、可信標頭、preflight 與 API／assets 路由；外部 `X-DatingHigh-Internal-*` 先移除再建。
- `ApiContainer` 管容器生命週期與路由，不保存帳號或 Session 狀態。
- `platform.ts` 僅由容器的 `platform.internal` outbound handler 存取，處理 ready、固定命令、寄信、Google JWKS 與私人 R2。
- `commands.ts`、`matching-commands.ts`、`story-commands.ts`、`scene-event-commands.ts` 使用嚴格輸入、固定 prepared SQL 與 D1 batch；不接受呼叫者 SQL。場景內容 adapter 驗四層 R2 版本／SHA，Domain 編譯受控 DSL，Application 協調事件與安全投影，前端只呈現已觸發結果。
- `GameRoomSocket` 負責 WebSocket、短效 ticket、連線、presence 與安全通知；不自行決定選場或劇情節點。
- 公開 `/internal`、其子路徑與 `/v1/commands/*` 拒絕存取；bridge 不能改成公開管理入口。

## 個資、配對與授權

`contracts/profile-fields.json` 是共用欄位／顯示契約，Domain 嵌入靜態資源，Worker 據此核對分享鍵；Application 逐欄驗輸入並使用固定命令，SQL 不從 storage mapping 動態產生。前端透過 API 取定義，不直接讀 D1。

`MatchingScore` 只處理純計分與成年／性向規則；`MatchingSessionService` 組合受限輸入、排序、分頁及安全投影。Infrastructure 的候選 reader 只能呼叫固定候選指令，不偽造舊 reader 的 RoundId。

來源個資與配對投影在同 batch 更新，前讀受 Profile revision CAS 保護；不新增跨表 marker 或相等版本條件。接受舊 pending 不回溯性向，其他資格依 SPEC 驗證。`game_active_round_claims.account_id` UNIQUE 是單場占用的最終保護。

`ProfileProjections` 只處理欄位白名單，不授權；`ICurrentCardAuthorization` 預設拒絕跨帳號名片。名片顯示元件不擁有授權或載入責任。

## 化身與媒體

Application 的 `Media/` 定義壓縮、provider 與媒體儲存介面；Infrastructure 使用 Skia 與固定 Gemini endpoint。Domain 不引用圖片套件。`AvatarExpressionService` 每次協調一種表情，provider 與 binary I/O 由 adapter 處理。

R2 adoption CAS／ready Manifest 管套組完整性，D1 Profile revision 與條件交易管正式選用；取消以既有 revision fence 阻止晚到提交。`AvatarReadService` 經 `IAvatarReadStore` 讀固定內部 binary URL；Worker `round-avatar.ts` 保有 Session、Round、claims 與目前選角權威，物件讀取後重新驗證授權。

`StoryPresentationPolicy` 是無 I/O 的內容規則。免費角色只有 public 目錄的一份正式 WebP；前端靜態匯入與 Worker ASSETS 讀取共用來源。

## 劇情與前端

`StoryGraphPolicy`、推薦與文字政策屬 Domain；HTTP 與 WebSocket 共用 `StoryDialogueService`，依釘選 manifest 計算轉移。`IRoundRealtimeNotifier` 不含 Cloudflare 型別；adapter 只發送提交成功後的安全提示。

`app/` 組合畫面與導覽；`src/api.ts` 統一 HTTP、refresh 與未知結果復原；`session.tsx` 管應用狀態，`storage*.ts`／`flow.ts` 限制持久化欄位，Google 平台元件隔離 SDK。頁面不得自行持久化平台 token、採信 client 自報身分，或繞過 ApiClient 重送 mutation。

## 測試與文件

模組單元測試留在模組，根 `tests/` 保留跨系統與平台測試。HTTP fixture 只證明 HTTP；D1 條件、UNIQUE、FK、rollback 必須有真 Miniflare D1 證據，受控 sender／SDK 不證明實際收件或真 Google。

`overview/` 描述現行結構、契約與維護方式，禁止以需求流水帳維護；需求、進度與驗收權威放 `docs/` 對應文件。`prototypes/` 僅供原型／視覺參考。
