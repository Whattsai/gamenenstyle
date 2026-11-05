# SPEC-001-MatchingSessions：條件契合配對與雙方確認

**功能 ID**：SPEC-001-MatchingSessions
**關聯需求**：[MVP-001-LoveGameDatingApp](../requirements/MVP-001-LoveGameDatingApp.md)
**優先級**：高
**狀態**：SDD／實作前 RiskAudit 已確認，BDD／TDD 已補強；規劃完成並可交接 `well-done`（尚未實作）
**最後更新**：2026-11-06
**建議實作順序**：本 MVP 第 3 順位
**前置 SPEC**：`SPEC-001-PlatformFoundation`、`SPEC-001-AvatarAndPreferences`
**後續消費者**：`SPEC-001-StoryDialogueAndExit`、`SPEC-001-AffectionAndFeedback`、`SPEC-001-OnlineGamesAndQuests`、`SPEC-001-OfflineDating`、`SPEC-001-Confession`
**本輪工作邊界**：追加2026-11-06使用者確認的資料表／搜尋／邀請沿用／測試資料重建決議；更新規劃文件，不代表 D1 migration、API 或配對功能已實作。

## 1. 功能概述及需求追溯

兩名真正登入的成年使用者，以已保存的本人交友資料與偏好取得契合候選；任一方表達意願後，另一方可接受或拒絕。**只有同一對雙方都明確表示願意**，才建立可供下一份劇情規格使用的專屬雙人互動輪次（`round`）。不使用固定原型對象、模擬同意或自動聊天來冒充真實互動。

| 需求來源 | 本份責任 | 本份驗收 |
|---|---|---|
| `US-004 / AC-004-01` | 以雙方興趣、生活型態與擇偶條件篩選並計算契合度指數 | `MS-AC-001` ～ `MS-AC-005` |
| `US-004 / AC-004-02` | 配對意向、接收、雙方獨立確認、建立專屬輪次 | `MS-AC-006` ～ `MS-AC-011` |
| `US-002 / AC-002-01` ～ `03` | 初期只給有限 `CandidatePersona`；拒絕不應暴露照片、名片或私密分數 | `MS-AC-012` |
| `US-003 / AC-003-03`、`04` | 使用玩家基本資料作唯一事實來源，新增受限 match_conditions 配對投影（允許依用途複製欄位但不得讓兩邊分別維護） | `MS-AC-002` ～ `004` |
| `US-012 / AC-012-04`、`US-020` | 向下游提供本輪參與者及狀態查核契約；退出／名片同意仍由對應後續 SPEC 負責 | `MS-AC-013` |

本份不實作 ADV 劇情、對話收發、好感度／親密度、問卷、名片交換、約會、告白、真人照分享、AI 動態故事、金流或其他 SPEC 的終止邏輯。成功配對可建立**真實、持久的雙人輪次與可進入的專屬房間容器**；房間不製造假聊天訊息。完整敘事／收發與退出由 `StoryDialogueAndExit` 接續。

## 2. 現有契約與此次已確認的設計調整（2026-11-06）
1. PlatformFoundation：原六張 auth_/common_ 表、有效 Session、固定 prepared commands、D1 原子提交、零 SQL Trigger 不變。
2. AvatarAndPreferences：目前 user_profiles 18 欄及 user_media_assets 9 欄已實作。user_profiles 保留玩家自身資料（暱稱、生日、性別、名片、照片／化身引用、供本人檢視的興趣／生活資料）；match_conditions 是只供搜尋使用的受限投影，不是第二套可由玩家直接寫入的 Profile。既有欄位可為不同用途重複，但個人資料以 user_profiles 為唯一事實來源。
3. 新增 match_conditions（僅合格者有列）；match_invitations 保留；原預定 match_rounds 改為 game_rounds；原預定 match_active_round_claims 改為 game_round_participants。上述四張皆為待開發設計，舊三張 match_ 表尚未在資料庫建立，故非既存資料表的線上 rename。
4. `user_profiles` 可保存未完成個資；**只有配對資格或投影欄位實際變更時**才在同一 D1 原子操作內重算資格、UPSERT／DELETE `match_conditions`：資格成立則有且僅有一筆，未成立則無列。單純修改照片排序、非配對個資或分享設定，不更新 `match_conditions`，也不影響搜尋。**移除 `source_profile_revision` 和兩表 revision 相等檢查**；原本 user_profiles 的 `revision`／Session CAS 繼續用於個資寫入併發控制，不得拿來作配對查詢的兩表一致性條件。所有可能改變配對輸入的既有操作須走共用同步判斷，失敗時不得提交半套資料。
5. 初次完成登入後加入明確導航分流：Profile 未完成→引導 /profile；有進行中遊戲→進入原遊戲入口；已完成且無遊戲→配對探索。API 無法確認則提供重試、不能當已就緒。這是本次待實作的 UX 需求，不宣稱原登入畫面已完成。
6. 現有 IAvatarAndPreferencesReader 需真 RoundId，不得偽造 RoundId 供搜尋；新 matching reader 只讀取 match_conditions 受限配對欄位及經授權的 CandidatePersona。真人照片、Email、精確生日及私有偏好不外洩。
7. 尚未上線：不寫舊 Schema→新 Schema 的資料搬移或雙軌相容程式。此輪只完成文件；進入 well-done 才在已確認屬於 datinghigh 的指定 local／SIT 測試環境，依原本安全規範先辨識目標再清除測試資料及重建 schema／測資；不得對未確認目標、其他專案或 production 自動清空。R2 已存媒體須與 DB 清除後的一致性一併處理，不可殘留可公開存取的孤兒物件。
8. UUIDv7 首欄 PK、固定 SQL、Unix ms、無外部排程／Job／名片快照，Web＋Android 為本輪驗證，iOS 暫緩。

## 3. 領域語言與狀態
- MatchingCondition：從玩家資料於原子保存時產生的可搜尋投影；只有符合目前 profileReady、18歲、有效化身、性別／性向非空與帳號 active 的人存在投影。資料失格即移除投影，遊戲持續與否由 game_round_participants 獨立管理。無需暫停探索或額外配對開關。
- 搜尋狀態：readyformatch 表示有有效 match_conditions 且未被遊戲占用；gaming 表示有 game_round_participants。這是合成 API／畫面狀態，不把 gaming 當 match_conditions 的持久化 status，避免雙重真相。
- MatchInvitation：發起者對單一對象的明確意向；pending→accepted/declined/cancelled/expired/invalidated。72 小時期限與永久 pair 排除規則不變。
- GameRound：雙方確認後建立的雙人遊戲輪次，game_rounds.active→ended；以真正的參與者表約束同一 accountId 全平台只能進一場遊戲。與 auth_sessions 無關。
- invitation.invalidated_reason 限 other_round_started 或 eligibility_changed；後者僅用於已邀請後帳號停用、法定成年／有效化身等硬性基礎資格喪失，**單純性別、戀愛性向、配對偏好或興趣異動不得使既有 pending 自動失效**。新的候選搜尋與新發邀請用新條件；既有邀請保留原先建立時的性向互容判斷直到到期、取消、拒絕、接受或其他安全條件失效。不可讓新資料的空性向使原邀請重新以當前性向判斷失敗。

## 4. 候選資格與契合度（Q1／Q4 已確認）

### 4.1 搜尋與新邀請的資格
1. 本人與候選都必須有有效 `match_conditions` 投影，並在搜尋／發新邀請時驗證 `auth_accounts.status=active`、成年、有效正式遊戲化身及必要資料完整；不檢查 user_profiles.revision 與投影版本相等。帳號本人不列候選。未完成資料照常保存在 `user_profiles`，但沒有 `match_conditions` 列。
2. 搜尋與**新建立**邀請用目前資料檢查雙向戀愛性向：A.romanticOrientation 包含 B.gender、B.romanticOrientation 包含 A.gender。使用 gender male/female/diverse；不受名片分享設定影響。
3. 雙方 accountId 均不得存在 game_round_participants 的當前占用；任何一方 active 不得進入新候選或新邀請。
4. 依無方向的 account_low_id/account_high_id 組合，排除任一方向 declined 歷史及曾 ended 的 game_rounds；這個永久互斥只針對原 accountId pair，沒有跨新帳號真人追蹤。
5. 有效 pending 邀請須保留方向：自己發出的展示等待狀態；對方先發的保留可接受路徑，不能統統從候選差集刪除。已過期 pending 必須先用 server UTC millis 懶惰失效；cancelled、expired、invalidated 不永久封鎖。
6. 偏好年齡／地區只用於軟性分數，不當搜尋必要資格；所有合格對象先篩除／計分／全量排序，**再**分頁。只回候選識別、分數及受限邀請狀態；人物卡於畫面實際需要時查詢（可預載下一至三筆），再次驗證其安全授權。
7. 接受**已存在**的 pending 不回溯套用修改後的戀愛性向或軟性偏好，也不要求其當前仍有可搜尋 match_conditions 列；但仍必須在原子交易中確認邀請未逾期、雙方有效登入／active 帳號、成年及有效化身、沒有其他遊戲占用、沒有永久排除及雙方明確意願。不能因修改性向將原 pending 轉 eligibility_changed。遊戲成立後修改資料不自動終止 round。

### 4.2 `match-score-v1`：雙方共用的 0～100 分

**基準面向 B：興趣與生活型態（固定原始權重 65%）**

- `J(X,Y)=|X∩Y|/|X∪Y|`；若空集合或不可比較，該標籤子項取 0，不假裝有共同興趣。
- `I=0.60×J(interestTagIds)+0.20×J(topicTagIds)+0.20×J(valueTagIds)`。
- `L`：`weekendPreference`、`sleepSchedule`、`conversationStyle`、`expectedInteractionFrequency`、`relationshipMode` 五項中，只比較雙方都填的欄位，相同給 1、不同給 0；完全無共同可比較欄位時 L=0。
- `W=(sharedInterestWeightA+sharedInterestWeightB)/200`（雙方各自設定 0～100，舊資料缺值用現有預設 50）。`B=100×(W×I+(1-W)×L)`，直到總分才四捨五入。

**年齡面向 A（固定原始權重 20%）**

- 各方若設定年齡偏好，對方年齡在偏好閉區間內給 100 分；超出上下限 `d` 歲：`ageSide=max(0,100-5×d)`。例如偏好25～35歲，對方40歲→75分、45歲→50分、55歲→0分；低於下限也依相差歲數遞減。
- 雙方均設定，取兩方向平均；只有一方設定，只算該方；雙方都沒有偏好時，**本面向不啟用、不加分、不扣分**。現有合法輸入若只填上限或下限，則只計填入的一側界限；必須延用現有 profile 驗證及臺灣日期成年計算，不新增必填。

**地區面向 R（固定原始權重 15%）**

- 各方若有 `preferredRegionCodes`，在其多個偏好縣市中，取與對方已存 `regionCode` **最近**的地區。相同縣市代碼→0公里；其餘以固定版本的臺灣縣市代表座標及 Haversine 直線距離 `dKm`，`regionSide=100×exp(-dKm/150)`。例：0km→100、30km→約82、75km→約61、150km→約37、300km→約14。
- 偏好清單有設定、但對方沒填目前地區或代碼不能對映時，此方向給**中性 50 分**，不排除對方、不推測其住址。所有當前縣市代碼都須有確定版本的對照資料；不用 GPS 或精確地址。
- 雙方有偏好取兩方向平均；只有單方設定只計單方；雙方未設定，地區面向不啟用。

**動態權重與雙向對稱**

```text
ageOn = A或B至少一方設定年齡偏好
regionOn = A或B至少一方設定地區偏好
denom = 65 + (ageOn ? 20 : 0) + (regionOn ? 15 : 0)
score = clamp(round_half_up(
   (65*B + (ageOn ? 20*A : 0) + (regionOn ? 15*R : 0)) / denom
), 0, 100)
```

- 兩項都有偏好即為 **65／20／15**；都沒設定則只有基準面向佔100%；只設定單一面向則剩餘權重依 65:20 或 65:15 正規化。不讓「未設定」被當成不符合或直接得到100分。
- 分量保留完整精度，總分最後一次四捨五入；交換 A／B 順序必須得出同分。候選以分數降序、內部穩定 ID 解決同分，不洩漏他人生日、偏好年齡原值、偏好縣市、性向與個別子分數。
- 沒有共同興趣仍可按生活契合與選填偏好計分。分數不等於戀愛成功率或好感度，且不構成硬性資格門檻。

## 5. 邀請、永久排除與單場遊戲（Q2／Q3＋2026-11-06 已確認）
1. 發起新邀請時使用當下 match_conditions 與雙向相容檢核，建立 pending；接收者主動接受或反向主動按想認識才形成雙方同意。新邀請與既有待決邀請不可混用不同配對資格規則。
2. pending 保留 72 小時。伺服器時間 now>=expires_at 即無效；查詢或操作時以固定 SQL 懶惰轉 expired，不靠 Cron。取消及過期不是永久拒絕。
3. **已有邀請後修改性別／性向／興趣／擇偶偏好**：不撤銷、不重算該邀請原本的雙向性向相容資格，不添加偏好快照；新探索／新邀請立刻使用更新後的條件。帳號停用、成年／有效化身等硬性資格失去或同時開始其他遊戲則仍按安全失效規則處理。
4. 接受時必須同一原子交易：確認 invite pending／未過期與原 pair、登入有效／account active／成年／有效化身／沒有占用／無永久排除，將邀請 accepted，建立一筆 game_rounds.active，插入雙方各一筆 game_round_participants，並將兩人其他全部 incoming/outgoing pending 轉 invalidated=other_round_started；任何一步失敗整批不成立。D1 UPDATE 0 changes **不會自動 SQL 回滾**，必須由可驗證的 fail-closed guard／約束使整筆失敗，真 Miniflare D1 驗證。
5. game_round_participants.account_id UNIQUE 是同一玩家只能有一場 active 的 DB 最終保護；match_conditions 可繼續保存符合資格者，即使其正在遊戲中，搜尋由 participants 排除，避免維護 readyformatch/gaming 兩份同步狀態。
6. 遊戲結束時 game_rounds.active→ended 並原子刪除恰好兩位參與者占用；曾 ended 的原 pair 永久雙向排除。若玩家修改資料變不合格，結束後不能被探索，直到重新符合條件；遊戲本身不因 Profile 異動提前結束。
7. 明確 declined 永久排除該 accountId pair；原帳號換裝置／修改資料不解除；不跨刪帳後的新 accountId 辨識真人。冪等 clientRequestId、反向 pending、撤銷 Session、任意 ID 探測及錯誤回查維持原有驗證要求。

## 6. DDD、分層與資料結構
### 6.1 模組責任
| 層 | 責任 |
|---|---|
| Domain | MatchingCondition 搜尋資格／雙向契合度、MatchInvitation 狀態機、GameRound／GameRoundParticipant 唯一占用、無方向 PairKey；score 不等於好感度 |
| Application | MatchingSessionService 組合受限查詢、全量計分後分頁、按需人物卡、邀請與遊戲；個人資料保存時由 AvatarAndPreferences 產出同步投影，不讓兩表自行競爭修改 |
| Infrastructure | IMatchingCandidateProfileReader 只讀受限投影；IPlatformClient + 既有固定 Worker/D1 指令。不得用不存在的 RoundId 偽造舊 reader 授權 |
| API／Expo | 候選排序清單與 GET 單筆安全人物卡、登入後依 Profile／遊戲狀態導航、預載下一至三張；邀請／遊戲共用 Web＋Android |

### 6.2 四張 D1 業務表（規劃，尚未建立）
**match_conditions**：合格 Profile 的原子衍生投影；一個帳號至多一筆，未合格則無列，無人工開關、無獨立可編輯 UI。
| 欄位 | 約束／用途 |
|---|---|
| condition_id | TEXT PK，UUIDv7 首欄 |
| account_id | TEXT NOT NULL UNIQUE FK auth_accounts；與 user_profiles.account_id 一對一 |
| gender、romantic_orientation_json | 當次搜尋所需的性別及性向，嚴格值域／JSON；源於 user_profiles |
| birth_date、region_code | 日期文字／可空縣市；年齡按臺灣日期重新判定、地區只計分 |
| interests_json、preferences_json | 受控白名單 JSON 投影供計分；不得直接提供給候選前端 |
| created_at、updated_at | Unix ms，追蹤投影建立與變更 |
不另存 gaming status；API 的 readyformatch/gaming 由有效條件列與參與者占用共同推導。Profile 的暱稱／自介／職業／名片資料仍在 user_profiles；真人照與 AI 正式資產仍在 user_media_assets。**同步觸發依配對欄位及資格實際差異判斷，不依 `user_profiles.revision` 是否增加**。受影響欄位包含暱稱有效性、生日／成年、性別、戀愛性向、正式化身是否有效、地區、興趣與生活／擇偶偏好；性別與化身不相容或媒體正式資產失效也須重新判斷。不相關的本人照片排序／編輯、名片可見設定、工作、自介等變更不操作此表。需同步時和來源變更在同一 D1 原子提交；同步失敗時禁止半套資料落地。搜尋仍驗帳號 active、成年及正式化身等硬條件，不把投影列視為永久授權。

**match_invitations**：保留原設計欄位 invitation_id PK、account_low_id/account_high_id（按 BINARY 固定排序且不同，FK 帳號）、initiator_account_id、client_request_id、status（pending/accepted/declined/cancelled/expired/invalidated）、invalidated_reason（僅 invalidated 時為 other_round_started/eligibility_changed）、created_at/expires_at/updated_at、responded_at。UNIQUE(initiator_account_id,client_request_id)；UNIQUE(pair) WHERE status=pending；本人清單、pair/status、到期與成員索引。pending 建立時已核對雙向性向；既有邀請不存性向快照、不受後續性向改動追溯影響。永久 declined 歷史保留。

**game_rounds**：原規劃 match_rounds 正式改名為 game_rounds（不是線上 rename）。欄位 round_id PK、invitation_id UNIQUE FK、account_low_id/account_high_id FK、status(active/ended)、started_at、ended_at；保留 ended 歷史。只有參與者才能讀取 active 遊戲；後續 StoryDialogueAndExit、AffectionAndFeedback 等消費本表。

**game_round_participants**：原規劃 match_active_round_claims 換成獨立遊戲參與者占用表，而不是把占用塞入 match_conditions。欄位 participant_id TEXT PK UUIDv7（首欄）、account_id TEXT NOT NULL UNIQUE FK auth_accounts、round_id TEXT NOT NULL FK game_rounds、created_at INTEGER NOT NULL；round_id 索引。每個 active round 必須正好兩位 pair 成員，接受時同批建立，結束時同批釋放；遊戲終止歷史只留 game_rounds。

### 6.3 固定 D1 命令／資料同步與原子邊界
- 共用配對投影同步判斷：在既有 `profile.update`、正式化身選用／刪除等**可能改變配對資格或條件**的固定命令內，比較變更前後的配對相關有效值／資格；有實質差異才於同一 D1 原子操作 UPSERT／DELETE `match_conditions`。純照片排序、照片新增／刪除（未影響目前正式化身）、工作／自介、名片分享設定等與配對無關的變更，不更新條件表；即使 `user_profiles.revision` 增加也不影響候選資格。不得從前端直接寫條件表，也不得先提交個資、再另發 HTTP 同步；新增會影響配對的資料寫入入口必須沿用這個共用規則。
- match.candidate.search：候選先從 match_conditions 與 auth_accounts／user_profiles 有效條件縮小範圍，驗雙向性向，NOT EXISTS 查 participants、declined invitations、ended game_rounds；對 pending 只註記 incoming/outgoing 有效狀態，並不一律剔除。計分使用完整必要投影，分數全量排序／同分穩定後才分頁；查詢後不承諾跨頁快照。
- match.candidate.persona.read：使用登入者＋candidateId（user_profiles.profile_id）重驗本人與對方基本授權、占用、排除及目前可見狀態，只投影有限暱稱／簡介／遊戲化身／允許興趣，不能回私人配對欄位、生日、真照片／R2 key。
- match.invite.create：使用當次最新 match_conditions、active occupancy、pair 永久互斥及有效 pending；反向 pending 只有另一方按『想認識』才視為接受。
- match.invite.resolve：既有 pending 接受不重做性向／偏好檢核，但重新驗帳號／成年／化身／Session／單場占用／永久互斥／期限。transaction 同時 accepted+game_round+雙方 game_round_participants+全部其他 pending invalidated；0 changes 須用真 SQL fail-closed guard 使 rollback，不可把批次結束後應用層檢查當成回滾。
- game.round.list/get/end：本人有效輪次驗權；end 同批 active→ended 並釋放兩筆 participants，重複結束不可讓同一 pair 再成立；端點本份只提供 get/list，真正終止 UI 仍屬後續 Story SPEC。
- 資料清除：未上線，只對指定本地／明確授權的非正式測試 DB 作可重現 wipe/recreate（含參照與私有媒體清理策略），絕不製作舊新 Schema ETL/資料轉換、不碰未確認的環境；本次規格調整不立即操作資料庫。

## 7. 對外 API（全部需有效 Session，結果 no-store）
所有路徑相對 /api/v1；變更 POST 嚴格 JSON、不得接受前端 score／account owner／SQL；狀態與所有欄位由後端授權投影生成。
| 方法／路徑 | 資料及回應 |
|---|---|
| POST /match-candidates/search | {offset:0,limit:20}，回 items:[{candidateId,score,invitationState?}]、nextOffset。全合格集合計分排序後分頁；不在清單中回整張 persona |
| GET /match-candidates/{candidateId} | 依使用者真正要看的候選單筆重驗可見性；回安全 CandidatePersona、candidateId、當次 score／invitationState；不能越權讀私有欄位 |
| POST /match-invitations | {candidateId,clientRequestId}；新邀請需要最新雙向相容／資格；201 pending，對方既有反向 pending 且本人主動確認可 200 accepted + roundId |
| GET /match-invitations | incoming/outgoing；候選資料只回安全摘要與失效原因 enum |
| POST /match-invitations/{id}/accept | {}；有效既有邀請可 200 accepted + roundId；不因邀請後性向／偏好編輯失效，仍檢核安全硬條件 |
| POST /match-invitations/{id}/decline | {}；200 declined、永久 pair 排除 |
| POST /match-invitations/{id}/cancel | {}；200 cancelled、不永久排除 |
| GET /game-rounds | 本人目前至多一個 active game_rounds 與安全參與者資料 |
| GET /game-rounds/{roundId} | 本人參與且 active 的單一遊戲容器，須驗真正雙人參與權限 |
新錯誤需含過期 410、Session 401、私人資料 403、profile not ready/active/pair excluded 409、限流429及依賴503；不把 0 changes 誤回成功。無法確認結果先唯讀 GET 回查。候選清單用 profile_id 作 candidateId 而非帳號 ID；單筆請求須再驗授權。九個對外端點，不宣稱已實作。

## 8. UI 操作、授權及跨 SPEC 交接
1. 新註冊／登入完成，GET /me/dating-profile＋GET /game-rounds；Profile 未 ready→/profile 引導必填，已在遊戲→目前 round，ready 且空閒→探索。帳號／API 無法確定時展示重試，不自行當 ready。登入及 Profile 原功能本次需回歸。
2. 探索頁先呼叫 POST /match-candidates/search 取得排序 ID、分數及 pending 方向；依使用者滑動到的對象再 GET /match-candidates/{candidateId} 取安全人物卡，可預載接續一至三筆，避免全量人物資料在搜尋首屏傳輸與 N+1 阻塞。清單或按需取得時對方狀態已變，展示『目前無法配對，請重新搜尋』而非成功。
3. 即使原 pair 已有 pending，incoming 仍保留回覆入口；outgoing 顯示等待而不可重複新送。排序以全部適格候選先計分再分頁，不能先分頁後計分。
4. 邀請 pending 72 小時，到期時由伺服器懶惰失效，未來仍可相遇；婉拒前顯示永久排除提示；取消與到期不是婉拒。
5. 配對成立時雙方進入相同 game_rounds.round_id，其他 pending invalidated（other_round_started），本人同時僅能有一場；已有遊戲時配對入口導回該遊戲。
6. 玩家在邀請之後改性向／偏好，原 pending 不被撤回或重算，可在期限內依原發邀資格接受；新的探索／邀請用最新值。若真的失去有效帳號／成年／化身等硬性資格，邀請依 eligibility_changed 安全失效，不透漏具體資料。
7. 本次不做暫停探索或配對開關；符合最新 Profile 條件且非遊戲中就自動可探索。未來遊戲終止、名片互相同意／真人照公開仍交由 StoryDialogueAndExit／AffectionAndFeedback；候選或配對成功絕不直接開放真人照片。
8. Web／Android 真驗證，不以 prototype 的假候選替代真 API；iOS 與無障礙專項維持既定延後範圍。

## 9. 安全、效能及故障策略
1. `match_conditions` 只在 Profile 完整就緒時存在；**沒有 source_profile_revision 或與 user_profiles.revision 相等的條件**。只有配對輸入／資格發生實質變更才同步建立、更新、刪除；同步失敗不可半套提交。個資無關異動即使 revision 增加，既有條件列與被探索資格仍保持原狀。完整 match_conditions 永不對前端公開，CandidatePersona 僅經授權的 GET 讀取。
2. **只有影響配對資格／條件的更新**，才需要和 `match_conditions` 投影同一 D1 原子操作；若變更使 Profile 失格則移除投影，不影響既有 active 遊戲／participation。無關 Profile 異動保持既有條件列不動；已存在 pending 不因性向／偏好調整撤銷。
3. 保留 login family、Web Origin、Android Bearer、DTO whitelist、與原有共用限流（搜尋每帳號每分鐘30次、邀請每小時10次）。candidateId/roundId 不得當作授權，不能回傳私有性向、年齡偏好、Email、精確生日、真照片、R2 私有 key。
4. WHERE status=pending 且 serverNow>=expires_at 即已無效，單筆更新與新邀請在 D1 中必須先釋放過期 partial unique；邊界、反向 pending、幂等和失效原因均要測試。
5. 實際搜尋須確認從 match_conditions 初篩後，NOT EXISTS 對歷史 declined／ended、participants，占用依 accountId UNIQUE 強制；已存在 pending 分方向回報不一律刪除。配對分數對全體合格者排序後才 offset/limit；重算可能跨頁變化，要求穩定同分鍵與效能實測。
6. 接受及結束真 SQL 交易必須防 0 changes 部分提交、索引／FK／UNIQUE 衝突與跨 pair 競態；真 Miniflare D1＋故障注入提供證據，HTTP mock 不算原子回滾證據。
7. 未上線的測試 DB 不建立 ETL／線上雙寫相容；實作時才在指定、確認目標的非正式環境清除重建並重新建立測試帳號。私人 R2 需明確清理其相關測試物件；本次文件變更不執行任何資料刪除。
8. 任何尚未驗證的 Worker／D1 成本、全量排名效能、真 Android UI、舊 OAuth／個人資料與名片回歸均不得標示已通過。

## 10. 可測試驗收條件與規劃測試策略

| ID | 必須滿足的行為 | 來源 |
|---|---|---|
| `MS-AC-001` | 真雙人資料產生同一可重現 0～100 契合度，基準／年齡／地區有 65／20／15 的明確影響 | AC-004-01 |
| `MS-AC-002` | 雙方成年、profileReady、有效、性別／性向雙向相容才可探索；cardVisibility 不影響內部計算 | AC-003-04／D-053 |
| `MS-AC-003` | 偏好年齡與地區選填、不硬排；年齡超出每歲扣5；地區最短距離按 `exp(-d/150)` 單調遞減 | AC-003-03／AC-004-01 |
| `MS-AC-004` | 單／雙方缺偏好正規化、地區未知50分、權重0／50／100、空標籤、臺灣生日、分數對稱性與最後四捨五入 | AC-004-01 |
| `MS-AC-005` | profileReady時原子建立match_conditions合格投影；清單只回ID／分數／邀請方向，人物卡按需GET安全CandidatePersona；不洩漏真照片、Email、生日、性向及偏好 | AC-002-01～03／Q4 |
| `MS-AC-006` | 單方邀請 pending 不可進遊戲；72小時過期或自己取消後未來仍可再次配對 | AC-004-02／Q2 |
| `MS-AC-007` | 接收者明確同意才原子建立一筆game_rounds.active及兩筆game_round_participants；兩端相同roundId | AC-004-02 |
| `MS-AC-008` | 被明確拒絕後此 `accountId` pair 永久雙向互斥；`expired/cancelled/invalidated` 不永久排除，新帳號不得跨身分追蹤原真人 | Q2／RQ-01／AC-004-02 |
| `MS-AC-009` | 一人至多一場active，其他pending同批失效；性向／偏好改動不撤銷既有pending，只有帳號／成年／化身等硬性資格喪失才可標eligibility_changed | Q3／RQ-02 |
| `MS-AC-010` | 遊戲結束時game_rounds.ended與雙方game_round_participants解除占用同批原子；原pair永久互斥，只有Profile合格才可與其他人配對 | Q2／Q3 |
| `MS-AC-011` | 同對反向發起、同 requestId 重送及不同 pair 共用一人同時接受，都不能產生兩場 active 或假成功 | AC-004-02 |
| `MS-AC-012` | 撤銷 Session、停用帳號、猜測ID／非成員、新發邀使用過期配對輸入均安全拒絕；既有 pending 不因後續性向／偏好改動被拒；配對相關更新與投影不可部分提交，無關個資變更不得讓候選失格 | AC-004-02 |
| `MS-AC-013` | 回覆未知後只以真 DB 回查，重新登入仍看到真邀請／round 狀態 | AC-004-02 |
| `MS-AC-014` | 配對成功不解鎖名片／原照；只有本人且 active round 才可進行後續互動，ended 不得繼續 | AC-002-03／US-020 |

**Unit**：雙向性向／成年、年齡上下限差距及生日切日、縣市代碼對應／最近距離／指數單調、未知地區50、偏好有／無及單／雙邊、權重正規化、Jaccard／L、總分四捨五入與對稱性、永久互斥、邀請狀態機。
**Integration（真 Miniflare D1）**：四表 fresh schema，配對資格變更才與 match_conditions 原子建立／更新／移除；無關照片排序或個資變更不觸發投影同步，即使 Profile revision 增加也不得被排除；game_round_participants.account_id UNIQUE、接受＋兩人占用＋其他pending失效與結束＋兩人釋放原子交易，以真D1測0changes、併發、資料失效及rollback。HTTP fixture 不算 SQL 證據。
**API／Security**：所有端點與登入、嚴格 JSON、猜測 ID、409／410／429／503、Origin、no-store、無私有欄位、回覆冪等／雙方明確同意。
**Web／Android E2E**：至少三個真隔離帳號；邀請、接受、拒絕、撤回／到期，正在遊戲雙方從第三人名單消失，第三人 pending 顯示安全的其他遊戲失效提示，性向／資格變更則顯示不同提示；結束後可與第三人配而不可與舊 `accountId` pair 再配，重登恢復。iOS 暫緩、無障礙專項排除；無雲端證據不記 production 通過。

## 11. SDD 使用者決策（均已確認：2026-11-05）

| 決策 | 已確認業務規則 |
|---|---|
| `MS-Q1` | 年齡、地區偏好仍選填；不作硬性篩選，改按興趣生活65%、年齡20%、地區15%加權；偏離年齡每歲扣5分、地區按概略距離指數下降；按雙方偏好計算，未設定面向重新分配權重 |
| `MS-Q2` | 邀請72小時未回覆自動過期；**明確婉拒或同對遊戲結束後永遠不再配對**。自己撤回、未回覆逾期、因別場遊戲而失效不永久排除 |
| `MS-Q3` | 每人同時只能進行一場遊戲；pending 時仍可在候選中；遊戲成立時雙方離開其他候選並使全部其他 pending 失效；遊戲結束才能與其他人重新配對 |
| `MS-Q4` | Profile 合格會原子產生 match_conditions 搜尋投影；無額外暫停探索開關，候選只顯示非遊戲中且符合雙向相容及永久排除條件者 |

### 實作前 RiskAudit 決策（2026-11-05，均採建議 A）

- **RQ-01=A**：拒絕或結束的永久互斥只針對原本兩個 `accountId` 構成的 pair。更換登入裝置或更新個人資料不解除；刪除帳號後以新身分重新註冊，不進行跨帳號本人識別或追蹤，避免超出本 MVP 個資範圍。
- **RQ-02=A**：邀請 `invalidated` 保存 `invalidated_reason`，限 `other_round_started`／`eligibility_changed`；依原因顯示安全、不同的提示，絕不顯示對方的新配對對象或具體性向／個資變更。

計分的距離常數與缺失值處理沿用已確認的 Q1；所有技術風險緩解及新增測試詳見本份 RiskAudit 與 TDD 交接，沒有額外待產品決策。

### 2026-11-06 新確認的設計決議（取代本份舊表名與舊邀請重驗描述）
- `MS-D-060`：資料表拆分成 match_conditions／match_invitations／game_rounds／game_round_participants。user_profiles 是玩家資料的唯一來源，match_conditions 僅 ready 時建立；只在配對輸入／資格異動時同一 D1 原子維護，不另存版本欄位；遊戲狀態由 participants 計算，不在 conditions 保存 gaming。
- `MS-D-061`：無暫停探索；既有邀請不受後續性向／偏好改動撤銷或重新校驗，新的探索／邀請使用最新值；仍驗有效帳號／成年／化身／占用／期限。
- `MS-D-062`：無上線資料遷移；只有指定非正式環境清除測試資料並重建 schema／測資的實作步驟，含私人媒體一致性，不在本次規劃階段執行。
- `MS-D-063`：按需安全人物卡查詢，先在全部合格集合計分排序後分頁，再逐筆讀取並預載下一至三筆。登入後依 Profile 和進行中的遊戲導航，本次新增前端 UX 驗收。
- `MS-D-064`（2026-11-06）：依使用者確認移除 `match_conditions.source_profile_revision` 與兩表版本相等檢查。只有配對必要資格／配對評分欄位實際變更時才同交易增修刪 `match_conditions`；無關照片排序、分享設定等不觸發同步，即使 user_profiles.revision 增加也仍正常可配對。原 user_profiles.revision 留作 Profile 自身 CAS，不移除。

## 12. 文件追溯、現況與交接

- 需求：[MVP-001](../requirements/MVP-001-LoveGameDatingApp.md)；依賴：[PlatformFoundation SPEC](SPEC-001-PlatformFoundation.md)、[AvatarAndPreferences SPEC](SPEC-001-AvatarAndPreferences.md)。
- BDD：`docs/bdd/SPEC-001-MatchingSessions-BDD.md`（已生成；尚未實作驗收）。
- TDD：`docs/tdd/SPEC-001-MatchingSessions-TDD.md`（已生成；尚未實作驗收）。
- RiskAudit：`docs/specs/SPEC-001-MatchingSessions-RiskAudit.md`（Q1～Q4、RQ-01=A／RQ-02=A及2026-11-06新決策；20項風險已記錄）。
- BDD／TDD 已同步75場景／174項待實作測試（原150＋先前22＋本次2）；規劃Ready for well-done只表示可以開始實作，不是功能完成或通過測試。
- 本次僅規劃新的模組，不改現行 API、D1、畫面或 overview 的**現況**。待開始實作時，須同步 `overview/01-architecture/04-module-map.md`、`overview/03-contracts/01-api-contracts.md`、`02-data-contracts.md` 與受影響的其他 overview；不得將本 SDD 提案冒充已上線契約。
